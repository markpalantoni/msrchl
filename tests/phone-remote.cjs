const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../remote.html'),'utf8');
const source=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function remote({query='',stored=null,blocked=false,respond=async()=>({ok:true})}={}){
  const nodes=new Map(),storage=new Map(),calls=[];
  if(stored)storage.set('msrchl:remote',stored);
  const get=s=>{if(!nodes.has(s))nodes.set(s,{textContent:'',hidden:false,disabled:false});return nodes.get(s);};
  const buttons=[...html.matchAll(/<button data-command=(\w+)/g)].map(m=>({dataset:{command:m[1]},disabled:true}));
  const context=vm.createContext({URL,URLSearchParams,AbortController,
    location:{href:'https://example.test/remote.html'+query,search:query},
    history:{replaceState:(_a,_b,url)=>calls.push(['url',url])},
    document:{querySelector:get,querySelectorAll:()=>buttons},
    localStorage:{getItem:k=>{if(blocked)throw Error();return storage.get(k)||null;},
      setItem:(k,v)=>{if(blocked)throw Error();storage.set(k,v);},removeItem:k=>{if(blocked)throw Error();storage.delete(k);}},
    fetch:async(url,options)=>{calls.push(['send',url,options]);return respond();},
    setTimeout:()=>1,clearTimeout(){}
  });
  vm.runInContext(source,context);
  return {get,buttons,storage,calls,context,run:s=>vm.runInContext(s,context)};
}
test('opening a setup link pairs and scrubs the URL without sending any command',()=>{
  const a=remote({query:'?remote=test-topic'});
  assert.equal(a.storage.get('msrchl:remote'),'test-topic');
  assert.deepEqual(a.calls,[['url','/remote.html']]);
  assert.equal(a.buttons.length,8);assert.equal(a.buttons.every(b=>!b.disabled),true);
  assert.match(a.get('#connection').textContent,/Ready/);
  assert.equal(/youtube|iframe_api|content\.json/.test(html),false);
  const b=remote({stored:'test-topic'});assert.equal(b.buttons.every(b=>!b.disabled),true);
});
test('unpaired and invalid links cannot send; storage failures are visible',async()=>{
  for(const query of ['', '?remote=bad%2Ftopic']){
    const a=remote({query});await a.run("sendCommand('wind')");
    assert.equal(a.buttons.every(b=>b.disabled),true);assert.equal(a.calls.some(c=>c[0]==='send'),false);
  }
  const a=remote({query:'?remote=test-topic',blocked:true});
  assert.match(a.get('#connection').textContent,/visit/);assert.equal(a.buttons.every(b=>!b.disabled),true);
});
test('phone buttons publish POST commands without caching and wait for acknowledgment',async()=>{
  const a=remote({stored:'test-topic'});
  await a.buttons.find(b=>b.dataset.command==='wind').onclick();
  const [,url,options]=a.calls.find(c=>c[0]==='send');
  assert.equal(url,'https://ntfy.sh/test-topic');assert.equal(options.method,'POST');
  assert.equal(options.body,'wind');assert.equal(options.headers.Cache,'no');
  assert.match(a.get('#status').textContent,/sent/);assert.equal(a.buttons.every(b=>!b.disabled),true);
  await a.run("sendCommand('arbitrary-code')");assert.equal(a.calls.filter(c=>c[0]==='send').length,1);
});
test('a pending request suppresses duplicate taps; failures never claim delivery',async()=>{
  let finish;const a=remote({stored:'test-topic',respond:()=>new Promise(resolve=>{finish=resolve;})});
  const first=a.run("sendCommand('fwd60')");await a.run("sendCommand('fwd60')");
  assert.equal(a.calls.filter(c=>c[0]==='send').length,1);assert.equal(a.buttons.every(b=>b.disabled),true);
  finish({ok:false});await first;
  assert.match(a.get('#status').textContent,/Couldn’t confirm/);assert.equal(a.buttons.every(b=>!b.disabled),true);
  const b=remote({stored:'test-topic',respond:async()=>{throw Error('offline');}});
  await b.run("sendCommand('wind')");assert.match(b.get('#status').textContent,/Couldn’t confirm/);
});
test('forget and remote=off disable this controller',()=>{
  const a=remote({stored:'test-topic'});a.get('#forget').onclick();
  assert.equal(a.storage.size,0);assert.equal(a.buttons.every(b=>b.disabled),true);
  const b=remote({stored:'test-topic',query:'?remote=off'});
  assert.equal(b.storage.size,0);assert.equal(b.buttons.every(b=>b.disabled),true);
});
