package br.edu.calculadora.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CalculadoraControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void deveRetornarResultadoDoEndpoint() throws Exception {
        mockMvc.perform(get("/api/calculadora")
                        .param("primeiroNumero", "3")
                        .param("segundoNumero", "4")
                        .param("operacao", "multiplicacao"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resultado").value(12.0))
                .andExpect(jsonPath("$.situacao").value("sucesso"));
    }

    @Test
    void deveRetornarBadRequestNaDivisaoPorZero() throws Exception {
        mockMvc.perform(get("/api/calculadora")
                        .param("primeiroNumero", "3")
                        .param("segundoNumero", "0")
                        .param("operacao", "divisao"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.situacao").value("não é possível dividir por zero"));
    }
}
