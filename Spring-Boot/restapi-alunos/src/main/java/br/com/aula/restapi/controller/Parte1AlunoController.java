package br.com.aula.restapi.controller;

import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Profile("!parte2")
@RequestMapping("/aluno")
public class Parte1AlunoController {

    @GetMapping
    public String consulta() {
        return "Aprendendo Rest API";
    }
}
