// Constelações dos signos dos jogadores, desenhadas no código (sem IA). Coordenadas num quadro de
// 100 × 100, aproximando o céu de verdade: [x, y, raio]. Quem é de qual signo NÃO fica aqui (fica só
// no portal trancado); este arquivo só sabe desenhar.
window.CONSTELACOES = {
  sagitario: { nome: 'Sagitário', cor: '#ff8a3d',   // o "bule": Alnasl, Kaus Media/Borealis/Australis, Nunki, Ascella…
    pts: [[12, 58, 2.2], [30, 50, 2.4], [38, 32, 2.2], [53, 45, 2.2], [26, 74, 3.2], [56, 71, 2.8], [72, 43, 3], [76, 62, 2]],
    linhas: [[0, 1], [1, 2], [2, 3], [1, 3], [0, 4], [1, 4], [4, 5], [5, 3], [3, 6], [6, 7], [7, 5]] },
  capricornio: { nome: 'Capricórnio', cor: '#9be06a',   // o "barco": Algedi, Dabih, … Deneb Algedi
    pts: [[12, 28, 2.6], [20, 37, 2.8], [36, 63, 2.2], [47, 72, 2.4], [66, 63, 2.2], [75, 52, 2], [90, 30, 3.2], [81, 36, 2.6], [55, 43, 2]],
    linhas: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 1]] },
  aries: { nome: 'Áries', cor: '#5cc0ff',   // 41 Ari, Hamal, Sheratan, Mesarthim
    pts: [[12, 26, 2.2], [50, 40, 3.4], [76, 56, 2.8], [84, 70, 2]],
    linhas: [[0, 1], [1, 2], [2, 3]] },
  cancer: { nome: 'Câncer', cor: '#c4e8ff',   // o "Y" invertido: Iota, Asellus Borealis/Australis, Acubens, Altarf
    pts: [[47, 10, 2], [50, 36, 2.2], [54, 53, 2.4], [80, 84, 2.4], [22, 80, 3]],
    linhas: [[0, 1], [1, 2], [2, 3], [2, 4]] },
  // para a marca que "não aparece": estrelas soltas, sem formar nenhum signo (não entrega quem é Câncer)
  vazia: { nome: '', cor: '#9a90ad', pts: [[30, 30, 1.8], [62, 24, 1.6], [48, 52, 2], [24, 70, 1.6], [74, 68, 1.8]], linhas: [] },
};

// Desenha a constelação em SVG. o.anim = estrelas acendem uma a uma e as linhas se desenham em seguida.
// Devolve também o tempo (em segundos) em que o desenho termina, para encaixar o resto do efeito.
window.svgConstelacao = function (id, o) {
  o = o || {};
  const c = window.CONSTELACOES[id], t0 = o.inicio || 0.5, dt = 0.22, tl = t0 + c.pts.length * dt;
  const d = s => o.anim ? ` style="animation-delay:${s.toFixed(2)}s"` : '';
  const linhas = c.linhas.map(([a, b], k) => { const [x1, y1] = c.pts[a], [x2, y2] = c.pts[b];
    return `<line class="ln" pathLength="1" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${d(tl + k * 0.16)}/>`; }).join('');
  const estrelas = c.pts.map(([x, y, r], i) =>
    `<circle class="e" cx="${x}" cy="${y}" r="${r}"${o.anim ? ` style="--t:${(t0 + i * dt).toFixed(2)}s"` : ''}/>`).join('');
  const svg = `<svg class="const" viewBox="-6 -6 112 112" style="color:${c.cor}" aria-label="${c.nome}">
    <g stroke="currentColor" stroke-width="0.9" stroke-linecap="round" opacity=".85">${linhas}</g><g fill="#fff">${estrelas}</g></svg>`;
  return { svg, fim: tl + c.linhas.length * 0.16 };
};
