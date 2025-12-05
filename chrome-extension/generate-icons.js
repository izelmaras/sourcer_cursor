// Simple script to generate placeholder icons for Chrome extension
// Run with: node generate-icons.js

const fs = require('fs');
const path = require('path');

// Simple 1x1 pixel PNG (transparent) - we'll create actual icons
// For now, create a script that uses a simple approach

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create a simple HTML file that can be used to generate icons
const iconHTML = `<!DOCTYPE html>
<html>
<head>
  <title>Generate Icons</title>
  <style>
    body {
      font-family: 'Source Code Pro', monospace;
      background: linear-gradient(135deg, rgba(107, 114, 128, 0.45) 0%, rgba(107, 114, 128, 0.55) 50%, rgba(107, 114, 128, 0.45) 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
    }
    .icon-container {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 40px;
      text-align: center;
    }
    canvas {
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      margin: 10px;
    }
    button {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-family: 'Source Code Pro', monospace;
      margin: 5px;
    }
    button:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  </style>
</head>
<body>
  <div class="icon-container">
    <h2 style="color: white; margin-bottom: 20px;">Sourcer Extension Icons</h2>
    <canvas id="icon16" width="16" height="16"></canvas>
    <canvas id="icon48" width="48" height="48"></canvas>
    <canvas id="icon128" width="128" height="128"></canvas>
    <div style="margin-top: 20px;">
      <button onclick="downloadIcons()">Download Icons</button>
    </div>
  </div>
  <script>
    function drawIcon(canvas, size) {
      const ctx = canvas.getContext('2d');
      
      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, 'rgba(251, 146, 60, 0.8)'); // orange-400
      gradient.addColorStop(1, 'rgba(249, 115, 22, 0.8)'); // orange-500
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      
      // Add blur effect background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(0, 0, size, size);
      
      // Draw lightbulb icon (simplified)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = size / 32;
      
      // Bulb shape
      const centerX = size / 2;
      const centerY = size / 2;
      const bulbRadius = size * 0.25;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY - size * 0.05, bulbRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Base
      ctx.fillRect(centerX - size * 0.15, centerY + size * 0.15, size * 0.3, size * 0.1);
    }
    
    function downloadIcons() {
      const sizes = [16, 48, 128];
      sizes.forEach(size => {
        const canvas = document.getElementById('icon' + size);
        canvas.toBlob(blob => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'icon' + size + '.png';
          a.click();
          URL.revokeObjectURL(url);
        });
      });
    }
    
    // Draw icons on load
    window.onload = () => {
      drawIcon(document.getElementById('icon16'), 16);
      drawIcon(document.getElementById('icon48'), 48);
      drawIcon(document.getElementById('icon128'), 128);
    };
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'generate-icons.html'), iconHTML);

console.log('Created generate-icons.html');
console.log('Open this file in a browser and click "Download Icons" to generate the icon files.');
console.log('Then place icon16.png, icon48.png, and icon128.png in the icons/ folder.');



