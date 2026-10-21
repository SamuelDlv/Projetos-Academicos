public abstract class Aluno extends Pessoa implements Estudo {

    Aluno(String novoNome) {
        super(novoNome);
    }

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

    @Override
    public String toString() {
        return "Aluno{" +
                "nome='" + nome + '\'' +
                '}';
    }
}
