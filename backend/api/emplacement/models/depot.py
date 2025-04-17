from django.db import models


class Depot(models.Model):
    num_depot = models.IntegerField(null=False,blank=False, unique=True,default=0)
    nom_depot = models.TextField(default="",max_length=75)
    contenu_depot = models.TextField(default="",max_length=175)
