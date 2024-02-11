import "../LoginReg.css";
import { Link } from 'react-router-dom';
import { useState } from "react";

function LoginForm() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        console.log(username);
        console.log(password);
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
                <center><button type="submit" className="btn btn-info" onClick={(e) => handleLogin(e)}>LOGIN</button></center>
            </form>
            <br></br>
            <br></br>
            <center><p>Don't have an account ? <Link to="/signup">Sign Up</Link></p></center>
        </div>
    );
}

export default LoginForm;