public class Funcionario extends Pessoa {
    double salario;

    String apresentarSe() {
      return super.apresentarSe() +
           " e o meu salario eh: " + this.salario;
    }

    void baterPonto() {

    }

    void receberSalario() {
        System.out.println("salario: " + this.salario);
    }
}
