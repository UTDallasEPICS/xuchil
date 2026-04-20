import styles from "@/styles/DeliveryType.module.css";

export const deliveryVariants = {
  PERSONAL: {
    iconSrc: "/Personal.svg",
    alt: "Ícono de entrega personal",
    label: "Entrega personal",
    containerClass: styles.personal,
  },
  MAIL: {
    iconSrc: "/Mail.svg",
    alt: "Ícono de entrega por correo",
    label: "Envío por correo",
    containerClass: styles.mail,
  },
  CONSIGNMENT: {
    iconSrc: "/Consignment.svg",
    alt: "Ícono de producto en consignación",
    label: "En consignación",
    iconClass: styles.iconConsignment,
    containerClass: styles.consignment,
  },
};

export const availableVariants = Object.keys(deliveryVariants) as Array<
  keyof typeof deliveryVariants
>;
