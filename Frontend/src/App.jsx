import React from 'react'
import { Route, Routes } from 'react-router'
import HomeScreeen from './screens/HomeScreen/HomeScreeen'
import LoginScreen from './screens/LoginScreen/LoginScreen'
import RegisterScreen from './screens/RegisterScreen/RegisterScreen'
import VerifyEmailScreen from './screens/VerifyEmailScreen/VerifyEmailScreen'
import ResendEmailVerificationScreen from './screens/ResendEmailVerificationScreen/ResendEmailVerificationScreen'
import ForgotPasswordScreen from './screens/ForgotPasswordScreen/ForgotPasswordScreen'
import ResetPasswordScreen from './screens/ResetPasswordScreen/ResetPasswordScreen'
import AuthMiddleware from './Middlewares/AuthMiddleware'

const App = () => {
  return (
    <Routes>
      <Route element={<AuthMiddleware/>}>

        <Route 
          path='/' 
          element={<HomeScreeen/>}
        />
        <Route 
          path='/home' 
          element={<HomeScreeen/>}
        />

      </Route>
      <Route path='/login' element={<LoginScreen/>}/>
      <Route path='/register' element={<RegisterScreen/>} />
      <Route path='/verify-email' element={<VerifyEmailScreen/>} />
      <Route path='/resend-email-verification' element={<ResendEmailVerificationScreen/>} />
      <Route path='/forgot-password' element={<ForgotPasswordScreen/>} />
      <Route path='/reset-password' element={<ResetPasswordScreen/>} />
    </Routes>
  )
}


export default App