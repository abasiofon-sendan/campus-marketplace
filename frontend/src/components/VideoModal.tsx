"use client";
import React, { useEffect, useRef } from 'react';
import { X, Heart, MessageCircle } from 'lucide-react';

interface VideoModalProps {
    video: string;
    caption: string;
    likes?: number;
    views?: number;
    onClose: () => void;
}

export default function VideoModal({ video, caption, likes = 0, views = 0, onClose }: VideoModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        // Lock scroll when modal is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
            // Cleanup video
            if (videoRef.current) {
                videoRef.current.pause();
            }
        };
    }, []);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/85 z-[1000] flex items-center justify-center animate-fadeIn" onClick={handleBackdropClick}>
            <div className="flex w-[95%] md:w-[90%] max-w-[1000px] h-[90vh] md:h-[85vh] bg-black rounded-xl overflow-hidden relative shadow-2xl flex-col md:flex-row">
                <button className="absolute top-2.5 right-2.5 md:top-4 md:right-4 z-10 bg-black/50 text-white border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer transition-all hover:bg-white/20" onClick={onClose}>
                    <X size={24} />
                </button>

                <div className="w-full md:flex-1 bg-black flex items-center justify-center h-[50%] md:h-full flex-shrink-0">
                    <video
                        ref={videoRef}
                        className="max-w-full max-h-full object-contain"
                        controls
                        autoPlay
                        playsInline
                        src={video}
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>

                <div className="w-full flex-1 md:w-[350px] bg-white p-4 md:p-6 flex flex-col border-l border-[#333] overflow-hidden">
                    <div className="video-header mb-4 flex-shrink-0">
                        <h3 className="text-lg font-semibold text-[#333]">{caption || 'Untitled Video'}</h3>
                    </div>

                    <div className="bg-[#f4f6fa] p-3 rounded-lg flex-shrink-0 mb-4">
                        <div className="flex justify-between mb-1.5 text-sm text-[#555]">
                            <span>Views</span>
                            <span className="font-medium">{views}</span>
                        </div>
                        <div className="flex justify-between text-sm text-[#555]">
                            <span>Likes</span>
                            <span className="font-medium">{likes}</span>
                        </div>
                    </div>

                    {/* Comments Area (Scrollable) */}
                    <div className="flex-1 overflow-y-auto mb-4 min-h-[80px] pr-2 custom-scrollbar">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">Comments</h4>
                        <div className="flex flex-col gap-4">
                            <p className="text-sm text-center text-gray-500 italic mt-4">No comments yet. Be the first to comment!</p>
                            {/* Example of how a comment would look when added */}
                            {/* <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0"></div>
                                <div>
                                    <span className="text-xs font-semibold text-gray-900 mr-2">User</span>
                                    <span className="text-sm text-gray-700">Great video!</span>
                                </div>
                            </div> */}
                        </div>
                    </div>

                    {/* Action Buttons & Input */}
                    <div className="mt-auto flex flex-col gap-3 flex-shrink-0 pt-3 border-t border-gray-100">
                        <div className="flex gap-4">
                            <button className="flex items-center gap-2 px-4 py-2 border border-[#eee] rounded-full bg-white cursor-pointer text-sm text-[#444] transition-all justify-center hover:bg-gray-50 hover:border-red-200 hover:text-red-500">
                                <Heart size={20} />
                                <span className="font-semibold">{likes}</span>
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 border border-[#eee] rounded-full bg-white cursor-pointer text-sm text-[#444] transition-all justify-center hover:bg-gray-50 hover:border-blue-200 hover:text-blue-500">
                                <MessageCircle size={20} />
                                <span className="font-semibold">0</span>
                            </button>
                        </div>
                        <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                            <input 
                                type="text" 
                                placeholder="Add a comment..." 
                                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white" 
                            />
                            <button 
                                type="submit" 
                                className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                Post
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
