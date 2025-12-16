from rest_framework import viewsets, permissions, status
from django.conf import settings
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from .models import Usuario, Empresa, Producto, Cliente, Cotizacion, DetalleCotizacion, Trabajador, HistorialPromocion, Impuesto
from .serializers import (
    UsuarioSerializer, 
    EmpresaSerializer, 
    ProductoSerializer, 
    ClienteSerializer, 
    CotizacionSerializer,
    DetalleCotizacionSerializer,
    TrabajadorSerializer,
    MyTokenObtainPairSerializer,
    HistorialPromocionSerializer,
    ImpuestoSerializer
)
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
import uuid
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class IsAdminOrOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.rol == 'ADMIN':
            return True
        if hasattr(obj, 'empresa'):
            return obj.empresa == request.user.empresa
        return False

class EmpresaViewSet(viewsets.ModelViewSet):
    queryset = Empresa.objects.all()
    serializer_class = EmpresaSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['id']

    def get_queryset(self):
        if self.request.user.rol == 'ADMIN':
            return Empresa.objects.all().order_by('id')
        return Empresa.objects.filter(id=self.request.user.empresa.id).order_by('id')

    def perform_update(self, serializer):
        empresa = serializer.save()
        
        # Sync email with the main company user(s)
        if 'email' in serializer.validated_data:
            new_email = serializer.validated_data['email']
            if new_email:
                # Find users with role EMPRESA for this company
                users = Usuario.objects.filter(empresa=empresa, rol='EMPRESA')
                for user in users:
                    # Update email only (username remains unchanged)
                    user.email = new_email
                    try:
                        user.save()
                    except Exception as e:
                        print(f"Error updating user {user.id} email: {e}")

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['id']

    def get_queryset(self):
        if self.request.user.rol == 'ADMIN':
            return Usuario.objects.all().order_by('id')
        # EMPRESA users only see their own workers
        return Usuario.objects.filter(empresa=self.request.user.empresa, rol='TRABAJADOR').order_by('id')
    
    def perform_create(self, serializer):
        # If creating user is EMPRESA, assign their empresa to the new worker
        if self.request.user.rol == 'EMPRESA':
            serializer.save(empresa=self.request.user.empresa)

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['id']
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['categoria', 'marca', 'tiene_oferta']
    search_fields = ['nombre', 'sku', 'marca', 'categoria', 'descripcion']

    def get_queryset(self):
        queryset = super().get_queryset()
        empresa_id = self.request.query_params.get('empresa')
        if empresa_id:
            queryset = queryset.filter(empresa_id=empresa_id)
        elif self.request.user.rol != 'ADMIN' and self.request.user.empresa:
            queryset = queryset.filter(empresa=self.request.user.empresa)
        return queryset.order_by('id')

    def perform_create(self, serializer):
        if self.request.user.empresa:
            serializer.save(empresa=self.request.user.empresa)
        else:
            serializer.save()

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['id']
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['nombre', 'rut', 'email', 'empresa__nombre']

    def get_queryset(self):
        queryset = super().get_queryset()
        empresa_id = self.request.query_params.get('empresa')
        if empresa_id:
            queryset = queryset.filter(empresa_id=empresa_id)
        elif self.request.user.rol != 'ADMIN' and self.request.user.empresa:
            queryset = queryset.filter(empresa=self.request.user.empresa)
        return queryset.order_by('id')
    def perform_create(self, serializer):
        if self.request.user.empresa:
            serializer.save(empresa=self.request.user.empresa)

from rest_framework.decorators import api_view, permission_classes

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def track_quote_view(request, pk):
    from django.http import HttpResponse
    try:
        # Check if quote exists
        cotizacion = Cotizacion.objects.get(pk=pk)
        # Update status if it's currently 'ENVIADA'
        if cotizacion.estado == 'ENVIADA':
            cotizacion.estado = 'ABIERTA'
            cotizacion.save()
    except Cotizacion.DoesNotExist:
        pass
    
    # 1x1 Transparent GIF
    pixel = b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b'
    return HttpResponse(pixel, content_type='image/gif')

class CotizacionViewSet(viewsets.ModelViewSet):
    queryset = Cotizacion.objects.all()
    serializer_class = CotizacionSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['-id']

    def get_queryset(self):
        queryset = super().get_queryset()
        empresa_id = self.request.query_params.get('empresa')
        if empresa_id:
            queryset = queryset.filter(empresa_id=empresa_id)
        elif self.request.user.rol == 'ADMIN':
            return queryset
        elif self.request.user.empresa:
            return queryset.filter(empresa=self.request.user.empresa)
        return queryset

    def perform_create(self, serializer):
        if self.request.user.empresa:
            serializer.save(empresa=self.request.user.empresa, trabajador=self.request.user)
    
    @action(detail=True, methods=['get'])
    def generar_pdf(self, request, pk=None):
        """Genera y descarga el PDF de una cotización"""
        from django.http import HttpResponse
        from .utils.pdf_generator import generate_quote_pdf
        
        cotizacion = self.get_object()
        
        try:
            pdf_content = generate_quote_pdf(cotizacion)
            
            response = HttpResponse(pdf_content, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="cotizacion_{cotizacion.id}.pdf"'
            
            return response
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def enviar_email(self, request, pk=None):
        """Envía la cotización por email con PDF adjunto"""
        from django.core.mail import EmailMessage
        from django.conf import settings
        from .utils.pdf_generator import generate_quote_pdf
        from django.urls import reverse
        
        cotizacion = self.get_object()
        
        if not cotizacion.cliente.email:
            return Response({'error': 'El cliente no tiene email registrado'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Generate PDF
            pdf_content = generate_quote_pdf(cotizacion)
            
            # Prepare email with company name as sender
            # Format: "Company Name <email@gmail.com>"
            from_email = f"{cotizacion.empresa.nombre} <{settings.DEFAULT_FROM_EMAIL}>"
            reply_to_email = cotizacion.empresa.email if cotizacion.empresa.email else settings.DEFAULT_FROM_EMAIL
            
            # Tracking Pixel URL
            # Assuming the view name is 'track_quote' in urls.py
            # /api/cotizaciones/PK/track/
            # We need to construct the full URL.
            # Ideally use site domain, but for now specific to local/deployment
            
            # Try to build absolute URI
            # Since this is an API call, request.build_absolute_uri should work if Host header is present
            tracking_path = reverse('track_quote', args=[cotizacion.id]) # We will name the url 'track_quote'
            tracking_url = request.build_absolute_uri(tracking_path)
            
            subject = f'Cotización #{cotizacion.id} - {cotizacion.empresa.nombre}'
            
            # Message with HTML to include Tracking Pixel
            message_html = f"""
            <html>
            <body>
                <p>Estimado/a {cotizacion.cliente.nombre},</p>
                <p>Adjunto encontrará la cotización #{cotizacion.id} solicitada.</p>
                <p><strong>Detalles:</strong></p>
                <ul>
                    <li>Fecha: {cotizacion.fecha.strftime('%d/%m/%Y')}</li>
                    <li>Total: ${cotizacion.total:,.0f}</li>
                </ul>
                <p>Quedamos atentos a cualquier consulta.</p>
                <br>
                <p>Saludos cordiales,</p>
                <p><strong>{cotizacion.empresa.nombre}</strong></p>
                <p>{cotizacion.empresa.telefono if cotizacion.empresa.telefono else ''}</p>
                <p>Contáctanos: <a href="mailto:{cotizacion.empresa.email if cotizacion.empresa.email else reply_to_email}">{cotizacion.empresa.email if cotizacion.empresa.email else reply_to_email}</a></p>
                
                <img src="{tracking_url}" width="1" height="1" style="display:none;" alt="" />
            </body>
            </html>
            """
            
            email = EmailMessage(
                subject=subject,
                body=message_html, # Usamos HTML body logic if EmailMessage supports content_subtype
                from_email=from_email,
                to=[cotizacion.cliente.email],
                reply_to=[reply_to_email],
            )
            email.content_subtype = "html" # Set main content as HTML
            
            # Attach PDF
            email.attach(f'cotizacion_{cotizacion.id}.pdf', pdf_content, 'application/pdf')
            
            # Send email
            email.send()
            
            # Update status to ENVIADA if it was BORRADOR
            if cotizacion.estado == 'BORRADOR':
                cotizacion.estado = 'ENVIADA'
                cotizacion.save()
            
            return Response({'message': f'Email enviado exitosamente como {cotizacion.empresa.nombre}'}, status=status.HTTP_200_OK)
        except Exception as e:
            # Print full stack for debug since user can't see server logs easily
            import traceback
            traceback.print_exc()
            return Response({'error': f'Error al enviar email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f'Error al enviar email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def enviar_whatsapp(self, request, pk=None):
        """Envía la cotización por WhatsApp (API o Web según configuración)"""
        cotizacion = self.get_object()
        
        if not cotizacion.cliente.telefono:
            return Response({'error': 'El cliente no tiene teléfono registrado'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if WhatsApp Business API is enabled
        if cotizacion.empresa.whatsapp_enabled and cotizacion.empresa.whatsapp_provider:
            # Use WhatsApp Business API
            try:
                from .utils.pdf_generator import generate_quote_pdf
                
                # Generate PDF
                pdf_content = generate_quote_pdf(cotizacion)
                
                # Prepare message
                message = f"""Hola {cotizacion.cliente.nombre}, soy de {cotizacion.empresa.nombre}.

Le enviamos la cotización #{cotizacion.id}.

Total: ${cotizacion.total:,.0f}

{f'Contáctenos al: {cotizacion.empresa.telefono}' if cotizacion.empresa.telefono else 'Quedamos atentos a sus consultas.'}"""
                
                # Send via API based on provider
                if cotizacion.empresa.whatsapp_provider == 'twilio':
                    from twilio.rest import Client
                    
                    client = Client(
                        cotizacion.empresa.whatsapp_account_sid,
                        cotizacion.empresa.whatsapp_auth_token
                    )
                    
                    # Send message with media (PDF)
                    # Note: Twilio requires PDF to be publicly accessible URL
                    # For now, just send text message
                    client.messages.create(
                        from_=f'whatsapp:{cotizacion.empresa.whatsapp_from_number}',
                        to=f'whatsapp:{cotizacion.cliente.telefono}',
                        body=message
                    )
                    
                    return Response({'message': 'WhatsApp enviado exitosamente vía API'}, status=status.HTTP_200_OK)
                else:
                    return Response({'error': f'Proveedor {cotizacion.empresa.whatsapp_provider} no soportado aún'}, status=status.HTTP_400_BAD_REQUEST)
                    
            except Exception as e:
                return Response({'error': f'Error al enviar WhatsApp: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            # Return data for WhatsApp Web (frontend will handle)
            return Response({
                'method': 'web',
                'message': 'Usar WhatsApp Web',
                'phone': cotizacion.cliente.telefono,
                'company_name': cotizacion.empresa.nombre,
                'company_phone': cotizacion.empresa.telefono
            }, status=status.HTTP_200_OK)


class InviteCompanyView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        print(f"DEBUG: Attempting to invite email: '{email}'")
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Security: If Authenticated, restrict. If Anonymous, allow (Registration).
        if request.user.is_authenticated:
            if request.user.rol != 'ADMIN' and email != request.user.email:
                 return Response({'error': 'You can only invite your own email address'}, status=status.HTTP_403_FORBIDDEN)

        # Check if user exists to handle username uniqueness
        base_username = email
        new_username = email
        counter = 1
        while Usuario.objects.filter(username=new_username).exists():
            new_username = f"{base_username}_{counter}"
            counter += 1

        # Generate temp code
        temp_code = str(uuid.uuid4())[:8]

        # Create inactive user
        user = Usuario.objects.create(
            username=new_username,
            email=email,
            rol='EMPRESA',
            is_active=False,
            codigo_temporal=temp_code
        )
        user.set_unusable_password()
        user.save()

        # Send email with the code
        subject = "Código de Validación - Admi Cotizaciones"
        message = f"""Hola,

Has iniciado el proceso para registrar una nueva empresa en Admi Cotizaciones.

Tu código de seguridad es: {temp_code}

Este código es de un solo uso y es necesario para completar la validación de tu cuenta.

Si no solicitaste esto, por favor ignora este mensaje.

Atentamente,
El Equipo de Admi Cotizaciones"""

        try:
            with open('email_debug.log', 'a') as f:
                f.write(f"Attempting to send to {email} with code {temp_code}\n")
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            with open('email_debug.log', 'a') as f:
                f.write(f"SUCCESS: Email sent to {email}\n")
                
        except Exception as e:
            with open('email_debug.log', 'a') as f:
                f.write(f"ERROR: {str(e)}\n")
            print(f"Error sending email: {e}")
            # Return error to frontend so user knows it failed
            return Response({'error': f'Error sending email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'message': 'Invitation created', 'code': temp_code}, status=status.HTTP_201_CREATED)

class CreateCompanyDirectView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        data = request.data
        
        # Validations
        if not data.get('nombre'):
            return Response({'error': 'El nombre de la empresa es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Handle RUT: Must be unique. If empty, generate a temporary unique one.
            import uuid
            rut = data.get('rut', '').strip()
            if not rut:
                rut = f"TEMP-{uuid.uuid4().hex[:8]}"
            
            # 1. Create Company
            empresa = Empresa.objects.create(
                nombre=data['nombre'],
                rut=rut,
                direccion=data.get('direccion', ''),
                telefono=data.get('telefono', ''),
                email=data.get('correo_empresa', user.email),
                # Removed 'rubro' and 'web' as they don't exist in model
            )

            # 2. Create User linked to this Company
            # Ensure unique username
            base_username = user.email
            new_username = base_username
            counter = 1
            while Usuario.objects.filter(username=new_username).exists():
                new_username = f"{base_username}_{counter}"
                counter += 1

            new_user = Usuario.objects.create(
                username=new_username,
                email=user.email,
                rol='EMPRESA', # Company Owner
                empresa=empresa,
                is_active=True # Direct creation = Active immediately
            )
            
            # 3. Copy password from current user so they can login with same credentials
            new_user.password = user.password 
            new_user.save()

            return Response({
                'message': 'Empresa creada exitosamente',
                'empresa_id': empresa.id,
                'user_id': new_user.id
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ValidateCompanyView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        password = request.data.get('password')
        empresa_data = request.data.get('empresa')

        if not all([email, code, password, empresa_data]):
            return Response({'error': 'Missing fields'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = Usuario.objects.get(email=email, codigo_temporal=code)
        except Usuario.DoesNotExist:
            return Response({'error': 'Invalid email or code'}, status=status.HTTP_400_BAD_REQUEST)

        # Create or Update Company
        # Inject email from the user's email
        empresa_data['email'] = email
        
        if user.empresa:
            # Update existing company (Recovery flow)
            # Ensure we don't overwrite RUT with a conflict, but allow other updates
            empresa_serializer = EmpresaSerializer(user.empresa, data=empresa_data, partial=True)
        else:
            # Create new company (Invite flow)
            empresa_serializer = EmpresaSerializer(data=empresa_data)

        if empresa_serializer.is_valid():
            empresa = empresa_serializer.save()
        else:
            return Response(empresa_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Activate User and Link Company
        user.set_password(password)
        user.is_active = True
        user.codigo_temporal = None # Clear code
        user.empresa = empresa
        user.save()

        return Response({'message': 'Account validated successfully'}, status=status.HTTP_200_OK)

class UserCompaniesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        email = request.user.email
        # Find all active users with the same email
        users = Usuario.objects.filter(email=email, is_active=True).select_related('empresa')
        
        companies = []
        for user in users:
            if user.empresa:
                companies.append({
                    'user_id': user.id,
                    'empresa_id': user.empresa.id,
                    'empresa_nombre': user.empresa.nombre,
                    'empresa_logo': user.empresa.logo.url if user.empresa.logo else None,
                    'rol': user.rol,
                    'is_current': user.id == request.user.id
                })
        
        return Response(companies, status=status.HTTP_200_OK)

class SwitchCompanyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        target_user_id = request.data.get('user_id')
        if not target_user_id:
             return Response({'error': 'User ID required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            target_user = Usuario.objects.get(pk=target_user_id)
        except Usuario.DoesNotExist:
             return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        # Security check: Target user must have same email as current user
        if target_user.email != request.user.email:
             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        if not target_user.is_active:
             return Response({'error': 'Target account is inactive'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate new token for the target user
        refresh = MyTokenObtainPairSerializer.get_token(target_user)

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': target_user.id,
                'username': target_user.username,
                'email': target_user.email,
                'rol': target_user.rol,
                'empresa_id': target_user.empresa.id if target_user.empresa else None
            }
        }, status=status.HTTP_200_OK)

class DeleteCompanyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        user = request.user
        # Allow deletion if user is ADMIN (Global) or EMPRESA (Owner) or ADMIN (legacy owner role created before my fix)
        # Safest check: User has an empresa and is acting as admin/owner
        if user.rol not in ['ADMIN', 'EMPRESA']:
             return Response({'error': 'No tienes permisos para eliminar la empresa'}, status=status.HTTP_403_FORBIDDEN)

        empresa = user.empresa
        if not empresa:
            return Response({'error': 'No tienes una empresa asociada'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Delete the company.
            # Because Usuario.empresa has on_delete=models.CASCADE, 
            # ALL users associated with this company (including the requester) will be deleted automatically.
            empresa_name = empresa.nombre
            empresa.delete()
            
            return Response({'message': f'La empresa {empresa_name} y todos sus datos han sido eliminados correctamente.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Error al eliminar la empresa: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RegenerateCodeView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        email = request.data.get('email')
        empresa_id = request.data.get('empresa_id')

        user = None
        if email:
            user = Usuario.objects.filter(email=email).first()
        elif empresa_id:
            user = Usuario.objects.filter(empresa_id=empresa_id, rol='EMPRESA').first()

        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        # Generate new temp code
        temp_code = str(uuid.uuid4())[:8]
        user.codigo_temporal = temp_code
        # We don't deactivate the user, just set the code to allow re-validation/password reset
        user.save()

        return Response({'message': 'Code regenerated', 'code': temp_code}, status=status.HTTP_200_OK)

from django.db.models import Sum, Count, F
from django.db.models.functions import TruncMonth

class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def stats(self, request):
        user = request.user
        data = {}
        
        if user.rol == 'ADMIN':
            # Global Stats
            data['total_empresas'] = Empresa.objects.count()
            data['total_usuarios'] = Usuario.objects.count()
            data['total_cotizaciones'] = Cotizacion.objects.count()
            data['total_ventas_global'] = Cotizacion.objects.filter(estado='ACEPTADA').aggregate(Sum('total'))['total__sum'] or 0
            
            # Inventory Stats (Global)
            data['total_productos'] = Producto.objects.count()
            data['valor_inventario_global'] = Producto.objects.aggregate(total=Sum(F('precio') * F('stock')))['total'] or 0
            
            # Recent Activity for Admin
            last_quotes = Cotizacion.objects.all().order_by('-fecha')[:5]
            data['ultimas_cotizaciones_global'] = []
            for q in last_quotes:
                product_names = [d.producto.nombre for d in q.detalles.all()[:3]]
                products_str = ", ".join(product_names)
                if q.detalles.count() > 3:
                     products_str += "..."
                
                data['ultimas_cotizaciones_global'].append({
                    'id': q.id,
                    'empresa': q.empresa.nombre,
                    'total': q.total,
                    'fecha': q.fecha.strftime('%Y-%m-%d %H:%M'),
                    'estado': q.estado,
                    'productos': products_str or "Sin productos"
                })

            last_users = Usuario.objects.all().order_by('-date_joined')[:5]
            data['ultimos_usuarios'] = [
                {
                    'id': u.id,
                    'username': u.username,
                    'email': u.email,
                    'rol': u.get_rol_display(),
                    'empresa': u.empresa.nombre if u.empresa else 'Sin Empresa',
                    'fecha_registro': u.date_joined.strftime('%Y-%m-%d %H:%M')
                } for u in last_users
            ]
        
        if user.empresa:
            # Company Stats
            empresa = user.empresa
            qs_cotizaciones = Cotizacion.objects.filter(empresa=empresa)
            
            # Filter by month and year if provided
            month = request.query_params.get('month')
            year = request.query_params.get('year')
            
            if month and year:
                try:
                    m = int(month)
                    y = int(year)
                    import calendar
                    from django.utils import timezone
                    last_day = calendar.monthrange(y, m)[1]
                    start_date = timezone.datetime(y, m, 1, 0, 0, 0, tzinfo=timezone.get_current_timezone())
                    end_date = timezone.datetime(y, m, last_day, 23, 59, 59, 999999, tzinfo=timezone.get_current_timezone())
                    qs_cotizaciones = qs_cotizaciones.filter(fecha__range=(start_date, end_date))
                except (ValueError, TypeError):
                    pass # Invalid date params, ignore filter

            data['total_ventas'] = qs_cotizaciones.filter(estado='ACEPTADA').aggregate(Sum('total'))['total__sum'] or 0
            data['cotizaciones_activas'] = qs_cotizaciones.filter(estado__in=['ENVIADA', 'ABIERTA', 'BORRADOR']).count()
            data['cotizaciones_aceptadas'] = qs_cotizaciones.filter(estado='ACEPTADA').count()
            data['cotizaciones_rechazadas'] = qs_cotizaciones.filter(estado='RECHAZADA').count()

            # Inventory Stats (Company)
            qs_productos = Producto.objects.filter(empresa=empresa)
            data['total_productos'] = qs_productos.count()
            data['productos_bajo_stock'] = qs_productos.filter(stock__lte=5).count()
            data['valor_inventario'] = qs_productos.aggregate(total=Sum(F('precio') * F('stock')))['total'] or 0
            
            # Sales Chart Data (Last 6 months OR filtered list)
            # This is a bit complex for a single query, keeping it simple for now
            # We will return the last 10 accepted quotes for a list
            last_sales = qs_cotizaciones.filter(estado='ACEPTADA').order_by('-fecha')[:10]
            data['ultimas_ventas'] = [
                {
                    'id': q.id,
                    'cliente': q.cliente.nombre,
                    'total': q.total,
                    'fecha': q.fecha.strftime('%Y-%m-%d'),
                    'vendedor': q.trabajador.username if q.trabajador else 'N/A',
                    'vendedor_rol': q.trabajador.rol if q.trabajador else None
                } for q in last_sales
            ]
            
        return Response(data)

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        import csv
        from django.http import HttpResponse
        from django.utils import timezone

        user = request.user
        now = timezone.now()
        
        # Spanish Month Names
        meses = {
            1: 'enero', 2: 'febrero', 3: 'marzo', 4: 'abril',
            5: 'mayo', 6: 'junio', 7: 'julio', 8: 'agosto',
            9: 'septiembre', 10: 'octubre', 11: 'noviembre', 12: 'diciembre'
        }
        
        # Start with all quotes, then filter by permissions
        queryset = Cotizacion.objects.all().order_by('-fecha')

        # Filter by month and year if available
        month = request.query_params.get('month')
        year = request.query_params.get('year')

        if month and year:
            try:
                import calendar
                m = int(month)
                y = int(year)
                
                # Calculate range
                last_day = calendar.monthrange(y, m)[1]
                start_date = timezone.datetime(y, m, 1, 0, 0, 0, tzinfo=timezone.get_current_timezone())
                end_date = timezone.datetime(y, m, last_day, 23, 59, 59, 999999, tzinfo=timezone.get_current_timezone())
                
                queryset = queryset.filter(fecha__range=(start_date, end_date))
                
                month_name = meses.get(m, 'mes')
                filename = f"cotizaciones-{month_name}-{y}.csv"
            except ValueError:
                # Fallback if params are invalid
                 filename = f"cotizaciones-{now.strftime('%Y-%m-%d')}.csv"
        else:
             # Default filename for all data
             filename = f"cotizaciones-historico-{now.strftime('%Y-%m-%d')}.csv"

        
        # Filter by company if strictly required "por empresa"
        if user.empresa:
             queryset = queryset.filter(empresa=user.empresa)
        elif user.rol == 'ADMIN':
             pass # Admin gets all
        else:
             return Response({'error': 'No tiene permiso'}, status=403)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'

        writer = csv.writer(response)
        writer.writerow(['ID', 'Fecha', 'Cliente', 'Total', 'Estado', 'Vendedor', 'Email Cliente'])

        for q in queryset:
            writer.writerow([
                q.id, 
                q.fecha.strftime('%Y-%m-%d'), 
                q.cliente.nombre, 
                q.total, 
                q.estado, 
                q.trabajador.username if q.trabajador else 'N/A',
                q.cliente.email or 'N/A'
            ])

        return response

class TrabajadorViewSet(viewsets.ModelViewSet):
    queryset = Trabajador.objects.all()
    serializer_class = TrabajadorSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['id']

    def get_queryset(self):
        if self.request.user.rol == 'ADMIN':
            return Trabajador.objects.all()
        elif self.request.user.empresa:
             return Trabajador.objects.filter(empresa=self.request.user.empresa)
        return Trabajador.objects.none()

class HistorialPromocionViewSet(viewsets.ModelViewSet):
    serializer_class = HistorialPromocionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.empresa:
            return HistorialPromocion.objects.filter(empresa=user.empresa).order_by('-fecha_envio')
        return HistorialPromocion.objects.none()

class ImpuestoViewSet(viewsets.ModelViewSet):
    serializer_class = ImpuestoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.empresa:
            return Impuesto.objects.filter(empresa=user.empresa).order_by('id')
        return Impuesto.objects.none()

    def perform_create(self, serializer):
        if self.request.user.empresa:
            serializer.save(empresa=self.request.user.empresa)


from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail

class RequestPasswordResetView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = Usuario.objects.get(email=email)
        except Usuario.DoesNotExist:
            # Return success to avoid email enumeration
            return Response({'message': 'Si el correo existe, se ha enviado un enlace.'}, status=status.HTTP_200_OK)

        # Generate Token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Build Link (Frontend URL)
        # Assuming frontend runs on same host/port logic or specific config
        # Ideally this domain should be in settings
        # Localhost fallback for development
        reset_link = f"http://localhost:5173/reset-password/{uid}/{token}" 
        
        subject = "Recuperar Contraseña - Admi Cotizaciones"
        message = f"""Hola {user.username},

Recibimos una solicitud para restablecer tu contraseña.
Haz clic en el siguiente enlace para crear una nueva contraseña:

{reset_link}

Si no solicitaste esto, ignora este correo.

Saludos,
Admi Cotizaciones"""

        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
        except Exception as e:
            return Response({'error': f'Error sending email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'message': 'Si el correo existe, se ha enviado un enlace.'}, status=status.HTTP_200_OK)

class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        password = request.data.get('password')

        if not all([uidb64, token, password]):
            return Response({'error': 'Missing fields'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = Usuario.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, Usuario.DoesNotExist):
            return Response({'error': 'Invalid link'}, status=status.HTTP_400_BAD_REQUEST)

        if default_token_generator.check_token(user, token):
            user.set_password(password)
            user.save()
            return Response({'message': 'Password reset successful'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)
