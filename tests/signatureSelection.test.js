import { test, expect } from 'bun:test';
import { selectSignature, reframeHalves, payoffPhrase, validStat, sourced, inputStats, applySignatureStrategy } from '../src/components/signature/selection.ts';
const strategy = { visualIntensity: 'balanced', reframe: 'Past consultants left a report. The partner works your dock.', oneLiner: null, ctaLadder: {primary:'Request a Site Visit',secondary:null} };
const sections = [{type:'hero',content:{headline:strategy.reframe}},{type:'how-it-works',content:{steps:[{},{},{}]}},{type:'features',content:{features:[{},{},{}]}}];
test('intensity limits exactly 3, 5 and 6 treatments, with no quota padding',()=>{
 for (const [visualIntensity,limit] of [['restrained',3],['balanced',5],['expressive',6]]) {
  expect(selectSignature({...strategy,visualIntensity},sections).elements.length).toBeLessThanOrEqual(limit);
 }
 expect(selectSignature({...strategy,reframe:null,visualIntensity:'restrained'},[]).elements).toEqual(['chapter']);
});
test('reframe halves preserve strategy wording and never invent a missing alternative',()=>{
 expect(reframeHalves(strategy.reframe)).toEqual({refused:'Past consultants left a report.',approach:'The partner works your dock.'});
 expect(reframeHalves('We refuse generic templates.')).toBeNull();
});
test('gradient uses only one existing payoff, never the full headline or a guessed phrase',()=>{
 expect(payoffPhrase(strategy.reframe)).toBe('The partner works your dock.');
 expect(payoffPhrase('Inventory Accuracy Reset')).toBeNull();
 expect(payoffPhrase('Inventory Accuracy Reset','Inventory Accuracy Reset')).toBeNull();
});
test('zero stats require an explicit absence of the labeled thing, not incidental no',()=>{
 const stat={value:'0',label:'generic templates',evidence:{text:'No generic templates.',source:'No generic templates.',field:'uniqueValue'}};
 expect(validStat(stat)).toBe(true);
 expect(validStat({...stat,evidence:{...stat.evidence,text:'No waiting. We use generic templates.',source:'No waiting. We use generic templates.'}})).toBe(false);
 expect(validStat({...stat,evidence:{...stat.evidence,source:''}})).toBe(false);
});
test('numeric stat value and label must both occur in the citation',()=>{
 const stat={value:'4',label:'clients',evidence:{text:'4 clients',source:'We cap engagements at 4 clients.',field:'uniqueValue'}};
 expect(validStat(stat)).toBe(true);expect(validStat({...stat,value:'50'})).toBe(false);
});
test('input counts stay verbatim and refusal zero is derived only from the stated absence',()=>{
 expect(inputStats({uniqueStrength:'We cap every engagement at four clients at a time.'})[0].value).toBe('four');
 expect(inputStats({uniqueValue:'No generic templates.'})[0].value).toBe('0');
 expect(inputStats({uniqueValue:'We use tailored design.'})).toEqual([]);
});
test('secondary CTA is never invented and unsupported microline/terms are omitted',()=>{
 const p=selectSignature(strategy,sections,{ctaTerms:['Cancel anytime'],ctaMicroline:'No obligation'});
 expect(p.elements).not.toContain('fork');expect(p.secondary).toBeNull();expect(p.terms).toEqual([]);expect(p.microline).toBeNull();
});
test('source-backed terms survive verbatim, malformed and fabricated citations do not',()=>{
 expect(sourced({text:'No obligation',source:'No obligation',field:'terms'})).toBe(true);
 expect(sourced({text:'No obligation',source:'Book a visit',field:'terms'})).toBe(false);
 expect(sourced({text:34,source:34,field:'terms'})).toBe(false);
 expect(selectSignature(strategy,sections,{ctaTerms:[{text:'Cancel anytime',source:'Cancel anytime',field:'terms'}]}).terms).toEqual([]);
});
test('applying signature is immutable and never rewrites content or CTAs',()=>{
 const before=JSON.stringify(sections);const next=applySignatureStrategy(sections,strategy);
 expect(JSON.stringify(sections)).toBe(before);expect(next[0].content.signature.primary).toBe('Request a Site Visit');
});