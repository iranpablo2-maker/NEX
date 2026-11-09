/* NEX 2.0.55 - Editores de habilidades por categoria; origens com duas perícias treinadas. */
(()=>{
 'use strict';
 const KEY='nex_homebrew_advanced_v2051';
 const LABEL={ameaca:'Ameaça',origem:'Origem',poder_paranormal:'Poder Paranormal',poder_geral:'Poder Geral',poder:'Poder',trilha:'Trilha',habilidade:'Habilidade',ritual:'Ritual',item:'Item'};
 const TABS={ameacas:['ameaca'],habilidades:['origem','poder_paranormal','poder_geral','poder','habilidade','trilha'],rituais:['ritual'],itens:['item']};
 const SKILL_TABS={origens:['origem'],paranormais:['poder_paranormal'],gerais:['poder_geral','poder','habilidade'],trilhas:['trilha']};
 const TRAIL_NEX=[10,40,65,99];
 const $=id=>document.getElementById(id);
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&#39;'}[c]));
 const cut=(v,max)=>String(v??'').trim().slice(0,max);
 const num=(v,min,max,def)=>{if(v===''||v===null||v===undefined)return def;const n=Number(v);return Number.isFinite(n)?Math.max(min,Math.min(max,Math.floor(n))):def;};
 const valid=x=>x&&typeof x==='object'&&!Array.isArray(x)&&typeof x.id==='string'&&/^[\w-]{3,100}$/.test(x.id)&&Object.hasOwn(LABEL,x.type)&&typeof x.name==='string'&&x.name.trim().length>0;
 const normalize=x=>({
   id:x.id,type:x.type,name:cut(x.name,90),description:cut(x.description,2000),
   requirements:cut(x.requirements,650),minNex:num(x.minNex,0,99,5),
   className:['Livre','Combatente','Especialista','Ocultista'].includes(x.className)?x.className:'Livre',
   circle:num(x.circle,1,4,1),element:['Conhecimento','Energia','Morte','Sangue','Medo','Personalizado'].includes(x.element)?x.element:'Personalizado',
   cost:num(x.cost,0,99,0),vd:num(x.vd,0,9999,0),
   size:['Minúsculo','Pequeno','Médio','Grande','Enorme','Colossal'].includes(x.size)?x.size:'Médio',
   creatureType:cut(x.creatureType||'Criatura',70),
   category:cut(x.category||'Geral',70),
   skills:x.type==='origem'&&Array.isArray(x.skills)?[...new Set(x.skills.filter(v=>typeof v==='string').map(v=>cut(v,60)))].slice(0,2):[],
   trailAbilities:x.type==='trilha'?TRAIL_NEX.map((n,i)=>{
     const list=Array.isArray(x.trailAbilities)?x.trailAbilities:[];
     const saved=list.find(item=>item&&Number(item.nex)===n)||list[i]||{};
     return {nex:n,name:cut(saved.name,90),description:cut(saved.description,1600)};
   }):[]
 });
 function read(){
   try{const list=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(list)?list.filter(valid).map(normalize):[];}
   catch(error){console.warn('NEX: falha ao ler homebrews',error);return [];}
 }
 function write(items){
   if(!Array.isArray(items)||items.length>300||!items.every(valid))throw Error('Biblioteca inválida');
   const value=JSON.stringify(items.map(normalize));
   localStorage.setItem(KEY,value);
   if(localStorage.getItem(KEY)!==value)throw Error('Gravação não confirmada');
 }
 const mount=$('nex51AdvancedMount'),sheet=$('nex51SheetMount');
 if(!mount||!sheet)return;
 let tab='ameacas',skillTab='origens',opened=null;
 const titleFor=t=>t==='ameacas'?'Ameaças':t==='habilidades'?'Habilidades':t==='rituais'?'Rituais':'Itens';
 const currentTypes=()=>tab==='habilidades'?SKILL_TABS[skillTab]:TABS[tab];
 const defaultType=()=>({ameacas:'ameaca',habilidades:({origens:'origem',paranormais:'poder_paranormal',gerais:'poder_geral',trilhas:'trilha'})[skillTab],rituais:'ritual',itens:'item'})[tab];
 const api=()=>window.NEX51_BRIDGE;
 function message(text){const box=$('nex52Message');if(box)box.textContent=text;}
 mount.innerHTML=
 '<div class="nex52-tabs" role="tablist" aria-label="Tipos de homebrew">'+
 '<button type="button" data-nex52-tab="ameacas" role="tab" aria-selected="true">AMEAÇAS</button>'+
 '<button type="button" data-nex52-tab="habilidades" role="tab" aria-selected="false">HABILIDADES</button>'+
 '<button type="button" data-nex52-tab="rituais" role="tab" aria-selected="false">RITUAIS</button>'+
 '<button type="button" data-nex52-tab="itens" role="tab" aria-selected="false">ITENS</button></div>'+
 '<div class="nex53-subtabs" id="nex53SkillTabs" role="tablist" aria-label="Categorias de habilidades" hidden>'+
 '<button type="button" data-nex53-skill="origens" role="tab" aria-selected="true">Origens</button>'+
 '<button type="button" data-nex53-skill="paranormais" role="tab" aria-selected="false">Poderes Paranormais</button>'+
 '<button type="button" data-nex53-skill="gerais" role="tab" aria-selected="false">Poderes Gerais</button>'+
 '<button type="button" data-nex53-skill="trilhas" role="tab" aria-selected="false">Trilhas</button></div>'+
 '<div class="nex52-toolbar"><strong id="nex52Count">Homebrew 0/50</strong><button type="button" id="nex52Add">Adicionar</button></div>'+
 '<label class="nex52-search" for="nex51Search"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="10.7" cy="10.7" r="7.2"/><path d="m16 16 5 5"/></svg><input type="search" id="nex51Search" placeholder="Buscar" autocomplete="off" aria-label="Buscar homebrew"></label>'+
 '<section id="nex52Editor" class="nex52-editor" hidden><div class="nex52-editor-head"><strong id="nex52EditorTitle">Adicionar homebrew</strong><button type="button" id="nex52CloseEditor" aria-label="Fechar editor">×</button></div>'+
 '<form id="nex51Form" class="nex52-form"><input id="nex51Edit" type="hidden">'+
 '<label id="nex55TypeField">Categoria<select id="nex51Type"><option value="ameaca">Ameaça</option></select></label>'+
 '<label>Nome<input id="nex51Name" maxlength="90" placeholder="Nome do homebrew" required></label>'+
 '<div class="nex52-specific" id="nex52ThreatFields" hidden><label>VD<input id="nex52VD" type="number" min="0" max="9999" value="0"></label>'+
 '<label>Tipo de ameaça<input id="nex52CreatureType" maxlength="70" placeholder="Criatura"></label>'+
 '<label>Porte<select id="nex52Size"><option>Minúsculo</option><option>Pequeno</option><option selected>Médio</option><option>Grande</option><option>Enorme</option><option>Colossal</option></select></label></div>'+
 '<div class="nex52-specific" id="nex52AbilityFields" hidden><label id="nex55ClassField">Classe<select id="nex51Class"><option>Livre</option><option>Combatente</option><option>Especialista</option><option>Ocultista</option></select></label>'+
 '<label id="nex51NexField">NEX mínimo<input id="nex51Nex" type="number" min="0" max="99" value="5"></label></div>'+
 '<div class="nex52-specific" id="nex52RitualFields" hidden><label>Círculo<select id="nex51Circle"><option value="1">1º</option><option value="2">2º</option><option value="3">3º</option><option value="4">4º</option></select></label>'+
 '<label>Elemento<select id="nex51Element"><option>Conhecimento</option><option>Energia</option><option>Morte</option><option>Sangue</option><option>Medo</option><option>Personalizado</option></select></label>'+
 '<label>PE indicado<input id="nex51Cost" type="number" min="0" max="99" value="0"></label></div>'+
 '<div class="nex52-specific" id="nex52ItemFields" hidden><label>Categoria<input id="nex52Category" maxlength="70" placeholder="Ex.: Equipamento"></label></div>'+
 '<div id="nex53TrailFields" class="nex53-trail-fields nex52-full" hidden><p>Configure o nome e o efeito de cada marco de NEX.</p>'+
 TRAIL_NEX.map((n,i)=>'<fieldset class="nex53-trail-step"><legend>NEX '+n+'% · Habilidade '+(i+1)+'</legend>'+
 '<label>Nome da habilidade<input type="text" id="nex53TrailName'+n+'" maxlength="90" placeholder="Nome da habilidade de '+n+'%"></label>'+
 '<label>Descrição e efeitos<textarea id="nex53TrailDescription'+n+'" maxlength="1600" rows="3" placeholder="Descreva o efeito concedido em '+n+'% de NEX"></textarea></label></fieldset>').join('')+'</div>'+
 '<div class="nex55-origin-skills nex52-full" id="nex55OriginSkills" hidden><label>Primeira perícia<select id="nex55Skill1"><option value="">Escolha a primeira perícia</option></select></label>'+
 '<label>Segunda perícia<select id="nex55Skill2"><option value="">Escolha a segunda perícia</option></select></label>'+
 '<p>Ao aplicar esta origem, as duas perícias ficam treinadas (+5) automaticamente na ficha, sem reduzir treinamentos existentes.</p></div>'+
 '<label class="nex52-full" id="nex55DescriptionField"><span id="nex55DescriptionLabel">Descrição e efeitos</span><textarea id="nex51Description" maxlength="2000" rows="4" placeholder="Descreva seu homebrew"></textarea></label>'+
 '<label class="nex52-full" id="nex55RequirementsField">Pré-requisitos ou observações<textarea id="nex51Requirements" maxlength="650" rows="2"></textarea></label>'+
 '<div class="nex52-form-actions"><button type="submit" class="btn primary" id="nex52Save">Salvar</button><button type="button" class="btn" id="nex52Cancel">Cancelar</button></div></form></section>'+
 '<div id="nex51List" class="nex52-list" role="tabpanel" aria-label="Lista de homebrews"></div>'+
 '<p id="nex52Message" role="status" aria-live="polite" class="nex52-message"></p>'+
 '<dialog id="nex52Detail" class="nex52-dialog" aria-label="Ficha do homebrew"><div id="nex52DetailBody"></div>'+
 '<div class="nex52-dialog-actions"><label>Personagem<select id="nex51Target"><option value="">Selecione um personagem</option></select></label>'+
 '<button type="button" class="btn primary" id="nex52Apply">Adicionar à ficha</button><button type="button" class="btn" id="nex52Close">Fechar</button></div></dialog>';
 sheet.innerHTML='<details class="nex51-sheet"><summary>Homebrews associados à ficha (<span id="nex51SheetCount">0</span>)</summary><div id="nex51SheetItems" class="nex52-sheet-list"></div></details>';
 function editorFields(){
   const type=$('nex51Type').value;
   const isTrail=type==='trilha',isOrigin=type==='origem',isGeneral=['poder_geral','poder','habilidade'].includes(type);
   // Ao escolher a subcategoria, não é preciso selecionar "Categoria" novamente.
   $('nex55TypeField').hidden=tab==='habilidades';
   const classSelect=$('nex51Class'),oldClass=classSelect.value;
   const choices=isTrail?['Combatente','Especialista','Ocultista']:['Livre','Combatente','Especialista','Ocultista'];
   classSelect.innerHTML=choices.map(name=>'<option value="'+name+'">'+name+'</option>').join('');
   classSelect.value=choices.includes(oldClass)?oldClass:(isTrail?'Combatente':'Livre');
   $('nex55ClassField').hidden=isOrigin||isGeneral;
   $('nex51NexField').hidden=isTrail||isOrigin||isGeneral;
   $('nex52ThreatFields').hidden=type!=='ameaca';
   $('nex52AbilityFields').hidden=!['origem','poder_paranormal','poder_geral','poder','trilha','habilidade'].includes(type);
   $('nex53TrailFields').hidden=!isTrail;
   $('nex55OriginSkills').hidden=!isOrigin;
   $('nex55DescriptionField').hidden=isTrail;
   $('nex55RequirementsField').hidden=isTrail||isOrigin||isGeneral;
   $('nex55DescriptionLabel').textContent=isOrigin||isGeneral?'Descrição':'Descrição e efeitos';
   $('nex52RitualFields').hidden=type!=='ritual';
   $('nex52ItemFields').hidden=type!=='item';
 }
 const FALLBACK_SKILLS=['Acrobacia','Adestramento','Artes','Atletismo','Atualidades','Ciências','Crime','Diplomacia','Enganação','Fortitude','Furtividade','Iniciativa','Intimidação','Intuição','Investigação','Luta','Medicina','Ocultismo','Percepção','Pilotagem','Pontaria','Profissão','Reflexos','Religião','Sobrevivência','Tática','Tecnologia','Vontade'];
 function loadSkillChoices(){
   const skills=api()?.skillNames?.()||FALLBACK_SKILLS;
   const options=skills.filter(name=>typeof name==='string').map(name=>'<option value="'+esc(name)+'">'+esc(name)+'</option>').join('');
   $('nex55Skill1').innerHTML='<option value="">Escolha a primeira perícia</option>'+options;
   $('nex55Skill2').innerHTML='<option value="">Escolha a segunda perícia</option>'+options;
 }
 function resetForm(){
   $('nex51Form').reset();$('nex51Edit').value='';
   loadSkillChoices();
   $('nex51Type').innerHTML=currentTypes().map(type=>'<option value="'+type+'">'+LABEL[type]+'</option>').join('');
   $('nex51Type').value=defaultType();$('nex52EditorTitle').textContent='Adicionar '+LABEL[defaultType()].toLocaleLowerCase('pt-BR');
   editorFields();
 }
 function closeEditor(){$('nex52Editor').hidden=true;resetForm();}
 function openEditor(item){
   resetForm();
   if(item){
     $('nex51Edit').value=item.id;$('nex51Type').value=item.type;
     $('nex51Name').value=item.name;$('nex51Description').value=item.description;
     $('nex51Requirements').value=item.requirements;$('nex51Class').value=item.className;
     $('nex51Nex').value=item.minNex;$('nex51Circle').value=item.circle;
     $('nex51Element').value=item.element;$('nex51Cost').value=item.cost;
     $('nex52VD').value=item.vd;$('nex52Size').value=item.size;
     $('nex52CreatureType').value=item.creatureType;$('nex52Category').value=item.category;
     if(item.type==='origem'){$('nex55Skill1').value=item.skills?.[0]||'';$('nex55Skill2').value=item.skills?.[1]||'';}
     if(item.type==='trilha')TRAIL_NEX.forEach((n,i)=>{const step=(item.trailAbilities||[])[i]||{};$('nex53TrailName'+n).value=step.name||'';$('nex53TrailDescription'+n).value=step.description||'';});
     $('nex52EditorTitle').textContent='Editar '+item.name;
   }
   editorFields();$('nex52Editor').hidden=false;
   $('nex52Editor').scrollIntoView({block:'start',behavior:'smooth'});
 }
 function meta(item){
   if(item.type==='ameaca')return ['VD: '+item.vd,item.creatureType+' - '+item.size];
   if(item.type==='ritual')return [item.circle+'º círculo · '+item.element,item.cost+' PE'];
   if(item.type==='item')return [item.category,'Item personalizado'];
   if(item.type==='trilha')return ['Trilha · '+item.className,'4 marcos · NEX 10%, 40%, 65% e 99%'];
   if(item.type==='origem')return ['Origem personalizada',(item.skills||[]).join(' · ')||'Duas perícias'];
   if(['poder_geral','poder','habilidade'].includes(item.type))return ['Poder Geral','Personalizado'];
   return [LABEL[item.type]+' · '+item.className,'NEX '+item.minNex+'%'];
 }
 function trailDetails(item){
   if(item.type!=='trilha')return '';
   const stages=Array.isArray(item.trailAbilities)?item.trailAbilities:[];
   return '<section class="nex53-trail-details"><h4>Habilidades da trilha</h4>'+
      TRAIL_NEX.map((n,i)=>{const stage=stages[i]||{};
        return '<div class="nex53-trail-detail"><strong>NEX '+n+'% · '+esc(stage.name||'Habilidade não configurada')+'</strong>'+
          '<p>'+esc(stage.description||'Sem descrição.')+'</p></div>';
      }).join('')+'</section>';
 }
 function card(item){
   const details=meta(item);
   return '<article class="nex52-card nex52-card-'+(item.type==='ameaca'?'threat':item.type==='ritual'?'ritual':item.type==='item'?'item':'ability')+'">'+
    '<div class="nex52-card-data"><strong>'+esc(item.name)+'</strong><span>'+esc(details[0])+'</span><span>'+esc(details[1])+'</span></div>'+
    '<div class="nex52-card-controls"><button type="button" data-nex52-settings="'+esc(item.id)+'" class="nex52-gear" aria-label="Opções para '+esc(item.name)+'" aria-expanded="false">⚙</button>'+
    '<div class="nex52-settings" data-nex52-menu="'+esc(item.id)+'" hidden><button type="button" data-nex52-edit="'+esc(item.id)+'">Editar</button><button type="button" data-nex52-delete="'+esc(item.id)+'">Excluir</button></div>'+
    '<button type="button" class="nex52-open" data-nex52-view="'+esc(item.id)+'">Ficha</button></div></article>';
 }
 function targetOptions(){
   const sel=$('nex51Target');const previous=sel.value;
   const agents=api()?.ready()?api().listAgents():[];
   sel.innerHTML='<option value="">Selecione um personagem</option>'+agents.map(a=>'<option value="'+esc(a.id)+'">'+esc(a.name||'Personagem')+'</option>').join('');
   const active=api()?.ready()?api().current()?.id:null;
   const chosen=agents.some(x=>x.id===previous)?previous:active;
   if(chosen&&agents.some(x=>x.id===chosen))sel.value=chosen;
 }
 function renderLibrary(){
   const records=read(),types=currentTypes();
   $('nex53SkillTabs').hidden=tab!=='habilidades';
   mount.querySelectorAll('[data-nex53-skill]').forEach(button=>{const selected=tab==='habilidades'&&button.dataset.nex53Skill===skillTab;button.setAttribute('aria-selected',String(selected));button.classList.toggle('active',selected);});
   const visible=records.filter(x=>types.includes(x.type));
   const query=$('nex51Search').value.trim().toLocaleLowerCase('pt-BR');
   const filtered=visible.filter(x=>!query||[x.name,x.description,x.requirements,x.className,x.creatureType,x.category,x.element].join(' ').toLocaleLowerCase('pt-BR').includes(query));
   $('nex52Count').textContent='Homebrew '+visible.length+'/50';
   mount.querySelectorAll('[data-nex52-tab]').forEach(button=>{
     const selected=button.dataset.nex52Tab===tab;
     button.setAttribute('aria-selected',String(selected));button.classList.toggle('active',selected);
   });
   $('nex51List').innerHTML=filtered.length?filtered.map(card).join(''):
    '<div class="nex52-empty">Nenhum '+(tab==='habilidades'?({origens:'origem',paranormais:'poder paranormal',gerais:'poder geral',trilhas:'trilha'})[skillTab]:titleFor(tab).toLocaleLowerCase('pt-BR'))+' cadastrado'+(query?' para esta busca':'')+'. Use <strong>Adicionar</strong> para criar um.</div>';
   renderSheet();
 }
 function renderSheet(){
   const current=api()?.ready()?api().current():null;
   const items=Array.isArray(current?.items)?current.items.filter(valid).map(normalize):[];
   $('nex51SheetCount').textContent=String(items.length);
   $('nex51SheetItems').innerHTML=items.length?items.map(item=>
     '<div class="nex52-attached"><span><strong>'+esc(item.name)+'</strong><small>'+esc(LABEL[item.type])+'</small>'+(item.type==='trilha'?'<details class="nex53-attached-trail"><summary>Ver as 4 habilidades</summary>'+trailDetails(item)+'</details>':'')+'</span>'+
     '<button type="button" class="btn sm" data-nex52-detach="'+esc(item.id)+'">Remover</button></div>').join(''):
     '<p class="nex52-empty">Nenhum homebrew associado a esta ficha.</p>';
 }
 function closeDialog(){const d=$('nex52Detail');if(typeof d.close==='function')d.close();else d.removeAttribute('open');opened=null;}
 function view(item){
   opened=item.id;const info=meta(item);
   $('nex52DetailBody').innerHTML='<div class="nex52-detail-top"><span>'+esc(LABEL[item.type])+'</span><h3>'+esc(item.name)+'</h3></div>'+
     '<p class="nex52-detail-meta">'+esc(info.join(' · '))+'</p>'+
     (item.description?'<h4>Descrição</h4><p>'+esc(item.description)+'</p>':'<p>Sem descrição.</p>')+
     (item.requirements?'<h4>Pré-requisitos</h4><p>'+esc(item.requirements)+'</p>':'')+
     (item.type==='origem'?'<h4>Perícias treinadas</h4><p>'+esc((item.skills||[]).join(' e ')||'Não configuradas')+'</p>':'')+trailDetails(item);
   targetOptions();const d=$('nex52Detail');if(typeof d.showModal==='function')d.showModal();else d.setAttribute('open','');
 }
 $('nex51Type').addEventListener('change',editorFields);
 $('nex52Add').addEventListener('click',()=>openEditor(null));
 $('nex52CloseEditor').addEventListener('click',closeEditor);
 $('nex52Cancel').addEventListener('click',closeEditor);
 $('nex52Close').addEventListener('click',closeDialog);
 $('nex52Detail').addEventListener('close',()=>{opened=null;});
 $('nex51Search').addEventListener('input',renderLibrary);
 mount.querySelector('.nex52-tabs').addEventListener('click',e=>{
   const btn=e.target.closest('[data-nex52-tab]');if(!btn)return;
   tab=btn.dataset.nex52Tab;$('nex51Search').value='';closeEditor();renderLibrary();
 });
 $('nex53SkillTabs').addEventListener('click',e=>{
   const btn=e.target.closest('[data-nex53-skill]');
   if(!btn||!Object.hasOwn(SKILL_TABS,btn.dataset.nex53Skill))return;
   skillTab=btn.dataset.nex53Skill;$('nex51Search').value='';closeEditor();renderLibrary();
 });
 $('nex51Form').addEventListener('submit',e=>{
   e.preventDefault();const type=$('nex51Type').value,name=cut($('nex51Name').value,90);
   if(!Object.hasOwn(LABEL,type)||!name){message('Informe um nome e um tipo.');return;}
   const all=read(),editing=$('nex51Edit').value,old=all.find(x=>x.id===editing);
   if(editing&&!old){message('O conteúdo original não foi encontrado.');return;}
   const count=all.filter(x=>currentTypes().includes(x.type)).length;
   if(!editing&&count>=50){message('Limite de 50 homebrews para esta categoria.');return;}
   if(type==='trilha'&&TRAIL_NEX.some(n=>!cut($('nex53TrailName'+n).value,90))){message('Informe o nome das quatro habilidades da trilha: 10%, 40%, 65% e 99%.');return;}
   if(type==='origem'){
     const first=$('nex55Skill1').value,second=$('nex55Skill2').value,available=api()?.skillNames?.()||FALLBACK_SKILLS;
     if(!first||!second||first===second||!available.includes(first)||!available.includes(second)){
       message('Escolha duas perícias diferentes para a origem.');return;
     }
   }
   if(!editing&&all.length>=300){message('Limite total da biblioteca atingido.');return;}
   const record=normalize({
     id:editing||'hb51_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,9),
     type,name,description:$('nex51Description').value,requirements:$('nex51Requirements').value,
     className:$('nex51Class').value,minNex:['trilha','origem','poder_geral','poder','habilidade'].includes(type)?(old?.minNex??(type==='trilha'?10:5)):$('nex51Nex').value,circle:$('nex51Circle').value,
     element:$('nex51Element').value,cost:$('nex51Cost').value,vd:$('nex52VD').value,
     size:$('nex52Size').value,creatureType:$('nex52CreatureType').value,category:$('nex52Category').value,
     trailAbilities:type==='trilha'?TRAIL_NEX.map(n=>({nex:n,name:$('nex53TrailName'+n).value,description:$('nex53TrailDescription'+n).value})):(old?.trailAbilities||[]),
     skills:type==='origem'?[$('nex55Skill1').value,$('nex55Skill2').value]:(old?.skills||[])
   });
   const group=Object.keys(TABS).find(key=>TABS[key].includes(record.type))||tab;
   if(!editing&&group!==tab){message('Selecione a categoria correta antes de salvar.');return;}
   try{
     write(editing?all.map(x=>x.id===editing?record:x):[record,...all]);
     tab=group;
     if(group==='habilidades'){const category=Object.keys(SKILL_TABS).find(k=>SKILL_TABS[k].includes(record.type));if(category)skillTab=category;}
     closeEditor();renderLibrary();
     message(editing?'Homebrew atualizado. Fichas já associadas continuam com a versão anterior.':'Homebrew salvo!');
   }catch(error){console.error(error);message('Falha ao salvar o homebrew neste dispositivo.');}
 });
 $('nex51List').addEventListener('click',e=>{
   const btn=e.target.closest('button');if(!btn)return;
   const id=btn.dataset.nex52Settings||btn.dataset.nex52Edit||btn.dataset.nex52Delete||btn.dataset.nex52View;
   if(!id)return;const item=read().find(x=>x.id===id);if(!item)return;
   if(btn.dataset.nex52Settings){
     const menu=mount.querySelector('[data-nex52-menu="'+id+'"]');
     const show=menu?.hidden;mount.querySelectorAll('.nex52-settings').forEach(x=>x.hidden=true);
     mount.querySelectorAll('[data-nex52-settings]').forEach(x=>x.setAttribute('aria-expanded','false'));
     if(menu){menu.hidden=!show;btn.setAttribute('aria-expanded',String(show));}
     return;
   }
   if(btn.dataset.nex52Edit){openEditor(item);return;}
   if(btn.dataset.nex52Delete){
     if(!confirm('Excluir "'+item.name+'" da biblioteca? As fichas que já receberam este conteúdo não serão alteradas.'))return;
     try{write(read().filter(x=>x.id!==id));renderLibrary();message('Homebrew excluído da biblioteca.');}
     catch(error){console.error(error);message('Falha ao salvar a exclusão.');}
     return;
   }
   if(btn.dataset.nex52View)view(item);
 });
 $('nex52Apply').addEventListener('click',()=>{
   const item=read().find(x=>x.id===opened),agentId=$('nex51Target').value;
   if(!item||!agentId){message('Selecione um personagem antes de adicionar.');return;}
   try{
     const result=api().attach(agentId,item);closeDialog();renderSheet();
     message(result?'Homebrew adicionado à ficha escolhida.':'Esse homebrew já está na ficha.');
   }catch(error){console.error(error);message('Falha ao adicionar homebrew: '+String(error.message||error));}
 });
 sheet.addEventListener('click',e=>{
   const b=e.target.closest('[data-nex52-detach]');if(!b)return;
   if(!confirm('Remover esse homebrew da ficha atual?'))return;
   try{api().detach(b.dataset.nex52Detach);renderSheet();message('Homebrew removido da ficha.');}
   catch(error){console.error(error);message('Não foi possível remover o homebrew.');}
 });
 window.NEX51={renderLibrary,renderSheet,readLibrary:read};
 document.addEventListener('nex51-ready',renderLibrary);
 resetForm();renderLibrary();
})();