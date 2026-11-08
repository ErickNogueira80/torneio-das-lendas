/* Torneio das Lendas · motor do jogo de plataforma com RPG.
   Os dados ficam em dados/herois.js (heróis e poderes) e dados/fases.js (fases e inimigos).
   As imagens ficam em sprites/ (geradas por ferramentas/preparar_sprites.py). Quando falta uma
   imagem, o motor usa o desenho de reserva feito no canvas.
   Parâmetros de teste na URL:
     ?heroi=<chave>  escolhe o herói (ex.: fogo)      ?fase=<chave>  escolhe a fase
     ?boss           começa perto do chefe             ?demo          joga sozinho
     &ff=600         avança 600 quadros                &touch         mostra os botões de toque
     ?semimagens     ignora as imagens (só desenho de reserva) */
'use strict';

// ---------- tela e escala ----------
const W = 960, H = 540;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
let dpr = 1, scale = 1, ox = 0, oy = 0, portrait = false;
function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = innerWidth, h = innerHeight;
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  cv.style.width = w + 'px'; cv.style.height = h + 'px';
  scale = Math.min(w / W, h / H);
  ox = (w - W * scale) / 2 * dpr; oy = (h - H * scale) / 2 * dpr;
  portrait = h > w * 1.05;
}
addEventListener('resize', resize); resize();

const params = new URLSearchParams(location.search);
const DEMO = params.has('demo');
const START_BOSS = params.has('boss') || DEMO;

// ---------- dados ----------
const HEROI_ID = HEROIS[params.get('heroi')] ? params.get('heroi') : 'humano';
const HEROI = HEROIS[HEROI_ID];
const PODER_ID = HEROI.poder, PODER = PODERES[PODER_ID];
const FASE = FASES[params.get('fase')] || FASES.boitata;
const GROUND = 460;
const SOLIDS = FASE.solidos, PLATS = FASE.plataformas, CHECKS = FASE.controles, ARENA = FASE.arena;
const HAZARDS = FASE.perigos.map(p => ({ x: p.x, y: GROUND - 14, w: p.w, h: 14 }));
const LEVEL_END = FASE.fim;
const CHEFE_CFG = FASE.chefe;

// ---------- utilidades ----------
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (a, b) => a + Math.random() * (b - a);
function mulberry(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
function circleRect(cx, cy, r, b) {
  const nx = clamp(cx, b.x, b.x + b.w), ny = clamp(cy, b.y, b.y + b.h);
  return (cx - nx) ** 2 + (cy - ny) ** 2 < r * r;
}

// ---------- imagens (sprites) ----------
// sprites.json é gerado pela ferramenta. Tipos: 'personagem' (quadros por animação),
// 'partes' (pedaços nomeados, ex.: cabeça, gomo e rabo do Boitatá) e 'fundo' (camadas).
const SPR = {};
async function loadSprites() {
  if (params.has('semimagens') || typeof fetch !== 'function') return;
  try {
    const r = await fetch('sprites/sprites.json', { cache: 'no-cache' });
    if (!r.ok) return;
    const data = await r.json();
    for (const [k, v] of Object.entries(data)) {
      const s = { ...v };
      if (v.img) { s.image = new Image(); s.image.src = 'sprites/' + v.img; }
      if (v.camadas) { s.imgs = {}; for (const [c, p] of Object.entries(v.camadas)) { const im = new Image(); im.src = 'sprites/' + p; s.imgs[c] = im; } }
      SPR[k] = s;
    }
  } catch (_) { /* sem imagens: usa os desenhos de reserva */ }
}
const ready = im => im && im.complete && im.naturalWidth > 0;
function sprite(key) { const s = SPR[key]; return s && s.image && ready(s.image) ? s : null; }
function layer(key, name) { const s = SPR[key]; return s && s.imgs && ready(s.imgs[name]) ? s.imgs[name] : null; }
loadSprites();

// desenha um quadro de personagem com os pés em (x, y); face = 1 direita, -1 esquerda
const ANIM_RESERVA = { correr: ['parado'], cair: ['pular', 'parado'], pular: ['parado'], espada: ['parado'], poder: ['espada', 'parado'], dano: ['parado'], andar: ['parado'], voar: ['parado'] };
const temAnim = (s, anim) => !!(s.quadros && s.quadros[anim] && s.quadros[anim].length);
function drawFrame(s, anim, t, x, y, face, sx = 1, sy = 1, rot = 0) {
  let fr = s.quadros && s.quadros[anim];
  if (!fr) for (const alt of (ANIM_RESERVA[anim] || [])) if (s.quadros[alt]) { fr = s.quadros[alt]; break; }
  if (!fr) fr = Object.values(s.quadros || {})[0];
  if (!fr || !fr.length) return false;
  const [qx, qy, qw, qh, ax, ay] = fr[Math.floor(Math.max(0, t)) % fr.length];
  const k = s.escala;
  ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot * face); ctx.scale(face * k * sx, k * sy);
  ctx.drawImage(s.image, qx, qy, qw, qh, -ax, -ay, qw, qh);
  ctx.restore();
  return true;
}

// ---------- entrada (teclado e toque) ----------
const keys = {};
let jumpPressed = false, swordPressed = false, powerPressed = false;
const JUMP_KEYS = ['ArrowUp', 'KeyW', 'Space'], SWORD_KEYS = ['KeyJ', 'KeyZ'], POWER_KEYS = ['KeyK', 'KeyX'];
addEventListener('keydown', e => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
  if (e.repeat) return;
  keys[e.code] = true;
  if (state !== 'play') { menuKey(e.code); return; }
  if (JUMP_KEYS.includes(e.code)) jumpPressed = true;
  if (SWORD_KEYS.includes(e.code)) swordPressed = true;
  if (POWER_KEYS.includes(e.code)) powerPressed = true;
});
addEventListener('keyup', e => { keys[e.code] = false; });

const BTN = [
  { id: 'left', x: 82, y: 462, r: 50, label: '◀' },
  { id: 'right', x: 204, y: 462, r: 50, label: '▶' },
  { id: 'sword', x: 752, y: 474, r: 42, label: 'espada' },
  { id: 'power', x: 838, y: 372, r: 42, label: PODER.nome },
  { id: 'jump', x: 872, y: 472, r: 52, label: 'pular' },
];
const pointers = new Map();
let showTouch = (typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches) || params.has('touch');
function toVirtual(e) {
  const r = cv.getBoundingClientRect();
  return { x: ((e.clientX - r.left) * dpr - ox) / (scale * dpr), y: ((e.clientY - r.top) * dpr - oy) / (scale * dpr) };
}
function btnAt(p) { for (const b of BTN) if (Math.hypot(p.x - b.x, p.y - b.y) < b.r * 1.3) return b.id; return null; }
function press(id) {
  if (id === 'jump') jumpPressed = true;
  if (id === 'sword') swordPressed = true;
  if (id === 'power') powerPressed = true;
}
const held = id => { for (const v of pointers.values()) if (v === id) return true; return false; };
cv.addEventListener('pointerdown', e => {
  e.preventDefault();
  if (e.pointerType === 'touch') showTouch = true;
  const p = toVirtual(e);
  if (state !== 'play' || portrait) { menuTap(p); return; }
  const id = showTouch ? btnAt(p) : null;
  pointers.set(e.pointerId, id);
  if (id) press(id);
  try { cv.setPointerCapture(e.pointerId); } catch (_) { }
});
cv.addEventListener('pointermove', e => {
  if (!pointers.has(e.pointerId) || state !== 'play') return;
  const old = pointers.get(e.pointerId), id = btnAt(toVirtual(e));
  if ((old === 'left' || old === 'right') && (id === 'left' || id === 'right') && id !== old) pointers.set(e.pointerId, id);
});
const release = e => pointers.delete(e.pointerId);
cv.addEventListener('pointerup', release);
cv.addEventListener('pointercancel', release);
cv.addEventListener('contextmenu', e => e.preventDefault());

function goFullscreen() {
  const el = document.documentElement;
  if (document.fullscreenElement || !el.requestFullscreen) return;
  el.requestFullscreen({ navigationUI: 'hide' })
    .then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => { }))
    .catch(() => { });
}

// cenário desenhado (gerado uma vez, sempre igual)
const rand = mulberry(7);
const FAR = [], MID = [], ASH = [];
for (let i = 0; i < 70; i++) FAR.push({ x: i * 95 + rand() * 50, h: 120 + rand() * 140, w: 6 + rand() * 6, b: [rand(), rand(), rand()] });
for (let i = 0; i < 60; i++) MID.push({ x: i * 150 + rand() * 80, h: 200 + rand() * 160, w: 14 + rand() * 10, glow: rand() < .35, b: [rand(), rand(), rand(), rand()] });
for (let i = 0; i < 60; i++) ASH.push({ x: rand() * W, y: rand() * H, s: 1 + rand() * 2.5, v: 10 + rand() * 30, ph: rand() * 6 });

// ---------- jogador ----------
const GRAV = 1800, JUMP_V = 700;
const player = {
  x: 80, y: GROUND - 44, w: 28, h: 44, vx: 0, vy: 0, face: 1, onGround: false,
  inv: 0, poison: 0, swordT: 0, swordCd: 0, powerCd: 0, powerT: 0, coyote: 0, jumpBuf: 0, anim: 0, landT: 0,
  hp: 0, pe: 0, lvl: 1, xp: 0, attr: { ...HEROI.attr }, hitSet: new Set(),
};
const maxHp = () => 40 + player.attr.V * 15;
const maxPe = () => 30 + player.attr.I * 10;
const swordDmg = () => 6 + player.attr.F * 3;
const powerDmg = () => PODER.dano.base + player.attr[PODER.dano.attr] * PODER.dano.mult;
const speed = () => 210 + player.attr.A * 15;
const xpNeed = () => 20 + (player.lvl - 1) * 15;

// ---------- estado do jogo ----------
let state = 'title';          // title | play | levelup | dead | victory
let checkpoint = 0, camX = 0, time = 0, playTime = 0, falls = 0, pendingLevels = 0;
let enemies = [], shots = [], fireballs = [], particles = [], texts = [];
let boss = null, bossActive = false, bossDefeated = false, pendant = null, banner = 0, victoryT = 0;
let shake = 0;

function makeEnemies() {
  return FASE.inimigos.map(d => {
    const T = INIMIGOS[d.tipo];
    const e = { tipo: d.tipo, T, w: T.w, h: T.h, hp: d.vida, max: d.vida, flash: 0 };
    if (T.mov === 'patrulha') Object.assign(e, { x: d.x, y: GROUND - T.h, x1: d.x1, x2: d.x2, vx: d.vel });
    else Object.assign(e, { bx: d.x, by: d.y, x: d.x, y: d.y, t: d.t || 0 });
    return e;
  });
}

function newGame() {
  Object.assign(player, { lvl: 1, xp: 0, attr: { ...HEROI.attr } });
  enemies = makeEnemies();
  checkpoint = 0; playTime = 0; falls = 0; pendingLevels = 0;
  bossDefeated = false; pendant = null;
  if (START_BOSS) {
    checkpoint = CHECKS.length - 1; enemies = [];
    player.lvl = 3; for (const k of ['V', 'F', 'I']) player.attr[k] += 1;
  }
  respawn();
  state = 'play';
}

function respawn() {
  Object.assign(player, { x: CHECKS[checkpoint], y: GROUND - 44, vx: 0, vy: 0, inv: 1.2, poison: 0, face: 1, swordT: 0 });
  player.hp = maxHp(); player.pe = maxPe();
  shots = []; fireballs = [];
  if (bossActive && !bossDefeated) { bossActive = false; boss = null; }
  camX = clamp(player.x - W * 0.4, 0, LEVEL_END - W);
}

// ---------- efeitos ----------
function burst(x, y, n, colors, spd = 220, life = .7, grav = 300, size = 4) {
  for (let i = 0; i < n; i++) {
    const a = rnd(0, Math.PI * 2), s = rnd(spd * .3, spd);
    particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - spd * .2, life: rnd(life * .5, life), max: life, c: colors[i % colors.length], s: rnd(size * .5, size), g: grav });
  }
}
const FIRE = ['#ffd36b', '#ff9a2e', '#ff5a1a', '#c2260e'];
const SILVER = ['#ffffff', '#e2e6ee', '#b9c0cc', '#d8dce6'];
function floatText(x, y, txt, c = '#fff') { texts.push({ x, y, txt, c, life: 1 }); }

function hurtPlayer(dmg, srcX, poison = 0) {
  if (player.inv > 0 || state !== 'play') return;
  player.hp -= dmg;
  player.inv = 1;
  player.vx = (player.x + player.w / 2 < srcX ? -1 : 1) * 320;
  player.vy = -320;
  if (poison) { player.poison = poison; floatText(player.x, player.y - 10, 'envenenado!', '#8dff6a'); }
  floatText(player.x + 4, player.y - 4, '-' + dmg, '#ff7b6b');
  burst(player.x + 14, player.y + 20, 10, ['#ff7b6b', '#ffd0c8'], 160, .5);
  shake = .25;
  if (player.hp <= 0) die();
}
function die() { player.hp = 0; state = 'dead'; pointers.clear(); }

function gainXp(n, x, y) {
  player.xp += n;
  floatText(x, y - 20, '+' + n + ' XP', '#f5d48a');
  while (player.xp >= xpNeed()) { player.xp -= xpNeed(); player.lvl++; pendingLevels++; }
  if (pendingLevels > 0) { state = 'levelup'; pointers.clear(); }
}

// multiplicador de dano de um tipo de ataque contra um alvo (resist da ficha; 0 = imune)
const resistOf = (resist, kind) => (resist && resist[kind] !== undefined ? resist[kind] : 1);

// ---------- chefes ----------
// Cada chefe tem: criar(cfg), atualizar(b, dt), desenhar(b), acertoCirculo(b, x, y, r), acertoRet(b, ret).
// Os acertos devolvem { x, y, mult } da parte atingida (mult > 1 = ponto fraco) ou null.
const CHEFES = {};

CHEFES.boitata = (() => {
  const PATTERN = ['slither', 'aimfire', 'slither', 'lungePrep'];
  const segR = i => Math.max(10, 22 - i * 0.8);
  const enraged = b => b.fire < b.max * 0.35;
  function next(b) {
    b.step = (b.step + 1) % PATTERN.length;
    b.state = PATTERN[b.step]; b.st = 0;
    if (b.state === 'aimfire') b.volley = 0;
    if (b.state === 'lungePrep') {
      const pc = player.x + player.w / 2, mid = (ARENA.x0 + ARENA.x1) / 2;
      b.lx = pc < mid ? ARENA.x1 - 70 : ARENA.x0 + 70;
      b.ltarget = b.lx > mid ? ARENA.x0 + 60 : ARENA.x1 - 60;
    }
  }
  return {
    enraged,
    criar(cfg) {
      const b = { cfg, hx: ARENA.x1 + 120, hy: 560, segs: [], fire: cfg.vida, max: cfg.vida, state: 'enter', st: 0, step: 0, flash: 0, volley: 0, ang: Math.PI, dead: false, deadT: 0, popped: 0, lx: 0, ltarget: 0 };
      for (let i = 0; i < 16; i++) b.segs.push({ x: b.hx + i * 14, y: 580 });
      return b;
    },
    atualizar(b, dt) {
      b.st += dt; b.flash = Math.max(0, b.flash - dt);
      const sp = enraged(b) ? 1.35 : 1, D = b.cfg.dano;
      const pcx = player.x + player.w / 2, pcy = player.y + player.h / 2;
      let tx = b.hx, ty = b.hy, follow = 6;

      if (b.dead) {
        b.deadT += dt;
        const want = Math.floor(b.deadT / 0.09);
        while (b.popped < Math.min(want, b.segs.length + 1)) {
          const idx = b.segs.length - 1 - b.popped;
          const p = idx >= 0 ? b.segs[idx] : { x: b.hx, y: b.hy };
          burst(p.x, p.y, 18, SILVER, 240, 1, 120, 4.5);
          b.popped++; shake = .12;
        }
        if (b.popped > b.segs.length && !pendant) pendant = { x: b.hx, y: Math.min(b.hy, GROUND - 120), vy: -200, t: 0 };
        return;
      }

      if (b.state === 'enter') {
        tx = ARENA.x1 - 250; ty = 330; follow = 2.2;
        if (b.st > 2.2) { b.step = -1; next(b); }
      } else if (b.state === 'slither') {
        const cx = (ARENA.x0 + ARENA.x1) / 2;
        tx = cx + Math.cos(b.st * 1.25 * sp) * 380; ty = 320 + Math.sin(b.st * 2.5 * sp) * 115;
        if (b.st > (enraged(b) ? 3.2 : 4.2)) next(b);
      } else if (b.state === 'aimfire') {
        tx = pcx < (ARENA.x0 + ARENA.x1) / 2 ? ARENA.x1 - 110 : ARENA.x0 + 110; ty = 170; follow = 4;
        const first = 1.0, gap = enraged(b) ? .75 : 1.0, volleys = 2;
        if (b.volley < volleys && b.st > first + b.volley * gap) {
          const n = enraged(b) ? 5 : 3, base = Math.atan2(pcy - b.hy, pcx - b.hx);
          for (let i = 0; i < n; i++) {
            const a = base + (i - (n - 1) / 2) * 0.22, s = 360 * (enraged(b) ? 1.15 : 1);
            fireballs.push({ x: b.hx, y: b.hy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 18, life: 4, dano: D.bolaDeFogo });
          }
          burst(b.hx, b.hy, 14, FIRE, 200, .5);
          b.volley++;
        }
        if (b.st > first + volleys * gap + .6) next(b);
      } else if (b.state === 'lungePrep') {
        tx = b.lx; ty = GROUND - 52; follow = 5;
        if (b.st > (enraged(b) ? .75 : 1.0)) { b.state = 'lunge'; b.st = 0; }
      } else if (b.state === 'lunge') {
        const dir = Math.sign(b.ltarget - b.hx) || -1, v = 860 * sp;
        b.hx += dir * v * dt; b.hy += (GROUND - 52 - b.hy) * Math.min(1, dt * 10);
        tx = b.hx; ty = b.hy; follow = 0;
        if ((dir < 0 && b.hx <= b.ltarget) || (dir > 0 && b.hx >= b.ltarget) || b.st > 2) next(b);
      }

      if (follow > 0) { const k = 1 - Math.exp(-follow * dt); b.hx += (tx - b.hx) * k; b.hy += (ty - b.hy) * k; }
      let px = b.hx, py = b.hy;
      b.segs.forEach((s, i) => {
        const d = i === 0 ? 30 : 24 - i * 0.4;
        const dx = s.x - px, dy = s.y - py, dist = Math.hypot(dx, dy) || 1;
        if (dist > d) { s.x = px + dx / dist * d; s.y = py + dy / dist * d; }
        px = s.x; py = s.y;
      });
      b.ang = Math.atan2(b.hy - b.segs[0].y, b.hx - b.segs[0].x);

      if (circleRect(b.hx, b.hy, 26, player)) {
        if (b.state === 'lunge' || b.state === 'lungePrep') hurtPlayer(D.veneno, b.hx, D.venenoSeg);
        else hurtPlayer(D.mordida, b.hx);
      }
      if (Math.random() < dt * (enraged(b) ? 30 : 16)) {
        const s = b.segs[(Math.random() * b.segs.length) | 0];
        particles.push({ x: s.x + rnd(-8, 8), y: s.y - 10, vx: rnd(-20, 20), vy: rnd(-90, -40), life: .7, max: .7, c: FIRE[(Math.random() * 3) | 0], s: rnd(2, 4), g: -40 });
      }
    },
    acertoCirculo(b, x, y, r) {
      if (Math.hypot(x - b.hx, y - b.hy) < 34 + r) return { x: b.hx, y: b.hy, mult: 1.5 };
      for (let i = 0; i < b.segs.length; i++) { const s = b.segs[i]; if (Math.hypot(x - s.x, y - s.y) < segR(i) + r) return { x: s.x, y: s.y, mult: .7 }; }
      return null;
    },
    acertoRet(b, rr) {
      if (circleRect(b.hx, b.hy, 32, rr)) return { x: b.hx, y: b.hy, mult: 1.5 };
      for (let i = 0; i < b.segs.length; i++) { const s = b.segs[i]; if (circleRect(s.x, s.y, segR(i), rr)) return { x: s.x, y: s.y, mult: .7 }; }
      return null;
    },
    desenhar(b) {
      const rage = enraged(b), S = sprite(b.cfg.sprite);
      const P = S && S.partes;
      for (let i = b.segs.length - 1; i >= 0; i--) {
        if (b.dead && i >= b.segs.length - b.popped) continue;
        const s = b.segs[i], x = s.x - camX, r = segR(i);
        const prev = i === 0 ? { x: b.hx, y: b.hy } : b.segs[i - 1];
        const ang = Math.atan2(prev.y - s.y, prev.x - s.x);
        const part = P && (i === b.segs.length - 1 && P.rabo ? P.rabo : P.gomo);
        if (part) {
          flame(x, s.y - r * .5, r * 1.1, r * (rage ? 1.9 : 1.4), time * 12 + i * 1.7);
          const [qx, qy, qw, qh] = part, k = (r * 2.4) / qh;
          ctx.save(); ctx.translate(x, s.y); ctx.rotate(ang); if (Math.cos(ang) < 0) ctx.scale(1, -1);
          ctx.drawImage(S.image, qx, qy, qw, qh, -qw * k / 2, -qh * k / 2, qw * k, qh * k);
          ctx.restore();
        } else {
          flame(x, s.y - r * .4, r * 1.3, r * (rage ? 2.4 : 1.8), time * 12 + i * 1.7);
          const g = ctx.createRadialGradient(x, s.y, 1, x, s.y, r);
          g.addColorStop(0, '#ffb347'); g.addColorStop(.35, '#d4471a'); g.addColorStop(.8, '#4a1408'); g.addColorStop(1, '#1e0804');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, s.y, r, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = 'rgba(255,160,60,.6)'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(x, s.y, r * .6, .3, 2.2); ctx.stroke();
        }
      }
      if (b.dead && b.popped > b.segs.length) return;
      const x = b.hx - camX, y = b.hy;
      ctx.save(); ctx.translate(x, y);
      const right = Math.cos(b.ang) >= 0;
      ctx.scale(right ? 1 : -1, 1);
      const a = right ? b.ang : Math.PI - b.ang;
      ctx.rotate(clamp(a > Math.PI ? a - Math.PI * 2 : a, -.9, .9));
      if (b.state === 'lungePrep') ctx.translate(Math.sin(time * 60) * 2, 0);
      const venom = b.state === 'lungePrep' || b.state === 'lunge';
      if (P && P.cabeca) {
        flame(-14, -16, 34, rage ? 56 : 40, time * 10);
        const [qx, qy, qw, qh] = P.cabeca, k = 84 / qw;
        ctx.drawImage(S.image, qx, qy, qw, qh, -qw * k * .45, -qh * k / 2, qw * k, qh * k);
        if (venom) { ctx.fillStyle = 'rgba(140,255,100,.3)'; ctx.beginPath(); ctx.arc(26, 10, 18, 0, Math.PI * 2); ctx.fill(); }
      } else {
        flame(-6, -18, 40, rage ? 62 : 46, time * 10);
        flame(-20, -14, 26, rage ? 40 : 30, time * 11 + 2);
        const hg = ctx.createRadialGradient(0, 0, 2, 0, 0, 36);
        hg.addColorStop(0, '#ffb347'); hg.addColorStop(.4, '#c9401a'); hg.addColorStop(1, '#2a0a04');
        ctx.fillStyle = hg; ctx.beginPath(); ctx.ellipse(4, 0, 38, 26, 0, 0, Math.PI * 2); ctx.fill();
        const open = venom ? 9 : 3 + Math.sin(time * 4) * 2;
        ctx.fillStyle = '#3a0e06'; ctx.beginPath(); ctx.moveTo(10, 6); ctx.lineTo(40, 6 + open); ctx.lineTo(8, 18); ctx.fill();
        ctx.fillStyle = venom ? '#b8ff9a' : '#fff6e0';
        ctx.beginPath(); ctx.moveTo(30, 4); ctx.lineTo(34, 4); ctx.lineTo(32, 16 + open * .4); ctx.fill();
        ctx.beginPath(); ctx.moveTo(20, 5); ctx.lineTo(24, 5); ctx.lineTo(22, 15 + open * .4); ctx.fill();
        if (venom) { ctx.fillStyle = 'rgba(140,255,100,.35)'; ctx.beginPath(); ctx.arc(28, 12, 16, 0, Math.PI * 2); ctx.fill(); }
        const eg = ctx.createRadialGradient(14, -8, 1, 14, -8, 12);
        eg.addColorStop(0, '#ffffff'); eg.addColorStop(.3, '#ffe066'); eg.addColorStop(1, 'rgba(255,120,0,0)');
        ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(14, -8, 12, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff7d0'; ctx.beginPath(); ctx.arc(14, -8, 4, 0, Math.PI * 2); ctx.fill();
      }
      if (b.state === 'aimfire') { ctx.fillStyle = 'rgba(255,220,120,.4)'; ctx.beginPath(); ctx.arc(30, 4, 14 + Math.sin(time * 20) * 4, 0, Math.PI * 2); ctx.fill(); }
      if (b.flash > 0) { ctx.fillStyle = 'rgba(200,235,255,.7)'; ctx.beginPath(); ctx.ellipse(4, 0, 40, 28, 0, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    },
  };
})();
const CHEFE = CHEFES[CHEFE_CFG.tipo];

function startBoss() {
  bossActive = true;
  boss = CHEFE.criar(CHEFE_CFG);
  banner = 3.6;
  enemies = enemies.filter(e => e.x < ARENA.x0 - 100);
}

// aplica dano ao chefe na parte atingida; kind = 'espada' ou a chave do poder
function damageBoss(hit, dmg, kind) {
  const b = boss, res = resistOf(b.cfg.resist, kind);
  if (res === 0) {
    const heal = Math.round(dmg * .3);
    b.fire = Math.min(b.max, b.fire + heal);
    floatText(hit.x, hit.y - 30, 'absorveu! +' + heal, '#ffb36b');
    burst(hit.x, hit.y, 8, FIRE, 160, .5);
    return;
  }
  const d = Math.max(1, Math.round(dmg * hit.mult * res));
  b.fire = Math.max(0, b.fire - d);
  b.flash = .12;
  floatText(hit.x, hit.y - 30, (hit.mult > 1 ? 'Crítico! ' : '') + '-' + d, hit.mult > 1 ? '#9fe7ff' : '#d9ecff');
  burst(hit.x, hit.y, kind === 'espada' ? 8 : 14, kind === 'espada' ? FIRE : PODER.rastro, 180, .6, -60);
  if (b.fire <= 0) {
    b.dead = true; b.deadT = 0; fireballs = [];
    floatText(b.hx, b.hy - 60, 'O fogo se apagou!', '#ffffff');
  }
}
const bossHittable = () => boss && !boss.dead && boss.state !== 'enter';

// ---------- atualização ----------
let demoT = 0;
function demoInput(dt) {
  demoT += dt;
  const fake = { left: false, right: false };
  if (!bossActive) fake.right = true;
  else {
    const pc = player.x + 14;
    const goal = pendant ? pendant.x : boss.hx, gap = pendant ? 5 : 160;
    fake.right = goal > pc + gap; fake.left = goal < pc - gap;
    if (demoT % 0.35 < dt) powerPressed = true;
    if (boss && (boss.state === 'lunge' || boss.state === 'lungePrep') && Math.abs(boss.hx - pc) < 200) jumpPressed = true;
  }
  if (demoT % 1.6 < dt) jumpPressed = true;
  return fake;
}

function updatePlayer(dt) {
  const p = player;
  let left = keys.ArrowLeft || keys.KeyA || held('left');
  let right = keys.ArrowRight || keys.KeyD || held('right');
  let jumpHeld = JUMP_KEYS.some(k => keys[k]) || held('jump');
  if (DEMO) { const f = demoInput(dt); left = f.left; right = f.right; jumpHeld = true; }

  const dir = (right ? 1 : 0) - (left ? 1 : 0);
  if (dir) p.face = dir;
  const target = dir * speed();
  const acc = p.onGround ? 2600 : 1600;
  if (p.inv < 0.75 || p.onGround) p.vx += clamp(target - p.vx, -acc * dt, acc * dt);

  p.coyote = p.onGround ? 0.1 : p.coyote - dt;
  p.jumpBuf = jumpPressed ? 0.12 : p.jumpBuf - dt;
  if (p.jumpBuf > 0 && p.coyote > 0) { p.vy = -JUMP_V; p.jumpBuf = 0; p.coyote = 0; burst(p.x + 14, p.y + p.h, 6, ['#6b5446', '#3d2f27'], 90, .35, 200, 3); }
  p.vy += GRAV * dt * (!jumpHeld && p.vy < 0 ? 1.4 : 1);
  p.vy = Math.min(p.vy, 1000);

  p.x += p.vx * dt;
  for (const s of SOLIDS) if (overlap(p, s)) { if (p.vx > 0) p.x = s.x - p.w; else if (p.vx < 0) p.x = s.x + s.w; p.vx = 0; }
  const minX = bossActive ? ARENA.x0 : 0, maxX = bossActive ? ARENA.x1 - p.w : LEVEL_END - p.w;
  p.x = clamp(p.x, minX, maxX);
  const prevBottom = p.y + p.h, wasGround = p.onGround, fallV = p.vy;
  p.y += p.vy * dt;
  p.onGround = false;
  for (const s of SOLIDS) if (overlap(p, s)) {
    if (p.vy > 0) { p.y = s.y - p.h; p.onGround = true; } else if (p.vy < 0) p.y = s.y + s.h;
    p.vy = 0;
  }
  if (p.vy >= 0) for (const pl of PLATS) {
    if (p.x + p.w > pl.x && p.x < pl.x + pl.w && prevBottom <= pl.y + 2 && p.y + p.h >= pl.y) { p.y = pl.y - p.h; p.vy = 0; p.onGround = true; }
  }
  if (p.onGround && !wasGround && fallV > 350) p.landT = 0.14;
  p.landT = Math.max(0, p.landT - dt);
  p.anim += Math.abs(p.vx) * dt * 0.05;

  if (p.y > H + 80) {
    falls++;
    const hp = p.hp - 15;
    floatText(CHECKS[checkpoint], GROUND - 80, 'Cuidado com os buracos!', '#ffb3a8');
    Object.assign(p, { x: bossActive ? ARENA.x0 + 40 : CHECKS[checkpoint], y: GROUND - 44, vx: 0, vy: 0, inv: 1.2 });
    p.hp = hp;
    if (p.hp <= 0) die();
    return;
  }

  for (let i = CHECKS.length - 1; i > checkpoint; i--) if (p.x > CHECKS[i]) { checkpoint = i; floatText(p.x, p.y - 30, 'Ponto de controle', '#9fe7ff'); break; }
  for (const hz of HAZARDS) if (overlap(p, hz)) hurtPlayer(6, hz.x + hz.w / 2);

  if (p.poison > 0) {
    p.poison -= dt; p.hp -= 2.5 * dt;
    if (Math.random() < dt * 8) particles.push({ x: p.x + rnd(0, p.w), y: p.y + rnd(0, p.h), vx: 0, vy: -40, life: .5, max: .5, c: '#8dff6a', s: 2.5, g: 0 });
    if (p.hp <= 0) die();
  }
  p.pe = Math.min(maxPe(), p.pe + 11 * dt);
  p.inv = Math.max(0, p.inv - dt);

  // espada
  p.swordCd -= dt; p.swordT -= dt;
  if (swordPressed && p.swordCd <= 0) { p.swordT = 0.18; p.swordCd = 0.34; p.hitSet.clear(); }
  if (p.swordT > 0) {
    const r = { x: p.face > 0 ? p.x + p.w - 4 : p.x - 50, y: p.y - 8, w: 54, h: p.h + 12 };
    for (const e of enemies) if (!p.hitSet.has(e) && overlap(r, e)) { p.hitSet.add(e); damageEnemy(e, swordDmg(), 'espada'); }
    if (!p.hitSet.has('boss') && bossHittable()) { const hit = CHEFE.acertoRet(boss, r); if (hit) { p.hitSet.add('boss'); damageBoss(hit, swordDmg(), 'espada'); } }
    for (const f of fireballs) if (circleRect(f.x, f.y, f.r, r)) { f.life = 0; burst(f.x, f.y, 10, FIRE, 160, .4); }
  }
  // poder do elemento
  p.powerCd -= dt; p.powerT -= dt;
  if (powerPressed && p.powerCd <= 0) {
    if (p.pe >= PODER.custo) {
      p.pe -= PODER.custo; p.powerCd = PODER.recarga; p.powerT = 0.2;
      shots.push({ x: p.x + p.w / 2 + p.face * 18, y: p.y + 18, vx: p.face * PODER.velocidade, vy: PODER.salto || 0, r: PODER.raio, life: PODER.vida, hit: new Set() });
    } else if (p.powerCd < -0.5) { floatText(p.x, p.y - 20, 'Sem energia', '#9cc7ef'); p.powerCd = 0.6; }
  }
}

function damageEnemy(e, dmg, kind) {
  const res = resistOf(e.T.resist, kind);
  if (res === 0) { floatText(e.x, e.y - 8, 'imune!', '#ffb36b'); return; }
  const d = Math.max(1, Math.round(dmg * res));
  e.hp -= d; e.flash = .12;
  const cores = kind === 'espada' ? FIRE : PODER.rastro;
  floatText(e.x, e.y - 8, '-' + d, res > 1 ? '#9fe7ff' : '#fff');
  burst(e.x + e.w / 2, e.y + e.h / 2, 8, cores, 150, .4);
  if (e.hp <= 0) {
    e.dead = true;
    burst(e.x + e.w / 2, e.y + e.h / 2, 18, cores, 220, .7);
    gainXp(e.T.xp, e.x, e.y);
  }
}

function update(dt) {
  time += dt; playTime += dt;
  updatePlayer(dt);
  if (state !== 'play') return;

  for (const e of enemies) {
    e.flash = Math.max(0, e.flash - dt);
    if (e.T.mov === 'patrulha') {
      e.x += e.vx * dt;
      if (e.x < e.x1) { e.x = e.x1; e.vx = Math.abs(e.vx); }
      if (e.x > e.x2) { e.x = e.x2; e.vx = -Math.abs(e.vx); }
    } else { e.t += dt; e.x = e.bx + Math.sin(e.t * .8) * 90; e.y = e.by + Math.sin(e.t * 2.1) * 35; }
    if (overlap(player, e)) hurtPlayer(e.T.dano, e.x + e.w / 2);
  }
  enemies = enemies.filter(e => !e.dead);

  for (const o of shots) {
    o.vy += (PODER.gravidade || 0) * dt; o.x += o.vx * dt; o.y += o.vy * dt; o.life -= dt;
    if (Math.random() < .7) particles.push({ x: o.x, y: o.y + rnd(-4, 4), vx: -o.vx * .05, vy: rnd(-20, 20), life: .3, max: .3, c: PODER.rastro[(Math.random() * 3) | 0], s: rnd(2, 4), g: 0 });
    for (const e of enemies) if (!e.dead && !o.hit.has(e) && circleRect(o.x, o.y, o.r, e)) {
      o.hit.add(e); damageEnemy(e, powerDmg(), PODER_ID);
      if (!PODER.perfura) { o.life = 0; break; }
    }
    if (o.life > 0 && PODER_ID !== 'fogo') for (const f of fireballs) if (f.life > 0 && Math.hypot(o.x - f.x, o.y - f.y) < o.r + f.r) {
      f.life = 0; if (!PODER.perfura) o.life = 0;
      burst(f.x, f.y, 14, PODER.rastro, 180, .6, -60); break;
    }
    if (o.life > 0 && bossActive && bossHittable() && !o.hit.has('boss')) {
      const hit = CHEFE.acertoCirculo(boss, o.x, o.y, 0);
      if (hit) { o.hit.add('boss'); damageBoss(hit, powerDmg(), PODER_ID); if (!PODER.perfura) o.life = 0; }
    }
    if (o.life > 0) for (const s of SOLIDS) if (circleRect(o.x, o.y, o.r, s)) {
      if (PODER.gravidade && o.vy > 0 && o.y < s.y + 4) { o.y = s.y - o.r; o.vy = (PODER.salto || -200) * .7; continue; } // pedra quica
      o.life = 0; burst(o.x, o.y, 6, PODER.rastro, 100, .3);
    }
  }
  shots = shots.filter(o => o.life > 0);

  for (const f of fireballs) {
    f.vy += 260 * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.life -= dt;
    if (Math.random() < .8) particles.push({ x: f.x + rnd(-6, 6), y: f.y + rnd(-6, 6), vx: 0, vy: -30, life: .35, max: .35, c: FIRE[(Math.random() * 4) | 0], s: rnd(3, 6), g: -50 });
    if (circleRect(f.x, f.y, f.r - 4, player)) { hurtPlayer(f.dano, f.x); f.life = 0; burst(f.x, f.y, 16, FIRE, 200, .5); }
    if (f.y + f.r > GROUND) { f.life = 0; burst(f.x, GROUND - 4, 16, FIRE, 200, .5); }
  }
  fireballs = fireballs.filter(f => f.life > 0 && f.x > ARENA.x0 - 200 && f.x < ARENA.x1 + 200);

  if (!bossActive && !bossDefeated && player.x > FASE.gatilhoChefe) startBoss();
  if (bossActive && boss) CHEFE.atualizar(boss, dt);
  banner = Math.max(0, banner - dt);

  if (pendant) {
    pendant.t += dt;
    if (pendant.y < GROUND - 26) { pendant.vy += 600 * dt; pendant.y = Math.min(GROUND - 26, pendant.y + pendant.vy * dt); }
    if (Math.random() < dt * 10) particles.push({ x: pendant.x + rnd(-14, 14), y: pendant.y + rnd(-14, 14), vx: 0, vy: -30, life: .6, max: .6, c: '#ffffff', s: 2, g: 0 });
    if (!bossDefeated && Math.hypot(player.x + 14 - pendant.x, player.y + 22 - pendant.y) < 40) {
      bossDefeated = true; victoryT = 0;
      burst(pendant.x, pendant.y, 40, SILVER, 260, 1.2, 0, 4);
    }
  }
  if (bossDefeated) { victoryT += dt; if (victoryT > 1.2) { state = 'victory'; pointers.clear(); } }

  for (const q of particles) { q.vy += q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.life -= dt; }
  particles = particles.filter(q => q.life > 0);
  if (particles.length > 600) particles.splice(0, particles.length - 600);
  for (const t of texts) { t.y -= 40 * dt; t.life -= dt; }
  texts = texts.filter(t => t.life > 0);
  shake = Math.max(0, shake - dt);

  const want = bossActive ? ARENA.x0 : clamp(player.x + player.w / 2 - W * 0.4, 0, LEVEL_END - W);
  camX += (want - camX) * Math.min(1, dt * (bossActive ? 3 : 8));
}

// ---------- menus ----------
const LV_OPTS = [
  { k: 'V', nome: 'Vigor', fx: '+15 de vida máxima' },
  { k: 'F', nome: 'Força', fx: '+3 de dano da espada' },
  { k: 'I', nome: 'Intelecto', fx: '+10 de energia' + (PODER.dano.attr === 'I' ? ' e +3 de dano do poder' : '') },
  { k: 'A', nome: 'Agilidade', fx: 'corre mais rápido' },
];
const lvCard = i => ({ x: 120 + i * 190, y: 230, w: 170, h: 190 });
function chooseLevel(i) {
  const o = LV_OPTS[i]; if (!o) return;
  player.attr[o.k]++;
  player.hp = maxHp(); player.pe = maxPe();
  pendingLevels--;
  floatText(player.x - 10, player.y - 30, o.nome + ' +1', '#f5d48a');
  if (pendingLevels <= 0) state = 'play';
}
function menuTap(p) {
  if (portrait) return;
  if (state === 'title') { goFullscreen(); newGame(); }
  else if (state === 'dead') { respawn(); state = 'play'; }
  else if (state === 'victory') { state = 'title'; }
  else if (state === 'levelup') { for (let i = 0; i < 4; i++) if (overlap({ x: p.x, y: p.y, w: 1, h: 1 }, lvCard(i))) chooseLevel(i); }
}
function menuKey(code) {
  if (state === 'levelup') { const n = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3 }[code]; if (n !== undefined) chooseLevel(n); return; }
  if (['Enter', 'Space', 'KeyJ', 'KeyZ'].includes(code)) menuTap({ x: W / 2, y: H / 2 });
}

// ---------- desenho ----------
const titleImg = new Image();
titleImg.src = FASE.imagemTitulo;

function flame(x, y, w, h, t, inner = '#ffe28a', mid = '#ff8a1e', outer = 'rgba(200,40,10,0)') {
  const f = 1 + Math.sin(t) * .12;
  const g = ctx.createRadialGradient(x, y - h * .25, 1, x, y - h * .3, h * f);
  g.addColorStop(0, inner); g.addColorStop(.45, mid); g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x, y - h * f);
  ctx.quadraticCurveTo(x + w * .9, y - h * .35, x + w * .5, y);
  ctx.quadraticCurveTo(x, y + h * .12, x - w * .5, y);
  ctx.quadraticCurveTo(x - w * .9, y - h * .35, x, y - h * f);
  ctx.fill();
}
function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); }

function drawTree(x, base, h, w, b, color) {
  ctx.fillStyle = color; ctx.strokeStyle = color;
  ctx.beginPath(); ctx.moveTo(x - w / 2, base); ctx.lineTo(x - w * .18, base - h); ctx.lineTo(x + w * .18, base - h); ctx.lineTo(x + w / 2, base); ctx.fill();
  ctx.lineCap = 'round';
  b.forEach((r, i) => {
    const by = base - h * (.45 + i * .14), side = i % 2 ? 1 : -1, len = 25 + r * 45;
    ctx.lineWidth = Math.max(2, w * .28 - i);
    ctx.beginPath(); ctx.moveTo(x, by); ctx.lineTo(x + side * len, by - 18 - r * 25); ctx.stroke();
  });
}

// camada de imagem repetida na horizontal, com paralaxe; base = y do pé da imagem
function tiled(img, par, base, height) {
  const k = height / img.naturalHeight, w = img.naturalWidth * k;
  let x = -((camX * par) % w); if (x > 0) x -= w;
  for (; x < W; x += w) ctx.drawImage(img, x, base - height, w + 1, height);
}

function drawBackground() {
  const C = FASE.cores, F = FASE.fundo;
  const ceu = layer(F, 'ceu'), longe = layer(F, 'longe'), perto = layer(F, 'perto');
  if (ceu) {
    const k = Math.max(W / ceu.naturalWidth, H / ceu.naturalHeight);
    const w = ceu.naturalWidth * k, over = Math.max(0, w - W);
    ctx.drawImage(ceu, -over * clamp(camX / Math.max(1, LEVEL_END - W), 0, 1), 0, w, ceu.naturalHeight * k);
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, C.ceu[0]); g.addColorStop(.55, C.ceu[1]); g.addColorStop(.8, C.ceu[2]); g.addColorStop(1, C.ceu[3]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,170,110,.18)'; ctx.beginPath(); ctx.arc(760, 120, 70, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.lua; ctx.beginPath(); ctx.arc(760, 120, 38, 0, Math.PI * 2); ctx.fill();
  }
  if (longe) tiled(longe, .3, GROUND, 360);
  else {
    ctx.fillStyle = C.morros;
    ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 20) ctx.lineTo(x, 330 + Math.sin((x + camX * .1) * .008) * 30 + Math.sin((x + camX * .1) * .021) * 14);
    ctx.lineTo(W, H); ctx.fill();
    for (const t of FAR) { const x = t.x - camX * .3; const sx = ((x % 6650) + 6650) % 6650 - 200; if (sx < -100 || sx > W + 100) continue; drawTree(sx, 420, t.h, t.w, t.b, C.arvoreLonge); }
  }
  const fog = ctx.createLinearGradient(0, 300, 0, H);
  fog.addColorStop(0, 'rgba(120,60,40,0)'); fog.addColorStop(1, 'rgba(120,60,40,.35)');
  ctx.fillStyle = fog; ctx.fillRect(0, 300, W, H - 300);
  if (perto) tiled(perto, .6, GROUND + 10, 420);
  else for (const t of MID) {
    const x = t.x - camX * .6; const sx = ((x % 9000) + 9000) % 9000 - 200; if (sx < -120 || sx > W + 120) continue;
    drawTree(sx, GROUND + 10, t.h, t.w, t.b, C.arvorePerto);
    if (t.glow) { ctx.fillStyle = 'rgba(255,110,30,.55)'; ctx.fillRect(sx - 2, GROUND - t.h * .4, 3, t.h * .25); }
  }
  if (C.brasas) for (const a of ASH) {
    const y = ((a.y - time * a.v) % H + H) % H, x = ((a.x + Math.sin(time + a.ph) * 20 - camX * .2) % W + W) % W;
    ctx.fillStyle = a.s > 2.5 ? 'rgba(255,150,60,.8)' : 'rgba(220,200,190,.35)';
    ctx.fillRect(x, y, a.s, a.s);
  }
}

let groundPattern = null;
function drawWorld() {
  const C = FASE.cores, chao = layer(FASE.fundo, 'chao');
  if (chao && !groundPattern) groundPattern = ctx.createPattern(chao, 'repeat');
  for (const s of SOLIDS) {
    const x = s.x - camX; if (x > W || x + s.w < 0) continue;
    if (groundPattern) {
      ctx.save(); ctx.translate(-camX, s.y); ctx.fillStyle = groundPattern; ctx.fillRect(s.x, 0, s.w, s.h); ctx.restore();
      continue;
    }
    ctx.fillStyle = C.chao; ctx.fillRect(x, s.y, s.w, s.h);
    const g = ctx.createLinearGradient(0, s.y, 0, s.y + 18);
    g.addColorStop(0, C.chaoTopo); g.addColorStop(1, C.chao);
    ctx.fillStyle = g; ctx.fillRect(x, s.y, s.w, 18);
    ctx.fillStyle = 'rgba(255,120,40,.6)';
    for (let i = 0; i < s.w; i += 37) { const ex = x + i + ((i * 13) % 20); if ((i / 37 | 0) % 3 === 0) ctx.fillRect(ex, s.y + 6 + (i % 7), 3, 2); }
  }
  for (const p of PLATS) {
    const x = p.x - camX; if (x > W || x + p.w < 0) continue;
    ctx.fillStyle = '#3a2418'; roundRect(x, p.y, p.w, 16, 8); ctx.fill();
    ctx.fillStyle = '#1e120c'; roundRect(x, p.y + 9, p.w, 7, 4); ctx.fill();
    ctx.fillStyle = 'rgba(255,120,40,.7)'; ctx.fillRect(x + p.w * .3, p.y + 4, 4, 2); ctx.fillRect(x + p.w * .7, p.y + 6, 3, 2);
  }
  for (const hz of HAZARDS) {
    const x = hz.x - camX; if (x > W || x + hz.w < 0) continue;
    ctx.fillStyle = 'rgba(255,90,20,.35)'; ctx.fillRect(x, GROUND - 4, hz.w, 4);
    for (let i = 8; i < hz.w; i += 16) flame(x + i, GROUND, 14, 26 + Math.sin(time * 9 + i) * 6, time * 12 + i);
  }
  CHECKS.forEach((c, i) => {
    if (i === 0) return;
    const x = c - camX; if (x < -20 || x > W + 20) return;
    ctx.fillStyle = '#5b4a3c'; ctx.fillRect(x, GROUND - 46, 4, 46);
    ctx.fillStyle = i <= checkpoint ? '#9fe7ff' : '#7a6a5a';
    ctx.beginPath(); ctx.arc(x + 2, GROUND - 50, 7, 0, Math.PI * 2); ctx.fill();
  });
  if (!bossDefeated) {
    const x = ARENA.x0 + 40 - camX;
    if (x > -40 && x < W + 40) {
      ctx.fillStyle = '#3b2a20'; ctx.fillRect(x, GROUND - 60, 6, 60); ctx.fillRect(x - 26, GROUND - 70, 58, 30);
      ctx.fillStyle = '#ffb36b'; ctx.font = 'bold 18px Cinzel, serif'; ctx.textAlign = 'center'; ctx.fillText('!!', x + 3, GROUND - 49);
    }
  }
}

function playerAnim() {
  const p = player;
  if (p.inv > 0.7 && state === 'play') return { a: 'dano', t: 0 };
  if (p.swordT > 0) return { a: 'espada', t: (1 - p.swordT / 0.18) * 1.99 };
  if (p.powerT > 0) return { a: 'poder', t: 0 };
  if (!p.onGround) return { a: p.vy < 0 ? 'pular' : 'cair', t: 0 };
  if (Math.abs(p.vx) > 20) return { a: 'correr', t: p.anim * 2.2 };
  return { a: 'parado', t: time * 2 };
}

function drawPlayer() {
  const p = player;
  if (p.inv > 0 && Math.floor(p.inv * 12) % 2 === 0 && state === 'play') return;
  const x = Math.round(p.x - camX), y = Math.round(p.y), f = p.face;
  const S = sprite(HEROI.sprite);
  if (S) {
    const { a, t } = playerAnim();
    const sq = p.landT > 0 ? p.landT / 0.14 : 0;
    let bob = a === 'correr' ? -Math.abs(Math.sin(p.anim * 6)) * 2 : a === 'parado' ? Math.sin(time * 3) * .8 : 0;
    // Pose que ainda não tem imagem: o próprio jogo dá o movimento à imagem que existe
    // (inclina, quica e estica). Assim o herói funciona até com uma imagem só.
    let rot = 0, ex = 1, ey = 1;
    if (!temAnim(S, a)) {
      if (a === 'correr') { const c = Math.sin(p.anim * 6); rot = .09 + c * .04; bob = -Math.abs(c) * 5; ey = 1 - Math.abs(c) * .03; }
      else if (a === 'pular') { ex = .93; ey = 1.07; rot = -.04; }
      else if (a === 'cair') { ex = 1.03; ey = .98; rot = .07; }
      else if (a === 'espada') { rot = t < .8 ? -.16 : .2; ex = t < .8 ? 1 : 1.06; }
      else if (a === 'poder') { rot = .1; ex = 1.04; }
      else if (a === 'dano') { rot = -.24; }
      else if (a === 'parado') { ey = 1 + Math.sin(time * 3) * .012; }
    }
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x + p.w / 2, y + p.h + 1, 15, 3, 0, 0, Math.PI * 2); ctx.fill();
    drawFrame(S, a, t, x + p.w / 2, y + p.h + 1 + bob, f, ex * (1 + sq * .12), ey * (1 - sq * .14), rot);
  } else drawPlayerShape(x, y, f);
  if (p.swordT > 0) {
    const k = 1 - p.swordT / 0.18;
    ctx.strokeStyle = `rgba(255,236,180,${1 - k})`; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(x + p.w / 2 + f * 10, y + 22, 40, f > 0 ? -1.3 + k * .4 : Math.PI + 1.3 - k * .4, f > 0 ? 1.0 + k * .4 : Math.PI - 1.0 - k * .4, f < 0); ctx.stroke();
  }
  if (p.poison > 0) { ctx.fillStyle = 'rgba(120,255,90,.18)'; ctx.fillRect(x - 4, y - 4, p.w + 8, p.h + 8); }
}

// desenho de reserva do herói (usado quando não há imagem)
function drawPlayerShape(x, y, f) {
  const p = player, C = HEROI.cores;
  const walk = p.onGround && Math.abs(p.vx) > 20 ? Math.sin(p.anim * 6) : 0;
  ctx.save();
  ctx.translate(x + p.w / 2, y);
  ctx.scale(f, 1);
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(0, p.h + 1, 14, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2b2233';
  ctx.fillRect(-9 + walk * 3, 32, 7, 12); ctx.fillRect(2 - walk * 3, 32, 7, 12);
  ctx.fillStyle = '#4a3326'; ctx.fillRect(-10 + walk * 3, 41, 9, 4); ctx.fillRect(1 - walk * 3, 41, 9, 4);
  ctx.fillStyle = C.capa;
  ctx.beginPath(); ctx.moveTo(-6, 12); ctx.lineTo(-15 - Math.abs(p.vx) * .02, 34 + walk); ctx.lineTo(4, 34); ctx.fill();
  ctx.fillStyle = C.roupa; roundRect(-10, 13, 20, 22, 5); ctx.fill();
  ctx.fillStyle = C.cinto; ctx.fillRect(-10, 27, 20, 3);
  ctx.fillStyle = C.pele; ctx.beginPath(); ctx.arc(1, 7, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = C.cabelo; ctx.beginPath(); ctx.arc(-1, 3, 9.5, Math.PI * .95, Math.PI * 2.05); ctx.fill();
  ctx.fillRect(-10, 2, 5, 8);
  ctx.fillStyle = '#1a1a1a'; ctx.fillRect(5, 6, 2, 3);
  const swing = p.swordT > 0 ? -1.2 + (0.18 - p.swordT) / 0.18 * 2.4 : walk * .3;
  ctx.save(); ctx.translate(2, 16); ctx.rotate(swing);
  ctx.fillStyle = C.pele; roundRect(-2, 0, 6, 15, 3); ctx.fill();
  if (HEROI.marca) {
    const glow = .6 + Math.sin(time * 5) * .4;
    ctx.fillStyle = `rgba(255,240,170,${glow})`;
    [[1, 3], [2, 7], [0, 11]].forEach(([a, b2]) => { ctx.beginPath(); ctx.arc(a, b2, 1.4, 0, Math.PI * 2); ctx.fill(); });
  }
  ctx.fillStyle = '#8a6a3a'; ctx.fillRect(-1, 13, 4, 5);
  ctx.fillStyle = '#d8dee8'; ctx.beginPath(); ctx.moveTo(0, 18); ctx.lineTo(3, 18); ctx.lineTo(2, 38); ctx.lineTo(1, 38); ctx.fill();
  ctx.restore();
  ctx.restore();
}

function drawEnemies() {
  for (const e of enemies) {
    const x = e.x - camX; if (x < -60 || x > W + 60) continue;
    const S = sprite(e.T.sprite);
    if (S) {
      const face = e.T.mov === 'patrulha' ? (e.vx > 0 ? 1 : -1) : 1;
      drawFrame(S, e.T.mov === 'voo' ? 'voar' : 'andar', time * 8 + e.x * .01, x + e.w / 2, e.y + e.h + (e.T.mov === 'voo' ? 6 : 0), face);
    } else if (e.tipo === 'brasa') {
      flame(x + 13, e.y + 26, 30, 38 + Math.sin(time * 10 + e.x) * 4, time * 14 + e.x);
      ctx.fillStyle = '#2a0a04';
      const lx = e.vx > 0 ? 3 : -3;
      ctx.beginPath(); ctx.arc(x + 9 + lx, e.y + 14, 2.6, 0, Math.PI * 2); ctx.arc(x + 17 + lx, e.y + 14, 2.6, 0, Math.PI * 2); ctx.fill();
    } else {
      const cx = x + 11, cy = e.y + 11;
      const halo = ctx.createRadialGradient(cx, cy, 2, cx, cy, 26);
      halo.addColorStop(0, 'rgba(255,200,90,.9)'); halo.addColorStop(1, 'rgba(255,120,30,0)');
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, cy, 26, 0, Math.PI * 2); ctx.fill();
      const wf = Math.sin(time * 30) * 5;
      ctx.fillStyle = 'rgba(255,230,200,.5)';
      ctx.beginPath(); ctx.ellipse(cx - 8, cy - 6, 8, 4 + wf * .3, -.5, 0, Math.PI * 2); ctx.ellipse(cx + 8, cy - 6, 8, 4 - wf * .3, .5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff1c2'; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
    }
    if (e.flash > 0) { ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillRect(x - 4, e.y - 10, e.w + 8, e.h + 10); }
    if (e.hp < e.max) {
      ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(x, e.y - 14, e.w, 4);
      ctx.fillStyle = '#ffb36b'; ctx.fillRect(x, e.y - 14, e.w * e.hp / e.max, 4);
    }
  }
}

function drawProjectiles() {
  const [c0, c1, c2] = PODER.cores;
  for (const o of shots) {
    const x = o.x - camX;
    const g = ctx.createRadialGradient(x, o.y, 1, x, o.y, o.r * 1.8);
    g.addColorStop(0, c0); g.addColorStop(.35, c1); g.addColorStop(.75, c2); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, o.y, o.r * 1.8, 0, Math.PI * 2); ctx.fill();
  }
  for (const f of fireballs) {
    const x = f.x - camX;
    const g = ctx.createRadialGradient(x, f.y, 2, x, f.y, f.r * 1.6);
    g.addColorStop(0, '#fff3c0'); g.addColorStop(.35, '#ffb02e'); g.addColorStop(.7, '#e2401a'); g.addColorStop(1, 'rgba(200,40,10,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, f.y, f.r * 1.6, 0, Math.PI * 2); ctx.fill();
  }
  if (pendant) {
    const x = pendant.x - camX, y = pendant.y + Math.sin(pendant.t * 3) * 4;
    const g = ctx.createRadialGradient(x, y, 2, x, y, 40);
    g.addColorStop(0, 'rgba(255,255,255,.8)'); g.addColorStop(1, 'rgba(200,210,230,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 40, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#c9ced8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 12, y - 22); ctx.lineTo(x, y - 12); ctx.lineTo(x + 12, y - 22); ctx.stroke();
    ctx.fillStyle = '#e6e9f0'; ctx.beginPath(); ctx.arc(x, y, 13, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#8f97a6'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(x - 7, y + 5); ctx.bezierCurveTo(x - 9, y - 6, x + 1, y - 2, x, y + 2); ctx.bezierCurveTo(x - 1, y + 8, x + 9, y + 6, x + 7, y - 6); ctx.stroke();
  }
}

function drawParticles() {
  for (const q of particles) {
    ctx.globalAlpha = clamp(q.life / q.max, 0, 1);
    ctx.fillStyle = q.c; ctx.fillRect(q.x - camX - q.s / 2, q.y - q.s / 2, q.s, q.s);
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'center'; ctx.font = 'bold 17px "Crimson Pro", Georgia, serif';
  for (const t of texts) {
    ctx.globalAlpha = clamp(t.life * 1.5, 0, 1);
    ctx.fillStyle = '#000'; ctx.fillText(t.txt, t.x - camX + 14 + 1, t.y + 1);
    ctx.fillStyle = t.c; ctx.fillText(t.txt, t.x - camX + 14, t.y);
  }
  ctx.globalAlpha = 1;
}

function bar(x, y, w, h, frac, color, back = 'rgba(0,0,0,.55)') {
  ctx.fillStyle = back; roundRect(x, y, w, h, h / 2); ctx.fill();
  if (frac > 0) { ctx.fillStyle = color; roundRect(x, y, Math.max(h, w * clamp(frac, 0, 1)), h, h / 2); ctx.fill(); }
}

function drawHUD() {
  const p = player;
  ctx.fillStyle = 'rgba(14,10,20,.6)'; roundRect(12, 10, 270, 74, 12); ctx.fill();
  ctx.fillStyle = '#e3b75a'; ctx.beginPath(); ctx.arc(46, 46, 24, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a1424'; ctx.textAlign = 'center';
  ctx.font = '11px "Crimson Pro", serif'; ctx.fillText('NÍVEL', 46, 38);
  ctx.font = 'bold 22px Cinzel, serif'; ctx.fillText(p.lvl, 46, 60);
  bar(80, 18, 190, 14, p.hp / maxHp(), p.poison > 0 ? '#7ad35a' : '#e2574c');
  bar(80, 38, 190, 12, p.pe / maxPe(), PODER.cores[2]);
  bar(80, 58, 190, 6, p.xp / xpNeed(), '#e3b75a');
  ctx.textAlign = 'left'; ctx.font = 'bold 12px "Crimson Pro", serif'; ctx.fillStyle = '#fff';
  ctx.fillText('Vida ' + Math.ceil(Math.max(0, p.hp)) + '/' + maxHp(), 86, 29);
  ctx.fillText('Energia ' + Math.floor(p.pe) + '/' + maxPe(), 86, 48);
  ctx.fillStyle = '#b3a88f'; ctx.font = '12px "Crimson Pro", serif';
  ctx.fillText(`${HEROI.nome} · V${p.attr.V} F${p.attr.F} I${p.attr.I} A${p.attr.A}`, 82, 78);

  if (bossActive && boss && !boss.dead) {
    ctx.textAlign = 'center'; ctx.fillStyle = '#ffcf8a'; ctx.font = 'bold 20px Cinzel, serif';
    ctx.fillText(CHEFE_CFG.nome, W / 2, 30);
    bar(W / 2 - 200, 38, 400, 14, boss.fire / boss.max, CHEFE.enraged && CHEFE.enraged(boss) ? '#ff3a1a' : '#ff8a2e');
    ctx.fillStyle = '#ece4d4'; ctx.font = '12px "Crimson Pro", serif'; ctx.fillText(CHEFE_CFG.rotuloVida, W / 2, 49);
  }
  if (banner > 0) {
    const a = clamp(Math.min(banner, 3.6 - banner) * 2, 0, 1);
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(14,10,20,.78)'; roundRect(W / 2 - 300, 120, 600, 132, 14); ctx.fill();
    ctx.strokeStyle = '#e3b75a'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.textAlign = 'center'; ctx.fillStyle = '#ffcf8a'; ctx.font = 'bold 34px Cinzel, serif'; ctx.fillText(CHEFE_CFG.nome, W / 2, 166);
    ctx.fillStyle = '#ece4d4'; ctx.font = 'italic 18px "Crimson Pro", serif';
    ctx.fillText(CHEFE_CFG.frase[0], W / 2, 198);
    ctx.fillText(CHEFE_CFG.frase[1], W / 2, 220);
    ctx.fillStyle = '#9fe7ff'; ctx.font = '16px "Crimson Pro", serif'; ctx.fillText(CHEFE_CFG.dica, W / 2, 242);
    ctx.globalAlpha = 1;
  }
}

function drawTouch() {
  if (!showTouch || state !== 'play') return;
  for (const b of BTN) {
    const on = held(b.id);
    ctx.fillStyle = on ? 'rgba(227,183,90,.45)' : 'rgba(20,16,30,.42)';
    ctx.strokeStyle = on ? '#f5d48a' : 'rgba(236,228,212,.45)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ece4d4'; ctx.textAlign = 'center';
    if (b.label.length === 1) { ctx.font = 'bold 30px sans-serif'; ctx.fillText(b.label, b.x, b.y + 10); }
    else { ctx.font = 'bold 17px "Crimson Pro", serif'; ctx.fillText(b.label, b.x, b.y + 6); }
    if (b.id === 'power' && player.pe < PODER.custo) { ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); }
  }
}

function panel(x, y, w, h) { ctx.fillStyle = 'rgba(14,10,20,.85)'; roundRect(x, y, w, h, 16); ctx.fill(); ctx.strokeStyle = '#e3b75a'; ctx.lineWidth = 1.5; ctx.stroke(); }
function wrap(text, x, y, maxW, lh) {
  const words = text.split(' '); let line = '';
  for (const w of words) { const test = line ? line + ' ' + w : w; if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, x, y); line = w; y += lh; } else line = test; }
  if (line) ctx.fillText(line, x, y);
  return y + lh;
}

function drawTitle() {
  if (ready(titleImg)) {
    const r = Math.max(W / titleImg.naturalWidth, H / titleImg.naturalHeight);
    const w = titleImg.naturalWidth * r, h = titleImg.naturalHeight * r;
    ctx.drawImage(titleImg, (W - w) / 2, (H - h) / 2, w, h);
  } else drawBackground();
  ctx.fillStyle = 'rgba(10,6,16,.62)'; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f5d48a'; ctx.font = 'bold 52px Cinzel, serif'; ctx.fillText('TORNEIO DAS LENDAS', W / 2, 108);
  ctx.fillStyle = '#ece4d4'; ctx.font = '20px "Crimson Pro", serif'; ctx.fillText(`Fase de teste · ${FASE.nome} · com ${HEROI.nome.toLowerCase()}`, W / 2, 142);
  panel(W / 2 - 330, 170, 660, 190);
  ctx.fillStyle = '#ffcf8a'; ctx.font = 'bold 20px Cinzel, serif'; ctx.fillText(CHEFE_CFG.nome.charAt(0) + CHEFE_CFG.nome.slice(1).toLowerCase(), W / 2, 202);
  ctx.fillStyle = '#ece4d4'; ctx.font = 'italic 17px "Crimson Pro", serif';
  const yy = wrap(FASE.descricao, W / 2, 230, 600, 22);
  ctx.fillStyle = '#b3a88f'; ctx.font = '14px "Crimson Pro", serif'; ctx.fillText(FASE.fonte, W / 2, yy + 2);
  const pulse = .6 + Math.sin(time * 4) * .4;
  ctx.globalAlpha = pulse; ctx.fillStyle = '#f5d48a'; ctx.font = 'bold 26px Cinzel, serif';
  ctx.fillText(showTouch ? 'Toque para jogar' : 'Clique ou aperte Enter para jogar', W / 2, 410);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#b3a88f'; ctx.font = '15px "Crimson Pro", serif';
  ctx.fillText(showTouch ? `Use o celular deitado. Botões: ◀ ▶ andar · pular · espada · ${PODER.nome}`
    : `Setas ou A/D andam · ↑, W ou Espaço pulam · J ou Z espada · K ou X ${PODER.nome}`, W / 2, 446);
  ctx.fillText('Derrote as brasas para ganhar XP e subir de nível. No fim, o chefe espera.', W / 2, 470);
}

function drawLevelUp() {
  ctx.fillStyle = 'rgba(10,6,16,.7)'; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center'; ctx.fillStyle = '#f5d48a'; ctx.font = 'bold 40px Cinzel, serif';
  ctx.fillText('SUBIU DE NÍVEL!', W / 2, 120);
  ctx.fillStyle = '#ece4d4'; ctx.font = '20px "Crimson Pro", serif';
  ctx.fillText(`Nível ${player.lvl - pendingLevels + 1}. Escolha um atributo para melhorar:`, W / 2, 160);
  LV_OPTS.forEach((o, i) => {
    const c = lvCard(i);
    panel(c.x, c.y, c.w, c.h);
    ctx.fillStyle = '#e3b75a'; ctx.font = 'bold 44px Cinzel, serif'; ctx.fillText(o.k, c.x + c.w / 2, c.y + 58);
    ctx.fillStyle = '#ece4d4'; ctx.font = 'bold 20px Cinzel, serif'; ctx.fillText(o.nome, c.x + c.w / 2, c.y + 92);
    ctx.fillStyle = '#b3a88f'; ctx.font = '16px "Crimson Pro", serif';
    wrap(o.fx, c.x + c.w / 2, c.y + 120, c.w - 24, 19);
    ctx.fillStyle = '#9fe7ff'; ctx.fillText(`${player.attr[o.k]} → ${player.attr[o.k] + 1}`, c.x + c.w / 2, c.y + c.h - 14);
  });
  ctx.fillStyle = '#b3a88f'; ctx.font = '14px "Crimson Pro", serif';
  ctx.fillText(showTouch ? 'Toque numa carta' : 'Clique numa carta ou aperte 1, 2, 3 ou 4', W / 2, 460);
}

function drawDead() {
  ctx.fillStyle = 'rgba(30,6,6,.7)'; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center'; ctx.fillStyle = '#ff9a8a'; ctx.font = 'bold 42px Cinzel, serif';
  ctx.fillText('Você foi derrotado', W / 2, 220);
  ctx.fillStyle = '#ece4d4'; ctx.font = '20px "Crimson Pro", serif';
  ctx.fillText('Seu nível e seus atributos continuam com você.', W / 2, 262);
  ctx.fillStyle = '#f5d48a'; ctx.font = 'bold 22px Cinzel, serif';
  ctx.fillText(showTouch ? 'Toque para voltar ao último ponto de controle' : 'Clique ou Enter para voltar ao último ponto de controle', W / 2, 320);
}

function drawVictory() {
  const V = FASE.vitoria;
  ctx.fillStyle = 'rgba(10,8,18,.82)'; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center'; ctx.fillStyle = '#f5d48a'; ctx.font = 'bold 48px Cinzel, serif';
  ctx.fillText('VITÓRIA!', W / 2, 96);
  panel(W / 2 - 320, 120, 640, 280);
  ctx.fillStyle = '#ece4d4'; ctx.font = 'italic 19px "Crimson Pro", serif';
  const y = wrap(V.citacao, W / 2, 160, 580, 24);
  ctx.fillStyle = '#b3a88f'; ctx.font = '14px "Crimson Pro", serif'; ctx.fillText(V.fonte, W / 2, y);
  ctx.fillStyle = '#e6e9f0'; ctx.font = 'bold 20px Cinzel, serif'; ctx.fillText(V.premio + ' conquistado', W / 2, y + 40);
  const m = Math.floor(playTime / 60), s = Math.floor(playTime % 60);
  ctx.fillStyle = '#ece4d4'; ctx.font = '18px "Crimson Pro", serif';
  ctx.fillText(`Nível ${player.lvl}  ·  V${player.attr.V} F${player.attr.F} I${player.attr.I} A${player.attr.A}  ·  tempo ${m}:${String(s).padStart(2, '0')}  ·  quedas ${falls}`, W / 2, y + 76);
  ctx.fillStyle = '#9fe7ff'; ctx.fillText('Próximas fases: ' + FASE.proximas, W / 2, y + 108);
  ctx.fillStyle = '#f5d48a'; ctx.font = 'bold 22px Cinzel, serif';
  ctx.fillText(showTouch ? 'Toque para voltar ao início' : 'Clique ou Enter para voltar ao início', W / 2, 450);
}

function drawPortrait() {
  ctx.fillStyle = '#14111c'; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center'; ctx.fillStyle = '#f5d48a'; ctx.font = 'bold 110px Cinzel, serif';
  ctx.fillText('↻', W / 2, 200);
  ctx.font = 'bold 72px Cinzel, serif'; ctx.fillText('Gire o celular', W / 2, 310);
  ctx.fillStyle = '#ece4d4'; ctx.font = '44px "Crimson Pro", serif'; ctx.fillText('Jogue com o celular deitado.', W / 2, 380);
}

function draw() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#0b0910'; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, ox, oy);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
  if (portrait) { drawPortrait(); ctx.restore(); return; }
  if (state === 'title') { drawTitle(); ctx.restore(); return; }
  const sh = shake > 0 ? shake * 14 : 0;
  ctx.save(); ctx.translate(rnd(-sh, sh), rnd(-sh, sh));
  drawBackground(); drawWorld(); drawEnemies();
  if (bossActive && boss) CHEFE.desenhar(boss);
  drawPlayer(); drawProjectiles(); drawParticles();
  ctx.restore();
  drawHUD(); drawTouch();
  if (state === 'levelup') drawLevelUp();
  if (state === 'dead') drawDead();
  if (state === 'victory') drawVictory();
  ctx.restore();
}

// ---------- laço principal ----------
let last = performance.now();
function frame(now) {
  const dt = clamp((now - last) / 1000, 0, 1 / 30); last = now;
  if (state === 'play' && !portrait) update(dt); else time += dt;
  jumpPressed = swordPressed = powerPressed = false;
  draw();
  requestAnimationFrame(frame);
}
if (DEMO || params.has('play')) newGame();
// teste: ?demo&ff=600 avança 600 quadros antes de desenhar (para capturas de tela)
for (let i = 0, n = +params.get('ff') || 0; i < n && state === 'play'; i++) { update(1 / 60); jumpPressed = swordPressed = powerPressed = false; }
requestAnimationFrame(frame);
