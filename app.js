const API_BASE="";
const PRICE=35;
const selected=new Set();
let reservations=[];
const $=s=>document.querySelector(s);
const money=n=>n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

async function load(){
 try{
  const r=await fetch(API_BASE+"/api/public/reservations");
  if(!r.ok)throw Error();
  reservations=await r.json(); render(); updateStats();
 }catch(e){console.warn("Backend não conectado:",e);render();updateStats();}
}
function render(){
 const map=new Map(reservations.map(x=>[Number(x.number),x.status]));
 const el=$("#numbers"); el.innerHTML="";
 for(let i=0;i<100;i++){
  const b=document.createElement("button"), s=map.get(i);
  b.textContent=String(i).padStart(2,"0");
  b.className="number";
  if(s==="paid"||s==="reserved"){b.classList.add("taken");b.disabled=true}
  else if(selected.has(i))b.classList.add("selected");
  b.onclick=()=>{selected.has(i)?selected.delete(i):selected.add(i);render();update()};
  el.appendChild(b);
 }
}
function update(){
 const nums=[...selected].sort((a,b)=>a-b);
 $("#count").textContent=`${nums.length} ${nums.length===1?"número selecionado":"números selecionados"}`;
 $("#total").textContent=money(nums.length*PRICE);
 $("#continue").disabled=!nums.length;
 $("#summaryNumbers").textContent=nums.length?nums.map(n=>String(n).padStart(2,"0")).join(" · "):"—";
}
function updateStats(){
 const paid=reservations.filter(x=>x.status==="paid").length;
 const unavailable=reservations.filter(x=>x.status==="paid"||x.status==="reserved").length;
 $("#sold").textContent=paid;
 $("#available").textContent=100-unavailable;
}
$("#continue").onclick=()=>{$("#checkout").classList.remove("hidden");$("#checkout").scrollIntoView({behavior:"smooth",block:"center"})};

$("#form").onsubmit=async e=>{
 e.preventDefault();
 const nums=[...selected].sort((a,b)=>a-b);
 if(!nums.length)return;
 const btn=e.submitter;btn.disabled=true;btn.innerHTML="Gerando Pix…";
 try{
  const r=await fetch(API_BASE+"/api/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:$("#name").value.trim(),phone:$("#phone").value.trim(),numbers:nums})});
  const d=await r.json();if(!r.ok)throw Error(d.detail||"Não foi possível criar a cobrança.");
  $("#payment").innerHTML=`<div class="payment-head"><span>03 · PAGAMENTO</span><b>Reserva criada ✓</b></div>
  <h3>Seu Pix está pronto.</h3><p>Escaneie o QR Code ou copie o código abaixo. A confirmação será automática.</p>
  <div class="qrbox"><img src="data:image/png;base64,${d.encodedImage}" alt="QR Code Pix"></div>
  <div class="amount">${money(d.amount)}</div>
  <div class="copy-row"><textarea id="payload" readonly>${d.payload}</textarea><button id="copy">Copiar</button></div>
  <div id="status" class="waiting"><i></i> Aguardando pagamento…</div>`;
  $("#payment").classList.remove("hidden");selected.clear();update();
  $("#copy").onclick=()=>navigator.clipboard.writeText(d.payload).then(()=>{ $("#copy").textContent="Copiado ✓";});
  poll(d.orderId);
 }catch(err){alert(err.message)}
 btn.disabled=false;btn.innerHTML="Gerar Pix seguro <span>→</span>";
};
async function poll(id){
 const timer=setInterval(async()=>{
  try{
   const d=await (await fetch(API_BASE+"/api/orders/"+id)).json();
   if(d.status==="paid"){clearInterval(timer);$("#status").className="waiting ok";$("#status").innerHTML="✓ Pagamento confirmado! Seus números estão garantidos.";load();}
   else if(["expired","cancelled"].includes(d.status)){clearInterval(timer);$("#status").innerHTML="Esta reserva expirou. Escolha novamente.";load();}
  }catch{}
 },3500);
}
load();update();


// V3 — microinterações e revelação ao rolar
const revealTargets = document.querySelectorAll(".section-head,.numbers-wrap,.how,.final");
revealTargets.forEach(el=>el.classList.add("reveal"));
const revealObserver = new IntersectionObserver(entries=>{
 entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");revealObserver.unobserve(e.target)}})
},{threshold:.12});
revealTargets.forEach(el=>revealObserver.observe(el));

function celebrate(){
 const box=document.createElement("div");
 box.style.cssText="position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden";
 for(let i=0;i<28;i++){
  const s=document.createElement("span");
  s.textContent=["✦","✧","•","♡"][Math.floor(Math.random()*4)];
  s.style.cssText=`position:absolute;left:${Math.random()*100}%;top:-30px;font-size:${12+Math.random()*18}px;color:${["#7167b2","#a99edb","#d7a9bf","#8b81c6"][Math.floor(Math.random()*4)]};animation:confettiFall ${1.3+Math.random()*1.4}s ${Math.random()*.25}s ease-out forwards`;
  box.appendChild(s);
 }
 document.body.appendChild(box);
 const st=document.createElement("style");st.textContent="@keyframes confettiFall{to{transform:translateY(110vh) rotate(540deg);opacity:0}}";document.head.appendChild(st);
 setTimeout(()=>box.remove(),3000);
}

// Reuse payment polling and celebrate only after confirmed payment.
const oldPoll = poll;
poll = async function(id){
 const timer=setInterval(async()=>{
  try{
   const d=await (await fetch(API_BASE+"/api/orders/"+id)).json();
   if(d.status==="paid"){
    clearInterval(timer);
    const status=document.querySelector("#status");
    if(status){status.className="waiting ok";status.innerHTML="✓ Pagamento confirmado! Seus números estão garantidos."}
    celebrate(); load();
   }else if(["expired","cancelled"].includes(d.status)){
    clearInterval(timer);
    const status=document.querySelector("#status");
    if(status)status.innerHTML="Esta reserva expirou. Escolha novamente.";
    load();
   }
  }catch{}
 },3500);
};
