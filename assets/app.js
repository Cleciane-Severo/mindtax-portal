/* ==========================================================
   MINDTAX — MOTOR DO PORTAL (app.js) — CAMINHOS CORRIGIDOS
   Pastas do repositório: ativos / módulos / leis
   O acento de "módulos" é tratado com %C3%B3 (sempre funciona).
   ========================================================== */

const MindTax = (function () {

    /* Caminhos das pastas do repositório (ajuste aqui se renomear pastas) */
    const PASTA_MODULOS = "m%C3%B3dulos";   /* = módulos (com acento tratado) */
    const PASTA_DADOS   = "leis";           /* onde ficam os .json das normas */

    const $content = () => document.getElementById("app-content");
    const $title   = () => document.getElementById("topTitle");
    const $sub     = () => document.getElementById("topSub");

    const TOP = {
        inicio:  { t: "MindTax",            s: "Dashboard inicial" },
        reforma: { t: "Reforma Tributária", s: "Hub de consulta" }
    };

    const cache = {};

    async function getText(url) {
        if (cache[url]) return cache[url];
        const r = await fetch(url, { cache: "no-cache" });
        if (!r.ok) throw new Error("Falha ao carregar " + url + " (" + r.status + ")");
        const t = await r.text();
        cache[url] = t;
        return t;
    }
    async function getJSON(url) { return JSON.parse(await getText(url)); }

    function topbar(t, s) { $title().textContent = t; $sub().textContent = s; }
    function marcar(nav) {
        document.querySelectorAll('.nav a[data-nav]').forEach(a => a.classList.remove("active"));
        const el = document.querySelector('.nav a[data-nav="' + nav + '"]');
        if (el) el.classList.add("active");
    }
    function loading() { $content().innerHTML = '<div class="loading">Carregando…</div>'; }
    function erro(msg) {
        $content().innerHTML = '<div class="loading">⚠️ ' + msg +
            '<br><br>Verifique os nomes das pastas e arquivos.</div>';
    }

    async function go(rota, param, ancora) {
        try {
            if (rota === "reforma") return await verReforma();
            if (rota === "norma")   return await verNorma(param, ancora);
            return await verInicio();
        } catch (e) { erro(e.message); }
    }

    async function verInicio() {
        loading();
        $content().innerHTML = await getText(PASTA_MODULOS + "/inicio.html");
        topbar(TOP.inicio.t, TOP.inicio.s); marcar("inicio");
        window.scrollTo({ top: 0 });
    }

    async function verReforma() {
        loading();
        $content().innerHTML = await getText(PASTA_MODULOS + "/reforma.html");
        topbar(TOP.reforma.t, TOP.reforma.s); marcar("reforma");
        window.scrollTo({ top: 0 });
    }

    async function verNorma(id, ancora) {
        loading();
        const manifesto = await getJSON(PASTA_DADOS + "/manifesto.json");
        const info = manifesto.find(n => n.id === id);
        if (!info) return erro('Norma "' + id + '" não encontrada no manifesto.');

        const artigos = await getJSON(info.arquivo);

        let html =
            '<nav class="rt-breadcrumb rt-block">' +
                '<a onclick="MindTax.go(\'inicio\')">Início</a><span class="sep">/</span>' +
                '<a onclick="MindTax.go(\'reforma\')">Reforma Tributária</a><span class="sep">/</span>' +
                '<span class="current">' + info.sigla + '</span>' +
            '</nav>' +
            '<section class="norma-head rt-block">' +
                '<div class="ic">' + info.icone + '</div>' +
                '<div><h3>' + info.titulo + '</h3>' +
                '<span>' + artigos.length + ' artigos carregados · Reforma Tributária</span></div>' +
            '</section>' +
            '<div class="norma-toc">';

        artigos.forEach(function (art) {
            const cam = (art.caminho && art.caminho.length) ? art.caminho.join(" › ") : "";
            html += '<div class="norma-artigo" id="art-' + (art.id || "") + '">' +
                        (cam ? '<div class="cam">' + cam + '</div>' : '') +
                        '<h4>' + art.numero + '</h4>' +
                        '<p>' + art.texto + '</p>' +
                    '</div>';
        });
        html += '</div>';

        $content().innerHTML = html;
        topbar(info.sigla, "Reforma Tributária"); marcar("reforma");

        if (ancora) {
            const alvo = document.getElementById(ancora);
            if (alvo) { alvo.classList.add("destaque"); setTimeout(() => alvo.scrollIntoView({ behavior: "smooth", block: "center" }), 150); }
        } else {
            window.scrollTo({ top: 0 });
        }
    }

    function buscar(inputId) {
        const t = (document.getElementById(inputId) || {}).value || "";
        if (!t.trim()) { alert("Digite um artigo, tema ou norma."); return; }
        alert("Busca (demonstração): " + t.trim());
    }
    function preencher(botao, inputId) {
        const c = document.getElementById(inputId);
        if (c) { c.value = botao.textContent.trim(); c.focus(); }
    }
    function emBreve(nome) { alert('"' + nome + '" — em construção.'); }

    function abrirEstrutura() {
        const e = document.getElementById("rtEstrutura");
        if (!e) return;
        e.classList.add("is-open");
        e.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    function fecharEstrutura() {
        const e = document.getElementById("rtEstrutura");
        if (!e) return;
        e.classList.remove("is-open");
        const bases = document.querySelector(".rt-bases");
        if (bases) bases.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    function irArtigo(inputId) {
        const n = (document.getElementById(inputId) || {}).value || "";
        if (!n.trim()) { alert("Informe o número do artigo (ex.: 173)."); return; }
        go("norma", "lc214", "art-" + n.trim());
    }

    return { go, buscar, preencher, emBreve, abrirEstrutura, fecharEstrutura, irArtigo };
})();

window.addEventListener("DOMContentLoaded", function () { MindTax.go("inicio"); });
