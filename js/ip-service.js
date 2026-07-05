// --- SERVICIO DE API IP ---
const API_BASE_URL = "https://api.ipquery.io";

/**
 * Obtiene la información completa de la IP.
 * Realiza una petición en dos pasos si es la IP del cliente para ajustarse a la API de IPQuery.
 * @param {string} ip - (Opcional) IP específica a consultar
 * @returns {Promise<Object>} - Datos detallados de la IP
 */
async function getIPInfo(ip = "") {
  try {
    let targetIp = ip;

    // PASO 1: Si no hay IP específica, consultamos la nuestra.
    // IPQuery en la raíz (GET /) devuelve TEXTO, no JSON.
    if (!targetIp) {
      const ipResponse = await fetch(API_BASE_URL);
      if (!ipResponse.ok)
        throw new Error(`Error obteniendo la IP: ${ipResponse.status}`);
      targetIp = await ipResponse.text();
    }

    // PASO 2: Consultar la IP específica (GET /{ip}).
    // Este endpoint SÍ devuelve el objeto JSON con toda la telemetría.
    const url = `${API_BASE_URL}/${targetIp}`;
    const infoResponse = await fetch(url);

    if (!infoResponse.ok) {
      throw new Error(
        `Error HTTP consultando detalles: ${infoResponse.status}`,
      );
    }

    const data = await infoResponse.json();
    return data;
  } catch (error) {
    console.error("Error en la extracción de datos de IP:", error);
    throw error; // Propagamos el error para que initIPService lo atrape
  }
}

/**
 * Pinta los datos obtenidos en el HTML
 * @param {Object} data - Objeto JSON de la API
 */
function updateUI(data) {
  // 1. Renderizar IP
  const ipElement = document.getElementById("json-ip");
  if (ipElement) {
    ipElement.innerText = data.ip || "No disponible";
  }

  // 2. Renderizar Proveedor (ISP)
  const ispElement = document.getElementById("json-isp");
  if (ispElement) {
    ispElement.innerText = data.isp?.isp || data.isp?.org || "ISP Desconocido";
  }

  // 3. Renderizar Ubicación
  const locationElement = document.getElementById("json-location");
  if (locationElement && data.location) {
    const city = data.location.city || "";
    const state = data.location.state || "";
    const countryCode = data.location.country_code || "";
    const country = data.location.country || "";

    const cityState = [city, state].filter(Boolean).join(", ");
    locationElement.innerText = `${cityState} (${countryCode}) - ${country}`;
  }

  // 4. Analizar Nivel de Riesgo General (Para la tarjeta lateral izquierda)
  const riskContainer = document.getElementById("json-risk");
  const riskIcon = document.getElementById("icon-risk");

  if (riskContainer && riskIcon && data.risk) {
    const isRisky =
      data.risk.is_vpn ||
      data.risk.is_proxy ||
      data.risk.is_tor ||
      data.risk.is_datacenter;

    if (isRisky) {
      riskContainer.innerHTML =
        '<span class="text-danger fw-bold">Red Enmascarada</span>';
      riskIcon.className = "bx bx-shield-x info-icon text-danger";
    } else {
      riskContainer.innerHTML =
        '<span class="text-success fw-bold">Conexión Directa Segura</span>';
      riskIcon.className = "bx bx-check-shield info-icon text-success";
    }
  }

  // 5. Renderizar Información Adicional (Diseño minimalista por íconos)
  if (data.risk) {
    // --- 1. Dispositivo (Móvil vs PC) ---
    const textDevice = document.getElementById("text-device");
    const iconDevice = document.getElementById("icon-device");
    if (textDevice && iconDevice) {
      if (data.risk.is_mobile) {
        textDevice.innerText = "Dispositivo Móvil";
        textDevice.className = "fw-bold text-uppercase mb-0 text-dark";
        iconDevice.className = "bx bx-mobile fs-1 mb-2 text-dark";
      } else {
        textDevice.innerText = "Dispositivo PC";
        textDevice.className = "fw-bold text-uppercase mb-0 text-dark";
        iconDevice.className = "bx bx-desktop fs-1 mb-2 text-dark";
      }
    }

    // --- 2. Privacidad (VPN / Proxy) ---
    const textPrivacy = document.getElementById("text-privacy");
    const iconPrivacy = document.getElementById("icon-privacy");
    if (textPrivacy && iconPrivacy) {
      if (data.risk.is_vpn || data.risk.is_proxy) {
        textPrivacy.innerText = data.risk.is_vpn
          ? "VPN Activa"
          : "Proxy Activo";
        textPrivacy.className = "fw-bold text-uppercase mb-0 text-danger";
        iconPrivacy.className = "bx bx-shield-x fs-1 mb-2 text-danger";
      } else {
        textPrivacy.innerText = "Sin VPN / Proxy";
        textPrivacy.className = "fw-bold text-uppercase mb-0 text-success";
        iconPrivacy.className = "bx bx-check-shield fs-1 mb-2 text-success";
      }
    }

    // --- 3. Tipo de Red (TOR / Datacenter / Residencial) ---
    const textNetwork = document.getElementById("text-network");
    const iconNetwork = document.getElementById("icon-network");
    if (textNetwork && iconNetwork) {
      if (data.risk.is_tor) {
        textNetwork.innerText = "Red TOR";
        textNetwork.className = "fw-bold text-uppercase mb-0 text-danger";
        iconNetwork.className = "bx bx-ghost fs-1 mb-2 text-danger";
      } else if (data.risk.is_datacenter) {
        textNetwork.innerText = "Datacenter";
        textNetwork.className = "fw-bold text-uppercase mb-0 text-warning";
        iconNetwork.className = "bx bx-server fs-1 mb-2 text-warning";
      } else {
        textNetwork.innerText = "Residencial";
        textNetwork.className = "fw-bold text-uppercase mb-0 text-success";
        iconNetwork.className = "bx bx-home fs-1 mb-2 text-success";
      }
    }

    // --- 4. Score de Riesgo ---
    const textScore = document.getElementById("text-score");
    const iconScore = document.getElementById("icon-risk-score");
    if (textScore && iconScore) {
      const score = data.risk.risk_score;
      textScore.innerText = `Riesgo: ${score}/100`;

      if (score === 0) {
        textScore.className = "fw-bold text-uppercase mb-0 text-success";
        iconScore.className = "bx bx-shield-alt-2 fs-1 mb-2 text-success";
      } else if (score < 50) {
        textScore.className = "fw-bold text-uppercase mb-0 text-warning";
        iconScore.className = "bx bx-error-circle fs-1 mb-2 text-warning";
      } else {
        textScore.className = "fw-bold text-uppercase mb-0 text-danger";
        iconScore.className = "bx bx-error fs-1 mb-2 text-danger";
      }
    }
  }
}

/**
 * Función principal que orquesta el servicio al cargar la vista
 */
async function initIPService() {
  try {
    const data = await getIPInfo();
    console.log("Análisis de red completado:", data);
    updateUI(data);
    return data;
  } catch (error) {
    console.error("Fallo crítico al inicializar servicio de IP:", error);

    // Manejo visual de errores en el DOM
    const errorIds = ["json-ip", "json-isp", "json-location"];
    errorIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.innerHTML = '<span class="text-danger">Fallo de red</span>';
      }
    });

    const riskContainer = document.getElementById("json-risk");
    const riskIcon = document.getElementById("icon-risk");
    if (riskContainer && riskIcon) {
      riskContainer.innerHTML =
        '<span class="text-danger">Servidor Inaccesible</span>';
      riskIcon.className = "bx bx-error info-icon text-danger";
    }
  }
}

// Exposición al Window Global (para la consola y otros scripts)
window.getIPInfo = getIPInfo;
window.updateUI = updateUI;
window.initIPService = initIPService;
