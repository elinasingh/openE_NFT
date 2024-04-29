import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { Principal } from "@dfinity/principal";
import Button from "./Button";
import { openE_backend } from "../../../declarations/openE_backend";

function Item(props) {

  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [image, setImage] = useState();
  const [button, setButton] = useState();
  const [priceInput, setPriceInput] = useState();
  const [loaderHidden, setLoaderHidden] = useState(true);
  const [blur, setBlur] = useState();

  const id = props.id;

  const localHost = "http://127.0.0.1:4943/?canisterId=be2us-64aaa-aaaaa-qaabq-cai";
  const agent = new HttpAgent({host: localHost}) ;
  //TODO: When Deploy Live, remove the following line
  agent.fetchRootKey();
  let NFTActor;

  async function loadNFT() {
    NFTActor = await Actor.createActor(idlFactory, {
      agent,
      canisterId: id,
    });

    const name= await NFTActor.getName();
    const owner= await NFTActor.getOwner();
    const imageData= await NFTActor.getAsset();
    const imageContent=  new Uint8Array(imageData);
    const image= URL.createObjectURL(
      new Blob([imageContent.buffer], {type: "image/png" })
    );

    setName(name);
    setOwner(owner.toText());
    setImage(image);

    setButton(<Button handleClick={handleSell} text={"Sell"}/>);
  }

  useEffect(() => {
    loadNFT();
  }, []);

  let price;
  function handleSell() {
    console.log("Sell Clicked");
    setPriceInput(<input
      placeholder="Price in DANG"
      type="number"
      className="price-input"
      value={price}
      onChange={(e) => price=e.target.value}
    />
  );
  setButton(<Button handleClick={sellItem} text={"Confirm"}/>);

  }

  async function sellItem() {
    setBlur({filter: "blur(4px)"});
    setLoaderHidden(false);
    console.log("Set price = " + price);
    const listingResult = await openE_backend.listItem(props.id, Number(price));
    console.log("listing: " + listingResult);
    if(listingResult == "Success") {
      const openEId = await openE_backend.getOpenECanisterID();
      const transferResult =  await NFTActor.transferOwnership(openEId);
      console.log("transfer: " + transferResult);
      if(transferResult == "Success") {
        setLoaderHidden(true);
        setButton();
        setPriceInput();
        setOwner("openE");
      }
    }
  }

  return (
    <div className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
          style={blur}
        />
        <div className="lds-ellipsis" hidden={loaderHidden}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="disCardContent-root">
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
          {name}<span className="purple-text"></span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
          {priceInput}
          {button}
        </div>
      </div>
    </div>
  );
}

export default Item;
