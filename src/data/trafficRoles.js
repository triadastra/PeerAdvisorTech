export const TRAFFIC_ROLES = {
  core: { label: 'Core', color: '#ff0000' },
  dev: { label: 'Dev', color: '#ffff00' },
  affiliations: { label: 'Outreach (Affiliate)', color: '#0000ff' },
  historical: { label: null, color: '#00ff00' },
};

export function rolesFor(person) {
  if (person.status === 'historical') return ['historical'];
  if (person.trafficRoles?.length) return person.trafficRoles;
  return ['dev'];
}

export function roleGradient(roles) {
  const colors = roles.map((role) => TRAFFIC_ROLES[role]?.color).filter(Boolean);
  if (colors.length <= 1) return colors[0] || TRAFFIC_ROLES.dev.color;

  const transition = Math.min(4, 14 / colors.length);
  const segment = 100 / colors.length;
  const stops = [`${colors[0]} 0%`];

  colors.forEach((color, index) => {
    const boundary = (index + 1) * segment;
    const nextColor = colors[(index + 1) % colors.length];
    stops.push(`${color} ${boundary - transition / 2}%`);
    stops.push(`${nextColor} ${Math.min(100, boundary + transition / 2)}%`);
  });

  return `conic-gradient(from -90deg, ${stops.join(', ')})`;
}
