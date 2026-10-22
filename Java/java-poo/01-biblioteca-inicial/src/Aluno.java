public class Aluno extends Pessoa {

    void emprestar(Livro[] livros) {
        System.out.println("emprestando...");
        if (livros != null) {
            for(Livro l : livros) {
                System.out.println(l.titulo);
            }
        }
    }

    void emprestar(Livro livro) {
        emprestar(new Livro[] { livro });
    }

}
