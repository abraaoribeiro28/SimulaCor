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
});