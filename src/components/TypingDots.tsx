import { useEffect, useState } from "react";
// import "../styles/typingDots.css";

export function TypingDots() {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 400);
    console.log(dots);

    return () => clearInterval(interval);
  }, []);

  return <div className="typing-dots">{dots}</div>;
}
