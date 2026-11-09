/* NEX: catálogo de equipamentos em janela modal. */
(function(){
'use strict';
const by=id=>document.getElementById(id);
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
const sources=['Itens','Itens Homebrew'];
const sections=['Armas','Munições','Proteções','Geral','Itens Amaldiçoados'];
const mapCategory={'Armas':'Arma','Munições':'Munição','Proteções':'Proteção','Geral':'Geral','Itens Amaldiçoados':'Item Amaldiçoado'};
const items=[];
function put(name,section,description,stats,spaces){
 if(items.some(x=>norm(x.name)===norm(name)&&x.section===section))return;
 items.push({name,section,description:String(description||''),stats:stats||[],spaces:spaces||1});
}
put('Acha','Armas','Arma tática · Corpo a corpo · Duas mãos',[['Categoria','I'],['Dano','1d12'],['Crítico','×3'],['Tipo','Corte'],['Espaços','2']],2);
put('Arco','Armas','Arma simples · Disparo · Duas mãos',[['Categoria','0'],['Dano','1d6'],['Crítico','×3'],['Alcance','Médio'],['Tipo','Perfuração'],['Espaços','2'],['Munição','Flechas']],2);
put('Arco Composto','Armas','Arma tática · Disparo · Duas mãos',[['Categoria','I'],['Dano','1d10'],['Crítico','×3'],['Alcance','Médio'],['Tipo','Perfuração'],['Espaços','2'],['Munição','Flechas']],2);
put('Balestra','Armas','Arma tática · Disparo · Duas mãos',[['Categoria','I'],['Dano','1d12'],['Crítico','19'],['Alcance','Médio'],['Tipo','Perfuração'],['Espaços','2'],['Munição','Flechas']],2);
put('Bastão','Armas','Arma simples · Corpo a corpo · Uma mão',[['Categoria','0'],['Dano','1d6/1d8'],['Crítico','×2'],['Tipo','Impacto'],['Espaços','1']],1);
const basic={
 Armas:['Adaga','Machadinha','Facão','Martelo','Espada','Lança','Cutelo','Revólver','Pistola','Espingarda','Rifle','Submetralhadora','Fuzil','Metralhadora'],
 Munições:['Balas curtas','Balas longas','Cartuchos','Flechas'],
 Proteções:['Proteção Leve','Proteção Pesada','Escudo'],
 Geral:['Algemas','Lanterna','Mochila','Binóculos','Corda','Kit de Medicina','Kit de Tecnologia','Componentes Ritualísticos','Rádio','Ferramentas','Câmera','Pé de Cabra']
};
for(const [section,names] of Object.entries(basic)){if(section==='Armas'||section==='Munições')continue;for(const name of names)put(name,section,'Detalhes a conferir no livro de regras.',[],1);}
for(const model of (typeof NEX12_CATALOG!=='undefined'?NEX12_CATALOG:[])){
 const name=model[0],kind=String(model[1]||''),desc=String(model[2]||'');
 const slug=norm(kind+' '+desc);
 const section=slug.includes('amaldicoado')?'Itens Amaldiçoados':slug.includes('municao')?'Munições':slug.includes('protecao')?'Proteções':slug.includes('arma')?'Armas':'Geral';
 const m=desc.match(/(?:espaços?)\s*:?\s*(\d+)|(\d+)\s*espaços?/i);
 const spaces=m?Number(m[1]||m[2]):1;
 const existing=items.find(x=>norm(x.name)===norm(name)&&x.section===section);
 if(existing){if(existing.description.startsWith('Detalhes a conferir'))existing.description=desc;continue}
 put(name,section,kind+'. '+desc,[['Espaços',String(spaces)]],spaces);
}
for(const record of [...(window.NEX_ITEM_BOOKS||[]),...(window.NEX_BASE_WEAPONS||[]),...(window.NEX_ITEM_COMPLEMENTS?.items||[])]){
 const item={name:record.name,section:record.section,description:record.description||'',stats:record.stats||[],spaces:record.spaces??1,source:record.source||'Livro de regras'};
 const existing=items.find(x=>norm(x.name)===norm(item.name)&&x.section===item.section);
 if(existing)Object.assign(existing,item);
 else items.push(item);
}
// Descrições curtas e originais, sem copiar passagens longas dos livros.
const bookDescriptions=window.NEX_ITEM_COMPLEMENTS?.descriptions||{};
for(const item of items){
 const key=Object.keys(bookDescriptions).find(k=>norm(k)===norm(item.name));
 if(key)item.description=bookDescriptions[key];
 if(!item.description||/detalhes a conferir|preencher após consultar|equipamento listado na tabela|estatísticas de jogo conforme a tabela|item amaldiçoado listado na tabela/i.test(item.description)){
  item.description=(item.subtitle||'Equipamento do RPG')+'. '+(item.stats.length?'Consulte os valores informados no cartão.':'Consulte os efeitos com o mestre.');
 }
}
items.sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
function homebrewItems(){
 const fromLibrary=typeof window.NEX51?.readLibrary==='function'?window.NEX51.readLibrary():[];
 const fromSheet=Array.isArray(state?.nex51Items)?state.nex51Items:[];
 const dedup=new Map();
 for(const record of [...fromLibrary,...fromSheet]){
  if(!record||record.type!=='item'||!record.name)continue;
  if(record.id&&dedup.has(record.id))continue;
  const category=String(record.category||'Geral');
  const section=/amaldiçoad/i.test(category)?'Itens Amaldiçoados':/muniç/i.test(category)?'Munições':/proteç/i.test(category)?'Proteções':/arma/i.test(category)?'Armas':'Geral';
  dedup.set(record.id||record.name,{id:record.id,name:String(record.name),section,
   source:'Itens Homebrew',isHomebrew:true,
   subtitle:'Homebrew · '+category,
   description:String(record.description||'Item criado na biblioteca de homebrews.'),
   spaces:Number.isFinite(Number(record.spaces))?Number(record.spaces):1,
   stats:[['Categoria',category],['Origem','Homebrew']]});
 }
 return [...dedup.values()].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
}
const style=document.createElement('style');
style.id='nex-item-modal-styles';
style.textContent=[
'#sheetScreen .nexv16-catalog{display:none!important}',
'#sheetScreen #n16ItemFilters{display:flex!important;flex-wrap:wrap;overflow:visible;gap:7px;margin:10px 0 14px}',
'#sheetScreen #n16ItemFilters button{font-size:12px;padding:8px 12px}',
'#nexItemModal .nex-item-dialog{height:min(680px,calc(100dvh - 30px))!important;max-height:calc(100dvh - 30px)!important;min-height:0!important;overflow:hidden!important}',
'#nexItemModal .nex-item-top{flex:0 0 auto!important}',
'#nexItemModal .nex-item-tabs{display:flex!important;flex:0 0 auto!important;min-height:44px!important;overflow-x:auto!important;overflow-y:hidden!important}',
'#nexItemModal .nex-item-tab{display:inline-flex!important;align-items:center!important;min-height:42px!important;flex-shrink:0!important}',
'#nexItemModal .nex-item-category-label{flex:0 0 auto!important;min-height:28px!important}',
'#nexItemModal .nex-item-categories{display:flex!important;flex:0 0 auto!important;align-items:center!important;flex-wrap:wrap!important;min-height:44px!important;overflow:visible!important;gap:8px!important;padding:5px 18px 11px!important}',
'#nexItemModal .nex-item-category-button{display:inline-flex!important;align-items:center!important;flex:0 0 auto!important;min-height:30px!important;line-height:16px!important}',
'#nexItemModal .nex-item-search-wrap{flex:0 0 auto!important;min-height:58px!important;padding:8px 16px!important}',
'#nexItemModal .nex-item-results{flex:1 1 0%!important;min-height:0!important;overflow-y:auto!important}',
'#nexItemModal .nex-item-footer{flex:0 0 auto!important}',
'@media(max-width:600px){#nexItemModal .nex-item-dialog{height:calc(100dvh - 8px)!important;max-height:calc(100dvh - 8px)!important}#nexItemModal .nex-item-categories{gap:5px!important;padding:5px 10px 9px!important}#nexItemModal .nex-item-category-button{padding:6px 8px!important;font-size:11px!important}}',
'#nexItemModal[hidden]{display:none!important}',
'#nexItemModal{position:fixed;inset:0;z-index:100030;display:grid;place-items:center;padding:12px;background:#000c;color:#fff;font-family:Arial,system-ui,sans-serif}',
'#nexItemModal *{box-sizing:border-box}',
'#nexItemModal .nex-item-dialog{width:min(960px,100%);max-height:87vh;background:#201f20;border-radius:4px;display:flex;flex-direction:column;box-shadow:0 20px 70px #000d}',
'#nexItemModal .nex-item-top{display:flex;justify-content:space-between;align-items:center;padding:20px 18px 11px}',
'#nexItemModal h2{font:bold 24px Arial,sans-serif;text-transform:none;letter-spacing:0;color:#fff}',
'#nexItemModal .nex-item-close{background:none;border:0;color:#fff;font-size:30px;line-height:1}',
'#nexItemModal .nex-item-tabs{display:flex;gap:23px;overflow-x:auto;white-space:nowrap;padding:0 18px;border-bottom:1px solid #414141}',
'#nexItemModal .nex-item-tab{background:none;color:#c2bac8;border:0;border-bottom:2px solid transparent;padding:12px 0;font-size:14px}',
'#nexItemModal .nex-item-tab[aria-selected="true"]{color:#fff;border-bottom-color:#aa39ef}',
'#nexItemModal .nex-item-category-label{padding:11px 18px 0;color:#bd9bcd;font-size:11px;letter-spacing:.07em;font-weight:700}',
'#nexItemModal .nex-item-categories{display:flex;gap:10px;overflow-x:auto;white-space:nowrap;padding:7px 18px 10px;scrollbar-width:thin}',
'#nexItemModal .nex-item-category-button{border:1px solid #55415f;border-radius:3px;color:#d7c4e4;background:#181519;padding:7px 12px;font-size:12px}',
'#nexItemModal .nex-item-category-button[aria-selected="true"]{border-color:#bd53ff;background:#7633a0;color:#fff}',
'#nexItemModal .nex-item-search-wrap{padding:14px 16px 9px}',
'#nexItemModal #nexItemModalSearch{width:100%;border:0;border-radius:3px;background:#101010;color:#fff;height:42px;padding:8px 13px;font-size:16px}',
'#nexItemModal .nex-item-results{overflow-y:auto;flex:1;min-height:180px;padding:6px 16px 18px;overscroll-behavior:contain}',
'#nexItemModal .nex-item-footer{border-top:1px solid #3c3a40;padding:9px 16px;display:flex;justify-content:flex-end}',
'#nexItemModal .nex-item-custom{padding:8px 13px;border:1px solid #8744b1;background:transparent;color:#ddd;border-radius:3px;cursor:pointer}',
'#nexItemModal .nex-item-card{margin-bottom:8px;background:#161616;border-radius:4px;overflow:hidden}',
'#nexItemModal .nex-item-card-header{display:grid;grid-template-columns:38px minmax(0,1fr) 45px;gap:10px;align-items:center;padding:9px 10px;min-height:67px}',
'#nexItemModal .nex-item-expand{border:0;background:none;color:#ad42f9;font-size:23px;cursor:pointer}',
'#nexItemModal .nex-item-name{font-size:18px;font-weight:750;color:#fff}',
'#nexItemModal .nex-item-desc{font-size:10px;font-style:italic;font-weight:bold;color:#ddd;margin-left:7px}',
'#nexItemModal .nex-item-meta{margin-top:7px;display:flex;gap:5px 14px;flex-wrap:wrap;font-size:12px}',
'#nexItemModal .nex-item-meta b{color:#b947f4;font-weight:normal}',
'#nexItemModal .nex-item-plus{width:35px;height:35px;background:#a634ef;color:#fff;border:0;border-radius:2px;font-size:27px;cursor:pointer}',
'#nexItemModal .nex-item-detail{font-size:12px;color:#ddd;padding:5px 16px 16px 60px;line-height:1.5}',
'#nexItemModal .nex-item-detail[hidden]{display:none}',
'#nexItemModal .nex-item-empty{color:#bbb;padding:24px;text-align:center}',
'body.nex-item-modal-open{overflow:hidden}',
'@media(max-width:600px){#nexItemModal{padding:4px}#nexItemModal .nex-item-dialog{max-height:98dvh}#nexItemModal h2{font-size:20px}#nexItemModal .nex-item-tabs{gap:17px;padding:0 12px}#nexItemModal .nex-item-card-header{grid-template-columns:28px minmax(0,1fr) 38px;gap:5px}#nexItemModal .nex-item-name{font-size:15px}#nexItemModal .nex-item-desc{display:block;margin:3px 0 0}#nexItemModal .nex-item-meta{font-size:11px;gap:4px 8px}#nexItemModal .nex-item-detail{padding-left:38px}}'
].join('\n');
document.head.appendChild(style);
const modal=document.createElement('div');modal.id='nexItemModal';modal.hidden=true;
modal.innerHTML='<section class="nex-item-dialog" role="dialog" aria-modal="true" aria-labelledby="nexItemModalTitle">'+
'<div class="nex-item-top"><h2 id="nexItemModalTitle">Adicionar Itens</h2><button class="nex-item-close" type="button" aria-label="Fechar">×</button></div>'+
'<div class="nex-item-tabs" role="tablist" aria-label="Tipo de item">'+sources.map((c,i)=>'<button type="button" class="nex-item-tab" role="tab" data-source="'+escape(c)+'" aria-selected="'+String(i===0)+'">'+escape(c)+'</button>').join('')+'</div>'+ 
'<div class="nex-item-category-label">CATEGORIAS</div>'+ 
'<div class="nex-item-categories" role="tablist" aria-label="Categorias de itens">'+sections.map((c,i)=>'<button type="button" class="nex-item-category-button" role="tab" data-cat="'+escape(c)+'" aria-selected="'+String(i===0)+'">'+escape(c)+'</button>').join('')+'</div>'+ 
'<div class="nex-item-search-wrap"><input type="search" id="nexItemModalSearch" placeholder="⌕  Buscar" aria-label="Buscar itens"></div>'+
'<div id="nexItemModalResults" class="nex-item-results" aria-live="polite"></div>'+ 
'<div class="nex-item-footer"><button type="button" class="nex-item-custom">+ Criar item personalizado</button></div></section>';
document.body.appendChild(modal);
const search=by('nexItemModalSearch'),results=by('nexItemModalResults');
const originalAddItem=by('addItem')?.onclick;
let selectedSource='Itens',selected='Armas',lastFocus=null,renderedItems=[];
function render(){
 modal.querySelectorAll('[data-source]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.source===selectedSource)));
 modal.querySelectorAll('[data-cat]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.cat===selected)));
 const term=norm(search.value.trim());
 const visible=selectedSource==='Itens'?items:homebrewItems();
 const list=visible.filter(i=>i.section===selected&&norm([i.name,i.description,i.subtitle,i.source,...i.stats.map(s=>s.join(' '))].join(' ')).includes(term));
 renderedItems=list;
 results.innerHTML=list.length?list.map(item=>{
   const index=list.indexOf(item);
   return '<article class="nex-item-card" data-item-index="'+index+'"><div class="nex-item-card-header">'+
   '<button type="button" class="nex-item-expand" data-expand="'+index+'" aria-expanded="false" aria-label="Detalhes do item">⌄</button>'+
   '<div><span class="nex-item-name">'+escape(item.name)+'</span><span class="nex-item-desc">'+escape(item.subtitle||item.source||'Item')+'</span>'+
   '<div class="nex-item-meta">'+(item.stats.length?item.stats.map(m=>'<span><b>'+escape(m[0])+':</b> '+escape(m[1])+'</span>').join(''):'<span><b>Espaços:</b> '+item.spaces+'</span>')+'</div></div>'+
   '<button type="button" class="nex-item-plus" data-add="'+index+'" aria-label="Adicionar '+escape(item.name)+'">+</button></div>'+
   '<div class="nex-item-detail" hidden>'+escape((item.source?item.source+' · ':'')+(item.description||'Confira as estatísticas nas regras do livro.'))+'</div></article>';
 }).join(''):'<div class="nex-item-empty">'+(selectedSource==='Itens Homebrew'?'Nenhum item homebrew nesta categoria. Cadastre um na biblioteca Homebrew.':'Nenhum item encontrado nesta categoria.')+'</div>';
}
function open(){lastFocus=document.activeElement;selectedSource='Itens';selected='Armas';search.value='';render();modal.hidden=false;document.body.classList.add('nex-item-modal-open');search.focus();}
function close(){modal.hidden=true;document.body.classList.remove('nex-item-modal-open');lastFocus?.focus?.();}
function add(index){
 const item=renderedItems[index];if(!item)return;
 if(!Array.isArray(state.items))state.items=[];
 if(state.items.length>=100){toast('Limite de 100 itens no inventário.');return;}
 state.items.push({id:'nexitem_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6),name:item.name,quantity:1,category:mapCategory[item.section],spaces:item.spaces,detail:[item.description,...item.stats.map(m=>m.join(': '))].filter(Boolean).join(' · ').slice(0,2000)});
 renderInventory();save();toast(item.name+' adicionado ao inventário.');
}
modal.addEventListener('click',event=>{
 if(event.target===modal){close();return;}
 const button=event.target.closest('button');if(!button)return;
 if(button.classList.contains('nex-item-close')){close();return;}
 if(button.classList.contains('nex-item-custom')){close();if(typeof originalAddItem==='function')originalAddItem.call(by('addItem'),event);else{state.items.push({id:'manual_'+Date.now(),name:'Novo item',quantity:1,spaces:1,category:'Geral',detail:''});renderInventory();save();}return;}
 if(button.dataset.source){selectedSource=button.dataset.source;search.value='';render();return;}
 if(button.dataset.cat){selected=button.dataset.cat;search.value='';render();return;}
 if(button.dataset.add!==undefined){add(Number(button.dataset.add));return;}
 if(button.dataset.expand!==undefined){
  const card=button.closest('.nex-item-card'),detail=card.querySelector('.nex-item-detail');
  detail.hidden=!detail.hidden;button.setAttribute('aria-expanded',String(!detail.hidden));
 }
});
search.addEventListener('input',render);
document.addEventListener('keydown',event=>{
 if(modal.hidden)return;
 if(event.key==='Escape'){event.preventDefault();close();return;}
 if(event.key==='Tab'){
  const focusable=[...modal.querySelectorAll('button:not([disabled]),input:not([disabled])')].filter(x=>x.offsetParent!==null);
  if(!focusable.length)return;
  const first=focusable[0],last=focusable[focusable.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 }
});
const addButton=by('addItem');
if(addButton){addButton.onclick=event=>{event.preventDefault();event.stopPropagation();open();};addButton.textContent='+ Adicionar';}
window.NEX_ITEM_CATALOG={open,close};
})();
