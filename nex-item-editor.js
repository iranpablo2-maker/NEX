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
 const fromCrit=rawCrit.match(/^(\d{2})(?:[\/x×](?:[x×])?(\d+))?$/i);
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
  secondary:pairs['dano secundario']||getStat('Dano secundário')||'—',
  secondaryType:pairs['tipo do dano secundario']||'Normal',
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
'#sheetScreen .nex-combat-die-button .nex-combat-d20-image{width:43px!important;height:48px!important;object-fit:contain!important;display:block!important;border:0!important;pointer-events:none;background:#000!important;border-radius:5px}',
'#sheetScreen .nex-combat-die-button{padding:1px 4px!important;min-width:49px!important;min-height:50px!important}',
'#sheetScreen .nex-combat-weapon-toggle{background:none!important;border:0!important;padding:7px 8px!important;color:#da4754!important;font-size:19px!important;line-height:1!important;cursor:pointer!important;flex:none!important;align-self:center!important}',
'#sheetScreen .nex-combat-weapon-toggle:hover{color:#ff7883!important}',
'#sheetScreen .nex-combat-weapon-toggle:focus-visible{outline:2px solid #db4c59!important}',
'#sheetScreen .nex-combat-weapon-details[hidden]{display:none!important}',
'#sheetScreen .nex-combat-weapon-remove{border:0!important;background:transparent!important;color:#ef5d65!important;font-size:12px!important;padding:7px 5px!important;margin-top:9px!important;cursor:pointer!important}',
'#sheetScreen .nex-combat-weapon-remove:hover{text-decoration:underline!important;color:#ff8a90!important}',
'#sheetScreen .nex-secondary-damage-line{display:flex!important;align-items:center!important;flex-wrap:wrap!important;gap:6px!important}',
'#sheetScreen .nex-secondary-roll-button{font:inherit!important;font-size:11px!important;cursor:pointer!important;border:1px solid #9d46ea!important;background:#251b30!important;color:#dfb4ff!important;border-radius:4px!important;padding:4px 7px!important;margin-left:8px!important}',
'#sheetScreen .nex-secondary-roll-button:hover{background:#3c2851!important}',

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
'#sheetScreen .nex-item-card-weapon{border:1px solid #27242b!important;background:#1e1e1e!important;border-radius:3px!important}',
'#sheetScreen .nex-item-card-weapon>summary{border-bottom:1px solid #e44855!important;padding:10px 52px 12px 8px!important;gap:13px!important;align-items:flex-start!important}',
'#sheetScreen .nex-item-card-weapon .nex-item-chevron{color:#e44855!important;font-size:24px!important;line-height:24px!important}',
'#sheetScreen .nex-item-card-weapon .nex-item-main strong{font-size:14px!important;color:#fff!important;line-height:1.3!important}',
'#sheetScreen .nex-item-card-weapon .nex-item-short{color:#e44855!important;font-size:12px!important;gap:17px!important;margin-top:4px!important}',
'#sheetScreen .nex-item-card-weapon .nex-item-short b{color:#fff!important}',
'#sheetScreen .nex-item-card-weapon .nex-item-card-body{padding:13px 8px 11px!important;border-top:0!important}',
'#sheetScreen .nex-item-card-weapon .nex-item-subtitle{font-size:11px!important;color:#fff!important;font-weight:700!important;font-style:italic!important;margin-bottom:5px!important}',
'#sheetScreen .nex-item-card-weapon .nex-item-card-stats{font-size:13px!important;line-height:1.75!important;color:#e44855!important;margin-top:0!important}',
'#sheetScreen .nex-item-card-weapon .nex-item-card-stats span{color:#e44855!important;font-weight:700!important}',
'#sheetScreen .nex-item-card-weapon .nex-item-card-stats b{color:#fff!important;font-weight:500!important}',
'#sheetScreen .nex-item-card-weapon .nex-item-card-description{color:#fff!important;margin:15px 0 11px!important;font-size:12px!important;line-height:1.6!important}',
'#sheetScreen .nex-item-card-weapon .nex-item-card-buttons{margin-top:9px!important;justify-content:space-between!important}',
'#sheetScreen .nex-item-card-weapon .nex-item-card-buttons button{font-size:12px!important;padding:3px 0!important;min-height:20px!important}',
'#sheetScreen .nex-item-card-weapon .nex-item-remove{color:#ec404e!important}',
'#sheetScreen .nex-item-card-weapon .nex-item-edit{color:#38bd55!important}',
'#sheetScreen .nex-item-card-weapon .nex-item-equipped-label{right:9px!important;top:7px!important}',
'#sheetScreen .nex-item-card-weapon .nex-item-equipped-label input:checked{background:#202022!important;border-color:#eee!important}',
'#sheetScreen .nex-item-card-weapon .nex-item-equipped-label input:checked::after{color:#e44855!important}',
'#sheetScreen #inventoryList .nex-item-card-weapon{margin:7px 0!important;padding:0!important;background:#1e1e1e!important;border:1px solid #262329!important;border-radius:3px!important;box-shadow:none!important;color:white!important;overflow:hidden!important}',
'#sheetScreen #inventoryList .nex-item-card-weapon>summary{min-height:55px!important;box-sizing:border-box!important;display:flex!important;align-items:flex-start!important;gap:20px!important;padding:6px 53px 11px 13px!important;background:#1e1e1e!important;border:0!important;border-bottom:1px solid #e44855!important}',
'#sheetScreen #inventoryList .nex-item-card-weapon .nex-item-chevron{font-size:23px!important;line-height:24px!important;color:#e44855!important;flex:none!important;width:21px!important;display:block!important;transform:rotate(0deg)!important}',
'#sheetScreen #inventoryList .nex-item-card-weapon[open] .nex-item-chevron{transform:rotate(180deg)!important}',
'#sheetScreen #inventoryList .nex-item-card-weapon .nex-item-main{min-width:0!important;flex:1!important;display:block!important}',
'#sheetScreen #inventoryList .nex-item-card-weapon .nex-item-main strong{color:white!important;font-weight:800!important;font-size:13px!important;line-height:1.3!important}',
'#sheetScreen #inventoryList .nex-item-card-weapon .nex-item-short{display:flex!important;margin-top:4px!important;gap:16px!important;flex-wrap:wrap!important;color:#e44855!important;font-size:12px!important;line-height:1.35!important;font-weight:500!important}',
'#sheetScreen #inventoryList .nex-item-card-weapon .nex-item-short b{color:white!important;font-weight:700!important}',
'#sheetScreen #inventoryList .nex-item-card-weapon .nex-item-equipped-label{right:14px!important;top:8px!important;width:34px!important;height:34px!important}',
'#sheetScreen #inventoryList .nex-item-card-weapon .nex-item-equipped-label input{width:32px!important;height:32px!important;min-width:32px!important;background:#1e1e1e!important;border:1px solid #dedede!important;border-radius:4px!important}',
'#sheetScreen #inventoryList .nex-item-card-weapon .nex-item-equipped-label input:checked{background:#1e1e1e!important;border-color:#dcdcdc!important}',
'#sheetScreen #inventoryList .nex-item-card-weapon .nex-item-equipped-label input:checked::after{color:#e44855!important;font-size:21px!important}',
'#sheetScreen #inventoryList .nex-item-card-weapon .nex-item-card-body{padding:18px 8px 10px!important;border:0!important;background:#1e1e1e!important}',
'#sheetScreen #inventoryList .nex-item-card-weapon .nex-item-subtitle{color:white!important;font-size:10px!important;line-height:1.4!important;margin:0 0 3px!important;font-style:normal!important;font-weight:800!important}',
'#sheetScreen #inventoryList .nex-item-card-weapon .nex-item-subtitle em{font-style:italic!important;font-weight:500!important}',
'#sheetScreen #inventoryList .nex-item-card-weapon .nex-item-card-stats{margin:0!important;color:#e44855!important;font-size:13px!important;line-height:1.7!important}',
'#sheetScreen #inventoryList .nex-item-card-weapon .nex-item-card-stats span{color:#e44855!important;font-weight:600!important}',
'#sheetScreen #inventoryList .nex-item-card-weapon .nex-item-card-stats b{color:white!important;font-weight:500!important}',
'#sheetScreen #inventoryList .nex-item-card-weapon .nex-item-card-description{font-size:12px!important;color:#fff!important;line-height:1.55!important;margin:18px 0 12px!important;white-space:pre-wrap!important}',
'#sheetScreen #inventoryList .nex-item-card-weapon .nex-item-card-buttons{margin:0!important;padding:0!important;display:flex!important;align-items:center!important;justify-content:space-between!important}',
'#sheetScreen #inventoryList .nex-item-card-weapon .nex-item-card-buttons button{background:transparent!important;border:0!important;padding:0!important;min-height:20px!important;font-size:12px!important;font-weight:500!important;box-shadow:none!important}',
'#sheetScreen #inventoryList .nex-item-card-weapon .nex-item-remove{color:#f14953!important}',
'#sheetScreen #inventoryList .nex-item-card-weapon .nex-item-edit{color:#32b957!important}',
"#sheetScreen #inventoryList details.nex-ref-weapon{display:block!important;position:relative!important;box-sizing:border-box!important;width:100%!important;margin:7px 0!important;padding:0!important;border:1px solid #252329!important;border-radius:3px!important;background:#1e1e1e!important;color:#fff!important;box-shadow:none!important;overflow:hidden!important;font-family:Arial,Helvetica,sans-serif!important}",
"#sheetScreen #inventoryList details.nex-ref-weapon>.nex-ref-heading{display:flex!important;align-items:flex-start!important;justify-content:flex-start!important;gap:21px!important;position:relative!important;min-height:55px!important;box-sizing:border-box!important;padding:6px 54px 11px 13px!important;margin:0!important;border:0!important;border-bottom:1px solid #e44855!important;border-radius:0!important;background:#1e1e1e!important;cursor:pointer!important;list-style:none!important}",
"#sheetScreen #inventoryList details.nex-ref-weapon>.nex-ref-heading::-webkit-details-marker{display:none!important}",
"#sheetScreen #inventoryList details.nex-ref-weapon .nex-item-chevron{font-size:24px!important;line-height:24px!important;font-weight:600!important;color:#e44855!important;display:block!important;width:21px!important;margin:0!important;padding:0!important;flex:none!important;transform:none!important;transition:none!important}",
"#sheetScreen #inventoryList details.nex-ref-weapon[open] .nex-item-chevron{transform:rotate(180deg)!important}",
"#sheetScreen #inventoryList details.nex-ref-weapon .nex-ref-titleblock{display:block!important;flex:1!important;min-width:0!important;padding:0!important;margin:0!important}",
"#sheetScreen #inventoryList details.nex-ref-weapon .nex-ref-name{display:block!important;color:#fff!important;font-size:13px!important;line-height:17px!important;font-weight:700!important;padding:0!important;margin:0!important}",
"#sheetScreen #inventoryList details.nex-ref-weapon .nex-ref-damage{display:flex!important;gap:16px!important;flex-wrap:wrap!important;margin-top:4px!important;padding:0!important;color:#e44855!important;font-size:12px!important;line-height:15px!important;font-weight:400!important}",
"#sheetScreen #inventoryList details.nex-ref-weapon .nex-ref-damage b{color:#fff!important;font-size:12px!important;font-weight:700!important}",
"#sheetScreen #inventoryList details.nex-ref-weapon .nex-ref-equip{top:8px!important;right:16px!important;width:33px!important;height:33px!important;margin:0!important}",
"#sheetScreen #inventoryList details.nex-ref-weapon .nex-ref-equip input{box-sizing:border-box!important;width:32px!important;height:32px!important;min-width:32px!important;border-radius:4px!important;border:1px solid #e0e0e0!important;background:#1e1e1e!important;margin:0!important}",
"#sheetScreen #inventoryList details.nex-ref-weapon .nex-ref-equip input:checked{background:#1e1e1e!important;border-color:#e0e0e0!important}",
"#sheetScreen #inventoryList details.nex-ref-weapon .nex-ref-equip input:checked::after{color:#e44855!important;font-size:21px!important}",
"#sheetScreen #inventoryList details.nex-ref-weapon .nex-ref-body{display:block!important;padding:18px 8px 10px!important;margin:0!important;border:0!important;background:#1e1e1e!important;box-sizing:border-box!important}",
"#sheetScreen #inventoryList details.nex-ref-weapon .nex-ref-subtitle{font-size:10px!important;line-height:14px!important;font-weight:700!important;color:#fff!important;margin:0 0 2px!important;padding:0!important;font-style:normal!important}",
"#sheetScreen #inventoryList details.nex-ref-weapon .nex-ref-subtitle em{font-weight:500!important;font-style:italic!important}",
"#sheetScreen #inventoryList details.nex-ref-weapon .nex-ref-fields{display:block!important;font-size:13px!important;line-height:23px!important;margin:0!important;padding:0!important;color:#e44855!important}",
"#sheetScreen #inventoryList details.nex-ref-weapon .nex-ref-fields div{display:block!important;min-height:23px!important;padding:0!important;margin:0!important}",
"#sheetScreen #inventoryList details.nex-ref-weapon .nex-ref-fields span{font-weight:500!important;color:#e44855!important}",
"#sheetScreen #inventoryList details.nex-ref-weapon .nex-ref-fields b{color:#fff!important;font-weight:500!important}",
"#sheetScreen #inventoryList details.nex-ref-weapon .nex-ref-description{color:#fff!important;font-size:12px!important;line-height:18px!important;margin:17px 0 13px!important;padding:0!important;white-space:pre-wrap!important;overflow-wrap:anywhere!important}",
"#sheetScreen #inventoryList details.nex-ref-weapon .nex-ref-actions{display:flex!important;justify-content:space-between!important;align-items:center!important;margin:0!important;padding:0!important;gap:12px!important}",
"#sheetScreen #inventoryList details.nex-ref-weapon .nex-ref-actions button{display:inline-block!important;background:transparent!important;border:0!important;box-shadow:none!important;border-radius:0!important;min-height:18px!important;margin:0!important;padding:0!important;line-height:18px!important;font-size:12px!important;font-weight:400!important;cursor:pointer!important}",
"#sheetScreen #inventoryList details.nex-ref-weapon .nex-ref-actions .nex-item-remove{color:#f34a56!important}",
"#sheetScreen #inventoryList details.nex-ref-weapon .nex-ref-actions .nex-item-edit{color:#30b74e!important}",
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
   select('secondaryType','Tipo do dano secundário',d.secondaryType||'Normal',['Normal','Sangue','Morte','Energia','Conhecimento','Medo'])+
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
 '<h3>Descrição</h3>'+field('description','Descrição',d.description,'textarea',4);
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
 return safe(s).replace(/\*\*(.+?)\*\*/gs,'<strong style="color:#e44855">$1</strong>').replace(/__(.+?)__/gs,'<u>$1</u>').replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g,'<em>$1</em>');
}
function card(item,expanded=false){
 const d=detail(item),weapon=d.category==='Arma',id=safe(item.id);
 const critical=String(d.critical||'').trim(),multi=String(d.multiplier||'').trim();
 const critText=critical+(multi?' ×'+multi:'');
 const quick=weapon?[['Dano',d.damage||'—'],['Crítico',critText||'—']]:[['Categoria',d.tier||'—'],['Espaços',d.spaces]];
 const subtitle=weapon?[d.proficiency,d.kind,d.wield].filter(Boolean).join(' - '):(d.category==='Item Amaldiçoado'?'Item Amaldiçoado':d.category);
 const stats=weapon?[
  ['Categoria',d.tier],['Tipo',d.damageType],['Espaços',d.spaces],
  ['Alcance',d.range==='—'?'':d.range],['Dano secundário',d.secondary+' ('+(d.secondaryType||'Normal')+')'],
  ...(Number(d.quantity)>1?[['Quantidade',d.quantity]]:[])
 ]:[
  ['Categoria',d.tier],['Tipo',d.category],['Espaços',d.spaces],
  ...(Number(d.quantity)>1?[['Quantidade',d.quantity]]:[])
 ];
 if(weapon){
  const displayCrit=multi?'x'+safe(multi):(critical?safe(critical):'—');
  const weaponInfo=[['Categoria',d.tier],['Tipo',d.damageType],['Espaços',d.spaces],...(String(d.secondary||'').trim()&&!/^(?:—|-)$/i.test(String(d.secondary).trim())?[['Dano secundário',d.secondary]]:[])];
  return '<details class="nex-item-card-new nex-ref-weapon" data-item-id="'+id+'"'+(expanded?' open':'')+'>'+
    '<summary class="nex-ref-heading"><span class="nex-item-chevron" aria-hidden="true">⌄</span>'+
      '<span class="nex-ref-titleblock"><strong class="nex-ref-name">'+safe(d.name||'Arma')+'</strong>'+
      '<span class="nex-ref-damage"><span>Dano: <b>'+safe(d.damage||'—')+'</b></span><span>Crítico: <b>'+displayCrit+'</b></span></span></span></summary>'+
    '<label class="nex-item-equipped-label nex-ref-equip" title="Equipar arma"><input type="checkbox" data-nex-item-equipped="'+id+'" aria-label="Equipar '+safe(d.name||'arma')+'" '+(item.equipped?'checked':'')+'></label>'+
    '<div class="nex-ref-body">'+
     '<div class="nex-ref-subtitle">'+safe(d.proficiency||'')+
       (d.kind?' <em>- '+safe(d.kind)+'</em>':'')+(d.wield?' <em>- '+safe(d.wield)+'</em>':'')+'</div>'+
     '<div class="nex-ref-fields">'+weaponInfo.filter(x=>x[1]!==undefined&&x[1]!==null&&String(x[1]).trim()!=='').map(x=>'<div><span>'+safe(x[0])+':</span> <b>'+safe(x[1])+'</b></div>').join('')+'</div>'+
     '<p class="nex-ref-description">'+descriptionText(d.description||'Sem descrição cadastrada.')+'</p>'+
     '<div class="nex-ref-actions"><button type="button" data-nex-item-remove="'+id+'" class="nex-item-remove">Remover</button>'+
     '<button type="button" data-nex-item-edit="'+id+'" class="nex-item-edit">Editar</button></div>'+
    '</div></details>';
 }
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
const weaponDieSvg='<img class="nex-combat-d20-image" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAG4AAAB+AQAAAADt9hnNAAAEL0lEQVR42m2VTYhbVRTHf++8R5KWMIky2CBj5hVtcVEkxS4GrX2vC7G49AOqC5udulC78mOVWypOEbFdVpBOFqIUEbooSMHSNx1pu1AmCEoXLX2xgw22i8QUTcabd1y895IpeDeXP/97z7n/83EPAOCadJd02xaydS01HoDxQnYJAKd6YbKFLJRXzRa4sL8fb7E8H5YOb2FXbVKemXJ3PSvJpSk5V7fajaZ3t78OlXNTthlbtbUcOWuRVS3khwsvXofexfwh5af3Wo0bUQYb77tWR6dzUd17FdtK6rmo5RtBXNHKciZn8VKCk1S6Bjx4+Ei0d2lp56lKKuqoVWd4wFW7BILz8mRcx7lp3N8A3IoavbNii7oGwrbG5CQx7gXqEcKecOMopQZL/o5zQDcpqq7cUT2W1BDn67+WUv/vHXwXCouuqgZDVXXXjDzy2kKu++Z3Te+VbTFoWADqX0ZEFVW1rbGqalTGqKpatarraj0pAkwQwwjXyJZETXO0iRMxmcI+QGwwUuYyeNAkBF8ggBgYOwYEBUrQuDYHSIGGoQM1GmgoJIeSNFNRatn717ShvBtAPBgpQA0SRIkwIRQAjACDxIDLKiBImEafyAPOtKw7VtWk9aMz3hDAS9nHb6USSpuAE9k2iJMLYu74JkIkVQ+gqR4IOH5vYMZhgxoIBkOn3evQaYIQE3aifjyqwf3UiekWsZD79Ht2zZSfCnoIIaol4x3gIXoIfQghkyRAYsD4bgp9cPqZJkQ/JO0oMVQRYAQfZ3kSp5rFOovkD9xnswQ0aSMWYFQFoIf8bejRbwINLKKlNJeA7kZ4gw6rmJgaLiJg+ISpIw+fsWcvU8YYoaWhwnOGQjJCSk2mwicRXyRWE9y4otZ2v/JcrOso4wZMQFyOARQjxFQReqNp3W03QjevQ+eyhxCdz8nDIJyYFakiWn0rRw0n9Bx/4GSwODKszL4PVzeESUWzdRGE/Us5e83AyuB2ztYXN4Rf5nI3O/sIPxUzmITn4cyibaVnR9rdkKQpwBhw2AGnVAPVOFAdqn1ChipNiGMY+m4sXqLnIAL+6GGkROE6FPuwttkOvX18NA8l4NStIz/LO0LaKerXdI/cOxZ9kL2i+MyT8mf7oGcYVbEH/bd9nOWoHmi0qIO54lXg9lgDjQId1t9cQHi1QBMf7v++ax4oB6N1vRLouvYjhH/iE6dxYjoMI8C54g716qIu6ucg6LefFVDU109B4JvryqN+EiaH0v4JbKvfGukg/VXdk0mgOtCraXlP9jmA8HwWwr26ononyb/chda66vooznrhbrsGnbvtvAqWh6rBlbxT9EYBDV+aDoJfXZLJbIqU97dG42iW9nowuD2bOMlZ5OyWaTX3wmOtDYC0amrfT+b9Gbt5sXZtZgr3ePF/B19ef0cfgAvRAzP0bgb/AwCO4zlQNWGBAAAAAElFTkSuQmCC" alt="Dado d20" draggable="false">';
const collapsedWeapons=new Set();
const previousRenderAttacks=renderAttacks;
renderAttacks=function(){
 const result=previousRenderAttacks.apply(this,arguments);
 const list=by('attacksList');
 if(!list)return result;
 const items=(state.items||[]).filter(item=>item.equipped===true && detail(item).category==='Arma');
 if(!items.length)return result;
 const cards=items.map(item=>{
  const w=weaponData(item),d=w.d,id=safe(item.id),bonus=w.bonus,damage=String(d.damage||'').trim();
  const collapsed=!collapsedWeapons.has(String(item.id));
  return '<article class="nex-combat-equipped" data-equipped-weapon="'+id+'">'+
   '<div class="nex-combat-weapon">'+
    '<button type="button" class="nex-combat-weapon-toggle" data-nex-weapon-toggle="'+id+'" aria-expanded="'+(!collapsed)+'" aria-label="'+(collapsed?'Mostrar':'Esconder')+' detalhes de '+safe(d.name||item.name)+'">'+(collapsed?'⌄':'⌃')+'</button>'+
    '<div class="nex-combat-weapon-main"><strong class="nex-combat-weapon-name">'+safe(d.name||item.name)+'</strong>'+
    '</div>'+
    '<button type="button" class="nex-combat-die-button" data-nex-weapon-roll="'+id+'" aria-label="Rolar ataque e dano de '+safe(d.name||item.name)+'" title="Rolar ataque e dano">'+weaponDieSvg+'</button>'+
   '</div>'+
   '<div class="nex-combat-weapon-details" '+(collapsed?'hidden':'')+'>'+
     '<div class="nex-combat-weapon-summary">Dano: <b>'+safe(damage||'—')+'</b>　Crítico: <b>'+safe(d.critical||'20')+' ×'+safe(w.multiplier)+'</b></div>'+
    '<div><span class="nex-combat-stat-label">Ataque Bônus:</span> <b>'+safe((bonus>=0?'+':'')+bonus)+'</b> ('+safe(w.skillName)+')</div>'+
    (String(d.secondary||'').trim()&&!/^(?:—|-)$/i.test(String(d.secondary).trim())?'<div class="nex-secondary-damage-line"><span class="nex-combat-stat-label">Dano secundário:</span> <b>'+safe(d.secondary)+' ('+safe(d.secondaryType||'Normal')+')</b> <button type="button" class="nex-secondary-roll-button" data-nex-secondary-roll="'+id+'" aria-label="Rolar dano secundário de '+safe(d.name||item.name)+'">Rolar dano secundário</button></div>':'')+
    '<div><span class="nex-combat-stat-label">Tipo de Dano:</span> <b>'+safe(d.damageType||'—')+'</b></div>'+
    '<div><span class="nex-combat-stat-label">Alcance:</span> <b>'+safe(d.range||'—')+'</b></div>'+
    '<div><span class="nex-combat-stat-label">Perícia:</span> <b>'+safe(w.skillName)+'</b></div>'+
    '<div><span class="nex-combat-stat-label">Atributo Dano:</span> <b>'+safe(({agi:'Agilidade',for:'Força',int:'Intelecto',pre:'Presença',vig:'Vigor'})[w.attribute])+'</b></div>'+
    '<button type="button" class="nex-combat-weapon-remove" data-nex-weapon-remove="'+id+'" aria-label="Remover ataque de '+safe(d.name||item.name)+' do combate">Remover</button>'+
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
 const toggle=e.target.closest('[data-nex-weapon-toggle]');
 if(toggle){
  e.preventDefault();
  const id=String(toggle.dataset.nexWeaponToggle||'');
  const card=toggle.closest('.nex-combat-equipped'),details=card?.querySelector('.nex-combat-weapon-details');
  if(!details)return;
  const collapsed=!details.hidden;
  details.hidden=collapsed;
  toggle.textContent=collapsed?'⌄':'⌃';
  toggle.setAttribute('aria-expanded',String(!collapsed));
  toggle.setAttribute('aria-label',(collapsed?'Mostrar':'Esconder')+' detalhes da arma');
  if(collapsed)collapsedWeapons.delete(id);else collapsedWeapons.add(id);
  return;
 }
 const remove=e.target.closest('[data-nex-weapon-remove]');
 if(remove){
  e.preventDefault();
  const id=String(remove.dataset.nexWeaponRemove||''),item=find(id);
  if(!item||!item.equipped)return;
  item.equipped=false;
  collapsedWeapons.delete(id);
  hideWeaponRoll();
  renderInventory();
  renderAttacks();
  save();
  toast('Ataque removido do Combate. A arma permanece no inventário.');
  return;
 }
 const secondaryButton=e.target.closest('[data-nex-secondary-roll]');
 if(secondaryButton){
  e.preventDefault();
  const secondaryItem=find(secondaryButton.dataset.nexSecondaryRoll);
  if(!secondaryItem||!secondaryItem.equipped)return;
  const secondaryWeapon=weaponData(secondaryItem);
  const expression=String(secondaryWeapon.d.secondary||'').trim();
  const secondaryRoll=weaponDice(expression,1);
  if(!secondaryRoll){toast('Dano secundário inválido. Use 1d6, 2d4+2 etc.');return;}
  weaponRollPanel.innerHTML='<div class="nex-weapon-roll-head"><strong>'+safe(secondaryWeapon.d.name||secondaryItem.name)+'</strong><button type="button" data-close-weapon-popup aria-label="Fechar resultado">×</button></div>'+
    '<div class="nex-weapon-roll-stats"><span class="nex-weapon-roll-hex"></span><div class="nex-weapon-roll-column"><div class="nex-weapon-roll-value">'+safe(secondaryRoll.total)+'</div><div class="nex-weapon-roll-label">DANO SECUNDÁRIO</div></div></div>'+
    '<div class="nex-weapon-roll-detail">Tipo: '+safe(secondaryWeapon.d.secondaryType||'Normal')+' · '+safe(secondaryRoll.expression)+': '+safe(secondaryRoll.detail)+'</div>';
  weaponRollPanel.hidden=false;
  const rect=secondaryButton.getBoundingClientRect(),width=310;
  weaponRollPanel.style.left=Math.max(8,Math.min(innerWidth-width-8,rect.left-100))+'px';
  weaponRollPanel.style.top=Math.max(8,Math.min(innerHeight-weaponRollPanel.offsetHeight-8,rect.bottom+9))+'px';
  if(typeof logResult==='function')logResult(secondaryWeapon.d.name+' — dano secundário ('+(secondaryWeapon.d.secondaryType||'Normal')+')',secondaryRoll.expression,secondaryRoll.detail,secondaryRoll.total);
  return;
 }
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
 const secondaryExpression=String(w.d.secondary||'').trim().replace(/\s+/g,'');
 const hasSecondary=secondaryExpression!==''&&!/^(?:—|-)$/i.test(secondaryExpression);
 // Crítico multiplica apenas os dados do dano principal, mantendo o secundário independente.
 const damage=weaponDice(w.d.damage,critical?w.multiplier:1);
 if(!damage){toast('Configure um dano principal válido para esta arma no inventário.');return;}
 const secondary=hasSecondary?weaponDice(secondaryExpression,1):null;
 if(hasSecondary&&!secondary){toast('Dano secundário inválido. Use, por exemplo, 1d6 ou 2d4+2.');return;}
 const originBonus=typeof nex12Orig==='function'?Number(nex12Orig()?.damage)||0:0;
 const totalDamage=damage.total+(secondary?secondary.total:0)+originBonus;
 const detailAttack=rolls.join(', ')+' → '+natural+' '+(w.bonus>=0?'+ ':'− ')+Math.abs(w.bonus);
 const damageDetail=damage.detail+(originBonus?' + bônus '+originBonus:'');
 const secondaryDetail=secondary?secondary.detail:'';
 weaponRollPanel.innerHTML='<div class="nex-weapon-roll-head"><strong>'+safe(w.d.name||item.name)+'</strong><button type="button" data-close-weapon-popup aria-label="Fechar resultado">×</button></div>'+
 '<div class="nex-weapon-roll-stats"><span class="nex-weapon-roll-hex"></span>'+
 '<div class="nex-weapon-roll-column"><div class="nex-weapon-roll-value">'+safe(attack)+'</div><div class="nex-weapon-roll-label">ATAQUE</div></div>'+
 '<div class="nex-weapon-roll-column"><div class="nex-weapon-roll-value">'+safe(totalDamage)+'</div><div class="nex-weapon-roll-label">DANO TOTAL</div></div></div>'+
 '<div class="nex-weapon-roll-detail">'+safe(w.skillName)+': '+safe(detailAttack)+
 '<div>Dano principal ('+safe(w.d.damage)+'): '+safe(damageDetail)+' = '+safe(damage.total+originBonus)+(critical?' · Crítico!':'')+'</div>'+
 (secondary?'<div>Dano secundário '+safe(w.d.secondaryType||'Normal')+' ('+safe(secondary.expression)+'): '+safe(secondaryDetail)+' = '+safe(secondary.total)+'</div>':'')+
 (secondary?'<div>Total: '+safe(totalDamage)+'</div>':'')+'</div>';
 weaponRollPanel.hidden=false;
 const rect=button.getBoundingClientRect(),width=310;
 const left=Math.max(8,Math.min(innerWidth-width-8,rect.left-100));
 weaponRollPanel.style.left=left+'px';
 weaponRollPanel.style.top=Math.max(8,Math.min(innerHeight-weaponRollPanel.offsetHeight-8,rect.bottom+9))+'px';
 if(typeof logResult==='function'){
  logResult(w.d.name+' — ataque','d20 ('+w.skillName+')', '['+rolls.join(', ')+'] → '+natural,attack);
  logResult(w.d.name+' — dano principal',damage.expression,damageDetail,damage.total+originBonus);
  if(secondary)logResult(w.d.name+' — dano secundário ('+(w.d.secondaryType||'Normal')+')',secondary.expression,secondaryDetail,secondary.total);
  if(secondary)logResult(w.d.name+' — dano total',damage.expression+' + '+secondary.expression,damageDetail+' + '+secondaryDetail,totalDamage);
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
 item.detail=[d.description,d.category==='Arma'?'Dano: '+d.damage:'',d.category==='Arma'&&d.secondary&&d.secondary!=='—'?'Dano secundário: '+d.secondary:'',d.category==='Arma'&&d.secondary&&d.secondary!=='—'?'Tipo do dano secundário: '+(d.secondaryType||'Normal'):'',d.category==='Arma'?'Crítico: '+d.critical+' ×'+d.multiplier:'',d.category==='Arma'?'Tipo: '+d.damageType:'','Categoria: '+d.tier].filter(Boolean).join(' · ').slice(0,2500);
 close();renderInventory();renderAttacks();save();toast('Item atualizado.');
});
document.addEventListener('keydown',event=>{if(!modal.hidden&&event.key==='Escape'){event.preventDefault();close();}});
renderInventory();
renderAttacks();
window.NEX_ITEM_EDITOR={open,enhance};
})();