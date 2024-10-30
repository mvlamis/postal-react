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
            setExploreItems(items);
        };

        fetchExploreItems();
    }, []);

    return (
        <div>
            <Navbar />
            <div className="explore-header">
                <h1>Explore</h1>
            </div>
            <div className="explore-cards">
                {exploreItems.map((item, index) => (
                    console.log(item),
                    <MinifiedCard key={index} title={item.title} stickers={item.stickers} user={item.user} color={item.color} />
                ))}
            </div>
        </div>
    );
};

export default Explore;