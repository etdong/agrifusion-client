import React, { useState } from 'react'
import './App.css'

function App() {

  const [coins, setCoins] = useState(0)

  return (
    <div>
      <div id='coins'>{"$" + coins}</div>
    </div>
  )
}

export default App
