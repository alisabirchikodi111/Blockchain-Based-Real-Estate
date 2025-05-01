import { useState } from 'react';
import { ethers } from 'ethers';
import logo from '../assets/logo.svg';
import { FaBars } from 'react-icons/fa';

const Navigation = ({ account, setAccount, setContent }) => {
  const [isOpen, setIsOpen] = useState(false);

  const connectHandler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = ethers.utils.getAddress(accounts[0]);
    setAccount(account);
  };

  // Update navigation to use setContent (no new tab opening)
  const handleNavigation = (content) => {
    setContent(content);
    setIsOpen(false);
  };

  return (
    <div>
      <button className="sidebar__toggle" onClick={() => setIsOpen(!isOpen)}>
        <FaBars />
      </button>

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar__brand">
          <img src={logo} alt="Logo" />
          <h1>Real Estate</h1>
        </div>

        <ul className="sidebar__links">
          <li onClick={() => handleNavigation('buy')}>Buy</li>
          <li onClick={() => handleNavigation('sell')}>Sell</li>
          <li onClick={() => handleNavigation('inspect')}>Inspect</li>
          <li onClick={() => handleNavigation('lend')}>Lend</li>
          <li onClick={() => handleNavigation('admin')}>Admin</li>
        </ul>

        {account ? (
          <button className="sidebar__connect">
            {account.slice(0, 6) + '...' + account.slice(38, 42)}
          </button>
        ) : (
          <button className="sidebar__connect" onClick={connectHandler}>
            Connect Wallet
          </button>
        )}
      </aside>
    </div>
  );
};

export default Navigation;
