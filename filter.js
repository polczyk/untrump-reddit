import DOMQuery from './dom-query'


export default class Filter {
  constructor() {
    this.matches = {}
    this.matchCount = 0
  }


  async run() {
    this.reset()
    await this.getFilters()
      .then(this.processFilters.bind(this), err => console.log(err))
      .then(this.updateState.bind(this))
  }


  // Reset DOM listing to their default state.
  // Clear the matches object.
  reset() {
    Object.keys(this.matches).forEach(key => {
      matchData.matches[key].forEach(match => {
        match.classList.remove('untrumped')
      })
    }) 

    this.matchCount = 0
    this.matches = {}
  }


  getFilters() {
    const message = {
      action: 'keywords'
    }

    return browser.runtime.sendMessage(message)
  }


  processFilters(filters) {
    const listings = DOMQuery.getEntries()
    listings.forEach(listing => {
      filters.forEach(filter => {
        this.compare(listing, filter)
      })
    })

    console.log('ende')
    return true
  }


  // Check if listing's title contains 
  // user-defined filter word.
  compare(listing, word) {
    if (listing.classList.contains('promoted')) 
      return

    const title = DOMQuery.getEntryTitle(listing).toLowerCase()

    if (title.includes(word.toLowerCase())) {
      console.log(`%cRemoved ${title}`, "color: red")
      this.applyFilter(listing)
      this.matchCount++
      if (!this.matches[word]) {
        this.matches[word] = []
      }

      this.matches[word].push(listing)
    }
  }


  applyFilter(targetListing) {
    targetListing.classList.add('untrumped')
  }


  // Send filter data to background script
  // to update the badge and create a popup menu.
  updateState() {
    const options = {
      action: 'newmatches',
      removed: this.matchCount,
      entries: this.countMatchesByWord()
    }
    
    browser.runtime.sendMessage(options)
      .then(res => console.log(res), 
            err => console.log(err))
  }
  

  // Count how many listings are matched for each filter.
  countMatchesByWord() {
    const o = {}

    Object.keys(this.matches)
      .forEach(key => {
        o[key] = this.matches[key].length
      })

    return o
  }


  toggle(word) {
    this.matches[word]
      .forEach(el => {
        el.classList.toggle('untrumped')
      })
  }
}