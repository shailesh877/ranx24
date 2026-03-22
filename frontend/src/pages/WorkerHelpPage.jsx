import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend.ranx24.com/api';

export default function WorkerHelpPage() {
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
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in');
        navigate('/login');
        return;
      }

      const { data } = await axios.get(`${API_URL}/support/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
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
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/support`,
        { subject, message, userType: 'worker' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Ticket created successfully!');
      setSubject('');
      setMessage('');
      setShowCreateForm(false);
      fetchTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create ticket');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/support/${selectedTicket._id}/message`,
        { message: newMessage, sender: 'user' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNewMessage('');
      fetchTickets();
      // Update selected ticket
      const { data: updatedTicket } = await axios.get(`${API_URL}/support/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = updatedTicket.find(t => t._id === selectedTicket._id);
      setSelectedTicket(updated);
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const markMessagesAsRead = async (ticketId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/support/${ticketId}/read`,
        { sender: 'user' }, // Worker is also 'user' in this context relative to admin
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  useEffect(() => {
    if (selectedTicket) {
      markMessagesAsRead(selectedTicket._id);
    }
  }, [selectedTicket]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-900">Help & Support</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
          >
            {showCreateForm ? 'Cancel' : '+ New Ticket'}
          </button>
        </div>

        {/* Create Ticket Form */}
        {showCreateForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Support Ticket</h2>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Brief description of your issue"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 h-32"
                  placeholder="Describe your issue in detail"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
              >
                Submit Ticket
              </button>
            </form>
          </div>
        )}

        {/* Tickets List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">My Tickets</h2>
            {loading ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : tickets.length === 0 ? (
              <p className="text-center text-gray-500">No tickets yet. Create one to get help!</p>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${selectedTicket?._id === ticket._id ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800">{ticket.subject}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {ticket.messages[ticket.messages.length - 1]?.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {ticket.messages.length} message(s) • {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat View */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            {selectedTicket ? (
              <>
                <div className="border-b pb-3 mb-4">
                  <h2 className="text-xl font-bold text-gray-800">{selectedTicket.subject}</h2>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                </div>

                {/* Messages */}
                <div className="h-64 overflow-y-auto mb-4 space-y-3">
                  {selectedTicket.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-100 ml-8' : 'bg-gray-100 mr-8'
                        }`}
                    >
                      <p className="text-sm font-semibold mb-1">
                        {msg.sender === 'user' ? 'You' : 'Admin'}
                      </p>
                      <p className="text-sm">{msg.message}</p>
                      <div className="flex justify-end items-center gap-1 mt-1">
                        <p className="text-xs text-gray-500">
                          {new Date(msg.timestamp).toLocaleString()}
                        </p>
                        {msg.sender === 'user' && (
                          <span className="text-xs text-blue-500 font-bold">
                            {msg.read ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Send Message */}
                {selectedTicket.status !== 'resolved' && (
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 border rounded-lg px-3 py-2"
                      placeholder="Type your message..."
                      required
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
                    >
                      Send
                    </button>
                  </form>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a ticket to view conversation
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}