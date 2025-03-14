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
  consignment: {
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
