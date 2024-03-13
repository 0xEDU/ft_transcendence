// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Tournaments {
    struct Match {
        uint id;
        uint[] playerIds;
        uint[] score;
        uint date;
    }

    struct Tournament {
        string[] players;
        Match[] matches;
        uint tournamentId;
    }

    Tournament[] tournaments;

    // A new Tournament to the list
    function addTournament(Tournament calldata _newTournament) public {
        tournaments.push(_newTournament);
    }

    // Return the Tournament list
    function getTournaments() public view returns (Tournament[] memory, bytes32) {
        return (tournaments, blockhash(block.number - 1));
    }
}
