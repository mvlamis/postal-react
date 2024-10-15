// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage, ref } from "firebase/storage";
import { getDownloadURL } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration

const firebaseConfig = {
    apiKey: "AIzaSyDz4NGjnm2aTCF8SShuXuDE8H9RwtHrpdg",
    authDomain: "postal-ee81e.firebaseapp.com",
    projectId: "postal-ee81e",
    storageBucket: "postal-ee81e.appspot.com",
    messagingSenderId: "1088790020414",
    appId: "1:1088790020414:web:140ab9d5e4768c156cac6f",
    measurementId: "G-QTV8J73VPW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let UID = '';
// get current user's UID
// const UID = getAuth().currentUser.uid;
getAuth(app).onAuthStateChanged((user) => {
    if (user) {
        // User logged in already or has just logged in.
        console.log(user.uid);
        UID = user.uid;
    } else {
        // User not logged in or has just logged out.
    }
});

// Get a reference to the storage service, which is used to create references in your storage bucket
const storage = getStorage();

// Create a child reference
const profileImagesRef = ref(storage, 'profile-images');

// Create a reference to the file we want to download
const profileImageRef = ref(profileImagesRef, `pRqdwxxM62TKdrND1KC3DyvE11l2.jpg`);

export async function getImage(location) {
    const imageRef = ref(profileImagesRef, location);
    let downloadURL = '';
    await getDownloadURL(imageRef)
        .then((url) => {
            // Insert url into an <img> tag to "download"
            downloadURL = url;
            console.log(downloadURL)
        });
    return downloadURL;
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export { db, storage, UID };
export default app;