"""Views for the stats app."""
from dataclasses import dataclass
from datetime import datetime
from typing import List

# Our imports
from blockchain.views import TournamentView
from pong.models import Score
from soninha.models import User
from stats.models import UserStats

# Django imports
from django.db.models import Count
from django.utils import timezone
from django.utils.translation import gettext as _
from django.views.generic import TemplateView

# Constants
ROWS_SIZE = 15
TOTAL_NUM_OF_CELLS = 88
COOP_COLORS = {
    "none": "var(--HEAVY_GRAY)",
    "low": "var(--YELLOW_30)",
    "medium": "var(--YELLOW_60)",
    "high": "var(--YELLOW_100)",
}
VERSUS_COLORS = {
    "none": "var(--HEAVY_GRAY)",
    "win": "var(--GREEN)",
    "loss": "var(--RED)",
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
    winner_name: str

# Views
class MatchesHistoryTemplateView(TemplateView):
    """Returns the matches history template."""

    template_name = "stats/components/matches-history.html"

    def _get_latest_coop_scores(self):
        """Returns the latest scores as a list."""

        def __calculate_color(score):
            if score < 0:
                return COOP_COLORS["none"]
            elif score <= 5:
                return COOP_COLORS["low"]
            elif score <= 10:
                return COOP_COLORS["medium"]
            else:
                return COOP_COLORS["high"]

        current_user_id = self.request.session["user_id"]
        scores = (Score.objects.filter(player_id=current_user_id).order_by("match__match_date")
                  .exclude(match__type="classic"))
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
            if score == 3:
                return VERSUS_COLORS["win"]
            else:
                return VERSUS_COLORS["loss"]

        current_user_id = self.request.session["user_id"]
        scores = (Score.objects.filter(player_id=current_user_id).exclude(match__type="co-op")
                  .order_by("match__match_date"))
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
            if match.type == "co-op":
                return _("🤝 joined forces with %(player2_name)s") % {'player2_name': player2_name}
            if match.type == "classic" and player1_score == 3:
                return _("🥇 won against %(player2_name)s") % {'player2_name': player2_name}
            if match.type == "classic" and player1_score in [0, 1, 2]:
                return _("🥈 lost to %(player2_name)s") % {'player2_name': player2_name}

            return ""

        def __format_match_row_object(match, player1_score, player2_score, player2_name) -> MatchRowObject:
            match_datetime_IN_BRAZIL_IDC = timezone.localtime(match.match_date, timezone=timezone.get_fixed_timezone(-3 * 60))
            match_hour = match_datetime_IN_BRAZIL_IDC.strftime("%H:%M")
            match_date = match_datetime_IN_BRAZIL_IDC.strftime("%d/%m/%y")
            if match.type == "co-op":
                score_str = f"{player1_score}"
            if match.type == "classic":
                score_str = f"{player1_score} x {player2_score}"
            return MatchRowObject(__get_match_description(match, player1_score, player2_name), score_str, match_hour,
                                  match_date)

        current_user_id = self.request.session["user_id"]
        player1_scores = Score.objects.filter(player_id=current_user_id).order_by("match__match_date")
        player2_scores = (Score.objects.filter(match__in=player1_scores.values("match_id"))
                          .exclude(player_id=current_user_id)).order_by("match__match_date")
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
        if "user_id" not in self.request.session.keys() or not self.request.session["user_id"]:
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

    def _serialize_player_tournaments(self, player_tournaments, tournament_hash):
        tournaments_data = []
        for tournament in player_tournaments:
            winner_login = tournament['players'][0]
            winner_img = ""
            user = User.objects.get(login_intra=winner_login)
            if user.profile_picture:
                winner_img = user.profile_picture.url
            else:
                winner_img = user.intra_cdn_profile_picture_url
            tournament_obj = TournamentObject(
                tournament['tournamentId'],
                tournament_hash.hex()[:8],
                datetime.fromtimestamp(tournament['matches'][-1]['date'] / 1000).strftime("%d %m %Y %H:%M"),
                winner_img,
                winner_login
            )
            tournaments_data.insert(0, tournament_obj)
        return tournaments_data


    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        tournaments, tournament_hash = TournamentView()._get_tournaments()
        user = User.objects.get(pk=self.request.session["user_id"])
        player_tournaments = self._get_player_tournaments(user.login_intra, tournaments)
        tournaments_data = self._serialize_player_tournaments(player_tournaments, tournament_hash)
        context['tournaments_data'] = tournaments_data
        return context


class UserStatsTemplateView(TemplateView):
    """Returns the user stats template."""

    template_name = "stats/components/user-stats.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        current_user_id = self.request.session["user_id"]
        if "user_id" not in self.request.session.keys() or not self.request.session["user_id"]:
            return context
        userdb = UserStats.objects.get(user=current_user_id)
        if userdb.total_hours_played < 60:
            context["hours_played"] = str(round(userdb.total_hours_played, 2)) + " sec"
        elif userdb.total_hours_played < 3600:
            context["hours_played"] = "{:,.2f}".format(userdb.total_hours_played / 60) + " min"
        else:
            context["hours_played"] = "{:,.2f}".format(userdb.total_hours_played / 3600) + " hours"
        context["high_five"] = userdb.coop_hits_record
        distance = userdb.classic_cumulative_ball_distance + userdb.coop_cumulative_ball_distance
        if distance < 10:
            context["distance"] = "{:,.2f}".format(distance) + " mm"
        elif distance < 1000:
            context["distance"] = "{:,.2f}".format(distance / 10) + " cm"
        elif distance < 1000000:
            context["distance"] = "{:,.2f}".format(distance / 1000) + " m"
        else:
            context["distance"] = "{:,.2f}".format(distance / 1000000) + " km"
        opponents_with_counts = [opponent for opponent in userdb.classic_opponents.all()]
        companions_with_counts = [companion for companion in userdb.coop_companions.all()]
        combined_set = set(opponents_with_counts + companions_with_counts)
        context["companions"] = len(combined_set)
        gameData = Score.objects.filter(player_id=current_user_id)
        vs_id_counts = gameData.values('vs_id').annotate(vs_id_count=Count('vs_id'))
        most_common_vs_id = vs_id_counts.order_by('-vs_id_count').first()
        if most_common_vs_id:
            most_common_vs_id_value = most_common_vs_id['vs_id']
            bffUser_matches = most_common_vs_id['vs_id_count']
            bffUser = User.objects.get(id=most_common_vs_id_value)
            bffUser_id = bffUser.login_intra
            bffProfile = bffUser.profile_picture.url if bffUser.profile_picture else bffUser.intra_cdn_profile_picture_url
            context["bff_matches"] = bffUser_matches
            context["bff_login"] = bffUser_id
            context["user_image"] = bffProfile
            context["bff_image"] = bffUser.profile_picture.url if bffUser.profile_picture else bffUser.intra_cdn_profile_picture_url
        else:
            context["bff_matches"] = 0
        return context
