# Projetos Spring Boot

Projetos independentes de estudo de APIs REST com Java e Spring Boot.

| Projeto | Conteúdo | Execução |
| --- | --- | --- |
| [API acadêmica](api-academica/) | Cadastro de professores, cursos e alunos relacionados | Maven Wrapper |
| [Calculadora Web](calculadora-web/) | Operações matemáticas, interface com temas, histórico, Swagger e testes | Maven |
| [API de alunos com token](restapi-alunos/) | Partes 1 e 2: rota inicial, cadastro, consulta e Bearer Token didático | Gradle Wrapper |

```text
Spring-Boot/
├── README.md
├── api-academica/
│   ├── README.md
│   ├── pom.xml
│   └── src/
├── calculadora-web/
│   ├── README.md
│   ├── COMO_EXECUTAR.md
│   ├── pom.xml
│   └── src/
└── restapi-alunos/
    ├── README.md
    ├── build.gradle
    └── src/
```

Abra no VS Code a pasta do projeto que deseja executar e siga o README correspondente. Cada projeto possui suas próprias configurações e dependências. As APIs acadêmica e de alunos incluem coleção Postman; a calculadora oferece documentação Swagger.

As APIs acadêmica e de alunos usam a porta `8081`; a calculadora usa a porta `8080`. Execute um por vez ou escolha outra porta e atualize a URL no Postman. O JDK portátil, caches e dados locais não fazem parte do repositório.
