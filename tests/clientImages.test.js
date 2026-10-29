import { describe, it, expect } from 'vitest';
import { preferredImage, collectClientImages, composeClientImages } from '../src/lib/clientImages';
import { IMAGE_RULES, judgeImageFacts } from '../supabase/functions/_shared/imageAudit';
const image = source => ({ id:source,url:`https://assets.test/${source}.png`,source,sourcePageUrl:'https://client.test/',storagePath:'owner/site-images/image.png' });
describe('client image provenance and composition',()=>{
 it('caps harvest at eight',()=>expect(IMAGE_RULES.harvestCap).toBe(8));
 it('prefers uploads over harvested images',()=>expect(preferredImage([image('client-site'),image('client-upload')]).source).toBe('client-upload'));
 it('prefers harvested images over scenes',()=>expect(preferredImage([image('brand-scene'),image('client-site')]).source).toBe('client-site'));
 it('prefers scenes over Unsplash',()=>expect(preferredImage([image('unsplash'),image('brand-scene')]).source).toBe('brand-scene'));
 it('rejects harvests without recorded source page',()=>expect(collectClientImages({harvestedImages:[{...image('client-site'),sourcePageUrl:undefined}]})).toEqual([]));
 it('composes own-site hero and distinct support without work-sample injection',()=>{const s=composeClientImages([{type:'hero',content:{}},{type:'differentiator-callout',content:{text:'Client words'}},{type:'work-samples',content:{samples:[]}}],[image('client-site'),{...image('client-site'),url:'https://assets.test/second.png'}]);expect(s[0].content.backgroundImage).toBe('https://assets.test/client-site.png');expect(s[1].content.supportingImage).toBe('https://assets.test/second.png');expect(s[2].content.samples).toEqual([]);});
 it('never overwrites explicit user selections',()=>expect(composeClientImages([{type:'hero',content:{backgroundImage:'chosen'}}],[image('client-site')])[0].content.backgroundImage).toBe('chosen'));
 it('rejects 15px short or 63px long images',()=>{expect(judgeImageFacts(64,15).ok).toBe(false);expect(judgeImageFacts(63,16).ok).toBe(false);expect(judgeImageFacts(64,16).ok).toBe(true);});
 it('rejects blank and transparent images',()=>{expect(judgeImageFacts(64,64,[255,255,255,255]).reason).toBe('solid-color');expect(judgeImageFacts(64,64,[0,0,0,0]).reason).toBe('fully-transparent');});
});