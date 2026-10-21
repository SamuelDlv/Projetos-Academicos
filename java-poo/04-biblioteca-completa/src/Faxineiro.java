public class Faxineiro extends Funcionario {

    Faxineiro(String novoNome) {
        super(novoNome);
    }

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
