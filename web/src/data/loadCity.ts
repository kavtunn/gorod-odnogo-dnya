import type { CityData } from '../types'

function withBase(path: string): string {
  const base = import.meta.env.BASE_URL || '/'
  const clean = path.replace(/^\//, '')
  return `${base}${clean}`
}

export async function loadCity(): Promise<CityData> {
  const res = await fetch(withBase('json/city.json'))
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const data = (await res.json()) as CityData

  data.locations = data.locations.map((loc) => {
    const imagePath = loc.image.replace(/^\//, '').replace(/^\.\.\//, '')
    return {
      ...loc,
      image: withBase(imagePath),
    }
  })

  return data
}
