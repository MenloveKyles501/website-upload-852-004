(function () {
  var header = document.getElementById("site-header");
  var mobileToggle = document.getElementById("mobile-toggle");
  var mobileMenu = document.getElementById("mobile-menu");

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 48) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (mobileToggle && mobileMenu && header) {
    mobileToggle.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
      header.classList.toggle("menu-open", mobileMenu.classList.contains("is-open"));
    });
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function closePanels(exceptPanel) {
    document.querySelectorAll("[data-search-panel]").forEach(function (panel) {
      if (panel !== exceptPanel) {
        panel.classList.remove("is-open");
      }
    });
  }

  function renderSearch(panel, query) {
    var list = window.SEARCH_INDEX || [];
    var q = normalize(query);
    if (!q) {
      panel.classList.remove("is-open");
      panel.innerHTML = "";
      return;
    }
    var results = [];
    for (var i = 0; i < list.length && results.length < 10; i += 1) {
      var item = list[i];
      var haystack = normalize([item.title, item.region, item.type, item.year, item.genre, item.category].join(" "));
      if (haystack.indexOf(q) !== -1) {
        results.push(item);
      }
    }
    if (results.length === 0) {
      panel.innerHTML = '<div class="search-empty">没有找到匹配影片</div>';
    } else {
      panel.innerHTML = results.map(function (item) {
        return '<a class="search-result" href="' + item.url + '"><strong>' + escapeHtml(item.title) + '</strong><small>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) + '</small></a>';
      }).join("");
    }
    panel.classList.add("is-open");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  document.querySelectorAll("[data-search-box]").forEach(function (box) {
    var input = box.querySelector("[data-search-input]");
    var panel = box.querySelector("[data-search-panel]");
    if (!input || !panel) {
      return;
    }
    input.addEventListener("input", function () {
      closePanels(panel);
      renderSearch(panel, input.value);
    });
    input.addEventListener("focus", function () {
      closePanels(panel);
      renderSearch(panel, input.value);
    });
  });

  document.addEventListener("click", function (event) {
    if (!event.target.closest("[data-search-box]")) {
      closePanels(null);
    }
  });

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  var localCards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
  var localSearch = document.querySelector("[data-local-search]");
  var regionSelect = document.querySelector("[data-filter-region]");
  var typeSelect = document.querySelector("[data-filter-type]");
  var yearSelect = document.querySelector("[data-filter-year]");

  if (localCards.length > 0 && (localSearch || regionSelect || typeSelect || yearSelect)) {
    var regions = Array.from(new Set(localCards.map(function (card) { return card.getAttribute("data-region") || ""; }).filter(Boolean))).sort();
    var types = Array.from(new Set(localCards.map(function (card) { return card.getAttribute("data-type") || ""; }).filter(Boolean))).sort();
    var years = Array.from(new Set(localCards.map(function (card) { return card.getAttribute("data-year") || ""; }).filter(Boolean))).sort().reverse();
    fillSelect(regionSelect, regions);
    fillSelect(typeSelect, types);
    fillSelect(yearSelect, years);

    function applyLocalFilter() {
      var q = normalize(localSearch ? localSearch.value : "");
      var region = regionSelect ? regionSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var year = yearSelect ? yearSelect.value : "";
      localCards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-keywords") || card.textContent);
        var ok = true;
        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (region && card.getAttribute("data-region") !== region) {
          ok = false;
        }
        if (type && card.getAttribute("data-type") !== type) {
          ok = false;
        }
        if (year && card.getAttribute("data-year") !== year) {
          ok = false;
        }
        card.classList.toggle("is-hidden-card", !ok);
      });
    }

    [localSearch, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyLocalFilter);
        control.addEventListener("change", applyLocalFilter);
      }
    });
  }
})();
