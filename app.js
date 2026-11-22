/* Construaire del Caribe S.A.S. — web corporativa
   ---------------------------------------------------------------
   CONFIGURACIÓN: cambie aquí los datos de contacto y redes sociales.
   Deje una red social en "" para ocultarla.                          */
const CONFIG = {
  whatsapp: "573115070712",                 // 57 + número, sin espacios
  email: "construairedelcaribe@gmail.com",
  instagram: "",                            // ej.: "https://www.instagram.com/usuario"
  facebook: ""                              // ej.: "https://www.facebook.com/pagina"
};

(function () {
  "use strict";

  // Año del pie de página
  document.querySelectorAll("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });

  // Redes sociales configuradas
  ["instagram", "facebook"].forEach(red => {
    const a = document.querySelector(`[data-social-link="${red}"]`);
    if (a && CONFIG[red]) { a.href = CONFIG[red]; a.hidden = false; }
  });

  // Momento de la portada: el aire se enciende y el "adentro" baja de 32° a 23°,
  // con la pantalla del equipo sincronizada con el número grande.
  const num = document.querySelector("[data-countdown]");
  const display = document.querySelector("[data-ac-display]");
  const split = document.querySelector("[data-split]");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const show = v => { if (num) num.textContent = v; if (display) display.textContent = v; };
  if (reduce) {
    show(23);
    if (split) split.classList.add("is-on");
  } else {
    const from = 32, to = 23, dur = 1600;
    show(from);
    setTimeout(() => { if (split) split.classList.add("is-on"); }, 250);
    const start = performance.now() + 700;
    const tick = now => {
      const t = Math.min(1, Math.max(0, (now - start) / dur));
      const eased = 1 - Math.pow(1 - t, 3);
      show(Math.round(from - (from - to) * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // Menú en celular
  const top = document.querySelector(".top");
  const menuBtn = document.querySelector("[data-menu-btn]");
  const setMenu = open => { top.classList.toggle("is-open", open); menuBtn.setAttribute("aria-expanded", String(open)); };
  if (menuBtn) {
    menuBtn.addEventListener("click", () => setMenu(!top.classList.contains("is-open")));
    document.querySelectorAll("#menu-principal a").forEach(a => a.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", e => { if (e.key === "Escape" && top.classList.contains("is-open")) { setMenu(false); menuBtn.focus(); } });
    document.addEventListener("click", e => { if (!top.contains(e.target)) setMenu(false); });
  }

  // Síntomas → mensaje del formulario
  const msg = document.getElementById("f-msg");
  const serv = document.getElementById("f-serv");
  document.querySelectorAll("[data-symptom]").forEach(btn => {
    btn.setAttribute("aria-pressed", "false");
    btn.addEventListener("click", () => {
      const on = btn.getAttribute("aria-pressed") !== "true";
      btn.setAttribute("aria-pressed", String(on));
      const picked = [...document.querySelectorAll('[data-symptom][aria-pressed="true"]')].map(b => b.dataset.symptom);
      const base = msg.value.replace(/^Síntomas:.*(\n|$)/, "");
      msg.value = (picked.length ? `Síntomas: ${picked.join(", ")}.\n` : "") + base;
      if (picked.length && !serv.value) serv.value = "Reparación";
    });
  });

  // Formulario → WhatsApp o correo con el mensaje listo
  const form = document.getElementById("form-contacto");
  const err = form.querySelector(".form__error");
  let via = "whatsapp";
  form.querySelectorAll("[data-via]").forEach(b => b.addEventListener("click", () => { via = b.dataset.via; }));

  form.addEventListener("submit", e => {
    e.preventDefault();
    const required = [...form.querySelectorAll("[required]")];
    let firstBad = null;
    required.forEach(f => {
      const bad = !f.value.trim();
      f.setAttribute("aria-invalid", String(bad));
      if (bad && !firstBad) firstBad = f;
    });
    if (firstBad) {
      err.textContent = "Complete nombre, teléfono y servicio para enviar la solicitud.";
      err.hidden = false;
      firstBad.focus();
      return;
    }
    err.hidden = true;

    const d = Object.fromEntries(new FormData(form).entries());
    const lines = [
      "Hola Construaire del Caribe, quiero solicitar una cotización.",
      "",
      `Nombre: ${d.nombre.trim()}`,
      `Teléfono: ${d.telefono.trim()}`,
      `Servicio: ${d.servicio}`,
      d.tipo ? `Tipo de equipo: ${d.tipo}` : "",
      d.cantidad ? `Cantidad de equipos: ${d.cantidad}` : "",
      d.direccion.trim() ? `Barrio o dirección: ${d.direccion.trim()}` : "",
      d.mensaje.trim() ? `\n${d.mensaje.trim()}` : ""
    ].filter(Boolean);
    const text = lines.join("\n");

    if (via === "email") {
      const subject = `Solicitud de cotización: ${d.servicio}`;
      window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    } else {
      window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    }
  });

  form.addEventListener("input", e => {
    if (e.target.getAttribute("aria-invalid") === "true" && e.target.value.trim()) e.target.setAttribute("aria-invalid", "false");
  });
})();
