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

type FleetTab = 'all' | 'ready' | 'running';

export default function AdminCarsPage() {
  const [cars, setCars] = useState<CarItem[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fleetTab, setFleetTab] = useState<FleetTab>('all');
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

  const fetchCarsAndInquiries = async () => {
    setLoading(true);
    try {
      const [resCars, resInq] = await Promise.all([
        fetch('/api/cars?all=true'),
        fetch('/api/inquiries'),
      ]);
      const dataCars = await resCars.json();
      const dataInq = await resInq.json();

      if (dataCars.success) {
        setCars(dataCars.data);
      }
      if (dataInq.success) {
        setInquiries(dataInq.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarsAndInquiries();
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
    setFeaturesText('AC, Audio Bluetooth, Dual SRS Airbag, USB Fast Charger');
    setImageUrl('/images/cars/toyota-avanza.jpg');
    setStatus('active');
    setSortOrder(cars.length + 1);
    setUploadError(null);
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
    setUploadError(null);
    setModalOpen(true);
  };

  const handleBrandModelChange = (newBrand: string, newModel: string) => {
    setBrand(newBrand);
    setModel(newModel);
    if (!editingCar) {
      const generatedSlug = `${newBrand}-${newModel}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const featuresArray = featuresText
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    const payload = {
      brand,
      model,
      plate_number: plateNumber.trim().toUpperCase() || 'D 1234 AMS',
      slug,
      year: Number(year),
      capacity: Number(capacity),
      transmission,
      fuel,
      price_per_day: Number(pricePerDay),
      category,
      description,
      features: featuresArray,
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
        fetchCarsAndInquiries();
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
        fetchCarsAndInquiries();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to find active rental for a car
  const getActiveRentalForCar = (car: CarItem) => {
    return inquiries.find((i) => {
      if (i.status !== 'ACTIVE_RENTAL') return false;
      if (i.car_id && i.car_id === car.id) return true;
      if (car.plate_number && i.car_name && i.car_name.toLowerCase().includes(car.plate_number.toLowerCase())) return true;
      if (i.car_name && i.car_name.toLowerCase().includes(car.model.toLowerCase())) return true;
      return false;
    });
  };

  // Filter cars based on real-time rental status
  const runningCars = cars.filter((c) => Boolean(getActiveRentalForCar(c)));
  const readyCars = cars.filter((c) => !getActiveRentalForCar(c) && c.status !== 'inactive');

  const filteredCars =
    fleetTab === 'ready'
      ? readyCars
      : fleetTab === 'running'
      ? runningCars
      : cars;

  const presetImages = [
    { label: 'Toyota Avanza', url: '/images/cars/toyota-avanza.jpg' },
    { label: 'Toyota Innova Reborn', url: '/images/cars/toyota-innova-reborn.jpg' },
    { label: 'Honda Mobilio', url: '/images/cars/honda-mobilio.jpg' },
    { label: 'Toyota Fortuner', url: '/images/cars/toyota-fortuner.jpg' },
    { label: 'Honda Brio', url: '/images/cars/honda-brio.jpg' },
    { label: 'Toyota Alphard', url: '/images/cars/toyota-alphard.jpg' },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Manajemen Armada Mobil
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau ketersediaan armada fisik, plat nomor, unit yang sedang jalan, dan kelola spesifikasi mobil.
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

      {/* 3 FLEET STATUS TABS */}
      <div className="grid grid-cols-3 gap-3">
        {/* Tab 1: Ready */}
        <button
          onClick={() => setFleetTab('ready')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            fleetTab === 'ready'
              ? 'bg-emerald-800 text-white border-emerald-800 shadow-md scale-[1.01]'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Siap Sewa</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
              fleetTab === 'ready' ? 'bg-white text-emerald-900' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {readyCars.length}
            </span>
          </div>
          <div className="font-extrabold text-sm sm:text-base mt-1">🟢 Ready (Di Pool)</div>
          <p className="text-[11px] opacity-75 mt-0.5 truncate">Armada bebas jadwal & siap disewa</p>
        </button>

        {/* Tab 2: Berjalan */}
        <button
          onClick={() => setFleetTab('running')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            fleetTab === 'running'
              ? 'bg-blue-900 text-white border-blue-900 shadow-md scale-[1.01]'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Aktif Dipakai</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
              fleetTab === 'running' ? 'bg-white text-blue-900' : 'bg-blue-100 text-blue-800'
            }`}>
              {runningCars.length}
            </span>
          </div>
          <div className="font-extrabold text-sm sm:text-base mt-1">🔵 Berjalan (Sedang Disewa)</div>
          <p className="text-[11px] opacity-75 mt-0.5 truncate">Armada sedang di jalan oleh penyewa</p>
        </button>

        {/* Tab 3: Semua Mobil */}
        <button
          onClick={() => setFleetTab('all')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            fleetTab === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.01]'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Total Garasi</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
              fleetTab === 'all' ? 'bg-white text-slate-900' : 'bg-slate-100 text-slate-700'
            }`}>
              {cars.length}
            </span>
          </div>
          <div className="font-extrabold text-sm sm:text-base mt-1">Semua Armada</div>
          <p className="text-[11px] opacity-75 mt-0.5 truncate">Seluruh unit terdaftar di sistem</p>
        </button>
      </div>

      {/* Cars List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="px-5 py-3.5">Foto</th>
                <th className="px-5 py-3.5">Kendaraan & Plat Nomor</th>
                <th className="px-5 py-3.5">Kategori</th>
                <th className="px-5 py-3.5">Spesifikasi</th>
                <th className="px-5 py-3.5">Tarif Harian</th>
                <th className="px-5 py-3.5">Status Ketersediaan Fisik</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Memuat data armada...
                  </td>
                </tr>
              ) : filteredCars.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Tidak ada mobil pada kategori filter ini.
                  </td>
                </tr>
              ) : (
                filteredCars.map((car) => {
                  const activeRental = getActiveRentalForCar(car);
                  const isRunning = Boolean(activeRental);

                  return (
                    <tr key={car.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="w-16 h-12 bg-slate-100 rounded-xl overflow-hidden relative border border-slate-200 shadow-2xs">
                          <Image
                            src={car.image_url}
                            alt={car.model}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-extrabold text-slate-900 text-sm">{car.brand} {car.model}</div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="inline-block bg-slate-900 text-amber-300 font-mono text-[11px] font-black px-2 py-0.5 rounded-md border border-slate-700 shadow-xs tracking-wider">
                            {car.plate_number || 'D 1234 AMS'}
                          </span>
                          <span className="text-slate-400 text-[11px] font-mono">/{car.slug}</span>
                        </div>

                        {/* If car is running, show current renter info */}
                        {isRunning && activeRental && (
                          <div className="mt-1.5 text-[11px] bg-blue-50 text-blue-900 px-2 py-1 rounded-lg border border-blue-200 font-medium">
                            <span>Sedang disewa: <strong>{activeRental.customer_name}</strong> ({activeRental.invoice_no}) s/d {activeRental.end_date}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="inline-block px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                          {car.category}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-slate-600 text-xs">
                        <div className="font-semibold">{car.capacity} Kursi • {car.transmission}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{car.fuel} • Thn {car.year}</div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="font-extrabold text-slate-900 text-sm">
                          Rp {car.price_per_day.toLocaleString('id-ID')}
                        </span>
                        <span className="text-slate-400 text-xs block">/ hari</span>
                      </td>

                      <td className="px-5 py-3.5">
                        {isRunning ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-extrabold text-xs">
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                            <span>Sedang Berjalan</span>
                          </span>
                        ) : car.status === 'inactive' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 font-bold text-xs">
                            <span>Service / Nonaktif</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>🟢 Ready di Pool</span>
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(car)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-brand-navy hover:text-white text-slate-600 transition-all cursor-pointer shadow-2xs"
                            title="Edit Mobil"
                          >
                            <EditIcon size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteCar(car.id, `${car.brand} ${car.model}`)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-400 transition-all cursor-pointer shadow-2xs"
                            title="Hapus Mobil"
                          >
                            <TrashIcon size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL EDIT / TAMBAH MOBIL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 card-shadow space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <CarIcon size={22} className="text-brand-navy" />
                <span>{editingCar ? 'Edit Data Mobil' : 'Tambah Mobil Baru'}</span>
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <XIcon size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Merek (Brand) *</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => handleBrandModelChange(e.target.value, model)}
                    placeholder="Toyota, Honda, dll"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Model / Tipe *</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => handleBrandModelChange(brand, e.target.value)}
                    placeholder="Avanza Veloz, Innova, dll"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor Plat Mobil *</label>
                  <input
                    type="text"
                    required
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    placeholder="D 1452 VNZ"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-bold uppercase focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white"
                  >
                    <option value="MPV">MPV (Keluarga)</option>
                    <option value="SUV">SUV (Tangguh)</option>
                    <option value="City Car">City Car (Kompak)</option>
                    <option value="Luxury">Luxury (Mewah)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tarif Harian (Rp) *</label>
                  <RupiahInput
                    value={pricePerDay}
                    onChange={setPricePerDay}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tahun Kendaraan *</label>
                  <input
                    type="number"
                    required
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kapasitas Kursi *</label>
                  <input
                    type="number"
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Transmisi *</label>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Matic">Matic</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bahan Bakar *</label>
                  <select
                    value={fuel}
                    onChange={(e) => setFuel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white"
                  >
                    <option value="Bensin">Bensin</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Listrik">Listrik (EV)</option>
                  </select>
                </div>
              </div>

              {/* Foto Mobil */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Foto Mobil Utama</label>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-14 rounded-xl border border-slate-200 bg-slate-100 overflow-hidden relative shrink-0">
                    <Image src={imageUrl} alt="Preview" fill className="object-contain p-1" />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      {uploading ? 'Mengunggah...' : '📁 Pilih File Foto dari Komputer'}
                    </button>
                    {uploadError && <p className="text-xs text-rose-600">{uploadError}</p>}
                  </div>
                </div>

                {/* Preset Image Options */}
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-400">Pilihan Cepat:</span>
                  {presetImages.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setImageUrl(p.url)}
                      className={`text-[10px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                        imageUrl === p.url ? 'bg-brand-navy text-white border-brand-navy' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fitur Tambahan (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="AC, Audio Bluetooth, Dual SRS Airbag, Sensor Parkir"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-navy hover:bg-brand-navy-light text-white shadow-sm transition-all cursor-pointer"
                >
                  {editingCar ? 'Simpan Perubahan Mobil' : 'Tambahkan ke Armada'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
