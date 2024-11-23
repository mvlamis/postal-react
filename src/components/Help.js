// src/components/Help.js
import { useState } from 'react';
import { XCircle } from 'lucide-react';
import './Help.css';

const helpContent = {
    'Getting Started': {
        title: 'Getting Started',
        content: [
            'Welcome to Postal! Get started by adding some stickers to your page.',
            'On the right side of your profile, you can find the sticker panel.',
            'You can drag and drop stickers from the panel onto your page.',
            'There are different types of stickers to choose from, including text, images, and links.',
            'Alternatively, you can select stock images from Pixabday in the Sticker Gallery.',
        ]
    },
    'Stickers': {
        title: 'Managing Stickers',
        content: [
            'Drag and drop stickers from the sticker panel onto your page.',
            'Hover over a sticker to see options for resizing, rotating, editing, and removing.',
            'Upload your own content from the edit menu, including images and audio.',
            'Customize stickers with different colors, borders, and shadows.',
        ]
    },
    'Pages': {
        title: 'Page Management',
        content: [
            'You can create multiple pages to organize your content.',
            'Switch between pages using the page navigation buttons.',
            'Change the color, clear, or delete a page from the Edit Page menu.',
        ]
    },
    'Sharing': {
        title: 'Sharing & Friends',
        content: [
            'Your cards are private by default, but you can share them with friends.',
            'You can publish your cards to the Explore page for others to see.',
            'View and interact with cards created by other users on the Explore page.',
        ]
    }
};

function Help({ onClose }) {
    const [selectedCategory, setSelectedCategory] = useState(Object.keys(helpContent)[0]);

    return (
        <div className="help-overlay">
            <div className="help-window">
                <div className="help-header">
                    <h2>Help Guide</h2>
                    <button className="close-button" onClick={onClose}>
                        <XCircle />
                    </button>
                </div>
                <div className="help-content">
                    <div className="help-sidebar">
                        {Object.keys(helpContent).map(category => (
                            <button
                                key={category}
                                className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                    <div className="help-main">
                        <h3>{helpContent[selectedCategory].title}</h3>
                        <ul>
                            {helpContent[selectedCategory].content.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Help;