public class TesteBiblioteca {

    public static void main(String[] args) {
        Faxineiro fax = new Faxineiro();
        fax.nome = "Marcelo";
        fax.salario = 100;

        Funcionario bib = new Bibliotecario();
        bib.nome = "Ricardo";
        bib.salario = 200;
        //((Bibliotecario) bib).receberSalario();

        Funcionario[] funcs = new Funcionario[] {
                fax,
                bib
        };

        //imprimirListaPagamento(funcs);
        imprimirLista(funcs);
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
