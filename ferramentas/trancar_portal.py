"""Tranca o portal com senha.

Lê `fonte/portal.html` (o portal de verdade, que é onde se edita) e grava `index.html`: uma
página que pede a senha e só então decifra e mostra o portal (AES-GCM, chave derivada da senha
com PBKDF2-SHA256). Sem a senha, quem abre o site (ou o código da página) não vê nada do portal.

Uso (na raiz do projeto):
    python ferramentas/trancar_portal.py            # pergunta a senha
    PORTAL_SENHA=... python ferramentas/trancar_portal.py

Rodar de novo toda vez que mudar `fonte/portal.html`. Proteção contra curiosos: o repositório é
público (decisão do Erick, 2026-11-22), então os arquivos `.md`, as imagens e a própria
`fonte/portal.html` continuam acessíveis para quem souber o endereço.
"""
import base64
import getpass
import os
from pathlib import Path

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

RAIZ = Path(__file__).resolve().parent.parent
ITER = 250_000

senha = os.environ.get("PORTAL_SENHA") or getpass.getpass("Senha do portal: ")
html = (RAIZ / "fonte" / "portal.html").read_text(encoding="utf-8")
sal, iv = os.urandom(16), os.urandom(12)
chave = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=sal, iterations=ITER).derive(senha.encode("utf-8"))
cifra = AESGCM(chave).encrypt(iv, html.encode("utf-8"), None)
b64 = lambda b: base64.b64encode(b).decode()

pagina = """<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Torneio das Lendas</title>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Crimson+Pro:wght@400;600&display=swap" rel="stylesheet">
<style>
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at top,#2a2040 0%,#120e1a 60%) fixed,#120e1a;color:#ece4d4;font-family:'Crimson Pro',Georgia,serif;font-size:19px;padding:16px;box-sizing:border-box}
form{text-align:center;max-width:360px;width:100%}
h1{font-family:Cinzel,serif;color:#e3b75a;font-size:24px;letter-spacing:.06em;margin:0 0 6px}
p{color:#b3a88f;margin:0 0 18px}
input{font:inherit;width:100%;box-sizing:border-box;padding:10px 12px;border-radius:10px;border:1px solid #3a2f4a;background:#1c1626;color:#ece4d4;margin-bottom:12px}
button{font:inherit;font-weight:600;border:0;border-radius:999px;background:#e3b75a;color:#1b1408;padding:9px 26px;cursor:pointer}
#erro{color:#e08a7a;min-height:1.4em;margin-top:10px}
</style>
</head>
<body>
<form id="f"><h1>✦ Torneio das Lendas</h1><p>Área da mestre</p>
<input type="password" id="s" placeholder="Senha" autocomplete="current-password" autofocus>
<button>Entrar</button><div id="erro"></div></form>
<script>
(function () {
  var D = { sal: '%SAL%', iv: '%IV%', it: %ITER%, c: '%CIFRA%' };
  var bin = function (b) { return Uint8Array.from(atob(b), function (c) { return c.charCodeAt(0); }); };
  function abrir(senha) {
    var enc = new TextEncoder();
    return crypto.subtle.importKey('raw', enc.encode(senha), 'PBKDF2', false, ['deriveKey'])
      .then(function (k) { return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: bin(D.sal), iterations: D.it, hash: 'SHA-256' }, k, { name: 'AES-GCM', length: 256 }, false, ['decrypt']); })
      .then(function (k) { return crypto.subtle.decrypt({ name: 'AES-GCM', iv: bin(D.iv) }, k, bin(D.c)); })
      .then(function (buf) {
        try { localStorage.setItem('tdl_portal', senha); } catch (e) {}
        var html = new TextDecoder().decode(buf);
        document.open(); document.write(html); document.close();
      });
  }
  var guardada = null;
  try { guardada = localStorage.getItem('tdl_portal'); } catch (e) {}
  if (guardada) abrir(guardada).catch(function () { try { localStorage.removeItem('tdl_portal'); } catch (e) {} });
  document.getElementById('f').addEventListener('submit', function (e) {
    e.preventDefault();
    document.getElementById('erro').textContent = 'Abrindo…';
    abrir(document.getElementById('s').value).catch(function () { document.getElementById('erro').textContent = 'Senha errada.'; });
  });
})();
</script>
</body>
</html>
"""
pagina = (pagina.replace("%SAL%", b64(sal)).replace("%IV%", b64(iv)).replace("%ITER%", str(ITER))
          .replace("%CIFRA%", b64(cifra)))
(RAIZ / "index.html").write_text(pagina, encoding="utf-8", newline="\n")
print(f"index.html trancado ({len(pagina) // 1024} KB)")
