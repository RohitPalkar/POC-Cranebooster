const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=640&q=70`

export const photos = {
  craneBuilding: { src: u('photo-1649126476872-4bb42efde7f8'), alt: 'Crane working beside a building under construction' },
  craneOrange: { src: u('photo-1625451102313-c4610feca0b7'), alt: 'Orange crane boom against a cloudy sky' },
  concrete: { src: u('photo-1529081606-ca4a5a53beab'), alt: 'Concrete structure with exposed slabs' },
  bridge: { src: u('photo-1687342101284-8378d5eee850'), alt: 'Underside of a concrete bridge deck' },
  siteRoad: { src: u('photo-1655651381741-6e599389603a'), alt: 'Site access road lined with plants' },
}
