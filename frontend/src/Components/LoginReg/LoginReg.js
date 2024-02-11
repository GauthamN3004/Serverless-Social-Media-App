import "./LoginReg.css";
import ssma_image from "../../bg_image.jpg";

function LoginReg({ children }) {
    return <>
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-5">
                    {children}
                    {/* <p>hello</p> */}
                </div>
                <div className="col-md-7">
                    <div className="image-div">
                        <img src={ssma_image}></img>
                    </div>
                </div>
            </div>
        </div>
    </>
}

export default LoginReg;