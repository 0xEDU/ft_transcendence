// SPDX-License-Identifier: MIT
// compiler version must be greater than or equal to 0.8.23 and less than 0.9.0
pragma solidity ^0.8.21;

contract Counter {
    uint public count;

    // Function to get the current count
    function get() public view returns (uint) {
        return count;
    }

    // Function to decrement count by 1
    function dec() public {
        // This function will fail if count = 0
        count -= 1;
    }
}