import json
from web3 import Web3

w3 = ""
contract = ""


def connect_to_network():
    w3 = Web3(Web3.HTTPProvider('http://0.0.0.0:8545'))


def initialize_smart_contract():
    contract_file_path = "/home/user42/Documents/ft_transcendence/blockchain/tournament/build/contracts/Counter.json"
    contract_abi = ""
    contract_address = ""
    with open(contract_file_path, "r") as contract_file:
        contract_data = json.load(contract_file)
        contract_abi = contract_data["abi"]
        contract_address = contract_data["networks"]["development"]["address"]



connect_to_network()
initialize_smart_contract()