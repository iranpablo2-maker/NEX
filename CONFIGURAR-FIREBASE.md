# NEX — Como ativar o login Google

O login foi adicionado ao site, mas fica **desativado até você configurar seu próprio Firebase**. O salvamento existente continua local e automático.

1. Entre em https://console.firebase.google.com/ e crie ou abra o projeto NEX.
2. Em **Configurações do projeto > Seus aplicativos**, crie um **aplicativo Web** e copie o objeto `firebaseConfig`.
3. Em **Authentication > Sign-in method**, habilite **Google** e configure o e-mail de suporte.
4. Em **Authentication > Settings > Authorized domains**, adicione `iranpablo2-maker.github.io`.
5. Abra `firebase-config.js` e substitua `null` pelo objeto público `firebaseConfig` do seu aplicativo Web. **Nunca coloque chave privada, conta de serviço, token ou senha.**
6. Abra https://iranpablo2-maker.github.io/NEX/ e teste o botão **Entrar com Google**.

## Preservação das fichas

Esta versão **não apaga, mistura, envia nem sincroniza** fichas. O login apenas autentica a conta Google. As fichas existentes seguem no navegador. Faça backup dos personagens antes de atualizar.

Para sincronização entre aparelhos, o próximo passo será configurar Firestore **com regras que garantam acesso apenas do dono** (UID autenticado), adicionar exportação/migração confirmada pelo usuário e testar sem sobrescrever fichas.
