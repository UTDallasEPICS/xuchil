"use client";

import {useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import HeaderXuchil from "@/components/HeaderXuchil";
import BottomButton from "@/components/BottomButton";
import TextField from "@/components/TextField";
import styles from "./NewRawMaterial.module.css";
import {UnitRead} from "@/lib/schemas";
import productClient from "@/lib/services/productClient";
import {uploadFile} from "@/lib/services/uploadClient";
import Button from "@/components/Button";

const NewRawMaterialPage = () => {
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState(0);
  const [unitId, setUnitId] = useState<number | null>(null);
  const [units, setUnits] = useState<UnitRead[] | null>(null);

  const router = useRouter();

  useEffect(() => {
    async function run() {
      setUnits(await productClient.getAllUnits());
    }
    run();
  },[])

  if (units === null) {
    return null;
  }

  const handleSubmit = async () => {
    if (unitId === null) return;
    const imgUrl = image ? (await uploadFile(image)).path : undefined;
    await productClient.createRawMaterial({
      name,
      imgUrl,
      unitId,
    })
    router.replace("/raw");
  };

  const handlePhotoChange = (e) => {
    const pic = e.target.files?.[0];
    setImage(pic ?? null);
    setPreview(pic ? URL.createObjectURL(pic) : null);
  };

  const handlePhotoClear = () => {
    setImage(null);
    setPreview(null)
    setImageKey(k => k + 1);
  }

  return (
      <div className={styles.wrapper}>
        <HeaderXuchil />

        <h1 className={styles.title}>Nueva Materia Prima</h1>

        <h3 className={styles.fieldLabel}>Nombre:</h3>
        <div className={styles.fieldContainer}>
          <TextField
              placeholder="Ej. Harina de trigo"
              value={name}
              onChange={(e) => setName(e.target.value)}
          />
        </div>

        <h3 className={styles.fieldLabel}>Imagen:</h3>
        <div className={styles.fieldContainer}>
          <div style={{marginBottom: "12px"}}>
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
          {preview &&
              <img
                  src={preview}
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
          }
          {image &&
              <Button
                  type="button"
                  size="small"
                  action="secondary"
                  onClick={handlePhotoClear}
                  style={{marginBottom: "20px"}}
              >
                  Borrar Imagen
              </Button>
          }
        </div>

        <h3 className={styles.fieldLabel}>Unidades:</h3>
        <div className={`${styles.fieldContainer} ${styles.centeredControl}`}>
          <select
              className={styles.select}
              value={unitId ?? ""}
              onChange={(e) => setUnitId(e.target.value === "" ? null : Number(e.target.value))}
          >
            <option value="">Unidades</option>
            {units.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>

        <BottomButton onClick={handleSubmit}>Registrar materia prima</BottomButton>
      </div>
  );
};

export default NewRawMaterialPage;
