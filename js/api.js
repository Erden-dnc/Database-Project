// API Helper Functions
const API_BASE = 'php/api.php';

async function apiCall(action, method = 'GET', data = null) {
    const url = `${API_BASE}?action=${action}`;
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Bir hata oluştu');
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Tez İşlemleri
const TezAPI = {
    getAll: () => apiCall('get_tezler'),
    getById: (id) => apiCall(`get_tez&id=${id}`),
    search: (filters) => {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) params.append(key, filters[key]);
        });
        return apiCall(`search_tezler&${params.toString()}`);
    },
    add: (data) => apiCall('add_tez', 'POST', data)
};

// Ebeveyn Tablo İşlemleri
const UniversiteAPI = {
    getAll: () => apiCall('get_universiteler'),
    add: (data) => apiCall('add_universite', 'POST', data)
};

const EnstitüAPI = {
    getAll: (universite_id = null) => {
        const url = universite_id 
            ? `get_enstituler&universite_id=${universite_id}`
            : 'get_enstituler';
        return apiCall(url);
    },
    add: (data) => apiCall('add_enstitü', 'POST', data)
};

const YazarAPI = {
    getAll: () => apiCall('get_yazarlar'),
    add: (data) => apiCall('add_yazar', 'POST', data)
};

const DanışmanAPI = {
    getAll: () => apiCall('get_danışmanlar'),
    add: (data) => apiCall('add_danışman', 'POST', data)
};

const KonuAPI = {
    getAll: () => apiCall('get_konular'),
    add: (data) => apiCall('add_konu', 'POST', data)
};

