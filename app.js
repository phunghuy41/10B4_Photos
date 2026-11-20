const CONFIG = window.MEMORYVERSE_CONFIG || {};
const BUCKET = CONFIG.STORAGE_BUCKET || 'memoryverse';
const DEMO_MODE = !(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY);
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const SPACE_INFO = [
  { id: 'everyday', title: 'Những ngày bình thường', subtitle: 'Giờ học · Giờ chơi · Tan trường', index: '01', slug: 'everyday' },
  { id: 'chaos', title: 'Những pha khó đỡ', subtitle: 'Bị phạt · Trò nghịch · Hậu trường', index: '02', slug: 'chaos' },
  { id: 'milestones', title: 'Những dấu mốc', subtitle: 'Sự kiện · Hoạt động · Chuyến đi', index: '03', slug: 'milestones' },
  { id: 'people', title: 'Những con người', subtitle: 'Chân dung · Nhóm · GVCN', index: '04', slug: 'people' },
  { id: 'details', title: 'Những điều nhỏ bé', subtitle: 'Góc lớp · Đồ vật · Chi tiết', index: '05', slug: 'details' },
  { id: 'yearbook', title: 'Một cuốn phim đang thành hình', subtitle: 'Ảnh chọn · Dòng thời gian', index: '06', slug: 'yearbook' }
];

const DEMO_COLLECTIONS = [
  { id: 'c-everyday-1', slug: 'first-period', title: 'Trước hồi chuông', description: 'Những phút trước khi ngày học bắt đầu.', space: 'everyday', layout_type: 'film-strip', sort_order: 1 },
  { id: 'c-everyday-2', slug: 'break-time', title: 'Giờ ra chơi', description: 'Mười lăm phút mà có cả nghìn chuyện.', space: 'everyday', layout_type: 'exhibition', sort_order: 2 },
  { id: 'c-everyday-3', slug: 'after-class', title: 'Sau giờ tan học', description: 'Những góc sân trường lúc nắng nghiêng.', space: 'everyday', layout_type: 'scrapbook', sort_order: 3 },
  { id: 'c-chaos-1', slug: 'punishment-files', title: 'The Punishment Files', description: 'Những lần bị phạt — lưu lại để sau này cùng bật cười.', space: 'chaos', layout_type: 'case-files', sort_order: 1 },
  { id: 'c-chaos-2', slug: 'oops-moments', title: 'Oops Moments', description: 'Những pha lỡ tay, lỡ lời và không thể nhịn cười.', space: 'chaos', layout_type: 'film-strip', sort_order: 2 },
  { id: 'c-chaos-3', slug: 'behind-scenes', title: 'Hậu trường bất ổn', description: 'Những gì diễn ra trước và sau một tấm ảnh.', space: 'chaos', layout_type: 'scrapbook', sort_order: 3 },
  { id: 'c-milestones-1', slug: 'october-days', title: 'Tháng mười rực rỡ', description: 'Hoạt động, sự kiện và những dịp đáng nhớ.', space: 'milestones', layout_type: 'exhibition', sort_order: 1 },
  { id: 'c-people-1', slug: 'our-people', title: 'Gương mặt thân quen', description: 'Những người tạo nên 10B4.', space: 'people', layout_type: 'portrait-wall', sort_order: 1 },
  { id: 'c-details-1', slug: 'little-things', title: 'Những điều nhỏ bé', description: 'Góc lớp, cuốn vở và những thứ ta dễ bỏ qua.', space: 'details', layout_type: 'scrapbook', sort_order: 1 },
  { id: 'c-yearbook-1', slug: 'yearbook-candidates', title: 'The Final Cut', description: 'Những khung hình được chọn cho cuốn phim cuối cấp.', space: 'yearbook', layout_type: 'exhibition', sort_order: 1 }
];

const demoPhoto = (id, title, caption, date, collections, image, tags = [], isYearbookPick = false) => ({
  id, title, caption, taken_at: date, created_at: `${date}T09:00:00.000Z`, collectionIds: collections, tags, src: image, thumb: image, is_yearbook_pick: isYearbookPick
});
const DEMO_PHOTOS = [
  demoPhoto('d-01', 'Trước giờ vào lớp', 'Một buổi sáng chẳng có gì đặc biệt, ngoài việc chúng ta đã có mặt ở đây.', '2026-09-08', ['c-everyday-1','c-details-1'], 'assets/demo/01-classroom.svg', ['lớp học','buổi sáng'], true),
  demoPhoto('d-02', 'Một giờ ra chơi rất dài', 'Tiếng cười thường đến từ những chuyện nhỏ nhất.', '2026-10-03', ['c-everyday-2','c-chaos-2'], 'assets/demo/02-break.svg', ['ra chơi','candid']),
  demoPhoto('d-03', 'Hậu trường trước giờ diễn', 'Phía sau một khoảnh khắc chỉn chu là cả một buổi chuẩn bị.', '2026-10-20', ['c-milestones-1','c-chaos-3'], 'assets/demo/03-stage.svg', ['hậu trường','hoạt động'], true),
  demoPhoto('d-04', 'The Punishment Files · 001', 'Một hồ sơ được lưu lại bằng tinh thần vui vẻ — và sự đồng ý của những người trong ảnh.', '2026-10-12', ['c-chaos-1','c-chaos-2'], 'assets/demo/04-chaos.svg', ['bị phạt','chuyện lớp']),
  demoPhoto('d-05', 'Góc cửa sổ thân quen', 'Nắng cuối buổi thường khiến căn phòng trông khác đi.', '2026-11-04', ['c-details-1','c-everyday-3'], 'assets/demo/05-window.svg', ['góc lớp','ánh nắng'], true),
  demoPhoto('d-06', 'Một nhóm người rất quen', 'Không cần đứng ngay ngắn, chỉ cần là chúng ta.', '2026-10-25', ['c-people-1','c-everyday-2'], 'assets/demo/06-friends.svg', ['bạn bè','nhóm']),
  demoPhoto('d-07', 'Sau tiếng trống', 'Sân trường chậm lại một chút khi mọi người đã ra về.', '2026-09-18', ['c-everyday-3','c-details-1'], 'assets/demo/07-corridor.svg', ['tan học','sân trường']),
  demoPhoto('d-08', 'Một ngày đáng nhớ', 'Những khoảnh khắc được giữ lại để sau này kể thành câu chuyện.', '2026-11-10', ['c-yearbook-1','c-milestones-1'], 'assets/demo/08-event.svg', ['kỷ yếu','dấu mốc'], true)
];

let supabase = null;
let isCurator = false;
let currentUser = null;
let collections = [...DEMO_COLLECTIONS];
let photos = [...DEMO_PHOTOS];
let comments = [];
let yearbookIds = new Set(DEMO_PHOTOS.filter(p => p.is_yearbook_pick).map(p => p.id));
let activeSpace = 'all';
let activeCollection = null;
let searchTerm = '';
let viewerItems = [];
let viewerIndex = 0;
let selectedFiles = [];
let selectedFileUrls = [];
let turnstileWidgetId = null;
let turnstileScriptPromise = null;
let touchStartX = 0;
let touchStartY = 0;

const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
function makeId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
  else for (let i=0;i<bytes.length;i++) bytes[i]=Math.floor(Math.random()*256);
  bytes[6]=(bytes[6]&0x0f)|0x40; bytes[8]=(bytes[8]&0x3f)|0x80;
  const hex=[...bytes].map(b=>b.toString(16).padStart(2,'0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
const safeUrl = value => {
  try { const u = new URL(value, document.baseURI || location.href); return ['https:','http:','blob:','data:'].includes(u.protocol) ? u.href : ''; }
  catch { return ''; }
};
const prettyDate = value => {
  if (!value) return 'DATE NOT SET';
  const d = new Date(`${String(value).slice(0,10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return 'DATE NOT SET';
  return new Intl.DateTimeFormat('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' }).format(d);
};
const monthLabel = value => {
  if (!value) return '';
  const d = new Date(`${String(value).slice(0,10)}T12:00:00`);
  return Number.isNaN(d.getTime()) ? '' : new Intl.DateTimeFormat('en-US',{month:'short',year:'numeric'}).format(d).toUpperCase();
};
const prettyCount = n => `${n} ${n === 1 ? 'frame' : 'frames'}`;
const layoutMark = type => ({'film-strip':'▤','case-files':'⌑','exhibition':'◉','portrait-wall':'▦','scrapbook':'✎'}[type] || '◌');
const imageUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path) || path.startsWith('blob:') || path.startsWith('data:')) return path;
  return supabase?.storage?.from(BUCKET).getPublicUrl(path).data.publicUrl || '';
};

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2800);
}
function openOverlay(el) { el.classList.add('open'); el.setAttribute('aria-hidden','false'); document.body.classList.add('modal-open'); }
function closeOverlay(el) { el.classList.remove('open'); el.setAttribute('aria-hidden','true'); if (!$('.overlay.open')) document.body.classList.remove('modal-open'); }
function spaceTitle(space) { return SPACE_INFO.find(s => s.id === space)?.title || 'Memory Space'; }
function photosInCollection(collectionId) { return photos.filter(p => p.collectionIds?.includes(collectionId)); }
function currentPhotos() {
  let list = [...photos];
  if (activeCollection) list = list.filter(p => p.collectionIds?.includes(activeCollection));
  else if (activeSpace === 'yearbook') list = list.filter(p => yearbookIds.has(p.id) || p.is_yearbook_pick);
  else if (activeSpace !== 'all') list = list.filter(p => p.collectionIds?.some(id => collections.find(c => c.id === id)?.space === activeSpace));
  if (searchTerm) {
    const term = searchTerm.toLocaleLowerCase('vi');
    list = list.filter(p => [p.title,p.caption,...(p.tags || [])].join(' ').toLocaleLowerCase('vi').includes(term));
  }
  return list.sort((a,b) => String(b.taken_at || b.created_at).localeCompare(String(a.taken_at || a.created_at)));
}

function renderSpaces() {
  $$('.space-card').forEach(card => {
    const count = photos.filter(p => p.collectionIds?.some(id => collections.find(c => c.id === id)?.space === card.dataset.space)).length;
    const sub = $('.space-bottom span', card);
    if (sub && count) sub.dataset.count = `${count} frames`;
  });
}
function renderCollections() {
  const grid = $('#collectionGrid');
  const filtered = collections.filter(c => {
    if (activeSpace !== 'all' && c.space !== activeSpace) return false;
    if (!searchTerm) return true;
    const t = `${c.title} ${c.description} ${c.space}`.toLocaleLowerCase('vi');
    return t.includes(searchTerm.toLocaleLowerCase('vi')) || photosInCollection(c.id).some(p => `${p.title} ${p.caption} ${(p.tags||[]).join(' ')}`.toLocaleLowerCase('vi').includes(searchTerm.toLocaleLowerCase('vi')));
  }).sort((a,b) => (a.sort_order || 0) - (b.sort_order || 0));
  grid.innerHTML = filtered.map((c,i) => {
    const coverPhoto = photosInCollection(c.id)[0];
    const cover = safeUrl(c.coverUrl || (coverPhoto && (coverPhoto.thumb || coverPhoto.src)) || '');
    const style = cover ? `--cover:url('${escapeHTML(cover)}')` : '';
    const count = photosInCollection(c.id).length;
    const selected = activeCollection === c.id ? ' selected' : '';
    return `<button class="collection-card${selected}" data-collection="${escapeHTML(c.id)}" aria-label="Mở bộ sưu tập ${escapeHTML(c.title)}">
      <div class="collection-cover" style="${style}"><span class="collection-layout-mark">${layoutMark(c.layout_type)}</span><span class="cover-index">ROLL ${String(i+1).padStart(2,'0')} · ${escapeHTML(c.space.toUpperCase())}</span></div>
      <div class="collection-meta"><b>${escapeHTML(c.title)}</b><small>${prettyCount(count)}</small></div><p class="collection-desc">${escapeHTML(c.description || '')}</p>
    </button>`;
  }).join('');
  if (!filtered.length) grid.innerHTML = '<p class="no-comments">Chưa có bộ sưu tập phù hợp.</p>';
}
function renderPhotos() {
  const list = currentPhotos();
  const grid = $('#photoGrid');
  $('#photoCount').textContent = prettyCount(list.length);
  $('#photoGridTitle').textContent = activeCollection ? collections.find(c=>c.id===activeCollection)?.title || 'Những khoảnh khắc' : activeSpace === 'all' ? 'Những khoảnh khắc gần đây' : activeSpace === 'yearbook' ? 'Những ảnh đang được chọn' : spaceTitle(activeSpace);
  $('#photoGridKicker').textContent = activeSpace === 'yearbook' ? 'THE YEARBOOK SELECTION' : activeCollection ? 'INSIDE THIS COLLECTION' : 'RECENTLY REMEMBERED';
  $('#emptyState').hidden = list.length > 0;
  grid.innerHTML = list.map((p,i) => {
    const src = safeUrl(p.thumb || p.src);
    const alt = escapeHTML(p.title || 'Memoryverse photo');
    return `<button class="photo-card" data-photo-id="${escapeHTML(p.id)}" aria-label="Xem ảnh ${alt}">
      <div class="photo-thumb">${src ? `<img src="${escapeHTML(src)}" alt="${alt}" loading="lazy" />` : '<span class="photo-number">FRAME WAITING</span>'}<span class="photo-number">NO. ${String(i+1).padStart(3,'0')}</span></div>
      <span class="photo-card-title">${alt}</span><span class="photo-card-date">${prettyDate(p.taken_at || p.created_at)}${yearbookIds.has(p.id) || p.is_yearbook_pick ? ' · YEARBOOK PICK' : ''}</span>
    </button>`;
  }).join('');
  renderSpaces();
}
function setSpace(space) {
  activeSpace = space;
  activeCollection = null;
  $$('.filter-chip').forEach(chip => chip.classList.toggle('active', chip.dataset.filter === space));
  renderCollections(); renderPhotos();
  if (space !== 'all') $('#archive').scrollIntoView({behavior:'smooth',block:'start'});
}
function openCollection(id) {
  activeCollection = id;
  activeSpace = collections.find(c=>c.id===id)?.space || 'all';
  $$('.filter-chip').forEach(chip => chip.classList.toggle('active', chip.dataset.filter === activeSpace));
  renderCollections(); renderPhotos();
  $('#photoGridTitle').textContent = collections.find(c=>c.id===id)?.title || 'Bộ sưu tập';
  $('#photoGrid').scrollIntoView({behavior:'smooth',block:'start'});
}

function renderComments(items) {
  items = items.filter(c => !c.is_hidden);
  const list = $('#commentsList');
  $('#commentCount').textContent = `${items.length} lời nhắn`;
  if (!items.length) { list.innerHTML = '<div class="no-comments">Chưa có lời nhắn nào. Có thể cậu sẽ là người đầu tiên.</div>'; return; }
  const top = items.filter(c => !c.parent_id);
  const children = new Map();
  items.filter(c => c.parent_id).forEach(c => { if (!children.has(c.parent_id)) children.set(c.parent_id,[]); children.get(c.parent_id).push(c); });
  const renderOne = c => `<div class="comment-item${c.parent_id ? ' reply' : ''}"><div class="comment-meta"><b>${escapeHTML(c.author_name)}</b><time>${prettyDate(c.created_at)}</time></div><p>${escapeHTML(c.body)}</p>${!c.parent_id ? `<button class="reply-link" data-reply-to="${escapeHTML(c.id)}">↳ Trả lời</button>` : ''}</div>`;
  list.innerHTML = top.map(c => renderOne(c) + (children.get(c.id)||[]).map(renderOne).join('')).join('');
}
async function loadPhotoComments(photo) {
  $('#commentMessage').textContent = '';
  if (DEMO_MODE) {
    const saved = JSON.parse(localStorage.getItem('memoryverse-demo-comments') || '{}');
    renderComments(saved[photo.id] || []);
    return;
  }
  $('#commentsList').innerHTML = '<div class="no-comments">Đang mở những lời nhắn...</div>';
  const { data, error } = await supabase.from('comments').select('id,photo_id,parent_id,author_name,body,created_at').eq('photo_id',photo.id).eq('is_hidden',false).order('created_at',{ascending:true});
  if (error) { $('#commentsList').innerHTML = '<div class="no-comments">Chưa tải được bình luận.</div>'; console.error(error); return; }
  comments = data || [];
  renderComments(comments);
}
function setViewerPhoto() {
  if (!viewerItems.length) return;
  const p = viewerItems[viewerIndex];
  const pickButton = $('#toggleYearbookPick');
  pickButton.hidden = !(DEMO_MODE || isCurator);
  const picked = yearbookIds.has(p.id) || p.is_yearbook_pick;
  pickButton.classList.toggle('is-picked', picked);
  pickButton.textContent = picked ? '✦ Đã nằm trong The Final Cut' : '✧ Đưa vào The Final Cut';
  $('#commentForm').dataset.parentId = '';
  $('#commentBody').placeholder = 'Bạn còn nhớ chuyện gì hôm ấy?';
  const img = $('#viewerImage');
  img.classList.add('changing');
  const source = safeUrl(p.src || p.thumb);
  img.onload = () => img.classList.remove('changing');
  img.onerror = () => { img.classList.remove('changing'); img.alt = 'Không thể tải ảnh này'; };
  img.src = source;
  img.alt = p.title || 'Memoryverse';
  $('#viewerPosition').textContent = `${String(viewerIndex+1).padStart(2,'0')} / ${String(viewerItems.length).padStart(2,'0')}`;
  $('#viewerTitle').textContent = p.title || 'Một khoảnh khắc';
  $('#viewerCaption').textContent = p.caption || '';
  $('#viewerCollection').textContent = (collections.find(c => p.collectionIds?.includes(c.id))?.title || 'MEMORY').toUpperCase();
  $('#viewerDate').textContent = monthLabel(p.taken_at || p.created_at);
  $('#viewerTags').innerHTML = (p.tags || []).slice(0,5).map(t=>`<span>${escapeHTML(t)}</span>`).join('');
  $('#viewerPrev').disabled = viewerItems.length < 2;
  $('#viewerNext').disabled = viewerItems.length < 2;
  loadPhotoComments(p);
  if (!DEMO_MODE) ensureTurnstile();
}
function openViewer(photoId) {
  viewerItems = currentPhotos();
  viewerIndex = viewerItems.findIndex(p => p.id === photoId);
  if (viewerIndex < 0) { viewerItems = photos; viewerIndex = viewerItems.findIndex(p=>p.id===photoId); }
  if (viewerIndex < 0) return;
  openOverlay($('#viewer'));
  setViewerPhoto();
}
function moveViewer(delta) {
  if (viewerItems.length < 2) return;
  viewerIndex = (viewerIndex + delta + viewerItems.length) % viewerItems.length;
  setViewerPhoto();
}

async function loadModeration() {
  const host=$('#moderationList');
  if(!host) return;
  let rows=[];
  if(DEMO_MODE){
    const stored=JSON.parse(localStorage.getItem('memoryverse-demo-comments') || '{}');
    rows=Object.values(stored).flat().map(c=>({...c,photo_title:photos.find(p=>p.id===c.photo_id)?.title || 'Ảnh đã lưu'}));
  } else if(isCurator){
    const {data,error}=await supabase.from('comments').select('id,photo_id,author_name,body,created_at,is_hidden,photos(title)').order('created_at',{ascending:false}).limit(60);
    if(error){host.innerHTML='<p class="no-comments">Chưa tải được danh sách lời nhắn.</p>';return;}
    rows=(data||[]).map(c=>({...c,photo_title:c.photos?.title || 'Ảnh đã lưu'}));
  } else return;
  rows.sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));
  if(!rows.length){host.innerHTML='<p class="no-comments">Chưa có lời nhắn nào.</p>';return;}
  host.innerHTML=rows.map(c=>`<article class="moderation-item"><div class="moderation-item-top"><b>${escapeHTML(c.author_name)} ${c.is_hidden?'<span style="color:#9c5b51;font-weight:400">· đã ẩn</span>':''}</b><small>${prettyDate(c.created_at)}</small></div><small>${escapeHTML(c.photo_title)}</small><p>${escapeHTML(c.body)}</p><div class="moderation-actions">${c.is_hidden?`<button data-comment-action="show" data-comment-id="${escapeHTML(c.id)}">Hiện lại</button>`:`<button data-comment-action="hide" data-comment-id="${escapeHTML(c.id)}">Ẩn lời nhắn</button>`}<button class="danger" data-comment-action="delete" data-comment-id="${escapeHTML(c.id)}">Xóa</button></div></article>`).join('');
}
async function moderateComment(action,id) {
  if(DEMO_MODE){
    const stored=JSON.parse(localStorage.getItem('memoryverse-demo-comments') || '{}');
    for(const photoId of Object.keys(stored)){
      const target=stored[photoId].find(c=>c.id===id);
      if(target){if(action==='delete')stored[photoId]=stored[photoId].filter(c=>c.id!==id);else target.is_hidden=action==='hide';}
    }
    localStorage.setItem('memoryverse-demo-comments',JSON.stringify(stored));
    if(viewerItems[viewerIndex]) loadPhotoComments(viewerItems[viewerIndex]);
  } else {
    if(!isCurator) return;
    const result=action==='delete'?await supabase.from('comments').delete().eq('id',id):await supabase.from('comments').update({is_hidden:action==='hide'}).eq('id',id);
    if(result.error){showToast('Chưa cập nhật được lời nhắn.');return;}
    if(viewerItems[viewerIndex]) loadPhotoComments(viewerItems[viewerIndex]);
  }
  await loadModeration(); showToast(action==='delete'?'Đã xóa lời nhắn.':action==='hide'?'Đã ẩn lời nhắn.':'Đã hiện lại lời nhắn.');
}

function setCollectionsForUpload() {
  const available = collections.filter(c=>c.space!=='yearbook');
  $('#uploadCollectionChoices').innerHTML = available.map((c,i)=>`<label class="collection-choice"><input type="checkbox" name="uploadCollection" value="${escapeHTML(c.id)}" ${i===0?'checked':''}><span>${escapeHTML(c.title)}</span></label>`).join('');
}
function setMode() {
  $('#modeIndicator').innerHTML = DEMO_MODE ? '<i></i> Bản xem thử' : '<i></i> MEMORYVERSE CLOUD';
  $('#demoWarning').hidden = !DEMO_MODE;
  $('#loginForm').hidden = DEMO_MODE || isCurator;
  $('#uploadWorkspace').hidden = !DEMO_MODE && !isCurator;
  $('#curatorSession').hidden = DEMO_MODE || !isCurator;
  if (currentUser) $('#curatorIdentity').textContent = currentUser.email || 'Curator';
  $('#moderationWorkspace').hidden = !DEMO_MODE && !isCurator;
  if (DEMO_MODE || isCurator) loadModeration();
}
function openCurator() {
  setMode(); openOverlay($('#curatorModal'));
}
function selectFiles(fileList) {
  selectedFileUrls.forEach(url=>URL.revokeObjectURL(url));
  selectedFileUrls=[];
  selectedFiles = [...fileList].filter(file => ['image/jpeg','image/png','image/webp','image/avif'].includes(file.type));
  selectedFileUrls=selectedFiles.map(file=>URL.createObjectURL(file));
  const box = $('#selectedFiles');
  box.hidden = !selectedFiles.length;
  $('#uploadButton').disabled = selectedFiles.length === 0;
  box.innerHTML = selectedFiles.map((file,i) => `<div class="selected-file"><img src="${escapeHTML(selectedFileUrls[i])}" alt=""><b>${escapeHTML(file.name)}</b><small>${(file.size/1024/1024).toFixed(1)} MB</small></div>`).join('');
  if (fileList.length && selectedFiles.length !== fileList.length) showToast('Một số tệp không phải ảnh nên đã được bỏ qua.');
}
function fileToDataUrl(file) {
  return new Promise((resolve,reject) => { const r = new FileReader(); r.onload=()=>resolve(r.result); r.onerror=reject; r.readAsDataURL(file); });
}
function createThumbnail(file, maxEdge=1000) {
  return new Promise((resolve,reject) => {
    const url = URL.createObjectURL(file); const image = new Image();
    image.onload = () => {
      const ratio = Math.min(1, maxEdge / Math.max(image.naturalWidth,image.naturalHeight));
      const canvas = document.createElement('canvas'); canvas.width=Math.round(image.naturalWidth*ratio); canvas.height=Math.round(image.naturalHeight*ratio);
      const ctx = canvas.getContext('2d'); ctx.drawImage(image,0,0,canvas.width,canvas.height);
      canvas.toBlob(blob => { URL.revokeObjectURL(url); if (blob) resolve({blob,width:image.naturalWidth,height:image.naturalHeight}); else reject(new Error('Không tạo được ảnh xem trước.')); },'image/webp',.82);
    };
    image.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Không đọc được ảnh.'));}; image.src=url;
  });
}
async function sha256(file) {
  const bytes = await file.arrayBuffer(); const hash = await crypto.subtle.digest('SHA-256',bytes);
  return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
function setUploadProgress(done,total,text) {
  $('#uploadProgress').hidden=false; $('#progressBar').style.width=`${Math.round(done/Math.max(total,1)*100)}%`; $('#progressText').textContent=text;
}
async function uploadSelectedFiles() {
  if (!selectedFiles.length) return;
  const collectionIds=$$('input[name="uploadCollection"]:checked').map(input=>input.value); const date=$('#uploadDate').value || null; const note=$('#uploadNote').value.trim();
  const tags=[...new Set($('#uploadTags').value.split(',').map(tag=>tag.trim().toLocaleLowerCase('vi')).filter(Boolean))].slice(0,12);
  if (!collectionIds.length) { $('#uploadMessage').textContent='Hãy chọn ít nhất một bộ sưu tập.'; $('#uploadMessage').classList.add('error'); return; }
  $('#uploadMessage').classList.remove('error');
  $('#uploadButton').disabled=true; $('#uploadMessage').textContent=''; setUploadProgress(0,selectedFiles.length,'Đang chuẩn bị...');
  let completed=0; const added=[]; const errors=[];
  for (const file of selectedFiles) {
    try {
      if (file.size > 30*1024*1024) throw new Error(`${file.name}: vượt quá 30 MB.`);
      const thumb=await createThumbnail(file);
      if (DEMO_MODE) {
        const dataUrl=await fileToDataUrl(file);
        const id=`local-${makeId()}`;
        const p={id,title:file.name.replace(/\.[^.]+$/,''),caption:note,taken_at:date || (()=>{const now=new Date();return new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,10)})(),created_at:new Date().toISOString(),collectionIds,tags,src:dataUrl,thumb:dataUrl,is_yearbook_pick:false};
        photos.unshift(p); added.push(p);
      } else {
        const hash=await sha256(file);
        const duplicate=await supabase.from('photos').select('id').eq('sha256',hash).maybeSingle();
        if (duplicate.error) throw duplicate.error;
        if (duplicate.data) throw new Error(`${file.name}: ảnh này đã có trong kho.`);
        const id=makeId(); const ext=(file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g,'');
        const originalPath=`originals/${id}.${ext}`; const thumbPath=`thumbs/${id}.webp`;
        const originalUpload=await supabase.storage.from(BUCKET).upload(originalPath,file,{contentType:file.type,upsert:false});
        if(originalUpload.error) throw originalUpload.error;
        const thumbUpload=await supabase.storage.from(BUCKET).upload(thumbPath,thumb.blob,{contentType:'image/webp',upsert:false});
        if(thumbUpload.error){await supabase.storage.from(BUCKET).remove([originalPath]);throw thumbUpload.error;}
        const insert=await supabase.from('photos').insert({id,title:file.name.replace(/\.[^.]+$/,''),caption:note || null,taken_at:date,storage_path:originalPath,thumbnail_path:thumbPath,width:thumb.width,height:thumb.height,sha256:hash,is_published:true,created_by:currentUser.id}).select('id').single();
        if(insert.error){await supabase.storage.from(BUCKET).remove([originalPath,thumbPath]);throw insert.error;}
        const link=await supabase.from('photo_collections').insert(collectionIds.map(collection_id=>({photo_id:id,collection_id})));
        if(link.error){await supabase.from('photos').delete().eq('id',id);await supabase.storage.from(BUCKET).remove([originalPath,thumbPath]);throw link.error;}
        if(tags.length){
          const tagRows=await supabase.from('tags').upsert(tags.map(name=>({name})),{onConflict:'name'}).select('id,name');
          if(tagRows.error){await supabase.from('photos').delete().eq('id',id);await supabase.storage.from(BUCKET).remove([originalPath,thumbPath]);throw tagRows.error;}
          const tagLinks=await supabase.from('photo_tags').insert(tagRows.data.map(t=>({photo_id:id,tag_id:t.id})));
          if(tagLinks.error){await supabase.from('photos').delete().eq('id',id);await supabase.storage.from(BUCKET).remove([originalPath,thumbPath]);throw tagLinks.error;}
        }
      }
      completed++;
      setUploadProgress(completed,selectedFiles.length,`Đã thêm ${completed}/${selectedFiles.length} ảnh`);
    } catch (error) { errors.push(error.message || String(error)); }
  }
  if (!DEMO_MODE) await loadCloudData();
  else { renderCollections(); renderPhotos(); }
  const ok=completed;
  $('#uploadMessage').textContent = errors.length ? `Đã thêm ${ok} ảnh. ${errors.join(' ')}` : `Đã thêm ${ok} ảnh vào ${collectionIds.map(id=>collections.find(c=>c.id===id)?.title).filter(Boolean).join(', ') || 'bộ sưu tập'}.`;
  $('#uploadMessage').classList.toggle('error',errors.length>0 && ok===0);
  if(ok) showToast(`${ok} khung hình đã được thêm.`);
  selectedFiles=[]; selectedFileUrls.forEach(url=>URL.revokeObjectURL(url)); selectedFileUrls=[]; $('#photoFiles').value=''; $('#selectedFiles').hidden=true; $('#selectedFiles').innerHTML=''; $('#uploadButton').disabled=true;
  if(!errors.length) { $('#uploadNote').value=''; $('#uploadTags').value=''; }
}

async function loadTurnstile() {
  if (DEMO_MODE || !CONFIG.TURNSTILE_SITE_KEY) return false;
  if (window.turnstile) return true;
  if (!turnstileScriptPromise) turnstileScriptPromise = new Promise((resolve,reject) => {
    const script=document.createElement('script'); script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; script.async=true; script.defer=true;
    script.onload=()=>resolve(true); script.onerror=()=>reject(new Error('Không tải được xác minh chống spam.')); document.head.appendChild(script);
  });
  try { await turnstileScriptPromise; return !!window.turnstile; } catch { return false; }
}
async function ensureTurnstile() {
  if (DEMO_MODE) return;
  if (!CONFIG.TURNSTILE_SITE_KEY) { $('#commentMessage').textContent='Quản trị viên cần cấu hình Turnstile trước khi bật bình luận công khai.'; return; }
  const ready=await loadTurnstile();
  if (!ready || !window.turnstile || turnstileWidgetId !== null) return;
  turnstileWidgetId=window.turnstile.render('#turnstileContainer',{sitekey:CONFIG.TURNSTILE_SITE_KEY,theme:'light',size:'compact'});
}
async function submitComment(event) {
  event.preventDefault();
  const photo=viewerItems[viewerIndex]; if(!photo) return;
  const name=$('#commentName').value.trim(); const body=$('#commentBody').value.trim();
  if(name.length<2 || body.length<2){$('#commentMessage').textContent='Tên và lời nhắn cần có ít nhất 2 ký tự.';$('#commentMessage').classList.add('error');return;}
  $('#commentMessage').classList.remove('error'); $('#commentMessage').textContent='Đang gửi...';
  const parentId=$('#commentForm').dataset.parentId || null;
  if(DEMO_MODE){
    const stored=JSON.parse(localStorage.getItem('memoryverse-demo-comments') || '{}');
    const entry={id:makeId(),photo_id:photo.id,parent_id:parentId,author_name:name,body,created_at:new Date().toISOString()};
    stored[photo.id]=stored[photo.id] || []; stored[photo.id].push(entry); localStorage.setItem('memoryverse-demo-comments',JSON.stringify(stored));
    $('#commentBody').value=''; $('#commentForm').dataset.parentId=''; $('#commentMessage').textContent='Đã lưu lời nhắn trên thiết bị này (chế độ xem thử).'; renderComments(stored[photo.id]); return;
  }
  if(!CONFIG.TURNSTILE_SITE_KEY){$('#commentMessage').textContent='Chưa cấu hình xác minh chống spam. Hãy thiết lập Turnstile theo README.';$('#commentMessage').classList.add('error');return;}
  const token=window.turnstile?.getResponse(turnstileWidgetId);
  if(!token){$('#commentMessage').textContent='Vui lòng hoàn thành bước xác minh chống spam.';$('#commentMessage').classList.add('error');return;}
  const {data,error}=await supabase.functions.invoke('submit-comment',{body:{photo_id:photo.id,author_name:name,body,parent_id:parentId,turnstile_token:token}});
  if(error || data?.error){$('#commentMessage').textContent=data?.error || error?.message || 'Chưa gửi được lời nhắn.';$('#commentMessage').classList.add('error');window.turnstile?.reset(turnstileWidgetId);return;}
  $('#commentBody').value=''; $('#commentForm').dataset.parentId=''; $('#commentMessage').textContent='Lời nhắn đã được gửi.';
  window.turnstile?.reset(turnstileWidgetId); await loadPhotoComments(photo);
}

async function loadCloudData() {
  const [cRes,pRes,pcRes,tRes,ytRes]=await Promise.all([
    supabase.from('collections').select('id,slug,title,description,space,layout_type,cover_image_path,sort_order,is_published').eq('is_published',true).order('sort_order'),
    supabase.from('photos').select('id,title,caption,taken_at,storage_path,thumbnail_path,width,height,is_published,created_at').eq('is_published',true).order('taken_at',{ascending:false,nullsFirst:false}),
    supabase.from('photo_collections').select('photo_id,collection_id'),
    supabase.from('photo_tags').select('photo_id,tags(name)'),
    supabase.from('yearbook_picks').select('photo_id')
  ]);
  const firstError=[cRes,pRes,pcRes].find(r=>r.error)?.error;
  if(firstError) throw firstError;
  collections=(cRes.data||[]).map(c=>({...c,coverUrl:imageUrl(c.cover_image_path)}));
  const links=new Map(); (pcRes.data||[]).forEach(x=>{if(!links.has(x.photo_id))links.set(x.photo_id,[]);links.get(x.photo_id).push(x.collection_id);});
  const tagMap=new Map(); (tRes.data||[]).forEach(x=>{if(!tagMap.has(x.photo_id))tagMap.set(x.photo_id,[]);if(x.tags?.name)tagMap.get(x.photo_id).push(x.tags.name);});
  yearbookIds=new Set((ytRes.data||[]).map(x=>x.photo_id));
  photos=(pRes.data||[]).map(p=>({...p,src:imageUrl(p.storage_path),thumb:imageUrl(p.thumbnail_path || p.storage_path),collectionIds:links.get(p.id)||[],tags:tagMap.get(p.id)||[],is_yearbook_pick:yearbookIds.has(p.id)}));
  setCollectionsForUpload(); renderCollections(); renderPhotos();
}
async function checkCurator() {
  if(DEMO_MODE) return;
  const {data:{session}}=await supabase.auth.getSession(); currentUser=session?.user || null;
  if(!currentUser){isCurator=false;setMode();return;}
  const {data,error}=await supabase.from('profiles').select('role,display_name').eq('id',currentUser.id).maybeSingle();
  isCurator=!error && data?.role==='curator'; setMode();
  if(!isCurator) $('#loginMessage').textContent='Tài khoản này chưa được cấp quyền curator.';
}
async function loginCurator(event) {
  event.preventDefault(); $('#loginMessage').textContent='Đang xác thực...';
  const {data,error}=await supabase.auth.signInWithPassword({email:$('#adminEmail').value.trim(),password:$('#adminPassword').value});
  if(error){$('#loginMessage').textContent=error.message;$('#loginMessage').classList.add('error');return;}
  currentUser=data.user; await checkCurator();
  if(!isCurator){await supabase.auth.signOut();$('#loginMessage').textContent='Tài khoản chưa được cấp quyền curator trong bảng profiles.';return;}
  $('#loginMessage').textContent=''; showToast('Đã đăng nhập Curator Studio.');
}
async function signOut() { await supabase.auth.signOut();currentUser=null;isCurator=false;setMode();showToast('Đã đăng xuất.'); }

async function toggleYearbookPick() {
  const photo=viewerItems[viewerIndex]; if(!photo) return;
  const already=yearbookIds.has(photo.id) || photo.is_yearbook_pick;
  if (DEMO_MODE) {
    if(already) yearbookIds.delete(photo.id); else yearbookIds.add(photo.id);
  } else {
    if(!isCurator) return;
    if(already){
      const {error}=await supabase.from('yearbook_picks').delete().eq('photo_id',photo.id);
      if(error){showToast('Chưa thể cập nhật lựa chọn kỷ yếu.');return;}
      yearbookIds.delete(photo.id);
    } else {
      const {error}=await supabase.from('yearbook_picks').upsert({photo_id:photo.id,pick_type:'candidate'});
      if(error){showToast('Chưa thể cập nhật lựa chọn kỷ yếu.');return;}
      yearbookIds.add(photo.id);
    }
  }
  photo.is_yearbook_pick=yearbookIds.has(photo.id);
  setViewerPhoto(); renderPhotos(); showToast(already?'Đã bỏ khỏi The Final Cut.':'Đã thêm vào The Final Cut.');
}

function bindEvents() {
  $$('.space-card').forEach(card=>card.addEventListener('click',()=>setSpace(card.dataset.space)));
  $('#spaceFilters').addEventListener('click',e=>{const chip=e.target.closest('[data-filter]');if(chip)setSpace(chip.dataset.filter);});
  $('#collectionGrid').addEventListener('click',e=>{const card=e.target.closest('[data-collection]');if(card)openCollection(card.dataset.collection);});
  $('#photoGrid').addEventListener('click',e=>{const card=e.target.closest('[data-photo-id]');if(card)openViewer(card.dataset.photoId);});
  $('#searchInput').addEventListener('input',e=>{searchTerm=e.target.value.trim();activeCollection=null;renderCollections();renderPhotos();});
  $('#openCurator').addEventListener('click',openCurator);
  $('#closeCurator').addEventListener('click',()=>closeOverlay($('#curatorModal')));
  $('#closeViewer').addEventListener('click',()=>closeOverlay($('#viewer')));
  $('#viewerPrev').addEventListener('click',()=>moveViewer(-1)); $('#viewerNext').addEventListener('click',()=>moveViewer(1));
  $('#viewer').addEventListener('click',e=>{if(e.target===$('#viewer'))closeOverlay($('#viewer'));});
  $('#curatorModal').addEventListener('click',e=>{if(e.target===$('#curatorModal'))closeOverlay($('#curatorModal'));});
  $('#commentForm').addEventListener('submit',submitComment);
  $('#toggleYearbookPick').addEventListener('click', toggleYearbookPick);
  $('#moderationList').addEventListener('click',e=>{const btn=e.target.closest('[data-comment-action]');if(btn)moderateComment(btn.dataset.commentAction,btn.dataset.commentId);});
  $('#commentsList').addEventListener('click',e=>{const btn=e.target.closest('[data-reply-to]');if(!btn)return;$('#commentForm').dataset.parentId=btn.dataset.replyTo;$('#commentBody').placeholder='Viết lời hồi đáp...';$('#commentBody').focus();});
  $('#photoFiles').addEventListener('change',e=>selectFiles(e.target.files));
  $('#uploadButton').addEventListener('click',uploadSelectedFiles);
  $('#dropzone').addEventListener('dragover',e=>{e.preventDefault();$('#dropzone').classList.add('dragover');});
  $('#dropzone').addEventListener('dragleave',()=>$('#dropzone').classList.remove('dragover'));
  $('#dropzone').addEventListener('drop',e=>{e.preventDefault();$('#dropzone').classList.remove('dragover');selectFiles(e.dataTransfer.files);});
  $('#loginForm').addEventListener('submit',loginCurator);
  $('#signOutButton').addEventListener('click',signOut);
  $$('.time-stop').forEach(stop=>stop.addEventListener('click',()=>{
    $$('.time-stop').forEach(s=>s.classList.toggle('active',s===stop));
    const period=stop.dataset.period; activeCollection=null; activeSpace='all'; searchTerm='';$('#searchInput').value='';
    const [year,month]=period.split('-'); const list=photos.filter(p=>String(p.taken_at||'').startsWith(`${year}-${month}`));
    renderCollections(); $('#photoGridTitle').textContent=stop.querySelector('b').textContent; $('#photoGridKicker').textContent=`THE ARCHIVE · ${month}/${year}`;
    $('#photoCount').textContent=prettyCount(list.length); $('#emptyState').hidden=list.length>0;
    $('#photoGrid').innerHTML=list.map((p,i)=>`<button class="photo-card" data-photo-id="${escapeHTML(p.id)}"><div class="photo-thumb"><img src="${escapeHTML(safeUrl(p.thumb||p.src))}" alt="${escapeHTML(p.title)}" loading="lazy"><span class="photo-number">NO. ${String(i+1).padStart(3,'0')}</span></div><span class="photo-card-title">${escapeHTML(p.title)}</span><span class="photo-card-date">${prettyDate(p.taken_at)}</span></button>`).join('');
    $('#photoGrid').scrollIntoView({behavior:'smooth',block:'start'});
  }));
  document.addEventListener('keydown',e=>{
    if($('#viewer').classList.contains('open')){if(e.key==='Escape')closeOverlay($('#viewer'));if(e.key==='ArrowRight')moveViewer(1);if(e.key==='ArrowLeft')moveViewer(-1);}
    else if($('#curatorModal').classList.contains('open') && e.key==='Escape')closeOverlay($('#curatorModal'));
  });
  $('#viewerSwipeArea').addEventListener('touchstart',e=>{touchStartX=e.changedTouches[0].screenX;touchStartY=e.changedTouches[0].screenY;},{passive:true});
  $('#viewerSwipeArea').addEventListener('touchend',e=>{const dx=e.changedTouches[0].screenX-touchStartX;const dy=e.changedTouches[0].screenY-touchStartY;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.25)moveViewer(dx<0?1:-1);},{passive:true});
}

async function init() {
  bindEvents(); setCollectionsForUpload(); renderCollections(); renderPhotos();
  const now=new Date(); $('#uploadDate').value=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,10);
  if(!DEMO_MODE){
    try{
      const {createClient}=await import('https://esm.sh/@supabase/supabase-js@2');
      supabase=createClient(CONFIG.SUPABASE_URL,CONFIG.SUPABASE_ANON_KEY);
      await checkCurator(); await loadCloudData();
    }catch(error){console.error(error);showToast('Chưa kết nối được Supabase. Kiểm tra cấu hình trong config.js.');}
  }else{
    // Seed a small local demo comment so the layout can be inspected without a backend.
    const saved=localStorage.getItem('memoryverse-demo-comments');
    if(!saved){localStorage.setItem('memoryverse-demo-comments',JSON.stringify({'d-02':[{id:'demo-comment-1',photo_id:'d-02',parent_id:null,author_name:'Một người bạn',body:'Hôm ấy có chuyện gì mà ai cũng cười thế nhỉ?',created_at:'2026-10-03T09:00:00.000Z'}]}));}
  }
  setMode();
}

init();
