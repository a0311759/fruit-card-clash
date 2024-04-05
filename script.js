let participants = ['bot1', 'bot2', 'bot3', 'player'];
    let cards = ['🍏', '🍊', '🥭', '🍌']; // Emojis for fruits
    let cardDeck = [];
    let currentIndex = 0;
    let result = {};
    let playerTurn = false;
    let nextButtonInterval;

    // Function to start the game
    function startGame() {
      // Reset the game state
      participants = ['bot1', 'bot2', 'bot3', 'player'];
      cards = ['🍏', '🍊', '🥭', '🍌'];
      cardDeck = [];
      currentIndex = 0;
      result = {};
      playerTurn = false;

      const resultDiv = document.getElementById("result");
      resultDiv.innerHTML = "<h3>Game Started!</h3>";

      // Create a deck of cards with 4 of each fruit
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < cards.length; j++) {
          cardDeck.push(cards[j]);
        }
      }

      // Shuffle the deck
      for (let i = cardDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardDeck[i], cardDeck[j]] = [cardDeck[j], cardDeck[i]];
      }

      // Distribute cards to participants
      result = {};
      for (let i = 0; i < participants.length; i++) {
        const participant = participants[i];
        const startIndex = i * 4;
        result[participant] = cardDeck.slice(startIndex, startIndex + 4);
      }

      // Add event listeners to player's cards
      displayPlayerCards();
      // Show the "Next" button
      document.getElementById("nextButton").style.display = "inline-block";

      // Start automatic turn every 2.5 seconds
      nextButtonInterval = setInterval(autoNextTurn, 2500);

      // Change start button to restart
      const startButton = document.getElementById("startButton");
      startButton.textContent = "Restart Game";
    }

    // Function to display player's cards
    function displayPlayerCards() {
      const playerCardsDiv = document.getElementById("playerCards");
      playerCardsDiv.innerHTML = ""; // Clear previous cards
      const playerCards = result['player'];

      // Add message prompting the player to select a card
      const message = document.createElement("p");
      message.textContent = "Select a card:";
      playerCardsDiv.appendChild(message);

      for (let i = 0; i < playerCards.length; i++) {
        const card = playerCards[i];
        const cardDiv = document.createElement("div");
        cardDiv.textContent = card;
        cardDiv.classList.add("card");
        cardDiv.addEventListener("click", () => {
          if (playerTurn) {
            sendCardToBot1(card, i);
          }
        });
        playerCardsDiv.appendChild(cardDiv);
      }
    }

    // Function to handle player's turn
    function sendCardToBot1(selectedCard, index) {
      result['bot1'].push(selectedCard);
      result['player'].splice(index, 1);
      displayPlayerCards(); // Update player's cards
      displayUpdatedCardDistribution();
      checkGameOver(); // Check if the game is over after each turn
      playerTurn = false;
      document.getElementById("nextButton").style.display = "inline-block";
    }

    // Function to handle the next turn
    function nextTurn() {
      const currentPlayer = participants[currentIndex];

      if (currentPlayer === 'player') {
        playerTurn = true;
        displayPlayerCards();
        document.getElementById("nextButton").style.display = "none";
      } else {
        document.getElementById("nextButton").style.display = "inline-block";

        const currentCards = result[currentPlayer];
        const fruitCount = {};
        cards.forEach(fruit => {
          fruitCount[fruit] = currentCards.filter(card => card === fruit).length;
        });

        let minCount = Infinity;
        let minFruits = [];
        Object.keys(fruitCount).forEach(fruit => {
          if (fruitCount[fruit] < minCount && currentCards.includes(fruit)) {
            minCount = fruitCount[fruit];
            minFruits = [fruit];
          } else if (fruitCount[fruit] === minCount && currentCards.includes(fruit)) {
            minFruits.push(fruit);
          }
        });

        if (minFruits.length === 0) {
          Object.keys(fruitCount).forEach(fruit => {
            if (fruitCount[fruit] < minCount) {
              minCount = fruitCount[fruit];
              minFruits = [fruit];
            }
          });
        }

        if (minCount === 2) {
          const nextPlayerIndex = (currentIndex + 1) % participants.length;
          const nextPlayer = participants[nextPlayerIndex];
          const fruitToAdd = minFruits[0];
          let fruitFound = false;
          for (let i = 0; i < currentCards.length; i++) {
            if (currentCards[i] === fruitToAdd && !fruitFound) {
              result[currentPlayer].splice(i, 1);
              result[nextPlayer].push(fruitToAdd);
              fruitFound = true;
            }
          }
        } else {
          const nextPlayerIndex = (currentIndex + 1) % participants.length;
          const nextPlayer = participants[nextPlayerIndex];
          const fruitToAdd = minFruits[0];
          result[nextPlayer].push(fruitToAdd);
          result[currentPlayer] = result[currentPlayer].filter(card => card !== fruitToAdd);
        }

        displayUpdatedCardDistribution();
        checkGameOver(); // Check if the game is over after each turn
      }

      currentIndex = (currentIndex + 1) % participants.length;

      if (currentIndex === participants.indexOf('player')) {
        displayPlayerCards();
      }
    }

    // Function for automatic turn
    function autoNextTurn() {
      if (!playerTurn) {
        nextTurn();
      }
    }

    // Function to display updated card distribution
    function displayUpdatedCardDistribution() {
      const resultDiv = document.getElementById("result");
      resultDiv.innerHTML = "<h3>Card Distributions:</h3>";
      participants.forEach(participant => {
        resultDiv.innerHTML += `<p>${participant}: ${result[participant].join(', ')}</p>`;
      });
    }

    // Function to check if the game is over
    function checkGameOver() {
      participants.forEach(participant => {
        const cards = result[participant];
        const uniqueFruits = new Set(cards);
        if (uniqueFruits.size === 1 && cards.length === 4) {
          // End the game
          endGame(participant === 'player');
        }
      });
    }

    // Function to end the game
    function endGame(playerWon) {
      const resultDiv = document.getElementById("result");
      resultDiv.innerHTML = playerWon ? "<h3>You Won! 🎉</h3>" : "<h3>Game Over - You Lost! 😞</h3>";
      resultDiv.innerHTML += "<button onclick='startGame()'>Play Again</button>";
      clearInterval(nextButtonInterval); // Stop the automatic turn interval
      document.getElementById("nextButton").style.display = "none";
    }