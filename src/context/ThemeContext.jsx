import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext({
  dark: false,
  toggle: () => {},
});

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() =>
    typeof localStorage !== "undefined"
      ? localStorage.getItem("cortexflow-theme") === "dark"
      : false,
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("cortexflow-theme", dark ? "dark" : "light");
  }, [dark]);

  const value = useMemo(
    () => ({
      dark,
      toggle: () => setDark((d) => !d),
    }),
    [dark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** @returns {{ dark: boolean, toggle: () => void }} */
// eslint-disable-next-line react-refresh/only-export-components -- hook colocated with provider
export function useTheme() {
  return useContext(ThemeContext);
}
