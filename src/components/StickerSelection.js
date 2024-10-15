import './StickerSelection.css';
import PreviewSticker from './PreviewSticker';
import DefaultSticker from './DefaultSticker';

function StickerSelection() {
    return (
        <div className="sticker-selection" id="stickerSelection">
            <div className="sticker-icons">
                <DefaultSticker sticker={{ type: 'text', text: 'Hello, world!' }} />
                <DefaultSticker sticker={{ type: 'image', imageURL: 'https://via.placeholder.com/150' }} />
                <DefaultSticker sticker={{ type: 'link', linkURL: 'https://www.google.com', linkText: 'Google' }} />
                <DefaultSticker sticker={{ type: 'audio' }} />
            </div>
            <div className="featured-stickers">
                <PreviewSticker sticker={{ type: 'text', text: 'Hello, world!' }} />
                <PreviewSticker sticker={{ type: 'image', imageURL: 'https://via.placeholder.com/150' }} />
                <PreviewSticker sticker={{ type: 'link', linkURL: 'https://www.google.com', linkText: 'Google' }} />
            </div>
        </div>
    );
}

export default StickerSelection;