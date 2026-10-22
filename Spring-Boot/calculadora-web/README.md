# Calculadora Web

Calculadora com API REST em Java e Spring Boot e interface em HTML, CSS e JavaScript.

## Funcionalidades

- Adição, subtração, multiplicação, divisão e exponenciação.
- Tema claro e escuro, atalhos de operação e histórico local no navegador.
- Validação de entrada e tratamento de divisão por zero.
- Documentação interativa da API com Swagger.

## Executar

Requer Java 17+ e Maven. Dentro desta pasta, execute:

```bash
mvn spring-boot:run
```

- Interface: http://localhost:8080/
- Swagger: http://localhost:8080/swagger-ui.html

Veja o [guia de execução](COMO_EXECUTAR.md) para mais detalhes.

## API

`GET /api/calculadora?primeiroNumero={valor}&segundoNumero={valor}&operacao={operacao}`

Operações: `adicao`, `subtracao`, `multiplicacao`, `divisao` e `exponenciacao`.

Exemplo:

```text
http://localhost:8080/api/calculadora?primeiroNumero=2&segundoNumero=3&operacao=exponenciacao
```

```json
{
  "primeiroNumero": 2.0,
  "segundoNumero": 3.0,
  "operacao": "exponenciacao",
  "resultado": 8.0,
  "situacao": "sucesso"
}
```

Divisão por zero ou operação inválida retorna HTTP 400, com a descrição em `situacao`.

## Organização

- `src/main/java/br/edu/calculadora/`: aplicação, controller, service e modelo de resposta.
- `src/main/resources/static/`: HTML, CSS e JavaScript.
- `src/test/java/br/edu/calculadora/`: testes do serviço e do endpoint.

## Testes

```bash
mvn test
```

São 15 testes: 13 do serviço e 2 do controller. Cobrem as operações, números negativos, decimais, expoente zero, entradas inválidas e respostas HTTP.

As pastas `.tools`, `.vscode` e `target` não são distribuídas com o projeto.
