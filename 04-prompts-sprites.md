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

## 2. Boitatá em 3 partes

O jogo monta a cobra: uma cabeça, vários gomos iguais e a ponta do rabo. As chamas que dançam por
cima são do próprio jogo, então as partes podem ter só brasas e rachaduras brilhando. Gere a
cabeça primeiro e anexe-a nos pedidos do gomo e do rabo, para as cores baterem.

**`chefes/boitata/cabeca.png`**

```
Create an image. Part of a giant serpent made of living fire from Brazilian folklore (the
Boitatá): charred black-red ember skin with glowing orange cracks, small flickering flames, eyes
like bright burning coals. Isolated 2D game asset, painterly fantasy RPG style, side view, plain
solid #00FF00 green background, no shadow, no text, no frame.
Only the HEAD of the serpent, facing right, mouth slightly open showing sharp fangs, no neck
or a very short neck.
```

**`chefes/boitata/gomo.png`**

```
Create an image. Part of a giant serpent made of living fire from Brazilian folklore (the
Boitatá): charred black-red ember skin with glowing orange cracks, small flickering flames, eyes
like bright burning coals. Isolated 2D game asset, painterly fantasy RPG style, side view, plain
solid #00FF00 green background, no shadow, no text, no frame.
Only ONE round BODY SEGMENT of the serpent, roughly circular, like a thick slice of the body
seen from the side, no head, no tail. Same colors as the attached head.
```

**`chefes/boitata/rabo.png`**

```
Create an image. Part of a giant serpent made of living fire from Brazilian folklore (the
Boitatá): charred black-red ember skin with glowing orange cracks, small flickering flames, eyes
like bright burning coals. Isolated 2D game asset, painterly fantasy RPG style, side view, plain
solid #00FF00 green background, no shadow, no text, no frame.
Only the TAIL TIP of the serpent, tapering to a point, pointing left. Same colors as the
attached head.
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

Antes da ficha, ela precisa decidir duas pendências que estão no Leia-me: se o herói de Fogo é
de Libra (circulado na p. 1) ou de Sagitário (desenhado na p. 4), e se os elementos seguem a
tabela dela ou a da astrologia comum.
