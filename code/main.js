import kaplay from "kaplay";

// Your Merriam-Webster API key
const apiKey = "39afd003-102c-4b14-a140-71937359a084";

const k = kaplay({
    width: 800,
    height: 750,
});

k.loadBean();
// Remove gravity by not setting it
// k.setGravity(400); // No gravity applied

k.scene("game", () => {
    const numColumns = 14;
    const columnWidth = k.width() / numColumns;

    const fallingLetters = [];
    const selectedLetters = []; // Store the selected letters
    let wordFormed = ""; // To store the word the player is forming
    let points = 0; // Track player points
    let gameOver = false; // Flag for game over state

    const leftPanel = k.add([k.rect(k.width() / 2, k.height()), k.pos(0, 0), k.color(0, 0, 255), k.layer("background")]);
    const rightPanel = k.add([k.rect(k.width() / 2, k.height()), k.pos(k.width() / 2, 0), k.color(255, 0, 0), k.layer("background")]);
    k.add([k.rect(k.width(), 50), k.pos(0, k.height() - 50), k.area(), k.outline(3), k.body({ isStatic: true })]);
    const counterUI = k.add([k.text("Points: 0", { size: 32, font: "monospace", color: [0, 0, 0] }), k.pos(k.width() / 2 - 80, k.height() / 2 - 350)]);

    // Count of total letters on the screen
    let totalLettersOnScreen = 0;

    const letterSpeed = 1; // Speed at which the letters fall (increase this value to make letters fall faster)

    // Define a limit for the total number of letters on screen
    const maxLettersOnScreen = 199;

    k.loop(1, () => {
        if (gameOver) return; // Stop the game loop if the game is over

        // Generate a random letter
        const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // Random letter A-Z
        const columnIndex = Math.floor(Math.random() * numColumns);
        const startX = columnIndex * columnWidth + columnWidth / 2;
        const startY = 0;
        const fallingLetter = k.add([k.text(letter, { size: 48, font: "monospace", color: [0, 0, 0] }), k.pos(startX, startY), k.area(), k.body(), k.layer("background")]);

        fallingLetters.push(fallingLetter);
        totalLettersOnScreen++; // Increment the total letters on screen

        // Check if the total letters exceed the limit
        if (totalLettersOnScreen > maxLettersOnScreen) {
            gameOver = true;
            showGameOver();
            return; // Stop generating letters once the game is over
        }

        fallingLetter.onClick(() => {
            if (!gameOver && !selectedLetters.includes(fallingLetter)) {
                selectedLetters.push(fallingLetter);
                fallingLetter.color = [255, 255, 0]; // Change color to yellow
                wordFormed += fallingLetter.text; // Append the letter to the word
            }
        });

        fallingLetter.onUpdate(() => {
            // Move the letter down by the speed
            fallingLetter.pos.y += letterSpeed;

            // If the letter reaches the platform (bottom of the screen), stop its movement
            if (fallingLetter.pos.y >= k.height() - 50) {
                fallingLetter.pos.y = k.height() - 50; // Ensure it stays on the platform
            }
        });
    });

    // Function to check if the word is valid via the Merriam-Webster API
    const checkWordInDictionary = async (word) => {
        const response = await fetch(`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word.toLowerCase()}?key=${apiKey}`);
        const data = await response.json();
        return data && data.length > 0 && typeof data[0] === "object"; // Check if the response is valid
    };

    // Check word validity when the spacebar is pressed
    k.onKeyPress("space", async () => {
        if (gameOver) return; // Do nothing if the game is over
        if (wordFormed.length > 0) {
            const word = wordFormed.toUpperCase(); // Ensure word is uppercase to match dictionary
            const isValid = await checkWordInDictionary(word);
            if (isValid) {
                let wordPoints = 0;
                for (let letter of word) {
                    if ("JKWXZV".includes(letter)) {
                        wordPoints += 1000; // High-value letters
                    } else {
                        wordPoints += 100; // Regular letters
                    }
                }

                points += wordPoints;
                counterUI.text = `Points: ${points}`;
                selectedLetters.forEach((letter) => letter.destroy());
                fallingLetters.length = 0;
                selectedLetters.length = 0;
                wordFormed = "";
            } else {
                gameOver = true;
                showGameOver();
            }
        }
    });

    // Display "GAME OVER!!" at the center of the screen
    const showGameOver = () => {
        k.add([
            k.text("GAME OVER!!", { size: 64, font: "monospace", color: [255, 0, 0] }),
            k.pos(k.width() / 2 - 200, k.height() / 2 - 50),
            k.layer("background")
        ]);
    };

    // Restart game
    k.onKeyPress("r", () => {
        gameOver = false; // Reset the game over state
        points = 0; // Reset the points
        wordFormed = "";
        selectedLetters.length = 0;
        fallingLetters.length = 0;
        totalLettersOnScreen = 0; // Reset the total letters count
        k.go("game"); // Restart the game
    });
});

k.go("game");
//12/23/2024 6:27