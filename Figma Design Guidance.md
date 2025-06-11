# Figma Design Guidance

## Export Guidelines

### Primary Export Format: SVG

- Export all icons and simple graphics as SVG
- Ensure SVG files are optimized and cleaned
- Include viewBox attribute
- Remove unnecessary metadata

### Secondary Export Formats

- PNG: For complex graphics where SVG isn't suitable
- JPG: For photographic content only
- PDF: For print-ready assets
- Export at 2x resolution for retina displays

### Export from Dev Mode

- Use Dev Mode for precise measurements
- Export with "Export for Development" option
- Include padding and margins in exports
- Maintain consistent naming convention

### Prototypes and Interactions

- Create interactive prototypes for complex components
- Document all interactions and states
- Include hover, active, and disabled states
- Test all interactions before handoff

### Component-Based Approach

- Design using atomic design principles
- Create reusable components
- Document component variants
- Maintain consistent spacing and alignment

### Design Tokens

- Use design tokens for colors, typography, and spacing
- Document all token values
- Maintain token naming consistency
- Update tokens when design system changes

### Integration Process

1. Export assets from Figma
2. Optimize for web use
3. Implement in code
4. Test across devices
5. Document any issues

### Naming Conventions

- Use kebab-case for file names
- Prefix with module name
- Include size/type in name
- Example: `bazaar-icon-search-24px.svg`

### Folder Structure

```plaintext
assets/
  ├── icons/
  │   ├── navigation/
  │   ├── actions/
  │   └── status/
  ├── illustrations/
  ├── backgrounds/
  └── logos/
```

### Component Implementation

- Follow React component structure
- Use TypeScript for type safety
- Implement responsive design
- Include proper accessibility attributes

### Style Integration

- Use CSS-in-JS or styled-components
- Follow BEM naming convention
- Implement dark mode support
- Maintain consistent spacing

### Design Review Checklist

- [ ] All assets exported correctly
- [ ] Naming conventions followed
- [ ] Responsive design implemented
- [ ] Accessibility requirements met
- [ ] Performance optimized
- [ ] Cross-browser tested

### Testing

- Test on multiple devices
- Verify all interactions
- Check accessibility
- Validate responsive behavior
- Test performance

### Required Information

- Component name
- Design file link
- Export settings used
- Dependencies
- Browser support
- Performance metrics

### Version Control

- Use semantic versioning
- Document breaking changes
- Maintain changelog
- Tag releases appropriately

### Useful Links

- [Figma Design System](https://figma.com)
- [Component Library](https://components.omnibazaar.com)
- [Style Guide](https://style.omnibazaar.com)
- [Design Tokens](https://tokens.omnibazaar.com)

### Tools

- Figma
- SVG Optimizer
- Color Contrast Checker
- Accessibility Validator