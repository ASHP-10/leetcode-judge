#include <iostream>
using namespace std;

int main()
{
    long long n;
    cin >> n;

    bool prime = true;

    if (n < 2)
    {
        prime = false;
    }
    else
    {
        for (long long i = 2; i * i <= n; i++)
        {
            if (n % i == 0)
            {
                prime = false;
                break;
            }
        }
    }

    cout << (prime ? "true" : "false") << endl;

    return 0;
}