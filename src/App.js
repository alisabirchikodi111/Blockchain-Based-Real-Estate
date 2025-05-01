import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Components
import Navigation from './components/Navigation';
import Search from './components/Search';
import Sell from './components/Sell';
import Inspect from './components/Inspect';
import Lend from './components/Lend';
import Home from './components/Home';
import AdminPanel from './components/AdminPanel';  

// ABIs
import RealEstate from './abis/RealEstate.json';
import Escrow from './abis/Escrow.json';

// Config
import config from './config.json';

function App() {
  const [provider, setProvider] = useState(null);
  const [escrow, setEscrow] = useState(null);
  const [account, setAccount] = useState(null);

  const [homes, setHomes] = useState([]);
  const [selectedHome, setSelectedHome] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // content can be: "buy", "sell", "inspect", "lend", or "admin"
  const [content, setContent] = useState(new URLSearchParams(window.location.search).get('content') || 'buy');

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);

    const network = await provider.getNetwork();

    // Load RealEstate Contract
    const realEstate = new ethers.Contract(
      config[network.chainId].realEstate.address,
      RealEstate,
      provider
    );

    const totalSupply = await realEstate.totalSupply();
    const homesArr = [];

    for (let i = 1; i <= totalSupply; i++) {
      const uri = await realEstate.tokenURI(i);
      const response = await fetch(`${window.location.origin}/metadata/${i}.json`);
      const metadata = await response.json();
      homesArr.push(metadata);
    }

    setHomes(homesArr);

    // Load Escrow Contract
    const escrow = new ethers.Contract(
      config[network.chainId].escrow.address,
      Escrow,
      provider
    );
    setEscrow(escrow);

    // Set Account
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(ethers.utils.getAddress(accounts[0]));

    // Listen for account changes
    window.ethereum.on('accountsChanged', async () => {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(ethers.utils.getAddress(accounts[0]));
    });
  };

  useEffect(() => {
    loadBlockchainData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePop = (home = null) => {
    if (home) {
      setSelectedHome(home);
      setShowPopup(true);
    } else {
      setSelectedHome(null);
      setShowPopup(false);
    }
  };

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} setContent={setContent} />

      <div className="content">
        {content === 'buy' && <Search />}
        {content === 'sell' && <Sell />}
        {content === 'inspect' && <Inspect />}
        {content === 'lend' && <Lend />}
        {content === 'admin' && <AdminPanel />}
        
        {content !== 'admin' && (
          <>
            <h3>
              {content === 'buy' && 'Homes For Sale'}
              {content === 'sell' && 'Sell Your Property'}
              {content === 'inspect' && 'Inspect'}
              {content === 'lend' && 'Lend'}
            </h3>
            <hr />

            <div className="cards__section">
              <div className="cards">
                {homes.map((home, index) => (
                  <div className="card" key={index} onClick={() => togglePop(home)}>
                    <div className="card__image">
                      <img src={home.image} alt="Home" />
                    </div>
                    <div className="card__info">
                      <h4>{home.attributes[0].value} ETH</h4>
                      <p>
                        <strong>{home.attributes[2].value}</strong> bds |
                        <strong>{home.attributes[3].value}</strong> ba |
                        <strong>{home.attributes[4].value}</strong> sqft
                      </p>
                      <p>{home.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {showPopup && selectedHome && (
        <Home
          home={selectedHome}
          provider={provider}
          account={account}
          escrow={escrow}
          togglePop={() => togglePop()}
        />
      )}
    </div>
  );
}

export default App;
