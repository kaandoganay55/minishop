'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import AddressList from '@/components/AddressList';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  total: number;
  items: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    // Mock user data and orders
    setUser({
      id: '1',
      name: session.user?.name || 'Test User',
      email: session.user?.email || 'test@test.com',
      createdAt: '2024-01-01'
    });

    setOrders([
      { id: '1', date: '2024-12-15', status: 'delivered', total: 299, items: 2 },
      { id: '2', date: '2024-12-10', status: 'shipped', total: 150, items: 1 },
      { id: '3', date: '2024-12-05', status: 'processing', total: 89, items: 3 },
    ]);

    setLoading(false);
  }, [session, status, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Beklemede';
      case 'processing': return 'İşleniyor';
      case 'shipped': return 'Kargoda';
      case 'delivered': return 'Teslim Edildi';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 pb-24 md:pb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 animate-pulse">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pb-24 md:pb-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Hoş geldiniz, {user?.name}</h1>
                  <p className="text-gray-600 mt-1">{user?.email}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Üye olma tarihi: {new Date(user?.createdAt || '').toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
              <div className="mt-6 md:mt-0">
                <Link
                  href="/settings"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Ayarlar
                </Link>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-2xl shadow-xl mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-8 overflow-x-auto">
                {[
                  { id: 'overview', label: 'Genel Bakış', icon: '📊' },
                  { id: 'orders', label: 'Siparişlerim', icon: '📦' },
                  { id: 'wishlist', label: 'Favorilerim', icon: '❤️' },
                  { id: 'addresses', label: 'Adreslerim', icon: '📍' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-8">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-blue-800">Toplam Sipariş</p>
                          <p className="text-2xl font-bold text-blue-900">{orders.length}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-green-800">Toplam Harcama</p>
                          <p className="text-2xl font-bold text-green-900">
                            {orders.reduce((sum, order) => sum + order.total, 0).toLocaleString('tr-TR', {
                              style: 'currency',
                              currency: 'TRY'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-purple-800">Favorilerim</p>
                          <p className="text-2xl font-bold text-purple-900">8</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Siparişler</h3>
                    <div className="space-y-4">
                      {orders.slice(0, 3).map(order => (
                        <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Sipariş #{order.id}</p>
                              <p className="text-sm text-gray-600">{order.items} ürün • {new Date(order.date).toLocaleDateString('tr-TR')}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                            <span className="font-medium text-gray-900">
                              {order.total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="inline-flex items-center mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Tüm siparişleri görüntüle
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 md:mb-0">Tüm Siparişlerim</h3>
                    <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                      <option>Tüm siparişler</option>
                      <option>Beklemede</option>
                      <option>İşleniyor</option>
                      <option>Kargoda</option>
                      <option>Teslim edildi</option>
                    </select>
                  </div>
                  
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">Sipariş #{order.id}</h4>
                            <p className="text-gray-600">{new Date(order.date).toLocaleDateString('tr-TR', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}</p>
                          </div>
                          <div className="mt-4 md:mt-0">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-t pt-4">
                          <div>
                            <p className="text-sm text-gray-600">{order.items} ürün</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {order.total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                            </p>
                          </div>
                          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3 mt-4 md:mt-0">
                            <button className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
                              Detayları Görüntüle
                            </button>
                            {order.status === 'delivered' && (
                              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                                Tekrar Sipariş Ver
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Favori Ürünlerim</h3>
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz favori ürününüz yok</h3>
                    <p className="text-gray-600 mb-6">Beğendiğiniz ürünleri favorilere ekleyerek daha sonra kolayca bulabilirsiniz.</p>
                    <Link
                      href="/"
                      className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                      Ürünleri Keşfet
                    </Link>
                  </div>
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <AddressList />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 