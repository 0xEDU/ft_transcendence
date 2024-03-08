from soninha.models import User
from django.db import models

class UserStats(models.Model):
    """Model to store user statistics."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="statistics")
    total_hours_played = models.FloatField(default=0)
    coop_cumulative_ball_distance = models.FloatField(default=0)
    classic_cumulative_ball_distance = models.FloatField(default=0)
    coop_hits_record = models.IntegerField(default=0)
    classic_victories = models.FloatField(default=0)
    coop_companions = models.ManyToManyField(User, related_name='companions')
    classic_oponents = models.ManyToManyField(User, related_name='opponents')

    def __str__(self):
        opponents = ', '.join([opponent.login_intra for opponent in self.classic_oponents.all()])
        companions = ', '.join([opponent.login_intra for opponent in self.coop_companions.all()])
        return f">> Statistics for {self.user.login_intra}:\n" \
               f"    - Total hours played: {self.total_hours_played}\n" \
               f"    - Co-op cumulative ball distance: {self.coop_cumulative_ball_distance}\n" \
               f"    - Classic cumulative ball distance: {self.classic_cumulative_ball_distance}\n" \
               f"    - Co-op hits record: {self.coop_hits_record}\n" \
               f"    - Classic victories: {self.classic_victories}\n" \
               f"    - Companions met: {companions}\n" \
               f"    - Opponents played against: {opponents}\n"
