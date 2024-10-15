import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import Navbar from '../components/Navbar';
import './SignUp.css';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const SignUp = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const db = getFirestore();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                navigate("/me");
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [navigate]);

    const onSubmit = async (e) => {
        e.preventDefault();

        await createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                console.log(user);

                // Add user to database
                const userRef = doc(db, 'users', user.uid);
                setDoc(userRef, {
                    name: name,
                    email: email
                });
                navigate("/signin");
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode, errorMessage);
                // convert error message to readable error
                let readableError = '';
                switch (errorCode) {
                    case 'auth/invalid-email':
                        readableError = 'Please enter a valid email';
                        break;
                    case 'auth/email-already-in-use':
                        readableError = 'Email already in use';
                        break;
                    case 'auth/weak-password':
                        readableError = 'Password should be at least 6 characters';
                        break;
                    default:
                        readableError = 'An error occurred';
                }
                setError(readableError);
            });
    };

    return (
        <main >
            <Navbar />
            <section>
                <div>
                    <div className='signUpSheet'>
                        <form>
                            <div>
                                <h1>Sign up</h1>
                                <label htmlFor="name">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    label="Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="email-address">
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    label="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="password">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    label="Create password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                className='button-2'
                                type="submit"
                                onClick={onSubmit}
                            >
                                Sign up
                            </button>

                        </form>

                        <p>
                            Already have an account?{' '}
                            <NavLink to="/signin" >
                                Sign in
                            </NavLink>
                        </p>

                        <p className="error">{error}</p>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default SignUp
