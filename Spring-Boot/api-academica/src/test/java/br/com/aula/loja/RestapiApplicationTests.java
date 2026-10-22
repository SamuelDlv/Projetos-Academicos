package br.com.aula.loja;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class RestapiApplicationTests {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void contextLoads() {
	}

	@Test
	void cadastraRelacionamentosDoEnunciado() throws Exception {
		mockMvc.perform(post("/professores").contentType(MediaType.APPLICATION_JSON)
				.content("{\"nome\":\"Ana\",\"email\":\"ana@faculdade.edu\",\"departamento\":\"Computação\"}"))
				.andExpect(status().isCreated()).andExpect(jsonPath("$.id").value(1));
		mockMvc.perform(post("/cursos").contentType(MediaType.APPLICATION_JSON)
				.content("{\"nome\":\"Spring Boot\",\"professorId\":1}"))
				.andExpect(status().isCreated()).andExpect(jsonPath("$.professorId").value(1));
		mockMvc.perform(post("/alunos").contentType(MediaType.APPLICATION_JSON)
				.content("{\"nome\":\"João\",\"email\":\"joao@aluno.edu\",\"cursoId\":1}"))
				.andExpect(status().isCreated()).andExpect(jsonPath("$.cursoId").value(1));
	}

}
