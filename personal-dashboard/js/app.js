var LS='dash_v1';
var DAYS=['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
var DFULL=['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'];
var TABS=[['home','▦','Обзор'],['tasks','✓','Задачи'],['calc','＋','Калькулятор'],['week','▤','Неделя'],['words','Aa','Слова'],['sat','★','SAT']];
function defaults(){return{tasks:[],sched:[[],[],[],[],[],[],[]],words:[
{w:'resilient',t:'устойчивый, стойкий',k:0},{w:'ambiguous',t:'неоднозначный',k:0},{w:'meticulous',t:'дотошный, скрупулёзный',k:0},{w:'candid',t:'искренний, откровенный',k:0},{w:'scarce',t:'редкий, дефицитный',k:0}],sat:[],goal:1400,study:0}}
var S=defaults();
try{var raw=localStorage.getItem(LS);if(raw){var p=JSON.parse(raw);if(p&&p.tasks)S=Object.assign(defaults(),p)}}catch(e){}
var view='home',selDay=(new Date().getDay()+6)%7,filter='all',cardIdx=0,flip=false,onlyNew=false;
var calc={e:'',r:'0',h:[]};
function save(){try{localStorage.setItem(LS,JSON.stringify(S))}catch(e){}}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function toast(m){var t=document.getElementById('toast');t.textContent=m;t.classList.add('on');setTimeout(function(){t.classList.remove('on')},1500)}
function $(id){return document.getElementById(id)}
function nav(){$('nav').innerHTML='<h1>Моя панель</h1>'+TABS.map(function(t){return'<button data-v="'+t[0]+'" class="'+(view===t[0]?'on':'')+'"><b>'+t[1]+'</b>'+t[2]+'</button>'}).join('')+'<div class="sp"></div><button class="rs" data-a="reset">Сбросить данные</button>'}
function render(){nav();var m=$('main');
if(view==='home')m.innerHTML=home();
else if(view==='tasks')m.innerHTML=tasks();
else if(view==='calc')m.innerHTML=calcV();
else if(view==='week')m.innerHTML=week();
else if(view==='words')m.innerHTML=words();
else m.innerHTML=sat();
if(view==='tasks'&&$('ti'))0}
/* ---------- Обзор ---------- */
function satBest(){return S.sat.length?Math.max.apply(null,S.sat.map(function(r){return r.m+r.e})):0}
function home(){
var tot=S.tasks.length,dn=S.tasks.filter(function(t){return t.d}).length,pc=tot?Math.round(dn/tot*100):0;
var kn=S.words.filter(function(w){return w.k}).length,wp=S.words.length?Math.round(kn/S.words.length*100):0;
var ev=S.sched.reduce(function(a,d){return a+d.length},0),best=satBest(),gp=Math.min(100,Math.round(best/S.goal*100));
var h=new Date().getHours(),g=h<6?'Доброй ночи':h<12?'Доброе утро':h<18?'Добрый день':'Добрый вечер';
var td=S.sched[(new Date().getDay()+6)%7].slice().sort(function(a,b){return a.time<b.time?-1:1});
return'<h2>'+g+'!</h2><p class="sub">'+new Date().toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long'})+'</p>'+
'<div class="grid">'+
'<div class="card"><div class="mt">Задачи выполнены</div><div class="big">'+dn+' / '+tot+'</div><div class="bar"><i style="width:'+pc+'%"></i></div><div class="mt" style="margin-top:6px">'+pc+'%</div></div>'+
'<div class="card"><div class="mt">Слова выучены</div><div class="big">'+kn+' / '+S.words.length+'</div><div class="bar"><i style="width:'+wp+'%;background:var(--wm)"></i></div><div class="mt" style="margin-top:6px">'+wp+'%</div></div>'+
'<div class="card"><div class="mt">Лучший SAT</div><div class="big">'+(best||'—')+'</div><div class="bar"><i style="width:'+gp+'%;background:var(--ac)"></i></div><div class="mt" style="margin-top:6px">Цель: '+S.goal+' ('+gp+'%)</div></div>'+
'<div class="card"><div class="mt">Занятий в неделю</div><div class="big">'+ev+'</div><div class="mt" style="margin-top:6px">Попыток SAT: '+S.sat.length+'</div></div></div>'+
'<div class="grid" style="margin-top:14px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">'+
'<div class="card"><b>Сегодня в расписании</b>'+(td.length?td.map(function(e){return'<div class="item"><span class="tag">'+esc(e.time)+'</span><span class="t">'+esc(e.title)+'</span></div>'}).join(''):'<div class="empty">На сегодня ничего нет. Добавьте занятие во вкладке «Неделя».</div>')+'</div>'+
'<div class="card"><b>Динамика SAT</b>'+chart()+'</div></div>'}
/* ---------- Задачи ---------- */
function tasks(){
var l=S.tasks.filter(function(t){return filter==='all'||(filter==='done'?t.d:!t.d)});
return'<h2>Задачи</h2><p class="sub">Добавляйте, отмечайте и удаляйте дела.</p>'+
'<div class="card"><div class="row"><input class="in" id="ti" placeholder="Что нужно сделать?" maxlength="120"><button class="btn" data-a="addtask">Добавить</button></div>'+
'<div class="tabs" style="margin:14px 0 4px">'+[['all','Все'],['open','Активные'],['done','Выполненные']].map(function(f){return'<button data-a="filter" data-f="'+f[0]+'" class="'+(filter===f[0]?'on':'')+'">'+f[1]+'</button>'}).join('')+'</div>'+
(l.length?l.map(function(t){return'<div class="item '+(t.d?'done':'')+'"><input type="checkbox" data-a="toggle" data-i="'+t.id+'" '+(t.d?'checked':'')+'><span class="t">'+esc(t.t)+'</span><button class="x" title="Удалить" data-a="deltask" data-i="'+t.id+'">✕</button></div>'}).join(''):'<div class="empty">Список пуст. Введите задачу выше.</div>')+
(S.tasks.some(function(t){return t.d})?'<div style="margin-top:10px"><button class="btn g" data-a="clrdone">Очистить выполненные</button></div>':'')+'</div>'}
/* ---------- Калькулятор ---------- */
function calcV(){
var K=[['C','cl'],['⌫','op'],['%','op'],['÷','op'],['7'],['8'],['9'],['×','op'],['4'],['5'],['6'],['−','op'],['1'],['2'],['3'],['+','op'],['±','op'],['0'],['.'],['=','eq']];
return'<h2>Калькулятор</h2><p class="sub">Работает и с клавиатуры.</p><div class="card calc"><div class="disp"><div class="e" id="ce">'+esc(calc.e)+'</div><div class="r" id="cr">'+esc(calc.r)+'</div></div><div class="keys">'+K.map(function(k){return'<button class="'+(k[1]||'')+'" data-a="key" data-k="'+k[0]+'">'+k[0]+'</button>'}).join('')+'</div>'+
(calc.h.length?'<div style="margin-top:14px"><div class="mt">История</div>'+calc.h.map(function(x){return'<div class="mt">'+esc(x)+'</div>'}).join('')+'</div>':'')+'</div>'}
function calcKey(k){
var e=calc.e;
if(k==='C'){calc.e='';calc.r='0'}
else if(k==='⌫'){calc.e=e.slice(0,-1);calc.r=calc.e||'0'}
else if(k==='='){if(!e)return;try{var x=e.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/(\d+\.?\d*)%/g,'($1/100)');
if(!/^[0-9+\-*/.() ]+$/.test(x))throw 0;var v=Function('"use strict";return ('+x+')')();
if(!isFinite(v))throw 0;v=Math.round(v*1e10)/1e10;calc.h.unshift(e+' = '+v);calc.h=calc.h.slice(0,5);calc.e=String(v);calc.r=String(v)}catch(err){calc.r='Ошибка';calc.e=''}}
else if(k==='±'){if(e&&e[0]==='-')calc.e=e.slice(1);else if(e)calc.e='-'+e;calc.r=calc.e||'0'}
else{if(calc.r==='Ошибка'){calc.e=''}
if('+−×÷'.indexOf(k)>=0&&(!calc.e||'+−×÷'.indexOf(calc.e.slice(-1))>=0)){if(!calc.e)return;calc.e=calc.e.slice(0,-1)}
calc.e+=k;calc.r=calc.e}
if(view==='calc'){render()}}
/* ---------- Неделя ---------- */
function week(){
var t=(new Date().getDay()+6)%7;
return'<h2>Расписание на неделю</h2><p class="sub">Занятия, уроки и встречи по дням.</p>'+
'<div class="card" style="margin-bottom:14px"><div class="row"><select id="sd">'+DFULL.map(function(d,i){return'<option value="'+i+'" '+(i===selDay?'selected':'')+'>'+d+'</option>'}).join('')+'</select><input type="time" id="stm" value="09:00"><input class="in" id="stt" placeholder="Название" maxlength="60"><button class="btn" data-a="addev">Добавить</button></div></div>'+
'<div class="tabs mtabs">'+DAYS.map(function(d,i){return'<button data-a="selday" data-i="'+i+'" class="'+(selDay===i?'on':'')+'">'+d+'</button>'}).join('')+'</div>'+
'<div class="week">'+S.sched.map(function(d,i){var s=d.map(function(e,j){return{e:e,j:j}}).sort(function(a,b){return a.e.time<b.e.time?-1:1});
return'<div class="day '+(i===t?'today ':'')+(i===selDay?'':'hid')+'"><h4>'+DAYS[i]+(i===t?' · сегодня':'')+'</h4>'+(s.length?s.map(function(o){return'<div class="ev"><span><b>'+esc(o.e.time)+'</b> '+esc(o.e.title)+'</span><button class="x" title="Удалить" data-a="delev" data-d="'+i+'" data-i="'+o.j+'">✕</button></div>'}).join(''):'<div class="mt">Свободно</div>')+'</div>'}).join('')+'</div>'}
/* ---------- Слова ---------- */
function pool(){return S.words.map(function(w,i){return i}).filter(function(i){return!onlyNew||!S.words[i].k})}
function words(){
var p=pool(),cur=null;if(p.length){if(cardIdx>=p.length)cardIdx=0;cur=S.words[p[cardIdx]]}
return'<h2>Английские слова</h2><p class="sub">Нажмите на карточку, чтобы увидеть перевод.</p>'+
'<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))"><div class="card">'+
(cur?'<div class="fc" data-a="flip"><div class="mt">'+(flip?'Перевод':'Слово')+' · '+(cardIdx+1)+' из '+p.length+'</div><b>'+esc(flip?cur.t:cur.w)+'</b></div>'+
'<div class="row"><button class="btn g" data-a="prev">Назад</button><button class="btn ok" style="background:var(--ok);color:#0b2a1a" data-a="know">'+(cur.k?'Снова учить':'Знаю')+'</button><button class="btn" data-a="next">Дальше</button></div>':'<div class="empty">Нет слов для показа. Добавьте новые справа или отключите фильтр.</div>')+
'<div style="margin-top:12px"><label class="row mt"><input type="checkbox" data-a="onlynew" '+(onlyNew?'checked':'')+'> Показывать только неизученные</label></div></div>'+
'<div class="card"><b>Добавить слово</b><div class="row" style="margin:10px 0"><input class="in" id="wa" placeholder="Слово" maxlength="40"><input class="in" id="wb" placeholder="Перевод" maxlength="60"><button class="btn w" data-a="addword">Добавить</button></div>'+
'<div style="max-height:300px;overflow:auto">'+S.words.map(function(w,i){return'<div class="item"><span class="t"><b>'+esc(w.w)+'</b> — '+esc(w.t)+'</span><span class="tag '+(w.k?'ok':'')+'">'+(w.k?'знаю':'учу')+'</span><button class="x" title="Удалить" data-a="delword" data-i="'+i+'">✕</button></div>'}).join('')+'</div></div></div>'}
/* ---------- SAT ---------- */
function chart(){
if(!S.sat.length)return'<div class="empty">Пока нет результатов.</div>';
var d=S.sat.map(function(r){return r.m+r.e}),W=400,H=170,P=28,mn=Math.min(400,Math.min.apply(null,d)-50),mx=Math.max(S.goal,Math.max.apply(null,d))+50;
function X(i){return d.length>1?P+i*(W-2*P)/(d.length-1):W/2}function Y(v){return H-P-(v-mn)/(mx-mn)*(H-2*P)}
var pts=d.map(function(v,i){return X(i)+','+Y(v)}).join(' ');
return'<svg viewBox="0 0 '+W+' '+H+'"><line x1="'+P+'" x2="'+(W-P)+'" y1="'+Y(S.goal)+'" y2="'+Y(S.goal)+'" stroke="#ffb86b" stroke-dasharray="5 4"/><text x="'+(W-P)+'" y="'+(Y(S.goal)-5)+'" fill="#ffb86b" font-size="11" text-anchor="end">цель '+S.goal+'</text><polyline points="'+pts+'" fill="none" stroke="#8b9cff" stroke-width="3" stroke-linejoin="round"/>'+
d.map(function(v,i){return'<circle cx="'+X(i)+'" cy="'+Y(v)+'" r="4.5" fill="#8b9cff"/><text x="'+X(i)+'" y="'+(Y(v)-10)+'" fill="#e9eaf3" font-size="11" text-anchor="middle">'+v+'</text>'}).join('')+'</svg>'}
function sat(){
var last=S.sat.length?S.sat[S.sat.length-1]:null,avg=S.sat.length?Math.round(S.sat.reduce(function(a,r){return a+r.m+r.e},0)/S.sat.length):0;
return'<h2>Результаты SAT</h2><p class="sub">Каждая секция от 200 до 800, всего до 1600.</p>'+
'<div class="grid" style="margin-bottom:14px"><div class="card"><div class="mt">Последний</div><div class="big">'+(last?last.m+last.e:'—')+'</div></div><div class="card"><div class="mt">Лучший</div><div class="big">'+(satBest()||'—')+'</div></div><div class="card"><div class="mt">Средний</div><div class="big">'+(avg||'—')+'</div></div>'+
'<div class="card"><div class="mt">Целевой балл</div><div class="row"><input type="number" id="goal" value="'+S.goal+'" min="400" max="1600" step="10" style="width:90px"><button class="btn g" data-a="setgoal">Сохранить</button></div></div></div>'+
'<div class="card" style="margin-bottom:14px"><div class="row"><input type="date" id="sdt" value="'+new Date().toISOString().slice(0,10)+'"><input type="number" id="sm" class="in" placeholder="Математика" min="200" max="800"><input type="number" id="se" class="in" placeholder="Чтение и письмо" min="200" max="800"><button class="btn" data-a="addsat">Добавить</button></div></div>'+
'<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))"><div class="card"><b>График</b>'+chart()+'</div><div class="card"><b>История</b>'+(S.sat.length?S.sat.map(function(r,i){return{r:r,i:i}}).reverse().map(function(o){return'<div class="item"><span class="t"><b>'+(o.r.m+o.r.e)+'</b> <span class="mt">мат. '+o.r.m+' · чт. '+o.r.e+' · '+esc(o.r.date)+'</span></span><button class="x" title="Удалить" data-a="delsat" data-i="'+o.i+'">✕</button></div>'}).join(''):'<div class="empty">Добавьте первый результат.</div>')+'</div></div>'}
/* ---------- События ---------- */
document.addEventListener('click',function(ev){
var el=ev.target.closest('[data-a],[data-v]');if(!el)return;
if(el.dataset.v){view=el.dataset.v;render();window.scrollTo(0,0);return}
var a=el.dataset.a,i=+el.dataset.i,v;
if(a==='addtask'){v=$('ti').value.trim();if(!v){$('ti').focus();return}S.tasks.unshift({id:Date.now(),t:v,d:false});save();render();$('ti').focus()}
else if(a==='toggle'){S.tasks.forEach(function(t){if(t.id===i)t.d=!t.d});save();render()}
else if(a==='deltask'){S.tasks=S.tasks.filter(function(t){return t.id!==i});save();render()}
else if(a==='clrdone'){S.tasks=S.tasks.filter(function(t){return!t.d});save();render()}
else if(a==='filter'){filter=el.dataset.f;render()}
else if(a==='key'){calcKey(el.dataset.k)}
else if(a==='selday'){selDay=i;render()}
else if(a==='addev'){v=$('stt').value.trim();if(!v){$('stt').focus();return}var d=+$('sd').value;S.sched[d].push({time:$('stm').value||'00:00',title:v});selDay=d;save();render();toast('Добавлено')}
else if(a==='delev'){S.sched[+el.dataset.d].splice(i,1);save();render()}
else if(a==='flip'){flip=!flip;render()}
else if(a==='next'){cardIdx++;flip=false;render()}
else if(a==='prev'){cardIdx=Math.max(0,cardIdx-1);flip=false;render()}
else if(a==='know'){var p=pool();S.words[p[cardIdx]].k=S.words[p[cardIdx]].k?0:1;save();flip=false;if(onlyNew&&cardIdx>=pool().length)cardIdx=0;else if(!onlyNew)cardIdx++;render()}
else if(a==='onlynew'){onlyNew=el.checked;cardIdx=0;flip=false;render()}
else if(a==='addword'){var w=$('wa').value.trim(),t=$('wb').value.trim();if(!w||!t){toast('Заполните оба поля');return}S.words.push({w:w,t:t,k:0});save();render();toast('Слово добавлено')}
else if(a==='delword'){S.words.splice(i,1);cardIdx=0;save();render()}
else if(a==='addsat'){var m=+$('sm').value,e=+$('se').value;if(!(m>=200&&m<=800&&e>=200&&e<=800)){toast('Баллы: от 200 до 800');return}S.sat.push({date:$('sdt').value,m:m,e:e});S.sat.sort(function(x,y){return x.date<y.date?-1:1});save();render();toast('Результат сохранён')}
else if(a==='delsat'){S.sat.splice(i,1);save();render()}
else if(a==='setgoal'){var g=+$('goal').value;if(g>=400&&g<=1600){S.goal=g;save();render();toast('Цель сохранена')}else toast('Цель: 400–1600')}
else if(a==='reset'){if(confirm('Удалить все данные?')){S=defaults();save();render()}}
});
document.addEventListener('keydown',function(e){
var t=e.target;
if(e.key==='Enter'&&t.tagName==='INPUT'){var map={ti:'addtask',stt:'addev',wb:'addword',se:'addsat'};if(map[t.id]){var b=document.querySelector('[data-a="'+map[t.id]+'"]');if(b)b.click()}return}
if(view!=='calc'||t.tagName==='INPUT')return;
var k=e.key,m={'*':'×','/':'÷','-':'−','Enter':'=','=':'=','Backspace':'⌫','Escape':'C','Delete':'C'};
if(/^[0-9.+%]$/.test(k)||m[k]){e.preventDefault();calcKey(m[k]||k)}});
render();
