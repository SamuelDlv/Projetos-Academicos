/**
 * Classe base para os produtos do e-commerce.
 *
 * Ela concentra os dados que produtos físicos e digitais têm em comum:
 * nome, preço base e percentual de desconto.
 */
public abstract class Produto implements Promocional {

    String nome;
    double precoBase;
    int desconto;

    /**
     * Calcula o valor que será descontado pelo cupom.
     *
     * Exemplo: preço de 100 e desconto de 10 resultam em 10 de desconto.
     */
    @Override
    public double aplicarCupom() {
        if (desconto <= 0) {
            return 0;
        }

        return precoBase * desconto / 100;
    }

    /**
     * Calcula o valor que o cliente realmente pagará.
     * O preço final é o preço base menos o valor abatido pelo cupom.
     */
    double calcularPrecoFinal() {
        return precoBase - aplicarCupom();
    }

    /** Mostra uma informação básica do produto no console. */
    void exibirDetalhes() {
        System.out.println("Produto: " + nome);
        System.out.println("Preço final: R$ " + calcularPrecoFinal());
    }
}
