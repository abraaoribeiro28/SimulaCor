document.addEventListener('DOMContentLoaded', function() {
    const colorInputs = [
        document.getElementById('color1'),
        document.getElementById('color2'),
        document.getElementById('color3')
    ];

    const colorTextInputs = [
        document.getElementById('color1Text'),
        document.getElementById('color2Text'),
        document.getElementById('color3Text')
    ];

    const simulateBtn = document.getElementById('simulateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const suggestBtn = document.getElementById('suggestBtn');
    const tabButtons = document.querySelectorAll('.tab-button');
    const colorDisplay = document.getElementById('colorDisplay');
    const contrastResults = document.getElementById('contrastResults');
    const suggestions = document.getElementById('suggestions');

    const defaultColors = ['#3366CC', '#FF9900', '#66CC33'];

    function updateColorFromText(input, colorId) {
        const colorInput = document.getElementById(colorId);
        let value = input.value.trim();

        if (value.charAt(0) !== '#') {
        value = '#' + value;
        input.value = value;
        }

        // Validar formato hexadecimal
        if (/^#[0-9A-F]{6}$/i.test(value)) {
        colorInput.value = value;
        }
    }

    colorInputs.forEach((input, index) => {
        input.addEventListener('input', () => {
        colorTextInputs[index].value = input.value.toUpperCase();
        });
    });

    window.updateColorFromText = updateColorFromText;

    function simulateColorBlindness(hex, type) {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;

        let simR, simG, simB;

        switch (type) {
            case 'protanopia':
                simR = 0.567 * r + 0.433 * g;
                simG = 0.558 * r + 0.442 * g;
                simB = 0.242 * g + 0.758 * b;
                break;
            case 'deuteranopia':
                simR = 0.625 * r + 0.375 * g;
                simG = 0.7 * r + 0.3 * g;
                simB = 0.3 * g + 0.7 * b;
                break;
            case 'tritanopia':
                simR = 0.95 * r + 0.05 * g;
                simG = 0.433 * g + 0.567 * b;
                simB = 0.475 * g + 0.525 * b;
                break;
            case 'achromatopsia':
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                simR = simG = simB = gray;
                break;
            default:
                simR = r;
                simG = g;
                simB = b;
        }

        const toHex = (c) => {
            const hex = Math.round(c * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };

        return `#${toHex(simR)}${toHex(simG)}${toHex(simB)}`.toUpperCase();
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const type = button.dataset.tab;

            colorInputs.forEach((input, index) => {
                const originalColor = input.value;
                const simulatedColor = type === 'normal'
                    ? originalColor
                    : simulateColorBlindness(originalColor, type);

                const colorBox = colorDisplay.children[index]?.querySelector('.color-box');
                if (colorBox) {
                    colorBox.style.backgroundColor = simulatedColor;
                }
            });
        });
    });

    function calculateContrast(color1, color2) {
        const toRGB = (hex) => ({
            r: parseInt(hex.slice(1, 3), 16),
            g: parseInt(hex.slice(3, 5), 16),
            b: parseInt(hex.slice(5, 7), 16),
        });

        const luminance = (rgb) => {
            const a = [rgb.r, rgb.g, rgb.b].map(v => {
                v /= 255;
                return v <= 0.03928
                    ? v / 12.92
                    : Math.pow((v + 0.055) / 1.055, 2.4);
            });
            return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
        };

        const lum1 = luminance(toRGB(color1));
        const lum2 = luminance(toRGB(color2));
        return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
    }

    function checkWcagCompliance(contrast, level) {
        if (level === 'AAA') return contrast >= 7 ? 'pass' : 'fail';
        if (contrast >= 7) return 'pass';
        if (contrast >= 4.5) return 'warning';
        return 'fail';
    }

    function updateContrastPanel() {
        const wcagLevel = document.querySelector('input[name="wcagLevel"]:checked').value;
        const html = colorInputs.map((input) => {
            const color = input.value;
            const contrast = calculateContrast(color, '#FFFFFF');
            const status = checkWcagCompliance(contrast, wcagLevel);

            const statusText = status === 'pass' ? 'Aprovado'
                : status === 'warning' ? 'Atenção'
                    : 'Falha';

            const statusClass = status === 'pass' ? 'text-green-600'
                : status === 'warning' ? 'text-yellow-600'
                    : 'text-red-600';

            return `
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-4 h-4 rounded-full mr-2" style="background-color: ${color};"></div>
                  <span>${color} sobre fundo branco</span>
                </div>
                <div class="flex items-center">
                  <span class="mr-2">Contraste: ${contrast.toFixed(2)}:1</span>
                  <span class="${statusClass} font-medium">${statusText}</span>
                </div>
              </div>
            `;
        }).join('');

        contrastResults.innerHTML = html;
    }

    document.querySelectorAll('input[name="wcagLevel"]').forEach(radio => {
        radio.addEventListener('change', updateContrastPanel);
    });

    colorInputs.forEach(input => {
        input.addEventListener('input', updateContrastPanel);
    });

    updateContrastPanel();
});