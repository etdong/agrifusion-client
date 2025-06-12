import React, { useState } from 'react'
import socket from './utils/socket'
import './App.css'

function App() {

  const [coins, setCoins] = useState(0)

  socket.on('UPDATE player/coins', (data: { coins: number }) => {
    setCoins(data.coins)
  })

  return (
    <div>
      <div id='coins'>{"$" + coins}</div>
    </div>
  )
}

export default App
