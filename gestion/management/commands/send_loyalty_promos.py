from django.core.management.base import BaseCommand
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from gestion.models import Empresa, Cotizacion, Cliente, Producto
from datetime import timedelta
import time
import random

class Command(BaseCommand):
    help = 'Servicio continuo de fidelización: Envía correos con productos aleatorios según configuración.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS("Iniciando servicio de fidelización (Ctrl+C para detener)..."))
        
        try:
            while True:
                try:
                    self.process_loyalty()
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error en ciclo principal: {e}"))
                
                # Sleep interval (shorter for testing responsiveness)
                time.sleep(5)
        except KeyboardInterrupt:
            self.stdout.write(self.style.SUCCESS("\n¡Servicio detenido por el usuario!"))

    def process_loyalty(self):
        empresas = Empresa.objects.filter(fidelizacion_activa=True)
        now = timezone.now()

        for empresa in empresas:
            # Settings (treated as SECONDS for testing purposes as per user context)
            frequency_seconds = empresa.dias_para_fidelizacion
            start_delay_seconds = empresa.dias_inicio_fidelizacion
            
            # Get products once per company per cycle
            productos = list(Producto.objects.filter(empresa=empresa, stock__gt=0))
            if not productos:
                continue

            clientes = Cliente.objects.filter(empresa=empresa)
            
            for cliente in clientes:
                if not cliente.email:
                    continue

                # 1. CHECK START DELAY (Time since registration)
                if not cliente.creado_en:
                    # Fallback if creado_en is null (shouldn't happen with auto_now_add)
                    continue
                
                time_registered = (now - cliente.creado_en).total_seconds()
                if time_registered < start_delay_seconds:
                    # Too new, wait longer
                    continue

                # 2. CHECK FREQUENCY (Time since last promotion)
                # We assume HistorialPromocion is available
                from gestion.models import HistorialPromocion
                last_promo = HistorialPromocion.objects.filter(
                    empresa=empresa,
                    cliente=cliente
                ).order_by('-fecha_envio').first()

                if last_promo:
                    time_since_last = (now - last_promo.fecha_envio).total_seconds()
                    if time_since_last < frequency_seconds:
                        # Cooldown active
                        continue
                
                # If we get here, we can send a promo!
                producto = random.choice(productos)
                self.send_random_product_email(empresa, cliente, producto)

    def send_random_product_email(self, empresa, cliente, producto):
        
        discount_text = f"{empresa.descuento_fidelizacion}%"
        if empresa.descuento_fidelizacion % 1 == 0:
             discount_text = f"{int(empresa.descuento_fidelizacion)}%"

        subject = f"¡Oferta Especial para ti en {empresa.nombre}!"
        
        # Calculate discounted price (Price + IVA)
        impuesto_decimal = producto.impuesto / 100
        precio_con_iva = producto.precio * (1 + impuesto_decimal)
        
        precio_original = precio_con_iva
        descuento_monto = (precio_original * empresa.descuento_fidelizacion) / 100
        precio_final = precio_original - descuento_monto

        message = f"""
{empresa.nombre}:

Hola {cliente.nombre},

{empresa.mensaje_fidelizacion}

**************************************************
TE OFRECEMOS: {producto.nombre}

A solo: ${precio_final:,.0f} (Precio normal: ${precio_original:,.0f})
¡Con un {discount_text} de descuento!
**************************************************

Descripción: {producto.descripcion or 'Sin descripción disponible.'}

¡Aprovecha esta oportunidad única!

Atentamente,
El equipo de {empresa.nombre}
        """
        
        # Use company name in sender if possible, otherwise format it
        from_email = f"{empresa.nombre} <{settings.DEFAULT_FROM_EMAIL}>"
        recipient_list = [cliente.email]

        try:
            send_mail(subject, message, from_email, recipient_list)
            
            # Log to history
            from gestion.models import HistorialPromocion
            HistorialPromocion.objects.create(
                empresa=empresa,
                cliente=cliente,
                descuento_ofrecido=empresa.descuento_fidelizacion,
                mensaje_enviado=f"Oferta {producto.nombre} - {discount_text} OFF"
            )
            
            self.stdout.write(self.style.SUCCESS(f"[{timezone.now().strftime('%H:%M:%S')}] Enviado a {cliente.email} ({producto.nombre})"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"    [ERROR] {cliente.email}: {e}"))
