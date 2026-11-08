# NEX 2.0.41 — Proteção da sincronização na nuvem

Esta atualização **continua usando Firebase Authentication + Cloud Firestore já presentes no NEX 2.0.40**. Não migra para Supabase e não troca a estrutura das fichas.

## Alterações
- Quando duas cópias da mesma ficha, campanha ou biblioteca homebrew divergem, o sincronizador agora **não substitui automaticamente a cópia local**.
- Um registro com ambas as versões é salvo no armazenamento de recuperação deste navegador; se isso não for possível, o sincronizador interrompe a operação.
- Diante de conflito, a sincronização é pausada; isso evita uma cascata de sobrescritas.
- Em disputa de gravação com outro dispositivo, a fila atual é interrompida e o estado remoto é relido antes de prosseguir.
- O arquivo de recuperação deixa de descartar silenciosamente os conflitos mais antigos.
- O HTML passa a indicar 2.0.41 e a carregar a versão atualizada do script, evitando cache antigo.

## Ativação e segurança
1. Na versão principal, faça **backup completo** da coleção de fichas antes de testar.
2. Verifique as regras do Firestore publicadas no Firebase. O arquivo `firestore.rules` no GitHub não é aplicado automaticamente.
3. Teste o login Google com a mesma conta em dois aparelhos, primeiro com uma ficha simples.
4. Teste também a edição simultânea. Se aparecer aviso de conflito, **não limpe o armazenamento local** nem troque de conta. Exporte o backup completo; a resolução automática de conflitos ainda não está disponível.
5. Esta mudança está em uma branch de revisão. O site principal continua na versão atual até o merge e eventual publicação.

## Limitações
- Requer Firebase configurado e regras privadas publicadas em Cloud Firestore.
- A sincronização em tempo real depende de conexão e autorização válidas.
- Não há ainda interface para escolher entre duas versões conflitantes; isso é trabalho futuro.
- Fichas com imagens enormes podem ultrapassar o limite por documento do Firestore.
- Esta alteração foi feita por revisão do código. **Testes reais em dois aparelhos e verificação das regras publicadas ainda são necessários**.
