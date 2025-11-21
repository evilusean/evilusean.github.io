# Prime Factorize A Sean

A comprehensive prime factorization tool with tree visualization, nth prime finder, and animated screensaver. This multi-purpose website helps you explore prime numbers and their properties.

## Features

### 1. Prime Factorization Tree
- Enter any number to see its prime factors displayed as a visual tree
- Tree branches show how numbers break down into factors using ASCII characters (`/`, `\`, `├──`, `└──`)
- Displays the complete factorization path until all factors are prime numbers
- Shows the final prime factorization result

### 2. Find Nth Prime Number
- Enter a position (e.g., 182) to find the prime number at that position
- Works with very large or small numbers
- Sequentially checks numbers to find the nth prime
- Shows progress during calculation for large searches

### 3. Animated Prime Multiples Screensaver
- Beautiful animated background showing prime numbers and their multiples
- Prime numbers drop from the top of the screen with their multiplication results
- Shows multiples from 1× to 10× for each prime (e.g., 3×2=6, 3×3=9, 3×4=12, etc.)
- Customizable prime range (start and end values)
- Adjustable animation speed
- Toggle on/off functionality

## Technical Details

### Prime Number Checking
- Uses modulo (`%`) operator to efficiently check if a number is prime
- Optimized algorithm that checks divisibility up to the square root
- Handles even numbers separately for better performance

### Tree Visualization
- Recursive tree structure showing factorization paths
- ASCII art representation with branches connecting factors
- Each level shows how a number factors into smaller components

### Screensaver Algorithm
- Generates falling elements for primes within the specified range
- Each element shows: `prime × multiplier = result`
- Elements fall from random horizontal positions
- Automatically removes elements that fall off screen

## Getting Started

1. Clone this repository
2. Open `index.html` in your browser to view locally
3. Start using the tools!

## GitHub Pages Setup

To deploy this site to GitHub Pages:

1. Push this repository to GitHub
2. Go to your repository settings
3. Navigate to "Pages" in the left sidebar
4. Under "Source", select your branch (usually `main` or `master`)
5. Click "Save"
6. Your site will be available at `https://[username].github.io/[repository-name]`

## Project Structure

```
.
├── index.html      # Main HTML file with all tool sections
├── styles.css      # Stylesheet with screensaver and tree styling
├── script.js       # JavaScript with all prime number algorithms
└── README.md       # This file
```

## Usage Examples

### Prime Factorization
1. Navigate to the "Factorize" section
2. Enter a number (e.g., 18)
3. Click "Factorize" to see the tree
4. View the tree structure and final prime factors

### Finding Nth Prime
1. Navigate to the "Find Prime" section
2. Enter a position (e.g., 182 for the 182nd prime)
3. Click "Find Prime"
4. Wait for the result (may take time for large positions)

### Screensaver Controls
1. Navigate to the "Screensaver" section
2. Set the prime range (start and end values)
3. Adjust the speed slider
4. Click "Update Screensaver" to apply changes
5. Use "Toggle Screensaver" to start/stop the animation

## Future Enhancements

- GCF (Greatest Common Factor) calculation using polynomials with multiple terms
- Interactive prime number tree with clickable branches
- Expandable prime multiples visualization when clicking on falling elements
- Additional mathematical tools and visualizations

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Responsive design works on mobile devices

## License

This project is open source and available for use.

## TODO / Future Sean Problems : 
- Z index of scrolling top bar for screensaver drops 
- Add text glow to titles
- maybe move the 'Find Nth Prime Number' to top bar, doesn't need to take up that much space
- maybe move screensaver as well to top bar, also taking up tonnes of real estate
- Add a calculator so user can quickly do math
