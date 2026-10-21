public class Faxineiro extends Funcionario {
    void limpar() {
        System.out.println("limpando");
    }

    @Override
    public String toString() {
        return "Faxineiro{" +
                "salario=" + salario +
                ", nome='" + nome + '\'' +
                '}';
    }
}
