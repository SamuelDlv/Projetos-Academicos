public class Vetores {
    public static void main(String[] args) {
        int[] vals = {5, 3, 9};
        int m = maior(vals);
        System.out.println(m);
    }
    
    static int maior(int[] dados) {
        int valor = dados[0];
        for (int i = 1; i < dados.length; ++i) {
            if (dados[i] > valor) {
                valor = dados[i];
            }
        }
        return valor;
    }
    
    static float media(int[] dados) {
        int somatoria = 0;
        for (int i = 0; i < dados.length; ++i) {
            somatoria = somatoria + dados[i];
            
        }
        return somatoria / dados.length;
    }

    static void inverso(int[] dados) {
        for (int i = dados.length-1; i >= 0; --i) {
            System.out.println(dados[i]);
        }
    }
    
    static void parImpar(int[] dados) {
        int par = 0;
        int impar = 0;
        for (int i = 0; i < dados.length; ++i) {
            if (dados[i] % 2 == 0) {
                ++par; // par = par + 1
            } else {
                ++impar;
            }
        }
        System.out.prinln("PARES: " + par);
        System.out.prinln("IMPARES: " + impar);
    }
    
    int[] novoVetor(int[] dados, int multiplicador) {
        int[] vet = new int[dados.length];
        for (int i = 0; i < dados.length; ++i) {
            vet[i] = dados[i] * multiplicador;
        }
        return vet;
    }
    
    
    
    
    
    
    
    
}