#!/bin/bash

cd /sandbox

# echo $(pwd)
# echo $(ls)
submissionId=$1
LANGUAGE=$2
time=$3
count=$(find submissions/$submissionId/ -maxdepth 1 -type f -regex '.*/input[0-9]+.txt' | wc -l)

case "$LANGUAGE" in


cpp)

    echo "C++ compiling"

    g++ submissions/$submissionId/Main.cpp -O2 -std=c++17 -o submissions/$submissionId/solution

    if [ $? -ne 0 ]; then
        echo "Compilation Error"
        exit 1
    fi

    echo "Running C++"

    for ((i=1; i<=$count; i++))
    do
        timeout ${time}s submission/$submissionId/solution < submissions/$submissionId/input$i.txt > submissions/$submissionId/solution.txt

        if diff -wB "submissions/$submissionId/solution.txt" "submissions/$submissionId/output$i.txt" >/dev/null; then
            echo "$i th test case passed"
            rm submissions/$submissionId/solution.txt
        else
            echo "Failed on $i th test case"
            exit 1
        fi 
    done

    ;;

java)

    echo "Java Compiling"

    javac submissions/$submissionId/Main.java

    if [ $? -ne 0 ]; then
        echo "Compilation Error"
        exit 1
    fi

    echo "Running Java"

    for ((i=1; i<=$count; i++))
    do
        timeout ${time}s java -cp submissions/$submissionId Main \
            < submissions/$submissionId/input$i.txt \
            > submissions/$submissionId/solution.txt

        if diff -wB "submissions/$submissionId/solution.txt" "submissions/$submissionId/output$i.txt" >/dev/null; then
            echo "$i th test case passed"
            rm submissions/$submissionId/solution.txt
        else
            echo "Failed on $i th test case"
            exit 1
        fi
    done

    ;;
*)

    echo "Unsupported language"
    exit 1

    ;;
esac