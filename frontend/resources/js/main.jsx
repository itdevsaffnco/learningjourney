import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App'
import { QuizLockProvider } from './context/QuizLockContext'
import '../css/app.css'

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <Router>
      <QuizLockProvider>
        <App />
      </QuizLockProvider>
    </Router>
  </React.StrictMode>
)
