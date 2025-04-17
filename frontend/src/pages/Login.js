import React, { useState, useEffect } from "react";
import Button from "../components/UIComponents";
import logo from '../img/mini-logo.png';
import api from '../api'
import DOMPurify from 'dompurify'
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Login(){
        const [username,setUsername] = useState("")
        const [pwd,setPwd] = useState("")
        const [showPwd,setShowPwd] = useState(false)
        const [error,setError] = useState(false)
        const [msg,setMsg] = useState("")
        const navigate = useNavigate()
        const {loginError,loginUser} = useAuth()
        const browser = navigator.userAgent

        useEffect(()=>{
    
            if(loginError){
                setError(true);
                setMsg("Impossible de se connecter,votre nom d'utilisateur ou votre mot de passe est incorrecte")
            
            }
        },[loginError])

        const login = async (e) => {
            
                e.preventDefault()
                loginUser(DOMPurify.sanitize(username),DOMPurify.sanitize(pwd))

        }

        const onShowPwd = () =>{
            const pwdInput =  document.querySelector(".pwd")
            setShowPwd(!showPwd)

            if(showPwd == false){
                pwdInput.type = "text"
            }else{
                 pwdInput.type = "password"
            }
        }
    return(
        <div className="d-flex flex-row align-items-center justify-content-center" style={{width:"100%",height:"90vh"}}>
            <div className="card1 p-5 aling-self-center" style={{width:"24%"}}>
                <div className="d-flex flex-row align-items-center justify-content-center mb-4">
                    <img src={logo} className="img-fluid" alt="Logo oceantrade" style={{width:"50px"}}/>
                    <div style={{fontSize:"24pt",
                        fontFamily:"Helvetica",
                        fontWeight:"bold",
                        letterSpacing:"-2pt",
                        color:"rgb(0, 138, 208)",
                        paddingTop: "9px"
                    }}>Rayonnage</div>
                </div>
                <form method="POST" onSubmit={login}>
                    <div className="mb-3 loginComponent">
                        <div className="d'flex flex-row align-items-center" style={{fontWeight:"bold"}}>
                        <i className="bi bi-person login-icon"></i>
                        <label className="form-label">Nom d'utilisateur</label>
                        </div>
                        <input type="text" className="form-control loginInput" onChange={(e)=> setUsername(e.target.value)} required/>
                    </div>
                    <div className="mb-3 loginComponent">
                        <div className="d'flex flex-row align-items-center" style={{fontWeight:"bold"}}>
                        <i className="bi bi-key login-icon"></i>
                        <label className="form-label">Mot de passe</label>
                        </div>
                        <input type="password" className="form-control loginInput pwd" onChange={(e)=> setPwd(e.target.value)} style={{paddingRight:"40px"}} required/>
                        {(browser.includes("Edg")) ? "" :  <i className={(showPwd)? "bi bi-eye-slash eye" : "bi bi-eye eye"} style={{visibility: (pwd != "" ? "visible" : "hidden")}} onClick={onShowPwd}></i>}
                    </div>
                    {
                    (error) ? <div className="error">{msg}</div> : ""
                     }   
                    <button type="submit" className="button button-primary me-4 mt-3" style={{width:"92%",height:"28px"}}>Se connecter</button>
                </form>
                
            </div>
        </div>
    )
}

export const login = async  (username,pwd) =>{
    try{
        const response = await api.post('login',{username:username,password:pwd})
        if(response.data.success) return response.data;
        else{
            return ""
        }
    }
    catch(err){
        console.log(err)
        return ""
    }
    

    
}