from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EmpresaViewSet, 
    UsuarioViewSet, 
    ProductoViewSet, 
    ClienteViewSet, 
    CotizacionViewSet,
    MyTokenObtainPairView,
    InviteCompanyView,
    ValidateCompanyView,
    RegenerateCodeView,
    DashboardViewSet,
    TrabajadorViewSet,
    HistorialPromocionViewSet,
    track_quote_view,
    RequestPasswordResetView,
    PasswordResetConfirmView,
    ImpuestoViewSet,
    UserCompaniesView,
    SwitchCompanyView,
    CreateCompanyDirectView,
    DeleteCompanyView
)
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'empresas', EmpresaViewSet)
router.register(r'usuarios', UsuarioViewSet)
router.register(r'productos', ProductoViewSet)
router.register(r'clientes', ClienteViewSet)
router.register(r'cotizaciones', CotizacionViewSet)
router.register(r'trabajadores', TrabajadorViewSet)
router.register(r'promociones', HistorialPromocionViewSet, basename='promociones')
router.register(r'impuestos', ImpuestoViewSet, basename='impuestos')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('invite-company/', InviteCompanyView.as_view(), name='invite_company'),
    path('validate-company/', ValidateCompanyView.as_view(), name='validate_company'),
    path('api/regenerate-code/', RegenerateCodeView.as_view(), name='regenerate-code'),
    path('api/user-companies/', UserCompaniesView.as_view(), name='user-companies'),
    path('api/switch-company/', SwitchCompanyView.as_view(), name='switch-company'),
    path('api/create-company-direct/', CreateCompanyDirectView.as_view(), name='create-company-direct'),
    path('api/delete-company/', DeleteCompanyView.as_view(), name='delete-company'),
    path('cotizaciones/<int:pk>/track/', track_quote_view, name='track_quote'),
    path('password-reset/request/', RequestPasswordResetView.as_view(), name='password_reset_request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
]
