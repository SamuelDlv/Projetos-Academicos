package br.com.aula.loja.service;

import br.com.aula.loja.entity.Curso;
import br.com.aula.loja.entity.Professor;
import br.com.aula.loja.repository.CursoRepository;
import br.com.aula.loja.repository.ProfessorRepository;
import br.com.aula.loja.request.CursoRequest;
import br.com.aula.loja.response.CursoResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class CursoService {
    private final CursoRepository cursoRepository;
    private final ProfessorRepository professorRepository;
    public CursoService(CursoRepository cursoRepository, ProfessorRepository professorRepository) {
        this.cursoRepository = cursoRepository; this.professorRepository = professorRepository;
    }
    @Transactional
    public CursoResponse save(CursoRequest request) {
        Professor professor = professorRepository.findById(request.professorId()).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Professor não encontrado"));
        Curso curso = new Curso();
        curso.setNome(request.nome().trim());
        curso.setProfessor(professor);
        return toResponse(cursoRepository.save(curso));
    }
    @Transactional(readOnly = true)
    public List<CursoResponse> findAll() { return cursoRepository.findAll().stream().map(this::toResponse).toList(); }
    @Transactional(readOnly = true)
    public CursoResponse findById(Long id) {
        return cursoRepository.findById(id).map(this::toResponse).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso não encontrado"));
    }
    private CursoResponse toResponse(Curso c) { return new CursoResponse(c.getId(), c.getNome(), c.getProfessor().getId()); }
}
