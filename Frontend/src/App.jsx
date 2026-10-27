import React from 'react'
import { Route, Routes } from 'react-router'
import HomeScreeen from './screens/HomeScreen/HomeScreeen'
import LoginScreen from './screens/LoginScreen/LoginScreen'
import RegisterScreen from './screens/RegisterScreen/RegisterScreen'

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<HomeScreeen/>}/>
      <Route path='/login' element={<LoginScreen/>}/>
      <Route path='/register' element={<RegisterScreen/>} />
    </Routes>
  )
}


export default App