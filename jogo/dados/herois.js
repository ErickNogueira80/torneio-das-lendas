/* Heróis e poderes do Torneio das Lendas.
   Cada herói é uma ficha de dados. Para criar um novo, copie uma ficha e mude os valores.
   - attr: atributos iniciais (V Vigor = vida, F Força = espada, I Intelecto = poder e energia,
     A Agilidade = velocidade).
   - poder: chave de PODERES (o botão especial do herói).
   - cores: usadas quando ainda não há imagem (o desenho de reserva).
   - sprite: pasta das imagens em jogo/sprites (gerada pela ferramenta preparar_sprites.py).
   - disponivel: false = ainda não aparece na escolha de herói (dá para testar com ?heroi=<chave>). */
window.HEROIS = {
  humano: {
    nome: 'O humano', signo: null, elemento: null, disponivel: true,
    descricao: 'Ainda sem constelação no braço. Os outros devem protegê-lo... ou será o contrário?',
    attr: { V: 2, F: 2, I: 2, A: 2 },
    poder: 'agua',
    cores: { capa: '#1f3f63', roupa: '#2e5c8a', cinto: '#c8a24a', pele: '#f0c9a0', cabelo: '#2a1c18' },
    marca: false,
    sprite: 'herois/humano',
  },

  // ---- Modelos dos 4 heróis dos signos: a Milena preenche nome, aparência, poder e atributo forte.
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
    nome: 'Herói de Ar', signo: 'Câncer', elemento: 'ar', disponivel: false,
    descricao: '(a definir pela Milena)',
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
  agua: { nome: 'água', custo: 10, recarga: 0.28, velocidade: 640, raio: 10, vida: 1.1, dano: { base: 5, mult: 3, attr: 'I' }, gravidade: 0,
    cores: ['#ffffff', '#9fe0ff', '#2f86d6'], rastro: ['#e8f4ff', '#bfe0ff', '#9cc7ef'] },
  fogo: { nome: 'fogo', custo: 10, recarga: 0.3, velocidade: 600, raio: 11, vida: 1.0, dano: { base: 6, mult: 3, attr: 'F' }, gravidade: 0,
    cores: ['#fff3c0', '#ffb02e', '#e2401a'], rastro: ['#ffd36b', '#ff9a2e', '#ff5a1a'] },
  terra: { nome: 'pedra', custo: 12, recarga: 0.45, velocidade: 480, raio: 14, vida: 1.4, dano: { base: 8, mult: 3, attr: 'V' }, gravidade: 500, salto: -260,
    cores: ['#c8b08a', '#8a6a44', '#4a3420'], rastro: ['#8a6a44', '#5a4430', '#c8b08a'] },
  ar: { nome: 'vento', custo: 8, recarga: 0.22, velocidade: 820, raio: 9, vida: 0.7, dano: { base: 4, mult: 3, attr: 'A' }, gravidade: 0, perfura: true,
    cores: ['#ffffff', '#e8f0ff', '#a8c0e8'], rastro: ['#ffffff', '#dfe8f8', '#c8d4e8'] },
};
