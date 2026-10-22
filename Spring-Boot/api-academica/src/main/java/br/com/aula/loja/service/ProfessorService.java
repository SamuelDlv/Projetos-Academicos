package br.com.aula.loja.service;

import br.com.aula.loja.entity.Professor;
import br.com.aula.loja.repository.ProfessorRepository;
import br.com.aula.loja.request.ProfessorRequest;
import br.com.aula.loja.response.ProfessorResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class ProfessorService {
    private final ProfessorRepository repository;
    public ProfessorService(ProfessorRepository repository) { this.repository = repository; }
    @Transactional
    public ProfessorResponse save(ProfessorRequest request) {
        Professor professor = new Professor();
        professor.setNome(request.nome().trim());
        professor.setEmail(request.email().trim());
        professor.setDepartamento(request.departamento() == null ? null : request.departamento().trim());
        return toResponse(repository.save(professor));
    }
    @Transactional(readOnly = true)
    public List<ProfessorResponse> findAll() { return repository.findAll().stream().map(this::toResponse).toList(); }
    private ProfessorResponse toResponse(Professor p) { return new ProfessorResponse(p.getId(), p.getNome(), p.getEmail(), p.getDepartamento()); }
}
