from django.db import models

class Achat(models.Model):
    ref_interne = models.ForeignKey('Article',null=False,on_delete=models.DO_NOTHING,blank=False)
    quantite = models.IntegerField(null=False,blank=False)
    date_achat = models.DateField(auto_now=False, auto_now_add=False)