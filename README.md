# 🌌 NASA Space Explorer - Frontend

Una aplicación web moderna y responsiva para explorar datos espaciales de la NASA. Desarrollada con HTML5, CSS3 y JavaScript vanilla, conecta con la API de NASA a través de un backend robusto.

## ✨ Características

### 🎨 **Diseño Profesional**
- **Tema espacial** con gradientes y efectos visuales
- **Diseño responsivo** que se adapta a todos los dispositivos
- **Animaciones suaves** y transiciones elegantes
- **Iconografía espacial** con Font Awesome
- **Tipografía moderna** con Google Fonts (Orbitron, Roboto)

### 🚀 **Funcionalidades**
- **Imagen Astronómica del Día (APOD)** con traducción automática al español
- **Asteroides cercanos a la Tierra** con información detallada
- **Imágenes de la Tierra** desde el espacio
- **Clima en Marte** con datos del rover InSight
- **Imágenes EPIC** de la Tierra desde el satélite DSCOVR
- **Fotos de Rovers de Marte** (Curiosity, Opportunity, Spirit)

### 🌐 **Secciones Principales**
1. **Hero Section** - Banner principal con información de la API
2. **Imagen del Día** - APOD con descripción traducida
3. **Explorador de Asteroides** - Datos de asteroides cercanos
4. **Vista de la Tierra** - Imágenes satelitales
5. **Clima Marciano** - Condiciones meteorológicas en Marte
6. **Galería EPIC** - Imágenes de la Tierra desde el espacio
7. **Rovers de Marte** - Fotos de exploración marciana

## 📁 Estructura del Proyecto

```
Frontend-NASA/
├── index.html              # Página principal
├── css/
│   └── index.css          # Estilos principales
├── js/
│   └── index.js           # Lógica de la aplicación
├── assets/
│   └── (imágenes y recursos)
└── README.md              # Este archivo
```

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Estilos modernos y responsivos
- **JavaScript ES6+** - Lógica de la aplicación
- **Font Awesome** - Iconos espaciales
- **Google Fonts** - Tipografías (Orbitron, Roboto)

### APIs y Servicios
- **NASA API** - Datos espaciales oficiales
- **Google Translate** - Traducción automática
- **Backend Personalizado** - API REST con Node.js/Express

## 🚀 Instalación y Uso

### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio-frontend>
cd Frontend-NASA
```

### 2. Configurar el Backend
Asegúrate de que el backend esté funcionando en:
- **Desarrollo:** `http://localhost:3000`
- **Producción:** `https://server-nasa.onrender.com`

### 3. Abrir la Aplicación
```bash
# Opción 1: Servidor local simple
python -m http.server 8000

# Opción 2: Live Server (VS Code)
# Instalar extensión "Live Server" y hacer clic derecho en index.html

# Opción 3: Abrir directamente
# Hacer doble clic en index.html
```

### 4. Acceder a la Aplicación
- **Local:** `http://localhost:8000`
- **GitHub Pages:** `https://tu-usuario.github.io/tu-repositorio`

## 📱 Características Responsivas

### 📱 **Móvil (320px - 768px)**
- Navegación adaptativa
- Cards apiladas verticalmente
- Botones optimizados para touch
- Imágenes redimensionadas

### 💻 **Tablet (768px - 1024px)**
- Layout de 2 columnas
- Navegación horizontal
- Contenido optimizado

### 🖥️ **Desktop (1024px+)**
- Layout completo de 3 columnas
- Efectos hover avanzados
- Animaciones completas

## 🎯 Funcionalidades Destacadas

### 🌍 **Traducción Automática**
- Descripciones de APOD traducidas al español
- Botón para alternar entre idiomas
- Traducción inteligente con chunking para textos largos

### 📊 **Visualización de Datos**
- Cards informativas con datos estructurados
- Indicadores visuales de estado
- Manejo elegante de errores

### ⚡ **Optimización de Rendimiento**
- Lazy loading de imágenes
- Cache inteligente del backend
- Compresión de assets

## 🔧 Configuración

### Variables de Entorno (Backend)
```env
NASA_API_KEY=tu-api-key-de-nasa
NASA_API_BASE_URL=https://api.nasa.gov
CACHE_TTL=3600
NODE_ENV=production
FRONTEND_URL=https://tu-usuario.github.io/tu-repositorio
```

### URLs de la API
```javascript
// Desarrollo
const API_BASE_URL = 'http://localhost:3000/api/nasa';

// Producción
const API_BASE_URL = 'https://tu-backend.onrender.com/api/nasa';
```

## 📋 Endpoints Utilizados

| Endpoint | Descripción | Parámetros |
|----------|-------------|------------|
| `/apod` | Imagen del día | `date` (opcional) |
| `/asteroids` | Asteroides cercanos | `start_date`, `end_date` |
| `/earth` | Imágenes de la Tierra | `lat`, `lon` |
| `/mars` | Clima en Marte | - |
| `/epic` | Imágenes EPIC | `date` (opcional) |
| `/rover` | Fotos de rovers | `rover`, `sol` |

## 🎨 Personalización

### Colores del Tema
```css
:root {
  --primary-color: #1a1a2e;
  --secondary-color: #16213e;
  --accent-color: #0f3460;
  --text-color: #ffffff;
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}
```

### Fuentes
```css
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Roboto:wght@300;400;500;700&display=swap');
```

## 🐛 Troubleshooting

### Error "Failed to fetch"
- Verificar que el backend esté funcionando
- Comprobar la URL del backend en `index.js`
- Revisar configuración de CORS

### Imágenes no cargan
- Verificar conectividad a internet
- Comprobar que la API key de NASA sea válida
- Revisar logs del backend

### Traducción no funciona
- Verificar conectividad a Google Translate
- Comprobar que el backend tenga acceso a internet
- Revisar logs de traducción

## 📈 Próximas Mejoras

- [ ] **Modo oscuro/claro**
- [ ] **Favoritos y historial**
- [ ] **Notificaciones push**
- [ ] **PWA (Progressive Web App)**
- [ ] **Más idiomas**
- [ ] **Galería de imágenes**
- [ ] **Búsqueda avanzada**

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- **NASA** por proporcionar acceso gratuito a su API
- **Google Translate** por el servicio de traducción
- **Font Awesome** por los iconos espaciales
- **Google Fonts** por las tipografías
- **Comunidad open source** por las librerías utilizadas

## 📞 Contacto

- **Desarrollador:** [Mariano]
- **Email:** [ungranbum@gmail.com]
- **GitHub:** [@MarianoMonjeTecnico2023]

---

**Desarrollado con ❤️ para explorar el universo** 🌌

*"La exploración espacial es una de las mayores aventuras de la humanidad"* - NASA
