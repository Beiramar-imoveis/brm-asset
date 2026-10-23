# Site BRM Asset

Site estático gerado a partir dos artboards do design (`*.dc.html` na raiz e nas pastas `* — desktop-html/`).

| Página | Arquivo |
| --- | --- |
| Home | `index.html` |
| Sobre | `sobre.html` |
| Time | `time.html` |
| Fundos | `fundos.html` |
| BRM Minha Casa Minha Vida | `fundo-mcmv.html` |
| BRM Multiestratégia | `fundo-brme.html` |
| BRM Renda Imobiliária | `fundo-brmr.html` |
| Atuação | `atuacao.html` |
| Governança e compliance | `governanca.html` |
| Contato | `contato.html` |

## Como atualizar

1. Exporte o artboard alterado do design e substitua o `.dc.html` correspondente no repositório.
2. Rode `python3 tools/build_site.py` (sem dependências). As páginas em `site/` são regeneradas e
   os links de navegação, rodapé e CTAs são ligados automaticamente.
3. Ajustes de base, cor de destaque (`--accent`) e adaptação a tablet/celular ficam em `site/css/site.css`.

## Animações

Ficam em `site/js/site.js` e no fim de `site/css/site.css`, no mesmo vocabulário do site do Grupo Beiramar:
entrada em sequência no topo, revelação ao rolar, cabeçalho compacto fixo, barra de progresso, contagem dos
números, hover em botões, cartões e fotos, e transição entre páginas. Quem configura o sistema para
"reduzir movimento" vê o site sem animações.

## Bloqueio do Google (versão de homologação)

Todas as páginas têm `<meta name="robots" content="noindex, nofollow">` (definido em `tools/build_site.py`).
No lançamento oficial: remover essa linha do script, rodar o build e apagar `site/robots.txt`.

## Visualizar

```sh
cd site && python3 -m http.server
```

## Pendências de conteúdo

- PDFs dos fundos, notícias, Política de Privacidade, Termos de Uso e Cookies ainda apontam para `#`.
- O formulário de contato não tem envio configurado (precisa de backend ou serviço de formulários).
- Fotos dos ativos e o carrossel da Home estão como marcadores do design.
- O design só tem versões desktop: a adaptação para tablet e celular foi feita no CSS.
