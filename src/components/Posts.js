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

        if (user) {
            const existingStickerIndex = stickers.findIndex(s => s.id === sticker.id);

            if (existingStickerIndex !== -1) {
                // Existing sticker: use delta calculation
                if (!sticker.initialMousePos || !sticker.initialStickerPos) {
                    sticker.initialMousePos = { x: e.clientX, y: e.clientY };
                    sticker.initialStickerPos = { x: sticker.x, y: sticker.y };
                }

                const deltaX = e.clientX - sticker.initialMousePos.x;
                const deltaY = e.clientY - sticker.initialMousePos.y;
                const x = sticker.initialStickerPos.x + deltaX;
                const y = sticker.initialStickerPos.y + deltaY;

                const updatedSticker = { ...sticker, x, y };
                delete updatedSticker.initialMousePos;
                delete updatedSticker.initialStickerPos;
                const stickerDoc = doc(db, 'users', user.uid, 'cards', sticker.id);
                await updateDoc(stickerDoc, updatedSticker);
                const updatedStickers = [...stickers];
                updatedStickers[existingStickerIndex] = updatedSticker;
                setStickers(updatedStickers);
            } else {
                // New sticker: use absolute position
                const rect = e.target.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const newSticker = { ...sticker, x, y };
                delete newSticker.initialMousePos;
                delete newSticker.initialStickerPos;
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