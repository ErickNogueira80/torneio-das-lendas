/* Heróis e poderes do Torneio das Lendas.
   Cada herói é uma ficha de dados. Para criar um novo, copie uma ficha e mude os valores.
   - attr: atributos iniciais (V Vigor = vida, F Força = espada, I Intelecto = poder e energia,
     A Agilidade = velocidade).
   - poder: chave de PODERES (o botão especial do herói).
   - cores: usadas quando ainda não há imagem (o desenho de reserva).
   - sprite: pasta das imagens em jogo/sprites (gerada pela ferramenta preparar_sprites.py).
   - disponivel: false = ainda não aparece na escolha de herói (dá para testar com ?heroi=<chave>). */
// Ordem dos heróis na tela de seleção (os 4 jogadores). 'ar' não entra: é o humano desperto.
window.SELECAO_HEROIS = ['humano', 'agua', 'fogo', 'terra'];

window.HEROIS = {
  // (2026-11-28, Erick) os 4 heróis são os personagens da mesa da Milena (mesa/fichas.js): nome, visual
  // e atributos da ficha (status F, I, V, A; o P da ficha não existe no jogo). As chaves continuam pelo
  // elemento. Imagens: prompts em 04-prompts-sprites.md, seção "Os 4 heróis da mesa". Sem imagem própria,
  // o cartão mostra a silhueta e o herói fica "em breve" (disponivel: false).
  // O 4º jogador (definição do Erick, 2026-11-07): o "normal", sem constelação e sem atributo
  // forte (todos em 2). Jogabilidade mais difícil. Na história, é o Câncer escondido.
  // Por enquanto usa o poder da água só para teste e o boneco encapuzado (herois/humano) até chegar o do Sam.
  humano: {
    nome: 'Sam Seixeira', signo: null, elemento: null, disponivel: true, dificil: true,
    descricao: 'Sem constelação no braço e sem atributo forte. Os outros devem protegê-lo... ou será o contrário?',
    attr: { V: 2, F: 2, I: 2, A: 2 },
    poder: 'agua',
    cores: { capa: '#141018', roupa: '#eee8dc', cinto: '#3a3040', pele: '#f2c9a8', cabelo: '#d2602a' },
    marca: false,
    sprite: 'herois/humano',
  },

  // ---- Os 3 heróis com constelação (signo e elemento os mesmos da mesa)
  agua: {   // ficha: F1 I4 V2 A2; manipulação de água, adaga de gelo
    nome: 'Jane Vorhood', signo: 'Áries', elemento: 'agua', disponivel: false,
    descricao: 'Uma senhora de 82 anos, doce como uma avó. Mas a água e o gelo obedecem a ela.',
    attr: { V: 2, F: 1, I: 4, A: 2 }, poder: 'agua',
    cores: { capa: '#e8a6b8', roupa: '#d97a98', cinto: '#f4f0ea', pele: '#f0c9a8', cabelo: '#7a4a2a' },
    marca: true, sprite: 'herois/jane',
  },
  fogo: {   // ficha: F4 I2 V1 A3; espada de fogo, círculo de fogo, arco dourado; Medicina
    nome: 'Angi Momobami', signo: 'Sagitário', elemento: 'fogo', disponivel: false,
    descricao: 'Médica e espadachim de olhos vermelhos. Luta com uma espada de fogo e um arco dourado.',
    attr: { V: 1, F: 4, I: 2, A: 3 }, poder: 'fogo',
    cores: { capa: '#1c2a4a', roupa: '#2a3c66', cinto: '#d8a940', pele: '#efc6a4', cabelo: '#0e0c12' },
    marca: true, sprite: 'herois/angi',
  },
  terra: {   // ficha: F4 I2 V3 A2; adrenalina, pedra do chão, pedra no corpo; colar e kit de sobrevivência
    nome: 'José Carlos', signo: 'Capricórnio', elemento: 'terra', disponivel: false,
    descricao: 'Sobrevivente encapuzado, forte e calado. Arranca pedras do chão para lutar.',
    attr: { V: 3, F: 4, I: 2, A: 2 }, poder: 'terra',
    cores: { capa: '#4a3826', roupa: '#3a3630', cinto: '#7a5232', pele: '#c99872', cabelo: '#1e1610' },
    marca: true, sprite: 'herois/jose',
  },
  ar: {
    // Não é um 5º herói: é o Sam depois de despertar a entidade de Câncer (a virada da
    // história). Fica aqui para testar o poder do vento (?heroi=ar).
    nome: 'Sam desperto (Câncer)', signo: 'Câncer', elemento: 'ar', disponivel: false,
    descricao: 'A constelação apagada finalmente brilha.',
    attr: { V: 2, F: 2, I: 2, A: 3 }, poder: 'ar',
    cores: { capa: '#5a6a8a', roupa: '#c8d4e8', cinto: '#7ab0d8', pele: '#f2c9a8', cabelo: '#d2602a' },
    marca: true, sprite: 'herois/ar',
  },
};

/* Poderes: o botão especial de cada herói. Todos são projéteis por enquanto; cada um tem um jeito.
   dano = base + mult × atributo. custo = energia gasta por disparo.
   perfura: atravessa inimigos. Contra cada inimigo ou chefe, o dano é multiplicado pela resistência
   dele àquele elemento (ver resist em fases.js; 0 = imune). */
window.PODERES = {
  agua: { corLuz: '150,210,255', nome: 'água', custo: 10, recarga: 0.28, velocidade: 640, raio: 10, vida: 1.1, dano: { base: 5, mult: 3, attr: 'I' }, gravidade: 0,
    cores: ['#ffffff', '#9fe0ff', '#2f86d6'], rastro: ['#e8f4ff', '#bfe0ff', '#9cc7ef'],
    imagem: 'objetos/bola_agua' },   // bolha de água do PixelLab (9 quadros, voando para a direita)
  fogo: { corLuz: '255,150,50', nome: 'fogo', custo: 10, recarga: 0.3, velocidade: 600, raio: 11, vida: 1.0, dano: { base: 6, mult: 3, attr: 'F' }, gravidade: 0,
    cores: ['#fff3c0', '#ffb02e', '#e2401a'], rastro: ['#ffd36b', '#ff9a2e', '#ff5a1a'] },
  terra: { corLuz: '210,170,120', nome: 'pedra', custo: 12, recarga: 0.45, velocidade: 480, raio: 14, vida: 1.4, dano: { base: 8, mult: 3, attr: 'V' }, gravidade: 500, salto: -260,
    cores: ['#c8b08a', '#8a6a44', '#4a3420'], rastro: ['#8a6a44', '#5a4430', '#c8b08a'] },
  ar: { corLuz: '210,240,255', nome: 'vento', custo: 8, recarga: 0.22, velocidade: 820, raio: 9, vida: 0.7, dano: { base: 4, mult: 3, attr: 'A' }, gravidade: 0, perfura: true,
    cores: ['#ffffff', '#e8f0ff', '#a8c0e8'], rastro: ['#ffffff', '#dfe8f8', '#c8d4e8'] },
};
