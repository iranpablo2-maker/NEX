# Campanhas Online do NEX — ativação

O NEX mantém as fichas e campanhas locais existentes. A página `multiplayer.html` é uma **primeira versão separada** para campanhas online. Ela ainda não substitui nem sincroniza automaticamente a ficha completa do site principal.

## Permissões

- Todos os participantes **autorizados pelo mestre** podem ver todas as fichas da campanha.
- **Somente o dono da ficha e o mestre** podem criá-la/alterá-la, respeitando o proprietário.
- Outros jogadores não podem alterar a ficha nem transferir sua propriedade.
- Notas do mestre devem ser mantidas em `masterNotes`, nunca na seção de fichas visíveis.
- O controle de acesso é realizado pelas regras do Firestore, e não apenas por botões ocultos.

## O que falta para ativar

1. Crie (ou use) um projeto em [Firebase Console](https://console.firebase.google.com/).
2. Adicione um aplicativo **Web** e copie exclusivamente o objeto público `firebaseConfig` para `nex-firebase-config.js`, no campo `window.NEX_FIREBASE_CONFIG`.
3. Em **Authentication > Sign-in method**, ative o provedor **Email/Senha**.
4. Crie o banco **Cloud Firestore**. Em **Firestore > Rules**, copie o conteúdo de `firestore.rules` do repositório e **publique** as regras. Não habilite modo de teste com leitura e gravação pública.
5. Em **Authentication > Settings > Authorized domains**, autorize `iranpablo2-maker.github.io`, se ainda não estiver na lista.
6. Atualize o GitHub Pages e acesse `multiplayer.html`.

> Somente modificar `firestore.rules` no GitHub **não publica** regras no Firebase. É necessário implantá-las no projeto Firebase. Sem isso, a interface online permanece desativada ou as solicitações são rejeitadas.

## Como jogar

1. Mestre e jogadores criam contas separadas usando e-mail e senha. **Nunca compartilhe senhas.**
2. O mestre cria uma campanha. O NEX fornece um código de campanha.
3. Cada jogador usa **Copiar meu ID** para enviar seu identificador ao mestre.
4. O mestre escolhe **Autorizar jogador** e informa o ID do participante.
5. O jogador abre a sala usando o código da campanha.
6. Participantes autorizados podem visualizar todas as fichas; os botões de edição aparecem somente para o proprietário e para o mestre. O servidor também rejeita gravações indevidas.

## Escopo da primeira versão

A primeira versão online permite compartilhar nome, NEX, PV, PE, SAN e anotações, com sincronização em tempo real. Ainda **não** inclui a ficha completa local, dados de rolagem, inventário, rituais, trilhas ou uma migração automática. Esses recursos podem ser integrados em outra etapa, após ativar o banco e testar as permissões.

## Segurança e privacidade

- IDs de conta não são senhas.
- O código da campanha **não concede acesso sozinho**: o mestre precisa autorizar cada conta.
- Não inclua dados pessoais sensíveis nas fichas ou anotações visíveis para todos os participantes.
- **Teste as regras do Firestore antes de convidar pessoas:** jogador A pode ler a ficha B, mas não pode alterá-la; dono B e mestre podem editar; um desconhecido não pode ler a campanha.
- O acesso não depende de uma senha administrativa guardada no navegador: a função de mestre é associada à conta autenticada e protegida pelas regras.

## Arquivos

- `multiplayer.html` — interface online.
- `nex-firebase-config.js` — configuração pública do app Web, inicialmente vazia.
- `firestore.rules` — regras do Firestore, incluindo as regras legadas para dados de usuários.

O site principal continua funcionando sem Firebase.
