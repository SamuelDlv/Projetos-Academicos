public class ListaLigadaClientes {

	Noh inicio;

	void inserir(Cliente c) {
		Noh novo = new Noh();
		novo.info = c;
		
		novo.proximo = inicio;
		inicio = novo;
	}

	void inserirNoFinal(Cliente c) {}

	void imprimirLista() {}
	

}