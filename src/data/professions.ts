import { ProfessionItem } from '../types/career';
import { IT_DATA_PROFESSIONS } from './professions/itData';
import { DESIGN_CREATIVE_PROFESSIONS } from './professions/designCreative';
import { MEDICINE_BIO_PROFESSIONS } from './professions/medicineBio';
import { ENGINEERING_ENERGY_PROFESSIONS } from './professions/engineeringEnergy';
import { BUSINESS_LAW_PROFESSIONS } from './professions/businessLaw';
import { EDUCATION_MEDIA_PROFESSIONS } from './professions/educationMedia';

export const PROFESSIONS_CATALOG: ProfessionItem[] = [
  ...IT_DATA_PROFESSIONS,
  ...DESIGN_CREATIVE_PROFESSIONS,
  ...MEDICINE_BIO_PROFESSIONS,
  ...ENGINEERING_ENERGY_PROFESSIONS,
  ...BUSINESS_LAW_PROFESSIONS,
  ...EDUCATION_MEDIA_PROFESSIONS,
];
