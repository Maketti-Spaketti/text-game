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
    "Vanha linnantorni",
    0,
    "torni.jpg",
    [-1, 1, 3, -1],
    "Haluamasi reitti on liian vaarallinen."
  ),
  new TravelLocation(
    "Syvä kaivo",
    1,
    "kaivo.jpg",
    [-1, 2, 4, 0],
    "Salaperäinen voima estää liikkumisesi tuohon suuntaan."
  ),
  new TravelLocation(
    "Aurinkoinen metsäaukio",
    2,
    "aukio.jpg",
    [-1, -1, 5, 1],
    "Vaikeakulkuinen pusikko estää etenemisen."
  ),
  // MiddleRow
  new TravelLocation(
    "Vihainen lohikäärme",
    3,
    "dragon.jpg",
    [0, 4, 6, -1],
    "Et pääse siltä puolelta ohittamaan lohikäärmettä"
  ),
  new TravelLocation("Kapea metsäpolku", 4, "polku.jpg", [1, 5, 7, 3]),
  new TravelLocation(
    "Vanha portti",
    5,
    "portti.jpg",
    [2, -1, 8, 4],
    "Portti on lukittu."
  ),
  //Bottom Row
  new TravelLocation(
    "Joen ranta",
    6,
    "joki.jpg",
    [3, 7, -1, -1],
    "Joki on liian syvä ylitettäväksi."
  ),
  new TravelLocation(
    "Tyhjä penkki",
    7,
    "penkki_karkotin.jpg",
    [4, 8, -1, 6],
    "Metsä on liian tiheä läpäistäväksi."
  ),
  new TravelLocation(
    "Vanha mökki, sisältä kuuluu hiljaista musiikkia",
    8,
    "mokki.jpg",
    [5, -1, -1, 7],
    "Olet liian peloissasi mennäksesi tuohon suuntaan."
  ),

  // New area
  new TravelLocation(
    "<s>Lohikäärmeen</s> Jäniksen aarre",
    9,
    "treasure.jpg",
    [-1, -1, -1, -1], // trapped for now
    "Tajuat olevasi jumissa, onneksi jänis jätti paljon porkkanoita<br>(Voitit pelin)"
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

huilu = new Item(
  "huilu",
  [
    removeItem.bind(null, "currentLocation", "huilu"),
    spawnItem.bind(null, player, "huilu", "Poimit esineen huilu."),
  ],
  [
    conditionalTerminate.bind(
      null,
      "currentLocation",
      8,
      -1,
      -1,
      "Kaunis musiikki kaikuu ympärilläsi."
    ),
    removeItem.bind(null, player, "huilu"),
    spawnItem.bind(null, "currentLocation", "miekka", "Miekka ilmestyi."),
  ],
  [
    removeItem.bind(null, player, "huilu"),
    spawnItem.bind(null, "currentLocation", "huilu", "Pudotit esineen huilu."),
  ]
);
kivi = new Item(
  "kivi",
  [
    removeItem.bind(null, "currentLocation", "kivi"),
    spawnItem.bind(null, player, "kivi", "Poimit esineen kivi."),
  ],
  [
    conditionalTerminate.bind(
      null,
      player,
      999,
      -1,
      -1,
      "Pyörittelet kiveä taskussasi."
    ),
  ],
  [
    removeItem.bind(null, player, "kivi"),
    spawnItem.bind(null, "currentLocation", "kivi", "Pudotit esineen kivi."),
    conditionalTerminate.bind(null, "currentLocation", 1, -1, -1), // Stop if not at the well
    spawnItem.bind(null, "currentLocation", "huilu", "Pudotat kiven kaivoon."),
    removeItem.bind(null, "currentLocation", "kivi"),
  ]
);
miekka = new Item(
  "miekka",
  [
    removeItem.bind(null, "currentLocation", "miekka"),
    spawnItem.bind(null, player, "miekka", "Poimit esineen miekka."),
  ],
  [
    conditionalMessage.bind(
      null,
      "currentLocation",
      [3],
      ["Et yllä lohikäärmeeseen."],
      true
    ), // sword used at the dragon
    conditionalTerminate.bind(
      null,
      "currentLocation",
      2,
      -1,
      -1,
      "Heiluttelet miekaasi tylsistyneenä."
    ), // sword used anwywhere but forest
    removeItem.bind(
      null,
      player,
      "miekka",
      "Kaivat esiin villiporkkanan, mutta hajotit miekkasi"
    ), // sword used at the forest
    spawnItem.bind(null, player, "porkkana"),
  ],
  [
    removeItem.bind(null, player, "miekka"),
    spawnItem.bind(
      null,
      "currentLocation",
      "miekka",
      "Pudotit esineen miekka."
    ),
  ]
);
dummyKarkotin = new Item(
  "jäniksenkarkotin",
  [
    removeItem.bind(null, "currentLocation", "jäniksenkarkotin"),
    spawnItem.bind(null, player, "karkotin", "Poimit jäniksenkarkottimen."),
    conditionalTerminate.bind(null, "currentLocation", 7, -1, -1),
    setAttribute.bind(null, "currentLocation", "image", "penkki.jpg"),
  ],
  [], // Spawns another item, therefore no use
  [] // Spawns another item, therefore no drop
);
avain = new Item(
  "avain",
  [
    removeItem.bind(null, "currentLocation", "avain"),
    spawnItem.bind(null, player, "avain", "Poimit avaimen."),
  ],
  [
    conditionalTerminate.bind(
      null,
      "currentLocation",
      5,
      -1,
      -1,
      "Et voi käyttää avainta täällä."
    ),
    removeItem.bind(null, player, "avain", "Avaat portin avaimella."),
    setAttribute.bind(null, "currentLocation", "branches", [2, 9, 8, 4]),
  ],
  [
    spawnItem.bind(null, "currentLocation", "avain"),
    removeItem.bind(null, player, "avain", "Tiputit avaimen."),
  ]
);
karkotin = new Item(
  "karkotin",
  [], // Spawns another item on drop, therefore no pickup
  [
    conditionalTerminate.bind(
      null,
      "currentLocation",
      3,
      -1,
      -1,
      "Et nää jäniksiä"
    ), // Wrong place
    conditionalTerminate.bind(
      null,
      "currentLocation",
      -1,
      -1,
      1,
      "Lokikäärme on liian kaukana"
    ), // Wrong state
    removeItem.bind(null, player, "karkotin", ""), // Checks passed, succesful use
    setAttribute.bind(null, "currentLocation", "gamestate", 2),
    setAttribute.bind(null, "currentLocation", "name", "Tyhjä tie"),
    spawnItem.bind(
      null,
      "currentLocation",
      "avain",
      "Lohikäärme juoksi pakoon, se olikin jänis joka oli muutettu lohikäärmeeksi taialla<br>Jänis jätti jälkeensä avaimen"
    ),
    setAttribute.bind(null, "currentLocation", "image", "no_dragon.jpg"),
  ],
  [
    spawnItem.bind(null, "currentLocation", "jäniksenkarkotin"),
    removeItem.bind(null, player, "karkotin"),
    conditionalTerminate.bind(null, "currentLocation", 7, -1, -1),
    setAttribute.bind(null, "currentLocation", "image", "penkki_karkotin.jpg"),
  ]
);
porkkana = new Item(
  "porkkana",
  [
    removeItem.bind(null, "currentLocation", "porkkana"),
    spawnItem.bind(null, player, "porkkana", "Poimit esineen porkkana."),
  ],
  [
    conditionalTerminate.bind(
      null,
      "currentLocation",
      999,
      -1,
      -1,
      "Sinulla ei ole nälkä."
    ),
  ],
  [
    removeItem.bind(null, player, "porkkana"),
    spawnItem.bind(
      null,
      "currentLocation",
      "porkkana",
      "Pudotit esineen porkkana."
    ),
  ]
);
// Dragon eats carrot if on ground and left alone
locations[3].onEnter.push(
  conditionalTerminate.bind(null, "currentLocation", -1, "porkkana", -1),
  removeItem.bind(
    null,
    "currentLocation",
    "porkkana",
    "Lohikäärme syö porkkanaa."
  ),
  setAttribute.bind(null, "currentLocation", "gamestate", 1),
  setAttribute.bind(null, "currentLocation", "image", "dragon_ground.jpg"),
  setAttribute.bind(null, "currentLocation", "name", "Nälkäinen lohikäärme")
);

//player.items.push(kivi);
//player.items.push(huilu);
//player.items.push(miekka);
//player.items.push(karkotin);
//player.items.push(porkkana);
//player.items.push(avain);

locations[6].items.push(kivi);
locations[7].items.push(dummyKarkotin);
player.location = 4;

allItems.push(huilu, kivi, miekka, karkotin, porkkana, dummyKarkotin, avain);

let playersInput = "";
let gameMessage = "";

const image = document.querySelector("#image");
const output = document.querySelector("#output");
const input = document.querySelector("#action");
const button = document.querySelector("#action_btn");
const directions = ["pohjoinen", "itä", "etelä", "länsi"];
const actions = ["poimi", "käytä", "pudota"];
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
  output.innerHTML = "Sijaintisi: " + currentLocation.name;
  output.innerHTML += "<br><em>" + gameMessage + "</em>";
  for (i = 0; i < currentLocation.items.length; i++) {
    output.innerHTML += "<br>Näet esineen: " + currentLocation.items[i].name;
    console.log("location items ", currentLocation.items[i]);
  }
  console.log("Player items ", player.items);
  if (player.items.length > 0) {
    let temp = [];
    for (i = 0; i < player.items.length; i++) {
      temp.push(player.items[i].name);
    }
    output.innerHTML += "<br><br>Mukanasi on: " + temp.join(", ");
  }
  console.log("Current location", currentLocation);
}

function clickHandler() {
  console.log("Nappi painettu");
  playGame(input.value);
  input.value = "";
  input.focus();
}

function translateInput(value) {
  value = value.toLowerCase();
  value = value.replace("pick up", "poimi");
  words = value.split(" ");
  for (let i = 0; i < words.length; i++) {
    switch (words[i]) {
      case "kiveä":
      case "kivellä":
        words[i] = "kivi";
        break;
      case "miekalla":
      case "miekkaa":
      case "miekalla":
        words[i] = "miekka";
        break;
      case "huilua":
        words[i] = "huilu";
        break;
      case "porkkanaa":
      case "porkkanalla":
        words[i] = "porkkana";
        break;
      case "jäniksenkarkotinta":
        words[i] = "jäniksenkarkotin";
        break;
      case "karkottimella":
      case "karkotinta":
        words[i] = "karkotin";
        break;
      case "nosta":
      case "take":
      case "grab":
      case "pick":
      case "nouki":
      case "ota":
        words[i] = "poimi";
        break;
      case "use":
      case "play":
      case "dig":
      case "syö":
      case "lyö":
      case "soita":
      case "soitat":
      case "kaiva":
        words[i] = "käytä";
        break;
      case "give":
      case "drop":
      case "throw":
      case "anna":
      case "jätä":
      case "heitä":
      case "tiputa":
        words[i] = "pudota";
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
    case "poimi":
      var item = getItem(currentLocation, playerInput);
      if (item) {
        item.pickup();
      } else {
        gameMessage = "Et löydä tuollaista esinettä";
      }
      break;
    case "pudota":
      var item = getItem(player, playerInput);
      if (item) {
        item.drop();
      } else {
        gameMessage = "Sinulla ei ole tuollaista esinettä";
      }
      break;
    case "käytä":
      var item = getItem(player, playerInput);
      if (item) {
        item.activate();
      } else {
        gameMessage = "Sinulla ei ole tuollaista esinettä";
      }
      break;
    default:
      gameMessage = "Tuntematon toiminto";
  }
  render();
}

render();
