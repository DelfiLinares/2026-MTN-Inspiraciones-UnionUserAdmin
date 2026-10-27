/** Evita guardar URLs blob: que desaparecen al recargar o cambiar de navegador. */
export function leerImagenPersistente(archivo: Blob): Promise<string> {
  if (!['image/jpeg', 'image/png'].includes(archivo.type) || archivo.size > 5 * 1024 * 1024)
    return Promise.reject(new Error('Elegí una imagen JPEG o PNG de hasta 5 MB.'))
  return leerArchivoPersistente(archivo)
}
export function leerArchivoPersistente(archivo: Blob): Promise<string> {
  if (archivo.size > 20 * 1024 * 1024) return Promise.reject(new Error('El archivo no puede superar 20 MB.'))
  return new Promise((resolve, reject) => {
    const lector = new FileReader()
    lector.onload = () => resolve(String(lector.result))
    lector.onerror = () => reject(new Error('No pudimos leer la imagen. Intentá otra vez.'))
    lector.readAsDataURL(archivo)
  })
}
