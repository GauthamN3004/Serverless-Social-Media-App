import "../LoginReg.css";
import { Link } from 'react-router-dom';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import axios from "axios";

function LoginForm() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        setLoading(true);
        e.preventDefault();
        const data = {
            username: username,
            password: password
        };

        try{
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, data, {
                validateStatus: function (status) {
                    return status >= 200 && status < 500;
                },
            });
            
            if(response.status == 200){
                const token = response.data.message;
                localStorage.setItem('ssma-auth', JSON.stringify({'token': token}));
                navigate("/feed");
            }
            else{
                console.log("error");
                toast.error(response.data.message);
            }

            setLoading(false);
        } catch(error){
            toast.error(error.message);
            setLoading(false);
        }
    }

    return (
        <div className="myform">
            <form>
                <center><h4>LOGIN</h4></center>
                <br></br>
                <div className="form-group">
                    <input type="text" className="form-control" value = {username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
                </div>
                <br></br>
                <div className="form-group">
                    <input type="password" minLength={8} value = {password} onChange={(e) => setPassword(e.target.value)} className="form-control" placeholder="Password" />
                </div>
                <br></br>
                <center>{(loading) ? 
                    <button class="btn btn-info" type="button" disabled>
                        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> &nbsp;&nbsp;
                        <span class="sr-only">LOGIN</span>
                    </button>
                    :
                    <button type="submit" className="btn btn-info" onClick={(e) => handleLogin(e)}>LOGIN</button>
                }
                </center>
            </form>
            <br></br>
            <br></br>
            <center><p>Don't have an account ? <Link to="/signup">Sign Up</Link></p></center>
        </div>
    );
}

export default LoginForm;