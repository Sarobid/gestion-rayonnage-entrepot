from django.db import models


class Article(models.Model):
    ref_interne       = models.CharField(max_length=8, null=False, blank=False, primary_key=True,unique=True)
    designation       = models.TextField(null=False, blank=False)
    prix_article      = models.IntegerField(null=False, blank=False)
    poids_article     = models.FloatField(null=False, blank=False)
    volume_article    = models.FloatField(blank=False, null=False)
    quantite_en_stock = models.IntegerField(null=False, blank=False,default=0)
    quantite_en_rayon = models.IntegerField(default=0)

    def increase_quantite_stock(self,qte):
        self.quantite_en_stock = self.quantite_en_stock + qte

    def increase_quantite_rayon(self,qte):
        self.quantite_en_rayon = self.quantite_en_rayon + qte

    def decrease_quantite_stock(self,qte):
        self.quantite_en_stock = self.quantite_en_stock - qte

    def decrease_quantite_stock(self,qte):
        self.quantite_en_rayon = self.quantite_en_rayon - qte

    def set_quantite(self):
        self.quantite_en_stock = self.sku_set.count()

    def set_quantite_rayon(self):
        # Replace 'field_name' with the actual name of the field you want to check
        self.quantite_en_rayon = self.sku_set.filter(num_emplacement__isnull=False).count()
        self.save()







