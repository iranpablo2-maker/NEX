/* NEX - seletores seguros de proteção, resistências e proficiências.
 * Sem observar a própria ficha ou substituir renderStats: evita loops de renderização.
 */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const origin={armor:$('nex20ArmorName'),resist:$('n193Resistances'),prof:$('n193Proficiencies')};
if(!origin.armor||!origin.resist||!origin.prof||typeof state==='undefined')return;
if($('nexDefChoicesRoot'))return;
const escape=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const types=['Físico','Balístico','Corte','Impacto','Perfuração','Fogo','Frio','Eletricidade','Químico','Mental','Paranormal','Sangue','Morte','Energia','Conhecimento','Outro'];
const names=['Armas simples','Armas táticas','Armas pesadas','Proteções leves','Proteções pesadas'];
function powerSet(){
 const selected=[...(Array.isArray(state.powers)?state.powers:[]),...(Array.isArray(state.n16?.abilities)?state.n16.abilities:[])];
 return new Set(selected.map(p=>norm(p?.name||'')));
}
function profs(){
 const s=new Set(['Armas simples']),p=powerSet();
 if(state.class==='Combatente'){s.add('Armas táticas');s.add('Proteções leves');}
 if(state.class==='Especialista')s.add('Proteções leves');
 if(p.has('protecao pesada'))s.add('Proteções pesadas');
 if(p.has('ninja urbano'))s.add('Armas táticas');
 if(p.has('armamento pesado'))s.add('Armas pesadas');
 return s;
}
function data(){
 if(!state.nexDefenseSelect||typeof state.nexDefenseSelect!=='object'||Array.isArray(state.nexDefenseSelect))state.nexDefenseSelect={};
 const d=state.nexDefenseSelect;
 if(!Array.isArray(d.resistances)){
  d.resistances=[];
  const old=String(state.resistances||'').trim();
  if(old)d.resistances.push({kind:'Outro',bonus:0,source:old});
 }
 if(!Array.isArray(d.extraProficiencies))d.extraProficiencies=[];
 if(typeof d.armor!=='string')d.armor='';
 if(typeof d.shield!=='boolean')d.shield=false;
 if(typeof d.inventoryArmorId!=='string')d.inventoryArmorId='';
 return d;
}
if(document.getElementById('nexDefArmor'))return;
const style=document.createElement('style');style.id='nexDefChoicesStyles';
style.textContent='#sheetScreen .nex-def-choice{display:grid;gap:5px;width:100%;min-width:0}#sheetScreen .nex-def-choice select,#sheetScreen .nex-def-choice input{width:100%;min-width:0;background:#171216;color:#fff;border:1px solid #705056;border-radius:4px;padding:7px;font-size:12px}#sheetScreen .nex-def-choice small{color:#bfb0b4;line-height:1.4}#sheetScreen .nex-def-choice button{border:1px solid #6d434c;background:#392128;border-radius:4px;color:#f4e6e7;padding:6px;cursor:pointer}#sheetScreen .nex-def-roles{display:flex;flex-wrap:wrap;gap:5px}#sheetScreen .nex-def-roles span{border:1px solid #5b343b;padding:4px 6px;border-radius:4px;background:#25161b;font-size:11px}#sheetScreen .nex-def-resrow{display:grid;grid-template-columns:minmax(90px,1fr) 65px 31px;gap:5px;margin-bottom:5px}#sheetScreen .nex-def-resrow input[data-source]{grid-column:1/-1}';
style.textContent += '#sheetScreen .nex-def-choice{width:min(100%,310px)!important;gap:4px!important}#sheetScreen .nex-def-choice select,#sheetScreen .nex-def-choice input{height:29px!important;min-height:29px!important;padding:4px 6px!important;font-size:11px!important}#sheetScreen .nex-def-choice>button{min-height:28px!important;padding:4px 7px!important;font-size:11px!important}#sheetScreen .nex-def-resrow{grid-template-columns:minmax(105px,1fr) 50px 25px!important;gap:4px!important;margin-bottom:4px!important}#sheetScreen .nex-def-resrow button{min-width:25px!important;width:25px!important;height:29px!important;padding:0!important}#sheetScreen .nex-def-choice small{font-size:10px!important;line-height:1.25!important}#sheetScreen .nex-def-roles .nex-def-role{font-size:10px!important;padding:2px 5px!important}#sheetScreen .n193-defense-line:has(.nex-def-choice){display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:7px!important}#sheetScreen .n193-defense-line:has(.nex-def-choice)>label{display:block!important;width:100%!important;min-width:0!important;margin:0!important;font-weight:800!important;letter-spacing:.04em}#sheetScreen .n193-defense-line:has(.nex-def-choice)>.nex-def-choice{width:100%!important;max-width:none!important}#sheetScreen .nex-def-roles{align-items:center}#sheetScreen .nex-def-roles .nex-def-role{display:inline-flex;gap:6px;align-items:center;border:1px solid #5b343b;padding:4px 6px;border-radius:4px;background:#25161b;font-size:11px}#sheetScreen .nex-def-roles .nex-def-role button{border:0;background:#572932;color:#fff;border-radius:3px;padding:0 5px;min-width:22px;min-height:22px;font-size:17px;font-weight:700;line-height:1;cursor:pointer}#sheetScreen .nex-def-roles .nex-def-role button:hover{background:#9a3747}#sheetScreen .nex-def-armor-locked{color:#f0bcc2;font-size:11px}';
document.head.append(style);
function addPanel(input,html){
 const container=document.createElement('div');container.className='nex-def-choice';
 container.innerHTML=html;
 input.insertAdjacentElement('afterend',container);
 input.style.display='none';
 input.setAttribute('aria-hidden','true');
 return container;
}
addPanel(origin.armor,'<select id="nexDefArmor" aria-label="Selecionar proteção"></select><small id="nexDefArmorNote"></small>');
addPanel(origin.resist,'<div id="nexDefResList"></div><button type="button" id="nexDefAddRes">+ Adicionar resistência</button><small>Informe o valor e a fonte. Uma resistência não é concedida só por selecionar seu tipo.</small>');
addPanel(origin.prof,'<div id="nexDefProfLabels" class="nex-def-roles"></div><select id="nexDefExtraProf" aria-label="Adicionar proficiência concedida pelo mestre ou homebrew"></select><button type="button" id="nexDefAddProf">Adicionar proficiência extra</button><small>Proficiências da classe e poderes reconhecidos são automáticas; extras são escolhas manuais.</small>');
const armorOpts=[['','Sem proteção',0]];
const heavyResistances=['Balístico','Corte','Impacto','Perfuração'];
function inventoryProtectionItems(){
 return (Array.isArray(state.items)?state.items:[]).filter(item=>item&&item.category==='Proteção'&&Number(item.quantity??1)>0).map(item=>{
  const n=norm(item.name),kind=n.includes('escudo')?'escudo':n.includes('pesad')?'pesada':'leve';
  const bonus=kind==='escudo'?2:kind==='pesada'?10:5;
  const details={...item,...(item.nexInfo||{}),category:'Proteção'};
  const improvementBonus=Number(window.NEX_ITEM_MODS?.calculate?.(details)?.defenseBonus)||0;
  return {item,id:String(item.id),name:String(item.name||'Proteção'),kind,bonus,improvementBonus};
 });
}
function inventorySelection(d){
 const inventory=inventoryProtectionItems(),armor=inventory.filter(x=>x.kind!=='escudo');
 let active=armor.find(x=>x.item.equipped&&String(x.id)===String(d.inventoryArmorId||''))||armor.find(x=>x.item.equipped);
 const shield=inventory.find(x=>x.kind==='escudo'&&x.item.equipped);
 if(active){d.inventoryArmorId=active.id;d.armor=active.kind;}
 else if(d.inventoryArmorId){d.inventoryArmorId='';d.armor='';}
 return {inventory,active,shield};
}
function allowedArmor(profs,kind){return !kind||(kind==='leve'?profs.has('Proteções leves'):profs.has('Proteções pesadas'));}
function updateReadout(){
 const d=data(),base=profs(),all=new Set([...base,...d.extraProficiencies.filter(x=>names.includes(x))]);
 const profLabel=$('nexDefProfLabels');
 if(profLabel)profLabel.innerHTML=[...all].map(x=>'<span class="nex-def-role">'+escape(x)+(base.has(x)?'<small title="Concedida pela classe ou poder (não removível aqui)">· Automática</small>':' <button type="button" data-remove-prof="'+escape(x)+'" aria-label="Remover proficiência '+escape(x)+'" title="Remover proficiência extra">×</button>')+'</span>').join('');
 origin.prof.value=[...all].join(', ');
 state.proficiencies=origin.prof.value;
 const armor=$('nexDefArmor');
 if(armor){
  for(const opt of armor.options){
   const untrained=!allowedArmor(all,opt.value);
   const item=armorOpts.find(entry=>entry[0]===opt.value);
   opt.disabled=false;
   if(item)opt.textContent=(untrained?'🔒 ':'')+item[1]+(item[2]?' · Defesa +'+item[2]:'');
  }
  const linked=inventorySelection(d);
  const lacking=d.armor&&!allowedArmor(all,d.armor);
  const shieldUntrained=linked.shield&&!all.has('Proteções pesadas');
  const note=[];
  if(lacking||shieldUntrained)note.push('🔒 Sem proficiência: –2d20 em testes de Força e Agilidade.');
  if(linked.active?.kind==='pesada')note.push('Proteção pesada: RD 2 (balístico, corte, impacto e perfuração), –5 em perícias afetadas por carga.');
  $('nexDefArmorNote').textContent=note.join(' ')||(linked.inventory.some(i=>i.kind!=='escudo')?'Escolha uma proteção do inventário para vestir.':'Nenhuma proteção no inventário. Adicione uma na categoria Proteções.');
 }
}
function render(){
 const d=data(),base=profs(),all=new Set([...base,...d.extraProficiencies.filter(x=>names.includes(x))]);
 const armor=$('nexDefArmor');
 const linked=inventorySelection(d);
 // Recalcula ao adicionar/remover/vestir itens, sem manter defesa de proteção removida.
 const equippedName=linked.active?linked.active.name:'';
 const equippedBase=(linked.active?linked.active.bonus:0)+(linked.shield?2:0);
 if(state.protectionName!==equippedName||Number(state.protectionDefense)!==equippedBase){
  state.protectionName=equippedName;
  state.protectionDefense=equippedBase;
  origin.armor.value=equippedName;
  const defenseInput=$('nex20ArmorBonus');if(defenseInput)defenseInput.value=equippedBase;
  if(typeof save==='function')save();
 }
 armor.innerHTML=armorOpts.map(([key,label,bonus])=>'<option value="'+key+'">'+(!allowedArmor(all,key)?'🔒 ':'')+label+(bonus?' · Defesa +'+bonus:'')+'</option>').join('')+
 linked.inventory.filter(x=>x.kind!=='escudo').map(x=>'<option value="item:'+escape(x.id)+'">'+(x.item.equipped?'✓ ':'')+escape(x.name)+' · Defesa +'+(x.bonus+x.improvementBonus)+'</option>').join('');
 armor.value=linked.active?'item:'+linked.active.id:'';
 $('nexDefExtraProf').innerHTML='<option value="">Escolha uma proficiência extra</option>'+names.filter(x=>!all.has(x)).map(x=>'<option>'+escape(x)+'</option>').join('');
 updateReadout();
 const rows=$('nexDefResList');
 rows.innerHTML=d.resistances.slice(0,15).map((r,i)=>'<div class="nex-def-resrow" data-index="'+i+'"><select aria-label="Tipo de resistência">'+types.map(t=>'<option'+(t===r.kind?' selected':'')+'>'+escape(t)+'</option>').join('')+'</select><input type="number" min="0" max="99" aria-label="Valor da resistência" value="'+Math.max(0,Number(r.bonus)||0)+'"><button type="button" data-remove="'+i+'" aria-label="Remover resistência">×</button><input data-source type="text" maxlength="120" aria-label="Origem da resistência" placeholder="Fonte: poder, item ou efeito" value="'+escape(r.source||'')+'"></div>').join('');
}
function persist(){
 const d=data(),p=new Set([...profs(),...d.extraProficiencies.filter(x=>names.includes(x))]);
 const linked=inventorySelection(d);
 state.protectionName=linked.active?linked.active.name:'';
 state.protectionDefense=(linked.active?linked.active.bonus:0)+(linked.shield?2:0);
 origin.armor.value=state.protectionName;
 const hiddenBonus=$('nex20ArmorBonus');if(hiddenBonus)hiddenBonus.value=state.protectionDefense;
 const manualRes=d.resistances.map(r=>r.kind+(r.bonus?' '+r.bonus:'')+(r.source?' · '+r.source:'')).join('; ');
 const heavyRes=linked.active?.kind==='pesada'?heavyResistances.map(t=>t+' 2 (Proteção pesada)').join('; '):'';
 origin.resist.value=[manualRes,heavyRes].filter(Boolean).join('; ');
 state.resistances=origin.resist.value;
 origin.prof.value=[...p].join(', ');
 state.proficiencies=origin.prof.value;
 if(typeof save==='function')save();
 if(typeof renderStats==='function')renderStats();
}
$('nexDefArmor').addEventListener('change',event=>{
 const d=data(),v=event.target.value;
 const inventory=inventoryProtectionItems();
 for(const item of inventory)if(item.kind!=='escudo')item.item.equipped=v==='item:'+item.id;
 if(v.startsWith('item:')){
  const found=inventory.find(x=>v==='item:'+x.id);
  d.inventoryArmorId=found?.id||'';
  d.armor=found?.kind||'';
 }else{d.inventoryArmorId='';d.armor='';}
 persist();render();
 if(typeof renderInventory==='function')renderInventory();
});
$('nexDefProfLabels').addEventListener('click',event=>{
 const button=event.target.closest('button[data-remove-prof]');
 if(!button)return;
 const d=data(),name=button.dataset.removeProf;
 // A proficiência automática da classe/poder nunca é apagada.
 if(profs().has(name))return;
 d.extraProficiencies=d.extraProficiencies.filter(x=>x!==name);
 persist();render();
});
$('nexDefAddProf').addEventListener('click',()=>{
 const v=$('nexDefExtraProf').value,d=data();
 if(v&&names.includes(v)&&!d.extraProficiencies.includes(v)){d.extraProficiencies.push(v);persist();render();}
});
$('nexDefAddRes').addEventListener('click',()=>{
 const d=data();if(d.resistances.length>=15)return;
 d.resistances.push({kind:'Físico',bonus:0,source:''});persist();render();
});
$('nexDefResList').addEventListener('click',event=>{
 const b=event.target.closest('[data-remove]');if(!b)return;
 data().resistances.splice(Number(b.dataset.remove),1);persist();render();
});
$('nexDefResList').addEventListener('change',event=>{
 const row=event.target.closest('[data-index]');if(!row)return;
 const record=data().resistances[Number(row.dataset.index)];if(!record)return;
 record.kind=row.querySelector('select').value;
 record.bonus=Math.max(0,Math.min(99,Math.floor(Number(row.querySelector('input[type=number]').value)||0)));
 record.source=row.querySelector('input[data-source]').value.slice(0,120);
 persist();
});
document.addEventListener('change',event=>{
 if(event.target.id==='class'||event.target.id==='origin')queueMicrotask(()=>{render();});
});
const powerList=$('powerList');
if(powerList)new MutationObserver(()=>{updateReadout();}).observe(powerList,{childList:true});
// Atualiza apenas as opções do seletor quando o inventário é redesenhado.
if(typeof renderInventory==='function'){
 const previousRenderInventory=renderInventory;
 renderInventory=function(){
  const result=previousRenderInventory.apply(this,arguments);
  render();
  return result;
 };
}
document.addEventListener('change',event=>{
 if(!event.target.closest?.('[data-nex-item-equipped]'))return;
 queueMicrotask(()=>{
  const d=data(),linked=inventorySelection(d);
  persist();
  render();
 });
});
data();
// A proteção é derivada exclusivamente dos itens do inventário; fichas antigas são mantidas.
render();
})();
