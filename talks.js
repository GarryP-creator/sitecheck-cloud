/* ============================================================================
   SiteCheck — toolbox talk library

   One entry per topic in the Toolbox Talk form. Pick a topic and these notes
   appear, ready to deliver or to print as a briefing sheet with an attendance
   grid on the back.

   Edit freely. Each talk needs:
     why    one or two lines on why it matters on this site
     points the things to actually say, in order
     do     what good practice looks like, short lines
     dont   the specific mistakes people actually make
     ask    questions to put to the group, so it isn't a lecture
     ref    where the requirement comes from
   ========================================================================== */

const TALKS = {

'Work at height': {
  why: 'Falls from height remain the biggest single cause of death in construction. Most are from low heights and short-duration jobs where nobody bothered setting up properly.',
  points: [
    'Avoid it first. If the job can be done from the ground, do it from the ground.',
    'Scaffold: check the tag before you step on. Inspected within the last 7 days, and again after any alteration or high winds. No tag, no access.',
    'Never remove a guardrail, brick guard or toe board without permission, and put it back before you leave the lift.',
    'Ladders are for short-duration, low-risk work only. Three points of contact, tied off, one metre above the landing.',
    'In a boom-type MEWP, harness and short lanyard clipped to the anchor point. Not to the handrail.',
    'Cover and clearly mark every opening and fragile surface. Assume any rooflight will not take your weight.',
  ],
  do: [
    "Check the scaffold tag before you step on it",
    "Tie ladders off and keep three points of contact",
    "Clip your harness to the anchor point in a boom lift",
    "Cover and mark openings as soon as they are formed",
    "Put guardrails and toe boards back before you leave the lift",
  ],
  dont: [
    "Use a ladder for a long or two-handed job",
    "Remove edge protection without permission",
    "Step on a rooflight or any fragile surface",
    "Overreach \u2014 move the platform instead",
    "Clip a lanyard to the handrail",
  ],
  ask: [
    'Where on this site are we still working near an unprotected edge?',
    'If you turned up to a scaffold with no tag on it tomorrow, what would you do?',
  ],
  ref: 'Work at Height Regulations 2005',
},

'Manual handling': {
  why: 'Handling injuries are the most common cause of over-seven-day absence in construction, and back damage tends to be permanent rather than temporary.',
  points: [
    'Think before you lift. Where is it going, is the route clear, do you need help?',
    'Use the mechanical aid if there is one. Telehandler, pallet truck, wheelbarrow, kerb lifter.',
    'Close to the body, back straight, bend the knees, no twisting. Turn with your feet.',
    'Two-person lift for scaffold boards, kerbs, plasterboard and anything awkward rather than heavy.',
    'Break the load down. Two trips beats one injury.',
    'Report any ache that lasts beyond the shift. Early is treatable, late often is not.',
  ],
  do: [
    "Use the mechanical aid where there is one",
    "Check the weight before you commit to the lift",
    "Back straight, knees bent, load close to the body",
    "Ask for help with anything bulky or awkward",
    "Clear the route before you pick it up",
    "Wear gloves for sharp edges and boots for heavy items",
  ],
  dont: [
    "Twist at the waist \u2014 turn with your feet",
    "Snatch at the load",
    "Lift a heavy or bulky item on your own",
    "Lift above shoulder height or over-extend",
    "Block your view with the load",
    "Carry on through pain",
  ],
  ask: [
    'What is the worst thing we are lifting by hand on this site at the moment?',
    'What kit would make that job easier?',
  ],
  ref: 'Manual Handling Operations Regulations 1992',
},

'Slips, trips and falls': {
  why: 'The most common cause of injury on site, and the most preventable. Almost always the result of something left where it fell.',
  points: [
    'Clear as you go. Do not leave it for the end of the shift or for someone else.',
    'Keep walkways clear of offcuts, banding, packaging and reinforcement mesh.',
    'Route leads and hoses overhead or along the edge, never across a walkway.',
    'Report standing water, mud runs and failed lighting rather than walking around them.',
    'Cover holes and mark changes in level. Others will not know they are there.',
    'Correct boots with a decent sole and proper ankle support, laced up.',
  ],
  do: [
    "Clear as you go, every shift",
    "Route leads and hoses overhead or along the edge",
    "Cover holes and mark changes in level",
    "Report standing water, mud runs and failed lighting",
    "Wear boots with a good sole, properly laced",
  ],
  dont: [
    "Leave offcuts, banding or packaging where they fall",
    "Run a lead across a walkway",
    "Walk around a hazard and leave it for the next person",
    "Take shortcuts across uncleared ground",
    "Carry a load you cannot see over",
  ],
  ask: [
    'Where is the worst walkway on this site right now?',
    'Who is going to sort it, and by when?',
  ],
  ref: 'Workplace (Health, Safety and Welfare) Regulations 1992',
},

'Dust and silica': {
  why: 'Silica dust from concrete, brick, block and stone causes silicosis and lung cancer. It kills far more construction workers than falls do, but decades later, so it gets ignored.',
  points: [
    'The dangerous dust is the fine stuff you cannot see hanging in the air, not the visible cloud.',
    'Cut, grind and chase with water suppression or on-tool extraction (M or H class). Dry cutting without either is not acceptable.',
    'Extraction unit must be the right class, emptied properly and tested. A domestic vacuum makes it worse.',
    'FFP3 mask as a last line, not a first. Face-fit tested, clean shaven where it seals.',
    'Never sweep dry. Vacuum it or damp it down.',
    'Plan cuts off site or off-tool where you can. The best control is not making the dust.',
  ],
  do: [
    "Use water suppression or on-tool extraction, M or H class",
    "Wear an FFP3 that has been face-fit tested to you",
    "Vacuum or damp down every time",
    "Plan cuts off site or off-tool where you can",
    "Empty and test the extraction unit properly",
  ],
  dont: [
    "Dry cut, ever",
    "Sweep dry dust",
    "Use a domestic vacuum on site dust",
    "Rely on a mask instead of controlling the dust",
    "Work in a cloud because it is only a couple of cuts",
  ],
  ask: [
    'Who here has had a face-fit test, and when?',
    'Which task on this site makes the most dust, and what are we doing about it?',
  ],
  ref: 'COSHH 2002 — HSE construction dust guidance',
},

'Noise': {
  why: 'Noise-induced hearing loss is permanent and there is no treatment. It builds up quietly over years.',
  points: [
    'If you have to shout to be understood two metres apart, the noise is a problem.',
    'Reduce it at source first: quieter kit, damping, keeping the work away from others.',
    'Hearing protection must suit the noise level and be worn for the whole exposure, not most of it.',
    'Plugs need inserting properly. Half in does almost nothing.',
    'Warn others before you start a noisy task so they can clear the area.',
    'Ringing in the ears at the end of the shift is a warning sign. Report it.',
  ],
  do: [
    "Reduce the noise at source before reaching for protection",
    "Wear protection for the whole exposure",
    "Insert plugs properly, right into the canal",
    "Warn others before starting a noisy task",
    "Report ringing in the ears at the end of a shift",
  ],
  dont: [
    "Take protection off just for a minute",
    "Use dirty or damaged plugs",
    "Assume defenders seal properly over a helmet without checking",
    "Shout over the noise instead of stopping it",
    "Ignore struggling to hear conversations at home",
  ],
  ask: [
    'Which task on this site is loudest, and could it be done a quieter way?',
    'Is anyone struggling to hear conversations at home?',
  ],
  ref: 'Control of Noise at Work Regulations 2005',
},

'Hand-arm vibration': {
  why: 'HAVS causes permanent numbness, pain and loss of grip. Once the damage is done it does not come back, and it ends careers.',
  points: [
    'Watch the trigger time, not the length of the shift. It is time actually vibrating that counts.',
    'Use the lowest-vibration tool that will do the job, and keep it sharp and serviced. Blunt kit vibrates far more.',
    'Let the tool do the work. Gripping harder pushes more vibration into your hands.',
    'Break the job up and swap around rather than one person doing all the breaking out.',
    'Keep hands warm and dry. Cold makes the damage worse.',
    'Report tingling, numbness or white fingers straight away. It is reportable under RIDDOR and treatable only if caught early.',
  ],
  do: [
    "Watch trigger time, not shift length",
    "Keep tools sharp, serviced and fit for the job",
    "Let the tool do the work",
    "Rotate the job around the gang",
    "Keep hands warm and dry",
    "Report numbness or tingling early",
  ],
  dont: [
    "Grip harder than you need to",
    "Use blunt or worn consumables",
    "Do all the breaking out yourself",
    "Run vibrating tools in the cold without gloves",
    "Hide symptoms to avoid losing the job",
  ],
  ask: [
    'Roughly how long were you on the breaker yesterday?',
    'Has anyone noticed numbness or pins and needles after a shift?',
  ],
  ref: 'Control of Vibration at Work Regulations 2005',
},

'COSHH and hazardous substances': {
  why: 'Cement, resins, solvents, adhesives and fuels all cause real harm. Cement burns and dermatitis are common and entirely avoidable.',
  points: [
    'Read the COSHH assessment before you open the container, not after something goes wrong.',
    'Wet cement burns skin. It is caustic, the burn is slow and painless at first, and it can go to the bone.',
    'Gloves suited to the substance, and change them when contaminated. Not any old rigger glove.',
    'Wash before eating, drinking or smoking. Barrier cream is not a substitute for washing.',
    'Store in the original labelled container, lidded, bunded where needed, away from ignition and drains.',
    'Know where the eyewash and washing facilities are before you start.',
  ],
  do: [
    "Read the COSHH assessment before opening the container",
    "Wear gloves suited to that substance",
    "Wash before eating, drinking or smoking",
    "Store in the original labelled container, lidded",
    "Know where the eyewash and washing facilities are",
  ],
  dont: [
    "Kneel in wet cement or let it sit against skin",
    "Decant into an unlabelled bottle",
    "Rely on barrier cream instead of washing",
    "Mix substances together",
    "Eat or drink in the work area",
  ],
  ask: [
    'What are we using on site at the moment that needs gloves?',
    'Where is the nearest eyewash to where you are working?',
  ],
  ref: 'COSHH 2002',
},

'Asbestos awareness': {
  why: 'Asbestos still kills around 5,000 people a year in the UK, more than road traffic. Anything built or refurbished before 2000 may contain it.',
  points: [
    'If the building predates 2000, assume asbestos until the survey says otherwise.',
    'Check the asbestos register and the refurbishment and demolition survey before any intrusive work.',
    'It is in more than pipe lagging: AIB ceiling tiles, textured coatings, cement sheet, floor tiles, soffits, rope seals, toilet cisterns.',
    'If you find something unexpected: stop, leave it, do not touch it, keep others out and tell the supervisor.',
    'Never sand, drill, break or sweep suspect material. The fibres are the danger and you cannot see them.',
    'Only licensed or trained operatives work with it, and only under the correct plan.',
  ],
  do: [
    "Check the register and survey before any intrusive work",
    "Assume a pre-2000 building contains it",
    "Stop immediately if you find something unexpected",
    "Keep others out and tell the supervisor",
  ],
  dont: [
    "Drill, sand, break or sweep suspect material",
    "Move or bag it yourself",
    "Assume it is only in pipe lagging",
    "Carry on because you are nearly finished",
    "Take contaminated clothing home",
  ],
  ask: [
    'Do you know where the asbestos register for this building is kept?',
    'What would you actually do if you drilled into something suspicious this afternoon?',
  ],
  ref: 'Control of Asbestos Regulations 2012',
},

'PPE': {
  why: 'PPE is the last line of defence, not the first. It only protects the person wearing it, and only if it fits and is actually worn.',
  points: [
    'PPE comes after we have designed the risk out, not instead of it.',
    'Standard site rule: helmet, hi-vis, safety boots, plus eye protection for any cutting, grinding, drilling or chasing.',
    'Helmet square on the head, chinstrap where fitted, not tipped back. Replace after any impact.',
    'Gloves matched to the task: cut resistant for handling, chemical for cement and resins, no gloves near rotating parts.',
    'Respiratory protection must be face-fit tested to the individual and the seal must be clean shaven.',
    'Check it before you put it on. Damaged, dirty or worn out PPE gives false confidence. Report it and get it replaced.',
  ],
  do: [
    "Wear helmet, hi-vis and safety boots as a minimum",
    "Eye protection for cutting, grinding, drilling or chasing",
    "Check PPE for damage before you put it on",
    "Get RPE face-fit tested and stay clean shaven where it seals",
    "Replace a helmet after any impact",
  ],
  dont: [
    "Tip your helmet back or leave the chinstrap undone",
    "Wear gloves near rotating parts",
    "Use damaged, dirty or worn out PPE",
    "Treat PPE as a substitute for a safer method",
    "Share face-fitted RPE with someone else",
  ],
  ask: [
    'Is anyone wearing PPE that does not fit properly or is past its best?',
    'What task are we doing where the PPE is doing the work the method should be doing?',
  ],
  ref: 'PPE at Work Regulations 1992, as amended 2022',
},

'Housekeeping': {
  why: 'A tidy site is a safe site, and it is the single clearest signal of how a job is being run. Clients and inspectors both judge on it.',
  points: [
    'Clear as you go is part of the job, not an extra at the end of the week.',
    'Segregate waste properly: wood, metal, plasterboard, general. Plasterboard cannot go to landfill mixed.',
    'Keep fire exits, stairs and access routes completely clear at all times.',
    'Stack materials on the flat, banded, at a safe height, and not against a scaffold or hoarding.',
    'Nails and screws in a bin, not left pointing up in a board.',
    'Last hour of the shift, leave your area better than you found it.',
  ],
  do: [
    "Clear as you go, as part of the job",
    "Segregate waste properly, plasterboard separately",
    "Keep fire exits, stairs and access routes clear",
    "Stack materials flat, banded and at a safe height",
    "Put nails and screws in a bin",
  ],
  dont: [
    "Leave it for the end of the week",
    "Stack against a scaffold or hoarding",
    "Overload skips",
    "Block an access route even briefly",
    "Leave boards with nails pointing up",
  ],
  ask: [
    'Which area lets this site down the most?',
    'What one thing would make clearing up easier for you?',
  ],
  ref: 'CDM 2015 Regulation 13, Construction (Design and Management)',
},

'Electrical safety and 110v': {
  why: 'Electricity kills quickly and burns badly, and most construction incidents involve either damaged leads or hitting buried cables.',
  points: [
    '110v centre-tapped for all site tools. 230v only where specifically authorised and RCD protected.',
    'Look at the lead before you plug in: cuts, exposed cores, taped repairs, cracked plug. Any of those and it is out of service.',
    'Check the PAT date. Out of date means out of use.',
    'Keep leads out of water, off walkways and away from where they will get run over.',
    'Never work on anything live. Isolate, lock off, prove dead with an approved tester, prove the tester.',
    'Assume every buried or concealed cable is live until proven otherwise. Scan, and dig with hand tools near services.',
  ],
  do: [
    "Use 110v centre-tapped for site tools",
    "Look at the lead before you plug in",
    "Check the PAT date is current",
    "Isolate, lock off, prove dead, prove the tester",
    "Scan for services and hand dig close to them",
  ],
  dont: [
    "Use a lead with a taped repair or exposed cores",
    "Work on anything live",
    "Run leads through water or across traffic routes",
    "Assume a buried cable is dead",
    "Bypass or defeat an RCD",
  ],
  ask: [
    'When did you last actually look at the lead on the tool you used yesterday?',
    'Where are the isolation points on this floor?',
  ],
  ref: 'Electricity at Work Regulations 1989',
},

'Excavations and buried services': {
  why: 'Ground collapses without warning, and a cubic metre of soil weighs over a tonne. People are killed in trenches barely deeper than they are tall.',
  points: [
    'No entry into an unsupported excavation over 1.2 metres. Batter it back or support it properly.',
    'Inspect at the start of every shift, after any collapse, and after heavy rain. Record it.',
    'Safe access in and out, within a reasonable distance. Not by climbing the shoring.',
    'Keep spoil, plant and materials back from the edge. Loading the edge is what causes collapse.',
    'Barrier the whole excavation and light it. Cover or fence it before you leave site.',
    'Services: drawings, then CAT and Genny, then trial holes by hand. Drawings alone are never enough.',
  ],
  do: [
    "Support it or batter it back",
    "Inspect at the start of every shift and after rain",
    "Provide proper access in and out",
    "Barrier the whole excavation and light it",
    "Use drawings, then CAT and Genny, then trial holes",
  ],
  dont: [
    "Enter an unsupported excavation over 1.2 metres",
    "Stack spoil or park plant near the edge",
    "Climb the shoring to get out",
    "Dig on the strength of drawings alone",
    "Leave it open and unfenced overnight",
  ],
  ask: [
    'Who inspected the excavation this morning, and where is that written down?',
    'Have we scanned the area we are digging tomorrow?',
  ],
  ref: 'CDM 2015 Regulations 22 and 24',
},

'Lifting operations': {
  why: 'A dropped load gives nobody time to react. Most failures come from poor planning or an unsuitable sling, not from the crane itself.',
  points: [
    'Every lift needs a plan, and complex lifts need one in writing from the appointed person.',
    'Check the certification: crane, chains, slings, shackles all in current thorough examination.',
    'Know the weight of the load and the SWL of everything in the chain. If you do not know the weight, do not lift it.',
    'Slings protected from sharp edges, load balanced, nothing loose on top of it.',
    'Exclusion zone underneath and around. Nobody walks under a suspended load, ever.',
    'Stop the lift if the wind gets up, visibility drops, or you lose sight of the slinger.',
  ],
  do: [
    "Plan every lift, and put complex ones in writing",
    "Check certification for crane, chains, slings and shackles",
    "Know the weight of the load and the SWL of the gear",
    "Protect slings from sharp edges",
    "Keep an exclusion zone under and around the lift",
  ],
  dont: [
    "Lift a load of unknown weight",
    "Walk or stand under a suspended load",
    "Use damaged slings or shackles",
    "Lift in high wind or poor visibility",
    "Have two people giving signals at once",
  ],
  ask: [
    'Who is the appointed person for lifting on this site?',
    'What is the heaviest thing we are lifting this week, and do we know its actual weight?',
  ],
  ref: 'LOLER 1998',
},

'Plant and pedestrian segregation': {
  why: 'Being struck by moving plant is one of the most common causes of death on site. Operators cannot see you as well as you think they can.',
  points: [
    'Use the pedestrian routes. They exist so plant does not have to guess where you are.',
    'Make eye contact with the operator before you cross behind or in front. If you have not, they have not seen you.',
    'Stay out of blind spots, especially behind reversing plant and around the tail swing of an excavator.',
    'Hi-vis at all times in the plant area. Dawn, dusk and rain are when it matters most.',
    'Banksman where reversing cannot be avoided, and only one banksman giving signals.',
    'Never ride on plant that is not designed to carry passengers.',
  ],
  do: [
    "Use the pedestrian routes",
    "Make eye contact with the operator before crossing",
    "Wear hi-vis at all times in the plant area",
    "Use a banksman where reversing cannot be avoided",
    "Stay where the operator can see you",
  ],
  dont: [
    "Walk behind reversing plant",
    "Cross the tail swing of an excavator",
    "Assume the operator has seen you",
    "Ride on plant not designed to carry passengers",
    "Wear headphones in the plant area",
  ],
  ask: [
    'Where do plant and people still cross on this site?',
    'Can we separate that crossing, or does it need a banksman?',
  ],
  ref: 'CDM 2015 Regulation 27 — traffic routes',
},

'Working in confined spaces': {
  why: 'Confined spaces kill, and they routinely kill the rescuer as well as the original casualty. Two out of three deaths are people going in to help.',
  points: [
    'A confined space is any enclosed area with a foreseeable specified risk. Manholes, chambers, tanks, ducts, deep trenches, roof voids.',
    'Avoid entry if the work can be done from outside. That is the first control, not the last resort.',
    'Entry only under permit, with gas testing before and continuous monitoring during.',
    'Never enter to rescue someone. Raise the alarm and let the trained rescue team do it with the right equipment.',
    'Top man stays at the entry point for the whole time, in communication, and does not get distracted.',
    'Test for oxygen, flammables and toxics. You cannot smell your way to safety.',
  ],
  do: [
    "Do the work from outside if there is any way to",
    "Enter only under a permit",
    "Test the atmosphere before entry and monitor throughout",
    "Keep a top man at the entry point, in communication",
  ],
  dont: [
    "Enter to rescue someone \u2014 raise the alarm instead",
    "Enter without a permit and gas test",
    "Rely on your senses to detect gas",
    "Leave the entry point unattended",
    "Take a shortcut because it is only a quick look",
  ],
  ask: [
    'Do we have any confined spaces on this job that are not yet identified as such?',
    'Who here is trained for confined space entry?',
  ],
  ref: 'Confined Spaces Regulations 1997',
},

'Fire prevention and hot works': {
  why: 'Site fires spread fast through timber frame, insulation and temporary protection, and hot works are the most common cause.',
  points: [
    'Hot works need a permit, and the permit runs out when it says it does.',
    'Clear combustibles within a proper radius, and protect what cannot be moved with fire blankets.',
    'Extinguisher to hand before you start, not fetched afterwards.',
    'One hour fire watch after finishing, and check again before leaving site. Most fires start after the work stops.',
    'Do not block fire exits or escape routes, even briefly.',
    'Know the alarm signal, the escape route and the assembly point for where you are working today.',
  ],
  do: [
    "Get a hot works permit before you start",
    "Clear combustibles or protect them with fire blankets",
    "Have the extinguisher to hand before striking an arc",
    "Keep a one hour fire watch after finishing",
    "Know the alarm signal and assembly point",
  ],
  dont: [
    "Start hot works without a permit",
    "Walk away as soon as the work stops",
    "Block fire exits or escape routes",
    "Leave gas bottles unsecured or lying down",
    "Work over unprotected timber or insulation",
  ],
  ask: [
    'Where is the nearest extinguisher to your work area?',
    'Where is the assembly point, and how would you get there from the second floor?',
  ],
  ref: 'Regulatory Reform (Fire Safety) Order 2005 — HSG168',
},

'Emergency procedures and first aid': {
  why: 'In an emergency nobody reads a procedure. It only works if people already know it.',
  points: [
    'Know the alarm signal and what it sounds like on this site.',
    'Know your nearest escape route and the assembly point, and a second route in case the first is blocked.',
    'Know who the first aiders are and where the first aid kit and defibrillator are kept.',
    'Emergency services need the site address and gate number. Post it, and know the what3words for the site entrance.',
    'Report every injury, however minor, and every near miss. Near misses are the free warnings.',
    'Do not move a casualty unless leaving them puts them in more danger.',
  ],
  do: [
    "Know the alarm, your escape route and the assembly point",
    "Know who the first aiders are and where the kit is",
    "Report every injury and every near miss",
    "Keep the site address and what3words to hand",
  ],
  dont: [
    "Move a casualty unless leaving them is more dangerous",
    "Assume someone else has raised the alarm",
    "Drive an injured person yourself when an ambulance is needed",
    "Treat a near miss as not worth reporting",
    "Re-enter a building until you are told it is safe",
  ],
  ask: [
    'Who are the first aiders on this site?',
    'Which gate would an ambulance come to?',
  ],
  ref: 'Health and Safety (First-Aid) Regulations 1981',
},

'Permits to work': {
  why: 'A permit is not paperwork for its own sake. It is the one system that stops two trades doing incompatible things in the same place.',
  points: [
    'Permits are required for hot works, confined spaces, live services, excavation near services, and roof work.',
    'The permit is issued to a named person, for a named task, in a named place, for a stated time.',
    'Read the conditions. They are specific to this job, not a standard form.',
    'The permit expires. If the job runs on, get it extended rather than carrying on regardless.',
    'Hand the permit back and sign off when the work is done, so the area can be released.',
    'No permit means no work. It is not negotiable, whatever the programme says.',
  ],
  do: [
    "Read the conditions \u2014 they are specific to this job",
    "Work only within the time and place stated",
    "Get the permit extended if the job runs on",
    "Hand it back and sign off when you finish",
  ],
  dont: [
    "Start work without one",
    "Carry on past the expiry time",
    "Change the scope without the permit being re-issued",
    "Let someone else work under your permit",
    "Sign off work you have not actually checked",
  ],
  ask: [
    'What work are we doing today that needs a permit?',
    'Has anyone ever carried on past a permit expiry?',
  ],
  ref: 'CDM 2015 — site rules and the construction phase plan',
},

'Occupational health and health surveillance': {
  why: 'Construction ill health kills roughly a hundred times more people than site accidents do. The difference is that it takes twenty years, so nobody connects it to the job.',
  points: [
    'The big four: dust and silica, asbestos, noise, and vibration. All slow, all permanent.',
    'Health surveillance exists to catch damage early enough to stop it getting worse. Attend the appointments.',
    'Report symptoms honestly. Hiding numbness or hearing loss protects nobody, least of all you.',
    'Skin: check for dermatitis and cement burns, and wash properly rather than relying on gloves.',
    'Sun exposure counts. Outdoor workers get significant rates of skin cancer.',
    'The controls only work if used every time. Occasional protection is not protection.',
  ],
  do: [
    "Attend health surveillance appointments",
    "Report symptoms honestly and early",
    "Use the controls every time, not most of the time",
    "Check skin for dermatitis and cement burns",
    "Cover up and use cream in the sun",
  ],
  dont: [
    "Hide numbness, hearing loss or breathlessness",
    "Skip controls because it is a short job",
    "Accept ill health as just part of the trade",
    "Miss appointments because of the programme",
    "Wash your hands in solvents or fuel",
  ],
  ask: [
    'When did you last have a hearing test or a HAVS assessment?',
    'Is there anything you have been putting off mentioning?',
  ],
  ref: 'COSHH 2002, Noise 2005, Vibration 2005 regulations',
},

'Mental health and wellbeing': {
  why: 'Construction has one of the highest suicide rates of any industry in the UK. Far more people in this trade die by suicide than by falling.',
  points: [
    'Long hours, time away from home, job insecurity and a culture of not complaining all stack up.',
    'Warning signs in others: withdrawal, uncharacteristic mistakes, temper, drinking more, stopping turning up.',
    'Ask twice. "You alright?" gets "fine" the first time. Ask again and mean it.',
    'You do not need to fix anything. Listening and taking it seriously is most of the job.',
    'Know where to point someone: Samaritans on 116 123, or the Lighthouse construction helpline on 0345 605 1956, free and 24/7.',
    'If talking is hard, text HARDHAT to the Lighthouse text service instead. No conversation needed to start.',
    'Looking after yourself is not weakness. Sleep, breaks and actually taking leave all count.',
  ],
  do: [
    "Ask twice \u2014 the first answer is usually fine",
    "Listen properly rather than trying to fix it",
    "Know where to point someone for real help",
    "Look after your own sleep and breaks",
    "Actually take your leave",
  ],
  dont: [
    "Dismiss it as someone just having a bad day",
    "Promise to keep a serious risk to yourself",
    "Wait until you have the perfect words",
    "Assume the quiet one is coping",
    "Treat speaking up as weakness",
  ],
  ask: [
    'Is the programme putting anyone under real pressure at the moment?',
    'Does everyone know who they could talk to on this site?',
  ],
  ref: 'Lighthouse Construction Industry Charity 24/7 helpline — 0345 605 1956 (UK), 1800 939 122 (ROI). Samaritans — 116 123.',
},

'Heat and cold stress': {
  why: 'Both extremes cause mistakes long before they cause collapse. Poor decisions on site are often just someone too hot or too cold to think straight.',
  points: [
    'Heat: drink before you are thirsty, take shade breaks, and watch for headache, cramp and confusion.',
    'Dark urine means you are already dehydrated. So does a headache by mid-afternoon.',
    'Plan heavy work for the cooler part of the day in hot weather.',
    'Sun protection: cover up, hard hat neck shade, and cream on ears, neck and forearms.',
    'Cold: layers rather than one thick coat, keep hands warm because cold worsens vibration damage.',
    'Watch each other. People rarely notice it in themselves.',
  ],
  do: [
    "Drink before you are thirsty",
    "Take breaks in the shade",
    "Plan heavy work for the cooler part of the day",
    "Layer up in the cold and keep hands warm",
    "Keep an eye on each other",
  ],
  dont: [
    "Wait until you feel unwell to do something about it",
    "Rely on energy drinks to keep going",
    "Work bare-headed in strong sun",
    "Ignore cramp, headache or confusion",
    "Remove PPE to cool down",
  ],
  ask: [
    'Has anyone felt light-headed or had a headache on site this week?',
    'Do we have enough drinking water where the work actually is?',
  ],
  ref: 'Workplace (Health, Safety and Welfare) Regulations 1992',
},

'Site security and public protection': {
  why: 'We are responsible for people who never chose to come near the site: neighbours, passers-by, and children who see a building site as an adventure.',
  points: [
    'Perimeter secure and locked at the end of every shift. Check it rather than assume it.',
    'Nothing left that can be climbed: no ladders on scaffold overnight, no stacked materials against the hoarding.',
    'Excavations and voids covered or fenced before you leave, every day.',
    'Plant immobilised, keys removed, buckets grounded.',
    'Challenge anyone on site you do not recognise, politely, and walk them to the office.',
    'Keep the footpath clear and safe. Mud, dust and vehicle movements affect people outside the fence.',
  ],
  do: [
    "Lock the perimeter at the end of every shift",
    "Remove ladders and anything climbable",
    "Cover or fence excavations and voids before leaving",
    "Immobilise plant and take the keys",
    "Challenge politely anyone you do not recognise",
  ],
  dont: [
    "Leave materials stacked against the hoarding",
    "Leave keys in plant overnight",
    "Leave a void uncovered",
    "Prop gates open for convenience",
    "Leave the public footpath muddy or obstructed",
  ],
  ask: [
    'Where could someone get onto this site tonight if they wanted to?',
    'What would a ten year old climb first?',
  ],
  ref: 'CDM 2015 Regulation 13 — HSE guidance on protecting the public',
},

};

if (typeof module !== 'undefined') module.exports = TALKS;
