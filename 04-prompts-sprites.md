# Jogo: prompts das imagens (sprites)

Como gerar a arte do jogo. **Desde 2026-11-08 o jogo é em pixel art ("estilo Lanterna")** e os
bonecos animados vêm do PixelLab (seção 0). O retrato pintado (seção 1.1) continua valendo para a
tela de escolha, os diálogos e o HUD. As seções 1.2 em diante são o caminho anterior, de imagens
pintadas pose a pose, e ficam como referência (os prompts do Boitatá, dos inimigos e dos fundos
serão refeitos para pixel art).

Depois de geradas, as imagens passam pela ferramenta `ferramentas/preparar_sprites.py`, que tira
o fundo, corta, iguala o tamanho e monta as folhas que o jogo usa. Enquanto uma imagem não
existe, o jogo continua com o desenho de reserva.

## 0. PixelLab: o herói em pixel art (caminho atual)

Roteiro para quem for operar o PixelLab (a pessoa ou um assistente no navegador).

### O que já existe

- Site: https://www.pixellab.ai (conta do Erick).
- Personagem já criado: **o humano**, 56×56 px, 8 direções, vista lateral (side view). Página:
  https://www.pixellab.ai/create-character/2b4a647c-6967-445a-96de-2dbff453b387
- Descrição usada na criação:

```
Teenage boy adventurer, about 16 years old, fantasy RPG hero. Short messy dark brown hair,
brown eyes, fair skin, determined friendly face. Dark navy blue short hooded cape over the
shoulders (hood down), fastened at the chest. Deep blue knee-length tunic over gray long
sleeves. Golden yellow belt with a square buckle and a hanging strap end. Brown leather
bracers on both forearms. Dark blue trousers. Tall brown leather boots with folded cuffs.
Holds a short steel sword with a simple crossguard in his right hand, pointing down.
No green on the character. Clean readable silhouette, rich colors, 16-bit detailed pixel art.
```

O capuz saiu levantado; ficou aceito (combina com o clima escuro).

### Regras para todas as animações

1. Na página do personagem: **Add Animation**.
2. **Direction: East** (olhando para a direita), só essa. O jogo espelha para a esquerda.
3. Bloco **Template motion**, modelo **Skeleton v3** (segue o esqueleto do personagem, a roupa e a
   espada mudam menos). Evitar o bloco *Free motion*, que redesenha livre e muda detalhes.
4. Quando houver campo de descrição, sempre dizer que a espada fica na mão (o PixelLab tende a
   apagar a espada em movimentos amplos).
5. Conferir o resultado antes de passar para a próxima: mesma roupa, espada na mão em todos os
   quadros. Se sair errado, gerar de novo. Mesmo com defeito, vale baixar: a ferramenta do jogo
   consegue descartar quadros ruins.

### Animações (em ordem de prioridade)

| Jogo | Onde no PixelLab | Quadros | Descrição (se houver campo) |
|---|---|---|---|
| `parado` | Movement → Idle → **Breathing Idle** | 4 | `Idle breathing, standing with the short steel sword held low in the right hand.` |
| `correr` | Movement → **Running** | **6** | `Running, holding the short steel sword in the right hand, sword always visible.` |
| `pular` | Movement → **Jump** | o padrão | `Jumping up and landing, holding the short steel sword firmly in his right hand during the whole jump, sword always visible and attached to the hand, never dropped or released.` |
| `espada` | Combat → **Cross Punch** (vira uma estocada; se a espada estiver na outra mão, **Lead Jab**) | o padrão | `Thrusting the short steel sword forward with the right hand, sword always visible and held firmly in the hand, never dropped.` |
| `poder` | Combat → **Fireball** | o padrão | `Casting a spell with the free left hand, the short steel sword stays in the right hand.` |
| `dano` | Combat → Reactions → **Taking Punch** | o padrão | `Getting hit and recoiling backward, the short steel sword stays in the right hand.` |

Com só `parado` e `correr` o jogo já funciona; o resto o motor improvisa a partir da imagem parada.

### Baixar e salvar

- Em cada animação: **Download/Export** em **PNG** (spritesheet ou quadros soltos), com fundo
  transparente. Se der, baixar também o GIF, que ajuda a conferir o ritmo.
- Nomes (pode ficar na pasta Downloads; o Erick ou o Claude movem para o projeto):

```
parado_folha.png
correr_folha.png
pular_folha.png
espada_folha.png
poder_folha.png
dano_folha.png
```

- Destino final no projeto: `img/sprites/herois/humano/`. Se o PixelLab exportar um .zip ou
  nomes diferentes, deixar como veio e avisar; a ferramenta é ajustada ao formato.

## Regras para todas as imagens

1. **Vista de lado, virado para a direita.** O jogo espelha para a esquerda.
2. **Fundo de cor lisa verde-limão (#00FF00)**, sem sombra no chão, sem cenário. Se o personagem
   tiver verde (ex.: o Leprechaun), use fundo magenta (#FF00FF). A ferramenta detecta a cor
   sozinha.
3. **Corpo inteiro, sem cortar os pés**, com uma margem livre em volta.
4. **Sem texto, sem moldura, sem marca d'água.**
5. **Um personagem por imagem.** Se a IA só fizer várias poses juntas, tudo bem: recorte cada
   pose numa imagem separada antes de salvar.
6. **Sempre anexar a imagem de referência** (o retrato oficial) ao pedir as poses, com a frase
   "mesmo personagem, mesma roupa, mesmas cores".

**Bloco de estilo** (já vem dentro de cada prompt das seções 1 a 4; fica aqui só como referência):

```
Style: 2D side-scrolling video game character art, fantasy RPG, semi-realistic hand-painted look
with clean readable silhouette, rich colors, soft rim light, consistent proportions. Full body,
side view facing right, centered, plain solid #00FF00 green background, no shadow, no ground,
no text, no frame.
```

## Se a IA "viajar" (mudar roupa, rosto ou cores)

Manter o mesmo personagem em várias poses é a parte mais difícil para qualquer IA de imagem. Por
isso o jogo foi preparado para precisar de pouco.

**Caminho mínimo: uma imagem só.** Com apenas o `parado_1` (pode ser o próprio retrato), o jogo
já anima o herói sozinho: inclina para a frente ao correr, quica, estica no pulo, gira no golpe
de espada e recua ao levar dano. A espada e o poder têm efeitos próprios. Cada pose de verdade
que chegar depois substitui a animação feita pelo jogo. Ordem sugerida: `parado`, `correr` (2 ou
4 quadros), `pular`, `espada` e o resto.

**Técnicas que ajudam mais que trocar de IA:**

1. **Todas as poses numa imagem só.** Dentro da mesma imagem a IA mantém o personagem igual com
   muito mais facilidade. Salve como `correr_folha.png` (os quadros da corrida lado a lado) ou
   `poses_folha.png` (as 11 poses na ordem da tabela 1.2). A ferramenta recorta cada pose sozinha
   e mantém o tamanho de uma em relação à outra.
2. **Editar em vez de gerar de novo.** Parta sempre da imagem aprovada e peça uma mudança por vez:
   "mantenha tudo igual, mude só as pernas para a posição de corrida".
3. **Conversa nova quando a IA começar a errar.** Ela "lembra" dos erros anteriores; anexe de
   novo o retrato e recomece.

Prompt da folha de corrida (com o retrato anexado):

```
Same character as the reference image, same outfit, colors and proportions. Sprite sheet of a
4-frame running cycle in a single row, side view facing right, evenly spaced with empty space
between frames, all frames the same size, full body, plain solid #00FF00 green background,
no text, no numbers, no shadows.
```

**Qual IA usar:**

- **ChatGPT (imagens):** a primeira indicação. É o que melhor segue a imagem anexada e edita só o
  que foi pedido. Também faz fundo transparente (aí nem precisa do verde).
- **Gemini:** edita bem, mas tende a trocar detalhes. Se continuar nele, use sempre a técnica 2
  (editar a última imagem boa) e a 3 (conversa nova quando desandar).
- **Ferramentas feitas para jogos:** Scenario e Leonardo (com referência de personagem) mantêm o
  personagem mais estável, mas cobram e dão mais trabalho no começo. O PixelLab gera a animação
  de caminhada pronta, mas em pixel art, o que mudaria o estilo do jogo.

## Onde salvar

Salve no PC, dentro da pasta do projeto, com estes nomes (minúsculos, sem acento):

```
img/sprites/herois/humano/retrato.png      (referência das poses e imagem da tela de escolha de herói)
img/sprites/herois/humano/parado_1.png
img/sprites/herois/humano/correr_1.png ... correr_4.png
img/sprites/herois/humano/pular_1.png
img/sprites/herois/humano/cair_1.png
img/sprites/herois/humano/espada_1.png, espada_2.png
img/sprites/herois/humano/poder_1.png
img/sprites/herois/humano/dano_1.png
img/sprites/herois/humano/correr_folha.png ou poses_folha.png   (opcional: várias poses numa imagem)
img/sprites/chefes/boitata/cabeca.png, gomo.png, rabo.png
img/sprites/inimigos/brasa/andar_folha.png      (ou andar_1.png e andar_2.png)
img/sprites/inimigos/vagalume/voar_folha.png    (ou voar_1.png e voar_2.png)
img/sprites/fundos/boitata/ceu.png, longe.png, perto.png, chao.png
```

Depois é só me avisar (ou rodar `python ferramentas/preparar_sprites.py` e publicar). Não precisa
gerar tudo de uma vez: cada item que chega já aparece no jogo.

## Kit de arte de uma fase (padrão desde o Boitatá, registrado em 2026-11-20)

Toda fase nova recebe o mesmo kit da floresta do Boitatá, para ter o mesmo nível de arte. O Claude
escreve os prompts (uma seção por fase neste arquivo); o Erick gera e salva; o Claude roda a
ferramenta, confere no jogo, ajusta e publica.

| Peça | IA | Formato | Salvar em `img/sprites/...` |
|---|---|---|---|
| Céu | Gemini | 16:9 | `fundos/<fase>/ceu` |
| Morros distantes | Gemini | 21:9, fundo de chroma | `fundos/<fase>/longe` |
| Cenário de perto | Gemini | 21:9, fundo de chroma | `fundos/<fase>/perto` |
| Chão (textura) | Gemini | 1:1 | `fundos/<fase>/chao` |
| Árvore: tronco, raiz, galho (e copa, se tiver) | Gemini | 1:3, 2:1, 4:1 (3:2) | `fundos/<fase>/arvore_*` |
| Chefe | PixelLab (Sidescroller, East) | animações em folha | `chefes/<chefe>/` |
| Inimigos | PixelLab (Sidescroller, East, 32 px) | animações em folha | `inimigos/<nome>/` |
| Prêmio do chefe | PixelLab ou Gemini | 64×64 | `objetos/pingente/<fase>.png` |

**Regras que fizeram a floresta dar certo:**

1. **Peças paradas no Gemini, em estilo pintado.** A ferramenta transforma em pixel art (cada pixel
   da arte vira 2×2 na tela, até 32 cores). Não precisa pedir pixel art ao Gemini.
2. **Personagens e animações no PixelLab**, sempre Sidescroller, direção East.
3. **Cada camada é uma imagem separada**, emendando nas laterais (o jogo repete na horizontal). Se a
   emenda não ficar perfeita, mande assim mesmo: o Claude ajusta.
4. **Cor do fundo de recorte (chroma):** verde-limão `#00FF00`, **exceto quando a arte tem verde**
   (pasto, folhas, capim): aí magenta `#FF00FF`. Com fundo verde, a ferramenta apaga todo o verde
   que sobra na imagem (bom para a floresta queimada, péssimo para o pasto).
5. **Começar pelo céu e usar a pintura do local** (`web/locais/NN-....jpg`) como referência de cores.
   Depois, anexar o céu aprovado em cada camada seguinte ("same palette and light as the attached
   image"), e anexar o tronco aprovado na raiz, no galho e na copa ("same bark, same colors").
6. **Uma conversa nova no Gemini quando ele começar a errar**, anexando de novo as referências.
7. **Originais em JPG servem** (é o que o Gemini baixa). O nome do arquivo é o da tabela, em
   minúsculas, sem acento.
8. Mandar ao Claude assim que cada peça for salva: ela já entra no lugar do desenho do jogo.

---

## 1. O herói: "o humano"

O humano é o 4º jogador: o "normal", sem constelação e sem atributo forte, com a jogabilidade
mais difícil (na história, é o Câncer escondido). Ele é o primeiro a ganhar imagens porque já
está no jogo. Mais adiante os 3 heróis com constelação terão o seu conjunto, com as mesmas poses.

Cada bloco abaixo é um prompt **completo**: copie o bloco inteiro e cole numa mensagem só. Nos
prompts de pose, **anexe o retrato oficial** na mesma mensagem.

### 1.1 Retrato oficial (fazer primeiro)

Gere de 3 a 5 versões e escolham a preferida. Ela vira a referência de todas as poses. Salvar
como `retrato.png` (e, se quiserem, uma cópia como `parado_1.png`: só com ela o herói já anda).

```
Create an image. An original young adventurer, about 16 years old, ordinary human with no magic
marks. Short messy dark brown hair, determined friendly face. Wears a simple deep blue tunic with
a golden belt, a darker navy short cape, brown leather boots and bracers, and carries a short
steel sword. No green anywhere on the character. Standing in a relaxed neutral pose.

Style: 2D side-scrolling video game character art, fantasy RPG, semi-realistic hand-painted look
with clean readable silhouette, rich colors, soft rim light, consistent proportions. Full body,
side view facing right, centered, plain solid #00FF00 green background, no shadow, no ground,
no text, no frame.
```

### 1.2 Corrida numa folha só (recomendado)

Salvar como `correr_folha.png`. A ferramenta recorta os 4 quadros.

```
Create an image. Same character as the attached reference image, same outfit, colors and
proportions, same art style. Sprite sheet of a 4-frame running cycle in a single row:
frame 1 right leg forward, frame 2 legs passing under the body, frame 3 left leg forward,
frame 4 legs passing under the body with the other arm forward. Evenly spaced with empty space
between frames, all frames the same size, cape flowing behind.
Full body, side view facing right, centered, plain solid #00FF00 green background, no shadow,
no ground, no text, no frame. No numbers.
```

### 1.3 Poses, uma por imagem

**`parado_1.png`**

```
Create an image. Same character as the attached reference image, same outfit, colors and
proportions, same art style.
Idle stance, standing, sword held low in the right hand, slight breathing posture.
Full body, side view facing right, centered, plain solid #00FF00 green background, no shadow,
no ground, no text, no frame.
```

**`pular_1.png`**

```
Create an image. Same character as the attached reference image, same outfit, colors and
proportions, same art style.
Jumping upward, knees bent, one arm raised, cape trailing down.
Full body, side view facing right, centered, plain solid #00FF00 green background, no shadow,
no ground, no text, no frame.
```

**`cair_1.png`**

```
Create an image. Same character as the attached reference image, same outfit, colors and
proportions, same art style.
Falling down, legs slightly apart preparing to land, arms out for balance, cape lifted up.
Full body, side view facing right, centered, plain solid #00FF00 green background, no shadow,
no ground, no text, no frame.
```

**`espada_1.png`**

```
Create an image. Same character as the attached reference image, same outfit, colors and
proportions, same art style.
Sword attack wind-up, sword raised behind the head, body twisted back.
Full body, side view facing right, centered, plain solid #00FF00 green background, no shadow,
no ground, no text, no frame.
```

**`espada_2.png`**

```
Create an image. Same character as the attached reference image, same outfit, colors and
proportions, same art style.
Sword slash finished, arm fully extended forward, sword horizontal in front, lunging.
Full body, side view facing right, centered, plain solid #00FF00 green background, no shadow,
no ground, no text, no frame.
```

**`poder_1.png`**

```
Create an image. Same character as the attached reference image, same outfit, colors and
proportions, same art style.
Casting a spell, free hand stretched forward with open palm, glowing light in the palm.
Full body, side view facing right, centered, plain solid #00FF00 green background, no shadow,
no ground, no text, no frame.
```

**`dano_1.png`** (opcional: o jogo já faz o recuo sozinho; é a pose que menos aparece)

```
Create an image. Same character as the attached reference image, same outfit, colors and
proportions, same art style.
Getting hit, recoiling backward, eyes shut, arms up defensively.
Full body, side view facing right, centered, plain solid #00FF00 green background, no shadow,
no ground, no text, no frame.
```

Se não usar a folha de corrida, dá para gerar os quadros soltos (`correr_1` a `correr_4`) com o
mesmo modelo, trocando a pose pela descrição de cada quadro da seção 1.2.

**Dicas:** se uma pose sair com outra roupa ou outra cor, descarte e gere de novo. Se ficar quase
certa, peça "mesma imagem, mas com a capa azul-marinho" em vez de começar do zero.

---

## 2. Boitatá em 3 partes (Gemini)

O jogo monta a cobra: uma cabeça, vários gomos iguais (que diminuem até o rabo) e a ponta do rabo,
seguindo a cabeça como um trem. As chamas que dançam por cima e a luz são do próprio jogo, então
as peças podem ter só brasas e rachaduras brilhando. Peças paradas: Gemini, e a ferramenta
pixeliza. Gerar a cabeça primeiro e anexar nos pedidos do gomo e do rabo, para as cores baterem.
Salvar em `img/sprites/chefes/boitata/`.

**`cabeca.png`** (1:1)

```
Create an image. The HEAD of the Boitatá, a giant serpent made of living fire from Brazilian
folklore, for a dark fantasy 2D side-scrolling game boss. Side view, facing right. Charred
black-red scaly skin cracked with glowing orange and yellow lava lines, two huge bright burning
eyes like hot coals, mouth slightly open showing sharp ember fangs and a glowing throat, small
flames along the top of the head. Only the head, cut cleanly at the neck on the left side. Plain
solid #00FF00 green background, no shadow, no text, no frame. Painterly 2D game art style. Square
image, aspect ratio 1:1.
```

**`gomo.png`** (1:1, com a cabeça anexada)

```
Create an image. One single round body segment of the same fire serpent as the attached head, like
a thick slice of its body seen from the side: almost circular, charred black-red scales with
glowing orange lava cracks, same colors as the attached head, small embers on top. No head, no
tail, no other segments. Centered, plain solid #00FF00 green background, no shadow, no text.
Painterly 2D game art style. Square image, aspect ratio 1:1.
```

**`rabo.png`** (1:1, com a cabeça anexada)

```
Create an image. The tail tip of the same fire serpent as the attached head: a short piece of body
that tapers to a burning point, pointing LEFT, charred black-red scales with glowing lava cracks,
the very tip turning into a small flame. Same colors as the attached head. Side view, centered,
plain solid #00FF00 green background, no shadow, no text. Painterly 2D game art style. Square
image, aspect ratio 1:1.
```

**Opcional, `cabeca_ataque.png`** (com a cabeça anexada): a mesma cabeça com a boca bem aberta,
para a mordida e a bola de fogo.

```
Create an image. The exact same serpent head as the attached image, same size, same angle and same
colors, but with the mouth WIDE open in an attack roar, fangs fully visible and a bright fireball
glowing deep in the throat. Side view, facing right, plain solid #00FF00 green background, no
shadow, no text. Painterly 2D game art style. Square image, aspect ratio 1:1.
```

### 2.1 Boitatá no PixelLab (pixel art nativo, mais nítido)

A versão do Gemini, reduzida para pixel art, ficou borrada. No PixelLab as peças já nascem em
pixel art. Usar a geração de **imagem** (não "Create Character"): são peças paradas, o jogo é que
mexe a cobra. Fundo **transparente**, vista lateral. Salvar os PNG em `img/sprites/chefes/boitata/`
com os nomes abaixo (a ferramenta usa como vieram, sem reduzir).

**`cabeca.png`** (64×64)

```
Head of a giant fire serpent boss (Boitata from Brazilian folklore), side view facing right,
charred black and dark red scales with glowing orange lava cracks, big burning yellow eye, mouth
slightly open with sharp fangs, small flames on top of the head, cut at the neck on the left.
Dark fantasy, 16-bit detailed pixel art, black outline, transparent background.
```

**`cabeca_ataque.png`** (64×64, usar a cabeça como referência/inpainting se der)

```
Same fire serpent head, side view facing right, mouth wide open roaring, fangs visible, bright
fireball glowing in the throat. 16-bit detailed pixel art, black outline, transparent background.
```

**`gomo.png`** (32×32)

```
One round body segment of the same fire serpent seen from the side, solid and filled (not a ring),
charred black and dark red scales with glowing orange lava cracks, small embers on top.
16-bit detailed pixel art, black outline, transparent background.
```

**`rabo.png`** (32×32)

```
Tail tip of the same fire serpent, side view, tapering to a burning point that points LEFT,
charred black and dark red scales with glowing lava cracks, the tip turning into a small flame.
16-bit detailed pixel art, black outline, transparent background.
```

### 2.3 Boitatá versão 4: cobra de verdade (costas de lava, barriga clara) — 2026-11-14

Desde 2026-11-13 o Boitatá é uma cobra imensa que entra e sai da terra; o movimento é do código.
O Erick achou na internet uma cobra em pixel art mais próxima do que imagina (pescoço em S saindo
de voltas no chão, barriga clara em placas, cabeça de cobra com a boca aberta). Como a imagem é
da internet, **não subir a imagem no PixelLab**: usar só os textos abaixo, que descrevem o
estilo. Mudança em relação à versão 3: a barriga fica clara (creme/areia, em placas), e só as
costas têm as escamas carvão com rachaduras de lava. Fogo e faíscas na cabeça **não** vão no
desenho (o jogo anima por cima).

Geração de **imagem** no PixelLab, fundo transparente, vista lateral. Fazer primeiro a cobra
inteira (A): ela é a referência de estilo para as outras (B, C, D), que podem usá-la como
"style/reference image" dentro do PixelLab. Salvar em `img/sprites/chefes/boitata/` com os nomes
abaixo (as versões anteriores vão para `originais/` com prefixo `v3_`; o Claude adapta a
ferramenta para a faixa nova).

**A. `cobra_inteira.png`** (o maior tamanho disponível, ideal 128×128 ou mais)

```
Giant fire serpent boss (Boitata from Brazilian folklore), full body, side view facing left.
The body rests on the ground in a thick coil, the neck rises in a tall S curve and the head is
raised high, mouth wide open hissing with sharp fangs and a forked tongue, the thin tail curls
out on the ground at the left. Back and sides: charred black and very dark red scales with
glowing orange and yellow lava cracks between the scales. Belly: smooth pale cream and sand
colored ventral plates in wide horizontal bands, clearly separated from the back, running along
the whole underside of the neck and body. Burning yellow eye. No flames, no smoke, no sparks
around it. Dark fantasy boss, 16-bit detailed pixel art, clean black outline, transparent
background.
```

**B. `faixa_corpo.png`** (largo: 128×48 se der; senão 128×128 com a faixa atravessando o meio)

```
A straight horizontal section of the same fire serpent body, seen from the side, crossing the
whole image from the left edge to the right edge with no ends (seamless, tileable left to
right). Top half: charred black and very dark red scales with glowing orange lava cracks. Bottom
quarter: pale cream and sand colored belly plates in vertical bands. Same thickness along the
whole length. 16-bit detailed pixel art, black outline only on the top and bottom edges,
transparent background.
```

**C. `cabeca.png`** (64×64)

```
Head of the same fire serpent, side view facing right, mouth closed, flat snake skull with a
strong jaw line, burning yellow eye, charred black and dark red scales with glowing orange lava
cracks on top, pale cream belly plates under the jaw and throat. Cut at the neck on the left
edge. No flames, no sparks. 16-bit detailed pixel art, black outline, transparent background.
```

**D. `cabeca_ataque.png`** (64×64; usar a C como referência)

```
Same fire serpent head, side view facing right, mouth wide open hissing, long curved fangs,
forked tongue out, glowing orange fire deep in the throat, pale cream belly plates under the
jaw. Cut at the neck on the left edge. No flames outside the mouth, no sparks. 16-bit detailed
pixel art, black outline, transparent background.
```

**Resultado (2026-11-14):** gerado e em uso no jogo. Escolhidas a cabeça fechada e a aberta da
1ª linha e 1ª coluna e a faixa de baixo à esquerda (contorno dos dois lados). O PixelLab fez as
cabeças como busto virado para a esquerda; o Claude espelhou e a ferramenta mede o pescoço.

Conferir antes de seguir: a barriga clara e as costas de lava bem separadas, a mesma cor de
escama nas quatro imagens, e a faixa B sem pontas (deve emendar consigo mesma).

Depois, se o visual for aprovado: animações curtas da cabeça no PixelLab (tipo **Custom**,
câmera **Sidescroller**, direção **East**, criado a partir da C): `sibilar` (língua entrando e
saindo, 4 quadros) e `morder` (boca abrindo e fechando, 4 a 6 quadros).

### 2.4 Rolo do corpo em 2 camadas (pescoço saindo do meio do rolo) — 2026-11-14

Decisão do Erick: o rolo vira desenho fixo (some com as frestas pretas do rolo montado por gomos) e
o pescoço sai **do meio** do rolo, como num desenho de cobra enrolada: a volta de cima passa na
frente do começo do pescoço. O jogo desenha: camada de trás (o rolo inteiro) → pescoço (corrente que
se mexe, com a base escondida dentro do rolo) → camada da frente (só o pedaço da volta de cima que
passa na frente do pescoço). O rabo também é do jogo (nasce atrás da volta de baixo).

PixelLab, geração de **imagem**, o maior tamanho disponível (256×256 se der), fundo transparente.
Usar a `originais/v4_cobra_inteira.png` como referência de estilo (é arte nossa).

```
Giant fire serpent body coiled in a tall round pile, seen from the side: three thick coils stacked
on the ground, the lowest coil the widest and thickest, each coil above a little smaller. The neck
rises from the CENTER of the pile: it comes up from inside, behind the top coil (the top coil passes
in front of the base of the neck), and is cut off flat a short distance above the pile (no head, no
upper neck). No tail visible: the body ends hidden inside the pile. Back and sides: charred black and
very dark red scales with glowing orange lava cracks. Pale cream belly plates only on the lower edge
of each coil and on the front of the neck stub. No flames, no smoke, no sparks. Dark fantasy boss,
16-bit detailed pixel art, clean black outline, transparent background.
```

Depois, no Pixelorama (ou o Claude faz): duplicar a camada; na cópia apagar tudo menos o pedaço
da volta de cima que fica **na frente** do toco do pescoço. Exportar as duas do mesmo tamanho:
`img/sprites/chefes/boitata/rolo_tras.png` (o rolo inteiro, pode ficar com o toco do pescoço; o jogo
cobre) e `rolo_frente.png` (só o pedaço da frente, o resto transparente).

### 2.2 Boitatá enrolado: o corpo (PixelLab, opcional)

Desde 2026-11-08 o Boitatá fica enrolado no lado direito da arena (1/3 da tela) e só a cabeça
ataca. Sem esta imagem, o jogo monta o rolo com os gomos em espiral. Com ela, o rolo fica bem mais
bonito. Geração de imagem no PixelLab, **o maior tamanho disponível** (ideal 128×128 ou mais),
fundo transparente. Salvar como `img/sprites/chefes/boitata/corpo.png`.

```
Giant fire serpent body coiled on itself in a big round pile, seen from the side, three thick
coils stacked on the ground, the neck rising from the top center and cut short (no head),
charred black and dark red scales with glowing orange lava cracks, small flames and embers on top
of the coils. Dark fantasy boss, 16-bit detailed pixel art, black outline, transparent background.
```

---

## 3. Inimigos pequenos

Os dois quadros de cada um vêm numa imagem só:

**`inimigos/brasa/andar_folha.png`**

```
Create an image. Small original fire creature for a 2D platform game, cute but mischievous,
painterly fantasy RPG style, isolated, side view facing right, plain solid #00FF00 green
background, no shadow, no text, no frame.
A living flame blob with two dark eyes and tiny feet. Sprite sheet of 2 walking frames in a
single row with empty space between them: left foot forward, then right foot forward with the
flame leaning the other way. Same size in both frames, no numbers.
```

**`inimigos/vagalume/voar_folha.png`**

```
Create an image. Small original fire creature for a 2D platform game, cute but mischievous,
painterly fantasy RPG style, isolated, side view facing right, plain solid #00FF00 green
background, no shadow, no text, no frame.
A glowing fire firefly with a bright ember body and translucent wings. Sprite sheet of 2 flying
frames in a single row with empty space between them: wings raised up, then wings lowered
down. Same size in both frames, no numbers.
```

---

## 4. Fundo da floresta incendiada (3 camadas e o chão)

Os fundos podem ser gerados em qualquer IA de imagem (ChatGPT, Gemini), até em estilo pintado: a
ferramenta transforma em pixel art (grade de 2×2, 32 cores). Feito para a floresta em 2026-11-08.

As camadas ficam uma na frente da outra e andam em velocidades diferentes, o que dá
profundidade. Precisam **emendar nas laterais** (a borda direita continua na esquerda), porque o
jogo repete a imagem. Se a emenda não ficar perfeita, me mandem assim mesmo que eu ajusto.

**`fundos/boitata/ceu.png`** (16:9)

```
Create an image. 2D side-scrolling game background layer, burned dead forest at dusk, smoky
orange and purple atmosphere, painterly style matching a fantasy RPG, seamless horizontally
tileable (the left and right edges must match), no characters, no text.
Wide 16:9 image. Only the SKY: smoky dusk gradient from deep purple at the top to burning
orange near the horizon, a large pale ember-colored moon, drifting ash. No trees, no ground.
```

**`fundos/boitata/longe.png`** (21:9)

```
Create an image. 2D side-scrolling game background layer, burned dead forest at dusk, smoky
orange and purple atmosphere, painterly style matching a fantasy RPG, seamless horizontally
tileable (the left and right edges must match), no characters, no text.
Very wide 21:9 image. Only DISTANT burned tree silhouettes and low hills, dark purple-brown,
flat bottom edge, on a plain solid #00FF00 green background (the sky area must be pure green).
```

**`fundos/boitata/perto.png`** (21:9)

```
Create an image. 2D side-scrolling game background layer, burned dead forest at dusk, smoky
orange and purple atmosphere, painterly style matching a fantasy RPG, seamless horizontally
tileable (the left and right edges must match), no characters, no text.
Very wide 21:9 image. Only a few CLOSER burned tree trunks with broken branches and faint
glowing embers, sparse with big gaps, flat bottom edge, on a plain solid #00FF00 green background.
```

**`fundos/boitata/chao.png`** (1:1)

```
Create an image. 2D side-scrolling game background layer, burned dead forest at dusk, smoky
orange and purple atmosphere, painterly style matching a fantasy RPG, seamless horizontally
tileable (the left and right edges must match), no characters, no text.
Square 1:1 seamless tileable texture of burnt dark soil and ash with tiny glowing embers, seen
from the side, the top edge slightly lighter like an ash crust.
```

---

## 4.1 Árvores das plataformas (3 peças)

Desde 2026-11-08 não há plataformas soltas: toda plataforma é um galho de uma árvore grande. Como
cada tela tem galhos em alturas e larguras diferentes, a árvore vem em 3 peças que o jogo monta
sozinho: o **tronco** (repetido na vertical até a altura que precisar), a **raiz** (a base) e o
**galho** (esticado até a largura da plataforma e espelhado quando vai para a esquerda). Pode
gerar no Gemini ou no ChatGPT, em estilo pintado: a ferramenta transforma em pixel art.

Salvar em `img/sprites/fundos/boitata/` com estes nomes:

**`arvore_tronco.png`** (vertical, 1:3)

```
Create an image. A straight vertical section of a huge old burned tree trunk from a dark fantasy
forest, charred black-brown bark with deep vertical grooves, a few knots and thin glowing orange
ember cracks. Only the middle of the trunk: no roots, no branches, no top. The top and bottom
edges must match so the image can be repeated vertically (seamless vertical tile). Side view,
straight and centered, plain solid #00FF00 green background on both sides, no shadow, no text.
Painterly 2D game art style. Tall portrait image, aspect ratio 1:3.
```

**`arvore_raiz.png`** (horizontal, 2:1)

```
Create an image. The base of the same huge burned tree trunk with thick roots spreading to both
sides and gripping the ground, charred black-brown bark, faint glowing ember cracks. The trunk is
cut straight at the top (it continues upward in the game) and has the same width as the trunk
section. Side view, centered, plain solid #00FF00 green background, no ground, no shadow, no text.
Painterly 2D game art style. Wide image, aspect ratio 2:1.
```

**`arvore_galho.png`** (bem largo, 4:1)

```
Create an image. One thick horizontal branch of the same burned tree, growing from the left edge
of the image to the right, where it ends in a broken tip. The TOP of the branch must be flat and
straight like a walkable ledge, with nothing sticking up above it. A few small dry twigs and
hanging roots only BELOW the branch. Charred black-brown bark, faint ember cracks. Side view,
plain solid #00FF00 green background, no leaves, no shadow, no text. Painterly 2D game art style.
Very wide image, aspect ratio 4:1.
```

Dicas: anexe o tronco aprovado nos pedidos da raiz e do galho ("same bark, same colors as the
attached trunk"). Se o galho vier com algo saindo para cima, me mande assim mesmo: eu corto.

## 4.2 Ponto de controle: o Altar da Constelação

Ideia original com o clima de "lugar seguro" dos jogos de ação sombrios (luz dourada calma,
faíscas subindo), sem copiar nenhum: uma espada antiga cravada numa pedra com uma constelação
gravada. Duas imagens; o jogo faz a tremulação, as faíscas e a luz. Salvar em
`img/sprites/objetos/altar/`.

**`apagada.png`** (1:1)

```
Create an image. An original ancient checkpoint shrine for a dark fantasy 2D side-scrolling game:
an old straight sword with a worn crossguard plunged vertically into a small round mound of grey
ash and cracked stone. The stone base has faint carved star symbols connected by thin lines, like
a constellation, dark and cold. A few dead embers in the ash, no flame, no glow. Side view,
centered, full object visible, plain solid #00FF00 green background, no shadow, no ground, no
text. Painterly 2D game art style, dark burned forest mood. Square image, aspect ratio 1:1.
```

**`acesa.png`** (1:1, com a apagada anexada)

```
Create an image. The exact same sword shrine as the attached image, same shape, same position and
same size, but now awakened: a soft calm golden flame wraps around the base of the sword, warm
golden light rises along the blade, the carved constellation stars on the stone glow bright gold,
and small golden sparks float upward. Peaceful and sacred feeling, not aggressive fire. Side
view, centered, plain solid #00FF00 green background, no shadow, no ground, no text. Painterly 2D
game art style. Square image, aspect ratio 1:1.
```

## 4.3 Mapa do mundo espiritual (tela de seleção de local)

Uma imagem só, 16:9, sem nenhum texto (os nomes, marcadores e cadeados são do jogo). Os locais
seguem a ordem da história, num caminho que sai do canto de baixo à esquerda e termina no Olimpo,
no alto à direita. A IA não vai acertar as posições exatas; depois eu ajusto os marcadores em
`jogo/dados/mapa.js` para caírem em cima de cada lugar. Salvar como `img/sprites/mapa/mundo.png`.

```
Create an image. An original illustrated fantasy world map of a mysterious spirit world, seen from
above at a slight angle, dark and atmospheric like a night journey, painterly 2D game art. A
winding dirt path crosses the whole map from the bottom-left corner to the top-right corner and
connects these places, in this order:
1. bottom-left: a misty enchanted forest with a glowing swirling portal between giant trees;
2. a little above it, left side: a burned dead forest at the foot of a mountain, with embers;
3. bottom, center-left: a dark lake with a small spiky island in the middle;
4. center: a green pasture with a strange flying saucer hovering above it;
5. upper center-left: the entrance of a dark cave in the rocks;
6. top center: a forest clearing with a huge nest on a rock;
7. center-right: a bright meadow with a rainbow, small ponds and a cauldron of gold coins;
8. bottom-right: a lonely hill with an old sword stuck in a stone;
9. right side: ruins of an ancient Greek temple half covered by vines;
10. top-right corner: a tall mountain above the clouds with golden gates on top (Mount Olympus).
Moonlight, soft fog between the regions, small glowing lights along the path. No text, no labels,
no letters, no numbers, no compass, no frame, no characters. Wide image, aspect ratio 16:9.
```

## 4.4 Baú (Gemini) e inimigos da floresta (PixelLab)

O baú é um objeto parado com dois estados, como o altar: Gemini ou ChatGPT, e a ferramenta tira o
fundo, alinha e pixeliza. Os inimigos se mexem o tempo todo: PixelLab, tipo **Custom**, câmera
**Sidescroller**, 48 px, animações só na direção **East**.

**`objetos/bau/bau_fechado.png`** (1:1)

```
Create an image. A small old wooden treasure chest for a dark fantasy 2D side-scrolling game,
closed, dark weathered wood with tarnished gold metal bands and a round gold lock, a few scratches
and a little moss, slightly mysterious. Side view (seen from the front-side), centered, full object
visible, plain solid #00FF00 green background, no shadow, no ground, no text. Painterly 2D game art
style. Square image, aspect ratio 1:1.
```

**`objetos/bau/bau_aberto.png`** (1:1, com o fechado anexado)

```
Create an image. The exact same treasure chest as the attached image, same size, same position and
same colors, but now open: the lid is lifted back, a warm golden glow comes from inside, gold coins
and a small glowing potion are visible, a few golden sparkles float up. Side view, centered, plain
solid #00FF00 green background, no shadow, no ground, no text. Painterly 2D game art style. Square
image, aspect ratio 1:1.
```

**Brasa** (PixelLab, `inimigos/brasa/`): animações andando (4 a 6 quadros) e parada.

```
Small living flame creature, a round blob of fire with two big dark eyes and tiny stubby black
feet, cute but mischievous. Bright yellow core, orange body, red flickering edges, small sparks.
Clean readable silhouette, black outline, 16-bit detailed pixel art. Side view facing right.
```

**Vaga-lume de fogo** (PixelLab, `inimigos/vagalume/`): animação voando (4 a 6 quadros).

```
Fire firefly creature, small dark insect body with a big round glowing ember abdomen, translucent
amber wings, tiny glowing eyes, leaving little sparks. Clean readable silhouette, black outline,
16-bit detailed pixel art. Side view facing right.
```

Se o tipo Custom não animar bem a brasa, ela pode continuar desenhada pelo jogo (fogo animado no
código fica bom).

## 4.5 Placa do chefe (Gemini)

Placa de aviso antes da arena do chefe, sem palavras: o símbolo queimado na madeira avisa. Para a
floresta, uma cobra de fogo (o Boitatá). Salvar em `img/sprites/objetos/placa/placa.png`.

```
Create an image. An old wooden warning signpost for a dark fantasy 2D side-scrolling game: a single
weathered wooden post stuck in the ground with one rough wooden board nailed to it. The board is
scorched and cracked, with a coiled serpent made of flames burned into the wood as a warning
symbol, deep claw marks across it, and a few glowing orange embers in the burned edges. Small
burned twigs and a little ash at the base of the post. No words, no letters, no numbers. Side view
(front of the board facing the viewer), centered, full object visible, plain solid #00FF00 green
background, no shadow, no text. Painterly 2D game art style, burned forest mood. Portrait image,
aspect ratio 3:4.
```

## 4.6 Barras e medalhão do HUD (Gemini)

O Gemini desenha só a moldura; o jogo enche a barra por dentro (com o rastro do dano). A parte de
dentro vem pintada de magenta lisa (#FF00FF), sobre fundo verde: a ferramenta usa o magenta para
saber onde vai o enchimento, deixa transparente e corta a moldura em 3 pedaços (pontas e meio, que
estica), para servir em barras de qualquer largura. Salvar em `img/sprites/hud/`. Gerar a do chefe
primeiro e anexar nas outras.

**`barra_chefe.png`** (8:1)

```
Create an image. An ornate horizontal boss health bar frame for a dark fantasy game UI: dark
blackened iron with fine gold filigree, small flame-shaped ornaments and a sharp pointed tip at
each end, a small gem socket in the middle of the top edge. The long empty channel inside the frame
(where the health fills) must be painted plain solid flat magenta #FF00FF, perfectly rectangular,
with no gradient and no details inside. Straight and perfectly horizontal, front view, centered,
plain solid #00FF00 green background outside the frame, no text, no numbers, no shadow. Painterly
2D game UI art. Very wide image, aspect ratio 8:1.
```

**`barra_heroi.png`** (8:1, com a do chefe anexada)

```
Create an image. A smaller horizontal health bar frame in the same style as the attached boss bar:
dark blackened iron with fine gold filigree, small diamond-shaped ornaments at each end, simpler
and thinner. The empty channel inside the frame must be painted plain solid flat magenta #FF00FF,
perfectly rectangular, no gradient, no details inside. Perfectly horizontal, front view, centered,
plain solid #00FF00 green background outside the frame, no text, no numbers, no shadow. Painterly
2D game UI art. Very wide image, aspect ratio 8:1.
```

**`medalhao.png`** (1:1, com a do chefe anexada)

```
Create an image. A round ornate medallion frame in the same style as the attached bar: dark
blackened iron ring with fine gold filigree and four small gold points like a compass. The empty
circle in the center must be painted plain solid flat magenta #FF00FF, no details inside. Front
view, centered, plain solid #00FF00 green background outside, no text, no numbers, no shadow.
Painterly 2D game UI art. Square image, aspect ratio 1:1.
```

## 4.7 Pergaminho da placa do chefe (Gemini)

Perto da placa antes de cada chefe abre um pergaminho com quem é o chefe (o texto é do jogo, em
`placa` na ficha da fase). A IA faz só o pergaminho, vazio. Salvar em
`img/sprites/hud/pergaminho.png` (o HUD não é pixelizado).

```
Create an image. An old horizontal parchment scroll for a dark fantasy game UI, front view,
perfectly straight and centered: aged cream and light tan paper with burnt brown edges, small
tears and stains, rolled wooden-and-paper rolls at the top and bottom edges, a thin faded red
ornamental border drawn inside the paper. The center of the paper is EMPTY and clean, plenty of
space for text. No text, no letters, no symbols in the middle. Plain solid #00FF00 green
background, no shadow. Painterly 2D game UI art. Wide image, aspect ratio 16:9.
```

## 4.8 O humano com a lança (PixelLab) — 2026-11-14

A lança (prêmio do Mímico) hoje é desenhada pelo jogo por cima do herói, que continua com a
espada na mão. Para ficar certo: um personagem novo no PixelLab, igual ao humano, mas com a lança.

1. **Create Character**, mesmas opções do humano (56×56, vista lateral, 8 direções), com a
   descrição abaixo. Se o PixelLab permitir partir do personagem atual (editar/duplicar), melhor:
   mantém o rosto e a roupa iguais.
2. Mesmas regras de animação da seção 0 (direção **East**, **Template motion → Skeleton v3**), mas
   em toda descrição trocar a espada pela lança: `holding the bronze spear with both hands, spear
   always visible`.
3. Animações (nomes de arquivo iguais aos do humano, com `_lanca`): `parado`, `correr`, `pular`,
   `estocada` (Combat → **Cross Punch** ou **Lead Jab**, descrição: `Thrusting the bronze spear
   straight forward with both hands, long reach, spear always visible`), `poder`, `dano`.
4. Salvar em `img/sprites/herois/humano_lanca/`. O Claude liga a troca: com a lança equipada, o
   jogo usa este personagem.

```
Teenage boy adventurer, about 16 years old, fantasy RPG hero. Short messy dark brown hair,
brown eyes, fair skin, determined friendly face. Dark navy blue short hooded cape over the
shoulders, fastened at the chest. Deep blue knee-length tunic over gray long sleeves. Golden
yellow belt with a square buckle. Brown leather bracers on both forearms. Dark blue trousers.
Tall brown leather boots with folded cuffs. Holds a long spear in both hands, angled forward:
a straight dark wooden shaft as tall as he is, a leaf-shaped bronze spearhead, and a small red
cloth ribbon tied just below the spearhead. No sword. No green on the character. Clean readable
silhouette, rich colors, 16-bit detailed pixel art.
```

## 4.9 Mímico (PixelLab) — 2026-11-14

Guardião da sala secreta. Fechado, ele **tem de ser idêntico ao baú da fase** (é a graça). Por isso
partir da imagem do baú: `img/sprites/objetos/bau/bau_fechado.jpg` (arte nossa, pode subir).

1. **Create Character** a partir da imagem (ou de imagem de referência), tipo **Custom**, câmera
   **Sidescroller**, 48 px (ou o mais perto disso), direção **East**.
2. Animações (4 a 6 quadros cada), descrevendo sempre `the same wooden treasure chest`:
   - `dormir`: `Closed treasure chest standing still, completely normal, only a tiny glint on the
     gold lock` (2 a 4 quadros, quase parado).
   - `acordar`: `The treasure chest shakes and rattles, the lid lifts a little and two yellow eyes
     glow inside the dark gap`.
   - `pular`: `The treasure chest mimic hops forward, lid wide open like a mouth, rows of sharp
     white teeth, a long red tongue hanging out`.
   - `morder`: `The treasure chest mimic snaps its lid shut hard like a biting mouth, sharp teeth`.
3. Salvar as folhas em `img/sprites/inimigos/mimico/` (`dormir_folha.png`, `acordar_folha.png`,
   ...). O Claude troca o desenho atual (baú cortado na tampa) pelas animações.

Descrição do personagem (se o PixelLab pedir texto além da imagem):

```
A treasure chest mimic monster from a dark fantasy game: an old dark brown wooden treasure chest
with golden metal straps and a golden lock, exactly like a normal chest when closed. When it
opens, the lid is a mouth with rows of sharp white teeth, a long red tongue and two glowing
yellow eyes inside. Side view, 16-bit detailed pixel art, black outline, transparent background.
```

## 4.10 Pingente do Boitatá (PixelLab) — 2026-11-14

O troféu que o Boitatá deixa ao virar pó (caderno, p. 11: pingente **prateado**). Hoje é um disco
com um S desenhado pelo jogo. Ideia nova: um **amuleto de prata em forma de gota de fogo**, com a
**cobra enrolada em relevo**, do mesmo jeito do chefe (3 voltas e a cabeça subindo do meio), com
as rachaduras de lava nas costas e o olho de **brasa** (uma pedrinha laranja acesa). Prata velha,
argola no alto com um pedaço de corrente. Assim ele lembra a luta: a pose do Boitatá na arena.

1. **Create image** (objeto / map object), 64×64, fundo transparente, vista de frente.
2. Gerar 4 a 8 variações e escolher. Salvar como
   `img/sprites/objetos/pingente/boitata.png` (um arquivo por chefe: o próximo vira
   `pingente/<id da fase>.png`). O Claude roda a ferramenta; o jogo troca o desenho atual pela
   imagem e faz ela balançar de leve no chão.

```
A small silver amulet pendant, a trophy from a dark fantasy game. The pendant is shaped like a
teardrop flame, made of old polished silver with a dark engraved border. On its face, in relief,
a coiled serpent: the body coils in three loops like a spiral at the bottom, and the neck rises in
an S from the middle of the coil, the head on top facing left with the mouth slightly open and two
small fangs. Thin glowing orange lava cracks run along the serpent's back, and its eye is a tiny
glowing ember-orange gem. A small silver loop at the top with a short piece of silver chain. Faint
orange sparks around it. Front view, centered, 16-bit detailed pixel art, black outline,
transparent background, no text.
```

Se vier muito enfeitado ou ilegível em tamanho pequeno, acrescente `simple, bold shapes, readable
at small size` e tire `Faint orange sparks around it`.

## 4.11 Fundo da sala secreta: caverna sem fim de cogumelos (Gemini ou PixelLab) — 2026-11-14

Hoje o jogo desenha por código um campo de cogumelinhos que sobe e some no escuro. Esta imagem
pintada entra no lugar dele: o **fundo** da sala (as paredes, o teto, a mola, os cogumelos que
dançam e o baú continuam por cima, desenhados pelo jogo).

- Formato **largo, 16:7** (ex.: 1920×840). O jogo reduz para pixel art (480×210, 2× na tela).
- **Sem nada no primeiro plano:** a faixa de baixo (o chão onde o herói anda) deve ser só chão
  escuro de terra, sem cogumelos grandes na frente, que o jogo põe os dele.
- Salvar em `img/sprites/objetos/fundo_sala/cogumelos.png` (PNG; sem transparência tudo bem).

```
Pixel art background for a 2D side-scrolling game, wide 16:7. Inside a dark underground cave
that seems endless: thousands of small glowing blue mushrooms carpet the floor and stretch far
into the distance. The floor rises gently toward the back, so the mushroom carpet looks like it
climbs up a wall, but it is really the cave going on forever into darkness. Near rows: bigger
mushrooms with bright cyan spots; far rows: tiny glowing dots fading into a deep blue mist, then
pure black at the top. Soft blue light, a few floating spores, rocky cave ceiling barely visible
at the very top. Dark navy and black palette with cyan and blue glow only. The bottom strip of the
image is plain dark earth floor with no large objects in front. 16-bit detailed pixel art, no
characters, no text.
```

Se o resultado vier muito claro, acrescente `very dark, most of the image in shadow`. Se vier
uma parede reta, reforce `the floor slopes upward into the distance, perspective`.

## 4.12 Fase da Vaca: o pasto (Gemini e PixelLab) — 2026-11-15

A fase da Vaca já roda **sem imagem nenhuma**: o jogo desenha o céu do fim de tarde, os morros, as
árvores redondas, o capim, os cardos, os besouros, os pombos, a Vaca, o OVNI e a dog tag. Cada imagem
abaixo entra no lugar do desenho quando for salva (a ordem é só sugestão). Referência de cores: a
pintura do local, `web/locais/08-o-pasto-da-vaca-e-o-ovni.jpg` (pôr do sol roxo e laranja, pasto
verde, vaca branca com manchas marrons e asinhas brancas de pombo).

**1. Ageláda, a Vaca (PixelLab, a mais importante).** Create Character, tipo Custom (quadrúpede),
câmera **Sidescroller**, direção **East**, uns 96 px de largura. Animações (4 a 8 quadros cada):
`parado` (pastando, abana o rabo), `andar`, `empinar` (fica em pé nas patas de trás e pisa forte),
`gas` (de costas, rabo levantado, nuvem verde saindo), `cansada` (cabeça baixa, língua de fora). Salvar
as folhas em `img/sprites/chefes/vaca/` (`parado_folha.png`, `andar_folha.png`...). O Claude liga no
jogo (o desenho atual sai sozinho quando a arte existe).

```
A sacred cow boss from a fantasy game: a big friendly-looking dairy cow, white with large
reddish-brown patches, pink muzzle and udder, short cream horns, a small golden bell on the neck,
and two SMALL white pigeon wings on its back (tiny compared to the body, with soft grey feather
tips). Calm and stubborn expression. Side view, 16-bit detailed pixel art, black outline,
transparent background.
```

**2. Fundo do pasto (Gemini, 4 camadas).** Refeito em 2026-11-20 no padrão do kit (acima): os morros
e o capim são verdes, então o recorte é em **magenta**. Ordem: **céu primeiro**, com a pintura
`web/locais/08-o-pasto-da-vaca-e-o-ovni.jpg` anexada; depois `longe` e `perto` com o céu aprovado
anexado; depois o chão. Salvar em `img/sprites/fundos/vaca/`.

**`fundos/vaca/ceu`** (16:9; anexar a pintura do local)

```
Create an image. 2D side-scrolling game background layer, peaceful countryside pasture at
sunset, warm purple, pink and orange light, painterly style matching a fantasy RPG, seamless
horizontally tileable (the left and right edges must match), no characters, no animals, no text.
Use the colors and mood of the attached painting.
Wide 16:9 image. Only the SKY: sunset gradient from deep purple at the top through pink to warm
orange and golden yellow near the horizon, a big soft sun low near the horizon in the right
third of the image, long thin pink and orange clouds lit from below, a few faint first stars at
the very top. No ground, no hills, no trees.
```

**`fundos/vaca/longe`** (21:9; anexar o céu aprovado)

```
Create an image. 2D side-scrolling game background layer, peaceful countryside pasture at
sunset, warm purple, pink and orange light, painterly style matching a fantasy RPG, seamless
horizontally tileable (the left and right edges must match), no characters, no animals, no text.
Same palette and light as the attached sky.
Very wide 21:9 image. Only DISTANT rolling hills in two rows: far misty purple-blue hills, and in
front of them soft dark green hills with small round trees in silhouette, a warm orange rim of
sunset light on the hilltops, flat bottom edge, on a plain solid #FF00FF magenta background (the
sky area must be pure magenta).
```

**`fundos/vaca/perto`** (21:9; anexar o céu aprovado)

```
Create an image. 2D side-scrolling game background layer, peaceful countryside pasture at
sunset, warm purple, pink and orange light, painterly style matching a fantasy RPG, seamless
horizontally tileable (the left and right edges must match), no characters, no animals, no text.
Same palette and light as the attached sky.
Very wide 21:9 image. Only CLOSER green meadow hills with a few big round leafy trees, tall
grass tufts, small wildflowers and an old crooked wooden fence, sparse with big gaps, warm
sunset light coming from the right, flat bottom edge, on a plain solid #FF00FF magenta
background (the sky area must be pure magenta).
```

**`fundos/vaca/chao`** (1:1)

```
Create an image. 2D side-scrolling game background layer, peaceful countryside pasture at
sunset, painterly style matching a fantasy RPG, no characters, no text.
Square 1:1 seamless tileable texture of rich brown soil with small pebbles and thin roots, seen
from the side like a cut through the ground, the top edge covered by a strip of bright green
grass with a few tiny wildflowers. Warm sunset tones.
```

**2b. Árvores do pasto (Gemini, 4 peças).** Mesmo sistema da floresta (seção 4.1): o jogo monta
cada árvore com tronco, raiz e galhos; no pasto entra também a **copa** redonda (peça nova: o
Claude liga no motor e na ferramenta quando chegar). Fundo **magenta**. Gerar o tronco primeiro e
anexá-lo nas outras três. Salvar em `img/sprites/fundos/vaca/`.

**`arvore_tronco`** (1:3)

```
Create an image. A straight vertical section of a big old living tree trunk from a peaceful
countryside pasture, warm brown bark with deep vertical grooves, a few knots and small patches of
moss, warm orange sunset light on the right side. Only the middle of the trunk: no roots, no
branches, no leaves, no top. The top and bottom edges must match so the image can be repeated
vertically (seamless vertical tile). Side view, straight and centered, plain solid #FF00FF
magenta background on both sides, no shadow, no text. Painterly 2D game art style. Tall portrait
image, aspect ratio 1:3.
```

**`arvore_raiz`** (2:1; anexar o tronco)

```
Create an image. The base of the same big living tree trunk (same bark, same colors as the
attached trunk) with thick roots spreading to both sides and gripping the ground, a little moss
and a few grass blades between the roots. The trunk is cut straight at the top (it continues
upward in the game) and has the same width as the trunk section. Side view, centered, plain
solid #FF00FF magenta background, no ground, no shadow, no text. Painterly 2D game art style.
Wide image, aspect ratio 2:1.
```

**`arvore_galho`** (4:1; anexar o tronco)

```
Create an image. One thick horizontal branch of the same living tree (same bark, same colors as
the attached trunk), growing from the left edge of the image to the right, where it ends in a
rounded tip with a small cluster of green leaves. The TOP of the branch must be flat and straight
like a walkable ledge, with nothing sticking up above it. A few small leaf clusters and twigs
only BELOW the branch. Side view, plain solid #FF00FF magenta background, no shadow, no text.
Painterly 2D game art style. Very wide image, aspect ratio 4:1.
```

**`arvore_copa`** (3:2; anexar o tronco)

```
Create an image. The round leafy crown of the same tree (same colors as the attached trunk),
seen from the side: a big full cloud-like canopy made of clustered round leaf clumps, dark green
in the shadows, bright yellow-green where the warm sunset light hits the top-right, a few small
gaps. NO trunk and NO branches visible anywhere: the underside of the canopy is a continuous
mass of leaves, darker and shaded at the bottom center (the game draws the trunk entering from
below, behind the leaves). Plain solid #FF00FF magenta background, no shadow, no text. Painterly
2D game art style. Wide image, aspect ratio 3:2.
```

(Versão de 2026-11-20: a primeira pedia um toco de tronco embaixo, e o tronco pintado dentro da copa
ficava mais fino que o do jogo. Para trocar só a copa, anexe a copa atual e use: "Same canopy as the
attached image, same colors, light and shape, but remove the trunk completely: fill the bottom
center with dark shaded leaves so no wood is visible. Plain solid #FF00FF magenta background.")

Dicas: se o Gemini puser chão ou céu atrás, peça "only the object on a flat magenta background,
nothing else". Se o galho vier com folhas por cima, mande assim mesmo: o Claude corta.

**Árvores, versão 2 (2026-11-20): galho mais natural e mais de um tipo de copa.** O Erick achou o
galho esquisito (parece um tronco reto com a ponta serrada) e as copas das árvores do fundo mais
bonitas que a copa da plataforma. O jogo já aceita até três copas (`arvore_copa`, `arvore_copa2`,
`arvore_copa3`): cada árvore usa uma, e o jogo ainda espelha, muda o tamanho e o tom de cada
uma. Anexar no Gemini o tronco (`arvore_tronco.jpg`) e a imagem do fundo `perto.jpg` (árvores
do fundo, para copiar o estilo). Salvar em `img/sprites/fundos/vaca/` com esses nomes.

**`arvore_galho`** v2 (4:1; anexar o tronco)

```
Create an image. One thick living branch of the same tree (same bark and colors as the attached
trunk), growing from the left edge of the image to the right. It starts thick at the left and
gets gradually thinner toward the right, with a gentle natural curve and slightly irregular
bark, and it ends in a tapered tip that splits into two or three small twigs covered by a
generous cluster of leaves (same leaf style as the trees in the attached background). The TOP
edge of the branch must stay smooth and nearly flat, like a walkable ledge, with nothing sticking
up above it except the leaf cluster at the very tip. A few small leaves and twigs hang BELOW the
branch. No sawn or cut ends. Side view, plain solid #FF00FF magenta background, no shadow, no
text. Painterly 2D game art style. Very wide image, aspect ratio 4:1.
```

**`arvore_copa2`** (3:2; anexar o tronco e o `perto.jpg`)

```
Create an image. A leafy tree crown in the same style as the round trees in the attached
background image (same rounded leaf clumps, same soft sunset light from the right), but bigger
and seen up close: a TALL OVAL canopy, a bit taller than wide, made of large rounded leaf clumps,
fresh green with golden highlights on the top-right and deep blue-green shadows at the bottom.
NO trunk and NO branches visible: the underside is a continuous mass of shaded leaves (the game
draws the trunk entering from below). Plain solid #FF00FF magenta background, no shadow, no
text. Painterly 2D game art style. Aspect ratio 3:2.
```

**`arvore_copa3`** (3:2; anexar o tronco e o `perto.jpg`)

```
Create an image. A leafy tree crown in the same style as the trees in the attached background
image, seen up close: a WIDE UMBRELLA-SHAPED canopy, much wider than tall, with an uneven top
made of three or four big rounded leaf clumps, olive and autumn-yellow leaves lit by the warm
sunset on the right, darker shaded leaves underneath. NO trunk and NO branches visible: the
underside is a continuous mass of shaded leaves. Plain solid #FF00FF magenta background, no
shadow, no text. Painterly 2D game art style. Aspect ratio 3:2.
```

**Chão do pasto, versões para testar no laboratório (2026-11-20).** Testar em
`jogo/laboratorio/pasto.html` ("Chão (textura)") antes de salvar. A que for escolhida vai para
`img/sprites/fundos/vaca/chao.jpg`.

- Gramado visto de cima e de lado (o chão é o próprio campo):

```
Create an image. 2D side-scrolling game ground texture, peaceful countryside pasture at sunset,
painterly style matching a fantasy RPG, no characters, no text.
Square 1:1 seamless tileable texture (all four edges must match) of a dense green meadow seen
from the side at ground level: layers of grass blades of different greens, darker and shaded
toward the bottom, a few tiny wildflowers (white, yellow, purple), small clover leaves, warm
golden sunset light touching the grass tips. No soil visible, no sky, no horizon.
```

- Terra com capim por cima, mais rica que a primeira (o corte do chão, como antes):

```
Create an image. 2D side-scrolling game ground texture, peaceful countryside pasture at sunset,
painterly style matching a fantasy RPG, no characters, no text.
Square 1:1 seamless tileable texture (left and right edges must match) of the ground seen from
the side: the top quarter is thick green grass with blades hanging over the edge and a few tiny
wildflowers, warm sunset light on the grass; below it rich dark brown soil with small roots,
pebbles and grass roots fading into darker earth at the bottom. No sky, no horizon above the grass.
```

**Campo aberto: capim alto e folhagem da frente (2026-11-20, pedido do Erick).** O Erick quer o
pasto com cara de campo pintado e cheio de profundidade: capim alto balançando que cobre os pés dos
heróis, chão que some no escuro (sem corte de terra), ar quente entre os planos e silhuetas escuras
de plantas na frente da câmera. O laboratório tem um rascunho disso ("Ver o campo aberto"). Como o piso é feito (análise
das referências do Erick): (1) o campo é visto um pouco de cima, então o herói pisa *dentro* do capim
e não na beirada de um bloco; (2) o capim é claro em cima e escurece para baixo, sem terra; (3) uma
faixa preta de capim e plantas, bem perto da câmera, passa na frente e esconde onde o chão "acabaria".
As duas peças abaixo trocam o rascunho por arte de verdade; testar em "Capim alto (faixa)" e "Folhagem da
frente" (coluna da direita). Anexar o céu e o `perto` aprovados.

- `fundos/vaca/capim` (4:1, magenta): o campo inteiro, da ponta do capim até a sombra de baixo. É o
  piso: não tem corte de terra, o capim só vai escurecendo até encontrar a faixa preta da frente.

```
Create an image. 2D side-scrolling game layer, peaceful countryside pasture at sunset, painterly
style matching a fantasy RPG, same palette and light as the attached images, no characters, no text.
Very wide 4:1 image, seamless horizontally tileable (left and right edges must match). A wide band
of a tall wild grass meadow seen from the side and slightly from above, painted with visible brush
strokes: thousands of long grass blades all leaning to the right in the wind, bright yellow-green
and golden where the sunset light hits the top part of the field, a few lighter strands catching
the light, gradually darker green toward the bottom and finally deep blue-green shadow at the very
bottom edge. NO soil, NO dirt, NO cut through the ground: only grass from top to bottom. The top
edge is ragged with individual blades against a plain solid #FF00FF magenta background.
```

- `fundos/vaca/frente` (4:1, magenta): a faixa preta da frente. No jogo ela é baixa (uns 26 px da
  tela, mais as pontas do capim e uma samambaia de vez em quando), para não esconder o herói.

```
Create an image. 2D side-scrolling game foreground layer, peaceful countryside pasture at sunset,
painterly style matching a fantasy RPG, no characters, no text.
Very wide 4:1 image, seamless horizontally tileable (left and right edges must match). Only a LOW
strip of grass very close to the camera along the bottom edge, as a dark silhouette (very dark
blue-green, almost black), slightly out of focus: a gently rolling mound of thick grass whose top
edge is made of many individual grass blades of different heights leaning in the wind, with a
thin cool blue-green rim light along the top edge, and only two or three small fern fronds or
taller grass tufts sticking up a little higher. The dark mound fills the bottom third of the image
and touches the bottom edge. Everything above it is plain solid #FF00FF magenta background.
```

**Feito em 2026-11-20:** `capim` e `frente` saíram de primeira e estão no jogo (a ferramenta emenda as laterais).

**Feito em 2026-11-20:** as 8 peças acima foram geradas de primeira com estes prompts e estão no
jogo. O chão veio com céu e capim pintados em cima (a ferramenta corta) e o perto não emendava nas
laterais (a ferramenta mistura as bordas). Nada disso precisou de imagem nova.

**3. Inimigos (PixelLab, Sidescroller, East, 32 px).** Pastas `img/sprites/inimigos/besouro/`
(animação `andar`) e `img/sprites/inimigos/pombo/` (animação `voar`).

**Besouro grande (2026-11-20, substitui o prompt pequeno):** o besouro é enorme (no jogo ocupa
~156 x 144 px, mais alto que o pulo do herói, 136 px) e "paz e amor": anda devagar num caminho
longo e não ataca. Se o herói bater nele, ele se prepara e dá uma **investida** (corre de cabeça
baixa com o chifre para a frente). No PixelLab: Sidescroller, East, **64 px** (o jogo amplia),
personagem mais alto que largo por causa do chifre de cima. Animações: `andar` (passos lentos e
pesados), `preparar` (abaixa a cabeça e raspa a pata, 3–4 quadros) e `investida` (corrida rápida,
4–6 quadros). Pasta `img/sprites/inimigos/besouro/`.

```
A giant hercules beetle, calm and majestic, much taller than a person: a big round shiny dark
blue-black shell with a light blue highlight, a long curved horn rising high from the thorax and
curving forward, a smaller upturned horn on the head, small kind yellow eyes, six sturdy legs.
Gentle giant, not angry. Side view facing right, 16-bit pixel art, black outline, transparent
background.
```

Animação `preparar`: "the beetle lowers its head and horns, scrapes the ground with a front leg,
ready to charge". Animação `investida`: "the beetle charges forward fast, head down, horns
pointing forward, legs running".

**Pombo (2026-11-20):** mesma regra do besouro (não ataca; encostar deixa com 1 de vida; se
apanhar, dá uma investida em mergulho). Animações `voar` e `investida` ("the pigeon dives fast
forward, wings folded back, beak first").

```
An angry grey city pigeon enemy: grey body, iridescent green and purple neck, orange eye with an
angry eyebrow, small dark beak, pink feet. Side view, 16-bit pixel art, black outline,
transparent background.
```

**4. Dog tag dourada (PixelLab, Create image 64×64).** Salvar como
`img/sprites/objetos/pingente/vaca.png` (o jogo já procura esse nome).

```
A small golden military dog tag, a trophy from a fantasy game: rounded rectangle of shiny gold
with a darker gold border, a small hole at the top with a short golden ball chain, a tiny
engraved cow head with little wings on its face. Front view, centered, 16-bit detailed pixel
art, black outline, transparent background, no text.
```

**5. OVNI (opcional, PixelLab, Create image 128×64).** Hoje é desenhado pelo jogo. Se quiser
arte: `img/sprites/objetos/ovni.png`.

```
A classic flying saucer UFO: silver metal disc with a glass dome on top, a ring of colorful
round lights (red, yellow, green, blue, purple) around the rim, a green glow underneath. Side
view, 16-bit detailed pixel art, black outline, transparent background.
```

## 4.13 Kit do pasto no estilo Magibot (Gemini) — 2026-11-20

O Erick escolheu o estilo do Magibot para o jogo (em pixel art): fundo claro e enevoado num tom só, o
plano do jogo com cor forte, chão em **barranco** (topo de musgo e capim visto um pouco de cima, onde
se pisa, e a frente de terra em sombra), plataformas que fazem parte do cenário e silhuetas pretas na
frente. No pasto: **sem tijolos e sem raios de sol**; plataformas de fazenda (feno, cerca, carroça,
tronco, pedra). O piso é plano (o herói anda reto). Esboço feito por código: tela de teste
`?fase=vaca&limpo`, tecla 7.

**Regras para todas as peças:** anexar o `perto.jpg` (para nascer na mesma paleta e luz do fundo);
vista de lado, **um pouco de cima** (o topo aparece como uma faixa onde se pisa); topo **plano**;
fundo magenta liso #FF00FF; sem sombra no chão, sem texto. Salvar em `img/sprites/fundos/vaca/`
com o nome indicado (JPG ou PNG). A ferramenta tira o magenta e reduz para pixel art.

**`bloco_chao`** (chão que se repete; 4:1)

```
Create an image. A long flat ground bank for a 2D side-scrolling platformer, seen from the side
and slightly from above. The TOP is a flat strip of lush green grass and moss with tiny
wildflowers, seen slightly from above, where the character walks. Moss and grass hang over the
front edge in soft drips. Below it, the FRONT FACE of the bank: dark earth in shadow, warm purple-
brown, with vertical streaks, tangled thin roots, patches of moss and a few half-buried small
stones; it gets darker toward the bottom and fades to almost black. No bricks, no carved stones.
The left and right edges must match so it repeats seamlessly. Stylized hand-painted 2D platformer
art, chunky simple shapes, soft painterly gradients, warm late-afternoon light from the right,
same colors and light as the attached image. Plain solid #FF00FF magenta background above the
grass. Very wide image, aspect ratio 4:1.
```

**`bloco_beirada`** (ponta do barranco na beira de um buraco; o jogo espelha para o outro lado; 1:1)

```
Create an image. The RIGHT END of the same grassy earth bank as the attached image, where the
ground ends at a pit: the grass top curves down over a rounded edge, moss and roots hang over the
corner, and the earth face turns slightly inward and gets darker toward the bottom. The left side
of the image continues the flat bank (it will join the repeating ground). Stylized hand-painted 2D
platformer art, chunky simple shapes, soft painterly gradients, warm late-afternoon light from the
right, same colors and light as the attached image. Plain solid #FF00FF magenta background on the
right and above. Square image, aspect ratio 1:1.
```

**`feno`** (um fardo de feno para subir; 4:3)

```
Create an image. One big rectangular hay bale lying on the ground, seen from the side and slightly
from above so the flat top is visible (the character stands on it). Golden straw with darker
shaded sides, two tight twine bands, a few loose straws sticking out, a little moss and grass at
the base. Stylized hand-painted 2D platformer art, chunky simple shapes, soft painterly gradients,
warm late-afternoon light from the right, same colors and light as the attached image. Plain solid
#FF00FF magenta background, no shadow. Aspect ratio 4:3.
```

**`feno_pilha`** (pilha de feno em degraus: dois embaixo, um em cima; 4:3)

```
Create an image. A stack of three rectangular hay bales like steps: two bales side by side on the
ground and one bale on top of them, shifted to the right, so the character can climb. Seen from
the side and slightly from above, flat tops visible. Golden straw, twine bands, loose straws, a
little grass at the base. Stylized hand-painted 2D platformer art, chunky simple shapes, soft
painterly gradients, warm late-afternoon light from the right, same colors and light as the
attached image. Plain solid #FF00FF magenta background, no shadow. Aspect ratio 4:3.
```

**`cerca`** (trecho de cerca de madeira que se repete; o herói pode andar no topo; 3:1)

```
Create an image. A section of old rustic wooden pasture fence: thick weathered posts and two
chunky horizontal rails, the TOP rail is wide and flat like a beam the character can walk on. Some
moss and grass around the posts at the bottom. Seen from the side, slightly from above. The left
and right edges must match so it repeats seamlessly. Stylized hand-painted 2D platformer art,
chunky simple shapes, soft painterly gradients, warm late-afternoon light from the right, same
colors and light as the attached image. Plain solid #FF00FF magenta background, no shadow. Wide
image, aspect ratio 3:1.
```

**`carroca`** (carroça velha de feno; a caçamba é plataforma; 3:2)

```
Create an image. An old abandoned wooden farm cart full of hay, seen from the side and slightly
from above: big wooden wheels (one a bit tilted), a flat wooden bed with a heap of hay on top, a
long wooden pole resting on the ground, moss and grass growing around the wheels. Stylized hand-
painted 2D platformer art, chunky simple shapes, soft painterly gradients, warm late-afternoon
light from the right, same colors and light as the attached image. Plain solid #FF00FF magenta
background, no shadow. Aspect ratio 3:2.
```

**`tronco_caido`** (tronco caído coberto de musgo, topo plano; 3:1)

```
Create an image. A big fallen tree trunk lying on the ground, seen from the side and slightly from
above, thick and slightly curved, with a flat mossy top the character can walk on, bark with deep
grooves, a broken end on the left and a few roots on the right, ferns and grass growing around it.
Stylized hand-painted 2D platformer art, chunky simple shapes, soft painterly gradients, warm
late-afternoon light from the right, same colors and light as the attached image. Plain solid
#FF00FF magenta background, no shadow. Wide image, aspect ratio 3:1.
```

**`pedra`** (pedra grande com topo plano e musgo; 4:3)

```
Create an image. A big rounded boulder sitting in the grass, seen from the side and slightly from
above, with a flat mossy top the character can stand on, warm grey-purple stone with soft
painterly shading, a few cracks, moss and small flowers at the base. Stylized hand-painted 2D
platformer art, chunky simple shapes, soft painterly gradients, warm late-afternoon light from the
right, same colors and light as the attached image. Plain solid #FF00FF magenta background, no
shadow. Aspect ratio 4:3.
```

**`cipos`** (silhuetas pretas da frente da câmera; 2:1)

```
Create an image. Pure black silhouettes for the foreground of a 2D game, very close to the camera:
on the top, two or three thick twisted tree branches and vines hanging down from above with a few
leaves; on the bottom, a few clumps of tall grass and fern silhouettes. Everything is solid flat
black (#000000) with no details, soft organic shapes like in a modern indie platformer. Plain
solid #FF00FF magenta background everywhere else. Wide image, aspect ratio 2:1.
```

Quando chegarem, o Claude registra as peças na ferramenta (alturas e recorte), troca o esboço do
código pelo `bloco_chao`/`bloco_beirada` e monta as plataformas na tela de teste.

### 4.13.1 `bloco_chao` versão 2: gramado de pasto limpo e mais fundo — 2026-11-21

O Erick achou o piso "sujo" (manchas marrons e textura de musgo no topo). Versão nova com o topo de
**gramado de pasto**: capim curto, verde limpo, faixa vista de cima **mais funda** (cerca de um terço
da altura). Anexar o `perto.jpg` e o `bloco_chao.jpg` atual (para manter a frente de terra e a luz).
Salvar como `img/sprites/fundos/vaca/bloco_chao.jpg` (substitui o atual; o antigo fica no git).

```
Create an image. A long flat ground bank for a 2D side-scrolling platformer, same style, colors and
light as the attached images. The TOP is a DEEP flat strip of clean, healthy pasture lawn seen from
above (about one third of the image height), where the character walks: short even green grass with a
soft painterly texture, gentle light and dark green variation, a few tiny white and yellow
wildflowers. NO brown dirt patches, no mud, no moss blotches, no stones on the top. The front edge of
the lawn is a soft row of grass tufts slightly hanging over. Below it, the FRONT FACE of the bank: dark
earth in shadow, warm purple-brown, with vertical streaks and thin roots, getting darker toward the
bottom and fading to almost black. No bricks. The left and right edges must match so it repeats
seamlessly. Stylized hand-painted 2D platformer art, chunky simple shapes, soft painterly gradients,
warm late-afternoon light from the right. Plain solid #FF00FF magenta background above the grass. Very
wide image, aspect ratio 4:1.
```

Quando chegar: o Claude processa, mede de novo a faixa de capim (linhas do topo e da borda) e acerta
`topo`/`CHAO_EXTRA` no `jogo.js` (talvez a faixa já venha funda o bastante e o `CHAO_EXTRA` vire 0).

## 5. Ficha dos 3 heróis com constelação (para a Milena)

O humano já está definido (o 4º jogador, sem constelação). Antes das imagens de cada herói dos
signos, a Milena preenche uma ficha. É a criação de personagem
da página 34 do caderno, mais o que o jogo precisa. Com ela eu escrevo os prompts das poses e
coloco o herói no jogo.

```
Signo:
Elemento:            (Água, Fogo, Terra ou Ar)
Nome:
Idade aproximada:
Aparência:           roupa, cores (evitar verde-limão), cabelo, olhos, arma
A constelação:       onde ela brilha (braço, mão, roupa...)
Poder especial:      o que o botão do elemento faz (ex.: jato d'água, bola de fogo, pedra que quica, rajada de vento)
Atributo forte:      Vigor, Força, Intelecto ou Agilidade
Fraqueza (opcional): algo que dá trabalho para ele
Frase de efeito (opcional):
```

Antes da ficha, falta decidir uma pendência que está no Leia-me: se os elementos seguem a tabela
dela ou a da astrologia comum. (O herói de Fogo é de Sagitário: decidido pela Milena em 2026-11-08.)
