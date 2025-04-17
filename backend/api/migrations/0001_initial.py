# Generated by Django 5.0 on 2025-01-03 15:43

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Article',
            fields=[
                ('ref_interne', models.CharField(max_length=8, primary_key=True, serialize=False, unique=True)),
                ('designation', models.TextField()),
                ('prix_article', models.IntegerField()),
                ('poids_article', models.FloatField()),
                ('volume_article', models.FloatField()),
                ('quantite_en_stock', models.IntegerField(default=0)),
                ('quantite_en_rayon', models.IntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='Depot',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('num_depot', models.IntegerField(default=0, unique=True)),
                ('nom_depot', models.TextField(default='', max_length=75)),
                ('contenu_depot', models.TextField(default='', max_length=175)),
            ],
        ),
        migrations.CreateModel(
            name='Achat',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantite', models.IntegerField()),
                ('date_achat', models.DateField()),
                ('ref_interne', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='api.article')),
            ],
        ),
        migrations.CreateModel(
            name='Couloir',
            fields=[
                ('num_couloir', models.CharField(max_length=3, primary_key=True, serialize=False)),
                ('num_depot', models.CharField(null=True)),
                ('nom_couloir', models.CharField(default='', max_length=2)),
                ('id_depot', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='api.depot')),
            ],
        ),
        migrations.CreateModel(
            name='Rack',
            fields=[
                ('num_rack', models.CharField(default='', max_length=4, primary_key=True, serialize=False)),
                ('num_rack_dans_couloir', models.IntegerField(default=0)),
                ('nb_rangee', models.IntegerField(default=1)),
                ('nb_niveau', models.IntegerField(default=1)),
                ('charge_max', models.FloatField(default=0.0)),
                ('hauteur_case', models.FloatField(default=0.0)),
                ('largeur_case', models.FloatField(default=0.0)),
                ('profondeur_case', models.FloatField(default=0.0)),
                ('charge_max_case', models.FloatField(default=0.0)),
                ('nb_cases', models.IntegerField(default=0)),
                ('volume_case', models.FloatField(default=0.0)),
                ('num_couloir', models.ForeignKey(default='', on_delete=django.db.models.deletion.CASCADE, to='api.couloir')),
            ],
        ),
        migrations.CreateModel(
            name='Emplacement',
            fields=[
                ('num_emplacement', models.CharField(default='', max_length=6, primary_key=True, serialize=False)),
                ('num_niveau', models.IntegerField()),
                ('num_rangee', models.CharField(max_length=1)),
                ('quantite', models.IntegerField(default=0)),
                ('qrcode', models.BinaryField(default=None, null=True)),
                ('volume_occupe', models.FloatField(default=0.0)),
                ('volume_libre', models.FloatField(default=0.0)),
                ('charge_occupee', models.FloatField(default=0.0)),
                ('charge_libre', models.FloatField(default=0.0)),
                ('num_rack', models.ForeignKey(default='', on_delete=django.db.models.deletion.CASCADE, to='api.rack')),
            ],
        ),
        migrations.CreateModel(
            name='SKU',
            fields=[
                ('code_barre_produit', models.CharField(max_length=13, primary_key=True, serialize=False)),
                ('date_arrivage', models.DateField(auto_now_add=True)),
                ('article_correspondant', models.ForeignKey(default='', null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.article')),
                ('num_emplacement', models.ForeignKey(blank=True, default='', null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.emplacement')),
            ],
        ),
    ]
