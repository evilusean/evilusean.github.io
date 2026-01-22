// COMPLETE Trig identities - ALL identities from the comprehensive list
// Replace the trigIdentities array in script.js with this version

const trigIdentities = [
  // FUNDAMENTAL IDENTITIES
  {
    name: 'Reciprocal: Cosecant',
    formula: 'csc θ = 1/sin θ',
    description: 'WHY: Cosecant is defined as the reciprocal of sine. On the unit circle, if sin is the y-coordinate, csc is 1/y.',
    usage: 'WHEN TO USE: (1) Converting between sine and cosecant. (2) Simplifying expressions with csc. (3) Solving equations.\n\nEXAMPLE: If sinθ = 3/5, then cscθ = 1/(3/5) = 5/3\n\nWHY IT WORKS: Definition of the reciprocal trig functions.'
  },
  {
    name: 'Reciprocal: Secant',
    formula: 'sec θ = 1/cos θ',
    description: 'WHY: Secant is defined as the reciprocal of cosine. On the unit circle, if cos is the x-coordinate, sec is 1/x.',
    usage: 'WHEN TO USE: (1) Converting between cosine and secant. (2) Calculus: ∫sec x dx. (3) Simplifying expressions.\n\nEXAMPLE: If cosθ = 4/5, then secθ = 1/(4/5) = 5/4\n\nWHY IT WORKS: Definition of the reciprocal trig functions.'
  },
  {
    name: 'Reciprocal: Cotangent',
    formula: 'cot θ = 1/tan θ',
    description: 'WHY: Cotangent is the reciprocal of tangent. It represents the ratio of adjacent to opposite (opposite of tangent).',
    usage: 'WHEN TO USE: (1) Converting between tangent and cotangent. (2) Calculus: derivative of cotx. (3) Right triangle problems.\n\nEXAMPLE: If tanθ = 3/4, then cotθ = 1/(3/4) = 4/3\n\nWHY IT WORKS: Definition of the reciprocal trig functions.'
  },
  {
    name: 'Quotient: Tangent',
    formula: 'tan θ = sin θ / cos θ',
    description: 'WHY: On the unit circle, tan is the slope of the line from origin to point (cosθ, sinθ). Slope = rise/run = y/x = sin/cos.',
    usage: 'WHEN TO USE: (1) Finding tan when you know sin and cos. (2) Simplifying expressions. (3) Proving identities.\n\nEXAMPLE: If sinθ=3/5 and cosθ=4/5, then tanθ = (3/5)/(4/5) = 3/4\n\nWHY IT WORKS: Geometric definition of tangent as slope on the unit circle.'
  },
  {
    name: 'Quotient: Cotangent',
    formula: 'cot θ = cos θ / sin θ',
    description: 'WHY: Cotangent is the reciprocal of tangent, so cot = 1/tan = 1/(sin/cos) = cos/sin.',
    usage: 'WHEN TO USE: (1) Finding cot when you know sin and cos. (2) Simplifying expressions. (3) Integration problems.\n\nEXAMPLE: If sinθ=3/5 and cosθ=4/5, then cotθ = (4/5)/(3/5) = 4/3\n\nWHY IT WORKS: Combination of reciprocal and quotient definitions.'
  },
  // PYTHAGOREAN IDENTITIES
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
  // SUM AND DIFFERENCE FORMULAS
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
    name: 'Difference of Tangent',
    formula: 'tan(A - B) = (tan A - tan B) / (1 + tan A tan B)',
    description: 'WHY: Same derivation as sum, but with subtraction. Notice the denominator sign flips to PLUS.',
    usage: 'WHEN TO USE: Finding tan of angle differences, or simplifying tan(x−y) expressions.\n\nEXAMPLE: tan(15°) = tan(45°−30°) = (tan45°−tan30°)/(1+tan45°·tan30°) = (1−1/√3)/(1+1/√3)\n\nWHY IT WORKS: Algebraic manipulation of the sin/cos difference formulas.'
  },
  // DOUBLE ANGLE FORMULAS
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
  // POWER REDUCTION FORMULAS
  {
    name: 'Power Reduction: sin²',
    formula: 'sin² θ = (1 - cos(2θ)) / 2',
    description: 'WHY: Rearranging cos(2θ)=1−2sin²θ to solve for sin²θ. This "reduces the power" from squared to first power.',
    usage: 'WHEN TO USE: (1) Integration: ∫sin²x dx. (2) Simplifying expressions with sin². (3) Fourier series.\n\nEXAMPLE: ∫sin²x dx = ∫(1−cos2x)/2 dx = x/2 − sin(2x)/4 + C\n\nWHY IT WORKS: Algebraic rearrangement of the double angle cosine formula.'
  },
  {
    name: 'Power Reduction: cos²',
    formula: 'cos² θ = (1 + cos(2θ)) / 2',
    description: 'WHY: Rearranging cos(2θ)=2cos²θ−1 to solve for cos²θ. Reduces power from squared to first power.',
    usage: 'WHEN TO USE: (1) Integration: ∫cos²x dx. (2) Simplifying expressions with cos². (3) Signal processing.\n\nEXAMPLE: ∫cos²x dx = ∫(1+cos2x)/2 dx = x/2 + sin(2x)/4 + C\n\nWHY IT WORKS: Algebraic rearrangement of the double angle cosine formula.'
  },
  // HALF ANGLE FORMULAS
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
  // PRODUCT-TO-SUM FORMULAS
  {
    name: 'Product to Sum: sin·cos',
    formula: 'sin A cos B = ½[sin(A + B) + sin(A - B)]',
    description: 'WHY: Products are hard to integrate/simplify. Sums are easier. This converts multiplication into addition by using the sum/difference formulas backwards.',
    usage: 'WHEN TO USE: (1) Integration: ∫sinx·cos(3x)dx → ½∫[sin(4x)+sin(−2x)]dx = easier! (2) Signal processing: analyzing frequency mixing. (3) Simplifying products in proofs.\n\nEXAMPLE: ∫sin(2x)cos(x)dx = ½∫[sin(3x)+sin(x)]dx = −½cos(3x)/3 − ½cosx + C\n\nWHY IT WORKS: Add the formulas sin(A+B) and sin(A−B), then divide by 2 to isolate sinA·cosB.'
  },
  {
    name: 'Product to Sum: cos·sin',
    formula: 'cos A sin B = ½[sin(A + B) - sin(A - B)]',
    description: 'WHY: Similar to sin·cos, but order matters. This gives a DIFFERENCE of sines instead of a sum.',
    usage: 'WHEN TO USE: (1) Integration: ∫cosx·sin(3x)dx. (2) When the order is cos first, sin second. (3) Simplifying products.\n\nEXAMPLE: ∫cos(2x)sin(x)dx = ½∫[sin(3x)−sin(x)]dx = −½cos(3x)/3 + ½cosx + C\n\nWHY IT WORKS: Subtract sin(A−B) from sin(A+B), then divide by 2.'
  },
  {
    name: 'Product to Sum: cos·cos',
    formula: 'cos A cos B = ½[cos(A + B) + cos(A - B)]',
    description: 'WHY: Same idea—convert products to sums for easier integration and simplification.',
    usage: 'WHEN TO USE: (1) Integration: ∫cosx·cos(3x)dx → ½∫[cos(4x)+cos(2x)]dx. (2) Fourier analysis. (3) Simplifying trig products.\n\nEXAMPLE: ∫cos(2x)cos(x)dx = ½∫[cos(3x)+cos(x)]dx = ½[sin(3x)/3 + sinx] + C\n\nWHY IT WORKS: Add the formulas cos(A+B) and cos(A−B), then divide by 2.'
  },
  {
    name: 'Product to Sum: sin·sin',
    formula: 'sin A sin B = ½[cos(A - B) - cos(A + B)]',
    description: 'WHY: Product of two sines becomes a DIFFERENCE of cosines (note: cos, not sin). Order matters: (A−B) minus (A+B).',
    usage: 'WHEN TO USE: (1) Integration: ∫sinx·sin(3x)dx. (2) Fourier analysis. (3) Simplifying sin products.\n\nEXAMPLE: ∫sin(2x)sin(x)dx = ½∫[cos(x)−cos(3x)]dx = ½[sinx − sin(3x)/3] + C\n\nWHY IT WORKS: Subtract cos(A+B) from cos(A−B), then divide by 2.'
  },
  // SUM-TO-PRODUCT FORMULAS
  {
    name: 'Sum to Product: sin+sin',
    formula: 'sin A + sin B = 2 sin[(A + B)/2] cos[(A - B)/2]',
    description: 'WHY: Sums are hard to factor or find zeros. Products are easier. This converts addition into multiplication, making it easier to solve equations.',
    usage: 'WHEN TO USE: (1) Solving equations: sinx+sin(3x)=0 → 2sin(2x)cos(x)=0 → sin(2x)=0 or cosx=0 (much easier!). (2) Factoring trig expressions.\n\nEXAMPLE: Solve sinx + sin(3x) = 0. Using the formula: 2sin(2x)cos(x) = 0, so sin(2x)=0 or cosx=0. Solutions: x=0, π/2, π, 3π/2, ...\n\nWHY IT WORKS: Reverse-engineer the product-to-sum formulas by clever substitution.'
  },
  {
    name: 'Sum to Product: sin−sin',
    formula: 'sin A - sin B = 2 cos[(A + B)/2] sin[(A - B)/2]',
    description: 'WHY: Difference of sines becomes a product with COSINE first, then sine. Useful for factoring.',
    usage: 'WHEN TO USE: (1) Solving equations: sinx−sin(3x)=0. (2) Factoring differences. (3) Simplifying expressions.\n\nEXAMPLE: Solve sinx − sin(3x) = 0. Using the formula: 2cos(2x)sin(−x) = 0, so cos(2x)=0 or sin(−x)=0\n\nWHY IT WORKS: Reverse-engineer the product-to-sum formulas.'
  },
  {
    name: 'Sum to Product: cos+cos',
    formula: 'cos A + cos B = 2 cos[(A + B)/2] cos[(A - B)/2]',
    description: 'WHY: Same reason—factoring makes solving equations easier. Converts a sum into a product.',
    usage: 'WHEN TO USE: (1) Solving equations: cosx+cos(3x)=0 → 2cos(2x)cos(x)=0 → cos(2x)=0 or cosx=0. (2) Simplifying sums of cosines.\n\nEXAMPLE: Solve cosx + cos(3x) = 0. Using the formula: 2cos(2x)cos(x) = 0, so cos(2x)=0 or cosx=0. Solutions: x=π/4, π/2, 3π/4, 5π/4, ...\n\nWHY IT WORKS: Reverse-engineer the product-to-sum formulas.'
  },
  {
    name: 'Sum to Product: cos−cos',
    formula: 'cos A - cos B = -2 sin[(A + B)/2] sin[(A - B)/2]',
    description: 'WHY: Difference of cosines becomes NEGATIVE product of two sines. Note the minus sign!',
    usage: 'WHEN TO USE: (1) Solving equations: cosx−cos(3x)=0. (2) Factoring differences. (3) Simplifying expressions.\n\nEXAMPLE: Solve cosx − cos(3x) = 0. Using the formula: −2sin(2x)sin(−x) = 0, so sin(2x)=0 or sin(−x)=0\n\nWHY IT WORKS: Reverse-engineer the product-to-sum formulas.'
  },
  // EVEN/ODD IDENTITIES
  {
    name: 'Even/Odd: Sine',
    formula: 'sin(−θ) = −sin θ',
    description: 'WHY: Sine is an ODD function. On the unit circle, reflecting across the x-axis (θ → −θ) flips the y-coordinate (sin) but keeps x (cos) the same.',
    usage: 'WHEN TO USE: (1) Simplifying sin(−x). (2) Proving identities. (3) Integration with odd functions: ∫₋ₐᵃ sin(x)dx = 0.\n\nEXAMPLE: sin(−30°) = −sin(30°) = −1/2\n\nWHY IT WORKS: Geometric symmetry of the unit circle about the x-axis.'
  },
  {
    name: 'Even/Odd: Cosine',
    formula: 'cos(−θ) = cos θ',
    description: 'WHY: Cosine is an EVEN function. Reflecting across the x-axis doesn\'t change the x-coordinate.',
    usage: 'WHEN TO USE: (1) Simplifying cos(−x). (2) Proving identities. (3) Integration: ∫₋ₐᵃ cos(x)dx = 2∫₀ᵃ cos(x)dx.\n\nEXAMPLE: cos(−30°) = cos(30°) = √3/2\n\nWHY IT WORKS: Geometric symmetry of the unit circle about the x-axis.'
  },
  {
    name: 'Even/Odd: Tangent',
    formula: 'tan(−θ) = −tan θ',
    description: 'WHY: Tangent is ODD because tan = sin/cos, and sin is odd while cos is even: −sin/cos = −tan.',
    usage: 'WHEN TO USE: (1) Simplifying tan(−x). (2) Proving identities. (3) Solving equations.\n\nEXAMPLE: tan(−45°) = −tan(45°) = −1\n\nWHY IT WORKS: Combination of sine (odd) and cosine (even).'
  },
  // COFUNCTION IDENTITIES
  {
    name: 'Cofunction: sin/cos',
    formula: 'sin(π/2 - θ) = cos θ',
    description: 'WHY: Complementary angles (add to 90°). On the unit circle, rotating by (90°−θ) swaps x and y coordinates.',
    usage: 'WHEN TO USE: (1) Converting between sin and cos. (2) Right triangles: sin of one acute angle = cos of the other. (3) Simplifying expressions.\n\nEXAMPLE: sin(90°−30°) = sin(60°) = cos(30°) = √3/2\n\nWHY IT WORKS: Geometric relationship of complementary angles on the unit circle.'
  },
  {
    name: 'Cofunction: cos/sin',
    formula: 'cos(π/2 - θ) = sin θ',
    description: 'WHY: Same complementary angle relationship. The x-coordinate at (90°−θ) equals the y-coordinate at θ.',
    usage: 'WHEN TO USE: (1) Converting between cos and sin. (2) Right triangles. (3) Simplifying expressions.\n\nEXAMPLE: cos(90°−30°) = cos(60°) = sin(30°) = 1/2\n\nWHY IT WORKS: Geometric relationship of complementary angles on the unit circle.'
  },
  // LAW OF SINES
  {
    name: 'Law of Sines',
    formula: 'a/sin A = b/sin B = c/sin C',
    description: 'WHY: In any triangle, the ratio of a side to the sine of its opposite angle is constant. This comes from the area formula and relates all sides and angles.',
    usage: 'WHEN TO USE: (1) Finding unknown sides/angles in oblique triangles. (2) When you know: 2 angles + 1 side (AAS/ASA), or 2 sides + 1 non-included angle (SSA - ambiguous case).\n\nEXAMPLE: Triangle with A=30°, B=45°, a=10. Find b: b = a·sinB/sinA = 10·sin45°/sin30° = 10·(√2/2)/(1/2) = 10√2 ≈ 14.14\n\nWHY IT WORKS: Derived from the area formula: Area = ½bc·sinA = ½ac·sinB = ½ab·sinC.'
  },
  // LAW OF COSINES
  {
    name: 'Law of Cosines (side a)',
    formula: 'a² = b² + c² - 2bc cos A',
    description: 'WHY: Generalization of the Pythagorean theorem for non-right triangles. The −2bc·cosA term accounts for the angle between sides b and c.',
    usage: 'WHEN TO USE: (1) Finding the third side when you know 2 sides + included angle (SAS). (2) Finding angles when you know all 3 sides (SSS).\n\nEXAMPLE: Triangle with b=5, c=7, A=60°. Find a: a² = 25 + 49 − 2(5)(7)cos60° = 74 − 70(1/2) = 74 − 35 = 39, so a = √39 ≈ 6.24\n\nWHY IT WORKS: Derived using the distance formula and dot product in vector form.'
  },
  {
    name: 'Law of Cosines (side b)',
    formula: 'b² = a² + c² - 2ac cos B',
    description: 'WHY: Same as above, but solving for side b opposite angle B.',
    usage: 'WHEN TO USE: Same as above, but when solving for side b.\n\nEXAMPLE: Triangle with a=6, c=8, B=45°. Find b: b² = 36 + 64 − 2(6)(8)cos45° = 100 − 96(√2/2) ≈ 32.1, so b ≈ 5.67\n\nWHY IT WORKS: Same derivation, just different labeling.'
  },
  {
    name: 'Law of Cosines (side c)',
    formula: 'c² = a² + b² - 2ab cos C',
    description: 'WHY: Same as above, but solving for side c opposite angle C.',
    usage: 'WHEN TO USE: Same as above, but when solving for side c.\n\nEXAMPLE: Triangle with a=3, b=4, C=90°. Find c: c² = 9 + 16 − 2(3)(4)cos90° = 25 − 0 = 25, so c = 5 (Pythagorean triple!)\n\nWHY IT WORKS: Same derivation. Note: when C=90°, this reduces to a²+b²=c².'
  },
  // TRIANGLE AREA FORMULAS
  {
    name: 'Triangle Area (SAS)',
    formula: 'Area = ½bc sin A',
    description: 'WHY: Area of a triangle = ½·base·height. If you know two sides (b,c) and the included angle A, the height is c·sinA.',
    usage: 'WHEN TO USE: Finding area when you know 2 sides and the included angle (SAS).\n\nEXAMPLE: Triangle with b=5, c=7, A=30°. Area = ½(5)(7)sin30° = ½(35)(1/2) = 8.75\n\nWHY IT WORKS: Geometric formula for area using trigonometry to find height.'
  },
  {
    name: 'Heron\'s Formula',
    formula: 'Area = √[s(s-a)(s-b)(s-c)] where s = (a+b+c)/2',
    description: 'WHY: Finds area using only the three side lengths. s is the semi-perimeter (half the perimeter). No angles needed!',
    usage: 'WHEN TO USE: Finding area when you know all 3 sides (SSS) but no angles.\n\nEXAMPLE: Triangle with a=3, b=4, c=5. s=(3+4+5)/2=6. Area = √[6(6−3)(6−4)(6−5)] = √[6·3·2·1] = √36 = 6\n\nWHY IT WORKS: Derived from the law of cosines and area formula, eliminating the need to find angles.'
  }
];
