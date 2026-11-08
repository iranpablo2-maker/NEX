/* NEX CLOUD v1 — sincronização opt-in por conta Google.
 * Mantém a persistência local inalterada e NÃO apaga fichas na nuvem.
 * Requer regras privadas publicadas em Cloud Firestore.
 */
(() => {
  'use strict';
  // V2.0.33 proteção: sincronização pausada para evitar replicação de conflitos.
  // NÃO lê, envia, exclui nem modifica fichas locais ou remotas.
  const pauseStatus=document.getElementById('nexCloudStatus');
  const pauseEnable=document.getElementById('nexCloudEnable');
  const pauseSync=document.getElementById('nexCloudSync');
  if(pauseEnable){pauseEnable.disabled=true;pauseEnable.textContent='Sincronização pausada';}
  if(pauseSync)pauseSync.disabled=true;
  if(pauseStatus)pauseStatus.textContent='Sincronização temporariamente pausada para proteger suas fichas. Baixe um backup completo antes de qualquer limpeza.';
  return;
  const $ = id => document.getElementById(id);
  const enable = $('nexCloudEnable');
  const syncButton = $('nexCloudSync');
  const status = $('nexCloudStatus');
  if (!enable || !syncButton || !status) return;
  const config = window.NEX_FIREBASE_CONFIG;
  if (!config || !config.apiKey || !config.projectId) {
    status.textContent = 'Conecte o Firebase para ativar a sincronização.';
    enable.disabled = true;
    return;
  }
  let user = null, db = null, sdk = null, syncing = false, active = false, timer = null;
  const enabledKey = uid => 'nex_cloud_sync_enabled_' + uid;
  const ownerKey = 'nex_cloud_local_owner_uid_v1';
  function wrongAccount(){
    try { const owner=localStorage.getItem(ownerKey);return !!(user && owner && owner!==user.uid); }
    catch { return false; }
  }
  const txt = value => { status.textContent = value; };
  const bridge = () => window.NEX_CLOUD_BRIDGE;
  const waitReady = () => new Promise((resolve, reject) => {
    const started = Date.now();
    function check() {
      if (bridge()?.ready()) return resolve();
      if (Date.now() - started > 15000) return reject(new Error('A ficha local ainda não está pronta.'));
      setTimeout(check, 150);
    }
    check();
  });
  const valid = a => a && typeof a.id === 'string' && /^[a-zA-Z0-9_-]{2,90}$/.test(a.id)
    && a.data && typeof a.data === 'object' && !Array.isArray(a.data);
  function accountUi() {
    enable.disabled = !user || syncing || wrongAccount();
    syncButton.disabled = !user || !active || syncing || wrongAccount();
    enable.textContent = active ? 'Sincronização ativada' : 'Ativar sincronização';
    if (user && !active) txt('Conectado. Ative para levar suas fichas do PC ao celular.');
    if (!user) txt('Entre com Google para sincronizar suas fichas.');
    if (wrongAccount()) txt('Este navegador já está vinculado a outra conta Google. Por segurança, a sincronização está bloqueada; faça um backup antes de trocar a conta.');
  }
  const isEnabled = () => user && localStorage.getItem(enabledKey(user.uid)) === '1';
  function errorMessage(err) {
    if (err?.code === 'permission-denied') return 'Acesso negado pelo Firestore. Publique as regras privadas antes de sincronizar.';
    if (err?.code === 'unavailable') return 'Sem conexão com o Firestore. Suas fichas locais foram preservadas.';
    if (err?.code === 'resource-exhausted') return 'Limite do Firestore atingido. Suas fichas locais estão preservadas.';
    return 'Erro de sincronização (' + (err?.code || err?.message || 'desconhecido') + '). As fichas locais continuam salvas.';
  }
  function schedule() {
    if (!active || !user || timer) return;
    timer = setTimeout(() => { timer = null; void synchronize(false); }, 1800);
  }
  async function synchronize(manual) {
    if (syncing || !user || !active || !sdk || !db || wrongAccount()) return;
    syncing = true;
    accountUi();
    const uid = user.uid;
    try {
      await waitReady();
      const b = bridge();
      if (!b) throw new Error('Não foi possível acessar as fichas locais.');
      const coll = sdk.collection(db, 'users', uid, 'characters');
      txt('Buscando fichas da conta Google...');
      // Releitura do servidor antes de gravar: impede a sobrescrita cega
      // de fichas criadas em outro dispositivo.
      const remoteSnapshot = await sdk.getDocsFromServer(coll);
      if (!user || user.uid !== uid) return;
      const remote = remoteSnapshot.docs.map(d => d.data()).filter(valid);
      const result = b.merge(remote);
      const all = b.snapshot();
      if (!Array.isArray(all)) throw new Error('Não foi possível ler as fichas locais.');
      let sent = 0, skipped = 0;
      for (const entry of all) {
        if (!valid(entry)) continue;
        const payload = {
          id: entry.id,
          data: JSON.parse(JSON.stringify(entry.data)),
          createdAt: entry.createdAt || new Date().toISOString(),
          updatedAt: entry.updatedAt || entry.createdAt || new Date().toISOString(),
          format: 'nex-character-v1'
        };
        // O Firestore permite até ~1 MiB por documento. Evita sobrescrever
        // a cópia local quando uma foto em base64 torna a ficha grande.
        const bytes = new TextEncoder().encode(JSON.stringify(payload)).length;
        if (bytes > 900000) { skipped++; continue; }
        const ref = sdk.doc(coll, entry.id);
        await sdk.runTransaction(db, async tx => {
          const existing = await tx.get(ref);
          if (existing.exists()) {
            const prior = existing.data();
            if (JSON.stringify(prior.data) === JSON.stringify(payload.data)) return;
            if (Date.parse(prior.updatedAt) > Date.parse(payload.updatedAt)) return;
          }
          tx.set(ref, payload);
          sent++;
        });
      }
      if (!user || user.uid !== uid) return;
      const count = all.filter(valid).length;
      txt('Sincronizado: ' + count + ' ficha(s) · ' + sent + ' atualização(ões)' +
        (result.conflicts ? ' · ' + result.conflicts + ' cópia(s) de conflito preservada(s)' : '') +
        (skipped ? ' · ' + skipped + ' ficha(s) grande(s) somente no navegador' : '') + '.');
    } catch(err) {
      console.error('NEX Cloud:', err);
      txt(errorMessage(err));
    } finally {
      syncing = false;
      accountUi();
    }
  }
  enable.addEventListener('click', async () => {
    if (!user || syncing || active || wrongAccount()) return;
    if (!confirm('Antes de ativar, baixe um backup de todas as fichas no menu Personagens. A sincronização enviará suas fichas para sua conta Google. Continuar?')) return;
    try {
      localStorage.setItem(ownerKey, user.uid);
      localStorage.setItem(enabledKey(user.uid), '1');
      active = true;
      accountUi();
      await synchronize(true);
    } catch(err) { txt('Não foi possível ativar a sincronização neste navegador.'); }
  });
  syncButton.addEventListener('click', () => void synchronize(true));
  window.addEventListener('nex-local-changed', schedule);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && active) schedule(); });
  window.addEventListener('online', () => { if (active) schedule(); });
  (async () => {
    try {
      const [{initializeApp, getApp, getApps}, {getAuth, onAuthStateChanged}, fire] = await Promise.all([
        import('https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js')
      ]);
      sdk = fire;
      const app = getApps().length ? getApp() : initializeApp(config);
      db = fire.getFirestore(app);
      onAuthStateChanged(getAuth(app), nextUser => {
        user = nextUser;
        try { active = !wrongAccount() && !!isEnabled(); } catch { active = false; }
        accountUi();
        if (active) schedule();
      });
    } catch(err) {
      console.error('NEX Cloud initialization:', err);
      txt('Firestore não carregou. As fichas continuam salvas neste navegador.');
    }
  })();
})();
