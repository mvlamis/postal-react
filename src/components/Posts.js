import './Posts.css';
import Sticker from './Sticker';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, getDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { CircleArrowLeft, CircleArrowRight, Edit } from 'lucide-react';
import EditPageCard from './EditPageCard';

function Posts() {
    const [cards, setCards] = useState([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [nextCardIndex, setNextCardIndex] = useState(null);
    const [stickers, setStickers] = useState([]);
    const [backgroundColor, setBackgroundColor] = useState('#F2F1EA');
    const [editPageMenuIsOpen, setEditPageMenuIsOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationDirection, setAnimationDirection] = useState(null);

    const auth = getAuth();
    const user = auth.currentUser;

    const currentCardID = cards[currentCardIndex]?.id;

    const toggleEditPageMenu = () => {
        setEditPageMenuIsOpen(!editPageMenuIsOpen);
    }

    const getNewPageFromEditCard = (newPage) => {
        setStickers(newPage);
        console.log("New page: ", newPage);
    }

    useEffect(() => {
        if (user) {
            const fetchCards = async () => {
                const cardsCollection = collection(db, 'users', user.uid, 'cards');
                const cardsSnapshot = await getDocs(cardsCollection);
                let cardsData = cardsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                if (cardsData.length === 0) {
                    const newCard = { color: '#F2F1EA' };
                    const cardDocRef = await addDoc(cardsCollection, newCard);
                    cardsData = [{ id: cardDocRef.id, ...newCard }];
                }

                setCards(cardsData);
                setCurrentCardIndex(0);
            };

            fetchCards();
        }
    }, [user]);

    useEffect(() => {
        if (user && currentCardID) {
            const fetchStickers = async () => {
                setStickers([]); // Clear stickers first
                const stickersCollection = collection(db, 'users', user.uid, 'cards', currentCardID, 'stickers');
                const stickersSnapshot = await getDocs(stickersCollection);
                const stickersData = stickersSnapshot.docs.map(doc => ({ 
                    id: doc.id, 
                    cardID: currentCardID, // Add cardID to each sticker
                    ...doc.data() 
                }));
                setStickers(stickersData);

                const cardDoc = doc(db, 'users', user.uid, 'cards', currentCardID);
                const cardSnapshot = await getDoc(cardDoc);
                const cardData = cardSnapshot.data();
                if (cardData) {
                    setBackgroundColor(cardData.color);
                }
            };

            fetchStickers();
        }
    }, [user, currentCardID]);

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
                const stickerDoc = doc(db, 'users', user.uid, 'cards', currentCardID, 'stickers', sticker.id);
                await updateDoc(stickerDoc, updatedSticker);
                const updatedStickers = [...stickers];
                updatedStickers[existingStickerIndex] = updatedSticker;
                setStickers(updatedStickers);
            } else {
                const rect = e.target.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const newSticker = { ...sticker, x, y };
                delete newSticker.initialMousePos;
                delete newSticker.initialStickerPos;
                const docRef = await addDoc(collection(db, 'users', user.uid, 'cards', currentCardID, 'stickers'), newSticker);
                setStickers([...stickers, { ...newSticker, id: docRef.id }]);
            }
        }
    };

    const handleRemoveSticker = async (stickerToRemove) => {
        if (user) {
            await deleteDoc(doc(db, 'users', user.uid, 'cards', currentCardID, 'stickers', stickerToRemove.id));
            setStickers(prevStickers => prevStickers.filter(sticker => sticker.id !== stickerToRemove.id));
        }
    };

    const uploadCurrentPage = async () => {
        if (user) {
            try {
                const exploreCollection = collection(db, 'explore');
                const pageData = {
                    user: user.uid,
                    stickers: stickers,
                    timestamp: new Date(),
                    color: backgroundColor
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
        setStickers([]);
        if (user) {
            stickers.forEach(async sticker => {
                await deleteDoc(doc(db, 'users', user.uid, 'cards', currentCardID, 'stickers', sticker.id));
            });
        }
    }

    const handleColorChange = (color) => {
        if (user) {
            updateDoc(doc(db, 'users', user.uid, 'cards', currentCardID), { color });
        }
        setBackgroundColor(color);
    }

    const addNewCard = async () => {
        if (user) {
            const newCard = { color: '#F2F1EA' };
            const cardDocRef = await addDoc(collection(db, 'users', user.uid, 'cards'), newCard);
            setCards([...cards, { id: cardDocRef.id, ...newCard }]);
            setCurrentCardIndex(cards.length);
        }
    }

    const switchToPreviousCard = () => {
        if (currentCardIndex > 0 && !isAnimating) {
            setIsAnimating(true);
            setAnimationDirection('left');
            setNextCardIndex(currentCardIndex - 1);
            setTimeout(() => {
                setCurrentCardIndex(currentCardIndex - 1);
                setNextCardIndex(null);
                setIsAnimating(false);
                setAnimationDirection(null);
            }, 600); // Full animation duration
        }
    }

    const switchToNextCard = () => {
        if (currentCardIndex < cards.length - 1 && !isAnimating) {
            setIsAnimating(true);
            setAnimationDirection('right');
            setNextCardIndex(currentCardIndex + 1);
            setTimeout(() => {
                setCurrentCardIndex(currentCardIndex + 1);
                setNextCardIndex(null);
                setIsAnimating(false);
                setAnimationDirection(null);
            }, 600); // Full animation duration
        }
    }

    const deleteCard = async () => {
        if (user) {
            await deleteDoc(doc(db, 'users', user.uid, 'cards', currentCardID));
            setCards(prevCards => prevCards.filter(card => card.id !== currentCardID));
            if (currentCardIndex > 0) {
                setCurrentCardIndex(currentCardIndex - 1);
            }
        }
    }

    return (
        <div className="posts-section">
            <div className="sticker-book">
                <div className="page-content">
                    {currentCardIndex > 0 && (
                        <div 
                            className={`blank-page previous ${
                                animationDirection === 'left' ? 'moving-to-top' : ''
                            }`}
                            style={{background: cards[currentCardIndex - 1]?.color || '#F2F1EA'}}
                        />
                    )}
                    
                    <div 
                        className={`blank-page current ${
                            animationDirection ? 'moving-to-bottom' : ''
                        }`}
                        style={{background: backgroundColor}}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        {stickers.map(sticker => (
                            <Sticker 
                                key={sticker.id} 
                                sticker={sticker} 
                                onRemove={handleRemoveSticker} 
                                cardID={currentCardID} 
                            />
                        ))}
                    </div>

                    {currentCardIndex < cards.length - 1 && (
                        <div 
                            className={`blank-page next ${
                                animationDirection === 'right' ? 'moving-to-top' : ''
                            }`}
                            style={{background: cards[currentCardIndex + 1]?.color || '#F2F1EA'}}
                        />
                    )}
                </div>
                <div className="page-buttons">
                    <button className="editPageButton button-3" onClick={toggleEditPageMenu}>Edit page</button>
                    <div className='arrows'>
                        <CircleArrowLeft className="leftbutton" size={40} onClick={switchToPreviousCard} />
                        <div className="cardNumber">{currentCardIndex + 1} / {cards.length}</div>
                        <CircleArrowRight className="rightbutton" size={40} onClick={switchToNextCard} />
                    </div>
                    <button className="uploadbutton button-3" onClick={uploadCurrentPage}>Upload page to explore</button>
                    <button className="newCardButton button-3" onClick={addNewCard}>Add New Card</button>
                </div>
            </div>
            {editPageMenuIsOpen && <EditPageCard 
                onClose={toggleEditPageMenu} 
                onSaved={getNewPageFromEditCard} 
                onCleared={clearPage} 
                onColorChange={handleColorChange}
                onDelete={deleteCard}
                />}
        </div>
    );
}

export default Posts;