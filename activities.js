/* ============================================================================
   SiteCheck — standard risk assessment activities

   Pick an activity in a risk assessment and these rows are added to the table,
   ready to edit, delete or add to. They are a starting point written to common
   UK construction practice, not a substitute for assessing the actual job.

   Each row is:
     R(activity, hazard, effects, persons affected,
       initial likelihood, initial severity,
       control measures,
       residual likelihood, residual severity,
       action / comments)

   Likelihood x Severity = Risk.  High 11-25, Medium 6-10, Low 1-5.
   ========================================================================== */

const R = (a, h, e, p, il, is, c, rl, rs, ac) => ({
  a, h, e, p,
  ri: { l: il, s: is, score: il * is },
  c,
  rr: { l: rl, s: rs, score: rl * rs },
  ac,
});

const ACTIVITIES = {

'Site vehicles, deliveries and parking': [
  R('Site vehicles and deliveries', 'Collision with vehicles, plant or delivery lorries',
    'Potential for death and major injury', 'Site workers, other trades and the general public', 3, 4,
    'Designated unloading areas and delivery time slots.\nBanksman for all reversing movements.\nPedestrian routes segregated from vehicle routes.\nRestrict deliveries during periods of heavy pedestrian traffic.', 1, 4,
    'Advise workers and suppliers of the control measures. Hi-visibility clothing for all banksmen and reversing assistants.'),
  R('Site vehicles and deliveries', 'Struck by reversing vehicle',
    'Potential for death and crush injuries', 'Site workers and the general public', 3, 5,
    'One-way system where site layout allows.\nReversing alarms and cameras fitted.\nExclusion zone maintained during reversing.\nEye contact with the operator before crossing.', 1, 5,
    'Site supervisor to monitor compliance and challenge unsafe movements.'),
],

'Manual handling and materials movement': [
  R('Materials handling and movements', 'Manual handling injuries',
    'Potential for strains, sprains and long term back damage', 'Site workers', 4, 3,
    'Manual handling awareness training, covered at induction and toolbox talks.\nMechanical aids provided — trolleys, kerb lifters, telehandler.\nTwo person lift for awkward or bulky loads.\nLoads broken down where practicable.', 1, 3,
    'Supervision to monitor handling operations and intervene where poor technique is seen.'),
  R('Materials handling and movements', 'Trips and falls while carrying materials',
    'Potential for pulls, strains and abrasions', 'Site workers, communal workers and the public', 3, 3,
    'Route checked and cleared before lifting.\nHandling equipment used to assist movement through communal areas.\nSafe system of work to restrict movement of materials through occupied areas.', 1, 3,
    'Communicate with the client and establish agreed routes and site rules.'),
],

'Materials storage and housekeeping': [
  R('Materials storage', 'Falling or collapsing stacks',
    'Potential for crush injuries and fractures', 'Site workers', 4, 3,
    'Safe stacking systems with height restrictions.\nMaterials banded and stored on level ground.\nNothing stacked against scaffolds or hoardings.', 1, 3,
    'Site supervision to continually monitor and maintain storage standards.'),
  R('Materials storage', 'Blocking escape routes and emergency exits',
    'Potential for death in the event of fire', 'Site workers and communal workers', 4, 5,
    'Storage areas controlled to keep escape routes and walkways clear at all times.\nDaily check of escape routes by the supervisor.', 1, 5,
    'Escape routes to be walked and checked at the end of every shift.'),
  R('Housekeeping', 'Poor housekeeping presenting trip hazards',
    'Slip and trip injuries, pulls, strains and abrasions', 'Site workers', 4, 3,
    'Housekeeping protocol to clear materials, debris and tools from the floor as work proceeds.\nWaste segregated and removed daily.\nLeads and hoses routed overhead or to the edge.', 1, 3,
    'Clear as you go. Tools kept in boxes when not in use and areas cleaned at the end of each shift.'),
],

'Working at height': [
  R('All works: working at height', 'Falls from height during the course of the works',
    'Potential for death', 'Site workers', 3, 5,
    'Avoid work at height where the task can be done from the ground.\nHazard awareness instruction to all operatives, who must acknowledge understanding of the risk assessment and safe method before access is permitted.\nScaffold inspected and tagged within the last 7 days.\nEdge protection, guardrails and toe boards in place.', 1, 5,
    'Site supervisor to complete access equipment inspection before allowing access to work. Exclude any person whose conduct increases the risk and report to the line manager.'),
  R('All works: working at height', 'Falling tools and materials from height',
    'Potential for head injuries and death to those below', 'Site workers and the general public', 3, 4,
    'Operatives briefed on the danger of careless conduct at height.\nBrick guards and debris netting fitted.\nExclusion zone below the working area with barriers and signage.\nNo loose materials left at height at the end of a shift.', 1, 4,
    'Limit access to the work area by other trades and the general public.'),
],

'Scaffolding, towers and ladders': [
  R('Access equipment', 'Collapse or failure of scaffold or tower',
    'Potential for death and major injury', 'Site workers', 2, 5,
    'Scaffold erected by a competent contractor to a design where required.\nHandover certificate obtained before first use.\nInspected every 7 days, after alteration and after high winds, and tagged.\nNo unauthorised alteration of any scaffold.', 1, 5,
    'Scafftag checked before every access. No tag, no access.'),
  R('Access equipment', 'Falls from ladders and stepladders',
    'Potential for fractures and serious injury', 'Site workers', 3, 4,
    'Ladders used only for short duration, low risk work.\nThree points of contact maintained, ladder tied off and extending 1m above the landing.\nPre-use inspection of all ladders and stepladders.', 1, 4,
    'Site supervisor to complete stepladder inspection before allowing access to work.'),
],

'Roof work': [
  R('Roof work', 'Falls through fragile surfaces and rooflights',
    'Potential for death', 'Site workers', 3, 5,
    'All rooflights and fragile surfaces treated as fragile until proven otherwise.\nCovers or barriers fitted and marked before work begins.\nCrawling boards used where required.\nRoof work permit issued daily.', 1, 5,
    'Rescue plan in place. MEWP stationed at ground level where fall arrest is in use.'),
  R('Roof work', 'Falls from the roof edge',
    'Potential for death', 'Site workers', 3, 5,
    'Permanent edge protection installed before other roof work commences.\nHarness and twin lanyard clipped to a running line where edge protection is incomplete.\nWork suspended in high winds.', 1, 5,
    'Edge protection inspected and tagged before the roof is released to following trades.'),
],

'Hot works and smoking': [
  R('All works: hot works and smoking', 'Fire risk',
    'Potential for death', 'Site workers, communal workers and the general public', 3, 5,
    'No smoking policy on site.\nMaintain suitable fire extinguishing devices in the work area.\nClearly identify emergency escape routes and assembly points.\nControl hot works to an approved method statement including removal of combustible materials and a one hour fire watch after work finishes.', 1, 5,
    'Establish location of fire points and escape routes. Consult the client on the impact of the works on existing fire plans. Where a hot works permit is required it will be issued by the client and must be used in accordance with their instructions.'),
],

'Installation works': [
  R('All works: installation work', 'Accidents during installation of materials, metalwork and components',
    'Potential for cuts, abrasions, pulls and strains', 'Site workers', 3, 3,
    'Control installation work to approved method statements including safe storage and movement of materials.\nWalk routes and emergency escapes kept clear at all times.\nProtection measures to prevent access by communal workers.', 1, 3,
    'Minimum PPE required: hard hat, hi-visibility vest, protective footwear, cut resistant gloves.'),
],

'Asbestos': [
  R('Asbestos', 'Exposure to inhalation of asbestos dust or fibres if disturbed',
    'Potential for serious long term illness and death', 'Site workers, communal workers and visitors', 5, 5,
    'Before commencing any intrusive work the asbestos register must be checked.\nRefurbishment and demolition survey obtained for any pre-2000 building.\nWhere asbestos has been present, request evidence of removal by a licensed contractor.\nIf asbestos is found or suspected during the works, stop immediately, leave it undisturbed and inform the site manager and health and safety personnel without delay.', 1, 5,
    'Communicate with the client and ensure the asbestos register is checked. Site supervision to continually monitor awareness in all working areas.'),
],

'Dust, silica and cutting operations': [
  R('Cutting, grinding and chasing', 'Inhalation of respirable crystalline silica and construction dust',
    'Potential for silicosis, COPD and lung cancer', 'Site workers and others in the vicinity', 4, 5,
    'Plan cuts off site or off tool wherever possible.\nWater suppression or on-tool extraction (M or H class) used for all cutting, grinding and chasing.\nFFP3 respiratory protection, face fit tested to the individual.\nNo dry cutting or dry sweeping under any circumstances.', 1, 5,
    'Face fit test records held for all operatives. Extraction units tested and emptied correctly.'),
],

'Noise and vibration': [
  R('Noise', 'Exposure to high noise levels',
    'Permanent noise induced hearing loss and tinnitus', 'Site workers and others nearby', 4, 3,
    'Noise reduced at source by tool selection and task planning.\nHearing protection provided and worn for the whole exposure.\nOthers warned before noisy tasks begin.\nNoisy works scheduled to limit exposure of other trades.', 1, 3,
    'Health surveillance where exposure exceeds the action level.'),
  R('Hand-arm vibration', 'Prolonged use of vibrating tools',
    'Hand-arm vibration syndrome, permanent numbness and loss of grip', 'Site workers', 4, 4,
    'Trigger time monitored and recorded rather than shift length.\nLow vibration tools selected and kept sharp and serviced.\nJob rotation across the gang.\nHands kept warm and dry.', 1, 4,
    'Report numbness or tingling immediately. HAVS is reportable under RIDDOR.'),
],

'Electrical work and temporary supplies': [
  R('Electrical works', 'Contact with live electricity',
    'Potential for death, burns and cardiac arrest', 'Site workers', 3, 5,
    '110v centre tapped supply for all site tools.\nAll portable equipment PAT tested and in date.\nLeads inspected before use, damaged leads removed from service.\nIsolate, lock off, prove dead and prove the tester before any work on electrical systems.', 1, 5,
    'No work on live systems. Permit required for any work near live services.'),
  R('Electrical works', 'Contact with buried or concealed services',
    'Potential for death, burns and explosion', 'Site workers', 3, 5,
    'Service drawings obtained and reviewed before work.\nCAT and Genny scan of the area, repeated as work progresses.\nTrial holes dug by hand to confirm positions.\nAll services assumed live until proven otherwise.', 1, 5,
    'Permit to dig required for all intrusive ground works.'),
],

'Excavations and groundworks': [
  R('Excavations', 'Collapse of excavation sides',
    'Potential for death by crushing and asphyxiation', 'Site workers', 3, 5,
    'Excavations over 1.2m supported or battered back to a safe angle.\nInspected at the start of every shift, after any collapse and after heavy rain.\nSafe access and egress provided.\nSpoil, plant and materials kept back from the edge.', 1, 5,
    'Inspection record completed and held on site. Excavation barriered and lit before leaving site.'),
  R('Excavations', 'Persons or vehicles falling into the excavation',
    'Potential for death and major injury', 'Site workers and the general public', 3, 4,
    'Excavation barriered on all sides and lit.\nCovered or fenced securely before leaving site each day.\nStop blocks provided where plant works near the edge.', 1, 4,
    'Perimeter checked at the end of every shift.'),
],

'Demolition and strip out': [
  R('Demolition and strip out', 'Uncontrolled collapse of structure',
    'Potential for death and major injury', 'Site workers and the general public', 3, 5,
    'Demolition carried out to a sequence agreed in a method statement prepared by a competent person.\nStructural survey obtained before work begins.\nExclusion zones established and maintained.\nNo unplanned removal of load bearing elements.', 1, 5,
    'Temporary works design obtained where propping is required.'),
  R('Demolition and strip out', 'Exposure to dust, sharps and hidden services',
    'Respiratory harm, cuts and electrocution', 'Site workers', 4, 4,
    'Services isolated and proven dead before strip out.\nDust suppression in use throughout.\nCut resistant gloves and eye protection worn.\nSharps and nails removed or made safe as work proceeds.', 1, 4,
    'Asbestos register checked before any intrusive strip out.'),
],

'Lifting operations': [
  R('Lifting operations', 'Failure of lifting equipment or dropped load',
    'Potential for death and crush injuries', 'Site workers and the general public', 2, 5,
    'Lift plan prepared by an appointed person for all but the simplest lifts.\nAll lifting equipment and accessories within current thorough examination.\nLoad weight confirmed and within the SWL of every item in the chain.\nExclusion zone below and around the lift, nobody under a suspended load.', 1, 5,
    'Lifts suspended in high wind or poor visibility. Only one banksman to give signals.'),
],

'Plant and machinery': [
  R('Plant and machinery', 'Contact with moving plant or machinery parts',
    'Potential for death, crush and entanglement injuries', 'Site workers', 3, 5,
    'Operators hold valid tickets for the plant in use.\nDaily pre-use checks recorded.\nGuards in place and never removed while the machine is in use.\nNo loose clothing or gloves near rotating parts.', 1, 5,
    'Plant immobilised and keys removed at the end of every shift.'),
],

'COSHH and hazardous substances': [
  R('Use of hazardous substances', 'Exposure to cement, resins, solvents and adhesives',
    'Burns, dermatitis, respiratory irritation and long term ill health', 'Site workers', 4, 3,
    'COSHH assessment read before the container is opened.\nGloves appropriate to the substance provided and changed when contaminated.\nWashing facilities available, hands washed before eating or smoking.\nSubstances stored in original labelled containers, lidded and bunded where required.', 1, 3,
    'Eyewash provision confirmed in the work area. Wet cement is caustic and must not be allowed to sit against skin.'),
],

'Confined spaces': [
  R('Confined space entry', 'Asphyxiation, toxic atmosphere or engulfment',
    'Potential for death, including to would-be rescuers', 'Site workers and rescuers', 3, 5,
    'Avoid entry where the work can be done from outside.\nEntry only under permit with atmospheric testing before and continuous monitoring during.\nTop man stationed at the entry point in constant communication.\nTrained rescue team and equipment available before entry.', 1, 5,
    'Under no circumstances is anyone to enter to attempt a rescue. Raise the alarm.'),
],

'Working in occupied premises': [
  R('Working in occupied buildings', 'Injury to occupants, staff or the public',
    'Potential for death and major injury', 'Communal workers, occupants and the general public', 3, 4,
    'Work areas segregated with barriers, screens and signage.\nWorks programmed to avoid peak occupancy where possible.\nEscape routes for occupants maintained at all times.\nOccupants and building management notified in advance of disruptive works.', 1, 4,
    'Liaise with the client representative daily. Any change to escape routes must be agreed in writing.'),
  R('Working in occupied buildings', 'Unauthorised access to the work area',
    'Potential for injury to untrained persons and children', 'The general public', 3, 4,
    'Work area secured whenever unattended.\nTools, materials and plant made safe and inaccessible.\nSignage displayed at all approaches.', 1, 4,
    'Challenge politely anyone in the work area who should not be there.'),
],

'Welfare, fire and emergency arrangements': [
  R('Welfare and emergency arrangements', 'Inadequate welfare or emergency provision',
    'Ill health, delayed treatment and worsened outcomes', 'Site workers', 3, 3,
    'Welfare facilities meeting CDM 2015 Schedule 2 available before work starts.\nFirst aid provision proportionate to the numbers and risk on site.\nEmergency procedures displayed and covered at induction.\nSite address and what3words displayed for emergency services.', 1, 3,
    'Nearest A&E identified and communicated at induction.'),
],

'Weather and environmental conditions': [
  R('Adverse weather', 'Working in high wind, heat, cold or poor visibility',
    'Falls, heat stress, cold stress and impaired judgement', 'Site workers', 3, 3,
    'Work at height and lifting suspended above agreed wind speeds.\nDrinking water and shade available in hot weather, heavy work scheduled for cooler hours.\nAppropriate clothing for cold and wet conditions.\nAdditional task lighting in poor visibility.', 1, 3,
    'Supervisor to make the call on stopping work. Nobody to be pressured into working in unsafe conditions.'),
],

};

/* 'General activities' loads the site-wide set in one go — the standing
   assessment most jobs need before anything task-specific is added. */
const GENERAL_SET = [
  'Site vehicles, deliveries and parking',
  'Manual handling and materials movement',
  'Materials storage and housekeeping',
  'Working at height',
  'Hot works and smoking',
  'Installation works',
  'Electrical work and temporary supplies',
  'Asbestos',
  'Working in occupied premises',
  'Welfare, fire and emergency arrangements',
];

if (typeof module !== 'undefined') module.exports = { ACTIVITIES, GENERAL_SET };
