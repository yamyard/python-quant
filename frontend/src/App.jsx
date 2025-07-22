import React from 'react';
import { Container, Typography } from '@mui/material';
import KlineChart from './components/KlineChart';
import SignalDisplay from './components/SignalDisplay';
import SignalForm from './components/SignalForm';

function App() {
  return (
    <Container>
	  <KlineChart />
    </Container>
  );
}

export default App;
