/* ============================================================================
   SiteCheck — standard method statement outlines

   A method statement describes how one specific job will be done safely, on
   one specific site. It cannot be generic and still be worth anything. What
   these give you is the skeleton — the usual sequence, the plant, the PPE and
   the emergency arrangements — so you are editing rather than starting from a
   blank page. Every one of them needs the site detail adding before it means
   anything: actual locations, actual dimensions, actual exclusion zones.

   Each outline provides:
     scope      opening description, to be edited to the real job
     steps      the sequence of operations, in order
     plant      equipment typically needed, with certification required
     ppe        beyond the site minimum
     emergency  what to do if it goes wrong during THIS task
   ========================================================================== */

const S = (s, d, h, c, w) => ({ s, d, h, c, w });
const P = (p, r, o) => ({ p, r, o });

const METHODS = {

'Edge protection to roof or floor edge': {
  scope: 'Install temporary or permanent edge protection to the perimeter of [AREA], comprising posts, double guardrail and toe board to approximately [X] linear metres, ahead of following trades.',
  ppe: 'Full body harness and twin lanyard while within 2m of an unprotected edge. Cut resistant gloves.',
  emergency: 'In the event of a fall arrest, the supervisor raises the alarm immediately and the MEWP stationed at ground level is used for recovery. Suspension trauma begins within minutes, so recovery must start at once and must not wait for the emergency services.',
  steps: [
    S('1. Set up', 'Establish exclusion zone at ground level beneath the working area. Erect signage and barriers. Deliver materials to the working level by telehandler.',
      'Falling materials, plant movement', 'Exclusion zone barriered and signed before any material is lifted. Banksman for all telehandler movements. No trades permitted below.', 'Full gang'),
    S('2. Access', 'Access the working level via the designated stair tower or scaffold. Check the scafftag before each shift.',
      'Fall from height, defective access', 'Scafftag checked daily and before first use. No access where the tag is missing or out of date. Report any defect immediately.', 'Supervisor'),
    S('3. Install running line', 'Install the temporary horizontal running line to allow harness attachment before working near the edge.',
      'Fall from height while unprotected', 'Running line installed from the safe area working outwards. Anchor points to the designed positions only.', '2 operatives'),
    S('4. Install posts', 'Fix posts at the design centres, working from the safe area outwards. Harness clipped to the running line at all times within 2m of the edge.',
      'Fall from height, manual handling', 'Twin hook lanyard so the operative is never unclipped. Two person lift for posts. Work suspended above the agreed wind speed.', '2 operatives'),
    S('5. Guardrails and toe boards', 'Fit double guardrail and toe board to each completed bay before advancing to the next.',
      'Fall from height, falling materials', 'Each bay completed fully before moving on. No partially protected sections left at the end of a shift.', '2 operatives'),
    S('6. Inspect and hand over', 'Inspect the completed run, tag it and hand over formally to the principal contractor.',
      'Incomplete protection relied on by others', 'Area remains closed to other trades until inspected, tagged and handed over in writing.', 'Supervisor'),
  ],
  plant: [
    P('Telehandler', 'Thorough examination in date, daily pre-use check', 'CPCS or equivalent'),
    P('Harness and twin lanyard', '6-monthly inspection plus pre-use check', 'Fall arrest trained'),
    P('MEWP for rescue', 'Thorough examination in date', 'IPAF 3a/3b'),
    P('Cordless power tools', 'PAT in date', 'Site induction'),
  ],
},

'Hot works — welding, cutting and grinding': {
  scope: 'Carry out hot works comprising [WELDING / CUTTING / GRINDING] at [LOCATION], under permit, including preparation, the works themselves and the post-work fire watch.',
  ppe: 'Welding mask or face shield to the appropriate shade, flame retardant overalls, welding gauntlets, eye protection for grinding.',
  emergency: 'On discovering a fire, raise the alarm, attack only if small and it is safe to do so, and evacuate to the assembly point. Do not re-enter. The permit holder confirms all persons are accounted for.',
  steps: [
    S('1. Obtain permit', 'Obtain the hot works permit from the principal contractor or client before any equipment is brought to the work area. Confirm the permit times.',
      'Uncontrolled hot works, fire', 'No hot works without a valid permit. Work stops when the permit expires unless formally extended.', 'Supervisor'),
    S('2. Prepare the area', 'Remove all combustible materials within the required radius. Protect what cannot be moved with fire blankets. Cover or seal openings through which sparks could pass.',
      'Fire spread to adjacent areas or floors below', 'Clearance radius confirmed with the permit issuer. Openings, ducts and gaps sealed. Adjacent areas checked, including the floor below.', 'Full gang'),
    S('3. Fire precautions', 'Position the correct extinguishers at the work area. Confirm the escape route and assembly point with everyone involved.',
      'Delayed response to ignition', 'Extinguishers in place and in test before work begins, not fetched afterwards. Fire watch operative briefed and present.', 'Supervisor'),
    S('4. Carry out the works', 'Complete the hot works. Screens used where others could be exposed to arc flash or sparks.',
      'Burns, arc eye, fume inhalation', 'Welding screens erected. Local exhaust ventilation for fume, or forced ventilation in enclosed areas. Correct shade of filter.', 'Welder'),
    S('5. Fire watch', 'Maintain a continuous fire watch for one hour after the last hot work, including in adjacent areas and the floor below.',
      'Delayed ignition after work stops', 'One hour continuous watch, recorded on the permit. Area re-checked before finally leaving site.', 'Fire watch operative'),
    S('6. Close the permit', 'Return the signed permit to the issuer confirming the area is safe and the fire watch is complete.',
      'Area released while still at risk', 'Permit not returned until the full watch period has elapsed and the area is confirmed cool.', 'Supervisor'),
  ],
  plant: [
    P('Welding set / cutting equipment', 'Inspection record, PAT where electrical', 'Coded welder or trained operative'),
    P('Gas bottles', 'In test, flashback arrestors fitted', 'Trained operative'),
    P('Fire extinguishers', 'Annual service in date', 'Fire awareness'),
    P('Fume extraction', 'LEV thorough examination within 14 months', 'Site induction'),
  ],
},

'Soft strip and non-structural demolition': {
  scope: 'Soft strip of [AREA] comprising removal of fixtures, fittings, linings, ceilings and non-load-bearing partitions, with all arisings removed from site.',
  ppe: 'Cut resistant gloves, eye protection, FFP3 where dust is generated, safety boots with midsole protection.',
  emergency: 'If suspected asbestos is disturbed, stop immediately, leave the material undisturbed, evacuate the area, prevent re-entry and inform the site manager without delay. Do not attempt to clean up.',
  steps: [
    S('1. Surveys and isolations', 'Confirm the asbestos refurbishment and demolition survey has been received and read. Isolate and prove dead all services to the area.',
      'Asbestos exposure, contact with live services', 'No intrusive work until the survey is reviewed. Services isolated, locked off and proven dead by a competent person.', 'Supervisor'),
    S('2. Protect and segregate', 'Erect dust screens and protection to retained finishes and escape routes. Establish the waste route and skip position.',
      'Damage to retained areas, obstruction of escape routes', 'Escape routes maintained at all times. Protection agreed with the client representative before work starts.', 'Full gang'),
    S('3. Strip fixtures and fittings', 'Remove loose fixtures, fittings and equipment by hand, working top down.',
      'Manual handling, cuts, falling objects', 'Two person lift for heavy items. Sharps made safe as work proceeds. Nothing thrown or dropped.', 'Full gang'),
    S('4. Strip linings and ceilings', 'Remove ceilings and wall linings using hand tools, working systematically from one end of the area.',
      'Falls from height, dust, hidden services', 'Podium steps or tower for work at height, not ladders. On-tool extraction and damping down. Any unexpected service treated as live.', '2 operatives'),
    S('5. Remove partitions', 'Take down non-load-bearing partitions only, in the sequence agreed. Nothing removed that could be structural without confirmation.',
      'Uncontrolled collapse, structural damage', 'Only partitions confirmed non-structural are removed. Any doubt, stop and refer to the structural engineer.', 'Full gang'),
    S('6. Clear and hand over', 'Remove arisings, segregate waste, clean down and hand over the area.',
      'Trips, manual handling, waste segregation', 'Clear as you go. Waste segregated at source. Area left clean and safe at the end of every shift.', 'Full gang'),
  ],
  plant: [
    P('Hand tools and cordless power tools', 'PAT in date', 'Site induction'),
    P('Podium steps / mobile tower', 'Inspection record, tower tagged', 'PASMA for tower'),
    P('On-tool dust extraction', 'M or H class, tested', 'Site induction'),
    P('Waste skips', 'Licensed carrier, waste transfer notes', 'N/A'),
  ],
},

'Excavation and drainage': {
  scope: 'Excavate [DEPTH] deep trench at [LOCATION] for the installation of [SERVICE / DRAINAGE], including support, bedding, laying, backfill and reinstatement.',
  ppe: 'Hi-visibility clothing, safety boots, gloves, eye protection when breaking out.',
  emergency: 'If a service is struck, stop work, evacuate the excavation and the surrounding area, do not attempt to make it safe, and contact the utility emergency number and the site manager. If a collapse occurs, do not enter to rescue.',
  steps: [
    S('1. Locate services', 'Review service drawings. Scan the full route with CAT and Genny. Confirm positions with hand-dug trial holes.',
      'Striking live buried services', 'Drawings alone are never sufficient. Scanning repeated as the excavation advances. Hand digging within 500mm of any indicated service.', 'Groundworker'),
    S('2. Set out and protect', 'Set out the trench line. Establish barriers, pedestrian routes and signage before breaking ground.',
      'Persons or vehicles falling into the excavation', 'Full barriering to all open sides, lit where required. Stop blocks where plant works near the edge.', 'Full gang'),
    S('3. Excavate', 'Excavate to the required depth using the excavator, with a banksman in attendance at all times.',
      'Struck by plant, collapse of sides, buried services', 'Banksman positioned in the operator\'s sight. Nobody within the slew radius. Spoil kept back at least 1m from the edge.', 'Operator and banksman'),
    S('4. Support the excavation', 'Install trench support or batter the sides back as required before any person enters.',
      'Collapse of excavation sides', 'No entry to any unsupported excavation over 1.2m. Support installed from outside the trench. Inspection recorded before each entry.', 'Groundworker'),
    S('5. Lay and connect', 'Enter via the ladder provided, lay bedding and pipework, make connections and test.',
      'Collapse, manual handling, confined atmosphere', 'Daily inspection record completed before entry. Safe access ladder secured. Atmospheric testing where connecting to existing drainage.', '2 operatives'),
    S('6. Backfill and reinstate', 'Backfill in layers, compact and reinstate the surface. Remove barriers only once the surface is safe.',
      'Trips, plant movement, incomplete reinstatement', 'Barriers remain until reinstatement is complete and level. Area checked at the end of every shift.', 'Full gang'),
  ],
  plant: [
    P('360 excavator', 'Thorough examination in date, daily pre-use check', 'CPCS A59 or equivalent'),
    P('CAT and Genny', 'Calibration in date', 'Trained operative'),
    P('Trench support system', 'Inspection record', 'Trained groundworker'),
    P('Compaction plate', 'PUWER check, HAV data available', 'Site induction'),
  ],
},

'Internal fit-out — partitions and ceilings': {
  scope: 'Install metal stud partitions, plasterboard linings and suspended ceilings to [AREA], including first and second fix, taping and jointing.',
  ppe: 'Cut resistant gloves, eye protection, FFP3 when cutting or sanding board, knee protection.',
  emergency: 'In the event of injury from a cutting tool, apply first aid pressure and call the site first aider. For eye contact with dust or jointing compound, irrigate at the nearest eyewash for 15 minutes and seek medical attention.',
  steps: [
    S('1. Set out', 'Set out partition lines from the drawings and confirm against the structure. Confirm service routes with the M&E contractor.',
      'Clashes with services, working over others', 'Setting out checked before fixing. Coordination meeting held with following trades.', 'Supervisor'),
    S('2. Install track and studs', 'Fix floor and head track, install studs at the design centres.',
      'Noise, dust, hand tool injuries, drilling into services', 'Scan before drilling into any slab or wall. On-tool extraction for drilling. Hearing protection where fixing to concrete.', '2 operatives'),
    S('3. First fix and services', 'Allow M&E first fix within the partition before boarding one side.',
      'Working alongside other trades, trip hazards', 'Sequence agreed so trades are not working in the same bay. Housekeeping maintained throughout.', 'Full gang'),
    S('4. Board and line', 'Board out partitions, working at height from podium steps where required.',
      'Manual handling of boards, falls from height', 'Two person lift for full sheets, board lifter used above head height. Podium steps rather than ladders.', '2 operatives'),
    S('5. Suspended ceilings', 'Install ceiling grid and tiles, working from mobile towers.',
      'Falls from height, working overhead, dropped items', 'Tower erected and tagged by a trained operative. Exclusion beneath while working overhead. Tools tethered where practicable.', '2 operatives'),
    S('6. Tape, joint and clear', 'Tape, joint and sand. Clear all arisings and hand over the area.',
      'Dust from sanding, skin contact with compound', 'Sanding with on-tool extraction or wet sanding. Gloves worn. Area vacuumed, never dry swept.', 'Full gang'),
  ],
  plant: [
    P('Mobile tower / podium steps', 'Tagged and inspected', 'PASMA for tower'),
    P('Cordless power tools', 'PAT in date', 'Site induction'),
    P('Board lifter', 'Pre-use check', 'Site induction'),
    P('Sanding machine with extraction', 'M class extraction, PAT in date', 'Site induction'),
  ],
},

'Roof covering works': {
  scope: 'Install [ROOF COVERING] to [AREA], including preparation of the deck, insulation, membrane and all associated flashings and terminations.',
  ppe: 'Harness and lanyard where edge protection is incomplete, gloves suited to the covering, eye protection, appropriate footwear for the surface.',
  emergency: 'In the event of a fall arrest, recovery begins immediately using the MEWP positioned at ground level. For a hot works fire, raise the alarm and evacuate via the designated route — do not attempt to fight a spreading bitumen fire.',
  steps: [
    S('1. Confirm access and edge protection', 'Confirm edge protection is complete and handed over, and that access to the roof is safe and controlled.',
      'Falls from height, fragile surfaces', 'No roof access until edge protection is inspected and tagged. Rooflights and fragile areas covered and marked before work begins.', 'Supervisor'),
    S('2. Establish the working area', 'Set out material storage on the roof, avoiding point loading. Establish the exclusion zone below.',
      'Overloading the structure, falling materials', 'Loading positions agreed with the structural engineer. Materials distributed, not stacked in one place. Exclusion zone below maintained.', 'Full gang'),
    S('3. Prepare the deck', 'Clean and prepare the deck, make good any defects, install vapour control layer.',
      'Slips on the deck, manual handling', 'Deck kept clear and free of debris. Work suspended in wet or icy conditions or above the agreed wind speed.', '2 operatives'),
    S('4. Insulation and covering', 'Lay insulation and install the covering in the sequence specified, working away from the access point.',
      'Fire risk where hot works are used, fume, manual handling', 'Hot works permit where torch-on is used, with a one hour fire watch. Gas bottles secured upright. Work planned so no one is cut off from the access route.', 'Full gang'),
    S('5. Flashings and terminations', 'Complete upstands, flashings and terminations, including any work adjacent to the edge.',
      'Fall from height at the perimeter', 'Harness clipped to a running line for any work outside the edge protection. Never unclipped near an edge.', '2 operatives'),
    S('6. Inspect, clean and hand over', 'Inspect the finished covering, clear all waste from the roof and hand over.',
      'Wind-blown debris, falling materials', 'All offcuts and packaging removed from the roof at the end of every shift. Nothing left loose overnight.', 'Full gang'),
  ],
  plant: [
    P('Telehandler or hoist', 'Thorough examination in date', 'CPCS or equivalent'),
    P('Gas torch and bottles', 'In test, flashback arrestors', 'Trained operative, hot works permit'),
    P('Harness and running line', '6-monthly inspection', 'Fall arrest trained'),
    P('MEWP for rescue', 'Thorough examination in date', 'IPAF 3a/3b'),
  ],
},

'Mechanical and electrical installation': {
  scope: 'Install [M&E SERVICES] within [AREA], including containment, first fix, second fix, testing and commissioning.',
  ppe: 'Insulated gloves and tools for any electrical work, eye protection, cut resistant gloves, FFP3 when drilling overhead.',
  emergency: 'In the event of electric shock, do not touch the casualty until the supply is isolated. Isolate at the local distribution board, raise the alarm and call the first aider. All shocks, however minor, are reported and the person medically assessed.',
  steps: [
    S('1. Confirm isolations', 'Confirm the working area is isolated. Lock off, prove dead with an approved tester and prove the tester before and after.',
      'Contact with live conductors', 'Isolate, lock off, prove dead, prove the tester. Locks and tags applied by the person doing the work. No work on live systems.', 'Qualified electrician'),
    S('2. Install containment', 'Fix tray, trunking and conduit at high level, working from mobile towers.',
      'Falls from height, drilling into services, overhead work', 'Scan before drilling into slabs. Towers tagged and erected by a trained operative. Eye protection for all overhead drilling.', '2 operatives'),
    S('3. First fix', 'Pull cables and install back boxes and pipework before the area is closed in.',
      'Manual handling of drums, cuts, trips', 'Cable drums handled with the correct stands. Routes kept clear of walkways. Cut ends made safe immediately.', 'Full gang'),
    S('4. Second fix', 'Install accessories, terminate and label all circuits.',
      'Working alongside finishing trades, damage to finishes', 'Sequence coordinated with the fit-out contractor. Protection to completed finishes.', 'Full gang'),
    S('5. Test and inspect', 'Carry out inspection and testing to BS 7671. Complete certification.',
      'Inadvertent energisation, testing on live systems', 'Area controlled during testing, warning notices displayed. Only qualified persons carry out testing.', 'Qualified electrician'),
    S('6. Commission and hand over', 'Energise, commission and hand over with all certification and O&M information.',
      'Energisation while others are working on the system', 'Formal permit and sign-off before energisation. All parties notified in writing.', 'Supervisor'),
  ],
  plant: [
    P('Mobile tower / podium steps', 'Tagged and inspected', 'PASMA for tower'),
    P('Approved voltage indicator and proving unit', 'Calibration in date', 'Qualified electrician'),
    P('Test instruments', 'Calibration in date', 'Qualified electrician'),
    P('Cordless power tools', 'PAT in date', 'Site induction'),
  ],
},

'Concrete pour': {
  scope: 'Place and finish [VOLUME] of concrete to [ELEMENT] at [LOCATION], including preparation, pour, finishing and curing.',
  ppe: 'Waterproof gloves, wellingtons or waterproof boots, eye protection, waterproof trousers. No skin contact with wet concrete.',
  emergency: 'For cement contact with skin, wash immediately with clean water and continue washing — cement burns develop slowly and painlessly. For eye contact, irrigate for 15 minutes and seek immediate medical attention. Do not wait to see if it settles.',
  steps: [
    S('1. Check formwork and reinforcement', 'Confirm formwork, propping and reinforcement are complete and signed off by the temporary works co-ordinator.',
      'Formwork failure during the pour', 'No pour without written sign-off. Propping checked against the design. Nothing altered once signed off.', 'Temporary works co-ordinator'),
    S('2. Prepare access and routes', 'Establish safe access, pump position and vehicle routes. Brief the gang and the pump operator.',
      'Struck by concrete vehicles, pump line failure', 'Banksman for all vehicle movements. Exclusion zone around the pump and delivery line. Nobody in line with a pressurised delivery hose.', 'Supervisor'),
    S('3. Pour', 'Place the concrete in the agreed sequence and lift heights, maintaining even distribution.',
      'Overloading formwork, splashes, manual handling', 'Pour rate and lift heights as the temporary works design. Continuous monitoring of formwork for movement, with a nominated person watching.', 'Full gang'),
    S('4. Compact and finish', 'Vibrate, level and finish the surface.',
      'Hand-arm vibration, cement burns, slips', 'Trigger time on the poker monitored and rotated. Waterproof PPE worn, no kneeling in wet concrete without protection.', 'Full gang'),
    S('5. Clean down', 'Wash out the pump and equipment to the designated washout area only.',
      'Environmental pollution from washout', 'Washout to the designated bunded area. Nothing discharged to drains, gullies or watercourses.', 'Full gang'),
    S('6. Cure and protect', 'Apply curing and protect the pour. Barrier the area until it has gained sufficient strength.',
      'Damage to the pour, persons walking on green concrete', 'Area barriered and signed. Strike times as the temporary works design, not by eye.', 'Supervisor'),
  ],
  plant: [
    P('Concrete pump', 'Thorough examination in date, delivery line inspected', 'CPCS or equivalent'),
    P('Poker vibrator', 'PUWER check, HAV data available', 'Site induction'),
    P('Formwork and propping', 'Temporary works design and sign-off', 'Trained operative'),
    P('Power float', 'PAT in date, guards fitted', 'Trained operative'),
  ],
},

'Lifting operation using mobile crane': {
  scope: 'Lift and place [LOAD] weighing [WEIGHT] from [PICK POINT] to [SET DOWN] using a [CAPACITY] mobile crane, in accordance with the lift plan.',
  ppe: 'Hi-visibility clothing, gloves, safety boots. Nobody in the exclusion zone regardless of PPE.',
  emergency: 'If the load becomes unstable, everyone withdraws from the exclusion zone immediately and the load is set down at the nearest safe position. Nobody approaches a suspended or unstable load. If contact is made with overhead lines, the operator stays in the cab and nobody approaches the machine.',
  steps: [
    S('1. Plan the lift', 'The appointed person prepares the lift plan covering crane position, ground bearing, radius, load weight and rigging.',
      'Overturning, overload, inadequate ground', 'No lift without an approved lift plan. Ground bearing pressure checked and outrigger mats sized accordingly.', 'Appointed person'),
    S('2. Set up the crane', 'Position the crane, deploy and mat the outriggers, confirm level and check the radius.',
      'Overturning, ground failure, overhead services', 'Outriggers fully deployed on mats. Overhead lines identified and goal posts or exclusion applied. Crane level confirmed before rigging.', 'Operator'),
    S('3. Establish exclusion zone', 'Barrier the full slew radius and the lift path. Brief everyone involved and confirm the signalling method.',
      'Persons struck by the load or the slewing crane', 'Exclusion zone maintained throughout. One nominated slinger/signaller only. Radio checks completed before the lift.', 'Supervisor'),
    S('4. Rig the load', 'Attach slings and shackles as the lift plan, protect against sharp edges and fit tag lines.',
      'Sling failure, load slipping', 'All accessories in current thorough examination. SWL of every item confirmed against the load. Softeners at all sharp edges.', 'Slinger'),
    S('5. Trial lift and lift', 'Raise the load slightly, confirm balance and stability, then complete the lift under the signaller\'s direction.',
      'Dropped load, load swing', 'Trial lift to confirm balance before committing. Tag lines used to control swing. Lift stopped if wind or visibility changes.', 'Operator and slinger'),
    S('6. Set down and de-rig', 'Land the load on prepared bearers, confirm stability, de-rig and stand the crane down.',
      'Load toppling after landing, trapped hands', 'Load stable and packed before slings are released. Hands kept clear when landing. Crane boomed down and secured.', 'Full gang'),
  ],
  plant: [
    P('Mobile crane', 'Thorough examination in date, LOLER report available', 'CPCS A60 or equivalent'),
    P('Slings, chains and shackles', 'Thorough examination within 6 months, colour coded', 'Trained slinger'),
    P('Outrigger mats', 'Sized to the ground bearing calculation', 'N/A'),
    P('Tag lines', 'Pre-use inspection', 'Trained slinger'),
  ],
},

'Scaffold erection, alteration and dismantle': {
  scope: 'Erect, alter and subsequently dismantle [TYPE] scaffold to [AREA] in accordance with [TG20 COMPLIANT DESIGN / BESPOKE DESIGN REF].',
  ppe: 'Harness and lanyard during erection and dismantle where a safe working platform is not available. Gloves and safety boots at all times.',
  emergency: 'In the event of a fall arrest, recovery begins immediately from the adjacent lift or by MEWP. If a scaffold is struck or becomes unstable, evacuate, exclude the area at ground level and do not use until inspected by a competent person.',
  steps: [
    S('1. Survey and design', 'Survey the ground conditions and the structure. Confirm the scaffold design or TG20 compliance sheet.',
      'Collapse due to inadequate foundation or design', 'Sole plates and base plates on firm level ground. No erection without the design or compliance sheet on site.', 'Supervisor'),
    S('2. Establish the area', 'Barrier the erection zone at ground level, allowing for material handling and falling objects.',
      'Persons struck by dropped components', 'Exclusion zone maintained for the full erection. Materials passed hand to hand or hoisted, never thrown.', 'Full gang'),
    S('3. Erect', 'Erect in accordance with the design, advancing guardrails as each lift is formed.',
      'Fall from height during erection', 'Advance guardrail method used so operatives are protected before accessing each new lift. Harness as a secondary measure only.', 'Scaffolders'),
    S('4. Inspect and tag', 'A competent person inspects the completed scaffold and applies the scafftag before handover.',
      'Use of an incomplete scaffold', 'Scafftag applied only on completion. Incomplete scaffolds tagged as such and access physically blocked.', 'Competent person'),
    S('5. Periodic inspection', 'Inspect every 7 days, after any alteration and after high winds or any impact. Record every inspection.',
      'Deterioration or unauthorised alteration', 'Inspection record kept on site. Any unauthorised alteration reported and the scaffold taken out of use until checked.', 'Competent person'),
    S('6. Dismantle', 'Dismantle in reverse order, lowering components under control.',
      'Fall from height, dropped components, premature removal of ties', 'Ties removed only as the level above is dismantled. Components lowered by rope or hoist, never dropped.', 'Scaffolders'),
  ],
  plant: [
    P('Scaffold components', 'Visual inspection, damaged components rejected', 'CISRS card'),
    P('Gin wheel and rope', 'Pre-use inspection, SWL marked', 'CISRS card'),
    P('Harness and lanyard', '6-monthly inspection', 'Fall arrest trained'),
    P('Scafftag system', 'N/A', 'Competent person'),
  ],
},

'Confined space entry': {
  scope: 'Entry into [CONFINED SPACE] at [LOCATION] to carry out [WORK], under permit, with atmospheric monitoring and rescue arrangements in place.',
  ppe: 'Harness with recovery line, personal gas monitor, and any RPE specified by the assessment. No entry without a working monitor.',
  emergency: 'If the alarm sounds or the entrant becomes unresponsive, the top man raises the alarm and initiates recovery from OUTSIDE the space using the recovery line and tripod. Under no circumstances does anyone enter to attempt a rescue. Two out of three confined space deaths are would-be rescuers.',
  steps: [
    S('1. Confirm entry is necessary', 'Establish whether the work can be done from outside the space. Entry is the last resort, not the default.',
      'Unnecessary exposure to a confined space', 'Every alternative considered and recorded. Entry only where the work genuinely cannot be done from outside.', 'Supervisor'),
    S('2. Obtain permit', 'Obtain the confined space entry permit. Confirm the rescue plan and that the rescue team and equipment are on site.',
      'Entry without controls or rescue provision', 'No entry without a valid permit and a rescue team present. Permit specifies entrants, duration and conditions.', 'Permit issuer'),
    S('3. Isolate and ventilate', 'Isolate all incoming services and mechanical hazards. Lock off. Ventilate the space.',
      'Inrush of substance, mechanical entrapment', 'Positive isolation, locked and tagged. Forced ventilation run for the specified period before testing.', 'Competent person'),
    S('4. Test the atmosphere', 'Test for oxygen, flammable gases and toxics at all levels before entry.',
      'Asphyxiation, toxic exposure, explosion', 'Testing at top, middle and bottom of the space. Entry only within the specified limits. Continuous personal monitoring during the work.', 'Competent person'),
    S('5. Entry and work', 'Entrant enters wearing a harness with recovery line attached. Top man maintains communication throughout.',
      'Loss of consciousness, entrapment', 'Top man remains at the entry point for the entire duration and does not leave for any reason. Communication confirmed at agreed intervals.', 'Entrant and top man'),
    S('6. Exit and close permit', 'Exit, account for all persons and equipment, and return the permit.',
      'Persons or equipment left in the space', 'Head count on exit. Space secured against re-entry. Permit signed back to the issuer.', 'Supervisor'),
  ],
  plant: [
    P('Personal and area gas monitors', 'Calibration and bump test in date', 'Trained operative'),
    P('Tripod and recovery winch', 'Thorough examination within 6 months', 'Trained rescue team'),
    P('Harness and recovery line', '6-monthly inspection', 'Confined space trained'),
    P('Forced ventilation', 'PAT in date', 'Site induction'),
  ],
},

'Working in occupied premises': {
  scope: 'Carry out [WORKS] within an occupied [BUILDING TYPE] at [LOCATION], while the premises remain in use by staff, residents or the public.',
  ppe: 'Site minimum PPE, kept on while in the work area. Consideration given to appearance and conduct in occupied areas.',
  emergency: 'In the event of an evacuation, works stop immediately, tools are made safe and operatives follow the building\'s own procedure, reporting to the building assembly point. Operatives assist with the building evacuation only if asked by the responsible person.',
  steps: [
    S('1. Liaise and programme', 'Agree working hours, access routes and disruptive activities with the client representative in advance.',
      'Conflict with building users, noise complaints', 'Noisy works programmed outside peak occupancy where possible. Occupants notified in advance of disruptive activity.', 'Supervisor'),
    S('2. Establish segregation', 'Erect hoarding, screens or barriers to separate the work area entirely from occupied areas.',
      'Unauthorised access, injury to occupants', 'Full height segregation where practicable. Doors lockable. Signage at every approach.', 'Full gang'),
    S('3. Protect escape routes', 'Confirm the building escape routes remain available and unobstructed at all times.',
      'Obstruction of escape in an emergency', 'Escape routes never obstructed, even temporarily. Any proposed change agreed in writing with the responsible person in advance.', 'Supervisor'),
    S('4. Control the works', 'Carry out the works within the segregated area, keeping noise, dust and fumes contained.',
      'Dust and fume migration, noise, vibration', 'Dust screens and negative pressure where required. Ventilation isolated where fume could migrate. Fire alarm isolation agreed for dusty work.', 'Full gang'),
    S('5. Manage deliveries and waste', 'Move materials and waste through agreed routes at agreed times, with protection to finishes.',
      'Injury to occupants, damage to the building', 'Protection to floors and walls along the route. Spotters used when moving loads through occupied areas.', 'Full gang'),
    S('6. Secure and clean daily', 'Secure the work area, make plant and tools safe, and clean shared routes at the end of every shift.',
      'Unauthorised access outside working hours', 'Area locked and tools made inaccessible. Shared routes left clean and safe. Daily check by the supervisor.', 'Supervisor'),
  ],
  plant: [
    P('Dust screens and negative air units', 'Filters checked, PAT in date', 'Site induction'),
    P('Floor and wall protection', 'N/A', 'N/A'),
    P('Hand and cordless tools', 'PAT in date', 'Site induction'),
    P('Lockable hoarding and signage', 'Daily check', 'N/A'),
  ],
},

};

if (typeof module !== 'undefined') module.exports = METHODS;
