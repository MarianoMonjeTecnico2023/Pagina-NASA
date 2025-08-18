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

// ===== FUNCIONES NASA IMAGES =====

/**
 * Realiza una búsqueda personalizada en la NASA Image and Video Library
 */
async function performNASASearch() {
    const searchInput = document.getElementById('nasa-search-input');
    const query = searchInput.value.trim();
    
    if (!query) {
        alert('Por favor, ingresa un término de búsqueda');
        return;
    }
    
    showLoading('nasa-images-loading');
    hideResults('nasa-images-results');
    
    try {
        const data = await makeRequest('/images', { q: query, limit: 15 });
        displayNASAImagesResults(data.data, query);
        showResults('nasa-images-results');
    } catch (error) {
        displayError('nasa-images-results', error.message);
    } finally {
        hideLoading('nasa-images-loading');
    }
}

/**
 * Búsqueda rápida desde los botones de sugerencias
 * @param {string} term - Término de búsqueda
 */
function quickSearch(term) {
    const searchInput = document.getElementById('nasa-search-input');
    searchInput.value = term;
    performNASASearch();
}

/**
 * Muestra los resultados de búsqueda de la NASA Image and Video Library
 * @param {Object} data - Datos de la búsqueda
 * @param {string} query - Término buscado
 */
function displayNASAImagesResults(data, query) {
    const container = document.getElementById('nasa-images-results');
    
    if (!data || !data.collection || !data.collection.items) {
        container.innerHTML = `
            <div class="result-item">
                <h3 class="result-title">Resultados de búsqueda: "${query}"</h3>
                <div class="error">
                    ❌ No se encontraron resultados para "${query}"
                </div>
                <p class="result-explanation">Intenta con otros términos como: Luna, Marte, galaxia, astronauta, satélite, etc.</p>
                <button class="btn btn-secondary btn-back" onclick="clearSearch()">
                    <i class="fas fa-arrow-left"></i> Nueva búsqueda
                </button>
            </div>
        `;
        return;
    }
    
    const items = data.collection.items;
    
    // Contar tipos de media
    const mediaTypes = items.reduce((acc, item) => {
        const mediaType = item.data?.[0]?.media_type || 'unknown';
        acc[mediaType] = (acc[mediaType] || 0) + 1;
        return acc;
    }, {});
    
    // Priorizar videos en la búsqueda
    const sortedItems = items.sort((a, b) => {
        const aType = a.data?.[0]?.media_type || 'image';
        const bType = b.data?.[0]?.media_type || 'image';
        
        // Videos primero, luego imágenes, luego audio
        const priority = { video: 3, image: 2, audio: 1 };
        return (priority[bType] || 0) - (priority[aType] || 0);
    });
    
    let content = `
        <div class="result-item">
            <h3 class="result-title">Resultados para: "${query}"</h3>
            <p class="result-explanation">Se encontraron ${items.length} resultados</p>
            
            <div style="margin: 1rem 0; display: flex; gap: 1rem; flex-wrap: wrap;">
                ${mediaTypes.video ? `
                    <span style="background: rgba(255, 107, 107, 0.1); padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.9rem;">
                        <i class="fas fa-video"></i> Videos: ${mediaTypes.video}
                    </span>
                ` : ''}
                ${mediaTypes.image ? `
                    <span style="background: rgba(0, 212, 255, 0.1); padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.9rem;">
                        <i class="fas fa-image"></i> Imágenes: ${mediaTypes.image}
                    </span>
                ` : ''}
                ${mediaTypes.audio ? `
                    <span style="background: rgba(255, 193, 7, 0.1); padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.9rem;">
                        <i class="fas fa-music"></i> Audio: ${mediaTypes.audio}
                    </span>
                ` : ''}
            </div>
            
            <button class="btn btn-secondary btn-back" onclick="clearSearch()" style="margin-bottom: 1rem;">
                <i class="fas fa-arrow-left"></i> Nueva búsqueda
            </button>
        </div>
    `;
    
    // Mostrar galería de resultados
    content += '<div class="gallery">';
    
    sortedItems.forEach(item => {
        const metadata = item.data?.[0];
        const nasaId = metadata?.nasa_id;
        const title = metadata?.title || 'Sin título';
        const description = metadata?.description || 'Sin descripción';
        const dateCreated = metadata?.date_created || 'Fecha no disponible';
        const mediaType = metadata?.media_type || 'image';
        
        // Obtener URL de imagen de vista previa
        const imageUrl = item.links?.find(link => link.render === 'image')?.href || 
                        item.links?.find(link => link.rel === 'preview')?.href ||
                        'https://via.placeholder.com/300x200?text=Sin+imagen';
        
        // Determinar icono y color según el tipo de media
        let mediaIcon, mediaColor, mediaLabel;
        switch (mediaType) {
            case 'video':
                mediaIcon = 'fas fa-video';
                mediaColor = '#ff6b6b';
                mediaLabel = 'VIDEO';
                break;
            case 'audio':
                mediaIcon = 'fas fa-music';
                mediaColor = '#ffc107';
                mediaLabel = 'AUDIO';
                break;
            default:
                mediaIcon = 'fas fa-image';
                mediaColor = '#00d4ff';
                mediaLabel = 'IMAGEN';
        }
        
        content += `
            <div class="gallery-item" style="position: relative;">
                <div style="position: absolute; top: 10px; right: 10px; background: ${mediaColor}; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: bold; z-index: 10;">
                    <i class="${mediaIcon}"></i> ${mediaLabel}
                </div>
                ${mediaType === 'video' ? `
                    <video class="gallery-image" style="object-fit: cover; height: 200px;" muted loop>
                        <source src="${imageUrl}" type="video/mp4">
                        <img src="${imageUrl}" alt="${title}" class="gallery-image">
                    </video>
                ` : `
                    <img src="${imageUrl}" alt="${title}" class="gallery-image">
                `}
                <div class="gallery-content">
                    <h4 class="gallery-title">${title}</h4>
                    <div class="gallery-date">${dateCreated}</div>
                    <p style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 0.5rem; line-height: 1.4;">
                        ${description.length > 100 ? description.substring(0, 100) + '...' : description}
                    </p>
                    <button onclick="loadNASAAssetDetails('${nasaId}')" class="btn btn-secondary" style="margin-top: 0.5rem; font-size: 0.8rem; padding: 0.3rem 0.6rem;">
                        <i class="fas fa-info-circle"></i> Ver detalles
                    </button>
                </div>
            </div>
        `;
    });
    
    content += '</div>';
    
    container.innerHTML = content;
}

/**
 * Limpia la búsqueda y muestra la interfaz inicial
 */
function clearSearch() {
    const searchInput = document.getElementById('nasa-search-input');
    const container = document.getElementById('nasa-images-results');
    
    searchInput.value = '';
    container.innerHTML = `
        <div class="result-item">
            <h3 class="result-title">Buscador de Contenido NASA</h3>
            <p class="result-explanation">Escribe cualquier término espacial en la barra de búsqueda para encontrar videos e imágenes de la NASA.</p>
            
            <div style="margin: 1rem 0; padding: 1rem; background: rgba(0, 212, 255, 0.1); border-radius: 8px;">
                <h4 style="color: var(--accent-color); margin-bottom: 0.5rem;">
                    <i class="fas fa-info-circle"></i> Cómo usar el buscador:
                </h4>
                <ul style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6;">
                    <li>• Escribe términos como "Luna", "Marte", "galaxia", "astronauta"</li>
                    <li>• El sistema detectará automáticamente videos disponibles</li>
                    <li>• Los videos aparecen primero en los resultados</li>
                    <li>• Haz clic en "Ver detalles" para reproducir o descargar</li>
                </ul>
            </div>
        </div>
    `;
}

/**
 * Carga los detalles completos de un asset de NASA (incluyendo URLs de video)
 * @param {string} nasaId - ID del asset de NASA
 */
async function loadNASAAssetDetails(nasaId) {
    try {
        const data = await makeRequest(`/images/asset/${nasaId}`);
        displayNASAAssetDetails(data.data, nasaId);
    } catch (error) {
        console.error('Error cargando detalles del asset:', error);
        const container = document.getElementById('nasa-images-results');
        container.innerHTML += `
            <div class="error">
                ❌ Error cargando detalles del asset: ${error.message}
            </div>
        `;
    }
}

/**
 * Muestra los detalles completos de un asset de NASA
 * @param {Object} data - Datos del asset
 * @param {string} nasaId - ID del asset
 */
function displayNASAAssetDetails(data, nasaId) {
    const container = document.getElementById('nasa-images-results');
    
    // Crear un modal o sección para mostrar los detalles
    const detailsSection = document.createElement('div');
    detailsSection.className = 'result-item';
    detailsSection.style.marginTop = '2rem';
    detailsSection.style.border = '2px solid var(--accent-color)';
    detailsSection.style.padding = '1.5rem';
    detailsSection.style.borderRadius = '12px';
    
    let content = `
        <h3 class="result-title">Detalles del Asset: ${nasaId}</h3>
        <button onclick="this.parentElement.parentElement.remove()" class="btn btn-secondary" style="float: right; margin-top: -2rem;">
            <i class="fas fa-times"></i> Cerrar
        </button>
    `;
    
    // Mostrar información básica si está disponible
    if (data.collection) {
        const item = data.collection.items?.[0];
        if (item) {
            const metadata = item.data?.[0];
            if (metadata) {
                content += `
                    <div style="margin: 1rem 0;">
                        <h4 style="color: var(--accent-color); margin-bottom: 0.5rem;">${metadata.title || 'Sin título'}</h4>
                        <p style="color: var(--text-secondary); margin-bottom: 1rem;">${metadata.description || 'Sin descripción'}</p>
                        <p style="color: var(--text-muted); font-size: 0.9rem;">
                            Fecha: ${metadata.date_created || 'No disponible'}<br>
                            Tipo: ${metadata.media_type || 'No disponible'}
                        </p>
                    </div>
                `;
            }
        }
    }
    
    // Mostrar enlaces de video/imagen
    if (data.collection?.items?.[0]?.href) {
        const href = data.collection.items[0].href;
        content += `
            <div style="margin: 1rem 0;">
                <h4 style="color: var(--accent-color); margin-bottom: 0.5rem;">Enlaces de Descarga:</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
        `;
        
        // Agregar enlaces para diferentes formatos
        const formats = [
            { name: 'Original', url: href },
            { name: 'MP4', url: href.replace(/\.\w+$/, '.mp4') },
            { name: 'MOV', url: href.replace(/\.\w+$/, '.mov') },
            { name: 'JPG', url: href.replace(/\.\w+$/, '.jpg') },
            { name: 'PNG', url: href.replace(/\.\w+$/, '.png') }
        ];
        
        formats.forEach(format => {
            content += `
                <a href="${format.url}" target="_blank" class="btn btn-secondary" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">
                    <i class="fas fa-download"></i> ${format.name}
                </a>
            `;
        });
        
        content += `
                </div>
            </div>
        `;
        
        // Si es un video, mostrar reproductor
        const item = data.collection?.items?.[0];
        const metadata = item?.data?.[0];
        if (metadata?.media_type === 'video') {
            content += `
                <div style="margin: 1rem 0;">
                    <h4 style="color: var(--accent-color); margin-bottom: 0.5rem;">Reproductor de Video:</h4>
                    <video controls style="width: 100%; max-width: 500px; border-radius: 8px;">
                        <source src="${href}" type="video/mp4">
                        Tu navegador no soporta el elemento de video.
                    </video>
                </div>
            `;
        } else if (metadata?.media_type === 'image') {
            content += `
                <div style="margin: 1rem 0;">
                    <h4 style="color: var(--accent-color); margin-bottom: 0.5rem;">Imagen:</h4>
                    <img src="${href}" alt="NASA Asset" style="width: 100%; max-width: 500px; border-radius: 8px;">
                </div>
            `;
        }
    }
    
    // Mostrar información adicional si está disponible
    if (data.collection?.items?.[0]?.links) {
        const links = data.collection.items[0].links;
        content += `
            <div style="margin: 1rem 0;">
                <h4 style="color: var(--accent-color); margin-bottom: 0.5rem;">Enlaces Adicionales:</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
        `;
        
        links.forEach(link => {
            content += `
                <a href="${link.href}" target="_blank" class="btn btn-secondary" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">
                    <i class="fas fa-external-link-alt"></i> ${link.rel || 'Enlace'}
                </a>
            `;
        });
        
        content += `
                </div>
            </div>
        `;
    }
    
    detailsSection.innerHTML = content;
    container.appendChild(detailsSection);
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
    
    // Verificar si hay sol_keys (días marcianos disponibles)
    if (!data.sol_keys || data.sol_keys.length === 0) {
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
    
    // Obtener el sol (día marciano) más reciente
    const latestSol = data.sol_keys[data.sol_keys.length - 1];
    const weatherData = data[latestSol];
    
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
    const temperature = weatherData.AT?.av || 'N/A';
    const windSpeed = weatherData.HWS?.av || 'N/A';
    const pressure = weatherData.PRE?.av || 'N/A';
    const sol = latestSol || 'N/A';
    
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
window.performNASASearch = performNASASearch;
window.quickSearch = quickSearch;
window.clearSearch = clearSearch;
window.loadNASAAssetDetails = loadNASAAssetDetails;
window.loadMarsWeather = loadMarsWeather;
window.loadEPICImages = loadEPICImages;
window.loadRoverPhotos = loadRoverPhotos;
window.loadGallery = loadGallery;
window.loadStats = loadStats;
window.loadAllData = loadAllData;
window.toggleAPODLanguage = toggleAPODLanguage;

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    // Agregar estilos CSS para la barra de búsqueda
    const style = document.createElement('style');
    style.textContent = `
        #nasa-search-input:focus {
            border-color: var(--accent-color);
            box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
        }
        
        #nasa-search-input::placeholder {
            color: var(--text-muted);
        }
        
        .search-suggestions {
            margin-top: 1rem;
        }
        
        .search-suggestions button {
            transition: all 0.3s ease;
        }
        
        .search-suggestions button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 212, 255, 0.3);
        }
        
        .video-priority {
            border: 2px solid #ff6b6b !important;
            box-shadow: 0 0 10px rgba(255, 107, 107, 0.3);
        }
    `;
    document.head.appendChild(style);
    
    // Inicializar la aplicación
    initApp();
});
