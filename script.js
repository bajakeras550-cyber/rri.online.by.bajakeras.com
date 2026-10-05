/* =====================================================
   RRI.ONLINE BY.BAJAKERAS
   ===================================================== */


/* =====================================================
   1. MASUKKAN STREAM RRI LAMA DI SINI
   ===================================================== */

const STREAM_URL = "MASUKKAN_URL_STREAM_RRI_LAMA_DI_SINI";


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

const resetEQ = document.getElementById("resetEQ");

const spectrumCanvas = document.getElementById("spectrum");
const spectrumStatus = document.getElementById("spectrumStatus");

const eqSliders = document.querySelectorAll(
  '.eq-band input[type="range"]'
);


/* =====================================================
   AUDIO VARIABLES
   ===================================================== */

let audioContext = null;

let sourceNode = null;

let analyser = null;

let filters = [];

let audioReady = false;


/* 10 BAND */

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
   CANVAS
   ===================================================== */

const canvasContext = spectrumCanvas.getContext("2d");


function resizeCanvas() {

  const rect = spectrumCanvas.getBoundingClientRect();

  const dpr = window.devicePixelRatio || 1;

  spectrumCanvas.width = rect.width * dpr;

  spectrumCanvas.height = rect.height * dpr;

  canvasContext.setTransform(
    dpr,
    0,
    0,
    dpr,
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
   AUDIO ENGINE
   ===================================================== */

function createAudioEngine() {

  if (audioReady) {
    return true;
  }

  try {

    audioContext = new (
      window.AudioContext ||
      window.webkitAudioContext
    )();


    /*
      Audio dari <audio>
      masuk ke Web Audio.
    */

    sourceNode =
      audioContext.createMediaElementSource(audio);


    /*
      10 FILTER
    */

    let previousNode = sourceNode;


    frequencies.forEach((frequency) => {

      const filter =
        audioContext.createBiquadFilter();

      filter.type = "peaking";

      filter.frequency.value = frequency;

      filter.Q.value = 1.15;

      filter.gain.value = 0;


      previousNode.connect(filter);

      previousNode = filter;

      filters.push(filter);

    });


    /*
      ANALYSER
    */

    analyser =
      audioContext.createAnalyser();

    analyser.fftSize = 2048;

    analyser.smoothingTimeConstant = 0.82;


    previousNode.connect(analyser);


    /*
      OUTPUT
    */

    analyser.connect(
      audioContext.destination
    );


    audioReady = true;

    return true;

  } catch (error) {

    console.error(
      "Audio engine error:",
      error
    );

    statusText.textContent =
      "Audio engine tidak tersedia";

    return false;
  }
}


/* =====================================================
   PLAY
   ===================================================== */

playButton.addEventListener(
  "click",
  async () => {

    /*
      Pastikan URL sudah diisi.
    */

    if (
      !STREAM_URL ||
      STREAM_URL.includes(
        "MASUKKAN_URL"
      )
    ) {

      statusText.textContent =
        "Isi URL stream RRI terlebih dahulu";

      return;
    }


    try {

      /*
        AudioContext hanya dibuat setelah
        pengguna menekan tombol.
      */

      if (!createAudioEngine()) {
        return;
      }


      if (
        audioContext.state === "suspended"
      ) {

        await audioContext.resume();

      }


      /*
        Jangan set src berulang kali.
      */

      if (
        audio.src !== STREAM_URL
      ) {

        audio.src = STREAM_URL;

        audio.load();

      }


      if (audio.paused) {

        statusText.textContent =
          "Menghubungkan ke RRI...";

        spectrumStatus.textContent =
          "● CONNECTING";

        await audio.play();

      } else {

        audio.pause();

      }

    } catch (error) {

      console.error(error);

      statusText.textContent =
        "Radio tidak dapat diputar";

      spectrumStatus.textContent =
        "● ERROR";
    }

  }
);


/* =====================================================
   AUDIO EVENTS
   ===================================================== */

audio.addEventListener(
  "playing",
  () => {

    playIcon.textContent = "❚❚";

    playButton.classList.add(
      "playing"
    );

    statusText.textContent =
      "Sedang diputar";

    spectrumStatus.textContent =
      "● LIVE";
  }
);


audio.addEventListener(
  "pause",
  () => {

    playIcon.textContent = "▶";

    playButton.classList.remove(
      "playing"
    );

    statusText.textContent =
      "Radio dijeda";

    spectrumStatus.textContent =
      "● PAUSED";
  }
);


audio.addEventListener(
  "waiting",
  () => {

    statusText.textContent =
      "Buffering...";

    spectrumStatus.textContent =
      "● BUFFERING";
  }
);


audio.addEventListener(
  "error",
  () => {

    console.error(
      "Audio error:",
      audio.error
    );

    statusText.textContent =
      "Stream RRI bermasalah";

    spectrumStatus.textContent =
      "● ERROR";
  }
);


/* =====================================================
   VOLUME
   ===================================================== */

audio.volume =
  Number(volumeSlider.value) / 100;


volumeSlider.addEventListener(
  "input",
  () => {

    const value =
      Number(volumeSlider.value);

    audio.volume =
      value / 100;

    volumeValue.textContent =
      value + "%";


    if (value === 0) {

      volumeIcon.textContent = "🔇";

    } else if (value < 50) {

      volumeIcon.textContent = "🔉";

    } else {

      volumeIcon.textContent = "🔊";

    }

  }
);


/* =====================================================
   EQUALIZER
   ===================================================== */

eqSliders.forEach(
  (slider) => {

    slider.addEventListener(
      "input",
      () => {

        const index =
          Number(slider.dataset.index);

        const value =
          Number(slider.value);


        /*
          Tampilkan angka.
        */

        slider.parentElement
          .querySelector("b")
          .textContent =
            (value > 0 ? "+" : "") +
            value +
            " dB";


        /*
          Ubah filter jika Web Audio
          sudah aktif.
        */

        if (
          filters[index]
        ) {

          filters[index]
            .gain.value = value;

        }

      }
    );

  }
);


/* =====================================================
   RESET EQ
   ===================================================== */

resetEQ.addEventListener(
  "click",
  () => {

    eqSliders.forEach(
      (slider, index) => {

        slider.value = 0;

        slider.parentElement
          .querySelector("b")
          .textContent =
            "0 dB";


        if (
          filters[index]
        ) {

          filters[index]
            .gain.value = 0;

        }

      }
    );

  }
);


/* =====================================================
   REAL-TIME SPECTRUM
   ===================================================== */

function drawSpectrum() {

  requestAnimationFrame(
    drawSpectrum
  );


  const width =
    spectrumCanvas.clientWidth;

  const height =
    spectrumCanvas.clientHeight;


  /*
    Background
  */

  canvasContext.clearRect(
    0,
    0,
    width,
    height
  );


  /*
    Grid
  */

  canvasContext.strokeStyle =
    "rgba(255,255,255,.06)";

  canvasContext.lineWidth = 1;


  for (
    let y = 0;
    y < height;
    y += 40
  ) {

    canvasContext.beginPath();

    canvasContext.moveTo(
      0,
      y
    );

    canvasContext.lineTo(
      width,
      y
    );

    canvasContext.stroke();

  }


  /*
    Kalau belum ada analyser,
    spectrum benar-benar diam.
  */

  if (!analyser) {
    return;
  }


  const bufferLength =
    analyser.frequencyBinCount;

  const data =
    new Uint8Array(
      bufferLength
    );


  analyser.getByteFrequencyData(
    data
  );


  /*
    BAR
  */

  const bars = 80;

  const step =
    Math.max(
      1,
      Math.floor(
        bufferLength / bars
      )
    );

  const barWidth =
    width / bars;


  for (
    let i = 0;
    i < bars;
    i++
  ) {

    const index =
      i * step;


    let sum = 0;

    const count =
      Math.min(
        step,
        bufferLength - index
      );


    for (
      let j = 0;
      j < count;
      j++
    ) {

      sum += data[index + j];

    }


    const average =
      count
        ? sum / count
        : 0;


    const barHeight =
      (average / 255) *
      height *
      0.9;


    const x =
      i * barWidth;


    const y =
      height - barHeight;


    /*
      WARNA BERUBAH
      mengikuti posisi
      spectrum.
    */

    const hue =
      (i * 5 +
       performance.now() * 0.025) % 360;


    const gradient =
      canvasContext.createLinearGradient(
        0,
        y,
        0,
        height
      );


    gradient.addColorStop(
      0,
      `hsl(${hue},100%,65%)`
    );

    gradient.addColorStop(
      1,
      `hsl(${(hue + 80) % 360},100%,45%)`
    );


    canvasContext.fillStyle =
      gradient;


    canvasContext.fillRect(
      x + 1,
      y,
      Math.max(
        1,
        barWidth - 2
      ),
      barHeight
    );

  }

}


drawSpectrum();
