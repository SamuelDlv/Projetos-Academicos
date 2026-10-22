package br.com.aula.restapi.controller;

import br.com.aula.restapi.request.RequestAluno;
import br.com.aula.restapi.service.AlunoService;
import java.util.List;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Profile("parte2")
@RequestMapping("/aluno")
public class AlunoController {

    private final AlunoService service;

    public AlunoController(AlunoService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void cadastroaluno(@RequestBody RequestAluno aluno) {
        service.save(aluno);
    }

    @GetMapping
    public List<RequestAluno> consultaaluno() {
        return service.findall();
    }
}
