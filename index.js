/*
 * Created on Sat Feb 27 2021
 *
 * Copyright (c) 2021 - Denis Pikalov
 */

/**/
const generator = (executor) => {
  let state = { value: undefined, done: true }
  let unlock= () => {}

  const emit = (value) => {
    state = { value, done: false }
    return new Promise(done => unlock = done)
  }

  const next = () => {
    unlock()
    return { ...state }
  }

  executor( emit ).finally(() =>
    state.done = true
  )

  return {
    next, [Symbol.iterator]: function () { return this }
  }
}

// Demo
(async () => {
  const printAll = async (iterable) => {
    for await (let i of iterable)
      console.log(i)
  }

  // Here we use generator above
  const iterableA = generator(
    async (emit) => {
      console.log('Here we use custom "generator"')
      await emit(11)
      await emit(22)
      await emit( new Promise(done => setTimeout(() => done(33), 100)) )
      await emit(44)
    }
  )

  // Here we use ECMA6 generator
  const iterableB = (function* () {
    console.log('Here we use ECMA6 generator (function*, yield)')
    yield 11
    yield 22
    yield new Promise(done => setTimeout(() => done(33), 100))
    yield 44
  })();

  await printAll( iterableA )
  await printAll( iterableB )
})();
