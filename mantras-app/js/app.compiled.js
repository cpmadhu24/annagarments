const {
  useState,
  useEffect,
  useMemo,
  useRef
} = React;
const {
  LANGS,
  UI,
  CATS,
  DEITIES
} = window.MantraContent;
const translit = window.MantraTransliterate;
function tr(devaText, lang) {
  if (!devaText) return "";
  return translit(devaText, lang === "sa" ? "sa" : lang);
}
function pick(obj, lang) {
  if (!obj) return "";
  return obj[lang] || obj.kn || "";
}
function loadJSON(key, fallback) {
  try {
    var v = JSON.parse(localStorage.getItem(key));
    return v == null ? fallback : v;
  } catch (e) {
    return fallback;
  }
}
function LangSlider({
  lang,
  setLang
}) {
  var wrapRef = useRef(null);
  var idx = LANGS.findIndex(function (l) {
    return l.code === lang;
  });
  var [thumb, setThumb] = useState({
    left: 0,
    width: 0
  });
  useEffect(function () {
    var wrap = wrapRef.current;
    if (!wrap) return;
    var btn = wrap.querySelectorAll("button")[idx];
    if (btn) {
      setThumb({
        left: btn.offsetLeft,
        width: btn.offsetWidth
      });
      btn.scrollIntoView({
        inline: "center",
        block: "nearest",
        behavior: "smooth"
      });
    }
  }, [lang]);
  return /*#__PURE__*/React.createElement("div", {
    className: "lang-slider",
    ref: wrapRef
  }, /*#__PURE__*/React.createElement("div", {
    className: "thumb",
    style: {
      transform: "translateX(" + thumb.left + "px)",
      width: thumb.width + "px"
    }
  }), LANGS.map(function (l) {
    return /*#__PURE__*/React.createElement("button", {
      key: l.code,
      className: l.code === lang ? "active" : "",
      onClick: function () {
        setLang(l.code);
      },
      lang: l.code
    }, l.label);
  }));
}
function SearchIcon() {
  return /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fdf6ec",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "7"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "21",
    y1: "21",
    x2: "16.65",
    y2: "16.65"
  }));
}
function useFavorites() {
  var [favs, setFavs] = useState(function () {
    return loadJSON("mm_favs", []);
  });
  useEffect(function () {
    localStorage.setItem("mm_favs", JSON.stringify(favs));
  }, [favs]);
  function toggle(id) {
    setFavs(function (prev) {
      return prev.indexOf(id) === -1 ? prev.concat([id]) : prev.filter(function (x) {
        return x !== id;
      });
    });
  }
  return [favs, toggle];
}
function DeityCard({
  deity,
  lang,
  favs,
  toggleFav,
  onOpen
}) {
  var isFav = favs.indexOf(deity.id) !== -1;
  return /*#__PURE__*/React.createElement("div", {
    className: "deity-card",
    onClick: function () {
      onOpen(deity.id);
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "fav-btn",
    onClick: function (e) {
      e.stopPropagation();
      toggleFav(deity.id);
    },
    "aria-label": "favorite"
  }, isFav ? "❤️" : "🤍"), /*#__PURE__*/React.createElement("div", {
    className: "glyph"
  }, deity.glyph), /*#__PURE__*/React.createElement("div", {
    className: "dname",
    lang: lang
  }, tr(deity.nameDeva, lang)), /*#__PURE__*/React.createElement("div", {
    className: "dcount"
  }, deity.texts.length, " ", " ", lang === "kn" ? "ಪಠ್ಯಗಳು" : lang === "sa" ? "पाठाः" : lang === "ta" ? "பாடங்கள்" : lang === "ml" ? "പാഠങ്ങൾ" : "పాఠాలు"));
}
function Home({
  lang,
  favs,
  toggleFav,
  onOpen,
  showFavoritesOnly
}) {
  var [query, setQuery] = useState("");
  var [cat, setCat] = useState("all");
  var filtered = useMemo(function () {
    return DEITIES.filter(function (d) {
      if (showFavoritesOnly && favs.indexOf(d.id) === -1) return false;
      if (cat !== "all" && !d.texts.some(function (t) {
        return t.kind === cat;
      })) return false;
      if (query.trim()) {
        var q = query.trim().toLowerCase();
        var name = tr(d.nameDeva, lang).toLowerCase();
        var nameLatin = d.nameDeva.toLowerCase();
        var hitTitles = d.texts.some(function (t) {
          return tr(t.titleDeva, lang).toLowerCase().indexOf(q) !== -1 || t.titleDeva.toLowerCase().indexOf(q) !== -1;
        });
        if (name.indexOf(q) === -1 && nameLatin.indexOf(q) === -1 && !hitTitles) return false;
      }
      return true;
    });
  }, [lang, cat, query, favs, showFavoritesOnly]);
  return /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, !showFavoritesOnly && /*#__PURE__*/React.createElement("div", {
    className: "hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-ring"
  }, "ॐ"), /*#__PURE__*/React.createElement("div", {
    className: "hero-title",
    lang: lang
  }, pick(UI.appName, lang)), /*#__PURE__*/React.createElement("div", {
    className: "hero-tag"
  }, pick(UI.tagline, lang))), /*#__PURE__*/React.createElement("div", {
    className: "search-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "search-box"
  }, /*#__PURE__*/React.createElement(SearchIcon, null), /*#__PURE__*/React.createElement("input", {
    value: query,
    onChange: function (e) {
      setQuery(e.target.value);
    },
    placeholder: pick(UI.searchPlaceholder, lang),
    lang: lang
  }))), /*#__PURE__*/React.createElement("div", {
    className: "pill-row"
  }, CATS.map(function (c) {
    return /*#__PURE__*/React.createElement("button", {
      key: c.id,
      className: "pill" + (cat === c.id ? " active" : ""),
      onClick: function () {
        setCat(c.id);
      },
      lang: lang
    }, pick(c.label, lang));
  })), /*#__PURE__*/React.createElement("div", {
    className: "section-title"
  }, /*#__PURE__*/React.createElement("span", null, pick(UI.allDeities, lang)), /*#__PURE__*/React.createElement("span", {
    className: "rule"
  })), filtered.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "empty-state"
  }, /*#__PURE__*/React.createElement("div", {
    className: "big"
  }, "🙏"), /*#__PURE__*/React.createElement("div", null, showFavoritesOnly ? pick(UI.favEmpty, lang) : pick(UI.noResults, lang))) : /*#__PURE__*/React.createElement("div", {
    className: "grid"
  }, filtered.map(function (d) {
    return /*#__PURE__*/React.createElement(DeityCard, {
      key: d.id,
      deity: d,
      lang: lang,
      favs: favs,
      toggleFav: toggleFav,
      onOpen: onOpen
    });
  })));
}
function VerseBlock({
  deva,
  lang
}) {
  var lines = deva.split("\n");
  return /*#__PURE__*/React.createElement("div", {
    className: "verse-block",
    lang: lang
  }, lines.map(function (line, i) {
    return /*#__PURE__*/React.createElement("div", {
      key: i
    }, tr(line, lang));
  }));
}
function TextCard({
  text,
  lang,
  index
}) {
  var isNamavali = text.kind === "ashtottara" && text.verses.length > 6 && text.verses.every(function (v) {
    return v.indexOf("नमः") !== -1 && v.length < 40;
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "text-card"
  }, /*#__PURE__*/React.createElement("h2", {
    lang: lang
  }, tr(text.titleDeva, lang)), isNamavali ? /*#__PURE__*/React.createElement("ul", {
    className: "namavali-list"
  }, text.verses.map(function (v, i) {
    return /*#__PURE__*/React.createElement("li", {
      key: i,
      lang: lang
    }, /*#__PURE__*/React.createElement("span", {
      className: "n"
    }, i + 1, "."), tr(v, lang));
  })) : text.verses.map(function (v, i) {
    return /*#__PURE__*/React.createElement("div", {
      key: i
    }, text.verses.length > 1 && /*#__PURE__*/React.createElement("span", {
      className: "verse-num"
    }, i + 1), /*#__PURE__*/React.createElement(VerseBlock, {
      deva: v,
      lang: lang
    }));
  }), /*#__PURE__*/React.createElement("div", {
    className: "meaning-box"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, pick(UI.meaningLabel, lang)), /*#__PURE__*/React.createElement("p", {
    lang: lang
  }, pick(text.meaning, lang))));
}
function DeityDetail({
  deityId,
  lang,
  favs,
  toggleFav,
  onBack
}) {
  var deity = DEITIES.find(function (d) {
    return d.id === deityId;
  });
  var [tab, setTab] = useState(deity ? deity.texts[0].id : null);
  useEffect(function () {
    if (deity) setTab(deity.texts[0].id);
  }, [deityId]);
  if (!deity) return null;
  var isFav = favs.indexOf(deity.id) !== -1;
  var activeText = deity.texts.find(function (t) {
    return t.id === tab;
  }) || deity.texts[0];
  return /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "deity-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glyph-lg"
  }, deity.glyph), /*#__PURE__*/React.createElement("h1", {
    lang: lang
  }, tr(deity.nameDeva, lang)), /*#__PURE__*/React.createElement("div", {
    className: "epithet",
    lang: lang
  }, tr(deity.epithetDeva, lang)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "pill",
    onClick: function () {
      toggleFav(deity.id);
    }
  }, isFav ? "❤️" : "🤍", " ", pick(UI.favorites, lang)))), deity.texts.length > 1 && /*#__PURE__*/React.createElement("div", {
    className: "tab-row"
  }, deity.texts.map(function (t) {
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      className: "tab" + (t.id === activeText.id ? " active" : ""),
      onClick: function () {
        setTab(t.id);
      },
      lang: lang
    }, tr(t.shortDeva || t.titleDeva, lang));
  })), /*#__PURE__*/React.createElement(TextCard, {
    text: activeText,
    lang: lang
  }));
}
function InstallBanner({
  lang
}) {
  var [deferred, setDeferred] = useState(null);
  var [dismissed, setDismissed] = useState(function () {
    return loadJSON("mm_install_dismissed", false);
  });
  useEffect(function () {
    function handler(e) {
      e.preventDefault();
      setDeferred(e);
    }
    window.addEventListener("beforeinstallprompt", handler);
    return function () {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);
  if (!deferred || dismissed) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "install-banner"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    },
    lang: lang
  }, pick(UI.installTitle, lang)), /*#__PURE__*/React.createElement("button", {
    onClick: function () {
      deferred.prompt();
      setDismissed(true);
      localStorage.setItem("mm_install_dismissed", "true");
    }
  }, pick(UI.installBtn, lang)));
}
function App() {
  var [lang, setLang] = useState(function () {
    return loadJSON("mm_lang", "kn");
  });
  var [route, setRoute] = useState({
    name: "home"
  });
  var [favs, toggleFav] = useFavorites();
  useEffect(function () {
    localStorage.setItem("mm_lang", JSON.stringify(lang));
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);
  function openDeity(id) {
    setRoute({
      name: "detail",
      id: id
    });
    window.scrollTo(0, 0);
  }
  function goHome() {
    setRoute({
      name: "home"
    });
    window.scrollTo(0, 0);
  }
  function goFavorites() {
    setRoute({
      name: "favorites"
    });
    window.scrollTo(0, 0);
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "app"
  }, /*#__PURE__*/React.createElement("header", {
    className: "top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "top-in"
  }, route.name !== "home" && /*#__PURE__*/React.createElement("button", {
    className: "back-btn",
    onClick: goHome,
    "aria-label": "back"
  }, "‹"), /*#__PURE__*/React.createElement("div", {
    className: "brand"
  }, /*#__PURE__*/React.createElement("div", {
    className: "brand-om"
  }, "ॐ"), /*#__PURE__*/React.createElement("div", {
    className: "brand-text"
  }, /*#__PURE__*/React.createElement("div", {
    className: "brand-title",
    lang: lang
  }, pick(UI.appName, lang))))), /*#__PURE__*/React.createElement("div", {
    className: "top-in",
    style: {
      paddingTop: 0
    }
  }, /*#__PURE__*/React.createElement(LangSlider, {
    lang: lang,
    setLang: setLang
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement(InstallBanner, {
    lang: lang
  })), route.name === "home" && /*#__PURE__*/React.createElement(Home, {
    lang: lang,
    favs: favs,
    toggleFav: toggleFav,
    onOpen: openDeity,
    showFavoritesOnly: false
  }), route.name === "favorites" && /*#__PURE__*/React.createElement(Home, {
    lang: lang,
    favs: favs,
    toggleFav: toggleFav,
    onOpen: openDeity,
    showFavoritesOnly: true
  }), route.name === "detail" && /*#__PURE__*/React.createElement(DeityDetail, {
    deityId: route.id,
    lang: lang,
    favs: favs,
    toggleFav: toggleFav,
    onBack: goHome
  })), /*#__PURE__*/React.createElement("footer", {
    className: "credit",
    lang: lang
  }, pick(UI.footerText, lang)), /*#__PURE__*/React.createElement("nav", {
    className: "bottom-nav"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nav-item" + (route.name === "home" ? " active" : ""),
    onClick: goHome
  }, /*#__PURE__*/React.createElement("span", {
    className: "ic"
  }, "🏠"), /*#__PURE__*/React.createElement("span", {
    lang: lang
  }, pick(UI.home, lang))), /*#__PURE__*/React.createElement("div", {
    className: "nav-item" + (route.name === "favorites" ? " active" : ""),
    onClick: goFavorites
  }, /*#__PURE__*/React.createElement("span", {
    className: "ic"
  }, "❤️"), /*#__PURE__*/React.createElement("span", {
    lang: lang
  }, pick(UI.favorites, lang)))));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));