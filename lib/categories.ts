export type SpecField = {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  options?: string[];
  unit?: string;
  filterable?: boolean;
};

export type Category = {
  id: string;
  label: string;
  icon: string;
  specs: SpecField[];
};

export const CATEGORIES: Category[] = [
  {
    id: 'skis',
    label: 'Skis',
    icon: '🎿',
    specs: [
      {
        key: 'tipo',
        label: 'Tipo',
        type: 'select',
        options: ['SL', 'GS', 'SG', 'DH', 'Park', 'Freeride', 'Powder', 'All Mountain'],
        filterable: true,
      },
      { key: 'largo_cm', label: 'Largo (cm)', type: 'number', unit: 'cm', filterable: true },
      { key: 'ancho_cintura_mm', label: 'Ancho cintura (mm)', type: 'number', unit: 'mm' },
      { key: 'radio_curva_m', label: 'Radio de curva (m)', type: 'number', unit: 'm' },
      {
        key: 'genero',
        label: 'Género',
        type: 'select',
        options: ['Hombre', 'Mujer', 'Unisex', 'Junior'],
        filterable: true,
      },
      { key: 'fijaciones_incluidas', label: 'Fijaciones incluidas', type: 'boolean' },
      { key: 'marca', label: 'Marca', type: 'text', filterable: true },
      {
        key: 'nivel',
        label: 'Nivel',
        type: 'select',
        options: ['Principiante', 'Intermedio', 'Avanzado', 'Experto'],
        filterable: true,
      },
    ],
  },
  {
    id: 'botas',
    label: 'Botas de Ski',
    icon: '👢',
    specs: [
      { key: 'talla_mondo', label: 'Talla Mondo', type: 'number', unit: 'mp', filterable: true },
      { key: 'ancho_suela_mm', label: 'Ancho suela (mm)', type: 'number', unit: 'mm' },
      { key: 'flex', label: 'Flex', type: 'number', filterable: true },
      {
        key: 'tipo',
        label: 'Tipo',
        type: 'select',
        options: ['Alpino', 'Telemark', 'Tourer', 'Race'],
        filterable: true,
      },
      {
        key: 'genero',
        label: 'Género',
        type: 'select',
        options: ['Hombre', 'Mujer', 'Unisex', 'Junior'],
        filterable: true,
      },
      { key: 'walk_mode', label: 'Walk Mode', type: 'boolean' },
      { key: 'marca', label: 'Marca', type: 'text', filterable: true },
    ],
  },
  {
    id: 'bastones',
    label: 'Bastones',
    icon: '🏒',
    specs: [
      { key: 'largo_cm', label: 'Largo (cm)', type: 'number', unit: 'cm', filterable: true },
      {
        key: 'tipo',
        label: 'Tipo',
        type: 'select',
        options: ['recto', 'curvo'],
        filterable: true,
      },
      {
        key: 'material',
        label: 'Material',
        type: 'select',
        options: ['Aluminio', 'Carbono', 'Composite'],
        filterable: true,
      },
      {
        key: 'genero',
        label: 'Género',
        type: 'select',
        options: ['Hombre', 'Mujer', 'Unisex', 'Junior'],
        filterable: true,
      },
      { key: 'marca', label: 'Marca', type: 'text', filterable: true },
    ],
  },
  {
    id: 'cascos',
    label: 'Cascos',
    icon: '⛑️',
    specs: [
      {
        key: 'talla',
        label: 'Talla',
        type: 'select',
        options: ['XS', 'S', 'M', 'L', 'XL', 'Ajustable'],
        filterable: true,
      },
      {
        key: 'tipo',
        label: 'Tipo',
        type: 'select',
        options: ['Freeride', 'Race', 'All Mountain'],
        filterable: true,
      },
      { key: 'certificacion_fis', label: 'Certificación FIS', type: 'boolean', filterable: true },
      { key: 'visera_integrada', label: 'Visera integrada', type: 'boolean' },
      { key: 'marca', label: 'Marca', type: 'text', filterable: true },
    ],
  },
  {
    id: 'antiparras',
    label: 'Antiparras',
    icon: '🥽',
    specs: [
      {
        key: 'talla_lente',
        label: 'Talla lente',
        type: 'select',
        options: ['S', 'M', 'L', 'XL'],
        filterable: true,
      },
      { key: 'vlt_percent', label: 'VLT (%)', type: 'number', unit: '%' },
      { key: 'quick_change', label: 'Quick Change', type: 'boolean', filterable: true },
      { key: 'otg', label: 'OTG (sobre gafas)', type: 'boolean', filterable: true },
      { key: 'marca', label: 'Marca', type: 'text', filterable: true },
    ],
  },
  {
    id: 'fijaciones_ski',
    label: 'Fijaciones Ski',
    icon: '🔧',
    specs: [
      { key: 'din_min', label: 'DIN mínimo', type: 'number', filterable: true },
      { key: 'din_max', label: 'DIN máximo', type: 'number', filterable: true },
      {
        key: 'tipo',
        label: 'Tipo',
        type: 'select',
        options: ['Alpine', 'Telemark', 'Tour', 'Race'],
        filterable: true,
      },
      {
        key: 'compatibilidad_suela',
        label: 'Compatibilidad suela',
        type: 'select',
        options: ['Alpine', 'WTR', 'GripWalk', 'MNC'],
      },
      { key: 'freno_mm', label: 'Freno (mm)', type: 'number', unit: 'mm' },
      { key: 'marca', label: 'Marca', type: 'text', filterable: true },
    ],
  },
  {
    id: 'tabla_snowboard',
    label: 'Tabla Snowboard',
    icon: '🏂',
    specs: [
      { key: 'largo_cm', label: 'Largo (cm)', type: 'number', unit: 'cm', filterable: true },
      { key: 'ancho_mm', label: 'Ancho (mm)', type: 'number', unit: 'mm' },
      {
        key: 'perfil',
        label: 'Perfil',
        type: 'select',
        options: ['Camber', 'Rocker', 'Flat', 'Hybrid'],
        filterable: true,
      },
      {
        key: 'tipo',
        label: 'Tipo',
        type: 'select',
        options: ['All Mountain', 'Freestyle', 'Freeride', 'Race'],
        filterable: true,
      },
      {
        key: 'genero',
        label: 'Género',
        type: 'select',
        options: ['Hombre', 'Mujer', 'Unisex', 'Junior'],
        filterable: true,
      },
      { key: 'marca', label: 'Marca', type: 'text', filterable: true },
    ],
  },
  {
    id: 'fijaciones_snowboard',
    label: 'Fijaciones Snowboard',
    icon: '⚙️',
    specs: [
      {
        key: 'talla',
        label: 'Talla',
        type: 'select',
        options: ['XS', 'S', 'M', 'L', 'XL'],
        filterable: true,
      },
      {
        key: 'tipo',
        label: 'Tipo',
        type: 'select',
        options: ['Strap', 'Step-On', 'Flow'],
        filterable: true,
      },
      {
        key: 'flex',
        label: 'Flex',
        type: 'select',
        options: ['Suave', 'Medio', 'Rígido'],
        filterable: true,
      },
      { key: 'marca', label: 'Marca', type: 'text', filterable: true },
    ],
  },
  {
    id: 'parka',
    label: 'Parka',
    icon: '🧥',
    specs: [
      {
        key: 'talla',
        label: 'Talla',
        type: 'select',
        options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        filterable: true,
      },
      {
        key: 'tipo',
        label: 'Tipo',
        type: 'select',
        options: ['Shell', 'Insulada', '3-en-1'],
        filterable: true,
      },
      { key: 'impermeabilidad_mm', label: 'Impermeabilidad (mm)', type: 'number', unit: 'mm' },
      {
        key: 'genero',
        label: 'Género',
        type: 'select',
        options: ['Hombre', 'Mujer', 'Unisex', 'Junior'],
        filterable: true,
      },
      { key: 'marca', label: 'Marca', type: 'text', filterable: true },
    ],
  },
  {
    id: 'pantalon',
    label: 'Pantalón',
    icon: '👖',
    specs: [
      {
        key: 'talla',
        label: 'Talla',
        type: 'select',
        options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        filterable: true,
      },
      {
        key: 'tipo',
        label: 'Tipo',
        type: 'select',
        options: ['Shell', 'Insulado', 'Softshell'],
        filterable: true,
      },
      { key: 'impermeabilidad_mm', label: 'Impermeabilidad (mm)', type: 'number', unit: 'mm' },
      {
        key: 'genero',
        label: 'Género',
        type: 'select',
        options: ['Hombre', 'Mujer', 'Unisex', 'Junior'],
        filterable: true,
      },
      { key: 'marca', label: 'Marca', type: 'text', filterable: true },
    ],
  },
  {
    id: 'traje_descenso',
    label: 'Traje de Descenso',
    icon: '🏅',
    specs: [
      {
        key: 'talla',
        label: 'Talla',
        type: 'select',
        options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        filterable: true,
      },
      {
        key: 'disciplina',
        label: 'Disciplina',
        type: 'select',
        options: ['SL', 'GS', 'SG', 'DH', 'Combinado'],
        filterable: true,
      },
      { key: 'homologacion_fis', label: 'Homologación FIS', type: 'boolean', filterable: true },
      {
        key: 'tipo',
        label: 'Tipo',
        type: 'select',
        options: ['Speed', 'Tech', 'All Events'],
        filterable: true,
      },
      {
        key: 'genero',
        label: 'Género',
        type: 'select',
        options: ['Hombre', 'Mujer', 'Unisex', 'Junior'],
        filterable: true,
      },
      { key: 'marca', label: 'Marca', type: 'text', filterable: true },
    ],
  },
  {
    id: 'guantes',
    label: 'Guantes',
    icon: '🧤',
    specs: [
      {
        key: 'talla',
        label: 'Talla',
        type: 'select',
        options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        filterable: true,
      },
      {
        key: 'tipo',
        label: 'Tipo',
        type: 'select',
        options: ['Guante', 'Manopla', 'Trigger', 'Lobster'],
        filterable: true,
      },
      {
        key: 'uso',
        label: 'Uso',
        type: 'select',
        options: ['Freeride', 'Race', 'All Mountain', 'Freestyle'],
        filterable: true,
      },
      {
        key: 'genero',
        label: 'Género',
        type: 'select',
        options: ['Hombre', 'Mujer', 'Unisex', 'Junior'],
        filterable: true,
      },
      { key: 'marca', label: 'Marca', type: 'text', filterable: true },
    ],
  },
];

export const REGIONS = [
  'RM',
  'Valparaíso',
  "O'Higgins",
  'Maule',
  'Biobío',
  'Araucanía',
  'Los Lagos',
  'Aysén',
  'Magallanes',
  'Otra',
];

export const ESTACIONES = [
  'Valle Nevado',
  'La Parva',
  'El Colorado',
  'Portillo',
  'Chapa Verde',
  'Corralco',
  'Antillanca',
  'Cerro Castillo',
  'Nevados de Chillán',
  'Otra',
];

export const CONDITIONS = [
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'como_nuevo', label: 'Como nuevo' },
  { value: 'bueno', label: 'Bueno' },
  { value: 'regular', label: 'Regular' },
];

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function getCategoryLabel(id: string): string {
  return getCategoryById(id)?.label ?? id;
}
