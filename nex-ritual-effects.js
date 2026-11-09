/* NEX: fórmulas numéricas concisas e categorias de efeito.
   Os dados de versões são usados no painel Conjurar; condições especiais devem ser conferidas no livro.
   A biblioteca não contém imagens nem transcrições de descrições oficiais. */
window.NEX_RITUAL_EFFECTS = {
  "decadencia|morte|1": {
    "type": "Dano",
    "damageDice": "2d8+2",
    "healDice": "",
    "healFromDamage": false,
    "versions": {
      "Normal": "2d8+2",
      "Discente": "3d8+3",
      "Verdadeiro": "8d8+8"
    }
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
    }
  },
  "cicatrizacao|morte|1": {
    "type": "Cura",
    "damageDice": "",
    "healDice": "3d8+3",
    "healFromDamage": false
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
    }
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
    }
  },
  "ferver sangue|sangue|3": {
    "type": "Dano",
    "damageDice": "4d8",
    "healDice": "",
    "healFromDamage": false,
    "versions": {
      "Normal": "4d8",
      "Verdadeiro": "4d8"
    }
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
    }
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
    }
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
    }
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
    }
  },
  "poeira da podridao|morte|3": {
    "type": "Dano",
    "damageDice": "4d8",
    "healDice": "",
    "healFromDamage": false,
    "versions": {
      "Normal": "4d8",
      "Verdadeiro": "4d8+16"
    }
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
    }
  },
  "espirais da perdicao|morte|1": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false
  },
  "lamina do medo|medo|4": {
    "type": "Dano",
    "damageDice": "10d8",
    "healDice": "",
    "healFromDamage": false,
    "versions": {
      "Normal": "10d8"
    }
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
    }
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
    }
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
    }
  },
  "conhecendo o medo|medo|4": {
    "type": "Dano",
    "damageDice": "10d6",
    "healDice": "",
    "healFromDamage": false,
    "versions": {
      "Normal": "10d6"
    }
  },
  "armadura de sangue|sangue|1": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false
  },
  "aprimorar fisico|sangue|2": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false
  },
  "aprimorar mente|conhecimento|2": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false
  },
  "arma atroz|sangue|1": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false
  },
  "coincidencia forcada|energia|1": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false
  },
  "definhar|morte|1": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false
  },
  "embaralhar|energia|1": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false
  },
  "fortalecimento sensorial|sangue|1": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false
  },
  "odio incontrolavel|sangue|1": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false
  },
  "velocidade mortal|morte|2": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false
  },
  "corpo adaptado|sangue|1": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false
  },
  "consumir manancial|morte|1": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false
  },
  "transfusao vital|sangue|2": {
    "type": "Cura",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false
  },
  "sede de adrenalina|sangue|2": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false
  },
  "odor da cacada|sangue|3": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false
  },
  "overclock|energia|1": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false
  },
  "tremeluzir|energia|2": {
    "type": "Buff",
    "damageDice": "",
    "healDice": "",
    "healFromDamage": false
  }
};
