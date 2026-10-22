public class Repeticoes {
    public static void main(String[] args) {
        // imprima todos os numeros inteiros entre 1 e 100
        
        int contador = 1;
        while (contador <= 100) {
            System.out.println(contador);
            contador = contador + 1;
        }
        
        for(int x = 1; x <= 100; ++x) {
            System.out.println(x);
        }
        
        int[] dados = {1, 5, 8, 9, 10, 20, 8};
        for(int i = 0; i < dados.length; ++i) {
            System.out.println(dados[i]);
        }
    }
}