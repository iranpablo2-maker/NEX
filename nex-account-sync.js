/* NEX Contas: login seguro e sincronização por usuário; o armazenamento local continua independente. */
import {initializeApp,getApps} from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js';
import {getAuth,onAuthStateChanged,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,sendPasswordResetEmail,GoogleAuthProvider,signInWithPopup,updateProfile} from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js';
import {getFirestore,collection,doc,getDocs,setDoc,serverTimestamp} from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js';
const cfg=window.NEX_FIREBASE_CONFIG;
const panel=document.createElement('dialog');panel.id='nexAccountDialog';
panel.innerHTML=`<div class="nex-account-heading"><strong>Conta NEX</strong><button type="button" id="nexAccountClose" aria-label="Fechar">×</button></div><p id="nexAccountStatus">Conectando ao serviço de contas…</p><div id="nexAccountGuest"><button type="button" id="nexAccountGoogle" class="nex-account-google"><span aria-hidden="true">G</span> Continuar com Google</button><div class="nex-account-separator">ou usar e-mail</div><div class="nex-account-modes" role="group" aria-label="Acesso à conta"><button type="button" id="nexAccountModeLogin" aria-pressed="true">Entrar</button><button type="button" id="nexAccountModeCreate" aria-pressed="false">Criar conta</button></div><form id="nexAccountForm"><div id="nexAccountRegistration" hidden><label>Nome para exibição<input id="nexAccountName" autocomplete="name" type="text" maxlength="60"></label></div><label>E-mail<input id="nexAccountEmail" autocomplete="email" type="email" required></label><label>Senha<input id="nexAccountPassword" autocomplete="current-password" type="password" minlength="6" required></label><div id="nexAccountConfirmation" hidden><label>Confirmar senha<input id="nexAccountConfirm" autocomplete="new-password" type="password" minlength="6"></label><small>Use um nome de exibição e confirme sua senha para criar a conta.</small></div><div class="nex-account-actions"><button type="submit" id="nexAccountSubmit">Entrar na conta</button><button type="button" id="nexAccountReset">Recuperar senha</button></div></form></div><div id="nexAccountConnected" hidden><p id="nexAccountWho"></p><p class="nex-account-help">Suas fichas, campanhas locais e homebrews são mantidos neste navegador e podem ser sincronizados com a sua conta. Não compartilhe sua senha.</p><div class="nex-account-actions"><button id="nexAccountLogout" type="button">Sair da conta</button></div></div><small id="nexAccountMessage" role="status"></small>`;
const css=document.createElement('style');css.textContent=`
#nexAccountOpen{border:1px solid #9d3543;border-radius:8px;background:#32171d;color:#fff;padding:8px 13px;font-weight:700;cursor:pointer}
#nexAccountDialog{width:min(94vw,460px);max-height:88vh;overflow:auto;border:1px solid #a34250;border-radius:12px;padding:20px;background:#141114;color:#fff;box-shadow:0 20px 70px #000a}
#nexAccountDialog::backdrop{background:#000b}
#nexAccountDialog .nex-account-heading{display:flex;justify-content:space-between;align-items:center;gap:12px}
#nexAccountDialog .nex-account-heading strong{font-size:20px}
#nexAccountDialog .nex-account-heading button{background:none;border:0;color:#fff;font-size:26px;cursor:pointer}
#nexAccountDialog label{display:block;margin:12px 0;font-size:12px;color:#e7b5bb}
#nexAccountDialog input{display:block;width:100%;margin-top:5px;background:#0d0c0e;border:1px solid #72505a;color:#fff;padding:11px;border-radius:6px;font-size:16px}
#nexAccountDialog .nex-account-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
#nexAccountDialog .nex-account-actions button{background:#a72d3e;color:#fff;border:1px solid #bd4b5a;border-radius:6px;padding:10px 12px;cursor:pointer}
#nexAccountDialog .nex-account-actions button:not(:first-child){background:#332026}
 #nexAccountDialog .nex-account-google{display:flex;align-items:center;justify-content:center;gap:12px;width:100%;margin:12px 0;background:#fff;color:#202124;border:1px solid #dadce0;border-radius:6px;padding:11px 14px;font-weight:700;cursor:pointer}#nexAccountDialog .nex-account-google span{font-size:18px;font-weight:900;color:#4285f4}#nexAccountDialog .nex-account-separator{color:#b7a9ac;text-align:center;font-size:12px;margin:14px 0}#nexAccountMessage{display:block;color:#e6a7b2;margin-top:12px;line-height:1.5}

#nexAccountDialog .nex-account-modes{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}
#nexAccountDialog .nex-account-modes button{background:#23191c;color:#cbb6bd;border:1px solid #5b3941;border-radius:7px;min-height:42px;font-weight:700;cursor:pointer}
#nexAccountDialog .nex-account-modes button[aria-pressed="true"]{background:#a72d3e;color:#fff;border-color:#ed5666;box-shadow:inset 0 -3px #ff9eaa}
#nexAccountDialog .nex-account-modes button:focus-visible,#nexAccountDialog input:focus-visible{outline:2px solid #ff7887;outline-offset:2px}
#nexAccountDialog .nex-account-actions button[type="submit"]{background:#ad303f;color:#fff;border-color:#dd5160}
#nexAccountDialog #nexAccountConfirmation small{color:#bdaeb4;font-size:11px}
#nexAccountDialog [hidden],#nexAccountMenu[hidden]{display:none!important}`;
document.head.append(css);document.body.append(panel);
const open=document.getElementById('nexAccountOpen')||document.createElement('button');open.id='nexAccountOpen';open.type='button';open.textContent='Conta NEX';
if(!open.isConnected)(document.querySelector('.topinner')||document.body).append(open);
const menu=document.createElement('div');
menu.id='nexAccountMenu';
menu.hidden=true;
menu.innerHTML='<button type="button" id="nexAccountMenuProfile"><span class="nex-account-menu-icon">◉</span>Ver Perfil</button><button type="button" id="nexAccountMenuLogout"><span class="nex-account-menu-icon">↪</span>Desconectar</button>';
document.body.append(menu);
css.textContent+=`
#nexAccountMenu{position:fixed;z-index:100000;right:14px;top:60px;width:215px;max-width:calc(100vw - 28px);padding:6px;background:#151416;border:1px solid #8c3644;border-radius:8px;box-shadow:0 12px 28px #0009;display:flex;flex-direction:column;gap:3px}
#nexAccountMenu[hidden]{display:none!important}
#nexAccountMenu button{width:100%;display:flex;align-items:center;gap:12px;text-align:left;background:transparent;border:0;border-radius:5px;color:#f7f3f4;padding:10px 12px;font-size:13px;font-weight:650;cursor:pointer}
#nexAccountMenu button:hover,#nexAccountMenu button:focus-visible{background:#3b2029;outline:0}
#nexAccountMenu .nex-account-menu-icon{width:25px;height:25px;display:grid;place-items:center;background:#672b48;color:#fff;border-radius:50%;font-size:14px}
#nexProfileDialog{width:min(95vw,590px);max-height:90vh;overflow:auto;background:#111113;border:1px solid #80424c;border-radius:10px;color:#fff;padding:22px;box-shadow:0 20px 60px #000a}
#nexProfileDialog::backdrop{background:#000c}
#nexProfileDialog .nex-profile-header{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:19px}
#nexProfileDialog h2{margin:0;font-size:20px}
#nexProfileDialog .nex-profile-close{background:none;border:0;color:#f4e7ec;font-size:25px;cursor:pointer}
#nexProfileDialog .nex-profile-content{display:flex;gap:20px;align-items:flex-start}
#nexProfileDialog .nex-profile-avatar{height:105px;width:105px;flex:0 0 105px;display:grid;place-items:center;background:#a53242;border:1px solid #c55661;border-radius:8px;font-size:44px;font-weight:800;color:#fff}
#nexProfileDialog .nex-profile-avatar{position:relative;overflow:hidden;cursor:pointer;background-position:center;background-size:cover;background-repeat:no-repeat}
#nexPhotoCropDialog{width:min(95vw,450px);max-height:90vh;overflow:auto;border:1px solid #914251;border-radius:12px;background:#141114;color:#fff;padding:18px}
#nexPhotoCropDialog::backdrop{background:#000c}
#nexPhotoCropDialog .nex-crop-top{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:12px}
#nexPhotoCropDialog .nex-crop-top h2{font-size:19px;margin:0}
#nexPhotoCropDialog .nex-crop-close{color:#fff;background:transparent;border:0;font-size:24px;cursor:pointer}
#nexPhotoCropCanvas{display:block;max-width:100%;height:auto;margin:auto;background:#20191d;border:1px solid #5e3842;border-radius:6px;touch-action:none;cursor:grab}
#nexPhotoCropCanvas:active{cursor:grabbing}
#nexPhotoCropDialog label{display:flex;align-items:center;gap:12px;margin:14px 0;color:#f4d8df}
#nexPhotoCropZoom{flex:1;min-width:0;accent-color:#c6384c}
#nexPhotoCropDialog .nex-crop-actions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}
#nexPhotoCropDialog .nex-crop-actions button{background:#a52f41;border:1px solid #bd4b5a;border-radius:6px;color:#fff;padding:10px 13px;font-weight:650;cursor:pointer}
#nexPhotoCropDialog .nex-crop-actions button:first-child{background:#302025}
#nexPhotoCropStatus{display:block;min-height:1.4em;color:#f4b3bf;font-size:12px;margin-top:10px}
#nexProfileDialog .nex-profile-avatar:focus-visible{outline:2px solid #ff7383;outline-offset:3px}
#nexAccountOpen.nex-header-avatar{display:grid!important;place-items:center!important;width:52px!important;height:52px!important;min-width:52px!important;min-height:52px!important;max-width:52px!important;padding:0!important;line-height:1!important;border-radius:9px!important;background-color:#a53242!important;background-size:cover!important;background-position:center!important;background-repeat:no-repeat!important;border:2px solid #b54b5b!important;color:#fff!important;font-size:25px!important;font-weight:800!important;overflow:hidden!important;cursor:pointer!important}
#nexAccountOpen.nex-header-avatar:focus-visible{outline:2px solid #ff9eaa!important;outline-offset:3px!important}

#nexProfileDialog form{flex:1;min-width:0;display:grid;gap:12px}
#nexProfileDialog label{display:grid;gap:5px;font-weight:650;font-size:12px;color:#f5e9ed}
#nexProfileDialog input{width:100%;min-width:0;padding:10px;border:1px solid #543940;border-radius:6px;background:#1d1a1d;color:#fff;font-size:14px}
#nexProfileDialog input:focus-visible{outline:2px solid #e25365;outline-offset:1px}
#nexProfileDialog input[readonly]{opacity:.77}
#nexProfileDialog .nex-profile-actions{display:flex;gap:8px;flex-wrap:wrap}
#nexProfileDialog .nex-profile-actions button{padding:9px 12px;border:1px solid #ac4d5b;background:#a52f41;color:#fff;border-radius:6px;cursor:pointer;font-weight:650}
#nexProfileDialog .nex-profile-actions button+button{background:#302025}
#nexProfileStatus{display:block;min-height:1.5em;color:#f5bac3;font-size:12px;margin-top:12px}
@media(max-width:470px){#nexProfileDialog .nex-profile-content{flex-direction:column}#nexProfileDialog .nex-profile-avatar{width:80px;height:80px;flex-basis:80px;font-size:33px}}
`;
const profile=document.createElement('dialog');
profile.id='nexProfileDialog';
profile.setAttribute('aria-label','Meu perfil NEX');
profile.innerHTML='<div class="nex-profile-header"><h2>Meu perfil</h2><button type="button" class="nex-profile-close" id="nexProfileClose" aria-label="Fechar perfil">×</button></div><div class="nex-profile-content"><button class="nex-profile-avatar" id="nexProfileAvatar" type="button" aria-label="Alterar foto do perfil" title="Clique para trocar sua foto">N</button><input type="file" id="nexProfilePhotoFile" accept="image/png,image/jpeg,image/webp" style="display:none" aria-label="Escolher foto do perfil"><form id="nexProfileForm"><label>Nome<input id="nexProfileName" maxlength="60" autocomplete="name" required></label><label>E-mail<input id="nexProfileEmail" type="email" readonly></label><label>Idade (opcional)<input id="nexProfileAge" type="number" inputmode="numeric" min="1" max="120" placeholder="Não informada"></label><div class="nex-profile-actions"><button type="submit" id="nexProfileSave">Salvar perfil</button><button type="button" id="nexProfilePassword">Trocar senha</button><button type="button" id="nexProfileLogout">Desconectar</button></div></form></div><small id="nexProfileStatus" role="status"></small>';
document.body.append(profile);
const cropDialog=document.createElement('dialog');
cropDialog.id='nexPhotoCropDialog';
cropDialog.setAttribute('aria-label','Ajustar foto do perfil');
cropDialog.innerHTML='<div class="nex-crop-top"><h2>Ajustar foto</h2><button type="button" class="nex-crop-close" id="nexCropClose" aria-label="Fechar edição">×</button></div><p>Arraste a imagem para enquadrar antes de salvar.</p><canvas id="nexPhotoCropCanvas" width="320" height="320" aria-label="Prévia quadrada da foto; arraste para enquadrar"></canvas><label>Zoom <input id="nexPhotoCropZoom" type="range" min="1" max="3" value="1" step="0.01"></label><div class="nex-crop-actions"><button type="button" id="nexCropCancel">Cancelar</button><button type="button" id="nexCropSave">Salvar foto</button></div><small id="nexPhotoCropStatus" role="status"></small>';
document.body.append(cropDialog);
const $=id=>document.getElementById(id);
const status=t=>{$('nexAccountStatus').textContent=t;};
const message=t=>{$('nexAccountMessage').textContent=t;};
open.addEventListener('click',()=>{
 if(window.NEX_ACCOUNT_USER){
  menu.hidden=!menu.hidden;
  if(!menu.hidden){
   const rect=open.getBoundingClientRect();
   menu.style.top=Math.min(window.innerHeight-65,rect.bottom+8)+'px';
   menu.style.right=Math.max(8,window.innerWidth-rect.right)+'px';
  }
 }else panel.showModal();
});
document.addEventListener('click',event=>{if(!menu.contains(event.target)&&event.target!==open)menu.hidden=true;});
$('nexAccountClose').onclick=()=>panel.close();
if(!cfg?.apiKey||!cfg?.projectId){status('Configuração do Firebase não encontrada.');message('Confira firebase-config.js.');}
else{
 const app=getApps().find(a=>a.name==='[DEFAULT]')||initializeApp(cfg);
 const auth=getAuth(app),db=getFirestore(app);let current=null,busy=false,ready=false,dirty=false,timer=0,hydratedUid=null,localVersion=0;
 const getBridge=()=>window.NEX_AUTO_BRIDGE?.ready?.()?window.NEX_AUTO_BRIDGE:null;
 const safeClone=v=>JSON.parse(JSON.stringify(v));
 const uidPath=()=>collection(db,'users',current.uid,'nex_v3');
 const merge=(local,remote,keyFn)=>{
  const m=new Map();
  for(const x of remote||[])if(x&&keyFn(x)!=null)m.set(String(keyFn(x)),x);
  for(const x of local||[])if(x&&keyFn(x)!=null)m.set(String(keyFn(x)),x);
  return [...m.values()];
 };
 const normalizeItems=v=>Array.isArray(v)?v:[];
 const advanced=()=>{try{const a=JSON.parse(localStorage.getItem('nex_homebrew_advanced_v2051')||'[]');return normalizeItems(a);}catch{return [];}};
 const mergeAdvanced=remote=>{
  const output=merge(advanced(),remote,x=>x.id||[x.type,x.name,x.className||''].join(':'));
  localStorage.setItem('nex_homebrew_advanced_v2051',JSON.stringify(output));
 };
 async function sync(){
  if(busy||!current)return;
  const bridge=getBridge();
  if(!bridge){status('Carregando fichas da sua conta…');return;}
  const account=current.uid;
  busy=true;status('Sincronizando fichas com a conta NEX…');
  const versionAtStart=localVersion;
  try{
   const priorLocal=bridge.read();
   const cloud=await getDocs(collection(db,'users',account,'nex_v3'));
   if(current?.uid!==account)return;
   const records=new Map(cloud.docs.map(s=>[s.id,s.data()]));
   if(hydratedUid!==account){
    // No primeiro carregamento, as fichas da conta são a fonte principal.
    // Uma única migração é permitida apenas quando não há fichas salvas na conta.
    let previous='';try{previous=localStorage.getItem('nex_account_last_uid')||'';}catch(error){}
    const remoteAgents=[],removed=[];
    let hasAgentRecords=false;
    for(const [key,record] of records){
     if(!key.startsWith('agent-'))continue;
     hasAgentRecords=true;
     if(record.deleted){removed.push(key.slice(6));continue;}
     if(record.payload?.item?.data)remoteAgents.push(record.payload.item);
    }
    const canImportLegacy=!hasAgentRecords&&(!previous||previous===account);
    const localOwnedByAccount=previous===account;
    const merged=new Map(remoteAgents.map(agent=>[agent.id,agent]));
    if(canImportLegacy||localOwnedByAccount){
     for(const agent of priorLocal.agents||[]){
      if(!agent?.id||removed.includes(agent.id))continue;
      const cloudAgent=merged.get(agent.id);
      if(!cloudAgent || Date.parse(agent.updatedAt||'')>Date.parse(cloudAgent.updatedAt||'')){
       merged.set(agent.id,agent);
      }
     }
    }
    try{
     localStorage.setItem('nex_account_recovery_'+(previous||account),JSON.stringify({savedAt:new Date().toISOString(),...priorLocal}));
    }catch(error){console.warn('Backup anterior indisponível',error);}
    bridge.replaceAccountAgents([...merged.values()],removed);
    hydratedUid=account;
   }
   const local=bridge.read();
   const patches=[],uploads=[];
   // Exclusions are explicit tombstones, never inferred from a missing local sheet.
   const deletedIds=new Set((local.deletedAgentIds||[]).filter(id=>typeof id==='string'&&/^[A-Za-z0-9_-]{2,90}$/.test(id)));
   const localIds=new Set((local.agents||[]).map(a=>a.id));
   for(const id of deletedIds){
     const key='agent-'+id,remote=records.get(key);
     if(remote&&!remote.deleted){
       uploads.push({key,type:'agent',payload:{},deleted:true});
     }
   }
   for(const a of local.agents||[]){
    if(!a?.id||!/^[A-Za-z0-9_-]{2,90}$/.test(a.id)||deletedIds.has(a.id))continue;
    const key='agent-'+a.id,r=records.get(key),other=r?.payload?.item;
    if(r?.deleted){
      patches.push({id:key,entry:r});
      continue; // A cloud deletion can never be undone by an older local copy.
    }
    if(other&&Date.parse(other.updatedAt||0)>Date.parse(a.updatedAt||0)){
      patches.push({id:key,entry:r});continue;
    }
    if(!r||JSON.stringify(other)!==JSON.stringify(a))uploads.push({key,type:'agent',payload:{item:a},deleted:false});
   }
   for(const [key,r] of records){
    if(!key.startsWith('agent-'))continue;
    const id=key.slice(6);
    if(deletedIds.has(id))continue;
    if(r.deleted){
      if(localIds.has(id))patches.push({id:key,entry:r});
      continue;
    }
    if(!localIds.has(id))patches.push({id:key,entry:r});
   }
   for(const [name,items,idFn] of [
    ['campaigns',local.campaigns,x=>x.id],
    ['homebrew',local.homebrew,x=>x.id||x.name]
   ]){
    const r=records.get(name);
    let syncedProfile={};
    if(name==='homebrew'){
      const localProfile=currentProfile();
      const cloudProfile=r?.payload?.profile&&typeof r.payload.profile==='object'?r.payload.profile:{};
      const localStamp=Date.parse(localProfile.updatedAt||'')||0;
      const cloudStamp=Date.parse(cloudProfile.updatedAt||'')||0;
      syncedProfile=cloudStamp>localStamp?cloudProfile:localProfile;
      if(cloudStamp>localStamp){
        try{localStorage.setItem('nex_account_profile_'+current.uid,JSON.stringify(syncedProfile));}catch(error){console.warn('Perfil local indisponível',error);}
        if(profile.open)updateProfileDisplay();
      }
    }
    const full=merge(normalizeItems(items),normalizeItems(r?.payload?.items),idFn);
    // Never delete cloud-only entries or local entries during first sign-in.
    if(JSON.stringify(full)!==JSON.stringify(items))patches.push({id:name,entry:{type:name,deleted:false,payload:{items:full}}});
    if(!r||JSON.stringify(r.payload?.items)!==JSON.stringify(full)||name==='homebrew'&&(JSON.stringify(r.payload?.advanced||[])!==JSON.stringify(advanced())||JSON.stringify(r.payload?.profile||{})!==JSON.stringify(syncedProfile))){
      uploads.push({key:name,type:name,payload:{items:full,...(name==='homebrew'?{advanced:merge(advanced(),r?.payload?.advanced,x=>x.id||[x.type,x.name].join(':')),profile:syncedProfile}:{})}});
    }
   }
   // Save the local pre-merge collection as a recovery point.
   if(patches.length){
     try{localStorage.setItem('nex_account_recovery_'+current.uid,JSON.stringify({savedAt:new Date().toISOString(),...local,advanced:advanced()}));}catch(e){console.warn('Backup local de recuperação indisponível',e);}
     bridge.apply(patches);
   }
   if(records.get('homebrew')?.payload?.advanced)mergeAdvanced(records.get('homebrew').payload.advanced);
   for(const u of uploads){
    if(current?.uid!==account)return;
    await setDoc(doc(db,'users',account,'nex_v3',u.key),{type:u.type,payload:safeClone(u.payload),deleted:!!u.deleted,updatedAt:serverTimestamp()});
   }
   if(current?.uid!==account)return;
   try{localStorage.setItem('nex_account_last_uid',account);}catch(error){}
   ready=true;
   window.NEX_ACCOUNT_SYNC_READY=true;
   status('Conta NEX · fichas sincronizadas na nuvem');
   message('Fichas vinculadas à sua conta NEX. A cópia do navegador é apenas uma recuperação temporária.');
   window.dispatchEvent(new CustomEvent('nex-cloud-sync-state',{detail:{state:'saved',uid:account}}));
  }catch(error){
    console.error('NEX sincronização',error);
    status('Conta NEX · não foi possível sincronizar');
    message('Não foi possível confirmar o salvamento na conta ('+(error?.code||error?.message||'erro')+'). Uma cópia temporária foi mantida neste navegador; não a considere salva na nuvem.');
    window.dispatchEvent(new CustomEvent('nex-cloud-sync-state',{detail:{state:'error',uid:current?.uid}}));
  }finally{
   busy=false;
   if(current&&localVersion!==versionAtStart){dirty=true;schedule();}
   else dirty=false;
  }
 }
 function schedule(){if(!current||!ready)return;clearTimeout(timer);timer=setTimeout(sync,1000);}
 window.addEventListener('nex-auto-local-change',()=>{localVersion++;dirty=true;schedule();});
 $('nexAccountLogout').onclick=async()=>{try{await signOut(auth);menu.hidden=true;}catch(e){message('Falha ao sair da conta.');}};
 $('nexAccountMenuLogout').onclick=()=>$('nexAccountLogout').click();
 $('nexProfileLogout').onclick=async()=>{
   const button=$('nexProfileLogout');
   button.disabled=true;
   try{
     await signOut(auth);
     if(profile.open)profile.close();
     menu.hidden=true;
   }catch(error){
     $('nexProfileStatus').textContent='Não foi possível desconectar. Tente novamente.';
   }finally{
     button.disabled=false;
   }
 };
 function currentProfile(){
  const raw=current?.uid?localStorage.getItem('nex_account_profile_'+current.uid):null;
  try{const profile=JSON.parse(raw||'{}');return profile&&typeof profile==='object'?profile:{};}catch{return {};}
 }
 function updateHeaderAvatar(){
   const user=current;
   if(!user){
     open.textContent='Conta NEX';
     open.classList.remove('nex-header-avatar');
     open.style.removeProperty('background-image');
     open.style.removeProperty('background-color');
     return;
   }
   const data=currentProfile();
   const name=user.displayName||data.name||user.email||'N';
   const photo=typeof data.photo==='string'&&data.photo.length<120000&&/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(data.photo)?data.photo:null;
   open.classList.add('nex-header-avatar');
   open.textContent=photo?'':(String(name).trim().charAt(0).toUpperCase()||'N');
   open.style.setProperty('background-image',photo?'url("'+photo+'")':'none','important');
   open.setAttribute('aria-label','Minha conta — abrir menu do perfil');
 }
 function setProfileAvatar(name,photo){
   const avatar=$('nexProfileAvatar');
   const valid=typeof photo==='string'&&photo.length<120000&&/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(photo);
   avatar.style.backgroundImage=valid?'url("'+photo+'")':'none';
   avatar.textContent=valid?'':(String(name||'N').trim().charAt(0).toUpperCase()||'N');
 }

 const cropCanvas=$('nexPhotoCropCanvas'),cropContext=cropCanvas.getContext('2d');
 let cropImage=null,cropOwner=null,cropUrl=null,cropZoom=1,cropX=0,cropY=0,cropPointer=null;
 function cropBase(){
   if(!cropImage)return 1;
   return Math.max(320/cropImage.naturalWidth,320/cropImage.naturalHeight);
 }
 function clampCrop(){
   if(!cropImage)return;
   const w=cropImage.naturalWidth*cropBase()*cropZoom;
   const h=cropImage.naturalHeight*cropBase()*cropZoom;
   cropX=Math.min((w-320)/2,Math.max(-(w-320)/2,cropX));
   cropY=Math.min((h-320)/2,Math.max(-(h-320)/2,cropY));
 }
 function drawCrop(){
   if(!cropImage||!cropContext)return;
   clampCrop();
   cropContext.fillStyle='#20191d';
   cropContext.fillRect(0,0,320,320);
   const w=cropImage.naturalWidth*cropBase()*cropZoom;
   const h=cropImage.naturalHeight*cropBase()*cropZoom;
   cropContext.drawImage(cropImage,(320-w)/2+cropX,(320-h)/2+cropY,w,h);
 }
 function closeCrop(){
   if(cropDialog.open)cropDialog.close();
   cropImage=null;cropOwner=null;cropPointer=null;
   if(cropUrl){URL.revokeObjectURL(cropUrl);cropUrl=null;}
 }
 $('nexCropClose').onclick=closeCrop;
 $('nexCropCancel').onclick=closeCrop;
 cropDialog.addEventListener('close',()=>{
   cropImage=null;cropOwner=null;cropPointer=null;
   if(cropUrl){URL.revokeObjectURL(cropUrl);cropUrl=null;}
 });
 cropCanvas.addEventListener('pointerdown',event=>{
   if(!cropImage)return;
   cropPointer={id:event.pointerId,x:event.clientX,y:event.clientY,ox:cropX,oy:cropY};
   cropCanvas.setPointerCapture(event.pointerId);
 });
 cropCanvas.addEventListener('pointermove',event=>{
   if(!cropPointer||cropPointer.id!==event.pointerId)return;
   const rect=cropCanvas.getBoundingClientRect();
   cropX=cropPointer.ox+(event.clientX-cropPointer.x)*(320/rect.width);
   cropY=cropPointer.oy+(event.clientY-cropPointer.y)*(320/rect.height);
   drawCrop();
 });
 function endCropDrag(event){if(cropPointer?.id===event.pointerId)cropPointer=null;}
 cropCanvas.addEventListener('pointerup',endCropDrag);
 cropCanvas.addEventListener('pointercancel',endCropDrag);
 $('nexPhotoCropZoom').oninput=event=>{cropZoom=Number(event.target.value)||1;drawCrop();};
 $('nexProfileAvatar').onclick=()=>{if(current)$('nexProfilePhotoFile').click();};
 $('nexProfilePhotoFile').addEventListener('change',async event=>{
   const file=event.target.files?.[0];
   event.target.value='';
   if(!file||!current)return;
   if(!['image/png','image/jpeg','image/webp'].includes(file.type)){profileStatus('Escolha uma imagem JPG, PNG ou WebP.');return;}
   if(file.size>5*1024*1024){profileStatus('Escolha uma foto de até 5 MB.');return;}
   closeCrop();
   cropOwner=current.uid;
   const owner=cropOwner;
   const url=URL.createObjectURL(file);
   cropUrl=url;
   const img=new Image();
   img.onload=()=>{
     if(cropOwner!==owner||cropUrl!==url||current?.uid!==owner)return;
     cropImage=img;cropZoom=1;cropX=0;cropY=0;
     $('nexPhotoCropZoom').value='1';
     $('nexPhotoCropStatus').textContent='';
     drawCrop();cropDialog.showModal();
   };
   img.onerror=()=>{
     if(cropUrl===url){closeCrop();profileStatus('Não foi possível abrir a imagem.');}
   };
   img.src=url;
 });
 $('nexCropSave').onclick=async()=>{
   if(!cropImage||!cropOwner||!current||current.uid!==cropOwner)return;
   const owner=cropOwner,button=$('nexCropSave');
   button.disabled=true;
   try{
     drawCrop();
     const output=document.createElement('canvas');
     output.width=output.height=180;
     const ctx=output.getContext('2d');
     if(!ctx)throw new Error('Editor indisponível');
     ctx.drawImage(cropCanvas,0,0,180,180);
     const photo=output.toDataURL('image/jpeg',0.75);
     if(photo.length>110000)throw new Error('Imagem muito grande');
     const updated={...currentProfile(),photo,updatedAt:new Date().toISOString()};
     if(current?.uid!==owner)throw new Error('A conta foi alterada');
     localStorage.setItem('nex_account_profile_'+owner,JSON.stringify(updated));
     setProfileAvatar($('nexProfileName').value,photo);
     updateHeaderAvatar();
     dirty=true;
     if(ready)schedule();
     else setTimeout(()=>{if(current?.uid===owner)sync();},1200);
     profileStatus('Foto alterada. A sincronização acontece automaticamente.');
     closeCrop();
   }catch(err){$('nexPhotoCropStatus').textContent='Não foi possível salvar: '+(err?.message||'tente novamente');}
   finally{button.disabled=false;}
 };
 function updateProfileDisplay(){
   if(!current)return;
   const saved=currentProfile();
   const name=current.displayName||saved.name||'Usuário NEX';
   $('nexProfileName').value=name;
   $('nexProfileEmail').value=current.email||'';
   $('nexProfileAge').value=Number.isInteger(saved.age)&&saved.age>=1&&saved.age<=120?saved.age:'';
   setProfileAvatar(name,saved.photo);
   updateHeaderAvatar();
 }
 $('nexAccountMenuProfile').onclick=()=>{
   if(!current)return;
   menu.hidden=true;
   updateProfileDisplay();
   $('nexProfileStatus').textContent='';
   profile.showModal();
 };
 $('nexProfileClose').onclick=()=>profile.close();
 const profileStatus=text=>{$('nexProfileStatus').textContent=text;};
 $('nexProfileForm').onsubmit=async event=>{
   event.preventDefault();
   if(!current)return;
   const name=$('nexProfileName').value.trim();
   const ageText=$('nexProfileAge').value.trim();
   const age=ageText===''?null:Number(ageText);
   if(name.length<2){profileStatus('Informe um nome com pelo menos 2 letras.');return;}
   if(age!==null&&(!Number.isInteger(age)||age<1||age>120)){profileStatus('Informe uma idade válida ou deixe o campo vazio.');return;}
   const button=$('nexProfileSave');button.disabled=true;
   try{
    await updateProfile(current,{displayName:name.slice(0,60)});
    const updated={...currentProfile(),name:name.slice(0,60),age,updatedAt:new Date().toISOString()};
    localStorage.setItem('nex_account_profile_'+current.uid,JSON.stringify(updated));
    setProfileAvatar(name,updated.photo);
    updateHeaderAvatar();
    // Persist the optional age in the owner's existing private homebrew record on the next sync.
    dirty=true;schedule();
    profileStatus('Perfil salvo. As alterações serão sincronizadas automaticamente.');
   }catch(error){profileStatus('Não foi possível salvar o perfil: '+(error?.code||'tente novamente'));}
   finally{button.disabled=false;}
 };
 $('nexProfilePassword').onclick=async()=>{
   if(!current?.email){profileStatus('Esta conta não possui e-mail para recuperação.');return;}
   if(current.providerData?.some(p=>p.providerId==='google.com')&&!current.providerData?.some(p=>p.providerId==='password')){
    profileStatus('Sua conta utiliza o Google. Altere sua senha nas configurações da Conta Google.');return;
   }
   try{await sendPasswordResetEmail(auth,current.email);profileStatus('Se o e-mail estiver habilitado para senha, você receberá um link para alterá-la.');}
   catch(error){profileStatus('Não foi possível enviar o link: '+(error?.code||'tente novamente'));}
 };
 $('nexAccountGoogle').onclick=async()=>{
  const button=$('nexAccountGoogle');
  button.disabled=true;
  message('Abrindo login do Google…');
  try{
   const provider=new GoogleAuthProvider();
   provider.setCustomParameters({prompt:'select_account'});
   await signInWithPopup(auth,provider);
   message('Login Google realizado. Conferindo sincronização…');
  }catch(error){
   const msg={
    'auth/popup-closed-by-user':'A janela de login foi fechada. Tente novamente.',
    'auth/cancelled-popup-request':'A tentativa anterior foi cancelada. Tente novamente.',
    'auth/popup-blocked':'O navegador bloqueou a janela do Google. Permita pop-ups para este site.',
    'auth/unauthorized-domain':'O domínio deste site não foi autorizado no Firebase. Adicione nexrpg.pages.dev em Authentication → Configurações → Domínios autorizados.',
    'auth/account-exists-with-different-credential':'Este e-mail já está associado a outro método de login. Entre pelo método original.',
    'auth/network-request-failed':'Erro de conexão. Confira sua internet.'
   };
   message(msg[error?.code]||'Falha no login Google: '+(error?.code||'erro desconhecido'));
  }finally{button.disabled=false;}
 };
 let accountMode='login';
 function selectAccountMode(mode){
   accountMode=mode==='create'?'create':'login';
   const isCreate=accountMode==='create';
   $('nexAccountModeLogin').setAttribute('aria-pressed',String(!isCreate));
   $('nexAccountModeCreate').setAttribute('aria-pressed',String(isCreate));
   $('nexAccountRegistration').hidden=!isCreate;
   $('nexAccountConfirmation').hidden=!isCreate;
   $('nexAccountName').required=isCreate;
   $('nexAccountConfirm').required=isCreate;
   $('nexAccountPassword').autocomplete=isCreate?'new-password':'current-password';
   $('nexAccountSubmit').textContent=isCreate?'Criar minha conta':'Entrar na conta';
   $('nexAccountReset').hidden=isCreate;
   message('');
 }
 $('nexAccountModeLogin').onclick=()=>selectAccountMode('login');
 $('nexAccountModeCreate').onclick=()=>selectAccountMode('create');
 $('nexAccountForm').onsubmit=async e=>{
   e.preventDefault();
   const email=$('nexAccountEmail').value.trim();
   const password=$('nexAccountPassword').value;
   if(!$('nexAccountEmail').validity.valid||!email){message('Digite um e-mail válido.');$('nexAccountEmail').focus();return;}
   if(password.length<6){message('A senha precisa ter pelo menos 6 caracteres.');$('nexAccountPassword').focus();return;}
   const submit=$('nexAccountSubmit');
   submit.disabled=true;
   try{
     if(accountMode==='create'){
       const name=$('nexAccountName').value.trim();
       if(name.length<2){message('Digite um nome de exibição com pelo menos 2 caracteres.');$('nexAccountName').focus();return;}
       if(password!==$('nexAccountConfirm').value){message('As senhas não coincidem.');$('nexAccountConfirm').focus();return;}
       message('Criando sua conta…');
       const result=await createUserWithEmailAndPassword(auth,email,password);
       try{await updateProfile(result.user,{displayName:name.slice(0,60)});}
       catch(profileError){console.warn('Nome de perfil não salvo',profileError);message('Conta criada, mas não foi possível salvar o nome do perfil.');}
     }else{
       message('Entrando na conta…');
       await signInWithEmailAndPassword(auth,email,password);
     }
   }catch(error){
     const code=error?.code||'';
     const friendly={
       'auth/email-already-in-use':'Este e-mail já possui uma conta. Selecione Entrar ou Recuperar senha.',
       'auth/invalid-email':'Digite um endereço de e-mail válido.',
       'auth/weak-password':'Escolha uma senha mais forte.',
       'auth/invalid-credential':'E-mail ou senha incorretos.',
       'auth/wrong-password':'E-mail ou senha incorretos.',
       'auth/network-request-failed':'Não foi possível conectar. Verifique sua internet.',
       'auth/operation-not-allowed':'Ative E-mail/senha no Firebase Authentication.'
     };
     message(friendly[code]||'Não foi possível concluir: '+(code||'tente novamente'));
   }finally{submit.disabled=false;}
 };
 $('nexAccountReset').onclick=async()=>{const email=$('nexAccountEmail').value.trim();if(!email){message('Digite seu e-mail antes de recuperar a senha.');return;}try{await sendPasswordResetEmail(auth,email);message('Se a conta existir, você receberá instruções de recuperação.');}catch(error){message('Não foi possível enviar a recuperação: '+(error.code||'erro'));}};
 onAuthStateChanged(auth,user=>{
  const previousUser=current?.uid||null;
  current=user;ready=false;hydratedUid=null;clearTimeout(timer);dirty=false;
  window.NEX_ACCOUNT_USER=user||null;
  window.NEX_ACCOUNT_SYNC_READY=false;
  $('nexAccountGuest').hidden=!!user;$('nexAccountConnected').hidden=!user;
  updateHeaderAvatar();
  open.title=user?(user.email||'Conta NEX conectada'):'Entrar ou criar conta';
  if(user)$('nexProfileEmail').value=user.email||'';
  menu.hidden=true;
  if(user){
   $('nexAccountWho').textContent=user.email||'Conta conectada';
   if(panel.open)panel.close();
   // Ao trocar contas, esconde imediatamente as fichas da sessão anterior.
   let last='';try{last=localStorage.getItem('nex_account_last_uid')||'';}catch(error){}
   if((previousUser&&previousUser!==user.uid)||(last&&last!==user.uid)){
    const bridge=getBridge();
    if(bridge){
     try{
      const before=bridge.read();
      localStorage.setItem('nex_account_recovery_'+(previousUser||last),JSON.stringify({savedAt:new Date().toISOString(),...before}));
      bridge.replaceAccountAgents([],[]);
     }catch(error){console.warn('NEX: não foi possível isolar a troca de conta',error);}
    }
   }
   status('Carregando personagens da conta NEX…');
   setTimeout(()=>{if(current?.uid===user.uid)sync();},700);
  }else{
   const bridge=getBridge();
   if(bridge){
    try{bridge.replaceAccountAgents([],[]);}catch(error){console.warn('NEX: limpeza da visualização ao sair',error);}
   }
   status('Entre na conta NEX para carregar e sincronizar personagens.');
   message('As fichas são vinculadas à conta NEX. Sem login, o salvamento na nuvem não está disponível.');
  }
 });
 // Periodic reconciliation while signed in, including changes from other devices.
 setInterval(()=>{if(current&&!busy)sync();},45000);
}
