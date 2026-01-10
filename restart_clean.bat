@echo off
echo ========================================
echo Limpieza completa y reinicio
echo ========================================

echo.
echo [1/4] Matando todos los procesos Node.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/4] Verificando que no queden procesos...
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ADVERTENCIA: Aun hay procesos Node.js corriendo
    pause
) else (
    echo OK: No hay procesos Node.js
)

echo.
echo [3/4] Iniciando frontend...
start "Frontend" cmd /c "npm run dev"
timeout /t 3 /nobreak >nul

echo [4/4] Iniciando backend...
start "Backend" cmd /c "cd server && node index.js"

echo.
echo ========================================
echo Reinicio completado
echo Frontend: http://localhost:8080
echo Backend: http://localhost:3005
echo ========================================
pause
