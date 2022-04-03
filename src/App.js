import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";
import { useEffect, useState } from "react";
// !!!Whenever you re-deploy, you need to update the IDL file on your web app

import idl from "./idl.json";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Program, Provider, web3 } from "@project-serum/anchor";
import kp from "./keypair.json";

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram, Keypair } = web3;

// Create a keypair for the account that will hold the GIF data.
// creates new keypair every time so won t persist. solved by createkeypair.js
// let baseAccount = Keypair.generate();

const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);
// That's it. Now, we have a permanent keypair!

// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl("devnet");

// Controls how we want to acknowledge when a transaction is "done".
// This preflightCommitment: "processed" thing is interesting. You can read on it a little here. Basically, we can actually choose when to receive a confirmation for when our transaction has succeeded. Because the blockchain is fully decentralized, we can choose how long we want to wait for a transaction. Do we want to wait for just one node to acknowledge our transaction? Do we want to wait for the whole Solana chain to acknowledge our transaction?
// In this case, we simply wait for our transaction to be confirmed by the node we're connected to. This is generally okay — but if you wanna be super super sure you may use something like "finalized" instead. For now, let's roll with "processed".
const opts = {
	preflightCommitment: "processed"
};

const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
	const TEST_GIFS = [
		"https://i.giphy.com/media/eIG0HfouRQJQr1wBzz/giphy.webp",
		"https://media3.giphy.com/media/L71a8LW2UrKwPaWNYM/giphy.gif?cid=ecf05e47rr9qizx2msjucl1xyvuu47d7kf25tqt2lvo024uo&rid=giphy.gif&ct=g",
		"https://media4.giphy.com/media/AeFmQjHMtEySooOc8K/giphy.gif?cid=ecf05e47qdzhdma2y3ugn32lkgi972z9mpfzocjj6z1ro4ec&rid=giphy.gif&ct=g",
		"https://i.giphy.com/media/PAqjdPkJLDsmBRSYUp/giphy.webp"
	];
	// State
	const [walletAddress, setWalletAddress] = useState(null);
	const [inputValue, setInputValue] = useState("");
	const [gifList, setGifList] = useState([]);

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
	const onInputChange = (e) => {
		const { value } = e.target;
		setInputValue(value);
	};

	const getProvider = () => {
		const connection = new Connection(network, opts.preflightCommitment);
		//provider which is an authenticated connection to Solana.
		const provider = new Provider(
			connection,
			window.solana,
			opts.preflightCommitment
		);
		return provider;
	};

	const createGifAccount = async () => {
		try {
			const provider = getProvider();
			const program = new Program(idl, programID, provider);
			console.log("ping");
			await program.rpc.startStuffOff({
				accounts: {
					baseAccount: baseAccount.publicKey,
					user: provider.wallet.publicKey,
					systemProgram: SystemProgram.programId
				},
				signers: [baseAccount]
			});
			console.log(
				"created a new baseaccount with address :",
				baseAccount.publicKey.toString()
			);
			await getGifList();
		} catch (error) {
			console.log("error creating baseaccount account:", error);
		}
	};

	const sendGif = async () => {
		if (inputValue.length === 0) {
			console.log("no gif link given");
			return;
		}
		setInputValue("");
		console.log("gif link", inputValue);

		try {
			const provider = getProvider();
			const program = new Program(idl, programID, provider);

			await program.rpc.addGif(inputValue, {
				accounts: {
					baseAccount: baseAccount.publicKey,
					user: provider.wallet.publicKey
				}
			});
			console.log("gif successfully sent to program", inputValue);
			await getGifList();
		} catch (error) {
			console.log("error sending gif", error);
		}

		// if (inputValue.length > 0) {
		// 	console.log("gif link", inputValue);
		// 	setGifList([...gifList, inputValue]);
		// 	setInputValue("");
		// } else {
		// 	console.log("empty inpyt try again");
		// }
	};

	const renderNotConnectedContainer = () => (
		<button
			className="cta-button connect-wallet-button"
			onClick={connectWallet}>
			Connect to Wallet
		</button>
	);

	const renderConnectedContainer = () => {
		// If we hit this, it means the program account hasn't been initialized.
		if (gifList === null) {
			return (
				<div className="connected-container">
					<button
						className="cta-button submit-gif-button"
						onClick={createGifAccount}>
						Do One-Time Initilization For GIF Program Account
					</button>
				</div>
			);
			// Otherwise, we're good! Account exists. User can submit GIFs.
		} else {
			return (
				<div className="connected-container">
					{/* upload your own gifs */}
					<form
						onSubmit={(event) => {
							event.preventDefault();
							sendGif();
						}}>
						<input
							type="text"
							placeholder="Enter gif link"
							value={inputValue}
							onChange={onInputChange}
						/>
						<button
							type="submit"
							className="cta-button submit-gif-button">
							Submit
						</button>
					</form>
					{/* render gifs */}
					<div className="gif-grid">
						{gifList.map((item, index) => (
							<div className="gif-item" key={index}>
								<img src={item.gifLink} />
							</div>
						))}
					</div>
				</div>
			);
		}
	};

	const getGifList = async () => {
		try {
			const provider = getProvider();
			const program = new Program(idl, programID, provider);
			const account = await program.account.baseAccount.fetch(
				baseAccount.publicKey
			);
			console.log("got account ", account);
			setGifList(account.gifList);
		} catch (error) {
			console.log("error in getgiflist ", error);
			setGifList(null);
		}
	};

	// useEffects
	useEffect(() => {
		const onLoad = async () => {
			await checkIfWalletIsConnected();
		};
		window.addEventListener("load", onLoad);
		return () => window.removeEventListener("load", onLoad);
	}, []);

	useEffect(() => {
		if (walletAddress) {
			console.log("Fetching GIF list...");

			// Call Solana program here.
			getGifList();
		}
	}, [walletAddress]);

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
