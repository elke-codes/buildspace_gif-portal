// All this script does is it will write a key pair directly to our file system, that way anytime people come to our web app they'll all load the same key pair.
// It's important to understand you aren't deleting accounts if you run createKeyPair.js again. You're simply create a new account for your program to point to.

const fs = require("fs");
const anchor = require("@project-serum/anchor");

const account = anchor.web3.Keypair.generate();

fs.writeFileSync("./keypair.json", JSON.stringify(account));
