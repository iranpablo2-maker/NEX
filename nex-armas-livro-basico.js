/* Dados de jogo da tabela 3.3 (p. 56–57) de Ordem Paranormal RPG v1.3. */
window.NEX_BASE_WEAPONS = (function(){
 const rows=[["Coronhada","Simples · Corpo a corpo · Leve","—","1d4/1d6","×2","—","Impacto",0],["Faca","Simples · Corpo a corpo · Leve","0","1d4","19","Curto","Corte",1],["Martelo","Simples · Corpo a corpo · Leve","0","1d6","×2","—","Impacto",1],["Punhal","Simples · Corpo a corpo · Leve","0","1d4","×3","—","Perfuração",1],["Bastão","Simples · Corpo a corpo · Uma mão","0","1d6/1d8","×2","—","Impacto",1],["Machete","Simples · Corpo a corpo · Uma mão","0","1d6","19","—","Corte",1],["Lança","Simples · Corpo a corpo · Uma mão","0","1d6","×2","Curto","Perfuração",1],["Cajado","Simples · Corpo a corpo · Duas mãos","0","1d6/1d6","×2","—","Impacto",2],["Arco","Simples · Disparo · Duas mãos","0","1d6","×3","Médio","Perfuração",2],["Besta","Simples · Disparo · Duas mãos","0","1d8","19","Médio","Perfuração",2],["Pistola","Simples · Fogo · Leve","I","1d12","18","Curto","Balístico",1],["Revólver","Simples · Fogo · Leve","I","2d6","19/×3","Curto","Balístico",1],["Fuzil de Caça","Simples · Fogo · Duas mãos","I","2d8","19/×3","Médio","Balístico",2],["Machadinha","Tática · Corpo a corpo · Leve","0","1d6","×3","Curto","Corte",1],["Nunchaku","Tática · Corpo a corpo · Leve","0","1d8","×2","—","Impacto",1],["Corrente","Tática · Corpo a corpo · Uma mão","0","1d8","×2","—","Impacto",1],["Espada","Tática · Corpo a corpo · Uma mão","I","1d8/1d10","19","—","Corte",1],["Florete","Tática · Corpo a corpo · Uma mão","I","1d6","18","—","Corte",1],["Machado","Tática · Corpo a corpo · Uma mão","I","1d8","×3","—","Corte",1],["Maça","Tática · Corpo a corpo · Uma mão","I","2d4","×2","—","Impacto",1],["Acha","Tática · Corpo a corpo · Duas mãos","I","1d12","×3","—","Corte",2],["Gadanho","Tática · Corpo a corpo · Duas mãos","I","2d4","×4","—","Corte",2],["Katana","Tática · Corpo a corpo · Duas mãos","I","1d10","19","—","Corte",2],["Marreta","Tática · Corpo a corpo · Duas mãos","I","3d4","×2","—","Impacto",2],["Montante","Tática · Corpo a corpo · Duas mãos","I","2d6","19","—","Corte",2],["Motosserra","Tática · Corpo a corpo · Duas mãos","I","3d6","×2","—","Corte",2],["Arco Composto","Tática · Disparo · Duas mãos","I","1d10","×3","Médio","Perfuração",2],["Balestra","Tática · Disparo · Duas mãos","I","1d12","19","Médio","Perfuração",2],["Submetralhadora","Tática · Fogo · Uma mão","I","2d6","19/×3","Curto","Balístico",1],["Espingarda","Tática · Fogo · Duas mãos","I","4d6","×3","Curto","Balístico",2],["Fuzil de Assalto","Tática · Fogo · Duas mãos","II","2d10","19/×3","Médio","Balístico",2],["Fuzil de Precisão","Tática · Fogo · Duas mãos","III","2d10","19/×3","Longo","Balístico",2],["Bazuca","Pesada · Fogo · Duas mãos","III","10d8","×2","Médio","Impacto",2],["Lança-Chamas","Pesada · Fogo · Duas mãos","III","6d6","×2","Curto","Fogo",2],["Metralhadora","Pesada · Fogo · Duas mãos","II","2d12","19/×3","Médio","Balístico",2]];
 const ammunition=[["Flechas","0",1],["Balas Curtas","0",1],["Balas Longas","I",1],["Cartuchos","I",1],["Foguete","I",1],["Combustível","I",1]];
 const ammoByWeapon={
  'Arco':'Flechas','Besta':'Flechas','Arco Composto':'Flechas','Balestra':'Flechas',
  'Pistola':'Balas Curtas','Revólver':'Balas Curtas','Submetralhadora':'Balas Curtas',
  'Fuzil de Caça':'Balas Longas','Fuzil de Assalto':'Balas Longas',
  'Fuzil de Precisão':'Balas Longas','Metralhadora':'Balas Longas',
  'Espingarda':'Cartuchos','Bazuca':'Foguete','Lança-Chamas':'Combustível'
 };
 const weapons=rows.map(([name,subtype,tier,damage,critical,range,type,spaces])=>({
  name,section:'Armas',source:'Ordem Paranormal RPG v1.3',
  subtitle:subtype,spaces,
  stats:[['Categoria',tier],['Dano',damage],['Crítico',critical],['Alcance',range],['Tipo',type],['Espaços',spaces===0?'—':String(spaces)],...(ammoByWeapon[name]?[['Munição',ammoByWeapon[name]]]:[])],
  description:'Dados de jogo da tabela 3.3, páginas 56–57.'
 }));
 const ammo=ammunition.map(([name,tier,spaces])=>({
  name,section:'Munições',source:'Ordem Paranormal RPG v1.3',
  subtitle:'Munição',spaces,
  stats:[['Categoria',tier],['Espaços',String(spaces)]],
  description:'Munição listada na tabela 3.3, páginas 56–57.'
 }));
 return [...weapons,...ammo];
})();
