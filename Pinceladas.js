class Pincelada {
  constructor(frequency, canvas, capaPinceladas) {
    const anchoColumnas = canvas.width / CANTIDAD_COLUMNAS;
    this.pinceladaImg = getPinceladaByFrequency(frequency);
    this.ancho = anchoColumnas * 2;
    if (this.ancho < 150) this.ancho += anchoColumnas;
    this.numeroDeColumna = int(random(0, CANTIDAD_COLUMNAS - 2));
    this.x = this.numeroDeColumna * anchoColumnas;
    this.y = random(0, windowHeight - 250);
    this.capaPinceladas = capaPinceladas;
  }
  opacity = 128;

  paint() {
    this.capaPinceladas.push();
    this.capaPinceladas.tint(255, this.opacity);
    capaPinceladas.image(
      this.pinceladaImg,
      this.x,
      this.y,
      this.ancho,
      this.ancho
    );
    this.capaPinceladas.pop();
  }
  lowerOpacity() {
    this.opacity -= 1;
  }
  getOpacity() {
    return this.opacity;
  }

  static adjustPinceladasActuales(pinceladasActuales, limit) {
    [...pinceladasActuales].reverse().forEach((pincelada) => {
      if (pincelada.getOpacity() < 0) pinceladasActuales.pop();
    });

    for (let i = limit; i < pinceladasActuales.length; i++) {
      const pincelada = pinceladasActuales[i];
      pincelada.lowerOpacity();
    }
  }
  /**
   *
   * @param {Pincelada[]} pinceladasActuales
   */
  static pintarPinceladas(pinceladasActuales) {
    // limpiar la capa para después dibujar las pinceladas
    // con la opacidad correspondiente

    pinceladasActuales[0]?.capaPinceladas.clear();
    pinceladasActuales.forEach((pinc) => pinc.paint());
  }
}
function getPinceladaByFrequency(frequency) {
  if (frequency === "applause") {
    return SRC_PINCELADAS_ARRAY[int(random(18, 20))];
  }
  if (frequency > 500) {
    const numero = int(random(19, 21));
    return SRC_PINCELADAS_ARRAY[numero];
  }
  const numero = random(0, 40);
  if (numero < 30) return SRC_PINCELADAS_ARRAY[int(random(0, 8))];
  if (numero < 40) return SRC_PINCELADAS_ARRAY[int(random(9, 16))];
}
