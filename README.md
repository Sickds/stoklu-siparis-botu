# 🛒 Stoklu Sipariş Teslim Bot

Discord sunucularında ürün stok yönetimi ve sipariş teslim sistemi için geliştirilmiş gelişmiş bir Discord botu.

## 📋 Özellikler

### 🏪 Ürün Yönetimi
- ✅ Ürün ekleme, düzenleme ve silme
- 🖼️ Ürün görselleri yükleme
- 💰 Fiyat belirleme
- 📝 Detaylı ürün açıklamaları
- 🏷️ Benzersiz ürün kodları

### 📦 Stok Yönetimi
- 📁 Toplu stok dosyası yükleme (.txt formatında)
- 📊 Stok durumu takibi
- ⚠️ Düşük stok uyarıları
- 📈 Stok geçmişi

### 🛍️ Sipariş Sistemi
- 🛒 Ürün siparişi verme
- 📋 Sipariş listesi görüntüleme
- ✅ Sipariş teslim işlemleri
- 📊 Sipariş istatistikleri

### 🔊 Ses Sistemi
- 🎵 Sesli kanal bağlantısı
- 🔊 Otomatik ses kanalı yönetimi

## 🚀 Kurulum

### Gereksinimler
- Node.js v20 veya üzeri
- Discord Bot Token
- Discord sunucu yönetici yetkisi

### Adım 1: Projeyi İndirin
```bash
git clone https://github.com/hasbutcu/stoklu-siparis-botu.git
cd stoklu-siparis-botu
```

### Adım 2: Bağımlılıkları Yükleyin
```bash
npm install
```

### Adım 3: Konfigürasyon
`config.js` dosyasını düzenleyin:

```javascript
module.exports = {
    token: 'BOT_TOKEN_BURAYA', // Discord Bot Token
    ownerID: 'SAHIP_ID_BURAYA', // Bot sahibi Discord ID
    embedFooter: 'Stoklu Sipariş Teslim Bot', // Embed alt yazısı
    
    logChannelID: 'LOG_KANAL_ID', // Uyarı kanalı ID
    stockAlertRoleID: 'ROL_ID', // Stok uyarısı rolü ID
    
    sunucuId: 'SUNUCU_ID', // Sesli kanalın olduğu sunucu ID
    seskanali: 'SES_KANAL_ID', // Botun bağlanacağı sesli kanal ID
};
```

### Adım 4: Botu Başlatın
```bash
# Geliştirme modu
npm run dev

# Üretim modu
npm start
```

## 📚 Komutlar

### 🏪 Ürün Komutları

#### `/ürün-ekle`
Yeni ürün ekler.
- **Parametreler:**
  - `ürün-kodu` (zorunlu): Benzersiz ürün kodu
  - `ad` (zorunlu): Ürün adı
  - `fiyat` (zorunlu): Ürün fiyatı (₺)
  - `gorsel` (opsiyonel): Ürün görseli
  - `açıklama` (opsiyonel): Ürün açıklaması

#### `/ürün-liste`
Tüm ürünleri listeler.

#### `/ürün-göster`
Belirli bir ürünün detaylarını gösterir.
- **Parametreler:**
  - `ürün-kodu` (zorunlu): Gösterilecek ürün kodu

#### `/ürün-sil`
Ürün siler.
- **Parametreler:**
  - `ürün-kodu` (zorunlu): Silinecek ürün kodu

### 📦 Stok Komutları

#### `/stok-ekle`
Ürün stok dosyası ekler.
- **Parametreler:**
  - `ürün-kodu` (zorunlu): Stok eklenecek ürün kodu
  - `stok-dosyası` (zorunlu): .txt formatında stok dosyası

#### `/stok-liste`
Ürün stok durumunu gösterir.
- **Parametreler:**
  - `ürün-kodu` (zorunlu): Stok durumu kontrol edilecek ürün kodu

#### `/stok-sil`
Ürün stoklarını siler.
- **Parametreler:**
  - `ürün-kodu` (zorunlu): Stokları silinecek ürün kodu

### 🛍️ Sipariş Komutları

#### `/ürün-teslim`
Ürün teslim işlemi gerçekleştirir.
- **Parametreler:**
  - `ürün-kodu` (zorunlu): Teslim edilecek ürün kodu
  - `müşteri` (zorunlu): Müşteri bilgisi

#### `/ürünler`
Tüm ürünleri kategorize edilmiş şekilde gösterir.

### 🔧 Sistem Komutları

#### `/ping`
Bot gecikme süresini gösterir.

#### `/test`
Bot durumunu test eder.

## 📁 Proje Yapısı

```
stoklu-siparis-teslim-bot/
├── 📁 komutlar/           # Slash komutları
│   ├── ping.js
│   ├── stok-*.js         # Stok yönetimi komutları
│   └── ürün-*.js         # Ürün yönetimi komutları
├── 📁 eventler/           # Discord eventleri
│   ├── clientReady.js
│   └── interactionCreate.js
├── 📁 fonksiyonlar/       # Yardımcı fonksiyonlar
│   ├── database.js
│   ├── eventYukleyici.js
│   └── slashKomutYukleyici.js
├── 📁 database/           # Veritabanı dosyaları
├── 📁 stok/              # Stok dosyaları (.txt)
├── config.js             # Bot konfigürasyonu
├── index.js              # Ana bot dosyası
└── package.json          # Proje bağımlılıkları
```

## 🗄️ Veritabanı

Bot, `croxydb` kullanarak JSON tabanlı veritabanı yönetimi yapar:
- **Ürün bilgileri:** `database/urunler.json`
- **Stok dosyaları:** `stok/` klasöründe `.txt` formatında

## 🔧 Geliştirme

### Bağımlılıklar
- **discord.js:** Discord API entegrasyonu
- **croxydb:** JSON veritabanı yönetimi
- **discord.js-vsc:** Ses kanalı yönetimi
- **node-fetch:** HTTP istekleri

### Geliştirme Komutları
```bash
# Geliştirme modu (otomatik yeniden başlatma)
npm run dev

# Üretim modu
npm start
```

## ⚙️ Konfigürasyon Detayları

### Bot İzinleri
Botun çalışması için gerekli Discord izinleri:
- `Send Messages` - Mesaj gönderme
- `Use Slash Commands` - Slash komutları kullanma
- `Attach Files` - Dosya ekleme
- `Embed Links` - Embed gönderme
- `Connect` - Ses kanalına bağlanma
- `Speak` - Ses kanalında konuşma

### Stok Dosyası Formatı
Stok dosyaları `.txt` formatında olmalı ve her satırda bir stok öğesi bulunmalıdır:
```
kullanıcıadı:şifre
kullanıcıadı:şifre
kullanıcıadı:şifre
kullanıcıadı:şifre
STOK2
STOK3
STOK4
```

## 🛡️ Güvenlik

- Tüm yönetici komutları sadece bot sahibi tarafından kullanılabilir
- Dosya boyutu limitleri (8MB)
- Dosya formatı kontrolleri
- Hata yönetimi ve güvenli veri işleme

## 📊 Özellikler

### ✅ Mevcut Özellikler
- [x] Ürün yönetimi sistemi
- [x] Stok yönetimi
- [x] Slash komutları
- [x] Embed mesajlar
- [x] Dosya yükleme
- [x] Ses kanalı entegrasyonu
- [x] Veritabanı yönetimi

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

## 👨‍💻 Geliştirici

**oxyinc** - Proje Geliştiricisi

## 📞 Destek

Herhangi bir sorun yaşarsanız veya öneriniz varsa:
- GitHub Issues bölümünü kullanın
- Discord üzerinden iletişime geçin
- discord.gg/vsc

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
