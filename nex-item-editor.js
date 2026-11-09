/* NEX: detalhes dos itens e editor visual. Mantém os dados originais de inventário. */
(function(){
'use strict';
const by=id=>document.getElementById(id);
const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const cats=['Arma','Munição','Proteção','Geral','Item Amaldiçoado'];
const sec={'Arma':'Armas','Munição':'Munições','Proteção':'Proteções','Geral':'Geral','Item Amaldiçoado':'Itens Amaldiçoados'};
const models=[...(window.NEX_BASE_WEAPONS||[]),...(window.NEX_ITEM_BOOKS||[]),...(window.NEX_ITEM_COMPLEMENTS?.items||[]),...(window.NEX_ITEM_VARIANTS||[]),...(window.NEX_MISSING_EQUIPMENT||[]),...(window.NEX_BASE_CURSED||[])];
const find=id=>(state.items||[]).find(it=>String(it.id)===String(id));
const number=(x,def=0)=>Number.isFinite(Number(x))?Number(x):def;
const lookup=item=>models.find(x=>norm(x.name)===norm(item.name)&&x.section===sec[item.category])||models.find(x=>norm(x.name)===norm(item.name));
const stat=(obj,name)=>(obj?.stats||[]).find(r=>norm(r[0])===norm(name))?.[1]||'';
function detail(item){
 const model=lookup(item)||{},pairs={};
 for(const fragment of String(item.detail||'').split(/\s*·\s*/)){
  const match=fragment.match(/^([^:]+):\s*(.+)$/);if(match)pairs[norm(match[1])]=match[2];
 }
 const cr=String(pairs['critico']||stat(model,'Crítico')||'');
 const sub=String(model.subtitle||'').split('·').map(x=>x.trim());
 const fallback={
  name:item.name||'',category:cats.includes(item.category)?item.category:'Geral',quantity:number(item.quantity,1),spaces:number(item.spaces,model.spaces??1),
  proficiency:sub[0]||'',kind:sub[1]||'',wield:sub[2]||'',
  damage:pairs.dano||stat(model,'Dano')||'',secondary:'',
  critical:cr.match(/^\d{2}/)?.[0]||'20',multiplier:cr.match(/[x×](\d+)/i)?.[1]||'2',
  damageType:stat(model,'Tipo')||pairs.tipo||'',range:pairs.alcance||stat(model,'Alcance')||'—',
  tier:pairs.categoria||stat(model,'Categoria')||'0',upgrades:'',
  image:'',description:item.description||model.description||String(item.detail||'').split(' · ')[0]||''
 };
 return {...fallback,...(item.nexInfo||{})};
}
const style=document.createElement('style');style.id='nex-item-details-style';
style.textContent=[
'#sheetScreen .nex-item-card-new{background:#1e1d20;border:1px solid #3a303e;border-radius:5px;margin:7px 0;overflow:hidden;color:#fff}',
'#sheetScreen .nex-item-card-new>summary{cursor:pointer;list-style:none;padding:12px 10px;display:flex;align-items:center;gap:13px}',
'#sheetScreen .nex-item-card-new>summary::-webkit-details-marker{display:none}',
'#sheetScreen .nex-item-chevron{color:#a63afa;font-size:23px;flex:none}',
'#sheetScreen .nex-item-card-new[open] .nex-item-chevron{transform:rotate(180deg)}',
'#sheetScreen .nex-item-main{min-width:0;flex:1}',
'#sheetScreen .nex-item-main strong{display:block;font-size:15px}',
'#sheetScreen .nex-item-short{display:flex;gap:12px;flex-wrap:wrap;color:#c244f6;font-size:12px;margin-top:4px}',
'#sheetScreen .nex-item-short b{color:#fff}',
'#sheetScreen .nex-item-card-body{padding:12px;border-top:1px solid #9032ca}',
'#sheetScreen .nex-item-subtitle{font-size:11px;font-weight:700;font-style:italic;color:#e5d9ed}',
'#sheetScreen .nex-item-card-stats{color:#b63cff;font-size:12px;line-height:1.8;margin-top:5px}',
'#sheetScreen .nex-item-card-stats b{color:#fff}',
'#sheetScreen .nex-item-card-description{color:#fff;font-size:13px;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.6;margin:12px 0}',
'#sheetScreen .nex-item-card-image{width:auto;max-width:100%;max-height:190px;object-fit:contain}',
'#sheetScreen .nex-item-card-buttons{display:flex;justify-content:space-between;gap:10px}',
'#sheetScreen .nex-item-card-buttons button{border:0;background:transparent;font-size:12px;padding:8px}',
'#sheetScreen .nex-item-remove{color:#f05562!important}',
'#sheetScreen .nex-item-edit{color:#49b96b!important}',
'#nexItemEditor[hidden]{display:none!important}',
'#nexItemEditor{position:fixed;inset:0;z-index:100050;display:grid;place-items:center;background:#000c;padding:10px;color:white}',
'#nexItemEditor *{box-sizing:border-box}',
'#nexItemEditor .nex-editor-dialog{width:min(940px,100%);height:min(680px,calc(100dvh - 20px));background:#202021;display:flex;flex-direction:column;border-radius:4px;overflow:hidden}',
'#nexItemEditor .nex-editor-head{display:flex;justify-content:space-between;align-items:center;padding:17px 18px;flex:none}',
'#nexItemEditor h2{font-size:24px;color:white;margin:0;text-transform:none}',
'#nexItemEditor .nex-editor-close{background:transparent;border:0;font-size:28px;color:white}',
'#nexItemEditor #nexEditorForm{padding:12px 18px;flex:1;overflow-y:auto;min-height:0}',
'#nexItemEditor .nex-editor-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}',
'#nexItemEditor .nex-editor-field{display:flex;flex-direction:column;gap:6px;font-size:13px;color:white}',
'#nexItemEditor .nex-editor-field input,#nexItemEditor .nex-editor-field textarea,#nexItemEditor .nex-editor-field select{background:#111;color:white;border:1px solid #484049;padding:9px;min-width:0;width:100%;font:inherit;border-radius:3px}',
'#nexItemEditor textarea{min-height:110px;resize:vertical;line-height:1.6}',
'#nexItemEditor .span-2{grid-column:span 2}',
'#nexItemEditor .span-4{grid-column:1/-1}',
'#nexItemEditor h3{font-size:15px;padding-top:15px;border-top:1px solid #484049;color:#d8cae5;margin:18px 0 12px}',
'#nexItemEditor .nex-editor-buttons{padding:12px 18px;display:flex;gap:14px;justify-content:flex-end;border-top:1px solid #484049;flex:none}',
'#nexItemEditor .nex-editor-buttons button{padding:10px 18px;border:0;border-radius:3px}',
'#nexItemEditor .nex-editor-save{background:#a63be5;color:white;font-weight:700}',
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
 let html='<div class="nex-editor-grid">'+field('name','Nome*',d.name,'text',2)+select('category','Tipo de item',d.category,cats)+field('quantity','Quantidade',d.quantity,'number')+
 field('tier','Categoria do livro',d.tier)+field('spaces','Espaços*',d.spaces,'number')+'</div>';
 if(d.category==='Arma')html+='<h3>Informações da arma</h3><div class="nex-editor-grid">'+
 field('proficiency','Proficiência',d.proficiency)+field('kind','Tipo',d.kind)+field('wield','Empunhadura',d.wield,'text',2)+
 field('damage','Dano*',d.damage)+field('secondary','Dano secundário',d.secondary)+
 field('critical','Crítico*',d.critical)+field('multiplier','Multiplicador*',d.multiplier)+
 field('damageType','Tipo de dano',d.damageType,'text',2)+field('range','Alcance',d.range,'text',2)+'</div>';
 html+='<h3>Melhorias</h3>'+field('upgrades','Melhorias (uma por linha)',d.upgrades,'textarea',4)+
 '<h3>Imagem</h3>'+field('image','URL HTTPS da imagem',d.image,'text',4)+
 '<h3>Descrição (use **texto** para roxo)</h3>'+field('description','Descrição do item',d.description,'textarea',4);
 return html;
}
function open(id){
 const item=find(id);if(!item)return;
 current=String(id);lastFocus=document.activeElement;
 by('nexEditorTitle').textContent='Editar '+item.name;
 by('nexEditorFields').innerHTML=editorFields(detail(item));
 modal.hidden=false;document.body.classList.add('nex-editor-open');
 by('nexEditorFields').querySelector('[data-edit="name"]')?.focus();
}
function close(){
 modal.hidden=true;current=null;document.body.classList.remove('nex-editor-open');
 lastFocus?.focus?.();
}
function descriptionText(s){
 return safe(s).replace(/\*\*(.+?)\*\*/gs,'<strong style="color:#b03eec">$1</strong>');
}
function card(item){
 const d=detail(item),weapon=d.category==='Arma',id=safe(item.id);
 const quick=weapon?[['Dano',d.damage],['Crítico',d.critical+(d.multiplier?' ×'+d.multiplier:'')]]:[['Categoria',d.tier],['Espaços',d.spaces]];
 const stats=weapon?[['Proficiência',d.proficiency],['Tipo',d.kind],['Empunhadura',d.wield],['Categoria',d.tier],['Tipo de dano',d.damageType],['Alcance',d.range],['Espaços',d.spaces]]:
 [['Categoria',d.tier],['Tipo',d.category],['Espaços',d.spaces]];
 const img=/^https:\/\//i.test(d.image)?'<img class="nex-item-card-image" src="'+safe(d.image)+'" alt="Imagem de '+safe(d.name)+'">':'';
 return '<details class="nex-item-card-new" data-item-id="'+id+'"><summary><span class="nex-item-chevron">⌄</span>'+
 '<span class="nex-item-main"><strong>'+safe(d.name)+'</strong><span class="nex-item-short">'+quick.map(x=>'<span>'+safe(x[0])+': <b>'+safe(x[1])+'</b></span>').join('')+'</span></span></summary>'+
 '<div class="nex-item-card-body"><div class="nex-item-subtitle">'+safe([d.proficiency,d.kind,d.wield].filter(Boolean).join(' · ')||d.category)+'</div>'+
 '<div class="nex-item-card-stats">'+stats.map(x=>'<div>'+safe(x[0])+': <b>'+safe(x[1])+'</b></div>').join('')+'<div>Quantidade: <b>'+safe(d.quantity)+'</b></div></div>'+
 (d.upgrades?'<div class="nex-item-card-description"><b>Melhorias:</b> '+descriptionText(d.upgrades)+'</div>':'')+img+
 '<div class="nex-item-card-description">'+descriptionText(d.description||'Sem descrição cadastrada.')+'</div>'+
 '<div class="nex-item-card-buttons"><button type="button" data-nex-item-remove="'+id+'" class="nex-item-remove">Remover</button>'+
 '<button type="button" data-nex-item-edit="'+id+'" class="nex-item-edit">Editar</button></div></div></details>';
}
// Usa o renderizador de inventário existente para preservar filtros, busca e contadores.
function enhance(){
 const list=by('inventoryList');if(!list)return;
 const ids=[...list.querySelectorAll('.nexv16-entry[data-item-id]')].map(e=>e.dataset.itemId);
 if(ids.length)list.innerHTML=ids.map(find).filter(Boolean).map(card).join('');
}
const priorRender=renderInventory;
renderInventory=function(){const result=priorRender.apply(this,arguments);enhance();return result;};
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-nex-item-edit],[data-nex-item-remove]');
 if(!button)return;
 if(button.dataset.nexItemEdit!==undefined){open(button.dataset.nexItemEdit);return}
 if(button.dataset.nexItemRemove!==undefined){
  const item=find(button.dataset.nexItemRemove);
  if(item&&confirm('Remover '+item.name+' do inventário?')){
   state.items=state.items.filter(x=>String(x.id)!==String(item.id));
   renderInventory();save();toast('Item removido.');
  }
 }
});
modal.addEventListener('click',event=>{
 if(event.target===modal||event.target.closest('.nex-editor-close,.nex-editor-cancel'))close();
});
by('nexEditorForm').addEventListener('submit',event=>{
 event.preventDefault();const item=find(current);if(!item)return;
 const values=Object.fromEntries([...by('nexEditorFields').querySelectorAll('[data-edit]')].map(el=>[el.dataset.edit,el.value]));
 if(!values.name?.trim()){toast('Informe o nome do item.');return}
 if(!cats.includes(values.category)){toast('Categoria inválida.');return}
 if(values.image&&!/^https:\/\//i.test(values.image)){toast('A imagem precisa de um endereço HTTPS.');return}
 const d={...detail(item),...values};
 d.name=String(d.name).trim().slice(0,100);
 d.quantity=Math.max(0,Math.min(9999,Math.trunc(number(d.quantity,1))));
 d.spaces=Math.max(0,Math.min(100,Math.round(number(d.spaces,1)*2)/2));
 d.description=String(d.description||'').slice(0,2500);
 d.upgrades=String(d.upgrades||'').slice(0,2500);
 item.name=d.name;item.category=d.category;item.quantity=d.quantity;item.spaces=d.spaces;item.nexInfo=d;
 item.description=d.description;
 item.detail=[d.description,d.category==='Arma'?'Dano: '+d.damage:'',d.category==='Arma'?'Crítico: '+d.critical+' ×'+d.multiplier:''].filter(Boolean).join(' · ').slice(0,2500);
 close();renderInventory();save();toast('Item atualizado.');
});
document.addEventListener('keydown',event=>{if(!modal.hidden&&event.key==='Escape'){event.preventDefault();close();}});
renderInventory();
window.NEX_ITEM_EDITOR={open,enhance};
})();