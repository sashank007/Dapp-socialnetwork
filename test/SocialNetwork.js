const { assert } = require("chai");

const SocialNetwork = artifacts.require("../src/contracts/SocialNetwork.sol");

require("chai")
  .use(require("chai-as-promised"))
  .should();

contract("SocialNetwork", ([deployer, author, tipper]) => {
  let socialNetwork;

  before(async () => {
    socialNetwork = await SocialNetwork.deployed();
  });

  describe("deployment", async () => {
    it("deploys successfully...", async () => {
      const address = socialNetwork.address;

      assert.notEqual(address, 0x0);
      assert.notEqual(address, "");
    });

    it("has name...", async () => {
      const name = await socialNetwork.name();

      assert.equal(name, "Sas Social Network");
    });
  });

  describe("posts", async () => {
    let result, postCount, event;

    it("creates posts", async () => {
      //function metadata passed after regular args
      result = await socialNetwork.createPost("First post...", {
        from: author,
      });
      postCount = await socialNetwork.postCount();
      assert.equal(postCount, 1);

      event = result.logs[0].args;
      console.log(event);

      assert.equal(event.id.toNumber(), 1, "id is correct");
      assert.equal(event.author, author, "author is correct");
    });

    it("buy post", async () => {
      let oldAuthorBalance;

      oldAuthorBalance = await web3.eth.getBalance(author);
      oldAuthorBalance = new web3.utils.BN(oldAuthorBalance);

      //function metadata passed after regular args
      result = await socialNetwork.buyPost(postCount, {
        from: tipper,
        value: web3.utils.toWei("1", "Ether"),
      });

      const event = result.logs[0].args;
      console.log("event bought : ", event);

      assert.equal(event.author, tipper, "authors are swapped");

      // let newAuthorBalance, expectedBalance;

      // newAuthorBalance = await web3.eth.getBalance(author);
      // newAuthorBalance = new web3.utils.BN(newAuthorBalance);

      // assert.equal(event.tipAmount, "1000000000000000000", "tip is correct");
      // assert.equal(event.author, author, "author is correct");

      // let tipAmount;

      // tipAmount = web3.utils.toWei("1", "Ether");
      // tipAmount = new web3.utils.BN(tipAmount);

      // expectedBalance = oldAuthorBalance.add(tipAmount);

      // assert.equal(
      //   newAuthorBalance.toString(),
      //   expectedBalance.toString(),
      //   "balances are equal"
      // );
    });

    it("tip post", async () => {
      let oldAuthorBalance;

      oldAuthorBalance = await web3.eth.getBalance(author);
      oldAuthorBalance = new web3.utils.BN(oldAuthorBalance);

      //function metadata passed after regular args
      result = await socialNetwork.tipPost(postCount, {
        from: tipper,
        value: web3.utils.toWei("1", "Ether"),
      });

      const event = result.logs[0].args;
      console.log("event tipped : ", event);

      let newAuthorBalance, expectedBalance;

      newAuthorBalance = await web3.eth.getBalance(author);
      newAuthorBalance = new web3.utils.BN(newAuthorBalance);

      assert.equal(event.tipAmount, "1000000000000000000", "tip is correct");
      assert.equal(event.author, author, "author is correct");

      let tipAmount;

      tipAmount = web3.utils.toWei("1", "Ether");
      tipAmount = new web3.utils.BN(tipAmount);

      expectedBalance = oldAuthorBalance.add(tipAmount);

      assert.equal(
        newAuthorBalance.toString(),
        expectedBalance.toString(),
        "balances are equal"
      );
    });
  });
});
