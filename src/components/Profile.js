import About from './About';
import Posts from './Posts';
import StickerSelection from './StickerSelection';
import './Profile.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

function Profile() {
    const auth = getAuth();
    const db = getFirestore();
    const storage = getStorage();
    const [user, setUser] = useState({
        uid: '',
        displayName: '',
        photoURL: '',
        bio: '',
        username: ''
    });
    const [isAboutCollapsed, setIsAboutCollapsed] = useState(true);
    const [isStickerCollapsed, setIsStickerCollapsed] = useState(true);

    useEffect(() => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const cachedUser = localStorage.getItem(`user-${user.uid}`);
                if (cachedUser) {
                    setUser(JSON.parse(cachedUser));
                } else {
                    const userRef = doc(db, 'users', user.uid);
                    const userSnap = await getDoc(userRef);
                    const userData = userSnap.data();

                    let photoRef;
                    if (userData.photo) {
                        photoRef = ref(storage, `profile-images/${user.uid}.jpg`);
                    } else {
                        photoRef = ref(storage, 'profile-images/default.jpg');
                    }

                    if (!userData.bio) {
                        userData.bio = 'No bio yet';
                    }

                    const photoURL = await getDownloadURL(photoRef);
                    const userProfile = {
                        uid: user.uid,
                        displayName: userData.name,
                        photoURL: photoURL,
                        bio: userData.bio,
                        username: userData.username
                    };

                    setUser(userProfile);
                    localStorage.setItem(`user-${user.uid}`, JSON.stringify(userProfile));
                }
            }
        });
    }, [auth, db, storage]);

    // Determine classes for main-content
    const mainContentClass = `
        main-content
        ${!isAboutCollapsed ? 'with-about' : ''}
        ${!isStickerCollapsed ? 'with-sticker' : ''}
    `;

    return (
        <div className="profile-section">
            {/* About Toggle Button */}
            <button
                className={`button-3 about-toggle ${!isAboutCollapsed ? 'pane-expanded' : ''}`}
                onClick={() => setIsAboutCollapsed(!isAboutCollapsed)}
            >
                {isAboutCollapsed ? 'Show About' : 'Hide About'}
            </button>

            {/* About Pane */}
            <div className={`pane about-pane ${isAboutCollapsed ? 'collapsed' : 'expanded'}`}>
                <About
                    user={user.uid}
                    name={user.displayName}
                    photoURL={user.photoURL}
                    bio={user.bio}
                    username={user.username}
                />
            </div>

            {/* Main Content */}
            <div className={mainContentClass}>
                <Posts userID={user.uid} />
            </div>

            {/* Sticker Toggle Button */}
            <button
                className={`button-3 sticker-toggle ${!isStickerCollapsed ? 'pane-expanded' : ''}`}
                onClick={() => setIsStickerCollapsed(!isStickerCollapsed)}
            >
                {isStickerCollapsed ? 'Show Stickers' : 'Hide Stickers'}
            </button>

            {/* Sticker Pane */}
            <div className={`pane sticker-pane ${isStickerCollapsed ? 'collapsed' : 'expanded'}`}>
                <StickerSelection userID={user.uid} />
            </div>
        </div>
    );
}

export default Profile;