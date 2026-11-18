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
const sitting = { head:[136,67], neck:[136,86], hip:[137,158], ls:[124,93], rs:[147,93], le:[117,126], re:[163,124], lh:[115,154], rh:[174,148], lk:[166,178], rk:[200,173], lf:[194,195], rf:[223,195] };
const supine = { head:[67,181], neck:[86,185], hip:[157,186], ls:[89,189], rs:[99,179], le:[117,194], re:[123,182], lh:[142,195], rh:[148,182], lk:[185,143], rk:[192,135], lf:[215,197], rf:[220,190] };
const all4 = { head:[211,105], neck:[195,121], hip:[124,125], ls:[193,128], rs:[183,122], le:[194,160], re:[181,149], lh:[194,196], rh:[181,188], lk:[124,193], rk:[110,184], lf:[89,196], rf:[79,188] };
const kneel = { head:[150,62], neck:[150,81], hip:[151,130], ls:[139,87], rs:[160,87], le:[136,111], re:[164,111], lh:[137,131], rh:[166,130], lk:[143,192], rk:[162,187], lf:[101,196], rf:[121,190] };
const bases = {stand:standing, sit:sitting, back:supine, all4, kneel};
const motions = {
  march: [{rk:[177,135],rf:[180,168]}, {lk:[124,135],lf:[119,169]}],
  toe: [{rk:[165,160],rf:[185,195]}, {lk:[128,157],lf:[108,195]}],
  squat: [{}, {head:[153,58],neck:[153,79],ls:[141,85],rs:[166,85],le:[136,109],re:[168,108],lh:[144,119],rh:[159,119],hip:[151,145],lk:[125,167],rk:[178,167]}],
  calf: [{}, {head:[151,29],neck:[151,50],ls:[140,56],rs:[162,56],le:[135,86],re:[168,86],lh:[136,109],rh:[169,109],hip:[151,113],lk:[139,148],rk:[164,148],lf:[146,189],rf:[174,189]}],
  side: [{}, {rk:[189,151],rf:[213,181]}],
  push: [{head:[191,48],neck:[184,66],ls:[193,71],rs:[174,70],le:[219,86],re:[208,87],lh:[241,98],rh:[240,103],hip:[162,119],lk:[148,157],rk:[157,152],lf:[133,196],rf:[144,191]}, {head:[221,47],neck:[211,65],ls:[215,76],rs:[202,71],le:[197,107],re:[190,101],lh:[241,98],rh:[240,103],hip:[183,119],lk:[157,157],rk:[165,153],lf:[133,196],rf:[144,191]}],
  step: [{rk:[185,142],rf:[205,173]}, {head:[191,16],neck:[191,36],ls:[178,43],rs:[201,44],le:[175,70],re:[205,69],lh:[176,95],rh:[204,92],hip:[193,98],lk:[202,136],rk:[212,136],lf:[205,173],rf:[222,173]}],
  calfStretch: [{lh:[237,97],rh:[241,105],le:[191,111],re:[201,114],lk:[126,157],lf:[106,197],rk:[179,162],rf:[180,197]}, {head:[174,39],neck:[167,60],rs:[180,68],ls:[159,66],lh:[237,97],rh:[241,105],le:[205,99],re:[212,107],hip:[154,125],lk:[126,158],lf:[106,197],rk:[194,161],rf:[180,197]}],
  reach: [{}, {head:[133,44],neck:[138,64],ls:[127,70],rs:[149,68],le:[126,94],re:[152,94],lh:[127,116],rh:[156,117]}],
  sitPress: [{rk:[185,190],rf:[235,196]}, {rk:[185,190],rf:[235,185]}],
  sitMarch: [{}, {rk:[211,151],rf:[226,175]}],
  pelvic: [{}, {hip:[157,179],lk:[183,142],rk:[190,134]}],
  sitAnkle: [{}, {rf:[223,186],lf:[194,190]}],
  sitTurn: [{}, {head:[127,68],neck:[133,86],ls:[120,96],rs:[140,89],le:[110,124],re:[148,117],lh:[111,151],rh:[153,148]}],
  sitHam: [{rk:[187,192],rf:[240,196]}, {rk:[187,192],rf:[240,196],head:[159,79],neck:[149,94],ls:[137,101],rs:[160,100],le:[147,128],re:[176,129],lh:[168,151],rh:[189,150]}],
  sitHip: [{lk:[157,179],rk:[180,175],lf:[199,194],rf:[198,188]}, {lk:[154,187],rk:[179,181],lf:[199,194],rf:[198,188]}],
  breatheBack: [{}, {neck:[86,182],rs:[99,175],re:[123,178],rh:[148,179]}],
  slide: [{}, {rk:[211,178],rf:[256,192]}],
  bridge: [{}, {hip:[157,153],ls:[89,187],rs:[99,177],lk:[185,138],rk:[193,133]}],
  fallout: [{}, {rk:[206,165],rf:[220,190]}],
  band: [{}, {lk:[170,155],rk:[209,144]}],
  rock: [{}, {head:[192,109],neck:[176,125],hip:[103,149],ls:[176,133],rs:[166,124],le:[184,164],re:[172,151]}],
  bird: [{}, {rh:[242,117],re:[211,120],lk:[86,130],lf:[51,132]}],
  kneelShift: [{}, {head:[167,62],neck:[164,81],hip:[157,130],ls:[153,87],rs:[174,87],le:[150,111],re:[178,111],lh:[151,131],rh:[180,130]}],
  kneelHinge: [{}, {head:[187,81],neck:[173,96],hip:[136,139],ls:[163,102],rs:[183,101],le:[151,122],re:[170,120],lh:[144,141],rh:[158,140]}]
};
export function frames(exercise) {
  return motions[exercise.motion].map(points => ({ ...bases[exercise.pose], ...points }));
}

function exercise(id, name, pose, motion, type, load, steps, cue, extra = {}) {
  return { id, name, pose, motion, type, load, steps, cue, gear: [], level: 0, ...extra };
}

export const catalog = [
  exercise('march','その場で足踏み','stand','march','warm',['hip','quad','calf'],['足を腰幅に開いて立つ。','左右の足を交互に少し上げる。話せる程度のペースで。'],'足元の物を片付け、歩幅は小さく。'),
  exercise('toe','左右に軽くつま先タッチ','stand','toe','cool',['hip','calf'],['足を腰幅に開いて立つ。','片足を横に軽く出して戻す。左右交互に、徐々にゆっくり。'],'足に体重を乗せず、軽く触れるだけ。'),
  exercise('sit-ankles','座って足首を動かす','sit','sitAnkle','warm',['calf'],['床に座り、脚を楽に前に出す。','かかとを床につけたまま、つま先を手前と向こうにゆっくり動かす。'],'姿勢を保ちにくければ飛ばす。'),
  exercise('sit-breathe','座って呼吸を整える','sit','sitTurn','cool',[],['床に楽な姿勢で座る。','肩を脱力し、呼吸を止めず、ゆっくり吐く。'],'図の動きは小さくてよい。息が苦しければ中止。',{still:true}),
  exercise('heel-slide','仰向けでかかとを滑らせる','back','slide','warm',['hip','quad','ham'],['仰向けで膝を立てる。','片脚のかかとを床に沿って滑らせ、戻す。左右交互に。'],'腰を反らさず、動きは小さく。'),
  exercise('back-breathe','仰向けで呼吸を整える','back','breatheBack','cool',[],['仰向けで膝を立て、足裏を床につける。','体の力を抜き、自然な呼吸に合わせてゆっくり吐く。'],'息を止めず、無理に深く吸わない。'),
  exercise('rock-warm','四つん這いで小さく体重移動','all4','rock','warm',['shoulder','core','hip','quad'],['手を肩の下、膝を腰の下に置く。','背中を保ち、お尻を少し後ろへ動かして戻る。'],'手首や膝に痛みがあれば飛ばす。'),
  exercise('rock-cool','四つん這いでゆっくり体重移動','all4','rock','cool',['shoulder','core','hip','quad'],['手と膝で支え、お尻を少し後ろへ。','動く範囲を小さくし、ゆっくり戻す。'],'手首や膝に痛みがあれば飛ばす。'),
  exercise('kneel-warm','膝立ちで小さく体重移動','kneel','kneelShift','warm',['hip','core','quad'],['両膝を腰幅に開いて膝立ちになる。','上体を立てたまま、体重を左右に少しずつ移す。'],'膝を置く面を確かめ、バランスが取りにくければ飛ばす。'),
  exercise('kneel-cool','膝立ちで呼吸を整える','kneel','kneelShift','cool',['quad'],['両膝を腰幅に開き、安定した膝立ちになる。','体の力を抜いてゆっくり呼吸する。'],'膝や腰がつらければ飛ばす。',{still:true}),
  exercise('squat','浅いスクワット','stand','squat','strength',['hip','quad'],['足を腰幅ほどに開く。','お尻を後ろに引き、膝を少し曲げて立ち直る。'],'膝とつま先の向きをそろえ、深くしゃがみ込まない。'),
  exercise('calf','壁につかまってかかと上げ','stand','calf','strength',['calf'],['壁に指先を添え、足を腰幅に開く。','両かかとをゆっくり上げ、同じペースで下ろす。'],'手に体重をかけず、高く上げすぎない。',{gear:['wall']}),
  exercise('leg-out','立って脚を横に上げる','stand','side','strength',['hip','core'],['壁に手を軽く添え、背すじを伸ばす。','片脚を横に少し上げて下ろす。途中で反対側に替える。'],'つま先を正面に向け、上体を傾けない。',{gear:['wall'],sides:true}),
  exercise('wall-push','壁腕立て伏せ','stand','push','strength',['shoulder','chest','core'],['壁から腕一本分ほど離れ、両手を胸の高さに置く。','体を一直線に保ち、肘を曲げて壁に近づき、押し戻す。'],'肩に痛みがあれば中止。息を止めない。',{gear:['wall']}),
  exercise('step-up','低い踏み台の昇り降り','stand','step','strength',['hip','quad','calf'],['低く、滑らず、ぐらつかない踏み台の前に立つ。','片足の足裏全体を載せて両足で上がり、片足ずつ下りる。途中で先に出す足を替える。'],'踏み台の端を踏まず、急がない。',{gear:['step'],level:1,sides:true}),
  exercise('calf-stretch','壁を使うふくらはぎ伸ばし','stand','calfStretch','stretch',['calf'],['壁に手を添え、片足を後ろへ。','後ろ足のかかとを床につけたまま、前の膝を少し曲げる。'],'後ろ足のつま先を正面へ。反動をつけない。',{gear:['wall'],sides:true}),
  exercise('side-bend','立って体を横に傾ける','stand','reach','stretch',['core'],['足を腰幅に開き、腕を体の横に下ろす。','片手を太ももに沿わせ、体を少し横に傾ける。'],'前に倒れたり、腰をひねったりしない。',{sides:true}),
  exercise('sit-press','座って太ももの前に力を入れる','sit','sitPress','strength',['quad'],['床に座り、片脚を前に伸ばす。','伸ばした膝の裏を床へ軽く押し、ゆるめる。途中で反対側に替える。'],'膝を強く押し込まず、息を止めない。',{sides:true}),
  exercise('sit-march','座って片膝を少し持ち上げる','sit','sitMarch','strength',['hip','core'],['床に座り、両膝を楽に曲げる。','片足を少し浮かせ、そっと床に戻す。途中で反対側に替える。'],'上体を後ろに倒さず、安定しなければ飛ばす。',{sides:true}),
  exercise('sit-ham','床に座って太もも裏を伸ばす','sit','sitHam','stretch',['ham','core'],['片脚を前に伸ばし、反対の脚は楽に曲げる。','背すじを保ち、股関節から上体を少し前に傾ける。'],'つま先に手が届くまで曲げる必要はない。',{sides:true}),
  exercise('sit-hips','足裏を合わせて股関節を伸ばす','sit','sitHip','stretch',['hip'],['床に座り、無理なく両足の裏を合わせる。','背すじを伸ばし、膝は自然に開く範囲で保つ。'],'手で膝を押さない。痛みのない範囲で。'),
  exercise('sit-turn','座って上体を軽く回す','sit','sitTurn','stretch',['core','upper'],['床に楽な姿勢で座る。','腰は正面に保ち、胸を片側に少し向ける。'],'腕で引っ張って回さない。',{sides:true}),
  exercise('bridge','仰向けのお尻上げ','back','bridge','strength',['hip','ham','core'],['仰向けで膝を立て、足裏を床につける。','足裏で床を押してお尻を少し持ち上げ、ゆっくり下ろす。'],'腰を反らさず、首で体を支えない。'),
  exercise('band-open','仰向けでバンドを使って膝を開く','back','band','strength',['hip'],['輪状バンドを膝より少し上に置き、仰向けで膝を立てる。','足裏を床につけたまま膝を少し外に開き、ゆっくり戻す。'],'伸ばし切らず、ずれや傷があれば外す。輪がゆるく抵抗が出ない場合は飛ばす。',{gear:['band']}),
  exercise('pelvic','仰向けで骨盤を小さく傾ける','back','pelvic','strength',['core'],['仰向けで膝を立てる。','息を吐きながら下腹部に軽く力を入れ、腰と床のすき間を小さくして戻す。'],'足で床を強く押さない。'),
  exercise('fallout','仰向けで片膝を外へ倒す','back','fallout','stretch',['hip'],['仰向けで両膝を立てる。','骨盤を正面に保ち、片膝だけを少し外に倒す。'],'膝を床につけようと押さない。',{sides:true}),
  exercise('bird','四つん這いで片腕と反対の脚を伸ばす','all4','bird','strength',['shoulder','hip','core','upper'],['手を肩の下、膝を腰の下に置く。','片腕を前へ、反対側の脚を後ろへゆっくり伸ばす。途中で反対側に替える。'],'腰を反らさず、手足を高く上げない。',{level:1,sides:true}),
  exercise('rock-stretch','四つん這いでお尻を後ろに引く','all4','rock','stretch',['hip','core','shoulder','quad'],['手と膝を床につける。','手の位置を保ち、お尻をかかとに向けて少し引く。'],'肩や膝がつらくなる手前で止める。'),
  exercise('kneel-hinge','膝立ちの股関節曲げ','kneel','kneelHinge','strength',['hip','core','quad'],['両膝を腰幅に開き、膝立ちになる。','お尻を少し後ろへ引き、上体をわずかに前に倒して戻る。'],'腰を丸めず、膝に痛みがあれば飛ばす。')
];

export const exercises = Object.fromEntries(catalog.map(item => [item.id,item]));
