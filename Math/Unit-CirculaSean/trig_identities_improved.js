// IMPROVED Trig identities with better "WHY" explanations
// Replace the trigIdentities array in script.js with this version

const trigIdentities = [
  {
    name: 'Sum of Sine',
    formula: 'sin(A + B) = sin A cos B + cos A sin B',
    description: 'WHY: You can\'t just add angles inside sine (sin(45°+30°) ≠ sin45°+sin30°). This formula breaks down a "weird" angle into two "nice" angles you know.',
    usage: 'WHEN TO USE: Finding exact values for non-standard angles (like 75°, 105°, 15°) by breaking them into sums of 30°, 45°, 60°.\n\nEXAMPLE: sin(75°) = sin(45°+30°) = sin45°cos30° + cos45°sin30° = (√2/2)(√3/2) + (√2/2)(1/2) = (√6+√2)/4\n\nWHY IT WORKS: Comes from rotating the unit circle point (x,y) by angle B, then by angle A.'
  },
  {
    name: 'Difference of Sine',
    formula: 'sin(A - B) = sin A cos B - cos A sin B',
    description: 'WHY: Same reason as sum—you can\'t subtract angles inside sine. This lets you find exact values for angles like 15° = 45°−30°.',
    usage: 'WHEN TO USE: Finding exact values for small angles (15°, 75°) or simplifying expressions with angle differences.\n\nEXAMPLE: sin(15°) = sin(45°−30°) = sin45°cos30° − cos45°sin30° = (√2/2)(√3/2) − (√2/2)(1/2) = (√6−√2)/4\n\nWHY IT WORKS: Geometric rotation on the unit circle, just like the sum formula but rotating backwards.'
  },
  {
    name: 'Sum of Cosine',
    formula: 'cos(A + B) = cos A cos B - sin A sin B',
    description: 'WHY: Cosine measures the x-coordinate on the unit circle. When you rotate by A+B, the new x-coordinate depends on BOTH the cos and sin of each angle.',
    usage: 'WHEN TO USE: Finding exact values for non-standard angles, or expanding cos(x+h) in calculus (derivative proofs).\n\nEXAMPLE: cos(75°) = cos(45°+30°) = cos45°cos30° − sin45°sin30° = (√2/2)(√3/2) − (√2/2)(1/2) = (√6−√2)/4\n\nWHY IT WORKS: Comes from the x-coordinate formula after rotating a unit circle point.'
  },
  {
    name: 'Difference of Cosine',
    formula: 'cos(A - B) = cos A cos B + sin A sin B',
    description: 'WHY: Same geometric reasoning as sum, but rotating backwards. Notice the sign flips to PLUS (opposite of sum).',
    usage: 'WHEN TO USE: Finding exact values for angles like 15°, or simplifying cos(x−y) expressions.\n\nEXAMPLE: cos(15°) = cos(45°−30°) = cos45°cos30° + sin45°sin30° = (√2/2)(√3/2) + (√2/2)(1/2) = (√6+√2)/4\n\nWHY IT WORKS: Geometric rotation backwards on the unit circle.'
  },
  {
    name: 'Sum of Tangent',
    formula: 'tan(A + B) = (tan A + tan B) / (1 - tan A tan B)',
    description: 'WHY: Tangent = sin/cos, so tan(A+B) = sin(A+B)/cos(A+B). Apply sum formulas to top and bottom, then divide everything by cosA·cosB to get this form.',
    usage: 'WHEN TO USE: When you only know tangent values (not sin/cos separately), or in calculus when working with slopes.\n\nEXAMPLE: tan(75°) = tan(45°+30°) = (tan45°+tan30°)/(1−tan45°·tan30°) = (1+1/√3)/(1−1/√3) = (√3+1)/(√3−1)\n\nWHY IT WORKS: Algebraic manipulation of the sin/cos sum formulas.'
  },
  {
    name: 'Double Angle Sine',
    formula: 'sin(2θ) = 2 sin θ cos θ',
    description: 'WHY: This is just the sum formula sin(θ+θ) simplified. It shows that doubling an angle creates a product of sin and cos.',
    usage: 'WHEN TO USE: (1) Simplifying sin(2x) into something with only x. (2) Integration: ∫sinx·cosx dx = ½sin(2x). (3) Finding sin(2θ) when you know sinθ and cosθ.\n\nEXAMPLE: If sinθ=3/5 and cosθ=4/5, then sin(2θ) = 2(3/5)(4/5) = 24/25\n\nWHY IT WORKS: Special case of sin(A+B) where A=B=θ.'
  },
  {
    name: 'Double Angle Cosine',
    formula: 'cos(2θ) = cos² θ - sin² θ = 2cos² θ - 1 = 1 - 2sin² θ',
    description: 'WHY: Three forms give you flexibility. Use cos²−sin² if you know both. Use 2cos²−1 if you only know cos. Use 1−2sin² if you only know sin.',
    usage: 'WHEN TO USE: (1) Power reduction: solving cos²θ or sin²θ. (2) Integration: ∫cos²x dx uses cos(2x)=2cos²x−1 → cos²x=(1+cos2x)/2. (3) Finding cos(2θ) from sinθ or cosθ.\n\nEXAMPLE: If sinθ=3/5, then cos(2θ) = 1−2sin²θ = 1−2(9/25) = 1−18/25 = 7/25\n\nWHY IT WORKS: Special case of cos(A+B) where A=B=θ, then use sin²+cos²=1 to get other forms.'
  },
  {
    name: 'Double Angle Tangent',
    formula: 'tan(2θ) = 2 tan θ / (1 - tan² θ)',
    description: 'WHY: Derived from tan(θ+θ) using the tangent sum formula. Useful when you only know tanθ.',
    usage: 'WHEN TO USE: When you have tanθ and need tan(2θ) without finding sin/cos first. Common in physics (projectile motion, optics).\n\nEXAMPLE: If tanθ=1/2, then tan(2θ) = 2(1/2)/(1−(1/2)²) = 1/(1−1/4) = 1/(3/4) = 4/3\n\nWHY IT WORKS: Special case of tan(A+B) where A=B=θ.'
  },
  {
    name: 'Pythagorean Identity',
    formula: 'sin² θ + cos² θ = 1',
    description: 'WHY: On the unit circle, any point is (cosθ, sinθ). By definition of a circle, x²+y²=1, so cos²θ+sin²θ=1. This is THE fundamental identity.',
    usage: 'WHEN TO USE: (1) Finding sinθ from cosθ (or vice versa). (2) Simplifying expressions with sin² or cos². (3) Proving other identities. (4) Solving trig equations.\n\nEXAMPLE: If cosθ=4/5, then sin²θ = 1−cos²θ = 1−16/25 = 9/25, so sinθ = ±3/5 (sign depends on quadrant)\n\nWHY IT WORKS: Direct consequence of the unit circle definition: radius = 1.'
  },
  {
    name: 'Secant Identity',
    formula: '1 + tan² θ = sec² θ',
    description: 'WHY: Divide the Pythagorean identity sin²θ+cos²θ=1 by cos²θ. You get (sin²/cos²) + 1 = 1/cos², which is tan²θ + 1 = sec²θ.',
    usage: 'WHEN TO USE: (1) Calculus: derivative of tanx is sec²x. (2) Integration: ∫tan²x dx = ∫(sec²x−1)dx. (3) Simplifying expressions with tan and sec together.\n\nEXAMPLE: Simplify tan²x + 1 → sec²x. Or solve: if tanx=2, then secx = ±√(1+tan²x) = ±√5\n\nWHY IT WORKS: Algebraic manipulation of sin²+cos²=1 by dividing by cos².'
  },
  {
    name: 'Cosecant Identity',
    formula: '1 + cot² θ = csc² θ',
    description: 'WHY: Divide the Pythagorean identity sin²θ+cos²θ=1 by sin²θ. You get 1 + (cos²/sin²) = 1/sin², which is 1 + cot²θ = csc²θ.',
    usage: 'WHEN TO USE: (1) Calculus: derivative of cotx is −csc²x. (2) Integration: ∫cot²x dx = ∫(csc²x−1)dx. (3) Simplifying expressions with cot and csc.\n\nEXAMPLE: Simplify 1 + cot²x → csc²x. Or solve: if cotx=3/4, then cscx = ±√(1+cot²x) = ±√(1+9/16) = ±5/4\n\nWHY IT WORKS: Algebraic manipulation of sin²+cos²=1 by dividing by sin².'
  },
  {
    name: 'Half Angle Sine',
    formula: 'sin(θ/2) = ±√[(1 - cos θ) / 2]',
    description: 'WHY: Derived from the double angle formula cos(2α)=1−2sin²α. Set α=θ/2, so cos θ = 1−2sin²(θ/2), then solve for sin(θ/2).',
    usage: 'WHEN TO USE: (1) Finding exact values: sin(15°) from cos(30°). (2) Integration: ∫√(1−cosx) dx. (3) When you know cosθ but need sin(θ/2).\n\nEXAMPLE: Find sin(15°). Since 15°=30°/2 and cos30°=√3/2, sin(15°) = √[(1−√3/2)/2] = √[(2−√3)/4] = (√(2−√3))/2 ≈ 0.259\n\nWHY IT WORKS: Rearranging the double angle cosine formula cos(2α)=1−2sin²α.'
  },
  {
    name: 'Half Angle Cosine',
    formula: 'cos(θ/2) = ±√[(1 + cos θ) / 2]',
    description: 'WHY: Derived from cos(2α)=2cos²α−1. Set α=θ/2, so cosθ = 2cos²(θ/2)−1, then solve for cos(θ/2).',
    usage: 'WHEN TO USE: (1) Finding exact values: cos(15°) from cos(30°). (2) Integration: ∫√(1+cosx) dx. (3) When you know cosθ but need cos(θ/2).\n\nEXAMPLE: Find cos(15°). Since 15°=30°/2 and cos30°=√3/2, cos(15°) = √[(1+√3/2)/2] = √[(2+√3)/4] = (√(2+√3))/2 ≈ 0.966\n\nWHY IT WORKS: Rearranging the double angle cosine formula cos(2α)=2cos²α−1.'
  },
  {
    name: 'Product to Sum - Sine Cosine',
    formula: 'sin A cos B = ½[sin(A + B) + sin(A - B)]',
    description: 'WHY: Products are hard to integrate/simplify. Sums are easier. This converts multiplication into addition by using the sum/difference formulas backwards.',
    usage: 'WHEN TO USE: (1) Integration: ∫sinx·cos(3x)dx → ½∫[sin(4x)+sin(−2x)]dx = easier! (2) Signal processing: analyzing frequency mixing. (3) Simplifying products in proofs.\n\nEXAMPLE: ∫sin(2x)cos(x)dx = ½∫[sin(3x)+sin(x)]dx = −½cos(3x)/3 − ½cosx + C\n\nWHY IT WORKS: Add the formulas sin(A+B) and sin(A−B), then divide by 2 to isolate sinA·cosB.'
  },
  {
    name: 'Product to Sum - Cosine Cosine',
    formula: 'cos A cos B = ½[cos(A + B) + cos(A - B)]',
    description: 'WHY: Same idea—convert products to sums for easier integration and simplification.',
    usage: 'WHEN TO USE: (1) Integration: ∫cosx·cos(3x)dx → ½∫[cos(4x)+cos(2x)]dx. (2) Fourier analysis. (3) Simplifying trig products.\n\nEXAMPLE: ∫cos(2x)cos(x)dx = ½∫[cos(3x)+cos(x)]dx = ½[sin(3x)/3 + sinx] + C\n\nWHY IT WORKS: Add the formulas cos(A+B) and cos(A−B), then divide by 2.'
  },
  {
    name: 'Sum to Product - Sine',
    formula: 'sin A + sin B = 2 sin[(A + B)/2] cos[(A - B)/2]',
    description: 'WHY: Sums are hard to factor or find zeros. Products are easier. This converts addition into multiplication, making it easier to solve equations.',
    usage: 'WHEN TO USE: (1) Solving equations: sinx+sin(3x)=0 → 2sin(2x)cos(x)=0 → sin(2x)=0 or cosx=0 (much easier!). (2) Factoring trig expressions.\n\nEXAMPLE: Solve sinx + sin(3x) = 0. Using the formula: 2sin(2x)cos(x) = 0, so sin(2x)=0 or cosx=0. Solutions: x=0, π/2, π, 3π/2, ...\n\nWHY IT WORKS: Reverse-engineer the product-to-sum formulas by clever substitution.'
  },
  {
    name: 'Sum to Product - Cosine',
    formula: 'cos A + cos B = 2 cos[(A + B)/2] cos[(A - B)/2]',
    description: 'WHY: Same reason—factoring makes solving equations easier. Converts a sum into a product.',
    usage: 'WHEN TO USE: (1) Solving equations: cosx+cos(3x)=0 → 2cos(2x)cos(x)=0 → cos(2x)=0 or cosx=0. (2) Simplifying sums of cosines.\n\nEXAMPLE: Solve cosx + cos(3x) = 0. Using the formula: 2cos(2x)cos(x) = 0, so cos(2x)=0 or cosx=0. Solutions: x=π/4, π/2, 3π/4, 5π/4, ...\n\nWHY IT WORKS: Reverse-engineer the product-to-sum formulas.'
  }
];
