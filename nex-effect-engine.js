/* NEX 2.0.58 — Efeitos estruturados por personagem, sem alterar valores de base. */
(function(){
  'use strict';
  const by=id=>document.getElementById(id);
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number=(value,min=-99,max=99)=>Math.max(min,Math.min(max,Number.isFinite(Number(value))?Math.trunc(Number(value)):0));
  const skillNames=SKILL_DATA.map(row=>row[0]);
  const kinds={skill:'Perícia',pv:'PV máximo',pe:'PE máximo',defense:'Defesa'};
  const entries=()=>Array.isArray(state.nex58Effects)?state.nex58Effects:[];
  function sources(){
    const list=[{key:'manual:',name:'Regra manual / habilidade oficial'}];
    for(const h of state.nex51Items||[])if(h&&h.id)list.push({key:'hb:'+h.id,name:'Homebrew: '+h.name,minNex:Number(h.minNex)||0,equip:h.type==='item'});
    for(const p of state.powers||[])if(p&&p.id)list.push({key:'pow:'+p.id,name:'Poder: '+p.name});
    for(const a of state.n16?.abilities||[])if(a&&a.id)list.push({key:'ab:'+a.id,name:'Habilidade: '+a.name});
    for(const i of state.items||[])if(i&&i.id!=null&&number(i.quantity,0,9999)>0)list.push({key:'inv:'+i.id,name:'Item: '+i.name});
    return list;
  }
  function validSource(effect){
    if(typeof effect.source!=='string')return false;
    if(effect.source==='manual:')return true;
    const entry=sources().find(s=>s.key===effect.source);
    return !!entry && (!entry.minNex||number(state.nex,0,99)>=entry.minNex);
  }
  function enabled(effect){
    if(!effect||!validSource(effect))return false;
    if(effect.mode==='toggle'||effect.mode==='equip')return effect.active===true;
    return effect.mode==='passive' && !effect.source.startsWith('inv:') && !sources().some(s=>s.key===effect.source&&s.equip);
  }
  function totals(){
    const result={pv:0,pe:0,defense:0,skills:{}};
    for(const fx of entries().slice(0,100)){
      if(!enabled(fx)||!Object.hasOwn(kinds,fx.kind))continue;
      const value=number(fx.value);
      if(fx.kind==='skill'){
        if(skillNames.includes(fx.skill))result.skills[fx.skill]=(result.skills[fx.skill]||0)+value;
      }else result[fx.kind]+=value;
    }
    return result;
  }
  function skillBonus(name){return totals().skills[name]||0;}
  window.NEX58={skillBonus,totals};

  const previousMax=maxValues;
  maxValues=function(){
    const base=previousMax();
    const extra=totals();
    return {...base,pv:Math.max(0,base.pv+extra.pv),pe:Math.max(0,base.pe+extra.pe)};
  };
  function paintSkills(){
    const skillTotals=totals().skills;
    by('skillsList')?.querySelectorAll('.nexv16-skill-row').forEach(row=>{
      const select=row.querySelector('[data-n16-train]');
      if(!select)return;
      const name=select.dataset.n16Train;
      const bonus=skillTotals[name]||0;
      const skill=state.skills?.[name]||{};
      const total=number(skill.training)+number(skill.other)+bonus;
      const text=row.querySelector('.nexv16-total');
      if(text){text.textContent='('+(total>=0?'+':'')+total+')';text.title=bonus?'Inclui '+(bonus>0?'+':'')+bonus+' de efeitos ativos':'Treinamento + outros bônus';}
    });
  }
  function paintDefense(){
    const t=totals();
    const base=10+number(state.attributes?.agi)+Math.max(0,number(state.protectionDefense))+number(state.defenseBonus);
    const total=Math.max(0,base+t.defense);
    if(by('defense'))by('defense').value=total;
    if(by('n196OtherValue'))by('n196OtherValue').textContent=number(state.defenseBonus)+t.defense;
    const fort=state.skills?.Fortitude||{};
    const refl=state.skills?.Reflexos||{};
    const fortBonus=number(fort.training)+number(fort.other)+(t.skills.Fortitude||0);
    const reflBonus=number(refl.training)+number(refl.other)+(t.skills.Reflexos||0);
    if(by('nex20Block')&&number(fort.training)>0)by('nex20Block').textContent=String(Math.max(0,fortBonus));
    if(by('nex20Dodge')&&number(refl.training)>0)by('nex20Dodge').textContent=String(Math.max(0,total+reflBonus));
    if(by('nex20BlockInfo')&&number(fort.training)>0)by('nex20BlockInfo').textContent='RD · Fortitude '+fortBonus;
    if(by('nex20DodgeInfo')&&number(refl.training)>0)by('nex20DodgeInfo').textContent='Defesa + Reflexos '+reflBonus;
  }
  const previousStats=renderStats;
  renderStats=function(...args){
    const result=previousStats.apply(this,args);
    paintDefense();paintSkills();renderList();
    return result;
  };
  const previousSkills=renderSkills;
  renderSkills=function(...args){const result=previousSkills.apply(this,args);paintSkills();return result;};
  const previousAttributeRoll=attributeRoll;
  attributeRoll=function(key,label,bonus=0){
    return previousAttributeRoll(key,label,bonus+(skillNames.includes(label)?skillBonus(label):0));
  };

  const style=document.createElement('style');
  style.textContent='#nex58Panel{margin:12px 0;border:1px solid #583967;background:#141019;border-radius:5px;padding:10px;color:#eae3ef}' +
  '#nex58Panel>summary{cursor:pointer;font-weight:700;color:#e8d1ff;letter-spacing:.03em}' +
  '#nex58Panel p{margin:9px 0;color:#bbaec4;font-size:12px}' +
  '.nex58-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:12px}' +
  '.nex58-grid label{font-size:11px;color:#d9cce2;display:grid;gap:5px}' +
  '.nex58-grid [hidden]{display:none!important}' +
  '.nex58-grid input,.nex58-grid select{min-width:0;width:100%;font-size:14px;border:1px solid #54415d;background:#17121d;padding:8px;color:#eee;border-radius:3px}' +
  '.nex58-row{border-top:1px solid #423249;padding:11px 0;display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap}' +
  '.nex58-row strong{font-size:12px}.nex58-row small{display:block;font-size:11px;color:#b5a5bf;margin-top:3px}' +
  '.nex58-actions{display:flex;gap:6px;align-items:center;flex-wrap:wrap}' +
  '#nex58List{margin-top:13px}#nex58Status{font-size:12px;min-height:18px;color:#dcb9fb}' +
  '@media(max-width:600px){.nex58-grid{grid-template-columns:1fr}.nex58-row{align-items:flex-start}.nex58-actions button{min-height:35px}}';
  document.head.appendChild(style);
  const panel=document.createElement('details');
  panel.id='nex58Panel';
  panel.innerHTML='<summary>Efeitos automáticos <span id="nex58Count">(0)</span></summary>' +
    '<p>Configure bônus numéricos sem modificar os atributos de base. Efeitos de itens só valem enquanto equipados. Descrições livres não são convertidas em regras automaticamente.</p>' +
    '<form id="nex58Form"><div class="nex58-grid">' +
    '<label>Origem do efeito<select id="nex58Source"></select></label>' +
    '<label id="nex58NameLabel">Nome da habilidade ou efeito<input id="nex58Name" maxlength="90" placeholder="Ex.: Proteção adicional"></label>' +
    '<label>Aplicar em<select id="nex58Kind"><option value="skill">Perícia</option><option value="pv">PV máximo</option><option value="pe">PE máximo</option><option value="defense">Defesa</option></select></label>' +
    '<label id="nex58SkillLabel">Perícia<select id="nex58Skill"></select></label>' +
    '<label>Valor do bônus<input id="nex58Value" type="number" min="-99" max="99" value="2" required></label>' +
    '<label>Funcionamento<select id="nex58Mode"><option value="passive">Passivo (sempre)</option><option value="toggle">Ativar / desativar</option><option value="equip">Equipar / desequipar</option></select></label>' +
    '<label id="nex58CostLabel">Custo para ativar (PE)<input id="nex58Cost" type="number" min="0" max="50" value="0"></label>' +
    '</div><button type="submit" class="btn primary sm" style="margin-top:10px">Adicionar efeito</button></form>' +
    '<div id="nex58Status" role="status" aria-live="polite"></div><div id="nex58List"></div>';
  by('n16AbilityList')?.insertAdjacentElement('afterend',panel);
  by('nex58Skill').innerHTML=skillNames.map(name=>'<option value="'+esc(name)+'">'+esc(name)+'</option>').join('');

  function updateForm(){
    const selected=by('nex58Source').value;
    const isItem=selected.startsWith('inv:')||!!sources().find(s=>s.key===selected)?.equip;
    const kind=by('nex58Kind').value;
    const mode=by('nex58Mode');
    mode.disabled=isItem;
    if(isItem)mode.value='equip';
    else if(mode.value==='equip')mode.value='passive';
    by('nex58SkillLabel').hidden=kind!=='skill';
    by('nex58NameLabel').hidden=by('nex58Source').value!=='manual:';
    const toggle=mode.value==='toggle';
    by('nex58CostLabel').hidden=!toggle;
    by('nex58Cost').disabled=!toggle;
    if(!toggle)by('nex58Cost').value='0';
  }
  let lastState=null;
  let lastSources='';
  function resetSourceOptions(){
    const select=by('nex58Source');
    const previous=select.value;
    select.innerHTML=sources().map(s=>'<option value="'+esc(s.key)+'">'+esc(s.name)+'</option>').join('');
    if([...select.options].some(o=>o.value===previous))select.value=previous;
    updateForm();
  }
  function renderList(){
    if(!by('nex58List'))return;
    const signature=sources().map(s=>s.key+'='+s.name).join('|');
    if(lastState!==state){lastState=state;by('nex58Form').reset();lastSources=signature;resetSourceOptions();}
    else if(lastSources!==signature){lastSources=signature;resetSourceOptions();}
    const list=entries();
    const t=totals(),active=list.filter(enabled).length;
    by('nex58Count').textContent='('+active+' ativos / '+list.length+' cadastrados)';
    by('nex58List').innerHTML=list.length?list.map(fx=>{
      const linked=validSource(fx);
      const activeNow=enabled(fx);
      const isPassive=fx.mode==='passive';
      const canSwitch=linked&&(activeNow||number(state.peCurrent,0,9999)>=number(fx.cost,0,50));
      const label=fx.mode==='equip'?(activeNow?'Desequipar':'Equipar'):(activeNow?'Desativar':'Ativar');
      const source=sources().find(s=>s.key===fx.source)?.name||'Fonte removida';
      const name=fx.name||source;
      const value=number(fx.value);
      return '<div class="nex58-row"><div><strong>'+esc(name)+'</strong><small>'+esc(source)+' · '+esc(kinds[fx.kind]||'?')+
       (fx.kind==='skill'?' ('+esc(fx.skill)+')':'')+' '+(value>=0?'+':'')+value+
       ' · '+(!linked?'Fonte indisponível':activeNow?'Aplicado':'Inativo')+
       (fx.cost?' · '+number(fx.cost,0,50)+' PE/ativação':'')+'</small></div><div class="nex58-actions">'+
       (!isPassive?'<button type="button" class="btn sm" data-nex58-toggle="'+esc(fx.id)+'" '+(!canSwitch?'disabled':'')+'>'+label+'</button>':'')+
       '<button type="button" class="btn sm" data-nex58-remove="'+esc(fx.id)+'">Remover</button></div></div>';
    }).join(''):'<p>Nenhum efeito cadastrado para este personagem.</p>';
    by('nex58Status').textContent='Bônus ativos: PV '+(t.pv>=0?'+':'')+t.pv+' · PE '+(t.pe>=0?'+':'')+t.pe+' · Defesa '+(t.defense>=0?'+':'')+t.defense+'.';
  }
  by('nex58Source').addEventListener('change',updateForm);
  by('nex58Mode').addEventListener('change',updateForm);
  by('nex58Kind').addEventListener('change',updateForm);
  by('nex58Form').addEventListener('submit',event=>{
    event.preventDefault();
    if(!window.NEX51_BRIDGE?.ready())return;
    const source=by('nex58Source').value;
    const record=sources().find(s=>s.key===source);
    if(!record)return;
    const kind=by('nex58Kind').value;
    const skill=by('nex58Skill').value;
    const value=number(by('nex58Value').value);
    const mode=source.startsWith('inv:')||record.equip?'equip':by('nex58Mode').value;
    const cost=mode==='toggle'?number(by('nex58Cost').value,0,50):0;
    const name=source==='manual:'?by('nex58Name').value.trim():record.name.replace(/^(Homebrew|Item|Poder|Habilidade): /,'');
    if(!name||!Object.hasOwn(kinds,kind)||(kind==='skill'&&!skillNames.includes(skill))||!value||entries().length>=100)return;
    state.nex58Effects=[...entries(),{id:'fx_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8),source,name,kind,skill:kind==='skill'?skill:'',value,mode,active:false,cost}];
    renderStats();save();
    by('nex58Form').reset();resetSourceOptions();
  });
  panel.addEventListener('click',event=>{
    const button=event.target.closest('[data-nex58-toggle],[data-nex58-remove]');
    if(!button)return;
    const toggle=button.dataset.nex58Toggle;
    const id=toggle||button.dataset.nex58Remove;
    const fx=entries().find(item=>item.id===id);
    if(!fx)return;
    if(toggle){
      if(!validSource(fx))return;
      if(!fx.active && fx.mode==='toggle'){
        const cost=number(fx.cost,0,50);
        if(number(state.peCurrent,0,9999)<cost)return;
        state.peCurrent=number(state.peCurrent,0,9999)-cost;
      }
      fx.active=!fx.active;
    }else{
      if(!confirm('Remover este efeito da ficha?'))return;
      state.nex58Effects=entries().filter(item=>item.id!==id);
    }
    renderStats();save();
  });
  // Atualiza ao alternar fichas ou mudar itens. Não altera dados persistidos silenciosamente.
  document.addEventListener('nex51-ready',()=>{lastState=null;renderList();});
  panel.addEventListener('toggle',()=>{if(panel.open)renderList();});
  document.addEventListener('click',event=>{if(event.target.closest('[data-tab="overview"]'))queueMicrotask(renderList);});
  renderList();paintDefense();paintSkills();
})();
