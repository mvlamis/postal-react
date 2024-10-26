import './EditPageCard.css';
import { useState, useEffect } from 'react';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { XCircle } from 'lucide-react';
import ConfirmPopup from './ConfirmPopup';

function EditPageCard(card) {
    const [cardData, setCardData] = useState(card);
    const [confirmDialog, setConfirmDialog] = useState(false);
    const user = cardData.user;


    useEffect(() => {
        setCardData(card);
    }
    , [card]);


    const closeEditPageCard = () => {
        card.onClose();
    }

    const clearPage = () => {
        setConfirmDialog(true);
    }

    const clearPageConfirmed = () => {
        setConfirmDialog(false);
        card.onCleared();
    }

    const clearPageCancelled = () => {
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
            </div>
            {confirmDialog && <ConfirmPopup message="Are you sure you want to clear this page?" onConfirm={clearPageConfirmed} onCancel={clearPageCancelled} />}
        </div>
    );
}

export default EditPageCard;