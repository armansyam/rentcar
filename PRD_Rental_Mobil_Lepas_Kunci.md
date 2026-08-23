# PRD — Platform Rental Mobil Lepas Kunci

**Versi:** 1.0  
**Status:** Draft Final / Ready for Design & Development  
**Platform:** Responsive Web — Desktop, Tablet, Mobile  
**Produk:** Website Rental Mobil + Admin Dashboard + WhatsApp Inquiry  
**Model Bisnis:** Penyewaan mobil / lepas kunci  
**Harga di Website:** Tidak ditampilkan pada MVP  
**Booking:** Inquiry & konfirmasi melalui WhatsApp

---

## 1. Executive Summary

Produk ini adalah platform digital untuk bisnis **penyewaan mobil lepas kunci**.

Platform terdiri dari tiga bagian utama:

1. **Landing Page** — digunakan customer untuk mengenal rental, melihat armada, memilih mobil, mengisi kebutuhan sewa, dan menghubungi admin.
2. **Admin Dashboard** — digunakan admin/owner untuk mengelola daftar mobil, konten website, lokasi, SEO, dan inquiry.
3. **WhatsApp** — menjadi channel komunikasi utama untuk mengecek ketersediaan dan melanjutkan proses booking.

### Konsep utama

```text
ADMIN DASHBOARD
      |
      | Kelola data
      v
LANDING PAGE
      |
      | Customer memilih mobil
      | Customer memilih tanggal
      | Customer mengisi data
      v
WHATSAPP
      |
      | Inquiry
      v
ADMIN
      |
      | Konfirmasi ketersediaan
      v
BOOKING
```

> **Catatan penting:** Produk ini adalah rental mobil/lepas kunci, bukan layanan antar-jemput atau transportasi dengan driver.

---

# 2. Problem Statement

Customer rental mobil biasanya membutuhkan informasi berikut sebelum menyewa:

- Mobil apa yang tersedia?
- Tipe dan mereknya apa?
- Berapa kapasitasnya?
- Manual atau automatic?
- Mobilnya cocok untuk kebutuhan saya atau tidak?
- Apakah tersedia pada tanggal tertentu?
- Bagaimana cara menyewa?
- Apa saja syaratnya?
- Di mana lokasi kantor?
- Bagaimana menghubungi admin?

Jika semua informasi hanya diberikan melalui WhatsApp, admin harus menjawab pertanyaan yang sama berulang kali.

### Solusi

Website menyediakan informasi dasar secara mandiri, sedangkan WhatsApp digunakan untuk **availability inquiry dan konfirmasi**.

Dengan demikian:

```text
Website = Informasi + Katalog Armada + Lead Generation
WhatsApp = Inquiry + Komunikasi + Konfirmasi
Dashboard = Pengelolaan Konten + Armada + Inquiry
```

---

# 3. Product Goals

## Primary Goal

Menghasilkan inquiry rental mobil yang berkualitas melalui website dan WhatsApp.

## Secondary Goals

- Menampilkan armada secara profesional.
- Memudahkan customer memilih mobil.
- Memudahkan customer mengecek ketersediaan.
- Mengurangi pertanyaan berulang kepada admin.
- Memudahkan admin menambah/mengubah daftar mobil tanpa developer.
- Meningkatkan kepercayaan customer.
- Mendukung pertumbuhan organic traffic melalui SEO.

---

# 4. Non-Goals / Out of Scope MVP

Fitur berikut **tidak masuk MVP**:

- Online payment.
- Payment gateway.
- Booking otomatis.
- Real-time availability.
- Sistem driver.
- Antar-jemput.
- Customer login.
- Customer account.
- Invoice otomatis.
- Deposit management.
- Dynamic pricing.
- Promo engine.
- Kalender availability otomatis.
- Fleet GPS tracking.

Fitur tersebut dapat dipertimbangkan pada fase berikutnya.

---

# 5. Target Users

## 5.1 Customer

Calon penyewa yang membutuhkan kendaraan untuk:

- Liburan.
- Perjalanan keluarga.
- Perjalanan bisnis.
- Mudik.
- Perjalanan luar kota.
- Acara.
- Kebutuhan pribadi.

## 5.2 Admin

Admin rental yang bertugas:

- Mengelola armada.
- Menjawab inquiry.
- Mengonfirmasi ketersediaan.
- Mengelola konten website.
- Mengelola informasi kantor.

## 5.3 Owner

Owner membutuhkan:

- Kontrol daftar armada.
- Informasi inquiry.
- Kemudahan update website.
- Gambaran performa website.

---

# 6. Product Positioning

### Core Message

> **Sewa Mobil Lepas Kunci, Nyaman dan Mudah.**

### Value Proposition

- Pilihan mobil terawat.
- Proses inquiry mudah.
- Informasi kendaraan jelas.
- Lokasi kantor jelas.
- Customer dapat memilih sendiri kendaraan.
- Komunikasi langsung melalui WhatsApp.

---

# 7. Product Architecture

```text
                         ┌──────────────────────┐
                         │       ADMIN          │
                         └──────────┬───────────┘
                                    |
                                    v
                         ┌──────────────────────┐
                         │   ADMIN DASHBOARD    │
                         │                      │
                         │ - Mobil              │
                         │ - Inquiry            │
                         │ - Konten             │
                         │ - Lokasi             │
                         │ - SEO                │
                         └──────────┬───────────┘
                                    |
                             Database / API
                                    |
                                    v
                         ┌──────────────────────┐
                         │    LANDING PAGE      │
                         │                      │
                         │ - Profil             │
                         │ - Armada             │
                         │ - Detail Mobil       │
                         │ - Booking Form       │
                         │ - Lokasi             │
                         └──────────┬───────────┘
                                    |
                              Inquiry Data
                                    |
                                    v
                         ┌──────────────────────┐
                         │       WHATSAPP       │
                         │                      │
                         │ Customer → Admin     │
                         └──────────────────────┘
```

---

# 8. Website Information Architecture

```text
/
├── Beranda
├── Mobil
│   ├── Toyota Avanza
│   ├── Toyota Innova Reborn
│   ├── Honda Mobilio
│   └── Toyota Fortuner
├── Cara Sewa
├── Syarat Sewa
├── Lokasi
├── FAQ
└── Blog
```

---

# 9. Admin Information Architecture

```text
/admin
├── Dashboard
├── Mobil
│   ├── Semua Mobil
│   ├── Tambah Mobil
│   └── Edit Mobil
├── Inquiry
├── Konten
│   ├── Profil
│   ├── Keunggulan
│   ├── Cara Sewa
│   └── FAQ
├── Lokasi
├── SEO
└── Settings
```

---

# 10. Core User Flow

```text
Customer membuka website
        |
        v
Melihat Hero
        |
        v
Mengenal rental
        |
        v
Melihat daftar mobil
        |
        v
Memilih mobil
        |
        v
Melihat detail mobil
        |
        v
Klik "Cek Ketersediaan"
        |
        v
Form booking/inquiry
        |
        v
Pilih tanggal
        |
        v
Isi lokasi pengambilan
        |
        v
Isi data customer
        |
        v
Generate template WhatsApp
        |
        v
WhatsApp terbuka
        |
        v
Customer mengirim pesan
        |
        v
Admin menerima inquiry
        |
        v
Admin mengecek ketersediaan
        |
        v
Admin mengonfirmasi
        |
        v
Booking diproses
        |
        v
Customer mengambil mobil
```

---

# 11. Landing Page Requirements

## 11.1 Header

### Desktop

```text
[LOGO]

Beranda
Mobil
Cara Sewa
Tentang Kami
Lokasi

[ Cek Ketersediaan ]
```

### Mobile

```text
[LOGO]                         [☰]
```

Header mobile sticky.

---

# 12. Hero Section

Hero merupakan section pertama.

### H1

> Sewa Mobil Lepas Kunci untuk Perjalanan Anda

### Supporting Copy

> Pilihan mobil terawat untuk kebutuhan perjalanan keluarga, bisnis, liburan, maupun perjalanan luar kota.

### Primary CTA

> Cek Ketersediaan

### Secondary CTA

> Lihat Mobil

### Badge

> 🚗 Rental Mobil Lepas Kunci

Hero harus langsung membuat customer memahami bahwa produk adalah **rental kendaraan**, bukan jasa antar-jemput.

---

# 13. About / Profil Perusahaan

Section ini berisi:

- Sambutan.
- Profil perusahaan.
- Pengalaman.
- Nilai perusahaan.
- Komitmen kepada customer.
- Foto kantor jika tersedia.

### Contoh copy

> Selamat datang di [Nama Rental]. Kami menyediakan layanan penyewaan mobil lepas kunci dengan pilihan kendaraan yang terawat dan proses sewa yang mudah.

---

# 14. Keunggulan

Gunakan empat card:

### Armada Terawat

Kendaraan dirawat secara berkala dan dipersiapkan sebelum digunakan.

### Pilihan Mobil

Customer dapat memilih tipe kendaraan sesuai kebutuhan.

### Lepas Kunci

Customer menyewa kendaraan untuk digunakan sendiri selama masa sewa.

### Customer Support

Customer dapat menghubungi admin melalui WhatsApp.

---

# 15. Vehicle Listing

Daftar kendaraan mengambil data dari Admin Dashboard.

### Vehicle Card

```text
┌────────────────────────────┐
│                            │
│        FOTO MOBIL          │
│                            │
├────────────────────────────┤
│ Toyota Avanza              │
│                            │
│ 7 Kursi · Manual · Bensin  │
│                            │
│ [ Cek Ketersediaan ]       │
└────────────────────────────┘
```

### Tidak menampilkan:

- Harga.
- Diskon.
- Promo harga.

---

# 16. Vehicle Detail

URL:

```text
/mobil/[slug]
```

Contoh:

```text
/mobil/toyota-avanza
/mobil/toyota-innova-reborn
/mobil/toyota-fortuner
```

## Informasi

- Foto utama.
- Galeri foto.
- Merek.
- Model.
- Tahun.
- Kapasitas.
- Transmisi.
- Bahan bakar.
- Fasilitas.
- Deskripsi.
- Status publikasi.

### CTA

> Cek Ketersediaan Mobil Ini

Jika customer datang dari halaman detail, mobil otomatis dipilih pada form.

---

# 17. Vehicle Management Dashboard

Fitur utama dashboard adalah **mengelola daftar mobil**.

Admin dapat:

- Tambah mobil.
- Edit mobil.
- Upload foto.
- Hapus mobil.
- Nonaktifkan mobil.
- Aktifkan kembali mobil.
- Atur urutan tampil.

---

# 18. Vehicle List Dashboard

```text
┌──────────────────────────────────────────┐
│ Mobil                                    │
│                                          │
│                         [+ Tambah Mobil] │
├──────────────────────────────────────────┤
│ [FOTO] Toyota Avanza                     │
│        7 Kursi · Manual · Bensin         │
│        ● Aktif                           │
│                                          │
│        [Edit] [Nonaktifkan]              │
├──────────────────────────────────────────┤
│ [FOTO] Toyota Innova Reborn              │
│        7 Kursi · Automatic · Bensin      │
│        ● Aktif                           │
│                                          │
│        [Edit] [Nonaktifkan]              │
└──────────────────────────────────────────┘
```

---

# 19. Add / Edit Vehicle

Field:

```text
Foto Utama
[ Upload ]

Galeri
[ + Tambah Foto ]

Merek
[ Toyota ]

Model / Tipe
[ Avanza ]

Tahun
[ 2024 ]

Kapasitas
[ 7 ]

Transmisi
[ Manual ▼ ]

Bahan Bakar
[ Bensin ▼ ]

Deskripsi
[........................]

Fasilitas
[........................]

Status
● Aktif
○ Nonaktif

[ Simpan ]
```

### Tidak ada field harga.

---

# 20. Vehicle Data Model

Contoh:

```json
{
  "id": "vehicle_001",
  "brand": "Toyota",
  "model": "Avanza",
  "slug": "toyota-avanza",
  "year": 2024,
  "capacity": 7,
  "transmission": "manual",
  "fuel": "bensin",
  "description": "MPV nyaman untuk kebutuhan keluarga.",
  "features": [
    "AC",
    "Audio",
    "USB Charger"
  ],
  "images": [],
  "status": "active",
  "sort_order": 1
}
```

---

# 21. Vehicle Status

Status:

```text
ACTIVE
INACTIVE
MAINTENANCE
```

### ACTIVE

Ditampilkan di website.

### INACTIVE

Tidak ditampilkan di website.

### MAINTENANCE

Menandakan kendaraan sedang tidak digunakan.

> Status kendaraan bukan status availability berdasarkan tanggal.

---

# 22. Availability / Booking Form

Form digunakan untuk **menanyakan ketersediaan**, bukan pembayaran.

## Required Fields

- Pilih mobil.
- Tanggal mulai.
- Tanggal selesai.
- Lokasi pengambilan.
- Nama lengkap.
- Nomor WhatsApp.

## Optional Fields

- Tujuan.
- Catatan.

---

# 23. Form UI

```text
Cek Ketersediaan

Pilih Mobil
[ Toyota Avanza ▼ ]

Tanggal Mulai
[ 25 Agustus 2026 ]

Tanggal Selesai
[ 27 Agustus 2026 ]

Lokasi Pengambilan
[ Kantor Rental ▼ ]

Tujuan
[ Makassar ]

Nama Lengkap
[ Susi ]

Nomor WhatsApp
[ 08xxxxxxxx ]

Catatan
[....................]

[ 💬 Cek Ketersediaan via WhatsApp ]
```

---

# 24. Form Validation

Validasi:

- Mobil wajib dipilih.
- Tanggal mulai wajib.
- Tanggal selesai wajib.
- Tanggal selesai tidak boleh sebelum tanggal mulai.
- Nama wajib.
- WhatsApp wajib.
- Nomor WhatsApp harus valid.
- Durasi dihitung otomatis.

### Error Example

```text
Silakan pilih mobil terlebih dahulu.
```

```text
Tanggal selesai harus setelah tanggal mulai.
```

```text
Nomor WhatsApp tidak valid.
```

---

# 25. WhatsApp Integration

CTA:

> Cek Ketersediaan via WhatsApp

Website membentuk pesan secara otomatis.

### Template

```text
Halo Admin [Nama Rental],

Saya ingin menanyakan ketersediaan mobil.

Detail kebutuhan saya:

Tipe Mobil      : {mobil}
Tanggal Mulai   : {tanggal_mulai}
Tanggal Selesai : {tanggal_selesai}
Durasi          : {durasi} hari
Lokasi Ambil    : {lokasi}
Tujuan          : {tujuan}

Nama            : {nama}
No. WhatsApp    : {whatsapp}

Catatan         : {catatan}

Mohon informasinya apakah mobil tersebut
tersedia pada tanggal yang saya pilih.

Terima kasih.
```

---

# 26. Availability Rule

Website tidak boleh menyatakan:

> "Mobil tersedia."

jika belum ada inventory real-time.

Gunakan:

> "Cek Ketersediaan"

Customer mengirim inquiry, kemudian admin melakukan pengecekan.

---

# 27. Inquiry Dashboard

Dashboard menyimpan/mencatat inquiry yang masuk melalui website.

Informasi:

- Nama.
- Nomor WhatsApp.
- Mobil.
- Tanggal mulai.
- Tanggal selesai.
- Durasi.
- Lokasi pengambilan.
- Tujuan.
- Catatan.
- Waktu inquiry.
- Status.

### Status

```text
NEW
CHECKING
AVAILABLE
NOT_AVAILABLE
CONFIRMED
COMPLETED
CANCELLED
```

---

# 28. Inquiry Detail

```text
Inquiry #INV-001

Customer
Susi

WhatsApp
08xxxxxxxx

Mobil
Toyota Innova Reborn

Tanggal
25–27 Agustus 2026

Durasi
3 hari

Lokasi
Kantor Rental

Tujuan
Makassar

Status
[ Checking ▼ ]

[ Buka WhatsApp ]
```

---

# 29. Content Management

Admin dapat mengelola konten berikut:

## Profil

- Nama rental.
- Sambutan.
- Tentang kami.
- Foto.

## Keunggulan

- Judul.
- Deskripsi.
- Icon.

## Cara Sewa

- Langkah.
- Judul.
- Deskripsi.

## FAQ

- Pertanyaan.
- Jawaban.

---

# 30. How It Works

Landing page menampilkan empat langkah:

### 01 — Pilih Mobil

Pilih kendaraan yang sesuai.

### 02 — Tentukan Tanggal

Pilih tanggal mulai dan selesai.

### 03 — Cek Ketersediaan

Kirim inquiry melalui WhatsApp.

### 04 — Konfirmasi

Admin memberikan informasi dan memproses booking.

---

# 31. Syarat & Ketentuan

Section harus menjelaskan:

- Identitas penyewa.
- SIM yang berlaku.
- Dokumen pendukung.
- Deposit jika ada.
- Durasi minimum.
- Keterlambatan.
- Penggunaan kendaraan.
- Bahan bakar.
- Kerusakan.
- Pembatalan.
- Area penggunaan.

> Detail final mengikuti kebijakan rental sebenarnya.

---

# 32. Location Management

Dashboard:

```text
Alamat
[................................]

Google Maps URL
[................................]

Latitude
[................................]

Longitude
[................................]

Jam Operasional
[................................]

[ Simpan ]
```

Landing page menampilkan:

- Peta.
- Pin lokasi.
- Alamat.
- Jam operasional.
- Telepon.
- WhatsApp.

CTA:

> Buka di Google Maps

---

# 33. FAQ

Contoh:

### Apakah tersedia sewa mobil lepas kunci?

Ya, tersedia sesuai syarat dan ketentuan rental.

### Bagaimana cara mengetahui mobil tersedia?

Isi form cek ketersediaan dan kirim inquiry melalui WhatsApp.

### Apakah bisa memilih mobil tertentu?

Ya, customer dapat memilih tipe mobil pada form.

### Apakah bisa digunakan untuk luar kota?

Mengikuti kebijakan rental dan kendaraan yang dipilih.

### Apa saja syarat sewa?

Informasi syarat ditampilkan pada halaman Syarat Sewa.

---

# 34. Mobile UX

Mobile-first.

## Bottom Navigation

```text
┌─────────────────────────────────┐
│                                 │
│  🏠       🚗       📅       📍 │
│ Home     Mobil    Booking   Lokasi│
└─────────────────────────────────┘
```

## Sticky CTA

```text
┌─────────────────────────────────┐
│ 💬 Cek Ketersediaan via WhatsApp│
└─────────────────────────────────┘
```

CTA sticky dapat muncul pada halaman detail mobil dan booking.

---

# 35. Mobile Home Structure

```text
Header
  ↓
Hero
  ↓
Cek Ketersediaan
  ↓
Keunggulan
  ↓
Mobil
  ↓
Cara Sewa
  ↓
Syarat
  ↓
Lokasi
  ↓
FAQ
  ↓
Footer
```

---

# 36. Mobile Booking UX

Form menggunakan satu kolom.

```text
Cek Ketersediaan

Pilih Mobil
[ Toyota Avanza ▼ ]

Tanggal Mulai
[ 25/08/2026 ]

Tanggal Selesai
[ 27/08/2026 ]

Lokasi Pengambilan
[ Kantor Rental ]

Tujuan
[ Makassar ]

Nama
[ Susi ]

WhatsApp
[ 08xxxxxxxx ]

[ 💬 Cek Ketersediaan ]
```

---

# 37. Desktop UX

Desktop menggunakan:

- Container maksimal sekitar 1200–1280px.
- Grid vehicle card 3–4 kolom.
- Hero split layout.
- Sticky header.
- Form booking card.
- Map section dua kolom.
- Footer multi-column.

---

# 38. Visual Design Direction

## Style

- Modern.
- Clean.
- Premium.
- Trustworthy.
- Minimal.
- Banyak whitespace.
- Foto kendaraan menjadi visual utama.

## Recommended Colors

```text
Primary Navy   #0B1F33
Secondary Navy #163A5C
Accent Green   #16A34A
Background     #F7F8FA
White          #FFFFFF
Text           #172033
Muted          #667085
Border         #E4E7EC
```

## Typography

Recommended:

- Inter.
- Plus Jakarta Sans.
- Manrope.

---

# 39. UI Components

## Landing Page

```text
Header
Hero
AboutSection
BenefitsSection
VehicleGrid
VehicleCard
VehicleDetail
AvailabilityForm
WhatsAppButton
HowItWorks
RequirementsSection
LocationSection
FAQ
Footer
```

## Dashboard

```text
Sidebar
Topbar
DashboardStats
VehicleTable
VehicleForm
ImageUploader
InquiryTable
InquiryDetail
ContentEditor
LocationForm
SEOForm
SettingsForm
```

---

# 40. Data Relationship

Satu data kendaraan dibuat di dashboard dan digunakan di berbagai bagian website.

```text
Dashboard
    |
    | Create Vehicle
    v
Database
    |
    +----> Homepage Vehicle Grid
    |
    +----> /mobil
    |
    +----> /mobil/[slug]
    |
    +----> Booking Form
    |
    +----> WhatsApp Template
```

Contoh:

```text
Toyota Avanza
```

ditambahkan satu kali.

Kemudian otomatis muncul di:

- Daftar mobil.
- Detail mobil.
- Dropdown form.
- Template WhatsApp.

---

# 41. Admin Dashboard UX

Dashboard harus sederhana untuk admin non-teknis.

Prioritas navigasi:

```text
1. Dashboard
2. Mobil
3. Inquiry
4. Konten
5. Lokasi
6. SEO
7. Settings
```

Fokus utama:

> **Admin dapat menambahkan mobil baru tanpa bantuan developer.**

---

# 42. SEO Strategy

## Primary Keywords

- rental mobil [kota]
- sewa mobil [kota]
- rental mobil lepas kunci [kota]
- sewa mobil lepas kunci [kota]
- sewa mobil tanpa driver [kota]

## Secondary Keywords

- rental mobil murah [kota]
- sewa mobil harian [kota]
- rental mobil terdekat [kota]
- sewa Avanza [kota]
- sewa Innova [kota]
- sewa Fortuner [kota]

Keyword harus disesuaikan dengan kota operasional sebenarnya.

---

# 43. SEO Page Structure

```text
/
├── /mobil
├── /mobil/toyota-avanza
├── /mobil/toyota-innova-reborn
├── /mobil/toyota-fortuner
├── /cara-sewa
├── /syarat-sewa
├── /lokasi
├── /faq
└── /blog
```

---

# 44. Homepage SEO

### Title

```text
Rental Mobil [Kota] | Sewa Mobil Lepas Kunci - [Nama Rental]
```

### Meta Description

```text
Sewa mobil lepas kunci di [Kota] dengan armada terawat. Pilih mobil, tentukan tanggal sewa, dan cek ketersediaan melalui WhatsApp.
```

### H1

```text
Sewa Mobil Lepas Kunci di [Kota]
```

---

# 45. Vehicle Page SEO

Contoh:

```text
URL:
/mobil/toyota-avanza
```

Title:

```text
Sewa Toyota Avanza [Kota] | Rental Mobil Lepas Kunci
```

H1:

```text
Sewa Toyota Avanza di [Kota]
```

Content:

- Deskripsi.
- Spesifikasi.
- Kapasitas.
- Transmisi.
- Bahan bakar.
- Fasilitas.
- Area penggunaan.
- Cara cek ketersediaan.

---

# 46. Local SEO

Website harus menampilkan secara konsisten:

- Nama bisnis.
- Alamat.
- Nomor telepon.
- WhatsApp.
- Jam operasional.
- Area layanan.

Informasi harus konsisten dengan Google Business Profile.

---

# 47. Google Business Profile

Optimalkan:

- Nama bisnis sebenarnya.
- Kategori bisnis yang relevan.
- Deskripsi.
- Foto kantor.
- Foto kendaraan.
- Jam operasional.
- Website.
- Nomor telepon.
- Lokasi.

Review customer asli dapat digunakan sebagai trust signal.

---

# 48. Structured Data

Gunakan structured data yang relevan dan sesuai dengan informasi nyata.

Contoh LocalBusiness:

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "[Nama Rental]",
  "image": "https://domain.com/images/logo.jpg",
  "telephone": "+62XXXXXXXXXX",
  "url": "https://domain.com/",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "[Alamat]",
    "addressLocality": "[Kota]",
    "addressRegion": "[Provinsi]",
    "postalCode": "[Kode Pos]",
    "addressCountry": "ID"
  }
}
```

Jangan menggunakan structured data untuk mengklaim availability yang tidak dapat dibuktikan.

---

# 49. Breadcrumb

Vehicle page:

```text
Beranda
  >
Mobil
  >
Toyota Avanza
```

Breadcrumb membantu user dan search engine memahami struktur halaman.

---

# 50. Internal Linking

Contoh:

```text
Homepage
  ↓
Daftar Mobil
  ↓
Detail Mobil
  ↓
Cara Sewa
  ↓
Syarat Sewa
  ↓
Booking
```

Artikel blog dapat mengarah ke:

```text
Artikel
  ↓
Rekomendasi Mobil
  ↓
Detail Mobil
  ↓
Cek Ketersediaan
```

---

# 51. Image SEO

Gunakan nama file deskriptif:

```text
toyota-avanza-rental-mobil-[kota].webp
```

Bukan:

```text
IMG_1234.jpg
```

Alt text contoh:

```text
Toyota Avanza untuk rental mobil lepas kunci di [Kota]
```

---

# 52. Performance SEO

Gunakan:

- WebP / AVIF.
- Compression.
- Responsive images.
- Lazy loading.
- CDN bila diperlukan.
- Image dimensions.
- Minified CSS/JS.
- Caching.

### Target Core Web Vitals

```text
LCP ≤ 2.5s
INP ≤ 200ms
CLS ≤ 0.1
```

---

# 53. Technical SEO

Wajib:

```text
/sitemap.xml
/robots.txt
```

Selain itu:

- Canonical URL.
- SEO-friendly URLs.
- Meta title.
- Meta description.
- Open Graph.
- Structured data.
- Image alt.
- Mobile responsive.
- HTTPS.
- Search Console.

---

# 54. Content Strategy

Blog dapat dibuat setelah MVP.

Topik:

1. Cara Sewa Mobil Lepas Kunci di [Kota]
2. Syarat Sewa Mobil Lepas Kunci
3. Tips Memilih Mobil Rental untuk Keluarga
4. Perbedaan Lepas Kunci dan Dengan Driver
5. Rekomendasi Mobil untuk Perjalanan Luar Kota
6. Tips Memilih Mobil Rental

Setiap artikel memiliki CTA:

> Lihat Mobil

atau:

> Cek Ketersediaan via WhatsApp

---

# 55. Analytics

Event tracking:

```text
view_home
view_vehicle
select_vehicle
start_booking
submit_booking
click_whatsapp
click_google_maps
click_phone
```

### Primary conversion

```text
click_whatsapp
```

### Secondary conversion

```text
submit_booking
click_google_maps
click_phone
```

---

# 56. SEO Conversion Funnel

```text
Google
  ↓
Landing Page / Vehicle Page
  ↓
Vehicle View
  ↓
Select Vehicle
  ↓
Availability Form
  ↓
WhatsApp
  ↓
Admin
  ↓
Booking
```

SEO success tidak hanya diukur dari ranking.

Tujuan akhirnya adalah:

> Organic traffic → Inquiry → Booking.

---

# 57. Admin SEO Management

Admin dapat mengubah:

### Homepage

- Meta title.
- Meta description.
- OG image.

### Vehicle

- SEO title.
- SEO description.
- Slug.

### Content

- Meta title.
- Meta description.

Developer tetap menangani technical SEO seperti:

- Sitemap.
- Robots.
- Canonical.
- Structured data.
- Performance.

---

# 58. Security Requirements

Dashboard wajib memiliki:

- Authentication.
- Password hashing.
- Session management.
- Role-based access jika diperlukan.
- Protected admin routes.
- Upload validation.
- File type validation.
- File size limits.
- CSRF protection sesuai stack.
- Rate limiting pada endpoint sensitif.

---

# 59. Admin Roles — Future Ready

MVP dapat menggunakan satu role:

```text
ADMIN
```

Future:

```text
OWNER
ADMIN
STAFF
```

Contoh permission:

| Feature | Owner | Admin | Staff |
|---|---:|---:|---:|
| Kelola mobil | ✓ | ✓ | ✓ |
| Hapus mobil | ✓ | ✓ | - |
| Kelola konten | ✓ | ✓ | - |
| Kelola SEO | ✓ | ✓ | - |
| Lihat inquiry | ✓ | ✓ | ✓ |
| Settings | ✓ | - | - |

---

# 60. No Price Policy

Harga tidak disimpan atau ditampilkan pada MVP.

Tidak ada:

```text
price
daily_price
weekly_price
discount
promo_price
```

pada vehicle model MVP.

Admin memberikan informasi harga melalui WhatsApp.

Alasan:

- Harga dapat berubah.
- Harga bisa bergantung pada tanggal.
- Harga bisa bergantung pada durasi.
- Harga bisa dinegosiasikan.
- Mengurangi kebutuhan update website.

---

# 61. Future Availability System

Jika bisnis berkembang, sistem dapat ditingkatkan.

### Current

```text
Customer
  ↓
Inquiry
  ↓
WhatsApp
  ↓
Admin Check
```

### Future

```text
Customer
  ↓
Pilih Mobil
  ↓
Pilih Tanggal
  ↓
System Check Availability
  ↓
Available?
  ├── Yes → Continue
  └── No → Alternative Vehicle
```

Dashboard nantinya dapat memiliki:

```text
Availability Calendar
```

---

# 62. Future Booking System

Fase berikutnya dapat menambahkan:

- Booking ID.
- Calendar.
- Booking status.
- Customer database.
- Payment.
- Deposit.
- Invoice.
- Confirmation.
- Cancellation.
- Rental history.

---

# 63. Responsive Requirements

### Mobile

320px–767px

### Tablet

768px–1023px

### Desktop

1024px+

Website harus berfungsi tanpa horizontal scrolling.

---

# 64. Accessibility

- Semantic HTML.
- Label form jelas.
- Alt text.
- Keyboard navigation.
- Focus state.
- Kontras memadai.
- Button memiliki label yang jelas.
- Error message mudah dipahami.

---

# 65. Performance Requirements

Target:

- Fast initial load.
- Hero image optimized.
- Lazy loading image.
- Minified assets.
- Browser caching.
- CDN bila diperlukan.
- Minimal third-party scripts.

---

# 66. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Customer dapat melihat profil | High |
| FR-02 | Customer dapat melihat armada | High |
| FR-03 | Customer dapat melihat detail mobil | High |
| FR-04 | Admin dapat menambah mobil | Critical |
| FR-05 | Admin dapat edit mobil | Critical |
| FR-06 | Admin dapat upload foto | Critical |
| FR-07 | Admin dapat mengaktifkan/nonaktifkan mobil | Critical |
| FR-08 | Customer dapat memilih mobil | Critical |
| FR-09 | Customer dapat memilih tanggal | Critical |
| FR-10 | Customer dapat mengisi data | Critical |
| FR-11 | Website memvalidasi form | Critical |
| FR-12 | Website membuat WhatsApp template | Critical |
| FR-13 | Customer dapat membuka WhatsApp | Critical |
| FR-14 | Admin dapat melihat inquiry | High |
| FR-15 | Admin dapat mengubah konten | High |
| FR-16 | Admin dapat mengubah lokasi | High |
| FR-17 | Admin dapat mengatur SEO dasar | High |
| FR-18 | Customer dapat melihat Google Maps | High |
| FR-19 | Website responsive | Critical |
| FR-20 | Website memiliki SEO technical foundation | High |

---

# 67. Non-Functional Requirements

## Performance

LCP target ≤ 2.5 detik.

## Availability

Website production harus memiliki uptime yang sesuai kebutuhan bisnis.

## Security

Admin area wajib terlindungi authentication.

## Scalability

Arsitektur harus memungkinkan penambahan:

- Kendaraan.
- Admin.
- Inquiry.
- Availability.
- Booking.

---

# 68. Content Requirements

Owner menyediakan:

## Company

- Logo.
- Nama.
- Sambutan.
- Profil.
- Foto kantor.
- Alamat.
- WhatsApp.
- Telepon.
- Email.
- Jam operasional.
- Google Maps.

## Vehicle

Setiap mobil membutuhkan:

- Foto.
- Merek.
- Model.
- Tahun.
- Kapasitas.
- Transmisi.
- Bahan bakar.
- Deskripsi.
- Fasilitas.

---

# 69. Mockup Requirements

Mockup harus dibuat sebagai satu sistem yang saling terhubung.

## Mockup 1 — Landing Page Desktop

Menampilkan:

- Header.
- Hero.
- Profil.
- Keunggulan.
- Vehicle grid.
- Cara sewa.
- Syarat.
- Lokasi.
- FAQ.
- Footer.

## Mockup 2 — Landing Page Mobile

Menampilkan:

- Mobile header.
- Hero.
- Vehicle cards.
- Booking CTA.
- Sticky WhatsApp CTA.
- Bottom navigation.

## Mockup 3 — Vehicle Detail

Menampilkan:

- Foto besar.
- Galeri.
- Spesifikasi.
- Deskripsi.
- CTA cek ketersediaan.

## Mockup 4 — Booking Form

Menampilkan:

- Mobil terpilih.
- Tanggal.
- Lokasi.
- Customer data.
- WhatsApp CTA.

## Mockup 5 — WhatsApp Preview

Menampilkan pesan template hasil form.

## Mockup 6 — Admin Dashboard

Menampilkan:

- Sidebar.
- Statistik.
- Inquiry terbaru.
- Jumlah mobil.

## Mockup 7 — Admin Vehicle List

Menampilkan:

- Daftar mobil.
- Status.
- Edit.
- Nonaktifkan.
- Tambah mobil.

## Mockup 8 — Admin Add/Edit Vehicle

Menampilkan:

- Upload foto.
- Data kendaraan.
- Status.
- Save.

---

# 70. Mockup Data Consistency

Mockup harus menggunakan data contoh yang sama.

Contoh:

```text
Toyota Avanza
7 Kursi
Manual
Bensin
```

Data tersebut harus muncul konsisten pada:

1. Dashboard.
2. Landing page.
3. Vehicle detail.
4. Booking form.
5. WhatsApp template.

Dengan demikian mockup merepresentasikan hubungan sistem yang sebenarnya.

---

# 71. Design System

## Buttons

Primary:

```text
[ Cek Ketersediaan ]
```

Secondary:

```text
[ Lihat Mobil ]
```

WhatsApp:

```text
[ 💬 Cek Ketersediaan via WhatsApp ]
```

## Cards

- Radius 16–20px.
- Border subtle.
- Shadow ringan.
- Image ratio konsisten.

## Forms

- Label selalu terlihat.
- Input tinggi minimal sekitar 44–48px.
- Error inline.
- CTA jelas.

---

# 72. MVP Release Scope

## Phase 1 — MVP

### Customer

- [ ] Landing page.
- [ ] Profil.
- [ ] Keunggulan.
- [ ] Vehicle listing.
- [ ] Vehicle detail.
- [ ] Booking form.
- [ ] WhatsApp integration.
- [ ] Cara sewa.
- [ ] Syarat.
- [ ] Lokasi.
- [ ] FAQ.
- [ ] Mobile responsive.
- [ ] SEO foundation.

### Admin

- [ ] Login.
- [ ] Dashboard.
- [ ] CRUD mobil.
- [ ] Upload foto.
- [ ] Vehicle status.
- [ ] Inquiry.
- [ ] Content management.
- [ ] Location management.
- [ ] SEO basic management.

---

# 73. Phase 2

- Availability calendar.
- Booking management.
- Customer database.
- Booking history.
- Admin roles.
- Promo management.
- Analytics dashboard.

---

# 74. Phase 3

- Payment gateway.
- Deposit management.
- Invoice.
- Automatic booking confirmation.
- Dynamic pricing.
- Customer account.
- Online booking.
- Availability automation.

---

# 75. Success Metrics

## Primary KPI

### WhatsApp Inquiry Conversion

```text
Jumlah klik WhatsApp
-------------------- × 100%
Jumlah visitor
```

## Secondary KPI

- Organic traffic.
- WhatsApp clicks.
- Form completion.
- Vehicle detail views.
- Inquiry volume.
- Booking conversion.
- Google Maps clicks.
- Phone clicks.

---

# 76. Acceptance Criteria — Customer

- [ ] Customer memahami bahwa layanan adalah rental mobil lepas kunci.
- [ ] Customer dapat melihat daftar mobil.
- [ ] Customer dapat melihat detail kendaraan.
- [ ] Customer dapat memilih mobil.
- [ ] Customer dapat memilih tanggal.
- [ ] Customer dapat mengisi lokasi pengambilan.
- [ ] Customer dapat mengisi nama.
- [ ] Customer dapat mengisi WhatsApp.
- [ ] Form memiliki validasi.
- [ ] Template WhatsApp dibuat otomatis.
- [ ] WhatsApp terbuka dengan data yang benar.
- [ ] Customer dapat melihat lokasi kantor.
- [ ] Website nyaman digunakan di mobile.
- [ ] Harga tidak ditampilkan pada MVP.

---

# 77. Acceptance Criteria — Admin

- [ ] Admin dapat login.
- [ ] Admin dapat melihat dashboard.
- [ ] Admin dapat melihat daftar mobil.
- [ ] Admin dapat menambah mobil.
- [ ] Admin dapat upload foto.
- [ ] Admin dapat edit mobil.
- [ ] Admin dapat menghapus/nonaktifkan mobil.
- [ ] Perubahan mobil muncul di landing page.
- [ ] Admin dapat melihat inquiry.
- [ ] Admin dapat mengubah status inquiry.
- [ ] Admin dapat mengubah konten.
- [ ] Admin dapat mengubah lokasi.
- [ ] Admin dapat mengatur SEO dasar.

---

# 78. Acceptance Criteria — SEO

- [ ] Homepage memiliki unique title.
- [ ] Homepage memiliki meta description.
- [ ] Vehicle page memiliki title unik.
- [ ] Vehicle page memiliki description unik.
- [ ] H1/H2/H3 terstruktur.
- [ ] URL SEO-friendly.
- [ ] Sitemap tersedia.
- [ ] Robots tersedia.
- [ ] Canonical diterapkan.
- [ ] Structured data diterapkan sesuai kebutuhan.
- [ ] Image alt tersedia.
- [ ] Google Search Console dapat digunakan.
- [ ] Analytics terpasang.
- [ ] Mobile SEO diperhatikan.

---

# 79. Final System Flow

```text
                         OWNER / ADMIN
                               |
                               v
                    ┌─────────────────────┐
                    │   ADMIN DASHBOARD   │
                    ├─────────────────────┤
                    │                     │
                    │ Kelola Mobil        │
                    │ Kelola Inquiry      │
                    │ Kelola Konten       │
                    │ Kelola Lokasi       │
                    │ Kelola SEO          │
                    │                     │
                    └─────────┬───────────┘
                              |
                         DATABASE
                              |
                              v
                    ┌─────────────────────┐
                    │    LANDING PAGE     │
                    ├─────────────────────┤
                    │                     │
                    │ Profil              │
                    │ Armada              │
                    │ Detail Mobil        │
                    │ Cara Sewa            │
                    │ Syarat              │
                    │ Lokasi              │
                    │ FAQ                 │
                    │                     │
                    └─────────┬───────────┘
                              |
                        CUSTOMER
                              |
                              v
                    ┌─────────────────────┐
                    │ AVAILABILITY FORM   │
                    ├─────────────────────┤
                    │ Mobil               │
                    │ Tanggal             │
                    │ Lokasi              │
                    │ Nama                │
                    │ WhatsApp            │
                    └─────────┬───────────┘
                              |
                              v
                    ┌─────────────────────┐
                    │      WHATSAPP       │
                    │                     │
                    │ Inquiry Template    │
                    └─────────┬───────────┘
                              |
                              v
                           ADMIN
                              |
                              v
                     KONFIRMASI BOOKING
```

---

# 80. Core Product Principles

### Principle 1

> **Dashboard adalah sumber data armada.**

Admin tidak perlu mengedit kode untuk menambah mobil.

### Principle 2

> **Landing page adalah storefront.**

Customer melihat informasi yang sudah dikelola admin.

### Principle 3

> **WhatsApp adalah channel inquiry utama.**

Website tidak melakukan booking/payment otomatis pada MVP.

### Principle 4

> **Tidak menampilkan harga.**

Harga dikomunikasikan oleh admin melalui WhatsApp.

### Principle 5

> **Tidak mengklaim real-time availability.**

Ketersediaan dikonfirmasi oleh admin.

### Principle 6

> **Mobile-first.**

Customer harus dapat melakukan seluruh journey dari smartphone.

### Principle 7

> **SEO dan conversion berjalan bersama.**

Traffic Google harus diarahkan menuju inquiry WhatsApp.

---

# 81. Final Product Definition

Produk final dapat diringkas menjadi:

```text
                 RENTAL MOBIL
                       |
          ┌────────────┴────────────┐
          |                         |
       CUSTOMER                    ADMIN
          |                         |
          v                         v
    LANDING PAGE              DASHBOARD
          |                         |
          |                    Kelola Mobil
          |                    Kelola Inquiry
          |                    Kelola Konten
          |                    Kelola SEO
          |                         |
          └──────────┬──────────────┘
                     |
                     v
                  WHATSAPP
                     |
                     v
                KONFIRMASI
                     |
                     v
                  BOOKING
```

## Core Customer CTA

**Cek Ketersediaan via WhatsApp**

## Core Admin CTA

**Tambah Mobil**

## Core Business Objective

**Mengubah pengunjung website menjadi calon penyewa mobil melalui inquiry WhatsApp.**

## Core Technical Principle

**Data mobil dikelola melalui dashboard dan secara otomatis digunakan oleh landing page, detail kendaraan, form inquiry, dan template WhatsApp.**
