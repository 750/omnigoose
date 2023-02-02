import { useEffect, useRef, useState, MouseEvent, useContext } from "react";
import { Literals } from "./Literals";
import { LanguageContext } from "./QueryContext";
import { T } from "./t";

const DEFAULT_DURATION = 1000;

interface buttonProps {
  isDumb?: boolean;
  onClick: (e: MouseEvent) => Promise<any>;
  isImportant?: boolean;
  defaultTextLiteral: Literals;
  successTextLiteral?: Literals;
  failureTextLiteral?: Literals;
  failureDuration?: number;
  successDuration?: number;
}
interface buttonsListProps {
  bts: buttonProps[]
}
const DynamicButton = (props: buttonProps) => {
  const [isSuccess, setSuccess] = useState<boolean | null>(null)
  const [width, setWidth] = useState<number | null>(null)
  const aRef = useRef<HTMLButtonElement>(null)

  const clickHandler = (e: MouseEvent) => {
    if (props.isDumb === true) {
      props.onClick(e)
    } else {
      setWidth(aRef.current!.offsetWidth)
      props.onClick(e).then(() => {
        setSuccess(true)
        setTimeout(() => {
          setSuccess(null)
          setWidth(null)
        }, (props.successDuration === undefined ? DEFAULT_DURATION : props.successDuration))
      }).catch(() => {
        setSuccess(false)
        setTimeout(() => {
          setSuccess(null)
          setWidth(null)
        }, (props.failureDuration === undefined ? DEFAULT_DURATION : props.failureDuration))
      })
    }
  }

  return (
    <button
      style={(isSuccess !== null) ? { minWidth: width + 'px', color: (isSuccess ? 'green' : "red") } : {}}
      className={props.isImportant ? 'importantButton' : ''}
      ref={aRef}
      onClick={isSuccess === null ? clickHandler : undefined}
    >
      {
        isSuccess === null
          ?
          <T {...{ literal: props.defaultTextLiteral }} />
          :
          (
            isSuccess === true
              ?
              (props.successTextLiteral === undefined ? '✅' : <T {...{ literal: props.successTextLiteral }} />)

              :
              (props.failureTextLiteral === undefined ? '😡' : <T {...{ literal: props.failureTextLiteral }} />)
          )
      }
    </button>
  )
}

const ButtonsList = (props: buttonsListProps) => {
  return (
    <div className="button">
      {props.bts.map((button) => DynamicButton(button))}
    </div>
  )
}


export { DynamicButton, ButtonsList }