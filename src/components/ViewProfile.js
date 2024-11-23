// ViewProfile.js
import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import About from './About';
import ViewPosts from './ViewPosts';

function ViewProfile() {
    const { userId } = useParams();
    const auth = getAuth();
    const db = getFirestore();
    const storage = getStorage();
    const [user, setUser] = useState(null);
    const [isAboutCollapsed, setIsAboutCollapsed] = useState(false);
    const [isFriend, setIsFriend] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const currentUser = auth.currentUser;

    useEffect(() => {
        const checkFriendshipStatus = async () => {
            if (!currentUser || !userId) return;
            
            try {
                const friendRef = doc(db, `users/${currentUser.uid}/friends`, userId);
                const friendDoc = await getDoc(friendRef);
                setIsFriend(friendDoc.exists() && friendDoc.data().status === 'accepted');
            } catch (error) {
                console.error("Error checking friendship:", error);
            }
        };

        const fetchUserData = async () => {
            if (!userId) return;

            try {
                setIsLoading(true);
                const userRef = doc(db, 'users', userId);
                const userSnap = await getDoc(userRef);
                const userData = userSnap.data();

                if (userData) {
                    let photoRef = userData.photo ? 
                        ref(storage, `profile-images/${userId}.jpg`) :
                        ref(storage, 'profile-images/default.jpg');

                    const photoURL = await getDownloadURL(photoRef);
                    setUser({
                        uid: userId,
                        displayName: userData.name,
                        photoURL: photoURL,
                        bio: userData.bio || 'No bio yet',
                        username: userData.username
                    });
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
        checkFriendshipStatus();
    }, [db, storage, userId, currentUser]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <div>User not found</div>;
    }

    // Don't allow viewing own profile through view route
    if (currentUser && userId === currentUser.uid) {
        return <Navigate to="/me" replace />;
    }

    const mainContentClass = `main-content ${!isAboutCollapsed ? 'with-about' : ''}`;

    return (
        <div className="profile-section">
            <button
                className={`about-toggle ${!isAboutCollapsed ? 'pane-expanded' : ''}`}
                onClick={() => setIsAboutCollapsed(!isAboutCollapsed)}
            >
                {isAboutCollapsed ? <ChevronRight /> : <ChevronLeft />}
            </button>

            <div className={`pane about-pane ${isAboutCollapsed ? 'collapsed' : 'expanded'}`}>
                <About
                    user={user.uid}
                    name={user.displayName}
                    photoURL={user.photoURL}
                    bio={isFriend ? user.bio : "This profile is private"}
                    username={user.username}
                    isViewOnly={true}
                />
                {!isFriend && (
                    <div className="private-profile-notice">
                        <p>Add this user as a friend to see their sticker book</p>
                    </div>
                )}
            </div>

            <div className={mainContentClass}>
                {isFriend ? (
                    <ViewPosts userID={userId} />
                ) : (
                    <div className="private-content">
                        <h2>Private Profile</h2>
                        <p>This user's sticker book is only visible to friends</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ViewProfile;