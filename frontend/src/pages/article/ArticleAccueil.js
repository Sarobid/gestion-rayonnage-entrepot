import React,{useState,useEffect} from "react";
import Menu from "../../components/menu";
import api from "../../api";
import Button,{ Dialog, Title } from "../../components/UIComponents";


export default function Article(){
    const [refInterne,setRef]           = useState(""); 
    const [designation,setDesignation]  = useState("");
    const [prixArticle,seArticle]       = useState(0) ;
    const [poidsArticle,setPoids]       = useState(0) ;
    const [volumeArticle,setVolume]     = useState(0) ;
    const [quantiteStock,setQteStock]   = useState(0) ;
    const [quantiteRayon,setQteRayone]  = useState(0) ;
    const [listArticle,setListArticle]  = useState([]);
    const [listArticleOdoo,setListArticleOdoo] = useState([]);
    const [openForm,setOpenForm]        = useState(false)

    useEffect(()=>{
        fetchArticles()
    },[])
    
    const fetchArticles = async () => {
        try{
            const response = await api.get('get-all-article');

            if(response.data.success == true){
                setListArticle(response.data.article)
            }

        }catch(error){
            console.log(error)
        }
    }

    useEffect(()=>{
        const fetchArticlesOdoo = async () =>{
            try{
                const response = await api.get(`get-specific-article?ref_interne=${refInterne}`)
                if(response.data.status == "success"){
                    setListArticleOdoo(response.data.data)
                    console.log(response.data.data)
                }

            }catch(error){
                console.log(error)
            }   
        }
        fetchArticlesOdoo();
    },[refInterne])

    const onAddClick = () =>{
        setOpenForm(true)
        console.log(openForm)
    }
    useEffect(() => {
        console.log('openForm has changed:', openForm);
    }, [openForm]);

    const onRowDoubleClick = (value) =>{
        console.log("Clicked"+value)
        const information = document.querySelector(".information");
        const tableau = document.querySelector(".tableau");
        setRef(value)
        tableau.style.visibility = "hidden"
        information.style.transform = "translateX(-100%)"
        information.style.width = "100%"
       
    }
    
    const onReturnToList = () =>{
        const information = document.querySelector(".information");
        const tableau = document.querySelector(".tableau");
        information.style.transform = "translate(100%)";
        information.style.width = "0%";
        tableau.style.visibility = "visible"
       
       
        
    }
    const dialogContent = (
       
        <form>
            <div className="mb-2">
                <label className="form-label">Référence interne</label>
                <input className="form-control"></input>
            </div>
            <div className="mb-2">
                <label className="form-label">Désignation</label>
                <input className="form-control"></input>
            </div>
            <div className="mb-2">
                <label className="form-label">Prix</label>
                <div className="input-group">
                <input className="form-control"></input>
                <span className="input-group-text" id="basic-addon2">ar</span>
                </div>
            </div>
            <div className="mb-2">
                <label className="form-label">Poids</label>
                <div className="input-group">
                <input className="form-control"></input>
                <span className="input-group-text" id="basic-addon2">g</span>
                </div>
            </div>
            <div className="mb-2">
                <label className="form-label">Volume</label>
                <div className="input-group">
                <input className="form-control"></input>
                <span className="input-group-text" id="basic-addon2">m<sup>3</sup></span>
                </div>
            </div>
            <div className="mb-2">
                <label className="form-label">Quantité en stock</label>
                <input className="form-control"></input>
            </div>
            <div className="mb-2">
                <label className="form-label">Quantité scanné</label>
                <input className="form-control"></input>
            </div>
        </form>
    )
    
    return(
       <>
       <Menu></Menu>
        <div className="page-right-side d-flex flex-column  align-items-start">
            <Title value="Articles"
                onRechercheChange={(e) => setRef(e.target.value)}/>
            <Dialog
                content={dialogContent}
                confirmationValue="Enregistrer"
                title="Ajouter un article"
                open={openForm}
            />
            {/*<Button
                value="Ajouter un article"
                icon = "plus-lg"
                onclick={onAddClick}
            />*/}
            <div className="infoSlider">
                <div className="tableau tableau-container table-responsive ">
                        <table className="table table-hover tableau">
                                <thead>
                                    <tr>
                                        <th>Référence interne</th>
                                        <th>Désignation</th>
                                        <th>Poids (en kg)</th>
                                        <th>Volume (en m<sup>3</sup>)</th>
                                        <th>Quantité en stock</th>
                                        <th>Quantité en rayon</th>
                                    </tr>
                                </thead>
                                <tbody>
                                { (listArticle.length == 0) ?
                                    <tr>
                                    <td colSpan={7} style={{textAlign:"center"}}>Aucun article trouvé</td>
                                    </tr> :
                                    listArticle.map((article,articleIndex)=>(
                                        <tr key={articleIndex} onDoubleClick={()=> onRowDoubleClick(article.ref_interne)} style={{userSelect:'none'}}>
                                            <td>{article.ref_interne}</td>
                                            <td>{article.designation}</td>
                                            <td>{article.poids_article}</td>
                                            <td>{article.volume_article}</td>
                                            <td>{article.quantite_en_stock}</td>
                                            <td>{article.quantite_en_rayon}</td>
                                        </tr>
                                    ))
                                /*listArticleOdoo.map((article,articleIndex)=>(
                                        <tr>
                                            <td><b>{article.default_code}</b></td>
                                            <td>{article.name}</td>
                                            <td>{article.qty_available}</td>
                                            <td>{article.volume}</td>
                                            <td>{article.weight}</td>
                                            <td>{article.barcode}</td>
                                        </tr>
                                ))*/
                                }

                                </tbody>
                        </table>
                </div>
                <div className="information d-flex flex-column">
                    <div className="return" onClick={onReturnToList}><i className="bi bi-arrow-bar-left me-2"></i>Retourner à la liste</div>
                    <div>
                        Hello world {refInterne}

                    </div>
                </div>
            </div>
        </div>
       </>
    )
}