const ListBox = {
  setup: function(e) {
    e.setAttribute('role', 'listbox');
    e.tabIndex = "0";
    e.onfocus = (evt) => {
      if (!ListBox.getActiveDescendant(e)) {
        ListBox.setActiveDescendent(e, e.querySelector("[role=option]"));
      }
    };
  },

  setupOption: function(e) {
    e.setAttribute('role', 'option');
    e.setAttribute('aria-selected', e.classList.contains("selected"));
    let label = [e.querySelector(".name").textContent];
    if (e.querySelector('img[src="img/labels/room.svg"]')) {
      label.push("room");
    }
    let status = e.querySelector(".status");
    if (status) {
      if (status.classList.contains("online")) {
        label.push("online");
      }
      if (status.classList.contains("busy")) {
        label.push("busy");
      }
      if (status.classList.contains("offline")) {
        label.push("offline");
      }
      if (status.classList.contains("away")) {
        label.push("away");
      }
      if (status.classList.contains("unavailable")) {
        label.push("unavailable");
      }
    }
    if (e.querySelector(".owner_badge > img")) {
      label.push("owner");
    }
    if (e.querySelector(".js-remove-button-wrapper:not(.none):not(.is-hidden)")) {
      label.push("saved");
    }
    e.setAttribute('aria-label', label.join(", "));

    e.addEventListener("click", evt => {
      ListBox.setActiveDescendent(e.closest("[role=listbox]"), e);
    });
  },

  setActiveDescendent: function(listbox, option) {
    console.log("setActiveDescendent", listbox, option);
    if (option && option.id) {
    	let oldOption = this.getActiveDescendant(listbox);
  		if (oldOption == option) {
  			return;
  		}
  	  if (oldOption) {
        delete oldOption.dataset.activeDescendant;
  	  }
  	  listbox.setAttribute('aria-activedescendant', option.id);
      option.dataset.activeDescendant = "true";
  		//option.scrollIntoView();
  		scrollIntoViewIfNeeded(option);
  	}
  },

  getActiveDescendant: function(listbox) {
  	if (listbox.hasAttribute("aria-activedescendant")) {
    	return listbox.querySelector(`[id="${listbox.getAttribute("aria-activedescendant")}"]`);
  	}

  	return null;
  },

  handleKeyDown: function(event) {
  	let target = event.target;
	  let activedescendent = this.getActiveDescendant(target);
    console.log("handleKeyDown", activedescendent);
  	switch (event.key) {
      case "ArrowDown":
        this.setActiveDescendent(target, getAdjacentItem(target, activedescendent, 1));
				event.preventDefault();
        break;
      case "ArrowUp":
        this.setActiveDescendent(target, getAdjacentItem(target, activedescendent, -1));
				event.preventDefault();
        break;
      case "PageDown":
        this.setActiveDescendent(target, getAdjacentItem(target, activedescendent, 10));
				event.preventDefault();
        break;
      case "PageUp":
        this.setActiveDescendent(target, getAdjacentItem(target, activedescendent, -10));
				event.preventDefault();
        break;
			case "Home":
				this.setActiveDescendent(target, getFirstItem(target, activedescendent));
				event.preventDefault();
        break;
			case "End":
				this.setActiveDescendent(target, getLastItem(target, activedescendent));
				event.preventDefault();
        break;
      case " ":
      case "Enter":
				activedescendent.click();
        break;
    }
  }
};

const Tab = {
  CONTROLS_MAP: {
    "meetings-filter": "saved-meetings",
    "contacts-filter": "saved-contacts",
    "rooms-filter": "saved-rooms",
    "legacy-filter": null,
    "conversations-filter": "saved-conversations",
    "topics-filter": "saved-topics",
    "dial-out-filter": "saved-dial-out",
    "history-filter": "saved-history"
  },

  setupTab: function(e) {
    e.tabIndex = e.matches(":first-child") ? 0 : -1;
    e.setAttribute("role", "tab");
    e.setAttribute("aria-selected", e.classList.contains("is-active"));
    // e.onclick = evt => Tab.selectTab(evt.target);

    let panel = document.getElementById(this.CONTROLS_MAP[e.id]);
     if (panel) {
       e.setAttribute("aria-controls", panel.id);
       panel.setAttribute("role", "tabpanel");
       panel.setAttribute("aria-labelledby", e.id);
     }
  },

  focusTab: function(focusedTab, dir) {
    let tablist = focusedTab.closest("[role=tablist]");
    let tab = getAdjacentItem(tablist, focusedTab, dir == "next" ? 1 : -1);
    if (tab) {
      tab.focus();
    }
  },

  handleKeyDown: function(event) {
    switch (event.key) {
        case "ArrowDown":
        case "ArrowRight":
          this.focusTab(event.target, "next");
          break;
        case "ArrowUp":
        case "ArrowLeft":
          this.focusTab(event.target, "previous");
          break;
        case " ":
        case "Enter":
          event.target.click();
          break;
      }
   }
};

function allItemsSelector(item) {
	return `:scope > [role=${item.getAttribute("role")}]:not(.is-hidden), .list.is-active [role=${item.getAttribute("role")}]`
}

function getLastItem(container, currentItem) {
	let items = Array.from(container.querySelectorAll(allItemsSelector(currentItem)));
  return items[items.length - 1];
}

function getFirstItem(container, currentItem) {
	return container.querySelector(allItemsSelector(currentItem));
}

function getAdjacentItem(container, currentItem, offset) {
	let items = Array.from(container.querySelectorAll(allItemsSelector(currentItem)));
	let index = items.indexOf(currentItem);
	let newItem = items[index + offset];
	if (!newItem) {
		if (offset > 0) {
			return items[items.length -1];
		} else {
			return items[0]
		}
	}

	return newItem;
}

function getScrollParent(node) {
  if (node == null) {
    return null;
  }

  if (node.scrollHeight > node.clientHeight &&
      window.getComputedStyle(node).overflowY == "auto") {
    return node;
  } else {
    return getScrollParent(node.parentNode);
  }
}

function scrollIntoViewIfNeeded(item) {
  console.log("scrollIntoViewIfNeeded");
	let container = getScrollParent(item.parentNode);
  if (!container) {
    return;
  }

	let cb = container.getBoundingClientRect();
	let ib = item.getBoundingClientRect();
	if (ib.bottom > (cb.bottom)) {
		container.scrollTop += ib.bottom - cb.bottom;
	} else if (ib.top < (cb.top)) {
		container.scrollTop += ib.top - cb.top;
	}
}

const ELEMENTS_TO_FIX = {
  "search-results, #saved-container > .list": ListBox.setup,

  "search-results .list": function(e) {
    e.setAttribute("role", "group");
  },

  "#results-container-header": function(e) {
    e.setAttribute('role', 'heading');
    e.setAttribute('aria-level', '2');
  },

  ".ui-contact": ListBox.setupOption,

  ".list-items": function(e) {
    e.setAttribute("role", "presentation");
    e.tabIndex = -1;
  },

  ".list-title": function(e) {
    e.setAttribute("role", "presentation");
    e.parentNode.setAttribute('aria-label', e.textContent);
  },

  ".translation-number": function(e) {
    e.setAttribute("role", "presentation");
  },

  "#search-filters": function(e) {
    e.setAttribute("role", "tablist");
    e.setAttribute("aria-orientation", "vertical");
  },

  "#search-filters > div": function(e) {
    Tab.setupTab(e);
  },

  "#search": function(e) {
    e.accessKey = "s";
    e.tabIndex = "0";
  },

  ".actions > ul > li > a": function(e) {
    e.tabIndex = "0";
    e.setAttribute("role", "button");
  },

  "#video-buttons .button > a": function(e) {
    e.tabIndex = "0";
    e.setAttribute("role", "button");
  },

  "#sidebar-menu-button > .menu-button": function(e) {
    e.tabIndex = 0;
    e.setAttribute("role", "button");
    e.setAttribute("aria-label", e.querySelector(".tooltip").textContent);
    e.setAttribute("aria-expanded", !!e.closest(".control-panel-is-open"));
    e.setAttribute("aria-controls", "sidebar");
  }
};

function simulateClick(node) {
  function triggerMouseEvent (n, eventType) {
    let clickEvent = document.createEvent('MouseEvents');
    clickEvent.initEvent(eventType, true, true);
    n.dispatchEvent(clickEvent);
  }

  triggerMouseEvent (node, "mousedown");
  triggerMouseEvent (node, "mouseup");
  triggerMouseEvent (node, "click");
}


function fixContainer(container) {
	fixElement(container);
	container.querySelectorAll(Object.keys(ELEMENTS_TO_FIX).join(", ")).forEach(fixElement);
}

function fixElement(elem) {
  for (let [selector, rule] of Object.entries(ELEMENTS_TO_FIX)) {
    if (elem.matches(selector)) {
      rule(elem);
    }
  }

  if (elem.classList.contains("disabled")) {
    elem.setAttribute("aria-disabled", true);
  } else {
    elem.removeAttribute("aria-disabled");
  }
}

var observer = new MutationObserver(function(mutations) {
	for (var mutation of mutations) {
		try {
			if (mutation.type === "childList") {
				for (var node of mutation.addedNodes) {
					if (node.nodeType != Node.ELEMENT_NODE)
						continue;
					fixContainer(node);
				}
			} else if (mutation.type === "attributes") {
				if (mutation.attributeName == "class")
					fixContainer(mutation.target);
			}
		} catch (e) {
			// Catch exceptions for individual mutations so other mutations are still handled.
			console.error("Exception while handling mutation: " + e);
    }
  }
});

console.log("oo");

window.onkeydown = function(event) {
  console.log(event);
  switch(event.target.getAttribute('role')) {
    case "listbox":
      ListBox.handleKeyDown(event);
      break;
    case "tab":
      Tab.handleKeyDown(event);
      break;
    case "button":
      if (event.key == "Enter" || event.key == " ") {
        simulateClick(event.target);
      }
      break;
  }
};

addEventListener("click", e => console.log(e));

observer.observe(document.documentElement, {
	childList: true, attributes: true, subtree: true,
	attributeFilter: ["class"] });

fixContainer(document.body)
