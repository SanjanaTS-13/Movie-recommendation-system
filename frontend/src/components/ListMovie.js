import { useEffect, useState } from "react";
import {axiosInstance} from "../App.js";
import "./ListMovies.css"
// const {axiosInstance}=require('./src/App.js');

function ListMovie(){
    const [movies,setMovies]=useState([]);
    const[selectedMovie,setSelectedMovie]=useState([]);
    const[selectedMovieComment,setSelectedMovieComment] = useState()
    const [description,showDescription]=useState(false);
    const [comments, setComments] = useState([]);
    const [showComments, setShowComments] = useState(false);
    const [commentData, setCommentData] = useState({
        name: '',
        email: '',
        text: ''
    });
    const [showAddComments,setShowAddComments] = useState(false);
    const [selectedMovieAddComment,setSelectedMovieAddComment] = useState()
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isNoComment,setIsNoComment] = useState(false)

    async function fetchMovies(){
        try{
            const response= await axiosInstance.get('/getMovies/');
            setMovies(response.data);
        }
        catch (error){
            console.error("Error fetching Movies List",error);
        }
    }
   
    useEffect(()=>{
        fetchMovies();
    },[])

    async function handleDescriptionClick(title){
        try{
            const response=await axiosInstance.get(`/getDescription/${title}/`);
            if (response.status===200){
                setSelectedMovie(response.data);
                setSelectedMovieComment();
                setShowComments(false);
                setShowAddComments(false)
                showDescription(true);
                
            }
        }
        catch(error){
            console.error("Error fetching movie description",error);
        }
    }

    async function handleViewComments(title) {
        try {
            const response = await axiosInstance.get(`/getComments/${title}/`);
            if (response.status === 200) {
                console.log("response",response);
                console.log("response message",response.data.Message);

                if (response.data.Message ){
                    setIsNoComment(true);
                }
                if (response.data.length === 0){
                    setComments(Array.isArray(response.data.message) ? response.data.message : [response.data.message])
                }
                else{
                setSelectedMovieComment(title);
                setComments(Array.isArray(response.data) ? response.data : [response.data]);
                setShowComments(true);
                showDescription(false); 
                setShowAddComments(false);
            }
            console.log("showComments",showComments);
              
            }
        } catch (error) {
            console.error("Error fetching comments", error);
        }
    }

    async function handleAddComments(title){
        try {
            if (!commentData.name.trim() || !commentData.email.trim() || !commentData.text.trim()) {
                alert("Please fill out all fields.");
                return ;
            }
            const response = await axiosInstance.post(`/addComments/${title}/`, {
                name: commentData.name,
                email: commentData.email,
                text: commentData.text
            });

            if (response.status===200) {
                console.log("response",response);
                console.log("response message",response.data.message);

                // if (response.data.message ){
                //     setIsNoComment(true);
                // }
                setCommentData(response.data);
                
                setIsSubmitted(true);
            }

        }
        catch(error){
            console.error("Could Not Add Comment! Please Try Again Later.",error);
        }
    }

    function handleShowAddCommentsForm(title) {
        setSelectedMovieAddComment(title);
        setSelectedMovieComment();
        setShowComments(false);
        setShowAddComments(true);
        showDescription(false);
        setIsSubmitted(false);

    }

    function handleCloseDescription(){
        showDescription(false);
    }
    function handleCloseComments() {
        setShowComments(false);
        setIsNoComment(false);
    }
    function handleCloseAddComments(){
        setShowAddComments(false);
        setIsSubmitted(false);
    }

    return (
        <div className="main-div">
            {!description && !showComments && !showAddComments && (
                <div className="table-container">
                    <h2>MOVIES</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movies.map((movie, index) => (
                                <tr key={index}>
                                    <td>{movie}</td>
                                    <td>
                                        <button onClick={() => handleDescriptionClick(movie)}>Description</button>
                                        <button onClick={() => handleViewComments(movie)}>View Comments</button>
                                        <button onClick={() => handleShowAddCommentsForm(movie)}>Add Comments</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {description && selectedMovie && (
                <div className="dialog-main-div">
                <div className="dialog-box">
                    <h2>{selectedMovie.title}</h2>
                    <p>Director: {selectedMovie.director}</p>
                    <p>Cast: {selectedMovie.cast}</p>
                    <p>Genres: {selectedMovie.genres}</p>
                    <p>Plot: {selectedMovie.plot}</p>
                    <button onClick={()=>handleCloseDescription()}>Close</button>
                </div>
                </div>
            )}
            {comments && selectedMovieComment && showComments &&
                 <div> 
                     <div>
                         <h2>{selectedMovieComment} </h2>
                         {isNoComment && 
                        //  <div className="dialog-main-div">
                         <div className="dialog-box"> 
                             No Comments exists for this movie
                             <div>
                                 <button onClick={()=>handleCloseComments()}>Close</button>
                             </div>
                         </div> 
                        //  </div>
                      
                             }
                         {!isNoComment && 
                        //  <div className="dialog-main-div">
                         <div className="dialog-box">

                             <ul>
                             {comments.map((comment,index)=>(
                                 <div>
                                     <ul key ={index}>
                                         <b>Comment {index+1}</b>
                                         <p>Name:{comment.name}</p>
                                         <p>Email:{comment.email}</p>
                                         <p>Comment:{comment.text}</p>
                                     </ul>
                                  
                                 </div>
                             ))}
                             <div>
                                 <button onClick={()=>handleCloseComments()}>Close</button>
                             </div>
                             </ul>
                         {/* </div> */}
                         </div>}
                     </div>
                     </div>
             }
            {showAddComments && selectedMovieAddComment && (
                <div className="dialog-main-div">
                <div className="dialog-box">
                    <h2>Add a Comment for {selectedMovieAddComment}</h2>
                    <div>
                        Name:
                        <input type="text" value={commentData.name} onChange={(e) => setCommentData({ ...commentData, name: e.target.value })} placeholder="Name" required/>
                    </div>
                    <div>
                        Email:
                        <input type="email" value={commentData.email} onChange={(e) => setCommentData({ ...commentData, email: e.target.value })} placeholder="Email" required/>
                    </div>
                    <div>
                        Comment:
                        <textarea value={commentData.text} onChange={(e) => setCommentData({ ...commentData, text: e.target.value })} placeholder="Comment" required/>
                    </div>
                    <button onClick={() => handleAddComments(selectedMovieAddComment)}>Submit Comment</button>
                    {isSubmitted && <div>{commentData}</div>}
                    <button onClick={() => handleCloseAddComments()}>Cancel</button>
                </div>
                </div>
            )}
        </div>
    );
};
export default ListMovie;