/* NEX • Ferramentas de rituais v1
   Implementação independente: grimório, conjuração, efeitos ativos, histórico e combinações.
   Todos os novos dados pertencem à ficha atual (state.ritualToolkit).
*/
(function(){
'use strict';
const root=document.getElementById('casting');
const list=document.getElementById('ritualList');
if(!root||!list||typeof state==='undefined'||typeof save!=='function'||typeof nex12RenderRitualList!=='function')return;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const id=()=>('rt'+Date.now().toString(36)+Math.random().toString(36).slice(2,9));
const baseCost={1:1,2:3,3:6,4:10};
const maxCost=99;
const isOccultist=()=>state.class==='Ocultista';
const PE_LIMIT=()=>Math.max(0,(Number(maxValues().peLimit)||0)+(state.origin==='Universitário'?1:0));
const availableTurnPE=()=>Math.max(0,PE_LIMIT()-kit().turnSpent);
const permittedCircle=()=>typeof nex12RitualAllowed==='function'?Number(nex12RitualAllowed())||0:0;
let view='conjurar',query='',element='',circle='',source='';
let castingId='';
let castCommitted=false;
function kit(){
 if(!state.ritualToolkit||typeof state.ritualToolkit!=='object'||Array.isArray(state.ritualToolkit))state.ritualToolkit={};
 const k=state.ritualToolkit;
 for(const field of ['active','history','combos'])if(!Array.isArray(k[field]))k[field]=[];
 k.turnSpent=Math.max(0,Math.floor(Number(k.turnSpent)||0));
 k.turnNumber=Math.max(1,Math.floor(Number(k.turnNumber)||1));
 k.permanentSanLoss=Math.max(0,Math.floor(Number(k.permanentSanLoss)||0));
 if(!k.effectConfigs||typeof k.effectConfigs!=='object'||Array.isArray(k.effectConfigs))k.effectConfigs={};
 return k;
}
function learned(){return Array.isArray(state.rituals)?state.rituals:[];}
const signature=r=>[norm(r.name),norm(r.element),Number(r.circle)||1].join('|');
function catalog(){
 if(typeof window.NEX_RITUAL_CATALOG==='function')return window.NEX_RITUAL_CATALOG();
 const sah=new Set((window.NEX_SAH?.rituals||[]).map(signature));
 const official=(window.NEX_RITUAL_META||[]).map(r=>({...r,source:sah.has(signature(r))?'Sobrevivendo ao Horror':'Livro básico'}));
 const hb=(window.NEX51?.readLibrary?.()||[]).filter(x=>x&&x.type==='ritual'&&x.name)
  .map(r=>({...r,circle:Number(r.circle)||1,element:r.element||'Conhecimento',source:'Homebrew',description:r.effect||r.description||''}));
 return [...official,...hb];
}
function info(r){
 const found=catalog().find(x=>signature(x)===signature(r)&&(!r.source||r.source==='Personalizado'||!x.source||x.source===r.source));
 return {...found,...r,execution:r.execution||found?.execution||'',range:r.range||found?.range||'',target:r.target||found?.target||'',duration:r.duration||found?.duration||'',resistance:r.resistance||found?.resistance||'',discente:r.discente||found?.discente||'',verdadeiro:r.verdadeiro||found?.verdadeiro||'',description:r.note||r.description||found?.description||''};
}
function addHistory(type,entry={}){
 const k=kit();
 k.history.unshift({id:id(),at:new Date().toISOString(),type,...entry});
 if(k.history.length>200)k.history.length=200;
}
function update(){
 save();
 if(typeof renderStats==='function')renderStats();
 nex12RenderRitualList();
}
function pe(){return Math.max(0,Number(state.peCurrent)||0);}
function requirement(text){const m=String(text||'').match(/Acesso:\s*(\d+)[º°]?\s*c[ií]rculo/i);return m?Number(m[1]):0;}
function enhancePrice(text){
 const match=String(text||'').match(/\+\s*(\d+)\s*PE/i);
 return match?Number(match[1]):null;
}
function hasEnhance(text){return Boolean(text&&!/^(Não consta|N[aã]o possui|Sem aprimoramento)/i.test(String(text).trim()));}
function finalPrice(r,version,additional){
 const d=info(r),v=version==='Discente'?d.discente:version==='Verdadeiro'?d.verdadeiro:'';
 return Math.max(0,(baseCost[Number(r.circle)]||1)+Math.max(0,Number(r.extra)||0)+(enhancePrice(v)||0)+Math.max(0,Number(additional)||0));
}
function effectSettings(r,version){
 const d=info(r),key=signature(r),preset=window.NEX_RITUAL_EFFECTS?.[key]||{};
 const homeType=d.ritualType==='Suporte'?'Buff':d.ritualType;
 const type=homeType||preset.type||'Buff';
 const configured=kit().effectConfigs[key+'|'+version];
 const summary=String(d.note||d.description||d.effect||'Consulte as condições do ritual no grimório.').slice(0,500);
 let damageDice=String(preset.versions?.[version]||preset.damageDice||'');
 let healDice=String(preset.healDice||'');
 const typedDice=version==='Discente'?d.discenteDice:version==='Verdadeiro'?d.verdadeiroDice:d.ritualDice;
 const summaryDice=String(version==='Discente'?d.discente:version==='Verdadeiro'?d.verdadeiro:'').match(/\bDados:\s*(\d+d\d+(?:[+-]\d+)?)\b/i)?.[1]||'';
 const currentDice=String(typedDice||summaryDice||'').match(/\b\d+d\d+(?:[+-]\d+)?\b/i)?.[0]||'';
 if(currentDice){
  if(type==='Cura')healDice=currentDice;
  else if(!preset.versions?.[version])damageDice=currentDice;
 }
 const defaults={type,damageDice,healDice,healFromDamage:Boolean(preset.healFromDamage),buffText:summary};
 return {...defaults,...configured};
}
const die=faces=>{
 const out=new Uint32Array(1);
 if(typeof crypto!=='undefined'&&crypto.getRandomValues)crypto.getRandomValues(out);
 else out[0]=Math.floor(Math.random()*4294967296);
 return (out[0]%faces)+1;
};
function rollSimpleDice(expression){
 const value=String(expression||'').trim().replace(/\s+/g,'').toLowerCase();
 const matched=/^(\d{1,2})d(\d{1,3})([+-]\d{1,3})?$/.exec(value);
 if(!matched)return null;
 const count=Number(matched[1]),faces=Number(matched[2]),bonus=Number(matched[3]||0);
 if(count<1||count>50||faces<2||faces>1000)return null;
 const rolls=Array.from({length:count},()=>die(faces));
 return {expression:value,rolls,bonus,total:rolls.reduce((a,b)=>a+b,bonus)};
}
function occultismRoll(cost,bonus){
 const sk=state.skills?.Ocultismo||{};
 const attr=sk.attr||'int';
 const pool=Math.max(0,Math.min(20,Math.floor(Number(state.attributes?.[attr])||0)));
 const rolls=Array.from({length:pool===0?2:pool},()=>die(20));
 const chosen=pool===0?Math.min(...rolls):Math.max(...rolls);
 const training=Math.floor(Number(sk.training)||0);
 const total=chosen+training+bonus,dt=20+cost;
 return {rolls,chosen,training,bonus,total,dt,passed:total>=dt,shortfall:Math.max(0,dt-total),attr};
}
function targetRitualDT(){
 return 10+(Number(maxValues().peLimit)||0)+(Number(state.attributes?.pre)||0)+(Number(state.ritualDtBonus)||0);
}
function applyCastSanity(element,version,cost,check){
 const fear=norm(element)==='medo';
 const lost=fear?cost:check?.passed?0:cost;
 const permanent=fear?(version==='Verdadeiro'?3:version==='Discente'?2:1):check&&check.shortfall>=5?1:0;
 state.sanCurrent=Math.max(0,(Number(state.sanCurrent)||0)-lost);
 if(permanent)kit().permanentSanLoss+=permanent;
 return {lost,permanent};
}
function formEffect(){
 const el=modal.querySelector.bind(modal);
 return {type:el('#tkEffectType')?.value||'Buff',
  damageDice:String(el('#tkDamageDice')?.value||'').trim(),healDice:String(el('#tkHealDice')?.value||'').trim(),
  healFromDamage:Boolean(el('#tkHealHalf')?.checked),buffText:String(el('#tkBuffText')?.value||'').trim().slice(0,500)};
}
function syncEffectFields(reset){
 const m=castMath();if(!m)return;
 if(reset){
  const config=effectSettings(m.r,m.v);
  for(const [id,value] of [['tkEffectType',config.type],['tkDamageDice',config.damageDice],['tkHealDice',config.healDice],['tkBuffText',config.buffText]]){
   const field=modal.querySelector('#'+id);if(field)field.value=value||'';
  }
  const half=modal.querySelector('#tkHealHalf');if(half)half.checked=Boolean(config.healFromDamage);
 }
 const type=formEffect().type;
 const damage=modal.querySelector('#tkDamageLine'),heal=modal.querySelector('#tkHealLine'),buff=modal.querySelector('#tkBuffLine');
 const half=modal.querySelector('#tkHealHalf'),halfWrapper=modal.querySelector('#tkHalfLine');
 if(damage)damage.hidden=!['Dano','Dano + Cura'].includes(type);
 if(heal)heal.hidden=!['Cura','Dano + Cura'].includes(type);
 if(buff)buff.hidden=type!=='Buff';
 if(halfWrapper)halfWrapper.hidden=type!=='Dano + Cura';
 if(half&&type!=='Dano + Cura')half.checked=false;
 if(modal.querySelector('#tkHealDice'))modal.querySelector('#tkHealDice').disabled=type==='Dano + Cura'&&Boolean(half?.checked);
}
function computeEffect(fields){
 const result={type:fields.type,buffText:fields.buffText||'',damage:null,healing:null};
 if(['Dano','Dano + Cura'].includes(fields.type)){
  result.damage=rollSimpleDice(fields.damageDice);
  if(!result.damage)return null;
 }
 if(['Cura','Dano + Cura'].includes(fields.type)){
  if(fields.type==='Dano + Cura'&&fields.healFromDamage){
   result.healing={expression:'Metade do dano',rolls:[],bonus:0,total:Math.floor(result.damage.total/2)};
  }else{
   result.healing=rollSimpleDice(fields.healDice);
   if(!result.healing)return null;
  }
 }
 return result;
}
function badgeInfo(){
 const n=learned().length,a=kit().active.length,h=kit().history.length,c=kit().combos.length;
 return 'PE atuais: '+pe()+' · Gasto do turno: '+kit().turnSpent+'/'+PE_LIMIT()+' PE';
}
const host=document.createElement('section');
host.id='nexTkPanel';
host.setAttribute('aria-label','Ferramentas de rituais');
root.append(host);
const modal=document.createElement('dialog');
modal.id='nexTkCastDialog';modal.setAttribute('aria-label','Conjurar ritual');
document.body.append(modal);
const style=document.createElement('style');
style.id='nexTkStyle';
style.textContent='#nexTkPanel{border:1px solid #3b314b;border-radius:8px;padding:13px;margin:10px 0 18px;background:#17131c;color:#eee7f4}#nexTkPanel .tk-tabs{display:flex;flex-wrap:wrap;gap:6px;margin:9px 0 13px}#nexTkPanel .tk-tabs button{border:1px solid #53465e;background:#211b28;color:#e2d4ed;border-radius:5px;padding:8px 10px}#nexTkPanel .tk-tabs button[aria-pressed="true"]{background:#63398a;color:#fff;border-color:#a06bc9}#nexTkPanel h3{font-size:12px;color:#e4d0f6;margin:12px 0 7px}#nexTkPanel .tk-sub{font-size:12px;color:#ad9fba}#nexTkPanel .tk-fields{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}#nexTkPanel .tk-fields>*{flex:1 1 130px;max-width:100%}#nexTkPanel .tk-cards{display:grid;gap:8px;max-height:530px;overflow:auto;padding-right:2px}#nexTkPanel .tk-card{background:#221b2a;border:1px solid #493a55;padding:10px;border-radius:6px}#nexTkPanel .tk-row{display:flex;align-items:center;justify-content:space-between;gap:9px;flex-wrap:wrap}#nexTkPanel .tk-card details>summary{cursor:pointer;font-weight:700;margin-top:7px}#nexTkPanel .tk-card p{white-space:pre-wrap;margin:6px 0;font-size:12px}#nexTkPanel .tk-actions{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 0}#nexTkPanel button.tk-button,#nexTkCastDialog button{border:1px solid #665071;color:#f0e6fb;background:#3b284d;border-radius:5px;padding:7px 10px;cursor:pointer}#nexTkPanel button[disabled],#nexTkCastDialog button[disabled]{opacity:.5;cursor:not-allowed}#nexTkPanel input,#nexTkPanel select,#nexTkPanel textarea,#nexTkCastDialog input,#nexTkCastDialog select{background:#120f18;border:1px solid #59466a;border-radius:4px;padding:8px;color:white;width:100%;font:inherit}#nexTkPanel label,#nexTkCastDialog label{display:block;color:#d4c2de;font-size:12px}#nexTkPanel .tk-select-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:5px;max-height:230px;overflow:auto}#nexTkPanel .tk-select-list label{padding:7px;border:1px solid #473652;border-radius:5px}#nexTkPanel input[type=checkbox],#nexTkCastDialog input[type=checkbox]{width:auto;margin-right:7px}#nexTkCastDialog{background:#1a1421;border:1px solid #79549a;color:#f3ebfa;border-radius:9px;width:min(480px,calc(100vw - 24px));max-height:88vh;overflow:auto;padding:18px}#nexTkCastDialog::backdrop{background:#000b}#nexTkCastDialog .tk-modal-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:12px 0}#nexTkCastDialog .tk-modal-fields>label:first-child{grid-column:1/-1}#nexTkCastDialog .tk-foot{display:flex;justify-content:flex-end;gap:8px;margin-top:12px}#nexTkCastDialog .tk-warning{font-size:12px;color:#f0bd8c;margin-top:7px}#nexTkPanel .tk-mono{font-variant-numeric:tabular-nums}';
style.textContent+="\n#nexTkPanel{background:transparent;border:0;padding:0;margin:12px 0 24px}\n#nexTkPanel .tk-dmg-resources{border:1px solid #353139;border-radius:7px;background:#17151a;padding:12px;margin-bottom:12px}\n#nexTkPanel .tk-dmg-list{display:flex;flex-direction:column;gap:9px}\n#nexTkPanel .tk-dmg-card{background:#202022;border:1px solid #29292e;border-radius:5px;overflow:hidden}\n#nexTkPanel .tk-dmg-card>summary{list-style:none;display:flex;gap:14px;align-items:center;padding:14px 16px 7px;cursor:pointer}\n#nexTkPanel .tk-dmg-card>summary::-webkit-details-marker{display:none}\n#nexTkPanel .tk-dmg-card .tk-dmg-chevron{font-size:23px;line-height:12px;color:#ae54ed;transform:rotate(0deg);transition:transform .16s}\n#nexTkPanel .tk-dmg-card:not([open]) .tk-dmg-chevron{transform:rotate(-90deg)}\n#nexTkPanel .tk-dmg-card>summary strong{font-size:14px;color:#fbf9fd}\n#nexTkPanel .tk-dmg-element{margin-left:auto;font-size:11px;color:#a399ac;white-space:nowrap}\n#nexTkPanel .tk-dmg-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:9px 12px 15px 64px}\n#nexTkPanel .tk-dmg-version{min-width:0;text-align:left}\n#nexTkPanel .tk-dmg-label{font-size:11px;color:#b8c1cb;display:block;margin-bottom:4px;letter-spacing:.02em}\n#nexTkPanel .tk-dmg-roll{display:flex;align-items:center;gap:5px;min-height:25px}\n#nexTkPanel .tk-dmg-formula{font-size:14px;font-weight:650;color:#fff;white-space:nowrap}\n#nexTkPanel .tk-dmg-die{background:transparent;border:0;color:#dddce4;cursor:pointer;padding:2px;line-height:0;border-radius:4px}\n#nexTkPanel .tk-dmg-die:hover:not(:disabled){color:#bd75ef;background:#35233e}\n#nexTkPanel .tk-dmg-die:focus-visible{outline:2px solid #b96bef;outline-offset:2px}\n#nexTkPanel .tk-dmg-die:disabled{opacity:.28;cursor:not-allowed}\n#nexTkPanel .tk-dmg-cost,#nexTkPanel .tk-dmg-lock{font-size:10px;color:#8e8595}\n#nexTkPanel .tk-dmg-lock{color:#bc8094}\n#nexTkPanel .tk-dmg-disabled .tk-dmg-formula{opacity:.6}\n@media(max-width:540px){#nexTkPanel .tk-dmg-card>summary{padding:13px 12px 6px;gap:8px}#nexTkPanel .tk-dmg-grid{padding:10px 10px 14px 12px;gap:6px}#nexTkPanel .tk-dmg-element{font-size:9px}#nexTkPanel .tk-dmg-formula{font-size:12px}#nexTkPanel .tk-dmg-label{font-size:10px}#nexTkPanel .tk-dmg-roll{gap:2px}}\n";
style.textContent+="\n#nexTkCastDialog.nex-tk-result-compact{width:min(320px,calc(100vw - 24px));max-height:90vh;overflow:auto;padding:0;background:#202022;border:1px solid #5b2288;border-radius:2px;color:#f9f9fb;box-shadow:0 18px 60px #0009}\n#nexTkCastDialog .tk-roll-result{font-family:inherit}\n#nexTkCastDialog .tk-roll-header{height:40px;display:flex;align-items:center;justify-content:center;position:relative;padding:5px 38px}\n#nexTkCastDialog .tk-roll-header strong{font-size:17px;color:#f5f3f8;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}\n#nexTkCastDialog .tk-roll-header button{position:absolute;right:6px;top:3px;border:0;padding:0 5px;background:transparent;color:#fff;font-size:29px;font-weight:200;line-height:32px}\n#nexTkCastDialog .tk-roll-content{display:grid;grid-template-columns:50px 1fr 1px 1fr;align-items:center;min-height:76px;gap:3px;padding:0 12px 0 12px}\n#nexTkCastDialog .tk-roll-symbol{display:flex;align-items:center;justify-content:center}\n#nexTkCastDialog .tk-roll-stat{display:flex;flex-direction:column;gap:8px;align-items:center;min-width:0}\n#nexTkCastDialog .tk-roll-stat strong{font-size:32px;color:#fff;font-weight:750;line-height:1}\n#nexTkCastDialog .tk-roll-stat span{font-size:12px;letter-spacing:.02em;color:#a7a7ab;font-weight:700}\n#nexTkCastDialog .tk-roll-divider{background:#68656e;height:47px;align-self:center}\n#nexTkCastDialog .tk-roll-status{font-size:11px;color:#bca6cf;text-align:center;padding:9px 6px 11px}\n#nexTkCastDialog .tk-roll-more{border-top:1px solid #36313e}\n#nexTkCastDialog .tk-roll-more>summary{padding:8px 13px;cursor:pointer;font-size:11px;color:#c9bbc9;text-align:center}\n#nexTkCastDialog .tk-roll-more-body{padding:2px 15px 15px;font-size:12px;line-height:1.5}\n#nexTkCastDialog .tk-roll-more-body p{margin:8px 0;overflow-wrap:anywhere}\n";
document.head.append(style);
function top(){
 if(!isOccultist()){host.innerHTML='';if(modal.open&&typeof modal.close==='function')modal.close();return;}
 host.innerHTML='<div class="tk-row"><strong>CONJURAR · RITUAIS DE DANO</strong><small id="tkCounts" class="tk-sub"></small></div>'+
 '<div id="tkBody"></div>';
 document.getElementById('tkCounts').textContent=badgeInfo();
 renderBody();
}
function renderBody(){
 if(!host.isConnected)return;
 const el=document.getElementById('tkBody');if(!el)return;
 document.getElementById('tkCounts').textContent=badgeInfo();
 if(view==='conjurar'){
  const budget=availableTurnPE();
  el.innerHTML='<div class="tk-row tk-dmg-resources"><div><strong>PE: '+pe()+'</strong><p class="tk-sub">Limite/turno: '+PE_LIMIT()+' PE · Disponíveis neste turno: '+budget+' PE · NEX '+esc(state.nex)+'% · Círculo até '+permittedCircle()+'º</p></div><button type="button" class="tk-button" data-tk-next-turn="1">Próximo turno</button></div>'+
  '<div class="tk-fields"><input id="tkLearnedSearch" type="search" placeholder="Buscar ritual de dano…" aria-label="Buscar ritual de dano" value="'+esc(query)+'"></div>'+
  '<div id="tkLearnedCards" class="tk-dmg-list"></div>';
  drawLearned();return;
 }
 if(view==='grimorio'){
  el.innerHTML='<p class="tk-sub">Consulte os rituais e adicione à ficha conforme as permissões do seu personagem. Sem símbolos ou ilustrações.</p>'+
  '<div class="tk-fields"><input aria-label="Pesquisar ritual" id="tkSearch" type="search" placeholder="Pesquisar pelo nome…" value="'+esc(query)+'">'+
  '<select aria-label="Elemento" id="tkElement"><option value="">Todos os elementos</option>'+['Sangue','Morte','Energia','Conhecimento','Medo'].map(x=>'<option '+(element===x?'selected':'')+'>'+x+'</option>').join('')+'</select>'+
  '<select aria-label="Círculo" id="tkCircle"><option value="">Todos os círculos</option>'+[1,2,3,4].map(x=>'<option value="'+x+'" '+(circle===String(x)?'selected':'')+'>'+x+'º círculo</option>').join('')+'</select>'+
  '<select aria-label="Fonte" id="tkSource"><option value="">Todas as fontes</option>'+['Livro básico','Sobrevivendo ao Horror','Homebrew'].map(x=>'<option '+(source===x?'selected':'')+'>'+x+'</option>').join('')+'</select></div>'+
  '<div class="tk-sub" id="tkResultCount"></div><div class="tk-cards" id="tkResults"></div>';
  drawGrimoire();return;
 }
 if(view==='ativos'){
  const arr=kit().active;
  el.innerHTML='<p class="tk-sub">Avance uma rodada manualmente ou encerre os efeitos. A sustentação só desconta PE quando você confirmar a rodada.</p>'+
  (arr.length?'<div class="tk-cards">'+arr.map(a=>'<article class="tk-card"><div class="tk-row"><strong>'+esc(a.name)+'</strong><small>'+esc(a.version)+' · '+esc(a.duration||'Duração não indicada')+'</small></div>'+
  '<p>Rodadas acompanhadas: '+Math.max(0,Number(a.rounds)||0)+' · Sustentação configurada: '+Math.max(0,Number(a.upkeep)||0)+' PE/rodada</p>'+
  '<div class="tk-actions"><button type="button" class="tk-button" data-tk-round="'+esc(a.id)+'">Avançar 1 rodada</button><button type="button" class="tk-button" data-tk-end="'+esc(a.id)+'">Encerrar</button></div></article>').join('')+'</div><div class="tk-actions"><button class="tk-button" type="button" data-tk-scene-end="1">Encerrar cena (todos)</button></div>':'<p class="tk-sub">Nenhum ritual ativo. Conjure um ritual aprendido e marque “Manter ativo”.</p>');
  return;
 }
 if(view==='historico'){
  const arr=kit().history;
  el.innerHTML='<div class="tk-row"><span class="tk-sub">Últimas 200 ações desta ficha.</span><button type="button" class="tk-button" data-tk-clear="1" '+(!arr.length?'disabled':'')+'>Limpar histórico</button></div>'+
   (arr.length?'<div class="tk-cards">'+arr.map(h=>'<article class="tk-card"><div class="tk-row"><strong>'+esc(h.type)+'</strong><small>'+esc(new Date(h.at).toLocaleString('pt-BR'))+'</small></div><p>'+esc(h.name||h.note||'')+(h.version?' · '+esc(h.version):'')+'</p><p class="tk-sub">'+(Number(h.cost)>0?'-'+esc(h.cost)+' PE'+(h.peAfter!==undefined?' · Restantes: '+esc(h.peAfter)+' PE':''):'Sem gasto de PE')+'</p>'+
   (h.to?'<p>TO: '+esc(h.to.total)+' / DT '+esc(h.to.dt)+' · '+(h.to.passed?'Sucesso':'Falha')+'</p>':h.type==='Conjuração'?'<p>TO: dispensado (Medo)</p>':'')+
   (h.effect?.damage?'<p>Dano: '+esc(h.effect.damage.total)+' ('+esc(h.effect.damage.expression)+')</p>':'')+
   (h.effect?.healing?'<p>Cura: '+esc(h.effect.healing.total)+' ('+esc(h.effect.healing.expression)+')</p>':'')+
   (h.effect?.type==='Buff'?'<p>Buff/Suporte: '+esc(h.effect.buffText||'Efeito registrado')+'</p>':'')+
   ((h.sanLoss||h.permanentSanLoss)?'<p>Sanidade: -'+esc(h.sanLoss||0)+' atual · -'+esc(h.permanentSanLoss||0)+' permanente</p>':'')+
   '</article>').join('')+'</div>':'<p class="tk-sub">O histórico será preenchido quando você conjurar ou sustentar rituais.</p>');
  return;
 }
 if(view==='combos'){
  const k=kit(),arr=learned();
  el.innerHTML='<p class="tk-sub">Monte sequências para consulta. Criar uma combinação não gasta PE nem conjura automaticamente.</p>'+
  '<form id="tkComboForm"><div class="tk-fields"><label>Nome da combinação<input name="name" maxlength="75" required placeholder="Ex.: Preparação para exploração"></label><label>Observações<input name="note" maxlength="240" placeholder="Ordem de uso, estratégia…"></label></div>'+
  '<div class="tk-sub">Selecione de 2 a 8 rituais aprendidos:</div><div class="tk-select-list">'+arr.map(r=>'<label><input type="checkbox" name="ritual" value="'+esc(r.id)+'">'+esc(r.name)+' <small>('+esc(r.circle)+'º)</small></label>').join('')+'</div>'+
  '<div class="tk-actions"><button type="submit" class="tk-button" '+(arr.length<2?'disabled':'')+'>Salvar combinação</button></div></form>'+
  '<h3>Combinações salvas</h3>'+(k.combos.length?'<div class="tk-cards">'+k.combos.map(c=>{
   const parts=(c.ritualIds||[]).map(rid=>arr.find(r=>String(r.id)===String(rid))).filter(Boolean);
   const total=parts.reduce((a,r)=>a+finalPrice(r,'Normal',0),0);
   return '<article class="tk-card"><div class="tk-row"><strong>'+esc(c.name)+'</strong><small>Estimativa base: '+total+' PE</small></div><p>'+esc(parts.map(r=>r.name).join(' → ')||'Rituais indisponíveis nesta ficha')+'</p><p class="tk-sub">'+esc(c.note||'')+'</p><div class="tk-actions">'+(parts.length?'<button type="button" class="tk-button" data-tk-cast="'+esc(parts[0].id)+'">Conjurar primeiro ritual</button>':'')+'<button type="button" class="tk-button" data-tk-delete-combo="'+esc(c.id)+'">Excluir combinação</button></div></article>';
  }).join('')+'</div>':'<p class="tk-sub">Nenhuma combinação salva.</p>');
 }
}
function drawLearned(){
 const container=document.getElementById('tkLearnedCards');if(!container)return;
 const list=learned().filter(r=>{
  if(!norm(r.name+' '+r.element).includes(norm(query)))return false;
  const cfg=effectSettings(r,'Normal');
  return ['Dano','Dano + Cura'].includes(cfg.type)&&rollSimpleDicePattern(cfg.damageDice);
 });
 const diceIcon='<svg aria-hidden="true" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1.7 20.7 6.8v10.4L12 22.3l-8.7-5.1V6.8z"/><path d="m12 1.7-4.2 8.4 4.2 12.2 4.2-12.2L12 1.7ZM3.3 6.8l4.5 3.3h8.4l4.5-3.3m-17.4 10.4 4.5-7.1m12.9 7.1-4.5-7.1"/></svg>';
 container.innerHTML=list.length?list.map(r=>{
  const d=info(r),allowedCircle=permittedCircle();
  const columns=['Normal','Discente','Verdadeiro'].map(version=>{
   const enhanced=version==='Discente'?d.discente:d.verdadeiro;
   const optionAvailable=version==='Normal'||hasEnhance(enhanced)||Boolean(version==='Discente'?d.discenteDice:d.verdadeiroDice);
   const config=effectSettings(r,version);
   const formula=optionAvailable?String(config.damageDice||''):'';
   const required=version==='Discente'?Number(d.discenteCircle)||requirement(d.discente):version==='Verdadeiro'?Number(d.verdadeiroCircle)||requirement(d.verdadeiro):0;
   const price=finalPrice(r,version,0);
   const needsCost=version!=='Normal'&&enhancePrice(enhanced)===null;
   const blockReason=!optionAvailable?'Versão não disponível':
    required>allowedCircle||Number(r.circle)>allowedCircle?'Bloqueado pelo NEX':
    !rollSimpleDicePattern(formula)?'Dados não cadastrados':
    price>availableTurnPE()?'Limite de PE neste turno':
    price>pe()?'PE insuficiente':'';
   const disabled=Boolean(blockReason)||needsCost&&price>availableTurnPE();
   return '<div class="tk-dmg-version '+(disabled?'tk-dmg-disabled':'')+'">'+
    '<span class="tk-dmg-label">'+version.toUpperCase()+'</span>'+
    '<div class="tk-dmg-roll"><span class="tk-dmg-formula">'+esc(formula||'—')+'</span>'+
    (formula?'<button type="button" class="tk-dmg-die" data-tk-cast="'+esc(r.id)+'" data-tk-version="'+version+'" aria-label="Conjurar '+esc(r.name)+' '+version+': '+esc(formula)+'" title="'+esc(blockReason||('Conjurar '+version+' · '+price+' PE'))+'" '+(disabled?'disabled':'')+'>'+diceIcon+'</button>':'')+'</div>'+
    (blockReason?'<small class="tk-dmg-lock">'+esc(blockReason)+'</small>':needsCost?'<small class="tk-dmg-lock">Definir custo no painel</small>':'<small class="tk-dmg-cost">'+price+' PE</small>')+'</div>';
  }).join('');
  return '<details class="tk-dmg-card" open><summary><span class="tk-dmg-chevron">⌄</span><strong>'+esc(r.name)+'</strong><span class="tk-dmg-element">'+esc(r.element)+' · '+esc(r.circle)+'º círculo</span></summary><div class="tk-dmg-grid">'+columns+'</div></details>';
 }).join(''):'<p class="tk-sub">Nenhum ritual de dano aprendido encontrado. Adicione rituais de dano na aba Rituais.</p>';
}
function drawGrimoire(){
 const dst=document.getElementById('tkResults');if(!dst)return;
 const all=catalog();
 const opts=all.filter(x=>(!query||norm(x.name+' '+x.element+' '+x.source).includes(norm(query)))&&(!element||x.element===element)&&(!circle||String(x.circle)===circle)&&(!source||x.source===source));
 document.getElementById('tkResultCount').textContent=opts.length+' rituais encontrados';
 const accessible=typeof nex12CanShowRituals!=='function'||nex12CanShowRituals();
 const unlocked=typeof nex12RitualAllowed==='function'?nex12RitualAllowed():1;
 dst.innerHTML=opts.length?opts.slice(0,150).map((r,i)=>{
  const learnedItem=learned().find(x=>signature(x)===signature(r));
  const blocked=!accessible||(state.class==='Ocultista'&&Number(r.circle)>unlocked);
  const data=info(r);
  return '<article class="tk-card"><div class="tk-row"><strong>'+esc(r.name)+'</strong><small>'+esc(r.element)+' · '+esc(r.circle)+'º círculo · '+esc(r.source)+'</small></div>'+
   '<details><summary>Ver informações</summary>'+
   '<p>Execução: '+esc(data.execution||'Não especificada')+' · Alcance: '+esc(data.range||'Não especificado')+'</p>'+
   '<p>Alvo: '+esc(data.target||'Conferir no livro')+' · Duração: '+esc(data.duration||'Conferir no livro')+'</p>'+
   '<p>Resistência: '+esc(data.resistance||'Não consta')+'</p>'+
   (data.discente?'<p>Discente: '+esc(data.discente)+'</p>':'')+
   (data.verdadeiro?'<p>Verdadeiro: '+esc(data.verdadeiro)+'</p>':'')+
   '<p class="tk-sub">'+esc(data.description||'Consulte o livro para o efeito integral e suas condições.')+'</p></details>'+
   '<div class="tk-actions">'+(learnedItem?'<button type="button" class="tk-button" data-tk-cast="'+esc(learnedItem.id)+'">Conjurar</button>':
   '<button type="button" class="tk-button" data-tk-learn="'+esc(signature(r))+'" '+(blocked?'disabled':'')+'>'+(blocked?'Círculo indisponível':'Adicionar à ficha')+'</button>')+'</div></article>';
 }).join(''):'<p class="tk-sub">Nenhum ritual encontrado.</p>';
}
function openCast(rid,requestedVersion='Normal'){
 if(!isOccultist()){toast('A conjuração nesta aba é exclusiva para Ocultistas.');return;}
 const r=learned().find(x=>String(x.id)===String(rid));
 if(!r){toast('Ritual não encontrado nesta ficha.');return;}
 if(Number(r.circle)>permittedCircle()){toast('Este círculo ainda não foi liberado pelo NEX.');return;}
 castingId=String(rid);castCommitted=false;
 const d=info(r);
 const options=['Normal'].concat(hasEnhance(d.discente)||Boolean(d.discenteDice)?['Discente']:[],hasEnhance(d.verdadeiro)||Boolean(d.verdadeiroDice)?['Verdadeiro']:[]);
 if(!options.includes(requestedVersion)){toast('Essa versão não está disponível para o ritual.');return;}
 const isActive=!/instant[aâ]nea|instant[aâ]neo/i.test(d.duration||'');
 modal.innerHTML='<div class="tk-row"><h3>Conjurar: '+esc(r.name)+'</h3><button type="button" data-tk-modal-close="1" aria-label="Fechar">✕</button></div>'+
 '<p class="tk-sub">Círculo '+esc(r.circle)+' · '+esc(r.element)+' · Duração: '+esc(d.duration||'não informada')+'</p>'+
 '<form id="tkCastForm"><div class="tk-modal-fields">'+
 '<label>Versão<select id="tkCastVersion">'+options.map(v=>'<option>'+esc(v)+'</option>').join('')+'</select></label>'+
 '<label>PE adicional por ajustes<input id="tkCastExtra" type="number" min="0" max="99" step="1" value="0"></label>'+
 '<label>Bônus extra no TO<input id="tkTOBonus" type="number" min="-99" max="99" step="1" value="0"></label>'+
 '<label>Custo de sustentação (PE/rodada)<input id="tkCastUpkeep" type="number" min="0" max="99" step="1" value="'+(/sustentad/i.test(d.duration||'')?'1':'0')+'"></label>'+
 '</div><label><input id="tkCastActive" type="checkbox" '+(isActive?'checked':'')+'>Manter ativo e acompanhar rodadas</label>'+
 '<h3>TO + efeito do ritual</h3>'+
 '<div class="tk-modal-fields"><label>Tipo de efeito<select id="tkEffectType"><option>Dano</option><option>Cura</option><option>Buff</option><option>Dano + Cura</option></select></label>'+
 '<label id="tkDamageLine">Dados de dano<input id="tkDamageDice" placeholder="Ex.: 3d6, 2d8+2" maxlength="24"></label>'+
 '<label id="tkHealLine">Dados de cura<input id="tkHealDice" placeholder="Ex.: 3d8+3" maxlength="24"></label></div>'+
 '<label id="tkHalfLine"><input type="checkbox" id="tkHealHalf">Cura igual à metade do dano rolado</label>'+
 '<label id="tkBuffLine">Buff / suporte (efeito para aplicar)<textarea id="tkBuffText" rows="3" maxlength="500" style="width:100%;background:#120f18;color:#fff;border:1px solid #59466a"></textarea></label>'+
 '<p id="tkToPreview" class="tk-sub"></p>'+
 '<p id="tkCostPreview" class="tk-warning"></p><p id="tkRulesPreview" class="tk-sub"></p>'+
 '<div class="tk-foot"><button type="button" data-tk-modal-close="1">Cancelar</button><button type="submit">Rolar TO e conjurar</button></div></form>';
 const versionField=modal.querySelector('#tkCastVersion');if(versionField)versionField.value=requestedVersion;
 modal.classList.remove('nex-tk-result-compact');
 if(typeof modal.showModal==='function')modal.showModal();else modal.open=true;
 syncEffectFields(true);
 preview();
}
function castMath(){
 const r=learned().find(x=>String(x.id)===castingId);
 if(!r)return null;
 const d=info(r),v=modal.querySelector('#tkCastVersion')?.value||'Normal';
 const extra=Math.min(maxCost,Math.max(0,Number(modal.querySelector('#tkCastExtra')?.value)||0));
 const enhance=v==='Discente'?d.discente:v==='Verdadeiro'?d.verdadeiro:'';
 return {r,d,v,extra,enhance,total:finalPrice(r,v,extra)};
}
function preview(){
 const v=castMath();if(!v)return;
 const costNode=modal.querySelector('#tkCostPreview');
 const rulesNode=modal.querySelector('#tkRulesPreview');
 const toNode=modal.querySelector('#tkToPreview');
 const effect=formEffect();
 const hasDamage=['Dano','Dano + Cura'].includes(effect.type);
 const hasHeal=['Cura','Dano + Cura'].includes(effect.type);
 const missingDice=(hasDamage&&!rollSimpleDicePattern(effect.damageDice))||(hasHeal&&!(effect.type==='Dano + Cura'&&effect.healFromDamage)&&!rollSimpleDicePattern(effect.healDice));
 const toDt=20+v.total;
 if(toNode)toNode.textContent=norm(v.r.element)==='medo'?'Medo: sem TO. Sanidade reduzida conforme a versão.':'Teste de Ocultismo (TO): '+(Number(state.attributes?.[state.skills?.Ocultismo?.attr||'int'])||0)+'d20 (atributo) + '+(Number(state.skills?.Ocultismo?.training)||0)+' de treino + bônus extra. DT '+toDt+'.';
 if(costNode)costNode.textContent='Custo total: '+v.total+' PE · PE atuais: '+pe()+' · Disponíveis neste turno: '+availableTurnPE()+' de '+PE_LIMIT()+' PE.';
 let note=v.enhance||'Versão básica. Verifique o limite de PE por turno.';
 const required=Math.max(requirement(v.enhance),v.v==='Discente'?Number(v.d.discenteCircle)||0:v.v==='Verdadeiro'?Number(v.d.verdadeiroCircle)||0:0);
 const circleBlocked=Number(v.r.circle)>permittedCircle()||(required>0&&required>permittedCircle());
 const turnBlocked=v.total>availableTurnPE(),peBlocked=v.total>pe();
 const missingCost=v.v!=='Normal'&&enhancePrice(v.enhance)===null&&v.extra===0;
 if(turnBlocked)note+=' BLOQUEADO: excede os PE restantes neste turno.';
 if(peBlocked)note+=' PE insuficientes.';
 if(circleBlocked)note+=' Bloqueado: círculo não liberado pelo NEX.';
 if(missingCost)note+=' Informe o PE adicional desta versão.';
 if(missingDice)note+=' Informe os dados do efeito (ex.: 2d6+2).';
 if(effect.type==='Buff')note+=' O buff será registrado para aplicar no alvo; não altera automaticamente os atributos da ficha.';
 if(rulesNode)rulesNode.textContent=note;
 const submit=modal.querySelector('#tkCastForm button[type="submit"]');
 if(submit){submit.disabled=turnBlocked||peBlocked||circleBlocked||missingDice||missingCost;submit.title=submit.disabled?'Corrija os dados ou os limites de conjuração':'';}
}
function rollSimpleDicePattern(expr){
 const matched=/^(\d{1,2})d(\d{1,3})(?:[+-]\d{1,3})?$/.exec(String(expr||'').trim().replace(/\s+/g,'').toLowerCase());
 return Boolean(matched&&Number(matched[1])>=1&&Number(matched[1])<=50&&Number(matched[2])>=2&&Number(matched[2])<=1000);
}
function castingResultHTML(m,check,sanity,effect){
 const rows=[];
 if(check)rows.push('<p><strong>Teste de Ocultismo:</strong> ['+esc(check.rolls.join(', '))+'] → '+check.chosen+' + '+check.training+' treino + '+check.bonus+' bônus = <strong>'+check.total+'</strong> · DT '+check.dt+' ('+(check.passed?'Sucesso':'Falha')+')</p>');
 else rows.push('<p><strong>Ritual de Medo:</strong> sem teste de Ocultismo.</p>');
 rows.push('<p><strong>PE:</strong> '+m.total+' gastos · '+pe()+' restantes.</p>');
 rows.push('<p><strong>Sanidade:</strong> -'+sanity.lost+' atual'+(sanity.permanent?' · -'+sanity.permanent+' permanente':'')+'</p>');
 if(effect.damage)rows.push('<p><strong>Dano:</strong> '+esc(effect.damage.expression)+' → ['+esc(effect.damage.rolls.join(', '))+'] = '+effect.damage.total+'</p>');
 if(effect.healing)rows.push('<p><strong>Cura:</strong> '+esc(effect.healing.expression)+' = '+effect.healing.total+'</p>');
 if(effect.type==='Buff')rows.push('<p><strong>Buff:</strong> '+esc(effect.buffText||'Consultar ritual')+'</p>');
 rows.push('<p><strong>DT de resistência do alvo:</strong> '+targetRitualDT()+' (quando aplicável).</p>');
 rows.push('<p class="tk-sub">Falhar no TO não impede a conjuração básica, mas pode causar perda de Sanidade. Confira os efeitos e resistências com o mestre.</p>');
 const infoRows=rows.join('');
 if(effect.damage){
  const toValue=check?check.total:'—';
  const toLabel=check?'OCULTISMO':'SEM TO';
  const detail=check?(check.passed?'Sucesso no TO':'Falha no TO · ritual executado'):'Ritual de Medo: sem TO';
  return '<div class="tk-roll-result">'+
   '<header class="tk-roll-header"><strong>'+esc(m.r.name)+'</strong><button type="button" data-tk-modal-close="1" aria-label="Fechar resultado">×</button></header>'+
   '<div class="tk-roll-content"><div class="tk-roll-symbol" aria-hidden="true"><svg viewBox="0 0 36 36" width="38" height="38"><path fill="#8510c6" d="M18 0 35.5 9v18L18 36 .5 27V9Z"/></svg></div>'+
   '<div class="tk-roll-stat"><strong>'+esc(toValue)+'</strong><span>'+toLabel+'</span></div>'+
   '<div class="tk-roll-divider" aria-hidden="true"></div>'+
   '<div class="tk-roll-stat"><strong>'+esc(effect.damage.total)+'</strong><span>DANO</span></div></div>'+
   '<div class="tk-roll-status">'+esc(detail)+' · '+esc(m.v.toUpperCase())+'</div>'+
   '<details class="tk-roll-more"><summary>Detalhes da conjuração</summary><div class="tk-roll-more-body">'+infoRows+'</div></details>'+
   '</div>';
 }
 return '<div class="tk-row"><h3>Conjuração concluída</h3><button type="button" data-tk-modal-close="1">✕</button></div>'+
 '<p><strong>'+esc(m.r.name)+'</strong> · '+esc(m.v)+'</p>'+infoRows+
 '<div class="tk-foot"><button type="button" data-tk-modal-close="1">Fechar resultado</button></div>';
}
function confirmCast(){
 if(castCommitted)return;
 const m=castMath();if(!m)return;
 const {r,d,v,total,enhance,extra}=m;
 if(!isOccultist()){toast('Somente Ocultistas podem conjurar nesta aba.');return;}
 if(v!=='Normal'&&enhancePrice(enhance)===null&&extra===0){toast('Informe o custo extra da versão aprimorada.');return;}
 const required=Math.max(requirement(enhance),v==='Discente'?Number(d.discenteCircle)||0:v==='Verdadeiro'?Number(d.verdadeiroCircle)||0:0);
 if(required>permittedCircle()||Number(r.circle)>permittedCircle()){toast('Círculo ainda não liberado para este NEX.');return;}
 if(/Afinidade necessária/i.test(enhance)&&!confirm('O aprimoramento exige afinidade. Confirma que seu personagem cumpre este requisito?'))return;
 if(total>pe()){toast('PE insuficientes: necessários '+total+', disponíveis '+pe()+'.');return;}
 if(total>availableTurnPE()){toast('Limite de PE por turno excedido. Restam '+availableTurnPE()+' PE neste turno.');return;}
 const fields=formEffect();
 const needsDamage=['Dano','Dano + Cura'].includes(fields.type);
 const needsHeal=['Cura','Dano + Cura'].includes(fields.type)&&!Boolean(fields.type==='Dano + Cura'&&fields.healFromDamage);
 if((needsDamage&&!rollSimpleDicePattern(fields.damageDice))||(needsHeal&&!rollSimpleDicePattern(fields.healDice))){
  toast('Dados inválidos: informe uma expressão como 2d6+2.');return;
 }
 if(!confirm('Conjurar '+r.name+' ('+v+') por '+total+' PE e rolar o TO?'))return;
 // A confirmação acontece antes do gasto e das rolagens.
 castCommitted=true;
 const effect=computeEffect(fields);
 const isFear=norm(r.element)==='medo';
 const toBonus=Math.max(-99,Math.min(99,Math.floor(Number(modal.querySelector('#tkTOBonus')?.value)||0)));
 const check=isFear?null:occultismRoll(total,toBonus);
 const sanity=applyCastSanity(r.element,v,total,check);
 const active=Boolean(modal.querySelector('#tkCastActive')?.checked);
 const upkeep=Math.min(99,Math.max(0,Number(modal.querySelector('#tkCastUpkeep')?.value)||0));
 state.peCurrent=Math.max(0,pe()-total);
 kit().turnSpent+=total;
 kit().effectConfigs[signature(r)+'|'+v]=fields;
 addHistory('Conjuração',{name:r.name,ritualId:String(r.id),version:v,cost:total,peAfter:pe(),to:check,effect,sanLoss:sanity.lost,permanentSanLoss:sanity.permanent,targetDT:targetRitualDT()});
 if(active){
  kit().active.unshift({id:id(),ritualId:String(r.id),name:r.name,version:v,duration:d.duration||'',upkeep,rounds:0,at:new Date().toISOString()});
  if(kit().active.length>60)kit().active.length=60;
 }
 update();
 modal.classList.toggle('nex-tk-result-compact',Boolean(effect.damage));
 modal.innerHTML=castingResultHTML(m,check,sanity,effect);
 castingId='';
 toast('Conjuração registrada: '+total+' PE descontados.');
}
function handleRound(aid){
 if(!isOccultist()){toast('Apenas Ocultistas podem sustentar rituais nesta aba.');return;}
 const k=kit(),a=k.active.find(x=>x.id===aid);if(!a)return;
 const cost=Math.max(0,Number(a.upkeep)||0);
 if(cost>pe()){toast('PE insuficientes para sustentar este ritual.');return;}
 if(cost>availableTurnPE()){toast('Não há PE suficientes neste turno para a sustentação.');return;}
 if(cost&&!confirm('Sustentar '+a.name+' por '+cost+' PE nesta rodada?'))return;
 if(cost){state.peCurrent=Math.max(0,pe()-cost);kit().turnSpent+=cost;}
 a.rounds=(Number(a.rounds)||0)+1;
 addHistory('Rodada acompanhada',{name:a.name,version:a.version,cost,peAfter:pe(),note:'Rodada '+a.rounds});
 update();
}
function handleLearn(key){
 const r=catalog().find(x=>signature(x)===key);if(!r)return;
 if(typeof nex12CanShowRituals==='function'&&!nex12CanShowRituals()){toast('Este personagem ainda não tem acesso a rituais.');return;}
 if(state.class==='Ocultista'&&typeof nex12RitualAllowed==='function'&&Number(r.circle)>nex12RitualAllowed()){toast('Círculo bloqueado por NEX.');return;}
 if(learned().some(x=>signature(x)===key)){toast('Ritual já aprendido.');return;}
 if(learned().length>=100){toast('Limite de 100 rituais na ficha.');return;}
 const entry={id:id(),name:r.name,element:r.element,circle:Number(r.circle),extra:0,source:r.source,catalogKey:r.source==='Homebrew'?'hb:'+r.id:undefined,
  execution:r.execution||'',range:r.range||'',target:r.target||'',duration:r.duration||'',resistance:r.resistance||'',
  discente:r.discente||'',verdadeiro:r.verdadeiro||'',note:r.description||''};
 state.rituals.push(entry);
 update();
 toast(r.name+' adicionado à ficha.');
}
host.addEventListener('click',e=>{
 const btn=e.target.closest('button');if(!btn)return;
 if(btn.dataset.tkTab){view=btn.dataset.tkTab;top();return;}
 if(btn.dataset.tkNextTurn){if(!isOccultist())return;const k=kit();k.turnSpent=0;k.turnNumber++;addHistory('Novo turno',{note:'Turno '+k.turnNumber+', limite renovado',cost:0});update();return;}
 if(btn.dataset.tkLearn){if(isOccultist())handleLearn(btn.dataset.tkLearn);return;}
 if(btn.dataset.tkCast){openCast(btn.dataset.tkCast,btn.dataset.tkVersion||'Normal');return;}
 if(btn.dataset.tkRound){handleRound(btn.dataset.tkRound);return;}
 if(btn.dataset.tkEnd){
  const k=kit(),a=k.active.find(x=>x.id===btn.dataset.tkEnd);if(!a)return;
  k.active=k.active.filter(x=>x.id!==a.id);addHistory('Encerramento',{name:a.name,version:a.version,cost:0});update();return;
 }
 if(btn.dataset.tkSceneEnd){
  const k=kit();if(!k.active.length||!confirm('Encerrar todos os '+k.active.length+' rituais ativos desta cena?'))return;
  const count=k.active.length;k.active=[];addHistory('Fim da cena',{note:count+' rituais encerrados',cost:0});update();return;
 }
 if(btn.dataset.tkClear){
  if(!confirm('Apagar apenas o histórico de rituais desta ficha? Isso não restaura PE.'))return;
  kit().history=[];update();return;
 }
 if(btn.dataset.tkDeleteCombo){
  kit().combos=kit().combos.filter(x=>x.id!==btn.dataset.tkDeleteCombo);update();return;
 }
});
host.addEventListener('input',e=>{
 if(e.target.id==='tkSearch'){query=e.target.value;drawGrimoire();}
 if(e.target.id==='tkLearnedSearch'){query=e.target.value;drawLearned();}
});
host.addEventListener('change',e=>{
 if(e.target.id==='tkElement'){element=e.target.value;drawGrimoire();}
 if(e.target.id==='tkCircle'){circle=e.target.value;drawGrimoire();}
 if(e.target.id==='tkSource'){source=e.target.value;drawGrimoire();}
});
host.addEventListener('submit',e=>{
 if(e.target.id!=='tkComboForm')return;
 e.preventDefault();
 const form=e.target;
 const name=String(form.elements.name.value||'').trim().slice(0,75);
 const note=String(form.elements.note.value||'').trim().slice(0,240);
 const ids=[...form.querySelectorAll('input[name="ritual"]:checked')].map(x=>x.value);
 if(!name||ids.length<2||ids.length>8){toast('Informe um nome e selecione entre 2 e 8 rituais.');return;}
 if(kit().combos.length>=60){toast('Limite de 60 combinações nesta ficha.');return;}
 kit().combos.unshift({id:id(),name,note,ritualIds:ids,at:new Date().toISOString()});
 update();toast('Combinação salva nesta ficha.');
});
modal.addEventListener('click',e=>{
 if(e.target.closest('[data-tk-modal-close]')){if(typeof modal.close==='function')modal.close();else modal.open=false;castingId='';}
});
modal.addEventListener('input',e=>{if(['tkCastExtra','tkTOBonus','tkDamageDice','tkHealDice','tkBuffText'].includes(e.target.id))preview();});
modal.addEventListener('change',e=>{if(e.target.id==='tkCastVersion'){syncEffectFields(true);preview();}if(['tkEffectType','tkHealHalf'].includes(e.target.id)){syncEffectFields(false);preview();}});
modal.addEventListener('submit',e=>{if(e.target.id==='tkCastForm'){e.preventDefault();confirmCast();}});
const previous=nex12RenderRitualList;
nex12RenderRitualList=function(...args){const result=previous.apply(this,args);top();return result;};
window.NEX_RITUAL_TOOLS={refresh:top};
top();
})();