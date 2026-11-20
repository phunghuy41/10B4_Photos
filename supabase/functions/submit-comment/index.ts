import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed.' });

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const TURNSTILE_SECRET_KEY = Deno.env.get('TURNSTILE_SECRET_KEY');
  const IP_HASH_SALT = Deno.env.get('IP_HASH_SALT');
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !TURNSTILE_SECRET_KEY || !IP_HASH_SALT) {
    return json(500, { error: 'Server comment settings are incomplete.' });
  }

  try {
    const payload = await req.json();
    const photoId = String(payload.photo_id || '');
    const authorName = String(payload.author_name || '').trim();
    const body = String(payload.body || '').trim();
    const parentId = payload.parent_id ? String(payload.parent_id) : null;
    const token = String(payload.turnstile_token || '');

    if (!photoId || authorName.length < 2 || authorName.length > 40 || body.length < 2 || body.length > 600 || !token) {
      return json(400, { error: 'Vui lòng kiểm tra tên, lời nhắn và bước xác minh.' });
    }

    const form = new FormData();
    form.append('secret', TURNSTILE_SECRET_KEY);
    form.append('response', token);
    const remoteIp = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    if (remoteIp) form.append('remoteip', remoteIp);

    const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
    });
    const verification = await verifyResponse.json();
    if (!verifyResponse.ok || verification.success !== true) {
      return json(400, { error: 'Xác minh chưa thành công. Hãy thử lại.' });
    }

    // Store only a salted hash for rate limiting; never store the raw visitor IP.
    const ipHash = remoteIp ? await sha256(`${IP_HASH_SALT}:${remoteIp}`) : null;
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await admin.rpc('submit_public_comment', {
      p_photo_id: photoId,
      p_author_name: authorName,
      p_body: body,
      p_parent_id: parentId,
      p_ip_hash: ipHash,
    });

    if (error) {
      const message = error.message || 'Không thể gửi lời nhắn.';
      const isRateLimited = message.includes('khá nhiều lời nhắn');
      return json(isRateLimited ? 429 : 400, { error: message });
    }
    return json(201, { id: data, ok: true });
  } catch (error) {
    console.error('submit-comment failed', error);
    return json(500, { error: 'Có lỗi xảy ra khi gửi lời nhắn.' });
  }
});
