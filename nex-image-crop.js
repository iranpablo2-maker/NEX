/* Editor compartilhado de imagens do NEX: enquadramento, arrastar e zoom. */
(function(){
 'use strict';
 let busy=false;
 const css=document.createElement('style');
 css.textContent=`
 .nex-image-crop-dialog{border:1px solid #914251;border-radius:12px;background:#141114;color:#fff;padding:18px;width:min(95vw,570px);max-height:92vh;overflow:auto;box-shadow:0 24px 70px #000c}
 .nex-image-crop-dialog::backdrop{background:rgba(0,0,0,.84)}
 .nex-image-crop-dialog header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
 .nex-image-crop-dialog header h2{font-size:20px;margin:0;color:#fff}
 .nex-image-crop-dialog button{font:inherit;cursor:pointer;min-height:36px;padding:8px 14px;background:#292126;color:white;border:1px solid #61414a;border-radius:6px}
 .nex-image-crop-dialog button.primary{background:#b42f42;border-color:#d14658}
 .nex-image-crop-dialog .crop-stage{display:flex;justify-content:center;margin:10px 0;background:#09080a;border-radius:8px;padding:10px}
 .nex-image-crop-dialog canvas{display:block;max-width:100%;height:auto;touch-action:none;cursor:grab;background:#21191f;border:1px solid #4a353d}
 .nex-image-crop-dialog canvas:active{cursor:grabbing}
 .nex-image-crop-dialog label{display:block;margin:13px 0 5px;font-size:13px}
 .nex-image-crop-dialog input[type=range]{width:100%;accent-color:#d04155}
 .nex-image-crop-dialog .crop-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:16px;flex-wrap:wrap}
 .nex-image-crop-dialog .crop-hint{font-size:12px;color:#beb0b7;margin-top:6px}
 `;
 document.head.appendChild(css);
 function edit(file,settings={}){
  if(busy)return Promise.reject(new Error('Já existe uma imagem sendo editada.'));
  if(!file)return Promise.resolve(null);
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))return Promise.reject(new Error('Escolha uma imagem JPG, PNG ou WebP.'));
  if(file.size>12*1024*1024)return Promise.reject(new Error('Escolha uma imagem de até 12 MB.'));
  busy=true;
  return new Promise((resolve,reject)=>{
   const ratio=Math.max(.35,Math.min(3,Number(settings.aspectRatio)||1));
   const viewW=ratio>=1?480:Math.round(350*ratio);
   const viewH=Math.round(viewW/ratio);
   const modal=document.createElement('dialog');modal.className='nex-image-crop-dialog';
   modal.innerHTML='<header><h2>Editar '+(settings.label==='campanha'?'foto da campanha':'foto do personagem')+'</h2><button type="button" data-cancel aria-label="Fechar">×</button></header><div class="crop-stage"><canvas width="'+viewW+'" height="'+viewH+'" aria-label="Arraste a imagem para posicionar"></canvas></div><p class="crop-hint">Arraste a imagem para ajustar o enquadramento.</p><label for="nexSharedCropZoom">Zoom</label><input id="nexSharedCropZoom" type="range" min="1" max="3" step=".01" value="1"><div class="crop-actions"><button type="button" data-cancel>Cancelar</button><button type="button" class="primary" data-save>Salvar imagem</button></div>';
   document.body.appendChild(modal);
   const canvas=modal.querySelector('canvas'),ctx=canvas.getContext('2d'),zoomInput=modal.querySelector('input');
   let image=null,zoom=1,dx=0,dy=0,pointer=null,finished=false;
   const url=URL.createObjectURL(file);
   function finish(value,error){
    if(finished)return;finished=true;busy=false;
    URL.revokeObjectURL(url);
    if(modal.open)modal.close();
    modal.remove();
    if(error)reject(error);else resolve(value);
   }
   function draw(){
    if(!image)return;
    const scale=Math.max(viewW/image.naturalWidth,viewH/image.naturalHeight)*zoom;
    const w=image.naturalWidth*scale,h=image.naturalHeight*scale;
    dx=Math.max((viewW-w)/2,Math.min((w-viewW)/2,dx));
    dy=Math.max((viewH-h)/2,Math.min((h-viewH)/2,dy));
    ctx.fillStyle='#20191d';ctx.fillRect(0,0,viewW,viewH);
    ctx.drawImage(image,(viewW-w)/2+dx,(viewH-h)/2+dy,w,h);
   }
   modal.querySelectorAll('[data-cancel]').forEach(b=>b.onclick=()=>finish(null));
   modal.addEventListener('cancel',e=>{e.preventDefault();finish(null);});
   zoomInput.oninput=()=>{zoom=Number(zoomInput.value)||1;draw();};
   canvas.addEventListener('pointerdown',e=>{if(!image)return;pointer={id:e.pointerId,x:e.clientX,y:e.clientY,dx,dy};canvas.setPointerCapture(e.pointerId);});
   canvas.addEventListener('pointermove',e=>{if(!pointer||pointer.id!==e.pointerId)return;const r=canvas.getBoundingClientRect();dx=pointer.dx+(e.clientX-pointer.x)*viewW/r.width;dy=pointer.dy+(e.clientY-pointer.y)*viewH/r.height;draw();});
   canvas.addEventListener('pointerup',()=>pointer=null);
   canvas.addEventListener('pointercancel',()=>pointer=null);
   modal.querySelector('[data-save]').onclick=()=>{
    if(!image)return;
    try{
     draw();
     let outW=Math.max(100,Math.round(Number(settings.width)||360)),outH=Math.max(100,Math.round(outW/ratio));
     const maxChars=Number(settings.maxLength)||115000;
     let result='';
     for(let scale=1;scale>=.32;scale*=.8){
      const output=document.createElement('canvas');output.width=Math.round(outW*scale);output.height=Math.round(outH*scale);
      output.getContext('2d').drawImage(canvas,0,0,output.width,output.height);
      for(const quality of [.82,.7,.57,.42]){
       result=output.toDataURL('image/jpeg',quality);
       if(result.length<=maxChars){finish(result);return;}
      }
     }
     throw new Error('A imagem ficou muito grande. Escolha uma foto menor.');
    }catch(err){finish(null,err);}
   };
   const img=new Image();
   img.onload=()=>{if(finished)return;image=img;draw();modal.showModal();};
   img.onerror=()=>finish(null,new Error('Não foi possível abrir a imagem.'));
   img.src=url;
  });
 }
 window.NEX_IMAGE_CROP={edit};
})();
