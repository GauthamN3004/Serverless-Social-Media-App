import "./LoginReg.css";
import ssma_image from "../../bg_image.jpg";

function LoginReg({ children }) {
    return <>
        <div className="container-fluid">
            <div className="row">
                <div className="col-lg-5">
                    {children}
                    {/* <p>hello</p> */}
                </div>
                <div className="col-lg-7">
                    <div className="image-div">
                        <center><img src={ssma_image}></img></center>
                    </div>
                </div>
            </div>
        </div>
    </>
}

export default LoginReg;