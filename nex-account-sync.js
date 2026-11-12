/* NEX Contas: login seguro e sincronização por usuário; o armazenamento local continua independente. */
import {initializeApp,getApps} from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js';
import {getAuth,onAuthStateChanged,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,sendPasswordResetEmail,GoogleAuthProvider,signInWithPopup} from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js';
import {getFirestore,collection,doc,getDocs,setDoc,serverTimestamp} from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js';
const cfg=window.NEX_FIREBASE_CONFIG;
const panel=document.createElement('dialog');panel.id='nexAccountDialog';
panel.innerHTML=`<div class="nex-account-heading"><strong>Conta NEX</strong><button type="button" id="nexAccountClose" aria-label="Fechar">×</button></div><p id="nexAccountStatus">Conectando ao serviço de contas…</p><div id="nexAccountGuest"><button type="button" id="nexAccountGoogle" class="nex-account-google"><span aria-hidden="true">G</span> Continuar com Google</button><div class="nex-account-separator">ou entrar com e-mail</div><form id="nexAccountForm"><label>E-mail<input id="nexAccountEmail" autocomplete="email" type="email" required></label><label>Senha<input id="nexAccountPassword" autocomplete="current-password" type="password" minlength="6" required></label><div class="nex-account-actions"><button type="submit">Entrar</button><button type="button" id="nexAccountRegister">Criar conta</button><button type="button" id="nexAccountReset">Recuperar senha</button></div></form></div><div id="nexAccountConnected" hidden><p id="nexAccountWho"></p><p class="nex-account-help">Suas fichas, campanhas locais e homebrews são mantidos neste navegador e podem ser sincronizados com a sua conta. Não compartilhe sua senha.</p><div class="nex-account-actions"><button id="nexAccountSync" type="button">Sincronizar agora</button><button id="nexAccountLogout" type="button">Sair da conta</button></div></div><small id="nexAccountMessage" role="status"></small>`;
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
#nexAccountDialog [hidden]{display:none!important}`;
document.head.append(css);document.body.append(panel);
const open=document.getElementById('nexAccountOpen')||document.createElement('button');open.id='nexAccountOpen';open.type='button';open.textContent='Conta NEX';
if(!open.isConnected)(document.querySelector('.topinner')||document.body).append(open);
const $=id=>document.getElementById(id);
const status=t=>{$('nexAccountStatus').textContent=t;};
const message=t=>{$('nexAccountMessage').textContent=t;};
open.addEventListener('click',()=>panel.showModal());$('nexAccountClose').onclick=()=>panel.close();
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
    const full=merge(normalizeItems(items),normalizeItems(r?.payload?.items),idFn);
    // Never delete cloud-only entries or local entries during first sign-in.
    if(JSON.stringify(full)!==JSON.stringify(items))patches.push({id:name,entry:{type:name,deleted:false,payload:{items:full}}});
    if(!r||JSON.stringify(r.payload?.items)!==JSON.stringify(full)||name==='homebrew'&&JSON.stringify(r.payload?.advanced||[])!==JSON.stringify(advanced())){
      uploads.push({key:name,type:name,payload:{items:full,...(name==='homebrew'?{advanced:merge(advanced(),r?.payload?.advanced,x=>x.id||[x.type,x.name].join(':'))}:{})}});
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
 $('nexAccountSync').onclick=async()=>{
  if(accountSwitchBlocked){
   if(!confirm('Este navegador já foi usado com outra conta NEX. Misturar os arquivos locais com a conta atual pode revelar fichas pessoais. Deseja realmente sincronizar estes arquivos com esta conta?'))return;
   accountSwitchBlocked=false;
  }
  await sync();
 };
 $('nexAccountLogout').onclick=async()=>{try{await signOut(auth);}catch(e){message('Falha ao sair da conta.');}};
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
 $('nexAccountForm').onsubmit=async e=>{e.preventDefault();try{await signInWithEmailAndPassword(auth,$('nexAccountEmail').value.trim(),$('nexAccountPassword').value);}catch(error){message('Não foi possível entrar: '+(error.code||'verifique e-mail e senha'));}};
 $('nexAccountRegister').onclick=async()=>{
  const email=$('nexAccountEmail').value.trim();
  const password=$('nexAccountPassword').value;
  const emailInput=$('nexAccountEmail');
  if(!emailInput.validity.valid||!email){message('Digite um endereço de e-mail válido.');emailInput.focus();return;}
  if(password.length<6){message('A senha precisa ter pelo menos 6 caracteres.');$('nexAccountPassword').focus();return;}
  message('Criando sua conta…');
  try{await createUserWithEmailAndPassword(auth,email,password);}
  catch(error){
   const code=error?.code||'';
   const friendly={
    'auth/email-already-in-use':'Este e-mail já possui uma conta. Use Entrar ou Recuperar senha.',
    'auth/invalid-email':'Digite um endereço de e-mail válido.',
    'auth/weak-password':'Escolha uma senha mais forte.',
    'auth/network-request-failed':'Não foi possível conectar. Verifique sua internet e tente novamente.',
    'auth/operation-not-allowed':'O cadastro por e-mail e senha não está ativado no Firebase.'
   };
   message(friendly[code]||'Não foi possível criar a conta: '+(code||'verifique os dados'));
  }
 };
 $('nexAccountReset').onclick=async()=>{const email=$('nexAccountEmail').value.trim();if(!email){message('Digite seu e-mail antes de recuperar a senha.');return;}try{await sendPasswordResetEmail(auth,email);message('Se a conta existir, você receberá instruções de recuperação.');}catch(error){message('Não foi possível enviar a recuperação: '+(error.code||'erro'));}};
 onAuthStateChanged(auth,user=>{
  current=user;ready=false;clearTimeout(timer);dirty=false;
  let previous='';try{previous=localStorage.getItem('nex_account_last_uid')||'';}catch(e){}
  accountSwitchBlocked=!!user&&!!previous&&previous!==user.uid;
  $('nexAccountGuest').hidden=!!user;$('nexAccountConnected').hidden=!user;
  if(user){$('nexAccountWho').textContent=user.email||'Conta conectada';status(accountSwitchBlocked?'Outra conta foi usada neste navegador':'Conta conectada · verificando arquivos');
   if(accountSwitchBlocked)message('Sincronização automática pausada para evitar misturar dados de contas diferentes. Use Sincronizar agora somente se desejar compartilhar estes arquivos com a conta atual.');
   else setTimeout(sync,900);}
  else{status('Entre ou crie uma conta para sincronizar suas fichas.');message('O NEX continua funcionando sem login neste navegador.');}
 });
 // Periodic reconciliation while signed in, including changes from other devices.
 setInterval(()=>{if(current&&!busy)sync();},45000);
}
