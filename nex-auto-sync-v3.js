/* NEX AutoSync V3 — sincronização sem duplicação e com exclusões persistentes.
 * Nova coleção users/{uid}/nex_v3, separada do legado.
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const status = $('nexAutoSyncStatus');
  if (!status || !window.NEX_FIREBASE_CONFIG) return;
  const setStatus = (text, error = false) => {
    status.textContent = text;
    status.style.color = error ? '#ffb6ba' : '#badacb';
  };
  const OWNER_KEY = 'nex_sync_v3_account';
  const ackKey = uid => 'nex_sync_v3_ack_' + uid;
  const archiveKey = uid => 'nex_sync_v3_recovery_' + uid;
  let fire, auth, db, currentUser = null, ack = {}, remote = {};
  let unsubscribe = null, timer = null, busy = false, ready = false, paused = false;
  let session = 0;

  // Hash de conteúdo: mudanças em ordem/propriedades não geram IDs novos.
  function hash(value) {
    const s = JSON.stringify(value);
    let a = 2166136261, b = 5381;
    for (let i = 0; i < s.length; i++) {
      a = Math.imul(a ^ s.charCodeAt(i), 16777619);
      b = Math.imul(b, 33) ^ s.charCodeAt(i);
    }
    return s.length + ':' + (a >>> 0).toString(16) + ':' + (b >>> 0).toString(16);
  }
  const clean = v => JSON.parse(JSON.stringify(v));
  const mark = value => value ? hash({deleted: !!value.deleted, payload: value.deleted ? {} : value.payload}) : null;
  const bridge = () => window.NEX_AUTO_BRIDGE;
  function localRecords() {
    const snap = bridge().read();
    const map = {};
    for (const agent of snap.agents) {
      if (!agent || typeof agent.id !== 'string' || !/^[A-Za-z0-9_-]{2,90}$/.test(agent.id) || !agent.data) continue;
      map['agent-' + agent.id] = {type:'agent',deleted:false,payload:{item: clean(agent)}};
    }
    map.campaigns = {type:'campaigns',deleted:false,payload:{items:clean(snap.campaigns)}};
    map.homebrew = {type:'homebrew',deleted:false,payload:{items:clean(snap.homebrew)}};
    return map;
  }
  function safeArchive(id, local, incoming) {
    const key = archiveKey(currentUser.uid);
    const previous = JSON.parse(localStorage.getItem(key) || '[]');
    previous.push({date:new Date().toISOString(), id, local:clean(local), remote:clean(incoming)});
    // Não sobrescrever versões conflitantes sem garantir o arquivo de recuperação.
    localStorage.setItem(key, JSON.stringify(previous.slice(-25)));
  }
  function persistAck() {
    try { localStorage.setItem(ackKey(currentUser.uid), JSON.stringify(ack)); }
    catch(err) { console.warn('NEX: falha em registrar revisão local',err); }
  }
  function schedule() {
    if (!ready || paused || !currentUser || timer) return;
    timer = setTimeout(() => { timer = null; void pushChanges(); }, 1000);
  }
  function messageError(err) {
    if (err?.code === 'permission-denied') return 'Firestore bloqueou o acesso. Publique as novas regras do GitHub para ativar a sincronização.';
    if (err?.code === 'resource-exhausted') return 'Limite do Firestore atingido. Salvamento local continua disponível.';
    if (err?.code === 'unavailable') return 'Sem conexão. Mudanças mantidas neste aparelho; a sincronização será retomada ao reconectar.';
    return 'Falha na nuvem: ' + String(err?.code || err?.message || err).slice(0,180) + '. Seus dados locais continuam salvos.';
  }
  async function pullSnapshot(querySnap) {
    if (!currentUser || paused || querySnap.metadata.fromCache) return;
    const mySession = session;
    try {
      if (!bridge()?.ready()) { setTimeout(() => void pullSnapshot(querySnap), 400); return; }
      const originalLocal = localRecords();
      const incoming = {};
      for (const d of querySnap.docs) {
        const v = d.data();
        if (!v || !['agent','campaigns','homebrew'].includes(v.type) || typeof v.deleted !== 'boolean' || !v.payload) continue;
        incoming[d.id] = {type:v.type,deleted:v.deleted,payload:clean(v.payload)};
      }
      const patch = [];
      for (const [id, entry] of Object.entries(incoming)) {
        if (id !== 'campaigns' && id !== 'homebrew' && !/^agent-[A-Za-z0-9_-]{2,90}$/.test(id)) continue;
        const fingerprint = mark(entry);
        const prior = Object.prototype.hasOwnProperty.call(ack,id) ? ack[id] : null;
        const local = originalLocal[id] || null;
        const localFingerprint = mark(local);
        if (fingerprint === prior) continue; // Alteração local ainda pendente.
        if (localFingerprint !== fingerprint) {
          if (local && localFingerprint !== prior && prior !== null) {
            safeArchive(id,local,entry);
          } else if (local && prior === null && !entry.deleted) {
            safeArchive(id,local,entry); // Primeiro acesso: conservar versão do PC.
          }
          patch.push({id,entry});
        }
        ack[id] = fingerprint;
      }
      if (mySession !== session) return;
      if (patch.length) bridge().apply(patch);
      remote = incoming;
      persistAck();
      ready = true;
      setStatus('☁ Conectado: fichas, homebrews e campanhas sincronizados automaticamente.');
      schedule();
    } catch(err) {
      paused = true;
      console.error('NEX: atualização da nuvem interrompida',err);
      setStatus('Sincronização pausada para proteger seus dados. ' + messageError(err), true);
    }
  }
  async function pushChanges() {
    if (!ready || busy || paused || !currentUser || !navigator.onLine) return;
    const mySession = session;
    busy = true;
    try {
      const local = localRecords();
      const ids = new Set([...Object.keys(local),...Object.keys(ack)]);
      const changes = [];
      for (const id of ids) {
        const current = local[id] || null;
        const expected = Object.prototype.hasOwnProperty.call(ack,id) ? ack[id] : null;
        const desired = current || (expected && expected !== mark({deleted:true,payload:{}})
          ? {type:id==='campaigns'?'campaigns':id==='homebrew'?'homebrew':'agent',deleted:true,payload:{}}
          : null);
        if (!desired || mark(desired) === expected) continue;
        changes.push({id,desired,expected});
      }
      if (!changes.length) {
        setStatus('☁ Tudo sincronizado: fichas, homebrews e campanhas.');
        return;
      }
      setStatus('☁ Enviando ' + changes.length + ' alteração(ões)...');
      const uid = currentUser.uid;
      for (const change of changes) {
        if (mySession !== session) return;
        const payload = clean(change.desired);
        const bytes = new TextEncoder().encode(JSON.stringify(payload)).length;
        if (bytes > 850000) {
          setStatus('Uma ficha ou biblioteca excede o tamanho permitido pelo Firestore. Os dados locais continuam salvos; reduza imagens grandes e faça backup.', true);
          continue;
        }
        const ref = fire.doc(db,'users',uid,'nex_v3',change.id);
        const result = await fire.runTransaction(db,async tx => {
          const previous = await tx.get(ref);
          const previousValue = previous.exists() ? previous.data() : null;
          const found = previousValue ? mark(previousValue) : null;
          if (found !== change.expected) return 'changed-remotely';
          tx.set(ref,{...payload,updatedAt:fire.serverTimestamp()});
          return 'written';
        });
        if (result === 'changed-remotely') {
          // Não sobrescrever outra versão: nova leitura resolverá o conflito.
          const latest = await fire.getDocsFromServer(fire.collection(db,'users',uid,'nex_v3'));
          await pullSnapshot(latest);
          continue;
        }
      }
    } catch(err) {
      console.error('NEX: falha ao enviar mudanças',err);
      setStatus(messageError(err),true);
    } finally {
      busy = false;
    }
  }
  window.addEventListener('nex-auto-local-change',schedule);
  window.addEventListener('online',schedule);
  document.addEventListener('visibilitychange',() => {if (!document.hidden) schedule();});
  (async () => {
    try {
      const [appSDK,authSDK,fireSDK] = await Promise.all([
        import('https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js')
      ]);
      fire = fireSDK;
      const app = appSDK.getApps().length ? appSDK.getApp() : appSDK.initializeApp(window.NEX_FIREBASE_CONFIG);
      auth = authSDK.getAuth(app); db = fire.getFirestore(app);
      authSDK.onAuthStateChanged(auth,u => {
        session++;
        if (unsubscribe) {unsubscribe();unsubscribe=null;}
        if (timer) {clearTimeout(timer);timer=null;}
        currentUser = u; ready=false; paused=false; busy=false; remote={}; ack={};
        if (!u) {setStatus('Entre com Google para sincronizar automaticamente suas fichas, homebrews e campanhas.');return;}
        const owner = localStorage.getItem(OWNER_KEY);
        if (owner && owner !== u.uid) {
          paused=true;
          setStatus('Este navegador pertence a outra conta Google. Faça backup antes de mudar de conta; sincronização bloqueada para evitar mistura de fichas.',true);
          return;
        }
        try { ack = JSON.parse(localStorage.getItem(ackKey(u.uid)) || '{}'); } catch { ack = {}; }
        setStatus('☁ Conectando à conta Google e verificando as fichas...');
        unsubscribe=fire.onSnapshot(fire.collection(db,'users',u.uid,'nex_v3'),
          {includeMetadataChanges:true},
          snapshot => {
            if (!currentUser || currentUser.uid!==u.uid) return;
            if (!snapshot.metadata.fromCache) {
              if (!localStorage.getItem(OWNER_KEY)) localStorage.setItem(OWNER_KEY,u.uid);
              void pullSnapshot(snapshot);
            }
          },
          err => {paused=true;setStatus(messageError(err),true);}
        );
      });
    } catch(err) {
      console.error('NEX AutoSync initialization',err);
      setStatus('Não foi possível iniciar sincronização. O salvamento local continua disponível.',true);
    }
  })();
})();
