import "./MinifiedCard.css";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { addDoc, collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

// takes in a sticker book and returns it in a smaller, view-only form
// original card size is 800x600, minified card size is 600x450
// stickers are resized and repositioned to fit the minified card

const MinifiedCard = (card) => {
    const [cardData, setCardData] = useState(card);
    const user = cardData.user;
    const stickers = cardData.stickers;
    const color = cardData.color;

    const storage = getStorage();

    // console.log(card)
    
    useEffect(() => {
        const fetchUserData = async () => {
            const userDocRef = doc(db, 'users', user);
            const userDoc = await getDoc(userDocRef);
            const userData = userDoc.data();

            console.log("User: ", userData);
            console.log("Card: ", cardData);

            let photoRef;
            
            try {
                photoRef = ref(storage, `profile-images/${user}.jpg`);
            } catch (error) {
                photoRef = ref(storage, 'profile-images/default.jpg');
            }

            userData.photoURL = await getDownloadURL(photoRef);
            
            // set profile picture and username
            setCardData({ ...cardData, profilepicture: userData.photoURL, username: userData.username });
        };

        fetchUserData();
    }, []);
    

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
        let stickerProperties = {
            x: 0,
            y: 0,
            color: "black",
            imageURL: "",
            width: 0,
            height: 0
        };

        // get sticker properties
        if (sticker) {
            stickerProperties = {
                x: sticker.x,
                y: sticker.y,
                color: sticker.color,
                imageURL: sticker.imageURL,
                width: sticker.width,
                height: sticker.height
            };
        }

        // calculate new sticker properties
        const newStickerProperties = {
            x: stickerProperties.x * 0.75,
            y: stickerProperties.y * 0.75,
            color: stickerProperties.color,
            imageURL: stickerProperties.imageURL,
            width: stickerProperties.width * 0.75,
            height: stickerProperties.height * 0.75
        };

        // render stickers with new properties
        if (sticker.type === "text") {
            return (
                <div className="minified-sticker" style={{ position: 'absolute', left: newStickerProperties.x, top: newStickerProperties.y, color: newStickerProperties.color }}>
                    <div dangerouslySetInnerHTML={{ __html: sticker.text }} />
                </div>
            );
        } else if (sticker.type === "image") {
            return (
                <img className="minified-sticker" style={{ position: 'absolute', left: newStickerProperties.x, top: newStickerProperties.y, width: newStickerProperties.width, height: newStickerProperties.height }} src={newStickerProperties.imageURL} alt="sticker" />
            );
        }
    }
    

    return (
        <div className="minified-card">
            <div className="minified-card-header">
                <h1>{cardData.title}</h1>
                <img src={cardData.profilepicture} alt="profile picture" />
                <h2>{cardData.username}</h2>

            </div>
            <div className="minified-sticker-book" style={{ background: cardData.color }}>
                {renderStickers()}
            </div>
        </div>
    );
}

export default MinifiedCard;