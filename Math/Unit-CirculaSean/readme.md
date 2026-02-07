I want to build an app for learning the unit circle and trig identities

Start with just one quiz mode, the unit circle, which will display as the default, then highlight an area in red, give the user a few seconds
then display the angle in degrees, radians, with the (x, y) values and then display a table of the cosine, sine, tangent, secant, cosecant, cotangent
If the user presses 'Space' save it to a list so the user can review,
Later on add other quiz modes, where you can ask the angle in degrees or radians and get the values for (x,y) or cosine, sine, tangent, secant, cosecant, cotangent - I should have this stuff memorized by now, but I don't, hence the app

After doing that, add the Trig Identities quiz mode, reciprocal trig ratios(SOHCAHTOA Vs Sine Vs Cosecant - Cosine Vs Secant, Tangent vs CoTangent), etc - crawl -> walk -> run

ColorCoding/Highlight - color code the (x,y) on the triangle being quizzed and the (cosine, sine) are (blue, red) and tangent is purple(mixture of blue and red) - trig function reciprocals (cosecant = light red, secant = light blue, tangent = light purple) so the user can infer the reciprocal relationship and that the x = cosine and y = sine visually through color coding

Brief Flash after answer before next question - after the user presses 'skip'(enter) or 'save'(space) it will briefly flash the entire unit circle with all the data before moving onto to next one, keep the current/previous highlighted with color, then flash to the next question with new highlighted triangle coloring on the next angle 

Make it responsive - so press and hold to save, press once quick to skip to next -

I want the screensaver to run in the background, default to show the full unit circle, with degrees, radians,  then in quiz mode, highlight a section(with correct colors mentioned before), then wait 5 seconds, show a chart with all the values to the right and display the values for everything on that part of the unit circle for the triangle - the triangles and quadrants that show should be randomized - I want a chart displayed next to the unit circle (or below on small screens) with the values for sin, cos, tan, cosecant, secant, cotangent (with the color coding mentioned above) for the triangle being quizzed currently on the unit circle after the user 'skips' or the time has gone for the user to guess. 

I don't know how you should draw and place the values? SVG with labels? figure out a way to do that using this unit circle image as a reference, it should be responsive and work on large and small screens

You can replace any of the current code in this repo, it's all boilerplate

I think the socratic triangle and arc length/sector quiz should be their own app - realistically I can make quite a few apps from trig, I want them to be used for passive learning/screensaver/quiz apps mainly to play in the background as I do other things - the active learning apps can wait.

- Will require 3 quiz modes, one for the angles/ratios on the unit circle and one for the trig identities, and one for SOHCAHTOA values

**Default Mode** : Have the unit circle with the special triangles ratios/angles (1/2, \frac{\sqrt{2}}{2}, \frac{\sqrt{3}}{2}, etc) for each angle with positive or negative, that can be changed from radians to degrees, you can fill in the blanks or be quizzed by highlighting a section of the unit circle, press 'space' to save to a list, 

**General/Manual Mode**: A randomized engine that generates **any acute angle ($1^\circ$ to $89^\circ$) and any side length**, utilizing $SOH CAH TOA$ for non-special ratios, supported by a **Degree/Radian Toggle** and a **Reference Angle Visualizer** for terminal sides in any quadrant.- 

**Deterministic Socratic Quiz Engine**: An interactive "Teacher Mode" that randomly populates a triangle with the bare minimum data required for a solution. It must utilize a **State-Based Scripting Tree** to guide the user through the specific "order of operations" for that unique triangle (e.g., if Side-Side is given, prompt for Pythagorean Theorem; if Angle-Side is given, prompt for Ratio Selection). 
- **Visual & Pedagogical Suite**: Include a **Dynamic SVG Canvas** that resizes the triangle based on real-world proportions and a **"Show Your Work" Logic Log** that prints the step-by-step geometric reasoning used.- 

**Tech Spec**: Develop as a **deterministic, static application** (Vanilla JS/HTML/CSS) suitable for **GitHub Pages**, ensuring all "Socratic" paths are hard-coded into logic objects without the need for a backend or AI. -

**Trig Identities** Quiz mode : briefly display either a trig identity formula or a name like 'Sum of Sines' and then wait a few seconds, show it on screen, if the user presses 'Space' save it to a list the user can review after, brief explanation for each identity to explain what is used for during the quiz - add use cases, when to use each trig identity

**Popup** : Allow the user to view all the trig identities from a popup and see what each one is used for with a brief explanation

**Custom Math Input Pad** featuring dedicated buttons for radicals ($\sqrt{2}, \sqrt{3}$), fractions, and $\pi$ to prioritize exact-value entry over decimal approximations. - Quiz mode fillable chart for angles and side lengths as well as all cos sin tan, etc, that the user can fill in manually

**Sketch Pad** : allows the user to sketch on a canvas in quiz mode for randomly generated triangles

**Other things to add potentially** : Arc Length/Sector area quiz, trig ratios popup, Primary Trigonometric Ratios (SOH CAH TOA), Reciprocal Trigonometric Ratios, Key Properties & Relationships, etc... Actually, instead of updating this every lesson just review my notes at end of course and add all the formulas/identities/definitions/etc when completed, then make the app, or multiple apps, this one is already really 'busy'
Review what else I can add from : https://github.com/evilusean/Khan/tree/main/Trig-PreCalc 
https://github.com/evilusean/Khan/blob/main/Review/TOCT/2026-TOCT-Review-Precalc-Trig.md




### Comprehensive Trigonometric Identities Reference
#### Fundamental Identities
* **Reciprocal Identities**
    * $\csc \theta = \frac{1}{\sin \theta}$
    * $\sec \theta = \frac{1}{\cos \theta}$
    * $\cot \theta = \frac{1}{\tan \theta}$
* **Quotient Identities**
    * $\tan \theta = \frac{\sin \theta}{\cos \theta}$
    * $\cot \theta = \frac{\cos \theta}{\sin \theta}$
* **Pythagorean Identities**
    * $\sin^2 \theta + \cos^2 \theta = 1$
    * $1 + \tan^2 \theta = \sec^2 \theta$
    * $1 + \cot^2 \theta = \csc^2 \theta$

#### Sum and Difference Formulas
* $\sin(A \pm B) = \sin A \cos B \pm \cos A \sin B$
* $\cos(A \pm B) = \cos A \cos B \mp \sin A \sin B$
* $\tan(A \pm B) = \frac{\tan A \pm \tan B}{1 \mp \tan A \tan B}$

#### Double-Angle & Half-Angle
* $\sin(2\theta) = 2\sin \theta \cos \theta$
* $\cos(2\theta) = \cos^2 \theta - \sin^2 \theta = 2\cos^2 \theta - 1 = 1 - 2\sin^2 \theta$
* $\tan(2\theta) = \frac{2\tan \theta}{1 - \tan^2 \theta}$
* $\sin^2 \theta = \frac{1 - \cos(2\theta)}{2}$
* $\cos^2 \theta = \frac{1 + \cos(2\theta)}{2}$
* $\sin(\frac{\theta}{2}) = \pm \sqrt{\frac{1 - \cos \theta}{2}}$
* $\cos(\frac{\theta}{2}) = \pm \sqrt{\frac{1 + \cos \theta}{2}}$

#### Product-to-Sum Identities
* $\sin A \cos B = \frac{1}{2}[\sin(A + B) + \sin(A - B)]$
* $\cos A \sin B = \frac{1}{2}[\sin(A + B) - \sin(A - B)]$
* $\cos A \cos B = \frac{1}{2}[\cos(A + B) + \cos(A - B)]$
* $\sin A \sin B = \frac{1}{2}[\cos(A - B) - \cos(A + B)]$

#### Sum-to-Product Identities
* $\sin A + \sin B = 2 \sin(\frac{A + B}{2}) \cos(\frac{A - B}{2})$
* $\sin A - \sin B = 2 \cos(\frac{A + B}{2}) \sin(\frac{A - B}{2})$
* $\cos A + \cos B = 2 \cos(\frac{A + B}{2}) \cos(\frac{A - B}{2})$
* $\cos A - \cos B = -2 \sin(\frac{A + B}{2}) \sin(\frac{A - B}{2})$

#### Laws for Oblique Triangles
* **Law of Sines:** $\frac{a}{\sin A} = \frac{b}{\sin B} = \frac{c}{\sin C}$
* **Law of Cosines:**
    * $a^2 = b^2 + c^2 - 2bc \cos A$
    * $b^2 = a^2 + c^2 - 2ac \cos B$
    * $c^2 = a^2 + b^2 - 2ab \cos C$
* **Area of a Triangle:** $\text{Area} = \frac{1}{2}bc \sin A$
* **Heron's Formula:** $\text{Area} = \sqrt{s(s-a)(s-b)(s-c)}$ where $s = \frac{a+b+c}{2}$

#### Even/Odd & Cofunctions
* $\sin(-\theta) = -\sin \theta$, $\cos(-\theta) = \cos \theta$, $\tan(-\theta) = -\tan \theta$
* $\sin(\frac{\pi}{2} - \theta) = \cos \theta$
* $\cos(\frac{\pi}{2} - \theta) = \sin \theta$



Future Sean Problems / TODOs :
Add a way to teach ASTC and know which quadrant has how many pi over what for learning radians (-1 for quadrant 2, +1 for quadrant 3, prime less than 12 for quadrant 4 = 11, 7, 5) and the closest to 'x' is '/6', etc...
   Color highlighting showing the triangles closest to 'x' are /6 - and formulas for showing the numerator for radians 
- add a cheatsheet for each trig identity with it's function, formula and use
- add a checklist of what trig identities you want to study on quiz mode (realistically future Sean will only need a few)
- add a way to remove the black unit circle, it is very distracting during the quiz app when going through trig identities
- app to have a selection where you can choose what trig identities you are quizzed on (**Memorizing the "Big 5"** (Pythagorean, Double Angle, and basic definitions) as defaults)

































