package br.com.aula.loja;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class RestapiApplicationTests {

	@Autowired
	private MockMvc mockMvc;
	@Autowired
	private ObjectMapper objectMapper;

	@Test
	void contextLoads() {
	}

	@Test
	@Disabled("Teste legado com IDs fixos")
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
		mockMvc.perform(get("/cursos/1"))
				.andExpect(status().isOk()).andExpect(jsonPath("$.id").value(1));
	}

	@Test
	@Disabled("Teste legado com e-mail fixo")
	void retornaConflitoParaEmailDuplicado() throws Exception {
		String professor = "{\"nome\":\"Ana\",\"email\":\"duplicado@faculdade.edu\",\"departamento\":\"Computação\"}";
		mockMvc.perform(post("/professores").contentType(MediaType.APPLICATION_JSON).content(professor))
				.andExpect(status().isCreated());
		mockMvc.perform(post("/professores").contentType(MediaType.APPLICATION_JSON).content(professor))
				.andExpect(status().isConflict());
	}

	@Test
	void consultaCursoPorIdERetornaConflitoParaEmailDuplicado() throws Exception {
		String sufixo = UUID.randomUUID().toString();
		MvcResult professorResult = mockMvc.perform(post("/professores").contentType(MediaType.APPLICATION_JSON)
				.content("{\"nome\":\"Ana\",\"email\":\"ana-" + sufixo + "@faculdade.edu\"}"))
				.andExpect(status().isCreated()).andReturn();
		long professorId = objectMapper.readTree(professorResult.getResponse().getContentAsString()).get("id").asLong();
		MvcResult cursoResult = mockMvc.perform(post("/cursos").contentType(MediaType.APPLICATION_JSON)
				.content("{\"nome\":\"Spring Boot\",\"professorId\":" + professorId + "}"))
				.andExpect(status().isCreated()).andReturn();
		long cursoId = objectMapper.readTree(cursoResult.getResponse().getContentAsString()).get("id").asLong();
		mockMvc.perform(get("/cursos/" + cursoId))
				.andExpect(status().isOk()).andExpect(jsonPath("$.id").value(cursoId));
		mockMvc.perform(post("/professores").contentType(MediaType.APPLICATION_JSON)
				.content("{\"nome\":\"Ana\",\"email\":\"ana-" + sufixo + "@faculdade.edu\"}"))
				.andExpect(status().isConflict());
	}

}
