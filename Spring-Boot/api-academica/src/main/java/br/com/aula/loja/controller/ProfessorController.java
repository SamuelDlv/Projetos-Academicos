package br.com.aula.loja.controller;
import br.com.aula.loja.request.ProfessorRequest;
import br.com.aula.loja.response.ProfessorResponse;
import br.com.aula.loja.service.ProfessorService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/professores")
public class ProfessorController {
    private final ProfessorService service;
    public ProfessorController(ProfessorService service) { this.service = service; }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public ProfessorResponse cadastrar(@RequestBody ProfessorRequest request) { return service.save(request); }
    @GetMapping public List<ProfessorResponse> consultar() { return service.findAll(); }
    @GetMapping("/{id}")
    public ProfessorResponse consultarPorId(@PathVariable Long id) { return service.findById(id); }
}
