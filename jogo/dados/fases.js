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
  // pasto (fase da Vaca): besouro que anda pelo chão e pombo bravo que voa em volta (desenhados pelo
  // jogo até chegar a arte do PixelLab em inimigos/besouro e inimigos/pombo)
  besouro: { nome: 'Besouro-chifrudo', mov: 'patrulha', w: 30, h: 22, dano: 8, xp: 10, sprite: 'inimigos/besouro', luz: 0,
    resist: { agua: 1, fogo: 1.2, terra: 0.8, ar: 1, espada: 1 } },
  pombo: { nome: 'Pombo bravo', mov: 'voo', w: 26, h: 22, dano: 6, xp: 14, sprite: 'inimigos/pombo', luz: 0,
    resist: { agua: 1, fogo: 1, terra: 1, ar: 1.3, espada: 1 } },
  // guardião de sala secreta: parece um baú; acorda quando o herói chega perto e pula atrás dele.
  // Vencido, solta o prêmio da sala (sala.guardiao.premio). Cada sala pode ter um guardião diferente.
  mimico: { nome: 'Mímico', mov: 'mimico', w: 46, h: 40, dano: 9, xp: 70, luz: 0,
    resist: { agua: 1, fogo: 1, terra: 1, ar: 1, espada: 1 } },
};

/* Armas (o espaço de ataque do herói; regra do caderno, p. 34: no máximo 2 itens e um deles de
   ataque). alcance = comprimento do golpe à frente do herói; recarga em segundos; bonus = dano a mais. */
window.ARMAS = {
  espada: { nome: 'Espada', alcance: 54, altura: 'corpo', recarga: .34, bonus: 0 },
  lanca: { nome: 'Lança', alcance: 96, altura: 'fina', recarga: .42, bonus: 2,
    texto: 'Lança! Golpe bem mais longo que a espada' },
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
    ],
    // sala secreta (teste de 2026-11-14): embaixo de um dos buracos há uma sala com um baú; nada
    // indica isso lá em cima. Quem cai nesse buraco desce para a sala (a câmera acompanha) e sai
    // pulando no cogumelo-mola. x0..x1 = largura da sala (uma tela); chao = y do piso da sala.
    sala: { x0: 5090, x1: 6050, chao: 1020, mola: 5570,
      guardiao: { tipo: 'mimico', x: 5210, vida: 70, premio: 'lanca' } },
    perigos: [ // chão em chamas (longe dos troncos e raízes das árvores, dos buracos e dos altares)
      { x: 1080, w: 90 }, { x: 2400, w: 100 }, { x: 2760, w: 80 },
      { x: 3400, w: 90 }, { x: 4080, w: 90 }, { x: 5300, w: 90 },
      { x: 6300, w: 100 }, { x: 6740, w: 80 }, { x: 7500, w: 100 },
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
      tipo: 'boitata',   // versão 6: esqueleto do laboratório; 'boitata_v5' = rolo antigo; 'boitata_terra' = a cobra que entra e sai da terra
      nome: 'BOITATÁ',
      vida: 150,
      rotuloVida: 'fogo',
      sprite: 'chefes/boitata',
      // (só a versão 5) de onde saem o pescoço [x, y, raio] e o rabo [x, y] na imagem do rolo antigo
      ancoras: { pescoco: [.191, 0, .153], rabo: [.017, .723] },
      // versão 6: o texto de "Copiar poses" do laboratório (jogo/laboratorio/cobra.html), das poses do
      // Erick (2026-11-14). Para trocar, cole aqui o texto novo (sem "versao"). Posições em px de tela,
      // relativas a onde nascem o pescoço e o rabo no rolo; ossos do mais perto da ponta para a base.
      esqueleto: {"ossos":{"pescoco":3,"rabo":3},"corpo":{"pescoco":42,"rabo":38,"voltas":3,"tamanho":1,"grossura":1},"ajustes":{"f":0.3,"z":0.05,"r":-1.2,"ondulacao":24,"dobra":10},"poses":{"descanso":{"cab":[-221,-204],"rabo":[-132,-97],"op":[[-154,-239],[-87,-242],[51,-45],null,null],"or":[[-226,5],[-129,17],[-31,-41]]},"cospe":{"cab":[-287,-191],"rabo":[-90,-191],"op":[[-91,-208],[-22,-215],[10,-81],null,null],"or":[[-72,-135],[-62,-72],[1,-28]]},"prepara":{"cab":[-140,-140],"rabo":[-230,30],"op":[[-115,-215],[-35,-240],[51,-45],null,null],"or":[[-115,30],null,null]},"bote":{"cab":[-505,145],"rabo":[-70,-96],"op":[[-468,25],[-177,-130],null,null,null],"or":[[-56,-53],null,null]},"rabada_cima":{"cab":[-150,-150],"rabo":[-315,-68],"op":[[-60,-175],[5,-110],null,null,null],"or":[[-315,-45],[-239,6],[-92,19]]},"rabada_chao":{"cab":[-150,-150],"rabo":[-250,-40],"op":[[-60,-175],[5,-110],null,null,null],"or":[[-290,10],[-230,70],[-100,62]]}}},
      resist: { agua: 1.2, fogo: 0, terra: 0.8, ar: 0.8, espada: 1 }, // fogo: ele absorve e recupera
      frase: ['"A floresta aprisionou sua alma em um corpo incendiado', 'e a tornou guardiã da mesma."'],
      dica: 'Apague o fogo com a água · perto do rolo vem a rabada: pule! · Bata na cabeça cravada no chão',
      dano: { mordida: 9, veneno: 8, venenoSeg: 3, bolaDeFogo: 12, corpo: 8, chama: 5, rabada: 10 },
    },
    vitoria: {
      citacao: '"Após a morte, novamente eles viram pó prateado e um pingente com o Boitatá aparece no chão."',
      fonte: 'do caderno, página 11',
      premio: 'Pingente do Boitatá',
    },
    proximas: 'Mula sem cabeça, Robin Hood, Nessie... (em breve)',
  },

  vaca: {
    // O pasto da Vaca (2026-11-15): fim de tarde, 10 telas como a do Boitatá, 3 altares, árvores vivas
    // como plataformas, cardos no lugar do chão em chamas, besouros e pombos. Sem sala secreta por
    // enquanto. Cenário desenhado pelo jogo até chegarem as imagens de fundos/vaca (ver prompts).
    tema: 'pasto',
    escuridao: 0.3,   // fim de tarde: um pouco escuro, o sol baixo ilumina
    placa: {
      titulo: 'Ageláda',
      subtitulo: 'A vaca sagrada',
      texto: 'Na Índia as vacas são consideradas deusas, entidades sagradas. Para eles a vaca representa a vida, a fertilidade, a generosidade e a pureza. Ela também é associada à bondade e à maternidade.',
    },
    id: 'vaca',
    nome: 'O pasto',
    imagemTitulo: '../web/locais/08-o-pasto-da-vaca-e-o-ovni.jpg',
    descricao: '"Em sua frente tem uma vaca com pequenas asas de pombo brancas. Ela não deixa vocês passarem. Ela muge."',
    fonte: 'do caderno da Milena, página 17',

    cores: { ceu: ['#2e2450', '#7a4a7e', '#e0805a', '#f7c47a'], nuvem: ['#9a5a7e', '#f0a070'],
      morroLonge: ['#5e4a80', '#7d64a0'], colina: ['#3b4f4c', '#55705a', '#4a6a48', '#2e423a'],
      pasto: ['#4a7034', '#6a9a46', '#5a8a3c', '#34522a'], folhaLuz: '#a3b84a', cerca: '#4a3424',
      chao: '#5e412c', chaoTopo: '#8cc152' },
    fundo: 'fundos/vaca',
    luaNoCeu: [0.80, 0.57],   // o sol baixo na imagem do céu (a luz do fim de tarde vem dele)

    fim: 9600,
    // 7 trechos de chão e 6 buracos (110 a 130 px): o pasto é mais aberto que a floresta
    solidos: [
      { x: -300, y: 460, w: 1400, h: 140 },
      { x: 1220, y: 460, w: 1080, h: 140 },
      { x: 2420, y: 460, w: 1380, h: 140 },
      { x: 3910, y: 460, w: 1290, h: 140 },
      { x: 5330, y: 460, w: 1300, h: 140 },
      { x: 6760, y: 460, w: 820, h: 140 },
      { x: 7700, y: 460, w: 2000, h: 140 },
    ],
    plataformas: [
      { x: 450, y: 362, w: 160 }, { x: 680, y: 292, w: 140 },
      { x: 1500, y: 352, w: 150 }, { x: 1720, y: 282, w: 150 },
      { x: 2600, y: 362, w: 150 }, { x: 2820, y: 300, w: 150 },
      { x: 3300, y: 352, w: 150 },
      { x: 4500, y: 362, w: 150 }, { x: 4720, y: 292, w: 140 },
      { x: 5500, y: 352, w: 150 }, { x: 5720, y: 282, w: 150 },
      { x: 5900, y: 185, w: 130 },   // galho alto da árvore do baú: só se alcança pulando do galho de 282
      { x: 7000, y: 362, w: 140 }, { x: 7200, y: 292, w: 160 },
      { x: 7900, y: 352, w: 150 }, { x: 8120, y: 290, w: 140 },
    ],
    baus: [
      { x: 5960, y: 185, xp: 45, cura: true, texto: 'Baú escondido! +45 XP e vida cheia' },
    ],
    // moitas de capim denso (2026-11-20): parado dentro, no chão, o herói fica escondido e não leva dano
    moitas: [{ x: 1240, w: 110 }, { x: 2140, w: 110 }, { x: 4000, w: 120 }, { x: 6420, w: 110 }, { x: 7715, w: 105 }],
    perigoTipo: 'cardo',   // cardos espinhentos (machucam como o chão em chamas)
    perigos: [
      { x: 900, w: 80 }, { x: 2000, w: 90 }, { x: 3000, w: 80 }, { x: 3600, w: 90 },
      { x: 5000, w: 80 }, { x: 6300, w: 90 }, { x: 7400, w: 80 },
    ],
    controles: [80, 4250, 8300],
    inimigos: [
      { tipo: 'besouro', x: 800, x1: 700, x2: 1050, vel: 55, vida: 18 },
      { tipo: 'besouro', x: 1400, x1: 1260, x2: 1900, vel: 65, vida: 18 },
      { tipo: 'besouro', x: 2700, x1: 2460, x2: 2950, vel: 70, vida: 20 },
      { tipo: 'besouro', x: 3400, x1: 3100, x2: 3560, vel: 75, vida: 22 },
      { tipo: 'besouro', x: 4500, x1: 4320, x2: 4950, vel: 80, vida: 22 },
      { tipo: 'besouro', x: 5600, x1: 5400, x2: 6250, vel: 85, vida: 24 },
      { tipo: 'besouro', x: 7000, x1: 6800, x2: 7350, vel: 90, vida: 25 },
      { tipo: 'besouro', x: 7900, x1: 7750, x2: 8200, vel: 95, vida: 26 },
      { tipo: 'pombo', x: 1150, y: 300, vida: 10, t: 0 },
      { tipo: 'pombo', x: 2350, y: 240, vida: 12, t: 2 },
      { tipo: 'pombo', x: 3850, y: 260, vida: 12, t: 4 },
      { tipo: 'pombo', x: 5250, y: 240, vida: 14, t: 1 },
      { tipo: 'pombo', x: 6700, y: 250, vida: 14, t: 3 },
      { tipo: 'pombo', x: 7650, y: 230, vida: 15, t: 5 },
      { tipo: 'pombo', x: 8200, y: 210, vida: 15, t: 2 },
    ],

    arena: { x0: 8640, x1: 9600 },
    gatilhoChefe: 8780,
    chefe: {
      tipo: 'vaca',
      nome: 'AGELÁDA',
      vida: 220,   // Vigor 5 no caderno: a mais resistente até aqui
      rotuloVida: 'PS',
      sprite: 'chefes/vaca',   // arte do PixelLab (quando houver); sem ela, o jogo desenha a vaca
      resist: { agua: 1, fogo: 1, terra: 1, ar: 1, espada: 1 },
      frase: ['"Em sua frente tem uma vaca com pequenas asas de pombo brancas.', 'Ela não deixa vocês passarem. Ela muge."'],
      dica: 'Pule as ondas do terremoto · saia de perto do gás · atacar ou esperar?',
      textoFim: 'A vaca não aguenta mais!',
      dano: { terremoto: 12, gas: 4, gasSeg: 3, corpo: 6 },
      // o outro jeito de vencer (p. 35, "pelo cansaço"): cada ataque cansa; desviar sem levar dano cansa mais
      cansaco: { ataque: 4, desvio: 4, avisos: [[35, 'A vaca está ofegante'], [65, 'A vaca mal se aguenta em pé'], [88, 'A vaca vai cair de cansaço!']] },
      premioForma: 'dogtag', corPremio: 'ouro',
    },
    vitoria: {
      citacao: '"Quando a vaca finalmente parece cansada, uma luz verde começa a pairar sobre ela e depois de alguns instantes ela é levada para cima. Quem estava levando ela era um OVNI. Sim. Aliens."',
      fonte: 'do caderno, página 17',
      premio: 'Dog tag dourada',
      conquista: 'Dog tag dourada conquistada',
    },
    proximas: 'Mula sem cabeça, Robin Hood, Nessie... (em breve)',
  },
};
