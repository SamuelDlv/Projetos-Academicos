package br.edu.calculadora.model;

public record ResultadoCalculadora(
        double primeiroNumero,
        double segundoNumero,
        String operacao,
        Double resultado,
        String situacao) {
}
