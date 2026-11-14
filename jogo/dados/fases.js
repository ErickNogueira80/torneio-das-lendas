/* Fases do Torneio das Lendas. Uma ficha por monstro do bestiário (ele é o chefe no fim).
   Coordenadas em pixels de jogo (tela virtual de 960×540; o chão fica em y = 460).
   O comportamento de cada chefe fica no motor (CHEFES em jogo.js); aqui ficam só os números. */

/* Tipos de inimigo comuns. mov: 'patrulha' (anda de um lado a outro entre x1 e x2) ou
   'voo' (flutua em volta do ponto x, y). resist: multiplicador de dano por elemento (0 = imune).
   luz: raio da luz que o inimigo espalha no escuro; corLuz: cor dela em 'R,G,B'. */
window.INIMIGOS = {
  brasa: { nome: 'Brasa', mov: 'patrulha', w: 26, h: 26, dano: 8, xp: 10, sprite: 'inimigos/brasa', luz: 90, corLuz: '255,140,50',
    resist: { agua: 1.5, fogo: 0, terra: 1, ar: 1, espada: 1 } },
  vagalume: { nome: 'Vaga-lume de fogo', mov: 'voo', w: 22, h: 22, dano: 6, xp: 15, sprite: 'inimigos/vagalume', luz: 80, corLuz: '255,200,90',
    resist: { agua: 1.5, fogo: 0, terra: 1, ar: 1.2, espada: 1 } },
};

window.FASES = {
  boitata: {
    // escuridão do estilo Lanterna: 0 = sem escuro, 1 = breu (só se vê onde há luz)
    escuridao: 0.78,
    // texto do pergaminho da placa antes do chefe: quem é, sem dica de como derrotar
    placa: {
      titulo: 'Boitatá',
      subtitulo: 'A guardiã da floresta',
      texto: 'Uma cobra de fogo flamejante que mora na parte mais densa da floresta. Nasceu de um grande incêndio que tomou sua vida: a floresta aprisionou sua alma em um corpo em chamas e a fez sua guardiã. Desde então, nenhum lenhador sai daqui.',
    },
    luaNoCeu: [0.52, 0.38],   // onde está a lua na imagem do céu (fração da largura e da altura)
    id: 'boitata',
    nome: 'A floresta do Boitatá',
    imagemTitulo: '../web/locais/03-a-chegada-ao-mundo-espiritual.jpg',
    descricao: '"Uma cobra de fogo flamejante que mora na parte mais densa da floresta. Ela começou a ser desse jeito após um grande incêndio florestal que tomou sua vida. A floresta aprisionou sua alma em um corpo incendiado e a tornou guardiã da mesma, desde então ela protege a região de lenhadores."',
    fonte: 'do bestiário da Milena',

    // cenário desenhado (usado quando não há imagens de fundo em sprites/fundos/boitata)
    cores: { ceu: ['#160c22', '#4a1f1f', '#8a3a18', '#2a120c'], lua: 'rgba(255,205,160,.55)', morros: '#2a1520',
      arvoreLonge: '#24121a', arvorePerto: '#170c0c', chao: '#1b120e', chaoTopo: '#5a4034', brasas: true },
    fundo: 'fundos/boitata',

    // 10 telas de 960 px (decisão do Erick, 2026-11-14): 9 de exploração + a arena do chefe
    fim: 9600,
    solidos: [
      { x: -300, y: 460, w: 1200, h: 140 },
      { x: 1000, y: 460, w: 700, h: 140 },
      { x: 1800, y: 460, w: 800, h: 140 },
      { x: 2700, y: 460, w: 1200, h: 140 },
      { x: 4030, y: 460, w: 670, h: 140 },
      { x: 4840, y: 460, w: 660, h: 140 },
      { x: 5640, y: 460, w: 920, h: 140 },
      { x: 6690, y: 460, w: 610, h: 140 },
      { x: 7440, y: 460, w: 2260, h: 140 },
    ],
    plataformas: [
      { x: 420, y: 362, w: 160 }, { x: 650, y: 292, w: 140 },
      { x: 1200, y: 352, w: 150 }, { x: 1420, y: 282, w: 150 },
      { x: 1600, y: 185, w: 130 },   // galho alto da árvore do baú: só se alcança pulando do galho de 282
      { x: 2000, y: 362, w: 140 }, { x: 2250, y: 300, w: 160 },
      { x: 2900, y: 362, w: 160 }, { x: 3120, y: 300, w: 140 },
      { x: 3500, y: 362, w: 150 }, { x: 3720, y: 292, w: 140 },
      { x: 4300, y: 352, w: 150 }, { x: 4520, y: 270, w: 140 },
      { x: 5000, y: 362, w: 140 },
      { x: 5900, y: 352, w: 150 }, { x: 6120, y: 282, w: 150 },
      { x: 6900, y: 362, w: 140 }, { x: 7100, y: 292, w: 160 },
      { x: 7700, y: 352, w: 150 }, { x: 7950, y: 290, w: 140 },
    ],
    // baús escondidos: x = centro do baú, y = topo do chão/galho onde ele fica.
    // xp e cura são o prêmio; texto aparece ao abrir.
    baus: [
      { x: 1660, y: 185, xp: 40, cura: true, texto: 'Baú escondido! +40 XP e vida cheia' },
      { x: 5210, y: 1020, xp: 70, cura: true, texto: 'Sala secreta! +70 XP e vida cheia' },
    ],
    // sala secreta (teste de 2026-11-14): embaixo de um dos buracos há uma sala com um baú; nada
    // indica isso lá em cima. Quem cai nesse buraco desce para a sala (a câmera acompanha) e sai
    // pulando no cogumelo-mola. x0..x1 = largura da sala (uma tela); chao = y do piso da sala.
    sala: { x0: 5090, x1: 6050, chao: 1020, mola: 5570 },
    perigos: [ // chão em chamas
      { x: 1300, w: 90 }, { x: 2400, w: 100 }, { x: 3000, w: 80 },
      { x: 3600, w: 90 }, { x: 4420, w: 100 }, { x: 5200, w: 90 },
      { x: 6300, w: 100 }, { x: 7000, w: 80 }, { x: 7820, w: 100 },
    ],
    // 3 altares por fase (padrão para todas as fases, decisão do Erick, 2026-11-14): o do começo,
    // um no meio e um antes do chefe. O herói volta ao último altar aceso.
    controles: [80, 4250, 8300],
    inimigos: [
      { tipo: 'brasa', x: 600, x1: 500, x2: 860, vel: 60, vida: 15 },
      { tipo: 'brasa', x: 1250, x1: 1050, x2: 1650, vel: 70, vida: 15 },
      { tipo: 'brasa', x: 2100, x1: 1850, x2: 2550, vel: 80, vida: 20 },
      { tipo: 'brasa', x: 2850, x1: 2750, x2: 3350, vel: 85, vida: 20 },
      { tipo: 'brasa', x: 3450, x1: 3300, x2: 3850, vel: 85, vida: 20 },
      { tipo: 'brasa', x: 4450, x1: 4100, x2: 4650, vel: 90, vida: 22 },
      { tipo: 'brasa', x: 5200, x1: 4900, x2: 5450, vel: 90, vida: 22 },
      { tipo: 'brasa', x: 6200, x1: 5700, x2: 6500, vel: 95, vida: 25 },
      { tipo: 'brasa', x: 7700, x1: 7500, x2: 8200, vel: 100, vida: 25 },
      { tipo: 'vagalume', x: 1500, y: 240, vida: 10, t: 0 },
      { tipo: 'vagalume', x: 2300, y: 220, vida: 12, t: 2 },
      { tipo: 'vagalume', x: 3200, y: 230, vida: 12, t: 4 },
      { tipo: 'vagalume', x: 3950, y: 230, vida: 12, t: 1 },
      { tipo: 'vagalume', x: 5000, y: 220, vida: 14, t: 3 },
      { tipo: 'vagalume', x: 6620, y: 240, vida: 14, t: 5 },
      { tipo: 'vagalume', x: 7350, y: 230, vida: 14, t: 2 },
      { tipo: 'vagalume', x: 8100, y: 220, vida: 15, t: 4 },
    ],

    arena: { x0: 8640, x1: 9600 },
    gatilhoChefe: 8780,
    chefe: {
      tipo: 'boitata',
      nome: 'BOITATÁ',
      vida: 150,
      rotuloVida: 'fogo',
      sprite: 'chefes/boitata',
      resist: { agua: 1.2, fogo: 0, terra: 0.8, ar: 0.8, espada: 1 }, // fogo: ele absorve e recupera
      frase: ['"A floresta aprisionou sua alma em um corpo incendiado', 'e a tornou guardiã da mesma."'],
      dica: 'Onde a terra racha, ela sai: saia de cima! · Bata na cabeça quando ela ficar cravada no chão',
      dano: { mordida: 9, veneno: 8, venenoSeg: 3, bolaDeFogo: 12, corpo: 8, chama: 5 },
    },
    vitoria: {
      citacao: '"Após a morte, novamente eles viram pó prateado e um pingente com o Boitatá aparece no chão."',
      fonte: 'do caderno, página 11',
      premio: 'Pingente do Boitatá',
    },
    proximas: 'Mula sem cabeça, Robin Hood, Nessie... (em breve)',
  },
};
