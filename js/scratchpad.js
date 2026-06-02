// File: js/scratchpad.js

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('scratchpad-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const clearBtn = document.getElementById('clear-pad-btn');
    const modeBtn = document.getElementById('mode-pad-btn');
    
    let isDrawing = false;
    let isEraser = false;

    // Set exact canvas dimensions based on its CSS size
    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#002147'; // Oxford Blue for pen
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial sizing

    // Drawing Logic
    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    function startDrawing(e) {
        e.preventDefault();
        isDrawing = true;
        const pos = getMousePos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    }

    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const pos = getMousePos(e);
        
        if (isEraser) {
            ctx.globalCompositeOperation = "destination-out";
            ctx.lineWidth = 20; // Thicker eraser
        } else {
            ctx.globalCompositeOperation = "source-over";
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#002147';
        }
        
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    }

    function stopDrawing() {
        isDrawing = false;
        ctx.beginPath(); // Reset path so next click doesn't connect
    }

    // Mouse Events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch Events (for tablets/phones)
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    // Tools
    clearBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    modeBtn.addEventListener('click', () => {
        isEraser = !isEraser;
        if (isEraser) {
            modeBtn.textContent = "Use Pen";
            modeBtn.classList.replace('text-oxford', 'text-emerald');
        } else {
            modeBtn.textContent = "Use Eraser";
            modeBtn.classList.replace('text-emerald', 'text-oxford');
        }
    });
});