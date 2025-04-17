import React,{useEffect, useState}  from "react";
import Button,{Title,NoResult, EditButton, DeleteButton} from "../../components/UIComponents";
import * as Dialog from "@radix-ui/react-dialog";
import api from "../../api";
import Swal from 'sweetalert2';
import Menu from "../../components/menu";
import '../../styles/UIComponents.css';
import * as HoverCard from "@radix-ui/react-hover-card";
import rackP from "../../img/profondeur.png";
import rackH from "../../img/hauteur.png";
import rackL from "../../img/largeur.png";
import rackRangee from "../../img/rangee.png";
import rackNiveau from "../../img/niveau.png";

export default function Rack(){
    const [listeCouloir, setListeCouloir]  = useState(null);
    const [listRack,setListRacks] = useState([]);
    const [rack, setRack] = useState([]);
    const [numDepot, setNumDepot] = useState(null);
    const [numCouloir,setNumCouloir] = useState(null);
    const [nbNiveau,setNbNiveau] = useState(1);
    const [nbRang,setNbRang] = useState(1);
    const [nbCases,setNbCases] = useState(1);
    const [chargeMax,setChargeMax] = useState(0.0);
    const [chargeMaxCase, setChargeMaxCase] = useState(0.0);
    const [hauteur,setHauteur] = useState(0.0);
    const [largeur,setLargeur] = useState(0.0);
    const [profondeur,setProfondeur] = useState(0.0);
    const [volumeCase,setVolumeCase] = useState(0.0);
    const [disableButton,setDisabledButton] = useState(true);
    const [listDepot,setListDepot] = useState([])
    const [postData,setPostData] = useState({})
    const [numRack,setNumRack] = useState(null)
    const [nbNiveauAdd,setNbNiveauAdd] = useState(0);
    const [nbRangeeAdd,setNbRangeeAdd] = useState(0)
 
    useEffect(()=>{
        fetchCouloirsByDepot();
        fetchRack();
        setDisable();
    }, [numDepot,numCouloir])

    const onNbNiveauChange = (e) =>{
        const inputValue = e.target.value
        const numericValue = inputValue.replace(/[^0-9]/g, "")
        setNbNiveau(numericValue)
    }
    
    const formatFloatValues = (value) =>{
        return value.replace(/,/g, '.').replace(/[^0-9.]/g, '');
    }
    const formatIntegerValues = (value) => {
        
        return value.replace(/[^0-9]/g, '');
    };
    
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

    const fetchCouloirsByDepot = async () => {
        try{
            if(numDepot != null){
                const response = await api.get(`get-couloir-by-depot/${numDepot}`)
                if(response.data.success == true){
                    setListeCouloir(response.data.couloir);
                }
            }
            
        }catch(error) {

        }
    }

    const fetchRack = async () => {
        try{
            if(numCouloir != null){
                const response = await api.get(`get-rack-by-couloir/${numCouloir}`)
                setListRacks(response.data.racks);
                
            }else setListeCouloir(null)
        }catch(error){
            console.log(error)
        }
    }

    const createRack = async (e) => {
        e.preventDefault()
        try{
           
            const data ={
                nb_niveau : parseInt(nbNiveau),
                nb_rangee : parseInt(nbRang),
                charge_max : parseFloat(chargeMax),
                hauteur_case : parseFloat(hauteur),
                largeur_case : parseFloat(largeur),
                profondeur_case : parseFloat(profondeur)
            }
            console.log("Data: "+ JSON.stringify(data));
            
            const response = await api.post(`create-rack/${numCouloir}`,data)

            if(response.data.success == true) console.log("Success")
            fetchRack();
        }catch(error){
                console.log(error)
        }
    }

    const onSelectCouloir = (e) => {
        setNumCouloir(e.target.value);
        fetchRack();        
    }

    const onSelectDepotChange = (e) =>{       
        setNumDepot(e.target.value);        
        fetchCouloirsByDepot();
    }
    
    const setDisable = () => {
        if(((numCouloir != null) || (numCouloir != 0)) && ((numDepot != null) || (numDepot != 0))){
            setDisabledButton(false)
            console.log(disableButton)
        }else{
            setDisabledButton(true)
        }
    }
    const deleteRack = async (numRack) => {
        try{
            const response = await api.post(`rack/delete/${numRack}`)
            if(response.data.success){
                Swal.fire({
                    text:"Rack supprimé avec succès",
                    icon:"success",
                    showConfirmButton: false,
                    timer:1500
                })
                fetchRack()
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

    const onDeleteClick = (numRack) => {
        Swal.fire({
            text:"Etes-vous sûr(e) de vouloir supprimer le rack "+numRack+" ? Cela pourrait entraîner une suppression de tous ses descendants",
            confirmButtonText:"Oui",
            showCancelButton:true,
            cancelButtonText:"Non",
            icon: "question"
        }).then((result)=>{
            if(result.isConfirmed) deleteRack(numRack)
        })
    }

    const onRowClick = (value) => {
        setNumRack(value)
        
    }
    const addPart = () => {
        console.log("clicked "+numRack)

    }
    const resetValues = () => {
        console.log("")
    }
    const handleRangee = (e) => {
        const inputValue = e.target.value
        const numericValue = inputValue.replace(/[^0-9]/g, "")
        setNbRang(numericValue)
    }
    const handleLargeur = (e) => {
        let inputValue = e.target.value;
        inputValue = inputValue.replace(/,/g, ".");
        const floatValue = inputValue.replace(/[^0-9.]/g, "").replace(/(\..*?)\./g, "$1");
        setLargeur(floatValue);
      };
      const handleHauteur = (e) => {
        let inputValue = e.target.value;
        inputValue = inputValue.replace(/,/g, ".");
        const floatValue = inputValue.replace(/[^0-9.]/g, "").replace(/(\..*?)\./g, "$1");
        setHauteur(floatValue);
      };
      const handleProfondeur = (e) => {
        let inputValue = e.target.value;
        inputValue = inputValue.replace(/,/g, ".");
        const floatValue = inputValue.replace(/[^0-9.]/g, "").replace(/(\..*?)\./g, "$1");
        setProfondeur(floatValue);
      };
      const handlePoids = (e) => {
        let inputValue = e.target.value;
        inputValue = inputValue.replace(/,/g, ".");
        const floatValue = inputValue.replace(/[^0-9.]/g, "").replace(/(\..*?)\./g, "$1");
        setChargeMax(floatValue);
      };
    return(
        <>
        <Menu/>
        <div className="page-right-side d-flex flex-column align-items-center">
            <Title
                value="Racks"/>
            
            <div className="d-flex flex-row justify-content-between" style={{width:"100%"}}>
                <div className="me-3" style={{width:"35%"}}>
                    <form method="POST" onSubmit={createRack}>
                        <div className="d-flex flex-row justify-content-start align-items-center mb-3" style={{width:"100%"}}>
                            <div  className="me-3" style={{width:"50%"}}>
                                <label className="form-label">Dépot <span className="requiredStar"><sup>*</sup></span></label>
                                <select className="form-select" onChange={onSelectDepotChange} >
                                    <option value="0"></option>
                                    { 
                                            (listDepot.length == 0) ? <option value="0" style={{fontStyle:"italic",color:"grey"}} disabled>Aucun dépot existant</option> :

                                            listDepot.map((depot,depotIndex)=>(
                                                <option key={depotIndex} value={depot.id}>{`Dépot ${depot.num_depot}`}</option> 
                                            ))

                                        }
                                </select>
                            </div>
                            <div style={{width:"50%"}}>
                                <label className="form-label">Couloir <span className="requiredStar"><sup>*</sup></span></label>
                                <select className="form-select" onChange={onSelectCouloir}>
                                    <option value="0"></option>
                                {
                                    ((listeCouloir == null) || (listeCouloir.length == 0)) ? <option value="0" style={{fontStyle:"italic",color:"grey"}} disabled>Aucun couloir existant</option>:
                                    listeCouloir.map((couloir, couloirIndex)=>(
                                        <option key={couloirIndex} value={couloir.num_couloir}>{couloir.nom_couloir}</option>
                                    ))
                                }
                                </select>
                            </div>
                        </div>
                        <div className="d-flex flex-row justify-content-start align-items-center mb-3" style={{width:"100%"}}>
                            <div className="me-3" style={{width:"50%"}}>
                                <label className="form-label d-flex flex-row">
                                    Nombre de niveaux <span className="requiredStar"><sup>*</sup></span>
                                    <HoverCard.Root>
                                <div className="ms-2">
                                <HoverCard.Trigger asChild> 
                                <i className="bi bi-question-circle" style={{fontWeight:"bold",fontSize:"10pt",color:"#6e6e6e"}}></i>
                                </HoverCard.Trigger>
                                </div>
                                <HoverCard.Portal>
                                    <HoverCard.Content className="hoverCard 3" side="right">
                                        <div></div>
                                        <div></div>
                                        <img src={rackNiveau} className="img-fluid" style={{height:"300px",width:"300px",borderRadius:"8px"}} alt="Aucun resultat"/>
                                   
                                    </HoverCard.Content>
                                   
                                </HoverCard.Portal>
                            </HoverCard.Root>
                                </label>
                                <input type="text" className="form-control " min={1} value={nbNiveau} onChange={onNbNiveauChange} ></input>
                            </div>
                            <div style={{width:"50%"}}>
                                <label className="form-label d-flex flex-row">
                                    Nombres de rangées <span className="requiredStar"><sup>*</sup></span>
                                    <HoverCard.Root>
                                <div className="ms-2">
                                <HoverCard.Trigger asChild> 
                                <i className="bi bi-question-circle" style={{fontWeight:"bold",fontSize:"10pt",color:"#6e6e6e"}}></i>
                                </HoverCard.Trigger>
                                </div>
                                <HoverCard.Portal>
                                    <HoverCard.Content className="hoverCard 3" side="right">
                                        <div></div>
                                        <div></div>
                                        <img src={rackRangee} className="img-fluid" style={{height:"300px",width:"300px",borderRadius:"8px"}} alt="Aucun resultat"/>
                                   
                                    </HoverCard.Content>
                                   
                                </HoverCard.Portal>
                            </HoverCard.Root>
                                </label>
                                <input type="text" className="form-control" min={1} value={nbRang} onChange={handleRangee} ></input>
                            </div>
                        </div>
                        <label className="form-label d-flex flex-row">
                            Largeur d'une case (en m)
                            <HoverCard.Root>
                                <div className="ms-2">
                                <HoverCard.Trigger asChild> 
                            <i className="bi bi-question-circle" style={{fontWeight:"bold",fontSize:"10pt",color:"#6e6e6e"}}></i> 
                                </HoverCard.Trigger>
                                </div>
                                <HoverCard.Portal>
                                    <HoverCard.Content className="hoverCard 1" side="right">
                                        <div></div>
                                        <div></div>
                                        <img src={rackL} className="img-fluid" style={{height:"300px",width:"300px",borderRadius:"8px"}} alt="Aucun resultat"/>
                                   
                                    </HoverCard.Content>
                                   
                                </HoverCard.Portal>
                            </HoverCard.Root>
                        </label>
                        <input type="text" className="form-control mb-3" value={largeur} onChange={handleLargeur} ></input>
                        <label className="form-label d-flex flex-row">
                            Hauteur d'une case (en m)
                            <HoverCard.Root>
                                <div className="ms-2">
                                <HoverCard.Trigger asChild> 
                            <i className="bi bi-question-circle" style={{fontWeight:"bold",fontSize:"10pt",color:"#6e6e6e"}}></i>
                                </HoverCard.Trigger>
                                </div>
                                <HoverCard.Portal>
                                    <HoverCard.Content className="hoverCard 2" side="right">
                                        <div></div>
                                        <div></div>
                                        <img src={rackH} className="img-fluid" style={{height:"300px",width:"300px",borderRadius:"8px"}} alt="Aucun resultat"/>
                                    </HoverCard.Content>
                                   
                                </HoverCard.Portal>
                            </HoverCard.Root>
                        </label>
                        <input type="text" className="form-control mb-3" value={hauteur} onChange={handleHauteur} ></input>
                        <label className="form-label d-flex flex-row">
                            Profondeur d'une case (en m)
                            <HoverCard.Root>
                                <div className="ms-2">
                                <HoverCard.Trigger asChild> 
                                <i className="bi bi-question-circle" style={{fontWeight:"bold",fontSize:"10pt",color:"#6e6e6e"}}></i>
                                </HoverCard.Trigger>
                                </div>
                                <HoverCard.Portal>
                                    <HoverCard.Content className="hoverCard 3" side="right">
                                        <div></div>
                                        <div></div>
                                        <img src={rackP} className="img-fluid" style={{height:"300px",width:"300px",borderRadius:"8px"}} alt="Aucun resultat"/>
                                   
                                    </HoverCard.Content>
                                   
                                </HoverCard.Portal>
                            </HoverCard.Root>
                        </label>
                        <input type="text" className="form-control mb-3" value={profondeur} onChange={handleProfondeur} ></input>
                        <label className="form-label">Charge maximale supportée par le rack (en kg)</label>
                        <input type="text" className="form-control mb-3" value={chargeMax} onChange={handlePoids} ></input>
                        <div className="d-flex flex-column">
                            <Button value="Ajouter un rack" icon="plus-lg" disable={disableButton}></Button>
                            <Button value="Annuler" type="secondary" icon="arrow-counterclockwise" disable={disableButton}></Button>
                        </div>
                    </form>
                </div>
                <div className="table-responsive tableau-container ms-2" style={{width:"65%",height:"100%"}}>
                    <div className="ms-3 mb-2 resultatCount">{listRack.length} résultats trouvés</div>
                    <table className={  (listRack.length == 0)  ? "table tableau" : "table tableau table-hover" }>
                            <thead>
                                <tr>
                                    <th>Numéro rack</th>
                                    <th>Rangées</th>
                                    <th>Niveaux</th>
                                    <th>Capacité case (en m<sup>3</sup>)</th>
                                    <th>Charge case (en kg)</th>
                                    <th className="col-2"></th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                            (listRack.length == 0) ? 
                            <tr>
                                <td colSpan={6} style={{textAlign:"center"}}><NoResult/></td>
                            </tr> : 
                            listRack.map((rack, rackIndex)=> (
                                
                                <tr key={rackIndex} onDoubleClick={() => onRowClick(rack.num_rack)}>
                                    <td>{rack.num_rack_dans_couloir}</td>                        
                                    <td>{rack.nb_rangee}</td>
                                    <td>{rack.nb_niveau}</td>
                                    <td>{(rack.volume_case).toFixed(2)}</td>
                                    <td>{(rack.charge_max_case).toFixed(2)}</td>
                                    <td className="col-2">
                                        <Dialog.Root>
                                            <Dialog.Trigger asChild>
                                                <button style={{backgroundColor:"transparent",border:"none"}}>
                                                <i className="bi bi-pencil-square updateButton" onClick={() => setNumRack(rack.num_rack)}></i>
                                                </button>
                                            </Dialog.Trigger>
                                            <Dialog.Portal>
                                                <Dialog.Content className="dialog">
                                                    <Dialog.Title className="dialogHeader title">Ajouter des parties</Dialog.Title>
                                                    <Dialog.Description></Dialog.Description>
                                                    <div className="dialogBody">
                                                        <label className="form-label">Nombre de niveaux</label>
                                                        <input type="number" className="form-control" value={nbNiveauAdd} onChange={(e)=> setNbNiveauAdd(e.target.value)}/>
                                                        <label className="form-label">Nombre de rangées</label>
                                                        <input type="number" className="form-control" value={nbRangeeAdd} onChange={()=> setNbRangeeAdd(e.target.value)}/>
                                                    </div>
                                                    <Dialog.Close asChild>
                                                        <button className="btn btn-secondary">Annuler</button>
                                                    </Dialog.Close>
                                                    <Dialog.Close asChild>
                                                        <Button value="Ajouter" onclick={addPart()}/>
                                                    </Dialog.Close>
                                                    <Dialog.Close asChild>
                                                        <div className="closeDialog col-1">
                                                            <i className="bi bi-x-circle-fill closeSign"></i>
                                                        </div>
                                                    </Dialog.Close>
                                                </Dialog.Content>
                                            </Dialog.Portal>
                                        </Dialog.Root>                   
                                        <DeleteButton onclick={() => onDeleteClick(rack.num_rack)}/>
                                                     
                                    </td>
                                </tr>

                            ))
                    }
                            </tbody>
                    </table>
                </div>                
            </div>
        </div>
        </>
        
    )
}