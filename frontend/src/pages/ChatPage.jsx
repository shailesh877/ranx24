import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FaPaperPlane, FaArrowLeft, FaPhone, FaEllipsisV, FaCheck, FaCheckDouble, FaClock, FaImage, FaTimes } from 'react-icons/fa';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import Navbar from '../components/Navbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';

const ChatPage = () => {
    const { bookingId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { socket } = useSocket();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [chatId, setChatId] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [uploading, setUploading] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);

    const workerName = location.state?.workerName || 'Chat';
    const workerId = location.state?.workerId;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const userStr = localStorage.getItem('user') || localStorage.getItem('worker');
        if (userStr) {
            setCurrentUser(JSON.parse(userStr));
        }
        initializeChat();

        return () => {
            if (socket && chatId) {
                socket.emit('leave_chat', chatId);
            }
        };
    }, [bookingId]);

    useEffect(() => {
        if (socket && chatId) {
            socket.emit('join_chat', chatId);

            socket.on('chat_message', (data) => {
                if (data.chatId === chatId) {
                    setMessages(prev => {
                        const exists = prev.some(m => m._id === data.message._id);
                        if (exists) return prev;
                        return [...prev, data.message];
                    });
                    scrollToBottom();

                    if (currentUser && data.message.sender !== currentUser._id) {
                        markAsRead();
                    }
                }
            });

            socket.on('typing_status', (data) => {
                if (data.chatId === chatId && data.userId !== currentUser?._id) {
                    setIsTyping(data.isTyping);
                }
            });

            socket.on('messages_read', (data) => {
                if (data.chatId === chatId) {
                    setMessages(prev => prev.map(msg => ({
                        ...msg,
                        read: msg.sender === currentUser?._id ? true : msg.read
                    })));
                }
            });

            return () => {
                socket.off('chat_message');
                socket.off('typing_status');
                socket.off('messages_read');
            };
        }
    }, [socket, chatId, currentUser]);

    const initializeChat = async () => {
        try {
            const response = await api.post(`/chat/booking/${bookingId}`);
            setChatId(response.data._id);
            setMessages(response.data.messages || []);
            setLoading(false);
            scrollToBottom();
        } catch (error) {
            console.error('Error initializing chat:', error);
            setLoading(false);
        }
    };

    const markAsRead = async () => {
        if (!chatId) return;
        try {
            await api.patch(`/chat/${chatId}/read`);
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);

        if (socket && chatId) {
            socket.emit('typing', { chatId, isTyping: true });
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('typing', { chatId, isTyping: false });
            }, 2000);
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await api.post('/chat/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            sendMessage(null, 'image', response.data.url);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const sendMessage = async (e, type = 'text', mediaUrl = '') => {
        if (e) e.preventDefault();
        if ((!newMessage.trim() && type === 'text') || !chatId) return;

        const messageContent = type === 'text' ? newMessage : '📷 Image';
        const tempId = Date.now().toString();

        const tempMessage = {
            _id: tempId,
            message: messageContent,
            sender: currentUser._id,
            timestamp: new Date().toISOString(),
            read: false,
            delivered: false,
            pending: true,
            type,
            mediaUrl
        };

        setMessages(prev => [...prev, tempMessage]);
        if (type === 'text') setNewMessage('');
        scrollToBottom();

        try {
            const payload = {
                message: messageContent,
                type,
                mediaUrl
            };

            const response = await api.post(`/chat/${chatId}/message`, payload);

            setMessages(prev => prev.map(msg =>
                msg._id === tempId ? response.data.messages[response.data.messages.length - 1] : msg
            ));
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const renderMessageStatus = (msg) => {
        if (msg.sender !== currentUser?._id) return null;
        if (msg.pending) return <FaClock className="text-gray-400 text-[10px]" />;
        if (msg.read) return <FaCheckDouble className="text-blue-500 text-[10px]" />;
        return <FaCheck className="text-gray-400 text-[10px]" />;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 font-[Poppins]">
                <Navbar />
                <div className="max-w-4xl mx-auto py-6 px-4 h-[calc(100vh-80px)]">
                    <Skeleton height="100%" className="rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-[Poppins] flex flex-col">
            <Navbar />
            <div className="flex-1 max-w-4xl mx-auto w-full p-4 h-[calc(100vh-80px)]">
                <Card className="h-full flex flex-col p-0 overflow-hidden shadow-xl border-0">
                    {/* Header */}
                    <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between shadow-sm z-10">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                                <FaArrowLeft />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                                        {workerName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-900">{workerName}</h2>
                                    <p className="text-xs text-green-600 font-medium animate-pulse">
                                        {isTyping ? 'Typing...' : 'Online'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                                <FaPhone />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                                <FaEllipsisV />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                        {messages.map((msg, index) => {
                            const isMe = msg.sender === currentUser?._id;
                            return (
                                <div key={msg._id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] sm:max-w-[60%] rounded-2xl px-4 py-3 shadow-sm ${isMe
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                                        }`}>
                                        {msg.type === 'image' ? (
                                            <div className="mb-2">
                                                <img
                                                    src={msg.mediaUrl}
                                                    alt="Shared image"
                                                    className="rounded-lg max-h-60 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                                    onClick={() => window.open(msg.mediaUrl, '_blank')}
                                                />
                                            </div>
                                        ) : (
                                            <p className="text-sm leading-relaxed">{msg.message}</p>
                                        )}
                                        <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                            <span className="text-[10px]">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {renderMessageStatus(msg)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="bg-white p-4 border-t border-gray-100">
                        <form onSubmit={(e) => sendMessage(e)} className="flex items-center gap-3">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileSelect}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50"
                            >
                                {uploading ? (
                                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                                ) : (
                                    <FaImage size={20} />
                                )}
                            </button>

                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={handleTyping}
                                    placeholder="Type a message..."
                                    className="w-full bg-gray-100 text-gray-900 placeholder-gray-500 border-0 rounded-full py-3 px-5 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!newMessage.trim() && !uploading}
                                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md hover:shadow-lg transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FaPaperPlane size={18} />
                            </button>
                        </form>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ChatPage;
