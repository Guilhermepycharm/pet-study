export type AccessoryCategory = 'facial' | 'head' | 'body' | 'skin';

export interface Accessory {
  id: string;
  name: string;
  category: AccessoryCategory;
  cost: number;
  exclusive?: boolean;
  emoji?: string;
}

export const ACCESSORIES_CATALOG: Accessory[] = [
  { id: 'grad', name: 'Chapéu de Formatura', category: 'head', cost: 200, emoji: '🎓' },
  { id: 'laco', name: 'Lacinho Rosa', category: 'head', cost: 80, emoji: '🎀' },
  { id: 'coroa_real', name: 'Coroa Real', category: 'head', cost: 0, exclusive: true, emoji: '👑' },
  { id: 'boina', name: 'Boina Francesa', category: 'head', cost: 120, emoji: '🥖' },
  { id: 'chapeu_palha', name: 'Chapéu de Palha', category: 'head', cost: 90, emoji: '👒' },
  { id: 'capacete_astro', name: 'Capacete de Astronauta', category: 'head', cost: 350, emoji: '👨‍🚀' },
  { id: 'tiara_flores', name: 'Tiara de Flores', category: 'head', cost: 70, emoji: '🌸' },
  { id: 'chapeu', name: 'Cartola de Mágico', category: 'head', cost: 300, emoji: '🎩' },
  { id: 'orelhas_coelho', name: 'Orelhas de Coelho', category: 'head', cost: 150, emoji: '🐰' },
  { id: 'chapeu_bruxa', name: 'Chapéu de Bruxa', category: 'head', cost: 180, emoji: '🧙' },
  { id: 'faixa_ninja', name: 'Faixa de Ninja', category: 'head', cost: 160, emoji: '🥷' },
  { id: 'coroa_louros', name: 'Coroa de Louros', category: 'head', cost: 250, emoji: '🌿' },
  { id: 'gorro_natal', name: 'Gorro de Natal', category: 'head', cost: 100, emoji: '🎅' },
  { id: 'oculos', name: 'Óculos Escuros', category: 'facial', cost: 150, emoji: '🕶️' },
  { id: 'oculos_leitura', name: 'Óculos de Leitura', category: 'facial', cost: 100, emoji: '👓' },
  { id: 'oculos_coracao', name: 'Óculos Coração', category: 'facial', cost: 0, exclusive: true, emoji: '😍' },
  { id: 'monoculo', name: 'Monóculo', category: 'facial', cost: 130, emoji: '🧐' },
  { id: 'mascara_carnaval', name: 'Máscara de Carnaval', category: 'facial', cost: 140, emoji: '🎭' },
  { id: 'bigode', name: 'Bigode Falso', category: 'facial', cost: 60, emoji: '👨' },
  { id: 'oculos_3d', name: 'Óculos 3D', category: 'facial', cost: 110, emoji: '🎬' },
  { id: 'venda_pirata', name: 'Venda de Pirata', category: 'facial', cost: 170, emoji: '🏴‍☠️' },
  { id: 'pintura_guerreiro', name: 'Pintura de Guerreiro', category: 'facial', cost: 280, emoji: '⚔️' },
  { id: 'oculos_nerd', name: 'Óculos de Nerd', category: 'facial', cost: 90, emoji: '🤓' },
  { id: 'capa_heroi', name: 'Capa de Super-Herói', category: 'body', cost: 250, emoji: '🦸' },
  { id: 'terno', name: 'Terno Elegante', category: 'body', cost: 300, emoji: '👔' },
  { id: 'colete_aventura', name: 'Colete de Aventura', category: 'body', cost: 120, emoji: '🎒' },
  { id: 'cachecol', name: 'Suéter de Tricô', category: 'body', cost: 100, emoji: '🧶' },
  { id: 'moletom', name: 'Moletom Confortável', category: 'body', cost: 80, emoji: '🧥' },
  { id: 'vestido_princesa', name: 'Vestido de Princesa', category: 'body', cost: 280, emoji: '👗' },
  { id: 'armadura', name: 'Armadura de Cavaleiro', category: 'body', cost: 350, emoji: '🛡️' },
  { id: 'colete_salva', name: 'Colete Salva-Vidas', category: 'body', cost: 140, emoji: '🛟' },
  { id: 'asas_dragao', name: 'Asas de Dragão', category: 'body', cost: 0, exclusive: true, emoji: '🐉' },
  { id: 'asas_anjo', name: 'Asas de Anjo', category: 'body', cost: 0, exclusive: true, emoji: '😇' },
  { id: 'capa_invisibilidade', name: 'Capa de Invisibilidade', category: 'body', cost: 0, exclusive: true, emoji: '🔮' },
  { id: 'skin_preto', name: 'Gato Preto', category: 'skin', cost: 400, emoji: '🐈‍⬛' },
  { id: 'skin_siames', name: 'Siamês', category: 'skin', cost: 600, emoji: '😺' },
  { id: 'skin_laranja', name: 'Gato Laranja', category: 'skin', cost: 350, emoji: '🐈' },
  { id: 'skin_cinza', name: 'Gato Cinza', category: 'skin', cost: 380, emoji: '🐈' },
  { id: 'skin_calico', name: 'Tricolor (Calico)', category: 'skin', cost: 550, emoji: '😸' },
  { id: 'skin_tabby', name: 'Gato Malhado (Tabby)', category: 'skin', cost: 250, emoji: '🐯' },
  { id: 'skin_esfinge', name: 'Gato Esfinge', category: 'skin', cost: 800, emoji: '👽' },
  { id: 'pelagem_dourada', name: 'Gato Dourado', category: 'skin', cost: 0, exclusive: true, emoji: '✨🐱' },
  { id: 'skin_fantasma', name: 'Gato Fantasma', category: 'skin', cost: 0, exclusive: true, emoji: '👻🐱' },
  { id: 'skin_arcoiris', name: 'Gato Arco-Íris', category: 'skin', cost: 0, exclusive: true, emoji: '🌈😺' },
];
