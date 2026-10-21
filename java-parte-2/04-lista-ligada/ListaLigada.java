public class ListaLigada {

	Noh inicioLista;

	boolean inserir(Pessoa p) {
		Noh novo = new Noh();
		novo.info = p;
		
		novo.proximo = inicioLista;
		inicioLista = novo;
	}

}