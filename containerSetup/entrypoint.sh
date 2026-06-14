#!/bin/bash

LANGUAGE=$1

cd /sandbox

case "$LANGUAGE" in

cpp)

    echo "Compiling C++..."

    g++ Main.cpp -O2 -std=c++17 -o solution

    if [ $? -ne 0 ]; then
        echo "Compilation Error"
        exit 1
    fi

    echo "Running..."

    timeout 5s ./solution \
        < input.txt \
        > output.txt

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