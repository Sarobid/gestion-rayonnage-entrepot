import React,{useEffect, useState, useRef}  from "react";
import Button,{Title,NoResult, EditButton, DeleteButton,Dialog} from "../../components/UIComponents";
import api from "../../api";
import Swal from 'sweetalert2';
import Menu from "../../components/menu";
import Emplacement from "../emplacements/EmplacementAccueil";
import * as HoverCard from "@radix-ui/react-hover-card";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

export default function Sortie() {
    const [listArticle,setListeArticle] = useState([])
    const [listOldest,setListOldest] = useState([])
    const [oldestDate,setOldestDate] = useState(null)
    const [refInterne,setRefInterne] = useState("")
    const [nomArticle,setNomArticle] = useState("");
    const [dateArrivage,setDateArrivage] = useState(null);
    const [numEmplacement,setNumEmplacement] = useState("")
    const [open,setOpen] = useState(false)
    const [msg,setMsg] = useState("")
    const [error,setError] = useState(false)
    const [barcode,setBarcode]          = useState("");
    const [timeoutId, setTimeoutId]     = useState(null);
    const [articleCounter,setCounter]   = useState(0);
    const [listeCodebarre,setListCodebarre] = useState([]);
    const inputRef                      = useRef(null);
    const [nbArticleRetirer,setNbArticleRetire] = useState(1);
    const [listExtractables,setExtractables] = useState([]);
    const [listEmplacements,setListemplacement] = useState([]);
    const [listOldEmplacement,setListOldEmplacement] = useState([]);
    const [missingItems, setMissingItems] = useState(0)
    const [result,setResult] = useState({
        nbResults : 0,
        listEmplacement: []
    })
    const [currentIdx, setCurrentIdx] = useState(0)
    const [prevIdx , setPrevIdx] = useState(0)
    const [nextIdx,setNextIdx] = useState(0)
    
    useEffect(()=>{
        fetchArticles()
    },[refInterne])

    const fetchArticles = async () => {
        try{
            if(refInterne != ""){
                const response = await api.get(`get-article/${refInterne.toUpperCase()}`)
                if(response.data.success == true){
                    if(response.data.article.designation != ""){
                    setNomArticle(response.data.article.designation);
                    }
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

    const handleKeyPress = (e) => {
        if (e.key == "enter") fetchArticles()
    }

    useEffect(()=>{
        if(refInterne != "")
        fetchOldArticlesEmplacement()
    },[refInterne])

    const fetchOldArticlesEmplacement = async () => {
        try{
            const response = await api.get(`get-oldest/${refInterne.toUpperCase()}`)
            if(response.data.success == true){
                setListOldest(response.data.result)

                if(response.data.result.length > 0){
                    setOldestDate(response.data.result[0].date_arrivage)

                    const filteredData = response.data.result.filter(item => item.num_emplacement && item.date_arrivage == response.data.result[0].date_arrivage)
                    const emplacements = filteredData.map(item => item.num_emplacement)
                    setListemplacement(emplacements)
                    fetchExtractableSKU(emplacements)
                }
            }
        }catch(error){
            console.log(error)
        }
    }

    useEffect(()=>{
        if(refInterne != "" && nbArticleRetirer != "")
        fetchOldEmplacement()
    },[refInterne,nbArticleRetirer,currentIdx])

    const fetchOldEmplacement = async () => {
        try{
            const response = await api.post(`sku/oldest_emplacement`,{ref_interne:refInterne.toUpperCase(),nb_articles:parseInt(nbArticleRetirer)})
            if(response.data.success == true){

                if (response.data.result.length > 0){
                    const nbResult = response.data.result.length
                    console.log(response.data.result[currentIdx].emplacements)
                    setResult({
                        nbResults: nbResult,
                        listEmplacement : response.data.result[currentIdx].emplacements
                    })
                    
                    
                   
                }
                setListOldEmplacement(response.data.result[currentIdx])
                console.log(response.data.result[currentIdx])

                    if(response.data.insuffisance > 0) setMissingItems(response.data.insuffisance)
                    
            }
        }catch(error){
            console.log(error)
        }
    }
    const onClickPrev = () =>{
        setCurrentIdx(currentIdx - 1)
        console.log("Current idx "+ currentIdx - 1)
    }

    const onClickNext = () => {
        setCurrentIdx(currentIdx + 1)
        console.log("Current idx "+ currentIdx+1)
    }

    const fetchExtractableSKU = async (liste) => {
        try{
            const response = await api.post('sku/emplacement',{num_emplacements:liste})

            if(response.data.success == true) 
                setExtractables(response.data.skus)
        }catch(error){
            console.log(error)
        }
    }

    const handleListCodeBarre = (value) => {
        setListCodebarre((prevList) => [...prevList, value]);
    };

    const checkIfNotExists = (value) => {
        return listExtractables.some(item => item.code_barre_produit == value)
    }
 
    const onReduceClick = (value) =>{
        setNumEmplacement(value);
        setOpen(true);
        console.log(value)
    }

    const onInput = (e) => {
        const value = e.target.value;
        setBarcode(value);

        if (timeoutId) {
        clearTimeout(timeoutId);
        }

        const id = setTimeout(() => {
            finishInput(value)
        }, 300); 

        setTimeoutId(id);
    };
    
    const resetValues = () => {
        setBarcode(null);
        setListCodebarre([]);
        setCounter(0);
    }
    const formatDate = (dateString) => {
        const date = new Date(dateString); // Convertit la chaîne en objet Date
        const day = String(date.getDate()).padStart(2, "0"); // Ajoute un 0 si nécessaire
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Mois commence à 0
        const year = date.getFullYear();
    
        return `${day}-${month}-${year}`;
      };

    const finishInput = (value) => {
        const exists = checkIfNotExists(value)
        setError(false);
        setMsg("")

        if(listeCodebarre.includes(value)) {
            setError(true);
            setMsg("Cet article a déja été scanné!");
            setBarcode("");

        }else if(articleCounter == listExtractables.length){
            setError(true);
            setMsg("Veuillez d'abord extraire ces articles");
            setBarcode("");
        }else{
            if(true){
            
                handleListCodeBarre(value)
                setBarcode("")
            }else{
                setError(true);
                setMsg("Cet article n'est pas enregistré")
                setBarcode("")
            }
        }
        
            
    }

    useEffect(()=>{
        incrementCounter()
    },[listeCodebarre])

    const incrementCounter = ()=>{
        setCounter(listeCodebarre.length);
        console.log(articleCounter);
        
    }

    const onExtraireClick = () => {
        if(listeCodebarre.length == 0){
            Swal.fire({
               text:"Veuillez d'abord scanner des articles",
                icon:"warning",
                showConfirmButton: false,
                timer: 1500
            })
        }else if(nomArticle == ""){
            Swal.fire({
               text:"Veuillez entrer une référence valide de l'article",
                icon:"warning",
                showConfirmButton: false,
                timer: 1500
            })
        }else{
            extraireArticle()
        }
    }

    const extraireArticle = async () => {
       
            try{
                const response = await api.post(`bulk-update-sku/${null}`,{liste_codebarre:listeCodebarre})
                if(response.data.success == true) {
                    Swal.fire({
                        text:"Articles extraites avec succès",
                        showConfirmButton: false,
                        icon:"success",
                        timer:1800
                    })
                    fetchOldArticlesEmplacement()
                    fetchOldEmplacement()
                }
            }catch(error){
                console.log(error)
            }       
    }
    const handleQuantite = (e) => {
        const inputValue = e.target.value
        const numericValue = inputValue.replace(/[^0-9]/g, "")
        setNbArticleRetire(numericValue)
    }
    return(
        <>
        <Menu/>
        <div className="page-right-side d-flex flex-column align-items-start">
           
            <div className="titre h4 mb-4" style={{fontWeight:"bolder"}}>
                Sortie d'articles
            </div>
            <div className="d-flex flex-row justify-content-between" style={{width:"100%"}}>
                <div style={{width:"60%"}}>
                    <div style={{textAlign:"justify",fontSize:"11.5pt"}}>La liste est ordonnée selon l'emplacement des articles les plus anciens suivant le chemin de récupération le plus court. Insérez la quantité d'article à prendre avec sa référence pour voir des résultats. </div>
                    <div className="d-flex flex-row align-items-center justify-content-between mt-3 mb-4" style={{width:"80%"}}>
                        <div className=" d-flex flex-row align-items-center">
                            <label className="form-label me-2">Quantité</label>
                            <input type="text" min="1" className="form-control"  style={{with:"100%"}} value={nbArticleRetirer} onChange={handleQuantite}/>
                        </div>
                        <div className="ms-3  d-flex flex-row align-items-center">
                            <label className="form-label me-2">Référence<span className="requiredStar"><sup>*</sup></span></label>
                            <input type="text" className="form-control" placeholder="Référence de l'article" style={{width:"100%",height:"100%",margin:"0 4px"}} value={refInterne} onChange={(e)=>setRefInterne(e.target.value)} onKeyDown={handleKeyPress}></input>
                        </div>                   
                    </div>
                    
                    <div>
                        {
                            (listOldEmplacement != null) ?
                                <div key={listOldEmplacement.depot}>
                                    <div className=" mb-3 ms-2 d-flex flex-row align-items-center justify-content-between" style={{width:"100%"}}>
                                        <div className="h4 ms-2" style={{fontWeight:"bold", color:"#ff7847"}}><i className="bi bi-box-seam-fill me-2" style={{fontSize:"13pt"}}></i> Dépot {listOldEmplacement.depot}</div>
                                        {
                                            (result.nbResults > 1) ? 
                                                <div className="d-flex flex-row align-items-center navTab me-3">
                                                    { (currentIdx == 0) ? "" : <div className="navIcon " onClick={onClickPrev}><i className="bi bi-chevron-compact-left" style={{fontWeight:"bold"}}></i>Préc.</div>}
                                                    <div className="ms-2 me-2" style={{fontSize:"11pt"}}>{currentIdx + 1} / {result.nbResults}</div>
                                                    {(currentIdx == (result.nbResults - 1 )) ? "" : <div className="navIcon" onClick={onClickNext}>Suiv.<i className="bi bi-chevron-compact-right " style={{fontWeight:"bold"}}></i></div>}
                                                </div> : 
                                                ""
                                        }
                                    </div>
                                </div>
                            : <div style={{visibility:"hidden"}}>Nothing</div>
                        }
                        <div></div>
                    
                        <div className="table-responsive ms-2" style={{height:"60vh"}}>                  
                                <table className="table tableau">
                                        <thead>
                                            <tr>
                                                <th>Numéro de l'emplacement
                                                <HoverCard.Root>
                                                    <HoverCard.Trigger asChild>
                                                        <i className="bi bi-question-circle ms-2" style={{fontWeight:"bold",fontSize:"10pt",color:"#6e6e6e"}}></i>
                                                    </HoverCard.Trigger>
                                                    <HoverCard.Portal>
                                                        <HoverCard.Content className="help" side="right">
                                                            <div>Dépot-Couloir-Rack-Rangée-Niveau  </div>
                                                        </HoverCard.Content>
                                                    </HoverCard.Portal>
                                                </HoverCard.Root>
                                                </th>
                                                <th>Quantité</th>
                                                <th>Date d'entrée</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        { (result.listEmplacement != null && result.listEmplacement.length > 0) ?
                                            
                                            result.listEmplacement.map((emplacement,emplacementIndex)=>(
                                                <tr key={emplacementIndex}>
                                                    <td>{emplacement.num_emplacement}</td>
                                                    <td>{emplacement.quantite}</td>
                                                    <td>{formatDate(emplacement.date)}</td>                                                    
                                                </tr>

                                            )) 
                                           
                                            :
                                            <tr>
                                            <td colSpan={4} style={{textAlign:"center"}}><NoResult /></td>
                                            </tr> 
                                        }
                                             
                                        </tbody>
                                </table>
                            </div>
                    </div>
                </div>
                <div className="d-flex flex-column p-4  align-items-center justify-content-center" style={{width:"40%",height:"94%", marginLeft:"2%",boxShadow:" 0px 1px 4px 4px #eaeaeaa9", borderRadius: "20px" }}>
                                    {(missingItems > 0) ?
                                    <>
                                    <div className="alert" style={{fontSize:"11pt", fontWeight:700,color:"#dd3232"}}><i className="bi bi-exclamation-triangle me-3" ></i>{missingItems} articles manquants</div>
                                    </>
                                    : ""}
                                   <div style={{fontSize:"10pt", fontWeight:600,color:"#6e6e6e"}}>Sortie de {nbArticleRetirer} {nomArticle} </div>
                                   {
                                       (error &&  (msg != null))? <div className="alert alert-danger p-4" role="alert">{msg}</div> : ""
                                   }
                                   <div><i className="bi bi-upc-scan" style={{fontSize:"90pt"}}></i></div>
                                   <div>Nombre d'articles scannés : {articleCounter} </div>
                                   
                                   <input type="text" name="barcode" maxLength={13}   onChange={onInput} autoFocus={true} style={{outline:"none"}} value={barcode}></input>
                                   <div className="mb-5 ms-5 me-5 mt-2 d-flex flex-column">
                                           <Button 
                                               type="primary"
                                               value="Extraire les articles"
                                               onclick={onExtraireClick}
                                           />
                                           <Button 
                                               type="secondary"
                                               value="Annuler"
                                               icon="arrow-counterclockwise"
                                               onclick={resetValues}
                                           />
                                   </div>
                               </div>
            </div>
        </div>
        </>
    )
}