export const references = {
  jpStrength: ['厚生労働省「筋力トレーニングについて」','https://kennet.mhlw.go.jp/information/information/exercise/s-00-005.html'],
  aha: ['American Heart Association「Warm Up, Cool Down」','https://www.heart.org/en/healthy-living/exercise-and-physical-activity/fitness-basics/warm-up-cool-down'],
  cdc: ['CDC「Measuring Physical Activity Intensity」','https://www.cdc.gov/physical-activity-basics/measuring/index.html'],
  nhsWarm: ['NHS「How to warm up before exercising」','https://www.nhs.uk/live-well/exercise/how-to-warm-up-before-exercising/'],
  nhsStrength: ['NHS「Strength exercises」','https://www.nhs.uk/live-well/exercise/strength-exercises/'],
  nhsCool: ['NHS「Cool-down video」','https://www.nhs.uk/live-well/exercise/strength-and-resistance/body-blast-cool-down/'],
  nhsStretch: ['NHS「How to stretch after exercising」','https://www.nhs.uk/live-well/exercise/how-to-stretch-after-exercising/'],
  ace: ['ACE「Exercise Library」','https://www.acefitness.org/resources/everyone/exercise-library/experience/beginner/'],
  hip: ['Cambridge University Hospitals「Hip strengthening exercises」','https://www.cuh.nhs.uk/patient-information/hip-strengthening-exercises/'],
  spine: ['Cambridge University Hospitals「Spinal Range of Movement/Stretching Exercises」','https://www.cuh.nhs.uk/patient-information/spinal-range-of-movementstretching-exercises/'],
  step: ['Mayo Clinic「Step-up exercise」','https://www.mayoclinic.org/healthy-lifestyle/fitness/multimedia/step-up/vid-20084661'],
  core: ['Mayo Clinic「Exercises to improve your core strength」','https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/core-strength/art-20546851'],
  hipAbduction: ['AAOS「Hip Conditioning Program」','https://www.orthoinfo.org/globalassets/pdfs/hip-conditioning-rehab-program-2025.pdf'],
  hips: ['NASM「Static Butterfly Stretch」','https://www.nasm.org/resource-center/exercise-library/static-butterfly-stretch'],
  knees: ['Gateshead Health NHS「Lower Limb Non-Weight Bearing and Stair Technique」','https://www.gatesheadhealth.nhs.uk/resources/lower-limb-non-weight-bearing-and-stair-technique/'],
  floor: ['Worcestershire Acute Hospitals NHS「Self-directed rehabilitation and information pack」','https://www.worcsacute.nhs.uk/documents/documents/patient-information-leaflets-a-z/self-directed-rehabilitation-and-information-pack/?layout=file'],
  rock: ['Summit Orthopedics「Hip Arthroscopy Rehabilitation」','https://www.summitortho.com/wp-content/uploads/2014/11/All-Phases_Hip-Arthroscopy-Rehabilitation_with-PT-notes_11-14.pdf'],
  iowa: ['University of Iowa「Lower Body Stretches」','https://chtc.sites.uiowa.edu/lower-body-stretches'],
  aceButterfly: ['ACE「Seated Butterfly Stretch」','https://www.acefitness.org/resources/everyone/exercise-library/216/seated-butterfly-stretch/'],
  ankleMedia: ['Providence「Ankle Pumps / Quadriceps Sets」（PDF）','https://www.providence.org/-/media/project/psjh/shared/files/tjr-resources/osm-knee-handbook.pdf?hash=4B23B5C16983872BA5610384C28C4A40&rev=0509aa19c4624dee9fe8b83dbafc43c7'],
  chairMarch: ['Cambridge University Hospitals「Marching legs while sitting」','https://www.cuh.nhs.uk/patient-information/home-exercise-programme/'],
  longAnkles: ['Onondaga Physical Therapy「Long Sitting Ankle Pumps」','https://www.onondagapt.com/wp-content/uploads/2019/12/Ankle-exercises.pdf'],
  wallCalf: ['Worcestershire Acute Hospitals NHS「Heel raises」','https://www.worcsacute.nhs.uk/documents/documents/patient-information-leaflets-a-z/ankle-fracture/?layout=file'],
  wallStretch: ['Mayo Clinic「A guide to basic stretches」','https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/stretching/art-20546848'],
  sideBend: ['University Hospital Southampton「Exercises to improve your posture」','https://www.uhs.nhs.uk/Media/UHS-website-2019/Patientinformation/Respiratory/Exercises-to-improve-your-posture-562-PIL.pdf'],
  floorBreath: ['North Bristol NHS Trust「Coming to the body」','https://www.nbt.nhs.uk/sites/default/files/attachments/Session%202%20handout%202020.pdf'],
  bandHip: ['myHEP「Supine Hip Abduction with Band」','https://myhep.io/exercise-library/how-to-perform-the-supine-hip-abduction-with-band'],
  bodyHinge: ['ShuttleScience「Hip hinge」','https://shuttlescience.com/library/hinge'],
  shoulderBlade: ['Leeds Teaching Hospitals NHS「Shoulder exercises」','https://www.leedsth.nhs.uk/patients/resources/shoulder-exercises/'],
  toeWall: ['East Lancashire Hospitals NHS「Toe raises against a wall」','https://elht.nhs.uk/services/paediatric-physiotherapy/information-patients/ankle-sprains'],
  chestStretch: ['The Royal Marsden NHS「Chest stretch」（PDF）','https://patientinfolibrary.royalmarsden.nhs.uk/sites/default/files/documents/RS-1554-02.pdf'],
  straddle: ['ACE「Seated Straddle Stretch」','https://www.acefitness.org/resources/everyone/exercise-library/210/seated-straddle-stretch/'],
  spinalTwist: ['Mayo Clinic「Seated spinal twist」','https://www.mayoclinic.org/healthy-lifestyle/stress-management/multimedia/seated-spinal-twist/vid-20453586'],
  straightLeg: ['Cambridge University Hospitals「Early knee exercises」','https://www.cuh.nhs.uk/our-services/physiotherapy-outpatients/outpatient-physio-resources/resources/knee/early-knee-exercises/'],
  kneeRollNhs: ['Maidstone and Tunbridge Wells NHS「Knee rolls」（PDF）','https://www.mtw.nhs.uk/wp-content/uploads/2025/10/Management-of-Lower-Back-PainSTANDARD-PRINT-LEAFLET.pdf'],
  breathing: ['NHS「Breathing exercises for stress」','https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/breathing-exercises-for-stress/']
};

// The listed muscles describe the main movement or stretch. The catalog's
// broader load tags also account for meaningful support and stabilization.
export const evidence = {
  march: {name:'March on the spot', target:'股関節・太もも・ふくらはぎ', refs:['nhsWarm','cdc']},
  'slow-march': {name:'March on the spot',target:'股関節・太もも・ふくらはぎ',refs:['nhsWarm','aha']},
  toe: {name:'Side toe tap', target:'股関節・ふくらはぎ', refs:['aha'], variant:true},
  'sit-ankles': {name:'Ankle pumps', target:'足首・ふくらはぎ', refs:['longAnkles','ankleMedia'], demo:'longAnkles', variant:true},
  'sit-breathe': {target:'呼吸を整える', refs:['floorBreath'], variant:true},
  'heel-slide': {name:'Heel slide', target:'膝・股関節を動かす', refs:['floor'], variant:true},
  'back-breathe': {target:'呼吸を整える', refs:['floorBreath','breathing'], variant:true},
  'rock-warm': {name:'Quadruped rock-back', target:'股関節を動かす。腕と膝で支える', refs:['rock'], variant:true},
  'rock-cool': {name:'Quadruped rock-back', target:'股関節を動かす。腕と膝で支える', refs:['rock'], variant:true},
  'kneel-warm': {target:'股関節・体幹で姿勢を支える', refs:['aha'], variant:true},
  'kneel-cool': {target:'呼吸を整える。膝と股関節で姿勢を支える', refs:['breathing'], variant:true},
  squat: {name:'Mini-squat / Bodyweight squat',target:'太もも前（大腿四頭筋）・お尻（大殿筋）',refs:['nhsStrength','ace']},
  calf: {name:'Calf raise / Heel raise',target:'ふくらはぎ（腓腹筋・ヒラメ筋）',refs:['wallCalf','ace'],demo:'wallCalf',variant:true},
  'leg-out': {name:'Standing hip abduction / Sideways leg lift',target:'お尻の横（中殿筋などの股関節外転筋）',refs:['nhsStrength','hipAbduction'],variant:true},
  'wall-push': {name:'Wall press-up / Wall push-up',target:'胸（大胸筋）・二の腕の裏（上腕三頭筋）・肩の前',refs:['nhsStrength','ace']},
  'step-up': {name:'Step-up',target:'太もも前（大腿四頭筋）・太もも裏（ハムストリングス）・お尻',refs:['step']},
  'calf-stretch': {name:'Standing calf stretch',target:'ふくらはぎ（膝を伸ばした側の腓腹筋が中心）',refs:['wallStretch','nhsStretch'],demo:'wallStretch',variant:true},
  'side-bend': {name:'Standing side bend',target:'体側（傾けた側と反対のお腹・腰の横）',refs:['sideBend'],demo:'sideBend'},
  'sit-press': {name:'Quad set / Static quadriceps',target:'太もも前（大腿四頭筋）',refs:['knees','ankleMedia'],demo:'ankleMedia',variant:true},
  'sit-march': {name:'Seated march / Seated hip flexion',target:'股関節の前（股関節屈筋群）と姿勢を保つ体幹',refs:['chairMarch'],variant:true},
  'sit-ham': {name:'Seated hamstring stretch',target:'太もも裏（ハムストリングス）',refs:['iowa'],demo:'iowa',variant:true},
  'sit-hips': {name:'Butterfly stretch',target:'内もも（股関節内転筋群）',refs:['iowa','aceButterfly','hips'],demo:'iowa'},
  'sit-turn': {name:'Seated trunk rotation',target:'体幹（腹斜筋など）・背中',refs:['spine'],variant:true},
  bridge: {name:'Glute bridge',target:'お尻（大殿筋）、太もも裏（ハムストリングス）',refs:['hip','core']},
  'band-open': {name:'Supine banded hip abduction',target:'お尻の横（股関節外転筋群）',refs:['bandHip','hipAbduction'],demo:'bandHip',variant:true},
  pelvic: {name:'Pelvic tilt',target:'下腹部・骨盤まわりを動かす',refs:['floor']},
  'back-ham': {name:'Supine hamstring stretch',target:'太もも裏（ハムストリングス）',refs:['nhsStretch'],demo:'nhsStretch'},
  fallout: {name:'Bent-knee fallout',target:'股関節を動かす。骨盤を保つ体幹にも負荷',refs:['floor'],variant:true},
  bird: {name:'Bird dog / Quadruped',target:'体幹と背中・お尻。支える側の肩にも負荷',refs:['core']},
  'rock-stretch': {name:'Quadruped rock-back',target:'股関節まわり。腕で支えるので肩にも負荷',refs:['rock'],variant:true},
  'hip-hinge': {name:'Bodyweight hip hinge',target:'お尻・太もも裏。体幹は背中を支える',refs:['bodyHinge'],demo:'bodyHinge'},
  'scapular-squeeze': {name:'Scapular retraction',target:'肩甲骨の間（菱形筋など）',refs:['shoulderBlade'],demo:'shoulderBlade'},
  'free-calf': {name:'Standing calf stretch',target:'後ろ脚のふくらはぎ',refs:['nhsStretch'],demo:'nhsStretch'},
  'toe-raise': {name:'Toe raises against a wall',target:'すねの前（前脛骨筋など）',refs:['toeWall'],demo:'toeWall'},
  'chest-open': {name:'Standing chest stretch',target:'胸と肩の前',refs:['chestStretch'],demo:'chestStretch'},
  'sit-straddle': {name:'Seated straddle stretch',target:'内もも・太もも裏',refs:['straddle'],demo:'straddle'},
  'sit-spinal': {name:'Seated spinal twist',target:'体側・背中・股関節',refs:['spinalTwist'],demo:'spinalTwist'},
  'straight-raise': {name:'Straight leg raise',target:'太もも前と股関節の前',refs:['straightLeg'],demo:'straightLeg'},
  'knee-roll': {name:'Knee rolls',target:'体幹・股関節をゆっくり動かす',refs:['kneeRollNhs'],demo:'kneeRollNhs'},
  'figure-four': {name:'Supine figure-four stretch',target:'お尻と股関節の後ろ',refs:['nhsStretch'],demo:'nhsStretch'},
  'kneel-hinge': {name:'Tall-kneeling hip hinge',target:'お尻・股関節と姿勢を保つ体幹',refs:['ace'],variant:true}
};

const stageSources = {
  'warm-heel':['march','nhsWarm'], 'warm-shoulder':['march','nhsWarm'], 'warm-knee':['squat','nhsWarm'],
  'warm-sit-hip':['sit-hips','aceButterfly'], 'warm-pelvic':['pelvic','floor'],
  'cool-slide':['heel-slide','floor'], 'cool-sit-ankles':['sit-ankles','longAnkles'],
  'cool-calf':['calf-stretch','wallStretch'], 'cool-side':['side-bend','sideBend'],
  'cool-sit-ham':['sit-ham','iowa'], 'cool-sit-hip':['sit-hips','iowa'], 'cool-back-ham':['back-ham','nhsStretch']
};
const stageInfo = {
  'warm-heel':{name:'Heel digs',target:'足首・太ももを小さく動かす'},
  'warm-shoulder':{name:'Shoulder rolls',target:'肩・肩甲骨まわりを動かす'},
  'warm-knee':{name:'Knee bends'}
};
for (const [id,[base,key]] of Object.entries(stageSources)) {
  evidence[id] = {...evidence[base],refs:[...new Set([key,...evidence[base].refs])],...stageInfo[id]};
}

export const intensity = {
  warm:'軽い動き。会話できるペースから始め、息が上がる手前で調整。',
  cool:'軽い動き。少しずつペースを落として呼吸を整える。',
  strength:'姿勢を保って動ける範囲。余力を残し、動きが乱れたり痛みが出たりしたら止める。',
  stretch:'軽い張りを感じる範囲。痛みの手前で止め、反動をつけない。'
};

// Existing exercises with a matching movement and compatible setup.
// Keep retired IDs in the catalog for reading old backups and history.
export const curatedSource = {
  ...Object.fromEntries(Object.entries(stageSources).map(([id,[,source]])=>[id,source])),
  march:'nhsWarm', 'slow-march':'nhsWarm',
  'sit-ankles':'longAnkles', 'sit-breathe':'floorBreath', 'heel-slide':'floor',
  'back-breathe':'floorBreath', 'rock-warm':'rock', 'rock-cool':'rock',
  squat:'ace', calf:'wallCalf', 'wall-push':'nhsStrength', 'step-up':'step',
  'calf-stretch':'wallStretch', 'side-bend':'sideBend', 'sit-press':'ankleMedia',
  'sit-ham':'iowa', 'sit-hips':'iowa', bridge:'hip', 'band-open':'bandHip',
  pelvic:'floor', 'back-ham':'nhsStretch', fallout:'floor', bird:'core', 'rock-stretch':'rock',
  'hip-hinge':'bodyHinge', 'scapular-squeeze':'shoulderBlade', 'free-calf':'nhsStretch',
  'toe-raise':'toeWall', 'chest-open':'chestStretch', 'sit-straddle':'straddle', 'sit-spinal':'spinalTwist',
  'straight-raise':'straightLeg', 'knee-roll':'kneeRollNhs', 'figure-four':'nhsStretch'
};
