/* NEX 2.0.55 - Editores de habilidades por categoria; origens com duas perícias treinadas. */
(()=>{
 'use strict';
 const KEY='nex_homebrew_advanced_v2051';
 const LABEL={ameaca:'Ameaça',origem:'Origem',poder_paranormal:'Poder Paranormal',poder_geral:'Poder Geral',poder:'Poder',trilha:'Trilha',habilidade:'Habilidade',ritual:'Ritual',item:'Item'};
 const TABS={ameacas:['ameaca'],habilidades:['origem','poder_paranormal','poder_geral','poder','habilidade','trilha'],rituais:['ritual'],itens:['item']};
 const SKILL_TABS={origens:['origem'],paranormais:['poder_paranormal'],gerais:['poder_geral','poder','habilidade'],trilhas:['trilha']};
 const TRAIL_NEX=[10,40,65,99];
 const ITEM_CATEGORIES=['Armas','Munições','Proteções','Geral','Itens Amaldiçoados'];
 let customItemImprovements=[];
 const $=id=>document.getElementById(id);
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&#39;'}[c]));
 const cut=(v,max)=>String(v??'').trim().slice(0,max);
 const num=(v,min,max,def)=>{if(v===''||v===null||v===undefined)return def;const n=Number(v);return Number.isFinite(n)?Math.max(min,Math.min(max,Math.floor(n))):def;};
 const valid=x=>x&&typeof x==='object'&&!Array.isArray(x)&&typeof x.id==='string'&&/^[\w-]{3,100}$/.test(x.id)&&Object.hasOwn(LABEL,x.type)&&typeof x.name==='string'&&x.name.trim().length>0;
 const normalize=x=>({
   id:x.id,type:x.type,name:cut(x.name,90),description:cut(x.description,2000),
   requirements:cut(x.requirements,650),minNex:num(x.minNex,0,99,5),
   className:['Livre','Geral','Combatente','Especialista','Ocultista'].includes(x.className)?(x.className==='Livre'&&['poder_geral','poder','habilidade'].includes(x.type)?'Geral':x.className):(['poder_geral','poder','habilidade'].includes(x.type)?'Geral':'Livre'),
   ritualType:['Dano','Suporte','Cura'].includes(x.ritualType)?x.ritualType:(x.ritualDice||x.discenteDice||x.verdadeiroDice?'Dano':'Suporte'),
   discenteCircle:num(x.discenteCircle,1,4,Math.min(4,num(x.circle,1,4,1)+1)),
   verdadeiroCircle:num(x.verdadeiroCircle,1,4,Math.min(4,num(x.circle,1,4,1)+2)),
   circle:num(x.circle,1,4,1),element:['Conhecimento','Energia','Morte','Sangue','Medo','Personalizado'].includes(x.element)?x.element:'Conhecimento',
   execution:['Padrão','Movimento','Completa','Reação','Livre'].includes(x.execution)?x.execution:'Padrão',
   range:['Pessoal','Toque','Curto','Médio','Longo','Extremo','Ilimitado'].includes(x.range)?x.range:'Pessoal',
   area:cut(x.area,150),target:cut(x.target,150),duration:cut(x.duration,150),
   effect:cut(x.effect,700),resistance:cut(x.resistance,150),
   ritualDice:cut(x.ritualDice,120),discenteDice:cut(x.discenteDice,120),verdadeiroDice:cut(x.verdadeiroDice,120),
   image:typeof x.image==='string' && (/^https:\/\//i.test(x.image)||/^data:image\/(?:png|jpeg|webp);base64,/i.test(x.image))?x.image.slice(0,650000):'',
   cost:num(x.cost,0,99,0),vd:num(x.vd,0,9999,0),
   size:['Minúsculo','Pequeno','Médio','Grande','Enorme','Colossal'].includes(x.size)?x.size:'Médio',
   creatureType:cut(x.creatureType||'Criatura',70),
   category:cut(x.category||'Geral',70),
   customImprovements:x.type==='item'&&Array.isArray(x.customImprovements)?[...new Set(x.customImprovements.filter(v=>typeof v==='string').map(v=>cut(v,80)).filter(Boolean))].slice(0,30):[],
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
 let tab='ameacas',skillTab='origens',ritualFilter='Todas',itemTab='Armas',opened=null;
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
 '<div class="nex53-ritual-filter" id="nex53RitualFilter" hidden aria-label="Tipos de ritual"></div>'+ 
 '<div class="nex-hb-item-tabs" id="nexHbItemTabs" role="tablist" aria-label="Tipos de itens homebrew" hidden>'+ITEM_CATEGORIES.map(c=>'<button type="button" role="tab" data-nex-hb-item-tab="'+esc(c)+'" aria-selected="false">'+esc(c)+'</button>').join('')+'</div>'+ 
 '<div class="nex52-toolbar"><strong id="nex52Count">Homebrew 0/50</strong><button type="button" id="nex52Add">Adicionar</button></div>'+
 '<label class="nex52-search" for="nex51Search"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="10.7" cy="10.7" r="7.2"/><path d="m16 16 5 5"/></svg><input type="search" id="nex51Search" placeholder="Buscar" autocomplete="off" aria-label="Buscar homebrew"></label>'+
 '<section id="nex52Editor" class="nex52-editor" hidden><div class="nex52-editor-head"><strong id="nex52EditorTitle">Adicionar homebrew</strong><button type="button" id="nex52CloseEditor" aria-label="Fechar editor">×</button></div>'+
 '<form id="nex51Form" class="nex52-form"><input id="nex51Edit" type="hidden">'+
 '<label id="nex55TypeField">Categoria<select id="nex51Type"><option value="ameaca">Ameaça</option></select></label>'+
 '<label id="nex53NameField">Nome<input id="nex51Name" maxlength="90" placeholder="Nome do homebrew" required></label>'+
 '<div class="nex53-paranormal-fields nex52-full" id="nex53ParanormalElementField" hidden><label>Elemento<select id="nex53ParanormalElement" required><option value="Sangue">Sangue</option><option value="Morte">Morte</option><option value="Energia">Energia</option><option value="Conhecimento">Conhecimento</option><option value="Medo">Medo</option></select></label></div>'+
 '<div class="nex52-specific" id="nex52ThreatFields" hidden><label>VD<input id="nex52VD" type="number" min="0" max="9999" value="0"></label>'+
 '<label>Tipo de ameaça<input id="nex52CreatureType" maxlength="70" placeholder="Criatura"></label>'+
 '<label>Porte<select id="nex52Size"><option>Minúsculo</option><option>Pequeno</option><option selected>Médio</option><option>Grande</option><option>Enorme</option><option>Colossal</option></select></label></div>'+
 '<div class="nex52-specific" id="nex52AbilityFields" hidden><label id="nex55ClassField">Classe<select id="nex51Class"><option>Livre</option><option>Combatente</option><option>Especialista</option><option>Ocultista</option></select></label>'+
 '<label id="nex51NexField">NEX mínimo<input id="nex51Nex" type="number" min="0" max="99" value="5"></label></div>'+
 
 '<div class="nex52-specific nex53-ritual-fields" id="nex52RitualFields" hidden>'+
 '<label class="nex53-ritual-category">Categoria do ritual<select id="nex53RitualType"><option>Dano</option><option>Suporte</option><option>Cura</option></select></label>'+
 '<label>Elemento<select id="nex51Element"><option>Conhecimento</option><option>Energia</option><option>Medo</option><option>Morte</option><option>Sangue</option></select></label>'+
 '<label>Círculo<select id="nex51Circle"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></label>'+
 '<label>Execução<select id="nex53Execution"><option>Padrão</option><option>Movimento</option><option>Completa</option><option>Reação</option><option>Livre</option></select></label>'+
 '<label>Alcance<select id="nex53Range"><option>Pessoal</option><option>Toque</option><option>Curto</option><option>Médio</option><option>Longo</option><option>Extremo</option><option>Ilimitado</option></select></label>'+
 '<label>Área<input id="nex53Area" maxlength="150" placeholder="Ex.: Esfera de 3m"></label>'+
 '<label>Alvo<input id="nex53Target" maxlength="150" placeholder="Ex.: Uma criatura"></label>'+
 '<label>Duração<input id="nex53Duration" maxlength="150" placeholder="Ex.: Cena"></label>'+
 '<label>Efeito<input id="nex53Effect" maxlength="700" placeholder="Efeito do ritual"></label>'+
 '<label>Resistência<input id="nex53Resistance" maxlength="150" placeholder="Ex.: Fortitude parcial"></label>'+
 '<label class="nex53-damage-field">Dados<input id="nex53Dice" maxlength="120" placeholder="Ex.: 2d6"></label>'+
 '<label class="nex53-damage-field">Dados Discente<input id="nex53DiscenteDice" maxlength="120" placeholder="Ex.: 4d6"></label>'+
 '<label class="nex53-damage-field">Dados Verdadeiro<input id="nex53VerdadeiroDice" maxlength="120" placeholder="Ex.: 6d6"></label>'+
 '<label class="nex53-damage-field nex53-advanced-req">Círculo necessário (Discente)<select id="nex53DiscenteCircle"><option value="1">1º</option><option value="2">2º</option><option value="3">3º</option><option value="4">4º</option></select></label>'+
 '<label class="nex53-damage-field nex53-advanced-req">Círculo necessário (Verdadeiro)<select id="nex53VerdadeiroCircle"><option value="1">1º</option><option value="2">2º</option><option value="3">3º</option><option value="4">4º</option></select></label>'+
 '<div class="nex53-ritual-image"><label>Imagem (opcional)<input id="nex53RitualImage" type="url" maxlength="2000" placeholder="https://..."></label>'+
 '<label>Ou escolher imagem<input id="nex53RitualFile" type="file" accept="image/png,image/jpeg,image/webp"></label>'+
 '<img id="nex53RitualPreview" alt="Prévia da imagem do ritual" hidden></div>'+
 '</div>'+
 '<div class="nex52-specific nex52-full" id="nex52ItemFields" hidden>'+
 '<label>Categoria do item<select id="nex52Category">'+ITEM_CATEGORIES.map(c=>'<option value="'+esc(c)+'">'+esc(c)+'</option>').join('')+'</select></label>'+
 '<div class="nex52-full nex-hb-item-improvements"><label for="nex52ImprovementName">Melhorias homebrew</label>'+
 '<div class="nex-hb-improvement-add"><input type="text" id="nex52ImprovementName" maxlength="80" placeholder="Nome da melhoria homebrew" aria-label="Nome da melhoria homebrew">'+
 '<button type="button" id="nex52ImprovementAdd">Adicionar homebrew</button></div>'+
 '<div id="nex52ImprovementList" class="nex-hb-improvement-list" aria-live="polite"></div></div></div>'+
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
 function toggleRitualDamageFields(){
   const damage=$('nex51Type').value==='ritual'&&$('nex53RitualType').value==='Dano';
   mount.querySelectorAll('.nex53-damage-field').forEach(el=>{el.hidden=!damage;});
 }
 function editorFields(){
   const type=$('nex51Type').value;
   const isTrail=type==='trilha',isOrigin=type==='origem',isGeneral=['poder_geral','poder','habilidade'].includes(type);
   const isParanormal=type==='poder_paranormal';
   // Ao escolher a subcategoria, não é preciso selecionar "Categoria" novamente.
   $('nex55TypeField').hidden=tab==='habilidades';
   const classSelect=$('nex51Class'),oldClass=classSelect.value;
   const choices=isTrail?['Combatente','Especialista','Ocultista']:isGeneral?['Geral','Combatente','Especialista','Ocultista']:['Livre','Combatente','Especialista','Ocultista'];
   classSelect.innerHTML=choices.map(name=>'<option value="'+name+'">'+name+'</option>').join('');
   classSelect.value=choices.includes(oldClass)?oldClass:(isTrail?'Combatente':isGeneral?'Geral':'Livre');
   $('nex55ClassField').hidden=isOrigin||isParanormal;
   $('nex51NexField').hidden=isTrail||isOrigin||isGeneral||type==='poder_paranormal';
   $('nex53ParanormalElementField').hidden=type!=='poder_paranormal';
   $('nex52ThreatFields').hidden=type!=='ameaca';
   $('nex52AbilityFields').hidden=!['origem','poder_geral','poder','trilha','habilidade'].includes(type);
   $('nex53TrailFields').hidden=!isTrail;
   $('nex55OriginSkills').hidden=!isOrigin;
   $('nex55DescriptionField').hidden=isTrail||type==='ritual';
   $('nex55RequirementsField').hidden=isTrail||isOrigin||isGeneral||type==='poder_paranormal'||type==='ritual';
   $('nex55DescriptionLabel').textContent=isOrigin||isGeneral||isParanormal?'Descrição':'Descrição e efeitos';
   $('nex51Name').placeholder=type==='ritual'?'Novo Ritual':isParanormal||isGeneral?'Nome do homebrew':'Nome';
   $('nex51Name').parentElement.classList.toggle('nex53-ritual-name',type==='ritual');
   $('nex51Description').placeholder=isParanormal?'Descreva o poder paranormal...':isGeneral?'Descreva o poder geral...':'Descreva seu homebrew';
   $('nex51Description').required=isParanormal;
   $('nex51Element').disabled=false;
   $('nex51Element').required=type==='ritual';
   $('nex53ParanormalElement').disabled=!isParanormal;
   $('nex52RitualFields').hidden=type!=='ritual';
   toggleRitualDamageFields();
   $('nex52ItemFields').hidden=type!=='item';
   if(type==='item')$('nex52Category').value=$('nex51Edit').value?$('nex52Category').value:itemTab;
   $('nex52Category').closest('label').hidden=type==='item';
 }
 const FALLBACK_SKILLS=['Acrobacia','Adestramento','Artes','Atletismo','Atualidades','Ciências','Crime','Diplomacia','Enganação','Fortitude','Furtividade','Iniciativa','Intimidação','Intuição','Investigação','Luta','Medicina','Ocultismo','Percepção','Pilotagem','Pontaria','Profissão','Reflexos','Religião','Sobrevivência','Tática','Tecnologia','Vontade'];
 function loadSkillChoices(){
   const skills=api()?.skillNames?.()||FALLBACK_SKILLS;
   const options=skills.filter(name=>typeof name==='string').map(name=>'<option value="'+esc(name)+'">'+esc(name)+'</option>').join('');
   $('nex55Skill1').innerHTML='<option value="">Escolha a primeira perícia</option>'+options;
   $('nex55Skill2').innerHTML='<option value="">Escolha a segunda perícia</option>'+options;
 }
 function renderItemImprovements(){
   const list=$('nex52ImprovementList');if(!list)return;
   list.innerHTML=customItemImprovements.length?customItemImprovements.map((name,i)=>'<span class="nex-hb-improvement-chip">'+esc(name)+' <button type="button" data-nex52-improvement-remove="'+i+'" aria-label="Remover '+esc(name)+'">×</button></span>').join(''):'<small>Nenhuma melhoria homebrew adicionada.</small>';
 }
 function canonicalCategory(value){return ITEM_CATEGORIES.includes(value)?value:({'Arma':'Armas','Munição':'Munições','Proteção':'Proteções','Item Amaldiçoado':'Itens Amaldiçoados'}[value]||'Geral');}
 function resetForm(){
   $('nex51Form').reset();$('nex51Edit').value='';
   customItemImprovements=[];renderItemImprovements();
   loadSkillChoices();
   $('nex51Type').innerHTML=currentTypes().map(type=>'<option value="'+type+'">'+LABEL[type]+'</option>').join('');
   $('nex51Type').value=defaultType();$('nex52EditorTitle').textContent='Adicionar '+LABEL[defaultType()].toLocaleLowerCase('pt-BR');
   $('nex53ParanormalElement').value='Sangue';
   $('nex53RitualType').value='Suporte';
   $('nex53DiscenteCircle').value='2';$('nex53VerdadeiroCircle').value='3';
   $('nex53RitualImage').value='';$('nex53RitualFile').value='';$('nex53RitualPreview').hidden=true;
   $('nex52Category').value=itemTab;
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
     $('nex51Element').value=item.element;
     $('nex53RitualType').value=item.ritualType;
     $('nex53DiscenteCircle').value=String(item.discenteCircle);
     $('nex53VerdadeiroCircle').value=String(item.verdadeiroCircle);
     $('nex53Execution').value=item.execution;
     $('nex53Range').value=item.range;
     $('nex53Area').value=item.area; $('nex53Target').value=item.target;
     $('nex53Duration').value=item.duration;$('nex53Effect').value=item.effect;
     $('nex53Resistance').value=item.resistance;$('nex53Dice').value=item.ritualDice;
     $('nex53DiscenteDice').value=item.discenteDice;$('nex53VerdadeiroDice').value=item.verdadeiroDice;
     $('nex53RitualImage').value=item.image?.startsWith('https://')?item.image:'';
     $('nex53RitualPreview').hidden=!item.image;
     if(item.image)$('nex53RitualPreview').src=item.image;
     $('nex53ParanormalElement').value=['Sangue','Morte','Energia','Conhecimento','Medo'].includes(item.element)?item.element:'Sangue';$('nex51Cost').value=item.cost;
     $('nex52VD').value=item.vd;$('nex52Size').value=item.size;
     $('nex52CreatureType').value=item.creatureType;
     $('nex52Category').value=canonicalCategory(item.category);
     customItemImprovements=Array.isArray(item.customImprovements)?[...item.customImprovements]:[];renderItemImprovements();
     if(item.type==='origem'){$('nex55Skill1').value=item.skills?.[0]||'';$('nex55Skill2').value=item.skills?.[1]||'';}
     if(item.type==='trilha')TRAIL_NEX.forEach((n,i)=>{const step=(item.trailAbilities||[])[i]||{};$('nex53TrailName'+n).value=step.name||'';$('nex53TrailDescription'+n).value=step.description||'';});
     $('nex52EditorTitle').textContent='Editar '+item.name;
   }
   editorFields();$('nex52Editor').hidden=false;
   $('nex52Editor').scrollIntoView({block:'start',behavior:'smooth'});
 }
 function meta(item){
   if(item.type==='ameaca')return ['VD: '+item.vd,item.creatureType+' - '+item.size];
   if(item.type==='ritual')return [item.ritualType+' · '+item.circle+'º círculo · '+item.element,item.execution+' · '+item.range];
   if(item.type==='item')return [item.category,(item.customImprovements?.length||0)+' melhoria(s) homebrew'];
   if(item.type==='trilha')return ['Trilha · '+item.className,'4 marcos · NEX 10%, 40%, 65% e 99%'];
   if(item.type==='origem')return ['Origem personalizada',(item.skills||[]).join(' · ')||'Duas perícias'];
   if(['poder_geral','poder','habilidade'].includes(item.type))return ['Poder Geral · '+(item.className==='Livre'?'Geral':item.className),'Homebrew'];
   if(item.type==='poder_paranormal')return ['Poder Paranormal · '+item.element,'Homebrew'];
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
   const power=opened?read().find(x=>x.id===opened):null;
   const limited=power&&['poder_geral','poder','habilidade'].includes(power.type)&&!['Geral','Livre'].includes(power.className);
   sel.innerHTML='<option value="">Selecione um personagem</option>'+agents.map(a=>{
     const locked=limited&&a.className!==power.className;
     return '<option value="'+esc(a.id)+'"'+(locked?' disabled':'')+'>'+esc(a.name||'Personagem')+' · '+esc(a.className||'Classe não definida')+(locked?' (classe incompatível)':'')+'</option>';
   }).join('');
   const active=api()?.ready()?api().current()?.id:null;
   const chosen=agents.some(x=>x.id===previous)?previous:active;
   if(chosen&&agents.some(x=>x.id===chosen)&&![...sel.options].find(x=>x.value===chosen)?.disabled)sel.value=chosen;
 }
 function renderLibrary(){
   const records=read(),types=currentTypes();
   $('nex53SkillTabs').hidden=tab!=='habilidades';
   mount.querySelectorAll('[data-nex53-skill]').forEach(button=>{const selected=tab==='habilidades'&&button.dataset.nex53Skill===skillTab;button.setAttribute('aria-selected',String(selected));button.classList.toggle('active',selected);});
   const visible=records.filter(x=>types.includes(x.type)&&(tab!=='itens'||canonicalCategory(x.category)===itemTab));
   $('nexHbItemTabs').hidden=tab!=='itens';
   mount.querySelectorAll('[data-nex-hb-item-tab]').forEach(button=>{const active=tab==='itens'&&button.dataset.nexHbItemTab===itemTab;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active));});
   $('nex53RitualFilter').hidden=tab!=='rituais';
   if(tab==='rituais')$('nex53RitualFilter').innerHTML=['Todas','Dano','Suporte','Cura'].map(t=>'<button type="button" data-ritual-filter="'+t+'" aria-pressed="'+String(t===ritualFilter)+'">'+t+'</button>').join('');
   const query=$('nex51Search').value.trim().toLocaleLowerCase('pt-BR');
   const filtered=visible.filter(x=>(tab!=='rituais'||ritualFilter==='Todas'||x.ritualType===ritualFilter)&&(!query||[x.name,x.description,x.requirements,x.className,x.creatureType,x.category,x.element,x.ritualType].join(' ').toLocaleLowerCase('pt-BR').includes(query)));
   $('nex52Count').textContent='Homebrew '+visible.length+'/50';
   mount.querySelectorAll('[data-nex52-tab]').forEach(button=>{
     const selected=button.dataset.nex52Tab===tab;
     button.setAttribute('aria-selected',String(selected));button.classList.toggle('active',selected);
   });
   $('nex51List').innerHTML=filtered.length?filtered.map(card).join(''):
    '<div class="nex52-empty">Nenhum '+(tab==='habilidades'?({origens:'origem',paranormais:'poder paranormal',gerais:'poder geral',trilhas:'trilha'})[skillTab]:titleFor(tab).toLocaleLowerCase('pt-BR'))+' cadastrado'+(query?' para esta busca':'')+'. Use <strong>Adicionar</strong> para criar um.</div>';
   renderSheet();
 }
 // NEX por círculo do Ocultista: 1º=5%, 2º=25%, 3º=55%, 4º=85%.
 // Aprimoramentos ainda exigem PE, afinidade e condições específicas do ritual.
 const nexForCircle=[0,5,25,55,85];
 function ritualUnlocked(circle,character){
   const required=nexForCircle[Number(circle)]??Infinity;
   return character?.className==='Ocultista'&&Number(character?.nex)>=required;
 }
 function sheetRitualDetails(ritual,character){
   if(ritual.type!=='ritual')return '';
   let html='<details class="nex53-attached-ritual"><summary>Ver ritual e versões disponíveis</summary><p>'+esc(ritual.ritualType)+' · '+esc(ritual.circle)+'º círculo · '+esc(ritual.element)+'</p>';
   if(ritual.ritualType==='Dano'){
     if(ritualUnlocked(ritual.circle,character)&&ritual.ritualDice)html+='<p><strong>Dados:</strong> '+esc(ritual.ritualDice)+'</p>';
     else html+='<p class="nex53-advanced-status">Forma básica: exige acesso ao '+esc(ritual.circle)+'º círculo.</p>';
     if(ritual.discenteDice&&ritualUnlocked(ritual.discenteCircle,character))html+='<p><strong>Discente:</strong> '+esc(ritual.discenteDice)+'</p>';
     if(ritual.verdadeiroDice&&ritualUnlocked(ritual.verdadeiroCircle,character))html+='<p><strong>Verdadeiro:</strong> '+esc(ritual.verdadeiroDice)+'</p>';
     if(ritual.discenteDice&&!ritualUnlocked(ritual.discenteCircle,character))html+='<p class="nex53-advanced-status">Discente: exige '+esc(ritual.discenteCircle)+'º círculo.</p>';
     if(ritual.verdadeiroDice&&!ritualUnlocked(ritual.verdadeiroCircle,character))html+='<p class="nex53-advanced-status">Verdadeiro: exige '+esc(ritual.verdadeiroCircle)+'º círculo.</p>';
   }
   html+='<p class="nex53-advanced-status">A liberação por NEX não dispensa custo de PE, afinidade ou outros pré-requisitos do ritual.</p></details>';
   return html;
 }
 function renderSheet(){
   const current=api()?.ready()?api().current():null;
   const items=Array.isArray(current?.items)?current.items.filter(valid).map(normalize):[];
   $('nex51SheetCount').textContent=String(items.length);
   $('nex51SheetItems').innerHTML=items.length?items.map(item=>
     '<div class="nex52-attached"><span><strong>'+esc(item.name)+'</strong><small>'+esc(LABEL[item.type])+'</small>'+(item.type==='trilha'?'<details class="nex53-attached-trail"><summary>Ver as 4 habilidades</summary>'+trailDetails(item)+'</details>':'')+sheetRitualDetails(item,current)+'</span>'+
     '<button type="button" class="btn sm" data-nex52-detach="'+esc(item.id)+'">Remover</button></div>').join(''):
     '<p class="nex52-empty">Nenhum homebrew associado a esta ficha.</p>';
 }
 function closeDialog(){const d=$('nex52Detail');if(typeof d.close==='function')d.close();else d.removeAttribute('open');opened=null;}
 function ritualDetails(item,character=null){
   if(item.type!=='ritual')return '';
   const fields=[['Categoria',item.ritualType],['Execução',item.execution],['Alcance',item.range],['Área',item.area],['Alvo',item.target],['Duração',item.duration],['Efeito',item.effect],['Resistência',item.resistance]];
   if(item.ritualType==='Dano'){
      if(!character||ritualUnlocked(item.circle,character))fields.push(['Dados',item.ritualDice]);
      if(!character||ritualUnlocked(item.discenteCircle,character))fields.push(['Dados Discente',item.discenteDice]);
      if(!character||ritualUnlocked(item.verdadeiroCircle,character))fields.push(['Dados Verdadeiro',item.verdadeiroDice]);
   }
   return '<div class="nex53-ritual-details">'+fields.filter(([label,value])=>value).map(([label,value])=>'<div><strong>'+esc(label)+'</strong><p>'+esc(value)+'</p></div>').join('')+'</div>';
 }
 function view(item){
   opened=item.id;const info=meta(item);
   $('nex52DetailBody').innerHTML='<div class="nex52-detail-top"><span>'+esc(LABEL[item.type])+'</span><h3>'+esc(item.name)+'</h3></div>'+
     '<p class="nex52-detail-meta">'+esc(info.join(' · '))+'</p>'+
     (item.description?'<h4>Descrição</h4><p>'+esc(item.description)+'</p>':'<p>Sem descrição.</p>')+
     (item.requirements?'<h4>Pré-requisitos</h4><p>'+esc(item.requirements)+'</p>':'')+
     (item.type==='origem'?'<h4>Perícias treinadas</h4><p>'+esc((item.skills||[]).join(' e ')||'Não configuradas')+'</p>':'')+
     (item.type==='item'&&item.customImprovements?.length?'<h4>Melhorias homebrew</h4><p>'+item.customImprovements.map(esc).join(' · ')+'</p>':'')+ritualDetails(item)+trailDetails(item);
   targetOptions();const d=$('nex52Detail');if(typeof d.showModal==='function')d.showModal();else d.setAttribute('open','');
 }
 $('nex51Type').addEventListener('change',editorFields);
 $('nex53RitualType').addEventListener('change',toggleRitualDamageFields);
 $('nex51Circle').addEventListener('change',()=>{
   const circle=Number($('nex51Circle').value);
   $('nex53DiscenteCircle').value=String(Math.min(4,circle+1));
   $('nex53VerdadeiroCircle').value=String(Math.min(4,circle+2));
 });
 $('nex53RitualImage').addEventListener('input',e=>{
   const src=e.target.value.trim();
   const preview=$('nex53RitualPreview');preview.hidden=!/^https:\/\//i.test(src);
   if(!preview.hidden)preview.src=src;
 });
 $('nex53RitualFile').addEventListener('change',e=>{
   const file=e.target.files?.[0];if(!file)return;
   if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>400000){
     message('Escolha PNG, JPG ou WebP com até 400 KB.');e.target.value='';return;
   }
   const reader=new FileReader();
   reader.onload=()=>{const preview=$('nex53RitualPreview');preview.src=String(reader.result||'');preview.hidden=false;$('nex53RitualImage').value='';message('Imagem carregada. Salve o ritual para manter a imagem.');};
   reader.readAsDataURL(file);
 });
 $('nex52Add').addEventListener('click',()=>openEditor(null));
 $('nex52CloseEditor').addEventListener('click',closeEditor);
 $('nex52Cancel').addEventListener('click',closeEditor);
 $('nex52Close').addEventListener('click',closeDialog);
 $('nex52Detail').addEventListener('close',()=>{opened=null;});
 $('nex51Search').addEventListener('input',renderLibrary);
 $('nex53RitualFilter').addEventListener('click',e=>{const t=e.target.closest('[data-ritual-filter]');if(!t)return;ritualFilter=t.dataset.ritualFilter;renderLibrary();});
 $('nexHbItemTabs').addEventListener('click',e=>{
   const button=e.target.closest('[data-nex-hb-item-tab]');if(!button)return;
   itemTab=button.dataset.nexHbItemTab;
   $('nex51Search').value='';closeEditor();renderLibrary();
 });
 mount.querySelector('.nex52-tabs').addEventListener('click',e=>{
   const btn=e.target.closest('[data-nex52-tab]');if(!btn)return;
   tab=btn.dataset.nex52Tab;ritualFilter='Todas';$('nex51Search').value='';closeEditor();renderLibrary();
 });
 $('nex53SkillTabs').addEventListener('click',e=>{
   const btn=e.target.closest('[data-nex53-skill]');
   if(!btn||!Object.hasOwn(SKILL_TABS,btn.dataset.nex53Skill))return;
   skillTab=btn.dataset.nex53Skill;$('nex51Search').value='';closeEditor();renderLibrary();
 });
 $('nex52ImprovementAdd').addEventListener('click',()=>{
   const input=$('nex52ImprovementName'),name=cut(input.value,80);
   if(!name){input.focus();return;}
   if(customItemImprovements.some(x=>x.toLocaleLowerCase('pt-BR')===name.toLocaleLowerCase('pt-BR'))){message('Esta melhoria já foi adicionada.');return;}
   if(customItemImprovements.length>=30){message('Limite de 30 melhorias homebrew por item.');return;}
   customItemImprovements.push(name);input.value='';renderItemImprovements();input.focus();
 });
 $('nex52ImprovementName').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('nex52ImprovementAdd').click();}});
 $('nex52ImprovementList').addEventListener('click',e=>{
   const button=e.target.closest('[data-nex52-improvement-remove]');if(!button)return;
   const index=Number(button.dataset.nex52ImprovementRemove);
   if(Number.isInteger(index)&&index>=0&&index<customItemImprovements.length){customItemImprovements.splice(index,1);renderItemImprovements();}
 });
 $('nex51Form').addEventListener('submit',e=>{
   e.preventDefault();const type=$('nex51Type').value,name=cut($('nex51Name').value,90);
   if(!Object.hasOwn(LABEL,type)||!name){message('Informe um nome e um tipo.');return;}
   const all=read(),editing=$('nex51Edit').value,old=all.find(x=>x.id===editing);
   if(editing&&!old){message('O conteúdo original não foi encontrado.');return;}
   const count=all.filter(x=>currentTypes().includes(x.type)).length;
   if(!editing&&count>=50){message('Limite de 50 homebrews para esta categoria.');return;}
   if(type==='trilha'&&TRAIL_NEX.some(n=>!cut($('nex53TrailName'+n).value,90))){message('Informe o nome das quatro habilidades da trilha: 10%, 40%, 65% e 99%.');return;}
   if(type==='poder_paranormal' && !cut($('nex51Description').value,2000)){message('Preencha a descrição do poder paranormal.');return;}
   if(type==='ritual'&&$('nex53RitualType').value==='Dano'&&(Number($('nex53DiscenteCircle').value)<Number($('nex51Circle').value)||Number($('nex53VerdadeiroCircle').value)<Number($('nex53DiscenteCircle').value))){message('O círculo Discente deve ser igual ou superior ao básico; o Verdadeiro não pode ser menor que o Discente.');return;}
   if(type==='origem'){
     const first=$('nex55Skill1').value,second=$('nex55Skill2').value,available=api()?.skillNames?.()||FALLBACK_SKILLS;
     if(!first||!second||first===second||!available.includes(first)||!available.includes(second)){
       message('Escolha duas perícias diferentes para a origem.');return;
     }
   }
   if(!editing&&all.length>=300){message('Limite total da biblioteca atingido.');return;}
   if(type==='item')$('nex52Category').value=itemTab;
   const record=normalize({
     id:editing||'hb51_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,9),
     type,name,description:$('nex51Description').value,requirements:$('nex51Requirements').value,
     className:$('nex51Class').value,minNex:['trilha','origem','poder_geral','poder','habilidade'].includes(type)?(old?.minNex??(type==='trilha'?10:5)):$('nex51Nex').value,circle:$('nex51Circle').value,
     element:type==='poder_paranormal'?$('nex53ParanormalElement').value:$('nex51Element').value,cost:$('nex51Cost').value,vd:$('nex52VD').value,
     ritualType:type==='ritual'?$('nex53RitualType').value:(old?.ritualType||'Suporte'),
     discenteCircle:type==='ritual'?$('nex53DiscenteCircle').value:old?.discenteCircle,
     verdadeiroCircle:type==='ritual'?$('nex53VerdadeiroCircle').value:old?.verdadeiroCircle,
     execution:type==='ritual'?$('nex53Execution').value:(old?.execution||'Padrão'),
     range:type==='ritual'?$('nex53Range').value:(old?.range||'Pessoal'),
     area:type==='ritual'?$('nex53Area').value:old?.area,
     target:type==='ritual'?$('nex53Target').value:old?.target,
     duration:type==='ritual'?$('nex53Duration').value:old?.duration,
     effect:type==='ritual'?$('nex53Effect').value:old?.effect,
     resistance:type==='ritual'?$('nex53Resistance').value:old?.resistance,
     ritualDice:type==='ritual'?$('nex53Dice').value:old?.ritualDice,
     discenteDice:type==='ritual'?$('nex53DiscenteDice').value:old?.discenteDice,
     verdadeiroDice:type==='ritual'?$('nex53VerdadeiroDice').value:old?.verdadeiroDice,
     image:type==='ritual'?($('nex53RitualFile').files.length?(! $('nex53RitualPreview').hidden ?$('nex53RitualPreview').src:''):($('nex53RitualImage').value||(! $('nex53RitualPreview').hidden?$('nex53RitualPreview').src:''))):(old?.image||''),
     size:$('nex52Size').value,creatureType:$('nex52CreatureType').value,category:$('nex52Category').value,
     customImprovements:type==='item'?customItemImprovements:(old?.customImprovements||[]),
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
   if(btn.dataset.nex52Edit){if(item.type==='item')itemTab=canonicalCategory(item.category);openEditor(item);return;}
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