import './Navbar.css';
import { CircleUserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import UserMenu from './UserMenu';

function Navbar() {
    const [userMenuIsOpen, setUserMenuIsOpen] = useState(false);

    const toggleUserMenu = () => {
        setUserMenuIsOpen(!userMenuIsOpen);
    }

  return (
    <div>
        <nav className="navbar">
        <div className="logo">
            <Link to="/">Postal</Link>
        </div>
        <div className="navbar-links">
            <Link to="/explore">explore</Link>
            <Link to="/friends">friends</Link>
            <Link to="/search">search</Link>
        </div>
        <div className="navbar-icons">
            <Link onClick={toggleUserMenu}><CircleUserRound size={32}/> </Link>
        </div>
        </nav>
    {userMenuIsOpen && <UserMenu />}
    </div>
  );
}

export default Navbar;