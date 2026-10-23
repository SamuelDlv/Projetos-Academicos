package br.com.aula.loja.controller;
import br.com.aula.loja.request.AlunoRequest;
import br.com.aula.loja.response.AlunoResponse;
import br.com.aula.loja.service.AlunoService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/alunos")
public class AlunoController {
    private final AlunoService service;
    public AlunoController(AlunoService service) { this.service = service; }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public AlunoResponse cadastrar(@RequestBody AlunoRequest request) { return service.save(request); }
    @GetMapping public List<AlunoResponse> consultar() { return service.findAll(); }
    @GetMapping("/{id}")
    public AlunoResponse consultarPorId(@PathVariable Long id) { return service.findById(id); }
}
