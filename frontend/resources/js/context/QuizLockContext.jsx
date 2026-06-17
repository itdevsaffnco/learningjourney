import { createContext, useContext, useState } from 'react'

const QuizLockContext = createContext({ isQuizActive: false, setIsQuizActive: () => {} })

export function QuizLockProvider({ children }) {
  const [isQuizActive, setIsQuizActive] = useState(false)
  return (
    <QuizLockContext.Provider value={{ isQuizActive, setIsQuizActive }}>
      {children}
    </QuizLockContext.Provider>
  )
}

export function useQuizLock() {
  return useContext(QuizLockContext)
}
