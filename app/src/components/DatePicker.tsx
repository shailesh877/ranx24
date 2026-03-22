import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface DatePickerProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onDateChange }) => {
    const [currentMonth, setCurrentMonth] = React.useState(selectedDate.getMonth());
    const [currentYear, setCurrentYear] = React.useState(selectedDate.getFullYear());

    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month: number, year: number) => {
        return new Date(year, month, 1).getDay();
    };

    const isDateDisabled = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const maxDate = new Date(today);
        maxDate.setDate(maxDate.getDate() + 7);

        // Disable if date is today or before (no same-day booking)
        if (date <= today) return true;

        // Disable if date is more than 7 days ahead
        if (date > maxDate) return true;

        return false;
    };

    const isDateSelected = (date: Date) => {
        return date.toDateString() === selectedDate.toDateString();
    };

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const renderDays = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
        const days = [];

        // Empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
        }

        // Actual days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const disabled = isDateDisabled(date);
            const selected = isDateSelected(date);

            days.push(
                <TouchableOpacity
                    key={day}
                    style={[
                        styles.dayCell,
                        selected && styles.selectedDay,
                        disabled && styles.disabledDay
                    ]}
                    onPress={() => !disabled && onDateChange(date)}
                    disabled={disabled}
                >
                    <Text style={[
                        styles.dayText,
                        selected && styles.selectedDayText,
                        disabled && styles.disabledDayText
                    ]}>
                        {day}
                    </Text>
                </TouchableOpacity>
            );
        }

        return days;
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.monthYear}>
                    {monthNames[currentMonth]} {currentYear}
                </Text>
                <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
                    <Ionicons name="chevron-forward" size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.weekDays}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <View key={index} style={styles.weekDayCell}>
                        <Text style={styles.weekDayText}>{day}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.daysGrid}>
                {renderDays()}
            </View>

            <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={16} color="#64748B" />
                <Text style={styles.infoText}>
                    Book 1-7 days in advance (tomorrow to next week)
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    navButton: {
        padding: 8,
    },
    monthYear: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    weekDays: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    weekDayCell: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    weekDayText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: '14.28%', // 100% / 7 days
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    dayText: {
        fontSize: 14,
        color: '#1E293B',
    },
    selectedDay: {
        backgroundColor: COLORS.primary,
        borderRadius: 8,
    },
    selectedDayText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    disabledDay: {
        opacity: 0.3,
    },
    disabledDayText: {
        color: '#94A3B8',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
        padding: 12,
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
    },
    infoText: {
        fontSize: 12,
        color: '#64748B',
        flex: 1,
    },
});

export default DatePicker;
