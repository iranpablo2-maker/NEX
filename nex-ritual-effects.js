/* NEX: dados numéricos curtos e categorias indicativas, sem textos dos livros.
   Casos condicionais exigem a decisão do mestre; o jogador pode editar os dados no painel. */
window.NEX_RITUAL_EFFECTS = {
  "decadencia|morte|1": {
    "type": "Dano",
    "damageDice": "2d8+2",
    "healDice": "",
    "healFromDamage": false
  },
  "eletrocussao|energia|1": {
    "type": "Dano",
    "damageDice": "3d6",
    "healDice": "",
    "healFromDamage": false
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
    "healFromDamage": true
  },
  "descarnar|sangue|2": {
    "type": "Dano",
    "damageDice": "6d8",
    "healDice": "",
    "healFromDamage": false
  },
  "ferver sangue|sangue|3": {
    "type": "Dano",
    "damageDice": "4d8",
    "healDice": "",
    "healFromDamage": false
  },
  "flagelo de sangue|sangue|2": {
    "type": "Dano",
    "damageDice": "10d6",
    "healDice": "",
    "healFromDamage": false
  },
  "invadir mente|conhecimento|2": {
    "type": "Dano",
    "damageDice": "6d6",
    "healDice": "",
    "healFromDamage": false
  },
  "miasma entropico|morte|2": {
    "type": "Dano",
    "damageDice": "4d8",
    "healDice": "",
    "healFromDamage": false
  },
  "paradoxo|morte|2": {
    "type": "Dano",
    "damageDice": "6d6",
    "healDice": "",
    "healFromDamage": false
  },
  "poeira da podridao|morte|3": {
    "type": "Dano",
    "damageDice": "4d8",
    "healDice": "",
    "healFromDamage": false
  },
  "inexistir|conhecimento|4": {
    "type": "Dano",
    "damageDice": "10d12+10",
    "healDice": "",
    "healFromDamage": false
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
    "healFromDamage": false
  },
  "vomitar pestes|sangue|3": {
    "type": "Dano",
    "damageDice": "5d12",
    "healDice": "",
    "healFromDamage": false
  },
  "esfolar|sangue|1": {
    "type": "Dano",
    "damageDice": "3d4+3",
    "healDice": "",
    "healFromDamage": false
  },
  "desfazer sinapses|conhecimento|1": {
    "type": "Dano",
    "damageDice": "2d6+2",
    "healDice": "",
    "healFromDamage": false
  },
  "conhecendo o medo|medo|4": {
    "type": "Dano",
    "damageDice": "10d6",
    "healDice": "",
    "healFromDamage": false
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
