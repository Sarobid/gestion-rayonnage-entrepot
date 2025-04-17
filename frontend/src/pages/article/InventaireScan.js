import React,{useEffect,useState,useRef} from "react";
import {useLocation} from "react-router-dom";
import Menu from "../../components/menu";
import Button, { Title } from "../../components/UIComponents";
import api from "../../api";
import Swal from 'sweetalert2';

export default function Inventaire(){
    const location = useLocation()
    const inputRef                      = useRef(null);
    const [codeBarre, setCodebarre] = useState(null)
    const [barcode,setBarcode]          = useState("");
    const [refInterne, setRefInterne] = useState("");
    const [nomArticle,setNomArticle] = useState("");
    const [quantiteStock, setQuantiteStock] = useState(0);
    const [listeCodebarres,setListCodebarre] = useState([])
    const [timeoutId, setTimeoutId]     = useState(null);
    const [articleCounter,setCounter]   = useState(0);
    const [checkIfRef,setCheckIfRef] = useState(false);
    const [error,setError]  = useState(false)
    const  [msg,setMsg] = useState("")
    const [disableBtn,setDisableBtn] = useState(true)
    const [saved,setSaved] = useState(false)

    useEffect(()=>{
        fetchArticles()
        
    },[refInterne])

    useEffect(()=>{
        if(checkIfRef == true) setDisableBtn(false)
        else setDisableBtn(true)
    },[checkIfRef])

    const fetchArticles = async () => {
        try{
            if(refInterne != ""){
                const response = await api.get(`get-article/${refInterne.toUpperCase()}`)
                if(response.data.success == true){
                    if(response.data.article.designation != ""){
                    setNomArticle(response.data.article.designation);
                    setCheckIfRef(true)}
                    else setNomArticle("");
                    return true
                }
            }else{
                setNomArticle("")
                return false
            }
            
        }catch(error){
            console.log(error)
        }
    }

    const onInput = (e) => {
        
            const value = e.target.value
            setBarcode(value);
        
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            const id = setTimeout(() => {
                finishInput(value); 
            }, 300); 

            setTimeoutId(id);
        
        
    };

    useEffect(()=>{
        incrementCounter()
    },[listeCodebarres])

    const incrementCounter = ()=>{
        setCounter(listeCodebarres.length);
        console.log(articleCounter);
        
    }
    const handleListCodeBarre = (value) => {
        setListCodebarre((prevList) => [...prevList, value]);
      };

    const checkIfSkuExists = async (value) => {
        try{
            const response = await api.get(`get-sku/${value}`)
            if(response.data.sku != null)
            setSaved(true)
        else return false
        }catch(error){
            console.log(error)
        }
    }
    const finishInput = (value) => {
        setError(false)
        if(listeCodebarres.includes(value)) {
            setError(true);
            setMsg("Cet article a déja été scanné!");
            setBarcode("");
        }
        else{
            console.log(value);
            handleListCodeBarre(value);
            console.log(listeCodebarres);
            incrementCounter();
            setBarcode("");
        }
        
        
    }

    const onInputChange = (e) => {
        setRefInterne(e.target.value)
    }
    const handleKeyPress = (e) => {
        if (e.key == "enter") fetchArticles()
    }

    const onCancel = () => {
        setListCodebarre(prevCodebarre => prevCodebarre.slice(0, -1));
        console.log(listeCodebarres)
    }

    const onFinished = async () => {
        console.log(listeCodebarres)
        try{
            const article = fetchArticles()
            if (checkIfRef == true){
                const liste = listeCodebarres
                console.log(liste)
                console.log(refInterne)
               const response = await api.post(`bulk-create/${refInterne}`, {liste_codebarre:liste})
                if(response.data.success){
                               Swal.fire({
                                   text:"Code-barre(s) enregistré(s) avec succès",
                                   icon:"success",
                                   showConfirmButton: false,
                                   timer:1500
                })
                setRefInterne("")
                setCounter("")
                setListCodebarre([])
            }
                
                else{
                    Swal.fire({
                        text:"Erreur lors de l'enregistrement",
                        icon:"error",
                        showConfirmButton: false,
                        timer:1500
                })}
            }else{
                console.log("Article inexistant")
            }

        }catch(err){
            console.log(err)
        }
    }

    return(
        <>
        <Menu></Menu>
        <div className="page-right-side d-flex flex-column ">
        <div className="titre h4" style={{fontWeight:"bolder"}}>
                Scan des articles
            </div>
            <div className="d-flex flex-row">
                <div className="col-6">
                    <label className="form-label">Entrez la référence de l'article</label>
                    <input className="form-control" value={refInterne} onChange={onInputChange} onKeyDown={handleKeyPress}></input>
                </div>
            </div>
            
            <div className="d-flex flex-column align-items-center justify-content-center" style={{marginTop:"4%"}}>
                <div style={{fontSize:"10pt", fontWeight:600,color:"#6e6e6e"}}>  
                    {
                            (nomArticle == "") ? "Aucun article" :<p>{nomArticle}</p>
                    }
                </div>
                    {
                        (error &&  (msg != null))? <div className="alert alert-danger" role="alert">{msg}</div> : ""
                        
                    }
                <div><i className="bi bi-upc-scan" style={{fontSize:"90pt"}}></i></div>
                <div>Nombre d'articles scannés : {articleCounter}</div>
                <div>{barcode}</div>
                <input type="text" name="barcode"   ref={inputRef} maxLength={13} onChange={onInput} value={barcode} autoFocus={true}></input>
                <div className="m-5 d-flex flex-column">
                        <Button 
                            type="primary"
                            value="Terminer l'enregistrement"
                            onclick={onFinished}
                            disable={disableBtn}
                        
                        />
                        <Button 
                            type="secondary"
                            value="Annuler le dernier enregistrement"
                            icon="arrow-counterclockwise"
                            onclick={onCancel}
                            disable={disableBtn}
                        />
                </div>
            </div>
        </div>
        </>
    )

}