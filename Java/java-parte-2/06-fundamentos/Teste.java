public class Teste {
    public static void main(String[] args) {
        
        String nome = "Joao";
        
        int idade = 10;
        
        System.out.println("TESTE1: " + nome);
        System.out.println("TESTE2: " + idade);
        
        int[] idades = {20, 30, 40};
        System.out.println(idades[0]);
        idades[0] = 60;
        System.out.println(idades[0]);
        System.out.println(idades[3]);
    }
}