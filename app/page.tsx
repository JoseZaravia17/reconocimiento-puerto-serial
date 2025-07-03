// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";
// import { Button } from "@/components/ui/button";
// import { useState } from "react";

// // Extiende la interfaz Navigator para incluir 'serial'
// declare global {
//   interface Navigator {
//     serial: any;
//   }
// }

// export default function SerialReader() {
//   const [peso, setPeso] = useState("");

//   const handleSerialConnect = async () => {
//     try {
//       // if (ports.length > 0) {
//       //   console.log('ya autorizado');
//       //   port = ports[0];
//       // } else {
//       //port = await navigator.serial.requestPort({ filters: [] });
//       // }
//       const port = await navigator.serial.requestPort();
//       await port.open({ baudRate: 9600 });
//       // await port.open({ baudRate: 1200 });

//       const decoder = new TextDecoderStream();
//       port.readable.pipeTo(decoder.writable);

//       const inputStream = decoder.readable;
//       console.log(inputStream);
//       const reader = inputStream.getReader();
//       console.log(reader);

//       while (true) {
//         console.log("BUCLE")
//         const { value, done } = await reader.read();
//         console.log("VERIFICACION", done)
//         if (done) break;
//         if (value) {
//           console.log("Peso:", value);
//           setPeso(value);
//         }
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <div className="mt-44 text-center">
//       {peso &&
//         <div className="text-7xl font-bold tracking-tighter mb-4 w-fit h-auto mx-auto rounded-md border-2 border-dashed border-black">
//           <p className="mb-4 mx-5">Peso: {peso}</p>
//         </div>
//       }
//       <Button onClick={handleSerialConnect}>Comenzar Lectura de Balanza</Button>
//     </div>
//   );
// }


/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

declare global {
  interface Navigator {
    serial: any;
  }
}

export default function SerialReader() {
  const [peso, setPeso] = useState("");

  const handleSerialConnect = async () => {
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });

      const decoder = new TextDecoderStream();
      port.readable.pipeTo(decoder.writable);
      const inputStream = decoder.readable;
      const reader = inputStream.getReader();

      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (!value) continue;
        console.log(value)

        for (let i = 0; i < value.length; i++) {
          const char = value[i];

          if (char === ",") {
            // Fin 
            const pesoFinal = procesarFrame(buffer);
            if (pesoFinal) {
              setPeso(pesoFinal);
              console.log("Peso:", pesoFinal);
            }
            buffer = ""; 
          } else {
            buffer += char;
          }
        }
      }

      await reader.releaseLock();
    } catch (err) {
      console.error("Error de conexión serial:", err);
    }
  };

  function procesarFrame(frame: string): string | null {
    // Ejemplo frame: "0   823   000 ?"
    const clean = frame.replace(/\s+/g, " ").trim(); 
    // ["0", "823", "000", "?"]
    const partes = clean.split(" "); 

    const pesoRaw = partes.find(p => /^\d+$/.test(p) && p !== "000" && p !== "0");
    if (!pesoRaw) return null;

    const pesoFinal = parseInt(pesoRaw) / 100;
    return pesoFinal.toFixed(2);
  }

  return (
    <div className="mt-44 text-center">
      {peso && (
        <div className="text-7xl font-bold tracking-tighter mb-4 w-fit h-auto mx-auto rounded-md border-2 border-dashed border-black">
          <p className="mb-4 mx-5">Peso: {peso} kg</p>
        </div>
      )}
      <Button onClick={handleSerialConnect}>
        Comenzar Lectura de Balanza
      </Button>
    </div>
  );
}
