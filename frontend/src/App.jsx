import React from 'react';
import { Container, Typography } from '@mui/material';
import KlineChart from './components/KlineChart';
import SignalDisplay from './components/SignalDisplay';
import TickerSymbol from './components/TickerSymbol';

function App() {
  return (
    <Container>
	  <KlineChart />
	  <SignalDisplay />
	  <TickerSymbol />
    </Container>
  );
}

export default App;
