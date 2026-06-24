import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        long n = sc.nextLong();

        boolean prime = true;

        if (n < 2) {
            prime = false;
        } else {
            for (long i = 2; i * i <= n; i++) {
                if (n % i == 0) {
                    prime = false;
                    break;
                }
            }
        }

        System.out.println(prime ? "true" : "false");
    }
}