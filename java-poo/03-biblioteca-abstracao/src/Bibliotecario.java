public class Bibliotecario extends Funcionario {

    Bibliotecario(String novoNome) {
        super(novoNome);
    }

    void cadastrar(Livro l) {
        System.out.println("cadastrando...");
    }

    String apresentarSe() {
      return "Prazer, sou o bibliot: " + this.nome;
    }

    @Override
    void receberSalario() {
        System.out.println("salario: " + (2 * this.salario));
    }

    @Override
    public String toString() {
        return "Bibliotecario{" +
                "salario=" + salario +
                ", nome='" + nome + '\'' +
                '}';
    }
}
