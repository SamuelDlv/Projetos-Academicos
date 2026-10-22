# Exercício: E-commerce

Exercício de orientação a objetos para modelar produtos físicos e digitais.

## Leitura do código

- `Produto` é a classe abstrata com as informações compartilhadas.
- `ProdutoFisico` adiciona o peso, que pode ser usado no cálculo de frete.
- `ProdutoDigital` adiciona o link de acesso.
- `Promocional` é a interface que define o cálculo do cupom.

Os comentários nos arquivos explicam o objetivo de cada classe e método. O cálculo foi organizado para separar o **valor do desconto** (`aplicarCupom`) do **preço final** (`calcularPrecoFinal`).
