import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ansjiydgsatazlieriie.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuc2ppeWRnc2F0YXpsaWVyaWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNzQ4MjgsImV4cCI6MjA2NDY1MDgyOH0.x5Zswj2owsIrLHopdmyYg-esmalbGScocUxSkPzn6E8'

export const supabase = createClient(supabaseUrl, supabaseKey)


export async function guardarPuntaje(nombre, puntaje) {
  const { data, error } = await supabase.from('puntajes').insert([
    {
      nombre: nombre,
      puntaje: puntaje,
      fecha: new Date().toISOString()
    }
  ])

  if (error) {
    console.error('Error al guardar puntaje:', error)
  } else {
    console.log('Puntaje guardado:', data)
  }
}
