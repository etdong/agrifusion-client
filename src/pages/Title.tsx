import { useEffect, useState } from 'react';
import './Title.css'
import socket from '../utils/socket';

export default function Title() {
    const c = document.getElementById('game') as HTMLCanvasElement;
    c.hidden = true;
    const r = document.getElementById('root') as HTMLCanvasElement;
    r.style.pointerEvents = 'all';

    // auth with google
    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        const url = import.meta.env.VITE_SERVER_URL + '/auth/google';
        window.open(url, '_self');
    }

    const [user, setUser] = useState({ loggedIn: false, name: {givenName: "", familyName: ""}, id: ""});
    
        useEffect(() => {
            fetch(import.meta.env.VITE_SERVER_URL + "/account", { 
                method: 'GET',
                mode: 'cors',
                credentials: 'include',
            }).then(res => res.json())
                .then(data => {
                    setUser(data);
                });
        }, [])
    
        function menuComponent() {
            if (user.loggedIn) {
                setInterval(() => {
                    console.log("Sending login event to server");
                    socket.emit('login', socket.id, user.name.givenName, user.id);
                }, 500);
            } else {
                return (
                    <p>YOU NEED TO LOGIN TO PLAY!</p>
                )
            }
        }
    
    
    return (
        <div className='background'>
            <div id='title'>
                Agrifusion
                <form onSubmit={handleSubmit}>
                    <input type="submit" value="Login"/>
                </form>
            </div>
            {menuComponent()}
        </div>
    )
}