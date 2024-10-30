import './EditPageCard.css';
import { useState, useEffect } from 'react';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { XCircle } from 'lucide-react';
import ConfirmPopup from './ConfirmPopup';

function EditPageCard(card) {
    const [cardData, setCardData] = useState(card);
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmCancel, setConfirmCancel] = useState(null);

    const user = cardData.user;

    useEffect(() => {
        setCardData(card);
    }, [card]);

    const closeEditPageCard = () => {
        card.onClose();
    }

    const clearPage = () => {
        setConfirmMessage('Are you sure you want to clear the page?');
        setConfirmAction(() => clearPageConfirmed);
        setConfirmDialog(true);
    }

    const clearPageConfirmed = () => {
        setConfirmDialog(false);
        card.onCleared();
    }

    const changePageColor = (color) => {
        card.onColorChange(color);
    }

    const deletePage = () => {
        setConfirmMessage('Are you sure you want to delete the page?');
        setConfirmAction(() => deletePageConfirmed);
        setConfirmDialog(true);
    }

    const deletePageConfirmed = () => {
        setConfirmDialog(false);
        card.onDelete();
    }

    const dialogCancelled = () => {
        setConfirmDialog(false);
    }
    
    return (
        <div className="edit-page-card">
            <div className="popupheader">
                <h1>Edit Page</h1>
                <div className="closebutton" onClick={closeEditPageCard}><XCircle /></div>
            </div>
            <div className="card-controls">
                <button onClick={clearPage}>Clear Page</button>
                <button onClick={deletePage}>Delete Page</button>
                {/* color change picker */}
                <div className="color-picker">
                    <input type="color" onChange={(e) => changePageColor(e.target.value)} />
                    <button onClick={() => changePageColor('#F2F1EA')}>Reset Color</button>
                </div>
            </div>
            {confirmDialog && <ConfirmPopup message={confirmMessage} onConfirm={confirmAction} onCancel={dialogCancelled} />}
        </div>
    );
}

export default EditPageCard;