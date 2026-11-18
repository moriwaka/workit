export const poses = { stand: '立位', sit: '床の座位', back: '仰向け', all4: '四つん這い', kneel: '膝立ち' };
export const gear = { wall: '壁', step: '踏み台', band: '輪状バンド' };
export const zones = {
  shoulder: '肩・腕', chest: '胸', upper: '背中上部', core: '体幹・腰',
  hip: 'お尻・股関節', quad: '太もも前', ham: '太もも裏', calf: 'ふくらはぎ・足首'
};
export const purposes = { mixed: '筋力＋柔軟性', strength: '筋力', stretch: '柔軟性' };
export const phases = { warm: 'ウォームアップ', main: 'メイントレーニング', cool: 'クールダウン' };
export const levels = ['入門', '軽め', '標準'];

// Corrections to the starting and ending joint positions for each movement.
// The near side is highlighted. Bilateral instructions are in each exercise.
const standing = { head:[151,39], neck:[151,60], hip:[151,123], ls:[140,66], rs:[162,66], le:[135,96], re:[168,96], lh:[136,119], rh:[169,119], lk:[139,158], rk:[164,158], lf:[138,197], rf:[166,197] };
const sitting = {head:[105,63],neck:[107,83],hip:[105,183],ls:[100,91],rs:[119,90],
  le:[94,127],re:[129,126],lh:[110,151],rh:[147,153],lk:[150,184],rk:[156,175],lf:[216,194],rf:[217,184],
  lt:[239,185],rt:[237,176]};
const seatedFront = {...sitting, head:[150,62],neck:[150,83],hip:[150,181],
  ls:[132,90],rs:[168,90],le:[121,123],re:[179,123],lh:[128,157],rh:[172,157],
  lk:[108,166],rk:[192,166],lf:[141,193],rf:[159,193],lt:[150,192],rt:[150,192]};
const oneLegBent = {rk:[159,136],rf:[175,185],rt:[196,186],rh:[156,144]};
const supine = { head:[67,181], neck:[86,185], hip:[157,186], ls:[89,189], rs:[99,179], le:[117,194], re:[123,182], lh:[142,195], rh:[148,182], lk:[185,143], rk:[192,135], lf:[215,197], rf:[220,190] };
const all4 = { head:[211,105], neck:[195,121], hip:[124,125], ls:[193,128], rs:[183,122], le:[194,160], re:[181,149], lh:[194,196], rh:[181,188], lk:[124,193], rk:[110,184], lf:[89,196], rf:[79,188] };
const kneel = { head:[150,62], neck:[150,81], hip:[151,130], ls:[139,87], rs:[160,87], le:[136,111], re:[164,111], lh:[137,131], rh:[166,130], lk:[143,192], rk:[162,187], lf:[101,196], rf:[121,190] };
const floorStraddle = {...seatedFront,lk:[108,181],rk:[192,181],lf:[61,195],rf:[239,195],
  lt:[56,178],rt:[244,178],le:[130,131],re:[169,131],lh:[138,179],rh:[165,179]};
const seatedTwist = {...sitting,rk:[144,119],rf:[176,194],rt:[197,195],lh:[87,191],rh:[125,188]};
const supineTop = {...supine,head:[150,55],neck:[150,76],hip:[150,138],ls:[132,83],rs:[168,83],
  le:[126,103],re:[174,103],lh:[123,126],rh:[177,126],lk:[138,156],rk:[164,156],lf:[138,192],rf:[164,192]};
const bases = {stand:standing, sit:sitting, back:supine, all4, kneel};
const motions = {
  march: [{rk:[177,135],rf:[180,168]}, {lk:[124,135],lf:[119,169]}],
  heelDig: [{rk:[169,151],rf:[189,196]}, {lk:[132,151],lf:[115,196]}],
  shoulderRoll: [{}, {ls:[140,59],rs:[162,59],le:[135,89],re:[168,89],lh:[136,112],rh:[169,112]}],
  kneeBend: [{lh:[184,74],rh:[201,76],le:[164,79],re:[179,81]}, {head:[154,48],neck:[154,69],hip:[146,133],ls:[143,74],rs:[165,74],lh:[184,82],rh:[201,84],le:[166,84],re:[180,85],lk:[135,163],rk:[172,163]}],
  toe: [{rk:[165,160],rf:[185,195]}, {lk:[128,157],lf:[108,195]}],
  squat: [{}, {head:[153,58],neck:[153,79],ls:[141,85],rs:[166,85],le:[136,109],re:[168,108],lh:[144,119],rh:[159,119],hip:[151,145],lk:[125,167],rk:[178,167]}],
  calf: [{}, {head:[151,29],neck:[151,50],ls:[140,56],rs:[162,56],le:[135,86],re:[168,86],lh:[136,109],rh:[169,109],hip:[151,113],lk:[139,148],rk:[164,148],lf:[146,189],rf:[174,189]}],
  side: [{}, {rk:[189,151],rf:[213,181]}],
  push: [{head:[191,48],neck:[184,66],ls:[193,71],rs:[174,70],le:[219,86],re:[208,87],lh:[241,98],rh:[240,103],hip:[162,119],lk:[148,157],rk:[157,152],lf:[133,196],rf:[144,191]}, {head:[221,47],neck:[211,65],ls:[215,76],rs:[202,71],le:[197,107],re:[190,101],lh:[241,98],rh:[240,103],hip:[183,119],lk:[157,157],rk:[165,153],lf:[133,196],rf:[144,191]}],
  step: [{rk:[185,142],rf:[205,173]}, {head:[191,16],neck:[191,36],ls:[178,43],rs:[201,44],le:[175,70],re:[205,69],lh:[176,95],rh:[204,92],hip:[193,98],lk:[202,136],rk:[212,136],lf:[205,173],rf:[222,173]}],
  calfStretch: [{lh:[237,97],rh:[241,105],le:[191,111],re:[201,114],lk:[126,157],lf:[106,197],rk:[179,162],rf:[180,197]}, {head:[174,39],neck:[167,60],rs:[180,68],ls:[159,66],lh:[237,97],rh:[241,105],le:[205,99],re:[212,107],hip:[154,125],lk:[126,158],lf:[106,197],rk:[194,161],rf:[180,197]}],
  reach: [{}, {head:[133,44],neck:[138,64],ls:[127,70],rs:[149,68],le:[126,94],re:[152,94],lh:[127,116],rh:[156,117]}],
  sitPress: [{...oneLegBent,lk:[157,183]}, {...oneLegBent,lk:[157,193]}],
  sitMarch: [{lk:[158,139],lf:[190,194],lt:[211,195],rk:[149,130],rf:[169,185],rt:[189,186]},
    {lk:[158,123],lf:[190,178],lt:[211,179],rk:[149,130],rf:[169,185],rt:[189,186]}],
  pelvic: [{}, {hip:[157,179],lk:[183,142],rk:[190,134]}],
  sitAnkle: [{lt:[240,193],rt:[238,183]}, {lt:[216,168],rt:[217,159]}],
  sitTurn: [seatedFront,{...seatedFront,head:[156,61],neck:[154,82],ls:[144,92],rs:[178,84],
    le:[131,125],re:[182,121],lh:[128,155],rh:[171,157]}],
  sitBreathe: [seatedFront,seatedFront],
  sitHam: [{...oneLegBent,lk:[160,190],lh:[145,162]},
    {...oneLegBent,lk:[160,190],head:[141,77],neck:[132,94],ls:[123,101],rs:[142,95],
    le:[127,135],re:[151,124],lh:[151,163],rh:[159,143]}],
  sitHip: [seatedFront,{...seatedFront,lk:[101,183],rk:[199,183]}],
  breatheBack: [{}, {neck:[86,182],rs:[99,175],re:[123,178],rh:[148,179]}],
  slide: [{}, {rk:[211,178],rf:[256,192]}],
  bridge: [{}, {hip:[157,153],ls:[89,187],rs:[99,177],lk:[185,138],rk:[193,133]}],
  fallout: [{}, {rk:[206,165],rf:[220,190]}],
  backHam: [{lk:[187,142],lf:[211,98],le:[137,164],lh:[188,127],re:[142,160],rh:[194,123]},
    {lk:[173,134],lf:[185,84],le:[133,154],lh:[170,115],re:[136,149],rh:[177,111]}],
  band: [{}, {lk:[170,155],rk:[209,144]}],
  rock: [{}, {head:[192,109],neck:[176,125],hip:[103,149],ls:[176,133],rs:[166,124],le:[184,164],re:[172,151]}],
  bird: [{}, {rh:[242,117],re:[211,120],lk:[86,130],lf:[51,132]}],
  hipHinge: [{lh:[142,122],rh:[162,122]}, {head:[193,68],neck:[175,83],hip:[129,127],ls:[164,88],rs:[184,89],le:[156,114],re:[176,113],lh:[138,122],rh:[153,123],lk:[145,160],rk:[169,160]}],
  scapula: [{}, {ls:[142,68],rs:[160,68],le:[139,99],re:[164,99],lh:[138,123],rh:[166,123]}],
  freeCalf: [{lk:[125,156],lf:[107,197],rk:[176,156],rf:[185,197]},
    {head:[173,45],neck:[166,65],hip:[151,123],ls:[155,71],rs:[175,72],le:[152,101],re:[178,101],lh:[152,123],rh:[180,124],
    lk:[125,156],lf:[107,197],rk:[191,161],rf:[185,197]}],
  toeRaise: [{head:[128,47],neck:[130,67],hip:[137,125],ls:[125,73],rs:[144,72],le:[123,100],re:[146,100],
    lh:[127,124],rh:[149,124],lk:[152,163],rk:[163,157],lf:[166,195],rf:[178,190],lt:[184,198],rt:[194,193]},
    {head:[128,47],neck:[130,67],hip:[137,125],ls:[125,73],rs:[144,72],le:[123,100],re:[146,100],
    lh:[127,124],rh:[149,124],lk:[152,163],rk:[163,157],lf:[166,195],rf:[178,190],lt:[180,183],rt:[192,180]}],
  chestOpen: [{lh:[140,125],rh:[151,125]}, {head:[154,36],neck:[154,59],ls:[136,67],rs:[164,66],
    le:[132,93],re:[158,94],lh:[141,119],rh:[144,119]}],
  sitStraddle: [floorStraddle,{...floorStraddle,head:[150,88],neck:[150,109],ls:[129,116],rs:[173,116],
    le:[128,153],re:[175,153],lh:[137,190],rh:[163,190]}],
  sitSpinal: [seatedTwist,{...seatedTwist,head:[91,64],neck:[102,84],ls:[97,91],rs:[119,91],le:[92,135],re:[147,119],rh:[151,138]}],
  straightRaise: [{lk:[194,188],lf:[241,195]}, {lk:[188,161],lf:[229,141]}],
  kneeRoll: [supineTop,{...supineTop,hip:[151,141],lk:[123,159],rk:[143,164]}],
  figureFour: [{lk:[184,138],lf:[208,119],rk:[197,135],rf:[219,136],le:[133,170],re:[138,165],lh:[178,155],rh:[187,141]},
    {lk:[165,127],lf:[195,111],rk:[179,125],rf:[196,119],le:[129,159],re:[135,153],lh:[159,143],rh:[169,130]}],
  kneelShift: [{}, {head:[167,62],neck:[164,81],hip:[157,130],ls:[153,87],rs:[174,87],le:[150,111],re:[178,111],lh:[151,131],rh:[180,130]}],
  kneelHinge: [{}, {head:[187,81],neck:[173,96],hip:[136,139],ls:[163,102],rs:[183,101],le:[151,122],re:[170,120],lh:[144,141],rh:[158,140]}]
};
export function frames(exercise) {
  return motions[exercise.motion].map(points => ({ ...bases[exercise.pose], ...points }));
}

// Arrows and captions describe one change between the two illustrated poses.
export const seatedDiagrams = {
  sitAnkle:{labels:['かかとを床につける','つま先を手前へ'], highlights:['lt','rt'],
    arrows:[[[247,191],[241,178],[226,167]]]},
  sitPress:{labels:['片脚を前に伸ばす','膝の裏を床へ軽く押す'], highlights:['lk'],
    arrows:[[[157,150],[157,174]]]},
  sitMarch:{labels:['両足を床に置く','手前の膝と足を少し浮かせる'], highlights:['lk','lf','lt'],
    arrows:[[[225,189],[225,162]]]},
  sitHam:{labels:['片脚を伸ばし、反対の膝を曲げる','伸ばした脚に向け、股関節から少し前へ'],
    highlights:['neck','head'], arrows:[[[105,31],[128,32],[152,48]]]},
  sitHip:{labels:['足裏を合わせる','膝を左右に自然に開く'], highlights:['lk','rk'],
    arrows:[[[97,150],[85,178]],[[203,150],[215,178]]], front:true},
  sitTurn:{labels:['正面を向く','骨盤を止めて胸を片側へ'], highlights:['ls','rs'],
    arrows:[[[117,111],[132,121],[156,123],[177,114]]], front:true},
  sitStraddle:{labels:['無理のない幅に脚を開く','背中を長く保って股関節から前へ'],
    highlights:['neck'],arrows:[[[150,29],[150,65]]],front:true},
  sitSpinal:{labels:['片足を反対の膝の外側に置く','胸を曲げた脚の側へ向ける'],
    highlights:['rs','ls'],arrows:[[[141,58],[123,48],[98,46]]]},
  sitBreathe:{labels:['床に座り、肩の力を抜く'], highlights:[], arrows:[], front:true}
};

function exercise(id, name, pose, motion, type, load, steps, cue, extra = {}) {
  return { id, name, pose, motion, type, load, steps, cue, gear: [], level: 0, ...extra };
}

export const catalog = [
  exercise('march','その場で足踏み','stand','march','warm',['hip','quad','calf'],['足を腰幅に開いて立つ。','左右の足を交互に少し上げる。話せる程度のペースで。'],'足元の物を片付け、歩幅は小さく。'),
  exercise('slow-march','ゆっくり足踏み','stand','march','cool',['hip','quad','calf'],['足を腰幅に開いて立つ。','小さな足踏みをしながら、少しずつペースを落とす。'],'止まる前に、足踏みを小さくゆっくりにする。'),
  exercise('toe','左右に軽くつま先タッチ','stand','toe','cool',['hip','calf'],['足を腰幅に開いて立つ。','片足を横に軽く出して戻す。左右交互に、徐々にゆっくり。'],'足に体重を乗せず、軽く触れるだけ。'),
  exercise('sit-ankles','座って足首を動かす','sit','sitAnkle','warm',['calf'],['床に座り、脚を楽に前に出す。','かかとを床につけたまま、つま先を手前と向こうにゆっくり動かす。'],'姿勢を保ちにくければ飛ばす。'),
  exercise('sit-breathe','座って呼吸を整える','sit','sitBreathe','cool',[],['床に楽な姿勢で座る。','肩を脱力し、呼吸を止めず、ゆっくり吐く。'],'図の動きは小さくてよい。息が苦しければ中止。',{still:true}),
  exercise('heel-slide','仰向けでかかとを滑らせる','back','slide','warm',['hip','quad','ham'],['仰向けで膝を立てる。','片脚のかかとを床に沿って滑らせ、戻す。左右交互に。'],'腰を反らさず、動きは小さく。'),
  exercise('back-breathe','仰向けで呼吸を整える','back','breatheBack','cool',[],['仰向けで膝を立て、足裏を床につける。','体の力を抜き、自然な呼吸に合わせてゆっくり吐く。'],'息を止めず、無理に深く吸わない。'),
  exercise('rock-warm','四つん這いで小さく体重移動','all4','rock','warm',['shoulder','core','hip','quad'],['手を肩の下、膝を腰の下に置く。','背中を保ち、お尻を少し後ろへ動かして戻る。'],'手首や膝に痛みがあれば飛ばす。'),
  exercise('rock-cool','四つん這いでゆっくり体重移動','all4','rock','cool',['shoulder','core','hip','quad'],['手と膝で支え、お尻を少し後ろへ。','動く範囲を小さくし、ゆっくり戻す。'],'手首や膝に痛みがあれば飛ばす。'),
  exercise('kneel-warm','膝立ちで小さく体重移動','kneel','kneelShift','warm',['hip','core','quad'],['両膝を腰幅に開いて膝立ちになる。','上体を立てたまま、体重を左右に少しずつ移す。'],'膝を置く面を確かめ、バランスが取りにくければ飛ばす。'),
  exercise('kneel-cool','膝立ちで呼吸を整える','kneel','kneelShift','cool',['quad'],['両膝を腰幅に開き、安定した膝立ちになる。','体の力を抜いてゆっくり呼吸する。'],'膝や腰がつらければ飛ばす。',{still:true}),
  exercise('squat','ミニスクワット','stand','squat','strength',['hip','quad','core'],['足を腰幅ほどに開く。','お尻を後ろに引き、膝を少し曲げて立ち直る。'],'膝とつま先の向きをそろえ、深くしゃがみ込まない。'),
  exercise('calf','カーフレイズ（壁で支える）','stand','calf','strength',['calf'],['壁に指先を添え、足を腰幅に開く。','両かかとをゆっくり上げ、同じペースで下ろす。'],'手に体重をかけず、高く上げすぎない。',{gear:['wall']}),
  exercise('leg-out','立位の股関節外転（横脚上げ）','stand','side','strength',['hip','core'],['壁に手を軽く添え、背すじを伸ばす。','片脚を横に少し上げて下ろす。途中で反対側に替える。'],'つま先を正面に向け、上体を傾けない。',{gear:['wall'],sides:true}),
  exercise('wall-push','ウォールプッシュアップ（壁腕立て）','stand','push','strength',['shoulder','chest','core'],['壁から腕一本分ほど離れ、両手を胸の高さに置く。','体を一直線に保ち、肘を曲げて壁に近づき、押し戻す。'],'肩に痛みがあれば中止。息を止めない。',{gear:['wall']}),
  exercise('step-up','ステップアップ（踏み台昇降）','stand','step','strength',['hip','quad','ham','calf'],['低く、滑らず、ぐらつかない踏み台の前に立つ。','片足の足裏全体を載せて両足で上がり、片足ずつ下りる。途中で先に出す足を替える。'],'踏み台の端を踏まず、急がない。',{gear:['step'],level:1,sides:true}),
  exercise('calf-stretch','壁を使うふくらはぎ伸ばし','stand','calfStretch','stretch',['calf'],['壁に手を添え、片足を後ろへ。','後ろ足のかかとを床につけたまま、前の膝を少し曲げる。'],'後ろ足のつま先を正面へ。反動をつけない。',{gear:['wall'],sides:true}),
  exercise('side-bend','立って体を横に傾ける','stand','reach','stretch',['core'],['足を腰幅に開き、腕を体の横に下ろす。','片手を太ももに沿わせ、体を少し横に傾ける。'],'前に倒れたり、腰をひねったりしない。',{sides:true}),
  exercise('sit-press','座って太ももの前に力を入れる','sit','sitPress','strength',['quad'],['床に座り、片脚を前に伸ばす。','伸ばした膝の裏を床へ軽く押し、ゆるめる。途中で反対側に替える。'],'膝を強く押し込まず、息を止めない。',{sides:true}),
  exercise('sit-march','座って片膝を少し持ち上げる','sit','sitMarch','strength',['hip','core'],['床に座り、両膝を楽に曲げる。','片足を少し浮かせ、そっと床に戻す。途中で反対側に替える。'],'上体を後ろに倒さず、安定しなければ飛ばす。',{sides:true}),
  exercise('sit-ham','床に座って太もも裏を伸ばす','sit','sitHam','stretch',['ham','core'],['片脚を前に伸ばし、反対の脚は楽に曲げる。','背すじを保ち、股関節から上体を少し前に傾ける。'],'つま先に手が届くまで曲げる必要はない。',{sides:true}),
  exercise('sit-hips','バタフライストレッチ（内もも）','sit','sitHip','stretch',['hip'],['床に座り、無理なく両足の裏を合わせる。','背すじを伸ばし、膝は自然に開く範囲で保つ。'],'手で膝を押さない。痛みのない範囲で。'),
  exercise('sit-turn','座って上体を軽く回す','sit','sitTurn','stretch',['core','upper'],['床に楽な姿勢で座る。','腰は正面に保ち、胸を片側に少し向ける。'],'腕で引っ張って回さない。',{sides:true}),
  exercise('bridge','グルートブリッジ（お尻上げ）','back','bridge','strength',['hip','ham','core'],['仰向けで膝を立て、足裏を床につける。','足裏で床を押してお尻を少し持ち上げ、ゆっくり下ろす。'],'腰を反らさず、首で体を支えない。'),
  exercise('band-open','仰向けでバンドを使って膝を開く','back','band','strength',['hip'],['輪状バンドを膝より少し上に置き、仰向けで膝を立てる。','足裏を床につけたまま膝を少し外に開き、ゆっくり戻す。'],'伸ばし切らず、ずれや傷があれば外す。輪がゆるく抵抗が出ない場合は飛ばす。',{gear:['band']}),
  exercise('pelvic','ペルビックティルト（骨盤傾け）','back','pelvic','strength',['core'],['仰向けで膝を立てる。','息を吐きながら下腹部に軽く力を入れ、腰と床のすき間を小さくして戻す。'],'足で床を強く押さない。'),
  exercise('back-ham','仰向けで太もも裏を伸ばす','back','backHam','stretch',['ham','shoulder'],['仰向けになり、片脚を上げて膝の少し下を両手で支える。反対の膝は曲げ、足裏は床につける。','上げた脚を伸ばしたまま、手前に少し引き寄せる。反対側も同様に。'],'膝を伸ばし切ろうとせず、太もも裏に軽い張りを感じるところまで。',{sides:true}),
  exercise('fallout','ベントニーフォールアウト（膝を外に倒す）','back','fallout','strength',['hip','core'],['仰向けで両膝を立てる。','骨盤を正面に保ち、片膝を少し外に倒して戻す。ゆっくり繰り返す。'],'膝を床につけようと押さない。',{sides:true}),
  exercise('bird','バードドッグ（対角の腕と脚を伸ばす）','all4','bird','strength',['shoulder','hip','core','upper'],['手を肩の下、膝を腰の下に置く。','片腕を前へ、反対側の脚を後ろへゆっくり伸ばす。途中で反対側に替える。'],'腰を反らさず、手足を高く上げない。',{level:1,sides:true}),
  exercise('rock-stretch','ロックバック（四つん這いでお尻を引く）','all4','rock','stretch',['hip','core','shoulder','quad'],['手と膝を床につける。','手の位置を保ち、お尻をかかとに向けて少し引く。'],'肩や膝がつらくなる手前で止める。'),
  exercise('hip-hinge','ヒップヒンジ（お尻を後ろへ引く）','stand','hipHinge','strength',['hip','ham','core'],['足を腰幅に置き、膝を軽くゆるめて手を腰へ。','背中を保ってお尻を後ろに引き、上体を少し前に傾けて戻る。'],'腰を丸めたり反らしたりしない。'),
  exercise('scapular-squeeze','肩甲骨を軽く寄せる','stand','scapula','strength',['shoulder','upper'],['立って腕を体の横に下ろす。','肩をすくめず、肩甲骨を軽く寄せて戻す。'],'腕を上げず、痛みの手前で止める。'),
  exercise('free-calf','立ってふくらはぎを伸ばす','stand','freeCalf','stretch',['calf','hip'],['片足を小さく前へ出す。','前の膝を曲げ、後ろの膝を伸ばしてかかとを床へ。反対側も同様に。'],'ふらつく場合は壁を使う種目に替えるか、飛ばす。',{level:1,sides:true}),
  exercise('toe-raise','壁にもたれてつま先を上げる','stand','toeRaise','strength',['calf'],['背を壁につけ、両足を少し前に置く。','かかとを床につけたまま、両足のつま先をゆっくり上げ下げする。'],'床で滑らないことを確認する。',{gear:['wall']}),
  exercise('chest-open','立って胸を軽く開く','stand','chestOpen','stretch',['chest','shoulder','upper'],['腕を後ろで軽く組む。','肩を軽く後ろへ引いて胸を開き、無理のない位置で保つ。'],'腕を高く持ち上げず、手を組みにくければ飛ばす。',{level:1}),
  exercise('sit-straddle','床に座って開脚ストレッチ','sit','sitStraddle','stretch',['hip','ham','core','shoulder'],['床に座り、背すじを保てる範囲で両脚を開く。手を床に置く。','股関節から上体を少し前に傾け、内ももに軽い張りを感じるところで保つ。'],'脚を無理に開かず、手で床を強く押さない。',{level:1}),
  exercise('sit-spinal','床に座って体幹をひねる','sit','sitSpinal','stretch',['core','upper','hip','shoulder'],['床に座って脚を前に伸ばし、片足を反対の膝の外側へ置く。','片手で体を支え、曲げた脚のほうへ胸を少し向ける。反対側も同様に。'],'腕で膝を強く押さず、姿勢を取りづらければ飛ばす。',{level:2,sides:true}),
  exercise('straight-raise','仰向けで伸ばした脚を上げる','back','straightRaise','strength',['hip','quad','core'],['仰向けで片膝を立て、もう片脚を床に伸ばす。','伸ばした脚の太ももに軽く力を入れ、足を少し持ち上げてゆっくり下ろす。反対側も同様に。'],'腰を反らしたり、脚を勢いで上げたりしない。',{sides:true}),
  exercise('knee-roll','仰向けで両膝を左右に倒す','back','kneeRoll','stretch',['core','hip'],['仰向けで膝をそろえて立て、肩を床につける。','両膝を片側へ小さく倒して中央に戻す。左右交互に繰り返す。'],'肩が浮かない範囲で。痛みがあれば中止。'),
  exercise('figure-four','仰向けでお尻を伸ばす','back','figureFour','stretch',['hip','shoulder'],['仰向けで両膝を曲げ、片足首を反対側の太ももに載せる。','床側の脚の太もも裏を両手で持ち、手前に少し引き寄せる。反対側も同様に。'],'首を持ち上げず、膝を押し広げない。',{level:1,sides:true}),
  exercise('kneel-hinge','膝立ちの股関節曲げ','kneel','kneelHinge','strength',['hip','core','quad'],['両膝を腰幅に開き、膝立ちになる。','お尻を少し後ろへ引き、上体をわずかに前に倒して戻る。'],'腰を丸めず、膝に痛みがあれば飛ばす。')
];

// Phase variants use the same illustrated movement and setup as their source.
function phaseVariant(id,baseId,name,type,steps,extra={}) {
  const base = catalog.find(item=>item.id===baseId);
  catalog.push({...base,id,name,type,steps,...extra});
}

catalog.push(
  exercise('warm-heel','かかとを前へ出す（ヒールディグ）','stand','heelDig','warm',['calf','quad','hip'],['両足で立ち、支える側の膝を軽くゆるめる。','片足のかかとを前に置き、つま先を上げて戻す。左右交互に。'],'一歩を小さくし、バランスを保てるペースで。'),
  exercise('warm-shoulder','小さく肩を回す','stand','shoulderRoll','warm',['shoulder','upper'],['両腕を体の横に下ろす。','肩を前へ数回、後ろへ数回、小さく回す。'],'腕を上げず、肩に痛みが出ない範囲で。'),
  exercise('warm-knee','浅い膝曲げ','stand','kneeBend','warm',['hip','quad','core','shoulder'],['足を肩幅にし、無理のない高さで手を前に出す。','膝を軽く曲げて数センチ下がり、ゆっくり戻る。'],'膝を深く曲げず、手を前に出すと肩が痛む場合は飛ばす。')
);
phaseVariant('warm-sit-hip','sit-hips','足裏を合わせて膝を小さく開く','warm',
  ['床に座って足裏を合わせる。','膝を自然に開く範囲でゆっくり開き、少し戻す。'],{held:false});
phaseVariant('warm-pelvic','pelvic','仰向けで骨盤を軽く動かす','warm',
  ['膝を立てて仰向けになり、背中を楽にする。','腰と床のすき間を小さくして戻す。余計な力を入れずにゆっくり繰り返す。']);
phaseVariant('cool-slide','heel-slide','仰向けでかかとをゆっくり滑らせる','cool',
  ['仰向けで膝を立てる。','左右交互にかかとを滑らせ、動く範囲とペースを少しずつ落とす。']);
phaseVariant('cool-sit-ankles','sit-ankles','足首の動きをゆっくりにする','cool',
  ['床に座り、脚を前に出す。','かかとを床につけたまま、つま先を前後に動かす。次第に動きを小さく、ゆっくりにする。']);
for (const [baseId,id] of [['calf-stretch','cool-calf'],['side-bend','cool-side'],
    ['sit-ham','cool-sit-ham'],['sit-hips','cool-sit-hip'],['back-ham','cool-back-ham']]) {
  const base = catalog.find(item=>item.id===baseId);
  phaseVariant(id,baseId,base.name,'cool',[...base.steps,'軽い張りを感じたら、息を止めずにその姿勢を保つ。'],{held:true});
}

export const exercises = Object.fromEntries(catalog.map(item => [item.id,item]));
