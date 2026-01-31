const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const brushSizeInput = document.getElementById('brushSize');
const sizeValueSpan = document.getElementById('sizeValue');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn');

const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');

let isDrawing = false;
let lastX = 0;
let lastY = 0;

// History management
const MAX_HISTORY = 10;
const BG_COLOR = '#000000';
const STROKE_COLOR = '#ffffff';
let history = [];
let redoStack = [];

function saveState() {
    if (history.length >= MAX_HISTORY + 1) { // +1 because first state is initial
        history.shift();
    }
    history.push(canvas.toDataURL());
    redoStack = []; // Clear redo stack on new action
    updateButtons();
}

function updateButtons() {
    undoBtn.disabled = history.length <= 1;
    redoBtn.disabled = redoStack.length === 0;
    undoBtn.style.opacity = undoBtn.disabled ? '0.3' : '1';
    redoBtn.style.opacity = redoBtn.disabled ? '0.3' : '1';
}

// Initialize canvas size
function resizeCanvas() {
    // Save current content if it exists
    const tempImage = history.length > 0 ? canvas.toDataURL() : null;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = STROKE_COLOR;
    ctx.lineWidth = brushSizeInput.value;

    if (tempImage) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0);
        img.src = tempImage;
    } else {
        saveState(); // Initial state
    }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Drawing logic
function startDrawing(e) {
    isDrawing = true;
    const { x, y } = getCoordinates(e);
    [lastX, lastY] = [x, y];
}

function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();

    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    [lastX, lastY] = [x, y];
}

function stopDrawing() {
    if (isDrawing) {
        saveState();
    }
    isDrawing = false;
}

function getCoordinates(e) {
    let x, y;
    if (e.touches && e.touches.length > 0) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
    } else {
        x = e.clientX;
        y = e.clientY;
    }
    return { x, y };
}

// Event Listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

canvas.addEventListener('touchstart', startDrawing, { passive: false });
canvas.addEventListener('touchmove', draw, { passive: false });
canvas.addEventListener('touchend', stopDrawing, { passive: false });

// Fruit Selection Logic (Handle via URL parameter)
const baseImage = document.getElementById('baseImage');
const urlParams = new URLSearchParams(window.location.search);
const fruit = urlParams.get('fruit');

const fruitMap = {
    'apple': 'static/images/apple_base.jpg',
    'maron': 'static/images/maron_base.png',
    'radish': 'static/images/radish_base.png',
    'watermelon': 'static/images/watermeron_base.png'
};

if (fruit && fruitMap[fruit]) {
    baseImage.src = fruitMap[fruit];
}

// Controls
brushSizeInput.addEventListener('input', (e) => {
    const size = e.target.value;
    ctx.lineWidth = size;
    sizeValueSpan.textContent = `${size}px`;
});

undoBtn.addEventListener('click', () => {
    if (history.length > 1) {
        redoStack.push(history.pop());
        const state = history[history.length - 1];
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = state;
        updateButtons();
    }
});

redoBtn.addEventListener('click', () => {
    if (redoStack.length > 0) {
        const state = redoStack.pop();
        history.push(state);
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = state;
        updateButtons();
    }
});

clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
});

const resultModal = document.getElementById('resultModal');
const loadingOverlay = document.getElementById('loadingOverlay');
const closeModal = document.getElementById('closeModal');
const resultImage = document.getElementById('resultImage');
const downloadBtn = document.getElementById('downloadBtn');

saveBtn.addEventListener('click', () => {
    const imageData = canvas.toDataURL('image/png');

    // Save to server
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    loadingOverlay.classList.remove('hidden');

    fetch(CONFIG.API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            if (data.status === 'success' && data.path) {
                // Show the modal with the returned image path
                resultImage.src = data.path;
                resultModal.classList.remove('hidden');
            } else {
                alert('Saved to server successfully, but no return path found!');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Error saving to server.');
        })
        .finally(() => {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save';
            loadingOverlay.classList.add('hidden');
        });
});

closeModal.addEventListener('click', () => {
    resultModal.classList.add('hidden');
});

resultModal.addEventListener('click', (e) => {
    if (e.target === resultModal) {
        resultModal.classList.add('hidden');
    }
});

downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = resultImage.src;
    link.download = 'result.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});
