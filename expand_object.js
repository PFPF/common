// Expands a javascript object to its entirety as a string
// n: current depth, max: max depth, prepend: string prepended to front
// forbid: attr names to disallow, prependFn: how to determine the deeper prepend
function show_helper(obj, n, max, prepend, forbid, prependFn) {
  let leadingSpaces = Array(prepend.search(/\S|$/) + 1).join(' ');
  let out = "";
  for(let prop in obj) {
    var found = false;
    for(let nono of forbid) if(prop.search(nono) != -1) {found = true; break;}
    if(found) continue;
    
    out += prepend + prop + ": " ;
    let val = obj[prop];
    if(typeof(val) == 'object') {
      if(n >= max) out += "(Too far)";
      else out += "{\n" + show_helper(val, n+1, max, prependFn(prop, prepend), forbid, prependFn) + leadingSpaces + "}";
    }
    else out += val;
    out += "\n";
  }
  return out;
}
function tab(n) { return (s, p) => p + Array(n + 1).join(' '); }
function fulltrace(delimiter) { return (s, p) => " " + p + s + delimiter; }
function expand_object(obj, max, forbid, prependFn) {
  return show_helper(obj, 0, max, "", forbid, prependFn);
}


var sampleObj = {attr1: 111, attr2: {attr1: 123, attr2: {attr1: {attr1: 0}}, attrBad: 666}, attrBad: 777};

console.log(expand_object(sampleObj, 10, [], tab(3)));
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

console.log(expand_object(sampleObj, 10, [], fulltrace(".")));
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
        attr1: (Too far)
    }
}
*/

