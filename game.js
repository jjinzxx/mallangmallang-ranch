"use strict";
/* =====================================================
   말랑말랑목장 — 도트 말 육성 웹게임 (단일 파일, localStorage 저장)
   ===================================================== */

/* ---------- 상수 ---------- */
const STAT_KEYS = ["spd","sta","agi"];
const STAT_NAME = { spd:"속도", sta:"지구력", agi:"순발력" };
const STAT_COLOR = { spd:"#e07a7a", sta:"#7cbf6b", agi:"#8ec9e8" };

// coats: 품종별 색상 변형 [이름, 몸, 갈기] — coats[0]이 기본색
const BREEDS = {
  pony:     { name:"포니",     special:false,
    coats:[{n:"카라멜",b:"#c9906b",m:"#7a4a2d"},{n:"초코",b:"#9c6b4a",m:"#5a3a26"},{n:"크림",b:"#e6c9a3",m:"#b3865e"}] },
  brown:    { name:"갈색말",   special:false,
    coats:[{n:"밤색",b:"#a5683f",m:"#5b3a21"},{n:"적갈",b:"#8f4f35",m:"#4d2a1c"},{n:"모카",b:"#7d5a3f",m:"#3f2d1e"}] },
  white:    { name:"백마",     special:false,
    coats:[{n:"순백",b:"#f2ede4",m:"#cbb9a0"},{n:"은빛",b:"#e3e6ea",m:"#9aa4b3"},{n:"아이보리",b:"#efe5c8",m:"#c9b98a"}] },
  black:    { name:"흑마",     special:false,
    coats:[{n:"먹색",b:"#5a5a68",m:"#33333d"},{n:"밤하늘",b:"#3f4459",m:"#252838"},{n:"잿빛",b:"#6e6e76",m:"#45454d"}] },
  spotted:  { name:"점박이",   spot:"#7a5a3d", special:false,
    coats:[{n:"우유",b:"#efe8da",m:"#8a7357"},{n:"미숫가루",b:"#e3d7c2",m:"#6e5a44"},{n:"바닐라콩",b:"#f5efe0",m:"#4a4a55"}] },
  palomino: { name:"팔로미노", special:false,
    coats:[{n:"금빛",b:"#e0b06a",m:"#f7ecd2"},{n:"살구",b:"#e8bf8e",m:"#fff3dd"},{n:"백금",b:"#d9c9a3",m:"#fffbe8"}] },
  zebra:    { name:"얼룩말",   stripe:true, special:false,
    coats:[{n:"클래식",b:"#eae6dc",m:"#3a3a42"},{n:"갈색줄",b:"#e8dcc8",m:"#6b4a2d"},{n:"딸기줄",b:"#f5e3e8",m:"#b3607d"}] },
  golden:   { name:"황금말",   special:true,
    coats:[{n:"황금",b:"#f5c542",m:"#fff1b8"},{n:"로즈골드",b:"#edaa7e",m:"#ffd9c4"},{n:"백금",b:"#e8e3c9",m:"#fffef0"}] },
  sakura:   { name:"벚꽃말",   spot:"#fceaf1", special:true,
    coats:[{n:"벚꽃",b:"#f7c6d9",m:"#ee8fb4"},{n:"진달래",b:"#ee9fc3",m:"#d16a9e"},{n:"흰벚꽃",b:"#fbe3ec",m:"#f0b4cc"}] },
  unicorn:  { name:"유니콘",   horn:true, special:true,
    coats:[{n:"라벤더",b:"#ffffff",m:"#c9a8e8"},{n:"민트",b:"#f4fffa",m:"#8fd9c1"},{n:"피치",b:"#fff6f0",m:"#f5b98f"}] },
  star:     { name:"별똥말",   spot:"#f4f0a8", special:true,
    coats:[{n:"남색",b:"#7b8bd9",m:"#a8e6ff"},{n:"자정",b:"#5a63a8",m:"#8fb3f0"},{n:"새벽",b:"#9aa8e8",m:"#ffd9f0"}] },
  pegasus:  { name:"페가수스", wing:true, special:true,
    coats:[{n:"하늘",b:"#f6f3ff",m:"#b8cdf5"},{n:"노을",b:"#fdf0ea",m:"#f5b8a8"},{n:"새벽별",b:"#eef4ff",m:"#c9b8f5"}] },
  // 전설 조합 — 특정 부모 조합의 교배로만 태어남 (돌연변이로는 안 나옴)
  sakurapega:{ name:"벚꽃 페가수스", wing:true, special:true, hybrid:true,
    coats:[{n:"벚꽃바람",b:"#fbd9e6",m:"#f291b8"},{n:"밤벚꽃",b:"#e8b3cc",m:"#b36a91"},{n:"함박눈",b:"#fdf0f5",m:"#f5c9dd"}] },
  alicorn:  { name:"알리콘",   horn:true, wing:true, special:true, hybrid:true,
    coats:[{n:"무지개",b:"#ffffff",m:"#d9a8e8"},{n:"오로라",b:"#f0faff",m:"#a8d9e8"},{n:"황혼",b:"#fff0f8",m:"#e8a8c9"}] },
  comet:    { name:"혜성말",   spot:"#fff7c9", special:true, hybrid:true,
    coats:[{n:"혜성",b:"#f0c94a",m:"#a8e6ff"},{n:"유성우",b:"#8f9be8",m:"#ffe9a8"},{n:"일식",b:"#55505e",m:"#f5c542"}] },
};
const NORMAL_BREEDS = Object.keys(BREEDS).filter(k=>!BREEDS[k].special);
const SPECIAL_BREEDS = Object.keys(BREEDS).filter(k=>BREEDS[k].special && !BREEDS[k].hybrid);
// 전설 조합 레시피 (부모 순서 무관)
const COMBOS = [
  { pair:["sakura","pegasus"],  child:"sakurapega" },
  { pair:["unicorn","pegasus"], child:"alicorn" },
  { pair:["golden","star"],     child:"comet" },
];
const COMBO_CHANCE = 5; // %

const NAME_A = ["초코","바닐라","구름","콩떡","모카","별이","달래","보리","우유","단추","사과","솜사탕","호두","앙꼬","젤리","라떼","복숭아","마루","두부","꿀떡"];
const NAME_B = ["","","","공주","왕자","","군","양","","돌이","순이",""];
const TRAITS = {
  cheerful: { name:"명랑", desc:"돌보기 성장 +5%", care:5 },
  focused:  { name:"집중", desc:"훈련 성공률 +5%", train:0.05 },
  swift:    { name:"날쌤", desc:"경주 속도 +4%", race:0.04 },
  hearty:   { name:"튼튼", desc:"막판 지구력 +5%", stamina:0.05 },
  lucky:    { name:"행운", desc:"훈련·경주가 조금씩 유리", train:0.03, race:0.03 },
};
const TRAIT_KEYS = Object.keys(TRAITS);
const MOODS = [
  { icon:"✨", name:"신남", desc:"훈련 +4%, 경주 +3%", train:0.04, race:0.03 },
  { icon:"🌿", name:"차분", desc:"훈련 +2%", train:0.02, race:0 },
  { icon:"🔥", name:"승부욕", desc:"경주 +4%", train:0, race:0.04 },
  { icon:"🍀", name:"행운", desc:"훈련·경주 +2%", train:0.02, race:0.02 },
  { icon:"😴", name:"졸림", desc:"훈련 -3%, 경주 -2%", train:-0.03, race:-0.02 },
];
const WEATHERS = [
  { icon:"☀️", name:"맑음", desc:"동전노점 수익 +15%", coin:1.15, carrot:1 },
  { icon:"🌧️", name:"보슬비", desc:"당근밭 생산 +20%", coin:1, carrot:1.20 },
  { icon:"🍃", name:"선선함", desc:"당근·코인 생산 +10%", coin:1.10, carrot:1.10 },
  { icon:"🌈", name:"무지개", desc:"당근·코인 생산 +20%", coin:1.20, carrot:1.20 },
  { icon:"🌫️", name:"안개", desc:"평온한 날씨예요", coin:1, carrot:1 },
];
const CUPS = [
  { id:0, name:"🌱 새싹컵",   fee:20,  prize:[80,40,25],   npc:[3,9]   },
  { id:1, name:"☁️ 구름컵",   fee:60,  prize:[250,120,70], npc:[8,17]  },
  { id:2, name:"🌈 무지개컵", fee:150, prize:[700,300,160],npc:[14,25] },
];

const BUILDINGS = {
  stable: { name:"🏠 마구간",   desc:l=>`말 보유 한도 ${stableCap(l)}마리`,       cost:l=>Math.floor(200*Math.pow(1.7,l-1)) },
  farm:   { name:"🥕 당근밭",   desc:l=>`분당 당근 ${farmRate(l)}개 자동 생산 (보관 ${farmCap(l)}개)`, cost:l=>Math.floor(150*Math.pow(1.6,l-1)) },
  stall:  { name:"🪙 동전노점", desc:l=>`분당 코인 ${stallRate(l)}개 자동 수익 (보관 ${stallCap(l)}개)`, cost:l=>Math.floor(180*Math.pow(1.65,l-1)) },
  barn:   { name:"💕 산실",     desc:l=>`교배 시간 ${fmtSec(breedTime(l))} · 특이개체 확률 ${mutChance(l)}%`, cost:l=>Math.floor(250*Math.pow(1.7,l-1)) },
  gym:    { name:"💪 훈련장",   desc:l=>`훈련 쿨타임 ${trainCool(l)}초 · 성공률 +${(l-1)*4}%`, cost:l=>Math.floor(250*Math.pow(1.7,l-1)) },
};
const MAX_BLD = 5;
function stableCap(l){ return 4 + (l-1)*2; }
function farmRate(l){ return 3 + l; }
function farmCap(l){ return 40 + l*20; }
function stallRate(l){ return 4 + l*2; }
function stallCap(l){ return 80 + l*40; }
function breedTime(l){ return Math.max(40, 120 - (l-1)*20); }   // 초
function mutChance(l){ return 5 + (l-1)*3; }                     // %
function trainCool(l){ return Math.max(12, 30 - (l-1)*4); }      // 초

const STAT_CAP_NORMAL = 25, STAT_CAP_SPECIAL = 30;
const TRAIN_CARROT = 3, CARE_CARROT = 2, SNACK_CARROT = 5, BREED_COST = 100, ADOPT_COST = 150;
const SNACK_TIME = 10 * 60; // 초
const WALK_COOL = 3 * 60; // 초
const CHORE_COOL = 2 * 60; // 초
const RACE_COOL = 60; // 초

/* ---------- 유틸 ---------- */
const $ = s => document.querySelector(s);
const rnd = (a,b) => a + Math.random()*(b-a);
const ri = (a,b) => Math.floor(rnd(a,b+1));
const pick = arr => arr[Math.floor(Math.random()*arr.length)];
const now = () => Date.now();
function fmtSec(s){ s=Math.max(0,Math.ceil(s)); return s>=60 ? `${Math.floor(s/60)}분 ${s%60}초` : `${s}초`; }
function toast(msg){
  const t = document.createElement("div"); t.className="toast"; t.textContent=msg;
  $("#toasts").appendChild(t); setTimeout(()=>t.remove(), 2700);
}
function esc(s){ const d=document.createElement("div"); d.textContent=s; return d.innerHTML; }
function dailySeed(...parts){
  const raw = [todayKey(), ...parts].join(":");
  return [...raw].reduce((s,ch)=>((s * 33) + ch.charCodeAt(0)) >>> 0, 5381);
}
function weatherToday(){
  const key = todayKey();
  const seed = [...key].reduce((s,ch)=>s+ch.charCodeAt(0), 0);
  return WEATHERS[seed % WEATHERS.length];
}
function moodOf(h){
  return MOODS[dailySeed(h.id || 0, h.name || "", h.breed || "") % MOODS.length];
}
function traitOf(h){ return TRAITS[h.trait] || TRAITS.cheerful; }
function assignTrait(h){
  if(TRAITS[h.trait]) return h.trait;
  const seed = Math.abs((Number(h.id) || 0) + String(h.name || "").length + String(h.breed || "").length);
  h.trait = TRAIT_KEYS[seed % TRAIT_KEYS.length];
  return h.trait;
}

/* ---------- 상태 ---------- */
let state = null;
const SAVE_KEY = "malang_ranch_v1";

function newHorse(breed, stage, statRange){
  const cap = BREEDS[breed].special ? STAT_CAP_SPECIAL : STAT_CAP_NORMAL;
  const stats = {};
  STAT_KEYS.forEach(k => stats[k] = Math.min(cap, ri(statRange[0], statRange[1])));
  if(state) state.nextId = Math.max(1, Math.round(Number(state.nextId) || 1));
  return {
    id: state ? state.nextId++ : 0,
    name: pick(NAME_A) + pick(NAME_B),
    breed, gender: Math.random()<0.5 ? "f" : "m",
    trait: pick(TRAIT_KEYS),
    coat: Math.floor(Math.random()*BREEDS[breed].coats.length),
    stage, growth: stage==="adult" ? 100 : 0,
    stats, bond: stage==="adult" ? 10 : 0, coolTrain: 0, coolRace: 0, treatUntil: 0, wins:0, races:0,
  };
}

/* --- 도감 --- */
function dexKey(h){ return h.breed + ":" + (h.coat || 0); }
function markDex(h){ (state.dex = state.dex || {})[dexKey(h)] = 1; }
function dexCount(){
  const total = Object.keys(BREEDS).reduce((s,k)=>s+BREEDS[k].coats.length, 0);
  return `${Object.keys(state.dex || {}).length}/${total}`;
}
function dexSeenCount(){ return Object.keys(state.dex || {}).length; }
function markOwnedDex(){ (state.horses || []).forEach(markDex); }
function comboChild(a, b){
  const pair = [a, b].sort().join(":");
  const combo = COMBOS.find(c=>c.pair.slice().sort().join(":") === pair);
  return combo?.child || null;
}

const FAME_RANKS = [
  { score:0, name:"새싹 목장" },
  { score:40, name:"동네 목장" },
  { score:90, name:"인기 목장" },
  { score:160, name:"명문 목장" },
  { score:260, name:"전설 목장" },
];
function fameScore(){
  const cupStamps = CUPS.filter(c=>(state.cupWins?.[c.id] || 0) > 0).length;
  const claimedAchievements = Object.values(state.achievements || {}).filter(Boolean).length;
  return state.trophies * 10 + dexSeenCount() * 2 + cupStamps * 12 + claimedAchievements * 8 + Math.max(0, state.horses.length - 2) * 3;
}
function fameRank(score=fameScore()){
  let current = FAME_RANKS[0], next = null;
  for(const rank of FAME_RANKS){
    if(score >= rank.score) current = rank;
    else { next = rank; break; }
  }
  return { current, next };
}

function todayKey(){ return new Date().toLocaleDateString("sv-SE"); }
function dayDiff(a, b){
  const aTime = Date.parse(a + "T00:00:00");
  const bTime = Date.parse(b + "T00:00:00");
  if(!Number.isFinite(aTime) || !Number.isFinite(bTime)) return 999;
  return Math.round((bTime - aTime) / 86400000);
}
function dailyGiftPreview(){
  const nextStreak = state.dailyGiftDay === todayKey() ? state.loginStreak : (dayDiff(state.dailyGiftDay, todayKey()) === 1 ? state.loginStreak + 1 : 1);
  const streakBonus = Math.min(nextStreak, 7) * 10;
  return {
    streak: nextStreak,
    reward: {
      coins: 90 + streakBonus + (nextStreak % 7 === 0 ? 80 : 0),
      carrots: 6 + (nextStreak % 7 === 0 ? 20 : 0),
    }
  };
}
function claimDailyGift(){
  const today = todayKey();
  if(state.dailyGiftDay === today) return null;
  const preview = dailyGiftPreview();
  state.dailyGiftDay = today;
  state.loginStreak = preview.streak;
  state.coins += preview.reward.coins;
  state.carrots += preview.reward.carrots;
  return preview;
}
function freshQuests(){
  return {
    day: todayKey(),
    items: [
      { id:"care", title:"아기 말 돌보기 2회", kind:"care", target:2, progress:0, reward:{ carrots:10 }, claimed:false },
      { id:"train", title:"훈련 3회 시도", kind:"train", target:3, progress:0, reward:{ coins:90 }, claimed:false },
      { id:"race", title:"경주 1회 완주", kind:"race", target:1, progress:0, reward:{ coins:120, carrots:6 }, claimed:false },
    ]
  };
}
function ensureQuests(){
  const template = freshQuests();
  if(!state.quests || state.quests.day !== todayKey() || !Array.isArray(state.quests.items)){
    state.quests = template;
  } else {
    state.quests.items = template.items.map(t=>({ ...t, ...(state.quests.items.find(q=>q.id === t.id) || {}) }));
  }
  state.quests.items.forEach(q=>{
    q.progress = Math.max(0, Math.min(q.target, Math.round(Number(q.progress) || 0)));
    q.claimed = !!q.claimed;
  });
}
function questRewardText(reward){
  return [reward.coins ? `🪙${reward.coins}` : "", reward.carrots ? `🥕${reward.carrots}` : ""].filter(Boolean).join(" ");
}
function addQuestProgress(kind, n=1){
  ensureQuests();
  state.quests.items.forEach(q=>{
    if(q.kind === kind && !q.claimed) q.progress = Math.min(q.target, q.progress + n);
  });
}

const ACHIEVEMENTS = [
  { id:"first_win", title:"첫 우승", desc:"경주에서 1승 달성", reward:{ coins:150 }, progress:()=>Math.min(1, state.horses.reduce((s,h)=>s+h.wins,0)), target:1 },
  { id:"herd_5", title:"작은 말무리", desc:"말 5마리 보유", reward:{ coins:80, carrots:20 }, progress:()=>state.horses.length, target:5 },
  { id:"dex_10", title:"도감 수집가", desc:"도감 10칸 발견", reward:{ coins:200 }, progress:()=>dexSeenCount(), target:10 },
  { id:"first_special", title:"반짝이는 혈통", desc:"특이개체 또는 전설 말 보유", reward:{ carrots:30 }, progress:()=>state.horses.some(h=>BREEDS[h.breed]?.special) ? 1 : 0, target:1 },
  { id:"market_3", title:"장터 단골", desc:"당근 장터 3회 이용", reward:{ coins:120 }, progress:()=>state.marketTrades || 0, target:3 },
  { id:"streak_3", title:"꾸준한 목장주", desc:"출석 보급품 3일 연속 받기", reward:{ coins:180, carrots:20 }, progress:()=>state.loginStreak || 0, target:3 },
  { id:"walk_5", title:"산책 전문가", desc:"목장 산책 5회", reward:{ coins:160, carrots:12 }, progress:()=>state.ranchWalks || 0, target:5 },
  { id:"chore_5", title:"부지런한 손", desc:"목장 일손돕기 5회", reward:{ coins:180 }, progress:()=>state.ranchJobs || 0, target:5 },
  { id:"bond_80", title:"단짝 말", desc:"친밀도 80 이상 말 보유", reward:{ carrots:35 }, progress:()=>state.horses.some(h=>(h.bond || 0) >= 80) ? 1 : 0, target:1 },
  { id:"cup_stamps", title:"컵 정복자", desc:"모든 PvE 컵에서 우승", reward:{ coins:400, carrots:20 }, progress:()=>CUPS.filter(c=>(state.cupWins?.[c.id] || 0) > 0).length, target:CUPS.length },
  { id:"trophy_3", title:"목장 챔피언", desc:"트로피 3개 획득", reward:{ coins:300 }, progress:()=>state.trophies, target:3 },
];
function ensureAchievements(){
  if(!state.achievements || typeof state.achievements !== "object" || Array.isArray(state.achievements)) state.achievements = {};
  ACHIEVEMENTS.forEach(a=>{ state.achievements[a.id] = !!state.achievements[a.id]; });
}
function achievementStatus(a){
  const progress = Math.max(0, Math.min(a.target, Math.round(Number(a.progress()) || 0)));
  return { progress, done: progress >= a.target, claimed: !!state.achievements?.[a.id] };
}
function claimReadyRewards(){
  ensureQuests();
  ensureAchievements();
  const total = { coins:0, carrots:0, count:0 };
  state.quests.items.forEach(q=>{
    if(q.progress >= q.target && !q.claimed){
      total.coins += q.reward.coins || 0;
      total.carrots += q.reward.carrots || 0;
      q.claimed = true;
      total.count++;
    }
  });
  ACHIEVEMENTS.forEach(a=>{
    const s = achievementStatus(a);
    if(s.done && !s.claimed){
      total.coins += a.reward.coins || 0;
      total.carrots += a.reward.carrots || 0;
      state.achievements[a.id] = true;
      total.count++;
    }
  });
  if(!total.count){ toast("받을 수 있는 보상이 아직 없어요"); return; }
  state.coins += total.coins;
  state.carrots += total.carrots;
  save();
  toast(`보상 ${total.count}개를 받았어요! ${questRewardText(total)}`);
  renderView();
}
function freshCupWins(){
  return Object.fromEntries(CUPS.map(c=>[c.id, 0]));
}

function defaultState(){
  const s = {
    coins: 300, carrots: 12, trophies: 0,
    buildings: { stable:1, farm:1, stall:1, barn:1, gym:1 },
    horses: [], breeding: null, nextId: 1,
    carrotStamp: now(), coinStamp: now(), walkReadyAt: 0, choreReadyAt: 0,
    ranchWalks: 0, ranchJobs: 0,
    dailyGiftDay: "", loginStreak: 0,
    quests: freshQuests(), achievements: {}, cupWins: freshCupWins(),
  };
  state = s;
  const a = newHorse(pick(NORMAL_BREEDS), "adult", [5,11]); a.gender="f";
  const b = newHorse(pick(NORMAL_BREEDS), "adult", [5,11]); b.gender="m";
  s.horses.push(a,b);
  markOwnedDex();
  return s;
}
function save(opts={}){
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  scheduleCloudSave(opts.cloudDelay || 3000, !!opts.keepCloudTimer);
}
function normalizeState(){
  if(!state) return;
  state.coins = Math.max(0, Math.round(Number(state.coins) || 0));
  state.carrots = Math.max(0, Math.round(Number(state.carrots) || 0));
  state.trophies = Math.max(0, Math.round(Number(state.trophies) || 0));
  state.marketTrades = Math.max(0, Math.round(Number(state.marketTrades) || 0));
  state.ranchWalks = Math.max(0, Math.round(Number(state.ranchWalks) || 0));
  state.ranchJobs = Math.max(0, Math.round(Number(state.ranchJobs) || 0));
  state.loginStreak = Math.max(0, Math.round(Number(state.loginStreak) || 0));
  state.dailyGiftDay = typeof state.dailyGiftDay === "string" ? state.dailyGiftDay : "";
  state.walkReadyAt = Math.max(0, Number(state.walkReadyAt) || 0);
  state.choreReadyAt = Math.max(0, Number(state.choreReadyAt) || 0);
  if(!state.dex || typeof state.dex !== "object" || Array.isArray(state.dex)) state.dex = {};
  if(!state.achievements || typeof state.achievements !== "object" || Array.isArray(state.achievements)) state.achievements = {};
  if(!state.cupWins || typeof state.cupWins !== "object" || Array.isArray(state.cupWins)) state.cupWins = {};
  CUPS.forEach(c=>{ state.cupWins[c.id] = Math.max(0, Math.round(Number(state.cupWins[c.id]) || 0)); });
  if(!state.buildings || typeof state.buildings !== "object" || Array.isArray(state.buildings)) state.buildings = {};
  Object.keys(BUILDINGS).forEach(k=>{
    state.buildings[k] = Math.max(1, Math.min(MAX_BLD, Math.round(Number(state.buildings[k]) || 1)));
  });
  state.carrotStamp = Math.max(0, Number(state.carrotStamp) || now());
  state.coinStamp = Math.max(0, Number(state.coinStamp) || now());
  if(!Array.isArray(state.horses)) state.horses = [];
  state.horses = state.horses.filter(h=>h && typeof h === "object" && BREEDS[h.breed]);
  let maxId = 0;
  const seenIds = new Set();
  state.horses.forEach(h=>{
    let id = Math.max(1, Math.round(Number(h.id) || 1));
    while(seenIds.has(id)) id = maxId + 1;
    h.id = id;
    seenIds.add(id);
    maxId = Math.max(maxId, h.id);
    if(!h.name) h.name = pick(NAME_A) + pick(NAME_B);
    assignTrait(h);
    h.gender = h.gender === "f" ? "f" : "m";
    h.stage = h.stage === "baby" ? "baby" : "adult";
    h.growth = Math.max(0, Math.min(100, Math.round(Number(h.growth) || (h.stage==="adult" ? 100 : 0))));
    h.coat = Math.max(0, Math.min(BREEDS[h.breed].coats.length - 1, Math.round(Number(h.coat) || 0)));
    h.bond = Math.max(0, Math.min(100, Math.round(Number(h.bond) || 0)));
    h.stats ||= {};
    STAT_KEYS.forEach(k=>{ h.stats[k] = Math.max(1, Math.min(statCap(h), Math.round(Number(h.stats[k]) || 1))); });
    h.coolTrain = Math.max(0, Number(h.coolTrain) || 0);
    h.coolRace = Math.max(0, Number(h.coolRace) || 0);
    h.treatUntil = Math.max(0, Number(h.treatUntil) || 0);
    h.wins = Math.max(0, Math.round(Number(h.wins) || 0));
    h.races = Math.max(h.wins, Math.round(Number(h.races) || 0));
  });
  state.nextId = Math.max(maxId + 1, Math.round(Number(state.nextId) || 1));
  if(state.breeding){
    const br = state.breeding;
    const validBreeding = BREEDS[br.breedA] && BREEDS[br.breedB] && br.statsA && br.statsB && Number(br.doneAt);
    if(validBreeding){
      br.doneAt = Number(br.doneAt);
      STAT_KEYS.forEach(k=>{
        br.statsA[k] = Math.max(1, Math.min(40, Math.round(Number(br.statsA[k]) || 1)));
        br.statsB[k] = Math.max(1, Math.min(40, Math.round(Number(br.statsB[k]) || 1)));
      });
      br.bondA = Math.max(0, Math.min(100, Math.round(Number(br.bondA) || 0)));
      br.bondB = Math.max(0, Math.min(100, Math.round(Number(br.bondB) || 0)));
      br.motherName ||= "엄마 말";
      br.fatherName ||= "아빠 말";
    } else {
      state.breeding = null;
    }
  }
  if(!state.horses.length){
    const a = newHorse(pick(NORMAL_BREEDS), "adult", [5,11]); a.gender="f";
    const b = newHorse(pick(NORMAL_BREEDS), "adult", [5,11]); b.gender="m";
    state.horses.push(a,b);
  }
  ensureQuests();
  ensureAchievements();
  markOwnedDex();
}
function load(){
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if(raw){ state = JSON.parse(raw); normalizeState(); save(); return; }
  } catch(e){}
  defaultState(); save();
}

/* ---------- 도트 스프라이트 ----------
   문자 → 색: B몸 M갈기 D발굽 E눈 N코 S무늬 H뿔 .투명 */
const SPR_W = 20, SPR_H = 16;
const FRAME_STAND = [
  "....................",
  "..........M.MM.....",
  ".........MBBBBM....",
  ".........BBBBBB....",
  ".........BEBBBB....",
  ".........BBBBNN....",
  "..M......BBBB......",
  ".MM..BBBBBBBB......",
  ".MMBBBBSBBBBB......",
  "..MBBBBBBSBBB......",
  "...BBSBBBBBBB......",
  "...BBB....BBB......",
  "...BB......BB......",
  "...DD......DD......",
  "....................",
  "....................",
];
const FRAME_RUN = [
  "....................",
  "..........M.MM.....",
  ".........MBBBBM....",
  ".........BBBBBB....",
  ".........BEBBBB....",
  ".........BBBBNN....",
  "..M......BBBB......",
  ".MM..BBBBBBBB......",
  ".MMBBBBSBBBBB......",
  "..MBBBBBBSBBB......",
  "...BBSBBBBBBB......",
  "..BBB......BBB.....",
  ".BB..........BB....",
  ".DD..........DD....",
  "....................",
  "....................",
];
// 유니콘 뿔 (머리 위)
const HORN_PIXELS = [[13,0],[12,1]];
// 얼룩말 줄무늬 (몸통 세로줄)
const STRIPE_PIXELS = [[5,7],[5,8],[5,9],[5,10],[8,7],[8,8],[8,9],[8,10],[11,7],[11,8],[11,9],[11,10]];
// 페가수스 날개 (등 위 — 달릴 때 퍼덕임)
const WING_PIXELS = [[4,4],[5,4],[6,4],[3,5],[4,5],[5,5],[6,5],[7,5],[4,6],[5,6],[6,6],[7,6],[8,6]];

function coatOf(h){
  const b = BREEDS[h.breed];
  return b.coats[Math.min(h.coat || 0, b.coats.length - 1)];
}
function drawHorse(ctx, horse, x, y, scale, frame, flip){
  const b = BREEDS[horse.breed];
  const coat = coatOf(horse);
  const pal = {
    B: coat.b, M: coat.m, D:"#3d2c1a", E:"#2b2226",
    N:"#eaa0ac", S: b.spot || coat.b, H:"#ffd76e",
  };
  const grid = frame ? FRAME_RUN : FRAME_STAND;
  ctx.save();
  ctx.translate(x, y);
  if(flip){ ctx.scale(-1,1); ctx.translate(-SPR_W*scale,0); }
  for(let r=0; r<SPR_H; r++){
    for(let c=0; c<SPR_W; c++){
      const ch = grid[r][c];
      if(!ch || ch === "." || !pal[ch]) continue;
      ctx.fillStyle = pal[ch];
      ctx.fillRect(c*scale, r*scale, scale, scale);
    }
  }
  if(b.horn){
    ctx.fillStyle = pal.H;
    HORN_PIXELS.forEach(([c,r]) => ctx.fillRect(c*scale, r*scale, scale, scale));
  }
  if(b.stripe){
    ctx.fillStyle = pal.M;
    STRIPE_PIXELS.forEach(([c,r]) => ctx.fillRect(c*scale, r*scale, scale, scale));
  }
  if(b.wing){
    ctx.fillStyle = pal.M;
    const dy = frame ? -1 : 0; // 달릴 때 날갯짓
    WING_PIXELS.forEach(([c,r]) => ctx.fillRect(c*scale, (r+dy)*scale, scale, scale));
  }
  ctx.restore();
}

// 카드용 말 미니 캔버스 생성
function horseCanvas(horse, scale){
  const cv = document.createElement("canvas");
  cv.width = SPR_W*scale; cv.height = SPR_H*scale;
  drawHorse(cv.getContext("2d"), horse, 0, 0, scale, 0, false);
  return cv;
}

/* ---------- 공통 게임 로직 ---------- */
function findHorse(id){ return state.horses.find(h=>h.id===id); }
function statTotal(h){ return h.stats.spd + h.stats.sta + h.stats.agi; }
function statCap(h){ return BREEDS[h.breed].special ? STAT_CAP_SPECIAL : STAT_CAP_NORMAL; }
function isAdult(h){ return h.stage === "adult"; }
function coolLeft(ts){ return Math.max(0, (ts - now())/1000); }
function treatLeft(h){ return coolLeft(h.treatUntil); }
function hasTreat(h){ return treatLeft(h) > 0; }
function bondBonus(h){ return Math.min(0.05, (Number(h.bond) || 0) / 2000); }
function bondText(h){ return `친밀도 ${Math.round(Number(h.bond) || 0)}/100`; }
function withJosa(text, hasBatchim, noBatchim){
  const s = String(text || "");
  const code = s.charCodeAt(s.length - 1);
  const batchim = code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
  return `${s}${batchim ? hasBatchim : noBatchim}`;
}
function addBond(h, n){
  h.bond = Math.max(0, Math.min(100, Math.round(Number(h.bond) || 0) + n));
}

function spendCoins(n){ if(state.coins < n) return false; state.coins -= n; return true; }
function spendCarrots(n){ if(state.carrots < n) return false; state.carrots -= n; return true; }

// 당근밭 자동 생산 (타임스탬프 기반)
function tickCarrots(){
  const lv = state.buildings.farm;
  const msPer = 60000 / (farmRate(lv) * weatherToday().carrot);
  const elapsed = now() - state.carrotStamp;
  const gained = Math.floor(elapsed / msPer);
  if(gained > 0){
    state.carrotStamp += gained * msPer;
    // 자동생산은 보관 한도까지만 (이미 한도를 넘겼다면 그대로 유지)
    const before = state.carrots;
    if(state.carrots < farmCap(lv)) state.carrots = Math.min(farmCap(lv), state.carrots + gained);
    save({ cloudDelay:30000, keepCloudTimer:true });
    return Math.max(0, state.carrots - before);
  }
  return 0;
}

function tickCoins(){
  const lv = state.buildings.stall;
  const msPer = 60000 / (stallRate(lv) * weatherToday().coin);
  const elapsed = now() - state.coinStamp;
  const gained = Math.floor(elapsed / msPer);
  if(gained > 0){
    state.coinStamp += gained * msPer;
    const before = state.coins;
    if(state.coins < stallCap(lv)) state.coins = Math.min(stallCap(lv), state.coins + gained);
    save({ cloudDelay:30000, keepCloudTimer:true });
    return Math.max(0, state.coins - before);
  }
  return 0;
}

/* ---------- 헤더/탭 ---------- */
function renderHeader(){
  $("#rCoins").textContent = state.coins;
  $("#rCarrots").textContent = state.carrots;
  $("#rTrophies").textContent = state.trophies;
}
let curTab = "ranch";
document.querySelectorAll(".tab").forEach(el=>{
  el.onclick = ()=>{
    if(raceRunning){ toast("경주가 끝난 뒤에 이동할 수 있어요!"); return; }
    curTab = el.dataset.tab;
    document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("on", t===el));
    renderView();
  };
});

function renderView(){
  stopRanchAnim();
  const v = $("#view");
  if(curTab==="ranch") renderRanch(v);
  else if(curTab==="train") renderTrain(v);
  else if(curTab==="breed") renderBreed(v);
  else if(curTab==="race") renderRace(v);
  renderHeader();
}

function syncMainTabs(){
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("on", t.dataset.tab===curTab));
}
function setMainTab(tab){
  curTab = tab;
  syncMainTabs();
  renderView();
}
function goTrainHorse(id){
  trainSel = id;
  closeModal();
  setMainTab("train");
}
function forgetHorseSelection(id){
  if(trainSel === id) trainSel = null;
  if(raceSel === id) raceSel = null;
  if(breedSelF === id) breedSelF = null;
  if(breedSelM === id) breedSelM = null;
}

/* ---------- 모달 ---------- */
function showModal(html){
  $("#modal").innerHTML = html;
  $("#modalBg").style.display = "flex";
}
function closeModal(){ $("#modalBg").style.display = "none"; }
$("#modalBg").addEventListener("click", e=>{ if(e.target.id==="modalBg") closeModal(); });

function exportSaveText(){
  return JSON.stringify({
    game:"malang-ranch",
    version:2,
    exportedAt:new Date().toISOString(),
    save:state,
  }, null, 2);
}
function openBackupModal(){
  showModal(`<h2>저장 백업</h2>
    <p class="hint">아래 내용을 복사해두면 다른 브라우저나 기기에서 다시 불러올 수 있어요.</p>
    <textarea class="backup-text" id="backupText" spellcheck="false"></textarea>
    <div id="backupMsg" style="font-size:12px;color:#b06a6a;min-height:14px;"></div>
    <div class="backup-actions">
      <button class="px pink" id="btnCopyBackup">복사</button>
      <button class="px" id="btnImportBackup">붙여넣은 저장 불러오기</button>
      <button class="px" onclick="closeModal()">닫기</button>
    </div>`);
  const text = $("#backupText");
  text.value = exportSaveText();
  text.focus();
  text.select();
  $("#btnCopyBackup").onclick = async ()=>{
    try {
      await navigator.clipboard.writeText(text.value);
      $("#backupMsg").textContent = "백업 내용을 클립보드에 복사했어요";
    } catch(e){
      text.focus(); text.select();
      $("#backupMsg").textContent = "복사가 막혔어요. 선택된 내용을 직접 복사해주세요";
    }
  };
  $("#btnImportBackup").onclick = ()=>{
    try {
      const parsed = JSON.parse(text.value);
      const imported = parsed && parsed.save ? parsed.save : parsed;
      if(!imported || !Array.isArray(imported.horses)) throw new Error("bad save");
      state = imported;
      normalizeState();
      save();
      closeModal();
      toast("백업 저장을 불러왔어요!");
      renderHeaderAccount();
      renderView();
    } catch(e){
      $("#backupMsg").textContent = "저장 데이터를 읽지 못했어요. 백업 내용을 다시 확인해주세요";
    }
  };
}

/* ---------- 말 카드 HTML ---------- */
function horseCardHTML(h, extra=""){
  const b = BREEDS[h.breed];
  const g = h.gender==="f" ? `<span class="gender-f">♀</span>` : `<span class="gender-m">♂</span>`;
  const tr = traitOf(h);
  const mood = moodOf(h);
  return `
    <div class="hcard ${extra}" data-hid="${h.id}">
      ${b.special ? `<div class="special-tag">✦특이</div>` : ""}
      ${!isAdult(h) ? `<div class="baby-tag">아기</div>` : ""}
      <div class="spr" data-spr="${h.id}"></div>
      <div class="nm">${esc(h.name)} ${g}</div>
      <div class="bd">${b.name} · ${tr.name} · ${mood.icon}${mood.name}${isAdult(h) ? ` · 합 ${statTotal(h)}` : ` · 성장 ${h.growth}%`} · ♥${Math.round(h.bond || 0)}</div>
    </div>`;
}
function mountSprites(root, scale=3){
  root.querySelectorAll("[data-spr]").forEach(el=>{
    const h = findHorse(+el.dataset.spr);
    if(h) el.appendChild(horseCanvas(h, isAdult(h) ? scale : scale-1));
  });
}

function openRenameHorse(h){
  showModal(`<h2>말 이름 바꾸기</h2>
    <p class="hint">${esc(h.name)}에게 새 이름을 붙여주세요. (1~12자)</p>
    <input class="in" id="horseNameIn" maxlength="12" style="width:100%;margin:10px 0;">
    <div id="renameMsg" style="font-size:12px;color:#b06a6a;min-height:14px;"></div>
    <div style="margin-top:10px;display:flex;gap:8px;justify-content:center;">
      <button class="px pink" id="renameOk">바꾸기</button>
      <button class="px" onclick="closeModal()">취소</button>
    </div>`);
  const inp = $("#horseNameIn");
  inp.value = h.name;
  inp.focus();
  inp.select();
  $("#renameOk").onclick = ()=>{
    const v = inp.value.trim();
    if(!v || v.length > 12){
      $("#renameMsg").textContent = "이름은 1~12자로 입력해주세요";
      return;
    }
    h.name = v;
    save();
    closeModal();
    toast(`이름을 ${h.name}(으)로 바꿨어요!`);
    renderView();
  };
}

function openDexModal(){
  const seen = state.dex || {};
  showModal(`<h2>말 도감 ${dexCount()}</h2>
    <div class="dex-grid">
      ${Object.entries(BREEDS).map(([breed,b])=>`
        <div class="dex-row">
          <div class="dex-name">${b.special ? "✦ " : ""}${b.name}</div>
          <div class="dex-coats">
            ${b.coats.map((coat,i)=>{
              const got = seen[breed + ":" + i];
              return `<span class="dex-coat ${got?"got":""}" title="${esc(coat.n)}">${got ? esc(coat.n) : "???"}</span>`;
            }).join("")}
          </div>
        </div>`).join("")}
    </div>
    <button class="px pink" onclick="closeModal()" style="margin-top:12px;">닫기</button>`);
}

function openHelpModal(){
  showModal(`<h2>목장 안내</h2>
    <div class="help-list">
      <div><b>오늘의 추천 목표</b><br>지금 하면 좋은 행동 3가지를 골라 보여줘요.</div>
      <div><b>대표말</b><br>가장 강한 성체 말이에요. 바로 훈련하거나 경주에 보낼 수 있어요.</div>
      <div><b>친밀도와 기분</b><br>돌보기, 간식, 훈련, 경주로 친해지고 매일 기분에 따라 보너스가 달라져요.</div>
      <div><b>목장 명성</b><br>도감, 컵 우승, 업적, 트로피를 모으면 목장 등급이 올라요.</div>
      <div><b>돈이 부족하면</b><br>목장 일손돕기, 당근 장터, 출석 보급품으로 다시 시작할 수 있어요.</div>
    </div>
    <button class="px pink" onclick="closeModal()" style="margin-top:12px;">알겠어요</button>`);
}

function dailyGiftPanelHTML(){
  const claimed = state.dailyGiftDay === todayKey();
  const preview = dailyGiftPreview();
  const label = claimed ? `연속 ${state.loginStreak}일째 · 내일 또 받아요` : `오늘 받기 · 연속 ${preview.streak}일차`;
  return `<div class="daily ${claimed ? "claimed" : ""}">
      <div class="daily-main">
        <div class="ttl">🎁 출석 보급품</div>
        <div class="desc">${label}</div>
        <div class="desc">보상 ${questRewardText(preview.reward)}${preview.streak % 7 === 0 ? " · 7일 보너스 포함!" : ""}</div>
      </div>
      <button class="px small pink" id="btnDailyGift" ${claimed ? "disabled" : ""}>${claimed ? "완료" : "받기"}</button>
    </div>`;
}

function weatherPanelHTML(){
  const w = weatherToday();
  return `<div class="weather">
    <div class="weather-icon">${w.icon}</div>
    <div class="weather-main">
      <div class="ttl">오늘의 날씨: ${w.name}</div>
      <div class="desc">${w.desc}</div>
    </div>
  </div>`;
}

function famePanelHTML(){
  const score = fameScore();
  const { current, next } = fameRank(score);
  const nextText = next ? `다음 등급 ${next.name}까지 ${next.score - score}점` : "최고 등급이에요";
  const cupStamps = CUPS.filter(c=>(state.cupWins?.[c.id] || 0) > 0).length;
  const claimedAchievements = Object.values(state.achievements || {}).filter(Boolean).length;
  return `<div class="fame">
    <div class="fame-icon">⭐</div>
    <div class="fame-main">
      <div class="ttl">목장 명성: ${current.name} · ${score}점</div>
      <div class="desc">${nextText} · 도감 ${dexCount()} · 컵 도장 ${cupStamps}/${CUPS.length} · 업적 ${claimedAchievements}/${ACHIEVEMENTS.length}</div>
    </div>
  </div>`;
}

function spotlightPanelHTML(){
  const adults = state.horses.filter(isAdult);
  if(!adults.length){
    const baby = state.horses.find(h=>!isAdult(h));
    return `<div class="spotlight">
      <div class="spotlight-main">
        <div class="ttl">대표말 준비 중</div>
        <div class="desc">${baby ? `${esc(baby.name)}를 돌봐서 성체로 키우면 훈련과 경주에 나갈 수 있어요.` : "말을 입양해 목장을 시작해보세요."}</div>
      </div>
      <button class="px small" data-spot-tab="${baby ? "train" : "ranch"}">이동</button>
    </div>`;
  }
  const h = adults.reduce((best, cur)=>statTotal(cur) > statTotal(best) ? cur : best);
  const b = BREEDS[h.breed];
  const mood = moodOf(h);
  const raceLeft = coolLeft(h.coolRace);
  return `<div class="spotlight">
    <div class="spotlight-spr" data-spr="${h.id}"></div>
    <div class="spotlight-main">
      <div class="ttl">대표말: ${esc(h.name)} (${b.name})</div>
      <div class="desc">합 ${statTotal(h)} · ${bondText(h)} · 오늘 기분 ${mood.icon}${mood.name}${raceLeft>0 ? ` · 경주 휴식 ${fmtSec(raceLeft)}` : " · 경주 가능"}</div>
    </div>
    <div class="spotlight-actions">
      <button class="px small" data-spot-train="${h.id}">훈련</button>
      <button class="px small green" data-spot-race="${h.id}" ${raceLeft>0?"disabled":""}>경주</button>
    </div>
  </div>`;
}

function guidePanelHTML(){
  const items = [];
  const adults = state.horses.filter(isAdult);
  const readyAdult = adults.find(h=>coolLeft(h.coolRace)<=0);
  const unfinishedCup = CUPS.find(c=>(state.cupWins?.[c.id] || 0) <= 0);
  const claimableQuest = state.quests?.items?.some(q=>q.progress >= q.target && !q.claimed);
  const claimableAch = ACHIEVEMENTS.some(a=>{
    const s = achievementStatus(a);
    return s.done && !s.claimed;
  });
  if(state.dailyGiftDay !== todayKey()) items.push({ title:"출석 보급품 받기", desc:"오늘 보상으로 코인과 당근을 챙겨요.", tab:"ranch", section:"summary" });
  if(claimableQuest || claimableAch) items.push({ title:"완료 보상 받기", desc:"의뢰나 업적 보상을 한 번에 받을 수 있어요.", action:"claimRewards" });
  if(fameRank().next) items.push({ title:"목장 명성 올리기", desc:"도감 발견, 컵 우승, 업적 보상으로 명성을 키워요.", tab:"race" });
  if(state.coins < 80) items.push({ title:"코인 회복하기", desc:"일손돕기나 당근 장터로 다시 굴릴 돈을 마련해요.", tab:"ranch", section:"activity" });
  if(state.carrots < TRAIN_CARROT && state.coins >= 80) items.push({ title:"당근 모으기", desc:"당근밭 생산을 기다리거나 산책에서 보상을 찾아봐요.", tab:"ranch", section:"activity" });
  if(adults.length && readyAdult && unfinishedCup) items.push({ title:`${unfinishedCup.name} 우승 도전`, desc:"컵 도장을 모으면 컵 정복자 업적이 열려요.", tab:"race" });
  if(adults.length && state.carrots >= TRAIN_CARROT) items.push({ title:"말 훈련하기", desc:"스탯과 친밀도를 올려 더 높은 컵을 노려요.", tab:"train" });
  if(adults.filter(h=>h.gender==="f").length && adults.filter(h=>h.gender==="m").length && !state.breeding && state.coins >= BREED_COST && state.horses.length < stableCap(state.buildings.stable)){
    items.push({ title:"새 혈통 만들기", desc:"교배로 도감과 전설 조합을 노려봐요.", tab:"breed" });
  }
  if(state.horses.length >= stableCap(state.buildings.stable)) items.push({ title:"마구간 확장", desc:"말이 가득 찼어요. 마구간을 업그레이드하면 더 키울 수 있어요.", tab:"ranch", section:"manage" });
  while(items.length < 3) items.push({ title:"목장 산책하기", desc:"작은 보상과 친밀도 기회를 찾을 수 있어요.", tab:"ranch", section:"activity" });
  return `<h3 class="sec" style="margin-top:12px;">오늘의 추천 목표</h3>
    <div class="guide">
      ${items.slice(0,3).map(item=>`
        <div class="guide-item">
          <div class="guide-main">
            <div class="ttl">${item.title}</div>
            <div class="desc">${item.desc}</div>
          </div>
          <button class="px small ${item.action ? "pink" : ""}" ${item.action ? `data-guide-action="${item.action}"` : `data-guide-tab="${item.tab}"${item.section ? ` data-guide-section="${item.section}"` : ""}`}>
            ${item.action ? "받기" : "이동"}
          </button>
        </div>`).join("")}
    </div>`;
}

function questPanelHTML(){
  ensureQuests();
  const ready = state.quests.items.filter(q=>q.progress >= q.target && !q.claimed).length;
  const done = state.quests.items.filter(q=>q.claimed).length;
  return `<details class="fold-panel" ${ready ? "open" : ""}>
    <summary>
      <span>오늘의 목장 의뢰</span>
      <span class="fold-meta">${ready ? `받을 것 ${ready}개` : `${done}/${state.quests.items.length} 완료`}</span>
    </summary>
    <div class="quest-grid">
      ${state.quests.items.map(q=>{
        const done = q.progress >= q.target;
        return `<div class="quest ${done ? "done" : ""}">
          <div class="quest-main">
            <div class="ttl">${q.claimed ? "✓ " : ""}${q.title}</div>
            <div class="desc">${q.progress}/${q.target} · 보상 ${questRewardText(q.reward)}</div>
          </div>
          <button class="px small ${done && !q.claimed ? "pink" : ""}" data-claim="${q.id}" ${done && !q.claimed ? "" : "disabled"}>
            ${q.claimed ? "완료" : "받기"}
          </button>
        </div>`;
      }).join("")}
    </div>
  </details>`;
}

function achievementPanelHTML(){
  ensureAchievements();
  const statuses = ACHIEVEMENTS.map(a=>({ a, s:achievementStatus(a) }));
  const ready = statuses.filter(x=>x.s.done && !x.s.claimed).length;
  const claimed = statuses.filter(x=>x.s.claimed).length;
  return `<details class="fold-panel" ${ready ? "open" : ""}>
    <summary>
      <span>목장 업적</span>
      <span class="fold-meta">${ready ? `받을 것 ${ready}개` : `${claimed}/${ACHIEVEMENTS.length} 완료`}</span>
    </summary>
    <div class="ach-grid">
      ${statuses.map(({a,s})=>{
        return `<div class="ach ${s.done ? "done" : ""}">
          <div class="ach-main">
            <div class="ttl">${s.claimed ? "✓ " : ""}${a.title}</div>
            <div class="desc">${a.desc} · ${s.progress}/${a.target} · 보상 ${questRewardText(a.reward)}</div>
          </div>
          <button class="px small ${s.done && !s.claimed ? "pink" : ""}" data-ach="${a.id}" ${s.done && !s.claimed ? "" : "disabled"}>
            ${s.claimed ? "완료" : "받기"}
          </button>
        </div>`;
      }).join("")}
    </div>
  </details>`;
}

function marketPanelHTML(){
  const trades = [
    { id:"small", carrots:10, coins:30, label:"작은 바구니" },
    { id:"big", carrots:30, coins:95, label:"큰 수레" },
  ];
  return `<div class="market">
      <div class="market-main">
        <div class="ttl">🥕 당근 팔기</div>
        <div class="desc">남는 당근을 코인으로 바꿔요. 급할 때 목장을 다시 굴릴 수 있어요.</div>
      </div>
      <div class="market-actions">
        ${trades.map(t=>`
          <button class="px small" data-market="${t.id}" data-carrots="${t.carrots}" data-coins="${t.coins}" ${state.carrots<t.carrots?"disabled":""}>
            ${t.label} 🥕${t.carrots} → 🪙${t.coins}
          </button>`).join("")}
      </div>
    </div>`;
}

function chorePanelHTML(){
  const left = coolLeft(state.choreReadyAt);
  return `<div class="chore">
      <div class="chore-main">
        <div class="ttl">🧹 급할 땐 직접 벌기</div>
        <div class="desc" id="choreDesc">${left>0 ? `다음 일감까지 ${fmtSec(left)}` : "코인이나 당근이 부족해도 할 수 있는 작은 일감이에요."}</div>
      </div>
      <button class="px small green" id="btnChore" ${left>0?"disabled":""}>일손돕기</button>
    </div>`;
}

function doChore(){
  if(coolLeft(state.choreReadyAt)>0){ toast(`다음 일감까지 ${fmtSec(coolLeft(state.choreReadyAt))}`); return; }
  state.choreReadyAt = now() + CHORE_COOL*1000;
  state.ranchJobs = (state.ranchJobs || 0) + 1;
  const events = [
    ()=>{
      const coins = 35 + state.horses.length * 4 + ri(0, 12);
      state.coins += coins;
      return `마구간을 쓸고 품삯을 받았어요! 🪙+${coins}`;
    },
    ()=>{
      const carrots = ri(5, 10);
      const coins = ri(18, 30);
      state.carrots += carrots;
      state.coins += coins;
      return `당근밭 김을 매고 보상을 받았어요! 🥕+${carrots} 🪙+${coins}`;
    },
    ()=>{
      const coins = 45 + Math.min(40, state.trophies * 8);
      state.coins += coins;
      return `목장 구경 손님을 안내했어요! 🪙+${coins}`;
    },
  ];
  const msg = pick(events)();
  save();
  toast(msg);
  renderView();
}

function walkPanelHTML(){
  const left = coolLeft(state.walkReadyAt);
  return `<div class="walk">
      <div class="walk-main">
        <div class="ttl">🌿 목장 둘러보기</div>
        <div class="desc" id="walkDesc">${left>0 ? `다음 산책까지 ${fmtSec(left)}` : "작은 사건과 보상을 발견할 수 있어요."}</div>
      </div>
      <button class="px small green" id="btnWalk" ${left>0?"disabled":""}>산책하기</button>
    </div>`;
}

function doRanchWalk(){
  if(coolLeft(state.walkReadyAt)>0){ toast(`다음 산책까지 ${fmtSec(coolLeft(state.walkReadyAt))}`); return; }
  state.walkReadyAt = now() + WALK_COOL*1000;
  state.ranchWalks = (state.ranchWalks || 0) + 1;
  const babies = state.horses.filter(h=>!isAdult(h));
  const adults = state.horses.filter(isAdult);
  const events = [
    ()=>{
      const n = ri(8,18);
      state.carrots += n;
      return `풀숲에서 싱싱한 당근을 찾았어요! 🥕+${n}`;
    },
    ()=>{
      const n = ri(25,55);
      state.coins += n;
      return `낡은 편자 옆에서 반짝이는 코인을 주웠어요! 🪙+${n}`;
    },
    ()=>{
      if(!babies.length) return null;
      const h = pick(babies);
      h.growth = Math.min(100, h.growth + ri(8,16));
      addBond(h, 4);
      return `${h.name}가 산책하며 훌쩍 자랐어요! 성장 ${h.growth}%, ${bondText(h)}`;
    },
    ()=>{
      if(!adults.length) return null;
      const h = pick(adults);
      h.treatUntil = Math.max(h.treatUntil || 0, now() + Math.floor(SNACK_TIME/2)*1000);
      addBond(h, 4);
      return `${h.name}가 들판에서 기운을 얻었어요! 짧은 간식 효과가 붙었어요 · ${bondText(h)}`;
    },
  ];
  let msg = null;
  for(let tries=0; tries<6 && !msg; tries++) msg = pick(events)();
  save();
  toast(msg || "상쾌하게 목장을 한 바퀴 돌았어요!");
  renderView();
}

/* =====================================================
   목장 탭
   ===================================================== */
let ranchAnimId = null, ranchHorses = [];
let ranchSection = "summary";
const RANCH_SECTIONS = [
  { id:"summary", label:"요약" },
  { id:"activity", label:"활동" },
  { id:"manage", label:"관리" },
];
function stopRanchAnim(){ if(ranchAnimId){ cancelAnimationFrame(ranchAnimId); ranchAnimId=null; } }

function ranchSectionBadge(id){
  if(id === "activity"){
    ensureQuests();
    ensureAchievements();
    const daily = state.dailyGiftDay !== todayKey() ? 1 : 0;
    const chores = coolLeft(state.choreReadyAt) <= 0 ? 1 : 0;
    const walks = coolLeft(state.walkReadyAt) <= 0 ? 1 : 0;
    const quests = state.quests.items.filter(q=>q.progress >= q.target && !q.claimed).length;
    const achievements = ACHIEVEMENTS.filter(a=>{
      const s = achievementStatus(a);
      return s.done && !s.claimed;
    }).length;
    return daily + chores + walks + quests + achievements;
  }
  if(id === "manage"){
    return Object.entries(BUILDINGS).filter(([k,b])=>{
      const lv = state.buildings[k];
      return lv < MAX_BLD && state.coins >= b.cost(lv);
    }).length;
  }
  return 0;
}

function buildingPanelHTML(){
  return `<h3 class="sec">건물</h3>
    <div class="bld-grid">
      ${Object.entries(BUILDINGS).map(([k,b])=>{
        const lv = state.buildings[k];
        const maxed = lv >= MAX_BLD;
        return `<div class="bld">
          <div class="ttl">${b.name} <span style="color:#c2607e">Lv.${lv}</span></div>
          <div class="desc">${b.desc(lv)}${maxed?"":`<br>▶ 다음: ${b.desc(lv+1)}`}</div>
          <button class="px small green" data-up="${k}" ${maxed||state.coins<b.cost(lv)?"disabled":""}>
            ${maxed ? "최대 레벨" : `업그레이드 🪙${b.cost(lv)}`}
          </button>
        </div>`;
      }).join("")}
    </div>
    <div class="hint">당근은 당근밭에서, 코인은 동전노점에서 시간이 지나면 자동으로 쌓여요.</div>`;
}

function ranchSectionHTML(){
  if(ranchSection === "activity"){
    return `<h3 class="sec" style="margin-top:12px;">빠른 활동</h3>
      <div class="quick-grid">
        ${dailyGiftPanelHTML()}
        ${chorePanelHTML()}
        ${walkPanelHTML()}
        ${marketPanelHTML()}
      </div>
      ${questPanelHTML()}
      ${achievementPanelHTML()}`;
  }
  if(ranchSection === "manage"){
    return `${buildingPanelHTML()}`;
  }
  return `${weatherPanelHTML()}
    ${famePanelHTML()}
    ${spotlightPanelHTML()}
    ${guidePanelHTML()}
    ${state.dailyGiftDay !== todayKey() ? dailyGiftPanelHTML() : ""}`;
}

function renderRanch(v){
  if(!RANCH_SECTIONS.some(s=>s.id === ranchSection)) ranchSection = "summary";
  v.innerHTML = `
    <div id="ranchCanvasWrap"><canvas id="ranchCanvas" width="800" height="260"></canvas></div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap;">
      <div style="font-size:14px;">🐴 보유한 말: ${state.horses.length} / ${stableCap(state.buildings.stable)}</div>
      <button class="px small" id="btnDex">도감 ${dexCount()}</button>
      <button class="px small" id="btnHelp">목장 안내</button>
      <button class="px small" id="btnBackup">저장 백업</button>
      <button class="px small blue" id="btnAdopt">말 입양 (🪙${ADOPT_COST})</button>
    </div>
    <div class="ranch-switch">
      ${RANCH_SECTIONS.map(s=>{
        const badge = ranchSectionBadge(s.id);
        return `<button class="px small ${ranchSection===s.id ? "pink" : ""}" data-ranch-section="${s.id}">
          ${s.label}${badge ? ` <span class="ranch-badge">${badge}</span>` : ""}
        </button>`;
      }).join("")}
    </div>
    ${ranchSectionHTML()}`;

  mountSprites(v);
  v.querySelectorAll("[data-ranch-section]").forEach(btn=>{
    btn.onclick = ()=>{
      ranchSection = btn.dataset.ranchSection;
      renderView();
    };
  });
  v.querySelectorAll("[data-up]").forEach(btn=>{
    btn.onclick = ()=>{
      const k = btn.dataset.up, lv = state.buildings[k];
      const cost = BUILDINGS[k].cost(lv);
      if(!spendCoins(cost)){ toast("코인이 부족해요!"); return; }
      state.buildings[k]++;
      if(k==="farm") state.carrotStamp = now();
      if(k==="stall") state.coinStamp = now();
      save(); toast(`${BUILDINGS[k].name} Lv.${lv+1} 완성!`);
      renderView();
    };
  });
  const dailyBtn = $("#btnDailyGift");
  if(dailyBtn) dailyBtn.onclick = ()=>{
    const gift = claimDailyGift();
    if(!gift){ toast("오늘 보급품은 이미 받았어요!"); return; }
    save();
    toast(`출석 보급품 ${questRewardText(gift.reward)}을 받았어요!`);
    renderView();
  };
  v.querySelectorAll("[data-claim]").forEach(btn=>{
    btn.onclick = ()=>{
      const q = state.quests.items.find(x=>x.id === btn.dataset.claim);
      if(!q || q.claimed || q.progress < q.target) return;
      state.coins += q.reward.coins || 0;
      state.carrots += q.reward.carrots || 0;
      q.claimed = true;
      save();
      toast(`의뢰 보상 ${questRewardText(q.reward)}을 받았어요!`);
      renderView();
    };
  });
  v.querySelectorAll("[data-ach]").forEach(btn=>{
    btn.onclick = ()=>{
      const a = ACHIEVEMENTS.find(x=>x.id === btn.dataset.ach);
      if(!a) return;
      const s = achievementStatus(a);
      if(!s.done || s.claimed) return;
      state.coins += a.reward.coins || 0;
      state.carrots += a.reward.carrots || 0;
      state.achievements[a.id] = true;
      save();
      toast(`업적 보상 ${questRewardText(a.reward)}을 받았어요!`);
      renderView();
    };
  });
  v.querySelectorAll("[data-guide-tab]").forEach(btn=>{
    btn.onclick = ()=>{
      curTab = btn.dataset.guideTab;
      if(curTab === "ranch" && btn.dataset.guideSection) ranchSection = btn.dataset.guideSection;
      document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("on", t.dataset.tab===curTab));
      renderView();
    };
  });
  v.querySelectorAll("[data-guide-action]").forEach(btn=>{
    btn.onclick = ()=>{
      if(btn.dataset.guideAction === "claimRewards") claimReadyRewards();
    };
  });
  v.querySelectorAll("[data-spot-tab]").forEach(btn=>{
    btn.onclick = ()=>{
      curTab = btn.dataset.spotTab;
      document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("on", t.dataset.tab===curTab));
      renderView();
    };
  });
  v.querySelectorAll("[data-spot-train]").forEach(btn=>{
    btn.onclick = ()=>{
      trainSel = +btn.dataset.spotTrain;
      curTab = "train";
      document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("on", t.dataset.tab===curTab));
      renderView();
    };
  });
  v.querySelectorAll("[data-spot-race]").forEach(btn=>{
    btn.onclick = ()=>{
      raceSel = +btn.dataset.spotRace;
      curTab = "race";
      document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("on", t.dataset.tab===curTab));
      renderView();
    };
  });
  v.querySelectorAll("[data-market]").forEach(btn=>{
    btn.onclick = ()=>{
      const carrots = Number(btn.dataset.carrots);
      const coins = Number(btn.dataset.coins);
      if(!spendCarrots(carrots)){ toast("팔 당근이 부족해요!"); return; }
      state.coins += coins;
      state.marketTrades = (state.marketTrades || 0) + 1;
      save();
      toast(`당근을 팔아 🪙${coins}을 벌었어요!`);
      renderView();
    };
  });
  const walkBtn = $("#btnWalk");
  if(walkBtn) walkBtn.onclick = doRanchWalk;
  const choreBtn = $("#btnChore");
  if(choreBtn) choreBtn.onclick = doChore;
  $("#btnDex").onclick = openDexModal;
  $("#btnHelp").onclick = openHelpModal;
  $("#btnBackup").onclick = openBackupModal;
  $("#btnAdopt").onclick = ()=>{
    if(state.horses.length >= stableCap(state.buildings.stable)){ toast("마구간이 꽉 찼어요!"); return; }
    if(!spendCoins(ADOPT_COST)){ toast("코인이 부족해요!"); return; }
    const h = newHorse(pick(NORMAL_BREEDS), "adult", [4,10]);
    state.horses.push(h); markDex(h); save();
    toast(`${h.name}(${BREEDS[h.breed].name})가 목장에 왔어요!`);
    renderView();
  };

  startRanchAnim();
}

function startRanchAnim(){
  const cv = $("#ranchCanvas");
  if(!cv) return;
  const ctx = cv.getContext("2d");
  const W = cv.width, H = cv.height;
  ranchHorses = state.horses.map(h=>({
    h, x: rnd(30, W-90), y: rnd(80, H-60),
    dir: Math.random()<0.5?-1:1, vx: rnd(0.15,0.45),
    pause: rnd(0,120), frame:0, ft:0,
  }));
  let last = performance.now();
  function loop(t){
    const dt = Math.min(50, t-last); last = t;
    ctx.clearRect(0,0,W,H);
    // 배경: 하늘/잔디/울타리
    ctx.fillStyle="#bfe6f5"; ctx.fillRect(0,0,W,64);
    ctx.fillStyle="#fff";
    [[60,20],[200,34],[420,16],[640,30]].forEach(([cx,cy])=>{
      ctx.fillRect(cx,cy,36,10); ctx.fillRect(cx+8,cy-8,20,8); ctx.fillRect(cx+6,cy+10,24,6);
    });
    ctx.fillStyle="#a8d69a"; ctx.fillRect(0,64,W,H-64);
    ctx.fillStyle="#94c986";
    for(let i=0;i<14;i++){ ctx.fillRect((i*67)%W, 80+(i*53)%(H-110), 8, 4); }
    ctx.fillStyle="#8a6d4b";
    for(let x=6;x<W;x+=46){ ctx.fillRect(x,52,6,26); }
    ctx.fillRect(0,58,W,5); ctx.fillRect(0,70,W,5);

    ranchHorses.forEach(o=>{
      if(o.pause>0){ o.pause -= dt/16; o.frame=0; }
      else {
        o.x += o.vx * o.dir * dt/8;
        o.ft += dt;
        if(o.ft>160){ o.frame ^= 1; o.ft=0; }
        if(Math.random()<0.002) o.pause = rnd(60,220);
        if(Math.random()<0.001) o.dir *= -1;
        if(o.x < 8){ o.x=8; o.dir=1; }
        if(o.x > W-70){ o.x=W-70; o.dir=-1; }
      }
      const sc = isAdult(o.h) ? 3 : 2;
      drawHorse(ctx, o.h, o.x, o.y - SPR_H*sc, sc, o.frame, o.dir<0);
      if(BREEDS[o.h.breed].special && Math.floor(t/300)%2===0){
        ctx.fillStyle="#fff8b0";
        ctx.fillRect(o.x-4, o.y-SPR_H*sc-4, 3,3); ctx.fillRect(o.x+SPR_W*sc, o.y-20, 3,3);
      }
      ctx.fillStyle="#4a3826"; ctx.font="11px DungGeunMo,monospace"; ctx.textAlign="center";
      ctx.fillText(o.h.name, o.x + SPR_W*sc/2, o.y+12);
    });
    ranchAnimId = requestAnimationFrame(loop);
  }
  ranchAnimId = requestAnimationFrame(loop);
}

/* =====================================================
   훈련 탭
   ===================================================== */
let trainSel = null;
function renderTrain(v){
  if(trainSel!==null && !findHorse(trainSel)) trainSel = null;
  if(trainSel===null && state.horses.length) trainSel = state.horses[0].id;
  const h = findHorse(trainSel);
  v.innerHTML = `
    <h3 class="sec">말 선택</h3>
    <div class="horse-grid" id="tGrid">
      ${state.horses.map(x=>horseCardHTML(x, x.id===trainSel?"sel":"")).join("")}
    </div>
    <div id="tDetail" style="margin-top:14px;"></div>`;
  mountSprites($("#tGrid"));
  v.querySelectorAll(".hcard").forEach(c=>{
    c.onclick = ()=>{ trainSel = +c.dataset.hid; renderView(); };
  });
  if(h) renderTrainDetail($("#tDetail"), h);
}

function recommendedTrainStat(h){
  const cap = statCap(h);
  return STAT_KEYS.filter(k=>h.stats[k] < cap).sort((a,b)=>h.stats[a] - h.stats[b])[0] || null;
}

function trainHorseStat(h, k){
  const gymLv = state.buildings.gym;
  const trait = traitOf(h);
  const mood = moodOf(h);
  const cap = statCap(h);
  if(!k || h.stats[k] >= cap){ toast("이미 충분히 성장한 스탯이에요!"); return; }
  if(!spendCarrots(TRAIN_CARROT)){ toast("당근이 부족해요!"); return; }
  h.coolTrain = now() + trainCool(gymLv)*1000;
  addQuestProgress("train");
  const rate = Math.min(0.97, Math.max(0.35, 0.92 - h.stats[k]*0.022 + (gymLv-1)*0.04 + (trait.train || 0) + (mood.train || 0) + (hasTreat(h) ? 0.06 : 0) + bondBonus(h)));
  if(Math.random() < rate){
    h.stats[k] = Math.min(cap, h.stats[k]+1);
    addBond(h, 3);
    toast(`✨ ${STAT_NAME[k]} 훈련 성공! ${h.stats[k]-1} → ${h.stats[k]}`);
  } else {
    addBond(h, 1);
    toast(`💦 ${h.name}가 딴청을 부렸어요… 훈련 실패`);
  }
  save();
  renderView();
}

function renderTrainDetail(el, h){
  const cool = coolLeft(h.coolTrain);
  const gymLv = state.buildings.gym;
  const b = BREEDS[h.breed];
  const trait = traitOf(h);
  const mood = moodOf(h);
  if(!isAdult(h)){
    el.innerHTML = `
      <h3 class="sec">${esc(h.name)} 돌보기 (아기)</h3>
      <div class="st-row"><div class="lb">성장도</div>
        <div class="statbar"><div style="width:${h.growth}%;background:var(--pink)"></div></div>
        <div class="vl">${h.growth}%</div></div>
      <div class="st-row"><div class="lb">친밀도</div>
        <div class="statbar"><div style="width:${h.bond}%;background:var(--gold)"></div></div>
        <div class="vl">${h.bond}/100</div></div>
      <div class="hint">성격: ${trait.name} — ${trait.desc}<br>오늘 기분: ${mood.icon}${mood.name} — ${mood.desc}<br>아기 말은 돌봐주면 무럭무럭 자라요. 성장 100%가 되면 성체가 되어 훈련과 경주에 나갈 수 있어요.</div>
      <div style="margin-top:10px;">
        <button class="px pink" id="btnCare" ${cool>0||state.carrots<CARE_CARROT?"disabled":""}>
          🥕${CARE_CARROT} 돌봐주기
        </button>
        <button class="px small" id="btnRenameBaby">이름 바꾸기</button>
        ${cool>0?`<span class="cool"> 휴식 중… ${fmtSec(cool)}</span>`:""}
      </div>`;
    $("#btnRenameBaby").onclick = ()=>openRenameHorse(h);
    const btn = $("#btnCare");
    if(btn) btn.onclick = ()=>{
      if(!spendCarrots(CARE_CARROT)){ toast("당근이 부족해요!"); return; }
      h.growth = Math.min(100, h.growth + ri(20,34) + (trait.care || 0));
      addBond(h, 8);
      h.coolTrain = now() + 15000;
      addQuestProgress("care");
      if(h.growth >= 100){
        h.stage = "adult";
        save();
        showModal(`<h2>🎉 어른이 되었어요!</h2>
          <div class="spr" data-spr="${h.id}" style="display:flex;justify-content:center;margin:8px 0;"></div>
          <p>${esc(h.name)}(${b.name})가 늠름한 성체가 되었어요.<br>이제 훈련과 경주에 나갈 수 있어요!</p>
          <button class="px pink" onclick="closeModal();renderView()" style="margin-top:12px;">좋아!</button>`);
        mountSprites($("#modal"), 4);
      } else {
        save(); toast(`${h.name}가 기분 좋아해요! 성장 ${h.growth}%, ${bondText(h)}`);
        renderView();
      }
    };
    return;
  }
  const cap = statCap(h);
  const snackLeft = treatLeft(h);
  const snackBonus = hasTreat(h) ? 6 : 0;
  const traitTrainBonus = Math.round((trait.train || 0) * 100);
  const moodTrainBonus = Math.round((mood.train || 0) * 100);
  const recStat = recommendedTrainStat(h);
  el.innerHTML = `
    <h3 class="sec">${esc(h.name)} 훈련 ${b.special?'<span style="color:#c2607e;font-size:12px;">✦특이개체 (상한 +5)</span>':""}</h3>
      ${STAT_KEYS.map(k=>`
      <div class="st-row">
        <div class="lb">${STAT_NAME[k]}</div>
        <div class="statbar"><div style="width:${h.stats[k]/cap*100}%;background:${STAT_COLOR[k]}"></div></div>
        <div class="vl">${h.stats[k]}/${cap}</div>
        <button class="px small" data-tr="${k}" ${cool>0||state.carrots<TRAIN_CARROT||h.stats[k]>=cap?"disabled":""}>🥕${TRAIN_CARROT} 훈련</button>
      </div>`).join("")}
      <div class="hint">
        성격: ${trait.name} — ${trait.desc}<br>
        오늘 기분: ${mood.icon}${mood.name} — ${mood.desc}<br>
        ${bondText(h)} · 친할수록 훈련과 경주에서 최대 +5% 보너스<br>
        전적: ${h.races}전 ${h.wins}승 · 훈련 성공률은 스탯이 높을수록 낮아져요 (훈련장 Lv.${gymLv} 보너스 +${(gymLv-1)*4}%${traitTrainBonus?` · 성격 +${traitTrainBonus}%`:""}${moodTrainBonus?` · 기분 ${moodTrainBonus>0?"+":""}${moodTrainBonus}%`:""}${snackBonus?` · 간식 +${snackBonus}%`:""}${h.bond?` · 친밀도 +${Math.round(bondBonus(h)*100)}%`:""})
      ${snackLeft>0?`<br><span class="cool">응원 간식 효과 ${fmtSec(snackLeft)} 남음</span>`:""}
      ${cool>0?`<br><span class="cool">휴식 중… ${fmtSec(cool)}</span>`:""}
    </div>
    <div style="margin-top:10px;text-align:right;">
      <button class="px small pink" id="btnRecommendTrain" ${cool>0||state.carrots<TRAIN_CARROT||!recStat?"disabled":""}>
        추천 훈련${recStat ? ` (${STAT_NAME[recStat]})` : ""}
      </button>
      <button class="px small" id="btnSnack" ${snackLeft>0||state.carrots<SNACK_CARROT?"disabled":""}>응원 간식 (🥕${SNACK_CARROT})</button>
      <button class="px small" id="btnRenameHorse">이름 바꾸기</button>
      <button class="px small" id="btnRelease" style="background:#cfc4ab;">떠나보내기 (+🪙40)</button>
    </div>`;
  $("#btnRecommendTrain").onclick = ()=>trainHorseStat(h, recommendedTrainStat(h));
  $("#btnSnack").onclick = ()=>{
    if(!spendCarrots(SNACK_CARROT)){ toast("당근이 부족해요!"); return; }
    h.treatUntil = now() + SNACK_TIME*1000;
    addBond(h, 5);
    save();
    toast(`${h.name}가 간식을 먹고 의욕이 올랐어요! ${bondText(h)}`);
    renderView();
  };
  $("#btnRenameHorse").onclick = ()=>openRenameHorse(h);
  el.querySelectorAll("[data-tr]").forEach(btn=>{
    btn.onclick = ()=>{
      trainHorseStat(h, btn.dataset.tr);
    };
  });
  $("#btnRelease").onclick = ()=>{
    if(state.horses.length <= 1){ toast("마지막 말은 떠나보낼 수 없어요!"); return; }
    showModal(`<h2>정말 떠나보낼까요?</h2>
      <p>${esc(withJosa(h.name, "이", "가"))} 넓은 초원으로 떠나요.<br>감사의 선물로 🪙40을 남겨줘요.</p>
      <div style="margin-top:12px;display:flex;gap:8px;justify-content:center;">
        <button class="px" id="mYes">보내주기</button>
        <button class="px pink" onclick="closeModal()">안 보낼래</button>
      </div>`);
    $("#mYes").onclick = ()=>{
      state.horses = state.horses.filter(x=>x.id!==h.id);
      state.coins += 40;
      forgetHorseSelection(h.id);
      save(); closeModal(); toast(`${withJosa(h.name, "이", "가")} 손을… 발굽을 흔들며 떠났어요.`);
      renderView();
    };
  };
}

/* =====================================================
   교배 탭
   ===================================================== */
let breedSelF = null, breedSelM = null;
function renderBreed(v){
  const br = state.breeding;
  if(br){
    const left = coolLeft(br.doneAt);
    const full = state.horses.length >= stableCap(state.buildings.stable);
    v.innerHTML = `
      <h3 class="sec">아기를 기다리는 중…</h3>
      <div class="pair-box">
        <div class="pslot filled"><div style="font-size:14px;">${esc(br.motherName)} <span class="gender-f">♀</span></div><div class="bd" style="font-size:12px;color:#8a7357;">${BREEDS[br.breedA].name}</div></div>
        <div class="heart">💗</div>
        <div class="pslot filled"><div style="font-size:14px;">${esc(br.fatherName)} <span class="gender-m">♂</span></div><div class="bd" style="font-size:12px;color:#8a7357;">${BREEDS[br.breedB].name}</div></div>
      </div>
      ${left>0
        ? `<div style="text-align:center;font-size:16px;">🥚 두근두근… <b>${fmtSec(left)}</b> 후에 태어나요</div>`
        : `<div style="text-align:center;">
             <div style="font-size:16px;margin-bottom:8px;">🐣 태어날 준비가 됐어요!</div>
             <button class="px pink" id="btnBirth" ${full?"disabled":""}>아기 맞이하기</button>
             ${full?`<div class="hint">마구간이 꽉 찼어요! 자리를 만들어 주세요.</div>`:""}
           </div>`}`;
    const btn = $("#btnBirth");
    if(btn) btn.onclick = doBirth;
    return;
  }

  if(breedSelF!==null && !findHorse(breedSelF)) breedSelF=null;
  if(breedSelM!==null && !findHorse(breedSelM)) breedSelM=null;
  const adults = state.horses.filter(isAdult);
  const fH = findHorse(breedSelF), mH = findHorse(breedSelM);
  const full = state.horses.length >= stableCap(state.buildings.stable);
  const ready = fH && mH && !full && state.coins >= BREED_COST;
  const comboBreed = fH && mH ? comboChild(fH.breed, mH.breed) : null;
  const comboHint = comboBreed ? ` · 🌟 전설 조합 발견! ${BREEDS[comboBreed].name} 확률 ${COMBO_CHANCE}%` : "";
  v.innerHTML = `
    <h3 class="sec">짝꿍 고르기</h3>
    <div class="pair-box">
      <div class="pslot ${fH?"filled":""}">${fH?`<div data-spr="${fH.id}"></div><div style="font-size:13px;">${esc(fH.name)} <span class="gender-f">♀</span></div>`:`<div style="padding-top:30px;color:#8a7357;">엄마 말 <span class="gender-f">♀</span></div>`}</div>
      <div class="heart">💗</div>
      <div class="pslot ${mH?"filled":""}">${mH?`<div data-spr="${mH.id}"></div><div style="font-size:13px;">${esc(mH.name)} <span class="gender-m">♂</span></div>`:`<div style="padding-top:30px;color:#8a7357;">아빠 말 <span class="gender-m">♂</span></div>`}</div>
    </div>
    <div style="text-align:center;margin-bottom:12px;">
      <button class="px pink" id="btnBreed" ${ready?"":"disabled"}>교배 시작 (🪙${BREED_COST} · ${fmtSec(breedTime(state.buildings.barn))})</button>
      <div class="hint">특이개체 확률 ${mutChance(state.buildings.barn)}% — 산실을 업그레이드하면 올라가요${comboHint}${full?" · ⚠️ 마구간이 꽉 찼어요":""}</div>
    </div>
    <h3 class="sec">성체 목록</h3>
    <div class="horse-grid" id="bGrid">
      ${adults.map(x=>{
        const sel = (x.gender==="f" && x.id===breedSelF) || (x.gender==="m" && x.id===breedSelM);
        return horseCardHTML(x, sel?"sel":"");
      }).join("") || `<div class="hint">교배할 수 있는 성체가 없어요. 아기를 먼저 키워보세요!</div>`}
    </div>`;
  mountSprites(v);
  v.querySelectorAll("#bGrid .hcard").forEach(c=>{
    c.onclick = ()=>{
      const h = findHorse(+c.dataset.hid);
      if(h.gender==="f") breedSelF = breedSelF===h.id ? null : h.id;
      else breedSelM = breedSelM===h.id ? null : h.id;
      renderView();
    };
  });
  const bb = $("#btnBreed");
  if(bb) bb.onclick = ()=>{
    if(!spendCoins(BREED_COST)){ toast("코인이 부족해요!"); return; }
    state.breeding = {
      motherId:fH.id, fatherId:mH.id,
      motherName:fH.name, fatherName:mH.name,
      breedA:fH.breed, breedB:mH.breed,
      statsA:{...fH.stats}, statsB:{...mH.stats},
      bondA:fH.bond || 0, bondB:mH.bond || 0,
      doneAt: now() + breedTime(state.buildings.barn)*1000,
    };
    breedSelF = breedSelM = null;
    save(); toast("두 마리가 사이좋게 지내기 시작했어요!");
    renderView();
  };
}

function doBirth(){
  const br = state.breeding;
  const comboBreed = comboChild(br.breedA, br.breedB);
  const legendary = comboBreed && Math.random()*100 < COMBO_CHANCE;
  const mut = !legendary && Math.random()*100 < mutChance(state.buildings.barn);
  const breed = legendary ? comboBreed : mut ? pick(SPECIAL_BREEDS) : pick([br.breedA, br.breedB]);
  const baby = newHorse(breed, "baby", [1,1]);
  baby.bond = Math.min(25, Math.round(((Number(br.bondA) || 0) + (Number(br.bondB) || 0)) / 10));
  STAT_KEYS.forEach(k=>{
    const avg = (br.statsA[k] + br.statsB[k]) / 2;
    let val = Math.round(avg + rnd(-2.5, 3.5)) + (legendary ? 5 : mut ? 3 : 0);
    baby.stats[k] = Math.max(1, Math.min(statCap(baby), val));
  });
  state.horses.push(baby);
  markDex(baby);
  state.breeding = null;
  save();
  const b = BREEDS[breed];
  showModal(`<h2>${legendary ? "🌠 전설의 아기 탄생!!" : mut ? "🌟 특이개체 탄생!!" : "🐣 아기 탄생!"}</h2>
    <div class="spr" data-spr="${baby.id}" style="display:flex;justify-content:center;margin:8px 0;"></div>
    <p><b>${esc(baby.name)}</b> (${b.name} ${baby.gender==="f"?"♀":"♂"})<br>
    ${legendary ? "부모의 특별한 조합이 별빛 같은 재능을 깨웠어요!<br>희귀한 전설 혈통이에요." : mut ? "무지개빛 기운을 품고 태어났어요!<br>스탯 상한이 높고 재능도 뛰어나요." : "건강한 아기 말이 태어났어요!"}<br>
    시작 ${bondText(baby)}<br>
    훈련 탭에서 돌봐주면 성체로 자라요.</p>
    <button class="px pink" id="btnGoCareBaby" style="margin-top:12px;">돌봐주러 가기</button>`);
  mountSprites($("#modal"), 4);
  $("#btnGoCareBaby").onclick = ()=>goTrainHorse(baby.id);
  renderHeader();
}

/* =====================================================
   경주 탭
   ===================================================== */
let raceRunning = false, raceStarting = false, raceSel = null, raceMode = null;

function cupDifficulty(cup, h){
  if(!h) return "";
  const my = statTotal(h);
  const npcAvg = ((cup.npc[0] + cup.npc[1]) / 2) * STAT_KEYS.length;
  const diff = my - npcAvg;
  const label = diff >= 10 ? "수월" : diff >= 0 ? "적당" : diff >= -10 ? "도전" : "위험";
  return ` · 난이도 ${label}`;
}

function renderRace(v){
  if(raceSel!==null && !findHorse(raceSel)) raceSel = null;
  const adults = state.horses.filter(isAdult);
  if(raceSel!==null && !adults.some(x=>x.id===raceSel)) raceSel = null;
  if(raceSel===null && adults.length){
    const ready = adults.find(x=>coolLeft(x.coolRace)<=0);
    raceSel = (ready || adults[0]).id;
  }
  const h = findHorse(raceSel);
  v.innerHTML = `
    <h3 class="sec">출전마 선택</h3>
    <div class="horse-grid" id="rGrid">
      ${adults.map(x=>{
        const cd = coolLeft(x.coolRace);
        return horseCardHTML(x, (x.id===raceSel?"sel ":"") + (cd>0?"dis":""));
      }).join("") || `<div class="hint">출전할 수 있는 성체가 없어요.</div>`}
    </div>
    <h3 class="sec" style="margin-top:14px;">대회 (PvE)</h3>
    ${CUPS.map(c=>`
      <div class="cup">
        <div class="info"><div class="ttl">${c.name}</div>
        <div class="desc">참가비 🪙${c.fee} · 우승 🪙${c.prize[0]} (2등 ${c.prize[1]} / 3등 ${c.prize[2]})${cupDifficulty(c,h)} · 🏅우승 ${state.cupWins?.[c.id] || 0}회</div></div>
        <button class="px green" data-cup="${c.id}" ${!h||coolLeft(h.coolRace)>0||state.coins<c.fee?"disabled":""}>출전!</button>
      </div>`).join("")}
    <h3 class="sec" style="margin-top:14px;">이웃 목장 대전 (PvP)</h3>
    <div class="cup">
      <div class="info"><div class="ttl">🏆 목장 대항전</div>
      <div class="desc">실제 이웃 목장주들의 대표 말과 대결 · 승리 시 🏆1 + 🪙100 (패배 🪙20)</div></div>
      <button class="px blue" id="btnPvp" ${!h||coolLeft(h.coolRace)>0||!me?"disabled":""}>${me?"도전!":"로그인 필요"}</button>
    </div>
    <div class="hint">경주는 운이 크게 작용해요. 스탯이 낮아도 그날 컨디션이 좋으면 이길 수 있답니다!</div>
    <div id="raceWrap">
      <h3 class="sec" style="margin-top:14px;" id="raceTitle"></h3>
      <canvas id="raceCanvas" width="800" height="330"></canvas>
      <div id="raceRank"></div>
      <div class="race-controls">
        <button class="px small pink" id="raceCheer" disabled>응원하기!</button>
        <span id="raceCheerMsg">경주가 시작되면 한 번 응원할 수 있어요.</span>
      </div>
    </div>`;
  mountSprites($("#rGrid"));
  v.querySelectorAll("#rGrid .hcard").forEach(c=>{
    c.onclick = ()=>{
      const x = findHorse(+c.dataset.hid);
      if(coolLeft(x.coolRace)>0){ toast(`${x.name}는 쉬는 중이에요 (${fmtSec(coolLeft(x.coolRace))})`); return; }
      raceSel = x.id; renderView();
    };
  });
  v.querySelectorAll("[data-cup]").forEach(btn=>{
    btn.onclick = ()=> startCupRace(CUPS[+btn.dataset.cup]);
  });
  const pv = $("#btnPvp");
  if(pv) pv.onclick = startPvpRace;
}

function makeNpc(name, breed, range){
  return { name, breed, stats:{ spd:ri(range[0],range[1]), sta:ri(range[0],range[1]), agi:ri(range[0],range[1]) } };
}

function startCupRace(cup){
  if(raceRunning || raceStarting){ toast("이미 경주 준비 중이에요!"); return; }
  const h = findHorse(raceSel);
  if(!h){ toast("출전할 말을 골라주세요!"); return; }
  if(!spendCoins(cup.fee)){ toast("코인이 부족해요!"); return; }
  raceStarting = true;
  const mood = moodOf(h);
  const entrants = [{ name:h.name, breed:h.breed, stats:h.stats, mine:true, treat:hasTreat(h), trait:h.trait, bond:h.bond || 0, moodRace:mood.race || 0 }];
  const used = new Set([h.name]);
  while(entrants.length < 6){
    const nm = pick(NAME_A)+pick(NAME_B);
    if(used.has(nm)) continue; used.add(nm);
    entrants.push(makeNpc(nm, pick(NORMAL_BREEDS), cup.npc));
  }
  runRace(entrants, cup.name, (ranks, meta)=>{
    const myRank = ranks.findIndex(e=>e.mine) + 1;
    let reward = 0;
    if(myRank<=3) reward = cup.prize[myRank-1];
    const firstCupWin = myRank === 1 && !(state.cupWins?.[cup.id] > 0);
    if(myRank === 1){
      state.cupWins ||= {};
      state.cupWins[cup.id] = (state.cupWins[cup.id] || 0) + 1;
    }
    state.coins += reward;
    h.races++; if(myRank===1) h.wins++;
    addBond(h, myRank===1 ? 6 : 4);
    h.coolRace = now() + RACE_COOL*1000;
    addQuestProgress("race");
    save();
    showRaceResult(ranks, myRank, reward
      ? `${myRank}등! 상금 🪙${reward}을 받았어요!${firstCupWin ? " 새 우승 도장도 찍었어요!" : ""}`
      : `${myRank}등… 다음엔 꼭 입상해요!`, raceBonusSummary(h, meta));
  });
  raceStarting = false;
}

// 다른 유저의 대표 말 데이터 → 출전마 (외부 데이터이므로 검증·클램프)
function sanitizeRivalHorse(p){
  try {
    const bh = p.best_horse;
    const nick = String(p.nickname || "이웃").slice(0, 12);
    const breed = BREEDS[bh.breed] ? bh.breed : pick(NORMAL_BREEDS);
    const st = {};
    STAT_KEYS.forEach(k=>{
      st[k] = Math.max(1, Math.min(40, Math.round(Number(bh.stats[k]) || 5)));
    });
    const trait = TRAITS[bh.trait] ? bh.trait : null;
    const bond = Math.max(0, Math.min(100, Math.round(Number(bh.bond) || 0)));
    return { name: nick, breed, stats: st, trait, bond, rival: true };
  } catch(e){ return null; }
}
async function startPvpRace(){
  if(raceRunning || raceStarting){ toast("이미 경주 준비 중이에요!"); return; }
  const h = findHorse(raceSel);
  if(!h) return;
  if(!me || !sb){ toast("로그인하면 실제 이웃 목장주와 대전할 수 있어요!"); return; }
  raceStarting = true;
  const mood = moodOf(h);
  const entrants = [{ name:h.name, breed:h.breed, stats:h.stats, mine:true, treat:hasTreat(h), trait:h.trait, bond:h.bond || 0, moodRace:mood.race || 0 }];
  let realCount = 0;
  try {
    const { data, error } = await sb.from("mmr_profiles")
      .select("nickname,best_horse").neq("id", me.id).not("best_horse","is",null)
      .order("updated_at", { ascending:false }).limit(30);
    warnSetup(error);
    if(error){ toast("이웃 목장 정보를 불러오지 못했어요"); return; }
    const pool = (data || []).sort(()=>Math.random()-0.5).slice(0, 5);
    for(const p of pool){
      const e = sanitizeRivalHorse(p);
      if(e){ entrants.push(e); realCount++; }
    }
  } catch(e){
    toast("이웃 목장 정보를 불러오지 못했어요");
    return;
  } finally {
    raceStarting = false;
  }
  if(realCount < 1){
    toast("아직 대전할 실제 이웃 목장주가 없어요");
    return;
  }
  const title = `🏆 목장 대항전 — 이웃 목장주 ${realCount}명 참전!`;
  runRace(entrants, title, (ranks, meta)=>{
    const myRank = ranks.findIndex(e=>e.mine) + 1;
    const win = myRank === 1;
    state.coins += win ? 100 : 20;
    if(win) state.trophies++;
    h.races++; if(win) h.wins++;
    addBond(h, win ? 7 : 4);
    h.coolRace = now() + RACE_COOL*1000;
    addQuestProgress("race");
    save();
    if(me) pushCloudNow();
    showRaceResult(ranks, myRank, win
      ? `이웃 목장들을 꺾었어요! 🏆+1, 🪙100 획득!`
      : `${myRank}등… 이웃들이 강했어요. 위로금 🪙20`, raceBonusSummary(h, meta));
  });
}

function raceBonusSummary(h, meta={}){
  const mood = moodOf(h);
  const parts = [
    `오늘 기분 ${mood.icon}${mood.name}${mood.race ? ` (${mood.race > 0 ? "+" : ""}${Math.round(mood.race*100)}%)` : ""}`,
    `${bondText(h)} (${Math.round(bondBonus(h)*100)}%)`,
    hasTreat(h) ? "응원 간식 +8%" : "간식 없음",
    meta.cheered ? "직접 응원 +스퍼트" : "직접 응원 없음",
    `${traitOf(h).name} 성격`,
  ];
  return parts.join(" · ");
}

function showRaceResult(ranks, myRank, msg, detail=""){
  showModal(`<h2>${myRank===1?"🥇 우승!":myRank===2?"🥈 2등!":myRank===3?"🥉 3등!":"🏁 완주!"}</h2>
    <p style="margin-bottom:10px;">${esc(msg)}</p>
    ${detail ? `<div class="race-detail">${esc(detail)}</div>` : ""}
    <div style="text-align:left;font-size:13px;background:var(--panel2);border:2px solid var(--line);border-radius:8px;padding:8px 12px;">
      ${ranks.map((e,i)=>`<div style="${e.mine?"color:#c2607e;font-weight:bold;":""}">${i+1}등 ${esc(e.name)}${e.mine?" (내 말)":""}</div>`).join("")}
    </div>
    <button class="px pink" onclick="closeModal();renderView()" style="margin-top:12px;">확인</button>`);
}

const RACE_DIST = 1000;
function runRace(entrants, title, onDone){
  raceRunning = true;
  $("#raceWrap").style.display = "block";
  $("#raceTitle").textContent = title;
  const cv = $("#raceCanvas"), ctx = cv.getContext("2d");
  const W = cv.width, H = cv.height;
  const laneH = (H-40) / entrants.length;
  cv.scrollIntoView({behavior:"smooth", block:"center"});

  // 경주 파라미터: 그날의 폼(운)이 스탯보다 크게 작용
  const runners = entrants.map((e,i)=>({
    ...e, lane:i, prog:0, done:false, finT:0,
    form: rnd(0.72, 1.30),                       // 오늘의 컨디션 (지배적 운)
    statF: 1 + statTotal({stats:e.stats})*0.006 + (TRAITS[e.trait]?.race || 0) + (e.moodRace || 0) + (e.treat ? 0.08 : 0) + Math.min(0.05, (Number(e.bond) || 0) / 2000), // 스탯 보정 + 성격/기분/간식/친밀도
    spurt: 0, frame:0, ft:0,
  }));
  const cheerBtn = $("#raceCheer");
  const cheerMsg = $("#raceCheerMsg");
  let cheerUsed = false, cheerFlash = 0;
  if(cheerBtn){
    cheerBtn.disabled = true;
    cheerBtn.textContent = "출발 대기...";
    if(cheerMsg) cheerMsg.textContent = "출발하면 내 말에게 한 번 힘을 실어줄 수 있어요.";
    cheerBtn.onclick = ()=>{
      if(cheerUsed || countdown > 0) return;
      const mine = runners.find(r=>r.mine && !r.done);
      if(!mine) return;
      cheerUsed = true;
      mine.spurt = Math.max(mine.spurt, 1500);
      mine.prog = Math.min(RACE_DIST - 1, mine.prog + 35);
      cheerFlash = 900;
      cheerBtn.disabled = true;
      cheerBtn.textContent = "응원 완료!";
      if(cheerMsg) cheerMsg.textContent = `${withJosa(mine.name, "이", "가")} 힘을 냈어요!`;
    };
  }
  let elapsed = 0, finished = 0, countdown = 2000;
  let last = performance.now(), animId = null;

  function step(t){
    const dt = Math.min(50, t-last); last = t;
    if(countdown > 0){ countdown -= dt; }
    else {
      elapsed += dt;
      runners.forEach(r=>{
        if(r.done) return;
        // 스퍼트: 순발력 비례 (초당 확률로 환산)
        if(r.spurt > 0) r.spurt -= dt;
        else if(Math.random() < (0.18 + r.stats.agi*0.012)*dt/1000) r.spurt = 700;
        let sp = 1.45 * r.statF * r.form * (0.9 + Math.random()*0.25);
        if(r.spurt > 0) sp *= 1.4;
        if(r.prog > RACE_DIST*0.68) sp *= Math.min(1.05, 0.83 + r.stats.sta*0.009 + (TRAITS[r.trait]?.stamina || 0)); // 지구력: 막판 유지력
        r.prog += sp * dt/16;
        r.ft += dt;
        if(r.ft > 110){ r.frame ^= 1; r.ft = 0; }
        if(r.prog >= RACE_DIST){ r.prog = RACE_DIST; r.done = true; r.finT = elapsed + (finished++)*0.001; }
      });
    }
    if(cheerBtn && !cheerUsed){
      const canCheer = countdown <= 0 && runners.some(r=>r.mine && !r.done);
      cheerBtn.disabled = !canCheer;
      cheerBtn.textContent = canCheer ? "응원하기!" : "출발 대기...";
    }
    if(cheerFlash > 0) cheerFlash -= dt;
    draw();
    const live = [...runners].sort((a,b)=> b.prog - a.prog || a.finT - b.finT);
    $("#raceRank").innerHTML = "현재 순위: " + live.map((r,i)=>`${i+1}.${r.mine?`<b style="color:#c2607e">${esc(r.name)}</b>`:esc(r.name)}`).join(" · ");

    if(runners.every(r=>r.done)){
      cancelAnimationFrame(animId);
      const ranks = [...runners].sort((a,b)=>a.finT-b.finT);
      if(cheerBtn){
        cheerBtn.disabled = true;
        cheerBtn.onclick = null;
        cheerBtn.textContent = "경주 종료";
      }
      setTimeout(()=>{ raceRunning = false; onDone(ranks, { cheered: cheerUsed }); }, 600);
      return;
    }
    animId = requestAnimationFrame(step);
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle="#9fd18f"; ctx.fillRect(0,0,W,H);
    // 레인
    for(let i=0;i<entrants.length;i++){
      ctx.fillStyle = i%2 ? "#a9d899" : "#9fd18f";
      ctx.fillRect(0, 20+i*laneH, W, laneH);
      ctx.fillStyle="rgba(255,255,255,.5)";
      ctx.fillRect(0, 20+i*laneH, W, 2);
    }
    // 결승선 (체크무늬)
    const fx = W-46;
    for(let y=0; y<H; y+=10){
      ctx.fillStyle = (y/10)%2 ? "#fff" : "#4a3826";
      ctx.fillRect(fx, y, 8, 10);
    }
    runners.forEach(r=>{
      const x = 10 + (r.prog/RACE_DIST) * (fx-10-SPR_W*3);
      const y = 20 + r.lane*laneH + laneH - 8;
      drawHorse(ctx, r, x, y-SPR_H*3, 3, r.done?0:r.frame, false);
      ctx.fillStyle = r.mine ? "#c2607e" : "#4a3826";
      ctx.font="11px DungGeunMo,monospace"; ctx.textAlign="left";
      ctx.fillText((r.mine?"▶":"")+(r.treat?"🥕":"")+r.name, x+2, y-SPR_H*3+2);
      if(r.spurt>0 && !r.done){
        ctx.fillStyle="#ffec8a";
        ctx.fillRect(x-8, y-24, 4,4); ctx.fillRect(x-14, y-16, 3,3);
      }
    });
    if(countdown > 0){
      ctx.fillStyle="rgba(60,40,20,.45)"; ctx.fillRect(0,0,W,H);
      ctx.fillStyle="#fff"; ctx.font="42px DungGeunMo,monospace"; ctx.textAlign="center";
      ctx.fillText(countdown>1300?"제자리에…":countdown>600?"준비…":"땅!", W/2, H/2);
    }
    if(cheerFlash > 0){
      ctx.fillStyle="rgba(255,244,207,.9)";
      ctx.fillRect(W/2-66, 18, 132, 28);
      ctx.fillStyle="#c2607e"; ctx.font="18px DungGeunMo,monospace"; ctx.textAlign="center";
      ctx.fillText("응원 성공!", W/2, 38);
    }
  }
  animId = requestAnimationFrame(step);
}

/* ---------- 주기 갱신 (타이머 UI) ---------- */
setInterval(()=>{
  tickCarrots();
  tickCoins();
  renderHeader();
  if(raceRunning) return;
  // 카운트다운이 있는 화면은 1초마다 다시 그림
  if(curTab==="ranch" && $("#btnWalk")){
    const left = coolLeft(state.walkReadyAt);
    $("#walkDesc").textContent = left>0 ? `다음 산책까지 ${fmtSec(left)}` : "작은 사건과 보상을 발견할 수 있어요.";
    $("#btnWalk").disabled = left>0;
    const choreLeft = coolLeft(state.choreReadyAt);
    if($("#btnChore")){
      $("#choreDesc").textContent = choreLeft>0 ? `다음 일감까지 ${fmtSec(choreLeft)}` : "코인이나 당근이 부족해도 할 수 있는 작은 일감이에요.";
      $("#btnChore").disabled = choreLeft>0;
    }
  }
  else if(curTab==="breed" && state.breeding) renderView();
  else if(curTab==="train"){
    const h = findHorse(trainSel);
    if(h && (coolLeft(h.coolTrain)>0 || treatLeft(h)>0 || $("#tDetail .cool"))) renderView();
  }
  else if(curTab==="race"){
    const anyCool = state.horses.some(x=>coolLeft(x.coolRace)>0 && coolLeft(x.coolRace)<RACE_COOL);
    if((anyCool || $("#rGrid .dis")) && !$("#raceWrap")?.style.display.includes("block")) renderView();
  }
}, 1000);

/* =====================================================
   온라인: 로그인 · 클라우드 저장 · 채팅 (Supabase)
   ===================================================== */
const SB_URL = "https://lfvoyvnwvziqedurbhex.supabase.co";
const SB_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmdm95dm53dnppcWVkdXJiaGV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMjY3ODcsImV4cCI6MjA5ODgwMjc4N30.jAik4_PFr8Mts3QnV8ubk7nWLDBVaT_aIlG0QDN3pDE";
let sb = null, me = null, myNickname = null;
let cloudTimer = null, chatChannel = null, setupWarned = false;

function warnSetup(error){
  if(error && (error.code === "PGRST205" || error.code === "42P01") && !setupWarned){
    setupWarned = true;
    toast("⚠️ Supabase에 테이블이 없어요 — supabase_setup.sql을 SQL Editor에서 실행해주세요");
  }
  if(error && error.code === "42501" && !setupWarned){
    setupWarned = true;
    toast("⚠️ Supabase 테이블 권한이 부족해요 — supabase_setup.sql의 GRANT 섹션을 실행해주세요");
  }
}

/* --- 클라우드 저장 --- */
function bestHorseSnapshot(){
  const adults = state.horses.filter(isAdult);
  if(!adults.length) return null;
  const b = adults.reduce((a,c)=> statTotal(c) > statTotal(a) ? c : a);
  return { name: b.name, breed: b.breed, trait: b.trait, bond: b.bond || 0, stats: { ...b.stats } };
}
function scheduleCloudSave(delay=3000, keepExisting=false){
  if(!me || !sb) return;
  if(keepExisting && cloudTimer) return;
  clearTimeout(cloudTimer);
  cloudTimer = setTimeout(()=>{ cloudTimer = null; pushCloudNow(); }, delay);
}
async function pushCloudNow(){
  if(!me || !sb) return;
  clearTimeout(cloudTimer); cloudTimer = null;
  const ts = new Date().toISOString();
  const { error: e1 } = await sb.from("mmr_saves")
    .upsert({ user_id: me.id, data: state, updated_at: ts });
  warnSetup(e1);
  const { error: e2 } = await sb.from("mmr_profiles")
    .upsert({ id: me.id, nickname: myNickname || "목장주",
              trophies: state.trophies, best_horse: bestHorseSnapshot(), updated_at: ts });
  warnSetup(e2);
}
window.addEventListener("beforeunload", ()=>{ if(cloudTimer) pushCloudNow(); });

/* --- 인증 --- */
function authErrKo(error){
  const msg = String(error?.message || error || "");
  const code = String(error?.code || "");
  if(code === "invalid_credentials" || msg.includes("Invalid login credentials")) return "이메일 또는 비밀번호가 맞지 않아요";
  if(code === "email_not_confirmed" || msg.includes("Email not confirmed")) return "가입 확인 메일의 링크를 먼저 눌러주세요";
  if(code === "email_exists" || msg.includes("already registered")) return "이미 가입된 이메일이에요";
  if(code === "weak_password" || msg.includes("at least 6 characters")) return "비밀번호는 6자 이상이어야 해요";
  if(code === "validation_failed" || msg.includes("valid email")) return "올바른 이메일 주소를 입력해주세요";
  if(code === "over_email_send_rate_limit" || msg.includes("email rate limit")) {
    return "확인 메일 발송 한도에 걸렸어요. 기본 메일은 시간당 2통이라 1시간 뒤 다시 시도해주세요";
  }
  if(code === "over_request_rate_limit" || msg.includes("rate limit") || msg.includes("Too many")) {
    const wait = msg.match(/after (\d+) seconds?/i);
    return wait
      ? `요청이 잠시 제한됐어요 — ${wait[1]}초 뒤 다시 시도해주세요`
      : "로그인 요청이 잠시 제한됐어요 — 잠깐 뒤 다시 시도해주세요";
  }
  return "실패했어요: " + msg;
}
let authUnavailableMsg = "";
function showAuthOverlay(){
  $("#authBg").style.display = "flex";
  $("#authMsg").textContent = authUnavailableMsg || (window.supabase ? "" : "온라인 로그인을 불러오지 못했어요. 게스트로 플레이할 수 있어요.");
}
function hideAuthOverlay(){ $("#authBg").style.display = "none"; }

let authBusy = false;
function setAuthBusy(busy){
  authBusy = busy;
  ["btnLogin", "btnSignup"].forEach(id=>{
    const btn = $("#" + id);
    if(btn) btn.disabled = busy;
  });
}
function enterGuestMode(){
  localStorage.setItem("mmr_guest", "1");
  hideAuthOverlay();
  toast("게스트 모드 — 저장은 이 기기에만 남아요");
}
function setAuthUnavailable(msg){
  authUnavailableMsg = msg;
  ["btnLogin", "btnSignup"].forEach(id=>{
    const btn = $("#" + id);
    if(btn) btn.disabled = true;
  });
  const msgEl = $("#authMsg");
  if(msgEl) msgEl.textContent = msg;
  if(localStorage.getItem("mmr_guest") !== "1") showAuthOverlay();
}

function authRedirectUrl(){
  return `${location.origin}${location.pathname}`;
}

function renderHeaderAccount(){
  const el = $("#rUser");
  if(me){ el.textContent = "👤 " + (myNickname || "목장주"); el.title = "클릭해서 로그아웃"; }
  else { el.textContent = "🔑 로그인"; el.title = "로그인하면 어디서든 이어서 할 수 있어요"; }
}
$("#rUser").onclick = ()=>{
  if(!me){ showAuthOverlay(); return; }
  showModal(`<h2>로그아웃할까요?</h2>
    <p class="hint">진행 상황은 클라우드에 저장되어 있어요.<br>다시 로그인하면 이어서 할 수 있어요.</p>
    <div style="margin-top:12px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
      <button class="px" id="mBackup">저장 백업</button>
      <button class="px" id="mResetAccount" style="background:#cfc4ab;">데이터 초기화</button>
      <button class="px" id="mLogout">로그아웃</button>
      <button class="px pink" onclick="closeModal()">취소</button>
    </div>`);
  $("#mBackup").onclick = openBackupModal;
  $("#mResetAccount").onclick = openResetAccountModal;
  $("#mLogout").onclick = async ()=>{
    await pushCloudNow();
    await sb.auth.signOut();
    localStorage.removeItem("mmr_guest");
    location.reload();
  };
};

function openResetAccountModal(){
  showModal(`<h2>계정 데이터 초기화</h2>
    <p class="hint">로그인 계정과 목장주 이름은 유지하고, 말·코인·건물·의뢰·업적·클라우드 저장을 새 목장 상태로 되돌려요.<br>되돌릴 수 없으니 필요하면 먼저 저장 백업을 해주세요.</p>
    <div id="resetMsg" style="font-size:12px;color:#b06a6a;min-height:14px;margin-top:8px;"></div>
    <div style="margin-top:12px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
      <button class="px" id="mResetYes">초기화</button>
      <button class="px pink" onclick="closeModal()">취소</button>
    </div>`);
  $("#mResetYes").onclick = resetAccountData;
}

async function resetAccountData(){
  if(!me || !sb){ toast("로그인 후 사용할 수 있어요"); return; }
  const msg = $("#resetMsg");
  const btn = $("#mResetYes");
  if(btn) btn.disabled = true;
  if(msg) msg.textContent = "초기화 중…";
  const nick = myNickname || "목장주";
  defaultState();
  normalizeState();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  clearTimeout(cloudTimer); cloudTimer = null;
  const ts = new Date().toISOString();
  try {
    const { error: e1 } = await sb.from("mmr_saves")
      .upsert({ user_id: me.id, data: state, updated_at: ts });
    warnSetup(e1);
    const { error: e2 } = await sb.from("mmr_profiles")
      .upsert({ id: me.id, nickname: nick, trophies: state.trophies, best_horse: bestHorseSnapshot(), updated_at: ts });
    warnSetup(e2);
    if(e1 || e2) throw e1 || e2;
    closeModal();
    renderHeaderAccount();
    renderView();
    toast("계정 데이터를 새 목장으로 초기화했어요");
  } catch(e){
    console.warn("Account reset failed", e);
    if(msg) msg.textContent = "이 기기 저장은 초기화됐지만 클라우드 저장에 실패했어요. 잠시 후 다시 시도해주세요.";
    if(btn) btn.disabled = false;
  }
}

function askNickname(){
  return new Promise(resolve=>{
    const ask = (msg="")=>{
      showModal(`<h2>목장주 이름 정하기</h2>
        <p class="hint">채팅과 목장 대항전에서 보여질 이름이에요 (1~12자)</p>
        <input class="in" id="nickIn" maxlength="12" style="width:100%;margin:8px 0;">
        <div style="font-size:12px;color:#b06a6a;min-height:14px;">${msg}</div>
        <button class="px pink" id="nickOk">결정!</button>`);
      $("#nickIn").focus();
      $("#nickOk").onclick = async ()=>{
        const v = $("#nickIn").value.trim();
        if(!v || v.length > 12){ ask("1~12자로 입력해주세요"); return; }
        const { error } = await sb.from("mmr_profiles")
          .upsert({ id: me.id, nickname: v, trophies: state.trophies });
        warnSetup(error);
        if(error){ ask("저장에 실패했어요 — 다시 시도해주세요"); return; }
        myNickname = v; closeModal(); resolve();
      };
    };
    ask();
  });
}

function cloneSaveData(src){
  return JSON.parse(JSON.stringify(src));
}

function applySaveData(nextState){
  state = nextState;
  normalizeState();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function askGuestSaveChoice(hasCloudSave){
  return new Promise(resolve=>{
    showModal(`<h2>게스트 목장을 어떻게 할까요?</h2>
      <p class="hint">지금까지 게스트로 키운 목장을 이 계정에 저장하거나, 새 목장으로 시작할 수 있어요.</p>
      <div style="margin-top:12px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
        <button class="px pink" id="guestKeep">게스트 목장 이어가기</button>
        ${hasCloudSave ? `<button class="px" id="guestCloud">기존 클라우드 불러오기</button>` : ""}
        <button class="px" id="guestNew" style="background:#cfc4ab;">새 목장 시작</button>
      </div>`);
    $("#guestKeep").onclick = ()=>{ closeModal(); resolve("guest"); };
    const cloudBtn = $("#guestCloud");
    if(cloudBtn) cloudBtn.onclick = ()=>{ closeModal(); resolve("cloud"); };
    $("#guestNew").onclick = ()=>{ closeModal(); resolve("new"); };
  });
}

async function onLogin(user){
  const wasGuest = localStorage.getItem("mmr_guest") === "1";
  const guestState = wasGuest ? cloneSaveData(state) : null;
  me = user;
  hideAuthOverlay();
  let pe = null;
  let se = null;
  let cloudState = null;
  try {
    const { data: prof, error } = await sb.from("mmr_profiles")
      .select("nickname").eq("id", me.id).maybeSingle();
    pe = error;
    warnSetup(pe);
    if(prof) myNickname = prof.nickname;
    const { data: sv, error: saveError } = await sb.from("mmr_saves")
      .select("data").eq("user_id", me.id).maybeSingle();
    se = saveError;
    warnSetup(se);
    if(sv && sv.data && sv.data.horses){
      cloudState = sv.data;
    }
  } catch(e){
    console.warn("Cloud load failed", e);
    toast("클라우드 저장을 불러오지 못해 이 기기의 저장으로 시작해요");
    pe = e;
  }
  if(!myNickname && !pe) await askNickname();
  if(wasGuest){
    const choice = await askGuestSaveChoice(!!cloudState);
    if(choice === "guest" && guestState){
      applySaveData(guestState);
      await pushCloudNow();
      toast("게스트 목장을 계정에 저장했어요!");
    } else if(choice === "new"){
      defaultState();
      normalizeState();
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      await pushCloudNow();
      toast("새 목장으로 시작했어요!");
    } else if(choice === "cloud" && cloudState){
      applySaveData(cloudState);
      toast("☁️ 클라우드 저장을 불러왔어요!");
    }
  } else if(cloudState){
    applySaveData(cloudState);
    toast("☁️ 클라우드 저장을 불러왔어요!");
  } else if(!se){
    await pushCloudNow();
  }
  localStorage.removeItem("mmr_guest");
  renderHeaderAccount();
  renderView();
  initChat();
}

async function initAuth(){
  renderHeaderAccount();
  const guestBtn = $("#btnGuest");
  if(guestBtn) guestBtn.onclick = enterGuestMode;
  if(!window.supabase){
    setAuthUnavailable("온라인 로그인을 불러오지 못했어요. 게스트로 플레이할 수 있어요.");
    toast("온라인 기능을 불러오지 못했어요 — 오프라인 모드로 시작해요");
    return;
  }
  try {
    sb = window.supabase.createClient(SB_URL, SB_ANON);
    const { data: { session } } = await sb.auth.getSession();
    if(session){ await onLogin(session.user); return; }
    if(localStorage.getItem("mmr_guest") !== "1") showAuthOverlay();
  } catch(e){
    console.warn("Supabase session check failed", e);
    setAuthUnavailable("온라인 로그인 확인에 실패했어요. 잠시 후 다시 열어보거나 게스트로 플레이해주세요.");
    return;
  }

  $("#btnLogin").onclick = async ()=>{
    if(authBusy) return;
    const email = $("#authEmail").value.trim(), pw = $("#authPw").value;
    if(!email || !pw){ $("#authMsg").textContent = "이메일과 비밀번호를 입력해주세요"; return; }
    setAuthBusy(true);
    $("#authMsg").textContent = "로그인 중…";
    try {
      const { data, error } = await sb.auth.signInWithPassword({ email, password: pw });
      if(error){
        console.warn("Supabase login error", { code:error.code, status:error.status, message:error.message });
        $("#authMsg").textContent = authErrKo(error);
        return;
      }
      await onLogin(data.user);
    } catch(e){
      console.warn("Supabase login exception", e);
      $("#authMsg").textContent = "로그인 중 연결 문제가 생겼어요. 잠시 후 다시 시도하거나 게스트로 플레이해주세요.";
    } finally {
      setAuthBusy(false);
    }
  };
  $("#btnSignup").onclick = async ()=>{
    if(authBusy) return;
    const email = $("#authEmail").value.trim(), pw = $("#authPw").value;
    if(!email || !pw){ $("#authMsg").textContent = "이메일과 비밀번호를 입력해주세요"; return; }
    setAuthBusy(true);
    $("#authMsg").textContent = "가입 중…";
    try {
      const { data, error } = await sb.auth.signUp({
        email,
        password: pw,
        options: { emailRedirectTo: authRedirectUrl() },
      });
      if(error){
        console.warn("Supabase signup error", { code:error.code, status:error.status, message:error.message });
        $("#authMsg").textContent = authErrKo(error);
        return;
      }
      if(data.session){ await onLogin(data.user); return; }
      $("#authMsg").textContent = "📧 확인 메일을 보냈어요! 링크를 누른 뒤 이 화면으로 돌아와 로그인해주세요";
    } catch(e){
      console.warn("Supabase signup exception", e);
      $("#authMsg").textContent = "가입 중 연결 문제가 생겼어요. 잠시 후 다시 시도하거나 게스트로 플레이해주세요.";
    } finally {
      setAuthBusy(false);
    }
  };
}

/* --- 채팅 --- */
function appendChatMsg(m, scroll=true){
  const box = $("#chatMsgs");
  const div = document.createElement("div");
  div.className = "cmsg";
  const cn = document.createElement("span");
  cn.className = "cn";
  cn.textContent = m.nickname; // textContent: 외부 데이터 XSS 방지
  const ct = document.createElement("span");
  ct.className = "ct";
  const d = new Date(m.created_at);
  ct.textContent = `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  const body = document.createElement("div");
  body.textContent = m.content;
  div.appendChild(cn); div.appendChild(ct); div.appendChild(body);
  box.appendChild(div);
  if(scroll) box.scrollTop = box.scrollHeight;
}
async function initChat(){
  if(!me || !sb) return;
  $("#chatFab").style.display = "block";
  const { data, error } = await sb.from("mmr_messages")
    .select("nickname,content,created_at").order("id", { ascending:false }).limit(40);
  warnSetup(error);
  $("#chatMsgs").innerHTML = "";
  (data || []).reverse().forEach(m=>appendChatMsg(m, false));
  $("#chatMsgs").scrollTop = $("#chatMsgs").scrollHeight;
  if(chatChannel) sb.removeChannel(chatChannel);
  chatChannel = sb.channel("plaza")
    .on("postgres_changes", { event:"INSERT", schema:"public", table:"mmr_messages" },
        p=>appendChatMsg(p.new))
    .subscribe();
}
async function sendChat(){
  const inp = $("#chatInput");
  const content = inp.value.trim();
  if(!content || !me) return;
  inp.value = "";
  const { error } = await sb.from("mmr_messages")
    .insert({ user_id: me.id, nickname: myNickname || "목장주", content });
  warnSetup(error);
  if(error) toast("전송에 실패했어요");
}
$("#chatFab").onclick = ()=>{
  const p = $("#chatPanel");
  p.style.display = p.style.display === "flex" ? "none" : "flex";
};
$("#chatClose").onclick = ()=>{ $("#chatPanel").style.display = "none"; };
$("#chatSend").onclick = sendChat;
$("#chatInput").addEventListener("keydown", e=>{ if(e.key === "Enter" && !e.isComposing) sendChat(); });

/* ---------- 시작 ---------- */
load();
const offlineCarrots = tickCarrots();
const offlineCoins = tickCoins();
renderView();
initAuth();
if(offlineCarrots || offlineCoins){
  setTimeout(()=>toast(`돌아온 사이 자동 생산이 쌓였어요! ${questRewardText({ coins:offlineCoins, carrots:offlineCarrots })}`), 500);
}
