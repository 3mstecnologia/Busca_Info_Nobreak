@echo off
:a
node server_nobreak.js
timeout 1800
goto a