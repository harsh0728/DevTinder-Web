import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice.js'
import connectionReducer from './connectionSlice.js'
import feedReducer from './feedSlice.js'
import requestReducer from './requestSlice.js'

export default configureStore({
  reducer: {
    user:userReducer,
    connection:connectionReducer,
    feed:feedReducer,
    requests:requestReducer

  },
})