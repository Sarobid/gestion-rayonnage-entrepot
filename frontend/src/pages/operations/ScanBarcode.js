import React from "react";
import { useEffect, useState, useRef } from "react";
import Menu from "../../components/menu";
import api from "../../api";
import QRCodeReader from "../../components/QRCodeReader";
import {useNavigate,useLocation} from 'react-router-dom';
import Button,{Dialog,Title} from "../../components/UIComponents";
import Swal from "sweetalert2";

function ScanBarcode(){
    const navigate                      = useNavigate();
    const location                      = useLocation()
    const inputRef                      = useRef(null);
    const [msg, setMsg]                 = useState(null);
    const [error, setError]             = useState(false);
    const [success,setSuccess]          = useState(false);
    const [barcode,setBarcode]          = useState("");
    const [timeoutId, setTimeoutId]     = useState(null);
    const [articleCounter,setCounter]   = useState(0);
    const [identifiant,setIdentifiant]  = useState("");
    const [quantiteStock,setQuantiteStock] = useState(0);
    const [listeCodebarre,setListCodebarre] = useState([]);
    
    const num_emplacement               = location.state.num_emplacement
    const operation                     = location.state.operation
    const [informations,SetInformations]= useState([]);
    const [poids_libre, setPoidsLibre]  = useState(location.state.charge)
    const [volume_libre,setVolumeLibre] = useState(location.state.volume)
    const [chargeLibre,setChargeLibre]  = useState(0);
    const [capaciteLibre,setCapaciteLibre] = useState(0);
   
    useEffect(()=>{
        fetchInformations()
    },[])
    const fetchInformations = async () => {
        try{

            const response = await api.get(`full-informations/${num_emplacement}`)
            if(response.data.success == true){
                SetInformations(response.data.informations);
                setChargeLibre(response.data.informations.charge);
                setCapaciteLibre(response.data.informations.capacite);
                
            } 
            else console.log("Erreur, aucun résultat trouvé")
        }catch(error){
            console.log(error)
        }

        
    }

    const onInput = (e) => {
        const value = e.target.value;
        setBarcode(value);
        setIdentifiant(value);

        if (timeoutId) {
        clearTimeout(timeoutId);
        }

        const id = setTimeout(() => {
        finishInput(value); 
        }, 300); 

        setTimeoutId(id);
    };

    const incrementCounter = ()=>{
        if(operation == "move"){
            if((quantiteStock != null) &&  (quantiteStock > 0)) setCounter(articleCounter + 1);
            else{
                setError(true);
                
                setTimeoutId(()=>{
                    setMsg("Il n'y a plus d'article à déplacer")
                },1000);
                setMsg("");
                inputRef.current.blur();
            }
        }else{
            setCounter(articleCounter + 1);
            setMsg("");
            setError(false);
            console.log(articleCounter);
        }
        
    }

    const handleListCodeBarre = (value) => {
        setListCodebarre((prevList) => [...prevList, value]);
    };

    const checkOverCapacity = async (value) =>{
        try{
            if(value != null){
                const response = await api.get(`sku-info/${value}`)
                if(response.data.success == true){
                    var diffCapacite = capaciteLibre - response.data.article.volume
                    var diffCharge = chargeLibre - response.data.article.poids

                    if((diffCapacite < 0)){
                        setError(true);
                        finishInput()
                        setMsg('Les articles dépassent la capacité autorisée!');
                        setBarcode("");
                    }else if((diffCharge < 0)){
                        setError(true);
                        finishInput()
                        setMsg('La case est en surpoids!');
                        setBarcode("");
                    }
                    else{
                        setCapaciteLibre(parseFloat(capaciteLibre - response.data.article.volume).toFixed(2))
                        setChargeLibre(parseFloat((chargeLibre - response.data.article.poids).toFixed(2)))
                        handleListCodeBarre(value);
                        incrementCounter();
                        setBarcode("");
                    }
                }
            }
        }catch(error){
            console.log(error)
            setError(true);
                    setMsg("Ce code-barre n'est pas encore relié à un article!");
                    setBarcode("")
        }
    }

   

    const finishInput = (value) => {
        console.log(value)
        if(listeCodebarre.includes(value)) {
            setError(true);
            setMsg("Cet article a déja été scanné!");
            setBarcode("");

        }else{

            checkOverCapacity(value)        
        }
    }

    const onCancel = ()=>{
        setCounter(articleCounter - 1);
        if(articleCounter == 0) setCounter(0);
        inputRef.current.focus();
        console.log(articleCounter);
    }

    const resetValues = () => {
        setBarcode(null);
        setCounter(0);
        setIdentifiant(null);
    }

    const onFinished = async () => {
        try{
            console.log(listeCodebarre);
            if (articleCounter > 0) {
               
                if(operation == "move") {
                    const code           = identifiant;
                    const quantite       = articleCounter;
                    const oldEmplacement = num_emplacement;

                    resetValues();
                    navigate('/operation/scan-emplacement', {state:{operation:"insertNewEmplacement",barcode:code,qte:quantite,old:oldEmplacement}})
                
                }else{
                    console.log(num_emplacement)
                    const response = await api.post(`bulk-update-sku/${num_emplacement}`,{liste_codebarre:listeCodebarre});
                
                    if(response.data.success){
                        try{
                            const emplacementResponse = await api.post(`update-emplacement-properties/${num_emplacement}`);
                            if(emplacementResponse.data.success == true){
                                setSuccess(true);
                                Swal.fire({
                                    text:"Enregistrements effectués avec succès",
                                    showConfirmButton: false,
                                    timer:1500
                                })
                                setMsg("Enregistrements effectués avec succès");
                                if(operation == "insert") navigate('/operation/scan-emplacement',{state:{operation:"insert"}});
                            }
                        }catch(error){
                            console.log(error)
                        }
        
                    }
                    else{
                        setError(true);
                        setMsg("Une erreur est survenue lors de l'enregistrement");
                        inputRef.current.focus();
                    }
                   
                }
                
                
            }else{
                setError(true);
                setMsg("Veuillez d'abord scanner un article");
                inputRef.current.focus();
            }

           
        }catch(err){
            setError(true);
        }
    }
   
   return(
    <>
        <Menu/>
        <div className="page-right-side d-flex flex-column  align-items-center">
            <div className="titre h4 align-self-start" style={{fontWeight:"bolder"}}>
                Enregistrement d'articles
            </div>
            <div className="d-flex flex-row align-items-start mt-3 mb-3" style={{width:"100%",height:"100%"}}>
                <div className="info-card ps-4 pt-4 pb-4 pe-3 d-flex flex-column align-items-start" style={{width:"25%",height:"97%"}}>
                    <div className="d-flex flex-row align-items-center p-1 justify-content-center mb-4" style={{fontWeight:"bold", textAlign:"center",color:"var(--viseo-color-orange)"}}>
                    <div><i className="bi bi-info-circle" style={{fontSize:"30pt"}}></i></div>
                    <div style={{fontSize:"14pt"}}>Informations sur l'emplacement</div>
                    </div>
                    <div className="table-responsive tableau-container">
                        <table className="infoTable">
                            <tbody>
                                <tr>
                                    <td>Dépot</td>
                                    <td>:</td>
                                    <td>{informations.depot}</td>
                                </tr>
                                <tr>
                                    <td>Couloir</td>
                                    <td>:</td>
                                    <td>{informations.couloir}</td>
                                </tr>
                                <tr>
                                    <td>Rack</td>
                                    <td>:</td>
                                    <td>{informations.rack}</td>
                                </tr>
                                <tr>
                                    <td>Rangée</td>
                                    <td>:</td>
                                    <td>{informations.rangee}</td>
                                </tr>
                                <tr>
                                    <td>Niveau</td>
                                    <td>:</td>
                                    <td>{informations.niveau}</td>
                                </tr>
                                <tr>
                                    <td>Articles en rayon</td>
                                    <td>:</td>
                                    <td>{informations.quantite}</td>
                                </tr>
                                <tr>
                                    <td>Capacité libre</td>
                                    <td>:</td>
                                    <td>{informations.capacite} m<sup>3</sup></td>
                                </tr>
                                <tr>
                                    <td>Charge libre</td>
                                    <td>:</td>
                                    <td>{informations.charge} kg</td>
                                </tr>
                            </tbody>
                        </table>                        
                    </div>
                </div>
                <div className="d-flex flex-column align-items-center" style={{width:"75%",height:"92%"}}>
                                   
                    <div style={{fontSize:"10pt", fontWeight:600,color:"#6e6e6e"}}>Rangement d'articles à l'emplacement numéro {num_emplacement}</div>
                    {
                        (error &&  (msg != null))? <div className="alert alert-danger" role="alert">{msg}</div> : 
                        success ? <div className="alert alert-success" role="alert">{msg}</div> : <div></div>
                    }
                    <div><i className="bi bi-upc-scan" style={{fontSize:"120pt"}}></i></div>
                    <div>Nombre d'articles scannés : {articleCounter}</div>
                    <div>Charge libre: {chargeLibre}</div>
                    <div>Capacité libre: {capaciteLibre}</div>
                    <input type="text" name="barcode" ref={inputRef} maxLength={13} onChange={onInput} value={barcode} autoFocus={true} style={{outline:"none"}}></input>
                    <div className="m-5 d-flex flex-column">
                            <Button 
                                type="primary"
                                value="Terminer l'enregistrement"
                                onclick={onFinished}
                            />
                            <Button 
                                type="secondary"
                                value="Annuler le dernier enregistrement"
                                icon="arrow-counterclockwise"
                                onclick={onCancel}
                            />
                    </div>
                </div>
            </div>
        </div>
    </>
   )
}

export default ScanBarcode