/* NEX 2.0.51 — Homebrew Avançado, dados locais */
(()=>{
'use strict';
const KEY='nex_homebrew_advanced_v2051';
const TYPES={poder:'Poder',trilha:'Trilha',habilidade:'Habilidade',ritual:'Ritual'};
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const bounded=(v,n)=>String(v??'').trim().slice(0,n);
const number=(v,min,max,def)=>{const n=Number(v);return Number.isFinite(n)?Math.min(max,Math.max(min,Math.floor(n))):def;};
const valid=x=>x&&typeof x==='object'&&!Array.isArray(x)&&/^[\w-]{3,100}$/.test(x.id)&&Object.hasOwn(TYPES,x.type)&&typeof x.name==='string'&&x.name.trim().length>0;
const clean=x=>({id:x.id,type:x.type,name:bounded(x.name,90),description:bounded(x.description,2000),requirements:bounded(x.requirements,650),minNex:number(x.minNex,0,99,5),className:['Livre','Combatente','Especialista','Ocultista'].includes(x.className)?x.className:'Livre',circle:number(x.circle,1,4,1),element:['Conhecimento','Energia','Morte','Sangue','Medo','Personalizado'].includes(x.element)?x.element:'Personalizado',cost:number(x.cost,0,99,0)});
function read(){
 try{const data=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(data)?data.filter(valid).slice(0,300).map(clean):[];}
 catch(err){console.error('NEX 2.0.51: leitura da biblioteca',err);return [];}
}
function write(items){
 if(!Array.isArray(items)||items.length>300||!items.every(valid))throw Error('Conteúdo inválido');
 const json=JSON.stringify(items.map(clean));localStorage.setItem(KEY,json);
 if(localStorage.getItem(KEY)!==json)throw Error('Gravação não confirmada');
}
const mount=$('nex51AdvancedMount'),sheet=$('nex51SheetMount');
if(!mount||!sheet)return;
mount.innerHTML=
'<div class="nex51-header"><div><h3>Homebrew avançado</h3><p>Crie poderes, trilhas, habilidades e rituais. O editor de origens continua acima.</p></div><small>ARMAZENAMENTO LOCAL</small></div>'+
'<form id="nex51Form" class="nex51-form">'+
'<input type="hidden" id="nex51Edit">'+
'<label>Tipo<select id="nex51Type"><option value="poder">Poder</option><option value="trilha">Trilha</option><option value="habilidade">Habilidade</option><option value="ritual">Ritual</option></select></label>'+
'<label>Nome<input id="nex51Name" maxlength="90" required placeholder="Nome do homebrew"></label>'+
'<label>Classe<select id="nex51Class"><option>Livre</option><option>Combatente</option><option>Especialista</option><option>Ocultista</option></select></label>'+
'<label>NEX mínimo (%)<input id="nex51Nex" type="number" min="0" max="99" value="5"></label>'+
'<label class="nex51-full">Descrição e efeitos<textarea id="nex51Description" maxlength="2000" rows="3" placeholder="Descrição do conteúdo original"></textarea></label>'+
'<label class="nex51-full">Pré-requisitos<textarea id="nex51Requirements" maxlength="650" rows="2" placeholder="Requisitos ou observações opcionais"></textarea></label>'+
'<div id="nex51Ritual" class="nex51-ritual nex51-full" hidden>'+
'<label>Círculo<select id="nex51Circle"><option value="1">1º</option><option value="2">2º</option><option value="3">3º</option><option value="4">4º</option></select></label>'+
'<label>Elemento<select id="nex51Element"><option>Conhecimento</option><option>Energia</option><option>Morte</option><option>Sangue</option><option>Medo</option><option>Personalizado</option></select></label>'+
'<label>Custo PE<input id="nex51Cost" type="number" min="0" max="99" value="0"></label></div>'+
'<div class="nex51-full nex51-actions"><button class="btn primary" type="submit" id="nex51Submit">Salvar homebrew</button><button class="btn" type="button" id="nex51Clear">Limpar editor</button></div></form>'+
'<h3>Biblioteca personalizada</h3>'+
'<div class="nex51-filters"><input id="nex51Search" type="search" placeholder="Buscar nome, efeito ou pré-requisito" aria-label="Buscar homebrew"><select id="nex51Filter" aria-label="Filtrar tipo"><option value="">Todos os tipos</option><option value="poder">Poderes</option><option value="trilha">Trilhas</option><option value="habilidade">Habilidades</option><option value="ritual">Rituais</option></select></div>'+
'<label class="nex51-choose">Adicionar à ficha<select id="nex51Target" aria-label="Selecionar personagem"><option value="">Selecione um personagem salvo</option></select></label>'+
'<p class="nex51-tip">Os efeitos são descritivos e não alteram os cálculos automaticamente. A ficha guarda uma cópia do conteúdo recebido, mesmo se a biblioteca for editada ou apagada.</p>'+
'<div id="nex51List" class="nex51-list"></div><p id="nex51Message" role="status" aria-live="polite"></p>';
sheet.innerHTML='<details class="nex51-sheet" open><summary>Homebrews personalizados da ficha (<span id="nex51SheetCount">0</span>)</summary><div id="nex51SheetItems" class="nex51-list"></div></details>';
function notice(text){$('nex51Message').textContent=text;}
function typeField(){$('nex51Ritual').hidden=$('nex51Type').value!=='ritual';}
function clearForm(){$('nex51Form').reset();$('nex51Edit').value='';$('nex51Submit').textContent='Salvar homebrew';typeField();}
function card(item,linked){
 return '<article class="nex51-card"><div class="nex51-card-title"><strong>'+esc(item.name)+'</strong><span>'+esc(TYPES[item.type])+'</span></div>'+
 '<p class="nex51-meta">'+esc(item.className)+' · NEX '+item.minNex+'%'+(item.type==='ritual'?' · '+item.circle+'º círculo · '+esc(item.element)+' · '+item.cost+' PE':'')+'</p>'+
 (item.description?'<p>'+esc(item.description)+'</p>':'')+
 (item.requirements?'<p class="nex51-req">Pré-requisitos: '+esc(item.requirements)+'</p>':'')+
 '<div class="nex51-actions">'+(linked?
 '<button type="button" class="btn sm" data-nex51-detach="'+esc(item.id)+'">Remover da ficha</button>':
 '<button type="button" class="btn sm primary" data-nex51-attach="'+esc(item.id)+'">Adicionar à ficha</button>'+
 '<button type="button" class="btn sm" data-nex51-edit="'+esc(item.id)+'">Editar</button>'+
 '<button type="button" class="btn sm" data-nex51-delete="'+esc(item.id)+'">Excluir</button>')+'</div></article>';
}
const api=()=>window.NEX51_BRIDGE;
function renderSheet(){
 const current=api()?.ready()?api().current():null;
 const attached=Array.isArray(current?.items)?current.items.filter(valid):[];
 $('nex51SheetCount').textContent=attached.length;
 $('nex51SheetItems').innerHTML=attached.length?attached.map(item=>card(item,true)).join(''):'<p class="nex51-empty">Nenhum homebrew associado à ficha.</p>';
}
function targetSelect(){
 const select=$('nex51Target'),previous=select.value;
 const agents=api()?.ready()?api().listAgents():[];
 select.innerHTML='<option value="">Selecione um personagem salvo</option>'+agents.map(a=>'<option value="'+esc(a.id)+'">'+esc(a.name)+'</option>').join('');
 const fallback=api()?.ready()?api().current()?.id:null;
 const selected=agents.some(a=>a.id===previous)?previous:fallback;
 if(selected&&agents.some(a=>a.id===selected))select.value=selected;
}
function renderLibrary(){
 const all=read(),kind=$('nex51Filter').value,q=$('nex51Search').value.toLocaleLowerCase('pt-BR').trim();
 const filtered=all.filter(x=>(!kind||x.type===kind)&&(!q||[x.name,x.description,x.requirements,x.className,x.element].join(' ').toLocaleLowerCase('pt-BR').includes(q)));
 $('nex51List').innerHTML='<p class="nex51-meta">Mostrando '+filtered.length+' de '+all.length+' conteúdo(s)</p>'+(filtered.length?filtered.map(x=>card(x,false)).join(''):'<p class="nex51-empty">Nenhum homebrew encontrado.</p>');
 targetSelect();renderSheet();
}
$('nex51Type').addEventListener('change',typeField);
$('nex51Clear').addEventListener('click',clearForm);
$('nex51Search').addEventListener('input',renderLibrary);
$('nex51Filter').addEventListener('change',renderLibrary);
$('nex51Form').addEventListener('submit',event=>{
 event.preventDefault();
 const kind=$('nex51Type').value,name=bounded($('nex51Name').value,90);
 if(!Object.hasOwn(TYPES,kind)||!name){notice('Informe um nome e um tipo.');return;}
 const all=read(),editing=$('nex51Edit').value;
 if(editing&&!all.some(x=>x.id===editing)){notice('O registro não foi encontrado.');return;}
 if(!editing&&all.length>=300){notice('Limite de 300 conteúdos atingido.');return;}
 const item=clean({id:editing||'hb51_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,10),
 type:kind,name,description:$('nex51Description').value,requirements:$('nex51Requirements').value,
 className:$('nex51Class').value,minNex:$('nex51Nex').value,
 circle:$('nex51Circle').value,element:$('nex51Element').value,cost:$('nex51Cost').value});
 try{write(editing?all.map(x=>x.id===editing?item:x):[item,...all]);clearForm();renderLibrary();notice(editing?'Homebrew atualizado. O conteúdo já anexado às fichas não muda.':'Homebrew criado e salvo neste navegador.');}
 catch(error){console.error(error);notice('Falha ao salvar a biblioteca. Confira o armazenamento.');}
});
mount.addEventListener('click',event=>{
 const b=event.target.closest('button');if(!b)return;
 const edit=b.dataset.nex51Edit,del=b.dataset.nex51Delete,attach=b.dataset.nex51Attach;
 if(!edit&&!del&&!attach)return;
 const all=read(),item=all.find(x=>x.id===(edit||del||attach));if(!item)return;
 if(edit){
  const mapping={nex51Edit:item.id,nex51Type:item.type,nex51Name:item.name,nex51Class:item.className,
   nex51Nex:item.minNex,nex51Description:item.description,nex51Requirements:item.requirements,
   nex51Circle:item.circle,nex51Element:item.element,nex51Cost:item.cost};
  for(const [id,value] of Object.entries(mapping))$(id).value=value;
  typeField();$('nex51Submit').textContent='Atualizar homebrew';$('nex51Form').scrollIntoView({block:'start',behavior:'smooth'});return;
 }
 if(del){
  if(!confirm('Excluir "'+item.name+'" da biblioteca? As fichas já associadas serão preservadas.'))return;
  try{write(all.filter(x=>x.id!==del));renderLibrary();notice('Removido da biblioteca.');}
  catch(error){console.error(error);notice('Falha ao excluir conteúdo.');}return;
 }
 if(attach){
  const target=$('nex51Target').value;
  if(!target){notice('Selecione um personagem antes de adicionar.');return;}
  try{const added=api().attach(target,item);renderLibrary();notice(added?'Conteúdo adicionado à ficha.':'Esse conteúdo já está na ficha selecionada.');}
  catch(error){console.error(error);notice('Não foi possível adicionar: '+String(error.message||error));}
 }
});
sheet.addEventListener('click',event=>{
 const button=event.target.closest('[data-nex51-detach]');if(!button)return;
 if(!confirm('Remover esse homebrew da ficha?'))return;
 try{api().detach(button.dataset.nex51Detach);renderSheet();notice('Conteúdo removido da ficha.');}
 catch(error){console.error(error);notice('Não foi possível remover da ficha.');}
});
window.NEX51={renderLibrary,renderSheet,readLibrary:read};
document.addEventListener('nex51-ready',renderLibrary);
renderLibrary();
})();