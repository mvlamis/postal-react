import React, { useState, useCallback } from 'react';
import './CustomImageEditor.css';
import AvatarEditor from 'react-avatar-editor';
import { XCircle } from 'lucide-react';

const CustomImageEditor = ({ onSave, onClose }) => {
    const [image, setImage] = useState(null);
    const [scale, setScale] = useState(1);
    const [editor, setEditor] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            setImage(reader.result);
        };
        reader.readAsDataURL(file);
    }

    const handleScaleChange = (e) => {
        const scale = parseFloat(e.target.value);
        setScale(scale);
    }

    const handleSave = useCallback(() => {
        if (editor) {
            const canvas = editor.getImage();
            const originalWidth = canvas.width;
            const originalHeight = canvas.height;
            const maxDimension = 300;
    
            let targetWidth = originalWidth;
            let targetHeight = originalHeight;
    
            if (originalWidth > maxDimension || originalHeight > maxDimension) {
                if (originalWidth > originalHeight) {
                    targetWidth = maxDimension;
                    targetHeight = (originalHeight / originalWidth) * maxDimension;
                } else {
                    targetHeight = maxDimension;
                    targetWidth = (originalWidth / originalHeight) * maxDimension;
                }
            }
    
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = targetWidth;
            tempCanvas.height = targetHeight;
            const ctx = tempCanvas.getContext('2d');
            ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
    
            tempCanvas.toBlob((blob) => {
                onSave(blob);
            }, 'image/jpeg', 0.7); // Compress the image to 70% quality
        }
    }, [editor, onSave]);

    return (
        <div className="customImageEditor">
            <XCircle className="closeButton" onClick={onClose} />
            <div className="editor">
                <AvatarEditor
                    ref={setEditor}
                    image={image}
                    width={250}
                    height={250}
                    border={50}
                    color={[255, 255, 255, 0.6]}
                    scale={scale}
                    rotate={0}
                />
            </div>
            <div className="controls">
                <input type="file" accept="image/*" onChange={handleImageChange} />
                <input type="range" min="1" max="2" step="0.01" value={scale} onChange={handleScaleChange} />
                <button className="button-2" onClick={handleSave}>Save</button>
            </div>
        </div>
    );
}

export default CustomImageEditor;