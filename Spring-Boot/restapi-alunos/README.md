# API de alunos com Spring Boot

Projeto de estudo de APIs REST com Spring Boot. A aplicação apresenta uma rota REST simples na Parte 1 e, na Parte 2, permite cadastrar e consultar alunos em um banco H2, com autenticação por token.

## Tecnologias

- Java 17 e Spring Boot 4.1.1
- Spring Web MVC e Spring Data JPA
- H2 em memória
- Gradle Wrapper
- Postman para testar as requisições

O driver MySQL está disponível nas dependências, mas o banco configurado neste projeto é o H2.

## Requisitos

- JDK 17 instalado e disponível no terminal (`java -version`).
- VS Code para editar o projeto; a extensão Extension Pack for Java é opcional para executar pelo terminal.
- Postman para acompanhar os exemplos de cadastro e autenticação.

O Gradle Wrapper está incluído; não é necessário instalar Gradle separadamente. A primeira execução precisa de internet para baixar a distribuição e as dependências.

## Preparação no VS Code

Baixe ou clone este repositório e abra sua pasta completa no VS Code. Abra **Terminal > New Terminal** e execute os comandos a partir da raiz, onde está `gradlew.bat`.

Se usar um JDK instalado no Windows, configure `JAVA_HOME` para a pasta do JDK e adicione sua pasta `bin` ao `PATH`.

Como alternativa, extraia um [JDK 17 portátil](https://adoptium.net/installation/archives/) nesta estrutura:

```text
.tools/
└── java17/
    └── pasta-da-versao-do-jdk/
        ├── bin/
        └── lib/
```

Depois, no PowerShell:

```powershell
. .\java-env.ps1
java -version
javac -version
```

Se o PowerShell bloquear o script, execute `Set-ExecutionPolicy -Scope Process Bypass` e tente novamente. A ativação vale para o terminal atual; repita ao abrir outro terminal. O JDK portátil não é incluído no repositório.

## Parte 1: primeira rota REST

```powershell
.\gradlew.bat bootRun --args="--server.port=8081"
```

Quando aparecer `Started RestapiApplication`, acesse:

```text
http://127.0.0.1:8081/aluno
```

Resposta esperada:

```text
Aprendendo Rest API
```

Esta etapa funciona sem autenticação. Para encerrar, pressione `Ctrl + C` no terminal.

## Parte 2: cadastro, consulta e token

Encerre a Parte 1 e inicie a Parte 2:

```powershell
.\gradlew.bat bootRun --args="--spring.profiles.active=parte2 --server.port=8081"
```

O perfil `parte2` ativa o cadastro, a consulta e a exigência de token. Ao iniciar, a aplicação exibe o usuário `user` e uma senha temporária:

```text
ATIVIDADE PARTE 2 - usuario para token: user
ATIVIDADE PARTE 2 - senha gerada para token: <senha desta execucao>
```

### 1. Obter o token

No Postman, crie uma requisição `POST` para:

```text
http://127.0.0.1:8081/oauth/token
```

Use **Authorization > No Auth** e **Body > x-www-form-urlencoded**:

| Campo | Valor |
| --- | --- |
| `grant_type` | `password` |
| `username` | `user` |
| `password` | Senha exibida no terminal nesta execução |

Uma autenticação válida retorna HTTP `200` com:

```json
{
  "access_token": "<token gerado>",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### 2. Cadastrar alunos

Envie `POST http://127.0.0.1:8081/aluno`. Em **Authorization**, selecione **Bearer Token** e cole apenas o valor de `access_token`. Em **Body > raw > JSON**, use:

```json
{
  "nome": "Maria",
  "cpf": "55388811166",
  "ra": "23312"
}
```

O resultado esperado é HTTP `201 Created`, sem corpo. Repita com outros dados fictícios para cadastrar mais alunos.

### 3. Consultar alunos

Envie `GET http://127.0.0.1:8081/aluno`, com o mesmo **Bearer Token** e sem corpo. A resposta esperada é HTTP `200 OK` com uma lista:

```json
[
  {
    "nome": "Maria",
    "ra": "23312",
    "cpf": "55388811166"
  }
]
```

Sem token válido, o cadastro e a consulta retornam HTTP `401`. O token expira após uma hora. Ao reiniciar a aplicação, gere um novo token usando a nova senha do terminal.

### Coleção pronta do Postman

Importe [TesteCadastroAluno.postman_collection.json](postman/TesteCadastroAluno.postman_collection.json). A variável `baseUrl` já usa `http://127.0.0.1:8081`.

1. Abra **Obter token** e substitua o marcador de senha no Body pela senha do terminal.
2. Envie a requisição. O script da coleção salva `access_token` na variável `accessToken`.
3. Execute **Cadastrar Pedro**, **Cadastrar Joao** e **Cadastrar Maria**.
4. Execute **Consultar alunos** e confira os registros.

A coleção já envia o cabeçalho `Authorization: Bearer {{accessToken}}`. Não é necessário adicionar outro cabeçalho de autorização. Se trocar a porta da aplicação, atualize também `baseUrl` na coleção.

## Banco de dados H2

O console está em `http://127.0.0.1:8081/h2-console`, com estas configurações de desenvolvimento:

| Configuração | Valor |
| --- | --- |
| JDBC URL | `jdbc:h2:mem:testdb` |
| Usuário | `sa` |
| Senha | `password` |

Para consultar os registros pelo console:

```sql
SELECT * FROM alunos;
```

Os alunos são persistidos no H2 em memória enquanto a aplicação está aberta. Ao encerrar, os dados são perdidos.

## Organização

```text
src/main/java/br/com/aula/restapi/
├── RestapiApplication.java
├── auth/          # Emissão e verificação de tokens
├── controller/    # Rotas das partes 1 e 2
├── repository/    # Acesso ao banco com JPA
├── request/       # Entidade RequestAluno
└── service/       # Cadastro e consulta de alunos
src/main/resources/application.properties
src/test/java/     # Teste de carregamento do contexto
postman/           # Coleção de exemplo
```

## Compilação e testes

```powershell
.\gradlew.bat test
.\gradlew.bat build
```

O teste automatizado existente verifica o carregamento do contexto padrão. A coleção Postman permite conferir os códigos de resposta do fluxo da Parte 2; ela não substitui uma suíte completa de testes de autenticação.

Em Linux ou macOS, use `sh ./gradlew` no lugar de `.\gradlew.bat`, com JDK 17 configurado. Um `pom.xml` também está disponível como alternativa Maven; os exemplos deste README adotam Gradle. Não há Maven Wrapper.

## Adaptações do exercício

O projeto utiliza os pacotes `jakarta.persistence`, compatíveis com sua versão do Spring Boot, e injeção de dependências por construtor. Os dois exercícios convivem no mesmo projeto por meio do perfil `parte2`.

A autenticação foi implementada como uma adaptação didática para reproduzir o fluxo de obtenção de `access_token` e uso de Bearer Token descrito na atividade. Ela não implementa um servidor OAuth2 completo. As credenciais e tokens ficam em memória, a senha aparece no console e o console H2 está habilitado. O projeto é destinado a execução local para estudo, não a implantação em produção.

## Arquivos para publicação

O `.gitignore` exclui o JDK portátil, caches, compilados, logs, arquivos de ambiente e o estado local do Postman. Apenas a coleção de exemplo, com marcadores em vez de credenciais reais, deve ser compartilhada. O arquivo local `Prints.pdf` também está excluído; revise e remova senhas e tokens de capturas antes de publicá-las separadamente.
