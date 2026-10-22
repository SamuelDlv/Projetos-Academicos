package br.edu.calculadora.service;

import br.edu.calculadora.model.ResultadoCalculadora;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.Set;

@Service
public class CalculadoraService {
    private static final Set<String> OPERACOES = Set.of(
            "adicao", "subtracao", "multiplicacao", "divisao", "exponenciacao");

    public ResultadoCalculadora calcular(double primeiroNumero, double segundoNumero, String operacao) {
        String operacaoNormalizada = normalizar(operacao);

        if (!OPERACOES.contains(operacaoNormalizada)) {
            return erro(primeiroNumero, segundoNumero, operacao, "operação inválida");
        }
        if (operacaoNormalizada.equals("divisao") && segundoNumero == 0.0) {
            return erro(primeiroNumero, segundoNumero, operacaoNormalizada, "não é possível dividir por zero");
        }

        double resultado = switch (operacaoNormalizada) {
            case "adicao" -> primeiroNumero + segundoNumero;
            case "subtracao" -> primeiroNumero - segundoNumero;
            case "multiplicacao" -> primeiroNumero * segundoNumero;
            case "divisao" -> primeiroNumero / segundoNumero;
            case "exponenciacao" -> Math.pow(primeiroNumero, segundoNumero);
            default -> throw new IllegalStateException("Operação já validada");
        };

        return new ResultadoCalculadora(primeiroNumero, segundoNumero, operacaoNormalizada, resultado, "sucesso");
    }

    private ResultadoCalculadora erro(double primeiroNumero, double segundoNumero, String operacao, String mensagem) {
        return new ResultadoCalculadora(primeiroNumero, segundoNumero, operacao, null, mensagem);
    }

    private String normalizar(String operacao) {
        return operacao == null ? "" : operacao.trim().toLowerCase(Locale.ROOT);
    }
}
