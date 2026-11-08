/* Mapa do mundo espiritual: a tela de seleção de local.
   Um local por combate principal do bestiário, na ordem da história (caderno da Milena).
   - fase: chave em FASES (fases.js). null = ainda bloqueado ("em breve").
   - x, y: posição do marcador no mapa, em fração da tela (0 a 1), em cima do lugar desenhado na
     imagem do mapa (img/sprites/mapa/mundo.png; ajustado em 2026-11-08).
   - img: a ilustração pintada do local (a mesma do portal), mostrada no cartão. */
window.MAPA = {
  titulo: 'O mundo espiritual',
  locais: [
    { id: 'mula', nome: 'A chegada ao mundo espiritual', chefe: 'Mula sem cabeça', fase: null,
      img: '../web/locais/03-a-chegada-ao-mundo-espiritual.jpg', x: 0.125, y: 0.77 },
    { id: 'boitata', nome: 'A floresta do Boitatá', chefe: 'Boitatá', fase: 'boitata',
      img: '../web/locais/04-a-montanha-e-os-portoes-do-santuario-do-olimpo.jpg', x: 0.12, y: 0.42 },
    { id: 'nessie', nome: 'O lago e a "ilha"', chefe: 'Nessie', fase: null,
      img: '../web/locais/05-o-lago-e-a-ilha.jpg', x: 0.42, y: 0.8 },
    { id: 'vaca', nome: 'O pasto da vaca e o OVNI', chefe: 'Ageláda (a vaca)', fase: null,
      img: '../web/locais/08-o-pasto-da-vaca-e-o-ovni.jpg', x: 0.435, y: 0.45 },
    { id: 'caverna', nome: 'A caverna à noite', chefe: 'Fobétor (o pesadelo)', fase: null,
      img: '../web/locais/09-a-caverna-a-noite.jpg', x: 0.335, y: 0.21 },
    { id: 'grifo', nome: 'A clareira do grifo', chefe: 'Grifo', fase: null,
      img: '../web/locais/10-a-clareira-do-grifo.jpg', x: 0.55, y: 0.12 },
    { id: 'arcoiris', nome: 'O campo do arco-íris', chefe: 'Kallikántzaros', fase: null,
      img: '../web/locais/07-o-campo-do-arco-iris.jpg', x: 0.68, y: 0.47 },
    { id: 'espada', nome: 'A espada na pedra', chefe: 'Excalibur', fase: null,
      img: '../web/locais/11-a-espada-na-pedra.jpg', x: 0.765, y: 0.7 },
    { id: 'hidra', nome: 'O templo da Hidra', chefe: 'Hidra', fase: null,
      img: '../web/locais/12-o-templo-da-hidra.jpg', x: 0.89, y: 0.52 },
    { id: 'olimpo', nome: 'Os portões do Olimpo', chefe: '???', fase: null,
      img: '../web/locais/13-o-retorno-ao-olimpo.jpg', x: 0.865, y: 0.09 },
  ],
};
