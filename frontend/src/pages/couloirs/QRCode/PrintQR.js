import React, { useEffect, useState , useRef} from "react";
import { useLocation } from "react-router-dom";
import {Document, Page, View, Text,PDFViewer, StyleSheet, Image} from "@react-pdf/renderer";
import QRGenerator from "../../../components/QRcode";
import api from "../../../api";

export default function PrintQR(){
      const location = useLocation();
      const data = location.state.emplacements

    return(
        <PDFViewer width="100%" height="1000vh">
            <PDF dataList={data}></PDF>
        </PDFViewer>
    )
}

function PDF({title="Titre",dataList}){
    const qrRef = useRef(null);
    const [qrImageUrl, setQrImageUrl] = useState(null);
    const [splitedData, setSplitedData] = useState([])
    const styles = StyleSheet.create({
        page: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            padding: 20,
            fontSize: 20,
            letterSpacing: 5,
            fontFamily: 'Helvetica-Bold'
        },
        grid: {
            width: '50%', 
            height: '50%', 
            //border: '1px solid #bfbfbf',
            boxSizing: 'border-box',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            columnGap : 0,
            rowGap : 0
        },
    });

    useEffect(()=>{
        fetchEmplacement();
        
    },[])

    useEffect(() => {
        if (qrRef.current) {
            htmlToImage.toPng(qrRef.current)
                .then((dataUrl) => {
                    setQrImageUrl(dataUrl);
                })
                .catch((error) => {
                    console.error('Error generating image: ', error);
                });
        }
    }, []);

    const fetchEmplacement = async () => {
        try{    
            const response = await api.get('get-by-rack/4B3');
            splitData(dataList);
        }catch(error){

        }
    };

    const splitData = (data) => {
            const result = [];
            for (let i = 0; i < data.length; i += 4) {
                result.push(data.slice(i, i + 4));
            }
           console.log(result);
           setSplitedData(result);
        
    };
    return(
        <>
        <Document>
    {
        splitedData.map((dataQuarter, pageIndex) => (
            <Page key={pageIndex} size="A4" style={styles.page}>
                {dataQuarter.map((data, dataIndex) => (
                    <View key={dataIndex} style={styles.grid}>
                        <Image src={`data:image/png;base64,${data.qrcode}`} style={{with:250, height:250}}/>
                        <Text>{data.num_emplacement}</Text>
                    </View>
                ))}
            </Page>
        ))
    }
    </Document>
        </>
        
    )
}