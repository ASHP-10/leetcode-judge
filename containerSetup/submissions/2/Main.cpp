#include <iostream>
using namespace std;

int main()
{
    long long n;
    cin >> n;

    long long original = n;
    long long reversed = 0;

    while (n > 0)
    {
        reversed = reversed * 10 + (n % 10);
        n /= 10;
    }

    cout << (original == reversed ? "true" : "false") << endl;

    return 0;
}