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
  // O 4º jogador (definição do Erick, 2026-11-07): o "normal", sem constelação e sem atributo
  // forte (todos em 2). Jogabilidade mais difícil. Na história, é o Câncer escondido.
  // Por enquanto usa o poder da água só para teste; na tela de escolha (etapa 3) ele fica sem
  // poder de elemento e ganha o vento quando despertar o Câncer (ver a ficha 'ar' abaixo).
  humano: {
    nome: 'O humano', signo: null, elemento: null, disponivel: true, dificil: true,
    descricao: 'Sem constelação no braço e sem atributo forte. Os outros devem protegê-lo... ou será o contrário?',
    attr: { V: 2, F: 2, I: 2, A: 2 },
    poder: 'agua',
    cores: { capa: '#1f3f63', roupa: '#2e5c8a', cinto: '#c8a24a', pele: '#f0c9a0', cabelo: '#2a1c18' },
    marca: false,
    sprite: 'herois/humano',
  },

  // ---- Os 3 heróis com constelação: a Milena preenche nome, aparência, poder e atributo forte.
  // Os signos e elementos abaixo seguem a tabela do caderno (p. 1) e podem mudar.
  agua: {
    nome: 'Herói de Água', signo: 'Áries', elemento: 'agua', disponivel: false,
    descricao: '(a definir pela Milena)',
    attr: { V: 2, F: 2, I: 3, A: 2 }, poder: 'agua',
    cores: { capa: '#1d4e7a', roupa: '#3a8ad6', cinto: '#d8dee8', pele: '#e8bf98', cabelo: '#1a1a2a' },
    marca: true, sprite: 'herois/agua',
  },
  fogo: {
    nome: 'Herói de Fogo', signo: 'Libra ou Sagitário', elemento: 'fogo', disponivel: false,
    descricao: '(a definir pela Milena)',
    attr: { V: 2, F: 3, I: 2, A: 2 }, poder: 'fogo',
    cores: { capa: '#7a1e10', roupa: '#d4471a', cinto: '#ffcf6a', pele: '#e8bf98', cabelo: '#3a1408' },
    marca: true, sprite: 'herois/fogo',
  },
  terra: {
    nome: 'Herói de Terra', signo: 'Capricórnio', elemento: 'terra', disponivel: false,
    descricao: '(a definir pela Milena)',
    attr: { V: 3, F: 2, I: 2, A: 2 }, poder: 'terra',
    cores: { capa: '#4a3420', roupa: '#7a5a34', cinto: '#a8c070', pele: '#d9a77e', cabelo: '#2a1c10' },
    marca: true, sprite: 'herois/terra',
  },
  ar: {
    // Não é um 5º herói: é o humano depois de despertar a entidade de Câncer (a virada da
    // história). Fica aqui para testar o poder do vento (?heroi=ar).
    nome: 'O humano desperto (Câncer)', signo: 'Câncer', elemento: 'ar', disponivel: false,
    descricao: 'A constelação apagada finalmente brilha.',
    attr: { V: 2, F: 2, I: 2, A: 3 }, poder: 'ar',
    cores: { capa: '#5a6a8a', roupa: '#c8d4e8', cinto: '#7ab0d8', pele: '#f0c9a0', cabelo: '#d8c8a0' },
    marca: true, sprite: 'herois/ar',
  },
};

/* Poderes: o botão especial de cada herói. Todos são projéteis por enquanto; cada um tem um jeito.
   dano = base + mult × atributo. custo = energia gasta por disparo.
   perfura: atravessa inimigos. Contra cada inimigo ou chefe, o dano é multiplicado pela resistência
   dele àquele elemento (ver resist em fases.js; 0 = imune). */
window.PODERES = {
  agua: { corLuz: '150,210,255', nome: 'água', custo: 10, recarga: 0.28, velocidade: 640, raio: 10, vida: 1.1, dano: { base: 5, mult: 3, attr: 'I' }, gravidade: 0,
    cores: ['#ffffff', '#9fe0ff', '#2f86d6'], rastro: ['#e8f4ff', '#bfe0ff', '#9cc7ef'] },
  fogo: { corLuz: '255,150,50', nome: 'fogo', custo: 10, recarga: 0.3, velocidade: 600, raio: 11, vida: 1.0, dano: { base: 6, mult: 3, attr: 'F' }, gravidade: 0,
    cores: ['#fff3c0', '#ffb02e', '#e2401a'], rastro: ['#ffd36b', '#ff9a2e', '#ff5a1a'] },
  terra: { corLuz: '210,170,120', nome: 'pedra', custo: 12, recarga: 0.45, velocidade: 480, raio: 14, vida: 1.4, dano: { base: 8, mult: 3, attr: 'V' }, gravidade: 500, salto: -260,
    cores: ['#c8b08a', '#8a6a44', '#4a3420'], rastro: ['#8a6a44', '#5a4430', '#c8b08a'] },
  ar: { corLuz: '210,240,255', nome: 'vento', custo: 8, recarga: 0.22, velocidade: 820, raio: 9, vida: 0.7, dano: { base: 4, mult: 3, attr: 'A' }, gravidade: 0, perfura: true,
    cores: ['#ffffff', '#e8f0ff', '#a8c0e8'], rastro: ['#ffffff', '#dfe8f8', '#c8d4e8'] },
};
