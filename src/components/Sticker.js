import './Sticker.css';
import { useState, useEffect } from 'react';
import { CircleX, Edit3 } from 'lucide-react';
import EditSticker from './EditSticker';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

function Sticker({ sticker, onRemove }) {
    const [isHovered, setIsHovered] = useState(false);
    const [editingSticker, setEditingSticker] = useState(null);
    const [dimensions, setDimensions] = useState({ width: sticker.width || 200, height: sticker.height || 200 });
    const [aspectRatio, setAspectRatio] = useState(1);
    const [isResizing, setIsResizing] = useState(false);
    const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
    const [initialStickerPos, setInitialStickerPos] = useState({ x: sticker.x, y: sticker.y });

    useEffect(() => {
        if (sticker.type === 'image') {
            const img = new Image();
            img.src = sticker.imageURL;
            img.onload = () => {
                setAspectRatio(img.width / img.height);
            };
        }
    }, [sticker]);

    const handleDragStart = (e) => {
        if (!isResizing) {
            setInitialMousePos({ x: e.clientX, y: e.clientY });
            setInitialStickerPos({ x: sticker.x, y: sticker.y });
            e.dataTransfer.setData('sticker', JSON.stringify({
                ...sticker,
                initialMousePos: { x: e.clientX, y: e.clientY },
                initialStickerPos: { x: sticker.x, y: sticker.y }
            }));
        }
    };

    const handleEditClick = (e) => {
        e.stopPropagation();
        setEditingSticker(sticker);
    };

    const handleResizeStart = () => {
        setIsResizing(true);
    };

    const handleResizeStop = (e, { size }) => {
        setIsResizing(false);
        setDimensions(size);
    };

    const style = {
        position: 'absolute',
        left: `${sticker.x}px`,
        top: `${sticker.y}px`,
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`
    };

    const stickerContent = (
        <>
            {sticker.type === 'text' && <p>{sticker.text}</p>}
            {sticker.type === 'image' && <img src={sticker.imageURL} alt="sticker" />}
            {sticker.type === 'link' && <a href={sticker.linkURL}>{sticker.linkText}</a>}
            {isHovered && (
                <>
                    <button className="edit-button" onClick={handleEditClick}><Edit3 /></button>
                    <button className="remove-button" onClick={(e) => { e.stopPropagation(); onRemove(sticker); }}><CircleX /></button>
                </>
            )}
            {editingSticker && <EditSticker sticker={editingSticker} onClose={() => setEditingSticker(null)} />}
        </>
    );

    return (
        sticker.type === 'image' ? (
            <ResizableBox
                width={dimensions.width}
                height={dimensions.height}
                onResizeStart={handleResizeStart}
                onResizeStop={handleResizeStop}
                minConstraints={[100, 100]}
                maxConstraints={[800, 600]}
                lockAspectRatio={aspectRatio}
                className="sticker"
                draggable={!isResizing}
                onDragStart={handleDragStart}
                style={style}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {stickerContent}
            </ResizableBox>
        ) : (
            <div
                className="sticker"
                draggable="true"
                onDragStart={handleDragStart}
                style={style}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {stickerContent}
            </div>
        )
    );
}

export default Sticker;