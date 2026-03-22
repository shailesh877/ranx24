import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

interface QueuedRequest {
    id: string;
    url: string;
    method: string;
    data?: any;
    timestamp: number;
}

class OfflineManager {
    private isOnline: boolean = true;
    private requestQueue: QueuedRequest[] = [];
    private readonly QUEUE_KEY = 'offline_request_queue';

    constructor() {
        this.init();
    }

    private async init() {
        // Load queued requests from storage
        await this.loadQueue();

        // Listen for network changes
        NetInfo.addEventListener(state => {
            const wasOffline = !this.isOnline;
            this.isOnline = state.isConnected ?? false;

            if (wasOffline && this.isOnline) {
                // Back online, process queue
                this.processQueue();
                Toast.show({
                    type: 'success',
                    text1: 'Back Online',
                    text2: 'Syncing pending requests...',
                });
            } else if (!this.isOnline) {
                Toast.show({
                    type: 'info',
                    text1: 'No Internet',
                    text2: 'You are offline. Changes will sync when connected.',
                });
            }
        });
    }

    async checkConnection(): Promise<boolean> {
        const state = await NetInfo.fetch();
        this.isOnline = state.isConnected ?? false;
        return this.isOnline;
    }

    getConnectionStatus(): boolean {
        return this.isOnline;
    }

    async queueRequest(url: string, method: string, data?: any): Promise<void> {
        const request: QueuedRequest = {
            id: `${Date.now()}_${Math.random()}`,
            url,
            method,
            data,
            timestamp: Date.now(),
        };

        this.requestQueue.push(request);
        await this.saveQueue();

        Toast.show({
            type: 'info',
            text1: 'Saved Offline',
            text2: 'Request will be sent when you\'re back online',
        });
    }

    private async loadQueue() {
        try {
            const queueJson = await AsyncStorage.getItem(this.QUEUE_KEY);
            if (queueJson) {
                this.requestQueue = JSON.parse(queueJson);
            }
        } catch (error) {
            console.error('Error loading offline queue:', error);
        }
    }

    private async saveQueue() {
        try {
            await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(this.requestQueue));
        } catch (error) {
            console.error('Error saving offline queue:', error);
        }
    }

    private async processQueue() {
        if (this.requestQueue.length === 0) return;

        const queue = [...this.requestQueue];
        this.requestQueue = [];
        await this.saveQueue();

        // Process requests
        // Note: This requires api instance to be passed or imported
        console.log(`Processing ${queue.length} queued requests...`);

        // TODO: Import api and process each request
        // for (const request of queue) {
        //     try {
        //         await api.request({
        //             url: request.url,
        //             method: request.method,
        //             data: request.data,
        //         });
        //     } catch (error) {
        //         // Re-queue failed requests
        //         this.requestQueue.push(request);
        //     }
        // }

        await this.saveQueue();
    }

    async clearQueue() {
        this.requestQueue = [];
        await AsyncStorage.removeItem(this.QUEUE_KEY);
    }
}

export default new OfflineManager();
