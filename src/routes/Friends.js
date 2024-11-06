import Navbar from "../components/Navbar"
import "./Friends.css"

const Friends = () => {
    return (
        <div>
            <Navbar />
            <div className="friends-page">
                <div className="page-header">
                    <h1>Friends</h1>
                </div>
                <div className="friends-list">
                    {/* Display friends here */}
                </div>
                <div className="friends-cards">
                    {/* Display friends' cards here */}
                </div>
            </div>
        </div>
    );
};

export default Friends;