import React, { useState } from 'react';
import { tv, fmt } from '../../utils/helpers';
import { DatabaseService, createService, updateService, deleteService } from '../../lib/supabase';
import { getPlatformLogo, getComboLogos } from '../PlatformLogos';

interface AdminProductsManagerProps {
    isDark: boolean;
    services: DatabaseService[];
    combos: DatabaseService[];
    onRefresh: () => void;
    onBack: () => void;
}

export function AdminProductsManager({ isDark, services, combos, onRefresh, onBack }: AdminProductsManagerProps) {
    const [activeTab, setActiveTab] = useState<'services' | 'combos'>('services');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<DatabaseService | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (limit to ~500KB to avoid massive DB columns)
            if (file.size > 500 * 1024) {
                alert('La imagen es muy grande. Por favor sube una imagen de menos de 500KB.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, logo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const [formData, setFormData] = useState<Partial<DatabaseService>>({
        id: '',
        name: '',
        price: 0,
        billing: 'monthly',
        color: 'bg-zinc-800',
        logo: '',
        is_combo: false
    });

    const productsToDisplay = activeTab === 'services' ? services : combos;

    const handleOpenModal = (product?: DatabaseService) => {
        if (product) {
            setEditingProduct(product);
            setFormData(product);
        } else {
            setEditingProduct(null);
            setFormData({
                id: '',
                name: '',
                price: 0,
                billing: 'monthly',
                color: 'bg-zinc-800',
                logo: '',
                is_combo: activeTab === 'combos'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const finalData = { ...formData };
            if (!editingProduct) {
                let newId = finalData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
                if (finalData.is_combo && newId && !newId.startsWith('combo_')) {
                    newId = 'combo_' + newId;
                }
                finalData.id = newId;
                if (!finalData.color) finalData.color = 'bg-zinc-800';
            }
            if (!finalData.logo) {
                finalData.logo = finalData.name?.substring(0, 1).toUpperCase() || 'P';
            }

            if (editingProduct) {
                // Edit mode
                await updateService(editingProduct.id, finalData);
                alert('✅ Producto actualizado correctamente');
            } else {
                // Create mode
                await createService(finalData as DatabaseService);
                alert('🎉 Producto nuevo creado correctamente');
            }
            onRefresh();
            closeModal();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('❌ Error al guardar el producto');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.')) {
            setIsLoading(true);
            try {
                await deleteService(id);
                alert('✅ Producto eliminado');
                onRefresh();
            } catch (error) {
                alert('❌ Error al eliminar el producto');
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <section className="mx-auto max-w-6xl px-3 sm:px-4 pb-8 sm:pb-16 animate-fade-in">
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <button
                        onClick={onBack}
                        className={`mb - 2 text - sm flex items - center gap - 1 ${tv(isDark, 'text-gray-600 hover:text-black', 'text-gray-400 hover:text-white')} `}
                    >
                        ← Volver al Dashboard
                    </button>
                    <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        📦 Gestor de Productos
                    </h3>
                    <p className={`text-sm ${tv(isDark, 'text-gray-600', 'text-gray-400')}`}>
                        Administra los servicios individuales y combos disponibles en el catálogo.
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-105 ${tv(isDark, 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30', 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30')}`}
                >
                    <span>➕</span> Añadir {activeTab === 'services' ? 'Servicio' : 'Combo'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('services')}
                    className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-xl font-bold transition-all shadow-md border text-sm sm:text-base ${activeTab === 'services'
                        ? tv(isDark, 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-400 shadow-blue-500/30', 'bg-gradient-to-r from-blue-600 to-purple-700 text-white border-blue-500 shadow-blue-600/30')
                        : tv(isDark, 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50', 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700')
                        }`}
                >
                    <span className="flex items-center justify-center gap-2">
                        <span className="text-xl">📺</span>
                        <span>Servicios</span>
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('combos')}
                    className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-xl font-bold transition-all shadow-md border text-sm sm:text-base ${activeTab === 'combos'
                        ? tv(isDark, 'bg-gradient-to-r from-orange-400 to-red-500 text-white border-orange-400 shadow-orange-500/30', 'bg-gradient-to-r from-orange-500 to-red-600 text-white border-orange-500 shadow-orange-600/30')
                        : tv(isDark, 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50', 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700')
                        } `}
                >
                    <span className="flex items-center justify-center gap-2">
                        <span className="text-xl">📦</span>
                        <span>Combos</span>
                    </span>
                </button>
            </div>

            {/* Table (Desktop) / Cards (Mobile) */}
            <div className="space-y-4">
                {/* Mobile Cards View */}
                <div className="grid grid-cols-1 gap-4 lg:hidden">
                    {productsToDisplay.length === 0 ? (
                        <div className={`p-8 text-center rounded-2xl border ${tv(isDark, 'bg-white border-gray-200 text-gray-500', 'bg-gray-900 border-gray-700 text-gray-400')}`}>
                            No hay productos registrados en esta categoría.
                        </div>
                    ) : (
                        productsToDisplay.map((product) => (
                            <div key={product.id} className={`p-4 rounded-2xl shadow-lg border transition-all ${tv(isDark, 'bg-white border-gray-100', 'bg-gray-900/80 border-gray-700')}`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-md relative overflow-hidden ${product.color}`}>
                                            {(() => {
                                                if (product.is_combo || activeTab === 'combos') {
                                                    const logos = getComboLogos(product.id, 24, product.name);
                                                    if (logos.length > 0) {
                                                        return (
                                                            <div className="flex items-center -space-x-2">
                                                                {logos.map((logo, i) => (
                                                                    <div key={i} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm shadow-md border border-white/30 flex items-center justify-center overflow-hidden" style={{ zIndex: logos.length - i }}>
                                                                        {logo}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        );
                                                    }
                                                }
                                                const svgLogo = getPlatformLogo(product.id, 0, 'w-full h-full object-cover scale-150');
                                                if (svgLogo) return <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-xl">{svgLogo}</div>;
                                                if (product.logo?.startsWith('http') || product.logo?.startsWith('data:image')) {
                                                    return <img src={product.logo} alt={product.name} className="w-full h-full object-cover rounded-xl" loading="lazy" />
                                                }
                                                return <span className="text-white font-bold text-xl">{product.logo}</span>;
                                            })()}
                                        </div>
                                        <div>
                                            <div className={`font-black tracking-tight ${tv(isDark, 'text-gray-900', 'text-white')}`}>{product.name}</div>
                                            <div className={`text-xs opacity-50 ${tv(isDark, 'text-gray-500', 'text-gray-400')}`}>{product.id}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOpenModal(product)}
                                            className={`p-2 rounded-xl transition-all active:scale-95 ${tv(isDark, 'bg-blue-50 text-blue-600', 'bg-blue-500/10 text-blue-400 border border-blue-500/20')}`}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className={`p-2 rounded-xl transition-all active:scale-95 ${tv(isDark, 'bg-red-50 text-red-600', 'bg-red-500/10 text-red-400 border border-red-500/20')}`}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${product.color}`}></div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider opacity-60 ${tv(isDark, 'text-gray-600', 'text-gray-400')}`}>UI COLOR</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-black text-green-500">{fmt(product.price)}</div>
                                        <div className={`text-[10px] font-bold opacity-50 ${tv(isDark, 'text-gray-600', 'text-gray-400')}`}>
                                            {product.billing === 'annual' ? 'ANUAL' : 'MENSUAL'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop Table View */}
                <div className={`hidden lg:block overflow-x-auto rounded-2xl shadow-xl backdrop-blur-md border ${tv(isDark, 'bg-white/80 border-gray-200', 'bg-gray-900/80 border-gray-700')}`}>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className={tv(isDark, 'border-b border-gray-200 bg-gray-50/50', 'border-b border-gray-700 bg-gray-800/50')}>
                                <th className="p-4 font-bold">Logo</th>
                                <th className="p-4 font-bold">Nombre / ID</th>
                                <th className="p-4 font-bold">Precio</th>
                                <th className="p-4 font-bold">Color UI</th>
                                <th className="p-4 font-bold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productsToDisplay.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        No hay productos registrados en esta categoría.
                                    </td>
                                </tr>
                            ) : (
                                productsToDisplay.map((product) => (
                                    <tr key={product.id} className={`group border-b last:border-0 transition-colors ${tv(isDark, 'border-gray-100 hover:bg-gray-50', 'border-gray-800 hover:bg-gray-800')}`}>
                                        <td className="p-4 w-16">
                                            <div className={`w-12 h-12 min-w-[3rem] min-h-[3rem] max-w-[3rem] max-h-[3rem] rounded-xl flex items-center justify-center shadow-sm relative overflow-hidden ${product.color}`}>
                                                {(() => {
                                                    if (product.is_combo || activeTab === 'combos') {
                                                        const logos = getComboLogos(product.id, 24, product.name);
                                                        if (logos.length > 0) {
                                                            return (
                                                                <div className="flex items-center -space-x-2">
                                                                    {logos.map((logo, i) => (
                                                                        <div key={i} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm shadow-md border border-white/30 flex items-center justify-center overflow-hidden" style={{ zIndex: logos.length - i }}>
                                                                            {logo}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            );
                                                        }
                                                    }

                                                    const svgLogo = getPlatformLogo(product.id, 0, 'w-full h-full object-cover scale-150');
                                                    if (svgLogo) return <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-xl">{svgLogo}</div>;

                                                    if (product.logo?.startsWith('http') || product.logo?.startsWith('data:image')) {
                                                        return <img src={product.logo} alt={product.name} className="w-full h-full object-cover rounded-xl" loading="lazy" />
                                                    }

                                                    return <span className="text-white font-bold text-lg">{product.logo}</span>;
                                                })()}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-lg">{product.name}</div>
                                            <div className={`text-xs ${tv(isDark, 'text-gray-500', 'text-gray-400')}`}>{product.id}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-bold text-green-500 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">
                                                {fmt(product.price)}
                                            </span>
                                            <span className="text-xs ml-2 opacity-70">
                                                {product.billing === 'annual' ? '/ año' : '/ mes'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-4 h-4 rounded-full ${product.color}`}></div>
                                                <code className={`text-xs px-2 py-1 rounded bg-black/5 ${tv(isDark, 'text-gray-600', 'text-gray-300')}`}>
                                                    {product.color.substring(0, 15)}{product.color.length > 15 ? '...' : ''}
                                                </code>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenModal(product)}
                                                    className={`p-2 rounded-lg transition-colors hover:bg-blue-500 hover:text-white ${tv(isDark, 'bg-gray-100 text-gray-700', 'bg-gray-700 text-gray-300')}`}
                                                    title="Editar"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className={`p-2 rounded-lg transition-colors hover:bg-red-500 hover:text-white ${tv(isDark, 'bg-gray-100 text-gray-700', 'bg-gray-700 text-gray-300')}`}
                                                    title="Eliminar"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CREATE / EDIT PREMIUM DESIGN MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={closeModal}></div>
                    <div className={`relative w-full max-w-lg rounded-[2rem] p-6 sm:p-8 shadow-2xl border animate-scale-up overflow-hidden ${tv(isDark, 'bg-white border-gray-200 shadow-gray-200/50', 'bg-zinc-900 border-zinc-800 shadow-black/80')}`}>

                        {/* Decorative Premium Glow */}
                        <div className={`absolute top-0 left-0 w-full h-32 opacity-20 pointer-events-none bg-gradient-to-b ${formData.is_combo ? 'from-orange-500' : 'from-blue-500'} to-transparent`} />

                        <button onClick={closeModal} className={`absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full transition-colors z-10 ${tv(isDark, 'bg-gray-100 hover:bg-gray-200 text-gray-600', 'bg-zinc-800 hover:bg-zinc-700 text-gray-300')}`}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <div className="relative z-10">
                            <h2 className={`text-2xl sm:text-3xl font-black mb-6 flex items-center gap-3 ${tv(isDark, 'text-gray-900', 'text-white')}`}>
                                {formData.is_combo ? '📦' : '📺'}
                                {editingProduct ? 'Editar ' : 'Nuevo '}
                                <span className={`bg-gradient-to-r ${formData.is_combo ? 'from-orange-400 to-red-500' : 'from-blue-400 to-purple-500'} bg-clip-text text-transparent`}>
                                    {formData.is_combo ? 'Combo' : 'Servicio'}
                                </span>
                            </h2>

                            <form onSubmit={handleSave} className="space-y-5">
                                <div className="space-y-5">
                                    {/* Name Input */}
                                    <div>
                                        <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${tv(isDark, 'text-gray-500', 'text-zinc-400')}`}>Nombre del Producto</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className={`w-full rounded-2xl pl-12 pr-4 py-3.5 outline-none transition-all border-2 focus:ring-4 ${tv(isDark, 'bg-gray-50 border-gray-100 focus:border-blue-400 focus:ring-blue-100 text-gray-900', 'bg-zinc-800/50 border-zinc-700 focus:border-blue-500 focus:ring-blue-500/20 text-white')}`}
                                                placeholder={formData.is_combo ? "ej: Disney + Max" : "ej: Netflix Premium"}
                                            />
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-50">✨</span>
                                        </div>
                                    </div>

                                    {/* Price & Billing row */}
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${tv(isDark, 'text-gray-500', 'text-zinc-400')}`}>Precio ($)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    required
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                                    className={`w-full rounded-2xl pl-12 pr-4 py-3.5 outline-none transition-all border-2 focus:ring-4 font-bold ${tv(isDark, 'bg-gray-50 border-gray-100 focus:border-green-400 focus:ring-green-100 text-gray-900', 'bg-zinc-800/50 border-zinc-700 focus:border-green-500 focus:ring-green-500/20 text-white')}`}
                                                />
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-green-500">US$</span>
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${tv(isDark, 'text-gray-500', 'text-zinc-400')}`}>Módulo de Cobro</label>
                                            <select
                                                value={formData.billing}
                                                onChange={(e) => setFormData({ ...formData, billing: e.target.value })}
                                                className={`w-full rounded-2xl px-4 py-3.5 outline-none transition-all border-2 focus:ring-4 font-bold appearance-none ${tv(isDark, 'bg-gray-50 border-gray-100 focus:border-blue-400 focus:ring-blue-100 text-gray-900', 'bg-zinc-800/50 border-zinc-700 focus:border-blue-500 focus:ring-blue-500/20 text-white')}`}
                                            >
                                                <option value="monthly">📅 Mensual</option>
                                                <option value="annual">📆 Anual</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Logo Input */}
                                    <div>
                                        <label className={`block text-xs font-bold mb-2 uppercase tracking-wider flex justify-between ${tv(isDark, 'text-gray-500', 'text-zinc-400')}`}>
                                            Icono o Logo
                                            {formData.logo && formData.logo.startsWith('data:image') && (
                                                <span className="text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">✅ Se adjuntó imagen</span>
                                            )}
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={formData.logo}
                                                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                                                className={`flex-1 rounded-2xl px-4 py-3.5 outline-none transition-all border-2 focus:ring-4 ${tv(isDark, 'bg-gray-50 border-gray-100 focus:border-blue-400 focus:ring-blue-100', 'bg-zinc-800/50 border-zinc-700 focus:border-blue-500 focus:ring-blue-500/20')} placeholder:opacity-40`}
                                                placeholder="Pega URL o Icono (Ej: https://)"
                                            />
                                            <label className={`cursor-pointer px-5 flex items-center gap-2 rounded-2xl font-bold transition-transform hover:scale-105 shadow-lg active:scale-95 ${tv(isDark, 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white', 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white')}`}>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                                <span className="hidden sm:inline">Archivo</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileUpload}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                        {formData.is_combo && !formData.logo && (
                                            <div className="mt-3">
                                                <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 opacity-50 ${tv(isDark, 'text-gray-900', 'text-white')}`}>Logos Detectados Automáticamente:</div>
                                                <div className="flex items-center gap-2">
                                                    {(() => {
                                                        const logos = getComboLogos('temp', 24, formData.name);
                                                        if (logos.length > 0) {
                                                            return logos.map((logo, i) => (
                                                                <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden border ${tv(isDark, 'bg-gray-100 border-gray-200', 'bg-zinc-800 border-zinc-700')}`}>
                                                                    {logo}
                                                                </div>
                                                            ));
                                                        }
                                                        return <span className="text-[10px] italic opacity-50">Escribe servicios (ej: Netflix + Max) para detectar logos</span>;
                                                    })()}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Combo Toggle visually stunning */}
                                    <label className={`relative flex items-center justify-between p-4 sm:p-5 rounded-2xl cursor-pointer transition-all border-2 ${formData.is_combo ? tv(isDark, 'bg-orange-50 border-orange-200 shadow-inner', 'bg-orange-500/10 border-orange-500/30 shadow-inner') : tv(isDark, 'bg-gray-50 border-gray-100', 'bg-zinc-800/30 border-zinc-800')}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm ${formData.is_combo ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white' : tv(isDark, 'bg-gray-200 text-gray-500', 'bg-zinc-700 text-zinc-400')}`}>
                                                {formData.is_combo ? '📦' : '📺'}
                                            </div>
                                            <div>
                                                <div className={`font-bold ${tv(isDark, 'text-gray-900', 'text-white')}`}>Esto es un Combo</div>
                                                <div className={`text-xs ${tv(isDark, 'text-gray-500', 'text-zinc-400')}`}>{formData.is_combo ? 'Aparecerá junto con combos especiales' : 'Aparecerá en servicios individuales'}</div>
                                            </div>
                                        </div>
                                        <div className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${formData.is_combo ? tv(isDark, 'bg-orange-500', 'bg-orange-600') : tv(isDark, 'bg-gray-300', 'bg-zinc-600')}`}>
                                            <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${formData.is_combo ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={formData.is_combo}
                                            onChange={(e) => setFormData({ ...formData, is_combo: e.target.checked })}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                <div className="pt-6 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className={`flex-1 py-4 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-95 ${tv(isDark, 'bg-gray-100 hover:bg-gray-200 text-gray-600', 'bg-zinc-800 hover:bg-zinc-700 text-gray-300')}`}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`flex-1 flex justify-center items-center gap-2 py-4 rounded-2xl font-bold text-white transition-all shadow-xl hover:scale-[1.02] active:scale-95 ${isLoading ? 'opacity-70 cursor-wait' : ''} ${formData.is_combo ? tv(isDark, 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-orange-500/30', 'bg-gradient-to-r from-orange-600 to-red-600 shadow-orange-600/30') : tv(isDark, 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30', 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-600/30')}`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                Guardando...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                Guardar Producto
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
