#!/bin/bash

LANGUAGE=$1
CODE_FILE=$2
TIMEOUT=5

case "$LANGUAGE" in
  cpp)
    # Compile to /tmp — needs exec permission on /tmp tmpfs
    g++ -O2 -o /tmp/solution "$CODE_FILE" 2>&1
    if [ $? -ne 0 ]; then
      echo "Compilation Error"
      exit 1
    fi
    timeout $TIMEOUT /tmp/solution
    ;;

  java)
    javac -d /tmp "$CODE_FILE" 2>&1
    if [ $? -ne 0 ]; then
      echo "Compilation Error"
      exit 1
    fi
    CLASS_NAME=$(basename "$CODE_FILE" .java)
    timeout $TIMEOUT java -cp /tmp "$CLASS_NAME"
    ;;

  *)
    echo "Unsupported language: $LANGUAGE"
    exit 1
    ;;
esac