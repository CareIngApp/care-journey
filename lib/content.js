/* ============================================================
   Care Journey - content library (v1, England)
   Single source of content truth. 22 canonical action cards,
   referenced by 12 trigger playbooks. Signposting only, not advice.
   Sources and helplines: fact-checked 8 Jun 2026, review by 8 Dec 2026.
   Every card must keep a named, trusted UK source + a review date.
   ============================================================ */

// ---- Care Funding Guide (soft signpost; no deep-link params in v1) ----
// Per Phil (9 Jun 2026): Care Journey tells the carer the CFG exists and
// links them to its front door. It does NOT deep-link a specific topic.
export const CFG = {
  name: 'Care Funding Guide',
  url: 'https://thecaring.app/care-funding-guide',
  blurb: 'A free guide from The Caring App that works out what funding and benefits you and the person you care for may be entitled to.',
};

// ---- Trusted sources (review_by drives the QA cycle) ----
const REVIEW_BY = '2026-12-08';
const s = (name, url) => ({ name, url, checked: '2026-06-08', reviewBy: REVIEW_BY });
export const SOURCES = {
  carersUK: s('Carers UK', 'https://www.carersuk.org/help-and-advice/'),
  ageUK: s('Age UK', 'https://www.ageuk.org.uk/information-advice/care/helping-a-loved-one/carers-checklist/'),
  alz: s("Alzheimer's Society", 'https://www.alzheimers.org.uk/about-dementia/dementia-diagnosis/newly-diagnosed-dementia'),
  carents: s('Carents', 'https://carents.co.uk/carenting-guides/'),
  parkinsons: s("Parkinson's UK", 'https://www.parkinsons.org.uk/support/newly-diagnosed/to-do-list'),
  stroke: s('Stroke Association', 'https://www.stroke.org.uk/'),
  macmillan: s('Macmillan', 'https://www.macmillan.org.uk/'),
  nhsSocial: s('NHS', 'https://www.nhs.uk/social-care-and-support/'),
  nhsCarer: s('NHS', 'https://www.nhs.uk/social-care-and-support/support-and-benefits-for-carers/carer-assessments/'),
  nhsCHC: s('NHS', 'https://www.nhs.uk/social-care-and-support/money-work-and-benefits/nhs-continuing-healthcare/'),
  govNeeds: s('GOV.UK', 'https://www.gov.uk/apply-needs-assessment-social-services'),
  govPoA: s('GOV.UK', 'https://www.gov.uk/power-of-attorney'),
  govCarerLeave: s('GOV.UK', 'https://www.gov.uk/carers-leave'),
  govCouncil: s('GOV.UK', 'https://www.gov.uk/find-local-council'),
  citizens: s('Citizens Advice', 'https://www.citizensadvice.org.uk/family/looking-after-people/carers-help-and-support/'),
  marieCurie: s('Marie Curie', 'https://www.mariecurie.org.uk/carer'),
  carersTrust: s('Carers Trust', 'https://carers.org/help-for-carers/introduction'),
  carersTrustFind: s('Carers Trust', 'https://carers.org/network-partners/network-partners-search'),
  mind: s('Mind', 'https://www.mind.org.uk/'),
  hospiceUK: s('Hospice UK', 'https://www.hospiceuk.org/'),
};

// ---- Helplines (offered throughout) ----
export const HELPLINES = {
  carersUK: { name: 'Carers UK Helpline', number: '0808 808 7777', hours: 'Mon to Fri, 9am to 6pm' },
  ageUK: { name: 'Age UK Advice Line', number: '0800 678 1602', hours: 'Every day, 8am to 7pm' },
  citizens: { name: 'Citizens Advice', number: '0800 144 8848', hours: 'Mon to Fri, 9am to 5pm' },
  marieCurie: { name: 'Marie Curie Support Line', number: '0800 090 2309', hours: 'Mon to Fri 8am to 6pm, Sat 11am to 5pm' },
  carersTrust: { name: 'Carers Trust', number: '0300 772 9600', hours: 'Mon to Fri, 9am to 5pm' },
  alz: { name: "Alzheimer's Society Support Line", number: '0333 150 3456', hours: 'Most days, 9am to 8pm' },
  samaritans: { name: 'Samaritans', number: '116 123', hours: 'Free, 24 hours a day' },
  nhs111: { name: 'NHS 111', number: '111', hours: '24 hours a day' },
  emergency: { name: 'Emergency services', number: '999', hours: 'For anything life-threatening' },
};

// ---- Condition tags (secondary). Tailors the condition card source + helpline ----
export const CONDITION_GROUPS = [
  { group: 'Neurological and cognitive', tags: [
    { id: 'dementia', label: 'Dementia', source: SOURCES.alz, org: "Alzheimer's Society", helpline: 'alz' },
    { id: 'stroke', label: 'Stroke', source: SOURCES.stroke, org: 'Stroke Association', helpline: 'carersUK' },
    { id: 'parkinsons', label: "Parkinson's", source: SOURCES.parkinsons, org: "Parkinson's UK", helpline: 'carersUK' },
    { id: 'ms', label: 'MS', source: SOURCES.nhsSocial, org: 'NHS', helpline: 'carersUK' },
    { id: 'mnd', label: 'Motor neurone disease', source: SOURCES.nhsSocial, org: 'NHS', helpline: 'carersUK' },
    { id: 'braininjury', label: 'Brain injury', source: SOURCES.nhsSocial, org: 'NHS', helpline: 'carersUK' },
  ]},
  { group: 'Cancer', tags: [
    { id: 'cancer', label: 'Cancer', source: SOURCES.macmillan, org: 'Macmillan', helpline: 'marieCurie' },
  ]},
  { group: 'Heart, lung and long-term physical', tags: [
    { id: 'heart', label: 'Heart and circulation', source: SOURCES.nhsSocial, org: 'NHS', helpline: 'carersUK' },
    { id: 'copd', label: 'COPD or respiratory', source: SOURCES.nhsSocial, org: 'NHS', helpline: 'carersUK' },
    { id: 'diabetes', label: 'Diabetes', source: SOURCES.nhsSocial, org: 'NHS', helpline: 'carersUK' },
    { id: 'kidney', label: 'Kidney or dialysis', source: SOURCES.nhsSocial, org: 'NHS', helpline: 'carersUK' },
    { id: 'arthritis', label: 'Arthritis or chronic pain', source: SOURCES.nhsSocial, org: 'NHS', helpline: 'carersUK' },
  ]},
  { group: 'Sensory and mental health', tags: [
    { id: 'sensory', label: 'Sight or hearing loss', source: SOURCES.nhsSocial, org: 'NHS', helpline: 'carersUK' },
    { id: 'mentalhealth', label: 'Mental health', source: SOURCES.mind, org: 'Mind', helpline: 'carersUK' },
  ]},
  { group: 'Learning disability and frailty', tags: [
    { id: 'learning', label: 'Learning disability', source: SOURCES.nhsSocial, org: 'NHS', helpline: 'carersUK' },
    { id: 'autism', label: 'Autism', source: SOURCES.nhsSocial, org: 'NHS', helpline: 'carersUK' },
    { id: 'frailty', label: 'Frailty or multiple conditions', source: SOURCES.ageUK, org: 'Age UK', helpline: 'ageUK' },
  ]},
];
export const CONDITION_BY_ID = {};
CONDITION_GROUPS.forEach(g => g.tags.forEach(t => { CONDITION_BY_ID[t.id] = t; }));

// ---- The 12 trigger start points (icon = simple inline-icon key) ----
export const TRIGGERS = [
  { id: 't1', icon: 'clipboard', title: 'Someone has just been diagnosed with something serious', short: 'A new diagnosis', lead: 'A condition to-do list, GP follow-up, and time to take it in.' },
  { id: 't2', icon: 'hospital', title: 'A relative is in hospital and discharge is being planned', short: 'Coming out of hospital', lead: 'Your right to be involved, a carer’s assessment before discharge, and what “discharge to assess” means.' },
  { id: 't3', icon: 'alert', title: 'There has been a fall, accident or sudden decline', short: 'A fall or sudden decline', lead: 'Making things safe now, a GP review, and a needs assessment.' },
  { id: 't4', icon: 'trend', title: 'Someone is slowly stopping coping at home', short: 'Struggling at home', lead: 'A needs assessment, early help coming in, and home safety.' },
  { id: 't5', icon: 'heart', title: 'A parent is now on their own after a bereavement', short: 'On their own after a loss', lead: 'Wellbeing, daily support, a benefits review and gentle planning.' },
  { id: 't6', icon: 'home', title: 'We are thinking about whether they can live independently', short: 'Thinking about care options', lead: 'A needs assessment, home care versus a care home, and funding.' },
  { id: 't7', icon: 'brain', title: 'I am worried about memory or confusion', short: 'Worried about memory', lead: 'A GP and memory clinic route, capacity, and setting up an LPA while they still can.' },
  { id: 't8', icon: 'sunset', title: 'We are approaching end of life', short: 'Approaching end of life', lead: 'Hospice and palliative care, fast-track funding, advance wishes and emotional support.' },
  { id: 't9', icon: 'pin', title: 'I am caring from a distance', short: 'Caring from a distance', lead: 'Remote coordination, local services by postcode, and an emergency plan.' },
  { id: 't10', icon: 'child', title: 'I am caring for a disabled child', short: 'Caring for a disabled child', lead: 'Children’s versus adult services, the move to adulthood at 18, and child-specific support.' },
  { id: 't11', icon: 'lifebuoy', title: 'It is a crisis and I need help right now', short: 'A crisis, right now', lead: 'Immediate safety, urgent contacts and crisis lines.', crisis: true },
  { id: 't12', icon: 'compass', title: 'I think I might be a carer and do not know where to start', short: 'Not sure where to start', lead: 'Confirming you are a carer, the orientation playbook, and a carer’s assessment.' },
];
export const TRIGGER_BY_ID = {};
TRIGGERS.forEach(t => { TRIGGER_BY_ID[t.id] = t; });

// ---- Triage questions. Answers re-rank + relabel the playbook (see engine) ----
export const TRIAGE = [
  { id: 'relationship', q: 'Who are you caring for?', help: 'This shapes the legal and benefit routes we show you.', optional: false,
    options: [
      { id: 'parent', label: 'My parent' },
      { id: 'partner', label: 'My partner' },
      { id: 'child', label: 'My child' },
      { id: 'other', label: 'Another relative or friend' },
    ] },
  { id: 'hospital', q: 'Are they in hospital right now?', help: 'If a discharge is being planned, some steps become time-sensitive.', optional: true,
    options: [
      { id: 'yes', label: 'Yes, in hospital now' },
      { id: 'leaving', label: 'Being discharged soon' },
      { id: 'no', label: 'No' },
    ] },
  { id: 'capacity', q: 'Can they still make their own decisions?', help: 'Capacity is decisive. It changes what you can put in place for them. We never decide this for you.', optional: true,
    options: [
      { id: 'yes', label: 'Yes, for the most part' },
      { id: 'some', label: 'Some of the time' },
      { id: 'no', label: 'No, not really' },
      { id: 'unsure', label: 'I am not sure' },
    ] },
  { id: 'distance', q: 'How near to them do you live?', help: 'This affects how we set up local services and an emergency plan.', optional: true,
    options: [
      { id: 'together', label: 'We live together' },
      { id: 'near', label: 'Nearby' },
      { id: 'far', label: 'An hour or more away' },
    ] },
  { id: 'postcode', q: 'What is their postcode?', help: 'We use this only to find the right local council and nearest carer centre. It is optional, and we do not store the full postcode.', optional: true,
    type: 'postcode', placeholder: 'e.g. SE1 7TP' },
];

// ---- Canonical action set (22). priority drives the left accent colour ----
// flags: cfg (funding -> CFG signpost), local (postcode route),
// nobody (front-load), condition (source swaps to the chosen condition charity).
export const ACTIONS = {
  a_process: { title: 'Give yourself a moment to take it in',
    what: 'Before any to-do list: this is a lot to absorb. You do not have to fix everything today.',
    why: 'Carers who pace themselves last longer. The practical steps will still be here tomorrow.',
    who: 'No one to contact. This one is just for you.',
    source: SOURCES.carersUK, helpline: 'carersUK', priority: 'low', flags: [] },
  a_condition_todo: { title: 'Work through the condition to-do list',
    what: 'A short, ordered list of first practical steps for this specific condition.',
    why: 'Condition charities have the best newly-diagnosed journeys. Starting here saves stitching several websites together.',
    who: 'The relevant condition charity. We link the right one for you.',
    source: SOURCES.nhsSocial, helpline: 'carersUK', priority: 'high', flags: ['condition'] },
  a_gp_questions: { title: 'Note your questions for the GP or specialist',
    what: 'Write down what you do not yet understand, and book the follow-up appointment.',
    why: 'You will think of questions at 3am and forget them by the appointment. A written list means nothing important gets missed.',
    who: 'Their GP surgery, or the specialist team named on the diagnosis letter.',
    source: SOURCES.nhsSocial, helpline: 'nhs111', priority: 'medium', flags: [] },
  a_discharge: { title: 'Ask to be involved in discharge planning',
    what: 'Tell the ward you are the carer and ask to be part of any discharge decision.',
    why: 'You have a right to be consulted before they are sent home. A safe discharge depends on what you can realistically manage.',
    who: 'The ward sister, discharge coordinator or hospital social worker.',
    source: SOURCES.carersUK, helpline: 'carersUK', priority: 'high', flags: ['nobody'] },
  a_discharge_assess: { title: 'Understand discharge to assess',
    what: 'Many people are now sent home first and assessed there, with short-term support, rather than assessed on the ward.',
    why: 'Knowing this is coming means you can ask what support arrives with them, and for how long.',
    who: 'The discharge team will explain the plan. Ask them to put it in writing.',
    source: SOURCES.nhsSocial, helpline: 'carersUK', priority: 'medium', flags: [] },
  a_carers_assessment: { title: 'Request a carer’s assessment',
    what: 'A free assessment of your own needs as a carer. It is separate from the person you care for.',
    why: 'It is your legal right, even if they refuse help themselves. It can unlock practical support and a break.',
    who: 'Your local council’s adult social care team.',
    source: SOURCES.nhsCarer, helpline: 'carersUK', priority: 'high', flags: ['nobody', 'local'] },
  a_needs_assessment: { title: 'Arrange a needs assessment for them',
    what: 'A council assessment of what support the person you care for needs day to day.',
    why: 'It is the gateway to most council-arranged support. It is free to ask for and not means-tested.',
    who: 'Their local council’s adult social care team.',
    source: SOURCES.govNeeds, helpline: 'ageUK', priority: 'high', flags: ['local'] },
  a_confirm_carer: { title: 'Confirm you are a carer and tell their GP',
    what: 'Register as a carer at their GP surgery, and at your own.',
    why: 'It flags you for your own health checks and a free flu jab, and means the surgery keeps you in the loop.',
    who: 'The reception team at the GP surgery.',
    source: SOURCES.ageUK, helpline: 'ageUK', priority: 'medium', flags: ['nobody'] },
  a_benefits: { title: 'Check Carer’s Allowance and their benefits',
    what: 'See what you and they may be entitled to, such as Carer’s Allowance, Attendance Allowance or PIP.',
    why: 'Money worries are one of the biggest pressures on carers, and a lot goes unclaimed.',
    who: 'The Care Funding Guide can take you through this properly.',
    source: SOURCES.citizens, helpline: 'citizens', priority: 'medium', flags: ['cfg'] },
  a_lpa: { title: 'Set up Lasting Power of Attorney while they still can',
    what: 'A legal document letting you make decisions for them if they later cannot. There are two types: health, and finances.',
    why: 'It only works while they still have mental capacity. Leave it too late and you are forced down the slower, costlier Court of Protection route.',
    who: 'You can apply directly. A solicitor can help for complex situations.',
    source: SOURCES.govPoA, helpline: 'ageUK', priority: 'high', flags: ['nobody'] },
  a_employer: { title: 'Tell your employer and check carer’s leave',
    what: 'You have a right to time off for caring, including one week of unpaid carer’s leave a year, and to request flexible working.',
    why: 'Keeping your job and income protects you both. Most carers do not know this right exists.',
    who: 'Your line manager or HR team.',
    source: SOURCES.govCarerLeave, helpline: 'carersUK', priority: 'low', flags: ['nobody'] },
  a_chc: { title: 'Ask about NHS Continuing Healthcare',
    what: 'NHS funding that can fully cover care for people with serious health needs. Ask for the “Checklist” to be done.',
    why: 'It can pay for everything, but you usually have to ask. Many families never hear it exists.',
    who: 'Their GP, ward nurse or social worker can request the Checklist.',
    source: SOURCES.nhsCHC, helpline: 'ageUK', priority: 'medium', flags: ['nobody', 'cfg'] },
  a_equipment: { title: 'Get equipment, aids and home adaptations',
    what: 'Grab rails, a raised toilet seat, a key safe, through an occupational therapy assessment.',
    why: 'The right small changes prevent the next fall and keep them independent for longer.',
    who: 'Occupational therapy, via the council or GP.',
    source: SOURCES.nhsSocial, helpline: 'ageUK', priority: 'medium', flags: ['local'] },
  a_wellbeing: { title: 'Look after your own wellbeing and arrange respite',
    what: 'Build in breaks, and know where to turn when it is too much. Respite care gives you time to recover.',
    why: 'If you become unwell, you cannot care. Protecting your own health is not selfish, it is essential.',
    who: 'Your local carer centre and your GP.',
    source: SOURCES.carersTrust, helpline: 'carersTrust', priority: 'low', flags: ['local'] },
  a_plan_ahead: { title: 'Make an emergency plan and note their wishes',
    what: 'Agree what happens if you are suddenly ill, and start the conversation about what they would want.',
    why: 'A simple plan, written down, takes huge weight off everyone if a crisis comes.',
    who: 'Your carer centre can help you write an emergency plan.',
    source: SOURCES.carents, helpline: 'carersUK', priority: 'low', flags: [] },
  a_memory_clinic: { title: 'See the GP about memory, and ask for a memory clinic',
    what: 'Book a GP appointment specifically about the memory changes you have noticed.',
    why: 'An early, accurate diagnosis opens the door to treatment, support and planning while they can still take part.',
    who: 'Their GP, who can refer to a memory clinic.',
    source: SOURCES.alz, helpline: 'alz', priority: 'high', flags: [] },
  a_safety_now: { title: 'Make the immediate situation safe',
    what: 'Deal with anything urgent first: injuries, medication, heating, whether they are safe to be alone tonight.',
    why: 'Everything else can wait until the person is safe.',
    who: 'Call 999 for an emergency, or 111 for urgent but non-emergency advice.',
    source: SOURCES.nhsSocial, helpline: 'nhs111', priority: 'high', flags: [] },
  a_palliative: { title: 'Ask about hospice and palliative care',
    what: 'Palliative care focuses on comfort and quality of life. Hospice support can happen at home, not only in a hospice.',
    why: 'Families often discover this support far later than they could have. Earlier is gentler for everyone.',
    who: 'Their GP or specialist nurse can refer. Marie Curie can guide you.',
    source: SOURCES.marieCurie, helpline: 'marieCurie', priority: 'high', flags: [] },
  a_distance_plan: { title: 'Set up coordination from a distance',
    what: 'A key safe, a trusted local contact, online shopping and a shared way to track what is happening.',
    why: 'Distance caring works when the basics are in place before you need them.',
    who: 'Your local carer centre, plus neighbours or nearby family.',
    source: SOURCES.carents, helpline: 'carersUK', priority: 'medium', flags: ['local'] },
  a_child_transition: { title: 'Understand children’s versus adult services',
    what: 'Support for a disabled child sits with children’s services until 18, then transitions to adult social care.',
    why: 'The move to adult services at 18 is a known cliff-edge. Planning early avoids a gap in support.',
    who: 'Your council’s children with disabilities team, then adult social care.',
    source: SOURCES.nhsSocial, helpline: 'carersUK', priority: 'medium', flags: ['local'] },
  a_bereavement: { title: 'Look after their wellbeing after the loss',
    what: 'Check on loneliness, eating, and daily routine. Grief and being suddenly alone hit hard.',
    why: 'A bereavement often reveals needs a partner used to quietly cover.',
    who: 'Their GP, and Age UK for befriending and daily support.',
    source: SOURCES.ageUK, helpline: 'ageUK', priority: 'medium', flags: [] },
  a_care_options: { title: 'Weigh up home care versus a care home',
    what: 'Understand the realistic options: care at home, supported living, or a residential home.',
    why: 'There is rarely a single right answer. A needs assessment gives you the facts to decide calmly.',
    who: 'Start with a needs assessment. The Care Funding Guide covers the money.',
    source: SOURCES.ageUK, helpline: 'ageUK', priority: 'medium', flags: ['cfg'] },
};

// ---- Per-trigger playbooks: ordered [actionId, phase] ----
export const PLAYBOOKS = {
  t1: [['a_process','today'],['a_condition_todo','today'],['a_gp_questions','today'],['a_confirm_carer','month'],['a_carers_assessment','month'],['a_lpa','month'],['a_benefits','month'],['a_needs_assessment','later'],['a_employer','later'],['a_plan_ahead','later']],
  t2: [['a_discharge','today'],['a_carers_assessment','today'],['a_discharge_assess','today'],['a_needs_assessment','month'],['a_confirm_carer','month'],['a_benefits','month'],['a_employer','month'],['a_lpa','later'],['a_equipment','later'],['a_wellbeing','later']],
  t3: [['a_safety_now','today'],['a_confirm_carer','today'],['a_needs_assessment','month'],['a_carers_assessment','month'],['a_equipment','month'],['a_benefits','later'],['a_wellbeing','later']],
  t4: [['a_needs_assessment','today'],['a_confirm_carer','today'],['a_carers_assessment','month'],['a_equipment','month'],['a_benefits','month'],['a_lpa','later'],['a_wellbeing','later']],
  t5: [['a_bereavement','today'],['a_confirm_carer','today'],['a_benefits','month'],['a_needs_assessment','month'],['a_lpa','later'],['a_plan_ahead','later']],
  t6: [['a_needs_assessment','today'],['a_care_options','today'],['a_benefits','month'],['a_carers_assessment','month'],['a_lpa','later'],['a_chc','later']],
  t7: [['a_memory_clinic','today'],['a_lpa','today'],['a_confirm_carer','month'],['a_carers_assessment','month'],['a_benefits','month'],['a_needs_assessment','later'],['a_wellbeing','later']],
  t8: [['a_palliative','today'],['a_chc','today'],['a_plan_ahead','month'],['a_benefits','month'],['a_wellbeing','later']],
  t9: [['a_distance_plan','today'],['a_confirm_carer','today'],['a_needs_assessment','month'],['a_carers_assessment','month'],['a_plan_ahead','later'],['a_benefits','later']],
  t10: [['a_child_transition','today'],['a_carers_assessment','today'],['a_needs_assessment','month'],['a_benefits','month'],['a_wellbeing','later'],['a_plan_ahead','later']],
  t11: [['a_safety_now','today'],['a_carers_assessment','today'],['a_needs_assessment','month'],['a_confirm_carer','month'],['a_wellbeing','later']],
  t12: [['a_confirm_carer','today'],['a_carers_assessment','today'],['a_needs_assessment','month'],['a_benefits','month'],['a_lpa','later'],['a_wellbeing','later'],['a_plan_ahead','later']],
};

export const PHASES = [
  { id: 'today', label: 'Today', sub: 'The few things that matter most right now.' },
  { id: 'month', label: 'This month', sub: 'Important, but they can follow in the next few weeks.' },
  { id: 'later', label: 'Later', sub: 'Worth doing once the urgent things are settled.' },
];
