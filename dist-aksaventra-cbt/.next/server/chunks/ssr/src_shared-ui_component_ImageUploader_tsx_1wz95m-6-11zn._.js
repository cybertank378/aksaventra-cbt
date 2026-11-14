module.exports=[80250,71276,54207,a=>{"use strict";var b=a.i(87924),c=a.i(67644),c=c,d=a.i(75160),e=a.i(51675),f=a.i(11550),g=a.i(16644),h=a.i(72131),i=a.i(27406),j=a.i(40623);a.s(["f",0,({value:a,onChange:k,label:l="Lampiran Gambar Soal (Opsional)",className:m=""})=>{let[n,o]=(0,h.useState)(!1),[p,q]=(0,h.useState)(!1),r=(0,h.useRef)(null),s=async a=>{if(!a.type.startsWith("image/"))return void(0,j.a)("Format berkas harus berupa gambar (PNG, JPG, WebP, GIF, SVG).");if(a.size>5242880)return void(0,j.a)("Ukuran gambar maksimal 5 MB.");o(!0);try{let b=new FormData;b.append("file",a);let c=await fetch("/api/upload",{method:"POST",body:b}),d=await c.json();d.success&&d.data?.url?(k(d.data.url),(0,j.S)("Gambar berhasil diunggah.")):(0,j.a)(d.error?.message||"Gagal mengunggah gambar.")}catch{(0,j.a)("Terjadi gangguan jaringan saat mengunggah gambar.")}finally{o(!1)}},t=()=>{r.current?.click()};return(0,b.jsxs)("div",{className:`flex flex-col gap-1.5 ${m}`,children:[l&&(0,b.jsxs)("span",{className:"text-xs font-bold text-slate-700 flex items-center gap-1.5",children:[(0,b.jsx)(c.f,{className:"w-3.5 h-3.5 text-[#0097a7]"}),l]}),(0,b.jsx)("input",{ref:r,type:"file",accept:"image/*",onChange:a=>{let b=a.target.files?.[0];b&&s(b)},className:"hidden"}),a?(0,b.jsxs)("div",{className:"relative group rounded-2xl border border-slate-200 bg-slate-50/70 p-3 overflow-hidden flex flex-col sm:flex-row items-center gap-4",children:[(0,b.jsx)("div",{className:"relative w-40 h-28 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0",children:(0,b.jsx)(g.default,{src:a,alt:"Gambar Soal",fill:!0,className:"object-contain p-1",unoptimized:!0})}),(0,b.jsxs)("div",{className:"flex-1 flex flex-col justify-between self-stretch py-1",children:[(0,b.jsxs)("div",{className:"space-y-1",children:[(0,b.jsx)("p",{className:"text-xs font-semibold text-slate-800 break-all",children:a.split("/").pop()}),(0,b.jsx)("p",{className:"text-[11px] text-slate-400",children:"Gambar terlampir akan ditampilkan bersama stem teks pertanyaan."})]}),(0,b.jsxs)("div",{className:"flex items-center gap-2 pt-2",children:[(0,b.jsx)(i.f,{type:"button",variant:"outline",color:"secondary",size:"sm",onClick:t,disabled:n,children:"Ganti Gambar"}),(0,b.jsx)(i.f,{type:"button",variant:"ghost",color:"error",size:"sm",leftIcon:e.f,onClick:()=>{k(void 0),r.current&&(r.current.value="")},disabled:n,children:"Hapus"})]})]})]}):(0,b.jsx)("div",{onClick:t,onDragOver:a=>{a.preventDefault(),q(!0)},onDragLeave:()=>{q(!1)},onDrop:a=>{a.preventDefault(),q(!1);let b=a.dataTransfer.files?.[0];b&&s(b)},className:`flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer select-none text-center ${p?"border-[#0097a7] bg-[#0097a7]/5":"border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50"}`,children:n?(0,b.jsxs)("div",{className:"flex items-center gap-2 text-xs font-bold text-[#0097a7]",children:[(0,b.jsx)(d.f,{className:"w-5 h-5 animate-spin"}),(0,b.jsx)("span",{children:"Mengunggah gambar..."})]}):(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)("div",{className:"p-2.5 rounded-2xl bg-teal-50 text-[#0097a7]",children:(0,b.jsx)(f.f,{className:"w-5 h-5"})}),(0,b.jsxs)("div",{className:"space-y-0.5",children:[(0,b.jsx)("p",{className:"text-xs font-bold text-slate-700",children:"Klik untuk unggah gambar atau seret berkas ke sini"}),(0,b.jsx)("p",{className:"text-[11px] text-slate-400",children:"Format didukung: PNG, JPG, WebP, GIF, SVG (Maks. 5 MB)"})]})]})})]})}],80250);var k=a.i(52562),l=a.i(85650),m=a.i(36670),n=a.i(33894),o=a.i(86708),p=a.i(74215),q=a.i(54161),r=a.i(6581),s=a.i(30023);a.s(["f",0,({open:a,onClose:c,onInsertSvg:d,onSetAsImageUrl:e})=>{let[f,g]=(0,h.useState)("parabola"),[j,t]=(0,h.useState)(1),[u,v]=(0,h.useState)(-4),[w,x]=(0,h.useState)(3),[y,z]=(0,h.useState)("Grafik y = x² - 4x + 3"),[A,B]=(0,h.useState)(2),[C,D]=(0,h.useState)(-2),[E,F]=(0,h.useState)("Garis y = 2x - 2"),[G,H]=(0,h.useState)("A"),[I,J]=(0,h.useState)("B"),[K,L]=(0,h.useState)("C"),[M,N]=(0,h.useState)("3 cm"),[O,P]=(0,h.useState)("4 cm"),[Q,R]=(0,h.useState)("5 cm"),[S,T]=(0,h.useState)("A: Matematika"),[U,V]=(0,h.useState)("B: Fisika"),[W,X]=(0,h.useState)("A ∩ B"),[Y,Z]=(0,h.useState)(!1),$=(0,h.useMemo)(()=>{if("parabola"===f){let a=[];for(let b=-5;b<=6;b+=.2){let c=j*b*b+u*b+w,d=200+25*b,e=180-25*c;e>=20&&e<=280&&a.push(`${d.toFixed(1)},${e.toFixed(1)}`)}let b=a.join(" "),c=-u/(2*(j||.001)),d=j*c*c+u*c+w,e=200+25*c,f=180-25*d;return`<svg viewBox="0 0 400 300" width="100%" height="240" xmlns="http://www.w3.org/2000/svg" class="math-curve-parabola mx-auto my-2 rounded-xl bg-white border border-slate-200">
  <!-- Grid -->
  <defs>
    <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
      <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#e2e8f0" stroke-width="0.8"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid)" />
  
  <!-- Axes -->
  <line x1="20" y1="180" x2="380" y2="180" stroke="#64748b" stroke-width="1.8" />
  <polygon points="380,176 390,180 380,184" fill="#64748b" />
  <text x="385" y="172" font-size="12" font-family="sans-serif" font-weight="bold" fill="#334155">X</text>

  <line x1="200" y1="280" x2="200" y2="20" stroke="#64748b" stroke-width="1.8" />
  <polygon points="196,20 200,10 204,20" fill="#64748b" />
  <text x="208" y="20" font-size="12" font-family="sans-serif" font-weight="bold" fill="#334155">Y</text>
  <text x="188" y="195" font-size="11" fill="#64748b">O</text>

  <!-- Parabola Curve -->
  <polyline points="${b}" fill="none" stroke="#0097a7" stroke-width="2.6" stroke-linecap="round" />

  <!-- Vertex Point -->
  ${f>=20&&f<=280?`
  <circle cx="${e}" cy="${f}" r="4.5" fill="#eab308" stroke="#0d2b5c" stroke-width="1.5" />
  <text x="${e+8}" y="${f-6}" font-size="11" font-weight="bold" fill="#0d2b5c">P(${c.toFixed(1)}, ${d.toFixed(1)})</text>
  `:""}

  <!-- Label / Title -->
  <text x="20" y="28" font-size="12" font-weight="bold" font-family="sans-serif" fill="#0d2b5c">${y}</text>
</svg>`}if("linear"===f){let a=-6*A+C,b=6*A+C;return`<svg viewBox="0 0 400 300" width="100%" height="240" xmlns="http://www.w3.org/2000/svg" class="math-curve-linear mx-auto my-2 rounded-xl bg-white border border-slate-200">
  <defs>
    <pattern id="grid-lin" width="25" height="25" patternUnits="userSpaceOnUse">
      <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#e2e8f0" stroke-width="0.8"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid-lin)" />

  <!-- Axes -->
  <line x1="20" y1="150" x2="380" y2="150" stroke="#64748b" stroke-width="1.8" />
  <polygon points="380,146 390,150 380,154" fill="#64748b" />
  <text x="385" y="142" font-size="12" font-weight="bold" fill="#334155">X</text>

  <line x1="200" y1="280" x2="200" y2="20" stroke="#64748b" stroke-width="1.8" />
  <polygon points="196,20 200,10 204,20" fill="#64748b" />
  <text x="208" y="20" font-size="12" font-weight="bold" fill="#334155">Y</text>
  <text x="188" y="165" font-size="11" fill="#64748b">O</text>

  <!-- Linear Line -->
  <line x1="50" y1="${150-25*a}" x2="350" y2="${150-25*b}" stroke="#0284c7" stroke-width="2.6" stroke-linecap="round" />
  
  <text x="20" y="28" font-size="12" font-weight="bold" font-family="sans-serif" fill="#0d2b5c">${E}</text>
</svg>`}if("sine"===f){let a=[];for(let b=40;b<=360;b+=4){let c=150-70*Math.sin((b-40)/160*Math.PI);a.push(`${b.toFixed(1)},${c.toFixed(1)}`)}return`<svg viewBox="0 0 400 300" width="100%" height="240" xmlns="http://www.w3.org/2000/svg" class="math-curve-sine mx-auto my-2 rounded-xl bg-white border border-slate-200">
  <line x1="20" y1="150" x2="380" y2="150" stroke="#64748b" stroke-width="1.8" />
  <polygon points="380,146 390,150 380,154" fill="#64748b" />
  <text x="385" y="142" font-size="12" font-weight="bold" fill="#334155">x</text>

  <line x1="40" y1="280" x2="40" y2="20" stroke="#64748b" stroke-width="1.8" />
  <polygon points="36,20 40,10 44,20" fill="#64748b" />
  <text x="48" y="20" font-size="12" font-weight="bold" fill="#334155">y</text>

  <!-- Sine Wave -->
  <polyline points="${a.join(" ")}" fill="none" stroke="#0097a7" stroke-width="2.6" stroke-linecap="round" />

  <!-- Key Ticks -->
  <line x1="200" y1="146" x2="200" y2="154" stroke="#64748b" stroke-width="1.5" />
  <text x="195" y="168" font-size="11" fill="#475569">π</text>

  <line x1="360" y1="146" x2="360" y2="154" stroke="#64748b" stroke-width="1.5" />
  <text x="350" y="168" font-size="11" fill="#475569">2π</text>

  <text x="20" y="28" font-size="12" font-weight="bold" fill="#0d2b5c">Kurva y = sin(x)</text>
</svg>`}return"triangle"===f?`<svg viewBox="0 0 400 300" width="100%" height="240" xmlns="http://www.w3.org/2000/svg" class="math-diagram-triangle mx-auto my-2 rounded-xl bg-white border border-slate-200">
  <!-- Triangle Polygon -->
  <polygon points="80,240 320,240 80,60" fill="#f0fdf4" stroke="#16a34a" stroke-width="2.5" stroke-linejoin="round" />
  
  <!-- Right Angle Square -->
  <rect x="80" y="220" width="20" height="20" fill="none" stroke="#16a34a" stroke-width="1.5" />

  <!-- Vertices Labels -->
  <circle cx="80" cy="240" r="4" fill="#0d2b5c" />
  <text x="60" y="255" font-size="13" font-weight="bold" fill="#0d2b5c">${G}</text>

  <circle cx="320" cy="240" r="4" fill="#0d2b5c" />
  <text x="328" y="255" font-size="13" font-weight="bold" fill="#0d2b5c">${I}</text>

  <circle cx="80" cy="60" r="4" fill="#0d2b5c" />
  <text x="60" y="55" font-size="13" font-weight="bold" fill="#0d2b5c">${K}</text>

  <!-- Side Labels -->
  <text x="190" y="260" font-size="12" font-weight="bold" fill="#475569">${M}</text>
  <text x="45" y="155" font-size="12" font-weight="bold" fill="#475569">${O}</text>
  <text x="210" y="140" font-size="12" font-weight="bold" fill="#16a34a">${Q}</text>

  <text x="20" y="28" font-size="12" font-weight="bold" fill="#0d2b5c">Segitiga Siku-Siku ABC</text>
</svg>`:"venn"===f?`<svg viewBox="0 0 400 260" width="100%" height="220" xmlns="http://www.w3.org/2000/svg" class="math-diagram-venn mx-auto my-2 rounded-xl bg-white border border-slate-200">
  <!-- Universe Rect -->
  <rect x="30" y="25" width="340" height="210" rx="16" fill="#f8fafc" stroke="#64748b" stroke-width="1.5" />
  <text x="45" y="48" font-size="13" font-weight="bold" fill="#0d2b5c">S (Semesta)</text>

  <!-- Circle A -->
  <circle cx="160" cy="135" r="70" fill="#0097a7" fill-opacity="0.25" stroke="#0097a7" stroke-width="2.2" />
  <text x="120" y="140" font-size="12" font-weight="bold" fill="#0097a7">${S}</text>

  <!-- Circle B -->
  <circle cx="240" cy="135" r="70" fill="#eab308" fill-opacity="0.25" stroke="#ca8a04" stroke-width="2.2" />
  <text x="250" y="140" font-size="12" font-weight="bold" fill="#854d0e">${U}</text>

  <!-- Intersection Label -->
  <text x="185" y="140" font-size="11" font-weight="bold" fill="#0d2b5c">${W}</text>
</svg>`:`<svg viewBox="0 0 400 260" width="100%" height="220" xmlns="http://www.w3.org/2000/svg" class="math-diagram-circle mx-auto my-2 rounded-xl bg-white border border-slate-200">
  <circle cx="200" cy="130" r="80" fill="#f0f9ff" stroke="#0284c7" stroke-width="2.2" />
  <circle cx="200" cy="130" r="4" fill="#0d2b5c" />
  <text x="195" y="120" font-size="12" font-weight="bold" fill="#0d2b5c">O</text>
  <line x1="200" y1="130" x2="270" y2="90" stroke="#0284c7" stroke-width="1.8" stroke-dasharray="4" />
  <text x="235" y="105" font-size="12" font-weight="bold" fill="#0284c7">r</text>
  <text x="20" y="28" font-size="12" font-weight="bold" fill="#0d2b5c">Lingkaran dengan Pusat O</text>
</svg>`},[f,j,u,w,y,A,C,E,G,I,K,M,O,Q,S,U,W]),_=async()=>{try{await navigator.clipboard.writeText($),Z(!0),setTimeout(()=>Z(!1),2e3)}catch(a){}};return(0,b.jsx)(q.U,{open:a,onClose:c,title:"Generator Kurva & Diagram Matematika",subtitle:"Buat kurva fungsi kartesius, geometri, trigonometri, dan diagram himpunan beresolusi tinggi (vektor SVG)",size:"lg",children:(0,b.jsxs)("div",{className:"flex flex-col gap-5 py-2",children:[(0,b.jsxs)("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[(0,b.jsxs)(r.f,{id:"diagram-type-select",label:"Pilih Template Kurva / Diagram:",value:f,onChange:a=>g(a.target.value),size:"sm",children:[(0,b.jsx)("option",{value:"parabola",children:"Kurva Parabola (Fungsi Kuadrat y = ax² + bx + c)"}),(0,b.jsx)("option",{value:"linear",children:"Garis Lurus / Linear (y = mx + c)"}),(0,b.jsx)("option",{value:"sine",children:"Kurva Trigonometri Gelombang Sinus"}),(0,b.jsx)("option",{value:"triangle",children:"Diagram Geometri Segitiga Siku-siku"}),(0,b.jsx)("option",{value:"circle",children:"Diagram Lingkaran & Jari-jari"}),(0,b.jsx)("option",{value:"venn",children:"Diagram Venn Himpunan Beririsan"})]}),"parabola"===f&&(0,b.jsx)(s.f,{id:"parabola-title-input",label:"Judul / Label Kurva:",value:y,onChange:a=>z(a.target.value),size:"sm"}),"linear"===f&&(0,b.jsx)(s.f,{id:"linear-title-input",label:"Judul Garis:",value:E,onChange:a=>F(a.target.value),size:"sm"})]}),"parabola"===f&&(0,b.jsxs)("div",{className:"grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200",children:[(0,b.jsx)(s.f,{id:"param-a",label:"Koefisien a:",type:"number",step:"0.5",value:j,onChange:a=>t(Number(a.target.value)),size:"sm"}),(0,b.jsx)(s.f,{id:"param-b",label:"Koefisien b:",type:"number",step:"0.5",value:u,onChange:a=>v(Number(a.target.value)),size:"sm"}),(0,b.jsx)(s.f,{id:"param-c",label:"Konstanta c:",type:"number",step:"0.5",value:w,onChange:a=>x(Number(a.target.value)),size:"sm"})]}),"linear"===f&&(0,b.jsxs)("div",{className:"grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200",children:[(0,b.jsx)(s.f,{id:"param-m",label:"Gradien m:",type:"number",step:"0.5",value:A,onChange:a=>B(Number(a.target.value)),size:"sm"}),(0,b.jsx)(s.f,{id:"param-lin-c",label:"Konstanta c:",type:"number",step:"0.5",value:C,onChange:a=>D(Number(a.target.value)),size:"sm"})]}),"triangle"===f&&(0,b.jsxs)("div",{className:"grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200",children:[(0,b.jsx)(s.f,{id:"tri-side-a",label:"Alas Segitiga:",value:M,onChange:a=>N(a.target.value),size:"sm"}),(0,b.jsx)(s.f,{id:"tri-side-b",label:"Tinggi Segitiga:",value:O,onChange:a=>P(a.target.value),size:"sm"}),(0,b.jsx)(s.f,{id:"tri-side-c",label:"Sisi Miring (Hipotenusa):",value:Q,onChange:a=>R(a.target.value),size:"sm"})]}),"venn"===f&&(0,b.jsxs)("div",{className:"grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200",children:[(0,b.jsx)(s.f,{id:"venn-set-a",label:"Label Himpunan A:",value:S,onChange:a=>T(a.target.value),size:"sm"}),(0,b.jsx)(s.f,{id:"venn-set-b",label:"Label Himpunan B:",value:U,onChange:a=>V(a.target.value),size:"sm"}),(0,b.jsx)(s.f,{id:"venn-union",label:"Label Irisan A ∩ B:",value:W,onChange:a=>X(a.target.value),size:"sm"})]}),(0,b.jsxs)("div",{className:"flex flex-col gap-2",children:[(0,b.jsxs)("div",{className:"flex items-center justify-between text-xs font-bold text-slate-700",children:[(0,b.jsxs)("div",{className:"flex items-center gap-1.5",children:[(0,b.jsx)(n.f,{className:"w-4 h-4 text-[#0097a7]"}),(0,b.jsx)("span",{children:"Pratinjau Hasil Kurva / Diagram Vektor:"})]}),(0,b.jsx)("span",{className:"text-[11px] text-slate-400",children:"Vektor SVG Responsif"})]}),(0,b.jsx)("div",{className:"p-4 rounded-2xl bg-slate-100/60 border border-slate-200 flex items-center justify-center min-h-[220px]",dangerouslySetInnerHTML:{__html:$}})]}),(0,b.jsxs)("div",{className:"flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200",children:[(0,b.jsxs)("div",{className:"flex items-center gap-2",children:[(0,b.jsx)(i.f,{type:"button",variant:"outline",color:"secondary",size:"sm",leftIcon:Y?k.f:l.f,onClick:_,children:Y?"Tersalin!":"Salin SVG"}),(0,b.jsx)(i.f,{type:"button",variant:"outline",color:"secondary",size:"sm",leftIcon:m.f,onClick:()=>{let a=new Blob([$],{type:"image/svg+xml"}),b=URL.createObjectURL(a),c=document.createElement("a");c.href=b,c.download=`math-diagram-${f}-${Date.now()}.svg`,document.body.appendChild(c),c.click(),document.body.removeChild(c),URL.revokeObjectURL(b)},children:"Unduh .svg"})]}),(0,b.jsxs)("div",{className:"flex items-center gap-2",children:[(0,b.jsx)(i.f,{type:"button",variant:"ghost",color:"secondary",size:"sm",leftIcon:p.X,onClick:c,children:"Batal"}),e&&(0,b.jsx)(i.f,{type:"button",variant:"outline",color:"primary",size:"sm",onClick:()=>{e&&(e(`data:image/svg+xml;utf8,${encodeURIComponent($)}`),c())},children:"Gunakan sbg Gambar Soal"}),(0,b.jsx)(i.f,{type:"button",variant:"filled",color:"primary",size:"sm",leftIcon:o.f,onClick:()=>{d($),c()},children:"Sisipkan ke Teks Soal"})]})]})]})})}],71276);var t=a.i(64831);let u={name:"binary",size:24,node:[["rect",{x:"14",y:"14",width:"4",height:"6",rx:"2",key:"p02svl"}],["rect",{x:"6",y:"4",width:"4",height:"6",rx:"2",key:"xm4xkj"}],["path",{d:"M6 20h4",key:"1i6q5t"}],["path",{d:"M14 10h4",key:"ru81e7"}],["path",{d:"M6 14h2v6",key:"16z9wg"}],["path",{d:"M14 4h2v6",key:"1idq9u"}]]};u.node;let v=(0,t.f)(u),w={name:"divide",size:24,node:[["circle",{cx:"12",cy:"6",r:"1",key:"1bh7o1"}],["line",{x1:"5",x2:"19",y1:"12",y2:"12",key:"13b5wn"}],["circle",{cx:"12",cy:"18",r:"1",key:"lqb9t5"}]]};w.node;let x=(0,t.f)(w),y={name:"pi",size:24,node:[["line",{x1:"9",x2:"9",y1:"4",y2:"20",key:"ovs5a5"}],["path",{d:"M4 7c0-1.7 1.3-3 3-3h13",key:"10pag4"}],["path",{d:"M18 20c-1.7 0-3-1.3-3-3V4",key:"1gaosr"}]]};y.node;let z=(0,t.f)(y),A={name:"superscript",size:24,node:[["path",{d:"m4 19 8-8",key:"hr47gm"}],["path",{d:"m12 19-8-8",key:"1dhhmo"}],["path",{d:"M20 12h-4c0-1.5.442-2 1.5-2.5S20 8.334 20 7.002c0-.472-.17-.93-.484-1.29a2.105 2.105 0 0 0-2.617-.436c-.42.239-.738.614-.899 1.06",key:"1dfcux"}]]};A.node;let B=(0,t.f)(A);a.s(["f",0,({onInsertMath:a,onOpenDiagramGenerator:c,className:d=""})=>(0,b.jsxs)("div",{className:`flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-200 ${d}`,children:[(0,b.jsxs)("div",{className:"flex flex-wrap items-center gap-1.5 overflow-x-auto py-0.5",children:[(0,b.jsx)("span",{className:"text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1",children:"Simbol Matematika:"}),[{label:"Pecahan",code:"\\frac{a}{b}",icon:x},{label:"Pangkat",code:"x^{2}",icon:B},{label:"Akar",code:"\\sqrt{x}"},{label:"Akar-n",code:"\\sqrt[n]{x}"},{label:"Limit",code:"\\lim_{x \\to 0}"},{label:"Integral",code:"\\int_{a}^{b} f(x)\\,dx"},{label:"Sigma",code:"\\sum_{i=1}^{n} x_i"},{label:"Matriks",code:"\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}",icon:v},{label:"±",code:"\\pm"},{label:"≠",code:"\\neq"},{label:"≤",code:"\\le"},{label:"≥",code:"\\ge"},{label:"≈",code:"\\approx"},{label:"π",code:"\\pi",icon:z},{label:"θ",code:"\\theta"},{label:"α",code:"\\alpha"},{label:"β",code:"\\beta"},{label:"∞",code:"\\infty"},{label:"Kurva f(x)",code:"f(x) = ax^2 + bx + c"}].map(c=>(0,b.jsxs)("button",{type:"button",onClick:()=>a(`$${c.code}$`),className:"inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:border-[#0097a7] hover:text-[#0097a7] hover:bg-[#0097a7]/5 transition-colors cursor-pointer select-none",title:`Sisipkan formula ${c.label}`,children:[c.icon&&(0,b.jsx)(c.icon,{className:"w-3 h-3 text-slate-400"}),(0,b.jsx)("span",{children:c.label})]},c.label))]}),c&&(0,b.jsx)(i.f,{type:"button",variant:"filled",color:"primary",size:"xs",leftIcon:n.f,onClick:c,className:"shadow-2xs shrink-0",children:"Buat Kurva / Diagram"})]})],54207)}];

//# sourceMappingURL=src_shared-ui_component_ImageUploader_tsx_1wz95m-6-11zn._.js.map