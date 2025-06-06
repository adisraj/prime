/*
Trix 0.9.2
Copyright Â© 2015 Basecamp, LLC
http://trix-editor.org/
 */
(function() {}.call(this),
  function() {
    var t;
    null == window.Set &&
      (window.Set = t = (function() {
        function t() {
          this.clear();
        }
        return (
          (t.prototype.clear = function() {
            return (this.values = []);
          }),
          (t.prototype.has = function(t) {
            return -1 !== this.values.indexOf(t);
          }),
          (t.prototype.add = function(t) {
            return this.has(t) || this.values.push(t), this;
          }),
          (t.prototype["delete"] = function(t) {
            var e;
            return -1 === (e = this.values.indexOf(t))
              ? !1
              : (this.values.splice(e, 1), !0);
          }),
          (t.prototype.forEach = function() {
            var t;
            return (t = this.values).forEach.apply(t, arguments);
          }),
          t
        );
      })());
  }.call(
    this
  ) /*
https://github.com/taylorhakes/promise-polyfill
Copyright (c) 2014 Taylor Hakes
Copyright (c) 2014 Forbes Lindesay
*/,
  (function(t) {
    function e(t, e) {
      return function() {
        t.apply(e, arguments);
      };
    }
    function n(t) {
      if ("object" != typeof this)
        throw new TypeError("Promises must be constructed via new");
      if ("function" != typeof t) throw new TypeError("not a function");
      (this._state = null),
        (this._value = null),
        (this._deferreds = []),
        u(t, e(o, this), e(r, this));
    }
    function i(t) {
      var e = this;
      return null === this._state
        ? void this._deferreds.push(t)
        : void c(function() {
            var n = e._state ? t.onFulfilled : t.onRejected;
            if (null === n)
              return void (e._state ? t.resolve : t.reject)(e._value);
            var i;
            try {
              i = n(e._value);
            } catch (o) {
              return void t.reject(o);
            }
            t.resolve(i);
          });
    }
    function o(t) {
      try {
        if (t === this)
          throw new TypeError("A promise cannot be resolved with itself.");
        if (t && ("object" == typeof t || "function" == typeof t)) {
          var n = t.then;
          if ("function" == typeof n)
            return void u(e(n, t), e(o, this), e(r, this));
        }
        (this._state = !0), (this._value = t), s.call(this);
      } catch (i) {
        r.call(this, i);
      }
    }
    function r(t) {
      (this._state = !1), (this._value = t), s.call(this);
    }
    function s() {
      for (var t = 0, e = this._deferreds.length; e > t; t++)
        i.call(this, this._deferreds[t]);
      this._deferreds = null;
    }
    function a(t, e, n, i) {
      (this.onFulfilled = "function" == typeof t ? t : null),
        (this.onRejected = "function" == typeof e ? e : null),
        (this.resolve = n),
        (this.reject = i);
    }
    function u(t, e, n) {
      var i = !1;
      try {
        t(
          function(t) {
            i || ((i = !0), e(t));
          },
          function(t) {
            i || ((i = !0), n(t));
          }
        );
      } catch (o) {
        if (i) return;
        (i = !0), n(o);
      }
    }
    var c =
        ("function" == typeof setImmediate && setImmediate) ||
        function(t) {
          setTimeout(t, 1);
        },
      l =
        Array.isArray ||
        function(t) {
          return "[object Array]" === Object.prototype.toString.call(t);
        };
    (n.prototype["catch"] = function(t) {
      return this.then(null, t);
    }),
      (n.prototype.then = function(t, e) {
        var o = this;
        return new n(function(n, r) {
          i.call(o, new a(t, e, n, r));
        });
      }),
      (n.all = function() {
        var t = Array.prototype.slice.call(
          1 === arguments.length && l(arguments[0]) ? arguments[0] : arguments
        );
        return new n(function(e, n) {
          function i(r, s) {
            try {
              if (s && ("object" == typeof s || "function" == typeof s)) {
                var a = s.then;
                if ("function" == typeof a)
                  return void a.call(
                    s,
                    function(t) {
                      i(r, t);
                    },
                    n
                  );
              }
              (t[r] = s), 0 === --o && e(t);
            } catch (u) {
              n(u);
            }
          }
          if (0 === t.length) return e([]);
          for (var o = t.length, r = 0; r < t.length; r++) i(r, t[r]);
        });
      }),
      (n.resolve = function(t) {
        return t && "object" == typeof t && t.constructor === n
          ? t
          : new n(function(e) {
              e(t);
            });
      }),
      (n.reject = function(t) {
        return new n(function(e, n) {
          n(t);
        });
      }),
      (n.race = function(t) {
        return new n(function(e, n) {
          for (var i = 0, o = t.length; o > i; i++) t[i].then(e, n);
        });
      }),
      (n._setImmediateFn = function(t) {
        c = t;
      }),
      "undefined" != typeof module && module.exports
        ? (module.exports = n)
        : t.Promise || (t.Promise = n);
  })(this)
  /**
   * @license
   * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
   */,
  "undefined" == typeof WeakMap &&
    !(function() {
      var t = Object.defineProperty,
        e = Date.now() % 1e9,
        n = function() {
          this.name = "__st" + ((1e9 * Math.random()) >>> 0) + (e++ + "__");
        };
      (n.prototype = {
        set: function(e, n) {
          var i = e[this.name];
          return (
            i && i[0] === e
              ? (i[1] = n)
              : t(e, this.name, { value: [e, n], writable: !0 }),
            this
          );
        },
        get: function(t) {
          var e;
          return (e = t[this.name]) && e[0] === t ? e[1] : void 0;
        },
        delete: function(t) {
          var e = t[this.name];
          return e && e[0] === t ? ((e[0] = e[1] = void 0), !0) : !1;
        },
        has: function(t) {
          var e = t[this.name];
          return e ? e[0] === t : !1;
        }
      }),
        (window.WeakMap = n);
    })(),
  (function(t) {
    function e(t) {
      A.push(t), b || ((b = !0), g(i));
    }
    function n(t) {
      return (
        (window.ShadowDOMPolyfill &&
          window.ShadowDOMPolyfill.wrapIfNeeded(t)) ||
        t
      );
    }
    function i() {
      b = !1;
      var t = A;
      (A = []),
        t.sort(function(t, e) {
          return t.uid_ - e.uid_;
        });
      var e = !1;
      t.forEach(function(t) {
        var n = t.takeRecords();
        o(t), n.length && (t.callback_(n, t), (e = !0));
      }),
        e && i();
    }
    function o(t) {
      t.nodes_.forEach(function(e) {
        var n = m.get(e);
        n &&
          n.forEach(function(e) {
            e.observer === t && e.removeTransientObservers();
          });
      });
    }
    function r(t, e) {
      for (var n = t; n; n = n.parentNode) {
        var i = m.get(n);
        if (i)
          for (var o = 0; o < i.length; o++) {
            var r = i[o],
              s = r.options;
            if (n === t || s.subtree) {
              var a = e(s);
              a && r.enqueue(a);
            }
          }
      }
    }
    function s(t) {
      (this.callback_ = t),
        (this.nodes_ = []),
        (this.records_ = []),
        (this.uid_ = ++x);
    }
    function a(t, e) {
      (this.type = t),
        (this.target = e),
        (this.addedNodes = []),
        (this.removedNodes = []),
        (this.previousSibling = null),
        (this.nextSibling = null),
        (this.attributeName = null),
        (this.attributeNamespace = null),
        (this.oldValue = null);
    }
    function u(t) {
      var e = new a(t.type, t.target);
      return (
        (e.addedNodes = t.addedNodes.slice()),
        (e.removedNodes = t.removedNodes.slice()),
        (e.previousSibling = t.previousSibling),
        (e.nextSibling = t.nextSibling),
        (e.attributeName = t.attributeName),
        (e.attributeNamespace = t.attributeNamespace),
        (e.oldValue = t.oldValue),
        e
      );
    }
    function c(t, e) {
      return (T = new a(t, e));
    }
    function l(t) {
      return C ? C : ((C = u(T)), (C.oldValue = t), C);
    }
    function h() {
      T = C = void 0;
    }
    function p(t) {
      return t === C || t === T;
    }
    function d(t, e) {
      return t === e ? t : C && p(t) ? C : null;
    }
    function f(t, e, n) {
      (this.observer = t),
        (this.target = e),
        (this.options = n),
        (this.transientObservedNodes = []);
    }
    var g,
      m = new WeakMap();
    if (/Trident|Edge/.test(navigator.userAgent)) g = setTimeout;
    else if (window.setImmediate) g = window.setImmediate;
    else {
      var y = [],
        v = String(Math.random());
      window.addEventListener("message", function(t) {
        if (t.data === v) {
          var e = y;
          (y = []),
            e.forEach(function(t) {
              t();
            });
        }
      }),
        (g = function(t) {
          y.push(t), window.postMessage(v, "*");
        });
    }
    var b = !1,
      A = [],
      x = 0;
    s.prototype = {
      observe: function(t, e) {
        if (
          ((t = n(t)),
          (!e.childList && !e.attributes && !e.characterData) ||
            (e.attributeOldValue && !e.attributes) ||
            (e.attributeFilter && e.attributeFilter.length && !e.attributes) ||
            (e.characterDataOldValue && !e.characterData))
        )
          throw new SyntaxError();
        var i = m.get(t);
        i || m.set(t, (i = []));
        for (var o, r = 0; r < i.length; r++)
          if (i[r].observer === this) {
            (o = i[r]), o.removeListeners(), (o.options = e);
            break;
          }
        o || ((o = new f(this, t, e)), i.push(o), this.nodes_.push(t)),
          o.addListeners();
      },
      disconnect: function() {
        this.nodes_.forEach(function(t) {
          for (var e = m.get(t), n = 0; n < e.length; n++) {
            var i = e[n];
            if (i.observer === this) {
              i.removeListeners(), e.splice(n, 1);
              break;
            }
          }
        }, this),
          (this.records_ = []);
      },
      takeRecords: function() {
        var t = this.records_;
        return (this.records_ = []), t;
      }
    };
    var T, C;
    (f.prototype = {
      enqueue: function(t) {
        var n = this.observer.records_,
          i = n.length;
        if (n.length > 0) {
          var o = n[i - 1],
            r = d(o, t);
          if (r) return void (n[i - 1] = r);
        } else e(this.observer);
        n[i] = t;
      },
      addListeners: function() {
        this.addListeners_(this.target);
      },
      addListeners_: function(t) {
        var e = this.options;
        e.attributes && t.addEventListener("DOMAttrModified", this, !0),
          e.characterData &&
            t.addEventListener("DOMCharacterDataModified", this, !0),
          e.childList && t.addEventListener("DOMNodeInserted", this, !0),
          (e.childList || e.subtree) &&
            t.addEventListener("DOMNodeRemoved", this, !0);
      },
      removeListeners: function() {
        this.removeListeners_(this.target);
      },
      removeListeners_: function(t) {
        var e = this.options;
        e.attributes && t.removeEventListener("DOMAttrModified", this, !0),
          e.characterData &&
            t.removeEventListener("DOMCharacterDataModified", this, !0),
          e.childList && t.removeEventListener("DOMNodeInserted", this, !0),
          (e.childList || e.subtree) &&
            t.removeEventListener("DOMNodeRemoved", this, !0);
      },
      addTransientObserver: function(t) {
        if (t !== this.target) {
          this.addListeners_(t), this.transientObservedNodes.push(t);
          var e = m.get(t);
          e || m.set(t, (e = [])), e.push(this);
        }
      },
      removeTransientObservers: function() {
        var t = this.transientObservedNodes;
        (this.transientObservedNodes = []),
          t.forEach(function(t) {
            this.removeListeners_(t);
            for (var e = m.get(t), n = 0; n < e.length; n++)
              if (e[n] === this) {
                e.splice(n, 1);
                break;
              }
          }, this);
      },
      handleEvent: function(t) {
        switch ((t.stopImmediatePropagation(), t.type)) {
          case "DOMAttrModified":
            var e = t.attrName,
              n = t.relatedNode.namespaceURI,
              i = t.target,
              o = new c("attributes", i);
            (o.attributeName = e), (o.attributeNamespace = n);
            var s =
              t.attrChange === MutationEvent.ADDITION ? null : t.prevValue;
            r(i, function(t) {
              return !t.attributes ||
                (t.attributeFilter &&
                  t.attributeFilter.length &&
                  -1 === t.attributeFilter.indexOf(e) &&
                  -1 === t.attributeFilter.indexOf(n))
                ? void 0
                : t.attributeOldValue
                  ? l(s)
                  : o;
            });
            break;
          case "DOMCharacterDataModified":
            var i = t.target,
              o = c("characterData", i),
              s = t.prevValue;
            r(i, function(t) {
              return t.characterData
                ? t.characterDataOldValue
                  ? l(s)
                  : o
                : void 0;
            });
            break;
          case "DOMNodeRemoved":
            this.addTransientObserver(t.target);
          case "DOMNodeInserted":
            var a,
              u,
              p = t.target;
            "DOMNodeInserted" === t.type
              ? ((a = [p]), (u = []))
              : ((a = []), (u = [p]));
            var d = p.previousSibling,
              f = p.nextSibling,
              o = c("childList", t.target.parentNode);
            (o.addedNodes = a),
              (o.removedNodes = u),
              (o.previousSibling = d),
              (o.nextSibling = f),
              r(t.relatedNode, function(t) {
                return t.childList ? o : void 0;
              });
        }
        h();
      }
    }),
      (t.JsMutationObserver = s),
      t.MutationObserver || (t.MutationObserver = s);
  })(self),
  (window.CustomElements = window.CustomElements || { flags: {} }),
  (function(t) {
    var e = t.flags,
      n = [],
      i = function(t) {
        n.push(t);
      },
      o = function() {
        n.forEach(function(e) {
          e(t);
        });
      };
    (t.addModule = i),
      (t.initializeModules = o),
      (t.hasNative = Boolean(document.registerElement)),
      (t.isIE = /Trident/.test(navigator.userAgent)),
      (t.useNative =
        !e.register &&
        t.hasNative &&
        !window.ShadowDOMPolyfill &&
        (!window.HTMLImports || window.HTMLImports.useNative));
  })(window.CustomElements),
  window.CustomElements.addModule(function(t) {
    function e(t, e) {
      n(t, function(t) {
        return e(t) ? !0 : void i(t, e);
      }),
        i(t, e);
    }
    function n(t, e, i) {
      var o = t.firstElementChild;
      if (!o)
        for (o = t.firstChild; o && o.nodeType !== Node.ELEMENT_NODE; )
          o = o.nextSibling;
      for (; o; ) e(o, i) !== !0 && n(o, e, i), (o = o.nextElementSibling);
      return null;
    }
    function i(t, n) {
      for (var i = t.shadowRoot; i; ) e(i, n), (i = i.olderShadowRoot);
    }
    function o(t, e) {
      r(t, e, []);
    }
    function r(t, e, n) {
      if (((t = window.wrap(t)), !(n.indexOf(t) >= 0))) {
        n.push(t);
        for (
          var i,
            o = t.querySelectorAll("link[rel=" + s + "]"),
            a = 0,
            u = o.length;
          u > a && (i = o[a]);
          a++
        )
          i.import && r(i.import, e, n);
        e(t);
      }
    }
    var s = window.HTMLImports ? window.HTMLImports.IMPORT_LINK_TYPE : "none";
    (t.forDocumentTree = o), (t.forSubtree = e);
  }),
  window.CustomElements.addModule(function(t) {
    function e(t, e) {
      return n(t, e) || i(t, e);
    }
    function n(e, n) {
      return t.upgrade(e, n) ? !0 : void (n && s(e));
    }
    function i(t, e) {
      b(t, function(t) {
        return n(t, e) ? !0 : void 0;
      });
    }
    function o(t) {
      C.push(t), T || ((T = !0), setTimeout(r));
    }
    function r() {
      T = !1;
      for (var t, e = C, n = 0, i = e.length; i > n && (t = e[n]); n++) t();
      C = [];
    }
    function s(t) {
      x
        ? o(function() {
            a(t);
          })
        : a(t);
    }
    function a(t) {
      t.__upgraded__ &&
        !t.__attached &&
        ((t.__attached = !0), t.attachedCallback && t.attachedCallback());
    }
    function u(t) {
      c(t),
        b(t, function(t) {
          c(t);
        });
    }
    function c(t) {
      x
        ? o(function() {
            l(t);
          })
        : l(t);
    }
    function l(t) {
      t.__upgraded__ &&
        t.__attached &&
        ((t.__attached = !1), t.detachedCallback && t.detachedCallback());
    }
    function h(t) {
      for (var e = t, n = window.wrap(document); e; ) {
        if (e == n) return !0;
        e =
          e.parentNode ||
          (e.nodeType === Node.DOCUMENT_FRAGMENT_NODE && e.host);
      }
    }
    function p(t) {
      if (t.shadowRoot && !t.shadowRoot.__watched) {
        v.dom && console.log("watching shadow-root for: ", t.localName);
        for (var e = t.shadowRoot; e; ) g(e), (e = e.olderShadowRoot);
      }
    }
    function d(t, n) {
      if (v.dom) {
        var i = n[0];
        if (i && "childList" === i.type && i.addedNodes && i.addedNodes) {
          for (var o = i.addedNodes[0]; o && o !== document && !o.host; )
            o = o.parentNode;
          var r =
            (o && (o.URL || o._URL || (o.host && o.host.localName))) || "";
          r = r
            .split("/?")
            .shift()
            .split("/")
            .pop();
        }
        console.group("mutations (%d) [%s]", n.length, r || "");
      }
      var s = h(t);
      n.forEach(function(t) {
        "childList" === t.type &&
          (w(t.addedNodes, function(t) {
            t.localName && e(t, s);
          }),
          w(t.removedNodes, function(t) {
            t.localName && u(t);
          }));
      }),
        v.dom && console.groupEnd();
    }
    function f(t) {
      for (t = window.wrap(t), t || (t = window.wrap(document)); t.parentNode; )
        t = t.parentNode;
      var e = t.__observer;
      e && (d(t, e.takeRecords()), r());
    }
    function g(t) {
      if (!t.__observer) {
        var e = new MutationObserver(d.bind(this, t));
        e.observe(t, { childList: !0, subtree: !0 }), (t.__observer = e);
      }
    }
    function m(t) {
      (t = window.wrap(t)),
        v.dom && console.group("upgradeDocument: ", t.baseURI.split("/").pop());
      var n = t === window.wrap(document);
      e(t, n), g(t), v.dom && console.groupEnd();
    }
    function y(t) {
      A(t, m);
    }
    var v = t.flags,
      b = t.forSubtree,
      A = t.forDocumentTree,
      x =
        !window.MutationObserver ||
        window.MutationObserver === window.JsMutationObserver;
    t.hasPolyfillMutations = x;
    var T = !1,
      C = [],
      w = Array.prototype.forEach.call.bind(Array.prototype.forEach),
      E = Element.prototype.createShadowRoot;
    E &&
      (Element.prototype.createShadowRoot = function() {
        var t = E.call(this);
        return window.CustomElements.watchShadow(this), t;
      }),
      (t.watchShadow = p),
      (t.upgradeDocumentTree = y),
      (t.upgradeDocument = m),
      (t.upgradeSubtree = i),
      (t.upgradeAll = e),
      (t.attached = s),
      (t.takeRecords = f);
  }),
  window.CustomElements.addModule(function(t) {
    function e(e, i) {
      if (!e.__upgraded__ && e.nodeType === Node.ELEMENT_NODE) {
        var o = e.getAttribute("is"),
          r =
            t.getRegisteredDefinition(e.localName) ||
            t.getRegisteredDefinition(o);
        if (r && ((o && r.tag == e.localName) || (!o && !r.extends)))
          return n(e, r, i);
      }
    }
    function n(e, n, o) {
      return (
        s.upgrade && console.group("upgrade:", e.localName),
        n.is && e.setAttribute("is", n.is),
        i(e, n),
        (e.__upgraded__ = !0),
        r(e),
        o && t.attached(e),
        t.upgradeSubtree(e, o),
        s.upgrade && console.groupEnd(),
        e
      );
    }
    function i(t, e) {
      Object.__proto__
        ? (t.__proto__ = e.prototype)
        : (o(t, e.prototype, e.native), (t.__proto__ = e.prototype));
    }
    function o(t, e, n) {
      for (var i = {}, o = e; o !== n && o !== HTMLElement.prototype; ) {
        for (var r, s = Object.getOwnPropertyNames(o), a = 0; (r = s[a]); a++)
          i[r] ||
            (Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(o, r)),
            (i[r] = 1));
        o = Object.getPrototypeOf(o);
      }
    }
    function r(t) {
      t.createdCallback && t.createdCallback();
    }
    var s = t.flags;
    (t.upgrade = e), (t.upgradeWithDefinition = n), (t.implementPrototype = i);
  }),
  window.CustomElements.addModule(function(t) {
    function e(e, i) {
      var u = i || {};
      if (!e)
        throw new Error(
          "document.registerElement: first argument `name` must not be empty"
        );
      if (e.indexOf("-") < 0)
        throw new Error(
          "document.registerElement: first argument ('name') must contain a dash ('-'). Argument provided was '" +
            String(e) +
            "'."
        );
      if (o(e))
        throw new Error(
          "Failed to execute 'registerElement' on 'Document': Registration failed for type '" +
            String(e) +
            "'. The type name is invalid."
        );
      if (c(e))
        throw new Error(
          "DuplicateDefinitionError: a type with name '" +
            String(e) +
            "' is already registered"
        );
      return (
        u.prototype || (u.prototype = Object.create(HTMLElement.prototype)),
        (u.__name = e.toLowerCase()),
        (u.lifecycle = u.lifecycle || {}),
        (u.ancestry = r(u.extends)),
        s(u),
        a(u),
        n(u.prototype),
        l(u.__name, u),
        (u.ctor = h(u)),
        (u.ctor.prototype = u.prototype),
        (u.prototype.constructor = u.ctor),
        t.ready && y(document),
        u.ctor
      );
    }
    function n(t) {
      if (!t.setAttribute._polyfilled) {
        var e = t.setAttribute;
        t.setAttribute = function(t, n) {
          i.call(this, t, n, e);
        };
        var n = t.removeAttribute;
        (t.removeAttribute = function(t) {
          i.call(this, t, null, n);
        }),
          (t.setAttribute._polyfilled = !0);
      }
    }
    function i(t, e, n) {
      t = t.toLowerCase();
      var i = this.getAttribute(t);
      n.apply(this, arguments);
      var o = this.getAttribute(t);
      this.attributeChangedCallback &&
        o !== i &&
        this.attributeChangedCallback(t, i, o);
    }
    function o(t) {
      for (var e = 0; e < T.length; e++) if (t === T[e]) return !0;
    }
    function r(t) {
      var e = c(t);
      return e ? r(e.extends).concat([e]) : [];
    }
    function s(t) {
      for (var e, n = t.extends, i = 0; (e = t.ancestry[i]); i++)
        n = e.is && e.tag;
      (t.tag = n || t.__name), n && (t.is = t.__name);
    }
    function a(t) {
      if (!Object.__proto__) {
        var e = HTMLElement.prototype;
        if (t.is) {
          var n = document.createElement(t.tag);
          e = Object.getPrototypeOf(n);
        }
        for (var i, o = t.prototype, r = !1; o; )
          o == e && (r = !0),
            (i = Object.getPrototypeOf(o)),
            i && (o.__proto__ = i),
            (o = i);
        r ||
          console.warn(
            t.tag + " prototype not found in prototype chain for " + t.is
          ),
          (t.native = e);
      }
    }
    function u(t) {
      return b(E(t.tag), t);
    }
    function c(t) {
      return t ? C[t.toLowerCase()] : void 0;
    }
    function l(t, e) {
      C[t] = e;
    }
    function h(t) {
      return function() {
        return u(t);
      };
    }
    function p(t, e, n) {
      return t === w ? d(e, n) : S(t, e);
    }
    function d(t, e) {
      t && (t = t.toLowerCase()), e && (e = e.toLowerCase());
      var n = c(e || t);
      if (n) {
        if (t == n.tag && e == n.is) return new n.ctor();
        if (!e && !n.is) return new n.ctor();
      }
      var i;
      return e
        ? ((i = d(t)), i.setAttribute("is", e), i)
        : ((i = E(t)), t.indexOf("-") >= 0 && A(i, HTMLElement), i);
    }
    function f(t, e) {
      var n = t[e];
      t[e] = function() {
        var t = n.apply(this, arguments);
        return v(t), t;
      };
    }
    var g,
      m = t.isIE,
      y = t.upgradeDocumentTree,
      v = t.upgradeAll,
      b = t.upgradeWithDefinition,
      A = t.implementPrototype,
      x = t.useNative,
      T = [
        "annotation-xml",
        "color-profile",
        "font-face",
        "font-face-src",
        "font-face-uri",
        "font-face-format",
        "font-face-name",
        "missing-glyph"
      ],
      C = {},
      w = "http://www.w3.org/1999/xhtml",
      E = document.createElement.bind(document),
      S = document.createElementNS.bind(document);
    (g =
      Object.__proto__ || x
        ? function(t, e) {
            return t instanceof e;
          }
        : function(t, e) {
            if (t instanceof e) return !0;
            for (var n = t; n; ) {
              if (n === e.prototype) return !0;
              n = n.__proto__;
            }
            return !1;
          }),
      f(Node.prototype, "cloneNode"),
      f(document, "importNode"),
      m &&
        !(function() {
          var t = document.importNode;
          document.importNode = function() {
            var e = t.apply(document, arguments);
            if (e.nodeType == e.DOCUMENT_FRAGMENT_NODE) {
              var n = document.createDocumentFragment();
              return n.appendChild(e), n;
            }
            return e;
          };
        })(),
      (document.registerElement = e),
      (document.createElement = d),
      (document.createElementNS = p),
      (t.registry = C),
      (t.instanceof = g),
      (t.reservedTagList = T),
      (t.getRegisteredDefinition = c),
      (document.register = document.registerElement);
  }),
  (function(t) {
    function e() {
      s(window.wrap(document)), (window.CustomElements.ready = !0);
      var t =
        window.requestAnimationFrame ||
        function(t) {
          setTimeout(t, 16);
        };
      t(function() {
        setTimeout(function() {
          (window.CustomElements.readyTime = Date.now()),
            window.HTMLImports &&
              (window.CustomElements.elapsed =
                window.CustomElements.readyTime - window.HTMLImports.readyTime),
            document.dispatchEvent(
              new CustomEvent("WebComponentsReady", { bubbles: !0 })
            );
        });
      });
    }
    var n = t.useNative,
      i = t.initializeModules,
      o = t.isIE;
    if (n) {
      var r = function() {};
      (t.watchShadow = r),
        (t.upgrade = r),
        (t.upgradeAll = r),
        (t.upgradeDocumentTree = r),
        (t.upgradeSubtree = r),
        (t.takeRecords = r),
        (t.instanceof = function(t, e) {
          return t instanceof e;
        });
    } else i();
    var s = t.upgradeDocumentTree,
      a = t.upgradeDocument;
    if (
      (window.wrap ||
        (window.ShadowDOMPolyfill
          ? ((window.wrap = window.ShadowDOMPolyfill.wrapIfNeeded),
            (window.unwrap = window.ShadowDOMPolyfill.unwrapIfNeeded))
          : (window.wrap = window.unwrap = function(t) {
              return t;
            })),
      window.HTMLImports &&
        (window.HTMLImports.__importsParsingHook = function(t) {
          t.import && a(wrap(t.import));
        }),
      (!window.CustomEvent || (o && "function" != typeof window.CustomEvent)) &&
        ((window.CustomEvent = function(t, e) {
          e = e || {};
          var n = document.createEvent("CustomEvent");
          return (
            n.initCustomEvent(
              t,
              Boolean(e.bubbles),
              Boolean(e.cancelable),
              e.detail
            ),
            (n.preventDefault = function() {
              Object.defineProperty(this, "defaultPrevented", {
                get: function() {
                  return !0;
                }
              });
            }),
            n
          );
        }),
        (window.CustomEvent.prototype = window.Event.prototype)),
      "complete" === document.readyState || t.flags.eager)
    )
      e();
    else if (
      "interactive" !== document.readyState ||
      window.attachEvent ||
      (window.HTMLImports && !window.HTMLImports.ready)
    ) {
      var u =
        window.HTMLImports && !window.HTMLImports.ready
          ? "HTMLImportsLoaded"
          : "DOMContentLoaded";
      window.addEventListener(u, e);
    } else e();
  })(window.CustomElements),
  function() {}.call(this),
  function() {
    this.Trix = {
      VERSION: "0.9.2",
      ZERO_WIDTH_SPACE: "\ufeff",
      NON_BREAKING_SPACE: "\xa0",
      OBJECT_REPLACEMENT_CHARACTER: "\ufffc",
      config: {}
    };
  }.call(this),
  function() {
    Trix.BasicObject = (function() {
      function t() {}
      var e, n, i;
      return (
        (t.proxyMethod = function(t) {
          var i, o, r, s, a;
          return (
            (r = n(t)),
            (i = r.name),
            (s = r.toMethod),
            (a = r.toProperty),
            (o = r.optional),
            (this.prototype[i] = function() {
              var t, n;
              return (
                (t =
                  null != s
                    ? o
                      ? "function" == typeof this[s]
                        ? this[s]()
                        : void 0
                      : this[s]()
                    : null != a
                      ? this[a]
                      : void 0),
                o
                  ? ((n = null != t ? t[i] : void 0),
                    null != n ? e.call(n, t, arguments) : void 0)
                  : ((n = t[i]), e.call(n, t, arguments))
              );
            })
          );
        }),
        (n = function(t) {
          var e, n;
          if (!(n = t.match(i)))
            throw new Error("can't parse @proxyMethod expression: " + t);
          return (
            (e = { name: n[4] }),
            null != n[2] ? (e.toMethod = n[1]) : (e.toProperty = n[1]),
            null != n[3] && (e.optional = !0),
            e
          );
        }),
        (e = Function.prototype.apply),
        (i = /^(.+?)(\(\))?(\?)?\.(.+?)$/),
        t
      );
    })();
  }.call(this),
  function() {
    var t = function(t, n) {
        function i() {
          this.constructor = t;
        }
        for (var o in n) e.call(n, o) && (t[o] = n[o]);
        return (
          (i.prototype = n.prototype),
          (t.prototype = new i()),
          (t.__super__ = n.prototype),
          t
        );
      },
      e = {}.hasOwnProperty;
    Trix.Object = (function(e) {
      function n() {
        this.id = ++i;
      }
      var i;
      return (
        t(n, e),
        (i = 0),
        (n.fromJSONString = function(t) {
          return this.fromJSON(JSON.parse(t));
        }),
        (n.prototype.hasSameConstructorAs = function(t) {
          return this.constructor === (null != t ? t.constructor : void 0);
        }),
        (n.prototype.isEqualTo = function(t) {
          return this === t;
        }),
        (n.prototype.inspect = function() {
          var t, e, n;
          return (
            (t = function() {
              var t, i, o;
              (i = null != (t = this.contentsForInspection()) ? t : {}),
                (o = []);
              for (e in i) (n = i[e]), o.push(e + "=" + n);
              return o;
            }.call(this)),
            "#<" +
              this.constructor.name +
              ":" +
              this.id +
              (t.length ? " " + t.join(", ") : "") +
              ">"
          );
        }),
        (n.prototype.contentsForInspection = function() {}),
        (n.prototype.toJSONString = function() {
          return JSON.stringify(this);
        }),
        (n.prototype.toUTF16String = function() {
          return Trix.UTF16String.box(this);
        }),
        (n.prototype.getCacheKey = function() {
          return this.id.toString();
        }),
        n
      );
    })(Trix.BasicObject);
  }.call(this),
  function() {
    Trix.extend = function(t) {
      var e, n;
      for (e in t) (n = t[e]), (this[e] = n);
      return this;
    };
  }.call(this),
  function() {
    var t, e;
    Trix.extend({
      defer: function(t) {
        return setTimeout(t, 1);
      },
      memoize: function(t) {
        var n;
        return (
          (n = e++),
          function() {
            var e;
            return (
              null == this.memos && (this.memos = {}),
              null != (e = this.memos)[n]
                ? e[n]
                : (e[n] = t.apply(this, arguments))
            );
          }
        );
      }
    }),
      (e = 0),
      (t = function(t) {
        var e, n;
        return null !=
          (e =
            null !=
            (n =
              null != t && "function" == typeof t.inspect
                ? t.inspect()
                : void 0)
              ? n
              : (function() {
                  try {
                    return JSON.stringify(t);
                  } catch (e) {}
                })())
          ? e
          : t;
      });
  }.call(this),
  function() {
    var t, e;
    Trix.extend({
      normalizeSpaces: function(t) {
        return t
          .replace(RegExp("" + Trix.ZERO_WIDTH_SPACE, "g"), "")
          .replace(RegExp("" + Trix.NON_BREAKING_SPACE, "g"), " ");
      },
      summarizeStringChange: function(t, n) {
        var i, o, r, s;
        return (
          (t = Trix.UTF16String.box(t)),
          (n = Trix.UTF16String.box(n)),
          n.length < t.length
            ? ((o = e(t, n)), (s = o[0]), (i = o[1]))
            : ((r = e(n, t)), (i = r[0]), (s = r[1])),
          { added: i, removed: s }
        );
      }
    }),
      (e = function(e, n) {
        var i, o, r, s, a;
        return e.isEqualTo(n)
          ? ["", ""]
          : ((o = t(e, n)),
            (s = o.utf16String.length),
            (r = s
              ? ((a = o.offset),
                o,
                (i = e.codepoints
                  .slice(0, a)
                  .concat(e.codepoints.slice(a + s))),
                t(n, Trix.UTF16String.fromCodepoints(i)))
              : t(n, e)),
            [o.utf16String.toString(), r.utf16String.toString()]);
      }),
      (t = function(t, e) {
        var n, i, o;
        for (
          n = 0, i = t.length, o = e.length;
          i > n && t.charAt(n).isEqualTo(e.charAt(n));

        )
          n++;
        for (; i > n + 1 && t.charAt(i - 1).isEqualTo(e.charAt(o - 1)); )
          i--, o--;
        return { utf16String: t.slice(n, i), offset: n };
      });
  }.call(this),
  function() {
    Trix.extend({
      arraysAreEqual: function(t, e) {
        var n, i, o, r;
        if (
          (null == t && (t = []), null == e && (e = []), t.length !== e.length)
        )
          return !1;
        for (i = n = 0, o = t.length; o > n; i = ++n)
          if (((r = t[i]), r !== e[i])) return !1;
        return !0;
      },
      objectsAreEqual: function(t, e) {
        var n, i;
        if (
          (null == t && (t = {}),
          null == e && (e = {}),
          Object.keys(t).length !== Object.keys(e).length)
        )
          return !1;
        for (n in t) if (((i = t[n]), i !== e[n])) return !1;
        return !0;
      },
      summarizeArrayChange: function(t, e) {
        var n, i, o, r, s, a, u, c, l, h, p;
        for (
          null == t && (t = []),
            null == e && (e = []),
            n = [],
            h = [],
            o = new Set(),
            r = 0,
            u = t.length;
          u > r;
          r++
        )
          (p = t[r]), o.add(p);
        for (i = new Set(), s = 0, c = e.length; c > s; s++)
          (p = e[s]), i.add(p), o.has(p) || n.push(p);
        for (a = 0, l = t.length; l > a; a++) (p = t[a]), i.has(p) || h.push(p);
        return { added: n, removed: h };
      }
    });
  }.call(this),
  function() {
    var t, e, n, i, o;
    (t = document.documentElement),
      (e =
        null !=
        (n =
          null !=
          (i = null != (o = t.matchesSelector) ? o : t.webkitMatchesSelector)
            ? i
            : t.msMatchesSelector)
          ? n
          : t.mozMatchesSelector),
      Trix.extend({
        handleEvent: function(e, n) {
          var i, o, r, s, a, u, c, l, h, p, d, f;
          return (
            (l = null != n ? n : {}),
            (u = l.onElement),
            (a = l.matchingSelector),
            (f = l.withCallback),
            (s = l.inPhase),
            (c = l.preventDefault),
            (p = l.times),
            (o = null != u ? u : t),
            (h = a),
            (i = f),
            (d = "capturing" === s),
            (r = function(t) {
              var e;
              return (
                null != p && 0 === --p && r.destroy(),
                (e = Trix.findClosestElementFromNode(t.target, {
                  matchingSelector: h
                })),
                null != e && (null != f && f.call(e, t, e), c)
                  ? t.preventDefault()
                  : void 0
              );
            }),
            (r.destroy = function() {
              return o.removeEventListener(e, r, d);
            }),
            o.addEventListener(e, r, d),
            r
          );
        },
        handleEventOnce: function(t, e) {
          return null == e && (e = {}), (e.times = 1), Trix.handleEvent(t, e);
        },
        triggerEvent: function(e, n) {
          var i, o, r, s, a, u, c;
          return (
            (c = null != n ? n : {}),
            (u = c.onElement),
            (o = c.bubbles),
            (r = c.cancelable),
            (i = c.attributes),
            (s = null != u ? u : t),
            (o = o !== !1),
            (r = r !== !1),
            (a = document.createEvent("Events")),
            a.initEvent(e, o, r),
            null != i && Trix.extend.call(a, i),
            s.dispatchEvent(a)
          );
        },
        elementMatchesSelector: function(t, n) {
          return 1 === (null != t ? t.nodeType : void 0)
            ? e.call(t, n)
            : void 0;
        },
        findClosestElementFromNode: function(t, e) {
          var n;
          for (
            n = (null != e ? e : {}).matchingSelector;
            null != t && t.nodeType !== Node.ELEMENT_NODE;

          )
            t = t.parentNode;
          if (null == n) return t;
          for (; t; ) {
            if (Trix.elementMatchesSelector(t, n)) return t;
            t = t.parentNode;
          }
        },
        findInnerElement: function(t) {
          for (; null != t ? t.firstElementChild : void 0; )
            t = t.firstElementChild;
          return t;
        },
        innerElementIsActive: function(t) {
          return (
            document.activeElement !== t &&
            Trix.elementContainsNode(t, document.activeElement)
          );
        },
        elementContainsNode: function(t, e) {
          if (t && e)
            for (; e; ) {
              if (e === t) return !0;
              e = e.parentNode;
            }
        },
        findNodeFromContainerAndOffset: function(t, e) {
          var n;
          if (t)
            return t.nodeType === Node.TEXT_NODE
              ? t
              : 0 === e
                ? null != (n = t.firstChild)
                  ? n
                  : t
                : t.childNodes.item(e - 1);
        },
        findElementFromContainerAndOffset: function(t, e) {
          var n;
          return (
            (n = Trix.findNodeFromContainerAndOffset(t, e)),
            Trix.findClosestElementFromNode(n)
          );
        },
        findChildIndexOfNode: function(t) {
          var e;
          if (null != t ? t.parentNode : void 0) {
            for (e = 0; (t = t.previousSibling); ) e++;
            return e;
          }
        },
        measureElement: function(t) {
          return { width: t.offsetWidth, height: t.offsetHeight };
        },
        walkTree: function(t, e) {
          var n, i, o, r, s;
          return (
            (o = null != e ? e : {}),
            (i = o.onlyNodesOfType),
            (r = o.usingFilter),
            (n = o.expandEntityReferences),
            (s = (function() {
              switch (i) {
                case "element":
                  return NodeFilter.SHOW_ELEMENT;
                case "text":
                  return NodeFilter.SHOW_TEXT;
                case "comment":
                  return NodeFilter.SHOW_COMMENT;
                default:
                  return NodeFilter.SHOW_ALL;
              }
            })()),
            document.createTreeWalker(t, s, null != r ? r : null, n === !0)
          );
        },
        tagName: function(t) {
          var e;
          return null != t && null != (e = t.tagName)
            ? e.toLowerCase()
            : void 0;
        },
        makeElement: function(t, e) {
          var n, i, o, r, s, a, u, c, l, h;
          if (
            (null == e && (e = {}),
            "object" == typeof t
              ? ((e = t), (t = e.tagName))
              : (e = { attributes: e }),
            (i = document.createElement(t)),
            null != e.editable &&
              (null == e.attributes && (e.attributes = {}),
              (e.attributes.contenteditable = e.editable)),
            e.attributes)
          ) {
            a = e.attributes;
            for (r in a) (h = a[r]), i.setAttribute(r, h);
          }
          if (e.style) {
            u = e.style;
            for (r in u) (h = u[r]), (i.style[r] = h);
          }
          if (e.data) {
            c = e.data;
            for (r in c) (h = c[r]), (i.dataset[r] = h);
          }
          if (e.className)
            for (l = e.className.split(" "), o = 0, s = l.length; s > o; o++)
              (n = l[o]), i.classList.add(n);
          return e.textContent && (i.textContent = e.textContent), i;
        },
        cloneFragment: function(t) {
          var e, n, i, o, r;
          for (
            e = document.createDocumentFragment(),
              r = t.childNodes,
              n = 0,
              i = r.length;
            i > n;
            n++
          )
            (o = r[n]), e.appendChild(o.cloneNode(!0));
          return e;
        },
        makeFragment: function(t) {
          var e, n, i;
          for (
            null == t && (t = ""),
              e = document.createElement("div"),
              e.innerHTML = t,
              n = document.createDocumentFragment();
            (i = e.firstChild);

          )
            n.appendChild(i);
          return n;
        },
        nodeIsBlockContainer: function(t) {
          return Trix.nodeIsBlockStartComment(
            null != t ? t.firstChild : void 0
          );
        },
        nodeIsBlockStartComment: function(t) {
          return (
            Trix.nodeIsCommentNode(t) &&
            "block" === (null != t ? t.data : void 0)
          );
        },
        nodeIsCommentNode: function(t) {
          return (null != t ? t.nodeType : void 0) === Node.COMMENT_NODE;
        },
        nodeIsCursorTarget: function(t) {
          return t
            ? Trix.nodeIsTextNode(t)
              ? t.data === Trix.ZERO_WIDTH_SPACE
              : Trix.nodeIsCursorTarget(t.firstChild)
            : void 0;
        },
        nodeIsAttachmentElement: function(t) {
          return Trix.elementMatchesSelector(
            t,
            Trix.AttachmentView.attachmentSelector
          );
        },
        nodeIsEmptyTextNode: function(t) {
          return Trix.nodeIsTextNode(t) && "" === (null != t ? t.data : void 0);
        },
        nodeIsTextNode: function(t) {
          return (null != t ? t.nodeType : void 0) === Node.TEXT_NODE;
        }
      });
  }.call(this),
  function() {
    var t,
      e = function(t, e) {
        function i() {
          this.constructor = t;
        }
        for (var o in e) n.call(e, o) && (t[o] = e[o]);
        return (
          (i.prototype = e.prototype),
          (t.prototype = new i()),
          (t.__super__ = e.prototype),
          t
        );
      },
      n = {}.hasOwnProperty;
    (t = Trix.arraysAreEqual),
      (Trix.Hash = (function(n) {
        function i(t) {
          null == t && (t = {}),
            (this.values = r(t)),
            i.__super__.constructor.apply(this, arguments);
        }
        var o, r, s, a, u;
        return (
          e(i, n),
          (i.fromCommonAttributesOfObjects = function(t) {
            var e, n, i, r, s, a;
            if ((null == t && (t = []), !t.length)) return new this();
            for (
              e = o(t[0]), i = e.getKeys(), a = t.slice(1), n = 0, r = a.length;
              r > n;
              n++
            )
              (s = a[n]), (i = e.getKeysCommonToHash(o(s))), (e = e.slice(i));
            return e;
          }),
          (i.box = function(t) {
            return o(t);
          }),
          (i.prototype.add = function(t, e) {
            return this.merge(a(t, e));
          }),
          (i.prototype.remove = function(t) {
            return new Trix.Hash(r(this.values, t));
          }),
          (i.prototype.get = function(t) {
            return this.values[t];
          }),
          (i.prototype.has = function(t) {
            return t in this.values;
          }),
          (i.prototype.merge = function(t) {
            return new Trix.Hash(s(this.values, u(t)));
          }),
          (i.prototype.slice = function(t) {
            var e, n, i, o;
            for (o = {}, e = 0, i = t.length; i > e; e++)
              (n = t[e]), this.has(n) && (o[n] = this.values[n]);
            return new Trix.Hash(o);
          }),
          (i.prototype.getKeys = function() {
            return Object.keys(this.values);
          }),
          (i.prototype.getKeysCommonToHash = function(t) {
            var e, n, i, r, s;
            for (
              t = o(t), r = this.getKeys(), s = [], e = 0, i = r.length;
              i > e;
              e++
            )
              (n = r[e]), this.values[n] === t.values[n] && s.push(n);
            return s;
          }),
          (i.prototype.isEqualTo = function(e) {
            return t(this.toArray(), o(e).toArray());
          }),
          (i.prototype.isEmpty = function() {
            return 0 === this.getKeys().length;
          }),
          (i.prototype.toArray = function() {
            var t, e, n;
            return (null != this.array
              ? this.array
              : (this.array = function() {
                  var i;
                  (e = []), (i = this.values);
                  for (t in i) (n = i[t]), e.push(t, n);
                  return e;
                }.call(this))
            ).slice(0);
          }),
          (i.prototype.toObject = function() {
            return r(this.values);
          }),
          (i.prototype.toJSON = function() {
            return this.toObject();
          }),
          (i.prototype.contentsForInspection = function() {
            return { values: JSON.stringify(this.values) };
          }),
          (a = function(t, e) {
            var n;
            return (n = {}), (n[t] = e), n;
          }),
          (s = function(t, e) {
            var n, i, o;
            i = r(t);
            for (n in e) (o = e[n]), (i[n] = o);
            return i;
          }),
          (r = function(t, e) {
            var n, i, o, r, s;
            for (
              r = {}, s = Object.keys(t).sort(), n = 0, o = s.length;
              o > n;
              n++
            )
              (i = s[n]), i !== e && (r[i] = t[i]);
            return r;
          }),
          (o = function(t) {
            return t instanceof Trix.Hash ? t : new Trix.Hash(t);
          }),
          (u = function(t) {
            return t instanceof Trix.Hash ? t.values : t;
          }),
          i
        );
      })(Trix.Object));
  }.call(this),
  function() {
    var t, e, n;
    Trix.extend({
      normalizeRange: (e = function(e) {
        var n;
        if (null != e)
          return (
            Array.isArray(e) || (e = [e, e]),
            [t(e[0]), t(null != (n = e[1]) ? n : e[0])]
          );
      }),
      rangeIsCollapsed: function(t) {
        var i, o, r;
        if (null != t) return (o = e(t)), (r = o[0]), (i = o[1]), n(r, i);
      },
      rangesAreEqual: function(t, i) {
        var o, r, s, a, u, c;
        if (null != t && null != i)
          return (
            (s = e(t)),
            (r = s[0]),
            (o = s[1]),
            (a = e(i)),
            (c = a[0]),
            (u = a[1]),
            n(r, c) && n(o, u)
          );
      }
    }),
      (t = function(t) {
        return "number" == typeof t ? t : Trix.Hash.box(t).toObject();
      }),
      (n = function(t, e) {
        return "number" == typeof t
          ? t === e
          : Trix.Hash.box(t).isEqualTo(Trix.Hash.box(e));
      });
  }.call(this),
  function() {
    var t, e, n, i;
    (t = { extendsTagName: "div", css: "%t { display: block; }" }),
      (Trix.registerElement = function(e, o) {
        var r, s, a, u, c, l, h;
        return (
          null == o && (o = {}),
          (e = e.toLowerCase()),
          (c = i(o)),
          (u = null != (h = c.extendsTagName) ? h : t.extendsTagName),
          delete c.extendsTagName,
          (s = c.defaultCSS),
          delete c.defaultCSS,
          null != s && u === t.extendsTagName
            ? (s += "\n" + t.css)
            : (s = t.css),
          n(s, e),
          (a = Object.getPrototypeOf(document.createElement(u))),
          (a.__super__ = a),
          (l = Object.create(a, c)),
          (r = document.registerElement(e, { prototype: l })),
          Object.defineProperty(l, "constructor", { value: r }),
          r
        );
      }),
      (n = function(t, n) {
        var i;
        return (i = e(n)), (i.textContent = t.replace(/%t/g, n));
      }),
      (e = function(t) {
        var e;
        return (
          (e = document.createElement("style")),
          e.setAttribute("type", "text/css"),
          e.setAttribute("data-tag-name", t.toLowerCase()),
          document.head.insertBefore(e, document.head.firstChild),
          e
        );
      }),
      (i = function(t) {
        var e, n, i;
        n = {};
        for (e in t)
          (i = t[e]), (n[e] = "function" == typeof i ? { value: i } : i);
        return n;
      });
  }.call(this),
  function() {}.call(this),
  function() {
    Trix.ObjectGroup = (function() {
      function t(t, e) {
        var n, i;
        (this.objects = null != t ? t : []),
          (i = e.depth),
          (n = e.asTree),
          n &&
            ((this.depth = i),
            (this.objects = this.constructor.groupObjects(this.objects, {
              asTree: n,
              depth: this.depth + 1
            })));
      }
      return (
        (t.groupObjects = function(t, e) {
          var n, i, o, r, s, a, u, c, l;
          for (
            null == t && (t = []),
              l = null != e ? e : {},
              o = l.depth,
              n = l.asTree,
              n && null == o && (o = 0),
              c = [],
              s = 0,
              a = t.length;
            a > s;
            s++
          ) {
            if (((u = t[s]), r)) {
              if (
                ("function" == typeof u.canBeGrouped
                  ? u.canBeGrouped(o)
                  : void 0) &&
                ("function" == typeof (i = r[r.length - 1]).canBeGroupedWith
                  ? i.canBeGroupedWith(u, o)
                  : void 0)
              ) {
                r.push(u);
                continue;
              }
              c.push(new this(r, { depth: o, asTree: n })), (r = null);
            }
            ("function" == typeof u.canBeGrouped
            ? u.canBeGrouped(o)
            : void 0)
              ? (r = [u])
              : c.push(u);
          }
          return r && c.push(new this(r, { depth: o, asTree: n })), c;
        }),
        (t.prototype.getObjects = function() {
          return this.objects;
        }),
        (t.prototype.getDepth = function() {
          return this.depth;
        }),
        (t.prototype.getCacheKey = function() {
          var t, e, n, i, o;
          for (
            e = ["objectGroup"], o = this.getObjects(), t = 0, n = o.length;
            n > t;
            t++
          )
            (i = o[t]), e.push(i.getCacheKey());
          return e.join("/");
        }),
        t
      );
    })();
  }.call(this),
  function() {
    var t = function(t, n) {
        function i() {
          this.constructor = t;
        }
        for (var o in n) e.call(n, o) && (t[o] = n[o]);
        return (
          (i.prototype = n.prototype),
          (t.prototype = new i()),
          (t.__super__ = n.prototype),
          t
        );
      },
      e = {}.hasOwnProperty;
    Trix.ObjectMap = (function(e) {
      function n(t) {
        var e, n, i, o, r;
        for (
          null == t && (t = []), this.objects = {}, i = 0, o = t.length;
          o > i;
          i++
        )
          (r = t[i]),
            (n = JSON.stringify(r)),
            null == (e = this.objects)[n] && (e[n] = r);
      }
      return (
        t(n, e),
        (n.prototype.find = function(t) {
          var e;
          return (e = JSON.stringify(t)), this.objects[e];
        }),
        n
      );
    })(Trix.BasicObject);
  }.call(this),
  function() {
    Trix.ElementStore = (function() {
      function t(t) {
        this.reset(t);
      }
      var e;
      return (
        (t.prototype.add = function(t) {
          var n;
          return (n = e(t)), (this.elements[n] = t);
        }),
        (t.prototype.remove = function(t) {
          var n, i;
          return (
            (n = e(t)),
            (i = this.elements[n]) ? (delete this.elements[n], i) : void 0
          );
        }),
        (t.prototype.reset = function(t) {
          var e, n, i;
          for (
            null == t && (t = []), this.elements = {}, n = 0, i = t.length;
            i > n;
            n++
          )
            (e = t[n]), this.add(e);
          return t;
        }),
        (e = function(t) {
          return t.dataset.trixStoreKey;
        }),
        t
      );
    })();
  }.call(this),
  function() {}.call(this),
  function() {
    var t = function(t, n) {
        function i() {
          this.constructor = t;
        }
        for (var o in n) e.call(n, o) && (t[o] = n[o]);
        return (
          (i.prototype = n.prototype),
          (t.prototype = new i()),
          (t.__super__ = n.prototype),
          t
        );
      },
      e = {}.hasOwnProperty;
    Trix.Operation = (function(e) {
      function n() {
        return n.__super__.constructor.apply(this, arguments);
      }
      return (
        t(n, e),
        (n.prototype.isPerforming = function() {
          return this.performing === !0;
        }),
        (n.prototype.hasPerformed = function() {
          return this.performed === !0;
        }),
        (n.prototype.hasSucceeded = function() {
          return this.performed && this.succeeded;
        }),
        (n.prototype.hasFailed = function() {
          return this.performed && !this.succeeded;
        }),
        (n.prototype.getPromise = function() {
          return null != this.promise
            ? this.promise
            : (this.promise = new Promise(
                (function(t) {
                  return function(e, n) {
                    return (
                      (t.performing = !0),
                      t.perform(function(i, o) {
                        return (
                          (t.succeeded = i),
                          (t.performing = !1),
                          (t.performed = !0),
                          t.succeeded ? e(o) : n(o)
                        );
                      })
                    );
                  };
                })(this)
              ));
        }),
        (n.prototype.perform = function(t) {
          return t(!1);
        }),
        (n.prototype.release = function() {
          var t;
          return (
            null != (t = this.promise) &&
              "function" == typeof t.cancel &&
              t.cancel(),
            (this.promise = null),
            (this.performing = null),
            (this.performed = null),
            (this.succeeded = null)
          );
        }),
        n.proxyMethod("getPromise().then"),
        n.proxyMethod("getPromise().catch"),
        n
      );
    })(Trix.BasicObject);
  }.call(this),
  function() {
    var t,
      e,
      n,
      i,
      o,
      r = function(t, e) {
        function n() {
          this.constructor = t;
        }
        for (var i in e) s.call(e, i) && (t[i] = e[i]);
        return (
          (n.prototype = e.prototype),
          (t.prototype = new n()),
          (t.__super__ = e.prototype),
          t
        );
      },
      s = {}.hasOwnProperty;
    (Trix.UTF16String = (function(t) {
      function e(t, e) {
        (this.ucs2String = t),
          (this.codepoints = e),
          (this.length = this.codepoints.length),
          (this.ucs2Length = this.ucs2String.length);
      }
      return (
        r(e, t),
        (e.box = function(t) {
          return (
            null == t && (t = ""),
            t instanceof this
              ? t
              : this.fromUCS2String(null != t ? t.toString() : void 0)
          );
        }),
        (e.fromUCS2String = function(t) {
          return new this(t, i(t));
        }),
        (e.fromCodepoints = function(t) {
          return new this(o(t), t);
        }),
        (e.prototype.offsetToUCS2Offset = function(t) {
          return o(this.codepoints.slice(0, Math.max(0, t))).length;
        }),
        (e.prototype.offsetFromUCS2Offset = function(t) {
          return i(this.ucs2String.slice(0, Math.max(0, t))).length;
        }),
        (e.prototype.slice = function() {
          var t;
          return this.constructor.fromCodepoints(
            (t = this.codepoints).slice.apply(t, arguments)
          );
        }),
        (e.prototype.charAt = function(t) {
          return this.slice(t, t + 1);
        }),
        (e.prototype.isEqualTo = function(t) {
          return this.constructor.box(t).ucs2String === this.ucs2String;
        }),
        (e.prototype.toJSON = function() {
          return this.ucs2String;
        }),
        (e.prototype.getCacheKey = function() {
          return this.ucs2String;
        }),
        (e.prototype.toString = function() {
          return this.ucs2String;
        }),
        e
      );
    })(Trix.BasicObject)),
      (t =
        1 ===
        ("function" == typeof Array.from
          ? Array.from("\ud83d\udc7c").length
          : void 0)),
      (e =
        null !=
        ("function" == typeof " ".codePointAt ? " ".codePointAt(0) : void 0)),
      (n =
        " \ud83d\udc7c" ===
        ("function" == typeof String.fromCodePoint
          ? String.fromCodePoint(32, 128124)
          : void 0)),
      (i =
        t && e
          ? function(t) {
              return Array.from(t).map(function(t) {
                return t.codePointAt(0);
              });
            }
          : function(t) {
              var e, n, i, o, r;
              for (o = [], e = 0, i = t.length; i > e; )
                (r = t.charCodeAt(e++)),
                  r >= 55296 &&
                    56319 >= r &&
                    i > e &&
                    ((n = t.charCodeAt(e++)),
                    56320 === (64512 & n)
                      ? (r = ((1023 & r) << 10) + (1023 & n) + 65536)
                      : e--),
                  o.push(r);
              return o;
            }),
      (o = n
        ? function(t) {
            return String.fromCodePoint.apply(String, t);
          }
        : function(t) {
            var e, n, i;
            return (
              (e = (function() {
                var e, o, r;
                for (r = [], e = 0, o = t.length; o > e; e++)
                  (i = t[e]),
                    (n = ""),
                    i > 65535 &&
                      ((i -= 65536),
                      (n += String.fromCharCode(((i >>> 10) & 1023) | 55296)),
                      (i = 56320 | (1023 & i))),
                    r.push(n + String.fromCharCode(i));
                return r;
              })()),
              e.join("")
            );
          });
  }.call(this),
  function() {}.call(this),
  function() {}.call(this),
  function() {
    Trix.config.lang = {
      bold: "Bold",
      bullets: "Bullets",
      byte: "Byte",
      bytes: "Bytes",
      captionPlaceholder: "Type a caption here\u2026",
      code: "Code",
      editCaption: "Edit caption",
      indent: "Increase Level",
      italic: "Italic",
      link: "Link",
      numbers: "Numbers",
      outdent: "Decrease Level",
      quote: "Quote",
      redo: "Redo",
      remove: "Remove",
      strike: "Strikethrough",
      undo: "Undo",
      unlink: "Unlink",
      urlPlaceholder: "Enter a URL\u2026",
      GB: "GB",
      KB: "KB",
      MB: "MB",
      PB: "PB",
      TB: "TB"
    };
  }.call(this),
  function() {
    Trix.config.css = {
      classNames: {
        attachment: {
          container: "attachment",
          typePrefix: "attachment-",
          caption: "caption",
          captionEdited: "caption-edited",
          captionEditor: "caption-editor",
          editingCaption: "caption-editing",
          progressBar: "progress",
          removeButton: "remove",
          size: "size"
        }
      }
    };
  }.call(this),
  function() {
    var t;
    Trix.config.blockAttributes = t = {
      default: { tagName: "div", parse: !1 },
      quote: { tagName: "blockquote", nestable: !0 },
      code: { tagName: "pre", text: { plaintext: !0 } },
      bulletList: { tagName: "ul", parse: !1 },
      bullet: {
        tagName: "li",
        listAttribute: "bulletList",
        test: function(e) {
          return Trix.tagName(e.parentNode) === t[this.listAttribute].tagName;
        }
      },
      numberList: { tagName: "ol", parse: !1 },
      number: {
        tagName: "li",
        listAttribute: "numberList",
        test: function(e) {
          return Trix.tagName(e.parentNode) === t[this.listAttribute].tagName;
        }
      }
    };
  }.call(this),
  function() {
    var t, e;
    (t = Trix.config.lang),
      (e = [t.bytes, t.KB, t.MB, t.GB, t.TB, t.PB]),
      (Trix.config.fileSize = {
        prefix: "IEC",
        precision: 2,
        formatter: function(n) {
          var i, o, r, s, a;
          switch (n) {
            case 0:
              return "0 " + t.bytes;
            case 1:
              return "1 " + t.byte;
            default:
              return (
                (i = function() {
                  switch (this.prefix) {
                    case "SI":
                      return 1e3;
                    case "IEC":
                      return 1024;
                  }
                }.call(this)),
                (o = Math.floor(Math.log(n) / Math.log(i))),
                (r = n / Math.pow(i, o)),
                (s = r.toFixed(this.precision)),
                (a = s.replace(/0*$/, "").replace(/\.$/, "")),
                a + " " + e[o]
              );
          }
        }
      });
  }.call(this),
  function() {
    Trix.config.textAttributes = {
      bold: {
        tagName: "strong",
        inheritable: !0,
        parser: function(t) {
          var e;
          return (
            (e = window.getComputedStyle(t)),
            "bold" === e.fontWeight || e.fontWeight >= 700
          );
        }
      },
      italic: {
        tagName: "em",
        inheritable: !0,
        parser: function(t) {
          var e;
          return (e = window.getComputedStyle(t)), "italic" === e.fontStyle;
        }
      },
      href: {
        groupTagName: "a",
        parser: function(t) {
          var e, n, i;
          return (
            (e = Trix.AttachmentView.attachmentSelector),
            (i = "a:not(" + e + ")"),
            (n = Trix.findClosestElementFromNode(t, { matchingSelector: i }))
              ? n.getAttribute("href")
              : void 0
          );
        }
      },
      strike: { tagName: "del", inheritable: !0 },
      frozen: { style: { backgroundColor: "highlight" } }
    };
  }.call(this),
  function() {
    var t, e, n, i, o;
    (o = "[data-trix-serialize=false]"),
      (i = [
        "contenteditable",
        "data-trix-id",
        "data-trix-store-key",
        "data-trix-mutable"
      ]),
      (e = "data-trix-serialized-attributes"),
      (n = "[" + e + "]"),
      (t = new RegExp("<!--block-->", "g")),
      Trix.extend({
        serializers: {
          "application/json": function(t) {
            var e;
            if (t instanceof Trix.Document) e = t;
            else {
              if (!(t instanceof HTMLElement))
                throw new Error("unserializable object");
              e = Trix.Document.fromHTML(t.innerHTML);
            }
            return e.toSerializableDocument().toJSONString();
          },
          "text/html": function(r) {
            var s, a, u, c, l, h, p, d, f, g, m, y, v, b, A, x, T;
            if (r instanceof Trix.Document) c = Trix.DocumentView.render(r);
            else {
              if (!(r instanceof HTMLElement))
                throw new Error("unserializable object");
              c = r.cloneNode(!0);
            }
            for (b = c.querySelectorAll(o), l = 0, f = b.length; f > l; l++)
              (u = b[l]), u.parentNode.removeChild(u);
            for (h = 0, g = i.length; g > h; h++)
              for (
                s = i[h],
                  A = c.querySelectorAll("[" + s + "]"),
                  p = 0,
                  m = A.length;
                m > p;
                p++
              )
                (u = A[p]), u.removeAttribute(s);
            for (x = c.querySelectorAll(n), d = 0, y = x.length; y > d; d++) {
              u = x[d];
              try {
                (a = JSON.parse(u.getAttribute(e))), u.removeAttribute(e);
                for (v in a) (T = a[v]), u.setAttribute(v, T);
              } catch (C) {}
            }
            return c.innerHTML.replace(t, "");
          }
        },
        deserializers: {
          "application/json": function(t) {
            return Trix.Document.fromJSONString(t);
          },
          "text/html": function(t) {
            return Trix.Document.fromHTML(t);
          }
        },
        serializeToContentType: function(t, e) {
          var n;
          if ((n = Trix.serializers[e])) return n(t);
          throw new Error("unknown content type: " + e);
        },
        deserializeFromContentType: function(t, e) {
          var n;
          if ((n = Trix.deserializers[e])) return n(t);
          throw new Error("unknown content type: " + e);
        }
      });
  }.call(this),
  function() {
    var t, e;
    (e = Trix.makeFragment),
      (t = Trix.config.lang),
      (Trix.config.toolbar = {
        content: e(
          '<div class="button_groups">\n  <span class="button_group text_tools">\n    <button type="button" class="bold" data-attribute="bold" data-key="b" title="' +
            t.bold +
            '">' +
            t.bold +
            '</button>\n    <button type="button" class="italic" data-attribute="italic" data-key="i" title="' +
            t.italic +
            '">' +
            t.italic +
            '</button>\n    <button type="button" class="strike" data-attribute="strike" title="' +
            t.strike +
            '">' +
            t.strike +
            '</button>\n    <button type="button" class="link" data-attribute="href" data-action="link" data-key="k" title="' +
            t.link +
            '">' +
            t.link +
            '</button>\n  </span>\n\n  <span class="button_group block_tools">\n' +
            '<button type="button" class="list bullets" data-attribute="bullet" title="' +
            t.bullets +
            '">' +
            t.bullets +
            '</button>\n    <button type="button" class="list numbers" data-attribute="number" title="' +
            t.numbers +
            '">' +
            t.numbers +
            '</button>\n    <button type="button" class="block-level decrease" data-action="decreaseBlockLevel" title="' +
            t.outdent +
            '">' +
            t.outdent +
            '</button>\n    <button type="button" class="block-level increase" data-action="increaseBlockLevel" title="' +
            t.indent +
            '">' +
            t.indent +
            '</button>\n  </span>\n\n  <span class="button_group history_tools">\n    <button type="button" class="undo" data-action="undo" data-key="z" title="' +
            t.undo +
            '">' +
            t.undo +
            '</button>\n    <button type="button" class="redo" data-action="redo" data-key="shift+z" title="' +
            t.redo +
            '">' +
            t.redo +
            '</button>\n  </span>\n</div>\n\n<div class="dialogs">\n  <div class="dialog link_dialog" data-attribute="href" data-dialog="href">\n    <div class="link_url_fields">\n      <input type="url" required name="href" placeholder="' +
            t.urlPlaceholder +
            '">\n      <div class="button_group">\n        <input type="button" value="' +
            t.link +
            '" data-method="setAttribute">\n        <input type="button" value="' +
            t.unlink +
            '" data-method="removeAttribute">\n      </div>\n    </div>\n  </div>\n</div>'
        )
      });
  }.call(this),
  function() {
    Trix.config.undoInterval = 5e3;
  }.call(this),
  function() {}.call(this),
  function() {
    var t;
    (t = Trix.cloneFragment),
      Trix.registerElement("trix-toolbar", {
        defaultCSS:
          "%t {\n  white-space: collapse;\n}\n\n%t .dialog {\n  display: none;\n}\n\n%t .dialog.active {\n  display: block;\n}\n\n%t .dialog input.validate:invalid {\n  background-color: #ffdddd;\n}\n\n%t[native] {\n  display: none;\n}",
        createdCallback: function() {
          return "" === this.innerHTML
            ? this.appendChild(t(Trix.config.toolbar.content))
            : void 0;
        }
      });
  }.call(this),
  function() {
    var t = function(t, n) {
        function i() {
          this.constructor = t;
        }
        for (var o in n) e.call(n, o) && (t[o] = n[o]);
        return (
          (i.prototype = n.prototype),
          (t.prototype = new i()),
          (t.__super__ = n.prototype),
          t
        );
      },
      e = {}.hasOwnProperty,
      n =
        [].indexOf ||
        function(t) {
          for (var e = 0, n = this.length; n > e; e++)
            if (e in this && this[e] === t) return e;
          return -1;
        };
    Trix.ObjectView = (function(e) {
      function i(t, e) {
        (this.object = t),
          (this.options = null != e ? e : {}),
          (this.childViews = []),
          (this.rootView = this);
      }
      return (
        t(i, e),
        (i.prototype.getNodes = function() {
          var t, e, n, i, o;
          for (
            null == this.nodes && (this.nodes = this.createNodes()),
              i = this.nodes,
              o = [],
              t = 0,
              e = i.length;
            e > t;
            t++
          )
            (n = i[t]), o.push(n.cloneNode(!0));
          return o;
        }),
        (i.prototype.invalidate = function() {
          var t;
          return (
            (this.nodes = null),
            null != (t = this.parentView) ? t.invalidate() : void 0
          );
        }),
        (i.prototype.invalidateViewForObject = function(t) {
          var e;
          return null != (e = this.findViewForObject(t))
            ? e.invalidate()
            : void 0;
        }),
        (i.prototype.findOrCreateCachedChildView = function(t, e) {
          var n;
          return (
            (n = this.getCachedViewForObject(e))
              ? this.recordChildView(n)
              : ((n = this.createChildView.apply(this, arguments)),
                this.cacheViewForObject(n, e)),
            n
          );
        }),
        (i.prototype.createChildView = function(t, e, n) {
          var i;
          return (
            null == n && (n = {}),
            e instanceof Trix.ObjectGroup &&
              ((n.viewClass = t), (t = Trix.ObjectGroupView)),
            (i = new t(e, n)),
            this.recordChildView(i)
          );
        }),
        (i.prototype.recordChildView = function(t) {
          return (
            (t.parentView = this),
            (t.rootView = this.rootView),
            this.childViews.push(t),
            t
          );
        }),
        (i.prototype.getAllChildViews = function() {
          var t, e, n, i, o;
          for (o = [], i = this.childViews, e = 0, n = i.length; n > e; e++)
            (t = i[e]), o.push(t), (o = o.concat(t.getAllChildViews()));
          return o;
        }),
        (i.prototype.findElement = function() {
          return this.findElementForObject(this.object);
        }),
        (i.prototype.findElementForObject = function(t) {
          var e;
          return (e = null != t ? t.id : void 0)
            ? this.rootView.element.querySelector("[data-trix-id='" + e + "']")
            : void 0;
        }),
        (i.prototype.findViewForObject = function(t) {
          var e, n, i, o;
          for (i = this.getAllChildViews(), e = 0, n = i.length; n > e; e++)
            if (((o = i[e]), o.object === t)) return o;
        }),
        (i.prototype.getViewCache = function() {
          return this.rootView !== this
            ? this.rootView.getViewCache()
            : this.isViewCachingEnabled()
              ? null != this.viewCache
                ? this.viewCache
                : (this.viewCache = {})
              : void 0;
        }),
        (i.prototype.isViewCachingEnabled = function() {
          return this.shouldCacheViews !== !1;
        }),
        (i.prototype.enableViewCaching = function() {
          return (this.shouldCacheViews = !0);
        }),
        (i.prototype.disableViewCaching = function() {
          return (this.shouldCacheViews = !1);
        }),
        (i.prototype.getCachedViewForObject = function(t) {
          var e;
          return null != (e = this.getViewCache())
            ? e[t.getCacheKey()]
            : void 0;
        }),
        (i.prototype.cacheViewForObject = function(t, e) {
          var n;
          return null != (n = this.getViewCache())
            ? (n[e.getCacheKey()] = t)
            : void 0;
        }),
        (i.prototype.garbageCollectCachedViews = function() {
          var t, e, i, o, r, s;
          if ((t = this.getViewCache())) {
            (s = this.getAllChildViews().concat(this)),
              (i = (function() {
                var t, e, n;
                for (n = [], t = 0, e = s.length; e > t; t++)
                  (r = s[t]), n.push(r.object.getCacheKey());
                return n;
              })()),
              (o = []);
            for (e in t) n.call(i, e) < 0 && o.push(delete t[e]);
            return o;
          }
        }),
        i
      );
    })(Trix.BasicObject);
  }.call(this),
  function() {
    var t = function(t, n) {
        function i() {
          this.constructor = t;
        }
        for (var o in n) e.call(n, o) && (t[o] = n[o]);
        return (
          (i.prototype = n.prototype),
          (t.prototype = new i()),
          (t.__super__ = n.prototype),
          t
        );
      },
      e = {}.hasOwnProperty;
    Trix.ObjectGroupView = (function(e) {
      function n() {
        n.__super__.constructor.apply(this, arguments),
          (this.objectGroup = this.object),
          (this.viewClass = this.options.viewClass),
          delete this.options.viewClass;
      }
      return (
        t(n, e),
        (n.prototype.getChildViews = function() {
          var t, e, n, i;
          if (!this.childViews.length)
            for (
              i = this.objectGroup.getObjects(), t = 0, e = i.length;
              e > t;
              t++
            )
              (n = i[t]),
                this.findOrCreateCachedChildView(
                  this.viewClass,
                  n,
                  this.options
                );
          return this.childViews;
        }),
        (n.prototype.createNodes = function() {
          var t, e, n, i, o, r, s, a, u;
          for (
            t = this.createContainerElement(),
              s = this.getChildViews(),
              e = 0,
              i = s.length;
            i > e;
            e++
          )
            for (u = s[e], a = u.getNodes(), n = 0, o = a.length; o > n; n++)
              (r = a[n]), t.appendChild(r);
          return [t];
        }),
        (n.prototype.createContainerElement = function(t) {
          return (
            null == t && (t = this.objectGroup.getDepth()),
            this.getChildViews()[0].createContainerElement(t)
          );
        }),
        n
      );
    })(Trix.ObjectView);
  }.call(this),
  function() {
    var t = function(t, n) {
        function i() {
          this.constructor = t;
        }
        for (var o in n) e.call(n, o) && (t[o] = n[o]);
        return (
          (i.prototype = n.prototype),
          (t.prototype = new i()),
          (t.__super__ = n.prototype),
          t
        );
      },
      e = {}.hasOwnProperty;
    Trix.Controller = (function(e) {
      function n() {
        return n.__super__.constructor.apply(this, arguments);
      }
      return t(n, e), n;
    })(Trix.BasicObject);
  }.call(this),
  function() {
    var t,
      e,
      n,
      i,
      o,
      r = function(t, e) {
        return function() {
          return t.apply(e, arguments);
        };
      },
      s = function(t, e) {
        function n() {
          this.constructor = t;
        }
        for (var i in e) a.call(e, i) && (t[i] = e[i]);
        return (
          (n.prototype = e.prototype),
          (t.prototype = new n()),
          (t.__super__ = e.prototype),
          t
        );
      },
      a = {}.hasOwnProperty,
      u =
        [].indexOf ||
        function(t) {
          for (var e = 0, n = this.length; n > e; e++)
            if (e in this && this[e] === t) return e;
          return -1;
        };
    (t = Trix.defer),
      (e = Trix.findClosestElementFromNode),
      (n = Trix.nodeIsEmptyTextNode),
      (i = Trix.normalizeSpaces),
      (o = Trix.summarizeStringChange),
      (Trix.MutationObserver = (function(t) {
        function a(t) {
          (this.element = t),
            (this.didMutate = r(this.didMutate, this)),
            (this.observer = new window.MutationObserver(this.didMutate)),
            this.start();
        }
        var c, l;
        return (
          s(a, t),
          (c = "[data-trix-mutable]"),
          (l = {
            attributes: !0,
            childList: !0,
            characterData: !0,
            characterDataOldValue: !0,
            subtree: !0
          }),
          (a.prototype.start = function() {
            return this.reset(), this.observer.observe(this.element, l);
          }),
          (a.prototype.stop = function() {
            return this.observer.disconnect();
          }),
          (a.prototype.didMutate = function(t) {
            var e, n;
            return (
              (e = this.mutations).push.apply(
                e,
                this.findSignificantMutations(t)
              ),
              this.mutations.length
                ? (null != (n = this.delegate) &&
                    "function" == typeof n.elementDidMutate &&
                    n.elementDidMutate(this.getMutationSummary()),
                  this.reset())
                : void 0
            );
          }),
          (a.prototype.reset = function() {
            return (this.mutations = []);
          }),
          (a.prototype.findSignificantMutations = function(t) {
            var e, n, i, o;
            for (o = [], e = 0, n = t.length; n > e; e++)
              (i = t[e]), this.mutationIsSignificant(i) && o.push(i);
            return o;
          }),
          (a.prototype.mutationIsSignificant = function(t) {
            var e, n, i, o;
            for (
              o = this.nodesModifiedByMutation(t), e = 0, n = o.length;
              n > e;
              e++
            )
              if (((i = o[e]), this.nodeIsSignificant(i))) return !0;
            return !1;
          }),
          (a.prototype.nodeIsSignificant = function(t) {
            return t !== this.element && !this.nodeIsMutable(t) && !n(t);
          }),
          (a.prototype.nodeIsMutable = function(t) {
            return e(t, { matchingSelector: c });
          }),
          (a.prototype.nodesModifiedByMutation = function(t) {
            var e;
            switch (((e = []), t.type)) {
              case "attributes":
                e.push(t.target);
                break;
              case "characterData":
                e.push(t.target.parentNode), e.push(t.target);
                break;
              case "childList":
                e.push.apply(e, t.addedNodes), e.push.apply(e, t.removedNodes);
            }
            return e;
          }),
          (a.prototype.getMutationSummary = function() {
            return this.getTextMutationSummary();
          }),
          (a.prototype.getTextMutationSummary = function() {
            var t, e, n, i, o, r, s, a, c, l, h;
            for (
              a = this.getTextChangesFromCharacterData(),
                n = a.additions,
                o = a.deletions,
                h = this.getTextChangesFromTextNodes(),
                c = h.additions,
                r = 0,
                s = c.length;
              s > r;
              r++
            )
              (e = c[r]), u.call(n, e) < 0 && n.push(e);
            return (
              o.push.apply(o, h.deletions),
              (l = {}),
              (t = n.join("")) && (l.textAdded = t),
              (i = o.join("")) && (l.textDeleted = i),
              l
            );
          }),
          (a.prototype.getMutationsByType = function(t) {
            var e, n, i, o, r;
            for (o = this.mutations, r = [], e = 0, n = o.length; n > e; e++)
              (i = o[e]), i.type === t && r.push(i);
            return r;
          }),
          (a.prototype.getTextChangesFromTextNodes = function() {
            var t, e, n, o, r, s, a, u, c, l, h, p, d, f;
            for (
              l = [],
                h = [],
                p = this.getMutationsByType("childList"),
                t = 0,
                r = p.length;
              r > t;
              t++
            ) {
              for (
                u = p[t], d = u.removedNodes, n = 0, s = d.length;
                s > n;
                n++
              )
                (c = d[n]), c.nodeType === Node.TEXT_NODE && h.push(c);
              for (f = u.addedNodes, o = 0, a = f.length; a > o; o++)
                (c = f[o]), c.nodeType === Node.TEXT_NODE && l.push(c);
            }
            return {
              additions: (function() {
                var t, n, o, r;
                for (r = [], e = t = 0, n = l.length; n > t; e = ++t)
                  (c = l[e]),
                    c.data !== (null != (o = h[e]) ? o.data : void 0) &&
                      r.push(i(c.data));
                return r;
              })(),
              deletions: (function() {
                var t, n, o, r;
                for (r = [], e = t = 0, n = h.length; n > t; e = ++t)
                  (c = h[e]),
                    c.data !== (null != (o = l[e]) ? o.data : void 0) &&
                      r.push(i(c.data));
                return r;
              })()
            };
          }),
          (a.prototype.getTextChangesFromCharacterData = function() {
            var t, e, n, r, s, a, u, c;
            return (
              (e = this.getMutationsByType("characterData")),
              e.length &&
                ((c = e[0]),
                (n = e[e.length - 1]),
                (s = i(c.oldValue)),
                (r = i(n.target.data)),
                (a = o(s, r)),
                (t = a.added),
                (u = a.removed)),
              { additions: t ? [t] : [], deletions: u ? [u] : [] }
            );
          }),
          a
        );
      })(Trix.BasicObject));
  }.call(this),
  function() {
    var t = function(t, n) {
        function i() {
          this.constructor = t;
        }
        for (var o in n) e.call(n, o) && (t[o] = n[o]);
        return (
          (i.prototype = n.prototype),
          (t.prototype = new i()),
          (t.__super__ = n.prototype),
          t
        );
      },
      e = {}.hasOwnProperty;
    Trix.FileVerificationOperation = (function(e) {
      function n(t) {
        this.file = t;
      }
      return (
        t(n, e),
        (n.prototype.perform = function(t) {
          var e;
          return (
            (e = new FileReader()),
            (e.onerror = function() {
              return t(!1);
            }),
            (e.onload = (function(n) {
              return function() {
                e.onerror = null;
                try {
                  e.abort();
                } catch (i) {}
                return t(!0, n.file);
              };
            })(this)),
            e.readAsArrayBuffer(this.file)
          );
        }),
        n
      );
    })(Trix.Operation);
  }.call(this),
  function() {
    var t,
      e,
      n,
      i,
      o,
      r,
      s,
      a,
      u,
      c,
      l,
      h,
      p,
      d,
      f = function(t, e) {
        function n() {
          this.constructor = t;
        }
        for (var i in e) g.call(e, i) && (t[i] = e[i]);
        return (
          (n.prototype = e.prototype),
          (t.prototype = new n()),
          (t.__super__ = e.prototype),
          t
        );
      },
      g = {}.hasOwnProperty,
      m =
        [].indexOf ||
        function(t) {
          for (var e = 0, n = this.length; n > e; e++)
            if (e in this && this[e] === t) return e;
          return -1;
        };
    (r = Trix.handleEvent),
      (i = Trix.findClosestElementFromNode),
      (o = Trix.findElementFromContainerAndOffset),
      (e = Trix.defer),
      (l = Trix.makeElement),
      (s = Trix.innerElementIsActive),
      (p = Trix.summarizeStringChange),
      (Trix.InputController = (function(e) {
        function i(t) {
          var e;
          (this.element = t),
            this.resetInputSummary(),
            (this.mutationObserver = new Trix.MutationObserver(this.element)),
            (this.mutationObserver.delegate = this);
          for (e in this.events)
            r(e, {
              onElement: this.element,
              withCallback: this.handlerFor(e),
              inPhase: "capturing"
            });
        }
        var o;
        return (
          f(i, e),
          (o = 0),
          (i.keyNames = {
            8: "backspace",
            9: "tab",
            13: "return",
            37: "left",
            39: "right",
            46: "delete",
            68: "d",
            72: "h",
            79: "o"
          }),
          (i.prototype.handlerFor = function(t) {
            return (function(e) {
              return function(n) {
                return e.handleInput(function() {
                  return s(this.element)
                    ? void 0
                    : ((this.eventName = t), this.events[t].call(this, n));
                });
              };
            })(this);
          }),
          (i.prototype.setInputSummary = function(t) {
            var e, n;
            null == t && (t = {}),
              (this.inputSummary.eventName = this.eventName);
            for (e in t) (n = t[e]), (this.inputSummary[e] = n);
            return this.inputSummary;
          }),
          (i.prototype.resetInputSummary = function() {
            return (this.inputSummary = {});
          }),
          (i.prototype.editorWillSyncDocumentView = function() {
            return this.mutationObserver.stop();
          }),
          (i.prototype.editorDidSyncDocumentView = function() {
            return this.mutationObserver.start();
          }),
          (i.prototype.requestRender = function() {
            var t;
            return null != (t = this.delegate) &&
              "function" == typeof t.inputControllerDidRequestRender
              ? t.inputControllerDidRequestRender()
              : void 0;
          }),
          (i.prototype.elementDidMutate = function(t) {
            return this.inputSummary.composing
              ? void 0
              : this.handleInput(function() {
                  var e;
                  return (
                    this.mutationIsExpected(t) ||
                      (null != (e = this.responder) &&
                        e.replaceHTML(this.element.innerHTML)),
                    this.resetInputSummary(),
                    this.requestRender(),
                    Trix.selectionChangeObserver.reset()
                  );
                });
          }),
          (i.prototype.mutationIsExpected = function(t) {
            var e, n;
            return this.inputSummary
              ? null != this.inputSummary.preferDocument
                ? this.inputSummary.preferDocument
                : ((e = t.textAdded !== this.inputSummary.textAdded),
                  (n = null != t.textDeleted && !this.inputSummary.didDelete),
                  !(e || n))
              : void 0;
          }),
          (i.prototype.attachFiles = function(t) {
            var e, n;
            return (
              (n = (function() {
                var n, i, o;
                for (o = [], n = 0, i = t.length; i > n; n++)
                  (e = t[n]), o.push(new Trix.FileVerificationOperation(e));
                return o;
              })()),
              Promise.all(n).then(
                (function(t) {
                  return function(n) {
                    return t.handleInput(function() {
                      var t, i, o, r;
                      for (
                        null != (o = this.delegate) &&
                          o.inputControllerWillAttachFiles(),
                          t = 0,
                          i = n.length;
                        i > t;
                        t++
                      )
                        (e = n[t]),
                          null != (r = this.responder) && r.insertFile(e);
                      return this.requestRender();
                    });
                  };
                })(this)
              )
            );
          }),
          (i.prototype.events = {
            keydown: function(t) {
              var e, n, i, o, r, s, u, c, l;
              if (
                (this.inputSummary.composing || this.resetInputSummary(),
                (o = this.constructor.keyNames[t.keyCode]))
              ) {
                for (
                  n = this.keys,
                    c = ["ctrl", "alt", "shift", "meta"],
                    i = 0,
                    s = c.length;
                  s > i;
                  i++
                )
                  (u = c[i]),
                    t[u + "Key"] &&
                      ("ctrl" === u && (u = "control"),
                      (n = null != n ? n[u] : void 0));
                null != (null != n ? n[o] : void 0) &&
                  (this.setInputSummary({ keyName: o }),
                  Trix.selectionChangeObserver.reset(),
                  n[o].call(this, t));
              }
              return a(t) &&
                (e = String.fromCharCode(t.keyCode).toLowerCase()) &&
                ((r = (function() {
                  var e, n, i, o;
                  for (
                    i = ["alt", "shift"], o = [], e = 0, n = i.length;
                    n > e;
                    e++
                  )
                    (u = i[e]), t[u + "Key"] && o.push(u);
                  return o;
                })()),
                r.push(e),
                null != (l = this.delegate)
                  ? l.inputControllerDidReceiveKeyboardCommand(r)
                  : void 0)
                ? t.preventDefault()
                : void 0;
            },
            keypress: function(t) {
              var e, n, i;
              if (
                null == this.inputSummary.eventName &&
                ((!t.metaKey && !t.ctrlKey) || t.altKey) &&
                !c(t) &&
                !u(t)
              )
                return (
                  null === t.which
                    ? (e = String.fromCharCode(t.keyCode))
                    : 0 !== t.which &&
                      0 !== t.charCode &&
                      (e = String.fromCharCode(t.charCode)),
                  null != e
                    ? (null != (n = this.delegate) &&
                        n.inputControllerWillPerformTyping(),
                      null != (i = this.responder) && i.insertString(e),
                      this.setInputSummary({
                        textAdded: e,
                        didDelete: this.selectionIsExpanded()
                      }))
                    : void 0
                );
            },
            dragenter: function(t) {
              return t.preventDefault();
            },
            dragstart: function(t) {
              var e, n, i;
              return (
                (i = t.target),
                this.serializeSelectionToDataTransfer(t.dataTransfer),
                (this.draggedRange =
                  null != (e = this.responder) ? e.getSelectedRange() : void 0),
                null != (n = this.delegate) &&
                "function" == typeof n.inputControllerDidStartDrag
                  ? n.inputControllerDidStartDrag()
                  : void 0
              );
            },
            dragover: function(t) {
              var e, n, i;
              return (this.draggedRange ||
                this.canAcceptDataTransfer(t.dataTransfer)) &&
                (t.preventDefault(),
                (e = { x: t.clientX, y: t.clientY }),
                e.toString() !==
                  (null != (n = this.draggingPoint) ? n.toString() : void 0))
                ? ((this.draggingPoint = e),
                  null != (i = this.delegate) &&
                  "function" == typeof i.inputControllerDidReceiveDragOverPoint
                    ? i.inputControllerDidReceiveDragOverPoint(
                        this.draggingPoint
                      )
                    : void 0)
                : void 0;
            },
            dragend: function() {
              var t;
              return (
                null != (t = this.delegate) &&
                  "function" == typeof t.inputControllerDidCancelDrag &&
                  t.inputControllerDidCancelDrag(),
                (this.draggedRange = null),
                (this.draggingPoint = null)
              );
            },
            drop: function(t) {
              var e, n, i, o, r, s, a, u, c;
              return (
                t.preventDefault(),
                (i = null != (r = t.dataTransfer) ? r.files : void 0),
                (o = { x: t.clientX, y: t.clientY }),
                null != (s = this.responder) &&
                  s.setLocationRangeFromPointRange(o),
                (null != i
                ? i.length
                : void 0)
                  ? this.attachFiles(i)
                  : this.draggedRange
                    ? (null != (a = this.delegate) &&
                        a.inputControllerWillMoveText(),
                      null != (u = this.responder) &&
                        u.moveTextFromRange(this.draggedRange),
                      (this.draggedRange = null),
                      this.requestRender())
                    : (n = t.dataTransfer.getData(
                        "application/x-trix-document"
                      )) &&
                      ((e = Trix.Document.fromJSONString(n)),
                      null != (c = this.responder) && c.insertDocument(e),
                      this.requestRender()),
                (this.draggedRange = null),
                (this.draggingPoint = null)
              );
            },
            cut: function(t) {
              var e;
              return (
                this.serializeSelectionToDataTransfer(t.clipboardData) &&
                  t.preventDefault(),
                null != (e = this.delegate) && e.inputControllerWillCutText(),
                this.deleteInDirection("backward"),
                t.defaultPrevented ? this.requestRender() : void 0
              );
            },
            copy: function(t) {
              return this.serializeSelectionToDataTransfer(t.clipboardData)
                ? t.preventDefault()
                : void 0;
            },
            paste: function(t) {
              var e, i, r, s, a, u, c, l, p, d, f, g, y, v, b, A, x, T;
              return (
                (s = null != (u = t.clipboardData) ? u : t.testClipboardData),
                null != s
                  ? ((a = { paste: s }),
                    h(t)
                      ? void this.getPastedHTMLUsingHiddenElement(
                          (function(t) {
                            return function(e) {
                              var n, i, o;
                              return (
                                (a.html = e),
                                null != (n = t.delegate) &&
                                  n.inputControllerWillPasteText(a),
                                null != (i = t.responder) && i.insertHTML(e),
                                t.requestRender(),
                                null != (o = t.delegate)
                                  ? o.inputControllerDidPaste(a)
                                  : void 0
                              );
                            };
                          })(this)
                        )
                      : ((r = s.getData("text/html"))
                          ? ((a.html = r),
                            null != (c = this.delegate) &&
                              c.inputControllerWillPasteText(a),
                            null != (d = this.responder) && d.insertHTML(r),
                            this.requestRender(),
                            null != (f = this.delegate) &&
                              f.inputControllerDidPaste(a))
                          : (T = s.getData("text/plain"))
                            ? ((a.string = T),
                              this.setInputSummary({
                                textAdded: T,
                                didDelete: this.selectionIsExpanded()
                              }),
                              null != (g = this.delegate) &&
                                g.inputControllerWillPasteText(a),
                              null != (y = this.responder) && y.insertString(T),
                              this.requestRender(),
                              null != (v = this.delegate) &&
                                v.inputControllerDidPaste(a))
                            : m.call(s.types, "Files") >= 0 &&
                              (i =
                                null != (b = s.items) &&
                                null != (A = b[0]) &&
                                "function" == typeof A.getAsFile
                                  ? A.getAsFile()
                                  : void 0) &&
                              (!i.name &&
                                (e = n(i)) &&
                                (i.name = "pasted-file-" + ++o + "." + e),
                              (a.file = i),
                              null != (x = this.delegate) &&
                                x.inputControllerWillAttachFiles(),
                              null != (l = this.responder) && l.insertFile(i),
                              this.requestRender(),
                              null != (p = this.delegate) &&
                                p.inputControllerDidPaste(a)),
                        t.preventDefault()))
                  : void 0
              );
            },
            compositionstart: function(t) {
              var e, n;
              return (
                this.selectionIsExpanded() ||
                  ("keypress" === this.inputSummary.eventName &&
                    this.inputSummary.textAdded) ||
                  ((n =
                    null != (e = this.responder)
                      ? e.insertPlaceholder()
                      : void 0),
                  this.setInputSummary({ textAdded: n }),
                  this.requestRender()),
                this.setInputSummary({
                  composing: !0,
                  compositionStart: t.data
                })
              );
            },
            compositionupdate: function(t) {
              var e, n;
              return (
                (null != (e = this.responder)
                  ? e.selectPlaceholder()
                  : void 0) &&
                  null != (n = this.responder) &&
                  n.forgetPlaceholder(),
                this.setInputSummary({
                  composing: !0,
                  compositionUpdate: t.data
                })
              );
            },
            compositionend: function(t) {
              var e, n, i, o, r, s, a, u, c;
              return (
                (null != (o = this.responder)
                  ? o.selectPlaceholder()
                  : void 0) &&
                  null != (r = this.responder) &&
                  r.forgetPlaceholder(),
                (n = this.inputSummary.compositionStart),
                (i = t.data),
                null != n && null != i && n !== i
                  ? (null != (s = this.delegate) &&
                      s.inputControllerWillPerformTyping(),
                    null != (a = this.responder) && a.insertString(i),
                    (u = p(n, i)),
                    (e = u.added),
                    (c = u.removed),
                    this.setInputSummary({
                      composing: !1,
                      textAdded: e,
                      didDelete: Boolean(c)
                    }))
                  : void 0
              );
            },
            input: function(t) {
              return t.stopPropagation();
            }
          }),
          (i.prototype.keys = {
            backspace: function(t) {
              var e;
              return (
                null != (e = this.delegate) &&
                  e.inputControllerWillPerformTyping(),
                this.deleteInDirection("backward", t)
              );
            },
            delete: function(t) {
              var e;
              return (
                null != (e = this.delegate) &&
                  e.inputControllerWillPerformTyping(),
                this.deleteInDirection("forward", t)
              );
            },
            return: function() {
              var t, e;
              return (
                this.setInputSummary({ preferDocument: !0 }),
                null != (t = this.delegate) &&
                  t.inputControllerWillPerformTyping(),
                null != (e = this.responder) ? e.insertLineBreak() : void 0
              );
            },
            tab: function(t) {
              var e, n;
              return (null != (e = this.responder)
              ? e.canIncreaseBlockAttributeLevel()
              : void 0)
                ? (null != (n = this.responder) &&
                    n.increaseBlockAttributeLevel(),
                  this.requestRender(),
                  t.preventDefault())
                : void 0;
            },
            left: function(t) {
              var e;
              return this.selectionIsInCursorTarget()
                ? (t.preventDefault(),
                  null != (e = this.responder)
                    ? e.moveCursorInDirection("backward")
                    : void 0)
                : void 0;
            },
            right: function(t) {
              var e;
              return this.selectionIsInCursorTarget()
                ? (t.preventDefault(),
                  null != (e = this.responder)
                    ? e.moveCursorInDirection("forward")
                    : void 0)
                : void 0;
            },
            control: {
              d: function(t) {
                var e;
                return (
                  null != (e = this.delegate) &&
                    e.inputControllerWillPerformTyping(),
                  this.deleteInDirection("forward", t)
                );
              },
              h: function(t) {
                var e;
                return (
                  null != (e = this.delegate) &&
                    e.inputControllerWillPerformTyping(),
                  this.deleteInDirection("backward", t)
                );
              },
              o: function(t) {
                var e, n;
                return (
                  t.preventDefault(),
                  null != (e = this.delegate) &&
                    e.inputControllerWillPerformTyping(),
                  null != (n = this.responder) &&
                    n.insertString("\n", { updatePosition: !1 }),
                  this.requestRender()
                );
              }
            },
            shift: {
              return: function() {
                var t, e;
                return (
                  null != (t = this.delegate) &&
                    t.inputControllerWillPerformTyping(),
                  null != (e = this.responder) ? e.insertString("\n") : void 0
                );
              },
              tab: function(t) {
                var e, n;
                return (null != (e = this.responder)
                ? e.canDecreaseBlockAttributeLevel()
                : void 0)
                  ? (null != (n = this.responder) &&
                      n.decreaseBlockAttributeLevel(),
                    this.requestRender(),
                    t.preventDefault())
                  : void 0;
              },
              left: function(t) {
                return this.selectionIsInCursorTarget()
                  ? (t.preventDefault(),
                    this.expandSelectionInDirection("backward"))
                  : void 0;
              },
              right: function(t) {
                return this.selectionIsInCursorTarget()
                  ? (t.preventDefault(),
                    this.expandSelectionInDirection("forward"))
                  : void 0;
              }
            },
            alt: {
              backspace: function() {
                var t;
                return (
                  this.setInputSummary({ preferDocument: !1 }),
                  null != (t = this.delegate)
                    ? t.inputControllerWillPerformTyping()
                    : void 0
                );
              }
            },
            meta: {
              backspace: function() {
                var t;
                return (
                  this.setInputSummary({ preferDocument: !1 }),
                  null != (t = this.delegate)
                    ? t.inputControllerWillPerformTyping()
                    : void 0
                );
              }
            }
          }),
          (i.prototype.handleInput = function(t) {
            var e, n;
            try {
              return (
                null != (e = this.delegate) &&
                  e.inputControllerWillHandleInput(),
                t.call(this)
              );
            } finally {
              null != (n = this.delegate) && n.inputControllerDidHandleInput();
            }
          }),
          (i.prototype.deleteInDirection = function(t, e) {
            var n;
            return (null != (n = this.responder)
              ? n.deleteInDirection(t)
              : void 0) !== !1
              ? this.setInputSummary({ didDelete: !0 })
              : e
                ? (e.preventDefault(), this.requestRender())
                : void 0;
          }),
          (i.prototype.serializeSelectionToDataTransfer = function(e) {
            var n, i;
            if (t(e))
              return (
                (n =
                  null != (i = this.responder)
                    ? i.getSelectedDocument().toSerializableDocument()
                    : void 0),
                e.setData("application/x-trix-document", JSON.stringify(n)),
                e.setData("text/html", Trix.DocumentView.render(n).innerHTML),
                e.setData("text/plain", n.toString().replace(/\n$/, "")),
                !0
              );
          }),
          (i.prototype.canAcceptDataTransfer = function(t) {
            var e, n, i, o, r, s;
            for (
              s = {},
                o = null != (i = null != t ? t.types : void 0) ? i : [],
                e = 0,
                n = o.length;
              n > e;
              e++
            )
              (r = o[e]), (s[r] = !0);
            return (
              s.Files ||
              s["application/x-trix-document"] ||
              s["text/html"] ||
              s["text/plain"]
            );
          }),
          (i.prototype.getPastedHTMLUsingHiddenElement = function(t) {
            var e, n, i, o;
            return (
              (i =
                null != (n = this.responder) ? n.getSelectedRange() : void 0),
              (o = {
                position: "absolute",
                left: window.pageXOffset + "px",
                top: window.pageYOffset + "px",
                opacity: 0
              }),
              (e = l({ style: o, tagName: "div", editable: !0 })),
              document.body.appendChild(e),
              e.focus(),
              requestAnimationFrame(
                (function(n) {
                  return function() {
                    var o, r;
                    return (
                      (o = e.innerHTML),
                      document.body.removeChild(e),
                      null != (r = n.responder) && r.setSelectedRange(i),
                      t(o)
                    );
                  };
                })(this)
              )
            );
          }),
          i.proxyMethod("responder?.expandSelectionInDirection"),
          i.proxyMethod("responder?.selectionIsInCursorTarget"),
          i.proxyMethod("responder?.selectionIsExpanded"),
          i
        );
      })(Trix.BasicObject)),
      (n = function(t) {
        var e, n;
        return null != (e = t.type) && null != (n = e.match(/\/(\w+)$/))
          ? n[1]
          : void 0;
      }),
      (c = function(t) {
        return t.metaKey && t.altKey && !t.shiftKey && 94 === t.keyCode;
      }),
      (u = function(t) {
        return t.metaKey && t.altKey && t.shiftKey && 9674 === t.keyCode;
      }),
      (a = function(t) {
        return /Mac|^iP/.test(navigator.platform) ? t.metaKey : t.ctrlKey;
      }),
      (h = function(t) {
        var e, n;
        return (n = null != (e = t.clipboardData) ? e.types : void 0)
          ? m.call(n, "text/html") < 0 &&
              (m.call(n, "com.apple.webarchive") >= 0 ||
                m.call(n, "com.apple.flat-rtfd") >= 0)
          : void 0;
      }),
      (d = { "application/x-trix-feature-detection": "test" }),
      (t = function(t) {
        var e, n;
        if (null != (null != t ? t.setData : void 0)) {
          for (e in d)
            if (((n = d[e]), t.setData(e, n), t.getData(e) !== n)) return;
          return !0;
        }
      });
  }.call(this),
  function() {
    var t,
      e,
      n,
      i,
      o,
      r,
      s = function(t, e) {
        return function() {
          return t.apply(e, arguments);
        };
      },
      a = function(t, e) {
        function n() {
          this.constructor = t;
        }
        for (var i in e) u.call(e, i) && (t[i] = e[i]);
        return (
          (n.prototype = e.prototype),
          (t.prototype = new n()),
          (t.__super__ = e.prototype),
          t
        );
      },
      u = {}.hasOwnProperty;
    (e = Trix.handleEvent),
      (o = Trix.makeElement),
      (r = Trix.tagName),
      (n = Trix.InputController.keyNames),
      (i = Trix.config.lang),
      (t = Trix.config.css.classNames),
      (Trix.AttachmentEditorController = (function(u) {
        function c(t, e, n) {
          (this.attachmentPiece = t),
            (this.element = e),
            (this.container = n),
            (this.uninstall = s(this.uninstall, this)),
            (this.didKeyDownCaption = s(this.didKeyDownCaption, this)),
            (this.didChangeCaption = s(this.didChangeCaption, this)),
            (this.didClickCaption = s(this.didClickCaption, this)),
            (this.didClickRemoveButton = s(this.didClickRemoveButton, this)),
            (this.attachment = this.attachmentPiece.attachment),
            "a" === r(this.element) && (this.element = this.element.firstChild),
            this.install();
        }
        var l;
        return (
          a(c, u),
          (l = function(t) {
            return function() {
              var e;
              return (
                (e = t.apply(this, arguments)),
                e["do"](),
                null == this.undos && (this.undos = []),
                this.undos.push(e.undo)
              );
            };
          }),
          (c.prototype.install = function() {
            return (
              this.makeElementMutable(),
              this.attachment.isPreviewable() && this.makeCaptionEditable(),
              this.addRemoveButton()
            );
          }),
          (c.prototype.makeElementMutable = l(function() {
            return {
              do: (function(t) {
                return function() {
                  return (t.element.dataset.trixMutable = !0);
                };
              })(this),
              undo: (function(t) {
                return function() {
                  return delete t.element.dataset.trixMutable;
                };
              })(this)
            };
          })),
          (c.prototype.makeCaptionEditable = l(function() {
            var t, n;
            return (
              (t = this.element.querySelector("figcaption")),
              (n = null),
              {
                do: (function(i) {
                  return function() {
                    return (n = e("click", {
                      onElement: t,
                      withCallback: i.didClickCaption,
                      inPhase: "capturing"
                    }));
                  };
                })(this),
                undo: (function() {
                  return function() {
                    return n.destroy();
                  };
                })(this)
              }
            );
          })),
          (c.prototype.addRemoveButton = l(function() {
            var n;
            return (
              (n = o({
                tagName: "a",
                textContent: i.remove,
                className: t.attachment.removeButton,
                attributes: { href: "#", title: i.remove }
              })),
              e("click", {
                onElement: n,
                withCallback: this.didClickRemoveButton
              }),
              {
                do: (function(t) {
                  return function() {
                    return t.element.appendChild(n);
                  };
                })(this),
                undo: (function(t) {
                  return function() {
                    return t.element.removeChild(n);
                  };
                })(this)
              }
            );
          })),
          (c.prototype.editCaption = l(function() {
            var n, r, s, a, u;
            return (
              (a = o({
                tagName: "textarea",
                className: t.attachment.captionEditor,
                attributes: { placeholder: i.captionPlaceholder }
              })),
              (a.value = this.attachmentPiece.getCaption()),
              (u = a.cloneNode()),
              u.classList.add("trix-autoresize-clone"),
              (n = function() {
                return (
                  (u.value = a.value), (a.style.height = u.scrollHeight + "px")
                );
              }),
              e("input", { onElement: a, withCallback: n }),
              e("keydown", {
                onElement: a,
                withCallback: this.didKeyDownCaption
              }),
              e("change", {
                onElement: a,
                withCallback: this.didChangeCaption
              }),
              e("blur", { onElement: a, withCallback: this.uninstall }),
              (s = this.element.querySelector("figcaption")),
              (r = s.cloneNode()),
              {
                do: function() {
                  return (
                    (s.style.display = "none"),
                    r.appendChild(a),
                    r.appendChild(u),
                    r.classList.add(t.attachment.editingCaption),
                    s.parentElement.insertBefore(r, s),
                    n(),
                    a.focus()
                  );
                },
                undo: function() {
                  return r.parentNode.removeChild(r), (s.style.display = null);
                }
              }
            );
          })),
          (c.prototype.didClickRemoveButton = function(t) {
            var e;
            return (
              t.preventDefault(),
              t.stopPropagation(),
              null != (e = this.delegate)
                ? e.attachmentEditorDidRequestRemovalOfAttachment(
                    this.attachment
                  )
                : void 0
            );
          }),
          (c.prototype.didClickCaption = function(t) {
            return t.preventDefault(), this.editCaption();
          }),
          (c.prototype.didChangeCaption = function(t) {
            var e, n, i;
            return (
              (e = t.target.value.replace(/\s/g, " ").trim()),
              e
                ? null != (n = this.delegate) &&
                  "function" ==
                    typeof n.attachmentEditorDidRequestUpdatingAttributesForAttachment
                  ? n.attachmentEditorDidRequestUpdatingAttributesForAttachment(
                      { caption: e },
                      this.attachment
                    )
                  : void 0
                : null != (i = this.delegate) &&
                  "function" ==
                    typeof i.attachmentEditorDidRequestRemovingAttributeForAttachment
                  ? i.attachmentEditorDidRequestRemovingAttributeForAttachment(
                      "caption",
                      this.attachment
                    )
                  : void 0
            );
          }),
          (c.prototype.didKeyDownCaption = function(t) {
            var e;
            return "return" === n[t.keyCode]
              ? (t.preventDefault(),
                this.didChangeCaption(t),
                null != (e = this.delegate) &&
                "function" ==
                  typeof e.attachmentEditorDidRequestDeselectingAttachment
                  ? e.attachmentEditorDidRequestDeselectingAttachment(
                      this.attachment
                    )
                  : void 0)
              : void 0;
          }),
          (c.prototype.uninstall = function() {
            for (var t, e; (e = this.undos.pop()); ) e();
            return null != (t = this.delegate)
              ? t.didUninstallAttachmentEditor(this)
              : void 0;
          }),
          c
        );
      })(Trix.BasicObject));
  }.call(this),
  function() {
    var t,
      e,
      n,
      i = function(t, e) {
        function n() {
          this.constructor = t;
        }
        for (var i in e) o.call(e, i) && (t[i] = e[i]);
        return (
          (n.prototype = e.prototype),
          (t.prototype = new n()),
          (t.__super__ = e.prototype),
          t
        );
      },
      o = {}.hasOwnProperty;
    (n = Trix.makeElement),
      (t = Trix.config.css.classNames),
      (Trix.AttachmentView = (function(o) {
        function r() {
          r.__super__.constructor.apply(this, arguments),
            (this.attachment = this.object),
            (this.attachment.uploadProgressDelegate = this),
            (this.attachmentPiece = this.options.piece);
        }
        return (
          i(r, o),
          (r.attachmentSelector = "[data-trix-attachment]"),
          (r.prototype.createContentNodes = function() {
            return [];
          }),
          (r.prototype.createNodes = function() {
            var e, i, o, r, s, a, u, c, l, h, p;
            if (
              ((r = n({ tagName: "figure", className: this.getClassName() })),
              this.attachment.hasContent())
            )
              r.innerHTML = this.attachment.getContent();
            else
              for (
                h = this.createContentNodes(), a = 0, c = h.length;
                c > a;
                a++
              )
                (l = h[a]), r.appendChild(l);
            r.appendChild(this.createCaptionElement()),
              (i = {
                trixAttachment: JSON.stringify(this.attachment),
                trixContentType: this.attachment.getContentType(),
                trixId: this.attachment.id
              }),
              (e = this.attachmentPiece.getAttributesForAttachment()),
              e.isEmpty() || (i.trixAttributes = JSON.stringify(e)),
              this.attachment.isPending() &&
                ((this.progressElement = n({
                  tagName: "progress",
                  attributes: {
                    class: t.attachment.progressBar,
                    value: this.attachment.getUploadProgress(),
                    max: 100
                  },
                  data: {
                    trixMutable: !0,
                    trixStoreKey: this.attachment.getCacheKey("progressElement")
                  }
                })),
                r.appendChild(this.progressElement),
                (i.trixSerialize = !1)),
              (s = this.getHref())
                ? ((o = n("a", { href: s })), o.appendChild(r))
                : (o = r);
            for (u in i) (p = i[u]), (o.dataset[u] = p);
            return (
              o.setAttribute("contenteditable", !1),
              [this.createCursorTarget(), o, this.createCursorTarget()]
            );
          }),
          (r.prototype.createCaptionElement = function() {
            var e, i, o, r, s;
            return (
              (i = n({
                tagName: "figcaption",
                className: t.attachment.caption
              })),
              (e = this.attachmentPiece.getCaption())
                ? (i.classList.add(t.attachment.captionEdited),
                  (i.textContent = e))
                : (o = this.attachment.getFilename()) &&
                  ((i.textContent = o),
                  (r = this.attachment.getFormattedFilesize()) &&
                    (i.appendChild(document.createTextNode(" ")),
                    (s = n({
                      tagName: "span",
                      className: t.attachment.size,
                      textContent: r
                    })),
                    i.appendChild(s))),
              i
            );
          }),
          (r.prototype.getClassName = function() {
            var e, n;
            return (
              (n = [
                t.attachment.container,
                "" + t.attachment.typePrefix + this.attachment.getType()
              ]),
              (e = this.attachment.getExtension()) && n.push(e),
              n.join(" ")
            );
          }),
          (r.prototype.getHref = function() {
            return e(this.attachment.getContent(), "a")
              ? void 0
              : this.attachment.getHref();
          }),
          (r.prototype.createCursorTarget = function() {
            return n({
              tagName: "span",
              textContent: Trix.ZERO_WIDTH_SPACE,
              data: { trixCursorTarget: !0, trixSerialize: !1 }
            });
          }),
          (r.prototype.findProgressElement = function() {
            var t;
            return null != (t = this.findElement())
              ? t.querySelector("progress")
              : void 0;
          }),
          (r.prototype.attachmentDidChangeUploadProgress = function() {
            var t, e;
            return (
              (e = this.attachment.getUploadProgress()),
              null != (t = this.findProgressElement()) ? (t.value = e) : void 0
            );
          }),
          r
        );
      })(Trix.ObjectView)),
      (e = function(t, e) {
        var i;
        return (
          (i = n("div")), (i.innerHTML = null != t ? t : ""), i.querySelector(e)
        );
      });
  }.call(this),
  function() {
    var t,
      e,
      n,
      i = function(t, e) {
        function n() {
          this.constructor = t;
        }
        for (var i in e) o.call(e, i) && (t[i] = e[i]);
        return (
          (n.prototype = e.prototype),
          (t.prototype = new n()),
          (t.__super__ = e.prototype),
          t
        );
      },
      o = {}.hasOwnProperty;
    (t = Trix.defer),
      (e = Trix.makeElement),
      (n = Trix.measureElement),
      (Trix.PreviewableAttachmentView = (function(t) {
        function n() {
          n.__super__.constructor.apply(this, arguments),
            (this.attachment.previewDelegate = this);
        }
        return (
          i(n, t),
          (n.prototype.createContentNodes = function() {
            return (
              (this.image = e({
                tagName: "img",
                attributes: { src: "" },
                data: {
                  trixMutable: !0,
                  trixStoreKey: this.attachment.getCacheKey("imageElement")
                }
              })),
              this.refresh(this.image),
              [this.image]
            );
          }),
          (n.prototype.refresh = function(t) {
            var e;
            return (
              null == t &&
                (t =
                  null != (e = this.findElement())
                    ? e.querySelector("img")
                    : void 0),
              t ? this.updateAttributesForImage(t) : void 0
            );
          }),
          (n.prototype.updateAttributesForImage = function(t) {
            var e, n, i, o, r;
            return (
              (o = this.attachment.getURL()),
              (n = this.attachment.getPreloadedURL()),
              (t.src = n || o),
              n === o
                ? t.removeAttribute("data-trix-serialized-attributes")
                : ((i = JSON.stringify({ src: o })),
                  t.setAttribute("data-trix-serialized-attributes", i)),
              (r = this.attachment.getWidth()),
              (e = this.attachment.getHeight()),
              null != r && (t.width = r),
              null != e ? (t.height = e) : void 0
            );
          }),
          (n.prototype.attachmentDidPreload = function() {
            return this.refresh(this.image), this.refresh();
          }),
          n
        );
      })(Trix.AttachmentView));
  }.call(this),
  function() {
    var t,
      e,
      n = function(t, e) {
        function n() {
          this.constructor = t;
        }
        for (var o in e) i.call(e, o) && (t[o] = e[o]);
        return (
          (n.prototype = e.prototype),
          (t.prototype = new n()),
          (t.__super__ = e.prototype),
          t
        );
      },
      i = {}.hasOwnProperty;
    (e = Trix.makeElement),
      (t = Trix.findInnerElement),
      (Trix.PieceView = (function(i) {
        function o() {
          o.__super__.constructor.apply(this, arguments),
            (this.piece = this.object),
            (this.attributes = this.piece.getAttributes()),
            (this.textConfig = this.options.textConfig),
            this.piece.attachment
              ? (this.attachment = this.piece.attachment)
              : (this.string = this.piece.toString());
        }
        var r;
        return (
          n(o, i),
          (o.prototype.createNodes = function() {
            var e, n, i, o, r, s;
            if (
              ((s = this.attachment
                ? this.createAttachmentNodes()
                : this.createStringNodes()),
              (e = this.createElement()))
            ) {
              for (i = t(e), n = 0, o = s.length; o > n; n++)
                (r = s[n]), i.appendChild(r);
              s = [e];
            }
            return s;
          }),
          (o.prototype.createAttachmentNodes = function() {
            var t, e;
            return (
              (t = this.attachment.isPreviewable()
                ? Trix.PreviewableAttachmentView
                : Trix.AttachmentView),
              (e = this.createChildView(t, this.piece.attachment, {
                piece: this.piece
              })),
              e.getNodes()
            );
          }),
          (o.prototype.createStringNodes = function() {
            var t, n, i, o, s, a, u, c, l, h;
            if (null != (c = this.textConfig) ? c.plaintext : void 0)
              return [document.createTextNode(this.string)];
            for (
              u = [], l = this.string.split("\n"), i = n = 0, o = l.length;
              o > n;
              i = ++n
            )
              (h = l[i]),
                i > 0 && ((t = e("br")), u.push(t)),
                (s = h.length) &&
                  ((a = document.createTextNode(r(h))), u.push(a));
            return u;
          }),
          (o.prototype.createElement = function() {
            var t, n, i, o, r, s, a, u;
            for (o in this.attributes)
              if (
                (t = Trix.config.textAttributes[o]) &&
                (t.tagName &&
                  ((r = e(t.tagName)),
                  i ? (i.appendChild(r), (i = r)) : (n = i = r)),
                t.style)
              )
                if (a) {
                  s = t.style;
                  for (o in s) (u = s[o]), (a[o] = u);
                } else a = t.style;
            if (a) {
              null == n && (n = e("span"));
              for (o in a) (u = a[o]), (n.style[o] = u);
            }
            return n;
          }),
          (o.prototype.createContainerElement = function() {
            var t, n, i, o, r;
            o = this.attributes;
            for (i in o)
              if (
                ((r = o[i]),
                (n = Trix.config.textAttributes[i]) && n.groupTagName)
              )
                return (t = {}), (t[i] = r), e(n.groupTagName, t);
          }),
          (r = function(t) {
            var e;
            return (
              (e = Trix.NON_BREAKING_SPACE),
              t
                .replace(/\ $/, e)
                .replace(/(\S)\ {3}(\S)/g, "$1 " + e + " $2")
                .replace(/\ {2}/g, e + " ")
                .replace(/\ {2}/g, " " + e)
                .replace(/^\ /, e)
            );
          }),
          o
        );
      })(Trix.ObjectView));
  }.call(this),
  function() {
    var t = function(t, n) {
        function i() {
          this.constructor = t;
        }
        for (var o in n) e.call(n, o) && (t[o] = n[o]);
        return (
          (i.prototype = n.prototype),
          (t.prototype = new i()),
          (t.__super__ = n.prototype),
          t
        );
      },
      e = {}.hasOwnProperty;
    Trix.TextView = (function(e) {
      function n() {
        n.__super__.constructor.apply(this, arguments),
          (this.text = this.object),
          (this.textConfig = this.options.textConfig);
      }
      return (
        t(n, e),
        (n.prototype.createNodes = function() {
          var t, e, n, i, o, r, s, a;
          for (
            n = [],
              s = function() {
                var t, e, n, i;
                for (
                  n = this.text.getPieces(), i = [], t = 0, e = n.length;
                  e > t;
                  t++
                )
                  (r = n[t]), r.hasAttribute("blockBreak") || i.push(r);
                return i;
              }.call(this),
              o = Trix.ObjectGroup.groupObjects(s),
              t = 0,
              e = o.length;
            e > t;
            t++
          )
            (i = o[t]),
              (a = this.findOrCreateCachedChildView(Trix.PieceView, i, {
                textConfig: this.textConfig
              })),
              n.push.apply(n, a.getNodes());
          return n;
        }),
        n
      );
    })(Trix.ObjectView);
  }.call(this),
  function() {
    var t,
      e = function(t, e) {
        function i() {
          this.constructor = t;
        }
        for (var o in e) n.call(e, o) && (t[o] = e[o]);
        return (
          (i.prototype = e.prototype),
          (t.prototype = new i()),
          (t.__super__ = e.prototype),
          t
        );
      },
      n = {}.hasOwnProperty;
    (t = Trix.makeElement),
      (Trix.BlockView = (function(n) {
        function i() {
          i.__super__.constructor.apply(this, arguments),
            (this.block = this.object),
            (this.attributes = this.block.getAttributes());
        }
        return (
          e(i, n),
          (i.prototype.createNodes = function() {
            var e, n, i, o, r, s, a, u, c;
            if (
              ((e = document.createComment("block")),
              (s = [e]),
              this.block.isEmpty()
                ? s.push(t("br"))
                : ((u =
                    null !=
                    (a =
                      Trix.config.blockAttributes[
                        this.block.getLastAttribute()
                      ])
                      ? a.text
                      : void 0),
                  (c = this.findOrCreateCachedChildView(
                    Trix.TextView,
                    this.block.text,
                    { textConfig: u }
                  )),
                  s.push.apply(s, c.getNodes()),
                  this.shouldAddExtraNewlineElement() && s.push(t("br"))),
              this.attributes.length)
            )
              return s;
            for (
              n = t(Trix.config.blockAttributes["default"].tagName),
                i = 0,
                o = s.length;
              o > i;
              i++
            )
              (r = s[i]), n.appendChild(r);
            return [n];
          }),
          (i.prototype.createContainerElement = function(e) {
            var n, i;
            return (
              (n = this.attributes[e]),
              (i = Trix.config.blockAttributes[n]),
              t(i.tagName)
            );
          }),
          (i.prototype.shouldAddExtraNewlineElement = function() {
            return /\n\n$/.test(this.block.toString());
          }),
          i
        );
      })(Trix.ObjectView));
  }.call(this),
  function() {
    var t,
      e,
      n = function(t, e) {
        function n() {
          this.constructor = t;
        }
        for (var o in e) i.call(e, o) && (t[o] = e[o]);
        return (
          (n.prototype = e.prototype),
          (t.prototype = new n()),
          (t.__super__ = e.prototype),
          t
        );
      },
      i = {}.hasOwnProperty;
    (t = Trix.defer),
      (e = Trix.makeElement),
      (Trix.DocumentView = (function(i) {
        function o() {
          o.__super__.constructor.apply(this, arguments),
            (this.element = this.options.element),
            (this.elementStore = new Trix.ElementStore()),
            this.setDocument(this.object);
        }
        var r, s, a;
        return (
          n(o, i),
          (o.render = function(t) {
            var n, i;
            return (
              (n = e("div")),
              (i = new this(t, { element: n })),
              i.render(),
              i.sync(),
              n
            );
          }),
          (o.prototype.setDocument = function(t) {
            return t.isEqualTo(this.document)
              ? void 0
              : (this.document = this.object = t);
          }),
          (o.prototype.render = function() {
            var t, n, i, o, r, s, a;
            if (
              ((this.childViews = []),
              (this.shadowElement = e("div")),
              !this.document.isEmpty())
            ) {
              for (
                r = Trix.ObjectGroup.groupObjects(this.document.getBlocks(), {
                  asTree: !0
                }),
                  s = [],
                  t = 0,
                  n = r.length;
                n > t;
                t++
              )
                (o = r[t]),
                  (a = this.findOrCreateCachedChildView(Trix.BlockView, o)),
                  s.push(
                    function() {
                      var t, e, n, o;
                      for (
                        n = a.getNodes(), o = [], t = 0, e = n.length;
                        e > t;
                        t++
                      )
                        (i = n[t]), o.push(this.shadowElement.appendChild(i));
                      return o;
                    }.call(this)
                  );
              return s;
            }
          }),
          (o.prototype.isSynced = function() {
            return r(this.shadowElement, this.element);
          }),
          (o.prototype.sync = function() {
            var t;
            for (
              t = this.createDocumentFragmentForSync();
              this.element.lastChild;

            )
              this.element.removeChild(this.element.lastChild);
            return this.element.appendChild(t), this.didSync();
          }),
          (o.prototype.didSync = function() {
            return (
              this.elementStore.reset(s(this.element)),
              t(
                (function(t) {
                  return function() {
                    return t.garbageCollectCachedViews();
                  };
                })(this)
              )
            );
          }),
          (o.prototype.createDocumentFragmentForSync = function() {
            var t, e, n, i, o, r, a, u, c, l;
            for (
              e = document.createDocumentFragment(),
                u = this.shadowElement.childNodes,
                n = 0,
                o = u.length;
              o > n;
              n++
            )
              (a = u[n]), e.appendChild(a.cloneNode(!0));
            for (c = s(e), i = 0, r = c.length; r > i; i++)
              (t = c[i]),
                (l = this.elementStore.remove(t)) &&
                  t.parentNode.replaceChild(l, t);
            return e;
          }),
          (s = function(t) {
            return t.querySelectorAll("[data-trix-store-key]");
          }),
          (r = function(t, e) {
            return a(t.innerHTML) === a(e.innerHTML);
          }),
          (a = function(t) {
            return t.replace(/&nbsp;/g, " ");
          }),
          o
        );
      })(Trix.ObjectView));
  }.call(this),
  function() {
    var t,
      e,
      n,
      i,
      o,
      r,
      s = function(t, e) {
        return function() {
          return t.apply(e, arguments);
        };
      },
      a = function(t, e) {
        function n() {
          this.constructor = t;
        }
        for (var i in e) u.call(e, i) && (t[i] = e[i]);
        return (
          (n.prototype = e.prototype),
          (t.prototype = new n()),
          (t.__super__ = e.prototype),
          t
        );
      },
      u = {}.hasOwnProperty;
    (i = Trix.handleEvent),
      (r = Trix.tagName),
      (n = Trix.findClosestElementFromNode),
      (o = Trix.innerElementIsActive),
      (e = Trix.defer),
      (t = Trix.AttachmentView.attachmentSelector),
      (Trix.CompositionController = (function(n) {
        function r(e, n) {
          (this.element = e),
            (this.composition = n),
            (this.didClickAttachment = s(this.didClickAttachment, this)),
            (this.didBlur = s(this.didBlur, this)),
            (this.didFocus = s(this.didFocus, this)),
            (this.documentView = new Trix.DocumentView(
              this.composition.document,
              { element: this.element }
            )),
            i("focus", {
              onElement: this.element,
              withCallback: this.didFocus
            }),
            i("blur", { onElement: this.element, withCallback: this.didBlur }),
            i("click", {
              onElement: this.element,
              matchingSelector: "a[contenteditable=false]",
              preventDefault: !0
            }),
            i("mousedown", {
              onElement: this.element,
              matchingSelector: t,
              withCallback: this.didClickAttachment
            }),
            i("click", {
              onElement: this.element,
              matchingSelector: "a" + t,
              preventDefault: !0
            });
        }
        return (
          a(r, n),
          (r.prototype.didFocus = function() {
            var t;
            return this.focused
              ? void 0
              : ((this.focused = !0),
                null != (t = this.delegate) &&
                "function" == typeof t.compositionControllerDidFocus
                  ? t.compositionControllerDidFocus()
                  : void 0);
          }),
          (r.prototype.didBlur = function() {
            return e(
              (function(t) {
                return function() {
                  var e;
                  return o(t.element)
                    ? void 0
                    : ((t.focused = null),
                      null != (e = t.delegate) &&
                      "function" == typeof e.compositionControllerDidBlur
                        ? e.compositionControllerDidBlur()
                        : void 0);
                };
              })(this)
            );
          }),
          (r.prototype.didClickAttachment = function(t, e) {
            var n, i;
            return (
              (n = this.findAttachmentForElement(e)),
              null != (i = this.delegate) &&
              "function" == typeof i.compositionControllerDidSelectAttachment
                ? i.compositionControllerDidSelectAttachment(n)
                : void 0
            );
          }),
          (r.prototype.render = function() {
            var t, e, n;
            return (
              this.revision !== this.composition.revision &&
                (this.documentView.setDocument(this.composition.document),
                this.documentView.render(),
                (this.revision = this.composition.revision)),
              this.documentView.isSynced() ||
                (null != (t = this.delegate) &&
                  "function" ==
                    typeof t.compositionControllerWillSyncDocumentView &&
                  t.compositionControllerWillSyncDocumentView(),
                this.documentView.sync(),
                this.reinstallAttachmentEditor(),
                null != (e = this.delegate) &&
                  "function" ==
                    typeof e.compositionControllerDidSyncDocumentView &&
                  e.compositionControllerDidSyncDocumentView()),
              null != (n = this.delegate) &&
              "function" == typeof n.compositionControllerDidRender
                ? n.compositionControllerDidRender()
                : void 0
            );
          }),
          (r.prototype.rerenderViewForObject = function(t) {
            return this.documentView.invalidateViewForObject(t), this.render();
          }),
          (r.prototype.isViewCachingEnabled = function() {
            return this.documentView.isViewCachingEnabled();
          }),
          (r.prototype.enableViewCaching = function() {
            return this.documentView.enableViewCaching();
          }),
          (r.prototype.disableViewCaching = function() {
            return this.documentView.disableViewCaching();
          }),
          (r.prototype.refreshViewCache = function() {
            return this.documentView.garbageCollectCachedViews();
          }),
          (r.prototype.installAttachmentEditorForAttachment = function(t) {
            var e, n, i;
            if (
              (null != (i = this.attachmentEditor) ? i.attachment : void 0) !==
                t &&
              (n = this.documentView.findElementForObject(t))
            )
              return (
                this.uninstallAttachmentEditor(),
                (e = this.composition.document.getAttachmentPieceForAttachment(
                  t
                )),
                (this.attachmentEditor = new Trix.AttachmentEditorController(
                  e,
                  n,
                  this.element
                )),
                (this.attachmentEditor.delegate = this)
              );
          }),
          (r.prototype.uninstallAttachmentEditor = function() {
            var t;
            return null != (t = this.attachmentEditor) ? t.uninstall() : void 0;
          }),
          (r.prototype.reinstallAttachmentEditor = function() {
            var t;
            return this.attachmentEditor
              ? ((t = this.attachmentEditor.attachment),
                this.uninstallAttachmentEditor(),
                this.installAttachmentEditorForAttachment(t))
              : void 0;
          }),
          (r.prototype.editAttachmentCaption = function() {
            var t;
            return null != (t = this.attachmentEditor)
              ? t.editCaption()
              : void 0;
          }),
          (r.prototype.didUninstallAttachmentEditor = function() {
            return (this.attachmentEditor = null), this.render();
          }),
          (r.prototype.attachmentEditorDidRequestUpdatingAttributesForAttachment = function(
            t,
            e
          ) {
            var n;
            return (
              null != (n = this.delegate) &&
                "function" ==
                  typeof n.compositionControllerWillUpdateAttachment &&
                n.compositionControllerWillUpdateAttachment(e),
              this.composition.updateAttributesForAttachment(t, e)
            );
          }),
          (r.prototype.attachmentEditorDidRequestRemovingAttributeForAttachment = function(
            t,
            e
          ) {
            var n;
            return (
              null != (n = this.delegate) &&
                "function" ==
                  typeof n.compositionControllerWillUpdateAttachment &&
                n.compositionControllerWillUpdateAttachment(e),
              this.composition.removeAttributeForAttachment(t, e)
            );
          }),
          (r.prototype.attachmentEditorDidRequestRemovalOfAttachment = function(
            t
          ) {
            var e;
            return null != (e = this.delegate) &&
              "function" ==
                typeof e.compositionControllerDidRequestRemovalOfAttachment
              ? e.compositionControllerDidRequestRemovalOfAttachment(t)
              : void 0;
          }),
          (r.prototype.attachmentEditorDidRequestDeselectingAttachment = function(
            t
          ) {
            var e;
            return null != (e = this.delegate) &&
              "function" ==
                typeof e.compositionControllerDidRequestDeselectingAttachment
              ? e.compositionControllerDidRequestDeselectingAttachment(t)
              : void 0;
          }),
          (r.prototype.findAttachmentForElement = function(t) {
            return this.composition.document.getAttachmentById(
              parseInt(t.dataset.trixId, 10)
            );
          }),
          r
        );
      })(Trix.BasicObject));
  }.call(this),
  function() {
    var t,
      e,
      n,
      i = function(t, e) {
        return function() {
          return t.apply(e, arguments);
        };
      },
      o = function(t, e) {
        function n() {
          this.constructor = t;
        }
        for (var i in e) r.call(e, i) && (t[i] = e[i]);
        return (
          (n.prototype = e.prototype),
          (t.prototype = new n()),
          (t.__super__ = e.prototype),
          t
        );
      },
      r = {}.hasOwnProperty;
    (e = Trix.handleEvent),
      (n = Trix.triggerEvent),
      (t = Trix.findClosestElementFromNode),
      (Trix.ToolbarController = (function(r) {
        function s(t) {
          (this.element = t),
            (this.didKeyDownDialogInput = i(this.didKeyDownDialogInput, this)),
            (this.didClickDialogButton = i(this.didClickDialogButton, this)),
            (this.didClickAttributeButton = i(
              this.didClickAttributeButton,
              this
            )),
            (this.didClickActionButton = i(this.didClickActionButton, this)),
            (this.attributes = {}),
            (this.actions = {}),
            this.resetDialogInputs(),
            e("mousedown", {
              onElement: this.element,
              matchingSelector: a,
              withCallback: this.didClickActionButton
            }),
            e("mousedown", {
              onElement: this.element,
              matchingSelector: c,
              withCallback: this.didClickAttributeButton
            }),
            e("click", {
              onElement: this.element,
              matchingSelector: y,
              preventDefault: !0
            }),
            e("click", {
              onElement: this.element,
              matchingSelector: l,
              withCallback: this.didClickDialogButton
            }),
            e("keydown", {
              onElement: this.element,
              matchingSelector: h,
              withCallback: this.didKeyDownDialogInput
            });
        }
        var a, u, c, l, h, p, d, f, g, m, y;
        return (
          o(s, r),
          (a = "button[data-action]"),
          (c = "button[data-attribute]"),
          (y = [a, c].join(", ")),
          (p = ".dialog[data-dialog]"),
          (u = p + ".active"),
          (l = p + " input[data-method]"),
          (h = p + " input[type=text], " + p + " input[type=url]"),
          (s.prototype.didClickActionButton = function(t, e) {
            var n, i, o;
            return (
              null != (i = this.delegate) && i.toolbarDidClickButton(),
              t.preventDefault(),
              (n = d(e)),
              this.getDialog(n)
                ? this.toggleDialog(n)
                : null != (o = this.delegate)
                  ? o.toolbarDidInvokeAction(n)
                  : void 0
            );
          }),
          (s.prototype.didClickAttributeButton = function(t, e) {
            var n, i, o;
            return (
              null != (i = this.delegate) && i.toolbarDidClickButton(),
              t.preventDefault(),
              (n = f(e)),
              this.getDialog(n)
                ? this.toggleDialog(n)
                : null != (o = this.delegate) && o.toolbarDidToggleAttribute(n),
              this.refreshAttributeButtons()
            );
          }),
          (s.prototype.didClickDialogButton = function(e, n) {
            var i, o;
            return (
              (i = t(n, { matchingSelector: p })),
              (o = n.getAttribute("data-method")),
              this[o].call(this, i)
            );
          }),
          (s.prototype.didKeyDownDialogInput = function(t, e) {
            var n, i;
            return (
              13 === t.keyCode &&
                (t.preventDefault(),
                (n = e.getAttribute("name")),
                (i = this.getDialog(n)),
                this.setAttribute(i)),
              27 === t.keyCode
                ? (t.preventDefault(), this.hideDialog())
                : void 0
            );
          }),
          (s.prototype.updateActions = function(t) {
            return (this.actions = t), this.refreshActionButtons();
          }),
          (s.prototype.refreshActionButtons = function() {
            return this.eachActionButton(
              (function(t) {
                return function(e, n) {
                  return (e.disabled = t.actions[n] === !1);
                };
              })(this)
            );
          }),
          (s.prototype.eachActionButton = function(t) {
            var e, n, i, o, r;
            for (
              o = this.element.querySelectorAll(a), r = [], n = 0, i = o.length;
              i > n;
              n++
            )
              (e = o[n]), r.push(t(e, d(e)));
            return r;
          }),
          (s.prototype.updateAttributes = function(t) {
            return (this.attributes = t), this.refreshAttributeButtons();
          }),
          (s.prototype.refreshAttributeButtons = function() {
            return this.eachAttributeButton(
              (function(t) {
                return function(e, n) {
                  return t.attributes[n] || t.dialogIsVisible(n)
                    ? e.classList.add("active")
                    : e.classList.remove("active");
                };
              })(this)
            );
          }),
          (s.prototype.eachAttributeButton = function(t) {
            var e, n, i, o, r;
            for (
              o = this.element.querySelectorAll(c), r = [], n = 0, i = o.length;
              i > n;
              n++
            )
              (e = o[n]), r.push(t(e, f(e)));
            return r;
          }),
          (s.prototype.applyKeyboardCommand = function(t) {
            var e, i, o, r, s, a, u;
            for (
              s = JSON.stringify(t.sort()),
                u = this.element.querySelectorAll("[data-key]"),
                r = 0,
                a = u.length;
              a > r;
              r++
            )
              if (
                ((e = u[r]),
                (o = e.getAttribute("data-key").split("+")),
                (i = JSON.stringify(o.sort())),
                i === s)
              )
                return n("mousedown", { onElement: e }), !0;
            return !1;
          }),
          (s.prototype.dialogIsVisible = function(t) {
            var e;
            return (e = this.getDialog(t))
              ? e.classList.contains("active")
              : void 0;
          }),
          (s.prototype.toggleDialog = function(t) {
            return this.dialogIsVisible(t)
              ? this.hideDialog()
              : this.showDialog(t);
          }),
          (s.prototype.showDialog = function(t) {
            var e, n, i, o, r, s;
            return (
              this.hideDialog(),
              null != (o = this.delegate) && o.toolbarWillShowDialog(),
              (n = this.getDialog(t)),
              n.classList.add("active"),
              (e = f(n)) &&
                (i = m(n, t)) &&
                (i.removeAttribute("disabled"),
                (i.value = null != (r = this.attributes[e]) ? r : ""),
                i.select()),
              null != (s = this.delegate) ? s.toolbarDidShowDialog(t) : void 0
            );
          }),
          (s.prototype.setAttribute = function(t) {
            var e, n, i;
            return (
              (e = f(t)),
              (n = m(t, e)),
              n.willValidate && !n.checkValidity()
                ? (n.classList.add("validate"), n.focus())
                : (null != (i = this.delegate) &&
                    i.toolbarDidUpdateAttribute(e, n.value),
                  this.hideDialog())
            );
          }),
          (s.prototype.removeAttribute = function(t) {
            var e, n;
            return (
              (e = f(t)),
              null != (n = this.delegate) && n.toolbarDidRemoveAttribute(e),
              this.hideDialog()
            );
          }),
          (s.prototype.hideDialog = function() {
            var t, e;
            return (t = this.element.querySelector(u))
              ? (t.classList.remove("active"),
                this.resetDialogInputs(),
                null != (e = this.delegate)
                  ? e.toolbarDidHideDialog(g(t))
                  : void 0)
              : void 0;
          }),
          (s.prototype.resetDialogInputs = function() {
            var t, e, n, i, o;
            for (
              i = this.element.querySelectorAll(h), o = [], t = 0, n = i.length;
              n > t;
              t++
            )
              (e = i[t]),
                e.setAttribute("disabled", "disabled"),
                o.push(e.classList.remove("validate"));
            return o;
          }),
          (s.prototype.getDialog = function(t) {
            return this.element.querySelector(".dialog[data-dialog=" + t + "]");
          }),
          (m = function(t, e) {
            return (
              null == e && (e = f(t)),
              t.querySelector("input[name='" + e + "']")
            );
          }),
          (d = function(t) {
            return t.getAttribute("data-action");
          }),
          (f = function(t) {
            return t.getAttribute("data-attribute");
          }),
          (g = function(t) {
            return t.getAttribute("data-dialog");
          }),
          s
        );
      })(Trix.BasicObject));
  }.call(this),
  function() {
    var t = function(t, n) {
        function i() {
          this.constructor = t;
        }
        for (var o in n) e.call(n, o) && (t[o] = n[o]);
        return (
          (i.prototype = n.prototype),
          (t.prototype = new i()),
          (t.__super__ = n.prototype),
          t
        );
      },
      e = {}.hasOwnProperty;
    Trix.ImagePreloadOperation = (function(e) {
      function n(t) {
        this.url = t;
      }
      return (
        t(n, e),
        (n.prototype.perform = function(t) {
          var e;
          return (
            (e = new Image()),
            (e.onload = (function(n) {
              return function() {
                return (
                  (e.width = n.width = e.naturalWidth),
                  (e.height = n.height = e.naturalHeight),
                  t(!0, e)
                );
              };
            })(this)),
            (e.onerror = function() {
              return t(!1);
            }),
            (e.src = this.url)
          );
        }),
        n
      );
    })(Trix.Operation);
  }.call(this),
  function() {
    var t = function(t, e) {
        return function() {
          return t.apply(e, arguments);
        };
      },
      e = function(t, e) {
        function i() {
          this.constructor = t;
        }
        for (var o in e) n.call(e, o) && (t[o] = e[o]);
        return (
          (i.prototype = e.prototype),
          (t.prototype = new i()),
          (t.__super__ = e.prototype),
          t
        );
      },
      n = {}.hasOwnProperty;
    Trix.Attachment = (function(n) {
      function i(e) {
        null == e && (e = {}),
          (this.releaseFile = t(this.releaseFile, this)),
          i.__super__.constructor.apply(this, arguments),
          (this.attributes = Trix.Hash.box(e)),
          this.didChangeAttributes();
      }
      return (
        e(i, n),
        (i.previewablePattern = /^image(\/(gif|png|jpe?g)|$)/),
        (i.attachmentForFile = function(t) {
          var e, n;
          return (
            (n = this.attributesForFile(t)), (e = new this(n)), e.setFile(t), e
          );
        }),
        (i.attributesForFile = function(t) {
          return new Trix.Hash({
            filename: t.name,
            filesize: t.size,
            contentType: t.type
          });
        }),
        (i.fromJSON = function(t) {
          return new this(t);
        }),
        (i.prototype.getAttribute = function(t) {
          return this.attributes.get(t);
        }),
        (i.prototype.hasAttribute = function(t) {
          return this.attributes.has(t);
        }),
        (i.prototype.getAttributes = function() {
          return this.attributes.toObject();
        }),
        (i.prototype.setAttributes = function(t) {
          var e, n;
          return (
            null == t && (t = {}),
            (e = this.attributes.merge(t)),
            this.attributes.isEqualTo(e)
              ? void 0
              : ((this.attributes = e),
                this.didChangeAttributes(),
                null != (n = this.delegate) &&
                "function" == typeof n.attachmentDidChangeAttributes
                  ? n.attachmentDidChangeAttributes(this)
                  : void 0)
          );
        }),
        (i.prototype.didChangeAttributes = function() {
          return this.isPreviewable() ? this.preloadURL() : void 0;
        }),
        (i.prototype.isPending = function() {
          return null != this.file && !(this.getURL() || this.getHref());
        }),
        (i.prototype.isPreviewable = function() {
          return this.attributes.has("previewable")
            ? this.attributes.get("previewable")
            : this.constructor.previewablePattern.test(this.getContentType());
        }),
        (i.prototype.getType = function() {
          return this.hasContent()
            ? "content"
            : this.isPreviewable()
              ? "preview"
              : "file";
        }),
        (i.prototype.getURL = function() {
          return this.attributes.get("url");
        }),
        (i.prototype.getHref = function() {
          return this.attributes.get("href");
        }),
        (i.prototype.getFilename = function() {
          var t;
          return null != (t = this.attributes.get("filename")) ? t : "";
        }),
        (i.prototype.getFilesize = function() {
          return this.attributes.get("filesize");
        }),
        (i.prototype.getFormattedFilesize = function() {
          var t;
          return (
            (t = this.attributes.get("filesize")),
            "number" == typeof t ? Trix.config.fileSize.formatter(t) : ""
          );
        }),
        (i.prototype.getExtension = function() {
          var t;
          return null != (t = this.getFilename().match(/\.(\w+)$/))
            ? t[1].toLowerCase()
            : void 0;
        }),
        (i.prototype.getContentType = function() {
          return this.attributes.get("contentType");
        }),
        (i.prototype.hasContent = function() {
          return this.attributes.has("content");
        }),
        (i.prototype.getContent = function() {
          return this.attributes.get("content");
        }),
        (i.prototype.getWidth = function() {
          return this.attributes.get("width");
        }),
        (i.prototype.getHeight = function() {
          return this.attributes.get("height");
        }),
        (i.prototype.getFile = function() {
          return this.file;
        }),
        (i.prototype.setFile = function(t) {
          return (
            (this.file = t), this.isPreviewable() ? this.preloadFile() : void 0
          );
        }),
        (i.prototype.releaseFile = function() {
          return this.releasePreloadedFile(), (this.file = null);
        }),
        (i.prototype.getUploadProgress = function() {
          var t;
          return null != (t = this.uploadProgress) ? t : 0;
        }),
        (i.prototype.setUploadProgress = function(t) {
          var e;
          return this.uploadProgress !== t
            ? ((this.uploadProgress = t),
              null != (e = this.uploadProgressDelegate) &&
              "function" == typeof e.attachmentDidChangeUploadProgress
                ? e.attachmentDidChangeUploadProgress(this)
                : void 0)
            : void 0;
        }),
        (i.prototype.toJSON = function() {
          return this.getAttributes();
        }),
        (i.prototype.getCacheKey = function(t) {
          var e;
          return (
            (e = [
              i.__super__.getCacheKey.apply(this, arguments),
              this.attributes.getCacheKey(),
              this.getPreloadedURL()
            ]),
            t && e.unshift(t),
            e.join("/")
          );
        }),
        (i.prototype.getPreloadedURL = function() {
          return this.preloadedURL;
        }),
        (i.prototype.preloadURL = function() {
          return this.preload(this.getURL(), this.releaseFile);
        }),
        (i.prototype.preloadFile = function() {
          return this.file
            ? ((this.fileObjectURL = URL.createObjectURL(this.file)),
              this.preload(this.fileObjectURL))
            : void 0;
        }),
        (i.prototype.releasePreloadedFile = function() {
          return this.fileObjectURL
            ? (URL.revokeObjectURL(this.fileObjectURL),
              (this.fileObjectURL = null))
            : void 0;
        }),
        (i.prototype.preload = function(t, e) {
          var n;
          return t && t !== this.preloadedURL
            ? (null == this.preloadedURL && (this.preloadedURL = t),
              (n = new Trix.ImagePreloadOperation(t)),
              n.then(
                (function(n) {
                  return function(i) {
                    var o, r, s;
                    return (
                      (s = i.width),
                      (o = i.height),
                      (n.preloadedURL = t),
                      n.setAttributes({ width: s, height: o }),
                      null != (r = n.previewDelegate) &&
                        "function" == typeof r.attachmentDidPreload &&
                        r.attachmentDidPreload(),
                      "function" == typeof e ? e() : void 0
                    );
                  };
                })(this)
              ))
            : void 0;
        }),
        i
      );
    })(Trix.Object);
  }.call(this),
  function() {
    var t = function(t, n) {
        function i() {
          this.constructor = t;
        }
        for (var o in n) e.call(n, o) && (t[o] = n[o]);
        return (
          (i.prototype = n.prototype),
          (t.prototype = new i()),
          (t.__super__ = n.prototype),
          t
        );
      },
      e = {}.hasOwnProperty;
    Trix.Piece = (function(e) {
      function n(t, e) {
        null == e && (e = {}),
          n.__super__.constructor.apply(this, arguments),
          (this.attributes = Trix.Hash.box(e));
      }
      return (
        t(n, e),
        (n.types = {}),
        (n.registerType = function(t, e) {
          return (e.type = t), (this.types[t] = e);
        }),
        (n.fromJSON = function(t) {
          var e;
          return (e = this.types[t.type]) ? e.fromJSON(t) : void 0;
        }),
        (n.prototype.copyWithAttributes = function(t) {
          return new this.constructor(this.getValue(), t);
        }),
        (n.prototype.copyWithAdditionalAttributes = function(t) {
          return this.copyWithAttributes(this.attributes.merge(t));
        }),
        (n.prototype.copyWithoutAttribute = function(t) {
          return this.copyWithAttributes(this.attributes.remove(t));
        }),
        (n.prototype.copy = function() {
          return this.copyWithAttributes(this.attributes);
        }),
        (n.prototype.getAttribute = function(t) {
          return this.attributes.get(t);
        }),
        (n.prototype.getAttributesHash = function() {
          return this.attributes;
        }),
        (n.prototype.getAttributes = function() {
          return this.attributes.toObject();
        }),
        (n.prototype.getCommonAttributes = function() {
          var t, e, n;
          return (n = pieceList.getPieceAtIndex(0))
            ? ((t = n.attributes),
              (e = t.getKeys()),
              pieceList.eachPiece(function(n) {
                return (
                  (e = t.getKeysCommonToHash(n.attributes)), (t = t.slice(e))
                );
              }),
              t.toObject())
            : {};
        }),
        (n.prototype.hasAttribute = function(t) {
          return this.attributes.has(t);
        }),
        (n.prototype.hasSameStringValueAsPiece = function(t) {
          return null != t && this.toString() === t.toString();
        }),
        (n.prototype.hasSameAttributesAsPiece = function(t) {
          return (
            null != t &&
            (this.attributes === t.attributes ||
              this.attributes.isEqualTo(t.attributes))
          );
        }),
        (n.prototype.isBlockBreak = function() {
          return !1;
        }),
        (n.prototype.isEqualTo = function(t) {
          return (
            n.__super__.isEqualTo.apply(this, arguments) ||
            (this.hasSameConstructorAs(t) &&
              this.hasSameStringValueAsPiece(t) &&
              this.hasSameAttributesAsPiece(t))
          );
        }),
        (n.prototype.isEmpty = function() {
          return 0 === this.length;
        }),
        (n.prototype.isSerializable = function() {
          return !0;
        }),
        (n.prototype.toJSON = function() {
          return {
            type: this.constructor.type,
            attributes: this.getAttributes()
          };
        }),
        (n.prototype.contentsForInspection = function() {
          return {
            type: this.constructor.type,
            attributes: this.attributes.inspect()
          };
        }),
        (n.prototype.canBeGrouped = function() {
          return this.hasAttribute("href");
        }),
        (n.prototype.canBeGroupedWith = function(t) {
          return this.getAttribute("href") === t.getAttribute("href");
        }),
        (n.prototype.getLength = function() {
          return this.length;
        }),
        (n.prototype.canBeConsolidatedWith = function() {
          return !1;
        }),
        n
      );
    })(Trix.Object);
  }.call(this),
  function() {
    var t = function(t, n) {
        function i() {
          this.constructor = t;
        }
        for (var o in n) e.call(n, o) && (t[o] = n[o]);
        return (
          (i.prototype = n.prototype),
          (t.prototype = new i()),
          (t.__super__ = n.prototype),
          t
        );
      },
      e = {}.hasOwnProperty;
    Trix.Piece.registerType(
      "attachment",
      (Trix.AttachmentPiece = (function(e) {
        function n(t) {
          (this.attachment = t),
            n.__super__.constructor.apply(this, arguments),
            (this.length = 1),
            this.ensureAttachmentExclusivelyHasAttribute("href");
        }
        return (
          t(n, e),
          (n.fromJSON = function(t) {
            return new this(
              Trix.Attachment.fromJSON(t.attachment),
              t.attributes
            );
          }),
          (n.prototype.ensureAttachmentExclusivelyHasAttribute = function(t) {
            return this.hasAttribute(t) && this.attachment.hasAttribute(t)
              ? (this.attributes = this.attributes.remove(t))
              : void 0;
          }),
          (n.prototype.getValue = function() {
            return this.attachment;
          }),
          (n.prototype.isSerializable = function() {
            return !this.attachment.isPending();
          }),
          (n.prototype.getCaption = function() {
            var t;
            return null != (t = this.attributes.get("caption")) ? t : "";
          }),
          (n.prototype.getAttributesForAttachment = function() {
            return this.attributes.slice(["caption"]);
          }),
          (n.prototype.canBeGrouped = function() {
            return (
              n.__super__.canBeGrouped.apply(this, arguments) &&
              !this.attachment.hasAttribute("href")
            );
          }),
          (n.prototype.isEqualTo = function(t) {
            var e;
            return (
              n.__super__.isEqualTo.apply(this, arguments) &&
              this.attachment.id ===
                (null != t && null != (e = t.attachment) ? e.id : void 0)
            );
          }),
          (n.prototype.toString = function() {
            return Trix.OBJECT_REPLACEMENT_CHARACTER;
          }),
          (n.prototype.toJSON = function() {
            var t;
            return (
              (t = n.__super__.toJSON.apply(this, arguments)),
              (t.attachment = this.attachment),
              t
            );
          }),
          (n.prototype.getCacheKey = function() {
            return [
              n.__super__.getCacheKey.apply(this, arguments),
              this.attachment.getCacheKey()
            ].join("/");
          }),
          (n.prototype.toConsole = function() {
            return JSON.stringify(this.toString());
          }),
          n
        );
      })(Trix.Piece))
    );
  }.call(this),
  function() {
    var t = function(t, n) {
        function i() {
          this.constructor = t;
        }
        for (var o in n) e.call(n, o) && (t[o] = n[o]);
        return (
          (i.prototype = n.prototype),
          (t.prototype = new i()),
          (t.__super__ = n.prototype),
          t
        );
      },
      e = {}.hasOwnProperty;
    Trix.Piece.registerType(
      "string",
      (Trix.StringPiece = (function(e) {
        function n(t) {
          n.__super__.constructor.apply(this, arguments),
            (this.string = t),
            (this.length = this.string.length);
        }
        return (
          t(n, e),
          (n.fromJSON = function(t) {
            return new this(t.string, t.attributes);
          }),
          (n.prototype.getValue = function() {
            return this.string;
          }),
          (n.prototype.toString = function() {
            return this.string.toString();
          }),
          (n.prototype.isBlockBreak = function() {
            return (
              "\n" === this.toString() && this.getAttribute("blockBreak") === !0
            );
          }),
          (n.prototype.toJSON = function() {
            var t;
            return (
              (t = n.__super__.toJSON.apply(this, arguments)),
              (t.string = this.string),
              t
            );
          }),
          (n.prototype.canBeConsolidatedWith = function(t) {
            return (
              null != t &&
              this.hasSameConstructorAs(t) &&
              this.hasSameAttributesAsPiece(t)
            );
          }),
          (n.prototype.consolidateWith = function(t) {
            return new this.constructor(
              this.toString() + t.toString(),
              this.attributes
            );
          }),
          (n.prototype.splitAtOffset = function(t) {
            var e, n;
            return (
              0 === t
                ? ((e = null), (n = this))
                : t === this.length
                  ? ((e = this), (n = null))
                  : ((e = new this.constructor(
                      this.string.slice(0, t),
                      this.attributes
                    )),
                    (n = new this.constructor(
                      this.string.slice(t),
                      this.attributes
                    ))),
              [e, n]
            );
          }),
          (n.prototype.toConsole = function() {
            var t;
            return (
              (t = this.string),
              t.length > 15 && (t = t.slice(0, 14) + "\u2026"),
              JSON.stringify(t.toString())
            );
          }),
          n
        );
      })(Trix.Piece))
    );
  }.call(this),
  function() {
    var t = function(t, n) {
        function i() {
          this.constructor = t;
        }
        for (var o in n) e.call(n, o) && (t[o] = n[o]);
        return (
          (i.prototype = n.prototype),
          (t.prototype = new i()),
          (t.__super__ = n.prototype),
          t
        );
      },
      e = {}.hasOwnProperty,
      n = [].slice;
    Trix.SplittableList = (function(e) {
      function i(t) {
        null == t && (t = []),
          i.__super__.constructor.apply(this, arguments),
          (this.objects = t.slice(0)),
          (this.length = this.objects.length);
      }
      var o, r, s;
      return (
        t(i, e),
        (i.box = function(t) {
          return t instanceof this ? t : new this(t);
        }),
        (i.prototype.eachObject = function(t) {
          var e, n, i, o, r, s;
          for (
            r = this.objects, s = [], n = e = 0, i = r.length;
            i > e;
            n = ++e
          )
            (o = r[n]), s.push(t(o, n));
          return s;
        }),
        (i.prototype.insertObjectAtIndex = function(t, e) {
          var n;
          return (
            (n = this.objects.slice(0)),
            n.splice(e, 0, t),
            new this.constructor(n)
          );
        }),
        (i.prototype.insertSplittableListAtIndex = function(t, e) {
          var i;
          return (
            (i = this.objects.slice(0)),
            i.splice.apply(i, [e, 0].concat(n.call(t.objects))),
            new this.constructor(i)
          );
        }),
        (i.prototype.insertSplittableListAtPosition = function(t, e) {
          var n, i, o;
          return (
            (o = this.splitObjectAtPosition(e)),
            (i = o[0]),
            (n = o[1]),
            new this.constructor(i).insertSplittableListAtIndex(t, n)
          );
        }),
        (i.prototype.editObjectAtIndex = function(t, e) {
          return this.replaceObjectAtIndex(e(this.objects[t]), t);
        }),
        (i.prototype.replaceObjectAtIndex = function(t, e) {
          var n;
          return (
            (n = this.objects.slice(0)),
            n.splice(e, 1, t),
            new this.constructor(n)
          );
        }),
        (i.prototype.removeObjectAtIndex = function(t) {
          var e;
          return (
            (e = this.objects.slice(0)), e.splice(t, 1), new this.constructor(e)
          );
        }),
        (i.prototype.getObjectAtIndex = function(t) {
          return this.objects[t];
        }),
        (i.prototype.getSplittableListInRange = function(t) {
          var e, n, i, o;
          return (
            (i = this.splitObjectsAtRange(t)),
            (n = i[0]),
            (e = i[1]),
            (o = i[2]),
            new this.constructor(n.slice(e, o + 1))
          );
        }),
        (i.prototype.selectSplittableList = function(t) {
          var e, n;
          return (
            (n = function() {
              var n, i, o, r;
              for (o = this.objects, r = [], n = 0, i = o.length; i > n; n++)
                (e = o[n]), t(e) && r.push(e);
              return r;
            }.call(this)),
            new this.constructor(n)
          );
        }),
        (i.prototype.removeObjectsInRange = function(t) {
          var e, n, i, o;
          return (
            (i = this.splitObjectsAtRange(t)),
            (n = i[0]),
            (e = i[1]),
            (o = i[2]),
            n.splice(e, o - e + 1),
            new this.constructor(n)
          );
        }),
        (i.prototype.transformObjectsInRange = function(t, e) {
          var n, i, o, r, s, a, u;
          return (
            (s = this.splitObjectsAtRange(t)),
            (r = s[0]),
            (i = s[1]),
            (a = s[2]),
            (u = (function() {
              var t, s, u;
              for (u = [], n = t = 0, s = r.length; s > t; n = ++t)
                (o = r[n]), u.push(n >= i && a >= n ? e(o) : o);
              return u;
            })()),
            new this.constructor(u)
          );
        }),
        (i.prototype.splitObjectsAtRange = function(t) {
          var e, n, i, r, a, u;
          return (
            (r = this.splitObjectAtPosition(s(t))),
            (n = r[0]),
            (e = r[1]),
            (i = r[2]),
            (a = new this.constructor(n).splitObjectAtPosition(o(t) + i)),
            (n = a[0]),
            (u = a[1]),
            [n, e, u - 1]
          );
        }),
        (i.prototype.getObjectAtPosition = function(t) {
          var e, n, i;
          return (
            (i = this.findIndexAndOffsetAtPosition(t)),
            (e = i.index),
            (n = i.offset),
            this.objects[e]
          );
        }),
        (i.prototype.splitObjectAtPosition = function(t) {
          var e, n, i, o, r, s, a, u, c, l;
          return (
            (s = this.findIndexAndOffsetAtPosition(t)),
            (e = s.index),
            (r = s.offset),
            (o = this.objects.slice(0)),
            null != e
              ? 0 === r
                ? ((c = e), (l = 0))
                : ((i = this.getObjectAtIndex(e)),
                  (a = i.splitAtOffset(r)),
                  (n = a[0]),
                  (u = a[1]),
                  o.splice(e, 1, n, u),
                  (c = e + 1),
                  (l = n.getLength() - r))
              : ((c = o.length), (l = 0)),
            [o, c, l]
          );
        }),
        (i.prototype.consolidate = function() {
          var t, e, n, i, o, r;
          for (
            i = [],
              o = this.objects[0],
              r = this.objects.slice(1),
              t = 0,
              e = r.length;
            e > t;
            t++
          )
            (n = r[t]),
              ("function" == typeof o.canBeConsolidatedWith
              ? o.canBeConsolidatedWith(n)
              : void 0)
                ? (o = o.consolidateWith(n))
                : (i.push(o), (o = n));
          return null != o && i.push(o), new this.constructor(i);
        }),
        (i.prototype.consolidateFromIndexToIndex = function(t, e) {
          var i, o, r;
          return (
            (o = this.objects.slice(0)),
            (r = o.slice(t, e + 1)),
            (i = new this.constructor(r).consolidate().toArray()),
            o.splice.apply(o, [t, r.length].concat(n.call(i))),
            new this.constructor(o)
          );
        }),
        (i.prototype.findIndexAndOffsetAtPosition = function(t) {
          var e, n, i, o, r, s, a;
          for (
            e = 0, a = this.objects, i = n = 0, o = a.length;
            o > n;
            i = ++n
          ) {
            if (((s = a[i]), (r = e + s.getLength()), t >= e && r > t))
              return { index: i, offset: t - e };
            e = r;
          }
          return { index: null, offset: null };
        }),
        (i.prototype.findPositionAtIndexAndOffset = function(t, e) {
          var n, i, o, r, s, a;
          for (s = 0, a = this.objects, n = i = 0, o = a.length; o > i; n = ++i)
            if (((r = a[n]), t > n)) s += r.getLength();
            else if (n === t) {
              s += e;
              break;
            }
          return s;
        }),
        (i.prototype.getEndPosition = function() {
          var t, e;
          return null != this.endPosition
            ? this.endPosition
            : (this.endPosition = function() {
                var n, i, o;
                for (e = 0, o = this.objects, n = 0, i = o.length; i > n; n++)
                  (t = o[n]), (e += t.getLength());
                return e;
              }.call(this));
        }),
        (i.prototype.toString = function() {
          return this.objects.join("");
        }),
        (i.prototype.toArray = function() {
          return this.objects.slice(0);
        }),
        (i.prototype.toJSON = function() {
          return this.toArray();
        }),
        (i.prototype.isEqualTo = function(t) {
          return (
            i.__super__.isEqualTo.apply(this, arguments) ||
            r(this.objects, null != t ? t.objects : void 0)
          );
        }),
        (r = function(t, e) {
          var n, i, o, r, s;
          if ((null == e && (e = []), t.length !== e.length)) return !1;
          for (s = !0, i = n = 0, o = t.length; o > n; i = ++n)
            (r = t[i]), s && !r.isEqualTo(e[i]) && (s = !1);
          return s;
        }),
        (i.prototype.contentsForInspection = function() {
          var t;
          return {
            objects:
              "[" +
              function() {
                var e, n, i, o;
                for (i = this.objects, o = [], e = 0, n = i.length; n > e; e++)
                  (t = i[e]), o.push(t.inspect());
                return o;
              }
                .call(this)
                .join(", ") +
              "]"
          };
        }),
        (s = function(t) {
          return t[0];
        }),
        (o = function(t) {
          return t[1];
        }),
        i
      );
    })(Trix.Object);
  }.call(this),
  function() {
    var t = function(t, n) {
        function i() {
          this.constructor = t;
        }
        for (var o in n) e.call(n, o) && (t[o] = n[o]);
        return (
          (i.prototype = n.prototype),
          (t.prototype = new i()),
          (t.__super__ = n.prototype),
          t
        );
      },
      e = {}.hasOwnProperty;
    Trix.Text = (function(e) {
      function n(t) {
        var e;
        null == t && (t = []),
          n.__super__.constructor.apply(this, arguments),
          (this.pieceList = new Trix.SplittableList(
            (function() {
              var n, i, o;
              for (o = [], n = 0, i = t.length; i > n; n++)
                (e = t[n]), e.isEmpty() || o.push(e);
              return o;
            })()
          ));
      }
      return (
        t(n, e),
        (n.textForAttachmentWithAttributes = function(t, e) {
          var n;
          return (n = new Trix.AttachmentPiece(t, e)), new this([n]);
        }),
        (n.textForStringWithAttributes = function(t, e) {
          var n;
          return (n = new Trix.StringPiece(t, e)), new this([n]);
        }),
        (n.fromJSON = function(t) {
          var e, n;
          return (
            (n = (function() {
              var n, i, o;
              for (o = [], n = 0, i = t.length; i > n; n++)
                (e = t[n]), o.push(Trix.Piece.fromJSON(e));
              return o;
            })()),
            new this(n)
          );
        }),
        (n.prototype.copy = function() {
          return this.copyWithPieceList(this.pieceList);
        }),
        (n.prototype.copyWithPieceList = function(t) {
          return new this.constructor(t.consolidate().toArray());
        }),
        (n.prototype.copyUsingObjectMap = function(t) {
          var e, n;
          return (
            (n = function() {
              var n, i, o, r, s;
              for (
                o = this.getPieces(), s = [], n = 0, i = o.length;
                i > n;
                n++
              )
                (e = o[n]), s.push(null != (r = t.find(e)) ? r : e);
              return s;
            }.call(this)),
            new this.constructor(n)
          );
        }),
        (n.prototype.appendText = function(t) {
          return this.insertTextAtPosition(t, this.getLength());
        }),
        (n.prototype.insertTextAtPosition = function(t, e) {
          return this.copyWithPieceList(
            this.pieceList.insertSplittableListAtPosition(t.pieceList, e)
          );
        }),
        (n.prototype.removeTextAtRange = function(t) {
          return this.copyWithPieceList(this.pieceList.removeObjectsInRange(t));
        }),
        (n.prototype.replaceTextAtRange = function(t, e) {
          return this.removeTextAtRange(e).insertTextAtPosition(t, e[0]);
        }),
        (n.prototype.moveTextFromRangeToPosition = function(t, e) {
          var n, i;
          if (!(t[0] <= e && e <= t[1]))
            return (
              (i = this.getTextAtRange(t)),
              (n = i.getLength()),
              t[0] < e && (e -= n),
              this.removeTextAtRange(t).insertTextAtPosition(i, e)
            );
        }),
        (n.prototype.addAttributeAtRange = function(t, e, n) {
          var i;
          return (i = {}), (i[t] = e), this.addAttributesAtRange(i, n);
        }),
        (n.prototype.addAttributesAtRange = function(t, e) {
          return this.copyWithPieceList(
            this.pieceList.transformObjectsInRange(e, function(e) {
              return e.copyWithAdditionalAttributes(t);
            })
          );
        }),
        (n.prototype.removeAttributeAtRange = function(t, e) {
          return this.copyWithPieceList(
            this.pieceList.transformObjectsInRange(e, function(e) {
              return e.copyWithoutAttribute(t);
            })
          );
        }),
        (n.prototype.setAttributesAtRange = function(t, e) {
          return this.copyWithPieceList(
            this.pieceList.transformObjectsInRange(e, function(e) {
              return e.copyWithAttributes(t);
            })
          );
        }),
        (n.prototype.getAttributesAtPosition = function(t) {
          var e, n;
          return null !=
            (e =
              null != (n = this.pieceList.getObjectAtPosition(t))
                ? n.getAttributes()
                : void 0)
            ? e
            : {};
        }),
        (n.prototype.getCommonAttributes = function() {
          var t, e;
          return (
            (t = function() {
              var t, n, i, o;
              for (
                i = this.pieceList.toArray(), o = [], t = 0, n = i.length;
                n > t;
                t++
              )
                (e = i[t]), o.push(e.getAttributes());
              return o;
            }.call(this)),
            Trix.Hash.fromCommonAttributesOfObjects(t).toObject()
          );
        }),
        (n.prototype.getCommonAttributesAtRange = function(t) {
          var e;
          return null != (e = this.getTextAtRange(t).getCommonAttributes())
            ? e
            : {};
        }),
        (n.prototype.getExpandedRangeForAttributeAtOffset = function(t, e) {
          var n, i, o;
          for (
            n = o = e, i = this.getLength();
            n > 0 && this.getCommonAttributesAtRange([n - 1, o])[t];

          )
            n--;
          for (; i > o && this.getCommonAttributesAtRange([e, o + 1])[t]; ) o++;
          return [n, o];
        }),
        (n.prototype.getTextAtRange = function(t) {
          return this.copyWithPieceList(
            this.pieceList.getSplittableListInRange(t)
          );
        }),
        (n.prototype.getStringAtRange = function(t) {
          return this.pieceList.getSplittableListInRange(t).toString();
        }),
        (n.prototype.startsWithString = function(t) {
          return this.getStringAtRange([0, t.length]) === t;
        }),
        (n.prototype.endsWithString = function(t) {
          var e;
          return (
            (e = this.getLength()),
            this.getStringAtRange([e - t.length, e]) === t
          );
        }),
        (n.prototype.getAttachmentPieces = function() {
          var t, e, n, i, o;
          for (
            i = this.pieceList.toArray(), o = [], t = 0, e = i.length;
            e > t;
            t++
          )
            (n = i[t]), null != n.attachment && o.push(n);
          return o;
        }),
        (n.prototype.getAttachments = function() {
          var t, e, n, i, o;
          for (
            i = this.getAttachmentPieces(), o = [], t = 0, e = i.length;
            e > t;
            t++
          )
            (n = i[t]), o.push(n.attachment);
          return o;
        }),
        (n.prototype.getAttachmentAndPositionById = function(t) {
          var e, n, i, o, r, s;
          for (
            o = 0, r = this.pieceList.toArray(), e = 0, n = r.length;
            n > e;
            e++
          ) {
            if (
              ((i = r[e]), (null != (s = i.attachment) ? s.id : void 0) === t)
            )
              return { attachment: i.attachment, position: o };
            o += i.length;
          }
          return { attachment: null, position: null };
        }),
        (n.prototype.getAttachmentById = function(t) {
          var e, n, i;
          return (
            (i = this.getAttachmentAndPositionById(t)),
            (e = i.attachment),
            (n = i.position),
            e
          );
        }),
        (n.prototype.getRangeOfAttachment = function(t) {
          var e, n;
          return (
            (n = this.getAttachmentAndPositionById(t.id)),
            (t = n.attachment),
            (e = n.position),
            null != t ? [e, e + 1] : void 0
          );
        }),
        (n.prototype.updateAttributesForAttachment = function(t, e) {
          var n;
          return (n = this.getRangeOfAttachment(e))
            ? this.addAttributesAtRange(t, n)
            : this;
        }),
        (n.prototype.getLength = function() {
          return this.pieceList.getEndPosition();
        }),
        (n.prototype.isEmpty = function() {
          return 0 === this.getLength();
        }),
        (n.prototype.isEqualTo = function(t) {
          var e;
          return (
            n.__super__.isEqualTo.apply(this, arguments) ||
            (null != t && null != (e = t.pieceList)
              ? e.isEqualTo(this.pieceList)
              : void 0)
          );
        }),
        (n.prototype.isBlockBreak = function() {
          return (
            1 === this.getLength() &&
            this.pieceList.getObjectAtIndex(0).isBlockBreak()
          );
        }),
        (n.prototype.eachPiece = function(t) {
          return this.pieceList.eachObject(t);
        }),
        (n.prototype.getPieces = function() {
          return this.pieceList.toArray();
        }),
        (n.prototype.getPieceAtPosition = function(t) {
          return this.pieceList.getObjectAtPosition(t);
        }),
        (n.prototype.contentsForInspection = function() {
          return { pieceList: this.pieceList.inspect() };
        }),
        (n.prototype.toSerializableText = function() {
          var t;
          return (
            (t = this.pieceList.selectSplittableList(function(t) {
              return t.isSerializable();
            })),
            this.copyWithPieceList(t)
          );
        }),
        (n.prototype.toString = function() {
          return this.pieceList.toString();
        }),
        (n.prototype.toJSON = function() {
          return this.pieceList.toJSON();
        }),
        (n.prototype.toConsole = function() {
          var t;
          return JSON.stringify(
            function() {
              var e, n, i, o;
              for (
                i = this.pieceList.toArray(), o = [], e = 0, n = i.length;
                n > e;
                e++
              )
                (t = i[e]), o.push(JSON.parse(t.toConsole()));
              return o;
            }.call(this)
          );
        }),
        n
      );
    })(Trix.Object);
  }.call(this),
  function() {
    var t,
      e = function(t, e) {
        function i() {
          this.constructor = t;
        }
        for (var o in e) n.call(e, o) && (t[o] = e[o]);
        return (
          (i.prototype = e.prototype),
          (t.prototype = new i()),
          (t.__super__ = e.prototype),
          t
        );
      },
      n = {}.hasOwnProperty,
      i = [].slice;
    (t = Trix.arraysAreEqual),
      (Trix.Block = (function(n) {
        function o(t, e) {
          null == t && (t = new Trix.Text()),
            null == e && (e = []),
            o.__super__.constructor.apply(this, arguments),
            (this.text = s(t)),
            (this.attributes = e);
        }
        var r, s, a, u, c, l, h, p;
        return (
          e(o, n),
          (o.fromJSON = function(t) {
            var e;
            return (e = Trix.Text.fromJSON(t.text)), new this(e, t.attributes);
          }),
          (o.prototype.isEmpty = function() {
            return this.text.isBlockBreak();
          }),
          (o.prototype.isEqualTo = function(e) {
            return (
              o.__super__.isEqualTo.apply(this, arguments) ||
              (this.text.isEqualTo(null != e ? e.text : void 0) &&
                t(this.attributes, null != e ? e.attributes : void 0))
            );
          }),
          (o.prototype.copyWithText = function(t) {
            return new this.constructor(t, this.attributes);
          }),
          (o.prototype.copyWithoutText = function() {
            return this.copyWithText(null);
          }),
          (o.prototype.copyWithAttributes = function(t) {
            return new this.constructor(this.text, t);
          }),
          (o.prototype.copyUsingObjectMap = function(t) {
            var e;
            return this.copyWithText(
              (e = t.find(this.text)) ? e : this.text.copyUsingObjectMap(t)
            );
          }),
          (o.prototype.addAttribute = function(t) {
            var e, n;
            return (
              (n = Trix.config.blockAttributes[t].listAttribute),
              (e = this.attributes.concat(n ? [n, t] : [t])),
              this.copyWithAttributes(e)
            );
          }),
          (o.prototype.removeAttribute = function(t) {
            var e, n;
            return (
              (n = Trix.config.blockAttributes[t].listAttribute),
              (e = c(this.attributes, t)),
              null != n && (e = c(e, n)),
              this.copyWithAttributes(e)
            );
          }),
          (o.prototype.removeLastAttribute = function() {
            return this.removeAttribute(this.getLastAttribute());
          }),
          (o.prototype.getLastAttribute = function() {
            return u(this.attributes);
          }),
          (o.prototype.getAttributes = function() {
            return this.attributes.slice(0);
          }),
          (o.prototype.getAttributeLevel = function() {
            return this.attributes.length;
          }),
          (o.prototype.getAttributeAtLevel = function(t) {
            return this.attributes[t - 1];
          }),
          (o.prototype.hasAttributes = function() {
            return this.getAttributeLevel() > 0;
          }),
          (o.prototype.getConfig = function(t) {
            var e, n;
            if (
              (e = this.getLastAttribute()) &&
              (n = Trix.config.blockAttributes[e])
            )
              return t ? n[t] : n;
          }),
          (o.prototype.isListItem = function() {
            return null != this.getConfig("listAttribute");
          }),
          (o.prototype.findLineBreakInDirectionFromPosition = function(t, e) {
            var n, i;
            return (
              (i = this.toString()),
              (n = (function() {
                switch (t) {
                  case "forward":
                    return i.indexOf("\n", e);
                  case "backward":
                    return i.slice(0, e).lastIndexOf("\n");
                }
              })()),
              -1 !== n ? n : void 0
            );
          }),
          (o.prototype.contentsForInspection = function() {
            return { text: this.text.inspect(), attributes: this.attributes };
          }),
          (o.prototype.toString = function() {
            return this.text.toString();
          }),
          (o.prototype.toJSON = function() {
            return { text: this.text, attributes: this.attributes };
          }),
          (o.prototype.getLength = function() {
            return this.text.getLength();
          }),
          (o.prototype.canBeConsolidatedWith = function(t) {
            return !this.hasAttributes() && !t.hasAttributes();
          }),
          (o.prototype.consolidateWith = function(t) {
            var e, n;
            return (
              (e = Trix.Text.textForStringWithAttributes("\n")),
              (n = this.getTextWithoutBlockBreak().appendText(e)),
              this.copyWithText(n.appendText(t.text))
            );
          }),
          (o.prototype.splitAtOffset = function(t) {
            var e, n;
            return (
              0 === t
                ? ((e = null), (n = this))
                : t === this.getLength()
                  ? ((e = this), (n = null))
                  : ((e = this.copyWithText(this.text.getTextAtRange([0, t]))),
                    (n = this.copyWithText(
                      this.text.getTextAtRange([t, this.getLength()])
                    ))),
              [e, n]
            );
          }),
          (o.prototype.toString = function() {
            return this.text.toString();
          }),
          (o.prototype.getBlockBreakPosition = function() {
            return this.text.getLength() - 1;
          }),
          (o.prototype.getTextWithoutBlockBreak = function() {
            return l(this.text)
              ? this.text.getTextAtRange([0, this.getBlockBreakPosition()])
              : this.text.copy();
          }),
          (o.prototype.canBeGrouped = function(t) {
            return this.attributes[t];
          }),
          (o.prototype.canBeGroupedWith = function(t, e) {
            var n, i, o, r;
            return (
              (n = this.attributes),
              (i = t.getAttributes()),
              n[e] === i[e]
                ? ("bullet" !== (o = n[e]) && "number" !== o) ||
                  "bulletList" === (r = i[e + 1]) ||
                  "numberList" === r
                  ? !0
                  : !1
                : void 0
            );
          }),
          (s = function(t) {
            return (t = p(t)), (t = r(t));
          }),
          (p = function(t) {
            var e, n, o, r, s, a;
            return (
              (r = !1),
              (a = t.getPieces()),
              (n =
                2 <= a.length
                  ? i.call(a, 0, (e = a.length - 1))
                  : ((e = 0), [])),
              (o = a[e++]),
              null == o
                ? t
                : ((n = (function() {
                    var t, e, i;
                    for (i = [], t = 0, e = n.length; e > t; t++)
                      (s = n[t]),
                        s.isBlockBreak() ? ((r = !0), i.push(h(s))) : i.push(s);
                    return i;
                  })()),
                  r ? new Trix.Text(i.call(n).concat([o])) : t)
            );
          }),
          (a = Trix.Text.textForStringWithAttributes("\n", { blockBreak: !0 })),
          (r = function(t) {
            return l(t) ? t : t.appendText(a);
          }),
          (l = function(t) {
            var e, n;
            return (
              (n = t.getLength()),
              0 === n
                ? !1
                : ((e = t.getTextAtRange([n - 1, n])), e.isBlockBreak())
            );
          }),
          (h = function(t) {
            return t.copyWithoutAttribute("blockBreak");
          }),
          (c = function(t, e) {
            return u(t) === e ? t.slice(0, -1) : t;
          }),
          (u = function(t) {
            return t.slice(-1)[0];
          }),
          o
        );
      })(Trix.Object));
  }.call(this),
  function() {
    var t,
      e,
      n,
      i,
      o,
      r,
      s,
      a,
      u = function(t, e) {
        function n() {
          this.constructor = t;
        }
        for (var i in e) c.call(e, i) && (t[i] = e[i]);
        return (
          (n.prototype = e.prototype),
          (t.prototype = new n()),
          (t.__super__ = e.prototype),
          t
        );
      },
      c = {}.hasOwnProperty,
      l =
        [].indexOf ||
        function(t) {
          for (var e = 0, n = this.length; n > e; e++)
            if (e in this && this[e] === t) return e;
          return -1;
        },
      h = [].slice;
    (t = Trix.arraysAreEqual),
      (r = Trix.normalizeSpaces),
      (i = Trix.makeElement),
      (s = Trix.tagName),
      (a = Trix.walkTree),
      (n = Trix.findClosestElementFromNode),
      (e = Trix.elementContainsNode),
      (o = Trix.nodeIsAttachmentElement),
      (Trix.HTMLParser = (function(c) {
        function p(t, e) {
          (this.html = t),
            (this.referenceElement = (null != e ? e : {}).referenceElement),
            (this.blocks = []),
            (this.blockElements = []),
            (this.processedElements = []);
        }
        var d, f, g, m, y, v, b, A, x, T;
        return (
          u(p, c),
          (d = "style href src width height class".split(" ")),
          (p.parse = function(t, e) {
            var n;
            return (n = new this(t, e)), n.parse(), n;
          }),
          (p.prototype.getDocument = function() {
            return Trix.Document.fromJSON(this.blocks);
          }),
          (p.prototype.parse = function() {
            var t, e;
            try {
              for (
                this.createHiddenContainer(),
                  t = T(this.html),
                  this.containerElement.innerHTML = t,
                  e = a(this.containerElement, { usingFilter: v });
                e.nextNode();

              )
                this.processNode(e.currentNode);
              return this.translateBlockElementMarginsToNewlines();
            } finally {
              this.removeHiddenContainer();
            }
          }),
          (v = function(t) {
            return "style" === s(t)
              ? NodeFilter.FILTER_REJECT
              : NodeFilter.FILTER_ACCEPT;
          }),
          (p.prototype.createHiddenContainer = function() {
            return this.referenceElement
              ? ((this.containerElement = this.referenceElement.cloneNode(!1)),
                this.containerElement.removeAttribute("id"),
                this.containerElement.setAttribute("data-trix-internal", ""),
                (this.containerElement.style.display = "none"),
                this.referenceElement.parentNode.insertBefore(
                  this.containerElement,
                  this.referenceElement.nextSibling
                ))
              : ((this.containerElement = i({
                  tagName: "div",
                  style: { display: "none" }
                })),
                document.body.appendChild(this.containerElement));
          }),
          (p.prototype.removeHiddenContainer = function() {
            return this.containerElement.parentNode.removeChild(
              this.containerElement
            );
          }),
          (p.prototype.processNode = function(t) {
            switch (t.nodeType) {
              case Node.TEXT_NODE:
                return this.processTextNode(t);
              case Node.ELEMENT_NODE:
                return this.appendBlockForElement(t), this.processElement(t);
            }
          }),
          (p.prototype.appendBlockForElement = function(n) {
            var i, o;
            if (this.isBlockElement(n) && !this.isBlockElement(n.firstChild)) {
              if (
                ((i = this.getBlockAttributes(n)),
                !e(this.currentBlockElement, n) ||
                  !t(i, this.currentBlock.attributes))
              )
                return (
                  (this.currentBlock = this.appendBlockForAttributesWithElement(
                    i,
                    n
                  )),
                  (this.currentBlockElement = n)
                );
            } else if (
              this.currentBlockElement &&
              !e(this.currentBlockElement, n) &&
              !this.isBlockElement(n)
            )
              return (o = this.findParentBlockElement(n))
                ? this.appendBlockForElement(o)
                : ((this.currentBlock = this.appendEmptyBlock()),
                  (this.currentBlockElement = null));
          }),
          (p.prototype.findParentBlockElement = function(t) {
            var e;
            for (e = t.parentElement; e && e !== this.containerElement; ) {
              if (this.isBlockElement(e) && l.call(this.blockElements, e) >= 0)
                return e;
              e = e.parentElement;
            }
            return null;
          }),
          (p.prototype.isExtraBR = function(t) {
            return (
              "br" === s(t) &&
              this.isBlockElement(t.parentNode) &&
              t.parentNode.lastChild === t
            );
          }),
          (p.prototype.isBlockElement = function(t) {
            var e;
            if (
              (null != t ? t.nodeType : void 0) === Node.ELEMENT_NODE &&
              !n(t, { matchingSelector: "td" })
            )
              return (
                (e = s(t)),
                l.call(this.getBlockTagNames(), e) >= 0 ||
                  "block" === window.getComputedStyle(t).display
              );
          }),
          (p.prototype.getBlockTagNames = function() {
            var t, e;
            return null != this.blockTagNames
              ? this.blockTagNames
              : (this.blockTagNames = (function() {
                  var n, i;
                  (n = Trix.config.blockAttributes), (i = []);
                  for (t in n) (e = n[t]), i.push(e.tagName);
                  return i;
                })());
          }),
          (p.prototype.processTextNode = function(t) {
            var e;
            return (e = r(t.data))
              ? this.appendStringWithAttributes(
                  e,
                  this.getTextAttributes(t.parentNode)
                )
              : void 0;
          }),
          (p.prototype.processElement = function(t) {
            var e, n, i, r, a;
            if (o(t))
              return (
                (e = g(t)),
                Object.keys(e).length &&
                  ((r = this.getTextAttributes(t)),
                  this.appendAttachmentWithAttributes(e, r),
                  (t.innerHTML = "")),
                this.processedElements.push(t)
              );
            switch (s(t)) {
              case "br":
                return (
                  this.isExtraBR(t) ||
                    this.isBlockElement(t.nextSibling) ||
                    this.appendStringWithAttributes(
                      "\n",
                      this.getTextAttributes(t)
                    ),
                  this.processedElements.push(t)
                );
              case "img":
                (e = { url: t.getAttribute("src"), contentType: "image" }),
                  (i = y(t));
                for (n in i) (a = i[n]), (e[n] = a);
                return (
                  this.appendAttachmentWithAttributes(
                    e,
                    this.getTextAttributes(t)
                  ),
                  this.processedElements.push(t)
                );
              case "tr":
                if (t.parentNode.firstChild !== t)
                  return this.appendStringWithAttributes("\n");
                break;
              case "td":
                if (t.parentNode.firstChild !== t)
                  return this.appendStringWithAttributes(" | ");
            }
          }),
          (p.prototype.appendBlockForAttributesWithElement = function(t, e) {
            var n;
            return (
              this.blockElements.push(e), (n = f(t)), this.blocks.push(n), n
            );
          }),
          (p.prototype.appendEmptyBlock = function() {
            return this.appendBlockForAttributesWithElement([], null);
          }),
          (p.prototype.appendStringWithAttributes = function(t, e) {
            return this.appendPiece(A(t, e));
          }),
          (p.prototype.appendAttachmentWithAttributes = function(t, e) {
            return this.appendPiece(b(t, e));
          }),
          (p.prototype.appendPiece = function(t) {
            return (
              0 === this.blocks.length && this.appendEmptyBlock(),
              this.blocks[this.blocks.length - 1].text.push(t)
            );
          }),
          (p.prototype.appendStringToTextAtIndex = function(t, e) {
            var n, i;
            return (
              (i = this.blocks[e].text),
              (n = i[i.length - 1]),
              "string" === (null != n ? n.type : void 0)
                ? (n.string += t)
                : i.push(A(t))
            );
          }),
          (p.prototype.prependStringToTextAtIndex = function(t, e) {
            var n, i;
            return (
              (i = this.blocks[e].text),
              (n = i[0]),
              "string" === (null != n ? n.type : void 0)
                ? (n.string = t + n.string)
                : i.unshift(A(t))
            );
          }),
          (p.prototype.getTextAttributes = function(t) {
            var e, n, i, r, a, u, c, l;
            (n = {}), (u = Trix.config.textAttributes);
            for (e in u)
              (i = u[e]),
                i.parser
                  ? (l = i.parser(t)) && (n[e] = l)
                  : i.tagName && s(t) === i.tagName && (n[e] = !0);
            if (o(t) && (r = t.dataset.trixAttributes)) {
              c = JSON.parse(r);
              for (a in c) (l = c[a]), (n[a] = l);
            }
            return n;
          }),
          (p.prototype.getBlockAttributes = function(t) {
            var e, n, i, o;
            for (n = []; t && t !== this.containerElement; ) {
              o = Trix.config.blockAttributes;
              for (e in o)
                (i = o[e]),
                  i.parse !== !1 &&
                    s(t) === i.tagName &&
                    (("function" == typeof i.test ? i.test(t) : void 0) ||
                      !i.test) &&
                    (n.push(e), i.listAttribute && n.push(i.listAttribute));
              t = t.parentNode;
            }
            return n.reverse();
          }),
          (p.prototype.getMarginOfBlockElementAtIndex = function(t) {
            var e, n;
            return !(e = this.blockElements[t]) ||
              ((n = s(e)),
              l.call(this.getBlockTagNames(), n) >= 0 ||
                l.call(this.processedElements, e) >= 0)
              ? void 0
              : m(e);
          }),
          (p.prototype.getMarginOfDefaultBlockElement = function() {
            var t;
            return (
              (t = i(Trix.config.blockAttributes["default"].tagName)),
              this.containerElement.appendChild(t),
              m(t)
            );
          }),
          (p.prototype.translateBlockElementMarginsToNewlines = function() {
            var t, e, n, i, o, r, s, a;
            for (
              e = this.getMarginOfDefaultBlockElement(),
                s = this.blocks,
                a = [],
                i = n = 0,
                o = s.length;
              o > n;
              i = ++n
            )
              (t = s[i]),
                (r = this.getMarginOfBlockElementAtIndex(i)) &&
                  (r.top > 2 * e.top &&
                    this.prependStringToTextAtIndex("\n", i),
                  a.push(
                    r.bottom > 2 * e.bottom
                      ? this.appendStringToTextAtIndex("\n", i)
                      : void 0
                  ));
            return a;
          }),
          (A = function(t, e) {
            var n;
            return (
              null == e && (e = {}),
              (n = "string"),
              { string: t, attributes: e, type: n }
            );
          }),
          (b = function(t, e) {
            var n;
            return (
              null == e && (e = {}),
              (n = "attachment"),
              { attachment: t, attributes: e, type: n }
            );
          }),
          (f = function(t) {
            var e;
            return null == t && (t = {}), (e = []), { text: e, attributes: t };
          }),
          (g = function(t) {
            return JSON.parse(t.dataset.trixAttachment);
          }),
          (T = function(t) {
            var e, n, i, o, r, s, u, c, p, f, g, m, y, v, b, A, T;
            for (
              t = x(t),
                n = document.implementation.createHTMLDocument(""),
                n.documentElement.innerHTML = t,
                e = n.body,
                o = n.head,
                v = o.querySelectorAll("style"),
                r = 0,
                c = v.length;
              c > r;
              r++
            )
              (A = v[r]), e.appendChild(A);
            for (y = [], T = a(e); T.nextNode(); )
              switch (((m = T.currentNode), m.nodeType)) {
                case Node.ELEMENT_NODE:
                  for (
                    i = m, b = h.call(i.attributes), s = 0, p = b.length;
                    p > s;
                    s++
                  )
                    (g = b[s].name),
                      l.call(d, g) >= 0 ||
                        0 === g.indexOf("data-trix") ||
                        i.removeAttribute(g);
                  break;
                case Node.COMMENT_NODE:
                  y.push(m);
                  break;
                case Node.TEXT_NODE:
                  m.data.match(/^\s*$/) && m.parentNode === e && y.push(m);
              }
            for (u = 0, f = y.length; f > u; u++)
              (m = y[u]), m.parentNode.removeChild(m);
            return e.innerHTML;
          }),
          (x = function(t) {
            return t.replace(/>\n+</g, "><").replace(/>\ +</g, "> <");
          }),
          (m = function(t) {
            var e;
            return (
              (e = window.getComputedStyle(t)),
              "block" === e.display
                ? {
                    top: parseInt(e.marginTop),
                    bottom: parseInt(e.marginBottom)
                  }
                : void 0
            );
          }),
          (y = function(t) {
            var e, n, i;
            return (
              (i = t.getAttribute("width")),
              (n = t.getAttribute("height")),
              (e = {}),
              i && (e.width = parseInt(i, 10)),
              n && (e.height = parseInt(n, 10)),
              e
            );
          }),
          p
        );
      })(Trix.BasicObject));
  }.call(this),
  function() {
    var t,
      e,
      n,
      i = function(t, e) {
        function n() {
          this.constructor = t;
        }
        for (var i in e) o.call(e, i) && (t[i] = e[i]);
        return (
          (n.prototype = e.prototype),
          (t.prototype = new n()),
          (t.__super__ = e.prototype),
          t
        );
      },
      o = {}.hasOwnProperty,
      r = [].slice,
      s =
        [].indexOf ||
        function(t) {
          for (var e = 0, n = this.length; n > e; e++)
            if (e in this && this[e] === t) return e;
          return -1;
        };
    (t = Trix.arraysAreEqual),
      (e = Trix.normalizeRange),
      (n = Trix.rangeIsCollapsed),
      (Trix.Document = (function(o) {
        function a(t) {
          null == t && (t = []),
            a.__super__.constructor.apply(this, arguments),
            0 === t.length && (t = [new Trix.Block()]),
            (this.blockList = Trix.SplittableList.box(t));
        }
        var u;
        return (
          i(a, o),
          (a.fromJSON = function(t) {
            var e, n;
            return (
              (n = (function() {
                var n, i, o;
                for (o = [], n = 0, i = t.length; i > n; n++)
                  (e = t[n]), o.push(Trix.Block.fromJSON(e));
                return o;
              })()),
              new this(n)
            );
          }),
          (a.fromHTML = function(t, e) {
            return Trix.HTMLParser.parse(t, e).getDocument();
          }),
          (a.fromString = function(t, e) {
            var n;
            return (
              (n = Trix.Text.textForStringWithAttributes(t, e)),
              new this([new Trix.Block(n)])
            );
          }),
          (a.prototype.isEmpty = function() {
            var t;
            return (
              1 === this.blockList.length &&
              ((t = this.getBlockAtIndex(0)), t.isEmpty() && !t.hasAttributes())
            );
          }),
          (a.prototype.copy = function(t) {
            var e;
            return (
              null == t && (t = {}),
              (e = t.consolidateBlocks
                ? this.blockList.consolidate().toArray()
                : this.blockList.toArray()),
              new this.constructor(e)
            );
          }),
          (a.prototype.copyUsingObjectsFromDocument = function(t) {
            var e;
            return (
              (e = new Trix.ObjectMap(t.getObjects())),
              this.copyUsingObjectMap(e)
            );
          }),
          (a.prototype.copyUsingObjectMap = function(t) {
            var e, n, i;
            return (
              (n = function() {
                var n, o, r, s;
                for (
                  r = this.getBlocks(), s = [], n = 0, o = r.length;
                  o > n;
                  n++
                )
                  (e = r[n]),
                    s.push((i = t.find(e)) ? i : e.copyUsingObjectMap(t));
                return s;
              }.call(this)),
              new this.constructor(n)
            );
          }),
          (a.prototype.copyWithBaseBlockAttributes = function(t) {
            var e, n, i;
            return (
              null == t && (t = []),
              (i = function() {
                var i, o, r, s;
                for (
                  r = this.getBlocks(), s = [], i = 0, o = r.length;
                  o > i;
                  i++
                )
                  (n = r[i]),
                    (e = t.concat(n.getAttributes())),
                    s.push(n.copyWithAttributes(e));
                return s;
              }.call(this)),
              new this.constructor(i)
            );
          }),
          (a.prototype.insertDocumentAtRange = function(t, i) {
            var o, r, s, a, u, c, l;
            return (
              (r = t.blockList),
              (u = (i = e(i))[0]),
              (c = this.locationFromPosition(u)),
              (s = c.index),
              (a = c.offset),
              (l = this),
              (o = this.getBlockAtPosition(u)),
              n(i) && o.isEmpty() && !o.hasAttributes()
                ? (l = new this.constructor(l.blockList.removeObjectAtIndex(s)))
                : o.getBlockBreakPosition() === a && u++,
              (l = l.removeTextAtRange(i)),
              new this.constructor(
                l.blockList.insertSplittableListAtPosition(r, u)
              )
            );
          }),
          (a.prototype.mergeDocumentAtRange = function(n, i) {
            var o, r, s, a, u, c, l, h, p, d, f, g;
            return (
              (f = (i = e(i))[0]),
              (d = this.locationFromPosition(f)),
              (r = this.getBlockAtIndex(d.index).getAttributes()),
              (o = n.getBaseBlockAttributes()),
              (g = r.slice(-o.length)),
              t(o, g)
                ? ((l = r.slice(0, -o.length)),
                  (c = n.copyWithBaseBlockAttributes(l)))
                : (c = n
                    .copy({ consolidateBlocks: !0 })
                    .copyWithBaseBlockAttributes(r)),
              (s = c.getBlockCount()),
              (a = c.getBlockAtIndex(0)),
              t(r, a.getAttributes())
                ? ((u = a.getTextWithoutBlockBreak()),
                  (p = this.insertTextAtRange(u, i)),
                  s > 1 &&
                    ((c = new this.constructor(c.getBlocks().slice(1))),
                    (h = f + u.getLength()),
                    (p = p.insertDocumentAtRange(c, h))))
                : (p = this.insertDocumentAtRange(c, i)),
              p
            );
          }),
          (a.prototype.insertTextAtRange = function(t, n) {
            var i, o, r, s, a;
            return (
              (a = (n = e(n))[0]),
              (s = this.locationFromPosition(a)),
              (o = s.index),
              (r = s.offset),
              (i = this.removeTextAtRange(n)),
              new this.constructor(
                i.blockList.editObjectAtIndex(o, function(e) {
                  return e.copyWithText(e.text.insertTextAtPosition(t, r));
                })
              )
            );
          }),
          (a.prototype.removeTextAtRange = function(t) {
            var i, o, r, s, a, u, c, l, h, p, d, f, g, m, y, v, b;
            return (
              (h = t = e(t)),
              (y = h[0]),
              (s = h[1]),
              n(t)
                ? this
                : ((c = this.locationFromPosition(y)),
                  (u = c.index),
                  (a = this.getBlockAtIndex(u)),
                  (l = a.text.getTextAtRange([0, c.offset])),
                  (g = this.locationFromPosition(s)),
                  (f = g.index),
                  (d = this.getBlockAtIndex(f)),
                  (m = d.text.getTextAtRange([g.offset, d.getLength()])),
                  (v = l.appendText(m)),
                  (p = u !== f && 0 === c.offset),
                  (b = p && a.getAttributeLevel() >= d.getAttributeLevel()),
                  (o = b ? d.copyWithText(v) : a.copyWithText(v)),
                  (r = this.blockList.toArray()),
                  (i = f + 1 - u),
                  r.splice(u, i, o),
                  new this.constructor(r))
            );
          }),
          (a.prototype.moveTextFromRangeToPosition = function(t, n) {
            var i, o, s, a, u, c, l, h, p, d;
            if (((c = t = e(t)), (p = c[0]), (s = c[1]), n >= p && s >= n))
              return this;
            if (
              ((o = this.getDocumentAtRange(t)),
              (h = this.removeTextAtRange(t)),
              (u = n > p),
              u && (n -= o.getLength()),
              !h.firstBlockInRangeIsEntirelySelected(t))
            ) {
              if (
                ((l = o.getBlocks()),
                (a = l[0]),
                (i = 2 <= l.length ? r.call(l, 1) : []),
                0 === i.length
                  ? ((d = a.getTextWithoutBlockBreak()), u && (n += 1))
                  : (d = a.text),
                (h = h.insertTextAtRange(d, n)),
                0 === i.length)
              )
                return h;
              (o = new this.constructor(i)), (n += d.getLength());
            }
            return h.insertDocumentAtRange(o, n);
          }),
          (a.prototype.addAttributeAtRange = function(t, e, n) {
            var i;
            return (
              (i = this.blockList),
              this.eachBlockAtRange(n, function(n, o, r) {
                return (i = i.editObjectAtIndex(r, function() {
                  return Trix.config.blockAttributes[t]
                    ? n.addAttribute(t, e)
                    : o[0] === o[1]
                      ? n
                      : n.copyWithText(n.text.addAttributeAtRange(t, e, o));
                }));
              }),
              new this.constructor(i)
            );
          }),
          (a.prototype.addAttribute = function(t, e) {
            var n;
            return (
              (n = this.blockList),
              this.eachBlock(function(i, o) {
                return (n = n.editObjectAtIndex(o, function() {
                  return i.addAttribute(t, e);
                }));
              }),
              new this.constructor(n)
            );
          }),
          (a.prototype.removeAttributeAtRange = function(t, e) {
            var n;
            return (
              (n = this.blockList),
              this.eachBlockAtRange(e, function(e, i, o) {
                return Trix.config.blockAttributes[t]
                  ? (n = n.editObjectAtIndex(o, function() {
                      return e.removeAttribute(t);
                    }))
                  : i[0] !== i[1]
                    ? (n = n.editObjectAtIndex(o, function() {
                        return e.copyWithText(
                          e.text.removeAttributeAtRange(t, i)
                        );
                      }))
                    : void 0;
              }),
              new this.constructor(n)
            );
          }),
          (a.prototype.updateAttributesForAttachment = function(t, e) {
            var n, i, o, r;
            return (
              (o = (i = this.getRangeOfAttachment(e))[0]),
              (n = this.locationFromPosition(o).index),
              (r = this.getTextAtIndex(n)),
              new this.constructor(
                this.blockList.editObjectAtIndex(n, function(n) {
                  return n.copyWithText(r.updateAttributesForAttachment(t, e));
                })
              )
            );
          }),
          (a.prototype.removeAttributeForAttachment = function(t, e) {
            var n;
            return (
              (n = this.getRangeOfAttachment(e)),
              this.removeAttributeAtRange(t, n)
            );
          }),
          (a.prototype.insertBlockBreakAtRange = function(t) {
            var n, i, o, r;
            return (
              (r = (t = e(t))[0]),
              (o = this.locationFromPosition(r).offset),
              (i = this.removeTextAtRange(t)),
              0 === o && (n = [new Trix.Block()]),
              new this.constructor(
                i.blockList.insertSplittableListAtPosition(
                  new Trix.SplittableList(n),
                  r
                )
              )
            );
          }),
          (a.prototype.applyBlockAttributeAtRange = function(t, e, n) {
            var i, o, r;
            return (
              (o = this.expandRangeToLineBreaksAndSplitBlocks(n)),
              (i = o.document),
              (n = o.range),
              Trix.config.blockAttributes[t].listAttribute
                ? ((i = i.removeLastListAttributeAtRange(n, {
                    exceptAttributeName: t
                  })),
                  (r = i.convertLineBreaksToBlockBreaksInRange(n)),
                  (i = r.document),
                  (n = r.range))
                : (i = i.consolidateBlocksAtRange(n)),
              i.addAttributeAtRange(t, e, n)
            );
          }),
          (a.prototype.removeLastListAttributeAtRange = function(t, e) {
            var n;
            return (
              null == e && (e = {}),
              (n = this.blockList),
              this.eachBlockAtRange(t, function(t, i, o) {
                var r;
                if (
                  (r = t.getLastAttribute()) &&
                  Trix.config.blockAttributes[r].listAttribute &&
                  r !== e.exceptAttributeName
                )
                  return (n = n.editObjectAtIndex(o, function() {
                    return t.removeAttribute(r);
                  }));
              }),
              new this.constructor(n)
            );
          }),
          (a.prototype.firstBlockInRangeIsEntirelySelected = function(t) {
            var n, i, o, r, s, a;
            return (
              (r = t = e(t)),
              (a = r[0]),
              (n = r[1]),
              (i = this.locationFromPosition(a)),
              (s = this.locationFromPosition(n)),
              0 === i.offset && i.index < s.index
                ? !0
                : i.index === s.index
                  ? ((o = this.getBlockAtIndex(i.index).getLength()),
                    0 === i.offset && s.offset === o)
                  : !1
            );
          }),
          (a.prototype.expandRangeToLineBreaksAndSplitBlocks = function(t) {
            var n, i, o, r, s, a, u, c, l;
            return (
              (a = t = e(t)),
              (l = a[0]),
              (r = a[1]),
              (c = this.locationFromPosition(l)),
              (o = this.locationFromPosition(r)),
              (n = this),
              (u = n.getBlockAtIndex(c.index)),
              null !=
                (c.offset = u.findLineBreakInDirectionFromPosition(
                  "backward",
                  c.offset
                )) &&
                ((s = n.positionFromLocation(c)),
                (n = n.insertBlockBreakAtRange([s, s + 1])),
                (o.index += 1),
                (o.offset -= n.getBlockAtIndex(c.index).getLength()),
                (c.index += 1)),
              (c.offset = 0),
              0 === o.offset && o.index > c.index
                ? ((o.index -= 1),
                  (o.offset = n
                    .getBlockAtIndex(o.index)
                    .getBlockBreakPosition()))
                : ((i = n.getBlockAtIndex(o.index)),
                  "\n" === i.text.getStringAtRange([o.offset - 1, o.offset])
                    ? (o.offset -= 1)
                    : (o.offset = i.findLineBreakInDirectionFromPosition(
                        "forward",
                        o.offset
                      )),
                  o.offset !== i.getBlockBreakPosition() &&
                    ((s = n.positionFromLocation(o)),
                    (n = n.insertBlockBreakAtRange([s, s + 1])))),
              (l = n.positionFromLocation(c)),
              (r = n.positionFromLocation(o)),
              (t = e([l, r])),
              { document: n, range: t }
            );
          }),
          (a.prototype.convertLineBreaksToBlockBreaksInRange = function(t) {
            var n, i, o;
            return (
              (i = (t = e(t))[0]),
              (o = this.getStringAtRange(t).slice(0, -1)),
              (n = this),
              o.replace(/.*?\n/g, function(t) {
                return (
                  (i += t.length), (n = n.insertBlockBreakAtRange([i - 1, i]))
                );
              }),
              { document: n, range: t }
            );
          }),
          (a.prototype.consolidateBlocksAtRange = function(t) {
            var n, i, o, r, s;
            return (
              (o = t = e(t)),
              (s = o[0]),
              (i = o[1]),
              (r = this.locationFromPosition(s).index),
              (n = this.locationFromPosition(i).index),
              new this.constructor(
                this.blockList.consolidateFromIndexToIndex(r, n)
              )
            );
          }),
          (a.prototype.getDocumentAtRange = function(t) {
            var n;
            return (
              (t = e(t)),
              (n = this.blockList.getSplittableListInRange(t).toArray()),
              new this.constructor(n)
            );
          }),
          (a.prototype.getStringAtRange = function(t) {
            return this.getDocumentAtRange(t).toString();
          }),
          (a.prototype.getBlockAtIndex = function(t) {
            return this.blockList.getObjectAtIndex(t);
          }),
          (a.prototype.getBlockAtPosition = function(t) {
            var e;
            return (
              (e = this.locationFromPosition(t).index), this.getBlockAtIndex(e)
            );
          }),
          (a.prototype.getTextAtIndex = function(t) {
            var e;
            return null != (e = this.getBlockAtIndex(t)) ? e.text : void 0;
          }),
          (a.prototype.getTextAtPosition = function(t) {
            var e;
            return (
              (e = this.locationFromPosition(t).index), this.getTextAtIndex(e)
            );
          }),
          (a.prototype.getPieceAtPosition = function(t) {
            var e, n, i;
            return (
              (i = this.locationFromPosition(t)),
              (e = i.index),
              (n = i.offset),
              this.getTextAtIndex(e).getPieceAtPosition(t)
            );
          }),
          (a.prototype.getCharacterAtPosition = function(t) {
            var e, n, i;
            return (
              (i = this.locationFromPosition(t)),
              (e = i.index),
              (n = i.offset),
              this.getTextAtIndex(e).getStringAtRange([n, n + 1])
            );
          }),
          (a.prototype.getLength = function() {
            return this.blockList.getEndPosition();
          }),
          (a.prototype.getBlocks = function() {
            return this.blockList.toArray();
          }),
          (a.prototype.getBlockCount = function() {
            return this.blockList.length;
          }),
          (a.prototype.getEditCount = function() {
            return this.editCount;
          }),
          (a.prototype.eachBlock = function(t) {
            return this.blockList.eachObject(t);
          }),
          (a.prototype.eachBlockAtRange = function(t, n) {
            var i, o, r, s, a, u, c, l, h, p, d, f;
            if (
              ((u = t = e(t)),
              (d = u[0]),
              (r = u[1]),
              (p = this.locationFromPosition(d)),
              (o = this.locationFromPosition(r)),
              p.index === o.index)
            )
              return (
                (i = this.getBlockAtIndex(p.index)),
                (f = [p.offset, o.offset]),
                n(i, f, p.index)
              );
            for (
              h = [], a = s = c = p.index, l = o.index;
              l >= c ? l >= s : s >= l;
              a = l >= c ? ++s : --s
            )
              (i = this.getBlockAtIndex(a))
                ? ((f = (function() {
                    switch (a) {
                      case p.index:
                        return [p.offset, i.text.getLength()];
                      case o.index:
                        return [0, o.offset];
                      default:
                        return [0, i.text.getLength()];
                    }
                  })()),
                  h.push(n(i, f, a)))
                : h.push(void 0);
            return h;
          }),
          (a.prototype.getCommonAttributesAtRange = function(t) {
            var i, o, r;
            return (
              (o = (t = e(t))[0]),
              n(t)
                ? this.getCommonAttributesAtPosition(o)
                : ((r = []),
                  (i = []),
                  this.eachBlockAtRange(t, function(t, e) {
                    return e[0] !== e[1]
                      ? (r.push(t.text.getCommonAttributesAtRange(e)),
                        i.push(u(t)))
                      : void 0;
                  }),
                  Trix.Hash.fromCommonAttributesOfObjects(r)
                    .merge(Trix.Hash.fromCommonAttributesOfObjects(i))
                    .toObject())
            );
          }),
          (a.prototype.getCommonAttributesAtPosition = function(t) {
            var e, n, i, o, r, a, c, l, h, p;
            if (
              ((h = this.locationFromPosition(t)),
              (r = h.index),
              (l = h.offset),
              (i = this.getBlockAtIndex(r)),
              !i)
            )
              return {};
            (o = u(i)),
              (e = i.text.getAttributesAtPosition(l)),
              (n = i.text.getAttributesAtPosition(l - 1)),
              (a = (function() {
                var t, e;
                (t = Trix.config.textAttributes), (e = []);
                for (c in t) (p = t[c]), p.inheritable && e.push(c);
                return e;
              })());
            for (c in n)
              (p = n[c]), (p === e[c] || s.call(a, c) >= 0) && (o[c] = p);
            return o;
          }),
          (a.prototype.getRangeOfCommonAttributeAtPosition = function(t, n) {
            var i, o, r, s, a, u, c, l, h;
            return (
              (a = this.locationFromPosition(n)),
              (r = a.index),
              (s = a.offset),
              (h = this.getTextAtIndex(r)),
              (u = h.getExpandedRangeForAttributeAtOffset(t, s)),
              (l = u[0]),
              (o = u[1]),
              (c = this.positionFromLocation({ index: r, offset: l })),
              (i = this.positionFromLocation({ index: r, offset: o })),
              e([c, i])
            );
          }),
          (a.prototype.getBaseBlockAttributes = function() {
            var t, e, n, i, o, r, s;
            for (
              t = this.getBlockAtIndex(0).getAttributes(),
                n = i = 1,
                s = this.getBlockCount();
              s >= 1 ? s > i : i > s;
              n = s >= 1 ? ++i : --i
            )
              (e = this.getBlockAtIndex(n).getAttributes()),
                (r = Math.min(t.length, e.length)),
                (t = (function() {
                  var n, i, s;
                  for (
                    s = [], o = n = 0, i = r;
                    (i >= 0 ? i > n : n > i) && e[o] === t[o];
                    o = i >= 0 ? ++n : --n
                  )
                    s.push(e[o]);
                  return s;
                })());
            return t;
          }),
          (u = function(t) {
            var e, n;
            return (n = {}), (e = t.getLastAttribute()) && (n[e] = !0), n;
          }),
          (a.prototype.getAttachmentById = function(t) {
            var e, n, i, o;
            for (o = this.getAttachments(), n = 0, i = o.length; i > n; n++)
              if (((e = o[n]), e.id === t)) return e;
          }),
          (a.prototype.getAttachmentPieces = function() {
            var t;
            return (
              (t = []),
              this.blockList.eachObject(function(e) {
                var n;
                return (n = e.text), (t = t.concat(n.getAttachmentPieces()));
              }),
              t
            );
          }),
          (a.prototype.getAttachments = function() {
            var t, e, n, i, o;
            for (
              i = this.getAttachmentPieces(), o = [], t = 0, e = i.length;
              e > t;
              t++
            )
              (n = i[t]), o.push(n.attachment);
            return o;
          }),
          (a.prototype.getRangeOfAttachment = function(t) {
            var n, i, o, r, s, a, u;
            for (
              r = 0, s = this.blockList.toArray(), i = n = 0, o = s.length;
              o > n;
              i = ++n
            ) {
              if (((a = s[i].text), (u = a.getRangeOfAttachment(t))))
                return e([r + u[0], r + u[1]]);
              r += a.getLength();
            }
          }),
          (a.prototype.getAttachmentPieceForAttachment = function(t) {
            var e, n, i, o;
            for (
              o = this.getAttachmentPieces(), e = 0, n = o.length;
              n > e;
              e++
            )
              if (((i = o[e]), i.attachment === t)) return i;
          }),
          (a.prototype.rangeFromLocationRange = function(t) {
            var i, o;
            return (
              (t = e(t)),
              (i = this.positionFromLocation(t[0])),
              n(t) || (o = this.positionFromLocation(t[1])),
              [i, null != o ? o : i]
            );
          }),
          (a.prototype.locationFromPosition = function(t) {
            var e, n;
            return (
              (n = this.blockList.findIndexAndOffsetAtPosition(Math.max(0, t))),
              null != n.index
                ? n
                : ((e = this.getBlocks()),
                  { index: e.length - 1, offset: e[e.length - 1].getLength() })
            );
          }),
          (a.prototype.positionFromLocation = function(t) {
            return this.blockList.findPositionAtIndexAndOffset(
              t.index,
              t.offset
            );
          }),
          (a.prototype.locationRangeFromPosition = function(t) {
            return e(this.locationFromPosition(t));
          }),
          (a.prototype.locationRangeFromRange = function(t) {
            var n, i, o, r;
            if ((t = e(t)))
              return (
                (r = t[0]),
                (i = t[1]),
                (o = this.locationFromPosition(r)),
                (n = this.locationFromPosition(i)),
                e([o, n])
              );
          }),
          (a.prototype.rangeFromLocationRange = function(t) {
            var i, o;
            return (
              (t = e(t)),
              (i = this.positionFromLocation(t[0])),
              n(t) || (o = this.positionFromLocation(t[1])),
              e([i, o])
            );
          }),
          (a.prototype.isEqualTo = function(t) {
            return this.blockList.isEqualTo(null != t ? t.blockList : void 0);
          }),
          (a.prototype.getTexts = function() {
            var t, e, n, i, o;
            for (i = this.getBlocks(), o = [], e = 0, n = i.length; n > e; e++)
              (t = i[e]), o.push(t.text);
            return o;
          }),
          (a.prototype.getPieces = function() {
            var t, e, n, i, o;
            for (n = [], i = this.getTexts(), t = 0, e = i.length; e > t; t++)
              (o = i[t]), n.push.apply(n, o.getPieces());
            return n;
          }),
          (a.prototype.getObjects = function() {
            return this.getBlocks()
              .concat(this.getTexts())
              .concat(this.getPieces());
          }),
          (a.prototype.toSerializableDocument = function() {
            var t;
            return (
              (t = []),
              this.blockList.eachObject(function(e) {
                return t.push(e.copyWithText(e.text.toSerializableText()));
              }),
              new this.constructor(t)
            );
          }),
          (a.prototype.toString = function() {
            return this.blockList.toString();
          }),
          (a.prototype.toJSON = function() {
            return this.blockList.toJSON();
          }),
          (a.prototype.toConsole = function() {
            var t;
            return JSON.stringify(
              function() {
                var e, n, i, o;
                for (
                  i = this.blockList.toArray(), o = [], e = 0, n = i.length;
                  n > e;
                  e++
                )
                  (t = i[e]), o.push(JSON.parse(t.text.toConsole()));
                return o;
              }.call(this)
            );
          }),
          a
        );
      })(Trix.Object));
  }.call(this),
  function() {
    var t,
      e,
      n,
      i,
      o,
      r = function(t, e) {
        function n() {
          this.constructor = t;
        }
        for (var i in e) s.call(e, i) && (t[i] = e[i]);
        return (
          (n.prototype = e.prototype),
          (t.prototype = new n()),
          (t.__super__ = e.prototype),
          t
        );
      },
      s = {}.hasOwnProperty;
    (e = Trix.normalizeRange),
      (i = Trix.rangesAreEqual),
      (n = Trix.objectsAreEqual),
      (o = Trix.summarizeArrayChange),
      (t = Trix.extend),
      (Trix.Composition = (function(s) {
        function a() {
          (this.document = new Trix.Document()),
            (this.attachments = []),
            (this.currentAttributes = {}),
            (this.revision = 0);
        }
        var u;
        return (
          r(a, s),
          (a.prototype.setDocument = function(t) {
            var e;
            return t.isEqualTo(this.document)
              ? void 0
              : ((this.document = t),
                this.refreshAttachments(),
                this.revision++,
                null != (e = this.delegate) &&
                "function" == typeof e.compositionDidChangeDocument
                  ? e.compositionDidChangeDocument(t)
                  : void 0);
          }),
          (a.prototype.getSnapshot = function() {
            return {
              document: this.document,
              selectedRange: this.getSelectedRange()
            };
          }),
          (a.prototype.loadSnapshot = function(t) {
            var e, n, i, o;
            return (
              (e = t.document),
              (o = t.selectedRange),
              null != (n = this.delegate) &&
                "function" == typeof n.compositionWillLoadSnapshot &&
                n.compositionWillLoadSnapshot(),
              this.setDocument(null != e ? e : new Trix.Document()),
              this.setSelection(null != o ? o : [0, 0]),
              null != (i = this.delegate) &&
              "function" == typeof i.compositionDidLoadSnapshot
                ? i.compositionDidLoadSnapshot()
                : void 0
            );
          }),
          (a.prototype.insertText = function(t, e) {
            var n, i, o, r;
            return (
              (r = (null != e ? e : { updatePosition: !0 }).updatePosition),
              (i = this.getSelectedRange()),
              this.setDocument(this.document.insertTextAtRange(t, i)),
              (o = i[0]),
              (n = o + t.getLength()),
              r && this.setSelection(n),
              this.notifyDelegateOfInsertionAtRange([o, n])
            );
          }),
          (a.prototype.insertBlock = function(t) {
            var e;
            return (
              null == t && (t = new Trix.Block()),
              (e = new Trix.Document([t])),
              this.insertDocument(e)
            );
          }),
          (a.prototype.insertDocument = function(t) {
            var e, n, i;
            return (
              null == t && (t = new Trix.Document()),
              (n = this.getSelectedRange()),
              this.setDocument(this.document.insertDocumentAtRange(t, n)),
              (i = n[0]),
              (e = i + t.getLength()),
              this.setSelection(e),
              this.notifyDelegateOfInsertionAtRange([i, e])
            );
          }),
          (a.prototype.insertString = function(t, e) {
            var n, i;
            return (
              (n = this.getCurrentTextAttributes()),
              (i = Trix.Text.textForStringWithAttributes(t, n)),
              this.insertText(i, e)
            );
          }),
          (a.prototype.insertBlockBreak = function() {
            var t, e, n;
            return (
              (e = this.getSelectedRange()),
              this.setDocument(this.document.insertBlockBreakAtRange(e)),
              (n = e[0]),
              (t = n + 1),
              this.setSelection(t),
              this.notifyDelegateOfInsertionAtRange([n, t])
            );
          }),
          (a.prototype.breakFormattedBlock = function() {
            var t, e, n, i, o, r, s, a;
            return (
              (r = this.getPosition()),
              (s = [r - 1, r]),
              (e = this.document),
              (a = e.locationFromPosition(r)),
              (n = a.index),
              (o = a.offset),
              (t = e.getBlockAtIndex(n)),
              t.getBlockBreakPosition() === o
                ? ((e = e.removeTextAtRange(s)), (s = [r, r]))
                : "\n" === t.text.getStringAtRange([o, o + 1])
                  ? (s = [r - 1, r + 1])
                  : (r += 1),
              (i = new Trix.Document([
                t.removeLastAttribute().copyWithoutText()
              ])),
              this.setDocument(e.insertDocumentAtRange(i, s)),
              this.setSelection(r)
            );
          }),
          (a.prototype.insertLineBreak = function() {
            var t, e, n, i, o, r, s;
            return (
              (o = this.getSelectedRange()),
              (s = o[0]),
              (i = o[1]),
              (r = this.document.locationFromPosition(s)),
              (n = this.document.locationFromPosition(i)),
              (t = this.document.getBlockAtIndex(n.index)),
              t.hasAttributes()
                ? t.isListItem()
                  ? t.isEmpty()
                    ? (this.decreaseListLevel(), this.setSelection(s))
                    : 0 === r.offset
                      ? ((e = new Trix.Document([t.copyWithoutText()])),
                        this.insertDocument(e))
                      : this.insertBlockBreak()
                  : t.isEmpty()
                    ? this.removeLastBlockAttribute()
                    : "\n" === t.text.getStringAtRange([n.offset - 1, n.offset])
                      ? this.breakFormattedBlock()
                      : this.insertString("\n")
                : this.insertString("\n")
            );
          }),
          (a.prototype.insertHTML = function(t) {
            var e, n, i, o, r;
            return (
              (r = this.getPosition()),
              (o = this.document.getLength()),
              (e = Trix.Document.fromHTML(t)),
              this.setDocument(
                this.document.mergeDocumentAtRange(e, this.getSelectedRange())
              ),
              (n = this.document.getLength()),
              (i = r + (n - o)),
              this.setSelection(i),
              this.notifyDelegateOfInsertionAtRange([i, i])
            );
          }),
          (a.prototype.replaceHTML = function(t) {
            var e, n;
            return (
              (e = Trix.Document.fromHTML(t).copyUsingObjectsFromDocument(
                this.document
              )),
              (n = this.getSelectedPointRange()),
              this.setDocument(e),
              this.setSelectionPointRange(n)
            );
          }),
          (a.prototype.insertFile = function(t) {
            var e, n;
            return (null != (n = this.delegate)
            ? n.compositionShouldAcceptFile(t)
            : void 0)
              ? ((e = Trix.Attachment.attachmentForFile(t)),
                this.insertAttachment(e))
              : void 0;
          }),
          (a.prototype.insertAttachment = function(t) {
            var e;
            return (
              (e = Trix.Text.textForAttachmentWithAttributes(
                t,
                this.currentAttributes
              )),
              this.insertText(e)
            );
          }),
          (a.prototype.deleteInDirection = function(t) {
            var e, n, i, o, r, s, a;
            if (
              ((r = this.getSelectedRange()),
              (a = r[0]),
              (i = r[1]),
              (o = r),
              (n = this.getBlock()),
              a === i)
            ) {
              if (
                ((s = this.document.locationFromPosition(a)),
                "backward" === t &&
                  0 === s.offset &&
                  this.canDecreaseBlockAttributeLevel() &&
                  (n.isListItem()
                    ? this.decreaseListLevel()
                    : this.decreaseBlockAttributeLevel(),
                  this.setSelection(a),
                  n.isEmpty()))
              )
                return;
              (o = this.getExpandedRangeInDirection(t)),
                "backward" === t && (e = this.getAttachmentAtRange(o));
            }
            return e
              ? (this.editAttachment(e), !1)
              : (this.setDocument(this.document.removeTextAtRange(o)),
                this.setSelection(o[0]),
                n.isListItem() ? !1 : void 0);
          }),
          (a.prototype.moveTextFromRange = function(t) {
            var e;
            return (
              (e = this.getSelectedRange()[0]),
              this.setDocument(this.document.moveTextFromRangeToPosition(t, e)),
              this.setSelection(e)
            );
          }),
          (a.prototype.removeAttachment = function(t) {
            var e;
            return (e = this.document.getRangeOfAttachment(t))
              ? (this.stopEditingAttachment(),
                this.setDocument(this.document.removeTextAtRange(e)),
                this.setSelection(e[0]))
              : void 0;
          }),
          (a.prototype.removeLastBlockAttribute = function() {
            var t, e, n, i;
            return (
              (n = this.getSelectedRange()),
              (i = n[0]),
              (e = n[1]),
              (t = this.document.getBlockAtPosition(e)),
              this.removeCurrentAttribute(t.getLastAttribute()),
              this.setSelection(i)
            );
          }),
          (u = " "),
          (a.prototype.insertPlaceholder = function() {
            return (
              (this.placeholderPosition = this.getPosition()),
              this.insertString(u),
              u
            );
          }),
          (a.prototype.selectPlaceholder = function() {
            return null != this.placeholderPosition
              ? (this.setSelectedRange([
                  this.placeholderPosition,
                  this.placeholderPosition + u.length
                ]),
                !0)
              : void 0;
          }),
          (a.prototype.forgetPlaceholder = function() {
            return (this.placeholderPosition = null);
          }),
          (a.prototype.hasCurrentAttribute = function(t) {
            return null != this.currentAttributes[t];
          }),
          (a.prototype.toggleCurrentAttribute = function(t) {
            var e;
            return (e = !this.currentAttributes[t])
              ? this.setCurrentAttribute(t, e)
              : this.removeCurrentAttribute(t);
          }),
          (a.prototype.canSetCurrentAttribute = function(t) {
            switch (t) {
              case "href":
                return !this.selectionContainsAttachmentWithAttribute(t);
              default:
                return !0;
            }
          }),
          (a.prototype.setCurrentAttribute = function(t, e) {
            return Trix.config.blockAttributes[t]
              ? this.setBlockAttribute(t, e)
              : (this.setTextAttribute(t, e),
                (this.currentAttributes[t] = e),
                this.notifyDelegateOfCurrentAttributesChange());
          }),
          (a.prototype.setTextAttribute = function(t, e) {
            var n, i, o, r;
            if ((i = this.getSelectedRange()))
              return (
                (o = i[0]),
                (n = i[1]),
                o !== n
                  ? this.setDocument(this.document.addAttributeAtRange(t, e, i))
                  : "href" === t
                    ? ((r = Trix.Text.textForStringWithAttributes(e, {
                        href: e
                      })),
                      this.insertText(r))
                    : void 0
              );
          }),
          (a.prototype.setBlockAttribute = function(t, e) {
            var n;
            if ((n = this.getSelectedRange()))
              return (
                this.setDocument(
                  this.document.applyBlockAttributeAtRange(t, e, n)
                ),
                this.setSelection(n)
              );
          }),
          (a.prototype.removeCurrentAttribute = function(t) {
            return Trix.config.blockAttributes[t]
              ? (this.removeBlockAttribute(t), this.updateCurrentAttributes())
              : (this.removeTextAttribute(t),
                delete this.currentAttributes[t],
                this.notifyDelegateOfCurrentAttributesChange());
          }),
          (a.prototype.removeTextAttribute = function(t) {
            var e;
            if ((e = this.getSelectedRange()))
              return this.setDocument(
                this.document.removeAttributeAtRange(t, e)
              );
          }),
          (a.prototype.removeBlockAttribute = function(t) {
            var e;
            if ((e = this.getSelectedRange()))
              return this.setDocument(
                this.document.removeAttributeAtRange(t, e)
              );
          }),
          (a.prototype.increaseBlockAttributeLevel = function() {
            var t, e;
            return (t =
              null != (e = this.getBlock()) ? e.getLastAttribute() : void 0)
              ? this.setCurrentAttribute(t)
              : void 0;
          }),
          (a.prototype.decreaseBlockAttributeLevel = function() {
            var t, e;
            return (t =
              null != (e = this.getBlock()) ? e.getLastAttribute() : void 0)
              ? this.removeCurrentAttribute(t)
              : void 0;
          }),
          (a.prototype.decreaseListLevel = function() {
            var t, e, n, i, o, r;
            for (
              r = this.getSelectedRange()[0],
                o = this.document.locationFromPosition(r).index,
                n = o,
                t = this.getBlock().getAttributeLevel();
              (e = this.document.getBlockAtIndex(n + 1)) &&
              e.isListItem() &&
              e.getAttributeLevel() > t;

            )
              n++;
            return (
              (r = this.document.positionFromLocation({ index: o, offset: 0 })),
              (i = this.document.positionFromLocation({ index: n, offset: 0 })),
              this.setDocument(
                this.document.removeLastListAttributeAtRange([r, i])
              )
            );
          }),
          (a.prototype.canIncreaseBlockAttributeLevel = function() {
            var t, e, n, i;
            if ((t = this.getBlock()))
              return (
                (n = t.getConfig("nestable")),
                null != n
                  ? n
                  : t.isListItem() && (i = this.getPreviousBlock())
                    ? ((e = t.getAttributeLevel()),
                      i.getAttributeAtLevel(e) === t.getAttributeAtLevel(e))
                    : void 0
              );
          }),
          (a.prototype.canDecreaseBlockAttributeLevel = function() {
            var t;
            return (
              (null != (t = this.getBlock()) ? t.getAttributeLevel() : void 0) >
              0
            );
          }),
          (a.prototype.updateCurrentAttributes = function() {
            var t, e;
            return (e = this.getSelectedRange({ ignoreLock: !0 })) &&
              ((t = this.document.getCommonAttributesAtRange(e)),
              !n(t, this.currentAttributes))
              ? ((this.currentAttributes = t),
                this.notifyDelegateOfCurrentAttributesChange())
              : void 0;
          }),
          (a.prototype.getCurrentAttributes = function() {
            return t.call({}, this.currentAttributes);
          }),
          (a.prototype.getCurrentTextAttributes = function() {
            var t, e, n, i;
            (t = {}), (n = this.currentAttributes);
            for (e in n)
              (i = n[e]), Trix.config.textAttributes[e] && (t[e] = i);
            return t;
          }),
          (a.prototype.freezeSelection = function() {
            return this.setCurrentAttribute("frozen", !0);
          }),
          (a.prototype.thawSelection = function() {
            return this.removeCurrentAttribute("frozen");
          }),
          (a.prototype.hasFrozenSelection = function() {
            return this.hasCurrentAttribute("frozen");
          }),
          a.proxyMethod("getSelectionManager().getSelectedPointRange"),
          a.proxyMethod("getSelectionManager().setLocationRangeFromPointRange"),
          a.proxyMethod("getSelectionManager().locationIsCursorTarget"),
          a.proxyMethod("getSelectionManager().selectionIsExpanded"),
          a.proxyMethod("delegate?.getSelectionManager"),
          (a.prototype.setSelection = function(t) {
            var e, n;
            return (
              (e = this.document.locationRangeFromRange(t)),
              null != (n = this.delegate)
                ? n.compositionDidRequestChangingSelection({ locationRange: e })
                : void 0
            );
          }),
          (a.prototype.setSelectionPointRange = function(t) {
            var e;
            return null != (e = this.delegate)
              ? e.compositionDidRequestChangingSelection({ pointRange: t })
              : void 0;
          }),
          (a.prototype.getSelectedRange = function() {
            var t;
            return (t = this.getLocationRange())
              ? this.document.rangeFromLocationRange(t)
              : void 0;
          }),
          (a.prototype.setSelectedRange = function(t) {
            var e;
            return (
              (e = this.document.locationRangeFromRange(t)),
              this.getSelectionManager().setLocationRange(e)
            );
          }),
          (a.prototype.getPosition = function() {
            var t;
            return (t = this.getLocationRange())
              ? this.document.positionFromLocation(t[0])
              : void 0;
          }),
          (a.prototype.getLocationRange = function() {
            var t;
            return null != (t = this.getSelectionManager().getLocationRange())
              ? t
              : e({ index: 0, offset: 0 });
          }),
          (a.prototype.getExpandedRangeInDirection = function(t) {
            var n, i, o;
            return (
              (i = this.getSelectedRange()),
              (o = i[0]),
              (n = i[1]),
              "backward" === t
                ? (o = this.translateUTF16PositionFromOffset(o, -1))
                : (n = this.translateUTF16PositionFromOffset(n, 1)),
              e([o, n])
            );
          }),
          (a.prototype.moveCursorInDirection = function(t) {
            var e, n, o, r;
            return (
              this.editingAttachment
                ? (o = this.document.getRangeOfAttachment(
                    this.editingAttachment
                  ))
                : ((r = this.getSelectedRange()),
                  (o = this.getExpandedRangeInDirection(t)),
                  (n = !i(r, o))),
              this.setSelectedRange("backward" === t ? o[0] : o[1]),
              n && (e = this.getAttachmentAtRange(o))
                ? this.editAttachment(e)
                : void 0
            );
          }),
          (a.prototype.expandSelectionInDirection = function(t) {
            var e;
            return (
              (e = this.getExpandedRangeInDirection(t)),
              this.setSelectedRange(e)
            );
          }),
          (a.prototype.expandSelectionForEditing = function() {
            return this.hasCurrentAttribute("href")
              ? this.expandSelectionAroundCommonAttribute("href")
              : void 0;
          }),
          (a.prototype.expandSelectionAroundCommonAttribute = function(t) {
            var e, n;
            return (
              (e = this.getPosition()),
              (n = this.document.getRangeOfCommonAttributeAtPosition(t, e)),
              this.setSelectedRange(n)
            );
          }),
          (a.prototype.selectionContainsAttachmentWithAttribute = function(t) {
            var e, n, i, o, r;
            if ((r = this.getSelectedRange())) {
              for (
                o = this.document.getDocumentAtRange(r).getAttachments(),
                  n = 0,
                  i = o.length;
                i > n;
                n++
              )
                if (((e = o[n]), e.hasAttribute(t))) return !0;
              return !1;
            }
          }),
          (a.prototype.selectionIsInCursorTarget = function() {
            return (
              this.editingAttachment ||
              this.positionIsCursorTarget(this.getPosition())
            );
          }),
          (a.prototype.positionIsCursorTarget = function(t) {
            var e;
            return (e = this.document.locationFromPosition(t))
              ? this.locationIsCursorTarget(e)
              : void 0;
          }),
          (a.prototype.getSelectedDocument = function() {
            var t;
            return (t = this.getSelectedRange())
              ? this.document.getDocumentAtRange(t)
              : void 0;
          }),
          (a.prototype.getAttachments = function() {
            return this.attachments.slice(0);
          }),
          (a.prototype.refreshAttachments = function() {
            var t, e, n, i, r, s, a, u, c, l, h;
            for (
              n = this.document.getAttachments(),
                u = o(this.attachments, n),
                t = u.added,
                h = u.removed,
                i = 0,
                s = h.length;
              s > i;
              i++
            )
              (e = h[i]),
                (e.delegate = null),
                null != (c = this.delegate) &&
                  "function" == typeof c.compositionDidRemoveAttachment &&
                  c.compositionDidRemoveAttachment(e);
            for (r = 0, a = t.length; a > r; r++)
              (e = t[r]),
                (e.delegate = this),
                null != (l = this.delegate) &&
                  "function" == typeof l.compositionDidAddAttachment &&
                  l.compositionDidAddAttachment(e);
            return (this.attachments = n);
          }),
          (a.prototype.attachmentDidChangeAttributes = function(t) {
            var e;
            return (
              this.revision++,
              null != (e = this.delegate) &&
              "function" == typeof e.compositionDidEditAttachment
                ? e.compositionDidEditAttachment(t)
                : void 0
            );
          }),
          (a.prototype.editAttachment = function(t) {
            var e;
            if (t !== this.editingAttachment)
              return (
                this.stopEditingAttachment(),
                (this.editingAttachment = t),
                null != (e = this.delegate) &&
                "function" == typeof e.compositionDidStartEditingAttachment
                  ? e.compositionDidStartEditingAttachment(
                      this.editingAttachment
                    )
                  : void 0
              );
          }),
          (a.prototype.stopEditingAttachment = function() {
            var t;
            if (this.editingAttachment)
              return (
                null != (t = this.delegate) &&
                  "function" == typeof t.compositionDidStopEditingAttachment &&
                  t.compositionDidStopEditingAttachment(this.editingAttachment),
                (this.editingAttachment = null)
              );
          }),
          (a.prototype.canEditAttachmentCaption = function() {
            var t;
            return null != (t = this.editingAttachment)
              ? t.isPreviewable()
              : void 0;
          }),
          (a.prototype.updateAttributesForAttachment = function(t, e) {
            return this.setDocument(
              this.document.updateAttributesForAttachment(t, e)
            );
          }),
          (a.prototype.removeAttributeForAttachment = function(t, e) {
            return this.setDocument(
              this.document.removeAttributeForAttachment(t, e)
            );
          }),
          (a.prototype.getPreviousBlock = function() {
            var t, e;
            return (e = this.getLocationRange()) && ((t = e[0].index), t > 0)
              ? this.document.getBlockAtIndex(t - 1)
              : void 0;
          }),
          (a.prototype.getBlock = function() {
            var t;
            return (t = this.getLocationRange())
              ? this.document.getBlockAtIndex(t[0].index)
              : void 0;
          }),
          (a.prototype.getAttachmentAtRange = function(t) {
            var e;
            return (
              (e = this.document.getDocumentAtRange(t)),
              e.toString() === Trix.OBJECT_REPLACEMENT_CHARACTER + "\n"
                ? e.getAttachments()[0]
                : void 0
            );
          }),
          (a.prototype.notifyDelegateOfCurrentAttributesChange = function() {
            var t;
            return null != (t = this.delegate) &&
              "function" == typeof t.compositionDidChangeCurrentAttributes
              ? t.compositionDidChangeCurrentAttributes(this.currentAttributes)
              : void 0;
          }),
          (a.prototype.notifyDelegateOfInsertionAtRange = function(t) {
            var e;
            return null != (e = this.delegate) &&
              "function" == typeof e.compositionDidPerformInsertionAtRange
              ? e.compositionDidPerformInsertionAtRange(t)
              : void 0;
          }),
          (a.prototype.translateUTF16PositionFromOffset = function(t, e) {
            var n, i;
            return (
              (i = this.document.toUTF16String()),
              (n = i.offsetFromUCS2Offset(t)),
              i.offsetToUCS2Offset(n + e)
            );
          }),
          a
        );
      })(Trix.BasicObject));
  }.call(this),
  function() {
    var t = function(t, n) {
        function i() {
          this.constructor = t;
        }
        for (var o in n) e.call(n, o) && (t[o] = n[o]);
        return (
          (i.prototype = n.prototype),
          (t.prototype = new i()),
          (t.__super__ = n.prototype),
          t
        );
      },
      e = {}.hasOwnProperty;
    Trix.UndoManager = (function(e) {
      function n(t) {
        (this.composition = t),
          (this.undoEntries = []),
          (this.redoEntries = []);
      }
      var i;
      return (
        t(n, e),
        (n.prototype.recordUndoEntry = function(t, e) {
          var n, o, r, s, a;
          return (
            (s = null != e ? e : {}),
            (o = s.context),
            (n = s.consolidatable),
            (r = this.undoEntries.slice(-1)[0]),
            n && i(r, t, o)
              ? void 0
              : ((a = this.createEntry({ description: t, context: o })),
                this.undoEntries.push(a),
                (this.redoEntries = []))
          );
        }),
        (n.prototype.undo = function() {
          var t, e;
          return (e = this.undoEntries.pop())
            ? ((t = this.createEntry(e)),
              this.redoEntries.push(t),
              this.composition.loadSnapshot(e.snapshot))
            : void 0;
        }),
        (n.prototype.redo = function() {
          var t, e;
          return (t = this.redoEntries.pop())
            ? ((e = this.createEntry(t)),
              this.undoEntries.push(e),
              this.composition.loadSnapshot(t.snapshot))
            : void 0;
        }),
        (n.prototype.canUndo = function() {
          return this.undoEntries.length > 0;
        }),
        (n.prototype.canRedo = function() {
          return this.redoEntries.length > 0;
        }),
        (n.prototype.createEntry = function(t) {
          var e, n, i;
          return (
            (i = null != t ? t : {}),
            (n = i.description),
            (e = i.context),
            {
              description: null != n ? n.toString() : void 0,
              context: JSON.stringify(e),
              snapshot: this.composition.getSnapshot()
            }
          );
        }),
        (i = function(t, e, n) {
          return (
            (null != t ? t.description : void 0) ===
              (null != e ? e.toString() : void 0) &&
            (null != t ? t.context : void 0) === JSON.stringify(n)
          );
        }),
        n
      );
    })(Trix.BasicObject);
  }.call(this),
  function() {
    Trix.Editor = (function() {
      function t(t, e, n) {
        (this.composition = t),
          (this.selectionManager = e),
          (this.element = n),
          (this.undoManager = new Trix.UndoManager(this.composition));
      }
      return (
        (t.prototype.loadDocument = function(t) {
          return this.loadSnapshot({ document: t, selectedRange: [0, 0] });
        }),
        (t.prototype.loadHTML = function(t) {
          return (
            null == t && (t = ""),
            this.loadDocument(
              Trix.Document.fromHTML(t, { referenceElement: this.element })
            )
          );
        }),
        (t.prototype.loadJSON = function(t) {
          var e, n;
          return (
            (e = t.document),
            (n = t.selectedRange),
            (e = Trix.Document.fromJSON(e)),
            this.loadSnapshot({ document: e, selectedRange: n })
          );
        }),
        (t.prototype.loadSnapshot = function(t) {
          return (
            (this.undoManager = new Trix.UndoManager(this.composition)),
            this.composition.loadSnapshot(t)
          );
        }),
        (t.prototype.getDocument = function() {
          return this.composition.document;
        }),
        (t.prototype.getSelectedDocument = function() {
          return this.composition.getSelectedDocument();
        }),
        (t.prototype.getSnapshot = function() {
          return this.composition.getSnapshot();
        }),
        (t.prototype.toJSON = function() {
          return this.getSnapshot();
        }),
        (t.prototype.deleteInDirection = function(t) {
          return this.composition.deleteInDirection(t);
        }),
        (t.prototype.insertAttachment = function(t) {
          return this.composition.insertAttachment(t);
        }),
        (t.prototype.insertDocument = function(t) {
          return this.composition.insertDocument(t);
        }),
        (t.prototype.insertFile = function(t) {
          return this.composition.insertFile(t);
        }),
        (t.prototype.insertHTML = function(t) {
          return this.composition.insertHTML(t);
        }),
        (t.prototype.insertString = function(t) {
          return this.composition.insertString(t);
        }),
        (t.prototype.insertText = function(t) {
          return this.composition.insertText(t);
        }),
        (t.prototype.insertLineBreak = function() {
          return this.composition.insertLineBreak();
        }),
        (t.prototype.getSelectedRange = function() {
          return this.composition.getSelectedRange();
        }),
        (t.prototype.getPosition = function() {
          return this.composition.getPosition();
        }),
        (t.prototype.getClientRectAtPosition = function(t) {
          var e;
          return (
            (e = this.getDocument().locationRangeFromRange([t, t + 1])),
            this.selectionManager.getClientRectAtLocationRange(e)
          );
        }),
        (t.prototype.expandSelectionInDirection = function(t) {
          return this.composition.expandSelectionInDirection(t);
        }),
        (t.prototype.moveCursorInDirection = function(t) {
          return this.composition.moveCursorInDirection(t);
        }),
        (t.prototype.setSelectedRange = function(t) {
          return this.composition.setSelectedRange(t);
        }),
        (t.prototype.activateAttribute = function(t, e) {
          return (
            null == e && (e = !0), this.composition.setCurrentAttribute(t, e)
          );
        }),
        (t.prototype.attributeIsActive = function(t) {
          return this.composition.hasCurrentAttribute(t);
        }),
        (t.prototype.canActivateAttribute = function(t) {
          return this.composition.canSetCurrentAttribute(t);
        }),
        (t.prototype.deactivateAttribute = function(t) {
          return this.composition.removeCurrentAttribute(t);
        }),
        (t.prototype.canDecreaseIndentationLevel = function() {
          return this.composition.canDecreaseBlockAttributeLevel();
        }),
        (t.prototype.canIncreaseIndentationLevel = function() {
          return this.composition.canIncreaseBlockAttributeLevel();
        }),
        (t.prototype.decreaseIndentationLevel = function() {
          return this.canDecreaseIndentationLevel()
            ? this.composition.decreaseBlockAttributeLevel()
            : void 0;
        }),
        (t.prototype.increaseIndentationLevel = function() {
          return this.canIncreaseIndentationLevel()
            ? this.composition.increaseBlockAttributeLevel()
            : void 0;
        }),
        (t.prototype.canRedo = function() {
          return this.undoManager.canRedo();
        }),
        (t.prototype.canUndo = function() {
          return this.undoManager.canUndo();
        }),
        (t.prototype.recordUndoEntry = function(t, e) {
          var n, i, o;
          return (
            (o = null != e ? e : {}),
            (i = o.context),
            (n = o.consolidatable),
            this.undoManager.recordUndoEntry(t, {
              context: i,
              consolidatable: n
            })
          );
        }),
        (t.prototype.redo = function() {
          return this.canRedo() ? this.undoManager.redo() : void 0;
        }),
        (t.prototype.undo = function() {
          return this.canUndo() ? this.undoManager.undo() : void 0;
        }),
        t
      );
    })();
  }.call(this),
  function() {
    var t = function(t, n) {
        function i() {
          this.constructor = t;
        }
        for (var o in n) e.call(n, o) && (t[o] = n[o]);
        return (
          (i.prototype = n.prototype),
          (t.prototype = new i()),
          (t.__super__ = n.prototype),
          t
        );
      },
      e = {}.hasOwnProperty;
    Trix.ManagedAttachment = (function(e) {
      function n(t, e) {
        var n;
        (this.attachmentManager = t),
          (this.attachment = e),
          (n = this.attachment),
          (this.id = n.id),
          (this.file = n.file);
      }
      return (
        t(n, e),
        (n.prototype.remove = function() {
          return this.attachmentManager.requestRemovalOfAttachment(
            this.attachment
          );
        }),
        n.proxyMethod("attachment.getAttribute"),
        n.proxyMethod("attachment.hasAttribute"),
        n.proxyMethod("attachment.setAttribute"),
        n.proxyMethod("attachment.getAttributes"),
        n.proxyMethod("attachment.setAttributes"),
        n.proxyMethod("attachment.isPending"),
        n.proxyMethod("attachment.isPreviewable"),
        n.proxyMethod("attachment.getURL"),
        n.proxyMethod("attachment.getHref"),
        n.proxyMethod("attachment.getFilename"),
        n.proxyMethod("attachment.getFilesize"),
        n.proxyMethod("attachment.getFormattedFilesize"),
        n.proxyMethod("attachment.getExtension"),
        n.proxyMethod("attachment.getContentType"),
        n.proxyMethod("attachment.getFile"),
        n.proxyMethod("attachment.setFile"),
        n.proxyMethod("attachment.releaseFile"),
        n.proxyMethod("attachment.getUploadProgress"),
        n.proxyMethod("attachment.setUploadProgress"),
        n
      );
    })(Trix.BasicObject);
  }.call(this),
  function() {
    var t = function(t, n) {
        function i() {
          this.constructor = t;
        }
        for (var o in n) e.call(n, o) && (t[o] = n[o]);
        return (
          (i.prototype = n.prototype),
          (t.prototype = new i()),
          (t.__super__ = n.prototype),
          t
        );
      },
      e = {}.hasOwnProperty;
    Trix.AttachmentManager = (function(e) {
      function n(t) {
        var e, n, i;
        for (
          null == t && (t = []),
            this.managedAttachments = {},
            n = 0,
            i = t.length;
          i > n;
          n++
        )
          (e = t[n]), this.manageAttachment(e);
      }
      return (
        t(n, e),
        (n.prototype.getAttachments = function() {
          var t, e, n, i;
          (n = this.managedAttachments), (i = []);
          for (e in n) (t = n[e]), i.push(t);
          return i;
        }),
        (n.prototype.manageAttachment = function(t) {
          var e, n;
          return null != (e = this.managedAttachments)[(n = t.id)]
            ? e[n]
            : (e[n] = new Trix.ManagedAttachment(this, t));
        }),
        (n.prototype.attachmentIsManaged = function(t) {
          return t.id in this.managedAttachments;
        }),
        (n.prototype.requestRemovalOfAttachment = function(t) {
          var e;
          return this.attachmentIsManaged(t) &&
            null != (e = this.delegate) &&
            "function" ==
              typeof e.attachmentManagerDidRequestRemovalOfAttachment
            ? e.attachmentManagerDidRequestRemovalOfAttachment(t)
            : void 0;
        }),
        (n.prototype.unmanageAttachment = function(t) {
          var e;
          return (
            (e = this.managedAttachments[t.id]),
            delete this.managedAttachments[t.id],
            e
          );
        }),
        n
      );
    })(Trix.BasicObject);
  }.call(this),
  function() {
    var t, e, n, i, o, r, s, a, u, c, l, h;
    (t = Trix.elementContainsNode),
      (e = Trix.findChildIndexOfNode),
      (n = Trix.findClosestElementFromNode),
      (i = Trix.findNodeFromContainerAndOffset),
      (s = Trix.nodeIsBlockStartComment),
      (r = Trix.nodeIsBlockContainer),
      (a = Trix.nodeIsCursorTarget),
      (u = Trix.nodeIsEmptyTextNode),
      (c = Trix.nodeIsTextNode),
      (o = Trix.nodeIsAttachmentElement),
      (l = Trix.tagName),
      (h = Trix.walkTree),
      (Trix.LocationMapper = (function() {
        function n(t) {
          this.element = t;
        }
        var i, p, d, f;
        return (
          (n.prototype.findLocationFromContainerAndOffset = function(n, i) {
            var o, r, u, l, f, g;
            for (
              r = 0,
                u = !1,
                l = { index: 0, offset: 0 },
                (o = this.findAttachmentElementParentForNode(n)) &&
                  ((n = o.parentNode), (i = e(o))),
                g = h(this.element, { usingFilter: d });
              g.nextNode();

            ) {
              if (((f = g.currentNode), f === n && c(n))) {
                a(f) || (l.offset += i);
                break;
              }
              if (f.parentNode === n) {
                if (r++ === i) break;
              } else if (!t(n, f) && r > 0) break;
              s(f)
                ? (u && l.index++, (l.offset = 0), (u = !0))
                : (l.offset += p(f));
            }
            return l;
          }),
          (n.prototype.findContainerAndOffsetFromLocation = function(t) {
            var n, i, o, s, a, u;
            if (0 === t.index && 0 === t.offset) {
              for (n = this.element, s = 0; n.firstChild; )
                if (((n = n.firstChild), r(n))) {
                  s = 1;
                  break;
                }
              return [n, s];
            }
            if (
              ((a = this.findNodeAndOffsetFromLocation(t)),
              (i = a[0]),
              (o = a[1]),
              i)
            ) {
              if (c(i)) (n = i), (u = i.textContent), (s = t.offset - o);
              else {
                if (((n = i.parentNode), !r(n)))
                  for (
                    ;
                    i === n.lastChild && ((i = n), (n = n.parentNode), !r(n));

                  );
                (s = e(i)), 0 !== t.offset && s++;
              }
              return [n, s];
            }
          }),
          (n.prototype.findNodeAndOffsetFromLocation = function(t) {
            var e, n, i, o, r, s, u, l;
            for (
              u = 0,
                l = this.getSignificantNodesForIndex(t.index),
                n = 0,
                i = l.length;
              i > n;
              n++
            ) {
              if (((e = l[n]), (o = p(e)), t.offset <= u + o))
                if (c(e)) {
                  if (((r = e), (s = u), t.offset === s && a(r))) break;
                } else r || ((r = e), (s = u));
              if (((u += o), u > t.offset)) break;
            }
            return [r, s];
          }),
          (n.prototype.findAttachmentElementParentForNode = function(t) {
            for (; t && t !== this.element; ) {
              if (o(t)) return t;
              t = t.parentNode;
            }
          }),
          (n.prototype.getSignificantNodesForIndex = function(t) {
            var e, n, o, r, a;
            for (
              o = [], a = h(this.element, { usingFilter: i }), r = !1;
              a.nextNode();

            )
              if (((n = a.currentNode), s(n))) {
                if (
                  ("undefined" != typeof e && null !== e ? e++ : (e = 0),
                  e === t)
                )
                  r = !0;
                else if (r) break;
              } else r && o.push(n);
            return o;
          }),
          (p = function(t) {
            var e;
            return t.nodeType === Node.TEXT_NODE
              ? a(t)
                ? 0
                : ((e = t.textContent), e.length)
              : "br" === l(t) || o(t)
                ? 1
                : 0;
          }),
          (i = function(t) {
            return f(t) === NodeFilter.FILTER_ACCEPT
              ? d(t)
              : NodeFilter.FILTER_REJECT;
          }),
          (f = function(t) {
            return u(t) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
          }),
          (d = function(t) {
            return o(t.parentNode)
              ? NodeFilter.FILTER_REJECT
              : NodeFilter.FILTER_ACCEPT;
          }),
          n
        );
      })());
  }.call(this),
  function() {
    var t = function(t, e) {
        return function() {
          return t.apply(e, arguments);
        };
      },
      e = function(t, e) {
        function i() {
          this.constructor = t;
        }
        for (var o in e) n.call(e, o) && (t[o] = e[o]);
        return (
          (i.prototype = e.prototype),
          (t.prototype = new i()),
          (t.__super__ = e.prototype),
          t
        );
      },
      n = {}.hasOwnProperty,
      i =
        [].indexOf ||
        function(t) {
          for (var e = 0, n = this.length; n > e; e++)
            if (e in this && this[e] === t) return e;
          return -1;
        };
    (Trix.SelectionChangeObserver = (function(n) {
      function o() {
        (this.run = t(this.run, this)),
          (this.update = t(this.update, this)),
          (this.selectionManagers = []);
      }
      var r, s;
      return (
        e(o, n),
        (o.prototype.start = function() {
          return this.started
            ? void 0
            : ((this.started = !0),
              "onselectionchange" in document
                ? document.addEventListener("selectionchange", this.update, !0)
                : this.run());
        }),
        (o.prototype.stop = function() {
          return this.started
            ? ((this.started = !1),
              document.removeEventListener("selectionchange", this.update, !0))
            : void 0;
        }),
        (o.prototype.registerSelectionManager = function(t) {
          return i.call(this.selectionManagers, t) < 0
            ? (this.selectionManagers.push(t), this.start())
            : void 0;
        }),
        (o.prototype.unregisterSelectionManager = function(t) {
          var e;
          return (
            (this.selectionManagers = function() {
              var n, i, o, r;
              for (
                o = this.selectionManagers, r = [], n = 0, i = o.length;
                i > n;
                n++
              )
                (e = o[n]), e !== t && r.push(e);
              return r;
            }.call(this)),
            0 === this.selectionManagers.length ? this.stop() : void 0
          );
        }),
        (o.prototype.notifySelectionManagersOfSelectionChange = function() {
          var t, e, n, i, o;
          for (
            n = this.selectionManagers, i = [], t = 0, e = n.length;
            e > t;
            t++
          )
            (o = n[t]), i.push(o.selectionDidChange());
          return i;
        }),
        (o.prototype.update = function() {
          var t;
          return (
            (t = s()),
            r(t, this.domRange)
              ? void 0
              : ((this.domRange = t),
                this.notifySelectionManagersOfSelectionChange())
          );
        }),
        (o.prototype.reset = function() {
          return (this.domRange = null), this.update();
        }),
        (o.prototype.run = function() {
          return this.started
            ? (this.update(), requestAnimationFrame(this.run))
            : void 0;
        }),
        (s = function() {
          var t;
          return (
            (t = window.getSelection()),
            t.rangeCount > 0 ? t.getRangeAt(0) : void 0
          );
        }),
        (r = function(t, e) {
          return (
            (null != t ? t.startContainer : void 0) ===
              (null != e ? e.startContainer : void 0) &&
            (null != t ? t.startOffset : void 0) ===
              (null != e ? e.startOffset : void 0) &&
            (null != t ? t.endContainer : void 0) ===
              (null != e ? e.endContainer : void 0) &&
            (null != t ? t.endOffset : void 0) ===
              (null != e ? e.endOffset : void 0)
          );
        }),
        o
      );
    })(Trix.BasicObject)),
      null == Trix.selectionChangeObserver &&
        (Trix.selectionChangeObserver = new Trix.SelectionChangeObserver());
  }.call(this),
  function() {
    var t,
      e,
      n,
      i,
      o,
      r,
      s,
      a,
      u,
      c,
      l = function(t, e) {
        return function() {
          return t.apply(e, arguments);
        };
      },
      h = function(t, e) {
        function n() {
          this.constructor = t;
        }
        for (var i in e) p.call(e, i) && (t[i] = e[i]);
        return (
          (n.prototype = e.prototype),
          (t.prototype = new n()),
          (t.__super__ = e.prototype),
          t
        );
      },
      p = {}.hasOwnProperty,
      d = [].slice;
    (t = Trix.defer),
      (e = Trix.elementContainsNode),
      (s = Trix.nodeIsCursorTarget),
      (o = Trix.innerElementIsActive),
      (r = Trix.makeElement),
      (n = Trix.handleEvent),
      (i = Trix.handleEventOnce),
      (a = Trix.normalizeRange),
      (u = Trix.rangeIsCollapsed),
      (c = Trix.rangesAreEqual),
      (Trix.SelectionManager = (function(t) {
        function i(t) {
          (this.element = t),
            (this.selectionDidChange = l(this.selectionDidChange, this)),
            (this.didMouseDown = l(this.didMouseDown, this)),
            (this.locationMapper = new Trix.LocationMapper(this.element)),
            (this.lockCount = 0),
            n("mousedown", {
              onElement: this.element,
              withCallback: this.didMouseDown
            });
        }
        var p, f, g, m, y, v, b;
        return (
          h(i, t),
          (i.prototype.getLocationRange = function(t) {
            var e, n;
            return (
              null == t && (t = {}),
              (e = t.ignoreLock
                ? this.currentLocationRange
                : null != (n = this.lockedLocationRange)
                  ? n
                  : this.currentLocationRange)
            );
          }),
          (i.prototype.setLocationRange = function(t) {
            var e;
            if (!this.lockedLocationRange)
              return (
                (t = a(t)),
                (e = this.createDOMRangeFromLocationRange(t))
                  ? (b(e), this.updateCurrentLocationRange(t))
                  : void 0
              );
          }),
          (i.prototype.getSelectedPointRange = function() {
            var t;
            return null != (t = v()) ? t : g();
          }),
          (i.prototype.setLocationRangeFromPointRange = function(t) {
            var e, n, i, o;
            return (
              (t = a(t)),
              (o =
                null != (n = this.getLocationRangeAtPoint(t[0]))
                  ? n[0]
                  : void 0),
              (e =
                null != (i = this.getLocationRangeAtPoint(t[1]))
                  ? i[0]
                  : void 0),
              this.setLocationRange([o, e])
            );
          }),
          (i.prototype.getClientRectAtLocationRange = function(t) {
            var e, n;
            return (e = this.createDOMRangeFromLocationRange(t))
              ? ((n = d.call(e.getClientRects())), n.slice(-1)[0])
              : void 0;
          }),
          (i.prototype.locationIsCursorTarget = function(t) {
            var e, n, i;
            return (
              (i = this.findNodeAndOffsetFromLocation(t)),
              (e = i[0]),
              (n = i[1]),
              s(e)
            );
          }),
          (i.prototype.lock = function() {
            return 0 === this.lockCount++
              ? (this.updateCurrentLocationRange(),
                (this.lockedLocationRange = this.getLocationRange()))
              : void 0;
          }),
          (i.prototype.unlock = function() {
            var t;
            return 0 === --this.lockCount &&
              ((t = this.lockedLocationRange),
              (this.lockedLocationRange = null),
              null != t)
              ? this.setLocationRange(t)
              : void 0;
          }),
          (i.prototype.clearSelection = function() {
            var t;
            return null != (t = y()) ? t.removeAllRanges() : void 0;
          }),
          (i.prototype.selectionIsCollapsed = function() {
            var t;
            return (null != (t = m()) ? t.collapsed : void 0) === !0;
          }),
          (i.prototype.selectionIsExpanded = function() {
            return !this.selectionIsCollapsed();
          }),
          i.proxyMethod("locationMapper.findLocationFromContainerAndOffset"),
          i.proxyMethod("locationMapper.findContainerAndOffsetFromLocation"),
          i.proxyMethod("locationMapper.findNodeAndOffsetFromLocation"),
          (i.prototype.didMouseDown = function() {
            return this.pauseTemporarily();
          }),
          (i.prototype.pauseTemporarily = function() {
            var t, i, o, r;
            return (
              (this.paused = !0),
              (i = (function(t) {
                return function() {
                  var n, i, s;
                  for (
                    t.paused = !1, clearTimeout(r), i = 0, s = o.length;
                    s > i;
                    i++
                  )
                    (n = o[i]), n.destroy();
                  return e(document, t.element)
                    ? t.selectionDidChange()
                    : void 0;
                };
              })(this)),
              (r = setTimeout(i, 200)),
              (o = (function() {
                var e, o, r, s;
                for (
                  r = ["mousemove", "keydown"], s = [], e = 0, o = r.length;
                  o > e;
                  e++
                )
                  (t = r[e]),
                    s.push(n(t, { onElement: document, withCallback: i }));
                return s;
              })())
            );
          }),
          (i.prototype.selectionDidChange = function() {
            return this.paused || o(this.element)
              ? void 0
              : this.updateCurrentLocationRange();
          }),
          (i.prototype.updateCurrentLocationRange = function(t) {
            var e, n;
            return (
              null == t && (t = this.createLocationRangeFromDOMRange(m())),
              c(t, this.currentLocationRange)
                ? void 0
                : ((this.currentLocationRange = t),
                  null != (e = this.delegate) &&
                  "function" == typeof e.locationRangeDidChange
                    ? e.locationRangeDidChange(
                        null != (n = this.currentLocationRange)
                          ? n.slice(0)
                          : void 0
                      )
                    : void 0)
            );
          }),
          (i.prototype.createDOMRangeFromLocationRange = function(t) {
            var e, n, i, o;
            return (
              (i = this.findContainerAndOffsetFromLocation(t[0])),
              (n = u(t)
                ? i
                : null != (o = this.findContainerAndOffsetFromLocation(t[1]))
                  ? o
                  : i),
              null != i && null != n
                ? ((e = document.createRange()),
                  e.setStart.apply(e, i),
                  e.setEnd.apply(e, n),
                  e)
                : void 0
            );
          }),
          (i.prototype.createLocationRangeFromDOMRange = function(t) {
            var e, n;
            if (
              null != t &&
              this.domRangeWithinElement(t) &&
              (n = this.findLocationFromContainerAndOffset(
                t.startContainer,
                t.startOffset
              ))
            )
              return (
                t.collapsed ||
                  (e = this.findLocationFromContainerAndOffset(
                    t.endContainer,
                    t.endOffset
                  )),
                a([n, e])
              );
          }),
          (i.prototype.domRangeWithinElement = function(t) {
            return t.collapsed
              ? e(this.element, t.startContainer)
              : e(this.element, t.startContainer) &&
                  e(this.element, t.endContainer);
          }),
          (i.prototype.getLocationRangeAtPoint = function(t) {
            var e, n, i, o, r, s, a, u;
            if (((a = t.x), (u = t.y), document.caretPositionFromPoint))
              (r = document.caretPositionFromPoint(a, u)),
                (i = r.offsetNode),
                (n = r.offset),
                (e = document.createRange()),
                e.setStart(i, n);
            else if (document.caretRangeFromPoint)
              e = document.caretRangeFromPoint(a, u);
            else if (document.body.createTextRange) {
              o = m();
              try {
                (s = document.body.createTextRange()),
                  s.moveToPoint(a, u),
                  s.select();
              } catch (c) {}
              (e = m()), b(o);
            }
            return this.createLocationRangeFromDOMRange(e);
          }),
          (p = r({
            tagName: "span",
            style: { marginLeft: "-0.01em" },
            data: { trixMutable: !0, trixSerialize: !1 }
          })),
          (g = function() {
            var t, e, n, i;
            if ((t = m())) {
              e = p.cloneNode(!0);
              try {
                t.insertNode(e), (n = e.getBoundingClientRect());
              } finally {
                e.parentNode.removeChild(e);
              }
              return (i = { x: n.left, y: n.top + 1 }), a(i);
            }
          }),
          (v = function() {
            var t, e, n, i, o, r;
            if ((t = m()))
              return (
                (i = t.getClientRects()),
                i.length > 0
                  ? ((r = i[0]),
                    (n = i[i.length - 1]),
                    (o = { x: r.left, y: r.top + 1 }),
                    (e = { x: n.right, y: n.top + 1 }),
                    a(o, e))
                  : void 0
              );
          }),
          (y = function() {
            var t;
            return (t = window.getSelection()), t.rangeCount > 0 ? t : void 0;
          }),
          (m = function() {
            var t;
            return null != (t = y()) ? t.getRangeAt(0) : void 0;
          }),
          (b = function(t) {
            var e;
            return (
              (e = window.getSelection()),
              e.removeAllRanges(),
              e.addRange(t),
              Trix.selectionChangeObserver.update()
            );
          }),
          (f = function() {
            var t, e;
            return (
              (t = null != (e = m()) ? e.getClientRects() : void 0),
              (null != t ? t.length : void 0) ? t : void 0
            );
          }),
          i
        );
      })(Trix.BasicObject));
  }.call(this),
  function() {
    var t,
      e,
      n,
      i = function(t, e) {
        function n() {
          this.constructor = t;
        }
        for (var i in e) o.call(e, i) && (t[i] = e[i]);
        return (
          (n.prototype = e.prototype),
          (t.prototype = new n()),
          (t.__super__ = e.prototype),
          t
        );
      },
      o = {}.hasOwnProperty,
      r = [].slice;
    (e = Trix.rangeIsCollapsed),
      (n = Trix.rangesAreEqual),
      (t = Trix.objectsAreEqual),
      (Trix.EditorController = (function(o) {
        function s(t) {
          var e, n;
          (this.editorElement = t.editorElement),
            (e = t.document),
            (n = t.html),
            (this.selectionManager = new Trix.SelectionManager(
              this.editorElement
            )),
            (this.selectionManager.delegate = this),
            (this.composition = new Trix.Composition()),
            (this.composition.delegate = this),
            (this.attachmentManager = new Trix.AttachmentManager(
              this.composition.getAttachments()
            )),
            (this.attachmentManager.delegate = this),
            (this.inputController = new Trix.InputController(
              this.editorElement
            )),
            (this.inputController.delegate = this),
            (this.inputController.responder = this.composition),
            (this.compositionController = new Trix.CompositionController(
              this.editorElement,
              this.composition
            )),
            (this.compositionController.delegate = this),
            (this.toolbarController = new Trix.ToolbarController(
              this.editorElement.toolbarElement
            )),
            (this.toolbarController.delegate = this),
            (this.editor = new Trix.Editor(
              this.composition,
              this.selectionManager,
              this.editorElement
            )),
            null != e ? this.editor.loadDocument(e) : this.editor.loadHTML(n);
        }
        return (
          i(s, o),
          (s.prototype.registerSelectionManager = function() {
            return Trix.selectionChangeObserver.registerSelectionManager(
              this.selectionManager
            );
          }),
          (s.prototype.unregisterSelectionManager = function() {
            return Trix.selectionChangeObserver.unregisterSelectionManager(
              this.selectionManager
            );
          }),
          (s.prototype.compositionDidChangeDocument = function() {
            return (
              this.editorElement.notify("document-change"),
              this.handlingInput ? void 0 : this.render()
            );
          }),
          (s.prototype.compositionDidChangeCurrentAttributes = function(t) {
            return (
              (this.currentAttributes = t),
              this.toolbarController.updateAttributes(this.currentAttributes),
              this.updateCurrentActions(),
              this.editorElement.notify("attributes-change", {
                attributes: this.currentAttributes
              })
            );
          }),
          (s.prototype.compositionDidPerformInsertionAtRange = function(t) {
            return this.pasting ? (this.pastedRange = t) : void 0;
          }),
          (s.prototype.compositionShouldAcceptFile = function(t) {
            return this.editorElement.notify("file-accept", { file: t });
          }),
          (s.prototype.compositionDidAddAttachment = function(t) {
            var e;
            return (
              (e = this.attachmentManager.manageAttachment(t)),
              this.editorElement.notify("attachment-add", { attachment: e })
            );
          }),
          (s.prototype.compositionDidEditAttachment = function(t) {
            var e;
            return (
              this.compositionController.rerenderViewForObject(t),
              (e = this.attachmentManager.manageAttachment(t)),
              this.editorElement.notify("attachment-edit", { attachment: e }),
              this.editorElement.notify("change")
            );
          }),
          (s.prototype.compositionDidRemoveAttachment = function(t) {
            var e;
            return (
              (e = this.attachmentManager.unmanageAttachment(t)),
              this.editorElement.notify("attachment-remove", { attachment: e })
            );
          }),
          (s.prototype.compositionDidStartEditingAttachment = function(t) {
            var e, n;
            return (
              (n = this.composition.document),
              (e = n.getRangeOfAttachment(t)),
              (this.attachmentLocationRange = n.locationRangeFromRange(e)),
              this.compositionController.installAttachmentEditorForAttachment(
                t
              ),
              this.selectionManager.setLocationRange(
                this.attachmentLocationRange
              )
            );
          }),
          (s.prototype.compositionDidStopEditingAttachment = function() {
            return (
              this.compositionController.uninstallAttachmentEditor(),
              (this.attachmentLocationRange = null)
            );
          }),
          (s.prototype.compositionDidRequestChangingSelection = function(t) {
            return !this.loadingSnapshot || this.isFocused()
              ? ((this.requestedSelection = t),
                (this.documentWhenSelectionRequested = this.composition.document),
                this.handlingInput ? void 0 : this.render())
              : void 0;
          }),
          (s.prototype.compositionWillLoadSnapshot = function() {
            return (this.loadingSnapshot = !0);
          }),
          (s.prototype.compositionDidLoadSnapshot = function() {
            return (
              this.compositionController.refreshViewCache(),
              this.render(),
              (this.loadingSnapshot = !1)
            );
          }),
          (s.prototype.getSelectionManager = function() {
            return this.selectionManager;
          }),
          s.proxyMethod("getSelectionManager().setLocationRange"),
          s.proxyMethod("getSelectionManager().getLocationRange"),
          (s.prototype.attachmentManagerDidRequestRemovalOfAttachment = function(
            t
          ) {
            return this.removeAttachment(t);
          }),
          (s.prototype.compositionControllerWillSyncDocumentView = function() {
            return (
              this.inputController.editorWillSyncDocumentView(),
              this.selectionManager.lock(),
              this.selectionManager.clearSelection()
            );
          }),
          (s.prototype.compositionControllerDidSyncDocumentView = function() {
            return (
              this.inputController.editorDidSyncDocumentView(),
              this.selectionManager.unlock(),
              this.updateCurrentActions(),
              this.editorElement.notify("sync")
            );
          }),
          (s.prototype.compositionControllerDidRender = function() {
            var t, e, n;
            return (
              null != this.requestedSelection &&
                (this.documentWhenSelectionRequested.isEqualTo(
                  this.composition.document
                ) &&
                  ((n = this.requestedSelection),
                  (t = n.locationRange),
                  (e = n.pointRange),
                  t
                    ? this.selectionManager.setLocationRange(t)
                    : e &&
                      this.selectionManager.setLocationRangeFromPointRange(e)),
                this.composition.updateCurrentAttributes(),
                (this.requestedSelection = null),
                (this.documentWhenSelectionRequested = null)),
              this.editorElement.notify("render")
            );
          }),
          (s.prototype.compositionControllerDidFocus = function() {
            return (
              this.toolbarController.hideDialog(),
              this.editorElement.notify("focus")
            );
          }),
          (s.prototype.compositionControllerDidBlur = function() {
            return this.editorElement.notify("blur");
          }),
          (s.prototype.compositionControllerDidSelectAttachment = function(t) {
            return this.composition.editAttachment(t);
          }),
          (s.prototype.compositionControllerDidRequestDeselectingAttachment = function() {
            return this.attachmentLocationRange
              ? this.selectionManager.setLocationRange(
                  this.attachmentLocationRange[1]
                )
              : void 0;
          }),
          (s.prototype.compositionControllerWillUpdateAttachment = function(t) {
            return this.editor.recordUndoEntry("Edit Attachment", {
              context: t.id,
              consolidatable: !0
            });
          }),
          (s.prototype.compositionControllerDidRequestRemovalOfAttachment = function(
            t
          ) {
            return this.removeAttachment(t);
          }),
          (s.prototype.inputControllerWillHandleInput = function() {
            return (this.handlingInput = !0), (this.requestedRender = !1);
          }),
          (s.prototype.inputControllerDidRequestRender = function() {
            return (this.requestedRender = !0);
          }),
          (s.prototype.inputControllerDidHandleInput = function() {
            return (
              (this.handlingInput = !1),
              this.requestedRender
                ? ((this.requestedRender = !1), this.render())
                : void 0
            );
          }),
          (s.prototype.inputControllerWillPerformTyping = function() {
            return this.recordTypingUndoEntry();
          }),
          (s.prototype.inputControllerWillCutText = function() {
            return this.editor.recordUndoEntry("Cut");
          }),
          (s.prototype.inputControllerWillPasteText = function() {
            return this.editor.recordUndoEntry("Paste"), (this.pasting = !0);
          }),
          (s.prototype.inputControllerDidPaste = function(t) {
            var e;
            return (
              (e = this.pastedRange),
              (this.pastedRange = null),
              (this.pasting = null),
              this.editorElement.notify("paste", { pasteData: t, range: e }),
              this.render()
            );
          }),
          (s.prototype.inputControllerWillMoveText = function() {
            return this.editor.recordUndoEntry("Move");
          }),
          (s.prototype.inputControllerWillAttachFiles = function() {
            return this.editor.recordUndoEntry("Drop Files");
          }),
          (s.prototype.inputControllerDidReceiveKeyboardCommand = function(t) {
            return this.toolbarController.applyKeyboardCommand(t);
          }),
          (s.prototype.inputControllerDidStartDrag = function() {
            return (this.locationRangeBeforeDrag = this.selectionManager.getLocationRange());
          }),
          (s.prototype.inputControllerDidReceiveDragOverPoint = function(t) {
            return this.selectionManager.setLocationRangeFromPointRange(t);
          }),
          (s.prototype.inputControllerDidCancelDrag = function() {
            return (
              this.selectionManager.setLocationRange(
                this.locationRangeBeforeDrag
              ),
              (this.locationRangeBeforeDrag = null)
            );
          }),
          (s.prototype.locationRangeDidChange = function(t) {
            return (
              this.composition.updateCurrentAttributes(),
              this.updateCurrentActions(),
              this.attachmentLocationRange &&
                !n(this.attachmentLocationRange, t) &&
                this.composition.stopEditingAttachment(),
              this.editorElement.notify("selection-change")
            );
          }),
          (s.prototype.toolbarDidClickButton = function() {
            return this.getLocationRange()
              ? void 0
              : this.setLocationRange({ index: 0, offset: 0 });
          }),
          (s.prototype.toolbarDidInvokeAction = function(t) {
            return this.invokeAction(t);
          }),
          (s.prototype.toolbarDidToggleAttribute = function(t) {
            return (
              this.recordFormattingUndoEntry(),
              this.composition.toggleCurrentAttribute(t),
              this.render(),
              this.editorElement.focus()
            );
          }),
          (s.prototype.toolbarDidUpdateAttribute = function(t, e) {
            return (
              this.recordFormattingUndoEntry(),
              this.composition.setCurrentAttribute(t, e),
              this.render(),
              this.editorElement.focus()
            );
          }),
          (s.prototype.toolbarDidRemoveAttribute = function(t) {
            return (
              this.recordFormattingUndoEntry(),
              this.composition.removeCurrentAttribute(t),
              this.render(),
              this.editorElement.focus()
            );
          }),
          (s.prototype.toolbarWillShowDialog = function() {
            return (
              this.composition.expandSelectionForEditing(),
              this.freezeSelection()
            );
          }),
          (s.prototype.toolbarDidShowDialog = function(t) {
            return this.editorElement.notify("toolbar-dialog-show", {
              dialogName: t
            });
          }),
          (s.prototype.toolbarDidHideDialog = function(t) {
            return (
              this.editorElement.focus(),
              this.thawSelection(),
              this.editorElement.notify("toolbar-dialog-hide", {
                dialogName: t
              })
            );
          }),
          (s.prototype.freezeSelection = function() {
            return this.selectionFrozen
              ? void 0
              : (this.selectionManager.lock(),
                this.composition.freezeSelection(),
                (this.selectionFrozen = !0),
                this.render());
          }),
          (s.prototype.thawSelection = function() {
            return this.selectionFrozen
              ? (this.composition.thawSelection(),
                this.selectionManager.unlock(),
                (this.selectionFrozen = !1),
                this.render())
              : void 0;
          }),
          (s.prototype.actions = {
            undo: {
              test: function() {
                return this.editor.canUndo();
              },
              perform: function() {
                return this.editor.undo();
              }
            },
            redo: {
              test: function() {
                return this.editor.canRedo();
              },
              perform: function() {
                return this.editor.redo();
              }
            },
            link: {
              test: function() {
                return this.editor.canActivateAttribute("href");
              }
            },
            increaseBlockLevel: {
              test: function() {
                return this.editor.canIncreaseIndentationLevel();
              },
              perform: function() {
                return this.editor.increaseIndentationLevel() && this.render();
              }
            },
            decreaseBlockLevel: {
              test: function() {
                return this.editor.canDecreaseIndentationLevel();
              },
              perform: function() {
                return this.editor.decreaseIndentationLevel() && this.render();
              }
            }
          }),
          (s.prototype.canInvokeAction = function(t) {
            var e, n;
            return this.actionIsExternal(t)
              ? !0
              : !!(null != (e = this.actions[t]) && null != (n = e.test)
                  ? n.call(this)
                  : void 0);
          }),
          (s.prototype.invokeAction = function(t) {
            var e, n;
            return this.actionIsExternal(t)
              ? this.editorElement.notify("action-invoke", { actionName: t })
              : null != (e = this.actions[t]) && null != (n = e.perform)
                ? n.call(this)
                : void 0;
          }),
          (s.prototype.actionIsExternal = function(t) {
            return /^x-./.test(t);
          }),
          (s.prototype.getCurrentActions = function() {
            var t, e;
            e = {};
            for (t in this.actions) e[t] = this.canInvokeAction(t);
            return e;
          }),
          (s.prototype.updateCurrentActions = function() {
            var e;
            return (
              (e = this.getCurrentActions()),
              t(e, this.currentActions)
                ? void 0
                : ((this.currentActions = e),
                  this.toolbarController.updateActions(this.currentActions),
                  this.editorElement.notify("actions-change", {
                    actions: this.currentActions
                  }))
            );
          }),
          (s.prototype.reparse = function() {
            return this.composition.replaceHTML(this.editorElement.innerHTML);
          }),
          (s.prototype.render = function() {
            return this.compositionController.render();
          }),
          (s.prototype.removeAttachment = function(t) {
            return (
              this.editor.recordUndoEntry("Delete Attachment"),
              this.composition.removeAttachment(t),
              this.render()
            );
          }),
          (s.prototype.recordFormattingUndoEntry = function() {
            var t;
            return (
              (t = this.selectionManager.getLocationRange()),
              e(t)
                ? void 0
                : this.editor.recordUndoEntry("Formatting", {
                    context: this.getUndoContext(),
                    consolidatable: !0
                  })
            );
          }),
          (s.prototype.recordTypingUndoEntry = function() {
            return this.editor.recordUndoEntry("Typing", {
              context: this.getUndoContext(this.currentAttributes),
              consolidatable: !0
            });
          }),
          (s.prototype.getUndoContext = function() {
            var t;
            return (
              (t = 1 <= arguments.length ? r.call(arguments, 0) : []),
              [this.getLocationContext(), this.getTimeContext()].concat(
                r.call(t)
              )
            );
          }),
          (s.prototype.getLocationContext = function() {
            var t;
            return (
              (t = this.selectionManager.getLocationRange()),
              e(t) ? t[0].index : t
            );
          }),
          (s.prototype.getTimeContext = function() {
            return Trix.config.undoInterval > 0
              ? Math.floor(new Date().getTime() / Trix.config.undoInterval)
              : 0;
          }),
          (s.prototype.isFocused = function() {
            var t;
            return (
              this.editorElement ===
              (null != (t = this.editorElement.ownerDocument)
                ? t.activeElement
                : void 0)
            );
          }),
          s
        );
      })(Trix.Controller));
  }.call(this),
  function() {
    var t, e, n, i, o, r;
    (o = Trix.makeElement),
      (r = Trix.triggerEvent),
      (n = Trix.handleEvent),
      (i = Trix.handleEventOnce),
      (e = Trix.defer),
      (t = Trix.AttachmentView.attachmentSelector),
      Trix.registerElement(
        "trix-editor",
        (function() {
          var e, s, a, u, c, l;
          return (
            (u = 0),
            (e = function(t) {
              return !document.querySelector(":focus") &&
                t.hasAttribute("autofocus") &&
                document.querySelector("[autofocus]") === t
                ? t.focus()
                : void 0;
            }),
            (c = function(t) {
              return t.hasAttribute("contenteditable")
                ? void 0
                : (t.setAttribute("contenteditable", ""),
                  i("focus", {
                    onElement: t,
                    withCallback: function() {
                      return s(t);
                    }
                  }));
            }),
            (s = function(t) {
              return a(t), l(t);
            }),
            (a = function(t) {
              return ("function" == typeof document.queryCommandSupported
              ? document.queryCommandSupported("enableObjectResizing")
              : void 0)
                ? (document.execCommand("enableObjectResizing", !1, !1),
                  n("mscontrolselect", { onElement: t, preventDefault: !0 }))
                : void 0;
            }),
            (l = function() {
              var t;
              return ("function" == typeof document.queryCommandSupported
                ? document.queryCommandSupported("DefaultParagraphSeparator")
                : void 0) &&
                ((t = Trix.config.blockAttributes["default"].tagName),
                "div" === t || "p" === t)
                ? document.execCommand("DefaultParagraphSeparator", !1, t)
                : void 0;
            }),
            {
              defaultCSS:
                "%t:empty:not(:focus)::before {\n  content: attr(placeholder);\n  color: graytext;\n}\n\n%t a[contenteditable=false] {\n  cursor: text;\n}\n\n%t img {\n  max-width: 100%;\n  height: auto;\n}\n\n%t " +
                t +
                " figcaption textarea {\n  resize: none;\n}\n\n%t " +
                t +
                " figcaption textarea.trix-autoresize-clone {\n  position: absolute;\n  left: -9999px;\n  max-height: 0px;\n}",
              trixId: {
                get: function() {
                  return this.hasAttribute("trix-id")
                    ? this.getAttribute("trix-id")
                    : (this.setAttribute("trix-id", ++u), this.trixId);
                }
              },
              toolbarElement: {
                get: function() {
                  var t, e, n;
                  return this.hasAttribute("toolbar")
                    ? null != (e = this.ownerDocument)
                      ? e.getElementById(this.getAttribute("toolbar"))
                      : void 0
                    : this.parentElement
                      ? ((n = "trix-toolbar-" + this.trixId),
                        this.setAttribute("toolbar", n),
                        (t = o("trix-toolbar", { id: n })),
                        this.parentElement.insertBefore(t, this),
                        t)
                      : void 0;
                }
              },
              inputElement: {
                get: function() {
                  var t, e, n;
                  return this.hasAttribute("input")
                    ? null != (n = this.ownerDocument)
                      ? n.getElementById(this.getAttribute("input"))
                      : void 0
                    : this.parentElement
                      ? ((e = "trix-input-" + this.trixId),
                        this.setAttribute("input", e),
                        (t = o("input", { type: "hidden", id: e })),
                        this.parentElement.insertBefore(
                          t,
                          this.nextElementSibling
                        ),
                        t)
                      : void 0;
                }
              },
              editor: {
                get: function() {
                  var t;
                  return null != (t = this.editorController)
                    ? t.editor
                    : void 0;
                }
              },
              name: {
                get: function() {
                  var t;
                  return null != (t = this.inputElement) ? t.name : void 0;
                }
              },
              value: {
                get: function() {
                  var t;
                  return null != (t = this.inputElement) ? t.value : void 0;
                },
                set: function(t) {
                  var e;
                  return (
                    (this.defaultValue = t),
                    null != (e = this.editor)
                      ? e.loadHTML(this.defaultValue)
                      : void 0
                  );
                }
              },
              notify: function(t, e) {
                var n;
                switch (t) {
                  case "document-change":
                    this.documentChangedSinceLastRender = !0;
                    break;
                  case "render":
                    this.documentChangedSinceLastRender &&
                      ((this.documentChangedSinceLastRender = !1),
                      this.notify("change"));
                    break;
                  case "change":
                  case "attachment-add":
                  case "attachment-edit":
                  case "attachment-remove":
                    null != (n = this.inputElement) &&
                      (n.value = Trix.serializeToContentType(
                        this,
                        "text/html"
                      ));
                }
                return this.editorController
                  ? r("trix-" + t, { onElement: this, attributes: e })
                  : void 0;
              },
              createdCallback: function() {
                return c(this);
              },
              attachedCallback: function() {
                return this.hasAttribute("data-trix-internal")
                  ? void 0
                  : (e(this),
                    null == this.editorController &&
                      (this.editorController = new Trix.EditorController({
                        editorElement: this,
                        html: (this.defaultValue = this.value)
                      })),
                    this.editorController.registerSelectionManager(),
                    this.registerResetListener(),
                    requestAnimationFrame(
                      (function(t) {
                        return function() {
                          return t.notify("initialize");
                        };
                      })(this)
                    ));
              },
              detachedCallback: function() {
                var t;
                return (
                  null != (t = this.editorController) &&
                    t.unregisterSelectionManager(),
                  this.unregisterResetListener()
                );
              },
              registerResetListener: function() {
                return (
                  (this.resetListener = this.resetBubbled.bind(this)),
                  window.addEventListener("reset", this.resetListener, !1)
                );
              },
              unregisterResetListener: function() {
                return window.removeEventListener(
                  "reset",
                  this.resetListener,
                  !1
                );
              },
              resetBubbled: function(t) {
                var e;
                return t.target !==
                  (null != (e = this.inputElement) ? e.form : void 0) ||
                  t.defaultPrevented
                  ? void 0
                  : this.reset();
              },
              reset: function() {
                return (this.value = this.defaultValue);
              }
            }
          );
        })()
      );
  }.call(this));
