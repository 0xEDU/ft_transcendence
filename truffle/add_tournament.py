"""Connect to blockchain and add tournament to blockchain using web3.py"""
import json
from web3 import Web3


def get_contract():
    """Get contract from json file and return contract object"""

    contract_file_path = "./tournament/build/contracts/Tournaments.json"
    with open(contract_file_path, encoding='utf-8') as deploy_file:
        contract_json = json.load(deploy_file)
        contract_abi = contract_json["abi"]
        for network in contract_json["networks"]:
            contract_address = contract_json["networks"][network]["address"]
        contract = w3.eth.contract(address=contract_address, abi=contract_abi)
        return contract


def add_tournament(tournament):
    """Add tournament to blockchain"""

    contract = get_contract()
    sender_address = w3.eth.accounts[0]
    tx_hash = contract.functions.addTournament(
        tournament).transact({'from': sender_address})
    w3.eth.wait_for_transaction_receipt(tx_hash)
    print(contract.functions.getTournaments().call())


tournament_obj = {
    "tournamentId": 0,
    "players": ["Player1", "Player2"],
    "matches": [
        {"id": 1, "playerIds": [1, 2], "score": [0, 0], "date": 1638316800},
        {"id": 2, "playerIds": [3, 4], "score": [0, 0], "date": 1638403200}
    ]
}

w3 = Web3(Web3.HTTPProvider('http://0.0.0.0:8545'))
if w3.is_connected() is not False:
    add_tournament(tournament_obj)
