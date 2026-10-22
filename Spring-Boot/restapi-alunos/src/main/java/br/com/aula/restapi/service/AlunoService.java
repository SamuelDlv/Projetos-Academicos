package br.com.aula.restapi.service;

import br.com.aula.restapi.repository.AlunoRepository;
import br.com.aula.restapi.request.RequestAluno;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class AlunoService {

    private final AlunoRepository repository;

    public AlunoService(AlunoRepository repository) {
        this.repository = repository;
    }

    public void save(RequestAluno aluno) {
        repository.save(aluno);
    }

    public List<RequestAluno> findall() {
        return repository.findAll();
    }
}
