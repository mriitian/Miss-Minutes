import { useEffect, useState } from "react";

export function DarkModeToggle() {
  const [dark, setDark] = useState(
    localStorage.getItem("mm_darkmode") === "true"
  );

  useEffect(() => {
    if (dark) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
    localStorage.setItem("mm_darkmode", String(dark));
  }, [dark]);

  return (
    <button onClick={() => setDark(!dark)} className="darkmode-toggle">
      {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
    </button>
  );
}
