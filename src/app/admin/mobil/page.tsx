'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import RupiahInput from '@/components/ui/RupiahInput';
import {
  CarIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  CheckIcon,
  XIcon,
} from '@/components/ui/Icons';
import { CarItem } from '@/components/vehicle/VehicleCard';

export default function AdminCarsPage() {
  const [cars, setCars] = useState<CarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<CarItem | null>(null);

  // Form State
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [plateNumber, setPlateNumber] = useState('D 1234 AMS');
  const [slug, setSlug] = useState('');
  const [year, setYear] = useState<number>(2024);
  const [capacity, setCapacity] = useState<number>(7);
  const [transmission, setTransmission] = useState('Manual');
  const [fuel, setFuel] = useState('Bensin');
  const [pricePerDay, setPricePerDay] = useState<number>(350000);
  const [category, setCategory] = useState('MPV');
  const [description, setDescription] = useState('');
  const [featuresText, setFeaturesText] = useState('AC, Audio Bluetooth, Dual SRS Airbag, USB Fast Charger');
  const [imageUrl, setImageUrl] = useState('/images/cars/toyota-avanza.jpg');
  const [status, setStatus] = useState('active');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setImageUrl(data.url);
      } else {
        setUploadError(data.error || 'Gagal mengunggah foto');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Terjadi kesalahan jaringan');
    } finally {
      setUploading(false);
    }
  };

  const fetchCars = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cars?all=true');
      const data = await res.json();
      if (data.success) {
        setCars(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const openAddModal = () => {
    setEditingCar(null);
    setBrand('');
    setModel('');
    setPlateNumber('');
    setSlug('');
    setYear(2024);
    setCapacity(7);
    setTransmission('Manual');
    setFuel('Bensin');
    setPricePerDay(350000);
    setCategory('MPV');
    setDescription('');
    setFeaturesText('AC Double Blower, Audio Touchscreen, Dual SRS Airbag, USB Fast Charger');
    setImageUrl('/images/cars/toyota-avanza.jpg');
    setStatus('active');
    setSortOrder(cars.length + 1);
    setModalOpen(true);
  };

  const openEditModal = (car: CarItem) => {
    setEditingCar(car);
    setBrand(car.brand);
    setModel(car.model);
    setPlateNumber(car.plate_number || 'D 1234 AMS');
    setSlug(car.slug);
    setYear(car.year);
    setCapacity(car.capacity);
    setTransmission(car.transmission);
    setFuel(car.fuel);
    setPricePerDay(car.price_per_day);
    setCategory(car.category);
    setDescription(car.description || '');
    setFeaturesText(car.features ? car.features.join(', ') : '');
    setImageUrl(car.image_url);
    setStatus(car.status || 'active');
    setSortOrder(car.sort_order || 1);
    setModalOpen(true);
  };

  const handleSaveCar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const generatedSlug = slug.trim() || `${brand.toLowerCase()}-${model.toLowerCase()}`.replace(/\s+/g, '-');
    const featuresList = featuresText.split(',').map((f) => f.trim()).filter(Boolean);

    const payload = {
      brand,
      model,
      plate_number: plateNumber.trim().toUpperCase() || 'D 1234 AMS',
      slug: generatedSlug,
      year,
      capacity,
      transmission,
      fuel,
      price_per_day: pricePerDay,
      category,
      description,
      features: featuresList,
      image_url: imageUrl,
      gallery: [imageUrl],
      status,
      sort_order: sortOrder,
    };

    try {
      let res;
      if (editingCar) {
        res = await fetch(`/api/cars/${editingCar.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/cars', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.success) {
        setMessage({ text: data.message, type: 'success' });
        setModalOpen(false);
        fetchCars();
      } else {
        setMessage({ text: data.error || 'Gagal menyimpan mobil', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Terjadi kesalahan sistem', type: 'error' });
    }
  };

  const handleDeleteCar = async (id: string, carName: string) => {
    if (!confirm(`Yakin ingin menghapus ${carName}?`)) return;

    try {
      const res = await fetch(`/api/cars/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchCars();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const presetImages = [
    { label: 'Toyota Avanza', url: '/images/cars/toyota-avanza.jpg' },
    { label: 'Toyota Innova Reborn', url: '/images/cars/toyota-innova-reborn.jpg' },
    { label: 'Honda Mobilio', url: '/images/cars/honda-mobilio.jpg' },
    { label: 'Toyota Fortuner', url: '/images/cars/toyota-fortuner.jpg' },
    { label: 'Honda Brio', url: '/images/cars/honda-brio.jpg' },
    { label: 'Toyota Alphard', url: '/images/cars/toyota-alphard.jpg' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Manajemen Armada Mobil
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tambah, edit spesifikasi, ubah foto, dan atur ketersediaan mobil di landing page.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-bold transition-all shadow-sm active:scale-98 cursor-pointer"
        >
          <PlusIcon size={16} />
          <span>Tambah Mobil Baru</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Cars List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="px-5 py-3.5">Foto</th>
                <th className="px-5 py-3.5">Kendaraan</th>
                <th className="px-5 py-3.5">Kategori</th>
                <th className="px-5 py-3.5">Spesifikasi</th>
                <th className="px-5 py-3.5">Tarif Harian</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cars.map((car) => (
                <tr key={car.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3">
                    <div className="w-16 h-12 bg-slate-100 rounded-lg overflow-hidden relative border border-slate-200">
                      <Image
                        src={car.image_url}
                        alt={car.model}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-bold text-slate-900">{car.brand} {car.model}</div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="inline-block bg-slate-900 text-amber-300 font-mono text-[10px] font-extrabold px-2 py-0.5 rounded border border-slate-700 shadow-xs tracking-wider">
                        {car.plate_number || 'D 1234 AMS'}
                      </span>
                      <span className="text-slate-400 text-[11px] font-mono">/{car.slug}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                      {car.category}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600 text-xs">
                    <div>{car.capacity} Kursi · {car.transmission}</div>
                    <div className="text-slate-400">{car.fuel} · Thn {car.year}</div>
                  </td>
                  <td className="px-5 py-3 font-bold text-slate-900">
                    Rp {car.price_per_day?.toLocaleString('id-ID')}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        car.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : car.status === 'maintenance'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {car.status === 'active' ? '● Aktif' : car.status === 'maintenance' ? '▲ Servis' : '○ Nonaktif'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(car)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-brand-navy hover:bg-slate-100 transition-colors"
                        title="Edit Mobil"
                      >
                        <EditIcon size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCar(car.id, `${car.brand} ${car.model}`)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Hapus Mobil"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Car */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 card-shadow my-8 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                {editingCar ? 'Edit Data Mobil' : 'Tambah Mobil Baru'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <XIcon size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCar} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Merek Mobil</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Contoh: Toyota"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Model / Tipe</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Contoh: Avanza"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor Plat (Nopol)</label>
                  <input
                    type="text"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    placeholder="Contoh: D 1452 VNZ"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-mono font-bold uppercase"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800"
                  >
                    <option value="MPV">MPV</option>
                    <option value="SUV">SUV</option>
                    <option value="City Car">City Car</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tahun</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kapasitas Kursi</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Transmisi</label>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Matic">Matic</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bahan Bakar</label>
                  <select
                    value={fuel}
                    onChange={(e) => setFuel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800"
                  >
                    <option value="Bensin">Bensin</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Listrik">Listrik</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tarif / Hari</label>
                  <RupiahInput
                    value={pricePerDay}
                    onChange={setPricePerDay}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Foto Mobil: Direct Upload & Preset */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700">Foto Mobil</label>
                  <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Otomatis Kompres WebP + Sharpen
                  </span>
                </div>

                {/* Upload & Preview Box */}
                <div className="border-2 border-dashed border-slate-200 hover:border-brand-navy-light rounded-2xl p-4 bg-slate-50/70 transition-all">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Live Image Preview */}
                    <div className="w-36 h-24 sm:w-44 sm:h-28 rounded-xl bg-white border border-slate-200 overflow-hidden relative shrink-0 shadow-sm flex items-center justify-center">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt="Preview Mobil"
                          fill
                          className="object-contain p-1"
                        />
                      ) : (
                        <CarIcon size={32} className="text-slate-300" />
                      )}
                      {uploading && (
                        <div className="absolute inset-0 bg-brand-navy/70 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs font-bold gap-1">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Memproses WebP...</span>
                        </div>
                      )}
                    </div>

                    {/* Upload Controls */}
                    <div className="flex-1 text-center sm:text-left space-y-2">
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Unggah foto mobil dari galeri / komputer Anda (JPG, PNG, WebP). Sistem akan otomatis mengompresi dan mempertajam resolusi ke WebP ringan.
                      </p>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          disabled={uploading}
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-bold transition-all shadow-sm active:scale-98 disabled:opacity-50 cursor-pointer"
                        >
                          {uploading ? 'Mengompres...' : 'Pilih & Upload Foto Baru'}
                        </button>
                        {imageUrl && (
                          <span className="text-[11px] font-mono text-slate-500 truncate max-w-[200px]">
                            {imageUrl.split('/').pop()}
                          </span>
                        )}
                      </div>

                      {uploadError && (
                        <p className="text-xs font-semibold text-rose-600 mt-1">{uploadError}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preset Options as secondary quick pick */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                    Atau gunakan preset bawaan:
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {presetImages.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setImageUrl(p.url);
                          setUploadError(null);
                        }}
                        className={`p-1.5 rounded-xl border text-center transition-all ${
                          imageUrl === p.url
                            ? 'border-brand-navy bg-brand-navy/5 shadow-xs ring-1 ring-brand-navy'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-full h-8 relative mb-1">
                          <Image src={p.url} alt={p.label} fill className="object-contain" />
                        </div>
                        <span className="text-[10px] text-slate-600 block truncate font-medium">
                          {p.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi Mobil</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800"
                  placeholder="Keterangan singkat keunggulan mobil..."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fasilitas / Fitur (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="AC Double Blower, Audio Bluetooth, Dual SRS Airbag"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Ketersediaan</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800"
                  >
                    <option value="active">Aktif (Tampil di Web)</option>
                    <option value="inactive">Nonaktif (Disembunyikan)</option>
                    <option value="maintenance">Maintenance (Servis)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Urutan Tampil (Sort Order)</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white font-bold shadow-sm"
                >
                  {editingCar ? 'Simpan Perubahan' : 'Tambah Mobil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
