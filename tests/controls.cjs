const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {webcrypto}=require('node:crypto');
const source=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
function app({query='',stored=null,blocked=false,clipboardBlocked=false,values={}}={}){
  const nodes=new Map(), timers=new Map(), intervals=new Map(), storage=new Map(Object.entries(values)), calls=[];
  if(stored) storage.set('msrchl:remote',stored);
  let next=0;
  function node(){
    const classes=new Set();
    return {value:'',textContent:'',children:[],style:{},hidden:false,
      classList:{add:(...v)=>v.forEach(x=>classes.add(x)),remove:(...v)=>v.forEach(x=>classes.delete(x)),
        contains:x=>classes.has(x),toggle:(x,on)=>{if(on??!classes.has(x))classes.add(x);else classes.delete(x);}},
      append(...items){this.children.push(...items);},appendChild(item){this.children.push(item);},
      replaceChildren(){this.children=[];},setAttribute(){},focus(){},select(){},setSelectionRange(){},setPointerCapture(){}};
  }
  const get=selector=>{if(!nodes.has(selector))nodes.set(selector,node());return nodes.get(selector);};
  const context=vm.createContext({URL,URLSearchParams,Uint8Array,crypto:webcrypto,console,
    location:{href:'https://example.test/'+query,search:query,pathname:'/',origin:'https://example.test'},
    history:{replaceState:(_a,_b,url)=>calls.push(['url',url])},
    document:{querySelector:get,querySelectorAll:()=>[],createElement:node,body:node(),addEventListener(){}},
    localStorage:{getItem:key=>{if(blocked)throw Error();return storage.get(key)||null;},
      setItem:(key,value)=>{if(blocked)throw Error();storage.set(key,value);},
      removeItem:key=>{if(blocked)throw Error();storage.delete(key);}},
    navigator:{clipboard:{writeText:async value=>{if(clipboardBlocked)throw Error('denied');calls.push(['copy',value]);}}},
    setTimeout:(fn,ms)=>{timers.set(++next,{fn,ms});return next;},clearTimeout:id=>timers.delete(id),
    setInterval:(fn,ms)=>{intervals.set(++next,{fn,ms});return next;},clearInterval:id=>intervals.delete(id),addEventListener(){},
    fetch:()=>new Promise(()=>{}),window:{},EventSource:class{constructor(url){calls.push(['listen',url]);}close(){calls.push(['close']);}}
  });
  vm.runInContext(source,context);
  return {get,calls,storage,intervals,context,run:code=>vm.runInContext(code,context),
    fire(ms){const entries=[...timers];for(const [id,t] of entries)if(t.ms===ms){timers.delete(id);t.fn();}}};
}
function playing(a){
  a.context.seekCalls=[]; a.context.rates=[];
  a.run(`playerReady=true; ticker=1; pending={id:'video'}; endAt=123456; paused=false; winding=false;
    player={getDuration:()=>120,getCurrentTime:()=>45,getPlayerState:()=>1,
      getPlaybackRate:()=>1,getAvailablePlaybackRates:()=>[1,1.5,2],setPlaybackRate:r=>rates.push(r),
      seekTo:t=>seekCalls.push(t),pauseVideo:()=>seekCalls.push('pause')};`);
}
const pointer={isPrimary:true,button:0,pointerId:1,clientX:10,clientY:10};
test('new device is unpaired and command links stay hidden',()=>{
  const a=app();assert.equal(a.run('remoteTopic'),null);assert.equal(a.get('#remoteLinks').hidden,true);
});
test('generation uses a 192-bit topic, persists, and offers eight private commands',()=>{
  const a=app();a.get('#remoteGenerate').onclick();
  assert.match(a.run('remoteTopic'),/^msrchl-[a-f0-9]{48}$/);
  assert.equal(a.storage.get('msrchl:remote'),a.run('remoteTopic'));
  assert.equal(a.get('#remoteCommands').children.length,8);
  assert.equal(a.get('#remoteInput').type,'password');
  assert.ok(!a.calls.some(c=>c[0]==='listen'));
});
test('setup URL imports a topic, strips it immediately, and excludes it from shared filters',()=>{
  const a=app({query:'?remote=test-topic&debug=1'});
  assert.equal(a.run('remoteTopic'),'test-topic');assert.equal(a.calls[0][1],'/?debug=1');
  assert.equal(a.run("Q.has('remote')"),false);
  assert.equal(a.run("filterParams(new URLSearchParams('?remote=test-topic')).has('remote')"),false);
});
test('invalid imported topic leaves the existing one and reports the problem',()=>{
  const a=app({query:'?remote=bad%2Ftopic',stored:'previous-topic'});
  assert.equal(a.run('remoteTopic'),'previous-topic');assert.match(a.get('#remoteNote').textContent,/Invalid/);
});
test('remote off clears stored pairing even when storage is inaccessible',()=>{
  const a=app({query:'?remote=off',stored:'previous-topic'});assert.equal(a.run('remoteTopic'),null);assert.equal(a.storage.size,0);
  const b=app({query:'?remote=off',blocked:true});assert.equal(b.run('remoteTopic'),null);
});
test('storage failure is visible, generation remains usable for this visit',()=>{
  const a=app({blocked:true});a.get('#remoteGenerate').onclick();
  assert.match(a.get('#remoteStatus').textContent,/visit only/);assert.match(a.get('#remoteNote').textContent,/Storage is unavailable/);
});
test('forget disconnects the old listener and removes command links',()=>{
  const a=app({stored:'test-topic'});a.run('listenRemote()');a.get('#remoteForget').onclick();
  assert.equal(a.run('remoteTopic'),null);assert.ok(a.calls.some(c=>c[0]==='close'));assert.equal(a.get('#remoteCommands').children.length,0);
});
test('seeking clamps, preserves session deadline, saves position, and preserves pause',()=>{
  const a=app();playing(a);a.run('skipVideo(30)');assert.equal(a.context.seekCalls[0],75);assert.equal(a.run('endAt'),123456);
  assert.equal(a.storage.get('msrchl:pos:video'),'75');
  a.run('paused=true;skipVideo(-100)');assert.deepEqual(a.context.seekCalls.slice(-2),[0,'pause']);
  a.run('paused=false;skipVideo(1000)');assert.equal(a.context.seekCalls.at(-1),119.75);
});
test('seek is ignored during wind-down, before playback, or without duration',()=>{
  const a=app();playing(a);a.run('winding=true;skipVideo(30);winding=false;ticker=null;skipVideo(30);ticker=1;player.getDuration=()=>0;skipVideo(30)');
  assert.equal(a.context.seekCalls.length,0);
});
test('remote fwd and back dispatch to seeking; malformed and unknown commands do nothing',()=>{
  const a=app();playing(a);
  for(const cmd of ['fwd','back'])a.run('receiveRemote('+JSON.stringify(JSON.stringify({message:cmd}))+')');
  assert.deepEqual(a.context.seekCalls,[75,65]);
  a.run(`receiveRemote('invalid');receiveRemote('{"message":23}');receiveRemote('{"message":"unknown"}')`);
  assert.equal(a.context.seekCalls.length,2);
});
function tap(c){ c.onpointerdown(pointer);c.onpointerup(pointer);c.onclick({preventDefault(){}}); }
test('hold temporarily plays at 2x, restores the previous rate, and suppresses release click',()=>{
  const a=app();playing(a);const c=a.get('#cTL');
  a.run('player.getPlaybackRate=()=>1.5');
  c.onpointerdown(pointer);a.fire(500);assert.deepEqual(a.context.rates,[2]);assert.equal(a.context.seekCalls.length,0);
  c.onpointerup(pointer);let prevented=false;c.onclick({preventDefault(){prevented=true;}});
  assert.deepEqual(a.context.rates,[2,1.5]);assert.equal(prevented,true);assert.equal(a.run('tlTaps'),0);
  assert.equal(a.run('endAt'),123456);
});
test('movement, cancellation and lost capture restore normal speed',()=>{
  for(const stop of ['move','cancel','capture']){
    const a=app();playing(a);const c=a.get('#cTL');c.onpointerdown(pointer);a.fire(500);
    if(stop==='move') c.onpointermove({...pointer,clientX:40});
    else if(stop==='cancel')c.onpointercancel();else c.onlostpointercapture();
    assert.deepEqual(a.context.rates,[2,1]);
  }
});
test('paused, winding or unsupported players never enter fast-forward',()=>{
  for(const state of ['paused=true','winding=true','player.getAvailablePlaybackRates=()=>[1]']){
    const a=app();playing(a);a.run(state);const c=a.get('#cTL');c.onpointerdown(pointer);a.fire(500);c.onpointerup(pointer);
    assert.equal(a.context.rates.length,0);assert.equal(a.context.seekCalls.length,0);
  }
});
test('double tap skips one minute, single tap does nothing, triple tap only shows guide',()=>{
  const a=app();playing(a);const c=a.get('#cTL');
  tap(c);a.fire(350);assert.equal(a.context.seekCalls.length,0);
  tap(c);tap(c);a.fire(350);assert.deepEqual(a.context.seekCalls,[105]);
  tap(c);tap(c);tap(c);a.fire(350);
  assert.equal(a.context.seekCalls.length,1);assert.equal(a.run("document.body.classList.contains('tg')"),true);
});
test('starting a hold cancels a pending double tap instead of also skipping',()=>{
  const a=app();playing(a);const c=a.get('#cTL');tap(c);tap(c);
  c.onpointerdown(pointer);a.fire(350);a.fire(500);c.onpointerup(pointer);a.fire(350);
  assert.equal(a.context.seekCalls.length,0);assert.deepEqual(a.context.rates,[2,1]);
});
test('remote one-minute command and immediate exit preserve the landing position',()=>{
  const a=app();playing(a);a.run(`receiveRemote('{"message":"fwd60"}');save()`);
  assert.deepEqual(a.context.seekCalls,[105]);assert.equal(a.storage.get('msrchl:pos:video'),'105');
  a.run('player.getCurrentTime=()=>106;save()');assert.equal(a.storage.get('msrchl:pos:video'),'106');
  assert.equal(a.run('seekLanding'),null);
});
test('consecutive seeks accumulate before the player acknowledges the first',()=>{
  const a=app();playing(a);a.run('skipVideo(30);skipVideo(30);save()');
  assert.deepEqual(a.context.seekCalls,[75,105]);assert.equal(a.storage.get('msrchl:pos:video'),'105');
});
test('a failed seek eventually yields to the real position; finished videos restart',()=>{
  const a=app();playing(a);a.run('skipVideo(30);seekLanding.until=0;save()');
  assert.equal(a.storage.get('msrchl:pos:video'),'45');
  a.run('player.getPlayerState=()=>0;save()');assert.equal(a.storage.get('msrchl:pos:video'),'0');
});

test('phone setup copying confirms success beside the button and uses the dedicated controller URL',async()=>{
  const a=app({stored:'test-topic'}), b=a.get('#remotePair');b.textContent='Copy phone setup link';
  await b.onclick();
  const url=new URL(a.calls.find(c=>c[0]==='copy')[1]);
  assert.equal(url.pathname,'/remote.html');assert.equal(url.searchParams.get('remote'),'test-topic');
  assert.equal(b.textContent,'Copied!');assert.equal(b.disabled,false);
  assert.equal(a.get('#remoteNote').classList.contains('copyFeedback'),true);
  await b.onclick();a.fire(4000);assert.equal(b.textContent,'Copy phone setup link');
});
test('blocked clipboard offers manual copying without replacing the saved topic input',async()=>{
  const a=app({stored:'test-topic',clipboardBlocked:true}),b=a.get('#remotePair');
  await b.onclick();
  assert.equal(b.textContent,'Copy manually');assert.equal(a.get('#remoteManual').hidden,false);
  assert.equal(new URL(a.get('#remoteManualInput').value).searchParams.get('remote'),'test-topic');
  assert.equal(a.get('#remoteInput').type,'password');assert.equal(a.get('#remoteInput').value,'test-topic');
  assert.match(a.get('#remoteNote').textContent,/blocked/);assert.equal(a.calls.some(c=>c[0]==='copy'),false);
  a.get('#remotePanel').open=false;a.get('#remotePanel').ontoggle();
  assert.equal(a.get('#remoteManual').hidden,true);assert.equal(a.get('#remoteManualInput').value,'');
});
test('native share sends only the complete setup URL and dismissing it does not copy a secret',async()=>{
  const a=app({stored:'test-topic'});let shared;
  a.context.navigator.share=async data=>{shared=data;};
  await a.get('#remoteSend').onclick();
  assert.deepEqual(Object.keys(shared),['url']);
  assert.equal(shared.url,'https://example.test/remote.html?remote=test-topic');
  a.context.navigator.share=async()=>{const e=Error();e.name='AbortError';throw e;};
  await a.get('#remoteSend').onclick();assert.equal(a.calls.some(c=>c[0]==='copy'),false);
});


test('last-video launch keeps its address through filter and session changes, while sharing stays explicit',async()=>{
  const a=app({query:'?v=last'});
  a.run(`DOC={defaults:{},providers:[{id:'ms-rachel',name:'Ms Rachel'}],topics:[],characters:[],
    videos:{video:{provider:'ms-rachel',t:'Example'}}};
    applyFilter({prov:'ms-rachel',topic:'all',era:'all',char:'all'});`);
  a.get('#mins').children[1].onclick();
  assert.equal(a.storage.get('msrchl:prov'),'ms-rachel');
  assert.equal(a.storage.get('msrchl:seconds'),'180');
  assert.equal(a.calls.some(c=>c[0]==='url'),false);
  await a.get('#share').onclick();
  const shared=new URL(a.calls.find(c=>c[0]==='copy')[1]);
  assert.equal(shared.searchParams.get('v'),'any');
  assert.equal(shared.searchParams.get('provider'),'ms-rachel');
  assert.equal(shared.searchParams.get('m'),'3');
});
test('last-video launch remembers session length; explicit duration wins and inaccessible storage falls back',()=>{
  assert.equal(app({query:'?v=last',values:{'msrchl:seconds':'180'}}).run('chosen'),180);
  assert.equal(app({query:'?v=last&m=5',values:{'msrchl:seconds':'180'}}).run('chosen'),300);
  assert.equal(app({query:'?v=last',blocked:true}).run('chosen'),1200);
  assert.equal(app({query:'?v=last',values:{'msrchl:seconds':'invalid'}}).run('chosen'),1200);
  assert.equal(app({query:'?v=last',values:{'msrchl:seconds':'-20'}}).run('chosen'),1200);
  assert.equal(app({values:{'msrchl:seconds':'180'}}).run('chosen'),1200);
});
test('last-video links still strip imported credentials without appending picker state',()=>{
  const a=app({query:'?v=last&remote=test-topic'});a.run('syncUrl()');
  assert.deepEqual(a.calls.filter(c=>c[0]==='url'),[['url','/?v=last']]);
  assert.equal(a.storage.get('msrchl:remote'),'test-topic');
});
test('ordinary deep links still describe the picker in the address',()=>{
  const a=app({query:'?v=example'});a.run("cur.prov='ms-rachel';chosen=300;syncUrl()");
  const address=new URL(a.calls.find(c=>c[0]==='url')[1],'https://example.test');
  assert.equal(address.searchParams.get('v'),'example');
  assert.equal(address.searchParams.get('provider'),'ms-rachel');
  assert.equal(address.searchParams.get('m'),'5');
});
test('returning to the picker preserves the last launch address and cancels deferred playback',()=>{
  const a=app({query:'?v=last',stored:'test-topic'});playing(a);
  a.run(`autoStart({id:'video',t:'Example'});playerReady=false;
    winding=true;windFade=setInterval(()=>{},80);listenRemote();`);
  assert.ok(a.intervals.size>0);
  a.get('#cBR').onclick();a.fire(8000);
  assert.equal(a.context.location.href,'https://example.test/?v=last');
  assert.equal(a.get('#pick').classList.contains('on'),true);
  assert.equal(a.get('#stage').classList.contains('on'),false);
  assert.equal(a.get('#tap').classList.contains('on'),false);
  assert.equal(a.storage.get('msrchl:pos:video'),'45');
  assert.equal(a.run('pending'),null);assert.equal(a.run('autoV'),null);
  assert.equal(a.run('ticker'),null);assert.equal(a.run('winding'),false);
  assert.equal(a.intervals.size,0);assert.ok(a.calls.some(c=>c[0]==='close'));
});


test('sharing without native support or after failure copies the complete setup URL',async()=>{
  for(const unavailable of [true,false]){
    const a=app({stored:'test-topic'});
    if(!unavailable) a.context.navigator.share=async()=>{throw Error('share failed');};
    await a.get('#remoteSend').onclick();
    assert.equal(a.calls.find(c=>c[0]==='copy')[1],'https://example.test/remote.html?remote=test-topic');
    assert.equal(a.get('#remoteSend').textContent,'Copied!');
  }
});
