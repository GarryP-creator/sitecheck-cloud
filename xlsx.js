/* ============================================================================
   SiteCheck — spreadsheet export

   Writes a real multi-tab .xlsx on the device, with no library. An xlsx is a
   zip of XML files; we store the entries uncompressed, which keeps the code
   to a page and costs nothing on tables this size.

   Dates are written as real Excel dates, not text, so sorting and filtering
   in the spreadsheet behave the way you'd expect.
   ========================================================================== */

const XLS = (() => {

  /* --- zip (stored, no compression) -------------------------------------- */
  let TBL = null;
  function crc32(buf){
    if (!TBL){
      TBL = new Int32Array(256);
      for (let i = 0; i < 256; i++){
        let c = i;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
        TBL[i] = c;
      }
    }
    let c = -1;
    for (let i = 0; i < buf.length; i++) c = TBL[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
  }
  const enc = s => new TextEncoder().encode(s);

  function zip(files){
    const parts = [], central = [];
    let offset = 0;
    const dt = new Date();
    const time = ((dt.getHours() << 11) | (dt.getMinutes() << 5) | (dt.getSeconds() / 2)) & 0xFFFF;
    const date = (((dt.getFullYear() - 1980) << 9) | ((dt.getMonth() + 1) << 5) | dt.getDate()) & 0xFFFF;

    for (const f of files){
      const name = enc(f.name), data = f.data, crc = crc32(data);
      const lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true);
      lh.setUint16(8, 0, true); lh.setUint16(10, time, true); lh.setUint16(12, date, true);
      lh.setUint32(14, crc, true); lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true);
      lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
      parts.push(new Uint8Array(lh.buffer), name, data);

      const cd = new DataView(new ArrayBuffer(46));
      cd.setUint32(0, 0x02014b50, true); cd.setUint16(4, 20, true); cd.setUint16(6, 20, true);
      cd.setUint16(8, 0x0800, true); cd.setUint16(10, 0, true);
      cd.setUint16(12, time, true); cd.setUint16(14, date, true);
      cd.setUint32(16, crc, true); cd.setUint32(20, data.length, true); cd.setUint32(24, data.length, true);
      cd.setUint16(28, name.length, true); cd.setUint32(42, offset, true);
      central.push(new Uint8Array(cd.buffer), name);
      offset += 30 + name.length + data.length;
    }
    const cdSize = central.reduce((n, p) => n + p.length, 0);
    const eo = new DataView(new ArrayBuffer(22));
    eo.setUint32(0, 0x06054b50, true);
    eo.setUint16(8, files.length, true); eo.setUint16(10, files.length, true);
    eo.setUint32(12, cdSize, true); eo.setUint32(16, offset, true);

    const all = [...parts, ...central, new Uint8Array(eo.buffer)];
    const total = all.reduce((n, p) => n + p.length, 0);
    const out = new Uint8Array(total);
    let at = 0;
    for (const p of all){ out.set(p, at); at += p.length; }
    return out;
  }

  /* --- xml helpers -------------------------------------------------------- */
  const x = s => String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/\x00-\x08|\x0b|\x0c|\x0e-\x1f/g,'');

  function colRef(n){
    let s = '';
    n += 1;
    while (n > 0){ const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = (n - m - 1) / 26; }
    return s;
  }
  // Excel counts days from 1899-12-30
  const serial = d => (d.getTime() - Date.UTC(1899,11,30) + d.getTimezoneOffset() * -60000) / 86400000;

  function cell(v, r, c){
    const ref = colRef(c) + r;
    if (v == null || v === '') return '';
    if (v instanceof Date)      return `<c r="${ref}" s="2"><v>${serial(v)}</v></c>`;
    if (typeof v === 'number' && isFinite(v)) return `<c r="${ref}"><v>${v}</v></c>`;
    return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${x(v)}</t></is></c>`;
  }

  function sheetXml(rows, widths){
    const cols = widths && widths.length
      ? `<cols>${widths.map((w,i)=>`<col min="${i+1}" max="${i+1}" width="${w}" customWidth="1"/>`).join('')}</cols>` : '';
    const body = rows.map((row, ri) => {
      const cells = row.map((v, ci) =>
        ri === 0
          ? `<c r="${colRef(ci)}1" s="1" t="inlineStr"><is><t>${x(v)}</t></is></c>`
          : cell(v, ri + 1, ci)
      ).join('');
      return `<row r="${ri+1}">${cells}</row>`;
    }).join('');
    const lastCol = colRef(Math.max(0, (rows[0] ? rows[0].length : 1) - 1));
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
${cols}<sheetData>${body}</sheetData>
<autoFilter ref="A1:${lastCol}${Math.max(rows.length,1)}"/></worksheet>`;
  }

  const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="1"><numFmt numFmtId="164" formatCode="dd/mm/yyyy\\ hh:mm"/></numFmts>
<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font>
<font><b/><sz val="11"/><color rgb="FF14171A"/><name val="Calibri"/></font></fonts>
<fills count="3"><fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFFFD400"/><bgColor indexed="64"/></patternFill></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="3">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>
<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
</cellXfs></styleSheet>`;

  /* --- workbook ----------------------------------------------------------- */
  function build(sheets){
    const names = sheets.map(s => s.name.replace(/[\\\/\?\*\[\]:]/g,'').slice(0,31));
    const files = [
      { name:'[Content_Types].xml', data: enc(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
${sheets.map((s,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}
</Types>`) },
      { name:'_rels/.rels', data: enc(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`) },
      { name:'xl/workbook.xml', data: enc(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>${names.map((n,i)=>`<sheet name="${x(n)}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('')}</sheets>
</workbook>`) },
      { name:'xl/_rels/workbook.xml.rels', data: enc(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${sheets.map((s,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')}
<Relationship Id="rIdS" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`) },
      { name:'xl/styles.xml', data: enc(STYLES) },
    ];
    sheets.forEach((s, i) => files.push({
      name: `xl/worksheets/sheet${i+1}.xml`,
      data: enc(sheetXml(s.rows && s.rows.length ? s.rows : [['No data']], s.widths))
    }));
    return zip(files);
  }

  function download(sheets, filename){
    const bytes = build(sheets);
    const blob = new Blob([bytes], { type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  return { build, download };
})();

if (typeof module !== 'undefined') module.exports = XLS;
