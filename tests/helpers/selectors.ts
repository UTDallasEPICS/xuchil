/**
 * Selectores de elementos en la aplicación (usando XPath para mayor flexibilidad)
 * Estos selectores se basan en la estructura real de la UI
 */

export const Selectors = {
  // Login page
  login: {
    emailInput: 'input[placeholder="Usuario"]',
    passwordInput: 'input[placeholder="Contraseña"]',
    submitButton: '//button[contains(text(), "Iniciar sesión")]',
    errorMessage: '//p[contains(., "Usuario o contraseña incorrectos")]',
  },

  // Header & Navigation
  header: {
    userMenu: '//button[contains(., "Cerrar sesión")]',
    logoutButton: '//button[contains(., "Cerrar sesión")]',
    title: 'h1',
  },

  // Create/Edit User Forms
  userForm: {
    nameInput: '//input[@type="text"][1]',
    lastNameInput: '//input[@type="text"][2]',
    secondLastNameInput: '//input[@type="text"][3]',
    phoneInput: '//input[@type="text"][4]',
    emailInput: '//input[@type="text"][5]',
    usernameInput: '//input[@type="text"][6]',
    passwordInput: '//input[@type="password"][1]',
    confirmPasswordInput: '//input[@type="password"][2]',
    roleSelect: 'select',
    submitButton: '//button[contains(text(), "Crear usuario") or contains(text(), "Listo")]',
  },

  // User Management Page
  userManagement: {
    createButton: '//button[contains(text(), "Crear usuario")]',
    userTable: 'div[class*="profileCard"]',
    userRows: 'div[class*="guestItem"]',
    userName: 'h2[class*="profileName"]',
    userEmail: 'p[class*="infoValue"]',
    editButton: '//button[contains(text(), "Editar")]',
    deleteButton: '//button[contains(@title, "Eliminar invitado")]',
  },

  // Guest Management
  guests: {
    guestNameInput: 'input[placeholder*="Nombre del invitado"]',
    guestContactInput: 'input[placeholder*="Información de contacto"]',
    guestPasswordInput: 'input[placeholder*="Contraseña"]',
    addGuestButton: '//button[contains(text(), "Agregar invitado")]',
    guestTable: 'div[class*="guestList"]',
    deleteGuestButton: '//button[contains(text(), "Eliminar")]',
  },

  // Orders/Inventory
  orders: {
    ordersLink: '//a[contains(text(), "Órdenes")]',
    createOrderButton: '//button[contains(text(), "Nuevo Pedido") or contains(text(), "Nueva orden")]',
    createButton: '//button[contains(text(), "Nuevo Pedido") or contains(text(), "Nueva orden")]',
    orderTable: 'div[class*="scrollArea"], div[class*="card"]',
    orderRows: 'div[class*="card"]',
    orderNumber: 'h2',
    status: 'p',
  },

  // Products/Inventory
  inventory: {
    productInput: 'button[aria-haspopup="listbox"]',
    quantityInput: 'input[type="number"]',
    unitSelect: 'select',
    addButton: 'button[aria-label="Añadir producto"]',
    addProductButton: 'button[aria-label="Añadir producto"]',
  },

  // Modales
  modal: {
    container: '[class*="modal"]',
    title: '//h2 | //h3',
    message: '//p',
    closeButton: '//button[contains(@aria-label, "close")]',
    confirmButton: '//button[contains(text(), "Aceptar") or contains(text(), "Confirmar")]',
    cancelButton: '//button[contains(text(), "Cancelar")]',
  },

  // Process Control
  processControl: {
    mainTable: 'table',
    rows: 'table tbody tr',
    processName: 'td:nth-child(1)',
    status: 'td:nth-child(2)',
  },

  // General
  page: {
    heading: 'h1, h2',
    buttons: 'button',
    inputs: 'input',
    selects: 'select',
  },

  notification: {
    success: '//h3[contains(., "Usuario creado") or contains(., "Proceso creado exitosamente") or contains(., "¡Cambios guardados!")]',
    error: '//h3[contains(., "Error") or contains(., "Campos incompletos") or contains(., "Contraseña inválida")]',
    warning: '//p[contains(., "advert")]',
  },
};

export default Selectors;
