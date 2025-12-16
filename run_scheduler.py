import os
import time
import sys
from datetime import datetime

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema.settings')
import django
django.setup()

from django.core.management import call_command

def run_tasks():
    print(f"[{datetime.now()}] Ejecutando tareas programadas...")
    try:
        print("-> Verificando cotizaciones antiguas (check_stale_quotes)...")
        call_command('check_stale_quotes')
        
        print("-> Enviando promociones de fidelización (send_loyalty_promos)...")
        call_command('send_loyalty_promos')
        
        print("-> Tareas finalizadas correctamente.")
    except Exception as e:
        print(f"Error ejecutando tareas: {e}")

if __name__ == "__main__":
    print("=== Planificador de Tareas (Scheduler) Iniciado ===")
    print("Presiona Ctrl+C para detener.")
    
    # Run once immediately on startup
    run_tasks()
    
    while True:
        # Sleep for 6 hours (21600 seconds)
        interval = 21600
        print(f"Durmiendo por {interval/3600} horas...")
        try:
            time.sleep(interval)
            run_tasks()
        except KeyboardInterrupt:
            print("\nScheduler detenido por el usuario.")
            break
