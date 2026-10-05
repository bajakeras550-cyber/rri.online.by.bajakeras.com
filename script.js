/* =====================================================
   RRI.ONLINE BY.BAJAKERAS
   RADIO PLAYER + 10 BAND EQ + REAL-TIME SPECTRUM
===================================================== */


/* =====================================================
   STREAM RRI
===================================================== */

// MASUKKAN URL STREAM RRI YANG KAMU PAKAI DI SINI

const STREAM_URL = "ISI_URL_STREAM_RRI_KAMU_DI_SINI";


/* =====================================================
   ELEMENT
===================================================== */

const audio = document.getElementById("radioAudio");
const playButton = document.getElementById("playButton");
const playIcon = document.getElementById("playIcon");
const statusText = document.getElementById("statusText");

const volumeSlider = document.getElementById("volumeSlider");
const volumeValue = document.getElementById("volumeValue");
const volumeIcon = document.getElementById("volumeIcon");

const resetEq = document.getElementById("resetEq");

const eqSliders = document.querySelectorAll(".eq-slider");

const canvas = document.getElementById("spectrumCanvas");
const canvasContext = canvas.getContext("2d");


/* =====================================================
   AUDIO CONTEXT
===================================================== */

let audioContext = null;
let sourceNode = null;
let analyser = null;

let eqFilters = [];

let audioReady = false;
let isMuted = false;
let previousVolume = 1;


/* =====================================================
   EQUALIZER FREQUENCIES
===================================================== */

const frequencies = [
  31,
  62,
  125,
  250,
  500,
  1000,
  2000,
  4000,
  8000,
  16000
];


/* =====================================================
   INITIALIZE AUDIO
===================================================== */

function initializeAudio() {

  if (audioReady) {
    return;
  }

  try {

    audioContext =
      new (
        window.AudioContext ||
        window.webkitAudioContext
      )();

    /*
      Mengambil audio dari HTMLAudioElement.
    */

    sourceNode =
      audioContext.createMediaElementSource(audio);


    /*
      Buat 10 filter equalizer.
    */

    eqFilters = frequencies.map((frequency) => {

      const filter =
        audioContext.createBiquadFilter();

      filter.type = "peaking";

      filter.frequency.value = frequency;

      filter.Q.value = 1.1;

      filter.gain.value = 0;

      return filter;

    });


    /*
      Hubungkan filter satu per satu.
    */

    let previousNode = sourceNode;

    eqFilters.forEach((filter) => {

      previousNode.connect(filter);

      previousNode = filter;

    });


    /*
      Analyzer untuk spectrum.
    */

    analyser =
      audioContext.createAnalyser();

    analyser.fftSize = 2048;

    analyser.smoothingTimeConstant = 0.82;

    analyser.minDecibels = -90;

    analyser.maxDecibels = -10;


    previousNode.connect(analyser);

    analyser.connect(
      audioContext.destination
    );


    audioReady = true;

  } catch (error) {

    console.error(
      "Audio initialization error:",
      error
    );

    statusText.textContent =
      "Audio browser tidak mendukung";

  }

}


/* =====================================================
   PLAY / PAUSE
===================================================== */

playButton.addEventListener("click", async () => {

  if (!STREAM_URL ||
      STREAM_URL === "ISI_URL_STREAM_RRI_KAMU_DI_SINI") {

    statusText.textContent =
      "Masukkan URL stream RRI terlebih dahulu.";

    return;
  }


  initializeAudio();


  try {

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }


    if (audio.paused) {

      /*
        URL hanya dimasukkan saat tombol Play ditekan.
      */

      if (!audio.src) {

        audio.src = STREAM_URL;

      }

      statusText.textContent =
        "Menghubungkan ke RRI...";

      await audio.play();

    } else {

      audio.pause();

    }

  } catch (error) {

    console.error(error);

    statusText.textContent =
      "Gagal memutar stream.";

  }

});


/* =====================================================
   AUDIO EVENTS
===================================================== */

audio.addEventListener("playing", () => {

  playIcon.textContent = "❚❚";

  statusText.textContent =
    "RRI sedang mengudara";

  document.body.classList.add("playing");

});


audio.addEventListener("pause", () => {

  playIcon.textContent = "▶";

  statusText.textContent =
    "Radio dijeda";

  document.body.classList.remove("playing");

});


audio.addEventListener("waiting", () => {

  statusText.textContent =
    "Buffering...";

});


audio.addEventListener("stalled", () => {

  statusText.textContent =
    "Koneksi stream terhenti...";

});


audio.addEventListener("error", () => {

  console.error(
    "Radio stream error:",
    audio.error
  );

  statusText.textContent =
    "Stream RRI tidak dapat diputar.";

});


/* =====================================================
   VOLUME
===================================================== */

audio.volume = 1;

volumeSlider.addEventListener("input", () => {

  const value =
    Number(volumeSlider.value);

  audio.volume = value;

  previousVolume = value;

  isMuted = value === 0;

  volumeValue.textContent =
    Math.round(value * 100) + "%";

  updateVolumeIcon();

});


function updateVolumeIcon() {

  if (audio.volume === 0) {

    volumeIcon.textContent = "🔇";

  } else if (audio.volume < .45) {

    volumeIcon.textContent = "🔈";

  } else {

    volumeIcon.textContent = "🔊";

  }

}


volumeIcon.addEventListener("click", () => {

  if (!isMuted) {

    previousVolume =
      audio.volume || 1;

    audio.volume = 0;

    volumeSlider.value = 0;

    isMuted = true;

  } else {

    audio.volume =
      previousVolume || 1;

    volumeSlider.value =
      audio.volume;

    isMuted = false;

  }

  volumeValue.textContent =
    Math.round(audio.volume * 100) + "%";

  updateVolumeIcon();

});


/* =====================================================
   10 BAND EQUALIZER
===================================================== */

eqSliders.forEach((slider, index) => {

  slider.addEventListener("input", () => {

    const value =
      Number(slider.value);

    const valueDisplay =
      slider.parentElement.querySelector(
        ".eq-value"
      );

    valueDisplay.textContent =
      (value > 0 ? "+" : "") +
      value +
      " dB";


    if (
      eqFilters[index]
    ) {

      eqFilters[index].gain.value =
        value;

    }

  });

});


/* =====================================================
   RESET EQUALIZER
===================================================== */

resetEq.addEventListener("click", () => {

  eqSliders.forEach(
    (slider, index) => {

      slider.value = 0;

      const valueDisplay =
        slider.parentElement.querySelector(
          ".eq-value"
        );

      valueDisplay.textContent =
        "0 dB";


      if (
        eqFilters[index]
      ) {

        eqFilters[index].gain.value =
          0;

      }

    }
  );

});


/* =====================================================
   CANVAS RESIZE
===================================================== */

function resizeCanvas() {

  const pixelRatio =
    window.devicePixelRatio || 1;

  const rect =
    canvas.getBoundingClientRect();

  canvas.width =
    rect.width * pixelRatio;

  canvas.height =
    rect.height * pixelRatio;

  canvasContext.setTransform(
    pixelRatio,
    0,
    0,
    pixelRatio,
    0,
    0
  );

}


window.addEventListener(
  "resize",
  resizeCanvas
);

resizeCanvas();


/* =====================================================
   SPECTRUM
===================================================== */

const frequencyData =
  new Uint8Array(1024);


let colorOffset = 0;


function drawSpectrum() {

  requestAnimationFrame(
    drawSpectrum
  );


  const width =
    canvas.clientWidth;

  const height =
    canvas.clientHeight;


  /*
    Background.
  */

  canvasContext.clearRect(
    0,
    0,
    width,
    height
  );


  canvasContext.fillStyle =
    "rgba(2, 5, 18, .55)";

  canvasContext.fillRect(
    0,
    0,
    width,
    height
  );


  /*
    Jika analyzer belum aktif,
    spectrum dibuat benar-benar diam.
  */

  if (!analyser) {

    drawIdleSpectrum(
      width,
      height
    );

    return;

  }


  analyser.getByteFrequencyData(
    frequencyData
  );


  /*
    Jumlah bar.
  */

  const barCount =
    Math.min(
      72,
      Math.floor(width / 7)
    );


  const gap = 2;

  const barWidth =
    (width -
      (barCount - 1) * gap) /
    barCount;


  colorOffset += .8;


  for (
    let i = 0;
    i < barCount;
    i++
  ) {

    /*
      Logarithmic mapping.
      Ini membuat frekuensi rendah
      dan tinggi terlihat lebih natural.
    */

    const normalized =
      i / barCount;

    const index =
      Math.floor(
        Math.pow(normalized, 2.2) *
        (frequencyData.length - 1)
      );


    let value =
      frequencyData[index] || 0;


    /*
      Kurangi sedikit noise kecil.
      Jadi saat penyiar diam,
      spektrum tidak menari berlebihan.
    */

    if (value < 12) {
      value = 0;
    }


    const normalizedValue =
      value / 255;


    const barHeight =
      normalizedValue *
      height *
      .90;


    const x =
      i * (barWidth + gap);

    const y =
      height - barHeight;


    /*
      Warna berubah perlahan
      dari spectrum ke spectrum.
    */

    const hue =
      (
        colorOffset +
        i * 5
      ) % 360;


    const gradient =
      canvasContext.createLinearGradient(
        0,
        y,
        0,
        height
      );


    gradient.addColorStop(
      0,
      `hsla(${hue}, 100%, 70%, 1)`
    );

    gradient.addColorStop(
      .5,
      `hsla(${(hue + 45) % 360}, 100%, 60%, .95)`
    );

    gradient.addColorStop(
      1,
      `hsla(${(hue + 90) % 360}, 100%, 50%, .45)`
    );


    canvasContext.fillStyle =
      gradient;


    /*
      Glow.
    */

    canvasContext.shadowBlur = 10;

    canvasContext.shadowColor =
      `hsla(${hue}, 100%, 65%, .8)`;


    /*
      Bar.
    */

    canvasContext.beginPath();

    canvasContext.roundRect(
      x,
      y,
      barWidth,
      Math.max(
        barHeight,
        value > 0 ? 2 : 0
      ),
      4
    );

    canvasContext.fill();


    canvasContext.shadowBlur = 0;

  }

}


/* =====================================================
   IDLE SPECTRUM
===================================================== */

function drawIdleSpectrum(
  width,
  height
) {

  const barCount =
    Math.min(
      72,
      Math.floor(width / 7)
    );

  const gap = 2;

  const barWidth =
    (width -
      (barCount - 1) * gap) /
    barCount;


  for (
    let i = 0;
    i < barCount;
    i++
  ) {

    const x =
      i * (barWidth + gap);

    const barHeight =
      2;


    canvasContext.fillStyle =
      "rgba(90,120,255,.22)";


    canvasContext.fillRect(
      x,
      height - barHeight,
      barWidth,
      barHeight
    );

  }

}


/* =====================================================
   START SPECTRUM
===================================================== */

drawSpectrum();
