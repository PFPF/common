// Complex numbers are represented in the form [r, phi/pi], where r >= 0 and the second entry is in (-1, 1].
// For example, 0 = [0,0], -0 = [0,1], ComplexZero = [0,NaN], i = [1,0.5], -i = [1,-0.5], 0i = [0,0.5]
// Infinity = [Infinity,0], -Infinity = [Infinity,1], ComplexInfinity = [Infinity, NaN]

const vals = {
  "1": [1,0],
  "2": [2,0],
  "-1": [1,1], // which denotes 1*e^(1pi*i). [1,-1], [-1,0] are NOT allowed
  "-2": [2,1],
  "0": [0,0], // this is the limit 0^+, as in js
  "-0": [0,1], // this is the limit 0^-, as in js
  "i": [1,0.5], // the thing
  "1+i": [Math.sqrt(2), 0.25],
  "0i": [0,0.5], // this is the limit 0^+ * i. Can be obtained by sqrt(-0)
  "C0": [0,NaN], // this is the generic complex zero (i.e. we know the modulus but not the argument)
  "Inf": [Infinity,0], // reciprocal of +0
  "-Inf": [Infinity,1], // reciprocal of -0
  "Inf*i": [Infinity, 0.5], // reciprocal of 0i. Can be obtained by sqrt(-Inf). Similarly, there can be Inf*(1+i) := sqrt(sqrt(-Inf)) etc
  "CInf": [Infinity,NaN], // the generic complex infinity, the reciprocal of C0
  "NaN": [NaN,NaN], // one can argue that 1^Inf should be [NaN,0], but I thought if I allow [NaN,0] I'd also allow [NaN, anything]. So I'll use the same value.
};
// Totality pow check
Object.keys(vals).forEach(a => Object.keys(vals).forEach(b => console.log(a + " ^ " + b + " = (" + pow(vals[a], vals[b]) + ")")));

function assert(truth, desc) { if(truth) console.log(desc); else throw ("Assertion failed: " + desc); }
function aae(arr1, arr2, desc) { assert(arr1.length === arr2.length && arr1.every((v, i) => v === arr2[i] || isNaN(v) && isNaN(arr2[i])), desc); } // asserts arrays equal

// normalize: normalizes an arbitrary angle into (-1, 1]
function normalize(t) {
  return ((t + 1) % 2 - 2) % 2 - t + 1 + t; // <=> t + 2 * Math.floor((1 - t) / 2) but faster (if removing -t+t, will be slightly inaccurate for -0.1)
}

// pow
/* examples: 
aae(pow([1,0.5],[2,0]), [1,1], "i^2 = -1");
aae(pow([0,0],[Infinity,0]), [0,0], "0^Infty = 0");
aae(pow([0.8,0.5],[Infinity,0]), [0,NaN], "(0.8i)^Infty = Complex0");
aae(pow([0,0.5],[2,1]), [Infinity,1], "(0i)^-2 = -Infty");
aae(pow([Infinity,NaN],[Infinity,1]), [0,NaN], "ComplexInfty^-Infty = Complex0");
*/
function pow([r,t],[s,b]) {
  if(s == 0) return [1, 0]; // yes even if all other three are NaN
  let pi = Math.PI, bmpi = (b == 0 || b == 1) && (1 - 2 * b), bdhp = (b == 0.5 || b == -0.5) && 2 * b, logr = Math.log(r), tpi = t * pi, bpi = b * pi, 
      sbpi = !bmpi && (bdhp || Math.sin(bpi)), cbpi = bmpi || (!bdhp && Math.cos(bpi));
  let mag = sbpi != 0 && r == 0? NaN : Math.exp(s * (cbpi * logr - (sbpi && sbpi * tpi)));
  let ang = sbpi == 0 && tpi == 0 && logr != 0? 0 : (cbpi * tpi + (sbpi && sbpi * logr)) * s / pi;
  return [mag, normalize(ang)];
}

function multiply([r,t],[s,b]) {
  return [r * s, normalize(t + b)];
}

function sqrt([r,t]) {
  return [Math.sqrt(r), t / 2];
}

function abs([r,t]) {
  return [r, 0];
}

function sign([r,t]) {
  return [r && 1, t];
}

function unaryMinus([r,t]) {
  return [r, t == 1? t : -t];
}

function reciprocal([r,t]) {
  return [1/r, t == 1? t : -t];
}
