import kaplay from "kaplay";

// Sample dictionary (expand this with more words)
const dictionary = [
    "him", "her", "his", "she", "he", "me", "them", "man", "woman", "hello", "yes", "no", "bat", "ball", "game", "apple"
    // Add more words or load a large word list here
];

const k = kaplay({
    width: 720,
    height: 900,
});

k.loadBean();
k.setGravity(1000);

// Define the "game" scene with all gameplay logic
k.scene("game", () => {
    const numColumns = 14;
    const columnWidth = k.width() / numColumns;

    const fallingLetters = [];
    const selectedLetters = []; // Store the selected letters
    let lastLetterClickCount = 0; // Track clicks for the last letter
    let wordFormed = ""; // To store the word the player is forming
    let lastClickedLetter = null; // Track the last clicked letter
    let points = 0; // Track player points

    const leftPanel = k.add([
        k.rect(k.width() / 2, k.height()),
        k.pos(0, 0),
        k.color(0, 0, 255),
        k.layer("background")
    ]);

    const rightPanel = k.add([
        k.rect(k.width() / 2, k.height()),
        k.pos(k.width() / 2, 0),
        k.color(255, 0, 0),
        k.layer("background")
    ]);

    k.add([
        k.rect(k.width(), 50),
        k.pos(0, k.height() - 50),
        k.area(),
        k.outline(3),
        k.body({ isStatic: true }),
    ]);

    let counter = 0;
    const counterUI = k.add([k.text("0"), k.pos(k.width() - 100, 10)]);
    const columnHeights = Array(numColumns).fill(0);

    k.loop(1, () => {
        counter++;
        counterUI.text = counter;

        const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // Random letter A-Z
        const speed = 1000;
        const columnIndex = Math.floor(Math.random() * numColumns);

        const startX = columnIndex * columnWidth + columnWidth / 2;
        const startY = 0;

        const fallingLetter = k.add([
            k.text(letter, { size: 48, font: "monospace", color: [0, 0, 0] }),
            k.pos(startX, startY),
            k.area(),
            k.body(),
            k.layer("background"),
        ]);

        fallingLetters.push(fallingLetter);

        // Click event: Change color of the clicked letter and track it
        fallingLetter.onClick(() => {
            if (!selectedLetters.includes(fallingLetter)) {
                selectedLetters.push(fallingLetter); // Add to selected letters
                fallingLetter.color = [255, 255, 0]; // Change color to yellow
                wordFormed += fallingLetter.text; // Append the letter to the word

                // Track clicks for the last letter
                lastClickedLetter = fallingLetter; // Track the last clicked letter
                lastLetterClickCount = 0; // Reset count when a new letter is selected
            }

            // Track clicks on the last letter
            if (fallingLetter === lastClickedLetter) {
                lastLetterClickCount++;
                console.log(`Clicked "${fallingLetter.text}" ${lastLetterClickCount} times`); // Debugging line
            }
        });

        fallingLetter.onUpdate(() => {
            if (fallingLetter.pos.y >= k.height() - 50) {
                fallingLetter.destroy();
                columnHeights[columnIndex] = 0;
            }
        });

        fallingLetter.onUpdate(() => {
            if (fallingLetter.pos.y > columnHeights[columnIndex]) {
                columnHeights[columnIndex] = fallingLetter.pos.y;
            }
        });
    });

    // Check word validity when the last letter is clicked three times
    k.onKeyPress("space", () => {
        if (lastLetterClickCount === 3 && wordFormed.length > 0) {
            const word = wordFormed.toLowerCase();
            console.log("Word formed:", word); // Debugging line

            // Check if the word is in the dictionary
            if (dictionary.includes(word)) {
                console.log("Valid word:", word);
                // Award 100 points
                points += 100;
                console.log(`Points awarded: 100. Total points: ${points}`);
                // Update points on the screen
                counterUI.text = points;

                // Remove the selected letters from the screen
                selectedLetters.forEach(letter => letter.destroy());
                fallingLetters.length = 0; // Clear the falling letters array
                selectedLetters.length = 0; // Clear selected letters
                wordFormed = ""; // Reset the word
                lastLetterClickCount = 0; // Reset click count
                lastClickedLetter = null; // Reset the last clicked letter
            } else {
                console.log("Invalid word:", word);
            }
        } else {
            console.log("Word not yet complete or last letter not clicked 3 times");
        }
    });

    // Restart game
    k.onKeyPress("r", () => {
        k.go("game"); // Restart the game
    });
});

k.go("game");
