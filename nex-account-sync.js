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
#nexProfileDialog .nex-profile-avatar:after{content:'✎';position:absolute;right:5px;bottom:5px;width:25px;height:25px;display:grid;place-items:center;border-radius:50%;font-size:14px;background:#111b;color:#fff;border:1px solid #fff5}
#nexProfileDialog .nex-profile-avatar:focus-visible{outline:2px solid #ff7383;outline-offset:3px}
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
profile.innerHTML='<div class="nex-profile-header"><h2>Meu perfil</h2><button type="button" class="nex-profile-close" id="nexProfileClose" aria-label="Fechar perfil">×</button></div><div class="nex-profile-content"><button class="nex-profile-avatar" id="nexProfileAvatar" type="button" aria-label="Alterar foto do perfil" title="Clique para trocar sua foto">N</button><input type="file" id="nexProfilePhotoFile" accept="image/png,image/jpeg,image/webp" style="display:none" aria-label="Escolher foto do perfil"><form id="nexProfileForm"><label>Nome<input id="nexProfileName" maxlength="60" autocomplete="name" required></label><label>E-mail<input id="nexProfileEmail" type="email" readonly></label><label>Idade (opcional)<input id="nexProfileAge" type="number" inputmode="numeric" min="1" max="120" placeholder="Não informada"></label><div class="nex-profile-actions"><button type="submit" id="nexProfileSave">Salvar perfil</button><button type="button" id="nexProfilePassword">Trocar senha</button></div></form></div><small id="nexProfileStatus" role="status"></small>';
document.body.append(profile);
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
 const auth=getAuth(app),db=getFirestore(app);let current=null,busy=false,ready=false,dirty=false,timer=0,accountSwitchBlocked=false;
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
  if(busy||!current||accountSwitchBlocked)return;
  const bridge=getBridge();
  if(!bridge){status('Preparando fichas locais…');return;}
  busy=true;status('Sincronizando com segurança…');
  try{
   const local=bridge.read();
   const cloud=await getDocs(uidPath());
   const records=new Map(cloud.docs.map(s=>[s.id,s.data()]));
   const patches=[],uploads=[];
   for(const a of local.agents||[]){
    if(!a?.id||!/^[A-Za-z0-9_-]{2,90}$/.test(a.id))continue;
    const key='agent-'+a.id,r=records.get(key),other=r?.payload?.item;
    if(other&&r.deleted!==true && Date.parse(other.updatedAt||0)>Date.parse(a.updatedAt||0)){
      patches.push({id:key,entry:r});continue;
    }
    if(!r||r.deleted||JSON.stringify(other)!==JSON.stringify(a))uploads.push({key,type:'agent',payload:{item:a}});
   }
   for(const [key,r] of records){
    if(!key.startsWith('agent-')||r.deleted)continue;
    if(!(local.agents||[]).some(a=>'agent-'+a.id===key))patches.push({id:key,entry:r});
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
   for(const u of uploads)await setDoc(doc(uidPath(),u.key),{type:u.type,payload:safeClone(u.payload),deleted:false,updatedAt:serverTimestamp()});
   try{localStorage.setItem('nex_account_last_uid',current.uid);}catch(e){}
   ready=true;dirty=false;status('Conta conectada · sincronização concluída');
   message('Dados sincronizados: '+(local.agents||[]).length+' ficha(s), campanhas e homebrews. As fichas locais foram preservadas.');
  }catch(error){
    console.error('NEX sincronização',error);
    status('Conta conectada · sincronização indisponível');
    message('Não foi possível acessar a nuvem: '+(error?.code||error?.message||'erro')+'. Os dados locais permanecem salvos. Verifique autenticação, Firestore e regras publicadas.');
  }finally{busy=false;if(dirty){dirty=false;schedule();}}
 }
 function schedule(){if(!current||!ready)return;clearTimeout(timer);timer=setTimeout(sync,1800);}
 window.addEventListener('nex-auto-local-change',()=>{dirty=true;schedule();});
 $('nexAccountLogout').onclick=async()=>{try{await signOut(auth);menu.hidden=true;}catch(e){message('Falha ao sair da conta.');}};
 $('nexAccountMenuLogout').onclick=()=>$('nexAccountLogout').click();
 function currentProfile(){
  const raw=current?.uid?localStorage.getItem('nex_account_profile_'+current.uid):null;
  try{const profile=JSON.parse(raw||'{}');return profile&&typeof profile==='object'?profile:{};}catch{return {};}
 }
 function setProfileAvatar(name,photo){
   const avatar=$('nexProfileAvatar');
   const valid=typeof photo==='string'&&photo.length<120000&&/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(photo);
   avatar.style.backgroundImage=valid?'url("'+photo+'")':'none';
   avatar.textContent=valid?'':(String(name||'N').trim().charAt(0).toUpperCase()||'N');
 }
 function resizeProfilePhoto(file){
   return new Promise((resolve,reject)=>{
     const url=URL.createObjectURL(file);
     const img=new Image();
     img.onload=()=>{
       try{
         const size=180;
         const canvas=document.createElement('canvas');canvas.width=canvas.height=size;
         const ctx=canvas.getContext('2d');
         if(!ctx)throw new Error('Canvas indisponível');
         ctx.fillStyle='#211518';ctx.fillRect(0,0,size,size);
         const scale=Math.max(size/img.naturalWidth,size/img.naturalHeight);
         const w=img.naturalWidth*scale,h=img.naturalHeight*scale;
         ctx.drawImage(img,(size-w)/2,(size-h)/2,w,h);
         const data=canvas.toDataURL('image/jpeg',0.75);
         if(data.length>110000)throw new Error('A foto compactada ficou muito grande');
         resolve(data);
       }catch(err){reject(err);}
       finally{URL.revokeObjectURL(url);}
     };
     img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Imagem não pôde ser lida'));};
     img.src=url;
   });
 }
 $('nexProfileAvatar').onclick=()=>{if(current)$('nexProfilePhotoFile').click();};
 $('nexProfilePhotoFile').addEventListener('change',async event=>{
   const file=event.target.files?.[0];
   event.target.value='';
   if(!file||!current)return;
   if(!['image/png','image/jpeg','image/webp'].includes(file.type)){profileStatus('Escolha uma imagem JPG, PNG ou WebP.');return;}
   if(file.size>5*1024*1024){profileStatus('Escolha uma foto de até 5 MB.');return;}
   const owner=current.uid;
   $('nexProfileAvatar').disabled=true;
   profileStatus('Preparando foto do perfil…');
   try{
     const photo=await resizeProfilePhoto(file);
     if(!current||current.uid!==owner)throw new Error('Conta alterada durante a seleção da foto');
     const old=currentProfile();
     const updated={...old,photo,updatedAt:new Date().toISOString()};
     localStorage.setItem('nex_account_profile_'+owner,JSON.stringify(updated));
     setProfileAvatar($('nexProfileName').value,photo);
     dirty=true;
     if(ready)schedule();
     else setTimeout(()=>{if(current?.uid===owner)sync();},1200);
     profileStatus('Foto alterada. A sincronização acontece automaticamente.');
   }catch(err){profileStatus('Não foi possível salvar a foto: '+(err?.message||'tente novamente'));}
   finally{$('nexProfileAvatar').disabled=false;}
 });
 function updateProfileDisplay(){
   if(!current)return;
   const saved=currentProfile();
   const name=current.displayName||saved.name||'Usuário NEX';
   $('nexProfileName').value=name;
   $('nexProfileEmail').value=current.email||'';
   $('nexProfileAge').value=Number.isInteger(saved.age)&&saved.age>=1&&saved.age<=120?saved.age:'';
   setProfileAvatar(name,saved.photo);
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
  current=user;ready=false;clearTimeout(timer);dirty=false;
  let previous='';try{previous=localStorage.getItem('nex_account_last_uid')||'';}catch(e){}
  accountSwitchBlocked=!!user&&!!previous&&previous!==user.uid;
  window.NEX_ACCOUNT_USER=user||null;
  $('nexAccountGuest').hidden=!!user;$('nexAccountConnected').hidden=!user;
  open.textContent=user?'Minha conta':'Conta NEX';
  open.title=user?(accountSwitchBlocked?'Conta diferente detectada: sincronização pausada para proteger seus dados':(user.email||'Conta conectada')):'Entrar ou criar conta';
  if(user) $('nexProfileEmail').value=user.email||'';
  menu.hidden=true;
  if(user){
   $('nexAccountWho').textContent=user.email||'Conta conectada';
   if(panel.open)panel.close();
   if(accountSwitchBlocked){
    status('Troca de conta detectada · sincronização pausada');
    console.warn('NEX: sincronização automática impedida para não misturar dados de contas diferentes neste navegador.');
   }else{status('Conta conectada · sincronização automática');setTimeout(sync,900);}
  }else{
   status('Entre ou crie uma conta para sincronizar suas fichas.');
   message('O NEX continua funcionando sem login neste navegador.');
  }
 });
 // Periodic reconciliation while signed in, including changes from other devices.
 setInterval(()=>{if(current&&!busy)sync();},45000);
}
