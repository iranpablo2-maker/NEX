# NEX — Sincronização de fichas PC ↔ celular

## Antes de começar (obrigatório)

1. No Firebase Console do projeto **NEX RPG**, abra **Criação > Firestore Database** ou **Bancos de dados > Firestore Database**.
2. Clique em **Criar banco de dados**, selecione a região desejada e escolha **modo de produção** (não use regras públicas de teste).
3. Em **Firestore Database > Regras**, substitua o conteúdo pelas regras do arquivo **`firestore.rules`** deste repositório.
4. Clique em **Publicar**. As regras permitem que somente o usuário autenticado leia e altere suas fichas.
5. Em **Authentication**, mantenha **Google** habilitado e o domínio `iranpablo2-maker.github.io` autorizado.

## Como levar as fichas do computador para o celular

1. No computador, abra o NEX, entre com Google e clique em **Ativar sincronização**.
2. **Antes do primeiro envio, baixe um backup de todas as fichas.** Este passo não apaga suas fichas locais.
3. Espere aparecer **Sincronizado**. O NEX enviará as fichas ao Firestore por conta Google.
4. No celular, abra o mesmo endereço HTTPS do NEX, entre com a **mesma conta Google** e clique em **Ativar sincronização**.
5. O NEX baixará as fichas e fará o merge com as fichas locais, preservando dados existentes. Depois, ele tenta enviar as alterações feitas em cada dispositivo automaticamente enquanto estiver online.
6. Se necessário, use **Sincronizar agora** para forçar a atualização entre dispositivos.

## Observações

- A sincronização é opcional e vinculada à conta Google. Quem não ativar continua usando o salvamento local normal.
- Fichas com retratos grandes podem ultrapassar o limite de tamanho de documento do Firestore e serão mantidas localmente, com aviso.
- Em caso de conflito, o NEX preserva uma cópia adicional da versão divergente com um nome indicando conflito.
- Excluir uma ficha local **não a exclui da nuvem** nesta primeira versão: ela pode reaparecer ao sincronizar. Isso evita perdas acidentais.
- O banco de dados guarda fichas privadas por UID; **nunca** configure regras `allow read, write: if true`.
- O GitHub Pages só hospeda o site. O Firebase Auth autentica usuários e o Cloud Firestore sincroniza as fichas.
- Não inclua tokens, senhas ou credenciais de administrador em repositórios públicos. `firebaseConfig` é a configuração pública do cliente.
