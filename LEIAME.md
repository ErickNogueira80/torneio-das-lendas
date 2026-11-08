# RPG da Milena

## O que é

RPG de mesa escrito pela Milena num caderno. Ainda não está pronto: a
parte 1 (a jornada até o Torneio das Lendas) está escrita; a parte 2 (o torneio) ainda não.

Resumo da história: no mundo do RPG, cada casa do zodíaco é uma divindade que renasce de tempos
em tempos. Quando todas vivem ao mesmo tempo, os deuses gregos fazem o Torneio das Lendas. Três
jogadores despertam com a constelação do signo no braço e precisam proteger um humano e
encontrar o Câncer, enfrentando criaturas de lendas (Mula sem cabeça, Boitatá, Robin Hood,
Nessie, Leprechaun, Grifo, Excalibur, Hidra) para completar a lista do portão do Olimpo. A
virada: o humano era o Câncer.

## Área

Pessoal (família).

## Onde está

- Pasta: `D:\Erick\Jogos\milena-rpg`
- Repositório: https://github.com/ErickNogueira80/torneio-das-lendas (público).
- Portal (GitHub Pages): https://ericknogueira80.github.io/torneio-das-lendas/ — `index.html` na
  raiz; lê os `.md` direto (por isso o `.nojekyll`).
- Fotos originais: `C:\Users\erick\Downloads\milena_rpg_001` (36 fotos do WhatsApp de
  07/11/2026), copiadas para `fotos-originais/` como backup.

## Arquivos

| Arquivo | O que tem |
|---|---|
| `fotos-originais/` | Backup das 36 fotos do caderno |
| `01-transcricao-integral.md` | Transcrição fiel, página por página, com a grafia dela |
| `02-sugestoes.md` | Furos de continuidade, regras que faltam, correções de texto, ideias para a parte 2 e plano do material |
| `03-prompts-imagens.md` | Prompts para gerar imagens dos 13 locais, das 10 criaturas do bestiário e de 2 extras em outra IA, com um bloco de estilo comum |
| `img/local`, `img/bestiario` | Imagens geradas em tamanho original (fora do git, só no PC) |
| `web/` | Versões menores das imagens, usadas pelo portal |
| `ferramentas/otimizar_imagens.py` | Gera `web/` a partir de `img/` (rodar depois de adicionar imagens) |
| `index.html` | O portal: início, aventura, bestiário, signos, caderno, transcrição e sugestões |
| `jogo/` | Jogo de plataforma com RPG (protótipo, fase do Boitatá): `index.html`, `jogo.js` (motor), `dados/herois.js`, `dados/fases.js`, manifest e ícones |
| `04-prompts-sprites.md` | Prompts das imagens do jogo (herói, Boitatá em 3 partes, inimigos, fundo em camadas) e a ficha dos 4 heróis para a Milena |
| `ferramentas/preparar_sprites.py` | Transforma as imagens de `img/sprites/` (fora do git) nas folhas de `jogo/sprites/` + `sprites.json` |

## Jogo (protótipo)

- Link: https://ericknogueira80.github.io/torneio-das-lendas/jogo/ (também pelo botão "▶ Jogo" do
  portal). Roda no navegador do celular (deitado) e do computador; dá para "Adicionar à tela
  inicial".
- Sem biblioteca; tela virtual de 960×540. Três partes:
  - `jogo/dados/herois.js`: fichas dos heróis (atributos, poder, cores de reserva, pasta das
    imagens) e dos 4 poderes (água, fogo, pedra, vento). Hoje só "o humano" está disponível; os
    4 heróis dos signos têm fichas-modelo (`disponivel: false`) esperando a ficha da Milena.
  - `jogo/dados/fases.js`: fichas das fases (plataformas, buracos, inimigos, chefe, textos) e dos
    tipos de inimigo, com resistência por elemento (`resist`; 0 = imune, o chefe absorve e
    recupera).
  - `jogo/jogo.js`: o motor (física, combate, chefes, telas, desenho). Cada chefe é um módulo em
    `CHEFES` (hoje só `boitata`).
- **Imagens:** o motor carrega `jogo/sprites/sprites.json` se existir; o que faltar usa o desenho
  de reserva. Fluxo: gerar com os prompts de `04-prompts-sprites.md`, salvar em `img/sprites/...`,
  rodar `python ferramentas/preparar_sprites.py`, commit e push. A ferramenta remove o fundo de
  cor lisa, corta, iguala a altura, alinha os pés e monta as folhas (testada com imagens de
  teste em 2026-11-07).
- **Fase do Boitatá:** floresta incendiada com 3 buracos, plataformas, chão em chamas, 7 inimigos
  (brasas e vaga-lumes de fogo) e 3 pontos de controle. No fim, a arena do chefe.
- **RPG:** atributos do caderno (Vigor, Força, Intelecto, Agilidade). Vida = 40 + 15×V; espada =
  6 + 3×F; água = 5 + 3×I; energia = 30 + 10×I; velocidade cresce com A. Inimigos dão XP; ao
  subir de nível o jogador escolhe o atributo.
- **Boitatá:** a barra de vida é o "fogo" (150), ligada ao "como derrotar" do caderno ("apagando
  completamente seu fogo"). Ataques do bestiário: bola de fogo gigante (rajadas), mordida comum
  (contato) e mordida venenosa (avanço rente ao chão; pular por cima). Água na cabeça = crítico;
  água apaga as bolas de fogo. Com menos de 35% de fogo ele fica mais rápido. Derrotado, vira pó
  prateado e deixa o pingente (como na p. 11).
- **Controles:** toque (◀ ▶, ▼, pular, espada, água) ou teclado (setas/A-D, ↑/W/Espaço, J/Z, K/X).
  ▼ (ou seta para baixo/S) em cima de uma plataforma desce por ela.
- **Retrato no canto (2026-11-08):** o retrato pintado do herói (`retrato.jpg` na pasta dele) fica
  no canto inferior esquerdo durante a fase, como no estilo Lanterna; treme e pisca em vermelho
  quando o herói leva dano e fica transparente quando o herói passa por trás. `?semretrato`
  esconde.
- **Cenário denso (2026-11-08):** além das camadas da fase, o motor desenha uma segunda fileira de
  árvores distantes e uma de troncos do meio (cópias escurecidas das camadas), tufos, pedras e
  galhos no chão, e um primeiro plano de moitas e cipós em blocos de pixel.
- **Heróis:** 4 jogadores. Três com constelação (Áries/Água, Libra ou Sagitário/Fogo,
  Capricórnio/Terra), cada um com +1 no seu atributo forte, e o humano: o "normal", sem
  constelação e sem atributo forte, de jogabilidade mais difícil (na história, é o Câncer
  escondido). Por enquanto o humano usa a água só para teste; na etapa 3 fica sem poder de
  elemento e ganha o vento ao despertar o Câncer.
- **Imagem só do herói parado:** se uma pose não tem imagem, o jogo anima a imagem que existe
  (inclina, quica, estica). Com só o `parado_1` o herói já funciona. A ferramenta também aceita
  folhas com várias poses (`correr_folha.png`, `poses_folha.png`) e recorta sozinha.
- **Herói em pixel art (2026-11-08):** o humano veio do PixelLab (GIFs de 80×80, só a direção
  east). Em `img/sprites/herois/humano/` (no git; os PNGs pintados antigos ficam em `pintado/`,
  fora do git) cada animação é um GIF com o nome do jogo: `parado` (breathing idle), `correr`
  (running 6 frames), `pular` e `cair` (running jump, quadros 2-4 e 5-6; o "jumping" perdia a
  espada), `espada` (sword slash, quadros 3-5), `poder` (fireball, só o quadro 6: os outros têm
  bola de fogo e perdem a espada), `dano` (taking damage, 3-5) e `morrer` (dying, mostrado ao ser
  derrotado). A escolha dos quadros fica em `img/sprites/ajustes.json`; os GIFs originais, em
  `pixellab/`. O boneco tem 62 px de altura no jogo, ampliado sem borrar.
- **Fundos em pixel art (2026-11-08):** as camadas (`ceu`, `longe`, `perto`, `chao`) podem vir de
  qualquer IA de imagem, até em estilo pintado; a ferramenta reduz para a grade da pixel art (cada
  pixel da arte = 2×2 na tela), limita a 32 cores e tira o halo verde. Na fase, `luaNoCeu` diz
  onde está a lua na imagem do céu (para a luz da lua bater). O chão da floresta tem a crosta
  clara de cima cortada (`corteTopo` no `ajustes.json`).
- **Luz no escuro (estilo Lanterna, 2026-11-08):** cada fase tem `escuridao` (0 a 1; o Boitatá
  usa 0,78). Só se vê em volta das fontes de luz: o herói, a lua, os poderes (`corLuz` em
  `PODERES`), os inimigos (`luz` e `corLuz` em `INIMIGOS`), o chão em chamas, os pontos de
  controle, o pingente e o chefe (função `luzes` no módulo do chefe). O chão e as plataformas têm
  uma borda de brasa que brilha no escuro, para os pulos continuarem legíveis.
- **Parâmetros de teste:** `?heroi=agua|fogo|terra` testa outro herói (`?heroi=ar` é o humano
  desperto); `?fase=<chave>`;
  `?boss` começa no chefe; `?demo` joga sozinho; `&ff=600` avança 600 quadros; `&touch` mostra os
  botões no computador; `?semimagens` ignora as imagens; `?semluz` tira a escuridão.
- **Elementos contra o Boitatá:** água 1,2× (e apaga as bolas de fogo), pedra e vento 0,8×, fogo
  é absorvido (o herói de fogo precisa da espada nessa fase).
- **Plano:** etapa 1 (motor separado em dados, imagens com reserva, ferramenta e prompts) feita
  em 2026-11-07. Etapa 2: gerar as imagens do humano, do Boitatá e do fundo; a Milena preencher a
  ficha dos 3 heróis com constelação. Etapa 3: tela de escolha de herói (o humano como modo
  difícil), com o retrato de cada herói (`retrato.png`, que a ferramenta já leva para o jogo),
  poderes e fraquezas por chefe, imagens dos heróis. Depois, as fases novas (uma por monstro do bestiário): cada uma é uma ficha nova
  em `fases.js` e um módulo de chefe novo em `CHEFES`.

## Como atualizar o portal

1. Salvar as imagens novas em `img/local` ou `img/bestiario`.
2. Rodar `python ferramentas/otimizar_imagens.py`.
3. Se for criatura nova com imagem, colocar `img: '<nome-do-arquivo-sem-.jpg>'` no item dela em
   `BEASTS` dentro do `index.html` (e ajustar a contagem "x de 10 criaturas ilustradas").
4. `git add -A && git commit && git push`. O GitHub Pages atualiza em 1 ou 2 minutos.

## Ordem das fotos

A ordem das páginas é a do nome dos arquivos, de trás para a frente: começa em `20.12.25` e
termina em `20.11.28`. Quando há vários arquivos no mesmo segundo, o de maior número vem
primeiro: `(3)`, `(2)`, `(1)` e, por último, o sem número. A ordem foi conferida pela
continuidade do texto.

## Decisões

- 2026-11-07: a transcrição mantém a grafia original. As correções ficam só em
  `02-sugestoes.md`, para a Milena decidir o que aceita.
- 2026-11-07: as sugestões são opcionais. A história e as escolhas são dela.
- 2026-11-07: portal público no GitHub Pages, a pedido do Erick, com o nome do jogo ("Torneio das
  Lendas") no repositório. Nos arquivos públicos aparece só o primeiro nome dela, sem idade.
- 2026-11-07: imagens originais (cerca de 2,5 MB cada) ficam fora do git; o portal usa cópias de
  até 1600 px em `web/`.
- 2026-11-07 (Erick): o 4º jogador não tem constelação. É o "normal", sem atributo próprio, com
  jogabilidade mais difícil.
- 2026-11-07: a IA de imagem tem dificuldade de manter o personagem igual entre poses. O jogo
  passa a animar uma imagem só, e a ferramenta recorta folhas com várias poses. Para gerar as
  poses, a indicação é o ChatGPT (ver `04-prompts-sprites.md`).
- 2026-11-08 (Erick): o jogo migra para pixel art, no "estilo Lanterna" (apelido da referência
  visual): boneco pequeno em pixel art (48 a 64 px) para correr e lutar, retrato grande pintado
  para a tela de escolha, os diálogos e o HUD, e cenário escuro iluminado só pelo herói, pelo
  fogo e pelos poderes. O boneco e as animações vêm do PixelLab (pixellab.ai, câmera
  Sidescroller). O motor ganha modo pixel nítido e luz dinâmica.

## Pontos de referência (revisão de 2026-11-07)

Resumo da `02-sugestoes.md`, que tem os detalhes e as ideias de cada item. Marque `[x]` quando a
Milena decidir e anote a decisão na frente.

### O que está bom e vale manter

- A virada do Câncer: o "humano" protegido a aventura inteira é o próprio Câncer (plantada desde
  a p. 3: sem marca no braço, "protejam o humano e encontrem Câncer", o Leprechaun dizendo "é um
  humano", "o humano desperta a entidade de Câncer").
- A mistura de lendas (folclore brasileiro, britânico, irlandês e grego) amarrada pelo torneio
  dos deuses gregos.
- Os nomes gregos dos monstros: Ageláda (vaca), Aetós (águia), Kallikántzaros (duende grego).
- Escolhas que mudam o jogo: ficar amigo da Nessie facilita a Hidra; matar dificulta. O grifo
  também pode virar amigo. A placa "A morte nem sempre é o caminho" avisa isso.
- Notas do mestre prevendo o que os jogadores vão tentar (p. 31 a 33).
- Humor: a vaca com asas de pombo abduzida por um OVNI e o "Tufão merengue".

### Decisões pendentes da Milena (furos de continuidade)

- [ ] **Leão sumiu:** foi riscado da Terra e não está em nenhum elemento (ficam 11 signos).
  Colocar num elemento ou virar mistério da parte 2.
- [ ] **Elementos diferentes da astrologia comum** (ex.: Áries de Água). Foi de propósito? Se
  sim, explicar no mundo; se não, usar Fogo = Áries, Leão, Sagitário; Terra = Touro, Virgem,
  Capricórnio; Ar = Gêmeos, Libra, Aquário; Água = Câncer, Escorpião, Peixes.
- [ ] **Herói de Fogo, Libra ou Sagitário:** p. 1 circula Libra; p. 4 desenha a constelação de
  Sagitário. (Decidido em 2026-11-07: o 4º jogador é o humano, sem constelação.)
- [ ] **"O humano" ou "a humana"** (p. 5 diz "a humana").
- [ ] **50 ou 100 anos:** renascem 100 anos depois da morte (p. 2), mas "pela primeira vez em 50
  anos todos nascem juntos" (p. 3). Sugestão: eles "despertam" adultos em vez de "nascer".
- [ ] **Pingente ou dog tag:** os três primeiros monstros deixam pingentes; da Nessie em diante,
  dog tags. Unificar o nome ou explicar a diferença.
- [ ] **Quem é "a" que eles enganaram** (frase do barqueiro). Se for a Morte, amarra com a placa
  do lago e a frase da Excalibur.
- [ ] **Museu de Antiguidades sem continuação** (p. 5). Sugestão: cena curta em que o Câncer
  toca um objeto com o símbolo do caranguejo e é puxado para o mundo espiritual.
- [ ] **Resposta do enigma "o maior de 53"** (só para o mestre).
- [ ] **O que as letras da lista formam** (uma letra por dog tag). Sugestão: a senha do portão
  ou o nome verdadeiro do Câncer.
- [ ] **Por que os "haters" têm razão** (p. 2). Sugestão: cada torneio desequilibra os elementos
  e causa desastres; vira o vilão da parte 2.

### Regras que faltam

- [ ] **Como fazer um teste** com os atributos V, P, A, F, I (Vigor, Presença, Agilidade,
  Força, Intelecto) e as perícias. Sugestão: rolar um d20 por ponto do atributo e ficar com o
  maior; atributo 0 = dois d20, fica com o menor; perícia treinada +5; dificuldade 10 (normal)
  ou 15 (difícil).
- [ ] **O que é PS e quanto cada um tem.** Sugestão: PS = 10 + 5 × Vigor.
- [ ] **Coluna "Tentativa | Dano"** das fichas (p. 22 a 27) está vazia: qual atributo/perícia
  rola para acertar e qual dado de dano.
- [ ] **Maldição do barqueiro (p. 9):** do jeito que está, tirar 16 tira e dá ponto de azar ao
  mesmo tempo. Sugestão: 15+ perde 1 ponto, menos de 10 ganha 1, de 10 a 14 nada. Falta
  dizer quando rola e o que o azar faz na prática.
- [ ] **Escalada da montanha (p. 10):** falta a altura e quanto se sobe por acerto. Sugestão: o
  jogador escolhe o dado (d6 sobe 1 m, d12 sobe 2 m, d20 sobe 3 m), errou cai 1 m, montanha de
  10 m.
- [ ] **Bônus de elemento** (opcional): Fogo +1 Força, Terra +1 Vigor, Ar +1 Agilidade, Água +1
  Intelecto.
- [ ] **Hidra:** "Vida x7", "infinitas vidas" e "7 corações ou 3 vezes o principal" precisam
  virar uma regra só. Sugestão: cabeças com PS próprios, cortar uma faz nascer duas a não ser
  que queimem o pescoço; coração principal aparece no fim; Nessie amiga chega no meio da luta.
- [ ] **Excalibur (batalha psicológica):** sugestão de visão/medo + teste de Presença ou
  Intelecto para cada um que tentar tirar a espada.

### Arrumação do texto

- [ ] Colocar a cena da Excalibur (p. 21) no lugar dela: depois do grifo/Leprechaun, antes da
  Hidra.
- [ ] Atualizar a ficha do Aetós (águia) para Grifo e usar as fichas do bestiário como versão
  final dos ataques (Boitatá, Freddy e Mula mudaram entre as listas e as fichas).
- [ ] Separar caixas de **"Leia em voz alta"** (com "vocês") das **notas do mestre** (com
  "eles").
- [ ] Correções de grafia só na versão passada a limpo (tabela na seção 3.2 das sugestões).
- [ ] Se for publicar ou compartilhar: trocar o Freddy Krueger (personagem de filme, com dono)
  por uma criatura própria. Sugestão: Fobétor, deus grego dos pesadelos. As outras lendas são de
  domínio público.

### O que falta escrever

- [ ] Fichas do Grifo, do Kallikántzaros (Leprechaun) e da Hidra (p. 28 a 30 em branco).
- [ ] Cena do museu.
- [ ] A luta contra o Freddy (p. 18 tem só o teste inicial).
- [ ] Parte 2: o Torneio das Lendas. Ideias: os outros oito signos como rivais, semideuses como
  azarões, o mistério do Leão, os haters sabotando, a profecia da Excalibur e a volta da Nessie.

### Material final

- [ ] Montar o "livro do mestre" passado a limpo, com estes capítulos: mundo, signos e elementos,
  criação de personagem, regras, aventura cena a cena, bestiário, notas do mestre e extras para
  imprimir (fichas em branco, lista com letras, cartas das constelações).
