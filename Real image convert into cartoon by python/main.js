// Select necessary elements
const imageInput = document.getElementById('image-input');
const convertBtn = document.getElementById('convert-btn');
const originalImage = document.getElementById('original-image');
const cartoonCanvas = document.getElementById('cartoon-canvas');
const ctx = cartoonCanvas.getContext('2d');

// Function to load the uploaded image
imageInput.addEventListener('change', function () {
    const file = imageInput.files[0];
    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            originalImage.src = e.target.result;
            originalImage.style.display = 'block';

            originalImage.onload = function () {
                // Set canvas size to match the natural size of the image
                cartoonCanvas.width = originalImage.naturalWidth;
                cartoonCanvas.height = originalImage.naturalHeight;
                ctx.drawImage(originalImage, 0, 0);
            };
        };

        reader.readAsDataURL(file);
    }
});

// Function to apply AI-like cartoon effect with custom anime tones
convertBtn.addEventListener('click', function () {
    if (!originalImage.src) {
        alert('Please upload an image first!');
        return;
    }

    // Get image data from the canvas
    const imageData = ctx.getImageData(0, 0, cartoonCanvas.width, cartoonCanvas.height);
    const data = imageData.data;

    // Step 1: Smooth the image (reduce noise)
    for (let i = 0; i < data.length; i += 4) {
        data[i] = (data[i] + data[i + 4] + data[i - 4] + data[i + cartoonCanvas.width * 4] + data[i - cartoonCanvas.width * 4]) / 5; // Red
        data[i + 1] = (data[i + 1] + data[i + 5] + data[i - 3] + data[i + 1 + cartoonCanvas.width * 4] + data[i + 1 - cartoonCanvas.width * 4]) / 5; // Green
        data[i + 2] = (data[i + 2] + data[i + 6] + data[i - 2] + data[i + 2 + cartoonCanvas.width * 4] + data[i + 2 - cartoonCanvas.width * 4]) / 5; // Blue
    }

    // Step 2: Adjust tones to resemble anime color palettes
    for (let i = 0; i < data.length; i += 4) {
        // Boost saturation
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const avg = (r + g + b) / 3;

        data[i] = r + (avg - r) * 0.5 + 20; // Enhance reds
        data[i + 1] = g + (avg - g) * 0.5 + 10; // Enhance greens
        data[i + 2] = b + (avg - b) * 0.7 + 30; // Enhance blues
    }

    // Step 3: Edge detection for outlines
    const edgeData = ctx.getImageData(0, 0, cartoonCanvas.width, cartoonCanvas.height);
    const edge = edgeData.data;

    for (let y = 0; y < cartoonCanvas.height; y++) {
        for (let x = 0; x < cartoonCanvas.width; x++) {
            const index = (y * cartoonCanvas.width + x) * 4;

            // Calculate gradient
            const gx =
                (-1 * data[index - 4] + 1 * data[index + 4]) +
                (-2 * data[index - cartoonCanvas.width * 4] + 2 * data[index + cartoonCanvas.width * 4]) +
                (-1 * data[index - 4 - cartoonCanvas.width * 4] + 1 * data[index + 4 + cartoonCanvas.width * 4]);

            const gy =
                (-1 * data[index - 4 - cartoonCanvas.width * 4] + 1 * data[index + 4 - cartoonCanvas.width * 4]) +
                (-2 * data[index - cartoonCanvas.width * 4] + 2 * data[index + cartoonCanvas.width * 4]) +
                (-1 * data[index - 4 + cartoonCanvas.width * 4] + 1 * data[index + 4 + cartoonCanvas.width * 4]);

            const magnitude = Math.sqrt(gx * gx + gy * gy);

            edge[index] = edge[index + 1] = edge[index + 2] = magnitude > 50 ? 0 : 255; // Edge threshold
        }
    }

    // Step 4: Combine adjusted colors and outlines
    for (let i = 0; i < data.length; i += 4) {
        if (edge[i] === 0) {
            data[i] = data[i + 1] = data[i + 2] = 0; // Black edges
        }
    }

    // Update canvas with the final image
    ctx.putImageData(imageData, 0, 0);
    alert('Anime-like effect applied!');
});
