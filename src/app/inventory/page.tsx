"use client";

import { useState, useMemo } from "react";
import Card from "@/components/Card";
import BottomButton from "@/components/BottomButton";
import ImageCard from "@/components/ImageCard";
import DatePicker from "@/components/DatePicker";
import OrderedProducts from "@/components/OrderedProducts";
import { fetchProducts } from "@/constants/api";
import { Product } from "@/types/Product";

const Inventory = () => {
  const products: Product[] = useMemo(fetchProducts, []);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  return (
    <div className="page">
      <h1>Inventario</h1>
      <p>Contenido de la sección Inventario.</p>

      <DatePicker value={selectedDate} onChange={setSelectedDate} />

      <Card>
        <div>
          <p>
            <strong>Pedido #<span style={{ fontWeight: "bold" }}>12376</span></strong>
          </p>
          <p>
            Blvd. Guadalupe Hinojosa de Murat 1100,<br />
            71248 San Raymundo Jalpan, Oax.
          </p>
        </div>
      </Card>

      <OrderedProducts products={products} />

      <BottomButton onClick={() => alert("¡Acción ejecutada!")}>
        Continuar
      </BottomButton>

      <div style={{ marginTop: "1.5rem" }}>
        <ImageCard imageSrc="/file.svg"   text="Harina de Plátano verde" type="small" />
        <br />
        <ImageCard imageSrc="/globe.svg"  text="Nueva producción"        type="large" />
        <br />
        <ImageCard imageSrc="/window.svg" text="Frijol"                  type="square" />
      </div>

      <div style={{ height: "150px" }} />
    </div>
  );
};

export default Inventory;
