/*
  Devanagari -> Kannada / Telugu / Malayalam / Tamil transliteration engine.
  All mantra content is authored once in Devanagari (source of truth) and
  rendered into every script from this single engine, so every language
  always shows phonetically identical text.
*/
(function (global) {
  "use strict";

  // ---- Devanagari source-side lookup tables (used to tokenize input) ----
  var DEVA_VIRAMA = "्";
  var DEVA_ANUSVARA = "ं";
  var DEVA_VISARGA = "ः";
  var DEVA_AVAGRAHA = "ऽ";
  var DEVA_CHANDRABINDU = "ँ";
  var DEVA_OM = "ॐ";

  var devaConsMap = {
    "क": "k", "ख": "kh", "ग": "g", "घ": "gh", "ङ": "ng",
    "च": "c", "छ": "ch", "ज": "j", "झ": "jh", "ञ": "ny",
    "ट": "tt", "ठ": "tth", "ड": "dd", "ढ": "ddh", "ण": "nn",
    "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n",
    "प": "p", "फ": "ph", "ब": "b", "भ": "bh", "म": "m",
    "य": "y", "र": "r", "ल": "l", "व": "v",
    "श": "sh", "ष": "ss", "स": "s", "ह": "h",
    "ळ": "ll"
  };

  var devaMatraMap = {
    "ा": "aa", "ि": "i", "ी": "ii", "ु": "u", "ू": "uu",
    "ृ": "R", "ॄ": "RR", "ॢ": "L", "ॣ": "LL",
    "े": "e", "ै": "ai", "ो": "o", "ौ": "au"
  };

  var devaVowelIndMap = {
    "अ": "a", "आ": "aa", "इ": "i", "ई": "ii",
    "उ": "u", "ऊ": "uu", "ऋ": "R", "ॠ": "RR",
    "ऌ": "L", "ॡ": "LL", "ए": "e", "ऐ": "ai",
    "ओ": "o", "औ": "au"
  };

  var devaDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

  // ---- Target script tables ----
  // cons keys mirror devaConsMap values above.
  var SCRIPTS = {
    sa: null, // Sanskrit == pass-through Devanagari, handled specially
    kn: {
      vInd: { a: "ಅ", aa: "ಆ", i: "ಇ", ii: "ಈ", u: "ಉ", uu: "ಊ", R: "ಋ", RR: "ೠ", L: "ಌ", LL: "ೡ", e: "ಏ", ai: "ಐ", o: "ಓ", au: "ಔ" },
      vMatra: { aa: "ಾ", i: "ಿ", ii: "ೀ", u: "ು", uu: "ೂ", R: "ೃ", RR: "ೄ", e: "ೇ", ai: "ೈ", o: "ೋ", au: "ೌ" },
      anusvara: "ಂ", visarga: "ಃ", avagraha: "ಽ", chandra: "ಂ",
      cons: { k: "ಕ", kh: "ಖ", g: "ಗ", gh: "ಘ", ng: "ಙ", c: "ಚ", ch: "ಛ", j: "ಜ", jh: "ಝ", ny: "ಞ", tt: "ಟ", tth: "ಠ", dd: "ಡ", ddh: "ಢ", nn: "ಣ", t: "ತ", th: "ಥ", d: "ದ", dh: "ಧ", n: "ನ", p: "ಪ", ph: "ಫ", b: "ಬ", bh: "ಭ", m: "ಮ", y: "ಯ", r: "ರ", l: "ಲ", v: "ವ", sh: "ಶ", ss: "ಷ", s: "ಸ", h: "ಹ", ll: "ಳ" },
      virama: "್",
      digits: ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯"],
      om: null
    },
    te: {
      vInd: { a: "అ", aa: "ఆ", i: "ఇ", ii: "ఈ", u: "ఉ", uu: "ఊ", R: "ఋ", RR: "ౠ", L: "ఌ", LL: "ౡ", e: "ఏ", ai: "ఐ", o: "ఓ", au: "ఔ" },
      vMatra: { aa: "ా", i: "ి", ii: "ీ", u: "ు", uu: "ూ", R: "ృ", RR: "ౄ", e: "ే", ai: "ై", o: "ో", au: "ౌ" },
      anusvara: "ం", visarga: "ః", avagraha: "ఽ", chandra: "ం",
      cons: { k: "క", kh: "ఖ", g: "గ", gh: "ఘ", ng: "ఙ", c: "చ", ch: "ఛ", j: "జ", jh: "ఝ", ny: "ఞ", tt: "ట", tth: "ఠ", dd: "డ", ddh: "ఢ", nn: "ణ", t: "త", th: "థ", d: "ద", dh: "ధ", n: "న", p: "ప", ph: "ఫ", b: "బ", bh: "భ", m: "మ", y: "య", r: "ర", l: "ల", v: "వ", sh: "శ", ss: "ష", s: "స", h: "హ", ll: "ళ" },
      virama: "్",
      digits: ["౦", "౧", "౨", "౩", "౪", "౫", "౬", "౭", "౮", "౯"],
      om: null
    },
    ml: {
      vInd: { a: "അ", aa: "ആ", i: "ഇ", ii: "ഈ", u: "ഉ", uu: "ഊ", R: "ഋ", RR: "ൠ", L: "ഌ", LL: "ൡ", e: "ഏ", ai: "ഐ", o: "ഓ", au: "ഔ" },
      vMatra: { aa: "ാ", i: "ി", ii: "ീ", u: "ു", uu: "ൂ", R: "ൃ", RR: "ൄ", e: "േ", ai: "ൈ", o: "ോ", au: "ൌ" },
      anusvara: "ം", visarga: "ഃ", avagraha: "ഽ", chandra: "ം",
      cons: { k: "ക", kh: "ഖ", g: "ഗ", gh: "ഘ", ng: "ങ", c: "ച", ch: "ഛ", j: "ജ", jh: "ഝ", ny: "ഞ", tt: "ട", tth: "ഠ", dd: "ഡ", ddh: "ഢ", nn: "ണ", t: "ത", th: "ഥ", d: "ദ", dh: "ധ", n: "ന", p: "പ", ph: "ഫ", b: "ബ", bh: "ഭ", m: "മ", y: "യ", r: "ര", l: "ല", v: "വ", sh: "ശ", ss: "ഷ", s: "സ", h: "ഹ", ll: "ള" },
      virama: "്",
      digits: ["൦", "൧", "൨", "൩", "൪", "൫", "൬", "൭", "൮", "൯"],
      om: null
    },
    ta: {
      // Tamil uses the Grantha-extended letters (ஶ ஷ ஸ ஹ) that are
      // standard in printed Tamil devotional literature for Sanskrit sounds Tamil
      // itself lacks. Aspirated/voiced consonant pairs collapse onto their single
      // Tamil letter, as is universal convention (e.g. க stands for k/kh/g/gh).
      vInd: { a: "அ", aa: "ஆ", i: "இ", ii: "ஈ", u: "உ", uu: "ஊ", e: "ஏ", ai: "ஐ", o: "ஓ", au: "ஔ" }, // R,RR,L,LL absent -> special-cased
      vMatra: { aa: "ா", i: "ி", ii: "ீ", u: "ு", uu: "ூ", e: "ே", ai: "ை", o: "ோ", au: "ௌ" }, // R,RR,L,LL absent -> special-cased
      anusvara: "ம்", visarga: "ஃ", avagraha: "அ", chandra: "ம்",
      cons: { k: "க", kh: "க", g: "க", gh: "க", ng: "ங", c: "ச", ch: "ச", j: "ஜ", jh: "ஜ", ny: "ஞ", tt: "ட", tth: "ட", dd: "ட", ddh: "ட", nn: "ண", t: "த", th: "த", d: "த", dh: "த", n: "ந", p: "ப", ph: "ப", b: "ப", bh: "ப", m: "ம", y: "ய", r: "ர", l: "ல", v: "வ", sh: "ஶ", ss: "ஷ", s: "ஸ", h: "ஹ", ll: "ள" },
      virama: "்",
      digits: ["௦", "௧", "௨", "௩", "௪", "௫", "௬", "௭", "௮", "௯"],
      om: "ௐ",
      // Tamil approximation for vocalic r/rr/l/ll, which the script does not have:
      // consonant + short-i matra, followed by a separate ர/ல +ு (ra/la + u).
      vocalicApprox: {
        R: { matraSuffix: "ி", extra: "ரு" },   // -ரு
        RR: { matraSuffix: "ி", extra: "ரூ" },  // -ரூ
        L: { matraSuffix: "ி", extra: "லு" },   // -லு
        LL: { matraSuffix: "ி", extra: "லூ" }   // -லூ
      },
      vocalicIndepApprox: { R: "ரி", RR: "ரீ", L: "லி", LL: "லீ" }, // ரி ரீ லி லீ
      // Tamil has no dedicated anusvara letter; traditional convention
      // assimilates it to the nasal matching the class of the following
      // consonant (e.g. "ங்" before a guttural, not always "ம்").
      anusvaraClassMap: {
        k: "ங்", kh: "ங்", g: "ங்", gh: "ங்", ng: "ங்",
        c: "ஞ்", ch: "ஞ்", j: "ஞ்", jh: "ஞ்", ny: "ஞ்",
        tt: "ண்", tth: "ண்", dd: "ண்", ddh: "ண்", nn: "ண்",
        t: "ந்", th: "ந்", d: "ந்", dh: "ந்", n: "ந்",
        p: "ம்", ph: "ம்", b: "ம்", bh: "ம்", m: "ம்"
      }
    }
  };

  // Correct OM glyphs (assigned after object literals above to avoid clutter)
  SCRIPTS.kn.om = "ಓಂ";   // ಓಂ
  SCRIPTS.te.om = "ఓం";   // ఓం
  SCRIPTS.ml.om = "ഓം";   // ഓം

  function isDevaConsonant(ch) { return Object.prototype.hasOwnProperty.call(devaConsMap, ch); }
  function isDevaMatra(ch) { return Object.prototype.hasOwnProperty.call(devaMatraMap, ch); }
  function isDevaIndepVowel(ch) { return Object.prototype.hasOwnProperty.call(devaVowelIndMap, ch); }
  function digitIndex(ch) { return devaDigits.indexOf(ch); }

  function transliterate(text, target) {
    if (!text) return "";
    if (target === "sa" || !SCRIPTS[target]) return text;
    var t = SCRIPTS[target];
    var out = [];
    var i = 0;
    var len = text.length;
    while (i < len) {
      var ch = text[i];
      if (isDevaConsonant(ch)) {
        var key = devaConsMap[ch];
        var consTarget = t.cons[key];
        var next = text[i + 1];
        if (next === DEVA_VIRAMA) {
          out.push(consTarget + t.virama);
          i += 2;
          continue;
        } else if (next && isDevaMatra(next)) {
          var mkey = devaMatraMap[next];
          if (t.vocalicApprox && t.vocalicApprox[mkey]) {
            var approx = t.vocalicApprox[mkey];
            out.push(consTarget + approx.matraSuffix + approx.extra);
          } else {
            out.push(consTarget + t.vMatra[mkey]);
          }
          i += 2;
          continue;
        } else {
          out.push(consTarget);
          i += 1;
          continue;
        }
      } else if (isDevaIndepVowel(ch)) {
        var vkey = devaVowelIndMap[ch];
        if (t.vocalicIndepApprox && t.vocalicIndepApprox[vkey]) {
          out.push(t.vocalicIndepApprox[vkey]);
        } else {
          out.push(t.vInd[vkey]);
        }
        i += 1;
      } else if (ch === DEVA_ANUSVARA) {
        var nextConsKey = text[i + 1] && isDevaConsonant(text[i + 1]) ? devaConsMap[text[i + 1]] : null;
        out.push((t.anusvaraClassMap && nextConsKey && t.anusvaraClassMap[nextConsKey]) || t.anusvara);
        i += 1;
      } else if (ch === DEVA_VISARGA) {
        out.push(t.visarga); i += 1;
      } else if (ch === DEVA_AVAGRAHA) {
        out.push(t.avagraha); i += 1;
      } else if (ch === DEVA_CHANDRABINDU) {
        out.push(t.chandra || t.anusvara); i += 1;
      } else if (ch === DEVA_OM) {
        out.push(t.om); i += 1;
      } else if (digitIndex(ch) !== -1) {
        // Modern convention: keep plain Arabic numerals (0-9) across every
        // script rather than native-script digit glyphs, which most readers
        // find unfamiliar in everyday text (e.g. "108" not native digits).
        out.push(String(digitIndex(ch))); i += 1;
      } else {
        out.push(ch); i += 1;
      }
    }
    return out.join("");
  }

  global.MantraTransliterate = transliterate;
})(window);
