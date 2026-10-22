public class TesteListaEstatica {
	public static void main(String[] args) {
		ListaEstatica lista = new ListaEstatica(5);
		
		Pessoa p = new Pessoa();
		p.nome = "Jose";
		p.idade = 50;
		
		lista.inserir(p);
		
		lista.imprimir();
	}
}