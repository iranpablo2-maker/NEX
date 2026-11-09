# NEX 2.0.58 — Efeitos automáticos configuráveis

## Onde encontrar
Abra uma ficha e, na aba **Habilidades**, expanda **Efeitos automáticos** (abaixo da lista de habilidades).

## Funcionalidades
- Bônus em **perícias**, **PV máximo**, **PE máximo** e **Defesa**.
- Efeitos passivos, ativáveis e equipáveis.
- Custo em PE descontado ao ativar; desativar não devolve PE.
- Ação **Encerrar efeitos temporários** para desligar todos os efeitos ativáveis.
- Fontes: homebrews anexados, poderes, habilidades personalizadas, inventário ou regras manuais.
- Bônus de perícia mostrados na ficha e considerados nos dados; a Defesa reflete os bônus.
- O PV e o PE máximos mudam sem sobrescrever valores base ou curar automaticamente.
- Itens com quantidade zero, fontes removidas e fontes abaixo do NEX mínimo não aplicam bônus.
- Efeitos salvos no personagem (campo nex58Effects), incluídos nos backups JSON e armazenamento local.

## Como configurar
1. Abra **Habilidades → Efeitos automáticos**.
2. Escolha o poder, habilidade ou item. Para conteúdo oficial sem cadastro associado, use **Regra manual / habilidade oficial**.
3. Selecione a perícia ou o valor máximo/Defesa, o bônus numérico e o modo de funcionamento.
4. Em efeitos ativáveis, informe o custo de PE por ativação.
5. Clique em **Adicionar efeito**. Ative, desative, equipe ou desequipe pelo painel.

## Limites
- Descrições em texto livre **não** são interpretadas como regras automaticamente. Só efeitos configurados no painel são aplicados.
- Os bônus são adicionais a efeitos já implementados pelo NEX, incluindo a origem Ex-Militar. Evite duplicar.
- A Defesa básica da armadura usa o campo já existente; use os efeitos para bônus adicionais.
- Até 100 efeitos por personagem, valores entre -99 e +99.
- Efeitos temporários são encerrados manualmente, sem cronômetro ou expiração automática.
- A sincronização com Firebase continua desativada; a ficha é salva no navegador.

## Verificações
- Sintaxe do novo script e dos scripts inline do site validada.
- Testes simulados de perícia, PV, PE, Defesa, exigência de NEX, vínculo com itens, custo de ativação e desligamento.
- Testes em navegador real e celular ainda recomendados.

## Teste manual
1. Faça um backup antes de alterar fichas importantes.
2. Crie +2 em Fortitude, confira o resultado na ficha e a rolagem de dado.
3. Crie +5 PV máximo com ativação de 3 PE. Ative e desative, conferindo PV máximo e PE atual.
4. Vincule +2 Defesa a um item e teste equipar/desequipar.
5. Recarregue, troque de personagem e teste o backup de uma ficha de teste.
