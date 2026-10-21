package br.com.aula.loja.repository;
import br.com.aula.loja.entity.Professor;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ProfessorRepository extends JpaRepository<Professor, Long> { }
