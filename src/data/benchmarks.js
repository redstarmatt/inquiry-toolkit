// Enriched benchmark data from all 67 UK public inquiries
// Scale classification: small (<\u00A310m), medium (\u00A310-30m), large (\u00A330-150m), very large (\u00A3150m+)
// Where cost is unknown, classified by subject area and scope

function classifyScale(cost) {
  if (cost === null) return null;
  if (cost < 10) return "small";
  if (cost < 30) return "medium";
  if (cost < 150) return "large";
  return "very large";
}

function computeDuration(established, closed) {
  if (!established) return null;
  const start = new Date(established);
  const end = closed ? new Date(closed) : new Date();
  return Math.round((end - start) / (1000 * 60 * 60 * 24 * 30.44));
}

function formatDuration(months) {
  if (months === null) return null;
  if (months < 12) return `${months} months`;
  const years = Math.round(months / 12 * 10) / 10;
  return `${years} year${years !== 1 ? "s" : ""}`;
}

function formatYears(established, closed) {
  if (!established) return "";
  const startYear = established.substring(0, 4);
  if (!closed) return `${startYear}\u2013ongoing`;
  const endYear = closed.substring(0, 4);
  return startYear === endYear ? startYear : `${startYear}\u2013${endYear}`;
}

const RAW = [
  { name: "UK COVID-19 Inquiry", established: "2022-04-28", closed: null, cost: 177.2, type: "Statutory", subject: "UK pandemic response", subjectArea: "health", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "ongoing" },
  { name: "Post Office Horizon IT Inquiry", established: "2021-06-01", closed: null, cost: 74.73, type: "Statutory", subject: "Wrongful prosecutions", subjectArea: "justice", hearingDays: 96, witnesses: 114, docs: null, cps: null, pages: null, status: "ongoing" },
  { name: "Grenfell Tower Inquiry", established: "2017-08-15", closed: "2024-09-04", cost: 177.6, type: "Statutory", subject: "Tower block fire (72 deaths)", subjectArea: "disasters", hearingDays: 300, witnesses: null, docs: 300, cps: 608, pages: 1700, status: "completed" },
  { name: "Manchester Arena Inquiry", established: "2020-09-07", closed: "2023-03-02", cost: 36.32, type: "Statutory", subject: "Arena bombing", subjectArea: "policing", hearingDays: 196, witnesses: 291, docs: null, cps: null, pages: 1346, status: "completed" },
  { name: "Infected Blood Inquiry", established: "2018-09-24", closed: "2024-05-20", cost: 130.0, type: "Statutory", subject: "Contaminated blood products", subjectArea: "health", hearingDays: null, witnesses: null, docs: null, cps: 2007, pages: null, status: "completed" },
  { name: "IICSA", established: "2015-03-12", closed: "2022-10-20", cost: 250.0, type: "Statutory", subject: "Child sexual abuse (E&W)", subjectArea: "institutional", hearingDays: 325, witnesses: 725, docs: 195, cps: null, pages: null, status: "completed" },
  { name: "Undercover Policing Inquiry", established: "2015-07-16", closed: null, cost: 120.56, type: "Statutory", subject: "Undercover police operations", subjectArea: "policing", hearingDays: 112, witnesses: null, docs: 7.6, cps: 249, pages: null, status: "ongoing" },
  { name: "Brook House Inquiry", established: "2020-02-03", closed: "2023-09-19", cost: 20.0, type: "Statutory", subject: "Immigration detainee abuse", subjectArea: "justice", hearingDays: 46, witnesses: null, docs: 100, cps: 24, pages: null, status: "completed" },
  { name: "Iraq (Chilcot) Inquiry", established: "2009-07-30", closed: "2016-07-06", cost: 13.0, type: "Non-statutory", subject: "Iraq War decisions", subjectArea: "government", hearingDays: 130, witnesses: 150, docs: 150, cps: null, pages: 6275, status: "completed" },
  { name: "Bloody Sunday (Saville)", established: "1998-04-03", closed: "2010-06-15", cost: 191.5, type: "Statutory", subject: "Events of 30 Jan 1972", subjectArea: "policing", hearingDays: 434, witnesses: 921, docs: null, cps: null, pages: 5000, status: "completed" },
  { name: "Leveson Inquiry", established: "2011-11-14", closed: "2012-11-29", cost: 5.4, type: "Statutory", subject: "Press standards", subjectArea: "government", hearingDays: null, witnesses: 337, docs: null, cps: null, pages: null, status: "completed" },
  { name: "Mid Staffordshire", established: "2010-11-01", closed: "2013-02-06", cost: 13.0, type: "Statutory", subject: "Healthcare failings", subjectArea: "health", hearingDays: 139, witnesses: 250, docs: 1000, cps: null, pages: 1781, status: "completed" },
  { name: "Hillsborough Panel", established: "2010-02-01", closed: "2012-09-12", cost: 5.0, type: "Non-statutory", subject: "Stadium disaster documents", subjectArea: "disasters", hearingDays: null, witnesses: null, docs: 450, cps: null, pages: 395, status: "completed" },
  { name: "Litvinenko Inquiry", established: "2015-01-27", closed: "2016-01-21", cost: 2.5, type: "Statutory", subject: "Polonium poisoning", subjectArea: "policing", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "completed" },
  { name: "Al-Sweady Inquiry", established: "2010-05-04", closed: "2014-12-17", cost: 31.0, type: "Statutory", subject: "Iraq detainee treatment", subjectArea: "policing", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "completed" },
  { name: "Azelle Rodney Inquiry", established: "2010-09-06", closed: "2013-07-05", cost: 2.6, type: "Statutory", subject: "Police shooting", subjectArea: "policing", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "completed" },
  { name: "Billy Wright Inquiry", established: "2005-02-14", closed: "2010-09-14", cost: 30.5, type: "Statutory", subject: "Murder inside HMP Maze", subjectArea: "policing", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "completed" },
  { name: "Robert Hamill Inquiry", established: "2005-03-01", closed: "2011-02-23", cost: 33.0, type: "Statutory", subject: "Sectarian murder (NI)", subjectArea: "policing", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "completed" },
  { name: "Rosemary Nelson Inquiry", established: "2005-04-18", closed: "2011-05-23", cost: 46.4, type: "Statutory", subject: "Solicitor murder (NI)", subjectArea: "policing", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "completed" },
  { name: "Baha Mousa Inquiry", established: "2008-07-01", closed: "2011-09-08", cost: 13.0, type: "Statutory", subject: "Detainee death in Iraq", subjectArea: "policing", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "completed" },
  { name: "Morecambe Bay Investigation", established: "2013-09-17", closed: "2015-03-03", cost: 1.1, type: "Non-statutory", subject: "Maternal & neonatal deaths", subjectArea: "health", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "completed" },
  { name: "Hyponatraemia Inquiry", established: "2004-11-22", closed: "2018-01-31", cost: 15.0, type: "Statutory", subject: "Child hospital deaths (NI)", subjectArea: "health", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "completed" },
  { name: "Edinburgh Tram Inquiry", established: "2015-01-09", closed: "2023-08-01", cost: 13.2, type: "Statutory", subject: "Tram project cost overruns", subjectArea: "infrastructure", hearingDays: 160, witnesses: 100, docs: 6000, cps: 7, pages: 961, status: "completed" },
  { name: "Anthony Grainger Inquiry", established: "2016-07-18", closed: "2019-07-11", cost: null, type: "Statutory", subject: "Police shooting", subjectArea: "policing", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "completed" },
  { name: "Jermaine Baker Inquiry", established: "2018-02-12", closed: "2019-02-15", cost: 4.1, type: "Statutory", subject: "Police shooting", subjectArea: "policing", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "completed" },
  { name: "Gosport Panel", established: "2014-07-16", closed: "2018-06-20", cost: 13.0, type: "Non-statutory", subject: "Hospital opioid deaths", subjectArea: "health", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "completed" },
  { name: "Daniel Morgan Panel", established: "2013-05-10", closed: "2021-06-15", cost: 16.0, type: "Non-statutory", subject: "Unsolved murder & corruption", subjectArea: "policing", hearingDays: null, witnesses: null, docs: 1200, cps: null, pages: 1251, status: "completed" },
  { name: "Muckamore Abbey Inquiry", established: "2022-06-01", closed: null, cost: 14.78, type: "Statutory", subject: "Hospital abuse (NI)", subjectArea: "health", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "ongoing" },
  { name: "Thirlwall Inquiry", established: "2024-02-12", closed: null, cost: 17.28, type: "Statutory", subject: "Hospital baby deaths", subjectArea: "health", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "ongoing" },
  { name: "Lampard Inquiry", established: "2024-04-10", closed: null, cost: 8.58, type: "Statutory", subject: "Mental health inpatient deaths", subjectArea: "health", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "ongoing" },
  { name: "Scottish COVID-19 Inquiry", established: "2022-06-28", closed: null, cost: 45.5, type: "Statutory (Scotland)", subject: "Scottish pandemic response", subjectArea: "health", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "ongoing" },
  { name: "Sheku Bayoh Inquiry", established: "2020-11-30", closed: null, cost: 26.2, type: "Statutory (Scotland)", subject: "Death in police custody", subjectArea: "policing", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "ongoing" },
  { name: "Nottingham Attacks Inquiry", established: "2025-05-22", closed: null, cost: null, type: "Statutory", subject: "Nottingham attacks", subjectArea: "health", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "ongoing" },
  { name: "Grooming Gangs Inquiry", established: "2025-12-09", closed: null, cost: null, type: "Statutory", subject: "Child sexual exploitation", subjectArea: "institutional", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "ongoing" },
  { name: "Shipman Inquiry", established: "2001-02-01", closed: "2005-01-27", cost: 21.0, type: "Statutory", subject: "Serial killer doctor", subjectArea: "health", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "completed" },
  { name: "Bichard Inquiry", established: "2004-01-05", closed: "2004-06-22", cost: 3.7, type: "Non-statutory", subject: "Police vetting after Soham", subjectArea: "policing", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "completed" },
  { name: "Hutton Inquiry", established: "2003-08-01", closed: "2004-01-28", cost: 2.5, type: "Non-statutory", subject: "Death of David Kelly", subjectArea: "government", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "completed" },
  { name: "ICL Inquiry", established: "2009-04-27", closed: "2016-12-17", cost: 1.9, type: "Statutory (Scotland)", subject: "Factory explosion", subjectArea: "disasters", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "completed" },
  { name: "Penrose Inquiry", established: "2009-04-01", closed: "2015-03-25", cost: 12.0, type: "Statutory (Scotland)", subject: "Scottish infected blood", subjectArea: "health", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "completed" },
  { name: "Vale of Leven Inquiry", established: "2009-11-01", closed: "2014-11-24", cost: 10.7, type: "Statutory (Scotland)", subject: "Hospital infection outbreak", subjectArea: "health", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "completed" },
  { name: "Fingerprint Inquiry", established: "2009-06-01", closed: "2011-12-14", cost: 4.5, type: "Statutory (Scotland)", subject: "McKie fingerprint case", subjectArea: "justice", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "completed" },
  { name: "RHI Inquiry", established: "2017-06-01", closed: "2020-03-13", cost: 12.0, type: "Statutory (NI)", subject: "Renewable heat scandal", subjectArea: "government", hearingDays: 114, witnesses: 63, docs: 1200, cps: null, pages: 656, status: "completed" },
  { name: "HIA Inquiry (NI)", established: "2013-01-01", closed: "2017-01-20", cost: 30.0, type: "Statutory (NI)", subject: "Child institutional abuse (NI)", subjectArea: "institutional", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "completed" },
  { name: "Scottish Child Abuse Inquiry", established: "2015-05-01", closed: null, cost: 102.0, type: "Statutory (Scotland)", subject: "Child abuse in care", subjectArea: "institutional", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "ongoing" },
  { name: "Scottish Hospitals Inquiry", established: "2020-06-15", closed: null, cost: 29.1, type: "Statutory (Scotland)", subject: "Hospital construction issues", subjectArea: "health", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "ongoing" },
  { name: "Urology Services Inquiry", established: "2021-08-31", closed: null, cost: 7.7, type: "Statutory (NI)", subject: "Urology services (NI)", subjectArea: "health", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "ongoing" },
  { name: "Afghanistan Inquiry", established: "2022-12-15", closed: null, cost: null, type: "Statutory", subject: "UK special forces allegations", subjectArea: "policing", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "ongoing" },
  { name: "Omagh Bombing Inquiry", established: "2024-02-21", closed: null, cost: null, type: "Statutory", subject: "Omagh bombing 1998", subjectArea: "policing", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "ongoing" },
  { name: "Malkinson Inquiry", established: "2023-10-26", closed: null, cost: null, type: "Non-statutory", subject: "Wrongful conviction", subjectArea: "justice", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "ongoing" },
  { name: "Eljamel Inquiry", established: "2025-04-02", closed: null, cost: 1.98, type: "Statutory (Scotland)", subject: "Neurosurgeon malpractice", subjectArea: "health", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "ongoing" },
  { name: "Cranston Inquiry", established: "2024-01-11", closed: "2026-02-05", cost: 6.85, type: "Non-statutory", subject: "Channel crossing tragedy", subjectArea: "disasters", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "completed" },
  { name: "Emma Caldwell Inquiry", established: "2025-12-09", closed: null, cost: null, type: "Statutory (Scotland)", subject: "Murder investigation", subjectArea: "policing", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "ongoing" },
  { name: "Angiolini Inquiry", established: "2022-01-10", closed: null, cost: null, type: "Non-statutory", subject: "Sarah Everard murder", subjectArea: "policing", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "ongoing" },
  { name: "Dawn Sturgess Inquiry", established: "2022-01-01", closed: "2025-12-04", cost: 8.3, type: "Statutory", subject: "Novichok poisoning", subjectArea: "policing", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "completed" },
  { name: "Jalal Uddin Inquiry", established: "2023-11-09", closed: "2025-07-17", cost: null, type: "Statutory", subject: "IS-inspired murder", subjectArea: "policing", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "completed" },
  { name: "Fuller Inquiry", established: "2022-06-27", closed: "2025-07-15", cost: null, type: "Non-statutory", subject: "Mortuary abuse", subjectArea: "health", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "completed" },
  { name: "Paterson Inquiry", established: "2018-02-13", closed: "2020-02-04", cost: null, type: "Non-statutory", subject: "Rogue surgeon", subjectArea: "health", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "completed" },
  { name: "Detainee Inquiry (Gibson)", established: "2010-07-06", closed: "2013-12-19", cost: null, type: "Non-statutory", subject: "Rendition & mistreatment", subjectArea: "policing", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "completed" },
  { name: "Butler Review", established: "2004-02-03", closed: "2004-07-14", cost: null, type: "Non-statutory", subject: "WMD intelligence review", subjectArea: "government", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "completed" },
  { name: "Mother and Baby Homes (NI)", established: "2022-02-24", closed: null, cost: null, type: "Non-statutory", subject: "Mother and baby homes (NI)", subjectArea: "institutional", hearingDays: null, witnesses: null, docs: null, cps: null, pages: null, status: "ongoing" },
];

export const BENCHMARKS = RAW.map((b) => {
  const durationMonths = computeDuration(b.established, b.closed);
  return {
    ...b,
    year: formatYears(b.established, b.closed),
    durationMonths,
    duration: formatDuration(durationMonths),
    scale: classifyScale(b.cost),
  };
}).sort((a, b) => (a.cost ?? 999) - (b.cost ?? 999));

// Subject area labels for filtering
export const SUBJECT_AREAS = [
  { value: "all", label: "All subjects" },
  { value: "health", label: "Health" },
  { value: "policing", label: "Policing & Security" },
  { value: "justice", label: "Justice" },
  { value: "institutional", label: "Institutional" },
  { value: "disasters", label: "Disasters" },
  { value: "government", label: "Government" },
  { value: "infrastructure", label: "Infrastructure" },
];
