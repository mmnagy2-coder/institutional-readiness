export const domains = [
  {id:'P1',title:'Governance & strategy',pillar:'Policy'},
  {id:'P2',title:'Rights & responsibility',pillar:'Policy'},
  {id:'T1',title:'Platforms & pipelines',pillar:'Infrastructure'},
  {id:'T2',title:'Access & resources',pillar:'Infrastructure'},
  {id:'F1',title:'Faculty capability',pillar:'Faculty literacy'},
  {id:'F2',title:'Curriculum & assessment',pillar:'Faculty literacy'},
];
export type Answer = { score: number | null; na: boolean; evidence: string; notes: string };
export type Answers = Record<string, Answer>;
export const blank = (): Answer => ({score:null,na:false,evidence:'',notes:''});
export function summarise(ids:string[], answers:Answers) {
  const applicable = ids.filter(id=>!answers[id]?.na);
  const scored = applicable.filter(id=>answers[id]?.score!=null);
  return {score:scored.length ? 25*scored.reduce((sum,id)=>sum+answers[id].score!,0)/scored.length : null,
    coverage:applicable.length ? scored.length/applicable.length : 0,
    completed:ids.filter(id=>answers[id]?.na||answers[id]?.score!=null).length,
    applicable:applicable.length};
}
export function overall(results:ReturnType<typeof summarise>[], unresolved:boolean) {
  return unresolved||results.some(r=>r.coverage<.8||r.score===null) ? null : results.reduce((s,r)=>s+r.score!,0)/results.length;
}
