# NEX V2.0.37 — Sincronização automática (Firestore V3)

## Primeiro: regras do Firebase (obrigatório)

As regras publicadas no Firebase **não** são atualizadas automaticamente quando o arquivo do GitHub muda.

1. Abra [Firestore > Regras](https://console.firebase.google.com/project/nex-rpg/firestore/databases/-default-/rules).
2. Copie todo o conteúdo de [firestore.rules](https://github.com/iranpablo2-maker/NEX/blob/main/firestore.rules).
3. Substitua as regras atuais, clique em **Publicar** e aguarde o resultado.
4. Não libere acesso público. As regras restringem documentos ao UID autenticado.

## Como usar

1. No PC, abra o [NEX](https://iranpablo2-maker.github.io/NEX/?v=2037), entre com a conta Google e **baixe o backup completo** pelo menu Personagens.
2. Confira o indicador verde de nuvem. Na primeira vez o NEX envia automaticamente as fichas, campanhas e a biblioteca de homebrews.
3. Abra o mesmo NEX no celular e entre com a **mesma conta**. A coleção aparece automaticamente.
4. Novas edições e exclusões são sincronizadas sem precisar de um botão manual. Alterações feitas offline permanecem no armazenamento local e são enviadas ao reconectar.

## Como essa versão evita o erro anterior

- A sincronização nova usa a coleção `users/{uid}/nex_v3`, separada das cópias e dos conflitos do primeiro sincronizador (`characters`).
- Cada ficha tem um documento fixo `agent-<id>`; o nome não cria fichas extras.
- A exclusão usa registro `deleted=true`; a versão apagada não é reenviada pelo celular como personagem novo.
- Homebrews e campanhas têm documentos separados.
- Cada edição tem controle de versão por comparação do conteúdo anterior antes de gravar.
- Alterações incompatíveis não geram mais personagens automaticamente; a versão local conflitante é guardada no arquivo de recuperação do navegador, se houver espaço.
- Fichas locais permanecem disponíveis se o Firestore falhar.

## Limitações de segurança

- O site e as regras precisam estar publicados antes do teste. GitHub Pages pode demorar para propagar alterações.
- O Firestore limita o tamanho dos documentos. Fichas com retratos incorporados muito grandes poderão ficar apenas no dispositivo, com aviso.
- Alterações simultâneas à mesma ficha em aparelhos diferentes precisam de validação adicional; mantenha backups.
- A primeira conexão deve ser feita no PC que contém os dados principais. Conectar outro aparelho com fichas antigas do mesmo personagem pode gerar um conflito (guardado no arquivo de recuperação, não na lista de agentes).
- O histórico anterior no caminho `characters` continua intocado; é um arquivo legado. Não ative o sincronizador antigo.
