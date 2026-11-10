/* NEX: catálogo resumido de modificações e cálculo de categoria de itens.
 * Efeitos que dependem de decisões do mestre permanecem indicados como manuais.
 * As descrições são resumos próprios, não transcrição dos livros. */
(function(){
'use strict';
const improvements=[
 {id:'certeira',name:'Certeira',items:['Arma'],note:'Bônus de +2 no teste de ataque.',attackBonus:2},
 {id:'cruel',name:'Cruel',items:['Arma'],note:'Acrescenta +2 ao dano principal.',damageBonus:2},
 {id:'perigosa',name:'Perigosa',items:['Arma'],note:'Aumenta a margem de crítico em 2.',criticalRangeBonus:2},
 {id:'discreta',name:'Discreta',items:['Arma'],note:'Reduz em 1 o espaço ocupado (mínimo zero).',spaceReduction:1},
 {id:'tatica',name:'Tática',items:['Arma'],note:'Benefício de ação descrito nas regras; resolução em mesa.',manual:true}
];
const elements=['Sangue','Morte','Energia','Conhecimento','Medo'];
const order=['0','I','II','III','IV'];
const indexes={'0':0,'I':1,'II':2,'III':3,'IV':4};
const clean=(v)=>String(v??'').trim();
const uniqueIds=xs=>[...new Set((Array.isArray(xs)?xs:[]).map(x=>clean(x)).filter(Boolean))];
function calculate(item){
 const ids=uniqueIds(item.modifiers).filter(id=>improvements.some(x=>x.id===id&&x.items.includes(item.category)));
 const curses=(Array.isArray(item.curses)?item.curses:[]).filter(c=>c&&elements.includes(c.element)&&clean(c.name)).map(c=>({name:clean(c.name).slice(0,80),element:c.element}));
 const baseTier=clean(item.baseTier||item.tier||'0').toUpperCase();
 const tierIndex=indexes[baseTier]??0;
 const increase=ids.length+(curses.length?curses.length+1:0);
 const effectiveIndex=tierIndex+increase;
 const mods=ids.map(id=>improvements.find(x=>x.id===id));
 const attackBonus=mods.reduce((a,x)=>a+(x.attackBonus||0),0);
 const damageBonus=mods.reduce((a,x)=>a+(x.damageBonus||0),0);
 const criticalRangeBonus=mods.reduce((a,x)=>a+(x.criticalRangeBonus||0),0);
 const spaceReduction=mods.reduce((a,x)=>a+(x.spaceReduction||0),0);
 return {modifiers:ids,curses,baseTier,categoryIncrease:increase,
  effectiveTier:order[Math.min(4,effectiveIndex)],overLimit:effectiveIndex>4,
  attackBonus,damageBonus,criticalRangeBonus,
  effectiveSpaces:Math.max(0,(Number(item.spaces)||0)-spaceReduction),
  notes:mods.filter(x=>x.manual).map(x=>x.note)};
}
window.NEX_ITEM_MODS=Object.freeze({improvements,elements,calculate,order});
})();
