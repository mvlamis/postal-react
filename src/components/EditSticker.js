import './EditSticker.css';
import { useState, useEffect } from 'react';
import { ref, uploadBytesResumable } from 'firebase/storage';
import { UID, db, storage, getImage } from '../firebase';
import { XCircle } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';

const EditSticker = (props) => {
    const [sticker, setSticker] = useState(props.sticker);
    const stickerID = props.sticker.id;

    useEffect(() => {
        setSticker(props.sticker);
    }, [props.sticker]);

    const uploadSticker = (e) => {
        const file = e.target.files[0];
        const storageRef = ref(storage, `stickers/${UID}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                // progress
            },
            (error) => {
                console.log(error);
            },
            () => {
                // complete
                console.log('uploaded');
                getImage(storageRef).then((url) => {
                    const updatedSticker = { ...sticker, img: url };
                    setSticker(updatedSticker);
                    updateDoc(
                        doc(db, 'users', UID, 'cards', stickerID),
                        { imageURL: url }
                    );
                    console.log(doc(db, 'users', UID, 'cards', stickerID).path);
                });
            }
        );
    }

    const closeEditSticker = () => {
        props.onClose();
    }

    return (
        <div className="edit-sticker">
            <div className="popupheader">
                <h2>Edit Sticker</h2>
                <div className="closebutton" onClick={closeEditSticker}><XCircle /></div>
            </div>
            <input type="file" onChange={uploadSticker}/>
            <img src={sticker.img} alt="sticker"/>
        </div>
    );
}

export default EditSticker;