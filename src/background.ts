// Background service worker for OmniBazaar marketplace extension

// Extension lifecycle
chrome.runtime.onInstalled.addListener((details) => {
  console.log('OmniBazaar Marketplace extension installed', details);
  
  // Set up default settings
  chrome.storage.local.set({
    marketplace: {
      defaultCurrency: 'OMNI',
      notifications: true,
      searchHistory: [],
      favorites: [],
      settings: {
        enableSecureSend: true,
        autoEscrow: false,
        preferredEscrowAgent: null,
      },
    },
  });
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('OmniBazaar Marketplace extension started');
});

// Message handling for communication with content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  switch (message.type) {
    case 'GET_SETTINGS':
      handleGetSettings(sendResponse);
      return true; // Indicates async response
      
    case 'UPDATE_SETTINGS':
      handleUpdateSettings(message.payload, sendResponse);
      return true;
      
    case 'NOTIFICATION':
      handleNotification(message.payload);
      break;
      
    case 'ESCROW_UPDATE':
      handleEscrowUpdate(message.payload);
      break;
      
    default:
      console.warn('Unknown message type:', message.type);
  }
});

// Settings management
async function handleGetSettings(sendResponse: (response: any) => void) {
  try {
    const result = await chrome.storage.local.get(['marketplace']);
    sendResponse({ success: true, data: result.marketplace });
  } catch (error) {
    console.error('Error getting settings:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleUpdateSettings(payload: any, sendResponse: (response: any) => void) {
  try {
    await chrome.storage.local.set({ marketplace: payload });
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Notification management
function handleNotification(payload: { title: string; message: string; type?: string }) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '/icons/icon-48.png',
    title: payload.title,
    message: payload.message,
  });
}

// Escrow system updates
function handleEscrowUpdate(payload: { escrowId: string; status: string; amount: string }) {
  // Handle escrow status updates
  console.log('Escrow update:', payload);
  
  // Notify user about escrow status changes
  handleNotification({
    title: 'SecureSend Update',
    message: `Escrow ${payload.escrowId} status: ${payload.status}`,
  });
}

// Alarm handling for periodic tasks
chrome.alarms.onAlarm.addListener((alarm) => {
  switch (alarm.name) {
    case 'check-escrow-status':
      checkEscrowStatuses();
      break;
    case 'sync-listings':
      syncListings();
      break;
  }
});

// Set up periodic alarms
chrome.alarms.create('check-escrow-status', { periodInMinutes: 5 });
chrome.alarms.create('sync-listings', { periodInMinutes: 15 });

// Check escrow statuses periodically
async function checkEscrowStatuses() {
  // Implementation will connect to blockchain to check escrow updates
  console.log('Checking escrow statuses...');
}

// Sync listings with IPFS network
async function syncListings() {
  // Implementation will sync listing data with IPFS
  console.log('Syncing listings...');
}

// Context menu setup
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'create-listing') {
    // Open popup to create listing
    chrome.action.openPopup();
  }
});

// Tab updates for content script communication
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Inject content script functionality if needed
    console.log('Tab updated:', tab.url);
  }
});

export {}; // Make this a module 