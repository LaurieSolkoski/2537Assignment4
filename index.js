let firstCard = undefined;
let secondCard = undefined;
let clicks = 0;
let pokemonData = [];
let matches = 0;
let remaining = 0; // Initialized later after pokemonData is fully populated


// Fetch Pokémon data
const getPokemonData = async () => {
    try {
        pokemonData = [];
        for (let i = 0; i < 3; i++) {
            const randomId = Math.floor(Math.random() * 151) + 1; // Generate a random ID between 1 and 151 (for Gen 1 Pokémon)
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
        // Duplicating the pokemon data to create pairs
        pokemonData = [...pokemonData, ...pokemonData];
        // Shuffling the array to randomize the card positions
        pokemonData.sort(() => Math.random() - 0.5);

        // Initialize remaining matches after Pokemon data has been fetched and duplicated
        remaining = pokemonData.length / 2; 
        $('#left').text(remaining);

        renderCards();
    } catch (error) {
        console.error('Error:', error);
    }
};

// Render cards
const renderCards = () => {
    const gameGrid = $('#game_grid');
    pokemonData.forEach((pokemon, index) => {
        const card = $('<div>').addClass('card');
        const frontFace = $('<img>').addClass('front_face').attr('src', pokemon.imageFront).attr('id', `card${index}`);
        const backFace = $('<img>').addClass('back_face').attr('src', 'back.webp'); 
        card.append(backFace, frontFace); 
        gameGrid.append(card);
    });
    setup();
};

const setup = () => {
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

$(document).ready(getPokemonData);
