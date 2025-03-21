import React from 'react'
import Navbar from './components/Navbar'
import LoadingScreen from './components/LoadingScreen'

const App = () => {
  return (
    <>
      <LoadingScreen></LoadingScreen>
    <div className="absolute w-full h-full bg-ellWhite">
      <Navbar></Navbar>
      <div className="flex items-start">Hello World</div>
    </div>
    </>
  )
}

export default App