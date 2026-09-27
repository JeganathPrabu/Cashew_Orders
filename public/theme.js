(function () {
  var STORAGE_KEY = "cashew-orders-theme";

  function getPreferredTheme() {
    var stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (stored === "light" || stored === "dark") return stored;
    var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  var currentTheme = getPreferredTheme();
  applyTheme(currentTheme);

  function syncToggles() {
    document.querySelectorAll(".theme-toggle-input").forEach(function (input) {
      input.checked = currentTheme === "dark";
      input.setAttribute("aria-checked", String(currentTheme === "dark"));
    });
  }

  function setTheme(theme) {
    currentTheme = theme;
    applyTheme(theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
    syncToggles();
  }

  function wireToggles() {
    syncToggles();
    document.querySelectorAll(".theme-toggle-input").forEach(function (input) {
      input.addEventListener("change", function () {
        setTheme(input.checked ? "dark" : "light");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireToggles);
  } else {
    wireToggles();
  }

  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
      var stored = null;
      try { stored = localStorage.getItem(STORAGE_KEY); } catch (err) {}
      if (stored === "light" || stored === "dark") return;
      setTheme(e.matches ? "dark" : "light");
    });
  }

  window.addEventListener("storage", function (e) {
    if (e.key === STORAGE_KEY && (e.newValue === "light" || e.newValue === "dark")) {
      currentTheme = e.newValue;
      applyTheme(currentTheme);
      syncToggles();
    }
  });
})();
