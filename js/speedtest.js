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
  mainDisplay.innerHTML =
    '0.00 <span class="fs-4 d-block text-muted">Mbps</span>';

  // Instanciar LibreSpeed
  const s = new Speedtest();
  s.setParameter("telemetry_level", "none");

  // Lista de servidores gratuitos y públicos compatibles con LibreSpeed
  s.setParameter("servers", [
    {
      name: "Clouvider - New York",
      server: "https://nyc.speedtest.clouvider.net/backend/",
      dlURL: "garbage.php",
      ulURL: "empty.php",
      pingURL: "empty.php",
      getIpURL: "getIP.php",
    },
    {
      name: "Clouvider - Los Angeles",
      server: "https://lax.speedtest.clouvider.net/backend/",
      dlURL: "garbage.php",
      ulURL: "empty.php",
      pingURL: "empty.php",
      getIpURL: "getIP.php",
    },
    {
      name: "Clouvider - Frankfurt",
      server: "https://fra.speedtest.clouvider.net/backend/",
      dlURL: "garbage.php",
      ulURL: "empty.php",
      pingURL: "empty.php",
      getIpURL: "getIP.php",
    },
    {
      name: "Hostkey - Amsterdam",
      server: "https://speedtest.hostkey.com/backend/",
      dlURL: "garbage.php",
      ulURL: "empty.php",
      pingURL: "empty.php",
      getIpURL: "getIP.php",
    },
  ]);

  // NOTA: Eliminamos s.selectServer().
  // Al no forzar uno, LibreSpeed los pingeará todos y elegirá el primero que responda bien.

  // Escuchar el progreso en tiempo real
  s.onupdate = function (data) {
    const state = data.testState;

    if (state === 1) {
      btn.innerHTML =
        "<i class='bx bx-loader-alt bx-spin'></i> MIDIENDO DESCARGA...";
      const dlSpeed = Number(data.dlStatus).toFixed(2);
      dlDisplay.innerText = `${dlSpeed} Mbps`;
      mainDisplay.innerHTML = `${dlSpeed} <span class="fs-4 d-block text-muted">Mbps</span>`;
    }

    if (state === 2) {
      btn.innerHTML =
        "<i class='bx bx-loader-alt bx-spin'></i> MIDIENDO LATENCIA...";
    }

    if (state === 3) {
      btn.innerHTML =
        "<i class='bx bx-loader-alt bx-spin'></i> MIDIENDO SUBIDA...";
      const ulSpeed = Number(data.ulStatus).toFixed(2);
      ulDisplay.innerText = `${ulSpeed} Mbps`;
      mainDisplay.innerHTML = `${ulSpeed} <span class="fs-4 d-block text-muted">Mbps</span>`;
    }
  };

  // Cuando termina la prueba o si falla
  s.onend = function (aborted) {
    btn.disabled = false;
    btn.innerHTML = "<i class='bx bx-play-circle'></i> INICIAR PRUEBA";
    if (aborted) {
      console.error(
        "La prueba se detuvo o todos los servidores rechazaron la conexión.",
      );
      mainDisplay.innerHTML =
        'ERROR <span class="fs-4 d-block text-danger">Conexión Fallida</span>';
    }
  };

  // ¡Fuego!
  s.start();
}

// Exponer la función al botón del HTML
window.runRealSpeedTest = runRealSpeedTest;
