// File: js/curriculum.js

const NEXAL_CURRICULUM = {
    "1": {
        id: 1, title: "Pure Mathematics", badge: "Core", color: "oxford",
        description: "Advanced algebraic, geometric, and calculus matrix. Essential for engineering, computer science, and data analytics.",
        syllabus: [
            {
                title: "Algebra & Equations",
                modules: [
                    { 
                        id: "quadratics", name: "Quadratic Equations", video_id: "-KWsS2FZVTA", 
                        theory: `<p>A quadratic equation is a second-order polynomial equation in a single variable. It represents a parabola when graphed.</p>
                                 <div class="math-render my-6 text-center text-xl">ax^2 + bx + c = 0</div>
                                 <p><strong>Mastery Requirements:</strong></p>
                                 <ul class="list-disc pl-6 space-y-4 mt-4">
                                    <li><strong>Factorization:</strong> Decomposing the equation into two binomials.</li>
                                    <li><strong>The Quadratic Formula:</strong> Used when factorization is impossible.
                                        <div class="math-render my-3 pl-4">x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}</div>
                                    </li>
                                    <li><strong>The Discriminant (<span class="math-render inline-math">\\Delta</span>):</strong> The expression <span class="math-render inline-math">b^2 - 4ac</span> determines the nature of the roots (real, equal, or non-real).</li>
                                 </ul>`
                    }, 
                    { 
                        id: "inequalities", name: "Quadratic Inequalities", video_id: "_gWjLKsFOPE", 
                        theory: `<p>Quadratic inequalities require finding the range of x-values where the parabola lies above (> 0) or below (< 0) the x-axis.</p>
                                 <p class="mt-4"><strong>Protocol:</strong></p>
                                 <ol class="list-decimal pl-6 space-y-3 mt-4">
                                    <li>Rearrange the inequality to standard form: <span class="math-render inline-math">ax^2 + bx + c < 0</span>.</li>
                                    <li>Find the critical values by treating it as an equation.</li>
                                    <li>Sketch a quick parabola (concave up if <span class="math-render inline-math">a > 0</span>, concave down if <span class="math-render inline-math">a < 0</span>).</li>
                                    <li>Read the solution directly from the graph.</li>
                                 </ol>`
                    }
                ]
            },
            {
                title: "Differential Calculus",
                modules: [
                    { 
                        id: "limits", name: "Limits & First Principles", video_id: "5yfhPZZkuM8", 
                        theory: `<p>Calculus is the mathematical study of continuous change. The foundation of differentiation is the concept of a limit.</p>
                                 <p class="mt-4"><strong>Differentiation from First Principles:</strong></p>
                                 <div class="math-render my-6 text-center text-xl">f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}</div>
                                 <p>This formula calculates the exact gradient of a tangent line to a curve at any given point.</p>`
                    }
                ]
            }
        ]
    },
    "2": {
        id: 2, title: "Physical Sciences", badge: "Core", color: "emerald",
        description: "Classical mechanics, electromagnetism, and chemical systems. The foundation of modern engineering.",
        syllabus: [
            {
                title: "Physics: Mechanics",
                modules: [
                    { 
                        id: "kinematics", name: "1D & 2D Kinematics", video_id: "ZM8ECpBuQYE", 
                        theory: `<p>Kinematics is the study of motion without considering the forces that cause it. You must master the equations of linear motion.</p>
                                 <ul class="list-disc pl-6 space-y-4 mt-4">
                                    <li><span class="math-render inline-math">v_f = v_i + a \\Delta t</span></li>
                                    <li><span class="math-render inline-math">\\Delta x = v_i \\Delta t + \\frac{1}{2}a \\Delta t^2</span></li>
                                    <li><span class="math-render inline-math">v_f^2 = v_i^2 + 2a \\Delta x</span></li>
                                 </ul>`
                    },
                    { 
                        id: "newton", name: "Newton's Laws of Motion", video_id: "kKKM8Y-u7ds", 
                        theory: `<p><strong>Newton's Second Law:</strong> When a net force acts on an object, the object will accelerate in the direction of the net force.</p>
                                 <div class="math-render my-6 text-center text-xl">F_{net} = ma</div>
                                 <p>Acceleration is directly proportional to the net force and inversely proportional to the mass of the object.</p>`
                    }
                ]
            }
        ]
    },
    "3": {
        id: 3, title: "Life Sciences", badge: "Elective", color: "blue-600",
        description: "Cellular biology, genetics, and human endocrine systems.",
        syllabus: [
            {
                title: "Molecular Biology",
                modules: [
                    { 
                        id: "dna_rna", name: "DNA, RNA & Replication", video_id: "8kK2zwjRV0M", 
                        theory: `<p>Deoxyribonucleic Acid (DNA) is a double-helix molecule carrying genetic instructions. Ribonucleic Acid (RNA) translates these instructions into proteins.</p>
                                 <p class="mt-4"><strong>Base Pairing Rules:</strong></p>
                                 <ul class="list-disc pl-6 space-y-3 mt-4">
                                    <li>In DNA: Adenine (A) pairs with Thymine (T), and Cytosine (C) pairs with Guanine (G).</li>
                                    <li>In Transcription (DNA to mRNA): Adenine (A) pairs with Uracil (U).</li>
                                 </ul>`
                    }
                ]
            }
        ]
    }
};

window.NEXAL_CURRICULUM = NEXAL_CURRICULUM;
