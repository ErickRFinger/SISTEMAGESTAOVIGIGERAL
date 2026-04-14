export type ProductCategory =
  | 'GRAVADORES (DVRs)'
  | 'CÂMERAS'
  | 'CONECTORES E VÍDEO'
  | 'CABOS E FIOS'
  | 'ELÉTRICA E PROTEÇÃO'
  | 'ALARMES E SENSORES'
  | 'INFRAESTRUTURA E FIXAÇÃO'
  | 'INFORMÁTICA E DIVERSOS'
  | 'MARKETING E OUTROS'
  | 'EQUIPAMENTOS TÉCNICOS (FERRAMENTAS)';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
}

export const PRODUCTS: Product[] = [
  // GRAVADORES (DVRs)
  { id: 'dvr-int-2', name: 'DVR INTELBRAS 2CH', category: 'GRAVADORES (DVRs)' },
  { id: 'dvr-int-4', name: 'DVR INTELBRAS 4CH', category: 'GRAVADORES (DVRs)' },
  { id: 'dvr-int-8', name: 'DVR INTELBRAS 8CH', category: 'GRAVADORES (DVRs)' },
  { id: 'dvr-int-16', name: 'DVR INTELBRAS 16CH', category: 'GRAVADORES (DVRs)' },
  { id: 'dvr-unv-2', name: 'DVR UNV 2CH', category: 'GRAVADORES (DVRs)' },
  { id: 'dvr-unv-4', name: 'DVR UNV 4CH', category: 'GRAVADORES (DVRs)' },
  { id: 'dvr-unv-8', name: 'DVR UNV 8CH', category: 'GRAVADORES (DVRs)' },
  { id: 'dvr-unv-16', name: 'DVR UNV 16CH', category: 'GRAVADORES (DVRs)' },
  { id: 'dvr-hik-2', name: 'DVR Hikvision 2CH', category: 'GRAVADORES (DVRs)' },
  { id: 'dvr-hik-4', name: 'DVR Hikvision 4CH', category: 'GRAVADORES (DVRs)' },
  { id: 'dvr-hik-8', name: 'DVR Hikvision 8CH', category: 'GRAVADORES (DVRs)' },
  { id: 'dvr-hik-16', name: 'DVR Hikvision 16CH', category: 'GRAVADORES (DVRs)' },

  // CÂMERAS
  { id: 'cam-bul-unv', name: 'Câmera Bullet UNV', category: 'CÂMERAS' },
  { id: 'cam-dom-unv', name: 'Câmera Dome UNV', category: 'CÂMERAS' },
  { id: 'cam-bul-unv-cv', name: 'Câmera Bullet UNV ColorVu', category: 'CÂMERAS' },
  { id: 'cam-dom-unv-cv', name: 'Câmera Dome UNV ColorVu', category: 'CÂMERAS' },
  { id: 'cam-bul-unv-dl', name: 'Câmera Bullet UNV Dual Light', category: 'CÂMERAS' },
  { id: 'cam-dom-unv-dl', name: 'Câmera Dome UNV Dual Light', category: 'CÂMERAS' },
  { id: 'cam-unv-ch-audio', name: 'Câmera UNV Color Hunter com Áudio', category: 'CÂMERAS' },
  { id: 'cam-ip-dom-unv', name: 'Câmera IP Dome UNV', category: 'CÂMERAS' },
  { id: 'cam-bul-hik', name: 'Câmera Bullet Hikvision', category: 'CÂMERAS' },
  { id: 'cam-bul-hik-cv', name: 'Câmera Bullet Hikvision ColorVu', category: 'CÂMERAS' },
  { id: 'cam-ip-bul-hik', name: 'Câmera IP Bullet Hikvision', category: 'CÂMERAS' },
  { id: 'cam-bul-pos', name: 'Câmera Bullet Positivo', category: 'CÂMERAS' },
  { id: 'cam-ip-ezv', name: 'Câmera IP EZVIZ', category: 'CÂMERAS' },
  { id: 'cam-var', name: 'Câmera Varifocal', category: 'CÂMERAS' },
  { id: 'cam-twg', name: 'Câmera TWG', category: 'CÂMERAS' },

  // CONECTORES E VÍDEO
  { id: 'con-bnc', name: 'Conector BNC', category: 'CONECTORES E VÍDEO' },
  { id: 'con-p4', name: 'Conector P4', category: 'CONECTORES E VÍDEO' },
  { id: 'con-rj45', name: 'Conector RJ45', category: 'CONECTORES E VÍDEO' },
  { id: 'con-energia', name: 'Conector de Energia', category: 'CONECTORES E VÍDEO' },
  { id: 'con-fibra', name: 'Conector de Fibra', category: 'CONECTORES E VÍDEO' },
  { id: 'con-wago', name: 'Conector Wago', category: 'CONECTORES E VÍDEO' },
  { id: 'par-balun', name: 'Par de Balun', category: 'CONECTORES E VÍDEO' },
  { id: 'par-poe', name: 'Par de Ejetor POE', category: 'CONECTORES E VÍDEO' },
  { id: 'par-mc', name: 'Par de Media Converter', category: 'CONECTORES E VÍDEO' },
  { id: 'eme-energia', name: 'Emenda de Energia', category: 'CONECTORES E VÍDEO' },
  { id: 'eme-video', name: 'Emenda de Vídeo', category: 'CONECTORES E VÍDEO' },

  // CABOS E FIOS
  { id: 'cab-coax', name: 'Bobina de Cabo Coaxial', category: 'CABOS E FIOS' },
  { id: 'cxi-rede', name: 'Caixa de Cabo de Rede', category: 'CABOS E FIOS' },
  { id: 'cab-blind', name: 'Bobina de Cabo Blindado', category: 'CABOS E FIOS' },
  { id: 'cab-fibra', name: 'Bobina de Cabo de Fibra', category: 'CABOS E FIOS' },
  { id: 'rol-energia', name: 'Rolo de Cabo de Energia', category: 'CABOS E FIOS' },
  { id: 'rol-alarme', name: 'Rolo de Cabo de Alarme', category: 'CABOS E FIOS' },
  { id: 'ara-espinar', name: 'Arame de Espinar', category: 'CABOS E FIOS' },
  { id: 'lub-fio', name: 'Lubrificante Passa Fio', category: 'CABOS E FIOS' },

  // ELÉTRICA E PROTEÇÃO
  { id: 'fon-12v25a', name: 'Fonte 12V 2.5A', category: 'ELÉTRICA E PROTEÇÃO' },
  { id: 'fon-12v30a', name: 'Fonte 12V 3.0A', category: 'ELÉTRICA E PROTEÇÃO' },
  { id: 'fon-12v35a', name: 'Fonte 12V 3.5A', category: 'ELÉTRICA E PROTEÇÃO' },
  { id: 'reg-tom-3', name: 'Régua de Tomadas 3 posições', category: 'ELÉTRICA E PROTEÇÃO' },
  { id: 'reg-tom-5', name: 'Régua de Tomadas 5 posições', category: 'ELÉTRICA E PROTEÇÃO' },
  { id: 'reg-tom-6', name: 'Régua de Tomadas 6 posições', category: 'ELÉTRICA E PROTEÇÃO' },
  { id: 'tom-macho', name: 'Tomada Macho', category: 'ELÉTRICA E PROTEÇÃO' },
  { id: 'nob-1200va', name: 'Nobreak 1200VA', category: 'ELÉTRICA E PROTEÇÃO' },
  { id: 'bat', name: 'Bateria', category: 'ELÉTRICA E PROTEÇÃO' },

  // ALARMES E SENSORES
  { id: 'cen-alarme', name: 'Central de Alarme', category: 'ALARMES E SENSORES' },
  { id: 'sirene', name: 'Sirene', category: 'ALARMES E SENSORES' },
  { id: 'sen-pre-cf', name: 'Sensor de Presença Com Fio', category: 'ALARMES E SENSORES' },
  { id: 'sen-pre-sf', name: 'Sensor de Presença Sem Fio', category: 'ALARMES E SENSORES' },
  { id: 'sen-mag-abe', name: 'Sensor Magnético de Abertura', category: 'ALARMES E SENSORES' },
  { id: 'sup-alarme', name: 'Suporte de Alarme', category: 'ALARMES E SENSORES' },

  // INFRAESTRUTURA E FIXAÇÃO
  { id: 'mig-con', name: 'Miguelão de Concreto', category: 'INFRAESTRUTURA E FIXAÇÃO' },
  { id: 'mig-mad', name: 'Miguelão de Madeira', category: 'INFRAESTRUTURA E FIXAÇÃO' },
  { id: 'pre-nyl-20', name: 'Presilha de Nylon 20cm', category: 'INFRAESTRUTURA E FIXAÇÃO' },
  { id: 'pre-nyl-40', name: 'Presilha de Nylon 40cm', category: 'INFRAESTRUTURA E FIXAÇÃO' },
  { id: 'cin-met', name: 'Cinta Metálica', category: 'INFRAESTRUTURA E FIXAÇÃO' },
  { id: 'buc-6', name: 'Bucha 6', category: 'INFRAESTRUTURA E FIXAÇÃO' },
  { id: 'par-broc', name: 'Parafuso Brocante', category: 'INFRAESTRUTURA E FIXAÇÃO' },
  { id: 'par-4x16', name: 'Parafuso 4x16', category: 'INFRAESTRUTURA E FIXAÇÃO' },
  { id: 'par-4x20', name: 'Parafuso 4x20', category: 'INFRAESTRUTURA E FIXAÇÃO' },
  { id: 'par-4x40', name: 'Parafuso 4x40', category: 'INFRAESTRUTURA E FIXAÇÃO' },
  { id: 'pre-con', name: 'Prego para Concreto', category: 'INFRAESTRUTURA E FIXAÇÃO' },
  { id: 'fit-iso-pt', name: 'Fita Isolante Preta', category: 'INFRAESTRUTURA E FIXAÇÃO' },
  { id: 'fit-iso-br', name: 'Fita Isolante Branca', category: 'INFRAESTRUTURA E FIXAÇÃO' },
  { id: 'fit-dup-fac', name: 'Fita Dupla Face', category: 'INFRAESTRUTURA E FIXAÇÃO' },
  { id: 'tub-sil', name: 'Tubo de Silicone', category: 'INFRAESTRUTURA E FIXAÇÃO' },
  { id: 'sup-bon', name: 'Super Bonder', category: 'INFRAESTRUTURA E FIXAÇÃO' },
  { id: 'cxi-pas-br', name: 'Caixinha de Passagem Branca', category: 'INFRAESTRUTURA E FIXAÇÃO' },
  { id: 'cxi-pas-ve', name: 'Caixinha de Passagem Vedada', category: 'INFRAESTRUTURA E FIXAÇÃO' },
  { id: 'can', name: 'Canaleta', category: 'INFRAESTRUTURA E FIXAÇÃO' },
  { id: 'eme-can', name: 'Emenda de Canaleta', category: 'INFRAESTRUTURA E FIXAÇÃO' },
  { id: 'col-can', name: 'Cola para Canaleta', category: 'INFRAESTRUTURA E FIXAÇÃO' },
  { id: 'cxi-met', name: 'Caixa Metálica', category: 'INFRAESTRUTURA E FIXAÇÃO' },
  { id: 'cxi-org-dvr', name: 'Caixa Organizadora para DVR', category: 'INFRAESTRUTURA E FIXAÇÃO' },

  // INFORMÁTICA E DIVERSOS
  { id: 'hd-1tb', name: 'HD 1TB', category: 'INFORMÁTICA E DIVERSOS' },
  { id: 'hd-2tb', name: 'HD 2TB', category: 'INFORMÁTICA E DIVERSOS' },
  { id: 'ssd-240', name: 'SSD 240GB', category: 'INFORMÁTICA E DIVERSOS' },
  { id: 'ssd-480', name: 'SSD 480GB', category: 'INFORMÁTICA E DIVERSOS' },
  { id: 'car-mem', name: 'Cartão de Memória', category: 'INFORMÁTICA E DIVERSOS' },
  { id: 'mon', name: 'Monitor', category: 'INFORMÁTICA E DIVERSOS' },
  { id: 'hub-sw-4', name: 'Hub Switch 4 Portas', category: 'INFORMÁTICA E DIVERSOS' },
  { id: 'hub-sw-8', name: 'Hub Switch 8 Portas', category: 'INFORMÁTICA E DIVERSOS' },
  { id: 'rep-int', name: 'Repetidor de Internet', category: 'INFORMÁTICA E DIVERSOS' },
  { id: 'kit-fibra', name: 'Kit de Fibra', category: 'INFORMÁTICA E DIVERSOS' },

  // MARKETING E OUTROS
  { id: 'pla-vigi', name: 'Plaquinha VIGI', category: 'MARKETING E OUTROS' },
  { id: 'ade-mon', name: 'Adesivo de Monitoramento', category: 'MARKETING E OUTROS' },
  { id: 'cam-vigi', name: 'Camisa VIGI', category: 'MARKETING E OUTROS' },
  { id: 'copo', name: 'Copo', category: 'MARKETING E OUTROS' },
  { id: 'sac-copo', name: 'Sacola para Copos', category: 'MARKETING E OUTROS' },
  { id: 'tic-sem-parar', name: 'Ticket Sem Parar', category: 'MARKETING E OUTROS' },

  // EQUIPAMENTOS TÉCNICOS (FERRAMENTAS)
  { id: 'escada', name: 'Escada', category: 'EQUIPAMENTOS TÉCNICOS (FERRAMENTAS)' },
  { id: 'cxi-ferr', name: 'Caixa de Ferramentas', category: 'EQUIPAMENTOS TÉCNICOS (FERRAMENTAS)' },
  { id: 'asp-po-ver', name: 'Aspirador de Pó Vertical', category: 'EQUIPAMENTOS TÉCNICOS (FERRAMENTAS)' },
  { id: 'ali-crimpar', name: 'Alicate de Crimpar', category: 'EQUIPAMENTOS TÉCNICOS (FERRAMENTAS)' },
  { id: 'ali-corte', name: 'Alicate de Corte', category: 'EQUIPAMENTOS TÉCNICOS (FERRAMENTAS)' },
  { id: 'ali-bico', name: 'Alicate de Bico', category: 'EQUIPAMENTOS TÉCNICOS (FERRAMENTAS)' },
  { id: 'martelo', name: 'Martelo', category: 'EQUIPAMENTOS TÉCNICOS (FERRAMENTAS)' },
  { id: 'parafusadeira', name: 'Parafusadeira', category: 'EQUIPAMENTOS TÉCNICOS (FERRAMENTAS)' },
  { id: 'fur-impacto', name: 'Furadeira de Impacto', category: 'EQUIPAMENTOS TÉCNICOS (FERRAMENTAS)' },
  { id: 'bro-esc', name: 'Broca Escalonada', category: 'EQUIPAMENTOS TÉCNICOS (FERRAMENTAS)' },
  { id: 'bro-aco', name: 'Broca de Aço', category: 'EQUIPAMENTOS TÉCNICOS (FERRAMENTAS)' },
  { id: 'bro-con', name: 'Broca de Concreto', category: 'EQUIPAMENTOS TÉCNICOS (FERRAMENTAS)' },
  { id: 'bro-mad', name: 'Broca de Madeira', category: 'EQUIPAMENTOS TÉCNICOS (FERRAMENTAS)' },
  { id: 'pon-phil', name: 'Ponteira Philips', category: 'EQUIPAMENTOS TÉCNICOS (FERRAMENTAS)' },
  { id: 'multimetro', name: 'Multímetro', category: 'EQUIPAMENTOS TÉCNICOS (FERRAMENTAS)' },
  { id: 'tes-cab-rede', name: 'Testador de Cabo de Rede', category: 'EQUIPAMENTOS TÉCNICOS (FERRAMENTAS)' },
  { id: 'apli-silicone', name: 'Aplicador de Silicone', category: 'EQUIPAMENTOS TÉCNICOS (FERRAMENTAS)' },
  { id: 'serrinha', name: 'Serrinha', category: 'EQUIPAMENTOS TÉCNICOS (FERRAMENTAS)' }
];
