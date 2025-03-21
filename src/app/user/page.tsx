"use client";
import Button from "@/components/Button";
import DeliveryType from "@/components/DeliveryType";
import HeaderXuchil from "@/components/HeaderXuchil";

const User = () => {
    return (
      <div className="page">
        <h1>Usuario</h1>
        <p>Contenido de la sección Usuario.</p>
        <HeaderXuchil/>
        <br />
        <div>
          <Button size="regular" action="primary" onClick={() => alert("Presionado")}>
            Botón 1
          </Button>
          <Button size="small" action="primary" onClick={() => alert("Presionado")}>
            Botón 2
          </Button>
          <Button size="mini" action="primary" onClick={() => alert("Presionado")}>
            Botón 3
          </Button>
        </div>
        <div>
          <Button size="regular" action="secondary" onClick={() => alert("Presionado")}>
            Botón 4
          </Button>
          <Button size="small" action="secondary" onClick={() => alert("Presionado")}>
            Botón 5
          </Button>
          <Button size="mini" action="secondary" onClick={() => alert("Presionado")}>
            Botón 6
          </Button>
        </div>
        <div>
          <Button size="regular" action="negative" onClick={() => alert("Presionado")}>
            Botón 7
          </Button>
          <Button size="small" action="negative" onClick={() => alert("Presionado")}>
            Botón 8
          </Button>
          <Button size="mini" action="negative" onClick={() => alert("Presionado")}>
            Botón 9
          </Button>
        </div>
        <div>
          <Button size="regular" action="inverted" onClick={() => alert("Presionado")}>
            Botón 10
          </Button>
          <Button size="small" action="inverted" onClick={() => alert("Presionado")}>
            Botón 11
          </Button>
          <Button size="mini" action="inverted" onClick={() => alert("Presionado")}>
            Botón 12
          </Button>
        </div>
        <br />
        <div>
          <DeliveryType type="icon" variant="personal"/>
          <DeliveryType type="badge" variant="personal"/>
          <DeliveryType type="picker" variant="personal"/>
        </div>
        <br />
        <div>
          <DeliveryType type="icon" variant="mail"/>
          <DeliveryType type="badge" variant="mail"/>
          <DeliveryType type="picker" variant="mail"/>
        </div>
        <br />
        <div>
          <DeliveryType type="icon" variant="consignment"/>
          <DeliveryType type="badge" variant="consignment"/>
          <DeliveryType type="picker" variant="consignment"/>
        </div>
      </div>
    );
  };
  
  export default User;
  