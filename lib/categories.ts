export type SpecField = {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  options?: string[];
  unit?: string;
  placeholder?: string;
  optional?: boolean;
  filterable?: boolean;
  conditional?: { field: string; value: boolean | string };
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
        optional: true,
      },
      { key: 'largo_cm', label: 'Largo', type: 'number', unit: 'cm', placeholder: '170', optional: true, filterable: true },
      { key: 'ancho_cintura_mm', label: 'Ancho cintura', type: 'number', unit: 'mm', placeholder: '72', optional: true },
      { key: 'radio_curva_m', label: 'Radio de curva', type: 'number', unit: 'm', placeholder: '17', optional: true },
      {
        key: 'genero',
        label: 'Género',
        type: 'select',
        options: ['Hombre', 'Mujer', 'Unisex', 'Junior'],
        filterable: true,
        optional: true,
      },
      { key: 'fijaciones_incluidas', label: 'Fijaciones incluidas', type: 'boolean', optional: true },
      { key: 'din_fijaciones', label: 'DIN de las fijaciones', type: 'number', placeholder: '3-10', optional: true, conditional: { field: 'fijaciones_incluidas', value: true } },
      { key: 'marca', label: 'Marca', type: 'text', placeholder: 'Ej: Rossignol', optional: true, filterable: true },
      {
        key: 'nivel',
        label: 'Nivel',
        type: 'select',
        options: ['Principiante', 'Intermedio', 'Avanzado', 'Experto'],
        filterable: true,
        optional: true,
      },
    ],
  },
  {
    id: 'botas',
    label: 'Botas de Ski',
    icon: '👢',
    specs: [
      { key: 'talla_mondo', label: 'Talla Mondo', type: 'number', unit: 'mp', placeholder: '26,5', optional: true, filterable: true },
      { key: 'largo_bota_mm', label: 'Largo de bota', type: 'number', unit: 'mm', placeholder: '308', optional: true },
      { key: 'flex', label: 'Flex', type: 'number', placeholder: '90', optional: true, filterable: true },
      {
        key: 'tipo',
        label: 'Tipo',
        type: 'select',
        options: ['Alpino', 'Telemark', 'Tourer', 'Race'],
        filterable: true,
        optional: true,
      },
      {
        key: 'genero',
        label: 'Género',
        type: 'select',
        options: ['Hombre', 'Mujer', 'Unisex', 'Junior'],
        filterable: true,
        optional: true,
      },
      { key: 'walk_mode', label: 'Walk Mode', type: 'boolean', optional: true },
      { key: 'marca', label: 'Marca', type: 'text', placeholder: 'Ej: Lange', optional: true, filterable: true },
    ],
  },
  {
    id: 'bastones',
    label: 'Bastones',
    icon: '🏒',
    specs: [
      { key: 'largo_cm', label: 'Largo', type: 'number', unit: 'cm', placeholder: '100', optional: true, filterable: true },
      {
        key: 'tipo',
        label: 'Tipo',
        type: 'select',
        options: ['Recto', 'Curvo'],
        filterable: true,
        optional: true,
      },
      {
        key: 'material',
        label: 'Material',
        type: 'select',
        options: ['Aluminio', 'Carbono', 'Composite'],
        filterable: true,
        optional: true,
      },
      {
        key: 'genero',
        label: 'Género',
        type: 'select',
        options: ['Hombre', 'Mujer', 'Unisex', 'Junior'],
        filterable: true,
        optional: true,
      },
      { key: 'con_protecciones', label: 'Incluye protecciones de mano', type: 'boolean', optional: true },
      { key: 'marca', label: 'Marca', type: 'text', placeholder: 'Ej: Leki', optional: true, filterable: true },
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
        options: ['XS', 'S', 'M', 'L', 'XL', 'Ajustable', 'Otro'],
        filterable: true,
        optional: true,
      },
      {
        key: 'tipo',
        label: 'Tipo',
        type: 'select',
        options: ['Freeride', 'Race', 'All Mountain'],
        filterable: true,
        optional: true,
      },
      { key: 'certificacion_fis', label: 'Certificación FIS', type: 'boolean', filterable: true, optional: true },
      { key: 'bozal_slalom', label: '¿Incluye bozal de Slalom?', type: 'boolean', optional: true },
      { key: 'marca', label: 'Marca', type: 'text', placeholder: 'Ej: Uvex', optional: true, filterable: true },
    ],
  },
  {
    id: 'antiparras',
    label: 'Antiparras',
    icon: '🥽',
    specs: [
      { key: 'marca', label: 'Marca', type: 'text', placeholder: 'Ej: Oakley', optional: true, filterable: true },
      { key: 'es_junior', label: '¿Son talla Junior?', type: 'boolean', optional: true, filterable: true },
      {
        key: 'tipo_vista',
        label: 'Tipo de vista',
        type: 'select',
        options: ['Soleado', 'Nublado', 'Noche', 'Fotocromáticas', 'Espejo', 'Otro'],
        filterable: true,
        optional: true,
      },
    ],
  },
  {
    id: 'fijaciones_ski',
    label: 'Fijaciones Ski',
    icon: '🔧',
    specs: [
      { key: 'din_min', label: 'DIN mínimo', type: 'number', placeholder: '3', optional: true, filterable: true },
      { key: 'din_max', label: 'DIN máximo', type: 'number', placeholder: '12', optional: true, filterable: true },
      {
        key: 'tipo',
        label: 'Tipo',
        type: 'select',
        options: ['Alpine', 'Telemark', 'Tour', 'Race'],
        filterable: true,
        optional: true,
      },
      {
        key: 'compatibilidad_suela',
        label: 'Compatibilidad suela',
        type: 'select',
        options: ['Alpine', 'WTR', 'GripWalk', 'MNC'],
        optional: true,
      },
      { key: 'marca', label: 'Marca', type: 'text', placeholder: 'Ej: Marker', optional: true, filterable: true },
    ],
  },
  {
    id: 'tabla_snowboard',
    label: 'Tabla Snowboard',
    icon: '🏂',
    specs: [
      { key: 'largo_cm', label: 'Largo', type: 'number', unit: 'cm', placeholder: '155', optional: true, filterable: true },
      { key: 'ancho_mm', label: 'Ancho', type: 'number', unit: 'mm', placeholder: '250', optional: true },
      {
        key: 'perfil',
        label: 'Perfil',
        type: 'select',
        options: ['Camber', 'Rocker', 'Flat', 'Hybrid'],
        filterable: true,
        optional: true,
      },
      {
        key: 'tipo',
        label: 'Tipo',
        type: 'select',
        options: ['All Mountain', 'Freestyle', 'Freeride', 'Race'],
        filterable: true,
        optional: true,
      },
      {
        key: 'genero',
        label: 'Género',
        type: 'select',
        options: ['Hombre', 'Mujer', 'Unisex', 'Junior'],
        filterable: true,
        optional: true,
      },
      { key: 'fijaciones_incluidas', label: 'Fijaciones incluidas', type: 'boolean', optional: true },
      { key: 'marca', label: 'Marca', type: 'text', placeholder: 'Ej: Burton', optional: true, filterable: true },
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
        options: ['XS', 'S', 'M', 'L', 'XL', 'Otro'],
        filterable: true,
        optional: true,
      },
      {
        key: 'tipo',
        label: 'Tipo',
        type: 'select',
        options: ['Strap', 'Step-On', 'Flow'],
        filterable: true,
        optional: true,
      },
      {
        key: 'flex',
        label: 'Flex',
        type: 'select',
        options: ['Suave', 'Medio', 'Rígido'],
        filterable: true,
        optional: true,
      },
      { key: 'marca', label: 'Marca', type: 'text', placeholder: 'Ej: Burton', optional: true, filterable: true },
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
        options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Otro'],
        filterable: true,
        optional: true,
      },
      {
        key: 'tipo',
        label: 'Tipo',
        type: 'select',
        options: ['Shell', 'Insulada', '3-en-1'],
        filterable: true,
        optional: true,
      },
      { key: 'impermeabilidad_mm', label: 'Impermeabilidad', type: 'number', unit: 'mm', placeholder: '10000', optional: true },
      {
        key: 'genero',
        label: 'Género',
        type: 'select',
        options: ['Hombre', 'Mujer', 'Unisex', 'Junior'],
        filterable: true,
        optional: true,
      },
      { key: 'marca', label: 'Marca', type: 'text', placeholder: 'Ej: The North Face', optional: true, filterable: true },
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
        options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Otro'],
        filterable: true,
        optional: true,
      },
      {
        key: 'tipo',
        label: 'Tipo',
        type: 'select',
        options: ['Shell', 'Insulado', 'Softshell'],
        filterable: true,
        optional: true,
      },
      { key: 'impermeabilidad_mm', label: 'Impermeabilidad', type: 'number', unit: 'mm', placeholder: '10000', optional: true },
      {
        key: 'genero',
        label: 'Género',
        type: 'select',
        options: ['Hombre', 'Mujer', 'Unisex', 'Junior'],
        filterable: true,
        optional: true,
      },
      { key: 'marca', label: 'Marca', type: 'text', placeholder: 'Ej: Spyder', optional: true, filterable: true },
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
        options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Otro'],
        filterable: true,
        optional: true,
      },
      {
        key: 'disciplina',
        label: 'Disciplina',
        type: 'select',
        options: ['SL', 'GS', 'SG', 'DH', 'Combinado'],
        filterable: true,
        optional: true,
      },
      { key: 'homologacion_fis', label: 'Homologación FIS', type: 'boolean', filterable: true, optional: true },
      {
        key: 'tipo',
        label: 'Tipo',
        type: 'select',
        options: ['Speed', 'Tech', 'All Events'],
        filterable: true,
        optional: true,
      },
      {
        key: 'genero',
        label: 'Género',
        type: 'select',
        options: ['Hombre', 'Mujer', 'Unisex', 'Junior'],
        filterable: true,
        optional: true,
      },
      { key: 'marca', label: 'Marca', type: 'text', placeholder: 'Ej: Descente', optional: true, filterable: true },
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
        options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Otro'],
        filterable: true,
        optional: true,
      },
      {
        key: 'tipo',
        label: 'Tipo',
        type: 'select',
        options: ['Guante', 'Manopla', 'Trigger', 'Lobster'],
        filterable: true,
        optional: true,
      },
      {
        key: 'uso',
        label: 'Uso',
        type: 'select',
        options: ['Freeride', 'Race', 'All Mountain', 'Freestyle'],
        filterable: true,
        optional: true,
      },
      {
        key: 'genero',
        label: 'Género',
        type: 'select',
        options: ['Hombre', 'Mujer', 'Unisex', 'Junior'],
        filterable: true,
        optional: true,
      },
      { key: 'marca', label: 'Marca', type: 'text', placeholder: 'Ej: Hestra', optional: true, filterable: true },
    ],
  },
  {
    id: 'botas_snowboard',
    label: 'Botas Snowboard',
    icon: '🥾',
    specs: [
      { key: 'talla_us', label: 'Talla US', type: 'number', placeholder: '9', optional: true, filterable: true },
      {
        key: 'flex',
        label: 'Flex',
        type: 'select',
        options: ['Suave', 'Medio', 'Rígido'],
        filterable: true,
        optional: true,
      },
      {
        key: 'genero',
        label: 'Género',
        type: 'select',
        options: ['Hombre', 'Mujer', 'Unisex', 'Junior'],
        filterable: true,
        optional: true,
      },
      { key: 'marca', label: 'Marca', type: 'text', placeholder: 'Ej: Burton', optional: true, filterable: true },
    ],
  },
  {
    id: 'protecciones',
    label: 'Protecciones',
    icon: '🛡️',
    specs: [
      {
        key: 'tipo',
        label: 'Tipo',
        type: 'select',
        options: ['Espalda', 'Rodilleras', 'Pantalón protector', 'Codo', 'Muñeca', 'Set completo', 'Otro'],
        filterable: true,
        optional: true,
      },
      {
        key: 'talla',
        label: 'Talla',
        type: 'select',
        options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Otro'],
        filterable: true,
        optional: true,
      },
      {
        key: 'genero',
        label: 'Género',
        type: 'select',
        options: ['Hombre', 'Mujer', 'Unisex', 'Junior'],
        filterable: true,
        optional: true,
      },
      { key: 'marca', label: 'Marca', type: 'text', placeholder: 'Ej: Poc', optional: true, filterable: true },
    ],
  },
  {
    id: 'bolsos_mochilas',
    label: 'Bolsos/Mochilas',
    icon: '🎒',
    specs: [
      {
        key: 'tipo',
        label: 'Tipo',
        type: 'select',
        options: ['Mochila', 'Bolso de ski', 'Bolso de botas', 'Porta-casco', 'Airbag', 'Otro'],
        filterable: true,
        optional: true,
      },
      { key: 'capacidad_l', label: 'Capacidad', type: 'number', unit: 'L', placeholder: '25', optional: true },
      { key: 'marca', label: 'Marca', type: 'text', placeholder: 'Ej: Dakine', optional: true, filterable: true },
    ],
  },
  {
    id: 'otros',
    label: 'Otros',
    icon: '📦',
    specs: [
      { key: 'marca', label: 'Marca', type: 'text', placeholder: 'Ej: Nike', optional: true, filterable: true },
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
