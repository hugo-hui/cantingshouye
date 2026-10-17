/* ==========================================================================
   三河石府 · 首页交互脚本
   ========================================================================== */
(function () {
  "use strict";

  var header = document.getElementById("siteHeader");
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");
  var backTop = document.getElementById("backTop");
  var reserveForm = document.getElementById("reserveForm");
  var formSuccess = document.getElementById("formSuccess");
  var dateInput = document.getElementById("date");

  /* ---------- 顶部导航：滚动加背景 ---------- */
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    header.classList.toggle("scrolled", y > 40);
    backTop.classList.toggle("show", y > 600);
    updateActiveLink();
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 移动端菜单 ---------- */
  function closeMenu() {
    navToggle.classList.remove("open");
    mainNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }
  navToggle.addEventListener("click", function () {
    var open = mainNav.classList.toggle("open");
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  });
  mainNav.addEventListener("click", function (e) {
    if (e.target.classList.contains("nav-link")) closeMenu();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* ---------- 导航高亮（scrollspy） ---------- */
  var sections = [];
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  function collectSections() {
    sections = navLinks
      .map(function (link) {
        var id = link.getAttribute("href");
        if (!id || id.charAt(0) !== "#") return null;
        var el = document.querySelector(id);
        return el ? { id: id, el: el } : null;
      })
      .filter(Boolean);
  }
  function updateActiveLink() {
    if (!sections.length) return;
    var pos = (window.scrollY || 0) + 120;
    var current = sections[0].id;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].el.offsetTop <= pos) current = sections[i].id;
    }
    navLinks.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === current);
    });
  }
  collectSections();

  /* ---------- 滚动入场动画 ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- 回到顶部 ---------- */
  backTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- 预订表单 ---------- */
  // 日期最早可选今天
  if (dateInput) {
    var today = new Date();
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    dateInput.min = today.getFullYear() + "-" + pad(today.getMonth() + 1) + "-" + pad(today.getDate());
  }

  reserveForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var valid = validateForm();
    if (!valid) return;
    formSuccess.hidden = false;
    reserveForm.reset();
    // 保留 min（今天）限制，重置后日期仍不可选过去
    setTimeout(function () {
      formSuccess.hidden = true;
    }, 6000);
  });

  function validateForm() {
    var ok = true;
    var fields = [
      { el: document.getElementById("name"), label: "您的称呼" },
      { el: document.getElementById("phone"), label: "联系电话" },
      { el: dateInput, label: "到店日期" },
      { el: document.getElementById("time"), label: "到店时间" },
      { el: document.getElementById("guests"), label: "用餐人数" }
    ];

    fields.forEach(function (f) {
      var value = f.el.value.trim();
      f.el.classList.remove("invalid");
      if (!value) {
        f.el.classList.add("invalid");
        if (ok) f.el.focus();
        ok = false;
      }
    });

    // 电话格式校验（中国大陆手机 / 座机）
    var phone = document.getElementById("phone");
    var pv = phone.value.trim();
    if (pv && !/^1[3-9]\d{9}$|^0\d{2,3}-?\d{7,8}$/.test(pv)) {
      phone.classList.add("invalid");
      ok = false;
    }

    if (!ok) {
      var firstInvalid = reserveForm.querySelector(".invalid");
      if (firstInvalid) firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return ok;
  }
})();
