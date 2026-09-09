# MindTax — Portal modular (servidor)

Portal com **motor que carrega os arquivos sob demanda**. Cada norma fica em um
arquivo separado, então o portal continua leve mesmo com muitas normas.

## Estrutura

```
mindtax-portal/
├─ index.html            → shell (sidebar + topbar + marca)
├─ assets/
│  ├─ styles.css         → visual compartilhado (v7 + blocos rt-)
│  └─ app.js             → MOTOR (roteamento + carregamento sob demanda)
├─ modulos/
│  ├─ inicio.html        → conteúdo da Home
│  └─ reforma.html       → hub Reforma (prévia blocos 1+2+3)
└─ normas/
   ├─ manifesto.json     → LISTA das normas disponíveis
   ├─ lc214.json         → artigos da LC 214 (exemplo)
   └─ cbs.json           → artigos da CBS (exemplo)
```

## Como publicar no GitHub Pages

1. Crie um repositório no GitHub (ex.: `mindtax-portal`).
2. Envie TODOS os arquivos, mantendo as pastas (`assets`, `modulos`, `normas`).
3. Settings → Pages → Branch: `main` / pasta `/ (root)` → Save.
4. Aguarde 1–2 min e acesse a URL gerada
   (ex.: `https://SEU-USUARIO.github.io/mindtax-portal/`).

> Também funciona no celular pela mesma URL.

## Testar no PC antes de subir (opcional)

No VS Code, instale a extensão **Live Server**, botão direito em `index.html`
→ **Open with Live Server**. (Duplo clique NÃO funciona, pois o motor usa `fetch`.)

## Fluxo de navegação

```
Início → Reforma Tributária
       → "Acessar" no card LC 214  → abre a Estrutura (Bloco 3)
       → clicar numa parte OU "Ir direto ao artigo: 173"
       → LC 214/2025 (artigos renderizados do arquivo lc214.json)
```

## Como adicionar/alimentar uma norma

1. Crie `normas/nome.json` no mesmo formato:
   ```json
   [
     { "id":"1", "numero":"Art. 1º",
       "caminho":["LIVRO I","TÍTULO I"], "texto":"..." }
   ]
   ```
   (É praticamente igual ao seu `const DATA_LC214 = [...]`.)

2. Registre no `normas/manifesto.json`:
   ```json
   { "id":"nome", "sigla":"XPTO", "titulo":"Nome completo",
     "icone":"XP", "arquivo":"normas/nome.json" }
   ```

3. Aponte um botão em `modulos/reforma.html`:
   ```html
   <button onclick="MindTax.go('norma','nome')">Acessar</button>
   ```

Sem tocar no motor nem no layout.

## Observação sobre a marca

A marca no menu usa o monograma **MT** em CSS (sem depender de imagem externa).
Se quiser usar o seu logo PNG, me avise que troco por uma `<img>` apontando para
`assets/mt-logo.png`.
