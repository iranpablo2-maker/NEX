/* NEX: índices resumidos de equipamentos do suplemento Sobrevivendo ao Horror.
   Fonte: tabelas 1.4, 1.5 e 1.6; campos não verificados ficam em branco. */
window.NEX_ITEM_BOOKS = (function(){
 const equipment=[];
 const weapon=(name,tier,damage,critical,range,type,spaces)=>equipment.push({name,section:"Armas",source:"Sobrevivendo ao Horror",subtitle:"Arma · Suplemento",spaces,stats:[["Categoria",tier],["Dano",damage],["Crítico",critical],["Alcance",range],["Tipo",type],["Espaços",String(spaces)]],description:"Estatísticas de jogo conforme a tabela 1.4."});
 [
 ["Pregador Pneumático","0","1d4","×4","Curto","Perfuração",1],
 ["Estilingue","0","1d4","×2","Curto","Impacto",1],
 ["Revólver Compacto","I","2d4","19/×3","Curto","Perfuração",1],
 ["Baioneta","0","1d4","19","—","Perfuração",1],
 ["Faca Tática","I","1d6","19","Curto","Corte",1],
 ["Gancho de Carne","0","1d4","×4","—","Perfuração",1],
 ["Bastão Policial","I","1d6","×2","Curto","Impacto",1],
 ["Picareta","0","1d6","×4","—","Perfuração",1],
 ["Shuriken","I","1d4","×2","Curto","Perfuração",0.5],
 ["Pistola Pesada","I","2d8","18","Curto","Balístico",1],
 ["Espingarda de Cano Duplo","II","4d6","×3","Curto","Balístico",2]
 ].forEach(x=>weapon(...x));
 const general=(names,tier,space)=>names.forEach(name=>equipment.push({name,section:"Geral",source:"Sobrevivendo ao Horror",subtitle:"Equipamento geral · Suplemento",spaces:space,stats:[["Categoria",tier],["Espaços",String(space)]],description:"Equipamento listado na tabela 1.5."}));
 const generalList=[
 ["Amuleto Sagrado","0",1],["Celular","0",1],["Chave de Fenda Universal","0",1],["Chaves","0",1],
 ["Documentos Falsos","I",1],["Manual Operacional","I",1],["Notebook","0",2],
 ["Dinamite","I",1],["Explosivo Plástico","I",1],["Galão Vermelho","0",2],["Granada de Gás Sonífero","I",1],["Granada de PEM","I",1],
 ["Alarme de Movimento","0",1],["Alimento Energético","II",1],["Aplicador de Medicamentos","I",1],
 ["Braçadeira Reforçada","I",1],["Cão Adestrado","I",0],["Coldre Saque Rápido","I",1],
 ["Equipamento de Escuta","I",1],["Estrepes (Saco)","0",1],["Faixa de Pregos","I",2],
 ["Isqueiro","0",0.5],["Óculos de Visão Noturna","I",1],["Óculos Escuros","0",1],
 ["Pá","0",2],["Paraquedas","I",2],["Traje de Mergulho","I",2],["Traje Espacial","II",5],
 ["Catalisador Ritualístico Ampliador","I",0.5],["Catalisador Ritualístico Perturbador","I",0.5],
 ["Catalisador Ritualístico Potencializador","I",0.5],["Catalisador Ritualístico Prolongador","I",0.5],
 ["Ligação Direta Infernal","II",1],["Medidor de Condição Vertebral","II",1],
 ["Pé de Morto","II",1],["Pendrive Selado","II",0.5],["Valete da Salvação","I",0.5]
 ];
 for(const [name,tier,space] of generalList){
 const sections=(/^(Dinamite|Explosivo Plástico|Galão Vermelho|Granada)/.test(name))?"Geral":"Geral";
 equipment.push({name,section:sections,source:"Sobrevivendo ao Horror",subtitle:"Equipamento geral · Suplemento",spaces:space,stats:[["Categoria",tier],["Espaços",String(space)]],description:"Equipamento listado na tabela 1.5."});
 }
 const medicines=["Antibiótico","Antídoto","Antiemético","Antihistamínico","Anti-inflamatório","Antitérmico","Broncodilatador","Coagulante"];
 for(const name of medicines)equipment.push({name,section:"Geral",source:"Sobrevivendo ao Horror",subtitle:"Medicamento · Suplemento",spaces:0.5,stats:[["Categoria","I"],["Espaços","0,5"]],description:"Medicamento listado na tabela 1.5."});
 const cursed=[
 ["Ampulheta do Tempo Sofrido","Morte","II",1],
 ["Arreio Neural","Energia","II",1],
 ["Câmera Obscura","Conhecimento","III",1],
 ["Centrifugador Existencial","Energia","III",1],
 ["Conector de Membros","Sangue","III",1],
 ["Dose d’A Praga","Sangue","III",1],
 ["Enxame Fantasmagórico","Conhecimento","III",1],
 ["Espelho Refletor","Energia","II",1],
 ["Fuzil Alheio","Energia","IV",2],
 ["Injeção de Lodo","Morte","II",0.5],
 ["Instantâneo Mortal","Morte","II",0.5],
 ["Mandíbula Agonizante","Sangue","II",1],
 ["A Primeira Adaga","Medo","III",1],
 ["Projétil de Lodo (Curto)","Morte","I",1],
 ["Projétil de Lodo (Longo)","Morte","II",1],
 ["Rádio Chiador","Morte","II",1],
 ["Repositório do Fracasso","Conhecimento","II",1],
 ["Retalho Tenebroso","Sangue","II",1],
 ["Tábula do Saber Custoso","Conhecimento","II",1]
 ];
 for(const [name,element,tier,spaces] of cursed)equipment.push({name,section:"Itens Amaldiçoados",source:"Sobrevivendo ao Horror",subtitle:"Item amaldiçoado · "+element,spaces,stats:[["Elemento",element],["Categoria",tier],["Espaços",String(spaces)]],description:"Item amaldiçoado listado na tabela 1.6."});
 return equipment;
})();