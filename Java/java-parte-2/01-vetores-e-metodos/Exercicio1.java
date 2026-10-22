public class Exercicio1 {
	// Crie uma funcao que recebe como argumentos
	// um vetor de inteiros e devolve um outro vetor
	// de inteiros, de duas posicoes, com o menor
	// valor na primeira posicao e o maior valor na 
	// segunda posicao
	
	static int[] descobreNumeros(int[] dados) {
		int menor = dados[0];
		int maior = dados[0];
		for (int i = 0; i < dados.length; ++i) {
			if (dados[i] < menor) {
				menor = dados[i];
			}
			
			if (dados[i] > maior) {
				maior = dados[i];
			}
		}
		int[] ret = new int[2];
		ret[0] = menor;
		ret[1] = maior;
		
		return ret;
	}
	
	public static void main(String[] args) {
		int[] valores = {3, 7, 2, 9, 10, 5};
		int[] resultado = descobreNumeros(valores);
		System.out.println("Menor: " + resultado[0]); // 2
		System.out.println("Maior: " + resultado[1]); // 10
	}
}