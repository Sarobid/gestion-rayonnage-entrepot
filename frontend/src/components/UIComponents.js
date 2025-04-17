import React,{useEffect, useRef, useState} from "react";
//import Tooltip from "@mui/material/Tooltip";
import '../styles/UIComponents.css';

export default function Button({type="primary",value="Button",onclick,icon="",disable}){
        
    return(
        <>
         {
            ({icon} != "") ? <button className={disable ? `button button-${type} button-disabled` : `button button-${type}`} onClick={onclick} disabled={disable}><i className={`bi bi-${icon}`} style={{margin:"6px"}}></i>{value}</button> : <button className={`button button-${type}`} onClick={onclick}>{value}</button>
        }
        </>
       
        
    )
}
function Dialog({delay=0,onConfirmClick,content,open=false,type="confirmation",title="Confirmer",confirmationValue="OK", cancelationValue="Annuler"}){
    const dialogRef = useRef(null);
    useEffect(()=>{
        checkIfOpen();
    },[open])

    const checkIfOpen = () => {
        if (open) {
            dialogRef.current.showModal();
            if (delay != 0){
                setTimeout(()=>{
                    dialogRef.current.close()
                },delay)
            }         
                       
        }
        else dialogRef.current.close()
    }

    const onClose = () => {
        dialogRef.current.close()
    }
    return(
        <dialog className="dialog" ref={dialogRef}>
           <div className="d-flex flex-column">
                <div className="dialogHeader d-flex flex-row">
                    <div className="title col-11">
                        {title}
                    </div>
                    <div className="closeDialog col-1">
                        <i className="bi bi-x-circle-fill closeSign" onClick={onClose}></i>
                    </div>
                </div>
                <div className="dialogBody">
                    {content}
                </div>
                
                <div className="dialogFooter d-flex flex-row">
                {
                    (type == "info") ? <p></p>:  <><Button
                    value={cancelationValue} 
                    type="dialog-secondary"
                    onclick={onClose}/>
                <Button 
                    value={confirmationValue}
                    type="dialog-primary"/></>
                }
                    
                   
                </div>
           </div>
        </dialog>
    )
}

function Recherche({onchange}){
    return(
        <div className="d-flex flex-row justify-content-center align-items-center p-0">
            <input className="form-control" placeholder="Recherche" onChange={onchange}></input><i className="bi bi-search search-icon"></i>
        </div>
    )
}

function Title({value="Title",onRechercheChange}){
    return(
        <div className="d-flex flex-row justify-content-between align-items-center mb-4" style={{width:"100%"}}>
            <div className="titre h4" style={{fontWeight:"bolder"}}>
                {value}
            </div>
            <Recherche onchange={onRechercheChange}/>
        </div>
    )
}

function OptionsButton({options=[{value:"Value1",onclick:console.log("hello")}]}){
    return(
        <>
        <div className="optionsButton dropend" >
            <div 
                type="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false" 
            >
                <i className="bi bi-three-dots-vertical" style={{color: '#636363'}}></i>
            </div>
                <ul className="dropdown-menu">
                    {
                        options.map((option,index) => {
                            return <li key={index} className="dropdown-item" onClick={option.onclick} style={{cursor:'pointer'}}>{option.value} </li>
                        })                        
                    }
                </ul>
            </div> 

        </>
    )
}

import noDataImage from '../img/nodata.png'

function NoResult({size="normal"}){
    return(
        <>
            <div className="d-flex flex-column align-items-center justify-content-center">
                {
                    (size == "normal") ? <img src={noDataImage} className="img-fluid" style={{height:"300px",width:"300px"}} alt="Aucun resultat"/> :
                    <img src={noDataImage} className="img-fluid" style={{height:"500px",width:"500px"}} alt="Aucun resultat"/>
                }
           
            <p>Aucun résultat</p>
            </div>
        </>
    )
}

function DeleteButton({onclick}){
    return(
        <>  
        
            <button style={{backgroundColor:"transparent",border:"none"}} onClick={onclick}><i className="bi bi-trash3 deleteButton"></i></button>
    
        </>
    )
}

function EditButton({onclick}){
   
    return(
        <>
        
            <button style={{backgroundColor:"transparent",border:"none"}} onClick={onclick}><i className="bi bi-pencil-square updateButton" ></i></button>
          
        </>
    )
}

function ProgressBar({data}){
    const progress = () => {
        let color = "rgb(159, 159, 159)";
        
        if (data >= 85) {
            color = "#ff5656";
        } else if (data >= 70) {
            color = "orange";
        } else if (data >= 50) {
            color = "#f0cb00";
        }

        return (
            <div style={{ width: `${data}%`, backgroundColor: color, height: "20px" }}></div>
        );
    };

    return(
        <>
            <div className="d-flex flex-row align-items-center justify-content-start" style={{width:"100%"}}>
                <div className="progressBar">
                    {progress()}                    
                </div>
                <div style={{fontSize:"11pt"}}>{data} %</div>
            </div>
        </>
    )
}
export {Dialog,Recherche,Title,OptionsButton, NoResult, EditButton,DeleteButton,ProgressBar}
