// ReadOnlySticker.js
import React, { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import WavesurferPlayer from '@wavesurfer/react';
import './Sticker.css';

const ReadOnlySticker = ({ sticker }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [waveSurfer, setWaveSurfer] = useState(null);

    const style = {
        position: 'absolute',
        left: `${sticker.x}px`,
        top: `${sticker.y}px`,
        width: `${sticker.width || 150}px`,
        height: `${sticker.height || 150}px`,
        backgroundColor: sticker.backgroundColor || 'transparent',
        transform: `rotate(${sticker.rotation || 0}deg)`,
        transformOrigin: 'center',
        pointerEvents: 'none'
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

    return (
        <div className="sticker" style={style}>
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

            {sticker.type === 'link' && (
                <a 
                    className="linksticker" 
                    href={sticker.linkURL}
                    style={{ pointerEvents: 'auto' }}
                >
                    {sticker.linkText}
                </a>
            )}

            {sticker.type === 'audio' && (
                <div className="audio-sticker" style={{ pointerEvents: 'auto' }}>
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
                            height={sticker.height}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReadOnlySticker;