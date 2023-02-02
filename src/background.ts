/*global chrome*/

import { formatString } from "./Utilities"

const canvas = new OffscreenCanvas(32, 32)
const context = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D
// context.clearRect(0, 0, 16, 16);
// context.fillStyle = '#00FF00';  // Green
// context.fillRect(0, 0, 16, 16);
context.font = '32px Arial'
context.fillText('🥸', 0, 28)
const imageData = context.getImageData(0, 0, 32, 32)
chrome.action.setIcon({ imageData }, () => { /* ... */ })

const hello = function () {
  const currentTimestampMilliseconds = new Date().getTime() / 1000
  return {
    content: '' + currentTimestampMilliseconds,
    description: 'Now ' + currentTimestampMilliseconds
  }
}
const timeConverter = (unixTimestamp: number) => {
  const a = new Date(unixTimestamp * 1000)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
  const year = a.getFullYear()
  const month = months[a.getMonth()]
  const date = a.getDate()
  const hour = a.getHours()
  const min = a.getMinutes()
  const sec = a.getSeconds()
  const day = days[a.getDay()]
  const time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec + ' ' + day
  return time
}

class Omniboxer {
  rules: any[]
  constructor () {
    this.rules = []
    this.loadRules()
  }

  subscribe = () => {
    chrome.omnibox.onInputChanged.addListener(this.inputChangeHandler)
    chrome.omnibox.onInputEntered.addListener(this.inputEnteredHandler)
    chrome.action.onClicked.addListener(this.iconClickedHandler)
    chrome.runtime.onInstalled.addListener(this.iconClickedHandler)
    chrome.storage.local.onChanged.addListener(this.loadRules)
  }

  iconClickedHandler = () => {
    chrome.runtime.openOptionsPage()
  }

  loadRules = () => {
    chrome.storage.local.get('rules').then((items) => {
      console.log('STO', items)
      this.rules = items.rules
    })
  }

  inputChangeHandler = async (query: string, suggestCallback: (a: any) => void) => {
    query = query.trim();
    const suggestions = [];
    
    console.log("RU", this.rules || []);
    for (const rule of this.rules || []) {
      const regex = new RegExp(rule.regex)
      if (query.match(regex)) {
        const url = formatString(rule.linkTemplate, query)
        suggestions.push({
          content: url,
          description: formatString(rule.name, query, url)
        })
      }
    }

    if ((query.startsWith('15') || query.startsWith('16')) && query.length >= 10) {
      const unixTimestamp = parseFloat(query.substring(0, 10))
      timeConverter(unixTimestamp)
      let finish = ''
      if (Math.round(unixTimestamp) === unixTimestamp) {
        finish = '.0'
      }
      suggestions.push({
        content: '' + unixTimestamp + finish,
        description: timeConverter(unixTimestamp)
      })
    };
    suggestions.push(hello())
    suggestCallback(suggestions)
  }

  inputEnteredHandler = async (text: string) => {
    if (text.startsWith('http')) {
      chrome.tabs.create({ url: text })
    };
  }
}

const goose = new Omniboxer()
goose.subscribe()
