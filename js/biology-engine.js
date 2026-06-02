// File: js/biology-engine.js

const NexalBiologyEngine = {
    
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
        return this.dna_rna(); // Fallback
    },

    // ==========================================
    // MOLECULAR BIOLOGY
    // ==========================================
    dna_rna: function() {
        const bases = ['A', 'T', 'C', 'G'];
        let dnaStrand = "";
        for(let i=0; i<9; i++) dnaStrand += bases[Math.floor(Math.random() * bases.length)];
        
        let mrna = ""; 
        for(let i=0; i<9; i++) {
            if(dnaStrand[i]==='A') mrna += 'U'; // RNA uses Uracil
            if(dnaStrand[i]==='T') mrna += 'A';
            if(dnaStrand[i]==='C') mrna += 'G';
            if(dnaStrand[i]==='G') mrna += 'C';
        }

        const genDistractor = () => { 
            let d = ""; 
            const rnaBases = ['A', 'U', 'C', 'G'];
            for(let i=0; i<9; i++) d += rnaBases[Math.floor(Math.random() * rnaBases.length)]; 
            return d; 
        };

        return {
            instruction: "Determine the mRNA Transcript:",
            displayType: "text",
            question: `During transcription, an mRNA molecule is built from a DNA template. If the DNA template strand is 3'-${dnaStrand}-5', what is the sequence of the resulting mRNA strand?`,
            correct: `5'-${mrna}-3'`,
            distractors: [
                `5'-${genDistractor()}-3'`,
                `3'-${mrna}-5'`,
                `5'-${dnaStrand.replace(/T/g, 'U')}-3'` // Common mistake: just swapping T for U without complementing
            ]
        };
    },

    meiosis: function() {
        const questions = [
            {
                q: "During which specific phase of meiosis does crossing-over (chiasmata formation) occur?",
                c: "Prophase I",
                d: ["Metaphase I", "Prophase II", "Anaphase II"]
            },
            {
                q: "Non-disjunction during Anaphase I of meiosis can lead to genetic disorders. What is the direct result of non-disjunction?",
                c: "Homologous chromosomes fail to separate, resulting in aneuploidy.",
                d: ["Sister chromatids are pulled to the same pole.", "DNA replication occurs twice.", "The cell membrane fails to form a cleavage furrow."]
            }
        ];
        const selected = questions[Math.floor(Math.random() * questions.length)];
        return { instruction: "Cellular Division:", displayType: "text", question: selected.q, correct: selected.c, distractors: selected.d };
    },

    // ==========================================
    // GENETICS & INHERITANCE
    // ==========================================
    mendelian: function() {
        // Procedural Monohybrid Cross: Heterozygous x Heterozygous (Aa x Aa)
        const traits = [
            { dominant: "Tall (T)", recessive: "short (t)", allele: "T" },
            { dominant: "Purple flowers (P)", recessive: "white flowers (p)", allele: "P" },
            { dominant: "Round seeds (R)", recessive: "wrinkled seeds (r)", allele: "R" }
        ];
        const trait = traits[Math.floor(Math.random() * traits.length)];
        const lowerAllele = trait.allele.toLowerCase();
        
        return {
            instruction: "Calculate Genetic Probability:",
            displayType: "text",
            question: `In a species of plant, the allele for ${trait.dominant} is dominant over ${trait.recessive}. If two heterozygous plants (${trait.allele}${lowerAllele}) are crossed, what is the phenotypic probability of producing offspring with the recessive trait?`,
            correct: "25%",
            distractors: ["50%", "75%", "0%"]
        };
    },

    // ==========================================
    // HUMAN SYSTEMS
    // ==========================================
    endocrine: function() {
        const scenarios = [
            {
                q: "A healthy person eats a meal high in carbohydrates. Which hormonal response is initiated to maintain homeostasis?",
                c: "The beta cells of the pancreas secrete insulin to lower blood glucose.",
                d: ["The alpha cells of the pancreas secrete glucagon to raise blood glucose.", "The adrenal glands secrete adrenaline to mobilize glucose.", "The pituitary gland secretes TSH to inhibit digestion."]
            },
            {
                q: "Which hormone is primarily responsible for regulating the basal metabolic rate in humans?",
                c: "Thyroxin (Thyroid Gland)",
                d: ["Aldosterone (Adrenal Cortex)", "Growth Hormone (Pituitary Gland)", "Testosterone (Testes)"]
            }
        ];
        const selected = scenarios[Math.floor(Math.random() * scenarios.length)];
        return { instruction: "Endocrine System Homeostasis:", displayType: "text", question: selected.q, correct: selected.c, distractors: selected.d };
    },

    reproduction: function() {
        const scenarios = [
            {
                q: "During the human menstrual cycle, a surge in which specific hormone is the direct trigger for ovulation?",
                c: "Luteinizing Hormone (LH)",
                d: ["Follicle Stimulating Hormone (FSH)", "Progesterone", "Estrogen"]
            },
            {
                q: "Where exactly does fertilization of the ovum typically occur in the human female reproductive system?",
                c: "The Fallopian Tube (Oviduct)",
                d: ["The Uterus", "The Endometrium lining", "The Ovary"]
            }
        ];
        const selected = scenarios[Math.floor(Math.random() * scenarios.length)];
        return { instruction: "Human Reproduction:", displayType: "text", question: selected.q, correct: selected.c, distractors: selected.d };
    },

    // ==========================================
    // EVOLUTION & ENVIRONMENT
    // ==========================================
    evolution: function() {
        return {
            instruction: "Theories of Evolution:",
            displayType: "text",
            question: "According to Jean-Baptiste Lamarck's theory of evolution (which was later disproven), how do species adapt to their environment?",
            c: "Through the inheritance of acquired characteristics modified by use and disuse during an organism's lifetime.",
            d: [
                "Through natural selection acting on random genetic mutations.",
                "Through geographical isolation leading to speciation.",
                "Through the survival of the fittest in a competitive environment."
            ]
        };
    }
};

window.NexalBiologyEngine = NexalBiologyEngine;