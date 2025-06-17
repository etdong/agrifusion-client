import { useState } from "react";

export default function Signup() {
    const c = document.getElementById('game') as HTMLCanvasElement;
    c.style.pointerEvents = 'none';
    c.style.display = 'none';
    const r = document.getElementById('root') as HTMLCanvasElement;
    r.style.pointerEvents = 'all';

    const [errMsg, setErrMsg] = useState('')

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


    const errorBox = () => {
        return (
            <div id='error'>{errMsg}</div>
        )
    }

    return (
        <div className='background'>
            <h1>Sign up</h1>
            {errorBox()}
            <form action={`https://api.donger.ca/api/signup`} method="post">
                <section>
                    <label htmlFor="username">Username:
                        <input id="username" name="username" type="text" autoComplete="username" required />
                    </label>
                    
                </section>
                <section>
                    <label htmlFor="new-password">Password:
                        <input id="new-password" name="password" type="password" autoComplete="new-password" required />
                    </label>
                </section>
                <button type="submit">Sign up</button>
            </form>
        </div>
        
    )
}