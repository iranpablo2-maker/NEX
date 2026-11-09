# NEX 2.0.53 — Habilidades e trilhas personalizadas

## Aba Habilidades
A aba **Habilidades** da biblioteca Homebrew contém agora quatro categorias internas:
- **Origens** (tipo `origem`);
- **Poderes Paranormais** (tipo `poder_paranormal`);
- **Poderes Gerais** (tipo `poder_geral`; os registros antigos dos tipos `poder` e `habilidade` também aparecem aqui);
- **Trilhas** (tipo `trilha`).

As abas Ameaças, Rituais e Itens continuam funcionando. A interface adapta-se às telas menores.

## Editor de trilhas
Ao escolher **Habilidades → Trilhas → Adicionar**, o NEX pede o nome da trilha, a classe e quatro habilidades próprias, com **nome e descrição** em cada um dos marcos:
1. **NEX 10%**
2. **NEX 40%**
3. **NEX 65%**
4. **NEX 99%**

Os quatro nomes são necessários ao salvar uma nova trilha. Os textos de efeito podem ser editados depois. A ficha de visualização mostra as quatro habilidades, bem como a cópia adicionada ao personagem.

## Compatibilidade de dados
O armazenamento conserva a mesma chave `nex_homebrew_advanced_v2051`, sem apagar ou converter automaticamente os homebrews antigos. Trilhas anteriores permanecem disponíveis mesmo que não tenham as quatro habilidades preenchidas. É possível editá-las para configurar os novos campos. Poderes e habilidades anteriores são encontrados em **Poderes Gerais**.

O conteúdo associado a personagens continua sendo uma cópia independente: modificar a biblioteca não altera silenciosamente uma ficha.

## Observação
O novo tipo de origem da biblioteca avançada permite criar, consultar e associar a ficha uma descrição de origem. O antigo editor de origens continua separado, preservado para uso na criação de personagens. A integração direta de novas origens avançadas com o assistente de criação ainda não foi implementada.

## Validação
- Testes de sintaxe do módulo e dos scripts do HTML.
- Testes simulados de criação de cada categoria e preservação de poderes antigos.
- Testes simulados das quatro habilidades da trilha, edição, associação a personagem e independência da cópia.
- O teste de utilização real em navegador e celular continua recomendado.