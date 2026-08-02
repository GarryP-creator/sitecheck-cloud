// ============================================================================
// SiteCheck — admin-users
//
// Creating a login needs the service role key, which can do anything and must
// never be sent to a browser. So it lives here instead, on Supabase, and the
// app asks this function to act on its behalf.
//
// Every request is checked twice: the caller must be signed in, and their
// profile must say superuser. Neither check can be skipped from the app side,
// because both happen here.
//
// Deploy: Supabase dashboard -> Edge Functions -> Deploy a new function,
// name it exactly "admin-users", paste this in, deploy.
// ============================================================================

import { createClient } from 'jsr:@supabase/supabase-js@2';

const DOMAIN = 'wrm.internal';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });

const validId = (id: string) => /^[A-Za-z0-9._-]{3,32}$/.test(id ?? '');
const validPin = (p: string) => /^\d{5}$/.test(p ?? '');
const emailFor = (id: string) => `${id.trim().toLowerCase()}@${DOMAIN}`;
const passFor = (id: string, pin: string) => `${id.trim().toLowerCase()}#${pin}`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // --- who is asking? ------------------------------------------------------
  const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '');
  if (!token) return json({ error: 'Not signed in' }, 401);

  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData?.user) return json({ error: 'Not signed in' }, 401);

  const { data: caller } = await admin
    .from('profiles')
    .select('role, active')
    .eq('id', userData.user.id)
    .single();

  if (!caller || caller.role !== 'superuser' || !caller.active) {
    return json({ error: 'Only a superuser can manage accounts' }, 403);
  }

  // --- what are they asking for? -------------------------------------------
  let body: Record<string, string>;
  try { body = await req.json(); }
  catch { return json({ error: 'Bad request' }, 400); }

  const action = body.action ?? 'create';

  // ---------------------------------------------------------------- create
  if (action === 'create') {
    const { userId, pin, fullName, email, role } = body;

    if (!validId(userId))  return json({ error: 'User ID must be 3+ characters: letters, numbers, dots, hyphens or underscores' }, 400);
    if (!validPin(pin))    return json({ error: 'The PIN must be exactly 5 digits' }, 400);
    if (!fullName?.trim()) return json({ error: 'Enter their full name' }, 400);
    if (!['site', 'manager', 'superuser'].includes(role ?? '')) return json({ error: 'Unknown role' }, 400);

    const { data: taken } = await admin
      .from('profiles').select('id').ilike('user_id', userId).maybeSingle();
    if (taken) return json({ error: `${userId} is already in use` }, 400);

    const { data: created, error: ce } = await admin.auth.admin.createUser({
      email: emailFor(userId),
      password: passFor(userId, pin),
      email_confirm: true,
    });
    if (ce) return json({ error: ce.message }, 400);

    const { error: pe } = await admin.from('profiles').insert({
      id: created.user.id,
      user_id: userId.trim(),
      full_name: fullName.trim(),
      email: email?.trim() || null,
      role,
      created_by: userData.user.id,
    });

    // if the profile fails, do not leave a login stranded without one
    if (pe) {
      await admin.auth.admin.deleteUser(created.user.id);
      return json({ error: pe.message }, 400);
    }

    return json({ ok: true, id: created.user.id, userId });
  }

  // ---------------------------------------------------------------- set PIN
  if (action === 'setpin') {
    const { id, userId, pin } = body;
    if (!validPin(pin)) return json({ error: 'The PIN must be exactly 5 digits' }, 400);
    if (!id || !validId(userId)) return json({ error: 'Missing user' }, 400);

    const { error } = await admin.auth.admin.updateUserById(id, {
      password: passFor(userId, pin),
    });
    if (error) return json({ error: error.message }, 400);
    return json({ ok: true });
  }

  // ------------------------------------------------------------- deactivate
  // The login is kept rather than deleted, so their name stays readable on
  // every record they signed. Deactivating simply stops them signing in.
  if (action === 'setactive') {
    const { id, active } = body;
    if (!id) return json({ error: 'Missing user' }, 400);
    if (id === userData.user.id) return json({ error: 'You cannot deactivate yourself' }, 400);

    const { error } = await admin
      .from('profiles').update({ active: !!active }).eq('id', id);
    if (error) return json({ error: error.message }, 400);
    return json({ ok: true });
  }

  return json({ error: 'Unknown action' }, 400);
});
