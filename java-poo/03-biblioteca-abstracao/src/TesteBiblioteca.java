public class TesteBiblioteca {

    public static void main(String[] args) {
      //Pessoa a = new Pessoa("Joaozinho");

      Object obj = new Funcionario("Osvaldo");

      Pessoa b = new Bibliotecario("Pedro");

      Pessoa c = new Funcionario("Maria");

      //Pessoa d = new Aluno("Ricardo");

        /*
      Pessoa[] pessoas = new Pessoa[] {
        b, c
      };

      apresentacao(pessoas);
         */

        System.out.println(obj);
        System.out.println(b);
    }

    static void apresentacao(Pessoa[] pessoas) {
        for (Pessoa p : pessoas) {
            System.out.println(p.apresentarSe());
        }
    }

    static void imprimirLista(Funcionario[] lista) {
        for (Funcionario f : lista) {
            System.out.println(f);
        }
    }

    static void imprimirListaPagamento(Funcionario[] lista) {
        for(Funcionario f : lista) {
            f.receberSalario();
        }
    }
}
