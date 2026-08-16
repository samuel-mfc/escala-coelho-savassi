/*!
 * Escala de Risco Familiar de Coelho-Savassi (ERF-CS) — calculadora
 * Arquivo único e autossuficiente: injeta o CSS, monta toda a interface e liga o cálculo.
 *
 * Uso:
 *   <script src="erf-cs.js"></script>
 * Monta dentro do elemento #erf-cs, se existir; caso contrário, no <body>.
 *
 * Referência:
 *   Savassi LCM, Lage JL, Coelho FLG. Sistematização de um instrumento de estratificação
 *   de risco familiar: Escala de Risco Familiar de Coelho-Savassi.
 *   J Manag Prim Health Care 2012;3(2):179-185.
 *   Relação morador/cômodo conforme a errata da publicação (moradores ÷ cômodos).
 *
 * Sem dependências externas. Funciona offline. Não usa localStorage.
 */
(function () {
  "use strict";

  /* ==========================================================================
     1. Dados da escala — Quadro 1 e Quadro 2 do artigo
     ========================================================================== */

  var SENTINELAS = [
    { id:"acamado", nome:"Acamado ou Domiciliado", peso:3, def:"Toda pessoa restrita ao seu domicílio, por falta de habilidade e/ou incapacidade de locomoção por si só a qualquer unidade de saúde." },
    { id:"defFisica", nome:"Deficiência física", peso:3, def:"Defeito ou condição física de longa duração ou permanente, que dificulta ou impede a realização de determinadas atividades cotidianas, escolares, de trabalho ou de lazer." },
    { id:"defMental", nome:"Deficiência mental", peso:3, def:"Defeito ou condição mental de longa duração ou permanente, que dificulta ou impede a realização de determinadas atividades cotidianas, escolares, de trabalho ou de lazer." },
    { id:"desnutricao", nome:"Desnutrição grave", peso:3, def:"Percentil menor que 0,1 ou peso muito baixo para a idade." },
    { id:"drogadicao", nome:"Drogadição", peso:2, def:"Utilização compulsiva de drogas lícitas ou ilícitas, que apresentem potencial para causar dependência química (álcool, tabaco, benzodiazepínicos, barbitúricos e drogas ilícitas)." },
    { id:"desemprego", nome:"Desemprego", peso:2, def:"Situação na qual a pessoa não esteja exercendo nenhuma ocupação (não incluir na avaliação férias, licenças ou afastamentos temporários). A realização de tarefas domésticas é considerada ocupação (trabalho doméstico), mesmo que não seja remunerado." },
    { id:"analfabetismo", nome:"Analfabetismo", peso:1, def:"Pessoa que, a partir da idade escolar, não sabe ler nem escrever no mínimo um bilhete, e/ou que sabe apenas assinar o nome." },
    { id:"menor6m", nome:"Indivíduo menor de 6 meses", peso:1, def:"Lactente com idade até 5 meses e 29 dias." },
    { id:"maior70", nome:"Indivíduo maior de 70 anos", peso:1, def:"Toda pessoa com mais de 70 anos completos." },
    { id:"has", nome:"Hipertensão arterial sistêmica", peso:1, def:"Pressão arterial sistólica maior ou igual a 140mmHg e pressão arterial diastólica maior ou igual a 90mmHg, em indivíduos que não usam medicação anti-hipertensiva." },
    { id:"dm", nome:"Diabetes mellitus", peso:1, def:"Grupo de doenças metabólicas caracterizadas por hiperglicemia e associadas a complicações, disfunções e insuficiência de vários órgãos." }
  ];

  var SANEAMENTO = [
    { id:"san-lixo", rotulo:"Lixo a céu aberto", chave:"lixo" },
    { id:"san-agua", rotulo:"Água sem tratamento no domicílio", chave:"agua" },
    { id:"san-esgoto", rotulo:"Esgoto a céu aberto", chave:"esgoto" }
  ];

  var PESO_SANEAMENTO = 3;
  var LIMITE = 60; /* teto defensivo por campo */

  /* ==========================================================================
     2. Estilos
     ========================================================================== */

  var CSS = `
  #erfcs-app{
    --bg:#f4f5f7; --surface:#ffffff; --surface-2:#f0f2f5; --line:#d8dce2;
    --text:#15181d; --muted:#5d6572; --accent:#0f766e; --accent-soft:#e2f2f0;
    --r0:#4b5563; --r0bg:#e8eaed; --r1:#0f766e; --r1bg:#dff1ee;
    --r2:#9a5b00; --r2bg:#fbeed6; --r3:#a4262c; --r3bg:#fbe3e4;
    --warn:#9a5b00; --warnbg:#fdf3e0; --warnline:#e8c887; --radius:14px;
    color:var(--text);
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
    font-size:16px; line-height:1.45;
  }
  html.erfcs-host, body.erfcs-host{margin:0; padding:0; background:#f4f5f7; -webkit-text-size-adjust:100%}
  body.erfcs-host{padding-bottom:120px}
  #erfcs-app *{box-sizing:border-box; -webkit-tap-highlight-color:transparent}

  #erfcs-app .top{
    background:var(--accent); color:#fff; padding:16px 18px;
    padding-left:max(18px, env(safe-area-inset-left)); padding-right:max(18px, env(safe-area-inset-right));
  }
  #erfcs-app .top h1{margin:0; font-size:1.12rem; line-height:1.3; font-weight:650; letter-spacing:.1px}
  #erfcs-app .top p{margin:4px 0 0; font-size:.82rem; opacity:.92}
  #erfcs-app .wrap{max-width:1180px; margin:0 auto; padding:16px;
    padding-left:max(16px, env(safe-area-inset-left)); padding-right:max(16px, env(safe-area-inset-right))}
  #erfcs-app .grid{display:grid; grid-template-columns:1fr; gap:16px}

  @media (min-width:720px){
    #erfcs-app .grid{grid-template-columns:1fr 1fr; align-items:start}
    #erfcs-app .span-2{grid-column:1 / -1}
    #erfcs-app #erfcs-lista{display:grid; grid-template-columns:1fr 1fr; column-gap:26px}
    #erfcs-app #erfcs-lista .row:nth-last-child(2):nth-child(odd){border-bottom:none}
  }

  #erfcs-app .card{background:var(--surface); border:1px solid var(--line); border-radius:var(--radius); overflow:hidden}
  #erfcs-app .card > h2{margin:0; padding:13px 16px; font-size:.98rem; font-weight:650;
    background:var(--surface-2); border-bottom:1px solid var(--line);
    display:flex; align-items:center; justify-content:space-between; gap:10px}
  #erfcs-app .card > h2 .tag{font-size:.72rem; font-weight:600; color:var(--muted); background:var(--surface);
    border:1px solid var(--line); border-radius:999px; padding:3px 9px; white-space:nowrap}
  #erfcs-app .card .body{padding:6px 16px 14px}

  #erfcs-app .row{display:flex; align-items:center; gap:12px; padding:11px 0; border-bottom:1px solid var(--line)}
  #erfcs-app .row:last-child{border-bottom:none}
  #erfcs-app .row .info{flex:1 1 auto; min-width:0}
  #erfcs-app .row .name{font-size:.95rem; font-weight:550; display:flex; align-items:center; gap:7px; flex-wrap:wrap}
  #erfcs-app .peso{font-size:.72rem; font-weight:600; color:var(--accent); background:var(--accent-soft);
    border-radius:999px; padding:2px 8px; white-space:nowrap}
  #erfcs-app .sub{font-size:.78rem; color:var(--muted); margin-top:2px}
  #erfcs-app .subtotal{font-size:.78rem; color:var(--accent); font-weight:650; margin-top:2px}

  #erfcs-app .stepper{display:flex; align-items:center; gap:6px; flex:0 0 auto}
  #erfcs-app .stepper button{width:44px; height:44px; min-width:44px; border-radius:12px; border:1px solid var(--line);
    background:var(--surface-2); color:var(--text); font-size:1.35rem; line-height:1; font-weight:500;
    cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0; font-family:inherit; touch-action:manipulation}
  #erfcs-app .stepper button:active{background:var(--accent-soft)}
  #erfcs-app .stepper input{width:52px; height:44px; text-align:center; font-size:1.05rem; font-weight:650;
    border:1px solid var(--line); border-radius:10px; background:var(--surface); color:var(--text);
    font-family:inherit; -moz-appearance:textfield}
  #erfcs-app .stepper input::-webkit-outer-spin-button,
  #erfcs-app .stepper input::-webkit-inner-spin-button{-webkit-appearance:none; margin:0}
  #erfcs-app .stepper input.on{border-color:var(--accent); background:var(--accent-soft); color:var(--accent)}

  #erfcs-app label.check{display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid var(--line); cursor:pointer}
  #erfcs-app label.check:last-of-type{border-bottom:none}
  #erfcs-app label.check input{width:26px; height:26px; min-width:26px; accent-color:var(--accent); margin:0}
  #erfcs-app label.check span{font-size:.93rem}

  #erfcs-app .hint{font-size:.78rem; color:var(--muted); margin:8px 0 0}
  #erfcs-app .ratio{margin-top:10px; padding:11px 13px; border-radius:11px; background:var(--surface-2);
    border:1px solid var(--line); font-size:.85rem; display:flex; justify-content:space-between;
    gap:10px; align-items:center; flex-wrap:wrap}
  #erfcs-app .ratio strong{font-size:.95rem}

  #erfcs-app details.def{margin-top:2px}
  #erfcs-app details.def summary{font-size:.76rem; color:var(--accent); cursor:pointer; list-style:none;
    display:inline-flex; align-items:center; gap:4px; padding:3px 0}
  #erfcs-app details.def summary::-webkit-details-marker{display:none}
  #erfcs-app details.def summary::after{content:"›"; transform:rotate(90deg); display:inline-block; font-size:.9rem}
  #erfcs-app details.def[open] summary::after{transform:rotate(-90deg)}
  #erfcs-app details.def p{margin:5px 0 2px; font-size:.79rem; color:var(--muted); line-height:1.45}

  #erfcs-app .obrig{display:flex; align-items:center; gap:5px; margin-top:4px;
    font-size:.76rem; font-weight:650; color:var(--warn)}
  #erfcs-app .obrig[hidden]{display:none}
  #erfcs-app .obrig i{font-style:normal; width:15px; height:15px; flex:0 0 auto; border-radius:50%;
    background:var(--warn); color:#fff; font-size:.68rem; font-weight:700; line-height:15px; text-align:center}

  #erfcs-app #erfcs-memoria{list-style:none; margin:0; padding:0}
  #erfcs-app #erfcs-memoria li{display:flex; justify-content:space-between; gap:12px; padding:8px 0;
    border-bottom:1px dashed var(--line); font-size:.88rem}
  #erfcs-app #erfcs-memoria li:last-child{border-bottom:none}
  #erfcs-app #erfcs-memoria li .calc{color:var(--muted); font-size:.8rem}
  #erfcs-app #erfcs-memoria li b{font-variant-numeric:tabular-nums}
  #erfcs-app .empty{color:var(--muted); font-size:.86rem; padding:6px 0}

  #erfcs-app .notas{font-size:.8rem; color:var(--muted); line-height:1.5}
  #erfcs-app .notas p{margin:0 0 9px}
  #erfcs-app .notas p:last-child{margin-bottom:0}
  #erfcs-app .notas b{color:var(--text)}

  #erfcs-app .actions{display:flex; gap:10px; flex-wrap:wrap; margin-top:4px}
  #erfcs-app .btn{flex:1 1 150px; min-height:48px; border-radius:12px; border:1px solid var(--line);
    background:var(--surface-2); color:var(--text); font-size:.92rem; font-weight:600; cursor:pointer;
    font-family:inherit; touch-action:manipulation}
  #erfcs-app .btn.primary{background:var(--accent); border-color:var(--accent); color:#fff}

  #erfcs-app .totalbar{position:fixed; left:0; right:0; bottom:0; z-index:2147483000;
    background:var(--surface); border-top:1px solid var(--line); box-shadow:0 -6px 22px rgba(0,0,0,.10);
    padding:10px max(16px, env(safe-area-inset-right)) calc(10px + env(safe-area-inset-bottom,0px)) max(16px, env(safe-area-inset-left))}
  #erfcs-app .totalbar .inner{max-width:1180px; margin:0 auto; display:flex; align-items:center; gap:14px}
  #erfcs-app .score{display:flex; align-items:baseline; gap:8px; flex:0 0 auto}
  #erfcs-app .score .n{font-size:2.1rem; font-weight:700; line-height:1; font-variant-numeric:tabular-nums}
  #erfcs-app .score .lbl{font-size:.74rem; color:var(--muted); text-transform:uppercase; letter-spacing:.6px}
  #erfcs-app .badge{flex:1 1 auto; text-align:center; border-radius:12px; padding:10px 12px; font-weight:700;
    font-size:.95rem; background:var(--r0bg); color:var(--r0); border:1px solid transparent; line-height:1.25}
  #erfcs-app .badge small{display:block; font-weight:500; font-size:.72rem; opacity:.85; margin-top:1px}
  #erfcs-app .badge.r1{background:var(--r1bg); color:var(--r1)}
  #erfcs-app .badge.r2{background:var(--r2bg); color:var(--r2)}
  #erfcs-app .badge.r3{background:var(--r3bg); color:var(--r3)}

  #erfcs-app .faixas{display:flex; gap:6px; flex-wrap:wrap; margin-top:10px}
  #erfcs-app .faixa{flex:1 1 110px; border:1px solid var(--line); border-radius:10px; padding:8px 10px;
    font-size:.78rem; color:var(--muted)}
  #erfcs-app .faixa b{display:block; font-size:.85rem; color:var(--text)}
  #erfcs-app .faixa.ativa{border-color:currentColor}
  #erfcs-app .faixa.ativa.f0{background:var(--r0bg); color:var(--r0)} #erfcs-app .faixa.ativa.f0 b{color:var(--r0)}
  #erfcs-app .faixa.ativa.f1{background:var(--r1bg); color:var(--r1)} #erfcs-app .faixa.ativa.f1 b{color:var(--r1)}
  #erfcs-app .faixa.ativa.f2{background:var(--r2bg); color:var(--r2)} #erfcs-app .faixa.ativa.f2 b{color:var(--r2)}
  #erfcs-app .faixa.ativa.f3{background:var(--r3bg); color:var(--r3)} #erfcs-app .faixa.ativa.f3 b{color:var(--r3)}

  #erfcs-app .ref{padding:18px 16px 8px; font-size:.74rem; color:var(--muted); text-align:center; line-height:1.5}
  #erfcs-app .toast{position:fixed; left:50%; transform:translateX(-50%); bottom:100px; z-index:2147483001;
    background:var(--text); color:#fff; padding:10px 16px; border-radius:999px; font-size:.85rem;
    opacity:0; pointer-events:none; transition:opacity .2s}
  #erfcs-app .toast.show{opacity:.95}

  #erfcs-relatorio{display:none}
  @media print{
    @page{margin:16mm 14mm}
    body.erfcs-host{background:#fff; padding:0}
    #erfcs-app .top, #erfcs-app .wrap, #erfcs-app .totalbar, #erfcs-app .toast{display:none !important}
    #erfcs-relatorio{display:block; color:#000; font-size:11.5pt;
      font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
    #erfcs-relatorio h1{font-size:14pt; margin:0 0 2px}
    #erfcs-relatorio .sub{font-size:9.5pt; color:#444; margin:0 0 14px}
    #erfcs-relatorio .linha{display:flex; justify-content:space-between; gap:14px; padding:5px 0; border-bottom:1px solid #ccc}
    #erfcs-relatorio .linha .calc{color:#555; font-size:9.5pt}
    #erfcs-relatorio .tot{display:flex; justify-content:space-between; padding:9px 0; border-top:2px solid #000;
      border-bottom:2px solid #000; font-weight:700; font-size:12.5pt; margin-top:2px}
    #erfcs-relatorio .clas{margin:12px 0 0; padding:9px 12px; border:1.5px solid #000; font-weight:700; text-align:center}
    #erfcs-relatorio h2{font-size:10.5pt; margin:16px 0 4px; text-transform:uppercase; letter-spacing:.5px}
    #erfcs-relatorio .assin{margin-top:26px; display:flex; gap:28px}
    #erfcs-relatorio .assin div{flex:1; border-top:1px solid #000; padding-top:4px; font-size:9pt; color:#444}
    #erfcs-relatorio .fonte{margin-top:20px; font-size:8.5pt; color:#555; line-height:1.4}
  }`;

  /* ==========================================================================
     3. Utilidades
     ========================================================================== */

  var $ = function (id) { return document.getElementById(id); };
  var plural = function (n) { return n === 1 ? "1 ponto" : n + " pontos"; };
  var esc = function (s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  };
  var limitar = function (v) {
    v = parseInt(v, 10);
    if (!isFinite(v)) v = 0;
    return Math.max(0, Math.min(LIMITE, v));
  };
  /* "2 moradores por cômodo" — sem mostrar a divisão */
  var textoRazao = function (r) {
    if (r === null) return "";
    var n = Math.round(r * 100) / 100;
    return String(n).replace(".", ",") + (n === 1 ? " morador por cômodo" : " moradores por cômodo");
  };

  /* ==========================================================================
     4. Estado
     ========================================================================== */

  var estado = { moradores:0, comodos:0, san:{}, cont:{} };
  SANEAMENTO.forEach(function (s) { estado.san[s.chave] = false; });
  SENTINELAS.forEach(function (s) { estado.cont[s.id] = 0; });

  /* ==========================================================================
     5. Regras da escala
     ========================================================================== */

  /* Relação morador/cômodo (coletiva, exclusiva): >1 = 3 pts, =1 = 2 pts, <1 = 0 pt */
  function pesoRelacao() {
    if (estado.moradores <= 0 || estado.comodos <= 0) return { peso:0, razao:null, faixa:null };
    var r = estado.moradores / estado.comodos;
    if (r > 1) return { peso:3, razao:r, faixa:"maior que 1" };
    if (r === 1) return { peso:2, razao:r, faixa:"igual a 1" };
    return { peso:0, razao:r, faixa:"menor que 1" };
  }

  /* Quadro 2: 5–6 R1, 7–8 R2, ≥9 R3. A faixa 0–4 (R0) não consta na publicação. */
  function classificar(total) {
    if (total >= 9) return { cls:"r3", idx:3, titulo:"R3 — risco máximo", sub:"9 pontos ou mais" };
    if (total >= 7) return { cls:"r2", idx:2, titulo:"R2 — risco médio", sub:"7 a 8 pontos" };
    if (total >= 5) return { cls:"r1", idx:1, titulo:"R1 — risco menor", sub:"5 a 6 pontos" };
    return { cls:"r0", idx:0, titulo:"R0 — sem risco identificado", sub:"0 a 4 pontos — faixa não descrita no artigo" };
  }

  /* Núcleo do cálculo, isolado da interface — é o que os testes conferem. */
  function calcular() {
    var itens = [], total = 0;

    SENTINELAS.forEach(function (s) {
      var n = estado.cont[s.id];
      if (n > 0) {
        var p = n * s.peso;
        total += p;
        itens.push({
          rotulo: s.nome,
          calc: n + (n === 1 ? " pessoa" : " pessoas"),
          pontos: p
        });
      }
    });

    var marcados = SANEAMENTO.filter(function (s) { return estado.san[s.chave]; });
    if (marcados.length > 0) {
      total += PESO_SANEAMENTO;
      itens.push({
        rotulo: "Baixas condições de saneamento",
        calc: marcados.map(function (s) { return s.rotulo.toLowerCase(); }).join(", "),
        pontos: PESO_SANEAMENTO
      });
    }

    var rel = pesoRelacao();
    if (rel.peso > 0) {
      total += rel.peso;
      itens.push({
        rotulo: "Relação morador/cômodo",
        calc: textoRazao(rel.razao),
        pontos: rel.peso
      });
    }

    return { total:total, itens:itens, relacao:rel, saneamento:marcados.length > 0 ? PESO_SANEAMENTO : 0, classe:classificar(total) };
  }

  /* ==========================================================================
     6. Interface
     ========================================================================== */

  function markup() {
    var linhasSentinelas = SENTINELAS.map(function (s) {
      return '' +
        '<div class="row">' +
          '<div class="info">' +
            '<div class="name">' + esc(s.nome) + ' <span class="peso">' + s.peso + ' pt' + (s.peso > 1 ? 's' : '') + '</span></div>' +
            '<div class="subtotal" id="erfcs-sub-' + s.id + '" hidden></div>' +
            '<div class="obrig" id="erfcs-exc-' + s.id + '" hidden><i>!</i>excede os moradores</div>' +
            '<details class="def"><summary>Definição</summary><p>' + esc(s.def) + '</p></details>' +
          '</div>' +
          '<div class="stepper">' +
            '<button type="button" data-step="-1" data-target="' + s.id + '" aria-label="Diminuir ' + esc(s.nome) + '">−</button>' +
            '<input type="number" inputmode="numeric" pattern="[0-9]*" id="erfcs-cnt-' + s.id + '" value="0" min="0" max="' + LIMITE + '" aria-label="Pessoas com ' + esc(s.nome) + '">' +
            '<button type="button" data-step="1" data-target="' + s.id + '" aria-label="Aumentar ' + esc(s.nome) + '">+</button>' +
          '</div>' +
        '</div>';
    }).join("");

    var linhasSaneamento = SANEAMENTO.map(function (s) {
      return '<label class="check"><input type="checkbox" id="erfcs-' + s.chave + '"><span>' + esc(s.rotulo) + '</span></label>';
    }).join("");

    return '' +
    '<div class="top">' +
      '<h1>Escala de Risco Familiar de Coelho-Savassi</h1>' +
      '<p>Estratificação de risco familiar · ERF-CS</p>' +
    '</div>' +

    '<div class="wrap">' +
      '<div class="grid">' +

        '<section class="card">' +
          '<h2>1. Domicílio</h2>' +
          '<div class="body">' +
            '<div class="row">' +
              '<div class="info"><div class="name">Moradores</div>' +
                '<div class="sub">Total de pessoas que moram no domicílio</div>' +
                '<div class="obrig" id="erfcs-obrig-moradores" hidden><i>!</i>obrigatório</div></div>' +
              '<div class="stepper">' +
                '<button type="button" data-step="-1" data-target="moradores" aria-label="Diminuir moradores">−</button>' +
                '<input type="number" inputmode="numeric" pattern="[0-9]*" id="erfcs-moradores" value="0" min="0" max="' + LIMITE + '" aria-label="Número de moradores">' +
                '<button type="button" data-step="1" data-target="moradores" aria-label="Aumentar moradores">+</button>' +
              '</div>' +
            '</div>' +
            '<div class="row">' +
              '<div class="info"><div class="name">Cômodos</div>' +
                '<div class="sub">Inclui sala, quartos, cozinha e banheiro</div>' +
                '<div class="obrig" id="erfcs-obrig-comodos" hidden><i>!</i>obrigatório</div>' +
                '<details class="def"><summary>O que conta como cômodo</summary><p>Todos os compartimentos integrantes do domicílio, inclusive banheiro e cozinha, separados por paredes, e os existentes na parte externa desde que integrem o domicílio. <b>Não contam</b> corredores, alpendres, varandas abertas, garagens, depósitos e outros compartimentos de uso não residencial. (Manual da Ficha A do SIAB)</p></details>' +
              '</div>' +
              '<div class="stepper">' +
                '<button type="button" data-step="-1" data-target="comodos" aria-label="Diminuir cômodos">−</button>' +
                '<input type="number" inputmode="numeric" pattern="[0-9]*" id="erfcs-comodos" value="0" min="0" max="' + LIMITE + '" aria-label="Número de cômodos">' +
                '<button type="button" data-step="1" data-target="comodos" aria-label="Aumentar cômodos">+</button>' +
              '</div>' +
            '</div>' +
            '<div class="ratio"><span id="erfcs-ratio-texto">Informe moradores e cômodos</span><strong id="erfcs-ratio-peso">0 ponto</strong></div>' +
            '<p class="hint">Relação moradores/cômodos<br>&gt; 1: 3 pontos · = 1: 2 pontos · &lt; 1: 0 ponto.</p>' +
          '</div>' +
        '</section>' +

        '<section class="card">' +
          '<h2>2. Saneamento</h2>' +
          '<div class="body">' + linhasSaneamento +
            '<div class="ratio"><span>Baixas condições de saneamento</span><strong id="erfcs-san-peso">0 ponto</strong></div>' +
            '<p class="hint">Basta <b>uma</b> das situações para pontuar 3.</p>' +
          '</div>' +
        '</section>' +

        '<section class="card span-2">' +
          '<h2>3. Sentinelas individuais</h2>' +
          '<div class="body">' +
            '<p class="hint" style="margin:8px 0 2px">Informe <b>quantas pessoas</b> da família apresentam cada condição. A mesma pessoa pode ser contada em mais de uma sentinela.</p>' +
            '<div id="erfcs-lista">' + linhasSentinelas + '</div>' +
          '</div>' +
        '</section>' +

        '<section class="card span-2">' +
          '<h2>Memória de cálculo</h2>' +
          '<div class="body">' +
            '<ul id="erfcs-memoria"></ul>' +
            '<div class="faixas">' +
              '<div class="faixa f0" data-f="0"><b>0 a 4</b>R0 · sem risco identificado</div>' +
              '<div class="faixa f1" data-f="1"><b>5 a 6</b>R1 · risco menor</div>' +
              '<div class="faixa f2" data-f="2"><b>7 a 8</b>R2 · risco médio</div>' +
              '<div class="faixa f3" data-f="3"><b>9 ou mais</b>R3 · risco máximo</div>' +
            '</div>' +
            '<div class="actions" style="margin-top:14px">' +
              '<button class="btn primary" type="button" id="erfcs-imprimir">Imprimir / salvar PDF</button>' +
              '<button class="btn" type="button" id="erfcs-copiar">Copiar resumo</button>' +
              '<button class="btn" type="button" id="erfcs-limpar">Limpar tudo</button>' +
            '</div>' +
          '</div>' +
        '</section>' +

        '<section class="card span-2">' +
          '<h2>Observações de aplicação</h2>' +
          '<div class="body"><div class="notas" style="padding-top:10px">' +
            '<p><b>Faixa 0 a 4:</b> o Quadro 2 do artigo original define apenas R1 (5–6), R2 (7–8) e R3 (≥9). A faixa de 0 a 4 é apresentada aqui como <b>R0 — sem risco identificado</b>, por convenção de uso das equipes, e não consta na publicação.</p>' +
            '<p><b>Caráter dinâmico:</b> a classificação muda com o tempo. As famílias devem ser reavaliadas periodicamente e o risco registrado no prontuário da família.</p>' +
            '<p><b>Sentinela hiperprevalente na área:</b> quando uma sentinela está presente em quase todo o território (ex.: saneamento precário), recomenda-se desconsiderá-la para fins de priorização, com a devida ressalva no relatório, e classificar a <b>área</b> como de risco para aquela sentinela.</p>' +
            '<p><b>Escores altos generalizados:</b> em áreas onde a maioria das famílias tem escore elevado (zona rural precária, aglomerados não urbanizados), recomenda-se elevar o ponto de corte local e considerar a microárea como de risco.</p>' +
            '<p><b>Limites da escala:</b> a ERF-CS não classifica riscos individuais nem pretende cobrir todos os riscos de uma família. É instrumento de priorização de visitas domiciliares e de planejamento das ações da equipe.</p>' +
          '</div></div>' +
        '</section>' +

      '</div>' +
      '<div class="ref">Savassi LCM, Lage JL, Coelho FLG. Sistematização de um instrumento de estratificação de risco familiar: Escala de Risco Familiar de Coelho-Savassi. <i>J Manag Prim Health Care</i> 2012;3(2):179-185.<br>Relação morador/cômodo conforme a errata da publicação (moradores ÷ cômodos).</div>' +
    '</div>' +

    '<div class="totalbar"><div class="inner">' +
      '<div class="score"><span class="n" id="erfcs-total">0</span><span class="lbl">pontos</span></div>' +
      '<div class="badge" id="erfcs-badge" role="status" aria-live="polite">R0 — sem risco identificado<small id="erfcs-badge-sub">Escore abaixo do ponto de corte</small></div>' +
    '</div></div>' +

    '<div class="toast" id="erfcs-toast"></div>';
  }

  function markupRelatorio() {
    return '' +
      '<h1>Escala de Risco Familiar de Coelho-Savassi</h1>' +
      '<p class="sub">Estratificação de risco familiar · ERF-CS &nbsp;|&nbsp; Data: <span id="erfcs-rel-data"></span></p>' +
      '<h2>Domicílio</h2>' +
      '<div class="linha"><span>Moradores</span><b id="erfcs-rel-moradores"></b></div>' +
      '<div class="linha"><span>Cômodos</span><b id="erfcs-rel-comodos"></b></div>' +
      '<div class="linha"><span>Relação morador/cômodo</span><b id="erfcs-rel-relacao"></b></div>' +
      '<h2>Sentinelas de risco identificadas</h2>' +
      '<div id="erfcs-rel-itens"></div>' +
      '<div class="tot"><span>Escore familiar final</span><span id="erfcs-rel-total"></span></div>' +
      '<div class="clas" id="erfcs-rel-classe"></div>' +
      '<div class="assin"><div>Família / responsável</div><div>Micro-área</div><div>Profissional responsável</div></div>' +
      '<p class="fonte">Savassi LCM, Lage JL, Coelho FLG. Sistematização de um instrumento de estratificação de risco familiar: Escala de Risco Familiar de Coelho-Savassi. J Manag Prim Health Care 2012;3(2):179-185. Faixas: 5–6 R1 risco menor · 7–8 R2 risco médio · ≥9 R3 risco máximo. A faixa 0–4 (R0) não consta na publicação original.</p>';
  }

  /* ==========================================================================
     7. Ligações de eventos e renderização
     ========================================================================== */

  function campo(alvo) {
    if (alvo === "moradores") return $("erfcs-moradores");
    if (alvo === "comodos") return $("erfcs-comodos");
    return $("erfcs-cnt-" + alvo);
  }
  function valorDe(alvo) {
    if (alvo === "moradores") return estado.moradores;
    if (alvo === "comodos") return estado.comodos;
    return estado.cont[alvo];
  }
  function guardar(alvo, v) {
    v = limitar(v);
    if (alvo === "moradores") estado.moradores = v;
    else if (alvo === "comodos") estado.comodos = v;
    else estado.cont[alvo] = v;
    return v;
  }
  function setValor(alvo, v) {
    campo(alvo).value = guardar(alvo, v);
    render();
  }

  function ligar() {
    /* Listeners presos diretamente em cada elemento: o Safari do iOS tem
       histórico de não propagar toques até o document. */
    var botoes = document.querySelectorAll("#erfcs-app button[data-step]");
    for (var i = 0; i < botoes.length; i++) {
      (function (b) {
        b.addEventListener("click", function (ev) {
          ev.preventDefault();
          var alvo = b.getAttribute("data-target");
          setValor(alvo, valorDe(alvo) + parseInt(b.getAttribute("data-step"), 10));
        }, false);
      })(botoes[i]);
    }

    var alvos = ["moradores", "comodos"].concat(SENTINELAS.map(function (s) { return s.id; }));
    alvos.forEach(function (alvo) {
      var el = campo(alvo);
      var ler = function () {
        if (el.value !== "" && !isFinite(parseInt(el.value, 10))) return;
        guardar(alvo, el.value === "" ? 0 : el.value);
        render();
      };
      el.addEventListener("input", ler, false);
      el.addEventListener("change", ler, false);
      el.addEventListener("blur", function () { if (el.value === "") el.value = 0; ler(); }, false);
    });

    /* 'input' e 'change' nos checkboxes: versões antigas do Safari só disparam 'change' */
    SANEAMENTO.forEach(function (s) {
      var el = $("erfcs-" + s.chave);
      var ler = function () {
        SANEAMENTO.forEach(function (o) { estado.san[o.chave] = $("erfcs-" + o.chave).checked; });
        render();
      };
      el.addEventListener("change", ler, false);
      el.addEventListener("input", ler, false);
    });

    $("erfcs-imprimir").addEventListener("click", function () { window.print(); }, false);
    $("erfcs-copiar").addEventListener("click", copiarResumo, false);
    $("erfcs-limpar").addEventListener("click", limpar, false);
  }

  function render() {
    var d = calcular();

    /* subtotais, destaque nos contadores e aviso de excesso */
    SENTINELAS.forEach(function (s) {
      var n = estado.cont[s.id], sub = $("erfcs-sub-" + s.id);
      if (n > 0) {
        sub.hidden = false;
        sub.textContent = plural(n * s.peso);
      } else {
        sub.hidden = true;
        sub.textContent = "";
      }
      campo(s.id).classList.toggle("on", n > 0);
      $("erfcs-exc-" + s.id).hidden = !(estado.moradores > 0 && n > estado.moradores);
    });

    $("erfcs-san-peso").textContent = plural(d.saneamento);

    $("erfcs-ratio-texto").textContent = d.relacao.razao === null
      ? "Informe moradores e cômodos"
      : textoRazao(d.relacao.razao);
    $("erfcs-ratio-peso").textContent = plural(d.relacao.peso);

    /* obrigatoriedade do domicílio, marcada no próprio campo que falta */
    $("erfcs-obrig-moradores").hidden = !(estado.moradores <= 0);
    $("erfcs-obrig-comodos").hidden = !(estado.comodos <= 0);

    /* memória de cálculo */
    var ul = $("erfcs-memoria");
    ul.innerHTML = "";
    if (d.itens.length === 0) {
      var vazio = document.createElement("div");
      vazio.className = "empty";
      vazio.textContent = "Nenhuma sentinela de risco registrada até aqui.";
      ul.appendChild(vazio);
    } else {
      d.itens.forEach(function (i) {
        var li = document.createElement("li");
        li.innerHTML = '<span>' + esc(i.rotulo) + ' <span class="calc">(' + esc(i.calc) + ')</span></span><b>' + i.pontos + '</b>';
        ul.appendChild(li);
      });
      var fim = document.createElement("li");
      fim.innerHTML = '<span><b>Escore familiar final</b></span><b>' + d.total + '</b>';
      ul.appendChild(fim);
    }

    /* total, classificação e faixa ativa */
    $("erfcs-total").textContent = d.total;
    var badge = $("erfcs-badge");
    badge.className = "badge " + d.classe.cls;
    badge.firstChild.nodeValue = d.classe.titulo;
    $("erfcs-badge-sub").textContent = d.classe.sub;
    var faixas = document.querySelectorAll("#erfcs-app .faixa");
    for (var i = 0; i < faixas.length; i++) {
      faixas[i].classList.toggle("ativa", parseInt(faixas[i].getAttribute("data-f"), 10) === d.classe.idx);
    }

    atualizarRelatorio(d);

    /* exposto para conferência e testes */
    window.ERFCS = {
      total: d.total,
      classificacao: d.classe.titulo,
      itens: d.itens,
      estado: estado,
      resumo: resumoTexto
    };
    window.__erfcs = window.ERFCS;
  }

  function atualizarRelatorio(d) {
    $("erfcs-rel-data").textContent = new Date().toLocaleDateString("pt-BR");
    $("erfcs-rel-moradores").textContent = estado.moradores;
    $("erfcs-rel-comodos").textContent = estado.comodos;
    $("erfcs-rel-relacao").textContent = d.relacao.razao === null
      ? "não informada"
      : textoRazao(d.relacao.razao) + " — " + plural(d.relacao.peso);

    var alvo = $("erfcs-rel-itens");
    alvo.innerHTML = "";
    if (d.itens.length === 0) {
      alvo.innerHTML = '<div class="linha"><span>Nenhuma sentinela de risco identificada</span><b>0</b></div>';
    } else {
      d.itens.forEach(function (i) {
        var el = document.createElement("div");
        el.className = "linha";
        el.innerHTML = '<span>' + esc(i.rotulo) + ' <span class="calc">(' + esc(i.calc) + ')</span></span><b>' + i.pontos + '</b>';
        alvo.appendChild(el);
      });
    }
    $("erfcs-rel-total").textContent = d.total;
    $("erfcs-rel-classe").textContent = d.classe.titulo;
  }

  /* ==========================================================================
     8. Ações
     ========================================================================== */

  function resumoTexto() {
    var d = calcular(), l = [];
    l.push("Escala de Risco Familiar de Coelho-Savassi");
    l.push("Data: " + new Date().toLocaleDateString("pt-BR"));
    l.push("Moradores: " + estado.moradores + " | Cômodos: " + estado.comodos);
    l.push("");
    if (d.itens.length === 0) l.push("Nenhuma sentinela de risco registrada.");
    d.itens.forEach(function (i) { l.push("- " + i.rotulo + " (" + i.calc + "): " + i.pontos); });
    l.push("");
    l.push("Escore familiar final: " + d.total);
    l.push("Classificação: " + d.classe.titulo);
    return l.join("\n");
  }

  function toast(msg) {
    var t = $("erfcs-toast");
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(function () { t.classList.remove("show"); }, 1900);
  }

  function copiarResumo() {
    var txt = resumoTexto();
    var ok = function () { toast("Resumo copiado"); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(ok, function () { copiaManual(txt, ok); });
    } else {
      copiaManual(txt, ok);
    }
  }

  function copiaManual(txt, ok) {
    var ta = document.createElement("textarea");
    ta.value = txt;
    ta.setAttribute("readonly", "readonly");
    ta.style.position = "fixed";
    ta.style.top = "0";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, txt.length); /* iOS exige o range explícito */
    var sucesso = false;
    try { sucesso = document.execCommand("copy"); } catch (e) { sucesso = false; }
    document.body.removeChild(ta);
    if (sucesso) ok(); else toast("Não foi possível copiar");
  }

  function limpar() {
    estado.moradores = 0;
    estado.comodos = 0;
    SANEAMENTO.forEach(function (s) {
      estado.san[s.chave] = false;
      $("erfcs-" + s.chave).checked = false;
    });
    SENTINELAS.forEach(function (s) {
      estado.cont[s.id] = 0;
      campo(s.id).value = 0;
    });
    $("erfcs-moradores").value = 0;
    $("erfcs-comodos").value = 0;
    render();
    try { window.scrollTo(0, 0); } catch (e) {}
    toast("Formulário limpo");
  }

  /* ==========================================================================
     9. Montagem
     ========================================================================== */

  function montar() {
    if ($("erfcs-app")) return; /* evita montar duas vezes */

    /* viewport: sem isso o layout mobile não se comporta */
    if (!document.querySelector('meta[name="viewport"]')) {
      var mv = document.createElement("meta");
      mv.name = "viewport";
      mv.content = "width=device-width, initial-scale=1, viewport-fit=cover";
      document.head.appendChild(mv);
    }
    if (!document.querySelector('meta[charset]')) {
      var mc = document.createElement("meta");
      mc.setAttribute("charset", "utf-8");
      document.head.insertBefore(mc, document.head.firstChild);
    }
    if (!document.title) document.title = "Escala de Risco Familiar de Coelho-Savassi";

    var estilo = document.createElement("style");
    estilo.id = "erfcs-css";
    estilo.appendChild(document.createTextNode(CSS));
    document.head.appendChild(estilo);

    document.documentElement.className += " erfcs-host";
    document.body.className += " erfcs-host";

    var host = document.getElementById("erf-cs");
    var app = document.createElement("div");
    app.id = "erfcs-app";
    app.innerHTML = markup();

    var rel = document.createElement("div");
    rel.id = "erfcs-relatorio";
    rel.innerHTML = markupRelatorio();

    if (host) {
      host.innerHTML = "";
      host.appendChild(app);
      host.appendChild(rel);
    } else {
      document.body.appendChild(app);
      document.body.appendChild(rel);
    }

    ligar();
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", montar, false);
  } else {
    montar();
  }
})();
