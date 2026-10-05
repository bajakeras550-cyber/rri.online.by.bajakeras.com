/* =====================================
   RRI PRO 1 MATARAM
   RADIO STREAM
===================================== */

const STREAM_URL =
"https://stream-node1.rri.co.id/streaming/13/9113/rrimatarampro1.mp3";


const audio =
document.getElementById("radioAudio");

const playButton =
document.getElementById("playButton");

const volume =
document.getElementById("volume");

const volumeText =
document.getElementById("volumeText");

const status =
document.querySelector(".status");

const statusText =
document.getElementById("statusText");

const visualizer =
document.querySelector(".visualizer");


/* =====================================
   AUDIO
===================================== */

audio.src = STREAM_URL;

audio.volume = 0.85;


/* =====================================
   PLAY / PAUSE
===================================== */

async function toggleRadio() {

  try {

    if (audio.paused) {

      statusText.innerText =
        "Menghubungkan...";

      await audio.play();

      playButton.innerText = "Ⅱ";

      status.classList.add("playing");

      statusText.innerText =
        "Sedang live";

      visualizer.classList.add("active");

    }

    else {

      audio.pause();

      playButton.innerText = "▶";

      status.classList.remove("playing");

      statusText.innerText =
        "Dijeda";

      visualizer.classList.remove("active");

    }

  }

  catch(error) {

    console.log(error);

    statusText.innerText =
      "Gagal memutar stream";

  }

}


/* =====================================
   VOLUME
===================================== */

function changeVolume() {

  const value =
    Number(volume.value);

  audio.volume =
    value / 100;

  volumeText.innerText =
    value + "%";

}


/* =====================================
   MUTE
===================================== */

function toggleMute() {

  audio.muted =
    !audio.muted;

}


/* =====================================
   STATUS AUDIO
===================================== */

audio.addEventListener(
  "playing",
  function() {

    statusText.innerText =
      "Sedang live";

    status.classList.add(
      "playing"
    );

    visualizer.classList.add(
      "active"
    );

    playButton.innerText =
      "Ⅱ";

  }
);


audio.addEventListener(
  "waiting",
  function() {

    statusText.innerText =
      "Buffering...";

  }
);


audio.addEventListener(
  "stalled",
  function() {

    statusText.innerText =
      "Koneksi tersendat";

  }
);


audio.addEventListener(
  "error",
  function() {

    statusText.innerText =
      "Stream tidak tersedia";

    status.classList.remove(
      "playing"
    );

    visualizer.classList.remove(
      "active"
    );

  }
);


/* =====================================
   EQUALIZER
===================================== */

const bass =
document.getElementById("bass");

const mid =
document.getElementById("mid");

const treble =
document.getElementById("treble");


const bassValue =
document.getElementById("bassValue");

const midValue =
document.getElementById("midValue");

const trebleValue =
document.getElementById("trebleValue");


function updateEQ() {

  const bassNumber =
    Number(bass.value);

  const midNumber =
    Number(mid.value);

  const trebleNumber =
    Number(treble.value);


  bassValue.innerText =
    formatDB(bassNumber);

  midValue.innerText =
    formatDB(midNumber);

  trebleValue.innerText =
    formatDB(trebleNumber);

}


function formatDB(value) {

  if (value > 0) {

    return "+" + value + " dB";

  }

  return value + " dB";

}


/* =====================================
   PRESET
===================================== */

function changePreset() {

  const preset =
    document.getElementById(
      "preset"
    ).value;


  if (preset === "flat") {

    bass.value = 0;
    mid.value = 0;
    treble.value = 0;

  }


  if (preset === "bass") {

    bass.value = 8;
    mid.value = 1;
    treble.value = 3;

  }


  if (preset === "vocal") {

    bass.value = -2;
    mid.value = 5;
    treble.value = 3;

  }


  if (preset === "treble") {

    bass.value = 2;
    mid.value = 1;
    treble.value = 8;

  }


  if (preset === "radio") {

    bass.value = 4;
    mid.value = 3;
    treble.value = 5;

  }


  updateEQ();

}


updateEQ();
