document.addEventListener('DOMContentLoaded', async () => {
    await loadAllData();
});

async function loadAllData() {
    await Promise.all([
        loadUniversiteler(),
        loadEnstitüler(),
        loadYazarlar(),
        loadDanışmanlar(),
        loadKonular()
    ]);
}

async function loadUniversiteler() {
    try {
        const universiteler = await UniversiteAPI.getAll();
        const container = document.getElementById('universiteler-list');
        if (universiteler.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">No universities added yet.</p>';
            return;
        }
        container.innerHTML = universiteler.map(u => `
            <div style="padding: 1rem; border: 1px solid var(--border-color); border-radius: 0.5rem; margin-bottom: 0.5rem;">
                <strong>${escapeHtml(u.universite_adi)}</strong>
                ${u.kurulus_yili ? `<span style="color: var(--text-secondary); margin-left: 1rem;">(${u.kurulus_yili})</span>` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('Üniversiteler yüklenemedi:', error);
    }
}

async function loadEnstitüler() {
    try {
        const enstitüler = await EnstitüAPI.getAll();
        const container = document.getElementById('enstitüler-list');
        if (enstitüler.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">No institutes added yet.</p>';
            return;
        }
        container.innerHTML = enstitüler.map(e => `
            <div style="padding: 1rem; border: 1px solid var(--border-color); border-radius: 0.5rem; margin-bottom: 0.5rem;">
                <strong>${escapeHtml(e.enstitü_adi)}</strong>
                ${e.universite_adi ? `<span style="color: var(--text-secondary); margin-left: 1rem;">- ${escapeHtml(e.universite_adi)}</span>` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('Enstitüler yüklenemedi:', error);
    }
}

async function loadYazarlar() {
    try {
        const yazarlar = await YazarAPI.getAll();
        const container = document.getElementById('yazarlar-list');
        if (yazarlar.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">No authors added yet.</p>';
            return;
        }
        container.innerHTML = yazarlar.map(y => `
            <div style="padding: 1rem; border: 1px solid var(--border-color); border-radius: 0.5rem; margin-bottom: 0.5rem;">
                <strong>${escapeHtml(y.ad)} ${escapeHtml(y.soyad)}</strong>
                ${y.email ? `<span style="color: var(--text-secondary); margin-left: 1rem;">${escapeHtml(y.email)}</span>` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('Yazarlar yüklenemedi:', error);
    }
}

async function loadDanışmanlar() {
    try {
        const danışmanlar = await DanışmanAPI.getAll();
        const container = document.getElementById('danışmanlar-list');
        if (danışmanlar.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">No advisors added yet.</p>';
            return;
        }
        container.innerHTML = danışmanlar.map(d => `
            <div style="padding: 1rem; border: 1px solid var(--border-color); border-radius: 0.5rem; margin-bottom: 0.5rem;">
                <strong>${d.unvan || ''} ${escapeHtml(d.ad)} ${escapeHtml(d.soyad)}</strong>
                ${d.email ? `<span style="color: var(--text-secondary); margin-left: 1rem;">${escapeHtml(d.email)}</span>` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('Danışmanlar yüklenemedi:', error);
    }
}

async function loadKonular() {
    try {
        const konular = await KonuAPI.getAll();
        const container = document.getElementById('konular-list');
        if (konular.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">No topics added yet.</p>';
            return;
        }
        container.innerHTML = konular.map(k => `
            <div style="padding: 1rem; border: 1px solid var(--border-color); border-radius: 0.5rem; margin-bottom: 0.5rem; display: inline-block; margin-right: 0.5rem;">
                <span class="badge badge-primary">${escapeHtml(k.konu_adi)}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Konular yüklenemedi:', error);
    }
}

function showModal(type) {
    const modal = document.getElementById('modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    title.textContent = `Add New ${getTypeName(type)}`;
    
    let formHTML = '';
    switch(type) {
        case 'universite':
            formHTML = `
                <form id="modal-form" onsubmit="submitForm(event, 'universite')">
                    <div class="form-group">
                        <label>University Name *</label>
                        <input type="text" class="form-control" name="universite_adi" required>
                    </div>
                    <div class="form-group">
                        <label>Foundation Year</label>
                        <input type="number" class="form-control" name="kurulus_yili" min="1000" max="2100">
                    </div>
                    <button type="submit" class="btn btn-primary">Add</button>
                </form>
            `;
            break;
        case 'enstitü':
            formHTML = `
                <form id="modal-form" onsubmit="submitForm(event, 'enstitü')">
                    <div class="form-group">
                        <label>Institute Name *</label>
                        <input type="text" class="form-control" name="enstitü_adi" required>
                    </div>
                    <div class="form-group">
                        <label>University *</label>
                        <select class="form-control" name="universite_id" id="modal-universite-select" required></select>
                    </div>
                    <button type="submit" class="btn btn-primary">Add</button>
                </form>
            `;
            loadUniversitelerForModal();
            break;
        case 'yazar':
            formHTML = `
                <form id="modal-form" onsubmit="submitForm(event, 'yazar')">
                    <div class="form-group">
                        <label>Ad *</label>
                        <input type="text" class="form-control" name="ad" required>
                    </div>
                    <div class="form-group">
                        <label>Soyad *</label>
                        <input type="text" class="form-control" name="soyad" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" class="form-control" name="email">
                    </div>
                    <div class="form-group">
                        <label>Telefon</label>
                        <input type="text" class="form-control" name="telefon">
                    </div>
                    <button type="submit" class="btn btn-primary">Add</button>
                </form>
            `;
            break;
        case 'danışman':
            formHTML = `
                <form id="modal-form" onsubmit="submitForm(event, 'danışman')">
                    <div class="form-group">
                        <label>Ad *</label>
                        <input type="text" class="form-control" name="ad" required>
                    </div>
                    <div class="form-group">
                        <label>Soyad *</label>
                        <input type="text" class="form-control" name="soyad" required>
                    </div>
                    <div class="form-group">
                        <label>Title</label>
                        <input type="text" class="form-control" name="unvan" placeholder="Prof. Dr., Assoc. Prof. Dr., etc.">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" class="form-control" name="email">
                    </div>
                    <div class="form-group">
                        <label>Telefon</label>
                        <input type="text" class="form-control" name="telefon">
                    </div>
                    <button type="submit" class="btn btn-primary">Add</button>
                </form>
            `;
            break;
        case 'konu':
            formHTML = `
                <form id="modal-form" onsubmit="submitForm(event, 'konu')">
                    <div class="form-group">
                        <label>Topic Name *</label>
                        <input type="text" class="form-control" name="konu_adi" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Add</button>
                </form>
            `;
            break;
    }
    
    body.innerHTML = formHTML;
    modal.classList.add('active');
}

async function loadUniversitelerForModal() {
    try {
        const universiteler = await UniversiteAPI.getAll();
        const select = document.getElementById('modal-universite-select');
        select.innerHTML = '<option value="">Select University...</option>';
        universiteler.forEach(u => {
            const option = document.createElement('option');
            option.value = u.universite_id;
            option.textContent = u.universite_adi;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Üniversiteler yüklenemedi:', error);
    }
}

async function submitForm(event, type) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Boş değerleri null yap
    Object.keys(data).forEach(key => {
        if (data[key] === '') data[key] = null;
        else if (key.includes('_id') || key === 'kurulus_yili') {
            data[key] = data[key] ? parseInt(data[key]) : null;
        }
    });
    
    try {
        let result;
        switch(type) {
            case 'universite':
                result = await UniversiteAPI.add(data);
                await loadUniversiteler();
                break;
            case 'enstitü':
                result = await EnstitüAPI.add(data);
                await loadEnstitüler();
                break;
            case 'yazar':
                result = await YazarAPI.add(data);
                await loadYazarlar();
                break;
            case 'danışman':
                result = await DanışmanAPI.add(data);
                await loadDanışmanlar();
                break;
            case 'konu':
                result = await KonuAPI.add(data);
                await loadKonular();
                break;
        }
        
        closeModal();
        alert('Added successfully!');
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
    document.getElementById('modal-body').innerHTML = '';
}

function getTypeName(type) {
    const names = {
        'universite': 'University',
        'enstitü': 'Institute',
        'yazar': 'Author',
        'danışman': 'Advisor',
        'konu': 'Topic'
    };
    return names[type] || type;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

