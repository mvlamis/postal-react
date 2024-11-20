import React, { useEffect, useState } from 'react';
import Navbar from "../components/Navbar";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import MinifiedCard from '../components/MinifiedCard';
import "./Explore.css";

const Explore = () => {
    const [exploreItems, setExploreItems] = useState([]);

    useEffect(() => {
        const fetchExploreItems = async () => {
            const querySnapshot = await getDocs(collection(db, "explore"));
            const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Sort items by timestamp in descending order (newest first)
            const sortedItems = items.sort((a, b) => b.timestamp - a.timestamp);
            setExploreItems(sortedItems);
        };

        fetchExploreItems();
    }, []);

    return (
        <div>
            <Navbar />
            <div className="explore-page">
                <div className="page-header">
                    <h1>Explore</h1>
                </div>
                <div className="explore-cards">
                    {exploreItems.map((item, index) => (
                        <MinifiedCard key={index} title={item.title} stickers={item.stickers} user={item.user} color={item.color} timestamp={item.timestamp} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Explore;