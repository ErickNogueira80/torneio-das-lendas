"""Apaga textos claros que a IA escreveu por cima de uma imagem (ex.: nomes no mapa).

Dentro de cada caixa, os pixels claros e pouco coloridos (as letras) e uma pequena borda em volta
são preenchidos com a cor dos vizinhos, de fora para dentro. Funciona bem para letras brancas
sobre névoa, grama ou água. Gera uma cópia `<nome>_limpo.<ext>` (o original não muda).

Uso: python ferramentas/apagar_textos.py <imagem> x0,y0,x1,y1 [x0,y0,x1,y1 ...]
     (caixas em fração da imagem, de 0 a 1)
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


def apagar(im: Image.Image, caixas, limiar=170, borda=4) -> Image.Image:
    a = np.asarray(im.convert("RGB")).astype(np.float32)
    h, w, _ = a.shape
    for fx0, fy0, fx1, fy1 in caixas:
        x0, y0, x1, y1 = int(fx0 * w), int(fy0 * h), int(fx1 * w), int(fy1 * h)
        reg = a[y0:y1, x0:x1]
        lum = reg.mean(axis=2)
        sat = reg.max(axis=2) - reg.min(axis=2)
        mask = (lum > limiar) & (sat < 60)
        m = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(borda * 2 + 1))
        mask = np.asarray(m) > 0
        # preenche de fora para dentro com a média dos vizinhos já conhecidos
        conhecido = ~mask
        for _ in range(400):
            if conhecido.all():
                break
            soma = np.zeros_like(reg); n = np.zeros(mask.shape, np.float32)
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, -1), (1, -1), (-1, 1)):
                c = np.roll(conhecido, (dy, dx), axis=(0, 1)); v = np.roll(reg, (dy, dx), axis=(0, 1))
                soma += v * c[:, :, None]; n += c
            novo = (~conhecido) & (n > 0)
            reg[novo] = soma[novo] / n[novo][:, None]
            conhecido = conhecido | novo
        a[y0:y1, x0:x1] = reg
    return Image.fromarray(a.clip(0, 255).astype(np.uint8), "RGB")


if __name__ == "__main__":
    arq = Path(sys.argv[1])
    caixas = [tuple(float(v) for v in c.split(",")) for c in sys.argv[2:]]
    saida = arq.with_name(arq.stem + "_limpo" + arq.suffix)
    apagar(Image.open(arq), caixas).save(saida, quality=95)
    print("salvo", saida)
