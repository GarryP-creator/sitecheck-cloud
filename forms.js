/* =====================================================================
   SiteCheck — form definitions

   Every form in the app. Shared by index.html and by induct.html, the
   public pre-arrival induction page, so the two can never drift apart.

   Adding a form needs no other change anywhere: copy a block and change
   the questions.

   item types: check | text | textarea | number | date | tel | select
               | photo | file | risk | sign | repeat | talk | activity
               | method
   ===================================================================== */
const FORMS = [
{
  id:'f01', code:'F01', cat:'checklist',
  title:'Site Set-Up / Pre-Start Checklist',
  desc:'Complete before works begin on any new site',
  sections:[
    {title:'Notification & documents', items:[
      {id:'a1',type:'check',text:'F10 notification submitted to HSE where the project is notifiable',
       guide:'Notifiable if the work lasts longer than 30 working days AND has more than 20 workers on site at any one time, or exceeds 500 person days.'},
      {id:'a2',type:'check',text:'Copy of the F10 displayed where workers can read it'},
      {id:'a3',type:'check',text:'Construction Phase Plan in place, site-specific and available on site',
       guide:'Required for every project, notifiable or not, before the construction phase starts.'},
      {id:'a4',type:'check',text:'Pre-Construction Information received from the client / Principal Designer'},
      {id:'a5',type:'check',text:'Arrangements agreed for the Health & Safety File'},
    ]},
    {title:'Site set-up', items:[
      {id:'b1',type:'check',text:'Site boundary secure — hoarding, fencing and gates in good order'},
      {id:'b2',type:'check',text:'Site signage in place at all entrances (site rules, PPE, no unauthorised entry)'},
      {id:'b3',type:'check',text:'Traffic and pedestrian routes separated, one-way system agreed where needed'},
      {id:'b4',type:'check',text:'Welfare facilities available and ready for use before work starts',
       guide:'Schedule 2 welfare must be in place from day one, not fitted later.'},
      {id:'b5',type:'check',text:'Induction procedure in place and induction area identified'},
    ]},
    {title:'Emergency arrangements', items:[
      {id:'c1',type:'check',text:'Emergency procedures written, displayed and covered at induction'},
      {id:'c2',type:'check',text:'Fire points, extinguishers and assembly point in place and signed'},
      {id:'c3',type:'check',text:'First aid provision adequate for the number of workers and risk level'},
      {id:'c4',type:'text',text:'Name of appointed first aider / person'},
      {id:'c5',type:'text',text:'Nearest A&E hospital'},
      {id:'c6',type:'check',text:'Site address and what3words displayed for emergency services'},
    ]},
    {title:'Sign off', items:[
      {id:'d1',type:'textarea',text:'Actions required before work may start'},
      {id:'d2',type:'photo',text:'Site set-up photos'},
    ]},
  ]
},
{
  id:'f02', code:'F02', cat:'checklist',
  title:'Weekly Site Safety Inspection',
  desc:'Routine walk-round of the live site',
  sections:[
    {title:'Access & housekeeping', items:[
      {id:'a1',type:'check',text:'Access and egress routes clear, level and well lit'},
      {id:'a2',type:'check',text:'Housekeeping to a good standard, waste cleared and segregated'},
      {id:'a3',type:'check',text:'Materials stacked and stored safely'},
      {id:'a4',type:'check',text:'Trailing leads and hoses managed, no trip hazards on walkways'},
    ]},
    {title:'Work at height', items:[
      {id:'b1',type:'check',text:'Scaffold inspected within the last 7 days and scafftag current',
       guide:'Also required after alteration or any event likely to have affected stability.'},
      {id:'b2',type:'check',text:'Edge protection, guardrails and toe boards complete'},
      {id:'b3',type:'check',text:'Ladders used only for short-duration low-risk work, secured and in good condition'},
      {id:'b4',type:'check',text:'MEWPs in test, operators trained, harness and lanyard used in a boom lift'},
      {id:'b5',type:'check',text:'Fragile surfaces and openings covered, fixed and marked'},
    ]},
    {title:'Excavations & structures', items:[
      {id:'c1',type:'check',text:'Excavations supported or battered, inspected at the start of each shift'},
      {id:'c2',type:'check',text:'Excavations barriered, with safe access and spoil kept back from the edge'},
      {id:'c3',type:'check',text:'Buried and overhead services identified, marked and permits in force'},
      {id:'c4',type:'check',text:'Temporary works in accordance with the design, sign-off held on site'},
    ]},
    {title:'Plant, equipment & substances', items:[
      {id:'d1',type:'check',text:'Plant in test, daily pre-use checks recorded, operators hold valid tickets'},
      {id:'d2',type:'check',text:'Lifting equipment has current thorough examination and lift plan'},
      {id:'d3',type:'check',text:'110v tools used, PAT in date, no damaged leads'},
      {id:'d4',type:'check',text:'COSHH substances stored correctly, assessments available and understood'},
      {id:'d5',type:'check',text:'Dust, noise and vibration controls in use (on-tool extraction, water suppression)'},
      {id:'d6',type:'check',text:'Gas bottles secured upright, stored apart, fire points nearby'},
    ]},
    {title:'People', items:[
      {id:'e1',type:'check',text:'All operatives inducted and carrying valid cards'},
      {id:'e2',type:'check',text:'PPE worn correctly — helmet, hi-vis, boots, plus task-specific'},
      {id:'e3',type:'check',text:'RAMS briefed to the gang and signed, work matches the method'},
      {id:'e4',type:'check',text:'Permits to work in force where required and being followed'},
      {id:'e5',type:'number',text:'Number of operatives on site at time of inspection'},
    ]},
    {title:'Findings', items:[
      {id:'f1',type:'select',text:'Overall site standard',options:['Good','Acceptable','Requires improvement','Unacceptable — stop work']},
      {id:'f2',type:'textarea',text:'Observations and actions raised'},
      {id:'f3',type:'text',text:'Actions to be closed out by (name)'},
      {id:'f4',type:'date',text:'Close-out date'},
      {id:'f5',type:'photo',text:'Evidence photos'},
    ]},
  ]
},
{
  id:'f03', code:'F03', cat:'checklist',
  title:'CDM 2015 Duty Holder Compliance Check',
  desc:'Confirm the CDM appointments and duties are actually in place',
  sections:[
    {title:'Client duties', items:[
      {id:'a1',type:'check',text:'Client has been made aware of their duties under CDM 2015'},
      {id:'a2',type:'check',text:'Principal Designer appointed in writing (where more than one contractor)'},
      {id:'a3',type:'check',text:'Principal Contractor appointed in writing (where more than one contractor)'},
      {id:'a4',type:'check',text:'Adequate time and resource allowed in the programme for the work to be done safely'},
      {id:'a5',type:'check',text:'Client has checked the arrangements are being maintained through the project'},
      {id:'a6',type:'select',text:'Project type',options:['Commercial','Domestic client','Public sector','Other']},
    ]},
    {title:'Design & pre-construction', items:[
      {id:'b1',type:'check',text:'Designers have eliminated, reduced or controlled foreseeable risks so far as reasonably practicable'},
      {id:'b2',type:'check',text:'Residual design risks recorded and communicated to those who need them'},
      {id:'b3',type:'check',text:'Pre-Construction Information issued to every designer and contractor'},
      {id:'b4',type:'check',text:'Asbestos survey obtained for refurbishment or demolition works'},
    ]},
    {title:'Construction phase', items:[
      {id:'c1',type:'check',text:'Construction Phase Plan prepared before the construction phase began'},
      {id:'c2',type:'check',text:'Plan reviewed and updated as the work has changed'},
      {id:'c3',type:'check',text:'Contractors given sufficient information, instruction, training and supervision'},
      {id:'c4',type:'check',text:'Workers consulted and engaged on health and safety matters'},
      {id:'c5',type:'check',text:'Health & Safety File being compiled and kept up to date'},
    ]},
    {title:'Notes', items:[
      {id:'d1',type:'textarea',text:'Gaps identified and who is responsible for closing them'},
    ]}
  ]
},
{
  id:'f04', code:'F04', cat:'checklist',
  title:'Welfare Facilities Check',
  desc:'CDM 2015 Schedule 2 requirements',
  sections:[
    {title:'Sanitary & washing', items:[
      {id:'a1',type:'check',text:'Sufficient toilets, adequately ventilated and lit'},
      {id:'a2',type:'check',text:'Separate facilities for men and women, or lockable individual rooms'},
      {id:'a3',type:'check',text:'Wash basins with hot and cold (or warm) running water'},
      {id:'a4',type:'check',text:'Soap and a means of drying provided'},
      {id:'a5',type:'check',text:'Showers provided where the work is dirty or involves health risk'},
      {id:'a6',type:'check',text:'Facilities kept clean and in good order, cleaning schedule being followed'},
      {id:'a7',type:'number',text:'Number of toilets available'},
    ]},
    {title:'Rest, changing & drinking water', items:[
      {id:'b1',type:'check',text:'Wholesome drinking water readily accessible and clearly marked'},
      {id:'b2',type:'check',text:'Changing facilities with somewhere to dry and secure clothing'},
      {id:'b3',type:'check',text:'Rest facilities with seating, a means of heating food and boiling water'},
      {id:'b4',type:'check',text:'Rest area protects non-smokers from tobacco smoke'},
      {id:'b5',type:'check',text:'Facilities adequate for the number of people on site'},
      {id:'b6',type:'check',text:'Welfare accessible within a reasonable walking distance of the work face'},
    ]},
    {title:'Notes', items:[
      {id:'c1',type:'textarea',text:'Defects and remedial action'},
      {id:'c2',type:'photo',text:'Photos'},
    ]}
  ]
},
{
  id:'f05', code:'F05', cat:'checklist',
  title:'Contractor RAMS & Competence Review',
  desc:'Before a contractor starts on site',
  sections:[
    {title:'Company', items:[
      {id:'a1',type:'text',text:'Contractor / company name'},
      {id:'a2',type:'text',text:'Package of work'},
      {id:'a3',type:'text',text:'Site supervisor'},
    ]},
    {title:'Documents', items:[
      {id:'b1',type:'check',text:'Risk assessment and method statement received and site-specific'},
      {id:'b2',type:'check',text:'RAMS reviewed against the Construction Phase Plan, no conflicts'},
      {id:'b3',type:'check',text:'COSHH assessments provided for substances being brought on site'},
      {id:'b4',type:'check',text:'Public liability and employers liability insurance current'},
      {id:'b5',type:'date',text:'Insurance expiry date'},
      {id:'b6',type:'check',text:'Health & safety policy provided (5 or more employees)'},
    ]},
    {title:'Competence & resource', items:[
      {id:'c1',type:'check',text:'Training records and cards verified for the operatives attending'},
      {id:'c2',type:'check',text:'Plant tickets and thorough examination certificates provided'},
      {id:'c3',type:'check',text:'Equipment inspection and calibration records current'},
      {id:'c4',type:'check',text:'Supervision arrangements proportionate to the risk'},
      {id:'c5',type:'check',text:'RAMS briefed to the whole gang and signature sheet returned'},
    ]},
    {title:'Decision', items:[
      {id:'d1',type:'select',text:'Outcome',options:['Approved to start','Approved with conditions','Not approved — resubmit']},
      {id:'d2',type:'textarea',text:'Conditions or reasons'},
    ]}
  ]
},
{
  id:'f06', code:'F06', cat:'checklist',
  title:'Site Induction Record',
  desc:'One record per operative',
  sections:[
    {title:'Operative', items:[
      {id:'a1',type:'text',text:'Full name'},
      {id:'a2',type:'text',text:'Employer'},
      {id:'a3',type:'text',text:'Trade / role'},
      {id:'a4',type:'text',text:'Card number and expiry'},
      {id:'a5',type:'tel',text:'Emergency contact number'},
    ]},
    {title:'Content covered', items:[
      {id:'b1',type:'check',text:'Site rules, hours and PPE requirements'},
      {id:'b2',type:'check',text:'Site layout, welfare, access routes and no-go areas'},
      {id:'b3',type:'check',text:'Emergency procedures, alarm, assembly point and first aid'},
      {id:'b4',type:'check',text:'Key site risks and control measures'},
      {id:'b5',type:'check',text:'Accident, incident and near-miss reporting'},
      {id:'b6',type:'check',text:'Permit systems and who to report to'},
      {id:'b7',type:'check',text:'Occupational health — dust, noise, vibration, manual handling'},
      {id:'b8',type:'check',text:'Right to stop work if it is not safe, and how to raise a concern'},
    ]},
    {title:'Declaration', items:[
      {id:'c1',type:'check',text:'Operative confirms they understood the induction and any relevant medical conditions have been declared'},
      {id:'c2',type:'textarea',text:'Notes'},
    ]}
  ]
},
{
  id:'tb01', code:'TB', cat:'toolbox', titleFrom:'a1',
  title:'Toolbox Talk Record',
  desc:'Topic, who attended and what was raised',
  sections:[
    {title:'The talk', items:[
      {id:'a1',type:'select',text:'Topic',
       options:['Work at height','Manual handling','Slips, trips and falls','Dust and silica',
                'Noise','Hand-arm vibration','COSHH and hazardous substances','Asbestos awareness',
                'PPE','Housekeeping','Electrical safety and 110v','Excavations and buried services',
                'Lifting operations','Plant and pedestrian segregation','Working in confined spaces',
                'Fire prevention and hot works','Emergency procedures and first aid','Permits to work',
                'Occupational health and health surveillance','Mental health and wellbeing',
                'Heat and cold stress','Site security and public protection','Other — state below']},
      {id:'a2',type:'text',text:'Specific subject, or topic if "Other"'},
      {id:'a3',type:'text',text:'Delivered by'},
      {id:'a4',type:'text',text:'Where it was held'},
      {id:'a5',type:'number',text:'Duration (minutes)'},
      {id:'a6',type:'file',text:'Attach your own version of the talk (optional)',
       guide:'If you delivered your own document rather than the prepared talk above, attach it here and it stays with this record. PDF, Word or an image. 3MB maximum.'},
      {id:'talk',type:'talk',text:'Talk notes'},
    ]},
    {title:'What was covered', items:[
      {id:'b1',type:'textarea',text:'Key points covered',
       guide:'What the risk is, who it affects, and what people must actually do differently.'},
      {id:'b2',type:'check',text:'Relevant risk assessment and method statement referred to'},
      {id:'b3',type:'check',text:'Site conditions on the day discussed, not just the generic topic'},
      {id:'b4',type:'check',text:'Everyone given the chance to ask questions and raise concerns'},
      {id:'b5',type:'check',text:'Right to stop unsafe work restated'},
    ]},
    {title:'Who attended', items:[
      {id:'c1',type:'repeat',rowLabel:'Attendee',text:'Add everyone who attended',
       columns:[
         {id:'n',label:'Name',type:'text'},
         {id:'e',label:'Employer',type:'text'},
         {id:'t',label:'Trade',type:'text'},
         {id:'s',label:'Signature',type:'sign'},
       ]},
      {id:'c2',type:'photo',text:'Photograph of the signed attendance sheet',
       guide:'If you have taken signatures on paper, photograph it here and it will be attached to the PDF.'},
    ]},
    {title:'Raised and actions', items:[
      {id:'d1',type:'textarea',text:'Questions, concerns or suggestions raised'},
      {id:'d2',type:'textarea',text:'Actions arising'},
      {id:'d3',type:'text',text:'Action owner'},
      {id:'d4',type:'date',text:'Next talk due'},
    ]},
  ]
},
{
  id:'ac01', code:'AC', cat:'incident', titleFrom:'b5',
  title:'Accident / Incident Report',
  desc:'Injuries, near misses and dangerous occurrences',
  sections:[
    {title:'The person involved', items:[
      {id:'a1',type:'text',text:'Full name of injured or involved person'},
      {id:'a2',type:'text',text:'Employer'},
      {id:'a3',type:'text',text:'Trade / role'},
      {id:'a4',type:'select',text:'Status',options:['Employee','Subcontractor','Agency worker','Visitor','Member of the public','Other']},
      {id:'a5',type:'tel',text:'Contact number'},
    ]},
    {title:'What happened', items:[
      {id:'b1',type:'date',text:'Date it happened'},
      {id:'b2',type:'text',text:'Time it happened (24hr)'},
      {id:'b3',type:'text',text:'Exact location on site'},
      {id:'b4',type:'select',text:'Type',options:['Injury','Near miss','Dangerous occurrence','Damage only','Ill health']},
      {id:'b5',type:'select',text:'What kind of event',
       options:['Slip, trip or fall on the level','Fall from height','Struck by moving or falling object','Struck against something fixed','Manual handling','Contact with machinery','Electricity','Hazardous substance','Fire or explosion','Vehicle or plant','Other']},
      {id:'b6',type:'textarea',text:'Describe what happened, in sequence',
       guide:'Facts only. What the person was doing, what went wrong, what the outcome was. Avoid opinion or blame.'},
      {id:'b7',type:'photo',text:'Photographs of the scene'},
    ]},
    {title:'Injury and treatment', items:[
      {id:'c1',type:'text',text:'Part of body affected'},
      {id:'c2',type:'textarea',text:'Nature of the injury'},
      {id:'c3',type:'select',text:'Treatment given',
       options:['None required','First aid on site','Sent to minor injuries / walk-in','Ambulance / A&E','Taken to hospital by others','Own doctor']},
      {id:'c4',type:'text',text:'First aider who attended'},
      {id:'c5',type:'select',text:'Did the person continue working?',options:['Yes, same duties','Yes, light duties','No, went home','No, taken to hospital']},
      {id:'c6',type:'number',text:'Days unable to do normal work (if known)'},
    ]},
    {title:'RIDDOR', items:[
      {id:'d1',type:'check',text:'Assessed against RIDDOR 2013 reporting requirements',
       guide:'Reportable: death, specified injuries, over-7-day incapacitation, injury to a non-worker taken to hospital for treatment, occupational disease, dangerous occurrence.'},
      {id:'d2',type:'select',text:'Is this reportable under RIDDOR?',options:['No','Yes — specified injury','Yes — over 7 day','Yes — non-worker to hospital','Yes — dangerous occurrence','Yes — occupational disease','To be confirmed']},
      {id:'d3',type:'date',text:'Date reported to HSE (if applicable)'},
      {id:'d4',type:'text',text:'HSE reference number'},
      {id:'d5',type:'check',text:'Entered in the accident book (BI 510) where required'},
      {id:'d6',type:'check',text:'Insurer notified where required'},
    ]},
    {title:'Cause and prevention', items:[
      {id:'e1',type:'textarea',text:'Immediate cause'},
      {id:'e2',type:'textarea',text:'Underlying or root cause',
       guide:'Was the risk assessment adequate? Was the method followed? Was supervision, training or equipment a factor?'},
      {id:'e3',type:'risk',text:'Potential severity had it been worse'},
      {id:'e4',type:'textarea',text:'Action taken to prevent recurrence'},
      {id:'e5',type:'text',text:'Action owner'},
      {id:'e6',type:'date',text:'Action to be completed by'},
      {id:'e7',type:'check',text:'Risk assessment and method statement reviewed as a result'},
      {id:'e8',type:'check',text:'Findings shared with the workforce (toolbox talk or briefing)'},
    ]},
    {title:'Witnesses', items:[
      {id:'f1',type:'repeat',rowLabel:'Witness',text:'Add each witness',
       columns:[
         {id:'n',label:'Name',type:'text'},
         {id:'e',label:'Employer',type:'text'},
         {id:'c',label:'Contact',type:'text'},
         {id:'s',label:'What they saw',type:'textarea'},
       ]},
    ]},
  ]
},
{
  id:'ra01', code:'RA', cat:'ra', orient:'landscape', reviewLog:true,
  signLabel:'Assessment provided by', titleFrom:'a1',
  title:'Risk Assessment',
  desc:'Activity based, with initial and residual scoring',
  sections:[
    {title:'Assessment', items:[
      {id:'a1',type:'text',text:'Works or project this assessment covers'},
      {id:'a2',type:'text',text:'Location'},
      {id:'a8',type:'textarea',text:'Scope of the works being assessed'},
    ]},
    {title:'Hazards and controls', items:[
      {id:'a9',type:'activity',text:'Load a standard activity'},
      {id:'a4',type:'repeat',rowLabel:'Row',layout:'ra',text:'Assessment table',
       columns:[
         {id:'a',label:'Activity',type:'text'},
         {id:'h',label:'Hazard',type:'text'},
         {id:'e',label:'Effects of hazard',type:'text'},
         {id:'p',label:'Persons affected',type:'text'},
         {id:'ri',label:'Initial risk',type:'risk'},
         {id:'c',label:'Control measures',type:'textarea'},
         {id:'rr',label:'Residual risk',type:'risk'},
         {id:'ac',label:'Action / comments',type:'textarea'},
       ]},
    ]},
    {title:'Assessment details', items:[
      {id:'a5',type:'check',text:'Assessment briefed to everyone carrying out the work'},
      {id:'a3',type:'text',text:'Risk assessment provided by'},
      {id:'a6',type:'date',text:'Review date'},
      {id:'a10',type:'textarea',text:'Notes'},
      {id:'a7',type:'photo',text:'Photographs'},
    ]}
  ]
},
{
  id:'ms01', code:'MS', cat:'ra', orient:'portrait', titleFrom:'a1',
  title:'Construction Method Statement',
  desc:'Safe system of work for a specific task',
  sections:[
    {title:'The works', items:[
      {id:'a1',type:'text',text:'Task or activity covered by this method statement'},
      {id:'a2',type:'text',text:'Precise location on site'},
      {id:'a3',type:'text',text:'Contractor carrying out the work'},
      {id:'a4',type:'text',text:'Person in charge on site'},
      {id:'a5',type:'tel',text:'Contact number for the person in charge'},
      {id:'a6',type:'date',text:'Planned start date'},
      {id:'a7',type:'text',text:'Expected duration'},
      {id:'a8',type:'text',text:'Working hours and any out-of-hours agreement'},
      {id:'a9',type:'text',text:'Revision number and date'},
    ]},
    {title:'Scope of works', items:[
      {id:'b0',type:'method',text:'Load a standard method statement'},
      {id:'b1',type:'textarea',text:'Describe the work in full',
       guide:'What is being built, altered, installed or removed, and to what extent. Anyone reading this should be able to picture the job without seeing the drawings.'},
      {id:'b2',type:'textarea',text:'What this method statement does NOT cover',
       guide:'Be explicit about the boundaries. Adjacent packages, follow-on trades, anything needing a separate method statement.'},
      {id:'b3',type:'text',text:'Drawings, specifications or designs referred to'},
      {id:'b4',type:'check',text:'Associated risk assessment completed and attached'},
      {id:'b5',type:'file',text:'Attach the risk assessment or supporting document (optional)'},
    ]},
    {title:'Sequence of operations', items:[
      {id:'c1',type:'repeat',rowLabel:'Step',text:'Set out the job step by step, in the order it will be done',
       columns:[
         {id:'s',label:'Step',type:'text'},
         {id:'d',label:'What happens, and how',type:'textarea'},
         {id:'h',label:'Key hazards',type:'text'},
         {id:'c',label:'Controls',type:'textarea'},
         {id:'w',label:'Who',type:'text'},
       ]},
      {id:'c2',type:'check',text:'Sequence agreed with the principal contractor and fits the programme'},
      {id:'c3',type:'textarea',text:'Hold points — work that must stop for inspection or sign-off before continuing'},
    ]},
    {title:'People and competence', items:[
      {id:'d1',type:'number',text:'Number of operatives on this activity'},
      {id:'d2',type:'textarea',text:'Trades, roles and who reports to whom'},
      {id:'d3',type:'textarea',text:'Training, cards, tickets and certification required',
       guide:'List what each role must hold — CSCS, CPCS, IPAF, PASMA, abrasive wheels, first aid, appointed person.'},
      {id:'d4',type:'check',text:'Competence of every operative verified before starting'},
      {id:'d5',type:'check',text:'Supervision arrangements proportionate to the risk and stated above'},
      {id:'d6',type:'check',text:'All operatives will be briefed on this method statement and sign the briefing record'},
    ]},
    {title:'Plant, equipment and temporary works', items:[
      {id:'e1',type:'repeat',rowLabel:'Item',text:'Plant and equipment to be used',
       columns:[
         {id:'p',label:'Plant or equipment',type:'text'},
         {id:'r',label:'Certification / inspection required',type:'text'},
         {id:'o',label:'Operator competence',type:'text'},
       ]},
      {id:'e2',type:'check',text:'All plant in current test, with certificates available on site'},
      {id:'e3',type:'check',text:'Pre-use checks to be recorded daily'},
      {id:'e4',type:'select',text:'Does the work involve temporary works?',
       options:['No','Yes — design and sign-off in place','Yes — design still required']},
      {id:'e5',type:'text',text:'Temporary works co-ordinator (if applicable)'},
      {id:'e6',type:'check',text:'Lifting operations planned, with a lift plan where required'},
    ]},
    {title:'Materials and substances', items:[
      {id:'f1',type:'textarea',text:'Materials being used, and how they will be delivered, stored and moved'},
      {id:'f2',type:'textarea',text:'Hazardous substances and their controls',
       guide:'Anything requiring a COSHH assessment: cement, resins, solvents, adhesives, fuels, silica-producing work.'},
      {id:'f3',type:'check',text:'COSHH assessments completed and available on site'},
      {id:'f4',type:'check',text:'Manual handling assessed, mechanical aids provided where needed'},
    ]},
    {title:'Access, protection and site controls', items:[
      {id:'g1',type:'textarea',text:'How people and materials will get to and from the work area'},
      {id:'g2',type:'textarea',text:'Protection of others — site workers, other trades, the public and occupied areas'},
      {id:'g3',type:'check',text:'Exclusion zones, barriers and signage arranged'},
      {id:'g4',type:'check',text:'Work at height controls in place, or not applicable'},
      {id:'g5',type:'check',text:'Services identified, isolated or protected before work starts'},
      {id:'g6',type:'select',text:'Permits required',
       options:['None','Hot works','Confined space','Excavation / services','Roof work','Live electrical','More than one — list below']},
      {id:'g7',type:'text',text:'Permit detail, if any'},
      {id:'g8',type:'textarea',text:'PPE required for this task, beyond site minimum'},
    ]},
    {title:'Environment and waste', items:[
      {id:'h1',type:'textarea',text:'Environmental controls — dust, noise, vibration, spills, watercourses, wildlife'},
      {id:'h2',type:'text',text:'How waste from this activity will be segregated and removed'},
      {id:'h3',type:'check',text:'Neighbours or occupiers notified where the work will affect them'},
    ]},
    {title:'Emergency arrangements', items:[
      {id:'i1',type:'textarea',text:'What to do if something goes wrong during this task',
       guide:'Task-specific, not the generic site plan. Rescue from height, spill response, breaking into a service, sudden collapse.'},
      {id:'i2',type:'check',text:'Rescue plan in place where work at height or confined space is involved'},
      {id:'i3',type:'text',text:'First aider covering this activity'},
      {id:'i4',type:'text',text:'Nearest A&E hospital'},
      {id:'i5',type:'check',text:'Everyone briefed on the alarm, escape route and assembly point'},
    ]},
    {title:'Review and approval', items:[
      {id:'j1',type:'textarea',text:'Anything that would require this method statement to be stopped and revised',
       guide:'Change in ground conditions, weather, design change, unexpected services or asbestos, different plant.'},
      {id:'j2',type:'check',text:'Method statement reviewed against the construction phase plan'},
      {id:'j3',type:'text',text:'Prepared by'},
      {id:'j4',type:'text',text:'Reviewed and approved by'},
      {id:'j5',type:'date',text:'Review date'},
      {id:'j6',type:'photo',text:'Supporting photographs or sketches'},
    ]},
    {title:'Briefing record', items:[
      {id:'k1',type:'repeat',rowLabel:'Operative',text:'Everyone briefed on this method statement',
       columns:[
         {id:'n',label:'Name',type:'text'},
         {id:'e',label:'Employer',type:'text'},
         {id:'t',label:'Trade',type:'text'},
         {id:'s',label:'Signature',type:'sign'},
       ]},
      {id:'k2',type:'check',text:'Everyone above confirmed they understood the method and can raise concerns'},
    ]},
  ]
},
{
  id:'hz01', code:'HZ', cat:'hazard', titleFrom:'a1',
  title:'Report a Hazard',
  desc:'Quick capture — takes about a minute',
  sections:[
    {title:'What and where', items:[
      {id:'a1',type:'text',text:'Exact location'},
      {id:'a2',type:'textarea',text:'What is the hazard?'},
      {id:'a3',type:'photo',text:'Photo of the hazard'},
      {id:'a4',type:'risk',text:'Rate the risk'},
    ]},
    {title:'Response', items:[
      {id:'b1',type:'select',text:'Immediate action taken',
       options:['Made safe on the spot','Area barriered off','Work stopped','Reported only — no action possible']},
      {id:'b2',type:'textarea',text:'Describe the action taken'},
      {id:'b3',type:'select',text:'Urgency',options:['Attend now','Within 24 hours','This week','Monitor']},
      {id:'b4',type:'text',text:'Passed to (name)'},
      {id:'b5',type:'check',text:'Site supervisor informed'},
    ]}
  ]
}
];
