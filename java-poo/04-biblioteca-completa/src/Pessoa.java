public abstract class Pessoa {
    String nome;

    Pessoa(String novoNome) {
        this.nome = novoNome;
    }

    abstract String apresentarSe();
}
