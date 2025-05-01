import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

import close from '../assets/close.svg';

const Home = ({ home, provider, account, escrow, togglePop }) => {
  const [hasBought, setHasBought] = useState(false);
  const [hasLended, setHasLended] = useState(false);
  const [hasInspected, setHasInspected] = useState(false);
  const [hasSold, setHasSold] = useState(false);

  const [buyer, setBuyer] = useState(null);
  const [lender, setLender] = useState(null);
  const [inspector, setInspector] = useState(null);
  const [seller, setSeller] = useState(null);

  const [owner, setOwner] = useState(null);
  const [showContact, setShowContact] = useState(false);

  const fetchDetails = async () => {
    const buyer = await escrow.buyer(home.id);
    setBuyer(buyer);
    setHasBought(await escrow.approval(home.id, buyer));

    const seller = await escrow.seller();
    setSeller(seller);
    setHasSold(await escrow.approval(home.id, seller));

    const lender = await escrow.lender();
    setLender(lender);
    setHasLended(await escrow.approval(home.id, lender));

    const inspector = await escrow.inspector();
    setInspector(inspector);
    setHasInspected(await escrow.inspectionPassed(home.id));
  };

  const fetchOwner = async () => {
    if (await escrow.isListed(home.id)) return;
    const owner = await escrow.buyer(home.id);
    setOwner(owner);
  };

  const buyHandler = async () => {
    const escrowAmount = await escrow.escrowAmount(home.id);
    const signer = await provider.getSigner();

    let transaction = await escrow.connect(signer).depositEarnest(home.id, { value: escrowAmount });
    await transaction.wait();

    transaction = await escrow.connect(signer).approveSale(home.id);
    await transaction.wait();

    setHasBought(true);
  };

  const inspectHandler = async () => {
    const signer = await provider.getSigner();
    const transaction = await escrow.connect(signer).updateInspectionStatus(home.id, true);
    await transaction.wait();
    setHasInspected(true);
  };

  const lendHandler = async () => {
    const signer = await provider.getSigner();
    await escrow.connect(signer).approveSale(home.id);
    const lendAmount = (await escrow.purchasePrice(home.id)) - (await escrow.escrowAmount(home.id));
    await signer.sendTransaction({ to: escrow.address, value: lendAmount.toString(), gasLimit: 60000 });
    setHasLended(true);
  };

  const sellHandler = async () => {
    const signer = await provider.getSigner();
    await escrow.connect(signer).approveSale(home.id);
    await escrow.connect(signer).finalizeSale(home.id);
    setHasSold(true);
  };

  useEffect(() => {
    fetchDetails();
    fetchOwner();
  }, [hasSold]);

  return (
    <div className="home__overlay" onClick={togglePop}>
      <div className="home__popup" onClick={(e) => e.stopPropagation()}>
        <button className="home__close-btn" onClick={togglePop}>
          <img src={close} alt="Close" />
        </button>

        <div className="home__image">
          <img src={home.image} alt="Home" />
        </div>

        <div className="home__content">
          <h1>{home.name}</h1>
          <p><strong>{home.attributes[2].value}</strong> bds | <strong>{home.attributes[3].value}</strong> ba | <strong>{home.attributes[4].value}</strong> sqft</p>
          <p>{home.address}</p>
          <h2>{home.attributes[0].value} ETH</h2>

          {owner ? (
            <p className="home__owned">Owned by {owner.slice(0, 6) + '...' + owner.slice(38, 42)}</p>
          ) : (
            <>
              {account === inspector ? (
                <button className='home__action' onClick={inspectHandler} disabled={hasInspected}>Approve Inspection</button>
              ) : account === lender ? (
                <button className='home__action' onClick={lendHandler} disabled={hasLended}>Approve & Lend</button>
              ) : account === seller ? (
                <button className='home__action' onClick={sellHandler} disabled={hasSold}>Approve & Sell</button>
              ) : (
                <button className='home__action' onClick={buyHandler} disabled={hasBought}>Buy</button>
              )}

              <button className='home__action home__contact-btn' onClick={() => setShowContact(!showContact)}>
                {showContact ? "Hide Contact" : "Contact Agent"}
              </button>

              {showContact && (
                <div className="home__contact-info">
                  <p><strong>Agent Name:</strong> John Doe</p>
                  <p><strong>Email:</strong> johndoe@example.com</p>
                  <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                </div>
              )}
            </>
          )}

          <hr />
          <h2>Overview</h2>
          <p>{home.description}</p>

          <hr />
          <h2>Facts and features</h2>
          <ul>
            {home.attributes.map((attr, idx) => (
              <li key={idx}><strong>{attr.trait_type}</strong>: {attr.value}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
