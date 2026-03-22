import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTheme } from '../context/ThemeContext';
import StarRating from './StarRating';
import api from '../services/api';

interface ReviewModalProps {
    visible: boolean;
    onClose: () => void;
    bookingId: string;
    workerId: string;
    workerName: string;
    onReviewSubmitted?: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
    visible,
    onClose,
    bookingId,
    workerId,
    workerName,
    onReviewSubmitted,
}) => {
    const { colors, isDark } = useTheme();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            Toast.show({
                type: 'error',
                text1: 'Rating Required',
                text2: 'Please select a rating',
            });
            return;
        }

        if (!comment.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Comment Required',
                text2: 'Please write a comment',
            });
            return;
        }

        setLoading(true);
        try {
            await api.post('/reviews', {
                worker: workerId,
                booking: bookingId,
                rating,
                comment: comment.trim(),
            });

            Toast.show({
                type: 'success',
                text1: 'Review Submitted!',
                text2: 'Thank you for your feedback',
            });

            // Reset form
            setRating(0);
            setComment('');

            // Notify parent
            if (onReviewSubmitted) {
                onReviewSubmitted();
            }

            onClose();
        } catch (error: any) {
            console.error('Error submitting review:', error);
            Toast.show({
                type: 'error',
                text1: 'Submission Failed',
                text2: error.response?.data?.message || 'Please try again',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <View style={[styles.container, { backgroundColor: colors.background }]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.title, { color: colors.text }]}>Write a Review</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Worker Info */}
                        <View style={[styles.workerInfo, { backgroundColor: colors.card }]}>
                            <View style={[styles.workerAvatar, { backgroundColor: isDark ? '#374151' : '#EFF6FF' }]}>
                                <Ionicons name="person" size={24} color={colors.primary} />
                            </View>
                            <Text style={[styles.workerName, { color: colors.text }]}>{workerName}</Text>
                        </View>

                        {/* Rating Section */}
                        <View style={styles.section}>
                            <Text style={[styles.label, { color: colors.text }]}>
                                How would you rate this service?
                            </Text>
                            <View style={styles.ratingContainer}>
                                <StarRating
                                    rating={rating}
                                    size={40}
                                    onRatingChange={setRating}
                                />
                            </View>
                            {rating > 0 && (
                                <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>
                                    {rating === 1 && '⭐ Poor'}
                                    {rating === 2 && '⭐⭐ Fair'}
                                    {rating === 3 && '⭐⭐⭐ Good'}
                                    {rating === 4 && '⭐⭐⭐⭐ Very Good'}
                                    {rating === 5 && '⭐⭐⭐⭐⭐ Excellent'}
                                </Text>
                            )}
                        </View>

                        {/* Comment Section */}
                        <View style={styles.section}>
                            <Text style={[styles.label, { color: colors.text }]}>
                                Share your experience
                            </Text>
                            <TextInput
                                style={[
                                    styles.textArea,
                                    {
                                        backgroundColor: isDark ? '#374151' : '#F8FAFC',
                                        borderColor: colors.border,
                                        color: colors.text,
                                    },
                                ]}
                                placeholder="Tell us about your experience with this worker..."
                                placeholderTextColor={colors.textLight}
                                value={comment}
                                onChangeText={setComment}
                                multiline
                                numberOfLines={6}
                                textAlignVertical="top"
                                maxLength={500}
                            />
                            <Text style={[styles.charCount, { color: colors.textLight }]}>
                                {comment.length}/500
                            </Text>
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View style={[styles.footer, { borderTopColor: colors.border }]}>
                        <TouchableOpacity
                            style={[styles.cancelBtn, { borderColor: colors.border }]}
                            onPress={onClose}
                        >
                            <Text style={[styles.cancelBtnText, { color: colors.text }]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.submitBtn,
                                { backgroundColor: colors.primary },
                                loading && styles.disabledBtn,
                            ]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.submitBtnText}>Submit Review</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    container: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    closeBtn: {
        padding: 4,
    },
    content: {
        padding: 20,
    },
    workerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    workerAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    workerName: {
        fontSize: 16,
        fontWeight: '600',
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 12,
    },
    ratingContainer: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    ratingLabel: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        minHeight: 120,
    },
    charCount: {
        fontSize: 12,
        textAlign: 'right',
        marginTop: 4,
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    cancelBtnText: {
        fontSize: 16,
        fontWeight: '600',
    },
    submitBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    disabledBtn: {
        opacity: 0.7,
    },
});

export default ReviewModal;
