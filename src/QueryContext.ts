import { createContext } from "react";

export const QueryContext = createContext<string>("")
export const LanguageContext = createContext<"en"|"ru">("en")
