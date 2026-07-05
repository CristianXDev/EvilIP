// --- NUEVO speedtest-service.js CON LIBRESPEED ---
// Asegúrate de tener <script src="js/speedtest.js"></script> en tu index.html

function runRealSpeedTest() {
    const btn = document.getElementById("btn-start-test");
    const mainDisplay = document.getElementById("main-speed");
    const dlDisplay = document.getElementById("dl-speed");
    const ulDisplay = document.getElementById("ul-speed");

    // Preparar la UI Brutalista de EvilIP
    btn.disabled = true;
    btn.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> CONECTANDO...";
    dlDisplay.innerText = "-- Mbps";
    ulDisplay.innerText = "-- Mbps";
    mainDisplay.innerHTML = '0.00 <span class="fs-4 d-block text-muted">Mbps</span>';

    // Instanciar el worker de LibreSpeed
    const s = new Speedtest();
    s.setParameter("telemetry_level", "none"); // No guardamos resultados en el servidor público

    // Configurar servidor público de prueba (Miami)
    s.addTestPoint({
        server: "Clouvider",
        name: "Miami Test Server",
        dlURL: "https://mia.speedtest.clouvider.net/backend/garbage.php",
        ulURL: "https://mia.speedtest.clouvider.net/backend/empty.php",
        pingURL: "https://mia.speedtest.clouvider.net/backend/empty.php",
        getIpURL: "https://mia.speedtest.clouvider.net/backend/getIP.php"
    });

    // Forzamos a que use el servidor que acabamos de agregar
    s.selectServer(function(server) { return server.name === "Miami Test Server"; });

    // Escuchar el progreso en tiempo real
    s.onupdate = function(data) {
        // testState: 1 = Descarga, 2 = Subida
        if (data.testState === 1 || data.testState === 3) {
            btn.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> MIDIENDO DESCARGA...";
            const dlSpeed = Number(data.dlStatus).toFixed(2);
            dlDisplay.innerText = `${dlSpeed} Mbps`;
            mainDisplay.innerHTML = `${dlSpeed} <span class="fs-4 d-block text-muted">Mbps</span>`;
        }

        if (data.testState === 2) {
            btn.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> MIDIENDO SUBIDA...";
            const ulSpeed = Number(data.ulStatus).toFixed(2);
            ulDisplay.innerText = `${ulSpeed} Mbps`;
        }
    };

    // Cuando termina la prueba o si falla
    s.onend = function(aborted) {
        btn.disabled = false;
        btn.innerHTML = "<i class='bx bx-refresh'></i> VOLVER A PROBAR";
        if (aborted) {
            console.error("La prueba se detuvo o el servidor rechazó la conexión.");
        }
    };

    // ¡Fuego!
    s.start();
}

// Exponer la función al botón del HTML
window.runRealSpeedTest = runRealSpeedTest;
