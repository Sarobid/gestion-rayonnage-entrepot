import React,{useEffect,useState} from "react";
import Menu from "../../components/menu";
import Button, { Recherche,OptionsButton,Title, NoResult, EditButton, DeleteButton } from "../../components/UIComponents";
import Swal from 'sweetalert2';
import '../../styles/App.css';
import api from "../../api";

export default function DepotAccueil(){
    const [edit,setEdit]    = useState(false)
    const [depotId,setId]   = useState(0)
    const [depot,setDepot]  = useState([])
    const [num_depot,setNumDepot]   = useState(1)
    const [nom_depot,setNomDepot]   = useState("")
    const [depotInf, setDepotInfo]  = useState([])
    const [listDepot,setListDepot]  = useState([])
    const [contenu_depot,setContenuDepot]  = useState("")
    const [depotArticles,setDepotArticles] = useState([])
    
    useEffect(()=> {
        fetchDepot()
    },[])

    const fetchDepot = async () => {
        try{
            const response  = await api.get('get-all-depot')
            const list      = response.data.depot
            setListDepot(response.data.depot)
            setNumDepot(list[list.length - 1].num_depot + 1)
        }catch(error){
            Swal.fire({
                text:"Impossible d'obtenir la liste des dépots!",
                showConfirmButton: false,
                icon:"error",
                timer: 1500
            })
        }
    }

    const fetchDepotInformations = async (value) => {
        try{
            const response = await api.get(`get-depot-informations/${value}`)

            if(response.data.success == true){
                setDepotInfo(response.data.result)
                setDepotArticles(response.data.articles)
                console.log(response.data.articles)
                console.log(response.data.result)
            }
        }catch(error){
            console.log(error)
        }
    }

    const addDepot = async () => {
        try{
            const response = await api.post('create-depot',{num_depot:num_depot,nom_depot:nom_depot,contenu:contenu_depot})                  
            
            Swal.fire({
                text:"Succès de l'enregistrement!",
                showConfirmButton: false,
                icon:"success",
                timer: 1500
            })
            setNumDepot("")
            setNomDepot("")
            fetchDepot()                             
           
        }catch(error){
            Swal.fire({
                text:"Une erreur est survenue lors de l'enregistrement!",
                showConfirmButton: false,
                icon:"error",
                timer: 1500
            })
        }
    }

    const onEdit = (id,numero,nom,contenu) => {
        setId(id)
        setNumDepot(numero)
        setNomDepot(nom)
        setContenuDepot(contenu)
        setEdit(true)
    }

    const editDepot = async () => {
        try{
            const response = await api.post(`update-depot/${depotId}`,{num_depot:num_depot,nom_depot:nom_depot,contenu_depot:contenu_depot})
            clearInputs()
            Swal.fire({
                title:"Succès de la modification",
                showConfirmButton: false,
                icon:"success",
                timer: 1500
            })
            fetchDepot()
        }catch(error){
            console.log(error)
            Swal.fire({
                title:"Une erreur est survenue lors de la modification",
                showConfirmButton: false,
                timer: 1500
            })
        }
    }

    const deleteDepot = async (value) => {
        try{
            const response = await api.post(`delete-depot/${value}`)
            if(response.data.success == true) console.log("success")
                Swal.fire({
                    text:"Dépot supprimé avec succès",
                    showConfirmButton: false,
                    timer:1500
                })
                fetchDepot()
        }catch(error){
            console.log(error)
            Swal.fire({
                text:"Une erreur est survenue lors de la suppression",
                showConfirmButton: false,
                timer:1500
            })
        }
    }
    const onDeleteDepotClick = (idDepot,numDepot) =>{
        Swal.fire({
            text:"La suppression du dépot "+numDepot+" entrainera la suppression de tous ses descendants, êtes-vous sûr(e) de vouloir supprimer?",
            confirmButtonText:"Oui",
            showCancelButton:true,
            cancelButtonText:"Non",
            icon: "question"
        }).then((result)=>{
            if(result.isConfirmed) deleteDepot(idDepot)
        })
   }
    
    const onRowDoubleClick = (value) => {
        const information                   = document.querySelector(".information");
        const informationBefore             = document.querySelector(".informationBefore");
        informationBefore.style.width       = "0%"
        informationBefore.style.visibility  = "hidden"
        information.style.visibility        = "visible";
        information.style.width             = "100%";
        information.style.transform         = "translateX(0)";
        
        fetchDepotInformations(value)

    }

    const onReturnToList = () => {
        const information       = document.querySelector(".information");
        const informationBefore = document.querySelector(".informationBefore");
        information.style.transform = "translateX(100%)"
        information.style.width     = "0%"
        informationBefore.style.width       = "100%"
        informationBefore.style.visibility  = "visible"
        information.style.visibility        = "hidden" 
    }

    const clearInputs = () => {
        setId(0)
        setNumDepot(listDepot[listDepot.length - 1].num_depot + 1)
        setNomDepot("")
        setContenuDepot("")
        setEdit(false)
    }

    return (
        <>
        <Menu></Menu>
         <div className="page-right-side d-flex flex-column  align-items-start">
            <Title
                value="Dépot"/>
                <div className="infoSlider">
                    <div className="d-flex flex-row informationBefore" style={{width:"100%"}}>
                        <div className="me-4 p-4 card1 depot" style={{height:"380px"}}>
                            <div className="mb-2">
                                <label className="label-form">Numéro dépot  <span className="requiredStar"><sup>*</sup></span></label>
                                <input type="number" className="form-control" value={num_depot} onChange={(e)=> setNumDepot(e.target.value)} readOnly={edit ? true : false}/>
                            </div>
                            <div className="mb-2">
                                <label className="label-form">Nom dépot</label>
                                <input type="text" className="form-control" value={nom_depot} onChange={(e)=> setNomDepot(e.target.value)}/>
                            </div>
                            <div className="mb-2">
                                <label className="label-form">Contenu dépot </label>
                                <textarea className="form-control" value={contenu_depot} onChange={(e)=> setContenuDepot(e.target.value)}/>
                            </div>
                            <div className="d-flex flex-column mt-3">
                            {  (!edit) ?  <Button value="Ajouter un dépot" icon="plus-lg" onclick={addDepot}></Button> : <Button value="Enregistrer" onclick={editDepot}></Button> }
                            <Button value="Annuler" type="secondary" icon="arrow-counterclockwise" onclick={clearInputs}></Button>
                            </div>
                        </div>
                        <div className="tableau-container table-responsive ">
                            <table className="table tableau table-hover">
                                    <thead>
                                        <tr>
                                            <th>Numéro de dépot </th>
                                            <th>Nom du dépot</th>
                                            <th>Contenu du dépot</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    { (listDepot.length == 0) ?
                                        <tr>
                                        <td colSpan={4} style={{textAlign:"center"}}><NoResult/></td>
                                        </tr> :
                                        listDepot.map((depot,depotIndex)=>(
                                            <tr key={depotIndex} onDoubleClick={() => onRowDoubleClick(depot.id)} style={{userSelect:'none'}}>
                                                <td>{depot.num_depot}</td>
                                                <td>{depot.nom_depot}</td>
                                                <td>{depot.contenu_depot}</td>
                                                <td className="col-2">
                                                    <EditButton onclick={() => onEdit(depot.id,depot.num_depot,depot.nom_depot,depot.contenu_depot)}/>
                                                    <DeleteButton onclick={() => onDeleteDepotClick(depot.id,depot.num_depot)}/></td>
                                            </tr>
                                        ))
                                    }

                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="information d-flex flex-column">
                        <div className="return" onClick={onReturnToList}><i className="bi bi-arrow-bar-left me-2"></i>Retourner à la liste</div>
                            <div className="d-flex flex-row justify-content-between" style={{width:"100%",heigth:"100%"}}>
                            <div className="card1 mt-4 pe-5 ps-5 pt-4 pb-4" style={{height:"100%",width:"30%"}}>
                                <div className="d-flex flex-column align-items-center justify-content-center">
                                    <div className="d-flex flex-row align-items-center justify-content-center">
                                    <i className="bi bi-box-seam-fill me-3" style={{color:"#d54916"}}></i>
                                    <p className="mt-3"
                                    style={{
                                        textAlign:"center",
                                        fontWeight:"bold",
                                        color:"#d54916"
                                    }}
                                    > DEPOT {(depotInf[0] != undefined) ? depotInf[0].num_depot : ""} </p>
                                    </div>
                                    <div className="ligne mb-3"></div>
                                </div>                             
                                <div className="table-responsive tableau-container">
                                    <table className="infoTable">
                                        <tbody>
                                            <tr>
                                                <td>Nom</td>
                                                <td>:</td>
                                                <td>{(depotInf[0] != undefined) ? depotInf[0].nom_depot : ""}</td>
                                            </tr>
                                            <tr>
                                                <td>Contenu</td>
                                                <td>:</td>
                                                <td>{(depotInf[0] != undefined) ? depotInf[0].contenu_depot : ""}</td>
                                            </tr>
                                            <tr>
                                                <td>Nombre de couloirs</td>
                                                <td>:</td>
                                                <td>{(depotInf[0] != undefined) ? depotInf[0].nb_couloir : ""}</td>
                                            </tr>
                                            <tr>
                                                <td>Nombre de racks</td>
                                                <td>:</td>
                                                <td>{(depotInf[0] != undefined) ? depotInf[0].nb_rack : ""}</td>
                                            </tr>
                                            <tr>
                                                <td>Nombre d'articles stockés</td>
                                                <td>:</td>
                                                <td>{(depotInf[0] != undefined) ? depotInf[0].nb_article : ""}</td>
                                            </tr>
                                        </tbody>
                                    </table>                        
                                </div>
                                
                            </div>
                            <div className="ms-4" style={{width:"70%"}}>
                                    <div className="d-flex flex-column justify-content-center">
                                    <div className="d-flex flex-row align-items-center justify-content-start">
                                    <i className="bi bi-geo-alt-fill me-3" style={{color:"#d54916"}}></i>
                                    <p className="mt-3"
                                    style={{
                                        textAlign:"center",
                                        fontWeight:"bold",
                                        color:"#d54916"
                                    }}
                                    > Emplacement des articles </p>
                                    </div>
                                        <div className="ligne mb-3"></div>
                                    </div>
                                    <div className="tableau-container table-responsive ">
                            <table className="table tableau table-hover">
                                    <thead>
                                        <tr>
                                            <th>Numéro emplacement </th>
                                            <th>Article</th>
                                            <th>Quantité</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    { (depotArticles.length == 0) ?
                                        <tr>
                                        <td colSpan={3} style={{textAlign:"center"}}><NoResult/></td>
                                        </tr> :
                                        depotArticles.map((depot,depotIndex)=>(
                                            <tr key={depotIndex}>
                                                <td>{depot.sku__num_emplacement}</td>
                                                <td>[{depot.ref_interne}] {depot.designation}</td>
                                                <td>{depot.sku__num_emplacement__quantite}</td>
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
        
        </>
       
    )
}