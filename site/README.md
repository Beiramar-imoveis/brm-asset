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

**A pasta `site/` é a fonte oficial do site.** Edite as páginas diretamente aqui (VS Code + Live Server).

⚠️ Não rode mais `tools/build_site.py`: ele recria as páginas a partir dos arquivos do design e apagaria
as edições feitas direto em `site/` (fotos dos empreendimentos, carrossel e ajustes manuais).
Ele fica no repositório só como histórico da conversão inicial.

Ajustes de base, cores (`--accent`, `--blue`…) e adaptação a tablet/celular ficam em `site/css/site.css`.

## Fotos dos empreendimentos

Em `site/assets/`, em WebP com até 1600 px (cada uma com 100–350 KB). Para trocar ou incluir uma foto,
otimize antes de subir (ex.: squoosh.app → WebP, qualidade 80, largura 1600) e mantenha o nome do
empreendimento no arquivo (`casa-pedra.webp`).

## Carrossel da Home

Troca a cada 7 s, com aproximação lenta da foto. Pausa com o mouse em cima, fora da tela ou com a aba em
segundo plano; aceita setas, pontos, miniaturas e deslizar no celular. As miniaturas são fixas (uma por
ativo, na mesma ordem dos slides, com `data-index`); a do ativo em destaque fica realçada. Para mudar o tempo, altere `7s`
em `.slide-dot.is-active span::after` no `site.css`. Os ativos ficam em `site/index.html` (`slide-photo`).

## Versão em inglês (PT · EN)

O HTML de cada página continua só em português. As traduções ficam em `site/js/i18n-en.js`, uma linha
por texto: `"texto em português": "texto em inglês"`.

- O botão PT · EN do cabeçalho (e do menu no celular) troca o idioma na hora; a escolha vale para todas
  as páginas. Um link com `?lang=en` (ex.: `…/index.html?lang=en`) abre o site direto em inglês.
- **Ao mudar ou incluir um texto em português, atualize o `i18n-en.js`.** O que não estiver lá continua
  aparecendo em português na versão em inglês.
- Para conferir o que falta traduzir: `python3 tools/check_translations.py`. Nomes próprios, siglas e
  endereços aparecem na lista, mas não precisam de tradução.
- Os avisos legais em inglês precisam da mesma validação de Compliance que os textos em português.

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
- Foto do Jardins do Cerrado (Atuação) e selos "Fundo: [a definir]" dos empreendimentos.
- O design só tem versões desktop: a adaptação para tablet e celular foi feita no CSS.
