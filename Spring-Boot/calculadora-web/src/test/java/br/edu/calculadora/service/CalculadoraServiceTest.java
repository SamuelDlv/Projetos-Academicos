package br.edu.calculadora.service;

import br.edu.calculadora.model.ResultadoCalculadora;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class CalculadoraServiceTest {
    private final CalculadoraService service = new CalculadoraService();

    @Test void deveSomarInteiros() { assertResultado(2, 3, "adicao", 5); }
    @Test void deveSomarDecimais() { assertResultado(1.5, 2.25, "adicao", 3.75); }
    @Test void deveSubtrair() { assertResultado(9, 4, "subtracao", 5); }
    @Test void deveSubtrairComResultadoNegativo() { assertResultado(4, 9, "subtracao", -5); }
    @Test void deveMultiplicar() { assertResultado(6, 7, "multiplicacao", 42); }
    @Test void deveMultiplicarPorNumeroNegativo() { assertResultado(-3, 4, "multiplicacao", -12); }
    @Test void deveDividir() { assertResultado(10, 4, "divisao", 2.5); }
    @Test void deveDividirNumeroNegativo() { assertResultado(-12, 3, "divisao", -4); }
    @Test void deveElevarNumero() { assertResultado(2, 3, "exponenciacao", 8); }
    @Test void deveRetornarUmParaExpoenteZero() { assertResultado(12, 0, "exponenciacao", 1); }
    @Test void deveAceitarOperacaoComEspacosEMaiusculas() { assertResultado(2, 4, "  ADICAO  ", 6); }

    @Test
    void deveInformarErroNaDivisaoPorZero() {
        ResultadoCalculadora resposta = service.calcular(10, 0, "divisao");
        assertNull(resposta.resultado());
        assertEquals("não é possível dividir por zero", resposta.situacao());
    }

    @Test
    void deveInformarErroEmOperacaoInvalida() {
        ResultadoCalculadora resposta = service.calcular(10, 2, "raiz");
        assertNull(resposta.resultado());
        assertEquals("operação inválida", resposta.situacao());
    }

    private void assertResultado(double primeiro, double segundo, String operacao, double esperado) {
        ResultadoCalculadora resposta = service.calcular(primeiro, segundo, operacao);
        assertEquals(esperado, resposta.resultado());
        assertEquals("sucesso", resposta.situacao());
    }
}
