import { FocusEvent, MouseEvent, useRef, useState, ChangeEvent, useEffect, useContext } from 'react'
import './Options.css'
import { DynamicButton } from './DynamicButton.tsx'
import { matchRule } from './Utilities.ts';
import { QueryContext } from './QueryContext.ts';
import { Literals } from './Literals.ts';
import { T } from './t.tsx';

interface RuleProps {
  name: string;
  regex: string;
  linkTemplate: string;
  id?: string
}

const Rule = (props: {
  updateRule: (rule: RuleProps | null) => void,
  key: any;
} & RuleProps) => {
  const [name, updateName] = useState<string>(props.name)
  const [regex, updateRegex] = useState<string>(props.regex)
  const [linkTemplate, updateLinkTemplate] = useState<string>(props.linkTemplate)
  const [matchedRule, updateMatchedRule] = useState<null | { content: string, description: string }>(null)

  const query = useContext(QueryContext)

  const nameRef = useRef<HTMLInputElement>(null)
  const regexRef = useRef<HTMLInputElement>(null)
  const linkTemplateRef = useRef<HTMLInputElement>(null)

  const handleInput = (e: FocusEvent) => {
    props.updateRule({
      name: nameRef.current!.value,
      regex: regexRef.current!.value,
      linkTemplate: linkTemplateRef.current!.value,
      id: props.id
    })
  }

  const handleChange = (e: ChangeEvent) => {
    let mr = matchRule({
      name: nameRef.current!.value,
      regex: regexRef.current!.value,
      linkTemplate: linkTemplateRef.current!.value,
      id: props.id
    }, query)

    if (nameRef.current!.value !== name) updateName(nameRef.current!.value)
    if (regexRef.current!.value !== name) updateRegex(regexRef.current!.value)
    if (linkTemplateRef.current!.value !== name) updateLinkTemplate(linkTemplateRef.current!.value)
    updateMatchedRule(mr)
  }

  const deleteRule = (e: MouseEvent) => {
    e.stopPropagation()
    props.updateRule(null)
    return new Promise((resolve) => { resolve(1) })
  }

  const copyRuleToClipboard = (e: MouseEvent) => {
    return navigator.clipboard.writeText(JSON.stringify([{ name, regex, linkTemplate }], null, 2))
  }

  useEffect(() => {
    let mr = matchRule(props, query)
    updateMatchedRule(mr)
  }, [props, query])

  return (
    <div className="rule">
      <div className="button">
        <DynamicButton {...{ defaultTextLiteral: Literals.BUTTON_COPY_RULE, isDumb: false, onClick: copyRuleToClipboard }} />
        <DynamicButton {...{ defaultTextLiteral: Literals.BUTTON_DELETE_RULE, isDumb: false, onClick: deleteRule }} />
      </div>
      <div className="rulePropeties">
        <input type="text" ref={nameRef} onChange={handleChange} onBlur={handleInput} defaultValue={name} placeholder="name" />
        <input type="text" ref={regexRef} onChange={handleChange} onBlur={handleInput} defaultValue={regex} placeholder="regex" />
        <input type="text" ref={linkTemplateRef} onChange={handleChange} onBlur={handleInput} defaultValue={linkTemplate} placeholder="url template" />
      </div>
      <div className='queryChecker'>{
        query === ""
          ?
              <T {...{literal: Literals.RULE_DID_NOT_MATCH_EMPTY_QUERY}}/>
          :
          (
            matchedRule !== null
              ?
              <>✅ <a href={matchedRule.content}>{matchedRule.description}</a></>
              :
              <T {...{literal: Literals.RULE_DID_NOT_MATCH_REGEX}}/>
          )
      }</div>
    </div>
  )
}


export { Rule, RuleProps }
