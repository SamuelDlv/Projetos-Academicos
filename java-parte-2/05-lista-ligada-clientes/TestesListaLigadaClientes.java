public class TestesListaLigadaClientes {

	public static void main(String[] args) {
		ListaLigadaClientes lista = new ListaLigadaClientes();
		
		Cliente c1 = new Cliente();
		c1.nome = "Maria";
		c1.cpf = 1;
		c1.email = "maria@teste.com";
		
		lista.inserir(c1);
		
	}

}