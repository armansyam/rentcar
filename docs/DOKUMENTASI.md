# 📚 Dokumentasi Teknis & Panduan Arsitektur RentCar

Dokumentasi ini menjelaskan secara mendalam mengenai arsitektur sistem, skema database, format integrasi WhatsApp, dan endpoint REST API untuk platform **RentCar**.

---

## 1. Arsitektur Data & Skema Database SQLite

Database disimpan secara persisten di berkas `data/rentcar.db` menggunakan driver `better-sqlite3` dengan mode **WAL (Write-Ahead Logging)** untuk konkurensi tinggi.

### Tabel `cars` (Manajemen Armada)
| Kolom | Tipe | Keterangan |
| :--- | :--- | :--- |
| `id` | `TEXT PRIMARY KEY` | ID unik kendaraan (contoh: `car-01`) |
| `brand` | `TEXT NOT NULL` | Merek mobil (contoh: `Toyota`, `Honda`) |
| `model` | `TEXT NOT NULL` | Model kendaraan (contoh: `Avanza`, `Innova Reborn`) |
| `slug` | `TEXT UNIQUE NOT NULL`| Slug URL untuk SEO (contoh: `toyota-avanza`) |
| `year` | `INTEGER NOT NULL` | Tahun perakitan (contoh: `2024`) |
| `capacity` | `INTEGER NOT NULL` | Jumlah kursi penumpang (contoh: `7`) |
| `transmission` | `TEXT NOT NULL` | `Manual` atau `Matic` |
| `fuel` | `TEXT NOT NULL` | `Bensin`, `Diesel`, `Hybrid`, `Listrik` |
| `price_per_day`| `INTEGER NOT NULL` | Tarif harian per 24 jam dalam Rupiah |
| `category` | `TEXT NOT NULL` | `MPV`, `SUV`, `City Car`, `Luxury` |
| `description` | `TEXT` | Deskripsi keunggulan kendaraan |
| `features` | `TEXT` (JSON Array) | Daftar fitur (AC Double Blower, Airbag, dll) |
| `image_url` | `TEXT NOT NULL` | Path foto utama (`/images/cars/toyota-avanza.jpg`) |
| `gallery` | `TEXT` (JSON Array) | Path galeri foto pendukung |
| `status` | `TEXT NOT NULL` | `active` (tampil di web), `inactive`, `maintenance` |
| `sort_order` | `INTEGER DEFAULT 0`| Urutan prioritas tampil di katalog |

### Tabel `inquiries` (Log Formulir Pemesanan)
| Kolom | Tipe | Keterangan |
| :--- | :--- | :--- |
| `id` | `TEXT PRIMARY KEY` | ID unik inquiry (contoh: `inq-1787468425412`) |
| `invoice_no` | `TEXT UNIQUE NOT NULL`| Nomor invoice ringkas (contoh: `INV-425412`) |
| `car_id` | `TEXT` | ID mobil yang dipilih (Foreign Key ke `cars.id`) |
| `car_name` | `TEXT NOT NULL` | Nama mobil saat pengajuan |
| `start_date` | `TEXT NOT NULL` | Tanggal mulai sewa (format: `DD/MM/YYYY`) |
| `end_date` | `TEXT NOT NULL` | Tanggal selesai sewa (format: `DD/MM/YYYY`) |
| `duration_days`| `INTEGER NOT NULL` | Durasi pemakaian dalam hari |
| `pickup_location` | `TEXT NOT NULL` | Lokasi serah terima / penjemputan armada |
| `destination`| `TEXT` | Kota tujuan pemakaian (opsional) |
| `customer_name`| `TEXT NOT NULL` | Nama lengkap customer |
| `customer_phone`| `TEXT NOT NULL` | Nomor WhatsApp customer |
| `notes` | `TEXT` | Catatan khusus customer |
| `status` | `TEXT NOT NULL` | `NEW`, `CHECKING`, `AVAILABLE`, `CONFIRMED`, `COMPLETED`, `CANCELLED` |

### Tabel `settings` (Pengaturan Web & Profil)
Menyimpan key-value pair konfigurasi:
* `company_name`, `company_tagline`
* `admin_whatsapp` (Nomor tujuan inquiry)
* `office_name`, `office_address`, `company_phone`, `company_email`
* `google_maps_url`, `operational_hours`
* `hero_badge`, `hero_title`, `hero_subtitle`, `about_title`, `about_text`
* `meta_title`, `meta_description`

---

## 2. Format Template WhatsApp

Pesan yang dihasilkan secara otomatis saat form disubmit mengikuti format terstruktur:

```text
Halo Admin RentCar,

Saya ingin menanyakan ketersediaan mobil.

Berikut detail pemesanan saya:
• Tipe Mobil      : Toyota Innova Reborn
• Tanggal Mulai   : 25/08/2026
• Tanggal Selesai : 28/08/2026
• Durasi          : 3 hari
• Lokasi Ambil    : Kantor RentCar, Bandung
• Tujuan          : Lembang
• Nama            : Ahmad Subandi
• No. WhatsApp    : 081234567890

Catatan           : Tolong siapkan charger hp

Mohon informasinya apakah mobil tersebut tersedia pada tanggal yang saya pilih.

Terima kasih.
```

Tautan redirect dibentuk secara aman:
`https://wa.me/{nomor_admin}?text={encoded_message}`

---

## 3. Dokumentasi REST API

### 🚗 Mobil (`/api/cars`)
* **`GET /api/cars`**: Mengambil daftar mobil aktif.
  * *Query params:* `category` (`MPV`, `SUV`, dll), `all=true` (untuk admin).
* **`POST /api/cars`**: Menambah mobil baru ke database.
* **`GET /api/cars/:id`**: Mengambil detail mobil berdasarkan ID atau Slug.
* **`PUT /api/cars/:id`**: Memperbarui data mobil.
* **`DELETE /api/cars/:id`**: Menghapus mobil dari database.

### 📋 Inquiries (`/api/inquiries`)
* **`GET /api/inquiries`**: Mengambil seluruh log inquiry (terurut dari yang terbaru).
* **`POST /api/inquiries`**: Menyimpan inquiry baru dari formulir website.
* **`PATCH /api/inquiries/:id`**: Memperbarui status inquiry (`NEW` $\rightarrow$ `CONFIRMED` $\rightarrow$ `COMPLETED`).
* **`DELETE /api/inquiries/:id`**: Menghapus data log inquiry.

### ⚙️ Pengaturan (`/api/settings`)
* **`GET /api/settings`**: Mengambil seluruh variabel pengaturan publik.
* **`PUT /api/settings`**: Memperbarui pengaturan profil, kontak, dan SEO.

### 🔐 Autentikasi Admin (`/api/auth`)
* **`POST /api/auth`**: Memvalidasi login dan membuat cookie sesi `admin_session`.
* **`GET /api/auth`**: Memeriksa status sesi login admin.
* **`DELETE /api/auth`**: Logout dan menghapus cookie sesi.

---

## 4. Panduan Pemeliharaan (Maintenance)

### Backup Database SQLite
Untuk mencadangkan data armada dan inquiry:
```bash
cp data/rentcar.db data/rentcar_backup_$(date +%F).db
```

### Mengganti Foto Mobil Manual
Letakkan foto baru di `public/images/cars/`, lalu masukkan path gambar tersebut (misal `/images/cars/nama-foto.jpg`) di form tambah/edit mobil dashboard admin.
