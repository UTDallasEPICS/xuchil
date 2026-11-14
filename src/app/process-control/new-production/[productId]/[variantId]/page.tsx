"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BottomButton from "@/components/BottomButton";
import styles from "./TemplateSelect.module.css";

interface TemplateOption {
  id: number;
  name: string;
  version: number;
  isActive: boolean;
  stepCount: number;
}

const TemplateSelectPage = () => {
  const { productId, variantId } = useParams();
  const router = useRouter();

  const [variantName, setVariantName] = useState<string>("");
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const stringVariantId = variantId as string;

      // Variant name for the header (best-effort).
      const variantRes = await fetch(`/api/product-variants`, { credentials: "include" });
      if (variantRes.ok && mounted) {
        const variants = await variantRes.json();
        const variant = variants.find((v: any) => String(v.id) === stringVariantId);
        if (variant) setVariantName(variant.name);
      }

      // Templates configured for this variant.
      const templatesRes = await fetch(
        `/api/process-templates?product_variant_id=${stringVariantId}`,
        { credentials: "include" }
      );
      if (!templatesRes.ok) {
        if (mounted) setLoading(false);
        return;
      }
      const list = await templatesRes.json();

      // Fetch step counts so the user can tell the processes apart.
      const detailed: TemplateOption[] = await Promise.all(
        list.map(async (tpl: any) => {
          let stepCount = 0;
          const detailRes = await fetch(`/api/process-templates/${tpl.id}`, {
            credentials: "include",
          });
          if (detailRes.ok) {
            const detail = await detailRes.json();
            stepCount = (detail.templateSteps || []).length;
          }
          return {
            id: tpl.id,
            name: tpl.name,
            version: tpl.version,
            isActive: tpl.isActive,
            stepCount,
          };
        })
      );

      if (mounted) {
        setTemplates(detailed);
        setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [variantId]);

  const selectTemplate = (tpl: TemplateOption) => {
    if (!tpl.isActive || tpl.stepCount === 0) return;
    router.push(
      `/process-control/new-production/${productId}/${variantId}/1?templateId=${tpl.id}`
    );
  };

  if (loading) {
    return (
      <div className="page">
        <p>Cargando procesos...</p>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="page">
        <div className={styles.container}>
          <h1>{variantName || "Producto"}</h1>
          <p className={styles.emptyText}>
            Esta variante no tiene procesos de producción configurados. Crea una plantilla
            para poder ejecutar el proceso.
          </p>
          <BottomButton onClick={() => router.push("/process-control/new-process")}>
            Crear proceso
          </BottomButton>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>{`Elige el proceso a ejecutar${variantName ? `: ${variantName}` : ""}`}</h1>
      <div className={styles.container}>
        {templates.map((tpl) => {
          const disabled = !tpl.isActive || tpl.stepCount === 0;
          return (
            <div
              key={tpl.id}
              className={`${styles.card} ${disabled ? styles.cardDisabled : ""}`}
              onClick={() => selectTemplate(tpl)}
            >
              <div className={styles.info}>
                <span className={styles.name}>{tpl.name}</span>
                <span className={styles.meta}>
                  {`Versión ${tpl.version} · ${tpl.stepCount} ${
                    tpl.stepCount === 1 ? "paso" : "pasos"
                  }`}
                  {tpl.stepCount === 0 ? " · sin pasos definidos" : ""}
                </span>
              </div>
              <span
                className={`${styles.badge} ${
                  tpl.isActive ? styles.activeBadge : styles.inactiveBadge
                }`}
              >
                {tpl.isActive ? "Activa" : "Inactiva"}
              </span>
            </div>
          );
        })}
        <BottomButton onClick={() => router.back()}>Volver</BottomButton>
      </div>
    </div>
  );
};

export default TemplateSelectPage;
