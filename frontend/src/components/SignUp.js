import React, { useState } from "react";
import "./SignUp.css";
import { axiosInstance } from "../App.js";

function SignUp() {
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        password: "",
    });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [message, setMessage] = useState("");


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };


    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.username.trim() || !formData.password.trim()) {
            setMessage("Please fill out all fields.");
            return;
        }

        try {
            const response = await axiosInstance.post("/signup/", formData);
            if (response.status === 201) {
                setIsSubmitted(true);
                setMessage("Sign up successful!");
                setFormData({
                    name: "",
                    username: "",
                    password: "",
                });
            }
        } catch (error) {
            if (error.response) {
                setMessage(error.response.data.error);
            } else {
                setMessage("An error occurred. Please try again.");
            }
        }
    };

    return (
        <div className="signup-main-div">
            <h2>Sign Up</h2>
            <form className="signup-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        required
                    />
                </div>
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
                <button className="signup-button" type="submit">Sign Up</button>
            </form>
            {message && <p className="message">{message}</p>}
            {isSubmitted && (
                <div className="confirmation">
                    <p>Thank you for signing up!</p>
                </div>
            )}
        </div>
    );
}

export default SignUp;



