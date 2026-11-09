/* Recursos de jogo complementares apresentados junto às armas e equipamentos.
   Não substitui as regras completas dos livros. */
window.NEX_MISSING_EQUIPMENT = (function(){
 const ammo=[
  ['Bolinhas de Estilingue','Sobrevivendo ao Horror','0',1,'Pacote para estilingue, suficiente para uma missão de RPG.'],
  ['Pregos para Pregador Pneumático','Sobrevivendo ao Horror','0',1,'Carga de pregos da ferramenta de jogo; a carga fornecida é suficiente para uma missão.'],
  ['Dardos para Pistola de Dardos','Ordem Paranormal RPG v1.3','0',1,'Caixa adicional de dois dardos para o equipamento operacional.'],
  ['Cargas para Pistola Sinalizadora','Ordem Paranormal RPG v1.3','0',1,'Caixa adicional de duas cargas de sinalização para uso em cenas do RPG.']
 ];
 const all=ammo.map(([name,source,category,spaces,description])=>({
  name,source,section:'Munições',subtitle:'Consumível · '+source,spaces,
  stats:[['Categoria',category],['Espaços',String(spaces)]],description
 }));
 return all;
})();