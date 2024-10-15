import './Sticker.css'
import { useState } from 'react';
import { CircleX } from 'lucide-react';

function Sticker({ sticker, onRemove }) {
    const [isHovered, setIsHovered] = useState(false);

    const handleDragStart = (e) => {
        e.dataTransfer.setData('sticker', JSON.stringify(sticker));
    };

    const style = {
        position: 'absolute',
        left: `${sticker.x}px`,
        top: `${sticker.y}px`
    };

    return (
        <div 
            className="sticker" 
            draggable="true" 
            onDragStart={handleDragStart} 
            style={style}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {sticker.type === 'text' && <p>{sticker.text}</p>}
            {sticker.type === 'image' && <img src={sticker.imageURL} />}
            {sticker.type === 'link' && <a href={sticker.linkURL}>{sticker.linkText}</a>}
            {isHovered && <button className="remove-button" onClick={() => onRemove(sticker)}><CircleX /></button>}
        </div>
    );
}

export default Sticker;