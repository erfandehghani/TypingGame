import Document from "./Doc.js";
import Timer from "./Timer.js";

export default class Game {
  /**
   * These are the states that the game is currently in.
   * @type {{WAITING_TO_START: number, IN_PROGRESS: number, PAUSED: number, FINISHED: number}}
   */
  static State = {
    WAITING_TO_START: 0,
    IN_PROGRESS: 1,
    PAUSED: 2,
    FINISHED: 3,
  };

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
   * changes the state of the game
   * sets the document
   * initializes the game
   * @constructor
   * @param {Document} Document
   */
  constructor(Document) {
    // changing state of the game
    this.state = Game.State.WAITING_TO_START;

    // setting the input field
    this.doc = Document;

    // Setting game content
    this.currentContent = "The bikers rode down the long and narrow path to reach the city park. When they reached a good spot to rest, they began to look for signs of spring. The sun was bright, and a lot of bright red and blue blooms proved to all that warm spring days were the very best. Spring rides were planned. They had a burger at the lake and then rode farther up the mountain. As one rider started to get off his bike, he slipped and fell. One of the other bikers saw him fall but could do nothing to help him. Neither the boy nor the bike got hurt. After a brief stop, everyone was ready to go on. All the bikers enjoyed the nice view when they came to the top. All the roads far below them looked like ribbons. A dozen or so boats could be seen on the lake. It was very quiet and peaceful and no one wished to leave. As they set out on their return, they all enjoyed the ease of pedaling. The bikers came upon a new bike trail. This route led to scenery far grander than that seen from the normal path. The end of the day brought laughs and cheers from everyone. The fact that each person was very, very tired did not keep anyone from eagerly planning for the exciting ride to come.";

    // Games content as an array of characters
    this.currentContentArray = this.currentContent.split(/[ ,.]+/);

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

    // Setting page content
    this.setGameContent();

    // Document event listener
    // Handles typing
    this.doc.inputElement.addEventListener(
        "keypress",
        (event) => this.typeHandler(event)
    )
  }

  setGameContent() {
    this.doc.setContent(this.currentContent);

    // Setting games current word
    this.currentWord = this.currentContentArray[this.characterCounter];
    // Setting games current character
    this.currentCharacter = this.currentWord.charAt(this.characterCounter)

    // Setting target key
    this.doc.newTarget(this.currentWord.charAt(this.characterCounter));
  }

  /**
   * Handles typing in the game
   * everytime the event fires, it will check the key that has fired the event and if it was related to typing the given text
   * it will handle the key
   * @method
   * @param {Event, KeyboardEvent} event
   */
  typeHandler(event) {

    const keyPressedId = event.key.toUpperCase()

    const highlightedKey = document.querySelector(".selected");

    this.doc.hit(keyPressedId)

    if (keyPressedId === highlightedKey.id) {
      // Updating game's chosen character
      this.updateChar()
    } else {
      const input = document.getElementById("input");
      input.value = "";
      this.errorCounter++;
      this.doc.errorsElement.innerText = `${this.errorCounter}`;
    }
  }

  /**
   * @method
   */
  updateChar() {
    if (this.currentCharacter !== " ") {
      this.doc.newTarget(this.nextCharacter());
      this.characterCounter++;
      this.currentCharacter = this.currentWord.charAt(this.characterCounter);
    } else{
      this.doc.wordTyped(this.wordCounter);
      content.children[counterWord].classList.add("completed"); //better way found:D
      counterChar = 0;
      updateWord(true);
    }
  }

  /**
   * Returns next character
   * @method
   * @return {String}
   */
  nextCharacter() {
    if (this.currentWord.charAt(this.characterCounter + 1) === '')
      return this.nextWord().charAt(0);
    else
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
    this.state === Game.State.PAUSED
      ? this.resume()
      : this.start();

    this.stateToInProgress();
  }

  /**
   * Will track the focusout event and pauses the game if it is playing
   * if the game has ended this will do nothing
   * @method
   */
  inputFocusOutListener() {
    this.pause();
  }

  /**
   * Resumes the game
   * @method
   */
  resume() {
    let timer = new Timer(3, this.doc.pageGuideElement);

    this.doc.pageGuideDescription("Wait for it!")

    timer.start().then(()=>{
      this.doc.resumeGame();
      this.stateToInProgress;
    });
  }

  /**
   * Start the game
   * @method
   */
  start() {
    let timer = new Timer(3, this.doc.pageGuideElement);

    this.doc.pageGuideDescription("Wait for it!")

    timer.start().then(()=>{
      this.doc.gameInit();
      this.stateToInProgress;
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
    this.state = Game.State.IN_PROGRESS;
  }

  /**
   * changes state of the game to paused
   * @method
   */
  stateToPaused() {
    this.state = Game.State.PAUSED;
  }

  /**
   * changes state of the game to finished
   * @method
   */
  stateToFinished() {
    this.state = Game.State.FINISHED;
  }

  /**
   * changes state of the game to waiting to start
   * @method
   */
  stateToWaitingToStart() {
    this.state = Game.State.WAITING_TO_START;
  }
}
