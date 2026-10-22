/* ============================================================================
   SiteCheck — the management report

   One self-contained HTML file: no images, no scripts, no fonts to fetch. It
   opens by double-clicking on any phone, tablet or laptop, and prints to a
   clean PDF from the browser, which is how a client gets a PDF without this
   app having to build one.

   Everything is worked out from records already on the device, so the report
   covers exactly what the person running it is allowed to see.

   The analysis is the point. Counting how many inspections happened is easy
   and says little; what earns its place is the question that keeps failing
   across every site, and whether the pass rate is moving in the right
   direction. Those are the two things a consultancy gets paid to notice.
   ========================================================================== */

const REPORT = (() => {

  const DAY = 86400000;
  const esc = s => String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');

  const ukDate = ms => new Date(ms).toLocaleDateString('en-GB',
    { day:'2-digit', month:'short', year:'numeric' });
  const shortDate = ms => new Date(ms).toLocaleDateString('en-GB',
    { day:'numeric', month:'short' });

  /* Weeks run Monday to Sunday, because a site week does. */
  function weekStart(ms){
    const d = new Date(ms);
    d.setHours(0,0,0,0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d.getTime();
  }

  /* ---- working the numbers out ----------------------------------------- */
  function analyse(opts){
    const { records, projects, forms, client, weeks = 12 } = opts;

    const inScope = projects.filter(p => !client || (p.client || '').trim() === client);
    const ids = new Set(inScope.map(p => p.id));
    const recs = records.filter(r => ids.has(r.projectId))
                        .sort((a,b) => new Date(b.at) - new Date(a.at));

    // question text, looked up by form and item, for the failure analysis
    const qText = {};
    forms.forEach(f => {
      qText[f.id] = {};
      (f.sections || []).forEach(s => (s.items || []).forEach(i => {
        qText[f.id][i.id] = i.text;
      }));
    });

    // --- weekly buckets ---
    const now = Date.now();
    const firstWeek = weekStart(now) - (weeks - 1) * 7 * DAY;
    const buckets = [];
    for (let i = 0; i < weeks; i++){
      const from = firstWeek + i * 7 * DAY;
      buckets.push({ from, signed:0, fails:0, pass:0, checked:0 });
    }
    const bucketFor = ms => {
      const i = Math.floor((weekStart(ms) - firstWeek) / (7 * DAY));
      return i >= 0 && i < buckets.length ? buckets[i] : null;
    };

    // --- the failure analysis, and the weekly figures, in one pass ---
    const failCounts = {};          // "formId|itemId" -> { text, form, n }
    let checksPassed = 0, checksFailed = 0;

    recs.forEach(r => {
      const b = bucketFor(new Date(r.at).getTime());
      if (b){ b.signed++; b.fails += r.fails || 0; }

      Object.entries(r.answers || {}).forEach(([id, a]) => {
        if (!a || typeof a !== 'object') return;
        if (a.v === 'pass' || a.v === 'fail'){
          if (b){ b.checked++; if (a.v === 'pass') b.pass++; }
          if (a.v === 'pass') checksPassed++; else checksFailed++;
        }
        if (a.v === 'fail'){
          const key = r.formId + '|' + id;
          const text = (qText[r.formId] || {})[id];
          if (!text) return;                       // an item that no longer exists
          failCounts[key] = failCounts[key] || { text, form:r.code || r.formId, n:0 };
          failCounts[key].n++;
        }
      });
    });

    const topFails = Object.values(failCounts).sort((a,b) => b.n - a.n).slice(0, 10);

    // --- per site ---
    const GRADES = [
      { key:'overdue', from:8, label:'Overdue',  colour:'#C8102E' },
      { key:'due',     from:6, label:'Due',      colour:'#E07B00' },
      { key:'current', from:0, label:'Current',  colour:'#007A33' },
    ];
    const sites = inScope.map(p => {
      const mine = recs.filter(r => r.projectId === p.id);
      const lastF02 = mine.filter(r => r.formId === 'f02')
        .reduce((m,r) => Math.max(m, new Date(r.at).getTime()), 0);
      const lastAny = mine.reduce((m,r) => Math.max(m, new Date(r.at).getTime()), 0);
      const days = lastF02 ? Math.floor((now - lastF02) / DAY) : null;
      return {
        p, records: mine.length,
        fails: mine.reduce((n,r) => n + (r.fails || 0), 0),
        lastF02: lastF02 || null, lastAny: lastAny || null, days,
        grade: days == null ? GRADES[0] : GRADES.find(g => days >= g.from),
      };
    }).sort((a,b) => (b.days ?? 1e6) - (a.days ?? 1e6));

    // --- incidents, hazards, talks ---
    const ans = (r, id) => {
      const a = (r.answers || {})[id];
      return a && a.v != null && typeof a.v !== 'object' ? String(a.v) : '';
    };
    const incidents = recs.filter(r => r.formId === 'ac01').map(r => ({
      at:new Date(r.at).getTime(), site:(r.site && r.site.name) || '',
      kind:ans(r,'b4'), what:ans(r,'b5'), riddor:ans(r,'d2'), treatment:ans(r,'c3'), ref:r.ref,
    }));
    const hazards = recs.filter(r => r.formId === 'hz01').map(r => ({
      at:new Date(r.at).getTime(), site:(r.site && r.site.name) || '',
      where:ans(r,'a1'), urgency:ans(r,'b3'), action:ans(r,'b1'),
    }));

    const talkTopics = {};
    let attendances = 0;
    recs.filter(r => r.formId === 'tb01').forEach(r => {
      const topic = ans(r,'a1') || r.title || 'Not stated';
      const rows = (((r.answers || {}).c1) || {}).rows || [];
      attendances += rows.length;
      talkTopics[topic] = (talkTopics[topic] || 0) + 1;
    });
    const topics = Object.entries(talkTopics)
      .map(([topic,n]) => ({ topic, n })).sort((a,b) => b.n - a.n);

    const since = n => recs.filter(r => new Date(r.at).getTime() > now - n*DAY);

    return {
      client, now, weeks: buckets, sites, topFails, incidents, hazards, topics,
      attendances, recs, inScope,
      checksPassed, checksFailed,
      passRate: checksPassed + checksFailed
        ? Math.round(checksPassed / (checksPassed + checksFailed) * 100) : null,
      totals: {
        sites: inScope.length,
        records: recs.length,
        fails: recs.reduce((n,r) => n + (r.fails || 0), 0),
        overdue: sites.filter(s => s.grade.key === 'overdue').length,
        due: sites.filter(s => s.grade.key === 'due').length,
        current: sites.filter(s => s.grade.key === 'current').length,
        incidents: incidents.length,
        inductions: recs.filter(r => r.formId === 'f06').length,
        talks: recs.filter(r => r.formId === 'tb01').length,
        last30: since(30).length,
      },
    };
  }

  /* ---- charts -----------------------------------------------------------
     Inline SVG, drawn to one scale, every axis label naming a value the
     chart actually reaches. No library: a report that needed to fetch a
     charting script would be a blank page on a laptop with no internet. */

  function columnChart(bars, opts){
    const { w = 680, h = 190, colour = '#0057B8', suffix = '' } = opts || {};
    const padL = 34, padB = 26, padT = 12;
    const max = Math.max(1, ...bars.map(b => b.v));
    // a round number above the tallest bar, so the top gridline reads cleanly
    const step = Math.pow(10, Math.floor(Math.log10(max))) * (max / Math.pow(10, Math.floor(Math.log10(max))) > 5 ? 2 : 1);
    const top = Math.ceil(max / step) * step || 1;
    const plotH = h - padB - padT, plotW = w - padL - 6;
    const bw = plotW / bars.length;

    const grid = [0, 0.5, 1].map(f => {
      const y = padT + plotH - f * plotH;
      return `<line x1="${padL}" y1="${y}" x2="${w - 6}" y2="${y}" stroke="#D8D4CB" stroke-width="1"/>
        <text x="${padL - 6}" y="${y + 3.5}" text-anchor="end" font-size="9" fill="#5B6068"
          font-family="monospace">${Math.round(top * f)}${suffix}</text>`;
    }).join('');

    const cols = bars.map((b, i) => {
      const bh = Math.max((b.v / top) * plotH, b.v > 0 ? 2 : 0);
      const x = padL + i * bw + bw * 0.18;
      const y = padT + plotH - bh;
      const label = (i % 2 === 0 || bars.length <= 7)
        ? `<text x="${padL + i*bw + bw/2}" y="${h - 8}" text-anchor="middle" font-size="9"
             fill="#5B6068" font-family="monospace">${esc(b.label)}</text>` : '';
      return `<g><title>${esc(b.title || (b.label + ': ' + b.v + suffix))}</title>
        <rect x="${x}" y="${y}" width="${bw * 0.64}" height="${bh}" fill="${colour}" rx="2"/></g>${label}`;
    }).join('');

    return `<svg viewBox="0 0 ${w} ${h}" class="chart" role="img"
      aria-label="${esc(opts.alt || 'Column chart')}">${grid}${cols}
      <line x1="${padL}" y1="${padT + plotH}" x2="${w - 6}" y2="${padT + plotH}" stroke="#14171A" stroke-width="1.2"/>
    </svg>`;
  }

  function lineChart(points, opts){
    const { w = 680, h = 140, colour = '#007A33' } = opts || {};
    const padL = 34, padB = 26, padT = 12;
    const plotH = h - padB - padT, plotW = w - padL - 10;
    const real = points.filter(p => p.v != null);
    if (real.length < 2) return `<p class="none">Not enough weeks of data yet to show a trend.</p>`;

    const xAt = i => padL + (i / Math.max(points.length - 1, 1)) * plotW;
    const yAt = v => padT + plotH - (v / 100) * plotH;

    const grid = [0, 50, 100].map(v => `
      <line x1="${padL}" y1="${yAt(v)}" x2="${w-6}" y2="${yAt(v)}" stroke="#D8D4CB" stroke-width="1"/>
      <text x="${padL-6}" y="${yAt(v)+3.5}" text-anchor="end" font-size="9" fill="#5B6068"
        font-family="monospace">${v}%</text>`).join('');

    let d = '', started = false;
    points.forEach((p, i) => {
      if (p.v == null){ started = false; return; }
      d += (started ? ' L' : ' M') + xAt(i).toFixed(1) + ' ' + yAt(p.v).toFixed(1);
      started = true;
    });

    const dots = points.map((p, i) => p.v == null ? '' :
      `<g><title>${esc(p.label)}: ${p.v}% passed</title>
        <circle cx="${xAt(i).toFixed(1)}" cy="${yAt(p.v).toFixed(1)}" r="4"
          fill="${colour}" stroke="#FBFAF7" stroke-width="2"/></g>`).join('');

    const labels = points.map((p, i) => (i % 2 === 0)
      ? `<text x="${xAt(i).toFixed(1)}" y="${h-8}" text-anchor="middle" font-size="9"
           fill="#5B6068" font-family="monospace">${esc(p.label)}</text>` : '').join('');

    return `<svg viewBox="0 0 ${w} ${h}" class="chart" role="img"
      aria-label="${esc(opts.alt || 'Pass rate by week')}">${grid}
      <path d="${d}" fill="none" stroke="${colour}" stroke-width="2.4"
        stroke-linejoin="round" stroke-linecap="round"/>${dots}${labels}
      <line x1="${padL}" y1="${padT+plotH}" x2="${w-6}" y2="${padT+plotH}" stroke="#14171A" stroke-width="1.2"/>
    </svg>`;
  }

  function hBars(rows, opts){
    const { colour = '#C8102E', unit = '' } = opts || {};
    if (!rows.length) return `<p class="none">Nothing to show.</p>`;
    const top = Math.max(...rows.map(r => r.n));
    return `<div class="hbars">${rows.map(r => `
      <div class="hbar">
        <div class="hlab">${esc(r.label)}</div>
        <div class="hval">${r.n}${unit}</div>
        <div class="htrack"><i style="width:${Math.max((r.n/top)*100, 3)}%;background:${colour}"></i></div>
      </div>`).join('')}</div>`;
  }

  function donut(parts, centre, caption){
    const total = parts.reduce((n,p) => n + p.n, 0) || 1;
    const R = 52, C = 2 * Math.PI * R, GAP = 2;
    let at = 0;
    const arcs = parts.filter(p => p.n > 0).map(p => {
      const len = (p.n / total) * C, on = Math.max(len - GAP, 0.6);
      const s = `<g><title>${esc(p.label)}: ${p.n} of ${total}</title>
        <circle cx="70" cy="70" r="${R}" fill="none" stroke="${p.colour}" stroke-width="17"
          stroke-dasharray="${on} ${C-on}" stroke-dashoffset="${-at}" transform="rotate(-90 70 70)"/></g>`;
      at += len;
      return s;
    }).join('');
    return `<div class="donutbox">
      <svg viewBox="0 0 140 140" class="donut" role="img" aria-label="${esc(caption)}">
        <circle cx="70" cy="70" r="${R}" fill="none" stroke="#E4E1DA" stroke-width="17"/>
        ${arcs}
        <text x="70" y="68" text-anchor="middle" dominant-baseline="middle"
          font-family="monospace" font-size="28" font-weight="700" fill="#14171A">${centre}</text>
        <text x="70" y="88" text-anchor="middle" font-family="monospace" font-size="8"
          letter-spacing="1.4" fill="#5B6068">${esc(caption)}</text>
      </svg>
      <div class="dkey">${parts.map(p => `<div>
        <i style="background:${p.colour}"></i><span>${esc(p.label)}</span><b>${p.n}</b></div>`).join('')}</div>
    </div>`;
  }

  /* ---- the document ------------------------------------------------------ */
  function html(d){
    const t = d.totals;
    const scope = d.client || 'All clients';
    const weekLabel = b => shortDate(b.from);

    const stat = (n, label, sub, tone) => `
      <div class="stat ${tone || ''}"><b>${n}</b><span>${esc(label)}</span>
        ${sub ? `<small>${esc(sub)}</small>` : ''}</div>`;

    const passPoints = d.weeks.map(b => ({
      label: weekLabel(b),
      v: b.checked >= 5 ? Math.round(b.pass / b.checked * 100) : null,
    }));

    const siteRows = d.sites.map(s => `
      <tr>
        <td class="ref">${esc(s.p.ref || '')}</td>
        <td><b>${esc(s.p.name)}</b><small>${esc(s.p.address || '')}</small></td>
        <td class="num">${s.records}</td>
        <td class="num ${s.fails ? 'bad' : ''}">${s.fails}</td>
        <td>${s.lastF02 ? ukDate(s.lastF02) : '<span class="muted">never</span>'}</td>
        <td><span class="tag" style="background:${s.grade.colour}">${esc(s.grade.label)}</span></td>
      </tr>`).join('');

    const incidentRows = d.incidents.length ? d.incidents.map(i => `
      <tr>
        <td>${ukDate(i.at)}</td>
        <td>${esc(i.site)}</td>
        <td>${esc(i.kind || '—')}</td>
        <td>${esc(i.what || '—')}</td>
        <td>${esc(i.treatment || '—')}</td>
        <td>${i.riddor && i.riddor !== 'No'
              ? `<span class="tag" style="background:#C8102E">${esc(i.riddor)}</span>`
              : '<span class="muted">Not reportable</span>'}</td>
      </tr>`).join('')
      : `<tr><td colspan="6" class="none">No accidents or incidents recorded in this period.</td></tr>`;

    return `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>WRM Health &amp; Safety Report — ${esc(scope)}</title>
<style>
  :root{
    --ink:#14171A; --soft:#5B6068; --line:#C9C6BE; --paper:#FBFAF7; --bg:#E7E5DF;
    --hivis:#FFD400; --go:#007A33; --stop:#C8102E; --warn:#E07B00; --duty:#0057B8;
    --sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
    --mono:ui-monospace,"SF Mono",Menlo,Consolas,"Roboto Mono",monospace;
    color-scheme:light;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);
    font-size:15px;line-height:1.5}
  .sheet{max-width:1180px;margin:0 auto;background:var(--paper);
    box-shadow:0 2px 20px rgba(0,0,0,.09)}

  header{background:var(--ink);color:#fff;padding:26px 32px 22px}
  header .kick{font-family:var(--mono);font-size:10px;letter-spacing:.28em;
    text-transform:uppercase;color:var(--hivis);margin:0 0 9px}
  header h1{margin:0;font-size:26px;line-height:1.2;letter-spacing:-.01em}
  header .meta{margin:12px 0 0;font-size:13px;color:#B9BDC2;line-height:1.6}
  header .meta b{color:#fff;font-weight:600}
  header .brand{float:right;text-align:right;font-weight:800;letter-spacing:.18em;
    font-size:15px;color:var(--hivis)}
  header .brand small{display:block;font-size:9px;letter-spacing:.2em;color:#8D939A;
    font-weight:700;margin-top:3px}
  .tape{height:9px;background:repeating-linear-gradient(-45deg,
    var(--hivis) 0 13px,var(--ink) 13px 26px)}

  main{padding:28px 32px 40px}
  section{margin-bottom:34px}
  h2{font-size:12px;font-weight:800;letter-spacing:.17em;text-transform:uppercase;
    color:var(--soft);margin:0 0 4px;display:flex;align-items:center;gap:10px}
  h2::after{content:"";flex:1;height:2px;background:var(--line)}
  .lede{margin:0 0 16px;font-size:13.5px;color:var(--soft);max-width:62ch;line-height:1.55}

  .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(118px,1fr));gap:10px}
  .stat{border:1px solid var(--line);border-top:4px solid var(--soft);
    border-radius:3px;padding:12px 13px;background:#fff}
  .stat b{display:block;font-family:var(--mono);font-size:27px;font-weight:700;line-height:1;
    font-variant-numeric:tabular-nums;letter-spacing:-.02em}
  .stat span{display:block;font-size:12px;font-weight:700;margin-top:7px;line-height:1.25}
  .stat small{display:block;font-size:11px;color:var(--soft);margin-top:2px;line-height:1.3}
  .stat.bad{border-top-color:var(--stop)} .stat.bad b{color:var(--stop)}
  .stat.warn{border-top-color:var(--warn)} .stat.warn b{color:var(--warn)}
  .stat.good{border-top-color:var(--go)} .stat.good b{color:var(--go)}

  .chart{width:100%;height:auto;display:block;margin:4px 0 2px}
  .cap{font-size:11.5px;color:var(--soft);margin:2px 0 0}

  .two{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start}
  @media (max-width:680px){ .two{grid-template-columns:1fr} }

  .donutbox{display:flex;gap:20px;align-items:center;flex-wrap:wrap}
  .donut{width:140px;height:140px;flex:0 0 140px}
  .dkey{flex:1;min-width:140px;display:flex;flex-direction:column;gap:6px}
  .dkey div{display:flex;align-items:center;gap:9px;font-size:13px}
  .dkey i{width:11px;height:11px;border-radius:2px;flex:0 0 11px}
  .dkey span{flex:1}
  .dkey b{font-family:var(--mono);font-variant-numeric:tabular-nums}

  .hbars{display:flex;flex-direction:column;gap:12px}
  .hbar{display:grid;grid-template-columns:1fr auto;gap:3px 12px}
  .hlab{font-size:13px;line-height:1.35}
  .hval{font-family:var(--mono);font-weight:700;font-size:13px;font-variant-numeric:tabular-nums}
  .htrack{grid-column:1 / -1;height:9px;background:#E4E1DA;border-radius:5px;overflow:hidden}
  .htrack i{display:block;height:100%;border-radius:5px}

  table{width:100%;border-collapse:collapse;font-size:13px}
  th{text-align:left;font-size:10px;letter-spacing:.11em;text-transform:uppercase;
    color:var(--soft);font-weight:800;padding:0 8px 7px;border-bottom:2px solid var(--ink)}
  td{padding:9px 8px;border-bottom:1px solid var(--line);vertical-align:top}
  tbody tr:nth-child(even){background:#F4F2EC}
  td b{display:block;font-weight:700}
  td small{display:block;color:var(--soft);font-size:11.5px;margin-top:1px}
  td.num{text-align:right;font-family:var(--mono);font-variant-numeric:tabular-nums}
  td.num.bad{color:var(--stop);font-weight:700}
  td.ref{font-family:var(--mono);font-size:11px;color:var(--soft);white-space:nowrap}
  .muted{color:var(--soft)}
  .tag{display:inline-block;font-family:var(--mono);font-size:10px;font-weight:700;
    letter-spacing:.07em;text-transform:uppercase;color:#fff;padding:3px 7px;border-radius:2px}
  .none{color:var(--soft);font-size:13px;padding:14px 0;font-style:normal}
  .tablewrap{overflow-x:auto}

  footer{border-top:2px solid var(--ink);margin:0 32px;padding:16px 0 30px;
    font-size:11.5px;color:var(--soft);line-height:1.6}
  footer b{color:var(--ink)}

  /* Tabs. The panels are all visible in the markup and the script hides the
     inactive ones once it runs, so with no scripting the report is simply
     the long version rather than a page of empty boxes. Printing shows
     everything for the same reason: a PDF with five tabs missing is not a
     report. */
  .tabs{display:flex;flex-wrap:wrap;gap:2px;background:var(--ink);padding:0 32px}
  .tabs button{appearance:none;border:0;background:none;font:inherit;cursor:pointer;
    color:#B9BDC2;padding:12px 15px 11px;font-size:12.5px;font-weight:700;
    letter-spacing:.03em;border-bottom:3px solid transparent;white-space:nowrap}
  .tabs button:hover{color:#fff}
  .tabs button[aria-selected="true"]{color:var(--hivis);border-bottom-color:var(--hivis)}
  .tabs button:focus-visible{outline:2px solid var(--hivis);outline-offset:-2px}
  .tabs .n{font-family:var(--mono);font-size:10.5px;color:#6E7681;margin-left:6px;
    font-variant-numeric:tabular-nums}
  .tabs button[aria-selected="true"] .n{color:var(--ink);background:var(--hivis);
    padding:1px 5px;border-radius:2px}
  @media (max-width:620px){ .tabs{padding:0 16px} .tabs button{padding:10px 11px;font-size:12px} }

  /* Print: the browser's own Save as PDF is how this becomes a PDF, so it
     has to break in sensible places and not waste ink on backgrounds. */
  @media print{
    body{background:#fff;font-size:11pt}
    .sheet{box-shadow:none;max-width:none}
    header{padding:18px 0 14px}
    main{padding:16px 0 0}
    section{break-inside:avoid;margin-bottom:22px}
    table{break-inside:auto}
    tr{break-inside:avoid}
    thead{display:table-header-group}
    .pagebreak{break-before:page}
    .tabs{display:none}
    .panel{display:block !important}
    .panel + .panel{break-before:page}
    @page{margin:14mm}
  }
</style></head>
<body><div class="sheet">

<header>
  <div class="brand">WRM<small>SITECHECK</small></div>
  <p class="kick">Health &amp; Safety Report</p>
  <h1>${esc(scope)}</h1>
  <p class="meta">
    <b>${t.sites}</b> site${t.sites === 1 ? '' : 's'} &middot;
    <b>${t.records}</b> signed record${t.records === 1 ? '' : 's'} &middot;
    the ${d.weeks.length} weeks to ${ukDate(d.now)}<br>
    Generated ${ukDate(d.now)} from SiteCheck. Every figure is counted from
    records signed on site.
  </p>
</header>
<div class="tape"></div>

<nav class="tabs" role="tablist" aria-label="Report sections">
  <button role="tab" aria-selected="true"  data-panel="overview">Overview</button>
  <button role="tab" aria-selected="false" data-panel="failing">What keeps failing<span class="n">${d.topFails.length}</span></button>
  <button role="tab" aria-selected="false" data-panel="activity">Activity</button>
  <button role="tab" aria-selected="false" data-panel="sites">Sites<span class="n">${t.sites}</span></button>
  <button role="tab" aria-selected="false" data-panel="incidents">Incidents<span class="n">${t.incidents}</span></button>
  ${d.topics.length ? `<button role="tab" aria-selected="false" data-panel="talks">Toolbox talks<span class="n">${t.talks}</span></button>` : ''}
</nav>

<main>

<div class="panel" id="panel-overview">
<section>
  <h2>At a glance</h2>
  <div class="stats">
    ${stat(t.overdue, 'Inspections overdue', 'No weekly check in 7 days', t.overdue ? 'bad' : 'good')}
    ${stat(t.fails, 'Items marked fail', 'Across all records', t.fails ? 'warn' : 'good')}
    ${stat(t.incidents, 'Accidents & incidents', 'Reported in this period', t.incidents ? 'warn' : 'good')}
    ${stat(d.passRate == null ? '—' : d.passRate + '%', 'Inspection pass rate', 'Of every item checked', d.passRate >= 90 ? 'good' : d.passRate >= 75 ? 'warn' : 'bad')}
    ${stat(t.inductions, 'People inducted', 'Signed induction records')}
    ${stat(t.talks, 'Toolbox talks', `${d.attendances} attendance${d.attendances === 1 ? '' : 's'} recorded`)}
  </div>
</section>

<section>
  <h2>Is it getting better?</h2>
  <p class="lede">The proportion of every checked item that passed, week by week.
    Weeks with fewer than five items checked are left out rather than shown as a
    spike on a handful of answers.</p>
  ${lineChart(passPoints, { alt:'Inspection pass rate by week' })}
  <p class="cap">Pass rate across all checklists &middot; ${d.checksPassed + d.checksFailed} items checked in total</p>
</section>
</div>

<div class="panel" id="panel-failing">
<section>
  <h2>What keeps failing</h2>
  <p class="lede">The questions marked fail most often across every site. One site
    failing something once is a job; the same question failing everywhere is usually
    a training or procurement problem, and that is what this list is for.</p>
  ${hBars(d.topFails.map(f => ({ label:`${f.text}  (${f.form})`, n:f.n })), { colour:'#C8102E', unit:'' })}
</section>
</div>

<div class="panel" id="panel-activity">
<section>
  <h2>Activity</h2>
  <div class="two">
    <div>
      ${columnChart(d.weeks.map(b => ({ label:weekLabel(b), v:b.signed })),
        { colour:'#0057B8', alt:'Records signed each week' })}
      <p class="cap">Records signed each week</p>
    </div>
    <div>
      ${columnChart(d.weeks.map(b => ({ label:weekLabel(b), v:b.fails })),
        { colour:'#E07B00', alt:'Items marked fail each week' })}
      <p class="cap">Items marked fail each week</p>
    </div>
  </div>
</section>
</div>

<div class="panel" id="panel-sites">
<section>
  <h2>Where every site stands</h2>
  <div class="two">
    <div>
      ${donut([
        { label:'Current — inspected within 5 days', n:t.current, colour:'#007A33' },
        { label:'Due this week',                     n:t.due,     colour:'#E07B00' },
        { label:'Overdue — past 7 days',             n:t.overdue, colour:'#C8102E' },
      ], t.sites, 'SITES')}
    </div>
    <div>
      <p class="lede" style="margin:0">A site is current when its weekly safety
        inspection was signed within the last five days, due at six or seven, and
        overdue past that. A site with no inspection on record at all is counted
        overdue.</p>
    </div>
  </div>
  <div class="tablewrap" style="margin-top:18px">
  <table>
    <thead><tr><th>Ref</th><th>Site</th><th style="text-align:right">Records</th>
      <th style="text-align:right">Fails</th><th>Last inspection</th><th>Status</th></tr></thead>
    <tbody>${siteRows}</tbody>
  </table></div>
</section>
</div>

<div class="panel" id="panel-incidents">
<section>
  <h2>Accidents and incidents</h2>
  <p class="lede">Everything reported through SiteCheck in this period, with its
    RIDDOR position as recorded at the time. RIDDOR status is what the reporter
    entered and should be confirmed by a competent person before it is relied on.</p>
  <div class="tablewrap">
  <table>
    <thead><tr><th>Date</th><th>Site</th><th>Type</th><th>What happened</th>
      <th>Treatment</th><th>RIDDOR</th></tr></thead>
    <tbody>${incidentRows}</tbody>
  </table></div>
</section>
</div>

${d.topics.length ? `
<div class="panel" id="panel-talks">
<section>
  <h2>Toolbox talks delivered</h2>
  <p class="lede">Topics covered across the period, most delivered first.
    ${d.attendances} attendance${d.attendances === 1 ? '' : 's'} recorded in total.</p>
  ${hBars(d.topics.slice(0,12).map(x => ({ label:x.topic, n:x.n })),
    { colour:'#0B7285', unit:'' })}
</section>
</div>` : ''}

</main>

<script>
/* The only script in the file, and the report reads perfectly without it:
   every panel is in the markup and visible until this runs. */
(function(){
  var tabs   = [].slice.call(document.querySelectorAll('.tabs button'));
  var panels = [].slice.call(document.querySelectorAll('.panel'));
  function show(name){
    panels.forEach(function(p){ p.style.display = (p.id === 'panel-' + name) ? '' : 'none'; });
    tabs.forEach(function(t){ t.setAttribute('aria-selected', String(t.dataset.panel === name)); });
    window.scrollTo(0, 0);
  }
  tabs.forEach(function(t){
    t.addEventListener('click', function(){ show(t.dataset.panel); });
    t.addEventListener('keydown', function(e){
      var i = tabs.indexOf(t), n = null;
      if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft')  n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (n){ e.preventDefault(); n.focus(); show(n.dataset.panel); }
    });
  });
  show('overview');
  // Printing has to show the lot, so put every panel back first and restore
  // the chosen tab afterwards.
  window.addEventListener('beforeprint', function(){
    panels.forEach(function(p){ p.style.display = ''; });
  });
  window.addEventListener('afterprint', function(){
    var on = tabs.filter(function(t){ return t.getAttribute('aria-selected') === 'true'; })[0];
    if (on) show(on.dataset.panel);
  });
})();
</script>

<footer>
  <b>Where these figures come from.</b> Every number is counted from records
  signed in SiteCheck and synced from site. A signed record cannot be altered
  afterwards, so the figures above and the records behind them cannot disagree.
  Inspection figures read the Weekly Site Safety Inspection; items marked fail
  read the failed answers on every form; people inducted reads the Site
  Induction Record, including gate QR scans.<br><br>
  <b>Report produced ${ukDate(d.now)}</b> &middot; WRM &middot; Workplace Risk
  Management Ltd &middot; SiteCheck
</footer>

</div></body></html>`;
  }

  function build(opts){ return html(analyse(opts)); }

  function download(opts){
    const doc = build(opts);
    const name = `WRM Health and Safety Report ${(opts.client || 'All clients')
      .replace(/[\\\/:*?"<>|]/g,'')} ${new Date().toISOString().slice(0,10)}.html`;
    const blob = new Blob([doc], { type:'text/html;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    return name;
  }

  return { analyse, build, download };
})();
