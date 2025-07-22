#!/bin/bash
cd /home/kavia/workspace/code-generation/bubble-pop-adventure-76388/frontend_main
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

