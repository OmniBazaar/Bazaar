// Content script for OmniBazaar marketplace extension
// This script runs on web pages to detect marketplace-related content

// Declare the Window interface extension at module level
declare global {
  interface Window {
    omniBazaarContentScript?: boolean;
  }
}

interface MarketplaceData {
  title?: string;
  price?: string;
  description?: string;
  images?: string[];
  seller?: string;
}

interface ProductInfo {
  title: string;
  price: string;
  description: string;
  images: string[];
  url: string;
}

// Function definitions at program root
function detectMarketplaceData(sendResponse: (response: MarketplaceData) => void) {
  const data: MarketplaceData = {};
  
  // Try to detect marketplace data from various e-commerce sites
  const titleSelectors = [
    'h1[data-automation-id="product-title"]', // Walmart
    'span#productTitle', // Amazon
    'h1[itemprop="name"]', // eBay
    'h1.x-item-title', // eBay
    'h1[data-testid="product-title"]', // Target
    '.pdp-product-name', // Target
    'h1.product-title', // Generic
  ];

  const priceSelectors = [
    '[data-automation-id="product-price"] .sr-only',
    '.a-price-whole',
    '.notranslate',
    '#prcIsum',
    '[data-testid="product-price"]',
    '.product-price'
  ];

  // Get title
  for (const selector of titleSelectors) {
    const element = document.querySelector(selector);
    if (element?.textContent) {
      data.title = element.textContent.trim();
      break;
    }
  }

  // Get price
  for (const selector of priceSelectors) {
    const element = document.querySelector(selector);
    if (element?.textContent) {
      data.price = element.textContent.trim();
      break;
    }
  }

  sendResponse(data);
}

function extractProductInfo(sendResponse: (response: ProductInfo) => void) {
  const productInfo: ProductInfo = {
    title: '',
    price: '',
    description: '',
    images: [],
    url: window.location.href
  };

  // Enhanced product detection
  const titleElement = document.querySelector('h1') ?? 
                      document.querySelector('[data-testid="product-title"]') ??
                      document.querySelector('.product-title');
  if (titleElement) {
    productInfo.title = titleElement.textContent?.trim() ?? '';
  }

  const priceElement = document.querySelector('[data-testid="product-price"]') ??
                      document.querySelector('.price') ??
                      document.querySelector('.product-price');
  if (priceElement) {
    productInfo.price = priceElement.textContent?.trim() ?? '';
  }

  const descElement = document.querySelector('[data-testid="product-description"]') ??
                     document.querySelector('.description') ??
                     document.querySelector('.product-description');
  if (descElement) {
    productInfo.description = descElement.textContent?.trim() ?? '';
  }

  // Extract images
  const images = document.querySelectorAll('img[data-testid="product-image"], .product-image img, .gallery img');
  productInfo.images = Array.from(images)
    .map(img => (img as HTMLImageElement).src)
    .filter(src => src && !src.includes('placeholder'))
    .slice(0, 5);

  sendResponse(productInfo);
}

function injectOmniBazaarWidget() {
  // Check if widget already exists
  if (document.getElementById('omnibazaar-widget')) {
    return;
  }

  const widget = document.createElement('div');
  widget.id = 'omnibazaar-widget';
  widget.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 300px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    cursor: pointer;
    transition: transform 0.2s ease;
  `;

  widget.innerHTML = `
    <div style="display: flex; align-items: center; margin-bottom: 10px;">
      <div style="width: 24px; height: 24px; background: white; border-radius: 50%; margin-right: 10px; display: flex; align-items: center; justify-content: center;">
        🌐
      </div>
      <div style="font-weight: 600;">OmniBazaar</div>
    </div>
    <div style="font-size: 12px; opacity: 0.9; line-height: 1.4;">
      This product could be listed on OmniBazaar marketplace
    </div>
    <button style="
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.3);
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      margin-top: 10px;
      cursor: pointer;
      font-size: 12px;
      width: 100%;
    ">Import to OmniBazaar</button>
  `;

  widget.addEventListener('mouseenter', () => {
    widget.style.transform = 'scale(1.02)';
  });

  widget.addEventListener('mouseleave', () => {
    widget.style.transform = 'scale(1)';
  });

  widget.addEventListener('click', () => {
    // Open OmniBazaar extension or redirect to marketplace
    if (chrome?.runtime?.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'OPEN_CREATE_LISTING',
        data: {
          url: window.location.href,
          title: document.title
        }
      });
    }
  });

  document.body.appendChild(widget);

  // Auto-hide after 10 seconds
  setTimeout(() => {
    widget.style.opacity = '0.7';
  }, 10000);
}

function analyzePageForMarketplace() {
  const url = window.location.href;
  const hostname = window.location.hostname;

  // Check if this looks like a product/marketplace page
  const marketplaceIndicators = [
    'product', 'item', 'listing', 'buy', 'shop', 'store',
    'amazon.com', 'ebay.com', 'etsy.com', 'alibaba.com'
  ];

  const hasMarketplaceIndicator = marketplaceIndicators.some(indicator => 
    url.toLowerCase().includes(indicator) || hostname.toLowerCase().includes(indicator)
  );

  const productSelectors = [
    'h1[data-automation-id="product-title"]',
    'span#productTitle',
    '[data-testid="product-price"]',
    '.product-title',
    '.price'
  ];
  
  const hasProductElements = productSelectors.some(selector => 
    document.querySelector(selector) !== null
  );

  if (hasMarketplaceIndicator || hasProductElements) {
    // Small delay to let page load
    setTimeout(injectOmniBazaarWidget, 2000);
  }
}

// Check if already injected
if (!window.omniBazaarContentScript) {
  window.omniBazaarContentScript = true;

  // Listen for messages from extension
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case 'DETECT_MARKETPLACE_DATA':
        detectMarketplaceData(sendResponse);
        return true; // Indicates async response
      case 'EXTRACT_PRODUCT_INFO':
        extractProductInfo(sendResponse);
        return true;
      case 'INJECT_WIDGET':
        injectOmniBazaarWidget();
        break;
      default:
        break;
    }
  });

  // Auto-analyze page on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', analyzePageForMarketplace);
  } else {
    analyzePageForMarketplace();
  }
}

export {}; // Make this a module 