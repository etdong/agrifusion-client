import { useEffect, useState } from 'react'
import socket from '../utils/socket'
import './App.css'

function App() {
    const c = document.getElementById('game') as HTMLCanvasElement;
    const r = document.getElementById('root') as HTMLCanvasElement;
    r.style.pointerEvents = 'none';

    const [user, setUser] = useState({ id: "", username: "", loggedIn: false });

    useEffect(() => {
		fetch(import.meta.env.VITE_SERVER_URL + "/api/user", { 
			method: 'GET',
			mode: 'cors',
			credentials: 'include',
		}).then(res => res.json()).then(data => {
            setUser(data);
        });
	}, [])

    const [coins, setCoins] = useState(0)

    const [bagOpen, setBagOpen] = useState(false)

    type BagItem = { id: string; name: string; amount: number };
    const [bagItems, setBagItems] = useState<BagItem[]>([]);

    function openInventory() {
        setBagItems([
            {id: '1', name: 'Apple', amount: 5},
            {id: '2', name: 'Carrot', amount: 3},
            {id: '3', name: 'Wheat', amount: 10},
            {id: '4', name: 'Corn', amount: 2},
        ])
        setBagOpen(!bagOpen);
        c.focus()
    }

    const bag = () => {
        return (
            <div id='bag'>
                <h2>Bag</h2>
                <ul>
                    {bagItems.map(item => (
                        <li key={item.id}>
                            {item.name} x{item.amount}
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    function gameUI() {
        console.log(user)
        if (!user.loggedIn) {
            return (
                <h1 id='login_warning'>YOU NEED TO LOGIN TO PLAY!</h1>
            )
        }
        return(
            <div>
                <div id='coins'>{"$" + coins}</div>
                <button onClick={openInventory} className='btn' id='btn_bag'>BAG</button>
                {bagOpen && bag()}
            </div>
        )
    }

    socket.on('UPDATE player/coins', (data: { coins: number }) => {
        setCoins(data.coins)
    })

    return (
        <div className='background'>
            {gameUI()}
        </div>
    )
}

export default App
