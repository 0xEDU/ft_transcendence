# Generated by Django 4.2.7 on 2024-03-09 18:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('soninha', '0004_achievements'),
        ('pong', '0002_score_vs_id'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='score',
            name='vs_id',
        ),
        migrations.AddField(
            model_name='score',
            name='vs_id',
            field=models.ManyToManyField(related_name='games_with', to='soninha.user'),
        ),
    ]
