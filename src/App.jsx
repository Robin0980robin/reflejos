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
  const [userScores, setUserScores] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const scoresPerPage = 5
  const [circleX, setCircleX] = useState(0)
  const [circleY, setCircleY] = useState(0)

  useEffect(() => {
    fetchScores()
  }, [])

  const fetchScores = async (page = 1) => {
    const from = (page - 1) * scoresPerPage
    const to = from + scoresPerPage - 1

    const { data, error, count } = await supabase
      .from('puntajes')
      .select('*', { count: 'exact' })
      .order('puntaje', { ascending: true })
      .range(from, to)

    if (!error) {
      setTopScores(data)
      setTotalPages(Math.ceil(count / scoresPerPage))
      setCurrentPage(page)
      console.log('Top scores:', data)
    } else {
      console.error('Error al obtener puntajes:', error)
    }
  }

  const fetchUserScores = async () => {
    const { data, error } = await supabase
      .from('puntajes')
      .select('*')
      .eq('nombre', username)
      .order('fecha', { ascending: false })  // ordena por fecha descendente

    if (!error) {
      setUserScores(data)
    } else {
      console.error('Error al obtener historial del usuario:', error)
    }
  }

  const handleStartRound = () => {
    setShowCircle(false)
    const delay = Math.random() * 1000 + 500
    setTimeout(() => {
      setStartTime(Date.now())
      const containerWidth = 600
      const containerHeight = 300

      const size = 96

      const randomX = Math.floor(Math.random() * (containerWidth - size))
      const randomY = Math.floor(Math.random() * (containerHeight - size))

      setCircleX(randomX)
      setCircleY(randomY)
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
      fetchUserScores()
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

  const reiniciarJuego = () => {
    setGameStarted(false)
    setShowCircle(false)
    setStartTime(null)
    setReactionTimes([])
    setRound(0)
    setFinalTime(null)
  }

  const cambiarUsuario = () => {
    setUsername('')
    setInputName('')
    setGameStarted(false)
    setShowCircle(false)
    setStartTime(null)
    setReactionTimes([])
    setRound(0)
    setFinalTime(null)
    setUserScores([])
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
              <li
                key={i}
                className={score.nombre === username && score.puntaje === finalTime ? 'font-bold text-indigo-600' : ''}
              >
                {score.nombre}: {score.puntaje} ms — {new Date(score.fecha).toLocaleDateString()}
              </li>
            ))}
          </ul>

          <h3 className="mt-6 text-xl">📜 Tu historial de puntajes</h3>
          <ul className="mt-2">
            {userScores.length > 0 ? (
              userScores.map((score, i) => (
                <li key={i}>
                  {new Date(score.fecha).toLocaleDateString()}: {score.puntaje} ms
                </li>
              ))
            ) : (
              <li>No tienes puntajes anteriores registrados.</li>
            )}
          </ul>

          <div className="mt-4 flex justify-center space-x-2">
            <button
              onClick={() => fetchScores(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}
            >
              ← Anterior
            </button>
            <span className="px-4 py-2 text-gray-700">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => fetchScores(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded ${currentPage === totalPages ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}
            >
              Siguiente →
            </button>
          </div>
              <div className="mt-6 flex flex-col space-y-2 items-center">
                <button
                  onClick={reiniciarJuego}
                  className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
                >
                  🔁 Jugar de nuevo
                </button>
                <button
                  onClick={cambiarUsuario}
                  className="bg-red-400 text-white px-4 py-2 rounded hover:bg-red-500"
                >
                  👤 Cambiar de usuario
                </button>
              </div>

        </div>
      ) : (
        <div className="relative w-[900px] h-[600px] border bg-white overflow-hidden flex items-center justify-center">
          {showCircle ? (
            <div
              onClick={handleClick}
              className="w-24 h-24 bg-red-500 rounded-full animate-pulse cursor-pointer absolute"
              style={{ left: `${circleX}px`, top: `${circleY}px` }}
            ></div>
          ) : (
            <p className="text-xl">Prepárate...</p>
          )}
        </div>
      )}
    </div>
  )
}

export default App
