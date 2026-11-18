import {hiitPosesForDrawing as poses} from './hiit-poses.js?v=1';
import {heelTapJumpDiagram} from './heel-tap-jump.js?v=1';

const fit = (slug,title)=>({title:'Fitnopia「'+title+'」',url:'https://fitnopia.com/en/exercises/'+slug});
const ohio = title=>({title:'Ohio University WellWorks「'+title+'」',url:'https://www.ohio.edu/wellworks/movement-library'});
const sweat = (slug,title)=>({title:'Sweat「'+title+'」',url:'https://sweat.com/exercises/'+slug});
const nasm = (slug,title)=>({title:'NASM「'+title+'」',url:'https://www.nasm.org/resource-center/exercise-library/'+slug});
const reference = (title,url)=>({title,url});

const push = fit('pushups','Pushups');
const knees = fit('knee-pushups','Knee Pushups');
const diamond = fit('diamond-pushups','Diamond Pushups');
const negative = ohio('Negative Push Ups');
const wide = ohio('Wide Grip Push Ups');
const pike = nasm('pike-push-up','Pike Push-Up');
const forearm = ohio('Forearm Plank');
const highPlank = fit('high-plank-hold','High Plank Hold');
const armReach = ohio('High Plank Arm Reach');
const shoulderTap = fit('plank-shoulder-taps','Plank Shoulder Taps');
const plankWalk = fit('plank-switches','Plank Switches');
const sidePlank = ohio('Side Plank');
const bear = ohio('Bear Hold');
const dips = ohio('Triceps Dips');
const crunch = fit('crunches','Crunches');
const bicycle = ohio('Bicycles');
const reverseCrunch = fit('reverse-crunches','Reverse Crunches');
const legRaise = fit('leg-raises','Leg Raises');
const bridge = ohio('Glute Bridge');
const singleBridge = ohio('Single Leg Glute Bridge');
const gluteMarch = reference('Physitrack「Glute Bridge March」','https://us.physitrack.com/home-exercise-video/glute-bridge-march');
const donkey = sweat('donkey-kick','Donkey Kick');
const airSquat = reference('CrossFit「The Air Squat」','https://www.crossfit.com/essentials/the-air-squat');
const pulse = ohio('Squat Pulse');
const sumo = sweat('sumo-squat','Bodyweight Sumo Squat');
const frontLunge = ohio('Alternating Front Lunge');
const rearLunge = fit('reverse-lunges','Reverse Lunges');
const split = fit('split-lunges','Split Lunges');
const curtsy = reference('Sweat「Curtsy Lunge」','https://sweat.com/blogs/fitness/no-equipment-full-body-workout');
const curtsyPulse = reference('Erin Oprea「Curtsy Lunge Pulses」','https://www.vitalproteins.com/blogs/fitness/erin-oprea-shows-leg-workout-video');
const wall = ohio('Wall Sit');
const jacks = fit('jumping-jacks','Jumping Jacks');
const stepJacks = reference('A Human Web「Step Jacks」','https://www.ahumanweb.com/training/how-to-do-jumping-jacks');
const plankJacks = sweat('plank-jack','Plank Jack');
const stepPlankJacks = reference('USANA Workout Guide「Plank Jacks / Low Impact」','https://www.usana.com/static/images/na/Training/WelcomeKit/WorkoutGuide-EN.pdf');
const burpee = fit('burpees','Burpees');
const stepBurpee = reference('HipTrain「Burpee — Step-back modification」','https://learn.hiptrain.com/hiit-cardio/best-10-hiit-exercises-for-building-endurance');
const sprawl = fit('sprawls','Sprawls');
const climber = fit('mountain-climbers','Mountain Climbers');
const diagonal = fit('plank-knees-to-elbows','Plank Knees-to-Elbows');
const highKnee = fit('high-knees','High Knees');
const buttKick = fit('butt-kicks','Butt Kicks');
const squatJump = ohio('Squat Jump');
const jumpLunge = ohio('Alternating Split Jumps');
const skate = ohio('Skaters');
const hollow = reference('Physitrack「Hollow Body Hold」','https://ie.physitrack.com/home-exercise-video/hollow-body-hold');
const floorDips = reference('Health and Wellbeing Queensland「Tricep dips on a floor or bench」','https://hw.qld.gov.au/physical-activity/dips-on-floor-bench/');
const cobra = reference('Physitrack「Prone Press Up Extension」','https://us.physitrack.com/home-exercise-video/prone-press-up-extension');
const frog = reference('Calisthenics Association「Planche Lean and Frog Stand」','https://calisthenicsassociation.org/lessons/planche-lean-and-frog-stand');
const donkeyStraight = reference('Physitrack「Hip Extension Quadruped」','https://na.physitrack.com/home-exercise-video/hip-extension-quadruped');
const plankPike = fit('pikes','Pikes');
const oneBurpee = sweat('single-leg-burpee','Single-Leg Burpee');
const fullBurpee = reference('CrossFit「The Burpee」','https://www.crossfit.com/essentials/the-burpee');
const thruster = reference('Flamin’ Fitness「Bodyweight Thruster」','https://flaminfitness.com/pages/bodyweight-thruster');
const starJump = reference('Iowa HHS「Star Jumps」','https://hhs.iowa.gov/media/17345/download');
const wallOne = reference('Catalyst Athletics「Single-Leg Wall Sit」','https://www.catalystathletics.com/exercise/744/Single-Leg-Wall-Sit/');

// Each sequence starts and ends at its starting position. Related variants
// link the written guides for the movement and, where needed, its components.
const plans = {
  'standard-push-ups': [[push],'plank lowPush plank'],
  'knee-push-ups': [[knees],'kneePush kneePushLow kneePush'],
  'knee-push-up-pulses': [[knees,pulse],'kneePushLow kneePushPulse kneePushLow'],
  'hand-release-push-ups': [[reference('U.S. Army「Hand-Release Push-Up」','https://www.army.mil/aft/')],'plank lowPush prone released extendedArms prone plank'],
  'diamond-push-ups': [[diamond],'diamondStart diamondLow diamondStart'],
  'diamond-to-wide-push-ups': [[diamond,wide],'diamondStart diamondLow diamondStart widePush lowWidePush widePush diamondStart'],
  'negative-push-ups': [[negative],'plank plank lowPush prone plank'],
  'low-push-up-hold': [[reference('Calisteniapp「Bottom-position isometric push-up hold」','https://calisteniapp.com/exercises/bottom_position_isometric_push_up_hold/EX305')],'plank lowPush lowPush plank'],
  'push-back-push-ups': [[push,ohio('Blast Off Planks')],'plank lowPush plank frogging plank'],
  'walking-push-ups': [[ohio('Alligator Push Ups'),push],'plank lowPush plank widePush lowWidePush widePush plank'],
  'push-up-childs-pose': [[push,fit('childs-pose','Child’s Pose')],'plank lowPush plank quadruped child quadruped plank'],
  'push-up-shoulder-tap': [[push,shoulderTap],'plank lowPush plank plankTap plank plankTapOther plank'],
  'push-up-toe-tap': [[push,plankPike],'plank lowPush plank pike pushPikeToe plank lowPush plank pike pushPikeToeOther plank'],
  'leg-lift-push-ups': [[push,fit('plank-leg-lifts','Plank Leg Lifts')],'plank plankLift plankLiftLow plankLift plank plankLiftOther plankLiftLowOther plankLiftOther plank'],
  'pike-push-ups': [[pike],'pike pikeLow pike'],
  'pike-push-up-hold': [[pike],'pike pikeLow pikeLow pike'],
  'floor-tricep-dips': [[floorDips],'floorDip floorDipLow floorDip'],
  'tricep-dip-pulses': [[floorDips,pulse],'floorDipLow floorDipPulse floorDipLow'],
  'tricep-dip-to-hip-thrust': [[floorDips,fit('reverse-table','Reverse Table')],'floorDip floorDipLow floorDip reverseTable floorDip'],
  'cobra-push-ups': [[cobra],'prone cobra prone'],
  'cobra-pulses': [[cobra,pulse],'cobra cobraPulse cobra'],
  'frogstand-hold': [[frog],'frogging frogstand frogstand frogging'],
  'commandos': [[plankWalk],'plank nearForearm forearm nearForearm plank farForearm forearm farForearm plank'],
  '1-arm-commandos': [[plankWalk],'plank nearForearm forearm nearForearm plank',true],
  'scapular-push-ups': [[reference('Physitrack「Scapular Push Up Plus」','https://na.physitrack.com/home-exercise-video/scapular-push-up-plus')],'scapularHigh scapularLow scapularHigh'],
  'superman-lift-and-pull-back': [[fit('superman','Superman')],'supermanStart superman supermanRow superman supermanStart'],
  'superwoman-arm-raises': [[ohio('Y T W')],'supermanStart armsProne supermanStart'],
  'swimmers': [[fit('superman','Superman')],'superman supermanSweep superman'],
  'high-plank-arm-raises': [[armReach],'plank plankReach plank plankReachOther plank'],
  'tricep-dips-on-couch': [[dips],'chairDip chairDipLow chairDip'],
  'divebomb-pushups': [[fit('diving-pushups','Diving Pushups')],'pike pikeLow lowPush cobra pike'],
  'half-pushup-to-superman-pose': [[push,fit('superman-extensions','Superman Extensions')],'plank lowPush prone supermanStart superman supermanStart prone plank'],

  'crunches': [[crunch],'bridgeDown crunched bridgeDown'],
  'butterfly-crunches': [[crunch,reference('CrossFit「The AbMat Sit-Up — Butterfly setup」','https://www.crossfit.com/essentials/the-abmat-sit-up')],'butterflyBack butterflyCrunch butterflyBack'],
  'crunch-hold-pulses': [[crunch],'crunched crunchPulse crunched'],
  'reverse-crunches': [[reverseCrunch],'tabletop curlHip tabletop'],
  'reverse-crunch-leg-lift': [[reverseCrunch,legRaise],'legsLow tabletop curlHip reverseCrunchUp legsUp legsLow'],
  'bicycle-abs': [[bicycle],'bicycle bicycleOther bicycle'],
  'slow-paused-bicycle-crunches': [[bicycle],'bicycle bicycle bicycleOther bicycleOther bicycle'],
  'bicycle-hold-right': [[bicycle],'crunched bicycle bicycle crunched'],
  'bicycle-hold-left': [[bicycle],'crunched bicycleOther bicycleOther crunched'],
  'heel-taps': [[ohio('Oblique Crunch')],'crunched heelTouch crunched heelTouchOther crunched'],
  'sit-up-punches': [[fit('situps','Situps'),ohio('Shadow Boxing')],'bridgeDown crunched situp sitPunch sitPunchOther situp crunched bridgeDown'],
  'regular-ol-situps': [[fit('situps','Situps')],'bridgeDown crunched situp crunched bridgeDown'],
  'hollow-body-hold': [[hollow],'backFlat hollow hollow backFlat'],
  '1-leg-hollow-hold-right': [[hollow],'backFlat hollowOne hollowOne backFlat'],
  '1-leg-hollow-hold-left': [[hollow],'backFlat hollowOneOther hollowOneOther backFlat'],
  'hollow-body-knee-hugs': [[hollow,ohio('High Boat to Low Boat')],'hollow crunchStar hollow'],
  'full-tuck-ups': [[ohio('High Boat to Low Boat')],'hollow raisedTuck hollow'],
  'starfish-toe-taps': [[reference('Steel「How to Do Starfish Crunches」','https://steelsupplements.com/blogs/steel-blog/how-to-do-starfish-crunches-form-benefits')],'star starTap star starTapOther star'],
  'leg-raises': [[legRaise],'legsLow legsUp legsLow'],
  'leg-drops': [[ohio('Leg Drops')],'legsUp legsLow legsLow legsUp'],
  'little-hip-lifts': [[reverseCrunch,legRaise],'legsUp reverseCrunchUp legsUp'],
  'flutter-kicks': [[reference('Physitrack「Flutter Kicks」','https://www.physitrack.com/exercise-library/how-to-perform-the-flutter-kicks-exercise')],'flutter flutterOther flutter'],
  'scissor-kicks': [[ohio('Scissors')],'scissor scissorOther scissor'],
  'legs-in-up-and-down': [[reverseCrunch,legRaise],'legsLow tabletop legsUp legsLow'],
  'russian-twists': [[ohio('Sit Up Twist')],'raisedTuck raisedTwist raisedTuck raisedTwistOther raisedTuck'],
  'body-twists': [[ohio('Sit Up Twist')],'sitTwist sitTwistOther sitTwist'],
  'high-plank-hold': [[highPlank],'kneePush plank plank kneePush'],
  'low-plank-hold': [[forearm],'prone forearm forearm prone'],
  'extended-plank-hold': [[ohio('Extended Arm Plank'),highPlank],'plank extendedPlank extendedPlank plank'],
  'low-plank-hip-dips': [[reference('Women’s Health・CPT「Plank Hip Dips」','https://www.womenshealthmag.com/fitness/g31225564/plank-workout/')],'forearm plankDip forearm plankDipOther forearm'],
  'low-plank-rocks': [[ohio('Plank Saw')],'forearm plankRock forearm'],
  'low-plank-to-pike': [[forearm,plankPike],'forearm lowPike forearm'],
  'low-plank-leg-raises': [[fit('plank-leg-lifts','Plank Leg Lifts')],'forearm forearmLeg forearm forearmLegOther forearm'],
  'right-side-plank-hold': [[sidePlank],'sideDip sidePlank sidePlank sideDip'],
  'left-side-plank-hold': [[sidePlank],'sideDipOther sidePlankOther sidePlankOther sideDipOther'],
  'side-plank-dips-right': [[fit('side-plank-dips-right','Side Plank Dips (Right)')],'sidePlank sideDip sidePlankShift sidePlank'],
  'side-plank-dips-left': [[fit('side-plank-dips-left','Side Plank Dips (Left)')],'sidePlankOther sideDipOther sidePlankShiftOther sidePlankOther'],
  'side-plank-reach-under-right': [[fit('side-plank-twists-right','Side Plank Twists (Right)')],'sideReach sideUnder sideReach'],
  'side-plank-reach-under-left': [[fit('side-plank-twists-left','Side Plank Twists (Left)')],'sideReachOther sideUnderOther sideReachOther'],
  'side-plank-pulses-right': [[sidePlank,pulse],'sidePlank sidePlankShift sidePlank'],
  'side-plank-pulses-left': [[sidePlank,pulse],'sidePlankOther sidePlankShiftOther sidePlankOther'],
  'side-plank-crunches-right': [[fit('side-plank-crunches-right','Side Plank Crunches (Right)')],'sidePlank sideCrunch sidePlank'],
  'side-plank-crunches-left': [[fit('side-plank-crunches-left','Side Plank Crunches (Left)')],'sidePlankOther sideCrunchOther sidePlankOther'],
  'bear-hold': [[bear],'quadruped bear bear quadruped'],
  'bear-hold-knee-taps': [[reference('JustGains「Knee Bear Hold Tap」','https://justgains.com/e/knee-bear-hold-tap')],'bear bearTap bear bearTapOther bear'],
  'bear-hold-donkey-kicks': [[bear,donkey],'bear bearDonkey bear bearDonkeyOther bear'],
  'plank-shoulder-taps': [[shoulderTap],'plank plankTap plank plankTapOther plank'],
  'plank-toe-taps': [[highPlank,plankPike],'plank pike pushPikeToe plank pike pushPikeToeOther plank'],
  'plank-side-steps': [[ohio('High Plank Step Outs')],'plank plankFootOut plankLateral plankFarFootOut plank'],
  'reverse-plank-climbers': [[reference('Elite Performance Institute「Reverse Plank March」','https://elite-performance-institute.com/exercise-library/core-exercises/reverse-plank-march/')],'reversePlank reverseKnee reversePlank reverseKneeOther reversePlank'],
  'reverse-plank-hold': [[reference('Swiss Armed Forces Sport「Reverse Plank」','https://mil-sport.ch/en/topics/exercise/839')],'floorDip reversePlank reversePlank floorDip'],

  'air-squats': [[airSquat],'stand squat stand'],
  'squat-pulses': [[pulse],'squat squatPulse squat'],
  '3-second-hold-low-squats': [[airSquat,fit('deep-squat-hold','Deep Squat Hold')],'stand squat squat squat stand'],
  'sumo-squats': [[sumo],'wideStand sumo wideStand'],
  'sumo-squat-pulses-3x': [[sumo,pulse],'wideStand sumo widePulse sumo widePulse sumo widePulse sumo wideStand'],
  'sumo-holds': [[sumo,fit('deep-squat-hold','Deep Squat Hold')],'wideStand sumo sumo wideStand'],
  'squat-to-heel-raise': [[airSquat,fit('calf-raises','Calf Raises')],'stand squat stand heelRaise stand'],
  'squat-to-calf-raise': [[airSquat,fit('calf-raises','Calf Raises')],'stand squat heelReach stand'],
  'squat-walks': [[reference('Iridium「Duck Walk」','https://iridium.fit/exercises/legs/duck-walk')],'squat squatStep squat squatStepOther squat squatStepOther squat squatStep squat'],
  'low-side-walks': [[ohio('Lateral Walks')],'sumo lateralWalkOut lateralWalkIn sumo'],
  'cossack-squats': [[fit('cossack-squats','Cossack Squats')],'wideStand lateral lateralOther wideStand'],
  'close-stance-squat-pulses': [[airSquat,pulse],'narrowSquat narrowPulse narrowSquat'],
  'predator-squats': [[nasm('prisoner-squat','Prisoner Squat')],'prisonerStand prisoner prisonerStand'],
  'forward-lunges': [[frontLunge],'stand lungeStand lunge lungeStand stand lungeStandOther lungeOther lungeStandOther stand'],
  'reverse-lunges': [[rearLunge],'stand reverseStand lunge reverseStand stand reverseStandOther lungeOther reverseStandOther stand'],
  'reverse-lunge-knee-drive': [[rearLunge,highKnee],'stand reverseStand lunge reverseStand highKnee stand reverseStandOther lungeOther reverseStandOther highKneeOther stand'],
  'reverse-lunge-pulse-right': [[rearLunge,pulse],'stand reverseStand lunge lungePulse lunge reverseStand stand'],
  'reverse-lunge-pulse-left': [[rearLunge,pulse],'stand reverseStandOther lungeOther lungePulseOther lungeOther reverseStandOther stand'],
  'right-split-squats': [[split],'lungeStand lunge lungeStand'],
  'left-split-squats': [[split],'lungeStandOther lungeOther lungeStandOther'],
  'split-squat-hold-pulses-right': [[split,pulse],'lunge lunge lungePulse lunge'],
  'split-squat-hold-pulses-left': [[split,pulse],'lungeOther lungeOther lungePulseOther lungeOther'],
  'lunge-front-back-steps': [[ohio('Pendulum Lunges')],'stand lungeStand lunge stand reverseStandOther lungeOther stand',true],
  'curtsy-lunges': [[curtsy],'narrow curtsy narrow curtsyOther narrow'],
  'curtsy-lunge-to-squat': [[curtsy,airSquat],'narrow curtsy sumo curtsyOther narrow'],
  'curtsy-pulses-right': [[curtsyPulse],'curtsy curtsyPulse curtsy'],
  'curtsy-pulses-left': [[curtsyPulse],'curtsyOther curtsyPulseOther curtsyOther'],
  'lateral-lunges-side-to-side': [[fit('side-lunges','Side Lunges')],'wideStand lateral wideStand lateralOther wideStand'],
  'forward-lunge-right-leg': [[frontLunge],'stand lungeStand lunge lungeStand stand'],
  'forward-lunge-left-leg': [[frontLunge],'stand lungeStandOther lungeOther lungeStandOther stand'],
  'quad-lean-backs': [[reference('A Human Web「Reverse Nordic Curl」','https://www.ahumanweb.com/training/how-to-do-reverse-nordic-curls')],'kneeling kneelingLean kneeling'],
  'kneeling-ups-knee-downs': [[reference('Larry「Kneel to Stand」','https://www.larry.to/exercises/quads/kneel-to-stand')],'kneeling halfKneel squat stand squat halfKneel kneeling'],
  'glute-bridge-pulses': [[bridge,pulse],'bridgeUp bridgePulse bridgeUp'],
  'right-leg-glute-bridge': [[singleBridge],'bridgeOneDown bridgeOneUp bridgeOneDown'],
  'left-leg-glute-bridge': [[singleBridge],'bridgeOneDownOther bridgeOneUpOther bridgeOneDownOther'],
  'single-leg-glute-bridge-pulses-right': [[singleBridge,pulse],'bridgeOneUp oneBridgePulse bridgeOneUp'],
  'single-leg-glute-bridge-pulses-left': [[singleBridge,pulse],'bridgeOneUpOther oneBridgePulseOther bridgeOneUpOther'],
  'glute-bridge-hold-leg-raises': [[reference('Fit FX「Bridges with Leg Extensions」','https://fitfxtraining.ca/bodyweight-plyometrics-exercises/glute-bridge-leg-extensions')],'bridgeUp bridgeOneUp bridgeUp bridgeOneUpOther bridgeUp'],
  'glute-bridge-marches': [[gluteMarch],'bridgeUp bridgeLift bridgeUp bridgeLiftOther bridgeUp'],
  'donkey-kicks': [[donkey],'quadruped donkey quadruped',true],
  'donkey-pulses-right': [[donkey],'donkey donkeyPulse donkey'],
  'donkey-pulses-left': [[donkey],'donkeyOther donkeyPulseOther donkeyOther'],
  'straight-leg-kickbacks': [[donkeyStraight],'quadruped backKick quadruped',true],
  'straight-leg-kickback-pulses-right': [[donkeyStraight,pulse],'backKick backKickPulse backKick'],
  'straight-leg-kickback-pulses-left': [[donkeyStraight,pulse],'backKickOther backKickPulseOther backKickOther'],
  'wall-sit-hold': [[wall],'wallStart wallSit wallSit wallStart'],
  'single-leg-wall-sit-hold-right': [[wallOne],'wallSit wallOther wallOther wallSit'],
  'single-leg-wall-sit-hold-left': [[wallOne],'wallSit wallOne wallOne wallSit'],
  'good-mornings': [[ohio('Good Mornings')],'prisonerStand hinge prisonerStand'],
  'single-leg-dead-lift-r': [[fit('standing-scales-right','Standing Scales (Right)')],'stand deadlift stand'],
  'single-leg-dead-lift-l': [[fit('standing-scales-left','Standing Scales (Left)')],'stand deadliftOther stand'],

  'jumping-jacks': [[jacks],'narrow jumpingJack jackOpen jumpingJack narrow'],
  'standing-jacks-low-impact': [[stepJacks],'narrow stepJack narrow stepJackOther narrow'],
  'seal-jacks': [[stepJacks],'sealClosed seal sealGround seal sealClosed'],
  'plank-jacks-no-jump': [[stepPlankJacks],'plank plankFootOut plankFeetOut plankFarFootOut plank'],
  'squat-step-jacks-no-jump': [[airSquat,stepJacks],'narrow narrowSquat narrow stepJack narrow narrowSquat narrow stepJackOther narrow'],
  'plank-jacks': [[plankJacks],'plank plankHopOut plankFeetOut plankHopIn plank'],
  'plank-jack-shoulder-taps': [[plankJacks,shoulderTap],'plank plankHopOut plankFeetOut plankHopIn plank plankTap plank plankTapOther plank'],
  'burpees': [[burpee],'stand burpeeBend burpeeHop plank burpeeHop burpeeBend jump landing stand'],
  'full-burpees-chest-to-floor': [[fullBurpee],'stand burpeeBend burpeeHop plank lowPush prone lowPush plank burpeeHop burpeeBend jump landing stand'],
  'half-burpees-sprawl': [[sprawl],'stand burpeeBend burpeeHop plank burpeeHop burpeeBend stand'],
  'step-back-burpees': [[stepBurpee],'stand burpeeBend stepToPlank plank stepToPlank burpeeBend stand'],
  'step-back-burpee-punches': [[stepBurpee,ohio('Shadow Boxing')],'boxing punch punchOther boxing burpeeBend stepToPlank plank stepToPlank burpeeBend boxing'],
  'burpee-jumping-jack': [[fullBurpee,jacks],'stand burpeeBend burpeeHop plank lowPush prone lowPush plank burpeeHop burpeeBend narrow jumpingJack jackOpen jumpingJack stand'],
  'squat-burpees': [[burpee,airSquat],'stand burpeeBend burpeeHop plank burpeeHop burpeeBend squat jump landing stand'],
  'half-burpee-squat-hold': [[sprawl,fit('deep-squat-hold','Deep Squat Hold')],'stand burpeeBend burpeeHop plank burpeeHop burpeeBend squat squat stand'],
  'burpees-no-jump': [[sprawl,fullBurpee],'stand burpeeBend burpeeHop plank burpeeHop burpeeBend reach stand'],
  'full-burpees-no-jump': [[fullBurpee,sprawl],'stand burpeeBend burpeeHop plank lowPush prone lowPush plank burpeeHop burpeeBend reach stand'],
  'squat-burpees-no-jump': [[sprawl,airSquat],'stand burpeeBend burpeeHop plank burpeeHop burpeeBend squat reach stand'],
  'single-leg-burpees-right': [[oneBurpee,fullBurpee],'highKneeOther oneBurpee onePlank oneProne onePlank oneBurpee oneJump highKneeOther'],
  'single-leg-burpees-left': [[oneBurpee,fullBurpee],'highKnee oneBurpeeOther onePlankOther oneProneOther onePlankOther oneBurpeeOther oneJumpOther highKnee'],
  '4-lunge-jumps-1-burpee': [[jumpLunge,burpee],'lunge splitJump lungeOther splitJump lunge splitJump lungeOther splitJump lunge stand burpeeBend burpeeHop plank burpeeHop burpeeBend jump landing stand lunge'],
  'mountain-climbers': [[climber],'plank plankKnee plankKneeOther plank'],
  'slow-and-controlled-mountain-climbers': [[climber],'plank plankKnee plankKnee plank plankKneeOther plankKneeOther plank'],
  'diagonal-mountain-climbers': [[diagonal],'plank diagonalClimb plank diagonalClimbOther plank'],
  'low-plank-mountain-climbers': [[forearm,diagonal],'forearm lowClimb forearm lowClimbOther forearm'],
  'plank-leg-raise-to-climber': [[fit('plank-leg-lifts','Plank Leg Lifts'),climber],'plank plankLift plankKnee plank plankLiftOther plankKneeOther plank'],
  'high-knees': [[highKnee],'highKnee hopKnee highKneeOther hopKneeOther highKnee'],
  'fast-feet': [[reference('FitMetrics「Fast Feet」','https://www.fitmetrics.ch/en/exercise/6a80ab0dbd042-fast-feet')],'landing quickStep quickStepOther landing'],
  'butt-kicks': [[buttKick],'buttKick hopButt buttKickOther hopButtOther buttKick'],
  'high-knees-no-jump': [[fit('knee-lifts','Knee Lifts')],'stand highKnee stand highKneeOther stand'],
  'butt-kicks-no-jump': [[buttKick,ohio('Butt Kickers')],'stand buttKick stand buttKickOther stand'],
  'jump-rope': [[sweat('air-skipping','Air Skipping')],'ropeStand ropeAir ropeStand'],
  'bear-crawls': [[ohio('Bear Crawl')],'bear bearStep bearStepOther bearStep bear'],
  'plank-side-climbers': [[diagonal],'plank sideClimb plank sideClimbOther plank'],
  'squat-jumps': [[squatJump],'stand squat jump landing stand'],
  'tuck-jumps': [[nasm('tuck-jump','Tuck Jump')],'stand landing jump tuck jump landing stand'],
  '1-squat-1-squat-jump': [[airSquat,squatJump],'stand squat stand squat jump landing stand'],
  'pop-squats': [[sweat('pop-squat','Pop Squat')],'narrow jumpingJack jackWideSquat jumpingJack narrow'],
  'squat-reach-no-jump': [[airSquat,fit('calf-raises','Calf Raises')],'stand squat heelReach stand'],
  'skater-steps-no-jump': [[sweat('skaters','Skaters')],'skaterStart narrow skaterOther narrow skaterStart'],
  'bodyweight-thrusters-no-jump': [[thruster],'thrusterReady thrusterSquat heelReach thrusterReady'],
  'skater-jumps': [[skate],'skaterStart skaterAir skaterOther skaterAir skaterStart'],
  'jump-lunges': [[jumpLunge],'lunge splitJump lungeOther splitJump lunge'],
  'lunge-jump-hop': [[jumpLunge,fit('jumps','Jumps')],'lunge splitJump lungeOther splitJump lunge stand ropeAir stand lunge'],
  'star-jumps': [[starJump],'narrow narrowSquat starAir narrowSquat narrow'],
  'squat-pulse-star-jump': [[pulse,starJump],'narrow narrowSquat narrowPulse narrowSquat narrowPulse narrowSquat starAir narrowSquat narrow'],
  'walk-it-out-inchworms': [[reference('Rowing Canada「Dynamic Warm-Up — Inchworm」','https://rowingcanada.org/uploads/2019/02/RCA-CAN-ROW-Coaches-Handbook-Final.pdf')],'stand burpeeBend walkHands plank walkHands burpeeBend stand'],
  'bear-walkouts': [[reference('JustGains「Bear Hold to Walkout」','https://justgains.com/e/bear-hold-to-walkout')],'bear bearWalkStep plank bearWalkStep bear'],
  'bodyweight-thrusters': [[thruster,squatJump],'thrusterReady thrusterSquat jump landing thrusterReady']
};

export function trainingFor(slug) {
  if (slug==='heel-tap-jumps') return {diagram:heelTapJumpDiagram,writtenSources:heelTapJumpDiagram.references};
  const plan = plans[slug];
  if (!plan) return null;
  const [writtenSources,sequence,sides=false] = plan;
  const keys = sequence.split(' ');
  const stages = keys.map((key,index)=> {
    if (!poses[key]) throw new Error('Missing animation pose: '+key+' for '+slug);
    const button = index===0 ? '開始姿勢' : index===1 ? '主な動き' : undefined;
    return {points:poses[key],button};
  });
  const support = slug.includes('wall-sit') ? 'wall' : slug==='tricep-dips-on-couch' ? 'chair' : undefined;
  const stageSeconds = slug==='3-second-hold-low-squats' ? 1.5 : slug==='negative-push-ups' ? 1.25
    : slug==='fast-feet' ? .3 : keys.length>6 ? .48 : .68;
  return {writtenSources,sides,diagram:{stages,support,stageSeconds}};
}
