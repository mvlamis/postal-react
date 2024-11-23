import './Navbar.css';
import { CircleUserRound } from 'lucide-react';
import { CircleHelp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import UserMenu from './UserMenu';
import Help from './Help';

function Navbar() {
    const [userMenuIsOpen, setUserMenuIsOpen] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

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
            <Link onClick={() => setShowHelp(!showHelp)}><CircleHelp size={32} /></Link>
            <Link onClick={toggleUserMenu}><CircleUserRound size={32}/> </Link>
        </div>
        </nav>
    {userMenuIsOpen && <UserMenu />}
    {showHelp && <Help onClose={() => setShowHelp(false)} />}
    </div>
  );
}

export default Navbar;