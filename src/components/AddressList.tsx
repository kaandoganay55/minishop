'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import AddressForm from './AddressForm';

interface Address {
  _id: string;
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
  fullName: string;
  formattedAddress: string;
  createdAt: string;
  updatedAt: string;
}

const AddressList = () => {
  const { data: session } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAddresses = async () => {
    if (!session?.user?.email) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/addresses?userEmail=${session.user.email}`);
      const data = await response.json();

      if (response.ok) {
        setAddresses(data.addresses);
      } else {
        console.error('Error fetching addresses:', data.message);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [session?.user?.email]);

  const handleAddAddress = () => {
    setEditingAddress(null);
    setIsFormOpen(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setIsFormOpen(true);
  };

  const handleSaveAddress = async (addressData: any) => {
    if (!session?.user?.email) return;

    setIsSubmitting(true);
    try {
      const url = editingAddress 
        ? `/api/addresses/${editingAddress._id}`
        : '/api/addresses';
      
      const method = editingAddress ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...addressData,
          userEmail: session.user.email
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(editingAddress ? 'Adres başarıyla güncellendi!' : 'Adres başarıyla eklendi!');
        fetchAddresses();
        setIsFormOpen(false);
        setEditingAddress(null);
      } else {
        alert(data.message || 'Bir hata oluştu');
      }
    } catch (error) {
      alert('Bir hata oluştu');
      console.error('Error saving address:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!session?.user?.email) return;
    
    if (!confirm('Bu adresi silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/addresses/${addressId}?userEmail=${session.user.email}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        alert('Adres başarıyla silindi!');
        fetchAddresses();
      } else {
        alert(data.message || 'Bir hata oluştu');
      }
    } catch (error) {
      alert('Bir hata oluştu');
      console.error('Error deleting address:', error);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: session.user.email,
          isDefault: true
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Varsayılan adres güncellendi!');
        fetchAddresses();
      } else {
        alert(data.message || 'Bir hata oluştu');
      }
    } catch (error) {
      alert('Bir hata oluştu');
      console.error('Error setting default address:', error);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'shipping': return 'Teslimat';
      case 'billing': return 'Fatura';
      case 'both': return 'Teslimat & Fatura';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'shipping': return 'bg-green-100 text-green-800';
      case 'billing': return 'bg-blue-100 text-blue-800';
      case 'both': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isFormOpen) {
    return (
      <AddressForm
        address={editingAddress || undefined}
        onSave={handleSaveAddress}
        onCancel={() => {
          setIsFormOpen(false);
          setEditingAddress(null);
        }}
        isLoading={isSubmitting}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Adreslerim</h2>
          <p className="text-gray-600 mt-1">Teslimat ve fatura adreslerinizi yönetin</p>
        </div>
        <button
          onClick={handleAddAddress}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Yeni Adres Ekle
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-6 bg-gray-200 rounded w-1/2" />
                  <div className="h-16 bg-gray-200 rounded w-3/4" />
                </div>
                <div className="space-y-2">
                  <div className="h-8 bg-gray-200 rounded w-20" />
                  <div className="h-8 bg-gray-200 rounded w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : addresses.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="text-6xl mb-4">📍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz adres eklenmemiş</h3>
          <p className="text-gray-600 mb-6">İlk adresinizi ekleyerek hızlı alışverişe başlayın!</p>
          <button
            onClick={handleAddAddress}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            İlk Adresimi Ekle
          </button>
        </div>
      ) : (
        /* Address Cards */
        <div className="grid gap-4">
          {addresses.map((address) => (
            <div 
              key={address._id} 
              className={`bg-white rounded-xl p-6 border-2 transition-all hover:shadow-lg ${
                address.isDefault 
                  ? 'border-purple-300 bg-gradient-to-r from-purple-50 to-purple-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Address Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{address.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(address.type)}`}>
                      {getTypeLabel(address.type)}
                    </span>
                    {address.isDefault && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Varsayılan
                      </span>
                    )}
                  </div>

                  {/* Address Details */}
                  <div className="space-y-2 text-gray-700">
                    <p className="font-medium">{address.fullName}</p>
                    {address.company && <p className="text-sm">{address.company}</p>}
                    <p className="text-sm">{address.formattedAddress}</p>
                    <p className="text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {address.phone}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleEditAddress(address)}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Düzenle
                  </button>

                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address._id)}
                      className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm font-medium transition-colors"
                    >
                      Varsayılan Yap
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteAddress(address._id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressList; 