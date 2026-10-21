public class AlunoGraduacao extends Aluno {

    AlunoGraduacao(String novoNome) {
        super(novoNome);
    }

    @Override
    String apresentarSe() {
        return "estou na graduacao, meu nome eh " + this.nome;
    }

    @Override
    public void estudar() {
        System.out.println("estudando...");
    }
}
