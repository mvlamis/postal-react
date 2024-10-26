import './Posts.css';
import Sticker from './Sticker';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { CircleArrowLeft, CircleArrowRight, Edit } from 'lucide-react';
import EditPageCard from './EditPageCard';

function Posts() {
    const [stickers, setStickers] = useState([]);
    const auth = getAuth();
    const user = auth.currentUser;
    const cardID = 'defaultCard'; // Replace with actual card ID logic

    const [editPageMenuIsOpen, setEditPageMenuIsOpen] = useState(false);

    const toggleEditPageMenu = () => {
        setEditPageMenuIsOpen(!editPageMenuIsOpen);
    }

    const getNewPageFromEditCard = (newPage) => {
        setStickers(newPage);
        console.log("New page: ", newPage);
    }

    useEffect(() => {
        if (user) {
            const fetchStickers = async () => {
                // card id is the document under the stickers collections
                const stickersCollection = collection(db, 'users', user.uid, 'cards', cardID, 'stickers');
                const stickersSnapshot = await getDocs(stickersCollection);
                const stickersData = stickersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
        console.log(stickers);
        
        if (user) {
            const existingStickerIndex = stickers.findIndex(s => s.id === sticker.id);
            console.log('existingStickerIndex', existingStickerIndex);

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
                const stickerDoc = doc(db, 'users', user.uid, 'cards', cardID, 'stickers', sticker.id);
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
                const cardID = 'defaultCard'; // Replace with actual card ID logic
                const docRef = await addDoc(collection(db, 'users', user.uid, 'cards', cardID, 'stickers'), newSticker);
                setStickers([...stickers, { ...newSticker, id: docRef.id, cardID }]);
            }
        }
    };

    const handleRemoveSticker = async (stickerToRemove) => {
        if (user) {
            await deleteDoc(doc(db, 'users', user.uid, 'cards', cardID, 'stickers', stickerToRemove.id));
            setStickers(prevStickers => {
                const updatedStickers = prevStickers.filter(sticker => sticker.id !== stickerToRemove.id);
                return updatedStickers;
            });
        }
    };

    const uploadCurrentPage = async () => {
        if (user) {
            try {
                const exploreCollection = collection(db, 'explore');
                const pageData = {
                    userId: user.uid,
                    stickers: stickers,
                    timestamp: new Date()
                };
                await addDoc(exploreCollection, pageData);
                console.log("Page uploaded successfully");
            } catch (error) {
                console.error("Error uploading page: ", error);
            }
        } else {
            console.log("No user logged in");
        }
    }

    const clearPage = () => {
        // Clear the current page
        setStickers([]);
        if (user) {
            // Clear the stickers in the database
            stickers.forEach(async sticker => {
                await deleteDoc(doc(db, 'users', user.uid, 'cards', cardID, 'stickers', sticker.id));
            });
        }
    }

    return (
        <div className="posts-section">
            <div className="sticker-book">
                <div className="blank-page" id="blankPage" onDragOver={handleDragOver} onDrop={handleDrop}>
                    {stickers.map(sticker => (
                        <Sticker key={sticker.id} sticker={sticker} onRemove={handleRemoveSticker} cardID={cardID} />
                    ))}
                </div>
                <div className="page-buttons">
                    <button className="editPageButton" onClick={toggleEditPageMenu}>Edit page</button>
                    <div className='arrows'>
                        <CircleArrowLeft className="leftbutton" size={40}/>
                        <CircleArrowRight className="rightbutton" size={40}/>
                    </div>
                    <button className="uploadbutton" onClick={uploadCurrentPage}>Upload page to explore</button>
                </div>
            </div>
            {editPageMenuIsOpen && <EditPageCard onClose={toggleEditPageMenu} onSaved={getNewPageFromEditCard} onCleared={clearPage} />}
        </div>
    );
}

export default Posts;