"""Views for the stats app."""
from django.views.generic import TemplateView


class MatchesHistoryTemplateView(TemplateView):
    """Returns the matches history template."""

    template_name = "stats/components/matches-history.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context


class TournamentsTemplateView(TemplateView):
    """Returns the tournaments template."""

    template_name = "stats/components/tournaments.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context
