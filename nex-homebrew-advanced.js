/* NEX 2.0.55 - Editores de habilidades por categoria; origens com duas perícias treinadas. */
(()=>{
 'use strict';
 const KEY='nex_homebrew_advanced_v2051';
 const LABEL={ameaca:'Ameaça',origem:'Origem',poder_paranormal:'Poder Paranormal',poder_geral:'Poder Geral',poder:'Poder',trilha:'Trilha',habilidade:'Habilidade',ritual:'Ritual',item:'Item',melhoria:'Melhoria',maldicao:'Maldição'};
 const TABS={ameacas:['ameaca'],habilidades:['origem','poder_paranormal','poder_geral','poder','habilidade','trilha'],rituais:['ritual'],itens:['item'],melhorias:['melhoria'],paranormal:['item','maldicao']};
 const SKILL_TABS={origens:['origem'],paranormais:['poder_paranormal'],gerais:['poder_geral','poder','habilidade'],trilhas:['trilha']};
 const TRAIL_NEX=[10,40,65,99];
 const ITEM_CATEGORIES=['Armas','Munições','Proteções','Geral','Itens Amaldiçoados'];
 const CURSED_KINDS=['Armas Amaldiçoadas','Proteções Amaldiçoadas','Munições Amaldiçoadas','Acessórios Amaldiçoados','Itens Paranormais'];
 const IMPROVEMENT_TARGETS=['Armas','Munições','Proteções','Geral'];
 const BONUS_TYPES=[['ataque','Bônus de ataque'],['dano','Bônus de dano'],['critico','Margem de crítico'],['multiplicador','Multiplicador crítico'],['defesa','Defesa'],['resistencia','Redução de dano'],['espacos','Espaços ocupados'],['pericia','Testes de perícia']];
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
   paranormalActivation:cut(x.paranormalActivation||'',120),
   paranormalEffect:cut(x.paranormalEffect||'',220),
   cursedAmmoType:cut(x.cursedAmmoType||'Balas curtas',80),
   cursedAmmoBonus:cut(x.cursedAmmoBonus||'',60),
   cursedAccessoryType:cut(x.cursedAccessoryType||'Anel',80),
   cursedAccessoryBenefit:cut(x.cursedAccessoryBenefit||'',100),
   cursedArtifactRequirement:cut(x.cursedArtifactRequirement||'',120),
   cursedKind:CURSED_KINDS.includes(x.cursedKind)?x.cursedKind:'Itens Paranormais',
   curseTarget:cut(x.curseTarget||'Armas',50),
   improvementTarget:IMPROVEMENT_TARGETS.includes(x.improvementTarget)?x.improvementTarget:'Armas',
   bonusType:BONUS_TYPES.some(([id])=>id===x.bonusType)?x.bonusType:'ataque',
   bonusValue:Number.isFinite(Number(x.bonusValue))?Math.max(0,Math.min(10,Number(x.bonusValue))):0,
   bonusSkill:cut(x.bonusSkill||'',60),
   accessoryBonus:num(x.accessoryBonus,0,10,0),
   accessorySkill:cut(x.accessorySkill||'',60),
   itemTier:['0','I','II','III','IV'].includes(String(x.itemTier||''))?String(x.itemTier):'0',
   itemSpaces:num(x.itemSpaces,0,100,1),
   protectionDefense:num(x.protectionDefense,0,100,1),
   weaponProficiency:cut(x.weaponProficiency||'Armas Simples',70),
   weaponKind:cut(x.weaponKind||'Corpo a Corpo',70),
   weaponWield:cut(x.weaponWield||'Uma Mão',50),
   weaponDamage:cut(x.weaponDamage||'',90),
   weaponSecondary:cut(x.weaponSecondary||'',90),
   weaponSecondaryType:cut(x.weaponSecondaryType||'Normal',40),
   weaponCritical:cut(x.weaponCritical||'20',16),
   weaponMultiplier:cut(x.weaponMultiplier||'2',10),
   weaponDamageType:cut(x.weaponDamageType||'Corte',60),
   weaponRange:cut(x.weaponRange||'—',60),
   weaponQuantity:num(x.weaponQuantity,1,9999,1),
   itemTag:['Acessórios','Explosivos','Itens Operacionais'].includes(x.itemTag)?x.itemTag:'Acessórios',
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
 let tab='ameacas',skillTab='origens',ritualFilter='Todas',itemTab='Armas',paranormalSection='itens',cursedKind='Itens Paranormais',opened=null;
 const titleFor=t=>t==='ameacas'?'Ameaças':t==='habilidades'?'Habilidades':t==='rituais'?'Rituais':t==='paranormal'?'Paranormal':'Itens';
 const currentTypes=()=>tab==='habilidades'?SKILL_TABS[skillTab]:tab==='paranormal'?(paranormalSection==='maldicoes'?['maldicao']:['item']):TABS[tab];
 const defaultType=()=>({ameacas:'ameaca',habilidades:({origens:'origem',paranormais:'poder_paranormal',gerais:'poder_geral',trilhas:'trilha'})[skillTab],rituais:'ritual',itens:'item',melhorias:'melhoria',paranormal:paranormalSection==='maldicoes'?'maldicao':'item'})[tab];
 const api=()=>window.NEX51_BRIDGE;
 function message(text){const box=$('nex52Message');if(box)box.textContent=text;}
 mount.innerHTML=
 '<div class="nex52-tabs" role="tablist" aria-label="Tipos de homebrew">'+
 '<button type="button" data-nex52-tab="ameacas" role="tab" aria-selected="true">AMEAÇAS</button>'+
 '<button type="button" data-nex52-tab="habilidades" role="tab" aria-selected="false">HABILIDADES</button>'+
 '<button type="button" data-nex52-tab="rituais" role="tab" aria-selected="false">RITUAIS</button>'+
 '<button type="button" data-nex52-tab="itens" role="tab" aria-selected="false">ITENS</button>'+ 
 '<button type="button" data-nex52-tab="melhorias" role="tab" aria-selected="false">MELHORIAS</button>'+ 
 '<button type="button" data-nex52-tab="paranormal" role="tab" aria-selected="false">PARANORMAL</button></div>'+
 '<div class="nex53-subtabs" id="nex53SkillTabs" role="tablist" aria-label="Categorias de habilidades" hidden>'+
 '<button type="button" data-nex53-skill="origens" role="tab" aria-selected="true">Origens</button>'+
 '<button type="button" data-nex53-skill="paranormais" role="tab" aria-selected="false">Poderes Paranormais</button>'+
 '<button type="button" data-nex53-skill="gerais" role="tab" aria-selected="false">Poderes Gerais</button>'+
 '<button type="button" data-nex53-skill="trilhas" role="tab" aria-selected="false">Trilhas</button></div>'+
 '<div class="nex53-ritual-filter" id="nex53RitualFilter" hidden aria-label="Tipos de ritual"></div>'+ 
 '<div class="nex-hb-item-tabs" id="nexHbItemTabs" role="tablist" aria-label="Tipos de itens homebrew" hidden>'+ITEM_CATEGORIES.map(c=>'<button type="button" role="tab" data-nex-hb-item-tab="'+esc(c)+'" aria-selected="false">'+esc(c)+'</button>').join('')+'</div>'+ 
 '<div id="nexHbParanormalNav" class="nex-hb-paranormal-nav" hidden><div class="nex-hb-paranormal-sections"><button type="button" data-nex-psection="itens">Itens Amaldiçoados</button><button type="button" data-nex-psection="maldicoes">Maldições</button></div><div id="nexHbCursedKinds" class="nex-hb-paranormal-kinds">'+CURSED_KINDS.map(k=>'<button type="button" data-nex-ckind="'+esc(k)+'">'+esc(k)+'</button>').join('')+'</div></div>'+ 
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
 '<select id="nex52Category" hidden aria-label="Categoria definida pela aba">'+ITEM_CATEGORIES.map(c=>'<option value="'+esc(c)+'">'+esc(c)+'</option>').join('')+'</select>'+
 '<div class="nex-hb-hidden-item-values" hidden><select id="nexHbElement"><option>Conhecimento</option><option>Energia</option><option>Medo</option><option>Morte</option><option>Sangue</option></select><select id="nexHbTier"><option value="0">0</option><option>I</option><option>II</option><option>III</option><option>IV</option></select><input type="number" id="nexHbSpaces" value="1"><select id="nexHbTag"><option>Acessórios</option><option>Explosivos</option><option>Itens Operacionais</option></select></div>'+
 '<section class="nex-hb-special-form" id="nexHbCursedForm" hidden><div class="nex-hb-cursed-fields"><label>Elemento<select data-hb-sync="nexHbElement"><option>Conhecimento</option><option>Energia</option><option>Medo</option><option>Morte</option><option>Sangue</option></select></label><label>Categoria*<select data-hb-sync="nexHbTier"><option value="0">0</option><option>I</option><option>II</option><option>III</option><option>IV</option></select></label><label>Espaços*<input type="number" min="0" max="100" data-hb-sync="nexHbSpaces" value="1"></label></div></section>'+
 '<section class="nex-hb-special-form" id="nexHbGeneralForm" hidden><div class="nex-hb-general-fields"><label>Categoria*<select data-hb-sync="nexHbTier"><option value="0">0</option><option>I</option><option>II</option><option>III</option><option>IV</option></select></label><label>Espaços*<input type="number" min="0" max="100" data-hb-sync="nexHbSpaces" value="1"></label><label>Tag<select data-hb-sync="nexHbTag"><option>Acessórios</option><option>Explosivos</option><option>Itens Operacionais</option></select></label></div></section>'+
 '<section class="nex-hb-special-form" id="nexHbWeaponForm" hidden><div class="nex-hb-weapon-fields">'+
 '<label>Proficiência<select id="nexHbWeaponProficiency"><option>Armas Simples</option><option>Armas Táticas</option><option>Armas Pesadas</option></select></label>'+
 '<label>Tipo<select id="nexHbWeaponKind"><option>Corpo a Corpo</option><option>Arma de Disparo</option><option>Arma de Fogo</option><option>Arremesso</option></select></label>'+
 '<label>Empunhadura<select id="nexHbWeaponWield"><option>Uma Mão</option><option>Duas Mãos</option><option>Leve</option></select></label>'+
 '<label>Dano*<input id="nexHbWeaponDamage" maxlength="90" placeholder="1d8" required></label>'+
 '<label>Dano secundário<input id="nexHbWeaponSecondary" maxlength="90" placeholder="Opcional"></label>'+
 '<label>Tipo do dano secundário<select id="nexHbWeaponSecondaryType"><option>Normal</option><option>Sangue</option><option>Morte</option><option>Energia</option><option>Conhecimento</option><option>Medo</option></select></label>'+
 '<label>Crítico*<input id="nexHbWeaponCritical" maxlength="16" value="20" required></label>'+
 '<label>Multiplicador*<input id="nexHbWeaponMultiplier" maxlength="10" value="2" required></label>'+
 '<label>Tipo de Dano<select id="nexHbWeaponDamageType"><option>Corte</option><option>Perfuração</option><option>Impacto</option><option>Balístico</option><option>Fogo</option><option>Energia</option><option>Morte</option><option>Sangue</option><option>Conhecimento</option><option>Medo</option></select></label>'+
 '<label>Alcance<input id="nexHbWeaponRange" maxlength="60" placeholder="Toque, Curto, Médio..."></label>'+
 '<label>Categoria base*<select data-hb-sync="nexHbTier"><option value="0">0</option><option>I</option><option>II</option><option>III</option><option>IV</option></select></label>'+
 '<label>Espaços*<input type="number" min="0" max="100" data-hb-sync="nexHbSpaces" value="1"></label>'+
 '<label>Quantidade<input id="nexHbWeaponQuantity" type="number" min="1" max="9999" value="1"></label></div></section>'+
 '<section class="nex-hb-special-form" id="nexHbProtectionForm" hidden><div class="nex-hb-protection-fields">'+
 '<label>Defesa*<input type="number" id="nexHbProtectionDefense" min="0" max="100" value="1" required></label>'+
 '<label>Categoria*<select data-hb-sync="nexHbTier"><option value="0">0</option><option>I</option><option>II</option><option>III</option><option>IV</option></select></label>'+
 '<label>Espaços*<input type="number" min="0" max="100" data-hb-sync="nexHbSpaces" value="1"></label></div></section>'+
 '<section class="nex-hb-special-form" id="nexHbOtherForm" hidden><div class="nex-hb-general-fields"><label>Categoria*<select data-hb-sync="nexHbTier"><option value="0">0</option><option>I</option><option>II</option><option>III</option><option>IV</option></select></label><label>Espaços*<input type="number" min="0" max="100" data-hb-sync="nexHbSpaces" value="1"></label></div></section>'+
 '<section id="nexHbSharedImprovements" class="nex52-full nex-hb-item-improvements" hidden><div class="nex-hb-improvement-heading"><strong>Melhorias</strong><button type="button" id="nex52ImprovementAdd">Adicionar</button></div><input type="text" id="nex52ImprovementName" maxlength="80" placeholder="Nome da melhoria" aria-label="Nome da melhoria"><div id="nex52ImprovementList" class="nex-hb-improvement-list" aria-live="polite"></div></section>'+
 '<section class="nex-hb-special-form" id="nexHbParanormalExtras" hidden><strong id="nexHbParanormalKindLabel">Itens Paranormais</strong>'+
 '<div id="nexHbAmmoExtras" class="nex-hb-paranormal-extra-fields" hidden><label>Tipo de munição<input id="nexHbCursedAmmoType" maxlength="80" placeholder="Ex.: Balas curtas"></label><label>Dano ou efeito adicional<input id="nexHbCursedAmmoBonus" maxlength="60" placeholder="Ex.: 1d6 de Energia"></label></div>'+
 '<div id="nexHbAccessoryExtras" class="nex-hb-paranormal-extra-fields" hidden><label>Tipo de acessório<input id="nexHbCursedAccessoryType" maxlength="80" placeholder="Ex.: Anel"></label><label>Benefício passivo<input id="nexHbCursedAccessoryBenefit" maxlength="100" placeholder="Descreva o benefício"></label><label>Bônus de perícia (opcional)<input id="nexHbAccessoryBonus" type="text" maxlength="3" inputmode="numeric" placeholder="+1 até +10"></label><label>Perícia beneficiada<select id="nexHbAccessorySkill"><option value="">Selecione a perícia</option></select></label></div>'+
 '<div id="nexHbArtifactExtras" class="nex-hb-paranormal-extra-fields" hidden><label>Condição de uso<input id="nexHbCursedArtifactRequirement" maxlength="120" placeholder="Ex.: Apenas em uma cena"></label></div>'+
 '<div class="nex-hb-paranormal-extra-fields"><label>Uso ou ativação<input id="nexHbParanormalActivation" maxlength="120" placeholder="Ex.: Ação padrão"></label><label>Efeito paranormal<input id="nexHbParanormalEffect" maxlength="220" placeholder="Efeito paranormal do item"></label></div></section>'+ 
 '<div class="nex-hb-image-area nex52-full"><input id="nexHbImageUrl" type="hidden">'+
 '<label>Imagem<input id="nexHbImageFile" type="file" accept="image/png,image/jpeg,image/webp"></label>'+
 '<img id="nexHbImagePreview" alt="Prévia da imagem do item" hidden></div>'+
 '</div>'+
 '<div class="nex52-specific nex52-full" id="nexHbImprovementFields" hidden>'+
 '<label>Aplicável a<select id="nexHbImprovementTarget">'+IMPROVEMENT_TARGETS.map(value=>'<option value="'+esc(value)+'">'+esc(value)+'</option>').join('')+'</select></label>'+
 '<div class="nex-hb-bonus-grid"><label>Tipo de bônus<select id="nexHbBonusType">'+BONUS_TYPES.map(([id,name])=>'<option value="'+esc(id)+'">'+esc(name)+'</option>').join('')+'</select></label>'+
 '<label>Valor do bônus<input id="nexHbBonusValue" type="text" maxlength="3" inputmode="numeric" placeholder="+1 até +10" value="+2" required></label><label id="nexHbBonusSkillField" hidden>Perícia beneficiada<select id="nexHbBonusSkill"><option value="">Selecione a perícia</option></select></label></div></div>'+ 
 '<div id="nexHbCurseFields" class="nex52-specific nex52-full" hidden><label>Elemento<select id="nexHbCurseElement"><option>Sangue</option><option>Morte</option><option>Energia</option><option>Conhecimento</option><option>Medo</option></select></label><label>Aplicável a<select id="nexHbCurseTarget"><option>Armas</option><option>Proteções</option><option>Munições</option><option>Acessórios</option><option>Itens Gerais</option></select></label></div>'+ 
 '<div id="nex53TrailFields" class="nex53-trail-fields nex52-full" hidden><p>Configure o nome e o efeito de cada marco de NEX.</p>'+
 TRAIL_NEX.map((n,i)=>'<fieldset class="nex53-trail-step"><legend>NEX '+n+'% · Habilidade '+(i+1)+'</legend>'+
 '<label>Nome da habilidade<input type="text" id="nex53TrailName'+n+'" maxlength="90" placeholder="Nome da habilidade de '+n+'%"></label>'+
 '<label>Descrição e efeitos<textarea id="nex53TrailDescription'+n+'" maxlength="1600" rows="3" placeholder="Descreva o efeito concedido em '+n+'% de NEX"></textarea></label></fieldset>').join('')+'</div>'+
 '<div class="nex55-origin-skills nex52-full" id="nex55OriginSkills" hidden><label>Primeira perícia<select id="nex55Skill1"><option value="">Escolha a primeira perícia</option></select></label>'+
 '<label>Segunda perícia<select id="nex55Skill2"><option value="">Escolha a segunda perícia</option></select></label>'+
 '<p>Ao aplicar esta origem, as duas perícias ficam treinadas (+5) automaticamente na ficha, sem reduzir treinamentos existentes.</p></div>'+
 '<label class="nex52-full" id="nex55DescriptionField"><span id="nex55DescriptionLabel">Descrição e efeitos</span><div id="nexHbDescriptionToolbar" class="nex-hb-text-toolbar" hidden><button type="button" data-hb-format="**" aria-label="Negrito"><b>B</b></button><button type="button" data-hb-format="*" aria-label="Itálico"><i>I</i></button><button type="button" data-hb-format="__" aria-label="Sublinhado"><u>U</u></button></div><textarea id="nex51Description" maxlength="2000" rows="4" placeholder="Descreva seu homebrew"></textarea></label>'+
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
   $('nex55TypeField').hidden=tab==='habilidades'||type==='item'||type==='melhoria'||type==='maldicao';
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
   $('nex55DescriptionLabel').textContent=type==='item'?'Descrição* (use B, I ou U para formatar)':'Descrição';
   $('nexHbDescriptionToolbar').hidden=true;
   $('nex55RequirementsField').hidden=isTrail||isOrigin||isGeneral||type==='poder_paranormal'||type==='ritual'||type==='item'||type==='melhoria'||type==='maldicao';
   $('nex55DescriptionLabel').textContent=type==='item'||type==='melhoria'||type==='maldicao'?'Descrição*':isOrigin||isGeneral||isParanormal?'Descrição':'Descrição e efeitos';
   $('nex51Name').placeholder=type==='ritual'?'Novo Ritual':isParanormal||isGeneral?'Nome do homebrew':'Nome';
   $('nex51Name').parentElement.classList.toggle('nex53-ritual-name',type==='ritual');
   $('nex51Description').placeholder=isParanormal?'Descreva o poder paranormal...':isGeneral?'Descreva o poder geral...':'Descreva seu homebrew';
   $('nex51Description').required=isParanormal||type==='item'||type==='melhoria'||type==='maldicao';
   $('nex51Element').disabled=false;
   $('nex51Element').required=type==='ritual';
   $('nex53ParanormalElement').disabled=!isParanormal;
   $('nex52RitualFields').hidden=type!=='ritual';
   toggleRitualDamageFields();
   $('nex52ItemFields').hidden=type!=='item';
   $('nexHbImprovementFields').hidden=type!=='melhoria';
   $('nexHbBonusSkillField').hidden=type!=='melhoria'||$('nexHbBonusType').value!=='pericia';
   $('nexHbCurseFields').hidden=type!=='maldicao';
   if(type==='item')$('nex52Category').value=tab==='paranormal'?'Itens Amaldiçoados':$('nex51Edit').value?$('nex52Category').value:itemTab;
   $('nex52Category').hidden=true;
   const cursed=type==='item'&&(tab==='paranormal'||itemTab==='Itens Amaldiçoados');
   const general=type==='item'&&tab!=='paranormal'&&itemTab==='Geral';
   const weapon=type==='item'&&(tab==='paranormal'?cursedKind==='Armas Amaldiçoadas':itemTab==='Armas');
   const protection=type==='item'&&(tab==='paranormal'?cursedKind==='Proteções Amaldiçoadas':itemTab==='Proteções');
   $('nexHbCursedForm').hidden=!cursed;
   $('nexHbCursedForm').querySelectorAll('[data-hb-sync="nexHbTier"],[data-hb-sync="nexHbSpaces"]').forEach(el=>el.closest('label').hidden=weapon||protection);
   if(type==='item'&&tab==='paranormal')$('nexHbParanormalKindLabel').textContent=cursedKind;
   $('nexHbGeneralForm').hidden=!general;
   $('nexHbWeaponForm').hidden=!weapon;
   $('nexHbProtectionForm').hidden=!protection;
   $('nexHbOtherForm').hidden=type!=='item'||general||weapon||protection||cursed;
   $('nexHbParanormalExtras').hidden=type!=='item'||tab!=='paranormal'||weapon||protection;
   $('nexHbAmmoExtras').hidden=cursedKind!=='Munições Amaldiçoadas';
   $('nexHbAccessoryExtras').hidden=cursedKind!=='Acessórios Amaldiçoados';
   $('nexHbArtifactExtras').hidden=cursedKind!=='Itens Paranormais';
   $('nexHbSharedImprovements').hidden=type!=='item'||!(general||protection||weapon);
   ['nexHbProtectionDefense','nexHbWeaponDamage','nexHbWeaponCritical','nexHbWeaponMultiplier'].forEach(id=>{ $(id).required=protection&&id==='nexHbProtectionDefense'||weapon&&id!=='nexHbProtectionDefense'; });
   $('nex52Editor').dataset.itemKind=type==='item'?(cursed?'cursed':general?'general':'other'):'';
   syncItemCategoryFields();
   syncCursedWeaponElement();
   syncParanormalWeaponTier();
 }
 const FALLBACK_SKILLS=['Acrobacia','Adestramento','Artes','Atletismo','Atualidades','Ciências','Crime','Diplomacia','Enganação','Fortitude','Furtividade','Iniciativa','Intimidação','Intuição','Investigação','Luta','Medicina','Ocultismo','Percepção','Pilotagem','Pontaria','Profissão','Reflexos','Religião','Sobrevivência','Tática','Tecnologia','Vontade'];
 function loadSkillChoices(){
   const skills=api()?.skillNames?.()||FALLBACK_SKILLS;
   const options=skills.filter(name=>typeof name==='string').map(name=>'<option value="'+esc(name)+'">'+esc(name)+'</option>').join('');
   ['nexHbBonusSkill','nexHbAccessorySkill'].forEach(id=>{$(id).innerHTML='<option value="">Selecione a perícia</option>'+options;});
   $('nex55Skill1').innerHTML='<option value="">Escolha a primeira perícia</option>'+options;
   $('nex55Skill2').innerHTML='<option value="">Escolha a segunda perícia</option>'+options;
 }
 function syncItemCategoryFields(){
   $('nex52ItemFields').querySelectorAll('[data-hb-sync]').forEach(control=>{const hidden=$(control.dataset.hbSync);if(hidden)control.value=hidden.value;});
 }
 function syncParanormalWeaponTier(){
   const cursedWeapon=tab==='paranormal'&&paranormalSection==='itens'&&cursedKind==='Armas Amaldiçoadas'&&$('nex51Type').value==='item';
   $('nex52ItemFields').querySelectorAll('[data-hb-sync="nexHbTier"],#nexHbTier').forEach(select=>{
     const zero=select.querySelector('option[value="0"]');
     if(zero){zero.hidden=cursedWeapon;zero.disabled=cursedWeapon;}
   });
   if(cursedWeapon&&$('nexHbTier').value==='0'){$('nexHbTier').value='I';syncItemCategoryFields();}
 }
 function syncCursedWeaponElement(){
   const isCursedWeapon=tab==='paranormal'&&paranormalSection==='itens'&&cursedKind==='Armas Amaldiçoadas'&&$('nex51Type').value==='item';
   const secondary=$('nexHbWeaponSecondaryType');
   secondary.disabled=isCursedWeapon;
   const normal=[...secondary.options].find(option=>option.value==='Normal');
   if(normal){normal.hidden=isCursedWeapon;normal.disabled=isCursedWeapon;}
   if(isCursedWeapon)secondary.value=$('nexHbElement').value;
 }
 $('nex52ItemFields').addEventListener('input',event=>{const el=event.target.closest('[data-hb-sync]');if(el&&$(el.dataset.hbSync)){$(el.dataset.hbSync).value=el.value;if(el.dataset.hbSync==='nexHbElement')syncCursedWeaponElement();}});
 $('nex52ItemFields').addEventListener('change',event=>{const el=event.target.closest('[data-hb-sync]');if(el&&$(el.dataset.hbSync)){$(el.dataset.hbSync).value=el.value;if(el.dataset.hbSync==='nexHbElement')syncCursedWeaponElement();}});
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
   $('nex52Category').value=tab==='paranormal'?'Itens Amaldiçoados':itemTab;
   $('nexHbCurseElement').value='Sangue';$('nexHbCurseTarget').value='Armas';
   $('nexHbParanormalActivation').value='';$('nexHbParanormalEffect').value='';
   $('nexHbCursedAmmoType').value='Balas curtas';$('nexHbCursedAmmoBonus').value='';
   $('nexHbCursedAccessoryType').value='Anel';$('nexHbCursedAccessoryBenefit').value='';
   $('nexHbAccessoryBonus').value='';$('nexHbAccessorySkill').value='';$('nexHbBonusSkill').value='';
   $('nexHbCursedArtifactRequirement').value='';
   $('nexHbImprovementTarget').value='Armas';
   $('nexHbBonusType').value='ataque';$('nexHbBonusValue').value='+2';
   $('nexHbProtectionDefense').value='1';
   $('nexHbWeaponProficiency').value='Armas Simples';$('nexHbWeaponKind').value='Corpo a Corpo';$('nexHbWeaponWield').value='Uma Mão';
   $('nexHbWeaponDamage').value='';$('nexHbWeaponSecondary').value='';$('nexHbWeaponSecondaryType').value='Normal';
   $('nexHbWeaponCritical').value='20';$('nexHbWeaponMultiplier').value='2';$('nexHbWeaponDamageType').value='Corte';
   $('nexHbWeaponRange').value='';$('nexHbWeaponQuantity').value='1';
   $('nexHbTier').value='0';$('nexHbSpaces').value='1';$('nexHbElement').value='Conhecimento';$('nexHbTag').value='Acessórios';
   $('nexHbImageUrl').value='';$('nexHbImageFile').value='';$('nexHbImagePreview').hidden=true;$('nexHbImagePreview').removeAttribute('src');
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
     $('nexHbCurseElement').value=item.element||'Sangue';$('nexHbCurseTarget').value=item.curseTarget||'Armas';
     $('nexHbParanormalActivation').value=item.paranormalActivation||'';$('nexHbParanormalEffect').value=item.paranormalEffect||'';
     $('nexHbCursedAmmoType').value=item.cursedAmmoType||'Balas curtas';$('nexHbCursedAmmoBonus').value=item.cursedAmmoBonus||'';
     $('nexHbCursedAccessoryType').value=item.cursedAccessoryType||'Anel';$('nexHbCursedAccessoryBenefit').value=item.cursedAccessoryBenefit||'';
     $('nexHbAccessoryBonus').value=item.accessoryBonus?'+'+item.accessoryBonus:'';$('nexHbAccessorySkill').value=item.accessorySkill||'';
     $('nexHbCursedArtifactRequirement').value=item.cursedArtifactRequirement||'';
     $('nexHbImprovementTarget').value=item.improvementTarget||'Armas';
     $('nexHbBonusType').value=item.bonusType||'ataque';$('nexHbBonusValue').value='+'+Math.max(1,Math.min(10,item.bonusValue||2));$('nexHbBonusSkill').value=item.bonusSkill||'';
     customItemImprovements=Array.isArray(item.customImprovements)?[...item.customImprovements]:[];renderItemImprovements();
     $('nexHbProtectionDefense').value=String(item.protectionDefense??1);
     $('nexHbWeaponProficiency').value=item.weaponProficiency||'Armas Simples';
     $('nexHbWeaponKind').value=item.weaponKind||'Corpo a Corpo';
     $('nexHbWeaponWield').value=item.weaponWield||'Uma Mão';
     $('nexHbWeaponDamage').value=item.weaponDamage||'';
     $('nexHbWeaponSecondary').value=item.weaponSecondary||'';
     $('nexHbWeaponSecondaryType').value=item.weaponSecondaryType||'Normal';
     $('nexHbWeaponCritical').value=item.weaponCritical||'20';
     $('nexHbWeaponMultiplier').value=item.weaponMultiplier||'2';
     $('nexHbWeaponDamageType').value=item.weaponDamageType||'Corte';
     $('nexHbWeaponRange').value=item.weaponRange==='—'?'':(item.weaponRange||'');
     $('nexHbWeaponQuantity').value=String(item.weaponQuantity??1);
     $('nexHbTier').value=item.itemTier||'0';$('nexHbSpaces').value=String(item.itemSpaces??1);
     $('nexHbElement').value=['Conhecimento','Energia','Medo','Morte','Sangue'].includes(item.element)?item.element:'Conhecimento';
     $('nexHbTag').value=item.itemTag||'Acessórios';
     syncItemCategoryFields();
     syncCursedWeaponElement();
     syncParanormalWeaponTier();
     $('nexHbImageUrl').value=item.image?.startsWith('https://')?item.image:'';
     $('nexHbImagePreview').hidden=!item.image;if(item.image)$('nexHbImagePreview').src=item.image;
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
   if(item.type==='maldicao')return ['Elemento '+item.element,'Aplicável a '+item.curseTarget];
   if(item.type==='melhoria')return ['Aplicável a '+item.improvementTarget,(BONUS_TYPES.find(([id])=>id===item.bonusType)?.[1]||'Bônus')+': '+(item.bonusValue>=0?'+':'')+item.bonusValue];
   if(item.type==='item')return [item.category,(item.category==='Proteções'?'Defesa '+item.protectionDefense+' · ':item.category==='Armas'?'Dano '+(item.weaponDamage||'—')+' · ':'')+'Categoria '+item.itemTier+' · '+item.itemSpaces+' espaço(s)',item.category==='Itens Amaldiçoados'?item.element:item.category==='Geral'?item.itemTag:''];
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
   const visible=records.filter(x=>types.includes(x.type)&&(tab!=='itens'||canonicalCategory(x.category)===itemTab&&itemTab!=='Itens Amaldiçoados')&&(tab!=='paranormal'||paranormalSection==='maldicoes'||(x.category==='Itens Amaldiçoados'&&x.cursedKind===cursedKind)));
   $('nexHbItemTabs').hidden=tab!=='itens';
   $('nexHbParanormalNav').hidden=tab!=='paranormal';
   $('nexHbCursedKinds').hidden=tab!=='paranormal'||paranormalSection!=='itens';
   mount.querySelectorAll('[data-nex-psection]').forEach(b=>b.classList.toggle('active',b.dataset.nexPsection===paranormalSection));
   mount.querySelectorAll('[data-nex-ckind]').forEach(b=>b.classList.toggle('active',b.dataset.nexCkind===cursedKind));
   mount.querySelectorAll('[data-nex-hb-item-tab="Itens Amaldiçoados"]').forEach(b=>b.hidden=true);
   mount.querySelectorAll('[data-nex-hb-item-tab]').forEach(button=>{const active=tab==='itens'&&button.dataset.nexHbItemTab===itemTab;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active));});
   $('nex53RitualFilter').hidden=tab!=='rituais';
   if(tab==='rituais')$('nex53RitualFilter').innerHTML=['Todas','Dano','Suporte','Cura'].map(t=>'<button type="button" data-ritual-filter="'+t+'" aria-pressed="'+String(t===ritualFilter)+'">'+t+'</button>').join('');
   const query=$('nex51Search').value.trim().toLocaleLowerCase('pt-BR');
   const filtered=visible.filter(x=>(tab!=='rituais'||ritualFilter==='Todas'||x.ritualType===ritualFilter)&&(!query||[x.name,x.description,x.requirements,x.className,x.creatureType,x.category,x.element,x.ritualType,x.improvementTarget].join(' ').toLocaleLowerCase('pt-BR').includes(query)));
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
 function formattedDescription(value){
   return esc(value).replace(/\*\*([^*\n]+)\*\*/g,'<strong class="nex-hb-highlight">$1</strong>')
     .replace(/__([^_\n]+)__/g,'<u>$1</u>')
     .replace(/\*([^*\n]+)\*/g,'<em>$1</em>')
     .replace(/\n/g,'<br>');
 }
 function view(item){
   opened=item.id;const info=meta(item);
   $('nex52DetailBody').innerHTML='<div class="nex52-detail-top"><span>'+esc(LABEL[item.type])+'</span><h3>'+esc(item.name)+'</h3></div>'+
     '<p class="nex52-detail-meta">'+esc(info.join(' · '))+'</p>'+
     (item.description?'<h4>Descrição</h4><p>'+(item.type==='item'?formattedDescription(item.description):esc(item.description))+'</p>':'<p>Sem descrição.</p>')+
     (item.requirements?'<h4>Pré-requisitos</h4><p>'+esc(item.requirements)+'</p>':'')+
     (item.type==='melhoria'?'<h4>Efeito configurado</h4><p>'+esc(BONUS_TYPES.find(([id])=>id===item.bonusType)?.[1]||'Bônus')+': '+esc((item.bonusValue>=0?'+':'')+item.bonusValue)+'</p>':'')+
     (item.type==='origem'?'<h4>Perícias treinadas</h4><p>'+esc((item.skills||[]).join(' e ')||'Não configuradas')+'</p>':'')+
     (item.type==='item'&&item.image?'<img class="nex-hb-preview-detail" src="'+esc(item.image)+'" alt="Imagem de '+esc(item.name)+'">':'')+
     (item.type==='item'&&item.category==='Proteções'?'<h4>Defesa</h4><p>'+esc(item.protectionDefense)+'</p>':'')+
     (item.type==='item'&&item.category==='Armas'?'<h4>Características da arma</h4><p>'+esc([item.weaponProficiency,item.weaponKind,item.weaponWield,'Dano '+item.weaponDamage,'Dano secundário '+(item.weaponSecondary||'—'),'Crítico '+item.weaponCritical+' ×'+item.weaponMultiplier,'Tipo de dano '+item.weaponDamageType,'Alcance '+item.weaponRange,'Quantidade '+item.weaponQuantity].join(' · '))+'</p>':'')+
     (item.type==='item'&&item.category==='Itens Amaldiçoados'?'<h4>Tipo paranormal</h4><p>'+esc(item.cursedKind)+'</p>'+ (item.paranormalEffect?'<p>'+esc(item.paranormalEffect)+'</p>':''):'')+
     (item.type==='item'&&item.category==='Itens Amaldiçoados'&&item.cursedKind==='Munições Amaldiçoadas'?'<p>'+esc(item.cursedAmmoType)+' · '+esc(item.cursedAmmoBonus)+'</p>':'')+
     (item.type==='item'&&item.category==='Itens Amaldiçoados'&&item.cursedKind==='Acessórios Amaldiçoados'?'<p>'+esc(item.cursedAccessoryType)+' · '+esc(item.cursedAccessoryBenefit)+'</p>':'')+
     (item.type==='item'&&item.customImprovements?.length?'<h4>Melhorias</h4><p>'+item.customImprovements.map(esc).join(' · ')+'</p>':'')+ritualDetails(item)+trailDetails(item);
   targetOptions();$('nex52Apply').hidden=(item.type==='melhoria'||item.type==='maldicao');$('nex51Target').closest('label').hidden=item.type==='melhoria'||item.type==='maldicao';const d=$('nex52Detail');if(typeof d.showModal==='function')d.showModal();else d.setAttribute('open','');
 }
 $('nex51Type').addEventListener('change',editorFields);
 $('nexHbBonusType').addEventListener('change',()=>{$('nexHbBonusSkillField').hidden=$('nexHbBonusType').value!=='pericia';});
 ['nexHbBonusValue','nexHbAccessoryBonus'].forEach(id=>$(id).addEventListener('input',e=>{let digits=e.target.value.replace(/\D/g,'').slice(0,2);if(Number(digits)>10)digits='10';e.target.value=digits?'+'+digits:'';}));
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
 $('nexHbDescriptionToolbar').addEventListener('click',e=>{
   const button=e.target.closest('[data-hb-format]');if(!button)return;
   const box=$('nex51Description'),marker=button.dataset.hbFormat,start=box.selectionStart,end=box.selectionEnd;
   const selected=box.value.slice(start,end)||'texto';
   const replacement=marker+selected+marker;
   if(box.value.length+replacement.length-selected.length>2000)return;
   box.setRangeText(replacement,start,end,'select');box.focus();
 });
 $('nexHbImageUrl').addEventListener('input',e=>{
   const url=e.target.value.trim(),image=$('nexHbImagePreview');
   image.hidden=!/^https:\/\//i.test(url);if(!image.hidden)image.src=url;
 });
 $('nexHbImageFile').addEventListener('change',e=>{
   const file=e.target.files?.[0];if(!file)return;
   if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>400000){message('Escolha PNG, JPG ou WebP com até 400 KB.');e.target.value='';return;}
   const reader=new FileReader();
   reader.onload=()=>{const image=$('nexHbImagePreview');image.src=String(reader.result||'');image.hidden=false;$('nexHbImageUrl').value='';};
   reader.readAsDataURL(file);
 });
 $('nex52Add').addEventListener('click',()=>openEditor(null));
 $('nex52CloseEditor').addEventListener('click',closeEditor);
 $('nex52Cancel').addEventListener('click',closeEditor);
 $('nex52Close').addEventListener('click',closeDialog);
 $('nex52Detail').addEventListener('close',()=>{opened=null;});
 $('nex51Search').addEventListener('input',renderLibrary);
 $('nex53RitualFilter').addEventListener('click',e=>{const t=e.target.closest('[data-ritual-filter]');if(!t)return;ritualFilter=t.dataset.ritualFilter;renderLibrary();});
 $('nexHbParanormalNav').addEventListener('click',e=>{
   const section=e.target.closest('[data-nex-psection]'),kind=e.target.closest('[data-nex-ckind]');if(!section&&!kind)return;
   if(section)paranormalSection=section.dataset.nexPsection;
   if(kind)cursedKind=kind.dataset.nexCkind;
   $('nex51Search').value='';closeEditor();renderLibrary();
 });
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
   const count=all.filter(x=>currentTypes().includes(x.type)&&(tab!=='paranormal'||paranormalSection==='maldicoes'||x.category==='Itens Amaldiçoados')).length;
   if(!editing&&count>=50){message('Limite de 50 homebrews para esta categoria.');return;}
   if(type==='trilha'&&TRAIL_NEX.some(n=>!cut($('nex53TrailName'+n).value,90))){message('Informe o nome das quatro habilidades da trilha: 10%, 40%, 65% e 99%.');return;}
   if(type==='melhoria'&&(!BONUS_TYPES.some(([id])=>id===$('nexHbBonusType').value)||!/^\+(?:[1-9]|10)$/.test($('nexHbBonusValue').value))){message('Digite um bônus no formato +1 até +10.');return;}
   if(type==='item'&&tab==='paranormal'&&cursedKind==='Acessórios Amaldiçoados'&&$('nexHbAccessoryBonus').value&&!/^\+(?:[1-9]|10)$/.test($('nexHbAccessoryBonus').value)){message('Digite um bônus no formato +1 até +10.');return;}
   if(type==='melhoria'&&$('nexHbBonusType').value==='pericia'&&!FALLBACK_SKILLS.includes($('nexHbBonusSkill').value)){message('Selecione a perícia beneficiada.');return;}
   if(type==='item'&&tab==='paranormal'&&cursedKind==='Acessórios Amaldiçoados'&&$('nexHbAccessoryBonus').value!==''&&!FALLBACK_SKILLS.includes($('nexHbAccessorySkill').value)){message('Selecione a perícia beneficiada.');return;}
   if(type==='maldicao'&&!cut($('nex51Description').value,2000)){message('Preencha a descrição da maldição.');return;}
   if(type==='melhoria'&&!cut($('nex51Description').value,2000)){message('Preencha a descrição da melhoria.');return;}
   if(type==='item'&&(tab==='paranormal'?cursedKind==='Armas Amaldiçoadas':itemTab==='Armas')&&(!$('nexHbWeaponDamage').value.trim()||!/^([1-9]|1\d|20)(?:[-–]20)?$/.test($('nexHbWeaponCritical').value.trim())||!/^\d+$/.test($('nexHbWeaponMultiplier').value.trim())||Number($('nexHbWeaponMultiplier').value)<1)){message('Confira dano, crítico e multiplicador da arma.');return;}
   if(type==='item'&&(tab==='paranormal'?cursedKind==='Proteções Amaldiçoadas':itemTab==='Proteções')&&(!/^\d+$/.test($('nexHbProtectionDefense').value)||Number($('nexHbProtectionDefense').value)>100)){message('Informe defesa válida entre 0 e 100.');return;}
   if(type==='item'&&!cut($('nex51Description').value,2000)){message('Preencha a descrição do item.');return;}
   if(type==='item'&&tab==='paranormal'&&cursedKind==='Armas Amaldiçoadas'&&$('nexHbTier').value==='0'){message('Escolha uma categoria entre I e IV.');return;}
   if(type==='item'&&(!['0','I','II','III','IV'].includes($('nexHbTier').value)||!/^\d+$/.test($('nexHbSpaces').value)||Number($('nexHbSpaces').value)>100)){message('Categoria ou espaços inválidos.');return;}
   if(type==='poder_paranormal' && !cut($('nex51Description').value,2000)){message('Preencha a descrição do poder paranormal.');return;}
   if(type==='ritual'&&$('nex53RitualType').value==='Dano'&&(Number($('nex53DiscenteCircle').value)<Number($('nex51Circle').value)||Number($('nex53VerdadeiroCircle').value)<Number($('nex53DiscenteCircle').value))){message('O círculo Discente deve ser igual ou superior ao básico; o Verdadeiro não pode ser menor que o Discente.');return;}
   if(type==='origem'){
     const first=$('nex55Skill1').value,second=$('nex55Skill2').value,available=api()?.skillNames?.()||FALLBACK_SKILLS;
     if(!first||!second||first===second||!available.includes(first)||!available.includes(second)){
       message('Escolha duas perícias diferentes para a origem.');return;
     }
   }
   if(!editing&&all.length>=300){message('Limite total da biblioteca atingido.');return;}
   if(type==='item')$('nex52Category').value=tab==='paranormal'?'Itens Amaldiçoados':itemTab;
   const record=normalize({
     id:editing||'hb51_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,9),
     type,name,description:$('nex51Description').value,requirements:$('nex51Requirements').value,
     className:$('nex51Class').value,minNex:['trilha','origem','poder_geral','poder','habilidade'].includes(type)?(old?.minNex??(type==='trilha'?10:5)):$('nex51Nex').value,circle:$('nex51Circle').value,
     element:type==='maldicao'?$('nexHbCurseElement').value:type==='item'&&tab==='paranormal'?$('nexHbElement').value:type==='poder_paranormal'?$('nex53ParanormalElement').value:$('nex51Element').value,cost:$('nex51Cost').value,vd:$('nex52VD').value,
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
     image:type==='item'?($('nexHbImageUrl').value.trim()||(!$('nexHbImagePreview').hidden?$('nexHbImagePreview').src:'')||old?.image||''):type==='ritual'?($('nex53RitualFile').files.length?(! $('nex53RitualPreview').hidden ?$('nex53RitualPreview').src:''):($('nex53RitualImage').value||(! $('nex53RitualPreview').hidden?$('nex53RitualPreview').src:''))):(old?.image||''),
     size:$('nex52Size').value,creatureType:$('nex52CreatureType').value,category:$('nex52Category').value,
     cursedKind:type==='item'&&tab==='paranormal'?cursedKind:(old?.cursedKind||'Itens Paranormais'),
     paranormalActivation:type==='item'&&tab==='paranormal'?$('nexHbParanormalActivation').value:(old?.paranormalActivation||''),
     paranormalEffect:type==='item'&&tab==='paranormal'?$('nexHbParanormalEffect').value:(old?.paranormalEffect||''),
     cursedAmmoType:type==='item'&&tab==='paranormal'?$('nexHbCursedAmmoType').value:(old?.cursedAmmoType||'Balas curtas'),
     cursedAmmoBonus:type==='item'&&tab==='paranormal'?$('nexHbCursedAmmoBonus').value:(old?.cursedAmmoBonus||''),
     cursedAccessoryType:type==='item'&&tab==='paranormal'?$('nexHbCursedAccessoryType').value:(old?.cursedAccessoryType||'Anel'),
     cursedAccessoryBenefit:type==='item'&&tab==='paranormal'?$('nexHbCursedAccessoryBenefit').value:(old?.cursedAccessoryBenefit||''),
     accessoryBonus:type==='item'&&tab==='paranormal'?Number($('nexHbAccessoryBonus').value.slice(1)):(old?.accessoryBonus??0),
     accessorySkill:type==='item'&&tab==='paranormal'?$('nexHbAccessorySkill').value:(old?.accessorySkill||''),
     cursedArtifactRequirement:type==='item'&&tab==='paranormal'?$('nexHbCursedArtifactRequirement').value:(old?.cursedArtifactRequirement||''),
     curseTarget:type==='maldicao'?$('nexHbCurseTarget').value:(old?.curseTarget||'Armas'),
     improvementTarget:type==='melhoria'?$('nexHbImprovementTarget').value:(old?.improvementTarget||'Armas'),
     bonusType:type==='melhoria'?$('nexHbBonusType').value:(old?.bonusType||'ataque'),
     bonusValue:type==='melhoria'?Number($('nexHbBonusValue').value.slice(1)):(old?.bonusValue??0),
     bonusSkill:type==='melhoria'&&$('nexHbBonusType').value==='pericia'?$('nexHbBonusSkill').value:(old?.bonusSkill||''),
     protectionDefense:type==='item'&&(tab==='paranormal'&&cursedKind==='Proteções Amaldiçoadas'||itemTab==='Proteções'&&tab!=='paranormal')?Number($('nexHbProtectionDefense').value):(old?.protectionDefense??1),
     weaponProficiency:type==='item'&&(tab==='paranormal'&&cursedKind==='Armas Amaldiçoadas'||itemTab==='Armas'&&tab!=='paranormal')?$('nexHbWeaponProficiency').value:(old?.weaponProficiency||'Armas Simples'),
     weaponKind:type==='item'&&(tab==='paranormal'&&cursedKind==='Armas Amaldiçoadas'||itemTab==='Armas'&&tab!=='paranormal')?$('nexHbWeaponKind').value:(old?.weaponKind||'Corpo a Corpo'),
     weaponWield:type==='item'&&(tab==='paranormal'&&cursedKind==='Armas Amaldiçoadas'||itemTab==='Armas'&&tab!=='paranormal')?$('nexHbWeaponWield').value:(old?.weaponWield||'Uma Mão'),
     weaponDamage:type==='item'&&(tab==='paranormal'&&cursedKind==='Armas Amaldiçoadas'||itemTab==='Armas'&&tab!=='paranormal')?$('nexHbWeaponDamage').value:(old?.weaponDamage||''),
     weaponSecondary:type==='item'&&(tab==='paranormal'&&cursedKind==='Armas Amaldiçoadas'||itemTab==='Armas'&&tab!=='paranormal')?$('nexHbWeaponSecondary').value:(old?.weaponSecondary||''),
     weaponSecondaryType:type==='item'&&tab==='paranormal'&&cursedKind==='Armas Amaldiçoadas'?$('nexHbElement').value:type==='item'&&itemTab==='Armas'&&tab!=='paranormal'?$('nexHbWeaponSecondaryType').value:(old?.weaponSecondaryType||'Normal'),
     weaponCritical:type==='item'&&(tab==='paranormal'&&cursedKind==='Armas Amaldiçoadas'||itemTab==='Armas'&&tab!=='paranormal')?$('nexHbWeaponCritical').value:(old?.weaponCritical||'20'),
     weaponMultiplier:type==='item'&&(tab==='paranormal'&&cursedKind==='Armas Amaldiçoadas'||itemTab==='Armas'&&tab!=='paranormal')?$('nexHbWeaponMultiplier').value:(old?.weaponMultiplier||'2'),
     weaponDamageType:type==='item'&&(tab==='paranormal'&&cursedKind==='Armas Amaldiçoadas'||itemTab==='Armas'&&tab!=='paranormal')?$('nexHbWeaponDamageType').value:(old?.weaponDamageType||'Corte'),
     weaponRange:type==='item'&&(tab==='paranormal'&&cursedKind==='Armas Amaldiçoadas'||itemTab==='Armas'&&tab!=='paranormal')?$('nexHbWeaponRange').value:(old?.weaponRange||'—'),
     weaponQuantity:type==='item'&&(tab==='paranormal'&&cursedKind==='Armas Amaldiçoadas'||itemTab==='Armas'&&tab!=='paranormal')?$('nexHbWeaponQuantity').value:(old?.weaponQuantity??1),
     itemTier:type==='item'?$('nexHbTier').value:(old?.itemTier||'0'),
     itemSpaces:type==='item'?$('nexHbSpaces').value:(old?.itemSpaces??1),
     itemTag:type==='item'&&itemTab==='Geral'?$('nexHbTag').value:(old?.itemTag||'Acessórios'),
     customImprovements:type==='item'?customItemImprovements:(old?.customImprovements||[]),
     trailAbilities:type==='trilha'?TRAIL_NEX.map(n=>({nex:n,name:$('nex53TrailName'+n).value,description:$('nex53TrailDescription'+n).value})):(old?.trailAbilities||[]),
     skills:type==='origem'?[$('nex55Skill1').value,$('nex55Skill2').value]:(old?.skills||[])
   });
   const group=record.type==='maldicao'||record.type==='item'&&record.category==='Itens Amaldiçoados'?'paranormal':Object.keys(TABS).find(key=>TABS[key].includes(record.type))||tab;
   if(!editing&&group!==tab){message('Selecione a categoria correta antes de salvar.');return;}
   try{
     write(editing?all.map(x=>x.id===editing?record:x):[record,...all]);
     tab=group;
     if(group==='paranormal'){paranormalSection=record.type==='maldicao'?'maldicoes':'itens';cursedKind=record.cursedKind||'Itens Paranormais';}
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
   if(btn.dataset.nex52Edit){if(item.type==='maldicao'){tab='paranormal';paranormalSection='maldicoes';}else if(item.type==='item'&&item.category==='Itens Amaldiçoados'){tab='paranormal';paranormalSection='itens';cursedKind=item.cursedKind||'Itens Paranormais';}else if(item.type==='item')itemTab=canonicalCategory(item.category);openEditor(item);return;}
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