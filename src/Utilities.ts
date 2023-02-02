import { RuleProps } from "./Rule"

function generateId () {
    // https://gist.github.com/6174/6062387
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
const formatString = (template: string, query?: string, url?: string) => (
    template
      .replace(/{query}/g, (match) => query !== undefined ? query : match)
      .replace(/{url}/g, (match) => url !== undefined ? url : match)
  )
class InMemoryChromeStorageShim {
    storage: Map<string, any>
    constructor () {
        this.storage = new Map()
    }

    get = (keys: string) => {
        return new Promise( (resolve: (a: any) => void)=> {
            if (this.storage.has(keys)) {
                resolve( {keys: this.storage.get(keys)} )
            } else {
                resolve( {} )
            }
        })
    }

    set = (items: Object) => {
        return new Promise( (resolve: (value?: string)=> void) =>{
            for (const item of Object.entries(items)) {
                this.storage.set(item[0], item[1])
            }
            resolve()
        })
    }

    clear = () => {
        return new Promise((resolve: (a?: any) => void) => {
            this.storage.clear()
            resolve()
        })
    }
}

const matchRule = (rule: RuleProps, query: string) => {
    const regex = new RegExp(rule.regex)
    if (query.match(regex)) {
      const url = formatString(rule.linkTemplate, query)
      return {
        content: url,
        description: formatString(rule.name, query, url)
      }
    } else {
        return null
    }
}

export { InMemoryChromeStorageShim, generateId, matchRule, formatString }

