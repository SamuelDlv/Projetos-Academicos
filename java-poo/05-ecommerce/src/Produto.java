public abstract class Produto implements Promocional {

    String nome;
    double precoBase;
    int desconto;

    @Override
    public double aplicarCupom() {
        return 0;
    }

    double calcularPrecoFinal() {
        if (desconto <= 0) {
            return precoBase;
        }

        return precoBase * desconto / 100;
    }

    void exibirDetalhes() {
        System.out.println("Produto: " + nome);
    }
}
