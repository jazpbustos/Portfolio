'use strict';
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const hover = matchMedia('(hover:hover) and (pointer:fine)');
const gymFrames = [
 ['assets/milenium-01-login.webp','Ingreso al sistema'],
 ['assets/milenium-02-socios-demo.webp','Gestión de socios'],
 ['assets/milenium-03-nuevo-socio.webp','Alta de un socio'],
 ['assets/milenium-04-detalle-socio-demo.webp','Ficha y cuotas'],
 ['assets/milenium-06-movimientos-demo.webp','Historial de pagos'],
 ['assets/milenium-backup.png','Estadísticas y copia de seguridad']
];
const players = [];
function makePlayer(host, type, onChange = () => {}) {
 const layer = document.createElement('span');
 layer.className = 'walkthrough-layer' + (type === 'web' ? ' web-scroll-layer' : '');
 layer.setAttribute('aria-hidden','true');
 const frames = type === 'web' ? [['assets/solana-portada-correcta.jpg','Inicio'],['assets/solana-sobre-recorrido.jpg','Sobre la profesional'],['assets/solana-servicios-correcto.png','Servicios'],['assets/solana-contacto-recorrido.jpg','Contacto']] : gymFrames;
 const strip = type === 'web' ? document.createElement('span') : layer;
 if(type==='web'){strip.className='web-strip';layer.append(strip)}
 const images = frames.map(([src]) => {const img = new Image();img.src=src;img.alt='';img.decoding='async';strip.append(img);return img});
 host.append(layer);
 let timer=0, animation=null, index=0, running=false, generation=0;
 function show(i){index=i;images.forEach((img,j)=>img.classList.toggle('is-current',i===j));onChange(frames[i][1]);}
 show(0);
 function stop(){running=false;generation++;clearTimeout(timer);animation?.cancel();animation=null;layer.classList.remove('is-playing');show(0);}
 async function play(){
  stop();running=true;const token=generation;layer.classList.add('is-playing');
  if(type==='web'){
   try{await Promise.all(images.map(img=>img.decode()))}catch{return}
   if(!running||token!==generation)return;
   const travel=Math.max(0,strip.offsetHeight-layer.clientHeight);
   animation=strip.animate([{transform:'translateY(0)',offset:0},{transform:'translateY(0)',offset:.08},{transform:`translateY(-${travel}px)`,offset:.94},{transform:`translateY(-${travel}px)`,offset:1}],{duration:12000,iterations:Infinity,easing:'linear'});
   onChange('Inicio → presentación → servicios → contacto');
  }else{
   function advance(){if(!running)return;show((index+1)%frames.length);timer=setTimeout(advance,1700)}
   timer=setTimeout(advance,1500);
  }
 }
 const player={play,stop,host};players.push(player);return player;
}
document.querySelectorAll('.small-project').forEach(article => {
 const scene=article.querySelector('.small-cover');
 const isGym=scene.classList.contains('gym-cover');
 const host=scene.querySelector(isGym?'.monitor-screen':'.laptop-screen');
 const button=article.querySelector('.demo-play');
 const status=article.querySelector('.demo-status');
 let pinned=false;
 const player=makePlayer(host,isGym?'gym':'web',text=>status.textContent=text);
 function reset(){pinned=false;player.stop();button.setAttribute('aria-pressed','false');button.innerHTML='Reproducir recorrido <span aria-hidden="true">▷</span>';status.textContent='Pasá el mouse sobre la imagen';}
 scene.addEventListener('pointerenter',()=>{if(hover.matches&&!reduced.matches&&!pinned)player.play()});
 scene.addEventListener('pointerleave',()=>{if(!pinned)player.stop()});
 scene.addEventListener('focus',()=>{if(!reduced.matches&&!pinned)player.play()});
 scene.addEventListener('blur',()=>{if(!pinned)player.stop()});
 button.addEventListener('click',()=>{if(pinned){reset();return}pinned=true;button.setAttribute('aria-pressed','true');button.innerHTML='Detener recorrido <span aria-hidden="true">Ⅱ</span>';player.play()});
 if('IntersectionObserver'in window)new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)reset()},{threshold:0}).observe(scene);
});
const filmWindow=document.querySelector('.film-window');
const filmButton=document.querySelector('.film-play');
const filmCaption=document.querySelector('.film-caption');
const filmDetail=document.querySelector('.film-detail');
let filmPlayer=null,filmPlaying=false;
function selectFilm(type){
 filmPlayer?.stop();filmWindow.replaceChildren();filmPlaying=false;
 filmButton.textContent='Reproducir recorrido ▷';filmButton.setAttribute('aria-pressed','false');
 filmWindow.classList.toggle('is-web',type==='web');
 filmPlayer=makePlayer(filmWindow,type,text=>filmCaption.textContent=text);
 filmDetail.href=type==='web'?'proyecto-solana.html':'proyecto-milenium.html';
 document.querySelectorAll('[data-film]').forEach(button=>{const selected=button.dataset.film===type;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1});
 document.getElementById('film-panel').setAttribute('aria-labelledby',type==='web'?'film-tab-web':'film-tab-gym');
}
document.querySelectorAll('[data-film]').forEach(button=>{
 button.addEventListener('click',()=>selectFilm(button.dataset.film));
 button.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();const type=button.dataset.film==='gym'?'web':'gym';selectFilm(type);document.querySelector(`[data-film="${type}"]`).focus()});
});
filmButton.addEventListener('click',()=>{filmPlaying=!filmPlaying;filmButton.setAttribute('aria-pressed',String(filmPlaying));filmButton.textContent=filmPlaying?'Detener recorrido Ⅱ':'Reproducir recorrido ▷';filmPlaying?filmPlayer.play():filmPlayer.stop()});
selectFilm('gym');
document.addEventListener('visibilitychange',()=>{if(document.hidden){players.forEach(p=>p.stop());document.querySelectorAll('[aria-pressed=true]').forEach(b=>b.click())}});
reduced.addEventListener('change',()=>players.forEach(p=>p.stop()));
