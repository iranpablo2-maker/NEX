# NEX 2.0.51 — Homebrew Avançado

## O que foi implementado
- **Origens personalizadas:** o editor já existente permanece disponível e continua integrado à criação de personagens.
- **Poderes, trilhas, habilidades e rituais personalizados:** novo editor com nome, descrição, pré-requisitos, classe, NEX mínimo e, no caso de rituais, círculo, elemento e custo informado de PE.
- **Biblioteca local:** busca por conteúdo e filtro por tipo; criar, editar e excluir registros.
- **Personagens:** escolha uma ficha salva e selecione **Adicionar à ficha**. Cada personagem guarda uma **cópia própria** do conteúdo recebido.
- **Ficha:** seção recolhível de homebrews personalizados com remoção individual, sem apagar o conteúdo da biblioteca.
- **Backup completo:** o campo `advancedHomebrew` exporta a biblioteca no mesmo arquivo JSON que contém fichas, campanhas e origens.
- **Restauração:** backups antigos sem o novo campo continuam aceitos; backups atualizados recuperam a biblioteca e as associações salvas em cada ficha.

## Como usar
1. Faça um **backup completo** antes de modificar seus registros.
2. Abra **Homebrew** no menu.
3. Use o editor de origens que já existia, ou o novo bloco **Homebrew avançado**.
4. Escolha uma categoria e preencha o conteúdo original.
5. Clique **Salvar homebrew**.
6. Na biblioteca, escolha um personagem salvo e clique **Adicionar à ficha**.
7. Abra a ficha do personagem. A seção **Homebrews personalizados da ficha** lista o conteúdo adicionado.

## Armazenamento e limites
- Biblioteca avançada: chave `nex_homebrew_advanced_v2051` em `localStorage`.
- Anexos de cada personagem: campo `nex51Items` preservado nos dados do agente em `localStorage`, no `IndexedDB` e nos backups completos.
- Limites atuais: 300 itens na biblioteca e 80 anexos por ficha.
- **Os efeitos são informativos.** O NEX não aplica automaticamente bônus, custos ou pré-requisitos dos novos conteúdos ao cálculo da ficha. Isso evita alterar indevidamente personagens existentes.
- Editar ou excluir conteúdo da biblioteca não modifica cópias já adicionadas a personagens.
- Não há sincronização com Google/Firebase. Para trocar de dispositivo, faça backup e restaure.

## Verificações realizadas
- Sintaxe de todos os blocos JavaScript do HTML e do novo módulo.
- Testes simulados de criação, edição, exclusão, associação, preservação de anexo após excluir da biblioteca e remoção de uma ficha.
- Teste simulado de proteção contra anexos duplicados e isolamento entre dois personagens.
- Ainda é necessário testar manualmente no celular e em um navegador real antes de depender da nova biblioteca sem backups.
