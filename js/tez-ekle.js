let danışmanCount = 0;
let konuCount = 0;
let anahtarKelimeCount = 0;

document.addEventListener('DOMContentLoaded', async () => {
    await loadFormData();
    setupFormHandlers();
    
    // Bugünün tarihini varsayılan olarak ayarla
    document.getElementById('teslim_tarihi').valueAsDate = new Date();
});

async function loadFormData() {
    try {
        const [yazarlar, universiteler, danışmanlar, konular] = await Promise.all([
            YazarAPI.getAll(),
            UniversiteAPI.getAll(),
            DanışmanAPI.getAll(),
            KonuAPI.getAll()
        ]);
        
        // Yazarları yükle
        const yazarSelect = document.getElementById('yazar_id');
        yazarlar.forEach(yazar => {
            const option = document.createElement('option');
            option.value = yazar.yazar_id;
            option.textContent = `${yazar.ad} ${yazar.soyad}`;
            yazarSelect.appendChild(option);
        });
        
        // Üniversiteleri yükle
        const universiteSelect = document.getElementById('universite_id');
        universiteler.forEach(universite => {
            const option = document.createElement('option');
            option.value = universite.universite_id;
            option.textContent = universite.universite_adi;
            universiteSelect.appendChild(option);
        });
        
        // Danışmanları global olarak sakla
        window.danışmanlarList = danışmanlar;
        window.konularList = konular;
        
        // İlk danışman ve konu satırlarını ekle
        addDanışmanRow();
        addKonuRow();
    } catch (error) {
        showAlert('Error loading form data: ' + error.message, 'error');
    }
}

function setupFormHandlers() {
    document.getElementById('tez-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitTez();
    });
    
    document.getElementById('yazar-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitYazar();
    });
}

async function loadEnstituler() {
    const universiteId = document.getElementById('universite_id').value;
    const enstitüSelect = document.getElementById('enstitü_id');
    
    enstitüSelect.innerHTML = '<option value="">Loading...</option>';
    
    if (!universiteId) {
        enstitüSelect.innerHTML = '<option value="">Please select university first</option>';
        return;
    }
    
    try {
        const enstitüler = await EnstitüAPI.getAll(universiteId);
        enstitüSelect.innerHTML = '<option value="">Select Institute...</option>';
        enstitüler.forEach(enstitü => {
            const option = document.createElement('option');
            option.value = enstitü.enstitü_id;
            option.textContent = enstitü.enstitü_adi;
            enstitüSelect.appendChild(option);
        });
    } catch (error) {
        showAlert('Error loading institutes', 'error');
    }
}

function addDanışmanRow() {
    const container = document.getElementById('danışmanlar-container');
    const row = document.createElement('div');
    row.className = 'form-group';
    row.style.display = 'flex';
    row.style.gap = '1rem';
    row.style.alignItems = 'flex-end';
    row.id = `danışman-row-${danışmanCount}`;
    
    row.innerHTML = `
        <div style="flex: 1;">
            <label>Advisor</label>
            <select class="form-control danışman-select" required>
                <option value="">Select Advisor...</option>
                ${window.danışmanlarList?.map(d => 
                    `<option value="${d.danışman_id}">${d.unvan || ''} ${d.ad} ${d.soyad}</option>`
                ).join('') || ''}
            </select>
        </div>
        <div style="flex: 1;">
            <label>Role</label>
            <select class="form-control danışman-rol" required>
                <option value="">Select Role...</option>
                <option value="Primary">Primary</option>
                <option value="Secondary">Secondary</option>
            </select>
        </div>
        <button type="button" class="btn btn-danger" onclick="removeRow('danışman-row-${danışmanCount}')">Sil</button>
    `;
    
    container.appendChild(row);
    danışmanCount++;
}

function addKonuRow() {
    const container = document.getElementById('konular-container');
    const row = document.createElement('div');
    row.className = 'form-group';
    row.style.display = 'flex';
    row.style.gap = '1rem';
    row.style.alignItems = 'flex-end';
    row.id = `konu-row-${konuCount}`;
    
    row.innerHTML = `
        <div style="flex: 1;">
            <label>Topic</label>
            <select class="form-control konu-select" required>
                <option value="">Select Topic...</option>
                ${window.konularList?.map(k => 
                    `<option value="${k.konu_id}">${k.konu_adi}</option>`
                ).join('') || ''}
            </select>
        </div>
        <button type="button" class="btn btn-danger" onclick="removeRow('konu-row-${konuCount}')">Sil</button>
    `;
    
    container.appendChild(row);
    konuCount++;
}

function addAnahtarKelimeRow() {
    const container = document.getElementById('anahtar-kelimeler-container');
    const row = document.createElement('div');
    row.className = 'form-group';
    row.style.display = 'flex';
    row.style.gap = '1rem';
    row.style.alignItems = 'flex-end';
    row.id = `ak-row-${anahtarKelimeCount}`;
    
    row.innerHTML = `
        <div style="flex: 1;">
            <label>Keyword</label>
            <input type="text" class="form-control ak-input" placeholder="Enter keyword">
        </div>
        <button type="button" class="btn btn-danger" onclick="removeRow('ak-row-${anahtarKelimeCount}')">Sil</button>
    `;
    
    container.appendChild(row);
    anahtarKelimeCount++;
}

function removeRow(id) {
    document.getElementById(id).remove();
}

async function submitTez() {
    const form = document.getElementById('tez-form');
    const formData = new FormData(form);
    
    // Danışmanları topla
    const danışmanlar = [];
    document.querySelectorAll('.danışman-select').forEach((select, index) => {
        const rolSelect = select.parentElement.parentElement.querySelector('.danışman-rol');
        if (select.value && rolSelect.value) {
            danışmanlar.push({
                danışman_id: parseInt(select.value),
                rol: rolSelect.value
            });
        }
    });
    
    // Konuları topla
    const konular = [];
    document.querySelectorAll('.konu-select').forEach(select => {
        if (select.value) {
            konular.push(parseInt(select.value));
        }
    });
    
    // Anahtar kelimeleri topla
    const anahtarKelimeler = [];
    document.querySelectorAll('.ak-input').forEach(input => {
        if (input.value.trim()) {
            anahtarKelimeler.push(input.value.trim());
        }
    });
    
    const data = {
        tez_no: parseInt(document.getElementById('tez_no').value),
        başlık: document.getElementById('başlık').value,
        özet: document.getElementById('özet').value || null,
        yazar_id: parseInt(document.getElementById('yazar_id').value),
        yıl: parseInt(document.getElementById('yıl').value),
        tür: document.getElementById('tür').value,
        universite_id: parseInt(document.getElementById('universite_id').value),
        enstitü_id: parseInt(document.getElementById('enstitü_id').value),
        sayfa_sayısı: document.getElementById('sayfa_sayısı').value ? parseInt(document.getElementById('sayfa_sayısı').value) : null,
        dil: document.getElementById('dil').value,
        teslim_tarihi: document.getElementById('teslim_tarihi').value,
        danışmanlar: danışmanlar,
        konular: konular,
        anahtar_kelimeler: anahtarKelimeler
    };
    
    try {
        const result = await TezAPI.add(data);
        showAlert('Thesis added successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } catch (error) {
        showAlert('Error adding thesis: ' + error.message, 'error');
    }
}

function showYazarModal() {
    document.getElementById('yazar-modal').classList.add('active');
}

function closeYazarModal() {
    document.getElementById('yazar-modal').classList.remove('active');
    document.getElementById('yazar-form').reset();
}

async function submitYazar() {
    const data = {
        ad: document.getElementById('yazar_ad').value,
        soyad: document.getElementById('yazar_soyad').value,
        email: document.getElementById('yazar_email').value || null,
        telefon: document.getElementById('yazar_telefon').value || null
    };
    
    try {
        const result = await YazarAPI.add(data);
        const option = document.createElement('option');
        option.value = result.id;
        option.textContent = `${data.ad} ${data.soyad}`;
        option.selected = true;
        document.getElementById('yazar_id').appendChild(option);
        closeYazarModal();
        showAlert('Author added successfully!', 'success');
    } catch (error) {
        showAlert('Error adding author: ' + error.message, 'error');
    }
}

function showAlert(message, type) {
    const container = document.getElementById('alert-container');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    container.innerHTML = '';
    container.appendChild(alert);
    setTimeout(() => alert.remove(), 5000);
}

