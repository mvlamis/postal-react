import './Posts.css';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { CircleArrowLeft, CircleArrowRight } from 'lucide-react';
import ReadOnlySticker from './ReadOnlySticker'; // You'll need to create this

function ViewPosts({ userID }) {
    const [cards, setCards] = useState([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [nextCardIndex, setNextCardIndex] = useState(null);
    const [stickers, setStickers] = useState([]);
    const [backgroundColor, setBackgroundColor] = useState('#F2F1EA');
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationDirection, setAnimationDirection] = useState(null);

    const currentCardID = cards[currentCardIndex]?.id;

    useEffect(() => {
        if (userID) {
            const fetchCards = async () => {
                const cardsCollection = collection(db, 'users', userID, 'cards');
                const cardsSnapshot = await getDocs(cardsCollection);
                const cardsData = cardsSnapshot.docs.map(doc => ({ 
                    id: doc.id, 
                    ...doc.data() 
                }));
                setCards(cardsData);
            };

            fetchCards();
        }
    }, [userID]);

    useEffect(() => {
        if (userID && currentCardID) {
            const fetchStickers = async () => {
                setStickers([]);
                const stickersCollection = collection(db, 'users', userID, 'cards', currentCardID, 'stickers');
                const stickersSnapshot = await getDocs(stickersCollection);
                const stickersData = stickersSnapshot.docs.map(doc => ({ 
                    id: doc.id, 
                    cardID: currentCardID,
                    ...doc.data() 
                }));
                setStickers(stickersData);

                const cardDoc = doc(db, 'users', userID, 'cards', currentCardID);
                const cardSnapshot = await getDoc(cardDoc);
                const cardData = cardSnapshot.data();
                if (cardData) {
                    setBackgroundColor(cardData.color);
                }
            };

            fetchStickers();
        }
    }, [userID, currentCardID]);

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
            }, 600);
        }
    };

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
            }, 600);
        }
    };

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
                    >
                        {stickers.map(sticker => (
                            <ReadOnlySticker 
                                key={sticker.id} 
                                sticker={sticker}
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
                    <div className='arrows'>
                        <CircleArrowLeft className="leftbutton" size={40} onClick={switchToPreviousCard} />
                        <div className="cardNumber">{currentCardIndex + 1} / {cards.length}</div>
                        <CircleArrowRight className="rightbutton" size={40} onClick={switchToNextCard} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ViewPosts;