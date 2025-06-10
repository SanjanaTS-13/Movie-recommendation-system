import { Link } from 'react-router-dom';
import React from 'react';
import './MoviesHome.css'

function MoviesHome(){
    return (

        <div className='home-div'> 
            <h1> MOVIES FLIX </h1> 
            <Link to="/listMovies" > Go to Movies List and Comments </Link> 
            <Link to="/signup" > Sign Up </Link> 
            <Link to="/login" > Login </Link> 

        </div>

    );
}

export default MoviesHome;


