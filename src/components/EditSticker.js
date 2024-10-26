import './EditSticker.css';
import { useState, useEffect } from 'react';
import { ref, uploadBytesResumable } from 'firebase/storage';
import { UID, db, storage, getImage } from '../firebase';
import { XCircle } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';

const EditSticker = (props) => {
    const cardID = props.cardID;
    const [sticker, setSticker] = useState(props.sticker);
    const stickerID = props.sticker.id;
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        setSticker(props.sticker);
    }, [props.sticker]);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const uploadSticker = () => {
        if (!selectedFile) return;

        const storageRef = ref(storage, `stickers/${UID}/${selectedFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, selectedFile);

        uploadTask.on('state_changed',
            (snapshot) => {
                // progress
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.log(error);
            },
            () => {
                // complete
                getImage(storageRef).then((url) => {
                    const updatedSticker = { ...sticker, img: url };
                    setSticker(updatedSticker);
                    updateDoc(
                        doc(db, 'users', UID, 'cards', cardID, 'stickers', stickerID),
                        { imageURL: url }
                    ).then(() => {
                        props.onUpdateSticker(updatedSticker); // Pass updated sticker back to parent
                        closeEditSticker(); // Close the component after upload
                    });
                });
            }
        );
    };

    const updateStickerText = (e) => {
        const updatedSticker = { ...sticker, text: e.target.value };
        setSticker(updatedSticker);
        updateDoc(
            doc(db, 'users', UID, 'cards', stickerID),
            { text: e.target.value }
        );
    }

    const closeEditSticker = () => {
        props.onClose();
    }

    if (sticker.type === 'image') {
        return (
            <div className="edit-sticker">
                <div className="popupheader">
                    <h2>Edit Sticker</h2>
                    <div className="closebutton" onClick={closeEditSticker}><XCircle /></div>
                </div>
                <div className="stickerinfo">
                    <input type="file" onChange={handleFileChange} />
                    <img className="uploadThumbnail" src={selectedFile ? URL.createObjectURL(selectedFile) : sticker.imageURL} alt="sticker" />
                </div>
                <button className="savebutton button-2" onClick={uploadSticker}>Save</button>
                <div className="progressbar" style={{ width: `${uploadProgress}%` }}></div>
            </div>
        );
    } else if (sticker.type === 'text') {
        return (
            <div className="edit-sticker">
                <div className="popupheader">
                    <h2>Edit Sticker</h2>
                    <div className="closebutton" onClick={closeEditSticker}><XCircle /></div>
                </div>
                <textarea value={sticker.text} onChange={updateStickerText}></textarea>
            </div>
        )
    } else if (sticker.type === 'link') {
        return (
            <div className="edit-sticker">
                <div className="popupheader">
                    <h2>Edit Sticker</h2>
                    <div className="closebutton" onClick={closeEditSticker}><XCircle /></div>
                </div>
                <input type="text" value={sticker.linkURL} />
                <input type="text" value={sticker.linkText} />
            </div>
        )
    }
}

export default EditSticker;