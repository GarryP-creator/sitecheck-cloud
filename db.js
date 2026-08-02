/* ============================================================================
   SiteCheck — local storage

   Everything is written to the device first and synced afterwards. That order
   matters: a form filled in a basement with no signal must survive the app
   being closed, the battery dying, or the phone being locked for an hour.

   IndexedDB rather than localStorage because localStorage caps out around 5MB
   and holds only strings — photos and signed PDFs would fill it and start
   failing silently, which is the worst possible failure for a compliance
   record.

   Three stores:
     kv       settings, session, drafts
     records  completed forms, whether or not they have reached the server
     outbox   changes waiting to go up
   ========================================================================== */

const DB = (() => {
  const NAME = 'sitecheck';
  const VERSION = 1;
  let db = null;

  function open(){
    if (db) return Promise.resolve(db);
    return new Promise((res, rej) => {
      const req = indexedDB.open(NAME, VERSION);
      req.onupgradeneeded = e => {
        const d = e.target.result;
        if (!d.objectStoreNames.contains('kv'))      d.createObjectStore('kv');
        if (!d.objectStoreNames.contains('records')) {
          const s = d.createObjectStore('records', { keyPath: 'id' });
          s.createIndex('project', 'projectId');
          s.createIndex('synced', 'synced');
        }
        if (!d.objectStoreNames.contains('outbox')) {
          d.createObjectStore('outbox', { keyPath: 'seq', autoIncrement: true });
        }
      };
      req.onsuccess = () => { db = req.result; res(db); };
      req.onerror = () => rej(req.error);
    });
  }

  function tx(store, mode, fn){
    return open().then(d => new Promise((res, rej) => {
      const t = d.transaction(store, mode);
      const s = t.objectStore(store);
      let out;
      const r = fn(s);
      if (r) r.onsuccess = () => { out = r.result; };
      t.oncomplete = () => res(out);
      t.onerror = () => rej(t.error);
      t.onabort = () => rej(t.error);
    }));
  }

  /* --- key / value ------------------------------------------------------- */
  const get = k => tx('kv', 'readonly', s => s.get(k)).then(v => v === undefined ? null : v);
  const set = (k, v) => tx('kv', 'readwrite', s => s.put(v, k)).then(() => true);
  const del = k => tx('kv', 'readwrite', s => s.delete(k)).then(() => true);

  /* --- records ----------------------------------------------------------- */
  const putRecord  = r => tx('records', 'readwrite', s => s.put(r)).then(() => r);
  const getRecord  = id => tx('records', 'readonly', s => s.get(id));
  const allRecords = () => tx('records', 'readonly', s => s.getAll()).then(a => a || []);
  const delRecord  = id => tx('records', 'readwrite', s => s.delete(id));

  async function putRecords(list){
    const d = await open();
    return new Promise((res, rej) => {
      const t = d.transaction('records', 'readwrite');
      const s = t.objectStore('records');
      list.forEach(r => s.put(r));
      t.oncomplete = () => res(list.length);
      t.onerror = () => rej(t.error);
    });
  }

  /* --- outbox ------------------------------------------------------------ */
  const queue    = job => tx('outbox', 'readwrite', s => s.add({ ...job, at: Date.now() }));
  const pending  = () => tx('outbox', 'readonly', s => s.getAll()).then(a => a || []);
  const done     = seq => tx('outbox', 'readwrite', s => s.delete(seq));
  const clearBox = () => tx('outbox', 'readwrite', s => s.clear());

  /* --- how much room is left --------------------------------------------
     Worth surfacing: a site phone quietly running out of space is how
     records get lost.                                                     */
  async function usage(){
    if (!navigator.storage || !navigator.storage.estimate) return null;
    const e = await navigator.storage.estimate();
    return { used: e.usage || 0, quota: e.quota || 0,
             pct: e.quota ? Math.round((e.usage / e.quota) * 100) : 0 };
  }

  /* --- moving off the old localStorage version --------------------------- */
  async function migrate(){
    if (await get('migrated')) return { moved: 0, already: true };
    let moved = 0;
    try {
      const site     = JSON.parse(localStorage.getItem('wrm:site')     || 'null');
      const projects = JSON.parse(localStorage.getItem('wrm:projects') || 'null');
      const records  = JSON.parse(localStorage.getItem('wrm:records')  || 'null');
      const refseq   = JSON.parse(localStorage.getItem('wrm:refseq')   || 'null');

      if (projects && projects.length){ await set('projects', projects); moved += projects.length; }
      else if (site && site.name){ await set('projects', [{ ...site, id: 'p' + Date.now() }]); moved++; }
      if (refseq) await set('refseq', refseq);

      if (records && records.length){
        await putRecords(records.map(r => ({ ...r, synced: 0, local: true })));
        moved += records.length;
      }
    } catch(e){ console.warn('migration skipped:', e); }
    await set('migrated', true);
    return { moved, already: false };
  }

  return { open, get, set, del,
           putRecord, getRecord, allRecords, delRecord, putRecords,
           queue, pending, done, clearBox, usage, migrate };
})();

if (typeof module !== 'undefined') module.exports = DB;
