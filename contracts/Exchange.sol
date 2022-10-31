//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
	address public feeAccount;
	uint256 public feePercent;
	mapping(address => mapping(address => uint256)) public tokens;

	event Deposit(
		address token,
		address user,
		uint256 amount,
		uint256 balance
	); 

	event Withdraw(
		address token,
		address user,
		uint256 amount,
		uint256 balance
	);


	constructor(address _feeAccount, uint256 _feePercent){
		feeAccount = _feeAccount;
		feePercent = _feePercent;
	}

	function depositToken(address _token, uint256 _amount) public {
		//Transfer Tokens to exchange
		require(Token(_token).transferFrom(msg.sender, address(this), _amount));
		//Update Balance
		tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;
		//Emit Event
		emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
	}

	function withdrawTokens(address _token, uint256 _amount) public {
		require(_amount <= tokens[_token][msg.sender], "not enough tokens");

		tokens[_token][msg.sender] = tokens[_token][msg.sender] - _amount;

		Token(_token).transfer(msg.sender, _amount);

		//emit
		emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);

	}

	function balanceOf(address _token, address _user)
		public
		view
		returns (uint256) 
		{
			return tokens[_token][_user];
		}

}