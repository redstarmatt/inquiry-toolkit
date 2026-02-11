const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, LevelFormat,
        TableOfContents, HeadingLevel, BorderStyle, WidthType, ShadingType,
        PageNumber, PageBreak } = require("docx");

const NAVY = "1B2A4A";
const MID_BLUE = "3A5BA0";
const LIGHT_BLUE = "D6E4F0";
const DARK_GREY = "404040";
const WHITE = "FFFFFF";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };
const contentWidth = 9360;

function heading1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)] });
}
function heading2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] });
}
function heading3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(text)] });
}
function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    ...opts,
    children: [new TextRun({ font: "Arial", size: 22, color: DARK_GREY, ...opts.run, text })]
  });
}
function boldPara(label, text) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({ font: "Arial", size: 22, color: DARK_GREY, bold: true, text: label }),
      new TextRun({ font: "Arial", size: 22, color: DARK_GREY, text }),
    ]
  });
}
function bullet(text, ref = "bullets") {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 60 },
    children: [new TextRun({ font: "Arial", size: 22, color: DARK_GREY, text })]
  });
}
function spacer() {
  return new Paragraph({ spacing: { after: 80 }, children: [] });
}

function questionBlock(q, guidance) {
  return [
    new Paragraph({
      spacing: { before: 160, after: 60 },
      children: [
        new TextRun({ font: "Arial", size: 22, color: MID_BLUE, bold: true, text: q }),
      ]
    }),
    para(guidance),
  ];
}

function twoColTable(rows, col1Width = 3200, col2Width = 6160) {
  return new Table({
    width: { size: contentWidth, type: WidthType.DXA },
    columnWidths: [col1Width, col2Width],
    rows: rows.map((row, i) => new TableRow({
      children: [
        new TableCell({
          borders, margins: cellMargins,
          width: { size: col1Width, type: WidthType.DXA },
          shading: i === 0 ? { fill: NAVY, type: ShadingType.CLEAR } : { fill: i % 2 === 0 ? LIGHT_BLUE : WHITE, type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [new TextRun({ font: "Arial", size: 20, color: i === 0 ? WHITE : DARK_GREY, bold: i === 0, text: row[0] })] })]
        }),
        new TableCell({
          borders, margins: cellMargins,
          width: { size: col2Width, type: WidthType.DXA },
          shading: i === 0 ? { fill: NAVY, type: ShadingType.CLEAR } : { fill: i % 2 === 0 ? LIGHT_BLUE : WHITE, type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [new TextRun({ font: "Arial", size: 20, color: i === 0 ? WHITE : DARK_GREY, bold: i === 0, text: row[1] })] })]
        }),
      ]
    }))
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22, color: DARK_GREY } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: NAVY },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: MID_BLUE },
        paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: DARK_GREY },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ]
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullets2", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullets3", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullets4", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullets5", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullets6", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullets7", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullets8", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [
    // ─── TITLE PAGE ───
    {
      properties: {
        page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
      },
      children: [
        spacer(), spacer(), spacer(), spacer(), spacer(), spacer(),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ font: "Arial", size: 56, bold: true, color: NAVY, text: "Public Inquiry" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ font: "Arial", size: 56, bold: true, color: NAVY, text: "Consulting Reference Guide" })] }),
        spacer(),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ font: "Arial", size: 28, color: MID_BLUE, text: "A structured companion for advising inquiry teams" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ font: "Arial", size: 28, color: MID_BLUE, text: "across every phase of the inquiry lifecycle" })] }),
        spacer(), spacer(), spacer(), spacer(), spacer(), spacer(), spacer(), spacer(), spacer(),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ font: "Arial", size: 22, color: DARK_GREY, text: "Confidential \u2014 For consulting use only" })] }),
      ]
    },
    // ─── TOC ───
    {
      properties: {
        page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
      },
      headers: {
        default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ font: "Arial", size: 18, color: "999999", text: "Public Inquiry Consulting Reference Guide" })] })] })
      },
      footers: {
        default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ font: "Arial", size: 18, color: "999999", text: "Page " }), new TextRun({ font: "Arial", size: 18, color: "999999", children: [PageNumber.CURRENT] })] })] })
      },
      children: [
        heading1("Contents"),
        new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-2" }),
        new Paragraph({ children: [new PageBreak()] }),

        // ─── INTRODUCTION ───
        heading1("Introduction"),
        para("This guide is a structured consulting companion for advising teams involved in UK public inquiries. It covers the full inquiry lifecycle from establishment through to closure, organised into seven phases that reflect how inquiries actually operate in practice."),
        para("Each phase section follows a consistent structure: what needs to happen, the critical considerations and judgment calls, common pitfalls drawn from past inquiry experience, a role map showing who does what, and key diagnostic questions for use in consulting sessions."),
        para("This guide is designed to be used alongside the Inquiry Consulting Toolkit workbook for tracking and the interactive consulting tool for structured assessments. Together, these three instruments provide a comprehensive consulting framework."),
        para("The guidance here is original advisory content synthesised from practitioner experience and the established body of knowledge on public inquiry procedure. It does not reproduce or replace legal advice, and teams should always take professional legal counsel on specific procedural and statutory questions."),
        new Paragraph({ children: [new PageBreak()] }),

        // ═══════════════════════════════════════════════════════════
        // PHASE 1
        // ═══════════════════════════════════════════════════════════
        heading1("Phase 1: Establishment and Scoping"),

        heading2("What Needs to Happen"),
        para("This phase covers the period from the initial decision to hold an inquiry through to the finalisation of terms of reference and public announcement. It is the most consequential phase because decisions made here determine the inquiry\u2019s scope, powers, cost trajectory, and public legitimacy. Getting this wrong creates problems that compound throughout the inquiry\u2019s life."),
        para("The core activities are: determining whether the inquiry should be statutory or non-statutory; drafting terms of reference that are clear, deliverable, and appropriately scoped; conducting the required consultations; assessing legal obligations and concurrent proceedings; estimating costs and duration; and preparing the ministerial announcement."),

        heading2("Critical Considerations"),
        heading3("Statutory vs Non-Statutory"),
        para("This is the foundational choice. A statutory inquiry under the Inquiries Act 2005 has the power to compel witnesses and documents, take evidence on oath, and benefits from a presumption of public hearings and statutory immunity for personnel. A non-statutory inquiry is more flexible, potentially faster and cheaper, but cannot compel cooperation and lacks these protections."),
        para("The key question is whether voluntary cooperation can be assured. If there is any risk that key organisations or individuals will not cooperate fully, a statutory basis is strongly advisable. Non-statutory inquiries can be converted to statutory if needed, but this causes disruption and delay."),

        heading3("Terms of Reference"),
        para("Well-drafted terms of reference are the single most important factor in determining whether an inquiry will succeed. They should set out the purpose, the matters to investigate, whether recommendations are required, who the inquiry reports to, and who is responsible for publication. They should be clear on what is out of scope."),
        para("The most common failure is terms that are too broad or ambiguous. Overly wide scope leads to cost overruns, protracted timescales, and loss of focus. Equally, terms that are too narrow risk failing to address the matters of genuine public concern that motivated the inquiry."),

        heading3("Consultation Requirements"),
        para("For statutory inquiries, the Ministerial Code requires consulting the Prime Minister. The chair or prospective chair must be consulted on the terms of reference. Devolved administrations must be consulted where the inquiry concerns their matters, and terms cannot be set before that consultation concludes. The Cabinet Office, Government Legal Department, and where events occurred under a previous government, former ministers, must also be consulted."),
        para("Consulting affected parties \u2014 victims, families, and other stakeholders \u2014 is not legally required but is strongly recommended. A trauma-informed approach to this engagement is considered good practice and helps build public confidence from the outset."),

        heading2("Common Pitfalls"),
        bullet("Scope creep through vague or open-ended terms of reference, leading to years of delay and spiralling costs.", "bullets"),
        bullet("Failure to identify concurrent criminal proceedings before establishment, requiring the inquiry to pause or restructure.", "bullets"),
        bullet("Inadequate cost and duration estimates, setting unrealistic expectations with ministers and the public.", "bullets"),
        bullet("Insufficient consultation with affected parties, leading to early loss of public confidence and potential legal challenge.", "bullets"),
        bullet("Announcing the inquiry before key decisions (chair, terms of reference) are settled, creating perception problems.", "bullets"),

        heading2("Role Map"),
        twoColTable([
          ["Role", "Key Responsibilities in This Phase"],
          ["Sponsoring Minister", "Decides to hold inquiry, sets terms of reference, appoints chair, makes announcement to Parliament"],
          ["Sponsor Department Team", "Conducts scoping exercise, prepares cost estimate, manages consultations, drafts announcement"],
          ["Cabinet Office", "Advises on inquiry policy, reviews terms of reference, consults on non-statutory inquiries"],
          ["Government Legal Department", "Advises on statutory basis, ECHR obligations, concurrent proceedings, legal challenge risk"],
          ["Prospective Chair", "Consulted on terms of reference, may advise on scope and feasibility"],
          ["Devolved Administrations", "Consulted where inquiry concerns devolved matters; terms cannot be set before this concludes"],
        ]),

        heading2("Key Questions for Consulting Sessions"),
        ...questionBlock("Has anyone mapped the full landscape of related proceedings?", "Criminal investigations, inquests, regulatory investigations, and civil proceedings can all affect the inquiry\u2019s timing and scope. This mapping should happen before the decision to establish is made, not afterwards."),
        ...questionBlock("Are the terms of reference deliverable within a realistic timeframe and budget?", "Terms should be tested against available resources, the likely volume of evidence, and the number of potential witnesses and participants. Completed statutory inquiries since 2000 have averaged around three years."),
        ...questionBlock("Is there a clear rationale for choosing statutory over non-statutory (or vice versa)?", "This decision should be documented and based on analysis of whether compulsion powers are needed, whether public hearings are expected, and whether immunity for personnel is important."),
        ...questionBlock("Have affected parties been engaged on the shape and scope of the inquiry?", "Early, sensitive engagement with those directly affected builds legitimacy. The Independent Public Advocate can play an important role in supporting victims of major incidents."),
        new Paragraph({ children: [new PageBreak()] }),

        // ═══════════════════════════════════════════════════════════
        // PHASE 2
        // ═══════════════════════════════════════════════════════════
        heading1("Phase 2: Appointments and Team Building"),

        heading2("What Needs to Happen"),
        para("This phase covers appointing the chair, any panel members, and the three key roles that form the inquiry\u2019s leadership: the secretary, the solicitor, and (where needed) counsel. It also covers building the wider secretariat and establishing the governance, welfare, and HR frameworks that will support the team throughout the inquiry\u2019s life."),

        heading2("Critical Considerations"),
        heading3("Chair Selection"),
        para("The chair is the inquiry\u2019s most visible figure and the person on whom its success ultimately depends. They need integrity, leadership, analytical ability, communication skills, and sufficient subject matter knowledge to engage credibly with complex evidence. For statutory inquiries, the PM must be consulted on judicial appointments."),
        para("Perceived independence is as important as actual independence. Any connection between the prospective chair and the subject matter, key individuals, or institutions under scrutiny will be examined closely. Conflict screening should be thorough and documented."),

        heading3("The Secretary Role"),
        para("The inquiry secretary is often underestimated but is one of the most critical appointments. They are the chief operating officer of the inquiry \u2014 responsible for budget, team leadership, operational delivery, and managing the relationship with the sponsor department. They need to command the trust of both the chair and Whitehall."),
        para("The secretary also bears responsibility for capturing lessons learned and submitting a report to the Cabinet Office within two months of the inquiry\u2019s end. This institutional memory function is one of the reasons the role matters so much."),

        heading3("Legal Team"),
        para("The solicitor provides the main source of legal and procedural advice and should be appointed early. Delay in this appointment can cause procedural difficulties that are hard to recover from. The solicitor is usually from the Government Legal Department, though external appointment is possible."),
        para("Counsel is typically needed for complex or extensive statutory inquiries. The appointment is high-profile and the process must be fair, open, and non-discriminatory. Counsel\u2019s fees represent a significant cost, and a protocol on cost management should be agreed."),

        heading2("Common Pitfalls"),
        bullet("Appointing a chair without adequate conflict screening, leading to challenge or resignation.", "bullets2"),
        bullet("Delaying the solicitor appointment, creating procedural uncertainty in the inquiry\u2019s early weeks.", "bullets2"),
        bullet("Underestimating the secretary role, treating it as an administrative position rather than a leadership one.", "bullets2"),
        bullet("Failing to plan staff welfare from the outset, leading to burnout and turnover when distressing material is encountered.", "bullets2"),
        bullet("Not putting arrangements in place for staff to return to parent departments, creating uncertainty and affecting morale.", "bullets2"),

        heading2("Key Questions for Consulting Sessions"),
        ...questionBlock("Does the chair have the right combination of subject matter credibility and procedural expertise?", "A chair who is expert in the subject but unfamiliar with inquiry procedure will need strong support from the solicitor and counsel. A procedurally experienced chair with limited subject knowledge may need panel members or assessors to fill the gap."),
        ...questionBlock("Is the secretary appointment at the right seniority level?", "The secretary needs to operate at Deputy Director to Director General level to be effective. They must be able to engage with senior departmental officials and manage significant budgets. Under-grading this role creates problems."),
        ...questionBlock("Has the inquiry planned for the emotional impact of its work on staff?", "Staff may be exposed to deeply distressing evidence. Trauma-informed training, access to psychological support, and a culture that acknowledges this impact should be established before evidence gathering begins, not in response to problems."),
        new Paragraph({ children: [new PageBreak()] }),

        // ═══════════════════════════════════════════════════════════
        // PHASE 3
        // ═══════════════════════════════════════════════════════════
        heading1("Phase 3: Infrastructure and Operations"),

        heading2("What Needs to Happen"),
        para("Before the inquiry can begin its substantive work, it needs physical premises, IT systems, security arrangements, a website, data protection registration, and records management planning. This phase is often rushed because there is political pressure to be seen to be making progress, but cutting corners here creates problems that persist throughout the inquiry."),

        heading2("Critical Considerations"),
        heading3("Evidence Management Systems"),
        para("Almost every inquiry of any size needs an eDiscovery or evidence management system for secure storage, review, and disclosure of documentary evidence. Procurement of these systems takes longer than most teams expect. The sponsor department should have a ready-to-deliver IT plan for the incoming chair and secretary."),

        heading3("Location"),
        para("The hearing venue should not automatically be London. Proximity to affected communities can be important for public confidence and access, particularly for inquiries into events with a strong local dimension. Cost, accessibility, security, and the practical separation of different categories of participants all need to be considered."),

        heading3("Records Management from Day One"),
        para("The National Archives should be engaged at the earliest opportunity. Inquiries that manage records, websites, and copyright effectively from the start encounter far fewer problems during closing down and are likely to be more cost-effective. Failure to plan for records transfer at an early stage can lead to significant costs and delays at the end."),

        heading2("Common Pitfalls"),
        bullet("Underestimating IT procurement timeframes, leaving the inquiry without evidence management capability when documents start arriving.", "bullets3"),
        bullet("Failing to establish data security protocols before receiving sensitive material, creating breach risk.", "bullets3"),
        bullet("Not engaging the National Archives early, leading to expensive and time-consuming archiving problems at closure.", "bullets3"),
        bullet("Choosing a venue without adequate consideration of participant separation, security, and accessibility.", "bullets3"),

        heading2("Key Questions for Consulting Sessions"),
        ...questionBlock("Is there a ready-to-deliver IT plan, or is procurement still in progress?", "If the evidence management system is not in place or close to being in place, this is a critical gap. The inquiry cannot effectively begin its investigative work without it."),
        ...questionBlock("Has copyright been addressed for audiovisual recordings?", "If the inquiry intends to broadcast hearings or create audiovisual records, copyright must be addressed with the National Archives before contractual arrangements are made."),
        ...questionBlock("Is the inquiry registered as a data controller and does it have a DPO?", "The inquiry is an independent data controller from day one. Registration with the ICO, appointment of a Data Protection Officer, and production of a privacy notice are not optional."),
        new Paragraph({ children: [new PageBreak()] }),

        // ═══════════════════════════════════════════════════════════
        // PHASE 4
        // ═══════════════════════════════════════════════════════════
        heading1("Phase 4: Protocols and Procedures"),

        heading2("What Needs to Happen"),
        para("This phase establishes the rules of engagement for the inquiry\u2019s work. The issues list is developed from the terms of reference, protocols are drafted and published covering core participant designation, legal representation funding, disclosure, witness statements, hearings, redaction, and media engagement. A management statement is agreed with the sponsor department."),

        heading2("Critical Considerations"),
        heading3("Core Participant Framework"),
        para("The designation of core participants is one of the chair\u2019s most important early decisions. It determines who has formal rights within the inquiry \u2014 including advance disclosure, the ability to suggest questions, and advance access to the report. The criteria are set out in Rule 5 of the Inquiry Rules 2006, but the chair has significant discretion."),
        para("Core participant status can be phase-specific, which is useful for large inquiries covering multiple topics. Designation should not be automatic \u2014 formal applications should be required and assessed against published criteria."),

        heading3("Section 40 Determination"),
        para("For statutory inquiries, the minister can impose conditions on the chair\u2019s power to award legal costs through a Section 40 determination. This should be requested shortly after the terms of reference are finalised. Delay creates uncertainty for participants about whether their legal costs will be met and can inhibit cooperation."),

        heading3("The Management Statement"),
        para("The relationship between the inquiry and its sponsor department is one of the most sensitive dynamics in the whole process. The inquiry must be independent, but it is funded by public money and the department is accountable to Parliament for that expenditure. A management statement sets out the respective roles, responsibilities, and procedures to manage this tension."),

        heading2("Common Pitfalls"),
        bullet("Publishing protocols without consulting core participants, leading to challenges or loss of cooperation.", "bullets4"),
        bullet("Delaying the Section 40 determination, leaving funding arrangements uncertain for participants.", "bullets4"),
        bullet("Failing to establish clear cost controls for legal representation, allowing costs to escalate unchecked.", "bullets4"),
        bullet("Not having a media strategy, resulting in reactive rather than proactive communications.", "bullets4"),

        heading2("Key Questions for Consulting Sessions"),
        ...questionBlock("Is the issues list being treated as a living document?", "The issues list should evolve as evidence emerges. If it was fixed at the outset and never revisited, it may no longer reflect the actual scope of the investigation."),
        ...questionBlock("Have core participants been consulted on draft protocols?", "Protocols drafted without input from those affected by them are more likely to be challenged or to fail in practice. Consultation builds buy-in and surfaces practical problems early."),
        ...questionBlock("Is there a published costs protocol with effective controls?", "Legal costs of participants are often the largest single expenditure category. Without clear controls, costs can run to millions of pounds per year per core participant group."),
        new Paragraph({ children: [new PageBreak()] }),

        // ═══════════════════════════════════════════════════════════
        // PHASE 5
        // ═══════════════════════════════════════════════════════════
        heading1("Phase 5: Evidence and Investigation"),

        heading2("What Needs to Happen"),
        para("The inquiry issues requests for documentary evidence, manages incoming volumes, takes witness statements, discloses relevant material to core participants, and may commission expert reports or use other investigative methods such as seminars, site visits, and intermediaries for vulnerable witnesses."),

        heading2("Critical Considerations"),
        heading3("Managing Document Volumes"),
        para("The volume of material an inquiry receives can be enormous. Poorly targeted requests can elicit hundreds of thousands or even millions of items. Requests should be crafted carefully \u2014 broad enough to fulfil the terms of reference but targeted enough to be manageable. It can be valuable to discuss potential requests with information holders to understand what material exists and how it can be searched and retrieved."),

        heading3("Compulsion Powers"),
        para("For statutory inquiries, Section 21 notices are typically used in three scenarios: where a person is unwilling to comply with an informal request; where a person is willing but needs formal cover for the disclosure (for example, to avoid breaching a duty of confidence); or where a statutory bar prevents disclosure without a formal notice."),

        heading3("Innovative Approaches"),
        para("Inquiries have significant flexibility to develop evidence-gathering methods suited to their subject matter. Seminars bring in expert perspectives on policy questions. Intermediaries can reach people who would have difficulty providing evidence in traditional ways. Commemoration hearings allow families to provide pen-portraits of those who died, building a human record that pure documentary evidence cannot provide."),

        heading2("Common Pitfalls"),
        bullet("Issuing requests that are too broad, overwhelming the inquiry with irrelevant material.", "bullets5"),
        bullet("Not using disclosure statements to verify the completeness of responses from information providers.", "bullets5"),
        bullet("Failing to update the issues list as new evidence emerges, losing sight of the investigation\u2019s evolving scope.", "bullets5"),
        bullet("Not providing adequate support for vulnerable witnesses during statement-taking.", "bullets5"),

        heading2("Key Questions for Consulting Sessions"),
        ...questionBlock("Is the inquiry being overwhelmed by document volumes?", "If the review backlog is growing faster than it can be processed, the inquiry needs to reassess its disclosure requests, prioritise by relevance to the issues list, and potentially increase its evidence review team."),
        ...questionBlock("Are information providers cooperating fully and in a timely manner?", "Slow or incomplete cooperation is a common problem. For statutory inquiries, escalation to Section 21 compulsion notices is available. For non-statutory inquiries, the options are more limited."),
        new Paragraph({ children: [new PageBreak()] }),

        // ═══════════════════════════════════════════════════════════
        // PHASE 6
        // ═══════════════════════════════════════════════════════════
        heading1("Phase 6: Hearings"),

        heading2("What Needs to Happen"),
        para("This phase covers preliminary hearings, substantive oral evidence sessions, and closing submissions. It is the most visible phase of the inquiry and typically attracts the most public and media attention."),

        heading2("Critical Considerations"),
        heading3("The Inquisitorial Nature of Inquiry Hearings"),
        para("A public inquiry is not a trial. It operates on an inquisitorial rather than adversarial basis. Counsel to the inquiry conducts the primary questioning of witnesses. Core participant counsel may apply to ask questions or suggest lines of questioning, but the chair controls this process. This is a fundamental principle that is sometimes misunderstood by participants accustomed to courtroom advocacy."),

        heading3("Witness Support"),
        para("All inquiries should give careful consideration to how they support witnesses, particularly those who are traumatised or vulnerable. Good practice includes pre-hearing meetings with counsel, personal supporters in the hearing room, regular breaks, confidential psychological support, and accessible facilities. A trauma-informed approach should be embedded throughout."),

        heading3("Judicial Review Risk"),
        para("Procedural decisions during hearings can be challenged by judicial review within 14 days of the applicant becoming aware of the decision. The threshold for success is high \u2014 most challenges fail \u2014 but even unsuccessful challenges cause delay and disruption. Document the reasoning for all significant procedural decisions."),

        heading2("Common Pitfalls"),
        bullet("Inadequate witness support, leading to poor quality evidence and reputational damage for the inquiry.", "bullets6"),
        bullet("Failing to manage core participant expectations about questioning, leading to frustration and applications that slow proceedings.", "bullets6"),
        bullet("Not publishing transcripts promptly, undermining the transparency commitment.", "bullets6"),
        bullet("Underestimating the administrative burden of managing daily hearings over months or years.", "bullets6"),

        heading2("Key Questions for Consulting Sessions"),
        ...questionBlock("Is counsel to the inquiry effectively controlling the questioning process?", "If hearings are becoming adversarial or core participant counsel is dominating, the inquisitorial character of the inquiry is being lost. The chair needs to reassert control."),
        ...questionBlock("Are vulnerable witnesses receiving adequate support?", "This should be assessed continuously, not just at the start. Witness needs can change, and what works for one witness may not work for another."),
        new Paragraph({ children: [new PageBreak()] }),

        // ═══════════════════════════════════════════════════════════
        // PHASE 7
        // ═══════════════════════════════════════════════════════════
        heading1("Phase 7: Report, Publication and Closure"),

        heading2("What Needs to Happen"),
        para("The final phase covers writing the report, the Maxwellisation process, pre-publication reviews, advance access arrangements, publication and laying before Parliament, and then closing down the inquiry including archiving, contract termination, staff redeployment, and lessons learned."),

        heading2("Critical Considerations"),
        heading3("The Maxwellisation Process"),
        para("Warning letters must be sent to anyone who may be subject to explicit or significant criticism in the report (this is mandatory for statutory inquiries under the Inquiry Rules). The process requires sufficient time for recipients to consider the draft criticisms and make representations. Building adequate time for Maxwellisation into the timetable from the outset is essential \u2014 it routinely takes longer than planned."),

        heading3("Advance Access and the Lock-In"),
        para("Core participants and their legal representatives receive embargoed copies of the report before publication. The minister also receives advance access to prepare a parliamentary response. Managing these competing expectations \u2014 particularly where victims feel ministers should not have more time with the report than they do \u2014 requires careful negotiation."),
        para("The lock-in itself is a significant logistical operation: venue security, device surrender, separate rooms for different participant groups, signed confidentiality undertakings, staggered access periods, and provisions for warning letter recipients who should not be identified."),

        heading3("Recommendation Implementation"),
        para("Public inquiry recommendations are non-binding. Once the report is delivered and the chair notifies the minister that the terms of reference are fulfilled, the inquiry comes to an end. Beyond public criticism and political pressure, there is currently no recourse if the government fails to implement recommendations or explain its reasons."),
        para("Good practice is for the government to respond within six months, clearly stating which recommendations are accepted, with reasons for any that are not, and providing annual updates to Parliament on implementation. Some chairs have chosen to monitor implementation personally or to adjourn rather than formally close."),

        heading2("Common Pitfalls"),
        bullet("Underestimating the time needed for Maxwellisation, delaying publication.", "bullets7"),
        bullet("Allowing extended ministerial advance access, creating a perception that the report has been influenced.", "bullets7"),
        bullet("Not planning for closure from the outset, leading to expensive and chaotic wind-down.", "bullets7"),
        bullet("Failing to submit a lessons learned paper, wasting the institutional knowledge the inquiry has generated.", "bullets7"),
        bullet("Not arranging for continuation of witness and stakeholder support after the inquiry closes.", "bullets7"),

        heading2("Key Questions for Consulting Sessions"),
        ...questionBlock("Has sufficient time been built into the timetable for Maxwellisation?", "If the answer is no, or if the process is already underway and proving more extensive than expected, the publication date may need to be revised. Under-allocating time for this process is one of the most common planning failures."),
        ...questionBlock("Are there clear arrangements for who manages queries after the inquiry closes?", "Once the inquiry closes, responsibility for FOI requests, parliamentary questions, and public queries transfers to the sponsor department. If this handover is not planned, things fall through the cracks."),
        ...questionBlock("Is there a plan for monitoring whether recommendations are actually implemented?", "The inquiry\u2019s credibility ultimately rests on whether its recommendations lead to change. If there is no mechanism for monitoring implementation, the risk is that recommendations are quietly shelved."),
        new Paragraph({ children: [new PageBreak()] }),

        // ═══════════════════════════════════════════════════════════
        // APPENDIX
        // ═══════════════════════════════════════════════════════════
        heading1("Appendix: Toolkit Components"),
        para("This reference guide is one of three components in the consulting toolkit:"),
        spacer(),
        boldPara("1. Interactive Consulting Tool (React web app): ", "A browser-based structured assessment tool for use during consulting sessions. It walks through diagnostic questions for each phase, captures responses, and generates a prioritised gap analysis and action plan. Use it in the room with the client."),
        spacer(),
        boldPara("2. Inquiry Lifecycle Workbook (Excel): ", "A multi-tab tracking workbook with phase checklists, decision log, risk register, budget tracker, core participant register, stakeholder map, and a statutory vs non-statutory decision matrix. Use it as a leave-behind for the client to track progress between sessions."),
        spacer(),
        boldPara("3. This Reference Guide (Word): ", "The substantive companion covering what needs to happen in each phase, critical considerations, common pitfalls, role maps, and diagnostic questions. Use it to prepare for consulting sessions and to deepen your advice on specific topics."),
      ]
    },
  ]
});

Packer.toBuffer(doc).then(buffer => {
  const path = "/sessions/lucid-youthful-gates/mnt/practical guide/Inquiry Consulting Reference Guide.docx";
  fs.writeFileSync(path, buffer);
  console.log("Saved to " + path);
});
