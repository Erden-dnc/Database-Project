document.addEventListener('DOMContentLoaded', async () => {
    await loadUniversiteler();
    await loadAllTezler();
});

async function loadUniversiteler() {
    try {
        const universiteler = await UniversiteAPI.getAll();
        const select = document.getElementById('search-universite');
        universiteler.forEach(universite => {
            const option = document.createElement('option');
            option.value = universite.universite_id;
            option.textContent = universite.universite_adi;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Üniversiteler yüklenemedi:', error);
    }
}

async function loadAllTezler() {
    try {
        const tezler = await TezAPI.getAll();
        displayTezler(tezler);
    } catch (error) {
        document.getElementById('tezler-listesi').innerHTML = 
            '<div class="alert alert-error">Error loading theses.</div>';
    }
}

async function searchTezler(event) {
    event.preventDefault();
    
    const filters = {
        baslik: document.getElementById('search-baslik').value,
        yazar: document.getElementById('search-yazar').value,
        yil: document.getElementById('search-yil').value,
        tur: document.getElementById('search-tur').value,
        universite: document.getElementById('search-universite').value,
        dil: document.getElementById('search-dil').value
    };
    
    try {
        const tezler = await TezAPI.search(filters);
        displayTezler(tezler);
    } catch (error) {
        document.getElementById('tezler-listesi').innerHTML = 
            '<div class="alert alert-error">Error during search: ' + error.message + '</div>';
    }
}

function displayTezler(tezler) {
    const container = document.getElementById('tezler-listesi');
    const count = document.getElementById('results-count');
    
    count.textContent = `(${tezler.length} sonuç)`;
    
    if (tezler.length === 0) {
        container.innerHTML = '<div class="loading">No theses found matching your search criteria.</div>';
        return;
    }
    
    container.innerHTML = tezler.map(tez => `
        <div class="tez-card" onclick="window.location.href='tez-detay.html?id=${tez.tez_id}'">
            <h4>${escapeHtml(tez.başlık)}</h4>
            <p style="color: var(--text-secondary); margin: 0.5rem 0; font-size: 0.875rem;">
                ${tez.özet ? escapeHtml(tez.özet.substring(0, 150)) + '...' : 'No abstract available'}
            </p>
            <div class="tez-meta">
                <span>${escapeHtml(tez.yazar_adi)}</span>
                <span>${tez.yıl}</span>
                <span class="badge badge-primary">${escapeHtml(tez.tür)}</span>
                <span>${escapeHtml(tez.universite_adi)}</span>
                <span>${escapeHtml(tez.dil)}</span>
            </div>
        </div>
    `).join('');
}

function clearSearch() {
    document.getElementById('search-form').reset();
    loadAllTezler();
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

