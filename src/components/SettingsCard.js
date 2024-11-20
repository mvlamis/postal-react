import './SettingsCard.css';
import { getAuth, onAuthStateChanged, deleteUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, deleteDoc, deleteObject, deleteDocs, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { getStorage, ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import CustomImageEditor from './CustomImageEditor';
import ConfirmPopup from './ConfirmPopup';

const SettingsCard = () => {
    const auth = getAuth();
    const db = getFirestore();
    const storage = getStorage();
    const [user, setUser] = useState({
        uid: '',
        username: '',
        displayName: '',
        photoURL: '',
        bio: ''
    });
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [username, setUsername] = useState('');

    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    // open CustomImageEditor
    const [showImageEditor, setShowImageEditor] = useState(false);

    useEffect(() => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);
                const userData = userSnap.data();

                // check if user has a profile image
                let photoRef;
                if (userData.photo) {
                    photoRef = ref(storage, `profile-images/${user.uid}.jpg`);
                } else {
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
                    username: userData.username,
                    displayName: userData.name,
                    photoURL: photoURL,
                    bio: userData.bio
                });
                setName(userData.name);
                setBio(userData.bio);
                setUsername(userData.username);
            }
        });
    }, [auth, db, storage]);

    const handleNameChange = (e) => {
        setName(e.target.value);
    };

    const handleBioChange = (e) => {
        setBio(e.target.value);
    };

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    };
    
    const handleProfilePictureChange = async (blob) => {
        try {
            // Upload to Firebase Storage
            const storageRef = ref(storage, `profile-images/${user.uid}.jpg`);
            await uploadBytes(storageRef, blob);
            
            // Get the download URL
            const photoURL = await getDownloadURL(storageRef);
            
            // Update Firestore document
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                photo: true
            });
            
            // Update local state
            setUser(prevUser => ({
                ...prevUser,
                photoURL: photoURL
            }));

            // Clear cached user data to force reload
            localStorage.removeItem(`user-${user.uid}`);
            
            console.log('Profile picture updated successfully');
            setShowImageEditor(false);
            
        } catch (error) {
            console.error('Error updating profile picture:', error);
        }
    };

    const handleSave = async () => {
        if (user.uid) {
            const userRef = doc(db, 'users', user.uid);
            try {
                await updateDoc(userRef, {
                    name: name,
                    bio: bio,
                    username: username
                });
                console.log('User information updated successfully');
                // Update local state
                setUser(prevUser => ({
                    ...prevUser,
                    displayName: name,
                    bio: bio,
                    username: username
                }));
            } catch (error) {
                console.error('Error updating user information:', error);
            }
        }
    };

    const handleUserDelete = async () => {
        if (user.uid) {
            try {
                // remove from firebase auth
                await deleteUser(auth.currentUser);
                // remove from firestore
                const userRef = doc(db, 'users', user.uid);
                await deleteDoc(userRef);
                // remove from storage
                const photoRef = ref(storage, `profile-images/${user.uid}.jpg`);
                await deleteDoc(photoRef);
                // check for cards in explore
                const exploreRef = ref(db, 'explore');
                const exploreSnapshot = await getDocs(exploreRef);
                exploreSnapshot.forEach(async (doc) => {
                    if (doc.data().user === user.uid) {
                        await deleteDoc(doc.ref);
                    }
                });
                // navigate to home
                window.location.href = '/';
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    }

    return (
        <div className="settingsCard">
            <h1>settings</h1>
            <h2>account</h2>
            <div className="accountSettings">
                <div className="pictureSettings">
                    <img className="profilePicture" src={user.photoURL} alt="profile" />
                    <button className="changePicture button-3" onClick={setShowImageEditor}>change picture</button>
                    {showImageEditor && <CustomImageEditor onSave={handleProfilePictureChange} onClose={() => setShowImageEditor(false)} />}
                </div>
                <div className='infoSettings'>
                    <h3>name</h3>
                    <input
                        type="text"
                        value={name}
                        onChange={handleNameChange}
                        placeholder="Jennifer"
                    />
                    <h3>username</h3>
                    <input
                        type="text"
                        value={username}
                        onChange={handleUsernameChange}
                        placeholder="bendandsnap"
                    />
                    <h3>bio</h3>
                    <textarea
                        value={bio}
                        onChange={handleBioChange}
                        placeholder="You look like the 4th of July. Makes me want a hot dog real bad."
                    />
                </div>
            </div>
            <button className="button-2" onClick={handleSave}>Save Changes</button>
            <h2>customization</h2>
            <h3>accent color</h3>
            <input type="color" />
            <h3>background texture</h3>
            <div className="backgroundTextures">
                <img src="https://via.placeholder.com/50" alt="texture1" />
                <img src="https://via.placeholder.com/50" alt="texture2" />
                <img src="https://via.placeholder.com/50" alt="texture3" />
                <img src="https://via.placeholder.com/50" alt="texture4" />
            </div>
            <button className="button-3" onClick={() => setShowConfirmDelete(true)}>Delete Account</button>
            {showConfirmDelete && <ConfirmPopup
                title="Delete Account"
                message="Are you sure you want to delete your account? This action cannot be undone."
                onConfirm={handleUserDelete}
                onCancel={() => setShowConfirmDelete(false)}
            />}
        </div>
    );
}

export default SettingsCard;