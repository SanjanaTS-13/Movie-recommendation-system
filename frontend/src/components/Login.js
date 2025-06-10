import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { axiosInstance } from "../App.js";

function Login() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!formData.username.trim() || !formData.password.trim()) {
            setMessage("Please fill out all fields.");
            return;
        }
    
        try {
            const response = await axiosInstance.post("/login/", formData);
            if (response.status === 200) {
                // Save the access token in localStorage or sessionStorage
                localStorage.setItem("accessToken", response.data.access);
    
                // Navigate to the welcome page
                navigate("/welcome");
            }
        } catch (error) {
            if (error.response && error.response.data) {
                setMessage(error.response.data.error || "Invalid credentials");
            } else {
                setMessage("An error occurred. Please try again.");
            }
        }
    };
    
    return (
        <div className="login-main-div">
            <h2>Login</h2>
            <form className="login-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Username:</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Enter your username"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                    />
                </div>
                <button className="login-button" type="submit">
                    Login
                </button>
            </form>
            {message && <p className="message">{message}</p>}
        </div>
    );
}

export default Login;
