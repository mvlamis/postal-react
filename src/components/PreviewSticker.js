import './Sticker.css'

function PreviewSticker({ sticker }) {
    const handleDragStart = (e) => {
        e.dataTransfer.setData('sticker', JSON.stringify(sticker));
    };

    const style = {
        // position: 'absolute',
        // left: `${sticker.x}px`,
        // top: `${sticker.y}px`
    };

    if (sticker.type === 'text') {
        return (
            <div className="sticker" draggable="true" onDragStart={handleDragStart} style={style}>
                <p>{sticker.text}</p>
            </div>
        );
    } else if (sticker.type === 'image') {
        return (
            <div className="sticker" draggable="true" onDragStart={handleDragStart} style={style}>
                <img src={sticker.imageURL} />
            </div>
        );
    } else if (sticker.type === 'link') {
        return (
            <div className="sticker" draggable="true" onDragStart={handleDragStart} style={style}>
                <a href={sticker.linkURL}>{sticker.linkText}</a>
            </div>
        );
    }
}

export default PreviewSticker;