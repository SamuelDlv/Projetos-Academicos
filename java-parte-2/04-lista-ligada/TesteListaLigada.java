public class TesteListaLigada {

	public static void main(String[] args) {
		ListaLigada lista = new ListaLigada();
		
		Pessoa a = new Pessoa();
		a.nome = "Pedro";
		a.idade = 20;
		
		lista.inserir(a);
	}
}