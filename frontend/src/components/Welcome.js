import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../App.js";
import "./Welcome.css";

function Welcome() {
    const navigate = useNavigate();
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [genres, setGenres] = useState([
        "Action",
        "Adventure",
        "Animation",
        "Biography",
        "Comedy",
        "Crime",
        "Documentary",
        "Drama",
        "Fantasy",
        "Family",
        "Film-Noir",
        "Horror",
        "Music",
        "Mystery",
        "Romance",
        "Short",
        "Sci-Fi",
        "Sport",
        "Thriller",
        "War",
        "Western",
    ]);

    const handleCheckboxChange = (genre) => {
        if (selectedGenres.includes(genre)) {
            setSelectedGenres(selectedGenres.filter((item) => item !== genre));
        } else {
            setSelectedGenres([...selectedGenres, genre]);
        }
    };

    const handleRecommendation = async () => {
        try {
            const response = await axiosInstance.post("/filter-movies-by-genres/", {
                genres: selectedGenres,
            });
            navigate("/recommendations", { state: { movies: response.data.movies } });
        } catch (error) {
            alert("Failed to fetch movie recommendations. Please try again.");
        }
    };

    return (
        <div className="welcome-main-div">
            <h2>Hello, you have logged in successfully!</h2>

            <div className="genres-selection">
                <h3>Select Your Preferred Genres:</h3>
                <div className="genres-list">
                    {genres.map((genre) => (
                        <label key={genre} className="genre-label">
                            <input
                                type="checkbox"
                                value={genre}
                                checked={selectedGenres.includes(genre)}
                                onChange={() => handleCheckboxChange(genre)}
                            />
                            {genre}
                        </label>
                    ))}
                </div>
            </div>

            <button
                className="recommend-button"
                onClick={handleRecommendation}
                disabled={selectedGenres.length === 0} // Disable button if no genres selected
            >
                Recommend Me a Movie
            </button>
        </div>
    );
}

export default Welcome;

