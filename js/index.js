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
 * Carga imágenes y videos de la NASA Image and Video Library
 */
async function loadNASAImages() {
    showLoading('earth-loading');
    hideResults('earth-results');

    // Mostrar selector de categorías
    const container = document.getElementById('earth-results');
    container.innerHTML = `
        <div class="result-item">
            <h3 class="result-title">Biblioteca de Imágenes y Videos de la NASA</h3>
            <p class="result-explanation">Selecciona una categoría para explorar imágenes y videos espaciales:</p>
            
            <div class="famous-places-grid">
                <button class="place-btn" onclick="loadNASAImagesByCategory('space')">
                    <i class="fas fa-rocket"></i>
                    <span>Exploración Espacial</span>
                    <small>Naves y misiones</small>
                </button>
                
                <button class="place-btn" onclick="loadNASAImagesByCategory('earth')">
                    <i class="fas fa-globe-americas"></i>
                    <span>Planeta Tierra</span>
                    <small>Vistas desde el espacio</small>
                </button>
                
                <button class="place-btn" onclick="loadNASAImagesByCategory('mars')">
                    <i class="fas fa-mars"></i>
                    <span>Planeta Marte</span>
                    <small>Exploración marciana</small>
                </button>
                
                <button class="place-btn" onclick="loadNASAImagesByCategory('galaxy')">
                    <i class="fas fa-galaxy"></i>
                    <span>Galaxias</span>
                    <small>Universo profundo</small>
                </button>
                
                <button class="place-btn" onclick="loadNASAImagesByCategory('nebula')">
                    <i class="fas fa-star"></i>
                    <span>Nebulosas</span>
                    <small>Nubes cósmicas</small>
                </button>
                
                <button class="place-btn" onclick="loadNASAImagesByCategory('astronaut')">
                    <i class="fas fa-user-astronaut"></i>
                    <span>Astronautas</span>
                    <small>Misiones tripuladas</small>
                </button>
                
                <button class="place-btn" onclick="loadNASAImagesByCategory('satellite')">
                    <i class="fas fa-satellite"></i>
                    <span>Satélites</span>
                    <small>Tecnología espacial</small>
                </button>
                
                <button class="place-btn" onclick="loadNASAImagesByCategory('telescope')">
                    <i class="fas fa-telescope"></i>
                    <span>Telescopios</span>
                    <small>Observación astronómica</small>
                </button>
            </div>
        </div>
    `;
    
    showResults('earth-results');
    hideLoading('earth-loading');
}

/**
 * Carga imágenes por categoría específica
 * @param {string} category - Categoría de búsqueda
 */
async function loadNASAImagesByCategory(category) {
    showLoading('earth-loading');
    hideResults('earth-results');

    try {
        const data = await makeRequest('/images', {
            q: category,
            limit: 12
        });
        
        displayNASAImagesResults(data.data, category);
        showResults('earth-results');
    } catch (error) {
        displayError('earth-results', error.message);
    } finally {
        hideLoading('earth-loading');
    }
}

/**
 * Muestra los resultados de imágenes de la NASA
 * @param {Object} data - Datos de la respuesta
 * @param {string} category - Categoría buscada
 */
function displayNASAImagesResults(data, category) {
    const container = document.getElementById('earth-results');
    
    if (!data || !data.collection || !data.collection.items || data.collection.items.length === 0) {
        container.innerHTML = `
            <div class="result-item">
                <h3 class="result-title">Biblioteca de Imágenes de la NASA</h3>
                <div class="error">
                    ❌ No se encontraron imágenes para la categoría "${category}"
                </div>
                <p class="result-explanation">Intenta con otra categoría o verifica la conexión.</p>
                <button class="btn btn-secondary btn-back" onclick="loadNASAImages()">
                    <i class="fas fa-arrow-left"></i> Volver a categorías
                </button>
            </div>
        `;
        return;
    }

    const items = data.collection.items;
    const totalHits = data.collection.metadata?.total_hits || 0;
    
    container.innerHTML = `
        <div class="result-item">
            <h3 class="result-title">Imágenes de ${category.charAt(0).toUpperCase() + category.slice(1)}</h3>
            <p class="result-explanation">Se encontraron ${totalHits} resultados. Mostrando ${items.length} imágenes:</p>
            
            <div class="gallery">
                ${items.map(item => {
                    const nasaId = item.data?.[0]?.nasa_id;
                    const title = item.data?.[0]?.title || 'Sin título';
                    const description = item.data?.[0]?.description || 'Sin descripción';
                    const dateCreated = item.data?.[0]?.date_created || 'Fecha no disponible';
                    const mediaType = item.data?.[0]?.media_type || 'image';
                    
                    // Obtener la URL de la imagen (usar el primer enlace disponible)
                    const links = item.links || [];
                    const imageLink = links.find(link => link.render === 'image') || links[0];
                    const imageUrl = imageLink?.href || '';
                    
                    return `
                        <div class="gallery-item">
                            ${imageUrl ? `<img src="${imageUrl}" alt="${title}" class="gallery-image" onerror="this.style.display='none'">` : ''}
                            <div class="gallery-content">
                                <h4 class="gallery-title">${title}</h4>
                                <div class="gallery-date">${dateCreated}</div>
                                <div style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 0.5rem;">
                                    ${mediaType === 'video' ? '🎥 Video' : '🖼️ Imagen'}
                                </div>
                                ${nasaId ? `<button class="btn btn-secondary" style="margin-top: 0.5rem; font-size: 0.7rem; padding: 0.2rem 0.5rem;" onclick="loadNASAAssetDetails('${nasaId}')">
                                    <i class="fas fa-info-circle"></i> Ver detalles
                                </button>` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            
            <button class="btn btn-secondary btn-back" onclick="loadNASAImages()">
                <i class="fas fa-arrow-left"></i> Ver otras categorías
            </button>
        </div>
    `;
}

/**
 * Carga captions de un asset específico de la NASA
 * @param {string} nasaId - ID del asset de la NASA
 */
async function loadNASAAssetDetails(nasaId) {
    showLoading('earth-loading');
    
    try {
        const data = await makeRequest(`/images/captions/${nasaId}`);
        displayNASAAssetDetails(data.data, nasaId);
    } catch (error) {
        displayError('earth-results', error.message);
    } finally {
        hideLoading('earth-loading');
    }
}

/**
 * Muestra los detalles de un asset específico
 * @param {Object} data - Datos del asset
 * @param {string} nasaId - ID del asset
 */
function displayNASAAssetDetails(data, nasaId) {
    const container = document.getElementById('earth-results');
    
    if (!data || !data.collection) {
        container.innerHTML = `
            <div class="result-item">
                <h3 class="result-title">Detalles del Asset</h3>
                <div class="error">
                    ❌ No se pudieron obtener los detalles del asset
                </div>
                <button class="btn btn-secondary btn-back" onclick="loadNASAImages()">
                    <i class="fas fa-arrow-left"></i> Volver a categorías
                </button>
            </div>
        `;
        return;
    }

    const items = data.collection.items || [];
    const asset = items[0];
    
    if (!asset) {
        container.innerHTML = `
            <div class="result-item">
                <h3 class="result-title">Detalles del Asset</h3>
                <div class="error">
                    ❌ Asset no encontrado
                </div>
                <button class="btn btn-secondary btn-back" onclick="loadNASAImages()">
                    <i class="fas fa-arrow-left"></i> Volver a categorías
                </button>
            </div>
        `;
        return;
    }

    const title = asset.data?.[0]?.title || 'Sin título';
    const description = asset.data?.[0]?.description || 'Sin descripción';
    const dateCreated = asset.data?.[0]?.date_created || 'Fecha no disponible';
    const keywords = asset.data?.[0]?.keywords || [];
    const mediaType = asset.data?.[0]?.media_type || 'image';
    
    // Obtener enlaces de diferentes tamaños
    const links = asset.links || [];
    const imageLinks = links.filter(link => link.render === 'image');
    const videoLinks = links.filter(link => link.render === 'video');
    
    container.innerHTML = `
        <div class="result-item">
            <h3 class="result-title">${title}</h3>
            <div class="result-date">${dateCreated}</div>
            <p class="result-explanation">${description}</p>
            
            ${imageLinks.length > 0 ? `
                <div style="margin: 1rem 0;">
                    <h4 style="color: var(--accent-color); margin-bottom: 0.5rem;">Imágenes disponibles:</h4>
                    <div class="gallery">
                        ${imageLinks.slice(0, 3).map(link => `
                            <div class="gallery-item">
                                <img src="${link.href}" alt="${title}" class="gallery-image">
                                <div class="gallery-content">
                                    <div class="gallery-title">${link.rel || 'Imagen'}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${videoLinks.length > 0 ? `
                <div style="margin: 1rem 0;">
                    <h4 style="color: var(--accent-color); margin-bottom: 0.5rem;">Videos disponibles:</h4>
                    <div class="gallery">
                        ${videoLinks.slice(0, 2).map(link => `
                            <div class="gallery-item">
                                <video controls class="gallery-image">
                                    <source src="${link.href}" type="video/mp4">
                                    Tu navegador no soporta videos.
                                </video>
                                <div class="gallery-content">
                                    <div class="gallery-title">${link.rel || 'Video'}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${keywords.length > 0 ? `
                <div style="margin: 1rem 0;">
                    <h4 style="color: var(--accent-color); margin-bottom: 0.5rem;">Palabras clave:</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                        ${keywords.slice(0, 10).map(keyword => `
                            <span style="background: rgba(0, 212, 255, 0.1); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem;">
                                ${keyword}
                            </span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <button class="btn btn-secondary btn-back" onclick="loadNASAImages()">
                <i class="fas fa-arrow-left"></i> Volver a categorías
            </button>
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
window.loadNASAImages = loadNASAImages;
window.loadNASAImagesByCategory = loadNASAImagesByCategory;
window.loadNASAAssetDetails = loadNASAAssetDetails;
window.loadMarsWeather = loadMarsWeather;
window.loadEPICImages = loadEPICImages;
window.loadRoverPhotos = loadRoverPhotos;
window.loadGallery = loadGallery;
window.loadStats = loadStats;
window.loadAllData = loadAllData;
window.toggleAPODLanguage = toggleAPODLanguage;

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', initApp);
