"""Views for the stats app."""
from django.views.generic import TemplateView
from pong.models import Score
from dataclasses import dataclass

ROWS_SIZE = 15
TOTAL_NUM_OF_CELLS = 88
COOP_COLORS = {
    "none": "#fff",
    "low": "#ffe988",
    "medium": "#ffde4f",
    "high": "#facb03",
}
VERSUS_COLORS = {
    "none": "#fff",
    "win": "#00ff00",
    "loss": "#ff0000",
}


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


class MatchesHistoryTemplateView(TemplateView):
    """Returns the matches history template."""

    template_name = "stats/components/matches-history.html"

    def _get_latest_coop_scores(self):
        """Returns the latest scores as a list."""

        def calculate_color(score):
            if score <= 0:
                return COOP_COLORS["none"]
            elif score <= 5:
                return COOP_COLORS["low"]
            elif score <= 10:
                return COOP_COLORS["medium"]
            else:
                return COOP_COLORS["high"]

        current_user_id = self.request.session["user_id"]
        scores = Score.objects.filter(player_id=current_user_id).order_by("match__match_date")
        scores = list(map(lambda score: CoopCellObject(
            match_date=score.match.match_date.strftime("%d-%m-%Y %H:%M") + f"\nScore: {score.score}",
            score=score.score,
            color=f"background-color:{calculate_color(score.score)}"
        ), scores))
        scores = scores + [CoopCellObject()] * (TOTAL_NUM_OF_CELLS - len(scores))
        scores = [scores[i:i + ROWS_SIZE] for i in range(0, len(scores), ROWS_SIZE)]
        return scores

    def _get_latest_versus_scores(self):
        """Returns the latest scores as a list."""

        def calculate_color(score):
            if score == 0:
                return VERSUS_COLORS["none"]
            elif score == 5:
                return VERSUS_COLORS["win"]
            else:
                return VERSUS_COLORS["loss"]

        current_user_id = self.request.session["user_id"]
        scores = Score.objects.filter(player_id=current_user_id).order_by("match__match_date")
        scores = list(map(lambda score: VersusCellObject(
            match_date=score.match.match_date.strftime("%d-%m-%Y %H:%M"),
            color=f"background-color:{calculate_color(score.score)}"
        ), scores))
        scores = scores + [VersusCellObject()] * (TOTAL_NUM_OF_CELLS - len(scores))
        scores = [scores[i:i + ROWS_SIZE] for i in range(0, len(scores), ROWS_SIZE)]
        return scores

    def get_context_data(self, **kwargs):
        """Returns the context data."""

        context = super().get_context_data(**kwargs)
        context["coop_cell_rows"] = self._get_latest_coop_scores()
        context["versus_cell_rows"] = self._get_latest_versus_scores()
        return context


class TournamentsTemplateView(TemplateView):
    """Returns the tournaments template."""

    template_name = "stats/components/tournaments.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context


class UserStatsTemplateView(TemplateView):
    """Returns the user stats template."""

    template_name = "stats/components/user-stats.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context
