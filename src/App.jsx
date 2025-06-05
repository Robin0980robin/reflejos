import React, { useState, useEffect } from 'react'
import { supabase, guardarPuntaje } from './supabaseClient'

function App() {
  const [username, setUsername] = useState('')
  const [inputName, setInputName] = useState('')
  const [gameStarted, setGameStarted] = useState(false)
  const [showCircle, setShowCircle] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [reactionTimes, setReactionTimes] = useState([])
  const [round, setRound] = useState(0)
  const [finalTime, setFinalTime] = useState(null)
  const [topScores, setTopScores] = useState([])

  useEffect(() => {
    fetchScores()
  }, [])

  const fetchScores = async () => {
    const { data, error } = await supabase
      .from('puntajes')
      .select('*')
      .order('puntaje', { ascending: true })
      .limit(5)
    if (!error) setTopScores(data)
  }

  const handleStartRound = () => {
    setShowCircle(false)
    const delay = Math.random() * 2000 + 1000
    setTimeout(() => {
      setStartTime(Date.now())
      setShowCircle(true)
    }, delay)
  }

  const handleClick = () => {
    if (!showCircle) return
    const reactionTime = Date.now() - startTime
    const newTimes = [...reactionTimes, reactionTime]
    setReactionTimes(newTimes)
    setShowCircle(false)

    if (round < 4) {
      setRound(round + 1)
      setTimeout(handleStartRound, 1000)
    } else {
      const avg = Math.round(newTimes.reduce((a, b) => a + b) / newTimes.length)
      setFinalTime(avg)
      guardarPuntaje(username, avg)
      fetchScores()
    }
  }

  const handleSubmitName = () => {
    if (inputName.trim()) {
      setUsername(inputName)
    }
  }

  const startGame = () => {
    setGameStarted(true)
    setTimeout(handleStartRound, 1000)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-200 to-purple-300 text-center p-4">
      {!username ? (
        <div className="bg-white p-6 rounded-xl shadow-xl">
          <h1 className="text-2xl font-bold mb-4">Ingresa tu nombre</h1>
          <input value={inputName} onChange={e => setInputName(e.target.value)} className="p-2 border rounded" />
          <button onClick={handleSubmitName} className="ml-2 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">Continuar</button>
        </div>
      ) : !gameStarted ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">Bienvenido, {username}!</h2>
          <button onClick={startGame} className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600">Iniciar Juego</button>
        </div>
      ) : finalTime ? (
        <div>
          <h2 className="text-2xl font-bold mb-2">¡Juego terminado!</h2>
          <p>Tu tiempo promedio fue: <strong>{finalTime}</strong> ms</p>
          <h3 className="mt-6 text-xl">🏆 Mejores Puntajes</h3>
          <ul className="mt-2">
            {topScores.map((score, i) => (
              <li key={i}className={score.nombre === username && score.puntaje === finalTime ? 'font-bold text-indigo-600' : ''} 
              > 
                {score.nombre}: {score.puntaje}ms
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="relative w-full h-96 flex items-center justify-center">
          {showCircle ? (
            <div onClick={handleClick} className="w-24 h-24 bg-red-500 rounded-full animate-pulse cursor-pointer"></div>
          ) : (
            <p className="text-xl">Prepárate...</p>
          )}
        </div>
      )}
    </div>
  )
}

export default App
