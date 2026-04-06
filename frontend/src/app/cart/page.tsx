"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ProductModal from '@/components/ProductModal';

export default function CartPage(): JSX.Element {
    const { user } = useAuth();
    const router = useRouter();
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchCart = async () => {
        try {
            const res = await fetch('https://upstartpy.onrender.com/cart/cart-items/', {
                headers: {
                    Authorization: `Bearer ${user?.access}`,
                    "Content-Type": "application/json"
                }
            });
            if (res.ok) {
                const data = await res.json();
                setCartItems(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (productId: any) => {
        try {
            const res = await fetch(`https://upstartpy.onrender.com/cart/cart-items/${productId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user?.access}` }
            });

            if (res.ok) {
                setCartItems(prev => prev.filter(item => {
                    const id = item.productId || item.product || item.id;
                    return id !== productId;
                }));
            } else {
                setCartItems(prev => prev.filter(item => {
                    const id = item.productId || item.product || item.id;
                    return id !== productId;
                }));
            }
        } catch (e) {
            console.error("Failed to remove item", e);
        }
    };

    const updateQuantity = (productId: any, change: number) => {
        setCartItems(prev => prev.map(item => {
            const id = item.productId || item.product || item.id;
            if (id === productId) {
                const newQty = (item.quantity || 1) + change;
                if (newQty <= 0) return null;
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(Boolean));
    };

    const subtotal = cartItems.reduce((acc, item) => {
        const price = Number(item.product_price || item.price || 0);
        const qty = Number(item.quantity || 1);
        return acc + (price * qty);
    }, 0);
    const shipping = cartItems.length > 0 ? 5 : 0;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    const handleProductClick = async (productId: any) => {
        try {
            const res = await fetch(`https://upstartpy.onrender.com/products/${productId}`);
            if (res.ok) {
                const data = await res.json();
                setSelectedProduct(data);
                setIsModalOpen(true);
            }
        } catch (e) { }
    };

    if (!user && !loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-legacy-card max-w-2xl mx-auto mt-10">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Please log in to view cart</h2>
                <button
                    className="bg-[#ffb800] text-white py-3 px-8 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all"
                    onClick={() => router.push('/login')}
                >
                    Login
                </button>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6 container mx-auto px-5 py-10" style={{ minWidth: '100%' }}>

            {/* Cart Items Section */}
            <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold mb-2 text-[#1d1d1d]">Shopping Cart</h2>

                {loading ? (
                    <div className="bg-white rounded-xl p-8 text-center shadow-legacy-card">
                        <p>Loading cart...</p>
                    </div>
                ) : cartItems.length === 0 ? (
                    <div className="bg-white rounded-xl p-16 text-center shadow-legacy-card flex flex-col items-center">
                        <div className="text-5xl mb-4">🛒</div>
                        <div className="text-gray-500 text-lg mb-6">Your cart is empty</div>
                        <button
                            onClick={() => router.push('/')}
                            className="bg-[#ffb800] text-white py-3 px-8 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
                        >
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {cartItems.map((item, idx) => {
                            const productId = item.productId || item.product || item.id;
                            const imageSrc = item.product_image?.[0] || '/placeholder.svg';
                            const name = item.product_name || item.name;
                            const price = Number(item.product_price || item.price || 0);
                            const qty = Number(item.quantity || 1);

                            return (
                                <div
                                    key={idx}
                                    className="bg-white rounded-xl p-4 shadow-legacy-card hover:shadow-legacy-hover group transition-all duration-300 grid grid-cols-[100px_1fr] md:grid-cols-[200px_1fr_auto] gap-4 cursor-pointer hover:-translate-y-1"
                                    onClick={() => handleProductClick(productId)}
                                >
                                    <img
                                        src={imageSrc}
                                        alt={name}
                                        className="w-full h-[100px] md:h-[200px] rounded-lg object-cover bg-gray-50"
                                    />
                                    <div className="flex flex-col justify-between py-1">
                                        <div>
                                            <div className="text-base font-semibold text-[#1d1d1d] mb-1">{name}</div>
                                            <div className="text-sm text-[#4b4b4b]">Vendor Name</div>
                                        </div>
                                        <div className="text-sm text-[#ffb800] font-bold">₦{price.toFixed(2)}</div>
                                    </div>
                                    <div className="flex flex-col items-end justify-between gap-3">
                                        <div className="flex items-center gap-2 bg-[#f4f6fa] rounded-md p-1" onClick={e => e.stopPropagation()}>
                                            <button
                                                className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm hover:shadow text-sm text-[#1d1d1d]"
                                                onClick={() => updateQuantity(productId, -1)}
                                            >−</button>
                                            <input
                                                type="text"
                                                className="w-8 text-center bg-transparent border-none text-sm font-semibold focus:outline-none"
                                                value={qty}
                                                readOnly
                                            />
                                            <button
                                                className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm hover:shadow text-sm text-[#1d1d1d]"
                                                onClick={() => updateQuantity(productId, 1)}
                                            >+</button>
                                        </div>
                                        <button
                                            className="bg-[#ff4d4d] text-white px-3 py-1.5 rounded-md text-xs hover:scale-105 transition-transform duration-300"
                                            onClick={(e) => { e.stopPropagation(); removeFromCart(productId); }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Cart Summary */}
            <div className="bg-white rounded-xl p-6 shadow-legacy-card h-fit sticky top-[100px]">
                <h3 className="text-base font-semibold mb-4 text-[#1d1d1d]">Order Summary</h3>
                <div className="flex justify-between mb-3 text-sm text-[#4b4b4b]">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#1d1d1d]">₦{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-3 text-sm text-[#4b4b4b]">
                    <span>Shipping</span>
                    <span className="font-semibold text-[#1d1d1d]">₦{shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-3 text-sm text-[#4b4b4b]">
                    <span>Tax</span>
                    <span className="font-semibold text-[#1d1d1d]">₦{tax.toFixed(2)}</span>
                </div>
                <div className="h-[1px] bg-gray-200 my-4"></div>
                <div className="flex justify-between mb-6 text-lg font-bold text-[#1d1d1d]">
                    <span>Total</span>
                    <span>₦{total.toFixed(2)}</span>
                </div>
                <button
                    className="w-full py-3.5 bg-[#ffb800] text-white rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(255,184,0,0.3)] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={cartItems.length === 0}
                >
                    Checkout All
                </button>
            </div>

            {isModalOpen && selectedProduct && (
                <ProductModal
                    product={selectedProduct}
                    onClose={() => setIsModalOpen(false)}
                    addToCart={() => { }}
                />
            )}
        </div>
    );
}
