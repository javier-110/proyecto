import os
import django
from django.conf import settings
from django.core.mail import send_mail

# Minimal Settings Configuration
# We need to manually configure settings because we are running disjoint from manage.py context sometimes
# But better to setup django environment
import sys

# Add project root to sys path
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema.settings')
django.setup()

try:
    print("Attempting to send email...")
    send_mail(
        'Test Subject',
        'Test Message from Script',
        settings.DEFAULT_FROM_EMAIL,
        ['hermosillajavier404@gmail.com'],
        fail_silently=False,
    )
    print("Email sent successfully!")
except Exception as e:
    print(f"FAILED to send email: {e}")
