import React,{useEffect, useState} from "react";
import Button,{Title,NoResult,EditButton,DeleteButton} from "../../components/UIComponents";
import api from "../../api";
import Swal from 'sweetalert2';
import Menu from "../../components/menu";

export default function CouloirAccueil(){

    const nbDepots                                      = 25;
    const [msg,setMsg]                                  = useState("Veuillez selectionner un dépot");
    const [error,setError]                              = useState("");
    const [numDepot, setNumDepot]                       = useState(0);
    const [disableButton,setDisable]                    = useState(true);
    const [listCouloir, setListCouloirs]                = useState([]);
    const [nbCouloirCreate, setNbCouloirCreate]         = useState(1);
    const [nbFetchedCouloir, setFetchedCouloir]         = useState(0);
    const [addMultipleCouloir, setAddMultipleCouloir]   = useState(false);
    const [listDepot,setListDepot]                      = useState([])
    const [couloir,setCouloir] = useState([]);

    useEffect(() =>{
        fetchCouloirs();
    },[numDepot])

    useEffect(()=>{
        fetchDepot();
    },[])

    const fetchDepot = async () => {
        try{
            const response = await api.get('get-all-depot')
            if(response.data.success == true){
                setListDepot(response.data.depot)
            }
        }catch(error){

        }
    }
     
    const addCouloir = async (e) => {
        e.preventDefault();
        try{
            var i = 0;
          
            while(i < nbCouloirCreate){
                const response = await api.post(`create-couloir/${numDepot}`)
                i++;
            }
            fetchCouloirs();
            setAddMultipleCouloir(false);
            setMsg("Couloir créé avec succès");

        }catch(error){
            setError(true);
            console.log(error);
            setMsg("Une erreur est survenue lors de l'ajout du nouveau couloir");
        }

    }
    
    const fetchCouloirs = async () => {
        if (numDepot != 0){
            const response = await api.get(`get-couloir-by-depot/${numDepot}`)
            setListCouloirs(response.data.couloir);
            setFetchedCouloir(response.data.count);
        }else{
            setFetchedCouloir(0);
        }   
    }

    const onSelectChange = (e) => {
        setNumDepot(e.target.value);
        if(e.target.value == 0 ){
            setMsg("Veuillez selectionner un dépot");
            setError(true);
            setDisable(true);
        }else{
            setMsg("");
            fetchCouloirs();
            setDisable(false);
        }
        
    }

    const onAddMultiple = () => {
        setAddMultipleCouloir(true)
    }

    const confirmMultiple = (e) => {
        setNbCouloirCreate(e.target.value);
    }

    const deleteCouloir = async (numCouloir) => {
        try{
            const response = await api.post(`couloir/delete/${numCouloir}`)
            if(response.data.success){
                Swal.fire({
                    text:"Couloir supprimé avec succès",
                    icon:"success",
                    showConfirmButton: false,
                    timer:1500
                })
                fetchCouloirs()
            }
        }catch(error){
            Swal.fire({
                text:"Une erreur est survenue lors de la suppression",
                showConfirmButton: false,
                icon:"error",
                timer:1500
            })
        }
    }
    const onDeleteClick = (numCouloir) => {
       
        Swal.fire({
            text:"Etes-vous sûr(e) de vouloir supprimer le couloir "+numCouloir+" ?",
            confirmButtonText:"Oui",
            showCancelButton:true,
            cancelButtonText:"Non",
            icon: "question"
        }).then((result)=>{
            if(result.isConfirmed) deleteCouloir(numCouloir)
        })
        
    }

    return(
        <>
        <Menu/>
        <div className="page-right-side d-flex flex-column align-items-start">
            <Title
                    value="Couloirs"/>
            <form  method="POST" onSubmit={addCouloir}>
                    
                <div className="d-flex flex-row align-items-center mb-3">
                    <div className="me-3">
                        <label className="form-label">Numéro de dépot</label>
                        <select className="form-select" defaultValue={""} onChange={onSelectChange} style={{width:"150px"}}>
                            <option key="0" value=""></option>
                            { 
                                (listDepot.length == 0) ? <option value="0" style={{fontStyle:"italic",color:"grey"}} disabled>Aucun dépot existant</option> :

                                listDepot.map((depot,depotIndex)=>(
                                    <option key={depotIndex} value={depot.id}>{`Dépot ${depot.num_depot}`}</option> 
                                ))

                            }
                        </select>
                    </div>
                    <div className="d-flex flex-column">
                   
                        {
                            !addMultipleCouloir ?  <>
                             <label htmlFor="nbCouloirs" className="form-label" style={{visibility:"hidden"}}>Nombre de couloirs à ajouter</label>
                            <Button value="Ajouter couloirs" icon="plus-lg" onclick={onAddMultiple} disable={disableButton}></Button>
                            </> : <div></div>
                        }
                        
                        {
                            addMultipleCouloir ? (
                            <div className="d-flex flex-row align-items-center">
                                <div>
                                    <label htmlFor="nbCouloirs" className="form-label" >Nombre de couloirs à ajouter</label>
                                    <input type="number" className="form-control" min="1" max="50" name="nbCouloirs" onChange={confirmMultiple} disable={disableButton}></input>
                                </div>
                                <div className="d-flex flex-column ">
                                <label htmlFor="nbCouloirs" className="form-label" style={{visibility:"hidden"}}>Nombre de couloirs à ajouter</label>
                                    <Button value="Ajouter" onclick={() => {addCouloir}} disable={disableButton}/>
                                </div>
                            </div>) : <div></div>
                        }
                        
                    </div>
                </div>
                
                
            </form>
            {((numDepot == 0) ? <div className="error" >Veuillez sélectionner un dépot!</div> : <div className="resultatCount">{listCouloir.length} résultats trouvés</div> )}
            <div className="tableau-container table-responsive ">
                <table className="table tableau">
                        <thead>
                            <tr>
                                <th>Identifiant du couloir</th>
                                <th>Numéro du dépot</th>
                                <th>Nom du couloir</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                           { (nbFetchedCouloir > 0) ?
                            
                            listCouloir.map((couloir,couloirIndex)=>(
                                <tr key={couloirIndex}>
                                    <td>{couloir.num_couloir}</td>
                                    <td>Dépot {couloir.num_depot}</td>
                                    <td>Couloir {couloir.nom_couloir}</td>
                                    <td className="col-2">  
                                        
                                            <i className="bi bi-trash3 deleteButton" onClick={() => onDeleteClick(couloir.num_couloir)} ></i>
                                      
                                    </td>
                                </tr>

                            )) :
                            <tr>
                            <td colSpan={4} style={{textAlign:"center"}}><NoResult/></td>
                           </tr> 
                           }

                        </tbody>
                </table>
        </div>
        </div>
        </>
    )
}
