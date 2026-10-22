import java.util.Scanner;

public class LeituraTeclado {
    public static void main(String[] args) {
        Scanner s = new Scanner(System.in);
    
        System.out.print("Escreva seu nome: ");
    
        String nome = s.nextLine();
    
        System.out.println("Nome: " + nome);
    
        s.close();
    }
    
}