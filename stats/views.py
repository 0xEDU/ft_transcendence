"""Views for the stats app."""
from typing import List
from django.views.generic import TemplateView
from blockchain.views import TournamentView
from soninha.models import User
from pong.models import Score
from dataclasses import dataclass

# Constants
ROWS_SIZE = 15
TOTAL_NUM_OF_CELLS = 88
COOP_COLORS = {
    "none": "var(--HEAVY_GRAY)",
    "low": "#ffe988",
    "medium": "#ffde4f",
    "high": "#facb03",
}
VERSUS_COLORS = {
    "none": "var(--HEAVY_GRAY)",
    "win": "#00ff00",
    "loss": "#ff0000",
}


# Dataclasses
@dataclass
class CoopCellObject:
    """Dataclass for the cell object."""

    match_date: str = "No match"
    score: int = 0
    color: str = f"background-color:{COOP_COLORS['none']}"


@dataclass
class VersusCellObject:
    """Dataclass for the cell object."""

    match_date: str = "No match"
    color: str = f"background-color:{VERSUS_COLORS['none']}"


@dataclass
class MatchRowObject:
    """Dataclass for the match object."""

    description: str
    score: str
    match_hour: str
    match_date: str

@dataclass
class TournamentObject:
    """Dataclasse for the tournament object"""

    name: str
    id: str
    date: str
    winner_img: str
    runner_up_img: str
    third_place_img: str

# Views
class MatchesHistoryTemplateView(TemplateView):
    """Returns the matches history template."""

    template_name = "stats/components/matches-history.html"

    def _get_latest_coop_scores(self):
        """Returns the latest scores as a list."""

        def __calculate_color(score):
            if score <= 0:
                return COOP_COLORS["none"]
            elif score <= 5:
                return COOP_COLORS["low"]
            elif score <= 10:
                return COOP_COLORS["medium"]
            else:
                return COOP_COLORS["high"]

        current_user_id = self.request.session["user_id"]
        scores = (Score.objects.filter(player_id=current_user_id).order_by("match__match_date")
                  .exclude(match__type="versus"))
        scores = list(map(lambda score: CoopCellObject(
            match_date=score.match.match_date.strftime("%d-%m-%Y %H:%M") + f"\nScore: {score.score}",
            score=score.score,
            color=f"background-color:{__calculate_color(score.score)}"
        ), scores))
        scores = scores + [CoopCellObject()] * (TOTAL_NUM_OF_CELLS - len(scores))
        scores = [scores[i:i + ROWS_SIZE] for i in range(0, len(scores), ROWS_SIZE)]
        return scores

    def _get_latest_versus_scores(self):
        """Returns the latest scores as a list."""

        def __calculate_color(score):
            if score == 0:
                return VERSUS_COLORS["none"]
            elif score == 5:
                return VERSUS_COLORS["win"]
            else:
                return VERSUS_COLORS["loss"]

        current_user_id = self.request.session["user_id"]
        scores = (Score.objects.filter(player_id=current_user_id).order_by("match__match_date")
                  .exclude(match__type="coop"))
        scores = list(map(lambda score: VersusCellObject(
            match_date=score.match.match_date.strftime("%d-%m-%Y %H:%M"),
            color=f"background-color:{__calculate_color(score.score)}"
        ), scores))
        scores = scores + [VersusCellObject()] * (TOTAL_NUM_OF_CELLS - len(scores))
        scores = [scores[i:i + ROWS_SIZE] for i in range(0, len(scores), ROWS_SIZE)]
        return scores

    def _get_latest_matches(self):
        """Returns the latest matches as a list."""

        def __get_match_description(match, player1_score, player2_name) -> str:
            if match.type == "coop":
                return f"🤝 joined forces with {player2_name}"
            if match.type == "versus" and player1_score == 5:
                return f"🥇 won against {player2_name}"
            if match.type == "versus":
                return f"🥈 lost to {player2_name}"
            return ""

        def __format_match_row_object(match, player1_score, player2_score, player2_name) -> MatchRowObject:
            match_hour = match.match_date.strftime("%H:%M")
            match_date = match.match_date.strftime("%d/%m/%y")
            score_str = f"{player1_score} x {player2_score}"
            return MatchRowObject(__get_match_description(match, player1_score, player2_name), score_str, match_hour,
                                  match_date)

        current_user_id = self.request.session["user_id"]
        player1_scores = Score.objects.filter(player_id=current_user_id).order_by("match__match_date")
        player2_scores = (Score.objects.filter(match__in=player1_scores.values("match_id"))
                          .exclude(player_id=current_user_id))
        player1_scores_dict = {score.match_id: score for score in player1_scores}
        match_row_objects: List[MatchRowObject] = [
            __format_match_row_object(score.match, player1_scores_dict[score.match_id].score, score.score,
                                      score.player.display_name)
            for score in player2_scores if score.match_id in player1_scores_dict
        ]
        return match_row_objects

    def get_context_data(self, **kwargs):
        """Returns the context data."""

        context = super().get_context_data(**kwargs)
        if "user_id" not in self.request.session.keys() or self.request.session["user_id"] == '':
            return context
        context["coop_cell_rows"] = self._get_latest_coop_scores()
        context["versus_cell_rows"] = self._get_latest_versus_scores()
        context["match_rows"] = self._get_latest_matches()
        return context


class TournamentsTemplateView(TemplateView):
    """Returns the tournaments template."""

    template_name = "stats/components/tournaments.html"

    def _get_player_tournaments(self, player, tournaments):
        return list(filter(lambda tournament: player in tournament['players'], tournaments))

    def _serialize_player_tournaments(self, player_tournaments):
        tournaments_data = []
        for tournament in player_tournaments:
            pass


    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        tournaments = TournamentView()._get_tournaments()
        user = User.objects.get(pk=self.request.session["user_id"])
        player_tournaments = self._get_player_tournaments(user.login_intra, tournaments)
        tournaments_data = self._serialize_player_tournaments(player_tournaments)
        player_tournaments = [TournamentObject("Tournament 3", "0x424242", "2021-03-13", "https://dummyimage.com/84x84/000/ffffff", "https://dummyimage.com/84x84/000/ffffff", "https://dummyimage.com/84x84/000/ffffff")]
        context['tournaments_data'] = player_tournaments
        return context


class UserStatsTemplateView(TemplateView):
    """Returns the user stats template."""

    template_name = "stats/components/user-stats.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context
