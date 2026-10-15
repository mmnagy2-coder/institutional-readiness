import {describe,it,expect} from 'vitest';
import {blank,summarise,overall} from '../shared/scoring';
describe('readiness methodology',()=>{
 it('distinguishes unknown from confirmed absence',()=>{
 expect(summarise(['a','b'],{a:{...blank(),score:0}})).toMatchObject({score:0,coverage:.5});
 });
 it('excludes non-applicable answers without dividing by zero',()=>{
 expect(summarise(['a'],{a:{...blank(),na:true}})).toMatchObject({score:null,coverage:0});
 });
 it('reproduces the blueprint example',()=>{
 const answers=Object.fromEntries([2,2,3,1,2].map((score,i)=>[String(i),{...blank(),score}]));
 expect(summarise(['0','1','2','3','4','5'],answers)).toMatchObject({score:50,coverage:5/6});
 });
 it('suppresses an index with insufficient coverage or unresolved gates',()=>{
 expect(overall([{score:70,coverage:.7,completed:4,applicable:6}],false)).toBeNull();
 expect(overall([{score:70,coverage:1,completed:6,applicable:6}],true)).toBeNull();
 });
});
