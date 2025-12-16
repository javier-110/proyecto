from django.test import TestCase
from django.contrib.auth import get_user_model
from ..models import Empresa, Producto, Cliente, Cotizacion, DetalleCotizacion
from django.utils import timezone
from datetime import timedelta

Usuario = get_user_model()

class CotizacionTests(TestCase):
    def setUp(self):
        # Create Company
        self.empresa = Empresa.objects.create(
            nombre="Test Company",
            email="test@company.com",
            rut="11.222.333-4"
        )
        
        # Create Admin User
        self.user = Usuario.objects.create_user(
            username="admin", 
            password="password", 
            email="admin@test.com",
            rol="ADMIN",
            empresa=self.empresa
        )
        
        # Create Product
        self.producto = Producto.objects.create(
            empresa=self.empresa,
            nombre="Producto Test",
            precio=1000,
            stock=10
        )
        
        # Create Client
        self.cliente = Cliente.objects.create(
            empresa=self.empresa,
            nombre="Cliente Test",
            email="cliente@test.com",
            rut="99.888.777-6"
        )

    def test_creacion_cotizacion(self):
        """Test basic quote creation"""
        cotizacion = Cotizacion.objects.create(
            empresa=self.empresa,
            cliente=self.cliente,
            trabajador=self.user,
            total=1000,
            estado='BORRADOR'
        )
        
        self.assertEqual(cotizacion.numero_cotizacion, 1)
        self.assertEqual(cotizacion.estado, 'BORRADOR')
        
    def test_correlativo_cotizacion(self):
        """Test consecutive numbering of quotes"""
        c1 = Cotizacion.objects.create(empresa=self.empresa, cliente=self.cliente, total=100)
        c2 = Cotizacion.objects.create(empresa=self.empresa, cliente=self.cliente, total=200)
        
        self.assertEqual(c1.numero_cotizacion, 1)
        self.assertEqual(c2.numero_cotizacion, 2)

class FidelizacionTests(TestCase):
    def setUp(self):
        self.empresa = Empresa.objects.create(
            nombre="Promo Co", 
            rut="55.666.777-8",
            fidelizacion_activa=True,
            dias_inicio_fidelizacion=7,
            dias_para_fidelizacion=30
        )
        self.producto = Producto.objects.create(
            empresa=self.empresa, nombre="Regalo", precio=500, stock=5
        )
        
    def test_logica_fidelizacion_cliente_nuevo(self):
        """Verify logic for new clients (should NOT send if too new)"""
        # Client created NOW
        cliente = Cliente.objects.create(
            empresa=self.empresa, 
            nombre="Nuevo", 
            email="nuevo@test.com"
        )
        
        now = timezone.now()
        time_registered = (now - cliente.creado_en).total_seconds()
        
        should_send = time_registered >= self.empresa.dias_inicio_fidelizacion * 86400
        self.assertFalse(should_send, "Should not send promo to brand new client")

    def test_logica_fidelizacion_cliente_antiguo(self):
        """Verify logic allowing sending to old clients"""
        # Client created 10 days ago
        old_date = timezone.now() - timedelta(days=10)
        cliente = Cliente.objects.create(
            empresa=self.empresa, 
            nombre="Antiguo", 
            email="antiguo@test.com"
        )
        
        # Manually update created_at at DB level
        Cliente.objects.filter(pk=cliente.pk).update(creado_en=old_date)
        cliente.refresh_from_db()
        
        now = timezone.now()
        time_registered_days = (now - cliente.creado_en).days
        
        self.assertTrue(time_registered_days >= self.empresa.dias_inicio_fidelizacion, "Should qualify for promo")
