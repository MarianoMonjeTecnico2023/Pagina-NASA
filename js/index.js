/**
 * NASA Space Explorer - Frontend JavaScript
 * Maneja todas las interacciones con la API de NASA
 */

// ===== CONFIGURACIÓN =====
const API_BASE_URL = 'https://server-nasa.onrender.com/api/nasa';
let currentAPODLanguage = 'spanish'; // Variable global para controlar el idioma

// ===== FUNCIONES UTILITARIAS =====

/**
 * Muestra el indicador de carga
 * @param {string} id - ID del elemento de carga
 */
function showLoading(id) {
    document.getElementById(id).style.display = 'block';
}

/**
 * Oculta el indicador de carga
 * @param {string} id - ID del elemento de carga
 */
function hideLoading(id) {
    document.getElementById(id).style.display = 'none';
}

/**
 * Muestra la sección de resultados
 * @param {string} id - ID del elemento de resultados
 */
function showResults(id) {
    document.getElementById(id).style.display = 'block';
}

/**
 * Oculta la sección de resultados
 * @param {string} id - ID del elemento de resultados
 */
function hideResults(id) {
    document.getElementById(id).style.display = 'none';
}

/**
 * Muestra un mensaje de error
 * @param {string} containerId - ID del contenedor
 * @param {string} message - Mensaje de error
 */
function displayError(containerId, message) {
    const container = document.getElementById(containerId);
    container.innerHTML = `<div class="error">❌ ${message}</div>`;
    showResults(containerId);
}

/**
 * Muestra un mensaje de éxito
 * @param {string} containerId - ID del contenedor
 * @param {string} message - Mensaje de éxito
 */
function displaySuccess(containerId, message) {
    const container = document.getElementById(containerId);
    container.innerHTML = `<div class="success">✅ ${message}</div>`;
    showResults(containerId);
}

/**
 * Realiza una petición HTTP a la API
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} params - Parámetros de la petición
 * @returns {Promise} Respuesta de la API
 */
async function makeRequest(endpoint, params = {}) {
    try {
        const url = new URL(`${API_BASE_URL}${endpoint}`);
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== '') {
                url.searchParams.append(key, params[key]);
            }
        });

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
        }

        return data;
    } catch (error) {
        throw new Error(`Error en la petición: ${error.message}`);
    }
}

// ===== FUNCIONES APOD =====

/**
 * Carga la imagen del día (APOD)
 */
async function loadAPOD() {
    showLoading('apod-loading');
    hideResults('apod-results');

    try {
        const data = await makeRequest('/apod');
        displayAPODResult(data.data);
        showResults('apod-results');
    } catch (error) {
        displayError('apod-results', error.message);
    } finally {
        hideLoading('apod-loading');
    }
}

/**
 * Carga múltiples imágenes APOD
 */
async function loadMultipleAPOD() {
    showLoading('apod-loading');
    hideResults('apod-results');

    try {
        const data = await makeRequest('/apod/multiple', { count: 12 });
        displayMultipleAPODResults(data.data);
        showResults('apod-results');
    } catch (error) {
        displayError('apod-results', error.message);
    } finally {
        hideLoading('apod-loading');
    }
}

/**
 * Alterna entre idioma español e inglés para APOD
 */
function toggleAPODLanguage() {
    // Cambiar el idioma actual
    currentAPODLanguage = currentAPODLanguage === 'spanish' ? 'english' : 'spanish';
    
    // Recargar la imagen del día con el nuevo idioma
    loadAPOD();
}

/**
 * Muestra el resultado de una imagen APOD
 * @param {Object} apod - Datos de la imagen APOD
 */
function displayAPODResult(apod) {
    const container = document.getElementById('apod-results');
    const mediaElement = apod.media_type === 'video' 
        ? `<video class="result-video" controls><source src="${apod.url}" type="video/mp4"></video>`
        : `<img src="${apod.url}" alt="${apod.title}" class="result-image">`;

    // Determinar qué idioma mostrar basado en el estado global
    const showSpanish = currentAPODLanguage === 'spanish' && apod.explanation_es && apod.title_es;
    const title = showSpanish ? apod.title_es : apod.title;
    const explanation = showSpanish ? apod.explanation_es : apod.explanation;
    const buttonText = showSpanish ? 'Ver en Inglés' : 'Ver en Español';

    container.innerHTML = `
        <div class="result-item">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 class="result-title">${title}</h3>
                ${apod.explanation_es && apod.title_es ? `
                    <button onclick="toggleAPODLanguage()" class="btn btn-secondary" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">
                        <i class="fas fa-language"></i> ${buttonText}
                    </button>
                ` : ''}
            </div>
            <div class="result-date">${apod.date}</div>
            <p class="result-explanation">${explanation}</p>
            ${mediaElement}
            ${apod.copyright ? `<p style="color: var(--text-muted); font-size: 0.9rem;">© ${apod.copyright}</p>` : ''}
        </div>
    `;
}

/**
 * Muestra múltiples resultados APOD en galería
 * @param {Array} apods - Array de imágenes APOD
 */
function displayMultipleAPODResults(apods) {
    const container = document.getElementById('apod-results');
    container.innerHTML = `
        <div class="gallery">
            ${apods.map(apod => `
                <div class="gallery-item">
                    <img src="${apod.url}" alt="${apod.title}" class="gallery-image">
                    <div class="gallery-content">
                        <h4 class="gallery-title">${apod.title}</h4>
                        <div class="gallery-date">${apod.date}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ===== FUNCIONES ASTEROIDES =====

/**
 * Carga información de asteroides cercanos
 */
async function loadAsteroids() {
    showLoading('asteroids-loading');
    hideResults('asteroids-results');

    try {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const data = await makeRequest('/asteroids', {
            start_date: startDate,
            end_date: endDate
        });
        displayAsteroidsResults(data.data);
        showResults('asteroids-results');
    } catch (error) {
        displayError('asteroids-results', error.message);
    } finally {
        hideLoading('asteroids-loading');
    }
}

/**
 * Muestra los resultados de asteroides
 * @param {Object} data - Datos de asteroides
 */
function displayAsteroidsResults(data) {
    const container = document.getElementById('asteroids-results');
    const asteroids = Object.values(data.near_earth_objects).flat();
    
    container.innerHTML = `
        <div class="stats">
            <div class="stat-item">
                <div class="stat-value">${asteroids.length}</div>
                <div class="stat-label">Asteroides Detectados</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${asteroids.filter(a => a.is_potentially_hazardous_asteroid).length}</div>
                <div class="stat-label">Potencialmente Peligrosos</div>
            </div>
        </div>
        <div class="gallery">
            ${asteroids.slice(0, 6).map(asteroid => `
                <div class="gallery-item">
                    <div class="gallery-content">
                        <h4 class="gallery-title">${asteroid.name}</h4>
                        <div class="gallery-date">Distancia: ${asteroid.close_approach_data[0]?.miss_distance?.kilometers} km</div>
                        <div style="color: ${asteroid.is_potentially_hazardous_asteroid ? '#ff6b6b' : '#51cf66'}; margin-top: 0.5rem;">
                            ${asteroid.is_potentially_hazardous_asteroid ? '⚠️ Potencialmente Peligroso' : '✅ Seguro'}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ===== FUNCIONES TIERRA =====

/**
 * Carga imágenes de la Tierra
 */
async function loadEarthImagery() {
    showLoading('earth-loading');
    hideResults('earth-results');

    try {
        const data = await makeRequest('/earth', {
            lat: 40.7128,
            lon: -74.0060
        });
        
        // Verificar si hay error en la respuesta del backend
        if (data.data && data.data.error) {
            displayError('earth-results', `${data.data.error}: ${data.data.message}`);
            return;
        }
        
        displayEarthResults(data);
        showResults('earth-results');
    } catch (error) {
        displayError('earth-results', error.message);
    } finally {
        hideLoading('earth-loading');
    }
}

/**
 * Muestra los resultados de imágenes de la Tierra
 * @param {Object} data - Datos de la imagen
 */
function displayEarthResults(data) {
    const container = document.getElementById('earth-results');
    
    // Verificar si data es válido
    if (!data || !data.data) {
        container.innerHTML = `
            <div class="result-item">
                <h3 class="result-title">Imagen de la Tierra</h3>
                <div class="error">
                    ❌ No se pudieron obtener datos de la imagen de la Tierra
                </div>
                <p class="result-explanation">La API de imágenes de la Tierra puede estar temporalmente no disponible.</p>
            </div>
        `;
        return;
    }
    
    const earthData = data.data;
    
    // Verificar si hay error en los datos
    if (earthData.error) {
        container.innerHTML = `
            <div class="result-item">
                <h3 class="result-title">Imagen de la Tierra</h3>
                <div class="error">
                    ❌ ${earthData.error}: ${earthData.message || 'Error desconocido'}
                </div>
                ${earthData.suggestion ? `<p class="result-explanation">${earthData.suggestion}</p>` : ''}
                <div style="background: rgba(0, 212, 255, 0.1); padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                    <h4 style="margin: 0 0 0.5rem 0; color: var(--accent-color);">💡 Información:</h4>
                    <p style="margin: 0; font-size: 0.9rem;">La API de imágenes de la Tierra de NASA está experimentando problemas técnicos. Esto es temporal y se resolverá pronto.</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Verificar si hay URL de imagen
    if (!earthData.url) {
        container.innerHTML = `
            <div class="result-item">
                <h3 class="result-title">Imagen de la Tierra</h3>
                <div class="error">
                    ❌ No se encontró imagen para las coordenadas especificadas
                </div>
                <p class="result-explanation">Intenta con otras coordenadas o fecha.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="result-item">
            <h3 class="result-title">Imagen de la Tierra</h3>
            <p class="result-explanation">Imagen satelital de Nueva York (40.7128, -74.0060)</p>
            <img src="${earthData.url}" alt="Earth from Space" class="result-image">
            <p style="color: var(--text-muted); font-size: 0.9rem;">
                Fecha: ${earthData.date || 'No disponible'}
                ${earthData.coordinates ? `<br>Coordenadas: ${earthData.coordinates.lat}, ${earthData.coordinates.lon}` : ''}
            </p>
        </div>
    `;
}

// ===== FUNCIONES MARTE =====

/**
 * Carga datos del clima de Marte
 */
async function loadMarsWeather() {
    showLoading('mars-loading');
    hideResults('mars-results');

    try {
        const data = await makeRequest('/mars');
        
        // Verificar si hay error en la respuesta del backend
        if (data.data && data.data.error) {
            displayError('mars-results', `${data.data.error}: ${data.data.message}`);
            return;
        }
        
        displayMarsResults(data.data);
        showResults('mars-results');
    } catch (error) {
        displayError('mars-results', error.message);
    } finally {
        hideLoading('mars-loading');
    }
}

/**
 * Muestra los resultados del clima de Marte
 * @param {Object} data - Datos del clima
 */
function displayMarsResults(data) {
    const container = document.getElementById('mars-results');
    
    // Verificar si data es válido
    if (!data) {
        container.innerHTML = `
            <div class="result-item">
                <h3 class="result-title">Clima en Marte</h3>
                <div class="error">
                    ❌ No se pudieron obtener datos del clima marciano
                </div>
                <p class="result-explanation">El rover InSight puede estar temporalmente fuera de servicio o los datos no están disponibles.</p>
            </div>
        `;
        return;
    }
    
    // Manejar diferentes estructuras de datos
    let weatherData = data;
    
    // Si data es un array, tomar el último elemento
    if (Array.isArray(data)) {
        if (data.length === 0) {
            container.innerHTML = `
                <div class="result-item">
                    <h3 class="result-title">Clima en Marte</h3>
                    <div class="error">
                        ❌ No hay datos recientes del clima marciano
                    </div>
                    <p class="result-explanation">No se encontraron datos recientes del rover InSight.</p>
                </div>
            `;
            return;
        }
        weatherData = data[data.length - 1];
    }
    
    // Si data es un objeto con una propiedad que contiene el array
    if (data.data && Array.isArray(data.data)) {
        if (data.data.length === 0) {
            container.innerHTML = `
                <div class="result-item">
                    <h3 class="result-title">Clima en Marte</h3>
                    <div class="error">
                        ❌ No hay datos recientes del clima marciano
                    </div>
                    <p class="result-explanation">No se encontraron datos recientes del rover InSight.</p>
                </div>
            `;
            return;
        }
        weatherData = data.data[data.data.length - 1];
    }
    
    // Verificar si weatherData es válido
    if (!weatherData) {
        container.innerHTML = `
            <div class="result-item">
                <h3 class="result-title">Clima en Marte</h3>
                <div class="error">
                    ❌ Datos del clima marciano no disponibles
                </div>
                <p class="result-explanation">No se encontraron datos recientes del rover InSight.</p>
            </div>
        `;
        return;
    }
    
    // Extraer datos de manera segura
    const temperature = weatherData.AT?.av || weatherData.AT?.mn || weatherData.AT || 'N/A';
    const windSpeed = weatherData.HWS?.av || weatherData.HWS?.mn || weatherData.HWS || 'N/A';
    const pressure = weatherData.PRE?.av || weatherData.PRE?.mn || weatherData.PRE || 'N/A';
    const sol = weatherData.sol || 'N/A';
    
    container.innerHTML = `
        <div class="result-item">
            <h3 class="result-title">Clima en Marte</h3>
            <div class="stats">
                <div class="stat-item">
                    <div class="stat-value">${temperature}${temperature !== 'N/A' ? '°C' : ''}</div>
                    <div class="stat-label">Temperatura Promedio</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${windSpeed}${windSpeed !== 'N/A' ? ' m/s' : ''}</div>
                    <div class="stat-label">Velocidad del Viento</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${pressure}${pressure !== 'N/A' ? ' Pa' : ''}</div>
                    <div class="stat-label">Presión Atmosférica</div>
                </div>
            </div>
            <p class="result-explanation">Datos del rover InSight en Marte - Sol ${sol}</p>
            ${weatherData.First_UTC ? `<p style="color: var(--text-muted); font-size: 0.9rem;">Última actualización: ${weatherData.First_UTC}</p>` : ''}
        </div>
    `;
}

// ===== FUNCIONES EPIC =====

/**
 * Carga imágenes EPIC
 */
async function loadEPICImages() {
    showLoading('epic-loading');
    hideResults('epic-results');

    try {
        const data = await makeRequest('/epic');
        displayEPICResults(data.data);
        showResults('epic-results');
    } catch (error) {
        displayError('epic-results', error.message);
    } finally {
        hideLoading('epic-loading');
    }
}

/**
 * Muestra los resultados de imágenes EPIC
 * @param {Array} epicData - Datos de imágenes EPIC
 */
function displayEPICResults(epicData) {
    const container = document.getElementById('epic-results');
    container.innerHTML = `
        <div class="gallery">
            ${epicData.slice(0, 6).map(epic => `
                <div class="gallery-item">
                    <img src="https://epic.gsfc.nasa.gov/archive/natural/${epic.date.split(' ')[0].split('-').join('/')}/png/${epic.image}.png" 
                         alt="EPIC ${epic.date}" class="gallery-image">
                    <div class="gallery-content">
                        <h4 class="gallery-title">EPIC ${epic.date}</h4>
                        <div class="gallery-date">Satélite DSCOVR</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ===== FUNCIONES ROVER =====

/**
 * Carga fotos de rovers de Marte
 */
async function loadRoverPhotos() {
    showLoading('rover-loading');
    hideResults('rover-results');

    try {
        const data = await makeRequest('/rover', {
            rover: 'curiosity',
            sol: 1000
        });
        displayRoverResults(data.data);
        showResults('rover-results');
    } catch (error) {
        displayError('rover-results', error.message);
    } finally {
        hideLoading('rover-loading');
    }
}

/**
 * Muestra los resultados de fotos de rovers
 * @param {Object} data - Datos de fotos de rovers
 */
function displayRoverResults(data) {
    const container = document.getElementById('rover-results');
    container.innerHTML = `
        <div class="gallery">
            ${data.photos.slice(0, 6).map(photo => `
                <div class="gallery-item">
                    <img src="${photo.img_src}" alt="Rover ${photo.rover.name}" class="gallery-image">
                    <div class="gallery-content">
                        <h4 class="gallery-title">${photo.rover.name}</h4>
                        <div class="gallery-date">Sol ${photo.sol} - ${photo.camera.name}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ===== FUNCIONES GALERÍA =====

/**
 * Carga la galería espacial
 */
async function loadGallery() {
    showLoading('gallery-loading');
    hideResults('gallery-results');

    try {
        const data = await makeRequest('/apod/multiple', { count: 20 });
        displayGalleryResults(data.data);
        showResults('gallery-results');
    } catch (error) {
        displayError('gallery-results', error.message);
    } finally {
        hideLoading('gallery-loading');
    }
}

/**
 * Muestra los resultados de la galería
 * @param {Array} apods - Array de imágenes APOD
 */
function displayGalleryResults(apods) {
    const container = document.getElementById('gallery-results');
    container.innerHTML = `
        <div class="gallery">
            ${apods.map(apod => `
                <div class="gallery-item">
                    <img src="${apod.url}" alt="${apod.title}" class="gallery-image">
                    <div class="gallery-content">
                        <h4 class="gallery-title">${apod.title}</h4>
                        <div class="gallery-date">${apod.date}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ===== FUNCIONES ESTADÍSTICAS =====

/**
 * Carga estadísticas del sistema
 */
async function loadStats() {
    showLoading('stats-loading');
    hideResults('stats-results');

    try {
        const data = await makeRequest('/cache/stats');
        displayStatsResults(data.data);
        showResults('stats-results');
    } catch (error) {
        displayError('stats-results', error.message);
    } finally {
        hideLoading('stats-loading');
    }
}

/**
 * Muestra los resultados de estadísticas
 * @param {Object} stats - Datos de estadísticas
 */
function displayStatsResults(stats) {
    const container = document.getElementById('stats-results');
    const hitRate = ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(1);
    
    container.innerHTML = `
        <div class="stat-item">
            <div class="stat-value">${stats.keys}</div>
            <div class="stat-label">Elementos en Cache</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${stats.hits}</div>
            <div class="stat-label">Hits</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${stats.misses}</div>
            <div class="stat-label">Misses</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${hitRate}%</div>
            <div class="stat-label">Hit Rate</div>
        </div>
    `;
}

// ===== FUNCIÓN PRINCIPAL =====

/**
 * Carga todos los datos espaciales
 */
async function loadAllData() {
    await Promise.all([
        loadAPOD(),
        loadAsteroids(),
        loadMarsWeather(),
        loadEPICImages(),
        loadRoverPhotos()
    ]);
}

// ===== EVENT LISTENERS =====

/**
 * Configura la navegación suave
 */
function setupSmoothNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

/**
 * Inicializa la aplicación
 */
function initApp() {
    setupSmoothNavigation();
    loadAPOD(); // Carga APOD automáticamente al iniciar
}

// ===== EXPORTACIÓN DE FUNCIONES =====
// Hace las funciones disponibles globalmente para el HTML
window.loadAPOD = loadAPOD;
window.loadMultipleAPOD = loadMultipleAPOD;
window.loadAsteroids = loadAsteroids;
window.loadEarthImagery = loadEarthImagery;
window.loadMarsWeather = loadMarsWeather;
window.loadEPICImages = loadEPICImages;
window.loadRoverPhotos = loadRoverPhotos;
window.loadGallery = loadGallery;
window.loadStats = loadStats;
window.loadAllData = loadAllData;
window.toggleAPODLanguage = toggleAPODLanguage;

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', initApp);
