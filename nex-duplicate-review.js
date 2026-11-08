/* NEX 2.0.46 — análise manual de fichas repetidas com proteção de dados. */
(()=>{
 'use strict';
 const by=id=>document.getElementById(id);
 const mount=by('nexDuplicateReview');
 const bridge=()=>window.NEX_DUPLICATES_BRIDGE;
 if(!mount)return;
 const cleanName=name=>String(name||'Personagem sem nome').replace(/(?:\s*\((?:vers[aã]o preservada|c[oó]pia)\))+\s*$/ig,'').trim()||'Personagem sem nome';
 const escape=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[ch]));
 const clone=x=>JSON.parse(JSON.stringify(x));
 const normalized=x=>{const data=clone(x.data||{});data.name=cleanName(data.name);return data;};
 const signature=x=>JSON.stringify(normalized(x));
 const key=x=>[cleanName(x.data?.name).toLocaleLowerCase('pt-BR'),x.data?.class||'',x.data?.origin||''].join('\u0001');
 const prettyDate=x=>{try{const d=new Date(x);return Number.isNaN(d.getTime())?'—':d.toLocaleString('pt-BR');}catch{return '—';}};
 const label=a=>String(a.data?.name||'Personagem sem nome');
 const details=(a,reference)=>{
   const d=a.data||{},r=reference.data||{};
   const changed=[...new Set([...Object.keys(d),...Object.keys(r)])].filter(k=>k!=='name'&&JSON.stringify(d[k])!==JSON.stringify(r[k]));
   return changed.length?'Diferenças: '+changed.slice(0,13).join(', ')+(changed.length>13?' e mais '+(changed.length-13):''):'Mesmo conteúdo, desconsiderando o sufixo do nome.';
 };
 let groups=[],snapshot=new Map(),backupReady=false;
 function collect(){
   const b=bridge();if(!b?.ready())return null;
   const all=b.read().agents||[];
   const bucket=new Map();
   all.forEach(a=>{if(!a?.id||!a.data)return;const k=key(a);if(!bucket.has(k))bucket.set(k,[]);bucket.get(k).push(a);});
   groups=[...bucket.values()].filter(items=>items.length>1).map(items=>items.sort((a,b)=>{const aCopy=/\(vers[aã]o preservada\)/i.test(a.data?.name||'')?1:0,bCopy=/\(vers[aã]o preservada\)/i.test(b.data?.name||'')?1:0;return aCopy-bCopy||((Date.parse(a.createdAt)||0)-(Date.parse(b.createdAt)||0));}));
   snapshot=new Map(all.map(a=>[a.id,JSON.stringify(a)]));
   return all;
 }
 function redraw(){
   backupReady=false;
   const all=collect();
   if(!all){mount.innerHTML='<p>Preparando as fichas locais…</p>';return;}
   if(!groups.length){
     mount.innerHTML='<p style="color:#b6c2ce">Nenhum grupo de nomes repetidos foi encontrado. Nenhuma ficha foi alterada.</p>';
     return;
   }
   let html='<p style="color:#ccd3dc">Foram encontrados <strong>'+groups.length+'</strong> grupo(s) de possíveis cópias. Confirme os dados antes de escolher. Nomes repetidos não significam fichas idênticas.</p>';
   html+=groups.map((items,i)=>{
     const base=items[0],identical=items.every(x=>signature(x)===signature(base));
     return '<section style="border:1px solid #41454d;border-radius:10px;margin:12px 0;padding:12px;background:#101316">'+
      '<h4 style="margin:0 0 6px">'+escape(cleanName(base.data?.name))+' <small style="font-weight:normal;color:#b5a5aa">· '+items.length+' fichas · '+(identical?'mesmos dados':'conteúdos diferentes')+'</small></h4>'+
      items.map((a,j)=>{
       const changed=signature(a)!==signature(base);
       return '<label style="display:flex;align-items:flex-start;gap:10px;padding:10px 4px;border-top:1px solid #30353a;cursor:pointer">'+
        '<input type="checkbox" data-nex-duplicate-id="'+escape(a.id)+'" data-nex-group="'+i+'" style="margin-top:5px;flex:none" aria-label="Selecionar '+escape(label(a))+' para exclusão">'+
        '<span style="min-width:0;overflow-wrap:anywhere"><strong>'+escape(label(a))+'</strong>'+
        '<small style="display:block;color:#bac2cc">Classe: '+escape(a.data?.class||'—')+' · Origem: '+escape(a.data?.origin||'—')+' · NEX '+escape(a.data?.nex??'—')+'%'+
        ' · Criada: '+escape(prettyDate(a.createdAt))+' · Alterada: '+escape(prettyDate(a.updatedAt))+'</small>'+
        '<small style="display:block;color:'+(changed?'#ffc48c':'#8fdfb1')+'">'+escape(details(a,base))+'</small>'+
        (j===0?'<small style="display:block;color:#d9d3ac">Primeira ficha registrada neste grupo (não é garantia de original).</small>':'')+
        '</span></label>';
      }).join('')+'</section>';
   }).join('');
   html+='<p style="font-size:12px;color:#ffce9a">Nenhuma opção vem marcada. É obrigatório manter pelo menos uma ficha de cada grupo. Não existe remoção automática.</p>'+
    '<button class="btn sm" type="button" id="nexDuplicateSelectIdentical">Selecionar apenas cópias idênticas</button> '+
    '<button class="btn primary sm" type="button" id="nexDuplicateDownload">1. Baixar backup completo</button>'+
    '<label style="display:block;margin-top:12px"><input id="nexDuplicateConfirmed" type="checkbox" disabled> Confirmei que o arquivo JSON do backup foi salvo no meu dispositivo.</label>'+
    '<label style="display:block;margin:12px 0">2. Para excluir as fichas marcadas, digite <strong>EXCLUIR</strong>: <input id="nexDuplicatePhrase" type="text" autocomplete="off" placeholder="EXCLUIR" style="max-width:150px"></label>'+
    '<button type="button" class="btn sm" id="nexDuplicateRemove" disabled>Excluir somente as fichas selecionadas</button> '+
    '<button type="button" class="btn sm" id="nexDuplicateRefresh">Atualizar análise</button>'+
    '<p id="nexDuplicateFeedback" role="status" style="color:#ffd2a9;margin-top:10px"></p>';
   mount.innerHTML=html;
   const selected=()=>[...mount.querySelectorAll('[data-nex-duplicate-id]:checked')].map(el=>el.dataset.nexDuplicateId);
   const feedback=msg=>by('nexDuplicateFeedback').textContent=msg;
   const update=()=>{by('nexDuplicateRemove').disabled=!(backupReady&&by('nexDuplicateConfirmed').checked&&by('nexDuplicatePhrase').value==='EXCLUIR'&&selected().length);};
   mount.querySelectorAll('input').forEach(el=>el.addEventListener('change',update));
   by('nexDuplicatePhrase').addEventListener('input',update);
   by('nexDuplicateRefresh').onclick=redraw;
   by('nexDuplicateSelectIdentical').onclick=()=>{
     // Só marca a segunda versão quando o conteúdo é exatamente o mesmo,
     // ignorando os sufixos adicionados pela antiga sincronização.
     const duplicates=new Set();
     for(const group of groups){
       const seen=new Set();
       for(const a of group){
         const id=signature(a);
         if(seen.has(id))duplicates.add(a.id);else seen.add(id);
       }
     }
     mount.querySelectorAll('[data-nex-duplicate-id]').forEach(el=>{
       el.checked=duplicates.has(el.dataset.nexDuplicateId);
     });
     feedback(duplicates.size?duplicates.size+' cópia(s) idêntica(s) selecionada(s). Confira antes de excluir.':'Não há cópias com conteúdo idêntico para selecionar.');
     update();
   };
   by('nexDuplicateDownload').onclick=()=>{
     try {window.NEX17.backupAll(); backupReady=true;by('nexDuplicateConfirmed').disabled=false;feedback('Verifique se o navegador baixou o arquivo JSON completo. Depois marque a confirmação.');update();}
     catch(e){feedback('Não foi possível preparar o backup. Nenhuma exclusão será liberada.');}
   };
   by('nexDuplicateRemove').onclick=()=>{
     const ids=selected();
     if(!ids.length||!backupReady||!by('nexDuplicateConfirmed').checked||by('nexDuplicatePhrase').value!=='EXCLUIR')return;
     for(const group of groups){
       if(group.every(a=>ids.includes(a.id))){feedback('Seleção bloqueada: preserve pelo menos uma ficha de cada grupo.');return;}
     }
     if(!window.confirm('Excluir somente '+ids.length+' ficha(s) selecionada(s) deste navegador? A recuperação dependerá do backup JSON.'))return;
     try{
       const expected=ids.map(id=>({id,fingerprint:snapshot.get(id)}));
       bridge().remove(expected);
       redraw();
       const notice=document.createElement('p');notice.style.color='#8fdfb1';notice.textContent=ids.length+' ficha(s) selecionada(s) removida(s). As demais foram mantidas.';
       mount.prepend(notice);
     }catch(e){feedback('Não foi possível excluir: '+String(e.message||e)+'. Atualize a análise e mantenha o backup.');}
   };
 }
 by('nexDuplicateToggle').addEventListener('click',()=>{
   const open=mount.hidden;mount.hidden=!open;
   by('nexDuplicateToggle').setAttribute('aria-expanded',String(open));
   if(open)redraw();
 });
})();