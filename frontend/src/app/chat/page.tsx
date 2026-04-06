"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Message {
    text: string;
    timestamp: string;
    sender: number;
    conversation_id: number;
    is_read?: boolean;
}

interface Conversation {
    id: number;
    unread_count?: number;
    last_message?: {
        text: string;
        timestamp: string;
        sender: number;
        is_read: boolean;
    };
    other_user: {
        id: number;
        username: string;
        profile_picture: string;
        status: boolean; // Online status
        last_seen: string;
    };
    [key: string]: any;
}

export default function ChatPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageText, setMessageText] = useState('');
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // UI Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Dynamic Online Status Logic (Timer based)
    const [headerStatus, setHeaderStatus] = useState<string>("Online");

    // Connect to WebSocket
    useEffect(() => {
        if (!user) return;

        const ws = new WebSocket(`wss://upstartpy.onrender.com/ws/chat?token=${user.access}`);

        ws.onopen = () => {
            console.log("WS Connected");
            setLoading(false);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleWebSocketMessage(data);
            } catch (e) {
                console.error("WS Message Error", e);
            }
        };

        ws.onclose = () => {
            console.log("WS Closed");
        };

        setSocket(ws);

        return () => {
            ws.close();
        };
    }, [user]);

    // Handle incoming messages
    const handleWebSocketMessage = (data: any) => {
        switch (data.type) {
            case 'conversation_list':
                setConversations(data.conversations || []);
                break;
            case 'my_messages':
                console.log("Messages received", data.messages);
                setMessages(data.messages || []);
                scrollToBottom();
                break;
            case 'new_message':
                const newMsg: Message = {
                    text: data.message,
                    timestamp: data.timestamp,
                    sender: data.sender, // ID
                    conversation_id: data.conversation_id,
                    is_read: false
                };

                if (activeConversationId === data.conversation_id) {
                    setMessages(prev => [...prev, newMsg]);
                    scrollToBottom();
                    // If we are looking at this conversation, mark as read immediately
                    if (socket && socket.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify({
                            action: "mark_as_read",
                            conversation_id: data.conversation_id
                        }));
                    }
                }

                // Update conversation list preview
                setConversations(prev => prev.map(c => {
                    if (c.id === data.conversation_id) {
                        return {
                            ...c,
                            last_message: {
                                text: data.message,
                                timestamp: data.timestamp,
                                sender: data.sender,
                                is_read: false
                            },
                            unread_count: (data.sender !== user.user.id && activeConversationId !== data.conversation_id)
                                ? (c.unread_count || 0) + 1
                                : c.unread_count
                        };
                    }
                    return c;
                }));
                break;
            case 'mark_chat':
                // Update read status for messages
                if (data.conversation_id === activeConversationId) {
                    // Mark all local messages as read if I am the sender, or if I just read them? 
                    // Legacy logic: if data.sender === current.user.id -> means I marked them read?
                    // Actually legacy: const isSent = data.sender === currentUser.user.id
                    // markAsRead(data.conversation_id, isSent).
                    // Logic: "Only update if the OTHER person is reading MY messages".

                    // If data.sender is NOT me, it means they read my messages.
                    if (data.sender !== user.user.id) {
                        setMessages(prev => prev.map(m => m.sender === user.user.id ? { ...m, is_read: true } : m));
                    }
                }
                break;
            default:
                console.log("Unknown type", data.type);
        }
    };

    const selectConversation = (conv: Conversation) => {
        setActiveConversationId(conv.id);

        // Mobile sidebar handling
        if (window.innerWidth <= 768) {
            setIsSidebarOpen(false);
        }

        // Fetch messages for this conversation
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                action: "get_message",
                conversation_id: conv.id
            }));

            // Mark as read
            socket.send(JSON.stringify({
                action: "mark_as_read",
                conversation_id: conv.id
            }));
        }

        // Reset unread count locally for UI
        setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread_count: 0 } : c));

        // Online Status logic
        if (conv.other_user.status) {
            setHeaderStatus("Online");
        } else {
            // Replicate legacy transition logic if desired, or simpler:
            const lastSeen = new Date(conv.other_user.last_seen);
            setHeaderStatus(lastSeen.toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }));
        }
    };

    const sendMessage = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!messageText.trim() || !activeConversationId || !socket) return;

        socket.send(JSON.stringify({
            action: "send_message",
            conversation_id: activeConversationId,
            message: messageText
        }));

        setMessageText("");
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            const list = document.getElementById("messagesList");
            if (list) list.scrollTop = list.scrollHeight;
        }, 100);
    };

    // Close sidebar on click outside (mobile)
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node) && !(e.target as Element).closest('#sidebarToggleBtn') && !(e.target as Element).closest('#sidebarToggleBtnDetail')) {
                setIsSidebarOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isSidebarOpen]);


    if (!user) return <div className="p-8">Please login...</div>;

    const activeConv = conversations.find(c => c.id === activeConversationId);

    return (
        <div className="flex h-[calc(100vh-70px)] overflow-hidden relative md:grid md:grid-cols-[300px_1fr]" ref={chatContainerRef}>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 top-[70px] bg-black/40 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div 
                className={`fixed inset-y-0 left-0 top-[70px] bottom-0 w-[280px] sm:w-[85vw] sm:max-w-[300px] bg-white border-r border-[#e5e7eb] z-50 transition-transform duration-300 md:relative md:w-full md:inset-auto md:transform-none md:z-0 md:flex md:flex-col md:h-full ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
                ref={sidebarRef}
            >
                <div className="p-4 border-b border-[#e5e7eb] bg-white shrink-0 sticky top-0 z-50 md:static">
                    <h2 className="text-lg font-semibold">Messages</h2>
                </div>
                <div className="flex-1 overflow-y-auto overflow-x-hidden" id="conversationsList">
                    {conversations.length === 0 && !loading && (
                        <div className="p-5 text-center text-[#4b4b4b] text-sm">
                            No conversations yet
                        </div>
                    )}

                    {conversations.map(conv => {
                        const isSent = conv.last_message?.sender === user.user.id;
                        let readStatus = '';
                        if (isSent && conv.last_message) {
                            readStatus = conv.last_message.is_read ? "Seen" : "Delivered";
                        }

                        return (
                            <div
                                key={conv.id}
                                className={`relative flex items-center gap-3 p-3 cursor-pointer border-b border-[#e5e7eb] transition-colors duration-200 hover:bg-[#f4f6fa] ${activeConversationId === conv.id ? 'bg-[#f4f6fa] border-l-[3px] border-l-[#1c6ef2]' : ''}`}
                                onClick={() => selectConversation(conv)}
                            >
                                <img src={conv.other_user.profile_picture || '/placeholder.svg'} alt={conv.other_user.username} className="w-12 h-12 rounded-full object-cover shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="text-sm font-semibold text-[#1d1d1d] mb-1 truncate">{conv.other_user.username}</div>
                                        {(conv.unread_count || 0) > 0 && <span className="bg-[#ff4d4d] text-white rounded-full px-2 py-0.5 text-xs font-semibold ml-2 inline-block">{conv.unread_count}</span>}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-[#4b4b4b]">
                                        <span className="flex-1 min-w-0 truncate">{conv.last_message?.text || "No messages yet"}</span>
                                        <span className="shrink-0 text-[#4b4b4b] whitespace-nowrap opacity-95">{readStatus}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Chat */}
            <div className="flex flex-col bg-white h-full overflow-hidden relative w-full">
                {!activeConversationId ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#4b4b4b]" id="chatEmpty">
                        <div className="flex items-center p-3 bg-[#ffb800] border-b border-[#e5e7eb] min-h-[56px] absolute top-0 left-0 w-full z-10 md:hidden">
                            <button className="flex items-center justify-center p-2 mr-2 text-xl cursor-pointer text-[#1d1d1d] hover:text-[#1c6ef2] transition-colors" id="sidebarToggleBtn" onClick={(e) => { e.stopPropagation(); setIsSidebarOpen(!isSidebarOpen); }}>
                                ☰
                            </button>
                        </div>
                        <div className="text-6xl mb-4">💬</div>
                        <p>Select a conversation to start chatting</p>
                    </div>
                ) : (
                    <div className="flex flex-col h-full overflow-hidden" id="chatView">
                        <div className="flex items-center justify-between p-4 border-b border-[#e5e7eb] bg-[#ffb800] shrink-0 min-h-[56px] md:justify-between sm:p-3">
                            <button className="flex md:hidden items-center justify-center p-2 mr-2 text-xl cursor-pointer text-[#1d1d1d] hover:text-[#1c6ef2] transition-colors shrink-0" id="sidebarToggleBtnDetail" onClick={(e) => { e.stopPropagation(); setIsSidebarOpen(!isSidebarOpen); }}>
                                ☰
                            </button>
                            <div className="flex items-center gap-3 cursor-pointer flex-1 min-w-0" onClick={() => router.push(`/vendor-profile?vendorId=${activeConv?.other_user.id}`)}>
                                <img src={activeConv?.other_user.profile_picture || '/placeholder.svg'} alt="User" className="w-10 h-10 rounded-full object-cover shrink-0 sm:w-9 sm:h-9" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-[#1c6ef2] truncate">{activeConv?.other_user.username}</div>
                                    <div className="text-xs text-white truncate">{headerStatus}</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-3 pb-4 sm:p-3 sm:gap-2" id="messagesList">
                            {messages.map((msg, idx) => {
                                const isSent = msg.sender === user.user.id;
                                const isLastMessage = idx === messages.length - 1;
                                let statusText = "";
                                if (isSent && isLastMessage) {
                                    statusText = msg.is_read ? " • Seen" : " • Delivered";
                                }

                                return (
                                    <div key={idx} className={`flex flex-col max-w-full ${isSent ? "items-end" : "items-start"}`}>
                                        <div className={`p-3 px-3.5 rounded-xl text-sm leading-relaxed inline-block max-w-[70%] break-words sm:max-w-[75%] ${isSent ? "bg-[#1c6ef2] text-white" : "bg-[#ffb800] text-white"}`}>{msg.text}</div>
                                        <div className="text-[11px] text-[#4b4b4b] mt-1 ml-0.5 sm:text-[10px]">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            {statusText}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="flex gap-2 p-4 border-t border-[#e5e7eb] bg-white shrink-0 sm:p-2.5 sm:gap-1.5">
                            <input
                                type="text"
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Type a message..."
                                className="flex-1 border border-[#e5e7eb] rounded-lg p-2.5 px-3 text-sm focus:outline-none focus:border-[#1c6ef2] sm:text-[13px] sm:p-[9px_10px]"
                            />
                            <button className="bg-[#1c6ef2] text-white w-10 h-10 rounded-lg flex items-center justify-center text-lg hover:scale-105 transition-transform duration-300 cursor-pointer border-none sm:w-9 sm:h-9 sm:text-base" onClick={() => sendMessage()}>→</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
