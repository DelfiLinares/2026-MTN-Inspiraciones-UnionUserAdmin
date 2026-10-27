import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CrearPublicacionDialog } from '../../src/presentation/publicaciones/CrearPublicacionDialog'
import * as servicio from '../../src/services/publicacionService'
vi.mock('../../src/services/publicacionService', () => ({ obtenerCategoriasPublicacion: vi.fn(), buscarUsuariosEtiquetables: vi.fn(), subirImagenPublicacion: vi.fn(), crearPublicacionCompleta: vi.fn() }))
describe('Publicación con archivo del dispositivo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    URL.createObjectURL = vi.fn(() => 'blob:preview'); URL.revokeObjectURL = vi.fn()
    vi.mocked(servicio.obtenerCategoriasPublicacion).mockResolvedValue([])
    vi.mocked(servicio.subirImagenPublicacion).mockResolvedValue('/api/imagenes/imagen.png')
    vi.mocked(servicio.crearPublicacionCompleta).mockResolvedValue({} as never)
  })
  it('sube el archivo seleccionado y usa la dirección devuelta por el servidor', async () => {
    const correcto=vi.fn()
    render(<CrearPublicacionDialog onSuccess={correcto} onCancel={vi.fn()} />)
    fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: 'IMAGEN' } })
    const imagen=new File(['png'], 'retrato.png', { type: 'image/png' })
    fireEvent.change(screen.getByLabelText(/Imagen del dispositivo/), { target: { files: [imagen] } })
    fireEvent.change(screen.getByLabelText('Contenido de la publicación'), { target: { value: 'Retrato' } })
    expect(screen.queryByLabelText('URL de la imagen')).toBeNull()
    await screen.findByAltText('Vista previa de la imagen seleccionada')
    fireEvent.click(screen.getByRole('button', { name: 'Publicar', exact:true }))
    await waitFor(() => expect(correcto).toHaveBeenCalledOnce())
    expect(servicio.subirImagenPublicacion).toHaveBeenCalledWith(imagen)
    expect(servicio.crearPublicacionCompleta).toHaveBeenCalledWith(expect.objectContaining({fotoUrl:'/api/imagenes/imagen.png',tipoContenido:'IMAGEN'}))
  })
  it('conserva el formulario y no publica si falla la subida', async () => {
    vi.mocked(servicio.subirImagenPublicacion).mockRejectedValue(new Error('No se pudo subir la imagen'))
    const correcto=vi.fn()
    render(<CrearPublicacionDialog onSuccess={correcto} onCancel={vi.fn()} />)
    fireEvent.change(screen.getByLabelText('Tipo'), { target: { value:'IMAGEN' } })
    fireEvent.change(screen.getByLabelText(/Imagen del dispositivo/), { target: { files:[new File(['png'],'retrato.png',{type:'image/png'})] } })
    fireEvent.change(screen.getByLabelText('Contenido de la publicación'), { target: { value:'Retrato' } })
    fireEvent.click(screen.getByRole('button', { name:'Publicar',exact:true }))
    await screen.findByRole('alert')
    expect(screen.getByLabelText('Contenido de la publicación')).toHaveValue('Retrato')
    expect(servicio.crearPublicacionCompleta).not.toHaveBeenCalled()
    expect(correcto).not.toHaveBeenCalled()
  })
})
