"""Prepara as imagens geradas por IA para o jogo.

Lê `img/sprites/` (originais, fora do git) e grava em `jogo/sprites/` as folhas prontas e o
`sprites.json` que o jogo carrega. Para cada imagem: remove o fundo de cor lisa, corta as sobras,
iguala o tamanho e (nos personagens) alinha os pés numa mesma linha.

Estrutura esperada (nomes sem acento, minúsculos):

  img/sprites/herois/<heroi>/<animacao>_<n>.png     ex.: herois/humano/correr_1.png
  img/sprites/inimigos/<inimigo>/<animacao>_<n>.png ex.: inimigos/brasa/andar_1.png
  img/sprites/chefes/<chefe>/<parte>.png            ex.: chefes/boitata/cabeca.png, gomo.png, rabo.png
  img/sprites/fundos/<fase>/<camada>.png            ex.: fundos/boitata/ceu.png, longe.png, perto.png, chao.png

Animações reconhecidas: parado, correr, pular, cair, espada, poder, dano, andar, voar.
`retrato.png` dos heróis vira `jogo/sprites/herois/<heroi>_retrato.png` (sem fundo, até 900 px de
altura), para a tela de escolha de herói. Arquivos com outros nomes são ignorados.

Folha com várias poses: `<animacao>_folha.png` (ex.: correr_folha.png) com as poses lado a lado
(ou em linhas), separadas por fundo livre. A ferramenta recorta cada pose, na ordem de leitura
(linha a linha, da esquerda para a direita), e mantém o tamanho relativo entre elas.
`poses_folha.png` aceita uma folha mista: a ordem das poses tem de ser a de ORDEM_POSES abaixo.
Aceita .png, .jpg, .jpeg e .webp. O fundo é detectado pela cor das bordas da imagem; se a
imagem já vier com transparência, ela é mantida.

Pixel art (PixelLab): se a pasta de um personagem tiver GIFs com nome de animação
(`parado.gif`, `correr.gif`, ...), ela entra no modo pixel: usa só os GIFs, não redimensiona, mantém
todos os quadros na mesma caixa e usa a mesma âncora (os pés do `parado`) em todas as animações,
para o boneco não tremer. No ajustes.json, `"quadros": [2, 3, 4]` escolhe quais quadros do GIF
entram (contando do 1) e `"altura"` muda a altura do boneco no jogo (padrão 62 px).

Ajustes finos (opcional): `img/sprites/ajustes.json`, por exemplo
  {"herois/humano/pular_1": {"escala": 0.9}, "herois/humano/espada_2": {"dx": -6}}
  escala: multiplica o tamanho do quadro; dx/dy: desloca o quadro (em pixels da folha).

Uso (na raiz do projeto): python ferramentas/preparar_sprites.py
"""
from __future__ import annotations

import json
import re
from pathlib import Path

import numpy as np
from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
ORIGEM = RAIZ / "img" / "sprites"
DESTINO = RAIZ / "jogo" / "sprites"
EXTS = {".png", ".jpg", ".jpeg", ".webp"}
ANIMS = ["parado", "correr", "pular", "cair", "espada", "poder", "dano", "morrer", "andar", "voar"]
PIXEL_ALTURA = 62   # altura do boneco em pixel art no jogo (px da tela virtual)

# altura no jogo (px da tela virtual 960x540) e altura na folha (resolução guardada)
PERSONAGEM = {
    "herois": {"altura": 72, "atlas": 192},
    "inimigos": {"altura": 44, "atlas": 112},
}
ALTURA_ESPECIFICA = {"inimigos/vagalume": 34}
PARTES_LADO = {"cabeca": 256, "gomo": 160, "rabo": 128}   # maior lado de cada parte na folha
# Fundos em pixel art: cada pixel da arte vira 2x2 na tela virtual (FUNDO_PIXEL). Alturas na
# resolução da arte: céu 270 (tela 540), longe 180 (360), perto 210 (420), chão 128 (ladrilho 256).
FUNDO_PIXEL = 2
FUNDO_ALTURA = {"ceu": 270, "longe": 180, "perto": 210, "chao": 128,
                # peças das árvores-plataforma (tela = o dobro): tronco que se repete na vertical,
                # raiz da base e galho horizontal com o topo reto (onde se pisa)
                "arvore_tronco": 150, "arvore_raiz": 40, "arvore_galho": 14}
# As peças da árvore são escaladas pela medida que importa para o encaixe (em px da arte):
TRONCO_LARGURA = 40   # largura do tronco
GALHO_ESPESSURA = 12  # espessura do galho (o topo dele é onde se pisa)
FUNDO_CORES = 32   # cores por camada (paleta limitada, cara de 16 bits)


def remover_fundo(img: Image.Image) -> Image.Image:
    """Devolve RGBA sem o fundo de cor lisa (detectado pelas bordas)."""
    img = img.convert("RGBA")
    a = np.asarray(img).astype(np.float32)
    borda = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    if np.median(borda[:, 3]) < 20:          # já é transparente
        return img
    cor = np.median(borda[:, :3], axis=0)
    dist = np.sqrt(((a[:, :, :3] - cor) ** 2).sum(axis=2))
    t0, t1 = 38.0, 95.0
    alfa = np.clip((dist - t0) / (t1 - t0), 0, 1)
    # tira o "vazamento" da cor do fundo nas bordas suaves
    canal = int(np.argmax(cor))
    if cor[canal] > 150 and cor[canal] - np.sort(cor)[1] > 60:
        outros = [c for c in range(3) if c != canal]
        limite = a[:, :, outros].max(axis=2)
        semi = alfa < 0.98
        a[:, :, canal] = np.where(semi, np.minimum(a[:, :, canal], limite), a[:, :, canal])
    a[:, :, 3] = alfa * 255
    return Image.fromarray(a.clip(0, 255).astype(np.uint8), "RGBA")


def cortar(img: Image.Image) -> Image.Image:
    alfa = np.asarray(img)[:, :, 3]
    ys, xs = np.where(alfa > 25)
    if len(xs) == 0:
        return img
    return img.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))


def ancora_pes(img: Image.Image) -> float:
    """x do centro dos pés: média das colunas opacas no quarto de baixo."""
    alfa = np.asarray(img)[:, :, 3].astype(np.float32)
    h = alfa.shape[0]
    baixo = alfa[int(h * 0.75):]
    pesos = baixo.sum(axis=0)
    if pesos.sum() == 0:
        return img.width / 2
    return float((pesos * np.arange(len(pesos))).sum() / pesos.sum())


def empacotar(quadros: list[tuple[str, Image.Image]], largura_max=2048, margem=2):
    """Empacota imagens em prateleiras. Devolve (folha, {nome: (x, y, w, h)})."""
    pos, x, y, linha = {}, margem, margem, 0
    larg = 0
    for nome, im in quadros:
        if x + im.width + margem > largura_max:
            x, y, linha = margem, y + linha + margem, 0
        pos[nome] = (x, y, im.width, im.height)
        x += im.width + margem
        linha = max(linha, im.height)
        larg = max(larg, x)
    folha = Image.new("RGBA", (larg, y + linha + margem), (0, 0, 0, 0))
    for nome, im in quadros:
        px, py, _, _ = pos[nome]
        folha.paste(im, (px, py))
    return folha, pos


# ordem das poses numa folha mista (poses_folha.png)
ORDEM_POSES = ["parado_1", "correr_1", "correr_2", "correr_3", "correr_4", "pular_1", "cair_1",
               "espada_1", "espada_2", "poder_1", "dano_1"]


def chave_quadro(arq: Path):
    m = re.match(r"^([a-z]+)(?:_(\d+|folha))?$", arq.stem.lower())
    if not m or (m.group(1) not in ANIMS and m.group(1) != "poses"):
        return None
    if m.group(2) == "folha":
        return m.group(1), "folha"
    if m.group(1) == "poses":
        return None
    return m.group(1), int(m.group(2) or 1)


def _faixas(ocupado: np.ndarray, folga: int, minimo: int) -> list[tuple[int, int]]:
    """Trechos contínuos ocupados, unindo vãos menores que `folga`."""
    faixas, ini, vazio = [], None, 0
    for i, o in enumerate(ocupado):
        if o:
            if ini is None:
                ini = i
            vazio = 0
        elif ini is not None:
            vazio += 1
            if vazio >= folga:
                faixas.append((ini, i - vazio + 1)); ini, vazio = None, 0
    if ini is not None:
        faixas.append((ini, len(ocupado) - vazio))
    return [(a, b) for a, b in faixas if b - a >= minimo]


def separar_folha(img: Image.Image) -> list[Image.Image]:
    """Recorta as poses de uma folha (já sem fundo): linhas, depois colunas."""
    alfa = np.asarray(img)[:, :, 3] > 25
    h, w = alfa.shape
    pecas = []
    for y0, y1 in _faixas(alfa.any(axis=1), max(4, h // 60), max(8, h // 12)):
        faixa = alfa[y0:y1]
        for x0, x1 in _faixas(faixa.any(axis=0), max(4, w // 120), max(8, w // 40)):
            pecas.append(cortar(img.crop((x0, y0, x1, y1))))
    return pecas


def preparar_pixel(grupo: str, pasta: Path, ajustes: dict, gifs: list[Path]) -> dict | None:
    """Modo pixel: quadros dos GIFs sem redimensionar, caixa e âncora comuns."""
    from PIL import ImageSequence
    chave = f"{grupo}/{pasta.name}"
    anims: dict[str, list[Image.Image]] = {}
    for arq in gifs:
        anim = arq.stem.lower()
        quadros = [f.convert("RGBA") for f in ImageSequence.Iterator(Image.open(arq))]
        escolha = ajustes.get(f"{chave}/{anim}", {}).get("quadros")
        if escolha:
            quadros = [quadros[i - 1] for i in escolha if 0 < i <= len(quadros)]
        anims[anim] = quadros
    if not anims:
        return None
    # caixa comum a todos os quadros
    caixas = [np.where(np.asarray(q)[:, :, 3] > 0) for qs in anims.values() for q in qs]
    caixas = [(xs.min(), ys.min(), xs.max() + 1, ys.max() + 1) for ys, xs in caixas if len(xs)]
    x0 = min(c[0] for c in caixas); y0 = min(c[1] for c in caixas)
    x1 = max(c[2] for c in caixas); y1 = max(c[3] for c in caixas)
    # âncora: pés do primeiro quadro do parado (ou da primeira animação)
    base = (anims.get("parado") or next(iter(anims.values())))[0]
    alfa = np.asarray(base)[:, :, 3] > 0
    ys, xs = np.where(alfa)
    pe_y = ys.max() + 1
    altura_boneco = pe_y - ys.min()
    faixa = alfa[pe_y - max(2, altura_boneco // 4):pe_y]
    pesos = faixa.sum(axis=0)
    pe_x = float((pesos * np.arange(len(pesos))).sum() / max(1, pesos.sum())) + 0.5
    itens = []
    for anim, qs in anims.items():
        for i, q in enumerate(qs, 1):
            itens.append((anim, i, f"{anim}_{i}", q.crop((x0, y0, x1, y1))))
    folha, pos = empacotar([(n, im) for _, _, n, im in itens])
    saida = DESTINO / f"{chave}.png"
    saida.parent.mkdir(parents=True, exist_ok=True)
    folha.save(saida, optimize=True)
    quadros: dict[str, list] = {}
    for anim, _, nome, _ in itens:
        x, y, w, h = pos[nome]
        quadros.setdefault(anim, []).append([x, y, w, h, round(pe_x - x0, 1), float(pe_y - y0)])
    alvo = float(ajustes.get(chave, {}).get("altura", PIXEL_ALTURA))
    resumo = ", ".join(f"{a} {len(q)}" for a, q in quadros.items())
    print(f"  {chave} (pixel): {resumo} -> {saida.relative_to(RAIZ)} ({saida.stat().st_size // 1024} KB)")
    return {"tipo": "personagem", "pixel": True, "img": f"{chave}.png",
            "escala": round(alvo / altura_boneco, 4), "quadros": quadros}


def preparar_personagem(grupo: str, pasta: Path, ajustes: dict) -> dict | None:
    chave = f"{grupo}/{pasta.name}"
    gifs = [a for a in sorted(pasta.iterdir()) if a.suffix.lower() == ".gif" and a.stem.lower() in ANIMS]
    cfg = PERSONAGEM[grupo]
    altura_jogo = ALTURA_ESPECIFICA.get(chave, cfg["altura"])
    atlas_h = cfg["atlas"]
    # (anim, n, nome, imagem, referência de altura)
    brutos = []
    for arq in sorted(pasta.iterdir()):
        if arq.suffix.lower() not in EXTS:
            continue
        stem = arq.stem.lower()
        k = chave_quadro(arq)
        if stem == "poses_folha":
            pecas = separar_folha(remover_fundo(Image.open(arq)))
            ref = max(p.height for p in pecas) if pecas else 1
            if len(pecas) != len(ORDEM_POSES):
                print(f"  aviso: {arq.name} tem {len(pecas)} poses; esperava {len(ORDEM_POSES)} (uso as primeiras)")
            for nome, im in zip(ORDEM_POSES, pecas):
                a, n = nome.split("_")
                brutos.append((a, 200 + int(n), nome, im, ref))
            continue
        if not k:
            continue
        if k[1] == "folha":
            pecas = separar_folha(remover_fundo(Image.open(arq)))
            ref = max(p.height for p in pecas) if pecas else 1
            print(f"  {arq.name}: {len(pecas)} poses")
            for i, im in enumerate(pecas, 1):
                brutos.append((k[0], 100 + i, f"{k[0]}_f{i}", im, ref))
            continue
        im = cortar(remover_fundo(Image.open(arq)))
        brutos.append((k[0], k[1], stem, im, im.height))
    itens = []
    for anim, n, nome, im, ref in brutos:
        aj = ajustes.get(f"{chave}/{nome}", {})
        fator = atlas_h * float(aj.get("escala", 1)) / ref
        im = im.resize((max(1, round(im.width * fator)), max(1, round(im.height * fator))), Image.LANCZOS)
        ax = ancora_pes(im) - float(aj.get("dx", 0))
        ay = im.height - float(aj.get("dy", 0))
        itens.append(((anim, n), nome, im, ax, ay))
    retrato = None
    for arq in pasta.iterdir():
        if arq.stem.lower() == "retrato" and arq.suffix.lower() in EXTS:
            im = cortar(remover_fundo(Image.open(arq)))
            if im.height > 900:
                im = im.resize((max(1, round(im.width * 900 / im.height)), 900), Image.LANCZOS)
            retrato = f"{chave}_retrato.png"
            (DESTINO / retrato).parent.mkdir(parents=True, exist_ok=True)
            im.save(DESTINO / retrato, optimize=True)
            print(f"  {chave}: retrato -> jogo/sprites/{retrato}")
    if gifs:
        r = preparar_pixel(grupo, pasta, ajustes, gifs)
        if r and retrato:
            r["retrato"] = retrato
        return r
    if not itens:
        return {"tipo": "personagem", "retrato": retrato, "quadros": {}} if retrato else None
    folha, pos = empacotar([(nome, im) for _, nome, im, _, _ in itens])
    saida = DESTINO / f"{chave}.png"
    saida.parent.mkdir(parents=True, exist_ok=True)
    folha.save(saida, optimize=True)
    quadros: dict[str, list] = {}
    for (anim, n), nome, im, ax, ay in sorted(itens, key=lambda t: t[0]):
        x, y, w, h = pos[nome]
        quadros.setdefault(anim, []).append([x, y, w, h, round(ax, 1), round(ay, 1)])
    print(f"  {chave}: {len(itens)} quadros -> {saida.relative_to(RAIZ)} ({saida.stat().st_size // 1024} KB)")
    r = {"tipo": "personagem", "img": f"{chave}.png", "escala": round(altura_jogo / atlas_h, 4), "quadros": quadros}
    if retrato:
        r["retrato"] = retrato
    return r


def preparar_partes(pasta: Path) -> dict | None:
    chave = f"chefes/{pasta.name}"
    itens = []
    for arq in sorted(pasta.iterdir()):
        nome = arq.stem.lower()
        if arq.suffix.lower() not in EXTS or nome not in PARTES_LADO:
            continue
        im = cortar(remover_fundo(Image.open(arq)))
        lado = PARTES_LADO[nome]
        f = lado / max(im.width, im.height)
        itens.append((nome, im.resize((max(1, round(im.width * f)), max(1, round(im.height * f))), Image.LANCZOS)))
    if not itens:
        return None
    folha, pos = empacotar(itens)
    saida = DESTINO / f"{chave}.png"
    saida.parent.mkdir(parents=True, exist_ok=True)
    folha.save(saida, optimize=True)
    print(f"  {chave}: partes {', '.join(n for n, _ in itens)} -> {saida.relative_to(RAIZ)}")
    return {"tipo": "partes", "img": f"{chave}.png", "partes": {n: list(pos[n]) for n, _ in itens}}


def pixelizar(im: Image.Image, largura: int, altura: int, cores: int) -> Image.Image:
    """Reduz para a grade da pixel art (média de cada bloco), limita a paleta e deixa a
    transparência só ligada ou desligada."""
    tem_alfa = im.mode == "RGBA"
    # pré-multiplica a transparência para a cor do fundo removido não vazar na média dos blocos
    pequeno = (im.convert("RGBa").resize((largura, altura), Image.BOX).convert("RGBA") if tem_alfa
               else im.resize((largura, altura), Image.BOX))
    rgb = pequeno.convert("RGB").quantize(colors=cores, method=Image.Quantize.MEDIANCUT,
                                          dither=Image.Dither.NONE).convert("RGB")
    if not tem_alfa:
        return rgb
    alfa = pequeno.getchannel("A").point(lambda a: 255 if a >= 128 else 0)
    rgb.putalpha(alfa)
    return rgb


def _colunas(alfa: np.ndarray):
    """Para cada coluna: primeira e última linha opacas (-1 se a coluna é vazia)."""
    op = alfa > 0
    tem = op.any(axis=0)
    topo = np.where(tem, op.argmax(axis=0), -1)
    fundo = np.where(tem, op.shape[0] - 1 - op[::-1].argmax(axis=0), -1)
    return topo, fundo


def preparar_peca_arvore(nome: str, im: Image.Image, info: dict) -> tuple[Image.Image, int, int, dict]:
    """Mede e escala as peças da árvore para encaixarem. Devolve (imagem, largura, altura, meta)."""
    a = np.asarray(im)[:, :, 3]
    h, w = a.shape
    meta = {}
    if nome == "arvore_galho":
        topo, fundo = _colunas(a)
        # tira o pedaço de tronco grudado na esquerda (colunas que vão do alto ao pé da imagem)
        ini = 0
        while ini < w // 3 and (topo[ini] < 0 or topo[ini] < h * .08):
            ini += 1
        im = cortar(im.crop((ini, 0, w, h)))
        a = np.asarray(im)[:, :, 3]; h, w = a.shape
        topo, fundo = _colunas(a)
        meio = slice(int(w * .2), int(w * .7))
        t_med = float(np.median(topo[meio])); esp = float(np.median(fundo[meio] - topo[meio]))
        f = GALHO_ESPESSURA / max(1.0, esp)
        meta["topo"] = round(t_med * f, 1)                  # onde fica o topo do galho, em px da arte
    elif nome == "arvore_tronco":
        im = cortar(im)
        a = np.asarray(im)[:, :, 3]; h, w = a.shape
        larg = float(np.median((a > 0).sum(axis=1)))
        f = TRONCO_LARGURA / max(1.0, larg)
        info["tronco"] = True
    else:  # raiz: o tronco no alto da raiz tem de ter a largura do tronco
        im = cortar(im)
        a = np.asarray(im)[:, :, 3]; h, w = a.shape
        faixa = a[: max(2, int(h * .06))]
        larg = float(np.median((faixa > 0).sum(axis=1)))
        f = TRONCO_LARGURA / max(1.0, larg)
        # onde está o centro do tronco na raiz (fração da largura)
        cols = np.where((faixa > 0).any(axis=0))[0]
        meta["centro"] = round(float(cols.mean()) / w, 3) if len(cols) else .5
    return im, max(1, round(w * f)), max(1, round(h * f)), meta


def preparar_fundo(pasta: Path, ajustes: dict) -> dict | None:
    chave = f"fundos/{pasta.name}"
    camadas, metas, info = {}, {}, {}
    for arq in sorted(pasta.iterdir()):
        nome = arq.stem.lower()
        if arq.suffix.lower() not in EXTS or nome not in FUNDO_ALTURA:
            continue
        im = Image.open(arq)
        aj = ajustes.get(f"{chave}/{nome}", {})
        if aj.get("corteTopo"):            # ex.: tirar a crosta clara de cima do chão
            im = im.crop((0, round(im.height * float(aj["corteTopo"])), im.width, im.height))
        transparente = nome in ("longe", "perto") or nome.startswith("arvore_")
        if transparente:
            borda = np.concatenate([np.asarray(im.convert("RGB"))[0], np.asarray(im.convert("RGB"))[:, 0]])
            fundo_verde = int(np.argmax(np.median(borda, axis=0))) == 1
            im = remover_fundo(im)
            if fundo_verde:   # tira o halo verde que sobra nas bordas (o fundo verde exige arte sem verde)
                a = np.asarray(im).copy()
                a[:, :, 1] = np.minimum(a[:, :, 1], np.maximum(a[:, :, 0], a[:, :, 2]))
                # brilho (brasa) misturado com o verde vira amarelo-esverdeado: puxa para laranja
                r, g, bl = (a[:, :, i].astype(np.int32) for i in range(3))
                amarelado = (g > r * 0.8) & (g > bl + 30)
                a[:, :, 1] = np.where(amarelado, (r * 0.55).astype(np.uint8), a[:, :, 1])
                im = Image.fromarray(a, "RGBA")
        else:
            im = im.convert("RGB")
        if nome.startswith("arvore_"):
            im, largura, alvo, meta = preparar_peca_arvore(nome, im, info)
            if meta:
                metas[nome] = meta
        else:
            alvo = FUNDO_ALTURA[nome]
            largura = max(1, round(im.width * alvo / im.height))
        im = pixelizar(im, largura, alvo, int(aj.get("cores", FUNDO_CORES)))
        saida = DESTINO / chave / f"{nome}.png"
        saida.parent.mkdir(parents=True, exist_ok=True)
        im.save(saida, optimize=True)
        camadas[nome] = f"{chave}/{nome}.png"
        print(f"  {chave}/{nome}: {im.width}x{im.height} pixel ({saida.stat().st_size // 1024} KB)")
    if not camadas:
        return None
    r = {"tipo": "fundo", "pixel": FUNDO_PIXEL, "camadas": camadas}
    if metas:
        r["meta"] = metas
    return r


def main():
    if not ORIGEM.exists():
        print(f"Nada a fazer: crie {ORIGEM.relative_to(RAIZ)} com as imagens.")
        return
    ajustes_arq = ORIGEM / "ajustes.json"
    ajustes = json.loads(ajustes_arq.read_text(encoding="utf-8")) if ajustes_arq.exists() else {}
    saida: dict = {}
    for grupo in ("herois", "inimigos"):
        for pasta in sorted((ORIGEM / grupo).glob("*/")):
            r = preparar_personagem(grupo, pasta, ajustes)
            if r:
                saida[f"{grupo}/{pasta.name}"] = r
    for pasta in sorted((ORIGEM / "chefes").glob("*/")):
        r = preparar_partes(pasta)
        if r:
            saida[f"chefes/{pasta.name}"] = r
    for pasta in sorted((ORIGEM / "fundos").glob("*/")):
        r = preparar_fundo(pasta, ajustes)
        if r:
            saida[f"fundos/{pasta.name}"] = r
    DESTINO.mkdir(parents=True, exist_ok=True)
    (DESTINO / "sprites.json").write_text(json.dumps(saida, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"sprites.json: {len(saida)} itens ({', '.join(saida) or 'nenhum'})")


if __name__ == "__main__":
    main()
