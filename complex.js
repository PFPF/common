// Complex numbers are represented in the form [r, phi/pi], where r >= 0 and the second entry is in (-1, 1].
// For example, 0 = [0,0], -0 = [0,1], ComplexZero = [0,NaN], i = [1,0.5], -i = [1,-0.5], 0i = [0,0.5]
// Infinity = [Infinity,0], -Infinity = [Infinity,1], ComplexInfinity = [Infinity, NaN]
// Then it's pretty clear that only ComplexZero, ComplexInfinity and NaN are negations of themselves

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
// Totality pow check code
// Object.keys(vals).forEach(a => Object.keys(vals).forEach(b => console.log(a + " ^ " + b + " = (" + pow(vals[a], vals[b]) + ")")));


// pow
function pow([r,t],[s,b]) {
  if(s == 0) return [1, 0]; // yes even if all other three are NaN
  let pi = Math.PI, logr = Math.log(r), tpi = t * pi, [sbpi, cbpi] = _sincospi(b); // sbpi, cbpi := sin and cos of b*pi
  let mag = sbpi != 0 && r == 0? NaN : Math.exp(s * (cbpi * logr - (sbpi && sbpi * tpi)));
  let ang = sbpi == 0 && tpi == 0 && logr != 0? 0 : (cbpi * tpi + (sbpi && sbpi * logr)) * s / pi;
  return [mag, normalize(ang)];
}

function multiply([r,t],[s,b]) {
  return [r * s, normalize(t + b)];
}

function sqrt([r,t]) { // equivalent to pow([r,t], [0.5,0]), but simplifies exp(0.5log(r)) to sqrt(r) and t*pi*0.5/pi to t/2
  return [Math.sqrt(r), t / 2];
}

function abs([r,t]) {
  return [r, 0];
}

function sign([r,t]) { // abs(z) * sign(z) == z
  return [r && 1, t];
}

function unaryMinus([r,t]) { // equivalent to multiply([r,t], [1,1])
  return [r, normalize(t + 1)];
}

function reciprocal([r,t]) { // equivalent to pow([r,t], [1,1]), but simplifies exp(-log(r)) to 1/r and -1*(t*pi)/pi to -t
  return [1/r, t == 1? t : -t];
}

function divide([r,t],[s,b]) {
  return multiply([r,t], reciprocal([s,b]));
}

function add([r,t],[s,b]) {
  let rinf = r == Infinity, sinf = s == Infinity;
  if(t == b) return [r+s, t];
  if(rinf) {
    if(sinf) {
      if(t - b == 1 || b - t == 1) return [NaN,NaN];
      else return [Infinity, NaN];
    } else return [r,t];
  } else {
    if(sinf) return [s,b];
    else {
      let [x1,y1] = toRect([r,t]), [x2,y2] = toRect([s,b]);
      return fromRect([x1+x2, y1+y2]);
    }
  }
}

function toRect([r,t]) { // 0, -0, 0i, C0 becomes the same, DONT call Infinities on this
  let [stpi, ctpi] = _sincospi(t);
  return [r * ctpi, r * stpi];
}
function fromRect([x,y]) { // x and y must be finite; [0,0] => [0,0] (Comp0); [+/-Inf, 0] => [Inf, 0 or 1]; [Inf, +/-Inf] => CompInf
  if(x !== x || y !== y) return [NaN, NaN];
  if(x == 0) {
    return y == 0? [0, NaN] : (y > 0? [y, 0.5] : [-y, -0.5]);
  } else if(y == 0) {
    return x > 0? [x, 0] : [-x, 1];
  }
  let modulus = Math.sqrt(x * x + y * y), absAng = Math.acos(x / modulus) / Math.PI;
  return [modulus, y < 0 && absAng != 1? -absAng : absAng];
}


// normalize: normalizes an arbitrary angle into (-1, 1]
function normalize(t) {
  return ((t + 1) % 2 - 2) % 2 - t + 1 + t; // <=> t + 2 * Math.floor((1 - t) / 2) but faster (if removing -t+t, will be slightly inaccurate for -0.1)
}
function _sincospi(t) {
  // returns [sin(t*pi), cos(t*pi)]. t is in (-1,1]
  let cvo0 = (t == 0 || t == 1) && (1 - 2 * t), svo0 = (t == 0.5 || t == -0.5) && 2 * t, tpi = t * Math.PI;
  return [!cvo0 && (svo0 || Math.sin(tpi)), cvo0 || (!svo0 && Math.cos(tpi))];
}













/*
0 ^ 0 = (1,0)
0 ^ 1 = (0,0)
0 ^ 2 = (0,0)
0 ^ -1 = (Infinity,0)
0 ^ -2 = (Infinity,0)
0 ^ -0 = (1,0)
0 ^ i = (NaN,NaN)
0 ^ 1+i = (NaN,NaN)
0 ^ 0i = (1,0)
0 ^ C0 = (1,0)
0 ^ Inf = (0,0)
0 ^ -Inf = (Infinity,0)
0 ^ Inf*i = (NaN,NaN)
0 ^ CInf = (NaN,NaN)
0 ^ NaN = (NaN,NaN)
1 ^ 0 = (1,0)
1 ^ 1 = (1,0)
1 ^ 2 = (1,0)
1 ^ -1 = (1,0)
1 ^ -2 = (1,0)
1 ^ -0 = (1,0)
1 ^ i = (1,0)
1 ^ 1+i = (1,0)
1 ^ 0i = (1,0)
1 ^ C0 = (1,0)
1 ^ Inf = (NaN,NaN)
1 ^ -Inf = (NaN,NaN)
1 ^ Inf*i = (NaN,NaN)
1 ^ CInf = (NaN,NaN)
1 ^ NaN = (NaN,NaN)
2 ^ 0 = (1,0)
2 ^ 1 = (2,0)
2 ^ 2 = (4,0)
2 ^ -1 = (0.5,0)
2 ^ -2 = (0.25,0)
2 ^ -0 = (1,0)
2 ^ i = (1,0.2206356001526517)
2 ^ 1+i = (2,0.22063560015265174)
2 ^ 0i = (1,0)
2 ^ C0 = (1,0)
2 ^ Inf = (Infinity,0)
2 ^ -Inf = (0,0)
2 ^ Inf*i = (NaN,NaN)
2 ^ CInf = (NaN,NaN)
2 ^ NaN = (NaN,NaN)
-1 ^ 0 = (1,0)
-1 ^ 1 = (1,1)
-1 ^ 2 = (1,0)
-1 ^ -1 = (1,1)
-1 ^ -2 = (1,0)
-1 ^ -0 = (1,0)
-1 ^ i = (0.04321391826377226,0)
-1 ^ 1+i = (0.04321391826377224,1)
-1 ^ 0i = (1,0)
-1 ^ C0 = (1,0)
-1 ^ Inf = (NaN,NaN)
-1 ^ -Inf = (NaN,NaN)
-1 ^ Inf*i = (0,NaN)
-1 ^ CInf = (NaN,NaN)
-1 ^ NaN = (NaN,NaN)
-2 ^ 0 = (1,0)
-2 ^ 1 = (2,1)
-2 ^ 2 = (4,0)
-2 ^ -1 = (0.5,1)
-2 ^ -2 = (0.25,0)
-2 ^ -0 = (1,0)
-2 ^ i = (0.04321391826377226,0.2206356001526517)
-2 ^ 1+i = (0.08642783652754452,-0.7793643998473483)
-2 ^ 0i = (1,0)
-2 ^ C0 = (1,0)
-2 ^ Inf = (Infinity,NaN)
-2 ^ -Inf = (0,NaN)
-2 ^ Inf*i = (0,NaN)
-2 ^ CInf = (NaN,NaN)
-2 ^ NaN = (NaN,NaN)
-0 ^ 0 = (1,0)
-0 ^ 1 = (0,1)
-0 ^ 2 = (0,0)
-0 ^ -1 = (Infinity,1)
-0 ^ -2 = (Infinity,0)
-0 ^ -0 = (1,0)
-0 ^ i = (NaN,NaN)
-0 ^ 1+i = (NaN,NaN)
-0 ^ 0i = (1,0)
-0 ^ C0 = (1,0)
-0 ^ Inf = (0,NaN)
-0 ^ -Inf = (Infinity,NaN)
-0 ^ Inf*i = (NaN,NaN)
-0 ^ CInf = (NaN,NaN)
-0 ^ NaN = (NaN,NaN)
i ^ 0 = (1,0)
i ^ 1 = (1,0.5)
i ^ 2 = (1,1)
i ^ -1 = (1,-0.5)
i ^ -2 = (1,1)
i ^ -0 = (1,0)
i ^ i = (0.20787957635076193,0)
i ^ 1+i = (0.20787957635076187,0.5000000000000001)
i ^ 0i = (1,0)
i ^ C0 = (1,0)
i ^ Inf = (NaN,NaN)
i ^ -Inf = (NaN,NaN)
i ^ Inf*i = (0,NaN)
i ^ CInf = (NaN,NaN)
i ^ NaN = (NaN,NaN)
1+i ^ 0 = (1,0)
1+i ^ 1 = (1.4142135623730951,0.25)
1+i ^ 2 = (2,0.5)
1+i ^ -1 = (0.7071067811865475,-0.25)
1+i ^ -2 = (0.49999999999999994,-0.5)
1+i ^ -0 = (1,0)
1+i ^ i = (0.45593812776599624,0.11031780007632581)
1+i ^ 1+i = (0.644793883889669,0.3603178000763258)
1+i ^ 0i = (1,0)
1+i ^ C0 = (1,0)
1+i ^ Inf = (Infinity,NaN)
1+i ^ -Inf = (0,NaN)
1+i ^ Inf*i = (0,NaN)
1+i ^ CInf = (NaN,NaN)
1+i ^ NaN = (NaN,NaN)
0i ^ 0 = (1,0)
0i ^ 1 = (0,0.5)
0i ^ 2 = (0,1)
0i ^ -1 = (Infinity,-0.5)
0i ^ -2 = (Infinity,1)
0i ^ -0 = (1,0)
0i ^ i = (NaN,NaN)
0i ^ 1+i = (NaN,NaN)
0i ^ 0i = (1,0)
0i ^ C0 = (1,0)
0i ^ Inf = (0,NaN)
0i ^ -Inf = (Infinity,NaN)
0i ^ Inf*i = (NaN,NaN)
0i ^ CInf = (NaN,NaN)
0i ^ NaN = (NaN,NaN)
C0 ^ 0 = (1,0)
C0 ^ 1 = (0,NaN)
C0 ^ 2 = (0,NaN)
C0 ^ -1 = (Infinity,NaN)
C0 ^ -2 = (Infinity,NaN)
C0 ^ -0 = (1,0)
C0 ^ i = (NaN,NaN)
C0 ^ 1+i = (NaN,NaN)
C0 ^ 0i = (1,0)
C0 ^ C0 = (1,0)
C0 ^ Inf = (0,NaN)
C0 ^ -Inf = (Infinity,NaN)
C0 ^ Inf*i = (NaN,NaN)
C0 ^ CInf = (NaN,NaN)
C0 ^ NaN = (NaN,NaN)
Inf ^ 0 = (1,0)
Inf ^ 1 = (Infinity,0)
Inf ^ 2 = (Infinity,0)
Inf ^ -1 = (0,0)
Inf ^ -2 = (0,0)
Inf ^ -0 = (1,0)
Inf ^ i = (NaN,NaN)
Inf ^ 1+i = (Infinity,NaN)
Inf ^ 0i = (1,0)
Inf ^ C0 = (1,0)
Inf ^ Inf = (Infinity,0)
Inf ^ -Inf = (0,0)
Inf ^ Inf*i = (NaN,NaN)
Inf ^ CInf = (NaN,NaN)
Inf ^ NaN = (NaN,NaN)
-Inf ^ 0 = (1,0)
-Inf ^ 1 = (Infinity,1)
-Inf ^ 2 = (Infinity,0)
-Inf ^ -1 = (0,1)
-Inf ^ -2 = (0,0)
-Inf ^ -0 = (1,0)
-Inf ^ i = (NaN,NaN)
-Inf ^ 1+i = (Infinity,NaN)
-Inf ^ 0i = (1,0)
-Inf ^ C0 = (1,0)
-Inf ^ Inf = (Infinity,NaN)
-Inf ^ -Inf = (0,NaN)
-Inf ^ Inf*i = (NaN,NaN)
-Inf ^ CInf = (NaN,NaN)
-Inf ^ NaN = (NaN,NaN)
Inf*i ^ 0 = (1,0)
Inf*i ^ 1 = (Infinity,0.5)
Inf*i ^ 2 = (Infinity,1)
Inf*i ^ -1 = (0,-0.5)
Inf*i ^ -2 = (0,1)
Inf*i ^ -0 = (1,0)
Inf*i ^ i = (NaN,NaN)
Inf*i ^ 1+i = (Infinity,NaN)
Inf*i ^ 0i = (1,0)
Inf*i ^ C0 = (1,0)
Inf*i ^ Inf = (Infinity,NaN)
Inf*i ^ -Inf = (0,NaN)
Inf*i ^ Inf*i = (NaN,NaN)
Inf*i ^ CInf = (NaN,NaN)
Inf*i ^ NaN = (NaN,NaN)
CInf ^ 0 = (1,0)
CInf ^ 1 = (Infinity,NaN)
CInf ^ 2 = (Infinity,NaN)
CInf ^ -1 = (0,NaN)
CInf ^ -2 = (0,NaN)
CInf ^ -0 = (1,0)
CInf ^ i = (NaN,NaN)
CInf ^ 1+i = (NaN,NaN)
CInf ^ 0i = (1,0)
CInf ^ C0 = (1,0)
CInf ^ Inf = (Infinity,NaN)
CInf ^ -Inf = (0,NaN)
CInf ^ Inf*i = (NaN,NaN)
CInf ^ CInf = (NaN,NaN)
CInf ^ NaN = (NaN,NaN)
NaN ^ 0 = (1,0)
NaN ^ 1 = (NaN,NaN)
NaN ^ 2 = (NaN,NaN)
NaN ^ -1 = (NaN,NaN)
NaN ^ -2 = (NaN,NaN)
NaN ^ -0 = (1,0)
NaN ^ i = (NaN,NaN)
NaN ^ 1+i = (NaN,NaN)
NaN ^ 0i = (1,0)
NaN ^ C0 = (1,0)
NaN ^ Inf = (NaN,NaN)
NaN ^ -Inf = (NaN,NaN)
NaN ^ Inf*i = (NaN,NaN)
NaN ^ CInf = (NaN,NaN)
NaN ^ NaN = (NaN,NaN)
*/
