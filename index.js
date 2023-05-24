let firstCard = undefined;
let secondCard = undefined;
let clicks = 0;
let pokemonData = [];
let matches = 0;
let remaining = 0;
let timerInterval;

const difficultyLevels = {
    "easy": { numPairs: 3, timeLimit: 20 },
    "medium": { numPairs: 6, timeLimit: 60 },
    "hard": { numPairs: 12, timeLimit: 100 },
};
let difficulty = "easy"; // Default difficulty

const updateTime = (timeLimit) => {
    let time = 0;
    timerInterval = setInterval(() => {
        time++;
        let countdown = timeLimit - time;
        $("#timer").text(time);
        $("#countdown").text(countdown);
        if (countdown <= 0) {
            clearInterval(timerInterval);
            alert("Time's up! Game over.");
        }
    }, 1000);
};

const getPokemonData = async (numPairs) => {
    time = 0;
    updateTime(difficultyLevels[difficulty].timeLimit);
    pokemonData = [];
    for (let i = 0; i < numPairs; i++) {
        const randomId = Math.floor(Math.random() * 151) + 1;
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
        const pokeData = await res.json();
        const pokemon = {
            name: pokeData.name,
            url: pokeData.url,
            imageFront: pokeData.sprites.other["official-artwork"].front_default,
            imageBack: pokeData.sprites.other["official-artwork"].front_default
        };
        pokemonData.push(pokemon);
    }
    pokemonData = [...pokemonData, ...pokemonData];
    pokemonData.sort(() => Math.random() - 0.5);

    remaining = pokemonData.length / 2;
    $('#left').text(remaining);
    $('#total').text(remaining); // Update total pairs

    renderCards();
};

const renderCards = () => {
    const gameGrid = $('#game_grid');
    gameGrid.empty(); // Clear the game grid before rendering new cards

    let numPairs = difficultyLevels[difficulty].numPairs;
    let cardWidth = 100 / numPairs; // calculate the width of the card depending on the number of pairs

    gameGrid.css('flex-direction', 'row');
    gameGrid.css('flex-wrap', 'wrap');

    if (numPairs > 3) { // If the game is in medium or hard mode
        gameGrid.css('width', '800px'); // Increase the width of the game grid
        gameGrid.css('flex-direction', 'row');
        gameGrid.css('flex-wrap', 'wrap');
    } else {
        gameGrid.css('width', '600px'); // Default width for easy mode
    }

    pokemonData.forEach((pokemon, index) => {
        const card = $('<div>').addClass('card');
        card.css('width', `${cardWidth}%`); // Set the card width dynamically

        const frontFace = $('<img>').addClass('front_face').attr('src', pokemon.imageFront).attr('id', `card${index}`);
        const backFace = $('<img>').addClass('back_face').attr('src', 'back.webp');
        card.append(backFace, frontFace);
        gameGrid.append(card);
    });
    setup();
};



const setup = () => {
    $("#dark").on("click", function () {
        $("body").addClass("dark-mode");
    });

    $("#light").on("click", function () {
        $("body").removeClass("dark-mode");
    });

    $(".card").on("click", function () {
        if ($(this).hasClass("flip") || $(this).hasClass("matched") || $(".flip").length == 2) {
            return; // do nothing if card is already flipped or matched, or if two cards are already flipped
        }
        $(this).addClass("flip");
        clicks++;
        $("#clicks").text(clicks);

        if (!firstCard) {
            firstCard = $(this);
        } else {
            secondCard = $(this);
            if ($(firstCard).find(".front_face").attr('src') == $(secondCard).find(".front_face").attr('src')) {
                // If the cards match, add the matched class and remove the flip class
                $(firstCard).addClass("matched").removeClass("flip");
                $(secondCard).addClass("matched").removeClass("flip");
                // Increment the match count and decrement the remaining match count
                matches++;
                remaining--;
                // Update the counts in the HTML
                $('#matches').text(matches);
                $('#left').text(remaining);
                // Remove the click event from these cards
                $(firstCard).off("click");
                $(secondCard).off("click");
                firstCard = undefined;
                secondCard = undefined;
                if ($(".card:not(.matched)").length == 0) {
                    setTimeout(() => {
                        alert("Congratulations! You have won the game!");
                    }, 1000);
                }
            } else {
                // If the cards don't match, flip them back after a delay
                setTimeout(() => {
                    $(firstCard).removeClass("flip");
                    $(secondCard).removeClass("flip");
                    firstCard = undefined;
                    secondCard = undefined;
                }, 1000);
            }
        }
    });
};



const showPowerUp = () => {
    $(".card:not(.matched)").addClass("flip");
  
    setTimeout(() => {
      $(".card:not(.matched)").removeClass("flip");
    }, 2000);
  };
  
  const powerUpRandomizer = () => {
    const powerUpIntervals = {
      "easy": 10000,   // 10 seconds
      "medium": 20000, // 20 seconds
      "hard": 30000    // 30 seconds
    };
  
    setTimeout(() => {
      alert("Power up activated: Revealing all cards for 2 seconds!");
      showPowerUp();
      powerUpRandomizer(); // Recurse to keep generating power-ups
    }, powerUpIntervals[difficulty]);
  };



$(document).ready(() => {
    // Add event listeners for difficulty selection
    $("#difficulty input[type='radio']").change((event) => {
      difficulty = event.target.value;
    });
  
    $("#start").click(() => {
      const { numPairs } = difficultyLevels[difficulty];
      getPokemonData(numPairs);
      powerUpRandomizer(); // Initialize power-up randomizer
    });
  });
  