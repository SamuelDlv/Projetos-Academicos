public class Bibliotecario extends Funcionario {
    void cadastrar(Livro l) {
        System.out.println("cadastrando...");
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
