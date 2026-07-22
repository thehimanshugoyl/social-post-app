// App.jsx
import './App.css';
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import PostCreator from './components/PostCreator';

export default function App() {
  return (
    <Provider store={store}>
      <PostCreator />
    </Provider>
  );
}