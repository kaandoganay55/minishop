'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Address {
  _id?: string;
  type: 'shipping' | 'billing' | 'both';
  title: string;
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface AddressFormProps {
  address?: Address;
  onSave: (address: Address) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const turkishCities = [
  'Adana', 'Adıyaman', 'Afyon', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin',
  'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa',
  'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Edirne', 'Elazığ',
  'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari',
  'Hatay', 'Isparta', 'İçel', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri',
  'Kırklareli', 'Kırşehir', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa',
  'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Rize',
  'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon',
  'Tunceli', 'Şanlıurfa', 'Uşak', 'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt',
  'Karaman', 'Kırıkkale', 'Batman', 'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova',
  'Karabük', 'Kilis', 'Osmaniye', 'Düzce'
];

const AddressForm = ({ address, onSave, onCancel, isLoading = false }: AddressFormProps) => {
  const { data: session } = useSession();
  const [formData, setFormData] = useState<Address>({
    type: 'both',
    title: '',
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Turkey',
    isDefault: false,
    ...address
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Adres başlığı gerekli';
    if (!formData.firstName.trim()) newErrors.firstName = 'Ad gerekli';
    if (!formData.lastName.trim()) newErrors.lastName = 'Soyad gerekli';
    if (!formData.phone.trim()) newErrors.phone = 'Telefon numarası gerekli';
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Adres satırı gerekli';
    if (!formData.city.trim()) newErrors.city = 'Şehir gerekli';
    if (!formData.state.trim()) newErrors.state = 'İl gerekli';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Posta kodu gerekli';

    // Validate postal code (5 digits)
    if (formData.postalCode && !/^[0-9]{5}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Posta kodu 5 haneli olmalı';
    }

    // Validate phone number
    if (formData.phone && !/^[0-9+\-\s\(\)]{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Geçersiz telefon numarası formatı';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSave(formData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {address ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Address Type & Title */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adres Tipi
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="both">Teslimat ve Fatura</option>
              <option value="shipping">Sadece Teslimat</option>
              <option value="billing">Sadece Fatura</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adres Başlığı *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ev, İş, vs..."
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ad *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Soyad *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
          </div>
        </div>

        {/* Company & Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Şirket (Opsiyonel)
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefon *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="0532 123 45 67"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
        </div>

        {/* Address Lines */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adres Satırı 1 *
            </label>
            <input
              type="text"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleInputChange}
              placeholder="Sokak, Mahalle, Apartman No"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.addressLine1 ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.addressLine1 && <p className="text-red-500 text-sm mt-1">{errors.addressLine1}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adres Satırı 2 (Opsiyonel)
            </label>
            <input
              type="text"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleInputChange}
              placeholder="Daire No, Kat, vs..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* City, State, Postal Code */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Şehir *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.city ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İl *
            </label>
            <select
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.state ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">İl Seçin</option>
              {turkishCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Posta Kodu *
            </label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              placeholder="34000"
              maxLength={5}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.postalCode ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
          </div>
        </div>

        {/* Default Address Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isDefault"
            checked={formData.isDefault}
            onChange={handleInputChange}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700">
            Bu adresi varsayılan adres olarak ayarla
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
          >
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm; 