/* ==========================================================
   MINDTAX — MOTOR DO MOLDE DE NORMA
   MindTaxNorma.render(containerEl, meta, artigos, opts)
   - meta:   { sigla, titulo, icone, subtitulo }
   - artigos: array no formato do JSON de extração:
       { artigo, hierarquia, texto, referencias_lc214 }
   - opts:   { linkLC214: true|false }  (torna a ref clicável)

   Este é o "molde aplicado uma vez": qualquer norma (CBS, LC 214,
   IBS...) usa o MESMO renderizador. Só muda o arquivo de dados.
   ========================================================== */

const MindTaxNorma = (function () {

    /* ---------- Limpeza do texto ---------- */
    function limparTexto(t) {
        if (!t) return '';
        // remove citações à LC 214 (a referência vai para o rodapé do artigo)
        t = t.replace(/\(Art\.[\s\S]*?Lei\s+Complementar\s+n[ºo]\s*214[\s\S]*?\)/g, '');
        // remove notas de produção de efeitos / decreto (ruído de extração)
        t = t.replace(/\((?:Vide\s+)?Produção de efeitos\)/g, '');
        t = t.replace(/\(Incluído pelo Decreto[^)]*\)/g, '');
        return t;
    }

    /* ---------- Parsing em elementos legais ---------- */
    function parseTexto(texto) {
        const t = limparTexto(texto);
        const linhas = t.split(/\n/).map(s => s.trim()).filter(Boolean);
        const elems = [];
        linhas.forEach(function (linha) {
            let tipo = 'cont';
            if (/^Art\.\s/.test(linha))                         tipo = 'art';
            else if (/^§\s*\d+/.test(linha) ||
                     /^Parágrafo único/i.test(linha))           tipo = 'par';
            else if (/^[IVXLCDM]+\s*[-–]\s/.test(linha))         tipo = 'inciso';
            else if (/^[a-z]\)\s/.test(linha))                  tipo = 'alinea';
            else if (/^\d+\.\s/.test(linha))                    tipo = 'item';

            if (tipo === 'cont') {
                if (elems.length) elems[elems.length - 1].text += ' ' + linha;
                else elems.push({ tipo: 'art', text: linha });
            } else {
                elems.push({ tipo: tipo, text: linha });
            }
        });
        return elems;
    }

    /* ---------- Cabeçalhos de hierarquia ---------- */
    var NIVEIS = [
        { rx: /^LIVRO\s+[IVXLCDM]+\s*[-–]\s/i,    key: 'livro',    cls: 'livro' },
        { rx: /^T[IÍ]TULO\s+[IVXLCDM]+\s*[-–]\s/i, key: 'titulo',   cls: 'titulo' },
        { rx: /^CAP[IÍ]TULO\s+[IVXLCDM]+\s*[-–]\s/i,key: 'capitulo', cls: 'capitulo' },
        { rx: /^SE[ÇC][ÃA]O\s+[IVXLCDM]+\s*[-–]\s/i,key: 'secao',    cls: 'secao' },
        { rx: /^SUBSE[ÇC][ÃA]O\s+[IVXLCDM]+\s*[-–]\s/i,key:'subsecao',cls:'subsecao' }
    ];
    function classificaHeader(h) {
        h = (h || '').trim();
        for (var i = 0; i < NIVEIS.length; i++) {
            if (NIVEIS[i].rx.test(h)) return NIVEIS[i];
        }
        return null; // hierarquia poluída/ inválida → ignora
    }
    function renderHeader(h, cls) {
        var idx = h.indexOf(' - ');
        if (idx < 0) idx = h.indexOf(' – ');
        var k = idx >= 0 ? h.slice(0, idx).trim() : h.trim();
        var n = idx >= 0 ? h.slice(idx + 3).trim() : '';
        return '<div class="norma-h ' + cls + '"><span class="k">' + esc(k) + '</span>' +
               (n ? '<span class="n">' + esc(n) + '</span>' : '') + '</div>';
    }

    /* ---------- Referência à LC 214 ---------- */
    function refLC214(art, opts) {
        var r = art.referencias_lc214;
        var lista = [];
        if (Array.isArray(r)) lista = r.slice();
        else if (typeof r === 'string' && r.trim()) lista = [r.trim()];
        else if (typeof r === 'number') lista = [String(r)];
        lista = lista.filter(Boolean);
        if (!lista.length) return '';

        var alvo = lista.map(function (n) {
            if (opts && opts.linkLC214) {
                return '<a onclick="MindTaxNorma.irLC214(\'' + n + '\')">Art. ' + esc(n) + '</a>';
            }
            return '<a title="LC 214/2025">Art. ' + esc(n) + '</a>';
        });
        var rot = lista.length > 1 ? 'Fundamento LC 214/2025: ' : 'Fundamento LC 214/2025: ';
        return '<span class="norma-ref">' + rot + alvo.join(' ') + '</span>';
    }

    /* ---------- Render de um artigo ---------- */
    function renderArtigo(art, opts, primeiro) {
        var elems = parseTexto(art.texto);
        var html = '';
        var id = 'art-' + (art.artigo || '');
        var abriuArt = false;
        elems.forEach(function (e) {
            if (e.tipo === 'art') {
                var m = e.text.match(/^(Art\.\s*[\dºoA-Z-]+)\s*/);
                var num = m ? m[1] : '';
                var resto = m ? e.text.slice(m[0].length) : e.text;
                var clsSep = (!primeiro && !abriuArt) ? ' sep' : '';
                html += '<p class="norma-art' + clsSep + '" id="' + id + '">' +
                        (num ? '<span class="num">' + esc(num) + '</span> ' : '') +
                        esc(resto) + '</p>';
                abriuArt = true;
            } else if (e.tipo === 'inciso') {
                html += '<p class="norma-inciso">' + esc(e.text) + '</p>';
            } else if (e.tipo === 'alinea') {
                html += '<p class="norma-alinea">' + esc(e.text) + '</p>';
            } else if (e.tipo === 'item') {
                html += '<p class="norma-item">' + esc(e.text) + '</p>';
            } else if (e.tipo === 'par') {
                html += '<p class="norma-par">' + esc(e.text) + '</p>';
            }
        });
        html += refLC214(art, opts);
        return html;
    }

    /* ---------- Render da norma inteira ---------- */
    function render(container, meta, artigos, opts) {
        opts = opts || {};
        var atual = { livro: null, titulo: null, capitulo: null, secao: null, subsecao: null };
        var ordem = ['livro', 'titulo', 'capitulo', 'secao', 'subsecao'];

        var top = '<div class="norma-topo">' +
            '<div class="id"><div class="ic">' + esc(meta.icone || 'LC') + '</div>' +
            '<div><h1>' + esc(meta.titulo || '') + '</h1><span>' + esc(meta.subtitulo || '') + '</span></div></div>' +
            '<div class="tools"><input id="normaGoArt" type="text" placeholder="Ir ao art."><button onclick="MindTaxNorma.irArtigo()">Ir</button></div>' +
        '</div>';

        var stats = '<div class="norma-stats">' +
            '<span class="norma-chip"><strong>' + artigos.length + '</strong> artigos</span>' +
            '<span class="norma-chip">' + esc(meta.sigla || '') + '</span>' +
        '</div>';

        var doc = '<article class="norma-doc" id="normaDoc">';
        artigos.forEach(function (art, i) {
            // cabeçalhos de estrutura (só quando o nível muda)
            var hier = Array.isArray(art.hierarquia) ? art.hierarquia : [];
            hier.forEach(function (h) {
                var niv = classificaHeader(h);
                if (!niv) return;
                if (atual[niv.key] !== h) {
                    doc += renderHeader(h, niv.cls);
                    atual[niv.key] = h;
                    // ao mudar um nível, reseta os níveis mais profundos
                    var pos = ordem.indexOf(niv.key);
                    for (var j = pos + 1; j < ordem.length; j++) atual[ordem[j]] = null;
                }
            });
            doc += renderArtigo(art, opts, i === 0);
        });
        doc += '</article>';

        container.innerHTML = top + stats + doc;
    }

    /* ---------- utilidades ---------- */
    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function irArtigo() {
        var v = (document.getElementById('normaGoArt') || {}).value || '';
        v = v.trim().replace(/\D/g, '');
        if (!v) { alert('Informe o número do artigo (ex.: 173).'); return; }
        var alvo = document.getElementById('art-' + v);
        if (!alvo) { alert('Art. ' + v + ' não encontrado nesta norma.'); return; }
        document.querySelectorAll('.norma-art.destaque').forEach(function (e) { e.classList.remove('destaque'); });
        alvo.classList.add('destaque');
        alvo.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    function irLC214(n) {
        // no portal completo, isto chamaria MindTax.go('norma','lc214','art-'+n)
        if (window.MindTax && MindTax.go) { MindTax.go('norma', 'lc214', 'art-' + n); return; }
        alert('Abrir LC 214/2025 — Art. ' + n + ' (integração com o módulo da LC 214).');
    }

    return { render: render, irArtigo: irArtigo, irLC214: irLC214 };
})();
