public class TesteBiblioteca {

    public static void main(String[] args) {
      Pessoa a = new Pessoa();
      a.nome = "Joaozinho";

      Pessoa b = new Bibliotecario();
      b.nome = "Pedro";

      Pessoa c = new Funcionario();
      c.nome = "Maria";

      Pessoa d = new Aluno();
      d.nome = "Ricardo";

      Pessoa[] pessoas = new Pessoa[] {
        a, b, c, d
      };

      apresentacao(pessoas);

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
