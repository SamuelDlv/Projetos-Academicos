package br.com.aula.loja.controller;
import br.com.aula.loja.request.CursoRequest;
import br.com.aula.loja.response.CursoResponse;
import br.com.aula.loja.service.CursoService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/cursos")
public class CursoController {
    private final CursoService service;
    public CursoController(CursoService service) { this.service = service; }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public CursoResponse cadastrar(@RequestBody CursoRequest request) { return service.save(request); }
    @GetMapping public List<CursoResponse> consultar() { return service.findAll(); }
}
