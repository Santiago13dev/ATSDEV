# 🔍 Detector de Formato ATS

Un MVP (Minimum Viable Product) para detectar si una hoja de vida cumple con los requisitos de formato ATS (Applicant Tracking System).

## 🎯 Características

- **Análisis automático** de CVs en formato PDF y DOCX
- **Puntuación detallada** basada en criterios ATS reales
- **Recomendaciones específicas** para mejorar la compatibilidad
- **Interfaz intuitiva** con drag & drop
- **Privacidad total** - todo el procesamiento se hace en el navegador

## 📊 Criterios de evaluación

El sistema evalúa 7 aspectos clave:

1. **Formato de archivo** (15%) - PDF o DOCX compatible
2. **Información de contacto** (20%) - Email y teléfono claramente identificables
3. **Estructura y secciones** (20%) - Secciones claras como Experiencia, Educación, Habilidades
4. **Palabras clave** (15%) - Términos profesionales relevantes
5. **Formato de fechas** (10%) - Fechas en formato estándar
6. **Elementos problemáticos** (10%) - Sin tablas complejas, gráficos o imágenes
7. **Longitud del texto** (10%) - Entre 300-800 palabras óptimo

## 🚀 Cómo usar

1. Abre `index.html` en tu navegador
2. Arrastra tu CV o haz clic para seleccionarlo
3. Espera el análisis automático
4. Revisa tu puntuación y recomendaciones
5. Aplica las mejoras sugeridas

## 🛠️ Tecnologías utilizadas

- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Procesamiento PDF**: PDF.js
- **Procesamiento DOCX**: Mammoth.js
- **Sin backend**: Todo funciona en el navegador

## 📁 Estructura del proyecto

```
ATSDEV/
├── index.html          # Página principal
├── style.css           # Estilos y diseño
├── script.js           # Lógica de análisis ATS
└── README.md           # Documentación
```

## 🔧 Instalación y desarrollo

```bash
# Clonar el repositorio
git clone https://github.com/Santiago13dev/ATSDEV.git

# Entrar al directorio
cd ATSDEV

# Abrir en navegador (no requiere servidor)
open index.html
```

## 🎨 Características del diseño

- **Responsive design** - Funciona en móviles y desktop
- **Drag & drop** - Interfaz intuitiva para subir archivos
- **Animaciones suaves** - Experiencia de usuario pulida
- **Score visual** - Círculo de progreso animado
- **Feedback detallado** - Análisis paso a paso con iconos

## 🔒 Privacidad

- **100% privado** - Los archivos no se suben a ningún servidor
- **Procesamiento local** - Todo el análisis se hace en tu navegador
- **Sin almacenamiento** - No guardamos ningún dato

## 📈 Próximas mejoras

- [ ] Análisis de palabras clave por industria
- [ ] Exportar reporte de resultados
- [ ] Comparación con ofertas de trabajo específicas
- [ ] Soporte para más formatos (RTF, TXT)
- [ ] Análisis de densidad de palabras clave
- [ ] Integración con APIs de empleos

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una branch para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**Santiago13dev**
- GitHub: [@Santiago13dev](https://github.com/Santiago13dev)

---

⭐ **¡Dale una estrella si este proyecto te ayudó!**