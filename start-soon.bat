@echo off
cd /d "%~dp0"
set BUNEXE=%USERPROFILE%\.aki\bin\bun.exe
if not exist "%BUNEXE%" set BUNEXE=bun
start "" http://localhost:3000
"%BUNEXE%" run server.js
pause
