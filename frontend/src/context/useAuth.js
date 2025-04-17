import React,{useContext,createContext,useState, useEffect} from "react";
import { login } from "../pages/Login";
import { useNavigate } from "react-router-dom";
 
const AuthContext =  createContext()

export default function AuthProvider({children}){
    const [isAuthenticated, setAuthenticated] = useState(false)
    const [loading,setLoading] = useState(false)
    const [displayName,setDisplayName] = useState("")
    const [userDisplayName,setUserDisplayName] = useState("")
    const [loginError,setLoginError] = useState(false)

    const navigate = useNavigate();

    const authentification = async () => {

    }
    const loginUser = async (username, pwd) => {
        const success = await login(username,pwd)

        if(success.success){
            setAuthenticated(true);
            setUserDisplayName(success.user)
            navigate('/')
        }
        if(success == "") {
            setLoginError(true)
        }
    }


    useEffect(()=>{
        authentification()
    },[window.location.pathname])

    return(
        <AuthContext.Provider value={{isAuthenticated,loginUser,userDisplayName,loginError}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);