from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from io import BytesIO
from datetime import datetime, timedelta
import os


def generate_quote_pdf(cotizacion):
    """
    Genera un PDF profesional para una cotización.
    
    Args:
        cotizacion: Objeto Cotizacion con todos sus datos relacionados
        
    Returns:
        BytesIO: Buffer con el contenido del PDF
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter,
                           rightMargin=0.75*inch, leftMargin=0.75*inch,
                           topMargin=0.75*inch, bottomMargin=0.75*inch)
    
    # Container for the 'Flowable' objects
    elements = []
    
    # Define styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#646cff'),
        spaceAfter=10,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.HexColor('#888'),
        spaceAfter=20,
        alignment=TA_CENTER
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#646cff'),
        spaceAfter=12,
        spaceBefore=12
    )
    
    # Logo and Header
    if cotizacion.empresa.logo:
        try:
            # We need the absolute path specifically for reportlab
            # If using local storage, path is MEDIA_ROOT + filename
            from django.conf import settings
            logo_path = os.path.join(settings.MEDIA_ROOT, str(cotizacion.empresa.logo).replace('/', os.sep))
            
            # Check if using other storage (e.g. S3), logic might differ. Assuming local for now.
            if os.path.exists(logo_path):
                im = Image(logo_path, width=0.75*inch, height=0.75*inch)
                im.hAlign = 'LEFT'
                elements.append(im)
                elements.append(Spacer(1, 0.1*inch))
        except Exception as e:
            print(f"Error loading logo: {e}")

    # Title with company name and products
    product_names = [d.producto.nombre for d in cotizacion.detalles.all() if d.producto]
    products_str = ", ".join(product_names)
    if len(products_str) > 50:
         products_str = products_str[:47] + "..."
    
    title = Paragraph(f"{cotizacion.empresa.nombre} - {products_str}", title_style)
    elements.append(title)
    elements.append(Spacer(1, 0.3*inch))
    
    # Company and Client Info Table
    quote_number = cotizacion.id
    info_data = [
        ['EMPRESA', 'CLIENTE'],
        [cotizacion.empresa.nombre, cotizacion.cliente.nombre],
        [f'RUT: {cotizacion.empresa.rut or "N/A"}', f'RUT: {cotizacion.cliente.rut or "N/A"}'],
        [f'Email: {cotizacion.empresa.email or "N/A"}', f'Email: {cotizacion.cliente.email or "N/A"}'],
        [f'Teléfono: {cotizacion.empresa.telefono or "N/A"}', f'Teléfono: {cotizacion.cliente.telefono or "N/A"}'],
        ['', f'Cotización N°: {quote_number}'],
    ]
    
    if cotizacion.empresa.direccion:
        # Check if we should merge with the previous row or add new
        # Current last row is the Quote Number.
        # We can add direction to the left of Quote Number
        info_data[-1][0] = f'Dirección: {cotizacion.empresa.direccion}'
    
    info_table = Table(info_data, colWidths=[3.25*inch, 3.25*inch])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#646cff')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
    ]))
    
    elements.append(info_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Quote Details
    details_heading = Paragraph("Detalles de la Cotización", heading_style)
    elements.append(details_heading)
    
    # Date and Status
    # Date and Status
    quote_number = cotizacion.numero_cotizacion if cotizacion.numero_cotizacion else cotizacion.id
    date_str = cotizacion.fecha.strftime('%d/%m/%Y')
    
    # Worker Name logic
    vendedor_nombre = None
    if cotizacion.trabajador and cotizacion.trabajador.rol == 'TRABAJADOR':
        vendedor_nombre = cotizacion.trabajador.get_full_name() or cotizacion.trabajador.username

    details_info = [
        ['Fecha:', date_str, 'Válida hasta:', (cotizacion.fecha + timedelta(days=30)).strftime('%d/%m/%Y')],
    ]
    
    if vendedor_nombre:
        details_info.append(['Vendedor:', vendedor_nombre, '', ''])
    else:
        # Maintain structure or just omit? Table expects lists of length 4 for colWidths?
        # The colWidths are [1*inch, 2.25*inch, 1.2*inch, 2.05*inch].
        # If I omit the row, the table will just be shorter.
        pass
    
    details_table = Table(details_info, colWidths=[1*inch, 2.25*inch, 1.2*inch, 2.05*inch])
    details_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    
    elements.append(details_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Currency Symbol
    currency_symbol = cotizacion.empresa.moneda_simbolo
    
    # Products Table
    products_heading = Paragraph("Productos / Servicios", heading_style)
    elements.append(products_heading)
    
    # Table header
    products_data = [['SKU', 'Producto', 'Cant.', 'Precio Unit.', 'Desc.', 'Subtotal']]
    
    # Calculate totals
    total_net_accumulated = 0
    total_additional_accumulated = 0
    total_iva_accumulated = 0
    total_final_accumulated = 0
    
    # Add products
    for detalle in cotizacion.detalles.all():
        sku = detalle.producto.sku if detalle.producto and detalle.producto.sku else '-'
        producto_nombre = detalle.producto.nombre if detalle.producto else 'Producto eliminado'
        cantidad = detalle.cantidad
        precio_neto = float(detalle.precio)
        descuento_item = float(detalle.descuento) if hasattr(detalle, 'descuento') else 0
        
        if detalle.producto:
             taxes = list(detalle.producto.impuestos.all())
             if not taxes:
                 if detalle.producto.impuesto_adicional:
                     taxes.append(detalle.producto.impuesto_adicional)
                 elif detalle.producto.impuesto_especifico > 0:
                     # Fake Tax Object for Legacy
                     class LegacyTax:
                         valor = detalle.producto.impuesto_especifico
                         tipo = 'PORCENTAJE' # Assumed
                         aplicacion = 'NETO'
                     taxes.append(LegacyTax())
        else:
             taxes = []

        iva_rate = float(detalle.producto.impuesto) if detalle.producto else 19.0
        
        # Calculate Forward from Net
        net_unit = precio_neto
        
        # Neto Taxes
        unit_additional = 0
        for t in [x for x in taxes if x.aplicacion == 'NETO']:
             val = float(t.valor)
             if t.tipo == 'FIJO':
                 unit_additional += val
             else:
                 unit_additional += net_unit * (val / 100.0)
                 
        base_for_iva = net_unit + unit_additional
        unit_iva = base_for_iva * (iva_rate / 100.0)
        total_with_iva = base_for_iva + unit_iva
        
        # Total Taxes
        unit_total_additional = 0
        for t in [x for x in taxes if x.aplicacion == 'TOTAL']:
             val = float(t.valor)
             if t.tipo == 'FIJO':
                 unit_total_additional += val
             else:
                 unit_total_additional += total_with_iva * (val / 100.0)
                 
        precio_final_unit = total_with_iva + unit_total_additional
        total_additional_unit = unit_additional + unit_total_additional
        
        # Calculate Item Totals for Accumulation
        line_gross_total = precio_final_unit * cantidad
        discount_amount = line_gross_total * (descuento_item / 100.0)
        subtotal_final = line_gross_total - discount_amount
        
        # Apply quantity and discount factor to components
        factor = cantidad * (1 - (descuento_item / 100.0))
        
        total_net_accumulated += net_unit * factor
        total_additional_accumulated += total_additional_unit * factor
        total_iva_accumulated += unit_iva * factor
        total_final_accumulated += subtotal_final
        
        products_data.append([
            sku,
            producto_nombre,
            str(cantidad),
            f'{currency_symbol} {precio_final_unit:,.2f}',
            f'{descuento_item:g}%',
            f'{currency_symbol} {subtotal_final:,.2f}'
        ])
    
    products_table = Table(products_data, colWidths=[1*inch, 2.5*inch, 0.5*inch, 1*inch, 0.75*inch, 1*inch])
    products_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#646cff')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('ALIGN', (1, 1), (1, -1), 'LEFT'),  # Product Name Left Aligned
        ('ALIGN', (3, 1), (-1, -1), 'RIGHT'), # Prices Right Aligned
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10), # Smaller font header
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('FONTSIZE', (0, 1), (-1, -1), 9), # Smaller font body
        ('TOPPADDING', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
    ]))
    
    elements.append(products_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Totals
    # Use accumulated values
    final_net_total = total_net_accumulated
    final_iva = total_iva_accumulated
    final_additional = total_additional_accumulated
    total_final = total_final_accumulated
    
    totals_data = [
        ['', '', 'Neto:', f'{currency_symbol} {final_net_total:,.2f}'],
    ]
    
    if final_additional > 0:
        totals_data.append(['', '', 'Imp. Adicionales:', f'{currency_symbol} {final_additional:,.2f}'])
        
    totals_data.append(['', '', 'IVA (19%):', f'{currency_symbol} {final_iva:,.2f}'])
    totals_data.append(['', '', 'TOTAL:', f'{currency_symbol} {total_final:,.2f}'])
    
    totals_table = Table(totals_data, colWidths=[3*inch, 1*inch, 1.25*inch, 1.25*inch])
    totals_table.setStyle(TableStyle([
        ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, -1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (2, -1), (-1, -1), 14),
        ('TEXTCOLOR', (2, -1), (-1, -1), colors.HexColor('#646cff')),
        ('LINEABOVE', (2, -1), (-1, -1), 2, colors.HexColor('#646cff')),
        ('TOPPADDING', (2, -1), (-1, -1), 12),
    ]))
    
    elements.append(totals_table)
    
    # Footer note
    elements.append(Spacer(1, 0.5*inch))
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.grey,
        alignment=TA_CENTER
    )
    footer = Paragraph("Gracias por su preferencia", footer_style)
    elements.append(footer)
    
    # Build PDF
    doc.build(elements)
    
    # Get the value of the BytesIO buffer
    pdf = buffer.getvalue()
    buffer.close()
    
    return pdf
