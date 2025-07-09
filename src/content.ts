// Content script for OmniBazaar marketplace extension
// This script runs on web pages to detect marketplace-related content

// Avoid multiple injection
if (!window.omniBazaarContentScript) {
  window.omniBazaarContentScript = true;

  console.log('OmniBazaar content script loaded');

  // Listen for messages from popup or background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case 'DETECT_MARKETPLACE_DATA':
        detectMarketplaceData(sendResponse);
        return true;
        
      case 'EXTRACT_PRODUCT_INFO':
        extractProductInfo(sendResponse);
        return true;
        
      case 'INJECT_OMNIBAZAAR_WIDGET':
        injectOmniBazaarWidget();
        break;
    }
  });

  // Detect marketplace-related data on the page
  function detectMarketplaceData(sendResponse: (response: any) => void) {
    const marketplaceData = {
      hasProducts: false,
      productCount: 0,
      potentialListings: [],
      marketplace: null,
    };

    // Check for common e-commerce platforms
    if (window.location.hostname.includes('ebay.com')) {
      marketplaceData.marketplace = 'ebay';
      marketplaceData.hasProducts = true;
    } else if (window.location.hostname.includes('amazon.com')) {
      marketplaceData.marketplace = 'amazon';
      marketplaceData.hasProducts = true;
    } else if (window.location.hostname.includes('etsy.com')) {
      marketplaceData.marketplace = 'etsy';
      marketplaceData.hasProducts = true;
    }

    // Look for product elements
    const productSelectors = [
      '[data-testid*="product"]',
      '.product',
      '.item',
      '.listing',
      '[itemtype*="Product"]',
    ];

    productSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        marketplaceData.hasProducts = true;
        marketplaceData.productCount += elements.length;
      }
    });

    sendResponse(marketplaceData);
  }

  // Extract product information from the current page
  function extractProductInfo(sendResponse: (response: any) => void) {
    const productInfo = {
      title: '',
      price: '',
      description: '',
      images: [],
      category: '',
      specs: {},
    };

    // Try to extract product title
    const titleSelectors = [
      'h1',
      '[data-testid*="title"]',
      '.product-title',
      '.item-title',
    ];

    for (const selector of titleSelectors) {
      const element = document.querySelector(selector);
      if (element?.textContent?.trim()) {
        productInfo.title = element.textContent.trim();
        break;
      }
    }

    // Try to extract price
    const priceSelectors = [
      '[data-testid*="price"]',
      '.price',
      '.cost',
      '[class*="price"]',
      '[class*="cost"]',
    ];

    for (const selector of priceSelectors) {
      const element = document.querySelector(selector);
      if (element?.textContent?.match(/\$[\d,]+\.?\d*/)) {
        productInfo.price = element.textContent.trim();
        break;
      }
    }

    // Try to extract description
    const descSelectors = [
      '[data-testid*="description"]',
      '.description',
      '.product-description',
      '.item-description',
    ];

    for (const selector of descSelectors) {
      const element = document.querySelector(selector);
      if (element?.textContent?.trim()) {
        productInfo.description = element.textContent.trim().substring(0, 500);
        break;
      }
    }

    // Extract images
    const imageElements = document.querySelectorAll('img[src*="product"], img[src*="item"]');
    productInfo.images = Array.from(imageElements)
      .slice(0, 5) // Limit to 5 images
      .map(img => (img as HTMLImageElement).src)
      .filter(src => src && !src.includes('data:'));

    sendResponse(productInfo);
  }

  // Inject OmniBazaar widget for marketplace detection
  function injectOmniBazaarWidget() {
    // Check if widget already exists
    if (document.getElementById('omnibazaar-widget')) {
      return;
    }

    // Create widget container
    const widget = document.createElement('div');
    widget.id = 'omnibazaar-widget';
    widget.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      background: #2196F3;
      color: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.4;
    `;

    widget.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <strong>OmniBazaar</strong>
        <button id="omnibazaar-close" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer;">&times;</button>
      </div>
      <p style="margin: 0 0 10px 0;">Found marketplace content on this page!</p>
      <button id="omnibazaar-import" style="
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        width: 100%;
      ">Import to OmniBazaar</button>
    `;

    // Add event listeners
    const closeBtn = widget.querySelector('#omnibazaar-close');
    closeBtn?.addEventListener('click', () => {
      widget.remove();
    });

    const importBtn = widget.querySelector('#omnibazaar-import');
    importBtn?.addEventListener('click', () => {
      // Extract product info and send to extension
      extractProductInfo((productInfo) => {
        chrome.runtime.sendMessage({
          type: 'IMPORT_PRODUCT',
          payload: productInfo,
        });
        widget.remove();
      });
    });

    document.body.appendChild(widget);

    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (widget.parentNode) {
        widget.remove();
      }
    }, 10000);
  }

  // Page analysis on load
  function analyzePageForMarketplace() {
    // Check if this looks like a marketplace or product page
    const indicators = [
      'product',
      'item',
      'listing',
      'shop',
      'store',
      'buy',
      'sell',
      'price',
      'cart',
      'checkout',
    ];

    const pageText = document.body.textContent?.toLowerCase() || '';
    const url = window.location.href.toLowerCase();
    
    let marketplaceScore = 0;
    indicators.forEach(indicator => {
      if (pageText.includes(indicator) || url.includes(indicator)) {
        marketplaceScore++;
      }
    });

    // If it looks like a marketplace page, notify background
    if (marketplaceScore >= 3) {
      chrome.runtime.sendMessage({
        type: 'MARKETPLACE_DETECTED',
        payload: {
          url: window.location.href,
          score: marketplaceScore,
          domain: window.location.hostname,
        },
      });
    }
  }

  // Run analysis when page is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', analyzePageForMarketplace);
  } else {
    analyzePageForMarketplace();
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    omniBazaarContentScript?: boolean;
  }
}

export {}; 