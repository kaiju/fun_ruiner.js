/*
	fun_ruiner.js
	Author: Josh <josh@kaiju.net>

	TODO:
	Come up with a good banking strategy?

	Deal with the grandmapocalypse upgrades
	Deal with the season switcher
	Actual intelligent upgrade purchasing
	Handle certain achievements
	Player options

*/

var player = (function() {

	var forbidden_upgrades = [
		64,
		141,
		65,
		66,
		67,
		68,
		69,
		70,
		71,
		72,
		73,
		74,
		87,
		84,
		85,
		181
	]

	function forbidden_upgrade(upgrade) {
		for (var i=0;i<forbidden_upgrades.length;i++) {
			if (upgrade.id === forbidden_upgrades[i]) return true;
		}
		return false;
	}

	function random_int(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function click_the_cookie() {
		for (var i=0;i<random_int(1,10);i++) {
			setTimeout(Game.ClickCookie, random_int(50, 150));
		}
	}

	function has_class(element, class_name) {
		if ('className' in element) {
			var classes = element.className.split(' ');
			for (var i=0;i<classes.length;i++) {
				if (classes[i] === class_name) {
					return true;
				}
			} 
			return false;
		} else {
			return false;
		}
	}

	function get_unlocked_objects() {
		var return_objects = []
		for (obj_id in Game.ObjectsById) {
			var obj = Game.ObjectsById[obj_id];
			if (has_class(obj.l, 'unlocked')) {
				return_objects.push(obj);
			}
		}
		return return_objects;
	}


	function player() {
		this.interval = null;
	}

	player.prototype.start = function start() {
		this.interval = window.setInterval(this.main_loop, 1000);
	}

	player.prototype.stop = function stop() {
		window.clearInterval(this.interval);
		this.interval = null;
	}

	player.prototype.main_loop = function main_loop() {

		// clear out any notes
		if (Game.Notes.length > 0) {
			for (var i=0;i<Game.Notes.length;i++) {
				var note = Game.Notes[i];
				if ((Date.now()/1000 - note.date/1000) > note.life) {
					Game.CloseNote(note.id);
				}
			}
		}

		// click any golden cookies
		if (Game.goldenCookie.life > 0 && Game.goldenCookie.wrath === 0) {
			Game.goldenCookie.click();
		}

		// click any wrinklers
		if (Game.elderWrath > 0) { // check for grandmapocalypse?
			for (var i=0;i<Game.wrinklers.length;i++) {
				if (Game.wrinklers[i].close === 1) {
					Game.wrinklers[i].hp--;
				}
			}
		}

		// click any seasonal popups
		if (Game.seasonPopup.life > 0) {
			Game.seasonPopup.click();
		}

		// should we buy any objects?
		var unlocked_objects = get_unlocked_objects();

		if (unlocked_objects.length > 0) {
			// figure out what to buy next

			// for objects, what gives us the MOST cookies for the LEAST amount of money
			unlocked_objects.sort(function(a,b) {
				return ((a.getPrice()/a.storedCps)-(b.getPrice()/b.storedCps));
			})

			if (unlocked_objects[0].getPrice() < Game.cookies) {
				unlocked_objects[0].buy();
			} else {
				// I'm bored, click a cookie until we can afford something
				click_the_cookie();
			}

		} else {
			// I'm bored, let's click the cookie.
			click_the_cookie();
		}


		// should we buy any upgrades?
		// for now, I'm just going to buy whatever's cheapest
		if (Game.UpgradesInStore.length > 0) {

			for (var i=0;i<Game.UpgradesInStore.length;i++) {
				if (forbidden_upgrade(Game.UpgradesInStore[i]) && // ignoring certain upgrades until I come up with strategies for dealing with them
					Game.UpgradesInStore[0].getPrice() < Game.cookies) {
					Game.UpgradesInStore[0].buy();
					break;
				}			
			}

		}


	}

	return new player();

})();