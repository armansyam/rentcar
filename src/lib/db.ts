import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database file stored in data/ directory inside project
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'rentcar.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency and performance
db.pragma('journal_mode = WAL');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS cars (
    id TEXT PRIMARY KEY,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    year INTEGER NOT NULL,
    capacity INTEGER NOT NULL,
    transmission TEXT NOT NULL,
    fuel TEXT NOT NULL,
    price_per_day INTEGER NOT NULL DEFAULT 0,
    category TEXT NOT NULL DEFAULT 'MPV',
    description TEXT,
    features TEXT, -- JSON array of strings
    image_url TEXT NOT NULL,
    gallery TEXT, -- JSON array of strings
    status TEXT NOT NULL DEFAULT 'active', -- active, inactive, maintenance
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS inquiries (
    id TEXT PRIMARY KEY,
    invoice_no TEXT UNIQUE NOT NULL,
    car_id TEXT,
    car_name TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    duration_days INTEGER NOT NULL,
    pickup_location TEXT NOT NULL,
    destination TEXT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'NEW', -- NEW, CHECKING, AVAILABLE, CONFIRMED, ACTIVE_RENTAL, COMPLETED, CANCELLED
    dp_amount INTEGER DEFAULT 0,
    deposit_amount INTEGER DEFAULT 0,
    total_price INTEGER DEFAULT 0,
    odometer_start INTEGER DEFAULT 0,
    odometer_end INTEGER DEFAULT 0,
    overtime_hours INTEGER DEFAULT 0,
    overtime_fee INTEGER DEFAULT 0,
    fuel_charge INTEGER DEFAULT 0,
    damage_charge INTEGER DEFAULT 0,
    payment_method_dp TEXT DEFAULT 'Transfer BCA',
    payment_method_final TEXT DEFAULT 'Transfer BCA',
    payment_method_deposit TEXT DEFAULT 'Transfer BCA',
    payment_status TEXT DEFAULT 'UNPAID', -- UNPAID, DP_PAID, FULLY_PAID
    deposit_status TEXT DEFAULT 'HELD', -- HELD, DEDUCTED, REFUNDED
    notes_admin TEXT,
    actual_return_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(car_id) REFERENCES cars(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// Safe migrations for existing inquiries table columns
try {
  const existingCols = (db.prepare('PRAGMA table_info(inquiries)').all() as any[]).map((c) => c.name);
  const newCols = [
    { name: 'dp_amount', type: 'INTEGER DEFAULT 0' },
    { name: 'deposit_amount', type: 'INTEGER DEFAULT 0' },
    { name: 'total_price', type: 'INTEGER DEFAULT 0' },
    { name: 'odometer_start', type: 'INTEGER DEFAULT 0' },
    { name: 'odometer_end', type: 'INTEGER DEFAULT 0' },
    { name: 'overtime_hours', type: 'INTEGER DEFAULT 0' },
    { name: 'overtime_fee', type: 'INTEGER DEFAULT 0' },
    { name: 'fuel_charge', type: 'INTEGER DEFAULT 0' },
    { name: 'damage_charge', type: 'INTEGER DEFAULT 0' },
    { name: 'payment_method_dp', type: "TEXT DEFAULT 'Transfer BCA'" },
    { name: 'payment_method_final', type: "TEXT DEFAULT 'Transfer BCA'" },
    { name: 'payment_method_deposit', type: "TEXT DEFAULT 'Transfer BCA'" },
    { name: 'payment_status', type: "TEXT DEFAULT 'UNPAID'" },
    { name: 'deposit_status', type: "TEXT DEFAULT 'HELD'" },
    { name: 'notes_admin', type: 'TEXT' },
    { name: 'actual_return_date', type: 'TEXT' },
  ];

  for (const col of newCols) {
    if (!existingCols.includes(col.name)) {
      try {
        db.exec(`ALTER TABLE inquiries ADD COLUMN ${col.name} ${col.type}`);
      } catch (err) {
        // column already exists
      }
    }
  }
} catch (e) {
  // ignore
}

// Seed initial default settings if empty
const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
if (settingsCount.count === 0) {
  const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
  
  const defaultSettings: [string, string][] = [
    ['company_name', 'RentCar'],
    ['company_tagline', 'Sewa Mobil Terpercaya'],
    ['hero_badge', 'Rental Mobil Lepas Kunci'],
    ['hero_title', 'Sewa Mobil Nyaman, Bebas Atur Perjalanan'],
    ['hero_subtitle', 'Solusi penyewaan mobil untuk kebutuhan pribadi, liburan, bisnis, atau perjalanan keluarga Anda.'],
    ['about_title', 'Tentang Kami'],
    ['about_text', 'Kami menyediakan layanan penyewaan mobil lepas kunci dengan kondisi prima dan harga kompetitif. Nikmati kebebasan berkendara kapanpun dan kemanapun Anda mau.'],
    ['admin_whatsapp', '6281234567890'],
    ['company_phone', '0812-3456-7890'],
    ['company_email', 'info@rentcar.id'],
    ['office_name', 'RentCar Office'],
    ['office_address', 'Jl. Merdeka No.123, Sukajadi, Kec. Sukajadi, Kota Bandung, Jawa Barat 40161'],
    ['google_maps_url', 'https://maps.google.com/?q=Bandung'],
    ['operational_hours', 'Senin - Minggu: 07.00 - 22.00 WIB'],
    ['admin_password', 'admin123'],
    ['meta_title', 'Rental Mobil Bandung | Sewa Mobil Lepas Kunci - RentCar'],
    ['meta_description', 'Sewa mobil lepas kunci di Bandung dengan armada terawat. Pilih mobil, tentukan tanggal sewa, dan cek ketersediaan melalui WhatsApp.'],
  ];

  const insertMany = db.transaction((settings: [string, string][]) => {
    for (const [key, val] of settings) {
      insertSetting.run(key, val);
    }
  });

  insertMany(defaultSettings);
}

// Seed initial sample cars if table is empty
const carsCount = db.prepare('SELECT COUNT(*) as count FROM cars').get() as { count: number };
if (carsCount.count === 0) {
  const insertCar = db.prepare(`
    INSERT INTO cars (id, brand, model, slug, year, capacity, transmission, fuel, price_per_day, category, description, features, image_url, gallery, status, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialCars = [
    {
      id: 'car-01',
      brand: 'Toyota',
      model: 'Avanza',
      slug: 'toyota-avanza',
      year: 2024,
      capacity: 7,
      transmission: 'Manual',
      fuel: 'Bensin',
      price_per_day: 350000,
      category: 'MPV',
      description: 'MPV serbaguna keluarga paling populer di Indonesia. Nyaman, irit bahan bakar, kabin lapang dengan 7 kursi, cocok untuk perjalanan dalam dan luar kota.',
      features: JSON.stringify(['AC Double Blower', 'Audio Bluetooth / Touchscreen', 'Dual SRS Airbag', 'USB Fast Charger', 'Power Steering', 'Kamera Parkir']),
      image_url: '/images/cars/toyota-avanza.jpg',
      gallery: JSON.stringify(['/images/cars/toyota-avanza.jpg']),
      status: 'active',
      sort_order: 1,
    },
    {
      id: 'car-02',
      brand: 'Toyota',
      model: 'Innova Reborn',
      slug: 'toyota-innova-reborn',
      year: 2024,
      capacity: 7,
      transmission: 'Manual',
      fuel: 'Bensin',
      price_per_day: 550000,
      category: 'MPV',
      description: 'Kendaraan medium MPV dengan kenyamanan kelas atas. Suspensi empuk, kabin senyap, tenaga responsif, dan sangat stabil untuk perjalanan jarak jauh.',
      features: JSON.stringify(['AC Digital Climate Control', 'Head Unit Apple CarPlay / Android Auto', 'Captain Seat / 7 Seater', 'Vehicle Stability Control', 'Rear Seat Entertainment', 'Wireless Charging']),
      image_url: '/images/cars/toyota-innova-reborn.jpg',
      gallery: JSON.stringify(['/images/cars/toyota-innova-reborn.jpg']),
      status: 'active',
      sort_order: 2,
    },
    {
      id: 'car-03',
      brand: 'Honda',
      model: 'Mobilio',
      slug: 'honda-mobilio',
      year: 2023,
      capacity: 7,
      transmission: 'Manual',
      fuel: 'Bensin',
      price_per_day: 350000,
      category: 'MPV',
      description: 'Low MPV sporty dari Honda dengan performa mesin i-VTEC yang bertenaga namun tetap efisien. Handling lincah dan bagasi fleksibel.',
      features: JSON.stringify(['AC Digital', 'Audio Touchscreen & Bluetooth', 'Dual SRS Airbag', 'ABS + EBD', 'Eco Indicator', 'Tilt Steering']),
      image_url: '/images/cars/honda-mobilio.jpg',
      gallery: JSON.stringify(['/images/cars/honda-mobilio.jpg']),
      status: 'active',
      sort_order: 3,
    },
    {
      id: 'car-04',
      brand: 'Toyota',
      model: 'Fortuner',
      slug: 'toyota-fortuner',
      year: 2024,
      capacity: 7,
      transmission: 'Matic',
      fuel: 'Diesel',
      price_per_day: 1200000,
      category: 'SUV',
      description: 'High SUV tangguh dan gagah. Mesin diesel bertenaga melimpah, ground clearance tinggi, siap melibas segala medan perjalanan dengan penuh prestise.',
      features: JSON.stringify(['Transmisi Otomatis Sequential', 'Power Backdoor with Kick Sensor', 'Jok Kulit Premium Elektrik', 'Drive Mode (Eco/Normal/Sport)', 'Kamera 360 Derajat', 'Fitur Keselamatan TSS']),
      image_url: '/images/cars/toyota-fortuner.jpg',
      gallery: JSON.stringify(['/images/cars/toyota-fortuner.jpg']),
      status: 'active',
      sort_order: 4,
    },
    {
      id: 'car-05',
      brand: 'Honda',
      model: 'Brio',
      slug: 'honda-brio',
      year: 2024,
      capacity: 5,
      transmission: 'Matic',
      fuel: 'Bensin',
      price_per_day: 300000,
      category: 'City Car',
      description: 'City car kompak dan sangat lincah untuk menyusuri jalanan kota. Sangat hemat bahan bakar, mudah parkir, dan tetap nyaman untuk 5 penumpang.',
      features: JSON.stringify(['Transmisi Otomatis CVT', 'Audio Touchscreen', 'Electric Power Steering', 'Dual Airbags', 'Fog Lamps', 'Keyless Entry']),
      image_url: '/images/cars/honda-brio.jpg',
      gallery: JSON.stringify(['/images/cars/honda-brio.jpg']),
      status: 'active',
      sort_order: 5,
    },
    {
      id: 'car-06',
      brand: 'Toyota',
      model: 'Alphard',
      slug: 'toyota-alphard',
      year: 2024,
      capacity: 7,
      transmission: 'Matic',
      fuel: 'Bensin',
      price_per_day: 2500000,
      category: 'Luxury',
      description: 'VIP Executive Van kelas tertinggi. Memberikan kenyamanan seperti berada di kabin pesawat first class untuk tamu penting, acara pernikahan, atau kebutuhan eksekutif.',
      features: JSON.stringify(['Ottoman Captain Seats dengan Pemanas & Pendingin', 'Dual Sunroof / Moonroof', 'JBL Premium Surround Sound System', 'Power Sliding Doors', 'Ambient Lighting 16 Warna', 'Toyota Safety Sense']),
      image_url: '/images/cars/toyota-alphard.jpg',
      gallery: JSON.stringify(['/images/cars/toyota-alphard.jpg']),
      status: 'active',
      sort_order: 6,
    }
  ];

  const insertAllCars = db.transaction((carsList) => {
    for (const c of carsList) {
      insertCar.run(
        c.id,
        c.brand,
        c.model,
        c.slug,
        c.year,
        c.capacity,
        c.transmission,
        c.fuel,
        c.price_per_day,
        c.category,
        c.description,
        c.features,
        c.image_url,
        c.gallery,
        c.status,
        c.sort_order
      );
    }
  });

  insertAllCars(initialCars);
}

export default db;
