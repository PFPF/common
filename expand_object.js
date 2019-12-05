// Expands a javascript object to its entirety as a string
// n: current depth, max: max depth, prepend: string prepended to front
// forbid: attr names to disallow, prependFn: how to determine the deeper prepend
function _expand_object(obj, max, forbid, prependFn, n, prepend) {
  let leadingSpaces = Array(prepend.search(/\S|$/) + 1).join(' ');
  let out = "";
  for(let prop in obj) {
    var found = false;
    for(let nono of forbid) if(prop.search(nono) != -1) {found = true; break;}
    if(found) continue;
    
    out += prepend + prop + ": " ;
    let val = obj[prop];
    if(typeof(val) == 'object') {
      if(max >= 0 && n >= max) out += "[Too far]";
      else out += "{\n" + _expand_object(val, max, forbid, prependFn, n+1, prependFn(prop, prepend)) + leadingSpaces + "}";
    }
    else out += val;
    out += "\n";
  }
  return out;
}
var tab = n => (s, p) => p + Array(n + 1).join(' '); 
var fulltrace = delimiter => (s, p) => " " + p + s + delimiter;
// when maxDepth is -1, there'd be no limit in recursion (watch out for circlar references).
function expand_object(obj, maxDepth, forbid, prependFn) {
  return _expand_object(obj, maxDepth, forbid, prependFn, 0, "");
}



// Examples

var sampleObj = {attr1: 111, attr2: {attr1: 123, attr2: {attr1: {attr1: 0}}, attrBad: 666}, attrBad: 777};

console.log(expand_object(sampleObj, -1, [], tab(3)));
/*
attr1: 111
attr2: {
   attr1: 123
   attr2: {
      attr1: {
         attr1: 0
      }
   }
   attrBad: 666
}
attrBad: 777
*/

console.log(expand_object(sampleObj, -1, [], fulltrace(".")));
/*
attr1: 111
attr2: {
 attr2.attr1: 123
 attr2.attr2: {
  attr2.attr2.attr1: {
   attr2.attr2.attr1.attr1: 0
  }
 }
 attr2.attrBad: 666
}
attrBad: 777
*/

console.log(expand_object(sampleObj, 2, ["Bad"], tab(4)));
/*
attr1: 111
attr2: {
    attr1: 123
    attr2: {
        attr1: [Too far]
    }
}
*/

expand_object(this, 2, [], tab(3))
/* (Something 5.8 MB long) */
