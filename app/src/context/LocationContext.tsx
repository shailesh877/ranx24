import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';
import axios from 'axios';
import config from '../config/config';

const { API_URL } = config;

interface City {
    _id: string;
    name: string;
    state: string;
    assignedCategories: any[];
}

interface LocationData {
    latitude: number | null;
    longitude: number | null;
    city: string | null;
    state: string | null;
    loading: boolean;
    error: string | null;
}

interface LocationContextType {
    location: LocationData;
    availableCities: City[];
    detectLocation: () => Promise<void>;
    setManualLocation: (data: { latitude: number; longitude: number; city: string; state: string }) => void;
    setCity: (cityName: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [location, setLocation] = useState<LocationData>({
        latitude: null,
        longitude: null,
        city: null, // Default to null, user must select or be auto-detected
        state: null,
        loading: true,
        error: null,
    });

    const [availableCities, setAvailableCities] = useState<City[]>([]);

    useEffect(() => {
        fetchCities();
    }, []);

    const fetchCities = async () => {
        try {
            const response = await axios.get(`${API_URL}/cities`);
            setAvailableCities(response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching cities:', error);
            return [];
        }
    };

    const setManualLocation = (data: { latitude: number; longitude: number; city: string; state: string }) => {
        setLocation({
            ...data,
            loading: false,
            error: null,
        });
    };

    const setCity = (cityName: string) => {
        const selectedCity = availableCities.find(c => c.name.toLowerCase() === cityName.toLowerCase());
        if (selectedCity) {
            setLocation(prev => ({
                ...prev,
                city: selectedCity.name,
                state: selectedCity.state || prev.state,
                loading: false,
                error: null
            }));
        }
    };

    const detectLocation = async () => {
        setLocation(prev => ({ ...prev, loading: true, error: null }));

        try {
            // First ensure we have cities
            let cities = availableCities;
            if (cities.length === 0) {
                cities = await fetchCities();
            }

            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocation(prev => ({ ...prev, loading: false, error: 'Permission to access location was denied' }));
                return;
            }

            const userLocation = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = userLocation.coords;

            const geo = await Location.reverseGeocodeAsync({
                latitude,
                longitude
            });

            let detectedCity = null;
            let detectedState = null;

            if (geo && geo.length > 0) {
                // Try to match detected city with available cities
                const cityCandidate = geo[0].city || geo[0].district || geo[0].subregion || '';

                // Check if this city is in our available list (case-insensitive)
                const matchedCity = cities.find(c => c.name.toLowerCase() === cityCandidate.toLowerCase());

                if (matchedCity) {
                    detectedCity = matchedCity.name;
                    detectedState = matchedCity.state || geo[0].region || null;
                }
            }

            setLocation({
                latitude,
                longitude,
                city: detectedCity, // Will be null if not in available list
                state: detectedState,
                loading: false,
                error: null,
            });

        } catch (error) {
            console.error('Error detecting location:', error);
            setLocation(prev => ({ ...prev, loading: false, error: 'Failed to detect location' }));
        }
    };

    return (
        <LocationContext.Provider value={{ location, availableCities, detectLocation, setManualLocation, setCity }}>
            {children}
        </LocationContext.Provider>
    );
};
