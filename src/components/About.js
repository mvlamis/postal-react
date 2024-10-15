import './About.css';

function About({ user, photoURL, bio, name }) {
    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="about">
            <img className='profileimage profilePicture' src={photoURL} alt={user} />
            <h2>{name}</h2>
            <p className="bio">{bio}</p>
        </div>
    );
}

export default About;