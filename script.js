class TravelLocation {
  // location, index in the array
  // branches = North, East, South, West
  // x = location index to arrive to, there are no limitations, teleportation is possible
  // -1 = can't travel that direction

  // blockMessage
  // Message to print if movement is not allowed

  // items = items on the location
  // onEnter = functions to run when entering the location

  constructor(name, location, image, branches, blockMessage) {
    this.name = name;
    this.location = location;
    this.image = image;
    this.branches = branches;
    this.blockMessage = blockMessage;
    this.items = [];
    this.onEnter = [];
    this.gamestate = 0;
  }

  travelTo(dirIndex) {
    return this.branches[dirIndex];
  }

  enter() {
    for (let i = 0; i < this.onEnter.length; i++) {
      let result = this.onEnter[i]();
      if (result == -1) {
        console.log("onEnter terminated");
        return;
      }
    }
  }
}
const locations = [
  // Top row
  new TravelLocation(
    "Old tower",
    0,
    "torni.jpg",
    [-1, 1, 3, -1],
    "The path is too dangerous"
  ),
  new TravelLocation(
    "Deep well",
    1,
    "kaivo.jpg",
    [-1, 2, 4, 0],
    "Mystical force prevents you from moving that direction."
  ),
  new TravelLocation(
    "Sunny meadow",
    2,
    "aukio.jpg",
    [-1, -1, 5, 1],
    "Dense bushes block your path."
  ),
  // MiddleRow
  new TravelLocation(
    "Angry dragon",
    3,
    "dragon.jpg",
    [0, 4, 6, -1],
    "You can't pass the dragon."
  ),
  new TravelLocation("Narrow forest path", 4, "polku.jpg", [1, 5, 7, 3]),
  new TravelLocation(
    "Old gate",
    5,
    "portti.jpg",
    [2, -1, 8, 4],
    "The Gate is locked."
  ),
  //Bottom Row
  new TravelLocation(
    "River bank",
    6,
    "joki.jpg",
    [3, 7, -1, -1],
    "The river is too wide to cross."
  ),
  new TravelLocation(
    "Empty bench",
    7,
    "penkki_karkotin.jpg",
    [4, 8, -1, 6],
    "The forest is too dense to pass."
  ),
  new TravelLocation(
    "Old cottage, you can hear music from the inside",
    8,
    "mokki.jpg",
    [5, -1, -1, 7],
    "You are too scared to move that direction-"
  ),

  // New area
  new TravelLocation(
    "<s>Dragon's</s> Rabbits treasure",
    9,
    "treasure.jpg",
    [-1, -1, -1, -1], // trapped for now
    "You realize you can't escape, luckily the rabbit left lots of carrots behind<br>(You won the game)"
  ),
];

class Player {
  constructor(location, items) {
    this.location = location;
    this.items = items;
    this.gamestate = 0;
  }
}

const player = new Player(4, []);

const allItems = [];
class Item {
  constructor(name, onPickup, onUse, onDrop) {
    this.name = name;
    this.onPickup = onPickup;
    this.onUse = onUse;
    this.onDrop = onDrop;
  }

  pickup() {
    for (let i = 0; i < this.onPickup.length; i++) {
      let result = this.onPickup[i]();
      // used to terminate conditional activations
      if (result == -1) {
        console.log("Item pickup terminated");
        return;
      }
    }
    console.log("Item finished pickup");
  }

  activate() {
    for (let i = 0; i < this.onUse.length; i++) {
      let result = this.onUse[i]();
      // used to terminate conditional activations
      if (result == -1) {
        console.log("Item activation terminated");
        return;
      }
    }
    console.log("Item finished activating");
  }

  drop() {
    for (let i = 0; i < this.onDrop.length; i++) {
      let result = this.onDrop[i]();
      // used to terminate conditional activations
      if (result == -1) {
        console.log("Item drop terminated");
        return;
      }
    }
    console.log("Item finished dropping");
  }
}

// Spawns item at location/Inventory
function spawnItem(object, item, message) {
  if (object == "currentLocation") {
    object = currentLocation;
  }
  for (let i = 0; i < allItems.length; i++) {
    if (allItems[i].name == item) {
      object.items.push(allItems[i]);
      if (message) gameMessage = message;
      break;
    }
  }
}

// Checks if objects location,item,or state matches the requirements
// returns -1 if any condition is not met
function conditionalTerminate(
  object,
  locationRequirement,
  itemRequirement,
  stateRequirement,
  message
) {
  if (object == "currentLocation") {
    object = currentLocation;
  }
  if (locationRequirement != -1) {
    console.log("Item has location requirement");
    if (object.location != locationRequirement) {
      console.log("Location requirement not met");
      if (message) gameMessage = message;
      return -1;
    }
  }
  if (itemRequirement != -1) {
    var found = false;
    for (let i = 0; i < object.items.length; i++) {
      if (object.items[i].name == itemRequirement) found = true;
    }
    if (!found) {
      console.log("Item requirement not met");
      if (message) gameMessage = message;
      return -1;
    }
  }
  if (stateRequirement != -1) {
    if (object.gamestate != stateRequirement) {
      console.log("State requirement not met");
      if (message) gameMessage = message;
      return -1;
    }
  }
  return 1;
}

// Removes item
// Can be player or location
function removeItem(object, item, message) {
  if (object == "currentLocation") {
    object = currentLocation;
  }
  for (let i = 0; i < object.items.length; i++) {
    if (object.items[i].name == item) {
      object.items.splice(i, 1);
      if (message) gameMessage = message;
      break;
    }
  }
}

function conditionalMessage(object, locs, messages, cancel) {
  if (object == "currentLocation") {
    object = currentLocation;
  }
  for (let i = 0; i < locs.length; i++) {
    if (object.location == locs[i]) {
      console.log("conditional message triggered, ", locs[i], messages[i]);
      gameMessage = messages[i];
      if (cancel) {
        console.log("aborting on conditional msg fail");
        return -1;
      }
    }
  }
}

function setAttribute(object, attribute, value) {
  if (object == "currentLocation") {
    object = currentLocation;
  }
  object[attribute] = value;
  if (attribute == "image") {
    console.log("force refresh");
    render();
  }
}

flute = new Item(
  "flute",
  [
    removeItem.bind(null, "currentLocation", "flute"),
    spawnItem.bind(null, player, "flute", "You picked up flute."),
  ],
  [
    conditionalTerminate.bind(
      null,
      "currentLocation",
      8,
      -1,
      -1,
      "Beautiful music fills the air."
    ),
    removeItem.bind(null, player, "flute"),
    spawnItem.bind(null, "currentLocation", "sword", "sword appears."),
  ],
  [
    removeItem.bind(null, player, "flute"),
    spawnItem.bind(null, "currentLocation", "flute", "You dropped the flute."),
  ]
);
rock = new Item(
  "rock",
  [
    removeItem.bind(null, "currentLocation", "rock"),
    spawnItem.bind(null, player, "rock", "You picked up the rock."),
  ],
  [
    conditionalTerminate.bind(
      null,
      player,
      999,
      -1,
      -1,
      "You roll the rock in your pocket."
    ),
  ],
  [
    removeItem.bind(null, player, "rock"),
    spawnItem.bind(null, "currentLocation", "rock", "You dropped the rock."),
    conditionalTerminate.bind(null, "currentLocation", 1, -1, -1), // Stop if not at the well
    spawnItem.bind(
      null,
      "currentLocation",
      "flute",
      "You dropped the rock into the well."
    ),
    removeItem.bind(null, "currentLocation", "rock"),
  ]
);
sword = new Item(
  "sword",
  [
    removeItem.bind(null, "currentLocation", "sword"),
    spawnItem.bind(null, player, "sword", "You picked up a sword."),
  ],
  [
    conditionalMessage.bind(
      null,
      "currentLocation",
      [3],
      ["You can't reach the dragon"],
      true
    ), // sword used at the dragon
    conditionalTerminate.bind(
      null,
      "currentLocation",
      2,
      -1,
      -1,
      "You wave your sword in boredom."
    ), // sword used anwywhere but forest
    removeItem.bind(
      null,
      player,
      "sword",
      "You dig out a wild carrot, but broke your sword."
    ), // sword used at the forest
    spawnItem.bind(null, player, "carrot"),
  ],
  [
    removeItem.bind(null, player, "sword"),
    spawnItem.bind(null, "currentLocation", "sword", "You dropped the sword."),
  ]
);
dummyKarkotin = new Item(
  "rabbit repellent",
  [
    removeItem.bind(null, "currentLocation", "rabbit repellent"),
    spawnItem.bind(
      null,
      player,
      "repellent",
      "You picked up the  rabbit repellent."
    ),
    conditionalTerminate.bind(null, "currentLocation", 7, -1, -1),
    setAttribute.bind(null, "currentLocation", "image", "penkki.jpg"),
  ],
  [], // Spawns another item, therefore no use
  [] // Spawns another item, therefore no drop
);
avain = new Item(
  "key",
  [
    removeItem.bind(null, "currentLocation", "key"),
    spawnItem.bind(null, player, "key", "You pickedup the key."),
  ],
  [
    conditionalTerminate.bind(
      null,
      "currentLocation",
      5,
      -1,
      -1,
      "You can't use the key here."
    ),
    removeItem.bind(null, player, "key", "You open the gate with the key."),
    setAttribute.bind(null, "currentLocation", "branches", [2, 9, 8, 4]),
  ],
  [
    spawnItem.bind(null, "currentLocation", "key"),
    removeItem.bind(null, player, "key", "You dropped the key."),
  ]
);
karkotin = new Item(
  "repellent",
  [], // Spawns another item on drop, therefore no pickup
  [
    conditionalTerminate.bind(
      null,
      "currentLocation",
      3,
      -1,
      -1,
      "You don't see any rabbits"
    ), // Wrong place
    conditionalTerminate.bind(
      null,
      "currentLocation",
      -1,
      -1,
      1,
      "The dragon is too far away"
    ), // Wrong state
    removeItem.bind(null, player, "repellent", ""), // Checks passed, succesful use
    setAttribute.bind(null, "currentLocation", "gamestate", 2),
    setAttribute.bind(null, "currentLocation", "name", "Empty road"),
    spawnItem.bind(
      null,
      "currentLocation",
      "key",
      "The dragon ran away, it was actually a rabbit transformed into a dragon by magic<br>The rabbit left a key behind"
    ),
    setAttribute.bind(null, "currentLocation", "image", "no_dragon.jpg"),
  ],
  [
    spawnItem.bind(null, "currentLocation", "bunny repellent"),
    removeItem.bind(null, player, "repellent"),
    conditionalTerminate.bind(null, "currentLocation", 7, -1, -1),
    setAttribute.bind(null, "currentLocation", "image", "penkki_karkotin.jpg"),
  ]
);
carrot = new Item(
  "carrot",
  [
    removeItem.bind(null, "currentLocation", "carrot"),
    spawnItem.bind(null, player, "carrot", "You picked up carrot."),
  ],
  [
    conditionalTerminate.bind(
      null,
      "currentLocation",
      999,
      -1,
      -1,
      "You are not hungry."
    ),
  ],
  [
    removeItem.bind(null, player, "carrot"),
    spawnItem.bind(
      null,
      "currentLocation",
      "carrot",
      "You dropped the carrot."
    ),
  ]
);
// Dragon eats carrot if on ground and left alone
locations[3].onEnter.push(
  conditionalTerminate.bind(null, "currentLocation", -1, "carrot", -1),
  removeItem.bind(
    null,
    "currentLocation",
    "carrot",
    "Dragon is eating the carrot."
  ),
  setAttribute.bind(null, "currentLocation", "gamestate", 1),
  setAttribute.bind(null, "currentLocation", "image", "dragon_ground.jpg"),
  setAttribute.bind(null, "currentLocation", "name", "Hungry dragon")
);

//player.items.push(rock);
//player.items.push(flute);
//player.items.push(sword);
//player.items.push(karkotin);
//player.items.push(carrot);
//player.items.push(avain);

locations[6].items.push(rock);
locations[7].items.push(dummyKarkotin);
player.location = 4;

allItems.push(flute, rock, sword, karkotin, carrot, dummyKarkotin, avain);

let playersInput = "";
let gameMessage = "";

const image = document.querySelector("#image");
const output = document.querySelector("#output");
const input = document.querySelector("#action");
const button = document.querySelector("#action_btn");
const directions = ["north", "east", "south", "west"];
const actions = ["pick", "use", "drop"];
var currentLocation = locations[player.location];

button.addEventListener("click", clickHandler, false);
input.addEventListener("keyup", function (event) {
  if (event.keyCode === 13) {
    clickHandler();
  }
});

function buttonHandler(btn) {
  let direction = btn.getAttribute("direction");
  input.value = direction;
  clickHandler();
}

const movementButtons = document.querySelectorAll(".arrow_btn");
console.log(movementButtons);
for (let i = 0; i < movementButtons.length; i++) {
  movementButtons[i].addEventListener("click", function () {
    buttonHandler(movementButtons[i]);
  });
}

function render() {
  image.src = currentLocation.image;
  output.innerHTML = "Your location: " + currentLocation.name;
  output.innerHTML += "<br><em>" + gameMessage + "</em>";
  for (i = 0; i < currentLocation.items.length; i++) {
    output.innerHTML += "<br>You see object: " + currentLocation.items[i].name;
    console.log("location items ", currentLocation.items[i]);
  }
  console.log("Player items ", player.items);
  if (player.items.length > 0) {
    let temp = [];
    for (i = 0; i < player.items.length; i++) {
      temp.push(player.items[i].name);
    }
    output.innerHTML += "<br><br>Backpack: " + temp.join(", ");
  }
  console.log("Current location", currentLocation);
}

function clickHandler() {
  playGame(input.value);
  input.value = "";
  input.focus();
}

function translateInput(value) {
  value = value.toLowerCase();
  words = value.split(" ");
  for (let i = 0; i < words.length; i++) {
    switch (words[i]) {
      case "take":
      case "grab":
      case "pick":
        words[i] = "pick";
        break;
      case "use":
      case "play":
      case "dig":
      case "eat":
      case "hit":
      case "swing":
      case "attack":
        words[i] = "use";
        break;
      case "give":
      case "drop":
      case "throw":
        words[i] = "drop";
        break;
    }
  }
  return words.join(" ");
}

function getItem(location, userInput) {
  for (let i = 0; i < location.items.length; i++) {
    let item = location.items[i];
    if (userInput.indexOf(item.name) != -1) {
      return item;
    }
  }
}

function getUserAction(userInput) {
  for (let i = 0; i < directions.length; i++) {
    if (userInput.indexOf(directions[i]) != -1) {
      return i; // Return direction index
    }
  }
  for (let i = 0; i < actions.length; i++) {
    if (userInput.indexOf(actions[i]) != -1) {
      return actions[i];
    }
  }
  return -1;
}

function playGame() {
  gameMessage = "";
  let playerInput = translateInput(input.value);
  let action = getUserAction(playerInput);

  switch (action) {
    case 0:
    case 1:
    case 2:
    case 3:
      destination = currentLocation.travelTo(action);
      if (destination != -1) {
        player.location = destination;
        currentLocation = locations[player.location];
        currentLocation.enter();
      } else {
        gameMessage = currentLocation.blockMessage;
      }
      break;
    case "pick":
      var item = getItem(currentLocation, playerInput);
      if (item) {
        item.pickup();
      } else {
        gameMessage = "You don't have that item";
      }
      break;
    case "drop":
      var item = getItem(player, playerInput);
      if (item) {
        item.drop();
      } else {
        gameMessage = "You don't have that item";
      }
      break;
    case "use":
      var item = getItem(player, playerInput);
      if (item) {
        item.activate();
      } else {
        gameMessage = "You don't have that item";
      }
      break;
    default:
      gameMessage = "Unknown action";
  }
  render();
}

render();
