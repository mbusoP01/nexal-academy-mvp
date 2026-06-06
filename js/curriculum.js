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
                        id: "quadratics", name: "Quadratic Equations", video_id: "IlAqHQpk_qE", // Math Antics - Safe Embed
                        theory: `<p>A quadratic equation is a second-order polynomial equation in a single variable. It represents a parabola when graphed.</p>
                                 <div class="math-render my-4 text-center">ax^2 + bx + c = 0</div>
                                 <p><strong>Mastery Requirements:</strong></p>
                                 <ul class="list-disc pl-6 space-y-2 mt-2">
                                    <li><strong>Factorization:</strong> Decomposing the equation into two binomials.</li>
                                    <li><strong>The Quadratic Formula:</strong> Used when factorization is impossible. <span class="math-render inline-math">x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}</span></li>
                                    <li><strong>The Discriminant ($\\Delta$):</strong> <span class="math-render inline-math">b^2 - 4ac</span> determines the nature of the roots (real, equal, or non-real).</li>
                                 </ul>`
                    }, 
                    { 
                        id: "inequalities", name: "Quadratic Inequalities", video_id: "_y_Q3_bOQ1Q", // Safe Embed
                        theory: `<p>Quadratic inequalities require finding the range of x-values where the parabola lies above (> 0) or below (< 0) the x-axis.</p>
                                 <p><strong>Protocol:</strong></p>
                                 <ol class="list-decimal pl-6 space-y-2 mt-2">
                                    <li>Rearrange the inequality to standard form <span class="math-render inline-math">ax^2 + bx + c < 0</span>.</li>
                                    <li>Find the critical values by treating it as an equation.</li>
                                    <li>Sketch a quick parabola (concave up if a > 0, concave down if a < 0).</li>
                                    <li>Read the solution directly from the graph.</li>
                                 </ol>`
                    }
                ]
            },
            {
                title: "Differential Calculus",
                modules: [
                    { 
                        id: "limits", name: "Limits & First Principles", video_id: "YNstP0ESndU", // Crash Course - Safe Embed
                        theory: `<p>Calculus is the mathematical study of continuous change. The foundation of differentiation is the concept of a limit.</p>
                                 <p><strong>Differentiation from First Principles:</strong></p>
                                 <div class="math-render my-4 text-center">f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}</div>
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
                        id: "kinematics", name: "1D & 2D Kinematics", video_id: "ZM8ECpBuQYE", // Crash Course Physics
                        theory: `<p>Kinematics is the study of motion without considering the forces that cause it. You must master the equations of linear motion.</p>
                                 <ul class="list-disc pl-6 space-y-2 mt-2">
                                    <li><span class="math-render inline-math">v_f = v_i + a \\Delta t</span></li>
                                    <li><span class="math-render inline-math">\\Delta x = v_i \\Delta t + \\frac{1}{2}a \\Delta t^2</span></li>
                                    <li><span class="math-render inline-math">v_f^2 = v_i^2 + 2a \\Delta x</span></li>
                                 </ul>`
                    },
                    { 
                        id: "newton", name: "Newton's Laws of Motion", video_id: "kKKM8Y-u7ds", // Crash Course Physics
                        theory: `<p><strong>Newton's Second Law:</strong> When a net force acts on an object, the object will accelerate in the direction of the net force.</p>
                                 <div class="math-render my-4 text-center">F_{net} = ma</div>
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
                        id: "dna_rna", name: "DNA, RNA & Replication", video_id: "8kK2zwjRV0M", // Amoeba Sisters
                        theory: `<p>Deoxyribonucleic Acid (DNA) is a double-helix molecule carrying genetic instructions. Ribonucleic Acid (RNA) translates these instructions into proteins.</p>
                                 <p><strong>Base Pairing Rules:</strong></p>
                                 <ul class="list-disc pl-6 space-y-2 mt-2">
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
