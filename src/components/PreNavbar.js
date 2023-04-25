import React from 'react'
import './css/PreNavbar.css'
import Logo from './../images/Logo.png'
import { Link } from 'react-router-dom'

function PreNavbar() {
  return (
    <div className='PreNavbar'>
        <img src={Logo} alt='Logo' />
        <div className='Others'>
            <Link to="/login"><p>Login</p></Link>
            <Link to="/signup"><p>Sign Up</p></Link>
        </div>
    </div>
  )
}

export default PreNavbar