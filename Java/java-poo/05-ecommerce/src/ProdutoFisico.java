/**
 * Representa a parte comum de produtos que precisam de entrega física.
 *
 * A classe é abstrata porque um tipo mais específico (por exemplo,
 * LivroFisico ou Eletronico) deve definir o produto concreto.
 */
public abstract class ProdutoFisico extends Produto {

    // Peso usado futuramente para calcular frete.
    double peso;
}
