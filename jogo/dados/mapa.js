/* Mapa do mundo espiritual: a tela de seleção de local.
   Um local por combate principal do bestiário, na ordem da história (caderno da Milena).
   - fase: chave em FASES (fases.js). null = ainda bloqueado ("em breve").
   - x, y: posição do marcador no mapa, em fração da tela (0 a 1). Ajustar quando chegar a
     imagem do mapa (img/sprites/mapa/mundo.png), para cada marcador cair no seu lugar.
   - img: a ilustração pintada do local (a mesma do portal), mostrada no cartão. */
window.MAPA = {
  titulo: 'O mundo espiritual',
  locais: [
    { id: 'mula', nome: 'A chegada ao mundo espiritual', chefe: 'Mula sem cabeça', fase: null,
      img: '../web/locais/03-a-chegada-ao-mundo-espiritual.jpg', x: .09, y: .80 },
    { id: 'boitata', nome: 'A floresta do Boitatá', chefe: 'Boitatá', fase: 'boitata',
      img: '../web/locais/04-a-montanha-e-os-portoes-do-santuario-do-olimpo.jpg', x: .20, y: .60 },
    { id: 'nessie', nome: 'O lago e a "ilha"', chefe: 'Nessie', fase: null,
      img: '../web/locais/05-o-lago-e-a-ilha.jpg', x: .33, y: .78 },
    { id: 'vaca', nome: 'O pasto da vaca e o OVNI', chefe: 'Ageláda (a vaca)', fase: null,
      img: '../web/locais/08-o-pasto-da-vaca-e-o-ovni.jpg', x: .46, y: .62 },
    { id: 'caverna', nome: 'A caverna à noite', chefe: 'Fobétor (o pesadelo)', fase: null,
      img: '../web/locais/09-a-caverna-a-noite.jpg', x: .40, y: .36 },
    { id: 'grifo', nome: 'A clareira do grifo', chefe: 'Grifo', fase: null,
      img: '../web/locais/10-a-clareira-do-grifo.jpg', x: .55, y: .26 },
    { id: 'arcoiris', nome: 'O campo do arco-íris', chefe: 'Kallikántzaros', fase: null,
      img: '../web/locais/07-o-campo-do-arco-iris.jpg', x: .66, y: .50 },
    { id: 'espada', nome: 'A espada na pedra', chefe: 'Excalibur', fase: null,
      img: '../web/locais/11-a-espada-na-pedra.jpg', x: .76, y: .72 },
    { id: 'hidra', nome: 'O templo da Hidra', chefe: 'Hidra', fase: null,
      img: '../web/locais/12-o-templo-da-hidra.jpg', x: .86, y: .48 },
    { id: 'olimpo', nome: 'Os portões do Olimpo', chefe: '???', fase: null,
      img: '../web/locais/13-o-retorno-ao-olimpo.jpg', x: .90, y: .17 },
  ],
};
