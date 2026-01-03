document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const tezId = urlParams.get('id');
    
    if (!tezId) {
        document.getElementById('tez-detay-container').innerHTML = 
            '<div class="alert alert-error">Thesis ID not found.</div>';
        return;
    }
    
    await loadTezDetay(tezId);
});

async function loadTezDetay(id) {
    try {
        const tez = await TezAPI.getById(id);
        displayTezDetay(tez);
    } catch (error) {
        document.getElementById('tez-detay-container').innerHTML = 
            '<div class="alert alert-error">Error loading thesis: ' + error.message + '</div>';
    }
}

function displayTezDetay(tez) {
    if (!tez || !tez.tez_id) {
        document.getElementById('tez-detay-container').innerHTML = 
            '<div class="alert alert-error">Thesis not found.</div>';
        return;
    }
    
    const container = document.getElementById('tez-detay-container');
    
    const birincilDanışman = tez.danışmanlar?.find(d => d.rol === 'Primary');
    const ikincilDanışmanlar = tez.danışmanlar?.filter(d => d.rol === 'Secondary') || [];
    
    container.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <a href="tez-ara.html" class="btn btn-secondary">Back</a>
        </div>
        
        <div style="margin-bottom: 2rem;">
            <h1 style="color: var(--primary-color); margin-bottom: 1rem;">${escapeHtml(tez.başlık)}</h1>
            <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
                <span class="badge badge-primary">${escapeHtml(tez.tür)}</span>
                <span class="badge badge-success">${escapeHtml(tez.dil)}</span>
                <span>${tez.yıl}</span>
                <span>${tez.sayfa_sayısı || 'N/A'} pages</span>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 2rem;">
            <div>
                <h3 style="margin-bottom: 1rem; color: var(--text-primary);">Author Information</h3>
                <p><strong>Name:</strong> ${escapeHtml(tez.yazar_adi)}</p>
                ${tez.yazar_email ? `<p><strong>Email:</strong> ${escapeHtml(tez.yazar_email)}</p>` : ''}
            </div>
            
            <div>
                <h3 style="margin-bottom: 1rem; color: var(--text-primary);">Institution Information</h3>
                <p><strong>University:</strong> ${escapeHtml(tez.universite_adi)}</p>
                <p><strong>Institute:</strong> ${escapeHtml(tez.enstitü_adi)}</p>
            </div>
            
            <div>
                <h3 style="margin-bottom: 1rem; color: var(--text-primary);">Thesis Information</h3>
                <p><strong>Thesis Number:</strong> ${tez.tez_no}</p>
                <p><strong>Submission Date:</strong> ${formatDate(tez.teslim_tarihi)}</p>
            </div>
        </div>
        
        ${birincilDanışman ? `
        <div style="margin-bottom: 2rem;">
            <h3 style="margin-bottom: 1rem; color: var(--text-primary);">Advisors</h3>
            <p><strong>Primary Advisor:</strong> ${birincilDanışman.unvan || ''} ${escapeHtml(birincilDanışman.ad)} ${escapeHtml(birincilDanışman.soyad)}</p>
            ${ikincilDanışmanlar.length > 0 ? `
                <p><strong>Secondary Advisors:</strong></p>
                <ul>
                    ${ikincilDanışmanlar.map(d => `<li>${d.unvan || ''} ${escapeHtml(d.ad)} ${escapeHtml(d.soyad)}</li>`).join('')}
                </ul>
            ` : ''}
        </div>
        ` : ''}
        
        ${tez.özet ? `
        <div style="margin-bottom: 2rem;">
            <h3 style="margin-bottom: 1rem; color: var(--text-primary);">Abstract</h3>
            <p style="line-height: 1.8; color: var(--text-secondary);">${escapeHtml(tez.özet)}</p>
        </div>
        ` : ''}
        
        ${tez.konular && tez.konular.length > 0 ? `
        <div style="margin-bottom: 2rem;">
            <h3 style="margin-bottom: 1rem; color: var(--text-primary);">Topics</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                ${tez.konular.map(k => `<span class="badge badge-primary">${escapeHtml(k.konu_adi)}</span>`).join('')}
            </div>
        </div>
        ` : ''}
        
        ${tez.anahtar_kelimeler && tez.anahtar_kelimeler.length > 0 ? `
        <div style="margin-bottom: 2rem;">
            <h3 style="margin-bottom: 1rem; color: var(--text-primary);">Keywords</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                ${tez.anahtar_kelimeler.map(ak => `<span class="badge badge-success">${escapeHtml(ak.kelime)}</span>`).join('')}
            </div>
        </div>
        ` : ''}
    `;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
}

