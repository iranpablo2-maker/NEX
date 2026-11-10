/* NEX: detalhes dos itens e editor visual. Mantém os dados originais de inventário. */
(function(){
'use strict';
const by=id=>document.getElementById(id);
const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const cats=['Arma','Munição','Proteção','Geral','Item Amaldiçoado'];
const sec={'Arma':'Armas','Munição':'Munições','Proteção':'Proteções','Geral':'Geral','Item Amaldiçoado':'Itens Amaldiçoados'};
const models=[...(window.NEX_ITEM_CATALOG?.items||[]),...(window.NEX_BASE_WEAPONS||[]),...(window.NEX_ITEM_BOOKS||[]),...(window.NEX_ITEM_COMPLEMENTS?.items||[]),...(window.NEX_ITEM_VARIANTS||[]),...(window.NEX_MISSING_EQUIPMENT||[]),...(window.NEX_BASE_CURSED||[])];
const find=id=>(state.items||[]).find(it=>String(it.id)===String(id));
const number=(x,def=0)=>Number.isFinite(Number(x))?Number(x):def;
const lookup=item=>models.find(x=>norm(x.name)===norm(item.name)&&x.section===sec[item.category])||models.find(x=>norm(x.name)===norm(item.name));
const stat=(obj,name)=>(obj?.stats||[]).find(r=>norm(r[0])===norm(name))?.[1]||'';
function detail(item){
 const model=lookup(item)||{},pairs={};
 for(const fragment of String(item.detail||'').split(/\s*·\s*/)){
  const match=fragment.trim().match(/^([^:]+):\s*(.+)$/);
  if(match)pairs[norm(match[1])]=match[2].trim();
 }
 const getStat=(...labels)=>labels.map(label=>
  String(stat(model,label)||'').trim()).find(Boolean)||'';
 const rawCrit=String(pairs['critico']||getStat('Crítico')||'').replace(/\s/g,'');
 const fromCrit=rawCrit.match(/^(\d{2})(?:[/x×](?:[x×])?(\d+))?$/i);
 const critNumber=rawCrit.match(/^(\d{2})/);
 const critMulti=rawCrit.match(/[x×](\d+)/i);
 const weaponSources=[
  ...(window.NEX_BASE_WEAPONS||[]),
  ...(window.NEX_ITEM_CATALOG?.items||[]),
  ...(window.NEX_ITEM_BOOKS||[]),
  ...(window.NEX_ITEM_COMPLEMENTS?.items||[]),
  model
 ].filter(x=>x&&norm(x.name)===norm(item.name) && (x.section==='Armas'||item.category==='Arma'));
 const metadata=weaponSources.map(x=>String(x.subtitle||'').trim())
  .find(x=>/^\s*(?:Arma\s+)?(?:simples|t[aá]tica|pesada)\s*·\s*[^·]+\s*·\s*[^·]+/i.test(x))
  ||weaponSources.map(x=>String(x.description||'').trim())
  .find(x=>/^\s*Arma\s+(?:simples|t[aá]tica|pesada)\s*·\s*[^·]+\s*·\s*[^·]+/i.test(x))
  ||model.subtitle||'';
 const sub=String(metadata).split('·').map(x=>x.trim());
 const proficiency=(function(){
  const value=norm(sub[0]||'');
  if(/(?:^|\s)(?:tatica|taticas)(?:$|\s)/.test(value))return 'Armas Táticas';
  if(/(?:^|\s)(?:simples)(?:$|\s)/.test(value))return 'Armas Simples';
  if(/(?:^|\s)(?:pesada|pesadas)(?:$|\s)/.test(value))return 'Armas Pesadas';
  return String(sub[0]||'').trim();
 })();
 const isWeapon=(item.category==='Arma'||sec[item.category]==='Armas');
 const unavailable=isWeapon?'Não informado':'—';
 const fallback={
  name:item.name||model.name||'',
  category:cats.includes(item.category)?item.category:(model.section==='Armas'?'Arma':'Geral'),
  quantity:number(item.quantity,1),
  spaces:Number.isFinite(Number(item.spaces))?Number(item.spaces):number(model.spaces,1),
  proficiency:proficiency||unavailable,
  kind:sub[1]||unavailable,
  wield:sub[2]||unavailable,
  damage:pairs.dano||getStat('Dano')||unavailable,
  secondary:'—',
  critical:critNumber?.[1]||'20',
  multiplier:critMulti?.[1]||'2',
  damageType:pairs['tipo de dano']||pairs.tipo||getStat('Tipo de dano','Tipo')||unavailable,
  range:pairs.alcance||getStat('Alcance')||'—',
  tier:pairs.categoria||getStat('Categoria')||'Não informado',
  upgrades:'',
  image:'',
  description:(()=>{
   const existing=String(item.description||'').trim();
   if(existing && !/detalhes a conferir|consulte (o livro|as regras|os valores|o mestre)|equipamento listado na tabela|estatísticas de jogo conforme|dados de jogo da tabela|munição listada na tabela|item amaldiçoado listado na tabela|é um equipamento geral de|é um artefato paranormal/i.test(existing))return existing;
   const replacement=model.name?window.NEX_ITEM_DESCRIBE?.(model):'';
   if(replacement)return replacement;
   const saved=String(item.detail||'').split(/\s*·\s*/)[0].trim();
   const auto=/^(?:Estatísticas de jogo conforme|Dados de jogo da tabela|Equipamento listado na tabela|Item amaldiçoado listado na tabela|Detalhes a conferir|Arma [·:]|Equipamento [·:]|Proteção [·:])/i;
   return saved && !auto.test(saved) && !/^(?:dano|categoria|crítico|espaços|tipo|alcance)\s*:/i.test(saved)
      ?saved:(model.description||saved||'Descrição não cadastrada.');
  })()
 };
 const saved=item.nexInfo&&typeof item.nexInfo==='object'?item.nexInfo:{};
 const merged={...fallback};
 for(const [key,value] of Object.entries(saved)){
  // Campos vazios salvos em fichas antigas não podem apagar os dados do catálogo.
  if(value===null || value===undefined || (typeof value==='string' && !value.trim()))continue;
  if(['proficiency','kind','wield'].includes(key)
    && /^(?:n[aã]o informado|n[aã]o cadastrad[oa]|—|-)$/i.test(String(value).trim())
    && fallback[key] && !/^(?:n[aã]o informado|—|-)$/i.test(String(fallback[key]).trim()))continue;
  merged[key]=value;
 }
 // Caso a ficha seja antiga, preenche com os metadados disponíveis sem
 // sobrescrever alterações feitas pelo jogador.
 for(const key of ['proficiency','kind','wield','damage','secondary','critical','multiplier','damageType','range','tier','description']){
  if(merged[key]===null || merged[key]===undefined || String(merged[key]).trim()==='')merged[key]=fallback[key];
 }
 return merged;
}
const style=document.createElement('style');style.id='nex-item-details-style';
style.textContent=[
'#sheetScreen .nex-item-card-new{background:#1e1d20;border:1px solid #3e3031;border-radius:5px;margin:7px 0;overflow:hidden;color:#fff}',
'#sheetScreen .nex-item-card-new>summary{cursor:pointer;list-style:none;padding:12px 10px;display:flex;align-items:center;gap:13px}',
'#sheetScreen .nex-item-card-new>summary::-webkit-details-marker{display:none}',
'#sheetScreen .nex-item-chevron{color:#fa3a4a;font-size:23px;flex:none}',
'#sheetScreen .nex-item-card-new[open] .nex-item-chevron{transform:rotate(180deg)}',
'#sheetScreen .nex-item-main{min-width:0;flex:1}',
'#sheetScreen .nex-item-main strong{display:block;font-size:15px}',
'#sheetScreen .nex-item-short{display:flex;gap:12px;flex-wrap:wrap;color:#f64453;font-size:12px;margin-top:4px}',
'#sheetScreen .nex-item-short b{color:#fff}',
'#sheetScreen .nex-item-card-body{padding:12px;border-top:1px solid #ca323f}',
'#sheetScreen .nex-item-subtitle{font-size:11px;font-weight:700;font-style:italic;color:#edd9db}',
'#sheetScreen .nex-item-card-stats{color:#ff3c4c;font-size:12px;line-height:1.8;margin-top:5px}',
'#sheetScreen .nex-item-card-stats b{color:#fff}',
'#sheetScreen .nex-item-card-description{color:#fff;font-size:13px;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.6;margin:12px 0}',
'#sheetScreen .nex-item-card-image{width:auto;max-width:100%;max-height:190px;object-fit:contain}',
'#sheetScreen .nex-item-card-buttons{display:flex;justify-content:space-between;gap:10px}',
'#sheetScreen .nex-item-card-buttons button{border:0;background:transparent;font-size:12px;padding:8px}',
'#sheetScreen .nex-item-remove{color:#f05562!important}',
'#sheetScreen .nex-item-edit{color:#49b96b!important}',
'#sheetScreen .nex-item-card-new{background:#1c1c1e!important;border:1px solid #303035!important;border-radius:5px!important;margin:8px 0!important;box-shadow:none!important}',
'#sheetScreen .nex-item-card-new{position:relative!important}',
'#sheetScreen .nex-item-card-new>summary{padding-right:56px!important}',
'#sheetScreen .nex-combat-weapon{position:relative;border-bottom:1px solid #8c2d3b;padding:13px 8px;background:#1b191d;color:#fff;display:flex;align-items:center;gap:12px;min-width:0}',
'#sheetScreen .nex-combat-weapon-main{flex:1;min-width:0}',
'#sheetScreen .nex-combat-weapon-name{font-size:14px;font-weight:800;line-height:1.5;display:block}',
'#sheetScreen .nex-combat-weapon-summary{font-size:12px;color:#da4b5b;margin-top:2px;line-height:1.5}',
'#sheetScreen .nex-combat-weapon-details{padding:11px 9px 12px;background:#171519;font-size:12px;line-height:1.85;color:#e6dfe3}',
'#sheetScreen .nex-combat-weapon-details b{color:#fff}',
'#sheetScreen .nex-combat-weapon-details .nex-combat-stat-label{color:#dd4b58}',
'#sheetScreen .nex-combat-die-button{border:0!important;background:transparent!important;padding:7px!important;cursor:pointer!important;flex:none;color:#f1eded!important;display:grid!important;place-items:center!important;border-radius:5px!important}',
'#sheetScreen .nex-combat-die-button:hover{color:#e34a58!important;background:#3a2027!important}',
'#sheetScreen .nex-combat-die-button svg{width:31px;height:31px;display:block;stroke:currentColor;fill:none;stroke-width:1.35}',
'#nexWeaponRollPopup[hidden]{display:none!important}',
'#nexWeaponRollPopup{position:fixed;z-index:110010;width:min(310px,calc(100vw - 20px));background:#211e22;color:#fff;border:1px solid #ae3444;border-radius:4px;box-shadow:0 14px 50px #000c;padding:13px 12px;box-sizing:border-box}',
'#nexWeaponRollPopup .nex-weapon-roll-head{display:flex;gap:9px;align-items:center;justify-content:space-between;font-size:17px;font-weight:800;padding-bottom:12px}',
'#nexWeaponRollPopup .nex-weapon-roll-head button{background:transparent;border:0;color:#fff;font-size:22px;cursor:pointer;line-height:1}',
'#nexWeaponRollPopup .nex-weapon-roll-stats{display:grid;grid-template-columns:46px 1fr 1fr;align-items:center;gap:8px}',
'#nexWeaponRollPopup .nex-weapon-roll-hex{width:42px;height:42px;background:#ae253c;clip-path:polygon(50% 0,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)}',
'#nexWeaponRollPopup .nex-weapon-roll-column{text-align:center;min-width:0;border-right:1px solid #777}',
'#nexWeaponRollPopup .nex-weapon-roll-column:last-child{border-right:0}',
'#nexWeaponRollPopup .nex-weapon-roll-value{font-size:31px;font-weight:900;line-height:1.25;color:#fff}',
'#nexWeaponRollPopup .nex-weapon-roll-label{font-size:11px;color:#bbb2b7;font-weight:800;text-transform:uppercase}',
'#nexWeaponRollPopup .nex-weapon-roll-detail{margin-top:11px;font-size:11px;color:#d3b8be;line-height:1.5;overflow-wrap:anywhere}',

'#sheetScreen .nex-item-card-new>summary{padding:11px 12px!important;gap:13px!important;min-height:62px!important}',
'#sheetScreen .nex-item-card-new[open]>summary{border-bottom:1px solid #9c3440!important}',
'#sheetScreen .nex-item-chevron{font-size:19px!important;color:#d03a4a!important;transition:transform .18s ease!important}',
'#sheetScreen .nex-item-card-new[open] .nex-item-chevron{transform:rotate(180deg)!important}',
'#sheetScreen .nex-item-main strong{font-size:14px!important;font-weight:750!important;line-height:1.4}',
'#sheetScreen .nex-item-short{font-size:12px!important;gap:14px!important;margin-top:4px!important;color:#e64f5d!important}',
'#sheetScreen .nex-item-short b{color:#f7f7fa!important}',
'#sheetScreen .nex-item-card-body{padding:14px 10px 9px!important;border-top:0!important}',
'#sheetScreen .nex-item-subtitle{font-size:11px!important;color:#f1f1f5!important;font-weight:700!important;margin-bottom:8px!important}',
'#sheetScreen .nex-item-card-stats{font-size:12px!important;color:#da4351!important;line-height:1.9!important}',
'#sheetScreen .nex-item-card-stats b{font-weight:700!important;color:#fff!important}',
'#sheetScreen .nex-item-card-description{font-size:13px!important;margin:16px 0 10px!important;line-height:1.6!important}',
'#sheetScreen .nex-item-card-buttons{margin-top:6px!important;padding-top:4px!important;align-items:center!important}',
'#sheetScreen .nex-item-card-buttons button{font-size:12px!important;border:0!important;background:transparent!important;min-height:32px!important}',
'#sheetScreen .nex-item-equipped-label{position:absolute;right:11px;top:15px;display:flex;align-items:center;justify-content:center;width:34px;height:34px;cursor:pointer;z-index:3}',
'#sheetScreen .nex-item-equipped-label input{appearance:none;-webkit-appearance:none;width:31px!important;height:31px!important;min-width:31px!important;margin:0!important;border:1px solid #ddd!important;border-radius:4px!important;background:#19191c!important;cursor:pointer;display:grid;place-items:center}',
'#sheetScreen .nex-item-equipped-label input:checked{background:#a72c39!important;border-color:#d74d59!important}',
'#sheetScreen .nex-item-equipped-label input:checked::after{content:"✓";font-size:19px;font-weight:800;color:#fff}',
'#sheetScreen .nex-item-equipped-label input:focus-visible{outline:2px solid #dc525c!important;outline-offset:3px}',
'#sheetScreen .nex-item-remove{color:#f25d66!important}',
'#sheetScreen .nex-item-edit{color:#4fc779!important}',

'#nexItemEditor[hidden]{display:none!important}',
'#nexItemEditor{position:fixed;inset:0;z-index:100050;display:grid;place-items:center;background:#000c;padding:10px;color:white}',
'#nexItemEditor *{box-sizing:border-box}',
'#nexItemEditor .nex-editor-dialog{width:min(940px,100%);height:min(680px,calc(100dvh - 20px));background:#202021;display:flex;flex-direction:column;border-radius:4px;overflow:hidden}',
'#nexItemEditor .nex-editor-head{display:flex;justify-content:space-between;align-items:center;padding:17px 18px;flex:none}',
'#nexItemEditor h2{font-size:24px;color:white;margin:0;text-transform:none}',
'#nexItemEditor .nex-editor-close{background:transparent;border:0;font-size:28px;color:white}',
'#nexItemEditor #nexEditorForm{padding:12px 18px;flex:1;overflow-y:auto;min-height:0}',
'#nexItemEditor .nex-editor-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}',
'#nexItemEditor .nex-editor-weapon-grid{row-gap:14px}',
'#nexItemEditor .nex-editor-field{display:flex;flex-direction:column;gap:6px;font-size:13px;color:white}',
'#nexItemEditor .nex-editor-field input,#nexItemEditor .nex-editor-field textarea,#nexItemEditor .nex-editor-field select{background:#111;color:white;border:1px solid #484049;padding:9px;min-width:0;width:100%;font:inherit;border-radius:3px}',
'#nexItemEditor textarea{min-height:110px;resize:vertical;line-height:1.6}',
'#nexItemEditor .span-2{grid-column:span 2}',
'#nexItemEditor .span-4{grid-column:1/-1}',
'#nexItemEditor h3{font-size:15px;padding-top:15px;border-top:1px solid #484049;color:#e5cacc;margin:18px 0 12px}',
'#nexItemEditor .nex-editor-inline{display:flex;gap:8px;align-items:center;margin-bottom:8px}',
'#nexItemEditor .nex-editor-inline input{flex:1;min-width:0;background:#111;border:1px solid #484049;color:#fff;padding:8px}',
'#nexItemEditor .nex-editor-inline button{border:0;background:#e03a48;color:white;border-radius:3px;padding:8px 12px}',
'#nexItemEditor .nex-editor-upgrade-list{display:flex;gap:7px;flex-wrap:wrap;min-height:5px;margin-bottom:8px}',
'#nexItemEditor .nex-editor-upgrade{background:#3d2224;border:1px solid #853f45;padding:5px 7px;border-radius:4px;color:#fff;font-size:12px}',
'#nexItemEditor .nex-editor-upgrade button{border:0;background:transparent;color:#f5a0a7;margin-left:5px}',
'#nexItemEditor .nex-editor-rich{display:flex;gap:4px;margin-bottom:8px}',
'#nexItemEditor .nex-editor-rich button{border:1px solid #534445;background:transparent;color:white;min-width:35px;padding:5px}',
'#nexItemEditor .nex-editor-buttons{padding:12px 18px;display:flex;gap:14px;justify-content:flex-end;border-top:1px solid #484049;flex:none}',
'#nexItemEditor .nex-editor-buttons button{padding:10px 18px;border:0;border-radius:3px}',
'#nexItemEditor .nex-editor-save{background:#e53b49;color:white;font-weight:700}',
'#nexItemEditor .nex-editor-cancel{background:transparent;color:white}',
'body.nex-editor-open{overflow:hidden}',
'@media(max-width:620px){#nexItemEditor{padding:3px}#nexItemEditor .nex-editor-dialog{height:calc(100dvh - 6px)}#nexItemEditor .nex-editor-grid{grid-template-columns:repeat(2,minmax(0,1fr))}#nexItemEditor .span-4{grid-column:1/-1}}'
].join('\n');
document.head.appendChild(style);
const modal=document.createElement('div');modal.id='nexItemEditor';modal.hidden=true;
modal.innerHTML='<section class="nex-editor-dialog" role="dialog" aria-modal="true" aria-labelledby="nexEditorTitle">'+
'<header class="nex-editor-head"><h2 id="nexEditorTitle">Editar item</h2><button class="nex-editor-close" type="button" aria-label="Fechar">×</button></header>'+
'<form id="nexEditorForm"><div id="nexEditorFields"></div></form>'+
'<footer class="nex-editor-buttons"><button class="nex-editor-cancel" type="button">Cancelar</button><button type="submit" form="nexEditorForm" class="nex-editor-save">Salvar alterações</button></footer></section>';
document.body.appendChild(modal);
function field(key,label,value,type='text',span=1){
 const attrs=type==='number'?'step="any"':'maxlength="2500"';
 const control=type==='textarea'?'<textarea data-edit="'+safe(key)+'" maxlength="2500">'+safe(value)+'</textarea>':
 '<input type="'+safe(type)+'" '+attrs+' data-edit="'+safe(key)+'" value="'+safe(value)+'">';
 return '<label class="nex-editor-field span-'+span+'"><span>'+safe(label)+'</span>'+control+'</label>';
}
function select(key,label,value,opts){
 return '<label class="nex-editor-field"><span>'+safe(label)+'</span><select data-edit="'+safe(key)+'">'+opts.map(x=>'<option value="'+safe(x)+'"'+(x===value?' selected':'')+'>'+safe(x)+'</option>').join('')+'</select></label>';
}
let current=null,lastFocus=null;
function editorFields(d){
 let html;
 if(d.category==='Arma'){
  // Mesma ordem da janela de edição de armas: os campos de combate vêm antes das melhorias.
  // A categoria de inventário fica preservada sem ocupar espaço na interface.
  html='<input type="hidden" data-edit="category" value="Arma"><div class="nex-editor-grid nex-editor-weapon-grid">'+
   field('name','Nome*',d.name,'text',4)+
   field('proficiency','Proficiência',d.proficiency)+field('kind','Tipo',d.kind)+
   field('wield','Empunhadura',d.wield,'text',2)+
   field('damage','Dano*',d.damage)+field('secondary','Dano secundário',d.secondary)+
   field('critical','Crítico*',d.critical)+field('multiplier','Multiplicador*',d.multiplier)+
   field('damageType','Tipo de Dano',d.damageType,'text',2)+field('range','Alcance',d.range,'text',2)+
   field('tier','Categoria',d.tier)+field('spaces','Espaços*',d.spaces,'number')+
   field('quantity','Quantidade',d.quantity,'number')+'</div>';
 }else{
  html='<div class="nex-editor-grid">'+field('name','Nome*',d.name,'text',2)+
   select('category','Tipo de item',d.category,cats)+field('quantity','Quantidade',d.quantity,'number')+
   field('tier','Categoria',d.tier)+field('spaces','Espaços*',d.spaces,'number')+'</div>';
 }
 html+='<h3>Melhorias</h3><div class="nex-editor-inline"><input id="nexEditorNewUpgrade" placeholder="Nome da melhoria"><button type="button" data-nex-add-upgrade>Adicionar</button></div>'+
 '<input type="hidden" data-edit="upgrades" value="'+safe(d.upgrades)+'"><div id="nexEditorUpgradeList" class="nex-editor-upgrade-list" aria-live="polite"></div>'+
 '<h3>Descrição</h3><div class="nex-editor-rich"><button type="button" data-nex-rich="**"><b>B</b></button><button type="button" data-nex-rich="*"><i>I</i></button><button type="button" data-nex-rich="__"><u>U</u></button></div>'+field('description','Descrição do item (negrito roxo)',d.description,'textarea',4);
 return html;
}
function showUpgrades(){
 const value=by('nexEditorFields').querySelector('[data-edit="upgrades"]')?.value||'';
 const target=by('nexEditorUpgradeList');
 if(!target)return;
 target.innerHTML=value.split(/\n/).map(x=>x.trim()).filter(Boolean).map((x,i)=>'<span class="nex-editor-upgrade">'+safe(x)+' <button type="button" data-nex-remove-upgrade="'+i+'" aria-label="Remover '+safe(x)+'">×</button></span>').join('');
}
function open(id){
 const item=find(id);if(!item)return;
 current=String(id);lastFocus=document.activeElement;
 by('nexEditorTitle').textContent='Editar';
 by('nexEditorFields').innerHTML=editorFields(detail(item));
 showUpgrades();
 modal.hidden=false;document.body.classList.add('nex-editor-open');
 by('nexEditorFields').querySelector('[data-edit="name"]')?.focus();
}
function close(){
 modal.hidden=true;current=null;document.body.classList.remove('nex-editor-open');
 lastFocus?.focus?.();
}
function descriptionText(s){
 return safe(s).replace(/\*\*(.+?)\*\*/gs,'<strong style="color:#ec3e4c">$1</strong>').replace(/__(.+?)__/gs,'<u>$1</u>').replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g,'<em>$1</em>');
}
function card(item,expanded=false){
 const d=detail(item),weapon=d.category==='Arma',id=safe(item.id);
 const critical=String(d.critical||'').trim(),multi=String(d.multiplier||'').trim();
 const critText=critical+(multi?' ×'+multi:'');
 const quick=weapon?[['Dano',d.damage||'—'],['Crítico',critText||'—']]:[['Categoria',d.tier||'—'],['Espaços',d.spaces]];
 const subtitle=weapon?[d.proficiency,d.kind,d.wield].filter(Boolean).join(' - '):(d.category==='Item Amaldiçoado'?'Item Amaldiçoado':d.category);
 const stats=weapon?[
  ['Categoria',d.tier],['Tipo',d.damageType],['Espaços',d.spaces],
  ['Alcance',d.range==='—'?'':d.range],['Dano secundário',d.secondary],
  ...(Number(d.quantity)>1?[['Quantidade',d.quantity]]:[])
 ]:[
  ['Categoria',d.tier],['Tipo',d.category],['Espaços',d.spaces],
  ...(Number(d.quantity)>1?[['Quantidade',d.quantity]]:[])
 ];
 const img=/^https:\/\//i.test(d.image)?'<img loading="lazy" class="nex-item-card-image" src="'+safe(d.image)+'" alt="Imagem de '+safe(d.name)+'">':'';
 return '<details class="nex-item-card-new" data-item-id="'+id+'"'+(expanded?' open':'')+'>'+
 '<summary><span class="nex-item-chevron" aria-hidden="true">⌄</span>'+
 '<span class="nex-item-main"><strong>'+safe(d.name||'Item')+'</strong>'+
 '<span class="nex-item-short">'+quick.filter(x=>x[1]!==undefined&&x[1]!==null&&String(x[1])!=='').map(x=>'<span>'+safe(x[0])+': <b>'+safe(x[1])+'</b></span>').join('')+'</span></span>'+
 '</summary>'+(weapon?'<label class="nex-item-equipped-label" title="Equipar arma" aria-label="Equipar arma: '+safe(d.name)+'"><input type="checkbox" data-nex-item-equipped="'+id+'" aria-label="Equipar '+safe(d.name)+'" '+(item.equipped?'checked':'')+'></label>':'')+
 '<div class="nex-item-card-body"><div class="nex-item-subtitle">'+safe(subtitle)+'</div>'+
 '<div class="nex-item-card-stats">'+stats.filter(x=>x[1]!==undefined&&x[1]!==null&&String(x[1]).trim()!=='').map(x=>'<div>'+safe(x[0])+': <b>'+safe(x[1])+'</b></div>').join('')+'</div>'+
 (d.upgrades?'<div class="nex-item-card-description"><b>Melhorias:</b> '+descriptionText(d.upgrades)+'</div>':'')+img+
 '<div class="nex-item-card-description">'+descriptionText(d.description||'Sem descrição cadastrada.')+'</div>'+
 '<div class="nex-item-card-buttons"><button type="button" data-nex-item-remove="'+id+'" class="nex-item-remove">Remover</button>'+
 '<button type="button" data-nex-item-edit="'+id+'" class="nex-item-edit">Editar</button></div></div></details>';
}
// Usa o renderizador de inventário existente para preservar filtros, busca e contadores.
let lastExpandedIds=new Set();
function enhance(){
 const list=by('inventoryList');if(!list)return;
 const ids=[...list.querySelectorAll('.nexv16-entry[data-item-id]')].map(e=>e.dataset.itemId);
 if(!ids.length)return;
 const currentItems=ids.map(find).filter(Boolean);
 list.innerHTML=currentItems.map((item,index)=>card(item,lastExpandedIds.size?lastExpandedIds.has(String(item.id)):index===0)).join('');
}
const priorRender=renderInventory;
renderInventory=function(){
 const list=by('inventoryList');
 if(list){
  const existing=[...list.querySelectorAll('.nex-item-card-new[data-item-id]')];
  if(existing.length)lastExpandedIds=new Set(existing.filter(el=>el.open).map(el=>String(el.dataset.itemId)));
 }
 const result=priorRender.apply(this,arguments);
 enhance();return result;
};
document.addEventListener('toggle',event=>{
 const details=event.target;
 if(!details?.matches?.('#inventoryList .nex-item-card-new'))return;
 const id=String(details.dataset.itemId||'');
 if(details.open)lastExpandedIds.add(id);else lastExpandedIds.delete(id);
},true);

document.addEventListener('change',event=>{
 const checkbox=event.target.closest?.('[data-nex-item-equipped]');
 if(!checkbox)return;
 const item=find(checkbox.dataset.nexItemEquipped);if(!item)return;
 if(detail(item).category!=='Arma'){checkbox.checked=false;return;}
 item.equipped=checkbox.checked;
 renderAttacks();
 save();
 toast(checkbox.checked?'Arma equipada e adicionada ao Combate.':'Arma retirada do Combate.');
});
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-nex-item-edit],[data-nex-item-remove]');
 if(!button)return;
 if(button.dataset.nexItemEdit!==undefined){open(button.dataset.nexItemEdit);return}
 if(button.dataset.nexItemRemove!==undefined){
  const item=find(button.dataset.nexItemRemove);
  if(item&&confirm('Remover '+item.name+' do inventário?')){
   state.items=state.items.filter(x=>String(x.id)!==String(item.id));
   renderInventory();renderAttacks();save();toast('Item removido.');
  }
 }
});

// Armas equipadas aparecem automaticamente na aba Combate, sem duplicar
// registros manuais e sem alterar o inventário.
const weaponRollPanel=document.createElement('div');
weaponRollPanel.id='nexWeaponRollPopup';
weaponRollPanel.hidden=true;
weaponRollPanel.setAttribute('role','dialog');
weaponRollPanel.setAttribute('aria-label','Resultado da rolagem de arma');
document.body.appendChild(weaponRollPanel);
const weaponD20=()=>{const n=new Uint32Array(1);crypto.getRandomValues(n);return n[0]%20+1};
function weaponDice(expression,criticalMultiplier=1){
 const expr=String(expression||'').replace(/\s+/g,'').toLowerCase().split('/')[0];
 if(!/^[+-]?(?:\d*d\d+|\d+)(?:[+-](?:\d*d\d+|\d+))*$/.test(expr)||expr.length>75)return null;
 let total=0;const parts=[];let countAll=0;
 for(const token of expr.match(/[+-]?(?:\d*d\d+|\d+)/g)||[]){
  const sign=token[0]==='-'?-1:1,core=token.replace(/^[+-]/,'');
  if(!core.includes('d')){const constant=Number(core);if(!Number.isSafeInteger(constant))return null;total+=sign*constant;parts.push(token);continue;}
  let [count,faces]=core.split('d').map(Number);if(!count)count=1;
  count*=criticalMultiplier;countAll+=count;
  if(count<1||count>100||countAll>140||faces<2||faces>1000||!Number.isInteger(count)||!Number.isInteger(faces))return null;
  const diceValues=[];for(let i=0;i<count;i++){const v=new Uint32Array(1);crypto.getRandomValues(v);const rolled=v[0]%faces+1;diceValues.push(rolled);total+=sign*rolled;}
  parts.push((sign<0?'-':'')+'['+diceValues.join(', ')+']');
 }
 return {total,detail:parts.join(' + '),expression:expr};
}
function weaponData(item){
 const d=detail(item);
 const distance=/disparo|fogo|dist[aâ]ncia|arremesso/i.test(String(d.kind||''));
 const skillName=distance?'Pontaria':'Luta';
 const skill=state.skills?.[skillName]||{};
 const attribute=['agi','for','int','pre','vig'].includes(skill.attr)?skill.attr:(distance?'agi':'for');
 const value=Math.max(0,Math.min(20,Math.trunc(Number(state.attributes?.[attribute])||0)));
 const bonus=(Number(skill.training)||0)+(Number(skill.other)||0)+(Number(d.attackBonus)||0);
 const dieCount=value===0?2:Math.max(1,value);
 const threshold=parseInt(String(d.critical||'20').match(/\d{2}/)?.[0]||'20',10);
 const multiplier=Math.max(1,Math.min(10,parseInt(d.multiplier,10)||2));
 return {d,skillName,attribute,bonus,dieCount,value,threshold,multiplier};
}
const weaponDieSvg='<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M11 3 23 5 29 16 22 27 10 29 3 18 5 9Z"/><path d="M11 3 15 13 23 5 M5 9l10 4 14 3 M3 18l12-5 7 14 M15 13l7 14-12 2 M29 16l-7 11 M5 9 3 18"/></svg>';
const previousRenderAttacks=renderAttacks;
renderAttacks=function(){
 const result=previousRenderAttacks.apply(this,arguments);
 const list=by('attacksList');
 if(!list)return result;
 const items=(state.items||[]).filter(item=>item.equipped===true && detail(item).category==='Arma');
 if(!items.length)return result;
 const cards=items.map(item=>{
  const w=weaponData(item),d=w.d,id=safe(item.id),bonus=w.bonus,damage=String(d.damage||'').trim();
  return '<article class="nex-combat-equipped" data-equipped-weapon="'+id+'">'+
   '<div class="nex-combat-weapon">'+
    '<div class="nex-combat-weapon-main"><strong class="nex-combat-weapon-name">'+safe(d.name||item.name)+'</strong>'+
    '<div class="nex-combat-weapon-summary">Dano: <b>'+safe(damage||'—')+'</b>　Crítico: <b>'+safe(d.critical||'20')+' ×'+safe(w.multiplier)+'</b></div></div>'+
    '<button type="button" class="nex-combat-die-button" data-nex-weapon-roll="'+id+'" aria-label="Rolar ataque e dano de '+safe(d.name||item.name)+'" title="Rolar ataque e dano">'+weaponDieSvg+'</button>'+
   '</div>'+
   '<div class="nex-combat-weapon-details">'+
    '<div><span class="nex-combat-stat-label">Ataque Bônus:</span> <b>'+safe((bonus>=0?'+':'')+bonus)+'</b> ('+safe(w.skillName)+')</div>'+
    '<div><span class="nex-combat-stat-label">Tipo de Dano:</span> <b>'+safe(d.damageType||'—')+'</b></div>'+
    '<div><span class="nex-combat-stat-label">Alcance:</span> <b>'+safe(d.range||'—')+'</b></div>'+
    '<div><span class="nex-combat-stat-label">Perícia:</span> <b>'+safe(w.skillName)+'</b></div>'+
    '<div><span class="nex-combat-stat-label">Atributo Dano:</span> <b>'+safe(({agi:'Agilidade',for:'Força',int:'Intelecto',pre:'Presença',vig:'Vigor'})[w.attribute])+'</b></div>'+
   '</div></article>';
 }).join('');
 const container=document.createElement('section');
 container.className='nex-equipped-weapons-list';
 container.setAttribute('aria-label','Armas equipadas');
 container.innerHTML=cards;
 list.prepend(container);
};
function hideWeaponRoll(){weaponRollPanel.hidden=true;}
document.addEventListener('click',e=>{
 const button=e.target.closest('[data-nex-weapon-roll]');
 if(!button){
  if(!weaponRollPanel.hidden&&!e.target.closest('#nexWeaponRollPopup'))hideWeaponRoll();
  return;
 }
 e.preventDefault();
 const item=find(button.dataset.nexWeaponRoll);
 if(!item||!item.equipped||detail(item).category!=='Arma')return;
 const w=weaponData(item);
 const rolls=Array.from({length:w.dieCount},weaponD20);
 const natural=w.value===0?Math.min(...rolls):Math.max(...rolls);
 const attack=natural+w.bonus;
 const critical=natural>=w.threshold;
 const damage=weaponDice(w.d.damage,critical?w.multiplier:1);
 if(!damage){toast('Configure um dano válido para esta arma no inventário.');return;}
 const originBonus=typeof nex12Orig==='function'?Number(nex12Orig()?.damage)||0:0;
 damage.total+=originBonus;
 const detailAttack=rolls.join(', ')+' → '+natural+' '+(w.bonus>=0?'+ ':'− ')+Math.abs(w.bonus);
 const damageDetail=damage.detail+(originBonus?' + bônus '+originBonus:'');
 weaponRollPanel.innerHTML='<div class="nex-weapon-roll-head"><strong>'+safe(w.d.name||item.name)+'</strong><button type="button" data-close-weapon-popup aria-label="Fechar resultado">×</button></div>'+
 '<div class="nex-weapon-roll-stats"><span class="nex-weapon-roll-hex"></span>'+
 '<div class="nex-weapon-roll-column"><div class="nex-weapon-roll-value">'+safe(attack)+'</div><div class="nex-weapon-roll-label">ATAQUE</div></div>'+
 '<div class="nex-weapon-roll-column"><div class="nex-weapon-roll-value">'+safe(damage.total)+'</div><div class="nex-weapon-roll-label">DANO</div></div></div>'+
 '<div class="nex-weapon-roll-detail">'+safe(w.skillName)+': '+safe(detailAttack)+'<div>Dano: '+safe(damageDetail)+(critical?' · Crítico!':'')+'</div></div>';
 weaponRollPanel.hidden=false;
 const rect=button.getBoundingClientRect(),width=310;
 const left=Math.max(8,Math.min(innerWidth-width-8,rect.left-100));
 weaponRollPanel.style.left=left+'px';
 weaponRollPanel.style.top=Math.max(8,Math.min(innerHeight-weaponRollPanel.offsetHeight-8,rect.bottom+9))+'px';
 if(typeof logResult==='function'){
  logResult(w.d.name+' — ataque','d20 ('+w.skillName+')', '['+rolls.join(', ')+'] → '+natural,attack);
  logResult(w.d.name+' — dano',damage.expression,damageDetail,damage.total);
 }
});
weaponRollPanel.addEventListener('click',e=>{
 if(e.target.closest('[data-close-weapon-popup]'))hideWeaponRoll();
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')hideWeaponRoll()});

modal.addEventListener('click',event=>{
 if(event.target===modal||event.target.closest('.nex-editor-close,.nex-editor-cancel')){close();return;}
 const add=event.target.closest('[data-nex-add-upgrade]');
 if(add){const input=by('nexEditorNewUpgrade'),area=by('nexEditorFields').querySelector('[data-edit="upgrades"]');if(input&&area&&input.value.trim()){area.value+=(area.value.trim()?'\n':'')+input.value.trim().slice(0,120);input.value='';showUpgrades();}return;}
 const remove=event.target.closest('[data-nex-remove-upgrade]');
 if(remove){const area=by('nexEditorFields').querySelector('[data-edit="upgrades"]');if(!area)return;const all=area.value.split(/\n/).filter(Boolean);all.splice(Number(remove.dataset.nexRemoveUpgrade),1);area.value=all.join('\n');showUpgrades();return;}
 const rich=event.target.closest('[data-nex-rich]');
 if(rich){const area=by('nexEditorFields').querySelector('[data-edit="description"]');if(!area)return;const mark=rich.dataset.nexRich,start=area.selectionStart,end=area.selectionEnd;area.value=area.value.slice(0,start)+mark+area.value.slice(start,end)+mark+area.value.slice(end);area.focus();area.setSelectionRange(start+mark.length,end+mark.length);}
});
by('nexEditorForm').addEventListener('submit',event=>{
 event.preventDefault();const item=find(current);if(!item)return;
 const values=Object.fromEntries([...by('nexEditorFields').querySelectorAll('[data-edit]')].map(el=>[el.dataset.edit,el.value]));
 if(!values.name?.trim()){toast('Informe o nome do item.');return}
 if(!cats.includes(values.category)){toast('Categoria inválida.');return}
 if(values.image&&!/^https:\/\//i.test(values.image)){toast('A imagem precisa de um endereço HTTPS.');return}
 const d={...detail(item),...values};
 if(d.category==='Arma' && (!String(d.damage||'').trim() || !String(d.critical||'').trim() || !String(d.multiplier||'').trim())){toast('Preencha dano, crítico e multiplicador.');return;}
 d.name=String(d.name).trim().slice(0,100);
 d.quantity=Math.max(0,Math.min(9999,Math.trunc(number(d.quantity,1))));
 d.spaces=Math.max(0,Math.min(100,Math.round(number(d.spaces,1)*2)/2));
 if(!window.NEX_CARRY?.canUpdate(item,d.spaces,d.quantity,window.NEX_CARRY.tier({nexInfo:{tier:d.tier}}),d.name)){toast('Limite de carga ou de itens dessa categoria atingido.');return;}
 d.description=String(d.description||'').slice(0,2500);
 d.upgrades=String(d.upgrades||'').slice(0,2500);
 // O campo de imagem foi retirado do editor, preservando imagens eventualmente já salvas.
 d.image=detail(item).image;
 item.name=d.name;item.category=d.category;item.quantity=d.quantity;item.spaces=d.spaces;item.nexInfo=d;
 item.description=d.description;
 item.detail=[d.description,d.category==='Arma'?'Dano: '+d.damage:'',d.category==='Arma'?'Crítico: '+d.critical+' ×'+d.multiplier:'',d.category==='Arma'?'Tipo: '+d.damageType:'','Categoria: '+d.tier].filter(Boolean).join(' · ').slice(0,2500);
 close();renderInventory();renderAttacks();save();toast('Item atualizado.');
});
document.addEventListener('keydown',event=>{if(!modal.hidden&&event.key==='Escape'){event.preventDefault();close();}});
renderInventory();
window.NEX_ITEM_EDITOR={open,enhance};
})();