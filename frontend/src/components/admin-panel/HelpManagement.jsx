import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';

const HelpManagement = () => {
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'worker'
  const [userTickets, setUserTickets] = useState([]);
  const [workerTickets, setWorkerTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  useEffect(() => {
    fetchAllTickets();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('support_message', (data) => {
        console.log('Received support_message:', data);
        // Update ticket list with new message preview
        const updateTickets = (tickets) => {
          return tickets.map(t => {
            if (t._id === data.ticketId) {
              return { ...t, messages: [...t.messages, data.message] };
            }
            return t;
          });
        };

        setUserTickets(prev => updateTickets(prev));
        setWorkerTickets(prev => updateTickets(prev));

        // If this ticket is currently open in chat modal, update it
        if (selectedTicket && selectedTicket._id === data.ticketId) {
          setSelectedTicket(prev => ({
            ...prev,
            messages: [...prev.messages, data.message]
          }));
          // Since we are viewing it, mark as read immediately
          markMessagesAsRead(data.ticketId);
        }
      });

      socket.on('messages_read', (data) => {
        if (selectedTicket && selectedTicket._id === data.ticketId && data.readBy !== 'admin') {
          setSelectedTicket(prev => ({
            ...prev,
            messages: prev.messages.map(msg =>
              msg.sender !== 'admin' ? msg : { ...msg, read: true }
            )
          }));
        }
      });

      return () => {
        socket.off('support_message');
        socket.off('messages_read');
      };
    }
  }, [socket, selectedTicket]);

  const fetchAllTickets = async () => {
    try {
      const [userRes, workerRes] = await Promise.all([
        api.get('/support/admin/all?userType=user'),
        api.get('/support/admin/all?userType=worker'),
      ]);

      setUserTickets(userRes.data);
      setWorkerTickets(workerRes.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChat = (ticket) => {
    setSelectedTicket(ticket);
    setShowChatModal(true);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!adminMessage.trim()) return;

    try {
      await api.post(
        `/support/${selectedTicket._id}/message`,
        { message: adminMessage, sender: 'admin' }
      );

      toast.success('Message sent!');
      setAdminMessage('');
      fetchAllTickets();

      // Update selected ticket
      const { data: allTickets } = await api.get('/support/admin/all');
      const updated = allTickets.find(t => t._id === selectedTicket._id);
      setSelectedTicket(updated);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const markMessagesAsRead = async (ticketId) => {
    try {
      await api.patch(
        `/support/${ticketId}/read`,
        { sender: 'admin' }
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

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      await api.patch(
        `/support/${ticketId}/status`,
        { status: newStatus }
      );

      toast.success(`Status updated to ${newStatus}`);
      fetchAllTickets();
      if (selectedTicket?._id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const TicketList = ({ tickets }) => (
    <div className="space-y-4">
      {tickets.length === 0 ? (
        <p className="text-center text-gray-500 py-4">No tickets found.</p>
      ) : (
        tickets.map((ticket) => (
          <div
            key={ticket._id}
            className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
            onClick={() => handleOpenChat(ticket)}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-semibold">{ticket.subject}</span>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                {ticket.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">
              {ticket.messages[ticket.messages.length - 1]?.message}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              From: {ticket.user?.name || 'Unknown'} • {ticket.messages.length} message(s)
            </p>
          </div>
        ))
      )}
    </div>
  );

  return (
    <>
      <h2 className="text-2xl font-black text-blue-900 mb-4 flex items-center gap-2">
        <i className="fa-solid fa-life-ring text-cyan-600"></i> Help & Support Tickets
      </h2>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('user')}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative cursor-pointer ${activeTab === 'user' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          User Tickets ({userTickets.length})
        </button>
        <button
          onClick={() => setActiveTab('worker')}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative cursor-pointer ${activeTab === 'worker' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Worker Tickets ({workerTickets.length})
        </button>
      </div>

      {/* Ticket List */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        {loading ? (
          <p className="text-center text-gray-500">Loading tickets...</p>
        ) : (
          <TicketList tickets={activeTab === 'user' ? userTickets : workerTickets} />
        )}
      </div>

      {/* Chat Modal */}
      {showChatModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{selectedTicket.subject}</h3>
                <p className="text-sm text-gray-600">From: {selectedTicket.user?.name || 'Unknown'}</p>
              </div>
              <div className="flex gap-2 items-center">
                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleUpdateStatus(selectedTicket._id, e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
                <button
                  onClick={() => setShowChatModal(false)}
                  className="text-gray-500 hover:text-red-600 text-2xl"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {selectedTicket.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg ${msg.sender === 'admin' ? 'bg-blue-100 mr-8' : 'bg-gray-100 ml-8'
                    }`}
                >
                  <p className="text-sm font-semibold mb-1">
                    {msg.sender === 'admin' ? 'You (Admin)' : selectedTicket.user?.name || 'User'}
                  </p>
                  <p className="text-sm">{msg.message}</p>
                  <div className="flex justify-end items-center gap-1 mt-1">
                    <p className="text-xs text-gray-500">
                      {new Date(msg.timestamp).toLocaleString()}
                    </p>
                    {msg.sender === 'admin' && (
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
              <form onSubmit={handleSendMessage} className="p-6 border-t flex gap-2">
                <input
                  type="text"
                  value={adminMessage}
                  onChange={(e) => setAdminMessage(e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2"
                  placeholder="Type your response..."
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Send
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default HelpManagement;
