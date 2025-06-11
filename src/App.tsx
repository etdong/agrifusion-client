import React, { useState } from 'react'
import './App.css'

function App() {

  const [coins, setCoins] = useState(0)

  return (
    <div>
      <p>{"$" + coins}</p>
    </div>
  )
}

export default App
