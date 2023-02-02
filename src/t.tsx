import { useContext, useEffect } from "react"
import translations from "./translations.json"
import { LanguageContext } from "./QueryContext"
import { Literals } from "./Literals"

export const T = (props: {literal: Literals}) => {
    const language = useContext<"en"|"ru">(LanguageContext)
    return <>{translations[language][props.literal]}</>
} 
