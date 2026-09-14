# MindTax — Módulo CBS (molde de norma + dados)

Este pacote separa **MOLDE** (o layout, feito uma vez) de **DADOS** (cada norma).
Assim, LC 214, CBS, IBS... usam o MESMO renderizador; só muda o arquivo `.json`.

## Arquivos

```
mindtax-cbs/
├─ cbs-preview.html     → AUTÔNOMO (arts. 1º a 4º reais embutidos).
│                         Abre por DUPLO CLIQUE. Use para validar o visual.
├─ cbs.html             → Módulo CBS real (lê leis/cbs_completo.json via fetch).
│                         Requer servidor (GitHub Pages / Live Server).
└─ assets/
   ├─ norma.css         → O MOLDE (estilo Planalto). Reutilizável por todas as normas.
   └─ norma-render.js   → O MOTOR do molde (parser + hierarquia + referência LC 214).
```

## Como usar a versão real (servidor)

1. Coloque o seu `cbs_completo.json` em uma pasta `leis/` ao lado do `cbs.html`.
2. Suba tudo no GitHub Pages (ou rode Live Server).
3. Acesse `cbs.html`.

O motor lê o JSON **no formato que você já extraiu** (campos `artigo`,
`hierarquia`, `texto`, `referencias_lc214`). Nada precisa ser refeito à mão.

## O que o molde faz automaticamente

- Converte o texto em Artigo / Inciso / Alínea / Item / Parágrafo (layout Planalto).
- Mostra os cabeçalhos LIVRO / TÍTULO / CAPÍTULO / Seção / Subseção só quando mudam.
- Ignora entradas de `hierarquia` "poluídas" pela extração.
- Coloca a referência à LC 214 no rodapé de cada artigo (clicável → módulo LC 214).

## Achado importante sobre os dados

- Use `referencias_lc214` como fonte da referência (está correto).
- Os campos `referencia_lc214_art` / `referencia_lc214_texto` têm bug em vários
  artigos (ex.: Art. 3º diz "Art. 4", mas o correto é "Art. 492"). O molde já
  ignora esses dois e usa `referencias_lc214`.

## Para adicionar outra norma (ex.: IBS)

1. Gere `leis/ibs.json` no mesmo formato.
2. Crie `ibs.html` copiando `cbs.html` e trocando META + caminho do JSON.
Sem tocar no molde (norma.css / norma-render.js).
