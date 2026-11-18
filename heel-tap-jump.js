// Oblique side view. The small horizontal offset keeps the far limbs visible.
function pose({head,neck,hip,shoulder,elbow,hand,knee,heel,toe}) {
  const far = ([x,y])=>[x+16,y];
  const nearHip = [hip[0]-8,hip[1]];
  return {head,neck,hip,lp:nearHip,rp:far(nearHip),
    ls:shoulder,le:elbow,lh:hand,lk:knee,lf:heel,lt:toe,
    rs:far(shoulder),re:far(elbow),rh:far(hand),rk:far(knee),rf:far(heel),rt:far(toe)};
}

const standing = pose({
  head:[161,36],neck:[155,55],hip:[149,116],shoulder:[148,62],elbow:[142,95],hand:[146,126],
  knee:[146,157],heel:[143,198],toe:[160,198]
});
const bending = {
  head:[171,54],neck:[163,72],hip:[138,129],shoulder:[155,78],
  knee:[164,158],heel:[143,198],toe:[160,198]
};
const kneesFolding = {
  head:[163,22],neck:[156,40],hip:[148,95],shoulder:[149,47],
  knee:[151,136],heel:[111,144],toe:[98,155]
};
const heelAtTap = [123,103];

export const heelTapJumpDiagram = {
  caption:'斜め横から。体の後ろで、左右の手が同じ側のかかとに触れます。',
  stageSeconds:.55,
  stages:[
    {button:'構え',points:standing},
    {points:pose({...bending,elbow:[131,101],hand:[109,126]})},
    {button:'踏み切り',points:pose({
      head:[160,26],neck:[155,44],hip:[149,101],shoulder:[148,51],elbow:[140,83],hand:[130,114],
      knee:[144,142],heel:[143,183],toe:[153,198]
    })},
    {points:pose({...kneesFolding,elbow:[134,77],hand:[124,108]})},
    {button:'空中でタッチ',points:pose({
      head:[164,19],neck:[157,36],hip:[148,90],shoulder:[149,43],elbow:[135,73],hand:heelAtTap,
      knee:[156,129],heel:heelAtTap,toe:[119,86]
    })},
    {points:pose({...kneesFolding,elbow:[147,81],hand:[150,113]})},
    {points:pose({
      head:[167,28],neck:[158,46],hip:[147,103],shoulder:[151,53],elbow:[162,84],hand:[178,111],
      knee:[150,144],heel:[142,183],toe:[150,197]
    })},
    {button:'両足で着地',points:pose({...bending,elbow:[173,105],hand:[202,109]})},
    {points:standing}
  ],
  references:[
    {title:'Boston University — Jump in Air, Slap Hands to Heels Behind（Form N, Test 11）',
      url:'https://open.bu.edu/bitstreams/2e3bb521-762f-4643-b12e-523e11240b8d/download'},
    {title:'Delaware Physical Therapy Clinic — Pogo Jumps with Knees to Butt',
      url:'https://cpb-us-w2.wpmucdn.com/sites.udel.edu/dist/c/3448/files/2017/07/HAMSTRING-EXERCISE-PROGRESSION-Jul-28-2017-pcthe2.pdf'}
  ]
};
