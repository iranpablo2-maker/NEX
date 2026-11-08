# NEX 2.0.50 — Notas de atualização e validação

Esta versão mantém o armazenamento **somente no navegador**. A sincronização na nuvem e o login Google não são usados na interface. O código anterior e o banco de dados do Firebase não são apagados por esta atualização.

## 2.0.46 — Fichas repetidas e armazenamento
- Exclusões solicitadas pelo usuário registram o **ID exato** da ficha em `nex_removed_agent_ids_v2046`. O registro é respeitado tanto ao recuperar do `localStorage` quanto do `IndexedDB`.
- Registros antigos não devem restaurar IDs apagados explicitamente.
- A lista vazia é reconhecida como estado válido.
- Excluir uma ficha, excluir todas ou usar a revisão de duplicatas passam pelo mesmo verificador de salvamento.
- A ferramenta **Revisar fichas repetidas** tem a opção **Selecionar apenas cópias idênticas**. A seleção nunca apaga automaticamente; são exigidos backup completo, marcação de confirmação e a palavra `EXCLUIR`.
- Restaurar manualmente um backup libera os IDs presentes nele; portanto, restaurar um backup antigo pode trazer fichas duplicadas de volta.

## 2.0.47 — Celular
- Cabeçalho compacto e sem espaço reservado para ações ocultas.
- Navegação horizontal com botões de toque maiores.
- Formulários de campanhas e revisão de fichas mais legíveis em telas pequenas.

## 2.0.48 — Campanhas locais
- Associar/desassociar fichas de personagem a campanhas.
- Registrar sessões com título, data opcional e anotações.
- Listar e excluir sessões com confirmação.
- Campanhas antigas, com apenas nome e descrição, continuam suportadas.
- A campanha aberta continua expandida depois de salvar suas alterações.

## 2.0.49 — Homebrew
- Buscar origens personalizadas por nome, habilidade, descrição ou perícias.
- O filtro não altera o conteúdo salvo.
- Suporte à criação de outros tipos de homebrew permanece uma melhoria futura.

## 2.0.50 — Prévia de progressão por NEX
- Exibe NEX atual, próximo marco e estimativa de mudanças de PV, PE e SAN.
- Usa a mesma função de cálculo da ficha, sem salvar um NEX temporário.
- Não substitui a revisão humana das regras personalizadas.

## Testes antes de depender da atualização
1. No aparelho que contém as fichas, baixe e confira um **backup completo**.
2. No menu Personagens, revise as duplicatas e use *Selecionar apenas cópias idênticas*. Leia os nomes e as diferenças antes de escolher a exclusão.
3. Depois de excluir **uma ficha de teste**, recarregue a página e confira se ela não reaparece. Não limpe os dados do navegador.
4. Confira fichas com nomes iguais e conteúdos diferentes: elas não devem ser apagadas automaticamente.
5. Abra uma campanha antiga e adicione um personagem e uma sessão; recarregue e confirme que os registros continuam presentes.
6. No celular, confira o cabeçalho, o menu e os formulários em orientação vertical.
7. Teste a busca de origens homebrew e a prévia de progressão por NEX.

**Validação realizada no desenvolvimento:** análise de sintaxe de JavaScript em todos os scripts do HTML, teste de lógica da exclusão por ID e do controle de versões antigas, e verificação básica da renderização das campanhas. **Ainda falta validação manual em navegadores reais**, principalmente o fluxo completo de backup, limpeza e recuperação no celular.

## Limitações importantes
- Dados locais não são compartilhados automaticamente entre aparelhos.
- Não existe limpeza silenciosa das duplicatas; o proprietário escolhe quais fichas apagar.
- Fichas diferentes podem ter o mesmo nome. A comparação de conteúdos é conservadora.
- A biblioteca de criaturas e o editor de tipos adicionais de homebrew ainda não fazem parte desta entrega.
