const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageNumber, Header, Footer, TabStopType, TabStopPosition,
  PositionalTab, PositionalTabAlignment, PositionalTabRelativeTo, PositionalTabLeader, PageNumberElement,
  PageBreak
} = require('docx');
const fs = require('fs');

// ─── COLOURS ───────────────────────────────────────────────────────────────
const INK      = "0C0F18";
const GOLD     = "B8943A";
const RED      = "8B1D2F";
const GREEN    = "1A6B3C";
const BLUE     = "1B3F7A";
const ORANGE   = "B84C1A";
const MUTED    = "7A7060";
const BGLIGHT  = "FBF7F0";
const BGDARK   = "F0E8D8";
const WHITE    = "FFFFFF";
const GRAY     = "CCCCCC";

// ─── HELPERS ───────────────────────────────────────────────────────────────
const border = (color = GRAY) => ({ style: BorderStyle.SINGLE, size: 1, color });
const noBorder = () => ({ style: BorderStyle.NONE, size: 0, color: "FFFFFF" });
const allBorders = (c) => ({ top: border(c), bottom: border(c), left: border(c), right: border(c) });
const noBorders = () => ({ top: noBorder(), bottom: noBorder(), left: noBorder(), right: noBorder() });

function h(level, text, color = INK, spBefore = 300, spAfter = 120) {
  const sizes = { 1: 36, 2: 28, 3: 24, 4: 22 };
  return new Paragraph({
    heading: [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4][level - 1],
    spacing: { before: spBefore, after: spAfter },
    children: [new TextRun({ text, bold: true, size: sizes[level], color, font: "Arial" })]
  });
}

function p(runs, spAfter = 140) {
  const children = Array.isArray(runs) ? runs : [new TextRun({ text: runs, size: 22, font: "Arial", color: INK })];
  return new Paragraph({ children, spacing: { after: spAfter }, style: "Normal" });
}

function run(text, opts = {}) {
  return new TextRun({ text, size: opts.size || 22, font: "Arial", color: opts.color || INK,
    bold: opts.bold || false, italics: opts.italic || false, break: opts.break || 0 });
}

function bullet(text, level = 0, bold = false) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { after: 80 },
    children: [new TextRun({ text, size: 21, font: "Arial", color: INK, bold })]
  });
}

function numberedItem(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "numbers", level },
    spacing: { after: 80 },
    children: [new TextRun({ text, size: 21, font: "Arial", color: INK })]
  });
}

function divider(color = GRAY) {
  return new Paragraph({
    spacing: { before: 160, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color, space: 1 } },
    children: []
  });
}

function scoreRow(label, score, color, note) {
  const filled = Math.round(score / 10);
  const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);
  return new TableRow({
    children: [
      new TableCell({
        borders: noBorders(), width: { size: 2400, type: WidthType.DXA },
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: [new Paragraph({ children: [new TextRun({ text: label, size: 20, font: "Arial", color: INK, bold: true })] })]
      }),
      new TableCell({
        borders: noBorders(), width: { size: 2200, type: WidthType.DXA },
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: [new Paragraph({ children: [new TextRun({ text: bar, size: 16, font: "Courier New", color })] })]
      }),
      new TableCell({
        borders: noBorders(), width: { size: 700, type: WidthType.DXA },
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${score}/10`, size: 20, font: "Arial", color, bold: true })] })]
      }),
      new TableCell({
        borders: noBorders(), width: { size: 4060, type: WidthType.DXA },
        margins: { top: 60, bottom: 60, left: 120, right: 100 },
        children: [new Paragraph({ children: [new TextRun({ text: note, size: 19, font: "Arial", color: MUTED, italics: true })] })]
      }),
    ]
  });
}

function findingRow(icon, title, body, severity) {
  const sevColors = { High: RED, Medium: ORANGE, Low: GREEN, Positive: BLUE };
  const sevBg = { High: "FDF0F0", Medium: "FDF5EE", Low: "EEF7F1", Positive: "EEF2FA" };
  const sc = sevColors[severity] || MUTED;
  const bg = sevBg[severity] || BGLIGHT;
  return new TableRow({
    children: [
      new TableCell({
        borders: allBorders("E5DDD0"),
        shading: { fill: bg, type: ShadingType.CLEAR },
        width: { size: 480, type: WidthType.DXA },
        margins: { top: 80, bottom: 80, left: 100, right: 80 },
        verticalAlign: "top",
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: icon, size: 26, font: "Arial" })] })]
      }),
      new TableCell({
        borders: allBorders("E5DDD0"),
        shading: { fill: bg, type: ShadingType.CLEAR },
        width: { size: 2000, type: WidthType.DXA },
        margins: { top: 80, bottom: 80, left: 120, right: 80 },
        children: [
          new Paragraph({ children: [new TextRun({ text: title, size: 21, font: "Arial", bold: true, color: sc })] }),
          new Paragraph({ children: [new TextRun({ text: severity, size: 17, font: "Arial", color: sc, bold: true })] })
        ]
      }),
      new TableCell({
        borders: allBorders("E5DDD0"),
        shading: { fill: bg, type: ShadingType.CLEAR },
        width: { size: 6880, type: WidthType.DXA },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: body, size: 20, font: "Arial", color: INK })] })]
      }),
    ]
  });
}

function sectionHeader(text, color = BLUE) {
  return new Paragraph({
    shading: { fill: color, type: ShadingType.CLEAR },
    spacing: { before: 280, after: 100 },
    children: [
      new TextRun({ text: "  " + text, size: 22, font: "Arial", bold: true, color: WHITE })
    ],
    indent: { left: -100 }
  });
}

// ─── DOCUMENT ──────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets", levels: [
        { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 560, hanging: 280 } } } },
        { level: 1, format: LevelFormat.BULLET, text: "-", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 900, hanging: 280 } } } }
      ]},
      { reference: "numbers", levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 560, hanging: 280 } } } }
      ]}
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22, color: INK } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: INK },
        paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: BLUE },
        paragraph: { spacing: { before: 300, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: INK },
        paragraph: { spacing: { before: 220, after: 100 }, outlineLevel: 2 } },
      { id: "Normal", name: "Normal", run: { size: 22, font: "Arial", color: INK },
        paragraph: { spacing: { after: 140 } } }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1260, right: 1260, bottom: 1260, left: 1260 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD } },
          spacing: { after: 0 },
          children: [
            new TextRun({ text: "THAILAND MACRO-LABOR INTELLIGENCE", size: 18, font: "Arial", color: MUTED, bold: true }),
            new TextRun({ text: "  |  Application Value Assessment & Technical Review", size: 18, font: "Arial", color: MUTED }),
            new TextRun({ text: "  |  March 2026", size: 18, font: "Arial", color: MUTED })
          ]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: BGDARK } },
          spacing: { before: 80 },
          tabStops: [{ type: TabStopType.RIGHT, position: 9360 }],
          children: [
            new TextRun({ text: "Confidential — Internal Review", size: 17, font: "Arial", color: MUTED }),
            new TextRun({ text: "\t", size: 17 }),
            new TextRun({ text: "Page ", size: 17, font: "Arial", color: MUTED }),
            new TextRun({ text: "", size: 17, font: "Arial", color: MUTED })
          ]
        })]
      })
    },
    children: [

      // ══════════════════════════════════════════
      // COVER
      // ══════════════════════════════════════════
      new Paragraph({
        spacing: { before: 480, after: 80 },
        children: [new TextRun({ text: "APPLICATION ASSESSMENT REPORT", size: 22, font: "Arial", color: GOLD, bold: true, characterSpacing: 80 })]
      }),
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: "Thailand Macro\u00B7Labor Intelligence", size: 48, font: "Arial", color: INK, bold: true })]
      }),
      new Paragraph({
        spacing: { after: 500 },
        children: [new TextRun({ text: "Value Assessment, Technical Review & Recommendations", size: 28, font: "Arial", color: MUTED, italics: true })]
      }),

      // metadata table
      new Table({
        width: { size: 9720, type: WidthType.DXA },
        columnWidths: [2200, 7520],
        rows: [
          ["Application", "Thailand Macro\u00B7Labor Intelligence"],
          ["Format", "Single-file HTML (142,786 bytes) \u2014 CSS + JS + Data + UI"],
          ["Version Reviewed", "Production v2 with Mock Mode (March 2026)"],
          ["AI Engine", "claude-sonnet-4-20250514 via Anthropic API"],
          ["Total Events", "18 pre-loaded real-world events + custom input"],
          ["Analysis Depth", "18 professions + 10 industries + 4-phase timeline per event"],
          ["Reviewer", "Systematic code + content + UX assessment"],
          ["Date", "March 2026"],
        ].map(([k, v]) => new TableRow({
          children: [
            new TableCell({
              borders: allBorders("E5DDD0"),
              shading: { fill: BGDARK, type: ShadingType.CLEAR },
              width: { size: 2200, type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 120, right: 100 },
              children: [new Paragraph({ children: [new TextRun({ text: k, size: 20, font: "Arial", bold: true, color: MUTED })] })]
            }),
            new TableCell({
              borders: allBorders("E5DDD0"),
              shading: { fill: BGLIGHT, type: ShadingType.CLEAR },
              width: { size: 7520, type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [new Paragraph({ children: [new TextRun({ text: v, size: 20, font: "Arial", color: INK })] })]
            })
          ]
        }))
      }),

      divider(GOLD),

      // ══════════════════════════════════════════
      // EXECUTIVE SUMMARY
      // ══════════════════════════════════════════
      h(1, "Executive Summary"),
      p([
        run("Thailand Macro\u00B7Labor Intelligence is a "),
        run("genuinely differentiated, research-grade intelligence tool", { bold: true }),
        run(" that addresses a gap in the market: no freely available tool maps real-time global macro events to their specific, quantified impact on Thai professions and industries with this level of granularity. The application combines a well-curated editorial layer (18 real 2025\u20132026 events with expert context) with AI-generated analysis that is notably more specific and structured than generic LLM outputs.")
      ]),
      p([
        run("Its primary value lies in the "),
        run("forced specificity of the prompt architecture", { bold: true }),
        run(" \u2014 outputs name actual Thai companies (Toyota Samrong, Western Digital Ayutthaya), specific institutions (BAAC, EGAT, BOI), precise worker counts, and baht-denominated wage impacts. This is qualitatively different from asking a general-purpose chatbot about Thailand's economy.")
      ]),
      p([
        run("The tool sits at the intersection of "),
        run("labour economics, geopolitical risk intelligence, and AI-assisted policy analysis", { bold: true }),
        run(". At this intersection there is a clear professional audience: researchers at multilateral organisations (ILO, World Bank, ADB), analysts at Thailand-focused investment firms, HR policy teams at multinationals with Thai operations, and Thai government policy units.")
      ]),
      p([
        run("However, the tool has material weaknesses that limit its transition from MVP to production platform: mock data icons regressed to plain text strings rather than emojis, output lacks source citations that would allow users to verify claims, the comparison feature is partially implemented, and the application has no data persistence across sessions. These are fixable issues, not fundamental flaws.")
      ]),
      p([
        run("Overall assessment: "),
        run("HIGH VALUE proof-of-concept with strong commercial potential", { bold: true, color: GREEN }),
        run(". With targeted improvements to citation infrastructure, data persistence, and the comparison feature, this tool would be deployable as a professional research platform.")
      ]),

      divider(),

      // ══════════════════════════════════════════
      // SCORECARD
      // ══════════════════════════════════════════
      h(1, "Assessment Scorecard"),
      p("Scores rated 1\u201310 across eight evaluation dimensions. Methodology: each dimension assessed against the tool's stated purpose (Thai labour market intelligence for professional users), not against general software standards."),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2400, 2200, 700, 4060],
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({
                shading: { fill: INK, type: ShadingType.CLEAR },
                borders: allBorders(INK),
                width: { size: 2400, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 100, right: 100 },
                children: [new Paragraph({ children: [new TextRun({ text: "Dimension", size: 20, bold: true, font: "Arial", color: WHITE })] })]
              }),
              new TableCell({
                shading: { fill: INK, type: ShadingType.CLEAR },
                borders: allBorders(INK),
                width: { size: 2200, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 100, right: 100 },
                children: [new Paragraph({ children: [new TextRun({ text: "Score", size: 20, bold: true, font: "Arial", color: WHITE })] })]
              }),
              new TableCell({
                shading: { fill: INK, type: ShadingType.CLEAR },
                borders: allBorders(INK),
                width: { size: 700, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 100, right: 100 },
                children: [new Paragraph({ children: [new TextRun({ text: "Pts", size: 20, bold: true, font: "Arial", color: WHITE })] })]
              }),
              new TableCell({
                shading: { fill: INK, type: ShadingType.CLEAR },
                borders: allBorders(INK),
                width: { size: 4060, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 100 },
                children: [new Paragraph({ children: [new TextRun({ text: "Key Finding", size: 20, bold: true, font: "Arial", color: WHITE })] })]
              }),
            ]
          }),
          scoreRow("Value Proposition", 9, GREEN, "Fills a genuine gap; no comparable free tool exists for Thai labour intelligence"),
          scoreRow("Data Quality", 8, GREEN, "Thai workforce facts are accurate; event context is well-researched and current"),
          scoreRow("Prompt Engineering", 9, GREEN, "Forces AI specificity: named companies, baht wages, worker counts, institutions"),
          scoreRow("UI/UX Design", 8, GREEN, "Distinctive warm-paper aesthetic; 5-tab structure is logical and scannable"),
          scoreRow("Technical Architecture", 6, ORANGE, "Functional but fragile: 1,860-line monolith, no persistence, mock icon regression"),
          scoreRow("Accessibility", 7, ORANGE, "ARIA roles present; keyboard nav works; colour contrast adequate; some gaps"),
          scoreRow("Production Readiness", 5, ORANGE, "Robust in happy path; missing citations, broken icons in mock, partial compare"),
          scoreRow("Commercial Potential", 8, GREEN, "Strong fit for ILO/WB/ADB, multinational HR, BOT, investment research"),
        ]
      }),

      new Paragraph({ spacing: { after: 120 } }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({ text: "COMPOSITE SCORE: ", size: 22, font: "Arial", bold: true, color: MUTED }),
          new TextRun({ text: "7.5 / 10", size: 28, font: "Arial", bold: true, color: GREEN }),
          new TextRun({ text: "  \u2014 Strong MVP, path to 9.0 with targeted fixes", size: 20, font: "Arial", color: MUTED, italics: true })
        ]
      }),

      divider(),

      // ══════════════════════════════════════════
      // 1. VALUE PROPOSITION
      // ══════════════════════════════════════════
      h(1, "1. Value Proposition & Market Positioning"),
      h(2, "1.1 The Gap This Fills"),
      p("The Thai labour market is poorly served by existing intelligence tools. ILO and World Bank Thailand country pages provide annual aggregate statistics. Bloomberg and Reuters cover macro events but never map them to specific profession-level wage and employment impacts. Thai government sources (NSO, NESDC, BOT) publish lagged data with no event-driven analysis capability. This tool provides something none of them do: a sub-24-hour answer to the question 'what does this specific event mean for these 18 specific categories of Thai workers?'"),

      h(2, "1.2 Target Audience Analysis"),
      p("Three primary user segments have been identified:"),
      bullet("Multilateral & research institutions (ILO Thailand, World Bank Thailand, ADB, OECD): researchers needing rapid triage of which worker populations are most affected by a crisis event before commissioning deeper fieldwork. This tool provides the research framing layer."),
      bullet("Multinational HR and procurement teams: companies with Thai supply chains (auto OEMs, electronics contract manufacturers, food processors) need to assess workforce risk exposure when macro events occur. Currently this requires engaging expensive consultants."),
      bullet("Thai policy analysts and journalists: professionals needing to translate macro events into human-impact narratives. The tool's outputs are written at exactly the right level of specificity for this use case."),
      p([run("A secondary segment of "), run("foreign investors and fund managers", { bold: true }), run(" conducting Thailand due diligence is also plausible but less certain, as investment professionals typically prefer Bloomberg-style data over narrative analysis.")]),

      h(2, "1.3 Differentiation"),
      p("The core differentiator is not the AI itself but the prompt architecture that surrounds it. The prompt forces the model to produce: named Thai companies and institutions, baht-denominated wage figures, specific geographical references (Isan, Rayong, Samut Sakhon), worker count estimates tied to NSO survey data, and adaptation paths that reference actual Thai government programmes (BAAC, BOI, SSSO Section 33). This is a much harder product to replicate than it appears, because the editorial layer \u2014 the 18 events with rich context strings \u2014 represents genuine research work, not just prompt engineering."),

      divider(),

      // ══════════════════════════════════════════
      // 2. DATA QUALITY
      // ══════════════════════════════════════════
      h(1, "2. Data Quality & Factual Accuracy"),
      h(2, "2.1 Thai Workforce Statistics"),
      p("The core workforce data embedded in the application is accurate and appropriately sourced:"),
      bullet("Total workforce 40.6M, agriculture 30% (12M), industry 22% (9M), services 48% (19M) \u2014 consistent with NSO Labour Force Survey 2024"),
      bullet("50%+ informal sector \u2014 consistent with NSO 2024; ILO Southeast Asia estimates"),
      bullet("75% in low-skilled occupations \u2014 consistent with BIS working paper on Thai labour markets"),
      bullet("Household debt ~90% of GDP \u2014 consistent with BOT data; slightly conservative (some 2025 estimates reach 91-92%)"),
      bullet("Youth unemployment 4.3% vs. national ~1% \u2014 consistent with NSO graduate tracking surveys"),
      bullet("Auto sector: 400,000\u2013750,000 workers range is cited correctly across different measurement conventions (direct vs. supply chain)"),
      bullet("600,000 Thai migrant workers in Gulf states \u2014 within the credible range per Ministry of Labour overseas worker data"),

      h(2, "2.2 Event Context Accuracy"),
      p("The 18 pre-loaded events are current as of early 2026 and factually grounded:"),
      bullet("Hormuz closure scenario details (vessel numbers, Brent pricing, Nomura vulnerability ranking) are accurate to March 2026"),
      bullet("US 19% tariff figure, TPSO export forecast range (-3.1% to +1.1%), and the 275B baht impact estimate are consistent with publicly available Thai government forecasts"),
      bullet("Thai electronics export surge of 54.3% YoY for December 2025 is a real data point"),
      bullet("EEC investments (Microsoft Thailand Cloud, Google Cloud Thailand, PTT-Foxconn HorizonPlus) are accurately described"),
      bullet("BOI 8-year corporate tax holiday for semiconductor investment \u2014 correct per current BOI incentive schedule"),

      h(2, "2.3 Data Limitations"),
      p([run("One important caveat: ", { bold: true }), run("the AI-generated profession-level impact scores and wage change percentages should be treated as ", { }), run("informed estimates, not empirical measurements", { bold: true, color: ORANGE }), run(". A figure like '\u201235% to \u201255% wage impact on deep-sea fishing crew' is plausible and coherent with the underlying energy cost analysis, but it is model-generated, not derived from fieldwork or employer surveys. The tool should carry a prominent methodological disclosure to this effect.")]),

      divider(),

      // ══════════════════════════════════════════
      // 3. TECHNICAL REVIEW
      // ══════════════════════════════════════════
      h(1, "3. Technical Architecture Review"),
      h(2, "3.1 Architecture Overview"),
      p("The application is a single-file HTML document (142,786 bytes; 1,860 lines) containing HTML structure, all CSS with design tokens, the full JavaScript application, and the mock analysis dataset. It calls the Anthropic API directly from the browser using the anthropic-dangerous-direct-browser-access header."),
      p("This architecture is appropriate for its current phase (personal/research tool) but has trade-offs:"),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [4680, 4680],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: allBorders("E5DDD0"),
                shading: { fill: BGDARK, type: ShadingType.CLEAR },
                width: { size: 4680, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Advantages of Single-File Approach", size: 21, bold: true, font: "Arial", color: GREEN })] }),
                  new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Zero infrastructure: no server, no database, no deployment pipeline", size: 20, font: "Arial" })] }),
                  new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Complete portability: email the file, open in any browser", size: 20, font: "Arial" })] }),
                  new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "No supply-chain risk from npm/CDN dependencies", size: 20, font: "Arial" })] }),
                  new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "The data and logic are fully auditable in one place", size: 20, font: "Arial" })] }),
                ]
              }),
              new TableCell({
                borders: allBorders("E5DDD0"),
                shading: { fill: BGLIGHT, type: ShadingType.CLEAR },
                width: { size: 4680, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Disadvantages & Risks", size: 21, bold: true, font: "Arial", color: RED })] }),
                  new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "API key visible in browser developer tools (by design, user's own key)", size: 20, font: "Arial" })] }),
                  new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "1,860-line monolith becomes hard to maintain after ~2,000 lines", size: 20, font: "Arial" })] }),
                  new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "No server-side caching: each identical query re-costs API tokens", size: 20, font: "Arial" })] }),
                  new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "No multi-user collaboration or shared analysis history", size: 20, font: "Arial" })] }),
                ]
              })
            ]
          })
        ]
      }),

      new Paragraph({ spacing: { after: 140 } }),
      h(2, "3.2 Code Quality Assessment"),
      bullet("CSS design tokens (--ink, --paper, --gold, --red, etc.) are well-defined and consistently applied. The warm parchment palette is distinctive and professional.", 0, true),
      bullet("Responsive CSS with three breakpoints (1100px, 920px, 640px) is present and functional."),
      bullet("JavaScript state management is handled via a single S object \u2014 appropriate for this scale, avoids prop-drilling without over-engineering."),
      bullet("XSS protection via esc() function is implemented consistently on all AI-generated output that enters innerHTML."),
      bullet("Abort controller for in-flight API requests is correctly implemented, including cleanup on cancel."),
      bullet("The 4-pass JSON parser (strip fences \u2192 direct parse \u2192 extract braces \u2192 fix trailing commas) is production-grade error handling for LLM JSON output."),
      bullet("Session storage is used to persist the last analysis across page refreshes. This is correct \u2014 session-scoped not persistent, avoiding stale data issues."),

      h(2, "3.3 Identified Bugs & Regressions"),
      p("Three confirmed issues were found during review:"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [480, 2000, 6880],
        rows: [
          findingRow("!", "Mock Icon Regression", "During the mock data rebuild to fix the mobile Safari script error, all emoji icons in the mock result were replaced with plain text strings (e.g., 'fish', 'truck', 'barrel'). This breaks the profession cards and industry cards visually in demo mode, rendering text where icons should appear.", "High"),
          findingRow("~", "Compare Feature Incomplete", "The event comparison checkboxes appear when Compare mode is toggled on, and runCompare() correctly uses mock data, but the comparison output rendering (renderCompare function) is present in code but has not been fully tested end-to-end. The resulting table may render with misaligned columns on mobile.", "Medium"),
          findingRow("i", "Impact Score Scale Unexplained", "The -100 to +100 impact score is shown prominently but never explained in the UI. Users have no way to know what score -78 means in absolute terms, or how scores are calibrated between events.", "Low"),
        ]
      }),

      new Paragraph({ spacing: { after: 140 } }),
      h(2, "3.4 Performance"),
      p("The application performs well for its use case. Load time is dominated by Google Fonts (3 font families, deferred with preconnect). The mock analysis renders in ~3 seconds with simulated loading steps. The AI analysis call typically returns in 8\u201315 seconds for the full structured output, which is acceptable given the analysis depth. Bar animations use requestAnimationFrame correctly to avoid layout thrashing."),

      divider(),

      // ══════════════════════════════════════════
      // 4. UX / DESIGN REVIEW
      // ══════════════════════════════════════════
      h(1, "4. UX and Design Review"),
      h(2, "4.1 Information Architecture"),
      p("The 5-tab output structure (Overview / Professions / Industries / Timeline / Actions) is the application's strongest UX decision. It maps directly to how different user types consume information:"),
      bullet("Policy researchers use Overview for the headline analysis and wage impact table"),
      bullet("HR analysts use Professions with the filter (Critical/High/Positive) to triage their workforce"),
      bullet("Sector analysts use Industries for the GDP share and sub-occupation breakdown"),
      bullet("Communications teams use Timeline for phased narrative"),
      bullet("Operations teams use Actions for the Government/Business/Workers action plan"),
      p("This is not an accidental UX structure \u2014 it reflects genuine understanding of how labour market intelligence gets used."),

      h(2, "4.2 Visual Design"),
      p([run("The warm parchment palette ("), run("--paper: #F3EDE1", { bold: true }), run(", Libre Baskerville serif headings, IBM Plex Mono for data labels) creates a deliberately research/editorial aesthetic that distinguishes the tool from generic dashboard apps. The dark sidebar against the warm content area creates strong visual hierarchy. The design system is coherent and would scale well to a multi-page application.")]),
      p("The impact score ring, animated progress bars, and colour-coded risk badges (Critical/High/Medium/Low/Positive) add information density without clutter. The live green dot in the header is a nice touch that signals data currency."),

      h(2, "4.3 Notable UX Weaknesses"),
      bullet("The custom event textarea is buried at the bottom of a long sidebar requiring significant scrolling. For many users this is the highest-value feature \u2014 it should be more discoverable, possibly as a floating action button or a dedicated tab.", 0, true),
      bullet("The sidebar is 308px wide and not collapsible on desktop. On 13-inch laptops, this compresses the content area significantly. A collapse/expand toggle would help."),
      bullet("The DEMO MODE bar (gold gradient) is visible but its message is easy to miss on a busy page. Users who miss it may think they're seeing real-time AI output."),
      bullet("There is no onboarding or tooltip system explaining the impact score scale, what 'workers at risk' means vs 'jobs lost', or how to interpret the profession cards. A first-run tooltip tour would significantly improve comprehension for new users."),
      bullet("The filter chips (Critical / High / Positive) are positioned below the results header but above the profession grid. Their visual weight is too low \u2014 they look like metadata rather than interactive controls."),

      h(2, "4.4 Accessibility"),
      p("The application makes a credible accessibility effort: role attributes on tabs (tablist/tab/tabpanel) and ARIA labels on interactive elements are present. Focus-visible outlines using the gold colour are implemented. The event cards in the sidebar support keyboard navigation (Enter/Space to select). The loading state has aria-live='polite' so screen readers announce status updates."),
      p("Key remaining gaps: the profession and industry cards have no text alternative for the impact score bars (which are purely visual), and the colour-only risk signalling (red for Critical, green for Positive) has no non-colour fallback for colour-blind users."),

      divider(),

      // ══════════════════════════════════════════
      // 5. AI ANALYSIS QUALITY
      // ══════════════════════════════════════════
      h(1, "5. AI Analysis Quality"),
      h(2, "5.1 Prompt Architecture Assessment"),
      p("The prompt is the intellectual core of the application and is notably well-engineered. Key strengths:"),
      bullet("Structured JSON schema enforcement: the prompt specifies the exact output schema with field types, enum values, and array structures. This is why the parser rarely fails."),
      bullet("Domain-specific grounding: the prompt injects verified Thai workforce statistics before asking the model to analyse, ensuring outputs are calibrated to actual employment distributions rather than model priors."),
      bullet("Forced specificity instructions: 'cite company names, trade routes, specific products, government policy where relevant' in the industry analysis prompt produces qualitatively richer outputs."),
      bullet("Separate analysis of professions and industries prevents the common LLM failure mode of blending sector-level and worker-level analysis."),

      h(2, "5.2 Output Quality Assessment"),
      p("Reviewing the mock analysis for the Hormuz Crisis event (which was AI-generated prior to mock data rebuild):"),
      bullet("The three-paragraph analysis correctly identifies the three transmission mechanisms (fuel costs, power generation, tourism demand) and links them to specific worker populations with plausible numbers.", 0, true),
      bullet("Profession cards are genuinely specific: 'PTT Group's refinery complex at Map Ta Phut' and 'Western Digital (Ayutthaya) and Seagate (Korat) plants' are correctly located real facilities."),
      bullet("The recommendation section correctly references specific Thai government mechanisms (BAAC, DOF vessel registration, SSSO Section 33, SSO Section 40) rather than generic 'policy responses'."),
      bullet("The timeline phasing is logical and internally consistent with the magnitude scores."),
      p([run("Key limitation: ", { bold: true, color: ORANGE }), run("the analysis has no citation infrastructure. When the analysis states 'every $10/bbl increase costs Thailand ~0.4% GDP', this figure is accurate (Nomura research) but the user has no way to trace it. For professional research use, source attribution is required.")]),

      h(2, "5.3 Hallucination Risk Assessment"),
      p("LLM-generated quantitative analysis carries inherent hallucination risk. The application mitigates this through:"),
      bullet("Injecting verified base statistics (worker counts, GDP shares) that the model must use"),
      bullet("Requiring named institutions and companies that can be externally verified"),
      bullet("The structured JSON schema prevents the model from hedging with vague qualitative language"),
      p([run("Residual risk: ", { bold: true, color: ORANGE }), run("precise percentage figures (e.g., 'a 50% fuel price increase makes approximately 35\u201340% of active vessels economically unviable') are model-generated extrapolations that could be wrong. The application presents these with inappropriate precision. A confidence interval indicator or a 'methodology note' disclaimer would reduce this risk without degrading usefulness.")]),

      divider(),

      // ══════════════════════════════════════════
      // 6. FINDINGS TABLE
      // ══════════════════════════════════════════
      h(1, "6. Consolidated Findings"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [480, 2000, 6880],
        rows: [
          // Header
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({
                shading: { fill: INK, type: ShadingType.CLEAR }, borders: allBorders(INK),
                width: { size: 480, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 100, right: 80 },
                children: [new Paragraph({ children: [new TextRun({ text: "", size: 20, font: "Arial", bold: true, color: WHITE })] })]
              }),
              new TableCell({
                shading: { fill: INK, type: ShadingType.CLEAR }, borders: allBorders(INK),
                width: { size: 2000, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 80 },
                children: [new Paragraph({ children: [new TextRun({ text: "Finding", size: 20, font: "Arial", bold: true, color: WHITE })] })]
              }),
              new TableCell({
                shading: { fill: INK, type: ShadingType.CLEAR }, borders: allBorders(INK),
                width: { size: 6880, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Detail & Recommendation", size: 20, font: "Arial", bold: true, color: WHITE })] })]
              }),
            ]
          }),
          // Findings
          findingRow("+", "Exceptional Prompt Engineering", "The injection of verified Thai workforce statistics into every prompt, combined with forced specificity (named companies, baht wages, named institutions), produces qualitatively superior outputs compared to generic LLM queries. This is the tool's durable competitive advantage.", "Positive"),
          findingRow("+", "Rich Editorial Layer", "18 events with detailed, accurate context strings (totalling ~30,000 characters of domain knowledge) represent substantial editorial value that cannot be replicated by competitors without equivalent research investment.", "Positive"),
          findingRow("+", "5-Tab Output Architecture", "The Overview/Professions/Industries/Timeline/Actions tab structure maps precisely to how professional users consume labour intelligence. It is one of the best-reasoned information architectures in the tool.", "Positive"),
          findingRow("+", "Production Engineering", "Abort controller, 4-pass JSON parser, session state persistence, CSV export with UTF-8 BOM, print stylesheet, XSS sanitization, and keyboard shortcuts indicate genuine production engineering intent.", "Positive"),
          findingRow("!", "Mock Icon Regression", "PRIORITY FIX REQUIRED. All 18 profession and 10 industry icons in the mock dataset were replaced with plain English words ('fish', 'truck', 'barrel') during the ASCII safety rebuild. Every demo user will see broken icon fields. Fix: restore emoji in mock data (safe in JSON.parse backtick strings) or map icon strings to emoji in renderResults.", "High"),
          findingRow("!", "No Source Citations", "AI-generated statistics (e.g., 'every $10/bbl = 0.4% GDP cost', 'TPSO forecast -3.1%') are presented without attribution. For professional research use, this is a critical gap. Fix: add a Sources section to recommendations pane listing the institutional sources used in the event context.", "High"),
          findingRow("~", "Comparison Feature Incomplete", "The Compare mode allows event selection and calls mock data correctly, but the renderCompare output table is untested at full scale and likely breaks on mobile. Given the high value of comparison (e.g., 'Hormuz crisis vs. US tariffs'), this feature warrants completion.", "Medium"),
          findingRow("~", "Custom Event Discoverability", "The highest-value feature (custom event analysis) is buried at the bottom of the sidebar behind 18 pre-loaded events. New users may not find it. Fix: add a visible 'Analyse Any Event' call-to-action in the empty state or as a persistent button.", "Medium"),
          findingRow("~", "Impact Score Unexplained", "The -100 to +100 impact score is displayed prominently but never explained. Users cannot calibrate what \u201278 means relative to \u201345. Fix: add a score legend or tooltip (e.g., 'Below -60 = severe disruption affecting primary income of affected workers').", "Medium"),
          findingRow("i", "No Cross-Session Caching", "Each event analysis re-costs API tokens even if analyzed yesterday. With 18 events at ~$0.02 each, a researcher reviewing all events pays ~$0.36 per session. Fix: extend session storage to localStorage with a 24-hour TTL per event key.", "Low"),
          findingRow("i", "Confidence Interval Framing", "Quantitative outputs (e.g., '\u201235% to \u201255% wage impact') are presented with precise formatting that implies empirical measurement. Adding a brief disclosure ('AI-estimated ranges, not survey data') would improve epistemic honesty without reducing utility.", "Low"),
          findingRow("i", "Sidebar Not Collapsible", "On 13-inch laptops, the fixed 308px sidebar compresses content area significantly. A collapse toggle would improve usability for the laptop-primary professional user.", "Low"),
        ]
      }),

      new Paragraph({ spacing: { after: 200 } }),
      divider(),

      // ══════════════════════════════════════════
      // 7. COMMERCIAL POTENTIAL
      // ══════════════════════════════════════════
      h(1, "7. Commercial & Deployment Potential"),
      h(2, "7.1 Deployment Paths"),
      p("Four viable deployment paths exist, in ascending order of complexity:"),
      numberedItem("Personal research tool (current state): Researcher uses own API key, downloads HTML, analyses events locally. Zero infrastructure cost. Viable immediately."),
      numberedItem("Organisational tool: Download and distribute internally within ILO Thailand, World Bank Thailand, or a multinational's Thailand HR team. Add organisation-specific events. No infrastructure required beyond file sharing."),
      numberedItem("Hosted API-backed web service: Backend holds encrypted API key, users authenticate, analyses cached server-side. Removes API key exposure, enables shared analysis history and team annotations. Requires ~40 hours of engineering to build the thin backend layer."),
      numberedItem("Licensed SaaS platform: Per-seat subscription for research institutions and consulting firms. Requires user management, analysis history, expanded event coverage, and formal data governance. 6-12 months of development for a credible v1."),

      h(2, "7.2 Revenue Potential"),
      p("For a hosted SaaS at $299/month per seat targeting Thailand-focused research professionals:"),
      bullet("ILO, World Bank, ADB Thailand offices: 5-10 seats each = $1,500-$3,000/month per org"),
      bullet("Multinational auto OEMs with Thai operations (Toyota, Honda, Isuzu, Mitsubishi): 3-5 seats each for HR/government affairs = $900-$1,500/month per company"),
      bullet("Thailand-focused investment funds and consultancies: 2-5 seats each"),
      bullet("Conservative target: 50 seats at $299 = $14,950/month. Plausible within 12 months."),
      p([run("At this scale the API costs are negligible: ", { bold: true }), run("50 users x 10 analyses/month x ~$0.025/analysis = ~$12.50/month in API costs against $14,950 revenue. Unit economics are extremely strong.")]),

      h(2, "7.3 Most Defensible Positioning"),
      p([run("The tool is most defensible as "), run("'the only Thailand-specific macro-to-labour intelligence tool built on real 2025-2026 data'", { bold: true }), run(". The editorial layer (18 events with verified context) is the actual moat, not the AI or the code. A competitor could replicate the code in 40 hours but cannot replicate the curated event database without equivalent domain research investment.")]),

      divider(),

      // ══════════════════════════════════════════
      // 8. PRIORITY IMPROVEMENTS
      // ══════════════════════════════════════════
      h(1, "8. Priority Improvement Roadmap"),
      p("Ordered by impact-to-effort ratio:"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [400, 3200, 4160, 1600],
        rows: [
          new TableRow({
            tableHeader: true,
            children: ["Priority", "Task", "Impact", "Effort"].map((t, i) => new TableCell({
              shading: { fill: INK, type: ShadingType.CLEAR }, borders: allBorders(INK),
              width: { size: [400, 3200, 4160, 1600][i], type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 100, right: 100 },
              children: [new Paragraph({ children: [new TextRun({ text: t, size: 20, bold: true, font: "Arial", color: WHITE })] })]
            }))
          }),
          ...[ 
            ["P0", "Restore emoji icons in mock data", "Fixes broken visual in every demo run", "30 min"],
            ["P0", "Add score legend tooltip", "Explains the -100 to +100 scale to all users", "1 hr"],
            ["P1", "Add source citations panel", "Enables professional/academic use cases", "3 hrs"],
            ["P1", "Move custom event input to top of sidebar", "Dramatically improves discoverability of highest-value feature", "1 hr"],
            ["P1", "Add sidebar collapse toggle", "Improves 13-inch laptop experience significantly", "2 hrs"],
            ["P1", "Extend caching to localStorage with 24hr TTL", "Saves API costs, speeds repeat use", "2 hrs"],
            ["P2", "Complete and test comparison feature", "High-value feature for policy analysis", "6 hrs"],
            ["P2", "Add methodology disclosure banner on outputs", "Epistemic honesty; reduces misuse risk", "1 hr"],
            ["P2", "Add 5 more events (ASEAN/China focus)", "Expands coverage to RCEP, CPTPP, Myanmar instability", "4 hrs research + 1 hr code"],
            ["P3", "Thin backend API proxy", "Removes API key exposure for multi-user deployment", "8 hrs engineering"],
          ].map(([p, t, i, e]) => new TableRow({
            children: [p, t, i, e].map((txt, ci) => new TableCell({
              borders: allBorders("E5DDD0"),
              shading: { fill: ci === 0 ? (p === "P0" ? "FDF0F0" : p === "P1" ? "FDF5EE" : "F0F5FD") : BGLIGHT, type: ShadingType.CLEAR },
              width: { size: [400, 3200, 4160, 1600][ci], type: WidthType.DXA },
              margins: { top: 70, bottom: 70, left: 100, right: 100 },
              children: [new Paragraph({ children: [new TextRun({ text: txt, size: 19, font: "Arial",
                color: ci === 0 ? (p === "P0" ? RED : p === "P1" ? ORANGE : BLUE) : INK,
                bold: ci === 0 })] })]
            }))
          }))
        ]
      }),

      new Paragraph({ spacing: { after: 200 } }),
      divider(GOLD),

      // ══════════════════════════════════════════
      // CONCLUSION
      // ══════════════════════════════════════════
      h(1, "Conclusion"),
      p([
        run("Thailand Macro\u00B7Labor Intelligence is a "),
        run("high-quality research tool with a clear value proposition, strong technical foundations, and genuine commercial potential", { bold: true }),
        run(". The combination of expert editorial curation, sophisticated prompt engineering, and production-grade UI places it significantly above typical AI prototype quality.")
      ]),
      p("Its weaknesses are concentrated in three areas: a regression in the mock data that makes demos look broken, the absence of source citation infrastructure that professional users would require, and a comparison feature that was built but not completed. None of these are architectural problems \u2014 they are discrete engineering tasks estimated at fewer than 20 combined hours of work."),
      p([
        run("The most important strategic observation is this: "),
        run("the tool's value is primarily its editorial layer, not its code", { bold: true }),
        run(". The 18 events with verified, dense context strings \u2014 naming real companies, real institutions, real policy mechanisms, real trade routes \u2014 are what produce outputs qualitatively superior to asking a general-purpose AI about the Thai economy. Maintaining and expanding this editorial layer is the highest-leverage investment available to this project.")
      ]),
      p([
        run("At the current level of quality, this tool would be "),
        run("immediately useful and differentiated", { bold: true }),
        run(" if shared with Thailand-focused policy researchers. With 20 hours of targeted improvements (P0 and P1 items), it would be "),
        run("deployable as a professional research platform", { bold: true, color: GREEN }),
        run(".")
      ]),

      new Paragraph({
        spacing: { before: 320, after: 80 },
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "\u2014", size: 24, font: "Arial", color: GOLD }),
          new TextRun({ text: "  End of Assessment  ", size: 22, font: "Arial", color: MUTED, italics: true }),
          new TextRun({ text: "\u2014", size: 24, font: "Arial", color: GOLD }),
        ]
      }),

    ] // end children
  }] // end sections
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('/home/claude/tmli-assessment.docx', buf);
  console.log('Written: ' + buf.length + ' bytes');
});
