import Document from "./Doc.js";
import Timer from "./Timer.js";

export default class Game {
  /**
   * These are the states that the game is currently in.
   * @type {{IN_TRANSITION: number, IN_PROGRESS: number, PAUSED: number, FINISHED: number}}
   */
  State = {
    IN_TRANSITION: 0,
    IN_PROGRESS: 1,
    PAUSED: 2,
    FINISHED: 3,
    WAITING_TO_START: 4,
  };

  /**
   * Playes score list
   * @property
   */
  playerList = JSON.parse(localStorage.getItem("players") || "[]")

  /**
   * User's accuracy
   * @property
   * @type {int}
   */
  userAccuracy;
  /**
   * User's Word per minute
   * @property
   * @type {int}
   */
  userWPM


  /**
   * Game's time limit
   * @property
   * @type {int}
   */
  timeLimit = 60;
  /**
   * Game's Timer
   * @property
   * @type {Timer}
   */
  gameTimer;

  /**
   * @type {Game.State}
   * @property
   */
  state;

  /**
   * Holds the document that game will control
   * @type {Document}
   * @property
   */
  doc;

  /**
   * Game Typing content is saved in this property
   * @type {String}
   * @property
   */
  currentContent;
  /**
   * Game Typing content is saved in this property in an array of words
   * @type {array}
   * @property
   */
  currentContentArray;

  /**
   * Character error counter
   * @type {int}
   * @property
   */
  errorCounter;

  /**
   * Game's current character
   * @type {String}
   * @property
   */
  currentWord;
  /**
   * Game's current word
   * @type {int}
   * @property
   */
  wordCounter = 0
  /**
   * Game's current character
   * @type {String}
   * @property'
   */
  currentCharacter
  /**
   * Game's character counter
   * @type {int}
   * @property'
   */
  characterCounter= 0;

  /**
   * Number of characters that were typed wrong
   * @type {int}
   * @property
   */
  wrongCharacterCounter= 0;
  /**
   * Number of characters that were typed right
   * @type {int}
   * @property
   */
  rightCharacterCounter = 0;

  /**
   * This event triggers on state change
   * @type {Event}
   */
  stateChangeEvent = new Event('stateChange');

  /**
   * Holds the player's Email
   * @type {string}
   * @property
   */
  player;


  /**
   * changes the state of the game
   * sets the document
   * initializes the game
   * @constructor
   * @param {Document} Document
   */
  constructor(Document) {
    // changing state of the game
    this.state = this.State.WAITING_TO_START;

    // setting the input field
    this.doc = Document;

    // Setting game content
    this.currentContent = "The bikers rode down the long and narrow path to reach the city park. When they reached a good spot to rest, they began to look for signs of spring. The sun was bright, and a lot of bright red and blue blooms proved to all that warm spring days were the very best. Spring rides were planned. They had a burger at the lake and then rode farther up the mountain. As one rider started to get off his bike, he slipped and fell. One of the other bikers saw him fall but could do nothing to help him. Neither the boy nor the bike got hurt. After a brief stop, everyone was ready to go on. All the bikers enjoyed the nice view when they came to the top. All the roads far below them looked like ribbons. A dozen or so boats could be seen on the lake. It was very quiet and peaceful and no one wished to leave. As they set out on their return, they all enjoyed the ease of pedaling. The bikers came upon a new bike trail. This route led to scenery far grander than that seen from the normal path. The end of the day brought laughs and cheers from everyone. The fact that each person was very, very tired did not keep anyone from eagerly planning for the exciting ride to come.";

    // Games content as an array of characters
    this.currentContentArray = this.currentContent.split(/[ ,.]+/);

    // Saving users Emaol
    this.player = window.prompt("Please enter your Email");

    // game init
    this.initGame();

    // error counter initialization
    this.errorCounter = 0;
  }

  /**
   * initializes the game with adding event listeners to input field
   * and then the input field can track the changes in user behaviour and do what is needed
   * @method
   */
  initGame() {
    // Input Element Event Listeners
    this.doc.inputElement.addEventListener(
      "focusin",
      this.inputFocusInListener.bind(this)
    );
    this.doc.inputElement.addEventListener(
      "focusout",
      this.inputFocusOutListener.bind(this)
    );
    // End of input Element event listeners


    // Document event listener
    this.doc.inputElement.addEventListener(
        "keyup",
        (event) => this.typeHandler(event)
    )

    // Track the game
    this.gameTimer = new Timer(this.timeLimit, this.doc.timerElement);
    this.gameTimer.trackGame(this, ()=>{
      this.stateToFinished();
      this.saveData();
    })

    // Setting page content
    this.setGameContent();
  }

  setGameContent() {
    this.doc.setContent(this.currentContent);

    // Setting games current word
    this.currentWord = this.currentContentArray[this.characterCounter];
    // Setting games current character
    this.currentCharacter = this.currentWord.charAt(this.characterCounter)

    // Setting target key
    this.doc.newTarget(this.currentWord.charAt(this.characterCounter));

    // Setting Words that need to be typed
    this.doc.updateWord(this.wordCounter)
  }

  /**
   * Handles typing in the game
   * everytime the event fires, it will check the key that has fired the event and if it was related to typing the given text
   * it will handle the key
   * @method
   * @param {Event, KeyboardEvent} event
   */
  typeHandler(event) {

    if (this.state === this.State.IN_PROGRESS)
    {
      const keyPressedId = event.key.toUpperCase()

      const highlightedKey = document.querySelector(".selected");

      // check to see if the pressed key is not space
      if (keyPressedId !== " ")
      {
        this.doc.hit(keyPressedId)

        if (keyPressedId === highlightedKey.id) {
          // Updating game's chosen character
          this.updateChar()

          // Update right Character counter
          this.rightCharacterCounter++;

        } else {

          // Wrong key effect
          this.doc.wrongKey(keyPressedId);

          // Wrong ket Actions
          this.wrongKey();
        }

        // Updates the scoreboard after each right choice
        this.updateScoreBoard();

      }
    }else
    {
      this.doc.emptyInput();
    }
  }

  /**
   * User has pressed the wrong key
   */
  wrongKey() {
    // Adds to error made
    this.errorCounter++;
    this.doc.errorsElement.innerText = `${this.errorCounter}`;
  }

  /**
   * Updates the game if user has clicked the right key
   * @method
   */
  updateChar() {

    // Checks to see if word is done
    if (this.nextCharacter() !== "") {
      // Not done
      this.doc.newTarget(this.nextCharacter());
      this.characterCounter++;
      this.currentCharacter = this.currentWord.charAt(this.characterCounter);
    } else{
      // Done
      this.characterCounter = 0;

      // This will also update the Current word property
      this.updateWord();
      // Resets the current character to the first character in the new word
      this.currentCharacter = this.currentWord.charAt(this.currentCharacter)
      // Adds the target effect to the key
      this.doc.newTarget(this.currentCharacter);
    }
  }

  /**
   * When the word is typed, it will make its display = none and it and update the next words
   */
  updateWord() {
    this.doc.wordTyped(this.wordCounter);

    this.currentWord = this.currentContentArray[++this.wordCounter]

    // Adds the effects to next words in the list
    this.doc.updateWord(this.wordCounter)
  }

  updateScoreBoard() {
    this.userAccuracy = this.rightCharacterCounter * 100 / (this.rightCharacterCounter + this.errorCounter);
    this.userWPM = this.wordCounter;

    // Updates games scoreboard
    this.doc.updateScoreBoard(this.userAccuracy, this.userWPM);
  }

  /**
   * Returns next character
   * @method
   * @return {String}
   */
  nextCharacter() {
      return this.currentWord.charAt(this.characterCounter + 1)
  }
  /**
   * Returns next word
   * @method
   * @return {String}
   */
  nextWord(){
    return this.currentContentArray.at(this.wordCounter + 1)
  }

  /**
   * Will listen for focusin
   * Checks state of the game and will resume the game if its paused and starts the game if its not
   * @method
   */
  inputFocusInListener() {
    if (this.state !== this.State.IN_TRANSITION)
      this.state === this.State.PAUSED
        ? this.resume()
        : this.start();
  }

  /**
   * Will track the focusout event and pauses the game if it is playing
   * if the game has ended this will do nothing
   * @method
   */
  inputFocusOutListener() {
    if (this.state !== this.State.IN_TRANSITION)
      this.pause();
  }

  /**
   * Resumes the game
   * @method
   */
  resume() {
    let timer = new Timer(3, this.doc.pageGuideElement);

    this.doc.pageGuideDescription("Wait for it!")

    // This will ensure that game wont try to do anything while going through a transition
    this.stateToWaitingToStart();

    timer.start().then(()=>{
      this.doc.resumeGame();
      this.stateToInProgress();
    });
  }

  /**
   * Start the game
   * @method
   */
  start() {
    let timer = new Timer(3, this.doc.pageGuideElement);

    this.doc.pageGuideDescription("Wait for it!")

    // This will ensure that game wont try to do anything while going through a transition
    this.stateToWaitingToStart();

    timer.start().then(()=>{
      this.doc.gameInit();
      this.stateToInProgress();
    });
  }

  /**
   * Will pause the game
   * @method
   */
  pause() {
    this.stateToPaused();

    this.doc.pauseGame();
  }

  /**
   * changes state of the game to in progress the game
   * @method
   */
  stateToInProgress() {  
    this.state = this.State.IN_PROGRESS;
    this.dispatchEvent();
  }

  /**
   * changes state of the game to paused
   * @method
   */
  stateToPaused() {
    this.state = this.State.PAUSED;
    this.dispatchEvent();
  }

  /**
   * changes state of the game to finished
   * @method
   */
  stateToFinished() {
    this.state = this.State.FINISHED;
    this.dispatchEvent();
  }

  /**
   * changes state of the game to waiting to start
   * @method
   */
  stateToWaitingToStart() {
    this.state = this.State.IN_TRANSITION;
    this.dispatchEvent();
  }

  /**
   * Notify listeners when the state changes
   * @method
   */
  dispatchEvent() {
    // Dispatch the custom event
    document.dispatchEvent(this.stateChangeEvent);
  }


  /**
   * Add a listener for state changes
   * @method
   * @param {Function} callback - The callback function to be executed when the state changes.
   */
  addStateChangeListener(callback) {
    document.addEventListener('stateChange', callback);
  }

  /**
   * Remove a listener for state changes
   * @method
   * @param {Function} callback - The callback function to be removed.
   */
  removeStateChangeListener(callback) {
    document.removeEventListener('stateChange', callback);
  }

  /**
   * the method will save game's data into browser cache
   * @method
   */
  saveData() {
    let person = {
      Email: this.player,
      WPM: this.userWPM,
      Accuracy: this.userAccuracy
    };

    this.playerList.push(person);
    localStorage.setItem("players", JSON.stringify(this.playerList));
  }

}
