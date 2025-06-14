import { useState } from 'react';
import './Title.css'

export default function Title() {
    const c = document.getElementById('game') as HTMLCanvasElement;
    c.style.pointerEvents = 'none';
    c.style.display = 'none';
    const r = document.getElementById('root') as HTMLCanvasElement;
    r.style.pointerEvents = 'all';

    fetch(import.meta.env.VITE_SERVER_URL + "/api/user", { 
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
    }).then(res => res.json()).then(data => {
        if (data.loggedIn) {
            window.location.href = '/#/play';
        } else {
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            console.log(urlParams.get('error'));
            setErrMsg(urlParams.get('error') || '');
        }
    })

    const [errMsg, setErrMsg] = useState('')

    const errorBox = () => {
        return (
            <div id='error'>{errMsg}</div>
        )
        
    }

    function handleSignUp() {
        window.location.href = import.meta.env.VITE_CLIENT_URL + '/#/signup'
    }

    return (
        <div className='background'>
            <div id='title'>
                Agrifusion
            </div>
            <form action={`${import.meta.env.VITE_SERVER_URL}/api/login`} method="post">
                {errorBox()}
                <div id='login-form'>
                    <section>
                        <label htmlFor="username">Username: </label>
                        <input id="username" name="username" type="text" autoComplete="username" required autoFocus />
                    </section>
                    <section>
                        <label htmlFor="current-password">Password: </label>
                        <input id="current-password" name="password" type="password" autoComplete="current-password" required />
                    </section>
                    <input type="hidden" name="_csrf" value="<%= csrfToken %>" />
                </div>
            <br />
            <button type="submit">Sign in</button>
            </form>
            <br />
            <button onClick={handleSignUp}>Sign up</button>
        </div>
    )
}