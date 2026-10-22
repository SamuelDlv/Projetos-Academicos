public class Teste {
	public static void main(String[] args) {
		Pessoa a = new Pessoa();
		a.nome = "Jose";
		a.idade = 42;
		
		Pessoa b = new Pessoa();
		b.nome = "Maria";
		b.idade = 50;
		
		Pessoa c = new Pessoa();
		c.nome = "Pedro";
		c.idade = 20;
		
		Pessoa[] teste = new Pessoa[3];
		teste[0] = a;
		teste[1] = b;
		teste[2] = c;
		
		//System.out.println("A");
		
		System.out.println(nomeMaisVelha(teste));
	}
	
	static String nomeMaisVelha(Pessoa[] vet) {
		int maisVelha = -1;
		String nomeRetorno = "";
		for (int i = 0; i < vet.length; ++i) {
			if (vet[i].idade > maisVelha) {
				maisVelha = vet[i].idade;
				nomeRetorno = vet[i].nome;
			}
		}
		
		return nomeRetorno;
	}
}