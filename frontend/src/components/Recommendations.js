import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Recommendations.css";

function Recommendations() {
    const location = useLocation();
    const navigate = useNavigate();
    const movies = location.state?.movies || [];

    return (
        <div className="recommendations-main-div">
            <h2>Recommended Movies</h2>
            {movies.length > 0 ? (
                <ul className="movie-list">
                    {movies.map((movie, index) => (
                        <li key={index} className="movie-item">
                            {movie}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No movies found for the selected genres.</p>
            )}
            <button className="back-button" onClick={() => navigate("/")}>
                Back to Genre Selection
            </button>
        </div>
    );
}

export default Recommendations;