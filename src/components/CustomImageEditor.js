import React, { useState, useCallback } from 'react';
import './CustomImageEditor.css';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';



const CustomImageEditor = () => {
    const [src, setSrc] = useState(null);
    const [crop, setCrop] = useState({ aspect: 1, width: 200 });
    const [croppedImageUrl, setCroppedImageUrl] = useState(null);

    const onSelectFile = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => setSrc(reader.result));
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const onImageLoaded = useCallback((img) => {
        const aspect = 1;
        const width = Math.min(img.width, img.height);
        setCrop({ aspect, width });
    }, []);

    const getCroppedImg = (image, crop) => {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    console.error('Canvas is empty');
                    return;
                }
                blob.name = 'cropped.jpg';
                const croppedImageUrl = URL.createObjectURL(blob);
                resolve(croppedImageUrl);
            }, 'image/jpeg');
        });
    };

    const handleCropComplete = async (crop, pixelCrop) => {
        if (src) {
            const croppedImageUrl = await getCroppedImg(
                document.querySelector('img'),
                pixelCrop
            );
            setCroppedImageUrl(croppedImageUrl);
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4 customImageEditor">
            <input
                type="file"
                accept="image/*"
                onChange={onSelectFile}
                className="mb-4"
            />
            {src && (
                <ReactCrop
                    src={src}
                    crop={crop}
                    onChange={(newCrop) => setCrop(newCrop)}
                    onComplete={handleCropComplete}
                    onImageLoaded={onImageLoaded}
                    aspect={1}
                />
            )}
            {croppedImageUrl && (
                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Cropped Image:</h3>
                    <img src={croppedImageUrl} alt="Cropped" className="max-w-full h-auto" />
                    <button className="button-2 mt-4" onClick={() => {
                            const link = document.createElement('a');
                    link.href = croppedImageUrl;
                    link.download = 'cropped-image.jpg';
                    link.click();
                        }}>Save</button>
                </div>
            )}
        </div>
    );
};

export default CustomImageEditor;