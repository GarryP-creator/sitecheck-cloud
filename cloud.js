/* ============================================================================
   SiteCheck — the cloud side

   Wraps Supabase so the rest of the app never has to think about it. Three
   principles run through this file:

   1. The device is the source of truth while you are working. Nothing is lost
      because a request failed; it goes in the outbox and waits.
   2. Only signed records sync. A signed record can never change, so there is
      no such thing as a conflict — which removes the hardest part of syncing
      entirely. Drafts stay on the device that is writing them.
   3. The server decides who sees what. The rules live in the database, so a
      mistake in this file cannot expose someone else's project.
   ========================================================================== */

const CLOUD = (() => {

  const URL  = 'https://rhudsvoxltnugkaceiuy.supabase.co';
  const KEY  = 'sb_publishable_JdcDqwmY_wOJpD5sQdKJuA_i9ddNFP6';
  const DOMAIN = 'wrm.internal';

  let sb = null;
  let profile = null;
  let channel = null;
  let onChange = () => {};

  function client(){
    if (!sb && window.supabase){
      sb = window.supabase.createClient(URL, KEY, {
        auth: { persistSession: true, autoRefreshToken: true, storageKey: 'sitecheck-auth' },
      });
    }
    return sb;
  }

  /* --- User ID and password ----------------------------------------------
     Supabase wants an email address. People on site have a User ID. So the
     address is generated from the User ID and never typed by anyone.

     The password is now the person's own, held by Supabase as a salted hash
     and never seen by this app or by a superuser.

     Until August 2026 it was not: a five-digit PIN was mixed with the User ID
     to make a password, which meant anyone who knew the scheme needed only
     five digits. legacyPassFor reproduces that so an account that has not
     been moved over yet can still get in once — see signIn.             */
  const emailFor = id => `${String(id).trim().toLowerCase()}@${DOMAIN}`;
  const legacyPassFor = (id, pin) => `${String(id).trim().toLowerCase()}#${pin}`;

  const validId = id => /^[A-Za-z0-9._-]{3,32}$/.test(String(id || '').trim());

  /* --- what makes an acceptable password ---------------------------------
     Length first, composition rules not at all. Insisting on a capital, a
     digit and a symbol produces Passw0rd! and a note on the hoarding; ten
     characters of anything is harder to guess and easier to remember. What
     is worth refusing is the handful of things people actually pick.

     This runs in the browser so the screen can say what is wrong as it is
     typed. It is NOT the enforcement — the same rules run again inside the
     admin-users function, where they cannot be skipped.

     Returns a sentence to show the person, or null if the password is fine. */
  const BANNED = [
    'password','passw0rd','pa55word','sitecheck','wrm','workplace','letmein',
    'welcome','qwerty','qwertyuiop','asdfgh','zxcvbn','iloveyou','monkey',
    'dragon','football','liverpool','manchester','arsenal','chelsea','rangers',
    'celtic','admin','changeme','trustno1','sunshine','princess','superman',
    'scaffold','hardhat','builder','construction',
  ];

  // Four or more characters running in order, up or down: 1234, 4321, abcd.
  function hasRun(s, len){
    let up = 1, down = 1;
    for (let i = 1; i < s.length; i++){
      const d = s.charCodeAt(i) - s.charCodeAt(i-1);
      up   = d ===  1 ? up + 1 : 1;
      down = d === -1 ? down + 1 : 1;
      if (up >= len || down >= len) return true;
    }
    return false;
  }

  function pwProblem(pw, userId){
    const p = String(pw == null ? '' : pw);
    if (!p) return 'Enter a password';
    if (p !== p.trim()) return 'It cannot start or end with a space';
    if (p.length < 10) return `At least 10 characters — ${p.length} so far`;
    if (p.length > 72) return 'That is too long — 72 characters at most';
    if (/^\d+$/.test(p)) return 'Not all numbers — that is only a longer PIN';

    const low = p.toLowerCase();
    const id  = String(userId || '').trim().toLowerCase();
    if (id.length >= 3 && low.includes(id)) return 'Do not put your User ID in it';

    const hit = BANNED.find(b => low.includes(b));
    if (hit) return `“${hit}” is one of the first things anyone would try`;

    /* What these two are for is aaaaaaaaaa and abababababab, not an honest run
       of words — "allsmalllettersok" has lll in it and is a perfectly good
       password. So this counts variety rather than banning a repeat. */
    if (new Set(low).size < 5) return 'Too few different characters — mix it up a bit more';
    if (/(.)\1{3,}/.test(p))   return 'Do not repeat one character four times over';
    if (hasRun(low, 4))        return 'Do not use a run like 1234 or abcd';
    return null;
  }

  /* A temporary password for a superuser to hand over. Three ordinary words
     and a number: long enough to pass the rules above, and short enough to
     read down the phone without spelling it out. It is temporary either way —
     the person is made to replace it the first time they sign in.        */
  const WORDS = ('timber gravel ladder beacon harbour kestrel meadow anvil copper ' +
    'bramble cobalt dovetail quarry thistle lantern granite willow mallet ' +
    'furlong pebble rafter saffron tundra walnut bracken cinder dapple ' +
    'elmwood flagon gantry hollow ingot jetty kindle lintel marlow nutmeg ' +
    'oakum parcel quiver ridge sorrel tiller upland vellum wicket yarrow').split(' ');

  function suggestPassword(){
    const r  = n => { const b = new Uint32Array(1); crypto.getRandomValues(b); return b[0] % n; };
    const w  = () => { const x = WORDS[r(WORDS.length)]; return x[0].toUpperCase() + x.slice(1); };
    const pick = [];
    while (pick.length < 3){ const x = w(); if (!pick.includes(x)) pick.push(x); }
    return pick.join('-') + '-' + (10 + r(90));
  }

  /* --- has this person set a password of their own? ----------------------
     Recorded against the Supabase login as pw_set_at, not in the profiles
     table, for one reason: a person can always write to their own login, so
     setting a password and clearing the flag happen in the same call and
     cannot come apart. No table permission is involved.

     Nobody had the mark before this change, so every account that still has
     a PIN-derived password is caught without anything having to be migrated. */
  const hasOwnPassword = u => !!(u && u.user_metadata && u.user_metadata.pw_set_at);
  let pwKnownGood = true;

  /* True when we know they are still on a PIN and can do something about it.
     Offline it stays false: there is no way to set a password with no signal,
     so blocking the app would strand someone on site for no gain. */
  const needsPassword = () => !pwKnownGood && navigator.onLine;

  /* --- signing in --------------------------------------------------------- */
  async function signIn(userId, password){
    const c = client();
    if (!c) throw new Error('offline');
    const email = emailFor(userId);

    let res = await c.auth.signInWithPassword({ email, password });
    let viaPin = false;

    /* Not moved over yet? Five digits may still be their old PIN. Accept it,
       but remember how they got in — afterLogin sends them straight to the
       password screen and nowhere else. */
    if (res.error && /^\d{5}$/.test(String(password || ''))){
      const retry = await c.auth.signInWithPassword({
        email, password: legacyPassFor(userId, password),
      });
      if (!retry.error){ res = retry; viaPin = true; }
    }
    if (res.error) throw res.error;

    const { data: p, error: pe } = await c.from('profiles')
      .select('*').eq('id', res.data.user.id).single();
    if (pe) throw new Error('Signed in, but no profile found. Ask a superuser to finish setting up this account.');
    if (!p.active) { await c.auth.signOut(); throw new Error('This account has been deactivated.'); }

    pwKnownGood = !viaPin && hasOwnPassword(res.data.user);
    await DB.set('pwOk', pwKnownGood);

    profile = p;
    await DB.set('profile', p);
    return p;
  }

  /* --- setting a password ------------------------------------------------
     The password and the mark are written in one call, so there is no state
     where one has happened and the other has not.

     currentPw is asked for when somebody is changing a working password of
     their own accord. It is not asked for on the forced screen, because they
     proved who they were seconds earlier to reach it.                    */
  async function changePassword(newPw, currentPw){
    const c = client(); if (!c) throw new Error('You need a connection');
    if (!profile) throw new Error('Not signed in');

    const problem = pwProblem(newPw, profile.user_id);
    if (problem) throw new Error(problem);

    if (currentPw != null){
      const check = await c.auth.signInWithPassword({
        email: emailFor(profile.user_id), password: currentPw,
      });
      if (check.error) throw new Error('That is not your current password');
    }

    const { error } = await c.auth.updateUser({
      password: newPw,
      data: { pw_set_at: new Date().toISOString() },
    });
    if (error){
      /* Supabase can be set to demand a freshly proved identity before a
         password changes. Somebody who has been signed in for weeks has not
         got one, and the message it returns says "reauthentication" — which
         means nothing to a site manager. Say what to do instead. */
      const m = String(error.message || '');
      if (/reauthenticat|nonce|session.*expired/i.test(m)){
        throw new Error('Sign out and sign back in, then change it — this has been left too long since you last signed in.');
      }
      /* Supabase enforces its own minimum length as well. Ours is longer, so
         this should be unreachable; if it ever fires, say it plainly. */
      if (/password/i.test(m) && /short|least|weak/i.test(m)) throw new Error(m);
      throw error;
    }

    pwKnownGood = true;
    await DB.set('pwOk', true);
  }

  async function signOut(){
    stopLive();
    profile = null;
    pwKnownGood = true;
    await DB.del('profile');
    await DB.del('pwOk');
    const c = client();
    if (c) try { await c.auth.signOut(); } catch(e){}
  }

  /* Restore whoever was last signed in. Works with no signal: the profile is
     cached on the device, so the app opens straight into their projects. */
  async function restore(){
    profile = await DB.get('profile');
    pwKnownGood = (await DB.get('pwOk')) !== false;
    const c = client();
    if (c && navigator.onLine){
      try {
        const { data } = await c.auth.getSession();
        if (!data.session) { profile = null; await DB.del('profile'); }
        else {
          /* Someone who was already signed in when this change went out has
             never seen the password screen. The session says whether they
             have set one, so they are caught here rather than at the login
             screen they are not going to visit. */
          pwKnownGood = hasOwnPassword(data.session.user);
          await DB.set('pwOk', pwKnownGood);
        }
      } catch(e){ /* offline or unreachable — keep the cached profile */ }
    }
    return profile;
  }

  const me = () => profile;
  const isSuper = () => !!profile && profile.role === 'superuser';
  const canMakeProjects = () => !!profile && ['superuser','manager'].includes(profile.role);

  /* --- projects ----------------------------------------------------------- */
  async function pullProjects(){
    const c = client(); if (!c) return null;
    const { data, error } = await c.from('projects')
      .select('*').eq('archived', false).order('created_at', { ascending: false });
    if (error) throw error;
    const list = (data || []).map(rowToProject);
    await DB.set('projects', list);
    return list;
  }

  const rowToProject = r => ({
    id: r.id, ref: r.ref, name: r.name, address: r.address || '', client: r.client || '',
    ownerId: r.owner_id, updatedAt: r.updated_at,
    inductionNotes: r.induction_notes || '',
    inductionDocs: Array.isArray(r.induction_docs) ? r.induction_docs : [],
    wrmSiteRef: r.wrm_site_ref || '',
  });

  async function saveProject(p){
    const row = {
      id: p.id, ref: p.ref, name: p.name, address: p.address || null,
      client: p.client || null, owner_id: p.ownerId || (profile && profile.id),
      induction_notes: p.inductionNotes || null,
      induction_docs: p.inductionDocs || [],
      wrm_site_ref: (p.wrmSiteRef || '').trim() || null,
      updated_at: new Date().toISOString(), updated_by: profile && profile.id,
    };
    const c = client();
    if (!c || !navigator.onLine){ await DB.queue({ kind:'project', row }); return { queued:true }; }
    const { error } = await c.from('projects').upsert(row);
    if (error){ await DB.queue({ kind:'project', row }); return { queued:true, error }; }
    return { queued:false };
  }

  /* --- records -----------------------------------------------------------
     Only signed records go up, and they go up once. The database refuses any
     later change, so a failed retry can never overwrite a good record.   */
  async function pushRecord(rec){
    const row = {
      id: rec.id, project_id: rec.projectId, form_id: rec.formId, code: rec.code,
      ref: rec.ref, title: rec.title, answers: rec.answers || {}, fails: rec.fails || 0,
      signature: rec.sig || null, signed_by: rec.by || null,
      signed_at: rec.at, created_by: profile && profile.id,
      device_id: await deviceId(),
    };
    const c = client();
    if (!c || !navigator.onLine){ await DB.queue({ kind:'record', row }); return { queued:true }; }
    const { error } = await c.from('records').insert(row);
    if (error){
      // 23505 is a duplicate key: it is already up there, which is fine
      if (error.code === '23505') return { queued:false, already:true };
      await DB.queue({ kind:'record', row });
      return { queued:true, error };
    }
    return { queued:false };
  }

  async function pullRecords(){
    const c = client(); if (!c) return null;
    const { data, error } = await c.from('records')
      .select('*').order('signed_at', { ascending: false }).limit(500);
    if (error) throw error;
    // A record made on this device carries a copy of its project, because the
    // PDF masthead and the record screen both need the name, reference and
    // address. One arriving from the server has to be given the same, or it
    // opens to a crash — which is exactly what happened the first time a
    // record written on another device was opened here.
    const projects = await DB.get('projects') || [];
    const byId = Object.fromEntries(projects.map(p => [p.id, p]));
    const list = (data || []).map(row => rowToRecord(row, byId[row.project_id]));
    await DB.putRecords(list);
    return list;
  }

  const rowToRecord = (r, project) => ({
    id: r.id, ref: r.ref, formId: r.form_id, code: r.code, title: r.title,
    at: r.signed_at || r.created_at, by: r.signed_by || '', fails: r.fails || 0,
    projectId: r.project_id, answers: r.answers || {}, sig: r.signature || '',
    createdBy: r.created_by, synced: 1,
    site: project
      ? { id: project.id, ref: project.ref, name: project.name,
          address: project.address || '', client: project.client || '' }
      : { ref: '', name: '', address: '', client: '' },
    via: r.submitted_via || null, viaName: r.submitted_name || null,
    pack: r.induction_pack || null,
  });

  /* --- the outbox --------------------------------------------------------- */
  /* Retrying forever is wrong. A network failure is worth retrying; a row the
     server rejects as malformed never will be, and hammering it just fills the
     console and burns battery. So anything rejected outright is set aside after
     three attempts and reported, rather than looping. */
  const PERMANENT = /^(22|23|42|PGRST)/;      // bad data, constraint or schema

  async function flush(){
    const c = client();
    if (!c || !navigator.onLine) return { sent:0, left:0, failed:0 };
    const jobs = await DB.pending();
    let sent = 0, failed = 0;

    for (const j of jobs){
      try {
        let error = null;
        if (j.kind === 'project'){ ({ error } = await c.from('projects').upsert(j.row)); }
        if (j.kind === 'record'){
          ({ error } = await c.from('records').insert(j.row));
          if (error && error.code === '23505') error = null;   // already up there
        }
        if (j.kind === 'document'){ ({ error } = await c.from('documents').insert(j.row)); }
        if (j.kind === 'portal'){
          try { await sendToPortal(j.row.record_id); }
          catch(e){ error = { message: e.message || String(e) }; }
        }

        if (!error){ await DB.done(j.seq); sent++; continue; }

        const permanent = error.code && PERMANENT.test(error.code);
        const tries = (j.tries || 0) + 1;
        if (permanent || tries >= 3){
          console.warn('giving up on a queued item:', j.kind, error.message);
          await DB.done(j.seq);
          await DB.set('rejected:' + j.seq, { job: j, error: error.message, at: Date.now() });
          failed++;
        } else {
          await DB.queue({ ...j, tries });
          await DB.done(j.seq);
        }
      } catch(e){ /* offline mid-flush; leave it and try again later */ }
    }
    const left = (await DB.pending()).length;
    return { sent, left, failed };
  }

  /* --- live updates ------------------------------------------------------
     What makes a record appear on someone else's screen without them doing
     anything. Costs nothing on the free plan and is the difference between a
     demo that lands and one that does not.                               */
  function startLive(cb){
    const c = client(); if (!c) return;
    onChange = cb || (() => {});
    stopLive();
    channel = c.channel('sitecheck-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'records' },
          p => onChange('records', p))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' },
          p => onChange('projects', p))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_shares' },
          p => onChange('shares', p))
      .subscribe();
  }
  function stopLive(){
    const c = client();
    if (channel && c){ try { c.removeChannel(channel); } catch(e){} }
    channel = null;
  }

  /* --- people ------------------------------------------------------------- */
  async function listUsers(){
    const c = client(); if (!c) return [];
    const { data, error } = await c.from('profiles').select('*').order('user_id');
    if (error) throw error;
    return data || [];
  }
  /* Creating a login goes through the admin-users function on Supabase, which
     holds the privileged key. The app never has it, so a superuser is the only
     one who can add accounts — enforced there, not here. */
  async function callAdmin(body){
    const c = client(); if (!c) throw new Error('You need a connection');
    const { data, error } = await c.functions.invoke('admin-users', { body });
    if (error){
      // the function returns a readable reason in the body; surface that
      let msg = error.message || 'Request failed';
      try { const j = await error.context.json(); if (j && j.error) msg = j.error; } catch(e){}
      throw new Error(msg);
    }
    if (data && data.error) throw new Error(data.error);
    return data;
  }

  const createUser  = (userId, password, fullName, email, role, sendWelcome) =>
    callAdmin({ action:'create', userId, password, fullName, email, role, sendWelcome:!!sendWelcome });
  /* A superuser can reset somebody to a temporary password but cannot read the
     one they are using — the function only writes. Resetting also clears the
     pw_set_at mark, so the person is made to choose again. */
  const setPassword = (id, userId, password) => callAdmin({ action:'setpassword', id, userId, password });
  const setActive   = (id, active)           => callAdmin({ action:'setactive', id, active });

  /* --- welcome email ------------------------------------------------------
     The wording lives in the database, not in this file, so it can be changed
     from inside the app without a deploy. Everything here just carries it
     back and forth. */
  const getEmailSettings  = ()          => callAdmin({ action:'settings' });
  const saveEmailSettings = (s)         => callAdmin({ action:'savesettings', ...s });
  const testEmail         = (s)         => callAdmin({ action:'testmail', ...s });
  const sendWelcome       = (id, userId, password) => callAdmin({ action:'welcome', id, userId, password });

  /* --- the client portal --------------------------------------------------
     Handing a signed record over to WRM's client portal. The app only ever
     names the record; the edge function does the rest, so the portal's token
     never exists on a device.                                             */
  async function sendToPortal(recordId){
    const c = client(); if (!c) throw new Error('You need a connection');
    const { data, error } = await c.functions.invoke('portal', { body:{ recordId } });
    if (error){
      let msg = error.message || 'Could not reach the portal';
      try { const j = await error.context.json(); if (j && j.error) msg = j.error; } catch(e){}
      throw new Error(msg);
    }
    return data;
  }

  async function portalStateFor(projectId){
    const c = client(); if (!c) return [];
    const { data, error } = await c.from('portal_deliveries')
      .select('*').eq('project_id', projectId);
    if (error) return [];
    return data || [];
  }

  async function saveProfile(p){
    const c = client(); if (!c) throw new Error('offline');
    const { error } = await c.from('profiles').upsert(p);
    if (error) throw error;
  }

  /* --- pre-arrival inductions and contractor RAMS -------------------------
     Contractors coming to site, and the one-time links sent to their people.
     The token is made here, in the browser, from the operating system's own
     random source — 32 bytes, which is far beyond guessing. */
  function makeToken(){
    const b = new Uint8Array(24);
    crypto.getRandomValues(b);
    return btoa(String.fromCharCode(...b)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }

  async function listContractors(projectId){
    const c = client(); if (!c) return [];
    const { data, error } = await c.from('contractors')
      .select('*').eq('project_id', projectId).order('name');
    if (error) throw error;
    return data || [];
  }
  async function saveContractor(row){
    const c = client(); if (!c) throw new Error('You need a connection');
    const { data, error } = await c.from('contractors').upsert(row).select();
    if (error) throw error;
    return (data || [])[0];
  }
  async function removeContractor(id){
    const c = client(); if (!c) throw new Error('You need a connection');
    const { error } = await c.from('contractors').delete().eq('id', id);
    if (error) throw error;
  }

  async function listInvites(projectId){
    const c = client(); if (!c) return [];
    const { data, error } = await c.from('invites')
      .select('*').eq('project_id', projectId).order('created_at', { ascending:false });
    if (error) throw error;
    return data || [];
  }
  async function createInvite(row){
    const c = client(); if (!c) throw new Error('You need a connection');
    const { data, error } = await c.from('invites')
      .insert(Object.assign({ token: makeToken(), created_by: profile && profile.id }, row))
      .select();
    if (error) throw error;
    return (data || [])[0];
  }
  async function updateInvite(id, patch){
    const c = client(); if (!c) throw new Error('You need a connection');
    const { error } = await c.from('invites').update(patch).eq('id', id);
    if (error) throw error;
  }

  /* --- sharing ------------------------------------------------------------ */
  async function listShares(projectId){
    const c = client(); if (!c) return [];
    const { data, error } = await c.from('project_shares')
      .select('*').eq('project_id', projectId);
    if (error) throw error;
    return data || [];
  }
  async function share(projectId, userId, canEdit = true){
    const c = client(); if (!c) throw new Error('offline');
    // A plain insert, ignoring anyone already shared with. An upsert would ask
    // the database for update rights it does not need here.
    const { error } = await c.from('project_shares')
      .upsert(
        { project_id: projectId, user_id: userId, can_edit: canEdit, shared_by: profile && profile.id },
        { onConflict: 'project_id,user_id', ignoreDuplicates: true },
      );
    if (error) throw error;
  }
  async function unshare(projectId, userId){
    const c = client(); if (!c) throw new Error('offline');
    const { error } = await c.from('project_shares')
      .delete().eq('project_id', projectId).eq('user_id', userId);
    if (error) throw error;
  }

  /* --- documents ---------------------------------------------------------- */
  async function uploadDocument(projectId, folder, file, recordId){
    const c = client(); if (!c || !navigator.onLine) throw new Error('You need a connection to upload');
    const safe = file.name.replace(/[^\w\-. ]+/g, '_');
    const path = `${projectId}/${Date.now()}-${safe}`;
    const { error: ue } = await c.storage.from('documents').upload(path, file, { upsert: false });
    if (ue) throw ue;
    const { error } = await c.from('documents').insert({
      project_id: projectId, record_id: recordId || null, folder,
      name: file.name, path, mime_type: file.type || null, size_bytes: file.size,
      uploaded_by: profile && profile.id,
    });
    if (error) throw error;
    return path;
  }
  async function listDocuments(projectId){
    const c = client(); if (!c) return [];
    const { data, error } = await c.from('documents')
      .select('*').eq('project_id', projectId).order('uploaded_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }
  async function documentUrl(path){
    const c = client(); if (!c) return null;
    const { data, error } = await c.storage.from('documents').createSignedUrl(path, 300);
    if (error) throw error;
    return data.signedUrl;
  }
  /* Moving is the usual fix for a misfiled document — better than deleting and
     uploading again, because the file itself never moves in storage. */
  async function moveDocument(id, folder){
    const c = client(); if (!c) throw new Error('You need a connection');
    const { error } = await c.from('documents').update({ folder }).eq('id', id);
    if (error) throw error;
  }

  async function deleteDocument(doc){
    const c = client(); if (!c) throw new Error('offline');
    await c.storage.from('documents').remove([doc.path]);
    const { error } = await c.from('documents').delete().eq('id', doc.id);
    if (error) throw error;
  }

  /* --- audit trail --------------------------------------------------------- */
  async function auditFor(projectId, limit = 100){
    const c = client(); if (!c) return [];
    const { data, error } = await c.from('audit_log')
      .select('*').eq('project_id', projectId)
      .order('changed_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return data || [];
  }

  /* --- this device --------------------------------------------------------- */
  async function deviceId(){
    let id = await DB.get('deviceId');
    if (!id){
      id = 'd-' + Math.random().toString(36).slice(2, 10);
      await DB.set('deviceId', id);
    }
    return id;
  }

  const online = () => navigator.onLine && !!client();

  return {
    client, emailFor, validId,
    pwProblem, suggestPassword, needsPassword, changePassword,
    signIn, signOut, restore, me, isSuper, canMakeProjects,
    pullProjects, saveProject, pushRecord, pullRecords, flush,
    startLive, stopLive,
    listUsers, saveProfile, createUser, setPassword, setActive,
    getEmailSettings, saveEmailSettings, testEmail, sendWelcome,
    listShares, share, unshare,
    listContractors, saveContractor, removeContractor,
    listInvites, createInvite, updateInvite, makeToken,
    // The manual induction fallback posts to the same public endpoint a
    // visitor's phone would, so one code path writes inductions rather than
    // two that can drift apart. The URL and the publishable key live in here,
    // so they are handed out rather than copied into the app.
    functionUrl: n => URL + '/functions/v1/' + n,
    publicKey: () => KEY,
    uploadDocument, listDocuments, documentUrl, deleteDocument, moveDocument,
    auditFor, deviceId, online,
    sendToPortal, portalStateFor,
  };
})();
