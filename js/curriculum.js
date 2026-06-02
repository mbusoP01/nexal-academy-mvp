// File: js/curriculum.js

const NEXAL_CURRICULUM = {
    // ==========================================
    // 1. PURE MATHEMATICS
    // ==========================================
    "1": {
        id: 1,
        title: "Pure Mathematics",
        badge: "Core",
        color: "oxford",
        description: "Advanced algebraic, geometric, and calculus matrix. Essential for engineering, computer science, and data analytics.",
        syllabus: [
            {
                title: "Algebra & Equations",
                modules: [
                    { id: "quadratics", name: "Quadratic Equations", video_id: "IEuoXW-D-48" }, 
                    { id: "inequalities", name: "Quadratic Inequalities", video_id: "7tB-W_82K5I" },
                    { id: "exponents_surds", name: "Exponents & Surds", video_id: "" },
                    { id: "simultaneous", name: "Simultaneous Equations", video_id: "" }
                ]
            },
            {
                title: "Patterns, Sequences & Series",
                modules: [
                    { id: "arithmetic_seq", name: "Arithmetic Sequences", video_id: "" },
                    { id: "geometric_seq", name: "Geometric Sequences & Series", video_id: "" },
                    { id: "quadratic_seq", name: "Quadratic Sequences", video_id: "" }
                ]
            },
            {
                title: "Functions & Graphs",
                modules: [
                    { id: "parabolas", name: "Parabolas & Hyperbolas", video_id: "" },
                    { id: "exponentials", name: "Exponential & Logarithmic", video_id: "" },
                    { id: "inverse_functions", name: "Inverse Functions", video_id: "" }
                ]
            },
            {
                title: "Differential Calculus",
                modules: [
                    { id: "limits", name: "Limits & First Principles", video_id: "5yfhPZZkuM8" },
                    { id: "differentiation", name: "Rules of Differentiation", video_id: "" },
                    { id: "cubic_graphs", name: "Cubic Graphs & Tangents", video_id: "" },
                    { id: "optimization", name: "Optimization Problems", video_id: "qJc2g0gN8aA" }
                ]
            },
            {
                title: "Trigonometry & Geometry",
                modules: [
                    { id: "trig_identities", name: "Identities & General Solutions", video_id: "" },
                    { id: "trig_3d", name: "2D & 3D Problem Solving", video_id: "" },
                    { id: "analytical_geo", name: "Analytical Geometry (Circles)", video_id: "" },
                    { id: "euclidean_geo", name: "Euclidean Circle Theorems", video_id: "" }
                ]
            }
        ]
    },

    // ==========================================
    // 2. PHYSICAL SCIENCES
    // ==========================================
    "2": {
        id: 2,
        title: "Physical Sciences",
        badge: "Core",
        color: "emerald",
        description: "Classical mechanics, electromagnetism, and chemical systems. The foundation of modern engineering.",
        syllabus: [
            {
                title: "Physics: Mechanics",
                modules: [
                    { id: "kinematics", name: "1D & 2D Kinematics", video_id: "ZM8ECpBuQYE" },
                    { id: "newton", name: "Newton's Laws of Motion", video_id: "kKKM8Y-u7ds" },
                    { id: "momentum", name: "Momentum & Impulse", video_id: "" },
                    { id: "work_energy", name: "Work, Energy & Power", video_id: "" }
                ]
            },
            {
                title: "Physics: Electricity & Magnetism",
                modules: [
                    { id: "electrostatics", name: "Electrostatics (Coulomb's Law)", video_id: "" },
                    { id: "circuits", name: "Electric Circuits (Ohm's Law)", video_id: "" },
                    { id: "electrodynamics", name: "Electrodynamics (Motors & Gens)", video_id: "" }
                ]
            },
            {
                title: "Chemistry: Matter & Reactions",
                modules: [
                    { id: "organic_chem", name: "Organic Chemistry Nomenclature", video_id: "" },
                    { id: "rates", name: "Rates of Reaction", video_id: "" },
                    { id: "equilibrium", name: "Chemical Equilibrium", video_id: "" },
                    { id: "acids_bases", name: "Acids, Bases & Titrations", video_id: "" }
                ]
            }
        ]
    },

    // ==========================================
    // 3. LIFE SCIENCES
    // ==========================================
    "3": {
        id: 3,
        title: "Life Sciences",
        badge: "Elective",
        color: "blue-600",
        description: "Cellular biology, genetics, and human endocrine systems. Essential for the medical and biological sciences.",
        syllabus: [
            {
                title: "Molecular Biology",
                modules: [
                    { id: "dna_rna", name: "DNA, RNA & Replication", video_id: "8kK2zwjRV0M" },
                    { id: "protein_synth", name: "Protein Synthesis", video_id: "" },
                    { id: "meiosis", name: "Meiosis & Cell Division", video_id: "VzTC9g4sYJQ" }
                ]
            },
            {
                title: "Genetics & Inheritance",
                modules: [
                    { id: "mendelian", name: "Mendelian Genetics & Crosses", video_id: "" },
                    { id: "mutations", name: "Mutations & Genetic Engineering", video_id: "" }
                ]
            },
            {
                title: "Human Systems & Life Processes",
                modules: [
                    { id: "reproduction", name: "Human Reproduction", video_id: "" },
                    { id: "nervous_system", name: "The Nervous System", video_id: "" },
                    { id: "endocrine", name: "The Endocrine System (Hormones)", video_id: "" }
                ]
            },
            {
                title: "Evolution & Environment",
                modules: [
                    { id: "evolution", name: "Theories of Evolution (Darwin/Lamarck)", video_id: "" },
                    { id: "hominin", name: "Hominin Evolution", video_id: "" },
                    { id: "human_impact", name: "Human Impact on Environment", video_id: "" }
                ]
            }
        ]
    }
};

window.NEXAL_CURRICULUM = NEXAL_CURRICULUM;