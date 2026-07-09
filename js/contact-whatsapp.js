// contact-whatsapp.js
// Enviar formulario de contacto a través de un enlace de WhatsApp

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  const phone = "5804124327197"; // Número de destino sin el +[cite: 2]

  if (!form) return;

  // Manejador del envío del formulario
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Capturar valores usando los nuevos IDs asignados en el HTML
    const name = (document.getElementById("name")?.value || "").trim();
    const email = (document.getElementById("email")?.value || "").trim();
    const msg = (document.getElementById("msg")?.value || "").trim();

    // Construir el texto formateado para WhatsApp (Cambiado a EvilIP)
    let text = "Nuevo contacto desde EvilIP:%0A";
    text += `Nombre: ${encodeURIComponent(name)}%0A`;
    text += `Email: ${encodeURIComponent(email)}%0A`;
    if (msg) text += `Mensaje: ${encodeURIComponent(msg)}%0A`;

    const url = `https://wa.me/${phone}?text=${text}`;

    // Abrir el enlace de WhatsApp en una nueva pestaña[cite: 2]
    window.open(url, "_blank");

    // Limpiar campos del formulario[cite: 2]
    form.reset();
  });
});
