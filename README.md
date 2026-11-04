# Site BRM Asset

https://brmasset.com.br

Site estático da BRM Asset. As páginas publicadas ficam na pasta `site/`.

| Página | Arquivo | Endereço |
| --- | --- | --- |
| Home | `site/index.html` | `/` |
| Sobre | `site/sobre.html` | `/sobre` |
| Time | `site/time.html` | `/time` |
| Fundos | `site/fundos.html` | `/fundos` |
| BRM Minha Casa Minha Vida | `site/fundo-mcmv.html` | `/fundo-mcmv` |
| BRM Multiestratégia | `site/fundo-brme.html` | `/fundo-brme` |
| BRM Renda Imobiliária | `site/fundo-brmr.html` | `/fundo-brmr` |
| Atuação | `site/atuacao.html` | `/atuacao` |
| Governança e compliance | `site/governanca.html` | `/governanca` |
| Contato | `site/contato.html` | `/contato` |
| Política de Privacidade | `site/politica-de-privacidade.html` | `/politica-de-privacidade` |
| Termos de Uso | `site/termos-de-uso.html` | `/termos-de-uso` |
| Política de Cookies | `site/cookies.html` | `/cookies` |

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

## Privacidade e cookies (LGPD)

- **Aviso de cookies:** aparece na primeira visita, com "Aceitar todos", "Rejeitar opcionais" e
  "Personalizar". A escolha fica salva por 12 meses (`brm-consent`). O código está em `site/js/cookies.js`.
- **Reabrir as preferências:** qualquer elemento com o atributo `data-cookie-preferences` abre o painel
  (há um botão na página de Cookies).
- **Adicionar uma ferramenta de análise ou marketing** (Google Analytics, Meta Pixel etc.): ela só pode rodar
  com consentimento. Coloque o script no `<head>` assim, e o `cookies.js` ativa só para quem autorizou:

  ```html
  <script type="text/plain" data-cookie-category="analytics" data-src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"></script>
  <script type="text/plain" data-cookie-category="analytics">/* configuração da ferramenta */</script>
  ```

  Use `analytics` ou `marketing`. **Ao adicionar uma ferramenta, inclua-a na tabela da Política de Cookies**
  (`site/cookies.html`). Se usar o Google Consent Mode, o `cookies.js` já envia as atualizações de
  consentimento ao `gtag`.
- **Dados a preencher nas políticas:** CNPJ da BRM Asset e nome e e-mail do encarregado (DPO), marcados
  entre colchetes em `site/politica-de-privacidade.html` e `site/termos-de-uso.html`.

## Animações

Ficam em `site/js/site.js` e no fim de `site/css/site.css`, no mesmo vocabulário do site do Grupo Beiramar:
entrada em sequência no topo, revelação ao rolar, cabeçalho compacto fixo, barra de progresso, contagem dos
números, hover em botões, cartões e fotos, e transição entre páginas. Quem configura o sistema para
"reduzir movimento" vê o site sem animações.

## Publicação e indexação no Google

- **Endereço oficial:** https://brmasset.com.br, hospedado na Hostinger com implantação a partir da branch
  `main`. O `.htaccess` na raiz do repositório serve a pasta `site/` no endereço principal, com endereços
  limpos (`/sobre`, `/fundos`) e redirecionamento dos antigos (`/site/…`, `….html`).
- Qualquer ajuste no `.htaccess` deve ser feito no repositório, não direto no servidor.
- Cada página tem `<link rel="canonical">` apontando para o endereço oficial, então a cópia no GitHub Pages
  (beiramar-imoveis.github.io/brm-asset) não compete com o domínio nas buscas.
- `site/robots.txt` libera a indexação e indica o `site/sitemap.xml`. **Ao criar ou remover uma página,
  atualize o sitemap.**
- A Home traz os dados da empresa para o Google (bloco `application/ld+json`): nome, endereço, logo e
  redes sociais.

## Visualizar

```sh
cd site && python3 -m http.server
```

## Referência do design

Os arquivos `*.dc.html` na raiz e nas pastas `* — desktop-html/` são as exportações originais do design,
usadas só como referência (ver `docs/referencia-design.md`). Não são publicados.

## Pendências de conteúdo

- PDFs dos fundos e notícias ainda apontam para `#`.
- Políticas: preencher CNPJ e encarregado (DPO) e validar os textos com o Jurídico/Compliance.
- O formulário de contato não tem envio configurado (precisa de backend ou serviço de formulários).
- Foto do Jardins do Cerrado (Atuação) e selos "Fundo: [a definir]" dos empreendimentos.
- O design só tem versões desktop: a adaptação para tablet e celular foi feita no CSS.
