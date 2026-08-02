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
    const list = (data || []).map(rowToRecord);
    await DB.putRecords(list);
    return list;
  }

  const rowToRecord = r => ({
    id: r.id, ref: r.ref, formId: r.form_id, code: r.code, title: r.title,
    at: r.signed_at || r.created_at, by: r.signed_by || '', fails: r.fails || 0,
    projectId: r.project_id, answers: r.answers || {}, sig: r.signature || '',
    createdBy: r.created_by, synced: 1,
  });

  /* --- the outbox --------------------------------------------------------- */
  async function flush(){
    const c = client();
    if (!c || !navigator.onLine) return { sent:0, left:0 };
    const jobs = await DB.pending();
    let sent = 0;
    for (const j of jobs){
      try {
        let error = null;
        if (j.kind === 'project'){ ({ error } = await c.from('projects').upsert(j.row)); }
        if (j.kind === 'record'){
          ({ error } = await c.from('records').insert(j.row));
          if (error && error.code === '23505') error = null;   // already there
        }
        if (j.kind === 'document'){ ({ error } = await c.from('documents').insert(j.row)); }
        if (!error){ await DB.done(j.seq); sent++; }
      } catch(e){ /* leave it queued and try again later */ }
    }
    const left = (await DB.pending()).length;
    return { sent, left };
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
  async function saveProfile(p){
    const c = client(); if (!c) throw new Error('offline');
    const { error } = await c.from('profiles').upsert(p);
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
    const { error } = await c.from('project_shares').upsert({
      project_id: projectId, user_id: userId, can_edit: canEdit, shared_by: profile && profile.id,
    });
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
    listUsers, saveProfile,
    listShares, share, unshare,
    uploadDocument, listDocuments, documentUrl, deleteDocument,
    auditFor, deviceId, online,
  };
})();
