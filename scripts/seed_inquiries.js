const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'rentcar.db');
const db = new Database(dbPath);

console.log('Clearing old inquiries...');
db.prepare('DELETE FROM inquiries').run();

const dummyInquiries = [
  // 1. Tab 1: Inquiry Masuk (NEW)
  {
    id: 'inq-001',
    invoice_no: 'INV-20260823-001',
    car_name: 'Toyota Innova Reborn (D 1899 RBN)',
    start_date: '2026-08-26',
    end_date: '2026-08-28',
    duration_days: 2,
    pickup_location: 'Bandara Husein Sastranegara',
    destination: 'Lembang & Ciwidey',
    customer_name: 'Rian Hidayat',
    customer_phone: '081298765432',
    notes: 'Tolong siapkan unit yang wangi dan bersih ya mas.',
    status: 'NEW',
    total_price: 1000000,
    dp_amount: 0,
    payment_status: 'UNPAID',
    payment_method_dp: 'Transfer BCA',
    notes_admin: 'Inquiry baru masuk dari form website.',
  },
  // 2. Tab 1: Inquiry Masuk (CHECKING)
  {
    id: 'inq-002',
    invoice_no: 'INV-20260823-002',
    car_name: 'Honda Brio Satya (D 1234 XYZ)',
    start_date: '2026-08-27',
    end_date: '2026-08-29',
    duration_days: 2,
    pickup_location: 'Stasiun Bandung (Pintu Utara)',
    destination: 'City Tour Bandung',
    customer_name: 'Siti Rahmawati',
    customer_phone: '085712348899',
    notes: 'Mau sewa lepas kunci untuk liburan keluarga kecil.',
    status: 'NEW',
    total_price: 700000,
    dp_amount: 0,
    payment_status: 'UNPAID',
    payment_method_dp: 'Transfer Mandiri',
    notes_admin: 'Inquiry baru masuk dari form website.',
  },
  // 3. Tab 2: Booking Terjadwal (CONFIRMED)
  {
    id: 'inq-003',
    invoice_no: 'INV-20260823-003',
    car_name: 'Toyota Avanza Veloz (D 1452 VNZ)',
    start_date: '2026-08-25',
    end_date: '2026-08-27',
    duration_days: 2,
    pickup_location: 'Kantor RentCar',
    destination: 'Pangalengan & Kawah Putih',
    customer_name: 'Budi Santoso',
    customer_phone: '081388776655',
    notes: 'Ambil unit jam 08.00 pagi ya.',
    status: 'CONFIRMED',
    total_price: 800000,
    dp_amount: 200000,
    payment_status: 'DP_PAID',
    payment_method_dp: 'Transfer BCA',
    notes_admin: 'DP Rp 200.000 masuk. Foto e-KTP dan SIM A asli sudah diverifikasi.',
  },
  // 4. Tab 3: Sedang Disewa (ACTIVE_RENTAL - On Trip Normal)
  {
    id: 'inq-004',
    invoice_no: 'INV-20260823-004',
    car_name: 'Toyota Fortuner GR Sport (D 4567 FTR)',
    start_date: '2026-08-22',
    end_date: '2026-08-25',
    duration_days: 3,
    pickup_location: 'Hotel Trans Luxury Bandung',
    destination: 'Kunjungan Kerja Luar Kota',
    customer_name: 'Hendro Wijaya',
    customer_phone: '081900112233',
    notes: 'Kebutuhan dinas kantor.',
    status: 'ACTIVE_RENTAL',
    total_price: 3300000,
    dp_amount: 500000,
    payment_status: 'FULLY_PAID',
    payment_method_dp: 'Transfer BCA',
    payment_method_final: 'Transfer Mandiri',
    odometer_start: 32450,
    notes_admin: 'Kunci & STNK asli diserahkan. Pelunasan Rp 2.800.000 via Mandiri sudah lunas.',
  },
  // 5. Tab 3: Sedang Disewa (ACTIVE_RENTAL - OVERDUE DEMO!)
  {
    id: 'inq-005',
    invoice_no: 'INV-20260823-005',
    car_name: 'Toyota Alphard Transformer (D 1 AMS)',
    start_date: '2026-08-20',
    end_date: '2026-08-22', // SUDAH LEWAT 1 HARI UNTUK DEMO NOTIFIKASI OVERTIME
    duration_days: 2,
    pickup_location: 'Kantor RentCar',
    destination: 'Wedding Event Lembang',
    customer_name: 'Dedi Setiawan',
    customer_phone: '082144556677',
    notes: 'Untuk acara pernikahan.',
    status: 'ACTIVE_RENTAL',
    total_price: 4400000,
    dp_amount: 1000000,
    payment_status: 'FULLY_PAID',
    payment_method_dp: 'Transfer BCA',
    payment_method_final: 'Transfer BCA',
    odometer_start: 18200,
    notes_admin: 'Kunci diserahkan. Unit terlambat dikembalikan dari jadwal 22 Agustus.',
  },
  // 6. Tab 4: Riwayat Selesai (COMPLETED)
  {
    id: 'inq-006',
    invoice_no: 'INV-20260823-006',
    car_name: 'Honda Mobilio E CVT (D 7890 MBL)',
    start_date: '2026-08-18',
    end_date: '2026-08-20',
    duration_days: 2,
    actual_return_date: '20/08/2026',
    pickup_location: 'Kantor RentCar',
    destination: 'Bandung - Garut',
    customer_name: 'Dewi Lestari',
    customer_phone: '081233445566',
    notes: 'Mobil nyaman sekali, terima kasih.',
    status: 'COMPLETED',
    total_price: 700000,
    dp_amount: 200000,
    payment_status: 'FULLY_PAID',
    payment_method_dp: 'Transfer BCA',
    payment_method_final: 'Cash / Tunai',
    odometer_start: 54100,
    odometer_end: 54380,
    overtime_hours: 0,
    overtime_fee: 0,
    fuel_charge: 0,
    damage_charge: 0,
    notes_admin: 'Mobil kembali tepat waktu, kondisi mulus dan bensin penuh.',
  },
];

const insertStmt = db.prepare(`
  INSERT INTO inquiries (
    id, invoice_no, car_name, start_date, end_date, duration_days,
    pickup_location, destination, customer_name, customer_phone,
    notes, status, total_price, dp_amount, payment_status,
    payment_method_dp, payment_method_final, odometer_start,
    odometer_end, overtime_hours, overtime_fee, fuel_charge,
    damage_charge, notes_admin, actual_return_date
  ) VALUES (
    @id, @invoice_no, @car_name, @start_date, @end_date, @duration_days,
    @pickup_location, @destination, @customer_name, @customer_phone,
    @notes, @status, @total_price, @dp_amount, @payment_status,
    @payment_method_dp, @payment_method_final, @odometer_start,
    @odometer_end, @overtime_hours, @overtime_fee, @fuel_charge,
    @damage_charge, @notes_admin, @actual_return_date
  )
`);

for (const inq of dummyInquiries) {
  insertStmt.run({
    id: inq.id,
    invoice_no: inq.invoice_no,
    car_name: inq.car_name,
    start_date: inq.start_date,
    end_date: inq.end_date,
    duration_days: inq.duration_days,
    pickup_location: inq.pickup_location,
    destination: inq.destination,
    customer_name: inq.customer_name,
    customer_phone: inq.customer_phone,
    notes: inq.notes || '',
    status: inq.status,
    total_price: inq.total_price || 0,
    dp_amount: inq.dp_amount || 0,
    payment_status: inq.payment_status || 'UNPAID',
    payment_method_dp: inq.payment_method_dp || 'Transfer BCA',
    payment_method_final: inq.payment_method_final || 'Transfer BCA',
    odometer_start: inq.odometer_start || 0,
    odometer_end: inq.odometer_end || 0,
    overtime_hours: inq.overtime_hours || 0,
    overtime_fee: inq.overtime_fee || 0,
    fuel_charge: inq.fuel_charge || 0,
    damage_charge: inq.damage_charge || 0,
    notes_admin: inq.notes_admin || '',
    actual_return_date: inq.actual_return_date || null,
  });
}

console.log('Successfully seeded 6 dummy inquiries across all 4 stages!');
