from rest_framework import serializers
from .models import Usuario, Empresa, Producto, Cliente, Cotizacion, DetalleCotizacion, HistorialPromocion, Trabajador, Impuesto
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['user_id'] = user.id
        token['rol'] = user.rol
        if user.empresa:
            token['empresa_id'] = user.empresa.id

        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['rol'] = self.user.rol
        data['user_id'] = self.user.id
        if self.user.empresa:
            data['empresa_id'] = self.user.empresa.id

        # Check for multiple companies/profiles
        related_users = Usuario.objects.filter(email=self.user.email, is_active=True).select_related('empresa')
        companies = []
        for u in related_users:
            if u.empresa:
                companies.append({
                    'user_id': u.id,
                    'empresa_id': u.empresa.id,
                    'empresa_nombre': u.empresa.nombre,
                    'empresa_logo': u.empresa.logo.url if u.empresa.logo else None,
                    'is_current': u.id == self.user.id
                })
        data['companies'] = companies
        return data

class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = '__all__'

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'rol', 'empresa', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = Usuario.objects.create_user(**validated_data)
        
        # If user is TRABAJADOR, create Trabajador instance
        if user.rol == 'TRABAJADOR' and user.empresa:
            from .models import Trabajador
            Trabajador.objects.create(usuario=user, empresa=user.empresa)
        
        return user

class ImpuestoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Impuesto
        fields = ['id', 'nombre', 'valor', 'tipo', 'aplicacion', 'empresa']
        extra_kwargs = {'empresa': {'read_only': True}}

class ProductoSerializer(serializers.ModelSerializer):
    impuesto_adicional_data = ImpuestoSerializer(source='impuesto_adicional', read_only=True)
    impuestos_details = ImpuestoSerializer(source='impuestos', many=True, read_only=True)

    class Meta:
        model = Producto
        fields = '__all__'
        extra_kwargs = {'empresa': {'required': False}}


class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'
        extra_kwargs = {'empresa': {'required': False}}

class DetalleCotizacionSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre')
    impuesto = serializers.ReadOnlyField(source='producto.impuesto')
    impuesto_especifico = serializers.ReadOnlyField(source='producto.impuesto_especifico')
    # Custom Tax Fields
    impuesto_adicional_nombre = serializers.ReadOnlyField(source='producto.impuesto_adicional.nombre')
    impuesto_adicional_valor = serializers.ReadOnlyField(source='producto.impuesto_adicional.valor')
    impuesto_adicional_tipo = serializers.ReadOnlyField(source='producto.impuesto_adicional.tipo')
    impuesto_adicional_aplicacion = serializers.ReadOnlyField(source='producto.impuesto_adicional.aplicacion')
    impuestos_adicionales_details = ImpuestoSerializer(source='producto.impuestos', many=True, read_only=True)

    class Meta:
        model = DetalleCotizacion
        fields = ['id', 'producto', 'producto_nombre', 'cantidad', 'precio', 'impuesto', 
                  'impuesto_especifico', 'descuento',
                  'impuesto_adicional_nombre', 'impuesto_adicional_valor', 'impuesto_adicional_tipo', 'impuesto_adicional_aplicacion',
                  'impuestos_adicionales_details']

class CotizacionSerializer(serializers.ModelSerializer):
    detalles = DetalleCotizacionSerializer(many=True)
    cliente_nombre = serializers.ReadOnlyField(source='cliente.nombre')
    cliente_email = serializers.ReadOnlyField(source='cliente.email')
    cliente_telefono = serializers.ReadOnlyField(source='cliente.telefono')
    trabajador_nombre = serializers.ReadOnlyField(source='trabajador.username')
    trabajador_rol = serializers.ReadOnlyField(source='trabajador.rol')
    cliente = serializers.PrimaryKeyRelatedField(queryset=Cliente.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Cotizacion
        fields = ['id', 'numero_cotizacion', 'empresa', 'trabajador', 'trabajador_nombre', 'trabajador_rol', 'cliente', 'cliente_nombre', 'cliente_email', 'cliente_telefono', 'fecha', 'estado', 'total', 'descuento', 'detalles']
        extra_kwargs = {'empresa': {'required': False}}

    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles')
        cliente_data = self.initial_data.get('cliente_data')

        if not validated_data.get('cliente') and cliente_data:
            empresa = validated_data.get('empresa')
            if empresa:
                cliente = Cliente.objects.create(empresa=empresa, **cliente_data)
                validated_data['cliente'] = cliente

        cotizacion = Cotizacion.objects.create(**validated_data)
        for detalle_data in detalles_data:
            DetalleCotizacion.objects.create(cotizacion=cotizacion, **detalle_data)
        return cotizacion

class TrabajadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trabajador
        fields = '__all__'

class HistorialPromocionSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.ReadOnlyField(source='cliente.nombre')
    cliente_email = serializers.ReadOnlyField(source='cliente.email')

    class Meta:
        model = HistorialPromocion
        fields = ['id', 'cliente', 'cliente_nombre', 'cliente_email', 'fecha_envio', 'descuento_ofrecido', 'mensaje_enviado']
