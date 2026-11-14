/* Adições resumidas do suplemento de Julho/2026. Sem reprodução de textos longos. */
window.NEX_JULY_THREATS=[
  {
    "name": "Raziel",
    "element": "Sangue",
    "source": "Arquivos Secretos — Julho",
    "category": "Pessoa",
    "page": 40
  },
  {
    "name": "O Verdadeiro Raziel",
    "element": "Sangue",
    "source": "Arquivos Secretos — Julho",
    "category": "Pessoa",
    "page": 41
  },
  {
    "name": "Alvira",
    "element": "Sangue",
    "source": "Arquivos Secretos — Julho",
    "category": "Pessoa",
    "page": 42
  },
  {
    "name": "Sabara",
    "element": "Sangue",
    "source": "Arquivos Secretos — Julho",
    "category": "Pessoa",
    "page": 43
  },
  {
    "name": "Zéfero",
    "element": "Sangue",
    "source": "Arquivos Secretos — Julho",
    "category": "Pessoa",
    "page": 45
  },
  {
    "name": "Incinerado",
    "element": "Energia",
    "source": "Arquivos Secretos — Julho",
    "category": "Criatura",
    "page": 65
  },
  {
    "name": "Strzyga",
    "element": "Sangue",
    "source": "Arquivos Secretos — Julho",
    "category": "Criatura",
    "page": 67
  },
  {
    "name": "Apóstata",
    "element": "Conhecimento",
    "source": "Arquivos Secretos — Julho",
    "category": "Criatura",
    "page": 70
  }
];
window.NEX_JULY_THREAT_DETAILS={
  "Arquivos Secretos — Julho::Raziel": {
    "vd": 120,
    "pv": 240,
    "defense": 28,
    "movement": "9m",
    "attributes": {
      "AGI": 4,
      "INT": 3,
      "VIG": 3,
      "FOR": 3,
      "PRE": 2
    },
    "abilities": [
      {
        "name": "Fúria Sanguinária",
        "effect": "Pode mudar para a ficha de O Verdadeiro Raziel quando entra em estado de fúria ou fica ferido, a critério do mestre."
      }
    ],
    "pdfPage": 40,
    "narrative": "Ameaça apresentada no pacote de julho de Arquivos Secretos. As habilidades abaixo são resumos originais; para condições e valores complementares, consulte a página 40."
  },
  "Arquivos Secretos — Julho::O Verdadeiro Raziel": {
    "vd": 200,
    "pv": 400,
    "defense": 38,
    "movement": "12m",
    "attributes": {
      "AGI": 4,
      "INT": 3,
      "VIG": 3,
      "FOR": 3,
      "PRE": 2
    },
    "abilities": [
      {
        "name": "Fúria Sanguinária",
        "effect": "Forma alternativa de Raziel, com estatísticas e condições específicas."
      }
    ],
    "pdfPage": 41,
    "narrative": "Ameaça apresentada no pacote de julho de Arquivos Secretos. As habilidades abaixo são resumos originais; para condições e valores complementares, consulte a página 41."
  },
  "Arquivos Secretos — Julho::Alvira": {
    "vd": 120,
    "pv": 210,
    "defense": 26,
    "movement": "9m",
    "attributes": {
      "AGI": 3,
      "INT": 2,
      "VIG": 2,
      "FOR": 1,
      "PRE": 4
    },
    "abilities": [
      {
        "name": "Madre Superior",
        "effect": "Pode transferir vitalidade para aliados adjacentes por meio de um custo de vida; consulte a regra do suplemento para valores e condições."
      }
    ],
    "pdfPage": 42,
    "narrative": "Ameaça apresentada no pacote de julho de Arquivos Secretos. As habilidades abaixo são resumos originais; para condições e valores complementares, consulte a página 42."
  },
  "Arquivos Secretos — Julho::Sabara": {
    "vd": 100,
    "pv": 200,
    "defense": 25,
    "movement": "9m",
    "attributes": {
      "AGI": 3,
      "INT": 2,
      "VIG": 2,
      "FOR": 3,
      "PRE": 2
    },
    "abilities": [
      {
        "name": "Monstruosidade",
        "effect": "Apresenta sentidos paranormais e resistências especiais ligados à sua transformação."
      }
    ],
    "pdfPage": 43,
    "narrative": "Ameaça apresentada no pacote de julho de Arquivos Secretos. As habilidades abaixo são resumos originais; para condições e valores complementares, consulte a página 43."
  },
  "Arquivos Secretos — Julho::Zéfero": {
    "vd": 80,
    "pv": 140,
    "defense": 23,
    "movement": "12m",
    "attributes": {
      "AGI": 2,
      "INT": 0,
      "VIG": 3,
      "FOR": 3,
      "PRE": 2
    },
    "abilities": [
      {
        "name": "Demônio de Coleira",
        "effect": "Obedece a seu controlador e pode mudar de comando sob condições específicas."
      }
    ],
    "pdfPage": 45,
    "narrative": "Ameaça apresentada no pacote de julho de Arquivos Secretos. As habilidades abaixo são resumos originais; para condições e valores complementares, consulte a página 45."
  },
  "Arquivos Secretos — Julho::Incinerado": {
    "vd": 100,
    "pv": 100,
    "defense": 21,
    "movement": "9m",
    "attributes": {
      "AGI": 3,
      "INT": 0,
      "VIG": 2,
      "FOR": 3,
      "PRE": 0
    },
    "immunities": [
      "Fogo"
    ],
    "resistances": [
      "Balístico, corte e perfuração 5",
      "Sangue 10",
      "Energia 20"
    ],
    "weaknesses": [
      "Conhecimento"
    ],
    "abilities": [
      {
        "name": "Combustão Caótica",
        "effect": "Perde 10 PV no início do próprio turno e ganha ações ofensivas adicionais quando está machucado."
      },
      {
        "name": "Alimentar as Chamas",
        "effect": "Recupera PV quando alvos próximos sofrem dano pela condição em chamas."
      }
    ],
    "actions": [
      {
        "name": "Disparo de Labaredas",
        "type": "Padrão",
        "test": "3d20+10",
        "damage": "2d8+5 fogo",
        "effect": "Ataque à distância curto, com possibilidade de causar a condição em chamas."
      }
    ],
    "pdfPage": 65,
    "narrative": "Ameaça apresentada no pacote de julho de Arquivos Secretos. As habilidades abaixo são resumos originais; para condições e valores complementares, consulte a página 65."
  },
  "Arquivos Secretos — Julho::Strzyga": {
    "pv": 240,
    "movement": "9m; escalada 12m; voo 12m",
    "attributes": {
      "AGI": 3,
      "INT": 3,
      "VIG": 2,
      "FOR": 2,
      "PRE": 4
    },
    "resistances": [
      "Balístico, impacto e perfuração 10",
      "Químico e Sangue 20"
    ],
    "weaknesses": [
      "Fogo",
      "Morte"
    ],
    "abilities": [
      {
        "name": "Absorver Essência",
        "effect": "Ganha vantagem progressiva contra alvos de quem se alimentou repetidas vezes."
      },
      {
        "name": "Ecos de Essência",
        "effect": "Utiliza vestígios de memórias para reconhecer vínculos entre seus alvos."
      }
    ],
    "actions": [
      {
        "name": "Mordida e Garras",
        "type": "Padrão",
        "test": "3d20+15",
        "damage": "4d10+10 corte"
      },
      {
        "name": "Imitar Voz",
        "type": "Livre",
        "damage": "4d6 mental",
        "effect": "Imita vozes conhecidas para afetar emocionalmente alvos próximos; Vontade pode reduzir o dano."
      }
    ],
    "pdfPage": 67,
    "narrative": "Ameaça apresentada no pacote de julho de Arquivos Secretos. As habilidades abaixo são resumos originais; para condições e valores complementares, consulte a página 67."
  },
  "Arquivos Secretos — Julho::Apóstata": {
    "vd": 80,
    "pv": 111,
    "defense": 22,
    "movement": "0m",
    "attributes": {
      "AGI": 2,
      "INT": 3,
      "VIG": 2,
      "FOR": 2,
      "PRE": 4
    },
    "presence": "DT 20, 3d8 mental (varia conforme estágio)",
    "immunities": [
      "Dano e condições, enquanto protegida por seu enigma"
    ],
    "weaknesses": [
      "Sangue"
    ],
    "abilities": [
      {
        "name": "Mentem Corrumpere",
        "effect": "Sua presença pode impor uma influência mental progressiva ligada aos seus ritos."
      },
      {
        "name": "Murus Idolorum",
        "effect": "Manifesta uma parede de ídolos com efeitos de Conhecimento, relacionada à sua proteção."
      },
      {
        "name": "Enigma de Medo",
        "effect": "A proteção depende de ritos; interrompê-los é essencial para enfraquecer a criatura."
      }
    ],
    "actions": [
      {
        "name": "Flagellum",
        "type": "Padrão",
        "test": "3d20+10",
        "damage": "6d10 mental",
        "effect": "Ataque à distância curta."
      },
      {
        "name": "Gnosis Absoluta",
        "type": "Reação",
        "effect": "Pode aumentar a resistência ao tipo de dano recebido quando está em estágio elevado."
      }
    ],
    "pdfPage": 70,
    "narrative": "Ameaça apresentada no pacote de julho de Arquivos Secretos. As habilidades abaixo são resumos originais; para condições e valores complementares, consulte a página 70."
  }
};
