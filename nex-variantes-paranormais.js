/* NEX: variantes de equipamentos paranormais dos livros de regras.
   Apenas nomes e resumos para uso ficcional no RPG. */
window.NEX_ITEM_VARIANTS = (function(){
  const elements=['Sangue','Morte','Conhecimento','Energia'];
  const out=[];
  const add=(name,source,tier,spaces,description,group)=>{
    out.push({name,section:'Geral',source,subtitle:group+' · '+source,spaces,
      stats:[['Categoria',tier],['Espaços',String(spaces).replace('.',',')]],
      description});
  };
  for(const element of elements){
    add('Componentes Ritualísticos de '+element,'Ordem Paranormal RPG v1.3','0',1,
      'Materiais ligados ao elemento '+element+', usados na preparação narrativa de rituais desse elemento.','Item paranormal');
    add('Amarras de '+element,'Ordem Paranormal RPG v1.3','II',1,
      'Amarras sobrenaturais associadas ao elemento '+element+' e a manifestações do Outro Lado.','Item paranormal');
    add('Scanner de Manifestação Paranormal de '+element,'Ordem Paranormal RPG v1.3','II',1,
      'Dispositivo paranormal do jogo que indica sinais de manifestações do elemento '+element+'.','Item paranormal');
    for(const [kind,summary] of [
      ['Ampliador','Amplia um aspecto do alcance ou da área de um ritual, conforme as regras.'],
      ['Perturbador','Modifica a resistência do alvo a um ritual, conforme as regras.'],
      ['Potencializador','Reforça o efeito de um ritual no sistema.'],
      ['Prolongador','Estende a duração de um ritual dentro do jogo.']
    ])add('Catalisador Ritualístico '+kind+' de '+element,'Sobrevivendo ao Horror','I',0.5,
      'Catalisador do elemento '+element+'. '+summary,'Catalisador ritualístico');
  }
  return out;
})();