import './SignUp.css'
import Navbar from "../components/Navbar"
import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { NavLink, useNavigate } from 'react-router-dom'

const SignIn = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [readableError, setError] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                navigate("/me");
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [navigate]);

    const onLogin = (e) => {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                navigate("/me")
                console.log(user);
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode, errorMessage)
                let readableError = '';
                switch (errorCode) {
                    case 'auth/invalid-email':
                        readableError = 'Please enter a valid email';
                        break;
                    case 'auth/user-not-found':
                        readableError = 'User not found';
                        break;
                    case 'auth/wrong-password':
                        readableError = 'Wrong password';
                        break;
                    case 'auth/invalid-credential':
                        readableError = 'Invalid email or password';
                        break;
                    default:
                        readableError = 'An error occurred';
                }
                setError(readableError);
            });
    };

    return (
        <>
            <main >
                <Navbar />
                <section>
                    <div className='signUpSheet'>
                        <form>
                            <div>
                                <h1>Sign In</h1>
                                <label htmlFor="email-address">
                                    Email address
                                </label>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    required
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div>
                                <label htmlFor="password">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <button
                                className='button-2'
                                onClick={onLogin}
                            >
                                Login
                            </button>

                            <p className='error'>{readableError}</p>

                        </form>

                        <p className="text-sm text-white text-center">
                            No account yet? {' '}
                            <NavLink to="/signup">
                                Sign up
                            </NavLink>
                        </p>

                    </div>
                </section>
            </main>
        </>
    )
}

export default SignIn
