import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import socketService from '../services/socketService';
import IncomingBookingModal from '../components/IncomingBookingModal';
import api from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from './AuthContext';

interface BookingAlertContextData {
    showBookingAlert: (booking: any) => void;
    hideBookingAlert: () => void;
}

const BookingAlertContext = createContext<BookingAlertContextData>({} as BookingAlertContextData);

export const useBookingAlert = () => useContext(BookingAlertContext);

export const BookingAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const [currentBooking, setCurrentBooking] = useState<any>(null);
    const navigation = useNavigation<any>();
    const { worker } = useAuth();

    useEffect(() => {
        // Configure notifications
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: false,
                shouldShowBanner: true,
                shouldShowList: true,
            }),
        });

        // Listen for new bookings via Socket
        socketService.onNewBooking((booking) => {
            console.log('New booking received via socket:', booking._id);
            showBookingAlert(booking);

            // Schedule local notification for background state
            scheduleNotification(booking);
        });

        // Listen for booking removal
        socketService.onBookingRemoved((data) => {
            console.log('Booking removed:', data);
            // If the removed booking is currently being shown in the alert, hide it
            if (currentBooking && currentBooking._id === data.bookingId) {
                hideBookingAlert();
            }
            // Show an alert to the user
            // We can't use Alert.alert here easily if we want it custom, but standard Alert works
            // Or use a Toast if available
        });

        // Handle notification tap
        const subscription = Notifications.addNotificationResponseReceivedListener(async response => {
            const bookingData = response.notification.request.content.data;
            console.log('Notification tapped with data:', bookingData);

            if (bookingData) {
                if (bookingData._id) {
                    // Data from socket/local notification (full object)
                    console.log('Showing alert for:', bookingData._id);
                    showBookingAlert(bookingData);
                } else if (bookingData.bookingId) {
                    // Data from FCM (only ID) - Fetch full details
                    try {
                        console.log('Fetching booking details for:', bookingData.bookingId);
                        const res = await api.get(`/bookings/${bookingData.bookingId}`);
                        if (res.data) {
                            showBookingAlert(res.data);
                        }
                    } catch (error) {
                        console.error('Error fetching booking details:', error);
                    }
                }
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    const scheduleNotification = async (booking: any) => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'New Booking Request! 🔔',
                body: `New job from ${booking.user.name} - ₹${booking.totalAmount}`,
                data: booking,
                sound: 'default',
                priority: Notifications.AndroidNotificationPriority.MAX,
            },
            trigger: null, // Show immediately
        });
    };

    const showBookingAlert = (booking: any) => {
        setCurrentBooking(booking);
        setVisible(true);
    };

    const hideBookingAlert = () => {
        setVisible(false);
        setCurrentBooking(null);
    };

    const handleAccept = async () => {
        if (!currentBooking) return;

        try {
            await api.put(`/bookings/${currentBooking._id}/accept`);
            hideBookingAlert();
            navigation.navigate('ActiveBookings');
        } catch (error) {
            console.error('Error accepting booking:', error);
            hideBookingAlert();
        }
    };

    const handleReject = async () => {
        if (!currentBooking) return;

        try {
            await api.put(`/bookings/${currentBooking._id}/reject`);
            hideBookingAlert();
        } catch (error) {
            console.error('Error rejecting booking:', error);
            hideBookingAlert();
        }
    };

    return (
        <BookingAlertContext.Provider value={{ showBookingAlert, hideBookingAlert }}>
            {children}
            {currentBooking && (
                <IncomingBookingModal
                    visible={visible}
                    booking={currentBooking}
                    onAccept={handleAccept}
                    onReject={handleReject}
                />
            )}
        </BookingAlertContext.Provider>
    );
};
