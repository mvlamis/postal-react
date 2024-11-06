// Sticker.js

import React, { useState, useEffect, useRef } from 'react';
import { CircleX, Edit3, Play, Pause } from 'lucide-react';
import EditSticker from './EditSticker';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import WavesurferPlayer from '@wavesurfer/react';

const Sticker = ({ sticker, onRemove, cardID }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [editingSticker, setEditingSticker] = useState(null);
    const [dimensions, setDimensions] = useState({ width: sticker.width || 150, height: sticker.height || 150 });
    const [isResizing, setIsResizing] = useState(false);
    const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
    const [resizeStartDims, setResizeStartDims] = useState({ width: 0, height: 0 });
    const [aspectRatio, setAspectRatio] = useState(1);
    const [draggingSticker, setDraggingSticker] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [waveSurfer, setWaveSurfer] = useState(null);

    const auth = getAuth();
    const user = auth.currentUser;

    useEffect(() => {
        if (sticker.type === 'image') {
            const img = new Image();
            img.src = sticker.imageURL;
            img.onload = () => {
                const ratio = img.width / img.height;
                setAspectRatio(ratio);
                if (!sticker.width || !sticker.height) {
                    setDimensions({ width: 150, height: 150 / ratio });
                }
            };
        }
    }, [sticker.imageURL, sticker.type, sticker.text]);

    useEffect(() => {
        if (user) {
            const stickerDoc = doc(db, 'users', user.uid, 'cards', cardID, 'stickers', sticker.id);
            updateDoc(stickerDoc, {
                width: dimensions.width,
                height: dimensions.height
            });
        }
    }, [dimensions, sticker.id]);

    const handleDragStart = (e) => {
        if (!isResizing) {
            const initialMousePos = { x: e.clientX, y: e.clientY };
            const initialStickerPos = { x: sticker.x, y: sticker.y };
            setDraggingSticker({ ...sticker, initialMousePos, initialStickerPos });
            e.dataTransfer.setData('sticker', JSON.stringify({
                ...sticker,
                initialMousePos,
                initialStickerPos
            }));
        }
    };

    const handleDrag = (e) => {
        if (draggingSticker) {
            const deltaX = e.clientX - draggingSticker.initialMousePos.x;
            const deltaY = e.clientY - draggingSticker.initialMousePos.y;
            const x = draggingSticker.initialStickerPos.x + deltaX;
            const y = draggingSticker.initialStickerPos.y + deltaY;

            setDraggingSticker({ ...draggingSticker, x, y });
        }
    };

    const handleResizeStart = (e) => {
        e.stopPropagation();
        setIsResizing(true);
        setResizeStartPos({ x: e.clientX, y: e.clientY });
        setResizeStartDims({ ...dimensions });
    };

    const handleResizeMove = (e) => {
        if (isResizing) {
            e.preventDefault();
            const deltaX = e.clientX - resizeStartPos.x;
            const deltaY = e.clientY - resizeStartPos.y;

            let newWidth = resizeStartDims.width + deltaX;
            let newHeight = resizeStartDims.height + deltaY;

            // Maintain minimum size
            newWidth = Math.max(50, newWidth);
            newHeight = Math.max(50, newHeight);

            // Update dimensions locally
            setDimensions({ width: newWidth, height: newHeight });
        }
    };

    const handleResizeEnd = async () => {
        if (isResizing && user) {
            // Update dimensions in Firebase
            const stickerDoc = doc(db, 'users', user.uid, 'cards', cardID, 'stickers', sticker.id);
            await updateDoc(stickerDoc, {
                width: dimensions.width,
                height: dimensions.height
            });
            setIsResizing(false);
        }
    };

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', handleResizeMove);
            window.addEventListener('mouseup', handleResizeEnd);
            return () => {
                window.removeEventListener('mousemove', handleResizeMove);
                window.removeEventListener('mouseup', handleResizeEnd);
            };
        }
    }, [isResizing, resizeStartPos, resizeStartDims]);

    const handleEditClick = (e) => {
        e.stopPropagation();
        setEditingSticker(sticker);
    };

    const handleUpdateSticker = (updatedSticker) => {
        setDimensions({ width: updatedSticker.width, height: updatedSticker.height });
        setEditingSticker(null); // Close the edit sticker component
        // Update the sticker state with the new image URL and fill mode
        sticker.imageURL = updatedSticker.imageURL;
        sticker.fillMode = updatedSticker.fillMode;
        sticker.borderType = updatedSticker.borderType;
        sticker.borderWidth = updatedSticker.borderWidth;
        sticker.borderColor = updatedSticker.borderColor;
        sticker.dropShadow = updatedSticker.dropShadow;
        sticker.waveColor = updatedSticker.waveColor;
        sticker.progressColor = updatedSticker.progressColor;
        sticker.backgroundColor = updatedSticker.backgroundColor;
    };

    const handleUpdateText = (updatedSticker) => {
        // Update the sticker state with the new text
        sticker.text = updatedSticker.text;
    };

    const handleUpdateAudio = (updatedSticker) => {
        // Update the sticker state with the new audio URL and customization
        sticker.audioURL = updatedSticker.audioURL;
        sticker.waveColor = updatedSticker.waveColor;
        sticker.progressColor = updatedSticker.progressColor;
        sticker.backgroundColor = updatedSticker.backgroundColor;
    };

    const onReady = (waveSurferInstance) => {
        setWaveSurfer(waveSurferInstance);
    }

    const onPlayPause = () => {
        if (waveSurfer) {
            waveSurfer.playPause();
            setIsPlaying(!isPlaying);
        }
    }

    const style = {
        position: 'absolute',
        left: `${draggingSticker ? draggingSticker.x : sticker.x}px`,
        top: `${draggingSticker ? draggingSticker.y : sticker.y}px`,
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        cursor: isResizing ? 'nwse-resize' : 'move',
        userSelect: 'none',
        backgroundColor: sticker.backgroundColor || 'transparent',
        transform: 'translate3d(0,0,0)', // Add for better performance
        willChange: 'transform' // Add for better performance
    };

    return (
        <div
            className="sticker"
            draggable={!isResizing}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={() => setDraggingSticker(null)}
            style={style}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {sticker.type === 'text' && (
                <div
                    dangerouslySetInnerHTML={{ __html: sticker.text }}
                />
            )}
            {sticker.type === 'image' && (
                <img
                    src={sticker.imageURL}
                    alt="sticker"
                    style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: sticker.fillMode || 'contain', 
                        border: `${sticker.borderWidth}px ${sticker.borderType} ${sticker.borderColor}`, 
                        boxShadow: sticker.dropShadow ? '2px 2px 10px rgba(0, 0, 0, 0.5)' : 'none' 
                    }}
                />
            )}
            {sticker.type === 'link' && <a className="linksticker" href={sticker.linkURL}>{sticker.linkText}</a>}
            {sticker.type === 'audio' && (
                <div className="audio-sticker">
                    <div className='audio-controls'>
                        <button className="play-button" onClick={onPlayPause}>
                            {isPlaying ? <Pause /> : <Play />}
                        </button>
                    </div>
                    <div className='audio-wave'>
                        <WavesurferPlayer
                            url={sticker.audioURL}
                            onReady={onReady}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            waveColor={sticker.waveColor || '#F14A58'}
                            progressColor={sticker.progressColor || '#FF5733'}
                            responsive={true}
                            height={dimensions.height}
                        />
                    </div>
                </div>
            )}

            {isHovered && (
                <>
                    <Edit3
                        className="edit-button"
                        onClick={handleEditClick}
                    />
                    <CircleX
                        className="remove-button"
                        onClick={(e) => { e.stopPropagation(); onRemove(sticker); }}
                    />
                    <div
                        className="resize-handle"
                        onMouseDown={(e) => handleResizeStart(e)}
                    />
                </>
            )}

            {editingSticker && (
                <EditSticker
                    sticker={editingSticker}
                    onClose={() => setEditingSticker(null)}
                    onUpdateSticker={handleUpdateSticker}
                    onUpdateText={handleUpdateText}
                    onUpdateAudio={handleUpdateAudio}
                    cardID={cardID}
                />
            )}
        </div>
    );
};

export default Sticker;