import { useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, setDoc, doc, getDoc } from "firebase/firestore";
import Navbar from "../components/Navbar";
import "./Search.css"; 

const Search = () => {
    const [user] = useState(auth.currentUser);
    const [searchUsername, setSearchUsername] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [error, setError] = useState("");

    const searchUsers = async () => {
        if (searchUsername.length < 3) return;
        const q = query(
            collection(db, "users"),
            where("username", ">=", searchUsername),
            where("username", "<=", searchUsername + "\uf8ff")
        );
        const snapshot = await getDocs(q);
        setSearchResults(snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })).filter(user => user.id !== auth.currentUser.uid));
    };

    const sendFriendRequest = async (recipientId) => {
        if (!user) {
            setError("You must be logged in");
            return;
        }

        try {
            const senderDocRef = doc(db, "users", user.uid);
            const senderDocSnap = await getDoc(senderDocRef);

            if (!senderDocSnap.exists()) {
                setError("User profile not found");
                return;
            }

            const senderData = senderDocSnap.data();

            if (!senderData.name || !senderData.username) {
                setError("User profile incomplete");
                return;
            }

            await setDoc(doc(db, `users/${recipientId}/friends`, user.uid), {
                status: "pending",
                timestamp: new Date(),
                type: "received",
                senderName: senderData.name,
                senderUsername: senderData.username
            });

            await setDoc(doc(db, `users/${user.uid}/friends`, recipientId), {
                status: "pending",
                timestamp: new Date(),
                type: "sent"
            });

            setError("");
            alert("Friend request sent!");
        } catch (error) {
            console.error("Error sending friend request:", error);
            setError("Failed to send friend request");
        }
    };

    return (
        <div>
            <Navbar />
            <div className="search-page">
                <div className="page-header">
                    <h1>Search</h1>
                </div>
                {error && <div className="error-message">{error}</div>}
                <div className="search-section">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchUsername}
                        onChange={(e) => setSearchUsername(e.target.value)}
                    />
                    <button onClick={searchUsers}>Search</button>
                    <div className="search-results">
                        {searchResults.map(user => (
                            <div key={user.id} className="user-card">
                                <span>{user.username}</span>
                                <button onClick={() => sendFriendRequest(user.id)}>
                                    Add Friend
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Search;