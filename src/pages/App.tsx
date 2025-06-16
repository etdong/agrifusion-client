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
        socket.emit('GET player/inventory', (status: string, data: { items: BagItem[] }) => {
            if (status !== 'ok') {
                console.error('Failed to fetch inventory:', status);
                return;
            }
            setBagItems(data.items);
        })
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
        if (!user.loggedIn) {
            c.hidden = true;
            return (
                <h1 id='login_warning'>YOU NEED TO LOGIN TO PLAY!</h1>
            )
        }
        c.hidden = false;
        c.focus();
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
