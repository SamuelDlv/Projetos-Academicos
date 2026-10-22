package br.com.aula.restapi.repository;

import br.com.aula.restapi.request.RequestAluno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlunoRepository extends JpaRepository<RequestAluno, Integer> {
}
