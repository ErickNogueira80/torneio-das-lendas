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
Arquivos com outros nomes (ex.: retrato.png) são ignorados.
Aceita .png, .jpg, .jpeg e .webp. O fundo é detectado pela cor das bordas da imagem; se a
imagem já vier com transparência, ela é mantida.

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
ANIMS = ["parado", "correr", "pular", "cair", "espada", "poder", "dano", "andar", "voar"]

# altura no jogo (px da tela virtual 960x540) e altura na folha (resolução guardada)
PERSONAGEM = {
    "herois": {"altura": 72, "atlas": 192},
    "inimigos": {"altura": 44, "atlas": 112},
}
ALTURA_ESPECIFICA = {"inimigos/vagalume": 34}
PARTES_LADO = {"cabeca": 256, "gomo": 160, "rabo": 128}   # maior lado de cada parte na folha
FUNDO_ALTURA = {"ceu": 810, "longe": 540, "perto": 630, "chao": 256}


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


def chave_quadro(arq: Path):
    m = re.match(r"^([a-z]+)(?:_(\d+))?$", arq.stem.lower())
    if not m or m.group(1) not in ANIMS:
        return None
    return m.group(1), int(m.group(2) or 1)


def preparar_personagem(grupo: str, pasta: Path, ajustes: dict) -> dict | None:
    chave = f"{grupo}/{pasta.name}"
    cfg = PERSONAGEM[grupo]
    altura_jogo = ALTURA_ESPECIFICA.get(chave, cfg["altura"])
    atlas_h = cfg["atlas"]
    itens = []
    for arq in sorted(pasta.iterdir()):
        if arq.suffix.lower() not in EXTS:
            continue
        k = chave_quadro(arq)
        if not k:
            continue
        im = cortar(remover_fundo(Image.open(arq)))
        aj = ajustes.get(f"{chave}/{arq.stem.lower()}", {})
        alvo = atlas_h * float(aj.get("escala", 1))
        fator = alvo / im.height
        im = im.resize((max(1, round(im.width * fator)), max(1, round(alvo))), Image.LANCZOS)
        ax = ancora_pes(im) - float(aj.get("dx", 0))
        ay = im.height - float(aj.get("dy", 0))
        itens.append((k, arq.stem.lower(), im, ax, ay))
    if not itens:
        return None
    folha, pos = empacotar([(nome, im) for _, nome, im, _, _ in itens])
    saida = DESTINO / f"{chave}.png"
    saida.parent.mkdir(parents=True, exist_ok=True)
    folha.save(saida, optimize=True)
    quadros: dict[str, list] = {}
    for (anim, n), nome, im, ax, ay in sorted(itens, key=lambda t: t[0]):
        x, y, w, h = pos[nome]
        quadros.setdefault(anim, []).append([x, y, w, h, round(ax, 1), round(ay, 1)])
    print(f"  {chave}: {len(itens)} quadros -> {saida.relative_to(RAIZ)} ({saida.stat().st_size // 1024} KB)")
    return {"tipo": "personagem", "img": f"{chave}.png", "escala": round(altura_jogo / atlas_h, 4), "quadros": quadros}


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


def preparar_fundo(pasta: Path) -> dict | None:
    chave = f"fundos/{pasta.name}"
    camadas = {}
    for arq in sorted(pasta.iterdir()):
        nome = arq.stem.lower()
        if arq.suffix.lower() not in EXTS or nome not in FUNDO_ALTURA:
            continue
        im = Image.open(arq)
        alvo = FUNDO_ALTURA[nome]
        transparente = nome in ("longe", "perto")
        im = remover_fundo(im) if transparente else im.convert("RGB")
        f = alvo / im.height
        im = im.resize((max(1, round(im.width * f)), alvo), Image.LANCZOS)
        ext = "png" if transparente else "jpg"
        saida = DESTINO / chave / f"{nome}.{ext}"
        saida.parent.mkdir(parents=True, exist_ok=True)
        if ext == "jpg":
            im.save(saida, "JPEG", quality=84, optimize=True, progressive=True)
        else:
            im.save(saida, optimize=True)
        camadas[nome] = f"{chave}/{nome}.{ext}"
        print(f"  {chave}/{nome}: {im.width}x{im.height} ({saida.stat().st_size // 1024} KB)")
    return {"tipo": "fundo", "camadas": camadas} if camadas else None


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
        r = preparar_fundo(pasta)
        if r:
            saida[f"fundos/{pasta.name}"] = r
    DESTINO.mkdir(parents=True, exist_ok=True)
    (DESTINO / "sprites.json").write_text(json.dumps(saida, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"sprites.json: {len(saida)} itens ({', '.join(saida) or 'nenhum'})")


if __name__ == "__main__":
    main()
