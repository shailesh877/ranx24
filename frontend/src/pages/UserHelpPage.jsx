import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { FaPlus, FaPaperPlane, FaTicketAlt, FaCommentDots, FaUser, FaUserShield, FaCheckDouble, FaCheck } from 'react-icons/fa';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

export default function UserHelpPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const socket = useSocket();

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('support_message', (data) => {
        setTickets(prev => prev.map(t => {
          if (t._id === data.ticketId) {
            return { ...t, messages: [...t.messages, data.message] };
          }
          return t;
        }));

        if (selectedTicket && selectedTicket._id === data.ticketId) {
          setSelectedTicket(prev => ({
            ...prev,
            messages: [...prev.messages, data.message]
          }));
          markMessagesAsRead(data.ticketId);
        }
      });

      socket.on('messages_read', (data) => {
        if (selectedTicket && selectedTicket._id === data.ticketId && data.readBy !== 'user') {
          setSelectedTicket(prev => ({
            ...prev,
            messages: prev.messages.map(msg =>
              msg.sender !== 'user' ? msg : { ...msg, read: true }
            )
          }));
        }
      });

      socket.on('ticket_status_updated', (data) => {
        setTickets(prev => prev.map(t => {
          if (t._id === data.ticketId) {
            return { ...t, status: data.status };
          }
          return t;
        }));

        if (selectedTicket && selectedTicket._id === data.ticketId) {
          setSelectedTicket(prev => ({ ...prev, status: data.status }));
        }
      });

      return () => {
        socket.off('support_message');
        socket.off('ticket_status_updated');
      };
    }
  }, [socket, selectedTicket]);

  const fetchTickets = async () => {
    try {
      const { data } = await axiosInstance.get('/support/my');
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      // toast.error('Failed to load tickets'); // Suppress error on initial load if not logged in or empty
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      return toast.error('Please fill all fields');
    }

    try {
      await axiosInstance.post('/support', { subject, message, userType: 'user' });

      toast.success('Ticket created successfully!');
      setSubject('');
      setMessage('');
      setShowCreateForm(false);
      fetchTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error(error.response?.data?.message || 'Failed to create ticket');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await axiosInstance.post(`/support/${selectedTicket._id}/message`, { message: newMessage, sender: 'user' });

      setNewMessage('');
      fetchTickets(); // Refresh list to update last message preview

      // Optimistically update current chat view or re-fetch specific ticket if needed
      // For now, re-fetching all tickets is simple but maybe inefficient. 
      // Better to just append message locally if we trust the backend.
      // But we need the full ticket object update sometimes.

      const { data: updatedTicketList } = await axiosInstance.get('/support/my');
      const updated = updatedTicketList.find(t => t._id === selectedTicket._id);
      if (updated) setSelectedTicket(updated);

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const markMessagesAsRead = async (ticketId) => {
    try {
      await axiosInstance.patch(`/support/${ticketId}/read`, { sender: 'user' });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  useEffect(() => {
    if (selectedTicket) {
      markMessagesAsRead(selectedTicket._id);
    }
  }, [selectedTicket]);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'open': return 'warning';
      case 'in-progress': return 'info';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-[Poppins]">
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
            <p className="text-gray-600">We are here to help you</p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            icon={showCreateForm ? undefined : <FaPlus />}
            variant={showCreateForm ? 'outline' : 'primary'}
          >
            {showCreateForm ? 'Cancel' : 'New Ticket'}
          </Button>
        </div>

        {/* Create Ticket Form */}
        {showCreateForm && (
          <Card className="mb-8 border-l-4 border-l-blue-500 animate-fade-in-down">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Support Ticket</h2>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Brief description of your issue"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Describe your issue in detail"
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" icon={<FaPaperPlane />}>
                  Submit Ticket
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
          {/* Tickets List */}
          <div className="lg:col-span-4 flex flex-col h-full">
            <Card className="h-full flex flex-col p-0 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <FaTicketAlt className="text-blue-500" />
                  My Tickets
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {loading ? (
                  <div className="p-4 space-y-4">
                    <Skeleton height="80px" count={3} />
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                      <FaTicketAlt size={24} />
                    </div>
                    <p className="text-gray-500 font-medium">No tickets yet</p>
                    <p className="text-xs text-gray-400 mt-1">Create one to get help!</p>
                  </div>
                ) : (
                  tickets.map((ticket) => (
                    <div
                      key={ticket._id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedTicket?._id === ticket._id
                        ? 'bg-blue-50 border-blue-200 shadow-sm'
                        : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'
                        }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className={`font-semibold text-sm line-clamp-1 ${selectedTicket?._id === ticket._id ? 'text-blue-900' : 'text-gray-800'}`}>
                          {ticket.subject}
                        </h3>
                        <Badge variant={getStatusBadgeVariant(ticket.status)} size="sm">
                          {ticket.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                        {ticket.messages[ticket.messages.length - 1]?.message}
                      </p>
                      <div className="flex justify-between items-center text-[10px] text-gray-400">
                        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        <span>{ticket.messages.length} msgs</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Chat View */}
          <div className="lg:col-span-8 h-full">
            <Card className="h-full flex flex-col p-0 overflow-hidden">
              {selectedTicket ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-100 bg-white flex justify-between items-center shadow-sm z-10">
                    <div>
                      <h2 className="font-bold text-gray-900 text-lg">{selectedTicket.subject}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getStatusBadgeVariant(selectedTicket.status)} size="sm">
                          {selectedTicket.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Ticket ID: #{selectedTicket._id.slice(-6).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
                    {selectedTicket.messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                          {/* Avatar */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
                            }`}>
                            {msg.sender === 'user' ? <FaUser size={12} /> : <FaUserShield size={12} />}
                          </div>

                          {/* Message Bubble */}
                          <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm ${msg.sender === 'user'
                              ? 'bg-blue-600 text-white rounded-tr-none'
                              : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                              }`}>
                              {msg.message}
                            </div>

                            {/* Meta */}
                            <div className="flex items-center gap-1 mt-1 px-1">
                              <span className="text-[10px] text-gray-400">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {msg.sender === 'user' && (
                                <span className={`text-[10px] ${msg.read ? 'text-blue-500' : 'text-gray-300'}`}>
                                  {msg.read ? <FaCheckDouble /> : <FaCheck />}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input Area */}
                  {selectedTicket.status !== 'resolved' ? (
                    <div className="p-4 bg-white border-t border-gray-100">
                      <form onSubmit={handleSendMessage} className="flex gap-3">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                          placeholder="Type your message..."
                          required
                        />
                        <Button type="submit" icon={<FaPaperPlane />} className="rounded-xl px-6">
                          Send
                        </Button>
                      </form>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-gray-500 text-sm italic">
                      This ticket has been resolved. You cannot send more messages.
                    </div>
                  )}
                </>
              ) : (
                <EmptyState
                  icon={<FaCommentDots size={64} className="text-blue-200" />}
                  title="Select a Ticket"
                  description="Choose a ticket from the list to view the conversation or create a new one."
                />
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}