import React,{useEffect,useState} from "react";
import Menu from "../../components/menu";
import Button,{ ProgressBar, Title,NoResult } from "../../components/UIComponents";
import * as HoverCard from "@radix-ui/react-hover-card";
import api from "../../api";
import "../../styles/stats.css";
import {useNavigate,useLocation, Link} from 'react-router-dom';


export default function Suggestions(){
    const navigate                              = useNavigate();
    const [libreCount,setLibreCount] = useState(0)
    const [emplacementLibre,setEmplacementLibre] = useState([])
    const [listArticle,setListeArticle] = useState([])
    const [poids,setPoids] = useState(0)
    const [volume,setVolume] = useState(0)
    const [listSuggestionParArticle, setListeSuggestionParArticle] = useState([])
    const [refInterne,setRefInterne] = useState("")
    var i = 0

    useEffect(()=> {
        fetchEmplacementsLibreParDepot();
    },[])
    const fetchEmplacementsLibreParDepot = async () => {
        try{
            const response = await api.get(`emplacement-vide`)
            setLibreCount(response.data.emplacements)
        }catch(error){
            console.log(error)
        }
    }

    useEffect(()=>{
        const fetchDepotStats = async () => {
            try{
                const response = await api.get('emplacement-vide-pourcentage/5')
                    if(response.data.success == true){
                        const array = chunkArray(response.data.result,3)
                        setEmplacementLibre(array)
                    }
            }catch(error){
                console.log(error)
            }
        }
        fetchDepotStats()
    },[])
    
    const chunkArray = (array, size) => {
        const chunked = [];
        for (let i = 0; i < array.length; i += size) {
          chunked.push(array.slice(i, i + size));
        }
        return chunked;
      };

    useEffect(()=>{
        const fetchArticles = async () => {
            try{
                const response = await api.get('get-all-article')
                setListeArticle(response.data.article)
            }catch(error){
                console.log(error)
            }
        }
        fetchArticles();
    },[])


    useEffect(()=>{
        fetchEmplacementLibrePourArticle();
    },[refInterne])
    const fetchEmplacementLibrePourArticle = async () => {
        try{
            if(refInterne != ""){
                const response = await api.get(`suggest-emplacement/${refInterne}/5/0`)
                setListeSuggestionParArticle(response.data.suggestions)
            }
        }catch(error){
            console.log(error)
        }
    }

    return(
        <>
        <Menu/>
        <div className="page-right-side d-flex flex-column  align-items-start">
            <div className="titre h4 mb-3" style={{fontWeight:"bolder"}}>
                Suggestions d'emplacement
            </div>
            <div>
                
            </div>
            <div className="container grid-container  mt-4">
                <div className="row">
                   
                    <div className="col-3  d-flex flex-column align-items-center justify-content-start p-3">
                        <div className="mb-3">
                            <button className="button button-green" onClick={()=>navigate('/emplacements-optimisés')}>Optimiser l'arrangement des articles</button>
                        </div>
                        <div className="statistics d-flex flex-column align-items-center justify-content-evenly p-3">
                            <div className="statisticsNumber">{libreCount}</div>
                            <div className="statisticsTitle">Emplacements libres</div>
                        </div>
                    </div>
                    <div className="col-8 ms-4 ps-3">
                        <div>
                            <div className="d-flex flex-row align-items-start justify-content-between">
                                <div className="h6 ms-2" style={{fontWeight:"bold", color:"#ff7847"}}><i className="bi bi-percent me-2"></i> Taux d'occupation des dépots</div>
                                <div style={{color:"#2f2fc3"}}><Link to={"/liste/c?md=depot&ref=''"}>Voir tout</Link></div>
                            </div>
                            <div className="ligne mb-3"></div>
                            <div className="container">
                            {
                                emplacementLibre.map((emplacementGroupe,groupeIndex)=>(
                                    <div key={groupeIndex} className="row">
                                        {emplacementGroupe.map((emplacement,emplacementIndex)=>(
                                            <div key={emplacementIndex} className="col card1  d-flex flex-column align-items-start justify-content-start">
                                                <p style={{fontWeight:500}}><i className="bi bi-box-seam-fill me-2 ms-2"></i> Dépot {emplacement.num_depot}</p>
                                                <ProgressBar data={emplacement.percentage.toFixed(2)}/>
                                            </div>
                                            
                                        ))
                                        
                                        }
                                     {((emplacementGroupe.length % 3) == 2) ? <div className="col card1 hidden"></div> : ((emplacementGroupe.length % 3) == 1) ? 
                                        <><div className="col card1 hidden"></div><div className="col card1 hidden"></div></> : <div></div>
                                    }
                                    </div>
                                
                                ))
                            }
                        </div>
                        <div>
                            <div className="d-flex flex-row align-items-start justify-content-between mt-3">
                                <div className="h6" style={{fontWeight:"bold", color:"#ff7847"}}><i className="bi bi-lightbulb me-2"></i> Suggestions selon l'article</div>
                                {(refInterne != "") ? <div style={{color:"#2f2fc3"}}> <Link to={'/liste/c?md=emplacement&ref='+refInterne} >Voir tout</Link></div> :""}
                            </div>
                            <div className="ligne mb-3"></div>
                            <div>
                                <label className="form-label">Article</label>
                                <select className="form-select" onChange={(e)=> setRefInterne(e.target.value) }>
                                    <option value={0}></option>
                                    {
                                        listArticle.map((article,articleIndex)=>(
                                            <option key={articleIndex} value={article.ref_interne}>{article.designation}</option>
                                        ))
                                    }
                                </select>
                                <div className="table-responsive tableau-container mt-4" style={{height:"40s%"}}>
                                    <table className="table tableau" style={{textAlign:"center"}}>
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Dépot</th>
                                                    <th>Couloir</th>
                                                    <th>Emplacement</th>
                                                    <th>Quantité possible</th>
                                                    <th>Ressource gaspillée
                                                        <HoverCard.Root>
                                                            <HoverCard.Trigger asChild>
                                                                <i className="bi bi-question-circle ms-2" style={{fontWeight:"bold",fontSize:"10pt",color:"#6e6e6e"}}></i>
                                                            </HoverCard.Trigger>
                                                            <HoverCard.Portal>
                                                                <HoverCard.Content className="help">
                                                                    <div style={{}}>Pourcentage des capacités non-utilisés.</div>
                                                                </HoverCard.Content>
                                                            </HoverCard.Portal>
                                                        </HoverCard.Root>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            {
                                                (listSuggestionParArticle.length == 0) ? 
                                                <tr>
                                                    <td colSpan={6} style={{textAlign:"center"}}>Aucun résultat</td>
                                                </tr> : 
                                                listSuggestionParArticle.map((suggestion, suggestionIndex)=> (
                                                    
                                                    <tr key={suggestionIndex}>
                                                        <td>{suggestionIndex+1}</td>                        
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
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
        </>
    )
}