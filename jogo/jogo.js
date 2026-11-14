/* Torneio das Lendas · motor do jogo de plataforma com RPG.
   Os dados ficam em dados/herois.js (heróis e poderes) e dados/fases.js (fases e inimigos).
   As imagens ficam em sprites/ (geradas por ferramentas/preparar_sprites.py). Quando falta uma
   imagem, o motor usa o desenho de reserva feito no canvas.
   Parâmetros de teste na URL:
     ?heroi=<chave>  escolhe o herói (ex.: fogo)      ?fase=<chave>  escolhe a fase
     ?boss           começa perto do chefe             ?demo          joga sozinho
     ?chefevida=N    chefe começa com N de vida       ?play&sala     começa na sala secreta
     &ff=600         avança 600 quadros                &touch         mostra os botões de toque
     ?semimagens     ignora as imagens (só desenho de reserva) */
'use strict';

// ---------- tela e escala ----------
const W = 960, H = 540;
const cv = document.getElementById('c');
const tela = cv.getContext('2d', { alpha: false });   // tela opaca: o navegador compõe mais rápido
let ctx = tela;   // contexto atual: a tela, ou a tela interna do mundo enquanto o mundo é desenhado
// O mundo (cenário, luz, personagens) é desenhado numa tela interna de 960x540 e ampliado de uma
// vez, sem borrar: é o jeito normal de pixel art e custa bem menos que desenhar tudo na
// resolução do aparelho. HUD, retrato e botões vão direto na tela, nítidos. ?hd desenha tudo
// na resolução cheia (mais pesado).
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
const FASE_ID = FASES[params.get('fase')] ? params.get('fase') : 'boitata';
const FASE = FASES[FASE_ID];
const GROUND = 460;
const SOLIDS = FASE.solidos, PLATS = FASE.plataformas, CHECKS = FASE.controles, ARENA = FASE.arena;
const HAZARDS = FASE.perigos.map(p => ({ x: p.x, y: GROUND - 14, w: p.w, h: 14 }));
const LEVEL_END = FASE.fim;
// sala secreta embaixo de um buraco (opcional na ficha da fase): piso, paredes e o teto é o próprio
// chão da fase (que vai até GROUND + 140). Só a colisão do herói e dos tiros enxerga a sala.
const SALA = FASE.sala ? { ...FASE.sala, topo: GROUND + 140, fundo: FASE.sala.chao + 60, aperto: 0 } : null;
const SOLIDS_COL = SALA ? SOLIDS.concat([
  { x: SALA.x0, y: SALA.chao, w: SALA.x1 - SALA.x0, h: 60 },
  { x: SALA.x0 - 60, y: GROUND, w: 60, h: SALA.fundo - GROUND },
  { x: SALA.x1, y: GROUND, w: 60, h: SALA.fundo - GROUND },
]) : SOLIDS;
const naSala = p => !!SALA && p.x + p.w > SALA.x0 && p.x < SALA.x1 && p.y > GROUND - 4;
const MOLA_V = 1700;   // pulo do cogumelo-mola: sobe do piso da sala até bem acima do chão
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
      const s = { ...v }, q = v.ver ? '?v=' + v.ver : '';   // versão da imagem: o cache não mistura velha com nova
      if (v.img) { s.image = new Image(); s.image.src = 'sprites/' + v.img + q; }
      if (v.retrato) { s.retratoImg = new Image(); s.retratoImg.src = 'sprites/' + v.retrato + q; }
      if (v.pecas) for (const pc of Object.values(v.pecas)) { pc.image = new Image(); pc.image.src = 'sprites/' + pc.img + q; }
      if (v.camadas) { s.imgs = {}; for (const [c, p] of Object.entries(v.camadas)) { const im = new Image(); im.src = 'sprites/' + p + q; s.imgs[c] = im; } }
      SPR[k] = s;
    }
  } catch (_) { /* sem imagens: usa os desenhos de reserva */ }
}
const ready = im => im && im.complete && im.naturalWidth > 0;
function sprite(key) { const s = SPR[key]; return s && s.image && ready(s.image) ? s : null; }
function layer(key, name) { const s = SPR[key]; return s && s.imgs && ready(s.imgs[name]) ? s.imgs[name] : null; }
loadSprites();

// desenha um quadro de personagem com os pés em (x, y); face = 1 direita, -1 esquerda
const ANIM_RESERVA = { correr: ['parado'], cair: ['pular', 'parado'], pular: ['parado'], espada: ['parado'], poder: ['espada', 'parado'], dano: ['parado'], morrer: ['dano', 'parado'], andar: ['parado'], voar: ['parado'] };
const temAnim = (s, anim) => !!(s.quadros && s.quadros[anim] && s.quadros[anim].length);
function drawFrame(s, anim, t, x, y, face, sx = 1, sy = 1, rot = 0) {
  let fr = s.quadros && s.quadros[anim];
  if (!fr) for (const alt of (ANIM_RESERVA[anim] || [])) if (s.quadros[alt]) { fr = s.quadros[alt]; break; }
  if (!fr) fr = Object.values(s.quadros || {})[0];
  if (!fr || !fr.length) return false;
  const [qx, qy, qw, qh, ax, ay] = fr[Math.floor(Math.max(0, t)) % fr.length];
  const k = s.escala;
  ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot * face); ctx.scale(face * k * sx, k * sy);
  if (s.pixel) ctx.imageSmoothingEnabled = false;   // pixel art: ampliar sem borrar
  ctx.drawImage(s.image, qx, qy, qw, qh, -ax, -ay, qw, qh);
  ctx.restore();
  return true;
}

// ---------- entrada (teclado e toque) ----------
const keys = {};
let jumpPressed = false, swordPressed = false, powerPressed = false, downPressed = false;
const JUMP_KEYS = ['ArrowUp', 'KeyW', 'Space'], SWORD_KEYS = ['KeyJ', 'KeyZ'], POWER_KEYS = ['KeyK', 'KeyX'];
addEventListener('keydown', e => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
  if (e.repeat) return;
  keys[e.code] = true;
  if (state !== 'play') { menuKey(e.code); return; }
  if (JUMP_KEYS.includes(e.code)) jumpPressed = true;
  if (SWORD_KEYS.includes(e.code)) swordPressed = true;
  if (POWER_KEYS.includes(e.code)) powerPressed = true;
  if (e.code === 'ArrowDown' || e.code === 'KeyS') downPressed = true;
});
addEventListener('keyup', e => { keys[e.code] = false; });

const BTN = [
  { id: 'left', x: 82, y: 462, r: 50, label: '◀' },
  { id: 'right', x: 204, y: 462, r: 50, label: '▶' },
  { id: 'sword', x: 752, y: 474, r: 42, label: 'espada' },
  { id: 'power', x: 838, y: 372, r: 42, label: PODER.nome },
  { id: 'jump', x: 872, y: 472, r: 52, label: 'pular' },
  { id: 'down', x: 143, y: 378, r: 34, label: '▼' },
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
  if (id === 'down') downPressed = true;
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
let state = 'title';          // title | mapa | play | levelup | dead | victory
let checkpoint = 0, camX = 0, camY = 0, time = 0, playTime = 0, falls = 0, pendingLevels = 0;
const altarAceso = {};   // índice do ponto de controle -> hora em que acendeu (para o clarão)
let enemies = [], shots = [], fireballs = [], particles = [], texts = [];
let boss = null, bossActive = false, bossDefeated = false, pendant = null, banner = 0, victoryT = 0;
let baus = [];   // baús da fase (abertos continuam abertos até um novo jogo)
let shake = 0;

function makeEnemies() {
  return FASE.inimigos.map(d => {
    const T = INIMIGOS[d.tipo];
    const e = { tipo: d.tipo, T, w: T.w, h: T.h, hp: d.vida, max: d.vida, flash: 0 };
    if (T.mov === 'patrulha') Object.assign(e, { x: d.x, y: GROUND - T.h, x1: d.x1, x2: d.x2, vx: d.vel });
    else Object.assign(e, { bx: d.x, by: d.y, x: d.x, y: d.y, t: d.t || 0 });
    return e;
  }).concat(guardiaoDaSala());
}
// guardião da sala secreta (ex.: o mímico), parado no lugar do baú
function guardiaoDaSala() {
  const g = SALA && SALA.guardiao, T = g && INIMIGOS[g.tipo];
  if (!T) return [];
  return [{ tipo: g.tipo, T, w: T.w, h: T.h, hp: g.vida, max: g.vida, flash: 0, x: g.x - T.w / 2, y: SALA.chao - T.h,
    vx: 0, vy: 0, estado: 'dorme', t: 0, pulo: 0, face: 1, boca: 0, premio: g.premio }];
}

// ---------- itens (2 espaços: ataque e livre; guardados no navegador) ----------
function carregarItens() { try { return { ataque: 'espada', livre: null, ...JSON.parse(localStorage.getItem('tdl_itens') || '{}') }; } catch (_) { return { ataque: 'espada', livre: null }; } }
let itens = carregarItens();
if (params.has('espada')) itens.ataque = 'espada';   // teste: começa sem a lança
const arma = () => ARMAS[itens.ataque] || ARMAS.espada;
function equipar(id) {
  const A = ARMAS[id]; if (!A) return;
  itens.ataque = id;
  try { localStorage.setItem('tdl_itens', JSON.stringify(itens)); } catch (_) { /* sem armazenamento */ }
  floatText(player.x - 80, player.y - 50, A.texto || A.nome + '!', '#ffe28a');
  burst(player.x + 14, player.y + 20, 30, ['#ffe28a', '#f5c542', '#fff6d0'], 220, 1, 60, 3);
}
let drops = [];   // prêmios caídos no chão esperando o herói pegar

function newGame() {
  Object.assign(player, { lvl: 1, xp: 0, attr: { ...HEROI.attr } });
  enemies = makeEnemies();
  checkpoint = 0; playTime = 0; falls = 0; pendingLevels = 0; drops = [];
  bossDefeated = false; pendant = null;
  baus = (FASE.baus || []).map(b => ({ ...b, aberto: false, t: 0 }));
  if (START_BOSS) {
    checkpoint = CHECKS.length - 1; enemies = [];
    player.lvl = 3; for (const k of ['V', 'F', 'I']) player.attr[k] += 1;
  }
  respawn();
  if (params.has('sala') && SALA) {   // teste: começa dentro da sala secreta
    Object.assign(player, { x: SALA.mola - 160, y: SALA.chao - player.h, inv: 0 });
    camX = SALA.x0; camY = SALA.fundo - H;
  }
  if (params.has('x')) { player.x = +params.get('x'); camX = clamp(player.x - W * 0.4, 0, LEVEL_END - W); }   // teste: começar em x
  state = 'play';
}

function respawn() {
  Object.assign(player, { x: CHECKS[checkpoint], y: GROUND - 44, vx: 0, vy: 0, inv: 1.2, poison: 0, face: 1, swordT: 0 });
  player.hp = maxHp(); player.pe = maxPe();
  shots = []; fireballs = [];
  if (bossActive && !bossDefeated) { bossActive = false; boss = null; }
  camX = clamp(player.x - W * 0.4, 0, LEVEL_END - W); camY = 0;
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
let deadAt = 0;
function die() { player.hp = 0; state = 'dead'; deadAt = time; pointers.clear(); }

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

CHEFES.boitata_terra = (() => {
  // Versão 4 do Boitatá (2026-11-13), guardada para outra fase: cobra de fogo imensa que vive debaixo da terra. O corpo é mais comprido que a tela e
  // segue o rastro da cabeça, como uma cobra de verdade: por onde a cabeça passa, o corpo passa
  // depois. A parte que está debaixo da terra não aparece. Ataques (sempre com aviso: a terra racha
  // e brilha onde ela vai sair):
  //  - salto: sai embaixo do jogador, passa num arco por cima da arena e mergulha do outro lado
  //    (fica chão em chamas onde ela entrou e saiu);
  //  - rastejo: atravessa a arena em ondas, entrando e saindo do chão; para escapar, fique embaixo
  //    de um arco ou no vão onde ela está debaixo da terra;
  //  - ergue: sai alta do chão, cospe rajadas de bolas de fogo e dá o bote; a cabeça fica cravada
  //    no chão por um tempo (hora de bater: dano dobrado).
  const enraged = b => b.fire < b.max * 0.35;
  const COMP = 3000;            // comprimento do corpo (mais de três telas)
  const PASSO = 8;              // espaçamento dos pontos do rastro
  const FUNDO = GROUND + 240;   // profundidade em que ela anda debaixo da terra
  const PADRAO = ['ergue', 'salto', 'rastejo', 'salto', 'ergue', 'rastejo'];
  const MEIO = (ARENA.x0 + ARENA.x1) / 2;
  // grossura ao longo do corpo (s = distância a partir da cabeça)
  // pescoço fino perto da cabeça (20), engrossa até 46 e afina de novo até o rabo
  const raio = s => { if (s < 320) { const u = s / 320; return 20 + 26 * u * u * (3 - 2 * u); } return Math.max(14, 46 - Math.max(0, s - 900) / (COMP - 900) * 32); };
  // pose da cabeça (a mesma no desenho e no acerto). Cabeça da versão 4: busto com o pescoço
  // descendo até um corte; pescocos = [x, y do corte, grossura, ângulo do pescoço]. O corte vai na
  // ponta do corpo e a cabeça gira para o pescoço do desenho seguir o corpo.
  function poseCabeca(b) {
    const S = sprite(b.cfg.sprite), P = S && S.partes, cab = b.corpo[0];
    if (!P || !P.cabeca) return null;
    const bravo = ['cospe', 'prep', 'bote', 'cravada'].includes(b.state);
    const nome = bravo && P.cabeca_ataque ? 'cabeca_ataque' : 'cabeca', q = P[nome];
    const pc = (S.pescocos && S.pescocos[nome]) || [.45, .5, .5];
    let a = b.lado > 0 ? b.ang : Math.PI - b.ang;
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    const novo = pc.length > 3;
    const k = (cab.r * (novo ? 2.2 : 1.75)) / (pc[2] * q[3]);
    const rot = novo ? clamp(a - pc[3], -1, .65) : clamp(a, -.9, .9);
    return { S, nome, q, k, rot, novo, ax: (novo ? 0 : -8) - pc[0] * q[2] * k, ay: -pc[1] * q[3] * k };
  }
  // centro do crânio no mundo (para morder e para levar golpe) e o raio dele
  function centroCabeca(b) {
    const cab = b.corpo[0], z = poseCabeca(b);
    if (!z) return { x: cab.x, y: cab.y, r: 36 };
    const lx = z.ax + z.q[2] * z.k * (z.novo ? .62 : .5), ly = z.ay + z.q[3] * z.k * (z.novo ? .38 : .5);
    const c = Math.cos(z.rot), s = Math.sin(z.rot), e = b.lado > 0 ? 1 : -1;
    return { x: cab.x + e * (lx * c - ly * s), y: cab.y + lx * s + ly * c, r: Math.max(30, z.q[3] * z.k * .36) };
  }
  const acima = g => g.y - g.r < GROUND;   // gomo (ao menos em parte) acima da terra

  // põe a cobra inteira debaixo da terra, com a cabeça embaixo de x e o corpo estendido para trás
  function enterrar(b, x, dir) {
    b.hx = x; b.hy = FUNDO; b.rastro = [];
    for (let i = 0; i <= COMP / PASSO + 2; i++) b.rastro.push({ x: x - dir * i * PASSO, y: FUNDO + i * .5 });
  }
  // a cabeça vai até (x, y); o rastro ganha um ponto a cada PASSO e perde o fim do rabo
  function andar(b, x, y) {
    let h = b.rastro[0], d = Math.hypot(x - h.x, y - h.y);
    while (d >= PASSO) {
      const k = PASSO / d;
      h = { x: h.x + (x - h.x) * k, y: h.y + (y - h.y) * k };
      b.rastro.unshift(h); d -= PASSO;
    }
    b.hx = x; b.hy = y;
    const max = Math.ceil(COMP / PASSO) + 3;
    if (b.rastro.length > max) b.rastro.length = max;
  }
  // a cabeça volta pelo próprio rastro (o corpo desliza de volta para dentro da terra)
  function recuar(b, dist) {
    while (dist > 0 && b.rastro.length > 3) {
      const a = b.rastro[0], d = Math.hypot(b.hx - a.x, b.hy - a.y);
      if (d > dist) { const k = dist / d; b.hx += (a.x - b.hx) * k; b.hy += (a.y - b.hy) * k; return; }
      dist -= d; b.hx = a.x; b.hy = a.y; b.rastro.shift();
      const r = b.rastro[b.rastro.length - 1];
      b.rastro.push({ x: r.x, y: r.y + PASSO });   // o rabo continua lá embaixo
    }
  }
  // rota: lista de pontos que a cabeça percorre. A velocidade não pula: parte de `ini` (ou da
  // velocidade atual) e acelera até `vel` (acel = rapidez da mudança); com `freia` ela desacelera
  // nos últimos `freia` px; com `topo` ela perde velocidade ao subir (como algo jogado para cima).
  function rota(b, pts, vel, o = {}) {
    b.rota = pts; b.ri = 0; b.vel = vel; b.acel = o.acel || 6; b.freia = o.freia || 0; b.topo = o.topo || 0;
    if (o.ini !== undefined) b.vcur = o.ini;
    b.suf = new Array(pts.length).fill(0);   // distância de cada ponto até o fim da rota
    for (let i = pts.length - 2; i >= 0; i--) b.suf[i] = b.suf[i + 1] + Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
  }
  function seguir(b, dt) {   // devolve true quando chega ao fim da rota
    let alvoV = b.vel;
    if (b.ri < b.rota.length) {
      const p = b.rota[b.ri], resta = Math.hypot(p.x - b.hx, p.y - b.hy) + b.suf[b.ri];
      if (b.freia) alvoV *= clamp(Math.sqrt(resta / b.freia), .22, 1);
      if (b.topo) alvoV *= .62 + .38 * clamp((b.hy - b.topo) / (GROUND - b.topo), 0, 1);
    }
    b.vcur += (alvoV - b.vcur) * (1 - Math.exp(-b.acel * dt));
    let passo = b.vcur * dt;
    while (b.ri < b.rota.length) {
      const alvo = b.rota[b.ri], d = Math.hypot(alvo.x - b.hx, alvo.y - b.hy);
      if (d <= passo) { andar(b, alvo.x, alvo.y); passo -= d; b.ri++; }
      else { andar(b, b.hx + (alvo.x - b.hx) * passo / d, b.hy + (alvo.y - b.hy) * passo / d); return false; }
    }
    return true;
  }
  // gomos do corpo (a cada 2 pontos do rastro), da cabeça para o rabo; o balanço mexe só a parte da frente
  function gomos(b) {
    const out = [], R = b.rastro, s0 = Math.hypot(R[0].x - b.hx, R[0].y - b.hy);
    const pega = (x, y, s) => {   // o balanço some aos poucos ao longo de 420 px (sem "joelho")
      const u = clamp(s / 420, 0, 1), w = 1 - u * u * (3 - 2 * u);
      out.push({ x: x + b.ox * w, y: y + b.oy * w, r: raio(s), s });
    };
    pega(b.hx, b.hy, 0);
    for (let i = 0; i < R.length; i += 2) pega(R[i].x, R[i].y, s0 + i * PASSO);
    // alisa as quinas do caminho (o corpo faz curvas, não dobras); a cabeça e o rabo ficam no lugar
    for (let passada = 0; passada < 8; passada++) {
      let ax = out[0].x, ay = out[0].y;
      for (let i = 1; i < out.length - 1; i++) {
        const g = out[i], nx = (ax + 2 * g.x + out[i + 1].x) / 4, ny = (ay + 2 * g.y + out[i + 1].y) / 4;
        ax = g.x; ay = g.y; g.x = nx; g.y = ny;
      }
    }
    return out;
  }
  // onde a rota fura o chão dentro da arena (para as rachaduras de aviso)
  function furos(pts) {
    const xs = [];
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], c = pts[i];
      if ((a.y < GROUND) !== (c.y < GROUND)) {
        const x = a.x + (c.x - a.x) * (GROUND - a.y) / (c.y - a.y);
        if (x > ARENA.x0 + 10 && x < ARENA.x1 - 10) xs.push(x);
      }
    }
    return xs;
  }

  // escolhe o próximo ataque e arma o aviso
  function proxima(b) {
    b.passo = (b.passo + 1) % PADRAO.length;
    const tipo = PADRAO[b.passo], furia = enraged(b), sp = furia ? 1.3 : 1;
    const pcx = player.x + player.w / 2;
    b.tipo = tipo; b.state = 'aviso'; b.st = 0; b.ox = b.oy = 0;
    b.avisoT = furia ? .6 : .95;
    if (tipo === 'salto') {
      const xs = clamp(pcx, ARENA.x0 + 60, ARENA.x1 - 60), dir = pcx < MEIO ? 1 : -1, xe = xs + dir * 640;
      const topo = GROUND - (furia ? 350 : 320), pts = [{ x: xs, y: GROUND + 40 }];
      for (let i = 1; i <= 40; i++) { const t = i / 40; pts.push({ x: xs + (xe - xs) * t, y: GROUND + 40 - (GROUND + 40 - topo) * 4 * t * (1 - t) }); }
      pts.push({ x: xe + dir * 50, y: GROUND + 130 }, { x: xe + dir * 90, y: FUNDO });
      enterrar(b, xs, -dir); b.dir = dir;
      rota(b, pts, 760 * sp, { ini: 380 * sp, acel: 5, topo }); b.depois = 'ataque'; b.avisos = [xs];
    } else if (tipo === 'rastejo') {
      const dir = pcx < MEIO ? -1 : 1;   // vem do lado oposto ao jogador: dá tempo de ver
      const xa = dir > 0 ? ARENA.x0 - 140 : ARENA.x1 + 140, xb = dir > 0 ? ARENA.x1 + 140 : ARENA.x0 - 140;
      const lambda = furia ? 380 : 460, fase = rnd(0, Math.PI * 2), pts = [];
      for (let x = xa; dir > 0 ? x <= xb : x >= xb; x += dir * 12) {
        const u = Math.abs(x - xa);
        pts.push({ x, y: GROUND - 30 - 130 * Math.sin(fase + Math.PI * 2 * u / lambda) });
      }
      pts.push({ x: xb + dir * 40, y: FUNDO });
      enterrar(b, xa, dir); b.dir = dir;
      rota(b, pts, 470 * sp, { ini: 470 * sp }); b.depois = 'ataque'; b.avisos = furos(pts);
      b.avisoT += .35;   // o rastejo pede mais tempo para escolher onde ficar
    } else {   // ergue: sai do lado longe do jogador
      const dir = pcx < MEIO ? -1 : 1, x = dir < 0 ? ARENA.x1 - 170 : ARENA.x0 + 170;
      const pts = [{ x, y: GROUND + 40 }, { x, y: GROUND - 110 }];
      for (let i = 1; i <= 10; i++) { const t = i / 10; pts.push({ x: x + dir * 110 * (1 - Math.cos(t * Math.PI / 2)), y: GROUND - 110 - 110 * Math.sin(t * Math.PI / 2) }); }   // sobe e curva para a frente
      enterrar(b, x, dir); b.dir = dir;
      rota(b, pts, 620 * sp, { ini: 420 * sp, freia: 220 }); b.depois = 'subir'; b.avisos = [x];
      b.botes = furia ? 2 : 1;
    }
  }
  // mergulha e anda debaixo da terra até o corpo todo sumir
  function mergulhar(b, sp) {
    const d = b.dir;
    const pts = [];
    if (b.hy < GROUND + 60) {   // ainda fora da terra: mergulha numa curva para a frente e para baixo
      const x0 = b.hx, y0 = b.hy, cx = x0 + d * 150, cy = y0 - 30, x1 = x0 + d * 200, y1 = GROUND + 110;
      for (let i = 1; i <= 14; i++) { const t = i / 14, u = 1 - t; pts.push({ x: u * u * x0 + 2 * u * t * cx + t * t * x1, y: u * u * y0 + 2 * u * t * cy + t * t * y1 }); }
    }
    const xf = pts.length ? pts[pts.length - 1].x : b.hx;
    pts.push({ x: xf + d * 90, y: FUNDO }, { x: xf + d * 5000, y: FUNDO });
    rota(b, pts, 1150 * sp, { acel: 3.5 });
    b.state = 'mergulho'; b.st = 0;
  }

  return {
    enraged,
    criar(cfg) {
      const b = { cfg, hx: 0, hy: FUNDO, ox: 0, oy: 0, rastro: [], corpo: [], fire: cfg.vida, max: cfg.vida,
        state: 'enter', st: 0, passo: -1, tipo: '', flash: 0, dead: false, deadT: 0, popped: 0, chamas: [], avisos: [],
        dir: -1, lado: -1, esc: -1, vcur: 0, ang: Math.PI, rota: [], ri: 0, vel: 0, volley: 0, botes: 0, boteD: 0, recuado: 0, avisoT: 1, depois: '' };
      enterrar(b, ARENA.x1 + 300, -1); b.corpo = gomos(b);
      return b;
    },
    atualizar(b, dt) {
      b.st += dt; b.flash = Math.max(0, b.flash - dt);
      const furia = enraged(b), sp = furia ? 1.3 : 1, D = b.cfg.dano;
      const pcx = player.x + player.w / 2, pcy = player.y + player.h / 2;
      for (const c of b.chamas) c.t -= dt;
      b.chamas = b.chamas.filter(c => c.t > 0);

      if (b.dead) {   // vira pó prateado da cabeça para o rabo (só o que está acima da terra)
        b.deadT += dt;
        const vis = b.corpo.filter(acima), want = Math.floor(b.deadT / 0.035);
        while (b.popped < Math.min(want, vis.length + 1)) {
          const p = vis[Math.min(b.popped, vis.length - 1)];
          if (p && b.popped % 2 === 0) burst(p.x, p.y, 14, SILVER, 240, 1, 120, 4.5);
          b.popped++; shake = .1;
        }
        if (b.popped > vis.length && !pendant) pendant = { x: clamp(b.morteX, ARENA.x0 + 120, ARENA.x1 - 120), y: GROUND - 120, vy: -200, t: 0 };
        return;
      }

      const yAntes = b.hy;
      let ox = 0, oy = 0;   // balanço desejado da cabeça
      if (b.state === 'enter') {
        shake = Math.max(shake, .06);
        if (Math.random() < dt * 40) burst(rnd(ARENA.x0, ARENA.x1), GROUND - 2, 2, ['#6b5446', '#3d2f27'], 120, .5, 400, 3);
        if (b.st > 1.6) proxima(b);
      } else if (b.state === 'aviso') {
        shake = Math.max(shake, .035);
        for (const x of b.avisos) if (Math.random() < dt * 30) {
          const fogo = Math.random() < .4;
          particles.push({ x: x + rnd(-40, 40), y: GROUND - 2, vx: rnd(-40, 40), vy: rnd(-260, -120), life: .6, max: .6, c: fogo ? FIRE[(Math.random() * 3) | 0] : '#5a4034', s: rnd(2, 4), g: fogo ? -40 : 600 });
        }
        if (b.st > b.avisoT) { b.state = b.depois; b.st = 0; if (b.tipo === 'salto') b.chamas.push({ x: b.avisos[0], t: 3 }); }
      } else if (b.state === 'ataque') {   // salto e rastejo: percorre a rota
        if (seguir(b, dt)) mergulhar(b, sp);
        if (b.tipo === 'salto' && yAntes < GROUND && b.hy >= GROUND && b.hx > ARENA.x0 && b.hx < ARENA.x1) {
          b.chamas.push({ x: b.hx, t: 3 }); shake = .2; burst(b.hx, GROUND - 4, 18, ['#6b5446', '#3d2f27', ...FIRE], 260, .7, 500, 4);
        }
      } else if (b.state === 'subir') {
        if (seguir(b, dt)) { b.state = 'cospe'; b.st = 0; b.volley = 0; }
      } else if (b.state === 'cospe') {
        ox = Math.sin(b.st * 1.8) * 30; oy = Math.sin(b.st * 2.7) * 16;
        const first = .6, gap = furia ? .55 : .8, volleys = furia ? 3 : 2;
        if (b.volley < volleys && b.st > first + b.volley * gap) {
          const n = furia ? 5 : 3, hx = b.hx + b.ox, hy = b.hy + b.oy, base = Math.atan2(pcy - hy, pcx - hx);
          for (let i = 0; i < n; i++) {
            const a = base + (i - (n - 1) / 2) * 0.2, s = 380 * sp;
            fireballs.push({ x: hx + b.dir * 30, y: hy + 10, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 18, life: 4, dano: D.bolaDeFogo });
          }
          burst(hx + b.dir * 30, hy + 10, 14, FIRE, 200, .5);
          b.volley++;
        }
        if (b.st > first + volleys * gap + .4) { b.state = 'prep'; b.st = 0; }
      } else if (b.state === 'prep') {   // encolhe e treme: aviso do bote
        ox = -b.dir * 45 + Math.sin(time * 55) * 4; oy = -25;
        if (b.st > (furia ? .5 : .8)) {
          // a ponta do corpo para um pouco antes do herói: quem crava no chão é o crânio, que fica à frente
          const tx = clamp(pcx - b.dir * 55, ARENA.x0 + 30, ARENA.x1 - 30), ty = GROUND - 24;
          // o bote é uma curva: a cabeça avança para a frente e desce (continua a curva do pescoço)
          const x0 = b.hx, y0 = b.hy, cx = x0 + (tx - x0) * .55, cy = y0 - 35, pts = [];
          for (let i = 1; i <= 16; i++) { const t = i / 16, u = 1 - t; pts.push({ x: u * u * x0 + 2 * u * t * cx + t * t * tx, y: u * u * y0 + 2 * u * t * cy + t * t * ty }); }
          b.boteD = 0; for (let i = 0, a = { x: x0, y: y0 }; i < pts.length; a = pts[i++]) b.boteD += Math.hypot(pts[i].x - a.x, pts[i].y - a.y);
          b.recuado = 0;
          rota(b, pts, 1450 * sp, { ini: 150, acel: 11 }); b.state = 'bote'; b.st = 0;
        }
      } else if (b.state === 'bote') {
        if (seguir(b, dt)) {
          b.state = 'cravada'; b.st = 0; shake = .25; b.vcur = 0;
          burst(b.hx, GROUND - 4, 16, ['#6b5446', '#3d2f27'], 220, .6, 500, 4);
        }
      } else if (b.state === 'cravada') {   // presa no chão: a hora de bater
        ox = Math.sin(time * 30) * 2;
        if (b.st > (furia ? .9 : 1.4)) { b.state = 'recua'; b.st = 0; }
      } else if (b.state === 'recua') {
        // recua devagar no começo, mais rápido no meio e devagar de novo no fim
        const prog = b.recuado / Math.max(1, b.boteD), d = Math.min(Math.max(1, 820 * sp * Math.sin(Math.PI * clamp(prog, .06, .94)) * dt), b.boteD - b.recuado);
        recuar(b, d); b.recuado += d;
        if (b.recuado >= b.boteD - .5) {
          if (--b.botes > 0) { b.state = 'cospe'; b.st = 1.2; b.volley = 1; }
          else mergulhar(b, sp);
        }
      } else if (b.state === 'mergulho') {
        seguir(b, dt);
        if (b.st > .3 && !b.corpo.some(acima)) proxima(b);
      }
      // balanço suave (sem pulo quando muda de estado; no bote volta ao eixo rápido)
      const kb = 1 - Math.exp(-(b.state === 'bote' ? 20 : 6) * dt);
      b.ox += (ox - b.ox) * kb; b.oy += (oy - b.oy) * kb;

      b.corpo = gomos(b);
      const C = b.corpo, cab = C[0], atras = C[3] || C[C.length - 1];
      // a cabeça gira aos poucos e, ao trocar de lado, vira (encolhe e abre) em vez de espelhar de uma vez
      let da = Math.atan2(cab.y - atras.y, cab.x - atras.x) - b.ang;
      while (da > Math.PI) da -= Math.PI * 2;
      while (da < -Math.PI) da += Math.PI * 2;
      b.ang += da * (1 - Math.exp(-(b.state === 'bote' ? 22 : 10) * dt));
      if (Math.abs(Math.cos(b.ang)) > .35) b.lado = Math.cos(b.ang) > 0 ? 1 : -1;
      b.esc += (b.lado - b.esc) * (1 - Math.exp(-12 * dt));
      b.morteX = cab.x;

      // contato: cabeça (mordida; veneno no bote), corpo em brasa e chão em chamas
      const cc = centroCabeca(b); b.cc = cc;
      if (cc.y - cc.r < GROUND && circleRect(cc.x, cc.y, cc.r * .8, player)) {
        if (b.state === 'bote') hurtPlayer(D.veneno, cc.x, D.venenoSeg); else hurtPlayer(D.mordida, cc.x);
      }
      for (let i = 2; i < C.length; i += 2) {
        const g = C[i];
        if (g.y - g.r > GROUND) continue;
        if (circleRect(g.x, g.y, g.r * .85, player)) { hurtPlayer(D.corpo, g.x); break; }
      }
      if (player.onGround) for (const c of b.chamas) if (Math.abs(pcx - c.x) < 34) { hurtPlayer(D.chama, c.x); break; }

      // efeitos: veneno nas presas, fogo na cabeça, brasas no corpo, terra onde ela fura o chão
      if (cc.y - cc.r < GROUND) {
        if ((b.state === 'prep' || b.state === 'bote' || b.state === 'cravada') && Math.random() < dt * 30)
          particles.push({ x: cc.x + b.lado * rnd(20, 50), y: cc.y + cc.r * .5, vx: rnd(-10, 10), vy: rnd(20, 60), life: .6, max: .6, c: Math.random() < .5 ? '#8dff6a' : '#c8ff9a', s: rnd(2, 3), g: 400 });
        if (Math.random() < dt * 22) particles.push({ x: cc.x + rnd(-30, 30), y: cc.y - cc.r, vx: rnd(-25, 25), vy: rnd(-140, -70), life: .8, max: .8, c: FIRE[(Math.random() * 3) | 0], s: rnd(2, 3.5), g: -30 });
      }
      const vis = C.filter(acima);
      if (vis.length && Math.random() < dt * (furia ? 45 : 28) * Math.min(1, vis.length / 20)) {
        const s = vis[(Math.random() * vis.length) | 0];
        particles.push({ x: s.x + rnd(-10, 10), y: s.y - s.r * .7, vx: rnd(-20, 20), vy: rnd(-90, -40), life: .7, max: .7, c: FIRE[(Math.random() * 3) | 0], s: rnd(2, 4), g: -40 });
      }
      if (b.vel > 0 && ['ataque', 'subir', 'bote', 'recua', 'mergulho'].includes(b.state)) {
        for (let i = 1; i < C.length; i++) {
          const a = C[i - 1], c = C[i];
          if ((a.y < GROUND) !== (c.y < GROUND) && Math.random() < dt * 25) {
            const x = a.x + (c.x - a.x) * (GROUND - a.y) / (c.y - a.y);
            particles.push({ x: x + rnd(-a.r, a.r), y: GROUND - 4, vx: rnd(-90, 90), vy: rnd(-280, -120), life: .6, max: .6, c: Math.random() < .3 ? FIRE[1] : (Math.random() < .5 ? '#6b5446' : '#3d2f27'), s: rnd(2, 4), g: 700 });
          }
        }
      }
    },
    acertoCirculo(b, x, y, r) {
      const cc = b.cc || centroCabeca(b);
      if (cc.y - cc.r < GROUND && y < GROUND && Math.hypot(x - cc.x, y - cc.y) < cc.r + r) return { x: cc.x, y: cc.y, mult: b.state === 'cravada' ? 2 : 1.5 };
      for (let i = 2; i < b.corpo.length; i += 2) { const s = b.corpo[i]; if (acima(s) && y < GROUND && Math.hypot(x - s.x, y - s.y) < s.r + r) return { x: s.x, y: s.y, mult: .6 }; }
      return null;
    },
    acertoRet(b, rr) {
      const cc = b.cc || centroCabeca(b);
      if (cc.y - cc.r < GROUND && circleRect(cc.x, cc.y, cc.r, rr)) return { x: cc.x, y: Math.min(cc.y, GROUND - 10), mult: b.state === 'cravada' ? 2 : 1.5 };
      for (let i = 2; i < b.corpo.length; i += 2) { const s = b.corpo[i]; if (acima(s) && circleRect(s.x, s.y, s.r, rr)) return { x: s.x, y: Math.min(s.y, GROUND - 10), mult: .6 }; }
      return null;
    },
    luzes(b) {
      const L = b.chamas.map(c => [c.x, GROUND - 20, 120 + Math.sin(time * 11 + c.x) * 10, '255,120,40']);
      if (b.dead) return b.popped > 3 ? L : L.concat([[b.corpo[0].x, b.corpo[0].y, 230, '255,150,50']]);
      for (const x of (b.state === 'aviso' ? b.avisos : [])) L.push([x, GROUND, 110 + Math.sin(time * 14) * 30, '255,110,30']);
      const C = b.corpo;
      const cc = b.cc || C[0];
      if (cc.y - (cc.r || 30) < GROUND) L.push([cc.x, cc.y, 240 + Math.sin(time * 9) * 12, '255,150,50']);
      let ult = -1e9;
      for (const g of C) if (acima(g) && g.s - ult > 280) { L.push([g.x, Math.min(g.y, GROUND - 20), 170 + Math.sin(time * 5 + g.s) * 10, '255,110,30']); ult = g.s; }
      return L;
    },
    desenhar(b) {
      const rage = enraged(b), S = sprite(b.cfg.sprite), P = S && S.partes, C = b.corpo;
      // aviso: a terra racha e brilha onde ela vai sair
      if (b.state === 'aviso') {
        const pulso = .45 + .55 * Math.abs(Math.sin(time * 12)), cresce = Math.min(1, b.st / b.avisoT);
        for (const x0 of b.avisos) {
          const x = Math.round(x0 - camX);
          ctx.globalAlpha = pulso;
          ctx.strokeStyle = '#ff8a2a'; ctx.lineWidth = 3; ctx.lineJoin = 'miter';
          ctx.beginPath();
          const meia = 18 + 40 * cresce;
          ctx.moveTo(x - meia, GROUND + 2);
          for (let i = 1; i <= 6; i++) ctx.lineTo(x - meia + i * meia / 3, GROUND + (i % 2 ? -4 : 5));
          ctx.stroke();
          ctx.globalCompositeOperation = 'lighter';
          const g = ctx.createRadialGradient(x, GROUND, 2, x, GROUND, 60 + 30 * cresce);
          g.addColorStop(0, 'rgba(255,140,40,.55)'); g.addColorStop(1, 'rgba(255,60,10,0)');
          ctx.fillStyle = g; ctx.fillRect(x - 100, GROUND - 100, 200, 120);
          ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
        }
      }
      // chão em chamas
      for (const c of b.chamas) {
        const a = Math.min(1, c.t * 1.5);
        ctx.globalAlpha = a;
        if (!drawFogo(c.x - camX, GROUND + relevo(c.x), 70, c.x * .37))
          for (let j = 0; j < 4; j++) chamaPixel(Math.round(c.x - camX - 27 + j * 18), GROUND + 2, 14, 18 + Math.sin(time * 10 + j * 2 + c.x) * 7, time * 11 + j);
        ctx.globalAlpha = 1;
      }
      if (b.dead && b.popped > C.filter(acima).length) return;

      // só o que está acima da terra aparece
      ctx.save(); ctx.beginPath(); ctx.rect(-50, -400, W + 100, GROUND + 3 + 400); ctx.clip();
      const pp = b.dead ? b.popped : 0;
      let fim = C.length - 1;
      while (fim > 1 && C[fim].y - C[fim].r > GROUND + 4 && C[fim - 1].y - C[fim - 1].r > GROUND + 4) fim--;
      // na morte some a partir da cabeça
      let ini = 0;
      if (pp > 0) { let n = 0; while (ini < fim && n < pp) { if (acima(C[ini])) n++; ini++; } }
      const faixa = P && P.gomo_corpo;
      if (faixa) {
        const [qx, qy, qw, qh] = faixa;
        // contorno preto por baixo da textura
        ctx.strokeStyle = '#080305'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for (let i = fim - 1; i >= ini; i--) {
          const a0 = C[i], a1 = C[i + 1];
          if (a0.y - a0.r > GROUND + 4 && a1.y - a1.r > GROUND + 4) continue;
          ctx.lineWidth = a0.r * 2 + 6;
          ctx.beginPath(); ctx.moveTo(Math.round(a0.x - camX), Math.round(a0.y)); ctx.lineTo(Math.round(a1.x - camX), Math.round(a1.y)); ctx.stroke();
        }
        ctx.lineCap = 'butt';
        // faixa de escamas presa ao corpo (a contagem começa na cabeça: a textura anda junto)
        const acc = [0];
        for (let i = 0; i < fim; i++) { const d = Math.hypot(C[i + 1].x - C[i].x, C[i + 1].y - C[i].y); acc.push(acc[i] + Math.max(1, d * qh / (C[i].r * 2))); }
        ctx.imageSmoothingEnabled = !S.pixel;
        for (let i = fim - 1; i >= ini; i--) {
          const a0 = C[i], a1 = C[i + 1];
          if (a0.y - a0.r > GROUND + 4 && a1.y - a1.r > GROUND + 4) continue;
          const d = Math.hypot(a1.x - a0.x, a1.y - a0.y), r = a0.r, k = qh / (r * 2), sw = acc[i + 1] - acc[i];
          let sx = acc[i] % qw, feito = 0;
          ctx.save(); ctx.translate(Math.round(a0.x - camX), Math.round(a0.y)); ctx.rotate(Math.atan2(a1.y - a0.y, a1.x - a0.x));
          if (b.dir > 0) ctx.scale(1, -1);   // a barriga (embaixo na faixa) fica sempre do lado de baixo/de dentro
          while (feito < sw - .01) {   // a fatia pode dar a volta no fim da faixa
            const pedaco = Math.min(sw - feito, qw - sx);
            ctx.drawImage(S.image, qx + sx, qy, pedaco, qh, feito / k - .5, -r, pedaco / k + 1.5, r * 2);
            feito += pedaco; sx = (sx + pedaco) % qw;
          }
          ctx.restore();
        }
        ctx.imageSmoothingEnabled = true;
      } else {
        for (let i = fim; i >= Math.max(ini, 1); i--) {
          const s = C[i]; if (!acima(s)) continue;
          const x = Math.round(s.x - camX), y = Math.round(s.y), g = ctx.createRadialGradient(x, y, 1, x, y, s.r);
          g.addColorStop(0, '#ffb347'); g.addColorStop(.35, '#d4471a'); g.addColorStop(.8, '#4a1408'); g.addColorStop(1, '#1e0804');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, s.r, 0, Math.PI * 2); ctx.fill();
          if (i % 6 === 0) flame(x, y - s.r * .6, s.r * .9, s.r * (rage ? 1.5 : 1.15), time * 12 + i * 1.7);
        }
      }
      // cabeça
      const cab = C[0];
      if (pp === 0 && cab.y - 40 < GROUND) {
        ctx.save(); ctx.translate(Math.round(cab.x - camX), Math.round(cab.y));
        ctx.scale(Math.abs(b.esc) < .08 ? (b.esc < 0 ? -.08 : .08) : b.esc, 1);
        const z = poseCabeca(b);
        if (z) {
          const [qx, qy, qw, qh] = z.q, k = z.k, hx0 = z.ax, hy0 = z.ay, larg = qw * k;
          ctx.rotate(z.rot);
          ctx.imageSmoothingEnabled = !S.pixel;
          ctx.drawImage(S.image, qx, qy, qw, qh, hx0, hy0, qw * k, qh * k);
          // fogo vivo no alto da cabeça
          const topoC = z.novo ? hy0 + qh * k * .1 : hy0 + qh * k * .3;
          for (let j = 0; j < 5; j++) {
            const fx = hx0 + larg * (z.novo ? .3 + j * .11 : .1 + j * .11), alt = (rage ? 30 : 22) + Math.sin(time * 9 + j * 1.9) * 7 + Math.sin(time * 23 + j) * 3;
            chamaPixel(fx, topoC + 3, 13, alt, time * 11 + j * 1.7);
          }
          if (b.flash > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, b.flash * 3) * .6; ctx.drawImage(S.image, qx, qy, qw, qh, hx0, hy0, qw * k, qh * k); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
          ctx.imageSmoothingEnabled = true;
        } else {
          flame(-6, -22, 48, rage ? 74 : 56, time * 10);
          const hg = ctx.createRadialGradient(0, 0, 2, 0, 0, 44);
          hg.addColorStop(0, '#ffb347'); hg.addColorStop(.4, '#c9401a'); hg.addColorStop(1, '#2a0a04');
          ctx.fillStyle = hg; ctx.beginPath(); ctx.ellipse(6, 0, 46, 31, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#fff7d0'; ctx.beginPath(); ctx.arc(18, -10, 5, 0, Math.PI * 2); ctx.fill();
          if (b.flash > 0) { ctx.fillStyle = 'rgba(200,235,255,.7)'; ctx.beginPath(); ctx.ellipse(6, 0, 48, 33, 0, 0, Math.PI * 2); ctx.fill(); }
        }
        ctx.restore();
      }
      ctx.restore();   // fim do recorte do chão
      // montinhos de terra onde o corpo fura o chão
      for (let i = Math.max(ini, 1); i <= fim; i++) {
        const a = C[i - 1], c = C[i];
        if ((a.y < GROUND) === (c.y < GROUND)) continue;
        const x = Math.round(a.x + (c.x - a.x) * (GROUND - a.y) / (c.y - a.y) - camX), w = a.r * 1.5;
        ctx.fillStyle = '#1e140f'; ctx.beginPath(); ctx.ellipse(x, GROUND + 3, w, 9, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#5a4034'; ctx.fillRect(x - w * .7, GROUND - 4, w * 1.4, 3);
        ctx.fillStyle = '#3d2f27'; ctx.fillRect(x - w * .9, GROUND - 1, w * 1.8, 3);
      }
    },
  };
})();
CHEFES.boitata = (() => {
  // Boitatá enrolado (versão 5, 2026-11-14, pedido do Erick): o rolo fica parado no lado direito da
  // arena, como na imagem da cobra inteira (arte v4 recortada: `corpo` sem o pescoço e sem o rabo).
  // O pescoço é um tubo com a faixa de escamas que sai do alto do rolo e estica até a cabeça; o rabo
  // é outro tubo que sai da frente do rolo. Ataques: rajadas de bolas de fogo, bote com o pescoço
  // esticando (a cabeça fica cravada no chão: hora de bater) e rabada em quem chega perto do rolo.
  const enraged = b => b.fire < b.max * 0.35;
  const Z = 2;                 // escala da arte do rolo (2 px de tela por px da arte)
  const AFUNDA = 6;            // o rolo afunda um pouco no chão (não flutua)
  const CAB_K = 3;             // escala da cabeça
  const PASSO = 12;            // espaçamento dos gomos do pescoço e do rabo
  const RABO = 250;            // comprimento do rabo
  const PADRAO = ['idle', 'cospe', 'idle', 'prep', 'idle', 'cospe', 'prep'];
  const ease = t => t * t * (3 - 2 * t);

  // rolo e pontos de onde saem o pescoço e o rabo (fração da imagem do rolo, na ficha do chefe)
  function geo(b) {
    const S = sprite(b.cfg.sprite), c = S && S.partes && S.partes.corpo;
    const qw = c ? c[2] : 173, qh = c ? c[3] : 94, w = qw * Z, h = qh * Z;
    const A = b.cfg.ancoras || { pescoco: [.191, 0, .153], rabo: [.017, .723] };
    const x0 = b.cx - w / 2, y0 = GROUND + AFUNDA - h + b.subir;
    return { S, c, w, h, x0, y0, nx: x0 + A.pescoco[0] * w, ny: y0 + A.pescoco[1] * h + 3, r0: A.pescoco[2] * w * 1.04,
      rx: x0 + A.rabo[0] * w + 6, ry: y0 + A.rabo[1] * h };
  }
  // cabeça (versão 4: busto; pescocos = [x, y do corte, grossura, ângulo do pescoço]). Virada para a
  // esquerda: no desenho ela é espelhada. rot > 0 abaixa o focinho.
  function cab(b) {
    const S = sprite(b.cfg.sprite), P = S && S.partes;
    if (!P || !P.cabeca) return null;
    const bravo = ['cospe', 'prep', 'bote', 'cravada'].includes(b.state);
    const nome = bravo && P.cabeca_ataque ? 'cabeca_ataque' : 'cabeca', q = P[nome];
    const pc = (S.pescocos && S.pescocos[nome]) || [.15, 1, .42, -1];
    const k = CAB_K;
    return { S, nome, q, k, ax: -pc[0] * q[2] * k, ay: -pc[1] * q[3] * k, angP: pc.length > 3 ? pc[3] : -1, rFim: pc[2] * q[3] * k / 2 };
  }
  const mundo = (lx, ly, rot) => { const c = Math.cos(rot), s = Math.sin(rot); return { x: -(lx * c - ly * s), y: lx * s + ly * c }; };
  // centro do crânio em relação ao corte do pescoço, e a direção do pescoço (do corte para o corpo)
  function cranio(b, rot) {
    const z = cab(b);
    if (!z) return { dx: -50, dy: -20, r: 40 };
    const v = mundo(z.ax + z.q[2] * z.k * .62, z.ay + z.q[3] * z.k * .38, rot);
    return { dx: v.x, dy: v.y, r: z.q[3] * z.k * .36 };
  }
  function direcaoPescoco(b, rot) {
    const z = cab(b), a = z ? z.angP : -1;
    return mundo(-Math.cos(a), -Math.sin(a), rot);
  }
  // pescoço: curva (Bézier) do alto do rolo até o corte da cabeça; chega na cabeça na direção do
  // pescoço do desenho (a emenda não quebra). Gomos da cabeça para o rolo.
  function pescoco(b, G) {
    const z = cab(b), rFim = z ? z.rFim * 1.08 : 26;
    const P0 = { x: G.nx, y: G.ny }, P3 = { x: b.hx, y: b.hy };
    const dist = Math.hypot(P3.x - P0.x, P3.y - P0.y);
    const t0 = { x: .47, y: -.88 }, v = direcaoPescoco(b, b.rot);
    const P1 = { x: P0.x + t0.x * dist * .45, y: P0.y + t0.y * dist * .45 };
    const P2 = { x: P3.x + v.x * Math.max(60, dist * .4), y: P3.y + v.y * Math.max(60, dist * .4) };
    const n = clamp(Math.ceil(dist * 1.35 / PASSO), 8, 90), out = [];
    for (let i = 0; i <= n; i++) {
      const t = 1 - i / n, u = 1 - t;   // i = 0 na cabeça
      const x = u * u * u * P0.x + 3 * u * u * t * P1.x + 3 * u * t * t * P2.x + t * t * t * P3.x;
      const y = u * u * u * P0.y + 3 * u * u * t * P1.y + 3 * u * t * t * P2.y + t * t * t * P3.y;
      out.push({ x, y, r: rFim + (G.r0 - rFim) * ease(i / n) });
    }
    return out;
  }
  // rabo: corrente de gomos saindo da frente do rolo; a0 = direção no começo, curva = quanto vira
  // por gomo, estica = comprimento relativo
  function rabo(b, G) {
    const n = Math.ceil(RABO * b.rEst / PASSO), out = [];
    let x = G.rx, y = G.ry, a = b.rA0;
    for (let i = 0; i <= n; i++) {
      const r = 4 + 20 * (1 - i / n);
      out.push({ x, y: Math.min(y, GROUND + 2 - r), r });
      x += Math.cos(a) * PASSO; y += Math.sin(a) * PASSO; a += b.rCurva;
    }
    return out;
  }
  // tubo com a faixa de escamas (contorno preto por baixo); vira = barriga do outro lado
  function tubo(C, S, vira, ate = C.length - 1, de = 0, parte = 'tudo') {
    const faixa = S && S.partes && S.partes.gomo_corpo;
    if (!faixa) {
      for (let i = ate; i >= de; i--) {
        const s = C[i], x = Math.round(s.x - camX), y = Math.round(s.y), g = ctx.createRadialGradient(x, y, 1, x, y, s.r);
        g.addColorStop(0, '#ffb347'); g.addColorStop(.4, '#c9401a'); g.addColorStop(1, '#2a0a04');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, s.r, 0, Math.PI * 2); ctx.fill();
      }
      return;
    }
    const [qx, qy, qw, qh] = faixa;
    if (parte !== 'textura') {
      ctx.strokeStyle = '#080305'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (let i = ate - 1; i >= de; i--) {
        const a0 = C[i], a1 = C[i + 1];
        ctx.lineWidth = a0.r * 2 + 6;
        ctx.beginPath(); ctx.moveTo(Math.round(a0.x - camX), Math.round(a0.y)); ctx.lineTo(Math.round(a1.x - camX), Math.round(a1.y)); ctx.stroke();
      }
      ctx.lineCap = 'butt';
      if (parte === 'contorno') return;
    }
    const acc = [0];
    for (let i = 0; i < ate; i++) acc.push(acc[i] + Math.max(1, Math.hypot(C[i + 1].x - C[i].x, C[i + 1].y - C[i].y) * qh / (C[i].r * 2)));
    ctx.imageSmoothingEnabled = false;
    for (let i = ate - 1; i >= de; i--) {
      const a0 = C[i], a1 = C[i + 1], r = a0.r, k = qh / (r * 2), sw = acc[i + 1] - acc[i];
      let sx = acc[i] % qw, feito = 0;
      ctx.save(); ctx.translate(Math.round(a0.x - camX), Math.round(a0.y)); ctx.rotate(Math.atan2(a1.y - a0.y, a1.x - a0.x));
      if (vira) ctx.scale(1, -1);
      while (feito < sw - .01) {
        const pedaco = Math.min(sw - feito, qw - sx);
        ctx.drawImage(S.image, qx + sx, qy, pedaco, qh, feito / k - .5, -r, pedaco / k + 1.5, r * 2);
        feito += pedaco; sx = (sx + pedaco) % qw;
      }
      ctx.restore();
    }
    ctx.imageSmoothingEnabled = true;
  }
  // posições da cabeça (o corte do pescoço) em cada pose, relativas ao rolo
  const pose = (G, nome) => ({
    descanso: { x: G.x0 + 30, y: G.y0 - 45 },
    cospe: { x: G.x0 + 60, y: G.y0 - 62 },
    prep: { x: G.x0 + 95, y: G.y0 - 78 },
  })[nome];
  function proximo(b) {
    b.passo = (b.passo + 1) % PADRAO.length;
    b.state = PADRAO[b.passo]; b.st = 0; b.volley = 0;
    if (b.state === 'prep') b.botes = enraged(b) ? 2 : 1;
  }

  return {
    enraged,
    criar(cfg) {
      const cx = ARENA.x1 - 190;
      const b = { cfg, cx, subir: 260, hx: 0, hy: 0, vx: 0, vy: 0, rot: 0, fire: cfg.vida, max: cfg.vida,
        state: 'enter', st: 0, passo: -1, flash: 0, volley: 0, botes: 0, dead: false, deadT: 0,
        rA0: Math.PI - .25, rCurva: .06, rEst: 1, rCd: 0, bote: null, neck: [], tail: [], cc: { x: 0, y: 0, r: 40 }, lado: -1 };
      const G = geo(b), P = pose(G, 'descanso'); b.hx = P.x; b.hy = P.y;
      b.neck = pescoco(b, G); b.tail = rabo(b, G);
      return b;
    },
    atualizar(b, dt) {
      b.st += dt; b.flash = Math.max(0, b.flash - dt); b.rCd = Math.max(0, b.rCd - dt);
      const furia = enraged(b), sp = furia ? 1.3 : 1, D = b.cfg.dano;
      const pcx = player.x + player.w / 2, pcy = player.y + player.h / 2;
      const G = geo(b);
      if (b.dead) {
        b.deadT += dt;
        const n = Math.floor(b.deadT / .04);
        if (n > (b.ultPo || 0)) {   // pó prateado: cabeça, pescoço (da cabeça para o rolo), rabo e rolo
          b.ultPo = n;
          const lista = [b.cc, ...b.neck, ...b.tail.slice().reverse()];
          const p = lista[Math.min(n, lista.length - 1)];
          if (n < lista.length) { burst(p.x, p.y, 12, SILVER, 220, 1, 120, 4); shake = .08; }
          else if (n < lista.length + 14) { burst(G.x0 + Math.random() * G.w, G.y0 + Math.random() * G.h, 16, SILVER, 240, 1, 120, 4.5); shake = .1; }
        }
        if (b.deadT > (b.neck.length + b.tail.length + 16) * .04 && !pendant) pendant = { x: G.x0 - 40, y: GROUND - 120, vy: -200, t: 0 };
        return;
      }

      let alvo = null, rotAlvo = .1, mola = 7;
      const T = b.state;
      if (T === 'enter') {
        b.subir = Math.max(0, 260 * (1 - ease(Math.min(1, b.st / 1.8)))); shake = Math.max(shake, .05);
        alvo = pose(G, 'descanso');
        if (b.st > 2.2) proximo(b);
      } else if (T === 'idle') {
        const P = pose(G, 'descanso');
        alvo = { x: P.x + Math.sin(time * 1.1) * 26, y: P.y + Math.sin(time * 1.7) * 12 };
        rotAlvo = .1 + Math.sin(time * 1.3) * .08;
        // chegou perto do rolo: rabada
        if (pcx > G.x0 - 230 && b.rCd <= 0) { b.state = 'rabada'; b.st = 0; }
        else if (b.st > (furia ? 1.0 : 1.6)) proximo(b);
      } else if (T === 'cospe') {
        const P = pose(G, 'cospe');
        alvo = { x: P.x + Math.sin(b.st * 2) * 10, y: P.y };
        const c = b.cc, mira = Math.atan2(pcy - c.y, c.x - pcx);   // > 0: herói abaixo
        rotAlvo = clamp(mira, -.3, .75);
        const first = .6, gap = furia ? .55 : .8, volleys = furia ? 3 : 2;
        if (b.volley < volleys && b.st > first + b.volley * gap) {
          const n = furia ? 5 : 3, bx = c.x - c.r * .9, by = c.y + c.r * .35, base = Math.atan2(pcy - by, pcx - bx);
          for (let i = 0; i < n; i++) {
            const a = base + (i - (n - 1) / 2) * .2, s = 380 * sp;
            fireballs.push({ x: bx, y: by, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 18, life: 4, dano: D.bolaDeFogo });
          }
          burst(bx, by, 14, FIRE, 200, .5);
          b.volley++;
        }
        if (b.st > first + volleys * gap + .4) proximo(b);
      } else if (T === 'prep') {   // encolhe para trás e treme: aviso do bote
        const P = pose(G, 'prep');
        alvo = { x: P.x + Math.sin(time * 55) * 4, y: P.y }; rotAlvo = -.25; mola = 9;
        if (b.st > (furia ? .5 : .8)) {
          const rB = .55, c = cranio(b, rB);
          const tx = clamp(pcx, Math.max(ARENA.x0 + 40, G.x0 - 640), G.x0 - 60) - c.dx, ty = GROUND - c.r * .55 - c.dy;
          b.bote = { x0: b.hx, y0: b.hy, cx: b.hx + (tx - b.hx) * .45, cy: Math.min(b.hy, ty) - 70, x1: tx, y1: ty };
          b.state = 'bote'; b.st = 0;
        }
      } else if (T === 'bote' || T === 'cravada' || T === 'recua') {
        const B = b.bote, ida = .26 / sp, fica = furia ? .85 : 1.2, volta = .6;
        let u;
        if (T === 'bote') { u = Math.min(1, b.st / ida); u = u * u; rotAlvo = .55; mola = 0; if (b.st >= ida) { b.state = 'cravada'; b.st = 0; shake = .25; burst(b.cc.x, GROUND - 4, 18, ['#6b5446', '#3d2f27'], 240, .6, 500, 4); } }
        else if (T === 'cravada') { u = 1; rotAlvo = .6; if (b.st >= fica) { b.state = 'recua'; b.st = 0; } }
        else { u = 1 - ease(Math.min(1, b.st / volta)); rotAlvo = .4 * u; if (b.st >= volta) { if (--b.botes > 0) { b.state = 'prep'; b.st = .3; } else proximo(b); } }
        const w = 1 - u;
        b.hx = w * w * B.x0 + 2 * w * u * B.cx + u * u * B.x1 + (T === 'cravada' ? Math.sin(time * 40) * 2 : 0);
        b.hy = w * w * B.y0 + 2 * w * u * B.cy + u * u * B.y1;
        b.vx = b.vy = 0;
      } else if (T === 'rabada') {
        const P = pose(G, 'descanso');
        alvo = { x: P.x + 20, y: P.y - 20 }; rotAlvo = .3;   // a cabeça olha para o herói
        const prep = furia ? .35 : .5, golpe = .16, fica = .35, volta = .5;
        if (b.st >= prep + golpe + fica + volta) { b.rCd = furia ? 1.2 : 2; b.state = 'idle'; b.st = 0; }
      }
      // cabeça segue o alvo com uma mola (balança e assenta, sem tranco)
      if (alvo && mola > 0) {
        const w = mola, z = .8;
        b.vx += (w * w * (alvo.x - b.hx) - 2 * z * w * b.vx) * dt; b.vy += (w * w * (alvo.y - b.hy) - 2 * z * w * b.vy) * dt;
        b.hx += b.vx * dt; b.hy += b.vy * dt;
      }
      b.rot += (rotAlvo - b.rot) * (1 - Math.exp(-(T === 'bote' ? 20 : 8) * dt));

      // rabo: parado curvado no chão; na rabada levanta, treme e bate no chão
      {
        const furiaR = furia ? .35 : .5, golpe = .16, fica = .35, volta = .5;
        let a0 = Math.PI - .25 + Math.sin(time * 1.4) * .05, cv = .06 + Math.sin(time * 1.1) * .012, est = 1;
        if (T === 'rabada') {
          const t = b.st, cima = { a: Math.PI + .95, c: -.02, e: 1.05 }, chao = { a: Math.PI - .32, c: -.012, e: 1.3 };
          const mix = (A, B, k) => { a0 = A.a + (B.a - A.a) * k; cv = A.c + (B.c - A.c) * k; est = A.e + (B.e - A.e) * k; };
          const repouso = { a: a0, c: cv, e: 1 };
          if (t < furiaR) { mix(repouso, cima, ease(t / furiaR)); a0 += Math.sin(time * 45) * .04; }
          else if (t < furiaR + golpe) { const k = (t - furiaR) / golpe; mix(cima, chao, k * k); }
          else if (t < furiaR + golpe + fica) {
            mix(chao, chao, 1);
            if (!b.bateu) { b.bateu = true; shake = .3; const p = b.tail[b.tail.length - 1]; burst(p.x, GROUND - 4, 22, ['#6b5446', '#3d2f27', ...FIRE], 280, .7, 500, 4); }
          } else mix(chao, repouso, ease(Math.min(1, (t - furiaR - golpe - fica) / volta)));
          if (t < furiaR + golpe) b.bateu = false;
          // acerta só enquanto desce e logo depois de bater
          if (t > furiaR && t < furiaR + golpe + .08)
            for (const s of b.tail) if (circleRect(s.x, s.y, s.r + 4, player)) { hurtPlayer(D.rabada, s.x + 40); break; }
        }
        b.rA0 = a0; b.rCurva = cv; b.rEst = est;
      }

      b.neck = pescoco(b, G); b.tail = rabo(b, G);
      const c = cranio(b, b.rot); b.cc = { x: b.hx + c.dx, y: b.hy + c.dy, r: c.r };

      // contato: cabeça (mordida; veneno no bote), pescoço e rolo em brasa
      if (T !== 'enter') {
        if (circleRect(b.cc.x, b.cc.y, b.cc.r * .8, player)) { if (T === 'bote') hurtPlayer(D.veneno, b.cc.x, D.venenoSeg); else hurtPlayer(D.mordida, b.cc.x); }
        for (let i = 3; i < b.neck.length; i += 3) { const s = b.neck[i]; if (circleRect(s.x, s.y, s.r * .8, player)) { hurtPlayer(D.corpo, s.x); break; } }
        if (circleRect(G.x0 + G.w * .55, GROUND - G.h * .4, G.h * .55, player)) hurtPlayer(D.corpo, G.x0 + G.w * .55);
      }
      // efeitos: veneno nas presas, fogo na cabeça, brasas no corpo
      if ((T === 'prep' || T === 'bote' || T === 'cravada') && Math.random() < dt * 30)
        particles.push({ x: b.cc.x - b.cc.r * rnd(.6, 1), y: b.cc.y + b.cc.r * .5, vx: rnd(-10, 10), vy: rnd(20, 60), life: .6, max: .6, c: Math.random() < .5 ? '#8dff6a' : '#c8ff9a', s: rnd(2, 3), g: 400 });
      if (Math.random() < dt * 22) particles.push({ x: b.cc.x + rnd(-30, 30), y: b.cc.y - b.cc.r, vx: rnd(-25, 25), vy: rnd(-140, -70), life: .8, max: .8, c: FIRE[(Math.random() * 3) | 0], s: rnd(2, 3.5), g: -30 });
      if (Math.random() < dt * (furia ? 40 : 24)) {
        const em = Math.random() < .5 && b.neck.length ? b.neck[(Math.random() * b.neck.length) | 0] : { x: G.x0 + Math.random() * G.w, y: G.y0 + G.h * (.2 + Math.random() * .3), r: 10 };
        particles.push({ x: em.x + rnd(-10, 10), y: em.y - em.r * .6, vx: rnd(-20, 20), vy: rnd(-90, -40), life: .7, max: .7, c: FIRE[(Math.random() * 3) | 0], s: rnd(2, 4), g: -40 });
      }
    },
    acertoCirculo(b, x, y, r) {
      const c = b.cc, G = geo(b);
      if (Math.hypot(x - c.x, y - c.y) < c.r + r) return { x: c.x, y: c.y, mult: b.state === 'cravada' ? 2 : 1.5 };
      for (let i = 2; i < b.neck.length; i += 2) { const s = b.neck[i]; if (Math.hypot(x - s.x, y - s.y) < s.r + r) return { x: s.x, y: s.y, mult: .8 }; }
      for (const s of b.tail) if (Math.hypot(x - s.x, y - s.y) < s.r + r) return { x: s.x, y: s.y, mult: .6 };
      if (x > G.x0 && x < G.x0 + G.w && y > G.y0 + 10) return { x, y, mult: .6 };
      return null;
    },
    acertoRet(b, rr) {
      const c = b.cc, G = geo(b);
      if (circleRect(c.x, c.y, c.r, rr)) return { x: c.x, y: Math.min(c.y, GROUND - 10), mult: b.state === 'cravada' ? 2 : 1.5 };
      for (let i = 2; i < b.neck.length; i += 2) { const s = b.neck[i]; if (circleRect(s.x, s.y, s.r, rr)) return { x: s.x, y: s.y, mult: .8 }; }
      for (const s of b.tail) if (circleRect(s.x, s.y, s.r, rr)) return { x: s.x, y: s.y, mult: .6 };
      if (overlap(rr, { x: G.x0 + 10, y: G.y0 + 10, w: G.w - 20, h: G.h - 10 })) return { x: rr.x + rr.w / 2, y: rr.y + rr.h / 2, mult: .6 };
      return null;
    },
    luzes(b) {
      const G = geo(b);
      if (b.dead && b.deadT > 2) return [];
      return [[b.cc.x, b.cc.y, 240 + Math.sin(time * 9) * 12, '255,150,50'], [G.x0 + G.w * .55, G.y0 + G.h * .5, 250 + Math.sin(time * 5) * 10, '255,110,30'],
        ...(b.neck.length > 8 ? [[b.neck[b.neck.length >> 1].x, b.neck[b.neck.length >> 1].y, 170, '255,110,30']] : [])];
    },
    desenhar(b) {
      const rage = enraged(b), G = geo(b), S = G.S, C = b.neck;
      const morto = b.dead ? Math.floor(b.deadT / .04) : 0;
      const somePesc = Math.max(0, morto - 1), someRabo = Math.max(0, morto - 1 - C.length);
      const somaRolo = b.dead ? clamp((b.deadT - (C.length + b.tail.length) * .04) / .6, 0, 1) : 0;
      ctx.save(); ctx.beginPath(); ctx.rect(-50, -400, W + 100, GROUND + 4 + 400); ctx.clip();
      // sombra no chão
      const sg = ctx.createRadialGradient(b.cx - camX, GROUND + 6, 10, b.cx - camX, GROUND + 6, G.w * .62);
      sg.addColorStop(0, `rgba(0,0,0,${.55 * (1 - somaRolo)})`); sg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(b.cx - camX, GROUND + 6, G.w * .62, 24, 0, 0, Math.PI * 2); ctx.fill();
      // rabo (atrás do rolo), pescoço (sai de dentro do rolo, desenhado antes dele) e o rolo
      if (someRabo < b.tail.length) tubo(b.tail, S, true, b.tail.length - 1 - someRabo);
      // contorno do pescoço, depois o rolo (cobre a ponta redonda do contorno que entra nele) e por
      // fim a textura do pescoço por cima
      if (somePesc < C.length - 1) tubo(C, S, false, C.length - 1, somePesc, 'contorno');
      if (G.c && somaRolo < 1) {
        const [qx, qy, qw, qh] = G.c;
        ctx.globalAlpha = 1 - somaRolo; ctx.imageSmoothingEnabled = false;
        ctx.drawImage(S.image, qx, qy, qw, qh, Math.round(G.x0 - camX), Math.round(G.y0), G.w, G.h);
        if (b.flash > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, b.flash * 3) * .35; ctx.drawImage(S.image, qx, qy, qw, qh, Math.round(G.x0 - camX), Math.round(G.y0), G.w, G.h); ctx.globalCompositeOperation = 'source-over'; }
        ctx.globalAlpha = 1; ctx.imageSmoothingEnabled = true;
      } else if (!G.c) {
        ctx.fillStyle = '#2a0e08'; ctx.beginPath(); ctx.ellipse(b.cx - camX, GROUND - 70, G.w / 2, 80, 0, 0, Math.PI * 2); ctx.fill();
      }
      // o pescoço sai do corte no alto do rolo e passa na frente dele, como na arte
      if (somePesc < C.length - 1) tubo(C, S, false, C.length - 1, somePesc, 'textura');
      // cabeça
      const z = cab(b);
      if (!b.dead || morto < 1) {
        if (z) {
          const [qx, qy, qw, qh] = z.q, k = z.k;
          ctx.save(); ctx.translate(Math.round(b.hx - camX), Math.round(b.hy)); ctx.scale(-1, 1); ctx.rotate(b.rot);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(S.image, qx, qy, qw, qh, z.ax, z.ay, qw * k, qh * k);
          const topoC = z.ay + qh * k * .1;
          for (let j = 0; j < 5; j++) {
            const alt = (rage ? 30 : 22) + Math.sin(time * 9 + j * 1.9) * 7 + Math.sin(time * 23 + j) * 3;
            chamaPixel(z.ax + qw * k * (.3 + j * .11), topoC + 3, 13, alt, time * 11 + j * 1.7);
          }
          if (b.flash > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, b.flash * 3) * .6; ctx.drawImage(S.image, qx, qy, qw, qh, z.ax, z.ay, qw * k, qh * k); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
          ctx.imageSmoothingEnabled = true; ctx.restore();
        } else {
          const c = b.cc; flame(c.x - camX, c.y - 20, 48, rage ? 74 : 56, time * 10);
          ctx.fillStyle = '#c9401a'; ctx.beginPath(); ctx.ellipse(c.x - camX, c.y, c.r, c.r * .7, 0, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.restore();
    },
  };
})();
const CHEFE = CHEFES[CHEFE_CFG.tipo];

function startBoss() {
  encontrar(FASE_ID);
  bossActive = true;
  boss = CHEFE.criar(CHEFE_CFG);
  if (params.has('chefevida')) boss.fire = +params.get('chefevida');   // teste: chefe com pouca vida
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
    b.dead = true; b.deadT = 0; fireballs = []; contarMorte(FASE_ID);
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
    if (boss && (boss.state === 'bote' || boss.state === 'prep') && Math.abs(boss.hx - pc) < 200) jumpPressed = true;
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
  if (p.jumpBuf > 0 && p.coyote > 0) {
    if (p.naMola) {   // cogumelo-mola: pulo enorme (sem o pulo curto de soltar o botão)
      p.vy = -MOLA_V; p.molaT = 1.2; SALA.aperto = 1; shake = .12;
      burst(SALA.mola, SALA.chao - 20, 24, ['#7ff5e4', '#3fb7a8', '#e8fffb'], 260, .8, 200, 3);
    } else { p.vy = -JUMP_V; burst(p.x + 14, p.y + p.h, 6, ['#6b5446', '#3d2f27'], 90, .35, 200, 3); }
    p.jumpBuf = 0; p.coyote = 0;
  }
  p.molaT = Math.max(0, (p.molaT || 0) - dt);
  p.vy += GRAV * dt * (!jumpHeld && p.vy < 0 && !p.molaT ? 1.4 : 1);
  p.vy = Math.min(p.vy, 1000);

  p.x += p.vx * dt;
  for (const s of SOLIDS_COL) if (overlap(p, s)) { if (p.vx > 0) p.x = s.x - p.w; else if (p.vx < 0) p.x = s.x + s.w; p.vx = 0; }
  const minX = bossActive ? ARENA.x0 : 0, maxX = bossActive ? ARENA.x1 - p.w : LEVEL_END - p.w;
  p.x = clamp(p.x, minX, maxX);
  const prevBottom = p.y + p.h, wasGround = p.onGround, fallV = p.vy;
  p.y += p.vy * dt;
  p.onGround = false;
  for (const s of SOLIDS_COL) if (overlap(p, s)) {
    if (p.vy > 0) { p.y = s.y - p.h; p.onGround = true; } else if (p.vy < 0) p.y = s.y + s.h;
    p.vy = 0;
  }
  // em cima do cogumelo-mola: cair nele dá um quique (é a dica de que ele é uma mola)
  p.naMola = !!SALA && p.onGround && Math.abs(p.y + p.h - SALA.chao) < 2 && Math.abs(p.x + p.w / 2 - SALA.mola) < 30;
  if (p.naMola && !wasGround && fallV > 300) { p.vy = -fallV * .45; p.onGround = false; p.naMola = false; SALA.aperto = .7; }
  // ▼ (ou seta para baixo) em cima de uma plataforma: desce por ela
  if (downPressed && p.onPlat && wasGround) { p.dropT = 0.22; p.onPlat = false; }
  p.dropT = Math.max(0, (p.dropT || 0) - dt);
  if (!p.onGround) p.onPlat = false;
  if (p.vy >= 0 && p.dropT <= 0) for (const pl of PLATS) {
    if (p.x + p.w > pl.x && p.x < pl.x + pl.w && prevBottom <= pl.y + 2 && p.y + p.h >= pl.y) { p.y = pl.y - p.h; p.vy = 0; p.onGround = true; p.onPlat = pl; }
  }
  // plano do desenho: 1 = caminho da frente (chão), 0 = galhos; no ar mantém o que era
  const alvoPlano = p.onPlat ? 0 : p.onGround ? 1 : p.plano ?? 1;
  p.plano = (p.plano ?? 1) + (alvoPlano - (p.plano ?? 1)) * Math.min(1, dt * 10);
  if (p.onGround && !wasGround && fallV > 350) p.landT = 0.14;
  p.landT = Math.max(0, p.landT - dt);
  p.anim += Math.abs(p.vx) * dt * 0.05;

  if (p.y > (naSala(p) ? SALA.fundo + 80 : H + 80)) {
    falls++;
    const hp = p.hp - 15;
    floatText(CHECKS[checkpoint], GROUND - 80, 'Cuidado com os buracos!', '#ffb3a8');
    Object.assign(p, { x: bossActive ? ARENA.x0 + 40 : CHECKS[checkpoint], y: GROUND - 44, vx: 0, vy: 0, inv: 1.2 });
    p.hp = hp;
    if (p.hp <= 0) die();
    return;
  }

  for (let i = CHECKS.length - 1; i > checkpoint; i--) if (p.x > CHECKS[i]) {
    checkpoint = i; altarAceso[i] = time;
    // o altar acende: faíscas douradas, vida e energia cheias
    burst(CHECKS[i], GROUND - 40, 40, ['#ffe9a8', '#ffd060', '#fff6d8'], 200, 1.2, -40, 3);
    p.hp = maxHp(); p.pe = maxPe(); p.poison = 0;
    floatText(CHECKS[i] - 60, GROUND - 110, 'Altar aceso · vida restaurada', '#ffe08a');
    break;
  }
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
  const A = arma();
  if (swordPressed && p.swordCd <= 0) { p.swordT = 0.18; p.swordCd = A.recarga; p.hitSet.clear(); burst(p.x + p.w / 2 + p.face * (A.alcance * .6), p.y + 24, 5, ['#eef6ff', '#c4d8ee'], 110, .25, 0, 2); }
  if (p.swordT > 0) {
    // a espada pega o corpo todo à frente; a lança é uma estocada fina e bem mais longa
    const r = A.altura === 'fina'
      ? { x: p.face > 0 ? p.x + p.w - 6 : p.x + 6 - A.alcance, y: p.y + 8, w: A.alcance, h: 26 }
      : { x: p.face > 0 ? p.x + p.w - 4 : p.x + 4 - A.alcance, y: p.y - 8, w: A.alcance, h: p.h + 12 };
    const dano = swordDmg() + (A.bonus || 0);
    for (const e of enemies) if (!p.hitSet.has(e) && overlap(r, e)) { p.hitSet.add(e); damageEnemy(e, dano, 'espada'); }
    if (!p.hitSet.has('boss') && bossHittable()) { const hit = CHEFE.acertoRet(boss, r); if (hit) { p.hitSet.add('boss'); damageBoss(hit, dano, 'espada'); } }
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
  if (e.dead) return;   // já derrotado (ex.: golpe durante a tela de subir de nível)
  const res = resistOf(e.T.resist, kind);
  if (res === 0) { floatText(e.x, e.y - 8, 'imune!', '#ffb36b'); return; }
  if (e.estado === 'dorme') { e.estado = 'acorda'; e.t = 0; }   // bater no mímico dormindo o acorda
  const d = Math.max(1, Math.round(dmg * res));
  e.hp -= d; e.flash = .12;
  const cores = kind === 'espada' ? FIRE : PODER.rastro;
  floatText(e.x, e.y - 8, '-' + d, res > 1 ? '#9fe7ff' : '#fff');
  burst(e.x + e.w / 2, e.y + e.h / 2, 8, cores, 150, .4);
  if (e.hp <= 0) {
    e.dead = true; contarMorte(e.tipo);
    burst(e.x + e.w / 2, e.y + e.h / 2, 18, cores, 220, .7);
    if (e.premio) {   // guardião: solta o prêmio da sala e enche a vida
      drops.push({ tipo: e.premio, x: e.x + e.w / 2, y: e.y + e.h - 20, vy: -320, t: 0 });
      player.hp = maxHp(); player.pe = maxPe(); player.poison = 0;
    }
    gainXp(e.T.xp, e.x, e.y);
  }
}
// Mímico: dorme como um baú; acorda (treme) quando o herói chega perto e pula atrás dele
function atualizarMimico(e, dt) {
  e.t += dt;
  const pcx = player.x + player.w / 2, ex = e.x + e.w / 2, chao = SALA ? SALA.chao : GROUND;
  if (e.estado === 'dorme') { if (Math.abs(pcx - ex) < 110 && Math.abs(player.y + player.h - chao) < 80) { e.estado = 'acorda'; e.t = 0; } return; }
  if (e.estado === 'acorda') {
    if (e.t > .7) { e.estado = 'luta'; e.t = 0; e.pulo = .25; floatText(e.x - 10, e.y - 20, 'É um mímico!', '#ff9a7a'); }
    return;
  }
  e.vy += GRAV * dt; e.x += e.vx * dt; e.y += e.vy * dt;
  if (e.y + e.h >= chao) {
    if (e.vy > 300) { shake = Math.max(shake, .1); burst(ex, chao - 2, 10, ['#6b5446', '#3d2f27'], 140, .4, 400, 3); }
    e.y = chao - e.h; e.vy = 0; e.vx = 0; e.noChao = true;
  } else e.noChao = false;
  if (SALA) e.x = clamp(e.x, SALA.x0 + 10, SALA.x1 - e.w - 10);
  if (e.noChao) {
    e.pulo -= dt;
    if (e.pulo <= 0) {
      const d = Math.sign(pcx - ex) || 1, dist = Math.abs(pcx - ex);
      e.face = d; e.vx = d * clamp(dist * 1.5, 120, 360); e.vy = dist < 140 ? -440 : -620; e.pulo = rnd(.6, 1.0);
    }
  }
  // a boca abre no ar e bate enquanto está no chão
  const alvo = e.noChao ? .25 + Math.abs(Math.sin(e.t * 9)) * .35 : 1;
  e.boca += (alvo - e.boca) * Math.min(1, dt * 14);
}
function atualizarDrops(dt) {
  for (const d of drops) {
    d.t += dt;
    const chao = SALA && d.x > SALA.x0 && d.x < SALA.x1 && d.y > GROUND ? SALA.chao : GROUND;
    if (d.y < chao - 26) { d.vy += 900 * dt; d.y = Math.min(chao - 26, d.y + d.vy * dt); }
    if (Math.random() < dt * 8) particles.push({ x: d.x + rnd(-16, 16), y: d.y + rnd(-16, 16), vx: 0, vy: -30, life: .6, max: .6, c: '#ffe28a', s: 2, g: 0 });
    if (d.t > .5 && Math.hypot(player.x + 14 - d.x, player.y + 22 - d.y) < 40) { d.pego = true; equipar(d.tipo); }
  }
  drops = drops.filter(d => !d.pego);
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
    } else if (e.T.mov === 'mimico') atualizarMimico(e, dt);
    else { e.t += dt; e.x = e.bx + Math.sin(e.t * .8) * 90; e.y = e.by + Math.sin(e.t * 2.1) * 35; }
    if (overlap(player, e) && e.estado !== 'dorme') hurtPlayer(e.T.dano, e.x + e.w / 2);
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
    if (o.life > 0) for (const s of SOLIDS_COL) if (circleRect(o.x, o.y, o.r, s)) {
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

  atualizarDrops(dt);
  for (const b of baus) {
    b.t += dt;
    if (!b.aberto && overlap(player, { x: b.x - 14, y: b.y - 20, w: 28, h: 20 })) {
      b.aberto = true; b.t = 0;
      burst(b.x, b.y - 14, 30, ['#ffe28a', '#f5c542', '#fff6d0'], 220, 1, 120, 3);
      floatText(b.x - 60, b.y - 40, b.texto || 'Baú!', '#ffe28a');
      if (b.cura) { player.hp = maxHp(); player.pe = maxPe(); player.poison = 0; }
      if (b.xp) gainXp(b.xp, b.x, b.y - 10);
    }
  }
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

  const dentro = naSala(player) && player.y > GROUND + 40;
  let want = bossActive ? ARENA.x0 : clamp(player.x + player.w / 2 - W * 0.4, 0, LEVEL_END - W);
  if (dentro) want = clamp(want, SALA.x0, SALA.x1 - W);   // na sala a câmera não mostra a terra dos lados
  camX += (want - camX) * Math.min(1, dt * (bossActive ? 3 : 8));
  // câmera vertical: só desce quando o herói entra pelo buraco da sala
  const wantY = naSala(player) ? clamp(player.y + player.h / 2 - H * .55, 0, SALA.fundo - H) : 0;
  camY += (wantY - camY) * Math.min(1, dt * 7);
  if (camY < .5 && wantY === 0) camY = 0;
  if (SALA) SALA.aperto = Math.max(0, SALA.aperto - dt * 3.5);
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
  if (state === 'title') { goFullscreen(); abrirHerois(); }
  else if (state === 'herois') { tocarHerois(p); }
  else if (state === 'mapa') { tocarMapa(p); }
  else if (state === 'bestiario') { tocarBestiario(p); }
  else if (state === 'dead') { if (time - deadAt < 0.9) return; respawn(); state = 'play'; }
  else if (state === 'victory') { concluir(FASE_ID); abrirMapa(); }
  else if (state === 'levelup') { for (let i = 0; i < 4; i++) if (overlap({ x: p.x, y: p.y, w: 1, h: 1 }, lvCard(i))) chooseLevel(i); }
}
function menuKey(code) {
  if (state === 'mapa') { teclaMapa(code); return; }
  if (state === 'bestiario') { teclaBestiario(code); return; }
  if (state === 'herois') { teclaHerois(code); return; }
  if (state === 'levelup') { const n = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3 }[code]; if (n !== undefined) chooseLevel(n); return; }
  if (['Enter', 'Space', 'KeyJ', 'KeyZ'].includes(code)) menuTap({ x: W / 2, y: H / 2 });
}

// ---------- mapa do mundo (seleção de local) ----------
// Os locais vêm de MAPA (dados/mapa.js). Só os que têm fase ficam liberados; os outros mostram
// um cadeado. Toque num marcador para ver o cartão; "Entrar" abre a fase.
const LOCAIS = (window.MAPA && MAPA.locais) || [];
let mapaSel = Math.max(0, LOCAIS.findIndex(l => l.fase === FASE_ID));
const mapaImgs = {};
function imgLocal(l) {
  if (!mapaImgs[l.id] && typeof Image === 'function') { const im = new Image(); im.src = l.img; mapaImgs[l.id] = im; }
  return mapaImgs[l.id];
}
function concluidas() { try { return JSON.parse(localStorage.getItem('tdl_concluidas') || '[]'); } catch (_) { return []; } }
function concluir(id) { try { const c = concluidas(); if (!c.includes(id)) { c.push(id); localStorage.setItem('tdl_concluidas', JSON.stringify(c)); } } catch (_) { /* sem armazenamento: tudo bem */ } }
function abrirMapa() { state = 'mapa'; pointers.clear(); if (LOCAIS[mapaSel]) imgLocal(LOCAIS[mapaSel]); }
const posLocal = l => ({ x: l.x * W, y: l.y * H });
// o cartão fica do lado oposto ao local escolhido, para não cobrir o marcador
const CARTAO = { x: 16, y: 62, w: 300, h: 262 }, BOTAO = { x: 0, y: 0, w: 0, h: 38 };
function posCartao() {
  const l = LOCAIS[mapaSel];
  CARTAO.x = l && l.x < .5 ? W - CARTAO.w - 16 : 16;
  Object.assign(BOTAO, { x: CARTAO.x + 20, y: CARTAO.y + CARTAO.h - 52, w: CARTAO.w - 40 });
}
function entrarLocal(l) {
  if (!l || !l.fase) return;
  if (l.fase === FASE_ID) newGame();
  else location.search = '?fase=' + l.fase + '&play';
}
const BOTAO_BEST = { x: 16, y: H - 56, w: 150, h: 40 };
function tocarMapa(p) {
  if (overlap({ x: p.x, y: p.y, w: 1, h: 1 }, BOTAO_BEST)) { abrirBestiario(); return; }
  posCartao();
  const l = LOCAIS[mapaSel];
  if (l && l.fase && overlap({ x: p.x, y: p.y, w: 1, h: 1 }, BOTAO)) { entrarLocal(l); return; }
  let melhor = -1, dist = 46;
  LOCAIS.forEach((q, i) => { const { x, y } = posLocal(q), d = Math.hypot(p.x - x, p.y - y); if (d < dist) { dist = d; melhor = i; } });
  if (melhor >= 0) { if (melhor === mapaSel && LOCAIS[melhor].fase) entrarLocal(LOCAIS[melhor]); else { mapaSel = melhor; imgLocal(LOCAIS[melhor]); } }
}
function teclaMapa(code) {
  if (code === 'KeyB') { abrirBestiario(); return; }
  if (code === 'ArrowRight' || code === 'KeyD' || code === 'ArrowUp') mapaSel = (mapaSel + 1) % LOCAIS.length;
  else if (code === 'ArrowLeft' || code === 'KeyA' || code === 'ArrowDown') mapaSel = (mapaSel + LOCAIS.length - 1) % LOCAIS.length;
  else if (['Enter', 'Space', 'KeyJ', 'KeyZ'].includes(code)) entrarLocal(LOCAIS[mapaSel]);
  if (LOCAIS[mapaSel]) imgLocal(LOCAIS[mapaSel]);
}
let mapaLuzCv = null;
function drawLuzMapa() {
  if (typeof document === 'undefined') return;
  const l = LOCAIS[mapaSel]; if (!l) return;
  if (!mapaLuzCv) { mapaLuzCv = document.createElement('canvas'); mapaLuzCv.width = W / 2; mapaLuzCv.height = H / 2; }
  const g = mapaLuzCv.getContext('2d'), { x, y } = posLocal(l), r = 105 + Math.sin(time * 2) * 6;
  g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, H);
  g.fillStyle = 'rgba(4,3,10,.62)'; g.fillRect(0, 0, W / 2, H / 2);
  g.globalCompositeOperation = 'destination-out';
  const rg = g.createRadialGradient(x / 2, y / 2, 0, x / 2, y / 2, r);
  rg.addColorStop(0, 'rgba(0,0,0,1)'); rg.addColorStop(.55, 'rgba(0,0,0,.85)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = rg; g.fillRect(0, 0, W / 2, H / 2);
  ctx.drawImage(mapaLuzCv, 0, 0, W, H);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';   // brilho quente sobre a região
  const cor = l.fase ? '255,210,120' : '170,160,200', bg = ctx.createRadialGradient(x, y, 0, x, y, r * 1.3);
  bg.addColorStop(0, `rgba(${cor},.22)`); bg.addColorStop(1, `rgba(${cor},0)`);
  ctx.fillStyle = bg; ctx.fillRect(x - r * 1.4, y - r * 1.4, r * 2.8, r * 2.8); ctx.restore();
}
// cartão de uma fase pronta: monta a cena com as camadas da própria fase (céu, árvores)
function cenaFase(id, x, y, w, h) {
  const F = FASES[id] && FASES[id].fundo, ceu = F && layer(F, 'ceu'), longe = F && layer(F, 'longe'), perto = F && layer(F, 'perto');
  if (!ceu || !longe || !perto) return false;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.imageSmoothingEnabled = false;
  const k = Math.max(w / ceu.naturalWidth, h / ceu.naturalHeight);
  ctx.drawImage(ceu, x + (w - ceu.naturalWidth * k) / 2, y, ceu.naturalWidth * k, ceu.naturalHeight * k);
  for (const [im, alt, base, dx] of [[longe, h * .62, h * .96, 0], [perto, h * .9, h + 6, -40]]) {
    const iw = im.naturalWidth * alt / im.naturalHeight;
    for (let xx = x + dx; xx < x + w; xx += iw) ctx.drawImage(im, Math.round(xx), Math.round(y + base - alt), Math.ceil(iw) + 1, Math.round(alt));
  }
  const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, 'rgba(10,6,16,0)'); g.addColorStop(1, 'rgba(10,6,16,.45)');
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  ctx.restore();
  return true;
}
function drawMapa() {
  const fundo = layer('mapa', 'mundo');
  if (fundo) { ctx.imageSmoothingEnabled = false; ctx.drawImage(fundo, 0, 0, W, H); ctx.imageSmoothingEnabled = true; }
  else {   // mapa de reserva: céu escuro com névoa
    const g = ctx.createRadialGradient(W * .5, H * .55, 40, W * .5, H * .55, W * .7);
    g.addColorStop(0, '#2a2238'); g.addColorStop(1, '#0b0910'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  // a região escolhida fica iluminada; o resto do mapa escurece
  drawLuzMapa();
  // trilha pontilhada entre os locais (só sem a imagem do mapa, que já tem o caminho desenhado)
  const feitos = concluidas();
  if (!fundo) for (let i = 0; i < LOCAIS.length - 1; i++) {
    const a = posLocal(LOCAIS[i]), b = posLocal(LOCAIS[i + 1]), n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 12);
    ctx.fillStyle = LOCAIS[i].fase ? 'rgba(255,214,120,.75)' : 'rgba(200,190,170,.28)';
    for (let k = 1; k < n; k++) { const t = k / n; ctx.fillRect(Math.round(a.x + (b.x - a.x) * t) - 1, Math.round(a.y + (b.y - a.y) * t) - 1, 3, 3); }
  }
  // marcadores
  LOCAIS.forEach((l, i) => {
    const { x, y } = posLocal(l), sel = i === mapaSel, livre = !!l.fase, feito = feitos.includes(l.fase);
    if (livre) {
      const pulso = 1 + Math.sin(time * 3 + i) * .12, g = ctx.createRadialGradient(x, y, 2, x, y, 34 * pulso);
      g.addColorStop(0, 'rgba(255,220,130,.9)'); g.addColorStop(1, 'rgba(255,170,60,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 34 * pulso, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = livre ? '#ffd76a' : '#3a3442'; ctx.strokeStyle = sel ? '#fff6d8' : livre ? '#8a5a1a' : '#6a6272'; ctx.lineWidth = sel ? 3 : 2;
    ctx.beginPath(); ctx.arc(x, y, sel ? 13 : 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if (!livre) {   // cadeado
      ctx.fillStyle = '#9a92a6'; ctx.fillRect(x - 4, y - 1, 8, 6);
      ctx.strokeStyle = '#9a92a6'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(x, y - 2, 3, Math.PI, 0); ctx.stroke();
    } else if (feito) { ctx.strokeStyle = '#2a1a06'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(x - 5, y); ctx.lineTo(x - 1, y + 4); ctx.lineTo(x + 6, y - 4); ctx.stroke(); }
    if (sel) { ctx.strokeStyle = 'rgba(255,240,200,.8)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 20 + Math.sin(time * 4) * 2, 0, Math.PI * 2); ctx.stroke(); }
  });
  // título
  // título embaixo (em cima ficam o grifo e o Olimpo)
  const tg = ctx.createLinearGradient(0, H - 70, 0, H); tg.addColorStop(0, 'rgba(6,4,12,0)'); tg.addColorStop(1, 'rgba(6,4,12,.8)');
  ctx.fillStyle = tg; ctx.fillRect(0, H - 70, W, 70);
  ctx.textAlign = 'center'; ctx.fillStyle = '#f5d48a'; ctx.font = 'bold 26px Cinzel, serif';
  ctx.fillText((window.MAPA && MAPA.titulo) || 'Mapa', W / 2, H - 28);
  ctx.fillStyle = '#b3a88f'; ctx.font = '13px "Crimson Pro", serif';
  ctx.fillText(showTouch ? 'Toque num local · toque de novo para entrar' : 'Setas escolhem o local · Enter entra', W / 2, H - 10);
  // botão do bestiário
  { const B = BOTAO_BEST; ctx.fillStyle = 'rgba(14,10,20,.85)'; roundRect(B.x, B.y, B.w, B.h, 10); ctx.fill();
    ctx.strokeStyle = '#c9a24e'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#f5d48a'; ctx.textAlign = 'center'; ctx.font = 'bold 16px Cinzel, serif'; ctx.fillText('Bestiário', B.x + B.w / 2, B.y + 26); }
  // cartão do local escolhido
  const l = LOCAIS[mapaSel]; if (!l) return;
  posCartao();
  const C = CARTAO; panel(C.x, C.y, C.w, C.h);
  const im = imgLocal(l), iw = C.w - 24, ih = 132;
  if (l.fase && cenaFase(l.fase, C.x + 12, C.y + 12, iw, ih)) { /* cena montada com a arte da fase */ }
  else if (!l.fase) {   // bloqueado: não mostra a ilustração (não entrega a história), só névoa e "?"
    const ng = ctx.createRadialGradient(C.x + 12 + iw / 2, C.y + 12 + ih / 2, 6, C.x + 12 + iw / 2, C.y + 12 + ih / 2, iw * .6);
    ng.addColorStop(0, '#2c2438'); ng.addColorStop(1, '#0e0a14');
    ctx.fillStyle = ng; ctx.fillRect(C.x + 12, C.y + 12, iw, ih);
    for (let i = 0; i < 18; i++) {   // névoa que passa devagar
      const nx = C.x + 12 + ((i * 53 + time * 8 * (1 + i % 3)) % (iw + 60)) - 30, ny = C.y + 20 + (i * 37) % (ih - 16);
      ctx.fillStyle = 'rgba(180,170,200,.05)'; ctx.beginPath(); ctx.ellipse(nx, ny, 40, 9, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(227,183,90,.75)'; ctx.font = 'bold 64px Cinzel, serif';
    ctx.fillText('?', C.x + 12 + iw / 2, C.y + 12 + ih / 2 + 22);
  }
  else if (ready(im)) {
    const k = Math.max(iw / im.naturalWidth, ih / im.naturalHeight), sw = iw / k, sh = ih / k;
    ctx.save(); if (!l.fase) ctx.filter = 'grayscale(1) brightness(.6)';
    ctx.drawImage(im, (im.naturalWidth - sw) / 2, (im.naturalHeight - sh) / 2, sw, sh, C.x + 12, C.y + 12, iw, ih); ctx.restore();
    if (!l.fase) { ctx.fillStyle = 'rgba(10,8,16,.45)'; ctx.fillRect(C.x + 12, C.y + 12, iw, ih); }
  } else { ctx.fillStyle = '#1a1424'; ctx.fillRect(C.x + 12, C.y + 12, iw, ih); }
  ctx.textAlign = 'center'; ctx.fillStyle = '#f5d48a';
  let fs = 19; ctx.font = `bold ${fs}px Cinzel, serif`;
  while (fs > 13 && ctx.measureText(l.nome).width > (C.w - 28) * 2) { fs--; ctx.font = `bold ${fs}px Cinzel, serif`; }
  wrap(l.nome, C.x + C.w / 2, C.y + 170, C.w - 28, fs + 5);
  const B = BOTAO;
  if (l.fase) {
    ctx.fillStyle = 'rgba(227,183,90,.9)'; roundRect(B.x, B.y, B.w, B.h, 10); ctx.fill();
    ctx.fillStyle = '#1a1424'; ctx.textAlign = 'center'; ctx.font = 'bold 18px Cinzel, serif';
    ctx.fillText(feitos.includes(l.fase) ? 'Jogar de novo' : 'Entrar', B.x + B.w / 2, B.y + 25);
  } else {
    ctx.fillStyle = '#8a8296'; ctx.textAlign = 'center'; ctx.font = 'italic 16px "Crimson Pro", serif';
    ctx.fillText('Bloqueado · em breve', B.x + B.w / 2, B.y + 24);
  }
}

// ---------- bestiário ----------
const BEST = window.BESTIARIO || [];
function registro() { try { return JSON.parse(localStorage.getItem('tdl_bestiario') || '{}'); } catch (_) { return {}; } }
function salvarRegistro(r) { try { localStorage.setItem('tdl_bestiario', JSON.stringify(r)); } catch (_) { /* sem armazenamento */ } }
let REG = registro();
function encontrar(id) { if (!id || (REG[id] && REG[id].visto)) return; REG[id] = { ...(REG[id] || { mortes: 0 }), visto: true }; salvarRegistro(REG); }
function contarMorte(id) { if (!id) return; const r = REG[id] || { mortes: 0 }; REG[id] = { visto: true, mortes: (r.mortes || 0) + 1 }; salvarRegistro(REG); }
let bestSel = 0;
const bestImgs = {};
const tileBest = i => ({ x: 22 + (i % 3) * 100, y: 66 + Math.floor(i / 3) * 96, w: 92, h: 88 });
const BOTAO_VOLTAR = { x: 22, y: H - 50, w: 140, h: 38 };
function abrirBestiario() { state = 'bestiario'; pointers.clear(); REG = registro(); }
function tocarBestiario(p) {
  const pt = { x: p.x, y: p.y, w: 1, h: 1 };
  if (overlap(pt, BOTAO_VOLTAR)) { abrirMapa(); return; }
  BEST.forEach((b, i) => { if (overlap(pt, tileBest(i))) bestSel = i; });
}
function teclaBestiario(code) {
  if (code === 'ArrowRight' || code === 'KeyD') bestSel = (bestSel + 1) % BEST.length;
  else if (code === 'ArrowLeft' || code === 'KeyA') bestSel = (bestSel + BEST.length - 1) % BEST.length;
  else if (code === 'ArrowDown' || code === 'KeyS') bestSel = Math.min(BEST.length - 1, bestSel + 3);
  else if (code === 'ArrowUp' || code === 'KeyW') bestSel = Math.max(0, bestSel - 3);
  else if (['Escape', 'Backspace', 'KeyB'].includes(code)) abrirMapa();
}
// imagem de uma criatura dentro de uma caixa (sprite do jogo ou ilustração)
function imagemCriatura(b, x, y, w, h) {
  const S = b.sprite && SPR[b.sprite];
  if (S && S.partes && b.parte && ready(S.image)) {
    const [qx, qy, qw, qh] = S.partes[b.parte], k = Math.min(w / qw, h / qh) * .9;
    ctx.imageSmoothingEnabled = false; ctx.drawImage(S.image, qx, qy, qw, qh, x + w / 2 - qw * k / 2, y + h / 2 - qh * k / 2, qw * k, qh * k); ctx.imageSmoothingEnabled = true; return;
  }
  if (S && S.quadros && ready(S.image)) {
    const fr = (S.quadros.parado || S.quadros.andar || S.quadros.voar || Object.values(S.quadros)[0])[0], [qx, qy, qw, qh] = fr, k = Math.min(w / qw, h / qh) * .9;
    ctx.imageSmoothingEnabled = false; ctx.drawImage(S.image, qx, qy, qw, qh, x + w / 2 - qw * k / 2, y + h / 2 - qh * k / 2, qw * k, qh * k); ctx.imageSmoothingEnabled = true; return;
  }
  if (b.img) {
    if (!bestImgs[b.id] && typeof Image === 'function') { bestImgs[b.id] = new Image(); bestImgs[b.id].src = b.img; }
    const im = bestImgs[b.id];
    if (ready(im)) { const k = Math.max(w / im.naturalWidth, h / im.naturalHeight), sw = w / k, sh = h / k; ctx.drawImage(im, (im.naturalWidth - sw) / 2, (im.naturalHeight - sh) / 2, sw, sh, x, y, w, h); return; }
  }
  ctx.fillStyle = '#e3b75a'; ctx.textAlign = 'center'; ctx.font = 'bold 30px Cinzel, serif'; ctx.fillText('✦', x + w / 2, y + h / 2 + 10);
}
function drawBestiario() {
  const g = ctx.createRadialGradient(W / 2, H * .45, 40, W / 2, H * .45, W * .7);
  g.addColorStop(0, '#2a2238'); g.addColorStop(1, '#0b0910'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'left'; ctx.fillStyle = '#f5d48a'; ctx.font = 'bold 28px Cinzel, serif'; ctx.fillText('Bestiário', 22, 44);
  const vistos = BEST.filter(b => REG[b.id] && REG[b.id].visto).length;
  ctx.fillStyle = '#b3a88f'; ctx.font = '13px "Crimson Pro", serif'; ctx.fillText(`${vistos} de ${BEST.length} encontrados`, 190, 42);
  BEST.forEach((b, i) => {
    const T = tileBest(i), visto = REG[b.id] && REG[b.id].visto, sel = i === bestSel;
    ctx.fillStyle = 'rgba(14,10,20,.85)'; roundRect(T.x, T.y, T.w, T.h, 8); ctx.fill();
    ctx.strokeStyle = sel ? '#f5d48a' : 'rgba(201,162,78,.35)'; ctx.lineWidth = sel ? 2 : 1; ctx.stroke();
    ctx.save(); roundRect(T.x + 4, T.y + 4, T.w - 8, T.h - 24, 6); ctx.clip();
    if (visto) imagemCriatura(b, T.x + 4, T.y + 4, T.w - 8, T.h - 24);
    else { ctx.fillStyle = '#16111e'; ctx.fillRect(T.x, T.y, T.w, T.h); ctx.fillStyle = 'rgba(227,183,90,.5)'; ctx.textAlign = 'center'; ctx.font = 'bold 34px Cinzel, serif'; ctx.fillText('?', T.x + T.w / 2, T.y + 50); }
    ctx.restore();
    ctx.textAlign = 'center'; ctx.fillStyle = visto ? '#ece4d4' : '#6e6680'; ctx.font = '12px "Crimson Pro", serif';
    let n = visto ? b.nome.replace(/ \(.*\)/, '') : '???'; ctx.fillText(n.length > 15 ? n.slice(0, 14) + '…' : n, T.x + T.w / 2, T.y + T.h - 7);
  });
  // ficha no pergaminho
  const b = BEST[bestSel], visto = b && REG[b.id] && REG[b.id].visto, px = 340, py = 40, pw = 600, ph = 470;
  const art = pecaHud('pergaminho');
  if (art) ctx.drawImage(art.image, px - 10, py - 10, pw + 20, ph + 20);
  else { ctx.fillStyle = '#dcc48f'; roundRect(px, py, pw, ph, 12); ctx.fill(); }
  ctx.textAlign = 'center';
  ctx.fillStyle = '#5a1e0c'; ctx.font = '36px "IM Fell English SC", Cinzel, serif';
  ctx.fillText(visto ? b.nome : '???', px + pw / 2, py + 92);
  ctx.fillStyle = '#6e4a24'; ctx.font = 'italic 16px "IM Fell English", serif';
  ctx.fillText(visto ? (b.tipo === 'chefe' ? 'Guardião' : 'Criatura') : 'Ainda não encontrado', px + pw / 2, py + 116);
  ctx.fillStyle = 'rgba(110,74,36,.6)'; ctx.fillRect(px + pw / 2 - 100, py + 126, 200, 1);
  if (visto) {
    ctx.save(); roundRect(px + pw / 2 - 60, py + 138, 120, 90, 8); ctx.clip(); imagemCriatura(b, px + pw / 2 - 60, py + 138, 120, 90); ctx.restore();
    ctx.fillStyle = '#3a2410'; ctx.font = '16px "IM Fell English", serif';
    let y = wrap(b.d, px + pw / 2, py + 252, pw - 150, 20);
    ctx.fillStyle = '#5a1e0c'; ctx.font = 'italic 15px "IM Fell English", serif';
    ctx.fillText('Ataques: ' + b.at.join(' · '), px + pw / 2, y + 8);
    ctx.fillStyle = '#3a2410'; ctx.font = '18px "IM Fell English SC", serif';
    ctx.fillText('Derrotados: ' + ((REG[b.id] && REG[b.id].mortes) || 0), px + pw / 2, py + ph - 70);
  } else {
    ctx.fillStyle = 'rgba(90,60,30,.5)'; ctx.font = 'bold 90px "IM Fell English SC", serif'; ctx.fillText('?', px + pw / 2, py + 260);
    ctx.fillStyle = '#3a2410'; ctx.font = 'italic 16px "IM Fell English", serif';
    ctx.fillText('Encontre esta criatura para conhecer sua história.', px + pw / 2, py + 320);
  }
  const V = BOTAO_VOLTAR; ctx.fillStyle = 'rgba(14,10,20,.85)'; roundRect(V.x, V.y, V.w, V.h, 10); ctx.fill();
  ctx.strokeStyle = '#c9a24e'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = '#f5d48a'; ctx.font = 'bold 15px Cinzel, serif'; ctx.fillText('← Mapa', V.x + V.w / 2, V.y + 25);
}

// ---------- seleção de herói ----------
// Os 4 jogadores (SELECAO_HEROIS em herois.js). Só os com disponivel: true podem ser escolhidos;
// os outros aparecem como silhueta com a cor do elemento e "em breve".
const SEL = (window.SELECAO_HEROIS || ['humano']).filter(id => HEROIS[id]);
let heroiSel = Math.max(0, SEL.indexOf(HEROI_ID));
const COR_ELEM = { agua: '#4aa8ff', fogo: '#ff7a2a', terra: '#c8a060', ar: '#d8ecff', null: '#e3b75a' };
const NOME_ELEM = { agua: 'Água', fogo: 'Fogo', terra: 'Terra', ar: 'Ar' };
const cartaoHeroi = i => { const w = 196, gap = 18, x0 = (W - (SEL.length * w + (SEL.length - 1) * gap)) / 2; return { x: x0 + i * (w + gap), y: 62, w, h: 352 }; };
const BOTAO_HEROI = { x: W / 2 - 130, y: 470, w: 260, h: 44 };
function abrirHerois() { state = 'herois'; pointers.clear(); }
function escolherHeroi() {
  const id = SEL[heroiSel], h = HEROIS[id];
  if (!h || !h.disponivel) return;
  if (id !== HEROI_ID) { location.search = '?heroi=' + id + '&mapa'; return; }   // recarrega com o herói
  abrirMapa();
}
function tocarHerois(p) {
  const pt = { x: p.x, y: p.y, w: 1, h: 1 };
  if (overlap(pt, BOTAO_HEROI)) { escolherHeroi(); return; }
  SEL.forEach((id, i) => { if (overlap(pt, cartaoHeroi(i))) { if (i === heroiSel) escolherHeroi(); else heroiSel = i; } });
}
function teclaHerois(code) {
  if (code === 'ArrowRight' || code === 'KeyD') heroiSel = (heroiSel + 1) % SEL.length;
  else if (code === 'ArrowLeft' || code === 'KeyA') heroiSel = (heroiSel + SEL.length - 1) % SEL.length;
  else if (['Enter', 'Space', 'KeyJ', 'KeyZ'].includes(code)) escolherHeroi();
}
// retrato do herói, ou a silhueta do retrato do humano tingida com a cor do elemento
const silhuetas = {};
function retratoHeroi(id) {
  const s = SPR[HEROIS[id].sprite], im = s && s.retratoImg;
  if (ready(im)) return { im, sil: false };
  const base = SPR['herois/humano'] && SPR['herois/humano'].retratoImg;
  if (!ready(base) || typeof document === 'undefined') return null;
  if (!silhuetas[id]) {
    const c = document.createElement('canvas'); c.width = base.naturalWidth; c.height = base.naturalHeight;
    const g = c.getContext('2d'); g.drawImage(base, 0, 0);
    g.globalCompositeOperation = 'source-atop'; g.fillStyle = '#0c0812'; g.fillRect(0, 0, c.width, c.height);
    silhuetas[id] = c;
  }
  return { im: silhuetas[id], sil: true };
}
function drawHerois() {
  const g = ctx.createRadialGradient(W / 2, H * .45, 40, W / 2, H * .45, W * .7);
  g.addColorStop(0, '#2a2238'); g.addColorStop(1, '#0b0910'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center'; ctx.fillStyle = '#f5d48a'; ctx.font = 'bold 30px Cinzel, serif';
  ctx.fillText('Escolha seu herói', W / 2, 44);
  SEL.forEach((id, i) => {
    const h = HEROIS[id], C = cartaoHeroi(i), sel = i === heroiSel, livre = h.disponivel, cor = COR_ELEM[h.elemento] || COR_ELEM.null;
    const lift = sel ? -6 : 0;
    // brilho atrás do escolhido
    if (sel) { const gl = ctx.createRadialGradient(C.x + C.w / 2, C.y + 150, 10, C.x + C.w / 2, C.y + 150, 190); gl.addColorStop(0, cor + '55'); gl.addColorStop(1, cor + '00'); ctx.fillStyle = gl; ctx.fillRect(C.x - 60, C.y - 40, C.w + 120, C.h + 80); }
    ctx.fillStyle = 'rgba(14,10,20,.85)'; roundRect(C.x, C.y + lift, C.w, C.h, 14); ctx.fill();
    ctx.strokeStyle = sel ? cor : 'rgba(201,162,78,.45)'; ctx.lineWidth = sel ? 2.5 : 1.2; ctx.stroke();
    // retrato
    const r = retratoHeroi(id);
    ctx.save(); roundRect(C.x + 6, C.y + 6 + lift, C.w - 12, 196, 10); ctx.clip();
    const fg = ctx.createLinearGradient(0, C.y, 0, C.y + 200); fg.addColorStop(0, cor + '33'); fg.addColorStop(1, 'rgba(10,6,16,.2)');
    ctx.fillStyle = fg; ctx.fillRect(C.x, C.y + lift, C.w, 210);
    if (r) {
      const hh = 230, ww = hh * r.im.width / r.im.height;
      ctx.drawImage(r.im, C.x + C.w / 2 - ww / 2, C.y + 8 + lift, ww, hh);
      if (r.sil) { ctx.fillStyle = cor; ctx.font = 'bold 54px Cinzel, serif'; ctx.globalAlpha = .85; ctx.fillText('?', C.x + C.w / 2, C.y + 120 + lift); ctx.globalAlpha = 1; }
    }
    ctx.restore();
    // nome, signo, elemento
    ctx.fillStyle = livre ? '#f5d48a' : '#a89cb8'; ctx.font = 'bold 16px Cinzel, serif';
    ctx.fillText(livre ? h.nome : (h.signo || h.nome), C.x + C.w / 2, C.y + 226 + lift);
    ctx.fillStyle = cor; ctx.font = '13px "Crimson Pro", serif';
    ctx.fillText(h.elemento ? 'Elemento: ' + NOME_ELEM[h.elemento] : 'Sem constelação · difícil', C.x + C.w / 2, C.y + 244 + lift);
    // atributos
    const nomes = { V: 'Vigor', F: 'Força', I: 'Intelecto', A: 'Agilidade' };
    Object.keys(nomes).forEach((k, j) => {
      const y = C.y + 262 + j * 15 + lift, v = h.attr[k];
      ctx.textAlign = 'left'; ctx.fillStyle = '#b3a88f'; ctx.font = '12px "Crimson Pro", serif'; ctx.fillText(nomes[k], C.x + 16, y + 9);
      for (let q = 0; q < 4; q++) { ctx.fillStyle = q < v ? (v > 2 && q === v - 1 ? cor : '#e3b75a') : 'rgba(255,255,255,.12)'; ctx.fillRect(C.x + 92 + q * 22, y, 18, 8); }
      ctx.textAlign = 'center';
    });
    if (!livre) {
      ctx.fillStyle = 'rgba(8,5,12,.35)'; roundRect(C.x, C.y + lift, C.w, C.h, 14); ctx.fill();
      ctx.fillStyle = '#8a8296'; ctx.font = 'italic 14px "Crimson Pro", serif'; ctx.fillText('em breve', C.x + C.w / 2, C.y + C.h - 8 + lift);
    }
  });
  // descrição e botão
  const h = HEROIS[SEL[heroiSel]];
  ctx.fillStyle = '#ece4d4'; ctx.font = 'italic 15px "Crimson Pro", serif';
  wrap(h.disponivel ? h.descricao : 'Ainda em criação pela Milena. Volte em breve!', W / 2, 438, 720, 18);
  const B = BOTAO_HEROI;
  ctx.fillStyle = h.disponivel ? 'rgba(227,183,90,.92)' : 'rgba(120,110,130,.35)'; roundRect(B.x, B.y, B.w, B.h, 10); ctx.fill();
  ctx.fillStyle = h.disponivel ? '#1a1424' : '#8a8296'; ctx.font = 'bold 18px Cinzel, serif';
  ctx.fillText(h.disponivel ? 'Escolher' : 'Bloqueado', B.x + B.w / 2, B.y + 28);
}

// ---------- desenho ----------
const titleImg = new Image();
titleImg.src = FASE.imagemTitulo;

// chama em pixel art (blocos de 3 px): língua que afina para cima, amarela embaixo e vermelha na ponta
function chamaPixel(x, y, w, h, t) {
  const B = 3, n = Math.max(2, Math.round(h / B));
  for (let i = 0; i < n; i++) {
    const k = i / n, larg = Math.max(B, Math.round(w * Math.sin(Math.PI * (.25 + k * .75)) / B) * B), dx = Math.round(Math.sin(t + k * 4) * k * 4 / B) * B;
    ctx.fillStyle = k < .2 ? '#ff7a1e' : k < .55 ? '#ffc443' : k < .82 ? '#ff6418' : '#b8200a';
    ctx.fillRect(Math.round((x - larg / 2 + dx) / B) * B, Math.round((y - (i + 1) * B) / B) * B, larg, B);
  }
}
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
// fogo parado no chão (quadros do PixelLab em objetos/fogo, animados a 10 por segundo). x na tela,
// y = chão. fase desencontra os fogos vizinhos. Devolve false sem a imagem (aí usa o desenho).
function drawFogo(x, y, larg, fase = 0) {
  const n = 9, i = ((Math.floor(time * 10 + fase) % n) + n) % n, im = layer('objetos/fogo', String(i + 1));
  if (!im) return false;
  const z = 2, w = im.naturalWidth * z, h = im.naturalHeight * z, copias = larg > w + 15 ? 2 : 1;
  ctx.imageSmoothingEnabled = false;
  for (let c = 0; c < copias; c++) {
    const im2 = c ? layer('objetos/fogo', String(((i + 4) % n) + 1)) || im : im;
    const cx = copias > 1 ? x - larg / 4 + c * larg / 2 : x;
    ctx.drawImage(im2, Math.round(cx - w / 2), Math.round(y - h + 4), w, h);
  }
  ctx.imageSmoothingEnabled = true;
  return true;
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
function tiled(img, par, base, height, desloc = 0) {
  const nw = img.naturalWidth || img.width, nh = img.naturalHeight || img.height;
  const k = height / nh, w = nw * k;
  ctx.imageSmoothingEnabled = !fundoPixel();
  let x = -((camX * par + desloc * w) % w); if (x > 0) x -= w;
  for (; x < W; x += w) ctx.drawImage(img, x, base - height, w + 1, height);
  ctx.imageSmoothingEnabled = true;
}
const fundoPixel = () => (SPR[FASE.fundo] && SPR[FASE.fundo].pixel) || 0;
// Faixas prontas: as camadas de árvores são montadas UMA vez numa imagem larga do tamanho que a
// câmera percorre (uma faixa para o fundo, com a neblina, e outra para o meio). Por quadro o jogo
// só copia um pedaço de cada. Por isso a densidade das camadas não pesa: pode ter quantas
// árvores quiser.
let faixasProntas = null;
function faixas() {
  if (faixasProntas) return faixasProntas;
  const F = FASE.fundo, longe = layer(F, 'longe'), perto = layer(F, 'perto');
  if (!longe || !perto || typeof document === 'undefined' || HD) return null;
  const parL = .28, parM = .55, alcance = Math.max(LEVEL_END, ARENA.x1) - W;
  const nova = par => { const c = document.createElement('canvas'); c.width = Math.ceil(alcance * par + W) + 4; c.height = H; return c; };
  const pinta = (g, img, base, altura, desloc = 0) => {
    const nw = img.naturalWidth || img.width, nh = img.naturalHeight || img.height;
    const w = nw * altura / nh;
    g.imageSmoothingEnabled = !fundoPixel();
    for (let x = -desloc * w; x < g.canvas.width; x += w) g.drawImage(img, Math.round(x), base - altura, Math.ceil(w) + 1, altura);
  };
  const L = nova(parL), gl = L.getContext('2d');
  pinta(gl, longe, GROUND - 20, 330);
  pinta(gl, tom(longe, '20,10,24', .35), GROUND, 400, .5);
  const fog = gl.createLinearGradient(0, 300, 0, H);
  fog.addColorStop(0, 'rgba(120,60,40,0)'); fog.addColorStop(1, 'rgba(120,60,40,.35)');
  gl.fillStyle = fog; gl.fillRect(0, 300, L.width, H - 300);
  const M = nova(parM), gm = M.getContext('2d');
  pinta(gm, tom(perto, '26,12,22', .3), GROUND + 6, 360, .37);
  pinta(gm, perto, GROUND + 10, 430);
  return (faixasProntas = { longe: L, meio: M, parL, parM });
}
// cópia escurecida (ou tingida) de uma camada, guardada para não refazer a cada quadro
const TOM = new Map();
function tom(img, cor, forca) {
  const chave = img.src + cor + forca;
  if (TOM.has(chave)) return TOM.get(chave);
  const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
  const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  g.globalCompositeOperation = 'source-atop'; g.fillStyle = `rgba(${cor},${forca})`; g.fillRect(0, 0, c.width, c.height);
  TOM.set(chave, c); return c;
}
// tufos, pedras e galhos no chão e troncos escuros passando na frente do herói (primeiro plano)
const TUFOS = [], FRENTE = [];
{ const r = mulberry(7); for (let x = 0; x < 10000; x += 18 + r() * 40) TUFOS.push({ x, n: 2 + (r() * 5 | 0), h: 4 + r() * 9, pedra: r() < .18, galho: r() < .1 });
  for (let x = 0; x < 14000; x += 120 + r() * 260) FRENTE.push({ tipo: 'moita', x, bolas: Array.from({ length: 3 + (r() * 3 | 0) }, () => [r() * 90 - 45, 26 + r() * 30]) });
  for (let x = 200; x < 14000; x += 260 + r() * 520) FRENTE.push({ tipo: 'cipo', x, fios: Array.from({ length: 1 + (r() * 3 | 0) }, () => [r() * 40, 40 + r() * 120]) }); }
function drawChao() {
  ctx.fillStyle = '#140a10';
  for (const t of TUFOS) {
    const x = Math.round(t.x - camX); if (x < -20 || x > W + 20) continue;
    if (!SOLIDS.some(s => t.x >= s.x && t.x < s.x + s.w)) continue;
    if (t.pedra) { ctx.fillRect(x, GROUND - 4, 10, 4); ctx.fillRect(x + 2, GROUND - 6, 6, 2); continue; }
    if (t.galho) { ctx.fillRect(x, GROUND - 3, 22, 2); ctx.fillRect(x + 14, GROUND - 7, 2, 4); continue; }
    for (let i = 0; i < t.n; i++) ctx.fillRect(x + i * 3, GROUND - t.h + ((i * 7) % 5), 2, t.h - ((i * 7) % 5));
  }
}
function drawFrente() {
  // primeiro plano em pixel (blocos de 4 px): moitas escuras embaixo e cipós pendurados no alto
  const par = 1.3, B = 4;
  ctx.fillStyle = '#08040b';
  const bola = (cx, cy, r) => { for (let dy = -r; dy < r; dy += B) { const hw = Math.round(Math.sqrt(r * r - dy * dy) / B) * B; ctx.fillRect(cx - hw, cy + dy, hw * 2, B); } };
  for (const f of FRENTE) {
    const x = Math.round((f.x - camX * par) / B) * B; if (x < -120 || x > W + 120) continue;
    if (f.tipo === 'moita') for (const [dx, r] of f.bolas) bola(x + Math.round(dx / B) * B, H + 6, Math.round(r / B) * B);
    else for (const [dx, len] of f.fios) {
      const fx = x + Math.round(dx / B) * B;
      for (let y = 0; y < len; y += B) ctx.fillRect(fx + (Math.floor(y / 24) % 2 ? B : 0), y, B, B);
      for (let y = 16; y < len; y += 22) ctx.fillRect(fx - B, y, B * 3, B);   // folhinhas
    }
  }
}
let retratoV = null, retratoP = null;
// o retrato original é grande: guarda uma cópia já no tamanho da tela do aparelho
function retratoPronto(im, w, h) {
  const k = dpr * scale, pw = Math.max(1, Math.round(w * k)), ph = Math.max(1, Math.round(h * k));
  if (retratoP && retratoP.width === pw && retratoP.height === ph) return retratoP;
  const c = document.createElement('canvas'); c.width = pw; c.height = ph;
  const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(im, 0, 0, pw, ph);
  return (retratoP = c);
}
function retratoVermelho(im) {
  if (retratoV) return retratoV;
  const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
  const g = c.getContext('2d'); g.drawImage(im, 0, 0);
  g.globalCompositeOperation = 'source-atop'; g.fillStyle = '#ff2a1a'; g.fillRect(0, 0, c.width, c.height);
  return (retratoV = c);
}
// retrato do herói no canto da tela (como nos jogos de ação com retrato grande)
function drawRetrato() {
  const s = SPR[HEROI.sprite], im = s && s.retratoImg;
  if (!ready(im) || params.has('semretrato')) return;
  const h = 300, w = h * im.naturalWidth / im.naturalHeight, p = player;
  const tremor = p.inv > 0.7 ? rnd(-4, 4) : 0, resp = Math.sin(time * 1.6) * 2;
  // fica transparente quando o herói passa por trás dele (no começo da fase, por exemplo)
  const atras = p.x - camX < w + 10 && p.y + p.h > H - h;
  ctx.save();
  ctx.globalAlpha = atras ? .3 : .93;
  ctx.drawImage(retratoPronto(im, w, h), -6 + tremor, H - h + 8 + resp, w, h);
  ctx.restore();
  if (p.inv > 0.7 && state === 'play') {   // leva dano: o retrato pisca em vermelho (só onde há desenho)
    ctx.save(); ctx.globalAlpha = .55 * (p.inv - .7) / .5;
    ctx.drawImage(retratoVermelho(im), -6 + tremor, H - h + 8 + resp, w, h); ctx.restore();
  }
}
// posição da lua na tela: a do céu desenhado (FASE.luaNoCeu, em fração da imagem) ou a padrão
let luaTela = [760, 120];

function drawBackground() {
  const C = FASE.cores, F = FASE.fundo;
  const ceu = layer(F, 'ceu'), longe = layer(F, 'longe'), perto = layer(F, 'perto');
  if (ceu) {
    const k = Math.max(W / ceu.naturalWidth, H / ceu.naturalHeight);
    const w = ceu.naturalWidth * k, over = Math.max(0, w - W), x0 = -over * clamp(camX / Math.max(1, LEVEL_END - W), 0, 1);
    ctx.imageSmoothingEnabled = !fundoPixel();
    ctx.drawImage(ceu, x0, 0, w, ceu.naturalHeight * k);
    ctx.imageSmoothingEnabled = true;
    if (FASE.luaNoCeu) luaTela = [x0 + FASE.luaNoCeu[0] * w, FASE.luaNoCeu[1] * ceu.naturalHeight * k];
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, C.ceu[0]); g.addColorStop(.55, C.ceu[1]); g.addColorStop(.8, C.ceu[2]); g.addColorStop(1, C.ceu[3]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,170,110,.18)'; ctx.beginPath(); ctx.arc(760, 120, 70, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.lua; ctx.beginPath(); ctx.arc(760, 120, 38, 0, Math.PI * 2); ctx.fill();
  }
  const fx = faixas();
  if (fx) {   // camadas já montadas em 2 faixas: 2 desenhos por quadro em vez de 5
    ctx.drawImage(fx.longe, -Math.round(camX * fx.parL), 0);
    ctx.drawImage(fx.meio, -Math.round(camX * fx.parM), 0);
  }
  else if (longe) {
    tiled(longe, .22, GROUND - 20, 330);
    tiled(tom(longe, '20,10,24', .35), .36, GROUND, 400, .5);   // segunda fileira, mais perto e mais escura
  }
  else {
    ctx.fillStyle = C.morros;
    ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 20) ctx.lineTo(x, 330 + Math.sin((x + camX * .1) * .008) * 30 + Math.sin((x + camX * .1) * .021) * 14);
    ctx.lineTo(W, H); ctx.fill();
    for (const t of FAR) { const x = t.x - camX * .3; const sx = ((x % 6650) + 6650) % 6650 - 200; if (sx < -100 || sx > W + 100) continue; drawTree(sx, 420, t.h, t.w, t.b, C.arvoreLonge); }
  }
  if (!fx) {
    const fog = ctx.createLinearGradient(0, 300, 0, H);
    fog.addColorStop(0, 'rgba(120,60,40,0)'); fog.addColorStop(1, 'rgba(120,60,40,.35)');
    ctx.fillStyle = fog; ctx.fillRect(0, 300, W, H - 300);
  }
  if (fx) { /* troncos já estão na faixa do meio */ }
  else if (perto) {
    tiled(tom(perto, '26,12,22', .3), .48, GROUND + 6, 360, .37);   // troncos do meio
    tiled(perto, .62, GROUND + 10, 430);
  }
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
// ---------- piso irregular (montado uma vez) ----------
// O chão da fase inteira vira uma imagem pronta: topo ondulado em degraus de pixel, beiradas
// quebradas nos buracos, crosta clara, tufos, pedras e galhos. A física continua reta (GROUND);
// o desenho sobe e desce uns pixels em volta dela. Por quadro, o jogo só copia o pedaço visível.
const PISO_TOPO = GROUND - 26;
let pisoPronto = null;
function piso() {
  if (pisoPronto) return pisoPronto;
  const chao = layer(FASE.fundo, 'chao');
  if (!chao || typeof document === 'undefined') return null;
  const larg = Math.ceil(Math.max(LEVEL_END, ARENA.x1)) + 8, alt = H - PISO_TOPO, B = 2, z = fundoPixel() || 1;
  const c = document.createElement('canvas'); c.width = larg; c.height = alt;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  const r = mulberry(11), topos = new Map();   // x (de 4 em 4 px) -> y do topo, em coordenadas da tela
  const base = GROUND - PISO_TOPO;
  const pat = g.createPattern(chao, 'repeat');
  for (const s of SOLIDS) {
    if (s.y < GROUND - 1) continue;   // só o chão principal (blocos altos ficam como estão)
    const ys = [];
    let deriva = 0;
    // montinhos e pedras salientes espalhados
    const montes = []; for (let x = s.x + 30; x < s.x + s.w - 30; x += 60 + r() * 160) montes.push([x, 14 + r() * 40, 5 + r() * 9]);
    for (let x = s.x; x <= s.x + s.w; x += 4) {
      deriva = clamp(deriva + (r() - .5) * 2.4, -4, 4);
      let y = Math.sin(x * .017) * 4.5 + Math.sin(x * .061 + 1.3) * 2.2 + deriva;
      for (const [mx, mw, mh] of montes) { const d = Math.abs(x - mx); if (d < mw) y -= mh * (1 - (d / mw) ** 2); }
      const borda = Math.min(x - s.x, s.x + s.w - x);              // beirada quebrada no buraco
      if (borda < 14) y += (14 - borda) * (14 - borda) / 14;
      ys.push(Math.round(y / B) * B);
    }
    g.save(); g.beginPath(); g.moveTo(s.x, alt);
    ys.forEach((y, i) => { const x = s.x + i * 4; g.lineTo(x, base + y); g.lineTo(x + 4, base + y); });
    g.lineTo(s.x + s.w, alt); g.closePath(); g.clip();
    g.translate(0, base); g.scale(z, z); g.fillStyle = pat; g.fillRect(s.x / z, -20, s.w / z + 4, alt / z + 20);
    g.restore();
    ys.forEach((y, i) => {
      const x = s.x + i * 4, yy = base + y;
      topos.set(x, PISO_TOPO + yy);
      const dy = i > 0 ? ys[i] - ys[i - 1] : 0;   // degrau: lateral do degrau também ganha crosta
      g.fillStyle = i % 7 === 3 ? '#7a5644' : '#5a4036'; g.fillRect(x, yy, 4, 2);       // crosta clara
      g.fillStyle = '#3a2a26'; g.fillRect(x, yy + 2, 4, 2);                              // crosta escura
      if (dy) { g.fillStyle = '#4a352d'; g.fillRect(x, Math.min(yy, yy - dy), 2, Math.abs(dy) + 2); }
      g.fillStyle = 'rgba(10,5,8,.6)'; g.fillRect(x, yy + 4, 4, 3);                       // sombra embaixo
      if (r() < .12) { g.fillStyle = '#2a1c1a'; g.fillRect(x + (r() * 3 | 0), yy + 7 + (r() * 14 | 0), 2, 2 + (r() * 3 | 0)); }   // pedrinhas na terra
      if (r() < .05) { g.fillStyle = 'rgba(255,120,40,.8)'; g.fillRect(x + 1, yy + 6 + (r() * 10 | 0), 2, 2); }   // brasa
    });
    // tufos, pedras e galhos em cima da crosta
    g.fillStyle = '#140a10';
    for (let x = s.x + 10; x < s.x + s.w - 10; x += 14 + r() * 34) {
      const yy = base + ys[Math.round((x - s.x) / 4)] || base, t = r();
      if (t < .16) { g.fillRect(x, yy - 4, 10, 4); g.fillRect(x + 2, yy - 6, 6, 2); }
      else if (t < .26) { g.fillRect(x, yy - 2, 22, 2); g.fillRect(x + 14, yy - 6, 2, 4); }
      else { const n = 2 + (r() * 5 | 0), h = 4 + r() * 9; for (let i = 0; i < n; i++) g.fillRect(Math.round(x + i * 3), Math.round(yy - h + ((i * 7) % 5)), 2, Math.round(h - ((i * 7) % 5))); }
    }
  }
  return (pisoPronto = { c, topos });
}

// ---------- plataformas = galhos de árvores grandes (montadas uma vez) ----------
// Plataformas vizinhas (vão menor que 130 px) dividem uma árvore: o tronco fica no vão e cada
// plataforma vira um galho grosso saindo dele. Plataforma sozinha ganha tronco na ponta direita.
// O topo de cada galho fica exatamente na altura da plataforma (a colisão não muda).
// Com imagens da fase (arvore_tronco, arvore_raiz, arvore_galho em sprites/fundos/<fase>/), o jogo
// monta cada árvore com elas: tronco repetido na vertical, raiz na base, galho esticado até a
// largura da plataforma (espelhado quando vai para a esquerda). Sem imagens, desenha sozinho.
let arvoresProntas = null;
const perfilGalho = new Map();   // 'x|y da plataforma' -> quanto o galho desce ali (o herói acompanha)
// caminho pela frente das árvores: perto de uma árvore com raiz, o herói e as brasas descem na tela
// e passam por cima das raízes, na frente do tronco (só no desenho; a física não muda)
const FRENTE_MAX = 44;
function caminhoFrente(x) {
  const AR = arvoresProntas; if (!AR) return 0;
  let m = 0;
  for (const t of AR) {
    const rz = t.raizFrente; if (!rz) continue;
    const cx = rz.x + rz.w / 2, meia = rz.w * .5, d = Math.abs(x - cx) / meia;
    if (d < 1) { const s = 1 - d; m = Math.max(m, FRENTE_MAX * s * s * (3 - 2 * s)); }
  }
  return m;
}
function pecasArvore() {
  const F = FASE.fundo, t = layer(F, 'arvore_tronco'), g = layer(F, 'arvore_galho');
  const meta = (SPR[F] && SPR[F].meta) || {};
  return t && g ? { t, g, r: layer(F, 'arvore_raiz'), meta } : null;
}
function arvores() {
  const pecas = pecasArvore();
  if (arvoresProntas && (arvoresProntas.comImagem || !pecas)) return arvoresProntas;
  if (typeof document === 'undefined') return null;
  const lista = [...PLATS].sort((a, b) => a.x - b.x), grupos = [];
  for (const pl of lista) {
    const g = grupos[grupos.length - 1], ult = g && g[g.length - 1];
    if (ult && pl.x - (ult.x + ult.w) < 130 && g.length < 2) g.push(pl); else grupos.push([pl]);
  }
  const B = 2, q = v => Math.round(v / B) * B;
  const COR = { casca: '#2c1c17', sulco: '#1a0f0c', luz: '#4a3129', brilho: '#5e4034', brasa: '#ff7a2e' };
  const z = fundoPixel() || 1;
  arvoresProntas = grupos.map((g, gi) => {
    const r = mulberry(100 + gi);
    let tx, tw;   // centro e largura do tronco
    if (g.length === 2) { const a = g[0].x + g[0].w, b = g[1].x; tx = (a + b) / 2; tw = clamp(b - a + 40, 64, 104); }
    else { tx = g[0].x + g[0].w + 18; tw = 66; }
    if (pecas) tw = pecas.t.naturalWidth * z;
    const x0 = Math.floor(Math.min(...g.map(p => p.x), tx - tw) - 40), x1 = Math.ceil(Math.max(...g.map(p => p.x + p.w), tx + tw) + 40);
    const c = document.createElement('canvas'); c.width = x1 - x0; c.height = H;
    const ctx2 = c.getContext('2d'), R2 = (x, y, w, h, cor) => { ctx2.fillStyle = cor; ctx2.fillRect(q(x - x0), q(y), Math.max(B, q(w)), Math.max(B, q(h))); };
    const sobreChao = SOLIDS.some(s => tx >= s.x && tx < s.x + s.w && s.y >= GROUND - 1);
    const pe = sobreChao ? GROUND + 8 : H;
    if (pecas) {   // ---- montagem com as imagens
      ctx2.imageSmoothingEnabled = false;
      const { t, g: gal, r: raiz, meta } = pecas, th = t.naturalHeight * z;
      for (let y = pe - th; y > -th; y -= th) ctx2.drawImage(t, Math.round(tx - tw / 2 - x0), Math.round(y), tw, th + 1);
      const gh = gal.naturalHeight * z, topo = ((meta.arvore_galho && meta.arvore_galho.topo) || 0) * z;
      for (const pl of g) {
        const daDireita = pl.x > tx, ini = daDireita ? tx + tw * .35 : pl.x, fim = daDireita ? pl.x + pl.w : tx - tw * .35, L = Math.round(fim - ini);
        const y = Math.round(pl.y - topo);   // o topo medido do galho fica na altura da plataforma
        // rascunho: o galho esticado (e espelhado se vai para a esquerda), com folga para o caimento
        const rasc = document.createElement('canvas'); rasc.width = L; rasc.height = gh;
        const gr = rasc.getContext('2d'); gr.imageSmoothingEnabled = false;
        if (daDireita) gr.drawImage(gal, 0, 0, L, gh); else { gr.translate(L, 0); gr.scale(-1, 1); gr.drawImage(gal, 0, 0, L, gh); }
        // caimento em direção à ponta + ondulação, em degraus de 2 px; o herói pisa seguindo isso
        const cai = 6 + r() * 7, fase = r() * 6;
        for (let sx = 0; sx < L; sx += 4) {
          const k = daDireita ? sx / L : 1 - sx / L;                       // 0 no tronco, 1 na ponta
          const dy = Math.round((cai * k * k + Math.sin(k * 7 + fase) * 1.6 * k) / 2) * 2;
          ctx2.drawImage(rasc, sx, 0, 4, gh, Math.round(ini - x0) + sx, y + dy, 4, gh);
          perfilGalho.set(Math.floor((ini + sx) / 4) * 4 + '|' + pl.y, dy);
        }
      }
      // raiz em 2,5D: desenhada depois do piso, descendo pela frente do chão em direção à tela
      let raizFrente = null;
      if (raiz && sobreChao) {
        const rw = raiz.naturalWidth * z, rh = raiz.naturalHeight * z, cx = (meta.arvore_raiz && meta.arvore_raiz.centro) || .5;
        raizFrente = { img: raiz, x: Math.round(tx - rw * cx), y: H + 6 - rh, w: rw, h: rh };
      }
      return { c, x0, raizFrente };
    }
    // tronco: fica um pouco mais fino para cima, bordas tortas, sulcos verticais, rachaduras em brasa
    for (let y = 0; y < pe; y += B) {
      const k = y / pe, w = tw * (.78 + .22 * k) + (r() - .5) * 3;
      let l = tx - w / 2 + Math.sin(y * .03 + gi) * 3;
      if (sobreChao && y > pe - 40) { const f = (y - (pe - 40)) / 40; l -= f * f * 22; R2(l, y, w + f * f * 44, B, COR.casca); continue; }   // raízes
      R2(l, y, w, B, COR.casca);
      R2(l, y, 4, B, COR.luz);                       // luz na borda esquerda
      R2(l + w - 4, y, 4, B, COR.sulco);             // sombra na direita
      for (let sx = 10; sx < w - 8; sx += 9) if ((y + sx * 7) % 23 > 4) R2(l + sx + Math.sin(y * .05 + sx) * 1.5, y, 2, B, COR.sulco);
    }
    for (let i = 0; i < 5; i++) { const yy = 60 + r() * (pe - 140); R2(tx - tw * .2 + r() * tw * .3, yy, 2, 6 + r() * 10, COR.brasa); }
    for (let i = 0; i < 4; i++) {                    // nós da casca
      const nx = tx - tw * .3 + r() * tw * .5, ny = 40 + r() * (pe - 120);
      R2(nx - 6, ny - 2, 14, 10, COR.sulco); R2(nx - 4, ny, 10, 6, COR.casca); R2(nx - 2, ny + 2, 6, 2, COR.luz);
    }
    { const oy = 110 + r() * 60, ox = tx - 8;        // oco escuro com brilho de brasa no fundo
      for (let y = 0; y < 28; y += B) { const w = 18 * Math.sin(Math.PI * y / 28) + 2; R2(ox + 9 - w / 2, oy + y, w, B, '#0a0507'); }
      R2(ox + 6, oy + 18, 6, 2, '#a8401a'); }
    // galhos secos no alto do tronco
    for (let i = 0; i < 3; i++) {
      const lado = i % 2 ? -1 : 1, y0 = 30 + i * 55 + r() * 20;
      for (let j = 0; j < 11; j++) R2(tx + lado * (tw / 2 - 6 + j * 7), y0 - j * 5, 9, 10 - j * .7, COR.casca);
      for (let j = 0; j < 5; j++) R2(tx + lado * (tw / 2 + 30 + j * 6), y0 - 22 + j * 3, 7, 4, COR.casca);   // forquilha
    }
    // galhos-plataforma
    for (const pl of g) {
      const daDireita = pl.x > tx;                    // galho sai do tronco para a direita?
      const ini = daDireita ? tx + tw * .38 : pl.x, fim = daDireita ? pl.x + pl.w : tx - tw * .38, comp = fim - ini;   // nasce na borda do tronco
      for (let x = ini; x < fim; x += B) {
        const dist = daDireita ? x - ini : fim - x, k = dist / comp;          // 0 no tronco, 1 na ponta
        const esp = 26 - k * 11 + Math.sin(x * .17) * 1.6;                    // espessura
        const pontaQuebrada = k > .95 ? (r() * 6) : 0;
        R2(x, pl.y, B, esp - pontaQuebrada, COR.casca);
        R2(x, pl.y, B, 2, COR.brilho);                                        // topo claro (onde se pisa)
        R2(x, pl.y + 2, B, 2, COR.luz);
        R2(x, pl.y + esp - 4 - pontaQuebrada, B, 4, COR.sulco);               // sombra embaixo
        if ((x * 13) % 29 < 3) R2(x, pl.y + 6, B, esp - 10, COR.sulco);        // veios
      }
      { const nx = daDireita ? tx + tw / 2 - 10 : tx - tw / 2 - 8;            // nó onde o galho nasce
        R2(nx, pl.y - 2, 18, 34, COR.casca); R2(nx + 4, pl.y + 26, 10, 4, COR.sulco); }
      for (let i = 0; i < 3; i++) {                                           // raminhos e cipós embaixo
        const xx = ini + comp * (.25 + i * .25), len = 8 + r() * 26;
        for (let y = 0; y < len; y += B) R2(xx + (y % 8 < 4 ? 0 : 2), pl.y + 20 + y, 2, B, COR.sulco);
      }
      const brasaX = ini + comp * (.3 + r() * .5); R2(brasaX, pl.y + 6, 4, 2, COR.brasa);
    }
    return { c, x0 };
  });
  arvoresProntas.comImagem = !!pecas;
  return arvoresProntas;
}

// quanto o desenho do piso sobe (-) ou desce (+) em relação à linha da física, no ponto x
function deslocDesenho(cx, noChao, plat, plano) {
  if (plat && plat.y !== undefined) return { dy: perfilGalho.get(Math.floor(cx / 4) * 4 + '|' + plat.y) || 0, esc: 1 };
  if (camY > 0 && naSala(player)) return { dy: 0, esc: 1 };   // na sala secreta o piso é reto
  const fr = caminhoFrente(cx) * plano, k = fr / FRENTE_MAX;
  const rel = noChao ? relevo(cx) * (1 - k) : 0;
  return { dy: fr + rel, esc: 1 + .08 * k };
}
function relevo(x) {
  const P = pisoPronto; if (!P) return 0;
  const y = P.topos.get(Math.floor(x / 4) * 4);
  return y === undefined ? 0 : clamp(y - GROUND, -14, 10);
}

// baú em pixel art (blocos de 2 px): madeira, cintas douradas e fechadura; aberto mostra o ouro
function drawBaus() {
  for (const b of baus) {
    const x = Math.round(b.x - camX - 13), y = Math.round(b.y + relevoDe(b) - 18);
    if (x < -40 || x > W + 40) continue;
    const R = (dx, dy, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x + dx, y + dy, w, h); };
    const imF = layer('objetos/bau', 'fechado'), imA = layer('objetos/bau', 'aberto');
    if (imF) {   // arte da IA (fechado; aberto se existir, senão o fechado com o brilho do tesouro)
      const im = b.aberto && imA ? imA : imF, z = 2, w = im.naturalWidth * z, h = im.naturalHeight * z;
      const bx = Math.round(b.x - camX - w / 2), by = Math.round(b.y + relevoDe(b) + 2 - h);
      if (b.aberto && !imA) {
        const g = ctx.createRadialGradient(bx + w / 2, by + 4, 2, bx + w / 2, by + 4, 40);
        g.addColorStop(0, 'rgba(255,230,140,.85)'); g.addColorStop(1, 'rgba(255,200,80,0)');
        ctx.fillStyle = g; ctx.fillRect(bx - 30, by - 36, w + 60, 70);
      }
      ctx.imageSmoothingEnabled = false; ctx.drawImage(im, bx, by, w, h); ctx.imageSmoothingEnabled = true;
      if (!b.aberto && Math.sin(b.t * 2.4) > .7) { ctx.fillStyle = '#fff6c0'; ctx.fillRect(bx + w - 6, by + 2, 2, 2); }
      if (b.aberto && Math.random() < .2) particles.push({ x: b.x + rnd(-8, 8), y: b.y - h * .6, vx: rnd(-10, 10), vy: rnd(-50, -25), life: .9, max: .9, c: '#ffe08a', s: 2, g: -10 });
      continue;
    }
    if (!b.aberto) {
      R(0, 6, 26, 12, '#5a3418'); R(0, 0, 26, 8, '#6e4220'); R(2, 2, 22, 2, '#8a5a2c');   // corpo e tampa
      R(0, 7, 26, 2, '#2a160a');                                                         // fresta
      R(4, 0, 3, 18, '#c99a2e'); R(19, 0, 3, 18, '#c99a2e');                             // cintas
      R(11, 6, 4, 5, '#f5d060'); R(12, 8, 2, 2, '#3a2408');                              // fechadura
      if (Math.sin(b.t * 2.4) > .7) R(22, 1, 2, 2, '#fff6c0');                           // brilho de chamariz
    } else {
      R(0, 6, 26, 12, '#5a3418'); R(4, 6, 3, 12, '#c99a2e'); R(19, 6, 3, 12, '#c99a2e');
      R(2, 4, 22, 4, '#ffd34a'); R(5, 2, 4, 2, '#fff0a0'); R(14, 3, 5, 2, '#fff0a0');      // ouro
      R(0, -8, 26, 6, '#6e4220'); R(4, -8, 3, 6, '#c99a2e'); R(19, -8, 3, 6, '#c99a2e');   // tampa aberta
    }
  }
}
const relevoDe = b => (Math.abs(b.y - GROUND) < 2 ? relevo(b.x) : 0);

function drawWorld() {
  const C = FASE.cores, chao = layer(FASE.fundo, 'chao');
  if (chao && !groundPattern) groundPattern = ctx.createPattern(chao, 'repeat');
  const AR = arvores();
  if (AR) for (const t of AR) { const x = Math.round(t.x0 - camX); if (x < W && x + t.c.width > 0) ctx.drawImage(t.c, x, 0); }
  const P = piso();
  if (P) {
    const sx = clamp(Math.round(camX), 0, P.c.width - W);
    ctx.drawImage(P.c, sx, 0, W, P.c.height, sx - camX, PISO_TOPO, W, P.c.height);
  }
  if (AR) for (const t of AR) {
    const rz = t.raizFrente; if (!rz) continue;
    const x = Math.round(rz.x - camX); if (x > W || x + rz.w < 0) continue;
    ctx.imageSmoothingEnabled = false; ctx.drawImage(rz.img, x, rz.y, rz.w, rz.h); ctx.imageSmoothingEnabled = true;
  }
  for (const s of SOLIDS) {
    if (P && s.y >= GROUND - 1) continue;
    const x = s.x - camX; if (x > W || x + s.w < 0) continue;
    if (groundPattern) {
      const z = fundoPixel() || 1;   // o ladrilho em pixel art é guardado pequeno e ampliado aqui
      ctx.save(); ctx.translate(-camX, s.y); ctx.scale(z, z); ctx.imageSmoothingEnabled = z === 1;
      ctx.fillStyle = groundPattern; ctx.fillRect(s.x / z, 0, s.w / z, s.h / z); ctx.restore();
      continue;
    }
    ctx.fillStyle = C.chao; ctx.fillRect(x, s.y, s.w, s.h);
    const g = ctx.createLinearGradient(0, s.y, 0, s.y + 18);
    g.addColorStop(0, C.chaoTopo); g.addColorStop(1, C.chao);
    ctx.fillStyle = g; ctx.fillRect(x, s.y, s.w, 18);
    ctx.fillStyle = 'rgba(255,120,40,.6)';
    for (let i = 0; i < s.w; i += 37) { const ex = x + i + ((i * 13) % 20); if ((i / 37 | 0) % 3 === 0) ctx.fillRect(ex, s.y + 6 + (i % 7), 3, 2); }
  }
  if (!AR) for (const p of PLATS) {
    const x = p.x - camX; if (x > W || x + p.w < 0) continue;
    ctx.fillStyle = '#3a2418'; roundRect(x, p.y, p.w, 16, 8); ctx.fill();
    ctx.fillStyle = '#1e120c'; roundRect(x, p.y + 9, p.w, 7, 4); ctx.fill();
    ctx.fillStyle = 'rgba(255,120,40,.7)'; ctx.fillRect(x + p.w * .3, p.y + 4, 4, 2); ctx.fillRect(x + p.w * .7, p.y + 6, 3, 2);
  }
  for (const hz of HAZARDS) {
    const x = hz.x - camX; if (x > W || x + hz.w < 0) continue;
    ctx.fillStyle = 'rgba(255,90,20,.35)'; ctx.fillRect(x, GROUND - 4, hz.w, 4);
    if (!drawFogo(x + hz.w / 2, GROUND + relevo(hz.x + hz.w / 2), hz.w, hz.x * .37))
      for (let i = 8; i < hz.w; i += 16) flame(x + i, GROUND, 14, 26 + Math.sin(time * 9 + i) * 6, time * 12 + i);
  }
  const altar = sprite('objetos/altar') || SPR['objetos/altar'];
  const apagado = layer('objetos/altar', 'apagado'), aceso = layer('objetos/altar', 'aceso');
  if (apagado && aceso) CHECKS.forEach((c, i) => {
    const x = Math.round(c - camX); if (x < -80 || x > W + 80) return;
    const lit = i <= checkpoint, im = lit ? aceso : apagado, z = (altar && altar.pixel) || 2;
    const w = im.naturalWidth * z, h = im.naturalHeight * z, y = Math.round(GROUND + relevo(c) + 6 - h);
    ctx.imageSmoothingEnabled = false; ctx.drawImage(im, x - Math.round(w / 2), y, w, h); ctx.imageSmoothingEnabled = true;
    if (lit) {
      const dt0 = time - (altarAceso[i] ?? -9);
      if (dt0 < .6) { ctx.globalAlpha = 1 - dt0 / .6; ctx.fillStyle = '#fff3c8'; ctx.beginPath(); ctx.arc(x, y + h * .5, 30 + dt0 * 120, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
      if (Math.random() < .25) particles.push({ x: c + rnd(-8, 8), y: y + h * .35 + rnd(-6, 6), vx: rnd(-8, 8), vy: rnd(-50, -25), life: 1.1, max: 1.1, c: Math.random() < .5 ? '#ffd76a' : '#fff1b8', s: 2, g: -10 });
    }
  });
  else CHECKS.forEach((c, i) => {
    if (i === 0) return;
    const x = c - camX; if (x < -20 || x > W + 20) return;
    ctx.fillStyle = '#5b4a3c'; ctx.fillRect(x, GROUND - 46, 4, 46);
    ctx.fillStyle = i <= checkpoint ? '#9fe7ff' : '#7a6a5a';
    ctx.beginPath(); ctx.arc(x + 2, GROUND - 50, 7, 0, Math.PI * 2); ctx.fill();
  });
  const placaS = SPR['objetos/placa'], placa = placaS && placaS.camadas && layer('objetos/placa', Object.keys(placaS.camadas)[0]);
  if (placa) {
    const z = placaS.pixel || 2, w = placa.naturalWidth * z, h = placa.naturalHeight * z, px = ARENA.x0 + 40;
    const x = Math.round(px - camX - w / 2);
    if (x > -w && x < W + w) { ctx.imageSmoothingEnabled = false; ctx.drawImage(placa, x, Math.round(GROUND + relevo(px) + 4 - h), w, h); ctx.imageSmoothingEnabled = true; }
  } else if (!bossDefeated) {
    const x = ARENA.x0 + 40 - camX;
    if (x > -40 && x < W + 40) {
      ctx.fillStyle = '#3b2a20'; ctx.fillRect(x, GROUND - 60, 6, 60); ctx.fillRect(x - 26, GROUND - 70, 58, 30);
      ctx.fillStyle = '#ffb36b'; ctx.font = 'bold 18px Cinzel, serif'; ctx.textAlign = 'center'; ctx.fillText('!!', x + 3, GROUND - 49);
    }
  }
}

// ---------- sala secreta ----------
// Caverna embaixo de um buraco: só aparece quando a câmera desce. Enfeites montados uma vez.
let salaDecoPronta = null;
function salaDeco() {
  if (salaDecoPronta) return salaDecoPronta;
  const r = mulberry(23), D = { teto: [], parede: [], pedras: [], cogumelos: [], raizes: [] };
  for (let x = SALA.x0; x < SALA.x1; x += 10 + r() * 26) D.teto.push({ x, w: 8 + r() * 14, h: 6 + r() * (r() < .25 ? 46 : 18) });
  for (let y = SALA.topo; y < SALA.chao; y += 12 + r() * 20) D.parede.push({ y, e: 6 + r() * 26, d: 6 + r() * 26 });
  for (let x = SALA.x0 + 20; x < SALA.x1 - 20; x += 40 + r() * 90) D.pedras.push({ x, w: 10 + r() * 24, h: 4 + r() * 10 });
  for (let i = 0; i < 7; i++) D.cogumelos.push({ x: SALA.x0 + 60 + r() * (SALA.x1 - SALA.x0 - 120), y: SALA.chao, s: 1 + (r() * 2 | 0) });
  for (let i = 0; i < 9; i++) D.raizes.push({ x: SALA.x0 + 30 + r() * (SALA.x1 - SALA.x0 - 60), len: 30 + r() * 90, ph: r() * 6 });
  return (salaDecoPronta = D);
}
function drawSala() {
  if (!SALA) return;
  const B = 2, q = v => Math.round(v / B) * B, D = salaDeco();
  const x0 = Math.round(SALA.x0 - camX), x1 = Math.round(SALA.x1 - camX), topo = SALA.topo, chao = SALA.chao;
  // terra maciça embaixo do piso da fase, em toda a largura da tela
  const alt = SALA.fundo + 120 - H, z = fundoPixel() || 1;
  if (groundPattern) {
    ctx.save(); ctx.translate(-Math.round(camX), 0); ctx.scale(z, z); ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = groundPattern; ctx.fillRect(Math.floor(camX / z) - 2, H / z, W / z + 4, alt / z); ctx.restore();
    ctx.fillStyle = 'rgba(10,5,8,.62)'; ctx.fillRect(0, H, W, alt);
  } else { ctx.fillStyle = '#1b120e'; ctx.fillRect(0, H, W, alt); }
  // o poço que desce do buraco até o teto da sala
  for (const s of SOLIDS) for (const t of SOLIDS) if (t.x > s.x && t.x - (s.x + s.w) < 300 && t.x - (s.x + s.w) > 0 && s.x + s.w > SALA.x0 && t.x < SALA.x1) {
    ctx.fillStyle = '#0e080b'; ctx.fillRect(Math.round(s.x + s.w - camX), H, t.x - (s.x + s.w), topo - H + 2);
  }
  // o vão da caverna
  const g = ctx.createLinearGradient(0, topo, 0, chao);
  g.addColorStop(0, '#0d070a'); g.addColorStop(1, '#1e1216');
  ctx.fillStyle = g; ctx.fillRect(x0, topo, x1 - x0, chao - topo);
  // paredes irregulares, estalactites e raízes
  ctx.fillStyle = '#120a0c';
  for (const w of D.parede) { ctx.fillRect(x0, q(w.y), q(w.e), 14); ctx.fillRect(x1 - q(w.d), q(w.y), q(w.d), 14); }
  for (const t of D.teto) {
    const x = Math.round(t.x - camX);
    for (let y = 0; y < t.h; y += B) { const w = q(t.w * (1 - y / t.h)); if (w > 0) ctx.fillRect(x - w / 2, topo + y, w, B); }
  }
  ctx.fillStyle = '#2a1a14';
  for (const rz of D.raizes) {
    const x = Math.round(rz.x - camX);
    for (let y = 0; y < rz.len; y += B) ctx.fillRect(x + q(Math.sin(y * .06 + rz.ph) * 4), topo + y, B, B);
  }
  // piso da sala: crosta, pedras e cogumelinhos que brilham
  ctx.fillStyle = '#5a4036'; ctx.fillRect(x0, chao, x1 - x0, 2);
  ctx.fillStyle = '#3a2a26'; ctx.fillRect(x0, chao + 2, x1 - x0, 2);
  ctx.fillStyle = '#140a0d';
  for (const p of D.pedras) { const x = Math.round(p.x - camX); ctx.fillRect(x, chao - q(p.h), q(p.w), q(p.h)); ctx.fillRect(x + 2, chao - q(p.h) - 2, q(p.w) - 4, 2); }
  for (const c of D.cogumelos) {
    const x = Math.round(c.x - camX), k = c.s * B, brilho = .7 + .3 * Math.sin(time * 2 + c.x);
    ctx.fillStyle = '#cfc2a0'; ctx.fillRect(x - k / 2, chao - 3 * k, k, 3 * k);
    ctx.globalAlpha = brilho; ctx.fillStyle = '#5fe0cf'; ctx.fillRect(x - 2 * k, chao - 4 * k, 4 * k, k); ctx.fillRect(x - k, chao - 5 * k, 2 * k, k);
    ctx.globalAlpha = 1;
  }
  drawMola();
}
// cogumelo-mola: chapéu largo que afunda quando pisam e estica no pulo
function drawMola() {
  const B = 2, q = v => Math.round(v / B) * B, a = SALA.aperto, x = Math.round(SALA.mola - camX), chao = SALA.chao;
  const pisado = naSala(player) && player.naMola ? .35 : 0, sq = Math.max(a * (a > .5 ? -.4 : 1), pisado);   // estica no pulo, afunda pisado
  const hp = q(16 * (1 - sq * .6)), lc = q(56 * (1 + sq * .25)), hc = q(14 * (1 - sq * .3));
  ctx.fillStyle = '#cfc2a0'; ctx.fillRect(x - 6, chao - hp, 12, hp);                 // pé
  ctx.fillStyle = '#9d8f72'; ctx.fillRect(x + 2, chao - hp, 4, hp);
  const topoC = chao - hp - hc;
  for (let y = 0; y < hc; y += B) {                                                  // chapéu em meia-lua
    const w = q(lc * Math.sqrt(1 - ((hc - y) / hc) ** 2 * .85));
    ctx.fillStyle = y < B * 2 ? '#7ff5e4' : '#3fb7a8'; ctx.fillRect(x - w / 2, topoC + y, w, B);
  }
  ctx.fillStyle = '#1f6f66'; ctx.fillRect(x - lc / 2, chao - hp - 2, lc, 2);         // borda de baixo
  ctx.fillStyle = '#e8fffb';                                                          // pintas
  for (const [dx, dy] of [[-16, 4], [-2, 2], [12, 6], [20, 3]]) if (dy < hc - 2) ctx.fillRect(x + q(dx * (1 + sq * .25)), topoC + dy, 4, 2);
}

// ---------- luz (estilo Lanterna) ----------
// O mundo fica no escuro e só aparece em volta das fontes de luz: o herói, o fogo, os poderes,
// os inimigos que brilham e o chefe. A escuridão é uma camada em meia resolução com "furos"
// suaves; por cima vai um brilho colorido somado. ?semluz desliga.
const ESCURO = params.has('semluz') ? 0 : (FASE.escuridao ?? 0);
let luzCv = null, luzCtx = null;
function luzes() {
  const L = [], p = player, f = Math.sin(time * 7) * 4 + Math.sin(time * 13) * 2;
  // [x na tela, y, raio, cor 'R,G,B' ou null, força do brilho colorido]
  L.push([p.x + p.w / 2 - camX, p.y + p.h / 2 + deslocDesenho(p.x + p.w / 2, p.onGround, p.onPlat, p.plano ?? 1).dy, 200 + f, '255,225,180', .14]);
  L.push([luaTela[0], luaTela[1], 150, null, 0]);   // a lua
  for (const o of shots) L.push([o.x - camX, o.y, 90, PODER.corLuz || '150,210,255', .5]);
  for (const b of fireballs) L.push([b.x - camX, b.y, 130, '255,140,40', .55]);
  for (const e of enemies) if (!e.dead && e.T.luz) { const anda = e.T.mov === 'patrulha' && e.y + e.h >= GROUND - 2; L.push([e.x + e.w / 2 - camX, e.y + e.h / 2 + (anda ? deslocDesenho(e.x + e.w / 2, true, null, 1).dy : 0), e.T.luz + f, e.T.corLuz || '255,150,60', .4]); }
  for (const hz of HAZARDS) for (let x = hz.x + 25; x < hz.x + hz.w; x += 50) L.push([x - camX, GROUND - 10, 95 + f, '255,120,30', .4]);
  const comAltar = !!layer('objetos/altar', 'aceso');
  CHECKS.forEach((c, i) => {
    if (comAltar) L.push([c - camX, GROUND - 40, i <= checkpoint ? 150 + f : 55, i <= checkpoint ? '255,205,110' : null, .5]);
    else if (i > 0) L.push([c + 2 - camX, GROUND - 50, i <= checkpoint ? 110 : 60, i <= checkpoint ? '160,220,255' : null, .3]);
  });
  if (bossActive && boss && CHEFE.luzes) for (const [x, y, r, cor] of CHEFE.luzes(boss)) L.push([x - camX, y, r, cor, .45]);
  if (pendant) L.push([pendant.x - camX, pendant.y, 120, '220,230,255', .45]);
  if (SPR['objetos/placa']) L.push([ARENA.x0 + 40 - camX, GROUND - 40, 80 + f, '255,130,50', .35]);
  for (const b of baus) L.push([b.x - camX, b.y - 10, b.aberto ? 110 : 70, '255,210,90', b.aberto ? .5 : .3]);
  for (const e of enemies) if (e.T.mov === 'mimico') L.push([e.x + e.w / 2 - camX, e.y + e.h - 10, e.estado === 'dorme' ? 70 : 90, e.estado === 'dorme' ? '255,210,90' : '255,90,70', .3]);
  for (const d of drops) L.push([d.x - camX, d.y, 110, '255,220,120', .5]);
  if (SALA && camY > 0) {   // sala secreta: o cogumelo e os cogumelinhos brilham
    L.push([SALA.mola - camX, SALA.chao - 26, 180 + f, '110,240,220', .5]);
    for (const c of salaDeco().cogumelos) L.push([c.x - camX, c.y - 6, 75 + f, '110,240,220', .3]);
  }
  for (const l of L) l[1] -= camY;   // a câmera vertical sobe tudo (até a lua, desenhada com o fundo)
  return L.filter(l => l[0] > -l[2] && l[0] < W + l[2] && l[1] > -l[2] && l[1] < H + l[2]);
}
function drawLuz() {
  if (ESCURO <= 0 || typeof document === 'undefined') return;
  const k = .5;
  if (!luzCv) { luzCv = document.createElement('canvas'); luzCv.width = W * k; luzCv.height = H * k; luzCtx = luzCv.getContext('2d'); }
  const c = luzCtx, L = luzes();
  c.globalCompositeOperation = 'source-over';
  c.clearRect(0, 0, luzCv.width, luzCv.height);
  c.fillStyle = `rgba(6,3,14,${ESCURO})`; c.fillRect(0, 0, luzCv.width, luzCv.height);
  c.globalCompositeOperation = 'destination-out';
  for (const [x, y, r] of L) {
    const g = c.createRadialGradient(x * k, y * k, 0, x * k, y * k, r * k);
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.45, 'rgba(0,0,0,.75)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.fillRect((x - r) * k, (y - r) * k, 2 * r * k, 2 * r * k);
  }
  ctx.drawImage(luzCv, 0, 0, W, H);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const [x, y, r, cor, forca] of L) {
    if (!cor || forca < .45) continue;   // brilho colorido só nas luzes fortes (custa caro)
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * .8);
    g.addColorStop(0, `rgba(${cor},${forca * .35})`); g.addColorStop(1, `rgba(${cor},0)`);
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  ctx.restore();
}

// t = índice do quadro. Golpes, dano, pulo e morte avançam pelo progresso (0 a 1) e param no
// último quadro; parado e corrida repetem.
const QUADROS_ANTIGOS = 2;   // imagens pintadas: espada com 2 quadros
function playerAnim(S) {
  const p = player;
  const n = a => (S && S.quadros && S.quadros[a] && S.quadros[a].length) || QUADROS_ANTIGOS;
  const prog = (a, k) => ({ a, t: Math.min(n(a) - 1, clamp(k, 0, 1) * n(a)) });
  if (state === 'dead') return prog('morrer', (time - deadAt) / 1.1);
  if (p.inv > 0.7 && state === 'play') return prog('dano', (1 - p.inv) / 0.3);
  if (p.swordT > 0) return prog('espada', 1 - p.swordT / 0.18);
  if (p.powerT > 0) return prog('poder', 1 - p.powerT / 0.2);
  if (!p.onGround) return p.vy < 0 ? prog('pular', 1 + p.vy / JUMP_V) : prog('cair', p.vy / 600);
  if (Math.abs(p.vx) > 20) return { a: 'correr', t: S && S.pixel ? p.anim : p.anim * 2.2 };
  return { a: 'parado', t: time * (S && S.pixel ? 5 : 2) };
}

// golpe de espada: onda de ar em meia-lua que abre e afina enquanto some, com riscos de vento
// lança em pixel art (blocos de 2 px): cabo de madeira, fita vermelha e ponta de bronze
function desenhaLanca(comp) {   // deitada, da origem (cabo) para +x (ponta)
  const B = 2;
  ctx.fillStyle = '#2a160a'; ctx.fillRect(-B, -3, comp - 14 + B, 6);
  ctx.fillStyle = '#8a5a2c'; ctx.fillRect(0, -2, comp - 14, 4);
  ctx.fillStyle = '#b07a40'; ctx.fillRect(0, -2, comp - 14, 2);
  ctx.fillStyle = '#c0392b'; ctx.fillRect(comp - 22, -4, 6, 8); ctx.fillRect(comp - 26, 2, 4, 6);
  for (let i = 0; i < 9; i++) { const h = 16 - Math.round(i * 1.8); ctx.fillStyle = '#3a2410'; ctx.fillRect(comp - 16 + i * B, -Math.round(h / 2), B, h); }
  for (let i = 0; i < 8; i++) { const h = 12 - Math.round(i * 1.6); ctx.fillStyle = i < 2 ? '#c88a3a' : '#e0a84a'; ctx.fillRect(comp - 16 + i * B, -Math.round(h / 2), B, h); }
  ctx.fillStyle = '#fff0b8'; ctx.fillRect(comp - 14, -3, 8, 2);
}
function drawLancaCostas(cx, y, f) {
  ctx.save(); ctx.translate(Math.round(cx - f * 12), Math.round(y + 44)); ctx.scale(f, 1); ctx.rotate(-1.15);
  desenhaLanca(70); ctx.restore();
}
// estocada: a lança vai à frente e volta, com riscos de vento
function drawEstocada(cx, cy, f, k) {
  const vai = Math.sin(Math.min(1, k * 1.4) * Math.PI / 2), a = 1 - k;
  ctx.save(); ctx.translate(Math.round(cx + f * (vai * 34 - 6)), Math.round(cy)); ctx.scale(f, 1);
  desenhaLanca(76);
  ctx.fillStyle = `rgba(220,238,255,${.7 * a})`;
  for (const [dy, l, d] of [[-8, 26, 4], [7, 18, 14]]) ctx.fillRect(40 + d, dy, Math.round(l * (1 - k * .4)), 2);
  ctx.restore();
}
function drawGolpe(cx, cy, f, k) {
  const a = 1 - k, R = 24 + k * 26, esp = 14 * a + 3, abre = 1.05 + k * .25;
  ctx.save(); ctx.translate(Math.round(cx + f * (10 + k * 10)), Math.round(cy)); ctx.scale(f, 1);
  // meia-lua: arco de fora menos o de dentro (centro recuado = mais grossa no meio)
  ctx.beginPath();
  ctx.arc(0, 0, R, -abre, abre);
  ctx.arc(-esp, 0, R - esp * .35, abre * .92, -abre * .92, true);
  ctx.closePath();
  const g = ctx.createLinearGradient(R - esp * 1.6, 0, R, 0);
  g.addColorStop(0, `rgba(170,215,255,${.15 * a})`); g.addColorStop(.7, `rgba(225,242,255,${.7 * a})`); g.addColorStop(1, `rgba(255,255,255,${.95 * a})`);
  ctx.fillStyle = g; ctx.fill();
  // fio branco na borda de fora
  ctx.strokeStyle = `rgba(255,255,255,${.9 * a})`; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, R, -abre * .85, abre * .85); ctx.stroke();
  // riscos de vento à frente
  ctx.fillStyle = `rgba(220,238,255,${.6 * a})`;
  for (const [dy, l, d] of [[-14, 16, 6], [2, 22, 0], [16, 12, 10]]) ctx.fillRect(Math.round(R + 4 + d + k * 26), dy, Math.round(l * (1 - k * .5)), 2);
  ctx.restore();
}

// sombra fica no chão (ou no galho) embaixo do herói, menor e mais clara quanto mais alto ele está
function chaoAbaixo(cx, pe) {
  let y = null, plat = null;
  for (const pl of PLATS) if (cx >= pl.x && cx <= pl.x + pl.w && pl.y >= pe - 1 && (y === null || pl.y < y)) { y = pl.y; plat = pl; }
  for (const s of SOLIDS_COL) if (cx >= s.x && cx <= s.x + s.w && s.y >= pe - 1 && (y === null || s.y < y)) { y = s.y; plat = null; }
  return y === null ? null : { y, plat };
}
function drawSombra(p) {
  const cx = p.x + p.w / 2, pe = p.y + p.h, c = chaoAbaixo(cx, pe);
  if (!c) return;
  const alt = c.y - pe, k = clamp(1 - alt / 220, .25, 1);
  const off = deslocDesenho(cx, true, c.plat, c.plat ? 0 : (p.plano ?? 1)).dy;
  ctx.fillStyle = `rgba(0,0,0,${.38 * k})`;
  ctx.beginPath(); ctx.ellipse(Math.round(cx - camX), Math.round(c.y + off + 1), 15 * k, 3 * k, 0, 0, Math.PI * 2); ctx.fill();
}

function drawPlayer() {
  const p = player;
  if (p.inv > 0 && Math.floor(p.inv * 12) % 2 === 0 && state === 'play') return;
  // o desenho acompanha o relevo do piso, a curva do galho e o caminho pela frente das árvores
  const { dy: noPiso, esc } = deslocDesenho(p.x + p.w / 2, p.onGround, p.onPlat, p.plano ?? 1);
  const x = Math.round(p.x - camX), y = Math.round(p.y + noPiso), f = p.face;
  const S = sprite(HEROI.sprite);
  if (S) {
    const { a, t } = playerAnim(S);
    // com quadros de verdade a própria animação já respira e corre: sem balanço nem achatamento extra
    const real = temAnim(S, a);
    const sq = p.landT > 0 && !S.pixel ? p.landT / 0.14 : 0;
    let bob = real ? 0 : a === 'correr' ? -Math.abs(Math.sin(p.anim * 6)) * 2 : a === 'parado' ? Math.sin(time * 3) * .8 : 0;
    // Pose que ainda não tem imagem: o próprio jogo dá o movimento à imagem que existe
    // (inclina, quica e estica). Assim o herói funciona até com uma imagem só.
    let rot = 0, ex = 1, ey = 1;
    if (!real) {
      if (a === 'correr') { const c = Math.sin(p.anim * 6); rot = .09 + c * .04; bob = -Math.abs(c) * 5; ey = 1 - Math.abs(c) * .03; }
      else if (a === 'pular') { ex = .93; ey = 1.07; rot = -.04; }
      else if (a === 'cair') { ex = 1.03; ey = .98; rot = .07; }
      else if (a === 'espada') { rot = t < .8 ? -.16 : .2; ex = t < .8 ? 1 : 1.06; }
      else if (a === 'poder') { rot = .1; ex = 1.04; }
      else if (a === 'dano') { rot = -.24; }
      else if (a === 'parado') { ey = 1 + Math.sin(time * 3) * .012; }
    }
    drawSombra(p);
    if (itens.ataque === 'lanca' && p.swordT <= 0) drawLancaCostas(x + p.w / 2, y, f);
    drawFrame(S, a, t, x + p.w / 2, y + p.h + 1 + bob, f, esc * ex * (1 + sq * .12), esc * ey * (1 - sq * .14), rot);
  } else drawPlayerShape(x, y, f);
  if (p.swordT > 0) { if (arma().altura === 'fina') drawEstocada(x + p.w / 2, y + 26, f, 1 - p.swordT / 0.18); else drawGolpe(x + p.w / 2, y + 24, f, 1 - p.swordT / 0.18); }
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

// Mímico: a imagem do baú cortada na linha da tampa. Dormindo é igual a um baú (até o brilho);
// acordado, a tampa abre pela dobradiça (do lado de trás) e aparecem dentes, língua e olhos.
function drawMimico(e, x) {
  const im = layer('objetos/bau', 'fechado'), z = 2, chao = Math.round(e.y + e.h);
  const tremor = e.estado === 'acorda' ? Math.round(Math.sin(time * 60) * 2) : 0;
  const ab = e.estado === 'dorme' ? 0 : e.estado === 'acorda' ? (Math.sin(time * 30) > .5 ? .12 : 0) : e.boca;
  const cx = Math.round(x + e.w / 2 + tremor);
  if (!im) {   // sem a imagem do baú: caixa desenhada
    ctx.fillStyle = '#5a3418'; ctx.fillRect(cx - 23, chao - 30, 46, 30);
    ctx.fillStyle = '#6e4220'; ctx.fillRect(cx - 23, chao - 40 - ab * 18, 46, 12);
    return;
  }
  const nw = im.naturalWidth, nh = im.naturalHeight, w = nw * z, h = nh * z, corte = Math.round(nh * .42);
  const bx = cx - w / 2, by = chao + 2 - h, linha = by + corte * z, abre = Math.round(ab * 22);
  ctx.imageSmoothingEnabled = false;
  if (ab > .05) {   // boca: fundo escuro, língua, olhos e dentes de baixo
    ctx.fillStyle = '#2a0608'; ctx.fillRect(bx + 4, linha - abre, w - 8, abre + 6);
    ctx.fillStyle = '#c94a62'; ctx.fillRect(cx - 8, linha - 4, 18, 6); ctx.fillRect(cx + e.face * 8, linha - 6, 8, 4);
    if (abre > 8) { ctx.fillStyle = '#ffd54a'; ctx.fillRect(cx - 12, linha - abre + 4, 4, 4); ctx.fillRect(cx + 8, linha - abre + 4, 4, 4); }
    ctx.fillStyle = '#f4ead2';
    for (let i = 0; i < 5; i++) ctx.fillRect(Math.round(bx + 8 + i * (w - 18) / 4), linha - 5, 4, 5);
  }
  ctx.drawImage(im, 0, corte, nw, nh - corte, bx, linha, w, h - corte * z);   // corpo do baú
  // tampa (com os dentes de cima), girando pela dobradiça de trás
  const dob = e.face > 0 ? bx : bx + w;
  ctx.save(); ctx.translate(dob, linha); ctx.rotate(-e.face * ab * .65);
  ctx.drawImage(im, 0, 0, nw, corte, bx - dob, -corte * z, w, corte * z);
  if (ab > .05) { ctx.fillStyle = '#f4ead2'; for (let i = 0; i < 5; i++) ctx.fillRect(Math.round(bx - dob + 6 + i * (w - 16) / 4), 0, 4, 6); }
  ctx.restore();
  if (e.estado === 'dorme' && Math.sin(e.t * 2.4) > .7) { ctx.fillStyle = '#fff6c0'; ctx.fillRect(bx + w - 6, by + 2, 2, 2); }   // o mesmo brilho de chamariz do baú
  ctx.imageSmoothingEnabled = true;
}
// prêmios no chão (ex.: a lança que o mímico solta), flutuando e brilhando
function drawDrops() {
  for (const d of drops) {
    ctx.save(); ctx.translate(Math.round(d.x - camX), Math.round(d.y + Math.sin(d.t * 3) * 4)); ctx.rotate(-.8); ctx.translate(-32, 0);
    if (d.tipo === 'lanca') desenhaLanca(64); else { ctx.fillStyle = '#ffe28a'; ctx.fillRect(20, -8, 16, 16); }
    ctx.restore();
  }
}
function drawEnemies() {
  for (const e of enemies) {
    const x = e.x - camX; if (x < -60 || x > W + 60) continue;
    if (x > 0 && x < W && e.estado !== 'dorme') encontrar(e.tipo);   // o mímico dormindo ainda é "um baú"
    const anda = e.T.mov === 'patrulha' && e.y + e.h >= GROUND - 2;
    const dE = anda ? deslocDesenho(e.x + e.w / 2, true, null, 1).dy : 0;
    ctx.save(); ctx.translate(0, Math.round(dE));
    const S = e.T.sprite ? sprite(e.T.sprite) : null;
    if (e.T.mov === 'mimico') drawMimico(e, x);
    else if (S) {
      const face = e.T.mov === 'patrulha' ? (e.vx > 0 ? 1 : -1) : (player.x > e.x ? 1 : -1);
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
    ctx.restore();
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

function drawHUDArte(p, dtH, bV, bB, cN) {
  seguirRastro('hp', p.hp / maxHp(), dtH);
  // painel discreto atrás
  const pg = ctx.createLinearGradient(10, 0, 330, 0); pg.addColorStop(0, 'rgba(8,5,12,.7)'); pg.addColorStop(1, 'rgba(8,5,12,0)');
  ctx.fillStyle = pg; ctx.fillRect(10, 8, 320, 82);
  // medalhão do nível
  const md = 70, mk = md / cN.h, mx = 12, my = 12;
  ctx.fillStyle = '#1c1218'; ctx.beginPath(); ctx.arc(mx + cN.cx * mk, my + cN.cy * mk, cN.r * mk + 1, 0, Math.PI * 2); ctx.fill();
  const mg = ctx.createRadialGradient(mx + cN.cx * mk - 6, my + cN.cy * mk - 8, 2, mx + cN.cx * mk, my + cN.cy * mk, cN.r * mk);
  mg.addColorStop(0, '#3a2a30'); mg.addColorStop(1, '#120a10'); ctx.fillStyle = mg; ctx.fill();
  ctx.drawImage(cN.image, mx, my, cN.w * mk, md);
  ctx.textAlign = 'center'; ctx.fillStyle = '#c9a24e'; ctx.font = '9px "Crimson Pro", serif';
  ctx.fillText('NÍVEL', mx + cN.cx * mk, my + cN.cy * mk - 9);
  ctx.fillStyle = '#f6d98a'; ctx.font = 'bold 22px Cinzel, serif'; ctx.fillText(p.lvl, mx + cN.cx * mk, my + cN.cy * mk + 13);
  // vida e energia
  const vene = p.poison > 0;
  barraArte(bV, 86, 16, 220, 24, p.hp / maxHp(), rastro.hp, vene ? '#a8f07a' : '#f0605a', vene ? '#3f8a2a' : '#8e1c22');
  barraArte(bV, 86, 42, 190, 18, p.pe / maxPe(), 0, PODER.cores[1], PODER.cores[2]);
  // XP: filete dourado fino
  const xf = clamp(p.xp / xpNeed(), 0, 1);
  ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(100, 66, 170, 3); ctx.fillStyle = '#e3b75a'; ctx.fillRect(100, 66, 170 * xf, 3);
  ctx.textAlign = 'left'; ctx.font = 'bold 11px "Crimson Pro", serif'; ctx.fillStyle = '#fff';
  ctx.fillText(Math.ceil(Math.max(0, p.hp)) + ' / ' + maxHp(), 112, 32);
  ctx.fillStyle = '#e8f2ff'; ctx.font = 'bold 10px "Crimson Pro", serif'; ctx.fillText(Math.floor(p.pe) + ' / ' + maxPe(), 110, 55);
  ctx.fillStyle = '#b3a88f'; ctx.font = '12px "Crimson Pro", serif';
  ctx.fillText(`${HEROI.nome} · V${p.attr.V} F${p.attr.F} I${p.attr.I} A${p.attr.A}${itens.ataque !== 'espada' ? ' · ' + arma().nome : ''}`, 100, 82);
  // chefe
  if (bossActive && boss && !boss.dead) {
    const frac = boss.fire / boss.max, furia = CHEFE.enraged && CHEFE.enraged(boss);
    seguirRastro('boss', frac, dtH);
    const pc = bB || bV, bh = 34, bw = 440, bx = W / 2 - bw / 2, by = H - bh - 6;
    ctx.textAlign = 'center'; ctx.fillStyle = '#ffd9a0'; ctx.font = 'bold 19px Cinzel, serif';
    ctx.fillText(CHEFE_CFG.nome, W / 2, by - 4);
    barraArte(pc, bx, by, bw, bh, frac, rastro.boss, furia ? '#ff6a3a' : '#ffb04a', furia ? '#8a1206' : '#b33a0e');
  } else rastro.boss = 1;
  drawBanner();
}

// ---------- barras estilizadas ----------
// Moldura escura com fio dourado, ponteiras em losango, brilho em cima, marcas a cada 10% e o
// "rastro" claro do dano (a parte perdida some devagar, como nos jogos de ação sombrios).
const rastro = { hp: 1, boss: 1, hpT: 0, bossT: 0 };
function seguirRastro(chave, frac, dt) {
  if (frac > rastro[chave]) { rastro[chave] = frac; rastro[chave + 'T'] = 0; return; }
  rastro[chave + 'T'] += dt;
  if (rastro[chave + 'T'] > .45) rastro[chave] = Math.max(frac, rastro[chave] - dt * .5);
}
function losango(x, y, r, cor, borda) {
  ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.closePath();
  ctx.fillStyle = cor; ctx.fill(); if (borda) { ctx.strokeStyle = borda; ctx.lineWidth = 1; ctx.stroke(); }
}
function barraOrnada(x, y, w, h, frac, lag, c1, c2, marcas = true) {
  frac = clamp(frac, 0, 1); lag = clamp(Math.max(lag, frac), 0, 1);
  ctx.fillStyle = '#0c070b'; ctx.fillRect(x - 3, y - 3, w + 6, h + 6);                     // moldura
  ctx.strokeStyle = '#8a6a32'; ctx.lineWidth = 1; ctx.strokeRect(x - 2.5, y - 2.5, w + 5, h + 5);
  ctx.fillStyle = '#1c1218'; ctx.fillRect(x, y, w, h);                                     // fundo
  if (lag > frac) { ctx.fillStyle = 'rgba(245,228,190,.85)'; ctx.fillRect(x + w * frac, y, w * (lag - frac), h); }
  if (frac > 0) {
    const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, c1); g.addColorStop(1, c2);
    ctx.fillStyle = g; ctx.fillRect(x, y, Math.max(1, w * frac), h);
    ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(x, y, Math.max(1, w * frac), Math.max(1, h * .3));   // brilho
  }
  if (marcas) { ctx.fillStyle = 'rgba(0,0,0,.35)'; for (let i = 1; i < 10; i++) ctx.fillRect(Math.round(x + w * i / 10), y, 1, h); }
  losango(x - 4, y + h / 2, h / 2 + 3, '#c9a24e', '#3a2a14');                              // ponteiras
  losango(x + w + 4, y + h / 2, h / 2 + 3, '#c9a24e', '#3a2a14');
}
// barra com a moldura da IA: pontas fixas, meio esticado; o enchimento vai por baixo, no buraco
function pecaHud(nome) { const h = SPR.hud && SPR.hud.pecas && SPR.hud.pecas[nome]; return h && ready(h.image) ? h : null; }
function barraArte(pc, x, y, w, h, frac, lag, c1, c2) {
  frac = clamp(frac, 0, 1); lag = clamp(Math.max(lag, frac), 0, 1);
  const k = h / pc.h, cL = pc.ix0 + 6, cR = pc.w - pc.ix1 + 6;            // largura das pontas (px da imagem)
  const ix = x + pc.ix0 * k, iy = y + pc.iy0 * k, iw = w - (pc.ix0 + pc.w - pc.ix1) * k, ih = (pc.iy1 - pc.iy0) * k;
  ctx.fillStyle = '#140c12'; ctx.fillRect(ix, iy, iw, ih);
  if (lag > frac) { ctx.fillStyle = 'rgba(245,228,190,.85)'; ctx.fillRect(ix + iw * frac, iy, iw * (lag - frac), ih); }
  if (frac > 0) {
    const g = ctx.createLinearGradient(0, iy, 0, iy + ih); g.addColorStop(0, c1); g.addColorStop(1, c2);
    ctx.fillStyle = g; ctx.fillRect(ix, iy, iw * frac, ih);
    ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(ix, iy, iw * frac, Math.max(1, ih * .28));
  }
  const im = pc.image;
  ctx.drawImage(im, 0, 0, cL, pc.h, x, y, cL * k, h);                                       // ponta esquerda
  ctx.drawImage(im, cL, 0, pc.w - cL - cR, pc.h, x + cL * k, y, w - (cL + cR) * k, h);       // meio esticado
  ctx.drawImage(im, pc.w - cR, 0, cR, pc.h, x + w - cR * k, y, cR * k, h);                   // ponta direita
}
function drawHUD() {
  const p = player, dtH = 1 / 60;
  const bV = pecaHud('barra_vida'), bB = pecaHud('barra_boss'), cN = pecaHud('circulo_nivel');
  if (bV && cN) { drawHUDArte(p, dtH, bV, bB, cN); return; }
  seguirRastro('hp', p.hp / maxHp(), dtH);
  // painel com cantos dourados
  ctx.fillStyle = 'rgba(10,6,14,.72)'; ctx.fillRect(12, 10, 286, 76);
  ctx.strokeStyle = 'rgba(201,162,78,.55)'; ctx.lineWidth = 1; ctx.strokeRect(12.5, 10.5, 285, 75);
  for (const [cx, cy] of [[12, 10], [298, 10], [12, 86], [298, 86]]) losango(cx, cy, 4, '#c9a24e');
  // medalhão do nível
  const mg = ctx.createRadialGradient(42, 40, 4, 46, 46, 25); mg.addColorStop(0, '#f6d98a'); mg.addColorStop(1, '#a67a2c');
  ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(46, 46, 24, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#3a2a14'; ctx.lineWidth = 2; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,240,200,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(46, 46, 19, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#1a1424'; ctx.textAlign = 'center';
  ctx.font = '10px "Crimson Pro", serif'; ctx.fillText('NÍVEL', 46, 38);
  ctx.font = 'bold 21px Cinzel, serif'; ctx.fillText(p.lvl, 46, 60);
  const vene = p.poison > 0;
  barraOrnada(92, 20, 190, 12, p.hp / maxHp(), rastro.hp, vene ? '#a8f07a' : '#f0605a', vene ? '#3f8a2a' : '#8e1c22');
  barraOrnada(92, 42, 190, 9, p.pe / maxPe(), 0, PODER.cores[1], PODER.cores[2]);
  barraOrnada(92, 60, 190, 4, p.xp / xpNeed(), 0, '#ffe39a', '#b8862e', false);
  ctx.textAlign = 'left'; ctx.font = 'bold 11px "Crimson Pro", serif'; ctx.fillStyle = '#fff';
  ctx.fillText('Vida ' + Math.ceil(Math.max(0, p.hp)) + '/' + maxHp(), 98, 30);
  ctx.fillText('Energia ' + Math.floor(p.pe) + '/' + maxPe(), 98, 50);
  ctx.fillStyle = '#b3a88f'; ctx.font = '12px "Crimson Pro", serif';
  ctx.fillText(`${HEROI.nome} · V${p.attr.V} F${p.attr.F} I${p.attr.I} A${p.attr.A}${itens.ataque !== 'espada' ? ' · ' + arma().nome : ''}`, 90, 80);

  if (bossActive && boss && !boss.dead) {
    const frac = boss.fire / boss.max, bw = 380, bx = W / 2 - bw / 2, by = H - 34, furia = CHEFE.enraged && CHEFE.enraged(boss);
    seguirRastro('boss', frac, dtH);
    // nome com filetes dos lados
    ctx.textAlign = 'center'; ctx.fillStyle = '#ffd9a0'; ctx.font = 'bold 19px Cinzel, serif';
    // embaixo, no centro (entre os botões de toque), como nos jogos de ação sombrios
    const ny = by - 10;
    ctx.fillText(CHEFE_CFG.nome, W / 2, ny);
    const tw = ctx.measureText(CHEFE_CFG.nome).width / 2 + 14;
    ctx.fillStyle = 'rgba(201,162,78,.8)'; ctx.fillRect(W / 2 - tw - 70, ny - 6, 70, 1); ctx.fillRect(W / 2 + tw, ny - 6, 70, 1);
    losango(W / 2 - tw - 72, ny - 5.5, 3, '#c9a24e'); losango(W / 2 + tw + 72, ny - 5.5, 3, '#c9a24e');
    // pontas em chama nas extremidades (ornamento)
    for (const lado of [-1, 1]) {
      const ex = lado < 0 ? bx - 10 : bx + bw + 10;
      ctx.fillStyle = '#c9a24e';
      ctx.beginPath(); ctx.moveTo(ex, by + 7); ctx.lineTo(ex + lado * 22, by - 6); ctx.lineTo(ex + lado * 14, by + 7); ctx.lineTo(ex + lado * 22, by + 20); ctx.closePath(); ctx.fill();
      ctx.fillStyle = furia ? '#ff3a1a' : '#ff8a2e'; ctx.beginPath(); ctx.arc(ex + lado * 6, by + 7, 3, 0, Math.PI * 2); ctx.fill();
    }
    barraOrnada(bx, by, bw, 14, frac, rastro.boss, furia ? '#ff6a3a' : '#ffb04a', furia ? '#8a1206' : '#b33a0e');
    ctx.fillStyle = '#ece4d4'; ctx.font = '10px "Crimson Pro", serif'; ctx.fillText(CHEFE_CFG.rotuloVida, W / 2, by + 11);
  } else rastro.boss = 1;
  drawBanner();
}

// ---------- pergaminho da placa do chefe ----------
// Perto da placa (antes da arena) abre um pergaminho com quem é o chefe (FASE.placa). Com a imagem
// hud/pergaminho, usa a arte; sem ela, desenha um pergaminho simples.
let pergA = 0;
function drawPergaminho() {
  const P = FASE.placa; if (!P) return;
  const px = ARENA.x0 + 40, perto = state === 'play' && !bossActive && !bossDefeated && Math.abs(player.x + player.w / 2 - px) < 130;
  pergA = clamp(pergA + (perto ? 1 : -1) * (1 / 60) * 4, 0, 1);
  if (pergA <= 0) return;
  const w = 470, h = 250, x = W / 2 - w / 2, y = 70 - (1 - pergA) * 20;
  ctx.save(); ctx.globalAlpha = pergA;
  const art = pecaHud('pergaminho');
  if (art) ctx.drawImage(art.image, x - 40, y - 30, w + 80, h + 60);
  else {
    const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#e9d6a8'); g.addColorStop(1, '#cdb27a');
    ctx.fillStyle = g; ctx.fillRect(x, y + 10, w, h - 20);
    const vg = ctx.createRadialGradient(x + w / 2, y + h / 2, 60, x + w / 2, y + h / 2, w * .62);
    vg.addColorStop(0, 'rgba(90,50,20,0)'); vg.addColorStop(1, 'rgba(90,50,20,.45)');
    ctx.fillStyle = vg; ctx.fillRect(x, y + 10, w, h - 20);
    for (const yy of [y, y + h - 20]) {   // rolos em cima e embaixo
      const rg = ctx.createLinearGradient(0, yy, 0, yy + 20); rg.addColorStop(0, '#b8955a'); rg.addColorStop(.5, '#f0dfb4'); rg.addColorStop(1, '#8a6a38');
      ctx.fillStyle = rg; roundRect(x - 14, yy, w + 28, 20, 10); ctx.fill();
    }
  }
  ctx.textAlign = 'center';
  ctx.fillStyle = '#5a1e0c'; ctx.font = '34px "IM Fell English SC", Cinzel, serif';
  ctx.fillText(P.titulo, W / 2, y + 62);
  ctx.fillStyle = '#6e4a24'; ctx.font = 'italic 17px "IM Fell English", serif';
  ctx.fillText(P.subtitulo, W / 2, y + 86);
  ctx.fillStyle = 'rgba(110,74,36,.6)'; ctx.fillRect(W / 2 - 90, y + 96, 180, 1);
  ctx.fillStyle = '#3a2410'; ctx.font = '17px "IM Fell English", serif';
  wrap(P.texto, W / 2, y + 124, w - 90, 21);
  ctx.restore();
}

function drawBanner() {
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
  const fade = clamp((time - deadAt - 0.6) / 0.6, 0, 1);   // deixa ver a queda do herói antes
  if (fade <= 0) return;
  ctx.globalAlpha = fade;
  ctx.fillStyle = 'rgba(30,6,6,.7)'; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center'; ctx.fillStyle = '#ff9a8a'; ctx.font = 'bold 42px Cinzel, serif';
  ctx.fillText('Você foi derrotado', W / 2, 220);
  ctx.fillStyle = '#ece4d4'; ctx.font = '20px "Crimson Pro", serif';
  ctx.fillText('Seu nível e seus atributos continuam com você.', W / 2, 262);
  ctx.fillStyle = '#f5d48a'; ctx.font = 'bold 22px Cinzel, serif';
  ctx.fillText(showTouch ? 'Toque para voltar ao último ponto de controle' : 'Clique ou Enter para voltar ao último ponto de controle', W / 2, 320);
  ctx.globalAlpha = 1;
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

const HD = params.has('hd');
// ?perf: tempo médio (ms) de cada parte do desenho, para achar o que pesa
const PERF = params.has('perf') ? {} : null;
function medir(nome, fn) {
  if (!PERF) return fn();
  const t0 = performance.now(); fn();
  const m = PERF[nome] || (PERF[nome] = { s: 0, n: 0 }); m.s += performance.now() - t0; m.n++;
}
let mundoCv = null, mundoCtx = null;
let fpsN = 0, fpsT = 0, fps = 0;
function draw() {
  ctx = tela;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#0b0910'; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, ox, oy);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
  if (portrait) { drawPortrait(); ctx.restore(); return; }
  if (state === 'title') { drawTitle(); ctx.restore(); return; }
  if (state === 'mapa') { drawMapa(); ctx.restore(); return; }
  if (state === 'bestiario') { drawBestiario(); ctx.restore(); return; }
  if (state === 'herois') { drawHerois(); ctx.restore(); return; }
  if (!HD) {
    if (!mundoCv) { mundoCv = document.createElement('canvas'); mundoCv.width = W; mundoCv.height = H; mundoCtx = mundoCv.getContext('2d', { alpha: false }); }
    ctx = mundoCtx; ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  const sh = shake > 0 ? shake * 14 : 0;
  ctx.save(); ctx.translate(rnd(-sh, sh), rnd(-sh, sh) - Math.round(camY));
  medir('fundo', () => { drawBackground(); if (camY > 0) drawSala(); }); medir('mundo', () => { drawWorld(); drawBaus(); drawEnemies(); drawDrops(); });
  if (bossActive && boss) medir('chefe', () => CHEFE.desenhar(boss));
  medir('perso', () => { if (!piso()) drawChao(); drawPlayer(); drawProjectiles(); drawParticles(); });
  medir('frente', drawFrente);
  ctx.restore();
  medir('luz', drawLuz);
  if (!HD) {
    ctx = tela;
    ctx.imageSmoothingEnabled = false; ctx.drawImage(mundoCv, 0, 0, W, H); ctx.imageSmoothingEnabled = true;
  }
  drawRetrato(); drawHUD(); drawPergaminho(); drawTouch();
  if (PERF) {
    ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillRect(W - 230, 60, 220, 22 + 18 * Object.keys(PERF).length);
    ctx.fillStyle = '#9f9'; ctx.font = '14px monospace'; ctx.textAlign = 'left';
    Object.entries(PERF).forEach(([k, m], i) => ctx.fillText(k.padEnd(7) + (m.s / Math.max(1, m.n)).toFixed(2) + ' ms', W - 220, 80 + i * 18));
  }
  if (params.has('fps') || PERF) {
    const agora = performance.now() / 1000; fpsN++; if (agora - fpsT >= 1) { fps = Math.round(fpsN / (agora - fpsT)); fpsN = 0; fpsT = agora; }
    ctx.fillStyle = '#9f9'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'right'; ctx.fillText(fps + ' fps', W - 12, 46);
  }
  if (state === 'levelup') drawLevelUp();
  if (state === 'dead') drawDead();
  if (state === 'victory') drawVictory();
  ctx.restore();
}

// ---------- laço principal ----------
let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);   // agenda antes: um erro num quadro não congela o jogo
  try {
    const dt = clamp((now - last) / 1000, 0, 1 / 30); last = now;
    if (state === 'play' && !portrait) update(dt); else time += dt;
    jumpPressed = swordPressed = powerPressed = downPressed = false;
    draw();
  } catch (e) { if (window.mostrarErro) window.mostrarErro(e); }
}
if (DEMO || params.has('play')) newGame();
else if (params.has('mapa')) abrirMapa();   // teste: abre direto no mapa
else if (params.has('herois')) abrirHerois();
else if (params.has('bestiario')) abrirBestiario();   // teste: abre no bestiário   // teste: abre na seleção de herói
// teste: ?demo&ff=600 avança 600 quadros antes de desenhar (para capturas de tela)
for (let i = 0, n = +params.get('ff') || 0; i < n && state === 'play'; i++) { update(1 / 60); jumpPressed = swordPressed = powerPressed = false; }
requestAnimationFrame(frame);
