import './EditSticker.css';
import { useState, useEffect, useRef } from 'react';
import { ref, uploadBytesResumable } from 'firebase/storage';
import { UID, db, storage, getImage } from '../firebase';
import { XCircle } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const EditSticker = (props) => {
    const cardID = props.cardID;
    const [sticker, setSticker] = useState(props.sticker);
    const stickerID = props.sticker.id;
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [fillMode, setFillMode] = useState(sticker.fillMode || 'contain');

    const quillRef = useRef(null);
    const quillInstance = useRef(null);

    useEffect(() => {
        setSticker(props.sticker);
    }, [props.sticker]);

    useEffect(() => {
        if (sticker.type === 'text' && quillRef.current && !quillInstance.current) {
            quillInstance.current = new Quill(quillRef.current, {
                theme: 'snow',
                modules: {
                    toolbar: [
                        [{ 'font': [] }],
                        [{ 'size': [] }],
                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'align': [] }],
                        ['clean']
                    ]
                },
            });
            quillInstance.current.on('text-change', () => {
                const updatedSticker = { ...sticker, text: quillInstance.current.root.innerHTML };
                setSticker(updatedSticker);
                updateDoc(
                    doc(db, 'users', UID, 'cards', cardID, 'stickers', stickerID),
                    { text: quillInstance.current.root.innerHTML }
                );
                // refresh sticker in parent component
                props.onUpdateText(updatedSticker);
            });
            quillInstance.current.root.innerHTML = sticker.text || '';
        }
    }, [sticker.type, sticker.text, stickerID, cardID]);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const uploadSticker = () => {
        if (selectedFile) {

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
                    const updatedSticker = { ...sticker, img: url, fillMode };
                    setSticker(updatedSticker);
                    updateDoc(
                        doc(db, 'users', UID, 'cards', cardID, 'stickers', stickerID),
                        { imageURL: url, fillMode }
                    ).then(() => {
                        props.onUpdateSticker(updatedSticker); // Pass updated sticker back to parent
                        closeEditSticker(); // Close the component after upload
                    });
                });
            }
        );
        } else {
            const updatedSticker = { ...sticker, fillMode };
            setSticker(updatedSticker);
            updateDoc(
                doc(db, 'users', UID, 'cards', cardID, 'stickers', stickerID),
                { fillMode }
            ).then(() => {
                props.onUpdateSticker(updatedSticker); // Pass updated sticker back to parent
                closeEditSticker(); // Close the component after upload
            });
        }
    };

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
                <select value={fillMode} onChange={(e) => setFillMode(e.target.value)}>
                    <option value="contain">Contain</option>
                    <option value="cover">Cover</option>
                    <option value="fill">Fill</option>
                </select>
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
                <div ref={quillRef}></div>
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