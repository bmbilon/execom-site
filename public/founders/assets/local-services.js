// Published prices are benchmarks; booking volume is an explicit planning assumption.
export const RATE_REVIEW_DATE = '6 October 2026';
export const DEFAULT_BOOKED_DAYS = 3;
export const WEEKS_PER_MONTH = 4;
export const services = [
  {
    id: 'shelving', category: 'Garage shelving & assembly', scene: 'shelving',
    headline: 'Local home services businesses',
    subtitle: 'Can be started rapidly, with minimal startup cost, profitable in days',
    rate: 240, unitsPerDay: 1,
    dailyMath: '1 four-hour labour booking × C$240',
    scope: 'Assemble customer-supplied shelving and organize the garage. Racks, hardware and materials are extra; overhead storage needs a separate scope.',
    schedule: 'Plan for four billable hours in one home, plus additional time for quoting, travel and setup.',
    sourceName: 'ProFix YYC', sourceUrl: 'https://profixyyc.com/',
    benchmark: 'Advertises a C$240 four-hour package that includes shelving installation. This scenario uses that labour budget, with customer-supplied materials.',
    firstStep: 'Start with one clear package: assemble the shelves, secure them to the manufacturer’s instructions, and leave the space ready to use.'
  },
  {
    id: 'organizing', category: 'Closet & home organizing', scene: 'organizing',
    headline: 'Help neighbours get\ntheir homes organized.',
    rate: 60, unitsPerDay: 6,
    dailyMath: '2 three-hour sessions × C$60/hour',
    scope: 'Offer sorting, folding and storage help as a solo organizer, with containers and other organizing products purchased separately.',
    schedule: 'Plan for six billable hours across two nearby homes, plus travel, setup and any donation drop-off time.',
    sourceName: 'Light At The End Of The Clutter', sourceUrl: 'https://www.lightattheendoftheclutter.com/services',
    benchmark: 'Publishes C$60/hour plus GST for one organizer, with a three-hour minimum. This model assumes two such bookings in a service day.',
    firstStep: 'Offer one manageable reset: a closet, pantry or entryway. Agree on the space, time and supplies before the visit.'
  },
  {
    id: 'yard-care', category: 'Neighbourhood yard care', scene: 'yard',
    headline: 'Yard care and maintenance',
    rate: 50, unitsPerDay: 4,
    dailyMath: '4 recurring mow-and-trim visits × C$50',
    scope: 'The numbers cover mowing and edge trimming on medium lawns. Hedge pruning, large lots and seasonal cleanups are quoted separately.',
    schedule: 'Assume four nearby lawns, about an hour each plus travel. Growing-season revenue only; weather and route density change capacity.',
    sourceName: 'The Yard Father', sourceUrl: 'https://theyardfatheryyc.com/',
    benchmark: 'This southwest Calgary operator lists C$45–55 for a medium lawn on a weekly mow-and-trim schedule. C$50 is the midpoint used here.',
    firstStep: 'Build a route on a few neighbouring streets. At three booked days a week, this model needs 12 weekly lawn customers.'
  },
  {
    id: 'detailing', category: 'Mobile car detailing', scene: 'detailing',
    headline: 'Mobile vehicle detailing and cleaning services',
    rate: 170, unitsPerDay: 2,
    dailyMath: '2 interior-and-exterior details × C$170',
    scope: 'Offer a basic interior-and-exterior package, with separate quotes for large vehicles, pet hair, stains and specialist treatments.',
    schedule: 'Assume two vehicles and allow around three hours each, plus travel and setup. Weather and a suitable work space affect availability.',
    sourceName: 'MINT Mobile Detailing', sourceUrl: 'https://mintmobiledetailing.ca/pricing',
    benchmark: 'Publishes full interior-and-exterior detailing from C$170 per visit in Calgary and Cochrane. Job duration is our planning assumption, not the provider’s promise.',
    firstStep: 'Define what your package includes, the vehicle size and the time required. Confirm the work space and wash-water arrangements before booking.'
  }
];

export function revenueScenario(service, bookedDays = DEFAULT_BOOKED_DAYS) {
  if (!Number.isInteger(bookedDays) || bookedDays < 0 || bookedDays > 5) throw new RangeError('Choose zero to five booked days.');
  if (!Number.isFinite(service.rate) || service.rate < 0 || !Number.isFinite(service.unitsPerDay) || service.unitsPerDay < 0) throw new RangeError('Invalid service assumptions.');
  const daily = service.rate * service.unitsPerDay;
  const weekly = daily * bookedDays;
  return {daily, weekly, monthly: weekly * WEEKS_PER_MONTH};
}

const cad = value => 'C$' + new Intl.NumberFormat('en-CA', {maximumFractionDigits: 0}).format(value);
const scenes = {
  shelving: {sheet: 'home-services', x: 711, y: 5, w: 690, h: 354, alt: 'A young founder assembling garage shelving with a drill'},
  organizing: {sheet: 'home-services', x: 711, y: 554, w: 690, h: 341, alt: 'A young founder folding and organizing clothing in a closet'},
  yard: {sheet: 'neighbourhood-services', x: 7, y: 5, w: 690, h: 354, alt: 'A young founder tending a neighbour’s shrubs'},
  detailing: {sheet: 'neighbourhood-services', x: 711, y: 5, w: 690, h: 354, alt: 'A young founder polishing a car in a residential driveway'},
  customer: {sheet: 'founder-stories', x: 145, y: 7, w: 551, h: 362, alt: 'A young maker handing a wooden box to a customer'},
  tuesday: {sheet: 'founder-stories', x: 712, y: 8, w: 681, h: 355, alt: 'A young adult thinking on the family couch'},
  commute: {sheet: 'founder-stories', x: 8, y: 556, w: 687, h: 330, alt: 'A young adult talking with a parent on the stairs at home'},
  office: {sheet: 'founder-stories', x: 712, y: 556, w: 681, h: 318, alt: 'A young maker working at a living-room table beside her mother'}
};

// Display selected photo regions in CSS; the supplied files stay unchanged.
// Baked-in captions and contact-sheet layout notes remain outside each viewport.
export function sourceScene(name, eager = false) {
  const {sheet, x, y, w, h, alt} = scenes[name];
  return `<div class="source-scene" style="aspect-ratio:${w}/${h}"><img src="/founders/assets/img/local-services/${sheet}.jpg" alt="${alt}" width="1408" height="1408" loading="${eager ? 'eager' : 'lazy'}" decoding="async" ${eager ? 'fetchpriority="high"' : ''} style="width:${1408/w*100}%;left:${-x/w*100}%;top:${-y/h*100}%"></div>`;
}

export function founderStoryHero() {
  return `<div class="founder-story-collage"><figure class="story-main">${sourceScene('customer', true)}<figcaption><span>Your first customer</span><strong>Something<br>of your <em>own.</em></strong></figcaption></figure><figure class="story-inset">${sourceScene('tuesday')}<figcaption>Another Tuesday?</figcaption></figure><p class="story-disclosure">These scenes illustrate what starting a business could look like.</p></div>`;
}

export function familiarStories() {
  const cards = [
    ['commute', 'How are you late\nwhen you work downstairs?', 'Working from home gets easier when you know what you need to get done.'],
    ['office', 'The living room has\nbecome your head office.', 'A business can start at the kitchen table. A plan helps it grow beyond it.'],
    ['tuesday', 'What would it take\nto try one of those ideas?', 'Start by finding someone who would pay for a useful service you can offer.']
  ];
  return `<section class="public-section familiar-section" id="familiar"><div class="section-heading"><span class="eyebrow">Sound familiar?</span><h2>Finding your footing<br>while living at home.</h2><p>Starting a business at home changes family life, sometimes in ways everyone recognizes.</p></div><div class="familiar-stories">${cards.map(([scene,title,body]) => `<figure class="story-card">${sourceScene(scene)}<figcaption><h3>${title.replace('\n','<br>')}</h3><p>${body}</p></figcaption></figure>`).join('')}</div></section>`;
}

function figures(service, days) {
  const totals = revenueScenario(service, days);
  return `<dl class="service-figures">${[['daily','Booked day'],['weekly','Week'],['monthly','Month · 4 weeks']].map(([key,label]) => `<div><dt>${label}</dt><dd data-period="${key}">${cad(totals[key])}</dd></div>`).join('')}</dl>`;
}

export function localServicesSection() {
  return `<section class="public-section local-services" id="local-businesses" aria-labelledby="local-businesses-title">
    <div class="local-services-heading"><div class="section-heading"><span class="eyebrow">Build it in your own backyard</span><h2 id="local-businesses-title">Your next customer<br>could live next door.</h2><p>Explore four service businesses you could test in west and northwest Calgary, from garage shelving and home organizing to lawn care and car detailing.</p></div><div class="local-area"><span>T3H / T3L</span><p>West & northwest Calgary</p><small>Use local prices to plan<br>an offer near home.</small></div></div>
    <div class="service-controls"><div><strong>What could a booked week bring in?</strong><p>Illustrative gross revenue in Canadian dollars, before costs and taxes.</p></div><label for="service-days">Booked days per week<select id="service-days" aria-describedby="service-schedule">${Array.from({length:6},(_,days)=>`<option value="${days}" ${days===DEFAULT_BOOKED_DAYS?'selected':''}>${days} ${days===1?'day':'days'}</option>`).join('')}</select></label></div>
    <p class="service-schedule" id="service-schedule">${DEFAULT_BOOKED_DAYS} booked days per week × ${WEEKS_PER_MONTH} weeks = ${DEFAULT_BOOKED_DAYS*WEEKS_PER_MONTH} booked days per month. Each card is a separate business scenario; don’t add them together.</p>
    <div class="service-grid">${services.map((s,i)=>`<article class="service-card" data-service="${s.id}" aria-labelledby="service-title-${s.id}"><div class="service-photo">${sourceScene(s.scene)}<span class="service-index">0${i+1} / LOCAL BUSINESS</span></div><div class="service-content"><p class="service-category">${s.category}</p><h3 id="service-title-${s.id}">${s.headline.replace('\n','<br>')}</h3>${s.subtitle ? `<p class="service-subtitle">${s.subtitle}</p>` : ''}<p class="service-math">${s.dailyMath}</p><span class="service-revenue-label">Illustrative gross revenue · CAD</span>${figures(s,DEFAULT_BOOKED_DAYS)}<p class="service-scope">${s.scope}</p><details class="service-details"><summary>See the maths & local rate</summary><div><p>${s.schedule}</p><p>${s.benchmark} <a href="${s.sourceUrl}" target="_blank" rel="noopener noreferrer">${s.sourceName} pricing ↗</a></p><p class="service-formula" data-formula>${cad(s.rate*s.unitsPerDay)} × ${DEFAULT_BOOKED_DAYS} days = ${cad(s.rate*s.unitsPerDay*DEFAULT_BOOKED_DAYS)}/week; × ${WEEKS_PER_MONTH} weeks = ${cad(s.rate*s.unitsPerDay*DEFAULT_BOOKED_DAYS*WEEKS_PER_MONTH)}/month.</p><p>${s.firstStep}</p></div></details></div></article>`).join('')}</div>
    <p id="service-update" class="visually-hidden" role="status" aria-live="polite"></p>
    <div class="service-method"><strong>Work out what you keep after business costs and taxes.</strong><p>Subtract supplies, equipment, fuel, insurance, fees and taxes. Leave time for finding customers, quoting and admin. These examples assume the bookings are won and completed; they are not average earnings or a promise of demand.</p><p>Rates checked ${RATE_REVIEW_DATE}. Published Calgary prices are reference points for our T3H/T3L focus, not measured neighbourhood averages. We have not added a neighbourhood premium. Models exclude GST; where a provider does not state its tax treatment, the displayed amount is used as an illustrative pre-tax price to test.</p><a class="text-link" href="#number">Now work out your monthly take-home Number →</a><small>AI-generated scenes supplied for illustration. They do not show actual participants, customers or results.</small></div>
  </section>`;
}

export function initLocalServices() {
  const control = document.querySelector('#service-days');
  if (!control) return;
  control.addEventListener('change', () => {
    const days = Number(control.value);
    for (const service of services) {
      const card = document.querySelector(`[data-service="${service.id}"]`);
      const totals = revenueScenario(service, days);
      for (const key of ['daily','weekly','monthly']) card.querySelector(`[data-period="${key}"]`).textContent = cad(totals[key]);
      card.querySelector('[data-formula]').textContent = `${cad(totals.daily)} × ${days} days = ${cad(totals.weekly)}/week; × ${WEEKS_PER_MONTH} weeks = ${cad(totals.monthly)}/month.`;
    }
    document.querySelector('#service-schedule').textContent = `${days} booked ${days===1?'day':'days'} per week × ${WEEKS_PER_MONTH} weeks = ${days*WEEKS_PER_MONTH} booked days per month. Each card is a separate business scenario; don’t add them together.`;
    document.querySelector('#service-update').textContent = `All four revenue examples now use ${days} booked ${days===1?'day':'days'} per week and a four-week month.`;
  });
}
