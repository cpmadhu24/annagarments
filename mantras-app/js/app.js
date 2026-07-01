const { useState, useEffect, useMemo, useRef } = React;
const { LANGS, UI, CATS, DEITIES } = window.MantraContent;
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
  } catch (e) { return fallback; }
}

function LangSlider({ lang, setLang }) {
  var wrapRef = useRef(null);
  var idx = LANGS.findIndex(function (l) { return l.code === lang; });
  var [thumb, setThumb] = useState({ left: 0, width: 0 });

  useEffect(function () {
    var wrap = wrapRef.current;
    if (!wrap) return;
    var btn = wrap.querySelectorAll("button")[idx];
    if (btn) {
      setThumb({ left: btn.offsetLeft, width: btn.offsetWidth });
      btn.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    }
  }, [lang]);

  return (
    <div className="lang-slider" ref={wrapRef}>
      <div className="thumb" style={{ transform: "translateX(" + thumb.left + "px)", width: thumb.width + "px" }}></div>
      {LANGS.map(function (l) {
        return (
          <button key={l.code} className={l.code === lang ? "active" : ""} onClick={function () { setLang(l.code); }} lang={l.code}>
            {l.label}
          </button>
        );
      })}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fdf6ec" strokeWidth="2">
      <circle cx="11" cy="11" r="7"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );
}

function useFavorites() {
  var [favs, setFavs] = useState(function () { return loadJSON("mm_favs", []); });
  useEffect(function () { localStorage.setItem("mm_favs", JSON.stringify(favs)); }, [favs]);
  function toggle(id) {
    setFavs(function (prev) {
      return prev.indexOf(id) === -1 ? prev.concat([id]) : prev.filter(function (x) { return x !== id; });
    });
  }
  return [favs, toggle];
}

function DeityCard({ deity, lang, favs, toggleFav, onOpen }) {
  var isFav = favs.indexOf(deity.id) !== -1;
  return (
    <div className="deity-card" onClick={function () { onOpen(deity.id); }}>
      <button className="fav-btn" onClick={function (e) { e.stopPropagation(); toggleFav(deity.id); }} aria-label="favorite">
        {isFav ? "❤️" : "🤍"}
      </button>
      <div className="glyph">{deity.glyph}</div>
      <div className="dname" lang={lang}>{tr(deity.nameDeva, lang)}</div>
      <div className="dcount">{deity.texts.length} {" "}
        {lang === "kn" ? "ಪಠ್ಯಗಳು" : lang === "sa" ? "पाठाः" : lang === "ta" ? "பாடங்கள்" : lang === "ml" ? "പാഠങ്ങൾ" : "పాఠాలు"}
      </div>
    </div>
  );
}

function Home({ lang, favs, toggleFav, onOpen, showFavoritesOnly }) {
  var [query, setQuery] = useState("");
  var [cat, setCat] = useState("all");

  var filtered = useMemo(function () {
    return DEITIES.filter(function (d) {
      if (showFavoritesOnly && favs.indexOf(d.id) === -1) return false;
      if (cat !== "all" && !d.texts.some(function (t) { return t.kind === cat; })) return false;
      if (query.trim()) {
        var q = query.trim().toLowerCase();
        var name = tr(d.nameDeva, lang).toLowerCase();
        var nameLatin = d.nameDeva.toLowerCase();
        var hitTitles = d.texts.some(function (t) { return tr(t.titleDeva, lang).toLowerCase().indexOf(q) !== -1 || t.titleDeva.toLowerCase().indexOf(q) !== -1; });
        if (name.indexOf(q) === -1 && nameLatin.indexOf(q) === -1 && !hitTitles) return false;
      }
      return true;
    });
  }, [lang, cat, query, favs, showFavoritesOnly]);

  return (
    <div className="container">
      {!showFavoritesOnly && (
        <div className="hero">
          <div className="hero-ring">ॐ</div>
          <div className="hero-title" lang={lang}>{pick(UI.appName, lang)}</div>
          <div className="hero-tag">{pick(UI.tagline, lang)}</div>
        </div>
      )}

      <div className="search-wrap">
        <div className="search-box">
          <SearchIcon />
          <input
            value={query}
            onChange={function (e) { setQuery(e.target.value); }}
            placeholder={pick(UI.searchPlaceholder, lang)}
            lang={lang}
          />
        </div>
      </div>

      <div className="pill-row">
        {CATS.map(function (c) {
          return (
            <button key={c.id} className={"pill" + (cat === c.id ? " active" : "")} onClick={function () { setCat(c.id); }} lang={lang}>
              {pick(c.label, lang)}
            </button>
          );
        })}
      </div>

      <div className="section-title"><span>{pick(UI.allDeities, lang)}</span><span className="rule"></span></div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="big">🙏</div>
          <div>{showFavoritesOnly ? pick(UI.favEmpty, lang) : pick(UI.noResults, lang)}</div>
        </div>
      ) : (
        <div className="grid">
          {filtered.map(function (d) {
            return <DeityCard key={d.id} deity={d} lang={lang} favs={favs} toggleFav={toggleFav} onOpen={onOpen} />;
          })}
        </div>
      )}
    </div>
  );
}

function VerseBlock({ deva, lang }) {
  var lines = deva.split("\n");
  return (
    <div className="verse-block" lang={lang}>
      {lines.map(function (line, i) {
        return <div key={i}>{tr(line, lang)}</div>;
      })}
    </div>
  );
}

function TextCard({ text, lang, index }) {
  var isNamavali = text.kind === "ashtottara" && text.verses.length > 6 && text.verses.every(function (v) { return v.indexOf("नमः") !== -1 && v.length < 40; });
  return (
    <div className="text-card">
      <h2 lang={lang}>{tr(text.titleDeva, lang)}</h2>
      {isNamavali ? (
        <ul className="namavali-list">
          {text.verses.map(function (v, i) {
            return <li key={i} lang={lang}><span className="n">{i + 1}.</span>{tr(v, lang)}</li>;
          })}
        </ul>
      ) : (
        text.verses.map(function (v, i) {
          return (
            <div key={i}>
              {text.verses.length > 1 && <span className="verse-num">{i + 1}</span>}
              <VerseBlock deva={v} lang={lang} />
            </div>
          );
        })
      )}
      <div className="meaning-box">
        <span className="lbl">{pick(UI.meaningLabel, lang)}</span>
        <p lang={lang}>{pick(text.meaning, lang)}</p>
      </div>
    </div>
  );
}

function DeityDetail({ deityId, lang, favs, toggleFav, onBack }) {
  var deity = DEITIES.find(function (d) { return d.id === deityId; });
  var [tab, setTab] = useState(deity ? deity.texts[0].id : null);
  useEffect(function () { if (deity) setTab(deity.texts[0].id); }, [deityId]);
  if (!deity) return null;
  var isFav = favs.indexOf(deity.id) !== -1;
  var activeText = deity.texts.find(function (t) { return t.id === tab; }) || deity.texts[0];

  return (
    <div className="container">
      <div className="deity-hero">
        <div className="glyph-lg">{deity.glyph}</div>
        <h1 lang={lang}>{tr(deity.nameDeva, lang)}</h1>
        <div className="epithet" lang={lang}>{tr(deity.epithetDeva, lang)}</div>
        <div style={{ marginTop: 10 }}>
          <button className="pill" onClick={function () { toggleFav(deity.id); }}>
            {isFav ? "❤️" : "🤍"} {pick(UI.favorites, lang)}
          </button>
        </div>
      </div>

      {deity.texts.length > 1 && (
        <div className="tab-row">
          {deity.texts.map(function (t) {
            return (
              <button key={t.id} className={"tab" + (t.id === activeText.id ? " active" : "")} onClick={function () { setTab(t.id); }} lang={lang}>
                {tr(t.shortDeva || t.titleDeva, lang)}
              </button>
            );
          })}
        </div>
      )}

      <TextCard text={activeText} lang={lang} />
    </div>
  );
}

function InstallBanner({ lang }) {
  var [deferred, setDeferred] = useState(null);
  var [dismissed, setDismissed] = useState(function () { return loadJSON("mm_install_dismissed", false); });
  useEffect(function () {
    function handler(e) { e.preventDefault(); setDeferred(e); }
    window.addEventListener("beforeinstallprompt", handler);
    return function () { window.removeEventListener("beforeinstallprompt", handler); };
  }, []);
  if (!deferred || dismissed) return null;
  return (
    <div className="install-banner">
      <span style={{ flex: 1 }} lang={lang}>{pick(UI.installTitle, lang)}</span>
      <button onClick={function () {
        deferred.prompt();
        setDismissed(true);
        localStorage.setItem("mm_install_dismissed", "true");
      }}>{pick(UI.installBtn, lang)}</button>
    </div>
  );
}

function App() {
  var [lang, setLang] = useState(function () { return loadJSON("mm_lang", "kn"); });
  var [route, setRoute] = useState({ name: "home" });
  var [favs, toggleFav] = useFavorites();

  useEffect(function () { localStorage.setItem("mm_lang", JSON.stringify(lang)); document.documentElement.setAttribute("lang", lang); }, [lang]);

  function openDeity(id) { setRoute({ name: "detail", id: id }); window.scrollTo(0, 0); }
  function goHome() { setRoute({ name: "home" }); window.scrollTo(0, 0); }
  function goFavorites() { setRoute({ name: "favorites" }); window.scrollTo(0, 0); }

  return (
    <div className="app">
      <header className="top">
        <div className="top-in">
          {route.name !== "home" && (
            <button className="back-btn" onClick={goHome} aria-label="back">‹</button>
          )}
          <div className="brand">
            <div className="brand-om">ॐ</div>
            <div className="brand-text">
              <div className="brand-title" lang={lang}>{pick(UI.appName, lang)}</div>
            </div>
          </div>
        </div>
        <div className="top-in" style={{ paddingTop: 0 }}>
          <LangSlider lang={lang} setLang={setLang} />
        </div>
      </header>

      <div style={{ flex: 1 }}>
        <div className="container">
          <InstallBanner lang={lang} />
        </div>
        {route.name === "home" && <Home lang={lang} favs={favs} toggleFav={toggleFav} onOpen={openDeity} showFavoritesOnly={false} />}
        {route.name === "favorites" && <Home lang={lang} favs={favs} toggleFav={toggleFav} onOpen={openDeity} showFavoritesOnly={true} />}
        {route.name === "detail" && <DeityDetail deityId={route.id} lang={lang} favs={favs} toggleFav={toggleFav} onBack={goHome} />}
      </div>

      <footer className="credit" lang={lang}>{pick(UI.footerText, lang)}</footer>

      <nav className="bottom-nav">
        <div className={"nav-item" + (route.name === "home" ? " active" : "")} onClick={goHome}>
          <span className="ic">🏠</span><span lang={lang}>{pick(UI.home, lang)}</span>
        </div>
        <div className={"nav-item" + (route.name === "favorites" ? " active" : "")} onClick={goFavorites}>
          <span className="ic">❤️</span><span lang={lang}>{pick(UI.favorites, lang)}</span>
        </div>
      </nav>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
