import './Signup.css'

export default function Signup() {
    const c = document.getElementById('game') as HTMLCanvasElement;
    c.style.pointerEvents = 'none';
    c.style.display = 'none';
    const r = document.getElementById('root') as HTMLCanvasElement;
    r.style.pointerEvents = 'all';

    return (
        <div className='background'>
            <h1>Sign up</h1>
            <form action={`${import.meta.env.VITE_SERVER_URL}/api/signup`} method="post">
                <section>
                    <label htmlFor="username">Username</label>
                    <input id="username" name="username" type="text" autoComplete="username" required />
                </section>
                <section>
                    <label htmlFor="new-password">Password</label>
                    <input id="new-password" name="password" type="password" autoComplete="new-password" required />
                </section>
                <button type="submit">Sign up</button>
            </form>
        </div>
        
    )
}