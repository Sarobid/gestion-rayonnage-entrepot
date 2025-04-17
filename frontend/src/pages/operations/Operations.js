import React from "react";
import { useEffect, useState, useRef } from "react";
import Menu from "../../components/menu";
import api from "../../api";
import QRCodeReader from "../../components/QRCodeReader";
import {useNavigate,useLocation} from 'react-router-dom';
import Button,{Dialog,Title} from "../../components/UIComponents";


export default function ScanQR(){
    const navigate                              = useNavigate();
    const [msg, setMsg]                         = useState(null);
    const [error, setError]                     = useState(false);
    const [success,setSuccess]                  = useState(false);
    const [numExists, setNumExists]             = useState(false);
    const [num_emplacement,setNumEmplacement]   = useState(null);
    const location  = useLocation()
    const operation = location.state.operation

    useEffect(()=> {
        onNewScanResult();
        checkIfNumExist();
    },[num_emplacement,msg])

    const checkIfFree = async () => {
        const response = await api.get()
    }

    const checkIfNumExist= async () => {
        if (num_emplacement == null){ 
            setNumExists(false)
        }
        else {
            try{
                const response = await api.get("emplacement/"+num_emplacement);

                if (response.data.success && !error) {
                    setSuccess(true);
                    if (operation == "insertNewEmplacement"){

                        if((response.data.emplacement.barcode_article != " ") || (response.data.emplacement.barcode_article != null)) {
                            setError(true);
                            console.log("Barcode ="+response.data.emplacement.barcode_article),
                            console.log(num_emplacement);
                            setMsg("Cet emplacement n'est pas vide, choisissez un autre");
                        }
                        if(location.state.old == num_emplacement) {
                            setError(true);
                            setMsg("L'ancien emplacement et le nouveau emplacement doivent être différents")
                        }else{
                            const old       = location.state.old
                            const barcode   = location.state.barcode
                            const quantite  = location.state.qte
                            console.log(`Déplacement: old(${old}), article(${barcode}),quantite(${quantite}),new(${num_emplacement})` )
                            moveArticle(old,barcode,quantite,num_emplacement)
                        }                      

                    }else{
                        if(operation == "move"){
                            if (response.data.emplacement.quantite == 0) {
                                setError(true);
                                setMsg("Cet emplacement est vide, aucun article ne peut être déplacé");
                            }else{
                                const volume_libre = response.data.emplacement.volume_libre;
                                const charge_libre = response.data.emplacement.charge_libre;
                                navigate('/operation/scan-article',{state:{num_emplacement: num_emplacement,operation:operation,volume:volume_libre,charge:charge_libre}})  
                            }
                        }else{
                            navigate('/operation/scan-article',{state:{num_emplacement: num_emplacement,operation:operation}})  
                        }
                    }                                   
                                             
                } else{
                    setError(true);
                    setMsg("Cet emplacement n'existe pas ou a été retiré")
                }
                    

                
            }catch(error){
                setError(true);
                setMsg("Une erreur est survenue lors du scan du QR code")
            }
        }
    }

    const moveArticle = async (oldEmplacement,barcodeArticle,quantite,newEmplacement) => {
        try{
            const response = await  api.post(`move-article/${oldEmplacement}/${barcodeArticle}/${quantite}/${newEmplacement}`)
            if(response.data.success) navigate('/operation')
            else{
                setError(true);
                setMsg("Une erreur est survenue lors du déplacement de l'article")
            }
        }catch(error){
            setError(true);
            setMsg("Une erreur est survenue lors du déplacement de l'article")
        }
    }

    const onNewScanResult = (decodedText, decodedResult) => {
        setNumEmplacement(decodedText);
        checkIfNumExist();
        setError(false);
     }

    return(
        <>
        <Menu/>
        <div className="page-right-side d-flex flex-column  align-items-start">
            {
                (operation == "insert") ?   <div className="titre h4" style={{fontWeight:"bolder"}}>
                Enregistrement d'articles
            </div> :
              <div className="titre h4" style={{fontWeight:"bolder"}}>
             Déplacement d'articles
          </div>

            }
               {/*<div>Operation = {operation}</div>*/}
            <div className="h5">{((operation == "insert") || (operation == "insertNewEmplacement")) ? "Scannez l'endroit où placer l'article"  : "Scannez l'emplacement actuel de l'article"}</div>
            {
                (error &&  (msg != null))? <div className="alert alert-danger" role="alert">{msg}</div> :  <div></div>
            }
            <QRCodeReader
                fps={10}
                qrbox={400}
                disableFlip={false}
                qrCodeSuccessCallback={onNewScanResult}/>
        </div>
       </>
    )
}

