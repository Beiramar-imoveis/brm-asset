#!/usr/bin/env python3
"""Gera o site estático (site/) a partir dos artboards exportados do design.

Os arquivos *.dc.html são a fonte da verdade visual. Este script:
- remove o runtime do editor (support.js, React, <x-dc>, <helmet>, script de lógica);
- troca {{accent}} pela variável CSS --accent;
- liga a navegação, o rodapé e os CTAs às páginas reais;
- torna a raiz fluida e acrescenta o CSS/JS compartilhados (site/css, site/js).

Uso: python3 tools/build_site.py
"""
import html
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "site"

# artboard exportado -> página publicada, título e descrição
PAGES = [
    ("Main.dc.html", "index.html", "BRM Asset — Investimentos imobiliários",
     "Gestora de investimentos imobiliários do Grupo Beiramar: fundos, crédito e desenvolvimento com 45 anos de lastro operacional."),
    ("Sobre — desktop-html/Sobre.dc.html", "sobre.html", "Sobre — BRM Asset",
     "Conheça a BRM Asset, gestora de investimentos do Grupo Beiramar."),
    ("Time — desktop-html/Time.dc.html", "time.html", "Time — BRM Asset",
     "O time de gestão, risco e relações com investidores da BRM Asset."),
    ("Fundos — desktop-html/Fundos.dc.html", "fundos.html", "Fundos — BRM Asset",
     "Uma tese para cada fase do ciclo imobiliário: conheça os fundos da BRM Asset."),
    ("Fundo BRM MCMV — desktop-html/Fundo-MCMV.dc.html", "fundo-mcmv.html", "BRM Minha Casa Minha Vida — BRM Asset",
     "BRM Minha Casa Minha Vida (MCMV11 · MCMV15): habitação econômica listada na B3."),
    ("Fundo BRM Multiestratégia — desktop-html/Fundo-BRME.dc.html", "fundo-brme.html", "BRM Multiestratégia — BRM Asset",
     "BRM Multiestratégia (BRME): fundo com foco em desenvolvimento imobiliário."),
    ("Fundo BRM Renda — desktop-html/Fundo-BRMR.dc.html", "fundo-brmr.html", "BRM Renda Imobiliária — BRM Asset",
     "BRM Renda Imobiliária (BRMR): fundo de tijolo com foco em renda."),
    ("Atuação — desktop-html/Atuacao.dc.html", "atuacao.html", "Atuação — BRM Asset",
     "Crédito imobiliário, desenvolvimento e ativos de renda: como a BRM Asset atua, projeto a projeto."),
    ("Governança e compliance — desktop-html/Governanca.dc.html", "governanca.html", "Governança e compliance — BRM Asset",
     "Políticas, códigos e documentos regulatórios da BRM Asset."),
    ("Contato — desktop-html/Contato.dc.html", "contato.html", "Contato — BRM Asset",
     "Fale com a BRM Asset: relações com investidores, originação e imprensa."),
]

# texto do link (início) -> destino. Vale em todas as páginas.
LINKS = [
    ("Início", "index.html"),
    ("Sobre", "sobre.html"),
    ("Quem somos", "sobre.html"),
    ("Time", "time.html"),
    ("Equipe", "time.html"),
    ("Ver o time", "time.html"),
    ("Fundos", "fundos.html"),
    ("Todos os fundos", "fundos.html"),
    ("Conheça os fundos", "fundos.html"),
    ("Investidores", "fundos.html"),
    ("Cotistas", "fundos.html"),
    ("BRM Minha Casa Minha Vida", "fundo-mcmv.html"),
    ("Listado na B3", "fundo-mcmv.html"),
    ("BRM E", "fundo-brme.html"),
    ("Em operação", "fundo-brme.html"),
    ("BRM Renda Imobiliária", "fundo-brmr.html"),
    ("Em oferta", "fundo-brmr.html"),
    ("Último relatório gerencial", "fundo-mcmv.html#documentos"),
    ("[Capa do relatório]", "fundo-mcmv.html#documentos"),
    ("Atuação", "atuacao.html"),
    ("Para incorporadores", "atuacao.html"),
    ("Incorporadores", "atuacao.html"),
    ("Ver portfólio completo", "atuacao.html#casos"),
    ("Ver todos", "atuacao.html#casos"),
    ("Compliance", "governanca.html"),
    ("Governança e documentos", "governanca.html"),
    ("Governança", "governanca.html"),
    ("Documentos regulatórios", "governanca.html#documentos"),
    ("Contato", "contato.html"),
    ("Fale conosco", "contato.html"),
    ("Relações com Investidores", "contato.html"),
    ("Originação", "contato.html"),
    ("Imprensa", "contato.html"),
    ("Trabalhe conosco", "contato.html"),
    ("Apresentar meu ativo", "contato.html"),
    ("Quero me cadastrar", "contato.html"),
]

FUND_PAGES = {"MCMV": "fundo-mcmv.html", "BRME": "fundo-brme.html", "BRMR": "fundo-brmr.html"}

MENU_BUTTON = (
    '<button type="button" class="nav-toggle" aria-label="Abrir menu" aria-expanded="false">'
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
    'stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg></button>'
)

HEAD = """<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- Versão de homologação: remover a linha abaixo quando o site for lançado oficialmente -->
<meta name="robots" content="noindex, nofollow">
<title>{title}</title>
<meta name="description" content="{description}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:type" content="website">
<meta name="theme-color" content="#001320">
<link rel="icon" href="assets/b9aa13954b6f1b31a604e8f3e4acaa19.png">
<link rel="preload" href="assets/40ea351c1d5a4f58ed00dfacc27c9f12.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="css/site.css">
<script>if(!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("motion")</script>
<script src="js/site.js" defer></script>
</head>
<body>
"""


def link_text(inner):
    text = re.sub(r"<[^>]+>", " ", inner)
    return " ".join(html.unescape(text).split())


def resolve(text, before, page):
    if text == "":  # logotipo
        return "index.html"
    if text.startswith("Ver ficha completa"):
        codes = [(before.rfind(code), url) for code, url in FUND_PAGES.items()]
        pos, url = max(codes)
        return url if pos >= 0 else None
    if text.startswith("Fundo: [a definir]") and page != "atuacao.html":
        return "atuacao.html#casos"
    for prefix, url in LINKS:
        if text == prefix or text.startswith(prefix + " ") or (len(prefix) > 12 and text.startswith(prefix)):
            return url
    return None


def wire_links(body, page):
    def repl(m):
        attrs, inner = m.group(1), m.group(2)
        url = resolve(link_text(inner), body[max(0, m.start() - 4000):m.start()], page) or "#"
        return f'<a href="{url}"{attrs}>{inner}</a>'
    return re.sub(r'<a href="#"([^>]*)>(.*?)</a>', repl, body, flags=re.S)


def convert(src, page, title, description):
    s = src.read_text(encoding="utf-8")
    body = s[s.index("</helmet>") + len("</helmet>"):s.index("</x-dc>")].strip()

    # raiz fluida em vez do artboard fixo de 1440 × N px
    body = re.sub(r'^<div style="width: 1440px; height: \d+px; ', '<div class="page" style="', body, count=1)
    # a primeira seção (com o cabeçalho) é o hero
    body = body.replace("<section style=", '<section class="hero" style=', 1)
    body = body.replace("{{accent}}", "var(--accent)")
    body = body.replace('src="./assets/', 'src="assets/')
    # botão de menu para telas estreitas
    body = body.replace("</nav>", "</nav>" + MENU_BUTTON, 1)
    body = wire_links(body, page)

    # "Casos selecionados." vira âncora para os links de portfólio
    if page == "atuacao.html":
        body = re.sub(r'(<section)( [^>]*>\s*(?:<div[^>]*>\s*)*(?:<span[^>]*>[^<]*</span>\s*)?<h2[^>]*>Casos selecionados)',
                      r'\1 id="casos"\2', body, count=1)

    out = HEAD.format(title=html.escape(title), description=html.escape(description)) + body + "\n</body>\n</html>\n"
    (OUT / page).write_text(out, encoding="utf-8")
    left = len(re.findall(r'href="#"', out))
    print(f"{page:18} <- {src.relative_to(ROOT)}  ({left} links sem destino)")


def main():
    (OUT / "assets").mkdir(parents=True, exist_ok=True)
    for asset in ROOT.glob("**/assets/*"):
        if OUT in asset.parents:
            continue
        target = OUT / "assets" / asset.name
        if not target.exists():
            shutil.copy2(asset, target)
    for src, page, title, description in PAGES:
        convert(ROOT / src, page, title, description)


if __name__ == "__main__":
    main()
