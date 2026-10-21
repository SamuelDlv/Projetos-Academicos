public class Funcoes {
    public static void main(String[] args) {
        int[] valores = {3,7,8,5,2};
        
        int pos = encontrarMaiorPosicao(valores);
        System.out.println(pos);
    }
    
    static int somar(int a, int b) {
        int resultado = a + b;
        
        return resultado;
    }
    
    static void imprimir(int[] dados) {
        for(int i = 0; i < dados.length; ++i) {
            System.out.print(dados[i] + ", ");
        }
    }
    
    // crie uma funcao que recebe como parametro de entrada 
    // um vetor de numeros inteiros e devolve a posicao 
    // do maior elemento 
    
    static int encontrarMaiorPosicao(int[] dados) {
        int maior = dados[0];
        int idxMaior = 0;
        for(int i = 0; i < dados.length; ++i) {
            if (dados[i] > maior) {
                maior = dados[i];
                idxMaior = i;
            }
        }
        
        return idxMaior;
    }
    
    // crie uma funcao que recebe como parametro de entrada 
    // um vetor de numeros inteiros e um segundo parametro 
    // inteiro e verifica se o valor existe no conjunto.
    
    static boolean existeValor(int[] dados, int elementoProcurado) {
        for(int i = 0; i < dados.length; ++i) {
            if (dados[i] == elementoProcurado) {
                return true;
            }
        }
        
        return false;
    }
    
    static boolean existeValor2(int[] dados, int elementoProcurado) {
        boolean existe = false;
        for(int i = 0; i < dados.length && !existe; ++i) {
            if (dados[i] == elementoProcurado) {
                existe = true;
            }
        }
        
        return existe;
    }
    
    
}