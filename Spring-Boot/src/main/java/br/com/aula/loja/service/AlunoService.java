package br.com.aula.loja.service;

import br.com.aula.loja.entity.Aluno;
import br.com.aula.loja.entity.Curso;
import br.com.aula.loja.repository.AlunoRepository;
import br.com.aula.loja.repository.CursoRepository;
import br.com.aula.loja.request.AlunoRequest;
import br.com.aula.loja.response.AlunoResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class AlunoService {
    private final AlunoRepository alunoRepository;
    private final CursoRepository cursoRepository;
    public AlunoService(AlunoRepository alunoRepository, CursoRepository cursoRepository) {
        this.alunoRepository = alunoRepository; this.cursoRepository = cursoRepository;
    }
    @Transactional
    public AlunoResponse save(AlunoRequest request) {
        Curso curso = cursoRepository.findById(request.cursoId()).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso não encontrado"));
        Aluno aluno = new Aluno();
        aluno.setNome(request.nome().trim());
        aluno.setEmail(request.email().trim());
        aluno.setCurso(curso);
        return toResponse(alunoRepository.save(aluno));
    }
    @Transactional(readOnly = true)
    public List<AlunoResponse> findAll() { return alunoRepository.findAll().stream().map(this::toResponse).toList(); }
    private AlunoResponse toResponse(Aluno a) { return new AlunoResponse(a.getId(), a.getNome(), a.getEmail(), a.getCurso().getId()); }
}
