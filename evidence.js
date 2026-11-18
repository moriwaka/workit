export const references = {
  jpStrength: ['厚生労働省「筋力トレーニングについて」','https://kennet.mhlw.go.jp/information/information/exercise/s-00-005.html'],
  aha: ['American Heart Association「Warm Up, Cool Down」','https://www.heart.org/en/healthy-living/exercise-and-physical-activity/fitness-basics/warm-up-cool-down'],
  cdc: ['CDC「Measuring Physical Activity Intensity」','https://www.cdc.gov/physical-activity-basics/measuring/index.html'],
  nhsWarm: ['NHS「How to warm up before exercising」','https://www.nhs.uk/live-well/exercise/how-to-warm-up-before-exercising/'],
  nhsStrength: ['NHS「Strength exercises」','https://www.nhs.uk/live-well/exercise/strength-exercises/'],
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
  breathing: ['NHS「Breathing exercises for stress」','https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/breathing-exercises-for-stress/']
};

// The listed muscles describe the main movement or stretch. The catalog's
// broader load tags also account for meaningful support and stabilization.
export const evidence = {
  march: {name:'March on the spot', target:'股関節・太もも・ふくらはぎ', refs:['nhsWarm','cdc']},
  toe: {name:'Side toe tap', target:'股関節・ふくらはぎ', refs:['aha'], variant:true},
  'sit-ankles': {name:'Ankle pumps', target:'足首・ふくらはぎ', refs:['knees'], variant:true},
  'sit-breathe': {target:'呼吸を整える', refs:['breathing'], variant:true},
  'heel-slide': {name:'Heel slide', target:'膝・股関節を動かす', refs:['floor'], variant:true},
  'back-breathe': {target:'呼吸を整える', refs:['breathing'], variant:true},
  'rock-warm': {name:'Quadruped rock-back', target:'股関節を動かす。腕と膝で支える', refs:['rock'], variant:true},
  'rock-cool': {name:'Quadruped rock-back', target:'股関節を動かす。腕と膝で支える', refs:['rock'], variant:true},
  'kneel-warm': {target:'股関節・体幹で姿勢を支える', refs:['aha'], variant:true},
  'kneel-cool': {target:'呼吸を整える。膝と股関節で姿勢を支える', refs:['breathing'], variant:true},
  squat: {name:'Mini-squat / Bodyweight squat',target:'太もも前（大腿四頭筋）・お尻（大殿筋）',refs:['nhsStrength','ace']},
  calf: {name:'Calf raise / Heel raise',target:'ふくらはぎ（腓腹筋・ヒラメ筋）',refs:['nhsStrength','ace'],variant:true},
  'leg-out': {name:'Standing hip abduction / Sideways leg lift',target:'お尻の横（中殿筋などの股関節外転筋）',refs:['nhsStrength','hipAbduction'],variant:true},
  'wall-push': {name:'Wall press-up / Wall push-up',target:'胸（大胸筋）・二の腕の裏（上腕三頭筋）・肩の前',refs:['nhsStrength','ace']},
  'step-up': {name:'Step-up',target:'太もも前（大腿四頭筋）・太もも裏（ハムストリングス）・お尻',refs:['step']},
  'calf-stretch': {name:'Standing calf stretch',target:'ふくらはぎ（膝を伸ばした側の腓腹筋が中心）',refs:['nhsStretch'],variant:true},
  'side-bend': {name:'Standing side bend',target:'体側（傾けた側と反対のお腹・腰の横）',refs:['spine']},
  'sit-press': {name:'Quad set / Static quadriceps',target:'太もも前（大腿四頭筋）',refs:['knees'],variant:true},
  'sit-march': {name:'Seated march / Seated hip flexion',target:'股関節の前（股関節屈筋群）と姿勢を保つ体幹',refs:['core'],variant:true},
  'sit-ham': {name:'Seated hamstring stretch',target:'太もも裏（ハムストリングス）',refs:['nhsStretch'],variant:true},
  'sit-hips': {name:'Butterfly stretch',target:'内もも（股関節内転筋群）',refs:['hips']},
  'sit-turn': {name:'Seated trunk rotation',target:'体幹（腹斜筋など）・背中',refs:['spine'],variant:true},
  bridge: {name:'Glute bridge',target:'お尻（大殿筋）、太もも裏（ハムストリングス）',refs:['hip','core']},
  'band-open': {name:'Supine banded hip abduction',target:'お尻の横（股関節外転筋群）',refs:['hipAbduction'],variant:true},
  pelvic: {name:'Pelvic tilt',target:'下腹部・骨盤まわりを動かす',refs:['floor']},
  fallout: {name:'Bent-knee fallout',target:'股関節を動かす。骨盤を保つ体幹にも負荷',refs:['floor'],variant:true},
  bird: {name:'Bird dog / Quadruped',target:'体幹と背中・お尻。支える側の肩にも負荷',refs:['core']},
  'rock-stretch': {name:'Quadruped rock-back',target:'股関節まわり。腕で支えるので肩にも負荷',refs:['rock'],variant:true},
  'kneel-hinge': {name:'Tall-kneeling hip hinge',target:'お尻・股関節と姿勢を保つ体幹',refs:['ace'],variant:true}
};

export const intensity = {
  warm:'軽い動き。会話できるペースから始め、息が上がる手前で調整。',
  cool:'軽い動き。少しずつペースを落として呼吸を整える。',
  strength:'姿勢を保って動ける範囲。余力を残し、動きが乱れたり痛みが出たりしたら止める。',
  stretch:'軽い張りを感じる範囲。痛みの手前で止め、反動をつけない。'
};
