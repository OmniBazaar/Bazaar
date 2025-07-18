// Background service worker for OmniBazaar marketplace extension

// Extension lifecycle
chrome.runtime.onInstalled.addListener((_details) => {
  // Set up default settings
  void chrome.storage.local.set({
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
  // Extension started
});

// Message handling for communication with content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'GET_SETTINGS':
      void handleGetSettings(sendResponse);
      return true; // Indicates async response
      
    case 'UPDATE_SETTINGS':
      void handleUpdateSettings(message.payload, sendResponse);
      return true;
      
    case 'NOTIFICATION':
      void handleNotification(message.payload);
      return false;
      
    case 'ESCROW_UPDATE':
      void handleEscrowUpdate(message.payload);
      return false;
      
    default:
      return false;
  }
});

// Settings management
async function handleGetSettings(sendResponse: (response: unknown) => void) {
  try {
    const result = await chrome.storage.local.get(['marketplace']);
    const marketplaceData = result['marketplace'] as unknown;
    sendResponse({ success: true, data: marketplaceData });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    sendResponse({ success: false, error: errorMessage });
  }
}

async function handleUpdateSettings(payload: unknown, sendResponse: (response: unknown) => void) {
  try {
    await chrome.storage.local.set({ marketplace: payload });
    sendResponse({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    sendResponse({ success: false, error: errorMessage });
  }
}

// Notification management
async function handleNotification(payload: { title: string; message: string; type?: string }) {
  try {
    await chrome.notifications.create({
      type: 'basic',
      iconUrl: '/icons/icon-48.png',
      title: payload.title,
      message: payload.message,
    });
  } catch {
    // Notification creation failed silently
  }
}

// Escrow system updates
async function handleEscrowUpdate(payload: { escrowId: string; status: string; amount: string }) {
  // Handle escrow status updates
  
  // Notify user about escrow status changes
  void handleNotification({
    title: 'SecureSend Update',
    message: `Escrow ${payload.escrowId} status: ${payload.status}`,
  });
}

// Alarm handling for periodic tasks
chrome.alarms.onAlarm.addListener((alarm) => {
  switch (alarm.name) {
    case 'check-escrow-status':
      void checkEscrowStatuses();
      break;
    case 'sync-listings':
      void syncListings();
      break;
  }
});

// Set up periodic alarms
void chrome.alarms.create('check-escrow-status', { periodInMinutes: 5 });
void chrome.alarms.create('sync-listings', { periodInMinutes: 15 });

// Check escrow statuses periodically
async function checkEscrowStatuses() {
  // Implementation will connect to blockchain to check escrow updates
}

// Sync listings with IPFS network
async function syncListings() {
  // Implementation will sync listing data with IPFS
}

// Context menu setup
chrome.contextMenus.onClicked.addListener((info, _tab) => {
  if (info.menuItemId === 'create-listing') {
    // Open popup to create listing
    void chrome.action.openPopup();
  }
});

// Tab updates for content script communication
chrome.tabs.onUpdated.addListener((tabId, changeInfo, _tab) => {
  if (changeInfo.status === 'complete' && _tab.url) {
    // Inject content script functionality if needed
  }
});

export {}; // Make this a module 