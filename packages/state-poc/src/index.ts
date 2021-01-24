export const _ = 1;


// import { createAction, createReducer } from '@reduxjs/toolkit'
//
// interface CounterState {
//   value: number
// }
//
// const increment = createAction('counter/increment')
// const decrement = createAction('counter/decrement')
// const incrementByAmount = createAction<number>('counter/incrementByAmount')
//
// const initialState = { value: 0 } as CounterState
//
// const counterReducer = createReducer(initialState, (builder) => {
//   builder
//     .addCase(increment, (state, action) => {
//       state.value++
//     })
//     .addCase(decrement, (state, action) => {
//       state.value--
//     })
//     .addCase(incrementByAmount, (state, action) => {
//       state.value += action.payload
//     })
// })


import { createAction } from '@reduxjs/toolkit'

const increment = createAction<number | undefined>('counter/increment')

let action = increment()
// { type: 'counter/increment' }

action = increment(3)
action = increment()
// returns { type: 'counter/increment', payload: 3 }

console.log(increment.toString())
// 'counter/increment'

console.log(`The action type is: ${increment}`)
// 'The action type is: counter/increment'

