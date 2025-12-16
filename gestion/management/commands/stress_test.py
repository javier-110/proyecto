import time
import threading
import json
import urllib.request
import urllib.error
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Simula carga de usuarios concurrentes.'

    def add_arguments(self, parser):
        parser.add_argument('--users', type=int, default=20, help='Número de usuarios simultáneos')
        parser.add_argument('--url', type=str, default='http://127.0.0.1:8000', help='URL base del servidor')

    def handle(self, *args, **kwargs):
        num_users = kwargs['users']
        base_url = kwargs['url']
        
        self.stdout.write(self.style.WARNING(f'Iniciando prueba de estrés con {num_users} usuarios concurrentes...'))
        
        # Ensure we have a test user
        username = "stress_test_user"
        password = "stress_password"
        email = "stress@test.com"
        
        if not User.objects.filter(username=username).exists():
            User.objects.create_user(username=username, email=email, password=password, rol='ADMIN')
            self.stdout.write(f"Usuario de prueba creado: {email}")

        # Shared results
        results = {'success': 0, 'errors': 0, 'times': []}
        lock = threading.Lock()

        def user_action(user_id):
            start_time = time.time()
            try:
                # 1. Login
                login_data = json.dumps({'username': email, 'password': password}).encode('utf-8')
                req = urllib.request.Request(f"{base_url}/api/token/", data=login_data, headers={'Content-Type': 'application/json'})
                
                with urllib.request.urlopen(req, timeout=10) as response:
                    if response.status != 200:
                        raise Exception(f"Login failed: {response.status}")
                    data = json.loads(response.read().decode())
                    token = data['access']

                # 2. Get Quotes (Authenticated)
                req_quotes = urllib.request.Request(f"{base_url}/api/cotizaciones/", headers={'Authorization': f'Bearer {token}'})
                with urllib.request.urlopen(req_quotes, timeout=10) as response:
                    if response.status != 200:
                        raise Exception(f"Get Quotes failed: {response.status}")
                    _ = response.read() # Consume body

                duration = time.time() - start_time
                with lock:
                    results['success'] += 1
                    results['times'].append(duration)
                    
            except Exception as e:
                with lock:
                    results['errors'] += 1
                # self.stderr.write(f"User {user_id} error: {e}")

        # Launch threads
        threads = []
        global_start = time.time()
        
        for i in range(num_users):
            t = threading.Thread(target=user_action, args=(i,))
            threads.append(t)
            t.start()
            
        for t in threads:
            t.join()
            
        total_time = time.time() - global_start
        
        # Report
        avg_time = sum(results['times']) / len(results['times']) if results['times'] else 0
        
        self.stdout.write(self.style.SUCCESS('--------------------------------------------------'))
        self.stdout.write(f"Usuarios Simulados: {num_users}")
        self.stdout.write(f"Tiempo Total Prueba: {total_time:.2f}s")
        self.stdout.write(self.style.SUCCESS(f"Exito: {results['success']}"))
        self.stdout.write(self.style.ERROR(f"Errores: {results['errors']}"))
        self.stdout.write(f"Tiempo Promedio Resp: {avg_time:.2f}s")
        self.stdout.write(self.style.SUCCESS('--------------------------------------------------'))

        if results['errors'] == 0 and avg_time < 2.0:
            self.stdout.write(self.style.SUCCESS("PRUEBA DE CARGA APROBADA (RNF003 Cumplido)"))
        else:
             self.stdout.write(self.style.WARNING("PRUEBA CON OBSERVACIONES (Revisar tiempos o errores)"))
