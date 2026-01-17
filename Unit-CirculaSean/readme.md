I want to build an app for learning the unit circle and trig identities

- Will require 3 quiz modes, one for the angles/ratios on the unit circle and one for the trig identities, and one for SOHCAHTOA values

**Default Mode** : Have the unit circle with the special triangles ratios/angles (1/2, \frac{\sqrt{2}}{2}, \frac{\sqrt{3}}{2}, etc) for each angle with positive or negative, that can be changed from radians to degrees, you can fill in the blanks or be quizzed by highlighting a section of the unit circle, press 'space' to save to a list, 

**General/Manual Mode**: A randomized engine that generates **any acute angle ($1^\circ$ to $89^\circ$) and any side length**, utilizing $SOH CAH TOA$ for non-special ratios, supported by a **Degree/Radian Toggle** and a **Reference Angle Visualizer** for terminal sides in any quadrant.- 

**Deterministic Socratic Quiz Engine**: An interactive "Teacher Mode" that randomly populates a triangle with the bare minimum data required for a solution. It must utilize a **State-Based Scripting Tree** to guide the user through the specific "order of operations" for that unique triangle (e.g., if Side-Side is given, prompt for Pythagorean Theorem; if Angle-Side is given, prompt for Ratio Selection). 
- **Visual & Pedagogical Suite**: Include a **Dynamic SVG Canvas** that resizes the triangle based on real-world proportions and a **"Show Your Work" Logic Log** that prints the step-by-step geometric reasoning used.- 

**Tech Spec**: Develop as a **deterministic, static application** (Vanilla JS/HTML/CSS) suitable for **GitHub Pages**, ensuring all "Socratic" paths are hard-coded into logic objects without the need for a backend or AI. -

**Trig Identities** Quiz mode : briefly display either a trig identity formula or a name like 'Sum of Sines' and then wait a few seconds, show it on screen, if the user presses 'Space' save it to a list the user can review after

**Custom Math Input Pad** featuring dedicated buttons for radicals ($\sqrt{2}, \sqrt{3}$), fractions, and $\pi$ to prioritize exact-value entry over decimal approximations. - Quiz mode fillable chart for angles and side lengths as well as all cos sin tan, etc, that the user can fill in manually







### Trigonometric Identities :
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

#### Double-Angle Identities
* $\sin(2\theta) = 2\sin \theta \cos \theta$
* $\cos(2\theta) = \cos^2 \theta - \sin^2 \theta$
    * $= 2\cos^2 \theta - 1$
    * $= 1 - 2\sin^2 \theta$
* $\tan(2\theta) = \frac{2\tan \theta}{1 - \tan^2 \theta}$

#### Half-Angle / Power-Reduction
* $\sin^2 \theta = \frac{1 - \cos(2\theta)}{2}$
* $\cos^2 \theta = \frac{1 + \cos(2\theta)}{2}$
* $\sin(\frac{\theta}{2}) = \pm \sqrt{\frac{1 - \cos \theta}{2}}$
* $\cos(\frac{\theta}{2}) = \pm \sqrt{\frac{1 + \cos \theta}{2}}$

#### Even/Odd Identities
* $\sin(-\theta) = -\sin \theta$
* $\cos(-\theta) = \cos \theta$
* $\tan(-\theta) = -\tan \theta$

#### Cofunction Identities
* $\sin(\frac{\pi}{2} - \theta) = \cos \theta$
* $\cos(\frac{\pi}{2} - \theta) = \sin \theta$
* $\tan(\frac{\pi}{2} - \theta) = \cot \theta$


















































