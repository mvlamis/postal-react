import './DefaultSticker.css';
import Text from '../icons/Text.png';
import Image from '../icons/Image.png';
import Link from '../icons/Link.png';
import Audio from '../icons/Audio.png';

function DefaultSticker({ sticker }) {
    const handleDragStart = (e) => {
        e.dataTransfer.setData('sticker', JSON.stringify(sticker));
    };

    if (sticker.type === 'text') {
        return (
            <div className="sticker defaultSticker addTextSticker" draggable="true" onDragStart={handleDragStart}>
                <img src={Text} id="addTextSticker"/>
            </div>
        );
    } else if (sticker.type === 'image') {
        return (
            <div className="sticker defaultSticker addImageSticker" draggable="true" onDragStart={handleDragStart}>
                <img src={Image} />
            </div>
        );
    } else if (sticker.type === 'link') {
        return (
            <div className="sticker defaultSticker addLinkSticker" draggable="true" onDragStart={handleDragStart}>
                <img src={Link} />
            </div>
        );
    } else if (sticker.type === 'audio') {
        return (
            <div className="sticker defaultSticker addAudioSticker" draggable="true" onDragStart={handleDragStart}>
                <img src={Audio} />
            </div>
        );
    }
}

export default DefaultSticker;