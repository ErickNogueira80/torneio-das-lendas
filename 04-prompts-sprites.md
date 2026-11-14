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
