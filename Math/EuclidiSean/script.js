/* ═══════════════════════════════════════════════════════════════
   Euclid's Elements — Interactive Screensaver
   Static HTML / JS / CSS for GitHub Pages
   ═══════════════════════════════════════════════════════════════ */

const euclidData = {
    books: [
        /* ── Book I: Foundations, triangles, parallels, area ── */
        {
            number: 1,
            title: "Foundations, triangles, parallels, area, Pythagorean theorem",
            entries: [
                {
                    id: "I.Def.1",
                    book: 1,
                    text: "A point is that which has no part.",
                    visualSteps: [
                        { type: "point", x: 400, y: 250, label: "A" },
                        { type: "label", x: 400, y: 310, text: "that which has no part" }
                    ]
                },
                {
                    id: "I.Def.3",
                    book: 1,
                    text: "The extremities of a line are points.",
                    visualSteps: [
                        { type: "point", x: 280, y: 250, label: "A" },
                        { type: "point", x: 520, y: 250, label: "B" },
                        { type: "line", points: [280, 250, 520, 250] },
                        { type: "label", x: 400, y: 290, text: "extremities are points" }
                    ]
                },
                {
                    id: "I.Def.15",
                    book: 1,
                    text: "A circle is a plane figure contained by one line such that all the straight lines falling upon it from one point among those lying within the figure are equal to one another.",
                    visualSteps: [
                        { type: "point", x: 400, y: 250, label: "O" },
                        { type: "circle", cx: 400, cy: 250, r: 120 },
                        { type: "point", x: 520, y: 250, label: "A" },
                        { type: "line", points: [400, 250, 520, 250] },
                        { type: "point", x: 340, y: 146, label: "B" },
                        { type: "line", points: [400, 250, 340, 146] },
                        { type: "label", x: 400, y: 400, text: "all radii are equal" }
                    ]
                },
                {
                    id: "I.Prop.1",
                    book: 1,
                    text: "On a given finite straight line to construct an equilateral triangle.",
                    visualSteps: [
                        { type: "line", points: [300, 320, 500, 320], label: "AB" },
                        { type: "point", x: 300, y: 320, label: "A" },
                        { type: "point", x: 500, y: 320, label: "B" },
                        { type: "circle", cx: 300, cy: 320, r: 200 },
                        { type: "circle", cx: 500, cy: 320, r: 200 },
                        { type: "point", x: 400, y: 147, label: "C" },
                        { type: "line", points: [300, 320, 400, 147] },
                        { type: "line", points: [500, 320, 400, 147] },
                        { type: "polygon", points: [[300, 320], [500, 320], [400, 147]] }
                    ]
                },
                {
                    id: "I.Prop.47",
                    book: 1,
                    text: "In right-angled triangles the square on the side subtending the right angle is equal to the squares on the sides containing the right angle.",
                    visualSteps: [
                        { type: "polygon", points: [[400, 280], [400, 160], [530, 280]] },
                        { type: "point", x: 400, y: 280, label: "A" },
                        { type: "point", x: 400, y: 160, label: "B" },
                        { type: "point", x: 530, y: 280, label: "C" },
                        { type: "rect", x: 400, y: 250, w: 30, h: 30 },
                        { type: "rect", x: 400, y: 280, w: 130, h: 130, dashed: true },
                        { type: "rect", x: 270, y: 160, w: 130, h: 130, dashed: true },
                        { type: "rect", x: 400, y: 150, w: 130, h: 130, dashed: true },
                        { type: "label", x: 460, y: 350, text: "a² + b² = c²" }
                    ]
                }
            ]
        },

        /* ── Book II: Geometric algebra ── */
        {
            number: 2,
            title: "Geometric algebra",
            entries: [
                {
                    id: "II.Prop.4",
                    book: 2,
                    text: "If a straight line is cut at random, the square on the whole is equal to the squares on the segments and twice the rectangle contained by the segments.",
                    visualSteps: [
                        { type: "line", points: [200, 280, 600, 280] },
                        { type: "point", x: 200, y: 280, label: "A" },
                        { type: "point", x: 420, y: 280, label: "C" },
                        { type: "point", x: 600, y: 280, label: "B" },
                        { type: "rect", x: 200, y: 280, w: 400, h: 400, dashed: true },
                        { type: "rect", x: 200, y: 280, w: 220, h: 220, dashed: true },
                        { type: "rect", x: 420, y: 280, w: 180, h: 180, dashed: true },
                        { type: "rect", x: 200, y: 500, w: 220, h: 100, dashed: true },
                        { type: "label", x: 350, y: 160, text: "(a + b)² = a² + b² + 2ab" }
                    ]
                },
                {
                    id: "II.Prop.5",
                    book: 2,
                    text: "If a straight line is cut into equal and unequal segments, the rectangle contained by the unequal segments of the whole together with the square on the straight line between the points of section is equal to the square on the half.",
                    visualSteps: [
                        { type: "line", points: [250, 300, 550, 300] },
                        { type: "point", x: 250, y: 300, label: "A" },
                        { type: "point", x: 400, y: 300, label: "C" },
                        { type: "point", x: 450, y: 300, label: "D" },
                        { type: "point", x: 550, y: 300, label: "B" },
                        { type: "rect", x: 325, y: 150, w: 150, h: 150, dashed: true },
                        { type: "label", x: 370, y: 380, text: "geometric algebra" }
                    ]
                }
            ]
        },

        /* ── Book III: Circles, tangents, chords ── */
        {
            number: 3,
            title: "Circles, tangents, chords",
            entries: [
                {
                    id: "III.Def.1",
                    book: 3,
                    text: "Equal circles are those the diameters of which are equal, or the radii of which are equal.",
                    visualSteps: [
                        { type: "circle", cx: 300, cy: 250, r: 80 },
                        { type: "circle", cx: 500, cy: 250, r: 80 },
                        { type: "line", points: [220, 250, 380, 250] },
                        { type: "line", points: [420, 250, 580, 250] },
                        { type: "label", x: 280, y: 360, text: "equal diameters ⟹ equal circles" }
                    ]
                },
                {
                    id: "III.Prop.18",
                    book: 3,
                    text: "If a straight line touches a circle, and a straight line is joined from the center to the point of contact, the straight line so joined will be perpendicular to the tangent.",
                    visualSteps: [
                        { type: "circle", cx: 400, cy: 250, r: 120 },
                        { type: "point", x: 400, y: 250, label: "O" },
                        { type: "point", x: 520, y: 250, label: "A" },
                        { type: "line", points: [520, 250, 520, 400] },
                        { type: "point", x: 520, y: 400, label: "B" },
                        { type: "line", points: [400, 250, 520, 250] },
                        { type: "rect", x: 520, y: 250, w: 15, h: 15 },
                        { type: "label", x: 340, y: 400, text: "radius ⊥ tangent" }
                    ]
                },
                {
                    id: "III.Prop.31",
                    book: 3,
                    text: "In a circle the angle in a semicircle is right.",
                    visualSteps: [
                        { type: "circle", cx: 400, cy: 250, r: 130 },
                        { type: "line", points: [270, 250, 530, 250] },
                        { type: "point", x: 270, y: 250, label: "A" },
                        { type: "point", x: 530, y: 250, label: "B" },
                        { type: "point", x: 400, y: 120, label: "C" },
                        { type: "line", points: [270, 250, 400, 120] },
                        { type: "line", points: [530, 250, 400, 120] },
                        { type: "rect", x: 390, y: 230, w: 15, h: 15 },
                        { type: "label", x: 340, y: 400, text: "∠ACB = right angle" }
                    ]
                }
            ]
        },

        /* ── Book IV: Inscribed/circumscribed polygons ── */
        {
            number: 4,
            title: "Inscribed and circumscribed polygons",
            entries: [
                {
                    id: "IV.Prop.2",
                    book: 4,
                    text: "To inscribe a triangle equiangular with a given triangle in a given circle.",
                    visualSteps: [
                        { type: "circle", cx: 400, cy: 250, r: 140 },
                        { type: "point", x: 400, y: 110, label: "A" },
                        { type: "point", x: 279, y: 360, label: "B" },
                        { type: "point", x: 521, y: 360, label: "C" },
                        { type: "line", points: [400, 110, 279, 360] },
                        { type: "line", points: [279, 360, 521, 360] },
                        { type: "line", points: [521, 360, 400, 110] },
                        { type: "label", x: 330, y: 420, text: "inscribed equiangular triangle" }
                    ]
                },
                {
                    id: "IV.Prop.15",
                    book: 4,
                    text: "To inscribe an equilateral and equiangular hexagon in a given circle.",
                    visualSteps: [
                        { type: "circle", cx: 400, cy: 250, r: 140 },
                        { type: "polygon", points: [
                            [400, 110], [521, 175], [521, 325],
                            [400, 390], [279, 325], [279, 175]
                        ]},
                        { type: "label", x: 310, y: 420, text: "inscribed regular hexagon" }
                    ]
                }
            ]
        },

        /* ── Book V: Eudoxan theory of proportions ── */
        {
            number: 5,
            title: "Eudoxan theory of proportions",
            entries: [
                {
                    id: "V.Def.5",
                    book: 5,
                    text: "Magnitudes are said to be in the same ratio, the first to the second and the third to the fourth, when, if any equimultiples whatever be taken of the first and third, and any equimultiples whatever of the second and fourth, the former equimultiples alike exceed, are alike equal to, or alike fall short of, the latter equimultiples respectively.",
                    visualSteps: [
                        { type: "line", points: [200, 220, 350, 220] },
                        { type: "line", points: [200, 280, 500, 280] },
                        { type: "label", x: 180, y: 215, text: "a" },
                        { type: "label", x: 360, y: 215, text: "b" },
                        { type: "label", x: 180, y: 275, text: "c" },
                        { type: "label", x: 510, y: 275, text: "d" },
                        { type: "line", points: [200, 340, 600, 340], dashed: true },
                        { type: "label", x: 280, y: 380, text: "a : b :: c : d" }
                    ]
                },
                {
                    id: "V.Prop.1",
                    book: 5,
                    text: "If any number of magnitudes are equimultiples of as many other magnitudes, each of whatever magnitude, then whatever multiple one of the magnitudes is of one, that multiple also will all be of all.",
                    visualSteps: [
                        { type: "line", points: [250, 200, 300, 200] },
                        { type: "line", points: [250, 230, 350, 230] },
                        { type: "line", points: [250, 260, 400, 260] },
                        { type: "line", points: [250, 320, 300, 320] },
                        { type: "line", points: [250, 350, 350, 350] },
                        { type: "line", points: [250, 380, 400, 380] },
                        { type: "label", x: 420, y: 230, text: "equimultiples" },
                        { type: "label", x: 300, y: 420, text: "proportion theory" }
                    ]
                }
            ]
        },

        /* ── Book VI: Similarity and proportions ── */
        {
            number: 6,
            title: "Similarity and proportions",
            entries: [
                {
                    id: "VI.Def.1",
                    book: 6,
                    text: "Similar rectilinear figures are those which have their angles severally equal and the sides about the equal angles proportional.",
                    visualSteps: [
                        { type: "polygon", points: [[280, 320], [380, 320], [330, 200]] },
                        { type: "polygon", points: [[480, 360], [630, 360], [555, 160]] },
                        { type: "label", x: 310, y: 350, text: "△" },
                        { type: "label", x: 530, y: 390, text: "△′" },
                        { type: "label", x: 360, y: 420, text: "equal angles, proportional sides" }
                    ]
                },
                {
                    id: "VI.Prop.31",
                    book: 6,
                    text: "In right-angled triangles, the figure on the side subtending the right angle is similar to the similar and similarly described figures on the sides containing the right angle.",
                    visualSteps: [
                        { type: "polygon", points: [[400, 300], [400, 150], [550, 300]] },
                        { type: "rect", x: 400, y: 270, w: 20, h: 20 },
                        { type: "polygon", points: [[400, 300], [400, 150], [250, 150], [250, 300]], dashed: true },
                        { type: "polygon", points: [[400, 300], [550, 300], [550, 450], [400, 450]], dashed: true },
                        { type: "label", x: 340, y: 400, text: "similar figures on the sides" }
                    ]
                }
            ]
        },

        /* ── Book VII: Number theory ── */
        {
            number: 7,
            title: "Number theory — primes, GCD",
            entries: [
                {
                    id: "VII.Def.1",
                    book: 7,
                    text: "A unit is that by virtue of which each of the things that exist is called one.",
                    visualSteps: [
                        { type: "rect", x: 385, y: 235, w: 30, h: 30 },
                        { type: "label", x: 396, y: 255, text: "1" },
                        { type: "label", x: 340, y: 300, text: "the unit" }
                    ]
                },
                {
                    id: "VII.Def.11",
                    book: 7,
                    text: "A prime number is that which is measured by a unit alone.",
                    visualSteps: [
                        { type: "label", x: 310, y: 240, text: "7" },
                        { type: "point", x: 350, y: 250 },
                        { type: "point", x: 380, y: 250 },
                        { type: "point", x: 410, y: 250 },
                        { type: "point", x: 440, y: 250 },
                        { type: "point", x: 470, y: 250 },
                        { type: "point", x: 500, y: 250 },
                        { type: "point", x: 530, y: 250 },
                        { type: "label", x: 300, y: 300, text: "measured only by 1 and itself" }
                    ]
                },
                {
                    id: "VII.Prop.1",
                    book: 7,
                    text: "Given two numbers not prime to one another, to find their greatest common measure.",
                    visualSteps: [
                        { type: "label", x: 280, y: 220, text: "48" },
                        { type: "label", x: 280, y: 280, text: "18" },
                        { type: "line", points: [350, 200, 350, 320] },
                        { type: "line", points: [350, 240, 550, 240] },
                        { type: "line", points: [350, 280, 500, 280] },
                        { type: "label", x: 560, y: 235, text: "..." },
                        { type: "label", x: 320, y: 360, text: "Euclidean algorithm: GCD(48, 18) = 6" }
                    ]
                }
            ]
        },

        /* ── Book VIII: Continued proportions ── */
        {
            number: 8,
            title: "Continued proportions",
            entries: [
                {
                    id: "VIII.Prop.1",
                    book: 8,
                    text: "If there are as many numbers as we please in continued proportion, and the extremes of them are not prime to one another, then as the first is to the second, so will the last but one be to the last.",
                    visualSteps: [
                        { type: "line", points: [200, 250, 600, 250] },
                        { type: "point", x: 200, y: 250, label: "a" },
                        { type: "point", x: 300, y: 250, label: "ar" },
                        { type: "point", x: 400, y: 250, label: "ar²" },
                        { type: "point", x: 500, y: 250, label: "ar³" },
                        { type: "point", x: 600, y: 250, label: "ar⁴" },
                        { type: "label", x: 300, y: 300, text: "continued proportion" }
                    ]
                },
                {
                    id: "VIII.Prop.18",
                    book: 8,
                    text: "Between two similar solid numbers there are two mean proportional numbers; and the solid number has to the similar solid number the ratio triplicate of that which the side has to the side.",
                    visualSteps: [
                        { type: "rect", x: 250, y: 200, w: 60, h: 60 },
                        { type: "rect", x: 370, y: 185, w: 80, h: 80 },
                        { type: "rect", x: 510, y: 170, w: 100, h: 100 },
                        { type: "label", x: 270, y: 310, text: "a³" },
                        { type: "label", x: 395, y: 310, text: "b³" },
                        { type: "label", x: 530, y: 310, text: "c³" },
                        { type: "label", x: 300, y: 370, text: "mean proportionals between solid numbers" }
                    ]
                }
            ]
        },

        /* ── Book IX: Primes and series ── */
        {
            number: 9,
            title: "Primes and series",
            entries: [
                {
                    id: "IX.Prop.20",
                    book: 9,
                    text: "Prime numbers are more than any assigned multitude of prime numbers.",
                    visualSteps: [
                        { type: "label", x: 260, y: 230, text: "2" },
                        { type: "label", x: 310, y: 230, text: "3" },
                        { type: "label", x: 360, y: 230, text: "5" },
                        { type: "label", x: 410, y: 230, text: "7" },
                        { type: "label", x: 460, y: 230, text: "11" },
                        { type: "label", x: 520, y: 230, text: "..." },
                        { type: "line", points: [240, 260, 560, 260] },
                        { type: "label", x: 270, y: 290, text: "N = p₁·p₂·…·pₙ + 1" },
                        { type: "label", x: 260, y: 340, text: "infinitude of primes" }
                    ]
                },
                {
                    id: "IX.Prop.36",
                    book: 9,
                    text: "If as many numbers as we please are set out continuously in double proportion from a unit, and the sum of all becomes prime, and if the sum multiplied into the last makes some number, the product will be perfect.",
                    visualSteps: [
                        { type: "label", x: 280, y: 220, text: "1" },
                        { type: "label", x: 340, y: 220, text: "2" },
                        { type: "label", x: 400, y: 220, text: "4" },
                        { type: "label", x: 460, y: 220, text: "8" },
                        { type: "label", x: 520, y: 220, text: "16" },
                        { type: "line", points: [260, 250, 540, 250] },
                        { type: "label", x: 310, y: 290, text: "1 + 2 + 4 = 7 (prime)" },
                        { type: "label", x: 290, y: 340, text: "7 × 4 = 28 (perfect number)" }
                    ]
                }
            ]
        },

        /* ── Book X: Irrational magnitudes ── */
        {
            number: 10,
            title: "Irrational magnitudes",
            entries: [
                {
                    id: "X.Def.3",
                    book: 10,
                    text: "With these hypotheses, it is to be proved that there exist straight lines incommensurable with the assigned straight line, and straight lines incommensurable in length but commensurable in square, and straight lines incommensurable in square.",
                    visualSteps: [
                        { type: "line", points: [250, 280, 550, 280] },
                        { type: "label", x: 240, y: 275, text: "A" },
                        { type: "label", x: 555, y: 275, text: "B" },
                        { type: "line", points: [250, 200, 430, 200], dashed: true },
                        { type: "label", x: 310, y: 190, text: "√2 · AB" },
                        { type: "label", x: 270, y: 340, text: "incommensurable magnitudes" }
                    ]
                },
                {
                    id: "X.Prop.9",
                    book: 10,
                    text: "If two unequal magnitudes be set out, and if there be subtracted from the greater a magnitude greater than its half, and from that which is left a magnitude greater than its half, and so on continually, there will be left some magnitude less than the lesser magnitude set out.",
                    visualSteps: [
                        { type: "line", points: [200, 280, 600, 280] },
                        { type: "line", points: [400, 280, 600, 280] },
                        { type: "line", points: [500, 280, 600, 280] },
                        { type: "line", points: [550, 280, 600, 280] },
                        { type: "line", points: [575, 280, 600, 280] },
                        { type: "label", x: 300, y: 320, text: "successive bisection → remainder < ε" }
                    ]
                }
            ]
        },

        /* ── Book XI: Solid geometry ── */
        {
            number: 11,
            title: "Solid geometry",
            entries: [
                {
                    id: "XI.Def.1",
                    book: 11,
                    text: "A solid is that which has length, breadth, and depth.",
                    visualSteps: [
                        { type: "polygon", points: [[300, 300], [500, 300], [530, 200], [330, 200]] },
                        { type: "line", points: [300, 300, 330, 200] },
                        { type: "line", points: [500, 300, 530, 200] },
                        { type: "line", points: [330, 200, 330, 100] },
                        { type: "line", points: [530, 200, 530, 100] },
                        { type: "line", points: [330, 100, 530, 100] },
                        { type: "line", points: [500, 300, 530, 100] },
                        { type: "label", x: 340, y: 350, text: "length · breadth · depth" }
                    ]
                },
                {
                    id: "XI.Prop.20",
                    book: 11,
                    text: "If a solid angle is contained by three plane angles, the sum of any two is greater than the remaining one.",
                    visualSteps: [
                        { type: "point", x: 400, y: 280, label: "V" },
                        { type: "line", points: [400, 280, 280, 180] },
                        { type: "line", points: [400, 280, 520, 180] },
                        { type: "line", points: [400, 280, 400, 120] },
                        { type: "point", x: 280, y: 180, label: "A" },
                        { type: "point", x: 520, y: 180, label: "B" },
                        { type: "point", x: 400, y: 120, label: "C" },
                        { type: "label", x: 300, y: 360, text: "∠A + ∠B > ∠C" }
                    ]
                }
            ]
        },

        /* ── Book XII: Exhaustion ── */
        {
            number: 12,
            title: "Exhaustion — volumes of cones, pyramids, spheres",
            entries: [
                {
                    id: "XII.Prop.2",
                    book: 12,
                    text: "Circles are to one another as the squares on their diameters.",
                    visualSteps: [
                        { type: "circle", cx: 300, cy: 250, r: 70 },
                        { type: "circle", cx: 500, cy: 250, r: 110 },
                        { type: "line", points: [230, 250, 370, 250] },
                        { type: "line", points: [390, 250, 610, 250] },
                        { type: "rect", x: 230, y: 140, w: 140, h: 140, dashed: true },
                        { type: "rect", x: 390, y: 80, w: 220, h: 220, dashed: true },
                        { type: "label", x: 300, y: 390, text: "Area ∝ d²" }
                    ]
                },
                {
                    id: "XII.Prop.10",
                    book: 12,
                    text: "Any cone is a third part of the cylinder with the same base and equal height.",
                    visualSteps: [
                        { type: "ellipse", cx: 350, cy: 320, rx: 80, ry: 25 },
                        { type: "line", points: [270, 320, 310, 140] },
                        { type: "line", points: [430, 320, 390, 140] },
                        { type: "ellipse", cx: 350, cy: 140, rx: 40, ry: 12 },
                        { type: "ellipse", cx: 530, cy: 320, rx: 80, ry: 25 },
                        { type: "line", points: [450, 320, 450, 140] },
                        { type: "line", points: [610, 320, 610, 140] },
                        { type: "ellipse", cx: 530, cy: 140, rx: 80, ry: 25 },
                        { type: "label", x: 310, y: 380, text: "cone = ⅓ cylinder" }
                    ]
                }
            ]
        },

        /* ── Book XIII: Platonic solids ── */
        {
            number: 13,
            title: "The Platonic solids",
            entries: [
                {
                    id: "XIII.Prop.12",
                    book: 13,
                    text: "If an equilateral triangle is inscribed in a circle, the square on the side of the triangle is triple of the square on the radius of the circle.",
                    visualSteps: [
                        { type: "circle", cx: 400, cy: 250, r: 130 },
                        { type: "point", x: 400, y: 250, label: "O" },
                        { type: "polygon", points: [[400, 120], [287, 360], [513, 360]] },
                        { type: "line", points: [400, 250, 400, 120] },
                        { type: "label", x: 310, y: 400, text: "side² = 3 · radius²" }
                    ]
                },
                {
                    id: "XIII.Prop.17",
                    book: 13,
                    text: "To construct a dodecahedron and to enclose it in a sphere.",
                    visualSteps: [
                        { type: "circle", cx: 400, cy: 250, r: 140 },
                        { type: "polygon", points: [
                            [400, 110], [460, 160], [520, 140], [540, 200],
                            [500, 260], [540, 320], [480, 360], [400, 380],
                            [320, 360], [260, 320], [300, 260], [260, 200]
                        ]},
                        { type: "label", x: 310, y: 420, text: "dodecahedron in a sphere" }
                    ]
                },
                {
                    id: "XIII.Prop.18",
                    book: 13,
                    text: "To set out the sides of the five figures in one circle, and to prove that the side of the pentagon is equal to the side of the hexagon, and that the square on the side of the decagon is equal to the square on the side of the pentagon minus the square on the radius.",
                    visualSteps: [
                        { type: "circle", cx: 400, cy: 250, r: 130 },
                        { type: "polygon", points: [[400, 120], [513, 360], [287, 360]] },
                        { type: "polygon", points: [
                            [400, 120], [513, 195], [513, 305],
                            [400, 380], [287, 305], [287, 195]
                        ], dashed: true },
                        { type: "label", x: 260, y: 400, text: "five Platonic figures in one circle" }
                    ]
                }
            ]
        }
    ]
};

/* ── Application state ── */
const STEP_DELAY = 1200;
const ENTRY_DELAY = 3000;
const UI_HIDE_DELAY = 4000;

let activeBooks = new Set(euclidData.books.map(b => b.number));
let pool = [];
let entryIndex = 0;
let stepIndex = 0;
let isPlaying = true;
let isRandomMode = false;
let currentEntryId = null;
let stepTimer = null;
let entryTimer = null;
let uiTimer = null;
let drawnElements = [];

const $ = id => document.getElementById(id);
const layer = $("drawing-layer");
const contentEl = $("content");
const stepIndicator = $("step-indicator");
const bookLabel = $("book-label");
const playPauseBtn = $("play-pause");
const randomizeBtn = $("randomize");
const bookCountEl = $("book-count");

/* ── Build flat pool from selected books ── */
function rebuildPool() {
    pool = [];
    for (const book of euclidData.books) {
        if (activeBooks.has(book.number)) {
            for (const entry of book.entries) {
                pool.push({ ...entry, bookTitle: book.title });
            }
        }
    }
    if (entryIndex >= pool.length) entryIndex = 0;
    updateBookCount();
}

/* ── SVG helpers ── */
function svgEl(tag, attrs) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    return el;
}

function pathLength(el) {
    if (el.getTotalLength) return el.getTotalLength();
    if (el.tagName === "circle") return 2 * Math.PI * parseFloat(el.getAttribute("r"));
    if (el.tagName === "ellipse") {
        const rx = parseFloat(el.getAttribute("rx"));
        const ry = parseFloat(el.getAttribute("ry"));
        return Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
    }
    return 300;
}

function animateStroke(el) {
    const len = pathLength(el);
    el.style.setProperty("--dash-len", len);
    el.classList.add("anim-draw");
}

function addLabel(x, y, text, cls = "label") {
    const t = svgEl("text", { x, y, class: cls, "text-anchor": "middle" });
    t.textContent = text;
    layer.appendChild(t);
    t.classList.add("anim-fade");
    return t;
}

/* ── renderStep: draw a single visual instruction ── */
function renderStep(step, animate = true) {
    let el;

    switch (step.type) {
        case "point": {
            el = svgEl("circle", { cx: step.x, cy: step.y, r: 4, class: "point" });
            layer.appendChild(el);
            if (step.label) addLabel(step.x, step.y - 14, step.label);
            if (animate) el.classList.add("anim-fade");
            break;
        }
        case "line": {
            const [x1, y1, x2, y2] = step.points;
            const attrs = { x1, y1, x2, y2 };
            if (step.dashed) attrs["stroke-dasharray"] = "6 4";
            el = svgEl("line", attrs);
            layer.appendChild(el);
            if (animate) animateStroke(el);
            if (step.label) {
                const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
                addLabel(mx, my - 10, step.label);
            }
            break;
        }
        case "circle": {
            const attrs = { cx: step.cx, cy: step.cy, r: step.r };
            if (step.dashed) attrs["stroke-dasharray"] = "6 4";
            el = svgEl("circle", attrs);
            layer.appendChild(el);
            if (animate) animateStroke(el);
            break;
        }
        case "ellipse": {
            const attrs = { cx: step.cx, cy: step.cy, rx: step.rx, ry: step.ry };
            if (step.dashed) attrs["stroke-dasharray"] = "6 4";
            el = svgEl("ellipse", attrs);
            layer.appendChild(el);
            if (animate) animateStroke(el);
            break;
        }
        case "arc": {
            const { cx, cy, r, startAngle, endAngle } = step;
            const x1 = cx + r * Math.cos(startAngle);
            const y1 = cy + r * Math.sin(startAngle);
            const x2 = cx + r * Math.cos(endAngle);
            const y2 = cy + r * Math.sin(endAngle);
            const large = endAngle - startAngle > Math.PI ? 1 : 0;
            const d = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
            el = svgEl("path", { d });
            layer.appendChild(el);
            if (animate) animateStroke(el);
            break;
        }
        case "polygon": {
            const pts = step.points.map(p => p.join(",")).join(" ");
            const attrs = { points: pts };
            if (step.dashed) attrs["stroke-dasharray"] = "6 4";
            el = svgEl("polygon", attrs);
            layer.appendChild(el);
            if (animate) animateStroke(el);
            break;
        }
        case "rect": {
            const attrs = { x: step.x, y: step.y, width: step.w, height: step.h };
            if (step.dashed) attrs["stroke-dasharray"] = "6 4";
            el = svgEl("rect", attrs);
            layer.appendChild(el);
            if (animate) animateStroke(el);
            break;
        }
        case "label": {
            el = addLabel(step.x, step.y, step.text);
            break;
        }
        case "highlight": {
            const target = drawnElements[step.target];
            if (target) {
                target.classList.add("highlight");
                target.style.stroke = "var(--accent)";
            }
            break;
        }
        case "clear": {
            layer.innerHTML = "";
            drawnElements = [];
            return null;
        }
        default:
            return null;
    }

    if (el) drawnElements.push(el);
    return el;
}

/* ── Display logic ── */
function clearCanvas() {
    layer.innerHTML = "";
    drawnElements = [];
}

function displayEntry(entry, poolIdx) {
    if (poolIdx !== undefined && poolIdx >= 0) entryIndex = poolIdx;
    stepIndex = 0;
    currentEntryId = entry.id;

    bookLabel.textContent = `Book ${entry.book} · ${entry.id}`;
    contentEl.textContent = entry.text;
    stepIndicator.textContent = "";
    updateBrowseHighlight();

    clearCanvas();
    clearTimers();
    playSteps(entry);
}

function showEntry(idx) {
    if (pool.length === 0) {
        contentEl.textContent = "No books selected. Enable at least one book to begin.";
        bookLabel.textContent = "";
        stepIndicator.textContent = "";
        currentEntryId = null;
        clearCanvas();
        updateBrowseHighlight();
        return;
    }

    const poolIdx = ((idx % pool.length) + pool.length) % pool.length;
    displayEntry(pool[poolIdx], poolIdx);
}

function showEntryByRef(entry) {
    const poolIdx = pool.findIndex(e => e.id === entry.id && e.book === entry.book);
    displayEntry(entry, poolIdx >= 0 ? poolIdx : entryIndex);
}

function playSteps(entry) {
    if (!isPlaying || pool.length === 0) return;

    function advance() {
        if (stepIndex >= entry.visualSteps.length) {
            entryTimer = setTimeout(() => {
                if (isRandomMode) randomEntry();
                else nextEntry();
            }, ENTRY_DELAY);
            return;
        }
        renderStep(entry.visualSteps[stepIndex]);
        stepIndex++;
        stepIndicator.textContent = `Step ${stepIndex} of ${entry.visualSteps.length}`;
        stepTimer = setTimeout(advance, STEP_DELAY);
    }

    advance();
}

function clearTimers() {
    clearTimeout(stepTimer);
    clearTimeout(entryTimer);
    stepTimer = null;
    entryTimer = null;
}

function nextEntry() {
    showEntry(entryIndex + 1);
}

function prevEntry() {
    showEntry(entryIndex - 1);
}

function randomEntry() {
    if (pool.length === 0) return;
    let idx;
    do { idx = Math.floor(Math.random() * pool.length); }
    while (pool.length > 1 && idx === entryIndex);
    showEntry(idx);
}

function toggleRandomMode() {
    isRandomMode = !isRandomMode;
    randomizeBtn.classList.toggle("active", isRandomMode);
    randomizeBtn.setAttribute("aria-pressed", String(isRandomMode));
    if (isRandomMode) randomEntry();
}

function togglePlay() {
    isPlaying = !isPlaying;
    playPauseBtn.querySelector(".ctrl-icon").innerHTML = isPlaying ? "&#10074;&#10074;" : "&#9654;";
    if (isPlaying) {
        const entry = pool[entryIndex];
        if (entry && stepIndex < entry.visualSteps.length) {
            playSteps(entry);
        } else {
            nextEntry();
        }
    } else {
        clearTimers();
    }
}

/* ── Book filter UI ── */
function buildBookCheckboxes() {
    const container = $("book-checkboxes");
    container.innerHTML = "";
    for (const book of euclidData.books) {
        const label = document.createElement("label");
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = activeBooks.has(book.number);
        cb.dataset.book = book.number;
        cb.addEventListener("change", () => {
            if (cb.checked) activeBooks.add(book.number);
            else activeBooks.delete(book.number);
            rebuildPool();
            buildBrowseList();
            showEntry(0);
        });
        const num = document.createElement("span");
        num.className = "book-num";
        num.textContent = book.number;
        label.appendChild(cb);
        label.appendChild(num);
        label.appendChild(document.createTextNode(book.title));
        container.appendChild(label);
    }
}

function updateBookCount() {
    bookCountEl.textContent = `${activeBooks.size}/13`;
}

function setAllBooks(on) {
    activeBooks = on
        ? new Set(euclidData.books.map(b => b.number))
        : new Set();
    document.querySelectorAll("#book-checkboxes input").forEach(cb => {
        cb.checked = on;
    });
    rebuildPool();
    buildBrowseList();
    showEntry(0);
}

/* ── Browse panel ── */
function buildBrowseList() {
    const container = $("browse-list");
    container.innerHTML = "";

    for (const book of euclidData.books) {
        const details = document.createElement("details");
        details.className = "browse-book";
        details.open = book.number === 1;

        const summary = document.createElement("summary");
        const num = document.createElement("span");
        num.className = "browse-book-num";
        num.textContent = `Book ${book.number}`;
        const title = document.createElement("span");
        title.className = "browse-book-title";
        title.textContent = book.title;
        summary.appendChild(num);
        summary.appendChild(title);
        details.appendChild(summary);

        const entriesDiv = document.createElement("div");
        entriesDiv.className = "browse-entries";

        for (const entry of book.entries) {
            const btn = document.createElement("button");
            btn.className = "browse-entry";
            btn.dataset.id = entry.id;
            if (!activeBooks.has(book.number)) btn.classList.add("disabled");

            const idSpan = document.createElement("span");
            idSpan.className = "browse-entry-id";
            idSpan.textContent = entry.id;
            btn.appendChild(idSpan);
            btn.appendChild(document.createTextNode(entry.text));

            btn.addEventListener("click", () => {
                showUI();
                isPlaying = true;
                playPauseBtn.querySelector(".ctrl-icon").innerHTML = "&#10074;&#10074;";
                showEntryByRef({ ...entry, bookTitle: book.title });
                if (window.innerWidth <= 720) closePanel("browse");
            });

            entriesDiv.appendChild(btn);
        }

        details.appendChild(entriesDiv);
        container.appendChild(details);
    }
}

function updateBrowseHighlight() {
    document.querySelectorAll(".browse-entry").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.id === currentEntryId);
    });
    if (currentEntryId) {
        const active = document.querySelector(`.browse-entry[data-id="${currentEntryId}"]`);
        if (active) active.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
}

/* ── Panel toggles ── */
function closePanel(which) {
    if (which === "browse") {
        $("browse-panel").hidden = true;
        $("browse-toggle").setAttribute("aria-expanded", "false");
        document.body.classList.remove("browse-open");
    } else {
        $("book-panel").hidden = true;
        $("book-toggle").setAttribute("aria-expanded", "false");
        document.body.classList.remove("book-open");
    }
}

function togglePanel(which) {
    const isBrowse = which === "browse";
    const panel = $(isBrowse ? "browse-panel" : "book-panel");
    const toggle = $(isBrowse ? "browse-toggle" : "book-toggle");
    const opening = panel.hidden;

    closePanel(isBrowse ? "book" : "browse");
    panel.hidden = !opening;
    toggle.setAttribute("aria-expanded", String(opening));
    document.body.classList.toggle(isBrowse ? "browse-open" : "book-open", opening);
}

/* ── UI visibility (auto-hide for screensaver) ── */
function showUI() {
    document.body.classList.add("ui-visible");
    clearTimeout(uiTimer);
    uiTimer = setTimeout(() => {
        document.body.classList.remove("ui-visible");
    }, UI_HIDE_DELAY);
}

/* ── Event bindings ── */
function init() {
    buildBookCheckboxes();
    buildBrowseList();
    rebuildPool();
    showEntry(0);

    $("prev").addEventListener("click", () => { showUI(); isRandomMode = false; randomizeBtn.classList.remove("active"); randomizeBtn.setAttribute("aria-pressed", "false"); prevEntry(); });
    $("next").addEventListener("click", () => { showUI(); isRandomMode = false; randomizeBtn.classList.remove("active"); randomizeBtn.setAttribute("aria-pressed", "false"); nextEntry(); });
    $("play-pause").addEventListener("click", () => { showUI(); togglePlay(); });
    $("randomize").addEventListener("click", () => { showUI(); toggleRandomMode(); });
    $("select-all").addEventListener("click", () => { showUI(); setAllBooks(true); });
    $("select-none").addEventListener("click", () => { showUI(); setAllBooks(false); });

    $("browse-toggle").addEventListener("click", () => { showUI(); togglePanel("browse"); });
    $("book-toggle").addEventListener("click", () => { showUI(); togglePanel("book"); });
    $("browse-close").addEventListener("click", () => { showUI(); closePanel("browse"); });
    $("book-close").addEventListener("click", () => { showUI(); closePanel("book"); });

    document.addEventListener("mousemove", showUI);
    document.addEventListener("keydown", e => {
        if (e.target.matches("input, textarea, select")) return;

        showUI();

        if (e.key === " ") {
            e.preventDefault();
            togglePlay();
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            isRandomMode = false;
            randomizeBtn.classList.remove("active");
            randomizeBtn.setAttribute("aria-pressed", "false");
            nextEntry();
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            isRandomMode = false;
            randomizeBtn.classList.remove("active");
            randomizeBtn.setAttribute("aria-pressed", "false");
            prevEntry();
        } else if (e.key === "r" || e.key === "R") {
            toggleRandomMode();
        } else if (e.key === "b" || e.key === "B") {
            togglePanel("browse");
        } else if (e.key === "Escape") {
            closePanel("browse");
            closePanel("book");
            $("how-to-use").open = false;
        }
    });

    showUI();
}

document.addEventListener("DOMContentLoaded", init);
