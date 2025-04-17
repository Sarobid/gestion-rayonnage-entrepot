import React, {useEffect,useState} from "react";
import api from "../../api";
import Button,{Recherche, Title,OptionsButton,NoResult} from "../../components/UIComponents";
import '../../styles/App.css';
import {useNavigate} from 'react-router-dom';
import Menu from "../../components/menu";

export default function Emplacement(){
    const navigate = useNavigate()
    const nbDepots                = 25;
    const [numDepot, setNumDepot] = useState(null);
    const [listeCouloir, setListeCouloir]  = useState(null);
    const [numCouloir,setNumCouloir] = useState(null);
    const [listRack,setListRacks] = useState([]);
    const [numRack,setNumRack] = useState(null);
    const [disableButton, setDisableButton ] = useState(true);
    const [listEmplacement,setListEmplacement] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [listDepot,setListDepot]      = useState([])


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

    useEffect(()=>{
        fetchCouloirsByDepot();
    },[numDepot])

    const fetchCouloirsByDepot = async () => {
        try{
            if(numDepot != null){
                const response = await api.get(`get-couloir-by-depot/${numDepot}`)
                if(response.data.success == true){
                    setListeCouloir(response.data.couloir);
                }else setListeCouloir(null)
            }
            
        }catch(error) {

        }
    }

    useEffect(()=>{
        fetchRack()
    },[numCouloir])

    const fetchRack = async () => {
        try{
            if(numCouloir != null){
                const response = await api.get(`get-rack-by-couloir/${numCouloir}`)
                setListRacks(response.data.racks);
                console.log(listRack)
                
            }else setListRacks(null)
        }catch(error){
            console.log(error)
        }
    }

    useEffect(()=>{
        fetchEmplacement();
    },[numRack,numCouloir,numDepot])

    const fetchEmplacement = async () => {
        try{
            const response = await api.get(`get-by-rack/${numRack}`)
            setListEmplacement(response.data.emplacement);
            console.log(response.data.emplacement);
        }catch(error){
            console.log(error)
        }
    }

    const onSelectCouloir = (e) => {
        setNumCouloir(e.target.value);
       
    }
    
    const onSelectDepotChange = (e) =>{       
        setNumDepot(e.target.value);
        console.log(listeCouloir)       
    }

    const onSelectRack = (e) => {
        setNumRack(e.target.value);
    
    }

    useEffect(()=>{
        const checkBlank = () =>{
            if((numDepot == null) || (numCouloir == null) || (numRack == null)) {
                setDisableButton(true)
            }else{
                setDisableButton(false)
            }
        }
        checkBlank()
    },[numDepot,numCouloir,numRack])

    const generateEmplacement = async (e) => {
        e.preventDefault();
        try{
            const response = await api.post(`generate-emplacement/${numRack}`)
            console.log("Généré")
            fetchEmplacement()
        }catch(error){

        }
    }

    const onChangeSearch = (e) => {
        setSearchValue(e.target.value);
    
    }

    useEffect(()=>{
        filterEmplacement();
    },[numRack, searchValue])

    const filterEmplacement = async  () => {
        try{
            if((numRack != null) && (searchValue != "")){
                const response = await api.get(`filter-emplacement/${numRack}/${searchValue.toUpperCase()}`)
                setListEmplacement(response.data.emplacement)
            }
        }catch(error){

        }
    }
    const imprimer = () => {
        navigate('/imprimer', {state:{emplacements:listEmplacement}})
    }

    return(
        <>
        <Menu/>
        <div className="page-right-side d-flex flex-column  align-items-start">
            <Title
                onRechercheChange={onChangeSearch}
                value="Emplacements"
            /> 
                
            <div className="container-fluid d-flex flex-column p-0">
                <form method="POST" onSubmit={generateEmplacement} className="d-flex flex-row justify-content-start align-items-center">
                    <div className=" mb-2 me-2">
                    <label className="form-label">Dépot</label>
                    <select className="form-select" style={{width:"150px"}} onChange={onSelectDepotChange}>
                        <option value="0"></option>
                        { 
                                (listDepot.length == 0) ? <option value="0" style={{fontStyle:"italic",color:"grey"}} disabled>Aucun dépot existant</option> :

                                listDepot.map((depot,depotIndex)=>(
                                    <option key={depotIndex} value={depot.id}>{`Dépot ${depot.num_depot}`}</option> 
                                ))

                            }
                    </select>
                    </div>
                    <div className=" mb-2 me-2">
                    <label className="form-label">Couloir</label>
                    <select className="form-select" style={{width:"150px"}} onChange={onSelectCouloir}>
                        <option value="0"></option>
                    {
                        ((listeCouloir == null) || (listeCouloir.length == 0)) ? <option value="0" style={{fontStyle:"italic",color:"grey"}} disabled>Aucun couloir existant</option>:
                        listeCouloir.map((couloir, couloirIndex)=>(
                            <option key={couloirIndex} value={couloir.num_couloir}>{couloir.nom_couloir}</option>
                        ))
                    }
                    </select>
                    </div>
                    <div className=" mb-2 me-2">
                    <label className="form-label">Rack</label>
                    <select className="form-select" style={{width:"150px"}} onChange={onSelectRack}>
                        <option value="0"></option>
                    {
                        ((listRack == null) || (listRack.length == 0)) ? <option value="0" style={{fontStyle:"italic",color:"grey"}} disabled>Aucun rack existant</option>:
                        listRack.map((rack, rackIndex)=>(
                            <option key={rackIndex} value={rack.num_rack}>{rack.num_rack_dans_couloir}</option>
                        ))
                    }
                    </select>
                    </div>
                    <div>
                    <label className="form-label"></label>
                    {
                        (listEmplacement.length == 0) ?  <div className=" mb-2 me-2"><Button value="Générer les emplacements" onclick={generateEmplacement} disable={disableButton}></Button></div>:
                        <div></div>
                    }
                    </div>                   
                </form>
                <div className="d-flex flex-row align-items-center justify-content-between">
                    {((numRack == null) || (numDepot == null) || (numCouloir == null) ? <div className="error" >Veuillez sélectionner un dépot, un couloir et un rack !</div> : (listEmplacement.length > 0) ? <div className="resultatCount">{listEmplacement.length} résultats trouvés</div> : <div></div> )}
                    {(listEmplacement.length > 0) ? <Button value="Imprimer les QR" icon="printer" type="secondary" onclick={imprimer}/> : <div className="btn btn-mute" style={{visibility:"hidden"}}>Mute</div>}
                </div>
            </div>
            <div className="table-responsive tableau-container">
                <table className="table tableau">
                        <thead>
                            <tr>
                                <th>Identifiant</th>
                                <th>Rack associé</th>
                                <th>Quantité d'articles</th>
                                <th>Volume libre (en m<sup>3</sup>)</th>
                                <th>Charge libre (en kg)</th>
                                <th className="col-1"></th>
                            </tr>
                        </thead>
                        <tbody>
                        {
                        (listEmplacement.length == 0) ? 
                        <tr>
                            <td colSpan={6} style={{textAlign:"center"}}><NoResult/></td>
                        </tr> : 
                        listEmplacement.map((emplacement, emplacementIndex)=> (
                            <tr key={emplacementIndex}>
                                <td>{emplacement.num_emplacement}</td>                        
                                <td>{emplacement.num_rack}</td>
                                <td>{emplacement.quantite}</td>
                                <td>{emplacement.volume_libre}</td>
                                <td>{emplacement.charge_libre}</td>
                                <td className="col-1"><OptionsButton></OptionsButton></td>
                            </tr>
                        ))
                }
                        </tbody>
                </table>
           </div>
         
        </div>
        </>
    )
}