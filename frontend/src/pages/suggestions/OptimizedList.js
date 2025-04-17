import React, { useState, useEffect } from "react";
import Menu from "../../components/menu";
import Button,{NoResult, Title} from "../../components/UIComponents";
import * as HoverCard from "@radix-ui/react-hover-card";
import api  from "../../api";

export default function OptimizedList(){
    const [listEmplacements,setListeEmplacement] = useState([])
    const [listDepot,setListDepot] = useState([])
    const [numDepot,setNumDepot] = useState(8)


    useEffect(()=>{
        fetchListeEmplacement()
    },[numDepot])

    const fetchListeEmplacement = async () => {
        try{
            if(numDepot > 0){
                const response = await api.get(`proposition-emplacement/${numDepot}`)
                
    
                const filteredResult = response.data.result.filter(item => 
                item.result.some(subItem => subItem.racks.length > 0)
                );
                setListeEmplacement(filteredResult)
                console.log(filteredResult)
            }else{
                setListeEmplacement([])
            }
           
        }catch(error){
            console.log(error)
        }
    }

    const onSelectChange = (e) => {
        setNumDepot(e.target.value)
       
    }

    useEffect(()=>{
        const fetchDepot = async () => {
            try{
                const response = await api.get('get-all-depot')
                if(response.data.success == true){
                    setListDepot(response.data.depot)
                }
            }catch(error){
    
            }
        }
        fetchDepot();
    },[])


    return(
        <>
             <Menu/>
             <div className="page-right-side d-flex flex-column align-items-start">
             <div className="titre h4 mb-4" style={{fontWeight:"bolder"}}>
                Proposition d'arrangement
            </div>
               <div style={{fontSize:"11pt",width:"100%"}}>
                    Les arrangements sont proposés selon la fréquence de sortie des articles disponibles dans le dépot. Les plus demandés doivent être facilement et rapidement accessibles, c'est-à-dire plus proche de la sortie. 
               </div>
               <div className="d-flex flex-row align-items-center" style={{width:"50%"}}>
                    <div className="mt-2">
                        <label className="form-label" style={{fontSize:"11pt"}}>Sélectionnez un dépot pour voir les résultats.</label>
                        <select className="form-select" onChange={onSelectChange} style={{width:"100%"}} >
                            {/*<option value="0"></option>*/}
                            { 
                                    (listDepot.length == 0) ? <option value="0" style={{fontStyle:"italic",color:"grey"}} disabled>Aucun dépot existant</option> :
                                    listDepot.map((depot,depotIndex)=>(
                                        <option key={depotIndex} value={depot.id}>{`Dépot ${depot.num_depot}`}</option> 
                                    ))
                                }
                        </select>
                    </div>
                </div>
                <div className="couloirs mt-4" style={{width:"100%",height:"100%"}}>
                    <div id="carouselCouloirs" className="carousel slide">
                    {
                        (listEmplacements.length == 0) ? 
                        <div className="carousel-inner">
                            <div className="carousel-content d-flex flex-row align-items-center justify-content-center">
                               <NoResult size="normal"/>
                            </div>
                        </div> : 
                        
                        (listEmplacements.length > 1) ?
                    <>
                    
                            <button className="carousel-control-prev" type="button" data-bs-target="#carouselCouloirs" data-bs-slide="prev">
                                <i className="bi bi-chevron-left" style={{color:"black",fontSize:"16pt",fontWeight:"bold"}}></i>
                            </button>
                            <button className="carousel-control-next" type="button" data-bs-target="#carouselCouloirs" data-bs-slide="next">
                                <i className="bi bi-chevron-right" style={{color:"black",fontSize:"16pt",fontWeight:"bold"}}></i>
                            </button>
                            <div className="carousel-inner">
                                 
                                 {
                                    listEmplacements[0].result.map((data,dataIndex)=>(
                                        <div  key={dataIndex} className={ (dataIndex == 0) ? 'carousel-item active' : 'carousel-item '}>
                                         <div className="title mb-4"
                                            style={{fontSize:"24pt"}}
                                        >Couloir {listEmplacements[0].nom_couloir}</div>
                                        <div className="d-flex flex-row flex-wrap">
                                            <div className="rack p-3  d-flex flex-column align-items-center justify-content-center">
                                                <div className="d-flex flex-column align-items-center justify-content-center">
                                                <p className="mt-3"
                                                    style={{
                                                        textAlign:"center",
                                                        fontWeight:"bold",
                                                        color:"#d54916"
                                                    }}
                                                > RACK {data.num_rack_dans_couloir} </p>
                                                <p style={{
                                                    textAlign:"center",
                                                    color:"#d54916",
                                                    fontSize:"10pt"
                                                }}>{`${data.nb_niveau_rack} niveau(x), ${data.nb_rangee_rack} rangée(s)`}</p>
                                                <div className="ligne mb-3"></div>
                                                </div>
                                                <HoverCard.Root>
                                                    <HoverCard.Trigger asChild>
                                                    <div className="gridContainer mt-4 mb-4"
                                                        style={{
                                                            display:"grid",
                                                            gap:"3px",
                                                            gridTemplateRows:`repeat(${data.nb_niveau_rack}, 1fr)`,
                                                            gridTemplateColumns: `repeat(${data.nb_rangee_rack}, 1fr)`,
                                                            justifyItems:"center",
                                                            alignItems:"center",
                                                            boxSizing:"content-box"
                                                        

                                                        }}
                                                    >
                                                        {
                                                        Array.from({ length: data.nb_niveau_rack }).map((_, rowIndex) =>
                                                            Array.from({ length: data.nb_rangee_rack }).map((_, colIndex) => {
                                                                var niveau = data.nb_niveau_rack - rowIndex - 1
                                                                const cellData = data.racks.find(
                                                                    (rack) =>
                                                                        rack.niveau === niveau && rack.rangee ==  String.fromCharCode(65 + colIndex)
                                                                );
                                                                return (
                                                                    <div
                                                                        key={`${rowIndex}-${colIndex}`}
                                                                        style={{
                                                                            width: "30px",
                                                                            height: "30px",
                                                                            background: cellData ? "rgb(129, 204, 148)" : "#f1f1f1",
                                                                            borderRadius:"6px",
                                                                        }}
                                                                        
                                                                    >
                                                                        {/*cellData ? (
                                                                            <>
                                                                                <strong>{cellData.ref_interne}</strong>
                                                                                <br />
                                                                                {cellData.designation}
                                                                            </>
                                                                        ) : (
                                                                            "Empty"
                                                                        )*/}
                                                                    </div>
                                                                );
                                                            }),
                                                        )}
                                                        
                                                    </div>
                                                    </HoverCard.Trigger>
                                                    <HoverCard.Portal>
                                                        <HoverCard.Content className="hoverCard" side="right">
                                                            <div 
                                                        style={{
                                                            display:"grid",
                                                            gap:"5px",
                                                            gridTemplateRows:`repeat(${data.nb_niveau_rack}, 1fr)`,
                                                            gridTemplateColumns: `repeat(${data.nb_rangee_rack}, 1fr)`,
                                                            justifyItems:"center",
                                                            alignItems:"center",
                                                            boxSizing:"content-box"
                                                        

                                                        }}
                                                    >{
                                                        Array.from({ length: data.nb_niveau_rack }).reverse().map((_, rowIndex) =>
                                                            Array.from({ length: data.nb_rangee_rack }).map((_, colIndex) => {
                                                                var niveau = data.nb_niveau_rack - rowIndex - 1
                                                                const cellData = data.racks.find(
                                                                    (rack) =>
                                                                        rack.niveau === niveau && rack.rangee ==  String.fromCharCode(65 + colIndex)
                                                                );
                                                                return (
                                                                    <div className="d-flex flex-column justify-content-center align-items-center"
                                                                        key={`${rowIndex}-${colIndex}`}
                                                                        style={{
                                                                            width: "150px",
                                                                            height: "150px",
                                                                            background: cellData ? "rgb(129, 204, 148)" : "#f1f1f1",
                                                                            borderRadius:"6px",
                                                                        }}
                                                                        
                                                                    >
                                                                        {cellData ? (
                                                                            <>
                                                                                <strong>{cellData.ref_interne}</strong>
                                                                                <br />
                                                                                {cellData.designation}
                                                                            </>
                                                                        ) : (
                                                                            "Libre"
                                                                        )}
                                                                    </div>
                                                                );
                                                            }),
                                                        )}
                                                        </div>
                                                        </HoverCard.Content>
                                                    </HoverCard.Portal>
                                                </HoverCard.Root>
                                            </div>
                                        </div>        
                                        </div>
                                    ))
                                }
                                </div>                                                   
                    
                    </> : <>
                        <div className="carousel-inner">
                            <div className="carousel-content justify-content-between">
                                <div className="title mb-4"
                                    style={{fontSize:"24pt"}}
                                >Couloir {listEmplacements[0].nom_couloir}</div>
                                <div className="d-flex flex-row flex-wrap">
                                {
                                    listEmplacements[0].result.map((data,dataIndex)=>(
                                        <div key={dataIndex} className=" rack p-3  d-flex flex-column align-items-center justify-content-center">
                                            <div className="d-flex flex-column align-items-center justify-content-center">
                                             <p className="mt-3"
                                                style={{
                                                    textAlign:"center",
                                                    fontWeight:"bold",
                                                    color:"#d54916"
                                                }}
                                            > RACK {data.num_rack_dans_couloir} </p>
                                             <p style={{
                                                textAlign:"center",
                                                color:"#d54916",
                                                fontSize:"10pt"
                                             }}>({data.nb_niveau_rack} niveaux, {data.nb_rangee_rack} rangées)</p>
                                             <div className="ligne mb-3"></div>
                                             </div>
                                             <HoverCard.Root>
                                                <HoverCard.Trigger asChild>
                                                <div className="gridContainer mt-4 mb-4"
                                                    style={{
                                                        display:"grid",
                                                        gap:"3px",
                                                        gridTemplateRows:`repeat(${data.nb_niveau_rack}, 1fr)`,
                                                        gridTemplateColumns: `repeat(${data.nb_rangee_rack}, 1fr)`,
                                                        justifyItems:"center",
                                                        alignItems:"center",
                                                        boxSizing:"content-box"
                                                    

                                                    }}
                                                >
                                                    {
                                                    Array.from({ length: data.nb_niveau_rack }).reverse().map((_, rowIndex) =>
                                                        Array.from({ length: data.nb_rangee_rack }).map((_, colIndex) => {
                                                            var niveau = data.nb_niveau_rack - rowIndex - 1
                                                            const cellData = data.racks.find(
                                                                (rack) =>
                                                                    rack.niveau === niveau && rack.rangee ==  String.fromCharCode(65 + colIndex)
                                                            );
                                                            return (
                                                                <div
                                                                    key={`${rowIndex}-${colIndex}`}
                                                                    style={{
                                                                        width: "30px",
                                                                        height: "30px",
                                                                        background: cellData ? "rgb(129, 204, 148)" : "#f1f1f1",
                                                                        borderRadius:"6px",
                                                                    }}
                                                                    
                                                                >
                                                                    {/*cellData ? (
                                                                        <>
                                                                            <strong>{cellData.ref_interne}</strong>
                                                                            <br />
                                                                            {cellData.designation}
                                                                        </>
                                                                    ) : (
                                                                        "Empty"
                                                                    )*/}
                                                                </div>
                                                            );
                                                        }),
                                                    )}
                                                    
                                                </div>
                                                </HoverCard.Trigger>
                                                <HoverCard.Portal>
                                                    <HoverCard.Content className="hoverCard" side="right">
                                                        <div 
                                                    style={{
                                                        display:"grid",
                                                        gap:"5px",
                                                        gridTemplateRows:`repeat(${data.nb_niveau_rack}, 1fr)`,
                                                        gridTemplateColumns: `repeat(${data.nb_rangee_rack}, 1fr)`,
                                                        justifyItems:"center",
                                                        alignItems:"center",
                                                        boxSizing:"content-box"
                                                    

                                                    }}
                                                >{
                                                    Array.from({ length: data.nb_niveau_rack }).reverse().map((_, rowIndex) =>
                                                        Array.from({ length: data.nb_rangee_rack }).map((_, colIndex) => {
                                                            var niveau = data.nb_niveau_rack - rowIndex - 1
                                                            const cellData = data.racks.find(
                                                                (rack) =>
                                                                    rack.niveau === niveau && rack.rangee ==  String.fromCharCode(65 + colIndex)
                                                            );
                                                            return (
                                                                <div className="d-flex flex-column justify-content-center align-items-center"
                                                                    key={`${rowIndex}-${colIndex}`}
                                                                    style={{
                                                                        width: "150px",
                                                                        height: "150px",
                                                                        background: cellData ? "rgb(129, 204, 148)" : "#f1f1f1",
                                                                        borderRadius:"6px",
                                                                    }}
                                                                    
                                                                >
                                                                    {cellData ? (
                                                                        <>
                                                                            <strong>{cellData.ref_interne}</strong>
                                                                            <br />
                                                                            {cellData.designation}
                                                                        </>
                                                                    ) : (
                                                                        "Libre"
                                                                    )}
                                                                </div>
                                                            );
                                                        }),
                                                    )}
                                                    </div>
                                                    </HoverCard.Content>
                                                </HoverCard.Portal>
                                            </HoverCard.Root>
                                                
                                        </div>
                                    ))
                                }
                                </div>
                            </div>
                        </div>
                        </>
                    }
                </div>
                </div>

             </div>
        </>
    )
}