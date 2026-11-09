/* NEX • Ferramentas de rituais v1
   Implementação independente: grimório, conjuração, efeitos ativos, histórico e combinações.
   Todos os novos dados pertencem à ficha atual (state.ritualToolkit).
*/
(function(){
'use strict';
const root=document.getElementById('rituals');
const list=document.getElementById('ritualList');
if(!root||!list||typeof state==='undefined'||typeof save!=='function'||typeof nex12RenderRitualList!=='function')return;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const id=()=>('rt'+Date.now().toString(36)+Math.random().toString(36).slice(2,9));
const baseCost={1:1,2:3,3:6,4:10};
const maxCost=99;
let view='grimorio',query='',element='',circle='',source='';
let castingId='';
function kit(){
 if(!state.ritualToolkit||typeof state.ritualToolkit!=='object'||Array.isArray(state.ritualToolkit))state.ritualToolkit={};
 const k=state.ritualToolkit;
 for(const field of ['active','history','combos'])if(!Array.isArray(k[field]))k[field]=[];
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
function badgeInfo(){
 const n=learned().length,a=kit().active.length,h=kit().history.length,c=kit().combos.length;
 return 'Aprendidos: '+n+' · Ativos: '+a+' · Usos registrados: '+h+' · Combinações: '+c;
}
const host=document.createElement('section');
host.id='nexTkPanel';
host.setAttribute('aria-label','Ferramentas de rituais');
root.insertBefore(host,list);
const modal=document.createElement('dialog');
modal.id='nexTkCastDialog';modal.setAttribute('aria-label','Conjurar ritual');
document.body.append(modal);
const style=document.createElement('style');
style.id='nexTkStyle';
style.textContent='#nexTkPanel{border:1px solid #3b314b;border-radius:8px;padding:13px;margin:10px 0 18px;background:#17131c;color:#eee7f4}#nexTkPanel .tk-tabs{display:flex;flex-wrap:wrap;gap:6px;margin:9px 0 13px}#nexTkPanel .tk-tabs button{border:1px solid #53465e;background:#211b28;color:#e2d4ed;border-radius:5px;padding:8px 10px}#nexTkPanel .tk-tabs button[aria-pressed="true"]{background:#63398a;color:#fff;border-color:#a06bc9}#nexTkPanel h3{font-size:12px;color:#e4d0f6;margin:12px 0 7px}#nexTkPanel .tk-sub{font-size:12px;color:#ad9fba}#nexTkPanel .tk-fields{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}#nexTkPanel .tk-fields>*{flex:1 1 130px;max-width:100%}#nexTkPanel .tk-cards{display:grid;gap:8px;max-height:530px;overflow:auto;padding-right:2px}#nexTkPanel .tk-card{background:#221b2a;border:1px solid #493a55;padding:10px;border-radius:6px}#nexTkPanel .tk-row{display:flex;align-items:center;justify-content:space-between;gap:9px;flex-wrap:wrap}#nexTkPanel .tk-card details>summary{cursor:pointer;font-weight:700;margin-top:7px}#nexTkPanel .tk-card p{white-space:pre-wrap;margin:6px 0;font-size:12px}#nexTkPanel .tk-actions{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 0}#nexTkPanel button.tk-button,#nexTkCastDialog button{border:1px solid #665071;color:#f0e6fb;background:#3b284d;border-radius:5px;padding:7px 10px;cursor:pointer}#nexTkPanel button[disabled],#nexTkCastDialog button[disabled]{opacity:.5;cursor:not-allowed}#nexTkPanel input,#nexTkPanel select,#nexTkPanel textarea,#nexTkCastDialog input,#nexTkCastDialog select{background:#120f18;border:1px solid #59466a;border-radius:4px;padding:8px;color:white;width:100%;font:inherit}#nexTkPanel label,#nexTkCastDialog label{display:block;color:#d4c2de;font-size:12px}#nexTkPanel .tk-select-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:5px;max-height:230px;overflow:auto}#nexTkPanel .tk-select-list label{padding:7px;border:1px solid #473652;border-radius:5px}#nexTkPanel input[type=checkbox],#nexTkCastDialog input[type=checkbox]{width:auto;margin-right:7px}#nexTkCastDialog{background:#1a1421;border:1px solid #79549a;color:#f3ebfa;border-radius:9px;width:min(480px,calc(100vw - 24px));max-height:88vh;overflow:auto;padding:18px}#nexTkCastDialog::backdrop{background:#000b}#nexTkCastDialog .tk-modal-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:12px 0}#nexTkCastDialog .tk-modal-fields>label:first-child{grid-column:1/-1}#nexTkCastDialog .tk-foot{display:flex;justify-content:flex-end;gap:8px;margin-top:12px}#nexTkCastDialog .tk-warning{font-size:12px;color:#f0bd8c;margin-top:7px}#nexTkPanel .tk-mono{font-variant-numeric:tabular-nums}';
document.head.append(style);
function top(){
 host.innerHTML='<div class="tk-row"><strong>GRIMÓRIO E CONTROLE DE RITUAIS</strong><small id="tkCounts" class="tk-sub"></small></div>'+
 '<nav class="tk-tabs" aria-label="Módulos de rituais">'+
 [['grimorio','Grimório'],['ativos','Rituais ativos'],['historico','Histórico'],['combos','Combinações']].map(x=>'<button type="button" data-tk-tab="'+x[0]+'" aria-pressed="'+String(view===x[0])+'">'+x[1]+'</button>').join('')+
 '</nav><div id="tkBody"></div>';
 document.getElementById('tkCounts').textContent=badgeInfo();
 renderBody();
}
function renderBody(){
 if(!host.isConnected)return;
 const el=document.getElementById('tkBody');if(!el)return;
 document.getElementById('tkCounts').textContent=badgeInfo();
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
   (arr.length?'<div class="tk-cards">'+arr.map(h=>'<article class="tk-card"><div class="tk-row"><strong>'+esc(h.type)+'</strong><small>'+esc(new Date(h.at).toLocaleString('pt-BR'))+'</small></div><p>'+esc(h.name||h.note||'')+(h.version?' · '+esc(h.version):'')+'</p><p class="tk-sub">'+(Number(h.cost)>0?'-'+esc(h.cost)+' PE'+(h.peAfter!==undefined?' · Restantes: '+esc(h.peAfter)+' PE':''):'Sem gasto de PE')+'</p></article>').join('')+'</div>':'<p class="tk-sub">O histórico será preenchido quando você conjurar ou sustentar rituais.</p>');
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
function openCast(rid){
 const r=learned().find(x=>String(x.id)===String(rid));if(!r){toast('Ritual não encontrado nesta ficha.');return;}
 castingId=String(rid);
 const d=info(r);
 const options=['Normal'].concat(hasEnhance(d.discente)?['Discente']:[],hasEnhance(d.verdadeiro)?['Verdadeiro']:[]);
 const isActive=!/instant[aâ]nea|instant[aâ]neo/i.test(d.duration||'');
 modal.innerHTML='<div class="tk-row"><h3>Conjurar: '+esc(r.name)+'</h3><button type="button" data-tk-modal-close="1" aria-label="Fechar">✕</button></div>'+
 '<p class="tk-sub">Círculo '+esc(r.circle)+' · '+esc(r.element)+' · Duração: '+esc(d.duration||'não informada')+'</p>'+
 '<form id="tkCastForm"><div class="tk-modal-fields">'+
 '<label>Versão<select id="tkCastVersion">'+options.map(v=>'<option>'+esc(v)+'</option>').join('')+'</select></label>'+
 '<label>PE adicional por ajustes<input id="tkCastExtra" type="number" min="0" max="99" step="1" value="0"></label>'+
 '<label>Custo de sustentação (PE/rodada)<input id="tkCastUpkeep" type="number" min="0" max="99" step="1" value="'+(/sustentad/i.test(d.duration||'')?'1':'0')+'"></label>'+
 '</div><label><input id="tkCastActive" type="checkbox" '+(isActive?'checked':'')+'>Manter ativo e acompanhar rodadas</label>'+
 '<p id="tkCostPreview" class="tk-warning"></p><p id="tkRulesPreview" class="tk-sub"></p>'+
 '<div class="tk-foot"><button type="button" data-tk-modal-close="1">Cancelar</button><button type="submit">Confirmar conjuração</button></div></form>';
 if(typeof modal.showModal==='function')modal.showModal();else modal.open=true;
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
 const price=enhancePrice(v.enhance);
 const costNode=modal.querySelector('#tkCostPreview');
 const rulesNode=modal.querySelector('#tkRulesPreview');
 costNode.textContent='Custo total: '+v.total+' PE · Disponíveis: '+pe()+' PE · Custo base: '+(baseCost[v.r.circle]||1)+' PE.';
 let note=v.enhance||'Versão básica. Verifique o limite de PE por turno.';
 if(v.v!=='Normal'&&price===null)note+=' Custo adicional não informado; preencha o campo de ajustes.';
 const limit=typeof maxValues==='function'?maxValues().peLimit:0;
 if(v.total>limit&&limit)note+=' Atenção: excede o limite básico de PE por turno ('+limit+'); confirme modificadores e permissões.';
 rulesNode.textContent=note;
}
function confirmCast(){
 const m=castMath();if(!m)return;
 const {r,d,v,total,enhance,extra}=m;
 if(v!=='Normal'&&enhancePrice(enhance)===null&&extra===0){toast('Informe os PE extras da versão aprimorada antes de conjurar.');return;}
 const required=requirement(enhance);
 if(required&&state.class==='Ocultista'&&typeof nex12RitualAllowed==='function'&&nex12RitualAllowed()<required){toast('A versão exige um círculo ainda não liberado.');return;}
 if(state.class==='Ocultista'&&typeof nex12RitualAllowed==='function'&&Number(r.circle)>nex12RitualAllowed()){toast('Círculo ainda não liberado.');return;}
 if(/Afinidade necessária/i.test(enhance)&&!confirm('O aprimoramento exige afinidade. Confirma que seu personagem cumpre este requisito?'))return;
 if(total>pe()){toast('PE insuficientes: necessários '+total+', disponíveis '+pe()+'.');return;}
 const limit=typeof maxValues==='function'?Number(maxValues().peLimit)||0:0;
 if(limit&&total>limit&&!confirm('O gasto total excede o limite básico de PE por turno. Há alguma habilidade que permite esse gasto?'))return;
 if(!confirm('Conjurar '+r.name+' ('+v+') por '+total+' PE?'))return;
 const active=Boolean(modal.querySelector('#tkCastActive')?.checked);
 const upkeep=Math.min(99,Math.max(0,Number(modal.querySelector('#tkCastUpkeep')?.value)||0));
 state.peCurrent=Math.max(0,pe()-total);
 addHistory('Conjuração',{name:r.name,ritualId:String(r.id),version:v,cost:total,peAfter:pe()});
 if(active){
  kit().active.unshift({id:id(),ritualId:String(r.id),name:r.name,version:v,duration:d.duration||'',upkeep,rounds:0,at:new Date().toISOString()});
  if(kit().active.length>60)kit().active.length=60;
 }
 if(typeof modal.close==='function')modal.close();else modal.open=false;
 castingId='';
 update();
 toast('Ritual conjurado: '+total+' PE descontados.');
}
function handleRound(aid){
 const k=kit(),a=k.active.find(x=>x.id===aid);if(!a)return;
 const cost=Math.max(0,Number(a.upkeep)||0);
 if(cost>pe()){toast('PE insuficientes para sustentar este ritual. Encerre ou ajuste com o mestre.');return;}
 if(cost&&!confirm('Sustentar '+a.name+' por '+cost+' PE nesta rodada?'))return;
 if(cost)state.peCurrent=Math.max(0,pe()-cost);
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
 if(btn.dataset.tkLearn){handleLearn(btn.dataset.tkLearn);return;}
 if(btn.dataset.tkCast){openCast(btn.dataset.tkCast);return;}
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
modal.addEventListener('input',e=>{if(['tkCastVersion','tkCastExtra'].includes(e.target.id))preview();});
modal.addEventListener('change',e=>{if(e.target.id==='tkCastVersion')preview();});
modal.addEventListener('submit',e=>{if(e.target.id==='tkCastForm'){e.preventDefault();confirmCast();}});
list.addEventListener('click',e=>{
 const btn=e.target.closest('[data-tk-cast-from-sheet]');
 if(btn){e.preventDefault();openCast(btn.dataset.tkCastFromSheet);}
});
const previous=nex12RenderRitualList;
nex12RenderRitualList=function(...args){const result=previous.apply(this,args);top();return result;};
window.NEX_RITUAL_TOOLS={refresh:top};
top();
})();