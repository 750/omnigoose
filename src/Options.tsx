import { useState, useEffect, MouseEvent, ChangeEvent } from 'react'
import defaults from './defaults.json'
import './Options.css'
import { InMemoryChromeStorageShim, generateId } from './Utilities.ts'
import { ButtonsList, DynamicButton } from './DynamicButton.tsx'
import { Rule, RuleProps } from './Rule.tsx'
import { LanguageContext, QueryContext } from './QueryContext.ts'
import { Literals } from './Literals.ts'

let chromeStorageLocal = new InMemoryChromeStorageShim() as unknown as chrome.storage.LocalStorageArea
if (process.env.NODE_ENV === "production") {
  console.log("We are in space!");
  chromeStorageLocal = chrome.storage.local
}

const OptionsTable = (props: any) => {
  const [rules, updateRules] = useState<RuleProps[]>([])
  const [query, updateQuery] = useState<string>("")
  const [language, updateLanguage] = useState<"en" | "ru">("en")

  const updateRule = (index: number) => ((rule: RuleProps | null) => {
    const newRules = rules.slice()
    if (rule === null) {
      newRules.splice(index, 1)
    } else {
      newRules.splice(index, 1, rule)
    }
    updateRules(newRules)
    return new Promise((resolve) => { resolve('Hh') })
  })

  useEffect(() => {
    chromeStorageLocal.get('rules').then((items: any) => {
      if (items.rules === undefined) {
        let newRules = defaults.defaultRules.map((rule: RuleProps) => ({ id: generateId(), ...rule }))
        chromeStorageLocal.set({ rules: newRules }).then(() => updateRules(newRules))
      } else {
        updateRules(items.rules)
      }
    })
  }, [])

  const localSave = (e: MouseEvent) => {
    e.stopPropagation()
    return chromeStorageLocal.set({ rules })
  }

  const addRule = (e: MouseEvent) => {
    e.stopPropagation()
    const newRules = rules.slice()
    updateRules([{ id: generateId(), regex: "", name: "", linkTemplate: "" }, ...newRules])
    return new Promise((resolve) => {
      resolve(99)
    })
  }

  const addExampleRule = async (e: MouseEvent) => {
    e.stopPropagation()
    updateRules([{ id: generateId(), ...defaults.exampleRule }, ...rules])
    return new Promise((resolve, reject) => { resolve(4) })
  }

  const addRuleFromClipboard = async (e: MouseEvent) => {
    e.stopPropagation()
    return navigator.clipboard.readText().then((text: string) => {
      let parsedRules = JSON.parse(text)
      if (Array.isArray(parsedRules)) {
        parsedRules = parsedRules.map((rule: { [key: string]: any }) => {
          if (typeof rule === 'object' && !Array.isArray(rule) && rule !== null) {
            if (rule.hasOwnProperty("regex") && rule.hasOwnProperty("linkTemplate")) {
              return {
                id: generateId(),
                name: (rule.name || "").toString(),
                regex: (rule.regex || "").toString(),
                linkTemplate: (rule.linkTemplate || "").toString()
              }

            } else throw Error("Some rules are bad rules!")
          } else throw Error("Some rules are bad rules!")
        })

        updateRules([...parsedRules, ...rules])
      } else throw Error("Rule should be an array!")
    })
  }

  const toggleLanguage = (e: MouseEvent) => {
    return new Promise((resolve: (a?: any) => void) => {
      if (language === "en") {
        updateLanguage("ru")
      } else {
        updateLanguage("en")
      }
      resolve()
    })
  }

  const copyRulesToClipboard = async () => {
    return navigator.clipboard.writeText(JSON.stringify(rules.map((rule: RuleProps) => ({
      name: rule.name,
      regex: rule.regex,
      linkTemplate: rule.linkTemplate,
    })), null, 2))
  }

  const handleQueryChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateQuery(e.target.value)
  }

  const resetStore = async (e: MouseEvent) => {
    return chromeStorageLocal.clear().then(() => window.location.reload())
  }

  return (
    <QueryContext.Provider value={query}>
      <LanguageContext.Provider value={language}>
        <div className="rules">
          <div className='Header'>
            <svg xmlns="http://www.w3.org/2000/svg" transform={language === "en" ? "scale(-1,1)" : undefined} width="1em" height="1em" viewBox="0 0 512 512"><path fill="currentColor" d="M370.019 18.023c-2.843-.035-5.859.197-9.075.73c-81.664 13.54-38.657 142.295-36.095 217.397c-84.163-16.327-168.007 121.048-289.118 152.787c58.086 52.473 206.05 89.6 331.739 11.85c39.804-24.622 45.26-92.014 34.343-165.049c-6.703-44.845-71.755-133.176-10.269-141.266l.611-.504c12.884-10.608 16.606-23.842 22.522-37.699l1.699-3.976c-11.688-16.016-23.17-33.986-46.357-34.27zm5.08 19.625a9 9 0 0 1 9 9a9 9 0 0 1-9 9a9 9 0 0 1-9-9a9 9 0 0 1 9-9zm52.703 34.172c-3.28 8.167-7.411 17.45-14.612 26.293c21.035 7.63 41.929 3.078 63.079-.863c-15.515-9.272-32.003-18.195-48.467-25.43zm-89.608 181.053c19.109 25.924 21.374 53.965 11.637 78.183c-9.737 24.219-30.345 44.797-55.67 60.49c-50.65 31.389-121.288 44.45-170.553 17.11l8.735-15.738c40.364 22.4 106.342 11.833 152.338-16.67c22.997-14.252 40.72-32.684 48.449-51.906c7.729-19.223 6.596-39.053-9.426-60.79l14.49-10.68zM273.28 456.322a332.68 332.68 0 0 1-19.095 3.232l-3.508 16.426h-13.084l3.508-14.842a400.208 400.208 0 0 1-18.852 1.506l-7.408 31.336h95.79v-18h-41.548l4.197-19.658z" /></svg>
            OmniGoose
          </div>
          <div>
            <input type="text" onChange={handleQueryChange} placeholder={"Try pasting some kind of id"} />
          </div>
          <div className="button">
            <DynamicButton {...{ defaultTextLiteral: Literals.BUTTON_PASTE_RULES, failureTextLiteral: Literals.BUTTON_PASTE_RULES_BAD_JSON, isImportant: false, onClick: addRuleFromClipboard }} />
            <DynamicButton {...{ defaultTextLiteral: Literals.BUTTON_ADD_NEW_RULE, isImportant: true, onClick: addRule }} />
            <DynamicButton {...{ defaultTextLiteral: Literals.BUTTON_ADD_EXAMPLE_RULE, isImportant: false, onClick: addExampleRule }} />
            <DynamicButton {...{ defaultTextLiteral: Literals.BUTTON_RESET, isImportant: false, onClick: resetStore }} />
            <DynamicButton {...{ defaultTextLiteral: Literals.BUTTON_TOGGLE_LANGUAGE, isImportant: true, isDumb: true, onClick: toggleLanguage }} />
          </div>
          {rules.map((rule, index) => {
            return <Rule {...{
              linkTemplate: rule.linkTemplate,
              name: rule.name,
              regex: rule.regex,
              id: rule.id,
              updateRule: updateRule(index),
              key: rule.id
            }} />
          })}
          <ButtonsList {...{
            bts: [
              { defaultTextLiteral: Literals.BUTTON_SAVE, isImportant: true, onClick: localSave },
              { defaultTextLiteral: Literals.BUTTON_COPY_RULE_TO_CLIPBOARD, onClick: copyRulesToClipboard }
            ]
          }} />
        </div>
      </LanguageContext.Provider>
    </QueryContext.Provider>
  )
}

export { OptionsTable }
