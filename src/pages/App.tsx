import { useEffect, useState } from 'react'
import socket from '../utils/socket'
import './App.css'
import { type BagItem } from '../components/bag'

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
    const [bagItems, setBagItems] = useState<BagItem[]>([]);

    const bag = () => {
        if (bagItems.length === 0) {
            return (
                <div id='bag'>
                    <h2>Bag</h2>
                    <p>No items in bag.</p>
                </div>
            );
        }
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

    function openInventory() {
        if (bagOpen) {
            setBagOpen(false);
            c.focus();
            return;
        }
        socket.emit('GET player/bag', (response: { status: string, data: BagItem[] } ) => {
            if (response.status === 'ok') {
                setBagItems(response.data);
                setBagOpen(true);
                c.focus();
            }
            return;
        })
    }

    function handleRedirect() {
        window.location.href = import.meta.env.VITE_CLIENT_URL
    }

    function gameUI() {
        if (!user.loggedIn) {
            c.hidden = true;
            r.style.pointerEvents = 'all';
            return (
                <h1 onClick={handleRedirect} id='login_warning'>YOU NEED TO LOGIN TO PLAY!</h1>
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
