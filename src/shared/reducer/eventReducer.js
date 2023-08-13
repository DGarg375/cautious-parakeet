import * as React from 'react'
import ReactDOM from 'react-dom'

function eventReducer(state, action) {
  return {event : action.type}
}

function useEvent({reducer = eventReducer} = {}) {
  const [{event}, dispatch] = React.useReducer(reducer, {event: "1"})

  const changeEvent = (evId) => dispatch({type: evId})

  return {event, changeEvent}
}

export {useEvent, eventReducer}