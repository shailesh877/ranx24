import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCommentDots, FaSearch, FaCircle } from 'react-icons/fa';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';

const ChatListPage = () => {
    const navigate = useNavigate();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchChats();
    }, []);

    const fetchChats = async () => {
        try {
            const response = await api.get('/chat');
            setChats(response.data);
        } catch (error) {
            console.error('Error fetching chats:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredChats = chats.filter(chat =>
        chat.otherPerson.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 font-[Poppins]">
            <Navbar />
            <div className="max-w-3xl mx-auto py-10 px-4">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                    <p className="text-gray-600">Connect with your service providers</p>
                </div>

                <Card className="p-0 overflow-hidden min-h-[500px] flex flex-col">
                    {/* Search Header */}
                    <div className="p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Chat List */}
                    <div className="divide-y divide-gray-50 flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex gap-4">
                                        <Skeleton width="48px" height="48px" className="rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton width="60%" height="20px" />
                                            <Skeleton width="40%" height="16px" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredChats.length === 0 ? (
                            <div className="h-full flex items-center justify-center p-8">
                                <EmptyState
                                    icon={<FaCommentDots size={48} className="text-gray-300" />}
                                    title="No messages yet"
                                    description={searchTerm ? 'No chats found matching your search' : 'Start a conversation by booking a service'}
                                />
                            </div>
                        ) : (
                            filteredChats.map((chat) => (
                                <div
                                    key={chat._id}
                                    onClick={() => navigate(`/chat/${chat.bookingId}`, {
                                        state: {
                                            workerName: chat.otherPerson.name,
                                            workerId: chat.otherPerson._id
                                        }
                                    })}
                                    className="p-4 hover:bg-blue-50/50 transition-colors cursor-pointer group relative"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            {chat.otherPerson.profileImage ? (
                                                <img
                                                    src={chat.otherPerson.profileImage}
                                                    alt={chat.otherPerson.name}
                                                    className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                                    {chat.otherPerson.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            {/* Online Status Indicator (Mock) */}
                                            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                                    {chat.otherPerson.name}
                                                </h3>
                                                <span className="text-xs text-gray-400 whitespace-nowrap">
                                                    {new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="warning" size="sm" className="text-[10px] py-0 px-2 h-5">
                                                    {chat.serviceName}
                                                </Badge>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <p className={`text-sm truncate pr-4 ${chat.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                                    {chat.lastMessage}
                                                </p>
                                                {chat.unreadCount > 0 && (
                                                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold shadow-sm animate-pulse">
                                                        {chat.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ChatListPage;
