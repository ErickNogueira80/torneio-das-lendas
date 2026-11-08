"""Gera as versões web das imagens do portal.

Lê as imagens geradas em `img/local` e `img/bestiario` (originais grandes, fora do git) e grava
cópias menores em `web/locais` e `web/bestiario`, com nomes sem espaço.

Uso (na raiz do projeto): python ferramentas/otimizar_imagens.py
"""
from pathlib import Path
import re
import unicodedata

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
PARES = [("img/local", "web/locais"), ("img/bestiario", "web/bestiario")]
LADO_MAX = 1600


def nome_web(nome: str) -> str:
    base = unicodedata.normalize("NFKD", Path(nome).stem).encode("ascii", "ignore").decode()
    base = re.sub(r"[^a-zA-Z0-9]+", "-", base).strip("-").lower()
    return base + ".jpg"


for origem, destino in PARES:
    pasta_destino = RAIZ / destino
    pasta_destino.mkdir(parents=True, exist_ok=True)
    for arq in sorted((RAIZ / origem).glob("*")):
        if arq.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
            continue
        img = Image.open(arq).convert("RGB")
        img.thumbnail((LADO_MAX, LADO_MAX))
        saida = pasta_destino / nome_web(arq.name)
        img.save(saida, "JPEG", quality=82, optimize=True, progressive=True)
        print(f"{arq.name} -> {saida.relative_to(RAIZ)} ({saida.stat().st_size // 1024} KB)")
