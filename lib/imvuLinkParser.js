// IMVU Link Parser Service
// Handles extraction of product names and IDs from IMVU links

class IMVULinkParser {
  constructor() {
    this.productCache = new Map()
    this.cacheExpiry = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  }

  /**
   * Parse IMVU product URL and extract product ID
   * @param {string} url - IMVU product URL
   * @returns {Object} - { productId, urlType, isValid }
   */
  parseProductUrl(url) {
    if (!url || typeof url !== 'string') {
      return { productId: null, urlType: null, isValid: false }
    }

    // Clean the URL
    const cleanUrl = url.trim()
    
    // Classic IMVU URL pattern: https://www.imvu.com/shop/product.php?products_id=123456
    const classicMatch = cleanUrl.match(/products_id=(\d+)/)
    if (classicMatch) {
      return {
        productId: classicMatch[1],
        urlType: 'classic',
        isValid: true,
        originalUrl: cleanUrl
      }
    }

    // Beta IMVU URL pattern: https://www.imvu.com/next/shop/product-123456/
    const betaMatch = cleanUrl.match(/product-(\d+)/)
    if (betaMatch) {
      return {
        productId: betaMatch[1],
        urlType: 'beta',
        isValid: true,
        originalUrl: cleanUrl
      }
    }

    // French IMVU URL pattern: https://fr.imvu.com/shop/product.php?products_id=123456
    const frenchMatch = cleanUrl.match(/fr\.imvu\.com.*products_id=(\d+)/)
    if (frenchMatch) {
      return {
        productId: frenchMatch[1],
        urlType: 'classic',
        isValid: true,
        originalUrl: cleanUrl
      }
    }

    return { productId: null, urlType: null, isValid: false }
  }

  /**
   * Extract product name from IMVU page
   * @param {string} productId - IMVU product ID
   * @param {string} urlType - 'classic' or 'beta'
   * @returns {Promise<Object>} - { productName, creatorName, success }
   */
  async extractProductInfo(productId, urlType = 'classic') {
    try {
      // Check cache first
      const cached = this.getCachedProduct(productId)
      if (cached) {
        return {
          productName: cached.productName,
          creatorName: cached.creatorName,
          success: true,
          fromCache: true
        }
      }

      // Build URL based on type
      let url
      if (urlType === 'beta') {
        url = `https://www.imvu.com/next/shop/product-${productId}/`
      } else {
        url = `https://www.imvu.com/shop/product.php?products_id=${productId}`
      }

      // Fetch the page
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const html = await response.text()
      
      // Parse product name and creator
      const productInfo = this.parseProductPage(html)
      
      if (productInfo.productName) {
        // Cache the result
        this.cacheProduct(productId, productInfo)
        
        return {
          productName: productInfo.productName,
          creatorName: productInfo.creatorName,
          success: true,
          fromCache: false
        }
      } else {
        throw new Error('Could not extract product information from page')
      }

    } catch (error) {
      console.error('Error extracting product info:', error)
      return {
        productName: null,
        creatorName: null,
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Parse HTML content to extract product information
   * @param {string} html - HTML content of the product page
   * @returns {Object} - { productName, creatorName }
   */
  parseProductPage(html) {
    try {
      // This is a simplified parser - in a real implementation, you'd use a proper HTML parser
      // For now, we'll use regex patterns to extract the information
      
      let productName = null
      let creatorName = null

      // Try to extract product name from various patterns
      const namePatterns = [
        /<h1[^>]*>([^<]+)<\/h1>/i,
        /<title[^>]*>([^<]+)<\/title>/i,
        /"product_name":\s*"([^"]+)"/i,
        /class="product-title"[^>]*>([^<]+)</i
      ]

      for (const pattern of namePatterns) {
        const match = html.match(pattern)
        if (match && match[1]) {
          productName = match[1].trim()
          break
        }
      }

      // Try to extract creator name
      const creatorPatterns = [
        /by\s+([^<\n]+)/i,
        /creator[^>]*>([^<]+)</i,
        /"creator_name":\s*"([^"]+)"/i
      ]

      for (const pattern of creatorPatterns) {
        const match = html.match(pattern)
        if (match && match[1]) {
          creatorName = match[1].trim()
          break
        }
      }

      return { productName, creatorName }
    } catch (error) {
      console.error('Error parsing product page:', error)
      return { productName: null, creatorName: null }
    }
  }

  /**
   * Get cached product information
   * @param {string} productId - Product ID
   * @returns {Object|null} - Cached product info or null
   */
  getCachedProduct(productId) {
    const cached = this.productCache.get(productId)
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data
    }
    return null
  }

  /**
   * Cache product information
   * @param {string} productId - Product ID
   * @param {Object} data - Product data to cache
   */
  cacheProduct(productId, data) {
    this.productCache.set(productId, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * Parse multiple URLs and extract product information
   * @param {string[]} urls - Array of IMVU product URLs
   * @returns {Promise<Array>} - Array of parsed product information
   */
  async parseMultipleUrls(urls) {
    const results = []
    
    for (const url of urls) {
      const parsed = this.parseProductUrl(url)
      if (parsed.isValid) {
        const info = await this.extractProductInfo(parsed.productId, parsed.urlType)
        results.push({
          url,
          productId: parsed.productId,
          urlType: parsed.urlType,
          ...info
        })
      } else {
        results.push({
          url,
          productId: null,
          urlType: null,
          success: false,
          error: 'Invalid URL format'
        })
      }
    }
    
    return results
  }

  /**
   * Validate IMVU URL format
   * @param {string} url - URL to validate
   * @returns {boolean} - True if valid IMVU product URL
   */
  isValidIMVUUrl(url) {
    const parsed = this.parseProductUrl(url)
    return parsed.isValid
  }
}

// Export for use in other modules
export default IMVULinkParser
