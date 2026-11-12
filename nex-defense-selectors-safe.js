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
 return d;
}
const root=document.createElement('div');root.id='nexDefChoicesRoot';
const style=document.createElement('style');style.id='nexDefChoicesStyles';
style.textContent='#sheetScreen .nex-def-choice{display:grid;gap:5px;width:100%;min-width:0}#sheetScreen .nex-def-choice select,#sheetScreen .nex-def-choice input{width:100%;min-width:0;background:#171216;color:#fff;border:1px solid #705056;border-radius:4px;padding:7px;font-size:12px}#sheetScreen .nex-def-choice small{color:#bfb0b4;line-height:1.4}#sheetScreen .nex-def-choice button{border:1px solid #6d434c;background:#392128;border-radius:4px;color:#f4e6e7;padding:6px;cursor:pointer}#sheetScreen .nex-def-roles{display:flex;flex-wrap:wrap;gap:5px}#sheetScreen .nex-def-roles span{border:1px solid #5b343b;padding:4px 6px;border-radius:4px;background:#25161b;font-size:11px}#sheetScreen .nex-def-resrow{display:grid;grid-template-columns:minmax(90px,1fr) 65px 31px;gap:5px;margin-bottom:5px}#sheetScreen .nex-def-resrow input[data-source]{grid-column:1/-1}';
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
const armorOpts=[['','Sem proteção',0],['leve','Proteção leve',5],['pesada','Proteção pesada',10]];
function allowedArmor(profs,kind){return !kind||(kind==='leve'?profs.has('Proteções leves'):profs.has('Proteções pesadas'));}
function updateReadout(){
 const d=data(),base=profs(),all=new Set([...base,...d.extraProficiencies.filter(x=>names.includes(x))]);
 const profLabel=$('nexDefProfLabels');
 if(profLabel)profLabel.innerHTML=[...all].map(x=>'<span>'+escape(x)+(base.has(x)?'':' (extra)')+'</span>').join('');
 origin.prof.value=[...all].join(', ');
 state.proficiencies=origin.prof.value;
 const armor=$('nexDefArmor');
 if(armor){
  for(const opt of armor.options)opt.disabled=!allowedArmor(all,opt.value);
  $('nexDefArmorNote').textContent=all.has('Proteções pesadas')?'Proteções leves e pesadas liberadas conforme poderes.':'A proteção pesada exige a proficiência correspondente.';
 }
}
function render(){
 const d=data(),base=profs(),all=new Set([...base,...d.extraProficiencies.filter(x=>names.includes(x))]);
 const armor=$('nexDefArmor');
 armor.innerHTML=armorOpts.map(([key,label,bonus])=>'<option value="'+key+'"'+(!allowedArmor(all,key)?' disabled':'')+'>'+label+(bonus?' · Defesa +'+bonus:'')+'</option>').join('');
 armor.value=d.armor;
 if(armor.value!==d.armor)armor.value='';
 $('nexDefExtraProf').innerHTML='<option value="">Escolha uma proficiência extra</option>'+names.filter(x=>!all.has(x)).map(x=>'<option>'+escape(x)+'</option>').join('');
 updateReadout();
 const rows=$('nexDefResList');
 rows.innerHTML=d.resistances.slice(0,15).map((r,i)=>'<div class="nex-def-resrow" data-index="'+i+'"><select aria-label="Tipo de resistência">'+types.map(t=>'<option'+(t===r.kind?' selected':'')+'>'+escape(t)+'</option>').join('')+'</select><input type="number" min="0" max="99" aria-label="Valor da resistência" value="'+Math.max(0,Number(r.bonus)||0)+'"><button type="button" data-remove="'+i+'" aria-label="Remover resistência">×</button><input data-source type="text" maxlength="120" aria-label="Origem da resistência" placeholder="Fonte: poder, item ou efeito" value="'+escape(r.source||'')+'"></div>').join('');
}
function persist(){
 const d=data(),p=new Set([...profs(),...d.extraProficiencies.filter(x=>names.includes(x))]);
 const chosen=armorOpts.find(x=>x[0]===d.armor)||armorOpts[0];
 if(!allowedArmor(p,chosen[0])){d.armor='';}
 const selected=armorOpts.find(x=>x[0]===d.armor)||armorOpts[0];
 state.protectionName=selected[1]==='Sem proteção'?'':selected[1];
 state.protectionDefense=selected[2];
 origin.armor.value=state.protectionName;
 const hiddenBonus=$('nex20ArmorBonus');if(hiddenBonus)hiddenBonus.value=state.protectionDefense;
 origin.resist.value=d.resistances.map(r=>r.kind+(r.bonus?' '+r.bonus:'')+(r.source?' · '+r.source:'')).join('; ');
 state.resistances=origin.resist.value;
 origin.prof.value=[...p].join(', ');
 state.proficiencies=origin.prof.value;
 if(typeof save==='function')save();
 if(typeof renderStats==='function')renderStats();
}
$('nexDefArmor').addEventListener('change',event=>{data().armor=event.target.value;persist();updateReadout();});
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
const oldClass=state.class;
data();
// Preserve the earlier character's values until the user explicitly chooses a protection.
if(!data().armor&&state.protectionName){
 const v=norm(state.protectionName);
 if(v.includes('pesad'))data().armor='pesada';
 else if(v.includes('leve'))data().armor='leve';
}
render();
})();
