# API acadêmica - Spring Boot

Projeto de faculdade que implementa a modelagem solicitada: **Professor**, **Curso** e **Aluno**.

## Modelo de dados

- Professor: `id_professor`, `nome`, `email` único e `departamento`.
- Curso: `id_curso`, `nome` e `id_professor` como chave estrangeira.
- Aluno: `id_aluno`, `nome`, `email` único e `id_curso` como chave estrangeira.

As relações são `Professor 1:N Curso` e `Curso 1:N Aluno`. Nos JSONs de curso e aluno, a relação é recebida somente pelo ID, como recomendado no enunciado.

## Executar

Abra o PowerShell dentro da pasta `Spring-Boot/api-academica` deste repositório (onde está o `pom.xml`).

### Preparar o JDK portátil (somente na primeira vez)

O JDK não está incluído no repositório. Baixe o **Temurin JDK 17, Windows x64, formato ZIP** no [site oficial do Adoptium](https://adoptium.net/temurin/releases/?version=17&os=windows&arch=x64&package=jdk).

Crie a pasta `.tools\jdk-17` e extraia o ZIP dentro dela, mantendo a pasta do JDK. A estrutura deve ficar assim:

```text
api-academica/
  .tools/
    jdk-17/
      jdk-17.../
        bin/
          java.exe
  pom.xml
  mvnw.cmd
```

### Iniciar a API

Execute no PowerShell:

```powershell
$env:JAVA_HOME = (Get-ChildItem '.tools\jdk-17' -Directory | Select-Object -First 1).FullName
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--server.port=8081"
```

Aguarde a mensagem de que o Tomcat iniciou na porta **8081** e mantenha o terminal aberto. Na primeira execução, o Maven Wrapper precisa de internet para baixar o Maven e as dependências.

O H2 em memória pode ser acessado em `http://localhost:8081/h2-console`, com JDBC URL `jdbc:h2:mem:academico`, usuário `sa` e senha em branco. Os dados são apagados quando a aplicação é encerrada.

## Endpoints

| Método | URL | Corpo JSON |
|---|---|---|
| POST | `/professores` | `{"nome":"Ana Lima","email":"ana@faculdade.edu","departamento":"Computação"}` |
| GET | `/professores` | - |
| POST | `/cursos` | `{"nome":"Spring Boot","professorId":1}` |
| GET | `/cursos` | - |
| POST | `/alunos` | `{"nome":"João Silva","email":"joao@aluno.edu","cursoId":1}` |
| GET | `/alunos` | - |

Importe `postman/Projeto-Academico.postman_collection.json` no Postman e execute na ordem exibida. A coleção guarda automaticamente os IDs retornados para criar o curso e o aluno relacionados.

## Executar no Postman e capturar as telas

A coleção usa `http://localhost:8081` como `baseUrl`. Se já tiver importado uma versão anterior, atualize essa variável ou substitua a URL de cada requisição pelos endereços abaixo. No Postman Web, use o Desktop Agent para acessar a API local.

```text
POST 1 - Cadastrar professor
http://localhost:8081/professores

POST 2 - Cadastrar curso
http://localhost:8081/cursos

POST 3 - Cadastrar aluno
http://localhost:8081/alunos

GET 4 - Consultar professores
http://localhost:8081/professores

GET 5 - Consultar cursos
http://localhost:8081/cursos

GET 6 - Consultar alunos
http://localhost:8081/alunos
```

Clique em **Send** em cada requisição, nessa ordem. Os POSTs devem retornar **201 Created** e os GETs, **200 OK**. Para a entrega, capture as seis telas mostrando método, URL, status, resposta JSON e, nos POSTs, o Body enviado.

## Consultas por ID e conflitos

Também estão disponíveis as rotas `GET /professores/{id}`, `GET /cursos/{id}` e `GET /alunos/{id}`. Por exemplo, para buscar o curso salvo pela collection, use `{{baseUrl}}/cursos/{{cursoId}}`.

Ao tentar cadastrar um professor ou aluno com um e-mail que já existe, a API retorna **409 Conflict** com uma mensagem explicando o conflito, em vez de **500 Internal Server Error**.

Se repetir os cadastros com os mesmos e-mails, haverá conflito com a restrição de e-mail único. Use novos e-mails ou encerre a API com `Ctrl + C` e inicie novamente para reiniciar o banco em memória.

## Testes

Depois de configurar `JAVA_HOME` e `Path` como acima, execute:

```powershell
.\mvnw.cmd test
```

As pastas `.tools/`, `target/` e `tmp/` são locais e não devem ser enviadas ao GitHub.
