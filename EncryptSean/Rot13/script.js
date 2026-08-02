function rot13(text) {
    return text.replace(/[A-Za-z]/g, (char) => {
        const code = char.charCodeAt(0);
        const base = code >= 97 ? 97 : 65;
        return String.fromCharCode(((code - base + 13) % 26) + base);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const rot13Text = document.getElementById('rot13Text');
    const toRot13Btn = document.getElementById('toRot13Btn');
    const fromRot13Btn = document.getElementById('fromRot13Btn');

    toRot13Btn.addEventListener('click', () => {
        rot13Text.value = rot13(inputText.value);
    });

    fromRot13Btn.addEventListener('click', () => {
        inputText.value = rot13(rot13Text.value);
    });
});