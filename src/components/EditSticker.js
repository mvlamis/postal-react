// EditSticker.js

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
    const [borderType, setBorderType] = useState(sticker.borderType || 'none');
    const [borderWidth, setBorderWidth] = useState(sticker.borderWidth || 0);
    const [borderColor, setBorderColor] = useState(sticker.borderColor || '#000000');
    const [dropShadow, setDropShadow] = useState(sticker.dropShadow || false);
    
    // Audio customization states
    const [waveColor, setWaveColor] = useState(sticker.waveColor || '#F14A58');
    const [progressColor, setProgressColor] = useState(sticker.progressColor || '#FF5733');
    const [backgroundColor, setBackgroundColor] = useState(sticker.backgroundColor || '#FFFFFF');

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
                        const updatedSticker = { 
                            ...sticker, 
                            imageURL: url, 
                            fillMode, 
                            borderType, 
                            borderWidth, 
                            borderColor, 
                            dropShadow,
                            waveColor,
                            progressColor,
                            backgroundColor
                        };
                        setSticker(updatedSticker);
                        updateDoc(
                            doc(db, 'users', UID, 'cards', cardID, 'stickers', stickerID),
                            { 
                                imageURL: url, 
                                fillMode, 
                                borderType, 
                                borderWidth, 
                                borderColor, 
                                dropShadow,
                                waveColor,
                                progressColor,
                                backgroundColor
                            }
                        ).then(() => {
                            props.onUpdateSticker(updatedSticker); // Pass updated sticker back to parent
                            closeEditSticker(); // Close the component after upload
                        });
                    });
                }
            );
        } else {
            const updatedSticker = { 
                ...sticker, 
                fillMode, 
                borderType, 
                borderWidth, 
                borderColor, 
                dropShadow,
                waveColor,
                progressColor,
                backgroundColor
            };
            setSticker(updatedSticker);
            updateDoc(
                doc(db, 'users', UID, 'cards', cardID, 'stickers', stickerID),
                { 
                    fillMode, 
                    borderType, 
                    borderWidth, 
                    borderColor, 
                    dropShadow,
                    waveColor,
                    progressColor,
                    backgroundColor
                }
            ).then(() => {
                props.onUpdateSticker(updatedSticker); // Pass updated sticker back to parent
                closeEditSticker(); // Close the component after upload
            });
        }
    };

    const uploadAudio = () => {
        if (selectedFile) {
            const storageRef = ref(storage, `audio/${UID}/${selectedFile.name}`);
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
                        const updatedSticker = { 
                            ...sticker, 
                            audioURL: url,
                            waveColor,
                            progressColor,
                            backgroundColor
                        };
                        setSticker(updatedSticker);
                        updateDoc(
                            doc(db, 'users', UID, 'cards', cardID, 'stickers', stickerID),
                            { 
                                audioURL: url,
                                waveColor,
                                progressColor,
                                backgroundColor
                            }
                        ).then(() => {
                            props.onUpdateAudio(updatedSticker); // Pass updated sticker back to parent
                            closeEditSticker(); // Close the component after upload
                        });
                    });
                }
            );
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
                <div className="form-group">
                    <label>Sticker Image</label>
                    <div className="upload-container">
                        <input type="file" onChange={handleFileChange} />
                        <img className="uploadThumbnail" src={selectedFile ? URL.createObjectURL(selectedFile) : sticker.imageURL} alt="sticker" />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Fill Mode</label>
                        <select value={fillMode} onChange={(e) => setFillMode(e.target.value)}>
                            <option value="contain">Contain</option>
                            <option value="cover">Cover</option>
                            <option value="fill">Fill</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Border Type</label>
                        <select value={borderType} onChange={(e) => setBorderType(e.target.value)}>
                            <option value="none">None</option>
                            <option value="solid">Solid</option>
                            <option value="dotted">Dotted</option>
                            <option value="dashed">Dashed</option>
                            <option value="double">Double</option>
                            <option value="groove">Groove</option>
                            <option value="ridge">Ridge</option>
                            <option value="inset">Inset</option>
                        </select>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Border Width</label>
                        <input type="number" value={borderWidth} onChange={(e) => setBorderWidth(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Border Color</label>
                        <div className="color-picker">
                            <input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} />
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <label>Drop Shadow</label>
                    <input type="checkbox" checked={dropShadow} onChange={(e) => setDropShadow(e.target.checked)} />
                </div>
                
                {/* Audio Customization Options */}
                <div className="form-row">
                    <div className="form-group">
                        <label>Background Color</label>
                        <div className="color-picker">
                            <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
                        </div>
                    </div>
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
                <div className="form-group">
                    <label>Link URL</label>
                    <input 
                        type="text" 
                        value={sticker.linkURL} 
                        onChange={(e) => setSticker({ ...sticker, linkURL: e.target.value })}
                        placeholder="Link URL"
                    />
                </div>
                <div className="form-group">
                    <label>Link Text</label>
                    <input 
                        type="text" 
                        value={sticker.linkText} 
                        onChange={(e) => setSticker({ ...sticker, linkText: e.target.value })}
                        placeholder="Link Text"
                    />
                </div>
                <button className="savebutton button-2" onClick={() => {
                    updateDoc(
                        doc(db, 'users', UID, 'cards', cardID, 'stickers', stickerID),
                        { linkURL: sticker.linkURL, linkText: sticker.linkText }
                    ).then(() => {
                        props.onUpdateSticker(sticker);
                        closeEditSticker();
                    });
                }}>Save</button>
            </div>
        )
    } else if (sticker.type === 'audio') {
        return (
            <div className="edit-sticker">
                <div className="popupheader">
                    <h2>Edit Sticker</h2>
                    <div className="closebutton" onClick={closeEditSticker}><XCircle /></div>
                </div>
                <div className="form-group">
                    <label>Upload Audio</label>
                    <input type="file" accept="audio/*" onChange={handleFileChange} />
                    <button className="savebutton button-2" onClick={uploadAudio}>Upload Audio</button>
                </div>
                <div className="progressbar" style={{ width: `${uploadProgress}%` }}></div>
                
                {/* Audio Customization Options */}
                <div className="form-row">
                    <div className="form-group">
                        <label>Wave Color</label>
                        <div className="color-picker">
                            <input type="color" value={waveColor} onChange={(e) => setWaveColor(e.target.value)} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Progress Color</label>
                        <div className="color-picker">
                            <input type="color" value={progressColor} onChange={(e) => setProgressColor(e.target.value)} />
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <label>Background Color</label>
                    <div className="color-picker">
                        <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
                    </div>
                </div>
                <button className="savebutton button-2" onClick={() => {
                    // Save customization without uploading new audio
                    updateDoc(
                        doc(db, 'users', UID, 'cards', cardID, 'stickers', stickerID),
                        { waveColor, progressColor, backgroundColor }
                    ).then(() => {
                        const updatedSticker = { 
                            ...sticker,
                            waveColor,
                            progressColor,
                            backgroundColor
                        };
                        props.onUpdateAudio(updatedSticker);
                        closeEditSticker();
                    });
                }}>Save Customizations</button>
            </div>
        );
    }
}

export default EditSticker;