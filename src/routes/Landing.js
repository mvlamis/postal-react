import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';  // Adjust path as needed
import './Landing.css';
import Logo from '../images/logo@4x.png';
import SignInModal from '../components/SignInModal';
import SignUpModal from '../components/SignUpModal';

const Landing = () => {
    const navigate = useNavigate();
    const [authStage, setAuthStage] = useState('');
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    // Auth state monitoring
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                navigate('/me');
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [navigate]);

    // Window resize handling
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Card position calculation 
    useEffect(() => {
        const cardWidth = 400;
        const cardHeight = 300;
        const positions = [];
        const maxAttempts = 1000000;

        // Get viewport dimensions
        const viewportWidth = windowSize.width;
        const viewportHeight = windowSize.height;

        // decide how many cards to display based on viewport size
        const numCards = Math.floor((viewportWidth * viewportHeight / (cardWidth * cardHeight)));

        // Helper function to check if two rectangles overlap
        const doesOverlap = (rect1, rect2) => {
            return !(rect1.x + cardWidth < rect2.x || 
                    rect1.x > rect2.x + cardWidth || 
                    rect1.y + cardHeight < rect2.y || 
                    rect1.y > rect2.y + cardHeight);
        };

        // Generate all positions first
        for (let i = 0; i < numCards; i++) {
            let attempts = 0;
            let validPosition = false;
            let newPosition;

            while (!validPosition && attempts < maxAttempts) {
                newPosition = {
                    x: Math.random() * (viewportWidth - cardWidth),
                    y: Math.random() * (viewportHeight - cardHeight),
                    rotation: Math.random() * 90 - 45
                };

                validPosition = true;
                for (const pos of positions) {
                    if (doesOverlap(newPosition, pos)) {
                        validPosition = false;
                        break;
                    }
                }
                attempts++;
            }

            if (validPosition) {
                positions.push(newPosition);
            }
        }

        // Clear existing cards
        const existingCards = document.querySelectorAll('.background-card');
        existingCards.forEach(card => card.remove());


        // Create and add cards with pre-calculated positions
        const background = document.querySelector('.background');
        positions.forEach(position => {
            const card = document.createElement('div');
            card.classList.add('background-card');
            card.style.left = `${position.x}px`;
            card.style.top = `${position.y}px`;
            card.style.transform = `rotate(${position.rotation}deg)`;
            background.appendChild(card);
        });
    }, [windowSize]);

    const handleSignUp = () => {
        setAuthStage('signup');
    }

    const handleSignIn = () => {
        setAuthStage('signin');
    }

    const handleAuthStage = (stage) => {
        setAuthStage(stage);
    }
    

    return (
        <div className="landing">
            <div className="background"></div>
            <div className="background-overlay"></div>
            <div className="overlay">
                {authStage === 'signup' && <SignUpModal onAuthStageChange={handleAuthStage} />}
                {authStage === 'signin' && <SignInModal onAuthStageChange={handleAuthStage} />}
                {authStage === '' && (
                    <>
                        <div className="title-card">
                            <img className='landing-logo' src={Logo} alt="Postal Logo" />
                            <p className='landing-title'>Postal</p>
                            <p className='landing-subtitle'>Tangible social media</p>
                        </div>
                        <div className="cta">
                            <button className="button-2" onClick={handleSignUp}>Sign Up</button>
                            <button className="button-2" onClick={handleSignIn}>Sign In</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Landing;