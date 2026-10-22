# Projetos Spring Boot

Dois projetos independentes de estudo de APIs REST com Java e Spring Boot.

| Projeto | Conteúdo | Execução |
| --- | --- | --- |
| [API acadêmica](api-academica/) | Cadastro de professores, cursos e alunos relacionados | Maven Wrapper |
| [API de alunos com token](restapi-alunos/) | Partes 1 e 2: rota inicial, cadastro, consulta e Bearer Token didático | Gradle Wrapper |

```text
Spring-Boot/
├── README.md
├── api-academica/
│   ├── README.md
│   ├── pom.xml
│   └── src/
└── restapi-alunos/
    ├── README.md
    ├── build.gradle
    └── src/
```

Abra no VS Code a pasta do projeto que deseja executar e siga o README correspondente. Cada projeto possui suas próprias configurações, dependências e coleção Postman.

Os exemplos dos dois projetos usam a porta `8081`. Execute um por vez ou escolha outra porta e atualize a URL no Postman. O JDK portátil, caches e dados locais não fazem parte do repositório.
