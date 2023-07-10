// FRECUENCIA A ARREGLAR

const AMPLITUD_MINIMA = 0.08; //esto lo hago porque aunque no haya sonido la amplitud se mueve
const AMPLITUD_MAXIMA = 0.9;
const modeloAplausos =
  "https://teachablemachine.withgoogle.com/models/naa8C2egQ/";
const pitchModel =
  "https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/";
const SRC_PINCELADAS_ARRAY = [];
const CANTIDAD_PINCELADAS = 21;
const CANTIDAD_COLUMNAS = 10;

const audioThings = {
  microfono: null,
  audioContext: null,
  amplitud: null,
};

const pinceladasActuales = [];
const pinceladasAplausoActuales = [];
let columnas = [];
let capaPinceladas, capaColumnas, capaPinceladasBlancas, capaAplausos;
let label; //chequea si es aplauso o ruido de fondo
let frecuencia;
let framesEnSilencio = 0;
let pitch;

function preload() {
  clasificadorDeAplausos = ml5.soundClassifier(modeloAplausos + "model.json");

  for (let i = 0; i < CANTIDAD_PINCELADAS; i++) {
    let nombre = "data/pinceladas" + nf(i, 2) + ".png";
    console.log(nombre);
    SRC_PINCELADAS_ARRAY[i] = loadImage(nombre);
  }
}
function setup() {
  audioThings.microfono = new p5.AudioIn();
  audioThings.audioContext = getAudioContext();
  audioThings.amplitud = audioThings.microfono.getLevel();

  clasificadorDeAplausos.classify((error, results) => {
    if (error) return console.error(error);
    label = results[0].label;
  });
  audioThings.microfono.start(() => {
    pitch = ml5.pitchDetection(
      pitchModel,
      audioThings.audioContext,
      audioThings.microfono.stream,
      () => {
        const setGetter = () => {
          pitch.getPitch((err, frequency) => {
            if (frequency) frecuencia = frequency;
            setGetter();
          });
        };
        setGetter();
      }
    );
  });

  userStartAudio();
  canvas = createCanvas(windowHeight, windowHeight);
  capaColumnas = createGraphics(windowWidth, windowHeight);
  capaPinceladas = createGraphics(windowWidth, windowHeight);
  capaPinceladasBlancas = createGraphics(windowWidth, windowHeight);
  for (let i = 0; i < CANTIDAD_COLUMNAS; i++) {
    const ancho = canvas.width / CANTIDAD_COLUMNAS / 2;
    let xColumna = ancho * 2 * i; // Espacio horizontal entre las columnas
    let columna = new Columnas(xColumna, 0, ancho, 50, capaColumnas); // Crear un objeto columna en la posición x
    columnas.push(columna); // Agregar el objeto columna al array
  }
}

function draw() {
  background(119, 125, 121);
  logearData({
    frecuencia: frecuencia || "",
    amplitud: audioThings.microfono.getLevel(),
    pinceladasActuales: pinceladasActuales.length,
  });

  const haySonido = audioThings.microfono.getLevel() > AMPLITUD_MINIMA;

  coso: if (haySonido == true && frameCount % 2 == 0) {
    framesEnSilencio = 0;
    if (label == "Class 2") {
      const newPinc = new Pincelada("applause", canvas, capaAplausos);
      pinceladasAplausoActuales.push(newPinc);
    } else {
      const capa = frecuencia > 500 ? capaPinceladasBlancas : capaPinceladas;
      const newPincelada = new Pincelada(frecuencia, canvas, capa);
      pinceladasActuales.push(newPincelada);
    }
  } else {
    framesEnSilencio++;
    const silenceFramesLimit = 30 * 5;
    if (framesEnSilencio > silenceFramesLimit) capaPinceladas.clear();
  }

  Pincelada.adjustPinceladasActuales(pinceladasActuales, 30);
  Pincelada.pintarPinceladas(pinceladasActuales);
  Pincelada.adjustPinceladasActuales(pinceladasAplausoActuales, 5);
  Pincelada.pintarPinceladas(pinceladasAplausoActuales);

  columnas.forEach((columna) => {
    columna.mostrar();
    columna.mover();
  });
  image(capaColumnas, 0, 0);
  image(capaPinceladas, 0, 0);
}

const logearData = (data) => {
  const div = document.getElementById("debugBox");
  div.innerHTML = `<pre>${JSON.stringify(data, null, 2)}<pre>`;
};
