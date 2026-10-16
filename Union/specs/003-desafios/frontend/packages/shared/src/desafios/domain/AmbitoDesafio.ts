export class AmbitoDesafio {
  readonly valor: string;

  constructor(valor: string) {
    const limpio = valor.trim();
    // Pendiente de reemplazar por ErrorValidacion (T012).
    if (limpio === "") {
      throw new Error("El ámbito no puede estar vacío.");
    }
    this.valor = limpio;
  }
}
