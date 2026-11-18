import {
  Activity,
  Box,
  Calculator,
  Compass,
  Cpu,
  Languages,
  Leaf,
  Lightbulb,
  Palette,
  SearchCheck,
  Users,
  Workflow,
} from 'lucide-react';
import type { AbilityIconName } from '../types/career';

interface AbilityIconProps {
  name: AbilityIconName;
  className?: string;
}

export function AbilityIcon({ name, className = 'w-5 h-5' }: AbilityIconProps) {
  switch (name) {
    case 'Activity':
      return <Activity className={className} aria-hidden="true" />;
    case 'Box':
      return <Box className={className} aria-hidden="true" />;
    case 'Users':
      return <Users className={className} aria-hidden="true" />;
    case 'Leaf':
      return <Leaf className={className} aria-hidden="true" />;
    case 'Palette':
      return <Palette className={className} aria-hidden="true" />;
    case 'Languages':
      return <Languages className={className} aria-hidden="true" />;
    case 'Calculator':
      return <Calculator className={className} aria-hidden="true" />;
    case 'SearchCheck':
      return <SearchCheck className={className} aria-hidden="true" />;
    case 'Compass':
      return <Compass className={className} aria-hidden="true" />;
    case 'Workflow':
      return <Workflow className={className} aria-hidden="true" />;
    case 'Lightbulb':
      return <Lightbulb className={className} aria-hidden="true" />;
    case 'Cpu':
      return <Cpu className={className} aria-hidden="true" />;
  }
}
