// File: js/physics-engine.js

const NexalPhysicsEngine = {
    
    shuffle: function(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    generate: function(moduleId) {
        if (typeof this[moduleId] === 'function') {
            return this[moduleId]();
        }
        return this.kinematics(); // Fallback
    },

    // ==========================================
    // PHYSICS: MECHANICS
    // ==========================================
    kinematics: function() {
        const u = Math.floor(Math.random() * 15) + 5; // Initial velocity
        const a = Math.floor(Math.random() * 8) + 2;  // Acceleration
        const t = Math.floor(Math.random() * 10) + 3; // Time
        // Formula: s = ut + 0.5 * a * t^2
        const s = (u * t) + (0.5 * a * t * t);

        return {
            instruction: "Calculate the total displacement (s):",
            displayType: "text",
            question: `A vehicle traveling at an initial velocity of ${u} m/s accelerates uniformly at ${a} m/s² for exactly ${t} seconds. What is the total displacement of the vehicle?`,
            correct: `${s} m`,
            distractors: [
                `${s + (10 * a)} m`,
                `${(u * t) + (a * t)} m`,
                `${s - (5 * t)} m`
            ]
        };
    },

    newton: function() {
        const m = Math.floor(Math.random() * 50) + 10; // Mass in kg
        const fApp = Math.floor(Math.random() * 500) + 200; // Applied Force
        const fFric = Math.floor(Math.random() * 100) + 20; // Frictional Force
        // Formula: Fnet = ma -> a = (Fapp - Ffric) / m
        const a = parseFloat(((fApp - fFric) / m).toFixed(2));

        return {
            instruction: "Calculate the acceleration (a):",
            displayType: "text",
            question: `A block of mass ${m} kg rests on a rough horizontal surface. A constant applied force of ${fApp} N acts on the block, while a kinetic frictional force of ${fFric} N opposes the motion. Calculate the magnitude of the block's acceleration.`,
            correct: `${a} m/s²`,
            distractors: [
                `${parseFloat((fApp / m).toFixed(2))} m/s²`,
                `${parseFloat(((fApp + fFric) / m).toFixed(2))} m/s²`,
                `${parseFloat((a + 2.5).toFixed(2))} m/s²`
            ]
        };
    },

    momentum: function() {
        const m1 = Math.floor(Math.random() * 1000) + 800; // Car 1 mass
        const v1 = Math.floor(Math.random() * 20) + 10; // Car 1 velocity
        const m2 = Math.floor(Math.random() * 1200) + 900; // Car 2 mass
        const v2 = 0; // Car 2 is stationary
        
        // Inelastic collision: m1v1 + m2v2 = (m1 + m2)vf
        const vf = parseFloat(((m1 * v1) / (m1 + m2)).toFixed(2));

        return {
            instruction: "Calculate the final velocity (v_f):",
            displayType: "text",
            question: `A car of mass ${m1} kg moving east at ${v1} m/s collides with a stationary truck of mass ${m2} kg. They lock together upon impact (inelastic collision). Calculate their combined velocity immediately after the collision.`,
            correct: `${vf} m/s East`,
            distractors: [
                `${parseFloat((vf + 3.2).toFixed(2))} m/s East`,
                `${v1} m/s East`,
                `${parseFloat(((m1 * v1) / m2).toFixed(2))} m/s East`
            ]
        };
    },

    work_energy: function() {
        const m = Math.floor(Math.random() * 10) + 2; // mass
        const h = Math.floor(Math.random() * 20) + 5; // height
        const g = 9.8;
        const Ep = parseFloat((m * g * h).toFixed(1)); // Gravitational Potential Energy

        return {
            instruction: "Calculate the Gravitational Potential Energy (Ep):",
            displayType: "text",
            question: `A boulder of mass ${m} kg is lifted vertically to a height of ${h} meters above the ground. Assume g = 9.8 m/s². What is the boulder's gravitational potential energy relative to the ground?`,
            correct: `${Ep} J`,
            distractors: [
                `${parseFloat((m * h).toFixed(1))} J`,
                `${parseFloat((Ep + 98).toFixed(1))} J`,
                `${parseFloat((m * 9.8).toFixed(1))} J`
            ]
        };
    },

    // ==========================================
    // PHYSICS: ELECTRICITY & MAGNETISM
    // ==========================================
    electrostatics: function() {
        // Concept-based proportional thinking for Coulomb's Law
        const multipliers = [2, 3, 4];
        const rMulti = multipliers[Math.floor(Math.random() * multipliers.length)];
        const fraction = rMulti * rMulti;

        return {
            instruction: "Apply Coulomb's Law:",
            displayType: "text",
            question: `Two point charges exert an electrostatic force F on each other. If the distance (r) between their centers is increased by a factor of ${rMulti}, what will be the new magnitude of the electrostatic force?`,
            correct: `F / ${fraction}`,
            distractors: [
                `F / ${rMulti}`,
                `${rMulti}F`,
                `${fraction}F`
            ]
        };
    },

    circuits: function() {
        const r1 = Math.floor(Math.random() * 6) + 2;
        const r2 = Math.floor(Math.random() * 6) + 2;
        // Parallel resistance formula: Rp = (R1 * R2) / (R1 + R2)
        const rp = parseFloat(((r1 * r2) / (r1 + r2)).toFixed(2));

        return {
            instruction: "Calculate the equivalent resistance:",
            displayType: "text",
            question: `In a DC circuit, two resistors with resistances R₁ = ${r1} Ω and R₂ = ${r2} Ω are connected in parallel. Calculate the total equivalent resistance of this parallel network.`,
            correct: `${rp} Ω`,
            distractors: [
                `${r1 + r2} Ω`,
                `${parseFloat(((r1 + r2) / (r1 * r2)).toFixed(2))} Ω`,
                `${Math.max(r1, r2)} Ω`
            ]
        };
    },

    electrodynamics: function() {
        // Theory-based MCQ
        const questions = [
            {
                q: "Which principle primarily explains how an AC generator converts mechanical energy into electrical energy?",
                c: "Electromagnetic Induction (Faraday's Law)",
                d: ["The Motor Effect", "Ohm's Law", "Coulomb's Law"]
            },
            {
                q: "In a DC motor, what is the primary function of the split-ring commutator?",
                c: "To reverse the current direction in the coil every half cycle.",
                d: ["To increase the magnetic field strength.", "To prevent the coil from overheating.", "To convert AC supply into DC supply."]
            }
        ];
        const selected = questions[Math.floor(Math.random() * questions.length)];
        return {
            instruction: "Select the correct scientific principle:",
            displayType: "text",
            question: selected.q,
            correct: selected.c,
            distractors: selected.d
        };
    },

    // ==========================================
    // CHEMISTRY: MATTER & REACTIONS
    // ==========================================
    organic_chem: function() {
        const concepts = [
            {
                q: "Identify the general formula for Alkanes.",
                c: "CₙH₂ₙ₊₂",
                d: ["CₙH₂ₙ", "CₙH₂ₙ₋₂", "CₙH₂ₙ₊₁OH"]
            },
            {
                q: "Which functional group identifies an Alcohol?",
                c: "Hydroxyl group (-OH)",
                d: ["Carboxyl group (-COOH)", "Carbonyl group (-C=O)", "Ester link (-COO-)"]
            }
        ];
        const selected = concepts[Math.floor(Math.random() * concepts.length)];
        return { instruction: "Organic Nomenclature:", displayType: "text", question: selected.q, correct: selected.c, distractors: selected.d };
    },

    rates: function() {
        return {
            instruction: "Reaction Kinetics:",
            displayType: "text",
            question: "According to Collision Theory, adding a positive catalyst increases the rate of reaction. Why does this occur?",
            correct: "It provides an alternative pathway with a lower activation energy.",
            distractors: [
                "It increases the kinetic energy of the reactant molecules.",
                "It increases the concentration of the products.",
                "It makes the reaction highly exothermic."
            ]
        };
    },

    equilibrium: function() {
        return {
            instruction: "Le Chatelier's Principle:",
            displayType: "text",
            question: "Consider an exothermic reaction at equilibrium: A(g) + B(g) ⇌ C(g) + Heat. What effect will increasing the temperature of the system have?",
            correct: "The reverse reaction will be favored, decreasing the yield of C.",
            distractors: [
                "The forward reaction will be favored, increasing the yield of C.",
                "The equilibrium constant (Kc) will increase.",
                "There will be no shift; catalysts are required to shift equilibrium."
            ]
        };
    },

    acids_bases: function() {
        const hConcentration = Math.floor(Math.random() * 5) + 2; // e.g., 2 to 6
        // pH = -log[H+] -> let's do a simple 1 x 10^-X to make the math clean for mental calculation
        const phValue = hConcentration;
        
        return {
            instruction: "Calculate the pH:",
            displayType: "text",
            question: `A strong monoprotic acid solution has a hydrogen ion concentration [H⁺] of 1 × 10⁻${phValue} mol/dm³. Calculate the pH of the solution.`,
            correct: `${phValue}`,
            distractors: [
                `${14 - phValue}`,
                `-${phValue}`,
                `10`
            ]
        };
    }
};

window.NexalPhysicsEngine = NexalPhysicsEngine;