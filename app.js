(function(){
  var scenes=[].slice.call(document.querySelectorAll('.scene'));
  var timer=null, loop=true;
  var tiles=document.getElementById('tiles');
  var PHOTOS=[{s:"assets/photos/01.jpg",a:"Pella India office entrance"},{s:"assets/photos/02.jpg",a:"Pella values poster at the India office"},{s:"assets/photos/03.jpg",a:"Team at their desks"},{s:"assets/photos/04.jpg",a:"Team at the Pella India office"},{s:"assets/photos/05.jpg",a:"Team meeting selfie"},{s:"assets/photos/06.jpg",a:"Team with a flower rangoli"},{s:"assets/photos/07.jpg",a:"Team in Pella T-shirts"},{s:"assets/photos/08.jpg",a:"Team pickleball outing"}];
for(var i=0;i<8;i++){var t=document.createElement('div');t.className='tile';
if(PHOTOS[i]){var im=document.createElement('img');im.alt=PHOTOS[i].a;im.src=PHOTOS[i].s;t.appendChild(im);}
else{t.textContent='स्वागत है';t.className+=' hi';}
tiles.appendChild(t);}
var PHOTOS2=[{s:"assets/photos/09.jpg",a:"Team in Pella T-shirts at the office"},{s:"assets/photos/10.jpg",a:"Team at the mirror wall"},{s:"assets/photos/11.jpg",a:"Team painting activity"},{s:"assets/photos/12.jpg",a:"Teammate showing painted coasters"},{s:"assets/photos/13.jpg",a:"Fun moment at the India office"},{s:"assets/photos/14.jpg",a:"Pickleball court"},{s:"assets/photos/15.jpg",a:"Team selfie"},{s:"assets/photos/16.jpg",a:"Team lunch with pizza"}];
var tiles2=document.getElementById('tiles2');
PHOTOS2.forEach(function(p){var t=document.createElement('div');t.className='tile';var im=document.createElement('img');im.alt=p.a;im.src=p.s;t.appendChild(im);tiles2.appendChild(t);});
  function show(i){
    scenes.forEach(function(s,k){s.classList.toggle('on',k===i);});
    var ms=+scenes[i].getAttribute('data-ms');
    timer=setTimeout(function(){ if(i+1<scenes.length) show(i+1); else if(loop) show(0); }, ms);
  }
  function start(){clearTimeout(timer);scenes.forEach(function(s){s.classList.remove('on');});setTimeout(function(){show(0);},60);}
  document.getElementById('replay').onclick=start;
  document.getElementById('full').onclick=function(){
    var el=document.getElementById('stage');
    try{(el.requestFullscreen||el.webkitRequestFullscreen).call(el);}catch(e){}
  };
  document.getElementById('logoIn').onchange=function(e){
    var f=e.target.files[0]; if(!f) return;
    var r=new FileReader();
    r.onload=function(){
      document.querySelectorAll('[data-logo]').forEach(function(img){img.src=r.result;img.parentNode.classList.add('has');});
    };
    r.readAsDataURL(f);
  };
  document.getElementById('photoIn').onchange=function(e){
    var files=[].slice.call(e.target.files).slice(0,8);
    var cells=tiles.children;
    files.forEach(function(f,k){
      var r=new FileReader();
      r.onload=function(){cells[k].textContent='';var im=document.createElement('img');im.alt='Team photo';im.src=r.result;cells[k].appendChild(im);};
      r.readAsDataURL(f);
    });
  };

  /* Indian-classical style ambient loop, synthesised live (no audio files):
     tanpura drone + veena (with meend glides) and bansuri trading phrases in Raga Yaman,
     tabla joining in Teental (16 beats) after a short alap. */
  var Music=(function(){
    var ctx=null,master=null,bus=null,tb=null,on=false,timer=null,closeT=null;
    var t0=0,nextPluck=0,pluckI=0,nextPhrase=0,nextBeat=0,beatI=0,inst=0;
    var SA=146.83;                                   /* D3 */
    var DEG=[15/16,1,9/8,5/4,45/32,3/2,5/3,15/8,2];  /* Ni(low) Sa Re Ga Ma# Pa Dha Ni Sa' */
    var PHRASES=[[0,2,3,2,1,0,1],[1,2,3,4,5],[3,4,5,6,5,4,3,2,1],[5,6,7,8,7,6,5],[4,5,4,3,2,3,1],[0,1,2,3,4,5,4,3],[2,3,4,5,6,7,8],[8,7,6,5,4,3,2,1]];
    /* Teental: Dha Dhin Dhin Dha | Dha Dhin Dhin Dha | Dha Tin Tin Ta | Ta Dhin Dhin Dha */
    var BOLS=['Dha','Dhin','Dhin','Dha','Dha','Dhin','Dhin','Dha','Dha','Tin','Tin','Ta','Ta','Dhin','Dhin','Dha'];
    var BEAT=.72;
    function rnd(a,b){return a+Math.random()*(b-a);}
    function noiseBuf(sec){var n=Math.floor(ctx.sampleRate*sec),b=ctx.createBuffer(1,n,ctx.sampleRate),d=b.getChannelData(0);for(var i=0;i<n;i++)d[i]=Math.random()*2-1;return b;}
    function reverb(){
      var len=Math.floor(ctx.sampleRate*3.4),buf=ctx.createBuffer(2,len,ctx.sampleRate);
      for(var c=0;c<2;c++){var d=buf.getChannelData(c);for(var i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.4);}
      var cv=ctx.createConvolver();cv.buffer=buf;return cv;
    }
    function build(){
      var AC=window.AudioContext||window.webkitAudioContext; if(!AC) return false;
      ctx=new AC(); master=ctx.createGain(); master.gain.value=0;
      var comp=ctx.createDynamicsCompressor(); comp.threshold.value=-18; comp.ratio.value=4;
      var lp=ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=5200;
      bus=ctx.createGain(); tb=ctx.createGain(); tb.gain.value=0;           /* tabla level, faded in later */
      var wet=ctx.createGain(); wet.gain.value=.5; var rv=reverb();
      bus.connect(lp); bus.connect(rv); tb.connect(lp); tb.connect(rv); rv.connect(wet); wet.connect(lp);
      lp.connect(comp); comp.connect(master); master.connect(ctx.destination);
      return true;
    }
    /* tanpura string */
    function pluck(t,f){
      var o=ctx.createOscillator(),o2=ctx.createOscillator(),g=ctx.createGain(),fl=ctx.createBiquadFilter();
      o.type='sawtooth'; o2.type='sine'; o.frequency.value=f; o2.frequency.value=f*2.004;
      fl.type='lowpass'; fl.Q.value=2; fl.frequency.setValueAtTime(2600,t); fl.frequency.exponentialRampToValueAtTime(420,t+3.2);
      g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.13,t+.03); g.gain.exponentialRampToValueAtTime(.0001,t+5.5);
      o.connect(fl); o2.connect(fl); fl.connect(g); g.connect(bus);
      o.start(t); o2.start(t); o.stop(t+5.6); o2.stop(t+5.6);
    }
    /* veena: bright pluck with meend (glide) into the note */
    function veena(t,f0,f1,dur){
      var g=ctx.createGain(),fl=ctx.createBiquadFilter();
      fl.type='lowpass'; fl.Q.value=1.5; fl.frequency.setValueAtTime(4200,t); fl.frequency.exponentialRampToValueAtTime(650,t+dur+.6);
      g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.2,t+.012); g.gain.exponentialRampToValueAtTime(.0001,t+dur+1.4);
      [['sawtooth',0,.5],['triangle',5,.4],['sine',-4,.4]].forEach(function(p){
        var o=ctx.createOscillator(); o.type=p[0]; o.detune.value=p[1];
        o.frequency.setValueAtTime(f0,t); if(f1!==f0) o.frequency.exponentialRampToValueAtTime(f1,t+.14);
        var og=ctx.createGain(); og.gain.value=p[2]; o.connect(og); og.connect(fl);
        o.start(t); o.stop(t+dur+1.5);
      });
      fl.connect(g); g.connect(bus);
    }
    /* bansuri: breathy flute with slow vibrato */
    function bansuri(t,f0,f1,dur){
      var o=ctx.createOscillator(),o2=ctx.createOscillator(),lfo=ctx.createOscillator(),lg=ctx.createGain(),g=ctx.createGain(),m=ctx.createGain();
      o.type='sine'; o2.type='triangle'; m.gain.value=.4;
      [o,o2].forEach(function(x){x.frequency.setValueAtTime(f0,t); if(f1!==f0) x.frequency.exponentialRampToValueAtTime(f1,t+.18);});
      lfo.frequency.value=5.2; lg.gain.value=f1*.007; lfo.connect(lg); lg.connect(o.frequency); lg.connect(o2.frequency);
      var br=ctx.createBufferSource(); br.buffer=noiseBuf(dur+1.2); var bf=ctx.createBiquadFilter(); bf.type='bandpass'; bf.frequency.value=f1*2; bf.Q.value=3;
      var bg=ctx.createGain(); bg.gain.value=.035; br.connect(bf); bf.connect(bg); bg.connect(g);
      g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(.12,t+.3); g.gain.setValueAtTime(.12,t+dur-.1); g.gain.exponentialRampToValueAtTime(.0001,t+dur+.8);
      o.connect(g); o2.connect(m); m.connect(g); g.connect(bus);
      o.start(t); o2.start(t); lfo.start(t); br.start(t); [o,o2,lfo,br].forEach(function(x){x.stop(t+dur+1);});
    }
    /* tabla voices */
    function dayan(t,v,ring){
      var g=ctx.createGain(); g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.0001,t+ring);
      [[1,1],[2,.5],[3,.28]].forEach(function(h){var o=ctx.createOscillator(); o.frequency.value=SA*2*h[0]; var x=ctx.createGain(); x.gain.value=h[1]; o.connect(x); x.connect(g); o.start(t); o.stop(t+ring+.05);});
      var n=ctx.createBufferSource(); n.buffer=noiseBuf(.08); var f=ctx.createBiquadFilter(); f.type='bandpass'; f.frequency.value=3000; f.Q.value=1.2;
      var ng=ctx.createGain(); ng.gain.setValueAtTime(v*.8,t); ng.gain.exponentialRampToValueAtTime(.0001,t+.05); n.connect(f); f.connect(ng); ng.connect(tb); n.start(t); n.stop(t+.08);
      g.connect(tb);
    }
    function bayan(t,v,ring){
      var o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine';
      o.frequency.setValueAtTime(190,t); o.frequency.exponentialRampToValueAtTime(82,t+.28);
      g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.0001,t+ring); o.connect(g); g.connect(tb); o.start(t); o.stop(t+ring+.05);
    }
    function bol(t,b){
      if(b==='Dha'){dayan(t,.55,.35);bayan(t,.9,.55);}
      else if(b==='Dhin'){dayan(t,.45,.5);bayan(t,.75,.7);}
      else if(b==='Tin'){dayan(t,.6,.4);}
      else {dayan(t,.45,.18);}
    }
    function phrase(t,which){
      var p=PHRASES[Math.floor(Math.random()*PHRASES.length)],prev=0,base=SA*(which?4:2);
      for(var k=0;k<p.length;k++){
        var last=k===p.length-1,f=base*DEG[p[k]],dur=last?rnd(2.2,3.2):rnd(.55,1.1);
        (which?bansuri:veena)(t,prev?prev:f,f,dur); prev=f; t+=dur*(last?.95:.82);
      }
      return t;
    }
    function tick(){
      if(!on) return; var now=ctx.currentTime,horizon=now+3;
      var strings=[SA*.75,SA,SA,SA*.5];
      while(nextPluck<horizon){ if(nextPluck<now) nextPluck=now+.05;
        pluck(nextPluck,strings[pluckI%4]); pluckI++; nextPluck+=(pluckI%4===0)?1.7:1.1; }
      if(nextPhrase<horizon){ if(nextPhrase<now) nextPhrase=now+.4;
        nextPhrase=phrase(nextPhrase,inst)+rnd(1,2.2); inst=1-inst; }
      while(nextBeat<horizon){ if(nextBeat<now) nextBeat=now+.05;
        if(beatI===0) tb.gain.linearRampToValueAtTime(.8,nextBeat+4);
        bol(nextBeat,BOLS[beatI%16]); if(Math.random()<.3) bayan(nextBeat+BEAT/2,.28,.25);
        beatI++; nextBeat+=BEAT; }
    }
    return {
      start:function(){
        if(closeT){clearTimeout(closeT);closeT=null;}
        if(on) return true;
        if(!build()) return false;
        if(ctx.state==='suspended') ctx.resume();
        on=true; t0=ctx.currentTime; nextPluck=t0+.3; nextPhrase=t0+2.5; nextBeat=t0+14; pluckI=0; beatI=0; inst=0;
        master.gain.linearRampToValueAtTime(.9,t0+3);
        tick(); timer=setInterval(tick,700); return true;
      },
      stop:function(){
        if(!on) return; on=false; clearInterval(timer); var c=ctx;
        master.gain.cancelScheduledValues(c.currentTime); master.gain.setValueAtTime(master.gain.value,c.currentTime); master.gain.linearRampToValueAtTime(0,c.currentTime+1);
        closeT=setTimeout(function(){try{c.close();}catch(e){}},1300);
      },
      isOn:function(){return on;}
    };
  })();
  /* Background music: Raag Yaman on bansuri (Becoming Music), first 10 minutes, looped with soft fades;
     the built-in synthesised raga is kept as an alternative source. */
  var source='file', playing=false, musicMuted=false, firstDone=false;
  var musicBtn=document.getElementById('music'), srcBtn=document.getElementById('msrc'), aud=document.getElementById('bgm');
  aud.loop=true; aud.volume=0;
  /* The recording is optional: if assets/music.mp3 is not hosted, fall back to the built-in raga. */
  fetch('assets/music.mp3',{method:'HEAD'}).then(function(r){ if(!r.ok) throw 0; aud.src='assets/music.mp3'; })
    .catch(function(){ source='synth'; srcBtn.hidden=true; paint(); });

  function fade(){ /* soft in at the start, soft out before the loop point */
    var d=aud.duration, t=aud.currentTime, v=.85;
    if(d&&isFinite(d)){ if(t<3) v*=t/3; else if(d-t<3) v*=Math.max(0,(d-t)/3); }
    aud.volume=Math.max(0,Math.min(1,v));
  }
  aud.addEventListener('timeupdate',fade);
  function play(){
    playing=true;
    if(source==='file'){ var p=aud.play(); if(p&&p.catch) p.catch(function(){playing=false;paint();}); } else Music.start();
    paint();
  }
  function pause(){ playing=false; aud.pause(); Music.stop(); paint(); }
  function paint(){
    musicBtn.setAttribute('aria-pressed',playing?'true':'false');
    musicBtn.textContent=playing?'♪ Music: on':'♪ Music: off';
    srcBtn.textContent='Source: '+(source==='file'?'Raag Yaman (bansuri)':'Built-in raga');
  }
  musicBtn.onclick=function(){ if(playing){musicMuted=true;pause();} else {musicMuted=false;play();} };
  srcBtn.onclick=function(){ var was=playing; pause(); source=source==='file'?'synth':'file'; if(was){musicMuted=false;play();} else paint(); };
  /* Browsers block sound until the first tap/click, so start on the first interaction. */
  var EV=['pointerdown','keydown','touchstart'];
  function firstGesture(){ firstDone=true; if(!musicMuted&&!playing) play(); EV.forEach(function(e){document.removeEventListener(e,firstGesture,true);}); }
  EV.forEach(function(e){document.addEventListener(e,firstGesture,true);});
  document.addEventListener('visibilitychange',function(){ if(source!=='synth'||!firstDone||musicMuted) return;
    if(document.hidden&&playing){Music.stop();} else if(!document.hidden&&playing){Music.start();} });
  paint();
  /* Keep the screen awake while the slideshow is open so the PC doesn't dim, lock or stop the music. */
  var wake=null;
  function keepAwake(){
    try{ if(navigator.wakeLock&&!document.hidden){ navigator.wakeLock.request('screen').then(function(l){ wake=l; l.addEventListener('release',function(){wake=null;}); }).catch(function(){}); } }catch(e){}
  }
  document.addEventListener('visibilitychange',function(){ if(!document.hidden&&!wake) keepAwake(); });
  keepAwake();
  ['pointerdown','keydown'].forEach(function(e){document.addEventListener(e,function(){ if(!wake) keepAwake(); },true);});

  /* Fun layer: drifting marigold petals, and a confetti burst wherever you click the stage. */
  (function(){
    var stage=document.getElementById('stage');
    if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var cv=document.createElement('canvas'); cv.className='fx'; stage.appendChild(cv);
    var cx=cv.getContext('2d'),W=0,H=0,dpr=Math.min(window.devicePixelRatio||1,1.5),P=[],last=0;
    function size(){W=stage.clientWidth;H=stage.clientHeight;cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0);}
    size(); window.addEventListener('resize',size);
    var PET=['#f5a000','#e8681a','#FFDE00','#d6336c'],CON=['#FFDE00','#e8912d','#138808','#d6336c','#ffffff','#2a7de1'];
    function petal(top){P.push({t:0,x:Math.random()*W,y:top?-10:Math.random()*H,vx:(Math.random()-.4)*14*W/1100,vy:(22+Math.random()*28)*W/1100,r:(4+Math.random()*4)*W/1100,rot:Math.random()*6,vr:(Math.random()-.5)*2,c:PET[Math.floor(Math.random()*4)],ph:Math.random()*6});}
    for(var i=0;i<22;i++) petal(false);
    function burst(x,y){ for(var i=0;i<70;i++){var a=Math.random()*Math.PI*2,v=(120+Math.random()*320)*W/1100;
      P.push({t:1,x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-120*W/1100,r:(4+Math.random()*5)*W/1100,rot:Math.random()*6,vr:(Math.random()-.5)*14,c:CON[Math.floor(Math.random()*CON.length)],life:1.6+Math.random()*.8,age:0});} }
    window.__burst=function(fx,fy){burst(W*fx,H*fy);};
    stage.addEventListener('pointerdown',function(e){var b=stage.getBoundingClientRect();burst((e.clientX-b.left)*W/b.width,(e.clientY-b.top)*H/b.height);});
    function frame(ts){
      requestAnimationFrame(frame); if(document.hidden){last=0;return;}
      var dt=last?Math.min((ts-last)/1000,.05):0; last=ts; cx.clearRect(0,0,W,H);
      for(var i=P.length-1;i>=0;i--){var p=P[i];
        if(p.t===0){p.ph+=dt*1.5;p.x+=(p.vx+Math.sin(p.ph)*18)*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;
          if(p.y>H+12){P.splice(i,1);petal(true);continue;}
          cx.save();cx.translate(p.x,p.y);cx.rotate(p.rot);cx.globalAlpha=.85;cx.fillStyle=p.c;cx.beginPath();cx.ellipse(0,0,p.r*1.7,p.r,0,0,6.283);cx.fill();cx.restore();}
        else{p.age+=dt;p.vy+=520*W/1100*dt;p.vx*=.985;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;
          if(p.age>p.life||p.y>H+20){P.splice(i,1);continue;}
          cx.save();cx.translate(p.x,p.y);cx.rotate(p.rot);cx.globalAlpha=Math.max(0,1-p.age/p.life);cx.fillStyle=p.c;cx.fillRect(-p.r,-p.r/2,p.r*2,p.r);cx.restore();}
      }
    }
    requestAnimationFrame(frame);
  })();

  /* Opening slide extras: bouncing title letters, greetings in different Indian languages, auto confetti. */
  (function(){
    var t=document.getElementById('wti'); if(t){var txt=t.textContent,h='',n=0;
      for(var i=0;i<txt.length;i++){ if(txt[i]===' ') h+=' '; else {h+='<span class="l" aria-hidden="true" style="--i:'+(n++)+'">'+txt[i]+'</span>';} } t.innerHTML=h; }
    var G=[['नमस्ते','Hindi · Namaste'],['నమస్కారం','Telugu · Namaskaram'],['வணக்கம்','Tamil · Vanakkam'],['ನಮಸ್ಕಾರ','Kannada · Namaskara'],['नमस्कार','Marathi · Namaskar'],['নমস্কার','Bengali · Nomoshkar'],['નમસ્તે','Gujarati · Namaste'],['നമസ്കാരം','Malayalam · Namaskaram']];
    var g=document.getElementById('greet'),gl=document.getElementById('greetLang'),gi=0,open0=document.querySelector('.s-open');
    setInterval(function(){ if(document.hidden||!open0.classList.contains('on')) return; gi=(gi+1)%G.length;
      g.style.opacity=0; setTimeout(function(){g.textContent=G[gi][0];gl.textContent=G[gi][1];g.style.opacity=1;},300); },1700);
    new MutationObserver(function(){ if(!open0.classList.contains('on')){gi=0;g.textContent=G[0][0];gl.textContent=G[0][1];g.style.opacity=1;} })
      .observe(open0,{attributes:true,attributeFilter:['class']});
    var scs=document.querySelectorAll('.scene'),first=scs[0],lastS=scs[scs.length-1];
    [first,lastS].forEach(function(sc){ new MutationObserver(function(){ if(sc.classList.contains('on'))
      setTimeout(function(){ if(sc.classList.contains('on')&&window.__burst){ window.__burst(.22,.5); window.__burst(.78,.5); } }, sc===first?2400:1400); })
      .observe(sc,{attributes:true,attributeFilter:['class']}); });
  })();
  start();
})();
