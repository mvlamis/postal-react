import { createContext, useContext, useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const CustomizationContext = createContext();

export const CustomizationProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        accentColor: '#a27b59',
        backgroundTexture: 'woodtexture.jpg'
    });

    useEffect(() => {
        const auth = getAuth();
        const db = getFirestore();

        const loadCustomization = async (userId) => {
            if (!userId) return;
            
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();

            if (userData) {
                setSettings({
                    accentColor: userData.accentColor || '#a27b59',
                    backgroundTexture: userData.backgroundTexture || 'woodtexture.jpg'
                });
            }
        };

        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                loadCustomization(user.uid);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        console.log(settings);
        root.style.setProperty('--accent-color', settings.accentColor);
        root.style.setProperty('--background-image', `url('/images/${settings.backgroundTexture}')`);
    }, [settings]);

    return (
        <CustomizationContext.Provider value={{ settings, setSettings }}>
            {children}
        </CustomizationContext.Provider>
    );
};

export const useCustomization = () => useContext(CustomizationContext);