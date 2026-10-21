public class ListaEstatica {
	Pessoa[] dados;
	int qtdElementos;

	ListaEstatica(int tamanho) {
		dados = new Pessoa[tamanho];
		qtdElementos = 0;
	}
	
	boolean inserir(Pessoa p) {
		if (qtdElementos < dados.length) {
			dados[qtdElementos] = p;
			qtdElementos = qtdElementos + 1;
			return true;
			
		} else {
			return false;
			
		}
	}
	
	// crie um metodo que imprime os elementos da lista

	void imprimir() {
		for (int i = 0; i < qtdElementos; ++i) {
			System.out.println(dados[i].nome + ",");
		}
	}
	
	// crie um metodo que remove o elemento "pos" da lista
}