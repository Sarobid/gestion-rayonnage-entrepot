import React,{useState} from "react";
import {Link, NavLink, useNavigate} from "react-router-dom";
import logo from '../img/mini-logo.png';
import Button from "./UIComponents";
import Swal from 'sweetalert2';
import api from "../api";
import { useAuth } from "../context/useAuth";

export default function Menu(){
    const navigate = useNavigate()
    const {userDisplayName} = useAuth()

    const onCollapse = () =>{
        const chevron = document.querySelector(".bi-chevron-down")
        chevron.style.transform = 'rotate(180deg)'
    }

    const logout = async () =>{
        try{
            const response = await api.post('logout')
            if(response.data.success) navigate('/login')
            else{
                Swal.fire({
                    text:"Impossible de se déconnecter, veuillez réessayer plus tard",
                    showConfirmButton: false,
                    icon: "error",
                    timer:1700
                })
            }
        }catch(error){
            console.log(error)
        }
    }
    return(
        <div className="d-flex flex-column menu">
            
            <div className="d-flex flex-row align-items-center justify-content-center">
                <img src={logo} className="img-fluid" alt="Logo oceantrade" style={{width:"50px"}}/>
                <div style={{fontSize:"24pt",
                    fontFamily:"Helvetica",
                    fontWeight:"bold",
                    letterSpacing:"-2pt",
                    color:"rgb(0, 138, 208)",
                    paddingTop: "9px"
                }}>Rayonnage</div>
            </div>
            <div className="menu-content">
            <NavLink to="/" className={({isActive})=> (isActive) ? "menu-link active" : "menu-link"}><i className="bi bi-house menu-icon"></i> Accueil</NavLink>
            <div className="menu-link d-flex flex-row align-items-center justify-content-between" type="button" data-bs-toggle="collapse" data-bs-target="#subMenu2" aria-expanded="false" aria-controls="subMenu">
                <div><i className="bi bi-basket menu-icon"></i> Inventaire </div>
                <div><i className="bi bi-chevron-down" style={{ fontWeight: "600", fontSize: "12pt" }}></i></div>
            </div>
            <ul className="collapse multi-collapse" id="subMenu2" style={{listStyleType:"none"}} onClick={onCollapse}>
                <li><NavLink to="/article" className={({isActive})=> (isActive) ? "menu-link active" : "menu-link"}>Article</NavLink></li>
                <li><NavLink to='/scann' className={({isActive})=> (isActive) ? "menu-link active" : "menu-link"}>Scannage</NavLink></li>
            </ul>
            
            <div className="menu-link d-flex flex-row align-items-center justify-content-between" type="button" data-bs-toggle="collapse" data-bs-target="#subMenu" aria-expanded="false" aria-controls="subMenu">
                <div><i className="bi bi-layout-wtf menu-icon"></i>Rayonnage </div>
                <div><i className="bi bi-chevron-down" style={{ fontWeight: "600", fontSize: "12pt" }}></i></div>
            </div>
            <ul className="collapse multi-collapse" id="subMenu" style={{listStyleType:"none"}} onClick={onCollapse}>
                <li><NavLink to ="/depot" className={({isActive})=> (isActive) ? "menu-link active" : "menu-link"}> Dépot</NavLink> </li>
                <li><NavLink to="/couloir" className={({isActive})=> (isActive) ? "menu-link active" : "menu-link"}>Couloirs</NavLink></li>
                <li><NavLink to="/rack" className={({isActive})=> (isActive) ? "menu-link active" : "menu-link"}>Racks</NavLink></li>
                <li><NavLink to="/emplacement" className={({isActive})=> (isActive) ? "menu-link active" : "menu-link"}>Emplacements</NavLink></li>
            </ul>
            <div className="menu-link d-flex flex-row align-items-center justify-content-between" type="button" data-bs-toggle="collapse" data-bs-target="#subMenuMov" aria-expanded="false" aria-controls="subMenuMov">
                <div><i className="bi bi-arrow-left-right menu-icon"/>Mouvements stock </div>
                <div><i className="bi bi-chevron-down" style={{ fontWeight: "600", fontSize: "12pt" }}></i></div>
            </div>
            <ul className="collapse multi-collapse" id="subMenuMov" style={{listStyleType:"none"}} onClick={onCollapse}>
                {/*<li><NavLink to ="/operation" className={({isActive})=> (isActive) ? "menu-link active" : "menu-link"}> Opérations</NavLink> </li>*/}

                <li><NavLink to="/operation/scan-emplacement" state={{operation:"insert"}} className={({isActive})=> (isActive) ? "menu-link active" : "menu-link"}>Entrée</NavLink></li>
                <li><NavLink to="/operation/scan-emplacement" state={{operation:"move"}} className={({isActive})=> (isActive) ? "menu-link active" : "menu-link"}>Déplacement</NavLink></li>          
                <li><NavLink to="/operation/sortie" className={({isActive})=> (isActive) ? "menu-link active" : "menu-link"}>Sortie</NavLink></li>          
            
            </ul>
            <NavLink to="/suggestions" className={({isActive})=> (isActive) ? "menu-link active" : "menu-link"}>
            <i className="bi bi-lightbulb menu-icon"></i>
                Suggestions
            </NavLink>
            </div>
            <div
                className="d-flex flex-column loginInfo">
                <div style={{width:"100%"}} className="d-flex flex-row mb-4 align-items-center justify-content-evenly">
                    <div style={{width:"90%",fontSize:"11pt",fontWeight:"bold",color:"#6e6e6e"}}>{userDisplayName}</div><div><i className="bi bi-circle-fill" style={{fontSize:"8pt",color:"#50a64a"}}></i></div>
                </div>
                <Button value="Se déconnecter" type="secondary" icon="box-arrow-left" onclick={logout}/>    
            </div>          
      </div>
    )

}