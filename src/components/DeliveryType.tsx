import { FC } from "react";
import { ChevronDown } from "lucide-react";
import styles from "@/styles/DeliveryType.module.css";
import Image from "next/image";

interface DeliveryTypeProps {
  variant?: "personal" | "mail";
  type?: "icon" | "badge" | "picker";
}

const DeliveryType: FC<DeliveryTypeProps> = ({ variant = "personal", type = "badge"}) => {
  return (
    <div className={`${styles.deliveryTypeContainer} ${styles[variant]} ${styles[type]}`}>
        <Image
          src={variant == "personal" ? "/Personal.svg" : "/Mail.svg"}
          alt={variant == "personal" ? "Ícono de entrega personal" : "Ícono de entrega por correo"} 
          width={variant == "personal" ? 40 : 40}
          height={variant == "personal" ? 40 : 50}
          className={variant == "personal" ? styles.iconPersonal : styles.iconMail} 
        />
        {(type=="badge" || type=="picker")&&
            <p className={styles.deliveryTypeText}>
                {variant == "personal" ? "Entrega personal" : "Envío por correo"}
            </p>
        }
        {
            type=="picker"&&
            <div className={styles.chevron}>{<ChevronDown/>}</div>
        }
    </div>
  );
};

export default DeliveryType;
