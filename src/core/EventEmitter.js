/**
 * Minimal event emitter — used by AssetLoader, SceneManager, etc.
 */
export class EventEmitter {
  constructor() {
    this._listeners = {}
  }

  on(event, fn) {
    if (!this._listeners[event]) this._listeners[event] = []
    this._listeners[event].push(fn)
    return this
  }

  off(event, fn) {
    if (!this._listeners[event]) return
    this._listeners[event] = this._listeners[event].filter(f => f !== fn)
    return this
  }

  emit(event, ...args) {
    if (!this._listeners[event]) return
    for (const fn of this._listeners[event]) {
      fn(...args)
    }
    return this
  }
}
