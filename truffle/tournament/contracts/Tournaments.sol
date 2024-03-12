// SPDX-License-Identifier: MIT
// compiler version must be greater than or equal to 0.8.23 and less than 0.9.0
pragma solidity ^0.8.21;

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
    function getTournaments() public view returns (Tournament[] memory) {
        return tournaments;
    }
}
