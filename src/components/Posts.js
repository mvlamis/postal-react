import './Posts.css';
import Sticker from './Sticker';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

function Posts() {
    const [stickers, setStickers] = useState([]);
    const auth = getAuth();
    const user = auth.currentUser;

    useEffect(() => {
        if (user) {
            const fetchStickers = async () => {
                const querySnapshot = await getDocs(collection(db, 'users', user.uid, 'cards'));
                const stickersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setStickers(stickersData);
            };

            fetchStickers();
        }
    }, [user]);

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        const stickerData = e.dataTransfer.getData('sticker');
        const sticker = JSON.parse(stickerData);
        const x = e.clientX - e.target.offsetLeft;
        const y = e.clientY - e.target.offsetTop;

        if (user) {
            const existingStickerIndex = stickers.findIndex(s => s.id === sticker.id);

            if (existingStickerIndex !== -1) {
                const updatedSticker = { ...sticker, x, y };
                const stickerDoc = doc(db, 'users', user.uid, 'cards', sticker.id);
                await updateDoc(stickerDoc, updatedSticker);
                const updatedStickers = [...stickers];
                updatedStickers[existingStickerIndex] = updatedSticker;
                setStickers(updatedStickers);
            } else {
                const newSticker = { ...sticker, x, y };
                const docRef = await addDoc(collection(db, 'users', user.uid, 'cards'), newSticker);
                setStickers([...stickers, { ...newSticker, id: docRef.id }]);
            }
        }
    };

    const handleRemoveSticker = async (stickerToRemove) => {
        if (user) {
            await deleteDoc(doc(db, 'users', user.uid, 'cards', stickerToRemove.id));
            setStickers(stickers.filter(sticker => sticker.id !== stickerToRemove.id));
        }
    };

    return (
        <div className="posts-section">
            <div className="sticker-book">
                <div className="blank-page" id="blankPage" onDragOver={handleDragOver} onDrop={handleDrop}>
                    {stickers.map((sticker, index) => (
                        <Sticker key={index} sticker={sticker} onRemove={handleRemoveSticker} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Posts;