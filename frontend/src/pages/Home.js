import React, { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { NavLink } from "react-router-dom";
import Menu from "../components/menu";
import picking from "../img/picking.webp";
import warehouse from "../img/warehouse.webp";
import qr from "../img/qr.jpg";
import barcode from "../img/barcode.jpg"

function Home() {
  const [greeting, setGreeting] = useState("");
  const {userDisplayName} = useAuth()

  useEffect(() => {
    const hourToday = new Date().getHours();
    
    if (hourToday < 18) {
      setGreeting("Bonjour");
    } else {
      setGreeting("Bonsoir");
    }
  }, []);

  return (
    <>
      <Menu/>
      <div className="page-right-side d-flex flex-column  align-items-start">
          <div style={{fontSize:"24pt",fontWeight:"bold",color:"#515151"}}>{greeting} {userDisplayName}</div>
          <div className="d-flex flex-column" style={{width:"100%",height:"100%"}}>
            <div className="d-flex flex-row justify-content-center align-items-center" style={{width:"100%",height:"100%"}}>
              <div className="acceuilCard d-flex">
                <div className="photo">
                  <img src={barcode} className="image "/>
                </div>
                <div className="card-content">
                  <NavLink to='/scann' className="titre">Enregistrez un article</NavLink>
                  <div className="description">
                    Scannez le code-barre des produits avec un douchette pour le relier aux informations de vos articles.
                  </div>
                </div>
              </div>
              <div className="acceuilCard d-flex">
                <div className="photo">
                  <img src={qr} className="image " id="qr"/>
                </div>
                <div className="card-content">
                  <NavLink to='/operation/scan-emplacement' state={{operation:"insert"}} className="titre">Enregistrez l'emplacement d'un article</NavLink>
                  <div className="description">Attribuer un emplacement à votre article à l'aide du code QR de l'endroit et le code-barre de l'article.</div>
                </div>
              </div>
            </div>
            <div className="d-flex flex-row justify-content-center align-items-center" style={{width:"100%",height:"100%"}}>
              <div className="acceuilCard d-flex">
                <div className="photo">
                <img src={picking} className="image "/>
                </div>
                <div className="card-content">
                  <NavLink to='/operation/sortie' className="titre">Récupérez des articles</NavLink>
                  <div className="description">Récupérez vos articles d'une maière plus efficace et rapide.</div>
                </div>
              </div>
              <div className="acceuilCard d-flex">
                <div className="photo">
                  <img src={warehouse} className="image "/>
                </div>
                <div className="card-content">
                  <NavLink to='/suggestions' className="titre">Consultez des suggestions</NavLink>
                  <div className="description">Optimisez la mise en rayon et l'arrangement des vos articles en dépôt pour améliorer la récupération.</div>
                </div>
              </div>
            </div>
          </div>    
      </div>
    </>
  );
}

export default Home;