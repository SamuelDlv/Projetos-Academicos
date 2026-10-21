package br.com.aula.loja.repository;
import br.com.aula.loja.entity.Curso;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CursoRepository extends JpaRepository<Curso, Long> { }
