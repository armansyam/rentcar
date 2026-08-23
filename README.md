# 🚗 RentCar — Platform Rental Mobil Lepas Kunci

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue?style=flat&logo=react)](https://react.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL_Mode-003B57?style=flat&logo=sqlite)](https://sqlite.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Platform digital responsif modern untuk bisnis **penyewaan mobil lepas kunci (self-drive)** dengan integrasi **WhatsApp Inquiry Otomatis**, **Admin Management Dashboard**, dan penyimpanan database relasional **SQLite**.

---

## 📸 Tampilan & Fitur Utama

- **100% Desain Bersih & Bebas Emoji:** Menggunakan icon vektor garis SVG murni (*Lucide*) untuk seluruh indikator (kursi, transmisi, bensin, pin peta, kalender, dll) sesuai standar visual mockup.
- **Mobile-First UX:** Dilengkapi *Sticky Mobile Bottom Navigation* (*Beranda, Mobil, Booking, Lokasi, Tentang*).
- **Katalog Armada Dinamis:** Filter kategori (*Semua, MPV, SUV, City Car, Luxury*), spesifikasi detail, tarif harian, dan galeri foto resolusi tinggi.
- **Formulir Booking & Live WhatsApp Preview:** Menghitung durasi hari secara otomatis, memvalidasi form, dan menampilkan live preview pesan chat WhatsApp yang akan dikirim ke admin.
- **Pencatatan Invoice Otomatis:** Setiap kali customer mengklik *"Kirim via WhatsApp"*, sistem otomatis mencatat data inquiry dengan nomor invoice unik (misal: `INV-425412`) ke database SQLite sebelum membuka WhatsApp admin.
- **Admin Dashboard Lengkap (`/admin`):**
  - **Overview Stats:** Total armada, inquiry baru, dan status sistem.
  - **CRUD Armada Mobil:** Tambah mobil baru, edit spesifikasi, ubah foto/preset, dan atur status (*Aktif / Nonaktif / Maintenance*).
  - **Log Inquiry:** Memantau daftar pengajuan sewa, update status (*New, Checking, Available, Confirmed, Cancelled*), dan tombol langsung chat ke WhatsApp customer.
  - **Manajemen Konten & SEO:** Mengubah profil rental, alamat kantor, jam operasional, link Google Maps, dan meta tag SEO.

---

## 🏛️ Struktur Direktori Proyek

```text
rentcar/
├── data/                        # Database SQLite lokal (rentcar.db)
├── docs/                        # Dokumentasi teknis & panduan lengkap
│   └── DOKUMENTASI.md
├── public/                      # Aset statis publik
│   ├── favicon.png              # Favicon tab browser
│   ├── apple-touch-icon.png     # Icon bookmark mobile
│   ├── images/
│   │   ├── logo.png             # Logo utama RentCar
│   │   ├── logo-icon.png        # Icon emblem mobil
│   │   ├── cars/                # Foto mobil katalog studio
│   │   ├── hero/                # Foto SUV banner hero
│   │   └── avatars/             # Foto testimonial pelanggan
│   ├── js/watermark.js          # AMS Dynamic Watermark script
│   ├── robots.txt & sitemap.xml # Technical SEO
├── src/
│   ├── app/                     # Next.js 14 App Router
│   │   ├── layout.tsx           # Root Layout (Font, SEO, Watermark)
│   │   ├── page.tsx             # Homepage Dinamis
│   │   ├── mobil/               # Katalog & Detail Kendaraan (/mobil/[slug])
│   │   ├── cara-sewa/           # Halaman Cara & Syarat Sewa
│   │   ├── lokasi/              # Halaman Lokasi Kantor & Kontak
│   │   ├── admin/               # Admin Panel (Dashboard, Mobil, Inquiry, Konten, SEO)
│   │   └── api/                 # REST API (cars, inquiries, settings, auth)
│   ├── components/              # Komponen Antarmuka Reusable
│   │   ├── home/                # Hero, About, VehicleGrid, BookingForm, Terms, FAQ
│   │   ├── layout/              # Navbar, Mobile BottomNav, Footer
│   │   ├── vehicle/             # VehicleCard
│   │   └── ui/Icons.tsx         # Kumpulan Icon Vektor SVG Bersih
│   ├── lib/
│   │   ├── db.ts                # Inisialisasi SQLite & Seeder Awal
│   │   └── whatsapp.ts          # Generator Template WhatsApp
│   └── styles/globals.css       # Design System & Styling
├── .env.example                 # Template Environment Variables
├── deploy.sh                    # Script Otomasi Deployment Produksi
├── package.json
└── tailwind.config.ts
```

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

### 1. Kloning Repository
```bash
git clone https://github.com/armansyam/rentcar.git
cd rentcar
```

### 2. Jalankan Mode Pengembangan (Local Development)
```bash
# Install dependensi
npm install

# Jalankan server development
npm run dev
```
Buka browser di: [http://localhost:3000](http://localhost:3000)

---

## 🌐 Panduan Deployment di Server Produksi (Linux / VPS)

Proyek ini telah dilengkapi script otomasi [`./deploy.sh`](deploy.sh) dengan deteksi tabrakan port cerdas (*smart port collision detection*):

```bash
# 1. Jalankan script deploy (default port 3000)
./deploy.sh

# 2. Atau tentukan custom port secara dinamis (contoh port 3005)
./deploy.sh 3005
```

Script akan secara otomatis:
1. Menarik commit terbaru dari Git (`git pull`).
2. Menyiapkan direktori database `data/` dan aset gambar `public/images/`.
3. Menginstall dependensi dan mem-build Next.js (`npm run build`).
4. Mengelola service aplikasi di latar belakang menggunakan **PM2**.

---

## 🔑 Akses Portal Admin

- **URL Dashboard:** `http://localhost:3000/admin`
- **Username Default:** `admin`
- **Password Default:** `admin123`

*(Password dan nomor WhatsApp penerima inquiry dapat diubah sewaktu-waktu melalui menu **Pengaturan & SEO** di dalam dashboard admin).*

---

## 🛡️ Konfigurasi Nginx Reverse Proxy (Opsional)

Jika menggunakan Nginx di server Linux, arahkan traffic domain ke port aplikasi:

```nginx
server {
    listen 80;
    server_name rentcar.domainanda.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    client_max_body_size 15M;
}
```

---

## 📜 Lisensi & Pengembang

Dikembangkan oleh **Arman Syam (AmsDev)**. Hak Cipta dilindungi undang-undang.
