import { useEffect, useState } from 'react'
import socket from '../utils/socket'
import './App.css'

function App() {
    
    const c = document.getElementById('game') as HTMLCanvasElement;
    c.hidden = false;
    const r = document.getElementById('root') as HTMLCanvasElement;
    r.style.pointerEvents = 'none';

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
            return(
                <div id='coins'>{"$" + coins}</div>
            )
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
            {menuComponent()}
        </div>
    )
}

export default App
