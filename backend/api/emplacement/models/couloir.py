from django.db import models

class Couloir(models.Model):
    num_couloir = models.CharField(primary_key=True,max_length=3)
    id_depot    = models.ForeignKey('Depot', null=True,blank=False, on_delete=models.CASCADE )
    num_depot   = models.CharField(null=True,blank=False)
    nom_couloir = models.CharField(null=False, blank=False,default="",max_length=2)




