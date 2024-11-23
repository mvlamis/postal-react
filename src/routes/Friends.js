// src/routes/Friends.js
import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, setDoc, deleteDoc, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Friends.css";
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { UserMinus } from 'lucide-react';
const storage = getStorage();

const Friends = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [friendRequests, setFriendRequests] = useState([]);
    const [friends, setFriends] = useState([]);
    const [searchUsername, setSearchUsername] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [error, setError] = useState("");
    const [requestsLoading, setRequestsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
            if (!user) {
                navigate("/login");
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    useEffect(() => {
        if (user) {
            fetchFriends();
            fetchFriendRequests();
        }
    }, [user]);

    const fetchFriends = async () => {
        try {
            const friendsRef = collection(db, `users/${user.uid}/friends`);
            const q = query(friendsRef, where("status", "==", "accepted"));
            const snapshot = await getDocs(q);

            const friendsList = [];
            for (const friendDoc of snapshot.docs) {
                const friendDocRef = await getDoc(doc(db, "users", friendDoc.id));

                if (friendDocRef.exists()) {
                    const friendData = friendDocRef.data();
                    let photoURL;
                    try {
                        const photoRef = friendData.photo ?
                            ref(storage, `profile-images/${friendDoc.id}.jpg`) :
                            ref(storage, 'profile-images/default.jpg');
                        photoURL = await getDownloadURL(photoRef);
                    } catch (error) {
                        console.error("Error loading photo:", error);
                        photoURL = '/default-avatar.png'; // Fallback image
                    }

                    friendsList.push({
                        id: friendDoc.id,
                        username: friendData.username,
                        name: friendData.name,
                        photoURL: photoURL
                    });
                }
            }
            setFriends(friendsList);
        } catch (error) {
            console.error("Error fetching friends:", error);
            setError("Failed to load friends list");
        }
    };

    const fetchFriendRequests = async () => {
        try {
            setRequestsLoading(true);
            const friendsRef = collection(db, `users/${user.uid}/friends`);
            const q = query(friendsRef,
                where("status", "==", "pending"),
                where("type", "==", "received")
            );

            const snapshot = await getDocs(q);
            const requests = [];

            for (const doc of snapshot.docs) {
                const requestData = doc.data();
                requests.push({
                    id: doc.id,
                    username: requestData.senderUsername,
                    name: requestData.senderName,
                    timestamp: requestData.timestamp,
                    ...requestData
                });
            }

            console.log("Final processed requests:", requests);
            setFriendRequests(requests);
        } catch (error) {
            console.error("Error fetching requests:", error);
            setError("Failed to load friend requests");
        } finally {
            setRequestsLoading(false);
        }
    };

    const acceptFriendRequest = async (senderId) => {
        try {
            // Update recipient's (current user) collection
            await setDoc(doc(db, `users/${user.uid}/friends`, senderId), {
                status: "accepted",
                timestamp: new Date(),
                type: "accepted"
            });

            // Update sender's collection
            await setDoc(doc(db, `users/${senderId}/friends`, user.uid), {
                status: "accepted",
                timestamp: new Date(),
                type: "accepted"
            });

            fetchFriends();
            fetchFriendRequests();
        } catch (error) {
            console.error("Error accepting friend request:", error);
        }
    };

    const rejectFriendRequest = async (senderId) => {
        try {
            // Remove from both collections
            await deleteDoc(doc(db, `users/${user.uid}/friends`, senderId));
            await deleteDoc(doc(db, `users/${senderId}/friends`, user.uid));

            fetchFriendRequests();
        } catch (error) {
            console.error("Error rejecting friend request:", error);
        }
    };

    const removeFriend = async (friendId) => {
        try {
            await deleteDoc(doc(db, `users/${user.uid}/friends`, friendId));
            await deleteDoc(doc(db, `users/${friendId}/friends`, user.uid));
            fetchFriends(); // Refresh friends list
        } catch (error) {
            console.error("Error removing friend:", error);
            setError("Failed to remove friend");
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Navbar />
            <div className="friends-page">
                <div className="page-header">
                    <h1>Friends</h1>
                </div>
                {error && <div className="error-message">{error}</div>}

                <div className="friend-requests">
                    <h2>Friend Requests ({friendRequests.length})</h2>
                    {console.log("Rendering friend requests:", friendRequests)}
                    {requestsLoading ? (
                        <div>Loading requests...</div>
                    ) : friendRequests.length > 0 ? (
                        friendRequests.map(request => {
                            console.log("Rendering request:", request);
                            return (
                                <div key={request.id} className="request-card">
                                    <div className="user-info">
                                        <img
                                            src={request.photoURL}
                                            alt={request.username}
                                            className="profile-pic"
                                            onError={(e) => e.target.src = '/default-avatar.png'}
                                        />
                                        <div className="friend-details">
                                            <span className="friend-name">{request.senderName}</span>
                                            <span className="friend-username">@{request.senderUsername}</span>
                                        </div>
                                    </div>
                                    <div className="request-buttons">
                                        <button
                                            className="accept-btn"
                                            onClick={() => acceptFriendRequest(request.id)}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            className="reject-btn"
                                            onClick={() => rejectFriendRequest(request.id)}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div>No pending friend requests</div>
                    )}
                </div>

                <div className="friends-list">
                    <h2>Friends ({friends.length})</h2>
                    {friends.length > 0 ? (
                        friends.map(friend => (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/view/${friend.id}`);
                                }}
                            >
                                <div key={friend.id} className="friend-card">
                                    <div className="user-info">
                                        <img
                                            src={friend.photoURL}
                                            alt={friend.name}
                                            className="profile-pic"
                                            onError={(e) => e.target.src = '/default-avatar.png'}
                                        />
                                        <div className="friend-details">
                                            <span className="friend-name">{friend.name}</span>
                                            <span className="friend-username">@{friend.username}</span>
                                        </div>
                                    </div>
                                    <button
                                        className="remove-friend-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFriend(friend.id);
                                        }}
                                        title="Remove friend"
                                    >
                                        <UserMinus size={20} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div>No friends yet</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Friends;