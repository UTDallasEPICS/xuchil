"use client";
import Card from "@/components/Card";

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

    </div>
  );
};

export default ProcessControl;
  