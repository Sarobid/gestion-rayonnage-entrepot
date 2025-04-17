import React,{useState,useEffect} from "react";
import {useLocation} from 'react-router-dom';
import Menu from "../../components/menu";
import { ProgressBar, Title,NoResult } from "../../components/UIComponents";
import api from "../../api";


export default function Liste(){
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search);
    const model = queryParams.get('md')
    const refInterne = queryParams.get('ref')
    const [designation,setDesignation] = useState('')
    const [title,setTitle] = useState("")
    const [liste,setListe] = useState([])
    const [quantiteArticle,setQuantiteArticle] = useState(0)
    const [totalDepot,setTotalDepot] = useState(0)

    useEffect(()=>{
        fetchListe()
    },[quantiteArticle])

    const fetchListe = async () => {
        try{
            
            if(model == "depot"){
                const response = await api.get('emplacement-vide-pourcentage/0')
                const array = chunkArray(response.data.result,3)
                setListe(array)
                setTotalDepot(response.data.count)
                setTitle("Liste des dépots libres")                        
            } 
            if(model == "emplacement"){
                if(refInterne != ""){
                    const response = await api.get(`suggest-emplacement/${refInterne}/0/${quantiteArticle}`)
                    setListe(response.data.suggestions)
                    setTitle("Liste des emplacements suggérés")
                }
            }
        }catch(error){
            console.log(error)
        }
    }

    const chunkArray = (array, size) => {
        const chunked = [];
        for (let i = 0; i < array.length; i += size) {
          chunked.push(array.slice(i, i + size));
        }
        return chunked;
    };

    useEffect(()=>{
        getSingleArticle()
    },[])

    const getSingleArticle = async () => {
        try{
            const response = await api.get(`get-article/${refInterne}`)
            console.log(response.data.article.designation)
            if(response.success == true) setDesignation("designation")
        }catch(error){
            console.log(error)
        }
    }

    return(
        <>
            <Menu/>
        <div className="page-right-side d-flex flex-column  align-items-start">
            <Title
                value={title}
            />
             { (model == "emplacement") ?
            <>
            <div className="d-flex flex-column">
                <div style={{color:"#d54916",fontWeight:"bold"}}>
                {refInterne} {designation}
                </div>
                <div>
                    <label className="form-label">Quantité</label>
                    <input type="number" min={0} className="form-control" value={quantiteArticle} onChange={(e)=> setQuantiteArticle(e.target.value)}/>
                </div>
            </div>
            <div className="ms-3 mt-4 resultatCount">{liste.length} résultats trouvés</div>
            <div className="table-responsive tableau-container mt-2" style={{width:"100%"}}>
                <table className="table tableau" style={{textAlign:"center"}}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Dépot</th>
                                <th>Couloir</th>
                                <th>Emplacement</th>
                                <th>Quantité possible</th>
                                <th>Ressource gaspillée</th>
                            </tr>
                        </thead>
                        <tbody>
                        {
                            (liste.length == 0) ? 
                            <tr>
                                <td colSpan={6} style={{textAlign:"center"}}>Aucun résultat</td>
                            </tr> : 
                            liste.map((suggestion, suggestionIndex)=> (
                                
                                <tr key={suggestionIndex}>
                                    <td style={{fontWeight:"bold"}}>{suggestionIndex+1}</td>                        
                                    <td>{suggestion.num_depot}</td>
                                    <td>{suggestion.nom_couloir}</td>
                                    <td>{suggestion.num_emplacement}</td>
                                    <td>{suggestion.quantite}</td>
                                    <td><ProgressBar data={(suggestion.gaspillage).toFixed(2)}/></td>
                                </tr>
                            ))
                        }
                        
                        </tbody>
                </table>
            </div></>:
            <>
            
             <div className="h6" style={{fontWeight:"bold", color:"#d54916"}}>Occupation des dépots</div>
            
           <div className="ligne mb-2"></div>
           <div className="ms-3 mt-2 resultatCount">{totalDepot} résultats trouvés</div>
            <div className="container p-4" style={{overflowX:"scroll"}}>
                            {
                                liste.map((emplacementGroupe,groupeIndex)=>(
                                    <div key={groupeIndex} className="row">
                                        {emplacementGroupe.map((emplacement,emplacementIndex)=>(
                                            <div key={emplacementIndex} className="col card1  d-flex flex-column align-items-start justify-content-start">
                                                <p style={{fontWeight:500}}><i className="bi bi-box-seam-fill me-2 ms-2"></i> Dépot {emplacement.num_depot}</p>
                                                <ProgressBar data={(emplacement.percentage).toFixed(2)}/>
                                            </div>                                            
                                        ))
                                        
                                        }
                                        {((emplacementGroupe.length % 3) == 2) ? <div className="col card1 hidden"></div> : ((emplacementGroupe.length % 3) == 1) ? 
                                        <><div className="col card1 hidden"></div><div className="col card1 hidden"></div></> : <div></div>
                                    }
                                    </div>
                                
                                ))
                            }
            </div></>
            }
        </div>
        </>
    )
}