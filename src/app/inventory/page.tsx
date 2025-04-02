"use client";
import Card from "@/components/Card";
import BottomButton from "@/components/BottomButton";
import ImageCard from "@/components/ImageCard";
import ProductPicker from "@/components/ProductPicker";

const products = [
  { id: 1, name: "Harina de Mezquite", weight: "5kg", image: "/file.svg" },
  { id: 2, name: "Harina de Maíz Negro", weight: "5kg", image: "/file.svg" },
  { id: 3, name: "Harina de Maíz Amarillo", weight: "1kg", image: "/file.svg" },
  { id: 4, name: "Sustituto de Café", weight: "500g", image: "/file.svg" },
];

const Inentory = () => {
  return (
    <div className="page">
      <h1>Inventario</h1>
      <p>Contenido de la sección Inventario.</p>

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

      <div>
        <h1>Producto 1</h1>
        <ProductPicker products={products} />
      </div>

      <div>
        <h1>Producto 2</h1>
        <ProductPicker products={products} />
      </div>

      <div style={{ height: "150px" }} />

    </div>
  );
};

export default Inentory;
  