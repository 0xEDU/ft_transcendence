"""Views for the blockchain app."""
from dataclasses import dataclass, asdict
import json
from soninha.models import User
import os
from django.http import HttpResponse, JsonResponse
from django.views import View
from web3 import Web3

from core import settings

# Sample object
# tournament_obj = {
#     "tournamentId": 0,
#     "players": ["Player1", "Player2"],
#     "matches": [
#         {"id": 1, "playerIds": [1, 2], "score": [0, 0], "date": 1638316800},
#         {"id": 2, "playerIds": [3, 4], "score": [0, 0], "date": 1638403200}
#     ]
# }

@dataclass
class Match:
    id: int
    playerIds: list[int]
    score: list[int]
    date: int

@dataclass
class Tournament:
    players: list[str]
    matches: list[Match]
    tournamentId: int


class TournamentView(View):
    """View for adding tournament to blockchain."""

    w3 = Web3(Web3.HTTPProvider('http://0.0.0.0:8545'))
    tournament_count = 0

    def _get_contract(self):
        """Get contract from json file and return contract object"""

        contract_file_path = os.path.join(
            settings.BASE_DIR, "truffle/tournament/build/contracts/Tournaments.json")
        with open(contract_file_path, encoding='utf-8') as deploy_file:
            contract_json = json.load(deploy_file)
            contract_abi = contract_json["abi"]
            for network in contract_json["networks"]:
                contract_address = contract_json["networks"][network]["address"]
            contract = self.w3.eth.contract(
                address=contract_address, abi=contract_abi)
            return contract

    def _get_tournaments(self):
        contract = self._get_contract()
        raw_response = contract.functions.getTournaments().call()
        raw_tournaments, tournament_hash = raw_response[0], raw_response[1]
        tournaments = []
        for tournament in raw_tournaments:
            matches = list(map(lambda match: Match(*match), tournament[1]))
            tournaments.append(asdict(Tournament(tournament[0], matches, tournament[2])))
        return tournaments, tournament_hash

    def _add_tournament(self, tournament):
        """Add tournament to blockchain"""

        contract = self._get_contract()
        sender_address = self.w3.eth.accounts[0]
        tx_hash = contract.functions.addTournament(
            tournament).transact({'from': sender_address})
        self.w3.eth.wait_for_transaction_receipt(tx_hash)

    def post(self, request, *args, **kwargs):
        """Add tournament to blockchain."""

        json_string = request.body.decode('utf-8').split("&")[0]
        json_string = json_string.strip("b'\"").replace("\\", "")
        tournament_dict = json.loads(json_string)
        winner = tournament_dict["winner"]
        tournament_dict["players"].remove(winner)
        tournament_dict["players"].insert(0, winner)
        for pong_match in tournament_dict["matches"]:
            player_ids = []
            for player in pong_match["players"]:
                user = User.objects.get(login_intra=player)
                player_ids.append(user.id)
            pong_match["playerIds"] = player_ids
            del pong_match["players"]
        if "tournamentId" not in request.session.keys():
            request.session["tournamentId"] = 0
        tournament_dict["tournamentId"] = request.session["tournamentId"]
        request.session["tournamentId"] += 1
        self._add_tournament(tournament_dict)
        return HttpResponse('')
