/**
 * Point culture (en Français car je suis un peu obligé): 
 * Dans ce genre de jeu, un mot equivaut a 5 caractères, y compris les espaces. 
 * La precision, c'est le pourcentage de caractères tapées correctement sur toutes les caractères tapées.
 * 
 * Sur ce... Amusez-vous bien ! 
 */

let startTime = null, previousEndTime = null;
let currentWordIndex = 0;
const wordsToType = [];

const wordDisplay = document.getElementById("word-display");
const inputField = document.getElementById("input-field");
const results = document.getElementById("results");

let timeIntervalle;
const totalTime = 60;
const settings = JSON.parse(localStorage.getItem('typingGameSettings')) || {
    difficulty: 'medium',
    wordCount: 25
};

const words = {
    easy: ["apple", "banana", "grape", "orange", "cherry"],
    medium: ["keyboard", "monitor", "printer", "charger", "battery"],
    hard: ["synchronize", "complicated", "development", "extravagant", "misconception"]
};

// Generate a random word from the selected mode
const getRandomWord = (mode) => {
    const wordList = words[mode];
    return wordList[Math.floor(Math.random() * wordList.length)];
};

// Initialize the typing test
const startTest = () => {
    if (timerInterval) clearInterval(timerInterval);
    document.getElementById("timer").textContent = `${totalTime}s`;
    inputField.disabled = false;

    wordsToType.length = 0; // Clear previous words
    wordDisplay.innerHTML = ""; // Clear display
    currentWordIndex = 0;
    startTime = null;
    previousEndTime = null;

    for (let i = 0; i < settings.wordCount; i++) {
        wordsToType.push(getRandomWord(settings.difficulty));
    }

    wordsToType.forEach((word, index) => {
        const span = document.createElement("span");
        span.textContent = word + " ";
        if (index === 0) span.style.color = "red"; // Highlight first word
        wordDisplay.appendChild(span);
    });

    inputField.value = "";
    results.textContent = "";
};

// Start the timer when user begins typing
const startTimer = () => {
    if (!startTime) {
        startTime = Date.now();
        let timeLeft = totalTime;
        timerInterval = setInterval(() => {
            timeLeft--;
            document.getElementById("timer").textContent = `${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                inputField.disabled = true;
            }
        }, 1000);
    }
};

// Calculate and return WPM & accuracy
const getCurrentStats = () => {
    const elapsedTime = (Date.now() - previousEndTime) / 1000; // Seconds
    const wpm = (wordsToType[currentWordIndex].length / 5) / (elapsedTime / 60); // 5 chars = 1 word
    const accuracy = (wordsToType[currentWordIndex].length / inputField.value.length) * 100;

    return { wpm: wpm.toFixed(2), accuracy: accuracy.toFixed(2) };
};

// Move to the next word and update stats only on spacebar press
const updateWord = (event) => {
    if (event.key === " ") { // Check if spacebar is pressed
        const typedWord = inputField.value.trim();
        const currentWord = wordsToType[currentWordIndex];
        const wordSpans = wordDisplay.querySelectorAll("span");
        
        if (typedWord === currentWord) {
            wordSpans[currentWordIndex].classList.add("correct");
        } else {
            wordSpans[currentWordIndex].classList.add("incorrect");
        }
        if (inputField.value.trim() === wordsToType[currentWordIndex]) {
            if (!previousEndTime) previousEndTime = startTime;

            const { wpm, accuracy } = getCurrentStats();
            results.textContent = `WPM: ${wpm}, Accuracy: ${accuracy}%`;

            currentWordIndex++;
            previousEndTime = Date.now();
            highlightNextWord();

            inputField.value = ""; // Clear input field after space
            event.preventDefault(); // Prevent adding extra spaces
        }
    }
};

// Highlight the current word in red
const highlightNextWord = () => {
    const wordElements = wordDisplay.children;

    if (currentWordIndex < wordElements.length) {
        Array.from(wordElements).forEach(el => {
            el.classList.remove("current");
            el.classList.remove("correct", "incorrect");
        });
        wordElements[currentWordIndex].classList.add("current");
    }
    if (currentWordIndex > 0) {
        wordElements[currentWordIndex - 1].style.color = "green";
    }
    wordElements[currentWordIndex].style.color = "red";
};

// Event listeners
// Attach `updateWord` to `keydown` instead of `input`
inputField.addEventListener("keydown", (event) => {
    startTimer();
    updateWord(event);
});
document.getElementById("restart-btn").addEventListener("click", startTest)
// Start the test
startTest();
