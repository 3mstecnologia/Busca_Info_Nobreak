@echo off
:a
node server_nobreak.js
timeout 60
goto a