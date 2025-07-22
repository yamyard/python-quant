import React from 'react';
import { Container, Typography } from '@mui/material';
import KlineChart from './components/KlineChart';
import SignalDisplay from './components/SignalDisplay';

function App() {
  return (
    <Container>
	  <KlineChart />
	  <SignalDisplay />
    </Container>
  );
}

export default App;
