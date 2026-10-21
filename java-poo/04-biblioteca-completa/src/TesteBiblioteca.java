import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

public class TesteBiblioteca {

    public static void main(String[] args) {
        List lista = new ArrayList();
        List ligada = new LinkedList();

        Estudo e = new AlunoGraduacao("Maria");

        //if ( e instanceof Funcionario) {
            Pessoa f = (Pessoa) e;

            f.apresentarSe();
            //System.out.println(f.nome);
        //}
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
