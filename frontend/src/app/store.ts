import { configureStore } from '@reduxjs/toolkit';

// Import reducers here when created
// import authReducer from '@features/auth/authSlice';

export const store = configureStore({
  reducer: {
    // auth: authReducer,
    // Add other reducers here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
