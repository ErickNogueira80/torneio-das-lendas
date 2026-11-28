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
- Portal (GitHub Pages): https://ericknogueira80.github.io/torneio-das-lendas/ — **trancado com
  senha** desde 2026-11-22 (a senha fica com o Erick e a Milena; não anotar aqui, o repositório é
  público). O portal de verdade é `fonte/portal.html`; o `index.html` da raiz é gerado por
  `ferramentas/trancar_portal.py` (página que pede a senha e decifra o portal). Lê os `.md` direto
  (por isso o `.nojekyll`).
- Mesa dos jogadores: https://ericknogueira80.github.io/torneio-das-lendas/mesa/ — cada jogador
  abre no celular e vê só as criaturas que a Milena liberou na aba **Mesa** do portal (seção
  "Mesa" abaixo).
- Fotos originais: `C:\Users\erick\Downloads\milena_rpg_001` (36 fotos do WhatsApp de
  07/11/2026) e o zip `WhatsApp Unknown 2026-11-22 at 20.17.55.zip` (21 fotos de 22/11/2026, as
  páginas 22 a 42), todas copiadas para `fotos-originais/` como backup.

## Arquivos

| Arquivo | O que tem |
|---|---|
| `fotos-originais/` | Backup das fotos do caderno: 36 de 07/11, 21 de 22/11 e o retrato do João (`22.11.26`, papel solto), 58 no total |
| `01-transcricao-integral.md` | Transcrição fiel, página por página, com a grafia dela |
| `02-sugestoes.md` | Furos de continuidade, regras que faltam, correções de texto, ideias para a parte 2 e plano do material |
| `03-prompts-imagens.md` | Prompts para gerar imagens dos 13 locais, das 10 criaturas do bestiário e de 2 extras em outra IA, com um bloco de estilo comum |
| `img/local`, `img/bestiario` | Imagens geradas no **Gemini** (Erick, 2026-11-22) em tamanho original (fora do git, só no PC) |
| `web/` | Versões menores das imagens, usadas pelo portal |
| `ferramentas/otimizar_imagens.py` | Gera `web/` a partir de `img/` (rodar depois de adicionar imagens) |
| `fonte/portal.html` | O portal (onde se edita): início, aventura, bestiário, signos, caderno, transcrição, sugestões e o painel da Mesa |
| `index.html` | Gerado: o portal trancado com senha (`python ferramentas/trancar_portal.py`) |
| `mesa/` | Tela dos jogadores (`index.html`) e a configuração do Firebase (`firebase.js`) |
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
- **Piso irregular (2026-11-08):** o chão principal da fase é montado uma vez numa imagem pronta,
  com topo ondulado em degraus de pixel, montinhos, beiradas quebradas nos buracos, crosta, tufos,
  pedras e brasas. A física continua reta (`GROUND`); o desenho do herói acompanha o relevo
  (função `relevo`).
- **Plataformas = galhos (2026-11-08):** plataformas vizinhas (vão < 130 px) dividem uma árvore
  grande: o tronco fica no vão e cada plataforma é um galho grosso saindo dele (plataforma
  sozinha ganha tronco na ponta direita). Tronco com casca, nós, oco e rachaduras em brasa,
  galhos secos no alto. Montadas uma vez (função `arvores`); a colisão não mudou.
  Com as imagens `arvore_tronco`, `arvore_raiz` e `arvore_galho` (prompts na seção 4.1 do
  `04-prompts-sprites.md`), o jogo monta as árvores com elas; sem imagens, desenha sozinho.
  A ferramenta mede as peças para encaixarem: o tronco fica com 40 px de largura (80 na tela), o
  galho com 12 px de espessura (o topo medido vai na altura da plataforma; o pedaço de tronco
  grudado na esquerda é cortado) e a raiz é escalada para o tronco dela ter a largura do tronco.
  A raiz é desenhada na frente do piso, descendo pela face do chão (efeito 2,5D).
  Cada galho cai em direção à ponta, com ondulação própria (fatias de 4 px); o herói pisa
  seguindo essa curva (`perfilGalho`). Perto de uma árvore com raiz, o herói e as brasas descem
  até 44 px na tela e ficam 8% maiores, passando por cima das raízes, na frente do tronco
  (`caminhoFrente`; só no desenho, a física não muda).
- **Baús escondidos (2026-11-08):** `baus` na ficha da fase (x, y do chão/galho, xp, cura,
  texto). Abrem ao encostar. O primeiro fica no galho alto (y 185) de uma árvore própria em
  x 1600, que só se alcança pulando do galho de 282 da árvore vizinha (conferido em simulação:
  do galho baixo e do chão não dá). Dá 40 XP e enche a vida. Tem um brilho dourado fraco no
  escuro, como pista.
- **Altar da Constelação (2026-11-08):** os pontos de controle são altares (imagens em
  `img/sprites/objetos/altar/`, apagado e aceso, recortados com a mesma caixa para não pularem).
  Ao passar, o altar acende com clarão e faíscas douradas, enche vida e energia e mostra "Altar
  aceso". Aceso, solta faíscas e ilumina em dourado. O do começo da fase já vem aceso.
  Altura: 27 px da arte (54 na tela), um pouco mais baixo que o herói (62).
- **Tamanho da fase e altares (decisões do Erick, 2026-11-14):** a fase do Boitatá tem **10 telas**
  (9.600 px: 9 de exploração + a arena do chefe, de 8.640 a 9.600), para testar a duração.
  **Padrão para todas as fases: 3 altares** (o do começo, um no meio e um antes do chefe; aqui em
  80, 4.250 e 8.300). A parte nova (depois de 3.300) segue o mesmo jeito da antiga: 8 buracos de
  100 a 140 px, árvores-plataforma, 9 trechos de chão em chamas e 17 inimigos (brasas e vaga-lumes
  um pouco mais fortes no fim).
- **Guardião da sala secreta: o Mímico (decisões do Erick, 2026-11-14):** cada sala secreta pode
  ter um guardião diferente (`sala.guardiao` na ficha da fase; tipo em `INIMIGOS`), e **é preciso
  vencê-lo para ganhar o prêmio**. Nesta fase é o **Mímico**: no lugar do baú da sala, idêntico a um
  baú (mesma imagem, mesmo brilho e mesma luz). Acorda quando o herói chega a 110 px (ou leva um
  golpe), treme, mostra "É um mímico!" e pula atrás do herói com a boca aberta (70 de vida, mordida
  9). A arte é a do baú cortada na linha da tampa, com dentes, língua e olhos desenhados pelo jogo
  (dá para trocar por arte do PixelLab). Vencido: vida cheia, 70 XP e solta o prêmio.
- **Itens e a Lança (2026-11-14):** regra do caderno (p. 34): no máximo 2 itens, um deles de ataque.
  O herói tem o espaço `ataque` (arma; começa com a espada) e um espaço `livre` (ainda sem uso);
  guardados no navegador (`tdl_itens`). Armas em `ARMAS` (`fases.js`): alcance, recarga e dano a
  mais. A **Lança** (prêmio do Mímico) é uma estocada fina de 96 px (a espada pega 54), +2 de dano,
  recarga 0,42 s. O nome vai no HUD. **Herói com a lança (PixelLab, 2026-11-14):** com a lança
  equipada o jogo usa o boneco `herois/humano_lanca` (pasta `img/sprites/herois/humano_lanca/`;
  GIFs originais e o zip em `originais/`). Animações: parado = breathing-idle; correr = running 6
  quadros; pular = running-jump quadros 2 a 4; cair = 5 e 6; espada (estocada) = Spear thrust 3 a 6;
  poder = fireball quadro 5 (lança estendida, sem a bola de fogo); dano = 3 a 5; morrer = Dying. O
  cross-punch e o jumping-1 (a lança some no meio) não entram. Altura 64,4 (a ponta da lança passa
  da cabeça; o corpo fica do tamanho do herói de espada). Na estocada o jogo desenha só o vento.
  Sem essa imagem, volta a lança desenhada nas costas e na estocada.
- **Laboratório da cobra (2026-11-14, em discussão):** `jogo/laboratorio/cobra.html` (link:
  https://ericknogueira80.github.io/torneio-das-lendas/jogo/laboratorio/cobra.html). Página de teste,
  fora do jogo, para escolher a técnica de movimento do Boitatá: **A** = rolo desenhado + pescoço e
  rabo em corrente; **B** = a cobra inteira em corrente (o rolo é um caminho em espiral; no bote os
  gomos saem do rolo e ele encolhe). Técnicas: corrente com distância fixa e limite de dobra (a
  parte grossa dobra menos), FABRIK (base presa, ponta vai ao alvo), onda que corre pelo pescoço e
  "dinâmica de 2ª ordem" (t3ssel8r) na cabeça e na ponta do rabo, com controles na página (rapidez,
  amortecimento, resposta, ondulação, dobra, tamanho e voltas do rolo B).
  **Editor de esqueleto (2026-11-14):** alças para arrastar (cabeça, até 2 ossos no meio do
  pescoço, ponta e meio do rabo) e 6 poses com nome (descanso, cospe fogo, prepara o bote, bote,
  rabada cima e chão), guardadas no navegador. O pescoço passa pelos ossos presos (FABRIK em
  trechos; cada trecho ganha gomos conforme o tamanho na pose) e desenrola quando a pose pede mais
  comprimento. "Tocar sequência" passa por todas as poses; "Copiar poses" gera o texto (JSON com
  poses e ajustes) para mandar ao Claude, que usa no jogo. Testes pela URL: `?modo=B`,
  `?pose=bote`, `?tocar`, `?semeditar`, `?op=5&or=3`, `?ff=N`. Desde a versão 6 do Boitatá
  (2026-11-14), a versão C e as poses estão no jogo (ver "Boitatá versão 6").
  **Rodada 3 (2026-11-14, pedidos do Erick):** a **B (corpo todo) é a preferida** e abre primeiro.
  Rolo com 3 voltas e mais gordo embaixo (controles de voltas, tamanho e grossura); até 5 ossos no
  pescoço e 3 no rabo (numerados; poses guardadas em `op`/`or`, as antigas são convertidas);
  comprimento do pescoço e do rabo ajustáveis (na B, mais pescoço = ele sai mais baixo do rolo);
  rabo corrigido (estava grosso na ponta) e saindo com a grossura do corpo; por baixo das escamas
  uma camada nas cores das costas e da barriga (sem frestas pretas ao esticar; o preto fica só no
  contorno). Rabo: as partes finas dobram mais (a ponta enrola) e há o botão "Exemplo: rabo
  enrolado" (deitado, sobe e enrola a ponta para trás, com 3 ossos).
- **Rolo novo em 2 camadas, versão C do laboratório (2026-11-14, decisão do Erick):** o corpo
  enrolado volta a ser desenho fixo (some com as frestas pretas do rolo montado por gomos). Arte do
  PixelLab (3 voltas, a de baixo mais larga; original em `originais/v5_rolo_3voltas_pixellab.png`)
  dividida em `rolo_tras.png` (a imagem inteira) e `rolo_frente.png` (só a borda da frente do anel de
  cima: linhas 114 a 160, colunas 70 a 190 da arte; até a 152 sobrava a ponta preta do contorno do
  pescoço embaixo da faixa da barriga). O trecho do pescoço que fica dentro do rolo, embaixo do anel,
  é recortado (não aparece). Ordem: rabo → rolo de trás → pescoço →
  borda da frente → cabeça: o pescoço sai de DENTRO da volta de cima. A ferramenta guarda onde a
  camada da frente fica sobre a de trás (`deslocs` no sprites.json). Pescoço nasce em (114, 37) da
  arte recortada e o rabo em (24, 127), atrás da volta de baixo. Escala 2 (pixel igual ao resto do
  jogo; controle no laboratório); o rolo "respira" 1,2%. É a versão que abre no laboratório.
  Poses do Erick (2026-11-14): `jogo/laboratorio/poses/erick-2026-11-14.json` (texto do "Copiar
  poses"; descanso e cospe fogo editados, 3 ossos no pescoço e 3 no rabo, pescoço de 42 gomos).
  Layout do laboratório (2026-11-14, pedido do Erick): controles em colunas nas laterais da tela
  (esquerda: versão, esqueleto, poses e ações; direita: corpo e jeito do movimento); no celular eles
  descem para baixo da tela.
- **Cabeças sem pescoço (2026-11-14, editadas pelo Erick no Pixelorama):** a fechada é a variação 2
  da grade (1ª linha, 2ª coluna) e a aberta a variação 1, com o pescoço desenhado apagado. Os
  projetos `.pxo` estão em `img/sprites/chefes/boitata/originais/pixelorama_*.pxo` e os bustos
  anteriores em `originais/v4b_*`. A ferramenta reconhece cabeça sem pescoço (o ponto mais de trás
  fica no meio da altura) e põe a emenda atrás e um pouco abaixo do meio do crânio, escondida sob
  ele, com ângulo -0,5. Vale no jogo e no laboratório.
- **Bolas de fogo e chamas do PixelLab (2026-11-14):** as bolas de fogo do chefe usam a animação de
  9 quadros `objetos/bola_fogo` (viradas para onde voam) e as chamas da cabeça do Boitatá e da ponta
  do rabo usam `objetos/chama` (9 quadros). As grades de 16 variações ficaram em `originais/`.
- **Fogo parado (2026-11-14):** o chão em chamas da fase e o fogo que o Boitatá deixa no salto
  usam a animação de 9 quadros do PixelLab (`img/sprites/objetos/fogo/`, recortada da folha em
  `originais/`; 24 px de altura na arte, 48 na tela, 10 quadros por segundo, cada fogo começa num
  quadro diferente). Sem a imagem, volta o fogo desenhado.
- **Sala secreta (teste do Erick, 2026-11-14):** embaixo de um dos buracos há uma caverna com o
  Mímico guardando a Lança (ver abaixo). Nada indica isso lá em cima: o buraco é igual aos outros. A posição
  fica em `sala` na ficha da fase e **não deve ser contada ao Erick nem à Milena** (o teste é a
  surpresa de achar). Quem cai nesse buraco desce para a sala (a câmera desce junto; é a única
  câmera vertical do jogo), e sai pulando no **cogumelo-mola**: quem cai nele quica (é a dica),
  e pular em cima dá um pulo enorme pelo buraco (1.700 de impulso, sem o pulo curto de soltar o
  botão). Sem apertar direção, cai de volta no cogumelo e para. Conferido em simulação quadro a
  quadro. A sala é uma tela de largura; colisão própria (`SOLIDS_COL`), só para o herói e os tiros.
- **Golpe de espada (2026-11-08):** onda de ar em meia-lua (função `drawGolpe`) que abre e afina
  enquanto some, com fio branco, riscos de vento e um pouco de poeira; substituiu a faixa em arco.
- **Seleção de herói (2026-11-08):** depois do título vem "Escolha seu herói", com os 4 jogadores
  de `SELECAO_HEROIS` (herois.js): o humano (retrato, "sem constelação · difícil") e os 3 com
  constelação (Áries/Água, Sagitário/Fogo, Capricórnio/Terra) como silhueta do retrato com
  "?" na cor do elemento e "em breve". Cada cartão mostra os atributos (o atributo forte na cor do
  elemento). Escolher outro herói recarrega com `?heroi=`; depois vem o mapa. `?herois` abre direto
  nessa tela. Para liberar um herói: `disponivel: true` e o retrato em `img/sprites/herois/<id>/`.
- **Mapa do mundo (2026-11-08):** depois da tela de título vem o mapa (`dados/mapa.js`): 10 locais
  na ordem dos combates da história (Mula sem cabeça, Boitatá, Nessie, vaca, pesadelo, grifo,
  Kallikántzaros, Excalibur, Hidra e Olimpo), ligados por uma trilha. Só o Boitatá está liberado;
  os outros têm cadeado e "Bloqueado · em breve". O cartão mostra a ilustração pintada do local
  (a do portal) e o nome (sem o chefe, desde 2026-11-08). Locais bloqueados não mostram a
  ilustração (ela entregava a história, ex.: o OVNI do pasto): só névoa e "?" até a fase existir.
  A imagem do mapa ainda mostra o disco voador no pasto (fica assim por enquanto, decisão do Erick). Fase vencida ganha um ✓ (guardado no navegador). Sem a imagem
  do mapa (`img/sprites/mapa/mundo.png`, prompt na seção 4.3), aparece um fundo escuro.
  A imagem do mapa veio com nomes em inglês escritos pela IA; foram apagados com
  `ferramentas/apagar_textos.py` (o original fica em `img/sprites/mapa/original_com_textos.jpg`)
  e os marcadores foram posicionados em cima de cada lugar desenhado. `?mapa`
  abre direto no mapa; `?play` pula título e mapa.
- **HUD estilizado (2026-11-08):** barras com moldura escura e fio dourado, ponteiras em losango,
  brilho, marcas a cada 10% e o rastro claro do dano (a parte perdida some devagar). Painel do
  herói com cantos dourados e medalhão do nível. A barra do chefe fica embaixo, no centro (entre
  os botões de toque), com o nome entre filetes e pontas em chama, que ficam vermelhas na fúria.
- **HUD com arte (2026-11-08):** molduras do Gemini em `img/sprites/hud/` (`barra_boss`,
  `barra_vida`, `circulo_nivel`). A parte magenta marca onde vai o enchimento; a ferramenta deixa
  transparente, guarda a posição e não pixeliza (o HUD fica nítido). O jogo corta a barra em 3
  (pontas fixas, meio esticado), enche por baixo da moldura com o gradiente, o brilho e o rastro do
  dano. Sem essas imagens, volta o HUD desenhado pelo código.
- **Placa do chefe (2026-11-08):** `img/sprites/objetos/placa/placa_boss.jpg` (35 px da arte),
  antes da arena, com um brilho de brasa fraco no escuro.
- **Boitatá com arte (2026-11-08):** peças do PixelLab (pixel art nativo; a versão do Gemini
  ficou borrada e foi para `originais/`). O PixelLab devolveu grades de variações (4×4 cabeças de
  64 px, 8×8 gomos e rabos de 32 px; em `originais/pixellab/`); escolhidas: cabeça 0,2, ataque
  2,3, gomo 3,5, rabo 0,2 (linha,coluna). A cabeça de ataque aparece na bola de fogo e na mordida.
  Peças com até 160 px são usadas como vieram, sem reduzir.
  A ferramenta mede o ponto do pescoço de cada cabeça (`pescocos` no sprites.json); o jogo põe
  esse ponto onde chega o corpo, com um gomo extra embaixo para emendar, e o primeiro gomo mais perto.
- **Boitatá versão 6, o esqueleto do laboratório (2026-11-14, pedido do Erick; é o que está em
  uso):** o laboratório (versão C) foi levado para o jogo. O rolo é a arte em 2 camadas (o pescoço
  sai de dentro da volta de cima), e o pescoço e o rabo são correntes de gomos (FABRIK com ossos)
  puxadas para as **poses do Erick**. As poses ficam em `chefe.esqueleto` na ficha da fase
  (`dados/fases.js`): é o texto de "Copiar poses" do laboratório sem o campo `versao`. Para trocar
  as poses, é só colar o texto novo ali. Cópia do texto em
  `jogo/laboratorio/poses/erick-2026-11-14b.json` (as 6 poses, 3 ossos no pescoço e 3 no rabo,
  pescoço de 42 gomos e rabo de 34). Rolo no lugar do laboratório: centro a 760 px do começo da
  arena (`ARENA.x0`), ou seja, as posições do laboratório valem iguais no jogo.
  Pose de cada momento: entrada e descanso → `descanso`; bolas de fogo → `cospe`; aviso do bote →
  `prepara` (treme); bote, cabeça cravada (1,2 s, dano 2×) → `bote`, com a cabeça deslocada até
  onde o herói está (os ossos perto da cabeça vão junto, um pouco); rabada (herói a menos de 230 px
  do rolo) → `rabada_cima` e depois `rabada_chao`, e a ponta bate no chão.
  **Jeito do movimento:** no descanso e no cospe-fogo vale o jeito que o Erick escolheu no
  laboratório (rapidez 0,3, amortecimento 0,05, resposta -1,2: lento e balançante). No prepara, no
  bote, na rabada e por 0,8 s depois deles, um jeito rápido e firme (f 2,8, z 0,55, r 0,6), senão
  o bote ficaria lento demais e a volta dele balançaria para fora da tela.
  Para a cobra não sair da tela: a pose que passa do topo desce inteira, com a cabeça e os ossos
  juntos e a forma igual (a cabeça para em 95 px do topo, os ossos em 40). Há uma parede invisível
  para o balanço (topo e laterais da arena). O pescoço sai do rolo quando a pose pede mais
  comprimento e volta para dentro quando pede menos (mínimo de 14 gomos), senão a sobra estufa.
  Teste de jeito sem mexer no código: `&jeito=f,z,r` (ex.: `?play&boss&x=8800&jeito=1.2,0.35,0`).
  A versão 5 ficou guardada como `CHEFES.boitata_v5` (`tipo: 'boitata_v5'`, usa `ancoras`).
  **Ajustes de 2026-11-14 (pedidos do Erick):** o rolo desce 40 px (`AFUNDA`) e fica **na frente**
  do chão, sem recorte (só a cabeça cravada entra no chão). O rabo nasce mais alto e mais para dentro, atrás da volta de baixo, em (36, 113) da arte e
  com grossura 17, sem a fresta entre ele e o rolo. A barriga do rabo fica do mesmo lado do corpo do
  começo ao fim: antes cada gomo virava a barriga para baixo e a ponta erguida aparecia invertida.
  Fluidez: o desenho usa uma cópia suavizada do pescoço e do rabo, no tempo (sem tremido quando um
  osso troca de gomo) e no espaço (sem quinas nos ossos, onde a faixa da barriga abria em leque).
  **Bote mais suave:** no bote o pescoço sai do rolo de uma vez (420 gomos/s; antes a cabeça
  esperava o pescoço crescer e dava um tranco). Osso a menos de 170 px da cabeça fica solto no bote
  (o 1º osso do Erick ficava logo acima da cabeça e o pescoço caía reto até ela, formando um "L").
  Osso que volta a valer começa onde o pescoço está (antes puxava para onde tinha ficado parado). A
  volta do bote e da rabada tem um jeito próprio, firme e sem balanço (f 1,5, z 0,8, r 0), e dura
  0,8 s. O pescoço recolhe mais rápido nos ataques. A cabeça também é suavizada no tempo. Medido em
  40 s de luta: fora do bote, a cabeça anda no máximo uns 70 px por quadro (antes saltava 380).
  **Cabeça em brasa (sugestão do Claude, aceita pelo Erick):** sem as 3 chamas fixas. As rachaduras
  de lava da cabeça (os pixels laranja da arte) pulsam devagar. Antes de cada rajada a boca acende
  e cresce por 0,5 s (o aviso do cuspe) e sai mais fumaça das narinas. Na fúria (vida abaixo de 35%)
  a crista pega fogo de verdade (as chamas do PixelLab) e as rachaduras pulsam forte e rápido.
  **Já na arena (2026-11-14, Erick):** o Boitatá não sobe mais do chão. Ele é criado quando o
  herói chega a 1.500 px da arena e fica enrolado no lugar, em descanso (estado `espera`: sem
  ataques, sem dano de contato, não leva golpe), visto já na hora da placa. Ao passar o gatilho, ele
  acorda (tremor e brasas, 1,4 s) e a luta começa. **Bolas de fogo pela boca:** saem da frente da boca
  aberta da arte (ponto 36,27 de 47×46, girado com a cabeça; `BOCA`), não mais de um ponto fixo do
  crânio, que caía no nariz. **Ponta do rabo bem fina:** grossura de 30 na base até 1,2 na ponta,
  afinando mais rápido no fim; rabo com 38 gomos (era 34) e contorno preto mais fino nas partes finas.
  **Osso extra na ponta do rabo (2026-11-14):** automático, entre o último osso da pose e a ponta,
  puxado para o lado em que o rabo já vem enrolando (20% do trecho) e balançando de leve; sem ele o
  trecho fino virava um palito reto. As poses do Erick não mudam.
  A pose `prepara` foi feita pelo Claude a partir do descanso do Erick (cabeça recuada e armada
  sob o arco do pescoço); a padrão do laboratório deixava a cabeça caída dentro da volta.
- **Pingente com arte (2026-11-14):** o jogo usa `objetos/pingente/<id da fase>` (ex.:
  `img/sprites/objetos/pingente/boitata.png`, 40 px de altura na arte, 80 na tela) balançando de
  leve pela corrente; sem a imagem, volta o disco desenhado. Prompt na seção 4.10 dos prompts
  (amuleto de prata em gota de fogo, com a cobra enrolada em relevo e olho de brasa). A arte do
  Boitatá veio do Gemini com o xadrez de "transparente" desenhado no fundo (JPG): o fundo foi tirado
  por inundação a partir das bordas (pixels sem cor, brilho 98 a 208), parando no contorno escuro.
  Original em `originais/gemini_pingente_boitata.jpg`.
- **Cogumelos azuis na sala secreta (2026-11-14, arte do PixelLab escolhida pelo Erick):** folhas
  originais (azuis, verdes e vermelhos; grandes, largos, pequenos e a dança) em
  `img/sprites/objetos/cogumelo_grande/originais/`. Por enquanto só os azuis, decisão do Erick:
  `cogumelo_grande` (4 altos e 2 largos, 60 px de arte, 5 deles no fundo, escurecidos),
  `cogumelo_azul` (7 cogumelinhos parados no chão, 15 px), `cogumelo_danca` (9 quadros, 20 px: 12
  pequenos que **dançam**, cada um num tempo, alguns espelhados; com o herói a menos de 160 px dançam
  mais rápido; o pulinho saiu, parecia que saíam do chão) e `cogumelo_mola` (o largo de baixo claro, 24 px: é o cogumelo-mola, que
  achata e alarga quando pisado e estica no pulo). Todos brilham em azul na luz. Sem as imagens,
  volta o desenho por código. Os verdes e vermelhos ficam para outras salas.
  **Caverna sem fim (2026-11-14, ideia do Erick):** atrás de tudo, um campo de cogumelinhos
  desenhado por código (`campoCogumelos`, feito uma vez numa imagem): 16 fileiras, do fundo (no alto,
  minúsculas, escuras, quase sem pé) para a frente (maiores e azuis), e o alto some no escuro, como
  um chão que sobe para dentro de uma caverna infinita. Seis luzes azuis fracas mostram o campo.
  **Arte pintada em uso (2026-11-14, Gemini, prompt 4.11):** `img/sprites/objetos/fundo_sala/cogumelos.png`
  (original em `originais/gemini_caverna_cogumelos.jpg`), reduzida para 490×210 de arte. Entra no
  lugar do campo por código e dos cogumelos grandes do fundo. O chão da arte (84,3% da altura) fica
  alinhado com o chão da sala; o que passa dele é cortado. A ferramenta não tira o fundo dos
  objetos em `OBJETO_OPACO` (fundos pintados; o escuro da borda faz parte da arte). Sem a imagem,
  volta o campo por código.
- **Tiro de água com arte (2026-11-14):** bolha do PixelLab (9 quadros de 64 px; folha original em
  `img/sprites/objetos/bola_agua/originais/`), 16 px de altura na arte. O poder diz qual imagem usar
  (`imagem` em `PODERES`, herois.js); o tiro gira para onde voa. A arte voa para a esquerda (bola
  à esquerda, gotas à direita): o jogo espelha antes de girar. Sem a imagem, volta a bola desenhada.
- **Boitatá enrolado, versão 5 (2026-11-14, guardado como `boitata_v5`):** fica como na
  imagem da cobra inteira do PixelLab: o rolo parado no lado direito da arena, o pescoço subindo em
  S e a cabeça no alto. A imagem do rolo (`corpo.png`) é a cobra inteira recortada (sem o pescoço
  acima da linha 150 e sem o rabo, à esquerda da coluna 71; original em `originais/v4_cobra_inteira`).
  O pescoço é um tubo com a faixa de escamas, numa curva do corte no alto do rolo até a cabeça, que
  chega na direção do pescoço do desenho da cabeça (a emenda não quebra). O rabo é outro tubo que
  sai da frente do rolo. De onde saem o pescoço e o rabo fica em `ancoras` na ficha do chefe.
  Ataques: rajadas de bolas de fogo (a cabeça mira no herói), bote com o pescoço esticando até onde
  o herói está (aviso: encolhe e treme; a cabeça fica cravada 1,2 s, dano 2×) e **rabada** quando o
  herói chega a menos de 230 px do rolo (o rabo levanta tremendo e bate no chão; pule; 2 s de
  espera entre rabadas). A cabeça segue as poses com uma mola (balança e assenta). Fúria: mais
  rápido, 3 rajadas de 5 bolas, bote duplo, rabada mais rápida. Morre virando pó da cabeça para o
  rabo e o rolo some por último.
- **Boitatá debaixo da terra (versão 4), guardado como `CHEFES.boitata_terra`:** para usar em outra
  fase ou voltar, basta `tipo: 'boitata_terra'` na ficha do chefe. Descrição abaixo.
- **(versão 4) Boitatá, a cobra imensa debaixo da terra (2026-11-13, a pedido do Erick):** substitui o
  Boitatá enrolado (parado no canto, só a cabeça se mexia; o Erick achou a luta sem graça). Agora o
  corpo tem 3.000 px (mais de três telas) e segue o rastro da cabeça, como uma cobra de verdade:
  por onde a cabeça passa, o corpo passa depois. O que está debaixo da terra não aparece; onde o
  corpo fura o chão há um montinho de terra. Todo ataque é avisado: a terra racha e brilha onde ela
  vai sair (0,95 s; 0,6 s na fúria). Sequência: ergue, salto, rastejo, salto, ergue, rastejo.
  - **Ergue:** sai do lado longe do herói, fica alta balançando, cospe 2 rajadas de bolas de fogo,
    encolhe e treme (aviso) e dá o bote até onde o herói está. A cabeça fica **cravada no chão**
    1,4 s (0,9 s na fúria): é a hora de bater (dano 2× na cabeça). Depois recua pelo mesmo caminho
    e mergulha.
  - **Salto:** sai embaixo do herói, passa num arco alto por cima da arena e mergulha 640 px
    adiante. Fica chão em chamas 3 s onde ela saiu e onde entrou.
  - **Rastejo:** vem do lado oposto ao herói e atravessa a arena em ondas (arcos com vãos onde ela
    está debaixo da terra). As rachaduras mostram onde cada onda fura o chão; o lugar seguro é
    embaixo de um arco ou no meio de um vão.
  - Cabeça 1,5× (2× cravada), corpo 0,6×; encostar no corpo queima (`dano.corpo`), chão em chamas
    também (`dano.chama`). Fúria (< 35%): tudo 30% mais rápido, 3 rajadas de 5 bolas, bote duplo,
    ondas mais curtas e salto mais alto. Morre virando pó da cabeça para o rabo.
  - Arte versão 4 (2026-11-14, gerada pelo Erick no PixelLab com os prompts da seção 2.3 de
    `04-prompts-sprites.md`): cobra de verdade, com costas de carvão e rachaduras de lava e barriga
    clara em placas. Escolhidas: cabeça fechada e aberta na 1ª linha e 1ª coluna das grades de 16,
    e faixa do corpo embaixo à esquerda da grade de 4. Grades completas e a cobra inteira em
    `img/sprites/chefes/boitata/originais/v4_*`; a versão 3 em `originais/v3_*`.
    - Corpo: tubo com a `faixa_corpo` (a ferramenta usa como `gomo_corpo`). A barriga fica sempre
      do lado de baixo/de dentro (a faixa é virada conforme o lado para onde a cobra vai). O
      pescoço afina para 20 perto da cabeça, engrossa até 46 e afina até o rabo.
    - Cabeça: busto com o pescoço descendo até um corte. A ferramenta mede o corte, a grossura e o
      ângulo do pescoço (`pescocos`: x, y, grossura, ângulo); o jogo põe o corte na ponta do
      corpo e gira a cabeça para o pescoço do desenho seguir o corpo (inclinação limitada). O
      acerto e a mordida usam o centro do crânio, não a ponta do pescoço; o bote para 55 px antes
      do herói para quem crava no chão ser o crânio.
    - A versão enrolada está no histórico do git (commit `3557936` e anteriores).
  - Teste: `?play&boss&x=8800&ff=900` mostra um salto; `?chefevida=10` deixa o chefe quase morto.
  - Fluidez (2026-11-13, o Erick achou a movimentação dura): a velocidade não pula (acelera e
    freia: sai devagar da terra, perde força no alto do salto, freia ao chegar no alto quando se
    ergue, recua devagar-rápido-devagar); o bote e o mergulho são curvas, não retas; o corpo é
    alisado (sem quinas); a cabeça gira aos poucos e, ao trocar de lado, vira em vez de espelhar.
  - Para voltar ao Boitatá enrolado: `git revert` dos commits do Boitatá de 2026-11-13 (a versão
    enrolada é o commit `3557936`).
- **Inimigos do PixelLab (2026-11-08):** brasa (`andar`, `parado`; 34 px no jogo) e vaga-lume
  (`voar`, uma vespa de fogo; 40 px, sempre virada para o herói). Originais em `originais/`.
- **Pergaminho da placa (2026-11-08):** perto da placa antes da arena abre um pergaminho com o
  nome, um subtítulo e uma descrição do chefe, sem dica de como derrotar (`placa` na ficha da fase).
  Letras: IM Fell English (Google Fonts). Sem a imagem `img/sprites/hud/pergaminho.png` (prompt na
  seção 4.7), o jogo desenha um pergaminho simples.
- **Bestiário no jogo (2026-11-08):** botão "Bestiário" no mapa (ou tecla B). 12 criaturas
  (`dados/bestiario.js`: brasa, vespa de fogo e os 10 do bestiário da Milena; o pesadelo como
  Fobétor). Tudo "???" até o primeiro encontro (inimigo aparecer na tela ou o chefe acordar); depois
  mostra imagem, descrição, ataques e "Derrotados: N", num pergaminho (`hud/pergaminho`). Sem "como
  derrotar". Registro guardado no navegador (`tdl_bestiario`). `?bestiario` abre direto.
- **Sombra (2026-11-08):** fica no chão ou no galho embaixo do herói, menor e mais clara quanto
  mais alto ele pula.
- **Mapa (2026-11-08):** a região escolhida fica iluminada e o resto escurece; o cartão de uma
  fase pronta mostra a cena montada com as camadas da própria fase (no Boitatá, a floresta
  queimada) em vez da ilustração do portal.
- **Baú com arte (2026-11-08):** `img/sprites/objetos/bau/` (`bau_fechado`, `bau_aberto`), 24 px
  da arte, recortados com a mesma caixa.
- **Desempenho (2026-11-08):** as camadas de árvores são montadas uma vez, no início da fase, em 2
  faixas largas (fundo com neblina, parallax 0,28; meio, 0,55); por quadro o jogo só copia um
  pedaço de cada. A densidade das camadas não pesa, só o número de faixas. Brilho colorido só nas
  luzes fortes; retrato guardado no tamanho da tela; telas opacas. `?perf` mostra o custo de cada
  parte do desenho.
- **Cenário denso (2026-11-08):** além das camadas da fase, o motor desenha uma segunda fileira de
  árvores distantes e uma de troncos do meio (cópias escurecidas das camadas), tufos, pedras e
  galhos no chão, e um primeiro plano de moitas e cipós em blocos de pixel.
- **Heróis:** 4 jogadores. Três com constelação (Áries/Água, Sagitário/Fogo,
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
  controle, o pingente e o chefe (função `luzes` no módulo do chefe). (As bordas de brasa no chão e nos galhos saíram em 2026-11-08, a pedido do Erick.)
- **Heróis = personagens da mesa (2026-11-28, Erick):** os 4 cartões da escolha são Sam Seixeira (o
  humano, sem constelação), Jane Vorhood (Áries · Água), Angi Momobami (Sagitário · Fogo) e José Carlos
  (Capricórnio · Terra), com os atributos das fichas da Milena (status F, I, V, A; o P da ficha fica fora).
  O cartão mostra nome e "signo · elemento" mesmo bloqueado (o jogo de plataforma é à parte da mesa e os
  jogadores só recebem o link da mesa). Jane, Angi e José ficam "em breve" até chegar a arte: prompts na
  seção 0.1 de `04-prompts-sprites.md` (retrato do cartão no Gemini/ChatGPT anexando o avatar da mesa e
  boneco no PixelLab, pastas `herois/jane`, `herois/angi`, `herois/jose`; o Sam substitui o encapuzado em
  `herois/humano`).
  **Retratos dos cartões (2026-11-28):** os 4 do Gemini (Downloads `<jogador>-ia.jpg`) estão em
  `img/sprites/herois/<pasta>/retrato.png`, já recortados à mão (o Gemini pôs um brilho verde em volta, que
  a ferramenta deixava como contorno; recorte pela distância à cor do fundo + tirar o verde da borda).
  Originais em `img/avatares/heroi-<pasta>-gemini.jpg`; o retrato antigo do encapuzado em
  `img/avatares/humano-retrato-encapuzado.jpg`. Falta o PixelLab dos 4 (o Erick está gerando).
- **Pombo do PixelLab (2026-11-28):** GIFs do Erick em `img/sprites/inimigos/pombo/` (`voar` = "Flying",
  `investida` = "tilts forward", quadros 2–5, em que o corpo fica deitado; o "Diving" saiu parado no chão e
  ficou só em `originais/`, junto com o "Dizzy" e o zip). `altura` 44 e `suavizar` 2 em `ajustes.json`.
  O PixelLab fez o pombo em pé batendo as asas (pés à mostra): serve, mas um voo de verdade pede outra
  geração. No jogo: voa com `voar`, mergulha com `investida`.
- **Navegação (2026-11-28, Erick):** a tela inicial deixou de ser a do Boitatá: título, "O chamado" (frase
  do caderno, p. 3), controles gerais e o caminho (herói → mapa → local). Ao entrar numa fase aparece a
  apresentação dela (nome, guardião, herói, descrição do caderno; estado `intro`, toque/Enter começa; os
  testes pela URL com `x`, `boss`, `demo`, `sala`, `ff` ou `limpo` pulam). O cartão do mapa mostra o
  guardião do local liberado. Trocar de fase pelo mapa mantém o herói escolhido (`?heroi=` na URL).
- **Navegação, parte 2 (2026-11-28, Erick aprovou as 5 sugestões):** (1) **pausa** na fase: botão no canto
  de cima à direita (ou Esc/P) com Continuar, Voltar ao mapa e Trocar herói (estado `pausa`; sair recomeça a
  fase); (2) **voltar**: mapa tem "← Heróis" (e Esc), heróis tem "← Início" (e Esc); (3) **setas do mapa só
  nos locais liberados** (bloqueados abrem tocando); (4) o jogo **lembra o último herói e o último local**
  (`localStorage` `tdl_heroi` e `tdl_fase`; parâmetro na URL tem prioridade); (5) **Bestiário na tela
  inicial** (botão ou B), e o "voltar" dele leva para onde veio (início ou mapa).
- **Publicar o jogo:** trocar o `?v=` dos três scripts em `jogo/index.html` (qualquer valor novo,
  ex.: o hash do commit), para o celular não misturar arquivos novos com antigos do cache. Erros do
  jogo aparecem numa faixa vermelha embaixo da tela, com o navegador do aparelho. Erros de extensões
  do navegador (`chrome-extension://...`) são ignorados: não são do jogo (2026-11-20).
- **Parâmetros de teste:** `?heroi=agua|fogo|terra` testa outro herói (`?heroi=ar` é o humano
  desperto); `?fase=<chave>`;
  `?boss` começa no chefe; `?demo` joga sozinho; `&ff=600` avança 600 quadros; `&touch` mostra os
  botões no computador; `?semimagens` ignora as imagens; `?semluz` tira a escuridão. `?x=1500` começa a fase nesse ponto; `?fps` mostra os quadros por segundo; `?hd` desenha o mundo na resolução cheia
  (normalmente o mundo é desenhado numa tela interna de 960×540 e ampliado sem borrar, bem mais leve).
- **Elementos contra o Boitatá:** água 1,2× (e apaga as bolas de fogo), pedra e vento 0,8×, fogo
  é absorvido (o herói de fogo precisa da espada nessa fase).
- **Plano:** etapa 1 (motor separado em dados, imagens com reserva, ferramenta e prompts) feita
  em 2026-11-07. Etapas 2 e 3 em boa parte feitas em 2026-11-08 (ver "Estado atual").

- **Fase da Vaca: o pasto (2026-11-15, pedido do Erick):** `FASES.vaca` em `fases.js`, liberada no
  mapa. Partiu de um rascunho que apareceu no projeto em 2026-11-15 (fora desta série de sessões, não
  commitado) com a ideia "atacar ou esperar": o rascunho não funcionava (o `jogo.js` não compilava, o
  chefe chamava funções que não existem e a fase não tinha cenário) e foi refeito no padrão do Boitatá.
  - **Fase:** meio da tarde com sol (escuridão 0; era fim de tarde com 0,3 até 2026-11-21), 10 telas, 3 altares (80, 4.250 e 8.300), 6 buracos de 110 a
    130 px, 8 árvores vivas de copa redonda como plataformas, baú no galho alto (x 5.960, mesmo jeito
    do da floresta: só pulando do galho de 282), 7 **cardos** no lugar do chão em chamas
    (`perigoTipo: 'cardo'`), 8 **besouros-chifrudos** (patrulha) e 7 **pombos bravos** (voo). Sem sala
    secreta por enquanto. `tema: 'pasto'` liga o cenário próprio no motor (`PASTO`).
  - **Sem imagem nenhuma:** o jogo desenha tudo em pixel art (céu em faixas com sol baixo e nuvens,
    morros, colinas com árvores, cerca, capim e flores no piso, copa das árvores, cardos, besouro,
    pombo, a Vaca, o OVNI e a dog tag). Um OVNIzinho cruza o céu ao longe durante a fase (pista). Cada
    imagem dos prompts 4.12 entra no lugar do desenho quando existir (`fundos/vaca/...`,
    `chefes/vaca`, `inimigos/besouro`, `inimigos/pombo`, `objetos/pingente/vaca.png`).
  - **Ageláda (`CHEFES.vaca`), do caderno:** vaca com asinhas brancas de pombo que não deixa passar e
    muge (p. 17); ataques **Terremoto** e **Gás mortal** (p. 26); vence-se "pelo cansaço ou fazendo ela
    chegar a 0 PS" (p. 35). Na arena ela já está pastando e mugindo; quando o herói entra, levanta a
    cabeça ("MUUUUU!") e fica sempre entre ele e a saída, a uns 240 px.
    **Terremoto:** empina nas patas de trás (aviso) e pisa; duas ondas de terra correm pelo chão
    (pular; 12 de dano). Na fúria pisa duas vezes. **Gás mortal:** dá as costas, levanta o rabo e
    solta 3 nuvens verdes (4 na fúria) que andam até o herói, crescem e somem em 5 s; envenenam (4 de
    dano e 3 s de veneno). A água do herói espalha o gás. Encostar no corpo dela: 6.
  - **Dois jeitos de vencer:** **PS** = 220 (Vigor 5, a mais resistente até aqui; cabeça 1,3×,
    corpo 1×, sem resistência a elemento). **Cansaço** (barra azul fina acima do nome): cada ataque
    dela soma 4 e mais 4 se o herói desviou sem levar dano; avisos em 35 ("A vaca está ofegante"), 65
    ("mal se aguenta em pé"; fica mais lenta, sua e põe a língua de fora) e 88. Quem só desvia vence
    em uns 12 ataques (cerca de 1 minuto); quem bate vence pelos PS. Bater nela mostra uma vez "Você
    mexeu com a vaca!". Fúria abaixo de 35% dos PS.
  - **Final (p. 17), nos dois jeitos:** ela deita cansada, o OVNI desce, a luz verde a leva para cima
    ("Sim. Aliens."), o OVNI vai embora e cai a **dog tag dourada** (texto do caderno; o furo
    "pingente ou dog tag" continua em aberto). Vitória com a citação da p. 17.
  - **Motor:** chefes podem ter `barraExtra` (barra fina no HUD), `textoFim` (texto ao zerar a vida),
    `premioForma: 'dogtag'` e `corPremio: 'ouro'`; vitória aceita `conquista` (concordância do texto).
    Pixel art feita pelo jogo: `pxRet`, `pxElipse`, `pxLinha` e `pxCache` (desenha uma vez em tela
    pequena, com contorno, e guarda).

### Estado atual (2026-11-15) e próximos passos

Para retomar numa sessão nova, comece por aqui (e leia as seções citadas para os detalhes).

**Pronto e publicado:**
- Fluxo: título → seleção de herói (só o humano liberado) → mapa do mundo (só o Boitatá
  liberado; bestiário no botão) → fase do Boitatá → vitória volta ao mapa.
- Fase do Boitatá com 10 telas e 3 altares, toda em pixel art: herói do PixelLab (com espada e,
  com a Lança equipada, o boneco com lança), brasa e vespa, fundos pixelizados, piso irregular,
  árvores-plataforma, baú escondido, placa com pergaminho, escuridão com luz (estilo Lanterna),
  retrato no canto, HUD com molduras do Gemini, tiro de água com a bolha do PixelLab.
- **Sala secreta** embaixo de um dos buracos (qual é não se conta ao Erick nem à Milena): caverna
  com fundo pintado (campo sem fim de cogumelos azuis), cogumelos que dançam, cogumelo-mola para
  sair, Mímico de guardião e a Lança de prêmio (regra de 2 itens: `ataque` + `livre`).
- **Boitatá versão 6** (seção "Boitatá versão 6"): esqueleto do laboratório no jogo, com o rolo em
  2 camadas, pescoço e rabo em corrente com ossos e as poses do Erick (`chefe.esqueleto` em
  `fases.js`). Já espera enrolado na arena; bolas de fogo pela boca com aviso; bote em arco até o
  herói; rabada; cabeça em brasa e fogo só na fúria; rabo fino com osso extra na ponta; morre em pó
  e deixa o **pingente novo** (arte do Gemini). Versões antigas guardadas: `boitata_v5`,
  `boitata_terra`.
- Laboratório da cobra (`jogo/laboratorio/cobra.html`) para editar poses; "Copiar poses" gera o
  texto que vai para `chefe.esqueleto`. Poses do Erick em `jogo/laboratorio/poses/`.
- Bestiário com ??? até o encontro e contador de derrotados; locais bloqueados sem spoiler.
- **Fase da Vaca (2026-11-15)**, liberada no mapa: o pasto (meio da tarde desde 2026-11-21; antes, pôr do sol) e a Ageláda (terremoto, gás
  mortal, cansaço ou PS, abdução pelo OVNI e dog tag dourada). Tudo desenhado pelo jogo até chegar a
  arte (seção "Fase da Vaca").

**Para testar rápido:** `?play&sala` (começa na sala secreta; `&espada` tira a lança),
`?play&boss&x=8800` (luta; `&chefevida=40` já na fúria, `&chefevida=10` quase morto;
`&jeito=f,z,r` troca o jeito do descanso), `?play&x=8450` (chegando: o Boitatá esperando),
`?play&x=8580` (placa), `?play&x=1300` (baú), `?herois`, `?mapa`, `?bestiario`, `?fps`, `?perf`,
`?semluz`, `?semretrato`, `&ff=N` (avança N quadros; útil no Edge sem janela).
Vaca: `?fase=vaca&play&boss&x=8800` (luta; `&cansaco=90` quase caindo de cansaço, `&chefevida=10`
quase sem PS), `?fase=vaca&play&x=5750` (árvore do baú), `?fase=vaca&demo&cansaco=96` (vence sozinho).

**Em aberto (a decidir ou esperando arte):**
- Arte da fase da Vaca (prompts 4.12): fundo do pasto e árvores **prontos** (2026-11-20); faltam a
  Vaca, o besouro, o pombo e a dog tag no PixelLab. Quando chegar, o Claude liga as folhas no jogo.
- Fase da Vaca sem sala secreta (a próxima pode ter os cogumelos verdes ou vermelhos e outro
  guardião). Equilíbrio da luta a testar no celular (PS 220, cansaço 4 + 4 por ataque).
- Arte do Mímico no PixelLab (prompt 4.9): hoje é o baú cortado na tampa.
- Rabada do Boitatá fraca: a pose `rabada_chao` do Erick é quase o rabo enrolado, então a ponta
  anda pouco. Sugestão: ponta mais alta na "cima" e mais longe na "chão" (no laboratório).
- Jeito do descanso do Erick (rapidez 0,3, amortecimento 0,05) mantido; dá para comparar com
  `&jeito=`. A pose `prepara` atual foi feita pelo Claude.
- Espaço de item `livre` ainda sem uso (prêmios das próximas salas secretas; cada sala com um
  guardião diferente). Cogumelos verdes e vermelhos guardados para outras salas.
- Pingente ou dog tag (furo de continuidade, seção de pendências da Milena).

**Cache das imagens (2026-11-14):** a ferramenta grava em cada item do `sprites.json` uma marca
do conteúdo (`ver`) e o jogo pede as imagens com `?v=<marca>`. Antes disso, o celular guardava a
imagem velha e misturava com as medidas novas (o Boitatá v4 apareceu com a arte antiga esticada).
Basta rodar a ferramenta: não precisa trocar nada à mão para as imagens.

**Fluxo de arte:** imagem nova em `img/sprites/...` (originais fora do git) → `python -I
ferramentas/preparar_sprites.py` → conferir com o Edge sem janela num servidor local
(`python -I -m http.server 8765`) → trocar o `?v=` em `jogo/index.html` → commit e push.
Imagem opaca (fundo pintado): a pasta entra em `OBJETO_OPACO` na ferramenta. JPG com xadrez de
"transparente" desenhado (Gemini): tirar o fundo antes (ver "Pingente com arte").
Prompts em `04-prompts-sprites.md`. Peças paradas: Gemini (a ferramenta pixeliza). Animações e
personagens: PixelLab (vista Sidescroller, direção East).
**Kit de arte de uma fase (2026-11-20, Erick):** toda fase nova recebe o mesmo kit do Boitatá
(céu, longe, perto, chão, peças da árvore, chefe, inimigos, prêmio), descrito em "Kit de arte de uma
fase" no `04-prompts-sprites.md`. O Claude escreve os prompts, o Erick gera e salva em
`img/sprites/...`, o Claude roda a ferramenta, confere e publica. Arte com verde (pasto, folhas) usa
recorte em magenta `#FF00FF`, porque o recorte verde apaga o verde da arte.
**Arte do pasto em uso (2026-11-20):** as 8 peças do Gemini (`ceu`, `longe`, `perto`, `chao`,
`arvore_tronco`, `arvore_raiz`, `arvore_galho`, `arvore_copa`) em `img/sprites/fundos/vaca/`
(originais JPG fora do git). O que mudou para elas:
- Ferramenta: nas camadas `longe`/`perto`, se as 4 bordas não derem a cor do fundo (paisagem demais
  embaixo e nos lados), vale a cor da borda de cima; fundo magenta não apaga o verde da arte; o rosa
  das beiradas sai (despill do magenta) e, nas peças da árvore com recorte magenta, qualquer tom
  arroxeado restante. Ajuste novo `emendar` (fração da largura, no `ajustes.json`): mistura as laterais
  da camada para o encaixe não aparecer (usado em `fundos/vaca/longe` e `perto`, 0,12). O chão do
  pasto corta o céu e o capim pintados (`corteTopo` 0,29): o capim de cima é o do jogo.
- Copa (`arvore_copa`, peça nova): a ferramenta tira o toco de tronco de baixo, deixa as folhas
  opacas e reduz para 190 px de largura (380 na tela). O jogo põe a copa 24 px acima do galho mais
  alto da árvore e corta o tronco dentro dela. O Boitatá não muda (sem copa).
- Sol do céu: `luaNoCeu: [0.78, 0.16]` na fase (sol alto do meio da tarde; era `[0.80, 0.57]` no
  pôr do sol). Conferir quando chegar o `ceu` novo.
- **Ajustes do Erick (2026-11-20, 2ª rodada):** copa nova sem tronco (prompt atualizado na 4.12).
  Árvores maiores: ajuste `fundos/vaca/arvore` no `ajustes.json` (`tronco` 56, `galho` 15, `copa` 260
  px da arte; sem ele vale o padrão 40/12/190, o do Boitatá). No pasto a raiz faz parte da árvore
  (desenhada atrás da copa, com a base 18 px abaixo do chão, que a cobre) e não há o caminho 2,5D
  pela frente do tronco; a copa fica 22 px abaixo do galho mais alto (o galho sai das folhas).
- **Mato alto (2026-11-20):** no pasto, touceiras de capim em pixel art feitas pelo jogo
  (`quadroMato`, 6 variações): no chão a cada 260 a 780 px (atrás do herói e dos inimigos, só em chão
  firme) e, no primeiro plano, touceiras escuras no lugar das moitas pretas (que continuam no Boitatá).
- **Chão = gramado (2026-11-20, pedido do Erick; substituído no mesmo dia pelo campo aberto, abaixo):** no pasto o chão deixou de ser a faixa de terra
  vista em corte; é o próprio campo, que continua o gramado do fundo até a beira da tela (`gramado()`,
  ladrilho de capim em pixel art; borda de cima só com pontas de capim, sem a crosta clara; escurece
  para baixo). Os buracos são valas escuras. A imagem `fundos/vaca/chao` (terra) ficou sem uso no
  pasto; serve de reserva se o chão em corte voltar.
- **Laboratório do pasto (2026-11-20, pedido do Erick):** `jogo/laboratorio/pasto.html` (link:
  https://ericknogueira80.github.io/torneio-das-lendas/jogo/laboratorio/pasto.html). Cena com as
  camadas do pasto e uma árvore, para comparar: chão (terra em corte, gramado ou imagem testada),
  borda de capim, raiz atrás ou na frente do chão, tamanho do tronco e da copa, altura da copa, quanto
  a raiz fica enterrada, escurecimento do chão, mato e valas. Testa imagens do Gemini antes de salvar
  (tira o fundo magenta ou verde e reduz para pixel art como a ferramenta). "Copiar ajustes" gera o
  texto com as escolhas para o Claude levar ao jogo.
  - **Harmonia com o fundo (2026-11-20):** o Erick achou que fundo e chão "parecem coisas
    diferentes". Seção "Harmonia com o fundo" no laboratório (`?harmonia` abre lado a lado, hoje ×
    novo): **A** cores do fundo no chão (o campo e o capim que balança trocam as cores pelas 48 mais
    usadas em `perto` + `longe`); **B** uma luz para tudo (sol quente da direita, tom de fim de
    tarde, névoa no alto do campo e cantos escuros; controle "Força da luz"); **C** faixa de
    transição (o prado da base de `perto`, com o topo recortado em capim, entre o morro e o campo,
    paralaxe 0,8); **Extra** chão feito com a pintura do fundo; e a faixa da frente preta (pedido
    do Erick). Se não bastar: refazer o `capim` no Gemini anexando o fundo (opção D). Plataformas:
    o Erick escolheu objetos do pasto (feno, cerca, carroça) + uma árvore inteira pintada para o baú;
    gerar essas artes anexando o fundo, depois de decidir a harmonia.
- **Campo aberto (2026-11-20, pedido do Erick):** o Erick não gostou nem da terra em corte nem do
  gramado e quer o pasto como um campo pintado com profundidade (referência dele: um jogo de
  plataforma pintado à mão, com capim alto e folhagem escura em primeiro plano). O laboratório ganhou
  o modo "Ver o campo aberto" (`?campo` no link): chão sem corte que escurece para baixo, capim alto
  em duas camadas (uma atrás e outra na frente dos heróis, cobrindo os pés) balançando no vento,
  neblina quente entre o fundo e a área do jogo e silhuetas escuras de samambaia e capim na frente
  da câmera (paralaxe 1,45). Opção "Capim liso" para comparar sem pixel. Peças novas do Gemini para
  substituir o rascunho: `fundos/vaca/capim` e `fundos/vaca/frente` (prompts na seção 4.12). Ainda
  não está no jogo: espera o Erick aprovar no laboratório.
  - **Piso refeito (2026-11-20, foco do Erick):** em três partes, como nas referências: campo
    visto um pouco de cima (começa 20 px acima da linha dos pés; textura de pinceladas deitadas pelo
    vento, clara em cima e azul-escura embaixo, sem terra), capim que balança na frente dos pés e uma
    **faixa preta** (crista de capim perto da câmera, paralaxe 1,25, altura ajustável) que esconde
    onde o chão acabaria. Limite: abaixo da linha dos pés só há 80 px de tela; se o Erick quiser o
    campo maior, a linha do chão do pasto precisa subir.
  - **No jogo (2026-11-20, ajustes copiados do laboratório pelo Erick):** `chao: campo`, raiz na
    frente do chão enterrada 34 px, tronco 1,15 e copa 1,05 (em `ajustes.json`: tronco 64 e copa 273
    px da arte), copa 6 px mais alta, vento, neblina e faixa preta de 26 px. No motor (`jogo.js`):
    `texturaCampo()` no lugar do `gramado()` (piso sem borda nem crosta; `PISO_TOPO` do pasto é
    `GROUND - 44`), `drawCapim(false/true)` (capim que balança atrás e na frente dos pés, meia
    resolução), `crista()`/`drawCrista()` (faixa preta montada uma vez para a fase, paralaxe 1,25,
    samambaias baixas para não esconder o herói) e a neblina no começo do `drawWorld`. Saíram as
    touceiras de mato (`MATO`, `quadroMato`), substituídas pelo capim. Valas dos buracos começam
    transparentes. Próximo: trocar o capim e a faixa preta desenhados pelo código pelas peças
    pintadas `capim` e `frente` (prompts 4.12).
  - **Campo e faixa preta pintados (2026-11-20):** o Erick gerou `capim.jpg` e `frente.jpg` (4:1,
    magenta) de primeira com os prompts da 4.12. Ferramenta: `capim` (80 px da arte) e `frente` (70)
    entram em `FUNDO_ALTURA` e são camadas recortadas pelo topo, com `emendar` 0,12 em
    `ajustes.json`. Motor: o piso usa `capim` quando existe (topo da imagem 50 px acima dos pés; o
    piso espera a imagem carregar; `PISO_TOPO` do pasto = `GROUND - 56`) e `drawCrista` usa `frente`
    repetida (paralaxe 1,25; a parte cheia, a 57% da altura, fica 26 px acima do pé da tela). Os
    desenhos do código (`texturaCampo`, `crista`) ficam de reserva. O capim que balança continua por
    cima. As duas `Gemini_Generated_Image_*.jpg` da pasta são as texturas de terra antigas, sem uso.
  - **Capim na frente dos pés (2026-11-20):** o capim que balança é do código (não precisa de arte da
    IA). A camada da frente nasce na linha dos pés (base `GROUND + 4..16`), tem 16 a 42 px e um fio a
    cada 4 px, para cobrir as botas do herói e dos inimigos como no Planet of Lana.
    O capim que balança não nasce em cima das raízes das árvores (`naRaiz`, pedido do Erick).
  - **Besouro e pombo "paz e amor" (2026-11-20, pedido do Erick):** não atacam. Encostar deixa o
    herói com **1 de vida** (não mata; o empurrão nunca joga no buraco). Bater neles (espada ou poder)
    não os fere: eles ficam bravos, piscam e dão uma **investida** (`investida`/`golpeInvestida`; o
    besouro corre de cabeça baixa pelo caminho dele, o pombo mergulha no herói) que deixa com 1 de
    vida; bater **de novo** (no mesmo bicho) e a investida **mata**. A investida acerta mesmo com o
    herói escondido. Ao renascer, os bichos se acalmam. Testado com um roteiro no navegador sem tela
    (1ª investida: 1 de vida; 2ª: morte, nos dois bichos).
    **Besouro:** mais alto que o pulo (caixa 130 x 140); desenho provisório (`quadroBesouroGrande`,
    26 x 24 ampliado 6x) até a arte do PixelLab (prompt com animações `andar`, `preparar` e
    `investida` na seção 4.12 de `04-prompts-sprites.md`). 5 besouros com **caminho longo**, a
    130 px dos buracos e passando por cima das raízes (x1–x2: 1350–2040, 2540–3540, 4030–4940,
    5450–6370, 7820–8400), vel. 55–60.
    **Mato alto:** um trecho pequeno no caminho de cada besouro (`moita: [x, largura]` no besouro,
    120–130 px: 1660, 2870, 4250, 6100, 8310 desde 2026-11-28), fora das raízes, desenhado pelo código (`drawMoitas`,
    ~80 px). No chão e com o centro dentro do mato, o herói fica escondido (`escondido()`, sem aviso
    na tela) e o besouro passa **na frente** do mato (`drawEnemies(true)` depois de `drawMoitas`).
    **Sem cardos** no pasto (`perigos: []`).
    **Mato fora dos objetos (2026-11-28, Erick):** o 1º estava em cima do tronco caído, o 2º em cima da
    pedra e o 4º também na pedra; foram para os vãos livres (entre pilha de feno e tronco, entre carroça
    e pedra, entre pilha de feno e pedra). O 3º estava colado na beirada do buraco (4100) e foi para 4250.
    Decisão: o mato continua feito pelo código (densidade e vento aprovados pelo Erick); imagem de IA
    seria parada e não abriria com a passagem do herói.
    **Esconder na carroça (2026-11-28, ideia do Erick):** em cima da carroça de feno, ▼ mergulha no feno
    (`entrarNoFeno`/`ficarNoFeno`; as plataformas dos objetos levam `tipo`). O herói afunda até sumir (2026-11-28: sem a cabeça para fora) e sai de dentro do feno com o pulo;
    `escondido()` vale, não dá para atacar; pulo ou ◀ ▶ saem com um pulinho. Nas outras plataformas ▼
    continua descendo por elas. A 1ª carroça (2520) fica no caminho do 2º besouro.
  - **Árvores (2026-11-20):** a copa passou a ser desenhada **depois da raiz** (a imagem da raiz traz
    o pé do tronco, que ficava por cima das folhas) e os galhos por cima da copa (camadas: tronco →
    piso → raiz → copa → galhos). Cada árvore varia a copa: até três imagens (`arvore_copa`,
    `arvore_copa2`, `arvore_copa3`; a ferramenta aceita os nomes com número), espelhada nas árvores
    pares, tamanho 0,9–1,08 e tom mais verde ou mais dourado. Galho novo e copas 2 e 3: prompts
    "Árvores, versão 2" na seção 4.12. O baú em cima de galho acompanha o caimento do galho
    (`caiGalho`, vale também para o Boitatá).
  - **Prado no estilo do fundo (2026-11-20, em teste):** o Erick gerou no Gemini um prado plano no
    estilo do `perto` (`img/sprites/fundos/vaca/prado.jpg`, cópia de `Gemini_Generated_Image_ilqb…`).
    Vira o chão do pasto (`prado`, 120 px de arte, 852 x 240 na tela, começa 80 px acima dos pés;
    `PISO_TOPO` do pasto = `GROUND - 96`). Ajustes na ferramenta: `emendar` 0,12, 48 cores,
    `tirarClaros` 200 (tira o fio bege que sobrava do fundo branco perto da borda) e `aplainar` 1
    (`aplainar_luz`: tira a mancha alaranjada de um lado, que repetia a cada 852 px como um holofote,
    mantendo a textura e o escurecimento de cima para baixo). Com o prado, o capim que balança sai.
    A faixa da frente ficou **preta** (pedido do Erick). Correção junto: o piso era montado antes de
    a lista de imagens chegar e caía no capim desenhado pelo código (`SPRITES_PRONTOS`).
    **Estilos para comparar (2026-11-20, referências do Erick: Cast n Chill, Summer House, Sky Dust,
    img4 e Afterimage):** no pasto, as teclas **1 a 6** (ou `?estilo=`) trocam: 1 `prado` (hoje),
    2 `quadro` (um tom lilás por cima de tudo e névoa entre os planos), 3 `chapado` (a cena inteira
    reduzida a 20 cores tiradas do céu, do fundo e do prado, mais vivas), 4 `luz` (cena escurecida e
    o sol pintando tudo), 5 `faixa` (chão simples de tufos de folhas e corpo escuro, fundo num tom só e
    apagado) e 6 `calcada` (caminho de lajes de pedra no prado e raios de luz). `posEstilo()` aplica os
    efeitos depois do mundo e antes da HUD; o nome do estilo aparece no alto. É só para escolher.
    **Estilo Magibot (2026-11-20, escolha do Erick: "acho que descobri o estilo que quero seguir"),
    em pixel art:** tecla **7** (`magibot`, padrão da tela `?limpo`). Chão em blocos desenhados pelo
    código (`blocoMagibot`): topo de musgo visto um pouco de cima (onde se pisa), musgo escorrendo
    pela borda, capim e florzinhas saindo do topo, frente de terra arroxeada com pedras encaixadas,
    entalhes e raízes, pontas arredondadas nos buracos. Blocos altos para subir são sólidos comuns
    (`drawBlocosAltos`, desenhados antes do chão). Fundo claro e enevoado num tom quente só, raios de
    sol, cipós pretos na frente (`drawCipos`, paralaxe 1,3) e uma sombra embaixo no lugar da faixa
    preta. A tela `?limpo` agora tem um buraco (1600–1740) e três blocos (900, 2300, 2460).
    Refino (2026-11-20, Erick): **piso plano** no pasto (`relevo` = 0, o herói anda reto), frente do
    barranco de **terra** com estrias, musgo e pedrinhas (sem tijolos, é pasto) e **sem raios de sol**.
    Plataformas: objetos de fazenda (feno, cerca, carroça, tronco caído, pedra). Kit de prompts do
    Gemini na seção 4.13 de `04-prompts-sprites.md` (`bloco_chao`, `bloco_beirada`, `feno`,
    `feno_pilha`, `cerca`, `carroca`, `tronco_caido`, `pedra`, `cipos`).
    **Kit no jogo (2026-11-20):** as 9 imagens do Erick processadas (`FUNDO_ALTURA` e `RECORTADAS` na
    ferramenta; ajustes: `bloco_chao` emendar 0,1; `cerca` chave magenta, `corteBaixo` 0,2 e `semRoxo`;
    `cipos` chave magenta; `carroca` `corteBaixo` 0,1; opções novas `chave`, `corteBaixo` e `semRoxo`).
    Chão: `bloco_chao` repetido, meio da faixa de capim na linha dos pés; `bloco_beirada` nas pontas
    dos buracos pela metade do tamanho (é um close; espelhada no lado esquerdo); vala escura só abaixo
    do chão. **Objetos são plataformas de mão única** (`OBJETOS_PASTO`: tamanho em px da arte e onde
    se pisa, medidos no perfil de cima; `platsDosObjetos`; `obj: true` não vira árvore): o herói passa
    na frente andando e só fica em cima se pular (Erick: "se quiser passar por baixo, tem que ser uma
    opção"). Cipós: metade de cima no alto (paralaxe 1,25) e samambaias baixinhas embaixo (1,45).
    **Refino 2 (2026-11-20, retorno do Erick):** pedra com piso mais largo; cerca usa só o trecho do
    meio da imagem (`corte` em `OBJETOS_PASTO`: dois mourões inteiros, a imagem tinha emendas quebradas);
    cada objeto tem `base` própria (afunda na faixa de capim), sombra achatada e capim na frente do pé
    (o feno parecia flutuar); a `bloco_beirada` saiu: a ponta do barranco é o próprio `bloco_chao`
    recortado (canto arredondado, terra que recua e escurece, musgo pendurado); os galhos dos cipós
    saem de uma **árvore inteira** em silhueta (tronco preto até o chão, como no Magibot, de tempos em
    tempos, com um ou dois galhos) e as samambaias viraram tufos sorteados (4 recortes, tamanho e lado
    variados). **Refino 3:** sem o capim desenhado na frente dos objetos; pedra com piso de ponta a
    ponta; tronco da árvore mais reto e galhos saindo do alto da tela (sem vão).
    **Piso mais largo (2026-11-21, Erick):** a faixa de capim do `bloco_chao` ganha `CHAO_EXTRA` (12)
    linhas da arte, copiadas do miolo da própria faixa e deslocadas na horizontal (`chaoLargo`); os pés
    ficam no **meio** da faixa (`topo = GROUND - 52`, 2026-11-21) e a frente de terra começa mais abaixo.
    Objetos com o pé no meio da faixa também (`OBJ_BASE` 6, sem base por objeto). O topo verde passa por
    uma limpeza (pixels marrons viram oliva) até chegar o `bloco_chao` v2 (prompt na seção 4.13.1 de
    `04-prompts-sprites.md`: gramado de pasto limpo e faixa mais funda).
    **`bloco_chao` v2 (2026-11-21):** gramado limpo gerado pelo Erick (ajuste `corteTopo` 0,26: a imagem
    trazia uma segunda faixa de capim apagada em cima). A faixa já vem funda (linhas 2–28 da arte), então
    `CHAO_EXTRA` = 0, sem a limpeza de cor, `topo = GROUND - 30` (pés no meio da faixa). Objetos mais
    baixos: feno e pilha `base` 14, carroça 22. **Sem véu nem neblina** no estilo Magibot (o fundo fica
    com a cor original; Erick: "o fundo tá muito apagado... tira a neblina"); a vala do buraco escurece
    logo abaixo da linha dos pés.
    **Refino 2026-11-21 (tarde):** sombra dos objetos é uma elipse baixa colada no pé; o fio rosado no
    topo do gramado sai (`chaoLargo`); pedra mais baixa (`base` 20); a ferramenta tira o rosa do magenta
    das bordas de todos os objetos e, com `semRosa` (tronco, feno, pilha, carroça, cerca), o tom rosado
    de dentro também; buraco: a faixa de capim termina reta na beira, a terra recua só abaixo dela, e a
    boca do buraco (parede de trás em terra que escurece até o preto) é desenhada por trás das beiradas;
    samambaias um pouco maiores e mais frequentes.
    **Refino 2026-11-21 (noite):** objetos **sem sombra desenhada** (feno `base` 20, pilha 18, afundados
    no gramado); limpeza do topo do gramado só no rosa de verdade (a anterior abria buracos); boca do
    buraco com cantos de cima em curva e lábio da frente do gramado arredondado, terra irregular; limpeza
    do rosa dos objetos mais forte (contorno em 2 passadas; `semRosa` puxa o rosado para marrom).
    **Chão sem pixel art (2026-11-21, Erick):** `bloco_chao` trocado por uma variação nova do Gemini
    (a anterior guardada como `bloco_chao_antigo_21-11.jpg`, fora do git) e processado **liso**: ajustes
    `semPixel` (só reduz, sem paleta) e `altura` 200 (desenhado em 1:1; a escala no jogo é
    `200 / naturalHeight`). O resto da tela continua em pixel art. A ponta direita ainda é amarelada.
    **Prado sem pixel art (2026-11-21, Erick):** `prado` com `semPixel` e `altura` 240 (escala no jogo
    `240 / naturalHeight`); para ver: `?fase=vaca&limpo&estilo=prado` (tecla 1).
    **Objetos sem pixel art (2026-11-21, Erick):** feno, pilha, cerca, carroça, tronco e pedra com
    `semPixel` e `altura` no dobro; `OBJETOS_PASTO` continua medido em px da arte em pixel e `drawObjetos`
    converte pela razão `k` (altura da imagem / `h`, ou `hi` na cerca).
    **Fundos sem pixel art (2026-11-21, Erick):** `ceu` (540), `longe` (400), `perto` (430) e `frente`
    (140) com `semPixel`; o jogo suaviza a camada quando a imagem tem altura perto da desenhada, e a
    faixa da frente cobre 140 px (`kf`). Cipós, herói e árvores-plataforma continuam em pixel art.
    Sem o rosa do magenta nas camadas lisas: a redução é feita pré-multiplicada (RGBa) e o rosa até 4 px
    da borda vira a cor vizinha; nas camadas recortadas (menos o céu, que tem rosa de verdade), o magenta
    forte some em qualquer lugar.
    `perto` com `bordaDura` (alfa firme e 1 px a menos na borda: some o contorno escuro meio transparente
    das copas). No pasto o `longe` aparece **uma vez só** (2026-11-21, Erick): a segunda fileira, cópia
    escurecida da mesma imagem, deixava o morro com contorno duplo; ela fica só nas outras fases.
    `longe` do pasto **sem `emendar`** (a imagem já se repete quase sem emenda; a emenda cortava a ponta
    esquerda e deixava uma mancha cinza no alto à direita) e com `bordaCor` 3 (os 3 px da borda pegam a
    cor de dentro: some o fio cinza que o magenta deixava na crista dos morros).
    Objetos com `baseSuave` (fração de baixo da imagem em que a base escura pintada vai sumindo no capim;
    o escuro some mais rápido que o claro): pedra 0,55, carroça 0,35, tronco 0,45, feno 0,25, pilha de
    feno 0,2. Pedra e carroça com `baseForte` (o escuro já some no começo da faixa: moitas escuras das
    rodas e do lado esquerdo da pedra). O brilho de sol e os anéis de lente do lado direito do `perto`
    Meio da tarde (2026-11-21): originais do pôr do sol copiados para `img/sprites/fundos/vaca/por_do_sol/`
    (fora do git); prompts novos sem anexo na seção 4.14 de `04-prompts-sprites.md`.
    Chegaram `ceu`, `longe`, `perto` e `prado` de dia (2026-11-21). Ajustes: `prado` com `corteTopo` 0,4
    (a imagem veio com muito branco em cima) e `fecharBuracos` (flor branca no meio do capim não vira
    buraco: só some o que fica acima do capim); `perto` sem `emendar` (a imagem já se repete) e com
    `bordaCor` 3; `longe` e `perto` com `semMagenta` 12 (o que puxa para rosa pega a cor dos vizinhos) e
    `longe` com `semCinza` 150 (cinza-arroxeado e lilás que o magenta deixou nos vales). Árvores-plataforma
    ainda são do pôr do sol.
    Objetos de dia (2026-11-21), sem base de capim e sem sombra: o `baseSuave` saiu (deixava a base
    enevoada); `semMagenta` 12 e `bordaCor` 2. Pisos medidos de novo no contorno de cima (`OBJETOS_PASTO`;
    a cerca agora é a imagem inteira, sem `corte`). Pedra refeita (uma rocha só; o Erick aprovou). Tronco
    maior (`altura` 130) e mais para dentro do capim (`base` 22); pedra maior (`altura` 140) e mais em cima
    do capim (`base` 0). Cerca nova, velha e torta como as do cenário: o Erick gerou 3; ficou a 3
    (`cerca.jpg`; as outras em `cerca_1.jpg` e `cerca_2.jpg`, que a ferramenta ignora).
    **Caminho pela frente dos objetos** (como na raiz da árvore): andando no chão perto da pedra, do tronco
    ou da carroça, o herói desce até 30 px na tela e passa na frente deles (`caminhoFrente`, `FRENTE_OBJ`;
    só no desenho, a física não muda). Depois o Erick achou o desvio longe demais: 14 px (`FRENTE_PASTO`).
    Pedra ainda maior (`altura` 170) e mais para dentro do capim (`base` 14).
    **Vala:** a beirada pega as cores do capim do prado (`casarCom: "prado"` na ferramenta: média e
    contraste do verde e do amarelo-palha iguais aos do prado) e tem **rampa**: chegando na beirada, o
    herói sobe no morrinho de capim dela (até 58 px na tela, `subidaVala`) e fica no alto até a outra
    beirada; vale no ar também, então o pulo sai do alto (só no desenho, a física continua reta).
    Testar com `&ff=90` (avança 90 quadros antes de desenhar): sem ele, o herói pisca nas capturas.
    Emenda da vala com o chão (2026-11-21): a beirada some no prado num degradê longo (62% da largura dela,
    em vez de 70 px); `perto` com `emendar` 0,03 (a emenda da camada de árvores e cercas deixava uma linha
    vertical justo perto da vala). Testado e descartado: o capim do prado ir até a beira com a quina
    arredondada (ficou um bloco reto e duro). Pedra mais baixa (`base` 44).
    **Prado com a vala pintada** (2026-11-21; o Erick aprovou a imagem): `prado_vala.jpg`, o próprio
    `prado.jpg` editado no Gemini (anexo só dele). Ferramenta: mesmos ajustes do prado, menos `emendar` e
    `aplainar` (cortariam/deslocariam a vala). No jogo, centrado em cada buraco; as pontas somem no prado
    normal num degradê de 220 px; só uma faixa de 90 px no meio (a terra da vala) estica para a abertura
    na linha dos pés ficar do tamanho do buraco (`PV`: `centro` 806,5, `abre` 58, `meio` 110; o Erick pediu
    o buraco mais largo). Com ele, a `vala_beirada` fica desligada (reserva no código) e a rampa
    (`subidaVala`) sobe 26 px (`PV.subida`): chegando na borda, o herói sobe na beirada de capim da imagem.
    Tela `?limpo` com 3 buracos (2026-11-21, Erick): 1600–1740, 2250–2380 e 4000–4120.
    Besouro gigante: no **PixelLab** (pixel art como o herói; decisão do Erick), ~80 px, East, animações
    `andar`, `preparar` e `investida` por descrição; roteiro na seção 4.14 de `04-prompts-sprites.md`.
    **Besouro no jogo (2026-11-21):** 2ª versão do PixelLab (vista de lado; a 1ª saiu em 3/4 e foi
    descartada). GIFs em `img/sprites/inimigos/besouro/` (`andar` 9, `preparar` 5, `investida` 7 quadros;
    os originais com o nome do PixelLab em `originais/`); a ferramenta aceita as animações `preparar` e
    `investida` (`ANIMS`); `altura` 150 em `ajustes.json`. No jogo: anda com `andar`; atacado, vira para o
    herói, usa `preparar` com a cabeça inclinando e tremendo (reforço por código, a animação do PixelLab
    mexe pouco) e `investida` na corrida. Regra igual: encostar ou a 1ª investida deixam com 1 de vida; a
    2ª investida (bateu de novo) mata. Tela `?limpo`: um besouro perto da pedra (caminho 3150–3740).
    Besouro com `suavizar` 2 (Scale2x duas vezes na ferramenta: a pixel art fica 4x mais fina e com as
    quinas arredondadas; o Erick achou os pixels grandes demais ao lado do herói). Solução de verdade, se
    quiser: gerar no PixelLab num tamanho maior (o besouro ocupa ~45 px da tela de 108).
    Vala: cada `prado_vala` vai só até o meio do caminho para a vala vizinha (a imagem tem ~1600 px e o
    capim das pontas cobria o buraco ao lado, 2026-11-21).
    **Encostar com 1 de vida mata** (Erick, 2026-11-21, opção 2): a 1ª encostada no besouro (ou no pombo)
    deixa com 1 de vida; encostar de novo já com 1 (fora dos 1,4 s de proteção) é derrota ("O besouro te
    esmagou!"). Testado: vida cheia → 1; com 1 → tela de derrota.
    Besouro v3 (2026-11-21): o Erick gerou no PixelLab em 172 px (o besouro ocupa 112 x 70 px, antes ~45 de
    altura): mais detalhe e pixels menores na tela; `suavizar` 2 continua. Versões anteriores em
    `img/sprites/inimigos/besouro/originais/` (`v2_108px`, `v3_172px` = a atual).
    Sem o retângulo branco do tamanho da caixa de colisão quando um inimigo pisca (Erick, 2026-11-21: não
    mostrar caixa de nenhum inimigo ou personagem): quem clareia é o próprio desenho (`ctx.filter`).
    **Sala secreta na tela `?limpo`** (Erick, 2026-11-21, "como na tela do Boitatá"): embaixo do 2º buraco
    (2250–2380), a mesma sala do Boitatá (caverna de cogumelos azuis, cogumelo-mola no meio para sair e o
    mímico guardando a lança): `sala: { x0: 1835, x1: 2795, chao: 1020, mola: 2315, guardiao: mímico }`.
    Testar com `&sala` (começa dentro) ou `&x=2300` (cai pelo buraco). Ainda não está na fase completa.
    Próximo (Erick): sala do pasto com cogumelos verdes e chão liso como o da superfície; prompts na seção
    4.14 de `04-prompts-sprites.md`. **Feito (2026-11-21):** as 3 imagens do Gemini entraram em
    `img/sprites/fundos/vaca/` como `sala_fundo` (caverna verde, 980x420), `sala_chao` (chão de musgo no padrão
    do prado, `corteTopo` 0,28, `fecharBuracos`, `emendar` 0,06) e `sala_mola` (recortada, 70 px), todas lisas.
    No pasto, `drawSala` usa o fundo verde, repete o chão com o musgo na linha dos pés (no lugar da crosta e
    das pedrinhas) e o `drawMola` usa a mola verde; os cogumelinhos do PixelLab (parados e dançando) ficam
    verdes (pintados uma vez numa cópia, `salaVerde`; o `ctx.filter` a cada quadro e o fundo redimensionado a
    cada quadro derrubavam o FPS na caverna, 2026-11-21). Chão da sala 20 px mais alto (os pés no meio do
    musgo). A sala do Boitatá não mudou (azul).
    **Ageláda do PixelLab (2026-11-21):** 1ª versão (vista de lado, 160 px; a vaca ocupa 108 x 78).
    Quadros soltos em `img/sprites/chefes/vaca/<animação>/frame_*.png` (pasta fora do git, como os fundos;
    zip original em `originais/`); a ferramenta aceita chefe com pastas de quadros (`preparar_pixel`) e as
    animações `empinar`, `gas`, `cansada`; `chefes/vaca` com `altura` 165 e `suavizar` 2. A `cansada` toca uma
    vez e ela fica deitada. Bons: `parado`, `andar`, `cansada`. Fracos: `empinar` (quase não empina; o jogo já
    gira o corpo nas patas de trás) e `gas` (sai pela boca); o Erick quis ver assim antes de refazer.
    **Luta nova: o script dos 5 minutos** (Erick, script de 2026-11-15, ligado em 2026-11-21; substitui a
    vitória por PS e por cansaço). Ao chegar a vaca **não ataca** (estado `calma`: pasta de olho no herói;
    encostar não machuca). Barra **sono** no HUD. Sem bater nela: avisos em 1 min ("A vaca está de olho"),
    2 ("desconfiada"), 3 ("vai dormir") e 4 ("A vaca dormiu", ela deita); em **5 min** ela dorme de vez, o
    OVNI a leva e cai a dog tag (vitória). **Bater nela** a deixa brava: o relógio zera, ela não sente o
    golpe (vida 9999, a barra não desce) e ataca com terremoto e gás sem cansar; barra **fúria**; avisos em
    1 min ("A vaca tá ficando brava"), 2 ("Termina logo com isso") e 3 ("Você foi avisado": o herói fica
    com 1 de vida); 30 s depois o OVNI **abduz o herói** (derrota). Testes: `&calma=290` (quase dormindo),
    `&brava=170` (quase o aviso), `&brava=209` (abdução).
    **Fase completa da Vaca montada para a Milena testar (2026-11-21):** as árvores-plataforma (arte do pôr
    do sol) saíram; 16 objetos do pasto ao longo das 10 telas (`objetos` em `fases.js`; as plataformas saem
    deles com `platsDosObjetos`): feno, cerca, pilhas de feno, troncos, carroças e pedras. Baú escondido no
    alto da pilha de feno do meio (x 5900, y 330). **Sala secreta verde** embaixo do buraco 3800–3910
    (`sala: { x0: 3375, x1: 4335, mola: 3855 }`, mímico com a lança). Besouros e pombos como antes. Fora da
    tela de teste, as teclas 1–7 não trocam mais o estilo e o aviso do estilo não aparece.
    **Vala de terra** no lugar do buraco preto (escolha do Erick): imagem `vala_beirada` (lado direito;
    espelhada no esquerdo) em `valaBeirada()`; o capim dela encaixa no topo do prado, a terra começa logo
    abaixo da linha dos pés, a ponta do capim passa 8 px da beira da física e a parte de dentro some aos
    poucos no prado. O trecho do prado termina reto 40 px antes da beira (`VALA_RECUO`); o fundo da vala
    é terra escura que vai ao preto.
    estão pintados na imagem (não saem por ajuste).
    Tela `?limpo`: feno 500, cerca 900, buraco 1600–1740, pilha de feno 2000, carroça 2500, tronco
    3100, pedra 3600. Se uma imagem for regerada com outro tamanho, medir os pisos de novo.
    **Tela de teste:** `?fase=vaca&limpo` tira bichos, árvores, buracos, baús e perigos (só o chão e
    o herói), para acertar o piso e a transição com o fundo.
  - **Meio da tarde (2026-11-21, pedido do Erick):** a cena da vaca passou do pôr do sol para o
    **meio da tarde, com sol**. O caderno não diz a hora (p. 17); o pôr do sol veio do prompt da
    pintura do local (nº 08 de `03-prompts-imagens.md`), e a cena seguinte (p. 18, a noite e o
    pesadelo) começa "finalmente está escurecendo", então a vaca tem que ser mais cedo. No código:
    `escuridao` 0 (`drawLuz` agora pula o escuro quando a escuridão é 0 mas mantém os brilhos
    coloridos do gás e do OVNI; o Boitatá não muda), névoa clara e azulada no lugar da névoa quente
    (`drawWorld` e o cenário de reserva), cenário de reserva com céu azul, sol alto e nuvens brancas
    (`FASE.cores` e `fundoPasto`), terra do barranco de reserva em marrom (era arroxeada), sol em
    `luaNoCeu: [0.78, 0.16]`, besouro do bestiário "brilhando ao sol da tarde". **Falta a arte:** as
    imagens de `fundos/vaca/` (céu roxo e laranja, luz dourada da direita) e a pintura do local
    `web/locais/08-...jpg` continuam do pôr do sol até serem refeitas com os prompts da seção **4.14**
    de `04-prompts-sprites.md` (prioridade 1: `ceu`, `longe`, `perto`; 2: `prado`, `capim`,
    árvores; 3: reiluminar objetos e chão se ficarem laranja). Não foi testado na tela nesta
    sessão (só a checagem de sintaxe): conferir `?fase=vaca&play&boss&x=8800` (OVNI e gás) e o
    pasto aberto.
  - **Correções (2026-11-20):** o campo pintado acabava antes do pé da tela e aparecia uma linha
    marrom do fundo (agora há um fundo `#13282b` embaixo da imagem); os buracos viraram valas escuras
    desde a beirada, com as duas beiradas do campo arredondadas e quebradas (`beira` no `piso`, iguais
    dos dois lados; a vala passa 40 px por trás delas); a árvore às vezes ficava sem raiz porque era montada antes de a imagem da raiz
    carregar (`pecasArvore` agora espera todas as peças).

**Próximos passos possíveis:**
- Heróis de Áries (Água), Sagitário (Fogo) e Capricórnio (Terra): a Milena preenche a ficha
  (seção 5 dos prompts); falta decidir se os elementos seguem a tabela dela ou a da astrologia.
- O humano sem poder de elemento (modo difícil) e ganhando o vento ao despertar o Câncer.
- Próxima fase: Mula sem cabeça (ficha em `fases.js`, módulo novo em `CHEFES`, arte no Gemini e no
  PixelLab, texto da placa, ativar em `mapa.js`). A Vaca serve de modelo de fase sem imagens.
- Pendências pequenas: tirar o disco voador do pasto na imagem do mapa (adiado).
- **Pasto no meio da tarde:** gerar as imagens novas (seção 4.14 dos prompts), começando pelo céu.

## Futuro: Godot e lojas (estudo de 2026-11-08, nada decidido)

O Erick só quis entender como funcionaria. Nenhuma destas ações foi iniciada. Valores e regras das
lojas mudam: confirmar antes de pagar.

### Portar para o Godot 4

- É uma reescrita, não conversão: o código é JavaScript + Canvas; o Godot usa GDScript e cenas.
- Aproveita sem refazer: todas as imagens de `jogo/sprites`, os dados das fases e heróis, as
  regras de RPG e o comportamento do Boitatá (como receita).
- Refaz: o motor (física, câmera, luz, HUD, mapa, toques). Boa parte já vem pronta no Godot.
- Ganha: luz 2D melhor (combina com o estilo Lanterna), editor visual (a Milena montaria fases
  arrastando objetos), exportação nativa para Android, iPhone, PC e web.
- Perde: hoje basta um link; a versão web do Godot é mais pesada (30 a 40 MB) e o normal vira
  instalar. O Claude não consegue abrir o editor para testar: o ciclo passa a ser escrever,
  vocês testarem e mandarem prints.
- Quando valer a pena: fase do Boitatá fechada e hora das próximas, a Milena querendo montar fases
  sozinha, ou lançar como app. Caminho: instalar o Godot 4, montar o projeto com a fase do Boitatá
  e as imagens atuais, testar, e fazer as fases novas já no Godot (a versão web continua no ar).

### Publicar nas lojas

- **itch.io (primeiro passo sugerido):** grátis, aceita o jogo web como está, roda no navegador;
  vitrine para colher opiniões. Pode ser gratuito ou "pague quanto quiser".
- **Play Store:** dá para empacotar o jogo web atual (PWABuilder ou Capacitor), sem reescrever.
  Taxa única de desenvolvedor (US$ 25 na última conferência). Exige conta de adulto, política de
  privacidade (mesmo sem coletar dados), classificação etária (questionário) e, em contas pessoais
  novas, um teste fechado com testadores por algumas semanas antes de liberar ao público.
- **Steam:** empacotar como app de PC (Electron ou Tauri) ou exportar pelo Godot. Taxa por jogo
  (US$ 100, devolvida depois de um valor em vendas), espera e revisão no primeiro lançamento,
  página com capa, trailer e prints, formulário de impostos e declaração do uso de IA na arte.
- **Ordem sugerida:** itch.io → Play Store com 2 ou 3 fases → Steam com o jogo mais completo (aí
  faz sentido o Godot).

### Pontos de atenção

- **Conteúdo:** com uma fase só, a Steam avaliaria mal; publicar com várias fases do mapa.
- **Direitos:** Freddy Krueger vira de vez o Fobétor; folclore (Boitatá, Mula sem cabeça) é livre;
  conferir nos termos do Gemini e do PixelLab se o uso comercial da arte é permitido.
- **A Milena:** menor de idade; contas, contratos e recebimento no nome do Erick, com crédito da
  criação para ela no jogo e na loja.
- **Público:** marcar "para crianças" traz regras bem mais rígidas no Google; classificar como
  livre para todos, sem mirar em crianças, é mais simples.

## Mesa: o portal como ferramenta de jogo (2026-11-22)

Pedido do Erick: a Milena joga com os amigos, cada um no seu celular; ela libera os bosses um por
vez e os jogadores só veem o que ela liberou (imagem e nome).

- **Jogadores:** abrem `.../mesa/` (sem senha, sem conta). Tela de espera até a primeira criatura;
  cada criatura liberada aparece na hora com animação ("Nova criatura") e vibração; as anteriores
  ficam embaixo, em "Já encontradas". Tocar amplia a imagem.
- **Mestre:** aba **Mesa** do portal (trancado), entra uma vez com e-mail e senha do Firebase e
  toca em Liberar/Esconder em cada criatura; "Esconder todas" zera a mesa.
- **Como funciona:** Firebase Realtime Database (projeto gratuito do Erick), nó `mesa/bosses/<img>`
  com `{nome, img, t}`. Regras: leitura livre; escrita só com o e-mail da mestre logado. Config em
  `mesa/firebase.js` (os valores do `firebaseConfig` não são segredo).
- **Limite (decisão do Erick, 2026-11-22: repositório continua público):** proteção contra
  curiosos. As imagens (`web/`), os `.md` e `fonte/portal.html` continuam abertos para quem souber o
  endereço ou achar o repositório. Alternativas descartadas: repositório privado com Firebase
  Hosting (links mudariam) ou GitHub Pro pago.
- **Situação (2026-11-22):** Firebase do Erick ligado (projeto `testeefk`, banco
  `https://testeefk-default-rtdb.firebaseio.com`, config em `mesa/firebase.js`). Usuária da mestre
  criada em Authentication (o e-mail fica só no Firebase e nas regras, não neste repositório
  público).
  Regras publicadas e conferidas (leitura livre em `mesa`, escrita sem login recusada, resto do banco
  fechado). Testado pelo Erick em 2026-11-22: liberar e esconder aparecem na hora no celular.

**Lista do portão na mesa (2026-11-22, Erick):** a lista aparece num pergaminho na tela dos
jogadores quando a Milena toca em **Entregar a lista** (no caderno, o portão entrega depois do
Boitatá e do Robin Hood; Mula, Robin Hood e Boitatá já vêm riscados como "Morto"). Os outros nomes
começam como tracinhos; **Nova dog tag** sorteia uma letra nova em cada nome ainda escondido (p. 13:
"para cada dog tag, uma letra nova de todos os nomes é revelada"); **Riscar (morto)** revela o nome
inteiro e risca; também há **Revelar nome**, **Desfazer**, **Recolher** e **Zerar a lista**. Os nomes
completos ficam só no portal trancado (`LISTA` em `fonte/portal.html`); no Firebase vai só o que os
jogadores já veem (`mesa/lista`: `entregue`, `dogtags`, `itens[i].vis` com `_` no lugar das letras
escondidas, `pos` e `morto`).
**Ajustes de 2026-11-22 (depois do 1º teste):** a pedido da Milena, os jogadores **não veem o tamanho
dos nomes**: só as letras já reveladas, na ordem, e um "?" (dados públicos em `mesa/lista`:
`letras`, `completo`, `morto`; as posições ficam em `mestre/lista`, que só a mestre lê). A lista usa
o **pergaminho do jogo** (`jogo/sprites/hud/pergaminho.png`, recortado em 9 partes) e a fonte IM Fell
English. Ao abrir a mesa, cada um escolhe **quem é** (Miguel, Bia, Mateus, João; fica salvo no
celular, com "trocar"); o painel mostra **quem está na mesa agora** (`mesa/jogadores`). As regras do
Firebase ganharam `mestre` e `mesa/jogadores` (ver abaixo).
**Ajustes de 2026-11-22 (2º pedido):** cada nome fica **reservado para o primeiro celular** que o
escolher (`mesa/jogadores/<id> = {dev}`, com transação; um código aleatório do aparelho fica no
navegador); outro celular vê "já escolhido". Só a mestre libera o nome (botão **Liberar** no
painel); quando ela libera ou faz **Nova partida**, o celular volta para "Quem é você?" (Erick, 2026-11-22). Quem está conectado fica em `mesa/online`. Ao escolher, abre a **ficha do jogador** como no
caderno (p. 37 a 40: personagem, idade, retrato desenhado pela Milena, status, perícias, itens,
ataques), **sem o elemento** (o "atributo principal", Erick; também protege a virada do
humano/Câncer); o botão **Minha ficha** reabre quando quiser. Fichas em `mesa/fichas.js`, retratos em
`mesa/retratos/` (recortados das fotos; o do João chegou depois, em papel solto, foto `22.11.26`). A ficha do Miguel chegou em 25/11 (José Carlos, 27; sem desenho: avatar genérico de encapuzado, prompt em `03-prompts-imagens.md`). O progresso
(criaturas, lista, dog tags, jogadores) fica salvo no Firebase entre sessões; **Nova partida** no
painel zera tudo.
**Navegação (2026-11-22, 3º pedido):** barra embaixo com **Criaturas**, **Lista** (só depois que o
portão entrega) e **Minha ficha**; cada aba é um endereço (`#criaturas`, `#lista`, `#ficha`) e cada
janela por cima (imagem ampliada, nova criatura, escolha da imagem) entra no histórico, então o
**voltar do Android** volta de aba ou fecha a janela em vez de sair da página. Novidade em outra aba
ganha uma bolinha vermelha e um aviso que leva até ela. Na ficha, **tocar na foto** escolhe entre o
**desenho** e o **avatar da IA** (`retratoIA` em `mesa/fichas.js`, arquivo `mesa/retratos/<id>-ia.jpg`;
escolha salva em `mesa/jogadores/<id>/avatar`); o **avatar da IA é o padrão** (Erick, 2026-11-22). Ao mudar `fichas.js` ou `firebase.js`, subir o `?v=` deles no `mesa/index.html` (cache do celular). Prompts dos avatares no Gemini: `03-prompts-imagens.md`,
seção "Avatares dos jogadores" (anexando o desenho; nada de foto de pessoa de verdade). Avatares de Bia, Mateus e João gerados pelo Erick no Gemini em 2026-11-22 (originais em `img/avatares/`, fora do git; 600×600 em `mesa/retratos/`). **Nome da Bia (2026-11-24):** a personagem é **Angi Momobami** (confirmado pela Milena; o caderno parecia "Amagi Mamabami"). 
**Painel da mestre para tablet (2026-11-25):** a aba **Mesa** do portal vira um painel em tela cheia
(some o topo do portal, botões grandes, atalhos no alto: Jogadores, Marcas e elementos, Locais,
Criaturas, Lista, Mensagem). Link direto para a Milena salvar na tela inicial do tablet:
https://ericknogueira80.github.io/torneio-das-lendas/#mesa (senha do portal + login de mestre).
O que ela libera, **um a um** ou todos de uma vez, e o que o jogador vê:
- **Marcas (constelações):** Bia Sagitário, Miguel Capricórnio, João Áries, Mateus Câncer (Erick e
  Milena, 2026-11-25). `mesa/constelacoes/<id> = {v, t}`. No celular: céu estrelado, as estrelas
  acendem uma a uma, as linhas se desenham, clarão, anéis e faíscas na cor do signo, e o nome. A do
  Mateus sai como **"não aparece"** (estrelas soltas que tremem e somem; não entrega o desenho de
  Câncer); o botão **Câncer (virada)** revela a de verdade. Desenhos em `mesa/estrelas.js` (sem IA).
- **Elementos:** `mesa/elementos/<id> = {v, t}`, mesmo efeito; Mateus **Nenhum**, com **Ar (virada)**.
- **Locais:** as 13 cenas de `web/locais/`, na ordem da aventura; `mesa/locais/<img>`. O jogador ganha
  a aba **Locais** e um aviso "NOVO LOCAL".
- **Criaturas** e **lista do portão**: como antes.
- **Mensagem:** texto livre com título opcional (modelos "O portão diz…", "Uma voz em suas
  cabeças…"); `mesa/mensagem = {titulo, txt, t}`; aparece com destaque em todos os celulares.
Cada revelação aparece uma vez por celular (quem entra depois também vê) e, se vierem várias juntas,
uma de cada vez. Quem é de qual signo/elemento fica só no portal trancado (`JOG_MESA` em
`fonte/portal.html`). Para acrescentar outra coisa a liberar, o caminho é o mesmo: um bloco no painel
gravando em `mesa/<coisa>` e a página `mesa/` ouvindo esse caminho (as regras do Firebase já cobrem
tudo dentro de `mesa`).
**"Toque para fechar" das revelações (2026-11-26):** no celular, a revelação (marca, elemento,
criatura, mensagem) às vezes não fechava. Ela abre sozinha, pelo painel da mestre, sem toque do
jogador, e o Chrome do Android pula entradas de histórico criadas assim; o `history.back()` usado
para fechar falhava. Agora a revelação não cria entrada: marca a atual (`replaceState {ov, rev}`) e
fecha trocando de volta. O "voltar" do Android com a revelação aberta volta à aba anterior.
**Correções de 2026-11-26:** (1) as abas **Criaturas** e **Locais** do celular travavam quando havia
mais de uma criatura liberada (a lista de "já encontradas" chamava `carta` com o índice do `map`
como segundo parâmetro); corrigido. (2) Painel padronizado: todo botão com 46 px de altura, ações
sempre em linha com o mesmo espaço, larguras fixas nas colunas (marcas/elementos, lista do portão),
jogadores em cartões iguais e o botão no pé de cada card de local/criatura.
**Pedidos do Erick (2026-11-25, noite):**
- **Dog tag por boss:** o botão geral "Nova dog tag" saiu; na lista do portão, cada boss riscado (morto) ganha o botão
  **Dog tag**, que vale uma vez (sorteia uma letra nova em cada nome escondido; `mestre/lista/itens[i].dog`). Os 3 que já
  começam riscados também ganham o botão; a mestre usa se a história der a dog tag deles.
- **Mensagem por jogador:** caixas "Todos" e uma por jogador; `mesa/mensagem.para` (lista de ids) quando não é para
  todos. O celular de quem não foi marcado ignora a mensagem.
- **Criatura com efeito:** a criatura liberada aparece na tela de revelação (clarão, anéis, faíscas, tela tremendo),
  na mesma fila das marcas e elementos, uma vez por celular.
- **Sons:** gerados no próprio celular (Web Audio, sem arquivos): estrelas e explosão nas marcas, subida e explosão no
  elemento, falha no "não aparece"/"Nenhum", rugido na criatura, vento no local, sino na mensagem e na entrega da
  lista, tilintar na dog tag. O celular só toca depois do primeiro toque na tela; botão 🔊/🔇 no alto (fica salvo).

**Elementos (2026-11-24):** os jogadores não veem o elemento até a mestre revelar. No painel
(aba **Mesa › Jogadores**), **Revelar os elementos** grava `mesa/elementos = {liberado, t, miguel,
bia, mateus, joao}` e os quatro celulares abrem ao mesmo tempo uma tela de destaque (símbolo e nome
na cor do elemento, com vibração); depois o elemento fica na ficha. Quem entra depois também vê o
destaque uma vez. O mapa fica só no portal trancado (`ELEMENTOS_MESA` em `fonte/portal.html`), não no
código público da mesa. **Mateus aparece "Nenhum"** (é o humano; no caderno, p. 34, ele é Ar, da
linha de Câncer); se a Milena quiser a virada para Câncer depois, é trocar o valor e revelar de
novo. **Esconder os elementos** tira; **Nova partida** também zera. Pendente com a Milena: a grafia dos nomes (hoje como no caderno: Nessie,
Vaca, Freddy Kruger, Grifo, Kallikatzaros, Excalibur, Hidra); a Hidra ganha letras desde a Nessie
"por enquanto". Vão testar na prática e adaptar.

Roteiro do Firebase (uma vez, conta Google do Erick):
1. https://console.firebase.google.com → **Adicionar projeto** (ex.: `torneio-das-lendas`), sem
   Google Analytics.
2. **Criação › Realtime Database › Criar banco de dados** → local `us-central1` → **modo
   bloqueado**.
3. **Criação › Authentication › Começar** → **E-mail/senha** → ativar → aba **Usuários › Adicionar
   usuário**: o e-mail e a senha da mestre.
4. **Configurações do projeto (engrenagem) › Seus apps › Web (`</>`)** → apelido `mesa`, sem
   Hosting → copiar o bloco `firebaseConfig`.
5. Mandar para o Claude o `firebaseConfig` e o e-mail da mestre. Regras a colar em **Realtime
   Database › Regras** (o Claude confere o e-mail):

```
{
  "rules": {
    "mesa": {
      ".read": true,
      ".write": "auth != null && auth.token.email == 'EMAIL_DA_MESTRE'",
      "jogadores": { "$j": {
        ".write": "!data.exists() || (newData.exists() && newData.child('dev').val() == data.child('dev').val())",
        ".validate": "$j.matches(/^(miguel|bia|mateus|joao)$/) && newData.child('dev').isString()" } },
      "online": { "$j": { ".write": true, ".validate": "$j.matches(/^(miguel|bia|mateus|joao)$/) && newData.isBoolean()" } }
    },
    "mestre": {
      ".read": "auth != null && auth.token.email == 'EMAIL_DA_MESTRE'",
      ".write": "auth != null && auth.token.email == 'EMAIL_DA_MESTRE'"
    }
  }
}
```

## Como atualizar o portal

O portal se edita em `fonte/portal.html`; depois de qualquer mudança, rodar
`python ferramentas/trancar_portal.py` (pede a senha) para gerar o `index.html` trancado.

1. Salvar as imagens novas em `img/local` ou `img/bestiario`.
2. Rodar `python ferramentas/otimizar_imagens.py`.
3. Se for criatura nova com imagem, colocar `img: '<nome-do-arquivo-sem-.jpg>'` no item dela em
   `BEASTS` dentro do `fonte/portal.html` (e ajustar a contagem "x de 11 criaturas ilustradas"). No card, a
   imagem fica inteira em cima (16:9, sem corte) e o texto embaixo (Erick, 2026-11-22: recortada
   numa coluna, as criaturas largas ficavam cortadas).
4. `git add -A && git commit && git push`. O GitHub Pages atualiza em 1 ou 2 minutos.

## Ordem das fotos

A ordem das páginas é a do nome dos arquivos, de trás para a frente: começa em `20.12.25` e
termina em `20.11.28`. Quando há vários arquivos no mesmo segundo, o de maior número vem
primeiro: `(3)`, `(2)`, `(1)` e, por último, o sem número. A ordem foi conferida pela
continuidade do texto.

**Fotos de 22/11/2026** (páginas 22 a 42): a ordem é a contrária, do mais cedo para o mais tarde
(`20.13.23` até `20.14.06 (2)`); no mesmo segundo, o sem número vem primeiro, depois `(1)`,
`(2)`... As páginas 22 a 36 são as mesmas de antes fotografadas de novo (agora com tentativa e
dano e as fichas do Grifo, do Kallikatzaros e da Hidra); 37 a 40 são as fichas dos jogadores, 41
o Sistema do Purgatório e 42 o Cérberus. O portal mostra as fotos novas no lugar das antigas a
partir da p. 22; a transcrição cita as duas.

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

- 2026-11-22 (Erick): o portal vira ferramenta de jogo: portal trancado com senha, tela dos jogadores
  em `mesa/` e painel da mestre na aba Mesa, ligados pelo Firebase; os jogadores veem imagem e nome
  de cada boss liberado. Repositório continua público (proteção contra curiosos). Ver seção "Mesa".
- 2026-11-22 (Erick): as ilustrações do portal (locais e bestiário) são do **Gemini**. No bestiário,
  o Boitatá e a Vaca usam a mesma descrição dos chefes do jogo, sem pixel art (`03-prompts-imagens.md`);
  entrou o prompt do Cérberus. As 6 que faltavam (Robin Hood, Boitatá, Nessie, Vaca, Fobétor no lugar do
  Freddy, Cérberus) foram geradas no mesmo dia: o bestiário do portal tem as 11 criaturas ilustradas.
- 2026-11-22 (Erick): novas anotações da Milena (zip do WhatsApp com 21 fotos) entram no material
  e no portal: transcrição das p. 22 a 42, sugestões novas (1.11 jogadores e elementos, 2.10
  Purgatório, 2.11 fichas dos jogadores), bestiário do portal com tentativa e dano, fichas do
  Grifo, do Kallikántzaros e da Hidra, o Cérberus, e na aba Signos as seções "Os jogadores" e "O
  Purgatório". Os primeiros nomes dos jogadores (Beatriz, Mateus, Miguel, João Felipe) aparecem
  no portal, como no caderno.
- 2026-11-15 (Erick): fase da Vaca implementada a partir da ideia do rascunho "atacar ou esperar",
  seguindo o caderno: dois jeitos de vencer (cansaço ou 0 PS), os dois terminam na abdução pelo OVNI.
  O prêmio segue o caderno (dog tag dourada) até a Milena decidir o furo "pingente ou dog tag".

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
- [x] **Herói de Fogo, Libra ou Sagitário:** p. 1 circula Libra; p. 4 desenha a constelação de
  Sagitário. Decidido pela Milena em 2026-11-08: **Sagitário**. (Em 2026-11-07: o 4º jogador é o
  humano, sem constelação.) Falta acertar a p. 1 do caderno, que circula Libra.
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
- [x] **Coluna "Tentativa | Dano"** das fichas (p. 22 a 27): preenchida pela Milena (fotos de
  22/11): 1D20 com "S" e "N" e o dado de dano. Falta só dizer o que S e N significam e se
  atributo e perícia entram na rolagem (sugestão 2.3).
- [ ] **Purgatório (p. 41) e Cérberus (p. 42), fotos de 22/11:** sair tirando 1 ou 20 nos dois
  dados é só 1% por vez; "1 da vida original" parece fração sem o número de baixo; Cérberus sem
  ataques (sugestão 2.10).
- [ ] **Fichas dos jogadores (p. 37 a 40):** a do Miguel chegou em 25/11 (falta o avatar); o Mateus (Ar) não tem
  ataque de elemento (talvez seja o humano/Câncer, que na tabela dela é de Ar); somas de status
  diferentes (10 e 12) (sugestões 1.11 e 2.11).
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

- [x] Fichas do Grifo, do Kallikántzaros (Leprechaun) e da Hidra: feitas (fotos de 22/11).
- [ ] Ataques do Cérberus (p. 42).
- [ ] Avatar do Miguel é **temporário** (encapuzado do Gemini, 26/11, `mesa/retratos/miguel-ia.jpg`); trocar se ele mandar desenho.
- [ ] Cena do museu.
- [ ] A luta contra o Freddy (p. 18 tem só o teste inicial).
- [ ] Parte 2: o Torneio das Lendas. Ideias: os outros oito signos como rivais, semideuses como
  azarões, o mistério do Leão, os haters sabotando, a profecia da Excalibur e a volta da Nessie.

### Material final

- [ ] Montar o "livro do mestre" passado a limpo, com estes capítulos: mundo, signos e elementos,
  criação de personagem, regras, aventura cena a cena, bestiário, notas do mestre e extras para
  imprimir (fichas em branco, lista com letras, cartas das constelações).
