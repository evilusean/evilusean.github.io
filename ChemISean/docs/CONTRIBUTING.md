# Contributing to Dual Periodic Tables

Thank you for your interest in contributing! This project welcomes contributions from everyone.

## 🤝 How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Screenshots if applicable

### Suggesting Enhancements

We welcome feature suggestions! Please open an issue with:
- Clear description of the feature
- Use case and benefits
- Mockups or examples if applicable
- Implementation ideas (optional)

### Code Contributions

1. **Fork the repository**
2. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Test thoroughly** in multiple browsers
5. **Commit with clear messages**:
   ```bash
   git commit -m "Add: Brief description of changes"
   ```
6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request**

## 📋 Contribution Guidelines

### Code Style

- Use consistent indentation (2 spaces)
- Follow existing naming conventions
- Add comments for complex logic
- Keep functions small and focused
- Use meaningful variable names

### JavaScript
```javascript
// Good
function calculateSpiralPosition(element, index, centerX, centerY) {
    const radius = baseRadius + (element.octave - 1) * radiusIncrement;
    return { x, y, radius };
}

// Avoid
function calc(e,i,x,y) {
    let r = 50 + (e.o - 1) * 60;
    return {x,y,r};
}
```

### CSS
```css
/* Good - Use CSS custom properties */
.element {
    background: var(--bg-secondary);
    color: var(--text-primary);
}

/* Avoid - Hard-coded colors */
.element {
    background: #1a1f3a;
    color: #e0e6ed;
}
```

### HTML
```html
<!-- Good - Semantic and accessible -->
<button class="nav-btn" aria-label="Switch to classic view">
    Classic View
</button>

<!-- Avoid - Non-semantic -->
<div onclick="switchView()">Classic View</div>
```

## 🎯 Areas for Contribution

### High Priority
- [ ] Additional element properties (melting/boiling points)
- [ ] Element search functionality
- [ ] Mobile UX improvements
- [ ] Accessibility enhancements
- [ ] Performance optimizations

### Medium Priority
- [ ] Audio playback for Russell octaves
- [ ] 3D visualization option
- [ ] Element comparison tool
- [ ] Discovery timeline
- [ ] Quiz/game mode

### Low Priority
- [ ] Additional themes
- [ ] Print stylesheet
- [ ] Export functionality
- [ ] Keyboard shortcuts
- [ ] Animation options

## 🧪 Testing

Before submitting a PR, please test:

1. **Functionality**
   - All features work as expected
   - No console errors
   - Modal opens/closes correctly
   - Theme toggle works
   - Both views display properly

2. **Browsers**
   - Chrome/Edge (latest)
   - Firefox (latest)
   - Safari (latest)
   - Mobile browsers

3. **Responsive Design**
   - Desktop (1920x1080)
   - Laptop (1366x768)
   - Tablet (768x1024)
   - Mobile (375x667)

4. **Accessibility**
   - Keyboard navigation
   - Screen reader compatibility
   - Color contrast
   - Focus indicators

## 📝 Element Data Contributions

When adding or updating element data:

1. **Verify accuracy** from reliable sources
2. **Maintain consistency** with existing format
3. **Include all required fields**:
   ```json
   {
       "number": 1,
       "symbol": "H",
       "name": "Hydrogen",
       "mass": 1.008,
       "category": "nonmetal",
       "row": 1,
       "col": 1,
       "group": 1,
       "period": 1,
       "block": "s",
       "electron_config": "1s¹",
       "discovery": "1766 by Henry Cavendish",
       "summary": "Description here",
       "wikipedia": "https://en.wikipedia.org/wiki/Hydrogen",
       "russell_octave": 1,
       "russell_tone": "1+",
       "russell_pressure_side": "generative",
       "russell_position": "start"
   }
   ```
4. **Test with test.html** to verify data integrity
5. **Cite sources** in PR description

## 🎨 Design Contributions

When proposing design changes:

1. **Maintain consistency** with existing design
2. **Consider accessibility** (contrast, readability)
3. **Test both themes** (dark and light)
4. **Provide mockups** or screenshots
5. **Explain rationale** for changes

## 📚 Documentation Contributions

Documentation improvements are always welcome:

- Fix typos or unclear explanations
- Add examples or tutorials
- Improve code comments
- Translate to other languages
- Create video tutorials

## 🚫 What We Don't Accept

- Breaking changes without discussion
- Code that requires build tools or frameworks
- Features that significantly increase file size
- Changes that break existing functionality
- Contributions without proper testing
- Plagiarized content

## 💬 Communication

- **Issues**: For bugs and feature requests
- **Pull Requests**: For code contributions
- **Discussions**: For questions and ideas

## 🏆 Recognition

Contributors will be:
- Listed in project credits
- Mentioned in release notes
- Appreciated in the community

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## ❓ Questions?

Feel free to open an issue with the "question" label if you need help or clarification.

---

**Thank you for making this project better!** 🎉
