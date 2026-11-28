'use client'

import React, { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { store } from './store'

const ReduxProvider = ({children}:{children:ReactNode}) => {
    //isme store bhi dena pdta hai taaki children yaani poora pp store ki slices ko access krpaaye
  return (
    <div>
        <Provider store={store}>
            {children}
        </Provider>
    </div>
  )
}

export default ReduxProvider