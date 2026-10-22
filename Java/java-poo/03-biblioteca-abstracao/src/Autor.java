public class Autor extends Pessoa {

    Autor(String novoNome) {
        super(novoNome);
    }

    @Override
    String apresentarSe() {
        return "sou um autor, meu nome eh " + this.nome;
    }

    void escrever() {
        System.out.println("escrevendo...");
    }
}
