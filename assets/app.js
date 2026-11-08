(function(){
'use strict';
var D=window.ALBERO;
var app=document.getElementById('app');
if(!D){app.innerHTML='<p class="caricamento">Impossibile caricare i dati dell’albero (dati/albero.js).</p>';return;}
var P=D.persone, F=D.famiglie, IDS=Object.keys(P);
var agg=document.getElementById('aggiornato'); if(agg&&D.generato){agg.textContent='Ultimo aggiornamento dei dati: '+D.generato.split('-').reverse().join('/')+'.';}

/* ---------- utilità ---------- */
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');}
function anno(d){return d?d.y:null;}
function arco(p){
  var n=p.nascita, m=p.morte;
  if(n&&m) return (n.circa?'c. ':'')+n.y+' – '+(m.circa?'c. ':'')+m.y;
  if(n) return (n.circa?'c. ':'')+n.y+' – '+(p.defunto?'?':'');
  if(m) return '? – '+m.y;
  return p.defunto?'date sconosciute':'';
}
function eta(p){
  var n=p.nascita,m=p.morte; if(!n||!m) return '';
  var a=m.y-n.y; if(n.m&&m.m&&(m.m<n.m||(m.m===n.m&&n.d&&m.d&&m.d<n.d))) a--;
  if(a<0) return '';
  if(a===0){ if(n.m&&m.m){var mesi=(m.y-n.y)*12+m.m-n.m; if(n.d&&m.d&&m.d<n.d)mesi--; if(mesi<=0)return 'meno di un mese'; return mesi===1?'1 mese':mesi+' mesi';} return 'meno di un anno';}
  return ((n.circa||m.circa||!n.m)?'circa ':'')+a+(a===1?' anno':' anni');
}
function iniziali(p){var a=(p.nomi||p.nome||'?').trim()[0]||'?',b=(p.cognome||'').trim()[0]||'';return (a+b).toUpperCase();}
function avatar(p,cls){
  var f=p.foto&&p.foto.length&&ritrattoFoto(p);
  return '<span class="'+(cls||'avatar')+' '+(p.sesso||'')+'">'+(f?'<img loading="lazy" src="'+esc(f.src)+'" alt="">':esc(iniziali(p)))+'</span>';
}
function ritrattoFoto(p){ // usa come ritratto solo foto e lapidi, non gli atti scritti
  for(var i=0;i<p.foto.length;i++){ if(p.foto[i].tipo==='lapide'||p.foto[i].tipo==='foto') return p.foto[i]; }
  return null;
}
function genitoriDi(id){var p=P[id]; if(!p||!p.genitori||!F[p.genitori])return []; return F[p.genitori].genitori;}
function padreMadre(id){var g=genitoriDi(id),pa=null,ma=null; g.forEach(function(x){if(P[x].sesso==='M'&&!pa)pa=x;else if(!ma)ma=x;else if(!pa)pa=x;}); return [pa,ma];}
function sub(p){
  var s=arco(p), pm=padreMadre(p.id), g=[];
  var ok=function(x){return x&&P[x].nome!=='Nome non indicato';};
  if(ok(pm[0]))g.push(P[pm[0]].nomi||P[pm[0]].nome); if(ok(pm[1]))g.push(P[pm[1]].nome);
  return esc(s)+(g.length?(s?' · ':'')+(p.sesso==='F'?'figlia di ':p.sesso==='M'?'figlio di ':'figlio/a di ')+esc(g.join(' e ')):'');
}
function riga(id,extra){var p=P[id]; if(!p)return ''; return '<a class="riga" href="#/persona/'+id+'">'+avatar(p)+'<span class="info"><span class="n">'+esc(p.nome)+(extra?' <small style="color:var(--muto);font-weight:400">'+extra+'</small>':'')+'</span><span class="sub">'+sub(p)+'</span></span></a>';}
function link(id){return P[id]?'<a href="#/persona/'+id+'">'+esc(P[id].nome)+'</a>':esc(id);}
function testoNota(t){return esc(t).replace(/\b(ind\d{5})\b/g,function(m){return P[m]?link(m):m;}).replace(/\n/g,'<br>');}
function ordina(a,b){var pa=P[a],pb=P[b],ya=anno(pa.nascita)||9999,yb=anno(pb.nascita)||9999; return ya-yb||pa.nome.localeCompare(pb.nome,'it');}
function titolo(t){document.title=t?t+' · Gli avi di Belnome':'Gli avi di Belnome · Albero genealogico';}
function attivaMenu(h){document.querySelectorAll('.menu a').forEach(function(a){a.classList.toggle('attivo',a.getAttribute('href')===h);});}

/* indice di ricerca */
var IDX=IDS.map(function(id){var p=P[id];return {id:id,t:norm([p.nome,p.nomi,p.cognome,p.detto].join(' ')),c:norm(p.cognome),y:anno(p.nascita),ym:anno(p.morte)};});

/* ---------- viste ---------- */
function vistaHome(){
  titolo(''); attivaMenu('#/');
  var cg={}; IDS.forEach(function(id){var c=P[id].cognome||'(senza cognome)';cg[c]=(cg[c]||0)+1;});
  var top=Object.keys(cg).sort(function(a,b){return cg[b]-cg[a];}).slice(0,12);
  var conFoto=IDS.filter(function(id){return P[id].foto.length;}).length;
  var anni=IDS.map(function(id){return anno(P[id].nascita);}).filter(Boolean);
  var minY=Math.min.apply(null,anni);
  var antichi=IDS.filter(function(id){return anno(P[id].nascita);}).sort(ordina).slice(0,8);
  var recFoto=IDS.filter(function(id){return ritrattoFoto(P[id]);}).sort(function(){return Math.random()-.5;}).slice(0,8);
  app.innerHTML=
   '<section class="eroe"><div class="scheda intro"><h1>Cerca i tuoi antenati di Belnome</h1>'+
   '<p>L’albero raccoglie le famiglie del paese, soprattutto Rebollini, Zanotti e Zuffi, dal Settecento a oggi. Per ogni persona ci sono le date, i genitori, i coniugi, i figli e, quando esistono, le fotografie degli atti e delle lapidi.</p>'+
   formRicerca({})+'</div>'+
   '<div class="scheda numeri">'+
     num(IDS.length,'persone')+num(Object.keys(F).length,'famiglie')+num(conFoto,'schede con documenti o foto')+num(minY,'la nascita più antica')+
   '</div></section>'+
   '<section class="scheda pad banda-ric"><div><h2 class="titolo-sez">Ricerche d’archivio</h2><p>Atti di nascita, morte e matrimonio trascritti dai registri di Ottone, battesimi della villa di Belnome, lapidi e i dati ancora da verificare, con i collegamenti ai registri originali.</p></div><a class="btn" href="#/ricerche">Vedi le ricerche</a></section>'+
   '<section class="scheda pad"><h2 class="titolo-sez">Cognomi <small>scegli un cognome per vedere tutte le persone</small></h2><div class="griglia-cognomi">'+
   top.map(function(c){return '<a class="cognome" href="#/cognome/'+encodeURIComponent(c)+'"><b>'+esc(c)+'</b><span>'+cg[c]+'</span></a>';}).join('')+
   '<a class="cognome" href="#/cognomi"><b>Tutti…</b><span>'+Object.keys(cg).length+'</span></a></div></section>'+
   '<div class="due"><section class="scheda pad"><h2 class="titolo-sez">Le nascite più antiche</h2><ul class="elenco">'+antichi.map(function(id){return '<li>'+riga(id)+'</li>';}).join('')+'</ul></section>'+
   '<section class="scheda pad"><h2 class="titolo-sez">Volti e lapidi</h2><ul class="elenco">'+recFoto.map(function(id){return '<li>'+riga(id)+'</li>';}).join('')+'</ul></section></div>';
  legaForm();
}
function num(n,t){return '<div class="numero"><b>'+esc(n)+'</b><span>'+esc(t)+'</span></div>';}
function formRicerca(q){
  return '<form class="modulo" id="formRicerca">'+
   '<div><label for="fNome">Nome</label><input id="fNome" name="nome" value="'+esc(q.nome||'')+'" placeholder="es. Giovanni"></div>'+
   '<div><label for="fCognome">Cognome</label><input id="fCognome" name="cognome" list="listaCognomi" value="'+esc(q.cognome||'')+'" placeholder="es. Rebollini"></div>'+
   '<div><label for="fDa">Nato dal</label><input id="fDa" name="da" inputmode="numeric" value="'+esc(q.da||'')+'" placeholder="anno"></div>'+
   '<div><label for="fA">al</label><input id="fA" name="a" inputmode="numeric" value="'+esc(q.a||'')+'" placeholder="anno"></div>'+
   '<div class="azione"><button class="btn" type="submit">Cerca</button></div>'+
   '<datalist id="listaCognomi">'+Array.from(new Set(IDS.map(function(i){return P[i].cognome;}).filter(Boolean))).sort().map(function(c){return '<option value="'+esc(c)+'">';}).join('')+'</datalist></form>';
}
function legaForm(){
  var f=document.getElementById('formRicerca'); if(!f)return;
  f.addEventListener('submit',function(e){e.preventDefault();var p=new URLSearchParams();['nome','cognome','da','a'].forEach(function(k){var v=f.elements[k].value.trim();if(v)p.set(k,v);});location.hash='#/cerca?'+p.toString();});
}
function cerca(q){
  var nome=norm(q.nome||q.q||''), cogn=norm(q.cognome||''), da=parseInt(q.da,10), a=parseInt(q.a,10);
  var tok=nome.split(/\s+/).filter(Boolean);
  return IDX.filter(function(x){
    if(cogn&&x.c.indexOf(cogn)!==0)return false;
    for(var i=0;i<tok.length;i++) if(x.t.indexOf(tok[i])<0) return false;
    if(!isNaN(da)&&!(x.y&&x.y>=da))return false;
    if(!isNaN(a)&&!(x.y&&x.y<=a))return false;
    return true;
  }).map(function(x){return x.id;}).sort(function(i,j){
    if(nome){var si=norm(P[i].nome).indexOf(nome)===0?0:1, sj=norm(P[j].nome).indexOf(nome)===0?0:1; if(si!==sj)return si-sj;}
    return ordina(i,j);
  });
}
function vistaCerca(q){
  titolo('Ricerca'); attivaMenu('#/cerca');
  var vuota=!q.nome&&!q.q&&!q.cognome&&!q.da&&!q.a;
  var ris=vuota?[]:cerca(q), pag=Math.max(1,parseInt(q.p||'1',10)), per=40, tot=ris.length, np=Math.ceil(tot/per);
  var pezzo=ris.slice((pag-1)*per,pag*per);
  if(q.q&&!q.nome)q.nome=q.q;
  app.innerHTML='<section class="scheda pad" style="margin-bottom:20px"><h1 class="titolo-sez" style="font-size:26px">Ricerca</h1>'+formRicerca(q)+'</section>'+
   (vuota?'<p class="vuoto">Scrivi un nome o un cognome, oppure scegli un periodo di nascita.</p>':
   '<section class="scheda pad"><h2 class="titolo-sez">Risultati <small>'+tot+(tot===1?' persona':' persone')+'</small></h2>'+
   (tot?'<ul class="elenco">'+pezzo.map(function(id){return '<li>'+riga(id)+'</li>';}).join('')+'</ul>'+paginazione(q,pag,np):'<p class="vuoto">Nessuna persona trovata. Prova con meno parole o con un’altra grafia (per esempio Rebollini / Rebolini).</p>')+'</section>');
  legaForm();
}
function paginazione(q,pag,np){
  if(np<=1)return '';
  function h(p){var o=new URLSearchParams();Object.keys(q).forEach(function(k){if(k!=='p'&&q[k])o.set(k,q[k]);});o.set('p',p);return '#/cerca?'+o.toString();}
  return '<div class="paginazione">'+(pag>1?'<a class="btn chiaro" href="'+h(pag-1)+'">‹ Precedenti</a>':'')+'<span>Pagina '+pag+' di '+np+'</span>'+(pag<np?'<a class="btn chiaro" href="'+h(pag+1)+'">Successivi ›</a>':'')+'</div>';
}
function vistaCognomi(){
  titolo('Cognomi'); attivaMenu('#/cognomi');
  var cg={}; IDS.forEach(function(id){var c=P[id].cognome||'(senza cognome)';cg[c]=(cg[c]||0)+1;});
  var L=Object.keys(cg).sort(function(a,b){return a.localeCompare(b,'it');});
  var lett=Array.from(new Set(L.map(function(c){return c[0].toUpperCase();})));
  app.innerHTML='<section class="scheda pad"><h1 class="titolo-sez" style="font-size:26px">Tutti i cognomi <small>'+L.length+'</small></h1>'+
   '<div class="lettere">'+lett.map(function(l){return '<a href="#/cognomi" data-l="'+esc(l)+'">'+esc(l)+'</a>';}).join('')+'</div>'+
   '<div class="griglia-cognomi">'+L.map(function(c){return '<a class="cognome" id="c-'+esc(c[0].toUpperCase())+'" href="#/cognome/'+encodeURIComponent(c)+'"><b>'+esc(c)+'</b><span>'+cg[c]+'</span></a>';}).join('')+'</div></section>';
  app.querySelectorAll('.lettere a').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();var t=document.getElementById('c-'+a.dataset.l);if(t)t.scrollIntoView({behavior:'smooth',block:'center'});});});
}
function vistaCognome(c){
  titolo(c); attivaMenu('#/cognomi');
  var L=IDS.filter(function(id){return (P[id].cognome||'(senza cognome)')===c;}).sort(ordina);
  app.innerHTML='<div class="briciole"><a href="#/cognomi">Cognomi</a> › '+esc(c)+'</div><section class="scheda pad"><h1 class="titolo-sez" style="font-size:26px">'+esc(c)+' <small>'+L.length+' persone, in ordine di nascita</small></h1><ul class="elenco">'+L.map(function(id){return '<li>'+riga(id)+'</li>';}).join('')+'</ul></section>';
}

/* scheda persona */
function vistaPersona(id,tab){
  var p=P[id]; if(!p){app.innerHTML='<p class="vuoto">Persona non trovata.</p>';return;}
  titolo(p.nome); attivaMenu('');
  tab=tab||'dettagli';
  var r=ritrattoFoto(p);
  var h='<div class="briciole"><a href="#/">Inizio</a>'+(p.cognome?' › <a href="#/cognome/'+encodeURIComponent(p.cognome)+'">'+esc(p.cognome)+'</a>':'')+' › '+esc(p.nome)+'</div>'+
   '<section class="scheda"><div class="persona-testa"><span class="ritratto '+(p.sesso||'')+'" '+(p.foto.length?'data-foto="0" title="Vedi le immagini"':'')+'>'+(r?'<img src="'+esc(r.src)+'" alt="">':esc(iniziali(p)))+'</span>'+
   '<div><h1>'+esc(p.nome)+'</h1><div class="vita">'+esc(arco(p))+(p.sesso==='M'?' · uomo':p.sesso==='F'?' · donna':'')+(p.detto?' · detto/a «'+esc(p.detto)+'»':'')+'</div><div class="id">Codice scheda '+esc(p.id)+'</div></div><button type="button" class="btn chiaro btn-segnala" data-segnala="'+esc(p.id)+'">✉ Segnala un errore</button></div>'+
   '<nav class="schede-tab">'+tb('dettagli','Dettagli',tab,id)+tb('albero','Albero',tab,id)+tb('discendenti','Discendenti',tab,id)+(nInfo(p)?tb('info','Informazioni ('+nInfo(p)+')',tab,id):'')+(p.foto.length?tb('documenti','Documenti e foto ('+p.foto.length+')',tab,id):'')+'</nav></section>';
  if(tab==='albero') h+='<section class="scheda" style="margin-top:20px"><div class="albero-wrap">'+albero(id)+'</div></section>';
  else if(tab==='discendenti') h+='<section class="scheda pad discendenti" style="margin-top:20px"><h2 class="titolo-sez">Discendenti <small>fino a quattro generazioni</small></h2>'+discendenti(id,0)+'</section>';
  else if(tab==='info') h+=informazioni(p);
  else if(tab==='documenti') h+='<section class="scheda pad" style="margin-top:20px"><h2 class="titolo-sez">Documenti e foto</h2>'+galleria(p)+'</section>';
  else h+=dettagli(p);
  app.innerHTML=h;
  app.querySelectorAll('[data-foto]').forEach(function(el){el.addEventListener('click',function(){apriLB(p,parseInt(el.dataset.foto,10));});});
  window.scrollTo(0,0);
}
function tb(k,t,tab,id){return '<button class="'+(k===tab?'attivo':'')+'" onclick="location.hash=\'#/persona/'+id+(k==='dettagli'?'':'/'+k)+'\'">'+esc(t)+'</button>';}
function dettagli(p){
  var f='<dl class="fatti">';
  f+='<dt>Nascita</dt><dd>'+(p.nascita?esc(p.nascita.testo):'non indicata')+'</dd>';
  if(p.morte||p.defunto) f+='<dt>Morte</dt><dd>'+(p.morte?esc(p.morte.testo):'data non indicata')+'</dd>';
  var e=eta(p); if(e) f+='<dt>Età alla morte</dt><dd>'+esc(e)+'</dd>';
  (p.matrimoni||[]).forEach(function(m){f+='<dt>Matrimonio</dt><dd>'+esc(m)+'</dd>';});
  if(p.professione) f+='<dt>Mestiere</dt><dd>'+esc(p.professione)+'</dd>';
  if(p.detto) f+='<dt>Soprannome</dt><dd>'+esc(p.detto)+'</dd>';
  f+='</dl>';
  var note=p.note?p.note.split(/\n\s*\n/).map(function(n){return '<p class="nota">'+testoNota(n)+'</p>';}).join(''):'';
  var sx='<section class="scheda pad"><h2 class="titolo-sez">Fatti</h2>'+f+'</section>'+
    (nInfo(p)?'<section class="scheda pad rimando-info" style="margin-top:20px"><h2 class="titolo-sez">Informazioni dalle ricerche</h2><p>'+riepInfo(p)+'</p><a class="btn" href="#/persona/'+p.id+'/info">Apri le informazioni</a></section>':'')+
    (p.foto.length?'<section class="scheda pad" style="margin-top:20px"><h2 class="titolo-sez">Documenti e foto <small>'+p.foto.length+'</small></h2>'+galleria(p,4)+'</section>':'');
  var dx='<section class="scheda pad"><h2 class="titolo-sez">Famiglia</h2>';
  // coniugi e figli
  if(p.famiglie.length){
    p.famiglie.forEach(function(fid){
      var fm=F[fid], con=fm.genitori.filter(function(g){return g!==p.id;});
      dx+='<div class="blocco-fam"><h4>Coniuge e figli</h4><ul class="elenco">'+
        '<li>'+riga(p.id)+'</li>'+(con.length?con.map(function(c){return '<li>'+riga(c)+'</li>';}).join(''):'<li class="vuoto">Coniuge non indicato</li>')+'</ul>'+
        (fm.figli.length?'<div class="etichetta" style="padding-left:12px">Figli ('+fm.figli.length+')</div><ul class="elenco figli">'+fm.figli.map(function(c){return '<li>'+riga(c)+'</li>';}).join('')+'</ul>':'')+'</div>';
    });
  }
  // genitori e fratelli
  var orig=[p.genitori].concat(p.altre_famiglie_origine||[]).filter(Boolean);
  if(orig.length){
    orig.forEach(function(fid){
      var fm=F[fid];
      dx+='<div class="blocco-fam"><h4>Genitori e fratelli</h4><ul class="elenco">'+(fm.genitori.length?fm.genitori.map(function(g){return '<li>'+riga(g)+'</li>';}).join(''):'<li class="vuoto">Genitori non indicati</li>')+'</ul>'+
        '<div class="etichetta" style="padding-left:12px">Figli ('+fm.figli.length+')</div><ul class="elenco figli">'+fm.figli.map(function(c){return '<li>'+riga(c,c===p.id?'(questa scheda)':'')+'</li>';}).join('')+'</ul></div>';
    });
  }
  if(!p.famiglie.length&&!orig.length) dx+='<p class="vuoto">Nessun legame di parentela registrato.</p>';
  dx+='</section>';
  return '<div class="corpo-persona"><div>'+sx+'</div><div>'+dx+'</div></div>';
}
function nInfo(p){return (p.fonti||[]).length+(p.verifiche||[]).length+(p.note?p.note.split(/\n\s*\n/).length:0);}
function riepInfo(p){var a=[];if((p.fonti||[]).length)a.push(p.fonti.length+(p.fonti.length===1?' atto o fonte d’archivio':' atti e fonti d’archivio'));if((p.verifiche||[]).length)a.push(p.verifiche.length+(p.verifiche.length===1?' dato da verificare':' dati da verificare'));if(p.note)a.push('note di famiglia');return a.join(' · ');}
function informazioni(p){
  var f='<dl class="fatti">';
  f+='<dt>Nascita</dt><dd>'+(p.nascita?esc(p.nascita.testo):'non indicata')+'</dd>';
  if(p.morte||p.defunto) f+='<dt>Morte</dt><dd>'+(p.morte?esc(p.morte.testo):'data non indicata')+'</dd>';
  var e=eta(p); if(e) f+='<dt>Età alla morte</dt><dd>'+esc(e)+'</dd>';
  (p.matrimoni||[]).forEach(function(m){f+='<dt>Matrimonio</dt><dd>'+esc(m)+'</dd>';});
  if(p.professione) f+='<dt>Mestiere</dt><dd>'+esc(p.professione)+'</dd>';
  if(p.detto) f+='<dt>Soprannome</dt><dd>'+esc(p.detto)+'</dd>';
  f+='</dl>';
  var note=p.note?p.note.split(/\n\s*\n/).map(function(n){return '<p class="nota">'+testoNota(n)+'</p>';}).join(''):'';
  var nAnt=(p.fonti||[]).filter(function(x){return x.link;}).length;
  return '<div class="info-persona">'+
    '<section class="scheda pad" style="margin-top:20px"><h2 class="titolo-sez">In sintesi</h2>'+f+
      '<p class="intro-info">Informazioni raccolte dagli atti di stato civile di Ottone (Portale Antenati), dai registri parrocchiali di Belnome e di Zerba, dalle lapidi e dall’albero GenoPro.'+(nAnt?' '+nAnt+(nAnt===1?' voce rimanda':' voci rimandano')+' al registro originale.':'')+'</p></section>'+
    ((p.fonti||[]).length?'<section class="scheda pad" style="margin-top:20px"><h2 class="titolo-sez">Atti e fonti d’archivio <small>'+p.fonti.length+'</small></h2><ul class="fonti">'+p.fonti.map(voceFonte).join('')+'</ul></section>':'')+
    ((p.verifiche||[]).length?'<section class="scheda pad verifica" style="margin-top:20px"><h2 class="titolo-sez">Da verificare <small>dati che le fonti non confermano</small></h2>'+p.verifiche.map(voceVerifica).join('')+'<p class="vuoto" style="padding:8px 0 0">Se conosci la risposta, <button type="button" class="link-segnala" data-segnala="'+esc(p.id)+'">scrivi una segnalazione</button>.</p></section>':'')+
    (note?'<section class="scheda pad" style="margin-top:20px"><h2 class="titolo-sez">Note di famiglia</h2>'+note+'</section>':'')+
    (p.foto.length?'<section class="scheda pad" style="margin-top:20px"><h2 class="titolo-sez">Documenti e foto <small>'+p.foto.length+'</small></h2>'+galleria(p,6)+'</section>':'')+
  '</div>';
}
var TIPI={nascita:'Atto di nascita',morte:'Atto di morte',matrimonio:'Matrimonio',battesimo:'Battesimo',lapide:'Lapide','albero 2023':'Albero 2023',fonte:'Fonte'};
function apriAntenati(l){return l?'<a class="ant" href="'+esc(l)+'" target="_blank" rel="noopener">Apri il registro su Antenati ↗</a>':'';}
function voceFonte(x){return '<li><span class="tipo t-'+esc(x.tipo.replace(' ','-'))+'">'+esc(TIPI[x.tipo]||x.tipo)+'</span><p>'+testoNota(x.testo)+'</p>'+apriAntenati(x.link)+'</li>';}
function voceVerifica(x){var t=x.testo||'';t=t.charAt(0).toUpperCase()+t.slice(1);return '<div class="voce-verifica"><p>'+testoNota(t)+'</p>'+apriAntenati(x.link)+'</div>';}
function vistaRicerche(q){
  titolo('Ricerche d’archivio'); attivaMenu('#/ricerche');
  var tipo=q.tipo||'', voci=[], ver=[];
  IDS.forEach(function(id){var p=P[id];(p.fonti||[]).forEach(function(x){voci.push({id:id,x:x});});(p.verifiche||[]).forEach(function(x){ver.push({id:id,x:x});});});
  var ord=function(a,b){return ordina(a.id,b.id);}; voci.sort(ord); ver.sort(ord);
  var cnt={}; voci.forEach(function(v){cnt[v.x.tipo]=(cnt[v.x.tipo]||0)+1;});
  var nAnt=voci.filter(function(v){return v.x.link;}).length+ver.filter(function(v){return v.x.link;}).length;
  var docs=0; IDS.forEach(function(id){P[id].foto.forEach(function(f){if(f.tipo!=='foto')docs++;});});
  var sel=tipo==='verificare'?[]:voci.filter(function(v){return !tipo||v.x.tipo===tipo;});
  var chip=function(k,t,n){return '<a class="chip'+(k===tipo?' attivo':'')+'" href="#/ricerche'+(k?'?tipo='+encodeURIComponent(k):'')+'">'+esc(t)+' <span>'+n+'</span></a>';};
  var h='<div class="briciole"><a href="#/">Inizio</a> › Ricerche d’archivio</div>'+
   '<section class="scheda pad"><h1 class="titolo-pag">Ricerche d’archivio</h1><p class="intro-ric">Qui sono raccolti i dati trovati negli atti di stato civile del Comune di Ottone (Portale Antenati), nei registri parrocchiali di Belnome e di Zerba e nelle lapidi. Ogni voce rimanda alla scheda della persona e, quando è possibile, al registro originale su Antenati. I punti «da verificare» sono i casi in cui le fonti e l’albero non coincidono.</p>'+
   (window.REGISTRO&&window.REGISTRO.length?'<p class="rimando-reg"><a class="btn" href="#/registro">Leggi il registro dei battesimi ('+window.REGISTRO.length+' battesimi trascritti)</a></p>':'')+
   '<div class="numeri ric">'+num(Object.keys(voci.reduce(function(o,v){o[v.id]=1;return o;},{})).length,'schede con atti trascritti')+num(nAnt,'collegamenti ai registri su Antenati')+num(docs,'immagini di atti, lapidi e documenti')+num(ver.length,'dati da verificare')+'</div></section>'+
   '<section class="scheda pad" style="margin-top:20px"><div class="chips">'+chip('','Tutte le fonti',voci.length)+['nascita','morte','matrimonio','battesimo','lapide','albero 2023'].filter(function(k){return cnt[k];}).map(function(k){return chip(k,TIPI[k],cnt[k]);}).join('')+chip('verificare','Da verificare',ver.length)+'</div>';
  if(tipo==='verificare') h+='<ul class="fonti elenco-ric">'+ver.map(function(v){return '<li>'+riga(v.id)+voceVerifica(v.x)+'</li>';}).join('')+'</ul>';
  else h+='<ul class="fonti elenco-ric">'+sel.map(function(v){return '<li>'+riga(v.id)+'<span class="tipo t-'+esc(v.x.tipo.replace(' ','-'))+'">'+esc(TIPI[v.x.tipo]||v.x.tipo)+'</span><p>'+testoNota(v.x.testo)+'</p>'+apriAntenati(v.x.link)+'</li>';}).join('')+'</ul>';
  app.innerHTML=h+'</section>';
}
function vistaRegistro(q){
  titolo('Registro dei battesimi della villa di Belnome'); attivaMenu('#/registro');
  var R=window.REGISTRO||[], dec=q.dec||'', t=(q.q||'').toLowerCase();
  var decs={}; R.forEach(function(x){var d=Math.floor(x.y/10)*10; decs[d]=(decs[d]||0)+1;});
  var sel=R.filter(function(x){
    if(dec&&Math.floor(x.y/10)*10!==+dec) return false;
    if(t){var s=(x.nome+' '+x.padre+' '+x.madre+' '+(x.padrini||[]).join(' ')).toLowerCase(); if(s.indexOf(t)<0) return false;}
    return true;});
  var nCol=R.filter(function(x){return x.id&&P[x.id];}).length, nFoto=R.filter(function(x){return x.foto;}).length;
  var chip=function(k,tx,n){return '<a class="chip'+(String(k)===String(dec)?' attivo':'')+'" href="#/registro'+(k?'?dec='+k:'')+'">'+esc(tx)+' <span>'+n+'</span></a>';};
  var h='<div class="briciole"><a href="#/">Inizio</a> › <a href="#/ricerche">Fonti</a> › Registro dei battesimi</div>'+
   '<section class="scheda pad"><h1 class="titolo-pag">Registro dei battesimi della villa di Belnome</h1>'+
   '<p class="intro-ric">Trascrizione dei battesimi della villa di Belnome dal registro parrocchiale («Registrus villae Belnominis»), scritto in latino dai cappellani della villa e dai rettori della parrocchia. Sono riportati i battesimi dei bambini della villa di Belnome, riletti sulle fotografie del registro (le altre famiglie della parrocchia di Zerba non sono trascritte): data, nome, genitori e padrini come li ha scritti il sacerdote, con i nomi resi in italiano. Le letture incerte sono segnalate. Quando il bambino è nell’albero il nome porta alla sua scheda.</p>'+
   '<div class="numeri ric">'+num(R.length,'battesimi trascritti')+num(nCol,'collegati a una scheda')+num(nFoto,'con la pagina del registro indicata')+num(R.length?R[0].y+'–'+R[R.length-1].y:'','anni coperti')+'</div></section>'+
   '<section class="scheda pad" style="margin-top:20px"><form class="filtro-reg" onsubmit="event.preventDefault();location.hash=\'#/registro?\'+(\''+(dec?'dec='+dec+'&':'')+'\')+\'q=\'+encodeURIComponent(this.q.value)"><input name="q" type="search" placeholder="Cerca un nome, un genitore o un padrino…" value="'+esc(q.q||'')+'"><button class="btn" type="submit">Cerca</button></form>'+
   '<div class="chips">'+chip('','Tutti gli anni',R.length)+Object.keys(decs).sort().map(function(d){return chip(d,d+'–'+(+d+9),decs[d]);}).join('')+'</div>';
  if(!sel.length) h+='<p class="vuoto">Nessun battesimo corrisponde alla ricerca.</p>';
  var anno=null;
  h+='<div class="registro">';
  sel.forEach(function(x){
    if(x.y!==anno){anno=x.y; h+='<h3 class="anno-reg">'+anno+'</h3>';}
    var nome=x.id&&P[x.id]?'<a href="#/persona/'+x.id+'/info">'+esc(x.nome)+'</a>':esc(x.nome);
    h+='<article class="batt"><div class="batt-data">'+esc(x.data)+'</div><div class="batt-corpo"><h4>'+nome+'</h4>'+
      '<p><span class="lab">Genitori</span> '+esc([x.padre,x.madre].filter(Boolean).join(' e ')||'non indicati')+'</p>'+
      ((x.padrini||[]).length?'<p><span class="lab">Padrini</span> '+esc(x.padrini.join(' e '))+'</p>':'')+
      '<p class="batt-rif">'+(x.pagina?'Registro, foto '+esc(x.pagina):'Pagina non indicata nella trascrizione')+
      (x.foto_src?' · <button type="button" class="link-segnala" data-pag="'+esc(x.foto_src)+'" data-tit="'+esc('Registro, foto '+x.pagina)+'">vedi la pagina</button>':'')+
      (x.id&&P[x.id]?'':' · <span class="non-coll">non ancora collegato a una scheda</span>')+'</p>'+(x.nota?'<p class="batt-rif">'+esc(x.nota.charAt(0).toUpperCase()+x.nota.slice(1))+'</p>':'')+'</div></article>';
  });
  h+='</div></section>';
  app.innerHTML=h;
  app.querySelectorAll('[data-pag]').forEach(function(b){b.addEventListener('click',function(){apriLB({foto:[{src:b.dataset.pag,titolo:b.dataset.tit,tipo:'registro dei battesimi'}]},0);});});
}
function galleria(p,max){
  var L=p.foto.slice(0,max||p.foto.length);
  return '<div class="galleria">'+L.map(function(f,i){return '<button data-foto="'+i+'"><img loading="lazy" src="'+esc(f.src)+'" alt="'+esc(f.titolo)+'"><span>'+esc(f.titolo)+'</span></button>';}).join('')+'</div>'+
   (max&&p.foto.length>max?'<p style="margin:10px 0 0"><a href="#/persona/'+p.id+'/documenti">Vedi tutte le '+p.foto.length+' immagini ›</a></p>':'');
}
function albero(id){
  // quattro generazioni: colonna 0 la persona, poi genitori, nonni, bisnonni
  var cols=[[id]];
  for(var g=1;g<4;g++){var prev=cols[g-1],cur=[];prev.forEach(function(x){var pm=x?padreMadre(x):[null,null];cur.push(pm[0],pm[1]);});cols.push(cur);}
  var etich=['','Genitori','Nonni','Bisnonni'], h='<div class="albero">';
  cols.forEach(function(col,c){
    var span=8/col.length;
    col.forEach(function(x,i){
      var stile='grid-column:'+(c+1)+';grid-row:'+(i*span+1)+' / span '+span;
      if(x){var q=P[x];h+='<a class="nodo c'+c+' '+(q.sesso||'')+(c===0?' radice':'')+'" style="'+stile+'" href="#/persona/'+x+'/albero"><b>'+esc(q.nome)+'</b><span>'+esc(arco(q))+'</span></a>';}
      else h+='<span class="nodo ignoto c'+c+'" style="'+stile+'"><b>'+(c?(i%2?'Madre':'Padre')+' non indicato':'')+'</b></span>';
    });
  });
  return h+'</div><p class="vuoto" style="margin-top:10px">Clicca su una persona per vedere il suo albero; i dati completi sono nella scheda «Dettagli».</p>';
}
function discendenti(id,liv){
  var p=P[id]; if(!p.famiglie.length) return liv?'':'<p class="vuoto">Nessun figlio registrato.</p>';
  var h='<ul>';
  p.famiglie.forEach(function(fid){
    var fm=F[fid], con=fm.genitori.filter(function(g){return g!==id;});
    h+='<li><span class="coppia">con '+(con.length?con.map(link).join(', '):'coniuge non indicato')+'</span>';
    if(fm.figli.length){
      h+='<ul>'+fm.figli.map(function(c){
        var q=P[c], sotto=liv<3?discendenti(c,liv+1):'';
        var t='<a href="#/persona/'+c+'">'+esc(q.nome)+'</a> <span class="coppia">'+esc(arco(q))+'</span>';
        return '<li>'+(sotto?'<details'+(liv<1?' open':'')+'><summary>'+t+'</summary>'+sotto+'</details>':'<span style="padding-left:14px">'+t+'</span>')+'</li>';
      }).join('')+'</ul>';
    }
    h+='</li>';
  });
  return h+'</ul>';
}

/* lightbox */
var LB=document.getElementById('lightbox'), lbP=null, lbI=0;
function apriLB(p,i){lbP=p;lbI=i;mostraLB();LB.hidden=false;document.body.style.overflow='hidden';}
function mostraLB(){var f=lbP.foto[lbI];LB.querySelector('img').src=f.src;LB.querySelector('img').alt=f.titolo;LB.querySelector('figcaption').textContent=(f.tipo?f.tipo.charAt(0).toUpperCase()+f.tipo.slice(1)+': ':'')+f.titolo+' ('+(lbI+1)+' di '+lbP.foto.length+')';
  LB.querySelector('.lb-prec').style.visibility=lbP.foto.length>1?'visible':'hidden';LB.querySelector('.lb-succ').style.visibility=lbP.foto.length>1?'visible':'hidden';}
function chiudiLB(){LB.hidden=true;document.body.style.overflow='';}
LB.querySelector('.lb-chiudi').onclick=chiudiLB;
LB.querySelector('.lb-prec').onclick=function(){lbI=(lbI-1+lbP.foto.length)%lbP.foto.length;mostraLB();};
LB.querySelector('.lb-succ').onclick=function(){lbI=(lbI+1)%lbP.foto.length;mostraLB();};
LB.addEventListener('click',function(e){if(e.target===LB)chiudiLB();});
document.addEventListener('keydown',function(e){if(LB.hidden)return;if(e.key==='Escape')chiudiLB();if(e.key==='ArrowLeft')LB.querySelector('.lb-prec').click();if(e.key==='ArrowRight')LB.querySelector('.lb-succ').click();});

/* segnalazioni via email */
var EMAIL='mauro.almangano@gmail.com', SEG=document.getElementById('segnala'), segId='';
function apriSegnala(id){
  segId=id||''; var p=P[segId];
  document.getElementById('segChi').innerHTML=p?'Scheda: <b>'+esc(p.nome)+'</b> ('+esc(arco(p))+') · codice '+esc(p.id):'Segnalazione generale sull’albero.';
  SEG.hidden=false; document.body.style.overflow='hidden'; setTimeout(function(){document.getElementById('segTesto').focus();},30);
}
function chiudiSegnala(){SEG.hidden=true;document.body.style.overflow='';}
document.addEventListener('click',function(e){var b=e.target.closest('[data-segnala]'); if(b){e.preventDefault();apriSegnala(b.getAttribute('data-segnala'));}});
SEG.querySelector('.modale-chiudi').onclick=chiudiSegnala;
SEG.querySelector('.modale-annulla').onclick=chiudiSegnala;
SEG.addEventListener('click',function(e){if(e.target===SEG)chiudiSegnala();});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!SEG.hidden)chiudiSegnala();});
document.getElementById('segForm').addEventListener('submit',function(e){
  e.preventDefault();
  var p=P[segId], tipo=document.getElementById('segTipo').value, testo=document.getElementById('segTesto').value.trim(),
      fonte=document.getElementById('segFonte').value.trim(), nome=document.getElementById('segNome').value.trim();
  var url=location.href.split('#')[0]+(segId?'#/persona/'+segId:'');
  var ogg='Albero di Belnome - segnalazione'+(p?': '+p.nome+' ('+p.id+')':'');
  var corpo=['Tipo di segnalazione: '+tipo,
    p?'Persona: '+p.nome+' ('+arco(p)+'), codice scheda '+p.id:'Segnalazione generale',
    p?'Pagina: '+url:'',
    '', 'Descrizione:', testo, '',
    fonte?'Fonte: '+fonte:'', nome?'Inviata da: '+nome:''].filter(function(r,i,arr){return r!==''||(arr[i-1]!=='');}).join('\n');
  window.location.href='mailto:'+EMAIL+'?subject='+encodeURIComponent(ogg)+'&body='+encodeURIComponent(corpo);
  setTimeout(function(){chiudiSegnala();document.getElementById('segTesto').value='';},400);
});

/* ricerca rapida */
document.getElementById('cercaRapida').addEventListener('submit',function(e){e.preventDefault();var v=document.getElementById('qRapida').value.trim();location.hash='#/cerca?nome='+encodeURIComponent(v);});

/* router */
function route(){
  var h=location.hash||'#/', m;
  if(!LB.hidden)chiudiLB();
  if((m=h.match(/^#\/persona\/(ind\d+)(?:\/(\w+))?/))) return vistaPersona(m[1],m[2]);
  if((m=h.match(/^#\/cognome\/(.+)$/))) return vistaCognome(decodeURIComponent(m[1]));
  if(h.indexOf('#/cognomi')===0) return vistaCognomi();
  if(h.indexOf('#/registro')===0){var g={};new URLSearchParams(h.split('?')[1]||'').forEach(function(v,k){g[k]=v;});return vistaRegistro(g);}
  if(h.indexOf('#/ricerche')===0){var r={};new URLSearchParams(h.split('?')[1]||'').forEach(function(v,k){r[k]=v;});return vistaRicerche(r);}
  if(h.indexOf('#/cerca')===0){var q={};new URLSearchParams(h.split('?')[1]||'').forEach(function(v,k){q[k]=v;});return vistaCerca(q);}
  vistaHome();
}
window.addEventListener('hashchange',function(){route();window.scrollTo(0,0);});
route();
})();
