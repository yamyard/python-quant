import React from 'react';
import { Container, Typography } from '@mui/material';
import KlineChart from './components/KlineChart';

function App() {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>BTC/USDT K线图</Typography>
      <KlineChart />
    </Container>
  );
}

export default App;
