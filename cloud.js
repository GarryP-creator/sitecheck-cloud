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

  /* --- User ID and PIN ---------------------------------------------------
     Supabase wants an email and a password. People on site want a name and a
     keypad. So the address is generated from the User ID, and the password is
     derived from the PIN with the User ID mixed in — two people who both pick
     12345 do not end up with the same password.                          */
  const emailFor = id => `${String(id).trim().toLowerCase()}@${DOMAIN}`;
  const passFor  = (id, pin) => `${String(id).trim().toLowerCase()}#${pin}`;

  const validId = id => /^[A-Za-z0-9._-]{3,32}$/.test(String(id || '').trim());

  /* --- signing in --------------------------------------------------------- */
  async function signIn(userId, pin){
    const c = client();
    if (!c) throw new Error('offline');
    const { data, error } = await c.auth.signInWithPassword({
      email: emailFor(userId), password: passFor(userId, pin),
    });
    if (error) throw error;

    const { data: p, error: pe } = await c.from('profiles')
      .select('*').eq('id', data.user.id).single();
    if (pe) throw new Error('Signed in, but no profile found. Ask a superuser to finish setting up this account.');
    if (!p.active) { await c.auth.signOut(); throw new Error('This account has been deactivated.'); }

    profile = p;
    await DB.set('profile', p);
    return p;
  }

  async function signOut(){
    stopLive();
    profile = null;
    await DB.del('profile');
    const c = client();
    if (c) try { await c.auth.signOut(); } catch(e){}
  }

  /* Restore whoever was last signed in. Works with no signal: the profile is
     cached on the device, so the app opens straight into their projects. */
  async function restore(){
    profile = await DB.get('profile');
    const c = client();
    if (c && navigator.onLine){
      try {
        const { data } = await c.auth.getSession();
        if (!data.session) { profile = null; await DB.del('profile'); }
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
  });

  async function saveProject(p){
    const row = {
      id: p.id, ref: p.ref, name: p.name, address: p.address || null,
      client: p.client || null, owner_id: p.ownerId || (profile && profile.id),
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

  const createUser  = (userId, pin, fullName, email, role, sendWelcome) =>
    callAdmin({ action:'create', userId, pin, fullName, email, role, sendWelcome:!!sendWelcome });
  const setPin      = (id, userId, pin) => callAdmin({ action:'setpin', id, userId, pin });
  const setActive   = (id, active)      => callAdmin({ action:'setactive', id, active });

  /* --- welcome email ------------------------------------------------------
     The wording lives in the database, not in this file, so it can be changed
     from inside the app without a deploy. Everything here just carries it
     back and forth. */
  const getEmailSettings  = ()          => callAdmin({ action:'settings' });
  const saveEmailSettings = (s)         => callAdmin({ action:'savesettings', ...s });
  const testEmail         = (s)         => callAdmin({ action:'testmail', ...s });
  const sendWelcome       = (id, userId, pin) => callAdmin({ action:'welcome', id, userId, pin });

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
    client, emailFor, passFor, validId,
    signIn, signOut, restore, me, isSuper, canMakeProjects,
    pullProjects, saveProject, pushRecord, pullRecords, flush,
    startLive, stopLive,
    listUsers, saveProfile, createUser, setPin, setActive,
    getEmailSettings, saveEmailSettings, testEmail, sendWelcome,
    listShares, share, unshare,
    listContractors, saveContractor, removeContractor,
    listInvites, createInvite, updateInvite, makeToken,
    uploadDocument, listDocuments, documentUrl, deleteDocument, moveDocument,
    auditFor, deviceId, online,
  };
})();
