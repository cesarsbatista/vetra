// VETRA V1.3 — shared household finance, authenticated Supabase only
const cfg=window.VETRA_SUPABASE||{};
const status=document.createElement('div');status.id='vetra-sync-status';status.className='vetra-sync-status';status.hidden=true;
document.querySelector('.app')?.prepend(status);
const panel=document.createElement('div');panel.id='vetra-family-setup';panel.className='vetra-family-setup';panel.hidden=true;document.body.append(panel);
let sb=null,user=null,house=null,rev=null,channel=null,saveChain=Promise.resolve(),pending=0,conflict=false,loading=false,refreshAfterSave=false;
const savedLocalKey='vetra:v1',backupKey=id=>'vetra:v1:precloud:'+id;
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cleanPayload=p=>({items:Array.isArray(p?.items)?p.items:[],cards:Array.isArray(p?.cards)?p.cards:[],budgets:p?.budgets&&typeof p.budgets==='object'?p.budgets:{},settings:p?.settings&&typeof p.settings==='object'?p.settings:{},accounts:Array.isArray(p?.accounts)?p.accounts:[],fixed:Array.isArray(p?.fixed)?p.fixed:[],investments:Array.isArray(p?.investments)?p.investments:[]});
function notify(message,type='info'){status.hidden=false;status.textContent=message;status.dataset.kind=type}
function clearStatus(){status.hidden=true;status.textContent=''}
function showSetup(html){panel.hidden=false;panel.innerHTML='<div class="family-dialog"><div class="family-icon">V</div>'+html+'</div>'}
function hideSetup(){panel.hidden=true;panel.innerHTML=''}
function setupRoot(invites=[]){
 showSetup('<p class="family-kicker">VETRA · ORÇAMENTO FAMILIAR</p><h1>Configure seu espaço financeiro.</h1><p>Crie um orçamento para compartilhar ou aceite um convite enviado ao seu e-mail.</p>'+
 invites.map(i=>'<div class="family-invite"><strong>Convite para orçamento compartilhado</strong><small>Válido até '+new Date(i.expires_at).toLocaleDateString('pt-BR')+'</small><button class="family-primary" data-accept="'+safe(i.household_id)+'">Participar do orçamento</button></div>').join('')+
 '<form id="familyCreate"><label for="familyName">Nome do orçamento</label><input id="familyName" maxlength="90" required value="Nossa família"><button class="family-primary" type="submit">Criar orçamento familiar</button></form><button type="button" class="family-subtle" id="familyRefresh">Atualizar convites</button><p class="family-note">Se ainda não recebeu convite, informe seu e-mail ao proprietário do orçamento.</p><p id="familyError" role="alert" class="family-error"></p>');
}
function setupError(e){const field=panel.querySelector('#familyError');if(field)field.textContent=e?.message||String(e)}
function householdPanel(){
 if(!house)return '<div class="card"><h2>Orçamento familiar</h2><p>Conecte-se à nuvem para compartilhar seus dados.</p></div>';
 return '<div class="card"><h2>Orçamento familiar</h2><div class="flex"><div><strong>'+safe(house.name)+'</strong><p class="subtitle">'+(house.owner_id===user.id?'Proprietário':'Participante')+' · '+safe(user.email)+'</p></div><span class="pill">Nuvem</span></div>'+
 (house.owner_id===user.id?'<form id="familyInviteForm"><div class="field"><label>Convidar por e-mail</label><input type="email" name="email" required placeholder="email@exemplo.com"></div><button class="secondary">Criar convite</button></form><p class="muted small">A outra pessoa entra com o próprio e-mail e seleciona “Participar do orçamento”.</p>':'<p class="muted small">Você participa deste orçamento compartilhado.</p>')+
 '<div class="extra-actions"><button class="secondary" id="vetraImportLocal">Importar meus lançamentos locais</button><button class="secondary" id="vetraRefreshCloud">Atualizar da nuvem</button></div><p class="muted small">A importação incorpora apenas registros locais ainda não encontrados na nuvem. Faça backup antes de importar.</p></div>';
}
function enhanceMore(){
 const tab=document.querySelector('.tabs .tab.active')?.dataset.tab;
 if(tab!=='mais')return;
 const main=document.getElementById('main');if(main&&!main.querySelector('#familyInviteForm')&&!main.querySelector('#vetraImportLocal'))main.insertAdjacentHTML('afterbegin',householdPanel());
}
const moreObserver=new MutationObserver(()=>{if(house&&document.querySelector('.tabs .tab.active')?.dataset.tab==='mais')enhanceMore()});
moreObserver.observe(document.getElementById('main'),{childList:true});
async function myMembership(){
 const {data,error}=await sb.from('vetra_members').select('household_id').eq('user_id',user.id).maybeSingle();
 if(error)throw error;return data;
}
async function getInvitations(){
 const {data,error}=await sb.from('vetra_invites').select('id,household_id,expires_at').eq('email',user.email.toLowerCase()).gt('expires_at',new Date().toISOString());
 if(error)throw error;return data||[];
}
async function ensureHousehold(){
 const member=await myMembership();
 if(!member){house=null;setupRoot(await getInvitations());return}
 const {data,error}=await sb.from('vetra_households').select('id,name,owner_id').eq('id',member.household_id).single();
 if(error)throw error;house=data;await loadCloud(true);hideSetup();listen();enhanceMore();
}
async function makeHousehold(name){
 const {data,error}=await sb.from('vetra_households').insert({name,owner_id:user.id}).select('id,name,owner_id').single();
 if(error)throw error;
 const member=await sb.from('vetra_members').insert({household_id:data.id,user_id:user.id});if(member.error)throw member.error;
 const initial={items:[],cards:[],budgets:{},settings:{name},accounts:[],fixed:[],investments:[]};
 const doc=await sb.from('vetra_finances').insert({household_id:data.id,payload:initial,updated_by:user.id});
 if(doc.error)throw doc.error;
 house=data;rev=0;await ensureHousehold();
}
async function acceptInvite(householdId){
 const {error}=await sb.from('vetra_members').insert({household_id:householdId,user_id:user.id});
 if(error)throw error;await ensureHousehold();
}
async function loadCloud(first=false){
 if(!house||pending||conflict)return;
 const {data,error}=await sb.from('vetra_finances').select('payload,revision').eq('household_id',house.id).maybeSingle();
 if(error)throw error;
 if(!data){notify('Orçamento ainda sem dados; solicite ao proprietário que conclua a criação.','error');return}
 if(!first&&rev!==null&&data.revision===rev)return;
 if(first){
  const existing=localStorage.getItem(savedLocalKey);
  if(existing&&!localStorage.getItem(backupKey(user.id)))localStorage.setItem(backupKey(user.id),existing);
 }
 rev=data.revision;
 window.VETRA_APP?.replace(cleanPayload(data.payload),false);
 notify('Dados sincronizados com o orçamento familiar.','ok');
}
function listen(){
 if(channel)sb.removeChannel(channel);
 channel=sb.channel('vetra-finance-'+house.id).on('postgres_changes',{event:'UPDATE',schema:'public',table:'vetra_finances',filter:'household_id=eq.'+house.id},e=>{
  if(e.new?.updated_by===user.id)return;
  if(pending||conflict){refreshAfterSave=true;notify('Outra pessoa fez alterações. Atualização pendente até terminar a sincronização.','warn');return}
  loadCloud().catch(er=>notify(er.message,'error'));
 }).subscribe();
}
function queueSave(db){
 if(!house||!user||conflict)return;
 const sourceHouse=house.id,sourceUser=user.id,sourceClient=sb;
 const snapshot=cleanPayload(structuredClone(db));
 pending++;
 notify('Sincronizando alterações…');
 saveChain=saveChain.then(async()=>{
  if(conflict||!house||!user||house.id!==sourceHouse||user.id!==sourceUser||sb!==sourceClient)return;
  const {data,error}=await sb.rpc('vetra_save_finances',{p_household:sourceHouse,p_payload:snapshot,p_expected:rev});
  if(error){conflict=true;throw error}
  rev=data;
 }).catch(err=>{notify('Não foi possível sincronizar. Dados mantidos neste navegador. Faça backup JSON antes de atualizar. '+err.message,'error')}).finally(()=>{
  pending=Math.max(0,pending-1);
  if(!pending&&!conflict){notify('Alterações salvas na nuvem.','ok');if(refreshAfterSave){refreshAfterSave=false;loadCloud().catch(e=>notify(e.message,'error'));}}
 });
}
async function connect(client,session){
 sb=client;user=session?.user||null;
 if(!sb||!user){disconnect();return}
 if(loading||house&&house.id)return;
 loading=true;
 try{await ensureHousehold()}catch(err){notify('Erro ao abrir orçamento: '+err.message,'error');showSetup('<h1>Não foi possível carregar seus dados</h1><p>'+safe(err.message)+'</p><button class="family-primary" id="familyRefresh">Tentar novamente</button>')}
 finally{loading=false}
}
function disconnect(){
 if(channel&&sb)sb.removeChannel(channel);
 channel=null;house=null;user=null;rev=null;pending=0;conflict=false;refreshAfterSave=false;
 hideSetup();clearStatus();
 const original=localStorage.getItem(savedLocalKey);
 if(original){try{window.VETRA_APP?.replace(cleanPayload(JSON.parse(original)),false)}catch(e){}}
 else window.VETRA_APP?.replace({items:[],cards:[],budgets:{},settings:{}},false);
}
panel.addEventListener('submit',async e=>{
 if(e.target.id!=='familyCreate')return;
 e.preventDefault();const btn=e.target.querySelector('button');btn.disabled=true;
 try{await makeHousehold(e.target.querySelector('#familyName').value.trim())}catch(err){setupError(err)}finally{btn.disabled=false}
});
panel.addEventListener('click',async e=>{
 const accept=e.target.closest('[data-accept]');
 if(accept){accept.disabled=true;try{await acceptInvite(accept.dataset.accept)}catch(err){setupError(err)}finally{accept.disabled=false}}
 if(e.target.id==='familyRefresh')try{await ensureHousehold()}catch(err){setupError(err)}
});
document.addEventListener('submit',async e=>{
 if(e.target.id!=='familyInviteForm')return;
 e.preventDefault();if(!house||house.owner_id!==user.id)return;
 const email=e.target.elements.email.value.trim().toLowerCase();
 if(!email||email===user.email)return alert('Informe outro endereço de e-mail.');
 const {error}=await sb.from('vetra_invites').upsert({household_id:house.id,email,created_by:user.id,expires_at:new Date(Date.now()+14*864e5).toISOString()},{onConflict:'household_id,email'});
 if(error)alert('Não foi possível criar convite: '+error.message);
 else{e.target.reset();alert('Convite criado para '+email+'. A pessoa pode entrar no VETRA com esse e-mail e aceitar o orçamento. Não é enviado um e-mail de convite automaticamente.')}
});
document.addEventListener('click',async e=>{
 if(e.target.id==='vetraRefreshCloud'){
  if(pending||conflict){if(!confirm('Há dados locais não sincronizados. Atualizar pode descartar essas alterações. Exporte um backup JSON antes.'))return;conflict=false;pending=0}
  try{await loadCloud()}catch(err){alert(err.message)}
 }
 if(e.target.id==='vetraImportLocal'){
  if(!house||pending||conflict)return alert('Conclua a sincronização antes de importar.');
  const raw=localStorage.getItem(backupKey(user.id));
  if(!raw)return alert('Nenhum histórico local anterior ao login foi encontrado neste navegador.');
  let local;try{local=cleanPayload(JSON.parse(raw))}catch(err){return alert('Não foi possível ler o backup local.')}
  const current=window.VETRA_APP.get();
  const ids=new Set(current.items.map(x=>x.id));
  const extra=local.items.filter(x=>!ids.has(x.id));
  if(!extra.length)return alert('Todos os lançamentos locais já estão na nuvem.');
  if(!confirm('Importar '+extra.length+' lançamentos locais para o orçamento compartilhado? Os lançamentos existentes serão mantidos.'))return;
  current.items.push(...extra);window.VETRA_APP.replace(current,false);queueSave(current);
 }
});
window.VETRA_CLOUD={connect,disconnect,queueSave,settingsHTML:householdPanel,canLogout:()=>!pending&&!conflict,get user(){return user},get house(){return house}};
window.addEventListener('vetra:auth',e=>{
 const s=e.detail?.session;
 if(s){window.VETRA_LAST_USER_ID=s.user.id;connect(e.detail.client,s)}
 else disconnect();
});
if(window.VETRA_CURRENT_SESSION&&window.VETRA_CLIENT){
 const s=window.VETRA_CURRENT_SESSION;
 window.VETRA_LAST_USER_ID=s.user.id;connect(window.VETRA_CLIENT,s);
}
