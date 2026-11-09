/* NEX — textos resumidos originais de todos os equipamentos.
 * Executar após os arquivos de dados do catálogo e antes do inventário.
 * Não sobrescreve descrições escritas pelo jogador. */
(function(){
 'use strict';
 const collections=[
  window.NEX_ITEM_BOOKS||[],
  window.NEX_BASE_WEAPONS||[],
  window.NEX_ITEM_COMPLEMENTS?.items||[],
  window.NEX_ITEM_VARIANTS||[],
  window.NEX_MISSING_EQUIPMENT||[],
  window.NEX_BASE_CURSED||[]
 ];
 const extras=window.NEX_ITEM_COMPLEMENTS?.descriptions||{};
 const normalized=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
 const map=new Map(Object.entries(extras).map(([k,v])=>[normalized(k),v]));
 const placeholder=/^(?:estatísticas de jogo conforme|dados de jogo da tabela|munição listada na tabela|equipamento listado na tabela|item amaldiçoado listado na tabela|detalhes a conferir|equipamento geral ·)/i;
 for(const items of collections)for(const item of items){
  if(!item||!item.name)continue;
  const custom=map.get(normalized(item.name));
  if(custom){item.description=custom;continue;}
  const existing=String(item.description||'').trim();
  if(existing&&!placeholder.test(existing)){item.description=existing;continue;}
  const title=String(item.name);
  if(item.section==='Armas'){
   const kind=String(item.subtitle||'arma do sistema');
   const damage=item.stats?.find(x=>x[0]==='Dano')?.[1];
   item.description=title+' é uma arma de '+kind.toLocaleLowerCase('pt-BR')+
    (damage?', com dano '+damage:'')+'. Use suas estatísticas de alcance e crítico nos testes da ficha.';
  }else if(item.section==='Munições'){
   item.description=title+' é um recurso consumível usado como munição em equipamentos compatíveis no RPG.';
  }else if(item.section==='Proteções'){
   item.description=title+' é um equipamento defensivo usado para aumentar a proteção do personagem em situações de risco.';
  }else if(item.section==='Itens Amaldiçoados'){
   const element=item.stats?.find(x=>x[0]==='Elemento')?.[1];
   item.description=title+' é um artefato paranormal'+(element?' associado a '+element:'')+
    '. Consulte o mestre para os efeitos condicionais e custos específicos.';
  }else{
   item.description=title+' é um equipamento geral de investigação, exploração ou suporte da equipe.';
  }
 }
 window.NEX_ITEM_DESCRIPTIONS_READY=true;
})();