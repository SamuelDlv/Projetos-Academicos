package br.edu.calculadora.controller;

import br.edu.calculadora.model.ResultadoCalculadora;
import br.edu.calculadora.service.CalculadoraService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/calculadora")
public class CalculadoraController {
    private final CalculadoraService calculadoraService;

    public CalculadoraController(CalculadoraService calculadoraService) {
        this.calculadoraService = calculadoraService;
    }

    @GetMapping
    @Operation(
            summary = "Executa um cálculo",
            description = "Recebe dois números e uma operação: adicao, subtracao, multiplicacao, divisao ou exponenciacao.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Cálculo executado com sucesso"),
                    @ApiResponse(responseCode = "400", description = "Operação inválida ou divisão por zero")
            })
    public ResponseEntity<ResultadoCalculadora> calcular(
            @RequestParam double primeiroNumero,
            @RequestParam double segundoNumero,
            @RequestParam String operacao) {
        ResultadoCalculadora resposta = calculadoraService.calcular(primeiroNumero, segundoNumero, operacao);
        HttpStatus status = resposta.situacao().equals("sucesso") ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(resposta);
    }
}
