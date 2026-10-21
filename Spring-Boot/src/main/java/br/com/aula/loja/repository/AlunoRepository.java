package br.com.aula.loja.repository;
import br.com.aula.loja.entity.Aluno;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AlunoRepository extends JpaRepository<Aluno, Long> { }
