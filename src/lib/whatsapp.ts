export interface WhatsAppInquiryData {
  carName: string;
  startDate: string;
  endDate: string;
  durationDays: number | string;
  pickupLocation: string;
  destination?: string;
  customerName: string;
  customerPhone: string;
  notes?: string;
}

export function formatWhatsAppMessage(data: WhatsAppInquiryData, companyName: string = 'RentCar'): string {
  const tujuan = data.destination && data.destination.trim() ? data.destination.trim() : '-';
  const catatan = data.notes && data.notes.trim() ? data.notes.trim() : '-';

  return `Halo Admin ${companyName},

Saya ingin menanyakan ketersediaan mobil.

Berikut detail pemesanan saya:
• Tipe Mobil      : ${data.carName}
• Tanggal Mulai   : ${data.startDate}
• Tanggal Selesai : ${data.endDate}
• Durasi          : ${data.durationDays} hari
• Lokasi Ambil    : ${data.pickupLocation}
• Tujuan          : ${tujuan}
• Nama            : ${data.customerName}
• No. WhatsApp    : ${data.customerPhone}

Catatan           : ${catatan}

Mohon informasinya apakah mobil tersebut tersedia pada tanggal yang saya pilih.

Terima kasih.`;
}

export function createWhatsAppLink(phoneNumber: string, message: string): string {
  // Clean phone number: remove non-digit characters
  let cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // If number starts with '08', replace '0' with '62'
  if (cleanNumber.startsWith('0')) {
    cleanNumber = '62' + cleanNumber.slice(1);
  } else if (!cleanNumber.startsWith('62') && cleanNumber.length > 0) {
    cleanNumber = '62' + cleanNumber;
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}
