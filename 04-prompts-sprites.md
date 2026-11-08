# Jogo: prompts das imagens (sprites)

Prompts para gerar, em outra IA de imagem, a arte do jogo: o herói, o Boitatá, os inimigos e o
fundo da floresta. Depois de geradas, as imagens passam pela ferramenta
`ferramentas/preparar_sprites.py`, que tira o fundo, corta, iguala o tamanho e monta as folhas
que o jogo usa. Enquanto uma imagem não existe, o jogo continua com o desenho de reserva.

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

**Bloco de estilo** (colar antes de cada prompt, como nos prompts dos locais):

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
img/sprites/herois/humano/retrato.png      (referência; não entra no jogo)
img/sprites/herois/humano/parado_1.png
img/sprites/herois/humano/correr_1.png ... correr_4.png
img/sprites/herois/humano/pular_1.png
img/sprites/herois/humano/cair_1.png
img/sprites/herois/humano/espada_1.png, espada_2.png
img/sprites/herois/humano/poder_1.png
img/sprites/herois/humano/dano_1.png
img/sprites/herois/humano/correr_folha.png ou poses_folha.png   (opcional: várias poses numa imagem)
img/sprites/chefes/boitata/cabeca.png, gomo.png, rabo.png
img/sprites/inimigos/brasa/andar_1.png, andar_2.png
img/sprites/inimigos/vagalume/voar_1.png, voar_2.png
img/sprites/fundos/boitata/ceu.png, longe.png, perto.png, chao.png
```

Depois é só me avisar (ou rodar `python ferramentas/preparar_sprites.py` e publicar). Não precisa
gerar tudo de uma vez: cada item que chega já aparece no jogo.

---

## 1. O herói: "o humano"

O humano é o 4º jogador: o "normal", sem constelação e sem atributo forte, com a jogabilidade
mais difícil (na história, é o Câncer escondido). Ele é o primeiro a ganhar imagens porque já
está no jogo. Mais adiante os 3 heróis com constelação terão o seu conjunto, com as mesmas poses.

### 1.1 Retrato oficial (fazer primeiro)

Gere de 3 a 5 versões e escolham a preferida. Ela vira a referência de todas as poses.

```
An original young adventurer, about 16 years old, ordinary human with no magic marks. Short messy
dark brown hair, determined friendly face. Wears a simple deep blue tunic with a golden belt,
a darker navy short cape, brown leather boots and bracers, and carries a short steel sword.
No green anywhere on the character. Standing in a relaxed neutral pose, full body, side view
facing right.
```

### 1.2 Poses (sempre com o retrato anexado)

Comece cada pedido com: `Same character as the reference image, same outfit and colors, same
proportions.` e depois a pose:

| Arquivo | Pose |
|---|---|
| `parado_1` | `Idle stance, standing, sword held low in the right hand, slight breathing posture.` |
| `correr_1` | `Running, right leg forward and left leg back, arms swinging, cape flowing behind.` |
| `correr_2` | `Running, legs passing each other under the body (mid-stride), cape flowing.` |
| `correr_3` | `Running, left leg forward and right leg back, arms swinging, cape flowing behind.` |
| `correr_4` | `Running, legs passing each other under the body, other arm forward, cape flowing.` |
| `pular_1` | `Jumping upward, knees bent, one arm raised, cape trailing down.` |
| `cair_1` | `Falling down, legs slightly apart preparing to land, arms out for balance, cape lifted up.` |
| `espada_1` | `Sword attack wind-up, sword raised behind the head, body twisted back.` |
| `espada_2` | `Sword slash finished, arm fully extended forward, sword horizontal in front, lunging.` |
| `poder_1` | `Casting a spell, free hand stretched forward with open palm, glowing light in the palm.` |
| `dano_1` | `Getting hit, recoiling backward, eyes shut, arms up defensively.` |

**Dicas:** se uma pose sair com outra roupa ou outra cor, descarte e gere de novo. Se ficar quase
certa, dá para pedir "mesma imagem, mas com a capa azul-marinho" em vez de começar do zero.
Para a corrida, 4 quadros é o ideal; com 2 (`correr_1` e `correr_3`) já funciona.

---

## 2. Boitatá em 3 partes

O jogo monta a cobra: uma cabeça, vários gomos iguais e a ponta do rabo. As chamas que dançam por
cima são do próprio jogo, então as partes podem ter só brasas e rachaduras brilhando.

```
Part of a giant serpent made of living fire from Brazilian folklore (the Boitatá): charred
black-red ember skin with glowing orange cracks, small flickering flames, eyes like bright
burning coals. Isolated game asset, side view, plain solid #00FF00 green background, no text.
```

| Arquivo | Complemento do prompt |
|---|---|
| `cabeca` | `Only the HEAD of the serpent, facing right, mouth slightly open showing sharp fangs, no neck or a very short neck.` |
| `gomo` | `Only ONE round BODY SEGMENT of the serpent, roughly circular, like a thick slice of the body seen from the side, no head, no tail.` |
| `rabo` | `Only the TAIL TIP of the serpent, tapering to a point, pointing left.` |

---

## 3. Inimigos pequenos

```
Small original fire creature for a 2D platform game, cute but mischievous, isolated, side view
facing right, plain solid #00FF00 green background, no text.
```

| Arquivo | Complemento do prompt |
|---|---|
| `inimigos/brasa/andar_1` | `A living flame blob with two dark eyes and tiny feet, walking, left foot forward.` |
| `inimigos/brasa/andar_2` | `Same flame creature, walking, right foot forward, flame leaning the other way.` |
| `inimigos/vagalume/voar_1` | `A glowing fire firefly with a bright ember body and translucent wings raised up.` |
| `inimigos/vagalume/voar_2` | `Same fire firefly, wings lowered down.` |

---

## 4. Fundo da floresta incendiada (3 camadas e o chão)

As camadas ficam uma na frente da outra e andam em velocidades diferentes, o que dá
profundidade. Precisam **emendar nas laterais** (a borda direita continua na esquerda), porque o
jogo repete a imagem. Se a emenda não ficar perfeita, me mandem assim mesmo que eu ajusto.

```
2D side-scrolling game background layer, burned dead forest at dusk, smoky orange and purple
atmosphere, painterly style matching a fantasy RPG, seamless horizontally tileable, no characters,
no text.
```

| Arquivo | Complemento do prompt | Formato |
|---|---|---|
| `ceu` | `Only the SKY: smoky dusk gradient from deep purple at the top to burning orange near the horizon, a large pale ember-colored moon, drifting ash. No trees, no ground.` | 16:9 |
| `longe` | `Only DISTANT burned tree silhouettes and low hills, dark purple-brown, flat bottom edge, on a plain solid #00FF00 green background (the sky area must be pure green).` | 21:9 ou 3:1 |
| `perto` | `Only a few CLOSER burned tree trunks with broken branches and faint glowing embers, sparse with big gaps, flat bottom edge, on a plain solid #00FF00 green background.` | 21:9 ou 3:1 |
| `chao` | `Square seamless tileable texture of burnt dark soil and ash with tiny glowing embers, seen from the side, the top edge slightly lighter like an ash crust.` | 1:1 |

---

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
