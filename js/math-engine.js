// File: js/math-engine.js

const NexalMathEngine = {
    // Helper to shuffle choices
    shuffle: function(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    // Main Router called by the Arena Engine
    generate: function(moduleId) {
        if (typeof this[moduleId] === 'function') {
            return this[moduleId]();
        }
        // Fallback if a specific generator isn't coded yet
        return this.quadratics();
    },

    // ==========================================
    // ALGEBRA STREAM
    // ==========================================
    quadratics: function() {
        let r1 = 0, r2 = 0;
        while(r1 === 0) r1 = Math.floor(Math.random() * 14) - 7;
        while(r2 === 0 || r2 === r1) r2 = Math.floor(Math.random() * 14) - 7;
        const b = -(r1 + r2), c = r1 * r2;
        let bStr = b === 1 ? "+" : b === -1 ? "-" : b > 0 ? `+${b}` : b;
        let cStr = c > 0 ? `+${c}` : c;
        return {
            instruction: "Solve for x:",
            displayType: "katex",
            question: `x^2 ${b !== 0 ? bStr + 'x' : ''} ${cStr} = 0`,
            correct: `x = ${r1} \\text{ or } x = ${r2}`,
            distractors: [
                `x = ${-r1} \\text{ or } x = ${-r2}`,
                `x = ${r1} \\text{ or } x = ${-r2}`,
                `x = ${-r1} \\text{ or } x = ${r2}`
            ]
        };
    },

    inequalities: function() {
        let r1 = Math.floor(Math.random() * 5) + 1; // smaller root
        let r2 = r1 + Math.floor(Math.random() * 5) + 2; // larger root
        const b = -(r1 + r2), c = r1 * r2;
        let bStr = b > 0 ? `+${b}` : b;
        let cStr = c > 0 ? `+${c}` : c;
        
        const isLessThan = Math.random() > 0.5;
        const symbol = isLessThan ? "<" : ">";
        
        return {
            instruction: "Solve the inequality for x:",
            displayType: "katex",
            question: `x^2 ${bStr}x ${cStr} ${symbol} 0`,
            correct: isLessThan ? `${r1} < x < ${r2}` : `x < ${r1} \\text{ or } x > ${r2}`,
            distractors: [
                isLessThan ? `x < ${r1} \\text{ or } x > ${r2}` : `${r1} < x < ${r2}`,
                isLessThan ? `${-r2} < x < ${-r1}` : `x < ${-r2} \\text{ or } x > ${-r1}`,
                isLessThan ? `x < ${-r2} \\text{ or } x > ${-r1}` : `${-r2} < x < ${-r1}`
            ]
        };
    },

    exponents_surds: function() {
        const bases = [2, 3, 5];
        const base = bases[Math.floor(Math.random() * bases.length)];
        const xVal = Math.floor(Math.random() * 3) + 2; // Correct answer
        const lhsVal = Math.pow(base, xVal + 1) - Math.pow(base, xVal);
        
        return {
            instruction: "Solve the exponential equation for x:",
            displayType: "katex",
            question: `${base}^{x+1} - ${base}^x = ${lhsVal}`,
            correct: `x = ${xVal}`,
            distractors: [`x = ${xVal + 1}`, `x = ${xVal - 1}`, `x = ${Math.pow(base, 2)}`]
        };
    },

    simultaneous: function() {
        const x = Math.floor(Math.random() * 5) + 1;
        const y = Math.floor(Math.random() * 4) + 2;
        
        const eq1_rhs = x + y;
        const eq2_rhs = (x * x) + y;
        
        return {
            instruction: "Solve the simultaneous system for x and y:",
            displayType: "katex",
            question: `\\begin{aligned} y + x &= ${eq1_rhs} \\\\ x^2 + y &= ${eq2_rhs} \\end{aligned}`,
            correct: `x = ${x}, \\, y = ${y}`,
            distractors: [
                `x = ${y}, \\, y = ${x}`,
                `x = ${x + 1}, \\, y = ${y - 1}`,
                `x = ${x - 1}, \\, y = ${y + 1}`
            ]
        };
    },

    // ==========================================
    // PATTERNS & SEQUENCES STREAM
    // ==========================================
    arithmetic_seq: function() {
        const a = Math.floor(Math.random() * 10) + 2; // first term
        const d = Math.floor(Math.random() * 6) + 3;  // common difference
        const n = Math.floor(Math.random() * 15) + 10; // term number to find
        const tn = a + (n - 1) * d;

        return {
            instruction: `Determine the value of the ${n}^{\\text{th}} term ($T_{${n}}$) for the sequence:`,
            displayType: "katex",
            question: `${a}; \\, ${a+d}; \\, ${a+2*d}; \\, ${a+3*d}; \\, \\dots`,
            correct: `T_{${n}} = ${tn}`,
            distractors: [
                `T_{${n}} = ${tn + d}`,
                `T_{${n}} = ${tn - d}`,
                `T_{${n}} = ${a + n * d}`
            ]
        };
    },

    geometric_seq: function() {
        const a = Math.floor(Math.random() * 3) + 2; // first term
        const r = 2; // common ratio kept small to prevent huge numbers
        const n = Math.floor(Math.random() * 4) + 5; // term 5 to 8
        const tn = a * Math.pow(r, n - 1);

        return {
            instruction: `Find the value of the ${n}^{\\text{th}} term for the geometric sequence:`,
            displayType: "katex",
            question: `${a}; \\, ${a*r}; \\, ${a*r*r}; \\, ${a*r*r*r}; \\, \\dots`,
            correct: `T_{${n}} = ${tn}`,
            distractors: [
                `T_{${n}} = ${tn * r}`,
                `T_{${n}} = ${tn + 12}`,
                `T_{${n}} = ${a * Math.pow(r, n)}`
            ]
        };
    },

    quadratic_seq: function() {
        // Tn = an^2 + bn + c
        const a = Math.floor(Math.random() * 2) + 1; // second diff factor
        const b = Math.floor(Math.random() * 3) + 1;
        const c = Math.floor(Math.random() * 5);
        
        const t1 = a*(1) + b*(1) + c;
        const t2 = a*(4) + b*(2) + c;
        const t3 = a*(9) + b*(3) + c;
        const t4 = a*(16) + b*(4) + c;

        return {
            instruction: "Find the general formula ($T_n$) for the quadratic sequence:",
            displayType: "katex",
            question: `${t1}; \\, ${t2}; \\, ${t3}; \\, ${t4}; \\, \\dots`,
            correct: `T_n = ${a === 1 ? '' : a}n^2 + ${b}n ${c === 0 ? '' : '+ ' + c}`,
            distractors: [
                `T_n = ${a * 2}n^2 + ${b}n + ${c}`,
                `T_n = ${a}n^2 - ${b}n + ${c}`,
                `T_n = ${b}n^2 + ${a}n + ${c}`
            ]
        };
    },

    // ==========================================
    // CALCULUS STREAM
    // ==========================================
    limits: function() {
        const a = Math.floor(Math.random() * 5) + 2; // limit value
        // Expression: (x^2 - a^2) / (x - a) = x + a
        const lhsSquare = a * a;
        
        return {
            instruction: "Evaluate the limit value:",
            displayType: "katex",
            question: `\\lim_{x \\to ${a}} \\frac{x^2 - ${lhsSquare}}{x - ${a}}`,
            correct: `${a * 2}`,
            distractors: [`0`, `\\text{Undefined}`, `${a}`]
        };
    },

    differentiation: function() {
        let a = Math.floor(Math.random() * 5) + 2;
        let b = Math.floor(Math.random() * 8) + 2;
        
        return {
            instruction: "Determine the exact derivative derivative with respect to x ($D_x$):",
            displayType: "katex",
            question: `D_x \\left[ ${a}x^4 - \\frac{${b}}{x^2} \\right]`,
            correct: `${a*4}x^3 + \\frac{${b*2}}{x^3}`,
            distractors: [
                `${a*4}x^3 - \\frac{${b*2}}{x^3}`,
                `${a}x^3 + \\frac{${b}}{x^3}`,
                `${a*4}x^4 + \\frac{${b*2}}{x^1}`
            ]
        };
    },

    optimization: function() {
        // Minimize/Maximize area/perimeter context
        const totalLength = (Math.floor(Math.random() * 5) + 4) * 20; // 80 to 160 meters
        // Fence enclosing rectangle against a wall: L + 2W = totalLength -> Area = W(totalLength - 2W)
        // dA/dW = totalLength - 4W = 0 -> W = totalLength / 4
        const maxW = totalLength / 4;
        const maxArea = maxW * (totalLength - 2 * maxW);

        return {
            instruction: "Solve the optimization scenario:",
            displayType: "text",
            question: `A farmer wants to construct a rectangular enclosure against a long brick wall using exactly ${totalLength} meters of fencing. Calculate the absolute maximum area (in $m^2$) that can be enclosed.`,
            correct: `${maxArea} m^2`,
            distractors: [`${maxArea - 100} m^2`, `${totalLength * 2} m^2`, `${maxW * totalLength} m^2`]
        };
    }
};

window.NexalMathEngine = NexalMathEngine;