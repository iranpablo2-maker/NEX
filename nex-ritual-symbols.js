/* NEX — Vinculação dos símbolos de rituais enviados pelo usuário. Assets em assets/rituais/. */
(function(){
'use strict';
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
const imgFor=(name,element,cls)=>{const src=symbol(name,element);if(!src)return null;const img=document.createElement('img');img.className=cls;img.alt='Símbolo do ritual '+name;img.loading='lazy';img.src=src;img.onerror=()=>img.remove();img.dataset.nexSymbol='true';return img;};
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
