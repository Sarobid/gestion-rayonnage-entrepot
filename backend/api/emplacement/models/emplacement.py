from django.db import models
import qrcode
from io import BytesIO

class Emplacement(models.Model):
    num_emplacement = models.CharField(primary_key=True,default="",max_length=6)
    num_rack        = models.ForeignKey('Rack', on_delete=models.CASCADE,null=False,default="")
    num_niveau      = models.IntegerField(null=False, blank=False)
    num_rangee      = models.CharField(null=False, blank=False,max_length=1)
    quantite        = models.IntegerField(null=False, blank=False,default=0)
    qrcode          = models.BinaryField(null=True, default=None)
    volume_occupe   = models.FloatField(default=0.0)
    volume_libre    = models.FloatField(default=0.0)
    charge_occupee  = models.FloatField(default=0.0)
    charge_libre    = models.FloatField(default=0.0)

    def generate_qr(self):
        qr = qrcode.QRCode(version=3, box_size=10, border=5)
        qr.add_data(self.num_emplacement)
        qr.make(fit=True)
        img = qr.make_image(fill='#636363', back_color='transparent')
        img_byte_arr = BytesIO()
        img.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        self.qrcode = img_byte_arr.read()

    def setVolumeLibre(self):
        self.volume_libre = self.num_rack.volume_case

    def setChargeLibre(self):
        self.charge_libre = self.num_rack.charge_max_case

    def update_quantite(self,quantite):
            self.quantite = self.quantite + quantite

    def calcul_capacite_libre(self):
        if self.volume_occupe == None:
            self.volume_occupe = 0
        self.volume_libre = self.num_rack.volume_case - self.volume_occupe

        if self.volume_libre < 0:
            raise ValueError("La capacité dépasse la capacié maximale de la case")


    def calcul_charge_libre(self):
        if self.charge_occupee == None:
            self.charge_occupee = 0
        self.charge_libre = self.num_rack.charge_max_case - self.charge_occupee

        if self.charge_libre < 0:
            raise ValueError("Le poids excède la charge maximale supportée par la case")


    def calcul_quantite(self):
        self.quantite = self.sku_set.count()
