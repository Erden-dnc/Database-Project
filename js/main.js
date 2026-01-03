// Ana Sayfa JavaScript
document.addEventListener('DOMContentLoaded', async () => {
    await loadDashboardStats();
    await loadRecentTezler();
});

async function loadDashboardStats() {
    try {
        const [tezler, yazarlar, universiteler, danışmanlar] = await Promise.all([
            TezAPI.getAll(),
            YazarAPI.getAll(),
            UniversiteAPI.getAll(),
            DanışmanAPI.getAll()
        ]);
        
        document.getElementById('tez-sayisi').textContent = tezler.length;
        document.getElementById('yazar-sayisi').textContent = yazarlar.length;
        document.getElementById('universite-sayisi').textContent = universiteler.length;
        document.getElementById('danisman-sayisi').textContent = danışmanlar.length;
    } catch (error) {
        console.error('İstatistikler yüklenemedi:', error);
    }
}

async function loadRecentTezler() {
    const container = document.getElementById('tezler-listesi');
    
    try {
        const tezler = await TezAPI.getAll();
        const recentTezler = tezler.slice(0, 6); // Son 6 tez
        
        if (recentTezler.length === 0) {
            container.innerHTML = '<div class="loading">No theses added yet.</div>';
            return;
        }
        
        container.innerHTML = recentTezler.map(tez => `
            <div class="tez-card" onclick="window.location.href='tez-detay.html?id=${tez.tez_id}'">
                <h4>${escapeHtml(tez.başlık)}</h4>
                <p class="tez-meta">
                    <span>${escapeHtml(tez.yazar_adi)}</span>
                    <span>${tez.yıl}</span>
                    <span>${escapeHtml(tez.tür)}</span>
                    <span>${escapeHtml(tez.universite_adi)}</span>
                </p>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<div class="alert alert-error">Error loading theses.</div>';
        console.error('Tezler yüklenemedi:', error);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

