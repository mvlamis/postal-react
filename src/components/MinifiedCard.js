// MinifiedCard.js

import "./MinifiedCard.css";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { addDoc, collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import WavesurferPlayer from "@wavesurfer/react";

// takes in a sticker book and returns it in a smaller, view-only form
// original card size is 800x600, minified card size is 600x450
// stickers are resized and repositioned to fit the minified card

const MinifiedCard = (card) => {
    const [cardData, setCardData] = useState(card);
    const user = cardData.user;
    const stickers = cardData.stickers;
    const color = cardData.color;
    const timestamp = cardData.timestamp;

    const storage = getStorage();
    
    useEffect(() => {
        const fetchUserData = async () => {
            const userDocRef = doc(db, 'users', user);
            const userDoc = await getDoc(userDocRef);
            const userData = userDoc.data();

            let photoRef;
            
            if (userData.photo) {
                photoRef = ref(storage, `profile-images/${user}.jpg`);
            } else {
                photoRef = ref(storage, 'profile-images/default.jpg');
            }

            userData.photoURL = await getDownloadURL(photoRef);
            
            // set profile picture and username
            setCardData({ ...cardData, profilepicture: userData.photoURL, username: userData.username });
        };

        fetchUserData();
    }, [user, cardData, storage, card]);

    // initialize undefined sticker properties
    let stickerProperties = {
        x: 0,
        y: 0,
        color: "black",
        imageURL: "",
        width: 0,
        height: 0
    };
    
    // render stickers with position and size modifications to fit the minified card
    const renderStickers = () => {
        // get stickers
        const stickers = cardData.stickers;

        // render each sticker
        return stickers.map((sticker, index) => {
            return renderSticker(sticker, index);
        });
    }

    // render a single sticker with position and size modifications to fit the minified card
    const renderSticker = (sticker, index) => {
        // initialize undefined sticker properties
        let stickerProperties

        // get sticker properties
        if (sticker) {
            stickerProperties = {
                x: sticker.x,
                y: sticker.y,
                color: sticker.color,
                imageURL: sticker.imageURL,
                width: sticker.width,
                height: sticker.height,
                objectFit: sticker.objectFit,

            };
        }

        // calculate new sticker properties
        const scaleFactor = 0.75; // Original scaling factor
        const newStickerProperties = {
            x: stickerProperties.x * scaleFactor,
            y: stickerProperties.y * scaleFactor,
            color: stickerProperties.color,
            imageURL: stickerProperties.imageURL,
            width: stickerProperties.width * scaleFactor,
            height: stickerProperties.height * scaleFactor
        };

        // render stickers with new properties
        if (sticker.type === "text") {
            return (
                <div 
                    key={index}
                    className="minified-sticker text-sticker" 
                    style={{ 
                        position: 'absolute', 
                        left: newStickerProperties.x, 
                        top: newStickerProperties.y, 
                        color: newStickerProperties.color,
                        maxWidth: `${newStickerProperties.width}px`,
                        fontSize: '0.75rem' // Adjust font size as needed
                    }}
                >
                    <div dangerouslySetInnerHTML={{ __html: sticker.text }} />
                </div>
            );
        } else if (sticker.type === "image") {
            return (
                <img 
                    key={index}
                    className="minified-sticker image-sticker" 
                    style={{ 
                        position: 'absolute', 
                        left: newStickerProperties.x, 
                        top: newStickerProperties.y, 
                        width: newStickerProperties.width, 
                        height: newStickerProperties.height,
                        objectFit: sticker.objectFit || 'contain',
                        border: `${sticker.borderWidth}px ${sticker.borderType} ${sticker.borderColor}`,
                        boxShadow: sticker.dropShadow ? '2px 2px 10px rgba(0, 0, 0, 0.5)' : 'none',
                        backgroundColor: sticker.backgroundColor
                    }} 
                    src={newStickerProperties.imageURL} 
                    alt="sticker" 
                />
            );
        } else if (sticker.type === "link") {
            return (
                <a 
                    key={index}
                    className="linksticker minified-sticker link-stick" 
                    href={sticker.linkURL} 
                    style={{ 
                        position: 'absolute', 
                        left: newStickerProperties.x, 
                        top: newStickerProperties.y,
                        width: `${newStickerProperties.width}px`,
                        height: `${newStickerProperties.height}px`,
                        fontSize: '0.75rem', // Adjust font size as needed
                        wordWrap: 'break-word' // Ensure text wraps within maxWidth
                    }}
                >
                    {sticker.linkText}
                </a>
            );
        } else if (sticker.type === "audio") {
            return (
                <div 
                    key={index}
                    className="audio-sticker minified-sticker" 
                    style={{ 
                        position: 'absolute', 
                        left: newStickerProperties.x, 
                        top: newStickerProperties.y,
                        width: newStickerProperties.width,
                        height: newStickerProperties.height 
                    }}
                >
                    <WavesurferPlayer
                        src={sticker.audioURL}
                        options={{
                            waveColor: sticker.waveColor,
                            progressColor: sticker.progressColor
                        }}
                    />
                </div>
            );
        }
    }
    const formatDate = (timestamp) => {
        if (!timestamp || !timestamp.seconds) return '';
        const milliseconds = timestamp.seconds * 1000;
        const date = new Date(milliseconds);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
        

    return (
        <div className="minified-card">
            <div className="minified-card-header">
                <h1>{cardData.title}</h1>
                <img src={cardData.profilepicture} alt="profile picture" />
                <h2>{cardData.username}</h2>
                <span className="timestamp">{formatDate(timestamp)}</span>
            </div>
            <div className="minified-sticker-book" style={{ background: cardData.color }}>
                {renderStickers()}
            </div>
        </div>
    );
}

export default MinifiedCard;