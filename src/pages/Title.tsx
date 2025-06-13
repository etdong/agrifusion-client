import './Title.css'

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
    
    return (
        <div className='background'>
            <div id='title'>
                Agrifusion
                <form onSubmit={handleSubmit}>
                    <input type="submit" value="Login"/>
                </form>
            </div>
        </div>
    )
}