-- MEMORYVERSE schema for Supabase (PostgreSQL)
-- Run this once in Supabase SQL Editor. Review policies before production use.

create extension if not exists pgcrypto;

-- Profiles are created automatically for Auth users. Only curator role can manage archive content.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Member' check (char_length(display_name) between 1 and 60),
  role text not null default 'member' check (role in ('member','curator')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data->>'display_name',''), split_part(coalesce(new.email,'Member'),'@',1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_memoryverse on auth.users;
create trigger on_auth_user_created_memoryverse
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_curator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'curator'
  );
$$;

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 100),
  description text not null default '' check (char_length(description) <= 500),
  space text not null check (space in ('everyday','chaos','milestones','people','details','yearbook')),
  layout_type text not null default 'film-strip' check (layout_type in ('film-strip','case-files','exhibition','portrait-wall','scrapbook')),
  cover_image_path text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  caption text check (caption is null or char_length(caption) <= 1200),
  taken_at date,
  storage_path text not null unique,
  thumbnail_path text,
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  sha256 text check (sha256 is null or sha256 ~ '^[a-f0-9]{64}$'),
  is_published boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists photos_sha256_unique on public.photos(sha256) where sha256 is not null;
create index if not exists photos_published_taken_idx on public.photos(is_published, taken_at desc);

create table if not exists public.photo_collections (
  photo_id uuid not null references public.photos(id) on delete cascade,
  collection_id uuid not null references public.collections(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (photo_id, collection_id)
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 40),
  created_at timestamptz not null default now()
);

create table if not exists public.photo_tags (
  photo_id uuid not null references public.photos(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (photo_id, tag_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references public.photos(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  author_name text not null check (char_length(author_name) between 2 and 40),
  body text not null check (char_length(body) between 2 and 600),
  is_hidden boolean not null default false,
  ip_hash text,
  created_at timestamptz not null default now(),
  constraint comments_no_self_parent check (parent_id is null or parent_id <> id)
);
create index if not exists comments_photo_created_idx on public.comments(photo_id, created_at asc);
create index if not exists comments_ip_created_idx on public.comments(ip_hash, created_at desc);

create table if not exists public.yearbook_picks (
  photo_id uuid primary key references public.photos(id) on delete cascade,
  pick_type text not null default 'candidate' check (pick_type in ('favorite','essential','candidate','final')),
  sort_order integer not null default 0,
  note text check (note is null or char_length(note) <= 300),
  created_at timestamptz not null default now()
);

-- updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists collections_set_updated_at on public.collections;
create trigger collections_set_updated_at before update on public.collections for each row execute procedure public.set_updated_at();
drop trigger if exists photos_set_updated_at on public.photos;
create trigger photos_set_updated_at before update on public.photos for each row execute procedure public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.collections enable row level security;
alter table public.photos enable row level security;
alter table public.photo_collections enable row level security;
alter table public.tags enable row level security;
alter table public.photo_tags enable row level security;
alter table public.comments enable row level security;
alter table public.yearbook_picks enable row level security;

grant usage on schema public to anon, authenticated, service_role;
-- Clear any permissive default table grants, then grant only what the policies expect.
revoke all on table public.profiles, public.collections, public.photos, public.photo_collections, public.tags, public.photo_tags, public.comments, public.yearbook_picks from anon, authenticated;
grant select on public.collections, public.photos, public.photo_collections, public.tags, public.photo_tags, public.comments to anon, authenticated;
grant select on public.yearbook_picks to anon, authenticated;
grant select on public.profiles to authenticated;
grant update(display_name) on public.profiles to authenticated;
grant insert, update, delete on public.collections, public.photos, public.photo_collections, public.tags, public.photo_tags, public.yearbook_picks to authenticated;
grant update, delete on public.comments to authenticated;
grant execute on function public.is_curator() to anon, authenticated;

-- Profiles: members can read/update their own display name; curators can inspect profiles.
drop policy if exists "profiles_select_self_or_curator" on public.profiles;
create policy "profiles_select_self_or_curator" on public.profiles for select to authenticated using (id = auth.uid() or public.is_curator());
drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists "profiles_curator_all" on public.profiles;
create policy "profiles_curator_all" on public.profiles for all to authenticated using (public.is_curator()) with check (public.is_curator());

-- Public visitors can view published content. Curator alone can mutate it.
drop policy if exists "collections_public_read" on public.collections;
create policy "collections_public_read" on public.collections for select to anon, authenticated using (is_published or public.is_curator());
drop policy if exists "collections_curator_manage" on public.collections;
create policy "collections_curator_manage" on public.collections for all to authenticated using (public.is_curator()) with check (public.is_curator());

drop policy if exists "photos_public_read" on public.photos;
create policy "photos_public_read" on public.photos for select to anon, authenticated using (is_published or public.is_curator());
drop policy if exists "photos_curator_manage" on public.photos;
create policy "photos_curator_manage" on public.photos for all to authenticated using (public.is_curator()) with check (public.is_curator());

drop policy if exists "photo_collections_public_read" on public.photo_collections;
create policy "photo_collections_public_read" on public.photo_collections for select to anon, authenticated using (exists(select 1 from public.photos p where p.id = photo_id and (p.is_published or public.is_curator())));
drop policy if exists "photo_collections_curator_manage" on public.photo_collections;
create policy "photo_collections_curator_manage" on public.photo_collections for all to authenticated using (public.is_curator()) with check (public.is_curator());

drop policy if exists "tags_public_read" on public.tags;
create policy "tags_public_read" on public.tags for select to anon, authenticated using (true);
drop policy if exists "tags_curator_manage" on public.tags;
create policy "tags_curator_manage" on public.tags for all to authenticated using (public.is_curator()) with check (public.is_curator());

drop policy if exists "photo_tags_public_read" on public.photo_tags;
create policy "photo_tags_public_read" on public.photo_tags for select to anon, authenticated using (exists(select 1 from public.photos p where p.id = photo_id and (p.is_published or public.is_curator())));
drop policy if exists "photo_tags_curator_manage" on public.photo_tags;
create policy "photo_tags_curator_manage" on public.photo_tags for all to authenticated using (public.is_curator()) with check (public.is_curator());

drop policy if exists "comments_public_read_visible" on public.comments;
create policy "comments_public_read_visible" on public.comments for select to anon, authenticated using (not is_hidden or public.is_curator());
drop policy if exists "comments_curator_update" on public.comments;
create policy "comments_curator_update" on public.comments for update to authenticated using (public.is_curator()) with check (public.is_curator());
drop policy if exists "comments_curator_delete" on public.comments;
create policy "comments_curator_delete" on public.comments for delete to authenticated using (public.is_curator());

drop policy if exists "yearbook_picks_public_read" on public.yearbook_picks;
create policy "yearbook_picks_public_read" on public.yearbook_picks for select to anon, authenticated using (exists(select 1 from public.photos p where p.id = photo_id and (p.is_published or public.is_curator())));
drop policy if exists "yearbook_picks_curator_manage" on public.yearbook_picks;
create policy "yearbook_picks_curator_manage" on public.yearbook_picks for all to authenticated using (public.is_curator()) with check (public.is_curator());

-- Public comment submission is server-mediated: CAPTCHA + server-side rate limit.
-- Direct INSERT is intentionally not granted to anon/authenticated.
create or replace function public.submit_public_comment(
  p_photo_id uuid,
  p_author_name text,
  p_body text,
  p_parent_id uuid default null,
  p_ip_hash text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
  recent_count integer;
begin
  if p_author_name is null or char_length(trim(p_author_name)) < 2 or char_length(trim(p_author_name)) > 40 then
    raise exception 'Tên hiển thị cần từ 2 đến 40 ký tự.';
  end if;
  if p_body is null or char_length(trim(p_body)) < 2 or char_length(trim(p_body)) > 600 then
    raise exception 'Lời nhắn cần từ 2 đến 600 ký tự.';
  end if;
  if not exists(select 1 from public.photos where id = p_photo_id and is_published = true) then
    raise exception 'Không tìm thấy ảnh được phép bình luận.';
  end if;
  if p_parent_id is not null and not exists(select 1 from public.comments where id = p_parent_id and photo_id = p_photo_id and is_hidden = false) then
    raise exception 'Lời nhắn được trả lời không tồn tại.';
  end if;
  if p_ip_hash is not null then
    select count(*) into recent_count from public.comments
    where ip_hash = p_ip_hash and created_at > now() - interval '1 hour';
    if recent_count >= 8 then raise exception 'Bạn đã gửi khá nhiều lời nhắn. Hãy thử lại sau.'; end if;
  end if;
  insert into public.comments(photo_id,parent_id,author_name,body,ip_hash)
  values(p_photo_id,p_parent_id,trim(p_author_name),trim(p_body),p_ip_hash)
  returning id into new_id;
  return new_id;
end;
$$;
revoke all on function public.submit_public_comment(uuid,text,text,uuid,text) from public, anon, authenticated;
grant execute on function public.submit_public_comment(uuid,text,text,uuid,text) to service_role;

-- Public image bucket: anyone with the site link can view published photos.
-- Only curator accounts may upload, update, or remove objects.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('memoryverse','memoryverse',true,31457280,array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = true, file_size_limit = 31457280, allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif'];

drop policy if exists "memoryverse_public_read" on storage.objects;
create policy "memoryverse_public_read" on storage.objects for select to anon, authenticated using (bucket_id = 'memoryverse');
drop policy if exists "memoryverse_curator_upload" on storage.objects;
create policy "memoryverse_curator_upload" on storage.objects for insert to authenticated with check (bucket_id = 'memoryverse' and public.is_curator());
drop policy if exists "memoryverse_curator_update" on storage.objects;
create policy "memoryverse_curator_update" on storage.objects for update to authenticated using (bucket_id = 'memoryverse' and public.is_curator()) with check (bucket_id = 'memoryverse' and public.is_curator());
drop policy if exists "memoryverse_curator_delete" on storage.objects;
create policy "memoryverse_curator_delete" on storage.objects for delete to authenticated using (bucket_id = 'memoryverse' and public.is_curator());

-- Starter collections. Safe to re-run; slug is the stable identifier.
insert into public.collections(slug,title,description,space,layout_type,sort_order,is_published) values
('first-period','Trước hồi chuông','Những phút trước khi ngày học bắt đầu.','everyday','film-strip',1,true),
('break-time','Giờ ra chơi','Mười lăm phút mà có cả nghìn chuyện.','everyday','exhibition',2,true),
('after-class','Sau giờ tan học','Những góc sân trường lúc nắng nghiêng.','everyday','scrapbook',3,true),
('punishment-files','The Punishment Files','Những lần bị phạt — lưu lại để sau này cùng bật cười.','chaos','case-files',1,true),
('oops-moments','Oops Moments','Những pha lỡ tay, lỡ lời và không thể nhịn cười.','chaos','film-strip',2,true),
('behind-scenes','Hậu trường bất ổn','Những gì diễn ra trước và sau một tấm ảnh.','chaos','scrapbook',3,true),
('october-days','Tháng mười rực rỡ','Hoạt động, sự kiện và những dịp đáng nhớ.','milestones','exhibition',1,true),
('our-people','Gương mặt thân quen','Những người tạo nên tập thể lớp.','people','portrait-wall',1,true),
('little-things','Những điều nhỏ bé','Góc lớp, cuốn vở và những thứ ta dễ bỏ qua.','details','scrapbook',1,true),
('yearbook-candidates','The Final Cut','Những khung hình được chọn cho cuốn phim cuối cấp.','yearbook','exhibition',1,true)
on conflict (slug) do nothing;
