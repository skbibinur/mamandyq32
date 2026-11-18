import type { AbilityDefinition, LikertOption } from '../types/career';

export const ABILITIES: AbilityDefinition[] = [
  {
    id: 'physical',
    order: 1,
    title: 'Физикалық қабілет',
    shortDescription:
      'Қозғалыс арқылы әрекет ету, қолмен нақты бұйым жасау және белсенді ортада еркін жұмыс істеу.',
    iconName: 'Activity',
  },
  {
    id: 'spatial',
    order: 2,
    title: 'Кеңістіктік қабілет',
    shortDescription:
      'Пішіндерді, сызбаларды, карталар мен 3D кеңістікті ойша елестету және бағдарлау.',
    iconName: 'Box',
  },
  {
    id: 'social',
    order: 3,
    title: 'Әлеуметтік қабілет',
    shortDescription:
      'Адамдармен тіл табысу, командада үйлесімді жұмыс істеу, тыңдау және қолдау көрсету.',
    iconName: 'Users',
  },
  {
    id: 'nature',
    order: 4,
    title: 'Табиғат қабілеті',
    shortDescription:
      'Тірі табиғатты, экожүйе мен қоршаған орта құбылыстарын байқау және оларға қамқорлық жасау.',
    iconName: 'Leaf',
  },
  {
    id: 'aesthetic',
    order: 5,
    title: 'Эстетикалық қабілет',
    shortDescription:
      'Түс, пішін, дыбыс және композиция үйлесімін сезіну, көркем әрі тартымды нәтиже жасау.',
    iconName: 'Palette',
  },
  {
    id: 'linguistic',
    order: 6,
    title: 'Тілдік қабілет',
    shortDescription:
      'Ойды ауызша және жазбаша анық жеткізу, мәтінмен жұмыс істеу және тілдерді меңгеру.',
    iconName: 'Languages',
  },
  {
    id: 'logical',
    order: 7,
    title: 'Логикалық қабілет',
    shortDescription:
      'Заңдылықтарды табу, себеп-салдарды дәлелдеу, математикалық және аналитикалық есептерді шешу.',
    iconName: 'Calculator',
  },
  {
    id: 'informational',
    order: 8,
    title: 'Ақпараттық қабілет',
    shortDescription:
      'Қажетті мәліметті жылдам іздеу, фактілерді тексеру, деректерді сұрыптау және салыстыру.',
    iconName: 'SearchCheck',
  },
  {
    id: 'meaning',
    order: 9,
    title: 'Мағыналық қабілет',
    shortDescription:
      'Істің терең мақсаты мен құндылығын түсіну, қоғамға пайдасы мен этикалық қырын бағалау.',
    iconName: 'Compass',
  },
  {
    id: 'systemic',
    order: 10,
    title: 'Жүйелік қабілет',
    shortDescription:
      'Үлкен міндетті кезеңдерге бөліп жоспарлау, үдерістерді реттеу және элементтер байланысын көру.',
    iconName: 'Workflow',
  },
  {
    id: 'innovative',
    order: 11,
    title: 'Инновациялық қабілет',
    shortDescription:
      'Тың идеялар ойлап табу, үйреншікті тәсілдерді жаңарту және жаңа шешімдерді сынап көру.',
    iconName: 'Lightbulb',
  },
  {
    id: 'ai_literacy',
    order: 12,
    title: 'ЖИ қолдану қабілеті',
    shortDescription:
      'Жасанды интеллект құралдарына сауатты сұраныс құрап, нәтижесін сыни тексеріп тиімді пайдалану.',
    iconName: 'Cpu',
  },
];

export const LIKERT_SCALE: LikertOption[] = [
  { value: 1, label: 'Маған мүлде тән емес', shortLabel: 'Мүлде тән емес' },
  { value: 2, label: 'Көбіне тән емес', shortLabel: 'Сирек тән' },
  { value: 3, label: 'Кейде тән', shortLabel: 'Орташа' },
  { value: 4, label: 'Көбіне тән', shortLabel: 'Көбіне тән' },
  { value: 5, label: 'Маған толық тән', shortLabel: 'Толық тән' },
];
