/* VETRA V2 | visão desktop/mobile e finanças familiares */
(function(){
'use strict';
const KEY='vetra:v1',ROOT=document.getElementById('main'),NAV=document.querySelector('.tabs'),HDR=document.querySelector('.app header');
const EXPENSE_CATS=['Supermercado','Alimentação e restaurantes','Moradia','Contas domésticas','Transporte','Combustível','Saúde','Farmácia','Educação','Roupas e acessórios','Beleza e cuidados pessoais','Lazer e entretenimento','Viagens','Assinaturas e serviços digitais','Impostos e taxas','Seguros','Empréstimos e financiamentos','Compras diversas','Outros'];
const INCOME_CATS=['Salário','Investimentos','Benefícios','Empréstimos','13º salário','Férias','Reembolsos','Outras receitas'];
const FIXED_CATS=['Financiamento imobiliário','Aluguel','Condomínio','Energia elétrica','Água e esgoto','Internet e telefonia','Empréstimos e consignados','Seguros','Mensalidades','Assinaturas','Impostos recorrentes','Outros'];
const BRANDS=['Visa','Mastercard','Elo','American Express','Hipercard','Diners Club','Discover','Outra'];
const BANKS=['Banco do Brasil','Itaú','Caixa','Bradesco','Nubank','Santander','Inter','C6 Bank','BTG Pactual','Sicoob','Sicredi','Riachuelo','Renner','PicPay','Mercado Pago','Outro'];
const CM=(v)=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const esc=(v)=>String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const uid=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():'v2-'+Date.now()+'-'+Math.random().toString(36).slice(2);
const iso=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
const today=()=>iso(new Date());
const ym=d=>String(d||'').slice(0,7);
const addMonth=(yearmonth,offset)=>{const [y,m]=yearmonth.split('-').map(Number);const d=new Date(y,m-1+offset,1);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')};
const monthTitle=s=>{const [y,m]=s.split('-').map(Number);let v=new Date(y,m-1,1).toLocaleString('pt-BR',{month:'long'});return v.charAt(0).toUpperCase()+v.slice(1)+'/'+y};
const clampDay=(y,m,day)=>Math.min(day,new Date(y,m,0).getDate());
const monthDate=(s,day)=>{const [y,m]=s.split('-').map(Number);return iso(new Date(y,m-1,clampDay(y,m,day)))};
const initial={items:[],cards:[],budgets:{},settings:{name:'Família'},accounts:[],fixed:[],investments:[]};
let db;try{db=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
db=normalize(db);
function normalize(data){
const a=data&&typeof data==='object'?data:{};
return {items:Array.isArray(a.items)?a.items:[],cards:Array.isArray(a.cards)?a.cards:[],budgets:a.budgets&&typeof a.budgets==='object'?a.budgets:{},settings:a.settings&&typeof a.settings==='object'?a.settings:{name:'Família'},accounts:Array.isArray(a.accounts)?a.accounts:[],fixed:Array.isArray(a.fixed)?a.fixed:[],investments:Array.isArray(a.investments)?a.investments:[]};
}
let page='inicio',section='cartoes',month=ym(today()),editItem=null,editCard=null,editAccount=null,editFixed=null,editInvestment=null;
let mode='despesa',formPayment='Pix',creditType='avista',working=false;
const opts=(arr,value)=>arr.map(x=>'<option value="'+esc(x)+'" '+(x===value?'selected':'')+'>'+esc(x)+'</option>').join('');
const field=(label,name,value='',type='text',extra='')=>'<label class="v2-field">'+esc(label)+'<input name="'+esc(name)+'" type="'+type+'" value="'+esc(value)+'" '+extra+'></label>';
const select=(label,name,arr,value)=>'<label class="v2-field">'+esc(label)+'<select name="'+esc(name)+'">'+opts(arr,value)+'</select></label>';
const banner=(title,subtitle='')=>'<div class="v2-heading"><div><h1>'+title+'</h1><p>'+subtitle+'</p></div></div>';
const pill=(text)=>'<span class="v2-pill">'+esc(text)+'</span>';
const action=(value,cmd,secondary=false)=>'<button class="'+(secondary?'v2-secondary':'v2-primary')+'" data-action="'+cmd+'">'+value+'</button>';
const spent=x=>x.type==='despesa'||x.type==='cartao';
const forMonth=s=>db.items.filter(x=>ym(x.date)===s);
const sum=a=>a.reduce((v,x)=>v+Number(x.amount||0),0);
function write(){
if(window.VETRA_CLOUD?.house)window.VETRA_CLOUD.queueSave(db);
else localStorage.setItem(KEY,JSON.stringify(db));
render();
}
function titleNav(){
NAV.innerHTML=[['inicio','⌂','Início','Início'],['lancamentos','☷','Lançamentos','Lanç.'],['cartoes','▤','Cartões','Cartões'],['investimentos','◇','Investimentos','Invest.'],['planejamento','▦','Planejamento','Plan.'],['configuracoes','⚙','Configurações','Ajustes']].map(n=>'<button class="tab '+(page===n[0]?'active':'')+'" data-page="'+n[0]+'"><span class="ico">'+n[1]+'</span><span data-short="'+n[3]+'">'+n[2]+'</span></button>').join('');
if(!HDR.querySelector('[data-action="new"]'))HDR.innerHTML='<div class="brand"><span class="mark"></span><span>VETRA</span><small>V2</small></div><button class="v2-primary v2-header-add" data-action="new">＋ <span>Novo lançamento</span></button><button id="profile" type="button" hidden aria-hidden="true"></button>';
}
function monthBar(){return '<div class="v2-month"><button data-action="prevMonth" aria-label="Mês anterior">‹</button><strong>'+monthTitle(month)+'</strong><button data-action="nextMonth" aria-label="Próximo mês">›</button></div>'}
function bankName(name){const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();const n=normalize(name);return BANKS.find(x=>x!=='Outro'&&n.includes(normalize(x)))||(n.startsWith('bb ')||n==='bb'?'Banco do Brasil':'Instituição')}
function logo(name){
const brand=bankName(name);
const paths={
'Banco do Brasil':'Banco_do_Brasil_logo.svg',
'Itaú':'Itaú_Unibanco_logo_2023.svg',
'Caixa':'Caixa_Econômica_Federal_logo_2026.svg',
'Bradesco':'Banco_Bradesco_logo.svg',
'Nubank':'Nubank_logo_2021.svg',
'Santander':'Banco_Santander_Logotipo.svg'
};
const url=paths[brand]?'https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(paths[brand]):'';
return '<span class="v2-bank-logo" aria-label="'+esc(brand)+'">'+esc(brand==='Instituição'?'◇':brand.slice(0,2).toUpperCase())+
(url?'<img src="'+url+'" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">':'')+'</span>';
}
function palette(c){
const text=(c.name||'').toLowerCase();
if(/smiles platinum/.test(text))return 'smiles';
if(/nubank/.test(text))return 'purple';
if(/black|infinite/.test(text))return 'black';
if(/caixa/.test(text))return 'blue';
if(/itau|itaú/.test(text))return 'orange';
if(/riachuelo|renner/.test(text))return 'dark';
if(/santander/.test(text))return 'red';
if(/banco do brasil/.test(text))return 'gold';
return 'dark';
}
function plastic(c){
return '<div class="v2-plastic v2-plastic--'+palette(c)+'"><div class="v2-plastic-head">'+logo(c.name)+'<span>'+esc(c.name||'Cartão')+'</span></div><div class="v2-plastic-num">'+(c.last4?'•••• '+esc(c.last4):'•••• ••••')+'</div><div class="v2-plastic-foot"><div><small>TITULAR</small><strong>'+esc(c.holder||'Não informado')+'</strong></div><b>'+esc(c.brand||'Cartão')+'</b></div></div>';
}
function fixedOccurrence(f,s){
if(!f.active)return null;
if(s<ym(f.start||s)||(f.end&&s>ym(f.end)))return null;
const interval=f.frequency==='Anual'?12:1;
const start=ym(f.start||s),a=start.split('-').map(Number),b=s.split('-').map(Number);
if((b[0]-a[0])*12+b[1]-a[1]<0||((b[0]-a[0])*12+b[1]-a[1])%interval!==0)return null;
if(f.termCount&&((b[0]-a[0])*12+b[1]-a[1])/interval+Number(f.currentInstallment||1)>Number(f.termCount))return null;
const paid=f.payments?.[s];
const paymentNumber=((b[0]-a[0])*12+b[1]-a[1])/interval+Number(f.currentInstallment||1);
return {paymentNumber,id:f.id,description:f.name,amount:Number(paid?.amount??f.amount),date:monthDate(s,Number(f.due)||1),category:f.category,paid:!!paid?.paid,realDate:paid?.date||'',method:f.method,source:f};
}
const fixedForMonth=s=>db.fixed.map(f=>fixedOccurrence(f,s)).filter(Boolean);
function monthly(){
const its=forMonth(month),inc=sum(its.filter(x=>x.type==='receita'&&x.status==='realizado')),out=sum(its.filter(x=>spent(x)&&x.status==='realizado'));
const plannedIncome=sum(its.filter(x=>x.type==='receita')),plannedOut=sum(its.filter(spent));
const fixed=fixedForMonth(month),fixedActual=fixed.filter(x=>x.paid).reduce((a,x)=>a+x.amount,0),fixedPlan=fixed.reduce((a,x)=>a+x.amount,0);
const investmentFlows=its.filter(x=>x.type==='investimento');
const transferValue=(x)=>x.category==='Resgate'?-Number(x.amount||0):Number(x.amount||0);
const invActual=investmentFlows.filter(x=>x.status==='realizado').reduce((v,x)=>v+transferValue(x),0);
const invPlan=investmentFlows.reduce((v,x)=>v+transferValue(x),0);
return {its,inc,out,fixed,fixedActual,fixedPlan,invActual,invPlan,net:inc-out-fixedActual-invActual,projected:plannedIncome-plannedOut-fixedPlan-invPlan}
}
function home(){
const a=monthly(),invest=investmentTotals(),categories={};
a.its.filter(spent).forEach(x=>{const k=x.category||'Outros';categories[k]=(categories[k]||0)+Number(x.amount||0)});
return banner('Visão geral','Seu controle financeiro pessoal e familiar')+monthBar()+
'<div class="v2-overview"><div class="v2-hero"><small>Saldo realizado do mês</small><strong>'+CM(a.net)+'</strong><span>Projeção '+CM(a.projected)+'</span></div>'+
[['Receitas recebidas',a.inc],['Despesas variáveis',a.out],['Despesas fixas pagas',a.fixedActual],['Patrimônio investido',invest.total]].map(([t,v])=>'<div class="v2-kpi"><small>'+t+'</small><strong>'+CM(v)+'</strong></div>').join('')+'</div>'+
'<div class="v2-columns"><section class="v2-panel"><div class="v2-panel-top"><h2>Despesas por categoria</h2>'+pill(monthTitle(month))+'</div>'+
(Object.entries(categories).length?Object.entries(categories).sort((a,b)=>b[1]-a[1]).map(([key,value])=>'<div class="v2-metric"><span>'+esc(key)+'</span><b>'+CM(value)+'</b></div>').join(''):'<p class="v2-empty">Ainda não há despesas variáveis registradas.</p>')+'</section>'+
'<section class="v2-panel"><div class="v2-panel-top"><h2>Próximos compromissos fixos</h2>'+action('Ver planejamento','planning',true)+'</div>'+
(a.fixed.length?a.fixed.slice(0,6).map(f=>'<div class="v2-metric"><span>'+esc(f.description)+' · Dia '+esc(f.source.due)+(f.paid?' · Pago':f.date<today()?' · Atrasado':' · Previsto')+'</span><b>'+CM(f.amount)+'</b></div>').join(''):'<p class="v2-empty">Nenhuma despesa fixa cadastrada.</p>')+'</section></div>';
}
function itemLabel(x){return x.type==='receita'?(x.origin||x.description):(x.description||'Sem descrição')}
function itemRow(x){
const card=db.cards.find(c=>c.id===x.cardId),method=x.payment||x.method||(x.type==='cartao'?'Crédito':'');
const desc=itemLabel(x)+(x.installmentNo?' · '+x.installmentNo+'/'+x.installmentCount:'');
return '<div class="v2-item"><div class="v2-item-main"><strong>'+esc(desc)+'</strong><small>'+esc(x.category||'Outros')+' · '+esc(x.date)+' · '+esc(method)+(card?' · '+esc(card.nickname||card.name):'')+'</small></div><b class="'+(x.type==='receita'?'v2-positive':'')+'">'+(x.type==='receita'?'+ ':'− ')+CM(x.amount)+'</b><button class="v2-icon" data-edit-item="'+esc(x.id)+'" aria-label="Editar lançamento">✎</button></div>';
}
function transactions(){
const list=forMonth(month).slice().sort((a,b)=>b.date.localeCompare(a.date));
return banner('Lançamentos','Histórico de entradas e despesas')+monthBar()+
'<div class="v2-panel">'+(list.length?list.map(itemRow).join(''):'<p class="v2-empty">Nenhum lançamento neste mês.</p>')+'</div>';
}
function creditFirstMonth(date,card){
const buy=ym(date),closing=Number(card?.closing)||10,day=Number(String(date).slice(8));
const closeMonth=day>closing?addMonth(buy,1):buy;
const due=Number(card?.due)||15;
return due<=closing?addMonth(closeMonth,1):closeMonth;
}
function newForm(){
const x=db.items.find(v=>v.id===editItem)||{};
if(editItem){mode=x.type==='receita'?'receita':x.type==='investimento'?'investimento':'despesa';formPayment=x.payment||(x.type==='cartao'?'Crédito':'Pix');creditType=Number(x.installmentCount)>1?'parcelado':'avista'}
const isExpense=mode==='despesa',isIncome=mode==='receita';
const cardOptions=db.cards.map(c=>[c.id,c.nickname||c.name]);
const accountOptions=db.accounts.map(c=>[c.id,(c.nickname||c.bank)+' · '+c.type]);
const payment=formPayment;
const paymentFields=isExpense?
 select('Pagamento','payment',['Crédito','Débito','Pix','Dinheiro'],payment)+
 (payment==='Crédito'?'<div class="v2-field"><label>Cartão</label><select name="cardId" required>'+cardOptions.map(v=>'<option value="'+esc(v[0])+'" '+(x.cardId===v[0]?'selected':'')+'>'+esc(v[1])+'</option>').join('')+'</select>'+(cardOptions.length?'':'<small>Cadastre um cartão em Configurações.</small>')+'</div>'+
 select('Tipo de compra','creditType',['À vista','Parcelado'],creditType==='parcelado'?'Parcelado':'À vista')+
 (creditType==='parcelado'?select('Parcelas','installments',Array.from({length:23},(_,i)=>String(i+2)),String(x.installmentCount||2)):''):'')+
 (payment==='Pix'||payment==='Débito'?'<label class="v2-field">Conta<select name="accountId" required>'+accountOptions.map(v=>'<option value="'+esc(v[0])+'" '+(x.accountId===v[0]?'selected':'')+'>'+esc(v[1])+'</option>').join('')+'</select>'+(accountOptions.length?'':'<small>Cadastre uma conta em Configurações.</small>')+'</label>':''):'';
const categories=[...(isIncome?INCOME_CATS:isExpense?EXPENSE_CATS:['Aplicação','Resgate','Rendimento'])];if(x.category&&!categories.includes(x.category))categories.unshift(x.category);
const descriptionLabel=isIncome?'Origem':isExpense?'Estabelecimento / Serviço':'Investimento / Instituição';
return banner(editItem?'Editar lançamento':'Novo lançamento','Registre suas movimentações financeiras')+
'<div class="v2-segments">'+[['despesa','Despesa'],['receita','Receita'],['investimento','Investimento']].map(v=>'<button class="'+(mode===v[0]?'selected':'')+'" data-mode="'+v[0]+'">'+v[1]+'</button>').join('')+'</div>'+
'<form id="v2-entry" class="v2-panel v2-form">'+paymentFields+
field('Valor total (R$)','amount',x.installmentGroup&&x.installmentCount?db.items.filter(i=>i.installmentGroup===x.installmentGroup).reduce((v,i)=>v+Number(i.amount),0):x.amount??'','number','min="0.01" step="0.01" required')+
field(descriptionLabel,'description',x.origin||x.description||'','text','required maxlength="100"')+
select('Categoria','category',categories,categories.includes(x.category)?x.category:categories[0])+
'<div class="v2-two">'+field('Data','date',x.purchaseDate||x.date||today(),'date','required')+select('Situação','status',['previsto','realizado'],x.status||(isExpense&&payment==='Crédito'?'previsto':'realizado'))+'</div>'+
'<label class="v2-field">Observações<textarea name="notes">'+esc(x.notes||'')+'</textarea></label>'+
'<div class="v2-buttons"><button type="submit" class="v2-primary">Salvar lançamento</button>'+(editItem?'<button type="button" class="v2-secondary v2-danger" data-action="deleteItem">Excluir</button>':'')+'</div>'+
(isExpense&&payment==='Crédito'?'<p class="v2-help">Compras parceladas são lançadas nas faturas mensais correspondentes. O valor total é dividido sem duplicar despesas.</p>':'')+
'</form>';
}
function cardInfo(c){
const name=c.nickname||c.name,pl=plastic(c);
return '<article class="v2-panel v2-card-row"><div class="v2-order"><button data-card-move="'+esc(c.id)+'" data-dir="-1" aria-label="Mover para cima">↑</button><button data-card-move="'+esc(c.id)+'" data-dir="1" aria-label="Mover para baixo">↓</button></div>'+
'<div class="v2-card-flex">'+pl+'<div class="v2-card-meta">'+(c.primary?pill('Principal'):'')+
'<p><b>Fechamento:</b> dia '+esc(c.closing)+'</p><p><b>Vencimento:</b> dia '+esc(c.due)+'</p>'+
'<div class="v2-buttons">'+action('Editar','editCard:'+c.id,true)+action('Excluir','removeCard:'+c.id,true)+(!c.primary?action('Tornar principal','primary:'+c.id,true):'')+'</div></div></div></article>';
}
function cardsManagement(){
const ordered=db.cards.slice().sort((a,b)=>Number(!!b.primary)-Number(!!a.primary));
return '<div class="v2-panel"><div class="v2-panel-top"><h2>Cartões cadastrados</h2>'+pill(db.cards.length+' '+(db.cards.length===1?'cartão cadastrado':'cartões cadastrados'))+'</div>'+
'<div class="v2-toolbar">'+action('＋ Adicionar cartão','newCard')+'</div>'+
(ordered.map(cardInfo).join('')||'<p class="v2-empty">Nenhum cartão cadastrado.</p>')+'</div>';
}
function cardPurchases(){
const list=forMonth(month).filter(x=>x.cardId&&(x.payment==='Crédito'||x.type==='cartao'));
return banner('Cartões','Compras, parcelas e faturas')+monthBar()+
'<div class="v2-overview"><div class="v2-kpi"><small>Compras do mês</small><strong>'+CM(sum(list))+'</strong></div><div class="v2-kpi"><small>Cartões ativos</small><strong>'+db.cards.length+'</strong></div></div>'+
db.cards.map(card=>{
const purchases=list.filter(x=>x.cardId===card.id);
return '<section class="v2-panel"><div class="v2-panel-top"><h2>'+esc(card.nickname||card.name)+'</h2>'+pill(CM(sum(purchases)))+'</div>'+
'<div class="v2-statement"><p class="v2-sub">Fatura de '+monthTitle(month)+' · Vencimento dia '+esc(card.due)+'</p>'+(purchases.length?'<button type="button" class="v2-secondary" data-action="payCard:'+esc(card.id)+'">'+(purchases.every(x=>x.status==='realizado')?'Reabrir fatura':'Marcar fatura paga')+'</button>':'')+'</div>'+
(purchases.length?purchases.map(itemRow).join(''):'<p class="v2-empty">Sem compras nessa fatura.</p>')+'</section>'
}).join('')+
(!db.cards.length?'<div class="v2-panel v2-empty">Cadastre cartões em Configurações para acompanhar compras.</div>':'');
}
function portfolioAt(s){
return db.investments.reduce((total,x)=>{
const keys=Object.keys(x.snapshots||{}).filter(k=>k<=s).sort(),last=keys.at(-1);
return total+Number(last?x.snapshots[last].balance:x.initial||0);
},0);
}
function investmentTotals(){return {total:portfolioAt(month)}}
function investmentChart(){
if(!db.investments.length)return '';
const months=Array.from({length:6},(_,i)=>addMonth(month,i-5));
const values=months.map(portfolioAt),max=Math.max(1,...values);
return '<section class="v2-panel"><h2>Evolução patrimonial · últimos 6 meses</h2>'+
'<div class="v2-chart">'+months.map((s,i)=>'<div class="v2-chart-column"><div class="v2-chart-track" title="'+monthTitle(s)+': '+CM(values[i])+'"><span style="height:'+Math.max(2,Math.round(values[i]/max*100))+'%"></span></div><small>'+esc(s.slice(5))+'/'+esc(s.slice(2,4))+'</small></div>').join('')+'</div>'+
'<p class="v2-help">Saldos informados manualmente; períodos sem atualização mantêm o último saldo registrado.</p></section>';
}
function investmentsPage(){
const total=investmentTotals().total;
const monthlyYield=db.investments.reduce((a,x)=>{
const current=x.snapshots?.[month];if(!current)return a;
const older=Object.keys(x.snapshots||{}).filter(k=>k<month).sort().at(-1);
const before=older?Number(x.snapshots[older].balance):Number(x.initial||0);
return a+Number(current.balance)-before-Number(current.contribution||0)+Number(current.withdrawal||0);
},0);
return banner('Investimentos','Carteira e rendimento mensal')+monthBar()+
'<div class="v2-overview"><div class="v2-kpi"><small>Patrimônio registrado</small><strong>'+CM(total)+'</strong></div>'+
'<div class="v2-kpi"><small>Aplicações</small><strong>'+db.investments.length+'</strong></div><div class="v2-kpi"><small>Rendimento do mês</small><strong>'+CM(monthlyYield)+'</strong></div></div>'+investmentChart()+
'<div class="v2-toolbar">'+action('＋ Adicionar investimento','newInvestment')+'</div>'+
(db.investments.length?db.investments.map(x=>{
const keys=Object.keys(x.snapshots||{}).sort(),current=x.snapshots?.[month],previous=keys.filter(k=>k<month).at(-1),prev=previous?Number(x.snapshots[previous].balance):Number(x.initial||0);
const balance=current?Number(current.balance):prev,contribution=Number(current?.contribution||0),withdrawal=Number(current?.withdrawal||0);
const yieldValue=current?balance-prev-contribution+withdrawal:null;
return '<div class="v2-panel"><div class="v2-panel-top"><h2>'+esc(x.name)+'</h2>'+pill(esc(x.kind||'Investimento'))+'</div>'+
'<div class="v2-metric"><span>Instituição</span><b>'+esc(x.bank||'Não informada')+'</b></div>'+
'<div class="v2-metric"><span>Saldo registrado</span><b>'+CM(balance)+'</b></div>'+
'<div class="v2-metric"><span>Rendimento do mês</span><b>'+(yieldValue===null?'Aguardando atualização':CM(yieldValue))+'</b></div>'+
'<div class="v2-metric"><span>Rentabilidade estimada</span><b>'+(yieldValue===null||prev+contribution===0?'—':((yieldValue/(prev+contribution))*100).toFixed(2).replace('.',',')+'%')+'</b></div>'+
'<div class="v2-buttons">'+action('Atualizar mês','updateInvestment:'+x.id,true)+action('Editar','editInvestment:'+x.id,true)+action('Excluir','removeInvestment:'+x.id,true)+'</div></div>'
}).join(''):'<div class="v2-panel v2-empty">Cadastre um investimento para acompanhar os rendimentos.</div>')+
'<p class="v2-help">Rentabilidade calculada por saldo final − saldo anterior − aportes + resgates; percentual indicativo, não equivale à TIR quando há fluxos durante o mês.</p>';
}
function fixedPage(){
const list=fixedForMonth(month);
return banner('Planejamento','Orçamento e despesas fixas')+monthBar()+
'<div class="v2-segments"><button class="'+(section==='orcamento'?'selected':'')+'" data-section="orcamento">Orçamento</button><button class="'+(section!=='orcamento'?'selected':'')+'" data-section="fixas">Despesas fixas</button></div>'+
(section==='orcamento'?'<div class="v2-panel"><h2>Meta mensal</h2><form id="v2-budget">'+field('Limite de despesas (R$)','amount',db.budgets[month]??'','number','min="0" step="0.01" required')+'<button class="v2-primary">Salvar orçamento</button></form><p class="v2-help">A meta e a projeção são atualizadas com suas despesas variáveis e compromissos fixos.</p></div>':
'<div class="v2-toolbar">'+action('＋ Adicionar despesa fixa','newFixed')+'</div>'+
'<div class="v2-panel"><h2>Compromissos de '+monthTitle(month)+'</h2>'+
(list.map(f=>'<div class="v2-item"><div class="v2-item-main"><strong>'+esc(f.description)+'</strong><small>'+esc(f.category)+' · Dia '+esc(f.source.due)+(f.source.termCount?' · Parcela '+f.paymentNumber+'/'+f.source.termCount:'')+' · '+(f.paid?'Pago':f.date<today()?'Atrasado':'Previsto')+'</small></div><b>'+CM(f.amount)+'</b><button class="v2-secondary" data-action="payFixed:'+f.id+'">'+(f.paid?'Revisar':'Pagar')+'</button></div>').join('')||'<p class="v2-empty">Sem compromissos fixos neste mês.</p>')+'</div>'+
'<div class="v2-panel"><h2>Despesas cadastradas</h2>'+db.fixed.map(x=>'<div class="v2-item"><div class="v2-item-main"><strong>'+esc(x.name)+'</strong><small>'+esc(x.category)+' · '+(x.active?'Ativa':'Suspensa')+'</small></div><b>'+CM(x.amount)+'</b><button data-action="editFixed:'+x.id+'" class="v2-secondary">Editar</button></div>').join('')+'</div>');
}
function settings(){
return banner('Configurações','Contas, cartões e preferências')+
'<div class="v2-segments v2-settings-tabs">'+[['cartoes','Cartões'],['contas','Contas'],['familia','Família'],['dados','Dados']].map(a=>'<button class="'+(section===a[0]?'selected':'')+'" data-section="'+a[0]+'">'+a[1]+'</button>').join('')+'</div>'+
(section==='cartoes'?cardsManagement():section==='contas'?'<div class="v2-toolbar">'+action('＋ Adicionar conta','newAccount')+'</div>'+
'<div class="v2-panel"><h2>Contas bancárias</h2>'+
(db.accounts.map(x=>'<div class="v2-item">'+logo(x.bank)+'<div class="v2-item-main"><strong>'+esc(x.nickname||x.bank)+'</strong><small>'+esc(x.bank)+' · '+esc(x.type)+'</small></div>'+
'<button class="v2-secondary" data-action="editAccount:'+x.id+'">Editar</button><button class="v2-secondary v2-danger" data-action="removeAccount:'+x.id+'">Excluir</button></div>').join('')||'<p class="v2-empty">Nenhuma conta cadastrada.</p>')+'</div>':
section==='familia'?'<div id="v2-family-panel">'+(window.VETRA_CLOUD?.settingsHTML?.()||'<div class="v2-panel">Acesse com sua conta para criar e compartilhar o orçamento familiar.</div>')+'</div>':
'<div class="v2-panel"><h2>Seus dados</h2><div class="v2-buttons">'+action('Exportar backup JSON','backup',true)+action('Exportar CSV','csv',true)+'</div><p class="v2-help">Backups são importantes antes de grandes alterações.</p></div>')+
'<div class="v2-panel v2-exit"><h2>Conta</h2>'+pill(window.VETRA_CURRENT_SESSION?.user?.email||'Modo local')+
'<div class="v2-buttons">'+action('Sair da conta','logout',true)+'</div></div>';
}
function modal(title,content){
const e=document.getElementById('v2-modal');e.innerHTML='<div class="v2-modal-dialog"><div class="v2-modal-head"><h2>'+esc(title)+'</h2><button data-action="closeModal" aria-label="Fechar">×</button></div>'+content+'</div>';e.hidden=false;
}
function closeModal(){document.getElementById('v2-modal').hidden=true;editCard=editAccount=editFixed=editInvestment=null}
function openCard(id){
const c=db.cards.find(x=>x.id===id)||{};editCard=id||null;
modal(id?'Editar cartão':'Adicionar cartão','<form id="v2-card-form">'+field('Nome do cartão','name',c.name||'','text','required maxlength="80"')+
field('Titular','holder',c.holder||'','text','maxlength="80"')+field('Apelido','nickname',c.nickname||'','text','maxlength="32"')+
select('Bandeira','brand',BRANDS,c.brand||'Visa')+
field('Últimos quatro dígitos (opcional)','last4',c.last4||'','text','pattern="[0-9]{4}" maxlength="4" inputmode="numeric"')+
'<div class="v2-two">'+field('Dia de fechamento','closing',c.closing||5,'number','min="1" max="31" required')+
field('Dia de vencimento','due',c.due||12,'number','min="1" max="31" required')+'</div>'+
'<label class="v2-check"><input type="checkbox" name="primary" '+(c.primary?'checked':'')+'> Cartão principal</label>'+
'<p class="v2-help">A miniatura adota cores ilustrativas de acordo com o banco ou modelo. Não informe o número completo nem CVV.</p><button class="v2-primary">Salvar cartão</button></form>');
}
function openAccount(id){const a=db.accounts.find(x=>x.id===id)||{};editAccount=id||null;
modal(id?'Editar conta':'Cadastrar conta bancária','<form id="v2-account-form">'+
field('Banco','bank',a.bank||'','text','required maxlength="90" list="v2-bank-list"')+
'<datalist id="v2-bank-list">'+BANKS.filter(x=>x!=='Outro').map(x=>'<option value="'+esc(x)+'"></option>').join('')+'</datalist>'+
select('Tipo de conta','type',['Nacional','Internacional'],a.type||'Nacional')+
field('Apelido (opcional)','nickname',a.nickname||'','text','maxlength="80"')+'<button class="v2-primary">Salvar conta</button></form>');
}
function openFixed(id){
const a=db.fixed.find(x=>x.id===id)||{};editFixed=id||null;
modal(id?'Editar despesa fixa':'Nova despesa fixa','<form id="v2-fixed-form">'+
field('Descrição','name',a.name||'','text','required maxlength="100"')+
select('Categoria','category',FIXED_CATS,a.category||FIXED_CATS[0])+
field('Valor previsto (R$)','amount',a.amount??'','number','min="0" step="0.01" required')+
'<div class="v2-two">'+field('Dia do vencimento','due',a.due||10,'number','min="1" max="31" required')+
select('Frequência','frequency',['Mensal','Anual'],a.frequency||'Mensal')+'</div>'+
select('Pagamento','method',['Pix','Débito','Crédito','Dinheiro','Boleto','Transferência'],a.method||'Débito')+
'<label class="v2-field">Conta ou cartão (opcional)<select name="paymentSource"><option value="">Nenhum vínculo</option>'+db.accounts.map(x=>'<option value="conta:'+esc(x.id)+'" '+(a.paymentSource==='conta:'+x.id?'selected':'')+'>'+esc('Conta · '+(x.nickname||x.bank))+'</option>').join('')+db.cards.map(x=>'<option value="cartao:'+esc(x.id)+'" '+(a.paymentSource==='cartao:'+x.id?'selected':'')+'>'+esc('Cartão · '+(x.nickname||x.name))+'</option>').join('')+'</select></label>'+
'<div class="v2-two">'+field('Data de início','start',a.start||month+'-01','date','required')+
field('Data de término (opcional)','end',a.end||'','date')+'</div>'+
'<div class="v2-two">'+field('Total de parcelas (opcional)','termCount',a.termCount||'','number','min="1" max="600"')+field('Parcela atual no início','currentInstallment',a.currentInstallment||1,'number','min="1" max="600"')+'</div>'+
'<label class="v2-check"><input type="checkbox" name="active" '+(a.active!==false?'checked':'')+'> Despesa ativa</label>'+
'<div class="v2-buttons"><button class="v2-primary">Salvar despesa fixa</button>'+(id?'<button type="button" class="v2-secondary v2-danger" data-action="removeFixed:'+id+'">Excluir</button>':'')+'</div></form>');
}
function openInvestment(id){
const a=db.investments.find(x=>x.id===id)||{};editInvestment=id||null;
modal(id?'Editar investimento':'Cadastrar investimento','<form id="v2-invest-form">'+field('Nome','name',a.name||'','text','required maxlength="100"')+
field('Instituição','bank',a.bank||'','text','maxlength="80"')+
select('Tipo','kind',['Renda fixa','Tesouro Direto','CDB','LCI/LCA','Ações','Fundos','Previdência','Criptoativos','Outro'],a.kind||'Renda fixa')+
field('Saldo inicial (R$)','initial',a.initial||0,'number','step="0.01" min="0" required')+
'<div class="v2-buttons"><button class="v2-primary">Salvar investimento</button>'+(id?'<button type="button" class="v2-secondary v2-danger" data-action="removeInvestment:'+id+'">Excluir</button>':'')+'</div></form>');
}
function updateInvestment(id){const a=db.investments.find(x=>x.id===id);if(!a)return;
const entry=a.snapshots?.[month]||{};
modal('Atualização mensal · '+a.name,'<form id="v2-snapshot-form" data-investment="'+esc(id)+'">'+
field('Saldo final de '+monthTitle(month)+' (R$)','balance',entry.balance??'','number','required min="0" step="0.01"')+
field('Aportes do mês (R$)','contribution',entry.contribution||0,'number','min="0" step="0.01" required')+
field('Resgates do mês (R$)','withdrawal',entry.withdrawal||0,'number','min="0" step="0.01" required')+
'<button class="v2-primary">Salvar atualização</button></form>');
}
function payFixed(id){const f=db.fixed.find(x=>x.id===id);if(!f)return;const paid=f.payments?.[month]||{};
modal('Pagamento · '+f.name,'<form id="v2-pay-form" data-fixed="'+esc(id)+'">'+
field('Valor do mês (R$)','amount',paid.amount??f.amount,'number','required min="0" step="0.01"')+
field('Data do pagamento','date',paid.date||today(),'date')+
'<label class="v2-check"><input type="checkbox" name="paid" '+(paid.paid?'checked':'')+'> Marcar como pago</label>'+
'<button class="v2-primary">Salvar mês</button></form>');
}
function download(name,text,type){const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function csvExport(){const headers=['Data','Tipo','Origem/Estabelecimento','Categoria','Valor','Pagamento','Cartão','Conta','Situação'];const lines=db.items.map(x=>[x.date,x.type,itemLabel(x),x.category,x.amount,x.payment||'',db.cards.find(y=>y.id===x.cardId)?.name||'',db.accounts.find(y=>y.id===x.accountId)?.nickname||'',x.status]);download('vetra-v2-lancamentos.csv','\uFEFF'+[headers,...lines].map(a=>a.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(';')).join('\r\n'),'text/csv;charset=utf-8')}
function render(){
 titleNav();
 const pageHtml={inicio:home,lancamentos:transactions,cartoes:cardPurchases,investimentos:investmentsPage,planejamento:fixedPage,configuracoes:settings,novo:newForm};
 ROOT.innerHTML=(pageHtml[page]||home)();
}
function go(p){page=p;render();window.scrollTo({top:0,behavior:'instant'})}
function setupEntry(){
editItem=null;mode='despesa';formPayment='Pix';creditType='avista';go('novo');
}
function confirmRemoveCard(id){
const c=db.cards.find(x=>x.id===id);if(!c)return;
if(db.items.some(x=>x.cardId===id)||db.fixed.some(x=>x.paymentSource==='cartao:'+id))return alert('O cartão está vinculado a lançamentos ou despesas fixas. Altere esses vínculos antes de excluir.');
if(confirm('Excluir cartão '+c.name+'?')){db.cards=db.cards.filter(x=>x.id!==id);write()}
}
function doAction(action){
if(action==='new'){setupEntry();return}
if(action==='prevMonth'||action==='nextMonth'){month=addMonth(month,action==='prevMonth'?-1:1);render();return}
if(action==='closeModal'){closeModal();return}
if(action==='planning'){page='planejamento';section='fixas';render();return}
if(action==='newCard'){openCard(null);return}
if(action==='newAccount'){openAccount(null);return}
if(action==='newFixed'){openFixed(null);return}
if(action==='newInvestment'){openInvestment(null);return}
if(action==='backup'){download('vetra-v2-backup.json',JSON.stringify(db,null,2),'application/json');return}
if(action==='csv'){csvExport();return}
if(action==='logout'){if(window.VETRA_CLOUD&&!window.VETRA_CLOUD.canLogout())return alert('Existem alterações não sincronizadas. Faça backup antes de sair.');document.getElementById('profile')?.click();return}
const [cmd,id]=action.split(':');
if(cmd==='editCard'){openCard(id);return}
if(cmd==='removeCard'){confirmRemoveCard(id);return}
if(cmd==='primary'){db.cards=db.cards.map(x=>({...x,primary:x.id===id}));write();return}
if(cmd==='payCard'){
const purchases=forMonth(month).filter(x=>x.cardId===id&&(x.payment==='Crédito'||x.type==='cartao'));
if(!purchases.length)return;
const allPaid=purchases.every(x=>x.status==='realizado');
if(!confirm(allPaid?'Reabrir a fatura e marcar compras como previstas?':'Confirmar pagamento desta fatura? Nenhuma nova despesa será criada.'))return;
const ids=new Set(purchases.map(x=>x.id));
db.items=db.items.map(x=>ids.has(x.id)?{...x,status:allPaid?'previsto':'realizado'}:x);write();return
}
if(cmd==='editAccount'){openAccount(id);return}
if(cmd==='removeAccount'){
if(db.items.some(x=>x.accountId===id)||db.fixed.some(x=>x.paymentSource==='conta:'+id))return alert('Conta vinculada a lançamentos ou despesas fixas. Altere-os antes de excluir.');
if(confirm('Excluir conta bancária?')){db.accounts=db.accounts.filter(x=>x.id!==id);write()}return;
}
if(cmd==='editFixed'){openFixed(id);return}
if(cmd==='removeFixed'){if(confirm('Excluir essa despesa fixa e seu histórico mensal?')){db.fixed=db.fixed.filter(x=>x.id!==id);closeModal();write()}return}
if(cmd==='payFixed'){payFixed(id);return}
if(cmd==='editInvestment'){openInvestment(id);return}
if(cmd==='updateInvestment'){updateInvestment(id);return}
if(cmd==='removeInvestment'){if(confirm('Excluir o investimento e seus registros mensais?')){db.investments=db.investments.filter(x=>x.id!==id);closeModal();write()}return}
if(action==='deleteItem'){
const x=db.items.find(y=>y.id===editItem);if(!x)return;
if(confirm(x.installmentGroup?'Excluir toda a compra parcelada (todas as parcelas)?':'Excluir o lançamento?')){
db.items=db.items.filter(y=>x.installmentGroup?y.installmentGroup!==x.installmentGroup:y.id!==x.id);editItem=null;write();go('lancamentos')}return
}
}
function saveEntry(form){
const f=new FormData(form),amount=Number(f.get('amount')),date=String(f.get('date')),name=String(f.get('description')||'').trim();
if(!Number.isFinite(amount)||amount<=0||!date||!name)return alert('Preencha valor, data e descrição.');
const category=String(f.get('category')||'Outros'),status=String(f.get('status')||'realizado'),notes=String(f.get('notes')||''),old=db.items.find(x=>x.id===editItem);
const payment=mode==='despesa'?String(f.get('payment')):'',cardId=payment==='Crédito'?String(f.get('cardId')||''):null,accountId=['Pix','Débito'].includes(payment)?String(f.get('accountId')||''):null;
if(payment==='Crédito'&&!db.cards.some(x=>x.id===cardId))return alert('Cadastre um cartão em Configurações.');
if(['Pix','Débito'].includes(payment)&&!db.accounts.some(x=>x.id===accountId))return alert('Cadastre uma conta em Configurações.');
let count=payment==='Crédito'&&String(f.get('creditType'))==='Parcelado'?Number(f.get('installments')):1;
if(!Number.isInteger(count)||count<1||count>24)return alert('Quantidade de parcelas inválida.');
if(old?.installmentGroup&&count===1&&!confirm('Esta edição substituirá toda a compra parcelada por um lançamento. Continuar?'))return;
const oldGroup=old?.installmentGroup,group=count>1?(oldGroup||uid()):null;
if(oldGroup)db.items=db.items.filter(x=>x.installmentGroup!==oldGroup);
else if(old)db.items=db.items.filter(x=>x.id!==old.id);
const base={type:mode,description:name,origin:mode==='receita'?name:undefined,category,date,status,notes,payment,cardId,accountId,by:window.VETRA_CURRENT_SESSION?.user?.email||'Local'};
if(count>1){
const card=db.cards.find(x=>x.id===cardId),first=creditFirstMonth(date,card),cents=Math.round(amount*100),baseCents=Math.floor(cents/count);
for(let i=0;i<count;i++){const each=(baseCents+(i===count-1?cents-baseCents*count:0))/100;
db.items.push({...base,id:uid(),amount:each,date:monthDate(addMonth(first,i),Number(card?.due)||15),
purchaseDate:date,installmentGroup:group,installmentNo:i+1,installmentCount:count,status:status==='realizado'&&date<=today()&&monthDate(addMonth(first,i),Number(card?.due)||15)<=today()?'realizado':'previsto'})}
}else{
 const card=db.cards.find(x=>x.id===cardId);
 const billDate=payment==='Crédito'?monthDate(creditFirstMonth(date,card),Number(card?.due)||15):date;
 db.items.push({...base,id:old?.id||uid(),amount,date:billDate,status:payment==='Crédito'&&billDate>today()?'previsto':status,purchaseDate:payment==='Crédito'?date:null,installmentGroup:null,installmentNo:null,installmentCount:null});
}
editItem=null;month=payment==='Crédito'?creditFirstMonth(date,db.cards.find(x=>x.id===cardId)):ym(date);write();go('lancamentos');
}
document.addEventListener('click',e=>{
const t=e.target.closest('[data-page]');if(t){page=t.dataset.page;section=page==='configuracoes'?'cartoes':page==='planejamento'?'fixas':section;go(page);return}
const a=e.target.closest('[data-action]');if(a){doAction(a.dataset.action);return}
const s=e.target.closest('[data-section]');if(s){section=s.dataset.section;render();return}
const m=e.target.closest('[data-mode]');if(m){mode=m.dataset.mode;formPayment=mode==='despesa'?'Pix':'';creditType='avista';render();return}
const ed=e.target.closest('[data-edit-item]');if(ed){editItem=ed.dataset.editItem;mode='despesa';go('novo');return}
const move=e.target.closest('[data-card-move]');if(move){
const id=move.dataset.cardMove,delta=Number(move.dataset.dir),ordered=db.cards.slice().sort((a,b)=>Number(!!b.primary)-Number(!!a.primary));
const i=ordered.findIndex(x=>x.id===id),j=i+delta;if(i<0||j<0||j>=ordered.length)return;
if(ordered[i].primary||ordered[j].primary)return alert('O cartão principal permanece em primeiro. Altere o principal para mover.');
[ordered[i],ordered[j]]=[ordered[j],ordered[i]];db.cards=ordered;write();
}
});
function rerenderEntryPreserving(){
const prev=document.getElementById('v2-entry'),values={};
if(prev)for(const element of prev.elements){if(element.name)values[element.name]=element.value}
render();
const next=document.getElementById('v2-entry');
if(next)for(const element of next.elements){
if(element.name&&Object.prototype.hasOwnProperty.call(values,element.name)&&Array.from(element.options||[]).some(o=>o.value===values[element.name])||element.name&&element.tagName!=='SELECT'&&Object.prototype.hasOwnProperty.call(values,element.name)){
 element.value=values[element.name]
}
}
}
document.addEventListener('change',e=>{
if(e.target.name==='payment'&&e.target.closest('#v2-entry')){formPayment=e.target.value;rerenderEntryPreserving()}
if(e.target.name==='creditType'&&e.target.closest('#v2-entry')){creditType=e.target.value==='Parcelado'?'parcelado':'avista';rerenderEntryPreserving()}
});
document.addEventListener('submit',e=>{
const f=e.target;if(!f.id.startsWith('v2-'))return;e.preventDefault();const v=new FormData(f);
if(f.id==='v2-entry')return saveEntry(f);
if(f.id==='v2-budget'){db.budgets[month]=Number(v.get('amount'));write();return}
if(f.id==='v2-card-form'){
const name=String(v.get('name')||'').trim(),holder=String(v.get('holder')||'').trim(),last4=String(v.get('last4')||'').trim(),closing=Number(v.get('closing')),due=Number(v.get('due'));
if(!name||!Number.isInteger(closing)||closing<1||closing>31||!Number.isInteger(due)||due<1||due>31||(last4&&!/^\d{4}$/.test(last4)))return alert('Confira nome, datas e últimos quatro dígitos.');
const id=editCard||uid(),primary=v.has('primary')||!db.cards.length;
if(primary)db.cards=db.cards.map(x=>({...x,primary:false}));
const card={id,name,holder,nickname:String(v.get('nickname')||''),brand:String(v.get('brand')||'Outra'),last4,closing,due,primary};
db.cards=editCard?db.cards.map(x=>x.id===id?{...x,...card}:x):[...db.cards,card];
closeModal();write();return;
}
if(f.id==='v2-account-form'){
const account={id:editAccount||uid(),bank:String(v.get('bank')||'').trim(),type:String(v.get('type')),nickname:String(v.get('nickname')||'')};if(!account.bank)return alert('Informe o banco.');
db.accounts=editAccount?db.accounts.map(x=>x.id===editAccount?account:x):[...db.accounts,account];closeModal();write();return;
}
if(f.id==='v2-fixed-form'){
const name=String(v.get('name')||'').trim(),amount=Number(v.get('amount')),due=Number(v.get('due'));
if(!name||!Number.isFinite(amount)||amount<0||!Number.isInteger(due)||due<1||due>31)return alert('Informe descrição, valor e vencimento válidos.');
const old=db.fixed.find(x=>x.id===editFixed)||{};
const data={...old,id:editFixed||uid(),name,amount,due,category:String(v.get('category')),frequency:String(v.get('frequency')),method:String(v.get('method')),paymentSource:String(v.get('paymentSource')||''),start:String(v.get('start')),end:String(v.get('end')||''),termCount:Math.max(0,Number(v.get('termCount')||0)),currentInstallment:Math.max(1,Number(v.get('currentInstallment')||1)),active:v.has('active'),payments:old.payments||{}};
db.fixed=editFixed?db.fixed.map(x=>x.id===editFixed?data:x):[...db.fixed,data];closeModal();write();return;
}
if(f.id==='v2-invest-form'){
const old=db.investments.find(x=>x.id===editInvestment)||{};
const a={...old,id:editInvestment||uid(),name:String(v.get('name')||''),bank:String(v.get('bank')||''),kind:String(v.get('kind')),initial:Number(v.get('initial')||0),snapshots:old.snapshots||{}};
if(!a.name)return alert('Informe nome do investimento.');
db.investments=editInvestment?db.investments.map(x=>x.id===editInvestment?a:x):[...db.investments,a];closeModal();write();return;
}
if(f.id==='v2-snapshot-form'){
const id=f.dataset.investment;
db.investments=db.investments.map(x=>x.id===id?{...x,snapshots:{...(x.snapshots||{}),[month]:{balance:Number(v.get('balance')),contribution:Number(v.get('contribution')),withdrawal:Number(v.get('withdrawal'))}}}:x);closeModal();write();return;
}
if(f.id==='v2-pay-form'){
const id=f.dataset.fixed;
db.fixed=db.fixed.map(x=>x.id===id?{...x,payments:{...(x.payments||{}),[month]:{amount:Number(v.get('amount')),date:String(v.get('date')),paid:v.has('paid')}}}:x);closeModal();write();
}
});
window.VETRA_APP={get:()=>structuredClone(db),replace:(data,store=false)=>{db=normalize(data);if(store&&!window.VETRA_CLOUD?.house)localStorage.setItem(KEY,JSON.stringify(db));render()},render};
const modalHolder=document.createElement('div');modalHolder.id='v2-modal';modalHolder.hidden=true;document.body.append(modalHolder);
titleNav();render();
})();