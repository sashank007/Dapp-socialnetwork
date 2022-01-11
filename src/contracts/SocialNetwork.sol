pragma solidity ^0.5.0;

contract SocialNetwork {

    string public name;
    uint public postCount = 0;

    mapping(uint => Post) public posts; //hashmap maps uint id to the post

    struct Post {
        uint id;
        string content;
        uint tipAmount;
        address payable author;
    }
  
    event PostCreated(
           uint id,
           string content,
           uint tipAmount,
           address payable author
       );

    event PostTipped(
           uint id,
           string content,
           uint tipAmount,
           address payable author
       );

    event PostBought(
           uint id,
           string content,
           uint tipAmount,
           address payable author
       );

    constructor() public {
        name = "Sas Social Network";
    }

    function createPost(string memory _content) public {

        //require checks for true or false
        //if true -> then will do , if not notihing will be done
        //gas gets refunded
        require(bytes(_content).length > 0);
        postCount += 1;
        uint _id = postCount;

       //msg -> global var which is the user using this contract
      
       posts[_id] =  Post(_id, _content, 0, msg.sender);

       //trigger event
       emit PostCreated(_id, _content, 0, msg.sender);
    }

    //once you click on buy, the post ownership will be transferred to msg.sender and author will get payed
    function buyPost(uint _id) public payable {

     //save in memory the post
     Post memory _post = posts[_id];
     //amount to be payed
     address payable _author = _post.author;
     //pay to author of post
     address(_author).transfer(msg.value);
     //make new owner as msg.sender
     _post.author = msg.sender;

     posts[_id] = _post;

     emit PostBought(_id, _post.content, _post.tipAmount, _post.author);
    }

    function tipPost(uint _id) public payable {

        Post memory _post = posts[_id]; //creates copy of post

        address payable _author = _post.author;

        address(_author).transfer(msg.value); //transferring to this wallet Ether
        _post.tipAmount = _post.tipAmount + msg.value; 

        posts[_id] = _post;

        emit PostTipped(_id, _post.content, _post.tipAmount, _post.author);
    }
}
