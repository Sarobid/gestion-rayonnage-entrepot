from django.db import models

class SKU(models.Model):
    code_barre_produit    = models.CharField(primary_key=True, max_length=13, null=False,blank=False)
    article_correspondant = models.ForeignKey('Article',null=True,default="", on_delete=models.SET_NULL)
    num_emplacement       = models.ForeignKey('Emplacement', null=True,blank=True, default="",on_delete=models.SET_NULL)
    date_arrivage         = models.DateField(auto_now_add=True, null=False)
    