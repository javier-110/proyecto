from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from django.conf import settings
from gestion.models import Cotizacion, Usuario

class Command(BaseCommand):
    help = 'Verifica cotizaciones antiguas y notifica a los administradores'

    def handle(self, *args, **kwargs):
        self.stdout.write("Verificando cotizaciones antiguas...")
        
        # Threshold: 3 days (business days could be complex, using absolute days for now)
        limit_date = timezone.now() - timedelta(days=3)
        
        # Find quotes sent > 3 days ago and still in 'ENVIADA' status
        stale_quotes = Cotizacion.objects.filter(estado='ENVIADA', fecha__lte=limit_date)
        
        if not stale_quotes.exists():
            self.stdout.write(self.style.SUCCESS("No se encontraron cotizaciones antiguas."))
            return

        # Group by Company to send consolidated emails
        company_quotes = {}
        for quote in stale_quotes:
            if quote.empresa not in company_quotes:
                company_quotes[quote.empresa] = []
            company_quotes[quote.empresa].append(quote)

        for empresa, quotes in company_quotes.items():
            self.stdout.write(f"Procesando empresa: {empresa.nombre} - {len(quotes)} cotizaciones vencidas.")
            
            # Find destination email (Empresa User)
            # Try to find a user with role EMPRESA for this company
            empresa_user = Usuario.objects.filter(empresa=empresa, rol='EMPRESA').first()
            if not empresa_user or not empresa_user.email:
                self.stdout.write(self.style.WARNING(f"Empresa {empresa.nombre} no tiene usuario/email válido."))
                continue

            subject = f"Alerta - {len(quotes)} Cotizaciones sin respuesta - {empresa.nombre}"
            message = f"""Hola {empresa.nombre},

El sistema ha detectado {len(quotes)} cotizaciones enviadas hace más de 3 días que aún no tienen respuesta (estado 'ENVIADA').

Listado:
"""
            for q in quotes:
                message += f"- #{q.id} Cliente: {q.cliente.nombre} (${q.total:,.0f}) - Fecha: {q.fecha.strftime('%d/%m/%Y')}\n"

            message += "\nSe recomienda contactar a los clientes.\n\nSaludos,\nAdmi Cotizaciones"

            try:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [empresa_user.email],
                    fail_silently=False,
                )
                self.stdout.write(self.style.SUCCESS(f"Aviso enviado a {empresa_user.email}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error enviando correo a {empresa.nombre}: {e}"))
