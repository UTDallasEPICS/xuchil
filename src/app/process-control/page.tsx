"use client";
import Card from "@/components/Card";
import BottomButton from "@/components/BottomButton";
import ImageCard from "@/components/ImageCard";

const ProcessControl = () => {
  return (
    <div className="page">
      <h1>Control de procesos</h1>
      <p>Contenido de la sección Control de procesos.</p>

      <Card>
      <div>
        <p><strong>Pedido #<span style={{ fontWeight: "bold" }}>12376</span></strong></p>
        <p>
          Blvd. Guadalupe Hinojosa de Murat 1100,<br />
          71248 San Raymundo Jalpan, Oax.
        </p>
      </div>
      </Card>

      <BottomButton onClick={() => alert("¡Acción ejecutada!")}>
        Continuar
      </BottomButton>

      <div>
        <ImageCard imageSrc="/file.svg" text="Harina de Plátano verde" type="small" />
        <p></p>
        <ImageCard imageSrc="/globe.svg" text="Nueva producción" type="large" />
        <p></p>
        <ImageCard imageSrc="/window.svg" text="Frijol" type="square" />
      </div>

      

    </div>
  );
};

export default ProcessControl;
  