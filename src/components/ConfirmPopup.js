import "./ConfirmPopup.css";
import { XCircle } from "lucide-react";

function ConfirmPopup({ message, onConfirm, onCancel }) {
    return (
        <div className="confirm-popup">
            <div className="popupheader">
                <h1>Confirm</h1>
                <div className="closebutton" onClick={onCancel}>
                    <XCircle />
                </div>
            </div>
            <div className="message">{message}</div>
            <div className="buttons">
                <button onClick={onConfirm}>Confirm</button>
                <button onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
}

export default ConfirmPopup;