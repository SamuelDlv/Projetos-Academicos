const form = document.querySelector('#form-calculadora');
const painel = document.querySelector('#resultado');
const valor = document.querySelector('#valor');
const situacao = document.querySelector('#situacao');
const primeiroInput = document.querySelector('#primeiroNumero');
const segundoInput = document.querySelector('#segundoNumero');
const operacaoInput = document.querySelector('#operacao');
const validacao = document.querySelector('#validacao');
const historyList = document.querySelector('#history-list');
const emptyHistory = document.querySelector('#empty-history');
const themeButton = document.querySelector('#theme-toggle');
const clearHistoryButton = document.querySelector('#clear-history');
const historyKey = 'calculadora-historico';

let history = JSON.parse(localStorage.getItem(historyKey) || '[]');

const nomesOperacoes = {
    adicao: '+',
    subtracao: '−',
    multiplicacao: '×',
    divisao: '÷',
    exponenciacao: '^'
};

function formatNumber(number) {
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 10 }).format(number);
}

function validarDivisao() {
    const divisaoPorZero = operacaoInput.value === 'divisao' && Number(segundoInput.value) === 0;
    validacao.textContent = divisaoPorZero ? 'Não é possível dividir por zero.' : '';
    segundoInput.setCustomValidity(divisaoPorZero ? 'Não é possível dividir por zero.' : '');
    return !divisaoPorZero;
}

function renderHistory() {
    historyList.innerHTML = '';
    emptyHistory.hidden = history.length > 0;

    history.forEach((item) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'history-item';
        button.textContent = `${formatNumber(item.primeiroNumero)} ${nomesOperacoes[item.operacao]} ${formatNumber(item.segundoNumero)} = ${formatNumber(item.resultado)}`;
        button.addEventListener('click', () => {
            primeiroInput.value = item.primeiroNumero;
            segundoInput.value = item.segundoNumero;
            operacaoInput.value = item.operacao;
            validarDivisao();
        });
        historyList.append(button);
    });
}

function addHistory(dados) {
    history.unshift(dados);
    history = history.slice(0, 8);
    localStorage.setItem(historyKey, JSON.stringify(history));
    renderHistory();
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validarDivisao()) {
        segundoInput.reportValidity();
        return;
    }

    const primeiroNumero = primeiroInput.value;
    const segundoNumero = segundoInput.value;
    const operacao = operacaoInput.value;
    const parametros = new URLSearchParams({ primeiroNumero, segundoNumero, operacao });
    painel.style.display = 'block';
    painel.classList.remove('erro');
    valor.textContent = 'Calculando…';
    situacao.textContent = '';

    try {
        const resposta = await fetch(`/api/calculadora?${parametros}`);
        const dados = await resposta.json();
        const sucesso = resposta.ok;
        painel.classList.toggle('erro', !sucesso);
        valor.textContent = sucesso ? formatNumber(dados.resultado) : 'Não foi possível calcular';
        situacao.textContent = dados.situacao;

        if (sucesso) {
            addHistory(dados);
        }
    } catch {
        painel.classList.add('erro');
        valor.textContent = 'Erro de conexão';
        situacao.textContent = 'Verifique se a aplicação Spring Boot está em execução.';
    }
});

document.querySelectorAll('[data-operation]').forEach((button) => {
    button.addEventListener('click', () => {
        operacaoInput.value = button.dataset.operation;
        validarDivisao();
    });
});

[segundoInput, operacaoInput].forEach((element) => {
    element.addEventListener('input', validarDivisao);
    element.addEventListener('change', validarDivisao);
});

themeButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const darkTheme = document.body.classList.contains('dark-theme');
    themeButton.textContent = darkTheme ? '☀' : '☾';
    localStorage.setItem('calculadora-tema', darkTheme ? 'escuro' : 'claro');
});

clearHistoryButton.addEventListener('click', () => {
    history = [];
    localStorage.removeItem(historyKey);
    renderHistory();
});

if (localStorage.getItem('calculadora-tema') === 'escuro') {
    themeButton.click();
}

renderHistory();
