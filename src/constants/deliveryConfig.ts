import styles from "@/styles/DeliveryType.module.css";

export const deliveryVariants = {
  personal: {
    iconSrc: "/Personal.svg",
    alt: "Ícono de entrega personal",
    label: "Entrega personal",
    containerClass: styles.personal,
  },
  mail: {
    iconSrc: "/Mail.svg",
    alt: "Ícono de entrega por correo",
    label: "Envío por correo",
    containerClass: styles.mail,
  },
};

export const availableVariants = Object.keys(deliveryVariants) as Array<
  keyof typeof deliveryVariants
>;
