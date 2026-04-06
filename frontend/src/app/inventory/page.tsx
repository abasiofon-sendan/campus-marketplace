"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';

export default function InventoryPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('inventory');
    const [products, setProducts] = useState<any[]>([]);
    const [contents, setContents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const [isAddContentOpen, setIsAddContentOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [isEditProductOpen, setIsEditProductOpen] = useState(false);

    useEffect(() => {
        if (user) {
            loadData();
        } else {
            const timer = setTimeout(() => setLoading(false), 500);
            return () => clearTimeout(timer);
        }
    }, [user, activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'inventory') {
                const res = await fetch('https://upstartpy.onrender.com/products/my_products/', {
                    headers: { Authorization: `Bearer ${user.access}` }
                });
                if (res.ok) setProducts(await res.json());
            } else {
                const res = await fetch(`https://upstartpy.onrender.com/customers/mycontents/?_=${Date.now()}`, {
                    headers: { Authorization: `Bearer ${user.access}` }
                });
                if (res.ok) setContents(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id: number) => {
        if (!confirm("Delete product?")) return;
        try {
            const res = await fetch(`https://upstartpy.onrender.com/products/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user.access}` }
            });
            if (res.ok) {
                setProducts(prev => prev.filter(p => p.id !== id));
                showToast("Product deleted", "success");
            } else {
                showToast("Failed to delete product", "error");
            }
        } catch (e) { showToast("Error deleting product", "error"); }
    };

    const handleCreateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        try {
            const res = await fetch('https://upstartpy.onrender.com/products/create', {
                method: 'POST',
                headers: { Authorization: `Bearer ${user.access}` },
                body: formData
            });
            if (res.ok) {
                setIsAddProductOpen(false);
                (e.target as HTMLFormElement).reset();
                loadData();
                showToast("Product created successfully", "success");
            } else {
                showToast("Failed to create product", "error");
            }
        } catch (err) { showToast("Error creating product", "error"); }
    };

    const handleUpdateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const data: any = Object.fromEntries(fd.entries());
        try {
            const res = await fetch(`https://upstartpy.onrender.com/products/${editingProduct.id}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.access}`
                },
                body: JSON.stringify({
                    product_name: data.product_name,
                    description: data.description,
                    price: parseFloat(data.price),
                    quantity: parseInt(data.quantity),
                    category: data.category
                })
            });
            if (res.ok) {
                setIsEditProductOpen(false);
                setEditingProduct(null);
                loadData();
                showToast("Product updated", "success");
            } else { showToast("Failed to update product", "error"); }
        } catch (e) { showToast("Error updating product", "error"); }
    };

    if (!user) return <div className="p-10 text-center">Please login</div>;

    return (
        <div className="container mx-auto px-5 py-10 w-full max-w-[1400px]">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-[#1d1d1d]">Inventory Management</h1>
                {activeTab === 'inventory' ? (
                    <button
                        className="bg-[#1c6ef2] text-white px-6 py-2.5 rounded-lg font-semibold shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all"
                        onClick={() => setIsAddProductOpen(true)}
                    >
                        + Add Product
                    </button>
                ) : (
                    <button
                        className="bg-[#1c6ef2] text-white px-6 py-2.5 rounded-lg font-semibold shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all"
                        onClick={() => setIsAddContentOpen(true)}
                    >
                        + Add Content
                    </button>
                )}
            </div>

            <div className="flex gap-5 border-b border-gray-200 mb-8">
                <button
                    className={`pb-2.5 px-4 font-semibold text-sm transition-all border-b-2 ${activeTab === 'inventory' ? 'text-[#1c6ef2] border-[#1c6ef2]' : 'text-gray-500 border-transparent hover:text-[#1c6ef2]'}`}
                    onClick={() => setActiveTab('inventory')}
                >
                    My Products
                </button>
                <button
                    className={`pb-2.5 px-4 font-semibold text-sm transition-all border-b-2 ${activeTab === 'content' ? 'text-[#1c6ef2] border-[#1c6ef2]' : 'text-gray-500 border-transparent hover:text-[#1c6ef2]'}`}
                    onClick={() => setActiveTab('content')}
                >
                    My Content
                </button>
            </div>

            {loading ? <p className="text-center py-10 text-gray-500">Loading...</p> : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6">
                    {activeTab === 'inventory' && products.map(p => (
                        <div key={p.id} className="bg-white rounded-xl overflow-hidden shadow-legacy-card hover:shadow-legacy-hover hover:-translate-y-1 transition-all duration-300">
                            <img src={p.image_url?.[0] || '/placeholder.svg'} className="w-full h-40 object-cover bg-gray-50" alt={p.product_name} />
                            <div className="p-4">
                                <div className="font-semibold text-[#1d1d1d] mb-1 truncate">{p.product_name}</div>
                                <div className="text-[#ffb800] font-bold mb-2">₦{p.price}</div>
                                <div className="text-xs text-gray-500 mb-3">Qty: {p.quantity} | Views: {p.view_count || 0}</div>
                                <div className="flex gap-2">
                                    <button
                                        className="flex-1 py-1.5 bg-[#1c6ef2] text-white text-xs rounded hover:bg-[#165bbd] transition-colors"
                                        onClick={() => { setEditingProduct(p); setIsEditProductOpen(true); }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="flex-1 py-1.5 bg-[#ff4d4d] text-white text-xs rounded hover:bg-[#e63e3e] transition-colors"
                                        onClick={() => handleDeleteProduct(p.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {activeTab === 'inventory' && products.length === 0 && (
                        <div className="col-span-full text-center py-10 text-gray-500">No products found. Add one!</div>
                    )}

                    {activeTab === 'content' && contents.map((c, i) => (
                        <div key={i} className="bg-white rounded-xl overflow-hidden shadow-legacy-card">
                            <div className="bg-black w-full h-40">
                                <video src={c.video} className="w-full h-full object-cover"></video>
                            </div>
                            <div className="p-4">
                                <div className="font-medium text-[#1d1d1d] truncate">{c.caption || 'Untitled'}</div>
                            </div>
                        </div>
                    ))}

                    {activeTab === 'content' && contents.length === 0 && (
                        <div className="col-span-full text-center py-10 text-gray-500">No content found. Upload something!</div>
                    )}
                </div>
            )}

            {/* Add Product Modal */}
            {isAddProductOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsAddProductOpen(false)}>
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeIn" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4 text-[#1d1d1d]">Add New Product</h3>
                        <form onSubmit={handleCreateProduct}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1 text-[#1d1d1d]">Name</label>
                                <input name="product_name" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1c6ef2]" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1 text-[#1d1d1d]">Price</label>
                                <input name="price" type="number" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1c6ef2]" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1 text-[#1d1d1d]">Category</label>
                                <input name="category" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1c6ef2]" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1 text-[#1d1d1d]">Quantity</label>
                                <input name="quantity" type="number" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1c6ef2]" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1 text-[#1d1d1d]">Description</label>
                                <textarea name="description" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1c6ef2] min-h-[80px]"></textarea>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-1 text-[#1d1d1d]">Images</label>
                                <input type="file" name="image_url" multiple required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#f4f6fa] file:text-[#1c6ef2] hover:file:bg-[#e0e7ff]" />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setIsAddProductOpen(false)} className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-[#1c6ef2] text-white font-semibold rounded-lg hover:bg-[#165bbd] transition-colors">Create Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Product Modal */}
            {isEditProductOpen && editingProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsEditProductOpen(false)}>
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeIn" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4 text-[#1d1d1d]">Edit Product</h3>
                        <form onSubmit={handleUpdateProduct}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1 text-[#1d1d1d]">Name</label>
                                <input name="product_name" defaultValue={editingProduct.product_name} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1c6ef2]" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1 text-[#1d1d1d]">Price</label>
                                <input name="price" type="number" defaultValue={editingProduct.price} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1c6ef2]" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1 text-[#1d1d1d]">Category</label>
                                <input name="category" defaultValue={editingProduct.category} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1c6ef2]" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1 text-[#1d1d1d]">Quantity</label>
                                <input name="quantity" type="number" defaultValue={editingProduct.quantity} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1c6ef2]" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1 text-[#1d1d1d]">Description</label>
                                <textarea name="description" defaultValue={editingProduct.description} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1c6ef2] min-h-[80px]"></textarea>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setIsEditProductOpen(false)} className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-[#1c6ef2] text-white font-semibold rounded-lg hover:bg-[#165bbd] transition-colors">Update Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
