/* NEX: catálogo de modificações e maldições aplicáveis a cada item de RPG.
   Resumos de efeitos; efeitos contextuais permanecem sob decisão do mestre. */
(function(){
'use strict';
const entries=[
 {id:'certeira',name:'Certeira',on:['melee','ranged'],note:'+2 em testes de ataque.',attackBonus:2},
 {id:'cruel',name:'Cruel',on:['melee','ranged'],note:'+2 no dano principal.',damageBonus:2},
 {id:'perigosa',name:'Perigosa',on:['melee','ranged'],note:'Margem de crítico aumenta em 2.',criticalRangeBonus:2},
 {id:'discreta_arma',name:'Discreta',on:['melee','ranged','firearm'],note:'Item mais fácil de ocultar e ocupa 1 espaço a menos.',spaceReduction:1},
 {id:'tatica',name:'Tática',on:['melee','ranged','firearm'],note:'Permite sacar como ação livre.',manual:true},
 {id:'alongada',name:'Alongada',on:['firearm'],note:'+2 em ataques com esta arma.',attackBonus:2},
 {id:'calibre_grosso',name:'Calibre Grosso',on:['firearm'],note:'Aumenta o dado de dano da arma; conferir munição compatível.',manual:true},
 {id:'compensador',name:'Compensador',on:['firearm'],requiresAutomatic:true,note:'Benefício em disparo automático.',manual:true},
 {id:'ferrolho_automatico',name:'Ferrolho Automático',on:['firearm'],note:'Torna a arma automática.',manual:true},
 {id:'mira_laser',name:'Mira Laser',on:['firearm'],note:'Margem de crítico aumenta em 2.',criticalRangeBonus:2},
 {id:'mira_telescopica',name:'Mira Telescópica',on:['firearm'],note:'Altera alcance; confira a regra.',manual:true},
 {id:'silenciador',name:'Silenciador',on:['firearm'],note:'Efeito de furtividade conforme o livro.',manual:true},
 {id:'visao_calor',name:'Visão de Calor',on:['firearm'],note:'Efeito sobre camuflagem conforme o livro.',manual:true},
 {id:'dum_dum',name:'Dum Dum',on:['ammo'],onlyNames:/balas?\s+(curtas?|longas?)/i,note:'Aumenta multiplicador de crítico da arma compatível.',manual:true},
 {id:'explosiva',name:'Explosiva',on:['ammo'],onlyNames:/balas?\s+(curtas?|longas?)/i,note:'Dano adicional da munição; aplicado na arma compatível durante o combate.',manual:true},
 {id:'antibombas',name:'Antibombas',on:['armorHeavy'],note:'Benefício em testes contra efeitos de área.',manual:true},
 {id:'blindada',name:'Blindada',on:['armorHeavy'],note:'Aumenta a resistência e o espaço ocupado.',spaceIncrease:1,manual:true},
 {id:'discreta_protecao',name:'Discreta',on:['armorLight'],incompatible:['reforcada'],note:'Proteção menor e mais discreta.',spaceReduction:1,manual:true},
 {id:'reforcada',name:'Reforçada',on:['armorLight','armorHeavy'],incompatible:['discreta_protecao'],note:'Melhora a Defesa e aumenta o espaço.',spaceIncrease:1,manual:true},
 {id:'aprimorado',name:'Aprimorado',on:['accessory'],note:'Melhora o bônus de perícia do acessório.',manual:true},
 {id:'discreto_acessorio',name:'Discreto',on:['accessory'],note:'Acessório mais fácil de ocultar e ocupa 1 espaço a menos.',spaceReduction:1,manual:true},
 {id:'funcao_adicional',name:'Função Adicional',on:['accessory'],note:'Escolha uma perícia adicional com o mestre.',manual:true},
 {id:'instrumental',name:'Instrumental',on:['accessory'],note:'O acessório funciona como um kit de perícia.',manual:true}
];
const curseEntries=[
 {id:'antielemento',name:'Antielemento',element:'Conhecimento',on:['melee','ranged','firearm']},
 {id:'energetica',name:'Energética',element:'Energia',on:['melee','ranged','firearm']},
 {id:'sanguinaria',name:'Sanguinária',element:'Sangue',on:['melee','ranged','firearm']},
 {id:'vibrante',name:'Vibrante',element:'Energia',on:['melee','ranged','firearm']},
 {id:'consumidora',name:'Consumidora',element:'Morte',on:['melee','ranged','firearm']},
 {id:'erosiva',name:'Erosiva',element:'Morte',on:['melee','ranged','firearm']},
 {id:'abascanta',name:'Abascanta',element:'Conhecimento',on:['armorLight','armorHeavy']},
 {id:'profetica',name:'Profética',element:'Conhecimento',on:['armorLight','armorHeavy']},
 {id:'sombria',name:'Sombria',element:'Conhecimento',on:['armorLight','armorHeavy']},
 {id:'cinetica',name:'Cinética',element:'Energia',on:['armorLight','armorHeavy']},
 {id:'lepida',name:'Lépida',element:'Energia',on:['armorLight','armorHeavy']},
 {id:'carisma',name:'Carisma',element:'Conhecimento',on:['accessory']},
 {id:'conjuracao',name:'Conjuração',element:'Conhecimento',on:['accessory']},
 {id:'escudo_mental',name:'Escudo Mental',element:'Conhecimento',on:['accessory']}
];
const elements=['Sangue','Morte','Energia','Conhecimento','Medo'];
const order=['0','I','II','III','IV'];
const index=Object.fromEntries(order.map((x,i)=>[x,i]));
const clean=v=>String(v??'').trim();
const norm=v=>clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function typeOf(item){
 const c=clean(item.category),name=norm(item.name),kind=norm([item.kind,item.proficiency,item.wield,item.detail].filter(Boolean).join(' '));
 if(c==='Arma')return /fogo|firearm/.test(kind)?'firearm':/disparo|arremesso|arco|besta/.test(kind)?'ranged':'melee';
 if(c==='Munição')return 'ammo';
 if(c==='Proteção')return /pesada/.test(name+' '+kind)?'armorHeavy':'armorLight';
 if(c==='Geral' && /utensil|vestimenta|acessorio/.test(name+' '+kind))return 'accessory';
 return 'unsupported';
}
function eligible(entry,item){
 if(!entry.on.includes(typeOf(item)))return false;
 if(entry.onlyNames&&!entry.onlyNames.test(clean(item.name)))return false;
 if(entry.requiresAutomatic&&!/automatic/.test(norm([item.kind,item.name,item.detail].join(' '))))return false;
 return true;
}
const improvements=entries;
const curses=curseEntries;
function options(item){return {improvements:entries.filter(x=>eligible(x,item)),curses:curseEntries.filter(x=>eligible(x,item)),kind:typeOf(item)}}
const unique=xs=>[...new Set((Array.isArray(xs)?xs:[]).map(clean).filter(Boolean))];
const oppressive=(a,b)=>(a==='Sangue'&&b==='Morte')||(a==='Morte'&&b==='Sangue')||(a==='Conhecimento'&&b==='Energia')||(a==='Energia'&&b==='Conhecimento');
function calculate(item){
 const allowed=options(item);
 const ids=unique(item.modifiers).filter(id=>allowed.improvements.some(x=>x.id===id));
 const customImprovements=unique(item.customImprovements).map(x=>x.slice(0,80));
 const kept=[], invalid=[];
 for(const raw of Array.isArray(item.curses)?item.curses:[]){
  const found=allowed.curses.find(x=>x.id===raw?.id || (norm(x.name)===norm(raw?.name)&&x.element===raw?.element));
  if(!found){invalid.push(clean(raw?.name||raw?.id));continue;}
  if(kept.some(x=>x.id===found.id)){invalid.push(found.name);continue;}
  if(kept.some(x=>oppressive(x.element,found.element))){invalid.push(found.name);continue;}
  kept.push({id:found.id,name:found.name,element:found.element});
 }
 const mods=ids.map(id=>entries.find(x=>x.id===id));
 const conflicting=mods.some(x=>x.incompatible?.some(id=>ids.includes(id)));
 const tier=clean(item.baseTier||item.tier||'0').toUpperCase();
 const ix=index[tier]??0;
 const increase=ids.length+customImprovements.length+(kept.length?kept.length+1:0);
 const spaces=Number(item.spaces)||0;
 const reduction=mods.reduce((n,x)=>n+(x.spaceReduction||0),0);
 const growth=mods.reduce((n,x)=>n+(x.spaceIncrease||0),0);
 return {modifiers:ids,customImprovements,curses:kept,baseTier:tier,categoryIncrease:increase,
 effectiveTier:order[Math.min(4,ix+increase)],overLimit:ix+increase>4,invalidCurses:invalid,
 conflicting,invalidModifiers:unique(item.modifiers).filter(id=>!ids.includes(id)),
 attackBonus:mods.reduce((n,x)=>n+(x.attackBonus||0),0),
 damageBonus:mods.reduce((n,x)=>n+(x.damageBonus||0),0),
 criticalRangeBonus:mods.reduce((n,x)=>n+(x.criticalRangeBonus||0),0),
 effectiveSpaces:Math.max(0,spaces-reduction+growth),
 notes:mods.filter(x=>x.manual).map(x=>x.note)};
}
window.NEX_ITEM_MODS=Object.freeze({improvements,curses,elements,order,typeOf,eligible,options,calculate});
})();
