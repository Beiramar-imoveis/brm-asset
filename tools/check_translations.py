#!/usr/bin/env python3
"""Lista os textos do site que ainda não têm tradução em site/js/i18n-en.js.

Uso: python3 tools/check_translations.py

Textos que não se traduzem (nomes próprios, siglas, endereços) ficam em
tools/translation-ignore.txt e não entram na lista.

Opções usadas pelo alerta automático do GitHub (.github/workflows/traducoes.yml):
  --github   aponta cada texto sem tradução no arquivo da página e escreve o resumo da execução
  --strict   termina com erro quando houver texto sem tradução
"""
import json
import os
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "site"
DICTIONARY = SITE / "js" / "i18n-en.js"
IGNORE = ROOT / "tools" / "translation-ignore.txt"
ATTRS = ("alt", "aria-label", "placeholder", "title")


class Texts(HTMLParser):
    def __init__(self):
        super().__init__()
        self.skip = 0
        self.found = {}  # texto -> primeira linha em que aparece

    def add(self, text):
        self.found.setdefault(text, self.getpos()[0])

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style"):
            self.skip += 1
        attrs = dict(attrs)
        for name in ATTRS:
            if (attrs.get(name) or "").strip():
                self.add(" ".join(attrs[name].split()))
        if tag == "meta" and attrs.get("name") == "description":
            self.add(attrs.get("content", ""))

    def handle_endtag(self, tag):
        if tag in ("script", "style"):
            self.skip -= 1

    def handle_data(self, data):
        text = " ".join(data.split())
        if not self.skip and re.search(r"[A-Za-zÀ-ú]", text):
            self.add(text)


def load_dictionary():
    source = DICTIONARY.read_text(encoding="utf-8")
    body = source[source.index("{"):source.rindex("}") + 1]
    body = re.sub(r"^\s*//.*$", "", body, flags=re.M)
    body = re.sub(r",(\s*})", r"\1", body)
    return json.loads(body)


def load_ignore():
    if not IGNORE.exists():
        return set()
    lines = IGNORE.read_text(encoding="utf-8").splitlines()
    return {" ".join(l.split()) for l in lines if l.strip() and not l.lstrip().startswith("#")}


def summary(lines):
    path = os.environ.get("GITHUB_STEP_SUMMARY")
    if path:
        with open(path, "a", encoding="utf-8") as f:
            f.write("\n".join(lines) + "\n")


def main():
    github = "--github" in sys.argv
    strict = "--strict" in sys.argv

    try:
        dictionary = load_dictionary()
    except (ValueError, json.JSONDecodeError) as e:
        message = f"O arquivo de traduções tem um erro de digitação e não pôde ser lido ({e})."
        if github:
            print(f"::error file=site/js/i18n-en.js::{message}")
            summary(["## ❌ Verificar traduções", "", message,
                     "Confira aspas, dois-pontos e a vírgula no fim de cada linha de `site/js/i18n-en.js`."])
        else:
            print(message)
        sys.exit(1)

    ignore = load_ignore()
    missing = {}
    for page in sorted(SITE.glob("*.html")):
        parser = Texts()
        parser.feed(page.read_text(encoding="utf-8"))
        for text, line in parser.found.items():
            if text not in dictionary and text not in ignore:
                missing.setdefault(text, []).append((page.name, line))

    for text in sorted(missing):
        pages = ", ".join(name for name, _ in missing[text])
        print(f"{text}    [{pages}]")
        if github:
            for name, line in missing[text]:
                print(f"::error file=site/{name},line={line},title=Texto sem tradução::\"{text}\" não está em site/js/i18n-en.js")
    print(f"\n{len(missing)} textos sem tradução · {len(dictionary)} traduções no dicionário · {len(ignore)} exceções")

    if github:
        if missing:
            rows = ["| " + t.replace("|", "\\|") + " | " + ", ".join(n for n, _ in missing[t]) + " |" for t in sorted(missing)]
            summary(["## ❌ Textos sem tradução para o inglês", "",
                     "Inclua cada texto abaixo em `site/js/i18n-en.js`, no formato `\"texto em português\": \"texto em inglês\",`.",
                     "Se o texto não deve ser traduzido (nome próprio, sigla, endereço), inclua-o em `tools/translation-ignore.txt`.", "",
                     "| Texto | Página |", "| --- | --- |", *rows])
        else:
            summary(["## ✅ Todos os textos do site têm tradução para o inglês", "",
                     f"{len(dictionary)} traduções no dicionário · {len(ignore)} exceções"])

    if strict and missing:
        sys.exit(1)


if __name__ == "__main__":
    main()
