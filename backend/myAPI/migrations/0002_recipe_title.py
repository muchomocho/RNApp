# Generated by Django 4.0.3 on 2022-03-03 03:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myAPI', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='recipe',
            name='title',
            field=models.CharField(default='title', max_length=100),
            preserve_default=False,
        ),
    ]
