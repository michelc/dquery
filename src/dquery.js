// Element.closest() polyfill
// https://developer.mozilla.org/en-US/docs/Web/API/Element/closest#Polyfill
// https://gomakethings.com/checking-event-target-selectors-with-event-bubbling-in-vanilla-javascript/
if (!Element.prototype.matches)
  Element.prototype.matches = Element.prototype.msMatchesSelector ||
                              Element.prototype.webkitMatchesSelector;

if (!Element.prototype.closest) {
  Element.prototype.closest = function(s) {
    var el = this;
    if (!document.documentElement.contains(el)) return null;
    do {
      if (el.matches(s)) return el;
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}

(function () {
"use strict";

  var dQuery = function (s) {
    this.selector = null;
    if (typeof s === "string") {
      // Sélecteur en cours
      this.selector = s;
      // Liste des éléments correspondant au sélecteur en cours
      this.items = Array.prototype.slice.call(document.querySelectorAll(s));
    } else {
      // Liste des éléments correspondant à l'objet DOM en cours
      this.items = [s];
    }
  };

  dQuery.prototype = {
    each: function (fn) {
      // Exécute une fonction sur chaque élément sélectionné
      [].forEach.call(this.items, fn);
      return this;
    },
    css: function (a, v) {
      // Défini une propriété CSS sur chaque élément sélectionné
      return this.each(function (i) {
        i.style[a] = v;
      });
    },
    hide: function () {
      // Masque chaque élément sélectionné
      return this.each(function (i) {
        i.style.display = "none";
      });
    },
    show: function () {
      // Affiche chaque élément sélectionné
      return this.each(function (i) {
        i.style.display = "block";
      });
    },
    on: function (type, filter, fn) {
      // Attache un gestionnaire d'évènement
      var delegation = (typeof filter === "string");
      // Syntaxe .on(type, fn)
      if (!delegation) {
        // Le paramètre "filter" est en fait le paramètre "fn"
        fn = filter;
        // Attache un gestionnaire d'évènement à chaque élément sélectionné
        return this.each(function (i) {
          i.addEventListener(type, function (event) {
            fn(event); // fn.call(event.target, event);
            event.stopImmediatePropagation();
            return false;
          }, false);
        });
      }
      // Syntaxe .on(type, filter, fn)
      // => effectue une délégation d'évènement
      var _filter = this.selector + " " + filter;
      document.addEventListener(type, function (event) {
        if (event.target.closest(_filter)) {
          fn(event); // fn.call(event.target, event);
          event.stopImmediatePropagation();
          return false;
        }
      }, false);
      return this;
    },
    addClass: function (v) {
      // Ajoute une classe CSS à chaque élément sélectionné
      return this.each(function (i) {
        if (i.classList) {
          i.classList.add(v);
        } else {
          i.className += " " + v;
        }
      });
    },
    removeClass: function (v) {
      // Supprime une classe CSS de chaque élément sélectionné
      return this.each(function (i) {
        if (i.classList) {
          i.classList.remove(v);
        } else {
          i.className = i.className.replace(new RegExp(v + " *", "g"), "");
        }
      });
    },
    html: function (v) {
      // Défini le contenu HTML de chaque élément sélectionné
      return this.each(function (i) {
        i.innerHTML = v;
        // ou .remove() puis .append() ?
      });
    },
    append: function (v) {
      // Insère un contenu HTML ou des éléments à la fin de chaque élément sélectionné
      return this.each(function (i) {
        i.insertAdjacentHTML("beforeend", v);
      });
    },
    text: function (v) {
      // Défini le contenu texte de chaque élément sélectionné
      return this.each(function (i) {
        i.textContent = v;
      });
    },
    remove: function () {
      // Supprime chaque élément sélectionné du DOM
      return this.each(function (i) {
        i.parentNode.removeChild(i);
      });
    },
    parent: function () {
      // Renvoie l'élément DOM parent du premier élément sélectionné
      this.items = [this.items[0].parentNode];
      return this;
    },
    attr: function (v) {
      // Renvoie la valeur d'un attribut du premier élément sélectionné
      return this.items[0].getAttribute(v);
    },
  };

  window.$ = function (selector) {
    return new dQuery(selector);
  };

})();
