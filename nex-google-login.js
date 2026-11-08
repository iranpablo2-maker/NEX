/* NEX: autenticação opcional com Google. Nunca modifica fichas ou armazenamento local. */
(() => {
  'use strict';
  const button = document.getElementById('nexGoogleLogin');
  const name = document.getElementById('nexGoogleIdentity');
  const status = document.getElementById('nexGoogleStatus');
  if (!button || !name || !status) return;
  const config = window.NEX_FIREBASE_CONFIG;
  let auth, logout, popup, provider;
  const message = msg => { status.textContent = msg; };
  function identity(user) {
    name.hidden = !user;
    name.textContent = user ? (user.displayName || user.email || 'Conta Google') : '';
    button.textContent = user ? 'Sair da conta' : 'Entrar com Google';
  }
  if (!config || !config.apiKey || !config.authDomain || !config.projectId || !config.appId) {
    message('Login Google em preparação. As fichas continuam salvas neste navegador.');
    button.addEventListener('click', () => message('Configure seu aplicativo Web no arquivo firebase-config.js para ativar o Google.'));
    return;
  }
  button.disabled = true;
  message('Inicializando login Google…');
  (async () => {
    try {
      const [{initializeApp}, sdk] = await Promise.all([
        import('https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js')
      ]);
      const app = initializeApp(config);
      auth = sdk.getAuth(app);
      provider = new sdk.GoogleAuthProvider();
      logout = sdk.signOut; popup = sdk.signInWithPopup;
      await sdk.setPersistence(auth, sdk.browserLocalPersistence);
      sdk.onAuthStateChanged(auth, user => {
        identity(user);
        message(user ? 'Conta Google conectada. Fichas ainda salvas localmente.' : 'Conta desconectada. As fichas locais permanecem disponíveis.');
        button.disabled = false;
      }, err => {
        button.disabled = false;
        message('Erro de autenticação: ' + (err.code || 'desconhecido'));
      });
    } catch (err) {
      button.disabled = true;
      message('Firebase não carregou. Confira o projeto e sua conexão.');
      console.error('NEX: erro ao iniciar Firebase', err);
    }
  })();
  button.addEventListener('click', async () => {
    if (!auth || button.disabled) return;
    button.disabled = true;
    try {
      if (auth.currentUser) await logout(auth);
      else await popup(auth, provider);
    } catch(err) {
      const descriptions = {
        'auth/popup-closed-by-user':'Login cancelado.',
        'auth/popup-blocked':'Permita pop-ups para entrar com Google.',
        'auth/unauthorized-domain':'Autorize iranpablo2-maker.github.io no Firebase Authentication.',
        'auth/operation-not-allowed':'Ative o provedor Google no Firebase Authentication.'
      };
      message(descriptions[err.code] || 'Erro no login Google: ' + (err.code || 'desconhecido'));
      console.error('NEX Google login:', err);
    } finally { button.disabled = false; }
  });
})();
