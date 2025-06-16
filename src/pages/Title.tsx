import { useState } from 'react';
import './Title.css'

export default function Title() {
    const c = document.getElementById('game') as HTMLCanvasElement;
    c.hidden = true
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
            const cookieStrings = document.cookie.split(';');
            const cookies: { [key: string]: string }  = {};
            cookieStrings.forEach(cookie => {
                const [key, value] = cookie.trim().split('=');
                cookies[key] = value;
            });

            if (cookies['error']) {
                // parse the error message from the cookie
                const errMsg = decodeURIComponent(cookies['error']);
                setErrMsg(errMsg);
                document.cookie = 'error=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            }
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
                        <label htmlFor="username">Username:
                            <input id="username" name="username" type="text" autoComplete="username" required autoFocus />
                        </label>
                    </section>
                    <section>
                        <label htmlFor="current-password">Password:
                            <input id="current-password" name="password" type="password" autoComplete="current-password" required />
                        </label>
                    </section>
                    <input type="hidden" name="_csrf" value="<%= csrfToken %>" />
                </div>
                <br />
                <div id='buttons'>
                    <button className='btn' id='btn_sign_in' type="submit">Sign in</button>
                    <button className='btn' id='btn_sign_up' onClick={handleSignUp}>Sign up</button>
                </div>
            </form>
            <br />
        </div>
    )
}