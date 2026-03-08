import sys
import os
from fpdf import FPDF
from fpdf.enums import XPos, YPos

# Definir colores de la marca
COLOR_DARK_BG = (10, 15, 30)       # #0A0F1E
COLOR_ELECTRIC_BLUE = (0, 229, 255) # #00E5FF
COLOR_NEON_GREEN = (57, 255, 20)    # #39FF14
COLOR_WHITE = (255, 255, 255)
COLOR_TEXT_MAIN = (220, 220, 220)
COLOR_TEXT_MUTED = (140, 140, 155)
COLOR_CARD_BG = (19, 28, 49)       # #131c31
COLOR_BORDER = (40, 55, 85)

class AdvancedPDF(FPDF):
    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=15)
        self.font_sans = "helvetica"
        self.font_mono = "courier"

    def set_bg(self):
        """Pinta el fondo oscuro en toda la página"""
        self.set_fill_color(*COLOR_DARK_BG)
        self.rect(0, 0, 210, 297, "F")

    def page_border(self):
        """Dibuja un marco sutil alrededor de la página"""
        self.set_draw_color(*COLOR_BORDER)
        self.set_line_width(0.3)
        self.rect(5, 5, 200, 287, "D")
        
        # Esquinas decorativas Accent
        self.set_draw_color(*COLOR_ELECTRIC_BLUE)
        self.set_line_width(1)
        # Top Left
        self.line(5, 5, 15, 5)
        self.line(5, 5, 5, 15)
        # Top Right
        self.line(195, 5, 205, 5)
        self.line(205, 5, 205, 15)
        # Bottom Left
        self.line(5, 292, 15, 292)
        self.line(5, 282, 5, 292)
        # Bottom Right
        self.line(195, 292, 205, 292)
        self.line(205, 282, 205, 292)

    def header(self):
        if self.page_no() > 1:
            self.set_bg()
            self.page_border()
            
            # Header text
            self.set_font(self.font_mono, "B", 8)
            self.set_text_color(*COLOR_ELECTRIC_BLUE)
            self.set_xy(10, 10)
            self.cell(100, 5, "PSMILE PERFORMANCE // DOCUMENTO TÉCNICO", 0, 0, "L")
            
            self.set_text_color(*COLOR_NEON_GREEN)
            self.set_xy(100, 10)
            self.cell(100, 5, "VOL. 02", 0, 0, "R")
            self.set_y(25) # Start content after header

    def footer(self):
        if self.page_no() > 1:
            self.set_y(-20)
            self.set_font(self.font_sans, "I", 8)
            self.set_text_color(*COLOR_TEXT_MUTED)
            self.cell(0, 10, f"PÁGINA {self.page_no()}", 0, 0, "C")
            
            # Progress bar visual
            self.set_fill_color(*COLOR_BORDER)
            self.rect(80, 285, 50, 1, "F")
            progress = min(50 * (self.page_no() / 5), 50)
            self.set_fill_color(*COLOR_ELECTRIC_BLUE)
            self.rect(80, 285, progress, 1, "F")

def draw_rounded_rect(pdf, x, y, w, h, r, style=""):
    pdf.set_fill_color(*COLOR_CARD_BG)
    pdf.set_draw_color(*COLOR_BORDER)
    pdf.set_line_width(0.3)
    
    pdf.rect(x+r, y, w-2*r, h, "F")
    pdf.rect(x, y+r, w, h-2*r, "F")
    try:
        pdf.rect(x, y, w, h, style=style, round_corners=True, corner_radius=r)
    except:
        pdf.rect(x, y, w, h, style=style)

def create_advanced_pdf():
    pdf = AdvancedPDF()
    
    # ---------------------------------------------------------
    # PAGE 1: PORTADA CINEMATOGRÁFICA
    # ---------------------------------------------------------
    pdf.add_page()
    pdf.set_bg()
    pdf.page_border()
    
    # TOP BADGE
    pdf.set_y(35)
    pdf.set_font(pdf.font_mono, "", 10)
    pdf.set_text_color(*COLOR_ELECTRIC_BLUE)
    pdf.cell(0, 5, "[ DOCUMENTO CONFIDENCIAL ]", 0, 1, "C") # Use 0, 1 for consistent line breaks
    
    # TITLES
    pdf.ln(10)
    pdf.set_font(pdf.font_sans, "B", 16)
    pdf.set_text_color(*COLOR_WHITE)
    pdf.cell(0, 8, "NEURO-FÚTBOL VOL. 2", 0, 1, "C")
    
    pdf.set_font(pdf.font_sans, "B", 38)
    pdf.set_text_color(*COLOR_ELECTRIC_BLUE)
    pdf.cell(0, 16, "EL ANCLAJE DE", 0, 1, "C")
    pdf.set_text_color(*COLOR_NEON_GREEN)
    pdf.cell(0, 16, "CONFIANZA", 0, 1, "C")
    
    pdf.ln(8)
    pdf.set_font(pdf.font_sans, "", 12)
    pdf.set_text_color(*COLOR_TEXT_MAIN)
    pdf.multi_cell(0, 6, "Recuperación Instantánea Post-Error usando la ciencia\nde la Terapia Breve Centrada en Soluciones.", align="C")
    
    # MASTER IMAGE
    img_y = 120
    try:
        path_portada = r"public\images\portada_vol2.png"
        if not os.path.exists(path_portada):
             path_portada = r"d:\PS DEPORTIVA\EXCEL DE JUGADORES\psmile-landing\psmile-app\public\images\portada_vol2.png"
        
        draw_rounded_rect(pdf, 20, img_y, 170, 130, 5, "FD")
        pdf.image(path_portada, x=22, y=img_y+2, w=166, h=110)
        
        pdf.set_xy(25, img_y + 115)
        pdf.set_font(pdf.font_mono, "B", 8)
        pdf.set_text_color(*COLOR_NEON_GREEN)
        pdf.cell(80, 5, "SISTEMA NERVIOSO ESTABILIZADO", 0, 0, "L")
        
        pdf.set_xy(105, img_y + 115)
        pdf.set_font(pdf.font_mono, "", 8)
        pdf.set_text_color(*COLOR_TEXT_MUTED)
        pdf.cell(80, 5, "T/RECUPERACIÓN: 2.4s", 0, 1, "R")
        
    except Exception as e:
        pdf.set_xy(20, img_y)
        draw_rounded_rect(pdf, 20, img_y, 170, 130, 5, "FD")
        pdf.set_xy(20, img_y + 60)
        pdf.set_text_color(*COLOR_TEXT_MUTED)
        pdf.cell(170, 10, "[ Imagen Maestra: portada_vol2.png ]", 0, 1, "C")

    # ---------------------------------------------------------
    # PAGE 2: LA CIENCIA
    # ---------------------------------------------------------
    pdf.add_page()
    
    pdf.set_font(pdf.font_sans, "B", 30)
    pdf.set_text_color(*COLOR_ELECTRIC_BLUE)
    pdf.cell(15, 12, "01.", 0, 0, "L")
    pdf.set_text_color(*COLOR_WHITE)
    pdf.cell(0, 12, "La Ciencia del 'Reset'", 0, 1, "L")
    
    # Decorative subtle line
    y_line = pdf.get_y() + 2
    pdf.set_draw_color(*COLOR_BORDER)
    pdf.line(10, y_line, 80, y_line)
    pdf.ln(12)
    
    # Quote block
    quote_y = pdf.get_y()
    pdf.set_fill_color(*COLOR_CARD_BG)
    pdf.set_draw_color(*COLOR_ELECTRIC_BLUE)
    pdf.set_line_width(1)
    
    pdf.rect(15, quote_y, 180, 25, "F")
    pdf.line(15, quote_y, 15, quote_y+25) # Left accent border
    
    pdf.set_xy(20, quote_y + 5)
    pdf.set_font(pdf.font_sans, "I", 11)
    pdf.set_text_color(*COLOR_WHITE)
    pdf.multi_cell(165, 7, "\"Un anclaje en el fútbol funciona como un botón mental. Otorga una ventaja táctica invisible pero medible.\"", align="L")
    
    # Must wait for quote block to finish
    pdf.set_y(quote_y + 35)
    
    # Body text
    pdf.set_font(pdf.font_sans, "", 12)
    pdf.set_text_color(*COLOR_TEXT_MAIN)
    
    p1 = ("El cerebro asocia un estímulo físico (ancla) con un estado emocional "
          "de pico (confianza/calma) cultivado en sesión. La diferencia en la élite no es física, "
          "es neurobiológica.")
    pdf.multi_cell(0, 8, p1, align="L")
    pdf.ln(6)
    
    pdf.set_font(pdf.font_sans, "B", 12)
    pdf.set_text_color(*COLOR_ELECTRIC_BLUE)
    pdf.cell(0, 8, "No es magia; es condicionamiento operante.", 0, 1, "L")
    
    pdf.ln(6)
    pdf.set_font(pdf.font_sans, "", 12)
    pdf.set_text_color(*COLOR_TEXT_MAIN)
    p2 = ("El uso de anclajes permite a los atletas eludir el análisis consciente y disparar "
          "una respuesta fisiológica y emocional inmediata, crucial en un deporte donde "
          "las decisiones se toman en milisegundos tras someterse a presión extrema por un error previo.")
    pdf.multi_cell(0, 8, p2, align="L")
    
    # ---------------------------------------------------------
    # PAGE 3: PROTOCOLO 4 PASOS
    # ---------------------------------------------------------
    pdf.add_page()
    
    pdf.set_font(pdf.font_sans, "B", 30)
    pdf.set_text_color(*COLOR_NEON_GREEN)
    pdf.cell(15, 12, "02.", 0, 0, "L")
    pdf.set_text_color(*COLOR_WHITE)
    pdf.cell(0, 12, "Protocolo de Instalación", 0, 1, "L")
    
    y_line = pdf.get_y() + 2
    pdf.set_draw_color(*COLOR_BORDER)
    pdf.line(10, y_line, 80, y_line)
    pdf.ln(12)
    
    steps = [
        ("FASE 01", "Recuperación", "Identifica un momento de éxito total y recupéralo en tu mente con intensidad."),
        ("FASE 02", "Definición", "Elige un estímulo físico único (ej. tocar escudo, pulsera, dedo)."),
        ("FASE 03", "Condicionamiento", "Ejecuta el ancla justo en el pico de la emoción de éxito. Repetir x5."),
        ("FASE 04", "Uso en Campo", "Al fallar: Exhalación profunda + Palabra RESET + Activar Ancla.")
    ]
    
    y = pdf.get_y()
    for num, title, desc in steps:
        pdf.set_fill_color(*COLOR_CARD_BG)
        pdf.set_draw_color(*COLOR_BORDER)
        pdf.set_line_width(0.3)
        pdf.rect(15, y, 180, 25, "FD") # Block background
        
        # Left Accent line
        if "01" in num or "02" in num:
            pdf.set_draw_color(*COLOR_ELECTRIC_BLUE)
        else:
            pdf.set_draw_color(*COLOR_NEON_GREEN)
            
        pdf.set_line_width(1.5)
        pdf.line(15, y+5, 15, y+20)
        
        # Phase Text
        pdf.set_xy(20, y + 5)
        pdf.set_font(pdf.font_mono, "B", 8)
        if "01" in num or "02" in num:
            pdf.set_text_color(*COLOR_ELECTRIC_BLUE)
        else:
             pdf.set_text_color(*COLOR_NEON_GREEN)
        pdf.cell(30, 5, num, 0, 0, "L")
        
        # Title
        pdf.set_xy(20, y + 10)
        pdf.set_font(pdf.font_sans, "B", 14)
        pdf.set_text_color(*COLOR_WHITE)
        pdf.cell(55, 10, title, 0, 0, "L")
        
        # Description
        pdf.set_xy(75, y + 8)
        pdf.set_font(pdf.font_sans, "", 10)
        pdf.set_text_color(*COLOR_TEXT_MAIN)
        pdf.multi_cell(115, 5, desc, align="L")
        
        y += 35

    # ---------------------------------------------------------
    # PAGE 4: MATRIZ DE RUTINA
    # ---------------------------------------------------------
    pdf.add_page()
    
    pdf.set_font(pdf.font_sans, "B", 24)
    pdf.set_text_color(*COLOR_WHITE)
    pdf.cell(0, 10, "Matriz de Rutina Personalizada", 0, 1, "C")
    
    pdf.set_font(pdf.font_mono, "", 9)
    pdf.set_text_color(*COLOR_TEXT_MUTED)
    pdf.cell(0, 6, "// SELECCIONA TU SITUACIÓN DE CONFLICTO", 0, 1, "C")
    pdf.ln(10)
    
    # Table Header
    tb_y = pdf.get_y()
    pdf.set_fill_color(*COLOR_CARD_BG)
    pdf.rect(10, tb_y, 190, 12, "F")
    
    pdf.set_y(tb_y + 3)
    pdf.set_font(pdf.font_mono, "B", 9)
    pdf.set_text_color(*COLOR_ELECTRIC_BLUE)
    
    pdf.set_x(15)
    pdf.cell(65, 6, "SITUACIÓN (Crisis)", 0, 0)
    pdf.set_x(80)
    pdf.cell(45, 6, "ANCLA SUGERIDA", 0, 0)
    pdf.set_x(125)
    pdf.cell(70, 6, "PROTOCOLO TÉCNICO", 0, 1) # Use 1 to go to next line
    
    pdf.ln(5)
    
    matrix_data = [
        ("Fallo de pase crítico", "Tocar vendaje", "Respirar + Ancla + Buscar marca"),
        ("Antes de tiro libre/penal", "Apretar puño fuerte", "Visualizar arco + Ancla + Exhalar"),
        ("Tarjeta / Pitazo Injusto", "Agacharse, tocar césped", "Download físico + Foco Táctico"),
        ("Gol en contra", "Golpear pecho/escudo", "Reset verbal interno + Ancla")
    ]
    
    for i, (crisis, ancla, prot) in enumerate(matrix_data):
        y_row = pdf.get_y()
        
        # Alternate subtle background
        if i % 2 == 0:
            pdf.set_fill_color(14, 21, 38)
            pdf.rect(10, y_row, 190, 14, "F")
            
        pdf.set_y(y_row + 4)
        
        pdf.set_font(pdf.font_sans, "B", 10)
        pdf.set_text_color(*COLOR_WHITE)
        pdf.set_x(15)
        pdf.cell(65, 6, crisis, 0, 0)
        
        pdf.set_font(pdf.font_sans, "I", 10)
        pdf.set_text_color(*COLOR_NEON_GREEN)
        pdf.set_x(80)
        pdf.cell(45, 6, ancla, 0, 0)
        
        pdf.set_font(pdf.font_sans, "", 9)
        pdf.set_text_color(*COLOR_TEXT_MAIN)
        pdf.set_x(125)
        pdf.cell(70, 6, prot, 0, 1)
        
        pdf.ln(5)
        
        pdf.set_draw_color(*COLOR_BORDER)
        pdf.set_line_width(0.1)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())

    # ---------------------------------------------------------
    # PAGE 5: AUTORIDAD & CTA UI
    # ---------------------------------------------------------
    pdf.add_page()
    
    # Author Profile Box
    pdf.set_fill_color(*COLOR_CARD_BG)
    pdf.rect(15, 20, 180, 50, "F")
    
    try:
        path_luis = r"public\images\luis-oficina.jpg"
        if not os.path.exists(path_luis):
             path_luis = r"d:\PS DEPORTIVA\EXCEL DE JUGADORES\psmile-landing\psmile-app\public\images\luis-oficina.jpg"
        pdf.image(path_luis, x=20, y=25, w=40)
    except:
        pdf.set_xy(20, 25)
        pdf.set_draw_color(*COLOR_BORDER)
        pdf.cell(40, 40, "[Foto]", 1, 0, "C")
        
    pdf.set_xy(65, 25)
    pdf.set_font(pdf.font_sans, "B", 18)
    pdf.set_text_color(*COLOR_WHITE)
    pdf.cell(0, 10, "Luis Enrique Morales Ramirez", 0, 1)
    
    pdf.set_xy(65, 35)
    pdf.set_font(pdf.font_mono, "B", 8)
    pdf.set_text_color(*COLOR_ELECTRIC_BLUE)
    pdf.cell(0, 6, "LICENCIADO EN PSICOLOGÍA // ESPECIALISTA RENDIMIENTO", 0, 1)
    
    pdf.set_xy(65, 45)
    pdf.set_font(pdf.font_sans, "", 10)
    pdf.set_text_color(*COLOR_TEXT_MAIN)
    desc = "Fundador de PSMILE. Especialista en optimización de respuestas emocionales en atletas de alto rendimiento aplicando Neurociencias aplicadas."
    pdf.multi_cell(125, 5, desc)
    
    # Seals
    try:
        y_seal = 80
        seal_base = r"d:\PS DEPORTIVA\EXCEL DE JUGADORES\psmile-landing\psmile-app\public\images"
        pdf.image(os.path.join(seal_base, "Psicologia deportiva.jpeg"), x=30, y=y_seal, h=15)
        pdf.image(os.path.join(seal_base, "Neurociencias.jpeg"), x=80, y=y_seal, h=15)
        pdf.image(os.path.join(seal_base, "Mentalidad ganadora.jpeg"), x=130, y=y_seal, h=15)
    except:
        pass
        
    # Modern UI Button / CTA Layout
    pdf.set_y(130)
    
    pdf.set_font(pdf.font_mono, "", 10)
    pdf.set_text_color(*COLOR_NEON_GREEN)
    pdf.cell(0, 6, "=== OFERTA PILOTO EXCLUSIVA ===", 0, 1, "C")
    
    pdf.ln(5)
    pdf.set_font(pdf.font_sans, "B", 26)
    pdf.set_text_color(*COLOR_WHITE)
    pdf.cell(0, 10, "DIAGNÓSTICO DE ÉLITE", 0, 1, "C")
    
    pdf.ln(5)
    pdf.set_font(pdf.font_sans, "", 12)
    pdf.set_text_color(*COLOR_TEXT_MAIN)
    pdf.multi_cell(0, 6, "Obtén tu Rutina de Anclaje Personalizada con Luis.\nDiseño de ancla según perfil cognitivo individual.", align="C")
    
    pdf.ln(10)
    
    btn_y = pdf.get_y()
    btn_w = 120
    btn_x = (210 - btn_w) / 2
    
    # Shadow
    pdf.set_fill_color(0, 100, 120) 
    pdf.rect(btn_x, btn_y+2, btn_w, 20, "F")
    
    # Button Surface
    pdf.set_fill_color(*COLOR_ELECTRIC_BLUE)
    pdf.rect(btn_x, btn_y, btn_w, 20, "F")
    
    # Button Text
    pdf.set_xy(btn_x, btn_y + 5)
    pdf.set_font(pdf.font_sans, "B", 14)
    pdf.set_text_color(*COLOR_DARK_BG)
    pdf.cell(btn_w, 10, "QUIERO MI RUTINA ($12.990CLP)", 0, 1, "C")
    
    # Urgency text
    pdf.set_xy(10, btn_y + 30)
    pdf.set_font(pdf.font_mono, "B", 10)
    pdf.set_text_color(255, 100, 100) # Warning Red
    pdf.cell(0, 6, "[!] Solo 8 de 50 cupos disponibles", 0, 1, "C")

    # OUTPUT
    output_path = r"d:\PS DEPORTIVA\EXCEL DE JUGADORES\psmile-landing\psmile-app\Neuro-Futbol_Vol2_Anclaje-de-Confianza.pdf"
    pdf.output(output_path)
    return output_path

if __name__ == "__main__":
    out = create_advanced_pdf()
    print(f"Mejora completada! PDF generado en: {out}")
