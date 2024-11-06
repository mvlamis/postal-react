import './About.css';

function About({ user, photoURL, bio, name, username }) {
    if (!user) {
        return (
        <div className='about'>
                <div className="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
        </div>
        );
    }

    return (
        <div className="about">
            <img className='profileimage profilePicture' src={photoURL} alt={user} />
            <h2>{name}</h2>
            <h3 className='username'>@{username}</h3>
            <p className="bio">{bio}</p>
        </div>
    );
}

export default About;