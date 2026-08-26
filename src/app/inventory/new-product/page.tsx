"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HeaderXuchil from "@/components/HeaderXuchil";
import BottomButton from "@/components/BottomButton";
import TextField from "@/components/TextField";
import styles from "./NewProduct.module.css";
import Button from "@/components/Button";

type Unit = {
  id: number;
  name: string;
};

type ProductCategory = {
  id: number;
  name: string;
};

const NewProductPage = () => {
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState(0);
  const [unitId, setUnitId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const [units, setUnits] = useState<Unit[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);

  const router = useRouter();

  useEffect(() => {
    const loadUnits = async () => {
      const res = await fetch("/api/units", {
        credentials: "include",
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      setUnits(data);
    };

    const loadCategories = async () => {
      const res = await fetch("/api/product-categories", {
        credentials: "include",
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      setCategories(data);
    };

    void loadUnits();
    void loadCategories();
  }, []);

  const handleSubmit = async () => {
    try {
      if (!name.trim()) return;
      if (unitId === null) return;
      if (categoryId === null) return;
  
      let imgUrl: string | undefined;
  
     
      if (image) {
        const formData = new FormData();
        formData.append("file", image);
  
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
  
        if (!uploadRes.ok) throw new Error("Upload failed");
  
        const uploadData = await uploadRes.json();
        imgUrl = uploadData.path;
      }
  
      const res = await fetch("/api/products", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          unitId,
          categoryId,
          imgUrl,
        }),
      });
  
      if (!res.ok) {
        throw new Error(await res.text());
      }
  
      router.push("/inventory/products");
    } catch (err) {
      console.error("Failed to create product", err);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pic = e.target.files?.[0];
    setImage(pic ?? null);
    setPreview(pic ? URL.createObjectURL(pic) : null);
  };

  const handlePhotoClear = () => {
    setImage(null);
    setPreview(null);
    setImageKey((k) => k + 1);
  };

  return (
    <div className={styles.wrapper}>
      <HeaderXuchil />

      <h1 className={styles.title}>Nuevo Producto</h1>

      <h3 className={styles.fieldLabel}>Nombre:</h3>
      <div className={styles.fieldContainer}>
        <TextField
          placeholder="Ej. Galletas de avena"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <h3 className={styles.fieldLabel}>Imagen:</h3>
      <div className={styles.fieldContainer}>
        <div style={{ marginBottom: "12px" }}>
          <input
            key={imageKey}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #333",
              marginTop: "4px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {preview && (
          <img
            src={preview}
            alt="Preview"
            width={200}
            style={{
              width: "140px",
              height: "140px",
              borderRadius: "50%",
              backgroundColor: "#ccc",
              marginBottom: "12px",
              textAlign: "center",
              objectFit: "cover",
            }}
          />
        )}

        {image && (
          <Button
            type="button"
            size="small"
            action="secondary"
            onClick={handlePhotoClear}
            style={{ marginBottom: "20px" }}
          >
            Borrar Imagen
          </Button>
        )}
      </div>

      <h3 className={styles.fieldLabel}>Unidades:</h3>
      <div className={`${styles.fieldContainer} ${styles.centeredControl}`}>
        <select
          className={styles.select}
          value={unitId ?? ""}
          onChange={(e) =>
            setUnitId(e.target.value === "" ? null : Number(e.target.value))
          }
        >
          <option value="">Unidades</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      <h3 className={styles.fieldLabel}>Categoría:</h3>
      <div className={styles.fieldContainer}>
        <select
          className={styles.select}
          value={categoryId ?? ""}
          onChange={(e) =>
            setCategoryId(e.target.value === "" ? null : Number(e.target.value))
          }
        >
          <option value="">Categoría:</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <BottomButton onClick={handleSubmit}>Registrar producto</BottomButton>
    </div>
  );
};

export default NewProductPage;