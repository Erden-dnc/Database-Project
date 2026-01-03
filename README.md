# GTS Web Dashboard

Lisansüstü Tez Sistemi için web tabanlı dashboard uygulaması.

## Özellikler

- ✅ Ana Dashboard (İstatistikler ve son eklenen tezler)
- ✅ Tez Ekleme (Yeni tez kaydı oluşturma)
- ✅ Tez Arama (Detaylı arama ve filtreleme)
- ✅ Tez Detay Görüntüleme
- ✅ Veri Yönetimi (Üniversite, Enstitü, Yazar, Danışman, Konu Başlığı)

## Kurulum

### 1. Veritabanı Bağlantısını Yapılandırın

`web/php/config.php` dosyasını açın ve MySQL bilgilerinizi girin:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', ''); // MySQL şifreniz
define('DB_NAME', 'gts_tez_sistemi');
```

### 2. Web Sunucusu Başlatın

#### PHP Built-in Server (Geliştirme için):

```bash
cd web
php -S localhost:8000
```

Tarayıcıda `http://localhost:8000` adresine gidin.

#### XAMPP/MAMP/WAMP:

1. Dosyaları `htdocs` veya `www` klasörüne kopyalayın
2. Apache'yi başlatın
3. `http://localhost/web` adresine gidin

#### Nginx:

Nginx yapılandırması için `nginx.conf` örneği:

```nginx
server {
    listen 80;
    server_name localhost;
    root /path/to/web;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}
```

## Kullanım

1. **Ana Sayfa**: Dashboard ve istatistikler
2. **Tez Ekle**: Yeni tez kaydı oluşturun
3. **Tez Ara**: Filtreleme ile tez arayın
4. **Yönetim**: Ebeveyn tablolara veri ekleyin/düzenleyin

## Dosya Yapısı

```
web/
├── index.html          # Ana dashboard
├── tez-ekle.html       # Tez ekleme sayfası
├── tez-ara.html        # Tez arama sayfası
├── tez-detay.html      # Tez detay sayfası
├── yönetim.html         # Veri yönetimi
├── css/
│   └── style.css       # Stil dosyası
├── js/
│   ├── api.js          # API helper fonksiyonları
│   ├── main.js         # Ana sayfa JavaScript
│   ├── tez-ekle.js     # Tez ekleme JavaScript
│   ├── tez-ara.js      # Tez arama JavaScript
│   ├── tez-detay.js    # Tez detay JavaScript
│   └── yönetim.js      # Yönetim JavaScript
└── php/
    ├── config.php       # Veritabanı bağlantısı
    └── api.php         # REST API endpoint'leri
```

## API Endpoints

Tüm API çağrıları `php/api.php?action=...` formatında yapılır:

- `get_tezler` - Tüm tezleri getir
- `get_tez&id=X` - Belirli bir tezi getir
- `search_tezler` - Tez ara
- `add_tez` - Yeni tez ekle
- `get_universiteler` - Üniversiteleri getir
- `add_universite` - Üniversite ekle
- `get_enstituler` - Enstitüleri getir
- `add_enstitü` - Enstitü ekle
- `get_yazarlar` - Yazarları getir
- `add_yazar` - Yazar ekle
- `get_danışmanlar` - Danışmanları getir
- `add_danışman` - Danışman ekle
- `get_konular` - Konu başlıklarını getir
- `add_konu` - Konu başlığı ekle

## Sorun Giderme

### CORS Hatası

Geliştirme sırasında CORS hatası alırsanız, `php/config.php` dosyasındaki CORS ayarlarını kontrol edin.

### Veritabanı Bağlantı Hatası

- MySQL servisinin çalıştığından emin olun
- `config.php` dosyasındaki bilgilerin doğru olduğundan emin olun
- Veritabanının oluşturulduğundan emin olun

### PHP Hataları

PHP hata mesajlarını görmek için `php/config.php` dosyasında:

```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

## Tarayıcı Desteği

- Chrome (önerilen)
- Firefox
- Safari
- Edge

## Lisans

Bu proje SE 307 Veritabanı Yönetim Sistemleri dersi için geliştirilmiştir.

