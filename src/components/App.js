import React, { Component, useState } from "react";
import logo from "../logo.png";
import SocialNetwork from "../abis/SocialNetwork.json"; //smart contract
import "./App.css";
import Web3 from "web3";

// Address :  ("0xdac30a4dA00d5D4254b55Ece4B3564Fe170Fc53d");
class App extends Component {
  async componentWillMount() {
    this.setState({ isLoading: true });
    await this.loadWeb3();
    await this.loadBlockchainData();
    await this.getAllPosts();
    this.setState({ isLoading: false });
  }

  constructor(props) {
    super(props);
    // this.buyAmountInput = React.createRef();
    this.state = {
      account: "",
      socialNetwork: null,
      posts: [],
      isLoading: false,
    };
  }
  //takes connection from metamask and wires to web3
  //can fetch account information from wallet with web3
  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    }

    // Legacy dapp browsers...
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    }
    // Non-dapp browsers...
    else {
      alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;

    const accounts = await web3.eth.getAccounts();

    console.log("web 3 accounts : ", accounts);
    this.setState({ account: accounts[0] });

    //fetch networks
    //address
    //abi
    const networkId = await web3.eth.net.getId();

    const networkData = SocialNetwork.networks[networkId];
    if (networkData) {
      console.log("network id : ", networkId);

      //to retrieve a contract, we need the abi, and the address that the contract is on
      const socialNetwork = web3.eth.Contract(
        SocialNetwork.abi,
        networkData.address
      );

      this.setState({ socialNetwork });

      console.log(socialNetwork);
    } else {
      alert("social network blockchain has not been deployed yet...");
    }
  }

  async getAllPosts() {
    const { socialNetwork } = this.state;
    const postCount = await socialNetwork.methods.postCount().call();

    for (let i = 1; i <= postCount; i++) {
      const post = await socialNetwork.methods.posts(i).call();
      // postsList.push(post);
      console.log("post : ", post);

      this.setState({ posts: [...this.state.posts, post] });
    }
  }

  renderCards() {
    return this.state.posts.map((post, key) => {
      const weiValue = parseInt(post.tipAmount._hex);
      const etherValue = window.web3.utils.fromWei(String(weiValue), "ether");

      console.log("ether value  :", etherValue);
      return (
        <div class="card">
          {/* <img class="card-img-top" src="..." alt="Card image cap" /> */}
          <div class="card-body" style={{ fontSize: 14 + etherValue * 10 }}>
            <p class="card-text">{post.content}</p>
            <small className="float-left mt-5 text-muted">
              STAKED AMOUNT :{" "}
              {window.web3.utils.fromWei(post.tipAmount.toString(), "Ether")}{" "}
              ETH
            </small>
            <button
              href="#"
              class="btn btn-primary"
              onClick={(e) => {
                let id = post.id;

                let tipAmount = window.web3.utils.toWei("0.1", "Ether");

                this.tipPost(id, tipAmount);
              }}
            >
              STAKE 0.1 ETH
            </button>
            <br />
            <button
              href="#"
              class="btn btn-primary"
              onClick={(e) => {
                let id = post.id;

                let buyAmount = window.web3.utils.toWei("1", "Ether");

                this.buyPost(id, buyAmount);
              }}
            >
              BUY POST FOR 1 ETH
            </button>
            <br />
          </div>
          <div>
            <p>This post is owned by : {post.author}</p>
          </div>
        </div>
      );
    });
  }

  sortPosts() {
    const { posts } = this.state;

    posts.sort((a, b) => b.tipAmount - a.tipAmount);

    this.setState({ posts });
  }

  createPost(content) {
    const { socialNetwork, account } = this.state;

    console.log("content : ", content);
    this.setState({ isLoading: true });
    socialNetwork.methods
      .createPost(content)
      .send({ from: account })
      .once("receipt", (receipt) => {
        this.setState({ isLoading: false });
      });
  }

  tipPost(id, tipAmount) {
    this.setState({ isLoading: true });
    this.state.socialNetwork.methods
      .tipPost(id)
      .send({ from: this.state.account, value: tipAmount })
      .then((data) => {
        console.log("done processing :: ", data);
        this.setState({ isLoading: false });
        this.sortPosts();
      });
  }

  buyPost(id, buyAmount) {
    this.setState({ isLoading: true });
    this.state.socialNetwork.methods
      .buyPost(id)
      .send({ from: this.state.account, value: buyAmount })
      .then((data) => {
        console.log("done buying post :: ", data);
        this.setState({ isLoading: false });
        this.sortPosts();
      });
  }

  renderSubmit() {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const content = this.postContent.value;
          this.createPost(content);
        }}
      >
        <div className="form-group mr-sm-2">
          <input
            id="postContent"
            type="text"
            className="form-control"
            placeholder="What's up?"
            ref={(input) => {
              this.postContent = input;
            }}
            required
          ></input>
        </div>
        <button type="submit" className="btn btn-primary btn-block">
          Share
        </button>
      </form>
    );
  }

  renderBuy() {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const content = this.postAmount.value;
          this.createPost(content);
        }}
      >
        <div className="form-group mr-sm-5">
          <input
            id="postAmount"
            type="text"
            className="form-control"
            placeholder="Amount to buy post?"
            ref={(input) => {
              this.postAmount = input;
            }}
            required
          ></input>
        </div>
        <button type="submit" className="btn btn-primary btn-block">
          Buy
        </button>
      </form>
    );
  }

  render() {
    const { isLoading } = this.state;
    return (
      <div>
        Account being used : {this.state.account}
        <br />
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div>
            {this.renderSubmit()}
            {this.renderCards()}
          </div>
        )}
      </div>
    );
  }
}

export default App;
