import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';

const LocationContext = createContext();

export const useLocation = () => {
    return useContext(LocationContext);
};

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState({
        latitude: null,
        longitude: null,
        city: null, // Default to null
        state: null,
        loading: true,
        error: null,
    });

    const [availableCities, setAvailableCities] = useState([]);

    useEffect(() => {
        fetchCities();
    }, []);

    const fetchCities = async () => {
        try {
            const { data } = await axiosInstance.get('/cities');
            setAvailableCities(data);
            return data;
        } catch (error) {
            console.error('Error fetching cities:', error);
            return [];
        }
    };

    const updateCity = (cityName) => {
        const selectedCity = availableCities.find(c => c.name.toLowerCase() === cityName.toLowerCase());
        if (selectedCity) {
            const newLocation = {
                ...location,
                city: selectedCity.name,
                state: selectedCity.state || location.state,
                loading: false,
                error: null
            };
            setLocation(newLocation);
            localStorage.setItem('userLocation', JSON.stringify(newLocation));
        }
    };

    const detectLocation = async () => {
        setLocation(prev => ({ ...prev, loading: true, error: null }));

        if (!navigator.geolocation) {
            setLocation(prev => ({ ...prev, loading: false, error: 'Geolocation is not supported by your browser' }));
            return;
        }

        // Ensure cities are loaded
        let cities = availableCities;
        if (cities.length === 0) {
            cities = await fetchCities();
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    // Reverse geocoding using our backend proxy to avoid CORS
                    const { data } = await axiosInstance.get('/location/reverse', {
                        params: { lat: latitude, lon: longitude }
                    });

                    const address = data.address;
                    const cityCandidate = address.city || address.town || address.village || address.county || '';

                    let detectedCity = null;
                    let detectedState = null;

                    // Match against available cities
                    const matchedCity = cities.find(c => c.name.toLowerCase() === cityCandidate.toLowerCase());

                    if (matchedCity) {
                        detectedCity = matchedCity.name;
                        detectedState = matchedCity.state || address.state;
                    }

                    const newLocation = {
                        latitude,
                        longitude,
                        city: detectedCity,
                        state: detectedState,
                        loading: false,
                        error: null,
                    };

                    setLocation(newLocation);
                    localStorage.setItem('userLocation', JSON.stringify(newLocation));

                } catch (error) {
                    console.error('Error fetching address:', error);
                    setLocation(prev => ({
                        ...prev,
                        latitude,
                        longitude,
                        loading: false,
                        error: 'Failed to fetch address details'
                    }));
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                setLocation(prev => ({ ...prev, loading: false, error: 'Unable to retrieve your location' }));
            }
        );
    };

    // Load from local storage on mount (but verify city validity?)
    useEffect(() => {
        const savedLocation = localStorage.getItem('userLocation');
        if (savedLocation) {
            // We trust the saved location for now, or we could re-validate against city list
            setLocation({ ...JSON.parse(savedLocation), loading: false, error: null });
        } else {
            // Optional: Auto-detect on first load
            detectLocation();
            setLocation(prev => ({ ...prev, loading: false }));
        }
    }, []);

    return (
        <LocationContext.Provider value={{ location, availableCities, detectLocation, updateCity }}>
            {children}
        </LocationContext.Provider>
    );
};
