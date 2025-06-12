import { useEffect, useState } from 'react'
import socket from '../utils/socket'
import './App.css'

function App() {
    
    const c = document.getElementById('game') as HTMLCanvasElement;
    c.hidden = false;

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
                <h1>YOU NEED TO LOGIN TO PLAY!</h1>
            )
        }
    }
    

    const [coins, setCoins] = useState(0)

    socket.on('UPDATE player/coins', (data: { coins: number }) => {
        setCoins(data.coins)
    })

    return (
        <div>
            <div id='coins'>{"$" + coins}</div>
            {menuComponent()}
        </div>
    )
}

export default App
