// Joint coordinates in the workit canvas (300 × 230). The floor is at y=201.
// The near side faces right in side views. Front views mirror across x=150.
function figure([head,neck,hip], [ls,le,lh,lp,lk,lf,lt], farSide) {
  const far = ([x,y])=>[x+13,y];
  const [rs,re,rh,rp,rk,rf,rt] = farSide ?? [ls,le,lh,lp,lk,lf,lt].map(far);
  return {head,neck,hip,ls,le,lh,lp,lk,lf,lt,rs,re,rh,rp,rk,rf,rt};
}

const mirror = points=>points.map(([x,y])=>[300-x,y]);
const front = (center,side,other=side)=>figure(center,side,mirror(other));
const stand = figure([[161,39],[156,58],[150,116]],
  [[147,64],[143,95],[143,126],[144,116],[147,158],[145,198],[163,198]]);
const reach = figure([[161,39],[156,58],[150,116]],
  [[147,64],[150,35],[153,11],[144,116],[147,158],[145,198],[163,198]]);
const squat = figure([[178,67],[168,84],[138,135]],
  [[159,91],[179,101],[202,105],[132,135],[171,153],[145,198],[164,198]]);
const squatPulse = figure([[176,60],[168,78],[140,128]],
  [[159,85],[181,94],[205,96],[134,128],[170,151],[145,198],[164,198]]);
const wideStand = front([[150,37],[150,57],[150,115]],
  [[138,66],[125,96],[124,122],[139,115],[122,156],[113,198],[104,198]]);
const sumo = front([[150,65],[150,84],[150,146]],
  [[138,91],[132,121],[146,128],[138,147],[102,155],[99,198],[84,198]]);
const widePulse = front([[150,60],[150,79],[150,141]],
  [[138,86],[128,115],[145,123],[138,141],[105,153],[99,198],[84,198]]);
const narrow = front([[150,42],[150,60],[150,117]],
  [[137,68],[134,99],[136,127],[141,117],[142,158],[143,198],[135,198]]);
const narrowSquat = front([[150,62],[150,82],[150,143]],
  [[137,91],[132,121],[143,126],[141,145],[141,164],[143,198],[135,198]]);
const prisoner = figure([[176,65],[166,83],[137,136]],
  [[158,90],[131,76],[162,55],[130,136],[170,155],[145,198],[164,198]]);
const hinge = figure([[203,87],[185,92],[130,114]],
  [[179,92],[159,75],[190,70],[124,115],[142,155],[143,198],[161,198]]);
const heelRaise = figure([[160,25],[155,44],[149,102]],
  [[146,49],[143,81],[143,113],[143,101],[147,144],[143,181],[159,198]]);
const heelReach = {...heelRaise,le:[151,25],lh:[154,6],re:[164,25],rh:[167,6]};
const jump = figure([[161,18],[157,37],[151,96]],
  [[149,45],[153,31],[159,6],[145,96],[146,137],[144,177],[155,187]]);
const landing = {...squat,head:[175,56],neck:[167,74],hip:[143,125],lp:[137,125],rp:[150,125]};
const lungeStand = figure([[166,38],[159,56],[149,114]],
  [[151,61],[144,92],[144,119],[143,115],[164,153],[181,198],[198,198]],
  [[164,63],[164,98],[157,123],[152,116],[126,155],[103,181],[114,198]]);
const lunge = figure([[168,60],[163,79],[150,140]],
  [[155,85],[145,111],[145,137],[144,139],[185,149],[185,198],[203,198]],
  [[168,85],[167,112],[161,140],[154,140],[126,179],[101,184],[112,198]]);
function swapSides(p) {
  const result = {...p};
  for (const joint of ['s','e','h','p','k','f','t']) {
    result['l'+joint] = p['r'+joint];
    result['r'+joint] = p['l'+joint];
  }
  return result;
}
const lungeOther = swapSides(lunge);
const highKnee = figure([[160,35],[155,55],[150,115]],
  [[147,63],[159,96],[181,78],[144,114],[181,115],[181,152],[197,155]],
  [[163,64],[154,95],[142,123],[156,115],[159,157],[157,198],[175,198]]);
const lateral = figure([[113,64],[116,83],[120,142]],
  [[102,90],[99,119],[120,126],[110,142],[84,155],[86,198],[72,198]],
  [[130,90],[141,118],[128,127],[131,141],[173,164],[207,193],[221,197]]);
const curtsy = front([[150,58],[150,78],[152,133]],
  [[138,85],[120,105],[143,113],[141,133],[129,161],[127,198],[114,198]],
  [[137,85],[126,106],[145,113],[138,133],[149,171],[182,183],[187,198]]);
const deadlift = figure([[214,86],[193,92],[135,108]],
  [[185,94],[182,129],[182,155],[130,109],[144,153],[142,198],[160,198]],
  [[195,91],[196,126],[196,150],[138,106],[92,106],[51,101],[47,117]]);
const jumpingJack = front([[150,21],[150,40],[150,99]],
  [[138,49],[127,27],[137,5],[138,99],[113,136],[93,175],[84,186]]);
const jackOpen = front([[150,38],[150,57],[150,116]],
  [[138,65],[128,36],[140,11],[139,116],[115,156],[96,198],[87,198]]);
const stepJack = front([[159,38],[158,58],[156,116]],
  [[143,66],[136,38],[147,12],[144,116],[119,155],[99,198],[90,198]],
  [[130,66],[119,38],[128,12],[130,116],[132,156],[134,198],[142,198]]);
function reflect(points) {
  return Object.fromEntries(Object.entries(swapSides(points)).map(([joint,[x,y]])=>[joint,[300-x,y]]));
}
const stepJackOther = reflect(stepJack);
const seal = {...jumpingJack,ls:[138,49],le:[105,51],lh:[73,52],rs:[162,49],re:[195,51],rh:[227,52]};
const sealClosed = {...narrow,le:[140,78],lh:[147,68],re:[160,78],rh:[153,68]};
const buttKick = {...stand,lk:[140,154],lf:[114,123],lt:[108,107],le:[154,96],lh:[176,79]};
const hopKnee = Object.fromEntries(Object.entries(highKnee).map(([joint,[x,y]])=>[joint,[x,y-17]]));
const hopButt = Object.fromEntries(Object.entries(buttKick).map(([joint,[x,y]])=>[joint,[x,y-17]]));
const tuck = {...jump,hip:[144,89],lp:[138,90],rp:[151,90],lk:[171,69],rk:[184,69],
  lf:[162,111],rf:[175,111],lt:[173,124],rt:[186,124],le:[173,64],re:[186,64],lh:[195,83],rh:[208,83]};

const plank = figure([[219,106],[201,121],[144,146]],
  [[198,127],[197,160],[197,198],[138,147],[100,168],[62,188],[72,198]]);
const lowPush = figure([[225,153],[207,168],[146,178]],
  [[201,175],[172,167],[197,198],[139,179],[102,182],[62,188],[72,198]]);
const kneePush = figure([[217,109],[202,125],[143,163]],
  [[196,131],[196,164],[197,198],[137,165],[107,198],[68,195],[57,198]]);
const kneePushLow = figure([[223,151],[205,170],[144,184]],
  [[197,175],[168,166],[197,198],[138,184],[107,198],[69,194],[58,198]]);
const pike = figure([[209,129],[194,120],[147,103]],
  [[188,125],[191,164],[197,198],[138,104],[104,140],[68,181],[77,198]]);
const pikeLow = {...pike,head:[221,163],neck:[205,154],ls:[198,151],le:[175,166],rs:[211,151],re:[188,166]};
const forearm = figure([[218,140],[199,153],[145,166]],
  [[193,160],[191,198],[215,198],[138,168],[101,178],[64,188],[74,198]]);
const nearForearm = {...plank,head:[220,128],neck:[201,141],ls:[195,147],le:[192,198],lh:[217,198]};
const farForearm = swapSides(nearForearm);
const plankTap = {...plank,le:[171,152],lh:plank.rs};
const plankTapOther = swapSides(plankTap);
const plankKnee = {...plank,lk:[175,169],lf:[141,188],lt:[152,198]};
const plankKneeOther = swapSides(plankKnee);
const lowClimb = {...forearm,lk:[172,174],lf:[139,190],lt:[149,198]};
const diagonalClimb = {...plank,lk:[188,180],lf:[151,192],lt:[162,198]};
const sideClimb = {...plank,lk:[184,164],lf:[147,183],lt:[155,195]};
const forearmLeg = {...forearm,lk:[99,161],lf:[60,159],lt:[48,167]};
const plankLift = {...plank,lk:[101,151],lf:[59,149],lt:[47,158]};
const plankReach = {...plank,le:[233,127],lh:[263,128]};
const plankRock = {...forearm,hip:[152,163],lp:[145,165],rp:[158,165],
  head:[225,139],neck:[206,152],ls:[201,157],rs:[214,157]};
const plankDip = {...forearm,hip:[145,178],lp:[138,180],rp:[151,172]};
const lowPike = {...forearm,hip:[143,118],lp:[137,119],rp:[150,119],lk:[100,153],rk:[113,153]};
const extendedPlank = {...plank,le:[210,161],re:[223,161],lh:[228,198],rh:[241,198]};
const scapularLow = {...plank,head:[222,113],neck:[205,129],ls:[198,135],rs:[211,135]};
const scapularHigh = {...plank,head:[216,104],neck:[201,117],hip:[142,143]};
const prone = figure([[220,174],[199,183],[135,188]],
  [[193,187],[166,185],[199,198],[128,190],[87,192],[47,196],[35,194]]);
const released = {...prone,le:[174,178],lh:[195,173],re:[187,178],rh:[208,173]};
const cobra = {...prone,head:[213,141],neck:[193,154],ls:[184,161],rs:[197,161],le:[165,182],re:[178,182]};
const supermanStart = {...prone,le:[226,194],re:[239,194],lh:[250,196],rh:[263,196]};
const superman = {...supermanStart,head:[219,156],neck:[200,169],ls:[190,171],rs:[203,171],
  le:[226,168],re:[239,168],lh:[254,165],rh:[267,165],lk:[88,181],rk:[101,181],lf:[47,174],rf:[60,174],lt:[35,174],rt:[48,174]};
const supermanRow = {...superman,le:[159,171],re:[172,171],lh:[176,147],rh:[189,147]};
const quadruped = figure([[206,99],[189,117],[122,129]],
  [[190,124],[190,159],[191,198],[115,129],[116,198],[76,197],[61,198]]);
const donkey = {...quadruped,lk:[82,115],lf:[79,79],lt:[65,80]};
const backKick = {...quadruped,lk:[77,126],lf:[35,124],lt:[29,136]};
const bear = {...quadruped,lk:[119,182],rk:[132,182],lf:[80,188],rf:[93,188],lt:[71,198],rt:[84,198]};
const bearTap = {...bear,le:[161,146],lh:[129,181]};
const bearStep = {...bear,lh:[216,198],le:[204,158],rf:[111,187],rt:[120,195]};
const bearStepOther = swapSides(bearStep);
const frogging = {...bear,hip:[149,121],lp:[143,121],rp:[156,121],lk:[168,159],rk:[181,159],lf:[150,198],rf:[163,198],lt:[167,198],rt:[180,198]};
const burpeeBend = figure([[214,126],[196,139],[143,135]],
  [[188,145],[211,169],[213,198],[137,136],[173,158],[145,198],[163,198]]);
const burpeeHop = {...burpeeBend,head:[223,116],neck:[204,130],hip:[145,116],lp:[138,117],rp:[151,117],
  lk:[118,133],rk:[131,133],lf:[100,163],rf:[113,163],lt:[111,173],rt:[124,173]};
const bridgeDown = figure([[66,182],[85,184],[150,186]],
  [[90,187],[123,194],[150,198],[147,185],[183,147],[201,198],[221,198]]);
const bridgeUp = {...bridgeDown,hip:[154,147],lp:[149,149],rp:[162,149],lk:[187,131],rk:[200,131]};
const bridgePulse = {...bridgeUp,hip:[154,155],lp:[149,156],rp:[162,156]};
const bridgeOneUp = {...bridgeUp,lk:[192,137],lf:[232,128],lt:[242,136]};
const bridgeOneDown = {...bridgeDown,lk:[191,167],lf:[229,153],lt:[239,161]};
const bridgeLift = {...bridgeUp,lk:[162,103],lf:[197,106],lt:[208,113]};
const backFlat = {...bridgeDown,lk:[192,191],rk:[205,191],lf:[235,198],rf:[248,198],lt:[253,198],rt:[266,198]};
const tabletop = {...bridgeDown,lk:[153,144],rk:[166,144],lf:[194,144],rf:[207,144],lt:[203,155],rt:[216,155]};
const legsUp = {...bridgeDown,lk:[153,144],rk:[166,144],lf:[154,103],rf:[167,103],lt:[164,94],rt:[177,94]};
const legsLow = {...backFlat,lk:[189,174],rk:[202,174],lf:[230,159],rf:[243,159],lt:[247,157],rt:[260,157]};
const crunched = {...bridgeDown,head:[93,147],neck:[107,162],ls:[112,166],rs:[125,166],
  le:[94,176],re:[107,175],lh:[87,151],rh:[100,151]};
const curlHip = {...tabletop,hip:[143,169],lp:[137,169],rp:[150,169],lk:[126,130],rk:[139,130],lf:[166,120],rf:[179,120],lt:[179,131],rt:[192,131]};
const bicycle = {...crunched,hip:[149,184],lp:[143,185],rp:[156,185],le:[140,160],lh:[108,155],
  lk:[151,146],lf:[192,148],lt:[201,160],rk:[193,177],rf:[233,164],rt:[249,167]};
const hollow = {...legsLow,head:[76,159],neck:[91,174],ls:[101,173],rs:[114,173],le:[79,158],re:[92,158],lh:[46,154],rh:[59,154]};
const situp = figure([[127,67],[127,86],[144,184]],
  [[120,94],[145,115],[169,123],[137,185],[177,143],[196,198],[215,198]]);
const sitTwist = {...situp,head:[132,82],neck:[135,101],ls:[125,109],rs:[145,109],
  le:[126,140],re:[149,139],lh:[151,156],rh:[151,156]};
const sitTwistOther = {...sitTwist,le:[117,132],re:[125,127],lh:[102,126],rh:[102,126]};
const sidePlank = figure([[218,114],[197,125],[139,154]],
  [[193,131],[194,198],[222,198],[135,155],[94,175],[57,191],[65,198]],
  [[191,126],[190,155],[154,151],[141,153],[96,170],[62,186],[71,193]]);
const sideDip = {...sidePlank,hip:[139,177],lp:[135,178],rp:[141,176],lk:[95,183],rk:[97,180]};
const sideReach = {...sidePlank,re:[185,104],rh:[174,72]};
const sideUnder = {...sidePlank,re:[165,151],rh:[170,177],neck:[198,130]};
const sideCrunch = {...sidePlank,re:[155,147],rh:[171,121],rk:[151,148],rf:[120,172],rt:[112,179]};
const chairDip = figure([[145,65],[142,84],[140,145]],
  [[135,89],[116,118],[112,142],[135,145],[170,161],[189,198],[207,198]]);
const chairDipLow = {...chairDip,head:[147,86],neck:[145,107],hip:[140,165],ls:[136,113],rs:[149,113],
  le:[106,121],re:[119,121],lp:[135,165],rp:[148,165]};
const wallSit = figure([[122,68],[124,89],[130,151]],
  [[132,93],[141,122],[167,137],[126,152],[170,151],[173,198],[191,198]]);
const wallOne = {...wallSit,lk:[171,153],lf:[215,151],lt:[229,158]};
const plankFootOut = {...plank,lk:[89,162],lf:[47,188],lt:[57,198]};
const plankFeetOut = {...plankFootOut,rk:[119,175],rf:[93,188],rt:[102,198]};
const plankFarFootOut = {...plank,rk:plankFeetOut.rk,rf:plankFeetOut.rf,rt:plankFeetOut.rt};
const plankHopOut = {...plankFeetOut,lf:[49,176],rf:[91,176],lt:[59,185],rt:[100,185]};
const plankHopIn = {...plank,lf:[61,177],rf:[76,177],lt:[70,186],rt:[85,186]};
const splitJump = {...jump,lp:[145,96],rp:[158,96],lk:[163,131],rk:[144,133],lf:[159,169],rf:[132,172]};
const sidePlankShift = {...sidePlank,hip:[139,148],lp:[135,149],rp:[141,148]};
const kneeling = figure([[164,65],[156,85],[151,145]],
  [[149,93],[145,122],[142,146],[145,145],[145,198],[103,193],[91,198]]);
const kneelingLean = figure([[121,67],[129,86],[145,148]],
  [[127,96],[145,115],[160,114],[138,149],[145,198],[103,193],[91,198]]);
const halfKneel = {...lunge,rk:[120,198],rf:[78,192],rt:[71,198]};
const reversePlank = figure([[102,91],[115,111],[160,151]],
  [[112,118],[99,155],[86,198],[154,149],[193,173],[232,198],[236,182]]);
const reverseKnee = {...reversePlank,lk:[160,104],lf:[193,117],lt:[204,128]};
const jackWideSquat = {...sumo,le:[122,129],re:[178,129],lh:[128,178],rh:[172,178]};
const skaterStart = {...lateral,rk:[119,166],rf:[152,190],rt:[162,196],rh:[88,171]};
const skaterOther = reflect(skaterStart);
const skaterAir = {...narrow,head:[150,26],neck:[150,44],hip:[150,102],
  lk:[135,141],rk:[168,144],lf:[122,179],rf:[176,176],lt:[114,179],rt:[183,179]};
const walkHands = {...burpeeBend,lh:[238,198],le:[228,165]};
const extendedArms = {...released,le:[169,174],re:[182,174],lh:[149,167],rh:[161,165]};
const widePush = {...plank,rs:[205,122],re:[219,157],rh:[225,198],le:[181,159],lh:[166,198]};
const lowWidePush = {...lowPush,rs:[212,164],re:[234,172],rh:widePush.rh,le:[152,175],lh:widePush.lh};
const diamondStart = {...plank,le:[190,165],re:[207,165],lh:[202,198],rh:[211,198]};
const diamondLow = {...lowPush,le:[173,170],re:[186,170],lh:diamondStart.lh,rh:diamondStart.rh};
const kneePushPulse = {...kneePushLow,head:[222,140],neck:[204,157],ls:[197,163],rs:[210,163]};
const floorDip = {...chairDip,hip:[151,157],lp:[145,158],rp:[158,158],le:[110,144],re:[123,144],lh:[100,198],rh:[113,198]};
const floorDipLow = {...floorDip,head:[145,93],neck:[143,111],hip:[151,182],lp:[145,182],rp:[158,182],
  ls:[135,115],rs:[148,115],le:[104,149],re:[117,149]};
const reverseTable = {...floorDip,hip:[151,134],lp:[145,136],rp:[158,136],lk:[183,148],rk:[196,148]};
const hollowOne = {...hollow,lk:[152,145],lf:[191,147],lt:[198,164]};
const flutter = {...legsLow,lk:[188,162],lf:[226,144],lt:[243,140],rk:[202,182],rf:[243,179],rt:[261,176]};
const scissor = {...legsLow,lk:[182,153],lf:[214,130],lt:[230,120],rk:[202,187],rf:[243,181],rt:[261,179]};
const crunchPulse = {...crunched,head:[94,141],neck:[109,156],ls:[115,160],rs:[128,160]};
const raisedTuck = {...sitTwist,lk:[162,141],rk:[175,141],lf:[198,163],rf:[211,163],lt:[215,163],rt:[228,163]};
const crunchStar = {...crunched,lk:[153,149],rk:[166,149],lf:[190,166],rf:[203,166],lt:[203,176],rt:[216,176],
  le:[131,147],re:[144,147],lh:[163,153],rh:[175,153]};
const star = {...backFlat,lh:[40,170],rh:[59,176],le:[72,174],re:[85,180],rk:[192,184],rf:[235,188],rt:[250,196]};
const starTap = {...star,head:[100,153],neck:[116,167],ls:[122,169],rs:[135,169],
  le:[149,142],lh:[174,119],rk:[174,143],rf:[194,116],rt:[177,112]};
const lungePulse = {...lunge,head:[168,55],neck:[163,74],hip:[150,134],lp:[144,134],rp:[154,134]};
const curtsyPulse = {...curtsy,head:[150,54],neck:[150,74],hip:[152,127],lp:[141,127],rp:[162,127]};
const child = {...quadruped,hip:[96,169],lp:[91,169],rp:[104,169],head:[169,157],neck:[152,163],
  ls:[147,167],rs:[160,167],le:[183,180],re:[196,180],lh:[214,198],rh:[227,198]};
const plankLiftLow = {...lowPush,lk:[100,160],lf:[59,155],lt:[47,162]};
const supermanSweep = {...superman,le:[160,171],re:[173,171],lh:[127,179],rh:[140,179]};
const raisedTwist = {...raisedTuck,le:[127,148],re:[142,145],lh:[159,155],rh:[159,155]};
const raisedTwistOther = {...raisedTuck,le:[108,141],re:[119,135],lh:[91,136],rh:[91,136]};
const plankLateral = Object.fromEntries(Object.entries(plank).map(([key,[x,y]])=>[key,[x-18,y]]));
const lateralWalkOut = {...sumo,lk:[86,151],lf:[77,198],lt:[63,198],hip:[134,141],lp:[122,142],rp:[146,142]};
const lateralWalkIn = Object.fromEntries(Object.entries(sumo).map(([key,[x,y]])=>[key,[x-22,y]]));
const prisonerStand = {...stand,le:[132,67],re:[145,67],lh:[155,45],rh:[168,45]};
const reverseStand = {...stand,rk:[128,150],rf:[103,181],rt:[114,198],hip:[150,119]};
const donkeyPulse = {...donkey,lk:[86,122],lf:[81,85],lt:[67,89]};
const wallStart = {...stand,head:[122,40],neck:[120,59],hip:[125,118],lp:[120,118],rp:[133,118],
  ls:[125,66],rs:[138,66],le:[127,97],re:[140,97],lh:[135,128],rh:[148,128],
  lk:[146,160],rk:[159,160],lf:[173,198],rf:[186,198],lt:[191,198],rt:[204,198]};
const sealGround = {...jackOpen,ls:[138,65],rs:[162,65],le:[105,68],re:[195,68],lh:[73,69],rh:[227,69]};
const stepToPlank = {...plank,lk:[159,167],lf:[142,192],lt:[154,198]};
const boxing = {...stand,le:[158,89],re:[169,92],lh:[170,64],rh:[181,73]};
const punch = {...boxing,le:[183,66],lh:[216,67]};
const ropeStand = {...stand,le:[127,94],re:[183,91],lh:[113,111],rh:[195,106]};
const ropeAir = Object.fromEntries(Object.entries(ropeStand).map(([key,[x,y]])=>[key,[x,y-15]]));
const frogstand = {...frogging,head:[226,129],neck:[211,145],hip:[153,130],lp:[147,132],rp:[160,133],
  ls:[202,148],rs:[215,148],le:[183,159],re:[196,159],lh:[211,198],rh:[224,198],
  lk:[183,152],rk:[196,152],lf:[153,172],rf:[166,172],lt:[140,175],rt:[153,175]};
const starAir = {...seal,head:[150,19],hip:[150,97],le:[109,37],re:[191,37],lh:[80,26],rh:[220,26],
  lk:[113,129],rk:[187,129],lf:[89,163],rf:[211,163],lt:[77,170],rt:[223,170]};
const thrusterReady = {...stand,le:[174,89],re:[186,89],lh:[164,66],rh:[176,66]};
const thrusterSquat = {...squat,le:[183,110],re:[196,110],lh:[174,92],rh:[187,92]};
const pushPikeToe = {...pike,le:[154,131],lh:pike.rf};
const cobraPulse = {...cobra,head:[216,150],neck:[195,162],ls:[185,168],rs:[198,168]};
const armsProne = {...superman,lk:prone.lk,rk:prone.rk,lf:prone.lf,rf:prone.rf,lt:prone.lt,rt:prone.rt};
const heelTouch = {...crunched,ls:[112,166],le:[145,177],lh:[178,195],rs:[120,167],re:[148,175],rh:[173,186]};
const reverseCrunchUp = {...curlHip,lk:[146,127],rk:[159,127],lf:[148,85],rf:[161,85],lt:[158,75],rt:[171,75]};
const narrowPulse = {...narrowSquat,head:[150,56],neck:[150,76],hip:[150,137],lp:[141,139],rp:[159,139]};
const bearDonkey = {...bear,lk:[84,115],lf:[81,81],lt:[68,81]};
const oneBridgePulse = {...bridgeOneUp,hip:[154,154],lp:[149,155],rp:[162,155]};
const oneBurpee = {...burpeeBend,rk:[152,166],rf:[111,166],rt:[104,176]};
const onePlank = {...plank,rk:[107,156],rf:[74,151],rt:[63,158]};
const oneProne = {...prone,rk:[103,176],rf:[62,163],rt:[52,172]};
const oneJump = {...jump,rk:[169,125],rf:[169,155],rt:[180,164]};
const floorDipPulse = {...floorDipLow,head:[145,88],neck:[143,106],hip:[151,177],
  lp:[145,177],rp:[158,177],ls:[135,111],rs:[148,111]};
const butterflyBack = {...bridgeDown,lk:[166,195],rk:[208,181],lf:[196,194],rf:[214,193],lt:[207,198],rt:[208,198]};
const butterflyCrunch = {...crunched,lk:butterflyBack.lk,rk:butterflyBack.rk,
  lf:butterflyBack.lf,rf:butterflyBack.rf,lt:butterflyBack.lt,rt:butterflyBack.rt};
const sitPunch = {...situp,le:[158,108],lh:[188,102],re:[141,114],rh:[153,88]};
const backKickPulse = {...backKick,lk:[77,131],lf:[35,134],lt:[29,145]};
const squatStep = {...squat,lk:[174,144],lf:[169,177],lt:[188,186]};
const squatStepOther = {...swapSides(squatStep),hip:[144,135],lp:[137,135],rp:[150,135]};
const quickStep = {...landing,lk:[164,153],lf:[147,178],lt:[162,185],
  le:[177,96],lh:[196,81],re:[150,103],rh:[145,126]};
const bearWalkStep = {...bear,le:[213,153],lh:[235,198],hip:[131,131],lp:[125,131],rp:[138,131]};

export const hiitPosesForDrawing = {
  stand, reach, squat, squatPulse, wideStand, sumo, widePulse, narrow, narrowSquat, prisoner, hinge,
  heelRaise, heelReach, jump, landing, lungeStand, lunge, lungeOther, lungeStandOther:swapSides(lungeStand),
  highKnee, highKneeOther:swapSides(highKnee), lateral, lateralOther:reflect(lateral), curtsy,
  curtsyOther:reflect(curtsy), deadlift, deadliftOther:swapSides(deadlift), jumpingJack, jackOpen, stepJack,
  stepJackOther, seal, sealClosed, buttKick, buttKickOther:swapSides(buttKick), hopKnee,
  hopKneeOther:swapSides(hopKnee), hopButt, hopButtOther:swapSides(hopButt), tuck, plank, lowPush, kneePush,
  kneePushLow, pike, pikeLow, forearm, nearForearm, farForearm, plankTap, plankTapOther, plankKnee,
  plankKneeOther, lowClimb, lowClimbOther:swapSides(lowClimb), diagonalClimb,
  diagonalClimbOther:swapSides(diagonalClimb), sideClimb, sideClimbOther:swapSides(sideClimb), forearmLeg,
  forearmLegOther:swapSides(forearmLeg), plankLift, plankLiftOther:swapSides(plankLift), plankReach,
  plankReachOther:swapSides(plankReach), plankRock, plankDip, plankDipOther:swapSides(plankDip), lowPike,
  extendedPlank, scapularLow, scapularHigh, prone, released, cobra, supermanStart, superman, supermanRow,
  quadruped, donkey, donkeyOther:swapSides(donkey), backKick, backKickOther:swapSides(backKick), bear,
  bearTap, bearTapOther:swapSides(bearTap), bearStep, bearStepOther, frogging, burpeeBend, burpeeHop,
  bridgeDown, bridgeUp, bridgePulse, bridgeOneUp, bridgeOneDown, bridgeOneUpOther:swapSides(bridgeOneUp),
  bridgeOneDownOther:swapSides(bridgeOneDown), bridgeLift, bridgeLiftOther:swapSides(bridgeLift), backFlat,
  tabletop, legsUp, legsLow, crunched, curlHip, bicycle, bicycleOther:swapSides(bicycle), hollow, situp,
  sitTwist, sitTwistOther, sidePlank, sideDip, sideReach, sideUnder, sideCrunch, chairDip, chairDipLow,
  wallSit, wallOne, wallOther:swapSides(wallOne), plankFootOut, plankFeetOut, plankFarFootOut, plankHopOut,
  plankHopIn, splitJump, sidePlankShift, kneeling, kneelingLean, halfKneel, reversePlank, reverseKnee,
  reverseKneeOther:swapSides(reverseKnee), jackWideSquat, skaterStart, skaterOther, skaterAir, walkHands,
  extendedArms, widePush, lowWidePush, diamondStart, diamondLow, kneePushPulse, floorDip, floorDipLow,
  reverseTable, hollowOne, hollowOneOther:swapSides(hollowOne), flutter, flutterOther:swapSides(flutter),
  scissor, scissorOther:swapSides(scissor), crunchPulse, raisedTuck, crunchStar, star, lungePulse,
  lungePulseOther:swapSides(lungePulse), curtsyPulse, curtsyPulseOther:reflect(curtsyPulse), child,
  plankLiftLow, plankLiftLowOther:swapSides(plankLiftLow), supermanSweep, raisedTwist, raisedTwistOther,
  sidePlankOther:reflect(sidePlank), sideDipOther:reflect(sideDip),
  sidePlankShiftOther:reflect(sidePlankShift), sideReachOther:reflect(sideReach),
  sideUnderOther:reflect(sideUnder), sideCrunchOther:reflect(sideCrunch), plankLateral, lateralWalkOut,
  lateralWalkIn, prisonerStand, reverseStand, reverseStandOther:swapSides(reverseStand), donkeyPulse,
  donkeyPulseOther:swapSides(donkeyPulse), wallStart, sealGround, stepToPlank, boxing, punch,
  punchOther:swapSides(punch), ropeStand, ropeAir, frogstand, starAir, thrusterReady, thrusterSquat,
  pushPikeToe, pushPikeToeOther:swapSides(pushPikeToe), cobraPulse, armsProne, heelTouch,
  heelTouchOther:swapSides(heelTouch), reverseCrunchUp, narrowPulse, bearDonkey,
  bearDonkeyOther:swapSides(bearDonkey), oneBridgePulse, oneBridgePulseOther:swapSides(oneBridgePulse),
  oneBurpee, oneBurpeeOther:swapSides(oneBurpee), onePlank, onePlankOther:swapSides(onePlank), oneProne,
  oneProneOther:swapSides(oneProne), oneJump, oneJumpOther:swapSides(oneJump), floorDipPulse, butterflyBack,
  butterflyCrunch, sitPunch, sitPunchOther:swapSides(sitPunch), backKickPulse,
  backKickPulseOther:swapSides(backKickPulse), squatStep, squatStepOther, starTap,
  starTapOther:swapSides(starTap), quickStep, quickStepOther:swapSides(quickStep), bearWalkStep
};
