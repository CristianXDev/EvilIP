// --- NUEVO speedtest-service.js (CORREGIDO Y OPTIMIZADO) ---

async function runRealSpeedTest() {
    const btn = document.getElementById("btn-start-test");
    const mainDisplay = document.getElementById("main-speed");
    const dlDisplay = document.getElementById("dl-speed");
    const ulDisplay = document.getElementById("ul-speed");

    // Verificar que los elementos existen para evitar errores fatales
    if (!btn || !mainDisplay || !dlDisplay || !ulDisplay) {
        console.error("Faltan elementos en el HTML (btn-start-test, main-speed, dl-speed, ul-speed)");
        return;
    }

    // Preparar la Interfaz
    btn.disabled = true;
    btn.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> PREPARANDO...";
    dlDisplay.innerText = "-- Mbps";
    ulDisplay.innerText = "-- Mbps";
    mainDisplay.innerHTML = '0.00 <span class="fs-4 d-block text-muted">Mbps</span>';

    try {
        // Medir Descarga (8 segundos exactos)
        btn.innerHTML = "<i class='bx bx-down-arrow-circle bx-fade-down'></i> MIDIENDO DESCARGA...";
        const finalDownloadSpeed = await testDownload((currentSpeed) => {
            dlDisplay.innerText = `${currentSpeed} Mbps`;
            mainDisplay.innerHTML = `${currentSpeed} <span class="fs-4 d-block text-muted">Mbps</span>`;
        });

        dlDisplay.innerText = `${finalDownloadSpeed} Mbps`;
        mainDisplay.innerHTML = `${finalDownloadSpeed} <span class="fs-4 d-block text-muted">Mbps</span>`;

        // Pequeña pausa para dejar que el router y el navegador respiren
        await new Promise(resolve => setTimeout(resolve, 500));

        // Medir Subida (8 segundos exactos)
        btn.innerHTML = "<i class='bx bx-up-arrow-circle bx-fade-up'></i> MIDIENDO SUBIDA...";
        const finalUploadSpeed = await testUpload((currentSpeed) => {
            ulDisplay.innerText = `${currentSpeed} Mbps`;
            mainDisplay.innerHTML = `${currentSpeed} <span class="fs-4 d-block text-muted">Mbps</span>`; // Opcional: También actualiza el display principal en subida
        });

        ulDisplay.innerText = `${finalUploadSpeed} Mbps`;
        mainDisplay.innerHTML = `${finalUploadSpeed} <span class="fs-4 d-block text-muted">Mbps</span>`;

        // Restaurar el Botón
        btn.disabled = false;
        btn.innerHTML = "<i class='bx bx-refresh'></i> VOLVER A PROBAR";

    } catch (error) {
        console.error("Error durante el SpeedTest:", error);
        btn.disabled = false;
        btn.innerHTML = "<i class='bx bx-error'></i> ERROR - REINTENTAR";
        mainDisplay.innerHTML = 'ERR <span class="fs-4 d-block text-muted">Revisa consola</span>';
    }
}

// --- DESCARGA DE ALTA PRECISIÓN ---
async function testDownload(onProgress) {
    const TEST_DURATION = 8000;
    const controller = new AbortController();
    const url = `https://speed.cloudflare.com/__down?bytes=100000000&t=${Date.now()}`;

    let lastCalculatedSpeed = "0.00";

    try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error("Fallo al conectar con Cloudflare");

        const reader = response.body.getReader();
        let receivedLength = 0;
        let startTime = null;
        let timeoutId = null;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            if (!startTime) {
                startTime = performance.now();
                timeoutId = setTimeout(() => controller.abort(), TEST_DURATION);
            }

            receivedLength += value.length;
            const durationInSeconds = (performance.now() - startTime) / 1000;

            if (durationInSeconds > 0.1) {
                const speedMbps = ((receivedLength * 8) / (1000 * 1000) / durationInSeconds).toFixed(2);
                lastCalculatedSpeed = speedMbps;
                onProgress(speedMbps);
            }
        }

        clearTimeout(timeoutId);
        return lastCalculatedSpeed;

    } catch (error) {
        if (error.name === 'AbortError') {
            return lastCalculatedSpeed;
        }
        throw error;
    }
}


// --- SUBIDA DE ALTA PRECISIÓN (CON MULTI-CONEXIÓN SIMULTÁNEA) ---
// --- SUBIDA DE ALTA PRECISIÓN Y MÁXIMA FLUIDEZ VISUAL ---
function testUpload(onProgress) {
    return new Promise((resolve) => {
        const TEST_DURATION = 8000;
        const CONCURRENCY = 2;
        const CHUNK_SIZE = 4 * 1024 * 1024;

        const data = new Uint8Array(CHUNK_SIZE);
        const blob = new Blob([data], { type: "application/octet-stream" });

        const startTime = performance.now();
        let totalBytesUploaded = 0;
        let currentBytesByXHR = new Map();
        let isTimeUp = false;
        let finalSpeed = "0.00";
        let lastUpdateTime = 0;
        const activeXhrs = new Set();

        const timeoutId = setTimeout(() => {
            isTimeUp = true;
            activeXhrs.forEach(xhr => xhr.abort());
        }, TEST_DURATION);

        function startUploadSlot(slotId) {
            if (isTimeUp) return;

            const xhr = new XMLHttpRequest();
            activeXhrs.add(xhr);

            xhr.upload.onprogress = (event) => {
                if (isTimeUp) return;

                currentBytesByXHR.set(slotId, event.loaded);

                let currentActiveBytes = 0;
                currentBytesByXHR.forEach(bytes => currentActiveBytes += bytes);
                const totalSent = totalBytesUploaded + currentActiveBytes;

                const now = performance.now();
                const durationInSeconds = (now - startTime) / 1000;

                if (durationInSeconds > 0.2) {
                    finalSpeed = ((totalSent * 8) / (1000 * 1000) / durationInSeconds).toFixed(2);

                    // --- CORRECCIÓN AQUÍ: Bajamos de 200ms a 30ms ---
                    // Esto permite más de 30 actualizaciones por segundo en tu pantalla
                    if (now - lastUpdateTime > 30) {
                        onProgress(finalSpeed);
                        lastUpdateTime = now;
                    }
                }
            };

            xhr.onload = () => {
                activeXhrs.delete(xhr);
                totalBytesUploaded += currentBytesByXHR.get(slotId) || 0;
                currentBytesByXHR.set(slotId, 0);
                startUploadSlot(slotId);
            };

            xhr.onabort = () => {
                activeXhrs.delete(xhr);
                currentBytesByXHR.set(slotId, 0);
            };

            xhr.onerror = () => {
                activeXhrs.delete(xhr);
                currentBytesByXHR.set(slotId, 0);
                setTimeout(() => startUploadSlot(slotId), 100);
            };

            xhr.open("POST", `https://speed.cloudflare.com/__up?t=${Date.now()}&slot=${slotId}`, true);
            xhr.send(blob);
        }

        for (let i = 0; i < CONCURRENCY; i++) {
            currentBytesByXHR.set(i, 0);
            startUploadSlot(i);
        }

        const interval = setInterval(() => {
            if (performance.now() - startTime >= TEST_DURATION || isTimeUp) {
                clearInterval(interval);
                clearTimeout(timeoutId);
                activeXhrs.forEach(xhr => xhr.abort());
                resolve(finalSpeed);
            }
        }, 50);
    });
}

window.runRealSpeedTest = runRealSpeedTest;
