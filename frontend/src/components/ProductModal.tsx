"use client";
import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';

interface Product {
    _id?: string;
    product_name: string;
    description?: string;
    price: number;
    vendor_username?: string;
    vendor_email?: string;
    vendor_id?: string;
    pfp?: string;
    institute?: string;
    image_url?: string[];
    quantity?: number;
    category?: string;
    rating?: number;
    review_count?: number;
    likes?: number;
    view_count?: number;
}

interface ProductModalProps {
    product: Product | null;
    onClose: () => void;
    addToCart: (product: Product, quantity: number) => void;
}

export default function ProductModal({ product, onClose, addToCart }: ProductModalProps) {
    const [quantity, setQuantity] = useState(1);
    const { showToast } = useToast();

    if (!product) return null;

    const handleAddToCart = () => {
        addToCart(product, quantity);
        onClose();
        setQuantity(1); // Reset
    };

    const mainImage = (product.image_url && product.image_url.length > 0) ? product.image_url[0] : '/placeholder.svg';

    const handleVendorClick = () => {
        window.location.href = `/vendor-profile?vendorId=${product.vendor_id}`;
    };

    const handleShare = async () => {
        const shareUrl = new URL(window.location.href);
        // Assuming the product has an _id to form the URL mapping
        if (product._id) {
            shareUrl.searchParams.set("productId", product._id);
        }
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Check out ${product.product_name} on Upstart`,
                    text: `I found this amazing ${product.product_name} on Upstart. Check it out!`,
                    url: shareUrl.toString(),
                });
                showToast('Product shared successfully!', 'success');
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl.toString());
                showToast('Product link copied to clipboard!', 'success');
            } catch (error) {
                showToast('Failed to copy link', 'error');
            }
        }
    };

    const isVendorPage = typeof window !== 'undefined' && window.location.pathname.includes('vendor-profile');

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 overflow-y-auto p-5" onClick={onClose}>
            <div className="relative w-full max-w-[900px] max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-legacy-modal animate-slideInUp" onClick={(e) => e.stopPropagation()}>
                <button className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-900 rounded-full border-none cursor-pointer transition-all duration-300 hover:bg-gray-200 z-10" onClick={onClose}>✕</button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-10">
                    {/* Image Gallery */}
                    <div className="flex flex-col gap-3">
                        <div className="w-full h-[300px] bg-gray-50 rounded-xl overflow-hidden">
                            <img src={mainImage} alt={product.product_name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-wrap gap-3 p-1">
                            {/* Thumbnails logic could be added here if we had multiple images */}
                            {(product.image_url || []).map((img, i) => (
                                <img key={i} src={img} className={`w-[60px] h-[60px] rounded-md cursor-pointer object-cover border-2 border-transparent transition-all duration-200 hover:opacity-80 ${i === 0 ? '!border-amber-400' : ''}`} alt={`Thumbnail ${i}`} />
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col gap-5">
                        <h1 className="text-3xl text-gray-900 leading-tight font-bold">{product.product_name}</h1>

                        <div className="text-2xl font-bold text-amber-400">
                            <span>₦{product.price}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-amber-400 text-base">{'★'.repeat(Math.round(product.rating || 5))}</span>
                            <span className="text-sm text-gray-600">({product.review_count || 0} reviews)</span>
                        </div>

                        {/* Engagement */}
                        <div className="flex flex-wrap gap-4 mt-1 bg-gray-100 p-4">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 transition-all hover:bg-white hover:border-red-400 hover:text-red-500 cursor-pointer" title="Like this product">
                                ♡ <span id="likesCount">{product.likes || 0}</span> Likes
                            </button>
                            <span className="flex items-center gap-1.5 text-sm text-gray-600 px-3 py-1.5 rounded-lg">
                                👁 <span id="viewCount">{product.view_count || 0}</span> Views
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-100 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Available:</span>
                                <span className="text-base font-semibold text-gray-900">{product.quantity || 1}</span>
                            </div>
                        </div>

                        <div className="product-description">
                            <h3 className="text-base text-gray-900 mb-2 font-semibold">Description</h3>
                            <p className="text-sm leading-relaxed text-gray-600">{product.description || 'No description available.'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Location:</span>
                                <span className="text-sm font-medium text-gray-900"><b>{product.institute || 'N/A'}</b></span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Category:</span>
                                <span className="text-sm font-medium text-gray-900"><b>{product.category || 'General'}</b></span>
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <div className="mt-6 pt-6 border-gray-200 bg-gray-100 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900">Customer Reviews</h3>
                            <div className="flex flex-col gap-4">
                                <p className="text-center py-4 text-gray-500 text-sm italic">No reviews yet</p>
                            </div>
                        </div>

                        {/* Vendor Section */}
                        {!isVendorPage && (
                            <div className="mt-6">
                                <h3 className="text-base text-gray-900 mb-3 font-semibold">Seller Information</h3>
                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <img src={product.pfp || '/placeholder.svg'} alt="Vendor" className="w-[60px] h-[60px] rounded-full object-cover" />
                                        <div className="flex flex-col">
                                            <h4 className="text-sm font-semibold text-gray-900 mb-0.5">{product.vendor_username || 'Unknown Vendor'}</h4>
                                            <div className="flex items-center">
                                                <span className="text-amber-400 text-xs">★★★★★</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="vendor-actions">
                                        <button className="py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(28,110,242,0.3)] text-sm border border-blue-600 cursor-pointer" onClick={handleVendorClick}>View Profile</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-gray-100 sticky bottom-0 bg-white pb-2 md:relative md:border-t-0 md:bg-transparent md:pb-0">
                            <button className="w-full py-3 px-6 bg-amber-400 text-white rounded-lg font-semibold transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(255,184,0,0.3)] text-sm border-none cursor-pointer" onClick={handleAddToCart}>Add to Cart</button>
                            <div className="flex gap-2 w-full">
                                <button className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(28,110,242,0.3)] text-sm border border-blue-600 cursor-pointer">Contact Vendor</button>
                                <button className="p-2.5 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer transition-all hover:bg-white flex items-center justify-center shrink-0" aria-label="Share Product" onClick={handleShare}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="18" cy="5" r="3"></circle>
                                        <circle cx="6" cy="12" r="3"></circle>
                                        <circle cx="18" cy="19" r="3"></circle>
                                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
