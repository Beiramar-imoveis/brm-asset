#!/usr/bin/env python3
"""Lista os textos do site que ainda não têm tradução em site/js/i18n-en.js.

Uso: python3 tools/check_translations.py

Nomes próprios, siglas e números aparecem na lista mas não precisam de tradução:
o site mantém em português tudo o que não estiver no arquivo.
"""
import json
import re
from html.parser import HTMLParser
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent / "site"
ATTRS = ("alt", "aria-label", "placeholder", "title")


class Texts(HTMLParser):
    def __init__(self):
        super().__init__()
        self.skip = 0
        self.found = set()

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style"):
            self.skip += 1
        attrs = dict(attrs)
        for name in ATTRS:
            if attrs.get(name, "").strip():
                self.found.add(" ".join(attrs[name].split()))
        if tag == "meta" and attrs.get("name") == "description":
            self.found.add(attrs.get("content", ""))

    def handle_endtag(self, tag):
        if tag in ("script", "style"):
            self.skip -= 1

    def handle_data(self, data):
        text = " ".join(data.split())
        if not self.skip and re.search(r"[A-Za-zÀ-ú]", text):
            self.found.add(text)


def load_dictionary():
    source = (SITE / "js" / "i18n-en.js").read_text(encoding="utf-8")
    body = source[source.index("{"):source.rindex("}") + 1]
    body = re.sub(r"^\s*//.*$", "", body, flags=re.M)
    body = re.sub(r",(\s*})", r"\1", body)
    return json.loads(body)


def main():
    dictionary = load_dictionary()
    missing = {}
    for page in sorted(SITE.glob("*.html")):
        parser = Texts()
        parser.feed(page.read_text(encoding="utf-8"))
        for text in parser.found - dictionary.keys():
            missing.setdefault(text, []).append(page.name)
    for text in sorted(missing):
        print(f"{text}    [{', '.join(missing[text])}]")
    print(f"\n{len(missing)} textos sem tradução · {len(dictionary)} traduções no dicionário")


if __name__ == "__main__":
    main()
