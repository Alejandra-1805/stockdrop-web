const CONFIG = {
  contractAddress: "COMING_SOON",
  xUrl: "#",
  targetUsd: 100,
  demoPool: 84.27,
  apiBase: ""
};

const $ = s => document.querySelector(s);
const feed = $("#feed");
const poolValue = $("#poolValue");
const barFill = $("#barFill");
const percentLabel = $("#percentLabel");
const status = $("#dropStatus");
let soundOn = false;
let audioCtx = null;

function tick(freq=340, dur=.04){
  if(!soundOn) return;
  audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
  const o=audioCtx.createOscillator(), g=audioCtx.createGain();
  o.frequency.value=freq; o.type="sine"; g.gain.value=.035;
  o.connect(g); g.connect(audioCtx.destination); o.start();
  g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+dur); o.stop(audioCtx.currentTime+dur);
}

$("#soundBtn").onclick=()=>{
  soundOn=!soundOn;
  $("#soundBtn").textContent=soundOn?"SOUND ON":"SOUND OFF";
  tick(500,.06);
};

function copyCA(){
  if(CONFIG.contractAddress==="COMING_SOON"){
    alert("Contract address will appear here when the token is live.");
    return;
  }
  navigator.clipboard.writeText(CONFIG.contractAddress);
}
$("#copyCa").onclick=copyCA; $("#copyCa2").onclick=copyCA; $("#xLink").href=CONFIG.xUrl;

const observer = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting)e.target.classList.add("in"); });
},{threshold:.14});
document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));

window.addEventListener("scroll",()=>{
  const y=window.scrollY;
  const card=document.querySelector(".card-main");
  if(card) card.style.marginTop = Math.min(y*.06,38)+"px";
});

function addFeed(type, label, amount=""){
  const now=new Date().toLocaleTimeString([], {hour12:false});
  const row=document.createElement("div");
  row.className="feed-line";
  row.innerHTML='<span class="time">'+now+'</span><span class="'+(type==="ok"?"ok":"")+'">'+label+'</span><span class="amt">'+amount+'</span>';
  feed.prepend(row);
  while(feed.children.length>12) feed.lastElementChild.remove();
  tick(type==="ok"?540:320);
}

function renderPool(value){
  const pct=Math.max(0,Math.min(100,(value/CONFIG.targetUsd)*100));
  poolValue.textContent=value.toFixed(2);
  barFill.style.width=pct+"%";
  percentLabel.textContent=Math.floor(pct)+"%";
  status.textContent=pct>=100?"DROP READY":pct>=90?"DROP IMMINENT":"BUILDING POOL";
}

async function loadLive(){
  if(!CONFIG.apiBase){
    renderPool(CONFIG.demoPool);
    addFeed("", "WAITING FOR LIVE API CONNECTION", "NO SIMULATION");
    addFeed("", "UI READY — ONCHAIN DATA DISABLED", "");
    return;
  }
  try{
    const r=await fetch(CONFIG.apiBase+"/api/status", {cache:"no-store"});
    if(!r.ok) throw new Error("status");
    const data=await r.json();
    renderPool(Number(data.poolUsd || 0));
    if(data.totalDroppedUsd!=null) $("#totalDropped").textContent=Number(data.totalDroppedUsd).toLocaleString();
    $("#assetName").textContent=data.nextAsset || "—";
    feed.innerHTML="";
    (data.events||[]).slice(0,12).forEach(e=>addFeed(e.confirmed?"ok":"",e.label,e.amount||""));
  }catch(e){
    renderPool(0);
    feed.innerHTML="";
    addFeed("", "LIVE API UNAVAILABLE", "CHECK BACKEND");
  }
}
loadLive();
if(CONFIG.apiBase) setInterval(loadLive,15000);