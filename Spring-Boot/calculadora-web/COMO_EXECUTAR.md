# Como executar a Calculadora

## Pré-requisitos

Instale Java 17 ou superior e Maven, disponíveis no PATH. Confira:

```bash
java -version
mvn -version
```

O repositório não inclui JDK ou Maven portáteis.

## Iniciar

No terminal, entre na pasta `Spring-Boot/calculadora-web` do repositório e execute:

```bash
mvn spring-boot:run
```

Mantenha o terminal aberto e acesse:

- Calculadora: http://localhost:8080/
- Swagger: http://localhost:8080/swagger-ui.html

Para encerrar, pressione `Ctrl + C`.

## Testes

Na mesma pasta:

```bash
mvn test
```

## Gerar o executável

```bash
mvn clean package
java -jar target/calculadora-web-1.0.0.jar
```

## Problemas comuns

- **Java não encontrado:** verifique o PATH e configure JAVA_HOME apontando para o JDK.
- **Maven não encontrado:** adicione a pasta bin do Maven ao PATH e abra um novo terminal.
- **Porta 8080 ocupada:** encerre a outra aplicação ou execute `mvn spring-boot:run "-Dspring-boot.run.arguments=--server.port=8082"` e acesse a porta 8082.
- **pom.xml não encontrado:** execute os comandos dentro da pasta da calculadora, não na raiz do repositório.
