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
        bio: ''
    });

    useEffect(() => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);
                const userData = userSnap.data();

                // check if user has a profile image
                let photoRef;
                try {
                    photoRef = ref(storage, `profile-images/${user.uid}.jpg`);
                }
                catch (error) {
                    photoRef = ref(storage, 'profile-images/default.jpg');
                }

                // check if user has a bio
                if (!userData.bio) {
                    userData.bio = 'No bio yet';
                }

                const photoURL = await getDownloadURL(photoRef);
                console.log(userData);
                setUser({
                    uid: user.uid,
                    displayName: userData.name,
                    photoURL: photoURL,
                    bio: userData.bio
                });

            }
        });
    }, [auth, db, storage]);

    return (
        <div className="profile-section">
            <About user={user.uid} name={user.displayName} photoURL={user.photoURL} bio={user.bio}/>
            <Posts userID={user.uid}/>
            <StickerSelection userID={user.uid}/>
        </div>
    );
}

export default Profile;