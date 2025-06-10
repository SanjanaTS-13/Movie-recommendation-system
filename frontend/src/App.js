import React from 'react';
import ListMovie from './components/ListMovie';
import SignUp from './components/SignUp';
import Login from './components/Login';
import Welcome from './components/Welcome';
import Recommendations from './components/Recommendations';
import axios from 'axios';
import MoviesHome  from './components/MoviesHome';
import {BrowserRouter as Router, Routes, Route } from 'react-router-dom';

export const axiosInstance= axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
    timeout:process.env.TIMEOUT
});

function App(){
    return (
        <Router>
        <Routes>
            <Route path="/" element={<MoviesHome />} />
            <Route path="/signup"element={<SignUp />}/>
            <Route path="/listMovies"element={<ListMovie />}/>
            <Route path="/login" element={<Login />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/recommendations" element={<Recommendations />} />
        </Routes>
        </Router>
    );
}

export default App;