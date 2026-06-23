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

    g++ submissions/$submissionId/Main.cpp -O2 -std=c++17 -o submissions/$submissionId/solution

    if [ $? -ne 0 ]; then
        echo "C++ Compilation Error"
        exit 1
    fi


    for ((i=1; i<=$count; i++))
    do
        timeout ${time}s submissions/$submissionId/solution < submissions/$submissionId/input$i.txt > submissions/$submissionId/solution.txt

        if diff -wB "submissions/$submissionId/solution.txt" "submissions/$submissionId/output$i.txt" >/dev/null; then
            rm submissions/$submissionId/solution.txt
        else
            echo "{'input':'$(cat submissions/$submissionId/input$i.txt)',
            {'output': '$(cat submissions/$submissionId/solution.txt)' } }";
            exit 1
        fi
    done

    ;;

java)

    javac submissions/$submissionId/Main.java

    if [ $? -ne 0 ]; then
        echo "Java Compilation Error"
        exit 1
    fi

    for ((i=1; i<=$count; i++))
    do
        timeout ${time}s java -cp submissions/$submissionId Main \
            < submissions/$submissionId/input$i.txt \
            > submissions/$submissionId/solution.txt

        if diff -wB "submissions/$submissionId/solution.txt" "submissions/$submissionId/output$i.txt" >/dev/null; then
            rm submissions/$submissionId/solution.txt
        else
            echo "{'input':'$(cat submissions/$submissionId/input$i.txt)', \
                {'output': '$(cat submissions/$submissionId/solution.txt)' } }";
            exit 1
        fi
    done

    ;;
*)

    echo "Unsupported language"
    exit 1

    ;;
esac