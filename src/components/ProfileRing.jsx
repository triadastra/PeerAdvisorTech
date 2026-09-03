import { motion } from 'framer-motion';
import { roleGradient, rolesFor, TRAFFIC_ROLES } from '../data/trafficRoles';

export default function ProfileRing({ person, spin = true, shape = 'ring', showAvatar = true, className = '' }) {
  const roles = rolesFor(person);
  const round = shape === 'ring';

  return (
    <motion.div
      className={`chromatic-frame ${round ? 'chromatic-frame--round' : 'chromatic-frame--box'} ${spin ? 'chromatic-frame--moving' : ''} ${className}`}
      style={{ '--role-gradient': roleGradient(roles) }}
      aria-label={roles.map((role) => TRAFFIC_ROLES[role].label || 'Historical').join(' + ')}
    >
      <div className={`chromatic-frame__inner ${round ? 'rounded-full' : ''}`}>
        {showAvatar && (
          <span className={round ? 'font-display text-3xl font-semibold text-ink-50' : 'font-mono text-xs'}>{person.avatar}</span>
        )}
      </div>
    </motion.div>
  );
}
