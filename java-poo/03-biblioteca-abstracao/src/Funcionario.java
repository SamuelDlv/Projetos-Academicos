public class Funcionario extends Pessoa {
    double salario;

    Funcionario(String novoNome) {
        super(novoNome);
    }
    Funcionario(String novoNome, double novoSalario) {
        this(novoNome);
        this.salario = novoSalario;
    }

    String apresentarSe() {
      return " e o meu salario eh: " + this.salario;
    }

    void baterPonto() {

    }

    void receberSalario() {
        System.out.println("salario: " + this.salario);
    }

    @Override
    public String toString() {
        return "Funcionario{" +
                "salario=" + salario +
                '}';
    }
}
