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

    fim: 4400,
    solidos: [
      { x: -300, y: 460, w: 1200, h: 140 },
      { x: 1000, y: 460, w: 700, h: 140 },
      { x: 1800, y: 460, w: 800, h: 140 },
      { x: 2700, y: 460, w: 2000, h: 140 },
    ],
    plataformas: [
      { x: 420, y: 362, w: 160 }, { x: 650, y: 292, w: 140 },
      { x: 1200, y: 352, w: 150 }, { x: 1420, y: 282, w: 150 },
      { x: 2000, y: 362, w: 140 }, { x: 2250, y: 300, w: 160 },
      { x: 2900, y: 362, w: 160 }, { x: 3120, y: 300, w: 140 },
    ],
    perigos: [ // chão em chamas
      { x: 1300, w: 90 }, { x: 2400, w: 100 }, { x: 3000, w: 80 },
    ],
    controles: [80, 1880, 3320],
    inimigos: [
      { tipo: 'brasa', x: 600, x1: 500, x2: 860, vel: 60, vida: 15 },
      { tipo: 'brasa', x: 1250, x1: 1050, x2: 1650, vel: 70, vida: 15 },
      { tipo: 'brasa', x: 2100, x1: 1850, x2: 2550, vel: 80, vida: 20 },
      { tipo: 'brasa', x: 2850, x1: 2750, x2: 3350, vel: 85, vida: 20 },
      { tipo: 'vagalume', x: 1500, y: 240, vida: 10, t: 0 },
      { tipo: 'vagalume', x: 2300, y: 220, vida: 12, t: 2 },
      { tipo: 'vagalume', x: 3200, y: 230, vida: 12, t: 4 },
    ],

    arena: { x0: 3440, x1: 4400 },
    gatilhoChefe: 3580,
    chefe: {
      tipo: 'boitata',
      nome: 'BOITATÁ',
      vida: 150,
      rotuloVida: 'fogo',
      sprite: 'chefes/boitata',
      resist: { agua: 1.2, fogo: 0, terra: 0.8, ar: 0.8, espada: 1 }, // fogo: ele absorve e recupera
      frase: ['"A floresta aprisionou sua alma em um corpo incendiado', 'e a tornou guardiã da mesma."'],
      dica: 'Apague o fogo dele com a água!',
      dano: { mordida: 9, veneno: 8, venenoSeg: 3, bolaDeFogo: 12 },
    },
    vitoria: {
      citacao: '"Após a morte, novamente eles viram pó prateado e um pingente com o Boitatá aparece no chão."',
      fonte: 'do caderno, página 11',
      premio: 'Pingente do Boitatá',
    },
    proximas: 'Mula sem cabeça, Robin Hood, Nessie... (em breve)',
  },
};
