(() => {
  const header = document.querySelector("[data-nav]");
  if (!header) return;

  const toggle = header.querySelector(".nav-toggle");
  const drawer = header.querySelector(".nav-drawer");
  if (!toggle || !drawer) return;

  const open = () => {
    drawer.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
  };

  const close = () => {
    drawer.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    expanded ? close() : open();
  });

  // Close on Escape
  header.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  // Close when focus leaves the header (optional but keeps it tidy)
  header.addEventListener("focusout", (e) => {
    if (!header.contains(e.relatedTarget)) close();
  });
})();
