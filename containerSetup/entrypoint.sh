#!/bin/bash

cd /sandbox

# echo $(pwd)
# echo $(ls)
submissionId=1
LANGUAGE=$1
count=$(find submissions/$submissionId/ -maxdepth 1 -type f -regex '.*/input[0-9]+.txt' | wc -l)

case "$LANGUAGE" in


cpp)

    echo "C++..."

    g++ submissions/$submissionId/Main.cpp -O2 -std=c++17 -o solution

    if [ $? -ne 0 ]; then
        echo "Compilation Error"
        exit 1
    fi

    echo "Running..."

    for ((i=1; i<=$count; i++))
    do
        timeout 5s ./solution \
            < submissions/$submissionId/input$i.txt \
            > submissions/$submissionId/solution.txt

        if cmp -s "submissions/$submissionId/solution.txt" "submissions/$submissionId/output$i.txt"; then
            echo "$i th test case passed"
            rm submissions/$submissionId/solution.txt
        else
            echo "Failed on $i th test case"
            exit 1
        fi 
    done

    ;;

java)

    echo "Compiling Java..."

    javac Main.java

    if [ $? -ne 0 ]; then
        echo "Compilation Error"
        exit 1
    fi

    echo "Running..."

    timeout 5s java Main \
        < input.txt \
        > output.txt

    ;;

*)

    echo "Unsupported language"
    exit 1

    ;;
esac