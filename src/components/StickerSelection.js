import { useState, useEffect, useCallback } from 'react';
import './StickerSelection.css';
import PreviewSticker from './PreviewSticker';
import DefaultSticker from './DefaultSticker';
import PlaceholderImage from '../images/placeholder.png';

function StickerSelection() {
    const [photos, setPhotos] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    const fetchPhotos = useCallback(async (query = '') => {
        try {
            const response = await fetch(
                `https://pixabay.com/api/?key=${process.env.REACT_APP_PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&per_page=10&safesearch=true&image_type=photo`
            );
            const data = await response.json();
            setPhotos(data.hits);
        } catch (error) {
            console.error('Error fetching photos:', error);
        }
    }, []);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchPhotos(searchQuery);
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery, fetchPhotos]);

    return (
        <div className="sticker-selection" id="stickerSelection">
            <div className="search-container">
            </div>
            <div className="sticker-icons">
                <DefaultSticker sticker={{ type: 'text', text: 'Hello, world!'}} />
                <DefaultSticker sticker={{ type: 'image', imageURL: PlaceholderImage }} />
                <DefaultSticker sticker={{ type: 'link', linkURL: 'https://www.google.com', linkText: 'Google' }} />
                <DefaultSticker sticker={{ type: 'audio' }} />
            </div>
            <div className="featured-stickers">
                <div>
                    <h2>Sticker Gallery</h2>
                    <h4>Photos from Pixabay</h4>
                </div>
                <input
                    type="text"
                    placeholder="Search stickers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                    />
                {photos.map((photo) => (
                    <PreviewSticker 
                        key={photo.id}
                        sticker={{
                            type: 'image',
                            imageURL: photo.webformatURL
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

export default StickerSelection;