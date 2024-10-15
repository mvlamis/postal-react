import './UserMenu.css';
import { signOut } from "firebase/auth";
import { auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';

function UserMenu() {
    const navigate = useNavigate();

    const handleLogout = () => {
        signOut(auth).then(() => {
            // Sign-out successful.
            navigate("/");
            console.log("Signed out successfully")
        }).catch((error) => {
            // An error happened.
        });
    }

    const signedInMenu = (
        <div className="UserMenu">
            <div className="user-menu__item">
                <Link to="/me">My Profile</Link>
            </div>
            <div className="user-menu__item">
                <Link to="/settings">Settings</Link>
            </div>
            <div className="user-menu__item">
                <Link onClick={handleLogout}>Logout</Link>
            </div>
        </div>
    );

    const signedOutMenu = (
        <div className="UserMenu">
            <div className="user-menu__item">
                <Link to="/signin">Sign In</Link>
            </div>
            <div className="user-menu__item">
                <Link to="/signup">Sign Up</Link>
            </div>
        </div>
    );
  
    return (
        <>
            {auth.currentUser ? signedInMenu : signedOutMenu}
        </>
    );
}

export default UserMenu;