@echo off
echo Iniciando Servicio de Cotizaciones...

start "Backend Django" cmd /k "python manage.py runserver"
start "Frontend React" cmd /k "cd frontend && npm run dev"
start "Worker Fidelizacion" cmd /k "python manage.py send_loyalty_promos"

echo Todos los servicios han sido iniciados en ventanas separadas.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
pause
