import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";
import { useEffect, useState } from "react";

// Constants
const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
	const TEST_GIFS = [
		"https://i.giphy.com/media/eIG0HfouRQJQr1wBzz/giphy.webp",
		"https://media3.giphy.com/media/L71a8LW2UrKwPaWNYM/giphy.gif?cid=ecf05e47rr9qizx2msjucl1xyvuu47d7kf25tqt2lvo024uo&rid=giphy.gif&ct=g",
		"https://media4.giphy.com/media/AeFmQjHMtEySooOc8K/giphy.gif?cid=ecf05e47qdzhdma2y3ugn32lkgi972z9mpfzocjj6z1ro4ec&rid=giphy.gif&ct=g",
		"https://i.giphy.com/media/PAqjdPkJLDsmBRSYUp/giphy.webp"
	];
	const [walletAddress, setWalletAddress] = useState(null);
	// check if phanthom wallet is connected
	const checkIfWalletIsConnected = async () => {
		try {
			const { solana } = window;

			if (solana) {
				console.log("solana objec", solana);
				if (solana.isPhantom) {
					console.log("phanthom wallet found");
					// method on solana to connect directly with user wallet
					// onlyiftrusted remember connection so don t have to connect again
					const response = await solana.connect({
						onlyIfTursted: true
					});
					console.log("SOLANA CONNECT RESPONSE", response);
					console.log(
						"connected with public key",
						response.publicKey.toString()
					);
					setWalletAddress(response.publicKey.toString());
				}
			} else {
				alert("solana object not foudn, get a phantom wallet");
			}
		} catch (error) {
			console.error(error);
		}
	};

	const connectWallet = async () => {};

	const renderNotConnectedContainer = () => (
		<button
			className="cta-button connect-wallet-button"
			onClick={connectWallet}>
			Connect to Wallet
		</button>
	);

	const renderConnectedContainer = () => (
		<div className="connected-container">
			<div className="gif-grid">
				{TEST_GIFS.map((gif) => (
					<div className="gif-item" key={gif}>
						<img src={gif} alt={gif} />
					</div>
				))}
			</div>
		</div>
	);

	useEffect(() => {
		const onLoad = async () => {
			await checkIfWalletIsConnected();
		};
		window.addEventListener("load", onLoad);
		return () => window.removeEventListener("load", onLoad);
	}, []);

	return (
		<div className="App">
			<div className="container">
				<div className="header-container">
					<p className="header">🖼 GIF Portal</p>
					<p className="sub-text">
						View your GIF collection in the metaverse ✨
					</p>
					{!walletAddress && renderNotConnectedContainer()}
					{walletAddress && renderConnectedContainer()}
				</div>
				<div className="footer-container">
					<img
						alt="Twitter Logo"
						className="twitter-logo"
						src={twitterLogo}
					/>
					<a
						className="footer-text"
						href={TWITTER_LINK}
						target="_blank"
						rel="noreferrer">{`built on @${TWITTER_HANDLE}`}</a>
				</div>
			</div>
		</div>
	);
};

export default App;
