// UI overrides to normalize texts and accents
// These functions override earlier declarations in js/index.js

function displayError(containerId, message) {
  const container = document.getElementById(containerId);
  container.innerHTML = `<div class="error">⚠️ ${message}</div>`;
  showResults(containerId);
}

function displaySuccess(containerId, message) {
  const container = document.getElementById(containerId);
  container.innerHTML = `<div class="success">✅ ${message}</div>`;
  showResults(containerId);
}

function displayAPODResult(apod) {
  const container = document.getElementById('apod-results');
  const mediaElement = apod.media_type === 'video'
    ? `<video class="result-video" controls><source src="${apod.url}" type="video/mp4"></video>`
    : `<img src="${apod.url}" alt="${apod.title}" class="result-image">`;

  // Determina qué idioma mostrar basado en el estado global
  const showSpanish = (typeof currentAPODLanguage !== 'undefined') && currentAPODLanguage === 'spanish' && apod.explanation_es && apod.title_es;
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

