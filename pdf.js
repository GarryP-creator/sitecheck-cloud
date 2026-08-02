/* ============================================================================
   SiteCheck — PDF generation
   Turns any completed record into a proper A4 document: checklists, risk
   assessments and hazard reports alike. Runs entirely on the device, so it
   works with no signal. Nothing here talks to a server.

   Risk assessments print landscape because their hazard table needs the width.
   ========================================================================== */

const PDF = (() => {

  /* --- house style, matching the app ------------------------------------ */
  const INK   = [20, 23, 26];
  const GREY  = [91, 96, 104];
  const LINE  = [201, 198, 190];
  const HIVIS = [255, 212, 0];
  const GO    = [0, 122, 51];
  const STOP  = [200, 16, 46];
  const WARN  = [224, 123, 0];
  const FAINT = [246, 245, 242];
  const REDBG = [252, 235, 238];
  const GRNBG = [235, 245, 238];

  const MM = pt => pt * 0.3528;          // points to millimetres
  const LH = pt => MM(pt) * 1.24;        // one line of text

  let LOGO = null;                       // set by init()

  /* --- a tiny layout engine --------------------------------------------- */
  class Sheet {
    constructor(doc, rec, form, landscape){
      this.d = doc; this.rec = rec; this.form = form;
      this.W = landscape ? 297 : 210;
      this.H = landscape ? 210 : 297;
      this.M = 14;
      this.CW = this.W - this.M * 2;
      this.bottom = this.H - 18;
      this.y = 0;
    }
    /* space check — start a new page if the next block won't fit */
    need(h){
      if (this.y + h > this.bottom){ this.page(); return true; }
      return false;
    }
    page(){
      this.d.addPage(undefined, this.W > this.H ? 'landscape' : 'portrait');
      this.contHeader();
    }
    rule(w = 0.5, col = LINE, gapAfter = 3){
      this.d.setDrawColor(...col); this.d.setLineWidth(w);
      this.d.line(this.M, this.y, this.M + this.CW, this.y);
      this.y += gapAfter;
    }
    txt(s, x, opts = {}){
      const { size = 9, style = 'normal', col = INK, align = 'left', spacing = 0, maxW } = opts;
      this.d.setFont('helvetica', style);
      this.d.setFontSize(size);
      this.d.setTextColor(...col);
      this.d.setCharSpace(spacing);
      this.d.text(String(s), x, this.y, { align, maxWidth: maxW });
      this.d.setCharSpace(0);
    }
    wrap(s, w, size = 9, style = 'normal'){
      this.d.setFont('helvetica', style); this.d.setFontSize(size);
      return this.d.splitTextToSize(String(s || ''), w);
    }

    /* --- hazard tape, drawn as 45deg parallelograms ------------------- */
    tape(y, h){
      const d = this.d;
      d.setFillColor(...HIVIS); d.rect(0, y, this.W, h, 'F');
      d.setFillColor(...INK);
      const w = h * 0.95;
      for (let xx = -h; xx < this.W + h; xx += w * 2){
        d.lines([[h, -h], [w, 0], [-h, h]], xx, y + h, [1, 1], 'F', true);
      }
    }

    /* --- first page masthead: the app header, on paper ------------------ */
    masthead(){
      const d = this.d, r = this.rec, f = this.form;
      const BH = 19;
      d.setFillColor(...INK); d.rect(0, 0, this.W, BH, 'F');

      if (LOGO){
        d.setFillColor(...HIVIS);
        d.roundedRect(this.M, 4, 11, 11, 2, 2, 'F');
        try { d.addImage(LOGO, 'PNG', this.M, 4, 11, 11); } catch(e){}
      }
      this.y = 9.8;
      this.txt('SITECHECK', this.M + 15, { size:11, style:'bold', col:[255,255,255], spacing:0.95 });
      this.y = 14.4;
      this.txt('CDM 2015 SITE RECORD', this.M + 15, { size:6, col:HIVIS, spacing:0.55 });
      this.y = 12.6;
      this.txt('WRM', this.M + this.CW, { size:15, style:'bold', col:HIVIS, align:'right', spacing:1.0 });

      this.tape(BH, 3.2);

      this.y = BH + 3.2 + 9.5;
      this.txt(r.title || f.title, this.M, { size:15, style:'bold' });
      const sv = this.y;
      this.y -= 0.4;
      this.txt(r.ref, this.M + this.CW, { size:7.5, align:'right', col:GREY });
      this.y = sv + 4.5;
      this.txt(f.sub || `FORM ${f.code}`, this.M, { size:7, col:GREY, spacing:0.5 });
      this.y -= 0.3;
      this.txt(fmt(r.at), this.M + this.CW, { size:7.5, align:'right', col:GREY });
      this.y = sv + 8;
      this.rule(0.7, INK, 6);
    }

    /* --- slim banded header on continuation pages ----------------------- */
    contHeader(){
      const d = this.d;
      const BH = 11;
      d.setFillColor(...INK); d.rect(0, 0, this.W, BH, 'F');
      if (LOGO){
        d.setFillColor(...HIVIS);
        d.roundedRect(this.M, 2.6, 6, 6, 1.2, 1.2, 'F');
        try { d.addImage(LOGO, 'PNG', this.M, 2.6, 6, 6); } catch(e){}
      }
      this.y = 7.3;
      this.txt('SITECHECK', this.M + 9, { size:7, style:'bold', col:[255,255,255], spacing:0.6 });
      this.txt(this.rec.ref, this.M + this.CW, { size:7, col:HIVIS, align:'right' });
      this.tape(BH, 2);

      this.y = BH + 2 + 7.5;
      this.txt(this.rec.title || this.form.title, this.M, { size:8.5, style:'bold' });
      this.y += 2.5;
      this.rule(0.5, LINE, 6);
    }

    /* --- project / completion details ----------------------------------- */
    details(){
      const r = this.rec;
      const pairs = [
        ['Project', r.site.name], ['Reference', r.site.ref],
        ['Site address', r.site.address], ['Client', r.site.client],
        ['Completed by', r.by], ['Date & time', fmt(r.at)],
      ];
      const colW = this.CW / 2 - 4;
      for (let i = 0; i < pairs.length; i += 2){
        this.need(10);
        const top = this.y;
        for (let c = 0; c < 2; c++){
          const p = pairs[i + c]; if (!p) continue;
          const x = this.M + c * (colW + 8);
          this.y = top;
          this.txt(p[0].toUpperCase(), x, { size: 6.2, col: GREY, spacing: 0.35 });
          this.y += 3.8;
          const lines = this.wrap(p[1] || '—', colW, 9);
          lines.slice(0, 2).forEach(l => { this.txt(l, x, { size: 9 }); this.y += LH(9); });
        }
        this.y = Math.max(this.y, top + 8.5);
        this.d.setDrawColor(...LINE); this.d.setLineWidth(0.2);
        this.d.line(this.M, this.y - 1.5, this.M + this.CW, this.y - 1.5);
        this.y += 2.5;
      }
      this.y += 2;
    }

    /* --- pass/fail summary ---------------------------------------------- */
    verdict(){
      const n = this.rec.fails;
      if (this.countChecks() === 0) return;          // nothing scored, skip
      const bad = n > 0;
      const h = 9;
      this.need(h + 4);
      this.d.setFillColor(...(bad ? REDBG : GRNBG));
      this.d.rect(this.M, this.y, this.CW, h, 'F');
      this.d.setFillColor(...(bad ? STOP : GO));
      this.d.rect(this.M, this.y, 1.8, h, 'F');
      this.y += 5.8;
      this.txt(bad ? `${n} ITEM${n > 1 ? 'S' : ''} MARKED FAIL — ACTION REQUIRED`
                   : 'NO FAILED ITEMS',
               this.M + 5, { size: 8, style: 'bold', col: bad ? STOP : GO, spacing: 0.4 });
      this.y += h - 5.8 + 5;
    }
    countChecks(){
      let n = 0;
      this.form.sections.forEach(s => s.items.forEach(i => { if (i.type === 'check') n++; }));
      return n;
    }

    /* --- section heading ------------------------------------------------- */
    section(title, keepWith = 0){
      this.need(Math.min(14 + keepWith, 190));
      this.y += 2;
      this.txt(title.toUpperCase(), this.M, { size: 7.6, style: 'bold', spacing: 0.55 });
      this.y += 2.4;
      this.rule(0.6, INK, 4);
    }

    /* --- one question row ------------------------------------------------ */
    row(item, ans, shade){
      const statusW = 24;
      const qW = this.CW - statusW - 6;
      const isCheck = item.type === 'check';
      const lines = this.wrap(item.text, qW, 9);
      const note = isCheck && ans.note ? this.wrap(ans.note, qW - 3, 7.6, 'italic') : [];

      let valLines = [];
      if (item.type === 'file'){
        const f = ans.file;
        valLines = this.wrap(f ? `Attached: ${f.name}` : 'No file attached', qW - 3, 9, 'bold');
      } else if (!isCheck && item.type !== 'photo' && item.type !== 'risk'){
        valLines = this.wrap(ans.v || '—', qW - 3, 9, 'bold');
      }
      const h = Math.max(7.5,
        lines.length * LH(9) + note.length * LH(7.6) + valLines.length * LH(9) + 3.4);
      this.need(h);

      if (shade){ this.d.setFillColor(...FAINT); this.d.rect(this.M, this.y - 3.4, this.CW, h, 'F'); }

      // fail rows get a red edge so they're findable at a glance
      if (isCheck && ans.v === 'fail'){
        this.d.setFillColor(...STOP); this.d.rect(this.M, this.y - 3.4, 1.4, h, 'F');
      }

      const top = this.y;
      const x = this.M + 3.5;
      lines.forEach(l => { this.txt(l, x, { size: 9 }); this.y += LH(9); });
      note.forEach(l => { this.txt(l, x + 2, { size: 7.6, style: 'italic', col: GREY }); this.y += LH(7.6); });
      valLines.forEach(l => { this.txt(l, x + 2, { size: 9, style: 'bold' }); this.y += LH(9); });

      // right-hand status
      const rx = this.M + this.CW - 3;
      const sy = this.y; this.y = top;
      if (isCheck){
        const m = { pass: ['PASS', GO], fail: ['FAIL', STOP], na: ['N/A', GREY] }[ans.v] || ['—', GREY];
        this.txt(m[0], rx, { size: 8.5, style: 'bold', align: 'right', col: m[1], spacing: 0.3 });
      } else if (item.type === 'risk'){
        const v = ans.v || {}; const b = band(v.score || 1);
        this.txt(`${b.l} ${v.score || 1}`, rx, { size: 8.5, style: 'bold', align: 'right', col: b.c });
      } else if (item.type === 'photo'){
        const n = (ans.photos || []).length;
        this.txt(n ? `${n} PHOTO${n > 1 ? 'S' : ''}` : '—', rx, { size: 7.5, align: 'right', col: GREY });
      }
      this.y = Math.max(sy, top + 4) + 3.4;
    }

    /* --- height of one table row, used for layout decisions ------------- */
    rowHeight(item, r, w){
      const hasSig = item.columns.some(c => c.type === 'sign');
      const lens = item.columns.map((c, i) =>
        (c.type === 'risk' || c.type === 'sign') ? 1 : this.wrap(r[c.id] || '—', w[i] - 4, 8).length);
      return Math.max(hasSig ? 15 : 7, Math.max(...lens) * LH(8) + 3);
    }
    /* whole table, including its header */
    tableHeight(item, rows){
      const w = ratios(item.columns, this.CW);
      return 11 + (rows || []).reduce((n, r) => n + this.rowHeight(item, r, w), 0);
    }

    /* --- the risk assessment grid --------------------------------------
       Activity | Hazard | Effects | Persons | Lk Sv R | Controls | Lk Sv R |
       Action. Scores are shown in their own narrow columns, coloured by
       band, the way a printed assessment is normally read.              */
    raGrid(item, rows){
      const d = this.d;
      const N = 8;                                    // narrow score column
      const wide = this.CW - (N * 6);
      const share = [0.135, 0.155, 0.125, 0.125, 0.235, 0.225];
      const w = [];
      share.forEach((f, i) => {
        w.push(wide * f);
        if (i === 3){ w.push(N, N, N); }               // initial Lk Sv R
        if (i === 4){ w.push(N, N, N); }               // residual Lk Sv R
      });
      // order: activity, hazard, effects, persons, Lk,Sv,R, controls, Lk,Sv,R, action
      const cols = w;
      const HEAD_H = 11;

      const drawHead = () => {
        const top = this.y - 3.6;
        d.setFillColor(...INK);
        d.rect(this.M, top, this.CW, HEAD_H, 'F');
        d.setDrawColor(255,255,255); d.setLineWidth(0.2);

        const titles = [
          ['Activity',1],['Hazard',1],['Effects of hazard',1],['Persons affected',1],
          ['Initial risk',3],['Control measures',1],['Residual risk',3],['Action / comments',1]
        ];
        let x = this.M, ci = 0;
        titles.forEach(([t, span]) => {
          const cw = cols.slice(ci, ci + span).reduce((a,b)=>a+b, 0);
          const lines = this.wrap(t.toUpperCase(), cw - 3, 5.6, 'bold');
          this.y = top + (span === 3 ? 3.4 : (lines.length > 1 ? 3.6 : 5.2));
          lines.slice(0,2).forEach(l => {
            this.txt(l, x + cw/2, { size:5.6, style:'bold', col:[255,255,255], align:'center', spacing:0.25 });
            this.y += 2.6;
          });
          if (span === 3){
            this.y = top + 9.2;
            ['Lk','Sv','R'].forEach((sub, k) => {
              this.txt(sub, x + cols.slice(ci, ci+k).reduce((a,b)=>a+b,0) + cols[ci+k]/2,
                       { size:5.4, style:'bold', col:HIVIS, align:'center' });
            });
          }
          x += cw; ci += span;
        });
        this.y = top + HEAD_H + 3.6;
      };

      // measure every row first, so the header is never left stranded at the
      // foot of a page with its table starting on the next one
      const metrics = (rows || []).map(r => {
        const texts = [r.a, r.h, r.e, r.p, null, null, null, r.c, null, null, null, r.ac];
        const wrapped = texts.map((t, i) => t == null ? null : this.wrap(t || '', cols[i] - 3, 7));
        const h = Math.max(9, Math.max(...wrapped.filter(Boolean).map(l => l.length)) * LH(7) + 3.4);
        return { wrapped, h };
      });

      this.need(HEAD_H + (metrics[0] ? metrics[0].h : 12) + 5);
      drawHead();

      (rows || []).forEach((r, n) => {
        const ri = r.ri || {}, rr = r.rr || {};
        const { wrapped, h } = metrics[n];

        if (this.need(h)) drawHead();

        const top = this.y - 3.4;
        if (n % 2){ d.setFillColor(...FAINT); d.rect(this.M, top, this.CW, h, 'F'); }

        // cell borders
        d.setDrawColor(...LINE); d.setLineWidth(0.15);
        d.rect(this.M, top, this.CW, h);
        let bx = this.M;
        cols.slice(0, -1).forEach(cw => { bx += cw; d.line(bx, top, bx, top + h); });

        let x = this.M;
        wrapped.forEach((lines, i) => {
          this.y = top + 4.4;
          if (lines){
            lines.forEach(l => { this.txt(l, x + 1.5, { size:7 }); this.y += LH(7); });
          } else {
            // one of the six score cells
            const isResid = i > 7;
            const v = isResid ? rr : ri;
            const k = (i - (isResid ? 8 : 4));
            const val = k === 0 ? (v.l || 1) : k === 1 ? (v.s || 1) : (v.score || 1);
            const b = band(v.score || 1);

            if (k === 2){
              // the risk score: fill the whole cell with the band colour, so
              // a page of assessments can be read at arm's length
              d.setFillColor(...b.c);
              d.rect(x, top, cols[i], h, 'F');
              d.setDrawColor(...LINE); d.setLineWidth(0.15);
              d.rect(x, top, cols[i], h);
            }
            this.y = top + h/2 + 1.2;
            this.txt(String(val), x + cols[i]/2,
              { size: k === 2 ? 8.4 : 7, style:'bold', align:'center',
                col: k === 2 ? (b.l === 'MEDIUM' ? INK : [255,255,255]) : INK });
          }
          x += cols[i];
        });
        this.y = top + h + 3.4;
      });

      // how to read the scores
      this.y += 3;
      this.need(8);
      this.txt('To evaluate risk:  Likelihood (Lk) x Severity (Sv) = Risk (R).   High 11-25,   Medium 6-10,   Low 1-5.',
               this.M + this.CW/2, { size:6.8, style:'bold', align:'center', col:GREY });
      this.y += 6;
    }

    /* --- review log, printed blank for signing off later ---------------- */
    reviewLog(rows = 5){
      this.need(14 + rows * 9);
      this.y += 4;
      this.txt('Review the assessment at regular intervals, or whenever there is reason to believe it is no longer valid.',
               this.M, { size:7.4, style:'italic', col:GREY });
      this.y += 6;
      this.grid(['Reviewed by', 'Review comments', 'Date of review'], rows, 9, [0.22, 0.58, 0.20]);
    }

    /* --- repeating table: hazards, attendees, witnesses ------------------ */
    hazards(item, rows){
      const heads = item.columns.map(c => c.label);
      const w = ratios(item.columns, this.CW);
      this.need(22);

      const drawHead = () => {
        this.d.setFillColor(...INK);
        this.d.rect(this.M, this.y - 3.6, this.CW, 7, 'F');
        let x = this.M + 2;
        heads.forEach((hd, i) => {
          this.txt(hd.toUpperCase(), x, { size: 6.4, style: 'bold', col: [255,255,255], spacing: 0.3 });
          x += w[i];
        });
        this.y += 8.2;          // clear of the header bar, not under it
      };
      drawHead();

      (rows || []).forEach((r, n) => {
        const cells = item.columns.map((c, i) => {
          if (c.type === 'risk' || c.type === 'sign') return null;
          return this.wrap(r[c.id] || '—', w[i] - 4, 8);
        });
        const hasSig = item.columns.some(c => c.type === 'sign');
        const h = Math.max(hasSig ? 15 : 7,
                           Math.max(...cells.map(c => c ? c.length : 1)) * LH(8) + 3);
        if (this.need(h)) drawHead();

        if (n % 2) { this.d.setFillColor(...FAINT); this.d.rect(this.M, this.y - 3.4, this.CW, h, 'F'); }
        this.d.setDrawColor(...LINE); this.d.setLineWidth(0.15);
        this.d.line(this.M, this.y - 3.4, this.M + this.CW, this.y - 3.4);

        const top = this.y;
        let x = this.M + 2;
        item.columns.forEach((c, i) => {
          this.y = top;
          if (c.type === 'risk'){
            const v = r[c.id] || {}; const b = band(v.score || 1);
            this.d.setFillColor(...b.c);
            this.d.roundedRect(x - 0.5, top - 3, w[i] - 5, 5.4, 1, 1, 'F');
            const sv = this.y; this.y = top + 0.6;
            this.txt(`${v.score || 1}  ${b.l}`, x + 1.5, { size: 6.2, style: 'bold', col: [255,255,255] });
            this.y = sv;
          } else if (c.type === 'sign'){
            if (r[c.id]){
              try { this.d.addImage(r[c.id], 'PNG', x, top - 2.5, Math.min(w[i] - 6, 34), 12); }
              catch(e){ this.txt('Signed', x, { size: 7, col: GREY }); }
            } else {
              this.txt('Not signed', x, { size: 7, col: GREY });
            }
          } else if (cells[i]) {
            cells[i].forEach(l => { this.txt(l, x, { size: 8 }); this.y += LH(8); });
          }
          x += w[i];
        });
        this.y = top + h;
      });
      this.y += 3;
    }

    /* --- prose blocks, used by the talk briefing sheet ------------------ */
    para(text, size = 9.5, style = 'normal', col = INK){
      this.wrap(text, this.CW, size, style).forEach(l => {
        this.need(LH(size) + 2);
        this.txt(l, this.M, { size, style, col });
        this.y += LH(size);
      });
      this.y += 2;
    }
    numbered(list, size = 9.5){
      list.forEach((t, i) => {
        const lines = this.wrap(t, this.CW - 9, size);
        this.need(lines.length * LH(size) + 3);
        const top = this.y;
        this.txt(String(i + 1) + '.', this.M, { size, style:'bold', col:GREY });
        lines.forEach(l => { this.txt(l, this.M + 9, { size }); this.y += LH(size); });
        this.y = Math.max(this.y, top + LH(size)) + 1.6;
      });
      this.y += 2;
    }
    /* Do and Don't side by side, in the safety-sign colours */
    doDont(doList, dontList){
      const gap = 6;
      const cw = (this.CW - gap) / 2;
      const tw = cw - 8;
      const size = 8.5;
      const measure = list => list.reduce((n, t) => n + this.wrap(t, tw - 4, size).length * LH(size) + 1.6, 0);
      const h = Math.max(measure(doList), measure(dontList)) + 13;
      this.need(h + 3);

      const top = this.y;
      [[doList, 'DO', GO, [235,245,238]], [dontList, "DON'T", STOP, [252,235,238]]]
        .forEach(([list, head, col, bg], ci) => {
          const x = this.M + ci * (cw + gap);
          this.d.setFillColor(...bg);
          this.d.rect(x, top - 3.5, cw, h, 'F');
          this.d.setFillColor(...col);
          this.d.rect(x, top - 3.5, 2, h, 'F');

          this.y = top + 1.2;
          this.txt(head, x + 6, { size:7, style:'bold', col, spacing:0.5 });
          this.y += 6;
          list.forEach(t => {
            const lines = this.wrap(t, tw - 4, size);
            const ltop = this.y;
            this.d.setFillColor(...col);
            this.d.circle(x + 7.4, this.y - 1.1, 0.75, 'F');
            lines.forEach(l => { this.txt(l, x + 10.5, { size }); this.y += LH(size); });
            this.y = Math.max(this.y, ltop + LH(size)) + 1.6;
          });
        });
      this.y = top + h + 3;
    }

    grid(headers, rows, rowH = 9, share){
      const w = null;
      const widths = share ? share.map(f => f * this.CW)
                           : headers.map(() => this.CW / headers.length);
      this.need(rowH * (rows + 1) + 4);
      this.d.setFillColor(...INK);
      this.d.rect(this.M, this.y - 3.6, this.CW, 7, 'F');
      let hx = this.M + 2;
      headers.forEach((h, i) => {
        this.txt(h.toUpperCase(), hx, { size:6.4, style:'bold', col:[255,255,255], spacing:0.3 });
        hx += widths[i];
      });
      this.y += 5;
      this.d.setDrawColor(...LINE); this.d.setLineWidth(0.25);
      for (let r = 0; r < rows; r++){
        this.d.rect(this.M, this.y - 1.5, this.CW, rowH);
        let cx = this.M;
        for (let c = 0; c < headers.length - 1; c++){
          cx += widths[c];
          this.d.line(cx, this.y - 1.5, cx, this.y - 1.5 + rowH);
        }
        this.y += rowH;
      }
      this.y += 4;
    }

    /* --- signature ------------------------------------------------------- */
    signature(label){
      this.need(30);
      this.y += 6;
      const colW = Math.min(62, this.CW / 3 - 4);
      const top = this.y;
      if (this.rec.sig){
        try { this.d.addImage(this.rec.sig, 'PNG', this.M, top, colW, 17); } catch(e){}
      }
      this.y = top + 19;
      const base = this.y;
      const cols = [
        [this.M, colW, '', label || 'Signature'],
        [this.M + colW + 8, colW, this.rec.by, 'Print name'],
        [this.M + (colW + 8) * 2, colW, fmt(this.rec.at), 'Date & time'],
      ];
      cols.forEach(([x, cw, val, lab]) => {
        this.y = base;
        if (val) this.txt(val, x, { size: 9.5 });
        this.y += 1.5;
        this.d.setDrawColor(...INK); this.d.setLineWidth(0.4);
        this.d.line(x, this.y, x + cw, this.y);
        this.y += 3.4;
        this.txt(lab.toUpperCase(), x, { size: 6.2, col: GREY, spacing: 0.35 });
      });
      this.y += 6;
    }

    /* --- photographs ----------------------------------------------------- */
    photos(list){
      if (!list.length) return;
      this.page();
      this.y -= 2;
      this.txt('PHOTOGRAPHIC EVIDENCE', this.M, { size: 7.6, style: 'bold', spacing: 0.55 });
      this.y += 2.4;
      this.rule(0.6, INK, 6);

      const cols = 2, gap = 8;
      const w = (this.CW - gap * (cols - 1)) / cols;
      const h = w * 0.72;
      list.forEach((p, i) => {
        const c = i % cols;
        if (c === 0) this.need(h + 8);
        const x = this.M + c * (w + gap);
        try { this.d.addImage(p, 'JPEG', x, this.y, w, h); } catch(e){}
        this.d.setDrawColor(...LINE); this.d.setLineWidth(0.3);
        this.d.rect(x, this.y, w, h);
        const sv = this.y; this.y += h + 3.6;
        this.txt(`PHOTO ${i + 1}`, x, { size: 6.4, col: GREY, spacing: 0.35 });
        this.y = (c === cols - 1 || i === list.length - 1) ? this.y + 6 : sv;
      });
    }

    /* --- footers, once the page count is known --------------------------- */
    footers(){
      const total = this.d.getNumberOfPages();
      for (let p = 1; p <= total; p++){
        this.d.setPage(p);
        const yy = this.H - 11;
        this.d.setDrawColor(...LINE); this.d.setLineWidth(0.3);
        this.d.line(this.M, yy - 3.5, this.M + this.CW, yy - 3.5);
        this.y = yy;
        this.txt('WRM  ·  SiteCheck record', this.M, { size: 6.8, col: GREY });
        this.txt(this.rec.ref, this.M + this.CW / 2, { size: 6.8, col: GREY, align: 'center' });
        this.txt(`Page ${p} of ${total}`, this.M + this.CW, { size: 6.8, col: GREY, align: 'right' });
      }
    }
  }

  /* --- helpers ----------------------------------------------------------- */
  function fmt(d){
    return new Date(d).toLocaleString('en-GB',
      { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
  }
  /* Likelihood x Severity = Risk.  High 11-25, Medium 6-10, Low 1-5. */
  function band(n){
    return n >= 11 ? { l:'HIGH', c:STOP } : n >= 6 ? { l:'MEDIUM', c:WARN } : { l:'LOW', c:GO };
  }
  function ratios(cols, total){
    const weight = { text:1.1, textarea:2.0, risk:0.85, sign:1.15 };
    const ws = cols.map(c => weight[c.type] || 1);
    const sum = ws.reduce((a,b) => a + b, 0);
    return ws.map(v => (v / sum) * total);
  }

  /* --- public ------------------------------------------------------------ */
  function init(logoDataUrl){ LOGO = logoDataUrl; }

  function isWide(form){
    return form.orient ? form.orient === 'landscape'
                       : form.sections.some(s => s.items.some(i => i.type === 'repeat'));
  }

  /* Footers are stamped once at the end, when the page count is known.
     Page size is read per page, so a document can mix orientations.      */
  function stampFooters(doc, ref){
    const total = doc.getNumberOfPages();
    for (let p = 1; p <= total; p++){
      doc.setPage(p);
      const W = doc.internal.pageSize.getWidth();
      const H = doc.internal.pageSize.getHeight();
      const M = 14, CW = W - M * 2, yy = H - 11;
      doc.setDrawColor(...LINE); doc.setLineWidth(0.3);
      doc.line(M, yy - 3.5, M + CW, yy - 3.5);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(6.8); doc.setTextColor(...GREY);
      doc.text('WRM  ·  SiteCheck record', M, yy);
      doc.text(String(ref), M + CW / 2, yy, { align:'center' });
      doc.text(`Page ${p} of ${total}`, M + CW, yy, { align:'right' });
    }
  }

  /* Lay one record into an existing document. Used on its own for a single
     PDF, or twice over for a combined risk assessment and method statement. */
  function renderRecord(doc, rec, form, first){
    const wide = isWide(form);
    if (!first) doc.addPage('a4', wide ? 'landscape' : 'portrait');

    const sh = new Sheet(doc, rec, form, wide);
    sh.masthead();
    sh.details();
    sh.verdict();

    const gallery = [];
    form.sections.forEach(sec => {
      const firstItem = sec.items[0];
      let keep = 0;
      if (firstItem && firstItem.type === 'repeat'){
        const fr = (rec.answers[firstItem.id] || {}).rows || [];
        keep = fr.length ? sh.tableHeight(firstItem, fr) : 0;
      }
      sh.section(sec.title, keep);
      let n = 0;
      sec.items.forEach(item => {
        const ans = rec.answers[item.id] || {};
        if (item.type === 'photo'){ (ans.photos || []).forEach(p => gallery.push(p)); }
        if (item.type === 'file'){
          const f = ans.file;
          if (f && /^image\//.test(f.type)) gallery.push(f.data);
        }
        if (item.type === 'repeat'){
          if (item.layout === 'ra'){ sh.raGrid(item, ans.rows); }
          else { sh.hazards(item, ans.rows); }
          return;
        }
        sh.row(item, ans, n++ % 2 === 1);
      });
    });

    sh.signature(form.signLabel);
    if (form.reviewLog) sh.reviewLog();
    sh.photos(gallery);
    return sh;
  }

  function build(rec, form){
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit:'mm', format:'a4',
      orientation: isWide(form) ? 'landscape' : 'portrait' });
    renderRecord(doc, rec, form, true);
    stampFooters(doc, rec.ref);
    return doc;
  }

  /* Two or more records in one file, each starting on a fresh page.
     parts: [{ rec, form }, ...]                                          */
  function buildCombined(parts, label){
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit:'mm', format:'a4',
      orientation: isWide(parts[0].form) ? 'landscape' : 'portrait' });
    parts.forEach((p, i) => renderRecord(doc, p.rec, p.form, i === 0));
    stampFooters(doc, label);
    return doc;
  }

  function downloadCombined(parts, label, name){
    buildCombined(parts, label).save(name);
  }

  /* A printable talk: the notes to deliver, then an attendance grid so
     signatures can be taken on paper and photographed back into the app. */
  function talkSheet(topic, talk, project, by){
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit:'mm', format:'a4', orientation:'portrait' });
    const now = new Date();
    const rec = {
      ref: 'TALK-' + now.toISOString().slice(0,10).replace(/-/g,''),
      at: now.toISOString(), by: by || '', fails: 0,
      site: project || {}, answers: {}, sig: null,
    };
    const form = { title: topic, code:'TB', sub:'TOOLBOX TALK BRIEFING', sections: [] };
    const sh = new Sheet(doc, rec, form, false);

    sh.masthead();
    sh.details();

    sh.section('Why this matters');
    sh.para(talk.why);

    sh.section('Points to cover');
    sh.numbered(talk.points);

    if (talk.do && talk.dont){
      sh.section('Do and do not');
      sh.doDont(talk.do, talk.dont);
    }

    sh.section('Ask the group');
    sh.numbered(talk.ask);

    if (talk.ref){
      sh.section('Where this comes from');
      sh.para(talk.ref, 8.5, 'italic', GREY);
    }

    sh.section('Attendance');
    sh.para('Everyone present should sign below. Photograph this sheet back into the record.', 8, 'italic', GREY);
    sh.grid(['Name', 'Employer', 'Trade', 'Signature'], 12);

    sh.signature();
    stampFooters(doc, rec.ref);
    return doc;
  }
  function downloadTalk(topic, talk, project, by){
    talkSheet(topic, talk, project, by)
      .save(('Toolbox talk - ' + topic).replace(/[^\w\- ]+/g,'') + '.pdf');
  }

  function filename(rec){
    return `${rec.ref} ${rec.title}`.replace(/[^\w\-. ]+/g, '').slice(0, 90) + '.pdf';
  }

  function download(rec, form){
    const doc = build(rec, form);
    doc.save(filename(rec));
  }

  function blob(rec, form){
    return build(rec, form).output('blob');
  }

  return { init, build, download, blob, filename, talkSheet, downloadTalk,
           buildCombined, downloadCombined };
})();
