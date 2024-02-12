import "../LoginReg.css";
import { Link } from 'react-router-dom';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import axios from "axios";

function SignUpForm() {
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        const data = {
            email: email,
            full_name: fullName,
            username: username,
            password: password
        };
        try{
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/signup`, data, {
                validateStatus: function (status) {
                    return status >= 200 && status < 500;
                },
            });
            
            if(response.status == 201){
                toast.success(response.data.message);
                setTimeout(() => {
                    navigate("/");
                }, 10);
            }
            else{
                console.log("error");
                toast.error(response.data.message);
            }
        } catch(error){
            toast.error(error.message);
        }
        
    };

    return (
        <div className="myform">
            <form>
                <center><h4>SIGN UP</h4></center>
                <br></br>
                <div className="form-group">
                    <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                </div>
                <br></br>

                <div className="form-group">
                    <input type="text" className="form-control" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" />
                </div>
                <br></br>

                <div className="form-group">
                    <input type="text" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
                </div>
                <br></br>

                <div className="form-group">
                    <input type="password" minLength={8} className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
                </div>
                <br></br>

                <center><button type="submit" className="btn btn-info" onClick={(e) => handleSignUp(e)}>SIGN UP</button></center>
            </form>
            <br></br>
            <br></br>
            <center><p>Have an account ? <Link to="/">Sign In</Link></p></center>
        </div>
    );
}

export default SignUpForm;