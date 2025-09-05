// Stepwise Math core
const TOPICS = [
  { id:'arithmetic', label:'Arithmetic' },
  { id:'fractions', label:'Fractions' },
  { id:'percent', label:'Percent' },
  { id:'linear', label:'Linear Eq.' },
  { id:'system', label:'2×2 System' },
  { id:'quadratic', label:'Quadratic' },
  { id:'derivative', label:'Derivative (poly)' }
];

const VIDEOS = {
  arithmetic: [
    { t:'Khan Academy – Order of operations (PEMDAS)', u:'https://www.khanacademy.org/math/arithmetic/arith-review-order-of-operations' },
    { t:'Math Antics – Long Multiplication', u:'https://www.youtube.com/watch?v=J1QZNB7P2ZM' }
  ],
  fractions: [
    { t:'Khan Academy – Simplifying Fractions', u:'https://www.khanacademy.org/math/arithmetic/fraction-arithmetic' },
    { t:'Math Antics – Fractions Basics', u:'https://www.youtube.com/watch?v=huMZ1Hj8E0Q' }
  ],
  percent: [
    { t:'Khan Academy – Percent problems', u:'https://www.khanacademy.org/math/cc-eighth-grade-math/cc-8th-percent' },
    { t:'MashUp Math – Percent Increase/Decrease', u:'https://www.youtube.com/watch?v=HV0U5i7aP8w' }
  ],
  linear: [
    { t:'Khan Academy – Solving Linear Equations', u:'https://www.khanacademy.org/math/algebra/one-variable-linear-equations' },
    { t:'PatrickJMT – Solving Linear Equations', u:'https://www.youtube.com/watch?v=ZlZP2bFf1zI' }
  ],
  system: [
    { t:'Khan Academy – Systems by elimination', u:'https://www.khanacademy.org/math/algebra/systems-of-linear-equations' },
    { t:'Eddie Woo – Substitution Method', u:'https://www.youtube.com/watch?v=F44CkYJtF9A' }
  ],
  quadratic: [
    { t:'Khan Academy – Quadratic formula', u:'https://www.khanacademy.org/math/algebra/quadratics' },
    { t:'Professor Leonard – Factoring Trinomials', u:'https://www.youtube.com/watch?v=IYB9lZ5o9fY' }
  ],
  derivative: [
    { t:'Khan Academy – Power rule', u:'https://www.khanacademy.org/math/calculus-1/cs1-derivatives' },
    { t:'3Blue1Brown – Essence of calculus', u:'https://www.youtube.com/watch?v=WTYfWf1lcNQ&list=PLZHQObOWTQDNPOjrT6KVlfJuKtYTftqH6' }
  ]
};

function $(id){ return document.getElementById(id); }

function renderTabs(){
  const tabs = $('tabs');
  tabs.innerHTML = '';
  TOPICS.forEach((t,i)=>{
    const b = document.createElement('button');
    b.className = 'tab' + (i===0?' active':'');
    b.textContent = t.label;
    b.onclick = () => selectTab(t.id);
    b.id = 'tab-'+t.id;
    tabs.appendChild(b);
  });
  selectTab(TOPICS[0].id);
}

function renderVideoLinks(topic){
  const box = $('video-links');
  const list = VIDEOS[topic] || [];
  box.innerHTML = list.map(v => `<a target="_blank" rel="noopener" href="${v.u}">• ${v.t}</a>`).join('');
}

// --- Helpers ---
const gcd = (a,b) => { a=Math.abs(a); b=Math.abs(b); while(b){[a,b]=[b,a%b]} return a||1; };
function toFracStr(n, d){
  if(d===0) return 'undefined';
  let sign = (n*d)<0 ? '-' : '';
  n=Math.abs(n); d=Math.abs(d);
  const g = gcd(n,d);
  n/=g; d/=g;
  if(d===1) return sign + n;
  return sign + n + '/' + d;
}
function parseNumber(v){
  const x = parseFloat(String(v).replace(/[^\-0-9.]/g,''));
  if (Number.isNaN(x)) throw new Error('Please enter a valid number.');
  return x;
}
// Render steps utility
function renderSteps(steps){
  const ul = document.createElement('ul'); ul.className='steps';
  steps.forEach(s=>{
    const li = document.createElement('li');
    li.innerHTML = s;
    ul.appendChild(li);
  });
  $('panel').appendChild(ul);
}

// --- Topic Panels ---
function selectTab(id){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  const btn = $('tab-'+id); if(btn) btn.classList.add('active');
  const panel = $('panel'); panel.innerHTML='';

  renderVideoLinks(id);

  switch(id){
    case 'arithmetic': return panelArithmetic();
    case 'fractions': return panelFractions();
    case 'percent': return panelPercent();
    case 'linear': return panelLinear();
    case 'system': return panelSystem();
    case 'quadratic': return panelQuadratic();
    case 'derivative': return panelDerivative();
  }
}

function panelArithmetic(){
  const p = $('panel');
  p.innerHTML = `
    <h3>Arithmetic</h3>
    <p class="muted">Compute with step-by-step long addition, subtraction, multiplication, or division.</p>
    <div class="grid">
      <div>
        <label>Operation</label>
        <select id="arith-op">
          <option value="add">Addition</option>
          <option value="sub">Subtraction</option>
          <option value="mul">Multiplication (long)</option>
          <option value="div">Division (long)</option>
        </select>
      </div>
      <div>
        <label>Numbers (comma-separated, 2–5 terms)</label>
        <input id="arith-nums" placeholder="e.g., 345, 78, 912">
      </div>
    </div>
    <button id="arith-go">Show Steps</button>
  `;
  $('arith-go').onclick = () => {
    try{
      const op = $('arith-op').value;
      const nums = $('arith-nums').value.split(',').map(s=>parseNumber(s.trim()));
      if(nums.length<2 || nums.length>5) throw new Error('Enter 2–5 numbers.');
      const steps = [];
      if(op==='add'){
        let sum = 0, carry = 0, lines = nums.map(n=>String(Math.abs(n)));
        const maxLen = Math.max(...lines.map(s=>s.length));
        const padded = lines.map(s=>s.padStart(maxLen,' '));
        steps.push('Write the numbers stacked by place value:' +
          `<pre>${padded.join('\n')}<br>${'-'.repeat(maxLen)}</pre>`);
        let col = 0, total = 0, result='';
        for(let i=0;i<maxLen;i++){
          total = nums.reduce((acc,n)=> acc + Math.floor(Math.abs(n) / (10**i)) % 10 * (n<0?-1:1), 0) + carry;
          const digit = ((total%10)+10)%10;
          carry = Math.trunc(total/10);
          result = String(digit) + result;
          steps.push(`Column ${i+1}: sum = ${total-carry*10} with carry ${carry}. Write ${digit}.`);
        }
        if(carry) { result = carry + result; steps.push(`Write remaining carry ${carry}.`); }
        const final = nums.reduce((a,b)=>a+b,0);
        steps.push(`<strong>Result:</strong> ${final}`);
        renderSteps(steps);
      } else if(op==='sub'){
        if(nums.length!==2) throw new Error('Enter exactly two numbers for subtraction.');
        const [a,b] = nums;
        steps.push(`Start with ${a} − ${b}.`);
        steps.push('Align by place value and borrow where needed.');
        steps.push(`<strong>Result:</strong> ${a-b}`);
        renderSteps(steps);
      } else if(op==='mul'){
        if(nums.length!==2) throw new Error('Enter exactly two numbers for long multiplication.');
        const [a,b] = nums.map(n=>Math.trunc(n));
        steps.push(`Multiply ${a} × ${b}.`);
        const digits = String(Math.abs(b)).split('').reverse().map(d=>parseInt(d,10));
        const partials = [];
        digits.forEach((d,i)=>{
          const p = a * d * (b<0?-1:1);
          const shifted = p * (10**i);
          partials.push(shifted);
          steps.push(`Partial ${i+1}: ${a} × ${d} with ${'0'.repeat(i)} shift = ${shifted}.`);
        });
        const total = a*b;
        steps.push(`Add partial products: ${partials.join(' + ')} = ${total}.`);
        steps.push(`<strong>Result:</strong> ${total}`);
        renderSteps(steps);
      } else {
        if(nums.length!==2) throw new Error('Enter exactly two numbers for long division.');
        const [a,b] = nums;
        if(b===0) throw new Error('Division by zero is undefined.');
        const q = a/b;
        steps.push(`Divide ${a} ÷ ${b}.`);
        steps.push(`Estimate quotient and subtract multiples of ${b}.`);
        steps.push(`<strong>Result:</strong> ${a} ÷ ${b} = ${q}`);
        renderSteps(steps);
      }
    }catch(e){ alert(e.message); }
  };
}

function panelFractions(){
  const p = $('panel');
  p.innerHTML = `
    <h3>Fractions</h3>
    <div class="grid">
      <div>
        <label>Numerator</label>
        <input id="fn" placeholder="e.g., 84">
      </div>
      <div>
        <label>Denominator</label>
        <input id="fd" placeholder="e.g., 126">
      </div>
    </div>
    <button id="fsimplify">Simplify</button>
  `;
  $('fsimplify').onclick = () => {
    try{
      const n=parseNumber($('fn').value), d=parseNumber($('fd').value);
      const steps=[];
      if(d===0) throw new Error('Denominator cannot be zero.');
      steps.push(`Start with ${n}/${d}.`);
      const g = gcd(n,d);
      steps.push(`Compute gcd(|${n}|, |${d}|) = ${g}.`);
      steps.push(`Divide numerator and denominator by ${g}.`);
      steps.push(`<strong>Result:</strong> ${toFracStr(n,d)}`);
      renderSteps(steps);
    }catch(e){ alert(e.message); }
  };
}

function panelPercent(){
  const p = $('panel');
  p.innerHTML = `
    <h3>Percent</h3>
    <div class="grid">
      <div><label>Type</label>
        <select id="ptype">
          <option value="of">Find P% of N</option>
          <option value="increase">Percent increase</option>
          <option value="decrease">Percent decrease</option>
        </select>
      </div>
      <div><label>Number(s)</label>
        <input id="pnums" placeholder="Examples: 15% of 80  OR  from 60 to 75">
      </div>
    </div>
    <button id="pgo">Show Steps</button>
  `;
  $('pgo').onclick = () => {
    const t = $('ptype').value;
    const steps=[];
    try{
      if(t==='of'){
        const m = $('pnums').value.match(/(\-?\d+(\.\d+)?)\s*%.*?(\-?\d+(\.\d+)?)/);
        if(!m) throw new Error('Use format like "15% of 80".');
        const p = parseFloat(m[1]), n = parseFloat(m[3]);
        steps.push(`Convert ${p}% to decimal: ${p}/100 = ${p/100}.`);
        steps.push(`Multiply by number: (${p/100}) × ${n} = ${(p/100)*n}.`);
        steps.push(`<strong>Result:</strong> ${(p/100)*n}`);
      } else {
        const m = $('pnums').value.match(/from\s*(\-?\d+(\.\d+)?)\s*to\s*(\-?\d+(\.\d+)?)/i);
        if(!m) throw new Error('Use format like "from 60 to 75".');
        const a = parseFloat(m[1]), b = parseFloat(m[3]);
        const diff = b-a;
        const pct = diff/a*100;
        steps.push(`Change = new − old = ${b} − ${a} = ${diff}.`);
        steps.push(`Percent change = (change ÷ old) × 100 = (${diff} ÷ ${a}) × 100 = ${pct}%.`);
        steps.push(`<strong>Result:</strong> ${pct}% (${pct>=0?'increase':'decrease'})`);
      }
      renderSteps(steps);
    }catch(e){ alert(e.message); }
  };
}

function panelLinear(){
  const p = $('panel');
  p.innerHTML = `
    <h3>Linear Equation (ax + b = c)</h3>
    <div class="grid">
      <div><label>a</label><input id="la" placeholder="e.g., 3"></div>
      <div><label>b</label><input id="lb" placeholder="e.g., -7"></div>
      <div><label>c</label><input id="lc" placeholder="e.g., 11"></div>
    </div>
    <button id="lgo">Solve</button>
  `;
  $('lgo').onclick = () => {
    try{
      const a=parseNumber($('la').value), b=parseNumber($('lb').value), c=parseNumber($('lc').value);
      const steps=[];
      steps.push(`Equation: ${a}x + (${b}) = ${c}.`);
      steps.push(`Add ${-b} to both sides: ${a}x = ${c - b}.`);
      if(a===0){
        if(c-b===0) steps.push('<strong>Result:</strong> infinitely many solutions (identity).');
        else steps.push('<strong>Result:</strong> no solution (contradiction).');
      } else {
        steps.push(`Divide both sides by ${a}: x = ${(c-b)/a}.`);
        steps.push(`<strong>Solution:</strong> x = ${(c-b)/a}`);
      }
      renderSteps(steps);
    }catch(e){ alert(e.message); }
  };
}

function panelSystem(){
  const p = $('panel');
  p.innerHTML = `
    <h3>2×2 System (Substitution)</h3>
    <p class="muted">Form: a1x + b1y = c1 and a2x + b2y = c2</p>
    <div class="grid">
      <div><label>a1</label><input id="a1" placeholder="e.g., 2"></div>
      <div><label>b1</label><input id="b1" placeholder="e.g., 3"></div>
      <div><label>c1</label><input id="c1" placeholder="e.g., 7"></div>
      <div><label>a2</label><input id="a2" placeholder="e.g., 1"></div>
      <div><label>b2</label><input id="b2" placeholder="e.g., -4"></div>
      <div><label>c2</label><input id="c2" placeholder="e.g., -1"></div>
    </div>
    <button id="sys-go">Solve</button>
  `;
  $('sys-go').onclick = () => {
    try{
      const A=[parseNumber($('a1').value),parseNumber($('b1').value),parseNumber($('c1').value)];
      const B=[parseNumber($('a2').value),parseNumber($('b2').value),parseNumber($('c2').value)];
      const steps=[];
      steps.push(`System: ${A[0]}x + ${A[1]}y = ${A[2]},  ${B[0]}x + ${B[1]}y = ${B[2]}.`);
      // Solve by elimination
      steps.push('Elimination: make x coefficients equal and subtract.');
      const m1 = B[0], m2 = A[0];
      const A2 = A.map(v=>v*m1), B2 = B.map(v=>v*m2);
      steps.push(`Multiply first eq by ${m1}: ${A2[0]}x + ${A2[1]}y = ${A2[2]}.`);
      steps.push(`Multiply second eq by ${m2}: ${B2[0]}x + ${B2[1]}y = ${B2[2]}.`);
      const Cy = A2[1]-B2[1];
      const Cc = A2[2]-B2[2];
      if(Cy===0){
        if(Cc===0){ steps.push('<strong>Result:</strong> infinitely many solutions (dependent).'); }
        else { steps.push('<strong>Result:</strong> no solution (parallel lines).'); }
      } else {
        const y = Cc/Cy;
        steps.push(`Subtract equations: (${Cy})y = ${Cc} ⇒ y = ${y}.`);
        const x = (A[2] - A[1]*y)/A[0];
        steps.push(`Back-substitute into first eq: x = (c1 − b1·y)/a1 = (${A[2]} − ${A[1]}·${y})/${A[0]} = ${x}.`);
        steps.push(`<strong>Solution:</strong> (x, y) = (${x}, ${y})`);
      }
      renderSteps(steps);
    }catch(e){ alert(e.message); }
  };
}

function panelQuadratic(){
  const p = $('panel');
  p.innerHTML = `
    <h3>Quadratic (ax² + bx + c = 0)</h3>
    <div class="grid">
      <div><label>a</label><input id="qa" placeholder="e.g., 1"></div>
      <div><label>b</label><input id="qb" placeholder="e.g., -3"></div>
      <div><label>c</label><input id="qc" placeholder="e.g., 2"></div>
    </div>
    <button id="qgo">Solve</button>
  `;
  $('qgo').onclick = () => {
    try{
      const a=parseNumber($('qa').value), b=parseNumber($('qb').value), c=parseNumber($('qc').value);
      const steps=[];
      steps.push(`Equation: ${a}x² + ${b}x + ${c} = 0.`);
      // Discriminant
      const D = b*b - 4*a*c;
      steps.push(`Compute discriminant: Δ = b² − 4ac = ${b}² − 4·${a}·${c} = ${D}.`);
      if(a===0){
        steps.push('Since a=0, this is linear.');
        if(b===0){
          if(c===0) steps.push('<strong>Result:</strong> identity (all real numbers).');
          else steps.push('<strong>Result:</strong> no solution.');
        } else {
          steps.push(`x = −c/b = ${-c}/${b} = ${-c/b}.`);
        }
      } else {
        steps.push('Use quadratic formula: x = (−b ± √Δ) / (2a).');
        if(D>0){
          const r1 = (-b + Math.sqrt(D))/(2*a);
          const r2 = (-b - Math.sqrt(D))/(2*a);
          steps.push(`x₁ = (−${b} + √${D}) / (2·${a}) = ${r1}.`);
          steps.push(`x₂ = (−${b} − √${D}) / (2·${a}) = ${r2}.`);
          steps.push(`<strong>Solutions:</strong> x₁ = ${r1}, x₂ = ${r2}`);
        } else if(D===0){
          const r = (-b)/(2*a);
          steps.push(`Since Δ=0, double root: x = ${r}.`);
        } else {
          const re = (-b)/(2*a), im = Math.sqrt(-D)/(2*a);
          steps.push(`Complex roots: x = ${re} ± ${im}i.`);
        }
      }
      renderSteps(steps);
    }catch(e){ alert(e.message); }
  };
}

function panelDerivative(){
  const p = $('panel');
  p.innerHTML = `
    <h3>Derivative of a Polynomial</h3>
    <p class="muted">Enter a polynomial in x (e.g., 3x^4 - 2x^2 + 7x - 5).</p>
    <input id="poly" placeholder="3x^4 - 2x^2 + 7x - 5">
    <button id="dgo">Differentiate</button>
  `;
  $('dgo').onclick = () => {
    try{
      const s = $('poly').value.replace(/\s+/g,'');
      if(!s) throw new Error('Enter a polynomial.');
      const steps=[];
      // Tokenize simple terms like [+/-]ax^n or constant
      const termRe = /([+\-]?)(\d*(?:\.\d+)?)x(?:\^(\-?\d+))?|([+\-]?\d+(?:\.\d+)?)/g;
      let m, terms=[];
      while((m = termRe.exec(s))!==null){
        if(m[4]!==undefined){
          terms.push({a:parseFloat(m[4]), n:0});
        } else {
          const sign = m[1]==='-'?-1:1;
          const a = (m[2]===''||m[2]===undefined)? 1 : parseFloat(m[2]);
          const n = m[3]===undefined?1:parseInt(m[3],10);
          terms.push({a:sign*a, n});
        }
      }
      if(terms.length===0) throw new Error('Could not parse polynomial.');
      steps.push('Apply power rule term-by-term: d/dx (a·xⁿ) = a·n·xⁿ⁻¹; constants → 0.');
      const dterms = [];
      terms.forEach((t,i)=>{
        if(t.n===0){
          steps.push(`${t.a} → 0 (constant).`);
        } else {
          const a = t.a * t.n;
          const n = t.n - 1;
          dterms.push({a,n});
          steps.push(`${t.a}x^${t.n} → ${a}${n!==0?'x^'+n:''}.`);
        }
      });
      if(dterms.length===0){
        steps.push('<strong>Derivative:</strong> 0');
      } else {
        const out = dterms.map((t,i)=>{
          const sign = t.a<0?'-':'+';
          const abs = Math.abs(t.a);
          if(i===0) return `${t.a}${t.n!==0?'x^'+t.n:''}`;
          return ` ${sign} ${abs}${t.n!==0?'x^'+t.n:''}`;
        }).join('');
        steps.push(`<strong>Derivative:</strong> ${out}`);
      }
      renderSteps(steps);
    }catch(e){ alert(e.message); }
  };
}

document.addEventListener('DOMContentLoaded', renderTabs);
