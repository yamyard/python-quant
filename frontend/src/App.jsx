import React, { useState } from 'react';
import { Container, Typography } from '@mui/material';
import KlineChart from './components/KlineChart';
import SignalDisplay from './components/SignalDisplay';
import TickerSymbol from './components/TickerSymbol';
import AccountModule from './components/AccountModule';
import BacktestModule from './components/BacktestModule';

function App() {
	// add symbol state, default as BTCUSDT
	const [symbol, setSymbol] = useState('BTCUSDT');

	return (
		<Container>
			{/* pass symbol to KlineChart, with using key to force reload component */}
			<KlineChart symbol={symbol} key={symbol} />
			{/* pass symbol and setSymbol to TickerSymbol */}
			<TickerSymbol currentSymbol={symbol} onSymbolChange={setSymbol} />
			<SignalDisplay />
			<AccountModule />
			<BacktestModule />
		</Container>
	);
}

export default App;
