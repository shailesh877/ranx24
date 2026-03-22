import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend.ranx24.com/api';

export default function ChatWindow({ bookingId, isOpen, onClose, userRole }) {
    const [chat, setChat] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const socket = useSocket();

    useEffect(() => {
        if (isOpen && bookingId) {
            fetchChat();
        }
    }, [isOpen, bookingId]);

    useEffect(() => {
        if (socket) {
            socket.on('chat_message', (data) => {
                if (data.bookingId === bookingId) {
                    setChat((prevChat) => {
                        if (!prevChat) return prevChat;
                        // Avoid duplicates if any
                        const exists = prevChat.messages.some(m => m._id === data.message._id); // Assuming message has _id, or check content/timestamp
                        if (exists) return prevChat;

                        return {
                            ...prevChat,
                            messages: [...prevChat.messages, data.message]
                        };
                    });
                    scrollToBottom();
                    // If chat is open and we received a message, mark it as read
                    markMessagesAsRead();
                }
            });

            socket.on('messages_read', (data) => {
                if (data.bookingId === bookingId) {
                    setChat((prevChat) => {
                        if (!prevChat) return prevChat;
                        return {
                            ...prevChat,
                            messages: prevChat.messages.map(msg => {
                                // If I am the sender, mark my messages as read
                                const isMyMessage = msg.senderModel === (userRole === 'user' ? 'User' : 'Worker');
                                return isMyMessage ? { ...msg, read: true } : msg;
                            })
                        };
                    });
                }
            });

            return () => {
                socket.off('chat_message');
                socket.off('messages_read');
            };
        }
    }, [socket, bookingId, chat?._id]); // Added chat._id dependency for markMessagesAsRead

    useEffect(() => {
        scrollToBottom();
    }, [chat?.messages]);

    const fetchChat = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(
                `${API_URL}/chat/booking/${bookingId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setChat(data);
        } catch (error) {
            console.error('Error fetching chat:', error);
            toast.error('Failed to load chat');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(
                `${API_URL}/chat/${chat._id}/message`,
                { message },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setChat(data);
            setMessage('');
            // toast.success('Message sent!'); // Optional: remove toast for cleaner chat experience
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        }
    };

    const markMessagesAsRead = async () => {
        if (!chat?._id) return;
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `${API_URL}/chat/${chat._id}/read`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    useEffect(() => {
        if (chat?.messages?.length > 0) {
            markMessagesAsRead();
        }
    }, [chat?.messages?.length]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-blue-600 text-white rounded-t-2xl">
                    <div>
                        <h3 className="text-lg font-bold">Chat with {userRole === 'user' ? 'Worker' : 'User'}</h3>
                        {chat?.booking && (
                            <p className="text-sm opacity-90">{chat.booking.service}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-red-300 text-2xl font-bold"
                    >
                        &times;
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                    {loading ? (
                        <p className="text-center text-gray-500">Loading chat...</p>
                    ) : chat?.messages.length === 0 ? (
                        <p className="text-center text-gray-500 mt-10">
                            No messages yet. Start the conversation!
                        </p>
                    ) : (
                        chat?.messages.map((msg, idx) => {
                            const isMyMessage = msg.senderModel === (userRole === 'user' ? 'User' : 'Worker');
                            return (
                                <div
                                    key={idx}
                                    className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[70%] p-3 rounded-lg ${isMyMessage
                                            ? 'bg-blue-500 text-white rounded-br-none'
                                            : 'bg-white text-gray-800 rounded-bl-none shadow'
                                            }`}
                                    >
                                        <p className="text-sm">{msg.message}</p>
                                        <div className="flex justify-end items-center gap-1 mt-1">
                                            <p
                                                className={`text-xs ${isMyMessage ? 'text-blue-100' : 'text-gray-500'
                                                    }`}
                                            >
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            {isMyMessage && (
                                                <span className="text-xs text-white font-bold">
                                                    {msg.read ? '✓✓' : '✓'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t bg-white rounded-b-2xl">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Type your message..."
                            required
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
