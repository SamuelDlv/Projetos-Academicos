"""
bissecao.py — Cálculo Numérico · Backend Python
================================================
Módulo principal de cálculo numérico para encontrar raízes de funções f(x) = 0.

Métodos implementados:
  - Bisseção          : divide o intervalo ao meio iterativamente
  - Newton-Raphson    : usa derivada numérica para convergência quadrática
  - Secante           : aproxima a derivada com dois pontos consecutivos
  - Falsa Posição     : interpolação linear entre f(a) e f(b)

Funcionalidades extras:
  - Múltiplas raízes  : varredura automática em subintervalos
  - Interpolação      : polinômio interpolador pelo método de Newton (diferenças divididas)

Integração:
  - Executado via Pyodide no navegador (chamado por callPython() em script.js)
  - Entrada e saída via JSON (função run_from_js)
"""

import math
import json

# ─── Ambiente seguro de avaliação ────────────────────────────────────────────
# Dicionário que define quais funções matemáticas podem ser usadas nas
# expressões fornecidas pelo usuário. Impede execução de código arbitrário
# ao bloquear os builtins padrão do Python.
SAFE_MATH = {
    "sin":    math.sin,
    "cos":    math.cos,
    "tan":    math.tan,
    "exp":    math.exp,
    "log":    math.log,       # logaritmo natural (base e)
    "log10":  math.log10,     # logaritmo de base 10
    "sqrt":   math.sqrt,      # raiz quadrada
    "abs":    abs,
    "pi":     math.pi,        # constante π ≈ 3.14159
    "e":      math.e,         # constante de Euler ≈ 2.71828
    "asin":   math.asin,      # arco seno
    "acos":   math.acos,      # arco cosseno
    "atan":   math.atan,      # arco tangente
    "sinh":   math.sinh,      # seno hiperbólico
    "cosh":   math.cosh,      # cosseno hiperbólico
    "tanh":   math.tanh,      # tangente hiperbólica
    "__builtins__": {},        # bloqueia todos os builtins do Python (segurança)
}


# ─── Avaliação segura de expressão ───────────────────────────────────────────
def f(expr, x):
    """
    Avalia a expressão matemática fornecida pelo usuário para um dado valor de x.

    Parâmetros:
        expr (str) : string contendo a expressão, ex: "x**3 - x - 2"
        x    (float): valor numérico em que a função será avaliada

    Retorna:
        float: resultado de f(x)

    Lança:
        Exception: se a expressão for inválida ou contiver erros de sintaxe
    """
    return eval(expr, SAFE_MATH, {"x": x})


# ─── Derivada numérica (diferença centrada) ───────────────────────────────────
def df(expr, x, h=1e-7):
    """
    Calcula a derivada numérica de f(x) no ponto x pelo método das
    diferenças finitas centradas: f'(x) ≈ [f(x+h) - f(x-h)] / (2h).

    A diferença centrada tem erro de ordem O(h²), superior à diferença
    progressiva O(h), tornando-a mais precisa para o mesmo valor de h.

    Parâmetros:
        expr (str)  : expressão da função
        x    (float): ponto de avaliação da derivada
        h    (float): incremento para diferença finita (padrão: 1e-7)

    Retorna:
        float: aproximação de f'(x)
    """
    return (f(expr, x + h) - f(expr, x - h)) / (2 * h)


# ─── Estimativa teórica do número de iterações ────────────────────────────────
def estimar(a, b, tol):
    """
    Calcula o número mínimo de iterações necessárias para que o erro
    da bisseção seja menor que a tolerância especificada.

    Fórmula: n ≥ log₂((b - a) / ε)

    Derivação: após n iterações, o erro máximo é (b-a) / 2ⁿ.
    Para garantir erro < ε, resolve-se: (b-a) / 2ⁿ < ε → n > log₂((b-a)/ε).

    Parâmetros:
        a   (float): extremo esquerdo do intervalo
        b   (float): extremo direito do intervalo
        tol (float): tolerância desejada (ε)

    Retorna:
        int: número estimado de iterações (0 se parâmetros inválidos)
    """
    if tol <= 0 or b <= a:
        return 0
    return math.ceil(math.log2((b - a) / tol))


# ─── Método da Bisseção ───────────────────────────────────────────────────────
def bissecao(expr, a, b, tol=1e-6, max_iter=100):
    """
    Encontra uma raiz de f(x) = 0 no intervalo [a, b] pelo método da bisseção.

    Princípio: se f(a)·f(b) < 0 (Condição de Bolzano), existe ao menos uma
    raiz em (a, b). A cada iteração, calcula o ponto médio c = (a+b)/2 e
    substitui o extremo cujo sinal é igual ao de f(c), reduzindo o intervalo
    pela metade. Convergência garantida com taxa linear (fator 1/2 por iter.).

    Parâmetros:
        expr     (str)  : expressão da função f(x)
        a        (float): extremo esquerdo do intervalo inicial
        b        (float): extremo direito do intervalo inicial
        tol      (float): tolerância para critério de parada (padrão: 1e-6)
        max_iter (int)  : número máximo de iterações permitidas (padrão: 100)

    Retorna:
        dict com:
            "root"               (float): aproximação da raiz encontrada
            "iterations"         (list) : lista de dicts com dados de cada iteração
            "converged"          (bool) : True se convergiu dentro da tolerância
            "total_iterations"   (int)  : número de iterações realizadas
            "final_error"        (float): erro absoluto na última iteração
            "f_root"             (float): valor de f(root) — ideal próximo de zero
            "estimated_iterations"(int) : estimativa teórica do número de iterações
            "error"              (str)  : mensagem de erro (apenas se falhar)
            "warning"            (str)  : aviso se limite de iterações for atingido
    """
    # Avalia f(a) e f(b) com tratamento de exceção para expressões inválidas
    try:
        fa = f(expr, a)
        fb = f(expr, b)
    except Exception as e:
        return {"error": f"Erro ao avaliar a função: {e}"}

    # Verifica se os valores são números finitos (NaN ou Inf causariam problemas)
    if not math.isfinite(fa) or not math.isfinite(fb):
        return {"error": "f(a) ou f(b) resultou em valor inválido (NaN ou infinito)."}

    # Verifica a Condição de Bolzano: os sinais devem ser opostos
    if fa * fb > 0:
        return {"error": "Bolzano não satisfeito: f(a)·f(b) > 0. Ajuste o intervalo [a, b]."}

    # Casos especiais: a raiz está exatamente nos extremos do intervalo
    if fa == 0:
        return {"root": a, "iterations": [], "converged": True,
                "total_iterations": 0, "final_error": 0.0,
                "f_root": 0.0, "estimated_iterations": 0}
    if fb == 0:
        return {"root": b, "iterations": [], "converged": True,
                "total_iterations": 0, "final_error": 0.0,
                "f_root": 0.0, "estimated_iterations": 0}

    iters = []                      # lista para armazenar dados de cada iteração
    est = estimar(a, b, tol)        # estimativa teórica prévia ao loop
    c = a                           # variável do ponto médio (inicializada com a)

    for i in range(1, max_iter + 1):
        # Calcula o ponto médio do intervalo atual
        c = (a + b) / 2.0
        fc = f(expr, c)

        # Erro absoluto: metade do comprimento do intervalo atual
        ae = abs(b - a) / 2.0

        # Erro relativo: razão entre o erro absoluto e o valor atual de c
        # (evita divisão por zero quando c = 0)
        re = ae / abs(c) if c != 0 else ae

        # Registra os dados desta iteração para exibição na tabela
        iters.append({
            "n":         i,
            "a":         a,
            "b":         b,
            "c":         c,
            "fa":        fa,
            "fb":        fb,
            "fc":        fc,
            "abs_error": ae,
            "rel_error": re
        })

        # Critério de convergência: erro abaixo da tolerância,
        # ou f(c) suficientemente próximo de zero, ou raiz exata
        if ae < tol or abs(fc) < tol * 1e-4 or fc == 0:
            return {
                "root":                c,
                "iterations":          iters,
                "converged":           True,
                "total_iterations":    i,
                "final_error":         ae,
                "f_root":              fc,
                "estimated_iterations": est
            }

        # Atualiza o intervalo: descarta a metade onde NÃO há raiz
        # Se f(a) e f(c) têm sinais opostos, a raiz está em [a, c]
        if fa * fc < 0:
            b, fb = c, fc   # descarta [c, b]
        else:
            a, fa = c, fc   # descarta [a, c]

    # Limite de iterações atingido sem convergência
    return {
        "root":             c,
        "iterations":       iters,
        "converged":        False,
        "total_iterations": max_iter,
        "final_error":      abs(b - a) / 2.0,
        "f_root":           f(expr, c),
        "estimated_iterations": est,
        "warning":          f"Limite de {max_iter} iterações atingido sem convergência."
    }


# ─── Método de Newton-Raphson ─────────────────────────────────────────────────
def newton(expr, x0, tol=1e-6, max_iter=100):
    """
    Encontra uma raiz de f(x) = 0 pelo método de Newton-Raphson.

    Princípio: a partir de um ponto inicial x₀, constrói a reta tangente à
    curva em (x, f(x)) e toma seu zero como próxima estimativa:
        x_{n+1} = x_n - f(x_n) / f'(x_n)

    A derivada f'(x) é calculada numericamente por diferenças centradas.
    Convergência quadrática (quando o método funciona): o número de casas
    decimais corretas dobra a cada iteração.

    Atenção: pode divergir se f'(x₀) ≈ 0 ou se x₀ estiver mal escolhido.

    Parâmetros:
        expr     (str)  : expressão da função f(x)
        x0       (float): estimativa inicial da raiz
        tol      (float): tolerância para critério de parada (padrão: 1e-6)
        max_iter (int)  : número máximo de iterações (padrão: 100)

    Retorna:
        dict com "root", "iterations", "converged", "total_iterations",
                 "final_error", "f_root" (ou "error" em caso de falha)
    """
    iters = []
    x = float(x0)

    for i in range(1, max_iter + 1):
        # Avalia f(x) e f'(x) na posição atual
        try:
            fx = f(expr, x)
            fpx = df(expr, x)
        except:
            break   # encerra se a avaliação falhar (ex: domínio inválido)

        # Impede divisão por zero: derivada nula significa tangente horizontal
        if abs(fpx) < 1e-14:
            return {"error": "Derivada zero ou muito próxima de zero em Newton-Raphson."}

        # Calcula próxima estimativa e o erro de correção
        xn = x - fx / fpx
        ae = abs(xn - x)

        # Armazena dados da iteração
        iters.append({
            "n":         i,
            "x":         x,
            "fx":        fx,
            "fpx":       fpx,
            "x_new":     xn,
            "abs_error": ae
        })

        x = xn  # avança para a nova estimativa

        # Critério de parada: correção menor que a tolerância
        if ae < tol:
            return {
                "root":             x,
                "iterations":       iters,
                "converged":        True,
                "total_iterations": i,
                "final_error":      ae,
                "f_root":           f(expr, x)
            }

    # Limite de iterações atingido
    return {
        "root":             x,
        "iterations":       iters,
        "converged":        False,
        "total_iterations": max_iter,
        "final_error":      abs(f(expr, x)),
        "f_root":           f(expr, x),
        "warning":          "Limite de iterações atingido."
    }


# ─── Método da Falsa Posição (Regula Falsi) ───────────────────────────────────
def falsa_posicao(expr, a, b, tol=1e-6, max_iter=100):
    """
    Encontra uma raiz de f(x) = 0 pelo método da falsa posição (Regula Falsi).

    Princípio: semelhante à bisseção, mas em vez de usar o ponto médio,
    usa a interseção com o eixo x da reta que passa por (a, f(a)) e (b, f(b)):
        c = (a·f(b) - b·f(a)) / (f(b) - f(a))

    Geralmente converge mais rápido que a bisseção pura, mantendo a
    garantia de convergência quando a Condição de Bolzano é satisfeita.

    Parâmetros:
        expr     (str)  : expressão da função f(x)
        a        (float): extremo esquerdo do intervalo
        b        (float): extremo direito do intervalo
        tol      (float): tolerância para critério de parada (padrão: 1e-6)
        max_iter (int)  : número máximo de iterações (padrão: 100)

    Retorna:
        dict com "root", "iterations", "converged", "total_iterations",
                 "final_error", "f_root" (ou "error" em caso de falha)
    """
    # Avalia os extremos e verifica Bolzano
    try:
        fa = f(expr, a)
        fb = f(expr, b)
    except Exception as e:
        return {"error": f"Erro ao avaliar a função: {e}"}

    if fa * fb > 0:
        return {"error": "Bolzano não satisfeito: f(a)·f(b) > 0."}

    iters = []
    c = a   # ponto de divisão (inicializado com a)

    for i in range(1, max_iter + 1):
        # Evita divisão por zero quando f(a) e f(b) são iguais (raro, mas possível)
        if abs(fb - fa) < 1e-14:
            break

        # Calcula o ponto de interseção da secante com o eixo x
        c = (a * fb - b * fa) / (fb - fa)
        fc = f(expr, c)

        # Erro absoluto: usa metade do comprimento do intervalo (igual à bisseção)
        ae = abs(b - a) / 2.0

        # Armazena dados da iteração
        iters.append({
            "n":         i,
            "a":         a,
            "b":         b,
            "c":         c,
            "fa":        fa,
            "fb":        fb,
            "fc":        fc,
            "abs_error": ae
        })

        # Critério de convergência
        if abs(fc) < tol or ae < tol:
            return {
                "root":             c,
                "iterations":       iters,
                "converged":        True,
                "total_iterations": i,
                "final_error":      ae,
                "f_root":           fc
            }

        # Atualiza o intervalo mantendo a troca de sinal
        if fa * fc < 0:
            b, fb = c, fc   # raiz está em [a, c]
        else:
            a, fa = c, fc   # raiz está em [c, b]

    # Limite de iterações atingido
    return {
        "root":             c,
        "iterations":       iters,
        "converged":        False,
        "total_iterations": max_iter,
        "final_error":      abs(f(expr, c)),
        "f_root":           f(expr, c),
        "warning":          "Limite de iterações atingido."
    }


# ─── Método da Secante ────────────────────────────────────────────────────────
def secante(expr, x0, x1, tol=1e-6, max_iter=100):
    """
    Encontra uma raiz de f(x) = 0 pelo método da secante.

    Princípio: variação do Newton-Raphson que não requer cálculo da derivada.
    Aproxima f'(x) pela razão de diferenças entre dois pontos consecutivos:
        x_{n+1} = x_n - f(x_n) · (x_n - x_{n-1}) / (f(x_n) - f(x_{n-1}))

    Convergência superlinear (ordem ≈ 1.618 — número de ouro), mais rápida
    que a bisseção mas sem garantia de convergência global como ela.

    Parâmetros:
        expr     (str)  : expressão da função f(x)
        x0       (float): primeira estimativa inicial
        x1       (float): segunda estimativa inicial (diferente de x0)
        tol      (float): tolerância para critério de parada (padrão: 1e-6)
        max_iter (int)  : número máximo de iterações (padrão: 100)

    Retorna:
        dict com "root", "iterations", "converged", "total_iterations",
                 "final_error", "f_root" (ou "error" em caso de falha)
    """
    iters = []
    xp = float(x0)  # ponto anterior (x_{n-1})
    xc = float(x1)  # ponto atual   (x_n)

    for i in range(1, max_iter + 1):
        # Avalia a função nos dois pontos consecutivos
        try:
            fp = f(expr, xp)    # f(x_{n-1})
            fc = f(expr, xc)    # f(x_n)
        except:
            break

        # Denominador da fórmula: diferença entre os valores da função
        d = fc - fp

        # Evita divisão por zero (função constante no intervalo)
        if abs(d) < 1e-14:
            return {"error": "Denominador zero no método da secante (f(x₀) ≈ f(x₁))."}

        # Calcula próxima estimativa usando a fórmula da secante
        xn = xc - fc * (xc - xp) / d
        ae = abs(xn - xc)   # tamanho da correção aplicada

        # Armazena dados da iteração
        iters.append({
            "n":         i,
            "x0":        xp,
            "x1":        xc,
            "fx0":       fp,
            "fx1":       fc,
            "x_new":     xn,
            "abs_error": ae
        })

        # Avança o par de pontos: o atual torna-se o anterior
        xp, xc = xc, xn

        # Critério de parada: correção menor que a tolerância
        if ae < tol:
            return {
                "root":             xc,
                "iterations":       iters,
                "converged":        True,
                "total_iterations": i,
                "final_error":      ae,
                "f_root":           f(expr, xc)
            }

    # Limite de iterações atingido
    return {
        "root":             xc,
        "iterations":       iters,
        "converged":        False,
        "total_iterations": max_iter,
        "final_error":      abs(f(expr, xc)),
        "f_root":           f(expr, xc),
        "warning":          "Limite de iterações atingido."
    }


# ─── Busca de múltiplas raízes ────────────────────────────────────────────────
def multiplas_raizes(expr, a, b, n_subdiv=60, tol=1e-6):
    """
    Encontra todas as raízes distintas de f(x) = 0 no intervalo [a, b]
    usando uma estratégia de varredura por subintervalos.

    Algoritmo:
        1. Divide [a, b] em n_subdiv subintervalos de tamanho igual.
        2. Para cada subintervalo [aᵢ, bᵢ], verifica a Condição de Bolzano.
        3. Se há troca de sinal, aplica bisseção para encontrar a raiz exata.
        4. Elimina raízes duplicadas (diferença menor que tol × 10).
        5. Ordena e retorna a lista de raízes encontradas.

    Limitação: pode não detectar raízes tangentes (onde f não troca de sinal)
    e raízes muito próximas dentro de um mesmo subintervalo.

    Parâmetros:
        expr      (str)  : expressão da função f(x)
        a         (float): início do intervalo de busca
        b         (float): fim do intervalo de busca
        n_subdiv  (int)  : número de subdivisões do intervalo (padrão: 60)
        tol       (float): tolerância para bisseção e detecção de duplicatas

    Retorna:
        dict com:
            "roots" (list): lista de dicts, cada um com:
                "root"      (float): valor da raiz
                "interval"  (list) : subintervalo [aᵢ, bᵢ] onde foi encontrada
                "f_root"    (float): f(root)
                "iterations"(int)  : iterações da bisseção naquele subintervalo
            "count" (int): número total de raízes únicas encontradas
    """
    roots = []      # lista de raízes encontradas (com metadados)
    found = []      # lista de valores numéricos para detecção de duplicatas
    step = (b - a) / n_subdiv  # tamanho de cada subintervalo

    for i in range(n_subdiv):
        ai = a + i * step          # extremo esquerdo do subintervalo atual
        bi = a + (i + 1) * step    # extremo direito do subintervalo atual

        try:
            fai = f(expr, ai)
            fbi = f(expr, bi)

            # Ignora subintervalos onde f retorna valores inválidos
            if not math.isfinite(fai) or not math.isfinite(fbi):
                continue

            # Aplica bisseção apenas se houver troca de sinal (inclui zero exato)
            if fai * fbi <= 0:
                r = bissecao(expr, ai, bi, tol, 80)  # 80 iter. é suficiente para subintervalos pequenos

                if "root" in r:
                    # Arredonda para evitar duplicatas por erros de ponto flutuante
                    rt = round(r["root"], 8)

                    # Verifica se esta raiz já foi encontrada em outro subintervalo
                    if not any(abs(rt - rr) < tol * 10 for rr in found):
                        found.append(rt)
                        roots.append({
                            "root":       rt,
                            "interval":   [ai, bi],
                            "f_root":     r["f_root"],
                            "iterations": r["total_iterations"]
                        })
        except:
            pass    # ignora subintervalos onde a avaliação falha (ex: descontinuidades)

    # Ordena as raízes em ordem crescente de valor
    roots.sort(key=lambda x: x["root"])

    return {
        "roots": roots,
        "count": len(roots)
    }


# ─── Polinômio Interpolador de Newton (diferenças divididas) ─────────────────
def interpolar(points_json, n_plot=300):
    """
    Calcula o polinômio interpolador P(x) pelo método das diferenças
    divididas de Newton para um conjunto de pontos (xᵢ, yᵢ).

    O polinômio resultante passa exatamente por todos os pontos fornecidos
    e tem grau (n - 1), sendo n o número de pontos.

    Forma de Newton:
        P(x) = c₀ + c₁(x−x₀) + c₂(x−x₀)(x−x₁) + ... + cₙ₋₁∏(x−xᵢ)

    Os coeficientes cᵢ são as diferenças divididas de ordem i, calculadas
    pela tabela de diferenças divididas (algoritmo de Horner para avaliação).

    Parâmetros:
        points_json (list): lista de pares [x, y], ex: [[0,1],[1,3],[2,7]]
        n_plot      (int) : número de pontos para plotagem da curva (padrão: 300)

    Retorna:
        dict com:
            "coef"    (list) : coeficientes das diferenças divididas [c₀, c₁, ..., cₙ₋₁]
            "xs"      (list) : abscissas dos pontos fornecidos (ordenadas)
            "ys"      (list) : ordenadas dos pontos fornecidos
            "plot_x"  (list) : valores de x para plotagem (n_plot + 1 pontos)
            "plot_y"  (list) : valores de P(x) para plotagem (None se inválido)
            "poly_str"(str)  : representação textual do polinômio
    """
    # Ordena os pontos em ordem crescente de x (necessário para o algoritmo)
    pts = sorted(points_json, key=lambda p: p[0])
    xs = [p[0] for p in pts]   # abscissas
    ys = [p[1] for p in pts]   # ordenadas
    n = len(xs)

    # ── Cálculo das diferenças divididas ────────────────────────────────
    # Inicializa o vetor de coeficientes com os valores y (diferenças de ordem 0)
    coef = list(ys)

    # Calcula diferenças divididas de ordem 1 até n-1 in-place
    # Ao final, coef[i] contém a diferença dividida f[x₀, x₁, ..., xᵢ]
    for j in range(1, n):
        for i in range(n - 1, j - 1, -1):
            coef[i] = (coef[i] - coef[i - 1]) / (xs[i] - xs[i - j])

    # ── Geração dos pontos para o gráfico ───────────────────────────────
    # Estende o domínio 20% além dos extremos dos dados para melhor visualização
    span = (xs[-1] - xs[0]) * 0.2
    xmin = xs[0] - span
    xmax = xs[-1] + span

    px = [xmin + i * (xmax - xmin) / n_plot for i in range(n_plot + 1)]
    py = []

    for x in px:
        # Avalia o polinômio em x usando o algoritmo de Horner (recursão reversa)
        # P(x) = c_{n-1} · ∏(x-xᵢ) + ... + c₁·(x-x₀) + c₀
        v = coef[-1]
        for i in range(n - 2, -1, -1):
            v = v * (x - xs[i]) + coef[i]

        # Substitui valores inválidos por None para evitar problemas no gráfico
        py.append(v if math.isfinite(v) else None)

    # ── Monta representação textual do polinômio ─────────────────────────
    # Cada termo: coef[i] · (x-x₀)·(x-x₁)·...·(x-x_{i-1})
    terms = []
    for i, c in enumerate(coef):
        if abs(c) < 1e-12:
            continue    # ignora coeficientes negligenciáveis

        t = f"{c:+.4f}"  # formata o coeficiente com sinal (+/-)

        # Acrescenta os fatores (x - xⱼ) para cada j < i
        for j in range(i):
            t += f"·(x{-xs[j]:+.3f})"

        terms.append(t)

    return {
        "coef":     coef,
        "xs":       xs,
        "ys":       ys,
        "plot_x":   px,
        "plot_y":   py,
        "poly_str": " ".join(terms) if terms else "0"
    }


# ─── Dispatcher principal (interface com JavaScript) ─────────────────────────
def run_from_js(payload_json):
    """
    Ponto de entrada único chamado pelo JavaScript (via Pyodide).

    Recebe um JSON com o comando e os parâmetros, executa o método
    correspondente e retorna o resultado serializado como JSON.

    Comandos suportados no campo "cmd":
        "bissecao"      → método da bisseção
        "newton"        → método de Newton-Raphson
        "falsa_posicao" → método da falsa posição
        "secante"       → método da secante
        "multiplas"     → busca de múltiplas raízes
        "interpolar"    → interpolação polinomial de Newton
        "comparar"      → executa todos os quatro métodos e retorna juntos

    Campos esperados no JSON (variam por comando):
        "expr"     : expressão da função f(x)
        "a", "b"   : extremos do intervalo
        "x0", "x1" : estimativas iniciais (Newton, Secante)
        "tol"      : tolerância (padrão: 1e-6)
        "max_iter" : número máximo de iterações (padrão: 100)
        "n_subdiv" : subdivisões para múltiplas raízes (padrão: 60)
        "points"   : lista [[x,y], ...] para interpolação

    Parâmetros:
        payload_json (str): string JSON com o payload da requisição

    Retorna:
        str: resultado serializado em JSON
    """
    d = json.loads(payload_json)

    # Extrai parâmetros comuns a todos os métodos
    cmd      = d.get("cmd", "bissecao")
    tol      = float(d.get("tol", 1e-6))
    mi       = int(d.get("max_iter", 100))
    expr     = d.get("expr", "x")

    # Roteia para o método correto com base no comando recebido
    if cmd == "bissecao":
        r = bissecao(expr, float(d["a"]), float(d["b"]), tol, mi)

    elif cmd == "newton":
        r = newton(expr, float(d["x0"]), tol, mi)

    elif cmd == "falsa_posicao":
        r = falsa_posicao(expr, float(d["a"]), float(d["b"]), tol, mi)

    elif cmd == "secante":
        r = secante(expr, float(d["x0"]), float(d["x1"]), tol, mi)

    elif cmd == "multiplas":
        r = multiplas_raizes(
            expr,
            float(d["a"]),
            float(d["b"]),
            int(d.get("n_subdiv", 60)),
            tol
        )

    elif cmd == "interpolar":
        r = interpolar(d["points"])

    elif cmd == "comparar":
        # Executa os quatro métodos simultaneamente para comparação
        a, b = float(d["a"]), float(d["b"])
        mid = (a + b) / 2  # ponto médio usado como x₀ para Newton e Secante

        r = {
            "bissecao":      bissecao(expr, a, b, tol, mi),
            "falsa_posicao": falsa_posicao(expr, a, b, tol, mi),
            "newton":        newton(expr, mid, tol, mi),     # x₀ = ponto médio
            "secante":       secante(expr, a, b, tol, mi)    # x₀=a, x₁=b
        }

    else:
        r = {"error": f"Comando desconhecido: '{cmd}'."}

    return json.dumps(r)
