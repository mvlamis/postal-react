import './SettingsCard.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { getStorage, ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import CustomImageEditor from './CustomImageEditor';

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
    
    const handleProfilePictureChange = (blob) => {
        const storageRef = ref(storage, `profile-images/${user.uid}.jpg`);
        const uploadTask = uploadBytes(storageRef, blob);
        uploadTask.then(() => {
            getDownloadURL(storageRef).then((url) => {
                setUser(prevUser => ({
                    ...prevUser,
                    photoURL: url
                }));
                console.log('Profile picture uploaded successfully');
            });
        });
    
        setShowImageEditor(false);
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

    return (
        <div className="settingsCard">
            <h1>settings</h1>
            <h2>account</h2>
            <div className="accountSettings">
                <div className="pictureSettings">
                    <img className="profilePicture" src={user.photoURL} alt="profile" />
                    <button className="changePicture button2" onClick={setShowImageEditor}>change picture</button>
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
        </div>
    );
}

export default SettingsCard;