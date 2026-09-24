
const ASSET_IMAGES = {
  nvda: './nvda.webp',
  meta: './meta.webp',
  aapl: './aapl.webp',
  amzn: './amzn.webp',
  block: './block.webp'
};

const ASSETS = {
  nvda: {
    name: 'NVIDIA',
    ticker: 'NVDA',
    tag: 'AI INFRASTRUCTURE',
    heroType: 'AI compute exposure',
    description: 'NVIDIA can headline the first rotation. The GPU image moves as the user scrolls and introduces the idea of a real stock token drop.',
    src: ASSET_IMAGES.nvda,
    className: 'asset-nvda'
  },
  meta: {
    name: 'META',
    ticker: 'META',
    tag: 'SOCIAL + AD NETWORK',
    heroType: 'Platform exposure',
    description: 'META follows next. The logo rotates slowly in space while the copy updates with the second asset in the sequence.',
    src: ASSET_IMAGES.meta,
    className: 'asset-meta'
  },
  aapl: {
    name: 'APPLE',
    ticker: 'AAPL',
    tag: 'CONSUMER ECOSYSTEM',
    heroType: 'Hardware + services exposure',
    description: 'Then comes Apple. The metal logo floats with subtle movement while the interface updates the name, ticker and description.',
    src: ASSET_IMAGES.aapl,
    className: 'asset-aapl'
  },
  amzn: {
    name: 'AMAZON',
    ticker: 'AMZN',
    tag: 'COMMERCE + CLOUD',
    heroType: 'Retail and cloud exposure',
    description: 'Amazon closes the sequence. The boxes give the last step a different visual rhythm and keep the page feeling dynamic.',
    src: ASSET_IMAGES.amzn,
    className: 'asset-amzn'
  }
};

const CONFIG = {
  contractAddress: 'COMING_SOON',
  xUrl: '#',
  apiBase: '',
  predictedToken: '',
  pairLabel: '',
  rewardRule: ''
};

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const feed = $('#feed');
const poolValue = $('#poolValue');
const barFill = $('#barFill');
const percentLabel = $('#percentLabel');
const status = $('#dropStatus');
const featureLayers = [$('#featureAssetA'), $('#featureAssetB')];
const storyLayers = [$('#storyImageA'), $('#storyImageB')];
let featureFront = 0;
let storyFront = 0;
let currentAssetKey = 'nvda';
let soundOn = false;
let audioCtx = null;

function tick(freq=340, dur=.04) {
  if(!soundOn) return;
  audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
  const o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.frequency.value = freq; o.type = 'sine'; g.gain.value = .035;
  o.connect(g); g.connect(audioCtx.destination); o.start();
  g.gain.exponentialRampToValueAtTime(.0001, audioCtx.currentTime + dur); o.stop(audioCtx.currentTime + dur);
}

$('#soundBtn').onclick = () => {
  soundOn = !soundOn;
  $('#soundBtn').textContent = soundOn ? 'SOUND ON' : 'SOUND OFF';
  tick(500,.06);
};

function copyCA() {
  if(CONFIG.contractAddress === 'COMING_SOON') {
    alert('Contract address will appear here when the token is live.');
    return;
  }
  navigator.clipboard.writeText(CONFIG.contractAddress);
}
$('#copyCa').onclick = copyCA; $('#copyCa2').onclick = copyCA; $('#xLink').href = CONFIG.xUrl;

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('in'); });
}, {threshold:.14});
$$('.reveal').forEach(el => revealObserver.observe(el));

function swapLayer(layers, frontIndex, data){
  const backIndex = 1 - frontIndex;
  const front = layers[frontIndex];
  const back = layers[backIndex];
  back.src = data.src;
  back.className = back.className.split(' ').filter(c => !c.startsWith('asset-') && c !== 'is-visible').concat([data.className,'asset-layer']).join(' ');
  void back.offsetWidth;
  back.classList.add('is-visible');
  front.classList.remove('is-visible');
  return backIndex;
}

function setAsset(key) {
  const data = ASSETS[key];
  if(!data || key === currentAssetKey && featureLayers[featureFront].src) return;
  currentAssetKey = key;

  featureFront = swapLayer(featureLayers, featureFront, data);
  storyFront = swapLayer(storyLayers, storyFront, data);

  $('#featureLabel').textContent = data.name;
  $('#featureTicker').textContent = data.ticker;
  $('#featureType').textContent = data.heroType;
  $('#storyName').textContent = data.name;
  $('#storyTicker').textContent = data.ticker;
  $('#storyTag').textContent = data.tag;
  $('#storyText').textContent = data.description;
  $$('.asset-step').forEach(step => step.classList.toggle('is-active', step.dataset.key === key));
  tick(420,.04);
}

const stepObserver = new IntersectionObserver(entries => {
  const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
  if(visible) setAsset(visible.target.dataset.key);
}, {threshold:[0.3,0.55,0.75]});
$$('.asset-step').forEach(step => stepObserver.observe(step));


function addFeed(type, label, amount='') {
  const now = new Date().toLocaleTimeString([], {hour12:false});
  const row = document.createElement('div');
  row.className='feed-line';
  row.innerHTML='<span class="time">'+now+'</span><span class="'+(type==='ok'?'ok':'')+'">'+label+'</span><span class="amt">'+amount+'</span>';
  feed.prepend(row);
  while(feed.children.length>12) feed.lastElementChild.remove();
  tick(type==='ok'?540:320);
}

async function loadLive() {
  if(!CONFIG.apiBase) {
    poolValue.textContent = '—';
    barFill.style.width = '0%';
    percentLabel.textContent = 'LIVE DATA';
    status.textContent = 'WAITING FOR LIVE DATA';
    feed.innerHTML = '';
    addFeed('', 'WAITING FOR LIVE API CONNECTION', 'NO SIMULATION');
    addFeed('', 'NO VALUES DISPLAYED UNTIL VERIFIED ONCHAIN', '');
    $('#totalDropped').textContent = '—';
    return;
  }
  try {
    const r = await fetch(CONFIG.apiBase + '/api/status', {cache:'no-store'});
    if(!r.ok) throw new Error('status');
    const data = await r.json();
    poolValue.textContent = Number(data.poolUsd || 0).toFixed(2);
    barFill.style.width = Math.max(0, Math.min(100, (Number(data.poolUsd||0)/100)*100)) + '%';
    percentLabel.textContent = Math.floor(Math.max(0, Math.min(100, (Number(data.poolUsd||0)/100)*100))) + '%';
    status.textContent = data.poolUsd >= 100 ? 'DROP READY' : 'BUILDING POOL';
    if(data.totalDroppedUsd != null && Number(data.totalDroppedUsd) > 0){ $('#totalDropped').textContent = Number(data.totalDroppedUsd).toLocaleString(); $('#impactSection').classList.remove('is-hidden'); }
    if(data.nextAsset && ASSETS[data.nextAsset.toLowerCase()]) setAsset(data.nextAsset.toLowerCase());
    feed.innerHTML='';
    (data.events||[]).slice(0,12).forEach(e => addFeed(e.confirmed?'ok':'', e.label, e.amount||''));
  } catch(e) {
    feed.innerHTML='';
    addFeed('', 'LIVE API UNAVAILABLE', 'CHECK BACKEND');
  }
}

$('#stockBlock').src = ASSET_IMAGES.block;
featureLayers[0].src = ASSETS.nvda.src;
storyLayers[0].src = ASSETS.nvda.src;
currentAssetKey = '';
setAsset('nvda');
loadLive();
if(CONFIG.apiBase) setInterval(loadLive, 15000);

function renderVerify(){
  const token = document.querySelector('#verifyToken');
  const pair = document.querySelector('#verifyPair');
  const rule = document.querySelector('#verifyRule');
  const statusEl = document.querySelector('#verifyStatus');
  if(token && CONFIG.predictedToken) token.textContent = CONFIG.predictedToken;
  if(pair && CONFIG.pairLabel) pair.textContent = CONFIG.pairLabel;
  if(rule && CONFIG.rewardRule) rule.textContent = CONFIG.rewardRule;
  if(statusEl && CONFIG.contractAddress !== 'COMING_SOON') statusEl.textContent = 'LIVE';
}
renderVerify();
