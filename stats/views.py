"""Views for the stats app."""
from django.views.generic import TemplateView

from pong.models import Score

COOP_COLORS = {
    "none": "#000000",
    "low": "#ffe988",
    "medium": "#ffde4f",
    "high": "#facb03",
}


class MatchesHistoryTemplateView(TemplateView):
    """Returns the matches history template."""

    template_name = "stats/components/matches-history.html"

    def get_latest_scores(self):
        """Returns the latest scores as a list."""

        current_user_id = self.request.session["user_id"]
        scores = Score.objects.filter(player_id=current_user_id).order_by("match__match_date")
        return scores

    def get_context_data(self, **kwargs):
        """Returns the context data."""
        def calculate_color(score):
            if score <= 0:
                return COOP_COLORS["none"]
            elif score <= 5:
                return COOP_COLORS["low"]
            elif score <= 10:
                return COOP_COLORS["medium"]
            else:
                return COOP_COLORS["high"]

        context = super().get_context_data(**kwargs)
        context["cells"] = map(lambda score: {
            "match_date": score.match.match_date,
            "score": score.score,
            "color": COOP_COLORS[calculate_color(score.score)],
        }, self.get_latest_scores())
        context["table_rows_count"] = range(4)
        context["table_columns_count"] = range(15)
        context["table_last_column_count"] = range(13)
        context["color"] = "background-color:red"
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
