/* NEX — Rituais: catálogo de nomes/metadados, DT automática, cartões e edição.
   Os textos explicativos são resumos próprios, não transcrições dos livros. */
(function(){
'use strict';
const root=document.getElementById('rituals'),list=document.getElementById('ritualList');
if(!root||!list||typeof state==='undefined'||typeof maxValues!=='function')return;
const BASE=[{"name":"Amaldiçoar Arma","circle":1,"element":"Conhecimento","source":"Livro básico"},{"name":"Compreensão Paranormal","circle":1,"element":"Conhecimento","source":"Livro básico"},{"name":"Enfeitiçar","circle":1,"element":"Conhecimento","source":"Livro básico"},{"name":"Perturbação","circle":1,"element":"Conhecimento","source":"Livro básico"},{"name":"Ouvir os Sussurros","circle":1,"element":"Conhecimento","source":"Livro básico"},{"name":"Tecer Ilusão","circle":1,"element":"Conhecimento","source":"Livro básico"},{"name":"Terceiro Olho","circle":1,"element":"Conhecimento","source":"Livro básico"},{"name":"Amaldiçoar Arma","circle":1,"element":"Energia","source":"Livro básico"},{"name":"Amaldiçoar Tecnologia","circle":1,"element":"Energia","source":"Livro básico"},{"name":"Coincidência Forçada","circle":1,"element":"Energia","source":"Livro básico"},{"name":"Eletrocussão","circle":1,"element":"Energia","source":"Livro básico"},{"name":"Embaralhar","circle":1,"element":"Energia","source":"Livro básico"},{"name":"Luz","circle":1,"element":"Energia","source":"Livro básico"},{"name":"Polarização Caótica","circle":1,"element":"Energia","source":"Livro básico"},{"name":"Amaldiçoar Arma","circle":1,"element":"Morte","source":"Livro básico"},{"name":"Cicatrização","circle":1,"element":"Morte","source":"Livro básico"},{"name":"Consumir Manancial","circle":1,"element":"Morte","source":"Livro básico"},{"name":"Decadência","circle":1,"element":"Morte","source":"Livro básico"},{"name":"Definhar","circle":1,"element":"Morte","source":"Livro básico"},{"name":"Espirais da Perdição","circle":1,"element":"Morte","source":"Livro básico"},{"name":"Nuvem de Cinzas","circle":1,"element":"Morte","source":"Livro básico"},{"name":"Amaldiçoar Arma","circle":1,"element":"Sangue","source":"Livro básico"},{"name":"Arma Atroz","circle":1,"element":"Sangue","source":"Livro básico"},{"name":"Armadura de Sangue","circle":1,"element":"Sangue","source":"Livro básico"},{"name":"Corpo Adaptado","circle":1,"element":"Sangue","source":"Livro básico"},{"name":"Distorcer Aparência","circle":1,"element":"Sangue","source":"Livro básico"},{"name":"Fortalecimento Sensorial","circle":1,"element":"Sangue","source":"Livro básico"},{"name":"Ódio Incontrolável","circle":1,"element":"Sangue","source":"Livro básico"},{"name":"Cinerária","circle":1,"element":"Medo","source":"Livro básico"},{"name":"Aprimorar Mente","circle":2,"element":"Conhecimento","source":"Livro básico"},{"name":"Detecção de Ameaças","circle":2,"element":"Conhecimento","source":"Livro básico"},{"name":"Esconder dos Olhos","circle":2,"element":"Conhecimento","source":"Livro básico"},{"name":"Invadir Mente","circle":2,"element":"Conhecimento","source":"Livro básico"},{"name":"Localização","circle":2,"element":"Conhecimento","source":"Livro básico"},{"name":"Chamas do Caos","circle":2,"element":"Energia","source":"Livro básico"},{"name":"Contenção Fantasmagórica","circle":2,"element":"Energia","source":"Livro básico"},{"name":"Dissonância Acústica","circle":2,"element":"Energia","source":"Livro básico"},{"name":"Sopro do Caos","circle":2,"element":"Energia","source":"Livro básico"},{"name":"Tela de Ruído","circle":2,"element":"Energia","source":"Livro básico"},{"name":"Desacelerar Impacto","circle":2,"element":"Morte","source":"Livro básico"},{"name":"Eco Espiral","circle":2,"element":"Morte","source":"Livro básico"},{"name":"Paradoxo","circle":2,"element":"Morte","source":"Livro básico"},{"name":"Miasma Entrópico","circle":2,"element":"Morte","source":"Livro básico"},{"name":"Velocidade Mortal","circle":2,"element":"Morte","source":"Livro básico"},{"name":"Aprimorar Físico","circle":2,"element":"Sangue","source":"Livro básico"},{"name":"Descarnar","circle":2,"element":"Sangue","source":"Livro básico"},{"name":"Flagelo de Sangue","circle":2,"element":"Sangue","source":"Livro básico"},{"name":"Hemofagia","circle":2,"element":"Sangue","source":"Livro básico"},{"name":"Transfusão Vital","circle":2,"element":"Sangue","source":"Livro básico"},{"name":"Proteção contra Rituais","circle":2,"element":"Medo","source":"Livro básico"},{"name":"Rejeitar Névoa","circle":2,"element":"Medo","source":"Livro básico"},{"name":"Alterar Memória","circle":3,"element":"Conhecimento","source":"Livro básico"},{"name":"Contato Paranormal","circle":3,"element":"Conhecimento","source":"Livro básico"},{"name":"Mergulho Mental","circle":3,"element":"Conhecimento","source":"Livro básico"},{"name":"Vidência","circle":3,"element":"Conhecimento","source":"Livro básico"},{"name":"Convocação Instantânea","circle":3,"element":"Energia","source":"Livro básico"},{"name":"Salto Fantasma","circle":3,"element":"Energia","source":"Livro básico"},{"name":"Transfigurar Água","circle":3,"element":"Energia","source":"Livro básico"},{"name":"Transfigurar Terra","circle":3,"element":"Energia","source":"Livro básico"},{"name":"Âncora Temporal","circle":3,"element":"Morte","source":"Livro básico"},{"name":"Poeira da Podridão","circle":3,"element":"Morte","source":"Livro básico"},{"name":"Tentáculos de Lodo","circle":3,"element":"Morte","source":"Livro básico"},{"name":"Zerar Entropia","circle":3,"element":"Morte","source":"Livro básico"},{"name":"Ferver Sangue","circle":3,"element":"Sangue","source":"Livro básico"},{"name":"Forma Monstruosa","circle":3,"element":"Sangue","source":"Livro básico"},{"name":"Purgatório","circle":3,"element":"Sangue","source":"Livro básico"},{"name":"Vomitar Pestes","circle":3,"element":"Sangue","source":"Livro básico"},{"name":"Dissipar Ritual","circle":3,"element":"Medo","source":"Livro básico"},{"name":"Controle Mental","circle":4,"element":"Conhecimento","source":"Livro básico"},{"name":"Inexistir","circle":4,"element":"Conhecimento","source":"Livro básico"},{"name":"Possessão","circle":4,"element":"Conhecimento","source":"Livro básico"},{"name":"Alterar Destino","circle":4,"element":"Energia","source":"Livro básico"},{"name":"Deflagração de Energia","circle":4,"element":"Energia","source":"Livro básico"},{"name":"Teletransporte","circle":4,"element":"Energia","source":"Livro básico"},{"name":"Convocar o Algoz","circle":4,"element":"Morte","source":"Livro básico"},{"name":"Distorção Temporal","circle":4,"element":"Morte","source":"Livro básico"},{"name":"Fim Inevitável","circle":4,"element":"Morte","source":"Livro básico"},{"name":"Capturar o Coração","circle":4,"element":"Sangue","source":"Livro básico"},{"name":"Invólucro de Carne","circle":4,"element":"Sangue","source":"Livro básico"},{"name":"Vínculo de Sangue","circle":4,"element":"Sangue","source":"Livro básico"},{"name":"Canalizar o Medo","circle":4,"element":"Medo","source":"Livro básico"},{"name":"Conhecendo o Medo","circle":4,"element":"Medo","source":"Livro básico"},{"name":"Lâmina do Medo","circle":4,"element":"Medo","source":"Livro básico"},{"name":"Medo Tangível","circle":4,"element":"Medo","source":"Livro básico"},{"name":"Presença do Medo","circle":4,"element":"Medo","source":"Livro básico"}];
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const costByCircle={1:1,2:3,3:6,4:10};
const circleAccess=()=>typeof nex12RitualAllowed==='function'?nex12RitualAllowed():1;
const canonical=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const special={
 'Alterar Destino':{execution:'Reação',range:'Pessoal',target:'Você',duration:'Instantânea',description:'Permite alterar a chance de sucesso diante de um perigo iminente.',trueText:'Sua versão avançada permite beneficiar um aliado próximo.'},
 'Cicatrização':{description:'Acelera a recuperação dos ferimentos de um personagem.'},
 'Terceiro Olho':{description:'Ajuda a perceber manifestações paranormais normalmente ocultas.'},
 'Luz':{description:'Faz um objeto iluminar o ambiente ao redor.'},
 'Embaralhar':{description:'Cria imagens duplicadas que dificultam identificar o alvo real.'},
 'Tecer Ilusão':{description:'Manifesta uma imagem ou som ilusório.'}
};
function catalogue(){
 const result=BASE.map((b,i)=>({...b,key:'base:'+i,description:special[b.name]?.description||'',...special[b.name]}));
 for(const r of window.NEX_SAH?.rituals||[]){
   if(!r?.name)continue;
   result.push({name:r.name,circle:Number(r.circle)||1,element:r.element||'Conhecimento',source:'Sobrevivendo ao Horror',description:r.description||'',key:'sah:'+r.name});
 }
 const hb=window.NEX51?.readLibrary?.()||[];
 for(const r of hb.filter(x=>x?.type==='ritual'&&x?.name)){
   result.push({...r,source:'Homebrew',key:'hb:'+r.id,description:r.effect||r.description||''});
 }
 return result;
}
function metadata(record){
 const src=record.source||'Personalizado';
 const match=catalogue().find(x=>x.key===record.catalogKey || (x.name===record.name&&x.element===record.element&&x.circle===Number(record.circle)));
 return {...match,...record,source:record.source||match?.source||src};
}
function ritualDT(){const limit=Math.max(0,Number(maxValues().peLimit)||0);const pre=Math.max(0,Number(state.attributes?.pre)||0);return 10+limit+pre+(Number(state.ritualDtBonus)||0);}
for(const child of [...root.children]){if(child!==list)child.hidden=true;}
const controls=document.createElement('div');controls.id='nexRitualsControls';
controls.innerHTML='<div class="nex-ritual-top"><button class="btn primary" type="button" id="nexRitualAddButton">Adicionar</button><div class="nex-ritual-dt">DT DE RITUAIS <output id="nexRitualDT">—</output></div></div><div class="nex-ritual-bottom"><button type="button" class="btn" id="nexRitualNewButton">Novo Ritual</button><label>Bônus de DT <input type="number" id="nexRitualDTBonus" min="-50" max="50" step="1" value="0"></label></div><p class="nex-ritual-hint">DT = 10 + limite de PE por turno + Presença + bônus. O teste de Custo do Paranormal usa outra DT.</p>';
root.insertBefore(controls,list);
const dialog=document.createElement('dialog');dialog.id='nexRitualDialog';dialog.setAttribute('aria-label','Selecionar ou editar ritual');
dialog.innerHTML='<header><strong id="nexRitualDialogTitle">Adicionar ritual</strong><button type="button" class="btn" id="nexRitualDialogClose">✕</button></header><div id="nexRitualSelector"><div class="nex-ritual-filter"><input type="search" id="nexRitualSearch" placeholder="Buscar ritual..." aria-label="Buscar ritual"><select id="nexRitualSource" aria-label="Livro"><option value="Todos">Todos os livros</option><option>Livro básico</option><option>Sobrevivendo ao Horror</option><option>Homebrew</option></select><select id="nexRitualCircleFilter" aria-label="Círculo"><option value="">Todos os círculos</option><option value="1">1º círculo</option><option value="2">2º círculo</option><option value="3">3º círculo</option><option value="4">4º círculo</option></select></div><div id="nexRitualChoices" class="nex-ritual-choices"></div></div><form id="nexRitualEditor" hidden><input id="nexRitualEditId" type="hidden"><label>Nome<input id="nexRitualName" required maxlength="90"></label><div class="nex-ritual-fields"><label>Elemento<select id="nexRitualElement"><option>Conhecimento</option><option>Energia</option><option>Morte</option><option>Sangue</option><option>Medo</option></select></label><label>Círculo<select id="nexRitualCircle"><option value="1">1º</option><option value="2">2º</option><option value="3">3º</option><option value="4">4º</option></select></label><label>Execução<input id="nexRitualExecution" maxlength="80" placeholder="Ex.: Padrão"></label><label>Alcance<input id="nexRitualRange" maxlength="80" placeholder="Ex.: Pessoal"></label><label>Alvo<input id="nexRitualTarget" maxlength="90"></label><label>Duração<input id="nexRitualDuration" maxlength="90"></label><label>Resistência<input id="nexRitualResistance" maxlength="100"></label></div><label>Resumo e anotações<textarea id="nexRitualDescription" rows="5" maxlength="2000"></textarea></label><label>Aprimoramento Discente<textarea id="nexRitualDiscente" rows="2" maxlength="1000"></textarea></label><label>Aprimoramento Verdadeiro<textarea id="nexRitualVerdadeiro" rows="2" maxlength="1000"></textarea></label><button class="btn primary" type="submit">Salvar ritual</button></form>';
document.body.append(dialog);
function show(){if(typeof dialog.showModal==='function')dialog.showModal();else dialog.open=true;}
function close(){if(typeof dialog.close==='function')dialog.close();else dialog.open=false;}
function renderChoices(){
 const q=canonical($('nexRitualSearch').value.trim()),src=$('nexRitualSource').value,circle=$('nexRitualCircleFilter').value;
 const options=catalogue().filter(r=>(src==='Todos'||r.source===src)&&(!circle||String(r.circle)===circle)&&(!q||canonical(r.name+' '+r.element+' '+r.source).includes(q))).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')||a.circle-b.circle);
 $('nexRitualChoices').innerHTML=options.length?options.map(r=>{
  const locked=state.class==='Ocultista'&&r.circle>circleAccess();
  const already=state.rituals.some(x=>x.catalogKey===r.key);
  return '<div class="nex-ritual-option"><div><strong>'+esc(r.name)+'</strong><small>'+esc(r.element)+' · '+esc(r.circle)+'º círculo · '+esc(r.source)+'</small></div><button type="button" data-r-key="'+esc(r.key)+'" '+(locked||already?'disabled':'')+' class="btn sm">'+(already?'Adicionado':locked?'Bloqueado':'Adicionar')+'</button></div>';
 }).join(''):'<p class="nex-ritual-hint">Nenhum ritual encontrado.</p>';
}
function openSelector(){$('nexRitualEditor').hidden=true;$('nexRitualSelector').hidden=false;$('nexRitualDialogTitle').textContent='Adicionar ritual';renderChoices();show();}
function openEditor(r=null){
 $('nexRitualSelector').hidden=true;$('nexRitualEditor').hidden=false;
 $('nexRitualDialogTitle').textContent=r?'Editar ritual':'Novo ritual';
 $('nexRitualEditId').value=r?.id||'';
 $('nexRitualName').value=r?.name||'';
 $('nexRitualElement').value=r?.element||'Conhecimento';
 $('nexRitualCircle').value=String(r?.circle||1);
 for(const [id,key] of [['nexRitualExecution','execution'],['nexRitualRange','range'],['nexRitualTarget','target'],['nexRitualDuration','duration'],['nexRitualResistance','resistance'],['nexRitualDescription','note'],['nexRitualDiscente','discente'],['nexRitualVerdadeiro','verdadeiro']])$(id).value=r?.[key]||'';
 show();
}
function addRecord(template){
 if(state.class==='Ocultista'&&template.circle>circleAccess())return;
 if(state.rituals.length>=100){toast('Limite de 100 rituais na ficha.');return;}
 state.rituals.push({id:'nr'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),name:template.name,circle:template.circle,element:template.element,extra:0,note:template.description||'',catalogKey:template.key,source:template.source,execution:template.execution||'',range:template.range||'',target:template.target||'',duration:template.duration||'',resistance:template.resistance||'',discente:template.discente||'',verdadeiro:template.verdadeiro||'',image:template.image||''});
 save();render();close();
}
function lines(label,value){return value?'<p><span>'+esc(label)+':</span> '+esc(value)+'</p>':'';}
function render(){
 const can=typeof nex12CanShowRituals==='function'?nex12CanShowRituals():true;
 if(typeof nex12UpdateTabVisibility==='function')nex12UpdateTabVisibility();
 $('nexRitualDT').textContent=ritualDT();
 $('nexRitualDTBonus').value=String(Number(state.ritualDtBonus)||0);
 if(!can){list.innerHTML='<p class="nex-ritual-hint">Acesso a rituais depende de classe ou habilidade específica.</p>';return;}
 list.innerHTML=(state.rituals||[]).length?state.rituals.map(r=>{
  const d=metadata(r),cost=(costByCircle[Number(r.circle)]||1)+Math.max(0,Number(r.extra)||0);
  const blocked=state.class==='Ocultista'&&Number(r.circle)>circleAccess();
  return '<article class="nex-ritual-card"><details><summary><span class="nex-ritual-arrow">⌃</span><strong>'+esc(r.name)+'</strong></summary>'+
   '<div class="nex-ritual-detail"><div class="nex-ritual-pill nex-ritual-'+esc(r.element)+'">'+esc(r.element).toUpperCase()+' '+esc(r.circle)+'</div>'+
   (d.image?'<img src="'+esc(d.image)+'" alt="Símbolo do ritual" class="nex-ritual-image">':'')+
   '<div class="nex-ritual-properties">'+lines('Execução',d.execution)+lines('Alcance',d.range)+lines('Alvo',d.target)+lines('Duração',d.duration)+lines('Resistência',d.resistance)+'</div>'+
   '<p class="nex-ritual-summary">'+esc(d.note||d.description||'Efeito não cadastrado. Confira as informações no livro ou edite o resumo.')+'</p>'+
   (d.discente?'<p class="nex-ritual-enhance"><b>Discente:</b> '+esc(d.discente)+'</p>':'')+
   (d.verdadeiro?'<p class="nex-ritual-enhance"><b>Verdadeiro:</b> '+esc(d.verdadeiro)+'</p>':'')+
   '<div class="nex-ritual-actions"><button type="button" data-ritual-remove="'+esc(r.id)+'">Remover</button><button type="button" data-ritual-edit="'+esc(r.id)+'">Editar</button></div>'+
   '<small>'+esc(d.source||'Ritual personalizado')+' · '+esc(cost)+' PE'+(blocked?' · Círculo acima do disponível':'')+'</small></div></details></article>';
 }).join(''):'<p class="nex-ritual-hint">Nenhum ritual aprendido. Clique em Adicionar para escolher um.</p>';
}
$('nexRitualAddButton').addEventListener('click',openSelector);
$('nexRitualNewButton').addEventListener('click',()=>openEditor());
$('nexRitualDialogClose').addEventListener('click',close);
$('nexRitualSearch').addEventListener('input',renderChoices);
$('nexRitualSource').addEventListener('change',renderChoices);
$('nexRitualCircleFilter').addEventListener('change',renderChoices);
$('nexRitualChoices').addEventListener('click',e=>{
 const button=e.target.closest('[data-r-key]');if(!button||button.disabled)return;
 const r=catalogue().find(x=>x.key===button.dataset.rKey);if(r)addRecord(r);
});
$('nexRitualDTBonus').addEventListener('change',e=>{state.ritualDtBonus=Math.max(-50,Math.min(50,Number(e.target.value)||0));save();render();});
list.addEventListener('click',e=>{
 const edit=e.target.closest('[data-ritual-edit]'),del=e.target.closest('[data-ritual-remove]');
 if(edit){const r=state.rituals.find(x=>String(x.id)===edit.dataset.ritualEdit);if(r)openEditor(r);}
 if(del){state.rituals=state.rituals.filter(x=>String(x.id)!==del.dataset.ritualRemove);save();render();}
});
$('nexRitualEditor').addEventListener('submit',e=>{
 e.preventDefault();
 const id=$('nexRitualEditId').value;
 const values={name:$('nexRitualName').value.trim().slice(0,90),element:$('nexRitualElement').value,circle:Number($('nexRitualCircle').value),execution:$('nexRitualExecution').value.trim(),range:$('nexRitualRange').value.trim(),target:$('nexRitualTarget').value.trim(),duration:$('nexRitualDuration').value.trim(),resistance:$('nexRitualResistance').value.trim(),note:$('nexRitualDescription').value.trim(),discente:$('nexRitualDiscente').value.trim(),verdadeiro:$('nexRitualVerdadeiro').value.trim()};
 if(!values.name)return;
 if(state.class==='Ocultista'&&values.circle>circleAccess()){toast('Círculo não liberado para este NEX.');return;}
 if(id){const record=state.rituals.find(x=>String(x.id)===id);if(record)Object.assign(record,values);}
 else addRecord({...values,source:'Personalizado',key:'custom:'+Date.now(),description:values.note});
 save();render();close();
});
document.addEventListener('change',e=>{if(['nex','class'].includes(e.target?.id)||e.target?.dataset?.field==='class')queueMicrotask(render);});
document.addEventListener('input',e=>{if(e.target?.dataset?.attribute==='pre'||e.target?.id==='pre')queueMicrotask(render);});
nex12RenderRitualList=render;
render();
})();