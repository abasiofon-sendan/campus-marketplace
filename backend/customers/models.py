from django.db import models
from django.conf import settings
from cloudinary.models import CloudinaryField
from django.core.exceptions import ValidationError

User = settings.AUTH_USER_MODEL


class TopCustomers(models.Model):
    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    total_purchases = models.PositiveBigIntegerField()

    def __str__(self):
        return f"{self.customer} - {self.total_purchases}"
    
class TopVendors(models.Model):
    vendor = models.ForeignKey(User, on_delete=models.CASCADE)
    total_sales = models.PositiveBigIntegerField()

    def __str__(self):
        return f"{self.vendor} - {self.total_sales}"
    

class VendorProfiles(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    followers_count = models.PositiveIntegerField(default=0)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)

    def __str__(self):
        return f"Profile of {self.user.email}"
    

class VendorContents(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='videos')
    video = CloudinaryField('video', null=True, blank=True)
    pictures = CloudinaryField('image', null=True, blank=True)
    caption = models.TextField(null=True, blank=True)
    likes = models.PositiveIntegerField(default=0, blank=True, null=True)
    reviews = models.PositiveIntegerField(default=0, blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if self.video and self.pictures:
            raise ValidationError("You can only upload either a video or pictures, not both.")
        if not self.video and not self.pictures:
            raise ValidationError("You must upload either a video or pictures.")
        
        
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)


    class Meta:
        verbose_name = "User Content"
        verbose_name_plural = "User Contents"
        ordering = ['-uploaded_at']


    def __str__(self):
        return f"Video of {self.user.email} uploaded at {self.uploaded_at}"