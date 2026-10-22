# Programação Orientada a Objetos (Java)

Material organizado das aulas e exercícios de **Programação Orientada a Objetos**. Cada pasta é uma etapa independente: abra e execute uma por vez, pois as etapas usam classes com o mesmo nome e não devem ser compiladas juntas.

## Roteiro de estudo

| Etapa | Tema principal | O que observar |
| --- | --- | --- |
| 01 — Biblioteca inicial | Classes, atributos, herança e sobrescrita | `Pessoa`, `Funcionario`, `Bibliotecario` e `Faxineiro` |
| 02 — Biblioteca e polimorfismo | Referências do tipo pai e comportamento sobrescrito | O método `apresentarSe()` em cada tipo de pessoa |
| 03 — Biblioteca e abstração | Classes abstratas, construtores e especialização | `Pessoa` abstrata e os construtores das subclasses |
| 04 — Biblioteca completa | Interfaces, sobrecarga, coleções e comparadores | `Estudo`, `AlunoGraduacao`, `emprestar()` e `OrdenaAlunos` |
| 05 — E-commerce | Modelagem de produtos e interface de promoção | `Produto`, produtos físico/digital e `Promocional` |

## Estrutura

```text
java-poo/
├── 01-biblioteca-inicial/
├── 02-biblioteca-polimorfismo/
├── 03-biblioteca-abstracao/
├── 04-biblioteca-completa/
└── 05-ecommerce/
```

Dentro de cada projeto, o código está em `src/`. Foram removidos arquivos automáticos do IntelliJ (`.idea/`, `*.iml`), arquivos compilados (`out/`, `*.class`) e duplicações fora das etapas. Assim, o repositório guarda apenas o material útil para estudar e editar.

## Como executar

1. Instale um JDK (Java Development Kit) 17 ou mais recente.
2. Abra **uma** das pastas no IntelliJ IDEA.
3. Marque a pasta `src` como *Sources Root*, se necessário.
4. Nas etapas da biblioteca, execute a classe `TesteBiblioteca`.
5. No exercício de e-commerce ainda não existe uma classe `main`: ele serve para praticar a implementação das regras de preço e cupom.

Pelo terminal, entre na pasta `src` da etapa escolhida e execute:

```powershell
javac *.java
java TesteBiblioteca
```

> Não compile todas as pastas simultaneamente: elas contêm versões evolutivas das mesmas classes.

## Conceitos praticados

- encapsulamento e atributos;
- herança com `extends`;
- polimorfismo e sobrescrita com `@Override`;
- classes e métodos abstratos;
- interfaces com `implements`;
- sobrecarga de métodos;
- coleções (`List`, `ArrayList`, `LinkedList`);
- modelagem de domínio.

## Próximos exercícios sugeridos

- Completar `OrdenaAlunos.compare()` usando generics: `Comparator<Aluno>`.
- Criar construtores e validações para `Livro`.
- Implementar corretamente `aplicarCupom()` e `calcularPrecoFinal()` em `Produto`.
- Criar uma classe `TesteECommerce` com produtos físicos e digitais.
