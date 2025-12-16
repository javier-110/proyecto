from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

class Empresa(models.Model):
    nombre = models.CharField(max_length=100)
    rut = models.CharField(max_length=20, unique=True)
    email = models.EmailField(blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    direccion = models.CharField(max_length=255, blank=True, null=True)
    codigo_validacion = models.CharField(max_length=6, blank=True, null=True)
    validado = models.BooleanField(default=False)
    impuesto_defecto = models.DecimalField(max_digits=5, decimal_places=2, default=19.0)
    creado_en = models.DateTimeField(auto_now_add=True)
    logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)
    
    # WhatsApp Business API Configuration
    whatsapp_enabled = models.BooleanField(default=False)
    whatsapp_provider = models.CharField(max_length=50, blank=True, null=True)
    whatsapp_account_sid = models.CharField(max_length=100, blank=True, null=True)
    whatsapp_auth_token = models.CharField(max_length=100, blank=True, null=True)
    whatsapp_from_number = models.CharField(max_length=20, blank=True, null=True)

    # Loyalty System Configuration
    fidelizacion_activa = models.BooleanField(default=False)
    dias_para_fidelizacion = models.IntegerField(default=30, help_text="Frecuencia: Días entre cada correo de promoción")
    dias_inicio_fidelizacion = models.IntegerField(default=7, help_text="Inicio: Días después del registro para enviar el primer correo")
    mensaje_fidelizacion = models.TextField(default="Te extrañamos. Aquí tienes un descuento especial para tu próxima compra.", blank=True)
    descuento_fidelizacion = models.DecimalField(max_digits=5, decimal_places=2, default=5.0, help_text="Porcentaje de descuento")

    # Customization
    color_menu_sidebar = models.CharField(max_length=20, default='#1e1e1e')
    color_boton_principal = models.CharField(max_length=20, default='#646cff')
    color_texto_principal = models.CharField(max_length=20, default='#ffffff')
    color_fondo_pagina = models.CharField(max_length=20, default='#121212')
    color_texto_secundario = models.CharField(max_length=20, default='#b3b3b3')
    color_borde = models.CharField(max_length=50, default='rgba(255, 255, 255, 0.1)')

    # Currency Configuration
    moneda_simbolo = models.CharField(max_length=5, default='$')
    moneda_codigo = models.CharField(max_length=5, default='CLP')
    moneda_decimales = models.IntegerField(default=0)

    def __str__(self):
        return self.nombre

class Usuario(AbstractUser):
    ROLES = (
        ('ADMIN', 'Administrador'),
        ('EMPRESA', 'Empresa'),
        ('TRABAJADOR', 'Trabajador'),
    )
    rol = models.CharField(max_length=10, choices=ROLES, default='TRABAJADOR')
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, null=True, blank=True, related_name='usuarios')
    codigo_temporal = models.CharField(max_length=100, blank=True, null=True)

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.rol = 'ADMIN'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.get_rol_display()})"

class Impuesto(models.Model):
    TIPO_IMPUESTO = (
        ('PORCENTAJE', 'Porcentaje (%)'),
        ('FIJO', 'Monto Fijo ($)'),
    )
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='impuestos')
    nombre = models.CharField(max_length=50)
    valor = models.DecimalField(max_digits=16, decimal_places=4)
    tipo = models.CharField(max_length=20, choices=TIPO_IMPUESTO, default='PORCENTAJE')
    APLICACION_IMPUESTO = (
        ('NETO', 'Sobre Neto'),
        ('TOTAL', 'Sobre Total (Neto + IVA)'),
    )
    aplicacion = models.CharField(max_length=10, choices=APLICACION_IMPUESTO, default='NETO')
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre} ({self.valor} {self.get_tipo_display()})"

class Producto(models.Model):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='productos')
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True, null=True)
    precio = models.DecimalField(max_digits=16, decimal_places=4)
    impuesto = models.DecimalField(max_digits=5, decimal_places=2, default=19.0)
    categoria = models.CharField(max_length=100, blank=True, null=True)
    marca = models.CharField(max_length=100, blank=True, null=True)
    stock = models.IntegerField(default=0)
    impuesto_especifico = models.DecimalField(max_digits=16, decimal_places=4, default=0, help_text="Monto fijo de impuesto específico (Legacy)")
    impuesto_adicional = models.ForeignKey(Impuesto, on_delete=models.SET_NULL, null=True, blank=True, related_name='productos', help_text="Impuesto específico seleccionado")
    impuestos = models.ManyToManyField(Impuesto, blank=True, related_name='productos_m2m', help_text="Impuestos adicionales aplicables")
    tiene_oferta = models.BooleanField(default=False)
    precio_oferta = models.DecimalField(max_digits=16, decimal_places=4, null=True, blank=True)
    oferta_porcentaje = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    oferta_inicio = models.DateTimeField(null=True, blank=True)
    oferta_fin = models.DateTimeField(null=True, blank=True)
    sku = models.CharField(max_length=50, blank=True, null=True, unique=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre

class Cliente(models.Model):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='clientes')
    rut = models.CharField(max_length=20, blank=True, null=True)
    nombre = models.CharField(max_length=255)
    email = models.EmailField()
    telefono = models.CharField(max_length=20, blank=True, null=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre

class Cotizacion(models.Model):
    ESTADOS = (
        ('BORRADOR', 'Borrador'),
        ('ENVIADA', 'Enviada'),
        ('ACEPTADA', 'Aceptada'),
        ('RECHAZADA', 'Rechazada'),
    )
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='cotizaciones')
    trabajador = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='cotizaciones')
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='cotizaciones')
    fecha = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=10, choices=ESTADOS, default='BORRADOR')
    total = models.DecimalField(max_digits=16, decimal_places=4, default=0)
    descuento = models.DecimalField(max_digits=16, decimal_places=4, default=0)
    numero_cotizacion = models.PositiveIntegerField(editable=False, null=True)

    def save(self, *args, **kwargs):
        if not self.numero_cotizacion:
            # Get the last quote number for this company
            last_quote = Cotizacion.objects.filter(empresa=self.empresa).order_by('numero_cotizacion').last()
            if last_quote and last_quote.numero_cotizacion:
                self.numero_cotizacion = last_quote.numero_cotizacion + 1
            else:
                self.numero_cotizacion = 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.usuario.username} - {self.empresa.nombre}"

class DetalleCotizacion(models.Model):
    cotizacion = models.ForeignKey(Cotizacion, related_name='detalles', on_delete=models.CASCADE)
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField(default=1)
    precio = models.DecimalField(max_digits=16, decimal_places=4)
    descuento = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="Porcentaje de descuento por ítem")

    def __str__(self):
        return f"{self.cantidad} x {self.producto.nombre}"

class Trabajador(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, related_name='trabajador_profile')
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)

    def __str__(self):
        return self.usuario.username

class HistorialPromocion(models.Model):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    fecha_envio = models.DateTimeField(auto_now_add=True)
    descuento_ofrecido = models.DecimalField(max_digits=5, decimal_places=2)
    mensaje_enviado = models.TextField()

    def __str__(self):
        return f"Promocion a {self.cliente.nombre} - {self.fecha_envio}"
