const express = require('express')
const { chromium } = require('playwright')

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json({ limit: '10mb' }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Scrape endpoint
app.post('/scrape', async (req, res) => {
  const { url, selectors, waitFor } = req.body

  if (!url) {
    return res.status(400).json({ success: false, error: 'url is required' })
  }

  let browser = null

  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'pt-BR',
    })

    const page = await context.newPage()

    // Set a reasonable timeout
    page.setDefaultTimeout(30000)

    await page.goto(url, { waitUntil: waitFor || 'networkidle', timeout: 45000 })

    let data = []

    if (selectors && typeof selectors === 'object') {
      // Multi-selector extraction: collect rows based on the first selector's count
      const selectorKeys = Object.keys(selectors)

      if (selectorKeys.length === 0) {
        // No selectors provided: return page title and text
        const title = await page.title()
        const bodyText = await page.evaluate(() => document.body.innerText)
        data = [{ title, bodyText: bodyText.slice(0, 5000) }]
      } else {
        // Use the first selector to determine row count
        const primarySelector = selectors[selectorKeys[0]]
        const count = await page.$$eval(primarySelector, (els) => els.length)

        for (let i = 0; i < count; i++) {
          const row = {}
          for (const [key, selector] of Object.entries(selectors)) {
            try {
              row[key] = await page.$$eval(
                selector,
                (els, idx) => (els[idx] ? els[idx].textContent?.trim() || '' : null),
                i
              )
              // For link selectors, also grab href
              if (key === 'link') {
                row[key] = await page.$$eval(
                  selector,
                  (els, idx) => {
                    const el = els[idx]
                    if (!el) return null
                    return el.getAttribute('href') || el.textContent?.trim() || null
                  },
                  i
                )
              }
            } catch {
              row[key] = null
            }
          }
          data.push(row)
        }
      }
    } else {
      // No selectors: return full page text
      const bodyText = await page.evaluate(() => document.body.innerText)
      data = [{ bodyText: bodyText.slice(0, 10000) }]
    }

    await browser.close()
    browser = null

    return res.json({
      success: true,
      data,
      url,
      scrapedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[playwright-worker] Scrape error:', err.message)

    if (browser) {
      try {
        await browser.close()
      } catch (_) {}
    }

    return res.status(500).json({
      success: false,
      error: err.message,
      url,
      scrapedAt: new Date().toISOString(),
    })
  }
})

app.listen(PORT, () => {
  console.log(`[playwright-worker] Listening on port ${PORT}`)
})
