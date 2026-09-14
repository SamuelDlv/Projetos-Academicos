/* ============================================================
   script.js — Método da Bisseção · JavaScript
   ============================================================
   Responsabilidades deste módulo:
     - Inicialização do Pyodide (motor Python no navegador)
     - Fallback em JavaScript puro para todos os métodos numéricos
     - Gerenciamento de estado global da aplicação (objeto S)
     - Renderização de gráficos via Chart.js
     - Animação canvas passo a passo
     - Tabela de iterações com ordenação e filtro
     - Navegação entre abas/seções
     - Comparação de métodos, múltiplas raízes e interpolação
   ============================================================ */
"use strict";

// ─── Estado global da aplicação ──────────────────────────────────────────────
// Objeto único que centraliza todo o estado mútavel da interface.
// Evita variáveis globais espalhadas e facilita manutenção.
const S = {
  // Referência ao runtime Pyodide e flag de disponibilidade
  pyodide: null,
  pyReady: false,

  // Resultado da última execução da bisseção (usado pela tabela e animação)
  result: null,

  // Instâncias dos gráficos Chart.js (necessário guardar para destruir antes de recriar)
  funcChart:   null,   // gráfico de f(x)
  errChart:    null,   // gráfico de convergência do erro
  cmpChart:    null,   // gráfico de comparação de métodos
  interpChart: null,   // gráfico do polinômio interpolador

  // Estado da tabela de iterações
  sortCol:    null,    // coluna atualmente ordenada (null = sem ordenação)
  sortDir:    1,       // direção de ordenação: 1 = crescente, -1 = decrescente
  filterText: "",      // texto de filtro da busca na tabela

  // Aba de gráfico ativa na seção Bisseção
  chartMode: "func",

  // Estado da animação passo a passo
  animFrames:  [],     // cópia das iterações para reprodução
  animIdx:     0,      // índice do frame atualmente exibido
  animPlaying: false,  // true enquanto a animação estiver rodando
  animTimer:   null,   // handle do setTimeout para poder pausar/cancelar
  animSpeed:   600,    // intervalo entre frames em milissegundos

  // Pontos da tabela de interpolação (valor padrão para demonstração)
  interpPoints: [[0,1],[1,3],[2,7],[3,13]],

  // Controle de visibilidade do sidebar em telas móveis
  sidebarOpen: false,
};


// ─── Animação de neve (decoração visual) ─────────────────────────────────────
/**
 * Inicializa e anima os flocos de neve no canvas de fundo (#snow-canvas).
 *
 * Cada floco tem posição, raio, velocidade de queda (d), velocidade lateral (s),
 * ângulo de oscilação (a) e velocidade de rotação angular (da).
 * O loop de animação usa requestAnimationFrame para sincronizar com o monitor.
 */
function initSnow() {
  const cv = document.getElementById("snow-canvas");
  if (!cv) return;

  const ctx = cv.getContext("2d");
  let W, H, flakes;

  // Redimensiona o canvas para cobrir toda a janela (inclusive após resize)
  const resize = () => { W = cv.width = innerWidth; H = cv.height = innerHeight; };
  resize();
  window.addEventListener("resize", resize);

  // Cria 80 flocos com propriedades aleatórias
  flakes = Array.from({ length: 80 }, () => ({
    x:  Math.random() * innerWidth,     // posição horizontal inicial
    y:  Math.random() * innerHeight,    // posição vertical inicial
    r:  Math.random() * 2.2 + .4,       // raio do floco (0.4 a 2.6px)
    d:  Math.random() * .9 + .25,       // velocidade de queda vertical
    s:  Math.random() * .5 + .15,       // amplitude da oscilação lateral
    a:  Math.random() * Math.PI * 2,    // ângulo inicial da oscilação
    da: (Math.random() - .5) * .008     // variação angular por frame
  }));

  // Loop de animação: limpa o canvas e redesenha todos os flocos a cada frame
  const loop = () => {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "rgba(175,195,225,.75)";  // azul claro semitransparente

    flakes.forEach(f => {
      // Desenha o floco como um círculo sólido
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();

      // Atualiza posição: queda vertical + oscilação senoidal lateral
      f.y += f.d;
      f.a += f.da;
      f.x += Math.sin(f.a) * f.s;

      // Reposiciona floco no topo quando sai pela base
      if (f.y > H + 4) { f.y = -4; f.x = Math.random() * W; }

      // Reposiciona quando sai pelas laterais (efeito de borda contínua)
      if (f.x < -4) f.x = W + 4;
      if (f.x > W + 4) f.x = -4;
    });

    requestAnimationFrame(loop);
  };
  loop();
}


// ─── Inicialização do Pyodide ─────────────────────────────────────────────────
/**
 * Carrega o runtime Pyodide e executa o código Python embutido na página
 * (tag <script id="python-source" type="text/python">).
 *
 * Pyodide compila e roda Python/WebAssembly diretamente no navegador,
 * permitindo usar os algoritmos Python sem servidor back-end.
 *
 * Em caso de falha (rede offline, navegador incompatível, etc.),
 * a aplicação continua funcionando via fallback JavaScript puro.
 */
async function initPyodide() {
  setBtnState("loading");
  try {
    // Aguarda o carregamento completo do runtime Pyodide
    S.pyodide = await loadPyodide();

    // Carrega e executa o código Python embutido na página
    const src = document.getElementById("python-source").textContent;
    await S.pyodide.runPythonAsync(src);

    S.pyReady = true;
    setBtnState("ready");
    setPyBadge("Python ativo", true);
  } catch (e) {
    // Falha silenciosa: o fallback JS garante funcionalidade mesmo sem Pyodide
    S.pyReady = false;
    setBtnState("ready");
    setPyBadge("Modo JS", false);
  }
}

/**
 * Atualiza o badge de status do Python no cabeçalho da página.
 *
 * @param {string}  txt  Texto a exibir no badge
 * @param {boolean} ok   true = estilo de sucesso (azul), false = aviso (âmbar)
 */
function setPyBadge(txt, ok) {
  const b = document.getElementById("py-badge");
  if (!b) return;
  b.textContent = txt;
  b.style.color       = ok ? "var(--blue)"      : "var(--amber)";
  b.style.borderColor = ok ? "var(--blue-light)" : "var(--amber-mid)";
  b.style.background  = ok ? "var(--blue-soft)"  : "var(--amber-light)";
}

/**
 * Controla o estado visual do botão principal "Executar Bisseção".
 *
 * Estados possíveis:
 *   "loading"  → desabilitado com spinner (Pyodide carregando)
 *   "running"  → desabilitado com spinner (cálculo em andamento)
 *   qualquer   → habilitado com ícone de play
 *
 * @param {string} s Estado desejado
 */
function setBtnState(s) {
  const btn = document.getElementById("btn-run");
  if (!btn) return;

  if (s === "loading") {
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Carregando Python…`;
  } else if (s === "running") {
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Calculando…`;
  } else {
    btn.disabled = false;
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Executar Bisseção`;
  }
}


// ─── Avaliação segura de expressão (fallback JavaScript) ─────────────────────
/**
 * Avalia uma expressão matemática com variável x usando JavaScript puro.
 *
 * Converte a notação de potência Python (**) para Math.pow() e expõe
 * as funções matemáticas padrão (sin, cos, sqrt, etc.) como variáveis locais.
 * Retorna NaN para expressões inválidas ou resultados não-finitos.
 *
 * @param  {string} expr Expressão matemática, ex: "x**3 - x - 2"
 * @param  {number} x    Valor da variável independente
 * @returns {number}     Resultado de f(x) ou NaN em caso de erro
 */
function evalFn(expr, x) {
  // Converte ** para Math.pow(base, exp) via regex
  const safe = expr.replace(/(\w[\w.]*|\))\s*\*\*\s*(\w[\w.]*|\([^)]*\))/g,
    (_, b, e) => `Math.pow(${b},${e})`);

  try {
    // Cria uma função temporária com as constantes matemáticas no escopo
    const fn = new Function("x",
      `const {sin,cos,tan,exp,log,sqrt,abs,asin,acos,atan,sinh,cosh,tanh,PI:pi,E:e}=Math;
       const log10=Math.log10; return (${safe});`);
    const v = fn(x);
    return isFinite(v) ? v : NaN;   // descarta Infinity e NaN
  } catch {
    return NaN;
  }
}

/**
 * Calcula a derivada numérica de uma expressão por diferenças centradas (fallback JS).
 * f'(x) ≈ [f(x+h) - f(x-h)] / (2h)
 *
 * @param  {string} expr Expressão da função
 * @param  {number} x    Ponto de avaliação
 * @param  {number} h    Incremento (padrão: 1e-7)
 * @returns {number}     Aproximação de f'(x)
 */
function dfJS(expr, x, h = 1e-7) {
  return (evalFn(expr, x + h) - evalFn(expr, x - h)) / (2 * h);
}


// ─── Implementações JavaScript dos métodos numéricos (fallback) ───────────────
// Estas funções espelham o comportamento do código Python (bissecao.py)
// e são usadas quando o Pyodide não está disponível.

/**
 * Método da Bisseção em JavaScript puro.
 * Lógica idêntica à função bissecao() em Python.
 */
function bissecaoJS(expr, a, b, tol, maxIter) {
  let fa = evalFn(expr, a), fb = evalFn(expr, b);

  if (!isFinite(fa) || !isFinite(fb))
    return { error: "f(a) ou f(b) inválido." };
  if (fa * fb > 0)
    return { error: "Bolzano não satisfeito: f(a)·f(b) > 0." };

  const iters = [];
  let c = a, fc = fa;
  const est = Math.ceil(Math.log2(Math.abs(b - a) / tol));  // estimativa teórica

  for (let i = 1; i <= maxIter; i++) {
    c  = (a + b) / 2;                          // ponto médio
    fc = evalFn(expr, c);
    const ae = Math.abs(b - a) / 2;            // erro absoluto
    const re = c ? ae / Math.abs(c) : ae;      // erro relativo

    iters.push({ n: i, a, b, c, fa, fb, fc, abs_error: ae, rel_error: re });

    // Critério de convergência
    if (ae < tol || Math.abs(fc) < tol * 1e-4 || fc === 0)
      return { root: c, iterations: iters, converged: true,
               total_iterations: i, final_error: ae,
               f_root: fc, estimated_iterations: est };

    // Atualiza intervalo descartando metade sem raiz
    if (fa * fc < 0) { b = c; fb = fc; }
    else             { a = c; fa = fc; }
  }

  return { root: c, iterations: iters, converged: false,
           total_iterations: maxIter, final_error: Math.abs(b - a) / 2,
           f_root: fc, estimated_iterations: est };
}

/**
 * Método de Newton-Raphson em JavaScript puro.
 * Lógica idêntica à função newton() em Python.
 */
function newtonJS(expr, x0, tol, maxIter) {
  let x = +x0, iters = [];

  for (let i = 1; i <= maxIter; i++) {
    const fx  = evalFn(expr, x);    // f(x)
    const fpx = dfJS(expr, x);      // f'(x) numérico

    if (Math.abs(fpx) < 1e-14)
      return { error: "Derivada zero." };

    const xn = x - fx / fpx;       // fórmula de Newton
    const ae = Math.abs(xn - x);   // tamanho da correção

    iters.push({ n: i, x, fx, fpx, x_new: xn, abs_error: ae });
    x = xn;

    if (ae < tol)
      return { root: x, iterations: iters, converged: true,
               total_iterations: i, final_error: ae, f_root: evalFn(expr, x) };
  }

  return { root: x, iterations: iters, converged: false,
           total_iterations: maxIter,
           final_error: Math.abs(evalFn(expr, x)), f_root: evalFn(expr, x) };
}

/**
 * Método da Falsa Posição em JavaScript puro.
 * Lógica idêntica à função falsa_posicao() em Python.
 */
function falsaPosicaoJS(expr, a, b, tol, maxIter) {
  let fa = evalFn(expr, a), fb = evalFn(expr, b);
  let iters = [], c = a;

  if (fa * fb > 0)
    return { error: "Bolzano não satisfeito." };

  for (let i = 1; i <= maxIter; i++) {
    if (Math.abs(fb - fa) < 1e-14) break;  // evita divisão por zero

    c = (a * fb - b * fa) / (fb - fa);     // interseção da secante com o eixo x
    const fc = evalFn(expr, c);
    const ae = Math.abs(b - a) / 2;

    iters.push({ n: i, a, b, c, fa, fb, fc, abs_error: ae });

    if (Math.abs(fc) < tol || ae < tol)
      return { root: c, iterations: iters, converged: true,
               total_iterations: i, final_error: ae, f_root: fc };

    if (fa * fc < 0) { b = c; fb = fc; }
    else             { a = c; fa = fc; }
  }

  return { root: c, iterations: iters, converged: false,
           total_iterations: maxIter,
           final_error: Math.abs(evalFn(expr, c)), f_root: evalFn(expr, c) };
}

/**
 * Método da Secante em JavaScript puro.
 * Lógica idêntica à função secante() em Python.
 */
function secanteJS(expr, x0, x1, tol, maxIter) {
  let xp = +x0, xc = +x1, iters = [];

  for (let i = 1; i <= maxIter; i++) {
    const fp = evalFn(expr, xp);   // f(x_{n-1})
    const fc = evalFn(expr, xc);   // f(x_n)
    const d  = fc - fp;            // denominador da fórmula

    if (Math.abs(d) < 1e-14)
      return { error: "Denominador zero." };

    const xn = xc - fc * (xc - xp) / d;  // fórmula da secante
    const ae = Math.abs(xn - xc);

    iters.push({ n: i, x0: xp, x1: xc, fx0: fp, fx1: fc, x_new: xn, abs_error: ae });
    xp = xc;
    xc = xn;

    if (ae < tol)
      return { root: xc, iterations: iters, converged: true,
               total_iterations: i, final_error: ae, f_root: evalFn(expr, xc) };
  }

  return { root: xc, iterations: iters, converged: false,
           total_iterations: maxIter,
           final_error: Math.abs(evalFn(expr, xc)), f_root: evalFn(expr, xc) };
}


// ─── Dispatcher Python / JavaScript ──────────────────────────────────────────
/**
 * Ponto central de execução dos algoritmos numéricos.
 *
 * Prioriza o uso do Pyodide (Python) quando disponível, garantindo
 * máxima precisão e fidelidade ao código principal. Caso o Pyodide
 * não esteja disponível, redireciona automaticamente para os
 * equivalentes JavaScript implementados neste arquivo.
 *
 * @param  {Object} payload Objeto com os parâmetros do cálculo
 *                          (cmd, expr, a, b, tol, max_iter, etc.)
 * @returns {Promise<Object>} Resultado do cálculo como objeto JS
 */
async function callPython(payload) {
  // ── Caminho principal: executa via Pyodide ─────────────────────────
  if (S.pyReady && S.pyodide) {
    // Passa o payload como string JSON para a variável global Python _p
    S.pyodide.globals.set("_p", JSON.stringify(payload));

    // Chama run_from_js() no contexto Python e obtém o resultado JSON
    const raw = await S.pyodide.runPythonAsync("run_from_js(_p)");
    return JSON.parse(raw);
  }

  // ── Caminho de fallback: executa em JavaScript puro ───────────────
  const { cmd, expr, tol = 1e-6, max_iter: mi = 100 } = payload;

  if (cmd === "bissecao")
    return bissecaoJS(expr, payload.a, payload.b, tol, mi);

  if (cmd === "newton")
    return newtonJS(expr, payload.x0, tol, mi);

  if (cmd === "falsa_posicao")
    return falsaPosicaoJS(expr, payload.a, payload.b, tol, mi);

  if (cmd === "secante")
    return secanteJS(expr, payload.x0, payload.x1, tol, mi);

  if (cmd === "comparar") {
    // Executa os quatro métodos em paralelo e retorna os resultados agrupados
    const a = payload.a, b = payload.b, mid = (a + b) / 2;
    return {
      bissecao:      bissecaoJS(expr, a, b, tol, mi),
      falsa_posicao: falsaPosicaoJS(expr, a, b, tol, mi),
      newton:        newtonJS(expr, mid, tol, mi),  // usa ponto médio como x₀
      secante:       secanteJS(expr, a, b, tol, mi),
    };
  }

  if (cmd === "multiplas") {
    // Varredura de múltiplas raízes por subintervalos
    const { a, b, n_subdiv = 60 } = payload;
    const step = (b - a) / n_subdiv;
    const roots = [], found = [];

    for (let i = 0; i < n_subdiv; i++) {
      const ai = a + i * step, bi = a + (i + 1) * step;
      const fai = evalFn(expr, ai), fbi = evalFn(expr, bi);

      if (!isFinite(fai) || !isFinite(fbi)) continue;

      // Verifica troca de sinal (Condição de Bolzano) no subintervalo
      if (fai * fbi <= 0) {
        const r = bissecaoJS(expr, ai, bi, tol, 80);

        if ("root" in r) {
          const rt = +r.root.toFixed(8);  // arredonda para evitar duplicatas

          // Adiciona apenas raízes não encontradas anteriormente
          if (!found.some(rr => Math.abs(rt - rr) < tol * 10)) {
            found.push(rt);
            roots.push({
              root:       rt,
              interval:   [ai, bi],
              f_root:     r.f_root,
              iterations: r.total_iterations
            });
          }
        }
      }
    }

    roots.sort((a, b) => a.root - b.root);  // ordena em ordem crescente
    return { roots, count: roots.length };
  }

  if (cmd === "interpolar") {
    // Polinômio interpolador de Newton por diferenças divididas
    const pts = payload.points.sort((a, b) => a[0] - b[0]);  // ordena por x
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const n = xs.length, coef = [...ys];

    // Calcula diferenças divididas in-place
    for (let j = 1; j < n; j++)
      for (let i = n - 1; i >= j; i--)
        coef[i] = (coef[i] - coef[i - 1]) / (xs[i] - xs[i - j]);

    // Domínio para plotagem (estende 20% além dos dados)
    const span = (xs[xs.length - 1] - xs[0]) * 0.2;
    const xmin = xs[0] - span, xmax = xs[xs.length - 1] + span, N = 300;
    const px = [], py = [];

    for (let i = 0; i <= N; i++) {
      const x = xmin + i * (xmax - xmin) / N;
      // Avalia o polinômio pelo método de Horner
      let v = coef[n - 1];
      for (let j = n - 2; j >= 0; j--) v = v * (x - xs[j]) + coef[j];
      px.push(x);
      py.push(isFinite(v) ? v : null);
    }

    return { coef, xs, ys, plot_x: px, plot_y: py, poly_str: "P(x) calculado" };
  }

  return { error: `Comando desconhecido: ${cmd}` };
}


// ─── Execução principal da bisseção ──────────────────────────────────────────
/**
 * Coleta os parâmetros do formulário, valida as entradas, executa o método
 * da bisseção e renderiza todos os resultados na interface.
 *
 * Fluxo:
 *   1. Lê e valida os campos do formulário
 *   2. Atualiza indicador de Bolzano
 *   3. Chama callPython() com o payload da bisseção
 *   4. Renderiza cards, gráficos, tabela e animação
 */
async function runBissecao() {
  const expr    = getVal("func-expr");
  const a       = parseFloat(getVal("a-val"));
  const b       = parseFloat(getVal("b-val"));
  const tol     = parseFloat(getVal("tol-val"));
  const maxIter = parseInt(getVal("max-iter"), 10);

  // ── Validação dos campos de entrada ──────────────────────────────
  if (!expr)          { flashInput("func-expr"); return; }
  if (isNaN(a) || isNaN(b)) { flashInput("a-val"); flashInput("b-val"); return; }
  if (a >= b)         { showError("O valor de a deve ser menor que b."); return; }

  hideAlerts();
  setBtnState("running");
  updateBolzano(expr, a, b);

  // Pequena pausa para o navegador atualizar a UI antes do cálculo pesado
  await delay(40);

  let result;
  try {
    result = await callPython({ cmd: "bissecao", expr, a, b, tol, max_iter: maxIter });
  } catch (e) {
    result = { error: e.message };
  }

  setBtnState("ready");

  // Trata erros retornados pelo algoritmo (ex: Bolzano não satisfeito)
  if (result.error)   { showError(result.error); return; }
  if (result.warning)   showWarning(result.warning);

  S.result = result;
  renderResults(result, expr, a, b, tol);
  updateIterEstimate(a, b, tol, result);
}


// ─── Indicador de Bolzano ─────────────────────────────────────────────────────
/**
 * Avalia f(a) e f(b) com os valores atuais do formulário e atualiza
 * visualmente o painel "Teorema de Bolzano" no sidebar.
 *
 * Mostra o sinal de cada extremo (+/−/0) e indica se a condição está
 * satisfeita (garantia de raiz), violada ou se os dados são insuficientes.
 *
 * @param {string} expr Expressão da função
 * @param {number} a    Extremo esquerdo
 * @param {number} b    Extremo direito
 */
function updateBolzano(expr, a, b) {
  const fa = evalFn(expr, a), fb = evalFn(expr, b);
  const valid = isFinite(fa) && isFinite(fb);
  const ok    = valid && fa * fb < 0;   // condição satisfeita: sinais opostos

  // Atualiza o badge de sinal (+/−/0/?) de um extremo
  const setSign = (id, val) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = "bolzano-sign " + (
      !isFinite(val) ? "neutral" :
       val > 0       ? "pos"     :
       val < 0       ? "neg"     : "zero"
    );
    el.textContent = !isFinite(val) ? "?" : val > 0 ? "+" : val < 0 ? "−" : "0";
  };

  // Atualiza o valor numérico formatado de f(a) ou f(b)
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = isFinite(val) ? fmt(val, 5) : "—";
  };

  setSign("bolz-sign-a", fa);
  setSign("bolz-sign-b", fb);
  setVal("bolz-fa", fa);
  setVal("bolz-fb", fb);

  // Atualiza o banner de resultado com ícone e mensagem
  const res = document.getElementById("bolz-result");
  if (res) {
    res.className = "bolzano-result " + (ok ? "ok" : valid ? "fail" : "neutral");
    res.innerHTML = ok
      // ✔ Bolzano satisfeito: sinais opostos, raiz garantida
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Bolzano satisfeito — raiz garantida em [${a}, ${b}]`
      : valid
        // ✘ Bolzano violado: mesmos sinais, sem garantia de raiz
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> f(a)·f(b) > 0 — Bolzano não satisfeito`
        // ℹ Dados insuficientes para avaliação
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Informe a, b e a função`;
  }
}


// ─── Estimativa de iterações ──────────────────────────────────────────────────
/**
 * Calcula e exibe a estimativa teórica do número de iterações necessárias,
 * o número real executado (quando disponível) e a barra de eficiência.
 *
 * Fórmula: n_est ≥ log₂((b−a) / ε)
 *
 * A barra de eficiência mostra a proporção real/estimado:
 *   - 100% = usou exatamente o previsto
 *   - <100% = converge antes do esperado (função bem comportada)
 *
 * @param {number}      a      Extremo esquerdo do intervalo
 * @param {number}      b      Extremo direito do intervalo
 * @param {number}      tol    Tolerância ε
 * @param {Object|null} result Resultado da bisseção (null antes de calcular)
 */
function updateIterEstimate(a, b, tol, result) {
  const est  = result
    ? result.estimated_iterations
    : Math.ceil(Math.log2(Math.abs(b - a) / tol));
  const real = result ? result.total_iterations : null;

  const setEl = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setEl("ie-tol",     tol.toExponential ? tol.toExponential(0) : tol);
  setEl("ie-est",     est);
  setEl("ie-real",    real !== null ? real : "—");
  setEl("ie-formula", `log₂((${fmt(Math.abs(b - a), 4)}) / ${tol}) ≈ ${est}`);

  // Atualiza a barra de progresso de eficiência
  if (result) {
    const pct  = Math.min(100, (real / est) * 100);
    const fill = document.getElementById("conv-bar-fill");
    if (fill) requestAnimationFrame(() => { fill.style.width = pct.toFixed(1) + "%"; });

    const pctEl = document.getElementById("conv-bar-pct");
    if (pctEl) pctEl.textContent = `${real} / ~${est}`;
  }
}


// ─── Renderização dos resultados ──────────────────────────────────────────────
/**
 * Orquestra a renderização completa dos resultados após uma execução
 * bem-sucedida da bisseção: cards de estatísticas, gráficos, animação e tabela.
 *
 * @param {Object} result Resultado retornado pela bisseção
 * @param {string} expr   Expressão da função
 * @param {number} a      Extremo esquerdo do intervalo
 * @param {number} b      Extremo direito do intervalo
 * @param {number} tol    Tolerância utilizada
 */
function renderResults(result, expr, a, b, tol) {
  renderStatCards(result);                              // cards numéricos no topo
  buildAnimationFrames(result.iterations, expr, a, b); // prepara frames da animação
  drawFunctionChart(expr, a, b, result.root, result.iterations); // gráfico f(x)
  drawConvergenceChart(result.iterations);              // gráfico de convergência
  buildTable(result.iterations);                        // tabela de iterações

  // Torna visível a seção de resultados (estava oculta com class "hidden")
  document.getElementById("empty-state")?.classList.add("hidden");
  document.getElementById("results-section")?.classList.remove("hidden");
}

/**
 * Preenche os cinco cards de estatísticas com os valores do resultado.
 *
 * Cards exibidos:
 *   1. Raiz x*  — valor encontrado
 *   2. f(x*)    — deve ser próximo de zero
 *   3. Iterações — total realizado / estimado
 *   4. Erro Final — |b−a|/2 na última iteração
 *   5. Status  — CONVERGIU ou NÃO CONV.
 *
 * Cada card recebe uma animação de entrada escalonada (CSS transition delay).
 *
 * @param {Object} r Resultado da bisseção
 */
function renderStatCards(r) {
  [
    ["stat-root",  fmt(r.root, 8),   "blue"],
    ["stat-froot", fmtSci(r.f_root), "teal"],
    ["stat-iter",  r.total_iterations + (r.estimated_iterations ? ` / ~${r.estimated_iterations}` : ""), "amber"],
    ["stat-error", fmtSci(r.final_error), "amber"],
    ["stat-conv",  r.converged ? "CONVERGIU" : "NÃO CONV.", r.converged ? "green" : "red"],
  ].forEach(([id, val, color], i) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = val;
    el.className = `stat-value ${color}`;

    // Dispara a animação de entrada com delay escalonado por card
    const card = el.closest(".stat-card");
    if (card) {
      card.style.transitionDelay = `${i * 60}ms`;
      card.classList.remove("visible");
      void card.offsetWidth;          // força reflow para reiniciar a animação
      card.classList.add("visible");
    }
  });
}


// ─── Animação passo a passo ────────────────────────────────────────────────────
/**
 * Prepara os dados dos frames da animação a partir das iterações da bisseção
 * e desenha o primeiro frame (estado inicial, sem animação rodando).
 *
 * @param {Array}  iters Lista de objetos de iteração ({n, a, b, c, fa, fb, fc, ...})
 * @param {string} expr  Expressão da função (para redesenhar a curva)
 * @param {number} a     Extremo esquerdo inicial
 * @param {number} b     Extremo direito inicial
 */
function buildAnimationFrames(iters, expr, a, b) {
  S.animFrames  = iters;
  S.animIdx     = 0;
  S.animPlaying = false;

  // Configura o slider para o intervalo correto de frames
  const slider = document.getElementById("anim-slider");
  if (slider) { slider.max = iters.length - 1; slider.value = 0; }

  clearAnimTimer();
  drawAnimFrame(0, expr);
  updateAnimInfo(0);
}

/**
 * Desenha um frame específico da animação no canvas 2D.
 *
 * Elementos desenhados em camadas (ordem de baixo para cima):
 *   1. Fundo cinza claro
 *   2. Grade horizontal e vertical com rótulos de eixo
 *   3. Histórico de intervalos anteriores (azul transparente)
 *   4. Intervalo atual [a, b] sombreado
 *   5. Curva f(x) em azul escuro
 *   6. Eixo y=0 (linha tracejada, se visível)
 *   7. Linhas tracejadas das bordas a e b
 *   8. Pontos f(a) e f(b) coloridos por sinal
 *   9. Linha vertical laranja no ponto médio c
 *  10. Ponto f(c) em laranja
 *  11. Rótulos "a", "b", "c" acima do gráfico
 *  12. Box informativo no canto superior direito
 *
 * @param {number} idx   Índice do frame a desenhar (0-based)
 * @param {string} expr  Expressão da função para plotagem
 */
function drawAnimFrame(idx, expr) {
  const cv = document.getElementById("anim-canvas");
  if (!cv || !S.animFrames.length) return;

  const ctx = cv.getContext("2d");
  const W = cv.offsetWidth, H = cv.offsetHeight;
  cv.width = W; cv.height = H;

  const frames    = S.animFrames;
  const frame     = frames[Math.min(idx, frames.length - 1)];
  const exprToUse = expr || getVal("func-expr");

  // ── Determina os limites do domínio de plotagem ──────────────────
  const a0 = frames[0].a, b0 = frames[0].b;
  const margin = Math.abs(b0 - a0) * 0.5;  // 50% de margem em cada lado
  const xMin = a0 - margin, xMax = b0 + margin;
  const N = 300;  // número de pontos para plotar a curva

  // ── Calcula o range de y para escalar o gráfico ──────────────────
  const ys = [];
  for (let i = 0; i <= N; i++) {
    const xv = xMin + i * (xMax - xMin) / N;
    const yv = evalFn(exprToUse, xv);
    if (isFinite(yv)) ys.push(yv);
  }
  if (!ys.length) return;

  let yMin = Math.min(...ys), yMax = Math.max(...ys);
  const yPad = (yMax - yMin) * 0.15 || 1;  // margem vertical de 15%
  yMin -= yPad; yMax += yPad;

  // ── Margens internas do canvas (espaço para eixos) ───────────────
  const PAD = { t: 24, r: 16, b: 44, l: 64 };
  const pw = W - PAD.l - PAD.r;   // largura útil do gráfico
  const ph = H - PAD.t - PAD.b;   // altura útil do gráfico

  // ── Funções de mapeamento coordenada → pixel ─────────────────────
  const mx = (x) => PAD.l + (x - xMin) / (xMax - xMin) * pw;
  const my = (y) => PAD.t + ph - (y - yMin) / (yMax - yMin) * ph;

  ctx.clearRect(0, 0, W, H);

  // ── Camada 1: fundo ──────────────────────────────────────────────
  ctx.fillStyle = "#f7f8fb";
  ctx.fillRect(0, 0, W, H);

  // ── Camada 2: grade ───────────────────────────────────────────────
  ctx.strokeStyle = "rgba(200,210,225,.6)";
  ctx.lineWidth = 1;
  const nGridX = 6, nGridY = 5;

  for (let i = 0; i <= nGridX; i++) {
    const x = xMin + i * (xMax - xMin) / nGridX;
    ctx.beginPath(); ctx.moveTo(mx(x), PAD.t); ctx.lineTo(mx(x), H - PAD.b); ctx.stroke();
    ctx.fillStyle = "#8a95a8"; ctx.font = `10px 'DM Mono', monospace`;
    ctx.textAlign = "center"; ctx.fillText(x.toFixed(2), mx(x), H - PAD.b + 16);
  }
  for (let i = 0; i <= nGridY; i++) {
    const y = yMin + i * (yMax - yMin) / nGridY;
    ctx.beginPath(); ctx.moveTo(PAD.l, my(y)); ctx.lineTo(W - PAD.r, my(y)); ctx.stroke();
    ctx.fillStyle = "#8a95a8"; ctx.font = `10px 'DM Mono', monospace`; ctx.textAlign = "right";
    ctx.fillText(y.toFixed(2), PAD.l - 6, my(y) + 4);
  }

  // ── Camada 3: intervalos anteriores (histórico) ──────────────────
  for (let k = 0; k < idx; k++) {
    const fr = frames[k];
    ctx.fillStyle = `rgba(37,99,235,0.03)`;
    ctx.fillRect(mx(fr.a), PAD.t, mx(fr.b) - mx(fr.a), ph);
  }

  // ── Camada 4: intervalo atual sombreado ───────────────────────────
  ctx.fillStyle = "rgba(37,99,235,.07)";
  ctx.fillRect(mx(frame.a), PAD.t, mx(frame.b) - mx(frame.a), ph);

  // ── Camada 5: curva f(x) ──────────────────────────────────────────
  ctx.beginPath();
  ctx.strokeStyle = "#1e3a8a";
  ctx.lineWidth = 2;
  let first = true;
  for (let i = 0; i <= N; i++) {
    const xv = xMin + i * (xMax - xMin) / N;
    const yv = evalFn(exprToUse, xv);
    if (!isFinite(yv)) { first = true; continue; }
    const px = mx(xv), py = my(yv);
    // Não conecta pontos fora da área visível (evita linhas verticais nos extremos)
    if (py < PAD.t - 5 || py > H - PAD.b + 5) { first = true; continue; }
    first ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    first = false;
  }
  ctx.stroke();

  // ── Camada 6: eixo y=0 (se visível) ──────────────────────────────
  if (yMin < 0 && yMax > 0) {
    ctx.beginPath(); ctx.strokeStyle = "rgba(100,116,139,.35)"; ctx.lineWidth = 1;
    ctx.setLineDash([5, 4]);
    ctx.moveTo(PAD.l, my(0)); ctx.lineTo(W - PAD.r, my(0));
    ctx.stroke(); ctx.setLineDash([]);
  }

  // ── Camada 7: linhas tracejadas das bordas a e b ──────────────────
  [[frame.a, "#2563eb"], [frame.b, "#2563eb"]].forEach(([xv, col]) => {
    ctx.beginPath(); ctx.strokeStyle = col; ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.moveTo(mx(xv), PAD.t); ctx.lineTo(mx(xv), H - PAD.b);
    ctx.stroke(); ctx.setLineDash([]);
  });

  // ── Camada 8: pontos f(a) e f(b) coloridos pelo sinal ────────────
  // Verde = positivo, vermelho = negativo
  [[frame.a, frame.fa, frame.fa >= 0 ? "#059669" : "#dc2626"],
   [frame.b, frame.fb, frame.fb >= 0 ? "#059669" : "#dc2626"]].forEach(([xv, yv, col]) => {
    if (!isFinite(yv)) return;
    ctx.beginPath(); ctx.arc(mx(xv), my(yv), 5, 0, Math.PI * 2);
    ctx.fillStyle = col; ctx.fill();
    ctx.beginPath(); ctx.arc(mx(xv), my(yv), 5, 0, Math.PI * 2);
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke();
  });

  // ── Camada 9: linha vertical no ponto médio c (laranja) ───────────
  ctx.beginPath(); ctx.strokeStyle = "#ea580c"; ctx.lineWidth = 2;
  ctx.moveTo(mx(frame.c), PAD.t); ctx.lineTo(mx(frame.c), H - PAD.b);
  ctx.stroke();

  // ── Camada 10: ponto f(c) ─────────────────────────────────────────
  const fc_y = frame.fc;
  if (isFinite(fc_y)) {
    ctx.beginPath(); ctx.arc(mx(frame.c), my(fc_y), 7, 0, Math.PI * 2);
    ctx.fillStyle = "#ea580c"; ctx.fill();
    ctx.beginPath(); ctx.arc(mx(frame.c), my(fc_y), 7, 0, Math.PI * 2);
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
  }

  // ── Camada 11: rótulos a, b, c acima do gráfico ───────────────────
  ctx.font = "bold 10px 'DM Mono', monospace";
  ctx.textAlign = "center";
  [[frame.a, "a", "#2563eb"], [frame.b, "b", "#2563eb"], [frame.c, "c", "#ea580c"]]
    .forEach(([xv, lbl, col]) => {
      ctx.fillStyle = col;
      ctx.fillText(lbl, mx(xv), PAD.t - 6);
    });

  // ── Camada 12: box informativo (canto superior direito) ───────────
  const overlayLines = [
    `n = ${frame.n}`,
    `c = ${frame.c.toFixed(6)}`,
    `ε = ${frame.abs_error.toExponential(2)}`,
    `f(c) = ${frame.fc.toFixed(5)}`,
  ];
  const overlayFont = "10px 'DM Mono', monospace";
  ctx.font = overlayFont;
  const lineH = 14, boxPad = { x: 10, y: 8 };
  const textWidths = overlayLines.map(l => ctx.measureText(l).width);
  const boxW = Math.max(...textWidths) + boxPad.x * 2;
  const boxH = overlayLines.length * lineH + boxPad.y * 2;
  const boxX = W - PAD.r - boxW;
  const boxY = PAD.t + 4;

  // Fundo branco semitransparente com cantos arredondados
  ctx.fillStyle = "rgba(255,255,255,.92)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(boxX, boxY, boxW, boxH, 5);
  else ctx.rect(boxX, boxY, boxW, boxH);
  ctx.fill();

  // Borda do box colorida de acordo com o sinal de f(c)
  ctx.strokeStyle = frame.fc >= 0 ? "rgba(5,150,105,.35)" : "rgba(220,38,38,.35)";
  ctx.lineWidth = 1; ctx.stroke();

  // Texto das linhas informativas
  ctx.fillStyle = "#4a5568"; ctx.font = overlayFont; ctx.textAlign = "left";
  overlayLines.forEach((line, i) => {
    ctx.fillText(line, boxX + boxPad.x, boxY + boxPad.y + lineH * i + lineH - 2);
  });
}

/**
 * Inicia a reprodução automática da animação frame a frame.
 * Mostra o botão de pausa e oculta o de play.
 */
function playAnim() {
  S.animPlaying = true;
  document.getElementById("anim-play")?.classList.add("hidden");
  document.getElementById("anim-pause")?.classList.remove("hidden");
  stepAnim();
}

/**
 * Pausa a animação no frame atual.
 * Restaura o botão de play e oculta o de pausa.
 */
function pauseAnim() {
  S.animPlaying = false;
  clearAnimTimer();
  document.getElementById("anim-play")?.classList.remove("hidden");
  document.getElementById("anim-pause")?.classList.add("hidden");
}

/**
 * Avança um frame da animação e agenda o próximo via setTimeout.
 * Pausa automaticamente ao atingir o último frame.
 */
function stepAnim() {
  if (!S.animPlaying) return;

  // Para quando chega ao último frame
  if (S.animIdx >= S.animFrames.length - 1) {
    pauseAnim(); return;
  }

  S.animIdx++;
  const slider = document.getElementById("anim-slider");
  if (slider) slider.value = S.animIdx;

  drawAnimFrame(S.animIdx, getVal("func-expr"));
  updateAnimInfo(S.animIdx);

  // Agenda o próximo frame de acordo com a velocidade selecionada
  S.animTimer = setTimeout(stepAnim, S.animSpeed);
}

/**
 * Cancela o timer da animação em curso (necessário antes de pausar ou reiniciar).
 */
function clearAnimTimer() {
  if (S.animTimer) { clearTimeout(S.animTimer); S.animTimer = null; }
}

/**
 * Atualiza o texto informativo abaixo dos controles da animação.
 * Exibe número da iteração atual, valor de c e erro absoluto.
 *
 * @param {number} idx Índice do frame atual
 */
function updateAnimInfo(idx) {
  const el = document.getElementById("anim-info");
  if (!el || !S.animFrames.length) return;
  const f = S.animFrames[Math.min(idx, S.animFrames.length - 1)];
  el.textContent = `Iter. ${f.n} / ${S.animFrames.length}  ·  c = ${f.c.toFixed(6)}  ·  |err| = ${f.abs_error.toExponential(2)}`;
}

/**
 * Altera a velocidade de reprodução da animação.
 * Reinicia o timer com o novo intervalo se a animação estiver em curso.
 *
 * @param {number}      ms  Intervalo em milissegundos entre frames
 * @param {HTMLElement} btn Botão clicado (para aplicar estilo "active")
 */
function setAnimSpeed(ms, btn) {
  S.animSpeed = ms;
  document.querySelectorAll(".speed-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  if (S.animPlaying) { clearAnimTimer(); stepAnim(); }  // reinicia com nova velocidade
}

/**
 * Salta diretamente para um frame específico via slider.
 *
 * @param {string|number} val Índice do frame (valor do range input)
 */
function seekAnim(val) {
  S.animIdx = parseInt(val, 10);
  drawAnimFrame(S.animIdx, getVal("func-expr"));
  updateAnimInfo(S.animIdx);
}

/**
 * Reinicia a animação: pausa, volta ao frame 0, atualiza slider e canvas.
 */
function resetAnim() {
  pauseAnim();
  S.animIdx = 0;
  const slider = document.getElementById("anim-slider");
  if (slider) slider.value = 0;
  drawAnimFrame(0, getVal("func-expr"));
  updateAnimInfo(0);
}


// ─── Gráfico de f(x) ─────────────────────────────────────────────────────────
/**
 * Cria (ou recria) o gráfico da função f(x) usando Chart.js.
 *
 * Exibe:
 *   - Curva azul de f(x) no domínio [a-margem, b+margem]
 *   - Linha tracejada y=0 para referência visual
 *   - Ponto azul marcando a raiz encontrada
 *   - Região sombreada e linhas tracejadas indicando [a, b] inicial
 *
 * @param {string} expr  Expressão da função
 * @param {number} a     Extremo esquerdo do intervalo
 * @param {number} b     Extremo direito do intervalo
 * @param {number} root  Raiz encontrada pela bisseção
 * @param {Array}  iters Lista de iterações (não usada diretamente aqui)
 */
function drawFunctionChart(expr, a, b, root, iters) {
  const margin = Math.abs(b - a) * .7;
  const xMin = a - margin, xMax = b + margin, N = 300;
  const dx = (xMax - xMin) / N;
  const xs = [], ys = [];

  // Gera os pontos da curva
  for (let i = 0; i <= N; i++) {
    const x = xMin + i * dx;
    xs.push(+x.toFixed(5));
    ys.push(evalFn(expr, x));
  }

  // Plugin customizado para sombrear a região [a,b] e desenhar as linhas tracejadas
  const shadePlugin = {
    id: "shade",
    beforeDatasetsDraw(chart) {
      const { ctx: c, scales } = chart;
      const x0  = scales.x.getPixelForValue(a), x1 = scales.x.getPixelForValue(b);
      const t   = scales.y.top, bot = scales.y.bottom;
      c.save();

      // Sombreamento da região [a, b]
      c.fillStyle = "rgba(37,99,235,.06)";
      c.fillRect(x0, t, x1 - x0, bot - t);

      // Linhas tracejadas nas bordas a e b
      [x0, x1].forEach(px => {
        c.beginPath(); c.strokeStyle = "rgba(37,99,235,.25)";
        c.setLineDash([4, 4]); c.lineWidth = 1;
        c.moveTo(px, t); c.lineTo(px, bot);
        c.stroke(); c.setLineDash([]);
      });

      c.restore();
    }
  };

  // Destrói o gráfico anterior se existir (evita conflito de canvas)
  if (S.funcChart) S.funcChart.destroy();
  const ctx = document.getElementById("func-chart")?.getContext("2d");
  if (!ctx) return;

  S.funcChart = new Chart(ctx, {
    type: "line",
    plugins: [shadePlugin],
    data: {
      labels: xs,
      datasets: [
        // Dataset 1: curva f(x)
        { label: "f(x)", data: ys,
          borderColor: "#1e3a8a", borderWidth: 2, pointRadius: 0,
          tension: .3, fill: false, spanGaps: true },
        // Dataset 2: eixo y=0
        { label: "y = 0", data: xs.map(() => 0),
          borderColor: "rgba(100,116,139,.25)", borderWidth: 1,
          pointRadius: 0, fill: false, borderDash: [5, 5] },
        // Dataset 3: marcador da raiz (ponto azul)
        { label: `x* ≈ ${fmt(root, 5)}`,
          data: xs.map(x => Math.abs(x - root) < dx * 2 ? 0 : null),
          borderColor: "transparent", backgroundColor: "#2563eb",
          pointRadius: xs.map(x => Math.abs(x - root) < dx * 2 ? 8 : 0),
          pointHoverRadius: 10, showLine: false },
      ]
    },
    options: chartOpts()
  });
}

/**
 * Cria (ou recria) o gráfico de convergência do erro absoluto.
 *
 * O eixo Y usa escala logarítmica para evidenciar a convergência linear
 * característica da bisseção (queda de 50% por iteração = linha reta no log).
 *
 * @param {Array} iters Lista de objetos de iteração com campo "abs_error"
 */
function drawConvergenceChart(iters) {
  if (!iters.length) return;
  if (S.errChart) S.errChart.destroy();
  const ctx = document.getElementById("err-chart")?.getContext("2d");
  if (!ctx) return;

  S.errChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: iters.map(r => r.n),  // eixo x = número da iteração
      datasets: [{
        label: "Erro |b−a|/2",
        data: iters.map(r => r.abs_error),
        borderColor: "#d97706",
        backgroundColor: "rgba(217,119,6,.07)",
        borderWidth: 2, pointRadius: 3,
        pointBackgroundColor: "#d97706",
        pointBorderColor: "#fff", pointBorderWidth: 1.5,
        tension: .15, fill: true,
      }]
    },
    options: {
      ...chartOpts(),
      scales: {
        x: {
          ticks: { color: "#8a95a8", font: { family: "'DM Mono',monospace", size: 10 }, maxTicksLimit: 12 },
          grid: { color: "rgba(0,0,0,.04)" }, border: { color: "#eef1f7" }
        },
        // Escala logarítmica revela a taxa de convergência linear da bisseção
        y: {
          type: "logarithmic",
          ticks: { color: "#8a95a8", font: { family: "'DM Mono',monospace", size: 10 }, callback: v => v.toExponential(0) },
          grid: { color: "rgba(0,0,0,.04)" }, border: { color: "#eef1f7" }
        },
      }
    }
  });
}

/**
 * Retorna as opções padrão de configuração para gráficos Chart.js.
 * Centraliza estilos de tooltip, legenda, eixos e animação.
 *
 * @returns {Object} Objeto de configuração para o campo "options" do Chart.js
 */
function chartOpts() {
  return {
    responsive: true,
    animation: { duration: 450, easing: "easeOutQuart" },
    plugins: {
      legend: {
        labels: { color: "#4a5568", font: { family: "'DM Sans',sans-serif", size: 11 }, boxWidth: 12, padding: 14 }
      },
      tooltip: {
        backgroundColor: "#1a2030", titleColor: "#e2e8f0", bodyColor: "#94a3b8",
        borderColor: "#334155", borderWidth: 1, cornerRadius: 6, padding: 9,
        titleFont: { family: "'DM Mono',monospace", size: 11 },
        bodyFont:  { family: "'DM Mono',monospace", size: 10 },
      }
    },
    scales: {
      x: {
        ticks: { color: "#8a95a8", font: { family: "'DM Mono',monospace", size: 10 }, maxTicksLimit: 10, maxRotation: 0 },
        grid: { color: "rgba(0,0,0,.04)" }, border: { color: "#eef1f7" }
      },
      y: {
        ticks: { color: "#8a95a8", font: { family: "'DM Mono',monospace", size: 10 } },
        grid: { color: "rgba(0,0,0,.04)" }, border: { color: "#eef1f7" }
      },
    }
  };
}


// ─── Comparação de métodos ────────────────────────────────────────────────────
/**
 * Executa os quatro métodos numéricos (bisseção, falsa posição, Newton-Raphson
 * e secante) com os parâmetros atuais e exibe os resultados comparativos.
 *
 * O método com menos iterações (entre os convergidos) é destacado como vencedor.
 */
async function runComparison() {
  const expr = getVal("func-expr"), a = parseFloat(getVal("a-val")), b = parseFloat(getVal("b-val"));
  const tol = parseFloat(getVal("tol-val")), mi = parseInt(getVal("max-iter"), 10);

  if (!expr || isNaN(a) || isNaN(b)) {
    showError("Preencha a função e o intervalo primeiro."); return;
  }

  const btn = document.getElementById("btn-compare");
  if (btn) { btn.disabled = true; btn.innerHTML = `<span class="spinner"></span> Comparando…`; }

  await delay(40);
  let res;
  try {
    res = await callPython({ cmd: "comparar", expr, a, b, tol, max_iter: mi });
  } catch (e) {
    res = { error: e.message };
  }

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Comparar Métodos`;
  }

  if (res.error) { showError(res.error); return; }
  renderComparison(res, expr, a, b, tol);
}

/**
 * Renderiza os cards de comparação e o gráfico de convergência multi-método.
 *
 * Identifica o "vencedor" (método convergido com menos iterações) e
 * destaca seu card com estilo especial. O gráfico mostra o erro absoluto
 * de cada método ao longo das iterações em escala logarítmica.
 *
 * @param {Object} res  Resultado do comando "comparar"
 * @param {string} expr Expressão da função
 * @param {number} a    Extremo esquerdo
 * @param {number} b    Extremo direito
 * @param {number} tol  Tolerância
 */
function renderComparison(res, expr, a, b, tol) {
  const methods = [
    { key: "bissecao",      label: "Bisseção",       color: "#2563eb" },
    { key: "falsa_posicao", label: "Falsa Posição",  color: "#7c3aed" },
    { key: "newton",        label: "Newton-Raphson", color: "#059669" },
    { key: "secante",       label: "Secante",        color: "#d97706" },
  ];

  // Identifica o vencedor: método convergido com menos iterações
  const converged = methods.filter(m => res[m.key] && !res[m.key].error && res[m.key].converged);
  const winner = converged.sort((a, b) =>
    (res[a.key].total_iterations || 999) - (res[b.key].total_iterations || 999)
  )[0];

  // ── Renderiza os cards de resultado ─────────────────────────────
  const grid = document.getElementById("cmp-cards");
  if (!grid) return;
  grid.innerHTML = "";

  methods.forEach(m => {
    const r        = res[m.key];
    const isWinner = winner && m.key === winner.key;
    const failed   = !r || r.error || !r.converged;
    const div      = document.createElement("div");

    div.className = `method-card${isWinner ? " winner" : ""}${failed ? " failed" : ""}`;
    div.innerHTML = `
      <div class="method-name" style="color:${m.color}">${m.label}</div>
      <div class="method-root ${isWinner ? "green" : ""}">${r && !r.error ? fmt(r.root, 6) : "Erro"}</div>
      <div class="method-iter">${r && !r.error ? (r.converged ? r.total_iterations + " iter." : "Não conv.") : "—"}</div>
      ${isWinner ? `<div class="winner-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="10" height="10"><polyline points="20 6 9 17 4 12"/></svg> Mais rápido</div>` : ""}
    `;
    grid.appendChild(div);
  });
  document.getElementById("cmp-section")?.classList.remove("hidden");

  // ── Gráfico de convergência comparada ────────────────────────────
  if (S.cmpChart) S.cmpChart.destroy();
  const ctx = document.getElementById("cmp-chart")?.getContext("2d");
  if (!ctx) return;

  // Cria um dataset por método (apenas métodos sem erro)
  const datasets = methods.map(m => {
    const r = res[m.key];
    if (!r || r.error) return null;
    return {
      label: m.label,
      data: (r.iterations || []).map(it => it.abs_error),
      borderColor: m.color, borderWidth: 2,
      pointRadius: 2, pointBackgroundColor: m.color,
      tension: .1, fill: false, spanGaps: true,
    };
  }).filter(Boolean);

  const maxLen = Math.max(...datasets.map(d => d.data.length));

  S.cmpChart = new Chart(ctx, {
    type: "line",
    data: { labels: Array.from({ length: maxLen }, (_, i) => i + 1), datasets },
    options: {
      ...chartOpts(),
      scales: {
        x: {
          ...chartOpts().scales.x,
          title: { display: true, text: "Iteração", color: "#8a95a8", font: { family: "'DM Mono',monospace", size: 10 } }
        },
        y: {
          type: "logarithmic",  // escala log evidencia diferença de velocidade
          ticks: { color: "#8a95a8", font: { family: "'DM Mono',monospace", size: 10 }, callback: v => v.toExponential(0) },
          grid: { color: "rgba(0,0,0,.04)" }, border: { color: "#eef1f7" },
          title: { display: true, text: "Erro", color: "#8a95a8", font: { family: "'DM Mono',monospace", size: 10 } }
        },
      }
    }
  });
}


// ─── Múltiplas raízes ─────────────────────────────────────────────────────────
/**
 * Executa a varredura de múltiplas raízes no intervalo especificado
 * e renderiza os resultados como chips informativos.
 *
 * O intervalo de busca pode ser diferente (e geralmente maior) do que
 * o [a,b] configurado no painel principal.
 */
async function runMultiRoot() {
  const expr = getVal("func-expr");
  // Usa o intervalo específico desta aba, ou cai para o intervalo principal
  const a = parseFloat(getVal("mr-a") || getVal("a-val"));
  const b = parseFloat(getVal("mr-b") || getVal("b-val"));
  const tol = parseFloat(getVal("tol-val"));

  if (!expr || isNaN(a) || isNaN(b)) {
    showError("Preencha a função e o intervalo primeiro."); return;
  }

  const btn = document.getElementById("btn-multiroot");
  if (btn) { btn.disabled = true; btn.innerHTML = `<span class="spinner"></span> Buscando…`; }
  await delay(40);

  let res;
  try {
    // Usa 80 subdivisões para maior resolução na busca de raízes
    res = await callPython({ cmd: "multiplas", expr, a, b, n_subdiv: 80, tol });
  } catch (e) {
    res = { error: e.message };
  }

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Buscar Todas as Raízes`;
  }

  if (res.error) { showError(res.error); return; }

  const cont = document.getElementById("roots-container");
  if (!cont) return;
  cont.innerHTML = "";

  if (!res.roots.length) {
    // Nenhuma raiz encontrada: exibe mensagem informativa
    cont.innerHTML = `<div class="no-roots">Nenhuma raiz encontrada em [${a}, ${b}]. Tente ampliar o intervalo.</div>`;
  } else {
    // Renderiza um "chip" para cada raiz encontrada
    const chips = document.createElement("div");
    chips.className = "root-chips";

    res.roots.forEach((r, i) => {
      const chip = document.createElement("div");
      chip.className = "root-chip";
      chip.innerHTML = `
        <span class="rc-label">Raiz ${i + 1}</span>
        <span class="rc-val">x* = ${fmt(r.root, 7)}</span>
        <span class="rc-sub">f(x*) ≈ ${fmtSci(r.f_root)} · ${r.iterations} iter.</span>
      `;
      chips.appendChild(chip);
    });

    const summary = document.createElement("p");
    summary.style.cssText = "font-size:.72rem;color:var(--slate);margin-top:10px;font-family:var(--font-mono)";
    summary.textContent = `${res.count} raiz${res.count !== 1 ? "es" : ""} encontrada${res.count !== 1 ? "s" : ""} em [${a}, ${b}]`;

    cont.appendChild(chips);
    cont.appendChild(summary);
  }

  document.getElementById("multiroot-result")?.classList.remove("hidden");
}


// ─── Interpolação polinomial ──────────────────────────────────────────────────
/**
 * Renderiza a tabela de pontos da interpolação com inputs editáveis.
 * Rebuilda toda a tabela a partir de S.interpPoints para manter consistência.
 */
function renderInterpTable() {
  const tbody = document.getElementById("interp-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  S.interpPoints.forEach((pt, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="number" value="${pt[0]}" step="any" onchange="updatePoint(${i},0,this.value)" /></td>
      <td><input type="number" value="${pt[1]}" step="any" onchange="updatePoint(${i},1,this.value)" /></td>
      <td><button class="rm-point-btn" onclick="removePoint(${i})">✕</button></td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Atualiza o valor de um ponto na tabela de interpolação.
 *
 * @param {number} i   Índice do ponto em S.interpPoints
 * @param {number} col 0 = coluna x, 1 = coluna y
 * @param {string} val Novo valor (como string do input)
 */
function updatePoint(i, col, val) {
  S.interpPoints[i][col] = parseFloat(val) || 0;
}

/**
 * Adiciona um novo ponto à tabela de interpolação.
 * O novo ponto tem x = último_x + 1 e y = 0 como valores padrão.
 */
function addPoint() {
  const last = S.interpPoints[S.interpPoints.length - 1] || [0, 0];
  S.interpPoints.push([last[0] + 1, 0]);
  renderInterpTable();
}

/**
 * Remove um ponto da tabela de interpolação.
 * Exige no mínimo 2 pontos para manter o cálculo válido.
 *
 * @param {number} i Índice do ponto a remover
 */
function removePoint(i) {
  if (S.interpPoints.length <= 2) return;  // mínimo de 2 pontos
  S.interpPoints.splice(i, 1);
  renderInterpTable();
}

/**
 * Calcula o polinômio interpolador de Newton e renderiza o gráfico.
 *
 * Após o cálculo, exibe:
 *   - A representação textual do polinômio P(x)
 *   - O gráfico com a curva roxa do polinômio e os pontos de dados em azul
 */
async function runInterpolation() {
  // Filtra pontos com valores numéricos válidos
  const pts = S.interpPoints.filter(p => isFinite(p[0]) && isFinite(p[1]));
  if (pts.length < 2) { showError("São necessários pelo menos 2 pontos."); return; }

  const btn = document.getElementById("btn-interp");
  if (btn) { btn.disabled = true; btn.innerHTML = `<span class="spinner"></span> Calculando…`; }
  await delay(40);

  let res;
  try {
    res = await callPython({ cmd: "interpolar", points: pts });
  } catch (e) {
    res = { error: e.message };
  }

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Calcular Polinômio`;
  }

  if (res.error) { showError(res.error); return; }

  // Exibe a representação textual do polinômio
  const polyEl = document.getElementById("poly-string");
  if (polyEl) polyEl.innerHTML = `<strong>P(x) =</strong> ${res.poly_str}`;
  document.getElementById("interp-result")?.classList.remove("hidden");

  // ── Gráfico do polinômio ─────────────────────────────────────────
  if (S.interpChart) S.interpChart.destroy();
  const ctx = document.getElementById("interp-chart")?.getContext("2d");
  if (!ctx) return;

  S.interpChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: res.plot_x.map(x => x.toFixed(4)),
      datasets: [
        // Dataset 1: curva do polinômio interpolador (roxo)
        {
          label: "P(x) interpolador",
          data: res.plot_y,
          borderColor: "#7c3aed", borderWidth: 2,
          pointRadius: 0, tension: .3, fill: false, spanGaps: true
        },
        // Dataset 2: pontos de dados fornecidos pelo usuário (azul)
        {
          label: "Pontos dados",
          data: res.plot_x.map(x => {
            // Marca apenas os x exatos dos dados (tolerância de 1e-9)
            const found = res.xs.findIndex(px => Math.abs(px - x) < 1e-9);
            return found >= 0 ? res.ys[found] : null;
          }),
          borderColor: "transparent", backgroundColor: "#2563eb",
          pointRadius: res.plot_x.map(x => res.xs.some(px => Math.abs(px - x) < 1e-9) ? 7 : 0),
          showLine: false
        },
      ]
    },
    options: chartOpts()
  });
}


// ─── Tabela de iterações ──────────────────────────────────────────────────────
/**
 * Inicializa a tabela de iterações atualizando o badge de contagem
 * e renderizando as linhas.
 *
 * @param {Array} rows Lista de objetos de iteração
 */
function buildTable(rows) {
  document.getElementById("iter-badge").textContent = rows.length + " iterações";
  renderRows(rows);
}

/**
 * Renderiza as linhas da tabela aplicando filtro de texto e ordenação.
 *
 * Comportamentos especiais:
 *   - A última linha recebe a classe "final-row" (destaque verde)
 *   - Valores de f(a), f(b), f(c) recebem cor por sinal (verde=+, vermelho=−)
 *   - A coluna c (ponto médio) é destacada em azul
 *   - Animação de entrada escalonada por linha (CSS animation-delay)
 *
 * @param {Array} rows Lista de objetos de iteração da bisseção
 */
function renderRows(rows) {
  const tbody = document.getElementById("table-body");
  if (!tbody) return;

  const q = S.filterText.toLowerCase();

  // Aplica filtro de texto (busca em todos os campos de cada linha)
  let filtered = q
    ? rows.filter(r => Object.values(r).some(v => String(v).includes(q)))
    : rows;

  // Aplica ordenação se uma coluna estiver selecionada
  if (S.sortCol !== null) {
    filtered = [...filtered].sort((a, b) => {
      const av = a[S.sortCol], bv = b[S.sortCol];
      return (av < bv ? -1 : av > bv ? 1 : 0) * S.sortDir;
    });
  }

  tbody.innerHTML = "";

  filtered.forEach((row, idx) => {
    const tr = document.createElement("tr");
    tr.style.animationDelay = `${idx * 15}ms`;  // entrada escalonada
    if (idx === filtered.length - 1) tr.classList.add("final-row");  // última linha em verde

    tr.innerHTML = `
      <td>${row.n}</td>
      <td>${fmt(row.a, 8)}</td>
      <td>${fmt(row.b, 8)}</td>
      <td class="td-c">${fmt(row.c, 8)}</td>
      <td class="${row.fa >= 0 ? "td-pos" : "td-neg"}">${fmt(row.fa, 6)}</td>
      <td class="${row.fb >= 0 ? "td-pos" : "td-neg"}">${fmt(row.fb, 6)}</td>
      <td class="${row.fc === 0 ? "" : row.fc > 0 ? "td-pos" : "td-neg"}">${fmt(row.fc, 6)}</td>
      <td class="td-err">${fmtSci(row.abs_error)}</td>
      <td class="td-err">${fmtSci(row.rel_error)}</td>
    `;
    tbody.appendChild(tr);
  });

  // Mensagem quando nenhuma linha corresponde ao filtro
  if (!filtered.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="9" style="text-align:center;color:var(--mist);padding:22px;font-family:var(--font-sans)">Sem resultados para "${q}"</td>`;
    tbody.appendChild(tr);
  }
}

/**
 * Altera a coluna de ordenação da tabela.
 * Clicar na mesma coluna inverte a direção (crescente ↔ decrescente).
 *
 * @param {string} col Nome da propriedade usada como chave de ordenação
 */
function sortTable(col) {
  // Alterna direção se a mesma coluna for clicada, senão reinicia como crescente
  if (S.sortCol === col) S.sortDir *= -1;
  else { S.sortCol = col; S.sortDir = 1; }

  // Remove indicadores visuais de todas as colunas
  document.querySelectorAll("thead th").forEach(th => {
    th.classList.remove("sorted");
    const ic = th.querySelector(".sort-icon");
    if (ic) ic.textContent = "↕";
  });

  // Aplica indicador à coluna ordenada atual
  const th = document.querySelector(`th[data-col="${col}"]`);
  if (th) {
    th.classList.add("sorted");
    const ic = th.querySelector(".sort-icon");
    if (ic) ic.textContent = S.sortDir === 1 ? "↑" : "↓";
  }

  if (S.result) renderRows(S.result.iterations);
}

/**
 * Filtra as linhas da tabela pelo texto digitado na caixa de busca.
 *
 * @param {string} q Texto de filtro (case-insensitive)
 */
function filterTable(q) {
  S.filterText = q;
  if (S.result) renderRows(S.result.iterations);
}


// ─── Navegação entre seções ───────────────────────────────────────────────────
/**
 * Ativa a seção (aba) indicada, desativando as demais.
 *
 * Além de alternar as classes CSS, executa ações específicas por seção:
 *   - "animacao"    → redesenha o frame atual se houver dados
 *   - "interpolacao"→ reconstrói a tabela de pontos
 *
 * Faz scroll suave para posicionar o conteúdo abaixo do header fixo + nav.
 *
 * @param {string} name Nome da seção (ex: "bissecao", "animacao", ...)
 */
function switchSection(name) {
  // Remove estado ativo de todos os painéis e tabs
  document.querySelectorAll(".section-panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));

  // Ativa painel e tab correspondentes
  document.getElementById(`sec-${name}`)?.classList.add("active");
  document.querySelector(`[data-sec="${name}"]`)?.classList.add("active");

  hideAlerts();  // limpa mensagens de erro ao trocar de aba

  // Ações específicas por seção
  if (name === "animacao") {
    if (S.result) {
      drawAnimFrame(S.animIdx, getVal("func-expr"));
    } else {
      const info = document.getElementById("anim-info");
      if (info) info.textContent = "Execute a bisseção primeiro (aba Bisseção)";
    }
  }
  if (name === "interpolacao") renderInterpTable();

  // Scroll para compensar header fixo (header + nav bar)
  const headerH = document.querySelector(".page-header")?.offsetHeight || 60;
  const navH    = document.querySelector(".section-nav")?.offsetHeight  || 46;
  const offset  = headerH + navH + 16;
  const target  = document.getElementById(`sec-${name}`);

  if (target) {
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }
}

/**
 * Alterna entre as abas de gráfico dentro da seção Bisseção.
 *
 * @param {string} mode Identificador do gráfico ("func" ou "err")
 */
function switchChart(mode) {
  S.chartMode = mode;
  document.querySelectorAll(".chart-tab").forEach(t =>
    t.classList.toggle("active", t.dataset.chart === mode));
  document.querySelectorAll(".chart-panel").forEach(p =>
    p.classList.toggle("active", p.id === `chart-${mode}`));
}

/**
 * Abre ou fecha o sidebar de configurações em dispositivos móveis.
 * Em desktop o sidebar é sempre visível.
 */
function toggleSidebar() {
  S.sidebarOpen = !S.sidebarOpen;
  document.getElementById("sidebar-body")?.classList.toggle("open", S.sidebarOpen);
}


// ─── Exemplos pré-definidos ───────────────────────────────────────────────────
/**
 * Lista de funções de exemplo com expressão, intervalo [a,b] e nome amigável.
 * Clicando em um exemplo, o formulário é preenchido automaticamente.
 */
const EXAMPLES = [
  { name: "x³ − x − 2",   expr: "x**3 - x - 2",    a: 1,    b: 2 },
  { name: "x² − 2",       expr: "x**2 - 2",         a: 1,    b: 2 },
  { name: "cos(x) − x",   expr: "cos(x) - x",       a: 0,    b: 1 },
  { name: "eˣ − 3x",      expr: "exp(x) - 3*x",     a: 0,    b: 1 },
  { name: "x³ − 2x − 5",  expr: "x**3 - 2*x - 5",  a: 2,    b: 3 },
  { name: "sin(x)",        expr: "sin(x)",            a: 3,    b: 4 },
  { name: "x − cos(x)",   expr: "x - cos(x)",        a: 0,    b: 1 },
  { name: "log(x) − 1",   expr: "log(x) - 1",        a: 1.5,  b: 3 },
];

/**
 * Carrega um exemplo pré-definido no formulário.
 * Preenche a função, [a,b] e atualiza o indicador de Bolzano em tempo real.
 *
 * @param {number} i Índice do exemplo em EXAMPLES
 */
function loadExample(i) {
  const ex = EXAMPLES[i];
  if (!ex) return;

  setVal("func-expr", ex.expr);
  setVal("a-val", ex.a);
  setVal("b-val", ex.b);

  flashInput("func-expr");  // animação visual de feedback

  // Marca o botão de exemplo clicado como ativo
  document.querySelectorAll(".example-btn").forEach((b, idx) =>
    b.classList.toggle("active-example", idx === i));

  // Atualiza indicadores de Bolzano e estimativa de iterações
  updateBolzano(ex.expr, ex.a, ex.b);
  updateIterEstimate(ex.a, ex.b, parseFloat(getVal("tol-val")), null);
}


// ─── Funções utilitárias ──────────────────────────────────────────────────────

/** Lê o valor de um campo de formulário pelo id. Retorna "" se não encontrado. */
const getVal = id => document.getElementById(id)?.value ?? "";

/** Define o valor de um campo de formulário pelo id. */
const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };

/** Cria uma Promise que resolve após `ms` milissegundos (pausa assíncrona). */
const delay = ms => new Promise(r => setTimeout(r, ms));

/**
 * Exibe o alerta de erro com a mensagem fornecida.
 * @param {string} msg Mensagem de erro a exibir
 */
function showError(msg) {
  const e = document.getElementById("alert-error");
  if (e) { e.querySelector(".alert-msg").textContent = msg; e.classList.add("visible"); }
}

/**
 * Exibe o alerta de aviso (amarelo) com a mensagem fornecida.
 * @param {string} msg Mensagem de aviso a exibir
 */
function showWarning(msg) {
  const e = document.getElementById("alert-warning");
  if (e) { e.querySelector(".alert-msg").textContent = msg; e.classList.add("visible"); }
}

/** Remove todos os alertas visíveis da interface. */
function hideAlerts() {
  document.getElementById("alert-error")?.classList.remove("visible");
  document.getElementById("alert-warning")?.classList.remove("visible");
}

/**
 * Dispara a animação de destaque (borda pulsante) em um campo de input.
 * Usado para chamar atenção a campos com valores inválidos ou recém-preenchidos.
 *
 * @param {string} id ID do elemento input
 */
function flashInput(id) {
  const e = document.getElementById(id);
  if (!e) return;
  e.classList.remove("input-highlight");
  void e.offsetWidth;  // força reflow para reiniciar a animação CSS
  e.classList.add("input-highlight");
}

/**
 * Formata um número com d casas decimais fixas.
 *
 * @param  {number} v Valor a formatar
 * @param  {number} d Número de casas decimais (padrão: 8)
 * @returns {string}  Valor formatado ou "—" se nulo/indefinido
 */
function fmt(v, d = 8) {
  if (v == null) return "—";
  return Number(v).toFixed(d);
}

/**
 * Formata um número em notação científica ou decimal, escolhendo
 * automaticamente o formato mais legível:
 *   - Notação científica para |v| < 0.001 ou |v| ≥ 100000
 *   - Decimal fixo com 8 casas nos demais casos
 *
 * @param  {number} v Valor a formatar
 * @returns {string}  Valor formatado ou "—" se nulo/indefinido
 */
function fmtSci(v) {
  if (v == null) return "—";
  const n = Number(v);
  if (n === 0) return "0.00000000";
  if (Math.abs(n) < 1e-3 || Math.abs(n) >= 1e5) return n.toExponential(4);
  return n.toFixed(8);
}

/**
 * Atualiza os indicadores de Bolzano e estimativa de iterações em tempo real
 * enquanto o usuário digita nos campos do formulário.
 *
 * Vinculado aos eventos "input" e "change" dos campos principais.
 */
function liveUpdate() {
  const expr = getVal("func-expr"), a = parseFloat(getVal("a-val")),
        b = parseFloat(getVal("b-val")), tol = parseFloat(getVal("tol-val"));

  if (expr && !isNaN(a) && !isNaN(b)) updateBolzano(expr, a, b);
  if (!isNaN(a) && !isNaN(b) && tol)  updateIterEstimate(a, b, tol, null);
}


// ─── Inicialização da aplicação ───────────────────────────────────────────────
/**
 * Ponto de entrada principal da aplicação.
 * Executado quando o DOM está completamente carregado.
 *
 * Sequência de inicialização:
 *   1. Inicia animação de neve (visual decorativo)
 *   2. Carrega o runtime Pyodide em background
 *   3. Gera dinamicamente os botões de exemplos
 *   4. Ativa a aba e o gráfico padrão (bisseção / f(x))
 *   5. Vincula eventos de atualização em tempo real nos campos
 *   6. Executa atualização inicial do indicador de Bolzano
 *   7. Renderiza a tabela de pontos da interpolação
 *   8. Registra atalho de teclado Ctrl+Enter para executar
 */
window.addEventListener("DOMContentLoaded", () => {
  // 1. Neve decorativa no canvas de fundo
  initSnow();

  // 2. Carrega Python/Pyodide em background (não bloqueia a UI)
  initPyodide();

  // 3. Gera botões de exemplo dinamicamente via JS para manter o HTML limpo
  const grid = document.getElementById("examples-grid");
  if (grid) EXAMPLES.forEach((ex, i) => {
    const btn = document.createElement("button");
    btn.className = "example-btn";
    btn.innerHTML = `<span class="ex-name">${ex.a} ≤ x ≤ ${ex.b}</span>${ex.name}`;
    btn.onclick = () => loadExample(i);
    grid.appendChild(btn);
  });

  // 4. Estado inicial das abas de navegação e gráficos
  switchSection("bissecao");
  switchChart("func");
  document.querySelector(".chart-tab")?.classList.add("active");
  document.querySelector(".chart-panel")?.classList.add("active");

  // 5. Atualização em tempo real: ouve "input" e "change" nos campos principais
  ["func-expr", "a-val", "b-val", "tol-val"].forEach(id => {
    document.getElementById(id)?.addEventListener("input",  liveUpdate);
    document.getElementById(id)?.addEventListener("change", liveUpdate);
  });

  // 6. Executa atualização inicial para mostrar o estado do Bolzano com os valores padrão
  liveUpdate();

  // 7. Renderiza tabela inicial de interpolação com os pontos padrão
  renderInterpTable();

  // 8. Atalho de teclado: Ctrl+Enter (ou Cmd+Enter no Mac) executa a bisseção
  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      runBissecao();
    }
  });
});


// ─── Exposição de funções ao HTML ─────────────────────────────────────────────
// Torna as funções acessíveis nos atributos onclick do HTML.
// Necessário porque o arquivo usa "use strict" e as funções não são globais
// automaticamente em módulos com escopo de função.
Object.assign(window, {
  // Execução dos algoritmos
  runBissecao, runComparison, runMultiRoot, runInterpolation,

  // Navegação e interface
  switchSection, switchChart, sortTable, filterTable,

  // Controles de animação
  playAnim, pauseAnim, resetAnim, seekAnim, setAnimSpeed,

  // Interpolação
  addPoint, removePoint, updatePoint,

  // Utilidades de interface
  toggleSidebar, loadExample,
});
