import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { Transpiler } from 'bun';
import vm from 'node:vm';
const source = readFileSync('supabase/functions/_shared/siteImages.ts','utf8').replace(/^import .*;$/gm,'').replace(/export /g,'');
const context = vm.createContext({URL,console,IMAGE_RULES:{harvestCap:8}});
vm.runInContext(new Transpiler({loader:'ts'}).transformSync(source),context);
describe('own-site image harvesting boundaries',()=>{
 it('skips icons, logo URLs, tracking pixels and SVGs',()=>{const urls=context.siteImageCandidates('<img src="/logo.png"><img src="/pixel.jpg"><img src="/icon.png"><img src="/real.jpg"><img src="/art.svg">','https://client.test/',null);expect([...urls]).toEqual(['https://client.test/real.jpg']);});
 it('records candidates from og image and content without duplication',()=>{const urls=context.siteImageCandidates('<meta property="og:image" content="/photo.jpg"><img src="/photo.jpg"><img src="/second.png">','https://client.test/page',null);expect([...urls]).toEqual(['https://client.test/photo.jpg','https://client.test/second.png']);});
 it('blocks local and literal network destinations',()=>{for(const u of ['http://127.0.0.1/a.png','http://10.1.2.3/a.png','http://localhost/a.png','http://host.internal/a.png','file:///a.png'])expect(context.publicImageUrl(u,'https://client.test')).toBeNull();});
 it('never uploads as a guest',async()=>{expect([...await context.harvestSiteImages('<img src="/a.png">','https://client.test/',null,{storage:{from(){throw Error('must not run')}}},null)]).toEqual([]);});
});