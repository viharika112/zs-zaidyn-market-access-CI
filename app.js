/*
 * ZAIDYN Market Access — Coverage Intelligence
 * Renders the dashboard from window.ZAIDYN_DATA and wires interactions.
 * No framework, no build step. Edit data.js to change what is shown.
 */
(function () {
  "use strict";

  var data = window.ZAIDYN_DATA;
  if (!data) { return; }

  // ---- helpers -------------------------------------------------------------
  function usd(n) {
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1e3) return "$" + Math.round(n / 1e3) + "K";
    return "$" + n;
  }
  function lives(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M lives";
    if (n >= 1e3) return Math.round(n / 1e3) + "K lives";
    return n + " lives";
  }
  function coverageClass(pct) {
    if (pct >= 70) return "good";
    if (pct >= 55) return "major";
    return "critical";
  }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  var sparkSvg =
    '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path d="M12 3l1.6 4.9L18.5 9.5l-4.9 1.6L12 16l-1.6-4.9L5.5 9.5l4.9-1.6L12 3z" fill="currentColor"/>' +
    '<path d="M18.5 15l.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1z" fill="currentColor"/></svg>';
  var chevronSvg =
    '<svg class="chevron" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path d="M5 8l5 5 5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var flagSvg =
    '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path d="M5 21V4M5 4h10l-1.5 3L15 10H5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // ---- toast ---------------------------------------------------------------
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-visible"); }, 2600);
  }

  // ---- derive brand totals -------------------------------------------------
  function totals(brand) {
    var risk = 0;
    brand.barriers.forEach(function (b) { risk += b.revenueAtRisk; });
    return { revenueAtRisk: risk, openBarriers: brand.barriers.length };
  }

  // ---- render --------------------------------------------------------------
  function renderBrand(brand) {
    var t = totals(brand);

    // context + as-of
    document.getElementById("context-line").textContent =
      brand.name + " · " + brand.market + " · " + brand.channel;
    document.getElementById("asof-line").textContent = "Coverage as of " + data.meta.coverageAsOf;

    // tiles
    var tiles = document.getElementById("tiles");
    tiles.innerHTML = "";
    tiles.appendChild(el("div", "tile",
      '<div class="tile__label">Covered lives</div>' +
      '<div class="tile__value">' + brand.coveredLivesPct + '%</div>' +
      '<div class="tile__foot">' + brand.indication + ' · ' + brand.payers.length + ' payers tracked</div>'));
    tiles.appendChild(el("div", "tile tile--risk",
      '<div class="tile__label">Revenue at risk</div>' +
      '<div class="tile__value">' + usd(t.revenueAtRisk) + '</div>' +
      '<div class="tile__foot">Estimated, this plan year</div>'));
    tiles.appendChild(el("div", "tile tile--barriers",
      '<div class="tile__label">Open barriers</div>' +
      '<div class="tile__value">' + t.openBarriers + '</div>' +
      '<div class="tile__foot">Awaiting action</div>'));

    // coverage bars
    var bars = document.getElementById("coverage-bars");
    bars.innerHTML = "";
    brand.payers.forEach(function (p) {
      var cls = coverageClass(p.coveragePct);
      var row = el("div", "bar-row");
      row.appendChild(el("span", "bar-row__name", p.name));
      var track = el("div", "bar-track");
      var fill = el("div", "bar-fill bar-fill--" + cls);
      fill.style.width = "0%";
      track.appendChild(fill);
      row.appendChild(track);
      row.appendChild(el("span", "bar-row__pct", p.coveragePct + "%"));
      bars.appendChild(row);
      // animate on next frame
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { fill.style.width = p.coveragePct + "%"; });
      });
    });

    // barriers (sorted by revenue at risk, desc)
    var wrap = document.getElementById("barriers");
    wrap.innerHTML = "";
    brand.barriers
      .slice()
      .sort(function (a, b) { return b.revenueAtRisk - a.revenueAtRisk; })
      .forEach(function (b) { wrap.appendChild(renderBarrier(b)); });
  }

  function renderBarrier(b) {
    var card = el("div", "barrier barrier--" + b.severity);
    card.setAttribute("aria-expanded", "false");

    var detected = b.detectedDaysAgo === 0 ? "today" :
      b.detectedDaysAgo === 1 ? "1 day ago" : b.detectedDaysAgo + " days ago";

    var pv = b.provenance || {};
    var flagBadge = (pv.primary === "field" && pv.conflict)
      ? '<span class="flag">' + flagSvg + 'Field-reported</span>' : "";

    // header (button)
    var head = el("button", "barrier__head");
    head.type = "button";
    head.innerHTML =
      '<span class="barrier__main">' +
        '<span class="barrier__title"><span class="sev-dot sev-dot--' + b.severity + '"></span>' +
          b.payer + ' · ' + b.type + flagBadge + '</span>' +
        '<span class="barrier__sub">' + lives(b.livesAffected) + ' · detected ' + detected + '</span>' +
      '</span>' +
      '<span class="barrier__right">' +
        '<span class="barrier__risk"><span class="barrier__risk-val">' + usd(b.revenueAtRisk) +
          '</span><br><span class="barrier__risk-lbl">at risk</span></span>' +
        chevronSvg +
      '</span>';

    // body
    var body = el("div", "barrier__body");
    var talkingId = "talking-" + b.id;

    // sources / provenance
    function ago(d) { return d === 0 ? "today" : d === 1 ? "1 day ago" : d + " days ago"; }
    var srcRows = "";
    if (pv.fieldNote) {
      srcRows += '<div class="src"><span class="src__dot src__dot--field"></span>' +
        '<span class="src__who">Field team</span>' +
        '<span class="src__note">' + pv.fieldNote + ' — <strong>' + ago(pv.fieldDaysAgo) + '</strong></span></div>';
    }
    if (pv.feedNote) {
      srcRows += '<div class="src"><span class="src__dot src__dot--feed"></span>' +
        '<span class="src__who">Coverage feed</span>' +
        '<span class="src__note">' + pv.feedNote + ' — <strong>' + ago(pv.feedDaysAgo) + '</strong></span></div>';
    }
    var srcFlag = pv.conflict
      ? '<div class="sources__flag">' + flagSvg +
        '<span>Field report is ahead of the coverage feed — treat as an early warning.</span></div>'
      : "";
    var sourcesHtml = srcRows
      ? '<div class="sources"><div class="sources__label">Sources</div>' + srcRows + srcFlag + '</div>'
      : "";

    body.innerHTML =
      '<p class="barrier__summary">' + b.summary + '</p>' +
      sourcesHtml +
      '<div class="reco">' +
        '<span class="reco__label">' + sparkSvg + 'ZAIDYN Copilot recommends</span>' +
        '<div class="reco__text">' + b.recommendedAction + '</div>' +
        '<div class="reco__owner">Suggested owner: <strong>' + b.suggestedOwner + '</strong></div>' +
        '<div class="reco__actions">' +
          '<button class="btn btn--primary" data-assign="' + b.suggestedOwner + '">Assign</button>' +
          '<button class="btn btn--ghost" data-talking="' + talkingId + '">Recommended Solution</button>' +
        '</div>' +
        '<div class="talking" id="' + talkingId + '">' +
          '<div class="talking__label">Recommended Solution</div>' +
          '<ul>' + b.talkingPoints.map(function (p) { return '<li>' + p + '</li>'; }).join("") + '</ul>' +
        '</div>' +
      '</div>';

    // toggle expand
    head.addEventListener("click", function () {
      var open = card.classList.toggle("is-open");
      card.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // assign + talking-points (delegated within body)
    body.addEventListener("click", function (ev) {
      var assign = ev.target.closest("[data-assign]");
      if (assign) {
        toast("Assigned to " + assign.getAttribute("data-assign"));
        return;
      }
      var talk = ev.target.closest("[data-talking]");
      if (talk) {
        var panel = document.getElementById(talk.getAttribute("data-talking"));
        var open = panel.classList.toggle("is-open");
        talk.textContent = open ? "Hide Recommended Solution" : "Recommended Solution";
      }
    });

    card.appendChild(head);
    card.appendChild(body);
    return card;
  }

  // ---- brand selector ------------------------------------------------------
  var select = document.getElementById("brand-select");
  data.brands.forEach(function (brand) {
    var opt = document.createElement("option");
    opt.value = brand.id;
    opt.textContent = brand.name + " (" + brand.indication + ")";
    select.appendChild(opt);
  });
  select.addEventListener("change", function () {
    var brand = data.brands.filter(function (b) { return b.id === select.value; })[0];
    if (brand) renderBrand(brand);
  });

  // initial paint
  renderBrand(data.brands[0]);
})();
