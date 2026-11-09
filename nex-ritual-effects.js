/* NEX — categorias e dados curtos dos rituais para conjuração.
   Fórmulas de versões aplicam-se apenas quando o aprimoramento existe;
   efeitos condicionais requerem consulta à ficha e à decisão do mestre. */
window.NEX_RITUAL_EFFECTS = {
  "amaldicoar arma|conhecimento|1": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "compreensao paranormal|conhecimento|1": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "enfeiticar|conhecimento|1": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "perturbacao|conhecimento|1": {
    "type": "Buff",
    "categories": [
      "Suporte",
      "Dano"
    ]
  },
  "ouvir os sussurros|conhecimento|1": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "tecer ilusao|conhecimento|1": {
    "type": "Buff",
    "categories": [
      "Suporte",
      "Dano"
    ]
  },
  "terceiro olho|conhecimento|1": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "amaldicoar arma|energia|1": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "amaldicoar tecnologia|energia|1": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "coincidencia forcada|energia|1": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false,
    "categories": [
      "Suporte"
    ]
  },
  "eletrocussao|energia|1": {
    "type": "Dano",
    "damageDice": "3d6",
    "healDice": "",
    "healFromDamage": false,
    "versions": {
      "Normal": "3d6",
      "Discente": "6d6",
      "Verdadeiro": "8d6"
    },
    "categories": [
      "Dano"
    ]
  },
  "embaralhar|energia|1": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false,
    "categories": [
      "Suporte"
    ]
  },
  "luz|energia|1": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "polarizacao caotica|energia|1": {
    "type": "Buff",
    "categories": [
      "Suporte",
      "Dano"
    ]
  },
  "amaldicoar arma|morte|1": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "cicatrizacao|morte|1": {
    "type": "Cura",
    "damageDice": "",
    "healDice": "3d8+3",
    "healFromDamage": false,
    "categories": [
      "Cura"
    ],
    "healVersions": {
      "Normal": "3d8+3",
      "Discente": "5d8+5",
      "Verdadeiro": "7d8+7"
    }
  },
  "consumir manancial|morte|1": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false,
    "categories": [
      "Suporte"
    ]
  },
  "decadencia|morte|1": {
    "type": "Dano",
    "damageDice": "2d8+2",
    "healDice": "",
    "healFromDamage": false,
    "versions": {
      "Normal": "2d8+2",
      "Discente": "3d8+3",
      "Verdadeiro": "8d8+8"
    },
    "categories": [
      "Dano"
    ]
  },
  "definhar|morte|1": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false,
    "categories": [
      "Suporte"
    ]
  },
  "espirais da perdicao|morte|1": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false,
    "categories": [
      "Suporte"
    ]
  },
  "nuvem de cinzas|morte|1": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "amaldicoar arma|sangue|1": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "arma atroz|sangue|1": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false,
    "categories": [
      "Suporte"
    ]
  },
  "armadura de sangue|sangue|1": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false,
    "categories": [
      "Suporte"
    ]
  },
  "corpo adaptado|sangue|1": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false,
    "categories": [
      "Suporte"
    ]
  },
  "distorcer aparencia|sangue|1": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "fortalecimento sensorial|sangue|1": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false,
    "categories": [
      "Suporte"
    ]
  },
  "odio incontrolavel|sangue|1": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false,
    "categories": [
      "Suporte"
    ]
  },
  "cineraria|medo|1": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "aprimorar mente|conhecimento|2": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false,
    "categories": [
      "Suporte"
    ]
  },
  "deteccao de ameacas|conhecimento|2": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "esconder dos olhos|conhecimento|2": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "invadir mente|conhecimento|2": {
    "type": "Dano",
    "damageDice": "6d6",
    "healDice": "",
    "healFromDamage": false,
    "versions": {
      "Normal": "6d6",
      "Discente": "10d6",
      "Verdadeiro": "10d6"
    },
    "categories": [
      "Dano",
      "Suporte"
    ]
  },
  "localizacao|conhecimento|2": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "chamas do caos|energia|2": {
    "type": "Buff",
    "categories": [
      "Suporte",
      "Dano"
    ]
  },
  "contencao fantasmagorica|energia|2": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "dissonancia acustica|energia|2": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "sopro do caos|energia|2": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "tela de ruido|energia|2": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "desacelerar impacto|morte|2": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "eco espiral|morte|2": {
    "type": "Dano",
    "categories": [
      "Dano"
    ],
    "damageDice": ""
  },
  "paradoxo|morte|2": {
    "type": "Dano",
    "damageDice": "6d6",
    "healDice": "",
    "healFromDamage": false,
    "versions": {
      "Normal": "6d6",
      "Discente": "4d6",
      "Verdadeiro": "13d6"
    },
    "categories": [
      "Dano"
    ]
  },
  "miasma entropico|morte|2": {
    "type": "Dano",
    "damageDice": "4d8",
    "healDice": "",
    "healFromDamage": false,
    "versions": {
      "Normal": "4d8",
      "Discente": "6d8",
      "Verdadeiro": "4d8"
    },
    "categories": [
      "Dano"
    ]
  },
  "velocidade mortal|morte|2": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false,
    "categories": [
      "Suporte"
    ]
  },
  "aprimorar fisico|sangue|2": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false,
    "categories": [
      "Suporte"
    ]
  },
  "descarnar|sangue|2": {
    "type": "Dano",
    "damageDice": "6d8",
    "healDice": "",
    "healFromDamage": false,
    "versions": {
      "Normal": "6d8",
      "Discente": "10d8",
      "Verdadeiro": "4d8"
    },
    "categories": [
      "Dano"
    ]
  },
  "flagelo de sangue|sangue|2": {
    "type": "Dano",
    "damageDice": "10d6",
    "healDice": "",
    "healFromDamage": false,
    "versions": {
      "Normal": "10d6",
      "Discente": "10d6",
      "Verdadeiro": "10d6"
    },
    "categories": [
      "Dano"
    ]
  },
  "hemofagia|sangue|2": {
    "type": "Dano + Cura",
    "damageDice": "6d6",
    "healDice": "",
    "healFromDamage": true,
    "versions": {
      "Normal": "6d6",
      "Discente": "6d6",
      "Verdadeiro": "4d6"
    },
    "categories": [
      "Dano",
      "Cura"
    ]
  },
  "transfusao vital|sangue|2": {
    "type": "Cura",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false,
    "categories": [
      "Cura"
    ]
  },
  "protecao contra rituais|medo|2": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "rejeitar nevoa|medo|2": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "alterar memoria|conhecimento|3": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "contato paranormal|conhecimento|3": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "mergulho mental|conhecimento|3": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "videncia|conhecimento|3": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "convocacao instantanea|energia|3": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "salto fantasma|energia|3": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "transfigurar agua|energia|3": {
    "type": "Buff",
    "categories": [
      "Suporte",
      "Dano"
    ]
  },
  "transfigurar terra|energia|3": {
    "type": "Buff",
    "categories": [
      "Suporte",
      "Dano"
    ]
  },
  "ancora temporal|morte|3": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "poeira da podridao|morte|3": {
    "type": "Dano",
    "damageDice": "4d8",
    "healDice": "",
    "healFromDamage": false,
    "versions": {
      "Normal": "4d8",
      "Verdadeiro": "4d8+16"
    },
    "categories": [
      "Dano"
    ]
  },
  "tentaculos de lodo|morte|3": {
    "type": "Dano",
    "categories": [
      "Dano",
      "Suporte"
    ]
  },
  "zerar entropia|morte|3": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "ferver sangue|sangue|3": {
    "type": "Dano",
    "damageDice": "4d8",
    "healDice": "",
    "healFromDamage": false,
    "versions": {
      "Normal": "4d8",
      "Verdadeiro": "4d8"
    },
    "categories": [
      "Dano",
      "Suporte"
    ]
  },
  "forma monstruosa|sangue|3": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "purgatorio|sangue|3": {
    "type": "Buff",
    "categories": [
      "Suporte",
      "Dano"
    ]
  },
  "vomitar pestes|sangue|3": {
    "type": "Dano",
    "damageDice": "5d12",
    "healDice": "",
    "healFromDamage": false,
    "versions": {
      "Normal": "5d12",
      "Discente": "5d12",
      "Verdadeiro": "5d12"
    },
    "categories": [
      "Dano"
    ]
  },
  "dissipar ritual|medo|3": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "controle mental|conhecimento|4": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "inexistir|conhecimento|4": {
    "type": "Dano",
    "damageDice": "10d12+10",
    "healDice": "",
    "healFromDamage": false,
    "versions": {
      "Normal": "10d12+10",
      "Discente": "15d12+15",
      "Verdadeiro": "20d12+20"
    },
    "categories": [
      "Dano"
    ]
  },
  "possessao|conhecimento|4": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "alterar destino|energia|4": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "deflagracao de energia|energia|4": {
    "type": "Dano",
    "categories": [
      "Dano"
    ],
    "damageDice": ""
  },
  "teletransporte|energia|4": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "convocar o algoz|morte|4": {
    "type": "Dano",
    "categories": [
      "Dano",
      "Suporte"
    ],
    "damageDice": ""
  },
  "distorcao temporal|morte|4": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "fim inevitavel|morte|4": {
    "type": "Dano",
    "categories": [
      "Dano"
    ],
    "damageDice": ""
  },
  "capturar o coracao|sangue|4": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "involucro de carne|sangue|4": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "vinculo de sangue|sangue|4": {
    "type": "Buff",
    "categories": [
      "Suporte",
      "Dano"
    ]
  },
  "canalizar o medo|medo|4": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "conhecendo o medo|medo|4": {
    "type": "Dano",
    "damageDice": "10d6",
    "healDice": "",
    "healFromDamage": false,
    "versions": {
      "Normal": "10d6"
    },
    "categories": [
      "Dano"
    ]
  },
  "lamina do medo|medo|4": {
    "type": "Dano",
    "damageDice": "10d8",
    "healDice": "",
    "healFromDamage": false,
    "versions": {
      "Normal": "10d8"
    },
    "categories": [
      "Dano"
    ]
  },
  "medo tangivel|medo|4": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "presenca do medo|medo|4": {
    "type": "Dano",
    "categories": [
      "Dano"
    ]
  },
  "esfolar|sangue|1": {
    "type": "Dano",
    "damageDice": "3d4+3",
    "healDice": "",
    "healFromDamage": false,
    "versions": {
      "Normal": "3d4+3",
      "Discente": "5d4+5",
      "Verdadeiro": "10d4+10"
    },
    "categories": [
      "Dano"
    ]
  },
  "sede de adrenalina|sangue|2": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false,
    "categories": [
      "Suporte"
    ]
  },
  "odor da cacada|sangue|3": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false,
    "categories": [
      "Suporte"
    ]
  },
  "martirio de sangue|sangue|4": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "apagar as luzes|morte|1": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "lingua morta|morte|2": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "fedor putrido|morte|3": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "singularidade temporal|morte|4": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "desfazer sinapses|conhecimento|1": {
    "type": "Dano",
    "damageDice": "2d6+2",
    "healDice": "",
    "healFromDamage": false,
    "versions": {
      "Normal": "2d6+2",
      "Discente": "3d6+3",
      "Verdadeiro": "8d6+8"
    },
    "categories": [
      "Dano"
    ]
  },
  "aurora da verdade|conhecimento|2": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "relembrar fragmento|conhecimento|3": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "pronunciar sigilo|conhecimento|4": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "overclock|energia|1": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false,
    "categories": [
      "Suporte"
    ]
  },
  "tremeluzir|energia|2": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false,
    "categories": [
      "Suporte"
    ]
  },
  "mutar|energia|3": {
    "type": "Buff",
    "categories": [
      "Suporte"
    ]
  },
  "milagre ionizante|energia|3": {
    "type": "Cura",
    "categories": [
      "Cura"
    ]
  }
};
