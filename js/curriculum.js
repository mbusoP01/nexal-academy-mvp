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
                        theory: `
                            <h4 class="text-xl font-bold text-oxford mb-2">1. The Standard Form</h4>
                            <p class="mb-4">A quadratic equation is a second-order polynomial equation in a single variable. When graphed on a Cartesian plane, it forms a parabola. To solve any quadratic, it must first be written in standard form:</p>
                            <div class="math-render my-6 text-center text-2xl">ax^2 + bx + c = 0</div>
                            <p class="mb-6">Where <span class="math-render inline-math">a \\neq 0</span>. The roots of the equation are the x-intercepts of the parabola.</p>

                            <h4 class="text-xl font-bold text-oxford mb-2">2. Method 1: Factorization</h4>
                            <p class="mb-2">If the quadratic can be easily decomposed, we factorize it into two binomials. By the Zero Product Property, if <span class="math-render inline-math">A \\times B = 0</span>, then either <span class="math-render inline-math">A = 0</span> or <span class="math-render inline-math">B = 0</span>.</p>
                            
                            <div class="bg-slate/5 border border-slate/10 p-6 rounded-2xl my-6">
                                <p class="font-bold text-emerald uppercase tracking-widest text-xs mb-2">Worked Example 1</p>
                                <p class="mb-2">Solve for x: <span class="math-render inline-math">x^2 - 5x + 6 = 0</span></p>
                                <ul class="list-none space-y-2 text-sm text-slate-700">
                                    <li><strong>Step 1:</strong> Find two numbers that multiply to +6 and add to -5. (Those numbers are -2 and -3).</li>
                                    <li><strong>Step 2:</strong> Write as binomials: <span class="math-render inline-math">(x - 2)(x - 3) = 0</span></li>
                                    <li><strong>Step 3:</strong> Solve for x: <span class="math-render inline-math">x = 2 \\text{ or } x = 3</span></li>
                                </ul>
                            </div>

                            <h4 class="text-xl font-bold text-oxford mb-2">3. Method 2: The Quadratic Formula</h4>
                            <p class="mb-4">When a quadratic cannot be factorized easily (resulting in irrational roots), we use the Quadratic Formula. This is derived from completing the square.</p>
                            <div class="math-render my-6 text-center text-xl">x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}</div>
                            
                            <h4 class="text-xl font-bold text-oxford mb-2">4. The Nature of Roots (The Discriminant)</h4>
                            <p class="mb-2">The expression beneath the square root in the formula is called the Discriminant (<span class="math-render inline-math">\\Delta</span>).</p>
                            <div class="math-render my-4 text-center text-lg">\\Delta = b^2 - 4ac</div>
                            <ul class="list-disc pl-6 space-y-2 mt-4">
                                <li>If <span class="math-render inline-math">\\Delta > 0</span>: The equation has <strong>two distinct real roots</strong>.</li>
                                <li>If <span class="math-render inline-math">\\Delta = 0</span>: The equation has <strong>one repeated real root</strong> (the parabola touches the x-axis exactly once).</li>
                                <li>If <span class="math-render inline-math">\\Delta < 0</span>: The equation has <strong>no real roots</strong> (the parabola floats above or below the x-axis).</li>
                            </ul>
                        `
                    }, 
                    { 
                        id: "inequalities", name: "Quadratic Inequalities", video_id: "_gWjLKsFOPE", 
                        theory: `
                            <p class="mb-4">Unlike equations that ask "Where does the parabola cross the x-axis?", inequalities ask "Where is the parabola <em>above</em> (> 0) or <em>below</em> (< 0) the x-axis?"</p>
                            
                            <h4 class="text-xl font-bold text-oxford mb-2 mt-6">The 4-Step Analytical Protocol</h4>
                            <ol class="list-decimal pl-6 space-y-3 mt-4">
                                <li><strong>Standard Form:</strong> Ensure the right side of the inequality is zero (e.g., <span class="math-render inline-math">ax^2 + bx + c > 0</span>). Ensure your <span class="math-render inline-math">x^2</span> term is positive by multiplying by -1 (remember to flip the inequality sign if you do this!).</li>
                                <li><strong>Critical Values:</strong> Replace the inequality with an equals sign and solve for x. These are your x-intercepts.</li>
                                <li><strong>Sketch the Parabola:</strong> Draw a quick Cartesian plane. Plot your critical values. Since <span class="math-render inline-math">a > 0</span>, draw a "U-shaped" curve passing through those points.</li>
                                <li><strong>Read the Graph:</strong> Highlight the section of the graph that satisfies the inequality.</li>
                            </ol>

                            <div class="bg-slate/5 border border-slate/10 p-6 rounded-2xl my-6">
                                <p class="font-bold text-emerald uppercase tracking-widest text-xs mb-2">Worked Example</p>
                                <p class="mb-2">Solve: <span class="math-render inline-math">x^2 - x - 12 < 0</span></p>
                                <ul class="list-none space-y-3 text-sm text-slate-700 mt-4">
                                    <li><strong>1. Critical Values:</strong> Factorize to get <span class="math-render inline-math">(x - 4)(x + 3) = 0</span>. Critical values are <span class="math-render inline-math">x = 4</span> and <span class="math-render inline-math">x = -3</span>.</li>
                                    <li><strong>2. Graphing:</strong> The parabola crosses the x-axis at -3 and 4, dipping below the x-axis in between them.</li>
                                    <li><strong>3. Solution:</strong> The question asks where the graph is LESS than 0 (below the axis). Looking at the sketch, it is below the axis strictly between -3 and 4.</li>
                                    <li><strong>Final Answer:</strong> <span class="math-render inline-math">-3 < x < 4</span></li>
                                </ul>
                            </div>
                        `
                    }
                ]
            },
            {
                title: "Differential Calculus",
                modules: [
                    { 
                        id: "limits", name: "Limits & First Principles", video_id: "YNstP0ESndU", 
                        theory: `
                            <h4 class="text-xl font-bold text-oxford mb-2">1. The Concept of Limits</h4>
                            <p class="mb-4">A limit evaluates what value a function <em>approaches</em> as the input approaches a specific number, even if the function is undefined at that exact point.</p>
                            
                            <div class="bg-slate/5 border border-slate/10 p-6 rounded-2xl my-6">
                                <p class="font-bold text-emerald uppercase tracking-widest text-xs mb-2">Evaluating Indeterminate Forms</p>
                                <p class="mb-4">Evaluate: <span class="math-render inline-math">\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}</span></p>
                                <p class="text-sm">If we directly substitute <span class="math-render inline-math">x = 2</span>, we get <span class="math-render inline-math">\\frac{0}{0}</span> (undefined). We must factorize first:</p>
                                <div class="math-render text-center my-3">\\lim_{x \\to 2} \\frac{(x - 2)(x + 2)}{x - 2}</div>
                                <p class="text-sm">Cancel the common terms to get <span class="math-render inline-math">\\lim_{x \\to 2} (x + 2)</span>. Now, substitute <span class="math-render inline-math">x = 2</span> to get the final answer: <strong>4</strong>.</p>
                            </div>

                            <h4 class="text-xl font-bold text-oxford mb-2 mt-8">2. Differentiation from First Principles</h4>
                            <p class="mb-4">The derivative of a function <span class="math-render inline-math">f(x)</span>, denoted as <span class="math-render inline-math">f'(x)</span>, represents the exact gradient of the tangent to the curve at any point.</p>
                            <div class="math-render my-6 text-center text-2xl">f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}</div>
                            
                            <p class="mt-4 font-bold">Pro Tip for Gauntlet Completion:</p>
                            <p class="text-sm text-slate-700">When applying first principles to <span class="math-render inline-math">f(x) = ax^2</span>, remember to perfectly expand the binomial <span class="math-render inline-math">(x+h)^2 = x^2 + 2xh + h^2</span> before multiplying by <span class="math-render inline-math">a</span>. Ensure all terms without an <span class="math-render inline-math">h</span> cancel out in the numerator before dividing.</p>
                        `
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
                        theory: `
                            <h4 class="text-xl font-bold text-oxford mb-2">1. The Fundamentals of Motion</h4>
                            <p class="mb-4">Kinematics is the mathematical description of motion. To solve any kinematics problem, you must define a positive direction (usually Up or Right) and identify three known variables.</p>
                            
                            <ul class="list-none space-y-2 mb-6">
                                <li><span class="font-bold text-oxford">Displacement ($\\Delta x$ or $\\Delta y$):</span> The straight-line distance from start to finish (Vector, measured in meters).</li>
                                <li><span class="font-bold text-oxford">Initial Velocity ($v_i$):</span> Speed and direction at $t=0$ (m/s).</li>
                                <li><span class="font-bold text-oxford">Final Velocity ($v_f$):</span> Speed and direction at the end of the time period (m/s).</li>
                                <li><span class="font-bold text-oxford">Acceleration ($a$):</span> The rate of change of velocity. For free-falling objects on Earth, <span class="math-render inline-math">a = 9.8 \\text{ m/s}^2</span> downwards.</li>
                                <li><span class="font-bold text-oxford">Time ($\\Delta t$):</span> Duration of the motion (seconds).</li>
                            </ul>

                            <h4 class="text-xl font-bold text-oxford mb-2">2. The 4 Equations of Motion</h4>
                            <p class="mb-4 text-sm text-slate-500">Note: These equations are ONLY valid for constant, uniform acceleration.</p>
                            <div class="bg-slate/5 border border-slate/10 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                                <div class="math-render text-center">v_f = v_i + a \\Delta t</div>
                                <div class="math-render text-center">v_f^2 = v_i^2 + 2a \\Delta x</div>
                                <div class="math-render text-center">\\Delta x = v_i \\Delta t + \\frac{1}{2}a \\Delta t^2</div>
                                <div class="math-render text-center">\\Delta x = \\left(\\frac{v_i + v_f}{2}\\right) \\Delta t</div>
                            </div>

                            <div class="bg-oxford text-white p-6 rounded-2xl my-6 shadow-lg">
                                <p class="font-bold text-emerald uppercase tracking-widest text-xs mb-2">Worked Example</p>
                                <p class="mb-2">A sports car accelerates uniformly from rest to 30 m/s over a distance of 150m. Calculate the acceleration.</p>
                                <ul class="list-none space-y-3 text-sm text-white/80 mt-4">
                                    <li><strong>Data Extraction:</strong> <span class="math-render inline-math text-white">v_i = 0</span>, <span class="math-render inline-math text-white">v_f = 30</span>, <span class="math-render inline-math text-white">\\Delta x = 150</span>. We need <span class="math-render inline-math text-white">a</span>.</li>
                                    <li><strong>Equation Selection:</strong> We don't have time ($t$), so we must use <span class="math-render inline-math text-white">v_f^2 = v_i^2 + 2a\\Delta x</span>.</li>
                                    <li><strong>Substitution:</strong> <span class="math-render inline-math text-white">30^2 = 0^2 + 2a(150)</span></li>
                                    <li><strong>Solve:</strong> <span class="math-render inline-math text-white">900 = 300a \\implies a = 3 \\text{ m/s}^2</span></li>
                                </ul>
                            </div>
                        `
                    },
                    { 
                        id: "newton", name: "Newton's Laws of Motion", video_id: "kKKM8Y-u7ds", 
                        theory: `
                            <h4 class="text-xl font-bold text-oxford mb-2">1. Newton's First Law (Inertia)</h4>
                            <p class="mb-4">An object will remain at rest or continue moving at a constant velocity unless acted upon by a net external force. If velocity is constant, Acceleration = 0, therefore <span class="math-render inline-math">F_{net} = 0</span>.</p>

                            <h4 class="text-xl font-bold text-oxford mb-2 mt-8">2. Newton's Second Law</h4>
                            <p class="mb-4">When a net force acts on an object, the object accelerates in the direction of the net force.</p>
                            <div class="math-render my-6 text-center text-2xl">F_{net} = ma</div>
                            
                            <h4 class="text-xl font-bold text-oxford mb-2 mt-8">3. Frictional Forces</h4>
                            <p class="mb-4">Friction always acts parallel to the surface and opposite to the direction of motion.</p>
                            <ul class="list-disc pl-6 space-y-2 mb-6 text-slate-700">
                                <li><strong>Static Friction ($f_s$):</strong> The force that prevents a stationary object from moving. It increases to match the applied force until it reaches a maximum limit (<span class="math-render inline-math">f_{s}^{max} = \\mu_s N</span>).</li>
                                <li><strong>Kinetic Friction ($f_k$):</strong> The constant force opposing an object that is already sliding (<span class="math-render inline-math">f_k = \\mu_k N</span>).</li>
                            </ul>

                            <div class="bg-slate/5 border border-slate/10 p-6 rounded-2xl my-6">
                                <p class="font-bold text-emerald uppercase tracking-widest text-xs mb-2">Free Body Diagram Protocol</p>
                                <p class="text-sm">Before doing any calculations, draw a dot representing the object. Draw arrows originating from the dot for: Gravity ($F_g$ downwards), Normal Force ($N$ perpendicular to the surface), Applied Force ($F_A$), and Friction ($f_k$ opposing motion). Resolve any angled forces into horizontal and vertical components using trigonometry.</p>
                            </div>
                        `
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
                        theory: `
                            <h4 class="text-xl font-bold text-oxford mb-2">1. The Structure of Nucleic Acids</h4>
                            <p class="mb-4">DNA (Deoxyribonucleic Acid) is the blueprint of life. It is a polymer made up of monomers called nucleotides. Every single nucleotide consists of three parts:</p>
                            <ul class="list-disc pl-6 space-y-2 mb-6 text-slate-700">
                                <li>A central 5-carbon sugar (Deoxyribose in DNA, Ribose in RNA).</li>
                                <li>A phosphate group.</li>
                                <li>A nitrogenous base.</li>
                            </ul>

                            <h4 class="text-xl font-bold text-oxford mb-2 mt-8">2. Base Pairing (Watson-Crick Model)</h4>
                            <p class="mb-4">The DNA ladder is held together by weak hydrogen bonds between complementary bases.</p>
                            <div class="bg-blue-50 border border-blue-100 p-4 rounded-xl text-center font-bold text-blue-900 mb-6">
                                Adenine (A) always pairs with Thymine (T) <br>
                                Cytosine (C) always pairs with Guanine (G)
                            </div>

                            <h4 class="text-xl font-bold text-oxford mb-2 mt-8">3. Transcription (DNA $\\rightarrow$ mRNA)</h4>
                            <p class="mb-4">DNA is trapped inside the nucleus. To get instructions to the ribosomes, a messenger RNA (mRNA) copy is made. <strong>Crucially, RNA does not have Thymine. It uses Uracil (U) instead.</strong></p>
                            
                            <div class="bg-slate/5 border border-slate/10 p-6 rounded-2xl my-6">
                                <p class="font-bold text-emerald uppercase tracking-widest text-xs mb-2">Transcription Example</p>
                                <p class="mb-2">If a DNA template strand reads: <strong>3' - T A C G C A - 5'</strong></p>
                                <p class="text-sm">The complementary mRNA transcript built off this template will be:</p>
                                <p class="mt-2 font-black text-lg text-oxford">5' - A U G C G U - 3'</p>
                                <p class="text-xs text-slate-500 mt-2">Notice how the 'A' on the DNA paired with a 'U' on the RNA, not a 'T'.</p>
                            </div>
                        `
                    }
                ]
            }
        ]
    }
};

// V1 coverage extensions: concise, original lessons with explicit practice and
// solution metadata. These are intentionally data-driven so additional CAPS
// topics can be added without changing the lesson renderer.
const v1Extensions = {
  "1": [
    { id: 'functions', name: 'Functions & Graphs', theory: `<h4 class="text-xl font-bold text-oxford mb-2">Functions as mappings</h4><p class="mb-4">A function assigns exactly one output to each allowed input. The input set is the domain and the output set is the range.</p><div class="bg-slate/5 border border-slate/10 p-6 rounded-2xl my-6"><p class="font-bold text-emerald uppercase tracking-widest text-xs mb-2">Worked Example</p><p>For <span class="math-render inline-math">f(x)=2x+3</span>, <span class="math-render inline-math">f(4)=11</span>. The gradient is 2 and the y-intercept is 3.</p></div><h4 class="text-xl font-bold text-oxford mb-2">Key checks</h4><ul class="list-disc pl-6 space-y-2"><li>Use the vertical-line test for a graph.</li><li>State restrictions such as a non-zero denominator.</li><li>Read intercepts and turning points from the graph.</li></ul>`, practice: [{ question: 'If f(x)=3x-2, calculate f(5).', answer: '13', explanation: 'Substitute x=5: 3(5)-2=13.' }] },
    { id: 'trigonometry', name: 'Trigonometry & Right Triangles', theory: `<h4 class="text-xl font-bold text-oxford mb-2">The three ratios</h4><p class="mb-4">For an acute angle in a right triangle, <span class="math-render inline-math">sin\theta=opposite/hypotenuse</span>, <span class="math-render inline-math">cos\theta=adjacent/hypotenuse</span>, and <span class="math-render inline-math">tan\theta=opposite/adjacent</span>.</p><div class="bg-slate/5 border border-slate/10 p-6 rounded-2xl my-6"><p class="font-bold text-emerald uppercase tracking-widest text-xs mb-2">Worked Example</p><p>If opposite=6 and hypotenuse=10, then <span class="math-render inline-math">sin\theta=0.6</span> and <span class="math-render inline-math">\theta=36.9^\circ</span> to one decimal place.</p></div>`, practice: [{ question: 'A right triangle has adjacent=8 and hypotenuse=10. Find cos θ.', answer: '0.8', explanation: 'cos θ = adjacent/hypotenuse = 8/10.' }] }
  ],
  "2": [
    { id: 'energy', name: 'Work, Energy & Power', theory: `<h4 class="text-xl font-bold text-oxford mb-2">Energy accounting</h4><p class="mb-4">Work transfers energy when a force causes displacement: <span class="math-render inline-math">W=F\Delta x\cos\theta</span>. Kinetic energy is <span class="math-render inline-math">E_k=1/2mv^2</span>, and power is the rate of doing work, <span class="math-render inline-math">P=W/\Delta t</span>.</p><div class="bg-oxford text-white p-6 rounded-2xl my-6"><p class="font-bold text-emerald uppercase tracking-widest text-xs mb-2">Worked Example</p><p>A 2 kg trolley moving at 3 m/s has <span class="math-render inline-math text-white">E_k=9 J</span>. Always convert mass to kg and speed to m/s.</p></div>`, practice: [{ question: 'A 4 kg object moves at 5 m/s. Find its kinetic energy.', answer: '50 J', explanation: 'Eₖ=½mv²=½(4)(25)=50 J.' }] },
    { id: 'chemical-reactions', name: 'Chemical Reactions & Stoichiometry', theory: `<h4 class="text-xl font-bold text-oxford mb-2">Conservation of atoms</h4><p class="mb-4">Balanced equations conserve each element. Coefficients change the number of particles; subscripts change the substance and must not be altered while balancing.</p><div class="bg-slate/5 border border-slate/10 p-6 rounded-2xl my-6"><p class="font-bold text-emerald uppercase tracking-widest text-xs mb-2">Worked Example</p><p>For <span class="math-render inline-math">2H_2+O_2\rightarrow2H_2O</span>, two moles of hydrogen react with one mole of oxygen to form two moles of water.</p></div>`, practice: [{ question: 'How many oxygen atoms are in 3H₂O?', answer: '3', explanation: 'Each water molecule has one oxygen atom; coefficient 3 gives three atoms.' }] }
  ],
  "3": [
    { id: 'genetics', name: 'Inheritance & Genetic Crosses', theory: `<h4 class="text-xl font-bold text-oxford mb-2">From alleles to phenotype</h4><p class="mb-4">Alleles are alternative forms of a gene. A dominant allele is expressed in a heterozygote; a recessive phenotype appears when both alleles are recessive.</p><div class="bg-blue-50 border border-blue-100 p-4 rounded-xl text-blue-900 mb-6"><strong>Worked Example:</strong> Crossing <span class="math-render inline-math">Tt\times Tt</span> gives TT, Tt, Tt, tt: a 3:1 phenotype ratio when T is completely dominant.</div>`, practice: [{ question: 'What fraction of offspring from Tt × Tt are expected to be tt?', answer: '1/4', explanation: 'One of the four Punnett-square outcomes is tt.' }] },
    { id: 'ecology', name: 'Ecosystems & Energy Flow', theory: `<h4 class="text-xl font-bold text-oxford mb-2">Connected ecosystems</h4><p class="mb-4">Producers capture energy, consumers transfer it through food chains, and decomposers recycle nutrients. Energy decreases between trophic levels because organisms respire and release heat.</p><div class="bg-slate/5 border border-slate/10 p-6 rounded-2xl my-6"><p class="font-bold text-emerald uppercase tracking-widest text-xs mb-2">Check your understanding</p><p>In grass → grasshopper → frog → snake, the grass is the producer and the frog is a secondary consumer.</p></div>`, practice: [{ question: 'Why does a food chain usually have few trophic levels?', answer: 'Energy is lost as heat at each transfer.', explanation: 'Only a fraction of energy becomes biomass available to the next level.' }] }
  ]
};
Object.entries(v1Extensions).forEach(([subjectId, modules]) => {
  const subject = NEXAL_CURRICULUM[subjectId];
  if (subject) {
    modules.forEach(module => {
      const diagramMap = { quadratics: 'content/diagrams/quadratic-parabola.svg', functions: 'content/diagrams/quadratic-parabola.svg', newton: 'content/diagrams/newton-free-body.svg', dna_rna: 'content/diagrams/dna-base-pairing.svg', genetics: 'content/diagrams/dna-base-pairing.svg' };
      if (diagramMap[module.id]) module.diagram = diagramMap[module.id];
      if (!module.video_id) module.video_status = 'SCRIPT_READY';
      else module.video_status = 'EXTERNAL_REFERENCED';
      if (!module.video_script) {
        module.video_script = {
          duration: '5–7 minutes',
          narration: `Introduce ${module.name}, model the worked example, then pause for the practice question. Recap the key rule and invite the learner to enter the practice arena.`,
          scenes: ['Learning objective', 'Concept visualisation', 'Worked example', 'Common mistake', 'Recap and practice prompt']
        };
      }
    });
    subject.syllabus.push({ title: 'V1 Core Topics', modules });
  }
});
const diagramMap = { quadratics: 'content/diagrams/quadratic-parabola.svg', functions: 'content/diagrams/quadratic-parabola.svg', newton: 'content/diagrams/newton-free-body.svg', dna_rna: 'content/diagrams/dna-base-pairing.svg', genetics: 'content/diagrams/dna-base-pairing.svg' };
Object.values(NEXAL_CURRICULUM).forEach(subject => subject.syllabus.forEach(chapter => chapter.modules.forEach(module => {
  if (diagramMap[module.id]) module.diagram = diagramMap[module.id];
  if (!module.video_script) module.video_script = {
    duration: '5–7 minutes',
    narration: `Introduce ${module.name}, model the worked example, then pause for the practice question. Recap the key rule and invite the learner to enter the practice arena.`,
    scenes: ['Learning objective', 'Concept visualisation', 'Worked example', 'Common mistake', 'Recap and practice prompt']
  };
  if (!module.video_status) module.video_status = module.video_id ? 'EXTERNAL_REFERENCED' : 'SCRIPT_READY';
})));

window.NEXAL_CURRICULUM = NEXAL_CURRICULUM;
