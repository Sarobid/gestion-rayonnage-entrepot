import React from "react"
import Button from "../../components/UIComponents"
import {useNavigate} from 'react-router-dom'
import Menu from "../../components/menu";

export default function OperationAccueil(){
    const navigate = useNavigate();
    const onEnregistrer = () => {
        navigate('/operation/scan-emplacement',{state:{operation:"insert"}})
    };
    const onDeplacer = () => {
        navigate('/operation/scan-emplacement',{state:{operation:"move"}})
    }

    return(
        <>
        <Menu/>
        <div className="page-right-side d-flex flex-column justify-content-center align-items-center">
            <div className="h1">Que voulez-vous faire ?</div>
            <div className="d-flex flex-column justify-content-between align-items-center">
               <Button
                    type="primary"
                    value="Enregistrer un article dans un emplacement"
                    onclick={onEnregistrer}
               />
               <div>ou</div>
               <Button
                    type="primary"
                    value="Déplacer un article"
                    onclick= {onDeplacer}
                />
            </div>
        </div>
        </>
    )
}