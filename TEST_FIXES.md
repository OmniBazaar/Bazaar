# Test Fixes and Improvements

## Current Issues and Required Fixes

### 1. CreateListingDialog.tsx
- [ ] Update coordinates object to use correct property names:
  ```typescript
  coordinates: { latitude: 0, longitude: 0 }  // instead of lat/lng
  ```
- [ ] Add required fields to seller object:
  ```typescript
  seller: {
    id: 'temp-id',  // Add this
    name: '',
    avatar: '',    // Add this
    rating: 0,
    contactInfo: {
      email: '',
      phone: ''
    }
  }
  ```
- [ ] Add required fields to initial state:
  ```typescript
  {
    currency: 'USD',
    category: '',
    tags: [],
    images: [],
    status: 'active'
  }
  ```

### 2. MarketplacePage.tsx
- [ ] Update theme color references to use new nested structure:
  ```typescript
  // Change from:
  color: ${props => props.theme.colors.text}
  // To:
  color: ${props => props.theme.colors.text.primary}
  color: ${props => props.theme.colors.text.secondary}
  ```

### 3. Theme Updates
- [x] Update theme.ts to use nested text properties:
  ```typescript
  text: {
    primary: '#212121',
    secondary: '#757575',
  }
  ```

### 4. Type Definitions
- [x] Verify ListingMetadata includes cid property
- [x] Verify import paths in test files are correct

## Test File Status
- [x] ListingCard.test.tsx - Correct imports and structure
- [x] ListingFilters.test.tsx - Correct imports and structure
- [x] CreateListingDialog.test.tsx - Needs review after component updates

## Next Steps
1. Fix CreateListingDialog component
2. Update MarketplacePage theme references
3. Run tests to verify fixes
4. Address any remaining TypeScript errors

## Notes
- All test files are now running only in the Bazaar module
- Legacy folders are being ignored via Jest configuration
- Theme structure has been updated to support nested text properties 