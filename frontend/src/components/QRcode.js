import React, { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import { Html5QrcodeScanner } from 'html5-qrcode';
import { View } from "@react-pdf/renderer";

function QRGenerator({ data, image = null, width=180, height=180 }) {
  const qrRef = useRef(null);
  const [qrCode, setQrCode] = useState(null);

  useEffect(() => {
    if (qrRef.current) {
      qrRef.current.innerHTML = "";
    }

    const newQrCode = new QRCodeStyling({
      width: width,
      height: height,
      type: "svg",
      data: data,
      image: image,
      dotsOptions: {
        color: "#4267b2",
        type: "rounded"
      },
      backgroundOptions: {
        color: "#ffffff00"
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 20
      }
    });

    newQrCode.append(qrRef.current);
    setQrCode(newQrCode);

    console.log("QR data passed:", data);

    return () => {
      if (qrRef.current) {
        qrRef.current.innerHTML = "";
      }
    };
  }, [data, image, width, height]);

  return <div ref={qrRef}></div>;
}

export default QRGenerator;

