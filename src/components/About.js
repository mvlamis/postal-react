import './About.css';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, deleteDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useState, useEffect } from 'react';

function About({ user, photoURL, bio, name, username, isViewOnly }) {
    const auth = getAuth();
    const db = getFirestore();
    const currentUser = auth.currentUser;
    const [friendshipStatus, setFriendshipStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [friendCount, setFriendCount] = useState(0);

    useEffect(() => {
        const checkFriendshipStatus = async () => {
            if (!currentUser || !user || currentUser.uid === user) return;
            
            try {
                const friendRef = doc(db, `users/${currentUser.uid}/friends`, user);
                const friendDoc = await getDoc(friendRef);
                if (friendDoc.exists()) {
                    setFriendshipStatus(friendDoc.data().status);
                } else {
                    setFriendshipStatus(null);
                }
            } catch (error) {
                console.error("Error checking friendship:", error);
            }
        };

        checkFriendshipStatus();
    }, [currentUser, user, db]);

    useEffect(() => {
        const getFriendCount = async () => {
            if (!user) return;
            
            try {
                const friendsRef = collection(db, `users/${user}/friends`);
                const q = query(friendsRef, where("status", "==", "accepted"));
                const snapshot = await getDocs(q);
                setFriendCount(snapshot.size);
            } catch (error) {
                console.error("Error getting friend count:", error);
            }
        };

        getFriendCount();
    }, [user, db]);

    const handleFriendAction = async () => {
        if (!currentUser || !user || currentUser.uid === user) return;
        
        setIsLoading(true);
        try {
            const currentUserRef = doc(db, `users/${currentUser.uid}`);
            const currentUserSnap = await getDoc(currentUserRef);
            const currentUserData = currentUserSnap.data();

            if (friendshipStatus === 'accepted') {
                // Remove friend
                await deleteDoc(doc(db, `users/${currentUser.uid}/friends`, user));
                await deleteDoc(doc(db, `users/${user}/friends`, currentUser.uid));
                setFriendshipStatus(null);
            } else if (!friendshipStatus) {
                // Send friend request
                await setDoc(doc(db, `users/${user}/friends`, currentUser.uid), {
                    status: "pending",
                    timestamp: new Date(),
                    type: "received",
                    senderName: currentUserData.name,
                    senderUsername: currentUserData.username
                });

                await setDoc(doc(db, `users/${currentUser.uid}/friends`, user), {
                    status: "pending",
                    timestamp: new Date(),
                    type: "sent"
                });

                setFriendshipStatus('pending');
            }
        } catch (error) {
            console.error("Error managing friendship:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getFriendActionButton = () => {
        if (!currentUser || currentUser.uid === user) return null;

        let buttonText = "Add Friend";
        let buttonClass = "button-3 friend-action-btn";

        if (friendshipStatus === 'accepted') {
            buttonText = "Remove Friend";
            buttonClass += " remove-friend";
        } else if (friendshipStatus === 'pending') {
            buttonText = "Request Pending";
            buttonClass += " pending";
        }

        return (
            <button 
                className={buttonClass}
                onClick={handleFriendAction}
                disabled={isLoading || friendshipStatus === 'pending'}
            >
                {buttonText}
            </button>
        );
    };

    if (!user) {
        return (
            <div className='about'>
                <div className="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
            </div>
        );
    }

    return (
        <div className="about">
            <img className='profileimage profilePicture' src={photoURL} alt={user} />
            <h2>{name}</h2>
            <h3 className='username'>@{username}</h3>
            <p className="friend-count">
                {friendCount} {friendCount === 1 ? 'friend' : 'friends'}
            </p>
            <p className="bio">{bio}</p>
            {isViewOnly && getFriendActionButton()}
        </div>
    );
}

export default About;