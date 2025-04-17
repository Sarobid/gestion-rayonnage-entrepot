from django.db import models

class Rack(models.Model):
    num_rack                = models.CharField(primary_key=True,default="",max_length=4)
    num_couloir             = models.ForeignKey('Couloir',on_delete=models.CASCADE,default="")
    num_rack_dans_couloir   = models.IntegerField(null=False,blank=False,default=0)
    nb_rangee               = models.IntegerField(null=False,blank=False,default=1)
    nb_niveau               = models.IntegerField(null=False,blank=False,default=1)
    charge_max              = models.FloatField(default=0.0)
    hauteur_case            = models.FloatField(default=0.0)
    largeur_case            = models.FloatField(default=0.0)
    profondeur_case         = models.FloatField(default=0.0)
    
    #Champs calculés
    charge_max_case         = models.FloatField(default=0.0)
    nb_cases                = models.IntegerField(null=False,blank=False,default=0)
    volume_case             = models.FloatField(default=0.0)

    def calcul_nb_case(self):
        self.nb_cases =  round((self.nb_niveau * self.nb_rangee),2)

    def calcul_capacite_case(self):
        self.volume_case = round((self.hauteur_case * self.largeur_case * self.profondeur_case),2)

    def calcul_charge_max_case(self):
        self.charge_max_case = round((self.charge_max / self.nb_cases),2)
