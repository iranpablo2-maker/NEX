/* NEX — Vinculação dos símbolos de rituais enviados pelo usuário. Assets em assets/rituais/. */
(function(){
'use strict';
// Miniaturas compactas dos símbolos originais enviados (60 máscaras a 24×24).
// Incorporadas ao JavaScript para dispensar arquivos binários externos.
const INLINE_SYMBOL_NAMES=["alterar-memoria","amaldicoar-arma-com-morte","amaldicoar-arma-com-sangue","amaldicoar-tecnologia","ancora-temporal","aprimoramento-mental","armadura-de-sangue","chamas-do-caos","cicatrizacao","cineraria","coincidencia-forcada","compreensao-paranormal","consumir-manacial","contato-paranormal","controle-mental-absorcao","controle-mental-emissao","convocacao-instantanea","corpo-adaptado","decadencia","definhar","desacelerar-impacto","descarnar","distorcao-temporal","distorcer-aparencia","eco-espiral","eletrocussao","enfeiticar","esconder-dos-olhos","espirais-da-perdicao","fisico-aprimorado","forma-monstruosa","fortalecimento-sensorial","hemofagia","inexistir","involucro-de-carne","ligacao-telepatica-absorcao","ligacao-telepatica-emissao","localizacao","luz","mergulho-mental","miasma-entropico","nuvem-de-cinzas","odio-incontrolavel","ouvir-os-surrurros","paradoxo","polarizacao-caotica","possessao","rejeitar-nevoa","salto-fantasma","sopro-do-caos","tela-de-ruido","teletransporte","terceiro-olho","transfigurar-agua","transfusao-vital","velocidade-mortal","vinculo-de-sangue-1","vinculo-de-sangue-2","vomitar-pestes","zerar-entropia"];
const INLINE_SYMBOL_PACK="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";
const inlineSymbols=(async()=>{
 const compressed=Uint8Array.from(atob(INLINE_SYMBOL_PACK),x=>x.charCodeAt(0));
 const stream=new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate'));
 const raw=new Uint8Array(await new Response(stream).arrayBuffer());
 const result=new Map(),size=24,bytesPerIcon=72;
 for(let i=0;i<INLINE_SYMBOL_NAMES.length;i++){
  const canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';
  for(let pixel=0;pixel<size*size;pixel++){
   const b=raw[i*bytesPerIcon+(pixel>>3)];
   if((b>>(7-(pixel&7)))&1)ctx.fillRect(pixel%size,Math.floor(pixel/size),1,1);
  }
  result.set(INLINE_SYMBOL_NAMES[i],canvas.toDataURL('image/png'));
 }
 return result;
})().catch(error=>{console.warn('Miniaturas de rituais indisponíveis',error);return new Map()});

const NAMES=new Set(["alterar-memoria","amaldicoar-arma-com-morte","amaldicoar-arma-com-sangue","amaldicoar-tecnologia","aprimoramento-mental","armadura-de-sangue","chamas-do-caos","cicatrizacao","cineraria","coincidencia-forcada","compreensao-paranormal","consumir-manacial","contato-paranormal","controle-mental-absorcao","controle-mental-emissao","convocacao-instantanea","corpo-adaptado","decadencia","definhar","desacelerar-impacto","descarnar","distorcer-aparencia","distorcao-temporal","eco-espiral","eletrocussao","enfeiticar","esconder-dos-olhos","espirais-da-perdicao","forma-monstruosa","fortalecimento-sensorial","fisico-aprimorado","hemofagia","inexistir","involucro-de-carne","ligacao-telepatica-absorcao","ligacao-telepatica-emissao","localizacao","luz","mergulho-mental","miasma-entropico","nuvem-de-cinzas","ouvir-os-surrurros","paradoxo","polarizacao-caotica","possessao","rejeitar-nevoa","salto-fantasma","sopro-do-caos","tela-de-ruido","teletransporte","terceiro-olho","transfigurar-agua","transfusao-vital","velocidade-mortal","vomitar-pestes","vinculo-de-sangue-1","vinculo-de-sangue-2","zerar-entropia","ancora-temporal","odio-incontrolavel"]);
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function symbol(name,element){
 let key=norm(name),el=norm(element);
 if(key==='aprimorar-mente')key='aprimoramento-mental';
 if(key==='aprimorar-fisico')key='fisico-aprimorado';
 if(key==='ouvir-os-sussurros')key='ouvir-os-surrurros';
 if(key==='amaldicoar-arma')key='amaldicoar-arma-com-'+el;
 if(key==='vinculo-de-sangue')key='vinculo-de-sangue-1';
 if(!NAMES.has(key))return '';
 return 'assets/rituais/'+key+'.png';
}
window.NEX_RITUAL_SYMBOL_URL=symbol;
const style=document.createElement('style');
style.textContent='.nex-symbol-thumb{width:36px;height:36px;object-fit:contain;flex:none;margin-left:4px}.nex-symbol-large{max-width:118px;max-height:118px;float:right;object-fit:contain;margin:0 0 10px 12px}.nex-ritual-option .nex-symbol-thumb{width:38px;height:38px}';
document.head.appendChild(style);
const imgFor=(name,element,cls)=>{
 const src=symbol(name,element);if(!src)return null;
 const key=src.split('/').pop().replace(/\.png$/,'');
 const img=document.createElement('img');img.className=cls;img.alt='Símbolo do ritual '+name;img.loading='lazy';img.dataset.nexSymbol='true';
 inlineSymbols.then(map=>{if(map.has(key))img.src=map.get(key);else {img.src=src;img.onerror=()=>img.remove();}});
 return img;
};
function apply(){
 const list=document.getElementById('ritualList');
 if(list)for(const card of list.querySelectorAll('.nex-ritual-card')){
  if(card.dataset.nexSymbolDone)continue;
  card.dataset.nexSymbolDone='1';
  const title=card.querySelector('summary strong'),pill=card.querySelector('.nex-ritual-pill'),detail=card.querySelector('.nex-ritual-detail');
  if(!title||!pill)continue;
  const m=pill.textContent.match(/(Conhecimento|Energia|Morte|Sangue|Medo)/i),element=m?.[1]||'';
  const thumb=imgFor(title.textContent,element,'nex-symbol-thumb');
  if(thumb)title.after(thumb);
  const big=imgFor(title.textContent,element,'nex-symbol-large');
  if(big&&detail)detail.prepend(big);
 }
 const choices=document.getElementById('nexRitualChoices');
 if(choices)for(const item of choices.querySelectorAll('.nex-ritual-option')){
  if(item.dataset.nexSymbolDone)continue;
  item.dataset.nexSymbolDone='1';
  const strong=item.querySelector('strong'),small=item.querySelector('small');
  if(!strong)continue;
  const m=(small?.textContent||'').match(/(Conhecimento|Energia|Morte|Sangue|Medo)/i);
  const img=imgFor(strong.textContent,m?.[1]||'','nex-symbol-thumb');
  if(img)item.prepend(img);
 }
}
let pending=false;
const refresh=()=>{if(pending)return;pending=true;queueMicrotask(()=>{pending=false;apply()})};
const mo=new MutationObserver(refresh);
function start(){for(const id of ['ritualList','nexRitualChoices']){const root=document.getElementById(id);if(root)mo.observe(root,{childList:true,subtree:true})}apply();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
