import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

import Home             from './pages/Home';
import Login            from './pages/Login';
import AuthProvider     from './context/useAuth';
import PrivateRoute     from './pages/privateRoute';
import Rack             from './pages/racks/RackAcceuil';
import Sortie           from './pages/operations/Sortie';
import DepotAccueil     from './pages/depot/DepotAccueil';
import ScanQR           from './pages/operations/Operations';
import ScanBarcode      from './pages/operations/ScanBarcode';
import Article          from './pages/article/ArticleAccueil';
import Inventaire       from './pages/article/InventaireScan';
import CouloirAccueil   from './pages/couloirs/CouloirAccueil';
import PrintQR          from './pages/couloirs/QRCode/PrintQR';
import OptimizedList    from './pages/suggestions/OptimizedList';
import Liste            from './pages/suggestions/SuggestionList';
import OperationAccueil from './pages/operations/OperationsAccueil';
import Emplacement      from './pages/emplacements/EmplacementAccueil';
import Suggestions      from './pages/suggestions/SuggestionsAccueil';
import './styles/index.css';

function App(){
    return(
        <Router>
            <AuthProvider>
                <Routes>
                    <Route exact path='/login' element={<Login/>}/>
                    <Route exact path='/' element={<PrivateRoute><Home/></PrivateRoute>}/>
                    <Route exact path='/depot' element={<PrivateRoute><DepotAccueil/></PrivateRoute>}/>
                    <Route exact path='/couloir' element={<PrivateRoute><CouloirAccueil/></PrivateRoute>}/>
                    <Route exact path='/rack' element={<PrivateRoute><Rack/></PrivateRoute>}/>
                    <Route exact path='/emplacement' element={<PrivateRoute><Emplacement/></PrivateRoute>}/>
                    <Route exact path='/imprimer' element={<PrivateRoute><PrintQR/></PrivateRoute>}/>
                    <Route exact path='/article' element={<PrivateRoute><Article/></PrivateRoute>}/>
                    <Route exact path='/scann' element={<PrivateRoute><Inventaire/></PrivateRoute>}/>
                    <Route exact path='/operation' element={<PrivateRoute><OperationAccueil/></PrivateRoute>}/>
                    <Route exact path='/operation/scan-emplacement' element={<PrivateRoute><ScanQR/></PrivateRoute>}/>
                    <Route exact path='/operation/scan-article' element={<PrivateRoute><ScanBarcode/></PrivateRoute>}/>
                    <Route exact path='/operation/sortie' element={<PrivateRoute><Sortie/></PrivateRoute>}/>
                    <Route exact path='/suggestions' element={<PrivateRoute><Suggestions/></PrivateRoute>}/>
                    <Route exact path='/liste/c' element={<PrivateRoute><Liste/></PrivateRoute>}/>
                    <Route exact path='/emplacements-optimisés' element={<PrivateRoute><OptimizedList/></PrivateRoute>}/>
                </Routes>
            </AuthProvider>
        </Router>
    )
}
export default App;