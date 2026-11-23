// Fichas dos jogadores, como nas anotações da Milena (caderno, p. 37 a 40, fotos de 22/11/2026).
// retratoIA: avatar gerado no Gemini a partir do desenho (03-prompts-imagens.md, "Avatares dos jogadores"),
// salvo em mesa/retratos/<id>-ia.jpg. O jogador escolhe qual aparece tocando na foto da ficha.
// Sem o elemento (Erick, 2026-11-22: não mostrar o "atributo principal"). Ataques: [nome, S, N, dano].
// Leituras incertas do caderno estão como foram lidas; corrigir aqui quando a Milena confirmar.
window.FICHAS = {
  miguel: null,   // p. 38: ficha ainda em branco
  bia: {
    personagem: 'Amagi Mamabami', idade: 25, retrato: 'retratos/bia.jpg', retratoIA: 'retratos/bia-ia.jpg',
    status: { F: 4, I: 2, V: 1, A: 3, P: 2 },
    pericias: ['Medicina 5', 'Luta 3', 'Pontaria 2'],
    itens: [],
    ataques: [['Espada de fogo', '+8', '-7', '1D12 + 2D4'], ['Círculo de fogo', '+10', '-9', '2D4'], ['Arco dourado', '+11', '-10', '1D6 + 1D4']],
  },
  mateus: {
    personagem: 'Sam Seixeira', idade: 30, retrato: 'retratos/mateus.jpg', retratoIA: 'retratos/mateus-ia.jpg',
    status: { F: 2, I: 2, V: 2, A: 2, P: 2 },
    pericias: ['Luta 5', 'Furtividade 5'],
    itens: ['Faca (defesa pessoal)', 'Laser (ataque)'],
    ataques: [['Imobilização', '+6', '-5', '—'], ['Gancho de esquerda', '+7', '-6', '1D8'], ['Rasteira', '+7', '-6', '1D10']],
  },
  joao: {
    personagem: 'Jane Vorhood', idade: 82, retrato: 'retratos/joao.jpg', retratoIA: 'retratos/joao-ia.jpg',
    status: { F: 1, I: 4, V: 2, A: 2, P: 3 },
    pericias: [],
    itens: ['1 adaga de gelo'],
    ataques: [['Manipulação de água', '+7', '-6', '1D6 + 1D4'], ['Facada', '+10', '-9', '1D10'], ['Ataque de gelo', '+12', '-11', '1D12 + 1D6']],
  },
};
