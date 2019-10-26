/**
 * 
 * Simple artificial intelligence memory game where a user competes against 
 * an intelligent agent to find pairs of images. The agent and the user don't
 * have any information about the cards when the game begins. As they begin to
 * flip the cards, the agent starts storing the information of cards. 
 * (image + position -> card).
 *
 * Choices that the AI takes:
 * 1) If the agent has information of where a pair is located, it automatically
 *    flips a pair by getting that information from automatic selection 
 *    function.
 * 2) If it doesn't have information about where a pair is located, it selects
 *    its first card randomly, then checks if it has information of where its
 *    pair is located. If it has that information, it will flip its pair as
 *    its second card, otherwise it will randomly flip its second card.
 * 3) If it doesn't have any information of any card, it selects its first
 *    and second card randomly (If it randomly selects a pair it's 
 *    coincidence, not a decision by memory).
 *
 * Rule A: Every time a card is flipped either by the user or the agent, the
 *         card information is stored so that the agent has its information
 *         for future flips.
 * Rule B: Agent always flips a card that has not been flipped before to not
 *         limit itself to acquire new information.
 *         It will only flip cards that have been flipped before if all the
 *         cards have been flipped already, which from that point on, the
 *         agent has all the information of where all the cards are located.
 *
 * Scoring: The winner is the one who collects more pairs. There are no tides,
 *          because the number of pairs (cards/2) is an odd number.
 *
 * Players: User and AI
 *
 * Instructions:
 * Each player selects two cards per turn to find a pair. If a pair is found,
 * the player can flip again until a pair is not found. If a pair is not found,
 * the other player has its turn to flip. User chooses who flips first before
 * the game begins.
 *
 * @Code efficiency
 * Negative aspects: (Besides the uncaught aspects)
 * flippedPositions[] and flippedImages[] store information of cards that have
 * been flipped. When pairs are found, they don't get removed from these
 * arrays, they get pushed to removedPositions[] and removedImages[] so that
 * the AI knows that they are "removed" from the game and are not available to
 * flip anymore.
 *
 * So, if a card is flipped multiple times, it also gets stored multiple times
 * and this makes the array to contain duplicates. This is not a big storage 
 * consumption problem as the majority of duplicates will be because of the 
 * user, and at least one duplicate per card because of the AI. 
 * This is not fixed because this can be needed if statistics is added to the
 * program about how many times the user flipped the same card, wasting its 
 * turn to acquire new information, which is something that the AI doesn't do
 * according to Rule B.
*/


// - - - - - - - - - - - General Global Varibales - - - - - - - - - - - - - -

var turnAI = false; // AI turn is second by default
var turnUser = false; // User turn is first by default
var canUserFlip = false; // User availability to flip regarding if it's its turn

var scoreUser = 0; // User's found pairs
var scoreAI = 0; // AI's found pairs

var playerFlipsFirst;

var flippedCardsLength = 0; // flippedCards{} length (number of flipped cards)

var numOfFlips = 0; // Player's number of flips per turn
var onTurnChosenPosition = []; // To compare flipped cards (at checkForPairs)
var onTrunChosenImage = []; // To compare flipped cards (at checkForPairs)
var onTurnPositions = []; // To check if player clicks same position on a turn
var removedPositions = []; // Removed and no longer available positions to flip
var removedImages = []; // Removed and no longer available images to flip

var flippedCards = {}; // Cards that User and AI have flipped (For AI memory)
var flippedPositions = []; // Stores positions as User and AI flips
var flippedImages = []; // Stores images as User and AI flips

var shuffledImages = []; // Stores shuffled images
var shuffledCards = {}; // Stores shuffled cards

// All images for 30 cards (15 pairs)
var img1 = "../images/" + theme + "/cards/img1.png";
var img2 = "../images/" + theme + "/cards/img2.png";
var img3 = "../images/" + theme + "/cards/img3.png";
var img4 = "../images/" + theme + "/cards/img4.png";
var img5 = "../images/" + theme + "/cards/img5.png";
var img6 = "../images/" + theme + "/cards/img6.png";
var img7 = "../images/" + theme + "/cards/img7.png";
var img8 = "../images/" + theme + "/cards/img8.png";
var img9 = "../images/" + theme + "/cards/img9.png";
var img10 = "../images/" + theme + "/cards/img10.png";
var img11 = "../images/" + theme + "/cards/img11.png";
var img12 = "../images/" + theme + "/cards/img12.png";
var img13 = "../images/" + theme + "/cards/img13.png";
var img14 = "../images/" + theme + "/cards/img14.png";
var img15 = "../images/" + theme + "/cards/img15.png";

// Image to show unflipped image (original back of card)
var imgBck = "../images/" + theme + "/icons/back.png";

// Images to show that a card was removed (one for AI and one for User)
var imgRmAI = "../images/" + theme + "/icons/empty2.png";
var imgRmUs = "../images/" + theme + "/icons/empty.png";
var imgRm = "../images/" + theme + "/icons/empty.png";

// images: Stores all pairs (15 pairs -> 30 elements total)
var images = [img1, img1, img2, img2, img3, img3, img4, img4, img5, img5, 
			img6, img6, img7, img7, img8, img8, img9, img9, img10, img10, 
			img11, img11, img12, img12, img13, img13, img14, img14, img15, 
			img15];

// positions: Stores all positions for the number of cards
var positions = ['pos1', 'pos2', 'pos3', 'pos4', 'pos5', 'pos6', 'pos7',
				'pos8', 'pos9', 'pos10', 'pos11', 'pos12', 'pos13', 'pos14',
				'pos15', 'pos16', 'pos17', 'pos18', 'pos19', 'pos20', 'pos21',
				'pos22', 'pos23', 'pos24', 'pos25', 'pos26', 'pos27', 'pos28',
				'pos29', 'pos30'];

var numOfCards = images.length // number of pairs * 2 (total cards)

// - - - - - - - - - - - AI Global Variables - - - - - - - - - - - - 

var aiImgPos; // Image that AI flips 									// Renaming Pointer *
var secondCardPos; // Second card that AI flips because it has info of it
var randNum; // Random number for random flip when there is not enough info
var imageOnTurn; // First AI image flipped on turn
var posOnTurn; // First AI position flipped on turn

var autoImgTemp = []; // + new flipped image if isn't yet on auto selection
var autoPosTemp = []; // + new flipped position if isn't yet on auto selection
var autoImgSelection = []; // Ready image pairs for automatic selection 
var autoPosSelection = []; // Ready position pairs for automatic selection
var autoImgSelectionTemp = []; // To remove flipped images from auto selection
var autoPosSelectionTemp = []; // To remove flipped positions from auto selctn

var autoImg1; // Automatic first image selection
var autoImgPos1; // Automatic first position selection
var autoImg2; // Automatic second image selection
var autoImgPos2; // Automatic second position selection

// - - - - - - - - - Shuffle and general init info - - - - - - - - - - - -

// Shuffling images
var temRand = [];
while (temRand.length != numOfCards) {
	var n = Math.floor(Math.random() * numOfCards);
	if (!temRand.includes(n)) {
		temRand.push(n);
		shuffledImages.push(images[n]);
	}
}

// Creates and initializes shuffledCards with shuffled images
for (var a = 0; a < numOfCards; a++) {
	shuffledCards[positions[a]] = shuffledImages[a];
}

// To dispaly modal at game over
var gameOverModal = document.getElementById('game_over_modal');
gameOverModal.style.display = "none";


/**
 * Highlights user to show it's its turn
 */
function highlightUser() {
	document.getElementById('turn_user').style.backgroundColor = "#FCFE78";
	document.getElementById('turn_ai').style.backgroundColor = "#42B8C2"; 
}

/**
 * Highlights AI to show it's its turn
 */
function highlightAI() {
	document.getElementById('turn_ai').style.backgroundColor = "#FCFE78";
	document.getElementById('turn_user').style.backgroundColor = "#42B8C2";
}

// - - - - - - - Functions before the game starts - - - - - - - -

/**
 * Displays startGameModal which shows a message that asks the user who wants
 * to begin flipping first the 'User' or 'AI'. User has to press either button
 * that says 'User' or 'AI'. This button begins the game setting the value of 
 * 'UserFirst' or 'AIFirst' to 'flipsFirst'.
 */
function startingGameModal(playerFlipsFirst) {
	var startGameModal = document.getElementById('start_game_modal');
	if(playerFlipsFirst == "user") {
		highlightUser();
		turnUser = true;
		canUserFlip = true;
		turnAI = false;
	}
	else {
		highlightAI();
		turnUser = false;
		canUserFlip = false;
		turnAI = true;
		setTimeout(AIflips, 600);
	}
	startGameModal.style.display = "none";
}

// - - - - - - - - - - User Functions - - - - - - - - - - - -

/**
 * Called when user clicks a card.
 * Checks if it's user's turn and if the user can flip. If so, calls userFlips.
 * @param {string} [posID] position id that user clicked.
 */
function userClicksImage(posID) {
	areThereCards();
	if(turnUser && canUserFlip) {
		userFlips(posID);
	}
}

/**
 * User's chosen cards are flipped.
 * Checks if chosen cards are not removed, and if user is not selecting
 * the same card on the same turn twice. If so, stores flipped cards on
 * flippedCards, and stores flipped positions and images on flippedPositions
 * and flippedImages relatively. Calls AIAutoMemory to store automatic 
 * selection information, and calls checkForPairs to check if chosen cards
 * are a pair.
 * @param {string} [posID] position id that user clicked.
 * posID -> position
 * shuffledCards[posID] -> image
 */
function userFlips(posID) {
	if (!onTurnPositions.includes(posID) && 
		!removedPositions.includes(posID)) {
		var userImgPos = document.getElementById(posID);
		onTurnPositions.push(posID);
		flippedCards[posID] = userImgPos;
		onTrunChosenImage.push(shuffledCards[posID]);
		flippedPositions.push(posID);
		flippedImages.push(shuffledCards[posID]);
		AIAutoMemory(posID, shuffledCards[posID]);
		userImgPos.src = shuffledCards[posID]; 
		onTurnChosenPosition[numOfFlips] = userImgPos;
		numOfFlips += 1;
		if (numOfFlips == 2) {
			canUserFlip = false;
			setTimeout(highlightAI, 1000);
			checkForPairs('user');
		}
	}	
}

// - - - - - - - - - - - - AI Functions - - - - - - - - - - - - - - - - - -

/**
 * Checks if there are any pairs information in automatic selection arrays.
 * If so, it calls autoSelection. Otherwise, it calls randomOrByMemory.
 */
function AIflips() {
	flippedCardsLength = Object.keys(flippedCards).length;
	if (autoPosSelection.length != 0) {
		autoSelection();
	}
	else {
		randomOrByMemory();
	}
}

/**
 * AI flips two cards as automatic selection (from autoPosSelection).
 * Checks if autoPosSelection elements are not being removed to flip them,
 * and calls checkForPairs (although we know it's an auto selected pair).
*/
function autoSelection() {
	if (!removedPositions.includes(autoPosSelection[0]) && 
		!removedPositions.includes(autoPosSelection[1])) {
			var n = autoPosSelection.length - 1;
			var autoImgPos1 = document.getElementById(autoPosSelection[n]);
			onTurnPositions.push(autoPosSelection[n]);
			flippedCards[autoPosSelection[n]] = autoImgPos1;
			onTrunChosenImage.push(shuffledCards[autoPosSelection[n]]);
			flippedPositions.push(autoPosSelection[n]);
			flippedImages.push(shuffledCards[autoPosSelection[n]]);
			autoImgPos1.src = shuffledCards[autoPosSelection[n]];
			onTurnChosenPosition[0] = autoImgPos1;
			var autoImgPos2 = document.getElementById(autoPosSelection[n-1]);
			onTurnPositions.push(autoPosSelection[n-1]);
			flippedCards[autoPosSelection[n-1]] = autoImgPos2;
			onTrunChosenImage.push(shuffledCards[autoPosSelection[n-1]]);
			flippedPositions.push(autoPosSelection[n-1]);
			flippedImages.push(shuffledCards[autoPosSelection[n-1]]);
			autoImgPos2.src = shuffledCards[autoPosSelection[n-1]];
			onTurnChosenPosition[1] = autoImgPos2;
			checkForPairs('ai');
	}
}

/**
 * Stores information to arrange pairs for autoPosSelection. autoImgTemp and
 * autoPosTemp store cards that are being flipped, once there is a pair, they
 * will be stored in autoImgSelection, and autoPosSelection. Therefore, 
 * autoPosSelection and autoImgSelection will have the pairs in order.
 * @param {string} [pos] card image position
 * @param {image file path} [img] card image
*/
function AIAutoMemory(pos, img) {
	if (!autoImgTemp.includes(img) && 
		!removedPositions.includes(pos)) {
		autoImgTemp.push(img);
		autoPosTemp.push(pos);
	}
	else if (autoImgTemp.includes(img) && !autoPosTemp.includes(pos) && 
		!removedPositions.includes(pos)) {
		autoImg1 = autoImgTemp.indexOf(img);
		autoImgPos1 = autoPosTemp[autoImg1];
		autoImg2 = img;
		autoImgPos2 = pos;
		autoImgSelection.push(autoImg1); 
		autoPosSelection.push(autoImgPos1);
		autoImgSelection.push(img);
		autoPosSelection.push(pos);
		autoImgTemp.push(img);
		autoPosTemp.push(pos);
	}
}

/**
 * Randomly selects the first card to flip, then on flippedCards checks
 * if its pair has been flipped before. If so, it flips its pair as its 
 * second card. Otherwise, (if not in flippedCards) it randomly selects
 * a card as its second card.
 */
function randomOrByMemory() {
	var findRandomCard1 = true;
	var findingCard2 = true;
	var findRandomCard2 = true;

	flippedCardsLength = Object.keys(flippedCards).length;

	while(findRandomCard1 == true) {
		randNum = Math.floor(Math.random() * numOfCards);
		if (!onTurnPositions.includes(positions[randNum]) &&
			!removedPositions.includes(positions[randNum])) {
			if (flippedPositions.includes(positions[randNum])) {
				if (flippedCardsLength >= numOfCards) {
					findRandomCard1 = false; 
					getImage();
					flippedCardsLength = Object.keys(flippedCards).length;
					imageOnTurn = shuffledCards[positions[randNum]];
					posOnTurn = positions[randNum];
				}
				else {
					findRandomCard1 == true;
				}
			}
			else {
				findRandomCard1 = false; 
				getImage();
				flippedCardsLength = Object.keys(flippedCards).length;
				imageOnTurn = shuffledCards[positions[randNum]];
				posOnTurn = positions[randNum];
			}
		}
	}

	// finds if the pair of this image was flipped before, and flips it.
	if (findingCard2 == true) {
		for (var i = 0; i < flippedCardsLength; i++) {
			if (imageOnTurn == flippedImages[i] 
				&& posOnTurn != flippedPositions[i]) {
				secondCardPos = flippedPositions[i];
				aiImgPos = flippedImages[i];
				aiImgPos = document.getElementById(secondCardPos);
				onTurnPositions.push(secondCardPos);
				flippedCards[secondCardPos] = aiImgPos;
				onTrunChosenImage.push(shuffledCards[secondCardPos]);
				AIAutoMemory(secondCardPos, shuffledCards[secondCardPos]);
				aiImgPos.src = shuffledCards[secondCardPos];
				onTurnChosenPosition[numOfFlips] = aiImgPos;
				numOfFlips += 1;
				findingCard2 = false;
				break;
			}
		}
	}

	// randomly selects second card if its pair was not found on flippedCards
	if (findingCard2 == true) {
		while(findRandomCard2) {
			randNum = Math.floor(Math.random() * numOfCards);
			if (!onTurnPositions.includes(positions[randNum]) &&
			!removedPositions.includes(positions[randNum])) {
				if (flippedPositions.includes(positions[randNum])) {
					if (flippedCardsLength >= numOfCards) {
						findRandomCard2 = false;
						getImage();
					}
					else {
						findRandomCard2 == true;
					}
				} 
				else {
					findRandomCard2 = false;
					getImage();
				}
			}
		}
	}
	setTimeout(highlightUser, 1000);
	checkForPairs('ai');
}

/**
 * Randomly selects a card. Used in randomOrByMemory multiple times.
 */
function getImage() {
	aiImgPos = document.getElementById(positions[randNum]);
	onTurnPositions.push(positions[randNum]);
	flippedCards[positions[randNum]] = aiImgPos;
	flippedPositions.push(positions[randNum]); 
	flippedImages.push(shuffledCards[positions[randNum]]); 
	AIAutoMemory(positions[randNum], shuffledCards[positions[randNum]]); 
	onTrunChosenImage.push(shuffledCards[positions[randNum]]);
	aiImgPos.src = shuffledCards[positions[randNum]]; 
	onTurnChosenPosition[numOfFlips] = aiImgPos;
	numOfFlips += 1;
}

/**
 * "Removes" flipped cards from autoPosSelection and autoImgSelection this way:
 * autoPosSelection, and autoImageSelection are copied to autoPosSelectionTemp,
 * and autoPosSelectionTemp respectively. Then, cards of autoSelection that are
 * not being flipped are pushed to autoPosSelection and autoImgSelection, thus
 * leaving only non flipped cards to auto select.
 * @param {String} [card1] index of first card to be removed
 * @param {String} [card2] index of second card to be removed
 */
function updateAutoSelection(card1, card2) {
	autoPosSelectionTemp = autoPosSelection;
	autoImgSelectionTemp = autoImgSelection;
	autoPosSelection = [];
	autoImgSelection = [];
	for (var i = 0; i < autoPosSelectionTemp.length; i++) {
		if (autoPosSelectionTemp[i] != card1 
			&& autoPosSelectionTemp[i] != card2) {
			autoPosSelection.push(autoPosSelectionTemp[i]);
			autoImgSelection.push(autoImgSelectionTemp[i]);
		}
	}
}

// - - - - - - - - - - - User and AI Functions - - - - - - - - - - - - - - -

/**
 * Checks if the two cards chosen by player per turn are a pair. If they are
 * a pair, updateAutoSelection is called, player's score is increased by one,
 * score is updated on html file, and pair is removed (by calling removeImage)
 * Otherwise, if not a pair, they are unflipped (by calling unflipImage).
*/
function checkForPairs(player) {
	if (onTrunChosenImage[0] == onTrunChosenImage[1]) {
		updateAutoSelection(onTurnPositions[0], onTurnPositions[1]);
		if (player == 'ai') {
			scoreAI += 1;
			document.getElementById('score_ai').innerHTML = scoreAI;
			turnAI = true; 
			setTimeout(highlightAI, 1000);
			imgRm = imgRmAI;
		}
		if (player == 'user') {
			scoreUser += 1;
			document.getElementById('score_user').innerHTML = scoreUser;
			turnUser = true;
			canUserFlip = false;
			setTimeout(highlightUser, 1000);
			turnAI = false;
			imgRm = imgRmUs;
		}
		removedPositions.push(onTurnPositions[0]);
		removedPositions.push(onTurnPositions[1]);
		setTimeout(removeImage, 1000);
	}
	else {
		turnUser = !turnUser;
		turnAI = !turnAI;
		setTimeout(unflipImage, 1000);
	}
	onTrunChosenImage = [];
}

/**
 * Sets a picture to the two positions where the pair was found to show that
 * that positions are "removed" (no longer available to flip). The image
 * shows what player found that pair ('AI' or 'User').
 */
function removeImage() {
	onTurnPositions = [];
	onTurnChosenPosition[0].src = imgRm;
	onTurnChosenPosition[1].src = imgRm;
	numOfFlips = 0;
	onTurnChosenPosition = [];
	areThereCards();
	if (turnAI) { 
		AIflips();
	}
	else {
		setTimeout(highlightUser, 1000);
		canUserFlip = true;
	}
}

/**
 * Sets a picture to the two positions that were flipped to show that the 
 * cards were not found, and are again available to flip in future turns.
 * The image shows the back of the card (original unflipped card).
 */
function unflipImage() {
	onTurnPositions = [];
	onTurnChosenPosition[0].src = imgBck;
	onTurnChosenPosition[1].src = imgBck;
	numOfFlips = 0;
	onTurnChosenPosition = [];
	areThereCards();
	if (turnAI) {
		AIflips();
	}
	else {
		setTimeout(highlightUser, 1000);
		canUserFlip = true;
	}
}

/**
 * Checks if there are no more cards to flip (if the number of removed cards
 * is the same as the number of total cards, then all cards have been removed,
 * and there are not any more available cards to flip. If so, calls gameOver).
 */
function areThereCards() {
	if (removedPositions.length == numOfCards) {
		gameOver();
	}
}

 // - - - - - - - Functions for What to do when game is over? - - - - - - - -

/**
 * Sets turnUser and turnAI to false. Dispays gameOverModal in html file to
 * show final score and a message saying if user won or lost.
 */
function gameOver() {
	turnUser = false;
	turnAI = false;
	document.getElementById('turn_ai').style.backgroundColor = "#42B8C2";
	document.getElementById('turn_user').style.backgroundColor = "#42B8C2";
	updateGameOverModal();
}

/**
 * Displays gameOverModal which shows a message that says either "You Lost"
 * or "You Won", the final score, an image of the theme, and two buttons
 * for either "Play Again", or "Home". User has to press one of those 
 * buttons or quit the page.
 */
function updateGameOverModal() {
	var winnerMsg;
	var gameOverModal = document.getElementById('end_game_modal');
	gameOverModal.style.display = "block";
	document.getElementById('final_score_ai').innerHTML = scoreAI;
	document.getElementById('final_score_user').innerHTML = scoreUser;
	if (scoreAI > scoreUser){
		winnerMsg = "You Lost!";
	}
	else {
		winnerMsg = "You Won!";
	}
	document.getElementById('end_lettering_txt').innerHTML = winnerMsg;
}

