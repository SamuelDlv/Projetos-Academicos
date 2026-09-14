# Método da Bisseção — Cálculo Numérico

Aplicação web interativa para encontrar raízes de funções (`f(x) = 0`), desenvolvida como trabalho acadêmico de Cálculo Numérico. Além da Bisseção, o site também implementa Newton-Raphson, Secante e Falsa Posição para fins de comparação, busca de múltiplas raízes e interpolação polinomial de Newton.

> 📘 Um guia de uso completo e ilustrado, voltado para quem nunca teve contato com o tema, está disponível em [`Manual_do_Usuário.pdf`](./Manual_do_Usuário.pdf).

## Como executar

Este é um projeto **100% estático** — sem backend, sem instalação de dependências e sem build. Basta abrir `index.html` em um navegador atualizado.

Como o Python roda diretamente no navegador (não é preciso instalar nada localmente), a primeira execução pode demorar alguns segundos enquanto o runtime carrega. É necessário estar conectado à internet, já que o Pyodide e o Chart.js são carregados via CDN (ver seção de dependências abaixo).

Recomenda-se servir os arquivos por um servidor local simples em vez de abrir o `index.html` diretamente com `file://`, para evitar bloqueios de CORS em alguns navegadores:

```bash
python -m http.server 8000
```

Depois acesse [http://localhost:8000](http://localhost:8000).

## Funcionalidades

- **Bisseção** — calculadora principal: define `f(x)`, intervalo `[a, b]`, tolerância e número máximo de iterações; exibe raiz, erro, tabela de iterações e gráficos (função, convergência e evolução do intervalo).
- **Animação** — visualização passo a passo do fechamento do intervalo até a raiz, com controles de play/pause/velocidade.
- **Comparação de métodos** — roda Bisseção, Falsa Posição, Newton-Raphson e Secante ao mesmo tempo e compara velocidade de convergência.
- **Múltiplas raízes** — varre um intervalo maior em subintervalos, aplicando a Condição de Bolzano em cada um, para encontrar todas as raízes de uma função.
- **Interpolação** — gera o Polinômio Interpolador de Newton a partir de pontos `(x, y)` fornecidos pelo usuário.

## Estrutura do projeto

```
.
├── index.html              # Estrutura da página e código Python embutido (executado via Pyodide)
├── style.css                # Estilos visuais (tema, layout, responsividade)
├── script.js                 # Lógica de interface: navegação entre abas, chamadas ao Python, gráficos (Chart.js), animação
├── bissecao.py                 # Módulo Python de referência com os métodos numéricos comentados (mesma lógica embutida em index.html)
└── Manual_do_Usuário.pdf         # Guia de uso ilustrado, voltado ao usuário final
```

**Nota sobre `bissecao.py`:** o motor de cálculo que efetivamente roda no site está embutido dentro da tag `<script id="python-source" type="text/python">` em `index.html`, pois é esse conteúdo que o Pyodide lê e executa. O arquivo `bissecao.py` contém a mesma lógica de forma independente e comentada, servindo como referência/documentação do algoritmo e para eventual execução ou correção fora do navegador.

## Métodos numéricos implementados

| Método          | Ideia central                                                        |
|------------------|--------------------------------------------------------------------|
| Bisseção          | Divide o intervalo `[a, b]` ao meio repetidamente (requer troca de sinal — Condição de Bolzano). |
| Falsa Posição      | Como a Bisseção, mas escolhe o ponto de divisão pela reta entre `f(a)` e `f(b)`. |
| Newton-Raphson      | Usa a derivada da função para convergência rápida (quadrática).      |
| Secante              | Como Newton-Raphson, mas aproxima a derivada com dois pontos, sem precisar calculá-la analiticamente. |

## Tecnologias

- **HTML / CSS / JavaScript** — estrutura, estilo e interatividade.
- **[Pyodide](https://pyodide.org/) v0.25.0** — executa o Python (`bissecao.py`) diretamente no navegador via WebAssembly.
- **[Chart.js](https://www.chartjs.org/) v4.4.1** — renderização dos gráficos de função, convergência e comparação.

## Autoria

Trabalho desenvolvido para a disciplina de Cálculo Numérico, 2026.
