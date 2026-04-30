"use client";

import { useEffect, useState } from "react";
import {useParams, useRouter} from "next/navigation";
import HeaderXuchil from "@/components/HeaderXuchil";
import ImageCard from "@/components/ImageCard";
import styles from "./ProductTemplateDetail.module.css";
import {ProcessTemplateRead} from "@/lib/schemas";
import templateClient from "@/lib/services/templateClient";
import executionClient from "@/lib/services/executionClient";

const ProductTemplateDetailPage = () => {
  const router = useRouter();
  const { productId } = useParams();
  const [templates, setTemplates] = useState<ProcessTemplateRead[] | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const data = (
          await templateClient.getAllProcessTemplates()
      ).filter(p => p.productId == Number(productId))
      if (!mounted) return;

      setTemplates(data);
    }

    load();

    return () => {
      mounted = false;
    };
  }, [productId]);

  if (templates === null) return null;

  const handleProcessCreation = async (templateId: number) => {
    const execution = await executionClient.startProcess(templateId);
    router.push(`/process-control/${execution.id}/${execution.processStepExecutions[0].id}`);
  }

  return (
    <div className="page">
      <HeaderXuchil />
      <h1>Select production process...</h1>
      <div className={styles.container}>
        {templates.map((t) => (
          <ImageCard
            key={t.id}
            imageSrc={'/new-process.svg'}
            text={t.name}
            type="small"
            onClick={() => handleProcessCreation(t.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductTemplateDetailPage;
